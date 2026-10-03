# KO Marketing, intro carousels v10 (final export)

Lisa approved v9. v10 is v9 with one change: the progress line along the bottom of every slide (the thin line
with the dots and the star, just under the footer) is removed from all 22 slides. Footer URL, SWIPE/SAVE, page
numbers, layouts, text, photos and background phrases are exactly as in v9. A pixel diff against v9 shows
that the only change on every slide is inside the band at y 1266 to 1290, where the line sat.

## Export

`export/` holds the 22 slides as individual 1080x1350 optimized PNGs (0.7 to 1.5 MB each), named
`v10-<carousel>-<NN>-<slide>.png`:

| Carousel | Slides |
|---|---|
| We are open | 01-cover, 02-the-problem, 03-who-we-are, 04-what-we-do, 05-what-changes, 06-contact |
| Who we are | 01-cover, 02-the-problem, 03-one-roof, 04-how-we-work, 05-every-step, 06-contact |
| What we do | 01-cover, 02-services, 03-ugc-creator, 04-social-media, 05-website-seo, 06-strategy-ads, 07-email, 08-branding-audits, 09-also-in-house, 10-plans |

The captions are in `01-we-are-open/caption.txt`, `02-who-we-are/caption.txt` and `03-what-we-do/caption.txt`.

## Other files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: `slide-NN.png`, `panorama.png`, `caption.txt`
- `previews/v10-feed-row.png` and `previews/v10-contact-*.png`

## Rebuild

```
cd source
node build.mjs     # uses ../../v3/source/node_modules
python3 sheets.py
```
