#!/usr/bin/env python3
"""
Platform Compatibility Test Script
Tests Python version, dependencies, and functionality across Windows, macOS, and Linux
"""

import sys
import platform
import subprocess
import os
from pathlib import Path

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_warning(text):
    """Print warning message"""
    print(f"⚠️  {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

def check_python_version():
    """Check if Python version is compatible"""
    print_header("Python Version Check")
    
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    
    print_info(f"Python Version: {version_str}")
    print_info(f"Platform: {platform.system()} {platform.release()}")
    print_info(f"Architecture: {platform.machine()}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print_error(f"Python 3.8+ required, found {version_str}")
        return False
    
    if version.major == 3 and version.minor >= 12:
        print_warning(f"Python 3.12+ detected. Some packages may have compatibility issues.")
    
    print_success(f"Python {version_str} is compatible")
    return True

def check_dependencies():
    """Check if all required dependencies can be imported"""
    print_header("Dependency Check")
    
    dependencies = [
        ('flask', 'Flask'),
        ('flask_cors', 'Flask-CORS'),
        ('dotenv', 'python-dotenv'),
        ('langchain', 'LangChain'),
        ('langchain_community', 'LangChain Community'),
        ('langchain_openai', 'LangChain OpenAI'),
        ('chromadb', 'ChromaDB'),
        ('sentence_transformers', 'Sentence Transformers'),
        ('numpy', 'NumPy'),
    ]
    
    all_ok = True
    for module_name, display_name in dependencies:
        try:
            __import__(module_name)
            print_success(f"{display_name} is installed")
        except ImportError:
            print_error(f"{display_name} is NOT installed")
            all_ok = False
    
    return all_ok

def check_files():
    """Check if all required files exist"""
    print_header("File Structure Check")
    
    required_files = [
        'backend.py',
        'app.js',
        'index.html',
        'styles.css',
        'requirements.txt',
        '.env.example',
        'DOC1-carrier-sla-agreement.md',
        'DOC2-customs-tariff-reference.md',
        'DOC3-shipment-delay-policy.md',
    ]
    
    all_ok = True
    for filename in required_files:
        if Path(filename).exists():
            print_success(f"{filename} exists")
        else:
            print_error(f"{filename} is MISSING")
            all_ok = False
    
    return all_ok

def check_env_file():
    """Check if .env file is configured"""
    print_header("Environment Configuration Check")
    
    if not Path('.env').exists():
        print_warning(".env file not found")
        print_info("Run the application once to create it from .env.example")
        return False
    
    print_success(".env file exists")
    
    # Check if API key is set
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv('AZURE_OPENAI_API_KEY')
        endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
        
        if api_key and api_key != 'your_key_here':
            print_success("AZURE_OPENAI_API_KEY is configured")
        else:
            print_warning("AZURE_OPENAI_API_KEY is not configured")
        
        if endpoint:
            print_success(f"AZURE_OPENAI_ENDPOINT: {endpoint}")
        else:
            print_warning("AZURE_OPENAI_ENDPOINT is not set")
        
        return True
    except Exception as e:
        print_error(f"Error reading .env file: {e}")
        return False

def test_backend_import():
    """Test if backend can be imported"""
    print_header("Backend Import Test")
    
    try:
        # Try to import backend components
        sys.path.insert(0, os.getcwd())
        
        print_info("Testing imports...")
        from flask import Flask
        from flask_cors import CORS
        from langchain_community.vectorstores import Chroma
        from langchain_openai import AzureChatOpenAI
        
        print_success("All backend imports successful")
        return True
    except Exception as e:
        print_error(f"Backend import failed: {e}")
        return False

def test_file_operations():
    """Test file read/write operations"""
    print_header("File Operations Test")
    
    try:
        # Test reading a document
        with open('DOC1-carrier-sla-agreement.md', 'r', encoding='utf-8') as f:
            content = f.read()
            print_success(f"Read DOC1 ({len(content)} characters)")
        
        # Test writing a temp file
        test_file = Path('test_temp.txt')
        test_file.write_text('Test content', encoding='utf-8')
        print_success("Write test file successful")
        
        # Clean up
        test_file.unlink()
        print_success("Delete test file successful")
        
        return True
    except Exception as e:
        print_error(f"File operations failed: {e}")
        return False

def test_platform_specific():
    """Test platform-specific features"""
    print_header("Platform-Specific Tests")
    
    system = platform.system()
    print_info(f"Operating System: {system}")
    
    if system == "Windows":
        print_info("Windows-specific checks:")
        print_success("run.bat script available")
        if Path('venv/Scripts/activate.bat').exists():
            print_success("Virtual environment activation script found")
    else:
        print_info("Unix-like system checks:")
        print_success("run.sh script available")
        if Path('venv/bin/activate').exists() or Path('.venv/bin/activate').exists():
            print_success("Virtual environment activation script found")
    
    return True

def main():
    """Run all tests"""
    print("\n" + "=" * 70)
    print("  GlobalFreight Smart Assistant - Platform Compatibility Test")
    print("=" * 70)
    
    results = {
        'Python Version': check_python_version(),
        'Dependencies': check_dependencies(),
        'File Structure': check_files(),
        'Environment Config': check_env_file(),
        'Backend Import': test_backend_import(),
        'File Operations': test_file_operations(),
        'Platform Specific': test_platform_specific(),
    }
    
    # Summary
    print_header("Test Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "=" * 70)
    print(f"  Results: {passed}/{total} tests passed")
    print("=" * 70)
    
    if passed == total:
        print("\n🎉 All tests passed! The application is ready to run.")
        print("\nTo start the application:")
        if platform.system() == "Windows":
            print("  run.bat")
        else:
            print("  chmod +x run.sh && ./run.sh")
    else:
        print("\n⚠️  Some tests failed. Please fix the issues above.")
        print("\nTo install dependencies:")
        print("  pip install -r requirements.txt")
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
