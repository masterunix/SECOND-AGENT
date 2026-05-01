'use client';

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function Header() {
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');
  const [statusText, setStatusText] = useState('Connecting...');

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      
      if (data.status === 'healthy') {
        const version = data.version || '1.0';
        const tools = data.tools_available ? ` · ${data.tools_available} tools` : '';
        setStatus('online');
        setStatusText(`Online · v${version}${tools}`);
      } else {
        setStatus('offline');
        setStatusText('Backend Error');
      }
    } catch (error) {
      setStatus('offline');
      setStatusText('Offline');
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-light border-b border-white/10"
    >
      <div className="max-w-[1600px] mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center font-bold text-xl text-black shadow-neon-green">
              GF
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                GlobalFreight AI Platform
              </h1>
              <p className="text-sm text-white/60">AI-Fortnight 2026</p>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div 
            className="flex items-center gap-2 px-4 py-2 glass-light rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{
                scale: status === 'online' ? [1, 1.2, 1] : 1,
                opacity: status === 'online' ? [1, 0.6, 1] : 0.5,
              }}
              transition={{
                duration: 2,
                repeat: status === 'online' ? Infinity : 0,
                ease: "easeInOut",
              }}
              className={`w-2 h-2 rounded-full ${
                status === 'online' ? 'bg-neon-green shadow-neon-green' : 'bg-red-500'
              }`}
            />
            <span className={`text-sm font-medium ${
              status === 'online' ? 'text-neon-green' : 'text-red-500'
            }`}>
              {statusText}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
