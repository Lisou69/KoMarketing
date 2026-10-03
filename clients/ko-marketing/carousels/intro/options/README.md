# KO Marketing, intro carousels: options A, B and C

Three new design directions for the three intro carousels, following Lisa's feedback on v3:
the cover of every carousel is light, every slide carries a short paragraph, and every KO service
is shown. v3 is kept unchanged in [`../v3/`](../v3/).

All three options use the same copy (`source/content.mjs`), the same KO brand kit and the same photos.
They differ in layout, composition and in how type and imagery are used.

| Carousel | Slides | Cover |
|---|---|---|
| 01 We are open | 6 | Light |
| 02 Who we are | 6 | Light |
| 03 What we do | 10 | Light |

"What we do" grew from 6 to 10 slides so that each service category gets its own slide.

## The three directions

**A, editorial journal.** Warm paper pages laid out like a magazine. Sharp, full-bleed photo bands meet
at the seams, hairline rules run through the whole panorama, and big italic folio numerals sit beside
two-column text. Burgundy business-card pages with the debossed "Knock Out" act as chapter breaks.

**B, site sections and silk.** Every slide is built like a section of komarketingagency.com. A centred
✦ pill and serif headline sit on top, with the site's own components below: service cards with blue tags
and a tilted photo, dark numbered circles, and rounded photo cards. The silk ribbon is used whole on the
light slides, and one journey line with a ✦ marker per slide runs through the carousel.

**C, split spreads.** Slides work in pairs. One full-height photo straddles the seam of each pair, so
every slide is half photo and half paper, and the carousel reads as a run of magazine spreads. The paper
half is cream business-card stock or burgundy card, with a narrow editorial column set in burgundy
Source Serif 4 Italic.

What is shared, and taken from KO's own brand: logo v3 (burgundy lockup on light, white on burgundy);
burgundy #4C050C; site white and ink #1A1310; the dusty blue #94B1C8 accent word; Source Serif 4 Italic
and Manrope; ✦ pills; the business-card paper grain and tone-on-tone debossed "Knock Out"; and the silk
ribbon. The silk is only ever placed whole: exactly one slide wide with its own edges on the slide edges,
never cropped, sliced across slides, masked or warped. From Lisa's earlier references only the principles
are kept: editorial layout, artistic rather than tech, layered depth, real texture, a strong serif
hierarchy, one panorama per carousel, and image-led slides. None of their props, motifs or fonts are used.

## Every KO service, as listed on komarketingagency.com

Checked live on 3 October 2026. The site lists services in two places, and both are used word for word.
No service is invented.

**1. `/services`: six categories, with the five items each category page lists under "What we do".**
Each category gets its own slide in "What we do" (slides 3 to 8). The six category names and taglines
are summarised on slide 4 of "We are open".

| Category (source page) | Tagline | Items |
|---|---|---|
| UGC & Creator (`/services/ugc-and-creator`) | The content people actually trust. | Creator sourcing & matching, Briefs & scripting, Production & delivery, Ad-ready & whitelisted, Performance tracking |
| Social Media Manager (`/services/social-media-manager`) | Build an audience that actually shows up. | Channel strategy, Content calendar, Creation & posting, Community management, Reporting & optimisation |
| Website & SEO (`/services/website-and-seo`) | A site that works while you sleep. | Web design & build, Conversion-focused UX, SEO strategy, On-page optimisation, Speed & analytics |
| Strategy & Advertising (`/services/strategy-and-advertising`) | Put your budget where it wins. | Marketing strategy, Audience & targeting, Paid social, Google & search, Creative & testing |
| Email Marketing (`/services/email-marketing`) | The channel you actually own. | Email strategy, Automated flows, Campaign design & copy, List growth & segments, Testing & optimisation |
| Branding & Audits (`/services/branding-and-audits`) | Know exactly where the wins are hiding. | Brand & channel audits, Brand strategy, Logo & visual identity, Brand guidelines, Art direction & templates |

**2. Home page (`/`), "Services" section: twelve services.** All twelve are listed on slide 2 of
"What we do". The four that have no category page of their own (Shoots, Content Manager, Monthly
Reporting, Consulting & Coaching) also get slide 9 with their site descriptions.

