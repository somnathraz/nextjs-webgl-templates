/**
 * GLSL for the MIDNIGHT scene. All materials share time, haze and the
 * firework flash, so one burst lights the sky, the towers and the street.
 */

const hash = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float hash31(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
`;

/* ——— Sky dome: gradient, city glow, stars, moon ——— */

export const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 p = projectionMatrix * viewMatrix * vec4(position + cameraPosition, 1.0);
  gl_Position = p.xyww;
}
`;

export const skyFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uMoon;
uniform vec3 uFlash;
varying vec3 vDir;
${hash}
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uZenith, smoothstep(-0.08, 0.62, h));
  col += vec3(0.6, 0.26, 0.22) * exp(-max(h, 0.0) * 8.0) * 0.3;

  vec3 p = d * 150.0;
  vec3 cell = floor(p);
  float s = hash31(cell);
  float star = step(0.9925, s) * smoothstep(0.3, 0.0, length(fract(p) - 0.5));
  star *= 0.55 + 0.45 * sin(uTime * (0.8 + s * 60.0) + s * 300.0);
  col += vec3(0.85, 0.9, 1.0) * star * smoothstep(0.03, 0.35, h) * 1.4;

  float m = dot(d, normalize(uMoon));
  col += vec3(1.0, 0.96, 0.86) * smoothstep(0.99955, 0.9997, m) * 1.6;
  col += vec3(0.5, 0.55, 0.8) * pow(max(m, 0.0), 220.0) * 0.3;

  col += uFlash * 0.03 * (0.4 + 0.6 * smoothstep(-0.1, 0.5, h));
  col += (hash21(gl_FragCoord.xy + fract(uTime) * 37.0) - 0.5) * 0.004;
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;

/* ——— City: one instanced draw call, windows drawn in the shader ——— */

export const cityVertex = /* glsl */ `
attribute vec4 aBox;
attribute vec2 aInfo;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vGrid;
varying float vSeed;
varying float vHeight;
void main() {
  vec3 world = vec3(
    aBox.x + position.x * aBox.z,
    position.y * aInfo.x,
    aBox.y + position.z * aBox.w);
  float along = abs(normal.x) > 0.5 ? world.z : world.x;
  vGrid = vec2(along / 0.5, world.y / 0.72);
  vWorld = world;
  vNormal = normal;
  vSeed = aInfo.y;
  vHeight = aInfo.x;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
`;

