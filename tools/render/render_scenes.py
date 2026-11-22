"""Blender render driver for the esc-ZINE99 build files (run inside Blender, headless).

    blender -b --factory-startup --python tools/render/render_scenes.py -- \
        --pack <pack dir> --out <out dir> [--only loc/scene,loc/scene] [--stills camera,player,overview]
        [--device OPTIX|CUDA|CPU] [--res-scale 1.0] [--samples-scale 1.0] [--models <models.json>]

The pack is made by tools/render/pack.py (compiled scenes, resolved props, rig.json, overrides.json, the
repo's tools/blender/blockout.py). Per scene it builds the set exactly as the build file says: the blockout
pieces through the repo's own blockout code, every prop as a named box proxy sized from assets.json (or the
real model when a models ledger lists one), the scene's own lights, world, camera and lens. Only the rig
(rig.json: exposure, world and light gain, fog, fills, proxy colours) and the recorded render-time overrides
(overrides.json) change anything else. It also checks the geometry (camera inside a piece, a piece between
camera and target, a prop inside a piece, a prop off its floor) and writes one `<scene>.json` record per scene.
"""
import json
import math
import os
import sys
import time

import bpy
from mathutils import Vector


def argv():
    a = sys.argv
    return a[a.index("--") + 1:] if "--" in a else []


def parse(args):
    o = {"pack": None, "out": None, "only": None, "stills": "camera,player,overview", "device": "OPTIX",
         "res_scale": 1.0, "samples_scale": 1.0, "models": None, "no_overrides": "0"}
    i = 0
    while i < len(args):
        k = args[i].lstrip("-").replace("-", "_")
        v = args[i + 1]
        o[k] = float(v) if k in ("res_scale", "samples_scale") else v
        i += 2
    return o


