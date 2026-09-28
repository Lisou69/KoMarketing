#!/usr/bin/env python3
"""V2 test cards. Matte burgundy paper and a tone-on-tone gloss wordmark.

Does not write anything outside brand/business-cards/v2/. The approved v1
files stay as they are. Glass uses the v1 recipe, called against this paper.
"""

from pathlib import Path
import importlib.util
import os

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy.ndimage import distance_transform_edt, gaussian_filter, maximum_filter, shift as nd_shift

ROOT = Path(__file__).resolve().parent
V1_DIR = ROOT.parent
ASSETS = ROOT / "assets"
FONT = V1_DIR / "fonts" / "source-serif-4-latin-500-italic.woff2"

os.environ.setdefault("CARD_DPI", "600")
_spec = importlib.util.spec_from_file_location("ko_v1_build", V1_DIR / "build_assets.py")
v1 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(v1)

DPI = v1.DPI
px = v1.px
INK = np.array([108.0, 27.0, 33.0], dtype=np.float32)  # #6C1B21
# Raised varnish. Darker than the paper, with a slight shift across the bead.
BODY_DARK = np.array([42.0, 2.0, 6.0], dtype=np.float32)  # #2A0206
BODY_LIGHT = np.array([50.0, 3.0, 8.0], dtype=np.float32)  # #320308
# Sheen sources. At 50% over the varnish they bake to about #8A4852 and #9A5A64.
CORE = np.array([228.0, 141.0, 157.0], dtype=np.float32)
PEAK = np.array([255.0, 177.0, 193.0], dtype=np.float32)
SHEEN = 0.50

WORD_X, WORD_Y, WORD_W = 20.0, 23.94, 56.0
# Ink bottom-left of the 8 pt tagline, kept when the type grows.
TAG_INK_X, TAG_INK_BOTTOM = 13.0, 52.49
TAG_SCALE = 1.18
TAG_FILL = np.array([46.0, 2.0, 7.0], dtype=np.float32)  # #2E0207
# "Knock" and "Out" frame the wordmark. About 23% taller than the previous
# 22.70 mm lockup, with a third of each word past the trim. Tracking stays
# at 0.09em, so Knock also runs off the side trim.
KNOCK_H = 18.92 * 1.20 * 1.23
KNOCK_CROP = 1.0 / 3.0
KNOCK_CX = 48.0
KNOCK_TRACK = "0.09em"
TRIM_TOP, TRIM_BOT = 3.0, 58.0


def canvas_size():
    return int(round(px(61))), int(round(px(96)))


def _unit(field):
    return field / (float(field.std()) + 1e-6)


def paper(h, w):
    """Uncoated sheet. The mean stays on #6C1B21.

    Grain is monochrome: the same luminance offset on every channel, so the
    hue does not wander. Fine tooth plus a softer fibre, visible at 100%.
    """
    rng = np.random.default_rng(11)
    fine = gaussian_filter(rng.normal(0.0, 1.0, (h, w)).astype(np.float32), 0.42)
    fibre_a = gaussian_filter(rng.normal(0.0, 1.0, (h, w)).astype(np.float32), (0.55, 2.8))
    fibre_b = gaussian_filter(rng.normal(0.0, 1.0, (h, w)).astype(np.float32), (2.4, 0.5))
    lump = _unit(fine) * 5.8 + _unit(fibre_a) * 2.6 + _unit(fibre_b) * 1.7
    img = INK + lump[..., None]
    return np.clip(img, 0.0, 255.0)


def slide(img, dx, dy):
    return nd_shift(img, shift=(dy, dx), order=1, mode="constant", cval=0.0)


def deboss_fields(mask, radius_mm):
    soft = gaussian_filter(mask.astype(np.float32), sigma=max(px(0.10), 0.5))
    s = max(px(radius_mm), 1.1)
    shadow = np.clip(soft - slide(soft, s, s), 0.0, 1.0)
    catch = np.clip(soft - slide(soft, -s, -s), 0.0, 1.0)
    shadow = gaussian_filter(shadow, sigma=max(px(0.05), 0.35))
    catch = gaussian_filter(catch, sigma=max(px(0.07), 0.4))
    floor = gaussian_filter(soft, sigma=max(px(0.28), 0.8))
    return shadow, catch, floor


