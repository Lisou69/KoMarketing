#!/usr/bin/env python3
"""Opaque card art: silk photograph on the front, satin backs in logo burgundy."""

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

# Millimetres from the bleed origin. cards.html uses the same numbers.
# The symbol includes a 4-module quiet zone. White modules sit on the satin;
# the quiet zone and the gaps are the cloth itself. Bleed millimetres.
QR_SYMBOL = (60.7, 18.400, 24.2, 24.2)
QR_QUIET_MODULES = 4
# Front. Bleed coordinates. The wordmark is 56 mm wide and centered. The tagline stays lower left.
FRONT_LOGO = (20.0, 23.94, 56.0, 13.13)
FRONT_TAG = (13.0, 47.05, 17.6, 6.0)
INK = np.array([76.0, 5.0, 12.0], dtype=np.float32)
# Phone pill, bleed millimetres. 35.1 × 7.5 mm, full capsule (radius = height/2).
# The 8.5 pt number and the 2.4 mm icon stay centered on the pill. The gap to
# the role and the gap to the email badge match the 9 mm pill. cards.html
# places the icon and the number on this shape.
PHONE_BTN = (8.2, 22.910, 35.1, 7.5)
# Circular glass badges behind the mail, globe, and map-pin icons.
# Bleed millimetres. cards.html centers a 2.4 mm icon on each circle and
# starts the contact text on one shared left edge. Rows are 6.25 mm apart.
BADGE_D = 5.2
BADGE_LEFT = 8.2
BADGE_MAIL = (BADGE_LEFT, 31.960, BADGE_D, BADGE_D)
BADGE_WEB = (BADGE_LEFT, 38.210, BADGE_D, BADGE_D)
BADGE_PLACE = (BADGE_LEFT, 44.460, BADGE_D, BADGE_D)
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


def _srgb_to_lin(c):
    c = np.asarray(c, np.float32) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _lin_to_srgb(c):
    c = np.clip(c, 0.0, None)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1.0 / 2.4) - 0.055) * 255.0


def _linear_y(rgb):
    lin = _srgb_to_lin(rgb)
    return 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]


# Duotone stops. Hue stays on #4c050c; these are the lightness anchors.
SHADOW = np.array([26.0, 2.0, 4.0], dtype=np.float32)    # #1A0204
HIGHLIGHT = np.array([110.0, 14.0, 22.0], dtype=np.float32)  # #6E0E16
LUM_CAP = np.array([122.0, 20.0, 32.0], dtype=np.float32)    # #7A1420


def _lin_to_xyz(lin):
    matrix = np.array(
        [
            [0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041],
        ],
        dtype=np.float64,
    )
    return np.asarray(lin, np.float64) @ matrix.T


def _xyz_to_lab(xyz):
    white = np.array([0.95047, 1.0, 1.08883], dtype=np.float64)
    ratio = np.asarray(xyz, np.float64) / white
    eps = 216.0 / 24389.0
    kappa = 24389.0 / 27.0

    def f(t):
        return np.where(t > eps, np.cbrt(t), (kappa * t + 16.0) / 116.0)

    fx, fy, fz = f(ratio[..., 0]), f(ratio[..., 1]), f(ratio[..., 2])
    return np.stack([116.0 * fy - 16.0, 500.0 * (fx - fy), 200.0 * (fy - fz)], axis=-1)


def _lab_to_rgb(lab):
    lab = np.asarray(lab, np.float64)
    light, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    fy = (light + 16.0) / 116.0
    fx = fy + a / 500.0
    fz = fy - b / 200.0
    eps = 216.0 / 24389.0
    kappa = 24389.0 / 27.0

    def finv(t):
        cubed = t ** 3
        return np.where(cubed > eps, cubed, (116.0 * t - 16.0) / kappa)

    xyz = np.stack([finv(fx), finv(fy), finv(fz)], axis=-1) * np.array([0.95047, 1.0, 1.08883])
    matrix = np.array(
        [
            [3.2404542, -1.5371385, -0.4985314],
            [-0.9692660, 1.8760108, 0.0415560],
            [0.0556434, -0.2040259, 1.0572252],
        ],
        dtype=np.float64,
    )
    lin = np.clip(xyz @ matrix.T, 0.0, None)
    encoded = np.where(lin <= 0.0031308, 12.92 * lin, 1.055 * np.power(lin, 1.0 / 2.4) - 0.055)
    return np.clip(encoded, 0.0, 1.0) * 255.0


