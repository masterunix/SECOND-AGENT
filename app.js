// GlobalFreight AI Platform - Combined Frontend
// Supports both Level 1 (RAG Assistant) and Level 2 (Exception Handler)

const BACKEND_URL = 'http://localhost:5001';

// ============================================================================
// TAB SWITCHING
// ============================================================================

let currentTab = 'level1';

// Initialize tabs
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
});

function switchTab(tabName) {
    currentTab = tabName;
    
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Initialize tab-specific functionality
    if (tabName === 'level1') {
        initLevel1();
    } else if (tabName === 'level2') {
        initLevel2();
    }
}

// ============================================================================
// LEVEL 1: RAG ASSISTANT
// ============================================================================

let level1Initialized = false;

function initLevel1() {
    if (level1Initialized) return;
    level1Initialized = true;
    
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const queryBtns = document.querySelectorAll('.query-btn');
    
    // Event Listeners
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
    
    queryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            userInput.value = query;
            handleSend();
        });
    });
    
    // Document management
    const manageDocsBtn = document.getElementById('manageDocsBtn');
    const docModal = document.getElementById('docModal');
    const closeModal = document.getElementById('closeModal');
    const addDocBtn = document.getElementById('addDocBtn');
    const resetDocsBtn = document.getElementById('resetDocsBtn');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    const newDocName = document.getElementById('newDocName');
    
    // File picker
    selectFileBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFileName.textContent = file.name;
            selectedFileName.style.color = 'var(--neon-green)';
            if (!newDocName.value) {
                const displayName = file.name.replace(/\.(md|txt)$/i, '').replace(/[-_]/g, ' ');
                newDocName.value = displayName;
            }
        } else {
            selectedFileName.textContent = 'No file selected';
            selectedFileName.style.color = 'var(--text-secondary)';
        }
    });
    
    manageDocsBtn.addEventListener('click', () => {
        docModal.classList.add('active');
        loadDocuments();
    });
    
    closeModal.addEventListener('click', () => docModal.classList.remove('active'));
    docModal.addEventListener('click', (e) => {
        if (e.target === docModal) docModal.classList.remove('active');
    });
    
    addDocBtn.addEventListener('click', addDocument);
    resetDocsBtn.addEventListener('click', resetDocuments);
    
    // Load documents on init
    loadDocuments();
}

// Handle send message (Level 1)
async function handleSend() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    userInput.value = '';
    
    const loadingId = addLoading();
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    userInput.disabled = true;
    
    try {
        const response = await queryAssistant(message);
        removeLoading(loadingId);
        addMessage('assistant', response.answer, response.sources);
    } catch (error) {
        removeLoading(loadingId);
        addMessage('assistant', 'Sorry, I encountered an error. Please ensure the backend is running.');
        console.error('Error:', error);
    } finally {
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Add message to chat (Level 1)
function addMessage(type, content, sources = null) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'assistant' ? 'GF' : 'You';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatContent(content);
    
    if (sources && sources.length > 0) {
        messageDiv.dataset.sources = JSON.stringify(sources);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Format content with markdown (Level 1)
function formatContent(text) {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    const formatted = paragraphs.map(p => {
        if (p.includes('\n- ') || p.includes('\n• ')) {
            const items = p.split('\n').filter(item => item.trim());
            const listItems = items.map(item => {
                const cleaned = item.replace(/^[-•]\s*/, '');
                return cleaned ? `<li>${cleaned}</li>` : '';
            }).join('');
            return `<ul>${listItems}</ul>`;
        } else if (/^\d+\./.test(p)) {
            const items = p.split('\n').filter(item => item.trim());
            const listItems = items.map(item => {
                const cleaned = item.replace(/^\d+\.\s*/, '');
                return cleaned ? `<li>${cleaned}</li>` : '';
            }).join('');
            return `<ol>${listItems}</ol>`;
        }
        return `<p>${p}</p>`;
    }).join('');
    return formatted;
}

// Add/remove loading (Level 1)
function addLoading() {
    const chatContainer = document.getElementById('chatContainer');
    const loadingDiv = document.createElement('div');
    const loadingId = 'loading-' + Date.now();
    loadingDiv.id = loadingId;
    loadingDiv.className = 'message assistant-message';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'GF';
    
    const loadingContent = document.createElement('div');
    loadingContent.className = 'message-content loading';
    loadingContent.innerHTML = '<span></span><span></span><span></span>';
    
    loadingDiv.appendChild(avatar);
    loadingDiv.appendChild(loadingContent);
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return loadingId;
}

function removeLoading(loadingId) {
    const loadingDiv = document.getElementById(loadingId);
    if (loadingDiv) loadingDiv.remove();
}

// Query assistant (Level 1)
async function queryAssistant(query) {
    const response = await fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
    });
    if (!response.ok) throw new Error(`Backend request failed: ${response.status}`);
    return await response.json();
}