def apply_deboss(canvas, mask, shadow_gain, catch_gain, floor_gain, radius_mm):
    """Press the mask into the sheet. Shadow on the top-left lip, light on the bottom-right."""
    if float(mask.max()) < 0.01:
        return canvas
    shadow, catch, floor = deboss_fields(mask, radius_mm)
    canvas -= shadow[..., None] * np.array(
        [shadow_gain, shadow_gain * 0.22, shadow_gain * 0.30], np.float32
    )
    canvas += catch[..., None] * np.array(
        [catch_gain, catch_gain * 0.30, catch_gain * 0.38], np.float32
    )
    canvas -= floor[..., None] * np.array(
        [floor_gain, floor_gain * 0.18, floor_gain * 0.24], np.float32
    )
    np.clip(canvas, 0.0, 255.0, out=canvas)
    return canvas


def _norm_in(field, where):
    sample = field[where]
    if sample.size < 20:
        return np.zeros_like(field)
    lo, hi = np.percentile(sample, [4, 96])
    return np.clip((field - lo) / (float(hi - lo) + 1e-6), 0.0, 1.0)


def apply_gloss(canvas, mask):
    """Raised glossy varnish. Dark smooth bead, crisp white catchlights.

    The body sits around #2A0206–#320308. A soft pink catchlight, broken into
    segments, runs along the edges that face the light and feathers into the
    varnish. The opposite lip is a dark rounded bevel. A soft shadow falls
    on the paper below and to the right. Highlight width tracks the stroke.
    """
    coverage = np.clip(mask.astype(np.float32), 0.0, 1.0)
    if float(coverage.max()) < 0.01:
        return canvas
    mm = DPI / 25.4
    solid = coverage > 0.52
    dist = distance_transform_edt(solid)
    # Local half-width, sampled near the edge. Distinguishes the tagline from KO.
    half = maximum_filter(dist, size=max(3, int(round(mm * 0.55))))
    thick = np.clip((half - 2.6) / 5.5, 0.0, 1.0)

    blurred = gaussian_filter(coverage, sigma=max(mm * 0.06, 0.8))
    gy, gx = np.gradient(blurred)
    mag = np.hypot(gx, gy) + 1e-6
    # Outward normal. y grows downward, so up is -y. Light is above-left.
    nx, ny = -gx / mag, -gy / mag
    lx, ly = -0.34, -0.94
    ln = float(np.hypot(lx, ly))
    ndot = (nx * lx + ny * ly) / ln
    face = np.clip((ndot - 0.02) / 0.62, 0.0, 1.0)
    away = np.clip((-ndot - 0.02) / 0.55, 0.0, 1.0)

    # Soft cast shadow on the paper, down and to the right.
    off = mm * 0.20
    core = solid.astype(np.float32)
    broad = gaussian_filter(slide(core, off * 0.55, off), sigma=mm * 0.16)
    tight = gaussian_filter(slide(core, off * 0.28, off * 0.42), sigma=mm * 0.055)
    outside = coverage < 0.10
    shade = np.clip(broad * 0.72 + tight * 0.55, 0.0, 1.0) * outside
    canvas *= 1.0 - shade[..., None] * 0.50

    # Interior gradient, light side #320308, shadow side #2A0206.
    signed = ndot * solid.astype(np.float32)
    near = gaussian_filter(signed, 1.6)
    mid = gaussian_filter(signed, 5.5)
    far = gaussian_filter(signed, 14.0)
    w_far = np.clip((half - 8.0) / 14.0, 0.0, 1.0)
    w_mid = np.clip(half / 9.0, 0.0, 1.0) * (1.0 - w_far)
    w_near = np.clip(1.0 - w_mid - w_far, 0.0, 1.0)
    grad = near * w_near + mid * w_mid + far * w_far
    if np.any(solid):
        lo, hi = np.percentile(grad[solid], [8, 92])
        t = np.clip((grad - lo) / (float(hi - lo) + 1e-6), 0.0, 1.0)
    else:
        t = np.zeros_like(grad)
    color = BODY_DARK * (1.0 - t[..., None]) + BODY_LIGHT * t[..., None]

    # Dark rounded lip on the side facing away from the light.
    bevel_w = np.clip(0.8 + thick * 1.6, 0.7, 2.4)
    bevel = np.exp(-0.5 * ((dist - bevel_w * 0.85) / bevel_w) ** 2)
    bevel *= away * solid * np.clip(dist / 0.6, 0.0, 1.0)
    bevel = gaussian_filter(bevel, 0.7)
    color *= 1.0 - np.clip(bevel, 0.0, 1.0)[..., None] * 0.72

    # Catchlights. Width 0.05 mm on small type, up to 0.12 mm on the wordmark.
    width = (0.05 + thick * 0.07) * mm
    sigma = np.maximum(width * 0.30, 0.36)
    peak = np.clip(width * 0.72, 0.7, 2.1)
    band = np.exp(-0.5 * ((dist - peak) / sigma) ** 2)
    band *= solid & (dist > 0.30) & (face > 0.04)

    height, wid = coverage.shape
    rng = np.random.default_rng(23)
    noise = rng.random((height, wid)).astype(np.float32)
    gaps = rng.random((height, wid)).astype(np.float32)
    # Long beads, then a slower gap field. No fine speckle inside a segment.
    long_h = gaussian_filter(noise, (0.7, 12.0))
    long_v = gaussian_filter(noise, (12.0, 0.7))
    gap_h = gaussian_filter(gaps, (0.6, 4.0))
    gap_v = gaussian_filter(gaps, (4.0, 0.6))
    tx, ty = np.abs(-ny), np.abs(nx)
    long = long_h * tx + long_v * ty
    gap = gap_h * tx + gap_v * ty
    edge = solid & (dist < 4.5) & (dist > 0.3)
    long_n = _norm_in(long, edge)
    gap_n = _norm_in(gap, edge)
    segments = np.clip((long_n - 0.54) / 0.12, 0.0, 1.0)
    segments *= np.clip((gap_n - 0.46) / 0.16, 0.0, 1.0)
    # Small type keeps fewer of the same clean beads.
    bar = 0.64 - 0.18 * thick
    keep = np.clip((segments - bar) / 0.10, 0.0, 1.0)
    # Close the little holes so a segment reads as one line, not grains.
    keep = gaussian_filter(keep, (0.55, 2.6)) * tx + gaussian_filter(keep, (2.6, 0.55)) * ty
    keep = np.clip((keep - 0.22) / 0.20, 0.0, 1.0)
    spec = band * (0.35 + 0.65 * face) * keep
    spec = gaussian_filter(spec, (0.35, 1.5)) * tx + gaussian_filter(spec, (1.5, 0.35)) * ty
    spec *= solid
    crest = np.clip((spec - 0.12) / 0.22, 0.0, 1.0)
    # Wider than the old hairline, and feathered so the edge is a glow, not a pixel step.
    feather = gaussian_filter(crest, 2.15)
    lit = feather > 0.02
    if np.any(lit):
        scale = float(np.percentile(feather[lit], 99.2))
        feather = np.clip(feather / max(scale, 1e-4), 0.0, 1.0)
    feather *= solid
    # 50% at the crest, same feather shape, baked into opaque pixels.
    amount = (feather ** 0.90) * SHEEN
    hot = np.clip((feather - 0.58) / 0.42, 0.0, 1.0) ** 1.35
    hot = gaussian_filter(hot, 1.05) * solid
    light = CORE * (1.0 - hot[..., None]) + PEAK * hot[..., None]
    color = color * (1.0 - amount[..., None]) + light * amount[..., None]

    # Crisp silhouette. Grain stops at the ink; the catchlight stays inside it.
    canvas[:] = canvas * (1.0 - coverage[..., None]) + color * coverage[..., None]
    np.clip(canvas, 0.0, 255.0, out=canvas)
    return canvas


