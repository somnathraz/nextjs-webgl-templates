import type { Flavor } from '@/features/offday/types/product';
export const FLAVORS: Flavor[] = [
  {
    id: 'orange',
    name: 'Orange Rush',
    note: 'Bright citrus. A little wild.',
    background: '#ed683e',
    label: '#f8e9c8',
    ink: '#34271f',
    accent: '#f06435',
    number: '01',
  },
  {
    id: 'berry',
    name: 'Berry Afterhours',
    note: 'Dark berries. Bright ideas.',
    background: '#9c3249',
    label: '#f1cbd1',
    ink: '#64263c',
    accent: '#a82b50',
    number: '02',
  },
  {
    id: 'lime',
    name: 'Lime Time',
    note: 'A crisp little plot twist.',
    background: '#a8bd5a',
    label: '#edf0c0',
    ink: '#29472a',
    accent: '#699d37',
    number: '03',
  },
];
export const PACK_PRICE = 24;
export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
