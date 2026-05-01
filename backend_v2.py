"""
GlobalFreight Exception Handler - Level 2
AI Agent for autonomous exception processing with safety guardrails
Version: 2.0
"""

__version__ = "2.0-agent"

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# LangChain imports for agent
from langchain_openai import AzureChatOpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
AZURE_OPENAI_API_KEY = os.getenv('AZURE_OPENAI_API_KEY')
AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT', 'https://ai-fortnight.cognitiveservices.azure.com/')
AZURE_OPENAI_DEPLOYMENT = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-5-nano')
AZURE_OPENAI_API_VERSION = os.getenv('AZURE_OPENAI_API_VERSION', '2024-12-01-preview')

if not AZURE_OPENAI_API_KEY:
    raise ValueError("AZURE_OPENAI_API_KEY not found in environment variables")

# Initialize LLM
llm = AzureChatOpenAI(
    azure_deployment=AZURE_OPENAI_DEPLOYMENT,
    openai_api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
    temperature=0.7,  # Reduced for more consistent, faster responses
    request_timeout=45,  # Reduced timeout
    max_retries=1  # Reduced retries for speed
)

# Global state for agent
vectorstore = None
audit_log = []
cancellation_tracker = []  # Track cancellations with timestamps
shipment_context = {}  # Track shipment history across events

# ============================================================================
# POLICY KNOWLEDGE BASE (RAG)
# ============================================================================

def load_policy_documents():
    """Load policy documents into vectorstore"""
    documents = []
    doc_files = [
        ('DOC1-carrier-sla-agreement.md', 'Carrier SLA Agreement'),
        ('DOC2-customs-tariff-reference.md', 'Customs Tariff Reference'),
        ('DOC3-shipment-delay-policy.md', 'Shipment Delay Policy')
    ]
    
    for filename, doc_name in doc_files:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
                documents.append({
                    'content': content,
                    'metadata': {
                        'source': filename,
                        'document_name': doc_name
                    }
                })
        except FileNotFoundError:
            print(f"Warning: {filename} not found")
    
    return documents

def create_policy_vectorstore():
    """Create vectorstore from policy documents"""
    print("Loading policy documents...")
    documents = load_policy_documents()
    
    if not documents:
        raise ValueError("No policy documents loaded")
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
    )
    
    texts = []
    metadatas = []
    
    for doc in documents:
        chunks = text_splitter.split_text(doc['content'])
        texts.extend(chunks)
        metadatas.extend([doc['metadata']] * len(chunks))
    
    print(f"Created {len(texts)} chunks from {len(documents)} documents")
    
    vectorstore = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        collection_name="globalfreight_policies"
    )
    
    print("Policy vectorstore created")
    return vectorstore

# ============================================================================
# AGENT TOOLS
# ============================================================================

@tool
def query_policy(question: str) -> str:
    """
    Query the policy documents (SLA, Customs, Delay Policy) for specific information.
    Use this to look up rules, thresholds, compensation rates, reason codes, etc.
    
    Args:
        question: The policy question to look up
    
    Returns:
        Relevant policy information
    """
    global vectorstore
    
    if vectorstore is None:
        return "Error: Policy documents not loaded"
    
    try:
        retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        docs = retriever.invoke(question)
        
        if not docs:
            return "No relevant policy information found"
        
        context = "\n\n".join([doc.page_content for doc in docs])
        return f"Policy Information:\n{context}"
    
    except Exception as e:
        return f"Error querying policy: {str(e)}"

