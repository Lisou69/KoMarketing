#!/usr/bin/env python3
"""Opaque card art: silk photograph across the front, one frosted QR tile on the back."""

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
# The tile matches the height of the back text block. The symbol sits low in the
# tile so the silk across the top stays out of the quiet zone.
QR_GLASS = (57.6, 15.0, 30.4, 31.0)
QR_GLASS_R = 2.8
QR_SYMBOL = (60.7, 21.0, 24.2, 24.2)
# Front. Bleed coordinates. The wordmark is centered on the card. The tagline stays lower left.
FRONT_LOGO = (14.0, 22.53, 68.0, 15.94)
FRONT_TAG = (13.0, 47.05, 17.6, 6.0)
BACK_TEXT = (7.5, 14.5, 50.0, 32.0)
INK = np.array([76.0, 5.0, 12.0], dtype=np.float32)
SHADOW = np.array([16.0, 1.0, 4.0], dtype=np.float32)
WHITE = np.array([255.0, 255.0, 255.0], dtype=np.float32)

# Frosted recipe for the single QR tile.
GLASS_FILL = 0.15
GLASS_BLUR_MM = 1.75
GLASS_BORDER_PT = 0.28
GLASS_BORDER = 0.30
GLASS_INNER_DY_MM = 0.6
GLASS_INNER_BLUR_MM = 1.8
GLASS_INNER = 0.10
GLASS_SHADOW_MM = 2.0
GLASS_SHADOW_OPACITY = 0.16
GLASS_SHADOW_DY = 0.6


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


def composite_ribbon(base, silk, center_mm, width_mm, angle, tone=0.95, thickness_mm=None):
    """Bake the ribbon's own alpha onto the opaque ground. No alpha remains.

    thickness_mm sets the cross-axis size independently so the sweep can be a
    thin ribbon instead of a slab of the source artwork.
    """
    h, w = base.shape[:2]
    target_w = max(1, int(round(px(width_mm))))
    if thickness_mm is None:
        target_h = max(1, int(round(silk.height * target_w / silk.width)))
    else:
        target_h = max(1, int(round(px(thickness_mm))))
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


def inner_glow(inside):
    """Soft white glow along the top interior. Stays inside the rounded mask."""
    sigma = max(float(px(GLASS_INNER_BLUR_MM)), 0.8)
    oy = int(round(px(GLASS_INNER_DY_MM)))
    pad = int(np.ceil(sigma * 3.0 + oy)) + 2
    h, w = inside.shape
    buf = np.zeros((h + 2 * pad, w + 2 * pad), np.float32)
    buf[pad:pad + h, pad:pad + w] = inside
    outside = 1.0 - buf
    shifted = np.zeros_like(outside)
    if oy > 0:
        shifted[oy:, :] = outside[:-oy, :]
    else:
        shifted = outside
    blurred = gaussian_filter(shifted, sigma=sigma, mode="constant", cval=0.0)
    return blurred[pad:pad + h, pad:pad + w] * inside


def apply_glass(canvas, source, box, radius_mm):
    """Shared frosted glass: blurred silk, 15% white, hairline, inner glow, rim."""
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

    blit_shadow(
        canvas, x, y, inside,
        sigma_mm=GLASS_SHADOW_MM,
        opacity=GLASS_SHADOW_OPACITY,
        dy_mm=GLASS_SHADOW_DY,
        dx_mm=0.0,
    )

    blur_px = max(float(px(GLASS_BLUR_MM)), 0.6)
    blurred, spad = blurred_source(source, blur_px, 0.0)
    rgb = sample(blurred, yy + y + spad, xx + x + spad)
    glass = rgb * (1.0 - GLASS_FILL) + WHITE * GLASS_FILL

    glow = inner_glow(inside)
    glass = glass * (1.0 - glow[..., None] * GLASS_INNER) + WHITE * (glow[..., None] * GLASS_INNER)

    # Crisp inside hairline, about 0.28 pt, white at 30%.
    stroke_px = max(float(px(GLASS_BORDER_PT * 25.4 / 72.0)), 1.0)
    stroke = np.clip(1.0 + dist / stroke_px, 0.0, 1.0) * np.clip(-dist / 1.25, 0.0, 1.0)
    glass = glass * (1.0 - stroke[..., None] * GLASS_BORDER) + WHITE * (stroke[..., None] * GLASS_BORDER)

    # Convex rim: bright where the surface faces up-left, dark along the bottom.
    rim_px = min(float(px(2.2)), min(h, w) * 0.2)
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


