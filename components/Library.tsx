
import React from 'react';
import { Recording } from '../types';

interface LibraryProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ recordings, onDelete }) => {
  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Biblioteca</h2>
        <span className="text-xs text-zinc-500">{recordings.length} gravações</span>
      </div>
      
      {recordings.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500">
          <span className="text-4xl mb-4">🎙️</span>
          <p className="text-sm">Nenhuma gravação disponível ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((rec) => (
            <div key={rec.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl shadow-inner">
                📁
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{rec.name}</h4>
                <p className="text-xs text-zinc-500 mono">
                  {new Date(rec.timestamp).toLocaleDateString()} • {formatDuration(rec.duration)} • {rec.config.sampleRate / 1000}kHz {rec.config.bitDepth}-bit
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={rec.url} 
                  download={`${rec.name}.webm`}
                  className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                  title="Download"
                >
                  📥
                </a>
                <button 
                  onClick={() => onDelete(rec.id)}
                  className="p-2 bg-zinc-800 hover:bg-red-900/40 rounded-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
