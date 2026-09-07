precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=noise(p)*.53;p=p*2.03+4.1;v+=noise(p)*.27;p=p*2.01+3.4;return v+noise(p)*.13;}
vec3 stars(vec3 eye,vec3 ray){
  vec3 c=vec3(.001,.002,.004);
  for(int i=0;i<9;i++){
    float z=-190.+float(i)*28.;float depth=z-eye.z;
    if(depth>1.){
      vec2 p=(eye.xy+ray.xy/ray.z*depth)*.23;
      vec2 cell=floor(p),q=fract(p)-.5;
      float id=hash(vec3(cell,float(i)));
      vec2 shift=vec2(id,hash(vec3(cell+51.,float(i))))*.8-.4;
      float d=length(q-shift);
      float a=exp(-d*mix(170.,75.,id))+.025*exp(-d*13.);
      c+=a*step(.975,id)*mix(vec3(.48,.62,.8),vec3(.95,.79,.54),id)*smoothstep(1.,6.,depth);
    }
  }
  for(int i=0;i<4;i++){
    float depth=30.+float(i)*60.;
    vec3 p=eye+ray*depth;
    float ridge=exp(-abs(p.y*.026+p.x*.016+.16*sin(p.x*.018)+fbm(p*.012)*.4) * 5.);
    float density=smoothstep(.35,.74,fbm(p*.025+float(i)));
    c+=vec3(.15,.17,.17)*density*ridge*.28;
    c*=1.-density*ridge*.15;
  }
  return c;
}
vec3 cosmos(vec2 uv){
  float travel=smoothstep(.5,7.4,time);
  vec3 eye=vec3(pointer*.12, -exp(mix(log(220.),log(1.2),travel)));
  vec3 ray=normalize(vec3(uv+vec2(-.12,.08),1.25));
  vec3 c=stars(eye,ray);
  vec3 center=vec3(0.,-3.05,5.);float radius=3.;
  vec3 oc=eye-center;float b=dot(oc,ray),d=b*b-dot(oc,oc)+radius*radius;
  if(d>0.){
    float hit=-b-sqrt(d);
    if(hit>0.){
      vec3 p=eye+ray*hit,n=normalize(p-center),sun=normalize(vec3(-.7,.5,-.15));
      float diffuse=max(0.,dot(n,sun));
      float rim=pow(1.-max(0.,dot(n,-ray)),4.);
      float texture=fbm(p*3.1);
      c=vec3(.009,.017,.021)*(diffuse*.7+.04)*texture+vec3(.35,.43,.44)*rim*diffuse*.8;
    }
  }
  vec2 light=uv-vec2(.12,-.065);
  c+=vec3(.62,.55,.42)*exp(-length(light)*mix(220.,80.,travel))*(1.-smoothstep(1.5,4.,time));
  return c;
}
vec3 water(vec2 uv){
  float submerge=smoothstep(8.,10.,time);
  vec3 ray=normalize(vec3(uv.x,uv.y-.025,1.2));
  float eyeHeight=mix(2.,.04,smoothstep(6.7,8.7,time));
  vec3 c=vec3(.003,.009,.015);
  if(ray.y<0.){
    float distance=min(80.,-eyeHeight/ray.y);
    vec2 p=ray.xz*distance+vec2(0,time*.28);
    float ripples=sin(p.x*4.+fbm(vec3(p*.9,time*.05))*5.)*sin(p.y*7.+p.x);
    float finer=noise(vec3(p*8.,time*.03));
    float reflection=exp(-abs(p.x-.4)*1.7)*pow(max(0.,ripples),12.);
    vec3 normal=normalize(vec3(-.22*cos(p.x*4.+p.y),1.,-.28*cos(p.y*7.+p.x)));
    float specular=pow(max(0.,dot(reflect(ray,normal),normalize(vec3(.2,.3,1.)))),24.);
    c+=vec3(.34,.37,.29)*(reflection*.55+specular*.65)+vec3(.026,.063,.072)*(ripples*.25+finer*.6);
    c=mix(c,vec3(.008,.02,.03),1.-exp(-distance*.045));
  }
  c+=vec3(.12,.16,.17)*exp(-abs(uv.y-.015)*95.)*.28;
  vec3 underwater=vec3(.002,.012,.017);
  float shaft=pow(max(0.,sin((uv.x+.18)*12.+uv.y*3.+noise(vec3(uv*2.,time*.03))*4.)),8.);
  underwater+=vec3(.04,.09,.10)*shaft*max(0.,uv.y+.7)*.45;
  for(int i=0;i<34;i++){
    float id=float(i);vec2 point=vec2(hash(vec3(id,2,0))-.5,hash(vec3(id,5,0))-.5)*vec2(2.4,1.5);
    float depth=.3+hash(vec3(id,9,0));
    point.y+=time*.009*depth;point+=pointer*.02*depth;
    float d=length(uv-point);
    underwater+=vec3(.17,.23,.22)*exp(-d*(160.+depth*130.))*.12;
  }
  underwater+=vec3(.32,.27,.16)*exp(-length(uv)*160.)*(1.-smoothstep(9.4,10.,time));
  return mix(c,underwater,submerge);
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*resolution)/resolution.y;
  vec3 c=vec3(0);
  if(time<8.5)c=cosmos(uv);
  if(time>6.6&&time<17.5)c=mix(c,water(uv),smoothstep(6.6,8.5,time))*(1.-smoothstep(15.8,17.5,time));
  c=vec3(1)-exp(-c*2.2);c=pow(max(c,vec3(0)),vec3(.9));
  c*=1.-.38*smoothstep(.35,1.25,length(uv));
  if(time>=22.8)c=vec3(0);
  gl_FragColor=vec4(c,1);
}
