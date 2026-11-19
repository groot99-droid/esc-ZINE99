"""The book's glyphs: radicals on a counted lattice, and the words built from them."""
# radicals: polylines through lattice points of a box 6 wide and 3 tall
RAD = {
    "needle": [[(0, 2), (4, 2)], [(4, 2), (5, 1), (6, 2), (5, 3), (4, 2)]],
    "thread": [[(0, 0), (1, 1), (2, 0), (3, 1), (4, 0), (5, 1), (6, 0)], [(0, 2), (1, 3), (2, 2), (3, 3), (4, 2), (5, 3), (6, 2)]],
    "knot": [[(3, 0), (4, 1), (3, 2), (2, 1), (3, 0)], [(2, 1), (0, 3)], [(4, 1), (6, 3)], [(3, 2), (3, 3)]],
    "mouth": [[(1, 1), (2, 0), (4, 0), (5, 1), (4, 2), (2, 2), (1, 1)], [(2, 1), (4, 1)], [(3, 2), (3, 3)]],
    "hand": [[(1, 3), (5, 3)], [(1, 3), (1, 1)], [(2, 3), (2, 0)], [(3, 3), (3, 0)], [(4, 3), (4, 0)], [(5, 3), (6, 2)]],
    "house": [[(1, 3), (1, 2), (3, 0), (5, 2), (5, 3), (1, 3)], [(3, 2), (3, 3)]],
    "person": [[(3, 0), (3, 2)], [(1, 1), (5, 1)], [(3, 2), (2, 3)], [(3, 2), (4, 3)]],
    "ring": [[(2, 0), (4, 0), (5, 1), (5, 2), (4, 3), (2, 3), (1, 2), (1, 1), (2, 0)]],
    "warm": [[(1, 3), (3, 1), (5, 3)], [(2, 3), (3, 2), (4, 3)], [(3, 1), (3, 0)]],
    "door": [[(2, 3), (2, 0), (4, 0), (4, 3)], [(0, 3), (6, 3)], [(3, 1), (3, 2)]],
    "bind": [[(0, 0), (3, 3), (6, 0)], [(0, 3), (3, 0), (6, 3)]],
    "seven": [[(i, 0), (i, 2)] for i in range(7)] + [[(0, 3), (6, 3)]],
    "fabric": [[(1, 0), (1, 3)], [(3, 0), (3, 3)], [(5, 0), (5, 3)], [(0, 1), (6, 1)], [(0, 2), (6, 2)]],
    "book": [[(0, 2), (0, 0), (3, 1), (6, 0), (6, 2), (3, 3), (0, 2)], [(3, 1), (3, 3)]],
    "stair": [[(0, 3), (2, 3), (2, 2), (4, 2), (4, 1), (6, 1), (6, 0)]],
    "unpick": [[(0, 1), (1, 1)], [(2, 1), (3, 1)], [(4, 1), (5, 1)], [(1, 3), (2, 2), (3, 3)], [(3, 3), (4, 2), (5, 3)]],
    "still": [[(1, 0), (5, 0), (5, 3), (1, 3), (1, 0)], [(3, 1), (3, 2)]],
    None: [[(3, 1), (4, 2), (3, 3), (2, 2), (3, 1)]],
}

FRONTS = [  # name, role, top, bottom
    ("they", "who", "person", "person"), ("we", "who", "person", "ring"), ("it", "who", "ring", "warm"),
    ("one", "who", "person", "still"), ("you", "who", "person", "hand"), ("guest", "who", "person", "door"),
    ("keeper", "who", "person", "needle"), ("toy", "who", "person", "fabric"),
    ("needle", "thing", "needle", None), ("thread", "thing", "thread", None), ("knot", "thing", "knot", None),
    ("mouth", "thing", "mouth", None), ("hand", "thing", "hand", None), ("house", "thing", "house", None),
    ("door", "thing", "door", None), ("book", "thing", "book", None), ("fabric", "thing", "fabric", None),
    ("seam", "thing", "fabric", "thread"), ("filling", "thing", "ring", "fabric"), ("skin", "thing", "fabric", "unpick"),
    ("altar", "thing", "house", "warm"), ("circle", "thing", "ring", None),
    ("summon", "act", "mouth", "door"), ("bind", "act", "bind", "fabric"), ("feed", "act", "needle", "mouth"),
    ("keep", "act", "hand", "ring"), ("begin", "act", "stair", "door"), ("read", "act", "book", "mouth"),
    ("hold", "act", "hand", "still"), ("make", "act", "hand", "needle"),
]
BACKS = [  # name, top, bottom, the front it is the back of
    ("seven", "seven", None, "summon"), ("play", "ring", "person", "they"), ("stay", "still", "house", "bind"),
    ("warm", "warm", None, "fabric"), ("cold", "warm", "unpick", "feed"), ("company", "person", "house", "it"),
    ("still", "still", None, "keep"), ("go", "stair", None, "needle"), ("unpick", "unpick", None, "we"),
    ("cut", "unpick", "thread", "filling"), ("i", "person", None, "begin"), ("mother", "person", "needle", "read"),
    ("hunger", "mouth", "warm", "hold"), ("home", "house", "ring", "one"),
]
def segments(top, bottom):
    """Unit stitches of a glyph on a lattice 6 wide and 7 tall (two radicals and a gap)."""
    out = []
    for rad, oy in ((top, 0), (bottom, 4)):
        for pl in RAD[rad]:
            for (x1, y1), (x2, y2) in zip(pl, pl[1:]):
                n = max(abs(x2 - x1), abs(y2 - y1))
                for k in range(n):
                    out.append(((x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n + oy),
                                (x1 + (x2 - x1) * (k + 1) / n, y1 + (y2 - y1) * (k + 1) / n + oy)))
    return out


