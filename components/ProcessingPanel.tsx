
import React from 'react';
import { PRESETS } from '../constants';
import { AudioProcessingState, EQPreset } from '../types';

interface ProcessingPanelProps {
  state: AudioProcessingState;
  setState: React.Dispatch<React.SetStateAction<AudioProcessingState>>;
}

const ProcessingPanel: React.FC<ProcessingPanelProps> = ({ state, setState }) => {
  const toggle = (key: keyof AudioProcessingState) => {
    setState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">DSP em Tempo Real</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'noiseReduction', label: 'AI Noise Reduction', icon: '✨' },
            { id: 'deEsser', label: 'De-Esser Digital', icon: '🌬️' },
            { id: 'gate', label: 'Adaptive Gate', icon: '🚪' },
            { id: 'normalization', label: 'Auto-Normalize', icon: '📊' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id as keyof AudioProcessingState)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                state[item.id as keyof AudioProcessingState] 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 grayscale'
              }`}
            >
              <span className="text-xs font-medium">{item.label}</span>
              <span className="text-lg">{item.icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Presets de Locução</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setState(prev => ({ ...prev, preset: preset.id }))}
              className={`w-full flex flex-col items-start p-3 rounded-lg border transition-all ${
                state.preset === preset.id 
                  ? 'bg-zinc-100 border-zinc-100 text-zinc-900' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              <span className="text-sm font-bold">{preset.label}</span>
              <span className="text-[10px] opacity-70">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingPanel;
