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
            <button
              key={model.name || index}
              onClick={() => handleSelectModel(model)}
              className={`model-button ${selectedModel?.name === model.name ? 'border-accent' : ''}`}
              style={{
                justifyContent: 'center',
                width: 'calc(33.33% - 16px)',
                minWidth: '150px',
                maxWidth: 'fit-content'
              }}
            >
              <span className="text">{model.name}</span>
              {selectedModel?.name === model.name && (
                <Check size={14} className="text-accent ml-2" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}