# KO Marketing, intro carousels v15

The client asked to change only photo 1 on the We are open cover. v15 is v14 with that photo swapped for the golf
lounge shot from KO's site set (`Banque_d'Images_NU_10285.jpg`, saved here as `ko-golf-lounge.jpg`). It is not
used anywhere else in the three carousels. The caption stays VENUE. Everything else is identical to v14, and
slides 02 to 06 are pixel-identical to v14.

| Slot | Caption | Repo asset | Site file |
|---|---|---|---|
| 01 (left, shortest) | VENUE | `ko-golf-lounge.jpg` | `Banque_d'Images_NU_10285.jpg` |
| 02 (middle) | LIFESTYLE | `ko-lifestyle-table.jpg` | `IMG_0835.jpg` |
| 03 (right, tallest) | PRODUCT | `ko-product-hand.jpg` | `Banque_d'Images_TURD7855.jpg` |

## Export

- `export/v15-we-are-open-01-cover.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