// Document management functions (Level 1)
async function loadDocuments() {
    try {
        const response = await fetch(`${BACKEND_URL}/documents`);
        const data = await response.json();
        if (data.documents) {
            renderDocuments(data.documents);
            updateDocumentStatus(data.documents);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        document.getElementById('docList').innerHTML = '<p style="color: #ff4444;">Failed to load documents</p>';
    }
}

function renderDocuments(documents) {
    const docList = document.getElementById('docList');
    if (documents.length === 0) {
        docList.innerHTML = '<p style="color: var(--text-secondary);">No documents loaded</p>';
        return;
    }
    docList.innerHTML = documents.map(doc => `
        <div class="doc-item ${doc.is_default ? 'default' : ''}">
            <div class="doc-info">
                <h4>${doc.name} ${doc.is_default ? '<span class="doc-badge">DEFAULT</span>' : ''}</h4>
                <p>${doc.filename}</p>
            </div>
            <button class="doc-remove-btn" onclick="removeDocument('${doc.filename}')" ${doc.is_default ? 'disabled' : ''}>
                ${doc.is_default ? 'Protected' : 'Remove'}
            </button>
        </div>
    `).join('');
}

function updateDocumentStatus(documents) {
    document.getElementById('docCount').textContent = `${documents.length} document${documents.length !== 1 ? 's' : ''} loaded`;
    document.getElementById('docPills').innerHTML = documents.map(doc => 
        `<span class="doc-pill">${doc.name}</span>`
    ).join('');
}

async function addDocument() {
    const fileInput = document.getElementById('fileInput');
    const newDocName = document.getElementById('newDocName');
    const addDocBtn = document.getElementById('addDocBtn');
    const selectedFileName = document.getElementById('selectedFileName');
    
    const file = fileInput.files[0];
    const name = newDocName.value.trim();
    
    if (!file) { alert('Please select a file'); return; }
    if (!name) { alert('Please enter a display name'); return; }
    
    try {
        addDocBtn.disabled = true;
        addDocBtn.textContent = 'Adding...';
        const content = await file.text();
        const response = await fetch(`${BACKEND_URL}/documents/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, name: name, content: content })
        });
        const data = await response.json();
        if (response.ok) {
            alert(`Success! Added ${data.chunks_added} chunks from ${file.name}`);
            fileInput.value = '';
            selectedFileName.textContent = 'No file selected';
            selectedFileName.style.color = 'var(--text-secondary)';
            newDocName.value = '';
            loadDocuments();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error adding document:', error);
        alert('Failed to add document');
    } finally {
        addDocBtn.disabled = false;
        addDocBtn.textContent = 'Add Document';
    }
}

async function removeDocument(filename) {
    if (!confirm(`Are you sure you want to remove ${filename}?`)) return;
    try {
        const response = await fetch(`${BACKEND_URL}/documents/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: filename })
        });
        const data = await response.json();
        if (response.ok) {
            alert(`Success! Removed ${data.chunks_removed} chunks from ${filename}`);
            loadDocuments();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error removing document:', error);
        alert('Failed to remove document');
    }
}

async function resetDocuments() {
    if (!confirm('Are you sure you want to reset to default documents only?')) return;
    const resetDocsBtn = document.getElementById('resetDocsBtn');
    try {
        resetDocsBtn.disabled = true;
        resetDocsBtn.textContent = 'Resetting...';
        const response = await fetch(`${BACKEND_URL}/documents/reset`, { method: 'POST' });
        const data = await response.json();
        if (response.ok) {
            alert('Success! Reset to default documents');
            loadDocuments();
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error resetting documents:', error);
        alert('Failed to reset documents');
    } finally {
        resetDocsBtn.disabled = false;
        resetDocsBtn.textContent = 'Reset to Default Documents';
    }
}

// ============================================================================
// LEVEL 2: EXCEPTION HANDLER
// ============================================================================

let level2Initialized = false;
let currentEventIndex = 0;
let eventStream = [];
let processingAll = false;

function initLevel2() {
    if (level2Initialized) return;
    level2Initialized = true;
    
    // Load event stream
    loadEventStream();
    
    // Set initial button text
    const viewLogBtn = document.getElementById('viewLogBtn');
    if (viewLogBtn) viewLogBtn.textContent = 'Hide Audit Log';
    
    // Event Listeners
    const processBtn = document.getElementById('processBtn');
    const processAllBtn = document.getElementById('processAllBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const testBtn = document.getElementById('testBtn');
    
    if (processBtn) processBtn.addEventListener('click', processCurrentEvent);
    if (processAllBtn) processAllBtn.addEventListener('click', processAllEvents);
    if (clearLogBtn) clearLogBtn.addEventListener('click', clearAuditLog);
    if (viewLogBtn) viewLogBtn.addEventListener('click', toggleAuditLog);
    if (testBtn) testBtn.addEventListener('click', quickTest);
    
    // Update guardrail status periodically
    setInterval(updateGuardrailStatus, 5000);
}

// ============================================================================
// SHARED: BACKEND HEALTH CHECK
// ============================================================================

async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            const version = data.version || '1.0';
            const tools = data.tools_available ? ` · ${data.tools_available} tools` : '';
            updateStatus('online', `Online · v${version}${tools}`);
            console.log('Backend connected:', data);
        } else {
            updateStatus('error', 'Backend Error');
        }
    } catch (error) {
        console.error('Backend connection failed:', error);
        updateStatus('error', 'Offline');
    }
}

function updateStatus(status, text) {
    const statusIndicator = document.getElementById('statusIndicator');
    if (!statusIndicator) return;
    
    const statusDot = statusIndicator.querySelector('.status-indicator');
    const statusText = statusIndicator.querySelector('.status-text');
    
    if (statusText) statusText.textContent = text;
    
    if (statusDot) {
        if (status === 'online') {
            statusDot.style.background = 'var(--neon-green)';
            if (statusText) statusText.style.color = 'var(--neon-green)';
        } else if (status === 'error') {
            statusDot.style.background = '#ff4444';
            if (statusText) statusText.style.color = '#ff4444';
            statusDot.style.animation = 'none';
        }
    }
}

// Initialize on load
checkBackendHealth();

// ============================================================================
// LEVEL 2 FUNCTIONS (from app_v2.js)
// ============================================================================

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
        const response = await fetch('data/Version2/event_stream.json');
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
