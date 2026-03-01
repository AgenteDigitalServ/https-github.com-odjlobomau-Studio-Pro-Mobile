
import React, { useState, useEffect, useRef } from 'react';
import { AudioEngine } from './services/audioEngine';
import { Recording, AudioProcessingState, RecordingConfig, EQPreset } from './types';
import Waveform from './components/Waveform';
import VUMeter from './components/VUMeter';
import ProcessingPanel from './components/ProcessingPanel';
import Library from './components/Library';
import Teleprompter from './components/Teleprompter';
import AudioPlayer from './components/AudioPlayer';
import { analyzeAudioEnvironment } from './services/geminiService';

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [teleprompterText, setTeleprompterText] = useState("");
  const [showTeleprompter, setShowTeleprompter] = useState(false);
  
  const [config, setConfig] = useState<RecordingConfig>({
    sampleRate: 48000,
    bitDepth: 24,
    channels: 'mono',
  });
  
  const [processing, setProcessing] = useState<AudioProcessingState>({
    noiseReduction: false,
    deEsser: false,
    gate: false,
    normalization: false,
    preset: EQPreset.NONE,
  });

  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

  const engineRef = useRef<AudioEngine | null>(null);
  const timerRef = useRef<number>();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const startEngine = async () => {
    try {
      const engine = new AudioEngine();
      await engine.init(config);
      engineRef.current = engine;
      setAnalyser(engine.getAnalyser());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    startEngine();
    return () => {
      engineRef.current?.close();
    };
  }, [config]);

  const toggleRecording = async () => {
    if (!engineRef.current) return;

    if (!isRecording) {
      engineRef.current.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 100);
      }, 100);
    } else {
      clearInterval(timerRef.current);
      const blob = await engineRef.current.stopRecording();
      setIsRecording(false);
      
      const newRecording: Recording = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Tomada ${recordings.length + 1}`,
        blob,
        duration: recordingTime,
        timestamp: Date.now(),
        url: URL.createObjectURL(blob),
        config: { ...config },
      };
      
      setRecordings(prev => [newRecording, ...prev]);
    }
  };

  const runAiAnalysis = async () => {
    if (recordings.length === 0) return;
    setAiAnalyzing(true);
    
    const latest = recordings[0];
    const reader = new FileReader();
    reader.readAsDataURL(latest.blob);
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeAudioEnvironment(base64);
      setAiFeedback(result);
      setAiAnalyzing(false);
    };
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const mm = ms % 1000;
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}.${Math.floor(mm/10)}`;
  };

  return (
    <div className="min-h-screen pb-12 bg-[#09090b]">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl">🎙️</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">StudioPro</h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Edição de Locutor</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTeleprompter(!showTeleprompter)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              showTeleprompter ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
            }`}
          >
            {showTeleprompter ? 'Ocultar Teleprompter' : 'Abrir Teleprompter'}
          </button>
          <button 
            onClick={runAiAnalysis}
            disabled={recordings.length === 0 || aiAnalyzing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              aiAnalyzing ? 'bg-zinc-800 border-zinc-700 opacity-50' : 'bg-zinc-900 border-zinc-700 hover:border-blue-500 text-blue-400'
            }`}
          >
            {aiAnalyzing ? 'Analisando...' : '✨ IA: Analisar Acústica'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          
          {showTeleprompter && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <Teleprompter 
                text={teleprompterText} 
                isActive={isRecording} 
                onTextChange={setTeleprompterText} 
              />
            </div>
          )}

          <section className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] mono text-zinc-500 flex gap-4 uppercase">
              <span>{config.sampleRate/1000}kHz</span>
              <span>{config.bitDepth}bit</span>
              <span>{config.channels === 'mono' ? 'Mono' : 'Estéreo'}</span>
            </div>

            <div className="text-center mb-10">
              <div className={`text-6xl mono font-light tracking-tighter ${isRecording ? 'text-white' : 'text-zinc-500'}`}>
                {formatTime(recordingTime)}
              </div>
              <p className="text-xs text-zinc-600 mt-2 uppercase tracking-[0.3em]">
                {isRecording ? 'Capturando Sinal...' : 'Pronto para Gravar'}
              </p>
            </div>

            <div className="space-y-6 mb-10">
              <Waveform analyser={analyser} isRecording={isRecording} />
              <VUMeter analyser={analyser} />
            </div>

            <div className="flex items-center justify-center gap-8">
              <button 
                onClick={() => setConfig(prev => ({ ...prev, channels: prev.channels === 'mono' ? 'stereo' : 'mono' }))}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Configurações de Canal"
              >
                ⚙️
              </button>
              
              <button 
                onClick={toggleRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl transform active:scale-95 ${
                  isRecording 
                    ? 'bg-zinc-100 hover:bg-white text-black' 
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isRecording ? (
                  <div className="w-8 h-8 bg-current rounded-sm" />
                ) : (
                  <div className="w-10 h-10 bg-current rounded-full animate-pulse" />
                )}
              </button>

              <button 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Descartar Atual"
                onClick={() => setRecordingTime(0)}
              >
                ✖️
              </button>
            </div>
          </section>

          {recordings.length > 0 && !isRecording && (
            <AudioPlayer url={recordings[0].url} name={recordings[0].name} />
          )}

          {aiFeedback && (
            <section className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-bold text-blue-100 mb-1">Otimização da IA Sugerida</h4>
                  <p className="text-sm text-blue-200/80 mb-3">Ambiente detectado: <span className="text-white font-medium">{aiFeedback.acoustics}</span></p>
                  <div className="grid grid-cols-3 gap-2 text-[10px] mono text-center">
                    <div className="bg-black/20 p-2 rounded">GATE: {aiFeedback.suggestions.gateThreshold}dB</div>
                    <div className="bg-black/20 p-2 rounded">COMP: {aiFeedback.suggestions.compRatio}</div>
                    <div className="bg-black/20 p-2 rounded">CORTE EQ: {aiFeedback.suggestions.eqCleansing[0] || 'Nenhum'}</div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-bold uppercase">Taxa Amostragem</span>
                <select 
                  className="bg-zinc-800 text-xs rounded border-none px-2 py-1 outline-none text-zinc-300"
                  value={config.sampleRate}
                  onChange={(e) => setConfig(prev => ({ ...prev, sampleRate: Number(e.target.value) as any }))}
                >
                  <option value={44100}>44.1 kHz</option>
                  <option value={48000}>48.0 kHz</option>
                </select>
             </div>
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-bold uppercase">Bits (Profundidade)</span>
                <select 
                  className="bg-zinc-800 text-xs rounded border-none px-2 py-1 outline-none text-zinc-300"
                  value={config.bitDepth}
                  onChange={(e) => setConfig(prev => ({ ...prev, bitDepth: Number(e.target.value) as any }))}
                >
                  <option value={16}>16-bit (Padrão)</option>
                  <option value={24}>24-bit (Alta Fidelidade)</option>
                </select>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <ProcessingPanel state={processing} setState={setProcessing} />
          <Library recordings={recordings} onDelete={(id) => setRecordings(prev => prev.filter(r => r.id !== id))} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 px-6 py-2 flex justify-between items-center text-[10px] text-zinc-600 mono">
        <div>LATÊNCIA: 12ms • BUFFER: 4096 • ENGINE: WEB AUDIO API v2.5</div>
        <div>CPU: 4% • {isRecording ? 'STATUS: GRAVANDO' : 'STATUS: STANDBY'}</div>
      </footer>
    </div>
  );
};

export default App;
