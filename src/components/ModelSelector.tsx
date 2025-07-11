'use client';

import { useEffect, useState } from 'react';
import { Model } from '@/lib/types';
import LoadingBar from './LoadingBar';
import { Check } from 'lucide-react';

interface ModelSelectorProps {
  onSelectModel: (model: string) => void;
}

// Using the Model type from types.ts

export default function ModelSelector({ onSelectModel }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('http://localhost:11434/api/tags');
        const data = await response.json();
        setModels(data.models);
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, []);

  const handleSelectModel = (model: Model) => {
    onSelectModel(model.name);
    setSelectedModel(model);
  };

  return (
    <div>
      {isLoading ? (
        <LoadingBar />
      ) : (
        <div className="flex flex-wrap justify-center" style={{ gap: '12px' }}>
          {models.map((model, index) => (
            <div className="messageBubbleGlass model-button flex items-center justify-between cursor-pointer"
                key={model.name || index}
                onClick={() => handleSelectModel(model)}
                style={{
                  justifyContent: 'center',
                  width: 'calc(33.33% - 16px)',
                  minWidth: '150px',
                  maxWidth: 'fit-content',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem'
                }}
              >
                <span className="text">{model.name}</span>
                {selectedModel?.name === model.name && (
                  <Check size={14} className="text-accent ml-2" />
                )}
            </div>
          ))}   
          <svg style={{display: 'none'}}>
            <filter id="container-glass" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
              <feGaussianBlur in="noise" stdDeviation="0.05" result="blur" />
              <feDisplacementMap in="SourceGraphic" in2="blur" scale="5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>    
        </div>
      )}
    </div>
  );
}