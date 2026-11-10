/**
 * GLSL for the FATHOM scene. Every material shares the same uniforms
 * (time, zone coordinate, water colour, torch) so the whole ocean reacts to
 * one scroll signal.
 */

const noise = /* glsl */ `
float hash31(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x),
        mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
        mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.02 + 7.3;
    a *= 0.5;
  }
  return s;
}
`;

/* ——— Backdrop: water column gradient, light shafts, surface glare ——— */

export const backdropVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

export const backdropFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uT;
uniform float uTime;
uniform float uAspect;
uniform vec2 uPointer;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  vec2 uv = vUv;
  vec3 col = mix(uBottom, uTop, smoothstep(0.0, 1.0, uv.y));

  // Light shafts fanning out from a sun above the frame.
  float sun = 1.0 - smoothstep(0.0, 1.5, uT);
  vec2 p = vec2((uv.x - 0.5 - uPointer.x * 0.04) * uAspect, uv.y - 1.4);
  float a = atan(p.x, -p.y);
  float shafts = 0.5 + 0.5 * sin(a * 13.0 + uTime * 0.22 + sin(a * 5.0 - uTime * 0.13) * 2.0);
  shafts *= 0.55 + 0.45 * sin(a * 31.0 - uTime * 0.35);
  shafts = pow(max(shafts, 0.0), 1.6);
  float reach = smoothstep(1.9, 0.25, length(p));
  col += vec3(0.5, 0.95, 0.9) * shafts * reach * sun * 0.3;

  // Rippling glare just under the surface.
  float surface = smoothstep(0.5, 1.0, uv.y) * (1.0 - smoothstep(0.0, 0.55, uT));
  float caustic = noise2(vec2(uv.x * uAspect * 5.0 + uTime * 0.18, uv.y * 13.0 - uTime * 0.3));
  caustic *= noise2(vec2(uv.x * uAspect * 9.0 - uTime * 0.12, uv.y * 20.0 + uTime * 0.2)) * 2.0;
  col += vec3(0.65, 1.0, 0.95) * surface * (0.06 + caustic * 0.32);

  // Hydrothermal warmth rising from below in the abyss.
  float vent = smoothstep(2.9, 3.5, uT) * (1.0 - smoothstep(4.0, 4.7, uT));
  col += vec3(0.42, 0.11, 0.02) * vent * pow(1.0 - uv.y, 3.0) * 0.3;

  vec2 q = uv - 0.5;
  col *= 1.0 - dot(q, q) * 0.75;
  col += (hash(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) * (0.0025 + col * 0.02);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

/* ——— Marine snow: an endless column of drifting particles ——— */

export const snowVertex = /* glsl */ `
uniform float uTime;
uniform float uCamY;
uniform float uT;
uniform float uPixel;
uniform float uAspect;
uniform vec2 uPointer;
attribute float aSeed;
varying float vAlpha;
varying float vGlow;

void main() {
  vec3 p = position;
  p.x += sin(uTime * 0.15 + aSeed * 40.0) * 0.5;
  p.z += cos(uTime * 0.12 + aSeed * 31.0) * 0.5;
  float y = p.y - uTime * 0.14 * (0.4 + aSeed);
  p.y = uCamY + mod(y - uCamY, 30.0) - 15.0;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.5 + aSeed * 1.7) * uPixel * 30.0 / -mv.z;

  vec2 ndc = gl_Position.xy / gl_Position.w;
  float deep = smoothstep(1.3, 2.2, uT);
  float torch = smoothstep(0.6, 0.0, distance(ndc * vec2(uAspect, 1.0), uPointer * vec2(uAspect, 1.0))) * deep;
  float alive = step(0.82, fract(aSeed * 7.13)) * deep;
  float twinkle = 0.5 + 0.5 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 90.0);
  vGlow = alive * twinkle + torch * 1.4;
  float visibility = exp(mv.z * 0.05);
  float edge = smoothstep(15.0, 11.0, abs(p.y - uCamY));
  vAlpha = (0.2 + 0.3 * aSeed) * visibility * edge * mix(0.45, 1.0, smoothstep(0.0, 1.0, uT));
}
`;

export const snowFragment = /* glsl */ `
varying float vAlpha;
varying float vGlow;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 col = mix(vec3(0.75, 0.9, 1.0), vec3(0.25, 1.0, 0.88), clamp(vGlow, 0.0, 1.0));
  gl_FragColor = vec4(col * (1.0 + vGlow * 3.0), vAlpha * a);
}
`;

/* ——— Bubbles: only near the surface ——— */

export const bubbleVertex = /* glsl */ `
uniform float uTime;
uniform float uPixel;
attribute float aSeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  float rise = mod(p.y + uTime * (0.5 + aSeed * 0.9), 16.0);
  p.y = rise - 13.0;
  p.x += sin(uTime * (1.0 + aSeed) + aSeed * 60.0) * 0.18;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.6 + aSeed * 1.8) * uPixel * 60.0 / -mv.z;
  vAlpha = smoothstep(0.0, 2.0, rise) * smoothstep(16.0, 13.0, rise) * exp(mv.z * 0.05);
}
`;

export const bubbleFragment = /* glsl */ `
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float ring = smoothstep(0.5, 0.44, d) * smoothstep(0.3, 0.46, d);
  float glint = smoothstep(0.14, 0.0, length(c - vec2(-0.16, -0.16)));
  gl_FragColor = vec4(vec3(0.85, 1.0, 1.0), (ring * 0.6 + glint * 0.8) * vAlpha);
}
`;

/* ——— Sardine bait ball: one instanced draw call ——— */

export const fishVertex = /* glsl */ `
uniform float uTime;
uniform float uVelocity;
uniform vec3 uCenter;
attribute vec4 aSeed;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vBelly;

void main() {
  float speed = 0.32 + aSeed.w * 0.26;
  float ang = aSeed.x + uTime * speed;
  float yy = aSeed.z * 2.0 - 1.0;
  float funnel = 0.5 + 0.5 * yy * yy + 0.22 * sin(yy * 3.0 + uTime * 0.3);
  float rad = (1.0 + aSeed.y * 2.3) * funnel * (1.0 + uVelocity * 0.5);
  float y = yy * 3.8 + sin(ang * 2.0 + aSeed.w * 20.0) * 0.25;
  vec3 radial = vec3(cos(ang), 0.0, sin(ang));
  vec3 fwd = vec3(-sin(ang), 0.0, cos(ang));
  vec3 up = vec3(0.0, 1.0, 0.0);
  float size = 0.34 + aSeed.w * 0.3;
  vec3 l = position * size;
  l.z += sin(l.x * 10.0 - uTime * (9.0 + aSeed.w * 4.0) + aSeed.w * 50.0) * 0.04 * size * (0.6 - position.x * 1.4);
  vec3 world = uCenter + radial * rad + up * y + fwd * l.x + up * l.y + radial * l.z;
  vNormal = normalize(fwd * normal.x + up * normal.y + radial * normal.z);
  vWorld = world;
  vBelly = position.y / 0.13;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

export const fishFragment = /* glsl */ `
uniform vec3 uWater;
varying vec3 vNormal;
varying vec3 vWorld;
varying float vBelly;

void main() {
  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(0.25, 1.0, 0.35));
  vec3 view = normalize(cameraPosition - vWorld);
  float diffuse = max(dot(n, light), 0.0);
  float spec = pow(max(dot(reflect(-light, n), view), 0.0), 22.0);
  float glint = pow(max(dot(n, view), 0.0), 5.0);
  float back = smoothstep(0.15, 0.75, vBelly);
  vec3 base = mix(vec3(0.62, 0.8, 0.88), vec3(0.03, 0.16, 0.27), back);
  base = mix(base, vec3(0.95, 1.0, 1.0), smoothstep(-0.2, -0.8, vBelly) * 0.5);
  vec3 col = base * (uWater * 1.5 + vec3(0.75, 0.95, 1.0) * diffuse * 0.75);
  col += vec3(1.6, 1.7, 1.8) * spec * (1.0 - back);
  col += vec3(0.5, 0.8, 0.9) * glint * 0.22 * (1.0 - back);
  float visibility = exp(-distance(cameraPosition, vWorld) * 0.06);
  gl_FragColor = vec4(mix(uWater, col, visibility), 1.0);
}
`;

/* ——— Jellyfish: pulsing bells and trailing tentacles ——— */

const jellyCenter = /* glsl */ `
vec3 jellyCenter(vec4 jelly, float phase) {
  return jelly.xyz + vec3(
    sin(uTime * 0.2 + phase) * 0.4,
    sin(uTime * 0.45 + phase) * 0.35,
    cos(uTime * 0.17 + phase) * 0.3);
}
`;

export const bellVertex = /* glsl */ `
uniform float uTime;
attribute vec4 aJelly;
attribute vec3 aTint;
attribute float aPhase;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTint;
varying float vV;
varying float vAng;
varying float vPulse;
${jellyCenter}

