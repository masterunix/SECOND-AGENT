'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import GlassCard from '../GlassCard';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

interface ChatContainerProps {
  messages: Message[];
}

export default function ChatContainer({ messages }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <GlassCard className="min-h-[400px] max-h-[600px] overflow-y-auto" hover={false}>
      <div ref={containerRef} className="space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4"
            >
              {/* Avatar */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0
                ${message.type === 'assistant' 
                  ? 'bg-gradient-to-br from-neon-green to-neon-blue text-black shadow-neon-green' 
                  : 'glass-light text-white border border-white/10'
                }
              `}>
                {message.type === 'assistant' ? 'GF' : 'You'}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div 
                  className="text-white/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}

function formatContent(text: string): string {
  // Bold text
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  
  // Split into paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  const formatted = paragraphs.map(p => {
    // Lists
    if (p.includes('\n- ') || p.includes('\n• ')) {
      const items = p.split('\n').filter(item => item.trim());
      const listItems = items.map(item => {
        const cleaned = item.replace(/^[-•]\s*/, '');
        return cleaned ? `<li class="ml-4">${cleaned}</li>` : '';
      }).join('');
      return `<ul class="list-disc space-y-1">${listItems}</ul>`;
    }
    
    // Numbered lists
    if (/^\d+\./.test(p)) {
      const items = p.split('\n').filter(item => item.trim());
      const listItems = items.map(item => {
        const cleaned = item.replace(/^\d+\.\s*/, '');
        return cleaned ? `<li class="ml-4">${cleaned}</li>` : '';
      }).join('');
      return `<ol class="list-decimal space-y-1">${listItems}</ol>`;
    }
    
    return `<p class="mb-2">${p}</p>`;
  }).join('');
  
  return formatted;
}
