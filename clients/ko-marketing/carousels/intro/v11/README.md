# KO Marketing, intro carousels v11

Lisa on v10, We are open slide 04: stop copying the site's service cards; list the services ourselves in an
original editorial design.

v11 is v10 with one slide replaced: We are open 04 (What we do). Every other slide is pixel-identical to v10.
The new slide is a typographic index, set like a magazine contents page. It has no cards, icons, photos or
other site components:

- a small burgundy rule and the label "WHAT WE DO · SIX SERVICES"
- the headline in three lines stepping right: "Everything your brand / needs, under / *one* roof." ("one" in dusty blue)
- a short intro tucked under the headline on the left
- the six categories in two staggered columns of hairline-ruled entries, the right column dropped by 70 px.
  Each entry has a burgundy number, the name in Source Serif 4 Italic and one line in our own words.

The footer, page number and background phrases are as in v10, and there is no progress line. Nothing on this
slide crosses into slide 03 or slide 05.

## Export

- `export/v11-we-are-open-04-what-we-do.png` (1080x1350)

The other 21 slides are unchanged: use `../v10/export/`.

## Rebuild

```
cd source
node build.mjs --only 01     # uses ../../v3/source/node_modules
```
