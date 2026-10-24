# FORME

A route-based architectural showcase in the root Next.js app. Visit `/forme`; no separate app, package manifest, or server is required.

## Structure

- `src/app/forme/`: route composition, metadata, and `.theme-forme` layout.
- `home.tsx`: server-rendered editorial page.
- `components/architecture-experience.tsx`: view, material, lighting, and rotation controls.
- `components/pavilion-scene.tsx`: dynamically loaded Three.js scene with a procedural furnished pavilion, pool, tree forms, shadows, and an exploded roof.
- `hooks/use-architecture-scroll.ts`: normalized scroll progress, updated at most once per animation frame.
- `lib/materials.ts`: editable palettes.
- `styles/theme.css`: styles scoped to `.theme-forme`, including mobile and reduced-motion rules.
- `public/forme/courtyard-house.png`: original generated architectural image.

## Interaction

Scroll through Approach → Inhabit → Unfold. The camera follows a continuous interpolated path. Selecting a camera button overrides scrolling until Follow scroll is selected. Material choices alter masonry and timber; Blue hour changes lighting. Rotate turns the pavilion by 45 degrees. Design notes use a native modal dialog with Escape dismissal and focus containment.

The 3D scene pauses offscreen, caps pixel density, disposes its procedural texture, and has a photograph fallback on rendering failure. Reduced motion removes the continuous camera travel and introductory animation. Static editorial content remains available without WebGL.

## Scope

This is a fictional practice and conceptual architectural study, not a real commissioned building or construction model. The generated photograph and stylized procedural model are related interpretations rather than a photogrammetric match. The model is not photorealistic. The contact link uses `hello@example.com`; replace it before publishing. There is no inquiry backend or analytics. No new dependencies were added.

## Validation

Run `npm run typecheck`, `npm run build`, and `npx eslint src/features/forme src/app/forme src/app/page.tsx` from the root. The repo-wide lint currently reports a pre-existing `Math.random()` render-purity violation in OFFDAY's fruit model.
