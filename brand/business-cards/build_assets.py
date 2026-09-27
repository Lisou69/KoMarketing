#!/usr/bin/env python3
"""Opaque card art: silk photograph on the front, burgundy backs with a silk corner."""

from pathlib import Path
import subprocess

import os

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
import segno

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
DPI = int(os.environ.get("CARD_DPI", "600"))

# Millimetres from the bleed origin. cards.html uses the same numbers.
# The symbol includes a 4-module quiet zone. It sits on flat burgundy.
QR_SYMBOL = (60.7, 21.0, 24.2, 24.2)
# Front. Bleed coordinates. The wordmark is 56 mm wide and centered. The tagline stays lower left.
FRONT_LOGO = (20.0, 23.94, 56.0, 13.13)
FRONT_TAG = (13.0, 47.05, 17.6, 6.0)
INK = np.array([76.0, 5.0, 12.0], dtype=np.float32)
# Phone pill, bleed millimetres. Height is the 8.5 pt em plus 2.5 mm above and
# below (~30 px at 96 dpi). Width fits the longer number, a 3 mm icon, and 4 mm
# of side padding. cards.html places the icon and the number on this shape.
PHONE_BTN = (8.2, 28.2, 35.1, 8.0)
DEEP = np.array([16.0, 0.0, 3.0], dtype=np.float32)


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


def css_mm(px_at_96):
    """A CSS pixel at 96 px per inch, in millimetres."""
    return px_at_96 * 25.4 / 96.0


def capsule_dist(xx, yy, left, top, width, height):
    """Signed distance in pixels. Negative inside a fully rounded pill."""
    rad = height * 0.5
    cx = left + width * 0.5
    cy = top + height * 0.5
    qx = np.abs(xx - cx) - (width * 0.5 - rad)
    qy = np.abs(yy - cy) - (height * 0.5 - rad)
    outside = np.hypot(np.maximum(qx, 0.0), np.maximum(qy, 0.0))
    inside = np.minimum(np.maximum(qx, qy), 0.0)
    return outside + inside - rad


