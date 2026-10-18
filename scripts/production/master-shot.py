"""Blender 4.5 LTS. Reproducible membrane study; generated assets, no third-party material.

blender -b --python scripts/production/master-shot.py -- --output DIR --frame 48
blender -b --python scripts/production/master-shot.py -- --output DIR --animate
"""
import argparse
import math
import os
import random
import sys
import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--frame', type=int, default=1)
parser.add_argument('--animate', action='store_true')
parser.add_argument('--size', type=int, default=640)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
os.makedirs(args.output, exist_ok=True)
random.seed(22026)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.cycles.transmission_bounces = 6
scene.render.resolution_x = args.size
scene.render.resolution_y = args.size
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 120
scene.world.color = (0.001, 0.001, 0.001)
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (0.006, 0.012, 0.016, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = 0.1
scene.view_settings.view_transform = 'AgX'

def material(name, color, rough=0.35, transmission=0, subsurface=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    p = nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Transmission Weight'].default_value = transmission
    p.inputs['Subsurface Weight'].default_value = subsurface
    p.inputs['IOR'].default_value = 1.36
    p.inputs['Coat Weight'].default_value = 0.16
    p.inputs['Coat Roughness'].default_value = 0.22
    return mat, p, nodes, links

shell, p, nodes, links = material('Membrane / silver mineral', (0.48,0.56,0.44), .24, .55, .025)
noise = nodes.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 7
noise.inputs['Detail'].default_value = 5; noise.inputs['Roughness'].default_value = .72
bump = nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .28; bump.inputs['Distance'].default_value = .045
links.new(noise.outputs['Fac'], bump.inputs['Height']); links.new(bump.outputs['Normal'],p.inputs['Normal'])
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position=.2; ramp.color_ramp.elements[0].color=(.12,.19,.14,1)
ramp.color_ramp.elements[1].position=.8; ramp.color_ramp.elements[1].color=(.65,.70,.56,1)
links.new(noise.outputs['Fac'],ramp.inputs[0]); links.new(ramp.outputs[0],p.inputs['Base Color'])
transparent=nodes.new('ShaderNodeBsdfTransparent')
fresnel=nodes.new('ShaderNodeFresnel'); fresnel.inputs['IOR'].default_value=1.36
rim=nodes.new('ShaderNodeMath'); rim.operation='MULTIPLY_ADD'; rim.inputs[1].default_value=.55; rim.inputs[2].default_value=.36
links.new(fresnel.outputs[0],rim.inputs[0])
mix=nodes.new('ShaderNodeMixShader'); links.new(rim.outputs[0],mix.inputs[0]); links.new(transparent.outputs[0],mix.inputs[1]); links.new(p.outputs[0],mix.inputs[2]); links.new(mix.outputs[0],nodes.get('Material Output').inputs['Surface'])
inner, interior_bsdf, _, _ = material('Internal folds / umber', (.16,.13,.065), .65, .12, .2)
interior_bsdf.inputs['Coat Weight'].default_value=0
interior_bsdf.inputs['Specular IOR Level'].default_value=.2
fine, _, _, _ = material('Fine suspended matter', (.22,.30,.28), .3, .2, .08)

meta = bpy.data.metaballs.new('Continuous division field')
meta.resolution = .065; meta.render_resolution = .04; meta.threshold = .65
cell = bpy.data.objects.new('Membrane', meta); scene.collection.objects.link(cell)
cell.data.materials.append(shell)
for side in [-1,1]:
    element=meta.elements.new(); element.radius=1.8
    for frame, distance, radius in [(1,.0,1.8),(20,.10,1.78),(50,.68,1.55),(78,1.05,1.46),(96,1.28,1.42),(120,1.40,1.40)]:
        element.co=(side*distance, .03*side, .08*side*distance)
        element.radius=radius*(1 if side<0 else .975)
        element.keyframe_insert('co',frame=frame); element.keyframe_insert('radius',frame=frame)
cell.rotation_euler=(.08,0,-.12)
cell.keyframe_insert('rotation_euler',frame=1)
cell.rotation_euler=(.13,.03,-.04)
cell.keyframe_insert('rotation_euler',frame=120)

# Irregular translucent folds, without a schoolbook nucleus.
for side in [-1,1]:
    group=bpy.data.objects.new('Internal drift',None); scene.collection.objects.link(group)
    group.parent=cell
    for i in range(36):
        curve=bpy.data.curves.new('Fold','CURVE'); curve.dimensions='3D'
        curve.bevel_depth=random.uniform(.006,.018); curve.bevel_resolution=2
        spline=curve.splines.new('BEZIER'); spline.bezier_points.add(5)
        center=Vector((random.uniform(-.6,.6),random.uniform(-.48,.48),random.uniform(-.55,.55)))
        direction=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-1,1))).normalized()
        a=random.uniform(0,math.tau)
        for j, point in enumerate(spline.bezier_points):
            point.co=center+direction*(j-2.5)*.10+Vector((math.sin(a+j*.7)*.06,math.cos(a+j*.5)*.04,math.sin(a+j*.6)*.08))
            point.handle_left_type=point.handle_right_type='AUTO'
        obj=bpy.data.objects.new('Fold',curve); scene.collection.objects.link(obj); obj.parent=group
        curve.materials.append(inner if i%3 else fine)
    for frame,x in [(1,0),(50,.5),(78,.88),(120,1.4)]:
        group.location=(side*x,0,side*x*.08); group.keyframe_insert('location',frame=frame)
        group.scale=(.62*(1-x*.18),)*3; group.keyframe_insert('scale',frame=frame)

def area(name, pos, power, color, size, target=(0,0,0)):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.color=color; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=pos
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

area('Long silver rim',(-3,1.6,3),750,(.65,.82,1),3.2)
area('Warm transmitted light',(2,2,0),350,(1,.70,.36),4)
area('Soft front bounce',(-2,-4,1),110,(.7,.88,.82),4)
bpy.ops.object.camera_add(location=(0,-9,2.0))
camera=bpy.context.object; camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.lens=58; camera.data.dof.use_dof=True; camera.data.dof.focus_object=cell; camera.data.dof.aperture_fstop=5.6
scene.camera=camera
camera.location=(0,-9,2); camera.keyframe_insert('location',frame=1)
camera.location=(.12,-9.3,1.9); camera.keyframe_insert('location',frame=120)
scene.render.filepath=os.path.join(args.output,'frame-')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(args.output,'master-membrane.blend'))
if args.animate:
    bpy.ops.render.render(animation=True)
else:
    scene.frame_set(args.frame)
    scene.render.filepath=os.path.join(args.output,f'study-{args.frame:04}.png')
    bpy.ops.render.render(write_still=True)