Branding & Creatives, Audits, Social Media Management, Marketing, Shoots, UGC & Creators, Content Manager,
Paid Ads, Website & SEO, Email & Retention, Monthly Reporting, Consulting & Coaching.

The plans on `/plans` (Starter, Growth, Premium, where Premium includes "social, ads, shoots, UGC,
content, web/SEO & email") are named on the last slide of "What we do". The "What's included" blocks on
the six category pages repeat the same UGC list on every page, so they look like a template placeholder
and are not used.

## Files

- `option-a/`, `option-b/`, `option-c/`: one folder per carousel, each holding `slide-01.png` onwards,
  `panorama.png` and `caption.txt`. The captions are the same in all three options.
- `previews/`: for each option, `optionX-feed-row.png` (the three light covers in Instagram order, newest
  first: 03, 02, 01) and `optionX-contact-01-we-are-open.png`, `-02-who-we-are.png` and
  `-03-what-we-do.png`. Each file is under 3 MB.

## Photo credits

All photos come from Unsplash under the free Unsplash License (no Unsplash+ images). None shows a logo
or a recognisable brand. Files are in `source/assets/photos/`.

| File | Photographer | Source |
|---|---|---|
| bangkok-skyline.jpg | David Gardiner | https://unsplash.com/photos/1sG6QJubO9Q |
| bangkok-photographer.jpg | Aunnop Suthumno | https://unsplash.com/photos/hnM1z-_FGDM |
| feed-scroll.jpg | Chase Chappell | https://unsplash.com/photos/2EIdGxPIhBs |
| feed-phone.jpg | June Aye | https://unsplash.com/photos/7UhkQGlOVJI |
| team-desk.jpg | Rodrigo Rodrigues, WOLF Λ R T | https://unsplash.com/photos/Ry22piRv0bs |
| team-moodboard.jpg | Rodrigo Rodrigues, WOLF Λ R T | https://unsplash.com/photos/ITlbzevlInQ |
| strategy-notes.jpg | Brands&People | https://unsplash.com/photos/Ax8IA8GAjVg |
| cinema-camera.jpg | Josh Miller | https://unsplash.com/photos/CpZzU7w4Cz4 |
| creator-filming.jpg | Tri Vo | https://unsplash.com/photos/FD1IHVspASw |
| studio-edit.jpg | TourBox | https://unsplash.com/photos/aH4qBkX40OE |
| team-meeting.jpg | Surface | https://unsplash.com/photos/ZlJmOUFRBfQ |
| matcha-shoot.jpg | Raymond Petrik | https://unsplash.com/photos/ycgaquaaC-A |
| studio-shoot.jpg | cody lannom | https://unsplash.com/photos/G95AReIh_Ko |
| laptop-coffee.jpg | Joseph Pearson | https://unsplash.com/photos/XveTTNSrhnQ |
| planning-desk.jpg | Kelly Sikkema | https://unsplash.com/photos/ml1IgjV8OvY |
| studio-portrait.jpg | Joel Muniz | https://unsplash.com/photos/E6ExxeQNiN4 |
| team-laptops.jpg | Van Tay Media | https://unsplash.com/photos/OKDh95iyzEE |
| cafe-shoot.jpg | Izz R | https://unsplash.com/photos/vz6pyjmAKzI |
| mood-wall.jpg | Metin Ozer | https://unsplash.com/photos/HBtV30iCQHM |
| camera-tripod.jpg | rawkkim | https://unsplash.com/photos/J_BZkvwjClE |
| street-shoot.jpg | Marco Xu | https://unsplash.com/photos/frpCC-A8mp0 |

## Rebuild

```bash
cd source
npm i --no-save playwright-core   # uses the system Chrome, override with CHROME=/path/to/chrome
node build.mjs                    # all options; or: node build.mjs B --only 03
python3 sheets.py                 # contact sheets and feed rows (needs Pillow)
```

Fonts: Source Serif 4 and Manrope, both SIL Open Font License (licences in `source/fonts/`).
