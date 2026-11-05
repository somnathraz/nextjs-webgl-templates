import type { Copy } from '../../engine/copy';

export const githubCopy: Copy = {
  source: 'GitHub',
  unit: ['contribution', 'contributions'],
  decimals: 0,
  introLine: 'Your year in code is',
  totalLead: 'This year you made',
  peakQuip: 'Something shipped that day.',
  weekdayLead: 'You ship on',
  beat: 'out-shipped',
  breakdownKicker: 'Your languages',
  breakdownLead: 'You mostly spoke',
  breakdownLabel: 'Top language',
  rankingKicker: 'Top repos',
  rankingTitle: ['Your greatest', 'hits.'],
  rankingUnit: null,
  clockLead: 'Lately you’re most active around',
  chronotype: (h) => {
    if (h >= 22 || h < 4) return 'Night shift, confirmed.';
    if (h < 9) return 'Coffee, then commits. Early bird energy.';
    if (h < 13) return 'Morning focus. Your best work happens before lunch.';
    if (h < 18) return 'Afternoon flow. Meetings done, editor open.';
    return 'Evening sessions. The quiet hours are yours.';
  },
  personaKicker: 'coder type',
  archetypes: {
    quiet: {
      title: 'The Quiet Year',
      line: () => 'Some years are for thinking. Next year is for shipping.',
    },
    streak: {
      title: 'The Streak Machine',
      line: ({ streak }) =>
        `${streak} days straight without breaking the chain.`,
    },
    weekend: {
      title: 'The Weekend Warrior',
      line: () => 'The day job pays rent. Saturdays build the dream.',
    },
    variety: {
      title: 'The Polyglot',
      line: ({ variety }) =>
        `${variety} languages, zero loyalty. Right tool, every time.`,
    },
    sprinter: {
      title: 'The Sprinter',
      line: () => 'Quiet for weeks, then a whole release in one sitting.',
    },
    daily: {
      title: 'The Daily Driver',
      line: () => 'Showing up is the superpower. You showed up.',
    },
    steady: {
      title: 'The Steady Builder',
      line: () => 'No fireworks needed. Just commits that add up.',
    },
  },
  shareText: ({ year, total, streak, archetype }) =>
    `My ${year} on GitHub: ${total} contributions, a ${streak}-day streak, and apparently I'm "${archetype}". Wrap yours →`,
  versusText: ({ year, a, b, verdict }) =>
    `${a} vs ${b}: our ${year} on GitHub, settled in 3D. ${verdict} Think you'd win? →`,
};
