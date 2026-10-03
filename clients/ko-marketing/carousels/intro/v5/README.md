# KO Marketing, intro carousels v5

Lisa approved the v4 direction: "OK, but with our images from the site, please."
v5 is v4 with the photos replaced by KO's own images, from her folder "Wesbite KO Marketing" (236 images,
sent as kosite1.zip and kosite2.zip). The layout, text, services, tones and light covers are exactly the same
as v4. The `v3/`, `options/` and `v4/` folders are unchanged.

Only the 28 images actually used are committed, resized to 1200 px on the long side and compressed.
The zips themselves are not in the repo.

## Slots that still use a v4 (Unsplash) photo

The folder holds no photo of the KO team itself. The people in it are models and clients from shoots,
and the one office-style picture of two women (`Contenu_Site_ChatGPT_Image_...`) is AI-generated, so it
is not used. Three slots show the team at work and keep their v4 photo until real KO team photos exist:

| Slide | Slot | Kept v4 photo |
|---|---|---|
| 02 Who we are, slide 1 (cover) | big card | team-meeting.jpg (Surface, https://unsplash.com/photos/ZlJmOUFRBfQ) |
| 02 Who we are, slide 1 (cover) | card running into slide 2 | team-laptops.jpg (Van Tay Media, https://unsplash.com/photos/OKDh95iyzEE) |
| 02 Who we are, slide 3 | "Growth" team photo | team-desk.jpg (Rodrigo Rodrigues, WOLF Λ R T, https://unsplash.com/photos/Ry22piRv0bs) |

These three are the only Unsplash photos left, and the credits above are the only ones still needed.

## Which KO image is where

| File in `source/assets/photos/` | Original file in "Wesbite KO Marketing" | Used on |
|---|---|---|
| ko-beauty-laugh.jpg | Banque_d'Images_TURD8540.jpg | 01 cover (phone), 03 slide 10 (card row) |
| ko-padel-a.jpg | Banque_d'Images_BAAN_PADEL_x_SALVI_PEREZ_01-1810.jpg | 01 cover (card row), 03 cover |
| ko-food.jpg | Contenu_Site_B132.jpg | 01 cover (card row), 03 cover |
| ko-golf-crowd.jpg | Banque_d'Images_NU_10016.jpg | 01 cover (card row), 02 slide 6 |
| ko-night.jpg | Contenu_Site_abab77c8-5aae-41d5-a202-0d5bf376e12c.jpg | 01 cover (card running into slide 2) |
| ko-feed-post.jpg | Screenshots_Capture_d’écran_2026-06-30_à_07.54.04.jpg (a clear Instagram post by a KO client) | 01 slide 2 |
| ko-terrace.jpg | Contenu_Site_Portfolio_Sans_titre-3e.jpg | 01 slide 3 (Bangkok), 03 slide 10 |
| ko-venue-friends.jpg | Banque_d'Images_NU_10260.jpg | 01 slide 5 ("Seen") |
| ko-beauty-blue.jpg | Banque_d'Images_TURD9634.jpg | 01 slide 5 ("Followed") |
| ko-padel-red.jpg | bb959579-404f-4db2-b2f2-fb94516526b2.jpg | 01 slide 5 ("Remembered"), 03 slide 10 |
| ko-padel-b.jpg | BPT_Bellclub22_Jan_2026-1705.jpg | 01 slide 6 (fan) |
| ko-golf-handshake.jpg | Banque_d'Images_NU_10097.jpg | 01 slide 6 (fan, centre) |
| ko-cans.jpg | Contenu_Site_IMG_3429.jpg | 01 slide 6 (fan), 03 cover (card running into slide 2) |
| ko-site-strategy.jpg | Contenu_Site_Services_STRATEGY..jpg | 02 slide 2 ("Strategy") |
| ko-beauty-bottle.jpg | Banque_d'Images_TURD9605.jpg | 02 slide 2 ("Content") |
| ko-golf-swing.jpg | Banque_d'Images_NU_10298.jpg | 02 slide 2 ("Ads"), 03 cover (centre) |
| ko-ugc-beach.jpg | Contenu_Site_70baeb40-11fb-4e08-a447-aaad63a3303b.jpg | 02 slide 6 (phone), UGC & Creator (01 slide 4, 03 slide 3) |
| ko-beauty-water.jpg | Banque_d'Images_TURD9819.jpg | 02 slide 6, 03 slide 9 (Shoots) |
| ko-beauty-product.jpg | Banque_d'Images_TURD8120.jpg | Social Media Manager (01 slide 4, 03 slide 4) |
| ko-site-website.jpg | Contenu_Site_Services_Website_&_Seo.jpg | Website & SEO (01 slide 4, 03 slide 5) |
| ko-golf-portfolio.jpg | Contenu_Site_Portfolio_Sans_titre-5.jpg | Strategy & Advertising (01 slide 4, 03 slide 6) |
| ko-product-sky.jpg | Banque_d'Images_TURD9964.jpg | Email Marketing (01 slide 4, 03 slide 7) |
| ko-cans-design.jpg | Contenu_Site_Cans_design.jpg | Branding & Audits (01 slide 4, 03 slide 8) |
| ko-site-social.jpg | Contenu_Site_Services_Socia_Media_Manager.jpg | 03 slide 9 (Content Manager) |
| ko-insights.jpg | Screenshots_IMG_5114.jpg (a clear Instagram insights screen) | 03 slide 9 (Monthly Reporting) |
| ko-golf-coach.jpg | Banque_d'Images_NU_10114.jpg | 03 slide 9 (Consulting & Coaching) |
| ko-site-branding.jpg | Contenu_Site_Services_Branding_&_Audits.jpg | 03 slide 10 (card row) |
| ko-beauty-smile.jpg | Banque_d'Images_TURD8239.jpg | 03 slide 10 (phone) |

**How the images were chosen.** Real photos from shoots and the site come first: the beauty and wellness
product shoots, the golf simulator café, padel, food and nightlife. Site service visuals are used where no
photo fits the topic: website devices, the strategy clipboard, social phones and the branding board. Only two
screenshots are used, both clear: an Instagram post and an Instagram insights screen. The only brand name shown
is Mandrake, which comes from KO's own site content (`Contenu_Site_...`).

**Images left out:**
- `DSC_1971`: sponsor logos are burned into the frame.
- The ChatGPT-generated image.
- The Lamai Buri and Drink Air logos.
- Analytics, profile and messaging screenshots that are hard to read at card size.
- Laptop and device mockups with a blank or desktop screen.
- `IMG_0835`: shot sideways, so it does not sit well on a card.

## Files

- `01-we-are-open/`, `02-who-we-are/`, `03-what-we-do/`: each holds `slide-01.png` onwards,
  `panorama.png` and `caption.txt`. The captions are the same as v4.
- `previews/`: `v5-feed-row.png`, `v5-contact-01-we-are-open.png`, `v5-contact-02-who-we-are.png`,
  `v5-contact-03-what-we-do.png`. Each file is under 3 MB.

## Rebuild

```bash
cd source
npm i --no-save playwright-core   # uses the system Chrome, override with CHROME=/path/to/chrome
node build.mjs                    # or: node build.mjs --only 03
python3 sheets.py                 # contact sheets and feed row (needs Pillow)
```
