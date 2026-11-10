# FATHOM

A scroll-driven descent from the surface to the floor of the Mariana Trench, at `/fathom`.

One scroll position drives everything. `hooks/use-dive.ts` maps `scrollY` to a zone coordinate (0 at the surface, 5 on the trench floor) using the real section offsets, writes the depth gauge straight to the DOM, and exposes a ref that the WebGL scene reads every frame. No React re-render happens while you scroll, except when the zone changes.

## What is in the water

Everything is procedural: no models, no textures, no audio files.

| Zone     | Depth          | Scene                                                                               | Page                                      |
| -------- | -------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| Sunlight | 0–200 m        | Light shafts, bubbles, a bait ball of 2,400 sardines in one instanced draw call     | Hero letters that drift apart as you sink |
| Twilight | 200–1,000 m    | Ten jellyfish with pulsing bells and 230 shader-animated tentacles                  | Horizontal field log with 3D tilt cards   |
| Midnight | 1,000–4,000 m  | A siphonophore spiralling round the camera, plankton that lights up near the cursor | A sentence only the cursor can read       |
| Abyssal  | 4,000–6,000 m  | Black smokers with glowing mouths and particle plumes                               | The word PRESSURE, crushed by scroll      |
| Hadal    | 6,000–10,935 m | Trench walls and floor, lit only by your torch                                      | A counter that lands on 10,935 m          |

## Files

- `lib/world.ts` builds the whole scene imperatively and owns the camera. `lib/shaders.ts` holds the GLSL.
- `components/ocean-scene.tsx` mounts it in React Three Fiber with a bloom pass.
- `components/moments.tsx` has the scroll-scrubbed sections; `components/cursor.tsx` the cursor ring and magnetic button.
- `hooks/use-ambience.ts` synthesises the underwater sound with Web Audio. It is off until the visitor turns it on.
- `lib/zones.ts` is the copy and the depth, pressure, temperature and light curves.

## Notes

- `prefers-reduced-motion` freezes time-based motion, snaps the camera to the scroll position, shows all type statically, and turns the field log into a normal horizontal scroller.
- If WebGL fails, a CSS gradient behind the canvas carries the page and the preloader still clears.
- Figures are approximate and the page is an independent concept.
