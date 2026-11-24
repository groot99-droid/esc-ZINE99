"""Tests that run without Blender: python -m unittest discover -s tools/render/dress/tests -t tools/render  (needs numpy; Pillow optional)."""
import json
import math
import os
import sys
import tempfile
import unittest

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DRESS = os.path.dirname(HERE)
sys.path.insert(0, os.path.dirname(DRESS))

from dress import gains, measure, placement, rules, seeds  # noqa: E402


class Seeds(unittest.TestCase):
    def test_stable(self):
        self.assertEqual(seeds.seed_for("a", "b", 3), seeds.seed_for("a/b/3"))
        self.assertEqual(seeds.short_hash({"b": 1, "a": 2}), seeds.short_hash({"a": 2, "b": 1}))
        self.assertNotEqual(seeds.seed_for("x"), seeds.seed_for("y"))
        r1, r2 = seeds.rng("k"), seeds.rng("k")
        self.assertEqual([r1.random() for _ in range(5)], [r2.random() for _ in range(5)])
        self.assertTrue(0.0 <= seeds.unit("k") < 1.0)


class Placement(unittest.TestCase):
    def setUp(self):
        self.cone = placement.view_cone((0, 0, 1.6), (0, 10, 1.6), 35.0)

    def test_deterministic_and_shared(self):
        rect = (-30, -30, 30, 30)
        a = placement.place("s", rect, 0.0, 50, [self.cone], 25)
        b = placement.place("s", rect, 0.0, 50, [self.cone], 25)
        self.assertEqual(a, b)
        # a second view that sees more of the surface returns the same point for every cell both see
        wide = placement.view_cone((0, 0, 1.6), (0, 10, 1.6), 18.0)
        c = placement.place("s", rect, 0.0, 50, [wide], 25)
        key = lambda p: (round(p["x"], 6), round(p["y"], 6))
        self.assertTrue({key(p) for p in a} <= {key(p) for p in c})

    def test_density_and_culling(self):
        rect = (-50, -50, 50, 50)
        pts = placement.place("d", rect, 0.0, 100, [placement.view_cone((0, -45, 1.6), (0, 45, 1.6), 24.0, margin_deg=89)], 200, limit=20000, thin_far=1.0)
        self.assertGreater(len(pts), 9000)  # 100 per 100 m2 over almost the whole 100x100 m surface
        self.assertLess(len(pts), 10100)
        behind = placement.place("d", rect, 0.0, 100, [self.cone], 40)
        self.assertTrue(all(p["y"] > -1.6 for p in behind))  # nothing behind the camera beyond the 1.5 m near zone

    def test_obstacles_and_keepouts(self):
        rect = (-10, -10, 10, 10)
        wide = placement.view_cone((0, -9, 1.6), (0, 9, 1.6), 18.0, margin_deg=60)
        free = placement.place("o", rect, 0.0, 200, [wide], 30)
        cut = placement.place("o", rect, 0.0, 200, [wide], 30, obstacles=[(-2, -2, 2, 2)], keepouts=[(5, 5, 1.0)])
        self.assertLess(len(cut), len(free))
        self.assertFalse(any(-2 <= p["x"] <= 2 and -2 <= p["y"] <= 2 for p in cut))
        self.assertFalse(any(math.hypot(p["x"] - 5, p["y"] - 5) <= 1.0 for p in cut))

    def test_corridor(self):
        ko = placement.corridor_keepouts((0, 0, 1.6), (0, 10, 1.6), step=1.0, radius=0.3, length=4.0)
        self.assertEqual(len(ko), 5)
        self.assertAlmostEqual(ko[-1][1], 4.0)


