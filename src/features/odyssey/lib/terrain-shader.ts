export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTravel;
uniform float uTime;
uniform float uLight;
uniform float uSeed;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float cloudNoise(vec2 p) {
  float sum = noise(p)*0.53;
  p = mat2(0.8,-0.6,0.6,0.8)*p*2.03;
  sum += noise(p+5.7)*0.27;
  sum += noise(p*2.07+13.1)*0.13;
  sum += noise(p*4.11+2.8)*0.07;
  return sum;
}
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 ab=b-a;
  return length(p-a-ab*clamp(dot(p-a,ab)/dot(ab,ab),0.0,1.0));
}
float channel(float z) {
  return sin(z * 0.035) * 3.7 + sin(z * 0.081) * 1.1;
}
float terrain(vec2 p) {
  float valley = 1.0 - exp(-pow(abs(p.x-channel(p.y)) * 0.115, 1.7));
  vec2 q = p * 0.105 + vec2(uSeed, 17.3);
  float h = 0.0;
  float a = 0.58;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  // Fade subpixel ridges into their mean rather than letting them shimmer.
  float detail = 1.0-smoothstep(18.0,85.0,abs(p.y-uTravel));
  for(int i=0; i<5; i++) {
    float ridge = noise(q)*2.0-1.0;
    float n = 1.0 - sqrt(ridge*ridge+0.012);
    h += mix(0.5,n*n,i < 3 ? 1.0 : detail)*a;
    q = rot*q*2.12 + 3.7;
    a *= 0.43;
  }
  return h * 15.5 * valley + noise(p*0.12)*0.25 - 0.12;
}
vec3 normalAt(vec3 p, float t) {
  float e = 0.04 + t * 0.002;
  return normalize(vec3(terrain(p.xz-vec2(e,0))-terrain(p.xz+vec2(e,0)),
    2.0*e, terrain(p.xz-vec2(0,e))-terrain(p.xz+vec2(0,e))));
}
vec3 sky(vec3 rd, vec3 sun) {
  float up = max(rd.y, 0.0);
  vec3 horizon = mix(vec3(0.78,0.75,0.59), vec3(0.71,0.49,0.39), uLight);
  vec3 zenith = mix(vec3(0.23,0.39,0.43), vec3(0.20,0.27,0.38), uLight);
  vec3 col = mix(horizon, zenith, pow(clamp(up*1.65,0.0,1.0),0.55));
  float s = max(dot(rd,sun),0.0);
  col += vec3(1.0,0.65,0.30)*pow(s,14.0)*0.23;
  col += vec3(1.0,0.79,0.47)*pow(s,140.0)*0.26;
  col = mix(col, vec3(1.0,0.92,0.69), smoothstep(0.99965,0.99982,s));
  // Two world-space cloud decks drift at different speeds. Terrain drawn
  // afterward occludes them, so the clouds stay behind the mountain ridges.
  if(rd.y > 0.015) {
    vec2 origin=vec2(channel(uTravel),uTravel);
    vec2 c=(origin+rd.xz*(17.0/max(rd.y,0.025)))*0.024;
    c+=vec2(-uTime*0.009,uTime*0.003);
    float shape=cloudNoise(c);
    float cloud=smoothstep(0.30,0.60,shape);
    float sunSide=cloudNoise(c+sun.xz*0.18);
    float edge=clamp((shape-sunSide)*5.0+0.5,0.0,1.0);
    vec3 underside=mix(vec3(0.35,0.45,0.49),vec3(0.48,0.40,0.43),uLight);
    vec3 silver=mix(vec3(0.96,0.94,0.84),vec3(0.94,0.68,0.51),uLight);
    vec3 cloudCol=mix(underside,silver,edge*0.65+0.24);
    float horizonFade=smoothstep(0.015,0.10,rd.y);
    col=mix(col,cloudCol,cloud*horizonFade*0.88);
    vec2 high=(origin+rd.xz*(26.0/max(rd.y,0.03)))*vec2(0.012,0.048);
    float cirrus=smoothstep(0.48,0.73,cloudNoise(high+vec2(uTime*0.004,4.0)));
    col=mix(col,silver,cirrus*horizonFade*0.23*(1.0-cloud*0.6));
  }
  return col;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - uResolution*0.5) / uResolution.y;
  float z = uTravel;
  vec3 ro = vec3(channel(z)+sin(z*0.018)*0.6, 3.55+sin(z*0.025)*0.65, z);
  vec3 target = vec3(channel(z+12.0), 2.6+sin(z*0.016)*0.4, z+12.0);
  target.x += uPointer.x*0.7;
  target.y += uPointer.y*0.35;
  vec3 forward = normalize(target-ro);
  vec3 right = normalize(cross(forward,vec3(0,1,0)));
  vec3 up = cross(right,forward);
  float bank = sin(z*0.028)*0.025;
  uv = mat2(cos(bank),-sin(bank),sin(bank),cos(bank))*uv;
  vec3 rd = normalize(forward*1.35 + right*uv.x + up*uv.y);
  vec3 sun = normalize(vec3(0.02+sin(uTime*0.012)*0.08,0.18-uLight*0.09,0.95));
  vec3 col = sky(rd,sun);
  float t = 0.12;
  float previousT = t;
  bool hit = false;
  for(int i=0; i<200; i++) {
    vec3 p = ro+rd*t;
    float h = p.y-terrain(p.xz);
    if(h < 0.001*t+0.002) { hit=true; break; }
    previousT = t;
    t += max(h*0.22,0.012);
    if(t>115.0) break;
  }
  if(hit) {
    // Refine the surface instead of exposing the coarse marching steps.
    float lo=previousT, hi=t;
    for(int i=0;i<5;i++) {
      float mid=(lo+hi)*0.5;
      vec3 point=ro+rd*mid;
      if(point.y < terrain(point.xz)) hi=mid; else lo=mid;
    }
    t=(lo+hi)*0.5;
    vec3 p=ro+rd*t;
    vec3 n=normalAt(p,t);
    float diffuse=max(dot(n,sun),0.0);
    float rock=noise(p.xz*1.8)*0.75 + noise(p.xz*4.0)*0.25;
    vec3 stone=mix(vec3(0.10,0.16,0.15),vec3(0.30,0.32,0.25),rock);
    float strata=sin(p.y*14.0+noise(p.xz*1.7)*6.0)*0.5+0.5;
    stone *= 0.94+strata*0.10;
    float snow=smoothstep(7.0,10.0,p.y+noise(p.xz*0.6)*2.0)*smoothstep(0.45,0.8,n.y);
    stone=mix(stone,vec3(0.69,0.71,0.62),snow*0.7);
    float shadow=1.0;
    for(int j=1;j<=3;j++) {
      float d=float(j)*1.3;
      float clearance=(p+sun*d).y-terrain((p+sun*d).xz);
      shadow=min(shadow,smoothstep(-0.1,d*0.35,clearance));
    }
    vec3 ambient=vec3(0.34,0.48,0.49)*(0.5+0.5*n.y);
    col=stone*(ambient+vec3(1.5,1.20,0.75)*diffuse*(0.24+shadow*0.76));
    // A glacial watercourse threads the floor of the valley.
    float water=1.0-smoothstep(0.22,0.65,abs(p.x-channel(p.z)));
    water*=1.0-smoothstep(0.05,0.35,p.y);
    vec3 waterCol=mix(vec3(0.15,0.25,0.25),sky(reflect(rd,vec3(0,1,0)),sun)*0.6,0.55);
    col=mix(col,waterCol,water*0.7);
  }
  // Distinct banks of mist pool in the valley. A higher, thinner layer
  // crosses the flight path; wind advects both through the world.
  float opticalDepth=0.0;
  float endT=min(t,105.0);
  for(int j=0;j<20;j++) {
    float d=(float(j)+0.5)/20.0*endT;
    vec3 p=ro+rd*d;
    vec2 wind=vec2(uTime*0.028,-uTime*0.012);
    vec2 field=p.xz*vec2(0.065,0.10)+wind;
    float billow=noise(field)*0.7+noise(field*2.1+7.0)*0.3;
    float valley=exp(-abs(p.x-channel(p.z))*0.085);
    float bankHeight=1.8+sin(p.z*0.13+billow*3.0)*0.5;
    float bank=exp(-pow((p.y-bankHeight)/1.1,2.0));
    float coverage=smoothstep(0.26,0.68,billow);
    float ribbons=exp(-pow((p.y-3.5-sin(p.z*0.19+uTime*0.025)*0.4)/0.55,2.0));
    float density=0.005+exp(-max(p.y,0.0)*0.5)*0.018;
    density+=valley*bank*coverage*0.24;
    density+=ribbons*smoothstep(0.38,0.72,billow)*valley*0.11;
    opticalDepth+=density*endT/20.0;
  }
  float fog=1.0-exp(-opticalDepth);
  if(!hit && rd.y < 0.025) fog=max(fog,0.97);
  vec3 fogCol=mix(vec3(0.67,0.75,0.72),vec3(0.70,0.58,0.54),uLight);
  fogCol+=vec3(0.15,0.10,0.035)*pow(max(dot(rd,sun),0.0),8.0);
  col=mix(col,fogCol,clamp(fog,0.0,(hit || rd.y < 0.025) ? 0.97 : 0.22));

  // A flock follows a loose V through the valley. Project world positions
  // into this camera, then depth-test each silhouette against the terrain.
  float flockZ=floor((z-uTime*0.35+12.0)/70.0)*70.0+34.0+uTime*0.35;
  for(int i=0;i<9;i++) {
    float id=float(i);
    float rank=floor((id+1.0)*0.5);
    float side=mod(id,2.0)*2.0-1.0;
    float bz=flockZ-rank*0.95;
    vec3 bird=vec3(channel(bz)+side*rank*0.72+sin(uTime*0.18)*1.8,
      9.1-rank*0.20+sin(uTime*0.6+id*0.7)*0.16,bz);
    vec3 relative=bird-ro;
    float depth=dot(relative,forward);
    float distanceToBird=length(relative);
    if(depth > 3.0 && depth < 90.0 && (!hit || distanceToBird < t)) {
      vec2 screen=vec2(dot(relative,right),dot(relative,up))*1.35/depth;
      float size=(0.21+hash(vec2(id,2.0))*0.07)*1.35/depth;
      vec2 local=(uv-screen)/size;
      if(abs(local.x)<1.6 && abs(local.y)<1.4) {
        float bankAngle=sin(uTime*0.4+id*0.25)*0.22;
        local=mat2(cos(bankAngle),-sin(bankAngle),sin(bankAngle),cos(bankAngle))*local;
        float flap=sin(uTime*4.2+id*1.3);
        vec2 elbow=vec2(0.48,0.17+flap*0.18);
        vec2 tip=vec2(1.25,flap*0.65-0.08);
        vec2 wing=vec2(abs(local.x),local.y);
        float wingDistance=min(segmentDistance(wing,vec2(0),elbow),segmentDistance(wing,elbow,tip));
        float body=length(local/vec2(0.11,0.30))-1.0;
        float aa=0.8/(uResolution.y*size);
        float silhouette=max(1.0-smoothstep(0.045,0.045+aa,wingDistance),1.0-smoothstep(0.0,aa*3.0,body));
        float atmosphericFade=exp(-distanceToBird*0.011);
        col=mix(col,vec3(0.09,0.14,0.15),silhouette*atmosphericFade);
      }
    }
  }
  col=pow(max(col,0.0),vec3(0.91));
  col*=1.0-0.18*pow(length(vUv-0.5)*1.1,1.5);
  float grain=hash(gl_FragCoord.xy+fract(uTime)*100.0)-0.5;
  col+=grain*0.002;
  gl_FragColor=vec4(col,1.0);
}
`;

// Screen-space edge antialiasing, applied after the terrain render.
export const antialiasShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform vec2 uResolution;
void main() {
  vec2 pixel=1.0/uResolution;
  vec3 nw=texture2D(uScene,vUv+vec2(-1,1)*pixel).rgb;
  vec3 ne=texture2D(uScene,vUv+vec2(1,1)*pixel).rgb;
  vec3 sw=texture2D(uScene,vUv+vec2(-1,-1)*pixel).rgb;
  vec3 se=texture2D(uScene,vUv+vec2(1,-1)*pixel).rgb;
  vec3 center=texture2D(uScene,vUv).rgb;
  vec3 luma=vec3(0.299,0.587,0.114);
  float a=dot(nw,luma),b=dot(ne,luma),c=dot(sw,luma),d=dot(se,luma),m=dot(center,luma);
  float low=min(m,min(min(a,b),min(c,d)));
  float high=max(m,max(max(a,b),max(c,d)));
  if(high-low < max(0.012,high*0.08)) { gl_FragColor=vec4(center,1); return; }
  vec2 direction=vec2(-((a+b)-(c+d)),(a+c)-(b+d));
  float reduce=max((a+b+c+d)*0.03125,0.0078125);
  float inv=1.0/(min(abs(direction.x),abs(direction.y))+reduce);
  direction=clamp(direction*inv,vec2(-6),vec2(6))*pixel;
  vec3 rgbA=0.5*(texture2D(uScene,vUv-direction/6.0).rgb+texture2D(uScene,vUv+direction/6.0).rgb);
  vec3 rgbB=rgbA*0.5+0.25*(texture2D(uScene,vUv-direction*0.5).rgb+texture2D(uScene,vUv+direction*0.5).rgb);
  float lumaB=dot(rgbB,luma);
  gl_FragColor=vec4((lumaB<low || lumaB>high) ? rgbA : rgbB,1.0);
}
`;