def save_rgb(path, rgb):
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    im.save(path, "PNG", optimize=True)
    check = Image.open(path)
    if check.mode != "RGB":
        raise SystemExit(f"{path.name} saved as {check.mode}")


def contrast_ratio(ink, bg):
    dark, light = sorted((rel_lum(ink), rel_lum(bg)))
    return (light + 0.05) / (dark + 0.05)


def contrast_in(rgb, box, label, minimum=7.0):
    x, y, w, h = (int(round(px(v))) for v in box)
    crop = rgb[y:y + h, x:x + w].reshape(-1, 3)
    lum = 0.2126 * crop[:, 0] + 0.7152 * crop[:, 1] + 0.0722 * crop[:, 2]
    light = crop[int(np.argmax(lum))]
    ratio = contrast_white(light)
    print(f"{label}: lightest {light.round(1)} white-contrast {ratio:.2f}")
    if ratio < minimum:
        raise SystemExit(f"{label} contrast {ratio:.2f} is under {minimum:.1f}")
    return ratio


def contrast_ink(rgb, box, label, minimum):
    """Burgundy ink. The worst pixel is the lightest ground behind the letters."""
    x, y, w, h = (int(round(px(v))) for v in box)
    crop = rgb[y:y + h, x:x + w].reshape(-1, 3)
    lum = 0.2126 * crop[:, 0] + 0.7152 * crop[:, 1] + 0.0722 * crop[:, 2]
    light = crop[int(np.argmax(lum))]
    ratio = contrast_ratio(INK, light)
    print(f"{label}: lightest ground {light.round(1)} burgundy-contrast {ratio:.2f}")
    if ratio < minimum:
        raise SystemExit(f"{label} contrast {ratio:.2f} is under {minimum:.1f}")
    return ratio


def contrast_on_silk(rgb, box, label, minimum):
    """Dark burgundy ink. The worst pixel is the darkest silk behind the letters."""
    x, y, w, h = (int(round(px(v))) for v in box)
    crop = rgb[y:y + h, x:x + w].reshape(-1, 3)
    lum = 0.2126 * crop[:, 0] + 0.7152 * crop[:, 1] + 0.0722 * crop[:, 2]
    dark = crop[int(np.argmin(lum))]
    ratio = contrast_ratio(INK, dark)
    print(f"{label}: darkest silk {dark.round(1)} burgundy-contrast {ratio:.2f}")
    if ratio < minimum:
        raise SystemExit(f"{label} contrast {ratio:.2f} is under {minimum:.1f}")
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
    text = raw.read_text().replace('fill="#000000"', 'fill="#4c050c"')
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
    # Inverted: white modules, no plate. The 4-module border is clear glass.
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
        f'width="{n}" height="{n}">'
        f'<path fill="#ffffff" d="{"".join(parts)}"/>'
        f"</svg>"
    )
    (ASSETS / "qr.svg").write_text(svg)
    return n


