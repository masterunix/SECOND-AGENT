# Document Management Feature

## Overview
The GlobalFreight Smart Assistant now supports dynamic document management, allowing you to add or remove documents from the knowledge base while the application is running.

## Features

### 1. **View Documents**
- Click the "Manage Documents" button in the header
- See all loaded documents with their names and filenames
- Default documents are marked with a "DEFAULT" badge

### 2. **Add Documents**
- Enter the filename (e.g., `DOC4-new-policy.md`)
- Enter a display name (e.g., `New Policy`)
- Click "Add Document"
- The document will be chunked and added to the vector store
- The system will show how many chunks were added

### 3. **Remove Documents**
- Click "Remove" next to any non-default document
- Confirm the removal
- The document and all its chunks will be removed from the vector store
- **Note**: Default documents (DOC1, DOC2, DOC3) cannot be removed

### 4. **Reset to Defaults**
- Click "Reset to Default Documents"
- This removes all custom documents and reloads only the three default documents:
  - DOC1 — Carrier SLA Agreement
  - DOC2 — Customs Tariff Reference
  - DOC3 — Shipment Delay Policy

## Default Documents
The following three documents are loaded by default and cannot be removed:
1. **DOC1-carrier-sla-agreement.md** - Carrier SLA Agreement
2. **DOC2-customs-tariff-reference.md** - Customs Tariff Reference
3. **DOC3-shipment-delay-policy.md** - Shipment Delay Policy

## API Endpoints

### GET /documents
Returns list of all loaded documents with metadata.

**Response:**
```json
{
  "documents": [
    {
      "filename": "DOC1-carrier-sla-agreement.md",
      "name": "Carrier SLA Agreement",
      "is_default": true
    }
  ]
}
```

### POST /documents/add
Add a new document to the knowledge base.

**Request:**
```json
{
  "filename": "DOC4-new-policy.md",
  "name": "New Policy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added DOC4-new-policy.md with 5 chunks",
  "chunks_added": 5
}
```

### POST /documents/remove
Remove a document from the knowledge base.

**Request:**
```json
{
  "filename": "DOC4-new-policy.md"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Removed DOC4-new-policy.md",
  "chunks_removed": 5
}
```

**Error (default document):**
```json
{
  "error": "Cannot remove default documents"
}
```

### POST /documents/reset
Reset to default documents only.

**Response:**
```json
{
  "success": true,
  "message": "Reset to default documents"
}
```

## Usage Example

### Via UI:
1. Open the application in your browser
2. Click "Manage Documents" button
3. Use the interface to add/remove documents

### Via API:
```bash
# List documents
curl http://localhost:5001/documents

# Add a document
curl -X POST http://localhost:5001/documents/add \
  -H "Content-Type: application/json" \
  -d '{"filename": "DOC4-test.md", "name": "Test Policy"}'

# Remove a document
curl -X POST http://localhost:5001/documents/remove \
  -H "Content-Type: application/json" \
  -d '{"filename": "DOC4-test.md"}'

# Reset to defaults
curl -X POST http://localhost:5001/documents/reset
```

## Notes
- Documents must be in Markdown format (`.md`)
- Documents must exist in the same directory as the backend
- The system automatically chunks documents into 1000-character segments with 200-character overlap
- Changes take effect immediately - no restart required
- The AI will use all loaded documents when answering questions
