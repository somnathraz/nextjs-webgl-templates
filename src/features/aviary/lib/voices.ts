export type Voice = {
  id: string;
  name: string;
  tag: string;
  color: string;
  traits: string[];
  /** visual seed so each waveform looks distinct */
  seed: number;
};

export const VOICES: Voice[] = [
  {
    id: 'lyra',
    name: 'Lyra',
    tag: 'Warm · Narration',
    color: '#5eead4',
    traits: ['English', 'Expressive', 'Studio'],
    seed: 1.2,
  },
  {
    id: 'corvus',
    name: 'Corvus',
    tag: 'Deep · Documentary',
    color: '#818cf8',
    traits: ['Neutral', 'Calm', 'Low latency'],
    seed: 2.7,
  },
  {
    id: 'wren',
    name: 'Wren',
    tag: 'Bright · Assistant',
    color: '#f0abfc',
    traits: ['Friendly', 'Realtime', 'Mobile'],
    seed: 3.9,
  },
  {
    id: 'sol',
    name: 'Sol',
    tag: 'Soft · Meditation',
    color: '#fbbf72',
    traits: ['Breathy', 'Slow', 'ASMR'],
    seed: 4.4,
  },
  {
    id: 'kestrel',
    name: 'Kestrel',
    tag: 'Crisp · News',
    color: '#7dd3fc',
    traits: ['Formal', 'Precise', 'Broadcast'],
    seed: 5.1,
  },
  {
    id: 'echo',
    name: 'Echo',
    tag: 'Cloned · Your voice',
    color: '#c4b5fd',
    traits: ['Custom', 'Encrypted', '30s sample'],
    seed: 6.3,
  },
];

export const STYLE_CHIPS = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'excited', label: 'Excited' },
  { id: 'whisper', label: 'Whisper' },
  { id: 'narration', label: 'Narration' },
  { id: 'newscast', label: 'Newscast' },
];

export const LANGUAGES = [
  'English',
  'Español',
  '日本語',
  'Français',
  'हिन्दी',
  'Deutsch',
  '中文',
  'العربية',
  'Português',
  'Türkçe',
  'Italiano',
  '한국어',
];