def build_front():
    """Cover the bleed with the silk photograph, including its own ground.

    The file is portrait. A 90° counterclockwise turn lays the quieter ground
    under the tagline and the folds across the wordmark. Lanczos scales it
    uniformly so the photo covers 96×61 mm; the extra width is cropped equally
    from both sides. No tint, sharpen, shadow, or second background.
    """
    h, w = int(round(px(61))), int(round(px(96)))
    src = Image.open(ASSETS / "silk-full-bg.jpg")
    if src.mode != "RGB":
        raise SystemExit(f"silk photograph is {src.mode}, expected RGB")
    rot = src.transpose(Image.Transpose.ROTATE_90)
    scale = max(w / rot.width, h / rot.height)
    nw = int(round(rot.width * scale))
    nh = int(round(rot.height * scale))
    if nw < w or nh < h:
        raise SystemExit(f"cover scale undershoots {(nw, nh)} vs {(w, h)}")
    resized = rot.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    cropped = resized.crop((left, top, left + w, top + h))
    if cropped.size != (w, h) or cropped.mode != "RGB":
        raise SystemExit(f"front crop is {cropped.size} {cropped.mode}")
    print(
        f"front photo {src.size[0]}x{src.size[1]} rot90 {rot.size[0]}x{rot.size[1]} "
        f"-> {nw}x{nh} crop {left}px left, {top}px top "
        f"({left / px(1):.2f}mm / {top / px(1):.2f}mm)"
    )
    return np.asarray(cropped).astype(np.float32)


def build_back(silk):
    h, w = int(round(px(61))), int(round(px(96)))
    base = field(w, h)
    # Enters from the top edge, crosses the QR glass, and stays off the type and the code.
    base = composite_ribbon(
        base, silk, (88.0, 10.0), 170.0, -8.0, tone=0.97, thickness_mm=24.0
    )
    scene = base.copy()
    clear_blurs()
    apply_glass(scene, base, QR_GLASS, QR_GLASS_R)
    return scene, base


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    silk = load_silk()
    print(
        "qr glass fill", GLASS_FILL, "blur", GLASS_BLUR_MM,
        "radius", QR_GLASS_R,
    )
    print("canvas", int(round(px(96))), int(round(px(61))), "dpi", DPI)
    front = build_front()
    back, back_base = build_back(silk)
    if os.environ.get("CARD_PREVIEW"):
        for name, rgb in (("front", front), ("back", back)):
            im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
            im.thumbnail((1100, 800), Image.Resampling.LANCZOS)
            im.save(f"/tmp/ko-{name}.jpg", quality=90)
    contrast_ink(front, FRONT_LOGO, "front logo lightest", 4.5)
    contrast_on_silk(front, FRONT_LOGO, "front logo darkest", 4.5)
    contrast_ink(front, FRONT_TAG, "front tagline", 4.5)
    save_rgb(ASSETS / "front-bg.png", front)
    contrast_in(back, BACK_TEXT, "back type")
    trace_wordmark()
    n = build_qr_svg()
    module = QR_SYMBOL[2] / n
    quiet = 4 * module
    sx, sy, ss, _ = QR_SYMBOL
    data_box = (sx + quiet, sy + quiet, ss - 2 * quiet, ss - 2 * quiet)
    # White modules on the glass. The worst pixel is the lightest glass under them.
    contrast_in(back, data_box, "under the QR")
    contrast_in(back, QR_SYMBOL, "QR quiet zone")
    qx, qy, qw, qh = QR_GLASS
    rim = back_base[int(px(qy)):int(px(qy + 3.2)), int(px(qx)):int(px(qx + qw))]
    rim_l = 0.2126 * rim[..., 0] + 0.7152 * rim[..., 1] + 0.0722 * rim[..., 2]
    print(f"qr glass top band silk fraction {(rim_l > 100).mean():.2f}")
    save_rgb(ASSETS / "back-bg.png", back)
    data_mm = data_box[2]
    print(f"qr modules {n} symbol {ss}mm quiet {quiet:.2f}mm data {data_mm:.2f}mm")
    if data_mm < 18:
        raise SystemExit("QR data area is under 18 mm")
    print("wrote assets")


if __name__ == "__main__":
    main()
