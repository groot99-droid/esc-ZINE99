"""Chapter cards (7) and night cards (2): a picture, and the map's legend box, a row shorter each time."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
W, H = 1600, 900
VX, VY, VW, VH = 600, 170, 940, 620
ROWS = ["Sites 1–3", "Sites 4–6", "Sites 7–11", "Sites 12–15", "Sites 16–19", "Booth, store, payphone",
        "Trail register", "Loop road, one way", "Sites 20–24"]


def legend(a, lost, night=False):
    ink = "#9fc7a4" if night else kit.INK
    x, y, w, h = 70, 170, 460, 620
    a.rect(x, y, w, h, fill="none", stroke=ink, stroke_width=2.2)
    a.rect(x + 7, y + 7, w - 14, h - 14, fill="none", stroke=ink, stroke_width=0.7)
    kit.printed(a, x + 28, y + 54, "LEGEND", size=24, color=ink, letter_spacing="7")
    a.line(x + 28, y + 70, x + w - 28, y + 70, stroke=ink, stroke_width=0.8)
    rows = ROWS[lost:]
    for k in range(9):
        ry = y + 118 + k * 56
        if k >= len(rows):
            if not night:
                a.rect(x + 29, ry - 21, 26, 26, fill="none", stroke="#fffdf4", stroke_width=1.4, opacity=0.8)
                a.rect(x + 28, ry - 22, 26, 26, fill="none", stroke="#b5a988", stroke_width=0.8, opacity=0.5)
            continue
        nm = rows[k]
        if nm.startswith("Sites"):
            a.rect(x + 28, ry - 22, 26, 26, fill=ink)
        elif nm.startswith("Booth"):
            a.rect(x + 30, ry - 14, 22, 18, fill=kit.RED); a.poly([(x + 26, ry - 14), (x + 41, ry - 26), (x + 56, ry - 14)], fill=ink)
        elif nm.startswith("Trail"):
            a.rect(x + 33, ry - 17, 16, 16, fill="none", stroke=ink, stroke_width=2.4)
        else:
            a.line(x + 26, ry - 9, x + 56, ry - 9, stroke=ink, stroke_width=8); a.line(x + 26, ry - 9, x + 56, ry - 9, stroke=kit.NIGHT if night else kit.PAPER, stroke_width=4)
        a.text(x + 74, ry, nm, size=24, family="sans-serif", fill=ink)
        a.line(x + 74 + len(nm) * 12.6, ry - 6, x + w - 30, ry - 6, stroke=ink, stroke_width=0.9, stroke_dasharray="1 5")


def card(key, num, title, when, lost, doc, night=False):
    def deco(fn):
        @asset(G, key, group="chapters", title=f"{num}: {title}", w=W, h=H,
               row="Chapter cards (7), night cards (2): the legend box, a row shorter each time")
        def draw(a: Art):
            if night:
                a.rect(0, 0, W, H, fill=kit.NIGHT)
                a.stipple(0, 0, W, H, n=300, r=(0.5, 1.4), fill="#1b2738")
            else:
                a.paper(kit.PAPER, grain=0.1, fibre=1.0)
            ink = "#9fc7a4" if night else kit.INK
            kit.printed(a, 70, 86, num.upper(), size=22, color=ink, letter_spacing="8")
            a.text(70, 142, title, size=58, family="serif", fill="#e9e2d2" if night else "#2a2a28", font_weight="bold")
            a.text(W - 60, 86, when, size=20, family="monospace", fill=ink, text_anchor="end")
            legend(a, lost, night)
            clip = a.clip(f'<rect x="{VX}" y="{VY}" width="{VW}" height="{VH}"/>')
            a.open("g", clip_path=clip)
            fn(a)
            a.close()
            a.rect(VX, VY, VW, VH, fill="none", stroke=ink, stroke_width=2.2)
            a.rect(VX - 7, VY - 7, VW + 14, VH + 14, fill="none", stroke=ink, stroke_width=0.7)
            n = 9 - lost
            kit.hand(a, 74, 840, f"legend rows: {n}", size=28, color="#b9b6ad" if night else kit.GRAPHITE, rot=-1)
            kit.tally(a, 290, 812, n, h=30, gap=10, stroke="#b9b6ad" if night else kit.GRAPHITE)
            kit.tooth(a, 0.08, white=night)
        draw.__doc__ = doc + (f" Beside the picture, the map's green legend box keeps its height with {9 - lost} of its nine "
                              "rows printed; Tam's pencil count underneath agrees.")
        return draw
    return deco


def trunks(a, n, y_top, base, colors, wide=(14, 40), jitter=16, shadow=None, even=False, x0=VX, x1=VX + VW):
    r = a.rng
    for k in range(n):
        x = x0 + (k + 0.5) * (x1 - x0) / n + (0 if even else r.uniform(-jitter, jitter))
        tw = (wide[0] + wide[1]) / 2 if even else r.uniform(*wide)
        b = base if even else base + r.uniform(0, 70)
        a.poly([(x - tw / 2, y_top), (x + tw / 2, y_top), (x + tw * 0.68, b), (x - tw * 0.68, b)], fill=colors[k % len(colors)])
        if shadow:
            a.poly([(x + tw * 0.68, b), (x - tw * 0.68, b), (x - tw - 260, b + 60), (x - 200, b + 70)], fill=shadow, opacity=0.28)
        if not even:
            a.line(x - tw * 0.22, y_top, x - tw * 0.12, b, stroke="#e6c38a", stroke_width=tw * 0.13, opacity=0.45)


def number_post(a, x, y, n, h=150, plate="#d8b84a"):
    a.rect(x - 9, y - h, 18, h, fill="#4d2f1b")
    a.poly([(x - 26, y - h), (x, y - h - 20), (x + 26, y - h)], fill="#3a2212")
    a.rect(x - 20, y - h + 4, 40, 54, fill=plate, stroke="#3a2212", stroke_width=2)
    a.text(x, y - h + 44, str(n), size=34, family="sans-serif", fill="#3a2212", text_anchor="middle", font_weight="bold")


@card("chapter-1", "Chapter 1", "Hollin Creek", "day 1 · 15:00–18:00", 0,
      "Chapter 1's card: late sun through tall cedar trunks, and a paper map held up over the ground so that its printed squares for sites 1, 2 and 3 sit where nothing stands.")
def ch1(a):
    r = a.rng
    a.rect(VX, VY, VW, VH, fill=a.gradient([(0, "#d5dcc2"), (0.55, "#b4c193"), (1, "#8c9a66")]))
    for _ in range(50):
        a.circle(VX + r.uniform(0, VW), VY + r.uniform(0, VH * 0.5), r.uniform(26, 70), fill=r.choice([kit.GREEN, "#8aa06c", "#58724a"]), opacity=0.33)
    a.poly([(VX, VY + 380), (VX + VW, VY + 350), (VX + VW, VY + VH), (VX, VY + VH)], fill="#b79b6c")
    a.stipple(VX, VY + 360, VW, 260, n=700, r=(0.8, 2.2), fill="#7a6243", opacity=0.5)
    trunks(a, 12, VY, VY + 370, [kit.CEDAR, "#4d2f1b", kit.CEDAR, "#63391f"], shadow="#3a2a1a")
    # the map lens: paper at 40%, squares over untouched ground
    a.open("g", transform=f"rotate(-4 {VX + 470} {VY + 400})")
    a.rect(VX + 210, VY + 190, 540, 380, fill="#F4EDD9", opacity=0.55, stroke="#3b3426", stroke_width=2)
    for k in range(5):
        a.path(a.smooth_d([(VX + 210, VY + 250 + k * 60), (VX + 400, VY + 230 + k * 62), (VX + 580, VY + 270 + k * 55), (VX + 750, VY + 240 + k * 60)]),
               fill="none", stroke="#9B6A3C", stroke_width=1.2, opacity=0.7)
    a.path(a.smooth_d([(VX + 240, VY + 520), (VX + 420, VY + 430), (VX + 600, VY + 420), (VX + 740, VY + 330)]), fill="none", stroke="#222", stroke_width=9)
    a.path(a.smooth_d([(VX + 240, VY + 520), (VX + 420, VY + 430), (VX + 600, VY + 420), (VX + 740, VY + 330)]), fill="none", stroke="#F4EDD9", stroke_width=5)
    for k, (x, y) in enumerate(((330, 420), (450, 372), (580, 366))):
        a.rect(VX + x - 16, VY + y - 16, 32, 32, fill="#222")
        a.text(VX + x, VY + y - 26, str(k + 1), size=26, family="sans-serif", fill="#222", text_anchor="middle", font_weight="bold")
    kit.printed(a, VX + 232, VY + 228, "HOLLIN CREEK", size=22)
    a.close()
    for x in (VX + 240, VX + 740):                      # thumbs on the sheet's lower corners
        a.ellipse(x, VY + 600, 34, 60, fill="#c79a78", stroke="#7a5a44", stroke_width=2)
        a.ellipse(x, VY + 566, 20, 16, fill="#e0bfa4", opacity=0.7)


@card("chapter-2", "Chapter 2", "Torchlight", "day 1 · 18:00–23:00", 1,
      "Chapter 2's card in charcoal: the night road from above with one amber circle of torchlight holding post 14 and its fire ring, a dim post behind, and bare forest floor ahead where the road narrows.")
def ch2(a):
    r = a.rng
    a.rect(VX, VY, VW, VH, fill="#141518")
    soft = a.blur(30)
    for _ in range(16):
        g = r.randint(16, 46)
        a.ellipse(VX + r.uniform(0, VW), VY + r.uniform(0, VH), r.uniform(80, 220), r.uniform(50, 140), fill=f"rgb({g},{g},{g + 4})", opacity=0.8, filter=soft)
    rough = a.roughen(8, 0.05)
    road = lambda x: VY + 330 - (x - VX - 470) * 0.3
    for off in (-52, 52):
        a.wobble([(x, road(x) + off) for x in range(VX - 20, VX + VW + 40, 60)], amp=3, step=30, stroke="#5a5b60", stroke_width=5, opacity=0.4, filter=rough)
    a.rect(VX + 120, road(VX + 120) + 70, 30, 30, fill="#26272b", stroke="#3c3d42", stroke_width=2, filter=rough)
    cx, cy, R = VX + 470, VY + 330, 230
    clip = a.clip(f'<circle cx="{cx}" cy="{cy}" r="{R}"/>')
    a.open("g", clip_path=clip)
    a.rect(cx - R, cy - R, 2 * R, 2 * R, fill="#5b4a33")
    a.stipple(cx - R, cy - R, 2 * R, 2 * R, n=500, r=(1.5, 4), fill="#7a6243", opacity=0.6)
    wd = lambda x: 46 if x < cx + 90 else 46 - min(13, (x - cx - 90) * 0.25)
    top = [(x, road(x) - wd(x)) for x in range(cx - R, cx + R + 20, 20)]
    bot = [(x, road(x) + wd(x)) for x in range(cx + R, cx - R - 20, -20)]
    a.path(a.wobble_d(top + bot, amp=2, step=18, closed=True), fill="#a49478")
    a.stipple(cx - R, cy - 120, 2 * R, 240, n=600, r=(1, 2.6), fill="#cbbd9e", opacity=0.8,
              density=lambda x, y: 1 if abs(y - road(x)) < wd(x) else 0)
    px, py = cx - 110, cy + 120
    a.ellipse(px + 10, py + 16, 92, 60, fill="#b3a585")
    a.circle(px + 52, py + 22, 25, fill="#2b2420", stroke="#77706a", stroke_width=7, stroke_dasharray="9 3")
    a.rect(px - 22, py - 22, 30, 30, fill=kit.CEDAR, stroke="#4a2e1c", stroke_width=2)
    a.text(px - 36, py - 30, "14", size=30, family="sans-serif", fill="#f6e7c8", font_weight="bold")
    a.ellipse(cx, cy + 2, 30, 20, fill="#2a3346"); a.circle(cx, cy, 13, fill="#3b2b22")
    a.rect(cx + 24, cy - 12, 22, 9, fill="#222", transform=f"rotate(-18 {cx + 24} {cy - 8})")
    a.close()
    a.circle(cx, cy, R + 2, fill=a.radial([(0, "#fff0c8", 0.28), (0.5, kit.AMBER, 0.14), (0.8, "#5a2c0c", 0.25), (0.95, "#1a0f08", 0.75), (1, "#141518", 1)]))
    for _ in range(60):
        x, y = VX + r.uniform(0, VW), VY + r.uniform(0, VH); t = r.gauss(-0.3, 0.2); L = r.uniform(60, 220)
        a.line(x, y, x + L * math.cos(t), y + L * math.sin(t), stroke="#000", stroke_width=f(r.uniform(2, 9)), opacity=f(r.uniform(0.08, 0.28)),
               stroke_linecap="round", filter=rough)


@card("night-1", "Night 1", "Sleep", "day 1 · 23:00", 2,
      "The first night's card: one tent lit amber from inside under a blue-black sky, a walkie-talkie standing on a stump with its dial at two, and the dark road beyond.", night=True)
def n1(a):
    r = a.rng
    a.rect(VX, VY, VW, VH, fill=a.gradient([(0, "#0a1019"), (1, "#16233a")]))
    a.stipple(VX, VY, VW, 330, n=160, r=(0.6, 1.8), fill="#dfe6f2", opacity=0.8)
    trunks(a, 9, VY, VY + 420, ["#0a0e16", "#0c121c"], wide=(18, 46))
    a.poly([(VX, VY + 440), (VX + VW, VY + 420), (VX + VW, VY + VH), (VX, VY + VH)], fill="#0b1018")
    tx, ty = VX + 430, VY + 480
    a.ellipse(tx, ty + 10, 330, 90, fill=a.radial([(0, kit.AMBER, 0.5), (1, kit.AMBER, 0)]))
    tent = [(tx - 210, ty), (tx - 20, ty - 230), (tx + 230, ty)]
    a.poly(tent, fill=a.gradient([(0, "#b9651c"), (1, "#f6c668")]))
    a.poly([(tx - 20, ty - 230), (tx + 60, ty), (tx - 60, ty)], fill="#fbe2a0", opacity=0.6)
    a.path(a.smooth_d(tent[:2]), stroke="#3a1d06", stroke_width=4, fill="none"); a.line(tx - 20, ty - 230, tx + 230, ty, stroke="#3a1d06", stroke_width=4)
    a.ellipse(tx + 70, ty - 40, 60, 34, fill="#7a3f10", opacity=0.45)                       # a sleeper's shadow on the cloth
    a.line(tx - 210, ty, tx - 270, ty + 30, stroke="#2a3346", stroke_width=2); a.line(tx + 230, ty, tx + 290, ty + 30, stroke="#2a3346", stroke_width=2)
    sx, sy = VX + 760, VY + 500
    a.ellipse(sx, sy, 60, 20, fill="#2b2118"); a.rect(sx - 60, sy, 120, 70, fill="#1c1611"); a.ellipse(sx, sy, 46, 13, fill="#3a2c1e")
    a.rect(sx - 18, sy - 96, 36, 92, fill="#16181c", stroke="#3a3d44", stroke_width=2); a.line(sx - 10, sy - 96, sx - 10, sy - 160, stroke="#3a3d44", stroke_width=4)
    a.circle(sx + 6, sy - 76, 9, fill=kit.AMBER); a.text(sx + 6, sy - 70, "2", size=14, family="sans-serif", fill="#16181c", text_anchor="middle", font_weight="bold")
    for k in range(3):
        a.line(sx - 10, sy - 50 + k * 10, sx + 10, sy - 50 + k * 10, stroke="#3a3d44", stroke_width=2)


@card("chapter-3", "Chapter 3", "The Second Morning", "day 2 · 07:00–12:00", 3,
      "Chapter 3's card: the back of Inés's camera with its three-by-three gallery. Eight frames show numbered posts in grey morning light; the frame for site 7 shows a clearing, and the file numbers skip.")
def ch3(a):
    a.rect(VX, VY, VW, VH, fill="#c9cdbf")
    a.rect(VX + 90, VY + 40, VW - 180, VH - 80, rx=34, fill="#1b1c1f", stroke="#000", stroke_width=3)
    a.rect(VX + 130, VY + 76, 560, 468, fill="#0c0d0f")
    a.circle(VX + 770, VY + 150, 36, fill="#2a2c31", stroke="#55585f", stroke_width=3); a.circle(VX + 770, VY + 280, 22, fill="#2a2c31", stroke="#55585f", stroke_width=3)
    a.rect(VX + 740, VY + 360, 60, 26, rx=6, fill="#2a2c31", stroke="#55585f", stroke_width=2)
    nums = [3, 4, 5, 6, 7, 11, 12, 13, 14]
    posts = [20, 19, 17, 12, None, 16, 21, 22, 24]
    for k in range(9):
        x, y = VX + 144 + (k % 3) * 182, VY + 88 + (k // 3) * 150
        a.rect(x, y, 170, 114, fill=a.gradient([(0, "#b7c0ab"), (0.6, "#93a184"), (1, "#8a7c5c")]))
        for t in range(5):
            tx = x + 12 + t * 36 + (k * 7 + t * 13) % 14
            a.rect(tx, y, 8 + (t * 5 + k) % 9, 80 + (t * 11) % 20, fill="#5a4636" if (t + k) % 2 else "#6b5644")
        if posts[k] is not None:
            px = x + 60 + (k * 23) % 50
            a.rect(px, y + 50, 7, 56, fill="#3a2212"); a.rect(px - 8, y + 44, 23, 24, fill="#d8b84a", stroke="#3a2212", stroke_width=1)
            a.text(px + 3.5, y + 62, str(posts[k]), size=14, family="sans-serif", fill="#3a2212", text_anchor="middle", font_weight="bold")
        skip = k == 5
        a.text(x + 2, y + 134, f"IMG_{nums[k]:04d}", size=15, family="monospace", fill=kit.AMBER if skip or k == 4 else "#b9b6ad")
    a.rect(VX + 144 + 182 - 4, VY + 88 + 150 - 4, 178, 122, fill="none", stroke=kit.AMBER, stroke_width=3)
    kit.hand(a, VX + VW / 2, VY + 608, "It's a clearing. It was always a clearing. Look.", size=24, color="#3a3a38", rot=0, text_anchor="middle")


@card("chapter-4", "Chapter 4", "Carrying", "day 2 · 12:00–20:30", 4,
      "Chapter 4's card: an overcast afternoon a step greyer, the numbered cedar posts 16 to 19 along the road, and 17 pulled and lying across the camp table beside the hole it left, chalk marks on the wood for where it will stand.")
def ch4(a):
    r = a.rng
    a.rect(VX, VY, VW, VH, fill=a.gradient([(0, "#c8cbc3"), (0.6, "#a9b09c"), (1, "#8f8f78")]))
    for _ in range(40):
        a.circle(VX + r.uniform(0, VW), VY + r.uniform(0, VH * 0.45), r.uniform(30, 70), fill=r.choice(["#7f8f74", "#93a087", "#667860"]), opacity=0.35)
    a.poly([(VX, VY + 360), (VX + VW, VY + 340), (VX + VW, VY + VH), (VX, VY + VH)], fill="#a39a80")
    a.stipple(VX, VY + 350, VW, 270, n=600, r=(0.8, 2.2), fill="#6f6654", opacity=0.5)
    trunks(a, 10, VY, VY + 350, ["#6a5444", "#4f3d31", "#5d4a3c"])
    for k, n in enumerate((16, 18, 19)):
        number_post(a, VX + (130, 640, 800)[k], VY + (450, 420, 405)[k], n, h=(170, 130, 110)[k])
    a.ellipse(VX + 330, VY + 462, 34, 11, fill="#3a2a1a"); a.ellipse(VX + 330, VY + 458, 44, 14, fill="none", stroke="#6f5a40", stroke_width=4)
    # the camp table with post 17 across it, and Dell's chalk slot
    tx, ty = VX + 300, VY + 520
    a.poly([(tx, ty), (tx + 520, ty - 30), (tx + 560, ty + 40), (tx + 30, ty + 76)], fill="#8a6a4a", stroke="#4d3a28", stroke_width=3)
    for k in range(1, 5):
        a.line(tx + 6 * k, ty + 15 * k, tx + 520 + 8 * k, ty - 30 + 14 * k, stroke="#4d3a28", stroke_width=1.5, opacity=0.7)
    a.rect(tx + 70, ty + 70, 16, 80, fill="#4d3a28"); a.rect(tx + 500, ty + 42, 16, 90, fill="#4d3a28")
    a.open("g", transform=f"rotate(-5 {tx + 280} {ty + 10})")
    a.rect(tx + 60, ty - 20, 420, 30, fill=kit.CEDAR, stroke="#3a2212", stroke_width=2.5)
    a.poly([(tx + 60, ty - 20), (tx + 10, ty - 5), (tx + 60, ty + 10)], fill="#3a2a1a")
    a.rect(tx + 400, ty - 34, 60, 50, fill="#d8b84a", stroke="#3a2212", stroke_width=2)
    a.text(tx + 430, ty + 4, "17", size=36, family="sans-serif", fill="#3a2212", text_anchor="middle", font_weight="bold")
    a.close()
    ch = a.roughen(3, 0.4)
    a.path(a.wobble_d([(tx + 150, ty + 22), (tx + 230, ty + 16), (tx + 240, ty + 52), (tx + 158, ty + 60)], 1.5, 10, True), fill="none", stroke="#f4f1e6", stroke_width=4, opacity=0.85, filter=ch)
    a.path(a.wobble_d([(tx + 170, ty + 28), (tx + 222, ty + 50)], 1.5, 10) + a.wobble_d([(tx + 220, ty + 24), (tx + 172, ty + 54)], 1.5, 10), fill="none", stroke="#f4f1e6", stroke_width=4, opacity=0.85, filter=ch)


@card("chapter-5", "Chapter 5", "Five Fixed Points", "night 2", 5,
      "Chapter 5's card from above: the five sites in an arc at the loop's far end, each lit by its own lantern and the shared fire ring at 22 brightest, carried posts standing in their slots; past 20 and past 24 there is flat black with no ground in it at all.", night=True)
def ch5(a):
    r = a.rng
    a.rect(VX, VY, VW, VH, fill="#050608")
    cx, cy = VX + 470, VY + 640
    soft = a.blur(26)
    pts = []
    for k in range(5):
        t = math.radians(-150 + k * 30)
        pts.append((cx + 400 * math.cos(t), cy + 400 * math.sin(t)))
    band = [(cx + 330 * math.cos(math.radians(t)), cy + 330 * math.sin(math.radians(t))) for t in range(-158, -21, 8)]
    a.path(a.smooth_d(band), fill="none", stroke="#2a2620", stroke_width=250, stroke_linecap="butt", filter=soft)
    a.path(a.smooth_d(band), fill="none", stroke="#a49478", stroke_width=40, stroke_linecap="butt", opacity=0.8)
    for k, (x, y) in enumerate(pts):
        R = 120 if k == 2 else 92
        a.circle(x, y, R, fill=a.radial([(0, "#ffe0a0", 0.9), (0.4, kit.AMBER, 0.5), (1, kit.AMBER, 0)]))
        a.rect(x - 34, y - 60, 46, 46, fill="none", stroke="#f3e2bb", stroke_width=2.5, transform=f"rotate({-60 + k * 30} {x} {y})")
        a.rect(x + 16, y - 6, 38, 18, fill="#8a6a4a", transform=f"rotate({-60 + k * 30} {x} {y})")
        a.rect(x - 60, y + 10, 16, 16, fill=kit.CEDAR, stroke="#2a1608", stroke_width=2)
        a.text(x - 52, y + 50, str(20 + k), size=22, family="sans-serif", fill="#f6e7c8", text_anchor="middle", font_weight="bold")
        if k == 2:
            a.circle(x + 6, y + 44, 20, fill="#2b2420", stroke="#77706a", stroke_width=6, stroke_dasharray="8 3"); a.circle(x + 6, y + 44, 9, fill="#ffd23f")
        elif k in (0, 3):
            a.rect(x - 36, y + 12, 12, 12, fill=kit.CEDAR, stroke="#2a1608", stroke_width=2)
    a.stipple(VX, VY, VW, VH, n=500, r=(0.8, 2), fill="#cbbd9e", opacity=0.5,
              density=lambda x, y: 1 if abs(math.hypot(x - cx, y - cy) - 330) < 20 and -158 < math.degrees(math.atan2(y - cy, x - cx)) < -22 else 0)


@card("chapter-6", "Chapter 6", "The Final Morning", "—", 7,
      "Chapter 6's card: a phone held up against an even pearl sky, its screen showing no signal, no time, no date; behind it the five tents and trunks that have begun to stand at equal intervals, with no shadows under anything.")
def ch6(a):
    a.rect(VX, VY, VW, VH, fill=kit.PEARL)
    a.rect(VX, VY + 400, VW, VH - 400, fill="#b9bdb0")
    trunks(a, 13, VY, VY + 400, ["#3d4a44", "#46544d"], wide=(22, 22), even=True)
    for k in range(5):
        x = VX + 80 + k * 190
        a.poly([(x - 70, VY + 470), (x, VY + 380), (x + 76, VY + 470)], fill=["#8b9c8f", "#9a8f86", "#7f93a0", "#9c9a84", "#8d8a9c"][k], stroke="#55605a", stroke_width=2)
        a.poly([(x - 14, VY + 470), (x, VY + 410), (x + 14, VY + 470)], fill="#4d5752")
    px, py = VX + 330, VY + 150
    a.rect(px - 10, py + 300, 300, 240, rx=60, fill="#b08a70", stroke="#7a5a44", stroke_width=2)
    a.rect(px, py, 280, 500, rx=30, fill="#17191c", stroke="#000", stroke_width=3)
    a.rect(px + 16, py + 40, 248, 420, fill="#e9ebe6")
    for k, s in enumerate(("no signal", "no time", "no date")):
        a.text(px + 140, py + 190 + k * 58, s, size=32, family="sans-serif", fill="#5a5f5c", text_anchor="middle")
    a.rect(px + 100, py + 14, 80, 10, rx=5, fill="#2a2d31")
    for k in range(4):
        a.ellipse(px - 4, py + 300 + k * 44, 26, 19, fill="#c79a78", stroke="#7a5a44", stroke_width=2)
    a.ellipse(px + 286, py + 330, 24, 50, fill="#c79a78", stroke="#7a5a44", stroke_width=2)


@card("night-2", "Night 2", "The Crossing", "—", 6,
      "The second night's card: the shared fire ring burned down to embers with six seats round it, five of them used and one that nobody filled; a closed notebook lies on the stump nearest the coals, and there is no star in the sky.", night=True)
def n2(a):
    r = a.rng
    a.rect(VX, VY, VW, VH, fill="#070a10")
    a.poly([(VX, VY + 380), (VX + VW, VY + 380), (VX + VW, VY + VH), (VX, VY + VH)], fill="#0b0e14")
    cx, cy = VX + 470, VY + 470
    a.ellipse(cx, cy, 440, 150, fill=a.radial([(0, "#ff9a3c", 0.55), (0.5, "#a8431a", 0.25), (1, "#a8431a", 0)]))
    for k in range(11):
        t = 2 * math.pi * k / 11
        a.ellipse(cx + 120 * math.cos(t), cy + 40 * math.sin(t), 26, 15, fill="#3b3734", stroke="#1c1a18", stroke_width=2)
    a.ellipse(cx, cy, 92, 28, fill="#1c120c")
    for _ in range(38):
        t = r.uniform(0, 2 * math.pi); q = r.uniform(0, 1)
        a.circle(cx + 80 * q * math.cos(t), cy + 22 * q * math.sin(t), r.uniform(2, 6), fill=r.choice(["#ff9a3c", "#ffd23f", "#d8401f"]), opacity=0.9)
    for k in range(6):
        t = math.radians(200 + k * 56)
        x, y = cx + 330 * math.cos(t), cy + 110 * math.sin(t) + 10
        if k == 4:              # the seat nobody filled
            a.ellipse(x, y + 26, 44, 12, fill="none", stroke="#6a5a48", stroke_width=2, stroke_dasharray="6 6")
            continue
        a.rect(x - 34, y - 50, 68, 54, rx=6, fill=["#27364a", "#3a2a3e", "#4a2a26", "#2c4032", "#3e3a26", "#27364a"][k], stroke="#0b0d12", stroke_width=2)
        a.rect(x - 38, y, 76, 12, fill="#1c1a18"); a.line(x - 30, y + 12, x - 36, y + 44, stroke="#1c1a18", stroke_width=5); a.line(x + 30, y + 12, x + 36, y + 44, stroke="#1c1a18", stroke_width=5)
        a.rect(x - 34, y - 50, 68, 54, rx=6, fill="#ff9a3c", opacity=0.14)
    sx, sy = cx + 190, cy + 70
    a.ellipse(sx, sy, 54, 17, fill="#3a2c1e"); a.rect(sx - 54, sy, 108, 60, fill="#1c1611")
    a.poly([(sx - 34, sy - 12), (sx + 22, sy - 20), (sx + 36, sy + 2), (sx - 20, sy + 10)], fill="#2f5a3a", stroke="#0b0d12", stroke_width=2)
    a.line(sx + 12, sy - 18, sx + 26, sy + 3, stroke="#0b0d12", stroke_width=2)
    a.line(sx - 40, sy + 14, sx + 50, sy - 6, stroke=kit.GOLD, stroke_width=4)


@card("chapter-7", "Chapter 7", "The Other Side", "—", 8,
      "Chapter 7's card: a pearl sky with no sun and no gradient, dark trunks at exact, equal intervals with nothing casting a shadow, a gravel road running straight between them to a small cedar booth at the far end with one window.")
def ch7(a):
    a.rect(VX, VY, VW, VH, fill=kit.PEARL)
    a.rect(VX, VY + 430, VW, VH - 430, fill="#6f8a7c")
    for k in range(40):
        a.line(VX, VY + 432 + k * k * 0.12, VX + VW, VY + 432 + k * k * 0.12, stroke="#5d7669", stroke_width=1, opacity=0.6)
    a.poly([(VX + 250, VY + VH), (VX + 452, VY + 430), (VX + 488, VY + 430), (VX + 690, VY + VH)], fill="#c9c6ba")
    for k in range(-8, 9):
        if k == 0:
            continue
        x = VX + 470 + k * 56 + (26 if k > 0 else -26)
        w = 12 + abs(k) * 3.2
        a.rect(x - w / 2, VY, w, 430 + abs(k) * 22, fill="#1f2b27")
        for j in range(4):
            y = VY + 60 + j * 90 + (k % 2) * 30
            a.line(x - w / 2, y, x - w / 2 - 10, y - 8, stroke="#1f2b27", stroke_width=3)
    bx, by = VX + 446, VY + 372
    a.rect(bx, by, 48, 58, fill=kit.CEDAR, stroke="#3a2212", stroke_width=2)
    a.poly([(bx - 10, by), (bx + 24, by - 20), (bx + 58, by)], fill="#3a2212")
    a.rect(bx + 12, by + 14, 24, 18, fill="#1a1d1c", stroke="#e9e2d2", stroke_width=1.5)
