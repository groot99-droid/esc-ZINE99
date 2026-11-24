"""Object-ID pass: a cheap second render in which every object group is one flat colour, read back as an 8-bit id mask.

Cycles' own object-index pass needs the compositor or a multilayer file; a flat-emission render needs neither and is the same on
every Blender build. Groups: `piece:<id>` (blockout pieces), `prop:<id>` (a prop and every mesh under a model's root empty),
`dress:<layer>/<group>` (everything the dressing adds; objects carry the custom property `dress_group`), `other:<name>`.
Stain decals are not in the mask. The id of a group is its 1-based index in the sorted list of group keys (0 is the background), written as R = id mod 256,
G = id div 256, B = 0. The legend goes in the per-scene json. Glass, haze and other translucent pieces show up opaque here.
"""
import math

import bpy


def srgb_to_linear(v):
    v = v / 255.0
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


def group_key(ob):
    """The id-group key of an object, or None for things that never render (empties, lights, cameras)."""
    cur = ob
    while cur is not None:
        g = cur.get("dress_group")
        if g:
            return "dress:" + g
        if cur.name.startswith("bo-"):
            return "piece:" + cur.name[3:]
        if cur.get("proxy_of") is not None:
            return "prop:" + cur.name
        cur = cur.parent
    # a model's meshes hang under "<prop id>-fit" under "<prop id>"
    root = ob
    while root.parent is not None:
        root = root.parent
    if root is not ob or root.type == "EMPTY":
        return "prop:" + root.name.replace("-rejected", "")
    return "other:" + ob.name


def legend(objs):
    keys = sorted({group_key(o) for o in objs if o.type == "MESH" and not o.hide_render} - {None})
    return {k: i + 1 for i, k in enumerate(keys)}


def _id_material(i):
    r, g = i % 256, i // 256
    m = bpy.data.materials.new("id-%d" % i)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em.inputs["Color"].default_value = (srgb_to_linear(r), srgb_to_linear(g), 0.0, 1.0)
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return m


def render_ids(sc, path, leg):
    """Render the id mask of the current camera to `path` (png, 8 bit), then restore every setting and material it touched."""
    meshes = [o for o in bpy.data.objects if o.type == "MESH" and not o.hide_render]
    # stain decals are soft translucent blobs on quads: as flat id squares they would cover props that touch the wall, so they are left
    # out of the mask for the render (the surface under them keeps its own id)
    hidden = [o for o in meshes if (group_key(o) or "").startswith(("dress:decals/", "dress:atmos/"))]  # decals and the haze volume (R1)
    for o in hidden:
        o.hide_render = True
    meshes = [o for o in meshes if o not in hidden]
    mats = {i: _id_material(i) for i in set(leg.values())}
    saved_slots = []
    for o in meshes:
        gid = leg.get(group_key(o))
        for s in o.material_slots:
            saved_slots.append((s, s.link, s.material if s.link == "OBJECT" else None))
            s.link = "OBJECT"
            s.material = mats[gid] if gid else None
    w0 = sc.world
    wid = bpy.data.worlds.new("idworld")
    wid.use_nodes = True
    wid.node_tree.nodes["Background"].inputs["Color"].default_value = (0, 0, 0, 1)
    wid.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.0
    sc.world = wid
    r, cy, vs, im = sc.render, sc.cycles, sc.view_settings, sc.render.image_settings
    keep = dict(samples=cy.samples, adaptive=cy.use_adaptive_sampling, denoise=cy.use_denoising, fw=cy.filter_width,
                vt=vs.view_transform, look=vs.look, ev=vs.exposure, gamma=vs.gamma, curve=vs.use_curve_mapping,
                path=r.filepath, dither=r.dither_intensity, cm=im.color_mode, ff=im.file_format, depth=im.color_depth,
                dev=sc.display_settings.display_device)
    cy.samples, cy.use_adaptive_sampling, cy.use_denoising, cy.filter_width = 1, False, False, 0.01
    vs.view_transform, vs.look, vs.exposure, vs.gamma, vs.use_curve_mapping = "Standard", "None", 0.0, 1.0, False
    sc.display_settings.display_device = "sRGB"
    r.dither_intensity = 0.0
    im.file_format, im.color_mode, im.color_depth = "PNG", "RGB", "8"
    r.filepath = path
    try:
        bpy.ops.render.render(write_still=True)
    finally:
        cy.samples, cy.use_adaptive_sampling, cy.use_denoising, cy.filter_width = keep["samples"], keep["adaptive"], keep["denoise"], keep["fw"]
        vs.view_transform, vs.look, vs.exposure, vs.gamma, vs.use_curve_mapping = keep["vt"], keep["look"], keep["ev"], keep["gamma"], keep["curve"]
        sc.display_settings.display_device = keep["dev"]
        r.dither_intensity, im.color_mode, im.file_format, im.color_depth, r.filepath = keep["dither"], keep["cm"], keep["ff"], keep["depth"], keep["path"]
        sc.world = w0
        for s, link, mat in saved_slots:
            s.material = None
            s.link = link
        bpy.data.worlds.remove(wid)
        for o in hidden:
            o.hide_render = False
        for m in mats.values():
            bpy.data.materials.remove(m)
