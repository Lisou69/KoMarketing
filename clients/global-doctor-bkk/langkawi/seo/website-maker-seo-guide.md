# Website Maker — SEO modification brief
# Global Doctors Clinic Langkawi

**Draft:** https://incomparable-insurance-225232.framer.app/
**Owner of this brief:** SEO Maker
**Site language:** English only. Do not add a Malay or French homepage.
**Official brand:** Global Doctors Clinic Langkawi (plural *Doctors*, never “Global Doctor” in titles, H1, logo text, or footer).

Implement in this order. Do not invent medical claims, hours, doctors, or insurer lists.

---

## 0. Confirm with the clinic BEFORE changing these (blockers)

If Lisa / the clinic has not confirmed, keep current draft values but do **not** strengthen the wording. Flag in a comment on the canvas.

| Claim | Status | What to do |
|---|---|---|
| Hours Mon–Sat 9–5, Sun 9–3 | Conflicts with globaldoctors.asia (9am–9pm, or Sun closed) | Keep draft hours until confirmed. One version only, everywhere. |
| 24/7 line `019 471 5399` | Older listing; also appears as fax on Compumed | Keep if clinic confirms. Label it “24/7 emergency line”, never “24 hour clinic”. |
| On-site lab, pharmacy, physiotherapy, private ambulance | Not on current official Langkawi pages | Do not add new pages or stats for these until confirmed. Existing cards can stay if already designed, but do not write “the only private ambulance on the island” as a fact. |
| Direct billing / “most patients never pay upfront” | Unverified for this branch | Soften to: “We work with travel insurers. Call with your policy number — we will tell you if we can bill them directly.” |
| Seen in <20 minutes | Anecdote only | Soften to “walk-ins seen the same day” or remove the ticker. |
| 25+ years | Group ~2003; Langkawi clinic opened 2016 | Write “part of the Global Doctors network, 20+ years across Asia” or “clinic on Cenang since 2016”. Not 25+. |
| Dr Ilman Bin Imran as Langkawi RMO | No public record | Do not publish until clinic confirms. |
| Dr Nabilah Aziz | KL / TGGD governance, not Cenang RMO | Do not list as a Langkawi doctor. |
| Dr Navindra Nageswaran | Group Medical & Managing Director (KL) | OK as group leadership, not as “the team you’ll meet” at Cenang. |
| Public RMOs if you need names | Dr Briggita Rajendran, Dr Ezzati Kamalia | Use only if clinic says they still sit in Cenang. |

Verified and safe to keep:
- Name: Global Doctors Clinic Langkawi
- Address: Pelangi Beach Resort & Spa (front wing), Jalan Pantai Cenang, 07000 Langkawi, Kedah, Malaysia
- Clinic phone: **04 955 9399** / +604 955 9399
- Email (if needed): clinic.lgk@globaldoctors.asia
- English spoken, walk-ins, tourist clinic inside Pelangi, hotel/home calls via concierge
- “Part of the Global Doctors Asia network”

---

## 1. Do first — site-wide Framer SEO

In Framer: **Site Settings → SEO** and **each page → SEO panel**.

1. Remove the site-wide default title `My Framer Site` and description `Made with Framer`. Every page currently inherits this, including Open Graph.
2. Set `<html lang="en">`.
3. Custom domain before any indexing push. Do not treat `*.framer.app` as the canonical URL once a real domain exists.
4. Enable sitemap + robots (allow all real pages).
5. After deleting template blog posts, resubmit sitemap.
6. Add JSON-LD `MedicalClinic` once (site-wide or homepage), with:
   - `name`: Global Doctors Clinic Langkawi
   - `address`: Pelangi Beach Resort & Spa, Jalan Pantai Cenang, 07000 Langkawi, Kedah, Malaysia
   - `telephone`: +6049559399
   - `openingHours`: only the confirmed set
   - `sameAs`: https://www.facebook.com/GDLGK , https://globaldoctors.asia/ , https://www.instagram.com/globaldoctorslgk/
7. One H1 per page. The repeated CTA “Feeling unwell in Langkawi?” is currently a second H1 on every page. Demote it to H2.
8. Stat blocks that use H2 for “1”, “0”, “Same”, “2” — demote to `<p>` or styled divs, not headings.
9. Image alts: every photo is empty. Use descriptive alts, e.g. `Global Doctors Clinic inside Pelangi Beach Resort, Pantai Cenang`. Logo alt: `Global Doctors Clinic Langkawi`.
10. NAP identical in footer, contact, Google embed, and schema. No “Meritus” unless the clinic still uses it; current draft “Pelangi Beach Resort & Spa” is correct.

**Never write these phrases anywhere:**
- 24 hour clinic / 24-hour walk-in / klinik 24 jam
- clinic near Langkawi airport / clinic LGK (you are in Cenang, not Padang Matsirat)
- KPJ Langkawi / Pantai Hospital Langkawi (they do not exist)
- Bali belly
- Yellow fever / ICVP (unless MOH-accredited)
- PCR / COVID test landing copy

OK: “24/7 emergency line”, “doctor to your hotel any hour”, “hotel and yacht calls”.

