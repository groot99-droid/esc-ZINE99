#!/usr/bin/env python3
"""Turn a compiled blockout.json into one self-contained piece of bpy code.

    python tools/blender/blockout.py emit <scene-folder>/blockout.json

The code builds the set's blockout geometry (boxes, cylinders, cones, spheres, planes) with simple
Principled materials in a `blockout` collection, tints the assembly's lights with the colours the
build file gave them (assemble_plan.py has no light colour), and records the player start and the
interaction points as empties. It imports only bpy, math and json, prints one `ROSW {json}` line,
and is run in the same Blender session as the assembly, after its `import` step and before `stage`,
headless or through the Blender MCP server's execute_blender_code. Stdlib only here; `emit` prints
and writes nothing.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

TEMPLATE = r'''import bpy, math, json
DATA = json.loads(__DATA__)

def collection(name):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col

def material(name, spec):
    mat = bpy.data.materials.get("bo-" + name) or bpy.data.materials.new("bo-" + name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    r, g, b = spec["color"]
    bsdf.inputs["Base Color"].default_value = (r, g, b, 1.0)
    bsdf.inputs["Roughness"].default_value = spec.get("roughness", 0.8)
    bsdf.inputs["Metallic"].default_value = spec.get("metallic", 0.0)
    if spec.get("emission"):
        key = "Emission Color" if "Emission Color" in bsdf.inputs else "Emission"
        bsdf.inputs[key].default_value = (r, g, b, 1.0)
        bsdf.inputs["Emission Strength"].default_value = spec["emission"]
    return mat

ADD = {
    "box": lambda: bpy.ops.mesh.primitive_cube_add(size=1),
    "cylinder": lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=1, vertices=32),
    "cone": lambda: bpy.ops.mesh.primitive_cone_add(radius1=0.5, depth=1, vertices=32),
    "sphere": lambda: bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5),
    "plane": lambda: bpy.ops.mesh.primitive_plane_add(size=1),
}

col = collection("blockout")
mats = {k: material(k, v) for k, v in DATA["materials"].items()}
made = 0
for piece in DATA["pieces"]:
    ADD[piece["shape"]]()
    obj = bpy.context.active_object
    obj.name = "bo-" + piece["id"]
    sx, sy, sz = piece["size_m"]
    obj.scale = (sx or 0.001, sy or 0.001, sz or 0.001) if piece["shape"] != "plane" else (sx, sy, 1)
    obj.location = piece["location"]
    obj.rotation_euler = [math.radians(a) for a in piece.get("rotation_deg", [0, 0, 0])]
    obj.data.materials.append(mats[piece["material"]])
    obj["role"] = piece["role"]
    obj["collide"] = bool(piece.get("collide", piece["role"] not in ("sky", "opening")))
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)
    made += 1

tinted = 0
for name, rgb in DATA["light_colors"].items():
    obj = bpy.data.objects.get(name)
    if obj is not None and obj.type == "LIGHT":
        obj.data.color = rgb
        tinted += 1

markers = collection("markers")
def empty(name, location, rot_z=0.0, props=None):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = "ARROWS"
    obj.location = location
    obj.rotation_euler = (0, 0, math.radians(rot_z))
    for k, v in (props or {}).items():
        obj[k] = v
    markers.objects.link(obj)

ps = DATA.get("player_start")
if ps:
    empty("player-start", ps["location"], ps["facing_deg"])
for i, it in enumerate(DATA.get("interactions", [])):
    target = bpy.data.objects.get(it["prop"])
    where = list(target.location) if target is not None else [0, 0, 0]
    empty("interact-%d-%s" % (i, it["prop"]), where, 0,
          {"verb": it["verb"], "leads_to": it.get("leads_to") or "", "prop": it["prop"]})

print("ROSW " + json.dumps({"step": "blockout", "game": DATA["game"], "location": DATA["location"],
                           "scene": DATA["scene"], "pieces": made, "lights_tinted": tinted,
                           "markers": len(markers.objects)}))
'''


def code_for(blockout: dict) -> str:
    return TEMPLATE.replace("__DATA__", repr(json.dumps(blockout)))


def main(argv):
    if len(argv) != 2 or argv[0] != "emit":
        print(__doc__.strip().splitlines()[2].strip(), file=sys.stderr)
        return 2
    data = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    print(code_for(data))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
