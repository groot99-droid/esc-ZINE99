"""New-models pass: placement maths (modelplace.py), the props configs and the arena rule. No Blender needed:
python -W ignore tools/render/dress/tests/test_props.py"""
import json
import math
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
DRESS = os.path.dirname(HERE)
sys.path.insert(0, os.path.dirname(DRESS))

from dress import measure, modelplace, rules  # noqa: E402


def close(a, b, tol=1e-6):
    return all(abs(x - y) <= tol for x, y in zip(a, b))


class Scale(unittest.TestCase):
    def test_forms(self):
        d = [2.0, 1.0, 4.0]
        self.assertEqual(modelplace.axis_scale(d, {"scale": 0.5}), [0.5, 0.5, 0.5])
        self.assertEqual(modelplace.axis_scale(d, {"scale": [1, 2, 3]}), [1.0, 2.0, 3.0])
        self.assertTrue(close(modelplace.axis_scale(d, {"dims_m": [1.0, 0.5, 1.0]}), [0.5, 0.5, 0.25]))
        # a null axis takes the geometric mean of the given ones
        s = modelplace.axis_scale(d, {"dims_m": [1.0, None, 1.0]})
        self.assertAlmostEqual(s[1], math.sqrt(0.5 * 0.25))
        self.assertTrue(close(modelplace.axis_scale(d, {"height_m": 2.0}), [0.5, 0.5, 0.5]))
        self.assertEqual(modelplace.axis_scale(d, {}), [1.0, 1.0, 1.0])


class Rotation(unittest.TestCase):
    def test_euler_matches_blender_order(self):
        R = modelplace.euler_matrix([90, 0, 0])  # +Z turns to -Y about X
        self.assertTrue(close(modelplace._mul(R, [0, 0, 1]), [0, -1, 0]))
        R = modelplace.euler_matrix([90, 0, 90])  # X first, then Z: +Z -> -Y -> +X
        self.assertTrue(close(modelplace._mul(R, [0, 0, 1]), [1, 0, 0]))

    def test_front_dir(self):
        self.assertTrue(close(modelplace.front_dir([0, 0, 0]), [0, -1, 0]))
        self.assertTrue(close(modelplace.front_dir([0, 0, 90]), [1, 0, 0]))
        self.assertTrue(close(modelplace.front_dir([0, 0, -90]), [-1, 0, 0]))
        self.assertTrue(close(modelplace.front_dir([0, 0, 180]), [0, 1, 0]))

    def test_rotation_of_adds_yaw(self):
        self.assertEqual(modelplace.rotation_of({"rot_deg": [-90, 0, 0]}, {"yaw_deg": 30}), [-90, 0, 30.0])
        self.assertEqual(modelplace.rotation_of({}, {"rot_deg": [10, 0, 5], "yaw_deg": 5}), [10, 0, 10.0])


class Box(unittest.TestCase):
    def test_bottom_centre_lands_on_at(self):
        lo, hi = [-1.0, -0.5, 0.2], [1.0, 0.5, 1.2]
        wlo, whi, off = modelplace.world_box(lo, hi, [2.0, 1.0, 0.5], [0, 0, 90], [5.0, 6.0, 1.0])
        self.assertAlmostEqual((wlo[0] + whi[0]) / 2, 5.0)
        self.assertAlmostEqual((wlo[1] + whi[1]) / 2, 6.0)
        self.assertAlmostEqual(wlo[2], 1.0)
        # scaled in the model frame (x by 2 -> 4 m long), then turned 90 degrees: the long side lies along world y
        self.assertAlmostEqual(whi[1] - wlo[1], 4.0)
        self.assertAlmostEqual(whi[0] - wlo[0], 1.0)
        self.assertAlmostEqual(whi[2] - wlo[2], 0.5)
        # the offset maps the model's own corner onto the world box
        R = modelplace.euler_matrix([0, 0, 90])
        p = modelplace._mul(R, [lo[0] * 2.0, lo[1] * 1.0, lo[2] * 0.5])
        self.assertAlmostEqual(p[2] + off[2], 1.0)


