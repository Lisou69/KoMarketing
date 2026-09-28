#!/usr/bin/env python3
"""V2 test cards. Matte burgundy paper, deboss, and a glossy wordmark.

Does not write anything outside brand/business-cards/v2/. The approved v1
files stay as they are. Glass uses the v1 recipe, called against this paper.
"""

from pathlib import Path
import importlib.util
import os

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
from scipy.ndimage import gaussian_filter, shift as nd_shift

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
INK = np.array([76.0, 5.0, 12.0], dtype=np.float32)  # #4C050C
# Spot-UV ink. Same hue as the paper, a step darker and richer.
GLOSS = np.array([34.0, 1.0, 5.0], dtype=np.float32)
GLOSS_SHEEN = np.array([148.0, 64.0, 70.0], dtype=np.float32)
GLOSS_EDGE = np.array([244.0, 226.0, 220.0], dtype=np.float32)
GLOSS_SHADE = np.array([18.0, 0.0, 3.0], dtype=np.float32)

WORD_X, WORD_Y, WORD_W = 20.0, 23.94, 56.0
TAG_X, TAG_Y = 13.0, 47.05


def canvas_size():
    return int(round(px(61))), int(round(px(96)))


def paper(h, w):
    """Flat uncoated sheet. The mean stays on #4C050C; the grain is the tooth."""
    rng = np.random.default_rng(11)
    fine = rng.normal(0.0, 1.0, (h, w)).astype(np.float32)
    fiber = gaussian_filter(rng.normal(0.0, 1.0, (h, w)).astype(np.float32), (0.55, 1.7))
    tooth = gaussian_filter(rng.normal(0.0, 1.0, (h, w)).astype(np.float32), 0.4)
    amp = fine * 1.05 + fiber * 1.25 + tooth * 0.40
    img = INK * (1.0 + amp[..., None] * 0.016)
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


def apply_gloss(canvas, mask):
    """Tone-on-tone spot UV. Darker ink, a soft sheen, a bright top-left edge."""
    coverage = np.clip(mask.astype(np.float32), 0.0, 1.0)
    if float(coverage.max()) < 0.01:
        return canvas
    h, w = coverage.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Sheen follows the light, across the whole mark, and dies toward the lower right.
    sheen = np.clip(1.05 - xx / max(w - 1, 1) * 0.85 - yy / max(h - 1, 1) * 0.55, 0.0, 1.0)
    sheen *= gaussian_filter(coverage, sigma=max(px(0.22), 0.6))
    sheen /= max(float(sheen.max()), 1e-4)
    body = GLOSS * (1.0 - 0.55 * sheen[..., None]) + GLOSS_SHEEN * (0.55 * sheen[..., None])
    s = max(px(0.10), 1.2)
    soft = gaussian_filter(coverage, sigma=max(px(0.04), 0.35))
    edge = np.clip(soft - slide(soft, s, s), 0.0, 1.0)
    shade = np.clip(soft - slide(soft, -s, -s), 0.0, 1.0)
    edge = gaussian_filter(edge, sigma=max(px(0.03), 0.25))
    shade = gaussian_filter(shade, sigma=max(px(0.03), 0.25))
    color = body * (1.0 - edge[..., None]) + GLOSS_EDGE * edge[..., None]
    color = color * (1.0 - 0.72 * shade[..., None]) + GLOSS_SHADE * (0.72 * shade[..., None])
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


def build_front(masks, shape):
    img = paper(*shape)
    # Oversized KO script, cropped by the card. Same artwork as the small mark.
    giant = paste_centered(shape, masks["mark"], 640.0, (48.0, 30.5))
    apply_deboss(img, giant, shadow_gain=28.0, catch_gain=20.0, floor_gain=8.0, radius_mm=0.28)
    word = paste_at(shape, masks["mark"], WORD_X, WORD_Y, WORD_W)
    # 32 pt shot scaled to the 8 pt tagline. 8/32 = 0.25 of the rendered CSS width.
    tag_w = masks["tag"].shape[1] / 2.0 * 25.4 / 96.0 * (8.0 / 32.0)
    tag = paste_at(shape, masks["tag"], TAG_X, TAG_Y, tag_w)
    gloss_group(img, np.maximum(word, tag))
    return img


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
    apply_deboss(img, phrase, shadow_gain=24.0, catch_gain=17.0, floor_gain=7.0, radius_mm=0.32)
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


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    shape = canvas_size()
    print("canvas", shape[1], shape[0], "dpi", DPI)
    masks = render_masks()
    front = build_front(masks, shape)
    back_a = build_back_a(masks, shape)
    back_b = build_back_b(masks, shape)
    save_rgb(ASSETS / "front-bg.png", front)
    save_rgb(ASSETS / "back-a-bg.png", back_a)
    save_rgb(ASSETS / "back-b-bg.png", back_b)
    check_contrast("v2A", back_a)
    check_contrast("v2B", back_b)
    # A small contact sheet for inspection. Not part of the print files.
    for name, rgb in (("front", front), ("back-a", back_a), ("back-b", back_b)):
        im = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), "RGB")
        im.thumbnail((1100, 800), Image.Resampling.LANCZOS)
        im.save(f"/tmp/v2-{name}.jpg", quality=88)
    print("wrote v2 backgrounds")


if __name__ == "__main__":
    main()