void main() {
  float v = 1.0 - position.y;
  float pulse = sin(uTime * 1.7 + aPhase - v * 2.2);
  vec3 p = position;
  float ang = atan(p.z, p.x);
  p.xz *= 1.0 + pulse * 0.16 * v + sin(ang * 10.0) * 0.035 * v * v;
  p.y *= 0.82 - pulse * 0.07;
  p.y -= v * v * 0.14 * (1.0 + pulse);
  vec3 world = jellyCenter(aJelly, aPhase) + p * aJelly.w;
  vNormal = normal;
  vWorld = world;
  vTint = aTint;
  vV = v;
  vAng = ang;
  vPulse = pulse;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

export const bellFragment = /* glsl */ `
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vTint;
varying float vV;
varying float vAng;
varying float vPulse;

void main() {
  vec3 view = normalize(cameraPosition - vWorld);
  float fresnel = pow(1.0 - abs(dot(normalize(vNormal), view)), 2.0);
  float ribs = pow(abs(sin(vAng * 8.0)), 22.0) * smoothstep(0.1, 0.9, vV);
  float rim = smoothstep(0.84, 1.0, vV);
  float core = smoothstep(0.5, 0.0, vV) * (0.55 + 0.45 * sin(vAng * 4.0));
  float glow = fresnel * 0.85 + ribs * 0.45 + rim * 0.9 + core * 0.6 + 0.07;
  float visibility = exp(-distance(cameraPosition, vWorld) * 0.05);
  vec3 col = mix(vTint, vec3(1.0), core * 0.35) * glow * (0.85 + 0.15 * vPulse);
  gl_FragColor = vec4(col * visibility, 1.0);
}
`;

export const tentacleVertex = /* glsl */ `
uniform float uTime;
attribute vec4 aJelly;
attribute vec3 aTint;
attribute float aPhase;
attribute vec4 aTent;
varying vec3 vTint;
varying float vS;
varying float vAcross;
varying float vFade;
${jellyCenter}

void main() {
  float s = -position.y;
  float pulse = sin(uTime * 1.7 + aPhase - 2.2);
  float reach = aTent.w * (1.0 + pulse * 0.16 * step(0.5, aTent.w));
  vec3 p = vec3(cos(aTent.x) * reach, -0.12 - s * aTent.y, sin(aTent.x) * reach);
  float sway = s * (0.4 + s);
  p.x += sin(s * 7.0 - uTime * 1.6 + aPhase + aTent.x * 3.0) * 0.14 * sway - cos(aTent.x) * 0.2 * s;
  p.z += cos(s * 6.0 - uTime * 1.3 + aPhase * 1.7 + aTent.x) * 0.14 * sway - sin(aTent.x) * 0.2 * s;
  vec4 mv = viewMatrix * vec4(jellyCenter(aJelly, aPhase) + p * aJelly.w, 1.0);
  mv.x += position.x * aTent.z * aJelly.w * (1.0 - s * 0.75);
  vTint = aTint;
  vS = s;
  vAcross = uv.x;
  vFade = exp(mv.z * 0.05);
  gl_Position = projectionMatrix * mv;
}
`;

export const tentacleFragment = /* glsl */ `
varying vec3 vTint;
varying float vS;
varying float vAcross;
varying float vFade;
void main() {
  float across = 1.0 - abs(vAcross - 0.5) * 2.0;
  float body = (1.0 - vS) * 0.5 + 0.08;
  gl_FragColor = vec4(vTint * body * across * vFade, 1.0);
}
`;

/* ——— Siphonophore: a forty-metre chain of travelling light ——— */

const chainSway = /* glsl */ `
vec3 chainSway(vec3 p, float u) {
  p.x += sin(uTime * 0.5 + u * 22.0) * 0.35;
  p.z += cos(uTime * 0.4 + u * 17.0) * 0.3;
  p.y += sin(uTime * 0.3 + u * 9.0) * 0.2;
  return p;
}
`;

export const chainVertex = /* glsl */ `
uniform float uTime;
varying float vU;
varying float vFade;
${chainSway}
void main() {
  vU = uv.x;
  vec4 mv = viewMatrix * vec4(chainSway(position, uv.x), 1.0);
  vFade = exp(mv.z * 0.045) * smoothstep(1.5, 6.0, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const chainFragment = /* glsl */ `
uniform float uTime;
varying float vU;
varying float vFade;
void main() {
  float pulse = pow(0.5 + 0.5 * sin(vU * 150.0 - uTime * 3.2), 10.0);
  float swell = 0.5 + 0.5 * sin(vU * 14.0 + uTime * 0.7);
  vec3 col = mix(vec3(0.45, 0.3, 1.0), vec3(0.2, 0.95, 1.0), swell);
  gl_FragColor = vec4(col * (0.22 + pulse * 2.4) * vFade, 1.0);
}
`;

export const beadVertex = /* glsl */ `
uniform float uTime;
uniform float uPixel;
attribute float aU;
varying float vFade;
varying float vU;
${chainSway}
void main() {
  vec4 mv = viewMatrix * vec4(chainSway(position, aU), 1.0);
  float pulse = pow(0.5 + 0.5 * sin(aU * 150.0 - uTime * 3.2), 6.0);
  gl_PointSize = (1.0 + pulse * 2.2) * uPixel * 70.0 / -mv.z;
  vFade = exp(mv.z * 0.045) * (0.35 + pulse) * smoothstep(1.5, 6.0, -mv.z);
  vU = aU;
  gl_Position = projectionMatrix * mv;
}
`;

export const beadFragment = /* glsl */ `
uniform float uTime;
varying float vFade;
varying float vU;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(vec3(0.6, 0.4, 1.0), vec3(0.3, 1.0, 0.95), 0.5 + 0.5 * sin(vU * 14.0 + uTime * 0.7));
  gl_FragColor = vec4(col * a * a * vFade, 1.0);
}
`;

/* ——— Rock: chimneys, trench walls, sea floor. Lit only by your torch ——— */

export const rockVertex = /* glsl */ `
uniform float uAmp;
uniform float uFreq;
varying vec3 vWorld;
${noise}
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * normal);
  float h = fbm(world.xyz * uFreq);
  h += 0.35 * vnoise(world.xyz * uFreq * 5.0);
  world.xyz += n * (h - 0.5) * uAmp;
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const rockFragment = /* glsl */ `
uniform vec3 uWater;
uniform vec3 uTorch;
uniform vec3 uRock;
uniform float uHeatY;
uniform float uTime;
varying vec3 vWorld;
${noise}
void main() {
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  vec3 view = normalize(cameraPosition - vWorld);
  if (dot(n, view) < 0.0) n = -n;
  vec3 toTorch = uTorch - vWorld;
  float d = length(toTorch);
  float lit = max(dot(n, toTorch / d), 0.0) / (1.0 + d * d * 0.03);
  float grain = 0.65 + 0.35 * vnoise(vWorld * 4.0);
  float strata = 0.8 + 0.2 * sin(vWorld.y * 2.6 + vnoise(vWorld * 0.6) * 5.0);
  vec3 col = uRock * grain * strata * (lit * 5.0 * vec3(0.7, 0.9, 1.0) + 0.05);
  col += vec3(0.25, 0.5, 0.6) * pow(1.0 - max(dot(n, view), 0.0), 3.0) * 0.03;

  // Chimney mouths glow where the vent water leaves.
  float heat = smoothstep(uHeatY - 2.6, uHeatY + 0.4, vWorld.y);
  float flicker = 0.75 + 0.25 * sin(uTime * 2.3 + vWorld.x * 3.0);
  col += vec3(1.0, 0.28, 0.05) * pow(heat, 5.0) * flicker * 1.2;

  float visibility = exp(-distance(cameraPosition, vWorld) * 0.045);
  gl_FragColor = vec4(mix(uWater, col, visibility), 1.0);
}
`;

