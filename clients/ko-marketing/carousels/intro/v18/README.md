# KO Marketing, intro carousels v18

v18 is v17 with We are open slide 05 ("Seen. Followed. Remembered.") reworked in two ways:

1. **New third photo.** The "Remembered" photo, `ko-padel-red`, is replaced by `ko-beauty-friends.jpg`: two
   friends laughing on warm sand with the product, from KO's site file `Banque_d'Images_TURD0156.jpg`. It is not
   used anywhere else in the three carousels, and its warm tones sit well with the other two photos.
2. **Equal spacing.** The photos now have equal 24 px horizontal gaps (72 to 332, 356 to 636, 660 to 1008) and an
   equal 150 px vertical step (tops at 470, 320 and 170). Photo 1 (260x330) and photo 2 (280x380) keep their sizes.
   Photo 3 goes from 400x450 to 348x450 so it ends on the 72 px right margin instead of running into slide 06.

The tags, label, headline, paragraph and footer are identical, and nothing overlaps the text. Slides 01 to 04 are
pixel-identical to v17. On slide 06, the sliver of the old red photo at its left edge (x 0 to 44) is gone, because
nothing crosses over any more. The rest of slide 06 is identical.

## Export

- `export/v18-we-are-open-05-what-changes.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
