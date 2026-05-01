# Test Policy Document

## Purpose
This is a test document to verify the file upload functionality works correctly.

## Test Policy Rules

### Rule 1: Response Time
All queries must be answered within 30 seconds on first request and under 1 second for cached queries.

### Rule 2: Document Management
- Users can add custom documents via file picker
- Default documents cannot be removed
- Maximum 100 documents can be loaded

### Rule 3: Cache Management
- Cache stores up to 100 queries
- Cache is cleared when documents are modified
- Cached responses are marked with cached: true flag

## Test Data
- Test ID: DOC4-001
- Version: 1.0
- Status: Active
