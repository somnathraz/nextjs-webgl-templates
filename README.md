# Premium Frontend

One Next.js app. One domain. Each showcase is a route.

| Route | Showcase |
|-------|----------|
| `/` | Gallery |
| `/aura` | Aura Studio |
| `/offday` | Offday Energy |
| `/forme` | FORME Architecture |
| `/relay` | Relay Agent Orchestration |
| `/nova` | Nova Particle Engine |
| `/helios` | HELIOS Kinetic Light Sculpture |
| `/vela` | Vela Spatial Computing |
| `/singularity` | Singularity (raymarched black hole) |
| `/mycelia` | Mycelia (GPU slime-mold / artificial life) |
| `/flux` | Flux (real-time GPU fluid simulation) |

## Run

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```sh
npm run typecheck
npm run lint
npm run build
```

## Add a new showcase

1. Create `src/features/<slug>/` with components, hooks, lib, and scoped `styles/theme.css`
2. Add `src/app/<slug>/layout.tsx` (import theme, wrap `.theme-<slug>`) and `page.tsx`
3. Put static assets in `public/<slug>/`
4. Add an entry in `src/lib/templates.ts`
5. Push — one deploy ships the new route

Scope CSS with:

```sh
node scripts/scope-css.mjs path/to/globals.css src/features/<slug>/styles/theme.css .theme-<slug>
```

## Legacy folders

`aura-studio/` and `offday-energy/` are the original standalone apps (archived sources). The live app is the root Next.js project.

## Download as template

**Download ZIP** is on the gallery home and in every showcase header
(Aura, Offday, FORME, Relay). Aura/Offday also keep a fixed top-right chip.

Links go through `/api/template-zip`, which serves the packed local ZIP when
present, otherwise redirects to the GitHub archive.

- `prebuild` runs `npm run pack:template` → `public/downloads/premium-frontend-template.zip`
  via `git archive` (no `node_modules`, `.next`, or archived apps).

```sh
npm run pack:template
```

## Deploy

Connect this repo to Vercel (or similar). Root directory = repo root. Framework = Next.js. One production URL serves `/`, `/aura`, `/offday`, `/forme`, `/relay`.