class Items(unittest.TestCase):
    def test_ring_faces_the_centre(self):
        sp = {"ring": {"center": [0.0, 0.3, 0.0], "radius": 0.95, "n": 6, "start_deg": 30}}
        its = modelplace.expand_items(sp)
        self.assertEqual(len(its), 6)
        for it in its:
            f = modelplace.front_dir([0, 0, it["yaw_deg"]])
            to_c = [0.0 - it["at"][0], 0.3 - it["at"][1]]
            n = math.hypot(*to_c)
            self.assertAlmostEqual(f[0], to_c[0] / n, places=6)
            self.assertAlmostEqual(f[1], to_c[1] / n, places=6)
            self.assertAlmostEqual(math.hypot(it["at"][0], it["at"][1] - 0.3), 0.95, places=6)

    def test_row_and_explicit(self):
        its = modelplace.expand_items({"items": [{"at": [1, 2, 3]}], "row": {"start": [0, 0, 0], "step": [0, 1.6, 0], "n": 3, "yaw_deg": 90}})
        self.assertEqual([i["at"] for i in its], [[1, 2, 3], [0, 0, 0], [0, 1.6, 0], [0, 3.2, 0]])
        self.assertEqual(its[-1]["yaw_deg"], 90)


class Clearance(unittest.TestCase):
    def test_segment_box(self):
        self.assertTrue(modelplace.seg_box([0, 0, 0], [10, 0, 0], [4, -1, -1], [5, 1, 1]))
        self.assertFalse(modelplace.seg_box([0, 0, 0], [10, 0, 0], [4, 2, -1], [5, 3, 1]))
        self.assertFalse(modelplace.seg_box([0, 0, 0], [3, 0, 0], [4, -1, -1], [5, 1, 1]))  # stops short
        self.assertTrue(modelplace.seg_box([4.5, 0, 0], [4.5, 0, 0], [4, -1, -1], [5, 1, 1]))  # a point inside

    def test_views_and_paths(self):
        views = {"camera": ([0, 0, 1.6], [10, 0, 1.0], 35), "overview": ([-1, -1, 1.7], [0, 10, 2], 22)}
        self.assertEqual(modelplace.clearance([3, 5, 0], [4, 6, 1], views), [])
        hit = modelplace.clearance([4, -0.5, 0], [5, 0.5, 2], views)
        self.assertEqual(hit, ["camera sightline to the look-at point crosses the box"])
        near = modelplace.clearance([-1.2, -1.2, 0], [-0.9, -0.9, 1.6], views)
        self.assertTrue(any("overview camera" in h for h in near))
        # the look-at target itself (the last tenth of the line) does not count as blocking
        self.assertEqual(modelplace.clearance([9.5, -0.5, 0.0], [10.5, 0.5, 1.5], {"camera": views["camera"]}), [])
        self.assertEqual(modelplace.path_clear([3, 3, 0], [4, 4, 1], [("start", [0, 0, 0])]), [])
        self.assertTrue(modelplace.path_clear([0.2, -0.2, 0], [1, 1, 1], [("start", [0, 0, 0])]))
        self.assertEqual(modelplace.path_clear([0.2, -0.2, 2.5], [1, 1, 3], [("start", [0, 0, 0])]), [])  # overhead


class Configs(unittest.TestCase):
    """Every props entry: a known model file and md5, a known placement form, no banned word, and the arena rule."""
    NEW = {"cab-bench-seat", "dashboard", "envelope-bundle", "servery-counter", "dead-forklift", "roller-shutter-door", "wooden-chair",
           "sorting-counter", "drum-washing-machine", "small-generator", "truck-door", "steel-cell-door", "tract-booklet",
           "service-door-steel", "axial-fan-housing", "floodlight-housing", "firewood-bundle", "split-wood-pile", "crate-coffee-table"}

    def test_props_entries(self):
        rl = rules.load(DRESS)
        seen = 0
        for fn in sorted(os.listdir(DRESS)):
            if not fn.endswith(".dress.json"):
                continue
            game = fn[:-len(".dress.json")]
            with open(os.path.join(DRESS, fn), encoding="utf-8") as f:
                cfg = json.load(f)
            for loc, L in cfg["locations"].items():
                for sp in L.get("props", []):
                    seen += 1
                    self.assertIn(sp["model"], self.NEW, (game, loc))
                    self.assertEqual(sp["glb"], "%s/%s.glb" % (game, sp["model"]))
                    self.assertEqual(len(sp["md5"]), 32)
                    self.assertEqual(rules.banned_hits(rl, "models/" + sp["model"]), [])
                    its = modelplace.expand_items(sp)
                    self.assertTrue(its, (game, loc, sp["model"]))
                    for it in its:
                        self.assertEqual(len(it["at"]), 3)
                    if "dims_m" in sp:
                        self.assertTrue(all(x is None or 0.0 < x < 50.0 for x in sp["dims_m"]))
                    if "albedo_gain" in sp:  # a correction of a too dark or too light texture, not a repaint
                        g = sp["albedo_gain"]
                        for x in ([g] * 3 if isinstance(g, (int, float)) else g):
                            self.assertTrue(0.5 <= x <= 4.0, (game, loc, sp["model"], g))
                    if game == rl["arena"]["game"] and loc == rl["arena"]["location"]:
                        self.assertIn(sp["model"], rl["arena"]["props_allowed"])
                        for it in its:
                            self.assertGreaterEqual(it["at"][2], rl["arena"]["props_min_z_m"])
        self.assertGreater(seen, 0)

    def test_g15_arena_props(self):
        rl = rules.load(DRESS)
        ok = {"dress": {"game": "dr-tox-rise", "location": "trial-53-arena", "layers": {"props": {"models": [
            {"model": "floodlight-housing", "copies": [{"box_lo": [0, 12, 11.2]}]}]}}, "dress_groups": {"models/floodlight-housing": 2}}}
        self.assertTrue(measure.g15_rules(ok, rl)["pass"])
        low = json.loads(json.dumps(ok))
        low["dress"]["layers"]["props"]["models"][0]["copies"][0]["box_lo"][2] = 0.0
        self.assertFalse(measure.g15_rules(low, rl)["pass"])
        other = json.loads(json.dumps(ok))
        other["dress"]["layers"]["props"]["models"][0]["model"] = "wooden-chair"
        self.assertFalse(measure.g15_rules(other, rl)["pass"])
        # outside the arena the props layer is an ordinary layer
        me = {"dress": {"game": "man-eater", "location": "rec-room", "layers": {"props": {"models": []}}, "dress_groups": {"models/wooden-chair": 6}}}
        self.assertTrue(measure.g15_rules(me, rl)["pass"])


