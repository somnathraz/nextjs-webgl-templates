# Relay — Intelligence in motion

Route `/relay` in the root Next.js application. No extra dependencies or standalone app.

## Design

Graphite, warm ivory, and copper. The story moves from an abstract signal core to an inspectable graph, then into a working workflow simulation. The WebGL field and SVG graphics are original procedural assets; no external template assets were copied.

References reviewed: LangChain's current platform site (https://www.langchain.com/), Cognition's product positioning (https://cognition.com/), Framer's AI template gallery (https://www.framer.com/marketplace/templates/categories/ai/), and Framer's design features (https://www.framer.com/design/). These informed the workflow emphasis, hierarchy, and interaction vocabulary, not a pixel-for-pixel recreation.

## Files

- `home.tsx`: server-rendered page composition.
- `components/hero.tsx`: scroll parallax, pointer-following spring marker, lazy WebGL import.
- `components/signal-core.tsx`: particle shader, interwoven filament geometry, pointer tilt, scroll-velocity rotation, rendering fallback.
- `components/scroll-story.tsx`: three pinned narrative chapters.
- `components/network.tsx`: morphing SVG paths, animated signal strokes, inspectable nodes, unique SVG pattern IDs.
- `components/playground.tsx`: run, pause, resume, reset, scenario switching, trace, result copy.
- `components/telemetry.tsx`: selectable illustrative line-chart series.
- `lib/workflows.ts`: scenario text, agent names, and sample artifacts.
- `styles/theme.css`: all route styling scoped to `.theme-relay`.

## Behavior and scope

The playground is a deterministic browser simulation. Each stage advances after 1.4 seconds. Pausing cancels the pending stage timer; resuming starts that stage timer again. Changing scenario resets the previous run. No model calls, account access, messaging, publishing, or backend execution occur. Results and chart data are labeled as illustrative. Copy result writes only the visible sample artifact to the clipboard after a click.

WebGL pauses offscreen, caps device pixel density, and uses local buffers without downloaded assets. Pointer effects apply to mouse input only. Reduced-motion preferences remove decorative motion, parallax, and smooth scrolling. Native links, keyboard-operable node buttons, explicit status messages, and a native modal dialog support non-pointer interaction. A CSS core replaces WebGL if the renderer fails.

## Adaptation

Replace `WORKFLOWS` to tailor the examples. Connect execution state to your own agent backend when needed; preserve inspectable stages and explicit review boundaries. The UI does not claim real performance metrics or customer deployments. Camera, geometry, and shader settings live in `signal-core.tsx`; graph positions and connections are in `network.tsx`.

Run `npx eslint src/features/relay src/app/relay src/app/page.tsx`, `npm run typecheck`, and `npm run build` from the root. The existing OFFDAY fruit-model purity error is independent of this route.
