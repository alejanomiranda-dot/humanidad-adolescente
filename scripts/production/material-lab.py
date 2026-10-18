"""Isolated, bounded still study. Does not import or alter hero-frame renderers."""
import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector, noise

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True)
parser.add_argument('--round', type=int, choices=(1, 2), default=1)
parser.add_argument('--methods', default='A,B,C')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
S = .04


class Field:
    def __init__(self, tree):
        self.n, self.l = tree.nodes, tree.links

    def node(self, kind):
        return self.n.new(kind)

    def put(self, value, socket):
        if isinstance(value, (int, float, tuple)):
            socket.default_value = value
        else:
            self.l.new(value, socket)

    def math(self, op, a, b=0):
        n = self.node('ShaderNodeMath'); n.operation = op
        self.put(a, n.inputs[0]); self.put(b, n.inputs[1])
        return n.outputs[0]

    def vec(self, x, y, z):
        n = self.node('ShaderNodeCombineXYZ')
        for value, socket in zip((x, y, z), n.inputs): self.put(value, socket)
        return n.outputs[0]

    def split(self, vector):
        n = self.node('ShaderNodeSeparateXYZ'); self.put(vector, n.inputs[0])
        return n.outputs

    def noise(self, position, scale, detail=3, rough=.65):
        n = self.node('ShaderNodeTexNoise')
        self.put(position, n.inputs['Vector'])
        n.inputs['Scale'].default_value = scale
        n.inputs['Detail'].default_value = detail
        n.inputs['Roughness'].default_value = rough
        return n.outputs['Fac']


