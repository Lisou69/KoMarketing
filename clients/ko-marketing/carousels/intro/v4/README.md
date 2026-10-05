# KO Marketing, intro carousels v4

Lisa's feedback on options A, B and C: "None of them. At most, a mix of B and what you did before."
v4 mixes option B with v3. The v3 folder and the options folder are unchanged.

| Carousel | Slides | Tones (p light, b burgundy) |
|---|---|---|
| 01 We are open | 6 | p b p p b p |
| 02 Who we are | 6 | p b p b b p |
| 03 What we do | 10 | p b p b p b p b b p |

Slide 1 of every carousel is light, and so is the last slide, so each carousel opens and closes on the
same tone.

## What comes from where

**From option B:** the site-section structure, with a centred ✦ pill, a serif headline with one
dusty-blue word and a short centred paragraph at the top of every slide. Also from B: the silk ribbon
used whole on light slides, the site's service cards (icon square, name, line, tilted photo), and the
thin ✦ progress line running through the carousel.

**From v3:**
- a layered hero on every slide: the phone frame in front of a row of photo cards, fanned cards,
  frosted cards and chips, numbered circles, and the converging lines into one team photo;
- burgundy and light slides alternating inside each carousel, with the paper grain and the debossed
  "Knock Out" on burgundy;
- panorama continuity: a card from each cover runs into slide 2, a card from slide 5 of "We are open"
  leans into slide 6, and the five frosted step bars of "Who we are" run from slide 4 into slide 5.

The header is also v3's: logo v3 at top left and the counter at top right.

## Services

The copy and the service structure are the same as in the options. See
[`../options/README.md`](../options/README.md) for the full service list and its source pages on
komarketingagency.com.

- "We are open", slide 4: the six `/services` categories with their taglines.
- "What we do":
  - slide 2: the twelve home-page services;
  - slides 3 to 8: one slide per category, with its five items;
  - slide 9: Shoots, Content Manager, Monthly Reporting, and Consulting & Coaching;
  - slide 10: the Starter, Growth and Premium plans.

The only copy change from the options is in "Who we are": all five steps now run across slides 4 and 5,
and slide 5 is titled "Every step, in plain sight."

## Files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: each holds `slide-01.png` onwards,
  `panorama.png` and `caption.txt`.
- `previews/`: `v4-feed-row.png` (the three light covers in Instagram order, newest first: 03, 02, 01),
  `v4-contact-01-we-are-open.png`, `v4-contact-02-who-we-are.png` and `v4-contact-03-what-we-do.png`.
  Each file is under 3 MB.

Photo credits are the same as in the options (Unsplash License; see `../options/README.md`).

## Rebuild

```bash
cd source
npm i --no-save playwright-core   # uses the system Chrome, override with CHROME=/path/to/chrome
node build.mjs                    # or: node build.mjs --only 03
python3 sheets.py                 # contact sheets and feed row (needs Pillow)
```