export const cityFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uHaze;
uniform vec3 uFlash;
uniform vec3 uFlashPos;
varying vec3 vWorld;
varying vec3 vNormal;
varying vec2 vGrid;
varying float vSeed;
varying float vHeight;
${hash}
void main() {
  float side = 1.0 - step(0.5, vNormal.y);
  vec2 cell = floor(vGrid);
  vec2 f = fract(vGrid);
  float r = hash21(cell + vSeed * 91.0);
  // Whole floors go dark together now and then: offices after hours.
  float floorOn = step(0.28, hash21(vec2(cell.y, vSeed * 53.0)));
  float lit = step(0.6, r) * floorOn;
  float blink = step(0.965, hash21(cell + 7.0 + vSeed));
  lit *= mix(1.0, 0.5 + 0.5 * sin(uTime * (0.4 + r * 1.6) + r * 40.0), blink);
  float pane = smoothstep(0.12, 0.2, f.x) * smoothstep(0.88, 0.8, f.x)
             * smoothstep(0.2, 0.3, f.y) * smoothstep(0.86, 0.76, f.y);
  float detail = 1.0 - smoothstep(0.2, 0.75, max(fwidth(vGrid.x), fwidth(vGrid.y)));
  float window = mix(0.09, lit * pane, detail) * side;
  // Keep the top storey and the ground floor as solid facade.
  window *= step(vWorld.y, vHeight - 0.6) * step(1.2, vWorld.y);

  float tone = hash21(cell + 3.0);
  vec3 lamp = mix(vec3(1.0, 0.7, 0.36), vec3(0.72, 0.84, 1.0), step(0.78, tone));
  lamp = mix(lamp, vec3(1.0, 0.45, 0.6), step(0.97, tone));

  vec3 facade = vec3(0.03, 0.034, 0.066) * (0.75 + 0.5 * vNormal.y + 0.25 * vSeed);
  vec3 col = facade + lamp * window * (0.3 + (r - 0.6) * 2.2);

  vec3 toFlash = normalize(uFlashPos - vWorld);
  col += uFlash * (0.012 + 0.13 * max(dot(vNormal, toFlash), 0.0));

  float fog = 1.0 - exp(-distance(cameraPosition, vWorld) * 0.0105);
  gl_FragColor = vec4(mix(col, uHaze, fog), 1.0);
}
`;

/* ——— Street: wet asphalt, lamp pools along the avenue ——— */

export const groundVertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const groundFragment = /* glsl */ `
uniform vec3 uHaze;
uniform vec3 uFlash;
varying vec3 vWorld;
void main() {
  vec2 lamp = vec2(abs(vWorld.x) - 4.2, mod(vWorld.z, 9.0) - 4.5);
  float pool = exp(-dot(lamp, lamp) * 0.22);
  float lane = smoothstep(0.08, 0.0, abs(vWorld.x)) * step(0.5, fract(vWorld.z * 0.25));
  vec3 col = vec3(0.02, 0.022, 0.04);
  col += vec3(1.0, 0.62, 0.3) * pool * 0.14 * step(abs(vWorld.x), 9.0);
  col += vec3(0.5) * lane * 0.25;
  col += uFlash * 0.025;
  float fog = 1.0 - exp(-distance(cameraPosition, vWorld) * 0.0105);
  gl_FragColor = vec4(mix(col, uHaze, fog), 1.0);
}
`;

/* ——— Traffic: head and tail lights sliding down the avenue ——— */

export const trafficVertex = /* glsl */ `
uniform float uTime;
uniform float uPixel;
attribute vec3 aCar;
varying vec3 vColor;
void main() {
  float lane = aCar.x;
  float heading = sign(lane);
  float z = mod(aCar.y + uTime * aCar.z * heading, 150.0) - 130.0;
  vec4 mv = viewMatrix * vec4(lane, 0.35, z, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPixel * 60.0 / -mv.z;
  vColor = (heading > 0.0 ? vec3(1.0, 0.92, 0.75) : vec3(1.0, 0.12, 0.08)) * exp(mv.z * 0.035) * 0.8;
}
`;

export const spriteFragment = /* glsl */ `
varying vec3 vColor;
void main() {
  float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vColor * a * a, 1.0);
}
`;

/* ——— Snow ——— */

export const snowVertex = /* glsl */ `
uniform float uTime;
uniform float uPixel;
uniform float uCamY;
attribute float aSeed;
varying vec3 vColor;
void main() {
  vec3 p = position;
  float fall = p.y - uTime * (0.9 + aSeed * 1.3);
  p.y = uCamY + mod(fall - uCamY, 36.0) - 18.0;
  p.x += sin(uTime * 0.6 + aSeed * 50.0 + p.y * 0.25) * 0.7;
  p.z += cos(uTime * 0.45 + aSeed * 33.0) * 0.5;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (0.6 + aSeed * 1.4) * uPixel * 26.0 / -mv.z;
  float edge = smoothstep(18.0, 13.0, abs(p.y - uCamY));
  vColor = vec3(0.8, 0.86, 1.0) * (0.22 + 0.3 * aSeed) * edge * exp(mv.z * 0.02);
}
`;

/* ——— Sky lanterns ——— */

export const lanternVertex = /* glsl */ `
uniform float uTime;
attribute vec4 aLantern;
varying float vV;
varying float vSeed;
varying vec3 vWorld;
void main() {
  float seed = aLantern.z;
  float y = 5.0 + mod(seed * 70.0 + uTime * aLantern.w, 70.0);
  vec3 center = vec3(
    aLantern.x + sin(uTime * 0.25 + seed * 30.0) * 1.2,
    y,
    aLantern.y + cos(uTime * 0.2 + seed * 17.0) * 1.2);
  float tilt = sin(uTime * 0.7 + seed * 40.0) * 0.12;
  vec3 p = position * (0.8 + seed * 0.7);
  p.x += p.y * tilt;
  vV = position.y + 0.5;
  vSeed = seed;
  vWorld = center + p;
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
}
`;

export const lanternFragment = /* glsl */ `
uniform float uTime;
uniform float uLanterns;
uniform vec3 uHaze;
varying float vV;
varying float vSeed;
varying vec3 vWorld;
void main() {
  float flame = smoothstep(0.75, 0.0, vV);
  float flicker = 0.85 + 0.15 * sin(uTime * (5.0 + vSeed * 6.0) + vSeed * 80.0);
  vec3 col = mix(vec3(1.0, 0.36, 0.1), vec3(1.0, 0.8, 0.42), flame) * (0.7 + flame * 1.5) * flicker;
  float fog = 1.0 - exp(-distance(cameraPosition, vWorld) * 0.0105);
  gl_FragColor = vec4(mix(col, uHaze, fog) * uLanterns, 1.0);
}
`;

/* ——— Fireworks: closed-form ballistics, trails from time-offset copies ——— */

export const fireVertex = /* glsl */ `
uniform float uTime;
uniform float uPixel;
uniform vec3 uOrigin;
uniform vec3 uLaunch;
uniform float uStart;
uniform float uRise;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uGravity;
uniform float uLife;
uniform float uRing;
attribute vec3 aDir;
attribute vec3 aInfo; // seed, trail 0..1, kind (0 spark, 1 rocket)
varying vec3 vColor;