class Placements(unittest.TestCase):
    """Checks on three placements fixed after review: the dashboard's finished face, the shutter's height and the
    floodlight housings' mounting. Model boxes are the GLBs' own (Blender import); scene numbers are the build's pieces."""

    @staticmethod
    def spec(game, loc, model):
        with open(os.path.join(DRESS, game + ".dress.json"), encoding="utf-8") as f:
            cfg = json.load(f)
        return next(sp for sp in cfg["locations"][loc]["props"] if sp["model"] == model)

    def copies(self, sp, lo, hi):
        dims = [hi[i] - lo[i] for i in range(3)]
        s = modelplace.axis_scale(dims, sp)
        out = []
        for it in modelplace.expand_items(sp):
            r = modelplace.rotation_of(sp, it)
            wlo, whi, _ = modelplace.world_box(lo, hi, s, r, it["at"])
            out.append((s, r, wlo, whi))
        return out

    def test_dashboard_faces_the_seat(self):
        # the gauges, radio and glovebox lid are on the model's +Y side; the seat is at y 1.775, the dash at y 2.665
        sp = self.spec("man-eater", "truck-cab", "dashboard")
        for s, r, wlo, whi in self.copies(sp, [-0.95, -0.65, 0.0], [0.95, 0.65, 0.968]):
            face = modelplace._mul(modelplace.euler_matrix(r), [0, 1, 0])
            self.assertLess(face[1], -0.99)

    def test_shutter_half_down(self):
        # bay opening 6 x 4.2 m (lintel underside at z 4.2); the curtain hangs from the lintel to half height, and its
        # slats are squashed no more than to about real slat pitch (scale >= 0.3 of the model's 5.64 m face)
        sp = self.spec("man-eater", "cold-store", "roller-shutter-door")
        for s, r, wlo, whi in self.copies(sp, [-3.0, -3.01, 0.0], [3.0, 3.01, 5.641]):
            self.assertAlmostEqual(whi[2], 4.2, places=2)
            self.assertAlmostEqual(wlo[2], 2.1, places=2)
            self.assertGreaterEqual(s[2], 0.3)
            self.assertAlmostEqual(whi[0] - wlo[0], 6.0, places=2)
        self.assertIs(sp.get("cast_shadow"), False)  # the scene's bay daylight is kept as it was

    def test_floodlights_meet_the_ceiling_on_the_beam(self):
        # ceiling underside z 12.0; flood lights at (0, +-12, 11) aimed at the origin; the lens is the model's +Z face
        sp = self.spec("dr-tox-rise", "trial-53-arena", "floodlight-housing")
        cps = self.copies(sp, [-0.3, -0.3, 0.0], [0.3, 0.3, 0.551])
        self.assertEqual(len(cps), 2)
        for s, r, wlo, whi in cps:
            self.assertGreaterEqual(whi[2], 12.0)          # touches the ceiling ...
            self.assertLessEqual(whi[2], 12.06)            # ... sunk a few cm into the slab, not through it
            self.assertLess(abs(whi[1]), 15.0)             # inside the walls
            c = [(wlo[i] + whi[i]) / 2 for i in range(3)]
            ly = 12.0 if c[1] > 0 else -12.0
            aim = [0.0, -ly, -11.0]
            n = math.sqrt(sum(a * a for a in aim))
            aim = [a / n for a in aim]
            lens = modelplace._mul(modelplace.euler_matrix(r), [0, 0, 1])
            self.assertGreater(sum(lens[i] * aim[i] for i in range(3)), math.cos(math.radians(5)))
            # the housing's centre lies on the light's beam axis, behind the light
            v = [c[0], c[1] - ly, c[2] - 11.0]
            t = sum(v[i] * aim[i] for i in range(3))
            self.assertLess(t, 0.0)
            off = [v[i] - t * aim[i] for i in range(3)]
            self.assertLess(math.sqrt(sum(o * o for o in off)), 0.1)


