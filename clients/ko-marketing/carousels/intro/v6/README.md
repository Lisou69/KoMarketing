# KO Marketing, intro carousels v6

Lisa on v5: "OK good, but can you add more in the background? Like text that continues across all the
slides, debossed (pressed/engraved) into the paper."

v6 is v5 plus one background layer. Layout, text, services, tones, light covers and KO photos are exactly
the same as v5 (see `../v5/README.md` for which KO image is where and the three Unsplash team photos that
remain). The `v3/`, `options/`, `v4/` and `v5/` folders are unchanged.

## The background line

Each carousel has one continuous line of giant Source Serif 4 Italic (600 px) running through the whole
panorama, so the letters are cut by the slide edges and carry on into the next slide:

| Carousel | Line |
|---|---|
| 01 We are open | We are open · Knock Out · KO Marketing · We are open · Knock Out |
| 02 Who we are | Who we are · KO Marketing · Knock Out · Who we are · KO Marketing |
| 03 What we do | What we do · Knock Out · KO Marketing · What we do · Knock Out · ... |

It is pressed tone on tone into whatever paper it crosses: a slightly darker letter with a soft shadow on
the top edge and a highlight on the bottom edge. Light slides use the light paper, and burgundy slides use
the burgundy card. It sits behind everything, including the silk ribbon, and the paper grain is drawn over
it, so the grain shows through the letters. The line, size and depth are set in `BG_LINE`, `BG_SIZE`,
`BG_TOP` and `bgLine()` at the top of the layer code in `source/v6.mjs`.

## Files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: `slide-NN.png` (1080x1350), `panorama.png`, `caption.txt`
- `previews/v6-feed-row.png`: the three covers as they sit in the grid
- `previews/v6-contact-01-we-are-open.png`, `v6-contact-02-who-we-are.png`, `v6-contact-03-what-we-do.png`

## Rebuild

```
cd source
node build.mjs     # renders all slides and panoramas (uses ../../v3/source/node_modules)
python3 sheets.py  # contact sheets and feed row
```
