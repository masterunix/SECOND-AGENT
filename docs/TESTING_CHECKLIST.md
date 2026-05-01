# ✅ Testing Checklist

## Pre-Demo Verification

### Environment Setup
- [ ] Python 3.8+ installed (`python --version`)
- [ ] pip installed and updated
- [ ] PAI API key obtained from https://pai.thepsi.com/
- [ ] `.env` file created with valid API key
- [ ] All dependencies installed (`pip install -r requirements.txt`)

### File Verification
- [ ] `backend.py` exists
- [ ] `app.js` exists
- [ ] `index.html` exists
- [ ] `styles.css` exists
- [ ] `DOC1-carrier-sla-agreement.md` exists
- [ ] `DOC2-customs-tariff-reference.md` exists
- [ ] `DOC3-shipment-delay-policy.md` exists
- [ ] `requirements.txt` exists
- [ ] `run.sh` / `run.bat` exists

---

## Backend Testing

### Startup
- [ ] Backend starts without errors
- [ ] Sees "Loading documents..." message
- [ ] Sees "Created X chunks from 3 documents"
- [ ] Sees "Vectorstore created successfully"
- [ ] Sees "Assistant ready!"
- [ ] Running on port 5000

### Health Check
```bash
curl http://localhost:5000/health
```
- [ ] Returns `{"status": "healthy", "documents_loaded": 3, "vectorstore_initialized": true}`

### Sample Queries Endpoint
```bash
curl http://localhost:5000/sample-queries
```
- [ ] Returns array of 5 queries

---

## Frontend Testing

### Startup
- [ ] Frontend serves on port 8000
- [ ] No console errors in browser (F12)
- [ ] Status indicator shows "Online" (green)
- [ ] 3 document pills visible
- [ ] Welcome message displays
- [ ] 5 sample query buttons visible
- [ ] Input field and Send button visible

---

## Query Testing

### Query 1: Multi-hop Reasoning
**Input:** "What's the transit time from Mumbai to Hamburg for a Platinum shipment, including customs?"

**Expected Answer Should Include:**
- [ ] 6 days (from route table)
- [ ] 1-2 days for EU customs
- [ ] Total: 7-8 business days
- [ ] Source: Carrier SLA Agreement

**Verify:**
- [ ] Answer is accurate
- [ ] Sources shown
- [ ] No hallucinations
- [ ] Response time < 5 seconds

---

### Query 2: Cross-Reference
**Input:** "A Gold customer's shipment is 15 hours late. What compensation applies and what must we do?"

**Expected Answer Should Include:**
- [ ] Gold tier tolerance: 12 hours
- [ ] 15 hours exceeds tolerance
- [ ] Compensation: 10% refund per 24-hour block
- [ ] Category 2 delay
- [ ] Proactive outreach NOT required (Platinum only)
- [ ] Sources: SLA Agreement + Delay Policy

**Verify:**
- [ ] Answer is accurate
- [ ] Cross-references both documents
- [ ] No hallucinations
- [ ] Response time < 5 seconds

---

### Query 3: Policy Lookup
**Input:** "Can our agent autonomously cancel 5 shipments in a row?"

**Expected Answer Should Include:**
- [ ] No / Cannot
- [ ] Max 3 shipments per 10-minute window
- [ ] Section 7 / Bulk Cancellation Policy
- [ ] Requires Operations Director approval beyond limit
- [ ] Source: Shipment Delay Policy

**Verify:**
- [ ] Answer is accurate
- [ ] Cites specific section
- [ ] No hallucinations
- [ ] Response time < 5 seconds

---

### Query 4: Tariff Lookup
**Input:** "What is the HS code and import duty for mobile phones?"

**Expected Answer Should Include:**
- [ ] HS Code: 8517.12
- [ ] Import Duty: 22%
- [ ] IMEI registration mandatory
- [ ] Source: Customs Tariff Reference

**Verify:**
- [ ] Answer is accurate
- [ ] All details included
- [ ] No hallucinations
- [ ] Response time < 5 seconds

---

### Query 5: Out-of-Scope Rejection
**Input:** "What is the weather in Mumbai today?"

**Expected Answer Should Include:**
- [ ] Polite refusal
- [ ] Explanation of scope (GlobalFreight policies only)
- [ ] No weather information
- [ ] No hallucinated data

