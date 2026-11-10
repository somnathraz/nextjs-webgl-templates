# MIDNIGHT

A New Year page at `/midnight`. Scrolling moves a clock from 23:50:00 to midnight while the camera rises from a snowy street to the sky above the city.

`hooks/use-night.ts` turns `scrollY` into one coordinate (0 street level, 2 countdown starts, 3 midnight, 4 end), writes the clock to the DOM, and hands the same ref to the WebGL scene. The year is not hard-coded: `lib/time.ts` works out which New Year is next, and keeps celebrating it for the first three days of January.

## What happens

| Clock    | Scene                                                   | Page                                                               |
| -------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| 23:50    | Street canyon, snow, traffic, windows drawn in a shader | The old year in huge digits that sink as you rise                  |
| 23:51    | Rising past lit floors                                  | Twelve calendar pages passing sideways, with 3D tilt               |
| 23:56    | Above the rooftops, 90 sky lanterns                     | Words to leave behind: tap one and it floats away with a firework  |
| 23:59:50 | Open sky                                                | Ten numbers scrubbed by scroll, with a ring that fills each second |
| 00:00    | Fireworks over the skyline, lighting the towers         | The year's last digit rolls over; click the sky to launch your own |

The footer has a live countdown to the real New Year in the visitor's time zone.

## Files

- `lib/world.ts` builds the scene and owns the camera and the firework schedule. `lib/shaders.ts` holds the GLSL.
- Fireworks are a pool of 22 shells sharing one geometry. Each spark's position is a closed-form function of its age, so nothing is simulated on the CPU.
- `components/moments.tsx` has the scroll sections and the live countdown.
- `hooks/use-sound.ts` synthesises wind, firework thumps, countdown ticks and a midnight chime. Off until the visitor turns it on.

## Notes

- `prefers-reduced-motion` freezes time-based motion and fireworks, snaps the camera, and shows type statically.
- If WebGL fails, a CSS gradient carries the page and the preloader still clears.
