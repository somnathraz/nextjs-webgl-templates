import type { ProductFinish } from '@/features/aura/types/product';
export const FINISHES: ProductFinish[] = [
  {
    id: 'graphite',
    name: 'Graphite',
    shell: '#30312e',
    cushion: '#161715',
    metal: '#777971',
    swatch: '#41423e',
  },
  {
    id: 'pearl',
    name: 'Soft pearl',
    shell: '#d6d0c3',
    cushion: '#b6ac9b',
    metal: '#eee9df',
    swatch: '#d6d0c3',
  },
  {
    id: 'moss',
    name: 'Forest',
    shell: '#56604c',
    cushion: '#283326',
    metal: '#9a9f8b',
    swatch: '#56604c',
  },
];
export const PRODUCT = {
  name: 'Aura One',
  price: 449,
  currency: 'USD',
} as const;
export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: PRODUCT.currency,
    maximumFractionDigits: 0,
  }).format(price);
