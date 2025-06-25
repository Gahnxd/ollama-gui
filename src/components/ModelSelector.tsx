'use client';

import { useEffect, useState } from 'react';
import { Model } from '@/lib/types';
import LoadingBar from './LoadingBar';
import { Cpu, Check } from 'lucide-react';

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
    <div className="space-y-2">
      {isLoading ? (
        <LoadingBar />
      ) : (
        <div className="space-y-1">
          {models.map((model, index) => (
            <button
              key={model.name || index}
              onClick={() => handleSelectModel(model)}
              className={`w-full bg-black hover:bg-black/80 border ${selectedModel?.name === model.name ? 'border-accent' : 'border-white/10'} p-2 text-left text-xs flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-white" />
                <span>{model.name}</span>
              </div>
              {selectedModel?.name === model.name && (
                <Check size={14} className="text-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}