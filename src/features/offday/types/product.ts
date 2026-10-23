export interface Flavor {
  id: string;
  name: string;
  note: string;
  background: string;
  label: string;
  ink: string;
  accent: string;
  number: string;
}
export interface BagItem {
  flavorId: string;
  packs: number;
}