class Rules(unittest.TestCase):
    def setUp(self):
        self.r = rules.load(DRESS)

    def test_arena_and_man_eater(self):
        self.assertEqual(rules.allowed_layers(self.r, "dr-tox-rise", "trial-53-arena"), ["surfaces"])
        self.assertNotIn("decals", rules.allowed_layers(self.r, "man-eater", "gate-yard"))
        self.assertIn("scatter", rules.allowed_layers(self.r, "stuffed-ones", "cabin-living-room"))
        self.assertEqual(rules.allowed_layers(self.r, "stuffed-ones", "x", ["kits", "surfaces"]), ["surfaces", "kits"])

    def test_words_and_band(self):
        self.assertEqual(rules.banned_hits(self.r, "hand-rail_01"), ["hand"])
        self.assertEqual(rules.banned_hits(self.r, "old_wood_floor"), [])
        self.assertTrue(rules.in_red_brown_band(self.r, (0.55, 0.15, 0.12)))
        self.assertFalse(rules.in_red_brown_band(self.r, (0.3, 0.45, 0.5)))
        self.assertFalse(rules.in_red_brown_band(self.r, (0.5, 0.45, 0.42)))  # low saturation brown-grey is allowed

    def test_configs_have_no_banned_words_or_red_brown_stains(self):
        for fn in os.listdir(DRESS):
            if fn.endswith(".dress.json"):
                with open(os.path.join(DRESS, fn), encoding="utf-8") as f:
                    txt = json.load(f)
                for loc in txt["locations"].values():
                    for d in loc.get("decals", []):
                        self.assertFalse(rules.in_red_brown_band(self.r, d["tint"]), fn)


class Images(unittest.TestCase):
    def test_blur_and_energy(self):
        rng = np.random.default_rng(1)
        L = rng.random((120, 160))
        self.assertLess(measure.blur(L, 4.0).std(), L.std() * 0.2)
        flat = np.full((120, 160), 0.5)
        self.assertAlmostEqual(measure.band_energy(flat), 0.0, places=12)
        self.assertGreater(measure.band_energy(L), measure.band_energy(measure.blur(L, 1.5)))

    def test_erode(self):
        m = np.zeros((20, 20), bool)
        m[5:15, 5:15] = True
        e = measure.erode(m, 2)
        self.assertEqual(int(e.sum()), 6 * 6)

    def test_lab_and_hue(self):
        grey = measure.srgb_to_lab(np.full((2, 2, 3), 0.5))
        self.assertAlmostEqual(float(grey[0, 0, 1]), 0.0, places=2)
        red = np.zeros((40, 40, 3))
        red[..., 0] = 0.8
        self.assertTrue(abs(measure.palette_hues(red)[0] - 40) < 25)
        self.assertEqual(measure.foreign_share(red, [40.0]), 0.0)
        self.assertGreater(measure.foreign_share(red, [200.0]), 0.9)

    def test_tiling_detector_control(self):
        """G8: a tile repeated 4 x 4 must read above 0.5; independent noise must read well below the 0.20 gate."""
        rng = np.random.default_rng(7)
        tile = measure.blur(rng.random((64, 64)), 1.2)
        periodic = np.tile(tile, (4, 4))
        full = np.ones(periodic.shape, bool)
        self.assertGreater(measure.tiling_peak(periodic, full), 0.5)
        noise = measure.blur(rng.random((256, 256)), 1.2)
        self.assertLess(measure.tiling_peak(noise, full), 0.2)

    def test_g8_control_on_a_real_scan_when_cached(self):
        p = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(DRESS))), "build", "dress-cache", "textures", "old_wood_floor", "old_wood_floor_diff_1k.jpg")
        if not os.path.exists(p):
            self.skipTest("scan cache not present")
        self.assertGreater(measure.g8_positive_control(p), 0.5)


