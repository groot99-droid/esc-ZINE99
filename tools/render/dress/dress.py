"""The dressing layer's entry point, called once per scene by render_scenes.py (needs bpy).

    dctx = apply(bpy=..., sc=..., game=..., location=..., scene=..., K=..., rig=..., views=..., made=..., pieces=...,
                 dress_dir=..., layers=..., ov=..., pack=...)

It only adds objects in collections named `DRESS/<layer>` and re-builds the shaders of the blockout materials named in the
location's config (`<game>.dress.json`), found by material name or piece id, never by position. Scenes keep their own lights, world
(non-camera branch), camera and lens; gate G1 proves it. See README.md for the config format and the layer list.
"""
import json
import math
import os

from mathutils import Vector

from . import VERSION, atmos, grime, idpass, kits, materials, propmodels, rules as rules_mod, scatter, seeds

LAYERS = ["surfaces", "scatter", "decals", "kits", "atmos", "props"]


def _load_cfg(dress_dir, game):
    p = os.path.join(dress_dir, game + ".dress.json")
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def _scene_overrides(dress_dir, game, location, scene):
    p = os.path.join(dress_dir, "overrides.json")
    if not os.path.exists(p):
        return {}
    with open(p, encoding="utf-8") as f:
        o = json.load(f)
    out = dict(o.get("%s/%s" % (game, location), {}))
    out.update(o.get("%s/%s/%s" % (game, location, scene), {}))
    return out


def _bbox(ob):
    pts = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    return [min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)]


