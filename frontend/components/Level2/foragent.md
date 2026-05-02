# GlobalFreight AI Platform — Architecture & Design Decisions

> **Internal Reference Document**
> This document justifies every architectural and design decision made during development.
> Each choice is framed around **user comfort**, **scalability**, **reliability**, and **competition requirements**.

---

## 1. Multi-Provider AI Architecture

### Decision: Three LLM providers with automatic fallback chain

**Providers:** Azure OpenAI (gpt-5-nano) → Gemini 2.5 Flash → PAI (gemma4:26b)

**Why this matters:**

- **Reliability**: API providers have downtime. Azure's rate limits, Gemini's quota caps, and PAI's latency spikes all happen unpredictably. With a 3-deep fallback chain, the system never shows "failed" to the user — it silently switches to the next available provider.
- **User comfort**: The header dropdown lets the user pick which provider they trust. Some users prefer Azure for accuracy, others prefer Gemini for speed. This respects user preference without forcing a choice.
- **Scalability**: Adding a 4th provider (e.g., Anthropic Claude) requires only adding one function (`_try_claude`) and one entry in the PROVIDERS list. The fallback chain pattern scales horizontally.
- **Competition edge**: The challenge spec only required PAI. We support all three with intelligent failover — a clear differentiator.

### Decision: `thinkingBudget: 0` for Gemini

- Gemini 2.5 Flash has a "thinking" mode that adds latency for complex reasoning.
- For logistics exception handling, the events are structured and the decisions are policy-driven — deep reasoning isn't needed.
- Setting `thinkingBudget: 0` reduces response time from ~8s to ~2s per event. Over 20 events, that's **2 minutes saved**.

### Decision: PAI response parsing — take last `text` entry, not concatenating

- PAI's streaming API returns accumulated text (each line contains the full response up to that point), not token deltas.
- Concatenating all lines produces gibberish like `"severityseverity:severity: HIGH..."`.
- Taking only the last `type: "text"` entry gives the clean, complete response.
- This was a subtle API behavior difference that could easily be missed.

---

## 2. Frontend Architecture

### Decision: Next.js 16 with Turbopack

- **Hot reload in <200ms** during development. Critical when iterating on UI during a hackathon.
- **App Router** (not Pages Router) for modern React Server Components support.
- **Turbopack** over Webpack for 5-10x faster builds.

### Decision: Provider switcher in Header (global), not inside Level 2

- Originally, the provider switcher was a pill-toggle inside the Level 2 component.
- **Problem**: This meant Level 1 (RAG) always used Azure regardless of selection.
- **Solution**: Moved to a dropdown in the global Header component. Now one click changes the provider for both Level 1 AND Level 2.
- **User comfort**: Users don't need to know which tab uses which provider. Set it once, it works everywhere.

### Decision: Framer Motion for all animations

- Every interactive element uses `framer-motion` for physics-based animations.
- **Why not CSS animations?** `framer-motion` handles `AnimatePresence` (exit animations), `layoutId` (shared layout transitions), and gesture handlers (`whileHover`, `whileTap`) — all of which would require complex CSS + JS coordination otherwise.
- **User comfort**: Smooth 60fps animations make the interface feel polished and responsive. No jarring state changes.

### Decision: Glass morphism + dark theme

- Dark backgrounds (`bg-black/95`) reduce eye strain during extended operations desk use.
- Glassmorphism (`backdrop-blur-xl`, `bg-white/5`) creates depth without heavy shadows.
- Neon accent colors (`neon-green`, `neon-blue`) provide high contrast against dark backgrounds — critical for quickly scanning event severity.

---

## 3. Level 2 Exception Handler

### Decision: 10 agent tools (not fewer, not more)