class Gates(unittest.TestCase):
    def _scene(self, ihash="aaa", seconds=10.0, groups=None):
        return {"stills": [{"still": "camera", "intent_hash": ihash, "seconds": seconds, "vram_peak_mib": 3000,
                            "dress_view": {"rays": [], "lens_mm": 35, "dress_min_dist_m": 2.0}}],
                "checks": {"camera_inside": []}, "stats": {"unique_tris": 1000, "expanded_tris": 2000, "texture_bytes": 1000},
                "dress": {"dressed_pieces": ["floor"], "textures": {}, "materials": {}, "piece_materials": {}, "piece_geom": {},
                          "dress_within_0.3m_of_camera": 0}}

    def _m(self, luma=0.4, energy=1e-5, dark=0.01):
        g = {"piece:floor": {"area": 0.3, "luma": luma, "lab": [50, 0, 0], "energy": energy}}
        return {"still": "camera", "size": [640, 360], "mean_luma": luma, "median_luma": luma, "p01_luma": 0.05, "dark_share": dark, "specks": 0,
                "lab_mean": [50, 0, 0], "luma_spread": 0.3, "foreign_share": 0.0, "groups": g, "dress_share": 0.0, "centre_group": "piece:floor"}

    def test_clean_pair_passes_and_changes_fail(self):
        res = {r["gate"]: r for r in measure.compare(self._m(), self._m(energy=3e-5), self._scene(), self._scene())}
        self.assertTrue(res["G1"]["pass"])
        self.assertTrue(res["G2"]["pass"])
        self.assertTrue(res["G7"]["pass"])  # gain 3
        bad = {r["gate"]: r for r in measure.compare(self._m(), self._m(luma=0.2, energy=1.1e-5, dark=0.2), self._scene(), self._scene("bbb"))}
        self.assertFalse(bad["G1"]["pass"])
        self.assertFalse(bad["G2"]["pass"])
        self.assertFalse(bad["G4a"]["pass"])
        self.assertFalse(bad["G7"]["pass"])  # gain 1.1 is under 2

    def test_hygiene_scan_flags_paths_and_mail(self):
        with tempfile.TemporaryDirectory() as d:
            ok, bad = os.path.join(d, "ok.txt"), os.path.join(d, "bad.txt")
            open(ok, "w").write("relative/path.json and nothing else\n")
            open(bad, "w").write("see C:\\work\\thing and someone" "@example.com and /ho" "me/someone/x\n")
            self.assertTrue(measure.g16_hygiene([ok])["pass"])
            self.assertFalse(measure.g16_hygiene([bad])["pass"])

    def test_g15_rules(self):
        r = rules.load(DRESS)
        arena = {"dress": {"game": "dr-tox-rise", "location": "trial-53-arena", "layers": {"surfaces": {}, "scatter": {}}}}
        self.assertFalse(measure.g15_rules(arena, r)["pass"])
        fine = {"dress": {"game": "stuffed-ones", "location": "x", "layers": {"scatter": {}}, "materials": {"worn-pine": {}}, "textures": {"old_wood_floor": {}}}}
        self.assertTrue(measure.g15_rules(fine, r)["pass"])

    def test_g17(self):
        a = {"dress": {"manifest_hash": "x"}}
        self.assertTrue(measure.g17_rerun({"mean_luma": 0.3}, {"mean_luma": 0.3}, a, a)["pass"])
        self.assertFalse(measure.g17_rerun({"mean_luma": 0.3}, {"mean_luma": 0.31}, a, a)["pass"])


class Lock(unittest.TestCase):
    def test_lock_records_licence_and_md5(self):
        with open(os.path.join(DRESS, "dress.lock.json"), encoding="utf-8") as f:
            lk = json.load(f)
        self.assertGreater(len(lk["assets"]), 40)
        for name, a in lk["assets"].items():
            self.assertEqual(a["licence"], "CC0-1.0", name)
            self.assertTrue(a["mean_albedo_linear"] or a["albedo_file"] is None, name)
            for f, rec in a["files"].items():
                self.assertEqual(len(rec["md5"]), 32)
                # an old scan matched the cave lock, a newer one the md5 list of its approval (None where that list has no entry)
                self.assertNotEqual(rec.get("matches_cave_lock", rec.get("matches_given_md5")), False, f)
        self.assertEqual(len(lk["hdris"]), 6)
        self.assertEqual(len(lk["models"]), 5)
        for h in list(lk["hdris"].values()) + list(lk["models"].values()):
            self.assertEqual(h["licence"], "CC0-1.0")