def apply(bpy, sc, game, location, scene, K, rig, views, made, pieces, dress_dir, layers=None, ov=None, pack=None):
    rules = rules_mod.load(dress_dir)
    cfg = _load_cfg(dress_dir, game)
    loc_cfg = (cfg or {}).get("locations", {}).get(location)
    sov = _scene_overrides(dress_dir, game, location, scene)
    req = layers.split(",") if layers else None
    allowed = rules_mod.allowed_layers(rules, game, location, req)
    allowed = [x for x in allowed if x not in sov.get("layers_off", [])]
    rec = {"enabled": bool(loc_cfg), "version": VERSION, "blender": bpy.app.version_string, "game": game, "location": location, "scene": scene,
           "layers_allowed": allowed, "layers": {}, "materials": {}, "textures": {}, "grime_used": False}
    ctx = {"bpy": bpy, "sc": sc, "game": game, "location": location, "scene": scene, "K": K, "rig": rig, "views": views, "made": made,
           "pieces": pieces, "dress_dir": dress_dir, "record": rec, "grime": {}, "floor_z": 0.0}
    dctx = {"record": rec, "ctx": ctx, "atmos_spec": None, "ev_delta": 0.0}
    if not loc_cfg:
        return dctx
    # exposure re-match (plan G2): per scene, at most 0.5 EV, recorded here and never written into rig.json
    evd = loc_cfg.get("exposure_ev_delta", {})
    ev_delta = max(-0.5, min(0.5, float(evd.get(scene, evd.get("*", 0.0)))))
    dctx["ev_delta"] = ev_delta
    rec["exposure_ev_delta"] = ev_delta
    cols = {}

    def collection(name):
        if name not in cols:
            c = bpy.data.collections.new(name)
            bpy.context.scene.collection.children.link(c)
            cols[name] = c
        return cols[name]

    ctx["collection"] = collection
    floors = [_bbox(o) for o in pieces if o.get("role") == "floor" and not o.hide_render]
    ctx["floor_z"] = (max(b[5] for b in floors) / K) if floors else 0.0
    ctx["grime"] = loc_cfg.get("grime", {})
    ctx["player_start"] = None
    ps = bpy.data.objects.get("player-start")
    if ps is not None:
        ctx["player_start"] = tuple(ps.location)
    bpy.context.view_layer.update()
    seed_salt = sov.get("seed_salt", "")

    # ---- surfaces
    if "surfaces" in allowed:
        mcfg, pcfg = loc_cfg.get("materials", {}), loc_cfg.get("pieces", {})
        if "atmos" in allowed and loc_cfg.get("p2_materials"):  # P2b: water shaders on the water pieces, only with the P2 layers on
            mcfg = dict(mcfg, **loc_cfg["p2_materials"])
        if "scatter" in allowed and loc_cfg.get("p3_materials"):  # P3: vegetation blocks, grass and bark, only with the scatter layer on
            mcfg = dict(mcfg, **loc_cfg["p3_materials"])
        if os.environ.get("DRESS_P4") == "1" and loc_cfg.get("p4_materials"):  # P4: rock, snow, frost and ice (the P4 look runs set it)
            mcfg = dict(mcfg, **loc_cfg["p4_materials"])
        if os.environ.get("DRESS_P5") == "1" and loc_cfg.get("p5_materials"):  # P5: per-game specials and near-rock relief (wins over P4)
            mcfg = dict(mcfg, **loc_cfg["p5_materials"])
        used = {}
        for ob in sorted(pieces, key=lambda o: o.name):
            if ob.hide_render or not ob.material_slots or ob.material_slots[0].material is None:
                continue
            m = ob.material_slots[0].material
            if not m.name.startswith("bo-"):
                continue
            pid = ob.name[3:]
            mname = m.name[3:]
            p = None
            if pid in pcfg:
                base_p = mcfg.get(mname, {})
                p = dict(base_p) if pcfg[pid].get("family") in (None, base_p.get("family")) else {}  # a different family drops the scan of the material
                p.update(pcfg[pid])
                if not p.get("family"):
                    p = None
                else:
                    mm = m.copy()
                    mm.name = "bo-%s@%s" % (mname, pid)
                    ob.material_slots[0].material = mm
                    materials.dress_material(mm, p, ctx, K, "%s@%s" % (mname, pid))
                    used[mm.name] = p["family"]
                    continue
            if mname in used or m.name in used:
                continue
            p = mcfg.get(mname)
            if p is None and mname in rules["keep_materials"]:
                p = {"family": "dirt-only"}
            if p is None or p.get("family") in (None, "keep"):
                continue
            materials.dress_material(m, p, ctx, K, mname)
            used[m.name] = p["family"]
        # R1: pieces whose material displaces get a simple (box-keeping) subdivision so the displacement has vertices to move
        sub = {}
        for ob in sorted(pieces, key=lambda o: o.name):
            if ob.hide_render or not ob.material_slots or ob.material_slots[0].material is None:
                continue
            mr = rec["materials"].get(ob.material_slots[0].material.name[3:])
            if mr and mr.get("displace_m"):
                # R2: one welded, smooth-shaded copy of the box (split or flat-shaded corners open into slabs under displacement), and
                # the box size for the displacement's edge fade (materials.edge_mask)
                import bmesh
                ob.data = ob.data.copy()
                bm = bmesh.new()
                bm.from_mesh(ob.data)
                bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4 * K)
                bm.to_mesh(ob.data)
                bm.free()
                for pl in ob.data.polygons:
                    pl.use_smooth = True
                lo = [min(c[i] for c in ob.bound_box) for i in range(3)]
                hi = [max(c[i] for c in ob.bound_box) for i in range(3)]
                ob["dress_dims"] = [abs((hi[i] - lo[i]) * ob.scale[i]) for i in range(3)]
                md = ob.modifiers.new("dress-subdiv", "SUBSURF")
                md.subdivision_type = "SIMPLE"
                md.levels = md.render_levels = mr.get("subdiv", 6)
                sub[ob.name[3:]] = md.render_levels
        if sub:
            rec["subdivided"] = sub
        rec["layers"]["surfaces"] = {"materials": sorted(used.items())}
        rec["dressed_pieces"] = sorted(o.name[3:] for o in pieces if o.material_slots and o.material_slots[0].material is not None
                                       and o.material_slots[0].material.name in used)
    rec["piece_materials"] = {}
    rec["piece_geom"] = {}
    for o in sorted(pieces, key=lambda o: o.name):
        if o.hide_render or not o.material_slots or o.material_slots[0].material is None:
            continue
        mn = o.material_slots[0].material.name[3:]
        rec["piece_materials"][o.name[3:]] = mn
        b = _bbox(o)
        rec["piece_geom"][o.name[3:]] = {"center": [round((b[i] + b[i + 3]) / 2, 4) for i in range(3)], "size": [round(b[i + 3] - b[i], 4) for i in range(3)]}

    # ---- scatter, decals, kits
    if "scatter" in allowed and loc_cfg.get("scatter"):
        specs = [dict(s, name=s.get("name", s["kind"])) for s in loc_cfg["scatter"]]
        for s in specs:
            s["name"] = s["name"] + seed_salt
        rec["layers"]["scatter"] = scatter.scatter_layer(ctx, specs)
    if "decals" in allowed and loc_cfg.get("decals"):
        rec["layers"]["decals"] = grime.decals_layer(ctx, loc_cfg["decals"])
    if "kits" in allowed and loc_cfg.get("kits"):
        rec["layers"]["kits"] = kits.kits_layer(ctx, loc_cfg["kits"])
    if "props" in allowed and loc_cfg.get("props"):  # new-models pass: whole models replacing blockout boxes (propmodels.py)
        rec["layers"]["props"] = propmodels.props_layer(ctx, loc_cfg["props"])
    # ---- atmosphere: haze volume and interior backdrop (R1), then the camera-only sky plate
    acfg = loc_cfg.get("atmos") or {}
    if "atmos" in allowed and acfg.get("haze"):
        rec["layers"].setdefault("atmos", {})["haze"] = atmos.haze_box(bpy, ctx, acfg["haze"])
    if "atmos" in allowed and acfg.get("fog"):  # R2: ground fog layer
        rec["layers"].setdefault("atmos", {})["fog"] = atmos.haze_box(bpy, ctx, dict(acfg["fog"], _name="fog"))
    if "atmos" in allowed and acfg.get("backdrop"):
        rec["layers"].setdefault("atmos", {})["backdrop"] = atmos.backdrop(sc, acfg["backdrop"])
    plate = acfg.get("sky_plate")
    if "atmos" in allowed and plate:
        plate = dict(plate)
        if plate.get("hdri"):
            lk = materials.lock(dress_dir)["hdris"][plate["hdri"]]
            plate["_hdri_path"] = os.path.join(materials.cache_dir(dress_dir), "hdri", plate["hdri"])
            rec["layers"].setdefault("atmos", {})["hdri_md5"] = lk["md5"]
        dctx["atmos_spec"] = plate
        rec["layers"]["atmos"] = dict(rec["layers"].get("atmos", {}), sky_plate=atmos.wrap_world(sc, plate, K))
    bpy.context.view_layer.update()
    # ---- budget and placement facts, manifest hash
    dress_objs = [o for o in bpy.data.objects if o.get("dress_group") and not o["dress_group"].startswith("atmos/")]
    cams = [Vector(v[0]) for v in views.values()]
    near = 0
    for o in dress_objs:
        b = _bbox(o)
        for c in cams:
            d = Vector((max(b[0] - c.x, 0, c.x - b[3]), max(b[1] - c.y, 0, c.y - b[4]), max(b[2] - c.z, 0, c.z - b[5]))).length
            if d < 0.3 * K:
                near += 1
                break
    groups = {}
    for o in dress_objs:
        groups[o["dress_group"]] = groups.get(o["dress_group"], 0) + 1
    pbb = []
    for pr, o in made:
        if o.type in ("MESH", "EMPTY"):
            pts = [o.matrix_world @ Vector(c) for c in o.bound_box] if o.type == "MESH" else []
            for ch in o.children_recursive:
                if ch.type == "MESH":
                    pts += [ch.matrix_world @ Vector(c) for c in ch.bound_box]
            if pts:
                pbb.append((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts), max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    rec["instances_in_prop_bbox"] = sum(1 for o in dress_objs if o["dress_group"].startswith("scatter/") and any(
        b[0] <= o.location.x <= b[3] and b[1] <= o.location.y <= b[4] and b[2] - 0.02 <= o.location.z <= b[5] for b in pbb))
    rec["dress_objects"] = len(dress_objs)
    rec["dress_groups"] = groups
    rec["dress_within_0.3m_of_camera"] = near
    rec["layout_id"] = seeds.short_hash({"cfg": loc_cfg, "game": game, "location": location, "version": VERSION, "salt": seed_salt})
    rec["manifest_hash"] = seeds.short_hash({k: v for k, v in rec.items() if k not in ("dress_objects",)} | {
        "pos": [[o.name, [round(x, 4) for x in o.location]] for o in sorted(dress_objs, key=lambda o: o.name)]})
    return dctx


def view_record(bpy, sc, view, res, dctx):
    """Per still: a 12 x 7 grid of rays (id group and distance), the centre ray, and the nearest dress object to the camera."""
    loc, look, lens = view[0], view[1], view[2]
    K = dctx["ctx"]["K"]
    f = Vector(look) - Vector(loc)
    f.normalize()
    right = f.cross(Vector((0, 0, 1)))
    if right.length < 1e-6:
        right = Vector((1, 0, 0))
    right.normalize()
    up = right.cross(f)
    tw = 18.0 / lens
    th = tw * res[1] / res[0]
    hz = [o for o in bpy.data.objects if str(o.get("dress_group", "")).startswith("atmos/")]
    for o in hz:  # the haze box would be the first hit of every ray
        o.hide_viewport = True
    if hz:
        bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    grid = []
    for j in range(7):
        for i in range(12):
            u, v = (i + 0.5) / 12 * 2 - 1, (j + 0.5) / 7 * 2 - 1
            d = (f + right * (u * tw) + up * (v * th)).normalized()
            hit, p, n, idx, obj, mat = sc.ray_cast(dg, Vector(loc), d)
            grid.append([round(u, 3), round(v, 3), idpass.group_key(obj) if hit and obj is not None else None,
                         round((p - Vector(loc)).length, 3) if hit else None])
    hit, p, n, idx, obj, mat = sc.ray_cast(dg, Vector(loc), f)
    centre = {"group": idpass.group_key(obj) if hit and obj is not None else None, "distance_m": round((p - Vector(loc)).length, 3) if hit else None}
    for o in hz:
        o.hide_viewport = False
    if hz:
        bpy.context.view_layer.update()
    mind = None
    for o in bpy.data.objects:
        if o.get("dress_group") and not str(o["dress_group"]).startswith("atmos/"):
            b = _bbox(o)
            c = Vector(loc)
            d = Vector((max(b[0] - c.x, 0, c.x - b[3]), max(b[1] - c.y, 0, c.y - b[4]), max(b[2] - c.z, 0, c.z - b[5]))).length
            mind = d if mind is None else min(mind, d)
    return {"rays": grid, "centre": centre, "dress_min_dist_m": None if mind is None else round(mind / K, 3), "lens_mm": lens}


def after_overview(bpy, sc, dctx, rig):
    """The overview rig rebuilds the world; the sky plate is wrapped around the new one. The attic cap (R1) is hidden: an overview
    looks into the room from above."""
    for o in bpy.data.objects:
        if str(o.get("dress_group", "")).startswith(("kits/attic", "atmos/window_plate")):
            o.hide_render = True
    if dctx.get("atmos_spec"):
        atmos.wrap_world(sc, dctx["atmos_spec"], dctx["ctx"]["K"])