def apply_phone_button(canvas, box):
    """Bake the frosted phone pill. The canvas stays opaque RGB.

    Screen recipe, at 96 px per inch: 15% white over a 20 px backdrop blur,
    a 1 px 30% white border, and an inset shadow of 0 8 px 24 px at 10% white.
    A thin lip runs along the top inner edge. A tight dark shadow sits under
    the pill only, so it does not halo.
    """
    x_mm, y_mm, w_mm, h_mm = box
    blur_sigma = float(px(css_mm(20)))
    border_w = float(px(css_mm(1)))
    inset_dy = float(px(css_mm(8)))
    # Chrome turns a box-shadow blur radius into this Gaussian sigma.
    inset_sigma = float(px((0.288675 * 24.0 + 0.5) * 25.4 / 96.0))
    shadow_dy = float(px(0.45))
    shadow_sigma = float(px(0.62))

    H, W = canvas.shape[:2]
    left, top = px(x_mm), px(y_mm)
    width, height = px(w_mm), px(h_mm)
    pad = int(np.ceil(blur_sigma * 3.2 + inset_sigma * 3.2 + inset_dy + shadow_sigma * 4 + shadow_dy)) + 6
    x0 = int(np.floor(left)) - pad
    y0 = int(np.floor(top)) - pad
    x1 = int(np.ceil(left + width)) + pad
    y1 = int(np.ceil(top + height)) + pad
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1, sy1 = min(W, x1), min(H, y1)
    src = canvas[sy0:sy1, sx0:sx1]
    window = np.pad(src, ((sy0 - y0, y1 - sy1), (sx0 - x0, x1 - sx1), (0, 0)), mode="edge")

    yy, xx = np.mgrid[0:window.shape[0], 0:window.shape[1]].astype(np.float32)
    xx = x0 + xx + 0.5
    yy = y0 + yy + 0.5
    dist = capsule_dist(xx, yy, left, top, width, height)
    # A little wider than one pixel, so the curve does not stair-step at 600 dpi.
    cover = np.clip(0.5 - dist / 1.55, 0.0, 1.0).astype(np.float32)

    blurred = gaussian_filter(window, sigma=(blur_sigma, blur_sigma, 0), mode="nearest")
    glass = blurred * 0.85 + 255.0 * 0.15

    outside = np.clip(dist + 0.5, 0.0, 1.0).astype(np.float32)
    spread = gaussian_filter(outside, sigma=inset_sigma, mode="nearest")
    oy = int(round(inset_dy))
    shifted = np.zeros_like(spread)
    if oy > 0:
        shifted[oy:, :] = spread[:-oy, :]
    else:
        shifted = spread
    inset = shifted * cover * 0.10
    glass = glass * (1.0 - inset[..., None]) + 255.0 * inset[..., None]

    gy, gx = np.gradient(dist)
    ny = gy / (np.sqrt(gx * gx + gy * gy) + 1e-6)
    lip_w = max(float(px(0.20)), 1.2)
    lip = np.clip(1.0 - np.clip(-dist, 0.0, None) / lip_w, 0.0, 1.0)
    lip *= np.clip(-ny, 0.0, 1.0) * cover
    glass = glass * (1.0 - lip[..., None] * 0.50) + 255.0 * (lip[..., None] * 0.50)

    outer = cover
    inner = np.clip(0.5 - (dist + border_w) / 1.55, 0.0, 1.0)
    stroke = np.clip(outer - inner, 0.0, 1.0)
    glass = glass * (1.0 - stroke[..., None] * 0.30) + 255.0 * (stroke[..., None] * 0.30)

    shade = gaussian_filter(cover, sigma=shadow_sigma, mode="nearest")
    dy = max(1, int(round(shadow_dy)))
    dropped = np.zeros_like(shade)
    dropped[dy:, :] = shade[:-dy, :]
    fade = np.clip((yy - (top + height - px(0.20))) / px(0.85), 0.0, 1.0)
    dropped *= fade * 0.34
    base = window * (1.0 - dropped[..., None]) + DEEP * dropped[..., None]
    base = base * (1.0 - cover[..., None]) + glass * cover[..., None]

    canvas[sy0:sy1, sx0:sx1] = base[(sy0 - y0):(sy0 - y0) + (sy1 - sy0), (sx0 - x0):(sx0 - x0) + (sx1 - sx0)]
    qx, qy, qs, _ = QR_SYMBOL
    gap_x = qx - (x_mm + w_mm)
    if gap_x < 2.0:
        raise SystemExit(f"phone pill is {gap_x:.2f}mm from the QR")
    trim_left = x_mm - 3.0
    trim_top = y_mm - 3.0
    trim_right = 93.0 - (x_mm + w_mm)
    trim_bottom = 58.0 - (y_mm + h_mm)
    margins = (trim_left, trim_top, trim_right, trim_bottom)
    print(
        f"phone pill {w_mm:.2f}x{h_mm:.2f}mm "
        f"({h_mm / 25.4 * 96:.1f}px) margins {trim_left:.2f} {trim_top:.2f} "
        f"{trim_right:.2f} {trim_bottom:.2f}"
    )
    if min(margins) < 5.0:
        raise SystemExit(f"phone pill is under 5 mm from the trim {margins}")
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
    # Inverted: white modules, no plate. The 4-module border is the burgundy ground.
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
    plain = field(w, h)
    # Corner ribbon above the code. The symbol, quiet zone included, stays the field.
    base = composite_ribbon(
        plain.copy(), silk, (88.0, 10.0), 170.0, -8.0, tone=0.97, thickness_mm=24.0
    )
    x, y, s, _ = (int(round(px(v))) for v in QR_SYMBOL)
    delta = float(np.abs(base[y:y + s, x:x + s] - plain[y:y + s, x:x + s]).max())
    diff = np.abs(base - plain).max(axis=2) > 2.0
    ys, xs = np.where(diff)
    dx = np.where(xs < x, x - xs, np.where(xs >= x + s, xs - (x + s - 1), 0))
    dy = np.where(ys < y, y - ys, np.where(ys >= y + s, ys - (y + s - 1), 0))
    gap = float(np.hypot(dx, dy).min()) / px(1)
    print(f"silk clears the QR by {gap:.2f}mm; quiet-zone delta {delta:.3f}")
    if delta > 0.75:
        raise SystemExit(f"silk enters the QR quiet zone (delta {delta:.2f})")
    if gap < 1.5:
        raise SystemExit(f"silk is {gap:.2f}mm from the QR")
    apply_phone_button(base, PHONE_BTN)
    return base


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    silk = load_silk()
    print("canvas", int(round(px(96))), int(round(px(61))), "dpi", DPI)
    front = build_front()
    back = build_back(silk)
    if os.environ.get("CARD_PREVIEW"):
        for name, rgb in (("front", front), ("back", back)):
            im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
            im.thumbnail((1100, 800), Image.Resampling.LANCZOS)
            im.save(f"/tmp/ko-{name}.jpg", quality=90)
    contrast_ink(front, FRONT_LOGO, "front logo lightest", 4.5)
    contrast_on_silk(front, FRONT_LOGO, "front logo darkest", 4.5)
    contrast_ink(front, FRONT_TAG, "front tagline", 4.5)
    front_path = ASSETS / "front-bg.png"
    fresh = np.clip(front, 0, 255).astype(np.uint8)
    if front_path.exists() and np.array_equal(np.asarray(Image.open(front_path).convert("RGB")), fresh):
        print("front-bg.png unchanged")
    else:
        save_rgb(front_path, front)
    contrast_in(back, (7.5, 14.5, 50.0, 13.0), "back name")
    contrast_in(back, (12.2, 30.4, 27.0, 3.6), "phone label")
    contrast_in(back, (8.0, 37.6, 50.0, 14.0), "back contacts")
    trace_wordmark()
    n = build_qr_svg()
    module = QR_SYMBOL[2] / n
    quiet = 4 * module
    sx, sy, ss, _ = QR_SYMBOL
    data_box = (sx + quiet, sy + quiet, ss - 2 * quiet, ss - 2 * quiet)
    # White modules on burgundy. The worst pixel is the lightest ground under them.
    contrast_in(back, data_box, "under the QR")
    contrast_in(back, QR_SYMBOL, "QR quiet zone")
    save_rgb(ASSETS / "back-bg.png", back)
    data_mm = data_box[2]
    print(f"qr modules {n} symbol {ss}mm quiet {quiet:.2f}mm data {data_mm:.2f}mm")
    if data_mm < 18:
        raise SystemExit("QR data area is under 18 mm")
    print("wrote assets")


if __name__ == "__main__":
    main()
