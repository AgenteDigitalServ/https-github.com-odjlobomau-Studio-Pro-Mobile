
export type SampleRate = 44100 | 48000;
export type BitDepth = 16 | 24;
export type ChannelMode = 'mono' | 'stereo';

export interface RecordingConfig {
  sampleRate: SampleRate;
  bitDepth: BitDepth;
  channels: ChannelMode;
}

export interface AudioProcessingState {
  noiseReduction: boolean;
  deEsser: boolean;
  gate: boolean;
  normalization: boolean;
  preset: string;
}

export interface Recording {
  id: string;
  name: string;
  blob: Blob;
  duration: number;
  timestamp: number;
  url: string;
  config: RecordingConfig;
}

export enum EQPreset {
  NONE = 'Nenhum',
  MALE = 'Voz Masculina',
  FEMALE = 'Voz Feminina',
  RADIO = 'Rádio FM',
  PODCAST = 'Podcast Pro',
  BOOK = 'Audiobook',
  AD = 'Publicidade'
}
