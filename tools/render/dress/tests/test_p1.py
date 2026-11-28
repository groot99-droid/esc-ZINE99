"""P1 (core surfaces and grime) generator checks; no Blender needed.  python -W ignore tools/render/dress/tests/test_p1.py"""
import colorsys
import json
import os
import sys
import unittest

DRESS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(DRESS))
from dress import p1  # noqa: E402


def _cfg(game):
    with open(os.path.join(DRESS, game + ".dress.json"), encoding="utf-8") as f:
        return json.load(f)


GAMES = sorted(f[:-11] for f in os.listdir(DRESS) if f.endswith(".dress.json"))
PILOT = {("dr-tox-rise", "hospital-room"), ("stuffed-ones", "cabin-living-room"), ("missing-campsites", "loop-road"),
         ("heartstream", "marrow-caverns")}


class P1(unittest.TestCase):
    def test_presets_use_only_the_p1_cache(self):
        with open(os.path.join(DRESS, "dress.lock.json"), encoding="utf-8") as f:
            lk = json.load(f)
        for name, e in p1.PRESETS.items():
            if e.get("scan"):
                self.assertIn(e["scan"], p1.P1_SCANS, name)
                self.assertIn(e["scan"], lk["assets"], name)
        for g in GAMES:
            for loc, L in _cfg(g)["locations"].items():
                if not L.get("p1"):
                    continue
                for m, e in L["materials"].items():
                    if e.get("scan"):
                        self.assertIn(e["scan"], p1.P1_SCANS, (g, loc, m))

    def test_pilot_places_left_alone(self):
        for g, loc in PILOT:
            L = _cfg(g)["locations"][loc]
            self.assertNotIn("p1", L)
            self.assertTrue(L["materials"])

    def test_props_entries_kept(self):
        L = _cfg("man-eater")["locations"]["laundry"]
        self.assertTrue(L.get("props"))
        self.assertTrue(L.get("p1"))

    def test_no_decals_in_man_eater_or_arena(self):
        for loc, L in _cfg("man-eater")["locations"].items():
            self.assertNotIn("decals", L, loc)
        self.assertNotIn("decals", _cfg("dr-tox-rise")["locations"]["trial-53-arena"])

    def test_man_eater_rust_outside_stain_band(self):
        with open(os.path.join(DRESS, "rules.json"), encoding="utf-8") as f:
            band = json.load(f)["man_eater"]["stain_hue_band_deg"]
        for loc, L in _cfg("man-eater")["locations"].items():
            for m, e in L.get("materials", {}).items():
                for k in ("rust", "streaks", "cracks"):
                    if k in e:
                        r, g_, b = e[k].get("tint", [1, 1, 1])
                        h, _l, s = colorsys.rgb_to_hls(r, g_, b)
                        hd = h * 360
                        inband = hd >= band[0] or hd <= band[1]
                        self.assertFalse(inband and s > 0.4 and (r > g_ * 1.6), (loc, m, k, hd, s))

    def test_deferred_phases_not_dressed(self):
        for g in GAMES:
            for loc, L in _cfg(g)["locations"].items():
                if not L.get("p1"):
                    continue
                for ph, names in L["p1"]["deferred"].items():
                    for n in names:
                        self.assertNotIn(n, L["materials"], (g, loc, n, ph))

    def test_classifier_examples(self):
        info = lambda roles, em=0.0: {"roles": set(roles), "emission": em, "color": [0.5] * 3, "roughness": 0.8, "metallic": 0, "alpha": 1}
        self.assertEqual(p1.classify("man-eater", "cold-store", "concrete", info(["wall"]))[0], "conc_wall_damp")
        self.assertEqual(p1.classify("man-eater", "gate-yard", "concrete", info(["floor"]))[0], "conc_floor")
        self.assertEqual(p1.classify("lira-calyx", "corporate-lab", "plaster", info(["wall"]))[0], "plaster_clean")
        self.assertIsNone(p1.classify("x", "y", "window", info(["opening"], 2.0))[0])
        self.assertEqual(p1.classify("x", "y", "sea", info(["water"]))[1], "P2 (sky or water)")
        self.assertEqual(p1.classify("people-of-the-bark", "y", "bark-grey", info(["terrain"]))[1], "P5")
        self.assertEqual(p1.classify("endless-temple", "y", "silver-sand", info(["terrain"]))[1], "P5")
        self.assertEqual(p1.classify("lord-of-the-sea", "y", "sand", info(["terrain"]))[0], "sand")

    def test_deterministic(self):
        a = p1.build("behind-the-peephole", None)[0]
        b = p1.build("behind-the-peephole", None)[0]
        self.assertEqual(json.dumps(a, sort_keys=True), json.dumps(b, sort_keys=True))


if __name__ == "__main__":
    unittest.main()
