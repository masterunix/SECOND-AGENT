// GlobalFreight Exception Handler - Frontend v2.0
const BACKEND_URL = 'http://localhost:5001';

// State
let currentEventIndex = 0;
let eventStream = [];
let processingAll = false;

// Check backend health on load
async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            updateStatus('online', `Online · v${data.version || '2.0'} · ${data.tools_available} tools`);
            console.log('Backend connected:', data);
        } else {
            updateStatus('error', 'Backend Error');
        }
    } catch (error) {
        console.error('Backend connection failed:', error);
        updateStatus('error', 'Offline');
        showMessage('error', 'Unable to connect to backend. Please ensure backend_v2.py is running on port 5001.');
    }
}

// Update status indicator
function updateStatus(status, text) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = statusIndicator.querySelector('.status-indicator');
    const statusText = statusIndicator.querySelector('.status-text');
    
    statusText.textContent = text;
    
    if (status === 'online') {
        statusDot.style.background = 'var(--neon-green)';
        statusText.style.color = 'var(--neon-green)';
    } else if (status === 'error') {
        statusDot.style.background = '#ff4444';
        statusText.style.color = '#ff4444';
        statusDot.style.animation = 'none';
    }
}

// Initialize
checkBackendHealth();
loadEventStream();

// Set initial button text
document.getElementById('viewLogBtn').textContent = 'Hide Audit Log';

// DOM Elements
const eventList = document.getElementById('eventList');
const eventDetails = document.getElementById('eventDetails');
const processBtn = document.getElementById('processBtn');
const processAllBtn = document.getElementById('processAllBtn');
const clearLogBtn = document.getElementById('clearLogBtn');
const viewLogBtn = document.getElementById('viewLogBtn');
const testBtn = document.getElementById('testBtn');
const guardrailStatus = document.getElementById('guardrailStatus');
const auditLog = document.getElementById('auditLog');

// Event Listeners
processBtn.addEventListener('click', processCurrentEvent);
processAllBtn.addEventListener('click', processAllEvents);
clearLogBtn.addEventListener('click', clearAuditLog);
viewLogBtn.addEventListener('click', toggleAuditLog);
testBtn.addEventListener('click', quickTest);

// Load event stream
async function loadEventStream() {
    try {
        const response = await fetch('Version2/event_stream.json');
        eventStream = await response.json();
        renderEventList();
        updateProgress();
    } catch (error) {
        console.error('Error loading event stream:', error);
        showMessage('error', 'Failed to load event stream');
    }
}

