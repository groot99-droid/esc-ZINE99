"""HUD ornaments: thread rules, the hold-still ring, the pulse, the needle cursor and the rest."""
import math

from artkit import Art, asset, f, sibling

kit = sibling(__file__, "_kit")
G = kit.G
ROW = "UI ornaments: thread rules, hold-still ring, pulse, needle cursor"
C, P, R = kit.C, kit.P, kit.R


def needle(a, x1, y1, x2, y2, w=7):
    """A steel needle from eye (x1, y1) to point (x2, y2)."""
    L = math.hypot(x2 - x1, y2 - y1)
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    a.open("g", transform=f"translate({f(x1)} {f(y1)}) rotate({f(ang)})")
    a.path(f"M0,{-w / 2}h{f(L * .8)}L{f(L)},0L{f(L * .8)},{w / 2}H0a{w / 2},{w / 2} 0 0,1 0,{-w}z", fill="#1a0f08", opacity=0.3,
           transform="translate(3 5)")
    a.path(f"M0,{-w / 2}h{f(L * .8)}L{f(L)},0L{f(L * .8)},{w / 2}H0a{w / 2},{w / 2} 0 0,1 0,{-w}z",
           fill=a.gradient([(0, "#f4f1ea"), (0.5, "#9aa0a4"), (1, "#5b6166")]), stroke="#4a4f54", stroke_width=0.8)
    a.ellipse(w * 1.6, 0, w * 1.2, w * 0.22, fill=kit.INK)
    a.close()


@asset(G, "ui-rule-running", group="ui", title="Thread rule: running stitch", w=600, h=120, row=ROW)
def rule_running(a: Art):
    """A divider: one row of bone running stitch on cedar felt, the needle still in the cloth at its end."""
    a.paper(kit.CEDAR, grain=0)
    a.rect(0, 0, 600, 120, fill=kit.CEDAR, filter=kit.felt_filter(a, shadow=0))
    kit.thread(a, "M30,60H470", kit.BONE, w=4.5, dash="20 12")
    a.path(a.smooth_d([(470, 60), (492, 52), (510, 70), (522, 46)]), fill="none", stroke=kit.BONE, stroke_width=3,
           stroke_linecap="round")
    needle(a, 522, 46, 580, 82, w=6)
    kit.shade(a, 0.35)


@asset(G, "ui-rule-band", group="ui", title="Thread rule: sampler band", w=600, h=120, row=ROW)
def rule_band(a: Art):
    """A divider: a cross-stitch sampler band in moss and rust on linen, between two fine rows of stitches."""
    kit.linen(a, kit.LINEN)
    kit.band(a, 20, 36, 560, 7, kit.MOSS, kit.RUST, seed=5, rows=7, unit=8)
    kit.thread(a, "M20,22H580M20,100H580", kit.CEDAR, w=2, dash="7 5", shadow=False)
    kit.shade(a, 0.25)


@asset(G, "ui-rule-knots", group="ui", title="Thread rule: knotted thread", w=600, h=120, row=ROW)
def rule_knots(a: Art):
    """A divider: a length of bone thread on night felt tied with small knots, the last of them amber."""
    a.rect(0, 0, 600, 120, fill=kit.NIGHT, filter=kit.felt_filter(a, shadow=0))
    pts = [(20 + i * 56, 60 + (6 if i % 2 else -6)) for i in range(11)]
    a.path(a.smooth_d(pts), fill="none", stroke="#141a22", stroke_width=4, opacity=0.5, transform="translate(1.5 3)")
    a.path(a.smooth_d(pts), fill="none", stroke=kit.BONE, stroke_width=3, stroke_linecap="round")
    cols = [kit.RUST, kit.SKY, kit.MOSS, kit.DUST, kit.RUST, kit.SKY, kit.MOSS, kit.DUST, kit.AMBER]
    for i, (x, y) in enumerate(pts[1:-1]):
        c = cols[i]
        a.circle(x, y, 7, fill=c, stroke=kit.dark(c, 0.4), stroke_width=1.2)
        a.path(f"M{x - 5},{y - 3}q5,6 10,0M{x - 4},{y + 3}q4,-5 8,0", fill="none", stroke=kit.light(c, 0.5), stroke_width=1.2)
        a.path(f"M{x},{y + 6}q{3 if i % 2 else -3},9 {-2 if i % 2 else 2},16", fill="none", stroke=c, stroke_width=1.6,
               stroke_linecap="round")
    kit.shade(a, 0.35)