def _coverage_from_shot(image):
    gray = np.asarray(image.convert("L"), dtype=np.float32)
    return np.clip((255.0 - gray) / 255.0, 0.0, 1.0)


def render_masks():
    """Black-on-white masks for the wordmark, the small tagline, and the giant phrase."""
    mark_svg = (V1_DIR / "assets" / "ko-wordmark.svg").read_text().replace(
        'fill="#4c050c"', 'fill="#000000"'
    )
    mark_path = ASSETS / "_mark.svg"
    mark_path.write_text(mark_svg)
    font_uri = FONT.as_uri()
    mark_uri = mark_path.as_uri()
    # A real file URL. set_content cannot load the SVG from about:blank.
    html_path = ASSETS / "_masks.html"
    html = f"""<!DOCTYPE html><html><head>
    <style>
      @font-face {{
        font-family: "Source Serif 4";
        font-style: italic;
        font-weight: 500;
        src: url("{font_uri}") format("woff2");
      }}
      * {{ margin: 0; padding: 0; }}
      body {{ background: #ffffff; }}
      img {{ display: block; width: 2400px; height: 563px; }}
      p {{
        font-family: "Source Serif 4", serif;
        font-style: italic;
        font-weight: 500;
        color: #000000;
        background: #ffffff;
        letter-spacing: -0.04em;
      }}
      #tag {{
        font-size: 32pt;
        line-height: 1.05;
        display: inline-block;
      }}
      #phrase {{
        font-size: 180pt;
        line-height: 0.85;
        display: inline-block;
        white-space: nowrap;
      }}
    </style></head><body>
      <img id="mark" src="{mark_uri}">
      <p id="tag">Marketing that<br>converts.</p>
      <p id="phrase">Marketing that converts.</p>
    </body></html>"""
    html_path.write_text(html)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page(viewport={"width": 2800, "height": 1600}, device_scale_factor=2)
        page.goto(html_path.as_uri(), wait_until="networkidle")
        page.evaluate("() => document.fonts.ready")
        masks = {}
        from io import BytesIO
        for key in ("mark", "tag", "phrase"):
            shot = page.locator(f"#{key}").screenshot()
            masks[key] = _coverage_from_shot(Image.open(BytesIO(shot)))
            print(f"mask {key} {masks[key].shape} ink {float((masks[key] > 0.2).mean()):.3f}")
        browser.close()
    mark_path.unlink()
    html_path.unlink()
    if masks["mark"].shape[0] < 200:
        raise SystemExit(f"wordmark mask collapsed to {masks['mark'].shape}")
    return masks


