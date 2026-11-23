"""Camera-ray-only sky plates (needs bpy).

The world keeps its flat colour and strength for every ray that is not a primary camera ray, so the lighting cannot change (gate G1
hashes that branch). What the camera sees instead is a procedural sky: a horizon-to-zenith gradient with noise clouds, tinted around
the flat colour so the frame's tone barely moves. Reflections and refractions (not camera rays) still see the flat world.
Dust motes, light-shaft volumes, fog cards and rain are P2 and are not implemented in P0.
"""
import math

from . import materials


def wrap_world(sc, spec, K=1.0):
    """Wrap the world's surface shader in a Mix Shader whose factor is Light Path > Is Camera Ray. Idempotent."""
    w = sc.world
    if w is None or not w.use_nodes:
        return None
    nt = w.node_tree
    out = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeOutputWorld"), None)
    if out is None or not out.inputs["Surface"].links:
        return None
    src = out.inputs["Surface"].links[0].from_node
    if src.bl_idname == "ShaderNodeMixShader" and src.name == "plate-mix":
        return {"already": True}
    src.name = "flat-bg"
    flat_out = out.inputs["Surface"].links[0].from_socket
    b = materials.B(nt)
    lp = b.n("ShaderNodeLightPath")
    mixs = b.n("ShaderNodeMixShader")
    mixs.name = "plate-mix"
    bg = b.n("ShaderNodeBackground")
    bg.name = "plate-bg"
    flat = tuple(src.inputs["Color"].default_value)
    flat_strength = src.inputs["Strength"].default_value
    tc = b.n("ShaderNodeTexCoord")
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(tc.outputs["Generated"], sep.inputs[0])
    zr = spec.get("z_range", [-0.05, 0.55])
    up = b.mapr(sep.outputs["Z"], zr[0], zr[1], 0.0, 1.0)
    h, z = spec.get("horizon_gain", 1.18), spec.get("zenith_gain", 0.86)
    grad = b.mix((flat[0] * h, flat[1] * h, flat[2] * h), (flat[0] * z, flat[1] * z, flat[2] * z), up)
    hp = spec.get("_hdri_path")
    if hp:
        col = _hdri_colour(b, nt, hp, flat, spec, tc)
    else:
        nz = materials.noise(b, tc.outputs["Generated"], spec.get("cloud_scale", 3.2), 4.0, 0.55, 0.3)
        cloud = b.math("ADD", b.math("MULTIPLY", b.math("SUBTRACT", b.mapr(nz, 0.35, 0.75), 0.5), spec.get("cloud_contrast", 0.30)), 1.0)
        col = b.mix(grad, b.gray(cloud), 1.0, "MULTIPLY")
    b.link(col, bg.inputs["Color"])
    bg.inputs["Strength"].default_value = flat_strength
    b.link(lp.outputs["Is Camera Ray"], mixs.inputs[0])
    nt.links.new(flat_out, mixs.inputs[1])
    nt.links.new(bg.outputs["Background"], mixs.inputs[2])
    nt.links.new(mixs.outputs["Shader"], out.inputs["Surface"])
    return {"plate": spec.get("name", "procedural-sky"), "hdri": spec.get("hdri"), "flat_color": [round(c, 4) for c in flat[:3]], "flat_strength": round(flat_strength, 4)}


def _hdri_colour(b, nt, path, flat, spec, tc):
    """An equirectangular sky image, divided by its own mean colour and multiplied by the flat world colour: the cloud and gradient
    structure comes from the picture, the mean tone stays the build file's (so the frame's exposure barely moves). `mix` blends it
    with the plain flat colour; `rotation_deg` turns the sky."""
    import bpy
    import numpy as np
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = "Linear Rec.709" if "Linear Rec.709" in [e.identifier for e in im.colorspace_settings.bl_rna.properties["name"].enum_items] else "Non-Color"
    px = np.empty(len(im.pixels), dtype=np.float32)
    im.pixels.foreach_get(px)
    mean = np.maximum(px.reshape(-1, 4)[:, :3].mean(0), 1e-4)
    env = b.n("ShaderNodeTexEnvironment")
    env.image = im
    mp = b.n("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(spec.get("rotation_deg", 0.0)))
    # the Generated coordinate of a world is the view direction in 0..1: remap to -1..1 for the environment lookup
    nm = b.n("ShaderNodeVectorMath", operation="SCALE")
    nm.inputs["Scale"].default_value = 2.0
    sub = b.n("ShaderNodeVectorMath", operation="SUBTRACT")
    sub.inputs[1].default_value = (1.0, 1.0, 1.0)
    b.link(tc.outputs["Generated"], nm.inputs[0])
    b.link(nm.outputs[0], sub.inputs[0])
    b.link(sub.outputs[0], mp.inputs["Vector"])
    b.link(mp.outputs[0], env.inputs["Vector"])
    gain = tuple(float(flat[i]) / float(mean[i]) for i in range(3))
    k = spec.get("strength_gain", 1.0)
    tinted = b.mix(env.outputs["Color"], gain, 1.0, "MULTIPLY")
    return b.mix(tuple(flat[:3]), b.mix(tinted, (k, k, k), 1.0, "MULTIPLY"), spec.get("mix", 0.85))
