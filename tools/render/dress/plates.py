"""R2 window plates (needs bpy): what a camera sees through a window or an open door of an interior.

A thin panel stands `offset_m` outside every opening of the walls (an opening: a `-head` wall piece, with a `-sill` piece under it for
a window and none for a door). It is seen by camera rays only (no shadow, bounce, reflection or volume), so the room's light is the
build file's. Its picture is procedural and tone-locked to the scene's own flat world colour: a sky gradient around that colour, a
ragged tree line and a ground band a little darker, so a night scene stays a night scene. The overview hides the plates (see
dress.after_overview). They are grouped under atmos/ like the sky plate: a stand-in for the world, left out of the id pass,
the ray grid and the dress counts.
"""
import bpy
from mathutils import Vector

from . import materials


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return [min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)]


def _world_flat(sc):
    w = sc.world
    if w is None or not w.use_nodes:
        return (0.05, 0.05, 0.06), 1.0
    bg = next((n for n in w.node_tree.nodes if n.bl_idname == "ShaderNodeBackground"), None)
    if bg is None:
        return (0.05, 0.05, 0.06), 1.0
    return tuple(bg.inputs["Color"].default_value)[:3], bg.inputs["Strength"].default_value


def _plate_material(name, flat, strength, axis, spec):
    """Emission picture over the panel's Generated coordinates: u along the panel (axis 'X' or 'Y'), v up."""
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    b = materials.B(nt)
    out = b.n("ShaderNodeOutputMaterial")
    em = b.n("ShaderNodeEmission")
    tc = b.n("ShaderNodeTexCoord")
    sep = b.n("ShaderNodeSeparateXYZ")
    b.link(tc.outputs["Generated"], sep.inputs[0])
    u, v = sep.outputs[axis], sep.outputs["Z"]
    hz = spec.get("horizon", 0.42)
    # spruce silhouettes in two rows (far: thinner, lighter; near: taller, darker): each cell along u holds one tree whose half
    # width shrinks linearly to its own random top, with a ragged branch edge
    def row(n, base, rng_, k, seed):
        cu = b.math("MULTIPLY", u, n)
        cell = b.math("FLOOR", b.math("ADD", cu, seed))
        wn = b.n("ShaderNodeTexWhiteNoise", noise_dimensions="1D")
        b.link(cell, wn.inputs["W"])
        top_ = b.math("ADD", base, b.math("MULTIPLY", wn.outputs["Value"], rng_))
        loc = b.math("ABSOLUTE", b.math("SUBTRACT", b.math("FRACT", b.math("ADD", cu, seed)), 0.5))
        rag = b.n("ShaderNodeTexNoise", noise_dimensions="2D")
        rag.inputs["Scale"].default_value = 60.0
        b.link(tc.outputs["Generated"], rag.inputs["Vector"])
        d = b.math("SUBTRACT", top_, v)
        half = b.math("MULTIPLY", b.math("MULTIPLY", d, k), b.mapr(rag.outputs["Fac"], 0.3, 0.7, 0.6, 1.25))
        if spec.get("tiers"):  # R3: whorls of branches (the outline bulges and pulls in down the tree), not a straight spike
            tn = b.math("MULTIPLY", d, spec["tiers"] * (0.8 + 0.4 * ((seed * 7.3) % 1.0)))
            whorl = b.mapr(b.math("FRACT", b.math("ADD", tn, wn.outputs["Value"])), 0.0, 1.0, 0.55, 1.2)
            half = b.math("MULTIPLY", half, whorl)
            half = b.math("MAXIMUM", half, b.math("MULTIPLY", b.mapr(d, 0.0, 0.03, 0.0, 1.0), 0.004))
        bl = spec.get("blur", 0.02)  # R3: soft, out-of-focus edges (the lens focuses inside the room)
        return b.math("SUBTRACT", 1.0, b.mapr(b.math("SUBTRACT", loc, half), -bl, bl))
    far = row(spec.get("far_n", 17.0), hz + 0.02, spec.get("far_range", 0.2), spec.get("far_k", 1.6), 0.37)
    near = row(spec.get("near_n", 8.0), hz + 0.06, spec.get("near_range", 0.34), spec.get("near_k", 1.1), 0.81)
    tree = b.math("MAXIMUM", far, near)
    ground = b.mapr(v, hz - 0.02, hz - 0.08)  # 1 below the horizon
    sky = b.mix((flat[0] * spec.get("horizon_gain", 1.2), flat[1] * spec.get("horizon_gain", 1.2), flat[2] * spec.get("horizon_gain", 1.2)),
                (flat[0] * spec.get("zenith_gain", 0.95), flat[1] * spec.get("zenith_gain", 0.95), flat[2] * spec.get("zenith_gain", 0.95)),
                b.mapr(v, hz, 1.0))
    tg = spec.get("tree_gain", 0.72)
    tcol = (flat[0] * tg * 0.92, flat[1] * tg * 1.04, flat[2] * tg * 0.96)
    # foliage clumps and trunk gaps inside the tree band, so it is not one flat colour
    fol = materials.around_one(b, materials.noise(b, tc.outputs["Generated"], spec.get("clump", 22.0), 4.0, 0.65), spec.get("foliage", 0.3))
    tcol = b.mix(tcol, b.gray(fol), 1.0, "MULTIPLY")
    fg = spec.get("far_gain", 0.82)
    col = b.mix(sky, (flat[0] * fg * 0.95, flat[1] * fg * 1.02, flat[2] * fg), far)
    col = b.mix(col, tcol, near)
    gg = spec.get("ground_gain", 0.66)
    col = b.mix(col, (flat[0] * gg, flat[1] * gg, flat[2] * gg), ground)
    fine = materials.around_one(b, materials.noise(b, tc.outputs["Generated"], 40.0, 3.0, 0.6), spec.get("grain", 0.05))
    col = b.mix(col, b.gray(fine), 1.0, "MULTIPLY")
    b.link(col, em.inputs["Color"])
    em.inputs["Strength"].default_value = strength
    b.link(em.outputs["Emission"], out.inputs["Surface"])
    return mat


