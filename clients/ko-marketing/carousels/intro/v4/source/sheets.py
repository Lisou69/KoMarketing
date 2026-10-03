"""Builds the v4 contact sheets and feed row.
Usage: python3 sheets.py   (needs Pillow; run after node build.mjs)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = Path(__file__).resolve().parent / "fonts" / "Manrope.ttf"
IDS = ["01-we-are-open", "02-who-we-are", "03-what-we-do"]
BG = (245, 245, 247)
INK = (26, 19, 16)
LIMIT = 3 * 1024 * 1024


def save(im: Image.Image, out: Path) -> Path:
    im.save(out, optimize=True)
    if out.stat().st_size > LIMIT:
        im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(out, optimize=True)
    return out


def sheet(cid: str) -> Path:
    d = ROOT / cid
    files = sorted(d.glob("slide-*.png"))
    n = len(files)
    cols = 3 if n <= 6 else 5
    tw = 540 if cols == 3 else 432
    th = tw * 5 // 4
    gap, pad, head, lab = 24, 48, 76, 36
    rows = (n + cols - 1) // cols
    w = pad * 2 + cols * tw + (cols - 1) * gap
    h = pad * 2 + head + rows * (th + lab) + (rows - 1) * gap
    im = Image.new("RGB", (w, h), BG)
    dr = ImageDraw.Draw(im)
    dr.text((pad, pad), f"KO Marketing  |  v4: site sections with layered visuals  |  {cid}  ({n} slides)", fill=INK, font=ImageFont.truetype(str(FONT), 30))
    small = ImageFont.truetype(str(FONT), 20)
    for i, f in enumerate(files):
        x = pad + (i % cols) * (tw + gap)
        y = pad + head + (i // cols) * (th + lab + gap)
        im.paste(Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS), (x, y))
        dr.text((x, y + th + 8), f"Slide {i + 1}", fill=(110, 100, 98), font=small)
    out = ROOT / "previews" / f"v4-contact-{cid}.png"
    out.parent.mkdir(exist_ok=True)
    return save(im, out)


def feed_row() -> Path:
    # Instagram shows the newest post first: posted 01, 02, 03, so the row reads 03, 02, 01.
    tw, th, g = 540, 675, 6
    covers = [Image.open(ROOT / cid / "slide-01.png").convert("RGB") for cid in reversed(IDS)]
    im = Image.new("RGB", (3 * tw + 2 * g, th), (255, 255, 255))
    for i, c in enumerate(covers):
        im.paste(c.resize((tw, th), Image.LANCZOS), (i * (tw + g), 0))
    return save(im, ROOT / "previews" / "v4-feed-row.png")


if __name__ == "__main__":
    for cid in IDS:
        print(sheet(cid))
    print(feed_row())