---

## 2. Delete before Google sees them

Unpublish / delete these Framer template posts. They are already in the sitemap.

- `/blog/whats-new`
- `/blog/styling-elements`
- `/blog/importing-content`
- `/blog/best-practices`

Also remove placeholders: `Dr. [Name]`, `MMC [n°]`, `Loading...` on buttons, French leftover `Photo — voilier, marina` on `/about-us`, French insurer-logo note on `/travel-insurance` (replace with real logos or delete the strip).

---

## 3. Bugs to fix (SEO + conversion)

| Bug | Fix |
|---|---|
| Nav **Hotel & Yacht** points to `/` | Point to `/hotel-yacht` |
| Footer “Why Global Doctor?” | Rename to “Why Global Doctors?” → `/about-us` |
| Footer “How It Works” → `/blog` | Point to `/hotel-yacht` or a real FAQ, not the blog index |
| `/about-us` duplicates Travel Clinic blocks (vaccines, kits) | Remove. About = story, network, team (confirmed names only), AED at airport if still true |
| WhatsApp / Get directions / Call buttons are `Loading...` with no href | Real links: `tel:+6049559399`, `tel:+60194715399` (if confirmed), `https://wa.me/60XXXXXXXXX` (ask clinic for the WhatsApp number), Google Maps URL for Pelangi front wing |
| Contact form is not a real `<form>` (0 inputs, does not submit) | Use a working Framer form or embed. Until it works, make phone/WhatsApp the primary CTA |
| No embedded map on `/contact-us` | Embed Google Map, pin name **Global Doctors Clinic Langkawi** |
| CTA + footer cloned 3× in the DOM (responsive variants) | One instance per breakpoint if Framer allows; duplicate NAP is OK, triplicate full CTA is bloat |
| Blog scooter article is real; dengue + food-poisoning cards point at template slugs | Retarget cards to real slugs or unpublish the cards |

---

## 4. Page-by-page — paste these

Use these **exactly** in the Framer SEO fields. Keep the visible H1s that already work, except where noted.

### `/` Home

- **Title:** `Global Doctors Langkawi | Clinic in Pantai Cenang (Pelangi Beach Resort)`
- **Meta:** `English-speaking walk-in clinic on Pantai Cenang. Doctor, lab and pharmacy on site. Hotel and yacht calls. We work with travel insurers. Inside Pelangi Beach Resort.`
- **H1 (keep):** The island’s doctors, right on the beach.
- **Eyebrow (keep):** PANTAI CENANG — LANGKAWI, MALAYSIA
- **Add H2s** (if missing as real headings): Walk-in clinic · English-speaking doctors · Travel insurance · Hotel, villa and yacht calls
- **Hero sub** can stay. Soften “deal directly with your travel insurer” to “we work with travel insurers” until the panel is confirmed.
- **Keywords this page must contain once in visible copy:** Global Doctors Langkawi, clinic Pantai Cenang, walk-in clinic, English-speaking doctor, Pelangi Beach Resort.

### `/services`

- **Title:** `Medical Clinic Langkawi | GP, Lab, Pharmacy and Ambulance`
- **Meta:** `GP, wound care, dengue testing, diving medicals, fit-to-fly certificates, pharmacy and private ambulance at Global Doctors on Pantai Cenang.`
- **H1 (keep):** One clinic, everything on-site.
- **Add H2s** using real phrases: Dengue test Langkawi · Wound care · Diving medicals · Fit-to-fly certificates · Private ambulance
- Do **not** split into 15 URLs in this pass. One hub is enough.
- Diving medicals: only keep if the clinic will actually stamp PADI forms. Dive shops currently tell guests no island doctor will clear them. If unconfirmed, rename the card “Diving complaints & ear injuries” and drop “fit-to-dive certificate”.

### `/hotel-yacht`

- **Title:** `Hotel and Yacht Doctor Langkawi | 24/7 English-Speaking House Calls`
- **Meta:** `An English-speaking doctor to your hotel, villa or yacht in Langkawi. Call the 24/7 line. We cover Cenang, Tengah, Datai, Telaga, Rebak and the yacht club.`
- **H1 (keep):** A doctor to your hotel, villa or yacht — any hour.
- Keep the area list (Cenang, Tengah, Kuah, Datai, Tanjung Rhu, Telaga, RLYC, Rebak).
- Do not write that the clinic doors are open 24 hours.

### `/travelclinic`

- **Title:** `Travel Clinic Langkawi | Vaccinations and Fit-to-Fly Certificates`
- **Meta:** `Travel clinic on Pantai Cenang: vaccinations, malaria advice, fit-to-fly and fit-to-sail certificates, yacht medical kits.`
- **H1 (keep):** Travel clinic & vaccinations.
- Do not claim yellow fever / ICVP.

### `/travel-insurance`

- **Title:** `Clinic That Accepts Travel Insurance in Langkawi | Direct Billing`
- **Meta:** `How Global Doctors Langkawi works with travel insurers: direct billing when we can, or a full English medical report and itemised invoice for your claim.`
- **H1 (keep):** Your insurance, handled.
- Replace the French logo placeholder. If the insurer list is not confirmed, delete the logo strip and keep the two-path copy (direct billing / pay & claim).
- Tourist wording only: “travel insurance”, “bill my insurer”. Not “panel”, “GL”, “cashless”.

