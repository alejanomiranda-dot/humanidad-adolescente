"""Material-only 03 / 03.5 / 04 study. Reuses checkpoint cameras and world.
blender -b --python scripts/production/material-target-v2.py -- --output OUTSIDE_REPO --frames 03,03.5,04 --samples 16
No animation. No changes to the checkpoint renderer or web assets.
"""
import sys, math, time, json
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
import lookdev as base
S=.05

def material():
    mat,s,n,l=base.material('One continuous heterogeneous tissue',(.65,.72,.65),.3,.82)
    s.inputs['IOR'].default_value=1.36
    s.inputs['Subsurface Weight'].default_value=.25;s.inputs['Subsurface Scale'].default_value=.4
    s.inputs['Subsurface Radius'].default_value=(.006,.003,.0015)
    s.inputs['Coat Weight'].default_value=.08;s.inputs['Coat Roughness'].default_value=.32
    density=n.new('ShaderNodeAttribute');density.attribute_name='tissue_density'
    color=n.new('ShaderNodeValToRGB');color.color_ramp.elements[0].position=.1;color.color_ramp.elements[0].color=(.60,.78,.80,1);color.color_ramp.elements[1].position=.9;color.color_ramp.elements[1].color=(.80,.59,.33,1)
    l.new(density.outputs['Fac'],color.inputs[0]);l.new(color.outputs[0],s.inputs['Base Color'])
    rough=n.new('ShaderNodeMapRange');rough.inputs['To Min'].default_value=.15;rough.inputs['To Max'].default_value=.44;l.new(density.outputs['Fac'],rough.inputs['Value']);l.new(rough.outputs[0],s.inputs['Roughness'])
    trans=n.new('ShaderNodeMapRange');trans.inputs['To Min'].default_value=.96;trans.inputs['To Max'].default_value=.40;l.new(density.outputs['Fac'],trans.inputs['Value']);l.new(trans.outputs[0],s.inputs['Transmission Weight'])
    fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=125;fine.inputs['Detail'].default_value=3
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.2;bump.inputs['Distance'].default_value=.00012;l.new(fine.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],s.inputs['Normal'])
    return mat

