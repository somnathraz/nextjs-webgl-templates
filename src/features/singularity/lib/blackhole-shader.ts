/**
 * Fullscreen raymarched Schwarzschild-ish black hole.
 *
 * Each fragment traces a photon from the virtual camera and bends its path
 * toward the singularity with an inverse-square deflection every step — the
 * standard approximation that reproduces the photon ring, the Einstein ring of
 * lensed background stars, and the "halo" where the far side of the accretion
 * disk is bent up and over the hole. The disk is emissive, turbulent, and
 * Doppler-beamed (brighter on the side spinning toward you).
 */

export const vertexShader = /* glsl */ `
  void main() {
    // plane is [-1,1] in clip space; skip projection for a fullscreen pass
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
  uniform float uFall;    // scroll 0..1 -> dive in + brighten
  uniform float uReduced;

  #define STEPS 170
  #define PI 3.14159265

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
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.04; a *= 0.5; }
    return s;
  }

  // temperature ramp (0 outer/cool -> 1 inner/hot)
  vec3 blackbody(float t) {
    vec3 c = mix(vec3(0.75, 0.12, 0.02), vec3(1.0, 0.45, 0.12), smoothstep(0.0, 0.45, t));
    c = mix(c, vec3(1.0, 0.82, 0.45), smoothstep(0.45, 0.8, t));
    c = mix(c, vec3(1.0, 0.98, 0.9), smoothstep(0.8, 1.0, t));
    return c;
  }

  // lensed background star field, sampled by the final (bent) ray direction
  vec3 starfield(vec3 d) {
    vec3 col = vec3(0.0);
    for (int k = 0; k < 3; k++) {
      float sc = 90.0 + float(k) * 120.0;
      vec3 id = floor(d * sc);
      float h = hash13(id + float(k) * 7.0);
      float star = smoothstep(0.9975, 1.0, h);
      float tw = 0.6 + 0.4 * sin(uTime * 1.5 + h * 40.0);
      col += vec3(star) * tw * (0.5 + 0.5 * hash13(id + 3.0));
    }
    float neb = fbm(d * 3.0 + 10.0);
    col += vec3(0.03, 0.04, 0.09) * neb * neb;
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

    // virtual camera orbiting the hole
    float yaw = uYaw;
    float pitch = uPitch;
    float dist = uDist;
    vec3 camPos = vec3(cos(pitch) * sin(yaw), sin(pitch), cos(pitch) * cos(yaw)) * dist;
    vec3 fwd = normalize(-camPos);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    vec3 up = cross(fwd, right);
    vec3 dir = normalize(fwd + (uv.x * right + uv.y * up) * 1.55);

    vec3 pos = camPos;
    vec3 vel = dir;
    float rs = 1.0;                 // event horizon radius
    vec3 col = vec3(0.0);
    float glow = 0.0;
    float transmit = 1.0;
    bool captured = false;
    float timeShift = uReduced > 0.5 ? 0.0 : uTime;

    for (int i = 0; i < STEPS; i++) {
      float r = length(pos);
      float h = clamp(0.03 * r, 0.02, 0.26);

      // photon-ring halo around the photon sphere (~1.5 rs)
      glow += exp(-abs(r - 1.5) * 5.0) * 0.014 * transmit;

      // any photon that penetrates the photon sphere spirals in -> captured
      if (r < rs * 1.5) { captured = true; break; }

      // gravitational bending toward the singularity, with a clamped
      // magnitude so a big step near r=0 can't numerically slingshot out
      float accel = min(1.9 / (r * r), 4.0);
      vec3 g = -normalize(pos) * accel;
      vel = normalize(vel + g * h);
      vec3 npos = pos + vel * h;

      // accretion disk: thin band in the y=0 plane
      if (sign(npos.y) != sign(pos.y)) {
        float t = pos.y / (pos.y - npos.y);
        vec3 hp = mix(pos, npos, t);
        float rr = length(hp.xz);
        if (rr > 3.0 && rr < 6.6) {
          // soft inner + outer falloff so the band reads as a crisp ring
          float radial = smoothstep(3.0, 3.6, rr) * (1.0 - smoothstep(5.0, 6.6, rr));
          float temp = 1.0 - smoothstep(3.0, 6.6, rr);
          float ang = atan(hp.z, hp.x);
          float spin = timeShift * (1.1 / (rr * 0.22 + 0.4));
          float turb = fbm(vec3(cos(ang + spin) * rr, sin(ang + spin) * rr, rr * 0.5) * 1.1);
          float dens = radial * (0.25 + 0.95 * turb);
          // relativistic doppler beaming
          vec3 vdir = normalize(vec3(-hp.z, 0.0, hp.x));
          float dop = 0.5 + 0.8 * max(0.0, dot(vdir, normalize(camPos - hp)));
          vec3 dc = blackbody(temp) * dens * dop;
          col += dc * 0.95 * transmit;
          transmit *= 1.0 - clamp(dens * 0.42, 0.0, 0.85);
        }
      }

      pos = npos;
      if (r > 32.0) break;
    }

    if (captured) {
      col = vec3(0.0); // photons that fell in -> the shadow reads black
    } else {
      col += starfield(normalize(vel)) * transmit;
      // photon-ring glow lives just outside the shadow, on escaping rays
      col += glow * vec3(1.0, 0.78, 0.5) * (1.0 + uFall * 0.5);
    }
    col *= 1.0 + uFall * 0.5;

    // ACES filmic tonemap + gamma
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
    col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));

    float vig = smoothstep(1.35, 0.25, length(uv));
    col *= 0.45 + 0.55 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;
