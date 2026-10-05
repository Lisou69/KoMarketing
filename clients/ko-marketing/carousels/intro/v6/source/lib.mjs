// Shared KO brand primitives and the render loop for options A, B and C.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SRC = dirname(fileURLToPath(import.meta.url));
export const W = 1080, H = 1350, M = 72;

// Palette read from komarketingagency.com and the KO business cards.
export const BURG = '#4C050C';
export const INK = '#1A1310';
export const SITE_WHITE = '#F5F5F7';
export const BLUE = '#94B1C8';
export const BLUE_DEEP = '#7C9AB2';
export const BLUE_ON_BURG = '#AFC5D7';
export const CREAM_INK = '#F7F3F1';

export const asset = (p) => 'file://' + join(SRC, p);
export const photo = (k) => asset(`assets/photos/${k}.jpg`);
export const LOGO = { burg: asset('assets/ko-lockup-burgundy.svg'), white: asset('assets/ko-lockup-white.svg') };
export const MONO = { burg: asset('assets/ko-monogram-burgundy.svg'), white: asset('assets/ko-monogram-white.svg') };

export const baseCss = `
@font-face{font-family:Serif4;font-style:italic;font-weight:200 900;src:url(${asset('fonts/SourceSerif4-Italic.ttf')})}
@font-face{font-family:Serif4;font-style:normal;font-weight:200 900;src:url(${asset('fonts/SourceSerif4.ttf')})}
@font-face{font-family:Manrope;font-weight:200 800;src:url(${asset('fonts/Manrope.ttf')})}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff}
#c{position:relative;height:${H}px;overflow:hidden;font-family:Manrope;-webkit-font-smoothing:antialiased}
.a,.t{position:absolute}
.serif{font-family:Serif4;font-style:italic;font-weight:500;letter-spacing:-.025em;line-height:1.02}
.serif em{font-style:italic}
.body{font-weight:400;font-size:27px;line-height:1.45}
.nw{white-space:nowrap}
`;

export const accent = (t, color) => t.replace(/<em>/g, `<em style="color:${color}">`);
export const oneLine = (t) => t.replace(/<br>/g, ' ');

export const sparkle = (c, s = 14) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="flex:none"><path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1Z" fill="${c}"/></svg>`;

// Site-style section label: small rounded pill with a sparkle.
export const pill = (text, bg, ink, { size = 19, h = 46, pad = 20, r = 9 } = {}) =>
  `<span style="display:inline-flex;align-items:center;gap:10px;height:${h}px;padding:0 ${pad}px;border-radius:${r}px;font-size:${size}px;font-weight:600;letter-spacing:.01em;white-space:nowrap;background:${bg};color:${ink}">${sparkle(ink)}${text}</span>`;

// Site service tag: full round pill in dusty blue with white text.
export const tag = (text, { size = 20, h = 40 } = {}) =>
  `<span style="display:inline-flex;align-items:center;height:${h}px;padding:0 18px;border-radius:99px;background:${BLUE};color:#fff;font-size:${size}px;font-weight:700;white-space:nowrap">${text}</span>`;

export const arrow = (c, w = 34) =>
  `<svg width="${w}" height="20" viewBox="0 0 34 20" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M2 10h28M23 3l7 7-7 7"/></svg>`;

export const bookmark = (c, s = 22) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round" style="flex:none"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>`;

// The KO silk ribbon is always placed whole: exactly one slide wide, its own edges on the slide edges.
export const SILK_H = Math.round((1417 / 2953) * W);
export const silk = (i, y, { z = 0, opacity = 1 } = {}) =>
  `<img class="a" src="${asset('assets/silk-element.png')}" style="left:${i * W}px;top:${y}px;width:${W}px;height:${SILK_H}px;z-index:${z};opacity:${opacity}">`;

// Tone-on-tone debossed type, the business card motif, clipped to its own slide.
export function deboss(i, x, y, size, { text = 'Knock Out', on = 'b', rot = 0, z = 0 } = {}) {
  const st = on === 'b'
    ? 'color:#45040B;text-shadow:0 -2px 2px rgba(18,0,3,.6),0 2px 1px rgba(255,214,214,.12)'
    : 'color:rgba(0,0,0,.015);text-shadow:0 -2px 2px rgba(60,40,30,.16),0 2px 2px rgba(255,255,255,.95)';
  return `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;overflow:hidden;z-index:${z}"><div class="a" style="left:${x}px;top:${y}px;font-family:Serif4;font-style:italic;font-weight:600;font-size:${size}px;line-height:1;letter-spacing:-.03em;white-space:nowrap;transform:rotate(${rot}deg);transform-origin:left top;${st}">${text}</div></div>`;
}

