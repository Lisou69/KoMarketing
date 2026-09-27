#!/usr/bin/env python3
"""Opaque card art: site silk ribbon on burgundy, liquid glass baked in."""

from pathlib import Path
import subprocess

import os

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates
import segno

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
DPI = int(os.environ.get("CARD_DPI", "600"))

# Site wordmark burgundy, kept deep rather than bright red.
BURGUNDY = np.array([76.0, 5.0, 12.0], dtype=np.float32)
DEEP = np.array([36.0, 2.0, 6.0], dtype=np.float32)
HIGHLIGHT = np.array([255.0, 248.0, 242.0], dtype=np.float32)

# Millimetres from the bleed origin. cards.html uses the same numbers.
FRONT_PILL = (8.0, 13.2, 80.0, 34.6)
FRONT_PILL_R = 17.3
BACK_CARD = (6.4, 4.8, 83.2, 51.4)
BACK_CARD_R = 6.4
PILL_X, PILL_W, PILL_H = 10.6, 45.2, 5.15
PILL_YS = (19.4, 25.55, 31.7, 37.85)
QR_GLASS = (58.6, 16.2, 28.6, 28.6)
QR_GLASS_R = 7.0
QR_WHITE = (61.0, 18.6, 23.8, 23.8)
QR_WHITE_R = 2.2
SHADOW = np.array([16.0, 1.0, 4.0], dtype=np.float32)


def px(mm):
    return mm / 25.4 * DPI


