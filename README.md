# Next.js WebGL Templates

13 open-source **Next.js 16 + React Three Fiber / WebGL** templates in one app. Raymarched black holes, GPU fluid simulation, a million-agent slime mold, scroll-driven 3D product pages. Each template is a route you can copy out and ship.

**[Live demo →](https://demo.somanathkhadanga.com)** · MIT licensed · Built by [Somnath Khadanga](https://somanathkhadanga.com)

## Templates

| Template | What it is | Stack | Live |
|---|---|---|---|
| **Odyssey** | Infinite procedural terrain flythrough with volumetric mist | Three.js, GLSL | [demo](https://demo.somanathkhadanga.com/odyssey) |
| **Mercury** | Raymarched liquid-chrome metaballs, one fragment shader | R3F, GLSL | [demo](https://demo.somanathkhadanga.com/mercury) |
| **Vela Spatial** | Spatial-computing headset, exploded optics, visor-to-world scroll | R3F, Motion | [demo](https://demo.somanathkhadanga.com/vela) |
| **Flux** | Real-time Navier–Stokes fluid sim you paint with the cursor | R3F, GPGPU | [demo](https://demo.somanathkhadanga.com/flux) |
| **Mycelia** | 1M+ Physarum agents self-organizing on the GPU | R3F, GPGPU | [demo](https://demo.somanathkhadanga.com/mycelia) |
| **Aviary** | AI voice product page with audio-reactive visualizers | Canvas, Motion | [demo](https://demo.somanathkhadanga.com/aviary) |
| **Singularity** | Raymarched black hole with gravitational lensing | R3F, GLSL | [demo](https://demo.somanathkhadanga.com/singularity) |
| **HELIOS** | Kinetic light sculpture with a playable instrument | R3F, GLSL | [demo](https://demo.somanathkhadanga.com/helios) |
| **Nova** | 90,000 GPU particles morphing between shapes on scroll | R3F, GLSL | [demo](https://demo.somanathkhadanga.com/nova) |
| **Relay** | Agent orchestration with live WebGL signals | R3F, Motion | [demo](https://demo.somanathkhadanga.com/relay) |
| **FORME Architecture** | Immersive architectural study | Motion | [demo](https://demo.somanathkhadanga.com/forme) |
| **Aura Studio** | Headphone storytelling with a live 3D configurator | R3F, Web Audio | [demo](https://demo.somanathkhadanga.com/aura) |
| **Offday Energy** | 3D packaging, fruit scenes, scroll story, sample shop | R3F, Motion | [demo](https://demo.somanathkhadanga.com/offday) |

## Quick start

```sh
git clone https://github.com/somnathraz/nextjs-webgl-templates.git
cd nextjs-webgl-templates
npm ci
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). Requires Node 22+.

```sh
npm run typecheck
npm run lint
npm run build
```

## Using a single template

Every template is self-contained:

- `src/features/<slug>/` — components, hooks, shaders, and a scoped `styles/theme.css`
- `src/app/<slug>/` — the route (`layout.tsx` imports the theme and wraps `.theme-<slug>`)
- `public/<slug>/` — static assets

Copy those three folders into any Next.js 15/16 app with `three`, `@react-three/fiber`, and `motion` installed. Theme CSS is scoped to `.theme-<slug>`, so it won't leak into your styles.

## Add your own

1. Create `src/features/<slug>/` with components, hooks, lib, and `styles/theme.css`
2. Add `src/app/<slug>/layout.tsx` and `page.tsx`
3. Put assets in `public/<slug>/`
4. Register it in `src/lib/templates.ts`

To scope an existing stylesheet:

```sh
node scripts/scope-css.mjs path/to/globals.css src/features/<slug>/styles/theme.css .theme-<slug>
```

## Deploy

Import the repo into Vercel. Framework is Next.js, root directory is the repo root. One deploy serves the gallery and every template route.

## Credits

Fonts are loaded from Google Fonts (SIL OFL). 3D is built on [three.js](https://threejs.org) and [React Three Fiber](https://r3f.docs.pmnd.rs).

## License

[MIT](LICENSE) © Somnath Khadanga

Need something like this built for your product? [Work with me](https://somanathkhadanga.com).
