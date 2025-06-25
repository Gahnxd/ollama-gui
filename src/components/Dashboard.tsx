'use client';

import { motion } from 'framer-motion';
import { LLMStats } from '@/lib/types';

const CircularProgress = ({ value, label, max = 200 }: { value: number; label: string; max?: number }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="#333"
          strokeWidth="10"
          fill="transparent"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          stroke="#ff0033"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold">
        {Math.round(value)}
      </div>
      <div className="mt-2 text-secondary">{label}</div>
    </div>
  );
};

interface DashboardProps {
  stats: LLMStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8"><span className="text-accent">AGENT</span> DATA OVERVIEW</h1>
      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-surface/30 p-6 rounded-lg border border-white/20">
          <h2 className="text-xl mb-4 text-accent">Performance Metrics</h2>
          <div className="flex gap-8 justify-center">
            <CircularProgress value={stats.totalTokens} label="Processed Tokens" max={2000} />
            <CircularProgress value={stats.tokensPerSecond} label="Processing Rate" />
          </div>
        </div>
        <div className="bg-surface/30 p-6 rounded-lg border border-white/20">
          <h2 className="text-xl mb-4 text-accent">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Memory Usage</span>
              <span>{Math.round(stats.totalTokens * 1.5)}MB</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-accent h-2.5 rounded-full" style={{ width: `${Math.min(stats.totalTokens/20, 100)}%` }}></div>
            </div>
            <div className="flex justify-between">
              <span>Response Time</span>
              <span>{(stats.tokensPerSecond > 0 ? (1000 / stats.tokensPerSecond).toFixed(2) : 0)}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
