'use client';

import { motion } from 'framer-motion';
import { Play, FastForward, Zap } from 'lucide-react';
import GlassCard from '../GlassCard';

interface ControlPanelProps {
  loading: boolean;
  onProcess: () => void;
  hasMore: boolean;
}

export default function ControlPanel({ loading, onProcess, hasMore }: ControlPanelProps) {
  return (
    <>
      {/* Control Buttons */}
      <GlassCard hover={false}>
        <div className="flex gap-3 flex-wrap">
          <motion.button
            onClick={onProcess}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-green to-neon-blue text-black font-semibold shadow-neon-green flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: loading ? ['-100%', '100%'] : '-100%' }}
              transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
            />
            <Play className="w-4 h-4" />
            <span className="relative z-10">
              {loading ? 'Processing...' : 'Process Event'}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl glass-light border border-white/10 hover:border-neon-green/50 text-white font-semibold flex items-center gap-2 transition-all"
          >
            <FastForward className="w-4 h-4" />
            Process All
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 rounded-xl bg-neon-blue text-black font-semibold flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Quick Test
          </motion.button>
        </div>
      </GlassCard>

      {/* Guardrail Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-neon-green/8 to-neon-blue/5 border border-neon-green/30 shadow-neon-green"
      >
        <div className="flex justify-between items-center">
          <div>
            <strong className="text-white">Cancellation Guardrail:</strong>
            <span className="ml-2 text-white/70">0 / 3 in last 10 minutes</span>
          </div>
          <span className="px-4 py-1.5 rounded-xl bg-gradient-to-br from-neon-green/30 to-neon-blue/20 text-neon-green border border-neon-green/50 text-xs font-bold uppercase tracking-wide">
            OK
          </span>
        </div>
      </motion.div>
    </>
  );
}