@asset(G, "ui-hold-still-ring", group="ui", title="The hold-still ring", w=320, h=320, row=ROW)
def hold_ring(a: Art):
    """The Still control: a ring being sewn shut stitch by stitch around a black button eye; three
    quarters of the stitches are made and the rest are only pricked holes."""
    a.rect(0, 0, 320, 320, fill=kit.NIGHT, filter=kit.felt_filter(a, shadow=0))
    kit.lamp(a, 160, 160, 150, kit.AMBER, 0.3)
    n = 32
    for i in range(n):
        t0 = -math.pi / 2 + i * 2 * math.pi / n
        t1 = t0 + 2 * math.pi / n * 0.62
        x0, y0, x1, y1 = 160 + 116 * math.cos(t0), 160 + 116 * math.sin(t0), 160 + 116 * math.cos(t1), 160 + 116 * math.sin(t1)
        if i < 24:
            a.line(x0 + 1, y0 + 2, x1 + 1, y1 + 2, stroke="#141a22", stroke_width=6, stroke_linecap="round", opacity=0.5)
            a.line(x0, y0, x1, y1, stroke=kit.BONE, stroke_width=6, stroke_linecap="round")
        else:
            a.circle(x0, y0, 2.2, fill="#141a22"), a.circle(x1, y1, 2.2, fill="#141a22")
    t = -math.pi / 2 + 24 * 2 * math.pi / n
    needle(a, 160 + 150 * math.cos(t - 0.5), 160 + 150 * math.sin(t - 0.5), 160 + 112 * math.cos(t + 0.06), 160 + 112 * math.sin(t + 0.06), 5)
    kit.thread(a, C(160, 160, 88), kit.mix(kit.BONE, kit.NIGHT, 0.5), w=1.6, dash="2 6", shadow=False)
    kit.button(a, 160, 160, 46, kit.INK, thr=kit.BONE)
    kit.shade(a, 0.3)


@asset(G, "ui-pulse-ring", group="ui", title="The pulse", w=320, h=320, row=ROW)
def pulse(a: Art):
    """The shared pulse: soft rings of amber and red stitches spreading from a warm centre on cedar felt,
    five small glows around it for the pack."""
    a.rect(0, 0, 320, 320, fill=kit.CEDAR_D, filter=kit.felt_filter(a, shadow=0))
    kit.lamp(a, 160, 160, 160, kit.RED, 0.55)
    kit.lamp(a, 160, 160, 80, kit.AMBER, 0.9)
    for i, r in enumerate((34, 62, 92, 124)):
        kit.thread(a, C(160, 160, r), kit.warmth(1 - i * 0.2), w=4.4 - i * 0.7, dash=f"{10 - i * 2} {5 + i * 3}", shadow=False,
                   opacity=1 - i * 0.2)
    for i in range(5):
        t = -math.pi / 2 + i * 2 * math.pi / 5
        x, y = 160 + 124 * math.cos(t), 160 + 124 * math.sin(t)
        kit.lamp(a, x, y, 26, kit.AMBER, 0.9)
        kit.button(a, x, y, 9, kit.warmth(0.45 + 0.13 * i), thr=kit.CEDAR_D)
    kit.shade(a, 0.3)


@asset(G, "ui-needle-cursor", group="ui", title="The needle cursor", w=200, h=200, row=ROW)
def cursor(a: Art):
    """The cursor: a steel needle entering linen at a pricked hole, a tail of bone thread curling behind it."""
    kit.linen(a, kit.LINEN)
    a.path(a.smooth_d([(150, 34), (176, 70), (130, 96), (160, 140), (120, 176)]), fill="none", stroke="#1a0f08", stroke_width=3.4,
           opacity=0.3, transform="translate(2 3)")
    a.path(a.smooth_d([(150, 34), (176, 70), (130, 96), (160, 140), (120, 176)]), fill="none", stroke=kit.BONE, stroke_width=3,
           stroke_linecap="round")
    a.circle(40, 158, 4, fill=kit.INK)
    kit.thread(a, C(40, 158, 16), kit.RUST, w=1.6, dash="3 4", shadow=False)
    needle(a, 152, 30, 40, 158, w=8)
    kit.shade(a, 0.25)