def _rgb_to_lab(rgb):
    return _xyz_to_lab(_lin_to_xyz(_srgb_to_lin(rgb)))


def _delta_e(lab_a, lab_b):
    return float(np.sqrt(np.sum((np.asarray(lab_a) - np.asarray(lab_b)) ** 2)))


def _hex(rgb):
    channels = [int(np.clip(round(float(c)), 0, 255)) for c in rgb]
    return "#" + "".join(f"{c:02X}" for c in channels)


def _hue_locked(light, chroma, hue):
    return np.array(
        [light, chroma * np.cos(hue), chroma * np.sin(hue)],
        dtype=np.float64,
    )


def recolor_satin(rgb):
    """Map satin lightness onto a burgundy duotone, hue locked to #4c050c.

    Shadows go to #1A0204, the median fold is exactly #4c050c, and the
    brightest fold stops at #6E0E16. Nothing on the cloth is brighter than
    that stop.
    """
    mid_lab = _rgb_to_lab(INK)
    hue = float(np.arctan2(mid_lab[2], mid_lab[1]))
    shadow_src = _rgb_to_lab(SHADOW)
    high_src = _rgb_to_lab(HIGHLIGHT)
    shadow_lab = _hue_locked(float(shadow_src[0]), float(np.hypot(shadow_src[1], shadow_src[2])), hue)
    high_lab = _hue_locked(float(high_src[0]), float(np.hypot(high_src[1], high_src[2])), hue)

    light = _rgb_to_lab(rgb)[..., 0]
    lo, hi = np.percentile(light, [1.0, 99.0])
    if hi <= lo:
        raise SystemExit("satin lightness has no range")
    span = np.clip((light - lo) / (hi - lo), 0.0, 1.0)
    median = float(np.median(span))
    gamma = np.log(0.5) / np.log(max(median, 1e-4))
    t = np.power(span, gamma)[..., None]
    lower = t <= 0.5
    mix = np.where(lower, t / 0.5, (t - 0.5) / 0.5)
    start = np.where(lower, shadow_lab, mid_lab)
    end = np.where(lower, mid_lab, high_lab)
    painted = _lab_to_rgb(start * (1.0 - mix) + end * mix).astype(np.float32)
    # The highlight stop is a hard ceiling. Grain added later stays under the
    # #7A1420 measurement cap; the cloth itself never passes #6E0E16.
    cap_y = float(_linear_y(HIGHLIGHT))
    over = _linear_y(painted) > cap_y
    if np.any(over):
        painted[over] = _lab_to_rgb(high_lab)
    shadow_rgb = _lab_to_rgb(shadow_lab)
    high_rgb = _lab_to_rgb(high_lab)
    print(
        f"satin duotone #4C050C gamma {gamma:.3f} "
        f"shadow {_hex(shadow_rgb)} highlight {_hex(high_rgb)} "
        f"L* std {float(np.std(_rgb_to_lab(painted)[..., 0])):.2f}"
    )
    return painted


def add_grain(rgb):
    """Break 8-bit steps in the smooth folds. The amplitude stays under 1 level."""
    rng = np.random.default_rng(7)
    noise = rng.normal(0.0, 0.55, rgb.shape).astype(np.float32)
    return np.clip(rgb + noise, 0.0, 255.0)


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


