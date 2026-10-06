"""Render the Asian Gala production plan to PDF and page previews."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
HTML = ROOT / "plan.html"
PDF = ROOT / "asian-gala-2026-plan-de-production.pdf"
PREVIEW = ROOT / "preview"


def main():
    PREVIEW.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/opt/google/chrome/chrome",
            args=["--allow-file-access-from-files", "--font-render-hinting=none"],
        )
        page = browser.new_page(viewport={"width": 794, "height": 1123}, device_scale_factor=2)
        page.goto(HTML.as_uri(), wait_until="networkidle")
        page.emulate_media(media="print")
        page.pdf(
            path=str(PDF),
            print_background=True,
            prefer_css_page_size=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
        )
        pages = page.locator(".page")
        n = pages.count()
        for i in range(n):
            pages.nth(i).screenshot(path=str(PREVIEW / f"page-{i+1:02d}.png"))
        browser.close()
    print(PDF)
    print(n, "pages")


if __name__ == "__main__":
    main()