def group(obj, name):
    g = bpy.data.node_groups.new(name, 'GeometryNodeTree')
    g.interface.new_socket(name='Geometry', in_out='INPUT', socket_type='NodeSocketGeometry')
    g.interface.new_socket(name='Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    mod = obj.modifiers.new(name, 'NODES'); mod.node_group = g
    f = Field(g)
    incoming = f.node('NodeGroupInput'); outgoing = f.node('NodeGroupOutput')
    return f, incoming, outgoing, mod


def empty_mesh(name):
    mesh = bpy.data.meshes.new(name)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    return obj


def density_attribute(f, geometry, density):
    attr = f.node('GeometryNodeStoreNamedAttribute')
    attr.data_type = 'FLOAT'; attr.domain = 'POINT'
    attr.inputs['Name'].default_value = 'organization'
    f.put(geometry, attr.inputs['Geometry']); f.put(density, attr.inputs['Value'])
    return attr.outputs['Geometry']


def volume_mass():
    obj = empty_mesh('A continuous density volume')
    f, incoming, outgoing, mod = group(obj, 'A density accumulation then isosurface')
    p = f.node('GeometryNodeInputPosition').outputs[0]
    x, y, z = f.split(p)
    # A single summed density field. Closely overlapping anisotropic kernels form
    # a folded ridge with a thin skirt, never a hollowed or perforated container.
    field = 0
    for i in range(13):
        t = i / 12
        cx = -1.45 + 2.9*t
        cy = .18*math.sin(t*6.5)
        cz = .14*math.sin(t*7.0) + .10
        for layer in range(3 if args.round == 2 else 2):
            center = (cx, cy + layer*.25, cz + layer*(.24+.12*math.sin(t*8)))
            radii = (.29, .28 if layer else .48, .29 if layer else .15)
            if args.round == 2:
                center = (cx, cy + (layer-1)*(.20+.08*math.sin(t*9)),
                          cz + layer*.17 + .095*math.sin(t*15+layer*1.7))
                radii = (.25, .22 if layer else .45, .18 if layer else .065)
            squared = 0
            for axis, c, r in zip((x, y, z), center, radii):
                q = f.math('DIVIDE', f.math('SUBTRACT', axis, c), r)
                squared = f.math('ADD', squared, f.math('MULTIPLY', q, q))
            kernel = f.math('EXPONENT', f.math('MULTIPLY', squared, -1.65))
            field = f.math('ADD', field, kernel)
    broad = f.noise(p, 2.7, 3)
    folds = f.noise(f.vec(f.math('MULTIPLY', x, .65), y, f.math('MULTIPLY', z, 2.4)), 8, 2)
    variation = f.math('ADD', .68, f.math('MULTIPLY', broad, .48))
    variation = f.math('ADD', variation, f.math('MULTIPLY', folds, .85 if args.round == 2 else .21))
    field = f.math('MULTIPLY', field, variation)
    vol = f.node('GeometryNodeVolumeCube')
    vol.inputs['Min'].default_value = (-2, -1, -.65)
    vol.inputs['Max'].default_value = (2, 1.1, 1.1)
    for axis, res in zip('XYZ', (184, 100, 92)):
        vol.inputs['Resolution '+axis].default_value = res
    f.put(field, vol.inputs['Density'])
    surface = f.node('GeometryNodeVolumeToMesh'); surface.resolution_mode = 'GRID'
    surface.inputs['Threshold'].default_value = .42
    surface.inputs['Adaptivity'].default_value = 0
    f.put(vol.outputs['Volume'], surface.inputs['Volume'])
    f.put(density_attribute(f, surface.outputs['Mesh'], broad), outgoing.inputs[0])
    bpy.ops.object.modifier_apply(modifier=mod.name)
    smooth = obj.modifiers.new('Gentle voxel interpolation smoothing', 'SMOOTH')
    smooth.factor = .7; smooth.iterations = 3
    bpy.ops.object.modifier_apply(modifier=smooth.name)
    return obj


def fused_mass():
    meta = bpy.data.metaballs.new('B fused implicit living mass')
    meta.resolution = .032; meta.render_resolution = .025; meta.threshold = .62
    obj = bpy.data.objects.new('B fused implicit living mass', meta)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj; obj.select_set(True)
    for i in range(17):
        t = i/16; x = -1.25+2.5*t
        el = meta.elements.new(); el.type = 'ELLIPSOID'
        el.co = (x, .14*math.sin(t*7), .16*math.sin(t*5))
        el.radius = .48 + .09*math.sin(t*8+1)
        el.size_x = .72; el.size_y = .9; el.size_z = .56 + .2*math.sin(t*9)**2
    # Small fused surface swellings are part of the same implicit field.
    for i in range(23):
        t = i/22; x = -1.23+2.46*t
        el = meta.elements.new(); el.co = (x, -.12-.06*math.sin(i*1.7), .15+.15*math.sin(t*5))
        el.radius = .16+.055*math.sin(i*2.1)**2
    if args.round == 2:
        for i in range(25):
            t = i/24
            el = meta.elements.new(); el.type = 'ELLIPSOID'
            el.co = (-1.22+2.44*t, -.14, .02+.06*math.sin(t*13))
            el.radius = .39+.07*math.sin(t*11)
            el.size_x = .68; el.size_y = 1.1; el.size_z = .16
    bpy.ops.object.convert(target='MESH'); obj = bpy.context.object
    obj.data.remesh_voxel_size = .022
    bpy.ops.object.voxel_remesh()
    sm = obj.modifiers.new('Soft fused remesh', 'SMOOTH'); sm.factor = .8; sm.iterations = 4
    bpy.ops.object.modifier_apply(modifier=sm.name)
    for v in obj.data.vertices:
        p = v.co.copy()
        # Small folds push the fused skin; no independent pieces or cutouts.
        fold = math.sin(18*p.x + 2*noise.noise_vector(p*3).x)
        depth = (.033 if args.round == 2 else .018) * fold + .012*noise.noise(p*17)
        v.co += v.normal * depth
    attr = obj.data.attributes.new('organization', 'FLOAT', 'POINT')
    for vertex, item in zip(obj.data.vertices, attr.data):
        item.value = .5 + .38*noise.noise(vertex.co*3)
    return obj


def density_sheet():
    obj = empty_mesh('C density governed folded continuum')
    f, incoming, outgoing, mod = group(obj, 'C density to fold thickness and filaments')
    grid = f.node('GeometryNodeMeshGrid')
    grid.inputs['Size X'].default_value = 3.2
    grid.inputs['Size Y'].default_value = 2
    grid.inputs['Vertices X'].default_value = 241
    grid.inputs['Vertices Y'].default_value = 181
    p = f.node('GeometryNodeInputPosition').outputs[0]
    x, v, unused = f.split(p)
    d = f.noise(p, 1.3 if args.round == 2 else 2.1, 3)
    dense = f.math('MULTIPLY', d, d)
    # One continuous open, folded mass. Density controls fold amplitude, fine
    # connected ridges, stored thickness and the shared optical response.
    theta = f.math('ADD', f.math('MULTIPLY', v, 2.1), f.math('MULTIPLY', d, .55))
    radius = f.math('ADD', .25, f.math('MULTIPLY', dense, .22 if args.round == 2 else .38))
    y = f.math('MULTIPLY', f.math('SINE', theta), radius)
    z = f.math('MULTIPLY', f.math('COSINE', theta), radius)
    z = f.math('ADD', z, f.math('MULTIPLY', f.math('SINE', f.math('MULTIPLY', x, 3.2)), .12))
    phase = f.math('ADD', f.math('MULTIPLY', x, 16), f.math('MULTIPLY', v, 4))
    if args.round == 2:
        phase = f.math('ADD', phase, f.math('MULTIPLY', d, 8))
    ridge = f.math('MULTIPLY', f.math('SINE', phase), f.math('MULTIPLY', dense, .065))
    z = f.math('ADD', z, ridge)
    taper = f.math('SUBTRACT', 1, f.math('MULTIPLY', f.math('POWER', f.math('DIVIDE', x, 1.65), 4), .72))
    y = f.math('MULTIPLY', y, taper); z = f.math('MULTIPLY', z, taper)
    setpos = f.node('GeometryNodeSetPosition')
    f.put(grid.outputs['Mesh'], setpos.inputs['Geometry'])
    f.put(f.vec(x, y, z), setpos.inputs['Position'])
    f.put(density_attribute(f, setpos.outputs[0], d), outgoing.inputs[0])
    bpy.ops.object.modifier_apply(modifier=mod.name)
    vg = obj.vertex_groups.new(name='Density thickness')
    for i, value in enumerate(obj.data.attributes['organization'].data):
        vg.add([i], max(.03, value.value**2), 'REPLACE')
    thick = obj.modifiers.new('Thickness follows same density', 'SOLIDIFY')
    thick.thickness = .13 if args.round == 2 else .19
    thick.vertex_group = vg.name; thick.thickness_vertex_group = .12
    thick.offset = 0
    bpy.ops.object.modifier_apply(modifier=thick.name)
    sub = obj.modifiers.new('Soft continuous margins', 'SUBSURF'); sub.levels = 1
    bpy.ops.object.modifier_apply(modifier=sub.name)
    return obj


def shared_material():
    m = bpy.data.materials.new('Shared wet heterogeneous matter'); m.use_nodes = True
    f = Field(m.node_tree); f.n.clear()
    output_node = f.node('ShaderNodeOutputMaterial')
    shader = f.node('ShaderNodeBsdfPrincipled')
    tex = f.node('ShaderNodeTexCoord').outputs['Object']
    broad = f.noise(tex, 3.4, 4)
    attr = f.node('ShaderNodeAttribute'); attr.attribute_name = 'organization'
    d = f.math('ADD', f.math('MULTIPLY', broad, .55), f.math('MULTIPLY', attr.outputs['Fac'], .45))
    if args.round == 2:
        remap = f.node('ShaderNodeMapRange')
        remap.inputs['From Min'].default_value = .3
        remap.inputs['From Max'].default_value = .7
        f.put(d, remap.inputs['Value']); d = remap.outputs[0]
    color = f.node('ShaderNodeValToRGB')
    color.color_ramp.elements[0].position = .22
    color.color_ramp.elements[0].color = (.33, .47, .40, 1)
    color.color_ramp.elements[1].position = .76
    color.color_ramp.elements[1].color = (.40, .19, .065, 1)
    if args.round == 2:
        color.color_ramp.elements[0].color = (.48, .57, .43, 1)
        color.color_ramp.elements[1].color = (.38, .21, .082, 1)
    f.put(d, color.inputs[0]); f.put(color.outputs[0], shader.inputs['Base Color'])
    shader.inputs['IOR'].default_value = 1.36
    shader.inputs['Subsurface Weight'].default_value = .22 if args.round == 2 else .34
    shader.inputs['Subsurface Scale'].default_value = .0018 if args.round == 2 else .003
    shader.inputs['Subsurface Radius'].default_value = (1, .55, .24)
    f.put(f.math('ADD', .14 if args.round == 2 else .19, f.math('MULTIPLY', d, .3)), shader.inputs['Roughness'])
    f.put(f.math('SUBTRACT', .90 if args.round == 2 else .83, f.math('MULTIPLY', d, .53)), shader.inputs['Transmission Weight'])
    shader.inputs['Coat Weight'].default_value = .12
    shader.inputs['Coat Roughness'].default_value = .22
    micro = f.noise(tex, 105, 3)
    bump = f.node('ShaderNodeBump'); bump.inputs['Strength'].default_value = .19
    bump.inputs['Distance'].default_value = .000055
    f.put(micro, bump.inputs['Height']); f.put(bump.outputs[0], shader.inputs['Normal'])
    absorption = f.node('ShaderNodeVolumeAbsorption')
    absorption.inputs['Color'].default_value = (.49, .65, .49, 1)
    f.put(f.math('MULTIPLY', broad, 3.5), absorption.inputs['Density'])
    f.put(absorption.outputs[0], output_node.inputs['Volume'])
    f.put(shader.outputs[0], output_node.inputs['Surface'])
    return m


def light(name, position, energy, color, size, target=(0, 0, 0)):
    data = bpy.data.lights.new(name, 'AREA'); data.energy = energy*(.04 if args.round == 2 else 1)
    data.color = color; data.shape = 'DISK'; data.size = size
    obj = bpy.data.objects.new(name, data); bpy.context.collection.objects.link(obj)
    obj.location = Vector(position)*S
    obj.rotation_euler = (Vector(target)*S-obj.location).to_track_quat('-Z', 'Y').to_euler()


def scene(method):
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    obj = {'A': volume_mass, 'B': fused_mass, 'C': density_sheet}[method]()
    # Normalize horizontal span only; retain method-specific thickness and shape.
    coords = [v.co for v in obj.data.vertices]
    lo = Vector(tuple(min(v[i] for v in coords) for i in range(3)))
    hi = Vector(tuple(max(v[i] for v in coords) for i in range(3)))
    center = (lo+hi)*.5
    factor = 3.15/(hi.x-lo.x)
    for v in obj.data.vertices: v.co = (v.co-center)*factor
    for p in obj.data.polygons: p.use_smooth = True
    obj.scale = (S,)*3
    obj.data.materials.clear(); obj.data.materials.append(shared_material())
    # Microscopic geometric displacement, shared across all methods.
    tex = bpy.data.textures.new('Shared small wet irregularity', type='CLOUDS')
    tex.noise_scale = .045; tex.noise_depth = 2
    micro = obj.modifiers.new('Micro displacement', 'DISPLACE')
    micro.texture = tex; micro.strength = .0018; micro.mid_level = .5
    world = bpy.data.worlds.new('Neutral dark lab'); world.use_nodes = True
    world.node_tree.nodes['Background'].inputs[0].default_value = (.016, .016, .016, 1)
    world.node_tree.nodes['Background'].inputs[1].default_value = .16
    sc = bpy.context.scene; sc.world = world
    light('Warm grazing softbox', (-1.2, .6, 1.7), 12, (1, .73, .43), .065)
    light('Cool broad fill', (1, -1.8, 1), 3.4, (.47, .65, 1), .10)
    light('Neutral front bounce', (-1.5, -3, .3), .7, (.85, .89, 1), .12)
    camera = bpy.data.cameras.new('Common lab camera'); cam = bpy.data.objects.new('Common lab camera', camera)
    bpy.context.collection.objects.link(cam); cam.location = Vector((.1, -6.5, 3.2))*S
    cam.rotation_euler = (-cam.location).to_track_quat('-Z', 'Y').to_euler()
    camera.lens = 56; camera.clip_start = .002; camera.clip_end = 20
    camera.dof.use_dof = False; sc.camera = cam
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 16
    sc.cycles.use_denoising = True; sc.cycles.max_bounces = 10
    sc.cycles.transmission_bounces = 8
    sc.render.resolution_x = 1440; sc.render.resolution_y = 960; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGB'
    sc.render.image_settings.color_depth = '16'
    sc.view_settings.view_transform = 'AgX'
    sc.render.film_transparent = False
    stem = f'{method}{args.round}'
    sc.render.filepath = str(output / (stem+'.png'))
    bpy.ops.wm.save_as_mainfile(filepath=str(output / (stem+'.blend')))
    bpy.ops.render.render(write_still=True)


for method in args.methods.split(','):
    scene(method.strip())