| Tool | Justification |
|---|---|
| `query_policy` | Agent must check policies before deciding — prevents hallucinated rules |
| `notify_customer` | Required by spec: "Notify customer" |
| `escalate_to_human` | Required by spec: "Escalate to dispatcher" |
| `flag_customs_issue` | Required by spec: "Flag customs issues" |
| `arrange_alternative_routing` | Required by spec: "Arrange alternative routing" |
| `apply_compensation` | Several events require compensation per policy |
| `request_cancellation_approval` | Cancellation guardrail enforcement point |
| `update_eta` | Most delay events require ETA updates |
| `get_shipment_history` | Context awareness across events (EVT-001 → EVT-008) |
| `log_decision` | Required by spec: "Maintain a detailed audit log" |

**Why not fewer?** The spec explicitly requires notify, escalate, flag customs, arrange routing, AND audit logging. Combining tools would lose granularity in the audit trail.

**Why not more?** Each tool call adds ~0.5s latency. More tools also increases the prompt length, which costs tokens and slows inference.

### Decision: Dual-layer guardrail enforcement

The 3-cancellation-per-10-minutes guardrail is enforced at **both** frontend and backend:

1. **Frontend** (`checkGuardrail` function): Tracks cancellation timestamps client-side. Blocks the 3rd request before it even hits the network. Immediate feedback to the user.
2. **Backend** (`request_cancellation_approval` tool): Server-side counter that the agent calls. Even if the frontend is bypassed (e.g., direct API call), the backend still enforces the limit.

**Why both?** Defense in depth. The frontend provides instant UX feedback. The backend provides actual security. Neither alone is sufficient.

### Decision: Frontend guardrail triggers at `>= 2` (not `>= 3`)

- `cancellationTimestamps` is populated AFTER a successful cancellation processing.
- When we're about to process the 3rd cancellation, there are already 2 timestamps in the array.
- So `>= 2` correctly blocks the 3rd request. This is not a bug — it's the correct boundary condition.

### Decision: `shipment_context` dictionary for cross-event memory

- The spec requires "context awareness" — the agent must remember that EVT-008 is a follow-up to EVT-001 (same shipment SHP-4421).
- After processing each event, the shipment_id and event summary are stored in `shipment_context`.
- The `get_shipment_history` tool lets the agent query this dictionary.
- **Why not a database?** For 20 events, an in-memory dictionary is faster and simpler. A database would be appropriate for production (thousands of events), but adds complexity with no benefit at this scale.

### Decision: Audit logs poll every 2 seconds during processing

- Audit logs are fetched from the backend via `GET /audit-log`.
- During active processing (`processingMode !== 'NONE'`), a `setInterval` polls every 2 seconds.
- **Why polling, not WebSockets?** Flask doesn't natively support WebSockets. Adding `flask-socketio` would introduce a new dependency and complexity for a feature that works fine with 2-second polling. The trade-off is correct for a hackathon.
- **Auto-scroll**: The audit log container has a `ref` that scrolls to the top (newest entries) on every update.

---

## 4. RAG System (Level 1)

### Decision: Local embeddings (HuggingFace) instead of OpenAI embeddings

- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Why local?** No API key needed for embeddings. No rate limits. No cost. Works offline.
- **Trade-off**: Slightly lower semantic accuracy than OpenAI's `text-embedding-3-small`, but for 3 policy documents with 32 chunks, the difference is negligible.
- **Scalability**: For production with 10,000+ documents, we'd switch to OpenAI embeddings or a dedicated vector database.

### Decision: ChromaDB for vector storage

- In-memory vector store — no setup, no server, no configuration.
- **Why not Pinecone/Weaviate?** Those require cloud accounts, API keys, and network calls. ChromaDB runs locally in the same Python process.
- **Trade-off**: Data is lost on server restart. Acceptable because the 3 policy documents are re-loaded on startup anyway.

### Decision: RAG respects the active provider

- The retrieval step (finding relevant document chunks) always uses the local vectorstore — no LLM involved.
- The generation step (producing the answer from chunks) routes through the active provider.
- **Why?** If Azure is down, the user can switch to Gemini and still use Level 1. The RAG system doesn't become a single point of failure.

