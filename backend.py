"""
GlobalFreight Smart Shipment Assistant - Backend
Production-ready RAG system using LangChain + ChromaDB
Version: 1.0 - Optimized
"""

__version__ = "1.0-optimized"

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import chromadb
from functools import lru_cache
import hashlib

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration - Azure OpenAI
AZURE_OPENAI_API_KEY = os.getenv('AZURE_OPENAI_API_KEY')
AZURE_OPENAI_ENDPOINT = os.getenv('AZURE_OPENAI_ENDPOINT', 'https://ai-fortnight.cognitiveservices.azure.com/')
AZURE_OPENAI_DEPLOYMENT = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-5-nano')
AZURE_OPENAI_API_VERSION = os.getenv('AZURE_OPENAI_API_VERSION', '2024-12-01-preview')

if not AZURE_OPENAI_API_KEY:
    raise ValueError("AZURE_OPENAI_API_KEY not found in environment variables. Please set it in .env file")

# Initialize embeddings and LLM with Azure OpenAI
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings

# Use local embeddings since Azure doesn't have an embedding deployment configured
print("Using local HuggingFace embeddings...")
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

llm = AzureChatOpenAI(
    azure_deployment=AZURE_OPENAI_DEPLOYMENT,
    openai_api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    api_key=AZURE_OPENAI_API_KEY,
    temperature=1,  # gpt-5-nano only supports temperature=1
    request_timeout=30,  # 30 second timeout
    max_retries=2  # Reduce retries for faster failure
)

# Global vectorstore
vectorstore = None

# Simple in-memory cache for query results
query_cache = {}

def load_documents():
    """Load the three policy documents"""
    documents = []
    doc_files = [
        ('DOC1-carrier-sla-agreement.md', 'Carrier SLA Agreement'),
        ('DOC2-customs-tariff-reference.md', 'Customs Tariff Reference'),
        ('DOC3-shipment-delay-policy.md', 'Shipment Delay Policy')
    ]
    
    for filename, doc_name in doc_files:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
                documents.append({
                    'content': content,
                    'metadata': {
                        'source': filename,
                        'document_name': doc_name
                    }
                })
        except FileNotFoundError:
            print(f"Warning: {filename} not found")
    
    return documents

def create_vectorstore():
    """Create ChromaDB vectorstore from documents"""
    print("Loading documents...")
    documents = load_documents()
    
    if not documents:
        raise ValueError("No documents loaded. Please ensure DOC1, DOC2, DOC3 files exist.")
    
    # Split documents into chunks - OPTIMIZED: smaller overlap for faster processing
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,  # Reduced from 1000
        chunk_overlap=100,  # Reduced from 200
        length_function=len,
    )
    
    texts = []
    metadatas = []
    
    for doc in documents:
        chunks = text_splitter.split_text(doc['content'])
        texts.extend(chunks)
        metadatas.extend([doc['metadata']] * len(chunks))
    
    print(f"Created {len(texts)} chunks from {len(documents)} documents")
    
    # Create vectorstore
    vectorstore = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        collection_name="globalfreight_docs"
    )
    
    print("Vectorstore created successfully")
    return vectorstore

def create_qa_chain(vectorstore):
    """Create the QA chain with custom prompt using LCEL"""
    
    # Custom prompt template for grounded responses - OPTIMIZED: more concise
    template = """You are the GlobalFreight Shipment Assistant. Answer ONLY from the context below.

RULES:
1. Answer ONLY from provided context
2. If question is out-of-scope (weather, general knowledge, etc.), respond: "I can only answer questions about GlobalFreight policies. Your question is outside this scope."
3. Be precise and concise
4. Never hallucinate - if unsure, say so

Context:
{context}

Question: {question}

Answer:"""

    prompt = ChatPromptTemplate.from_template(template)
    
    # Create retriever - OPTIMIZED: fewer chunks for faster processing
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 3}  # Reduced from 6 to 3 for faster processing
    )
    
    # Format documents function
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
    
    # Create RAG chain using LCEL
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return rag_chain, retriever

# Initialize on startup
print("Initializing GlobalFreight Smart Assistant...")
vectorstore = create_vectorstore()
qa_chain, retriever = create_qa_chain(vectorstore)
print("Assistant ready!")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': __version__,
        'documents_loaded': 3,
        'vectorstore_initialized': vectorstore is not None
    })

@app.route('/query', methods=['POST'])
def query():
    """Main query endpoint with caching"""
    try:
        data = request.json
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # Create cache key from question
        cache_key = hashlib.md5(question.lower().encode()).hexdigest()
        
        # Check cache first
        if cache_key in query_cache:
            print(f"Cache hit for: {question[:50]}...")
            cached_result = query_cache[cache_key]
            cached_result['cached'] = True
            return jsonify(cached_result)
        
        # Get answer from QA chain
        answer = qa_chain.invoke(question)
        
        # Get source documents
        source_docs = retriever.invoke(question)
        
        # Extract source documents
        sources = []
        for doc in source_docs:
            sources.append({
                'document': doc.metadata.get('document_name', 'Unknown'),
                'source': doc.metadata.get('source', 'Unknown')
            })
        
        # Remove duplicates from sources
        unique_sources = []
        seen = set()
        for source in sources:
            source_key = source['document']
            if source_key not in seen:
                seen.add(source_key)
                unique_sources.append(source)
        
        result = {
            'answer': answer,
            'sources': unique_sources[:3],  # Top 3 source documents
            'cached': False
        }
        
        # Cache the result (limit cache size to 100 entries)
        if len(query_cache) < 100:
            query_cache[cache_key] = {
                'answer': answer,
                'sources': unique_sources[:3]
            }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/sample-queries', methods=['GET'])