class R1Cluster(unittest.TestCase):
    def test_cluster_stable_bounded_and_clear(self):
        pts = [{"x": 0.0, "y": 0.0, "z": 0.0, "v": 0.1, "s": 0.5, "r": 0.2, "d": 3.0}, {"x": 4.0, "y": 1.0, "z": 0.0, "v": 0.7, "s": 0.2, "r": 0.9, "d": 5.0}]
        cl = {"min": 2, "max": 6, "radius_m": 0.6}
        a = placement.cluster(pts, cl, 1.0, (-10, -10, 10, 10), salt="t")
        b = placement.cluster(pts, cl, 1.0, (-10, -10, 10, 10), salt="t")
        self.assertEqual(a, b)
        self.assertEqual(a[:2], pts)
        self.assertGreaterEqual(len(a), 2 + 2 * 2 - 4)  # satellites may fall outside; most stay
        for q in a[2:]:
            near = min(math.hypot(q["x"] - p["x"], q["y"] - p["y"]) for p in pts)
            self.assertLessEqual(near, 1.25 * 0.6 + 1e-9)
        cut = placement.cluster(pts, cl, 1.0, (-10, -10, 10, 10), obstacles=[(-1, -1, 1, 1)], keepouts=[(4, 1, 1.0)], salt="t")
        for q in cut[2:]:
            self.assertFalse(-1 <= q["x"] <= 1 and -1 <= q["y"] <= 1)
            self.assertGreater(math.hypot(q["x"] - 4, q["y"] - 1), 1.0)
        inside = placement.cluster(pts, cl, 1.0, (-0.1, -0.1, 0.1, 0.1), salt="t")
        self.assertTrue(all(-0.1 <= q["x"] <= 0.1 and -0.1 <= q["y"] <= 0.1 for q in inside[2:]))


class R1RectDist(unittest.TestCase):
    def test_rect_dist(self):
        r = (0, 0, 2, 1)
        self.assertEqual(placement.rect_dist(1, 0.5, r), 0.0)
        self.assertAlmostEqual(placement.rect_dist(3, 0.5, r), 1.0)
        self.assertAlmostEqual(placement.rect_dist(-3, -4, r), 5.0)


