# KO Marketing, intro carousels v17

The client asked to replace the flat white frame around the Instagram screenshot on We are open slide 02
("Seen once. Then forgotten.") with a realistic phone. v17 is v16 with that one change. The text, chips, label
and footer are identical, and slides 01 and 03 to 06 are pixel-identical to v16.

## The phone

It is drawn entirely in HTML, CSS and inline SVG inside `v17.mjs` (`iphone()`), with no external asset and no
photo:

- a 420x866 body with a 68 px corner radius, placed on the old frame's centre (310, 607) at the same -4° tilt
- a brushed titanium band: a horizontal metal gradient with bright edge highlights, top light and bottom shade,
  and antenna-line breaks
- side buttons: action and volume up and down on the left, power on the right, each with metal shading
- a black bezel, then a 54 px radius screen
- a real iOS-style status bar (9:41, signal, wifi and battery drawn in SVG), a dynamic island with a camera lens,
  and a home indicator
- the same `ko-feed-post` Instagram screenshot, fitted to the screen width under the status bar
- a diagonal glass sheen and a soft inner edge shadow
- a layered soft shadow cast on the burgundy

Nothing overlaps the headline, paragraph or chips: the phone's right edge stays at least about 25 px clear of
the "Seen" chip.

## Export

- `export/v17-we-are-open-02-the-problem.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