class Rebuild3(unittest.TestCase):
    """The three models rebuilt with Higgsfield (2026-11-24). The GLBs are fitted to real size with the bottom centre at the
    origin and the front on -Y, so their boxes are the size asked for; scene numbers are the build's pieces and cameras."""
    spec = staticmethod(Placements.spec)
    copies = Placements.copies

    def test_washers_face_the_room_clear_of_the_side_table(self):
        sp = self.spec("man-eater", "laundry", "drum-washing-machine")
        self.assertEqual(sorted(sp["hide_pieces"]), ["drum-1", "drum-2", "drum-3", "drum-4"])
        cps = self.copies(sp, [-0.475, -0.475, 0.0], [0.475, 0.475, 1.1])
        self.assertEqual(len(cps), 4)
        views = {"camera": ([2.0, -2.4, 2.05], [-3.7, 0.0, 1.3], 24)}
        ys = []
        for s, r, wlo, whi in cps:
            self.assertTrue(close(modelplace.front_dir(r), [-1, 0, 0]))  # the porthole door looks into the room
            self.assertLess(whi[0], 4.0)                                  # east wall inner face at x 4.005
            self.assertGreater(wlo[1], -2.0 - 1e-9)                        # the side table ends at y -2.0
            self.assertLess(whi[1], 3.0)                                   # north wall inner face at y 3.005
            self.assertEqual(modelplace.clearance(wlo, whi, views), [])
            ys.append((wlo[1], whi[1]))
        ys.sort()
        for (lo1, hi1), (lo2, hi2) in zip(ys, ys[1:]):
            self.assertGreater(lo2 - hi1, 0.2)                             # a gap between machines

    def test_truck_door_hinged_at_the_front_pillar_and_clear_of_the_camera(self):
        sp = self.spec("man-eater", "truck-cab", "truck-door")
        self.assertEqual(sp["hide_pieces"], ["door-open"])
        (s, r, wlo, whi), = self.copies(sp, [-0.5, -0.138, 0.0], [0.5, 0.138, 1.3])
        R = modelplace.euler_matrix(r)
        c = [(wlo[i] + whi[i]) / 2 for i in range(3)]
        edge = modelplace._mul(R, [-0.5, 0.0, 0.0])  # the hinges are on the model's -X edge
        hinge = [c[i] + edge[i] for i in range(3)]
        self.assertLess(abs(hinge[0] - 0.25), 0.01)   # the cab's open side, x 0.25
        self.assertLess(abs(hinge[1] - 2.85), 0.01)   # its front edge (windscreen at y 2.83)
        out = modelplace.front_dir(r)                 # outer face (handle side) turned out and forward: swung open
        self.assertLess(out[0], -0.4)
        self.assertGreater(out[1], 0.7)
        self.assertAlmostEqual(wlo[2], 1.05)          # the bottom edge at the cab floor (top 1.04)
        views = {"camera": ([-0.55, 1.9, 1.98], [1.7, 2.4, 1.5], 24)}
        self.assertEqual(modelplace.clearance(wlo, whi, views), [])

    def test_crate_table_top_carries_the_notebook_and_phone(self):
        sp = self.spec("missing-campsites", "tam-flat", "crate-coffee-table")
        self.assertEqual(sp["hide_pieces"], ["crate-table"])
        (s, r, wlo, whi), = self.copies(sp, [-0.4, -0.3, 0.0], [0.4, 0.3, 0.45])
        self.assertAlmostEqual(whi[2], 0.45)                      # the notebook and phone props rest at z 0.45
        self.assertAlmostEqual(whi[1] - wlo[1], 0.8)              # long side along y, like the build's box
        self.assertAlmostEqual(whi[0] - wlo[0], 0.6)
        for p in ([-0.95, -2.3], [-0.6, -2.0]):                   # both props stand on the top
            self.assertTrue(wlo[0] < p[0] < whi[0] and wlo[1] < p[1] < whi[1])