### `/jellyfish`

- **Title:** `Jellyfish Sting Langkawi | Treatment at Pantai Cenang`
- **Meta:** `Stung at Cenang? Walk in to Global Doctors inside Pelangi Beach Resort, two minutes from the beach, or call 999 if breathing is hard, it is a child, or the sting is large.`
- **H1:** change from the DIY protocol tone to: `Stung at Cenang? We are two minutes from the beach.`
- Recast the page: **where to go + when to call 999 / Hospital Sultanah Maliha**, then a short “what our doctors do”. Do not try to rank as the first-aid textbook. Vinegar steps can stay as a short note attributed to standard first aid, not as the page’s job.
- Keep links to walk-in hours and the emergency line.

### `/about-us`

- **Title:** `About Global Doctors Clinic Langkawi | International Clinic on Pantai Cenang`
- **Meta:** `International clinic inside Pelangi Beach Resort, Pantai Cenang. Part of the Global Doctors Asia network. English-speaking doctors, walk-ins, hotel calls.`
- **H1 (keep):** An international clinic on an island paradise.
- Delete the copied Travel Clinic sections.
- Team block: group director OK; resident doctors only if confirmed.
- One Malay sentence is enough, in the footer or a short line: `Klinik antarabangsa di Pantai Cenang, Pelangi Beach Resort.`

### `/contact-us`

- **Title:** `Contact Global Doctors Langkawi | Pelangi Beach Resort, Pantai Cenang`
- **Meta:** `Find us in the front wing of Pelangi Beach Resort, Jalan Pantai Cenang. Clinic 04 955 9399. Tell your Grab driver: Global Doctors at Pelangi.`
- **H1 (keep):** Find us on Pantai Cenang.
- Working form or hide it. Embed map. Click-to-call.

### `/blog`

- **Title:** `Langkawi Health Guides | Global Doctors Clinic`
- **Meta:** `Practical guides from the clinic on Pantai Cenang: how to see a doctor, hospital vs clinic, insurance claims, scooter injuries.`
- Keep only real articles. First wave of slugs:
  - `/blog/scooter-accidents-langkawi` (exists — keep, set a real title without “My Framer Site”)
  - `/blog/hospital-vs-clinic-langkawi` (new, short: when to go to Hospital Sultanah Maliha vs this clinic. Do not attack the hospital.)
  - `/blog/how-to-see-a-doctor-in-langkawi` (new, process: walk-in, Grab to Pelangi, passport, insurance)
- Do **not** write treatment protocols (dengue how-to, GI antibiotics, ear remedies, PCR).
- Food-poisoning / dengue cards: point at `/services`, or write process posts (“when to come in for a dengue test”), not DIY medicine.

---

## 5. Heading and copy checklist per page

Visible copy must include the page’s primary keyword in the first 100 words, naturally.

| Page | Primary keyword | Secondary |
|---|---|---|
| `/` | clinic Pantai Cenang | Global Doctors Langkawi, walk-in, English-speaking doctor, Pelangi |
| `/services` | medical clinic Langkawi | dengue test, wound care, diving medicals, fit-to-fly |
| `/hotel-yacht` | hotel doctor Langkawi | yacht doctor, house call, 24/7 doctor (line, not clinic) |
| `/travelclinic` | travel clinic Langkawi | vaccinations, fit-to-fly, fit-to-sail |
| `/travel-insurance` | travel insurance clinic Langkawi | direct billing, medical report |
| `/jellyfish` | jellyfish sting Langkawi | Pantai Cenang, when to call 999 |
| `/about-us` | Global Doctors Clinic Langkawi | international clinic, English-speaking |
| `/contact-us` | Pelangi Beach Resort clinic | Pantai Cenang, Grab |

---

## 6. Google Business (tell Lisa / ops — not a Framer task)

If you control the GBP listing, match the site NAP exactly. Category: Medical Clinic. Description: English-speaking walk-in clinic inside Pelangi Beach Resort, Pantai Cenang. Hotel and yacht calls. Travel insurance. Hours = the confirmed set, **not** Open 24 hours. Photos of the Pelangi front wing.

---

## 7. Done when

- [ ] No page title contains “My Framer Site” or “Made with Framer”
- [ ] Brand is Global Doctors everywhere
- [ ] Hotel & Yacht nav goes to `/hotel-yacht`
- [ ] Template blog posts gone
- [ ] About no longer clones Travel Clinic
- [ ] tel: / WhatsApp / map work
- [ ] Contact form works or is removed
- [ ] One H1 per page
- [ ] Titles and metas above are live
- [ ] Jellyfish page is “where to go”, not a first-aid textbook
- [ ] Unconfirmed doctors / 25+ / cashless promise / 24h clinic language are gone
- [ ] `lang="en"` + MedicalClinic JSON-LD

Reply to SEO Maker when the titles are live so we can re-audit the draft URL.
