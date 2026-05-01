// Backend API Configuration
const BACKEND_URL = 'http://localhost:5001';

// Check backend health on load
async function checkBackendHealth() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
            updateStatus('online', `Online · v${data.version || '1.0'}`);
            console.log('Backend connected:', data);
        } else {
            updateStatus('error', 'Backend Error');
        }
    } catch (error) {
        console.error('Backend connection failed:', error);
        updateStatus('error', 'Offline');
        addMessage('assistant', 'Unable to connect to backend. Please ensure the Python backend is running on port 5001.');
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

// DOM Elements
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

// Handle send message
async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage('user', message);
    userInput.value = '';
    
    // Show loading
    const loadingId = addLoading();
    
    // Disable input
    sendBtn.disabled = true;
    userInput.disabled = true;
    
    try {
        const response = await queryAssistant(message);
        removeLoading(loadingId);
        addMessage('assistant', response.answer, response.sources);
    } catch (error) {
        removeLoading(loadingId);
        addMessage('assistant', 'Sorry, I encountered an error processing your request. Please ensure the backend is running.');
        console.error('Error:', error);
    } finally {
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Add message to chat
function addMessage(type, content, sources = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'assistant' ? 'GF' : 'You';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Format content with basic markdown support
    const formattedContent = formatContent(content);
    contentDiv.innerHTML = formattedContent;
    
    // Add sources if available (hidden - for internal tracking only)
    if (sources && sources.length > 0) {
        // Sources are tracked but not displayed to user
        messageDiv.dataset.sources = JSON.stringify(sources);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Format content with basic markdown
function formatContent(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks to <p> tags
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    const formatted = paragraphs.map(p => {
        // Check if it's a list
        if (p.includes('\n- ') || p.includes('\n• ')) {
            const items = p.split('\n').filter(item => item.trim());
            const listItems = items.map(item => {
                const cleaned = item.replace(/^[-•]\s*/, '');
                return cleaned ? `<li>${cleaned}</li>` : '';
            }).join('');
            return `<ul>${listItems}</ul>`;
        }
        // Check if it's a numbered list
        else if (/^\d+\./.test(p)) {
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

// Add loading indicator
function addLoading() {
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

// Remove loading indicator
function removeLoading(loadingId) {
    const loadingDiv = document.getElementById(loadingId);
    if (loadingDiv) loadingDiv.remove();
}

// Query the assistant via backend
async function queryAssistant(query) {
    const response = await fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: query
        })
    });

    if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// Document Management
const manageDocsBtn = document.getElementById('manageDocsBtn');
const docModal = document.getElementById('docModal');
const closeModal = document.getElementById('closeModal');
const docList = document.getElementById('docList');
const addDocBtn = document.getElementById('addDocBtn');
const resetDocsBtn = document.getElementById('resetDocsBtn');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const selectedFileName = document.getElementById('selectedFileName');
const newDocName = document.getElementById('newDocName');
const docPills = document.getElementById('docPills');
const docCount = document.getElementById('docCount');

// File picker
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFileName.textContent = file.name;
        selectedFileName.style.color = 'var(--neon-green)';
        
        // Auto-fill display name if empty
        if (!newDocName.value) {
            const displayName = file.name.replace(/\.(md|txt)$/i, '').replace(/[-_]/g, ' ');
            newDocName.value = displayName;
        }
    } else {
        selectedFileName.textContent = 'No file selected';
        selectedFileName.style.color = 'var(--text-secondary)';
    }
});

// Open modal
manageDocsBtn.addEventListener('click', () => {
    docModal.classList.add('active');
    loadDocuments();
});

// Close modal
closeModal.addEventListener('click', () => {
    docModal.classList.remove('active');
});

// Close modal on outside click
docModal.addEventListener('click', (e) => {
    if (e.target === docModal) {
        docModal.classList.remove('active');
    }
});

// Load documents
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
        docList.innerHTML = '<p style="color: #ff4444;">Failed to load documents</p>';
    }
}

// Render documents in modal
function renderDocuments(documents) {
    if (documents.length === 0) {
        docList.innerHTML = '<p style="color: var(--text-secondary);">No documents loaded</p>';
        return;
    }
    
    docList.innerHTML = documents.map(doc => `
        <div class="doc-item ${doc.is_default ? 'default' : ''}">
            <div class="doc-info">
                <h4>
                    ${doc.name}
                    ${doc.is_default ? '<span class="doc-badge">DEFAULT</span>' : ''}
                </h4>
                <p>${doc.filename}</p>
            </div>
            <button 
                class="doc-remove-btn" 
                onclick="removeDocument('${doc.filename}')"
                ${doc.is_default ? 'disabled' : ''}
            >
                ${doc.is_default ? 'Protected' : 'Remove'}
            </button>
        </div>
    `).join('');
}

// Update document status in header
function updateDocumentStatus(documents) {
    docCount.textContent = `${documents.length} document${documents.length !== 1 ? 's' : ''} loaded`;
    
    // Update pills
    docPills.innerHTML = documents.map(doc => 
        `<span class="doc-pill">${doc.name}</span>`
    ).join('');
}

// Add document
addDocBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const name = newDocName.value.trim();
    
    if (!file) {
        alert('Please select a file');
        return;
    }
    
    if (!name) {
        alert('Please enter a display name');
        return;
    }
    
    try {
        addDocBtn.disabled = true;
        addDocBtn.textContent = 'Adding...';
        
        // Read file content
        const content = await file.text();
        
        // Save file to backend directory (we'll send filename and content)
        const response = await fetch(`${BACKEND_URL}/documents/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: file.name,
                name: name,
                content: content
            })
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
});

// Remove document
async function removeDocument(filename) {
    if (!confirm(`Are you sure you want to remove ${filename}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/documents/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: filename
            })
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

// Reset documents
resetDocsBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset to default documents only? This will remove all custom documents.')) {
        return;
    }
    
    try {
        resetDocsBtn.disabled = true;
        resetDocsBtn.textContent = 'Resetting...';
        
        const response = await fetch(`${BACKEND_URL}/documents/reset`, {
            method: 'POST'
        });
        
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
});

// Load documents on page load
window.addEventListener('load', () => {
    loadDocuments();
});