def _sample_rgb(img, ys, xs):
    out = np.empty(xs.shape + (3,), np.float32)
    for c in range(3):
        out[..., c] = map_coordinates(img[..., c], [ys, xs], order=1, mode="nearest")
    return out


def apply_phone_button(canvas, box):
    """Bake a narrow refractive glass pill. The canvas stays opaque RGB.

    Drawn at twice the card resolution, then resampled to 600 dpi. The rim is
    a fine bevel, about 0.3 mm: burgundy shows through it, displaced along
    the surface normal, with a faint chromatic split. Specular lines follow a
    top-left light.
    """
    x_mm, y_mm, w_mm, h_mm = box
    ss = 2
    rim = float(px(0.30))
    H, W = canvas.shape[:2]
    left, top = px(x_mm), px(y_mm)
    width, height = px(w_mm), px(h_mm)
    pad = int(px(7.0)) + 8
    x0 = int(np.floor(left)) - pad
    y0 = int(np.floor(top)) - pad
    x1 = int(np.ceil(left + width)) + pad
    y1 = int(np.ceil(top + height)) + pad
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1, sy1 = min(W, x1), min(H, y1)
    src = canvas[sy0:sy1, sx0:sx1]
    window = np.pad(src, ((sy0 - y0, y1 - sy1), (sx0 - x0, x1 - sx1), (0, 0)), mode="edge")
    big = np.asarray(
        Image.fromarray(np.clip(window, 0, 255).astype(np.uint8), "RGB").resize(
            (window.shape[1] * ss, window.shape[0] * ss), Image.Resampling.LANCZOS
        )
    ).astype(np.float32)

    bh, bw = big.shape[:2]
    row, col = np.mgrid[0:bh, 0:bw].astype(np.float32)
    xx = x0 + (col + 0.5) / ss
    yy = y0 + (row + 0.5) / ss
    dist = capsule_dist(xx, yy, left, top, width, height)
    gy, gx = np.gradient(dist)
    nlen = np.sqrt(gx * gx + gy * gy) + 1e-6
    nx, ny = gx / nlen, gy / nlen
    depth = np.clip(-dist, 0.0, None)
    cover = np.clip(0.5 - dist * ss / 1.35, 0.0, 1.0).astype(np.float32)

    # Convex bezel. u is 0 at the outer edge and 1 where the flat interior starts.
    u = np.clip(depth / rim, 0.0, 1.0)
    in_rim = depth < rim
    bevel = np.where(in_rim, np.clip(np.sin(np.clip(u, 0.0, 1.0) * np.pi), 0.0, 1.0) ** 0.55, 0.0).astype(np.float32)
    interior = np.clip((depth - rim) / max(px(0.35), 1.0), 0.0, 1.0)

    light = np.array([-0.42, -0.78], np.float32)
    light /= np.linalg.norm(light)
    facing = np.clip(nx * light[0] + ny * light[1], 0.0, 1.0)
    down = np.clip(ny, 0.0, 1.0)
    up = np.clip(-ny, 0.0, 1.0)

    # Grounding, painted before refraction so the rim can bend it.
    shadow_sigma = max(px(0.55) * ss, 1.0)
    shade = gaussian_filter(cover, sigma=shadow_sigma, mode="nearest")
    dy = max(1, int(round(px(0.42) * ss)))
    dropped = np.zeros_like(shade)
    dropped[dy:, :] = shade[:-dy, :]
    # Shadow starts below a gap so a light caustic can sit against the glass.
    below = np.clip((yy - (top + height + px(0.32))) / px(0.85), 0.0, 1.0)
    dropped *= below * 0.48
    ground = big * (1.0 - dropped[..., None]) + DEEP * dropped[..., None]
    gap = yy - (top + height)
    band = np.exp(-((gap - px(0.16)) ** 2) / (2.0 * px(0.13) ** 2))
    band *= np.clip(1.0 - np.abs(xx - (left + width * 0.5)) / (width * 0.46), 0.0, 1.0)
    band *= np.clip(1.0 - cover, 0.0, 1.0)
    glow = np.array([196.0, 168.0, 176.0], np.float32)
    ground = ground * (1.0 - band[..., None] * 0.62) + glow * (band[..., None] * 0.62)

    # Refraction stays inside the fine bevel. The bend is shorter so it does
    # not read as a wide rim.
    shift = bevel * px(0.70)
    refr = _sample_rgb(ground, (yy + ny * shift - y0) * ss - 0.5, (xx + nx * shift - x0) * ss - 0.5)
    delta = refr - ground
    refr = np.clip(ground + delta * 2.4, 0.0, 255.0)
    # Faint dispersion: red bends a little further than blue.
    red = _sample_rgb(ground, (yy + ny * shift * 1.22 - y0) * ss - 0.5, (xx + nx * shift * 1.22 - x0) * ss - 0.5)
    blue = _sample_rgb(ground, (yy + ny * shift * 0.78 - y0) * ss - 0.5, (xx + nx * shift * 0.78 - x0) * ss - 0.5)
    refr[..., 0] = np.clip(refr[..., 0] * 0.55 + red[..., 0] * 0.45, 0.0, 255.0)
    refr[..., 2] = np.clip(refr[..., 2] * 0.55 + blue[..., 2] * 0.45, 0.0, 255.0)

    frost = max(px(0.45) * ss, 1.0)
    blurred = gaussian_filter(ground, sigma=(frost, frost, 0), mode="nearest")
    v = np.clip((yy - top) / height, 0.0, 1.0)
    lift = 0.045 + 0.05 * (1.0 - v)
    body = blurred * (1.0 - lift[..., None]) + 255.0 * lift[..., None]
    body *= (1.0 - 0.05 * v)[..., None]

    # A light lift only, so the rim stays burgundy glass rather than a pink fill.
    slab = np.clip(0.03 + 0.04 * facing + 0.03 * down, 0.0, 0.10)
    rim_col = refr * (1.0 - slab[..., None]) + 255.0 * slab[..., None]
    glass = body * (1.0 - bevel[..., None]) + rim_col * bevel[..., None]

    # Dark groove where the bevel meets the flat face, kept inside the thin rim.
    groove_w = max(px(0.04), 0.45)
    groove = np.exp(-((depth - rim) ** 2) / (2.0 * groove_w ** 2)) * cover
    glass = glass * (1.0 - groove[..., None] * 0.28) + DEEP * (groove[..., None] * 0.28)

    # Specular. Bottom inner edge is a bright hairline; the top edge is thinner.
    bottom_w = max(px(0.032), 0.4)
    bottom = np.exp(-((depth - rim * 0.72) ** 2) / (2.0 * bottom_w ** 2))
    bottom *= down ** 0.45 * cover
    top_w = max(px(0.025), 0.35)
    top_line = np.exp(-((depth - rim * 0.28) ** 2) / (2.0 * top_w ** 2))
    top_line *= up * (0.45 + 0.55 * facing) * cover
    hot = (facing ** 2.4) * bevel * (0.35 + 0.65 * (up + 0.35 * np.clip(-nx, 0, 1)))
    glass = glass + (255.0 - glass) * (
        bottom[..., None] * 0.88 + top_line[..., None] * 0.18 + hot[..., None] * 0.10
    )
    # Outer lip, a hairline on the glass edge.
    lip_w = max(px(0.022), 0.3)
    lip = np.exp(-(depth ** 2) / (2.0 * lip_w ** 2)) * cover * (0.35 + 0.65 * facing)
    glass = glass + (255.0 - glass) * lip[..., None] * 0.20

    out = ground * (1.0 - cover[..., None]) + np.clip(glass, 0.0, 255.0) * cover[..., None]
    small = np.asarray(
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB").resize(
            (window.shape[1], window.shape[0]), Image.Resampling.LANCZOS
        )
    ).astype(np.float32)
    canvas[sy0:sy1, sx0:sx1] = small[(sy0 - y0):(sy0 - y0) + (sy1 - sy0), (sx0 - x0):(sx0 - x0) + (sx1 - sx0)]
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


