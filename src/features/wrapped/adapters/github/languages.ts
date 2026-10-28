/** Linguist colors for the languages people actually ship. Anything else
 *  gets a stable hashed hue so the planets never collide on grey. */
const COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Dart: '#00B4AB',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
  Lua: '#000080',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Astro: '#ff5a03',
  MDX: '#fcb32c',
  GLSL: '#5686a5',
  WGSL: '#1a5e9a',
  Solidity: '#AA6746',
  Haskell: '#5e5086',
  OCaml: '#ef7a08',
  Scala: '#c22d40',
  Clojure: '#db5855',
  Nix: '#7e7eff',
  'Jupyter Notebook': '#DA5B0B',
  R: '#198CE7',
  Julia: '#a270ba',
  Dockerfile: '#384d54',
  HCL: '#844FBA',
};

export function languageColor(name: string | null | undefined): string {
  if (!name) return '#8b8d97';
  if (COLORS[name]) return COLORS[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 70%, 60%)`;
}
