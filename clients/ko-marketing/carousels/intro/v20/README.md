# v20

v20 = v19 with only the BOTTOM photo on We are open slide 06 (Contact) replaced: golf simulator handshake (ko-golf-handshake) -> ko-beauty-oil (KO site photo Banque_d'Images_TURD8848.jpg, model holding the oil bottle against green foliage; same shoot as the top leaves/bottle photo, not golf, not used elsewhere, not AI-generated). Size, position, tilt (-3deg), layout and text unchanged; all other slides pixel-identical to v19. Export: export/v20-we-are-open-06-contact.png.

# KO Marketing, intro carousels v19

v19 is v18 with one change: the small tilted photo at the top right of We are open slide 06 (contact). It was the
padel shot `ko-padel-b`. It is now `ko-bottle-leaves.jpg`, a hand holding a product bottle among glossy green
leaves, from KO's site file `Banque_d'Images_TURD8922.jpg`. The new photo is not used anywhere else in the three
carousels, and its greens match the golf photo below.

The card keeps its size, position and tilt (270x300 at 730, 140, rotated 7°). The text, button, golf photo and
footer are identical, and slides 01 to 05 are pixel-identical to v18.

## Export

- `export/v19-we-are-open-06-contact.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
