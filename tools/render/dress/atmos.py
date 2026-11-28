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
    if "Color" not in src.inputs or src.inputs["Color"].is_linked:  # P2: a gradient world (an overview's horizon-to-zenith sky) is
        return {"skipped": "gradient world"}                         # the rig's own design: left as it is
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
    if spec.get("legacy_remap"):
        mean = np.maximum(px.reshape(-1, 4)[:, :3].mean(0), 1e-4)
    else:  # P2b calibration: the mean of the band a level camera mostly sees (5 degrees down to 25 up), sun and glare (top 0.5 %) left out
        w_, h_ = im.size
        a = px.reshape(h_, w_, 4)[:, :, :3]
        lat = (np.arange(h_) + 0.5) / h_ * 180.0 - 90.0  # Blender stores rows bottom-up
        band = a[(lat >= -5.0) & (lat <= 25.0)].reshape(-1, 3)
        lum = band @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
        band = band[lum <= np.quantile(lum, 0.995)]
        mean = np.maximum(band.mean(0), 1e-4)
    env = b.n("ShaderNodeTexEnvironment")
    env.image = im
    mp = b.n("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(spec.get("rotation_deg", 0.0)))
    # the Generated coordinate of a world is the view direction in 0..1: remap to -1..1 for the environment lookup
    if spec.get("legacy_remap"):  # P0 to R3: Generated read as 0..1 and remapped to -1..1 (wrong: a world's Generated is already the
        nm = b.n("ShaderNodeVectorMath", operation="SCALE")  # view direction, so a level ray looked at the image's nadir)
        nm.inputs["Scale"].default_value = 2.0
        sub = b.n("ShaderNodeVectorMath", operation="SUBTRACT")
        sub.inputs[1].default_value = (1.0, 1.0, 1.0)
        b.link(tc.outputs["Generated"], nm.inputs[0])
        b.link(nm.outputs[0], sub.inputs[0])
        b.link(sub.outputs[0], mp.inputs["Vector"])
    else:
        b.link(tc.outputs["Generated"], mp.inputs["Vector"])
    b.link(mp.outputs[0], env.inputs["Vector"])
    gain = tuple(float(flat[i]) / float(mean[i]) for i in range(3))
    k = spec.get("strength_gain", 1.0)
    tinted = b.mix(env.outputs["Color"], gain, 1.0, "MULTIPLY")
    return b.mix(tuple(flat[:3]), b.mix(tinted, (k, k, k), 1.0, "MULTIPLY"), spec.get("mix", 0.85))


# ---------------------------------------------------------------- R1: interior backdrop and haze volume
def backdrop(sc, spec):
    """Interior backdrop: a camera ray that leaves an interior through a gap (a stairwell opening, a joint between a wall and the
    ceiling) sees a dark attic tone instead of the flat world colour. Non-camera rays keep the flat world (lighting unchanged; G1)."""
    w = sc.world
    if w is None or not w.use_nodes:
        return None
    nt = w.node_tree
    out = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeOutputWorld"), None)
    if out is None or not out.inputs["Surface"].links:
        return None
    src = out.inputs["Surface"].links[0].from_node
    if src.bl_idname == "ShaderNodeMixShader" and src.name in ("plate-mix", "backdrop-mix"):
        return {"already": True}
    src.name = "flat-bg" if src.bl_idname == "ShaderNodeBackground" else src.name
    flat_out = out.inputs["Surface"].links[0].from_socket
    b = materials.B(nt)
    lp = b.n("ShaderNodeLightPath")
    mixs = b.n("ShaderNodeMixShader")
    mixs.name = "backdrop-mix"
    bg = b.n("ShaderNodeBackground")
    bg.name = "plate-backdrop"
    bg.inputs["Color"].default_value = (*spec.get("color", [0.02, 0.016, 0.012]), 1.0)
    bg.inputs["Strength"].default_value = 1.0
    fac = lp.outputs["Is Camera Ray"]
    if spec.get("min_up") is not None:  # only rays that look up (a stairwell, a ceiling joint), not level ones through a window
        tc = b.n("ShaderNodeTexCoord")
        sep = b.n("ShaderNodeSeparateXYZ")
        b.link(tc.outputs["Generated"], sep.inputs[0])
        dz = b.math("SUBTRACT", b.math("MULTIPLY", sep.outputs["Z"], 2.0), 1.0)
        fac = b.math("MULTIPLY", fac, b.mapr(dz, spec["min_up"], spec["min_up"] + 0.12))
    b.link(fac, mixs.inputs[0])
    nt.links.new(flat_out, mixs.inputs[1])
    nt.links.new(bg.outputs["Background"], mixs.inputs[2])
    nt.links.new(mixs.outputs["Shader"], out.inputs["Surface"])
    return {"min_up": spec.get("min_up"), "backdrop": [round(c, 4) for c in spec.get("color", [0.02, 0.016, 0.012])]}


def haze_box(bpy, ctx, spec):
    """A low-density scattering volume filling the location's blockout extent (pieces, not the sky): distant parts fall off and
    light sources get a soft halo. It is a mesh in DRESS/atmos (`dress_group` atmos/haze); the id pass and the per-still ray grid
    leave it out (it would cover the whole frame). Density in 1/m at scene scale 1; it is divided by K for millimetre scenes."""
    K = ctx["K"]
    pcs = [o for o in ctx["pieces"] if not o.hide_render and o.get("role") != "sky"]
    if not pcs:
        return None
    from mathutils import Vector
    pts = [o.matrix_world @ Vector(c) for o in pcs for c in o.bound_box]
    lo = [min(p[i] for p in pts) for i in range(3)]
    hi = [max(p[i] for p in pts) for i in range(3)]
    pad = spec.get("inset_m", 0.05) * K
    lo = [lo[0] + pad, lo[1] + pad, lo[2] + pad]
    hi = [hi[0] - pad, hi[1] - pad, hi[2] - pad]
    if spec.get("top_m") is not None:  # R2: a ground fog layer, from the floor up to top_m
        lo[2] = ctx["floor_z"] * K - 0.2 * K
        hi[2] = ctx["floor_z"] * K + spec["top_m"] * K
    name = spec.get("_name", "haze")
    me = bpy.data.meshes.new("dress-" + name)
    v = [(x, y, z) for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])]
    f = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    me.from_pydata(v, [], f)
    me.update()
    mat = bpy.data.materials.new("dress-" + name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    outn = nt.nodes.new("ShaderNodeOutputMaterial")
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value = (*spec.get("color", [0.8, 0.82, 0.9]), 1.0)
    vol.inputs["Density"].default_value = spec.get("density", 0.012) / K
    vol.inputs["Anisotropy"].default_value = spec.get("anisotropy", 0.3)
    if spec.get("top_m") is not None:  # density falls off with height (thick at the ground, gone at the top)
        tc = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Generated"], sep.inputs[0])
        fall = nt.nodes.new("ShaderNodeMapRange")
        fall.inputs[1].default_value, fall.inputs[2].default_value = 0.0, 1.0
        fall.inputs[3].default_value, fall.inputs[4].default_value = 1.0, 0.0
        nt.links.new(sep.outputs["Z"], fall.inputs[0])
        pw = nt.nodes.new("ShaderNodeMath")
        pw.operation = "POWER"
        nt.links.new(fall.outputs[0], pw.inputs[0])
        pw.inputs[1].default_value = spec.get("falloff", 1.6)
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 1.0 / (spec.get("wisp_m", 6.0) * K)
        nt.links.new(nt.nodes.new("ShaderNodeNewGeometry").outputs["Position"], nz.inputs["Vector"])
        wm = nt.nodes.new("ShaderNodeMapRange")
        wm.inputs[1].default_value, wm.inputs[2].default_value = 0.3, 0.7
        wm.inputs[3].default_value, wm.inputs[4].default_value = 1.0 - spec.get("wisp", 0.6), 1.0 + spec.get("wisp", 0.6)
        nt.links.new(nz.outputs["Fac"], wm.inputs[0])
        m1 = nt.nodes.new("ShaderNodeMath")
        m1.operation = "MULTIPLY"
        nt.links.new(pw.outputs[0], m1.inputs[0])
        nt.links.new(wm.outputs[0], m1.inputs[1])
        m2 = nt.nodes.new("ShaderNodeMath")
        m2.operation = "MULTIPLY"
        nt.links.new(m1.outputs[0], m2.inputs[0])
        m2.inputs[1].default_value = spec.get("density", 0.012) / K
        nt.links.new(m2.outputs[0], vol.inputs["Density"])
    nt.links.new(vol.outputs["Volume"], outn.inputs["Volume"])
    me.materials.append(mat)
    ob = bpy.data.objects.new("dress-" + name, me)
    ob["dress_group"] = "atmos/" + name
    ctx["collection"]("DRESS/atmos").objects.link(ob)
    return {"name": name, "top_m": spec.get("top_m"), "density_per_m": spec.get("density", 0.012), "anisotropy": spec.get("anisotropy", 0.3), "color": spec.get("color", [0.8, 0.82, 0.9]),
            "size_m": [round((hi[i] - lo[i]) / K, 2) for i in range(3)]}
