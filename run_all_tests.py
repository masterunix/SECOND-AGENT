#!/usr/bin/env python3
"""
Run all tests for GlobalFreight Smart Assistant
"""

import subprocess
import sys
import time

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def run_test(script_name, description):
    """Run a test script and return success status"""
    print_header(description)
    print(f"\nRunning: {script_name}\n")
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=False,
            text=True
        )
        
        success = result.returncode == 0
        
        if success:
            print(f"\n✅ {description} - PASSED")
        else:
            print(f"\n❌ {description} - FAILED")
        
        return success
    except Exception as e:
        print(f"\n❌ {description} - ERROR: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("  GlobalFreight Smart Assistant - Complete Test Suite")
    print("=" * 70)
    print("\nThis will run all tests to verify the application is working correctly.")
    print("Make sure the backend is running on http://localhost:5001")
    print("\nPress Ctrl+C to cancel, or Enter to continue...")
    
    try:
        input()
    except KeyboardInterrupt:
        print("\n\nTests cancelled.")
        return
    
    results = {}
    
    # Test 1: Platform Compatibility
    results['Platform Compatibility'] = run_test(
        'test_platform_compatibility.py',
        'Test 1: Platform Compatibility'
    )
    
    time.sleep(1)
    
    # Test 2: File Upload (requires backend)
    print("\n" + "=" * 70)
    print("  Test 2: File Upload Functionality")
    print("=" * 70)
    print("\n⚠️  This test requires the backend to be running.")
    print("   If the backend is not running, this test will fail.")
    print("\nContinue? (y/n): ", end='')
    
    try:
        response = input().lower()
        if response == 'y':
            results['File Upload'] = run_test(
                'test_file_upload.py',
                'Test 2: File Upload Functionality'
            )
        else:
            print("Skipping file upload test.")
            results['File Upload'] = None
    except KeyboardInterrupt:
        print("\n\nSkipping file upload test.")
        results['File Upload'] = None
    
    time.sleep(1)
    
    # Test 3: Response Time (requires backend)
    if results.get('File Upload') is not False:
        print("\n" + "=" * 70)
        print("  Test 3: Response Time Performance")
        print("=" * 70)
        print("\n⚠️  This test will take 1-2 minutes to complete.")
        print("   It tests both uncached and cached query performance.")
        print("\nContinue? (y/n): ", end='')
        
        try:
            response = input().lower()
            if response == 'y':
                results['Response Time'] = run_test(
                    'test_response_time.py',
                    'Test 3: Response Time Performance'
                )
            else:
                print("Skipping response time test.")
                results['Response Time'] = None
        except KeyboardInterrupt:
            print("\n\nSkipping response time test.")
            results['Response Time'] = None
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    total = len(results)
    
    print("\nResults:")
    for test_name, result in results.items():
        if result is True:
            status = "✅ PASS"
        elif result is False:
            status = "❌ FAIL"
        else:
            status = "⊘  SKIP"
        print(f"  {status} - {test_name}")
    
    print("\n" + "=" * 70)
    print(f"  Total: {passed} passed, {failed} failed, {skipped} skipped")
    print("=" * 70)
    
    if failed == 0 and passed > 0:
        print("\n🎉 All tests passed! The application is ready to use.")
        print("\nTo start the application:")
        if sys.platform == "win32":
            print("  run.bat")
        else:
            print("  chmod +x run.sh && ./run.sh")
    elif failed > 0:
        print("\n⚠️  Some tests failed. Please review the errors above.")
    else:
        print("\n⚠️  No tests were run. Please ensure the backend is running.")
    
    return failed == 0

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.")
        sys.exit(1)