/* ——— Vent plumes ——— */

export const plumeVertex = /* glsl */ `
uniform float uTime;
uniform float uPixel;
attribute vec3 aVent;
attribute vec2 aSeed;
varying float vLife;
varying float vFade;
void main() {
  float life = fract(uTime * (0.05 + aSeed.x * 0.05) + aSeed.y);
  float spread = life * life * 2.4 + 0.08;
  vec3 p = aVent + vec3(0.0, life * 10.0, 0.0);
  p.x += sin(aSeed.y * 91.0 + life * 6.0) * spread + sin(uTime * 0.4 + aSeed.x * 20.0) * 0.25 * life;
  p.z += cos(aSeed.x * 77.0 + life * 5.0) * spread;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = (0.8 + life * 4.0) * uPixel * 90.0 / -mv.z;
  vLife = life;
  vFade = (1.0 - life) * smoothstep(0.0, 0.06, life) * exp(mv.z * 0.045);
  gl_Position = projectionMatrix * mv;
}
`;

export const plumeFragment = /* glsl */ `
varying float vLife;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  vec3 col = mix(vec3(1.0, 0.42, 0.1), vec3(0.1, 0.14, 0.2), smoothstep(0.0, 0.3, vLife));
  gl_FragColor = vec4(col * a * a * vFade * 0.55, 1.0);
}
`;
