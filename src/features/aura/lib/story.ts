/** Shared narrative timing keeps text, camera poses, and annotations in sync. */
export const STORY_STEPS = [
  {
    label: 'THE FORM',
    title: 'Nothing extra.',
    emphasis: 'Everything felt.',
    description:
      'A continuous aluminum curve. Turn it in the light and discover a design considered from every angle.',
    detail: 'Anodized aluminum',
    note: 'A continuous, precision-shaped shell.',
  },
  {
    label: 'THE SOUND',
    title: 'Look closer.',
    emphasis: 'Hear everything.',
    description:
      'The earcup opens to reveal the driver at the heart of the sound. A closer look at where every note begins.',
    detail: '40 mm dynamic driver',
    note: 'Inside the earcup. At the heart of the music.',
  },
  {
    label: 'THE FIT',
    title: 'Made to move.',
    emphasis: 'With you.',
    description:
      'A flexible headband and softly cushioned earcups adapt to you. A little give. A feeling that stays effortless.',
    detail: 'Flexible headband',
    note: 'A gentle flex. A more personal fit.',
  },
] as const;
export const storyStep = (progress: number) =>
  progress < 0.3 ? 0 : progress < 0.69 ? 1 : 2;
export function smoothRange(value: number, start: number, end: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
