#!/usr/bin/env python3
"""
Test file upload functionality
"""

import requests
import time
import json

BACKEND_URL = 'http://localhost:5001'

def test_file_upload():
    """Test adding a document via file upload"""
    print("=" * 70)
    print("Testing File Upload Functionality")
    print("=" * 70)
    
    # Read the test document
    print("\n1. Reading test document...")
    with open('DOC4-test-policy.md', 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"   ✅ Read {len(content)} characters from DOC4-test-policy.md")
    
    # Check initial document count
    print("\n2. Checking initial document count...")
    response = requests.get(f"{BACKEND_URL}/documents")
    initial_docs = response.json()['documents']
    print(f"   ✅ Currently {len(initial_docs)} documents loaded:")
    for doc in initial_docs:
        print(f"      - {doc['name']}")
    
    # Upload the document
    print("\n3. Uploading DOC4-test-policy.md...")
    response = requests.post(
        f"{BACKEND_URL}/documents/add",
        json={
            "filename": "DOC4-test-policy.md",
            "name": "Test Policy",
            "content": content
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Upload successful!")
        print(f"   ✅ Added {data['chunks_added']} chunks")
    else:
        print(f"   ❌ Upload failed: {response.json()}")
        return False
    
    # Verify document was added
    print("\n4. Verifying document was added...")
    response = requests.get(f"{BACKEND_URL}/documents")
    new_docs = response.json()['documents']
    print(f"   ✅ Now {len(new_docs)} documents loaded:")
    for doc in new_docs:
        marker = "🆕" if doc['filename'] == "DOC4-test-policy.md" else "  "
        print(f"      {marker} {doc['name']}")
    
    # Test querying the new document
    print("\n5. Testing query against new document...")
    test_query = "What is the response time requirement?"
    
    start = time.time()
    response = requests.post(
        f"{BACKEND_URL}/query",
        json={"question": test_query}
    )
    query_time = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Query successful (took {query_time:.3f}s)")
        print(f"   📝 Answer: {data['answer'][:150]}...")
        print(f"   📚 Sources: {len(data['sources'])} document(s)")
        for source in data['sources']:
            print(f"      - {source['document']}")
    else:
        print(f"   ❌ Query failed: {response.json()}")
        return False
    
    # Test cache
    print("\n6. Testing cache (same query again)...")
    start = time.time()
    response = requests.post(
        f"{BACKEND_URL}/query",
        json={"question": test_query}
    )
    cache_time = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        cached = data.get('cached', False)
        print(f"   ✅ Query successful (took {cache_time:.3f}s)")
        print(f"   ⚡ Cached: {cached}")
        print(f"   🚀 Speed improvement: {query_time/cache_time:.1f}x faster")
    
    # Remove the test document
    print("\n7. Removing test document...")
    response = requests.post(
        f"{BACKEND_URL}/documents/remove",
        json={"filename": "DOC4-test-policy.md"}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Removal successful!")
        print(f"   ✅ Removed {data['chunks_removed']} chunks")
    else:
        print(f"   ❌ Removal failed: {response.json()}")
        return False
    
    # Verify document was removed
    print("\n8. Verifying document was removed...")
    response = requests.get(f"{BACKEND_URL}/documents")
    final_docs = response.json()['documents']
    print(f"   ✅ Back to {len(final_docs)} documents:")
    for doc in final_docs:
        print(f"      - {doc['name']}")
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ All file upload tests passed!")
    print("=" * 70)
    print(f"\nResults:")
    print(f"  - Initial documents: {len(initial_docs)}")
    print(f"  - After upload: {len(new_docs)}")
    print(f"  - After removal: {len(final_docs)}")
    print(f"  - First query time: {query_time:.3f}s")
    print(f"  - Cached query time: {cache_time:.3f}s")
    print(f"  - Speed improvement: {query_time/cache_time:.1f}x")
    
    return True

if __name__ == '__main__':
    try:
        success = test_file_upload()
        exit(0 if success else 1)
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend at http://localhost:5001")
        print("   Please ensure the backend is running:")
        print("   python3 backend.py")
        exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
