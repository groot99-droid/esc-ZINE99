"""The scene's "intent" hash (gate G1): every light, the world's flat (non-camera) branch and the camera, read back from Blender.

Exposure is not in the hash: it is a rig value (a re-match is recorded as `exposure_ev_delta`, never in rig.json).
Values are rounded to 5 decimals so float noise from an unrelated change cannot move the hash.
"""
import json

from .seeds import short_hash


def _r(v, n=5):
    return [round(float(x), n) + 0.0 for x in v]  # + 0.0 turns -0.0 into 0.0


def lights_of(bpy):
    out = []
    for ob in sorted((o for o in bpy.data.objects if o.type == "LIGHT" and not o.hide_render), key=lambda o: o.name):
        d = ob.data
        m = ob.matrix_world
        rec = {"name": ob.name, "type": d.type, "loc": _r(m.translation), "rot": _r(m.to_euler()), "energy": round(d.energy, 4),
               "color": _r(d.color), "size": round(getattr(d, "size", 0.0) if d.type == "AREA" else d.shadow_soft_size, 5)}
        if d.type == "SPOT":
            rec["spot"] = [round(d.spot_size, 5), round(d.spot_blend, 5)]
        out.append(rec)
    return out


def world_branch(bpy, sc):
    """The world as non-camera rays see it: the Background node named `flat-bg` when a camera-only sky plate is in use, else the
    only Background node; plus any world volume's scatter settings."""
    w = sc.world
    if w is None or not w.use_nodes:
        return None
    nodes = w.node_tree.nodes
    bg = nodes.get("flat-bg")
    if bg is None:
        cand = [n for n in nodes if n.bl_idname == "ShaderNodeBackground" and not n.name.startswith("plate")]
        bg = cand[0] if cand else None
    rec = {}
    if bg is not None:
        rec["color"] = _r(bg.inputs["Color"].default_value[:3])
        rec["strength"] = round(bg.inputs["Strength"].default_value, 5)
    vol = [n for n in nodes if n.bl_idname == "ShaderNodeVolumeScatter"]
    if vol:
        rec["volume"] = [round(vol[0].inputs["Density"].default_value, 6), round(vol[0].inputs["Anisotropy"].default_value, 4)]
    return rec


def camera_of(bpy, sc):
    c = sc.camera
    if c is None:
        return None
    m = c.matrix_world
    return {"loc": _r(m.translation), "rot": _r(m.to_euler()), "lens": round(c.data.lens, 4), "sensor": round(c.data.sensor_width, 4)}


def intent(bpy, sc):
    rec = {"lights": lights_of(bpy), "world": world_branch(bpy, sc), "camera": camera_of(bpy, sc)}
    return rec, short_hash(rec)
