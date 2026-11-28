"""Procedural prop kits (needs bpy): baseboards, ceiling joists, ceiling grid, conduit runs. Bodies only: no kit emits light.

Every kit object within 0.5 m of a light casts no shadow (so no kit can darken a hero prop through a light the build file placed
there). Kits are boxes and cylinders built from the blockout pieces' own extents, never from positions typed in a config.
"""
import math

import bpy
from mathutils import Vector

from . import materials, seeds


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return [min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)]


def _box(col, name, lo, hi, mat, group):
    bpy.ops.mesh.primitive_cube_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2])
    ob.location = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2)
    ob.data.materials.append(mat)
    ob["dress_group"] = group
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    col.objects.link(ob)
    return ob


def _cyl(col, name, a, b, radius, mat, group):
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=d.length, vertices=16)
    ob = bpy.context.active_object
    ob.name = name
    ob.location = (a + b) / 2
    ob.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    ob.data.materials.append(mat)
    ob["dress_group"] = group
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    col.objects.link(ob)
    return ob


def _kit_material(ctx, K, spec, key):
    name = "dress-kit-" + key
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*spec["color"], 1.0)
    bs.inputs["Roughness"].default_value = spec.get("roughness", 0.7)
    bs.inputs["Metallic"].default_value = spec.get("metallic", 0.0)
    materials.dress_material(mat, dict(spec.get("surface", {"family": "noise", "tile_m": 0.5}), grime=spec.get("grime", 0.6)), ctx, K, name)
    return mat


def _room(ctx):
    """Centre of the room (the mean of the floor pieces' centres) and its floor height."""
    fl = [_bbox(o) for o in ctx["pieces"] if o.get("role") == "floor" and not o.hide_render]
    if not fl:
        return None
    cx = sum((b[0] + b[3]) / 2 for b in fl) / len(fl)
    cy = sum((b[1] + b[4]) / 2 for b in fl) / len(fl)
    return cx, cy, max(b[5] for b in fl)


def baseboard(ctx, spec, col):
    K = ctx["K"]
    room = _room(ctx)
    if room is None:
        return []
    h, t = spec.get("height_m", 0.12) * K, spec.get("thickness_m", 0.022) * K
    skip = set(spec.get("skip_materials", []))
    mat = _kit_material(ctx, K, spec, spec.get("name", "baseboard"))
    out = []
    for ob in sorted(ctx["pieces"], key=lambda o: o.name):
        if ob.get("role") != "wall" or ob.hide_render:
            continue
        mname = ob.active_material.name[3:] if ob.active_material else ""
        if mname in skip:
            continue
        b = _bbox(ob)
        if b[2] > room[2] + 0.06 * K:  # a head or lintel piece does not reach the floor
            continue
        if b[5] < room[2] + (spec.get("z_m", 0.0) + h / K) * K:  # a sill piece lower than the rail
            continue
        sx, sy = b[3] - b[0], b[4] - b[1]
        if min(sx, sy) > 0.6 * K or max(sx, sy) < 0.2 * K:
            continue
        zlo = room[2] + 0.001 * K + spec.get("z_m", 0.0) * K  # z_m > 0: a rail (crash rail, dado) instead of a skirting board
        if sx >= sy:  # wall along x: the strip goes on the face that looks at the room
            yface = b[1] - t if room[1] < (b[1] + b[4]) / 2 else b[4]
            lo, hi = (b[0], yface, zlo), (b[3], yface + t, zlo + h)
        else:
            if room[0] < (b[0] + b[3]) / 2:
                lo, hi = (b[0] - t, b[1], zlo), (b[0], b[4], zlo + h)
            else:
                lo, hi = (b[3], b[1], zlo), (b[3] + t, b[4], zlo + h)
        out.append(_box(col, "dress-baseboard-%s" % ob.name[3:], lo, hi, mat, "kits/" + spec.get("name", "baseboard")))
    return out


