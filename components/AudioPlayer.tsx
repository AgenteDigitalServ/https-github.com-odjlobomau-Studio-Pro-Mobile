
import React, { useRef, useState } from 'react';

interface AudioPlayerProps {
  url: string;
  name: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ url, name }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-blue-600/10 border border-blue-500/40 p-3 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in duration-300">
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
      <button 
        onClick={togglePlay}
        className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition-colors"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Última Tomada</p>
        <p className="text-sm font-semibold text-white truncate">{name}</p>
      </div>
      <a 
        href={url} 
        download={name}
        className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg font-bold transition-all"
      >
        EXPORTAR
      </a>
    </div>
  );
};

export default AudioPlayer;
