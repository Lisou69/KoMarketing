"""Bake the OPUS deck's soft photo fades and the KO logo mask into opaque RGB PNGs.

Apple PDFKit (iOS Files / Quick Look) drops the soft masks and transparency groups Chrome
writes for CSS mask-image, so the deck uses these flat images instead of masks.

Photo fades (slides 1 and 16): the source photo at its native resolution, cropped to the part
visible on the slide, faded with the same 9-stop smoothstep opacity used in v7 over the same
page background (#0e0502, turning neutral #0b0a09 over the first 30% of the band). Pixels right
of the band are the original asset pixels, unchanged. The script prints the CSS box to place each
image on exactly the same pixel grid as the v7 <img>.

Run from the deck folder:  python3 tools/bake_flat_images.py
"""
import math

import numpy as np
from PIL import Image

BG = np.array((0x0e, 0x05, 0x02), float)
NEUTRAL = np.array((0x0b, 0x0a, 0x09), float)
TEXT = np.array((0xf6, 0xf0, 0xe9), float)
STOPS = [0, .043, .156, .316, .5, .684, .844, .957, 1]   # smoothstep at k/8, as in v7

# file, slide rect of the full cover-fitted photo (left, top, scale), band b0-b1 in slide px
PHOTOS = {
    'fairway-trackman-group': dict(src='assets/fairway-trackman-group.jpg', b0=390, b1=560,
                                   # 864x576 box at (141,-18), object-fit cover, object-position right center
                                   fit=lambda w, h: (576 / h, 141 + 864 - w * 576 / h, -18)),
    'fairway-trackman-putting': dict(src='assets/fairway-trackman-putting.jpg', b0=180, b1=350,
                                     # 960x540 box, object-fit cover, object-position center 55%
                                     fit=lambda w, h: (960 / w, 0, (540 - h * 960 / w) * .55)),
}


def opacity(x, b0, b1):
    t = np.clip((x - b0) / (b1 - b0), 0, 1)
    return np.interp(t, np.linspace(0, 1, len(STOPS)), STOPS)


def under(x, b0, b1):
    t = np.clip((x - b0) / ((b1 - b0) * .3), 0, 1)[:, None]
    return BG * (1 - t) + NEUTRAL * t


def bake_photo(name, src, b0, b1, fit):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    s, left, top = fit(w, h)
    x0 = max(0, math.floor((b0 - left) / s)); x1 = min(w, math.ceil((960 - left) / s))
    y0 = max(0, math.floor((0 - top) / s)); y1 = min(h, math.ceil((540 - top) / s))
    px = np.asarray(im.crop((x0, y0, x1, y1)), float)
    xs = left + (np.arange(x0, x1) + .5) * s
    a = opacity(xs, b0, b1)[None, :, None]
    out = a * px + (1 - a) * under(xs, b0, b1)[None, :, :]
    Image.fromarray(np.round(out).astype(np.uint8), 'RGB').save(f'assets/{name}-fade.png', optimize=True)
    box = (left + x0 * s, top + y0 * s, (x1 - x0) * s, (y1 - y0) * s)
    assert box[0] <= b0 and box[1] <= 0 and box[0] + box[2] >= 960 - 1e-6 and box[1] + box[3] >= 540
    print(f'{name}-fade.png {x1 - x0}x{y1 - y0} ({1 / s:.2f} px per slide px): '
          f'left:{box[0]:.4f}px;top:{box[1]:.4f}px;width:{box[2]:.4f}px;height:{box[3]:.4f}px')


def bake_logo():
    """KO logo (its alpha was the CSS mask) in the text colour on the page background."""
    a = np.asarray(Image.open('assets/ko-logo-full.png').convert('RGBA'), float)[..., 3:] / 255
    Image.fromarray(np.round(a * TEXT + (1 - a) * BG).astype(np.uint8), 'RGB').save('assets/ko-logo-flat.png', optimize=True)
    print('ko-logo-flat.png', a.shape[1], 'x', a.shape[0])


if __name__ == '__main__':
    for n, p in PHOTOS.items():
        bake_photo(n, **p)
    bake_logo()