class R1Gains(unittest.TestCase):
    def test_lab_roundtrip(self):
        for rgb in ([0.5, 0.4, 0.3], [0.2, 0.3, 0.6], [0.9, 0.9, 0.9]):
            lab = measure.srgb_to_lab(np.array([[rgb]], dtype=np.float64))[0, 0]
            lin = gains.lab_to_linear(lab)
            srgb = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * lin ** (1 / 2.4) - 0.055)
            self.assertTrue(np.allclose(srgb, rgb, atol=2e-3), (rgb, srgb))

    def _lab(self, rgb):
        return [float(x) for x in measure.srgb_to_lab(np.array([[rgb]], dtype=np.float64))[0, 0]]

    def test_suggest_darker_and_warmer(self):
        before = self._lab([0.6, 0.6, 0.6])
        after = self._lab([0.45, 0.43, 0.38])  # darker and yellower after dressing
        s = gains.suggest([("g", "l", "wall", 0.2, before, after)], damp=1.0)["g"]["l"]["wall"]
        self.assertGreater(s["gain"], 1.3)
        self.assertGreater(s["tint"][2], s["tint"][0])  # the tint pulls blue back up
        self.assertAlmostEqual(0.2126 * s["tint"][0] + 0.7152 * s["tint"][1] + 0.0722 * s["tint"][2], 1.0, delta=0.03)
        same = gains.suggest([("g", "l", "w", 0.2, before, before)])["g"]["l"]["w"]
        self.assertAlmostEqual(same["gain"], 1.0, places=4)
        clamp = gains.suggest([("g", "l", "w", 0.2, self._lab([0.9, 0.9, 0.9]), self._lab([0.05, 0.05, 0.05]))])["g"]["l"]["w"]
        self.assertLessEqual(clamp["gain"], 1.6)

    def test_apply_multiplies_and_skips(self):
        with tempfile.TemporaryDirectory() as d:
            cfg = {"game": "g", "locations": {"l": {"materials": {"wall": {"family": "scan", "gain": 1.1}, "glass": {"family": "dirt-only"}},
                                                    "pieces": {"stair": {"family": "scan"}}}}}
            with open(os.path.join(d, "g.dress.json"), "w") as f:
                json.dump(cfg, f)
            sug = {"g": {"l": {"wall": {"gain": 1.2, "tint": [1.0, 1.0, 1.05]}, "glass": {"gain": 1.5, "tint": [1, 1, 1]},
                               "worn@stair": {"gain": 0.9, "tint": [1, 1, 1]}, "tiny": {"gain": 1.001, "tint": [1, 1, 1]}}}}
            ch = gains.apply(sug, d)
            with open(os.path.join(d, "g.dress.json")) as f:
                out = json.load(f)["locations"]["l"]
            self.assertAlmostEqual(out["materials"]["wall"]["gain"], 1.32, places=3)
            self.assertEqual(out["materials"]["wall"]["tint"], [1.0, 1.0, 1.05])
            self.assertNotIn("gain", out["materials"]["glass"])
            self.assertAlmostEqual(out["pieces"]["stair"]["gain"], 0.9)  # another material's piece: no inheritance
            cfg2 = {"game": "h", "locations": {"l": {"materials": {"wall": {"family": "scan", "gain": 1.2, "tint": [1.0, 1.0, 1.1]}},
                                                     "pieces": {"north": {"family": "scan", "bump": 0.1}}}}}
            with open(os.path.join(d, "h.dress.json"), "w") as f:
                json.dump(cfg2, f)
            gains.apply({"h": {"l": {"wall@north": {"gain": 0.5, "tint": [1.0, 1.0, 1.0]}}}}, d)
            with open(os.path.join(d, "h.dress.json")) as f:
                n = json.load(f)["locations"]["l"]["pieces"]["north"]
            self.assertAlmostEqual(n["gain"], 0.6)  # starts from the material's 1.2
            self.assertEqual(n["tint"], [1.0, 1.0, 1.1])
            self.assertEqual(len(ch), 2)


