'use client';

import { useState } from 'react';
import { BarChart2, HomeIcon, X } from 'lucide-react';
import Chat from '@/components/Chat';
import { LLMStats } from '@/lib/types';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [model, setModel] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<LLMStats>({ tokensPerSecond: 0, totalTokens: 0 });

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      <main className="w-full h-full flex flex-col">
        {model ? (
          <>
            <div className="flex justify-between items-center p-4" style={{ marginBottom: '10px'}}>
              <button 
                onClick={() => setModel('')} 
                className="header-toggle-button"
                aria-label="Go to home screen"
              >
                <HomeIcon size={20} />
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`header-toggle-button ${showStats ? 'active' : ''}`}
                  aria-label="Toggle stats"
                >
                  <BarChart2 size={20} />
                </button>
              </div>
            </div>
            
            {/* Main content with chat and stats sidebar */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-auto">
                <Chat model={model} onNewStats={setStats} />
              </div>
              
              {showStats && (
                <motion.div 
                  className="w-80 bg-black border-l border-white/10 h-full overflow-auto"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="flex justify-between items-center p-4 border-b border-white/20">
                    <h3 className="font-mono text-lg uppercase tracking-wider">Stats</h3>
                    <button 
                      onClick={() => setShowStats(false)}
                      className="text-white/70 hover:text-white"
                      aria-label="Close stats"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col divide-y divide-white/10">
                    {/* Tokens Per Second */}
                    <div className="p-4 border-b border-white/20">
                      <div className="uppercase text-xs font-mono text-white/50 mb-1 tracking-wider">Tokens/sec</div>
                      <div className="font-mono text-3xl">
                        {stats.tokensPerSecond.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Total Tokens */}
                    <div className="p-4 border-b border-white/20">
                      <div className="uppercase text-xs font-mono text-white/50 mb-1 tracking-wider">Total tokens</div>
                      <div className="font-mono text-3xl">
                        {stats.totalTokens.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Progress Bar (Example) */}
                    <div className="p-4 border-b border-white/20">
                      <div className="uppercase text-xs font-mono text-white/50 mb-1 tracking-wider">Progress</div>
                      <div className="w-full bg-white/10 h-2 rounded-full mt-2">
                        <div 
                          className="bg-white h-full rounded-full" 
                          style={{ width: `${Math.min(stats.tokensPerSecond * 5, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs font-mono text-white/50">0%</span>
                        <span className="text-xs font-mono text-white/50">100%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl font-mono mb-6">Ollama <span className="text-accent">GUI</span></h1>
              <h2 className="text-xl mb-12 font-mono">Select a Model</h2>
              
              <div className="w-full" style={{ maxWidth: '720px' }}>
                <button 
                  onClick={() => setModel('gemma3:4b')}
                  className="model-button"
                >
                  <span className="icon">⚙️</span>
                  <span className="text">gemma3:4b</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
