'use client';

import { useState, useCallback } from 'react';
import { BarChart2, HomeIcon } from 'lucide-react';
import Chat from '@/components/Chat';
import { LLMStats, ModelChatHistory } from '@/lib/types';
import { motion } from 'framer-motion';
import Dashboard from '@/components/Dashboard';
import ModelSelector from '@/components/ModelSelector';

export default function HomePage() {
  const [model, setModel] = useState('');
  const [chatHistory, setChatHistory] = useState<ModelChatHistory>({});

  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<LLMStats>({
    tokensPerSecond: 0,
    totalTokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    modelName: ''
  });

  const handleSelectModel = (selectedModel: string) => {
    setModel(selectedModel);
    setStats({
      tokensPerSecond: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      modelName: selectedModel,
    });
  };

  const handleNewStats = useCallback((newStats: LLMStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      <main className="w-full h-full flex flex-col">
        {model ? (
          <>
            <div className='cursor-pointer' style={{ position: 'absolute', top: '0', left: '0', zIndex: 1 }}>
            <button 
              onClick={() => setModel('')} 
              className="header-toggle-button cursor-pointer"
              aria-label="Go to home screen"
            >
              <HomeIcon size={20} />
            </button>
            </div>
            <div className='cursor-pointer' style={{ position: 'absolute', top: '0', right: '0', zIndex: 1 }}>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`header-toggle-button cursor-pointer ${showStats ? 'active' : ''}`}
                aria-label="Toggle stats"
              >
                <BarChart2 size={20} />
              </button>
            </div>
            
            {/* Main content with chat and stats sidebar */}
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 overflow-auto">
                <Chat 
                  model={model} 
                  onNewStats={handleNewStats}
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory} 
                />
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
                <ModelSelector onSelectModel={handleSelectModel} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
