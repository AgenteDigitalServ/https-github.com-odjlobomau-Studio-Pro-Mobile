
import React, { useState, useEffect, useRef } from 'react';

interface TeleprompterProps {
  text: string;
  isActive: boolean;
  onTextChange: (text: string) => void;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ text, isActive, onTextChange }) => {
  const [fontSize, setFontSize] = useState(24);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isEditing, setIsEditing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (isActive && !isEditing && scrollRef.current) {
      interval = window.setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed / 2;
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isActive, isEditing, scrollSpeed]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-64 shadow-inner">
      <div className="flex items-center justify-between p-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            {isEditing ? 'SALVAR TEXTO' : 'EDITAR TEXTO'}
          </button>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Velocidade</span>
              <input 
                type="range" min="0" max="10" step="1" 
                value={scrollSpeed} 
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="w-20 accent-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Fonte</span>
              <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="w-6 h-6 bg-zinc-800 rounded text-xs">-</button>
              <button onClick={() => setFontSize(f => Math.min(60, f + 2))} className="w-6 h-6 bg-zinc-800 rounded text-xs">+</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {isEditing ? (
          <textarea
            className="w-full h-full bg-transparent p-4 outline-none text-zinc-300 resize-none font-sans"
            placeholder="Cole seu roteiro aqui..."
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
          />
        ) : (
          <div 
            ref={scrollRef}
            className="w-full h-full p-6 overflow-y-auto scroll-smooth no-scrollbar"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
          >
            <div className="pb-64 text-zinc-200 font-medium whitespace-pre-wrap">
              {text || "Nenhum texto carregado no teleprompter."}
            </div>
          </div>
        )}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500/30 pointer-events-none" />
      </div>
    </div>
  );
};

export default Teleprompter;