**Verify:**
- [ ] Refuses cleanly
- [ ] No made-up information
- [ ] Professional tone
- [ ] Response time < 5 seconds

---

## Additional Test Queries

### Edge Cases

**Query:** "What's the HS code for laptops?"
- [ ] Returns 8471.30
- [ ] Mentions license requirement for >50 units

**Query:** "What happens if I use the wrong HS code?"
- [ ] Mentions customs hold
- [ ] Mentions penalty (₹25,000-₹2,00,000)
- [ ] SLA clock pauses

**Query:** "What's the compensation for a Platinum shipment delayed 30 hours?"
- [ ] 15% refund per 24-hour block
- [ ] Mentions 4-hour tolerance
- [ ] Category 2 delay

**Query:** "What documents are required for international shipments?"
- [ ] Lists 7 documents
- [ ] Mentions 4-hour submission deadline
- [ ] HS Code mandatory

**Query:** "Tell me about Force Majeure events"
- [ ] Lists events (natural disasters, strikes, etc.)
- [ ] SLA clock pauses
- [ ] 2-hour notification requirement

---

## UI/UX Testing

### Visual
- [ ] Black background (#0a0e14)
- [ ] Neon green accents (#00ff88)
- [ ] Neon blue accents (#00d4ff)
- [ ] Glowing effects on interactive elements
- [ ] Status indicator pulses
- [ ] Smooth animations

### Interactions
- [ ] Sample query buttons clickable
- [ ] Buttons highlight on hover
- [ ] Input field accepts text
- [ ] Enter key sends message
- [ ] Send button works
- [ ] Loading indicator shows during processing
- [ ] Messages fade in smoothly
- [ ] Chat scrolls to bottom automatically

### Responsive
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)

---

## Error Handling

### Backend Errors
**Test:** Stop backend while frontend is running
- [ ] Frontend shows "Offline" status (red)
- [ ] Error message in chat

**Test:** Invalid API key in .env
- [ ] Backend shows error on startup
- [ ] Clear error message

**Test:** Missing document file
- [ ] Backend shows warning
- [ ] Continues with available documents

### Frontend Errors
**Test:** Empty query
- [ ] Send button does nothing
- [ ] No error message

**Test:** Very long query (>1000 chars)
- [ ] Query is sent
- [ ] Backend handles gracefully

**Test:** Special characters in query
- [ ] Query is sent
- [ ] Backend handles gracefully

---

## Performance Testing

### Load Time
- [ ] Backend starts in < 10 seconds
- [ ] Frontend loads in < 2 seconds
- [ ] First query responds in < 5 seconds

### Memory Usage
- [ ] Backend uses < 500MB RAM
- [ ] Frontend uses < 100MB RAM
- [ ] No memory leaks after 10 queries

### Concurrent Queries
- [ ] Can handle 2 simultaneous queries
- [ ] Can handle 5 simultaneous queries
- [ ] No crashes or errors

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Documentation Testing

- [ ] README.md is clear and complete
- [ ] SETUP.md has accurate instructions
- [ ] QUICKSTART.md works as written
- [ ] DEMO_SCRIPT.md is helpful
- [ ] Code comments are accurate
- [ ] API endpoints documented

---

## Final Pre-Demo Checklist

### 5 Minutes Before Demo
- [ ] Backend running and healthy
- [ ] Frontend accessible at localhost:8000
- [ ] Browser window at 100% zoom
- [ ] Browser console clear (no errors)
- [ ] All 5 sample queries tested once
- [ ] Backup plan ready (screenshots/code)

### During Demo
- [ ] Speak clearly and confidently
- [ ] Point out key features
- [ ] Show source citations
- [ ] Demonstrate out-of-scope rejection
- [ ] Mention production-ready features

### After Demo
- [ ] Answer questions confidently
- [ ] Offer to show code if interested
- [ ] Provide GitHub link if available
- [ ] Thank judges for their time

---

## Success Criteria

✅ All 5 sample queries answered correctly  
✅ No hallucinations observed  
✅ Multi-hop reasoning demonstrated  
✅ Out-of-scope rejection works  
✅ Source citations shown  
✅ UI is professional and polished  
✅ No errors during demo  
✅ Response time < 5 seconds per query  
✅ Judges understand the value proposition  
✅ Technical questions answered confidently  

---

**Good luck! 🚀**
