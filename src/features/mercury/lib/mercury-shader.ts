/**
 * Mercury — a raymarched liquid-chrome metaball.
 *
 * A signed-distance field of several moving spheres, smooth-unioned into one
 * breathing blob of mercury. Each fragment marches a ray to the surface,
 * computes a normal, reflects the view ray, and samples a procedural studio
 * environment — so the metal reflects soft key/fill lights and sharp softbox
 * streaks the way real chrome does. A per-channel chromatic split on the
 * reflection gives the oily, jewel-like edge; a Fresnel term lifts the rim.
 *
 * The pointer pulls a droplet toward the cursor (with a velocity-driven
 * ripple), and scroll melts the blob — satellites spread, the form elongates,
 * and the camera eases in. One fullscreen plane, one ShaderMaterial.
 */

export const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2  uRes;
  uniform float uTime;
  uniform float uYaw;
  uniform float uPitch;
  uniform float uDist;
  uniform float uScroll;    // 0..1 whole-page scroll -> melt + dive
  uniform vec2  uPointer;   // -1..1 normalized pointer
  uniform float uPointerA;  // 0..1 pointer presence (eased)
  uniform float uPVel;      // pointer speed -> ripple energy
  uniform float uReduced;

  #define STEPS 96
  #define MAX_DIST 26.0
  #define SURF 0.0022
  #define PI 3.14159265

  // ---- smooth minimum (polynomial) ----
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  float noise(vec3 x) {
    vec3 i = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
          mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
          mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  // ---- the liquid-chrome SDF ----
  float map(vec3 p) {
    float t = uReduced > 0.5 ? 2.2 : uTime * 0.45;
    float melt = uScroll;

    // central breathing core
    float core = 1.12 + 0.05 * sin(t * 1.3);
    float d = length(p) - core;

    // orbiting droplets, smooth-unioned into the core
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float a = t * (0.55 + 0.08 * fi) + fi * 1.7;
      float rad = 1.05 + 0.35 * sin(t * 0.7 + fi) + melt * 0.9;
      vec3 c = vec3(
        cos(a) * rad,
        sin(a * 1.3 + fi) * (0.55 + melt * 0.6),
        sin(a) * rad * (1.0 - melt * 0.35)
      );
      float s = 0.5 + 0.13 * sin(t + fi * 2.0);
      d = smin(d, length(p - c) - s, 0.62);
    }

    // droplet that chases the cursor (projected onto a plane facing the camera)
    vec3 pc = vec3(uPointer.x * 2.3, uPointer.y * 1.7, 0.0);
    float cs = 0.28 + 0.34 * uPointerA;
    d = smin(d, length(p - pc) - cs, 0.72);

    // surface ripple driven by pointer velocity + gentle idle shimmer
    float ripple = sin(length(p) * 9.0 - uTime * 4.0) * 0.012 * (0.25 + uPVel * 2.0);
    ripple += noise(p * 2.3 + t) * 0.03;
    d += ripple;

    return d;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.0012, 0.0);
    return normalize(vec3(
      map(p + e.xyy) - map(p - e.xyy),
      map(p + e.yxy) - map(p - e.yxy),
      map(p + e.yyx) - map(p - e.yyx)
    ));
  }

  // ---- procedural studio environment the chrome reflects ----
  vec3 env(vec3 d) {
    // cool skylight gradient, dark floor
    vec3 c = mix(vec3(0.015, 0.02, 0.035), vec3(0.30, 0.345, 0.46),
                 smoothstep(-0.45, 0.85, d.y));
    c = mix(c, vec3(0.012, 0.013, 0.02), smoothstep(0.0, -0.75, d.y));

    // warm key light (upper right)
    float key = pow(max(0.0, dot(d, normalize(vec3(0.55, 0.68, 0.48)))), 5.0);
    c += vec3(1.0, 0.82, 0.58) * key * 1.35;

    // cool fill (left)
    float fill = pow(max(0.0, dot(d, normalize(vec3(-0.72, 0.28, -0.4)))), 8.0);
    c += vec3(0.5, 0.68, 1.0) * fill * 0.85;

    // two sharp softbox streaks -> the signature chrome highlights
    float b1 = smoothstep(0.986, 1.0, dot(d, normalize(vec3(0.2, 0.95, 0.1))));
    float b2 = smoothstep(0.99, 1.0, dot(d, normalize(vec3(-0.3, 0.6, 0.72))));
    c += vec3(1.0) * (b1 * 1.8 + b2 * 1.4);

    // faint high-frequency sparkle so reflections never read flat
    c += vec3(0.04) * smoothstep(0.6, 1.0, noise(d * 14.0));
    return c;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

    // orbiting virtual camera
    float yaw = uYaw;
    float pitch = uPitch;
    float dist = uDist;
    vec3 camPos = vec3(cos(pitch) * sin(yaw), sin(pitch), cos(pitch) * cos(yaw)) * dist;
    vec3 fwd = normalize(-camPos);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    vec3 up = cross(fwd, right);
    vec3 rd = normalize(fwd + (uv.x * right + uv.y * up) * 1.25);
    vec3 ro = camPos;

    // raymarch
    float dTotal = 0.0;
    float steps = 0.0;
    bool hit = false;
    vec3 p = ro;
    for (int i = 0; i < STEPS; i++) {
      p = ro + rd * dTotal;
      float d = map(p);
      if (d < SURF) { hit = true; break; }
      dTotal += d * 0.85;        // slight under-relaxation for the ripple field
      steps += 1.0;
      if (dTotal > MAX_DIST) break;
    }

    vec3 col;
    if (hit) {
      vec3 n = calcNormal(p);
      float fres = pow(1.0 - max(0.0, dot(n, -rd)), 5.0);

      // chromatic reflection: split the reflected ray per channel
      float ca = 0.012 + 0.05 * fres;
      vec3 rr = reflect(rd, normalize(n + ca));
      vec3 rg = reflect(rd, n);
      vec3 rb = reflect(rd, normalize(n - ca));
      col = vec3(env(rr).r, env(rg).g, env(rb).b);

      // metal tints its Fresnel rim toward white
      col += fres * vec3(0.9, 0.95, 1.0) * 0.55;

      // cheap AO from march cost -> creases read darker
      float ao = clamp(1.0 - steps / float(STEPS) * 1.15, 0.25, 1.0);
      col *= ao;

      // a touch of warmth pooling in the lower body
      col += vec3(0.12, 0.06, 0.03) * smoothstep(0.4, -0.8, n.y) * 0.4;
    } else {
      // studio backdrop — kept dark and moody so the mercury is the hero
      col = env(rd) * 0.12;
      col = mix(col, vec3(0.012, 0.013, 0.02), 0.62);
      // one soft glow pool centred behind the blob
      float pool = smoothstep(1.05, 0.0, length(uv - vec2(0.0, -0.08)));
      col += vec3(0.05, 0.06, 0.09) * pow(pool, 2.2) * 0.6;
    }

    col *= 1.0 + uScroll * 0.35;

    // ACES filmic tonemap + gamma
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));

    // vignette
    float vig = smoothstep(1.45, 0.3, length(uv));
    col *= 0.5 + 0.5 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;
