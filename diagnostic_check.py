#!/usr/bin/env python3
"""
Diagnostic script to check if everything is working
"""

import sys
import os
import json
import requests
from datetime import datetime

def check_environment():
    """Check environment variables"""
    print("=" * 60)
    print("1. ENVIRONMENT VARIABLES")
    print("=" * 60)
    
    required_vars = [
        'AZURE_OPENAI_API_KEY',
        'AZURE_OPENAI_ENDPOINT',
        'AZURE_OPENAI_DEPLOYMENT',
        'AZURE_OPENAI_API_VERSION'
    ]
    
    from dotenv import load_dotenv
    load_dotenv()
    
    all_good = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'KEY' in var:
                print(f"✓ {var}: {'*' * 20} (hidden)")
            else:
                print(f"✓ {var}: {value}")
        else:
            print(f"✗ {var}: NOT SET")
            all_good = False
    
    return all_good

def check_files():
    """Check required files exist"""
    print("\n" + "=" * 60)
    print("2. REQUIRED FILES")
    print("=" * 60)
    
    required_files = [
        'backend_v2.py',
        'app_v2.js',
        'index_v2.html',
        'styles_v2.css',
        'Version2/event_stream.json',
        'DOC1-carrier-sla-agreement.md',
        'DOC2-customs-tariff-reference.md',
        'DOC3-shipment-delay-policy.md'
    ]
    
    all_good = True
    for file in required_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✓ {file} ({size:,} bytes)")
        else:
            print(f"✗ {file} MISSING")
            all_good = False
    
    return all_good

def check_backend():
    """Check backend is running and healthy"""
    print("\n" + "=" * 60)
    print("3. BACKEND SERVER")
    print("=" * 60)
    
    try:
        response = requests.get('http://localhost:5001/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Backend is running on port 5001")
            print(f"  Version: {data.get('version')}")
            print(f"  Status: {data.get('status')}")
            print(f"  Policies loaded: {data.get('policies_loaded')}")
            print(f"  Tools available: {data.get('tools_available')}")
            return True
        else:
            print(f"✗ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Backend is NOT running on port 5001")
        print("  Run: python3 backend_v2.py")
        return False
    except Exception as e:
        print(f"✗ Error checking backend: {e}")
        return False

def check_frontend():
    """Check frontend is accessible"""
    print("\n" + "=" * 60)
    print("4. FRONTEND SERVER")
    print("=" * 60)
    
    ports_to_check = [8000, 5500, 3000]
    
    for port in ports_to_check:
        try:
            response = requests.get(f'http://localhost:{port}/index_v2.html', timeout=2)
            if response.status_code == 200:
                print(f"✓ Frontend accessible at http://localhost:{port}/index_v2.html")
                return True
        except:
            pass
    
    print("✗ Frontend not accessible on common ports (8000, 5500, 3000)")
    print("  Run: python3 -m http.server 8000")
    return False

def test_backend_processing():
    """Test backend can process an event"""
    print("\n" + "=" * 60)
    print("5. BACKEND PROCESSING TEST")
    print("=" * 60)
    
    try:
        # Test simple endpoint first
        response = requests.post(
            'http://localhost:5001/test-simple',
            json={'event_id': 'DIAGNOSTIC-TEST'},
            timeout=5
        )
        
        if response.status_code == 200:
            print("✓ Backend test endpoint working")
            
            # Now test actual event processing
            print("\nTesting event processing (this may take 5-10 seconds)...")
            
            test_event = {
                "event_id": "TEST-001",
                "shipment_id": "SHP-TEST",
                "customer": "Test Customer",
                "customer_tier": "Gold",
                "origin": "LAX",
                "destination": "JFK",
                "carrier": "Test Carrier",
                "event_type": "delay",
                "description": "Test delay event",
                "delay_hours": 2,
                "reason_code": "TEST",
                "cargo_type": "General",
                "cargo_value_usd": 10000,
                "notes": "Test event",
                "timestamp": datetime.now().isoformat()
            }
            
            response = requests.post(
                'http://localhost:5001/process-event',
                json=test_event,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✓ Event processing working!")
                print(f"  Response: {result.get('agent_response', '')[:100]}...")
                return True
            else:
                print(f"✗ Event processing failed: {response.status_code}")
                print(f"  Error: {response.text}")
                return False
        else:
            print(f"✗ Backend test failed: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print("✗ Backend request timed out (may be processing, but too slow)")
        return False
    except Exception as e:
        print(f"✗ Error testing backend: {e}")
        return False

def check_dependencies():
    """Check Python dependencies"""
    print("\n" + "=" * 60)
    print("6. PYTHON DEPENDENCIES")
    print("=" * 60)
    
    required_packages = [
        'flask',
        'flask_cors',
        'langchain',
        'langchain_openai',
        'langchain_community',
        'chromadb',
        'sentence_transformers',
        'dotenv'
    ]
    
    all_good = True
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"✗ {package} NOT INSTALLED")
            all_good = False
    
    return all_good

def main():
    print("\n" + "=" * 60)
    print("GLOBALFREIGHT EXCEPTION HANDLER - DIAGNOSTIC CHECK")
    print("=" * 60 + "\n")
    
    results = {
        'environment': check_environment(),
        'files': check_files(),
        'dependencies': check_dependencies(),
        'backend': check_backend(),
        'frontend': check_frontend(),
        'processing': False
    }
    
    # Only test processing if backend is running
    if results['backend']:
        results['processing'] = test_backend_processing()
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for check, status in results.items():
        status_icon = "✓" if status else "✗"
        print(f"{status_icon} {check.upper()}: {'PASS' if status else 'FAIL'}")
    
    all_pass = all(results.values())
    
    print("\n" + "=" * 60)
    if all_pass:
        print("✓ ALL CHECKS PASSED - System is ready!")
        print("\nAccess the application at:")
        print("  http://localhost:8000/index_v2.html")
    else:
        print("✗ SOME CHECKS FAILED - See details above")
        print("\nCommon fixes:")
        print("  1. Install dependencies: pip install -r requirements.txt")
        print("  2. Set environment variables in .env file")
        print("  3. Start backend: python3 backend_v2.py")
        print("  4. Start frontend: python3 -m http.server 8000")
    print("=" * 60 + "\n")
    
    return 0 if all_pass else 1

if __name__ == '__main__':
    sys.exit(main())
