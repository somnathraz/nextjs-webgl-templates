import type { Copy } from '../../engine/copy';

export const strideCopy: Copy = {
  source: 'Stride',
  unit: ['km', 'km'],
  decimals: 0,
  introLine: 'Your year on the move is',
  totalLead: 'This year you covered',
  peakQuip: 'Your legs still remember it.',
  weekdayLead: 'You train on',
  beat: 'outran',
  breakdownKicker: 'Your sports',
  breakdownLead: 'Your main event was',
  breakdownLabel: 'Top sport',
  rankingKicker: 'Favourite routes',
  rankingTitle: ['The roads that', 'know you.'],
  rankingUnit: 'times',
  clockLead: 'Lately you’re out the door around',
  chronotype: (h) => {
    if (h < 8) return 'Sunrise club. The day starts after your run.';
    if (h < 12) return 'Morning miles before the inbox wins.';
    if (h < 17) return 'Lunch-break legend.';
    if (h < 21) return 'After-work reset. Leave the day on the road.';
    return 'Headlamp hours. Quiet roads, all yours.';
  },
  personaKicker: 'athlete type',
  archetypes: {
    quiet: {
      title: 'The Rest Year',
      line: () => 'Recovery is training too. Next season starts now.',
    },
    streak: {
      title: 'The Unbreakable',
      line: ({ streak }) => `${streak} days in a row. Rain didn't count.`,
    },
    weekend: {
      title: 'The Long-Run Lover',
      line: () => 'Weekdays are logistics. Weekends are the long way home.',
    },
    variety: {
      title: 'The Cross-Trainer',
      line: ({ variety }) => `${variety} sports, one engine.`,
    },
    sprinter: {
      title: 'The Race-Day Specialist',
      line: () => 'Built quietly, then emptied the tank when it counted.',
    },
    daily: {
      title: 'The Daily Miler',
      line: () => 'Some people commute. You train.',
    },
    steady: {
      title: 'The Steady Pacer',
      line: () => 'Even splits, all year long.',
    },
  },
  shareText: ({ year, total, streak, archetype }) =>
    `My ${year} on Stride: ${total} km, a ${streak}-day streak, and I'm "${archetype}".`,
  versusText: ({ year, a, b, verdict }) =>
    `${a} vs ${b}, ${year} on Stride. ${verdict}`,
};
