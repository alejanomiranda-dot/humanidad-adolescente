"""Bounded desktop-only 03/04 material study. Reuses the existing world and lighting.
Run one frame at a time: blender -b --python scripts/production/lookdev-water-life.py -- --output OUTSIDE_REPO --frames 03 --samples 16
The baseline script's direct execution and the other frames remain unchanged.
"""
from pathlib import Path
import sys, math, json, time
import bpy
from mathutils import Vector, noise
sys.path.insert(0,str(Path(__file__).parent))
import lookdev as base

S=.05
PI=math.pi

def mesh_object(name,vertices,faces,mat):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.materials.append(mat);mesh.update()
    obj=base.link(bpy.data.objects.new(name,mesh));obj.scale=(S,S,S)
    for f in mesh.polygons:f.use_smooth=True
    return obj

def tissue_material():
    mat,s,n,l=base.material('Living continuous wet tissue',(.12,.24,.22),.48,.30)
    s.inputs['Subsurface Weight'].default_value=.40;s.inputs['Subsurface Radius'].default_value=(.008,.004,.002)
    s.inputs['Coat Weight'].default_value=.05;s.inputs['Coat Roughness'].default_value=.4
    tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=9;tex.inputs['Detail'].default_value=5
    ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.25;ramp.color_ramp.elements[0].color=(.025,.09,.09,1);ramp.color_ramp.elements[1].position=.73;ramp.color_ramp.elements[1].color=(.35,.40,.24,1)
    l.new(tex.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],s.inputs['Base Color'])
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.35;bump.inputs['Distance'].default_value=.0007;l.new(tex.outputs['Fac'],bump.inputs['Height'])
    fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=180;fine.inputs['Detail'].default_value=3
    micro=n.new('ShaderNodeBump');micro.inputs['Strength'].default_value=.3;micro.inputs['Distance'].default_value=.00022;l.new(fine.outputs['Fac'],micro.inputs['Height']);l.new(bump.outputs[0],micro.inputs['Normal']);l.new(micro.outputs[0],s.inputs['Normal'])
    return mat

def body():
    mat=tissue_material();nu=200;nv=100;vertices=[];faces=[]
    def position(u,v,layer=0):
        x=1.7*math.sin(v)
        fullness=math.cos(v)
        # Asymmetric lobes, folded tissue and small projections form the body itself.
        lobes=1+.28*math.sin(3.2*x+1)+.18*math.cos(u*3+x*2)
        folds=.055*math.sin(u*9+x*4)+.025*math.sin(u*17-x*7)
        r=fullness*(.64*lobes+folds)*(1-layer*.14)
        y=r*math.cos(u)
        z=r*math.sin(u)*1.10+.22*math.sin(x*1.9)+.1*x
        q=Vector((x,y,z))
        granularity=noise.noise(q*24)*.035+noise.noise(q*61)*.013
        q.y+=granularity*math.cos(u);q.z+=granularity*math.sin(u)
        return q
    # A folded continuous body, with translucent lamellae projecting from its surface.
    for j in range(nv+1):
        v=-PI/2+PI*j/nv
        for i in range(nu+1):vertices.append(position(2*PI*i/nu,v))
    for j in range(nv):
        for i in range(nu):
            k=j*(nu+1)+i
            if noise.noise(vertices[k]*16)>.36:continue
            faces.append((k,k+1,k+nu+2,k+nu+1))
    obj=mesh_object('Organized tissue, not a vessel',vertices,faces,mat)
    thickness=obj.modifiers.new('Variable wet tissue thickness','SOLIDIFY');thickness.thickness=.012
    for family in range(12):
        verts=[];quads=[]
        u0=family*2*PI/12
        for j in range(71):
            v=-1.35+2.7*j/70
            for edge in (0,1):
                u=u0+.15*math.sin(v*4+family)+edge*.06
                q=position(u,v)
                rise=edge*.10*(.5+.5*math.sin(v*7+family))
                q.y+=rise*math.cos(u);q.z+=rise*math.sin(u)
                verts.append(q)
        for j in range(70):k=j*2;quads.append((k,k+1,k+3,k+2))
        mesh_object('Wet surface lamella',verts,quads,mat)
    return obj