class PropGates(unittest.TestCase):
    T = dict(measure.PLAN)

    def setUp(self):
        import numpy as np
        from dress import propgates
        self.np, self.pg = np, propgates

    def test_grow_and_region(self):
        np, pg = self.np, self.pg
        m = np.zeros((20, 20), bool)
        m[10, 10] = True
        self.assertEqual(int(pg.grow(m, 2).sum()), 25)
        bids = np.zeros((20, 20), np.int32)
        aids = np.zeros((20, 20), np.int32)
        bids[0:4, 0:4] = 1   # the hidden piece, before
        aids[0:5, 0:5] = 2   # the model, after
        aids[15:18, 15:18] = 3  # an unrelated prop
        u = pg.changed_region(bids, {"piece:box": 1}, aids, {"dress:models/m": 2, "prop:p": 3}, ["dress:models/m"], ["piece:box"], [], r=0)
        self.assertEqual(int(u.sum()), 25)
        self.assertFalse(u[16, 16])

    def test_rest_gates(self):
        b = {"n": 5000, "mean": 0.4, "median": 0.4, "p01": 0.1, "p5": 0.2, "p95": 0.6, "dark": 0.0, "lab": [50.0, 0.0, 0.0]}
        same = self.pg.rest_gates(b, dict(b), self.T)
        self.assertTrue(all(g["pass"] for g in same))
        dark = dict(b, mean=0.3, median=0.3, p01=0.0, dark=0.02, lab=[40.0, 0.0, 0.0], p95=0.5)
        res = {g["gate"]: g["pass"] for g in self.pg.rest_gates(b, dark, self.T)}
        self.assertEqual(res, {"G2r": False, "G3r": False, "G4ar": False, "G4br": False, "G6br": False})
        self.assertIsNone(self.pg.rest_gates(dict(b, n=10), b, self.T)[0]["pass"])
        self.assertIsNone(self.pg.rest_gates(b, dark, self.T, share=0.05)[0]["pass"])  # the model fills the view
        night = dict(b, median=0.001)
        self.assertTrue(self.pg.rest_gates(night, dict(night, median=0.004), self.T)[0]["pass"])  # 0.003 on a black median is noise

    def test_prop_gates(self):
        np, pg = self.np, self.pg
        bids = np.zeros((60, 60), np.int32)
        bids[10:40, 10:40] = 1
        aids = bids.copy()
        Lb = np.full((60, 60), 0.3)
        La = Lb.copy()
        leg = {"prop:p": 1}
        g = {x["gate"]: x for x in pg.prop_gates(Lb, bids, leg, La, aids, leg, [], "prop:p", "prop:p", set(), set(), self.T, min_px=100)}
        self.assertTrue(g["G10a'"]["pass"] and g["G11m"]["pass"] and g["G10b'"]["pass"])
        # a model now covers a third of the prop and the light on what is left is unchanged: G10a' fails, G11m passes
        aids2 = aids.copy()
        aids2[10:40, 10:20] = 2
        g = {x["gate"]: x for x in pg.prop_gates(Lb, bids, leg, La, aids2, dict(leg, **{"dress:models/m": 2}), [], "prop:p", "dress:models/m",
                                                 set(), {"dress:models/m"}, self.T, min_px=100)}
        self.assertFalse(g["G10a'"]["pass"])
        self.assertTrue(g["G11m"]["pass"])
        self.assertFalse(g["G10b'"]["pass"])  # the model took the look-at point of a view that looked at the prop
        # the prop darkened by 20 %: G11m fails
        g = {x["gate"]: x for x in pg.prop_gates(Lb, bids, leg, La * 0.8, aids, leg, [], "prop:p", "prop:p", set(), set(), self.T, min_px=100)}
        self.assertFalse(g["G11m"]["pass"])
        # the look-at object was the replaced box: the change passes
        g = {x["gate"]: x for x in pg.prop_gates(Lb, bids, leg, La, aids, leg, [], "piece:box", "dress:models/m", {"piece:box"},
                                                 {"dress:models/m"}, self.T, min_px=100)}
        self.assertTrue(g["G10b'"]["pass"])
        # a swapped prop (box proxy -> model) is left out of G10a' and G11m
        g = {x["gate"]: x for x in pg.prop_gates(Lb, bids, leg, La * 0.5, aids2 * 0, leg, ["prop:p"], None, None, set(), set(), self.T)}
        self.assertTrue(g["G10a'"]["pass"])
        self.assertIsNone(g["G11m"]["pass"])


if __name__ == "__main__":
    unittest.main()