def rel_lum(rgb):
    def f(c):
        c = float(c) / 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (f(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_white(rgb):
    return 1.05 / (rel_lum(rgb) + 0.05)


def field(w, h):
    """Clean deep burgundy with a very slight vertical falloff."""
    y = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    top = np.array([84.0, 6.0, 14.0], dtype=np.float32)
    bot = np.array([54.0, 3.0, 8.0], dtype=np.float32)
    col = top * (1.0 - y) + bot * y
    rgb = np.empty((h, w, 3), dtype=np.float32)
    rgb[:] = col[:, None, :]
    return rgb


def load_silk():
    return Image.open(ASSETS / "silk-element.png").convert("RGBA")


def composite_ribbon(base, silk, center_mm, width_mm, angle, tone=0.95):
    """Bake the ribbon's own alpha onto the opaque ground. No alpha remains."""
    h, w = base.shape[:2]
    target_w = max(1, int(round(px(width_mm))))
    scale = target_w / silk.width
    target_h = max(1, int(round(silk.height * scale)))
    resized = silk.resize((target_w, target_h), Image.Resampling.LANCZOS)
    arr = np.asarray(resized).astype(np.float32)
    arr[..., :3] *= tone
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    rot = im.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    r = np.asarray(rot).astype(np.float32)
    rh, rw = r.shape[:2]
    cx, cy = int(round(px(center_mm[0]))), int(round(px(center_mm[1])))
    x0, y0 = cx - rw // 2, cy - rh // 2
    x1, y1 = max(0, x0), max(0, y0)
    x2, y2 = min(w, x0 + rw), min(h, y0 + rh)
    if x2 <= x1 or y2 <= y1:
        return base
    sx1, sy1 = x1 - x0, y1 - y0
    patch = r[sy1:sy1 + (y2 - y1), sx1:sx1 + (x2 - x1)]
    a = patch[..., 3:4] / 255.0
    dst = base[y1:y2, x1:x2]
    base[y1:y2, x1:x2] = dst * (1.0 - a) + patch[..., :3] * a
    return base


def sdf_round_box(h, w, rad):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    rad = min(rad, w / 2.0 - 0.5, h / 2.0 - 0.5)
    qx = np.abs(xx - cx) - (w / 2.0 - rad)
    qy = np.abs(yy - cy) - (h / 2.0 - rad)
    outside = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2)
    inside = np.minimum(np.maximum(qx, qy), 0)
    dist = outside + inside - rad
    gy, gx = np.gradient(dist)
    nlen = np.sqrt(gx * gx + gy * gy) + 1e-6
    return dist, gx / nlen, gy / nlen, xx, yy


def sample(img, ys, xs):
    out = np.empty(xs.shape + (3,), np.float32)
    for c in range(3):
        out[..., c] = map_coordinates(img[..., c], [ys, xs], order=1, mode="nearest")
    return out


_BLUR_CACHE = {}


def clear_blurs():
    _BLUR_CACHE.clear()


def blurred_source(source, sigma, extra_px):
    """Blur the whole scene. Padding is at least 3x the radius, plus refraction travel."""
    pad = int(np.ceil(max(sigma, 0.6) * 3.0 + extra_px)) + 4
    key = (id(source), round(float(sigma), 2), pad)
    hit = _BLUR_CACHE.get(key)
    if hit is not None:
        return hit
    padded = np.pad(source, ((pad, pad), (pad, pad), (0, 0)), mode="edge")
    blurred = gaussian_filter(padded, sigma=(sigma, sigma, 0), mode="nearest")
    _BLUR_CACHE[key] = (blurred, pad)
    return blurred, pad


def blit_shadow(canvas, x, y, mask, *, sigma_mm=2.2, opacity=0.22, dy_mm=0.55, dx_mm=0.12):
    """Soft shadow from the rounded mask. The blur buffer is padded so it cannot clip square."""
    sigma = max(float(px(sigma_mm)), 0.8)
    pad = int(np.ceil(sigma * 3.0)) + int(np.ceil(abs(px(dy_mm)) + abs(px(dx_mm)))) + 2
    h, w = mask.shape
    buf = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    buf[pad:pad + h, pad:pad + w] = mask
    blurred = gaussian_filter(buf, sigma=sigma, mode="constant", cval=0.0)
    oy, ox = int(round(px(dy_mm))), int(round(px(dx_mm)))
    y1, x1 = y - pad + oy, x - pad + ox
    H, W = canvas.shape[:2]
    bh, bw = blurred.shape
    sy1, sx1 = max(0, -y1), max(0, -x1)
    dy1, dx1 = max(0, y1), max(0, x1)
    sy2 = bh - max(0, y1 + bh - H)
    sx2 = bw - max(0, x1 + bw - W)
    if sy2 <= sy1 or sx2 <= sx1:
        return
    sh = (blurred[sy1:sy2, sx1:sx2] * opacity)[..., None]
    view = canvas[dy1:dy1 + (sy2 - sy1), dx1:dx1 + (sx2 - sx1)]
    canvas[dy1:dy1 + (sy2 - sy1), dx1:dx1 + (sx2 - sx1)] = view * (1.0 - sh) + SHADOW * sh


def apply_glass(canvas, source, box, radius_mm, *, blur_mm=1.2, tint=0.2,
                bulge=0.07, bend_mm=1.6, zone_mm=6.0, lens_mm=1.8, rim_mm=1.8,
                shadow=True, shadow_mm=2.2, shadow_opacity=0.22, shadow_dy=0.55,
                darken=None):
    """Thick liquid glass: blurred refraction, lens bend, lit rim. Opaque."""
    H, W = canvas.shape[:2]
    x = int(round(px(box[0])))
    y = int(round(px(box[1])))
    w = int(round(px(box[2])))
    h = int(round(px(box[3])))
    x = max(0, min(W - 2, x))
    y = max(0, min(H - 2, y))
    w = min(w, W - x)
    h = min(h, H - y)
    if w < 4 or h < 4:
        return canvas
    rad = float(px(radius_mm))
    dist, nx, ny, xx, yy = sdf_round_box(h, w, rad)
    inside = np.clip(-dist / 1.35, 0, 1).astype(np.float32)

    if shadow:
        blit_shadow(
            canvas, x, y, inside,
            sigma_mm=shadow_mm, opacity=shadow_opacity, dy_mm=shadow_dy,
        )

    blur_px = max(float(px(blur_mm)), 0.6)
    bend = float(px(bend_mm))
    fringe_px = float(px(0.28))
    extra = bend + float(px(lens_mm)) + fringe_px
    blurred, spad = blurred_source(source, blur_px, extra)

    lcx, lcy = (w - 1) / 2.0, (h - 1) / 2.0
    lx = xx - lcx
    ly = yy - lcy
    rnorm = np.sqrt((lx / (w / 2.0)) ** 2 + (ly / (h / 2.0)) ** 2)
    rad_len = np.sqrt(lx * lx + ly * ly) + 1e-6
    # Magnify the middle, bow the picture across the lens, and bend hard at the rim.
    zoom = 1.0 - bulge * np.clip(1.05 - rnorm, 0, 1) ** 0.8
    radial = (np.clip(rnorm, 0, 1) ** 1.45) * float(px(lens_mm))
    edge = np.clip(1.0 + dist / max(px(zone_mm), 1.0), 0, 1) ** 0.9
    gx = x + lcx + lx * zoom + (lx / rad_len) * radial + nx * edge * bend + spad
    gy = y + lcy + ly * zoom + (ly / rad_len) * radial + ny * edge * bend + spad
    rgb = sample(blurred, gy, gx)
    fringe = edge * fringe_px
    rgb_r = sample(blurred, gy + ny * fringe, gx + nx * fringe)
    rgb_b = sample(blurred, gy - ny * fringe, gx - nx * fringe)
    rgb = rgb.copy()
    mix = edge * 0.55
    rgb[..., 0] = rgb[..., 0] * (1.0 - mix) + rgb_r[..., 0] * mix
    rgb[..., 2] = rgb[..., 2] * (1.0 - mix) + rgb_b[..., 2] * mix

    glass = rgb * (1.0 - tint) + BURGUNDY * tint

    if darken:
        kind = darken[0]
        if kind == "h":
            # Wide smoothstep. No vertical edge.
            _, x_full, x_clear, amount = darken
            span = max(px(x_clear - x_full), 1.0)
            t = np.clip((xx - px(x_full)) / span, 0.0, 1.0)
            m = (1.0 - t * t * (3.0 - 2.0 * t)) * amount
        elif kind == "sdf":
            # Follows the rounded shape and feathers toward the rim.
            _, reach_mm, amount = darken
            m = np.clip((-dist) / max(px(reach_mm), 1.0), 0.0, 1.0) * amount
        else:
            raise ValueError(kind)
        glass = glass * (1.0 - m[..., None]) + BURGUNDY * m[..., None]

    # Convex rim: bright where the surface faces up-left, dark along the bottom.
    rim_px = min(float(px(rim_mm)), min(h, w) * 0.2)
    depth = np.maximum(-dist, 0.0)
    edge_zone = np.clip(1.0 - depth / max(rim_px, 1.0), 0, 1)
    edge_zone = edge_zone ** 0.72
    nx3 = nx * edge_zone
    ny3 = ny * edge_zone
    nz = np.sqrt(np.clip(1.0 - edge_zone * edge_zone, 0, 1))
    light = np.array([-0.28, -0.82, 0.50], dtype=np.float32)
    light /= np.linalg.norm(light)
    view = np.array([0.0, 0.0, 1.0], dtype=np.float32)
    half = light + view
    half /= np.linalg.norm(half)
    ndotl = np.clip(nx3 * light[0] + ny3 * light[1] + nz * light[2], 0, 1)
    ndoth = np.clip(nx3 * half[0] + ny3 * half[1] + nz * half[2], 0, 1)
    fresnel = edge_zone ** 1.35
    groove = np.exp(-((edge_zone - 0.62) ** 2) / (2.0 * 0.07 ** 2)) * fresnel
    glass = glass * (1.0 - groove[..., None] * 0.28) + DEEP * (groove[..., None] * 0.28)
    down = np.clip(ny3, 0, 1) ** 1.15
    glass = glass * (1.0 - down[..., None] * 0.5) + DEEP * (down[..., None] * 0.5)
    spec = (ndoth ** 46) * fresnel
    sheen = (ndotl ** 0.65) * (0.18 + 0.82 * fresnel)
    gain = np.clip(spec * 1.05 + sheen * 0.72, 0, 1)
    glass = glass * (1.0 - gain[..., None] * 0.86) + HIGHLIGHT * (gain[..., None] * 0.86)
    # Light iridescent fringe, stronger on the lit rim.
    cool = fresnel * np.clip(-ny * 0.75 + -nx * 0.45, 0, 1)
    warm = fresnel * np.clip(ny * 0.65 + nx * 0.35, 0, 1)
    glass[..., 0] += warm * 16.0 - cool * 6.0
    glass[..., 1] += cool * 8.0 - warm * 3.0
    glass[..., 2] += cool * 18.0 - warm * 4.0

    cov = inside[..., None]
    canvas[y:y + h, x:x + w] = canvas[y:y + h, x:x + w] * (1.0 - cov) + glass * cov
    return canvas


def paint_round(canvas, box, radius_mm, color):
    x = int(round(px(box[0])))
    y = int(round(px(box[1])))
    w = int(round(px(box[2])))
    h = int(round(px(box[3])))
    dist, _, _, _, _ = sdf_round_box(h, w, float(px(radius_mm)))
    cov = np.clip(-dist / 1.2, 0, 1).astype(np.float32)[..., None]
    color = np.array(color, dtype=np.float32)
    canvas[y:y + h, x:x + w] = canvas[y:y + h, x:x + w] * (1.0 - cov) + color * cov
    return canvas


def save_rgb(path, rgb):
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    im.save(path, "PNG", optimize=True)
    check = Image.open(path)
    if check.mode != "RGB":
        raise SystemExit(f"{path.name} saved as {check.mode}")


def contrast_in(rgb, box, label):
    x, y, w, h = (int(round(px(v))) for v in box)
    crop = rgb[y:y + h, x:x + w].reshape(-1, 3)
    lum = 0.2126 * crop[:, 0] + 0.7152 * crop[:, 1] + 0.0722 * crop[:, 2]
    light = crop[int(np.argmax(lum))]
    ratio = contrast_white(light)
    print(f"{label}: lightest {light.round(1)} white-contrast {ratio:.2f}")
    if ratio < 4.5:
        raise SystemExit(f"{label} fails AA ({ratio:.2f})")
    return ratio


def trace_wordmark():
    source = ASSETS / "ko-wordmark-source.png"
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
    text = raw.read_text().replace('fill="#000000"', 'fill="#ffffff"')
    svg = text[text.find("<svg"):]
    (ASSETS / "ko-wordmark.svg").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        + svg.replace('width="2356.000000pt" height="552.000000pt"', 'width="2356" height="552"')
    )
    pbm.unlink()
    raw.unlink()


