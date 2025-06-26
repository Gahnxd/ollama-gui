'use client';

import { LLMStats } from '@/lib/types';

interface DashboardProps {
  stats: LLMStats;
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="stats-panel h-full w-full grid grid-cols-1 auto-rows-auto bg-black text-white">
      {/* Model ID - Grid Item */}
      <div className="grid grid-cols-1">
        {/* Box top border with corners */}
        <div className="flex justify-between">
          <div style={ { color : "rgb(255, 1, 1)"}}>┌</div>
          <div style={ { color : "rgb(255, 1, 1)"}}>┐</div>
        </div>

        <div className="px-4 py-2 flex items-center justify-center">
          <div className="text-lg font-mono">Model</div>
        </div>

        <div className="px-4 py-2 flex items-center justify-center">
          <div className="text-lg font-mono">{stats.modelName || 'Unknown'}</div>
        </div>

        {/* Box bottom border with corners */}
        <div className="flex justify-between">
          <div style={ { color : "rgb(255, 1, 1)"}}>└</div>
          <div style={ { color : "rgb(255, 1, 1)"}}>┘</div>
        </div>
      </div>
      
      {/* Token Stats - Grid Item */}
      <div className="grid grid-cols-1">
        {/* Box top border with corners */}
        <div className="flex justify-between">
          <div style={ { color : "rgb(255, 1, 1)"}}>┌</div>
          <div style={ { color : "rgb(255, 1, 1)"}}>┐</div>
        </div>

        <div className="px-4 py-2 flex items-center justify-center">
          <div className="text-lg font-mono">Token Stats</div>
        </div>
        
        <div className="grid grid-cols-3 justify-between px-8 py-2">
          <div className="grid grid-rows-2 items-center justify-center text-center">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-3xl font-mono text-white">{stats.totalTokens}</div>
          </div>
          <div className="grid grid-rows-2 items-center justify-center text-center">
            <div className="text-sm text-gray-500">Input</div>
            <div className="text-3xl font-mono text-white">{stats.inputTokens}</div>
          </div>
          <div className="grid grid-rows-2 items-center justify-center text-center">
            <div className="text-sm text-gray-500">Output</div>
            <div className="text-3xl font-mono text-white">{stats.outputTokens}</div>
          </div>
        </div>

        {/* Box bottom border with corners */}
        <div className="flex justify-between">
          <div style={ { color : "rgb(255, 1, 1)"}}>└</div>
          <div style={ { color : "rgb(255, 1, 1)"}}>┘</div>
        </div>
      </div>
      
      {/* Token Speed Display - Grid Item */}
      <div className="grid grid-cols-1">
        {/* Box top border with corners */}
        <div className="flex justify-between">
          <div style={ { color : "rgb(255, 1, 1)"}}>┌</div>
          <div style={ { color : "rgb(255, 1, 1)"}}>┐</div>
        </div>
        
        <div className="px-4 py-2 flex items-center justify-center">
          <div className="text-lg font-mono">Generation Speed</div>
        </div>
        
        <div className="px-4 py-4 flex items-center justify-center">
          <div className="text-3xl font-mono text-white">
            <span className="text-accent">{stats.tokensPerSecond.toFixed(2)}</span>
            <span className="text-gray-500 text-xl"> tokens/sec</span>
          </div>
        </div>
        
        {/* Box bottom border with corners */}
        <div className="flex justify-between">
          <div style={ { color : "rgb(255, 1, 1)"}}>└</div>
          <div style={ { color : "rgb(255, 1, 1)"}}>┘</div>
        </div>
      </div>

      
      {/* Bottom margin space */}
      <div className="h-4"></div>
    </div>
  );
}