def jload(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------- scene building
def new_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def build_world(sc, world, rig, gain):
    w = bpy.data.worlds.new("world")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    bg = nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.new("ShaderNodeOutputWorld")
    r, g, b = world["color"]
    bg.inputs["Color"].default_value = (r, g, b, 1)
    bg.inputs["Strength"].default_value = world["strength"] * gain
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    fog = rig.get("fog")
    if fog and fog.get("density", 0) > 0:
        vs = nt.nodes.new("ShaderNodeVolumeScatter")
        vs.inputs["Density"].default_value = fog["density"]
        vs.inputs["Anisotropy"].default_value = fog.get("anisotropy", 0.3)
        c = fog.get("color", [0.8, 0.85, 0.9])
        vs.inputs["Color"].default_value = (c[0], c[1], c[2], 1)
        nt.links.new(vs.outputs["Volume"], out.inputs["Volume"])


def aim(obj, target):
    d = Vector(target) - Vector(obj.location)
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def make_light(sc, spec, gain, rig):
    t = spec["type"]
    data = bpy.data.lights.new(spec["name"], t)
    data.energy = spec["energy"] * gain
    if t == "AREA":
        data.shape = "SQUARE"
        data.size = spec.get("size", 1)
    elif t in ("POINT", "SPOT"):
        data.shadow_soft_size = spec.get("size", 1) / 2.0
    if t == "SPOT":
        data.spot_size = math.radians(rig.get("spot_deg", 70))
        data.spot_blend = rig.get("spot_blend", 0.5)
    if "color" in spec:
        data.color = spec["color"]
    obj = bpy.data.objects.new(spec["name"], data)
    sc.collection.objects.link(obj)
    obj.location = spec["location"]
    if "look_at" in spec:
        aim(obj, spec["look_at"])
    elif "rotation_deg" in spec:
        obj.rotation_euler = [math.radians(a) for a in spec["rotation_deg"]]
    return obj


def proxy_material(name, rgb, alpha):
    m = bpy.data.materials.new("px-" + name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1)
    b.inputs["Roughness"].default_value = 0.7
    if alpha < 1.0:
        b.inputs["Alpha"].default_value = alpha
    return m


def world_bbox(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == "MESH" for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def neutral_name(rig, pr):
    nn = rig.get("neutral_names") or {}
    return nn.get("by_id", {}).get(pr["id"]) or nn.get("by_object", {}).get(pr["object"])


def make_prop(sc, pr, rig, models):
    """A named box proxy, or the real model when the ledger has one. Returns (object, source)."""
    sx, sy, sz = pr["size_m"]
    s = pr["target_height_m"] / sz
    rot = [math.radians(a) for a in pr.get("rotation_deg", [0, 0, 0])]
    loc = Vector(pr["location"])
    glb = models.get(pr["object"])
    if glb:
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=glb)
        new = [o for o in bpy.data.objects if o not in before]
        root = bpy.data.objects.new(pr["id"], None)
        sc.collection.objects.link(root)
        for o in new:
            if o.parent is None:
                o.parent = root
        bpy.context.view_layer.update()
        lo, hi = world_bbox(new)
        k = pr["target_height_m"] / max(hi.z - lo.z, 1e-6)
        root.scale = (k, k, k)
        root.rotation_euler = rot
        bpy.context.view_layer.update()
        lo, hi = world_bbox(new)
        cx, cy, cz = (lo.x + hi.x) / 2, (lo.y + hi.y) / 2, (lo.z + hi.z) / 2
        root.location = (loc.x - cx, loc.y - cy, (loc.z - lo.z) if pr.get("ground", True) else (loc.z - cz))
        return root, "model:" + os.path.basename(glb)
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.name = neutral_name(rig, pr) or pr["id"]  # rig "neutral_names": a plain name where the prop id or object reads as a figure
    o.data.name = o.name + "-proxy"
    o.scale = (sx * s, sy * s, sz * s)
    o.rotation_euler = rot
    bpy.context.view_layer.update()
    zs = [(o.matrix_world @ Vector(c)).z for c in o.bound_box]
    zc = (min(zs) + max(zs)) / 2
    o.location = (loc.x, loc.y, (loc.z + (o.location.z - min(zs))) if pr.get("ground", True) else (loc.z + (o.location.z - zc)))
    colors = rig.get("proxy_colors", {})
    rgb = colors.get(pr["object"]) or colors.get(pr.get("role", "fill")) or [0.6, 0.55, 0.5]
    alpha = pr.get("alpha", rig.get("proxy_alpha", {}).get(pr["object"], 1.0))
    o.data.materials.append(proxy_material(pr["id"], rgb, alpha))
    o["proxy_of"] = pr["object"]
    for c in list(o.users_collection):
        c.objects.unlink(o)
    sc.collection.objects.link(o)
    return o, "box-proxy"


# ---------------------------------------------------------------- checks
def piece_inside(obj, p):
    q = obj.matrix_world.inverted() @ Vector(p)
    shape = obj.get("shape", "box")
    if shape in ("cylinder", "cone") and obj.get("role") == "wall":
        return False  # a closed cylinder of role wall is a hollow shell (drum, outer wall): seen from inside, not solid
    if shape == "box":
        return abs(q.x) < 0.5 and abs(q.y) < 0.5 and abs(q.z) < 0.5
    if shape in ("cylinder", "cone"):
        return q.x * q.x + q.y * q.y < 0.25 and abs(q.z) < 0.5
    if shape == "sphere":
        return q.length < 0.5
    return False


def run_checks(sc, cam_loc, lookat, props, pieces):
    dg = bpy.context.evaluated_depsgraph_get()
    res = {"camera_inside": [], "camera_inside_prop": [], "between_camera_and_target": [], "prop_inside": [],
           "prop_overlap": [], "prop_off_floor": []}
    solid = [o for o in pieces if o["collide"]]
    cam = Vector(cam_loc)
    for o in solid:
        if piece_inside(o, cam):
            res["camera_inside"].append(o.name[3:])
    for pr, o in props:  # camera inside a prop's proxy (a bounding-box test, so a rotated box is approximate)
        if o.type == "MESH" and pr.get("alpha", 1.0) >= 1.0:
            lo, hi = world_bbox([o])
            if lo.x < cam.x < hi.x and lo.y < cam.y < hi.y and lo.z < cam.z < hi.z:
                res["camera_inside_prop"].append(pr["id"])
    tgt = Vector(lookat)
    dist = (tgt - cam).length
    dn = (tgt - cam).normalized()
    origin = cam.copy()
    seen = set()
    for _ in range(40):
        remaining = dist - (origin - cam).length
        if remaining < 0.15:
            break
        hit, loc, nrm, idx, obj, mat = sc.ray_cast(dg, origin, dn, distance=remaining)
        if not hit or dist - (loc - cam).length < 0.15:
            break
        if obj is not None and obj.name.startswith("bo-") and obj.get("collide") and obj.name[3:] not in seen:
            seen.add(obj.name[3:])
            res["between_camera_and_target"].append(obj.name[3:])
        origin = loc + dn * 0.01
    for pr, o in props:
        if o.type != "MESH":
            continue
        lo, hi = world_bbox([o])
        ctr = (lo + hi) / 2
        for pc in solid:
            n = tot = 0
            for fx in (0.05, 0.5, 0.95):
                for fy in (0.05, 0.5, 0.95):
                    for fz in (0.08, 0.5, 0.95):
                        pt = Vector((lo.x + (hi.x - lo.x) * fx, lo.y + (hi.y - lo.y) * fy, lo.z + (hi.z - lo.z) * fz))
                        tot += 1
                        n += 1 if piece_inside(pc, pt) else 0
            if n:
                rec = {"prop": pr["id"], "piece": pc.name[3:], "samples": "%d/%d" % (n, tot)}
                res["prop_inside" if piece_inside(pc, ctr) else "prop_overlap"].append(rec)
        if pr.get("ground", True) and abs(pr["location"][2]) < 0.05:
            hit, loc, nrm, idx, obj, mat = sc.ray_cast(dg, Vector((ctr.x, ctr.y, lo.z + 0.5)), Vector((0, 0, -1)), distance=60)
            if not hit:
                res["prop_off_floor"].append({"prop": pr["id"], "support": None})
            elif obj.name.startswith("bo-") and abs(lo.z - loc.z) > 0.05:
                res["prop_off_floor"].append({"prop": pr["id"], "support": obj.name[3:], "gap_m": round(lo.z - loc.z, 3)})
    return res


# ---------------------------------------------------------------- render
def setup_render(sc, res, samples, device, ev, grade=None):
    sc.render.engine = "CYCLES"
    cy = sc.cycles
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.01
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.max_bounces = 10
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    if device != "CPU":
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = device
        prefs.refresh_devices()
        for d in prefs.devices:
            d.use = d.type == device
        cy.device = "GPU"
    else:
        cy.device = "CPU"
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = ev
    if grade:  # a per-channel gain through the colour-management curve's white level (rig "grade_gain")
        vs = sc.view_settings
        vs.use_curve_mapping = True
        vs.curve_mapping.white_level = [1.0 / g for g in grade]
        vs.curve_mapping.update()


def set_camera(sc, loc, look_at, lens):
    cd = bpy.data.cameras.get("cam") or bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_fit = "HORIZONTAL"
    cd.sensor_width = 36
    cd.clip_start = 0.05
    cd.clip_end = 2000
    co = bpy.data.objects.get("cam") or bpy.data.objects.new("cam", cd)
    if co.name not in sc.collection.objects:
        sc.collection.objects.link(co)
    co.location = loc
    aim(co, look_at)
    sc.camera = co
    return co


def merge(base, patch):
    out = dict(base)
    out.update(patch or {})
    return out


def main():
    o = parse(argv())
    pack, out = o["pack"], o["out"]
    os.makedirs(out, exist_ok=True)
    man = jload(os.path.join(pack, "manifest.json"))
    rigs = jload(os.path.join(pack, "rig.json"))
    overrides = jload(os.path.join(pack, "overrides.json"))
    sys.path.insert(0, os.path.join(pack, "blender_tools"))
    import blockout as bo  # the repo's own blockout code, unchanged

    models = {}
    if o["models"]:
        ml = jload(o["models"])
        items = ml.get("models", ml) if isinstance(ml, dict) else ml
        if isinstance(items, dict):
            items = [dict(v, object=k) if isinstance(v, dict) else {"object": k, "glb": v} for k, v in items.items()]
        for it in items:
            g = it.get("glb") or it.get("path") or it.get("file")
            oid = it.get("object") or it.get("id")
            if g and oid and os.path.exists(g):
                models[oid] = g
    wanted = set(o["only"].split(",")) if o["only"] else None
    stills = set(o["stills"].split(","))
    total0 = time.time()
    done = 0
    for entry in man["scenes"]:
        key = entry["location"] + "/" + entry["scene"]
        if wanted and key not in wanted and entry["location"] + "/*" not in wanted:
            continue
        t0 = time.time()
        base = os.path.join(pack, "scenes", entry["location"], entry["scene"])
        asm = jload(os.path.join(base, "assembly.json"))
        blk = jload(os.path.join(base, "blockout.json"))
        props = jload(os.path.join(base, "props.json"))
        rig = merge(rigs["default"], rigs.get(entry["location"], {}))
        srig = rig.get("scenes", {}).get(entry["scene"], {})
        ov = merge(overrides.get(entry["location"] + "/*", {}), overrides.get(key, {}))
        ev = rig.get("exposure_ev", 0.0) + srig.get("exposure_ev", 0.0)
        wgain = rig.get("world_gain", 1.0) * srig.get("world_gain", 1.0)
        lgain = rig.get("light_gain", 1.0) * srig.get("light_gain", 1.0)
        per_light = merge(rig.get("light_gains", {}), srig.get("light_gains", {}))

        if o["no_overrides"] == "1":  # the "before" pass: the build file as it is, no overrides, solid proxies
            ov = {}
            rig = dict(rig, proxy_alpha={})
        # render-time overrides (blockout piece replacement, prop changes, camera nudge); the notes record each one
        pieces = []
        repl = ov.get("blockout_replace", {})
        for p in blk["pieces"]:
            pieces.extend(repl[p["id"]] if p["id"] in repl else [p])
        blk["pieces"] = pieces
        pdict = {p["id"]: p for p in props}
        for pid, patch in ov.get("props", {}).items():
            pdict[pid].update(patch)
        for pid in ov.get("hide_props", []):
            pdict.pop(pid, None)
        for pid, a in ov.get("prop_alpha", {}).items():  # a proxy drawn translucent (the player rides inside it)
            pdict[pid]["alpha"] = a
        props = list(pdict.values())
        cam_spec = merge(asm["camera"], ov.get("camera"))
        pstart = merge(entry.get("player_start"), ov.get("player_start")) if entry.get("player_start") else None

        sc = new_scene()
        build_world(sc, asm["world"], rig, wgain)
        made, sources = [], {}
        for pr in props:
            obj, src = make_prop(sc, pr, rig, models)
            made.append((pr, obj))
            sources[pr["id"]] = {"object": pr["object"], "source": src, "name": neutral_name(rig, pr) or pr["id"]}
        for li in asm["lights"]:
            make_light(sc, li, lgain * per_light.get(li["name"], 1.0), rig)
        fills = [f for f in rig.get("fills", []) if not f.get("scenes") or entry["scene"] in f["scenes"]]
        for fl in fills:
            make_light(sc, dict(fl, name="rig-fill-" + fl["name"]), 1.0, rig)
        exec(bo.code_for(blk), {"__name__": "blockout"})
        shape_of = {p["id"]: p["shape"] for p in blk["pieces"]}
        pieces_objs = [ob for ob in bpy.data.objects if ob.name.startswith("bo-")]
        for ob in pieces_objs:
            ob["shape"] = shape_of.get(ob.name[3:], "box")
            if ob.get("role") == "sky":
                ob.hide_render = True  # a lid at sky height would shut out the sun and the world
        for mname, a in rig.get("piece_alpha", {}).items():  # rig: a blockout material drawn translucent (haze, glass)
            mt = bpy.data.materials.get("bo-" + mname)
            if mt is not None and mt.node_tree.nodes.get("Principled BSDF"):
                mt.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = a
        bpy.context.view_layer.update()
        checks = run_checks(sc, cam_spec["location"], cam_spec["look_at"], made, pieces_objs)
        rec = {"location": entry["location"], "scene": entry["scene"], "tier": entry["tier"],
               "rig": {"exposure_ev": ev, "world_gain": wgain, "light_gain": lgain, "light_gains": per_light,
                       "fog": rig.get("fog"), "grade_gain": rig.get("grade_gain"), "fills": [f["name"] for f in fills]},
               "overrides": ov, "props": sources, "checks": checks, "stills": []}

        def shoot(name, loc, look, lens, res, samples, ev_extra=0.0):
            setup_render(sc, res, samples, o["device"], ev + ev_extra, rig.get("grade_gain"))
            set_camera(sc, loc, look, lens)
            d = os.path.join(out, entry["location"], "_overview" if name == "overview" else entry["scene"])
            os.makedirs(d, exist_ok=True)
            fp = os.path.join(d, name + ".png")
            sc.render.filepath = fp
            t1 = time.time()
            bpy.ops.render.render(write_still=True)
            rec["stills"].append({"still": name, "file": os.path.relpath(fp, out).replace("\\", "/"),
                                  "resolution": list(res), "samples": samples, "seconds": round(time.time() - t1, 1)})

        W, H = int(entry["resolution"][0] * o["res_scale"]), int(entry["resolution"][1] * o["res_scale"])
        S = max(4, int(entry["samples"] * o["samples_scale"]))
        if "camera" in stills:
            shoot("camera", cam_spec["location"], cam_spec["look_at"], cam_spec.get("lens_mm", 35), (W, H), S)
        ps = pstart
        if "player" in stills and ps:
            f = math.radians(ps["facing_deg"])  # compass: 0 faces +y, 90 faces +x
            eye = ps["location"][2] + 1.6
            if ps["location"][2] == 0:
                eye = min(max(cam_spec["location"][2], 0.8), 2.0)  # the scene camera's own eye height
            loc = [ps["location"][0], ps["location"][1], eye]
            shoot("player", loc, [loc[0] + math.sin(f) * 5, loc[1] + math.cos(f) * 5, eye - 0.1],
                  cam_spec.get("lens_mm", 35), (W, H), S)
        if "overview" in stills and entry.get("overview") is not None:
            ovw = merge(entry["overview"], rig.get("overview", {}))
            shoot("overview", ovw["location"], ovw["look_at"], ovw.get("lens_mm", 28),
                  (int(1920 * o["res_scale"]), int(1080 * o["res_scale"])), max(4, int(128 * o["samples_scale"])),
                  rig.get("overview_ev", 0.0))
        rec["seconds"] = round(time.time() - t0, 1)
        os.makedirs(os.path.join(out, entry["location"]), exist_ok=True)
        with open(os.path.join(out, entry["location"], entry["scene"] + ".json"), "w", encoding="utf-8") as f:
            json.dump(rec, f, indent=1)
        print("ROSW", json.dumps({"scene": key, "seconds": rec["seconds"], "checks": {k: len(v) for k, v in checks.items()}}))
        done += 1
    print("ROSW", json.dumps({"done": done, "seconds": round(time.time() - total0, 1)}))


main()