def _resize_coverage(coverage, width_px):
    width_px = max(1, int(round(width_px)))
    height_px = max(1, int(round(width_px * coverage.shape[0] / coverage.shape[1])))
    im = Image.fromarray(np.clip(coverage * 255.0, 0, 255).astype(np.uint8), "L")
    im = im.resize((width_px, height_px), Image.Resampling.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0


def paste_at(shape, coverage, x_mm, y_mm, width_mm):
    mask = np.zeros(shape, np.float32)
    sprite = _resize_coverage(coverage, px(width_mm))
    x = int(round(px(x_mm)))
    y = int(round(px(y_mm)))
    h, w = sprite.shape
    H, W = shape
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return mask
    mask[y0:y1, x0:x1] = sprite[y0 - y:y0 - y + (y1 - y0), x0 - x:x0 - x + (x1 - x0)]
    return mask


def paste_centered(shape, coverage, width_mm, center_mm, angle=0.0, fatten_mm=0.0):
    """Scale, optionally fatten and rotate, then center on the bleed."""
    sprite = _resize_coverage(coverage, px(width_mm))
    if fatten_mm > 0:
        sprite = gaussian_filter(sprite, sigma=max(px(fatten_mm), 0.6))
        sprite = np.clip(sprite / 0.38, 0.0, 1.0)
    im = Image.fromarray(np.clip(sprite * 255.0, 0, 255).astype(np.uint8), "L")
    if abs(angle) > 0.01:
        im = im.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True, fillcolor=0)
    arr = np.asarray(im, dtype=np.float32) / 255.0
    mask = np.zeros(shape, np.float32)
    H, W = shape
    h, w = arr.shape
    cx, cy = px(center_mm[0]), px(center_mm[1])
    x = int(round(cx - w / 2.0))
    y = int(round(cy - h / 2.0))
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return mask
    mask[y0:y1, x0:x1] = np.maximum(
        mask[y0:y1, x0:x1],
        arr[y0 - y:y0 - y + (y1 - y0), x0 - x:x0 - x + (x1 - x0)],
    )
    return mask


def apply_tagline(canvas, mask):
    """Smooth dark gloss for the small line. No bevel and no catchlights.

    A short, very soft shadow is the only thing that lifts it off the sheet.
    The fill is flat #2E0207 so the strokes stay crisp.
    """
    coverage = np.clip(mask.astype(np.float32), 0.0, 1.0)
    if float(coverage.max()) < 0.01:
        return canvas
    mm = DPI / 25.4
    solid = (coverage > 0.45).astype(np.float32)
    off = mm * 0.10
    dropped = gaussian_filter(slide(solid, off * 0.45, off), sigma=mm * 0.20)
    outside = coverage < 0.08
    canvas *= 1.0 - (dropped * outside)[..., None] * 0.22
    canvas[:] = canvas * (1.0 - coverage[..., None]) + TAG_FILL * coverage[..., None]
    np.clip(canvas, 0.0, 255.0, out=canvas)
    return canvas


