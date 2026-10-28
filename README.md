# Next.js WebGL Templates

14 open-source **Next.js 16 + React Three Fiber / WebGL** templates in one app. A 3D Wrapped engine with versus mode, raymarched black holes, GPU fluid simulation, a million-agent slime mold, scroll-driven 3D product pages. Each template is a route you can copy out and ship.

**[Live demo →](https://demo.somanathkhadanga.com)** · MIT licensed · Built by [Somnath Khadanga](https://somanathkhadanga.com)

## Templates

| Template | What it is | Stack | Live |
|---|---|---|---|
| **Wrapped 2026** | A Wrapped engine: your GitHub year in 3D, versus mode, share cards and OG images, with an adapter for any per-day data | R3F, next/og | [demo](https://demo.somanathkhadanga.com/wrapped) |
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

## Wrapped: a Wrapped engine, not just GitHub

`/wrapped` is a **data-agnostic "Wrapped" engine** with GitHub as the demo adapter. Give it one number per day and it builds the whole thing: a 3D story where every cube is a day, a coder/athlete/customer "type", a downloadable share card, a per-user OG image, and a **versus mode** that pits two people against each other over four rounds.

| Route | What it shows |
|---|---|
| `/wrapped/<github-user>` | Anyone's GitHub year |
| `/wrapped/<user>/vs/<friend>` | Versus: four rounds, overlap days, a verdict and a versus card |
| `/wrapped/_sample`, `/wrapped/_sample/vs/_rival` | Built-in sample years (no network) |
| `/wrapped/_stride` | The same engine on fitness data (km per day) |

**Wrap your own product.** An adapter is two small files:

1. **Data**: return `WrappedData` (`src/features/wrapped/engine/types.ts`): `days` (one `{ date, count }` per day), plus optional `breakdown` (shares: languages, sports, categories), `ranking` (top 3: repos, routes, products) and `events` (timestamps for the "peak hour" clock). See `adapters/stride/sample.ts`; swap it for a query against your own database.
2. **Words**: a `Copy` deck (`engine/copy.ts`) naming your unit, your verbs and your seven archetypes. See `adapters/stride/copy.ts`.

Register the copy in `adapters/copy.ts` and route the id in `adapters/index.ts`. Slides with no data skip themselves.

**GitHub data.** It works with no setup: it reads the public contribution calendar plus the public REST API (60 requests/hour per server IP, cached for an hour). For production traffic, add a token so languages and repos come from one GraphQL call with a 5,000/hour limit:

```sh
GITHUB_TOKEN=github_pat_...        # fine-grained, public read-only is enough
NEXT_PUBLIC_SITE_URL=https://your-domain.com   # absolute URLs for the OG images (Vercel sets this for you)
```

Bump `WRAPPED_YEAR` in `src/features/wrapped/engine/year.ts` next December.

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