def apply_glass_disc(canvas, box):
    """Bake a circular badge with the phone pill's glass, scaled to read small.

    The rim is 0.3 mm, with the same hairline highlights as the phone pill.
    The caustic and the shadow stay tighter so two badges can sit one line
    apart. Only the glass, caustic, and shadow are written back, so a
    neighbour is left alone.
    """
    x_mm, y_mm, w_mm, h_mm = box
    if abs(w_mm - h_mm) > 0.01:
        raise SystemExit(f"glass disc is not round: {w_mm} x {h_mm}")
    ss = 2
    rim = float(px(0.30))
    H, W = canvas.shape[:2]
    left, top = px(x_mm), px(y_mm)
    width, height = px(w_mm), px(h_mm)
    pad = int(px(3.2)) + 6
    x0 = int(np.floor(left)) - pad
    y0 = int(np.floor(top)) - pad
    x1 = int(np.ceil(left + width)) + pad
    y1 = int(np.ceil(top + height)) + pad
    sx0, sy0 = max(0, x0), max(0, y0)
    sx1, sy1 = min(W, x1), min(H, y1)
    src = canvas[sy0:sy1, sx0:sx1]
    window = np.pad(src, ((sy0 - y0, y1 - sy1), (sx0 - x0, x1 - sx1), (0, 0)), mode="edge")
    big = np.asarray(
        Image.fromarray(np.clip(window, 0, 255).astype(np.uint8), "RGB").resize(
            (window.shape[1] * ss, window.shape[0] * ss), Image.Resampling.LANCZOS
        )
    ).astype(np.float32)

    bh, bw = big.shape[:2]
    row, col = np.mgrid[0:bh, 0:bw].astype(np.float32)
    xx = x0 + (col + 0.5) / ss
    yy = y0 + (row + 0.5) / ss
    cx = left + width * 0.5
    cy = top + height * 0.5
    dist = np.hypot(xx - cx, yy - cy) - width * 0.5
    gy, gx = np.gradient(dist)
    nlen = np.sqrt(gx * gx + gy * gy) + 1e-6
    nx, ny = gx / nlen, gy / nlen
    depth = np.clip(-dist, 0.0, None)
    cover = np.clip(0.5 - dist * ss / 1.35, 0.0, 1.0).astype(np.float32)

    u = np.clip(depth / rim, 0.0, 1.0)
    in_rim = depth < rim
    bevel = np.where(in_rim, np.clip(np.sin(np.clip(u, 0.0, 1.0) * np.pi), 0.0, 1.0) ** 0.55, 0.0).astype(np.float32)

    light = np.array([-0.42, -0.78], np.float32)
    light /= np.linalg.norm(light)
    facing = np.clip(nx * light[0] + ny * light[1], 0.0, 1.0)
    down = np.clip(ny, 0.0, 1.0)
    up = np.clip(-ny, 0.0, 1.0)

    shadow_sigma = max(px(0.38) * ss, 1.0)
    shade = gaussian_filter(cover, sigma=shadow_sigma, mode="nearest")
    dy = max(1, int(round(px(0.28) * ss)))
    dropped = np.zeros_like(shade)
    dropped[dy:, :] = shade[:-dy, :]
    below = np.clip((yy - (top + height + px(0.20))) / px(0.50), 0.0, 1.0)
    dropped *= below * 0.48
    ground = big * (1.0 - dropped[..., None]) + DEEP * dropped[..., None]
    gap = yy - (top + height)
    band = np.exp(-((gap - px(0.11)) ** 2) / (2.0 * px(0.09) ** 2))
    band *= np.clip(1.0 - np.abs(xx - cx) / (width * 0.42), 0.0, 1.0)
    band *= np.clip(1.0 - cover, 0.0, 1.0)
    glow = np.array([196.0, 168.0, 176.0], np.float32)
    ground = ground * (1.0 - band[..., None] * 0.62) + glow * (band[..., None] * 0.62)

    # Stays inside this rim. A longer bend pulls in the badge above.
    shift = bevel * px(0.25)
    refr = _sample_rgb(ground, (yy + ny * shift - y0) * ss - 0.5, (xx + nx * shift - x0) * ss - 0.5)
    delta = refr - ground
    refr = np.clip(ground + delta * 1.6, 0.0, 255.0)
    red = _sample_rgb(ground, (yy + ny * shift * 1.12 - y0) * ss - 0.5, (xx + nx * shift * 1.12 - x0) * ss - 0.5)
    blue = _sample_rgb(ground, (yy + ny * shift * 0.88 - y0) * ss - 0.5, (xx + nx * shift * 0.88 - x0) * ss - 0.5)
    refr[..., 0] = np.clip(refr[..., 0] * 0.55 + red[..., 0] * 0.45, 0.0, 255.0)
    refr[..., 2] = np.clip(refr[..., 2] * 0.55 + blue[..., 2] * 0.45, 0.0, 255.0)

    frost = max(px(0.32) * ss, 1.0)
    blurred = gaussian_filter(ground, sigma=(frost, frost, 0), mode="nearest")
    v = np.clip((yy - top) / height, 0.0, 1.0)
    lift = 0.045 + 0.05 * (1.0 - v)
    body = blurred * (1.0 - lift[..., None]) + 255.0 * lift[..., None]
    body *= (1.0 - 0.05 * v)[..., None]

    slab = np.clip(0.03 + 0.04 * facing + 0.03 * down, 0.0, 0.10)
    rim_col = refr * (1.0 - slab[..., None]) + 255.0 * slab[..., None]
    glass = body * (1.0 - bevel[..., None]) + rim_col * bevel[..., None]

    groove_w = max(px(0.04), 0.45)
    groove = np.exp(-((depth - rim) ** 2) / (2.0 * groove_w ** 2)) * cover
    glass = glass * (1.0 - groove[..., None] * 0.28) + DEEP * (groove[..., None] * 0.28)

    bottom_w = max(px(0.032), 0.4)
    bottom = np.exp(-((depth - rim * 0.72) ** 2) / (2.0 * bottom_w ** 2))
    bottom *= down ** 0.45 * cover
    top_w = max(px(0.025), 0.35)
    top_line = np.exp(-((depth - rim * 0.28) ** 2) / (2.0 * top_w ** 2))
    top_line *= up * (0.45 + 0.55 * facing) * cover
    hot = (facing ** 2.4) * bevel * (0.35 + 0.65 * (up + 0.35 * np.clip(-nx, 0, 1)))
    glass = glass + (255.0 - glass) * (
        bottom[..., None] * 0.88 + top_line[..., None] * 0.18 + hot[..., None] * 0.10
    )
    lip_w = max(px(0.022), 0.3)
    lip = np.exp(-(depth ** 2) / (2.0 * lip_w ** 2)) * cover * (0.35 + 0.65 * facing)
    glass = glass + (255.0 - glass) * lip[..., None] * 0.20

    out = ground * (1.0 - cover[..., None]) + np.clip(glass, 0.0, 255.0) * cover[..., None]
    shade_a = np.clip(dropped / 0.48, 0.0, 1.0)
    mask = np.maximum(cover, np.maximum(shade_a, np.clip(band, 0.0, 1.0)))
    small = np.asarray(
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB").resize(
            (window.shape[1], window.shape[0]), Image.Resampling.LANCZOS
        )
    ).astype(np.float32)
    mask_small = np.asarray(
        Image.fromarray(np.clip(mask * 255.0, 0, 255).astype(np.uint8), "L").resize(
            (window.shape[1], window.shape[0]), Image.Resampling.BILINEAR
        )
    ).astype(np.float32) / 255.0
    ys, ye = (sy0 - y0), (sy0 - y0) + (sy1 - sy0)
    xs, xe = (sx0 - x0), (sx0 - x0) + (sx1 - sx0)
    fx = mask_small[ys:ye, xs:xe][..., None]
    canvas[sy0:sy1, sx0:sx1] = canvas[sy0:sy1, sx0:sx1] * (1.0 - fx) + small[ys:ye, xs:xe] * fx
    print(f"glass disc {w_mm:.2f}mm at {x_mm:.2f},{y_mm:.2f}")
    return canvas


