# Odyssey

Open `/odyssey` for a full-screen procedural landscape. Scroll/swipe or use the four waypoints to travel through the valley. Auto flight keeps generating terrain beyond the scroll journey; pause stops camera and atmosphere motion. Sound is opt-in and generated locally with Web Audio. The sun control transitions between dawn and dusk.

The Three.js scene renders a fullscreen GLSL heightfield with five distance-filtered octaves of ridged noise, numerical surface normals, refined intersections, terrain shadows, screen-space antialiasing, a winding watercourse, and twenty-sample layered valley mist, two drifting cloud decks, and a depth-tested flock of animated birds. The camera follows the valley and eases toward scroll-driven travel. No external textures, models, or services are required.

Rendering resolution adapts between 1× and 1.5× CSS resolution without dropping to a visibly pixelated upscale, animation stops when the tab is hidden, and all GPU resources and audio contexts are disposed on unmount. Reduced-motion preferences disable automatic travel and pointer parallax. A static landscape and a visible explanation are shown if WebGL is unavailable.

Files: `home.tsx` owns controls and the scroll signal, `components/terrain-scene.tsx` owns the renderer lifecycle, `lib/terrain-shader.ts` defines the world, and `styles/theme.css` scopes the presentation.