def build_qr_svg():
    qr = segno.make("https://komarketingagency.com", error="q")
    modules = list(qr.matrix_iter(scale=1, border=4))
    n = len(modules)
    parts = []
    for yy, row in enumerate(modules):
        x = 0
        while x < n:
            if not row[x]:
                x += 1
                continue
            x1 = x
            while x1 < n and row[x1]:
                x1 += 1
            parts.append(f"M{x} {yy}h{x1 - x}v1h-{x1 - x}z")
            x = x1
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
        f'width="{n}" height="{n}">'
        f'<rect width="{n}" height="{n}" fill="#ffffff"/>'
        f'<path fill="#1a0905" d="{"".join(parts)}"/>'
        f"</svg>"
    )
    (ASSETS / "qr.svg").write_text(svg)
    return n


def build_front(silk):
    h, w = int(round(px(61))), int(round(px(96)))
    base = field(w, h)
    # Broad diagonal sweep. The pill sits on top of it.
    # The silk's edge crosses the right of the pill. The logo sits on the burgundy side.
    base = composite_ribbon(base, silk, (74.0, 0.0), 198.0, -14.0, tone=0.97)
    scene = base.copy()
    clear_blurs()
    apply_glass(
        scene, base, FRONT_PILL, FRONT_PILL_R,
        blur_mm=0.9, tint=0.08, bulge=0.13, bend_mm=5.5, zone_mm=11.0,
        lens_mm=6.5, rim_mm=3.2,
        shadow_mm=2.5, shadow_opacity=0.2, shadow_dy=0.7,
        darken=("h", 52.0, 80.0, 0.86),
    )
    return scene, base


