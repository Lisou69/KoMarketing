#!/usr/bin/env python3
"""Print PDFs for the two v2 backs. Each file is front, Lisa, Kristina."""

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


def render_all():
    """Front plus both B backs, on the lighter sheet."""
    raw_path = ROOT / "v2B-print.pdf"
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
    split_pages(
        raw_path,
        [
            ROOT / "v2B-front.pdf",
            ROOT / "v2B-back-lisa-maretti.pdf",
            ROOT / "v2B-back-kristina-ostapenko.pdf",
        ],
    )


if __name__ == "__main__":
    render_all()