class R1Configs(unittest.TestCase):
    def test_pilot_configs_use_locked_assets_and_known_options(self):
        with open(os.path.join(DRESS, "dress.lock.json"), encoding="utf-8") as f:
            lk = json.load(f)
        fams = {"scan", "noise", "grid", "wallpaper", "metal", "tissue", "foliage", "membrane", "water", "dirt-only", "keep"}
        for game in ("dr-tox-rise", "stuffed-ones", "missing-campsites", "heartstream"):
            with open(os.path.join(DRESS, game + ".dress.json"), encoding="utf-8") as f:
                cfg = json.load(f)
            for loc, L in cfg["locations"].items():
                ents = list(L.get("materials", {}).values()) + list(L.get("pieces", {}).values())
                ents += [s.get("surface", {}) for s in L.get("scatter", [])] + [k.get("surface", {}) for k in L.get("kits", [])]
                for e in ents:
                    if e.get("family"):
                        self.assertIn(e["family"], fams, (game, loc, e))
                    for sc in (e.get("scan"), (e.get("detail_scan") or {}).get("scan")):
                        if sc:
                            self.assertIn(sc, lk["assets"], (game, loc, sc))
                    if e.get("overlay"):  # a generated image: locked, costed, never claimed as CC0
                        g = lk["generated"][e["overlay"]["image"]]
                        self.assertNotIn("CC0", g["licence"].replace("not CC0", ""))
                        self.assertGreater(g["cost_credits"], 0)
                        self.assertEqual(len(g["files"][g["albedo_file"]]["md5"]), 32)
                    if e.get("displace_m"):
                        self.assertLessEqual(e["displace_m"], 0.3)
                        self.assertLessEqual(e.get("subdiv", 6), 6)
                for s in L.get("scatter", []):
                    for m in s.get("models", []):
                        self.assertIn(m["name"], lk["models"])
                    if s["kind"] == "model":
                        self.assertTrue(s.get("avoid_materials") and s.get("sightlines_m"))
                hz = (L.get("atmos") or {}).get("haze")
                if hz:
                    self.assertLessEqual(hz["density"], 0.03)
                tg = L.get("grime", {}).get("tone_gain", 1.0)
                for e in ents:  # the effective albedo gain stays a correction, not a relight
                    if e.get("family") not in (None, "keep", "water", "dirt-only"):
                        self.assertTrue(0.5 <= tg * e.get("gain", 1.0) <= 1.5, (game, loc, e.get("family"), tg, e.get("gain")))
                    tr = e.get("trunks")
                    if tr:  # forest-block stems: dark gaps of bounded strength and width, so the mean tone holds
                        self.assertEqual(e["family"], "foliage")
                        self.assertTrue(0.0 < tr.get("dark", 0.45) <= 0.6 and 0.1 <= tr.get("width", 0.35) <= 0.6 and tr.get("spacing_m", 1.6) > 0.3)

    def test_g14_needs_a_physical_join(self):
        from dress import measure
        pads = {"center": [0.0, -60.0, 0.025], "size": [210.0, 12.0, 0.05]}  # loop road: they meet only in the picture
        end = {"center": [-112.0, 0.0, 0.03], "size": [5.0, 145.0, 0.06]}
        self.assertAlmostEqual(measure.box_gap(pads, end), 4.5, places=6)
        touching = {"center": [-107.5, -60.0, 0.025], "size": [5.0, 12.0, 0.05]}
        self.assertEqual(measure.box_gap(pads, touching), 0.0)
        dr = {"piece_geom": {"pads": pads, "end": end, "near": touching}, "piece_materials": {"pads": "gravel", "end": "gravel", "near": "gravel"}}
        ma = {"joins": {"piece:pads|piece:end": {"step": 0.4, "n": 99}, "piece:pads|piece:near": {"step": 0.01, "n": 99}}}
        g = measure._g_seams(dr, {"joins": {}}, ma, {"g14_step": 0.06})
        self.assertTrue(g["pass"])
        ma["joins"]["piece:pads|piece:near"]["step"] = 0.3
        self.assertFalse(measure._g_seams(dr, {"joins": {}}, ma, {"g14_step": 0.06})["pass"])

    def test_trunk_bands_keep_the_mean(self):
        """materials.fam_foliage: value x ((1 + dark/2) - dark x band), band a symmetric 0..1 ramp around 0.5: mean factor 1."""
        import random
        rnd = random.Random(7)
        for dark in (0.2, 0.45, 0.6):
            for width in (0.2, 0.35, 0.6):
                lo, hi = 0.5 - width / 2, 0.5 + width / 2
                xs = [rnd.random() for _ in range(40000)]  # a symmetric stand-in for the noise
                band = [min(1.0, max(0.0, (x - lo) / (hi - lo))) for x in xs]
                m = sum((1 + dark / 2) - dark * b for b in band) / len(band)
                self.assertAlmostEqual(m, 1.0, delta=0.01)


if __name__ == "__main__":
    unittest.main()


def test_r2_patch_and_jitter_are_stable_and_thin():
    from dress import placement
    cone = placement.view_cone((0, 0, 1.6), (10, 0, 1.6), 24)
    a = placement.place("t/grass", (0, -10, 30, 10), 0.0, 900, [cone], 25.0)
    b = placement.place("t/grass", (0, -10, 30, 10), 0.0, 900, [cone], 25.0, patch={"scale_m": 1.6, "cut": 0.45}, jitter=1.6)
    c = placement.place("t/grass", (0, -10, 30, 10), 0.0, 900, [cone], 25.0, patch={"scale_m": 1.6, "cut": 0.45}, jitter=1.6)
    assert b == c
    assert 0.2 * len(a) < len(b) < 0.8 * len(a)
    assert all(0.0 <= placement.value_noise("s", x * 0.37, x * 0.11, 2.0) <= 1.0 for x in range(200))