def build_back(silk):
    h, w = int(round(px(61))), int(round(px(96)))
    base = field(w, h)
    # The ribbon crosses the card so the glass can refract it.
    base = composite_ribbon(base, silk, (78.0, 6.0), 162.0, -12.0, tone=0.97)
    scene = base.copy()
    clear_blurs()
    apply_glass(
        scene, base, BACK_CARD, BACK_CARD_R,
        blur_mm=1.05, tint=0.1, bulge=0.08, bend_mm=3.6, zone_mm=8.0,
        lens_mm=4.2, rim_mm=2.6,
        shadow_mm=2.6, shadow_opacity=0.18, shadow_dy=0.75,
        darken=("h", 50.0, 78.0, 0.76),
    )
    for py in PILL_YS:
        apply_glass(
            scene, base, (PILL_X, py, PILL_W, PILL_H), PILL_H / 2.0,
            blur_mm=0.65, tint=0.08, bulge=0.06, bend_mm=0.7, zone_mm=1.8,
            lens_mm=0.45, rim_mm=0.85,
            shadow_mm=1.35, shadow_opacity=0.16, shadow_dy=0.4,
            darken=("sdf", 1.05, 0.8),
        )
    apply_glass(
        scene, base, QR_GLASS, QR_GLASS_R,
        blur_mm=0.8, tint=0.06, bulge=0.1, bend_mm=2.4, zone_mm=5.5,
        lens_mm=2.4, rim_mm=1.7,
        shadow_mm=1.7, shadow_opacity=0.15, shadow_dy=0.5,
    )
    paint_round(scene, QR_WHITE, QR_WHITE_R, (255, 255, 255))
    return scene, base


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    silk = load_silk()
    print("canvas", int(round(px(96))), int(round(px(61))), "dpi", DPI)
    front, front_base = build_front(silk)
    back, back_base = build_back(silk)
    if os.environ.get("CARD_PREVIEW"):
        for name, rgb in (
            ("front", front),
            ("back", back),
            ("front-base", front_base),
            ("back-base", back_base),
        ):
            im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
            im.thumbnail((1100, 800), Image.Resampling.LANCZOS)
            im.save(f"/tmp/ko-{name}.jpg", quality=90)
    fx, fy, fw, fh = FRONT_PILL
    contrast_in(front, (fx + 6, fy + 9, 42.0, 16.5), "front text")
    save_rgb(ASSETS / "front-bg.png", front)
    contrast_in(back, (11.2, 7.6, 44.0, 8.8), "back name")
    for py in PILL_YS:
        contrast_in(
            back,
            (PILL_X + 3.2, py + 1.15, PILL_W - 6.4, PILL_H - 2.3),
            f"pill {py}",
        )
    save_rgb(ASSETS / "back-bg.png", back)

    trace_wordmark()
    n = build_qr_svg()
    data_mm = QR_WHITE[2] * 29 / n
    print(f"qr modules {n} white tile {QR_WHITE[2]}mm data {data_mm:.2f}mm")
    if data_mm < 18:
        raise SystemExit("QR data area is under 18 mm")
    print("wrote assets")


if __name__ == "__main__":
    main()