def _glass_keep_mask(shape):
    """True on cloth. Glass, caustic, and drop shadow are left out of the sample."""
    keep = np.ones(shape[:2], dtype=bool)

    def blank(box, pad, extra_below=0.0):
        x, y, w, h = box
        x0 = max(0, int(np.floor(px(x - pad))))
        y0 = max(0, int(np.floor(px(y - pad))))
        x1 = min(shape[1], int(np.ceil(px(x + w + pad))))
        y1 = min(shape[0], int(np.ceil(px(y + h + pad + extra_below))))
        keep[y0:y1, x0:x1] = False

    blank(PHONE_BTN, 3.5, 0.8)
    blank(BADGE_MAIL, 2.6, 0.6)
    blank(BADGE_WEB, 2.6, 0.6)
    blank(BADGE_PLACE, 2.6, 0.6)
    return keep


def _percentile_pixel(pixels, y, pct):
    order = np.argsort(y)
    index = order[int(round((len(order) - 1) * pct / 100.0))]
    return pixels[index]


def measure_cloth(rgb):
    """Mean cloth colour versus #4C050C, with glass painted out of the sample."""
    keep = _glass_keep_mask(rgb.shape)
    pixels = np.clip(rgb, 0, 255)[keep].reshape(-1, 3).astype(np.float64)
    if pixels.shape[0] < 1000:
        raise SystemExit("cloth sample is too small")
    y = _linear_y(pixels)
    mean = pixels.mean(axis=0)
    median = _percentile_pixel(pixels, y, 50)
    p95 = _percentile_pixel(pixels, y, 95)
    p99 = _percentile_pixel(pixels, y, 99)
    mean_lab = _rgb_to_lab(mean)
    ink_lab = _rgb_to_lab(INK)
    delta = _delta_e(mean_lab, ink_lab)
    cap_y = float(_linear_y(LUM_CAP))
    p99_y = float(_linear_y(p99))
    light = _rgb_to_lab(pixels)[..., 0]
    print(
        f"cloth mean {_hex(mean)} {mean.round(1)} "
        f"median {_hex(median)} p95 {_hex(p95)} p99 {_hex(p99)}"
    )
    print(
        f"cloth deltaE {delta:.2f} p99 Y {p99_y:.4f} cap Y {cap_y:.4f} "
        f"L* std {float(light.std()):.2f} kept {pixels.shape[0]}"
    )
    if delta > 6.0:
        raise SystemExit(f"cloth mean is deltaE {delta:.2f} from #4C050C")
    if p99_y > cap_y + 1e-6:
        raise SystemExit(f"p99 cloth {_hex(p99)} is brighter than #7A1420")
    return {"mean": mean, "median": median, "p95": p95, "p99": p99, "delta": delta}


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
    """White modules only. The satin is the quiet zone and the gaps."""
    qr = segno.make("https://komarketingagency.com", error="q")
    modules = list(qr.matrix_iter(scale=1, border=QR_QUIET_MODULES))
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


