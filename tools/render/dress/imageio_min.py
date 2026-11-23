"""Image reading and writing for measure.py with whatever is available: Pillow, else Blender's own image code (on a render box,
inside `blender -b --python`), else a small pure-Python PNG decoder (8-bit, slow on big files). Only numpy is required.

Arrays are float64 HxWx3 in 0..1 holding the file's own (display-encoded) values: no colour transform is applied.
"""
import os
import struct
import zlib

import numpy as np

try:
    from PIL import Image  # noqa: F401
    HAVE_PIL = True
except Exception:  # pragma: no cover
    HAVE_PIL = False
try:
    import bpy  # noqa: F401
    HAVE_BPY = True
except Exception:
    HAVE_BPY = False


def _read_png_pure(path):
    with open(path, "rb") as f:
        data = f.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a png"
    pos, idat, w = 8, [], None
    while pos < len(data):
        ln, typ = struct.unpack(">I4s", data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + ln]
        pos += 12 + ln
        if typ == b"IHDR":
            w, h, depth, ctype, _c, _f, inter = struct.unpack(">IIBBBBB", body)
            assert depth == 8 and inter == 0 and ctype in (0, 2, 6), "unsupported png (8-bit, non-interlaced gray/RGB/RGBA only)"
        elif typ == b"IDAT":
            idat.append(body)
    bpp = {0: 1, 2: 3, 6: 4}[ctype]
    raw = zlib.decompress(b"".join(idat))
    stride = w * bpp
    out = np.zeros((h, stride), np.uint8)
    prev = np.zeros(stride, np.int32)
    p = 0
    for y in range(h):
        ft = raw[p]
        line = np.frombuffer(raw, np.uint8, stride, p + 1).astype(np.int32)
        p += stride + 1
        if ft == 0:
            cur = line
        elif ft == 1:
            cur = line.copy()
            for i in range(bpp, stride):
                cur[i] = (cur[i] + cur[i - bpp]) & 255
        elif ft == 2:
            cur = (line + prev) & 255
        elif ft == 3:
            cur = line.copy()
            for i in range(stride):
                left = cur[i - bpp] if i >= bpp else 0
                cur[i] = (cur[i] + ((left + prev[i]) >> 1)) & 255
        else:
            cur = line.copy()
            for i in range(stride):
                a = cur[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                cur[i] = (cur[i] + pr) & 255
        out[y] = cur
        prev = cur
    a = out.reshape(h, w, bpp)
    if bpp == 1:
        a = np.repeat(a, 3, axis=2)
    return a[:, :, :3]


def read_u8(path):
    """HxWx3 uint8 of the file's own values."""
    if HAVE_PIL:
        from PIL import Image
        return np.asarray(Image.open(path).convert("RGB"))
    if HAVE_BPY:
        import bpy
        im = bpy.data.images.load(path, check_existing=False)
        im.colorspace_settings.name = "Non-Color"
        w, h = im.size
        buf = np.empty(w * h * 4, np.float32)
        im.pixels.foreach_get(buf)
        bpy.data.images.remove(im)
        a = buf.reshape(h, w, 4)[::-1, :, :3]  # Blender stores rows bottom-up
        return np.clip(np.rint(a * 255.0), 0, 255).astype(np.uint8)
    return _read_png_pure(path)


def read(path):
    return read_u8(path).astype(np.float64) / 255.0


def write_u8(path, arr, quality=90):
    """Write HxWx3 uint8 as .jpg or .png (Pillow, or Blender's image code)."""
    arr = np.ascontiguousarray(arr)
    if HAVE_PIL:
        from PIL import Image
        Image.fromarray(arr).save(path, quality=quality) if path.lower().endswith((".jpg", ".jpeg")) else Image.fromarray(arr).save(path)
        return
    if HAVE_BPY:
        import bpy
        h, w = arr.shape[:2]
        im = bpy.data.images.new("w", w, h, alpha=False)
        im.colorspace_settings.name = "Non-Color"
        f = np.ones((h, w, 4), np.float32)
        f[:, :, :3] = arr[::-1].astype(np.float32) / 255.0
        im.pixels.foreach_set(f.ravel())
        im.file_format = "JPEG" if path.lower().endswith((".jpg", ".jpeg")) else "PNG"
        im.filepath_raw = path
        scn = bpy.context.scene
        scn.render.image_settings.quality = quality
        im.save()
        bpy.data.images.remove(im)
        return
    raise RuntimeError("no image writer (needs Pillow or Blender)")


def resize_box(a, w, h):
    """Area-average (or nearest-up) resize of an HxWxC float array to w x h without Pillow."""
    H, W = a.shape[:2]
    if (W, H) == (w, h):
        return a
    ys = (np.arange(h) * H / h).astype(int)
    xs = (np.arange(w) * W / w).astype(int)
    if w < W or h < H:  # shrink: average blocks
        ky, kx = max(1, H // h), max(1, W // w)
        y0 = (np.arange(h) * H // h)
        x0 = (np.arange(w) * W // w)
        cs = np.cumsum(np.cumsum(np.pad(a, ((1, 0), (1, 0), (0, 0))), axis=0), axis=1)
        y1, x1 = np.minimum(y0 + ky, H), np.minimum(x0 + kx, W)
        s = cs[y1][:, x1] - cs[y0][:, x1] - cs[y1][:, x0] + cs[y0][:, x0]
        return s / ((y1 - y0)[:, None, None] * (x1 - x0)[None, :, None])
    return a[ys][:, xs]
