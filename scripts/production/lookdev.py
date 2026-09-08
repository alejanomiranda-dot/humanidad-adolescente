"""Still-only art development. Blender 4.5.13 LTS; no animation/export of a movie.

blender -b --python scripts/production/lookdev.py -- --output OUTSIDE_REPO --frames 03,04,07
Add --mobile for a separate portrait camera, --samples 16 for a material study.
All surface coordinates, folds and light rigs are shared across the micro-scale frames.
"""
import argparse
import json
import math
import os
from pathlib import Path
import random
import sys
import time
import bpy
from mathutils import Vector, noise

p=argparse.ArgumentParser()
p.add_argument('--output',required=True)
p.add_argument('--frames',default='03,04,07')
p.add_argument('--mobile',action='store_true')
p.add_argument('--samples',type=int)
args=p.parse_args(sys.argv[sys.argv.index('--')+1:])
cfg=json.loads(Path(__file__).with_name('lookdev-art-bible.json').read_text())
out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
PI=math.pi
TENSION=False

def link(obj):
    bpy.context.scene.collection.objects.link(obj)
    return obj

def material(name,color,rough=.5,transmission=0,emission=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes; l=m.node_tree.links; s=n.get('Principled BSDF')
    s.inputs['Base Color'].default_value=(*color,1)
    s.inputs['Roughness'].default_value=rough
    s.inputs['Transmission Weight'].default_value=transmission
    s.inputs['IOR'].default_value=cfg['filmIor']
    s.inputs['Emission Color'].default_value=(*color,1)
    s.inputs['Emission Strength'].default_value=emission
    return m,s,n,l

def filament(name,points,mat,radius=.004,radii=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.resolution_u=2
    c.bevel_depth=radius;c.bevel_resolution=2
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for i,(p,co) in enumerate(zip(s.points,points)):
        p.co=(*co,1)
        if radii:p.radius=radii[i]
    obj=link(bpy.data.objects.new(name,c));c.materials.append(mat)
    return obj

def area(name,pos,power,color,size,target):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size
    o=link(bpy.data.objects.new(name,d));o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

def sphere(name,loc,scale,mat,subdiv=2):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv,radius=1,location=loc)
    o=bpy.context.object;o.name=name;o.scale=scale;o.data.materials.append(mat)
    for face in o.data.polygons:face.use_smooth=True
    return o

def shape(u,v,fold=1,side=0,separate=0,unravel=0):
    # The open sheet and closed body share a UV parameterization and point identity.
    wav=.05*math.sin(u*3+v*4)+.022*math.sin(u*7-v*5)
    f=max(.04,fold);a=(u-PI)*f;b=v*f
    q=Vector((1.75*math.sin(a)*math.cos(b)/f,.76*(math.cos(a)*math.cos(b)-(1-f))/f,1.03*math.sin(b)/f*(1+2*(1-f))))
    angle=(1-f)*PI/2;y=q.y;z=q.z
    q.y=y*math.cos(angle)-z*math.sin(angle);q.z=y*math.sin(angle)+z*math.cos(angle)+1.0*(1-f)
    q*=1+(wav*1.5+.045*noise.noise_vector(Vector((math.cos(u)*4,math.sin(u)*4,v*3)))[0])*math.cos(v)
    q.z+=f*(.10*q.x+.04*math.sin(q.x*2))+(1-f)*(.09*math.sin(u*9+v*4)+.025*math.sin(u*23+v*7))
    if TENSION:
        neck=.48+.52*min(1,abs(q.x)/1.0);q.y*=neck;q.z*=neck;q.x*=1.25
    local_x=q.x
    if separate:
        q.x*=.69;q.z*=.82;q.x+=side*1.35*separate;q.z+=side*.23*separate
    if unravel:
        reach=max(0,min(1,(local_x+.3)/2.1))
        q.x+=unravel*reach*2.5
        q.z=q.z*(1-reach*unravel*.82)+unravel*reach*.16*math.sin(v*4+u)
        q.y*=1-unravel*reach*.75
    return q

def membrane(name,mat,fold=1,side=0,separate=0,unravel=0):
    verts=[];faces=[];nu=128;nv=64
    # Adjacent strips touch at rest; their width contracts continuously into traces.
    # Every study retains the same vertices and faces, including the released form.
    for j in range(nv):
        center=-PI/2+PI*(j+.5)/nv
        start=len(verts)
        for edge in (-1,1):
            for i in range(nu+1):
                u=2*PI*i/nu
                reach=max(0,math.sin(u-PI))**.5
                v=center+edge*PI/(2*nv)*(1-unravel*reach*.995)
                verts.append(shape(u,v,fold,side,separate,unravel))
        for i in range(nu):
            k=start+i;faces.append((k,k+1,k+nu+2,k+nu+1))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(mat);mesh.update()
    o=link(bpy.data.objects.new(name,mesh))
    for f in mesh.polygons:f.use_smooth=True
    # Match normals where strips meet; independent ribbon edges must not make banding.
    normals={}
    for vertex in mesh.vertices:
        key=tuple(round(c,6) for c in vertex.co)
        normals.setdefault(key,Vector((0,0,0)))
        normals[key]+=vertex.normal
    mesh.normals_split_custom_set_from_vertices([normals[tuple(round(c,6) for c in vertex.co)].normalized() for vertex in mesh.vertices])
    return o

def make_materials():
    film,s,n,l=material('Wet porous tissue',cfg['filmColor'],cfg['filmRoughness'],cfg['filmTransmission'])
    s.inputs['Subsurface Weight'].default_value=.30
    s.inputs['Subsurface Radius'].default_value=(.18,.08,.035)
    s.inputs['Coat Weight'].default_value=.09;s.inputs['Coat Roughness'].default_value=.28
    tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=38;tex.inputs['Detail'].default_value=5;tex.inputs['Roughness'].default_value=.72
    fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=165;fine.inputs['Detail'].default_value=3
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.24;bump.inputs['Distance'].default_value=.018
    l.new(tex.outputs['Fac'],bump.inputs['Height'])
    micro=n.new('ShaderNodeBump');micro.inputs['Strength'].default_value=.22;micro.inputs['Distance'].default_value=.007
    l.new(fine.outputs['Fac'],micro.inputs['Height']);l.new(bump.outputs['Normal'],micro.inputs['Normal']);l.new(micro.outputs['Normal'],s.inputs['Normal'])
    pores=n.new('ShaderNodeTexVoronoi');pores.feature='DISTANCE_TO_EDGE';pores.inputs['Scale'].default_value=150
    ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.01;ramp.color_ramp.elements[0].color=(.40,.50,.45,1);ramp.color_ramp.elements[1].position=.08;ramp.color_ramp.elements[1].color=(.10,.21,.24,1)
    l.new(pores.outputs['Distance'],ramp.inputs[0]);l.new(ramp.outputs[0],s.inputs['Base Color'])
    transparent=n.new('ShaderNodeBsdfTransparent');mix=n.new('ShaderNodeMixShader')
    density=n.new('ShaderNodeMapRange');density.inputs['From Min'].default_value=.01;density.inputs['From Max'].default_value=.09;density.inputs['To Min'].default_value=.95;density.inputs['To Max'].default_value=.55
    l.new(pores.outputs['Distance'],density.inputs['Value']);l.new(density.outputs[0],mix.inputs[0]);l.new(transparent.outputs[0],mix.inputs[1]);l.new(s.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],n.get('Material Output').inputs['Surface'])
    core,s,n,l=material('Heterogeneous suspended density',(.24,.25,.16),.26,.55)
    s.inputs['Subsurface Weight'].default_value=.30;s.inputs['Subsurface Radius'].default_value=(.30,.15,.075)
    tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=8;tex.inputs['Detail'].default_value=5
    b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.18;b.inputs['Distance'].default_value=.018;l.new(tex.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],s.inputs['Normal'])
    rim,*_=material('Warm grazing fold',(.92,.57,.25),.3,.1,1.5)
    pale,*_=material('Cool capillary reflection',(.25,.57,.64),.4,.1,.16)
    dust,*_=material('Suspended grains',(.45,.46,.34),.6,0,.22)
    return film,core,rim,pale,dust

