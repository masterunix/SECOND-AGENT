'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText } from 'lucide-react';
import GlassCard from '../GlassCard';
import ChatContainer from './ChatContainer';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

const SAMPLE_QUERIES = [
  "What's the transit time from Mumbai to Hamburg for a Platinum shipment, including customs?",
  "A Gold customer's shipment is 15 hours late. What compensation applies and what must we do?",
  "Can our agent autonomously cancel 5 shipments in a row?",
  "What is the HS code and import duty for mobile phones?",
  "What is the weather in Mumbai today?",
];

export default function Level1() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: "Hello! I'm the GlobalFreight Shipment Assistant. I answer questions grounded strictly in your policy documents — SLA tiers, customs tariffs, and delay handling rules.\n\nTry one of the sample queries below, or type your own.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  const handleSend = async (query?: string) => {
    const message = query || input.trim();
    if (!message) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message }),
      });

      if (!response.ok) throw new Error('Backend request failed');

      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.answer,
        sources: data.sources,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please ensure the backend is running.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      {/* Document Status */}
      <GlassCard>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {['DOC1 — Carrier SLA', 'DOC2 — Customs Tariff', 'DOC3 — Delay Policy'].map((doc) => (
              <span
                key={doc}
                className="px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm font-medium"
              >
                {doc}
              </span>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold shadow-neon-green flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Manage Documents
          </motion.button>
        </div>
      </GlassCard>

      {/* Chat */}
      <ChatContainer messages={messages} />

      {/* Sample Queries */}
      <GlassCard>
        <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">Sample queries:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SAMPLE_QUERIES.map((query, index) => (
            <motion.button
              key={index}
              onClick={() => handleSend(query)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 glass-light rounded-xl text-left text-sm text-white/80 hover:text-white hover:border-neon-green/50 border border-white/5 transition-all"
            >
              {query}
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Input */}
      <GlassCard>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about transit times, compensation, HS codes, or delay policies..."
            className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-neon-green/50 focus:shadow-neon-green transition-all"
            disabled={loading}
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold shadow-neon-green flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Send
          </motion.button>
        </div>
      </GlassCard>
    </div>
  );
}
