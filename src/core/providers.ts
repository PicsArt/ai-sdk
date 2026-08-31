import type { Provider } from './types.ts';

export interface ProviderMeta {
  color: string;
  label: string;
  name: string;
}

export const providers: Record<Provider, ProviderMeta> = {
  picsart: { color: '#FF3399', label: 'PA', name: 'Picsart' },
  google: { color: '#4285F4', label: 'G', name: 'Google' },
  kling: { color: '#8B5CF6', label: 'K', name: 'Kling' },
  grok: { color: '#1DA1F2', label: 'X', name: 'Grok' },
  openai: { color: '#10B981', label: 'O', name: 'OpenAI' },
  flux: { color: '#FF6B6B', label: 'F', name: 'Flux' },
  ideogram: { color: '#06B6D4', label: 'I', name: 'Ideogram' },
  elevenlabs: { color: '#2D6B4F', label: 'XI', name: 'ElevenLabs' },
  minimax: { color: '#FF7B54', label: 'M', name: 'MiniMax' },
  wan: { color: '#00BCD4', label: 'W', name: 'Wan' },
  seedance: { color: '#EC4899', label: 'SD', name: 'Seedance' },
  ltx: { color: '#6366F1', label: 'LT', name: 'LTX' },
  seedream: { color: '#14B8A6', label: 'SR', name: 'Seedream' },
  seedaudio: { color: '#7C3AED', label: 'SA', name: 'Seed Audio' },
  hunyuan: { color: '#F59E0B', label: 'HY', name: 'Hunyuan' },
  pika: { color: '#FF6B9D', label: 'PK', name: 'Pika' },
  runway: { color: '#00D4AA', label: 'RW', name: 'Runway' },
  luma: { color: '#FFB800', label: 'LU', name: 'Luma' },
  ovi: { color: '#9333EA', label: 'OV', name: 'OVI' },
  creatify: { color: '#FF3D00', label: 'CR', name: 'Creatify' },
  veed: { color: '#5B21B6', label: 'VD', name: 'VEED' },
  bytedance: { color: '#00F5D4', label: 'BD', name: 'ByteDance' },
  qwen: { color: '#1E40AF', label: 'QW', name: 'Qwen' },
  reve: { color: '#E11D48', label: 'RV', name: 'Reve' },
  recraft: { color: '#3B82F6', label: 'RF', name: 'Recraft' },
  videography: { color: '#78716C', label: 'VG', name: 'Videography' },
  topaz: { color: '#14B8A6', label: 'TZ', name: 'Topaz' },
  heygen: { color: '#5B4EFF', label: 'HG', name: 'HeyGen' },
  happyhorse: { color: '#FF6A00', label: 'HH', name: 'Happy Horse' },
  pixverse: { color: '#7C3AED', label: 'PV', name: 'PixVerse' },
  anthropic: { color: '#D97757', label: 'CL', name: 'Anthropic' },
  async: { color: '#5E5CE6', label: 'AA', name: 'Async AI' },
  captionsai: { color: '#1D1F20', label: 'MR', name: 'Mirage' },
};

export const getProviderColor = (provider: Provider): string =>
  providers[provider]?.color ?? '#666';

export const getProviderLabel = (provider: Provider): string =>
  providers[provider]?.label ?? '?';
