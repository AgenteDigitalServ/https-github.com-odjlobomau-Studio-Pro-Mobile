
import { RecordingConfig } from '../types';

export class AudioEngine {
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  
  // Nodes for processing (Simulated logic for basic web audio demo)
  private gainNode: GainNode | null = null;

  async init(config: RecordingConfig) {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: config.sampleRate,
    });
    
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: config.channels === 'stereo' ? 2 : 1,
        sampleRate: config.sampleRate,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    this.source = this.context.createMediaStreamSource(this.stream);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.gainNode = this.context.createGain();

    this.source.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    
    // MediaRecorder handles actual capture
    this.recorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm', // Browsers usually support webm for recording
    });

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
  }

  startRecording() {
    if (!this.recorder) return;
    this.chunks = [];
    this.recorder.start(100);
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) return;
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        resolve(blob);
      };
      this.recorder.stop();
    });
  }

  getAnalyser() {
    return this.analyser;
  }

  setGain(value: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }

  close() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.context) {
      this.context.close();
    }
  }
}
