# KO Marketing, intro carousels v8

Lisa on v7: "No, remove the silk completely. For the text, make two different texts: one phrase debossed
(pressed/engraved into the paper) and one phrase shiny/glossy (brillant)."

v8 is v7 with these changes. Layout, text, services, tones, light covers and KO photos are exactly as in v7.
The `v3/`, `options/`, `v4/`, `v5/`, `v6/` and `v7/` folders are unchanged.

## What changed

- No silk anywhere: the v7 ribbon is gone and no silk image is used or shipped.
- The single debossed line of v6/v7 is replaced by two background phrases per carousel, both giant Source
  Serif 4 Italic running continuously across the panorama, so the slide edges cut them:

| Carousel | Debossed phrase (upper band) | Glossy phrase (lower band) |
|---|---|---|
| 01 We are open | We are open · Knock Out | Seen. Followed. Remembered. (headline of slide 5) |
| 02 Who we are | Who we are · Knock Out | Small team. All in. (pill on the cover) |
| 03 What we do | What we do · Knock Out | One team for every channel. (headline of slide 2) |

  Each phrase repeats with a " · " until it fills the panorama.
- The debossed phrase (470 px, top band) is pressed tone on tone into the paper: a shadow on the top edge
  and a highlight on the bottom edge. On burgundy it is pressed into the card.
- The glossy phrase (480 px, lower band, behind the cards) is raised and lacquered. A highlight sits on its
  top edge and a soft shadow is cast below. A lacquer gradient runs from a bright top to a darker reflection
  line to a lighter bounce, with narrow diagonal specular streaks. It is pearl white on light paper and
  burgundy with a champagne sheen on burgundy.
- The small "Knock Out" deboss kept from v5 at the bottom of each burgundy slide is removed. It sat in the
  glossy phrase's band and collided with it, and the two background phrases replace it.
- The paper grain still sits over both phrases, and every card and photo sits over them.

Phrases, sizes and finishes are set in `BG`, `DEBOSS`, `GLOSS` and `bgLines()` in `source/v8.mjs`.

## Files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: `slide-NN.png` (1080x1350), `panorama.png`, `caption.txt`
- `previews/v8-feed-row.png`: the three covers as they sit in the grid
- `previews/v8-contact-01-we-are-open.png`, `v8-contact-02-who-we-are.png`, `v8-contact-03-what-we-do.png`

## Rebuild

```
cd source
node build.mjs     # uses ../../v3/source/node_modules
python3 sheets.py
```
