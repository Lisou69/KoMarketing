# KO Marketing, intro carousels v12

Client on v11, We are open slide 04: the text is hard to read.

v12 is v11 with a contrast pass on that one slide. Layout, copy, fonts, sizes, positions and line breaks are
unchanged; every other slide is pixel-identical to v11 (and v10). No progress line.

- Intro ("Take one, or take the lot...") and the six service descriptions: from rgba(26,19,16,.72)
  (about 7:1 on the paper) to warm near-black #2A2220 (about 14.3:1). Intro weight 400 to 500; descriptions
  stay 400 so the line breaks do not move.
- Service names (Source Serif 4 Italic): ink #1A1310, weight 500 to 600.
- Burgundy numbers: #4C050C, weight 500 to 700.
- Hairline rules: burgundy at 28% to 42%.
- Label "WHAT WE DO · SIX SERVICES": weight 700 to 800, rule 2 px to 2.5 px.
- Footer "komarketingagency.com": rgba(26,19,16,.72) weight 500 to #2A2220 weight 600; page count "/ 06" opacity .45 to .70.
- Background phrases ("Knock Out" deboss, "Remembered" gloss): a feathered paper veil (two soft radial
  gradients of #F5F5F7 at 55 to 82%) sits between them and the text, over the intro and the service index.
  They stay at full strength around the edges and at the bottom.

## Export

- `export/v12-we-are-open-04-what-we-do.png` (1080x1350)

## Rebuild

```
cd source
npm i playwright-core   # not committed
CHROME=/usr/bin/google-chrome node build.mjs --only 01
```