---

## 5. Backend Architecture

### Decision: Single Flask server for both Level 1 and Level 2

- **Why not microservices?** Two services means two processes, two ports, CORS between them, and deployment complexity. For a hackathon project with one backend, a single Flask app is simpler and faster to develop.
- **Scalability**: In production, Level 1 (RAG) and Level 2 (Agent) would be separate services behind an API gateway. The current architecture separates them by route prefix (`/query` vs `/process-event`), making future extraction straightforward.

### Decision: `langchain-classic` for AgentExecutor

- Newer LangChain versions deprecated `AgentExecutor` from `langchain.agents`.
- `langchain-classic` provides the stable, tested version of `AgentExecutor` with `create_tool_calling_agent`.
- **Why not LangGraph?** LangGraph is the "recommended" replacement, but it requires a completely different architecture (state graphs). The time cost of migration is not justified for a hackathon.

### Decision: No persistent database

- Audit logs, cancellation tracker, and shipment context are all in-memory Python data structures.
- **Why?** Zero setup. No SQLite file permissions issues. No migration scripts. The server processes 20 events per session — persistence across restarts is not required by the spec.
- **If we needed it**: Adding SQLite would take ~30 minutes. The data structures are already dictionaries/lists that map directly to SQL tables.

---

## 6. File & Project Structure

### Decision: LEVEL2/ folder is read-only

- The `LEVEL2/` folder contains the challenge spec (`README.md` + `event_stream.json`).
- We copy `event_stream.json` to `frontend/public/data/Version2/` for the frontend to serve.
- We **never modify** the original files in `LEVEL2/`.
- **Why?** The challenge spec is our "bible." Modifying it would blur the line between requirements and implementation.

### Decision: `.env` for all API keys

- All 3 provider keys (`AZURE_OPENAI_API_KEY`, `GEMINI_API_KEY`, `PAI_API_KEY`) live in `.env`.
- `.env` is in `.gitignore` — keys never leak to version control.
- `.env.example` provides the template without actual values.
- **Why not environment variables?** `.env` files are easier to manage across team members than shell exports. `python-dotenv` loads them automatically.

### Decision: Removed all intermediate documentation files

- During development, 14+ `.md` files were created for tracking progress (FIXES_APPLIED, CLEANUP_SUMMARY, LEVEL2_ASSESSMENT, etc.).
- These were deleted in the final cleanup because they contained stale information and cluttered the project root.
- A single `README.md` replaces all of them with accurate, up-to-date information.

---

## 7. Performance Optimizations

### Decision: 500ms delay between sequential event processing

- When "Process All" is clicked, events are processed sequentially with a 500ms gap.
- **Why not parallel?** The agent maintains state (cancellation counter, shipment context). Parallel processing would create race conditions on shared state.
- **Why 500ms?** Gives the UI time to render the result and update the progress bar before the next event starts. Without this, the UI freezes during batch processing.

### Decision: Agent `max_iterations=10` and `max_execution_time=30`

- Prevents runaway agent loops (e.g., agent keeps calling tools in a cycle).
- 10 iterations is enough for: assess → check policy → decide → take action → log decision (5 steps typical, 10 max for complex events).
- 30-second timeout ensures no single event blocks the queue indefinitely.

---

## 8. Security Considerations

### Decision: CORS allows all origins (`CORS(app)`)

- **Why?** Development convenience. The frontend runs on `localhost:3000` and the backend on `localhost:5001`.
- **Production fix**: Restrict to `origins=['https://globalfreight.example.com']`.

### Decision: No authentication on API endpoints

- **Why?** Internal tool, hackathon scope. Adding JWT auth would take ~2 hours with no benefit for the demo.
- **Production fix**: Add API key middleware or OAuth2.

---

*This document reflects the state of the codebase as of May 2, 2026.*
