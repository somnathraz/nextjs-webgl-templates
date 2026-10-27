export type TemplateTopic =
  | 'all'
  | '3d'
  | 'commerce'
  | 'architecture'
  | 'agents'
  | 'storytelling'
  | 'audio';

export type Template = {
  href: string;
  slug: string;
  name: string;
  blurb: string;
  preview: string | null;
  previewTone: string;
  stack: string[];
  topics: Exclude<TemplateTopic, 'all'>[];
};

export const TOPICS: {
  id: TemplateTopic;
  label: string;
  title: string;
  body: string;
}[] = [
  {
    id: 'all',
    label: 'All',
    title: 'Every showcase, one deploy',
    body: 'A single Next.js app. Each concept is a route with its own scoped theme, assets, and interaction model.',
  },
  {
    id: '3d',
    label: 'Interactive 3D',
    title: 'Product in the viewport',
    body: 'React Three Fiber scenes for cans, headphones, and spatial storytelling — scroll-linked and drag-aware.',
  },
  {
    id: 'storytelling',
    label: 'Scroll story',
    title: 'Narrative as you scroll',
    body: 'Chaptered sections, sticky stages, and motion that keeps the product in frame while the story moves.',
  },
  {
    id: 'commerce',
    label: 'Commerce',
    title: 'Brand meets shop',
    body: 'Sample bags, flavor pickers, and checkout-adjacent UI that feels like a real storefront concept.',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    title: 'Space, light, material',
    body: 'Immersive architectural pages that treat atmosphere and detail as first-class content.',
  },
  {
    id: 'agents',
    label: 'Agents',
    title: 'Orchestration you can see',
    body: 'Agent workflows with live signals, playgrounds, and execution traces built for demoing AI systems.',
  },
  {
    id: 'audio',
    label: 'Voice & audio',
    title: 'Sound you can see',
    body: 'Generative voice product pages — live synthesis playgrounds, audio-reactive visualizers, and voice galleries.',
  },
];

export const TEMPLATES: Template[] = [
  {
    href: '/odyssey',
    slug: 'odyssey',
    name: 'Odyssey',
    blurb:
      'An infinite terrain flythrough. Procedural mountains, volumetric mist, a moving sun, and a cinematic camera — explore on scroll or drift into endless auto flight.',
    preview: '/odyssey/preview.jpg',
    previewTone: '#284b49',
    stack: ['Next.js', 'Three.js', 'GLSL'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/mercury',
    slug: 'mercury',
    name: 'Mercury',
    blurb:
      'Liquid chrome, raymarched in real time. Sphere-traced metaballs reflect a procedural studio with chromatic edges, a Fresnel rim, and a cursor-chasing droplet — one GLSL shader.',
    preview: null,
    previewTone: '#060607',
    stack: ['Next.js', 'R3F', 'GLSL'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/vela',
    slug: 'vela',
    name: 'Vela Spatial',
    blurb:
      'An immersive spatial-computing concept. A sculpted 3D headset, exploded optics, a visor-to-world journey, and a personal product studio.',
    preview: '/vela/preview.png',
    previewTone: '#f4f3ef',
    stack: ['Next.js', 'R3F', 'Motion'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/flux',
    slug: 'flux',
    name: 'Flux',
    blurb:
      'A real-time GPU fluid simulation. Navier–Stokes with advection, vorticity, and pressure projection — drag your cursor to paint the flow.',
    preview: '/flux/preview.jpg',
    previewTone: '#0a0714',
    stack: ['Next.js', 'R3F', 'GPGPU'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/mycelia',
    slug: 'mycelia',
    name: 'Mycelia',
    blurb:
      'Artificial life on the GPU. Over a million Physarum agents deposit and sense a trail, self-organizing into living networks that chase your cursor.',
    preview: '/mycelia/preview.jpg',
    previewTone: '#05100c',
    stack: ['Next.js', 'R3F', 'GPGPU'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/aviary',
    slug: 'aviary',
    name: 'Aviary',
    blurb:
      'A generative AI voice model. Live synthesis playground, audio-reactive visualizers, a voice gallery, and an encrypted voiceprint vault.',
    preview: null,
    previewTone: '#060609',
    stack: ['Next.js', 'Canvas', 'Motion'],
    topics: ['audio', 'agents', 'storytelling'],
  },
  {
    href: '/singularity',
    slug: 'singularity',
    name: 'Singularity',
    blurb:
      'A real-time raymarched black hole. Gravitational lensing, a Doppler-beamed accretion disk, and a photon ring — one fragment shader.',
    preview: '/singularity/preview.jpg',
    previewTone: '#050309',
    stack: ['Next.js', 'R3F', 'GLSL'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/helios',
    slug: 'helios',
    name: 'HELIOS',
    blurb:
      'A kinetic light sculpture. Reflective metal, a molten core, an orbital scroll journey, and a playable instrument.',
    preview: '/helios/preview.png',
    previewTone: '#101618',
    stack: ['Next.js', 'R3F', 'GLSL'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/nova',
    slug: 'nova',
    name: 'Nova',
    blurb:
      'A GPU particle engine. 90,000 points morph through four shapes as you scroll — pure WebGL shader, one draw call.',
    preview: '/nova/preview.jpg',
    previewTone: '#0a0a12',
    stack: ['Next.js', 'R3F', 'GLSL'],
    topics: ['3d', 'storytelling'],
  },
  {
    href: '/relay',
    slug: 'relay',
    name: 'Relay',
    blurb:
      'Agent orchestration in motion. WebGL signals, interactive workflows, and a visible execution trace.',
    preview: '/relay/preview.png',
    previewTone: '#0b1220',
    stack: ['Next.js', 'R3F', 'Motion'],
    topics: ['agents', '3d'],
  },
  {
    href: '/forme',
    slug: 'forme',
    name: 'FORME Architecture',
    blurb:
      'An immersive architectural study. Explore space, light, and materials in a slower visual rhythm.',
    preview: '/forme/preview.png',
    previewTone: '#1a1814',
    stack: ['Next.js', 'Motion', 'Image'],
    topics: ['architecture', 'storytelling'],
  },
  {
    href: '/aura',
    slug: 'aura',
    name: 'Aura Studio',
    blurb:
      'Luxury headphone storytelling with a live 3D configurator and considered materials.',
    preview: null,
    previewTone: '#141612',
    stack: ['Next.js', 'R3F', 'Web Audio'],
    topics: ['3d', 'commerce', 'storytelling'],
  },
  {
    href: '/offday',
    slug: 'offday',
    name: 'Offday Energy',
    blurb:
      'Sparkling energy brand with 3D packaging, fruit scenes, scroll story, and a sample shop.',
    preview: '/offday/images/offday-court.png',
    previewTone: '#ed683e',
    stack: ['Next.js', 'R3F', 'Motion'],
    topics: ['commerce', '3d', 'storytelling'],
  },
];