def gloss_group(canvas, mask):
    """Gloss only where the mask sits, so the sheen is per letter, not the whole card."""
    ys, xs = np.where(mask > 0.04)
    if len(ys) == 0:
        return canvas
    pad = int(px(1.2))
    y0, y1 = max(0, ys.min() - pad), min(canvas.shape[0], ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(canvas.shape[1], xs.max() + pad + 1)
    apply_gloss(canvas[y0:y1, x0:x1], mask[y0:y1, x0:x1])
    return canvas


def _tag_placement(mask, scale):
    """Grow the 8 pt tagline from its ink bottom-left."""
    base_w = mask.shape[1] / 2.0 * 25.4 / 96.0 * (8.0 / 32.0)
    width = base_w * scale
    height = width * mask.shape[0] / mask.shape[1]
    ink = mask > 0.15
    ys, xs = np.where(ink)
    if len(ys) == 0:
        raise SystemExit("tagline mask is empty")
    left_f = float(xs.min()) / mask.shape[1]
    bot_f = float(ys.max() + 1) / mask.shape[0]
    x = TAG_INK_X - left_f * width
    y = TAG_INK_BOTTOM - bot_f * height
    return x, y, width


def _ink_box(mask, thr=0.15):
    ys, xs = np.where(mask > thr)
    if len(ys) == 0:
        raise SystemExit("placement mask is empty")
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def _place_by_height(shape, mask, ref_mask, ref_height_mm, cx, top=None, bottom=None):
    """Scale `mask` with `ref_mask`'s ink height, then center it on cx."""
    _, ry0, _, ry1 = _ink_box(ref_mask)
    mm_per = ref_height_mm / (ry1 - ry0)
    x0, y0, x1, y1 = _ink_box(mask)
    sprite_w = (x1 - x0) * mm_per * mask.shape[1] / (x1 - x0)
    sprite_h = sprite_w * mask.shape[0] / mask.shape[1]
    x = cx - ((x0 + x1) / 2.0 / mask.shape[1]) * sprite_w
    if top is not None:
        y = top - (y0 / mask.shape[0]) * sprite_h
    else:
        y = bottom - (y1 / mask.shape[0]) * sprite_h
    return paste_at(shape, mask, x, y, sprite_w)


def render_knock_masks():
    """Separate 'Knock' and 'Out' in the back-phrase italic, with open tracking."""
    font_uri = FONT.as_uri()
    html_path = ASSETS / "_knock.html"
    html_path.write_text(
        f"""<!DOCTYPE html><html><head><style>
      @font-face {{
        font-family: "Source Serif 4";
        font-style: italic;
        font-weight: 500;
        src: url("{font_uri}") format("woff2");
      }}
      * {{ margin: 0; padding: 0; }}
      body {{ background: #ffffff; }}
      p {{
        font-family: "Source Serif 4", serif;
        font-style: italic;
        font-weight: 500;
        font-size: 140pt;
        line-height: 1;
        letter-spacing: {KNOCK_TRACK};
        color: #000000;
        background: #ffffff;
        display: inline-block;
        padding: 0.12em 0.2em 0.16em;
      }}
    </style></head><body>
      <p id="knock">Knock</p>
      <p id="out">Out</p>
    </body></html>"""
    )
    from io import BytesIO
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page(viewport={"width": 2800, "height": 1000}, device_scale_factor=2)
        page.goto(html_path.as_uri(), wait_until="networkidle")
        page.evaluate("() => document.fonts.ready")
        masks = {}
        for key in ("knock", "out"):
            shot = page.locator(f"#{key}").screenshot()
            masks[key] = _coverage_from_shot(Image.open(BytesIO(shot)))
            print(f"mask {key} {masks[key].shape} ink {float((masks[key] > 0.2).mean()):.3f}")
        browser.close()
    html_path.unlink()
    if masks["knock"].shape[0] < 200 or masks["out"].shape[0] < 150:
        raise SystemExit(f"knock masks collapsed {[masks[k].shape for k in masks]}")
    return masks


def build_front(masks, shape):
    img = paper(*shape)
    word = paste_at(shape, masks["mark"], WORD_X, WORD_Y, WORD_W)
    # The approved logo and this line were glossed as one mask. Repeating that
    # keeps the wordmark's catchlight field identical, then the line is replaced.
    old_w = masks["tag"].shape[1] / 2.0 * 25.4 / 96.0 * (8.0 / 32.0)
    old_tag = paste_at(shape, masks["tag"], 13.0, 47.05, old_w)
    gloss_group(img, np.maximum(word, old_tag))
    sheet = paper(*shape)
    cut = int(round(px(44.0)))
    img[cut:] = sheet[cut:]
    tag_x, tag_y, tag_w = _tag_placement(masks["tag"], TAG_SCALE)
    tag = paste_at(shape, masks["tag"], tag_x, tag_y, tag_w)
    apply_tagline(img, tag)
    # Press "Knock" off the top trim and "Out" off the bottom trim.
    # Gloss pixels stay as they are, so the wordmark and the tagline sit on top.
    before = img.copy()
    _, ky0, _, ky1 = _ink_box(masks["knock"])
    _, oy0, _, oy1 = _ink_box(masks["out"])
    out_h = KNOCK_H * (oy1 - oy0) / (ky1 - ky0)
    knock_top = TRIM_TOP - KNOCK_CROP * KNOCK_H
    out_bottom = TRIM_BOT + KNOCK_CROP * out_h
    knock = _place_by_height(shape, masks["knock"], masks["knock"], KNOCK_H, KNOCK_CX, top=knock_top)
    out = _place_by_height(shape, masks["out"], masks["knock"], KNOCK_H, KNOCK_CX, bottom=out_bottom)
    knock = np.maximum(knock, out)
    pressed = sheet.copy()
    apply_deboss(pressed, knock, shadow_gain=40.0, catch_gain=26.0, floor_gain=12.0, radius_mm=0.38)
    delta = pressed - sheet
    owned = np.abs(before - sheet).max(axis=2) > 1.5
    effect = (np.abs(delta).max(axis=2) > 0.35) & ~owned
    img[effect] = np.clip(img[effect] + delta[effect], 0.0, 255.0)
    if float(np.abs(img[owned] - before[owned]).max()) > 0.05:
        raise SystemExit("wordmark or tagline pixels moved")
    return img, before, knock


def build_back_a(masks, shape):
    img = paper(*shape)
    swirls = np.zeros(shape, np.float32)
    # Logo curves, fattened into ribbons and cropped off the sheet.
    placements = (
        (250.0, -22.0, (18.0, 18.0)),
        (230.0, 16.0, (78.0, 44.0)),
        (210.0, -6.0, (52.0, 34.0)),
    )
    for width, angle, center in placements:
        swirls = np.maximum(swirls, paste_centered(shape, masks["mark"], width, center, angle, fatten_mm=1.15))
    apply_deboss(img, swirls, shadow_gain=30.0, catch_gain=20.0, floor_gain=8.0, radius_mm=0.40)
    v1.apply_phone_button(img, v1.PHONE_BTN)
    v1.apply_glass_disc(img, v1.BADGE_MAIL)
    v1.apply_glass_disc(img, v1.BADGE_WEB)
    v1.apply_glass_disc(img, v1.BADGE_PLACE)
    return img


def build_back_b(masks, shape):
    img = paper(*shape)
    # One line, taller than the card is comfortable and wider than the bleed,
    # so the ends and the tops of the letters crop off.
    # Cap height fills the sheet. The line is wider than the card, so the ends crop off.
    phrase = paste_centered(shape, masks["phrase"], 520.0, (48.0, 30.5))
    apply_deboss(img, phrase, shadow_gain=40.0, catch_gain=26.0, floor_gain=12.0, radius_mm=0.38)
    v1.apply_phone_button(img, v1.PHONE_BTN)
    v1.apply_glass_disc(img, v1.BADGE_MAIL)
    v1.apply_glass_disc(img, v1.BADGE_WEB)
    v1.apply_glass_disc(img, v1.BADGE_PLACE)
    return img


def save_rgb(path, rgb):
    im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
    im.save(path, "PNG", optimize=True)
    if Image.open(path).mode != "RGB":
        raise SystemExit(f"{path.name} is not RGB")


def check_contrast(name, rgb):
    boxes = {
        "name": (8.2, 10.310, 46.0, 6.4),
        "role": (8.2, 17.910, 16.5, 3.6),
        "phone": (16.6, 25.061, 22.5, 3.3),
        "email": (14.5, 32.810, 44.0, 3.6),
        "website": (14.5, 39.110, 32.0, 3.6),
        "address": (14.5, 45.310, 24.0, 3.6),
    }
    worst = 99.0
    for label, box in boxes.items():
        x, y, w, h = (int(round(px(v))) for v in box)
        crop = rgb[y:y + h, x:x + w].reshape(-1, 3)
        light = crop[int(np.argmax(v1._linear_y(crop)))]
        ratio = v1.contrast_white(light)
        worst = min(worst, ratio)
        print(f"{name} {label}: lightest {np.round(light, 1)} white-contrast {ratio:.2f}")
        if ratio < 7.0:
            raise SystemExit(f"{name} {label} contrast {ratio:.2f} is under 7")
    sx, sy, ss, _ = v1.QR_SYMBOL
    x, y, w, h = (int(round(px(v))) for v in (sx, sy, ss, ss))
    ground = rgb[y:y + h, x:x + w].reshape(-1, 3)
    light = ground[int(np.argmax(v1._linear_y(ground)))]
    ratio = v1.contrast_white(light)
    print(f"{name} qr lightest {np.round(light, 1)} {v1._hex(light)} contrast {ratio:.2f}")
    return worst


def check_gloss(front, mark):
    """Body stays dark. Catchlights are a soft pink, not white."""
    shape = front.shape[:2]
    mask = paste_at(shape, mark, WORD_X, WORD_Y, WORD_W)
    solid = mask > 0.90
    if int(solid.sum()) < 50:
        raise SystemExit("gloss fill sample is empty")
    pixels = front[solid]
    order = np.argsort(v1._linear_y(pixels))
    fill = pixels[order[int(len(pixels) * 0.35)]]
    brightest = pixels[order[-1]]
    sheen_n = int(((pixels[:, 0] > 110) & (pixels[:, 0] < 175) & (pixels[:, 1] > 45) & (pixels[:, 1] < 120)).sum())
    print(
        f"gloss fill {np.round(fill, 1)} {v1._hex(fill)} "
        f"brightest {np.round(brightest, 1)} {v1._hex(brightest)} "
        f"sheen {sheen_n}"
    )
    if float(fill[0]) > 62:
        raise SystemExit(f"gloss fill {v1._hex(fill)} is lighter than the varnish")
    if float(brightest[0]) > 180 or float(brightest[1]) > 130:
        raise SystemExit(f"catchlight {v1._hex(brightest)} is harsher than #9A5A64")
    if sheen_n < 40:
        raise SystemExit("soft catchlights are missing")
    return fill


def check_tagline(front, tag_mask):
    """The small line is a flat #2E0207 gloss, larger, still inside the safe box."""
    shape = front.shape[:2]
    tag_x, tag_y, tag_w = _tag_placement(tag_mask, TAG_SCALE)
    mask = paste_at(shape, tag_mask, tag_x, tag_y, tag_w)
    ink = mask > 0.45
    if int(ink.sum()) < 40:
        raise SystemExit("tagline ink sample is empty")
    ys, xs = np.where(ink)
    mm = 25.4 / DPI
    left, right = float(xs.min()) * mm, float(xs.max() + 1) * mm
    top, bottom = float(ys.min()) * mm, float(ys.max() + 1) * mm
    solid = front[ink]
    fill = np.median(solid, axis=0)
    ratio = v1.rel_lum(INK) / v1.rel_lum(fill)
    paper_px = INK
    print(
        f"tagline ink {left:.2f}–{right:.2f} x {top:.2f}–{bottom:.2f} mm "
        f"size {right - left:.2f}×{bottom - top:.2f} "
        f"fill {np.round(fill, 1)} {v1._hex(fill)} "
        f"Y-ratio {ratio:.2f} vs paper {np.round(paper_px, 1)}"
    )
    if left < 5.9 or right > 90.1 or top < 5.9 or bottom > 55.1:
        raise SystemExit("tagline leaves the 3 mm safe zone")
    if abs(left - TAG_INK_X) > 0.15 or abs(bottom - TAG_INK_BOTTOM) > 0.15:
        raise SystemExit("tagline ink bottom-left moved")
    if not (17.57 * 1.14 <= (right - left) <= 17.57 * 1.22):
        raise SystemExit("tagline width is outside the 15–20% increase")
    if float(fill[0]) > 52 or float(np.max(np.abs(fill - TAG_FILL))) > 8:
        raise SystemExit(f"tagline fill {v1._hex(fill)} is not #2E0207")
    if ratio < 3.0:
        raise SystemExit(f"tagline luminance contrast {ratio:.2f} is under 3")
    bright = int(((solid[:, 0] > 80) & (solid[:, 1] > 30)).sum())
    if bright > 0:
        raise SystemExit(f"tagline still has {bright} catchlight pixels")
    return ratio


def _span(mask):
    ys, xs = np.where(mask > 0.15)
    mm = 25.4 / DPI
    return (
        float(xs.min()) * mm,
        float(xs.max() + 1) * mm,
        float(ys.min()) * mm,
        float(ys.max() + 1) * mm,
    )


def check_knock(front, before, knock):
    """Larger words run off the trim, stay clear of the wordmark, and stay debossed."""
    changed = np.abs(front - before)
    if float(changed.max()) < 1.0:
        raise SystemExit("Knock Out deboss did not land")
    mid = int(round(px(32.0)))
    upper, lower = _span(knock[:mid]), _span(knock[mid:])
    lower = (lower[0], lower[1], lower[2] + 32.0, lower[3] + 32.0)
    ink = knock > 0.8
    open_ink = ink & (changed.max(axis=2) > 0.6)
    if int(open_ink.sum()) < 80:
        raise SystemExit("Knock Out is hidden behind the wordmark")
    sample = front[open_ink]
    fill = np.median(sample, axis=0)
    knock_cut = (TRIM_TOP - (upper[3] - KNOCK_H)) / KNOCK_H
    print(
        f"knock {upper[0]:.2f}–{upper[1]:.2f} x {upper[2]:.2f}–{upper[3]:.2f} mm "
        f"cut {knock_cut:.0%} "
        f"out {lower[0]:.2f}–{lower[1]:.2f} x {lower[2]:.2f}–{lower[3]:.2f} mm "
        f"fill {np.round(fill, 1)} {v1._hex(fill)}"
    )
    for name, box in (("knock", upper), ("out", lower)):
        left, right, _, _ = box
        center = (left + right) / 2.0
        if abs(center - KNOCK_CX) > 0.8:
            raise SystemExit(f"{name} is not centered ({center:.2f})")
    if not (0.30 <= knock_cut <= 0.37):
        raise SystemExit(f"Knock crop {knock_cut:.0%} is outside about a third")
    if upper[2] > 0.35 or upper[3] > 21.96 or upper[3] < 21.1:
        raise SystemExit("Knock does not bleed off the top, or it meets the wordmark")
    if upper[0] > 0.4 or upper[1] < 95.5:
        raise SystemExit("Knock does not bleed off the side trim")
    if lower[2] < 39.8 or lower[2] > 42.0 or lower[3] < 60.6:
        raise SystemExit("Out meets the wordmark, or it does not bleed off the bottom")
    if float(fill[0]) > 100 or float(fill[1]) > 40:
        raise SystemExit(f"Knock Out fill {v1._hex(fill)} is not a deboss")
    bright = int(((sample[:, 0] > 150) & (sample[:, 1] > 70)).sum())
    if bright > 0:
        raise SystemExit(f"Knock Out has {bright} gloss pixels")


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    shape = canvas_size()
    print("canvas", shape[1], shape[0], "dpi", DPI)
    cache = Path("/tmp/v2-masks.npz")
    if cache.exists() and os.environ.get("V2_REMASK") != "1":
        loaded = np.load(cache)
        masks = {key: loaded[key] for key in loaded.files}
        print("masks cached", {key: masks[key].shape for key in masks})
    else:
        masks = render_masks()
        np.savez(cache, **masks)
    masks.update(render_knock_masks())
    np.savez(cache, **masks)
    front, before, knock = build_front(masks, shape)
    save_rgb(ASSETS / "front-bg.png", front)
    check_gloss(front, masks["mark"])
    check_tagline(front, masks["tag"])
    check_knock(front, before, knock)
    print("wrote front")


if __name__ == "__main__":
    main()
