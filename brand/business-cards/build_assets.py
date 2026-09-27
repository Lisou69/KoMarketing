#!/usr/bin/env python3
"""Build opaque card art: traced white wordmark, burgundy silk, baked glass, QR."""

from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter
import segno

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
DPI = 600
BLEED_W_MM = 96.0
BLEED_H_MM = 61.0

# Logo burgundy sampled from the site wordmark.
BURGUNDY = np.array([76, 5, 12], dtype=np.float32)

# Glass panel and QR tile, millimetres from the bleed origin.
PANEL = dict(x=6.5, y=18.5, w=83.0, h=34.5, radius=2.4)
TILE = dict(x=61.7, y=23.95, w=23.6, h=23.6)


def px(mm):
    return mm / 25.4 * DPI


def rel_lum(rgb):
    def f(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (f(float(c)) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_white(rgb):
    return (1.05) / (rel_lum(rgb) + 0.05)


def fbm(h, w, rng, octaves=5):
    acc = np.zeros((h, w), np.float32)
    amp = 1.0
    total = 0.0
    for i in range(octaves):
        sh = max(3, h // (2 ** (i + 2)))
        sw = max(3, w // (2 ** (i + 2)))
        noise = rng.random((sh, sw), dtype=np.float32)
        img = Image.fromarray(noise, mode="F").resize((w, h), Image.Resampling.BICUBIC)
        acc += np.asarray(img, dtype=np.float32) * amp
        total += amp
        amp *= 0.55
    return acc / total


def make_silk(w, h, seed, base, amp):
    """Tone-on-tone burgundy silk. Lightness stays on the wine axis, not pink."""
    rng = np.random.default_rng(seed)
    ys = np.linspace(0, 1, h, dtype=np.float32)
    xs = np.linspace(0, 1, w, dtype=np.float32)
    y, x = np.meshgrid(ys, xs, indexing="ij")
    n1 = fbm(h, w, rng)
    n2 = fbm(h, w, rng)
    xw = x + (n1 - 0.5) * 0.07
    yw = y + (n2 - 0.5) * 0.045

    fold = np.sin((xw * 1.35 + yw * 2.6) * np.pi * 2.0)
    fold += 0.42 * np.sin((xw * 2.4 - yw * 1.15) * np.pi * 2.6 + 0.8)
    fold += 0.18 * np.sin((yw * 4.2 + n2 * 1.4) * np.pi + 0.4)
    fold = fold / (np.max(np.abs(fold)) + 1e-6)
    fold = gaussian_filter(fold, sigma=2.2).astype(np.float32)

    gy, gx = np.gradient(fold.astype(np.float32))
    sheen = gx * 0.55 - gy * 0.85
    lim = np.percentile(np.abs(sheen), 98) + 1e-6
    sheen = np.clip(sheen / lim, -1, 1)

    # Fine weave, a fraction of a millimetre, kept very quiet.
    weave = np.sin((xw * 210.0 + yw * 36.0) * np.pi)
    weave = gaussian_filter(weave, sigma=0.8).astype(np.float32)

    hi = np.clip(sheen, 0, 1)
    sh = np.clip(-sheen, 0, 1)
    delta = fold * amp + weave * (amp * 0.08)
    r = base[0] + delta * 1.00 + hi * amp * 0.55 - sh * amp * 0.42
    g = base[1] + delta * 0.07 + hi * amp * 0.05 - sh * amp * 0.04
    b = base[2] + delta * 0.16 + hi * amp * 0.09 - sh * amp * 0.08
    rgb = np.clip(np.stack([r, g, b], axis=-1), 0, 255)
    return rgb


def rounded_mask(h, w, radius_px):
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, w - 1, h - 1), radius=radius_px, fill=255)
    # Soften only the coverage edge, then bake. The saved image has no alpha.
    mask = mask.filter(ImageFilter.GaussianBlur(radius=0.7))
    return np.asarray(mask, dtype=np.float32) / 255.0


def bake_glass(rgb):
    """Frost the panel: blurred silk, thin light rim, soft top highlight, white QR tile."""
    h, w = rgb.shape[:2]
    x0 = int(round(px(PANEL["x"])))
    y0 = int(round(px(PANEL["y"])))
    pw = int(round(px(PANEL["w"])))
    ph = int(round(px(PANEL["h"])))
    radius = int(round(px(PANEL["radius"])))

    crop = rgb[y0:y0 + ph, x0:x0 + pw].copy()
    blurred = np.asarray(
        Image.fromarray(crop.astype(np.uint8), mode="RGB").filter(ImageFilter.GaussianBlur(radius=28)),
        dtype=np.float32,
    )
    # Lift along the same hue. Do not mix toward white.
    blurred *= 1.10
    yy = np.linspace(0, 1, ph, dtype=np.float32)[:, None]
    highlight = np.clip(1.0 - yy / 0.42, 0, 1) ** 1.6
    blurred[..., 0] += highlight * 16.0
    blurred[..., 1] += highlight * 1.4
    blurred[..., 2] += highlight * 2.6
    blurred = np.clip(blurred, 0, 255)

    mask = rounded_mask(ph, pw, radius)
    base = crop.astype(np.float32)
    panel = base * (1.0 - mask[..., None]) + blurred * mask[..., None]

    # Thin light rim, baked opaque.
    rim = Image.new("L", (pw, ph), 0)
    draw = ImageDraw.Draw(rim)
    inset = max(1, int(round(px(0.16))))
    draw.rounded_rectangle(
        (inset, inset, pw - 1 - inset, ph - 1 - inset),
        radius=max(1, radius - inset),
        outline=255,
        width=max(2, int(round(px(0.15)))),
    )
    rim_a = np.asarray(rim, dtype=np.float32) / 255.0
    rim_a *= mask
    light = np.array([226, 216, 208], dtype=np.float32)
    panel = panel * (1.0 - rim_a[..., None]) + light * rim_a[..., None]

    # QR tile, solid white, inside the glass.
    tx = int(round(px(TILE["x"]))) - x0
    ty = int(round(px(TILE["y"]))) - y0
    tw = int(round(px(TILE["w"])))
    th = int(round(px(TILE["h"])))
    panel[ty:ty + th, tx:tx + tw] = (255, 255, 255)

    out = rgb.copy()
    out[y0:y0 + ph, x0:x0 + pw] = np.clip(panel, 0, 255)
    return out.astype(np.uint8)


def save_rgb(path, rgb):
    im = Image.fromarray(rgb.astype(np.uint8), mode="RGB")
    im.save(path, "PNG", optimize=True)
    check = Image.open(path)
    if check.mode != "RGB":
        raise SystemExit(f"{path} is {check.mode}, expected RGB")


def report(name, rgb):
    flat = rgb.reshape(-1, 3)
    lum = 0.2126 * flat[:, 0] + 0.7152 * flat[:, 1] + 0.0722 * flat[:, 2]
    light = flat[int(np.argmax(lum))]
    dark = flat[int(np.argmin(lum))]
    ratio = flat[:, 1] / np.maximum(flat[:, 0], 1)
    print(
        f"{name}: mean {flat.mean(0).round(1)} light {light.round(1)} dark {dark.round(1)} "
        f"white-contrast {contrast_white(light):.2f} max G/R {ratio.max():.3f}"
    )
    if contrast_white(light) < 4.5:
        raise SystemExit(f"{name} fails AA for white text")
    if ratio.max() > 0.22:
        raise SystemExit(f"{name} drifts pink")


def trace_wordmark():
    source = ASSETS / "ko-wordmark-source.png"
    if not source.exists():
        raise SystemExit("missing assets/ko-wordmark-source.png")
    src = Image.open(source).convert("RGBA")
    alpha = src.getchannel("A")
    up = alpha.resize((alpha.width * 4, alpha.height * 4), Image.Resampling.LANCZOS)
    bw = up.point(lambda p: 0 if p > 128 else 255)
    pbm = ASSETS / "_wordmark.pbm"
    raw = ASSETS / "_wordmark-raw.svg"
    bw.save(pbm)
    subprocess.check_call(
        ["potrace", "-s", "-o", str(raw), "--flat", "-t", "12", "-a", "1.05", "-O", "0.18", str(pbm)]
    )
    text = raw.read_text()
    text = text.replace('fill="#000000"', 'fill="#ffffff"')
    start = text.find("<svg")
    svg = text[start:]
    # Drop the legacy doctype; keep potrace paths.
    out = ASSETS / "ko-wordmark.svg"
    out.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        + svg.replace(
            'width="2356.000000pt" height="552.000000pt"',
            'width="2356" height="552"',
        )
    )
    pbm.unlink()
    raw.unlink()
    return out.read_text()


def build_qr_svg():
    qr = segno.make("https://komarketingagency.com", error="q")
    modules = list(qr.matrix_iter(scale=1, border=4))
    n = len(modules)
    parts = []
    for y, row in enumerate(modules):
        x = 0
        while x < n:
            if not row[x]:
                x += 1
                continue
            x1 = x
            while x1 < n and row[x1]:
                x1 += 1
            parts.append(f"M{x} {y}h{x1 - x}v1h-{x1 - x}z")
            x = x1
    body = "".join(parts)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
        f'width="{n}" height="{n}" fill="none">'
        f'<rect width="{n}" height="{n}" fill="#ffffff"/>'
        f'<path fill="#1a0905" d="{body}"/>'
        f"</svg>"
    )
    (ASSETS / "qr.svg").write_text(svg)
    return svg, n


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    w = int(round(px(BLEED_W_MM)))
    h = int(round(px(BLEED_H_MM)))
    print("canvas", w, h, "dpi", DPI)

    front = make_silk(w, h, seed=7, base=BURGUNDY, amp=26.0)
    report("front", front)
    save_rgb(ASSETS / "front-bg.png", front.astype(np.uint8))

    back_base = np.array([98, 7, 16], dtype=np.float32)
    back = make_silk(w, h, seed=11, base=back_base, amp=20.0)
    back = bake_glass(back)
    tx = int(round(px(TILE["x"])))
    ty = int(round(px(TILE["y"])))
    tw = int(round(px(TILE["w"])))
    th = int(round(px(TILE["h"])))
    silk_only = back.copy()
    x0 = int(round(px(PANEL["x"])))
    y0 = int(round(px(PANEL["y"])))
    pw = int(round(px(PANEL["w"])))
    ph = int(round(px(PANEL["h"])))
    silk_only[y0:y0 + ph, x0:x0 + pw] = back_base
    report("back silk", silk_only)
    inset = int(round(px(1.2)))
    interior = back[y0 + inset:y0 + ph - inset, x0 + inset:x0 + pw - inset].copy()
    # Ignore the white QR tile when judging text contrast on the glass.
    ix = tx - (x0 + inset)
    iy = ty - (y0 + inset)
    interior[iy:iy + th, ix:ix + tw] = back_base
    report("glass interior", interior)
    save_rgb(ASSETS / "back-bg.png", back)

    trace_wordmark()
    svg, n = build_qr_svg()
    print("qr modules", n, "tile mm", TILE["w"], "data mm", TILE["w"] * 29 / n)
    print("wrote assets")


if __name__ == "__main__":
    main()
