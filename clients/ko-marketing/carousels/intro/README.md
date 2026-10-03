# KO Marketing, Instagram intro carousels

Three 6 slide carousels (1080x1350) introducing KO Marketing. Each one is designed as a single
6480x1350 canvas and cut into slides, so the story line, the numbered glass bars (slides 4 and 5)
and the outlined background words cross the slide borders. The full canvas is exported as `panorama.png`.

| Folder | Post | Order |
|---|---|---|
| [01-we-are-open](./01-we-are-open/) | We are open | Post first |
| [02-who-we-are](./02-who-we-are/) | Who we are | Post second |
| [03-what-we-do](./03-what-we-do/) | What we do | Post third |

`previews/` holds one contact sheet per carousel, the feed row (Instagram order, newest on the left:
03, 02, 01) and a zip of every PNG.

Every line comes from komarketingagency.com (home, services, plans and contact pages, checked on
3 October 2026). No figures are used on the slides.

## Design system

- Dark ground (#0B0607) with one soft KO burgundy (#4C050C) glow per slide, layered gradients, light grain,
  outlined Poppins Bold background words at very low opacity.
- Official KO logo v3, white lockup on every slide (dark ground). White monogram as the hero of carousel 1 slide 3.
- KO silk ribbon (`silk-element.png`) on every cover and every CTA slide, always the whole image at exactly the
  slide width, never cropped, masked, recoloured or warped.
- Poppins (Medium titles, Light body) plus one Playfair Display Italic accent word per slide, in a light tint of KO burgundy.
- Frosted glass recipe B (white 10%, blur 20, 1px white 28% border, inner shadow) for every chip, bar and CTA.
- One continuous story line per carousel with nodes on slides 1, 2, 3, 4 and 6, ending under the CTA silk.

## Slide texts

### 01 We are open

1. Chip: Now open in Bangkok. Title: We are *open.* Sub: Your new marketing team, from the heart of Bangkok.
2. THE PROBLEM. Chips: Seen, Scrolled past, Forgotten. Title: Seen once. Then *forgotten.* Body: Posting is easy. Being the brand people remember is the hard part.
3. WHO WE ARE. Chips: In house team, Bangkok, Thailand. Title: A bold agency in the heart of *Bangkok.* Body: Built for brands that refuse to blend in.
4. WHAT WE BRING. Bars: 01 Strategy, 02 Content, 03 Ads. Title: Three things, *one* team. Body: Strategy, content and ads, all under one roof.
5. WHAT CHANGES. Bars: Clear goals, the right channels and a plan that actually delivers. / Posts, copy, shoots and creator content made to perform. / The right message to the right people, optimised for return. Title: Seen. Followed. *Remembered.* Body: Every piece pulls in the same direction: growth.
6. Title: Let's make your brand the one people *remember.* Body: Strategy, content and ads, all under one roof, all in. CTA: komarketingagency.com. Save this post for later.

### 02 Who we are

1. Chip: Small team. All in. Title: Who we *are.* Sub: A marketing agency for brands that refuse to blend in.
2. THE PROBLEM. Chips: Strategy, Content, Ads (scattered). Title: Too many teams. No *direction.* Body: When strategy, content and ads sit in different places, they stop pulling the same way.
3. WHO WE ARE. Chips: Strategy, Content, Ads, joined into Growth. Title: Everything under *one* roof. Body: From strategy to content to ads, we do it all in house.
4. HOW WE WORK. Bars: 01 Discover, 02 Strategy, 03 Create. Title: From hello to *growth.* Body: Simple, fast, transparent.
5. WHAT CHANGES. Bars: We dig into your brand, market and goals to find the real opportunity. / We map the plan: channels, message, targets, timeline. / Our team builds the content, campaigns and assets that bring it to life. Title: Then we launch and *scale.* Body: We watch the data daily, double down on what works and keep raising the bar.
6. Title: Tell us about your *brand.* Body: We get back to you within one business day. CTA: komarketingagency.com. Save this post for later.

### 03 What we do

1. Chip: Strategy, content, ads. Title: What we *do.* Sub: Everything your brand needs, all under one roof.
2. THE PROBLEM. Checklist: A clear look, Active channels, The right message. Title: Good brands still *blend* in. Body: Without a clear look, active channels and the right message, people scroll past.
3. OUR SERVICES. Pills: Branding & Creatives, Audits, Social Media Management, Marketing Strategy, Shoots, UGC & Creators, Content Manager, Paid Ads, Website & SEO, Email & Retention, Monthly Reporting, Consulting & Coaching. Title: One team for every *channel.* Body: Pick one service, or hand us the whole thing.
4. WHAT WE BRING. Bars: 01 Branding & Creatives, 02 Social Media Management, 03 Paid Ads. Title: Look, voice and *reach.* Body: Branding, social and paid ads, built to work together.
5. WHAT CHANGES. Bars: A look and a voice that command attention and earn trust in seconds. / Your channels, run end to end: strategy, posting and community. / The right message to the right people, optimised for return. Title: Growth you can *measure.* Body: Clear, honest numbers every month. What we did, what it earned, what's next.
6. Title: Pick a service. Or take them *all.* Body: Starter, Growth and Premium plans, built around your brand. CTA: komarketingagency.com. Save this post for later.

Captions are in each folder's `caption.txt`.

## Rebuild

```bash
cd source
npm i --no-save playwright-core   # uses the system Chrome, override with CHROME=/path/to/chrome
node build.mjs                    # slides, panoramas, captions
python3 sheets.py                 # contact sheets, feed row, PNG zip (needs Pillow)
```

Fonts: Poppins and Playfair Display, both SIL Open Font License (licences in `source/fonts/`).
