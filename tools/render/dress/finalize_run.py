"""Shrink a run folder after it has been described: write a small .jpg next to each still, then drop the big files.

    python finalize_run.py <run dir> [--keep-png] [--keep-ids] [--quality 88]
    blender -b --python finalize_run.py -- <run dir> ...

Keeps the per-scene json and the metrics (written by batch_describe.py, kept elsewhere). Without --keep-png the lossless png is
deleted after its jpg is written; without --keep-ids the id masks are deleted. Run batch_describe.py first.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dress import imageio_min as iio  # noqa: E402


def main():
    a = sys.argv
    a = a[a.index("--") + 1:] if "--" in a else a[1:]
    run = a[0]
    keep_png, keep_ids = "--keep-png" in a, "--keep-ids" in a
    q = int(a[a.index("--quality") + 1]) if "--quality" in a else 88
    n = freed = 0
    for root, _d, files in os.walk(run):
        for f in sorted(files):
            p = os.path.join(root, f)
            if not f.endswith(".png"):
                continue
            if f.endswith("_id.png"):
                if not keep_ids:
                    freed += os.path.getsize(p)
                    os.remove(p)
                continue
            jp = p[:-4] + ".jpg"
            if not os.path.exists(jp):
                iio.write_u8(jp, iio.read_u8(p), q)
            n += 1
            if not keep_png:
                freed += os.path.getsize(p) - os.path.getsize(jp)
                os.remove(p)
    print("jpg written for %d stills, %.1f MB freed" % (n, freed / 1e6))


if __name__ == "__main__":
    main()
