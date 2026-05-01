# 🎤 Level 2 Demo Script - AI-Fortnight 2026

## Total Time: 8-10 minutes

---

## 1. Introduction (1 minute)

### Opening Statement
"Hi everyone! We're Team GlobalFreight, and we've built an autonomous AI agent that processes logistics exception events with safety guardrails."

### The Problem
"GlobalFreight's operations desk receives hundreds of exception events daily - flight cancellations, customs holds, perishable goods at risk. Operations teams can't keep up, leading to missed events and delayed escalations."

### Our Solution
"We built an AI agent that processes these events autonomously, makes intelligent decisions, and takes actions - all while enforcing critical safety guardrails."

### Level 1 → Level 2 Evolution
"We started with a simple Q&A system in Level 1. For Level 2, we upgraded to a full autonomous agent with tool calling, context awareness, and safety enforcement."

---

## 2. Architecture Overview (1 minute)

### Show the System
*[Open browser to `http://localhost:8000/index_v2.html`]*

"Here's our system. Three panels:
- **Left:** 20 real-world exception events, color-coded by severity
- **Center:** Event details and processing results
- **Right:** Agent capabilities and audit log"

### Key Components
"The agent has:
- **10 specialized tools** - notify customers, escalate to humans, flag customs issues, etc.
- **Policy knowledge base** - RAG from 3 policy documents
- **Context awareness** - remembers previous events for same shipment
- **Safety guardrails** - enforces cancellation limits"

---

## 3. Demo: Critical Event Processing (2 minutes)

### Select Critical Event
*[Click on EVT-004 in left panel]*

"Let's process a critical event - EVT-004. This is a pharmaceutical cold chain shipment delayed 36 hours."

### Show Event Details
*[Point to center panel]*

"Details:
- **Customer:** Apollo Hospitals (Platinum tier)
- **Cargo:** Pharmaceutical - Cold Chain
- **Delay:** 36 hours
- **Value:** $220,000"

### Process Event
*[Click "Process Event" button]*

"Watch the agent work..."

### Explain Agent Actions
*[As results appear]*

"The agent:
1. **Queried policy documents** - found pharma delays >2h require specialist escalation
2. **Assessed severity** - CRITICAL (pharma + cold chain)
3. **Made decision** - escalate to Medical Supplies Desk
4. **Took action** - escalated with high priority
5. **Logged everything** - complete audit trail"

### Key Point
"Notice: The agent didn't just answer a question - it made a decision and took action autonomously."

---

## 4. Demo: Context Awareness (2 minutes)

### Explain Context Challenge
"One of the hardest challenges: multiple events can reference the same shipment. The agent needs to remember previous events."

### Process First Event
*[Select EVT-001]*

"EVT-001: Shipment SHP-4421 delayed 3.5 hours due to ATC hold."

*[Click "Process Event"]*

"Agent processes it - notifies customer, updates ETA."

### Process Second Event (Same Shipment)
*[Select EVT-008]*

"Now EVT-008 - same shipment SHP-4421, but now delayed 7 hours total."

*[Click "Process Event"]*

### Show Context Awareness
*[Point to results]*

"Watch - the agent uses the `get_shipment_history` tool to retrieve EVT-001. It remembers the previous delay and builds on that decision. Now it applies SLA credit because the delay exceeded Platinum tolerance."

### Key Point
"This is true context awareness - not just processing events in isolation, but understanding the full shipment journey."

---

## 5. Demo: Safety Guardrail (2 minutes)

### Explain Guardrail
"Here's the critical safety feature: No agent - human or AI - may cancel more than 3 shipments in any 10-minute window."

### Show Guardrail Status
*[Point to guardrail indicator in center panel]*

"Current status: 0 / 3 cancellations. Status: OK."

### Process First Cancellation
*[Select EVT-011]*

"EVT-011: Customer requests cancellation. Shipment not yet departed."

*[Click "Process Event"]*

"Agent processes it - requests approval. Cancellation count: 1 / 3."

### Process Second Cancellation
*[Select EVT-016]*

"EVT-016: Another cancellation request. Shipment already in transit."

*[Click "Process Event"]*

"Cancellation count: 2 / 3. Still OK."

### Process Third Cancellation (BREACH!)
*[Select EVT-018]*

"EVT-018: Third cancellation request."

*[Click "Process Event"]*

### Show Guardrail Enforcement
*[Point to results and guardrail status]*

"⚠️ GUARDRAIL BREACH! The agent detected this is the 3rd cancellation and automatically:
1. **Paused processing**
2. **Escalated to Operations Manager**
3. **Logged the breach**
4. **Did NOT proceed with cancellation**"

### Key Point
"This is safety by design. The agent enforces rules that even humans might miss under pressure."

---

## 6. Demo: Batch Processing (1 minute)

### Process All Events
*[Click "Process All Events" button]*

"Let's process all 20 events at once. This will take about 2 minutes..."

*[Wait for processing to complete]*

### Show Summary
*[Point to summary results]*

"Complete! Summary:
- **20 events processed**
- **~45 total actions taken**
- **~8 escalations to humans**
- **~15 customer notifications**
- **3 cancellations processed**
- **1 guardrail breach detected**"

