# HELIOS — A study in captured light

An original kinetic sculpture and interactive art direction study at `/helios`.

## Creative direction

- **Visual thesis:** a precision metal artifact holds a molten light source inside an atmospheric, dark studio.
- **Content:** a typographic opening poster → three continuous scroll chapters → a working sculpture instrument → replay.
- **Interaction:** the same 72 blades unfold, disperse into orbits, and recede into a particle tunnel; the instrument exposes aperture, energy, finish, pause, and pulse controls.

## Structure

- `home.tsx`: page composition, chapter copy, preparation state, and controls.
- `components/sculpture.tsx`: instanced blade assembly, reflective studio environment, core shader, dust, camera choreography, and bloom pipeline.
- `lib/geometry.ts`: procedural solid blade geometry and seeded particle attributes.
- `lib/shaders.ts`: animated molten-surface and particle shaders.
- `lib/choreography.ts`: content, types, settings, and interpolation helpers.
- `hooks/use-choreography.ts`: section-relative scroll and pointer signals. No scroll hijacking.
- `hooks/use-sound.ts`: opt-in synthesized harmonic sound with cleanup and hidden-tab muting.
- `components/instrument.tsx`: native labeled sliders and material/motion controls.
- `styles/theme.css`: isolated `.theme-helios` styles.

## Rendering and accessibility

No downloaded models, HDRs, or textures. The Three.js chunk is client-lazy-loaded. Blade instancing keeps the main geometry in one draw call. Particle counts are reduced on narrow viewports; DPR is capped at 1.5. A procedural room supplies material reflections. Three.js UnrealBloomPass and OutputPass produce the final image.

Preparation percentages correspond to setup milestones (scene, environment, shader compilation), not asset-download estimates. A WebGL failure has a static fallback. Sound requires a deliberate click; it is never autoplayed. Reduced-motion preferences suppress continuous animation and entrance effects while leaving controls usable. Background rendering stops when the document is hidden. The native field-notes dialog supports Escape, focus trapping, and a close button.

## Customize

Edit chapter copy in `lib/choreography.ts`. Adjust blade geometry in `lib/geometry.ts`. Material colors and the camera/assembly choreography live in `components/sculpture.tsx`. This is a frontend art experience, with no API keys or backend.

## Validate

```sh
npx eslint src/features/helios src/app/helios src/lib/templates.ts
npm run typecheck
npx next build
```

Reference APIs: [Three.js bloom](https://threejs.org/docs/pages/UnrealBloomPass.html), [RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html), and [R3F rendering hooks](https://r3f.docs.pmnd.rs/api/hooks).
