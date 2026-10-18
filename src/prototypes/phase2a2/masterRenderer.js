import fragment from './master.frag?raw';

export function createMasterRenderer(canvas) {
  const gl=canvas.getContext('webgl',{antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!gl)throw new Error('WebGL unavailable');
  const program=gl.createProgram(),buffer=gl.createBuffer(),shaders=[];
  const dispose=()=>{gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));gl.getExtension('WEBGL_lose_context')?.loseContext();};
  try{
    for(const [type,source] of [[gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}'],[gl.FRAGMENT_SHADER,fragment]]){
      const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);gl.attachShader(program,s);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
  }catch(e){dispose();throw e;}
  const locations=Object.fromEntries(['resolution','pointer','time'].map(n=>[n,gl.getUniformLocation(program,n)]));
  return {
    resize(width,height,quality){
      const dpr=Math.min(devicePixelRatio||1,quality==='high'?1.15:1,Math.sqrt((quality==='high'?1500000:650000)/Math.max(1,width*height)));
      canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));gl.viewport(0,0,canvas.width,canvas.height);
    },
    draw(time,pointer){gl.uniform2f(locations.resolution,canvas.width,canvas.height);gl.uniform2f(locations.pointer,pointer.x,pointer.y);gl.uniform1f(locations.time,time);gl.drawArrays(gl.TRIANGLES,0,3);},
    dispose,
  };
}

export function drawInformation(canvas,time) {
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.5);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  if(time<16||time>=22.8)return;
  const p=Math.min(1,(time-16)/6.8), align=Math.min(1,p*2),fade=Math.min(1,p*5);
  const columns=w<700?12:24,rows=12;
  for(let i=0;i<columns*rows;i++){
    const a=i*2.39996,r=Math.sqrt(i/(columns*rows))*Math.min(w,h)*.26;
    const sx=w*.5+Math.cos(a)*r,sy=h*.5+Math.sin(a)*r*.6;
    const x=sx*(1-align)+(w*.08+(i%columns)*w*.84/columns)*align;
    const y=sy*(1-align)+(h*.12+Math.floor(i/columns)*h*.76/rows)*align;
    const light=.1+.18*(.5+.5*Math.sin(i*3.4));
    ctx.strokeStyle=`rgba(197,190,166,${fade*light})`;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=.65;
    if(p<.5){ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+4,y-4*(1-align),x+7,y+4*(1-align),x+10,y);ctx.stroke();}
    else{ctx.font=`${w<700?9:12}px Georgia,serif`;ctx.fillText(['a','∴','∑','→','e','≠','m','∫'][i%8],x,y);}
  }
  if(p>.42){
    ctx.font=`300 ${Math.max(18,w*.031)}px Georgia,serif`;ctx.fillStyle=`rgba(218,212,190,${(p-.42)*.2})`;
    for(let row=0;row<5;row++){
      const text=['materia / memoria','signo / significado','lenguaje / posibilidad'][row%3],span=ctx.measureText(text).width+120;
      const offset=(time*(10+p*80)*(row%2?1:-1))%span;
      for(let x=offset-span;x<w;x+=span)ctx.fillText(text,x,h*(.16+row*.18));
    }
  }
}