def tissue():
    # A thick, warped continuous sheet through a 3D density field. There is no skin
    # surrounding separate contents and no removed rectangular mesh faces.
    nx,ny,nz=136,72,112
    xs=np.linspace(-1.9,1.9,nx);ys=np.linspace(-1.05,1.05,ny);zs=np.linspace(-1.05,2.4,nz)
    x,y,z=np.meshgrid(xs,ys,zs,indexing='ij')
    center=.22*np.sin(x*1.9)+.1*x
    rr=np.sqrt((y/.70)**2+((z-center)/.80)**2)
    envelope=1-(x/1.78)**2-rr**2/(1+.23*np.sin(x*3.2+1))**2
    xx=x*7.5+.8*np.sin(z*3.1)+.6*np.sin(y*5.3)
    yy=y*8+.6*np.sin(x*3.7)+.4*np.cos(z*4)
    zz=(z-center)*8+.7*np.sin(x*4.1+y*3)
    gyroid=np.sin(xx)*np.cos(yy)+np.sin(yy)*np.cos(zz)+np.sin(zz)*np.cos(xx)
    thickness=.12+.14*(.5+.5*np.sin(x*2.7+y*4.3+z*3.1))
    field=np.minimum(envelope,thickness-np.abs(gyroid))
    # Marching tetrahedra: interpolate the density crossing; never cut grid-shaped holes.
    positions=np.stack((x,y,z),axis=-1).reshape(-1,3)
    grid=np.arange(nx*ny*nz).reshape(nx,ny,nz)
    corners=[grid[:-1,:-1,:-1],grid[1:,:-1,:-1],grid[1:,1:,:-1],grid[:-1,1:,:-1],grid[:-1,:-1,1:],grid[1:,:-1,1:],grid[1:,1:,1:],grid[:-1,1:,1:]]
    cells=np.stack([c.ravel() for c in corners],axis=1)
    values=field.ravel();vertices=[];triangles=[];offset=0
    tets=[(0,5,1,6),(0,1,2,6),(0,2,3,6),(0,3,7,6),(0,7,4,6),(0,4,5,6)]
    for tet in tets:
        ids=cells[:,tet];val=values[ids];bits=(val>0).astype(np.int8);cases=bits@np.array([1,2,4,8])
        for case in range(1,15):
            rows=ids[cases==case]
            if not len(rows):continue
            inside=[i for i in range(4) if case&(1<<i)];outside=[i for i in range(4) if not case&(1<<i)]
            def edge(a,b):
                ia,ib=rows[:,a],rows[:,b];va,vb=values[ia],values[ib]
                mix=(va/(va-vb))[:,None]
                return positions[ia]+mix*(positions[ib]-positions[ia])
            if len(inside)==1:
                points=[edge(inside[0],o) for o in outside];order=[(0,1,2)]
            elif len(inside)==3:
                points=[edge(outside[0],i) for i in inside];order=[(0,2,1)]
            else:
                a,b=inside;c,d=outside;points=[edge(a,c),edge(a,d),edge(b,c),edge(b,d)];order=[(0,1,2),(1,3,2)]
            packed=np.stack(points,axis=1).reshape(-1,3);vertices.append(packed)
            start=np.arange(len(rows))*len(points)+offset
            for order_tri in order:triangles.append(start[:,None]+np.array(order_tri))
            offset+=len(packed)
    verts=np.concatenate(vertices);faces=np.concatenate(triangles)
    mesh=bpy.data.meshes.new('Connected density isosurface');mesh.from_pydata(verts.tolist(),[],faces.tolist());mesh.update()
    obj=base.link(bpy.data.objects.new('Continuous organized matter',mesh));obj.scale=(S,S,S)
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    import bmesh
    bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free()
    for f in mesh.polygons:f.use_smooth=True
    smooth=obj.modifiers.new('Soft density transitions','SMOOTH');smooth.factor=.65;smooth.iterations=3
    mesh.materials.append(material())
    density=mesh.attributes.new(name='tissue_density',type='FLOAT',domain='POINT')
    coords=np.array([v.co[:] for v in mesh.vertices]);weights=.5+.5*np.sin(coords[:,0]*2.7+coords[:,1]*4.3+coords[:,2]*3.1)
    density.data.foreach_set('value',weights.astype(np.float32))
    # Fine non-emissive strands join the actual tissue vertices and catch the same light.
    for k in range(7):
        intended=np.array([-.9+k*.13,-.03,.60]);anchor=coords[np.argmin(np.sum((coords-intended)**2,axis=1))]
        destination=np.array([-1.5+k*.055,.15+math.sin(k)*.1,2.17])
        points=[];radii=[]
        for j in range(65):
            t=j/64;q=anchor*(1-t)+destination*t
            q+=np.array([.08*math.sin(t*7+k),.045*math.sin(t*9+k),0])*math.sin(math.pi*t)
            points.append(q);radii.append((1-t)*.8+.2)
        filament=base.filament('Tissue capillary in grazing light',points,mesh.materials[0],.0035,radii);filament.scale=(S,S,S)
    return obj

def caustic_light_mask():
    # A projected-light lookdev mask: a lighting approximation, not a fluid simulation.
    mat=bpy.data.materials.new('Caustic projection only');mat.use_nodes=True;n=mat.node_tree.nodes;l=mat.node_tree.links;n.clear()
    out=n.new('ShaderNodeOutputMaterial');clear=n.new('ShaderNodeBsdfTransparent');opaque=n.new('ShaderNodeBsdfDiffuse');opaque.inputs['Color'].default_value=(0,0,0,1)
    coord=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeTexVoronoi');v.feature='DISTANCE_TO_EDGE';v.inputs['Scale'].default_value=13;l.new(coord.outputs['Generated'],v.inputs['Vector'])
    cut=n.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.065;l.new(v.outputs['Distance'],cut.inputs[0])
    ray=n.new('ShaderNodeLightPath');product=n.new('ShaderNodeMath');product.operation='MULTIPLY';l.new(ray.outputs['Is Shadow Ray'],product.inputs[0]);l.new(cut.outputs[0],product.inputs[1])
    mix=n.new('ShaderNodeMixShader');l.new(product.outputs[0],mix.inputs[0]);l.new(clear.outputs[0],mix.inputs[1]);l.new(opaque.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],out.inputs['Surface'])
    mesh=bpy.data.meshes.new('Projected caustic mask');mesh.from_pydata([(-3,-1,1.6),(2,-1,1.6),(2,3,1.6),(-3,3,1.6)],[],[(0,1,2,3)]);mesh.materials.append(mat)
    obj=base.link(bpy.data.objects.new('Optical study mask invisible to camera',mesh));obj.scale=(S,S,S)