def build_back():
    """Cover the bleed with the satin, turned so the text and QR sit in calmer cloth.

    Clockwise lays the darker sweep under the contact column and the code, and
    leaves a diagonal fold across the card. Lanczos scales it to 600 dpi. The
    extra width is the minimum cover crop, taken equally from both sides.
    """
    h, w = int(round(px(61))), int(round(px(96)))
    src = Image.open(ASSETS / "satin-back-bg.jpg")
    if src.mode != "RGB":
        src = src.convert("RGB")
    rot = src.transpose(Image.Transpose.ROTATE_270)
    scale = max(w / rot.width, h / rot.height)
    nw = int(round(rot.width * scale))
    nh = int(round(rot.height * scale))
    if nw < w or nh < h:
        raise SystemExit(f"satin cover undershoots {(nw, nh)} vs {(w, h)}")
    resized = rot.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    cropped = resized.crop((left, top, left + w, top + h))
    if cropped.size != (w, h) or cropped.mode != "RGB":
        raise SystemExit(f"satin crop is {cropped.size} {cropped.mode}")
    print(
        f"satin {src.size[0]}x{src.size[1]} rot270 {rot.size[0]}x{rot.size[1]} "
        f"-> {nw}x{nh} crop {left}px left, {top}px top "
        f"({left / px(1):.2f}mm / {top / px(1):.2f}mm)"
    )
    base = add_grain(recolor_satin(np.asarray(cropped).astype(np.float32)))
    apply_phone_button(base, PHONE_BTN)
    apply_glass_disc(base, BADGE_MAIL)
    apply_glass_disc(base, BADGE_WEB)
    apply_glass_disc(base, BADGE_PLACE)
    return base


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    print("canvas", int(round(px(96))), int(round(px(61))), "dpi", DPI)
    front = build_front()
    back = build_back()
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
    # Each line, both backs. The name box fits the longer name.
    contrast_in(back, (8.2, 10.310, 46.0, 6.4), "name")
    contrast_in(back, (8.2, 17.910, 16.5, 3.6), "role")
    contrast_in(back, (16.6, 25.061, 22.5, 3.3), "phone")
    contrast_in(back, (14.5, 32.810, 44.0, 3.6), "email")
    contrast_in(back, (14.5, 39.110, 32.0, 3.6), "website")
    contrast_in(back, (14.5, 45.310, 24.0, 3.6), "address")
    trace_wordmark()
    n = build_qr_svg()
    module = QR_SYMBOL[2] / n
    quiet = QR_QUIET_MODULES * module
    sx, sy, ss, _ = QR_SYMBOL
    data_box = (sx + quiet, sy + quiet, ss - 2 * quiet, ss - 2 * quiet)
    # Trim is 3 mm inside the bleed. The symbol must stay 3 mm clear of that edge.
    symbol_right = sx + ss
    trim_right = 93.0
    clearance = trim_right - symbol_right
    qx0, qy0, qw, qh = (int(round(px(v))) for v in (sx, sy, ss, ss))
    ground = back[qy0:qy0 + qh, qx0:qx0 + qw].reshape(-1, 3)
    light = ground[int(np.argmax(np.apply_along_axis(rel_lum, 1, ground)))]
    white_ratio = 1.05 / (rel_lum(light) + 0.05)
    print(
        f"qr symbol {ss:.2f}mm quiet {QR_QUIET_MODULES} modules ({quiet:.2f}mm) "
        f"right clearance {clearance:.2f}mm"
    )
    print(
        f"qr white vs lightest satin {light.round(1)} {_hex(light)} "
        f"contrast {white_ratio:.2f}:1"
    )
    if QR_QUIET_MODULES < 2:
        raise SystemExit("QR quiet zone is under 2 modules")
    if clearance < 3.0:
        raise SystemExit(f"QR symbol is {clearance:.2f}mm from the trim, under the 3 mm safe zone")
    measure_cloth(back)
    save_rgb(ASSETS / "back-bg.png", back)
    data_mm = data_box[2]
    print(f"qr modules {n} symbol {ss}mm quiet {quiet:.2f}mm data {data_mm:.2f}mm")
    if data_mm < 18:
        raise SystemExit("QR data area is under 18 mm")
    print("wrote assets")


if __name__ == "__main__":
    main()
