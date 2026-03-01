
import React, { useEffect, useState, useRef } from 'react';

interface VUMeterProps {
  analyser: AnalyserNode | null;
}

const VUMeter: React.FC<VUMeterProps> = ({ analyser }) => {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const normalized = Math.min(100, (average / 128) * 100);
      
      setLevel(normalized);
      if (normalized > peak) {
        setPeak(normalized);
        setTimeout(() => setPeak(0), 1000);
      }
      
      animationRef.current = requestAnimationFrame(update);
    };

    update();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, peak]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[10px] text-zinc-500 mono px-1">
        <span>-60dB</span>
        <span>-24dB</span>
        <span>-12dB</span>
        <span>-6dB</span>
        <span className={level > 90 ? 'text-red-500 font-bold' : ''}>0dB</span>
      </div>
      <div className="relative h-6 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800">
        <div className="absolute inset-0 flex">
          <div className="h-full w-[70%] border-r border-zinc-950/20 bg-green-500/10" />
          <div className="h-full w-[20%] border-r border-zinc-950/20 bg-yellow-500/10" />
          <div className="h-full w-[10%] bg-red-500/10" />
        </div>
        
        <div 
          className={`absolute inset-y-0 left-0 transition-all duration-75 flex ${
            level > 90 ? 'bg-red-500' : level > 70 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${level}%` }}
        />
        
        <div 
          className="absolute inset-y-0 w-0.5 bg-white shadow-sm transition-all duration-300"
          style={{ left: `${peak}%` }}
        />
      </div>
      {level > 95 && (
        <div className="text-center text-[10px] text-red-500 font-bold animate-pulse">
          DISTORÇÃO (CLIPPING) DETECTADA
        </div>
      )}
    </div>
  );
};

export default VUMeter;
