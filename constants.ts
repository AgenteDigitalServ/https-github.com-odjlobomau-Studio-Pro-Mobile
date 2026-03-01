
import { EQPreset } from './types';

export const PRESETS = [
  { id: EQPreset.NONE, label: 'Nenhum', description: 'Sinal limpo sem processamento' },
  { id: EQPreset.MALE, label: 'Voz Masculina', description: 'Realce de graves e médios baixos' },
  { id: EQPreset.FEMALE, label: 'Voz Feminina', description: 'Brilho e clareza nos agudos' },
  { id: EQPreset.RADIO, label: 'Rádio FM', description: 'Compressão pesada e presença forte' },
  { id: EQPreset.PODCAST, label: 'Podcast Pro', description: 'Equilibrado para longas audições' },
  { id: EQPreset.BOOK, label: 'Audiobook', description: 'Naturalidade e redução de ruídos de boca' },
  { id: EQPreset.AD, label: 'Publicidade', description: 'Punch e brilho comercial' },
];

export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: false, // Desabilitamos nativo para usar o nosso processamento
  autoGainControl: false,  // Locutores preferem controle manual
};
