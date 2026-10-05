# KO Marketing, intro carousels v13

Client on We are open slide 01 (cover): "very wobbly, no organisation, the photos are too disorganised".

v13 is v12 with only the cover redesigned. Slides 03 to 06 are pixel-identical to v12. Slide 02 differs only by
a few faint pixels on its left edge: the shadow of the old tilted phone used to spill there and is now gone.

## The new cover

Everything snaps to the 72 px grid, with no tilts and no overlaps:

- the "Now open in Bangkok" pill at top left (x 72, y 150)
- the headline "We are / *open.*" at 160 px, with the second line indented 180 px and "open." in dusty blue
- the paragraph in the right column (x 640, width 368) beside "open.", in #2A2220
- a stepped row of three equal-width photos (296 px, 24 px gutters, radius 18) on one shared baseline at y 1160,
  stepping up 50 px each toward the swipe: padel (Sport), plated food (Hospitality), the laughing portrait
  (Beauty). Above each photo sits a small caption: burgundy number, a hairline, then the sector in letter-spaced caps.

The background phrases, footer (URL, SWIPE, 01 / 06) and paper are the same as in v12, and there is no progress line.
Nothing crosses into slide 02.

## Export

- `export/v13-we-are-open-01-cover.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