def water():
    mat,s,n,l=base.material('Water optical boundary',(.08,.22,.26),.18,.92)
    s.inputs['IOR'].default_value=1.333
    tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=90;tex.inputs['Detail'].default_value=4
    bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.24;bump.inputs['Distance'].default_value=.00045;l.new(tex.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],s.inputs['Normal'])
    nx,ny=240,260;verts=[];faces=[]
    for j in range(ny+1):
        y=-32+55*j/ny
        for i in range(nx+1):
            x=-18+36*i/nx
            z=2.2+.045*math.sin(x*3.3+y*1.8)+.025*math.sin(y*6-x*2.1)+.012*math.sin(x*8+y*5)
            verts.append((x,y,z))
    for j in range(ny):
        for i in range(nx):k=j*(nx+1)+i;faces.append((k,k+1,k+nx+2,k+nx+1))
    mesh=bpy.data.meshes.new('Water surrounds the lens');mesh.from_pydata(verts,[],faces);mesh.materials.append(mat)
    obj=base.link(bpy.data.objects.new('Water air surface',mesh));obj.scale=(S,S,S)
    for p in mesh.polygons:p.use_smooth=True

for label in base.args.frames.split(','):
    frame=float(label)
    if frame not in (3,3.5,4) or base.args.mobile:raise ValueError('Only desktop 03,03.5,04 in this study')
    start=time.perf_counter();sc=base.setup(4,False)
    for obj in list(sc.objects):
        if obj.name.startswith(('Continuous membrane','Caustic to membrane to stroke','Inner tension fold','Irregular inner aggregate','Peripheral depth')):bpy.data.objects.remove(obj,do_unlink=True)
    organism=tissue();water();caustic_light_mask()
    for index,(loc,size) in enumerate([((-4,-5,-1.7),1.8),((4.5,3,-.6),1.1),((-2,6,0),.8)]):
        obj=organism.copy();obj.data=organism.data;sc.collection.objects.link(obj);obj.location=Vector(loc)*S;obj.scale*=size;obj.rotation_euler.y=.4*(index-1);obj.name=f'Same matter in depth {index}'
    fog=bpy.data.objects.get('Shared medium');fog.location=Vector((0,-8,-2.9))*S;fog.scale=(12*S,24*S,5.1*S)
    vol=fog.data.materials[0].node_tree.nodes.get('Principled Volume');vol.inputs['Density'].default_value=.16;vol.inputs['Color'].default_value=(.24,.45,.53,1)
    for name in ('Cool grazing source','Warm transmitted source','Light through the medium'):
        light=bpy.data.objects.get(name);light.location.z=1.8*S;light.rotation_euler=(Vector((0,0,-.4))*S-light.location).to_track_quat('-Z','Y').to_euler()
    cold=bpy.data.objects.get('Cool grazing source');cold.data.energy*=1.2;cold.visible_glossy=False
    warm=bpy.data.objects.get('Warm transmitted source');warm.data.energy*=1.4;warm.data.size=.08*S
    fill=bpy.data.objects.get('Soft water bounce');fill.location.z=1.7*S;fill.data.energy*=2;fill.visible_glossy=False
    bpy.data.objects.get('Light through the medium').data.energy*=5
    sc.cycles.max_bounces=12;sc.cycles.transmission_bounces=10
    sc.view_settings.exposure=-.35
    mix=frame-3;cam=sc.camera;focus=bpy.data.objects.get('Focus plane')
    cam.location=Vector((-.8,-16,1.8)).lerp(Vector((.4,-8.8,.8)),mix)*S
    focus.location=Vector((0,1,.5)).lerp(Vector((0,0,.05)),mix)*S
    cam.rotation_euler=(focus.location-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.dof.aperture_fstop=5.6
    name='frame-'+('03.5' if frame==3.5 else f'{int(frame):02d}')+'-desktop'
    sc.render.filepath=str(base.out/(name+'.png'));bpy.ops.wm.save_as_mainfile(filepath=str(base.out/(name+'.blend')));bpy.ops.render.render(write_still=True)
    (base.out/(name+'.json')).write_text(json.dumps({'frame':frame,'study':'material-target-v2-iteration-2','seconds':round(time.perf_counter()-start,2),'samples':sc.cycles.samples},indent=2))
    print('MATERIAL_COMPLETE',name,round(time.perf_counter()-start,2),flush=True)
