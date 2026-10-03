"""Builds the contact sheets and the feed row from the rendered slides.
Usage: python3 sheets.py   (needs Pillow; run after node build.mjs)
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT = Path(__file__).resolve().parent / "fonts" / "Poppins-Medium.ttf"
IDS = ["01-we-are-open", "02-who-we-are", "03-what-we-do"]
BG = (243, 235, 223)
INK = (76, 5, 12)
TW, TH, GAP, PAD = 540, 675, 24, 48


def sheet(cid: str) -> Path:
    slides = [Image.open(ROOT / cid / f"slide-0{i}.png").convert("RGB") for i in range(1, 7)]
    head = 70
    w = PAD * 2 + 3 * TW + 2 * GAP
    h = PAD * 2 + head + 2 * TH + GAP + 2 * 40
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    d.text((PAD, PAD), f"KO Marketing  |  intro carousel {cid}", fill=INK, font=ImageFont.truetype(str(FONT), 30))
    small = ImageFont.truetype(str(FONT), 20)
    for i, s in enumerate(slides):
        x = PAD + (i % 3) * (TW + GAP)
        y = PAD + head + (i // 3) * (TH + GAP + 40)
        im.paste(s.resize((TW, TH), Image.LANCZOS), (x, y))
        d.text((x, y + TH + 8), f"Slide {i + 1}", fill=(120, 80, 80), font=small)
    out = ROOT / "previews" / f"contact-sheet-{cid}.png"
    out.parent.mkdir(exist_ok=True)
    im.save(out, optimize=True)
    return out


def feed_row() -> Path:
    # Instagram shows the newest post first: posted 01, 02, 03, so the row reads 03, 02, 01.
    covers = [Image.open(ROOT / cid / "slide-01.png").convert("RGB") for cid in reversed(IDS)]
    g = 6
    im = Image.new("RGB", (3 * TW + 2 * g, TH), (255, 255, 255))
    for i, c in enumerate(covers):
        im.paste(c.resize((TW, TH), Image.LANCZOS), (i * (TW + g), 0))
    out = ROOT / "previews" / "feed-row.png"
    im.save(out, optimize=True)
    return out


if __name__ == "__main__":
    for cid in IDS:
        print(sheet(cid))
    print(feed_row())
