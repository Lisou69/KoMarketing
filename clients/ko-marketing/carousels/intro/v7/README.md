# KO Marketing, intro carousels v7

Lisa on v6: "OK, but the silk must not overlap (superpose). At worst remove the silk, and find another silk
component, with an end, which for example would finish on slide 3 or elsewhere."

v7 is v6 with the silk reworked. Everything else is exactly as in v6: layout, text, services, tones, light
covers, KO photos and the debossed background line (see `../v6/README.md` and `../v5/README.md`). The `v3/`,
`options/`, `v4/`, `v5/` and `v6/` folders are unchanged.

## What changed

- All ten per-slide silk ribbons are gone (KO's `silk-element.png`, placed whole on each light slide).
- Each carousel now has one silk ribbon. It enters from the left edge of slide 1, flows across the
  panorama and ends in a clean dovetail cut, like the end of a cut satin ribbon:

| Carousel | Where the ribbon ends |
|---|---|
| 01 We are open | slide 3, above the KO card |
| 02 Who we are | slide 3, between the Content and Ads pills |
| 03 What we do | slide 2, above the services panel (slide 3 has no free paper for the end to show) |

- It appears once, is never duplicated, and never crosses itself, because its centre line never turns back.
- It runs below the headlines and paragraphs: the closest gap is 40 px, under the paragraph on slide 3 of
  We are open. It also stays above the footer.
- It slips behind the cards, photos and the phone, and sits above the debossed background line and the
  grounds. The paper grain is still drawn over everything.
- From slide 4 on (2 in What we do) there is no silk.

## Where the silk comes from

KO's assets have no silk piece with an end. `silk-element.png` from the site and the two silk images in the
site folder (`Frame_4bis.jpg` and a Banque d'Images silk background) are all cut off by the frame on every
side. The other silk pictures in the earlier research grids are full-frame stock fabric. So the ribbon is
rendered, not photographed or AI-generated. `source/ribbon/render.mjs` builds it in 3D with three.js: a satin
strip with a gentle twist, a cupped cross-section and two soft folds, a physical satin material (sheen,
anisotropy) in soft studio light, in the same grey-white as the site's silk. It is saved with transparency
as `source/assets/silk-ribbon-01.png`, `-02.png` and `-03.png`. A soft drop shadow is added when it is placed.

## Files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: `slide-NN.png` (1080x1350), `panorama.png`, `caption.txt`
- `previews/v7-feed-row.png`: the three covers as they sit in the grid
- `previews/v7-contact-01-we-are-open.png`, `v7-contact-02-who-we-are.png`, `v7-contact-03-what-we-do.png`

## Rebuild

```
cd source/ribbon && npm ci && node render.mjs   # only if the ribbon paths change
cd .. && node build.mjs && python3 sheets.py    # slides, panoramas, contact sheets, feed row
```