@asset(G, "ui-steady-mark", group="ui", title="The Steady mark", w=480, h=160, row=ROW)
def steady(a: Art):
    """The tremor prompt: the word STEADY in bone cross-stitch on night felt, the stitches of its last letter shaken loose."""
    a.rect(0, 0, 480, 160, fill=kit.NIGHT, filter=kit.felt_filter(a, shadow=0))
    kit.lamp(a, 420, 80, 150, kit.AMBER, 0.45)
    kit.xtext(a, "STEAD", 46, 44, 8, kit.BONE, shadow="#141a22")
    cells, _ = kit.text_cells("Y")
    for i, j in cells:  # the last letter trembles
        kit.crosses(a, [(0, 0)], 46 + 40 * 8 + i * 8 + a.rng.uniform(-3, 3), 44 + j * 8 + a.rng.uniform(-3, 3), 8, kit.AMBER)
    kit.thread(a, "M40,132H440", kit.mix(kit.BONE, kit.NIGHT, 0.4), w=2, dash="6 5", shadow=False)
    kit.shade(a, 0.3)


@asset(G, "ui-join-hold", group="ui", title="Join or Hold", w=900, h=200, row=ROW)
def join_hold(a: Art):
    """Two words stitched across the bottom of the view: JOIN in amber going to red, HOLD in bone, a knot between them."""
    a.rect(0, 0, 900, 200, fill=kit.CEDAR_D, filter=kit.felt_filter(a, shadow=0))
    kit.lamp(a, 230, 100, 240, kit.RED, 0.4)
    kit.lamp(a, 680, 100, 200, kit.SKY, 0.16)
    kit.xtext(a, "JOIN", 230, 52, 11, kit.AMBER, shadow=kit.RED, align="center")
    kit.xtext(a, "HOLD", 680, 52, 11, kit.BONE, shadow=kit.NIGHT, align="center")
    kit.thread(a, "M40,176H410M490,176H860", kit.mix(kit.BONE, kit.CEDAR, 0.4), w=2.4, dash="10 6")
    kit.icon(a, "knot", 450 - 28, 100 - 28, 0.56, kit.BONE, lw=3.4)
    kit.shade(a, 0.35)


@asset(G, "ui-warmth-meter", group="ui", title="The hunger meter", w=900, h=140, row=ROW)
def meter(a: Art):
    """The hunger meter: a row of thirty satin stitches running from attic dust through amber to red,
    two thirds of them worked, with the spread-three number in a stitched roundel."""
    kit.linen(a, kit.mix(kit.LINEN, kit.CEDAR, 0.25))
    for k in range(30):
        x = 60 + k * 23
        on = k < 20
        if on:
            a.rect(x, 44, 17, 52, rx=4, fill=kit.warmth(k / 29), stroke=kit.dark(kit.warmth(k / 29), 0.3), stroke_width=1)
            a.path(f"M{x + 4},48v44M{x + 9},48v44M{x + 13},48v44", stroke=kit.light(kit.warmth(k / 29), 0.4), stroke_width=1, opacity=0.6)
        else:
            a.rect(x, 44, 17, 52, rx=4, fill="none", stroke=kit.mix(kit.CEDAR, kit.LINEN, 0.3), stroke_width=1.4, stroke_dasharray="3 3")
    kit.lamp(a, 60 + 20 * 23, 70, 70, kit.AMBER, 0.6)
    a.circle(820, 70, 42, fill=kit.BONE, stroke=kit.RED, stroke_width=3, stroke_dasharray="7 4")
    a.text(820, 84, "67", size=40, family="serif", fill=kit.RED, text_anchor="middle", font_weight="bold")
    kit.thread(a, "M56,112H750", kit.CEDAR, w=1.8, dash="4 5", shadow=False)
    kit.shade(a, 0.25)


