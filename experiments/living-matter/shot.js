// The supplied art is the image itself. Depth and correspondences are approximate
// 2.5D controls, not inferred ground-truth depth or reconstructed unseen geometry.
const canvas = document.querySelector('#shot');
const gl = canvas.getContext('webgl2', {alpha:false, antialias:false, preserveDrawingBuffer:true});
const timer = document.querySelector('#time');
const play = document.querySelector('#play');
const choice = document.querySelector('#variant');
const clock = document.querySelector('#clock');
let current=0, variant=Number(new URLSearchParams(location.search).get('variant')||1), running=false, started=0;
choice.value=String(variant);
const vertex = `#version 300 es
in vec2 position; out vec2 v;
void main(){v=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment = `#version 300 es
precision highp float;
uniform sampler2D l0;uniform sampler2D l2;uniform float time;uniform int variant;
in vec2 v;out vec4 pixel;
float bell(vec2 p,vec2 c,vec2 r){vec2 d=(p-c)/r;return exp(-dot(d,d)*2.);}
float luminance(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 linearize(vec3 c){return pow(max(c,vec3(0)),vec3(2.2));}
const vec2 a[9]=vec2[9](vec2(.208,.352),vec2(.321,.466),vec2(.529,.337),vec2(.50,.57),vec2(.855,.37),vec2(.42,.795),vec2(.32,.70),vec2(.68,.55),vec2(.76,.64));
const vec2 b[9]=vec2[9](vec2(.247,.327),vec2(.345,.483),vec2(.569,.391),vec2(.53,.57),vec2(.82,.39),vec2(.52,.74),vec2(.33,.65),vec2(.68,.54),vec2(.76,.64));
vec2 correspondence(vec2 p,float t){vec2 delta=vec2(0);float weight=.22;
 for(int i=0;i<9;i++){vec2 center=mix(a[i],b[i],t);float w=bell(p,center,vec2(.15,.15));delta+=(b[i]-a[i])*w;weight+=w;}return delta/weight;}
// Paired ridges and attachment lines, rather than independent bright pixels.
const vec2 ridge0[12]=vec2[12](
 vec2(.205,.330),vec2(.285,.445),vec2(.350,.450),vec2(.425,.495),
 vec2(.488,.365),vec2(.615,.278),vec2(.716,.505),vec2(.840,.390),
 vec2(.306,.615),vec2(.342,.780),vec2(.470,.742),vec2(.642,.625));
const vec2 ridge2[12]=vec2[12](
 vec2(.237,.281),vec2(.302,.403),vec2(.382,.451),vec2(.449,.555),
 vec2(.531,.367),vec2(.608,.346),vec2(.721,.479),vec2(.807,.351),
 vec2(.320,.576),vec2(.418,.677),vec2(.514,.674),vec2(.648,.582));
const ivec2 ridges[10]=ivec2[10](ivec2(0,1),ivec2(1,2),ivec2(2,3),ivec2(3,4),ivec2(4,5),ivec2(5,6),ivec2(6,7),ivec2(8,9),ivec2(9,10),ivec2(10,11));
vec2 perpendicular(vec2 p){return vec2(-p.y,p.x);}
void filamentCoordinates(vec2 p,float t,inout vec2 p0,inout vec2 p2){
 vec2 shift0=vec2(0),shift2=vec2(0);float weights=0.;
 for(int i=0;i<10;i++){
   int j=ridges[i].x,k=ridges[i].y;
   vec2 start=mix(ridge0[j],ridge2[j],t),end=mix(ridge0[k],ridge2[k],t);
   vec2 axis=end-start;float len=length(axis);vec2 direction=axis/len;
   float u=dot(p-start,direction)/len,vv=dot(p-start,perpendicular(direction));
   float distanceToLine=length(p-(start+clamp(u,0.,1.)*axis));
   float w=pow(.018/(.018+distanceToLine),2.5);
   vec2 axis0=ridge0[k]-ridge0[j],axis2=ridge2[k]-ridge2[j];
   shift0+=(ridge0[j]+u*axis0+vv*perpendicular(normalize(axis0))-p)*w;
   shift2+=(ridge2[j]+u*axis2+vv*perpendicular(normalize(axis2))-p)*w;
   weights+=w;
 }
 float support=smoothstep(.025,.16,weights)*(1.-smoothstep(1.05,1.10,p.x+.45*p.y));
 p0=mix(p0,p+shift0/max(weights,.0001),support);
 p2=mix(p2,p+shift2/max(weights,.0001),support);
}
float depth(vec2 p,float t){float body=bell(p,vec2(.52,.55),vec2(.46,.30));
 float foreground=mix(bell(p,vec2(.99,.99),vec2(.27,.33)),bell(p,vec2(.03,.92),vec2(.18,.25)),variant==2?0.:t);
 return clamp(.10+.47*body+.60*foreground,0.,1.);}
vec2 breathe(vec2 p,float seconds,float mask){return .0015*mask*vec2(sin(p.y*12.+seconds*.65)+.35*sin(p.x*19.-seconds*.5),cos(p.x*10.-seconds*.48));}
void main(){
 vec2 screen=vec2(v.x,1.-v.y);float phase=clamp(time/7.,0.,1.);
 float progress=smoothstep(.19,.84,phase);
 vec2 q=vec2(.035,.22)+screen*vec2(.93,.688889);
 q=(q-vec2(.52,.56))/(1.+.025*phase)+vec2(.52,.56);
 float d=depth(q,progress);vec2 camera=vec2(.012*(phase-.5),-.003*(phase-.5));
 q+=camera*(d-.22);
 float body=bell(q,vec2(.52,.54),vec2(.45,.32));
 q+=breathe(q,time,body);
 vec2 movement=correspondence(q,progress);
 vec2 p0=q-progress*movement, p2=q+(1.-progress)*movement;
 if(variant==2 && progress>0. && progress<1.)filamentCoordinates(q,progress,p0,p2);
 vec3 c0=texture(l0,p0).rgb,c2=texture(l2,p2).rgb;
 float blend=progress;
 if(variant==2){
   float tissue=(luminance(c0)+luminance(c2))*.5;
   float arrival=.50+.30*(q.x-.50)+.12*(q.y-.52)-.085*tissue;
   blend=smoothstep(arrival-.17,arrival+.17,progress);
 }
 vec3 color=mix(linearize(c0),linearize(c2),blend);
 if(variant==2){
   // Filament regions hand off in a shorter interval, with a smooth spatial mask.
   // Only the central transition changes. Endpoints and the near-field matte stay intact.
   float middle=smoothstep(.12,.32,progress)*(1.-smoothstep(.70,.90,progress));
   float detailBlend=smoothstep(.30,.70,blend);
   float detailMask=.75*max(bell(q,vec2(.34,.47),vec2(.21,.22)),bell(q,vec2(.59,.52),vec2(.27,.28)));
   // A convex blend avoids negative halos around translucent edges.
   color=mix(linearize(c0),linearize(c2),mix(blend,detailBlend,middle*detailMask));
   // Preserve the original near-field occluder as a stable depth layer.
   // Its soft matte stays outside the changing central mass.
   float nearMatte=smoothstep(1.10,1.22,q.x+.45*q.y);
   color=mix(color,linearize(texture(l0,q).rgb),nearMatte);
 }
 // The light travels over existing warm detail; no new luminous line is drawn.
 float warm=max(0.,mix(c0.r-c0.b,c2.r-c2.b,blend));
 vec2 pulse=mix(vec2(.32,.47),vec2(.65,.58),progress);
 float light=bell(q,pulse,vec2(.18,.14))*sin(progress*3.14159265)*warm;
 color*=1.+.26*light;
 pixel=vec4(pow(max(color,vec3(0)),vec3(1./2.2)),1.);
}`;
const pointVertex = `#version 300 es
precision highp float;in vec3 seed;uniform float time;uniform vec2 resolution;out float opacity;
void main(){float z=.3+seed.z;vec2 p=seed.xy;
p.x+=.0018*time/z+.002*sin(time*.38+seed.z*18.);p.y-=.002*time/z;
gl_Position=vec4(p*2.-1.,0.,1.);gl_PointSize=(1.2+4.0*seed.z)*resolution.x/1440.;opacity=.035+.075*seed.z;}`;
const pointFragment = `#version 300 es
precision highp float;in float opacity;out vec4 pixel;
void main(){float r=length(gl_PointCoord-.5)*2.;float alpha=exp(-r*r*4.)*opacity;pixel=vec4(.76,.72,.57,alpha);}`;

function program(vs,fs){
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
}
function buffer(p,name,array,size){const vao=gl.createVertexArray();gl.bindVertexArray(vao);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(array),gl.STATIC_DRAW);const attr=gl.getAttribLocation(p,name);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,size,gl.FLOAT,false,0,0);return vao;}
async function load(path,unit){const image=new Image();image.src=path;await image.decode();gl.activeTexture(gl.TEXTURE0+unit);const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);return {width:image.naturalWidth,height:image.naturalHeight};}
try{
 if(!gl)throw Error('Este estudio necesita WebGL 2.');
 const p=program(vertex,fragment), dust=program(pointVertex,pointFragment);
 const quad=buffer(p,'position',[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1],2);
 let seed=61;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const particles=Array.from({length:36},()=>[random(),random(),random()]).flat();
 const dots=buffer(dust,'seed',particles,3);
 const sizes=await Promise.all([load('../../references/living-matter/L0-unorganized.png',0),load('../../references/living-matter/L2-organized.png',1)]);
 function draw(t){current=Math.max(0,Math.min(7,t));gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.BLEND);gl.useProgram(p);gl.bindVertexArray(quad);gl.uniform1i(gl.getUniformLocation(p,'l0'),0);gl.uniform1i(gl.getUniformLocation(p,'l2'),1);gl.uniform1f(gl.getUniformLocation(p,'time'),current);gl.uniform1i(gl.getUniformLocation(p,'variant'),variant);gl.drawArrays(gl.TRIANGLES,0,6);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(dust);gl.bindVertexArray(dots);gl.uniform1f(gl.getUniformLocation(dust,'time'),current);gl.uniform2f(gl.getUniformLocation(dust,'resolution'),canvas.width,canvas.height);gl.drawArrays(gl.POINTS,0,36);timer.value=String(current);clock.textContent=current.toFixed(2)+' / 7 s';}
 function stop(){running=false;play.textContent='Reproducir';}
 function tick(now){if(!running)return;draw((now-started)/1000);if(current>=7)stop();else requestAnimationFrame(tick);}
 play.onclick=()=>{if(running){stop();return;}if(current>=7)current=0;started=performance.now()-current*1000;running=true;play.textContent='Pausar';requestAnimationFrame(tick);};
 timer.oninput=()=>{stop();draw(Number(timer.value));};choice.onchange=()=>{stop();variant=Number(choice.value);draw(current);};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.study={draw,stop,setVariant(value){variant=value;choice.value=String(value);draw(current);},sizes,renderer:gl.getParameter(gl.RENDERER),get running(){return running;}};
 draw(0);window.study.ready=true;
}catch(e){document.querySelector('#error').hidden=false;document.querySelector('#error').textContent=e.message;console.error(e);}
