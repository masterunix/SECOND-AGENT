import requests
import time
import json

# Test queries
queries = [
    "What is the transit time from Mumbai to Hamburg for a Platinum shipment?",
    "A Gold customer's shipment is 15 hours late. What compensation applies?",
    "Can our agent autonomously cancel 5 shipments in a row?",
    "What is the HS code and import duty for mobile phones?",
    "What is the weather in Mumbai today?"
]

print("=" * 70)
print("GlobalFreight Smart Assistant - Response Time Test")
print("=" * 70)

# Test health endpoint
print("\n1. Testing Health Endpoint...")
start = time.time()
response = requests.get("http://localhost:5001/health")
health_time = time.time() - start
print(f"   Status: {response.status_code}")
print(f"   Response Time: {health_time:.3f} seconds")
print(f"   Response: {response.json()}")

# Test query endpoint with multiple queries
print("\n2. Testing Query Endpoint...")
print("-" * 70)

total_time = 0
for i, query in enumerate(queries, 1):
    print(f"\nQuery {i}: {query[:60]}...")
    
    start = time.time()
    response = requests.post(
        "http://localhost:5001/query",
        json={"question": query},
        headers={"Content-Type": "application/json"}
    )
    query_time = time.time() - start
    total_time += query_time
    
    print(f"   Status: {response.status_code}")
    print(f"   Response Time: {query_time:.3f} seconds")
    
    if response.status_code == 200:
        data = response.json()
        answer = data.get('answer', 'No answer')
        print(f"   Answer: {answer[:100]}...")
        if 'sources' in data:
            print(f"   Sources: {len(data['sources'])} document(s)")
    else:
        print(f"   Error: {response.text}")

# Summary
print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"Total Queries: {len(queries)}")
print(f"Total Time: {total_time:.3f} seconds")
print(f"Average Response Time: {total_time/len(queries):.3f} seconds")
print(f"Health Check Time: {health_time:.3f} seconds")
print("=" * 70)
