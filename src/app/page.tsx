'use client';

import { useState, useEffect } from 'react';
import { BarChart2, HomeIcon } from 'lucide-react';
import Chat from '@/components/Chat';
import { LLMStats } from '@/lib/types';
import { motion } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import ModelSelector from '@/components/ModelSelector';

export default function HomePage() {
  const [model, setModel] = useState('');
  
  // Update model name in stats when model changes
  useEffect(() => {
    if (model) {
      setStats(prevStats => ({
        ...prevStats,
        modelName: model
      }));
    }
  }, [model]);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<LLMStats>({
    tokensPerSecond: 0,
    totalTokens: 0,
    modelName: ''
  });

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
                  className="w-80 h-full overflow-auto"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="relative h-full">
                    <Dashboard stats={stats} />
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
                {/* Dynamically load models from Ollama API */}
                <ModelSelector onSelectModel={setModel} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
