#!/usr/bin/env python3
"""Quick test to see if backend is running the optimized version"""

import requests
import json

try:
    # Test health endpoint
    response = requests.get('http://localhost:5001/health', timeout=5)
    if response.status_code == 200:
        data = response.json()
        print("✓ Backend is responding")
        print(f"  Version: {data.get('version')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Tools: {data.get('tools_available')}")
        print()
        
        # Test simple endpoint
        print("Testing simple endpoint...")
        response = requests.post(
            'http://localhost:5001/test-simple',
            json={'event_id': 'VERSION-TEST'},
            timeout=5
        )
        
        if response.status_code == 200:
            print("✓ Simple endpoint works")
            print()
            print("Backend is running but may need restart to apply optimizations.")
            print()
            print("To restart with optimizations:")
            print("  1. Go to the terminal running backend_v2.py")
            print("  2. Press Ctrl+C to stop it")
            print("  3. Run: python3 backend_v2.py")
        else:
            print("✗ Simple endpoint failed")
    else:
        print(f"✗ Backend returned status {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("✗ Backend is NOT running on port 5001")
    print()
    print("To start the backend:")
    print("  python3 backend_v2.py")
except Exception as e:
    print(f"✗ Error: {e}")
