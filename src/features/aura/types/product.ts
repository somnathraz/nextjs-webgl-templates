export type FinishId = 'graphite' | 'pearl' | 'moss';
export interface ProductFinish {
  id: FinishId;
  name: string;
  shell: string;
  cushion: string;
  metal: string;
  swatch: string;
}
