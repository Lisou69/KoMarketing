#!/usr/bin/env python3
"""Print PDFs. The front page is the pre-Knock-Out card. Both backs are new."""

from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

ROOT = Path(__file__).resolve().parent
HTML = ROOT / "cards.html"
MM = 72 / 25.4


def render_one(browser, query, path):
    page = browser.new_page()
    page.goto(HTML.as_uri() + query, wait_until="networkidle")
    page.evaluate(
        """() => Promise.all([
          document.fonts.ready,
          ...[...document.images].map((img) => img.complete
            ? 1
            : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; }))
        ])"""
    )
    page.pdf(
        path=str(path),
        print_background=True,
        prefer_css_page_size=True,
        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
    )
    page.close()


def set_boxes(path):
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
    with path.open("wb") as handle:
        writer.write(handle)


def split_pages(src, names):
    reader = PdfReader(str(src))
    if len(reader.pages) != len(names):
        raise SystemExit(f"{src.name} has {len(reader.pages)} pages, expected {len(names)}")
    for page, name in zip(reader.pages, names):
        writer = PdfWriter()
        writer.add_page(page)
        with name.open("wb") as handle:
            writer.write(handle)
        print("wrote", name.name)


def stitch_print(front_path, back_names, print_path):
    """Pre-Knock-Out front page plus the newly rendered backs."""
    front = PdfReader(str(front_path))
    if len(front.pages) != 1:
        raise SystemExit(f"{front_path.name} should stay a single page")
    writer = PdfWriter()
    writer.add_page(front.pages[0])
    for name in back_names:
        back = PdfReader(str(ROOT / name))
        if len(back.pages) != 1:
            raise SystemExit(f"{name} should stay a single page")
        writer.add_page(back.pages[0])
    with print_path.open("wb") as handle:
        writer.write(handle)
    print("wrote", print_path.name)


def render_all():
    """New backs. The front PDF stays the file from before Knock Out."""
    raw_path = Path("/tmp/v2B-print-raw.pdf")
    preview_path = Path("/tmp/v2-preview-b.pdf")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        render_one(browser, "?back=b", raw_path)
        render_one(browser, "?preview&back=b", preview_path)
        print("rendered", raw_path.name, preview_path.name)
        browser.close()
    set_boxes(raw_path)
    raw = PdfReader(str(raw_path))
    if len(raw.pages) != 3:
        raise SystemExit(f"{raw_path.name} has {len(raw.pages)} pages, expected 3")
    backs_only = Path("/tmp/v2B-backs-raw.pdf")
    backs = PdfWriter()
    backs.add_page(raw.pages[1])
    backs.add_page(raw.pages[2])
    with backs_only.open("wb") as handle:
        backs.write(handle)
    back_names = [
        ROOT / "v2B-back-lisa-maretti.pdf",
        ROOT / "v2B-back-kristina-ostapenko.pdf",
    ]
    split_pages(backs_only, back_names)
    stitch_print(ROOT / "v2B-front.pdf", [path.name for path in back_names], ROOT / "v2B-print.pdf")


if __name__ == "__main__":
    render_all()
