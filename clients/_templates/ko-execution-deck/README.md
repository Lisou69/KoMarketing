# KO Execution Deck — Reusable Template

Master template for KO Marketing client execution decks.
Established Sep 2026; visual bar set by the Asian Gala reference + komarketingagency.com brand.

## Quick start

1. Copy the Fairway deck HTML as a starting point:
   ```
   cp clients/fairway-golf-and-city-club/deck/Fairway-Mandrake-KO-Execution-Plan.html \
      clients/<new-client>/deck/<Client>-Execution-Plan.html
   ```
2. Replace client-specific content (slide text, numbers, dates).
3. Keep the `<style>` block and JS unchanged — they are the template.
4. Copy `ko-logo.png` and `ko-logo-full.png` into the new deck's `assets/`.
5. Regenerate the PDF with Puppeteer (see below).

## Extracted palette (komarketingagency.com, Sep 2026)

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#110300` | Primary dark background |
| `--ink-deep` | `#0d0200` | Deepest dark |
| `--ink-card` | `#1a0f0b` | Card interior on dark |
| `--ink-subtle` | `#231814` | Subtle variation |
| `--wine` | `#4c050c` | Primary accent (replaces gold) |
| `--ember` | `#611609` | Gradient end for CTAs, bars |
| `--brown` | `#62483e` | Tertiary text |
| `--steel` | `#94b1c8` | Data accent, number callouts |
| `--steel-dim` | `#84a0b6` | Kickers, eyebrows |
| `--warm` | `#f6f0e9` | Light section background |
| `--cream` | `#e3dfce` | Border / separator on light |
| `--muted` | `#8b8480` | Subdued body text |
| `--subtle` | `#534e4c` | De-emphasized text |
| `--white` | `#ffffff` | Primary text on dark |

Card surfaces use pre-blended opaque colors (no CSS transparency) so the PDF
renders correctly on all readers, including Windows viewers that turn `rgba()`
into magenta. See `avi-print-sans-transparence`.

## Fonts

| Role | Family | Weight / Style |
|---|---|---|
| Display headings (h1, h2) | Source Serif 4 | 400 italic |
| Accent word in titles | Source Serif 4 | italic, steel color |
| Number callouts | Source Serif 4 | 400 italic |
| Body, kickers, pills | Inter | 400 / 500 / 600 / 700 |
| Eyebrows | Inter | 600, uppercase, 0.22em tracking |

Loaded from Google Fonts. If offline, embed as base64 `@font-face`.

## Design rules

- **Slide size:** 960 × 540 px (16:9)
- **Padding:** 24px top, 40px sides, 10px bottom (top ≥ 20px is Lisa's rule)
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 px (8-pt grid)
- **Light/dark rhythm:** AVI-style alternation. ~11 light slides (`data-tone="light"`, bg `#f6f0e9`) and ~12 dark slides (bg `#110300`). Light surfaces use white cards with cream borders; dark surfaces use pre-blended opaque card fills.
- **Fill-stretch layout:** `.fill` uses `flex: 1` with grids set to `flex: 1` so content fills the frame height. No floating content islands.
- **Cards:** `border-radius: 14px`, 1px solid border, opaque fill
- **Accent bar:** 48 × 3px gradient (wine → ember) under section titles
- **Note bar:** AVI-style left-accent strip, 3px wine, rounded right corners
- **Photos:** Cover only (2 max). No stock grids. Brand textures OK.
- **Footer:** KO logo + section name + slide counter, separated by 1px border
- **Timeline rail:** Wine dots, wine-ember gradient track
- **Pills:** 999px radius (pill shape), 9px uppercase
- **No shadows** — depth from borders and background layers only
- **No CSS transparency** in the PDF — all colors pre-blended to opaque
- **Max content gap:** ≤ 48px between consecutive blocks (measured, not by eye)

## Slide map (~20–24 slides)

The standard KO execution deck follows this structure:

1. Cover (photos allowed)
2. Contents (interactive jump links)
3. Outcomes
4. Offer
5. Timeline
6. 90-day runway (month-by-month)
7. Week 1
8. Monthly cadence
9–10. Venue deliverables (one per venue)
11. Must vs nice (scope line)
12. Shoot and models
13–14. Paid ads (one per venue)
15. Channels
16. Month-1 budget (hero number)
17. Months 2–3
18. KPIs
19. Report contents
20. Billing
21. Next steps
22. Three lock-ins (closing slide)
23. Appendix

## PDF generation

```js
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new', args: ['--no-sandbox']
});
const page = await browser.newPage();
await page.goto('file:///.../deck.html?export=pdf', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: 'deck.pdf', printBackground: true, preferCSSPageSize: true,
  width: '960px', height: '540px', margin: { top: 0, right: 0, bottom: 0, left: 0 }
});
```

## Overflow check (run before every ship)

```js
Array.from(document.querySelectorAll('.slide')).map((s,i) => {
  const sr = s.getBoundingClientRect();
  const clipped = [...s.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.bottom > sr.bottom + 2;
  }).length;
  return { n: i+1, clipped };
}).filter(d => d.clipped > 0);
```

Zero clipped elements = ready to ship.