// Render event list
function renderEventList() {
    eventList.innerHTML = eventStream.map((event, index) => {
        const severity = assessSeverity(event);
        const isActive = index === currentEventIndex;
        
        return `
            <div class="event-item ${isActive ? 'active' : ''} severity-${severity}" 
                 onclick="selectEvent(${index})">
                <div class="event-header">
                    <span class="event-id">${event.event_id}</span>
                    <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
                </div>
                <div class="event-info">
                    <div>${event.shipment_id}</div>
                    <div class="event-type">${event.event_type}</div>
                    <div class="customer-tier">${event.customer_tier}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Assess severity (client-side preview)
function assessSeverity(event) {
    const cargo = event.cargo_type.toLowerCase();
    const tier = event.customer_tier;
    const delay = event.delay_hours || 0;
    const type = event.event_type;
    
    // Critical
    if (cargo.includes('pharma') || cargo.includes('medical') || cargo.includes('cold chain')) {
        return 'critical';
    }
    if (cargo.includes('perishable') && delay > 4) {
        return 'critical';
    }
    if (type === 'cancellation_request') {
        return 'critical';
    }
    
    // High
    if (tier === 'Platinum' && delay > 4) {
        return 'high';
    }
    if (type === 'customs_hold') {
        return 'high';
    }
    
    // Medium
    if (tier === 'Gold' && delay > 8) {
        return 'medium';
    }
    
    // Low
    return 'low';
}

// Select event
function selectEvent(index) {
    currentEventIndex = index;
    renderEventList();
    displayEventDetails(eventStream[index]);
    updateProgress();
}

// Display event details
function displayEventDetails(event) {
    const severity = assessSeverity(event);
    
    eventDetails.innerHTML = `
        <div class="event-detail-header">
            <h3>${event.event_id}</h3>
            <span class="severity-badge ${severity}">${severity.toUpperCase()}</span>
        </div>
        
        <div class="detail-section">
            <h4>Shipment Information</h4>
            <div class="detail-grid">
                <div><strong>Shipment ID:</strong> ${event.shipment_id}</div>
                <div><strong>Customer:</strong> ${event.customer}</div>
                <div><strong>Tier:</strong> ${event.customer_tier}</div>
                <div><strong>Route:</strong> ${event.origin} → ${event.destination}</div>
                <div><strong>Carrier:</strong> ${event.carrier}</div>
                <div><strong>Cargo:</strong> ${event.cargo_type}</div>
                <div><strong>Value:</strong> $${event.cargo_value_usd.toLocaleString()}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Event Details</h4>
            <div class="detail-grid">
                <div><strong>Type:</strong> ${event.event_type}</div>
                <div><strong>Delay:</strong> ${event.delay_hours || 'N/A'} hours</div>
                <div><strong>Reason Code:</strong> ${event.reason_code || 'N/A'}</div>
                <div><strong>Timestamp:</strong> ${event.timestamp}</div>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Description</h4>
            <p>${event.description}</p>
        </div>
        
        ${event.notes ? `
        <div class="detail-section">
            <h4>Policy Notes</h4>
            <p class="notes">${event.notes}</p>
        </div>
        ` : ''}
        
        <div class="detail-section">
            <h4>Expected Resolution</h4>
            <p class="expected-resolution">${event.expected_resolution}</p>
        </div>
    `;
}

// Process current event
async function processCurrentEvent() {
    if (currentEventIndex >= eventStream.length) {
        showMessage('info', 'No more events to process');
        return;
    }
    
    const event = eventStream[currentEventIndex];
    
    processBtn.disabled = true;
    processBtn.textContent = 'Processing... (10-40s)';
    
    // Show processing message
    const processingMsg = document.createElement('div');
    processingMsg.className = 'result-item';
    processingMsg.id = 'processing-msg';
    processingMsg.innerHTML = `
        <div class="result-header">
            <strong>Processing ${event.event_id}...</strong>
        </div>
        <div class="result-content">
            <p>⏳ Agent is analyzing the event, querying policies, and making decisions...</p>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">This typically takes 10-40 seconds depending on API response time.</p>
        </div>
    `;
    const resultsContainer = document.getElementById('results');
    resultsContainer.insertBefore(processingMsg, resultsContainer.firstChild);
    
    try {
        const startTime = Date.now();
        const response = await fetch(`${BACKEND_URL}/process-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event),
            signal: AbortSignal.timeout(60000)  // 60 second timeout
        });
        
        const result = await response.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Remove processing message
        document.getElementById('processing-msg')?.remove();
        
        if (response.ok) {
            result.duration = duration;
            
            // Check for timeout warning
            if (result.warning === 'timeout') {
                showMessage('warning', `⚠️ Processing timed out but actions were logged`);
            }
            
            displayResult(result);
            
            // Move to next event
            if (currentEventIndex < eventStream.length - 1) {
                currentEventIndex++;
                selectEvent(currentEventIndex);
            }
            
            // Update guardrail status
            updateGuardrailStatus();
            
            // Auto-refresh audit log if visible
            if (document.getElementById('auditLogContainer').style.display !== 'none') {
                loadAuditLog();
            }
        } else {
            showMessage('error', `Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error processing event:', error);
        document.getElementById('processing-msg')?.remove();
        showMessage('error', 'Failed to process event. Check if backend is running.');
    } finally {
        processBtn.disabled = false;
        processBtn.textContent = 'Process Event';
    }
}

// Process all events
async function processAllEvents() {
    if (processingAll) return;
    
    if (!confirm('Process all 24 events? This will take a few minutes.')) {
        return;
    }
    
    processingAll = true;
    processAllBtn.disabled = true;
    processBtn.disabled = true;
    processAllBtn.textContent = 'Processing...';
    
    try {
        const response = await fetch(`${BACKEND_URL}/process-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayStreamResults(result);
            updateGuardrailStatus();
        } else {
            showMessage('error', `Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error processing stream:', error);
        showMessage('error', 'Failed to process event stream');
    } finally {
        processingAll = false;
        processAllBtn.disabled = false;
        processBtn.disabled = false;
        processAllBtn.textContent = 'Process All Events';
    }
}

// Display single event result
function displayResult(result) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';
    resultDiv.innerHTML = `
        <div class="result-header">
            <strong>${result.event_id}</strong> - ${result.shipment_id}
            <span class="timestamp">${new Date(result.timestamp).toLocaleTimeString()}${result.duration ? ` (${result.duration}s)` : ''}</span>
        </div>
        <div class="result-content">
            ${formatResponse(result.agent_response)}
        </div>
        <div class="result-footer">
            Actions taken: ${result.actions_taken || 0}
        </div>
    `;
    
    const resultsContainer = document.getElementById('results');
    resultsContainer.insertBefore(resultDiv, resultsContainer.firstChild);
    
    // Auto-scroll to show new result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display stream results
function displayStreamResults(result) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item stream-result';
    resultDiv.innerHTML = `
        <div class="result-header">
            <strong>Stream Processing Complete</strong>
            <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="result-content">
            <h4>Summary</h4>
            <div class="summary-grid">
                <div><strong>Total Events:</strong> ${result.total_events}</div>
                <div><strong>Total Actions:</strong> ${result.summary.total_actions}</div>
                <div><strong>Escalations:</strong> ${result.summary.escalations}</div>
                <div><strong>Notifications:</strong> ${result.summary.notifications}</div>
                <div><strong>Cancellations:</strong> ${result.summary.cancellations}</div>
                <div><strong>Guardrail Breaches:</strong> ${result.summary.guardrail_breaches}</div>
            </div>
            
            <button onclick="downloadAuditLog()" class="download-btn">
                Download Full Audit Log
            </button>
        </div>
    `;
    
    const resultsContainer = document.getElementById('results');
    resultsContainer.insertBefore(resultDiv, resultsContainer.firstChild);
    
    // Store audit log for download
    window.fullAuditLog = result.audit_log;
}

// Format agent response
function formatResponse(text) {
    // Convert line breaks to paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

// Update progress
function updateProgress() {
    const progress = document.getElementById('progress');
    const percentage = ((currentEventIndex + 1) / eventStream.length) * 100;
    progress.style.width = `${percentage}%`;
    
    const progressText = document.getElementById('progressText');
    progressText.textContent = `Event ${currentEventIndex + 1} of ${eventStream.length}`;
}

// Update guardrail status
async function updateGuardrailStatus() {
    try {
        const response = await fetch(`${BACKEND_URL}/guardrail-status`);
        const data = await response.json();
        
        const statusClass = data.status === 'BREACH' ? 'breach' : 'ok';
        
        guardrailStatus.innerHTML = `
            <div class="guardrail-indicator ${statusClass}">
                <strong>Cancellation Guardrail:</strong> 
                ${data.cancellations_in_window} / ${data.guardrail_limit} in last 10 minutes
                <span class="status-badge ${statusClass}">${data.status}</span>
            </div>
        `;
    } catch (error) {
        console.error('Error updating guardrail status:', error);
    }
}

// Toggle audit log
function toggleAuditLog() {
    const logContainer = document.getElementById('auditLogContainer');
    
    if (logContainer.style.display === 'none') {
        loadAuditLog();
        logContainer.style.display = 'block';
        viewLogBtn.textContent = 'Hide Audit Log';
    } else {
        logContainer.style.display = 'none';
        viewLogBtn.textContent = 'Show Audit Log';
    }
}

// Load audit log
async function loadAuditLog() {
    try {
        const response = await fetch(`${BACKEND_URL}/audit-log`);
        const data = await response.json();
        
        if (!data.audit_log || data.audit_log.length === 0) {
            auditLog.innerHTML = '<div class="audit-log-empty">No audit entries yet. Process an event to see logs here.</div>';
            return;
        }
        
        auditLog.innerHTML = data.audit_log.map(entry => {
            const actionClass = entry.action.replace(/_/g, '-');
            return `
                <div class="audit-entry ${actionClass}">
                    <div class="audit-header">
                        <strong>${entry.action.replace(/_/g, ' ').toUpperCase()}</strong>
                        <span class="timestamp">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="audit-content">
                        ${formatAuditEntry(entry)}
                    </div>
                </div>
            `;
        }).reverse().join(''); // Show newest first
    } catch (error) {
        console.error('Error loading audit log:', error);
        auditLog.innerHTML = '<div class="audit-log-empty" style="color: #ff4444;">Failed to load audit log</div>';
    }
}

// Format audit entry
function formatAuditEntry(entry) {
    const details = Object.entries(entry)
        .filter(([key]) => key !== 'action' && key !== 'timestamp')
        .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
        .join('');
    
    return details;
}

// Clear audit log
async function clearAuditLog() {
    if (!confirm('Clear all audit log entries?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/audit-log/clear`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            auditLog.innerHTML = '<p style="color: var(--text-secondary);">No audit entries yet</p>';
            document.getElementById('results').innerHTML = '';
            showMessage('success', 'Audit log cleared');
            
            // Reset event selection
            currentEventIndex = 0;
            selectEvent(0);
            updateGuardrailStatus();
        }
    } catch (error) {
        console.error('Error clearing audit log:', error);
        showMessage('error', 'Failed to clear audit log');
    }
}

// Download audit log
function downloadAuditLog() {
    const log = window.fullAuditLog || [];
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Show message
function showMessage(type, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Update guardrail status periodically
setInterval(updateGuardrailStatus, 5000);

// Quick test function
async function quickTest() {
    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    
    try {
        const response = await fetch(`${BACKEND_URL}/test-simple`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ event_id: 'QUICK-TEST' })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('success', '✓ Backend is working! Agent takes 5-10s per event.');
            console.log('Test result:', result);
        } else {
            showMessage('error', 'Backend test failed');
        }
    } catch (error) {
        console.error('Test failed:', error);
        showMessage('error', 'Cannot connect to backend. Is it running on port 5001?');
    } finally {
        testBtn.disabled = false;
        testBtn.textContent = 'Quick Test';
    }
}
