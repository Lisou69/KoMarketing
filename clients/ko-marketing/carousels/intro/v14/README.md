# KO Marketing, intro carousels v14

The client approved the v13 cover layout but wants different photos. v14 is v13 with only the three cover
photos (and their captions) swapped. Layout, text, colours and sizes are identical, and slides 02 to 06 are
pixel-identical to v13.

All three photos come from KO's own site image set, and none is used anywhere else in the three carousels:

| Slot | Caption | Repo asset | Site file |
|---|---|---|---|
| 01 (left, shortest) | VENUE | `ko-terrace-city.jpg` | `Banque_d'Images_NU_10058.jpg` |
| 02 (middle) | LIFESTYLE | `ko-lifestyle-table.jpg` | `IMG_0835.jpg` |
| 03 (right, tallest) | PRODUCT | `ko-product-hand.jpg` | `Banque_d'Images_TURD7855.jpg` |

## Export

- `export/v14-we-are-open-01-cover.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