def window_plates(ctx, spec, col, box):
    K = ctx["K"]
    flat, strength = _world_flat(ctx["sc"])
    walls = [o for o in ctx["pieces"] if o.get("role") == "wall" and not o.hide_render]
    floors = [_bbox(o) for o in ctx["pieces"] if o.get("role") == "floor" and not o.hide_render]
    if not walls or not floors:
        return []
    cx = sum((b[0] + b[3]) / 2 for b in floors) / len(floors)
    cy = sum((b[1] + b[4]) / 2 for b in floors) / len(floors)
    fz = max(b[5] for b in floors)
    off, pad, th = spec.get("offset_m", 0.6) * K, spec.get("pad_m", 0.35) * K, 0.02 * K
    sills = [_bbox(o) for o in walls if "-sill" in o.name]
    wb = [_bbox(o) for o in walls]
    ext = (min(b[0] for b in wb), min(b[1] for b in wb), max(b[3] for b in wb), max(b[4] for b in wb))
    edge = spec.get("exterior_tol_m", 0.3) * K
    out = []
    for ob in sorted(walls, key=lambda o: o.name):
        if "-head" not in ob.name:
            continue
        hb = _bbox(ob)
        along_x = (hb[3] - hb[0]) >= (hb[4] - hb[1])
        # exterior walls only: an opening in an inner partition (a hall door) looks into another room, not outside
        if along_x and not (hb[1] - ext[1] < edge or ext[3] - hb[4] < edge):
            continue
        if not along_x and not (hb[0] - ext[0] < edge or ext[2] - hb[3] < edge):
            continue
        sill = None
        for sb in sills:
            if along_x and abs((sb[0] + sb[3]) / 2 - (hb[0] + hb[3]) / 2) < 0.05 * K and abs(sb[1] - hb[1]) < 0.05 * K:
                sill = sb
            if not along_x and abs((sb[1] + sb[4]) / 2 - (hb[1] + hb[4]) / 2) < 0.05 * K and abs(sb[0] - hb[0]) < 0.05 * K:
                sill = sb
        z0 = (sill[5] if sill else fz) - pad
        z1 = hb[2] + pad + spec.get("above_m", 0.6) * K
        if along_x:
            outside = -1 if cy > (hb[1] + hb[4]) / 2 else 1
            y = (hb[1] if outside < 0 else hb[4]) + outside * off
            lo, hi = (hb[0] - pad - off, y - th / 2, z0), (hb[3] + pad + off, y + th / 2, z1)
        else:
            outside = -1 if cx > (hb[0] + hb[3]) / 2 else 1
            x = (hb[0] if outside < 0 else hb[3]) + outside * off
            lo, hi = (x - th / 2, hb[1] - pad - off, z0), (x + th / 2, hb[4] + pad + off, z1)
        # the picture's horizon sits at eye height: Generated v of 1.6 m above the floor
        hzv = max(0.15, min(0.7, (fz + 1.6 * K - z0) / max(z1 - z0, 1e-6)))
        mat = _plate_material("dress-plate-%s-%.2f" % ("X" if along_x else "Y", hzv), flat, strength, "X" if along_x else "Y", dict(spec, horizon=hzv))
        o = box(col, "dress-plate-%s" % ob.name[3:], lo, hi, mat, "atmos/" + spec.get("name", "window_plate"))
        for k in ("visible_shadow", "visible_diffuse", "visible_glossy", "visible_transmission", "visible_volume_scatter"):
            setattr(o, k, False)
        out.append(o)
    return out
