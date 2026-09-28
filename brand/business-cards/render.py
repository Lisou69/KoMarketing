#!/usr/bin/env python3
"""Render KO business cards to print and preview PDFs, then check them."""

from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

ROOT = Path(__file__).resolve().parent
HTML = ROOT / "cards.html"
PRINT = ROOT / "KO-business-cards-print.pdf"
PREVIEW = ROOT / "KO-business-cards-preview.pdf"
MM = 72 / 25.4


def render_pdfs():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page()
        page.goto(HTML.as_uri(), wait_until="networkidle")
        page.evaluate("() => document.fonts.ready")
        page.pdf(
            path=str(PRINT),
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        page.goto(HTML.as_uri() + "?preview", wait_until="networkidle")
        page.evaluate("() => document.fonts.ready")
        page.pdf(
            path=str(PREVIEW),
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
        )
        browser.close()


def set_boxes(path):
    """Center a 90×55 mm trim and a 3 mm bleed on each print page."""
    reader = PdfReader(str(path))
    writer = PdfWriter()
    trim_w, trim_h = 90 * MM, 55 * MM
    bleed_w, bleed_h = 96 * MM, 61 * MM
    for page in reader.pages:
        box = page.mediabox
        pw, ph = float(box.width), float(box.height)
        tx = (pw - trim_w) / 2
        ty = (ph - trim_h) / 2
        bx = (pw - bleed_w) / 2
        by = (ph - bleed_h) / 2
        page.trimbox = RectangleObject([tx, ty, tx + trim_w, ty + trim_h])
        page.bleedbox = RectangleObject([bx, by, bx + bleed_w, by + bleed_h])
        writer.add_page(page)
    writer.add_metadata(reader.metadata or {})
    with path.open("wb") as f:
        writer.write(f)


if __name__ == "__main__":
    render_pdfs()
    set_boxes(PRINT)
    print("wrote", PRINT.name, PREVIEW.name)
