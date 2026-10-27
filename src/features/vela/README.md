# Vela — A new sense of possibility

An original spatial-computing product concept at `/vela`. It is a frontend showcase, not a device for sale, and makes no real hardware specification claims.

## Creative direction

**Visual thesis:** porcelain, smoked glass, woven fabric, and soft natural light; a bright product story with calm typography.

**Content:** a product introduction, exterior and optical assembly chapters, an alpine environment, an interactive finish/view studio, and replay.

**Motion:** a persistent 3D headset rotates with native scroll, separates into optical layers, and enlarges until the visor becomes the surrounding world. Material and viewpoint controls work on the same model.

## Structure

- `home.tsx`: content and page composition, with a lazy client-only Three.js scene.
- `components/headset.tsx`: headset assembly, lighting, camera and scroll choreography.
- `lib/geometry.ts`: curved visor, aluminum shell, perforated cushion, fabric bands, and procedural weave texture.
- `hooks/use-experience.ts`: section-relative scroll and pointer signals in refs; only chapter boundaries trigger React state changes.
- `components/product-studio.tsx`: accessible finish/view selectors, reset, and configuration clipboard action.
- `components/experience-notes.tsx`: a native dialog describing the concept and implementation.
- `styles/theme.css`: scoped `.theme-vela` styles and responsive layouts.
- `public/vela/alpine-dawn.png`: original AI-generated environment, used both as a 3D visor texture and as the immersive section backdrop.

## Controls

Use Design to enter the scroll journey, or select its numbered chapters. Experience jumps directly into the landscape. “Just the view” hides the environment captions. Explore Vela opens the product studio: choose Cloud, Graphite, or Sage and switch between Front, Profile, and Inside. Copy configuration copies a text summary locally; it does not submit anything.

## Performance and accessibility

No model downloads or extra package dependencies. Materials use a generated studio environment. Device pixel ratio is capped at 1.65. The scene pauses when the tab is hidden and uses demand rendering for reduced-motion users, with scroll invalidation so the story remains usable. Native scroll, keyboard-operable buttons, visible focus, a skip link, semantic headings, and a native dialog are retained.

## Validation

```sh
npx eslint src/features/vela src/app/vela src/lib/templates.ts
npm run typecheck
npx next build
```

The root layout uses Google Fonts; an uncached production build requires access to Google’s font servers. Template ZIP packaging elsewhere in the repo uses committed `HEAD`, so new uncommitted routes are not part of that archive yet.