@asset(G, "ui-guest-card", group="ui", title="Guest card frame", w=300, h=420, row=ROW)
def guest_card(a: Art):
    """A guest card frame for the dollhouse HUD: a felt mount with an oval window for the portrait, a
    name tag, and a dread scale up one side with the flee line stitched across it at seventy."""
    a.rect(0, 0, 300, 420, fill=kit.mix(kit.DUST, kit.SKY, 0.25), filter=kit.felt_filter(a, shadow=0))
    kit.whip(a, R(12, 12, 276, 396, 14), kit.CEDAR, w=2, depth=11, gap=8)
    a.ellipse(132, 180, 92, 116, fill=kit.NIGHT)
    a.ellipse(132, 180, 92, 116, fill=a.radial([(0, kit.SKY, 0.35), (1, kit.NIGHT, 0)]))
    kit.thread(a, kit.E(132, 180, 100, 124), kit.BONE, w=3, dash="9 5")
    # dread scale
    for k in range(20):
        y = 330 - k * 14
        a.rect(248, y, 22, 10, rx=2, fill=kit.mix(kit.DUST, kit.NIGHT, k / 24) if k < 9 else "none",
               stroke=kit.mix(kit.CEDAR, kit.DUST, 0.3), stroke_width=1)
    y70 = 330 - 13.5 * 14 + 12
    kit.thread(a, f"M236,{f(y70)}h46", kit.RED, w=3, dash="6 3")
    a.text(259, 56, "70", size=15, family="serif", fill=kit.RED, text_anchor="middle", font_weight="bold")
    kit.tag(a, 44, 346, 176, 42, "", size=22, rot=-2)
    kit.shade(a, 0.25)


@asset(G, "ui-corner", group="ui", title="Corner ornament", w=240, h=240, row=ROW)
def corner(a: Art):
    """A corner ornament: two rows of stitching turning a corner on linen, a four-hole button sewn on at
    the turn and a small cross-stitch flower inside it."""
    kit.linen(a, kit.LINEN)
    kit.thread(a, "M30,230V52a22,22 0 0,1 22,-22H230", kit.CEDAR, w=4, dash="14 8")
    kit.whip(a, "M52,230V74a22,22 0 0,1 22,-22H230", kit.RUST, w=2, depth=12, gap=9)
    kit.button(a, 52, 52, 22, kit.MOSS)
    fl = [(2, 0), (1, 1), (2, 1), (3, 1), (0, 2), (1, 2), (3, 2), (4, 2), (1, 3), (2, 3), (3, 3), (2, 4)]
    kit.crosses(a, fl, 106, 106, 11, kit.RUST)
    kit.crosses(a, [(2, 2)], 106, 106, 11, kit.AMBER)
    kit.crosses(a, [(2, 5), (2, 6), (3, 6), (2, 7), (1, 7), (2, 8)], 106, 106, 11, kit.MOSS)
    kit.shade(a, 0.25)


@asset(G, "ui-night-clock", group="ui", title="The night clock", w=1200, h=140, row=ROW)
def night_clock(a: Art):
    """The dollhouse night clock, 23:00 to 05:00, as a ruled lithograph scale: the hours past are
    hatched in night blue and a small amber lamp marks the present hour."""
    ink = kit.INK
    a.paper(kit.light(kit.DUST, 0.35), grain=0.25, fibre=1.1)
    a.rect(12, 12, 1176, 116, fill="none", stroke=ink, stroke_width=2)
    a.rect(18, 18, 1164, 104, fill="none", stroke=ink, stroke_width=0.7)
    x0, x1, y = 90, 1110, 78
    now = x0 + (x1 - x0) * 3.2 / 6
    a.hatch(x0, y - 9, now - x0, 18, angle=60, spacing=5, stroke=kit.NIGHT, stroke_width=1.3,
            clip=a.clip(f'<rect x="{x0}" y="{y - 9}" width="{f(now - x0)}" height="18"/>'))
    a.rect(x0, y - 9, x1 - x0, 18, fill="none", stroke=ink, stroke_width=1.4)
    for i, h in enumerate(["23:00", "00:00", "01:00", "02:00", "03:00", "04:00", "05:00"]):
        x = x0 + (x1 - x0) * i / 6
        a.line(x, y - 18, x, y + 18, stroke=ink, stroke_width=1.6)
        a.text(x, y - 26, h, size=20, family="serif", fill=ink, text_anchor="middle")
        if i < 6:
            for k in range(1, 4):
                xx = x + (x1 - x0) / 24 * k
                a.line(xx, y - 9, xx, y + 14, stroke=ink, stroke_width=0.8)
    kit.lamp(a, now, y, 40, kit.AMBER, 0.9)
    a.path(P((now, y - 12), (now - 9, y + 22), (now + 9, y + 22)), fill=kit.AMBER, stroke=ink, stroke_width=1.2)
    kit.shade(a, 0.2)
