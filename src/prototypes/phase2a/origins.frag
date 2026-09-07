precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uProgress;
uniform float uLife;
uniform float uTime;
uniform float uDetail;
uniform float uMobile;

float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p) {
  float v = noise(p)*0.55; p=p*2.03+vec3(7.2,1.4,4.9);
  v+=noise(p)*0.27; p=p*2.01+vec3(2.3,6.4,1.1);
  return v+noise(p)*0.13;
}
float unionSoft(float a, float b, float k) {
  float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);
  return mix(b,a,h)-k*h*(1.0-h);
}
float division;
float field(vec3 p) {
  float spread=mix(0.0,0.98,division);
  float radius=mix(0.92,0.68,division);
  vec3 a=p-vec3(-spread,0.07*division,0.0);
  vec3 b=p-vec3(spread,-0.08*division,0.10*division);
  a.y*=1.07; b.y*=1.03;
  float surface=unionSoft(length(a)-radius,length(b)-radius*mix(1.0,0.94,division),mix(0.38,0.09,division));
  return surface+(noise(p*3.5+vec3(0,uTime*0.07,0))-0.5)*0.085
    +sin(p.y*6.0+p.z*4.0+uTime*0.13)*sin(p.x*5.0)*0.018;
}
vec3 normalAt(vec3 p) {
  vec2 e=vec2(0.004,0);
  return normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));
}
vec3 cosmos(vec2 uv, float descent) {
  if(descent>=1.0)return vec3(0);
  vec2 focal=vec2(mix(0.38,0.10,uMobile),0.04);
  vec3 ray=normalize(vec3(uv-focal,1.5));
  vec3 eye=vec3(uPointer*0.025,descent*14.0);
  vec3 color=vec3(0.004,0.006,0.009);
  // Several planes in world space: perspective changes with the travelling camera.
  for(int layer=0;layer<5;layer++) {
    float z=3.0+float(layer)*4.0;
    float distance=mod(z-eye.z+20.0,20.0)+0.5;
    vec2 plane=eye.xy+ray.xy/ray.z*distance;
    vec2 grid=plane*5.0;
    vec2 cell=floor(grid), local=fract(grid)-0.5;
    float seed=hash(vec3(cell,float(layer)));
    vec2 offset=vec2(seed,hash(vec3(cell+31.0,float(layer))))*0.65-0.325;
    float star=exp(-length(local-offset)*mix(170.0,60.0,seed));
    float halo=exp(-length(local-offset)*18.0)*0.055;
    float luminous=step(0.86,seed)*(0.3+seed*0.7);
    color+=(star+halo)*luminous*mix(vec3(0.70,0.78,0.88),vec3(1.0,0.85,0.62),seed)*0.7;
  }
  // Dust is lit in a tilted plane, with absorption breaking up its bright ridges.
  vec2 q=uv-focal;
  q=mat2(0.91,-0.414,0.414,0.91)*q;
  q/=1.0+descent*4.5;
  vec3 volume=vec3(q.x*3.0,q.y*9.0,descent*2.4);
  float cloud=fbm(volume+fbm(volume*1.9)*1.7);
  float band=exp(-abs(q.y+0.06*sin(q.x*4.0))*11.0);
  float core=exp(-length(q*vec2(1.4,9.0))*2.0);
  float dust=smoothstep(0.33,0.77,cloud);
  color+=vec3(0.38,0.31,0.22)*band*dust*0.64;
  color+=vec3(0.55,0.47,0.34)*core*0.24;
  color*=1.0-0.62*smoothstep(0.55,0.70,fbm(volume*2.0+3.0))*band;
  return color*(1.0-smoothstep(0.62,1.0,descent));
}
void main() {
  vec2 uv=(gl_FragCoord.xy-0.5*uResolution)/uResolution.y;
  float aspect=uResolution.x/uResolution.y;
  float descent=uLife>0.5?1.0:smoothstep(0.65,0.985,uProgress);
  float lifeProgress=uLife>0.5?uProgress:0.0;
  division=smoothstep(0.08,0.53,lifeProgress);
  vec3 color=cosmos(uv,descent);
  float reveal=smoothstep(0.1,0.35,descent);
  float settle=smoothstep(0.42,1.0,descent);
  float radius=mix(0.025,1.6,smoothstep(0.0,0.43,descent));
  float targetRadius=min(aspect*mix(0.17,0.25,uMobile),0.235);
  radius=mix(radius,targetRadius,settle);
  vec2 center=vec2(aspect*mix(0.20,0.08,uMobile),mix(0.0,-0.13,uMobile));
  center.y-=uMobile*smoothstep(0.4,0.6,lifeProgress)*0.10;
  center.x-=division*aspect*mix(0.02,0.06,uMobile);
  center=mix(vec2(aspect*0.15,-0.65*smoothstep(0.0,0.43,descent)),center,settle);
  center+=uPointer*0.008;
  color+=vec3(0.013,0.032,0.027)*exp(-length((uv-center)*vec2(1.0,0.8))*2.0)*settle;
  vec2 local=(uv-center)/max(radius,0.01);
  if(reveal>0.0 && length(local)<2.4) {
    vec3 eye=vec3(uPointer*0.07,4.7);
    vec3 ray=normalize(vec3(local,0.0)-eye);
    float travel=2.0; bool hit=false;
    vec3 pos;
    for(int i=0;i<72;i++) {
      if(float(i)>=uDetail) break;
      pos=eye+ray*travel;
      float d=field(pos);
      if(d<0.0035){hit=true;break;}
      travel+=max(d*0.8,0.003);
      if(travel>7.5)break;
    }
    if(hit) {
      vec3 n=normalAt(pos), light=normalize(vec3(-0.6,0.85,1.1));
      float facing=max(0.0,dot(n,-ray));
      float fresnel=pow(1.0-facing,2.4);
      float diffuse=max(0.0,dot(n,light));
      float specular=pow(max(0.0,dot(reflect(-light,n),-ray)),180.0);
      vec3 tint=mix(vec3(0.20,0.36,0.29),vec3(0.53,0.42,0.25),smoothstep(0.0,1.4,pos.x)*division*0.7);
      float tissue=fbm(pos*7.0+vec3(0,0,uTime*0.035));
      vec3 body=tint*(0.11+diffuse*0.22)*mix(0.7,1.25,tissue);
      // Integrate an internal field through the volume: fine folds, not a diagrammatic nucleus.
      float interior=0.0;
      for(int j=1;j<=12;j++) {
        vec3 p=pos+ray*float(j)*0.11;
        float inside=1.0-smoothstep(-0.04,0.04,field(p));
        float folds=sin(p.x*17.0+fbm(p*4.0)*9.0)*sin(p.y*13.0+p.z*11.0);
        interior+=pow(max(0.0,folds),5.0)*inside*0.035;
      }
      body+=tint*interior*2.5;
      body+=vec3(0.60,0.67,0.54)*fresnel*(0.3+diffuse*0.55);
      body+=vec3(0.96,0.85,0.64)*specular*0.75;
      float fine=pow(max(0.0,sin(tissue*85.0+pos.y*8.0)),14.0);
      body+=tint*fine*fresnel*0.25;
      vec3 horizon=vec3(0.002,0.003,0.004)+vec3(0.48,0.39,0.26)*fresnel*(0.12+diffuse*0.5);
      body=mix(horizon,body,smoothstep(0.78,0.985,descent));
      color=mix(color,body,reveal);
    }
  }
  color*=1.0-smoothstep(0.76,1.0,lifeProgress);
  // Gentle film response; no bloom pass or postprocessing dependency.
  color=vec3(1.0)-exp(-color*1.6);
  color=pow(max(color,vec3(0)),vec3(0.87));
  color*=1.0-0.22*smoothstep(0.3,1.25,length(uv));
  gl_FragColor=vec4(color,1.0);
}