### Download Audit Log
*[Click "Download Full Audit Log"]*

"Every decision is logged. Here's the complete audit trail in JSON format - ready for compliance review."

---

## 7. Technical Highlights (1 minute)

### Technology Stack
"Built with:
- **LangChain Agents** - autonomous decision making with tool calling
- **ChromaDB** - vector store for policy documents
- **Azure OpenAI** - GPT-5-nano for reasoning
- **Flask** - REST API backend
- **Vanilla JS** - responsive frontend"

### Key Innovations
"What makes this special:
1. **Tool calling** - agent can take 10 different actions
2. **RAG integration** - queries policy documents for rules
3. **State management** - tracks shipments across events
4. **Guardrail enforcement** - automatic safety checks
5. **Complete audit trail** - every decision logged"

### Production Ready
"This isn't just a demo - it's production-ready with:
- Error handling
- Timeout management
- Audit logging
- Safety enforcement
- Comprehensive testing"

---

## 8. Closing (30 seconds)

### Summary
"To recap: We built an autonomous AI agent that:
- ✅ Processes logistics exceptions autonomously
- ✅ Makes intelligent decisions based on policies
- ✅ Takes actions using specialized tools
- ✅ Remembers context across events
- ✅ Enforces critical safety guardrails
- ✅ Maintains complete audit trail"

### Impact
"This solves the real problem: operations teams drowning in exception events. Our agent handles routine cases autonomously and escalates critical ones to humans - with full transparency."

### Call to Action
"From Level 1 RAG to Level 2 Agent - we're ready for production. Thank you!"

---

## 🎯 Backup Demos (if time permits)

### Perishable Goods Escalation (EVT-006)
"Fresh produce delayed 5 hours - exceeds 4-hour limit. Agent immediately escalates."

### Customs Hold (EVT-002)
"Incorrect HS code. Agent flags for shipper correction, not carrier fault."

### Borderline Case (EVT-020)
"Delay exactly 2 hours - threshold is >2h. Agent determines notification not required."

---

## 🎤 Q&A Preparation

### Expected Questions

**Q: How does the agent know when to escalate vs auto-resolve?**
A: "The agent queries policy documents via RAG and applies rule-based logic. For example, any pharma delay >2h triggers automatic escalation to Medical Supplies Desk."

**Q: What if the agent makes a wrong decision?**
A: "Every decision is logged with reasoning in the audit trail. Humans can review and override. Plus, critical actions like cancellations have guardrails."

**Q: How do you prevent the agent from going rogue?**
A: "Multiple safety layers: guardrails enforce hard limits, escalation triggers for critical events, and complete audit trail for accountability."

**Q: Can you add more tools?**
A: "Absolutely! The architecture is extensible. Just define a new tool with the @tool decorator and add it to the agent's tool list."

**Q: How does context awareness work?**
A: "We maintain a shipment_context dictionary that stores all events per shipment. The agent uses the get_shipment_history tool to retrieve previous events."

**Q: What about API costs?**
A: "We use GPT-5-nano which is cost-effective. Plus, we cache policy document embeddings locally, so we only pay for LLM calls during decision making."

---

## 📊 Demo Checklist

### Before Demo
- [ ] Backend running on port 5001
- [ ] Frontend running on port 8000
- [ ] Browser open to `index_v2.html`
- [ ] Audit log cleared (fresh start)
- [ ] Guardrail status reset
- [ ] Test all 4 demo scenarios

### During Demo
- [ ] Speak clearly and confidently
- [ ] Point to UI elements as you explain
- [ ] Let the agent finish processing before moving on
- [ ] Highlight key decisions in results
- [ ] Show audit log entries

### After Demo
- [ ] Answer questions confidently
- [ ] Offer to show additional features
- [ ] Provide GitHub/documentation links
- [ ] Thank the judges

---

## 🎬 Presentation Tips

### Do's
✅ Practice the demo multiple times  
✅ Have backup plan if API is slow  
✅ Explain WHY decisions matter, not just WHAT  
✅ Show enthusiasm and confidence  
✅ Connect features to real-world impact  

### Don'ts
❌ Rush through the demo  
❌ Get lost in technical details  
❌ Apologize for UI/UX  
❌ Skip the guardrail demo (it's the coolest part!)  
❌ Forget to mention Level 1 → Level 2 upgrade  

---

## 🏆 Winning Points

### Technical Excellence
- Autonomous agent with tool calling
- RAG integration for policy compliance
- Context awareness across events
- Safety guardrails with enforcement

### Real-World Impact
- Solves actual operations problem
- Reduces human workload
- Prevents errors and delays
- Maintains accountability

### Production Readiness
- Complete error handling
- Audit trail for compliance
- Safety enforcement
- Comprehensive testing

### Innovation
- Level 1 → Level 2 evolution
- Multi-event context awareness
- Automatic guardrail enforcement
- Intelligent severity assessment

---

**Good luck! You've got this! 🚀**

*Remember: You're not just showing code - you're showing a solution to a real problem.*
