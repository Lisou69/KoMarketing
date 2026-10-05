# KO Marketing, intro carousels v9

Lisa on v8: "That's what you didn't understand: each slide must be different. Right now all your slides are
organised too much the same. And also the texts offset/staggered (en décalé), not aligned so much."

v9 is v8 with a full layout rework. Copy, services, KO photos, brand, tones, light covers, the two background
phrases (debossed and glossy), the panorama continuity and the no-silk rule are exactly as in v8.
The `v3/`, `options/` and `v4/` to `v8/` folders are unchanged.

## What changed

- The shared template is gone. v8 built every slide the same way: a centred pill, then a centred headline,
  then a centred paragraph, a visual block below, then the footer. v9 gives every slide its own composition,
  written slide by slide in `S` in `source/v9.mjs`.
- Text sits on a clear grid instead of the centre axis: 72 px margins, a left column ending at 536 px and a
  right column starting near 560 px. Headlines are set line by line, with the second line indented by 50 to
  260 px. Some are left-aligned, some right-aligned. Paragraphs sit in narrow columns shifted left or right of
  the headline, and pills sit away from the headline axis.
- Visuals change position, scale and weight on every slide. The mix includes full-bleed photos (right half,
  left side, top band, whole slide), a single large card off-centre, cards running across the seams, phones
  tilted at an edge, a stair of photos, a chip cloud, a timeline, and a grid on one slide per carousel only.
- Each carousel was checked side by side on its contact sheet. Six slides that looked structurally like
  another slide in the same carousel were redone: slides 3, 4 and 6 of We are open, slides 2 and 5 of Who we
  are, and slides 5, 9 and 10 of What we do. An automated check also flags any headline, paragraph or pill
  that overlaps a photo by accident.

| # | 01 We are open | 02 Who we are | 03 What we do |
|---|---|---|---|
| 1 | Headline top-left, "open." indented; narrow paragraph to its right; photo collage bottom-left; phone tilted over the right edge into slide 2 | Team photo top-left, second card running into slide 2; "Who we / are." below with "are." pushed right; paragraph and pill in a right column | Headline right-aligned, "do." stepped out; paragraph in the left column; large photo bottom-right with a tilted card over it and one running into slide 2 |
| 2 | The whole feed post as a tall tilted card on the left; text in the right column; three chips fading out in a stair | Text first: pill left, headline right-aligned, paragraph in the left column; three cards pulling apart across the bottom | Left column text with one tilted photo; the twelve services in a tall frosted list down the right column |
| 3 | Text over the photo: terrace full height on the right two thirds, a frosted text panel overlapping it from the left, monogram card bottom-right | Full-bleed team photo on the right half; text on the left; Strategy, Content, Ads stepping in with lines converging on "Growth" | UGC: text top-left, the five items as a plain numbered list, a large tilted phone on the right |
| 4 | The grid, cut by the headline: two site cards above, four below, right column dropped | Big headline mid-left; the five steps as a vertical timeline in the right column, its line running into slide 5 | Social: full-bleed photo across the top fading into burgundy; headline under it; paragraph left, items right |
| 5 | Three photos climbing to the top right, the last into slide 6; headline right-aligned at the bottom, pill and paragraph left | Step descriptions as a stair of frosted strips across the top beside a tall photo; headline bottom-left, paragraph right | Website: tall white site card down the left column; headline as a three-step stair in the right column; screenshot leaning into slide 6 |
| 6 | CTA as a diagonal: small photo top right, text mid-left, big photo bottom right | CTA: phone tilted over the left edge; text, button and a photo right-aligned on the right | Strategy & Ads: small photo top right; big headline across the middle with a deep indent; items as a chip cloud |
| 7 | | | Email: full-bleed photo down the left side; everything else in the right column |
| 8 | | | Branding: tilted photo top right with the item card overlapping it; headline bottom-left, paragraph right-aligned |
| 9 | | | Also in house: the carousel's only grid, six cells with the headline in the first and the paragraph in the last |
| 10 | | | CTA as text over the photo: full-bleed portrait, frosted panel low right with headline, plans and button |

## Files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: `slide-NN.png` (1080x1350), `panorama.png`, `caption.txt`
- `previews/v9-feed-row.png`: the three covers as they sit in the grid
- `previews/v9-contact-01-we-are-open.png`, `v9-contact-02-who-we-are.png`, `v9-contact-03-what-we-do.png`

## Rebuild

```
cd source
node build.mjs     # uses ../../v3/source/node_modules
python3 sheets.py
```