def ceiling_joists(ctx, spec, col):
    K = ctx["K"]
    ceil = [o for o in ctx["pieces"] if o.get("role") == "ceiling" and not o.hide_render]
    if not ceil:
        return []
    c = max(ceil, key=lambda o: o.dimensions.x * o.dimensions.y)
    b = _bbox(c)
    w, hh = spec.get("width_m", 0.12) * K, spec.get("depth_m", 0.16) * K
    step = spec.get("spacing_m", 0.9) * K
    mat = _kit_material(ctx, K, spec, spec.get("name", "joists"))
    out, n = [], int((b[3] - b[0]) / step)
    jit = spec.get("spacing_jitter", 0.0)
    for i in range(1, n + 1):
        x = b[0] + i * (b[3] - b[0]) / (n + 1)
        if jit:  # R1: hand-set beams are not on an exact grid (also keeps the ceiling from reading as a tiling)
            x += (seeds.unit(ctx["game"], ctx["location"], "joist", i) - 0.5) * 2 * jit * (b[3] - b[0]) / (n + 1)
        out.append(_box(col, "dress-joist-%d" % i, (x - w / 2, b[1], b[2] - hh), (x + w / 2, b[4], b[2]), mat, "kits/" + spec.get("name", "joists")))
    return out


def ceiling_grid(ctx, spec, col):
    K = ctx["K"]
    ceil = [o for o in ctx["pieces"] if o.get("role") == "ceiling" and not o.hide_render]
    if not ceil:
        return []
    c = max(ceil, key=lambda o: o.dimensions.x * o.dimensions.y)
    b = _bbox(c)
    pitch, w, hh = spec.get("pitch_m", 0.6) * K, spec.get("width_m", 0.028) * K, spec.get("depth_m", 0.03) * K
    mat = _kit_material(ctx, K, spec, spec.get("name", "ceiling-grid"))
    out = []
    nx, ny = int((b[3] - b[0]) / pitch), int((b[4] - b[1]) / pitch)
    for i in range(1, nx + 1):
        x = b[0] + i * (b[3] - b[0]) / (nx + 1)
        out.append(_box(col, "dress-grid-x%d" % i, (x - w / 2, b[1], b[2] - hh), (x + w / 2, b[4], b[2]), mat, "kits/" + spec.get("name", "ceiling-grid")))
    for j in range(1, ny + 1):
        y = b[1] + j * (b[4] - b[1]) / (ny + 1)
        out.append(_box(col, "dress-grid-y%d" % j, (b[0], y - w / 2, b[2] - hh), (b[3], y + w / 2, b[2]), mat, "kits/" + spec.get("name", "ceiling-grid")))
    return out


def conduit(ctx, spec, col):
    """A pipe along the top of a named wall piece, on its room-facing side, with brackets every metre."""
    K = ctx["K"]
    room = _room(ctx)
    wall = next((o for o in ctx["pieces"] if o.name == "bo-" + spec["wall"]), None)
    if room is None or wall is None:
        return []
    b = _bbox(wall)
    r = spec.get("radius_m", 0.022) * K
    z = b[5] - spec.get("below_top_m", 0.28) * K
    mat = _kit_material(ctx, K, spec, spec.get("name", "conduit"))
    out = []
    if (b[3] - b[0]) >= (b[4] - b[1]):
        y = b[1] - r * 1.6 if room[1] < (b[1] + b[4]) / 2 else b[4] + r * 1.6
        a, e = (b[0] + 0.15 * K, y, z), (b[3] - 0.15 * K, y, z)
        for i in range(int((e[0] - a[0]) / (1.0 * K)) + 1):
            x = a[0] + i * 1.0 * K
            out.append(_box(col, "dress-bracket-%d" % i, (x - 0.012 * K, y - r * 0.9, z - r * 1.6), (x + 0.012 * K, b[1] if y < b[1] else b[4], z + r * 1.6), mat, "kits/" + spec.get("name", "conduit")))
    else:
        x = b[0] - r * 1.6 if room[0] < (b[0] + b[3]) / 2 else b[3] + r * 1.6
        a, e = (x, b[1] + 0.15 * K, z), (x, b[4] - 0.15 * K, z)
        for i in range(int((e[1] - a[1]) / (1.0 * K)) + 1):
            yy = a[1] + i * 1.0 * K
            out.append(_box(col, "dress-bracket-%d" % i, (x - r * 0.9, yy - 0.012 * K, z - r * 1.6), (b[0] if x < b[0] else b[3], yy + 0.012 * K, z + r * 1.6), mat, "kits/" + spec.get("name", "conduit")))
    out.append(_cyl(col, "dress-conduit-run", a, e, r, mat, "kits/" + spec.get("name", "conduit")))
    return out


