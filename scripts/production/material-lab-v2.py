"""One density-derived mass; organization is a continuous participating medium.

Input is the saved A1 study, preserved untouched. Produces one explicitly selected
still, never an animation. The fourth variant requires an explicit decision.
"""
import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument('--source', required=True)
parser.add_argument('--output', required=True)
parser.add_argument('--variant', type=int, choices=(1, 2, 3, 4), required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
out = Path(args.output)
out.mkdir(parents=True, exist_ok=True)
stem = 'V' + str(args.variant)
if (out / (stem + '.png')).exists():
    raise RuntimeError('A completed study must not be overwritten.')


class Field:
    def __init__(self, tree):
        self.nodes = tree.nodes
        self.links = tree.links

    def node(self, kind, label=''):
        n = self.nodes.new(kind)
        n.label = label
        return n

    def put(self, a, b):
        if isinstance(a, (int, float, tuple)):
            b.default_value = a
        else:
            self.links.new(a, b)

    def math(self, op, a, b=0):
        n = self.node('ShaderNodeMath'); n.operation = op
        self.put(a, n.inputs[0]); self.put(b, n.inputs[1])
        return n.outputs[0]

    def vec(self, x, y, z):
        n = self.node('ShaderNodeCombineXYZ')
        for a, b in zip((x, y, z), n.inputs): self.put(a, b)
        return n.outputs[0]

    def noise(self, p, scale, detail=2):
        n = self.node('ShaderNodeTexNoise')
        self.put(p, n.inputs['Vector'])
        n.inputs['Scale'].default_value = scale
        n.inputs['Detail'].default_value = detail
        n.inputs['Roughness'].default_value = .55
        return n.outputs['Fac']

    def remap(self, v, a, b, c, d):
        n = self.node('ShaderNodeMapRange')
        n.clamp = True; n.interpolation_type = 'SMOOTHERSTEP'
        for name, value in [('Value', v), ('From Min', a), ('From Max', b),
                            ('To Min', c), ('To Max', d)]:
            self.put(value, n.inputs[name])
        return n.outputs[0]


def organized_medium():
    mat = bpy.data.materials.new('Continuous organization ' + stem)
    mat.use_nodes = True
    f = Field(mat.node_tree); f.nodes.clear()
    output = f.node('ShaderNodeOutputMaterial')
    coord = f.node('ShaderNodeTexCoord').outputs['Object']
    separate = f.node('ShaderNodeSeparateXYZ'); f.put(coord, separate.inputs[0])
    x, y, z = separate.outputs

    # A deformed material coordinate gives the whole medium an axial flow.
    center_y = f.math('MULTIPLY', f.math('SINE', f.math('MULTIPLY', x, 2.2)), .16)
    center_z = f.math('MULTIPLY', f.math('SINE', f.math('ADD', f.math('MULTIPLY', x, 2.4), 1)), .13)
    wy = f.math('SUBTRACT', y, center_y)
    wz = f.math('SUBTRACT', z, center_z)
    flow = f.vec(f.math('MULTIPLY', x, .48), wy, wz)
    broad = f.noise(flow, 2.7, 2)
    calm = f.noise(coord, 1.3, 1)
    if args.variant == 1:
        density = f.math('ADD', 18, f.math('MULTIPLY', calm, 22))
    else:
        dense = f.remap(broad, .35, .72, 0, 1)
        clouds = f.math('POWER', dense, 2.8)
        density = f.math('ADD', 1.2, f.math('MULTIPLY', clouds, 120))
        # Clear pockets are soft minima in the same medium, never bubble meshes.
        pockets = f.noise(f.vec(x, f.math('MULTIPLY', wy, 1.5), wz), 6.5, 1)
        pocket_factor = f.remap(pockets, .52, .76, 1, .28)
        density = f.math('MULTIPLY', density, pocket_factor)

    if args.variant >= 3:
        # Intersecting, smoothly varying density ridges. All remain scalar fields
        # evaluated throughout the same body, not curves or objects inside it.
        fibrils = 0
        for i in range(9):
            phase = i * 2.399
            angular = f.math('ADD', f.math('MULTIPLY', x, 1.5 + .09*i), phase)
            spread = f.math('ADD', .055, f.math('MULTIPLY',
                f.math('POWER', f.math('SINE', f.math('ADD', x, i*.31)), 2), .19))
            cy = f.math('MULTIPLY', f.math('SINE', angular), spread)
            cz = f.math('MULTIPLY', f.math('COSINE', angular), f.math('MULTIPLY', spread, .8))
            dy = f.math('SUBTRACT', wy, cy); dz = f.math('SUBTRACT', wz, cz)
            radius = .018 + .004*(i%3)
            r2 = f.math('ADD', f.math('MULTIPLY', dy, dy), f.math('MULTIPLY', dz, dz))
            gaussian = f.math('EXPONENT', f.math('MULTIPLY', r2, -1/(2*radius*radius)))
            fibrils = f.math('ADD', fibrils, gaussian)
        attenuation = f.remap(calm, .22, .76, .25, 1)
        density = f.math('ADD', f.math('MULTIPLY', density, .55), f.math('MULTIPLY',
            f.math('MULTIPLY', fibrils, attenuation), 390))

    surface = f.node('ShaderNodeBsdfPrincipled', 'Thin wet interface; organization is below it')
    surface.inputs['Base Color'].default_value = (.54, .65, .68, 1)
    surface.inputs['Transmission Weight'].default_value = .88
    surface.inputs['IOR'].default_value = 1.28
    surface.inputs['Specular IOR Level'].default_value = .28
    surface.inputs['Subsurface Weight'].default_value = .028
    surface.inputs['Subsurface Scale'].default_value = .00035
    surface.inputs['Subsurface Radius'].default_value = (.65, .85, 1)
    surface.inputs['Coat Weight'].default_value = .015
    if args.variant >= 2:
        surface.inputs['Base Color'].default_value = (.24, .36, .39, 1)
        surface.inputs['Transmission Weight'].default_value = .94
        surface.inputs['IOR'].default_value = 1.21
        surface.inputs['Subsurface Weight'].default_value = .008
        surface.inputs['Coat Weight'].default_value = 0
    if args.variant >= 3:
        surface.inputs['Specular IOR Level'].default_value = .08
        surface.inputs['IOR'].default_value = 1.16
        f.put(f.remap(broad, .3, .75, .95, .84), surface.inputs['Transmission Weight'])
    micro = f.noise(coord, 110, 2)
    f.put(f.remap(broad, .2, .8, .105 if args.variant >= 2 else .145,
                 .155 if args.variant >= 2 else .205), surface.inputs['Roughness'])
    bump = f.node('ShaderNodeBump')
    bump.inputs['Distance'].default_value = .000006
    bump.inputs['Strength'].default_value = .10
    f.put(micro, bump.inputs['Height']); f.put(bump.outputs[0], surface.inputs['Normal'])

    # Straight shadow transport across the interface lets the participating
    # medium receive direct light without a separate refractive-caustics solve.
    # Camera rays still use the partially transmissive rough dielectric above.
    transparent = f.node('ShaderNodeBsdfTransparent')
    transparent.inputs[0].default_value = (.87, .91, .93, 1)
    ray = f.node('ShaderNodeLightPath')
    shadow_mix = f.node('ShaderNodeMixShader')
    f.put(ray.outputs['Is Shadow Ray'], shadow_mix.inputs[0])
    f.put(surface.outputs[0], shadow_mix.inputs[1])
    f.put(transparent.outputs[0], shadow_mix.inputs[2])
    f.put(shadow_mix.outputs[0], output.inputs['Surface'])

    scatter = f.node('ShaderNodeVolumeScatter', 'Density and connected flow in one medium')
    scatter.inputs['Color'].default_value = (.55, .67, .69, 1)
    scatter.inputs['Anisotropy'].default_value = .35 if args.variant >= 2 else .18
    f.put(density, scatter.inputs['Density'])
    absorption = f.node('ShaderNodeVolumeAbsorption')
    absorption.inputs['Color'].default_value = (.55, .70, .74, 1)
    f.put(f.math('ADD', 2.5, f.math('MULTIPLY', density, .11)), absorption.inputs['Density'])
    volume = f.node('ShaderNodeAddShader')
    f.put(scatter.outputs[0], volume.inputs[0]); f.put(absorption.outputs[0], volume.inputs[1])
    f.put(volume.outputs[0], output.inputs['Volume'])
    return mat


def area(name, position, energy, color, size, target=(0, 0, 0)):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy; data.color = color; data.shape = 'DISK'; data.size = size
    obj = bpy.data.objects.new(name, data); bpy.context.collection.objects.link(obj)
    obj.location = Vector(position)*.04
    obj.rotation_euler = (Vector(target)*.04 - obj.location).to_track_quat('-Z', 'Y').to_euler()


bpy.ops.wm.open_mainfile(filepath=str(Path(args.source).resolve()))
scene = bpy.context.scene
mass = bpy.data.objects.get('A continuous density volume')
if mass is None or scene.camera is None:
    raise RuntimeError('Expected saved A mass and common lab camera.')
for obj in list(scene.objects):
    if obj not in (mass, scene.camera): bpy.data.objects.remove(obj, do_unlink=True)
bpy.context.view_layer.objects.active = mass
mass.select_set(True)
mass.modifiers.clear()
smooth = mass.modifiers.new('Suppress exterior noise; preserve continuous mass', 'SMOOTH')
smooth.factor = .85; smooth.iterations = 22
bpy.ops.object.modifier_apply(modifier=smooth.name)
sub = mass.modifiers.new('Soft continuous surface', 'SUBSURF'); sub.levels = 1
bpy.ops.object.modifier_apply(modifier=sub.name)
mass.data.materials.clear(); mass.data.materials.append(organized_medium())
world = bpy.data.worlds.new('Neutral black volume lab'); world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (.004, .004, .004, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = .06
scene.world = world
area('Localized warm light through thin regions', (-1.5, .9, 1.0), .38, (1, .69, .36), .028, (-.55, 0, 0))
area('Very soft cool fill', (1.2, -2.0, 1.2), .025, (.50, .68, 1), .09)
scene.cycles.samples = 16
scene.cycles.seed = 44
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 12
scene.cycles.transmission_bounces = 8
scene.cycles.volume_bounces = 2
scene.cycles.volume_step_rate = .5
scene.render.resolution_x = 1440; scene.render.resolution_y = 960
scene.render.resolution_percentage = 100
scene.view_settings.view_transform = 'AgX'; scene.view_settings.exposure = 0
scene.use_nodes = False
scene.render.filepath = str(out / (stem + '.png'))
bpy.ops.wm.save_as_mainfile(filepath=str(out / (stem + '.blend')))
bpy.ops.render.render(write_still=True)