def water():
    mat,s,n,l=base.material('Absorbing rippled water',(.07,.20,.22),.24,.78)
    s.inputs['IOR'].default_value=1.333
    tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=28;tex.inputs['Detail'].default_value=3
    b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.26;b.inputs['Distance'].default_value=.0007;l.new(tex.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],s.inputs['Normal'])
    vertices=[];faces=[];nx=160;ny=100
    for j in range(ny+1):
        y=-3+23*j/ny
        for i in range(nx+1):
            x=-15+30*i/nx
            z=2.2+.14*math.sin(x*1.4+y*.6)+.055*math.sin(y*2.3-x*.6)
            vertices.append((x,y,z))
    for j in range(ny):
        for i in range(nx):k=j*(nx+1)+i;faces.append((k,k+1,k+nx+2,k+nx+1))
    mesh_object('Water air optical boundary',vertices,faces,mat)

for label in base.args.frames.split(','):
    frame=int(label)
    if frame not in (3,4) or base.args.mobile:raise ValueError('This bounded study accepts only desktop 03 or 04')
    start=time.perf_counter();sc=base.setup(4,False)
    remove=('Continuous membrane','Caustic to membrane to stroke','Inner tension fold','Irregular inner aggregate','Peripheral depth')
    for obj in list(sc.objects):
        if obj.name.startswith(remove):bpy.data.objects.remove(obj,do_unlink=True)
    organism=body();water()
    # Copies of the same tissue establish foreground / middle / background, not a starfield.
    for index,(loc,size) in enumerate([((-4,-5,-1.7),1.8),((4.5,3,-.6),1.1),((-2,6,0),.8)]):
        other=organism.copy();other.data=organism.data;sc.collection.objects.link(other)
        other.name=f'Tissue in depth {index}';other.location=Vector(loc)*S;other.scale*=size
        other.rotation_euler.y=.4*(index-1)
    fog=bpy.data.objects.get('Shared medium');fog.location.z=-2.9*S;fog.scale.z=5.1*S
    volume=fog.data.materials[0].node_tree.nodes.get('Principled Volume');volume.inputs['Density'].default_value=.32;volume.inputs['Color'].default_value=(.28,.48,.57,1)
    # The prior light rig sat above the new water boundary. Move its grazing sources
    # just beneath it so tissue and suspended matter receive light, with the same directions.
    for name in ('Cool grazing source','Warm transmitted source','Light through the medium'):
        light=bpy.data.objects.get(name);light.location.z=1.8*S
        light.rotation_euler=(Vector((0,0,-.4))*S-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.data.objects.get('Cool grazing source').data.energy*=1.7
    bpy.data.objects.get('Soft water bounce').data.energy*=4
    bpy.data.objects.get('Soft water bounce').location.z=1.7*S
    bpy.data.objects.get('Light through the medium').data.energy*=3
    sc.view_settings.exposure=-.15
    # Same submerged organism and water boundary: only camera/focus change between 03 and 04.
    cam=sc.camera;target=bpy.data.objects.get('Focus plane')
    if frame==3:pos=Vector((-.8,-16,1.8))*S;focus=Vector((0,1,.5))*S
    else:pos=Vector((.4,-8.8,.8))*S;focus=Vector((0,0,.05))*S
    cam.location=pos;target.location=focus;cam.rotation_euler=(focus-pos).to_track_quat('-Z','Y').to_euler()
    cam.data.dof.aperture_fstop=5.6
    name=f'frame-{frame:02d}-desktop';sc.render.filepath=str(base.out/(name+'.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(base.out/(name+'.blend')));bpy.ops.render.render(write_still=True)
    (base.out/(name+'.json')).write_text(json.dumps({'frame':frame,'study':'water-life-attempt-2','seconds':round(time.perf_counter()-start,2),'samples':sc.cycles.samples,'source':'lookdev-water-life.py'},indent=2))
    print('PAIR_COMPLETE',name,round(time.perf_counter()-start,2),flush=True)