def attic_cap(ctx, spec, col):
    """R1: one thin dark box over the whole ceiling extent, just above it, seen by camera rays only (no shadow, no bounce, no
    reflection): a stairwell opening or a joint between wall and ceiling shows a dark attic instead of the world colour. Light from
    the world through those gaps is unchanged."""
    K = ctx["K"]
    ceil = [_bbox(o) for o in ctx["pieces"] if o.get("role") == "ceiling" and not o.hide_render]
    walls = [_bbox(o) for o in ctx["pieces"] if o.get("role") == "wall" and not o.hide_render]
    if not ceil:
        return []
    allb = ceil + walls
    lo = (min(b[0] for b in allb) - 0.2 * K, min(b[1] for b in allb) - 0.2 * K, max(b[5] for b in ceil) + spec.get("gap_m", 0.02) * K)
    hi = (max(b[3] for b in allb) + 0.2 * K, max(b[4] for b in allb) + 0.2 * K, lo[2] + spec.get("thickness_m", 0.05) * K)
    mat = bpy.data.materials.get("dress-kit-attic") or bpy.data.materials.new("dress-kit-attic")
    mat.use_nodes = True
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = (*spec.get("color", [0.03, 0.025, 0.02]), 1.0)
    bs.inputs["Roughness"].default_value = 0.9
    ob = _box(col, "dress-attic-cap", lo, hi, mat, "kits/" + spec.get("name", "attic"))
    for k in ("visible_shadow", "visible_diffuse", "visible_glossy", "visible_transmission", "visible_volume_scatter"):
        setattr(ob, k, False)
    return [ob]


def frames(ctx, spec, col):
    """R1: a frame (architrave) around every piece of the named materials (glass panels, doors): four bars of `width_m` on both faces of
    the piece's thin axis, standing `depth_m` proud of it; `bottom` false leaves the sill bar out (a door)."""
    K = ctx["K"]
    w, d = spec.get("width_m", 0.06) * K, spec.get("depth_m", 0.025) * K
    mats = set(spec.get("materials", []))
    pids = set(spec.get("pieces", []))
    mat = _kit_material(ctx, K, spec, spec.get("name", "frames"))
    out = []
    for ob in sorted(ctx["pieces"], key=lambda o: o.name):
        if ob.hide_render or not ob.active_material:
            continue
        mname = ob.active_material.name[3:].split("@")[0]
        if mname not in mats and ob.name[3:] not in pids:
            continue
        b = _bbox(ob)
        size = [b[3] - b[0], b[4] - b[1], b[5] - b[2]]
        ax = 0 if size[0] < size[1] else 1  # the thin horizontal axis (a wall panel or a door leaf)
        ln = 1 - ax
        bottom = spec.get("bottom", True) if ob.name[3:] not in spec.get("no_bottom_pieces", []) else False
        for side in (0, 1):
            lo_t = b[ax] - d if side == 0 else b[ax + 3]
            hi_t = lo_t + d
            bars = [((b[ln] - w, b[5]), (b[ln + 3] + w, b[5] + w)),  # head
                    ((b[ln] - w, b[2] - (w if bottom else 0)), (b[ln], b[5])),  # left jamb
                    ((b[ln + 3], b[2] - (w if bottom else 0)), (b[ln + 3] + w, b[5]))]  # right jamb
            if bottom:
                bars.append(((b[ln] - w, b[2] - w), (b[ln + 3] + w, b[2])))
            for i, ((l0, z0), (l1, z1)) in enumerate(bars):
                lo, hi = [0, 0, z0], [0, 0, z1]
                lo[ax], hi[ax] = lo_t, hi_t
                lo[ln], hi[ln] = l0, l1
                out.append(_box(col, "dress-frame-%s-%d-%d" % (ob.name[3:], side, i), lo, hi, mat, "kits/" + spec.get("name", "frames")))
    return out


