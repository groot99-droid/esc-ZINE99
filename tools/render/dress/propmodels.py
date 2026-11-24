"""The `props` layer (new-models pass, 2026-11-24): whole models put into a scene at render time (needs bpy).

Each config entry names one model file and its copies (see modelplace.py for the format and the maths). A model is imported
once per scene; later copies share its meshes and materials. Every object of a copy carries `dress_group = "models/<model>"`,
so the id pass, the camera-distance record and the manifest hash count it like any other dressing. The blockout pieces and
props a model replaces are hidden in the render only (`hide_render`); the build file is never touched. Model files resolve
under $DRESS_MODELS (default `<dress dir>/../newmodels`) and are checked against the config's md5.
"""
import hashlib
import os

from mathutils import Vector

from . import modelplace


def models_dir(dress_dir):
    return os.environ.get("DRESS_MODELS") or os.path.join(os.path.dirname(os.path.abspath(dress_dir)), "newmodels")


def _md5(p):
    h = hashlib.md5()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def _import(bpy, path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    bpy.context.view_layer.update()
    meshes = [o for o in new if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = [min(p[i] for p in pts) for i in range(3)]
    hi = [max(p[i] for p in pts) for i in range(3)]
    return new, lo, hi


def _copy_tree(bpy, sc, objs):
    mp = {}
    for o in objs:
        c = o.copy()  # linked copy: shares the mesh and its materials
        sc.collection.objects.link(c)
        mp[o] = c
    for o, c in mp.items():
        c.parent = mp.get(o.parent)
        c.matrix_parent_inverse = o.matrix_parent_inverse.copy()
    return list(mp.values())


def _albedo_gain(bpy, objs, gain):
    """Multiply the base colour of every material of a model by `gain` (a number or an RGB triple), once per material: a
    model's own texture far darker than the thing it stands for (a black leather seat for a canvas bench)."""
    g = [float(gain)] * 3 if isinstance(gain, (int, float)) else [float(x) for x in gain]
    done = []
    for o in objs:
        for slot in getattr(o, "material_slots", []):
            m = slot.material
            if m is None or m.name in done or not m.use_nodes:
                continue
            done.append(m.name)
            nt = m.node_tree
            for b in [n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled"]:
                inp = b.inputs["Base Color"]
                mix = nt.nodes.new("ShaderNodeMix")
                mix.data_type = "RGBA"
                mix.blend_type = "MULTIPLY"
                mix.inputs["Factor"].default_value = 1.0
                mix.inputs["B"].default_value = (g[0], g[1], g[2], 1.0)
                if inp.is_linked:
                    src = inp.links[0].from_socket
                    nt.links.remove(inp.links[0])
                    nt.links.new(src, mix.inputs["A"])
                else:
                    mix.inputs["A"].default_value = inp.default_value
                nt.links.new(mix.outputs["Result"], inp)
    return done


def props_layer(ctx, specs):
    bpy, sc, K = ctx["bpy"], ctx["sc"], ctx["K"]
    mdir = models_dir(ctx["dress_dir"])
    views = ctx["views"]
    vm = {k: ([x / K for x in v[0]], [x / K for x in v[1]], v[2]) for k, v in views.items()}
    walk = []
    if ctx.get("player_start") is not None:
        walk.append(("player start", [x / K for x in ctx["player_start"]]))
    rec = {"models": [], "hidden_pieces": [], "hidden_props": [], "findings": []}
    for spec in specs:
        if spec.get("scenes") and ctx["scene"] not in spec["scenes"]:
            continue
        path = os.path.join(mdir, spec["glb"])
        mrec = {"model": spec["model"], "glb": spec["glb"], "copies": []}
        if not os.path.exists(path):
            mrec["error"] = "model file missing"
            rec["models"].append(mrec)
            continue
        md5 = _md5(path)
        mrec["md5"] = md5
        if spec.get("md5") and spec["md5"] != md5:
            mrec["error"] = "md5 differs from the config"
            rec["models"].append(mrec)
            continue
        tmpl, lo, hi = _import(bpy, path)
        dims = [hi[i] - lo[i] for i in range(3)]
        mrec["model_dims_m"] = [round(x, 3) for x in dims]
        if spec.get("albedo_gain") is not None:  # copies share the materials: one change covers them all
            mrec["albedo_gain"] = spec["albedo_gain"]
            mrec["albedo_gain_materials"] = len(_albedo_gain(bpy, tmpl, spec["albedo_gain"]))
        items = modelplace.expand_items(spec)
        group = "models/" + spec["model"]
        for n, it in enumerate(items):
            objs = tmpl if n == 0 else _copy_tree(bpy, sc, tmpl)
            scale = modelplace.axis_scale(dims, dict(spec, **{k: it[k] for k in ("scale", "dims_m", "height_m") if k in it}))
            rot = modelplace.rotation_of(spec, it)
            wlo, whi, off = modelplace.world_box(lo, hi, scale, rot, it["at"])
            # root (location, rotation) > scaler (scale in the model's own frame) > the imported objects (left where the importer put them)
            root = bpy.data.objects.new("dm-%s-%d" % (spec["model"], n + 1), None)
            scaler = bpy.data.objects.new("dm-%s-%d-scale" % (spec["model"], n + 1), None)
            sc.collection.objects.link(root)
            sc.collection.objects.link(scaler)
            scaler.parent = root
            scaler.scale = scale
            root.rotation_euler = [a * 3.141592653589793 / 180.0 for a in rot]
            root.location = [x * K for x in off]
            root.scale = (K, K, K)
            for o in objs:
                if o.parent is None:
                    o.parent = scaler
            for o in objs:  # the meshes only: an empty's bound box is not its extent (dress.apply measures camera distance by it)
                o["dress_group"] = group
            if it.get("cast_shadow") is False or spec.get("cast_shadow") is False:
                for o in objs:
                    o.visible_shadow = False
            find = modelplace.clearance(wlo, whi, vm) + modelplace.path_clear(wlo, whi, walk)
            mrec["copies"].append({"at": [round(x, 3) for x in it["at"]], "rot_deg": [round(a, 2) for a in rot],
                                   "scale": [round(s, 4) for s in scale], "box_lo": [round(x, 3) for x in wlo],
                                   "box_hi": [round(x, 3) for x in whi], "findings": find})
            rec["findings"] += ["%s #%d: %s" % (spec["model"], n + 1, f) for f in find]
        for pid in spec.get("hide_pieces", []):
            ob = bpy.data.objects.get("bo-" + pid)
            if ob is not None and not ob.hide_render:
                ob.hide_render = True
                rec["hidden_pieces"].append(pid)
        for pid in spec.get("hide_props", []):
            ob = bpy.data.objects.get(pid)
            if ob is not None:
                for o in [ob] + list(ob.children_recursive):
                    o.hide_render = True
                rec["hidden_props"].append(pid)
        rec["models"].append(mrec)
    bpy.context.view_layer.update()
    return rec
