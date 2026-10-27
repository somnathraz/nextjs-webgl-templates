export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uTravel;
  uniform float uEnergy;
  uniform float uBurst;
  uniform vec2 uPointer;
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float a = position.x * 6.283185;
    float r = 2.5 + position.y * 5.0;
    float z = position.z * 20.0 - 14.0;
    float twist = uTime * 0.035 + z * 0.09;
    vec3 p = vec3(cos(a + twist) * r, sin(a + twist) * r, z);
    float stream = mod(position.z * 26.0 + uTime * (1.0 + uEnergy * 3.0) + uTravel * 28.0, 26.0) - 20.0;
    p.z = mix(z, stream, uTravel);
    p.xy *= 1.0 + uBurst * 0.2;
    p.xy += uPointer * (position.y - 0.5) * 0.16;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp((1.0 + position.y * 2.0) * (8.0 / -view.z), 0.5, 5.0);
    vAlpha = (0.1 + position.y * 0.5) * (1.0 - smoothstep(2.0, 6.0, p.z));
    vHeat = position.y;
  }
`;

export const dustFragment = /* glsl */ `
  varying float vAlpha;
  varying float vHeat;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 col = mix(vec3(0.36, 0.41, 0.43), vec3(1.0, 0.38, 0.09), vHeat);
    gl_FragColor = vec4(col * 1.5, (1.0 - smoothstep(0.1, 0.5, d)) * vAlpha);
  }
`;

export const coreVertex = /* glsl */ `
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vPosition;
  varying vec3 vNormal;
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                   mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                   mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float value = 0.0, weight = 0.5;
    for (int i = 0; i < 5; i++) {
      value += noise(p) * weight;
      p = p * 2.03 + vec3(3.7, 1.9, 2.4);
      weight *= 0.5;
    }
    return value;
  }
  void main() {
    vec3 p = vPosition * 8.0;
    float t = uTime * 0.16;
    float warp = fbm(p + vec3(0.0, t, -t));
    float plasma = fbm(p * 2.0 + warp * 2.5 - vec3(t, 0.0, t));
    float fire = smoothstep(0.28, 0.67, plasma);
    float grain = pow(noise(p * 19.0 + t), 4.0);
    float rim = pow(1.0 - abs(vNormal.z), 3.0);
    vec3 col = mix(vec3(0.24, 0.009, 0.001), vec3(2.2, 0.49, 0.025), fire);
    col += vec3(1.4, 0.6, 0.15) * grain;
    col += vec3(2.0, 0.48, 0.06) * rim;
    gl_FragColor = vec4(col * (0.85 + uEnergy * 0.65), 1.0);
  }
`;
