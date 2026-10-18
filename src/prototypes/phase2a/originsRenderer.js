import fragment from './origins.frag?raw';

// A single fullscreen triangle; all scene resources belong to this instance.
export function createOriginsRenderer(canvas, onFailure) {
  const gl = canvas.getContext('webgl', { antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) throw new Error('WebGL unavailable');
  const shaders = [];
  let program, buffer;
  const release = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
  };
  try {
    const compile = (type, source) => {
      const shader = gl.createShader(type); shaders.push(shader);
      gl.shaderSource(shader, source); gl.compileShader(shader); return shader;
    };
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}'));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  } catch (error) { release(); throw error; }
  const uniforms = Object.fromEntries(['Resolution','Pointer','Progress','Life','Time','Detail','Mobile'].map(name => [name, gl.getUniformLocation(program, 'u' + name)]));
  const scene = canvas.closest('[data-scene="origins"]');
  const existence = scene.querySelector('[data-scene="existence"]');
  const life = scene.querySelector('[data-scene="life"]');
  const mobile = matchMedia('(max-width: 699px)').matches;
  let medium = mobile || (navigator.deviceMemory && navigator.deviceMemory <= 4) || navigator.connection?.saveData;
  let scale = medium ? 1 : 1.15;
  let width = 0, height = 0, visible = false, frame = 0, last = 0, time = 0, disposed = false;
  let samples = 0, slow = 0;
  const pointer = { x: 0, y: 0 };
  const request = () => { if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw); };
  const resize = () => {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, scale, Math.sqrt((medium ? 650000 : 1800000) / Math.max(1,width*height)));
    canvas.width = Math.max(1,Math.round(width*ratio)); canvas.height = Math.max(1,Math.round(height*ratio));
    gl.viewport(0,0,canvas.width,canvas.height);
    canvas.dataset.quality = medium ? 'medium' : 'high'; request();
  };
  function draw(stamp) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const lifeRect = life.getBoundingClientRect();
    const isLife = lifeRect.top <= 0;
    const rect = isLife ? lifeRect : existence.getBoundingClientRect();
    const progress = Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-(isLife?height:0))));
    if (isLife && last && stamp-last<33) { request(); return; }
    if (isLife && last) {
      const delta=stamp-last; time+=Math.min(delta,80)/1000;
      samples++; if(delta>48)slow++;
      // A one-way downgrade avoids quality oscillation during the scene.
      if(samples>=45 && slow/samples>0.3 && scale>0.6) {
        medium=true; scale=Math.max(0.6,scale*0.75); samples=0; slow=0; resize();
      }
    }
    last=isLife?stamp:0;
    gl.uniform2f(uniforms.Resolution,canvas.width,canvas.height);
    gl.uniform2f(uniforms.Pointer,pointer.x,pointer.y);
    gl.uniform1f(uniforms.Progress,progress); gl.uniform1f(uniforms.Life,isLife?1:0);
    gl.uniform1f(uniforms.Time,time); gl.uniform1f(uniforms.Detail,medium?48:72);
    gl.uniform1f(uniforms.Mobile,width<700?1:0);
    gl.drawArrays(gl.TRIANGLES,0,3);
    canvas.dataset.view=isLife?'life':'existence';
    if(isLife && progress<1)request();
  }
  const onPointer = event => {
    if(event.pointerType!=='mouse')return;
    pointer.x=(event.clientX/Math.max(1,width)-0.5)*2;
    pointer.y=(0.5-event.clientY/Math.max(1,height))*2; request();
  };
  const stop = () => { cancelAnimationFrame(frame); frame=0; last=0; };
  const onVisibility = () => { if(document.hidden)stop(); else request(); };
  const onLost = event => { event.preventDefault(); stop(); onFailure(); };
  const observer=new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; if(visible)request(); else stop(); });
  const resizeObserver=new ResizeObserver(resize);
  observer.observe(scene); resizeObserver.observe(canvas);
  scene.addEventListener('pointermove',onPointer,{passive:true});
  window.addEventListener('scroll',request,{passive:true});
  document.addEventListener('visibilitychange',onVisibility);
  canvas.addEventListener('webglcontextlost',onLost);
  resize();
  return () => {
    disposed=true; stop(); observer.disconnect(); resizeObserver.disconnect();
    scene.removeEventListener('pointermove',onPointer); window.removeEventListener('scroll',request);
    document.removeEventListener('visibilitychange',onVisibility); canvas.removeEventListener('webglcontextlost',onLost);
    release(); gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
