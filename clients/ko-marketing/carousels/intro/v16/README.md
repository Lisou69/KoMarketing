# KO Marketing, intro carousels v16

The client asked to change only the photo on We are open slide 03 ("A bold agency in the heart of Bangkok").
v16 is v15 with that one photo swapped. The frosted panel, text, tags, KO tile and layout are identical, and
slides 01, 02, 04, 05 and 06 are pixel-identical to v15.

- Old photo: `ko-terrace` (`Contenu_Site_Portfolio_Sans_titre-3e.jpg`)
- New photo: `ko-terrace-city.jpg`, which is KO's site file `Banque_d'Images_NU_10059.jpg`. It is a bright, light
  terrace looking onto Bangkok city buildings, framed at `40% 50%`, and is not used anywhere else in the three
  carousels.

I also tried the golf-simulator shot (`NU_10079`), but it was busy, clashed with the page number and repeated
the cover's golf lounge. The beach skyline portrait (`TURD8585`) put the model's face behind the panel.
Neither was kept.

## Export

- `export/v16-we-are-open-03-who-we-are.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