def conifer_wrap(ctx, spec, col):
    from . import trees
    return trees.conifer_wrap(ctx, spec, col, _kit_material)


def treeline(ctx, spec, col):
    from . import trees
    return trees.treeline(ctx, spec, col, _kit_material)


def window_plate(ctx, spec, col):
    from . import plates
    return plates.window_plates(ctx, spec, col, _box)


def swell(ctx, spec, col):
    from . import swell as sw
    return sw.swell(ctx, spec, col)


def motes(ctx, spec, col):
    from . import p2fx
    return p2fx.motes(ctx, spec, col)


def precip(ctx, spec, col):
    from . import p2fx
    return p2fx.precip(ctx, spec, col)


def flames(ctx, spec, col):
    from . import p2fx
    return p2fx.flames(ctx, spec, col)


def crowns_round(ctx, spec, col):
    from . import p2fx
    return p2fx.crowns_round(ctx, spec, col)


def fixtures(ctx, spec, col):
    from . import p6kits
    return p6kits.fixtures(ctx, spec, col)


def shelves(ctx, spec, col):
    from . import p6kits
    return p6kits.shelves(ctx, spec, col)


def sills(ctx, spec, col):
    from . import p6kits
    return p6kits.sills(ctx, spec, col)


def door_leaves(ctx, spec, col):
    from . import p6kits
    return p6kits.door_leaves(ctx, spec, col)


KITS = {"sills": sills, "door_leaves": door_leaves, "fixtures": fixtures, "shelves": shelves, "crowns_round": crowns_round, "motes": motes, "precip": precip, "flames": flames, "swell": swell, "window_plate": window_plate, "conifer_wrap": conifer_wrap, "treeline": treeline, "attic_cap": attic_cap, "frames": frames, "baseboard": baseboard, "ceiling_joists": ceiling_joists, "ceiling_grid": ceiling_grid, "conduit": conduit}


def kits_layer(ctx, specs):
    col = ctx["collection"]("DRESS/kits")
    lights = [o for o in bpy.data.objects if o.type == "LIGHT"]
    rec = {"kits": {}, "objects": 0, "no_shadow": 0}
    for spec in specs:
        objs = KITS[spec["kit"]](ctx, spec, col)
        if spec.get("clear_centre", True) and objs:  # R1: a kit never becomes the object under a view's look-at pixel (G10b)
            bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get()
            drop = set()
            for v in ctx["views"].values():
                o_, f_ = Vector(v[0]), (Vector(v[1]) - Vector(v[0])).normalized()
                hit, _, _, _, hob, _ = ctx["sc"].ray_cast(dg, o_, f_)
                if hit and hob is not None and hob.name in {x.name for x in objs}:
                    drop.add(hob.name)
            if drop:
                gone = [x for x in objs if x.name in drop]
                objs = [x for x in objs if x.name not in drop]
                for ob in gone:
                    bpy.data.objects.remove(ob, do_unlink=True)
                rec.setdefault("cleared_for_centre", []).extend(sorted(drop))
        if spec.get("cast_shadow") is False:  # R2: a kit that must not take light off the props (ceiling beams under ceiling lights)
            for ob in objs:
                ob.visible_shadow = False
                if spec.get("camera_only_light"):  # nor does it block bounce light (the room's light is the build file's)
                    ob.visible_diffuse = False
                    ob.visible_glossy = False
        ns = 0
        for ob in objs:  # no shadow within 0.5 m of a light
            b = _bbox(ob)
            for L in lights:
                p = L.matrix_world.translation
                d = Vector((max(b[0] - p.x, 0, p.x - b[3]), max(b[1] - p.y, 0, p.y - b[4]), max(b[2] - p.z, 0, p.z - b[5]))).length
                if d < 0.5 * ctx["K"]:
                    ob.visible_shadow = False
                    ns += 1
                    break
        rec["kits"][spec.get("name", spec["kit"])] = {"objects": len(objs), "no_shadow": ns}
        rec["objects"] += len(objs)
        rec["no_shadow"] += ns
    return rec