def make_folds(fold,side,separate,unravel,mats,ordered=0):
    film,core,rim,pale,dust=mats
    for k in range(19):
        if not ordered and k%7:continue
        u0=(k/19)*2*PI
        points=[]
        for j in range(52):
            v=-1.22+2.44*j/51
            u=u0+.09*math.sin(v*5+k*.9)+.04*math.sin(v*13+k)
            q=shape(u,v,fold,side,separate,unravel)
            if ordered:
                target=Vector((-4.1+(k%10)*.85,.2+(k//10)*.18,-1.7+(k//10)*1.05+(j/51-.5)*.50+.10*math.sin(j/51*PI*3+k)))
                q=q.lerp(target,ordered)
            points.append(q)
        filament('Caustic to membrane to stroke',points,rim if k%7==0 else pale,.0025 if k%7==0 else .001)

def interior(side,separate,mats,unravel=0):
    _,core,rim,pale,_=mats
    def transform(x,y,z):
        reach=max(0,min(1,(x+.3)/2.1))
        if TENSION:
            neck=.48+.52*min(1,abs(x)/1);y*=neck;z*=neck;x*=1.25
        return (x*(.69 if separate else 1)+side*1.35*separate+unravel*reach*2.5,y*(1-unravel*reach*.75),z*(1-unravel*reach*.82)+side*.23*separate)
    rng=random.Random(cfg['seed']+int(side+1))
    for i in range(360):
        x=rng.uniform(-1.2,1.1);z=rng.uniform(-.64,.68)
        if (x/1.3)**2+(z/.8)**2>1:continue
        y=rng.uniform(-.38,.38);size=rng.uniform(.018,.095)
        loc=transform(x,y,z*.8);size*=1-unravel*max(0,min(1,(x+.3)/2.1))*.88
        o=sphere('Irregular inner aggregate',loc,(size*1.4,size,size*.8),core,2)
        for v in o.data.vertices:v.co*=1+.08*noise.noise_vector(v.co*4)[0]
    for i in range(45):
        pts=[]
        for j in range(80):
            t=j/79;x=t*2.3-1.15+.08*math.sin(t*17+i)
            pts.append(transform(x,.20*math.sin(t*8+i),.35*math.sin(t*6.2+i*.83)+.045*math.sin(t*19+i)))
        filament('Inner tension fold',pts,rim if i%15==0 else pale,.0018 if i%15==0 else .001)

def setup(frame,mobile):
    global TENSION
    TENSION=frame==5
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes,bpy.data.curves,bpy.data.materials,bpy.data.lights,bpy.data.cameras):
        for block in list(collection):
            if block.users==0:collection.remove(block)
    sc=bpy.context.scene;sc.render.engine=cfg['engine'];sc.cycles.samples=args.samples or cfg['samples'];sc.cycles.use_denoising=True
    sc.cycles.max_bounces=6;sc.cycles.transmission_bounces=4;sc.cycles.transparent_max_bounces=12
    sc.render.resolution_x,sc.render.resolution_y=cfg['mobile' if mobile else 'desktop'];sc.render.resolution_percentage=100
    sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGB';sc.render.image_settings.color_depth='16'
    sc.view_settings.view_transform=cfg['viewTransform'];sc.view_settings.exposure=cfg['exposure']
    sc.world.use_nodes=True;sc.world.node_tree.nodes['Background'].inputs[0].default_value=(*cfg['worldColor'],1);sc.world.node_tree.nodes['Background'].inputs[1].default_value=.18
    mats=make_materials();film,core,rim,pale,dust=mats
    rng=random.Random(cfg['seed'])
    area('Cool grazing source',(-3,2.5,4),600,cfg['coolLight'],2,(0,0,0))
    area('Warm transmitted source',(-2,1.5,2.5),450,cfg['warmLight'],.65,(.4,0,0))
    area('Soft water bounce',(1,-3,3),45,(.34,.58,.64),5,(0,0,0))
    d=bpy.data.lights.new('Light carried in the medium','POINT');d.energy=8;d.color=cfg['warmLight'];d.shadow_soft_size=.25
    inner=link(bpy.data.objects.new('Light carried in the medium',d));inner.location=(.4,.25,.1)
    d=bpy.data.lights.new('Light through the medium','SPOT');d.energy=340;d.color=cfg['warmLight'];d.spot_size=.42;d.spot_blend=.7;d.shadow_soft_size=.10
    beam=link(bpy.data.objects.new('Light through the medium',d));beam.location=(-2,1.5,4);beam.rotation_euler=(Vector((0,0,-1))-beam.location).to_track_quat('-Z','Y').to_euler()
    # A shared low-density medium, not a new backdrop per shot.
    vol=bpy.data.materials.new('Shared absorbing medium');vol.use_nodes=True
    n=vol.node_tree.nodes;n.clear();o=n.new('ShaderNodeOutputMaterial');v=n.new('ShaderNodeVolumePrincipled');v.inputs['Color'].default_value=(.08,.19,.27,1);v.inputs['Density'].default_value=.005;v.inputs['Anisotropy'].default_value=.42;vol.node_tree.links.new(v.outputs['Volume'],o.inputs['Volume'])
    bpy.ops.mesh.primitive_cube_add(size=2,location=(0,3,1));fog=bpy.context.object;fog.name='Shared medium';fog.scale=(12,12,8);fog.data.materials.append(vol)
    for i in range(210):
        loc=(rng.uniform(-7,7),rng.uniform(-3,5),rng.uniform(-3,5));s=rng.uniform(.008,.025)
        sphere('Matter in depth',loc,(s,s,s),dust,1)
    # Out-of-focus folds at the edges establish the same spatial world.
    for i,loc in enumerate([(-4.8,-3,-2.6),(4,5,2),(-2,6,5)]):
        o=membrane('Peripheral depth',film);o.location=loc;o.scale=(1.25,.9,1.15)
    focus=(.15,0,.05);camera_pos=(.4,-9.4,1.0);lens=cfg['lensMm']
    if frame==3:
        water,s,n,l=material('Wet medium before folding',(.20,.37,.40),.10,.85)
        s.inputs['IOR'].default_value=1.333
        tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=35;tex.inputs['Detail'].default_value=4
        b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.25;b.inputs['Distance'].default_value=.03;l.new(tex.outputs['Fac'],b.inputs['Height']);l.new(b.outputs[0],s.inputs['Normal'])
        membrane('Open light-bearing sheet',water,fold=.40);make_folds(.40,0,0,0,mats)
        focus=(.2,0,.7);camera_pos=(-.6,-16,-.9)
    elif frame in (4,5):
        obj=membrane('Continuous membrane',film)
        make_folds(1,0,0,0,mats);interior(0,0,mats)
    elif frame in (6,7):
        for side in (-1,1):
            unravel=.9 if frame==7 and side==1 else 0
            membrane('Related descendant',film,side=side,separate=1,unravel=unravel)
            make_folds(1,side,1,unravel,mats);interior(side,1,mats,unravel)
        focus=(.6,0,.1);camera_pos=(.7,-13.5,1.0)
    elif frame==8:
        make_folds(1,1,1,1,mats,ordered=1)
        make_folds(1,-1,1,1,mats,ordered=.82)
        focus=(0,0,0);camera_pos=(.1,-12,.7)
    elif frame in (1,2):
        sphere('Distant form',(0,2,-2.6),(3,3,3),core,5)
        pts=[(-5+t*.08,2, .20+.20*math.sin(t*.036)) for t in range(125)]
        filament('Grazing horizon',pts,rim,.004 if frame==1 else .008)
        if frame==1:camera_pos=(0,-48,6);lens=70
        else:camera_pos=(0,-14,.4)
        focus=(0,2,0)
    if mobile:
        camera_pos=(camera_pos[0]+1.0,camera_pos[1]*1.26,camera_pos[2]+1.7)
        focus=(.25 if frame!=7 else .8,0,.2)
        lens=42
        # Roll redistributes the horizontal transformation into a portrait diagonal.
    bpy.ops.object.empty_add(location=focus);target=bpy.context.object;target.name='Focus plane'
    bpy.ops.object.camera_add(location=camera_pos);cam=bpy.context.object;cam.name='Portrait camera' if mobile else 'Master camera';cam.rotation_euler=(Vector(focus)-cam.location).to_track_quat('-Z','Y').to_euler()
    if mobile:cam.rotation_euler.rotate_axis('Z',-.48 if frame in (5,7,8) else -.16)
    cam.data.lens=lens;cam.data.dof.use_dof=True;cam.data.dof.focus_object=target;cam.data.dof.aperture_fstop=cfg['fStop'];sc.camera=cam
    # Physical macro scale makes depth of field a lens property, not a blur overlay.
    scale=.05
    for obj in sc.objects:
        obj.location*=scale
        if obj.type not in ('CAMERA','LIGHT'):obj.scale*=scale
        if obj.type=='LIGHT':
            obj.data.energy*=scale*scale
            if obj.data.type=='AREA':obj.data.size*=scale
            else:obj.data.shadow_soft_size*=scale
    for mat in bpy.data.materials:
        if mat.use_nodes:
            for node in mat.node_tree.nodes:
                if node.bl_idname=='ShaderNodeBump':node.inputs['Distance'].default_value*=scale
                if node.bl_idname=='ShaderNodeBsdfPrincipled':node.inputs['Subsurface Radius'].default_value=tuple(x*scale for x in node.inputs['Subsurface Radius'].default_value)
    v.inputs['Density'].default_value/=.05
    sc.use_nodes=True;n=sc.node_tree.nodes;n.clear();r=n.new('CompositorNodeRLayers');glow=n.new('CompositorNodeGlare');glow.glare_type='FOG_GLOW';glow.quality='HIGH';glow.inputs['Threshold'].default_value=2.5;glow.inputs['Size'].default_value=.2;glow.inputs['Strength'].default_value=.06;o=n.new('CompositorNodeComposite');sc.node_tree.links.new(r.outputs['Image'],glow.inputs['Image']);sc.node_tree.links.new(glow.outputs['Image'],o.inputs['Image'])
    return sc

if __name__=='__main__':
    for label in args.frames.split(','):
        frame=int(label);start=time.perf_counter();sc=setup(frame,args.mobile)
        name=f'frame-{frame:02d}'+('-mobile' if args.mobile else '-desktop')
        sc.render.filepath=str(out/(name+'.png'))
        bpy.ops.wm.save_as_mainfile(filepath=str(out/(name+'.blend')))
        bpy.ops.render.render(write_still=True)
        (out/(name+'.json')).write_text(json.dumps({'frame':frame,'mobile':args.mobile,'seconds':round(time.perf_counter()-start,2),'config':cfg,'samples':sc.cycles.samples},indent=2))
        print('LOOKDEV_COMPLETE',name,round(time.perf_counter()-start,2),flush=True)