void main() {
  float seed = aInfo.x;
  float trail = aInfo.y;
  vec3 p;
  float size;
  vColor = vec3(0.0);
  if (aInfo.z > 0.5) {
    // The rocket climbing before it bursts.
    float rt = (uTime - (uStart - uRise) - trail * 0.16) / uRise;
    if (rt > 0.0 && rt < 1.0) {
      p = mix(uLaunch, uOrigin, 1.0 - pow(1.0 - rt, 2.0));
      p.x += sin(rt * 22.0 + seed * 6.0) * 0.12;
      vColor = vec3(1.0, 0.8, 0.5) * (1.0 - trail) * 0.9;
    }
    size = 0.5 * (1.0 - trail * 0.6);
  } else {
    float age = uTime - uStart - trail * 0.2;
    if (age > 0.0 && age < uLife) {
      vec3 dir = aDir;
      dir.z *= mix(1.0, 0.05, uRing);
      dir = normalize(dir);
      float speed = uSpeed * mix(0.5 + 0.5 * seed, 1.0, uRing);
      float travel = (1.0 - exp(-1.5 * age)) / 1.5;
      p = uOrigin + dir * speed * travel - vec3(0.0, uGravity * age * age, 0.0);
      float life = age / uLife;
      float fade = pow(1.0 - life, 1.4);
      float twinkle = mix(1.0, step(0.45, fract(seed * 53.0 + uTime * 11.0)), smoothstep(0.45, 0.85, life));
      vec3 color = mix(uColorA, uColorB, smoothstep(0.12, 0.7, life));
      color = mix(vec3(1.0), color, smoothstep(0.0, 0.1, life));
      vColor = color * fade * twinkle * (1.0 - trail * 0.8) * 1.5;
    }
    size = (0.55 + seed * 0.6) * (1.0 - trail * 0.65);
  }
  if (dot(vColor, vec3(1.0)) <= 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = size * uPixel * 300.0 / -mv.z;
}
`;
