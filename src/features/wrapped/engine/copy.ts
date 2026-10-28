/**
 * Every word the story says that depends on what is being counted. An
 * adapter ships one of these; the engine never mentions commits or km.
 */

export type ArchetypeId =
  'quiet' | 'streak' | 'weekend' | 'variety' | 'sprinter' | 'daily' | 'steady';

export type Archetype = { id: ArchetypeId; title: string; line: string };

export type Copy = {
  source: string; // "GitHub" → "Your GitHub year in 3D"
  unit: [one: string, many: string]; // contribution / contributions
  decimals: number;
  introLine: string; // "Your year in code is" … wrapped.
  totalLead: string; // "This year you made"
  peakQuip: string;
  weekdayLead: string; // "You ship on" … Mondays.
  beat: string; // versus: "out-shipped"
  breakdownKicker: string;
  breakdownLead: string;
  breakdownLabel: string; // "Top language" on cards
  rankingKicker: string;
  rankingTitle: [string, string]; // "Your greatest" … hits.
  rankingUnit: string | null; // null → star icon (repos); "runs" → plain unit
  clockLead: string;
  chronotype: (hour: number) => string;
  personaKicker: string; // "coder type"
  archetypes: Record<
    ArchetypeId,
    { title: string; line: (n: { streak: number; variety: number }) => string }
  >;
  shareText: (s: {
    year: number;
    total: string;
    streak: number;
    archetype: string;
  }) => string;
  versusText: (s: {
    year: number;
    a: string;
    b: string;
    verdict: string;
  }) => string;
};

export function fmt(copy: Copy, n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: copy.decimals });
}

export function units(copy: Copy, n: number) {
  return n === 1 ? copy.unit[0] : copy.unit[1];
}