@tool
def notify_customer(shipment_id: str, customer: str, message: str, urgency: str = "normal") -> str:
    """
    Send notification to customer about their shipment.
    
    Args:
        shipment_id: The shipment ID
        customer: Customer name
        message: Notification message
        urgency: Urgency level (normal, high, critical)
    
    Returns:
        Confirmation of notification sent
    """
    log_entry = {
        'action': 'notify_customer',
        'shipment_id': shipment_id,
        'customer': customer,
        'message': message,
        'urgency': urgency,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ Customer notification sent to {customer} for {shipment_id} (urgency: {urgency})"

@tool
def escalate_to_human(shipment_id: str, reason: str, escalation_target: str, priority: str = "normal") -> str:
    """
    Escalate event to human operator (Operations Manager, Medical Supplies Desk, etc.).
    
    Args:
        shipment_id: The shipment ID
        reason: Reason for escalation
        escalation_target: Who to escalate to (e.g., "Operations Manager", "Medical Supplies Desk")
        priority: Priority level (normal, high, critical)
    
    Returns:
        Confirmation of escalation
    """
    log_entry = {
        'action': 'escalate_to_human',
        'shipment_id': shipment_id,
        'reason': reason,
        'escalation_target': escalation_target,
        'priority': priority,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ Escalated {shipment_id} to {escalation_target} (priority: {priority}). Reason: {reason}"

@tool
def flag_customs_issue(shipment_id: str, issue_type: str, corrective_action: str) -> str:
    """
    Flag a customs-related issue for correction.
    
    Args:
        shipment_id: The shipment ID
        issue_type: Type of customs issue (e.g., "incorrect_hs_code", "missing_documentation")
        corrective_action: What needs to be done
    
    Returns:
        Confirmation of customs flag
    """
    log_entry = {
        'action': 'flag_customs_issue',
        'shipment_id': shipment_id,
        'issue_type': issue_type,
        'corrective_action': corrective_action,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ Customs issue flagged for {shipment_id}: {issue_type}. Action: {corrective_action}"

@tool
def arrange_alternative_routing(shipment_id: str, reason: str, estimated_delay_reduction: str) -> str:
    """
    Arrange alternative routing for a shipment.
    
    Args:
        shipment_id: The shipment ID
        reason: Reason for rerouting
        estimated_delay_reduction: Expected time saved
    
    Returns:
        Confirmation of rerouting arrangement
    """
    log_entry = {
        'action': 'arrange_alternative_routing',
        'shipment_id': shipment_id,
        'reason': reason,
        'estimated_delay_reduction': estimated_delay_reduction,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ Alternative routing arranged for {shipment_id}. Expected delay reduction: {estimated_delay_reduction}"

@tool
def apply_compensation(shipment_id: str, customer: str, compensation_type: str, amount: str, reason: str) -> str:
    """
    Apply compensation to customer for service failure.
    
    Args:
        shipment_id: The shipment ID
        customer: Customer name
        compensation_type: Type of compensation (e.g., "refund", "credit", "discount")
        amount: Compensation amount (e.g., "10%", "$500")
        reason: Reason for compensation
    
    Returns:
        Confirmation of compensation applied
    """
    log_entry = {
        'action': 'apply_compensation',
        'shipment_id': shipment_id,
        'customer': customer,
        'compensation_type': compensation_type,
        'amount': amount,
        'reason': reason,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ Compensation applied for {shipment_id}: {compensation_type} of {amount}. Reason: {reason}"

@tool
def request_cancellation_approval(shipment_id: str, customer: str, reason: str, cancellation_number: int) -> str:
    """
    Request approval for shipment cancellation from Operations Manager.
    CRITICAL: Must be used when approaching cancellation guardrail (3 per 10 minutes).
    
    Args:
        shipment_id: The shipment ID
        customer: Customer name
        reason: Reason for cancellation
        cancellation_number: Which cancellation this is in the current window (1, 2, 3, etc.)
    
    Returns:
        Confirmation of approval request
    """
    global cancellation_tracker
    
    # Check guardrail
    now = datetime.now()
    ten_minutes_ago = now - timedelta(minutes=10)
    
    # Clean old entries
    cancellation_tracker = [c for c in cancellation_tracker if c['timestamp'] > ten_minutes_ago]
    
    recent_count = len(cancellation_tracker)
    
    log_entry = {
        'action': 'request_cancellation_approval',
        'shipment_id': shipment_id,
        'customer': customer,
        'reason': reason,
        'cancellation_number': cancellation_number,
        'recent_cancellations_count': recent_count,
        'guardrail_status': 'BREACH' if recent_count >= 3 else 'OK',
        'timestamp': now.isoformat()
    }
    audit_log.append(log_entry)
    
    if recent_count >= 3:
        return f"⚠️ GUARDRAIL BREACH: {recent_count} cancellations in last 10 minutes. Cancellation #{cancellation_number} for {shipment_id} REQUIRES Operations Manager approval. Request escalated."
    else:
        # Track this cancellation
        cancellation_tracker.append({
            'shipment_id': shipment_id,
            'timestamp': now
        })
        return f"✓ Cancellation approved for {shipment_id} (#{cancellation_number} in window, {recent_count + 1} total recent)"

@tool
def update_eta(shipment_id: str, new_eta: str, reason: str) -> str:
    """
    Update the estimated time of arrival for a shipment.
    
    Args:
        shipment_id: The shipment ID
        new_eta: New estimated arrival time
        reason: Reason for ETA change
    
    Returns:
        Confirmation of ETA update
    """
    log_entry = {
        'action': 'update_eta',
        'shipment_id': shipment_id,
        'new_eta': new_eta,
        'reason': reason,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ ETA updated for {shipment_id} to {new_eta}. Reason: {reason}"

@tool
def get_shipment_history(shipment_id: str) -> str:
    """
    Retrieve previous events for a specific shipment to maintain context.
    
    Args:
        shipment_id: The shipment ID to look up
    
    Returns:
        History of events for this shipment
    """
    global shipment_context
    
    if shipment_id not in shipment_context:
        return f"No previous events found for {shipment_id}"
    
    history = shipment_context[shipment_id]
    return f"Previous events for {shipment_id}:\n" + json.dumps(history, indent=2)

@tool
def log_decision(event_id: str, decision: str, reasoning: str, severity: str) -> str:
    """
    Log a decision made by the agent for audit trail.
    
    Args:
        event_id: The event ID being processed
        decision: The decision made (e.g., "auto_resolve", "escalate", "notify")
        reasoning: Why this decision was made
        severity: Assessed severity (low, medium, high, critical)
    
    Returns:
        Confirmation of logged decision
    """
    log_entry = {
        'action': 'log_decision',
        'event_id': event_id,
        'decision': decision,
        'reasoning': reasoning,
        'severity': severity,
        'timestamp': datetime.now().isoformat()
    }
    audit_log.append(log_entry)
    
    return f"✓ Decision logged for {event_id}: {decision} (severity: {severity})"

# ============================================================================
# AGENT SETUP
# ============================================================================

def create_exception_agent():
    """Create the exception handling agent"""
    
    tools = [
        query_policy,
        notify_customer,
        escalate_to_human,
        flag_customs_issue,
        arrange_alternative_routing,
        apply_compensation,
        request_cancellation_approval,
        update_eta,
        get_shipment_history,
        log_decision
    ]
    
    # Agent prompt - optimized for speed
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the GlobalFreight Exception Handler AI Agent. Process events quickly and safely.

WORKFLOW (be efficient):
1. Check shipment history (if needed)
2. Query policy ONCE for key rules
3. Assess severity: CRITICAL (pharma/medical/perishables >4h) | HIGH (Platinum >4h, customs, cancellations) | MEDIUM (Gold >8h) | LOW (minor)
4. Log decision
5. Take action

CRITICAL GUARDRAIL:
- Max 3 cancellations per 10 minutes
- Use request_cancellation_approval for cancellations

ESCALATE TO HUMAN:
- Pharma/medical >2h → Medical Supplies Desk
- Perishables >4h → Operations Manager
- Cancellations → Operations Manager
- Regulatory issues → Senior Account Manager

AUTO-RESOLVE:
- Minor delays within SLA
- Routine updates
- Standard compensation

Be concise. Take action quickly."""),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=False,  # Disable verbose output for speed
        max_iterations=8,  # Reduced for speed
        handle_parsing_errors=True,
        return_intermediate_steps=False,  # Don't return intermediate steps
        max_execution_time=40  # Maximum 40 seconds per event
    )
    
    return agent_executor

# Initialize agent
print("Initializing Exception Handler Agent...")
vectorstore = create_policy_vectorstore()
agent_executor = create_exception_agent()
print("Agent ready!")

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'version': __version__,
        'agent_type': 'exception_handler',
        'policies_loaded': vectorstore is not None,
        'tools_available': 10
    })

@app.route('/process-event', methods=['POST'])
def process_event():
    """Process a single exception event"""
    global shipment_context
    
    try:
        event = request.json
        
        if not event:
            return jsonify({'error': 'Event data required'}), 400
        
        event_id = event.get('event_id', 'UNKNOWN')
        shipment_id = event.get('shipment_id', 'UNKNOWN')
        
        print(f"\n{'='*60}")
        print(f"Processing {event_id} - {shipment_id}")
        print(f"{'='*60}")
        
        # Store event in shipment context
        if shipment_id not in shipment_context:
            shipment_context[shipment_id] = []
        shipment_context[shipment_id].append(event)
        
        # Format event for agent - more concise
        event_description = f"""
EVENT: {event_id} | SHIPMENT: {shipment_id}
CUSTOMER: {event.get('customer')} ({event.get('customer_tier')})
ROUTE: {event.get('origin')} → {event.get('destination')}
CARRIER: {event.get('carrier')}

TYPE: {event.get('event_type')}
DELAY: {event.get('delay_hours', 'N/A')}h | REASON: {event.get('reason_code', 'N/A')}
CARGO: {event.get('cargo_type')} | VALUE: ${event.get('cargo_value_usd', 0):,}

DESCRIPTION: {event.get('description')}
{f"NOTES: {event.get('notes')}" if event.get('notes') else ""}

TASK: Assess, decide, act. Be efficient.
"""
        
        # Process with agent
        start_time = datetime.now()
        try:
            result = agent_executor.invoke({
                "input": event_description
            })
            duration = (datetime.now() - start_time).total_seconds()
            
            print(f"✓ Processed in {duration:.1f}s")
            
            return jsonify({
                'event_id': event_id,
                'shipment_id': shipment_id,
                'agent_response': result['output'],
                'actions_taken': len([log for log in audit_log if log.get('action') != 'log_decision']),
                'duration': f"{duration:.1f}",
                'timestamp': datetime.now().isoformat()
            })
        except Exception as agent_error:
            duration = (datetime.now() - start_time).total_seconds()
            print(f"✗ Agent error after {duration:.1f}s: {str(agent_error)}")
            
            # Return partial result if timeout
            if "timeout" in str(agent_error).lower() or duration > 40:
                return jsonify({
                    'event_id': event_id,
                    'shipment_id': shipment_id,
                    'agent_response': f"Processing timed out after {duration:.1f}s. The agent may be overloaded or the API is slow. Recent actions were logged.",
                    'actions_taken': len([log for log in audit_log if log.get('action') != 'log_decision']),
                    'duration': f"{duration:.1f}",
                    'timestamp': datetime.now().isoformat(),
                    'warning': 'timeout'
                })
            else:
                raise
    
    except Exception as e:
        print(f"Error processing event: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/process-stream', methods=['POST'])
def process_stream():
    """Process entire event stream"""
    global audit_log, cancellation_tracker, shipment_context
    
    try:
        # Reset state
        audit_log = []
        cancellation_tracker = []
        shipment_context = {}
        
        # Load event stream
        with open('Version2/event_stream.json', 'r') as f:
            events = json.load(f)
        
        results = []
        
        for event in events:
            event_id = event.get('event_id', 'UNKNOWN')
            print(f"\n{'='*60}")
            print(f"Processing {event_id}...")
            print(f"{'='*60}\n")
            
            # Process event
            response = process_single_event(event)
            results.append(response)
        
        return jsonify({
            'total_events': len(events),
            'results': results,
            'audit_log': audit_log,
            'summary': {
                'total_actions': len(audit_log),
                'escalations': len([log for log in audit_log if log.get('action') == 'escalate_to_human']),
                'notifications': len([log for log in audit_log if log.get('action') == 'notify_customer']),
                'cancellations': len([log for log in audit_log if 'cancellation' in log.get('action', '')]),
                'guardrail_breaches': len([log for log in audit_log if log.get('guardrail_status') == 'BREACH'])
            }
        })
    
    except Exception as e:
        print(f"Error processing stream: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def process_single_event(event: Dict[str, Any]) -> Dict[str, Any]:
    """Process a single event (helper function)"""
    global shipment_context
    
    event_id = event.get('event_id', 'UNKNOWN')
    shipment_id = event.get('shipment_id', 'UNKNOWN')
    
    # Store event in shipment context
    if shipment_id not in shipment_context:
        shipment_context[shipment_id] = []
    shipment_context[shipment_id].append(event)
    
    # Format event for agent
    event_description = f"""
Process this exception event:

EVENT ID: {event_id}
SHIPMENT ID: {shipment_id}
CUSTOMER: {event.get('customer', 'Unknown')} (Tier: {event.get('customer_tier', 'Unknown')})
ROUTE: {event.get('origin', 'Unknown')} → {event.get('destination', 'Unknown')}
CARRIER: {event.get('carrier', 'Unknown')}

EVENT TYPE: {event.get('event_type', 'Unknown')}
DESCRIPTION: {event.get('description', 'No description')}

DELAY: {event.get('delay_hours', 'N/A')} hours
REASON CODE: {event.get('reason_code', 'N/A')}
CARGO TYPE: {event.get('cargo_type', 'Unknown')}
CARGO VALUE: ${event.get('cargo_value_usd', 0):,}

NOTES: {event.get('notes', 'None')}

Your task:
1. Check if you've seen this shipment before (use get_shipment_history)
2. Query relevant policies
3. Assess severity
4. Log your decision
5. Take appropriate action(s)
"""
    
    # Process with agent
    result = agent_executor.invoke({
        "input": event_description
    })
    
    return {
        'event_id': event_id,
        'shipment_id': shipment_id,
        'agent_response': result['output'],
        'timestamp': datetime.now().isoformat()
    }

@app.route('/audit-log', methods=['GET'])
def get_audit_log():
    """Get the complete audit log"""
    return jsonify({
        'audit_log': audit_log,
        'total_entries': len(audit_log)
    })

@app.route('/audit-log/clear', methods=['POST'])
def clear_audit_log():
    """Clear the audit log"""
    global audit_log, cancellation_tracker, shipment_context
    audit_log = []
    cancellation_tracker = []
    shipment_context = {}
    return jsonify({'success': True, 'message': 'Audit log cleared'})

@app.route('/guardrail-status', methods=['GET'])
def guardrail_status():
    """Get current guardrail status"""
    now = datetime.now()
    ten_minutes_ago = now - timedelta(minutes=10)
    
    recent_cancellations = [c for c in cancellation_tracker if c['timestamp'] > ten_minutes_ago]
    
    return jsonify({
        'cancellations_in_window': len(recent_cancellations),
        'guardrail_limit': 3,
        'status': 'BREACH' if len(recent_cancellations) >= 3 else 'OK',
        'recent_cancellations': recent_cancellations
    })

@app.route('/test-simple', methods=['POST'])
def test_simple():
    """Simple test endpoint without agent - for quick testing"""
    try:
        data = request.json
        event_id = data.get('event_id', 'TEST')
        
        # Simple response without agent processing
        return jsonify({
            'event_id': event_id,
            'status': 'test_success',
            'message': 'Backend is working! Agent processing takes 5-10 seconds per event.',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"\n{'='*60}")
    print(f"GlobalFreight Exception Handler v{__version__}")
    print(f"{'='*60}\n")
    app.run(host='0.0.0.0', port=5001, debug=False)