def sample_queries():
    """Return sample queries from README"""
    return jsonify({
        'queries': [
            "What's the transit time from Mumbai to Hamburg for a Platinum shipment, including customs?",
            "A Gold customer's shipment is 15 hours late. What compensation applies and what must we do?",
            "Can our agent autonomously cancel 5 shipments in a row?",
            "What is the HS code and import duty for mobile phones?",
            "What is the weather in Mumbai today?"
        ]
    })

@app.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear the query cache"""
    global query_cache
    cache_size = len(query_cache)
    query_cache.clear()
    return jsonify({
        'success': True,
        'message': f'Cleared {cache_size} cached queries'
    })

@app.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Get cache statistics"""
    return jsonify({
        'cached_queries': len(query_cache),
        'max_cache_size': 100
    })

@app.route('/documents', methods=['GET'])
def get_documents():
    """Get list of loaded documents"""
    global vectorstore
    if vectorstore is None:
        return jsonify({'documents': []})
    
    # Get unique documents from vectorstore metadata
    try:
        collection = vectorstore._collection
        all_metadata = collection.get()['metadatas']
        
        # Extract unique documents
        docs = {}
        for meta in all_metadata:
            source = meta.get('source', 'Unknown')
            doc_name = meta.get('document_name', 'Unknown')
            if source not in docs:
                docs[source] = {
                    'filename': source,
                    'name': doc_name,
                    'is_default': source in ['DOC1-carrier-sla-agreement.md', 'DOC2-customs-tariff-reference.md', 'DOC3-shipment-delay-policy.md']
                }
        
        return jsonify({'documents': list(docs.values())})
    except Exception as e:
        print(f"Error getting documents: {str(e)}")
        return jsonify({'error': 'Failed to get documents'}), 500

@app.route('/documents/add', methods=['POST'])
def add_document():
    """Add a new document to the vectorstore"""
    global vectorstore, qa_chain, retriever
    
    try:
        data = request.json
        filename = data.get('filename', '').strip()
        doc_name = data.get('name', '').strip()
        content = data.get('content', '').strip()
        
        if not filename:
            return jsonify({'error': 'Filename is required'}), 400
        
        if not doc_name:
            doc_name = filename
        
        if not content:
            return jsonify({'error': 'File content is required'}), 400
        
        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            length_function=len,
        )
        chunks = text_splitter.split_text(content)
        metadatas = [{
            'source': filename,
            'document_name': doc_name
        }] * len(chunks)
        
        # Add to vectorstore
        vectorstore.add_texts(texts=chunks, metadatas=metadatas)
        
        # Clear cache when documents change
        query_cache.clear()
        
        print(f"Added {len(chunks)} chunks from {filename}")
        
        return jsonify({
            'success': True,
            'message': f'Added {filename} with {len(chunks)} chunks',
            'chunks_added': len(chunks)
        })
    
    except Exception as e:
        print(f"Error adding document: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to add document'}), 500

@app.route('/documents/remove', methods=['POST'])
def remove_document():
    """Remove a document from the vectorstore"""
    global vectorstore, qa_chain, retriever
    
    try:
        data = request.json
        filename = data.get('filename', '').strip()
        
        if not filename:
            return jsonify({'error': 'Filename is required'}), 400
        
        # Check if it's a default document
        default_docs = ['DOC1-carrier-sla-agreement.md', 'DOC2-customs-tariff-reference.md', 'DOC3-shipment-delay-policy.md']
        if filename in default_docs:
            return jsonify({'error': 'Cannot remove default documents'}), 400
        
        # Get all documents with this source
        collection = vectorstore._collection
        results = collection.get(where={"source": filename})
        
        if not results['ids']:
            return jsonify({'error': f'Document {filename} not found'}), 404
        
        # Delete the documents
        collection.delete(ids=results['ids'])
        
        # Clear cache when documents change
        query_cache.clear()
        
        print(f"Removed {len(results['ids'])} chunks from {filename}")
        
        return jsonify({
            'success': True,
            'message': f'Removed {filename}',
            'chunks_removed': len(results['ids'])
        })
    
    except Exception as e:
        print(f"Error removing document: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to remove document'}), 500

@app.route('/documents/reset', methods=['POST'])
def reset_documents():
    """Reset to default documents only"""
    global vectorstore, qa_chain, retriever
    
    try:
        print("Resetting to default documents...")
        vectorstore = create_vectorstore()
        qa_chain, retriever = create_qa_chain(vectorstore)
        
        # Clear cache when documents change
        query_cache.clear()
        
        print("Reset complete!")
        
        return jsonify({
            'success': True,
            'message': 'Reset to default documents'
        })
    
    except Exception as e:
        print(f"Error resetting documents: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to reset documents'}), 500

if __name__ == '__main__':
    print(f"\n{'='*60}")
    print(f"GlobalFreight Smart Shipment Assistant v{__version__}")
    print(f"{'='*60}\n")
    app.run(host='0.0.0.0', port=5001, debug=False)