// Grounds: 'b' is the burgundy business-card paper, anything else a light ground of the given colour.
export function ground(i, tone, light) {
  const X = i * W;
  if (tone === 'b') {
    return `<div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:${BURG}"></div>
      <div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:radial-gradient(110% 80% at 50% 35%,rgba(100,14,24,.22),rgba(76,5,12,0) 60%),radial-gradient(140% 100% at 50% 50%,rgba(0,0,0,0) 50%,rgba(20,0,4,.5))"></div>`;
  }
  return `<div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:${light}"></div>
    <div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:radial-gradient(90% 70% at 50% 30%,rgba(255,255,255,.7),rgba(255,255,255,0) 70%)"></div>`;
}

export function grain(n, tones) {
  let html = '';
  for (let i = 0; i < n; i++) {
    const b = tones[i] === 'b';
    html += `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;background:url(${asset('assets/tex-paper.png')}) 0 0/700px;mix-blend-mode:${b ? 'overlay' : 'multiply'};opacity:${b ? 0.22 : 0.14};z-index:40;pointer-events:none"></div>`;
  }
  return html + `<svg class="a" style="left:0;top:0;opacity:.05;mix-blend-mode:overlay;z-index:41;pointer-events:none" width="${n * W}" height="${H}">
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -.2"/></filter>
    <rect width="100%" height="100%" filter="url(#g)"/></svg>`;
}

export const SH = 'box-shadow:0 34px 60px -18px rgba(26,19,16,.30),0 10px 22px -8px rgba(26,19,16,.18)';
export const SH_DARK = 'box-shadow:0 40px 70px -20px rgba(10,0,2,.65),0 12px 24px -8px rgba(10,0,2,.45)';
export const GRADE = 'filter:saturate(.92) contrast(1.03)';

export const img = ({ x, y, w, h, k, pos = 'center', r = 0, z = 1, shadow = '', extra = '' }) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;z-index:${z};${shadow};${extra}"><div class="a" style="inset:0;background:url(${photo(k)}) ${pos}/cover;${GRADE}"></div></div>`;

// Every text element must sit inside one slide, clear of the 56px edge band.
async function checkText(page, id) {
  const bad = await page.evaluate(({ W }) => {
    const out = [];
    for (const el of document.querySelectorAll('.t')) {
      const rg = document.createRange();
      rg.selectNodeContents(el);
      const r = rg.getBoundingClientRect();
      if (!r.width) continue;
      const i = Math.floor((r.left + 1) / W);
      if (r.left < i * W + 56 || r.right > (i + 1) * W - 56) out.push(`${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)} [${Math.round(r.left)}-${Math.round(r.right)}]`);
      if (r.top < 56 || r.bottom > 1350 - 56) out.push(`${el.textContent.trim().slice(0, 40)} vertical [${Math.round(r.top)}-${Math.round(r.bottom)}]`);
    }
    return out;
  }, { W });
  if (bad.length) console.log(`  ${id}: text near an edge:\n   ` + bad.join('\n   '));
}

export async function render(dir, carousels, outDir, only) {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: W * 10, height: H }, deviceScaleFactor: 1 });
  for (const c of carousels) {
    if (only && !c.id.startsWith(only)) continue;
    const n = c.slides.length;
    const tones = dir.tones[c.id];
    if (tones.length !== n) throw new Error(`${dir.key} ${c.id}: ${tones.length} tones for ${n} slides`);
    const body = dir.html(c, tones);
    const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${baseCss}${dir.css || ''}</style></head><body>
      <div id="c" style="width:${n * W}px">${body}${grain(n, tones)}</div></body></html>`;
    const out = join(outDir, c.id);
    mkdirSync(out, { recursive: true });
    const tmp = join('/tmp', `ko-opt${dir.key}-${c.id}.html`);
    writeFileSync(tmp, doc);
    await page.setViewportSize({ width: n * W, height: H });
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await checkText(page, `${dir.key} ${c.id}`);
    await page.screenshot({ path: join(out, 'panorama.png'), clip: { x: 0, y: 0, width: n * W, height: H } });
    for (let i = 0; i < n; i++) {
      await page.screenshot({ path: join(out, `slide-${String(i + 1).padStart(2, '0')}.png`), clip: { x: i * W, y: 0, width: W, height: H } });
    }
    writeFileSync(join(out, 'caption.txt'), c.caption + '\n');
    console.log('rendered', dir.key, c.id);
  }
  await browser.close();
}
