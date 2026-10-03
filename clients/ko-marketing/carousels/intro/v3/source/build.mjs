// Renders each carousel as one 6480x1350 canvas, then cuts it into six 1080x1350 slides.
// Usage: node build.mjs [carousel-prefix]   (needs playwright-core and a Chrome/Chromium binary, see README)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carousels } from './content.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(SRC, '..');
const W = 1080, H = 1350, N = 6, M = 72, CW = W * N;

// Palette read from komarketingagency.com and the KO business cards.
const BURG = '#4C050C';
const INK = '#1A1310';
const WHITE = '#F5F5F7';
const CARD = '#FFFFFF';
const BLUE = '#94B1C8';

const asset = (p) => 'file://' + join(SRC, p);
const photo = (k) => asset(`assets/photos/${k}.jpg`);

const TONE = {
  c: { ink: INK, soft: 'rgba(26,19,16,.70)', accent: '#86A4BC', logo: 'assets/ko-lockup-burgundy.svg', pillBg: BURG, pillInk: '#FFFFFF', line: 'rgba(26,19,16,.14)' },
  b: { ink: '#F7F3F1', soft: 'rgba(247,243,241,.78)', accent: '#AFC5D7', logo: 'assets/ko-lockup-white.svg', pillBg: '#F7F3F1', pillInk: BURG, line: 'rgba(247,243,241,.22)' },
};

const css = `
@font-face{font-family:Serif4;font-style:italic;font-weight:200 900;src:url(${asset('fonts/SourceSerif4-Italic.ttf')})}
@font-face{font-family:Serif4;font-style:normal;font-weight:200 900;src:url(${asset('fonts/SourceSerif4.ttf')})}
@font-face{font-family:Manrope;font-weight:200 800;src:url(${asset('fonts/Manrope.ttf')})}
*{box-sizing:border-box;margin:0;padding:0}
body{background:${WHITE}}
#c{position:relative;width:${CW}px;height:${H}px;overflow:hidden;font-family:Manrope;-webkit-font-smoothing:antialiased}
.a,.t{position:absolute}
.serif{font-family:Serif4;font-style:italic;font-weight:500;letter-spacing:-.025em;line-height:1.02;white-space:nowrap}
.serif em{font-style:italic}
.pill{display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 20px;border-radius:9px;font-size:19px;font-weight:600;letter-spacing:.01em;white-space:nowrap}
.body{font-weight:400;font-size:27px;line-height:1.45;text-wrap:balance}
.cardimg{position:absolute;overflow:hidden;background-size:cover;background-repeat:no-repeat}
`;

const SH = 'box-shadow:0 34px 60px -18px rgba(26,19,16,.34),0 10px 22px -8px rgba(26,19,16,.20)';
const SH_DARK = 'box-shadow:0 40px 70px -20px rgba(10,0,2,.65),0 12px 24px -8px rgba(10,0,2,.45)';
const GRADE = 'filter:saturate(.92) contrast(1.03)';

const sparkle = (c, s = 14) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1Z" fill="${c}"/></svg>`;

function pill(x, y, text, tone, { size = 19, h = 46, center = false, w = 0 } = {}) {
  const tn = TONE[tone];
  const pos = center ? `left:${x - w / 2}px;width:${w}px;justify-content:center` : `left:${x}px`;
  return `<div class="t pill" style="${pos};top:${y}px;height:${h}px;font-size:${size}px;background:${tn.pillBg};color:${tn.pillInk}">${sparkle(tn.pillInk)}${text}</div>`;
}

// Rounded photo card, the image language of the KO site (portfolio row, process photo, service cards).
function card({ x, y, w, h, img, pos = 'center', r = 26, rot = 0, dark = false, z = 1, inner = '' }) {
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;transform:rotate(${rot}deg);z-index:${z};${dark ? SH_DARK : SH}">
    <div class="a" style="inset:0;background:url(${photo(img)}) ${pos}/cover;${GRADE}"></div>${inner}</div>`;
}

// The phone frame from the KO site hero.
function phone({ x, y, w, img, pos = 'center', z = 3, dark = false }) {
  const h = Math.round(w * 2.05), b = Math.round(w * 0.045), r = Math.round(w * 0.17);
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:#16100E;padding:${b}px;z-index:${z};
      box-shadow:0 0 0 2px #3a302c inset,${dark ? '0 50px 80px -20px rgba(10,0,2,.7),0 14px 28px -8px rgba(10,0,2,.5)' : '0 50px 80px -24px rgba(26,19,16,.45),0 14px 28px -10px rgba(26,19,16,.28)'}">
    <div style="position:relative;width:100%;height:100%;border-radius:${r - b}px;overflow:hidden;background:url(${photo(img)}) ${pos}/cover">
      <div class="a" style="left:50%;top:${Math.round(w * 0.05)}px;width:${Math.round(w * 0.3)}px;height:${Math.round(w * 0.085)}px;transform:translateX(-50%);border-radius:99px;background:#0d0908"></div></div></div>`;
}

// Frosted panel, as on the KO site stat cards that sit over the silk.
function frost({ x, y, w, h, r = 28, inner = '', dark = false, z = 2 }) {
  const bg = dark ? 'rgba(247,243,241,.94)' : 'rgba(255,255,255,.42)';
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:${bg};
      backdrop-filter:blur(16px) saturate(1.1);-webkit-backdrop-filter:blur(16px);border:1.5px solid rgba(255,255,255,.8);z-index:${z};${dark ? SH_DARK : SH}">${inner}</div>`;
}

// The KO silk ribbon is always placed whole: exactly one slide wide, its own edges on the slide edges.
const SILK_H = Math.round((1417 / 2953) * W);
const silk = (i, y, z = 0) =>
  `<img class="a" src="${asset('assets/silk-element.png')}" style="left:${i * W}px;top:${y}px;width:${W}px;height:${SILK_H}px;z-index:${z}">`;

// Tone-on-tone debossed "Knock Out", the business card motif.
function deboss(i, x, y, size, text = 'Knock Out', rot = 0) {
  return `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;overflow:hidden"><div class="a" style="left:${x}px;top:${y}px;font-family:Serif4;font-style:italic;font-weight:600;font-size:${size}px;line-height:1;letter-spacing:-.03em;white-space:nowrap;
      color:#45040B;transform:rotate(${rot}deg);transform-origin:left top;
      text-shadow:0 -2px 2px rgba(18,0,3,.6),0 2px 1px rgba(255,214,214,.12)">${text}</div></div>`;
}

function grounds(c) {
  let html = '';
  for (let i = 0; i < N; i++) {
    const X = i * W;
    if (c.tones[i] === 'b') {
      html += `<div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:${BURG}"></div>
        <div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:radial-gradient(110% 80% at 50% 35%,rgba(100,14,24,.22),rgba(76,5,12,0) 60%),radial-gradient(140% 100% at 50% 50%,rgba(0,0,0,0) 50%,rgba(20,0,4,.5))"></div>`;
    } else {
      html += `<div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:${WHITE}"></div>
        <div class="a" style="left:${X}px;top:0;width:${W}px;height:${H}px;background:radial-gradient(90% 70% at 50% 30%,rgba(255,255,255,.9),rgba(255,255,255,0) 70%)"></div>`;
    }
  }
  return html;
}

function grain(c) {
  let html = '';
  for (let i = 0; i < N; i++) {
    const b = c.tones[i] === 'b';
    html += `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;background:url(${asset('assets/tex-paper.png')}) 0 0/700px;mix-blend-mode:${b ? 'overlay' : 'multiply'};opacity:${b ? 0.22 : 0.10};z-index:20;pointer-events:none"></div>`;
  }
  return html + `<svg class="a" style="left:0;top:0;opacity:.05;mix-blend-mode:overlay;z-index:21" width="${CW}" height="${H}">
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -.2"/></filter>
    <rect width="100%" height="100%" filter="url(#g)"/></svg>`;
}

function system(c, i) {
  const tn = TONE[c.tones[i]];
  const X = i * W;
  const R = CW - X - W + M;
  let html = `<img class="a" src="${asset(tn.logo)}" style="left:${X + M}px;top:68px;height:38px;z-index:30">
    <div class="t" style="right:${R}px;top:76px;font-size:17px;font-weight:600;letter-spacing:.18em;color:${tn.ink};z-index:30">0${i + 1}<span style="opacity:.45"> / 06</span></div>
    <div class="t" style="left:${X + M}px;top:1252px;font-size:19px;font-weight:500;color:${tn.soft};z-index:30">komarketingagency.com</div>`;
  if (i < N - 1) {
    html += `<div class="t" style="right:${R}px;top:1250px;display:flex;align-items:center;gap:14px;font-size:16px;font-weight:700;letter-spacing:.28em;color:${tn.ink};z-index:30">SWIPE
      <svg width="44" height="16" viewBox="0 0 44 16" fill="none" stroke="${tn.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h38M33 2l7 6-7 6"/></svg></div>`;
  }
  return html;
}

function textBlock(c, i, s, { top = 862, width = 900, size = 90 } = {}) {
  const tn = TONE[c.tones[i]];
  const X = i * W;
  const lines = (s.title.match(/<br>/g) || []).length + 1;
  return `${pill(X + M, top, s.label, c.tones[i])}
    <div class="t serif" style="left:${X + M - 4}px;top:${top + 66}px;font-size:${size}px;color:${tn.ink};z-index:10">${accent(s.title, tn)}</div>
    <div class="t body" style="left:${X + M}px;top:${top + 66 + size * 1.02 * lines + 22}px;width:${width}px;color:${tn.soft};z-index:10">${s.body}</div>`;
}

const accent = (t, tn) => t.replace(/<em>/g, `<em style="color:${tn.accent}">`);

// Numbered steps in the KO site "How we work" style. Each row is one card running from slide 4 into slide 5.
function steps(c, { labelSize = 50 } = {}) {
  const t4 = c.tones[3];
  const dark = t4 === 'b';
  const left = 3 * W + M, right = 5 * W - M, w = right - left;
  const numBg = dark ? BURG : INK;
  return c.bars.map((b, k) => {
    const top = 186 + k * 200, h = 168;
    const inner = `<div class="t" style="left:${left + 36}px;top:${top}px;height:${h}px;display:flex;align-items:center;gap:30px;color:${INK};z-index:5">
        <span style="width:104px;height:104px;border-radius:50%;background:${numBg};color:#fff;display:flex;align-items:center;justify-content:center;font-family:Serif4;font-style:italic;font-weight:500;font-size:48px;letter-spacing:-.02em">${b.n}</span>
        <span class="serif" style="font-size:${labelSize}px">${b.label}</span></div>
      <div class="t body" style="left:${4 * W + M}px;top:${top}px;height:${h}px;width:860px;display:flex;align-items:center;font-size:28px;color:rgba(26,19,16,.78);z-index:5">${b.desc}</div>`;
    return frost({ x: left, y: top, w, h, dark, r: 30 }) + inner;
  }).join('');
}

function cta(c, i, { top }) {
  const tone = c.tones[i];
  const tn = TONE[tone];
  const X = i * W;
  const s = c.s6;
  const btnBg = tone === 'c' ? `linear-gradient(180deg,#5a0a12,${BURG} 60%,#3a0309)` : '#F7F3F1';
  const btnInk = tone === 'c' ? '#fff' : BURG;
  return `<div class="t serif" style="left:${X}px;width:${W}px;top:${top}px;text-align:center;font-size:80px;line-height:1.04;color:${tn.ink};z-index:10">${accent(s.title, tn)}</div>
    <div class="t body" style="left:${X + 110}px;width:${W - 220}px;top:${top + 190}px;text-align:center;color:${tn.soft};z-index:10">${s.body}</div>
    <div class="t" style="left:${X + 270}px;width:540px;top:${top + 266}px;height:84px;border-radius:99px;background:${btnBg};color:${btnInk};display:flex;align-items:center;justify-content:center;gap:16px;font-size:28px;font-weight:600;z-index:10;${tone === 'c' ? SH : SH_DARK}">komarketingagency.com
      <svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="${btnInk}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10h28M23 3l7 7-7 7"/></svg></div>
    <div class="t" style="left:${X}px;width:${W}px;top:${top + 382}px;display:flex;justify-content:center;align-items:center;gap:12px;font-size:22px;font-weight:600;letter-spacing:.02em;color:${tn.soft};z-index:10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${tn.soft}" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>Save this post for later</div>`;
}

// Three cards fanned out, like the "Get started" stack at the bottom of the KO site.
function fan(i, imgs, { y = 150, dark = false } = {}) {
  const X = i * W, cx = X + W / 2;
  return card({ x: cx - 400, y: y + 70, w: 300, h: 400, img: imgs[0].k, pos: imgs[0].p, rot: -9, dark, z: 1 }) +
    card({ x: cx + 100, y: y + 70, w: 300, h: 400, img: imgs[2].k, pos: imgs[2].p, rot: 9, dark, z: 1 }) +
    card({ x: cx - 175, y, w: 350, h: 470, img: imgs[1].k, pos: imgs[1].p, dark, z: 2 });
}

// ---------- carousel layouts ----------

const layouts = {
  '01-we-are-open'(c) {
    const s1 = c.cover, X2 = W, X3 = 2 * W, X5 = 4 * W, X6 = 5 * W;
    const h = [];
    // 1 cover: the KO site hero, a phone in front of a row of work, the last card running into slide 2
    h.push(deboss(0, -40, 120, 330));
    const row = [
      { x: -150, k: 'bangkok-river', p: '50% 60%' },
      { x: 128, k: 'studio-edit', p: '72% 50%' },
      { x: 682, k: 'food-content', p: '60% 50%' },
      { x: 958, k: 'matcha-shoot', p: '50% 40%' },
    ];
    row.forEach((r) => h.push(card({ x: r.x, y: 300, w: 262, h: 380, img: r.k, pos: r.p, dark: true, r: 24 })));
    h.push(phone({ x: 395, y: 166, w: 290, img: 'bangkok-rooftop', pos: '40% 40%', dark: true }));
    h.push(pill(540, 818, s1.chip, 'b', { center: true, w: 330 }));
    h.push(`<div class="t serif" style="left:0;width:${W}px;top:880px;text-align:center;font-size:156px;line-height:1;color:${TONE.b.ink};z-index:10">${accent(s1.title.replace('<br>', ' '), TONE.b)}</div>`);
    h.push(`<div class="t body" style="left:150px;width:780px;top:1060px;text-align:center;color:${TONE.b.soft};z-index:10">${s1.sub}</div>`);

    // 2 the problem: a feed photo, and what happens to a post nobody remembers
    h.push(card({ x: X2 + 150, y: 170, w: 430, h: 610, img: 'feed-scroll', pos: '50% 50%', z: 1 }));
    c.s2.hero.items.forEach((t, k) => {
      const o = [1, 0.55, 0.26][k], bl = [0, 1.2, 2.6][k];
      h.push(`<div class="a" style="left:${X2 + 540 + k * 40}px;top:${290 + k * 150}px;opacity:${o};filter:blur(${bl}px);z-index:3">
        ${frost({ x: 0, y: 0, w: 420, h: 112, r: 24, inner: `<div style="height:100%;display:flex;align-items:center;gap:20px;padding:0 30px">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="1.8"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>
          <span class="serif" style="font-size:46px;color:${INK}">${t}</span></div>` })}</div>`);
    });
    h.push(textBlock(c, 1, c.s2));

    // 3 who we are: Bangkok, on KO business-card paper
    h.push(deboss(2, -30, 560, 300));
    h.push(card({ x: X3 + M, y: 160, w: 500, h: 640, img: 'bangkok-skyline', pos: '50% 35%', dark: true }));
    h.push(`<img class="a" src="${asset('assets/ko-monogram-white.svg')}" style="left:${X3 + 640}px;top:250px;width:330px;z-index:3">`);
    h.push(pill(X3 + 640, 560, c.s3.hero.chips[0], 'b', { size: 22, h: 54 }));
    h.push(pill(X3 + 640, 630, c.s3.hero.chips[1], 'b', { size: 22, h: 54 }));
    h.push(textBlock(c, 2, c.s3, { size: 84 }));

    // 4 + 5: three numbered cards across the seam, the silk sitting under the frosted glass on slide 5
    h.push(silk(4, 250));
    h.push(steps(c));
    h.push(textBlock(c, 3, c.s4));
    h.push(textBlock(c, 4, c.s5));

    // 6 CTA
    h.push(fan(5, [{ k: 'creator-filming', p: '62% 50%' }, { k: 'cinema-camera', p: '50% 50%' }, { k: 'bangkok-photographer', p: '50% 40%' }], { y: 150, dark: true }));
    h.push(cta(c, 5, { top: 730 }));
    return h.join('');
  },

  '02-who-we-are'(c) {
    const s1 = c.cover, X2 = W, X3 = 2 * W, X6 = 5 * W;
    const h = [];
    // 1 cover: the team, the KO silk underneath
    h.push(silk(0, 640));
    h.push(card({ x: 560, y: 150, w: 448, h: 690, img: 'team-meeting', pos: '50% 45%', z: 2 }));
    h.push(pill(M, 300, s1.chip, 'c'));
    h.push(`<div class="t serif" style="left:${M - 6}px;top:390px;font-size:148px;line-height:1;color:${INK};z-index:3">${accent(s1.title, TONE.c)}</div>`);
    h.push(`<div class="t body" style="left:${M}px;top:900px;width:620px;font-size:32px;color:${TONE.c.soft};z-index:10">${s1.sub}</div>`);

    // 2 the problem: three teams, three directions
    h.push(deboss(1, -30, 540, 270));
    const sc = [
      { x: X2 + 80, y: 230, rot: -11, k: 'strategy-notes', p: '40% 50%' },
      { x: X2 + 400, y: 150, rot: 6, k: 'phone-shoot', p: '50% 40%' },
      { x: X2 + 700, y: 300, rot: -3, k: 'feed-phone', p: '50% 45%' },
    ];
    sc.forEach((s, k) => {
      h.push(card({ x: s.x, y: s.y, w: 300, h: 400, img: s.k, pos: s.p, rot: s.rot, dark: true, z: k + 1,
        inner: '' }));
      h.push(`<div class="a" style="left:${s.x + 30}px;top:${s.y + 420}px;transform:rotate(${s.rot}deg);z-index:6">${pill(0, 0, c.s2.hero.items[k], 'b', { size: 22, h: 52 })}</div>`);
    });
    h.push(textBlock(c, 1, c.s2));

    // 3 converge: three disciplines run into one photo of the team at work
    const tags = c.s3.hero.items;
    const tx = [X3 + 150, X3 + 540, X3 + 930];
    tags.forEach((t, k) => h.push(pill(tx[k], 170, t, 'c', { center: true, w: 230, size: 22, h: 54 })));
    h.push(`<svg class="a" style="left:${X3}px;top:224px;z-index:1" width="${W}" height="220" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round">
      <path d="M150 4 C150 120, 540 90, 540 200"/><path d="M540 4 V200"/><path d="M930 4 C930 120, 540 90, 540 200"/></svg>`);
    h.push(card({ x: X3 + M, y: 430, w: W - 2 * M, h: 380, img: 'team-moodboard', pos: '50% 40%', z: 2,
      inner: `<div class="a" style="left:50%;bottom:28px;transform:translateX(-50%);padding:12px 40px;border-radius:22px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.85)">
        <span class="serif" style="font-size:66px;color:${INK}">${c.s3.hero.target}</span></div>` }));
    h.push(textBlock(c, 2, c.s3));

    // 4 + 5 steps on burgundy
    h.push(steps(c));
    h.push(textBlock(c, 3, c.s4));
    h.push(textBlock(c, 4, c.s5, { width: 800 }));

    // 6 CTA: the KO phone on the silk
    h.push(silk(5, 230));
    h.push(phone({ x: X6 + 405, y: 140, w: 270, img: 'team-desk', pos: '50% 40%' }));
    h.push(cta(c, 5, { top: 740 }));
    return h.join('');
  },

  '03-what-we-do'(c) {
    const s1 = c.cover, X2 = W, X3 = 2 * W, X6 = 5 * W;
    const h = [];
    // 1 cover: strategy, content, ads as three cards
    h.push(deboss(0, -30, 130, 330));
    h.push(card({ x: 88, y: 290, w: 290, h: 400, img: 'strategy-notes', pos: '35% 50%', rot: -5, dark: true, z: 1 }));
    h.push(card({ x: 702, y: 290, w: 290, h: 400, img: 'feed-phone', pos: '50% 45%', rot: 5, dark: true, z: 1 }));
    h.push(card({ x: 375, y: 190, w: 330, h: 500, img: 'cinema-camera', pos: '45% 50%', dark: true, z: 2 }));
    h.push(pill(540, 818, s1.chip, 'b', { center: true, w: 340 }));
    h.push(`<div class="t serif" style="left:0;width:${W}px;top:880px;text-align:center;font-size:156px;line-height:1;color:${TONE.b.ink};z-index:10">${accent(s1.title.replace('<br>', ' '), TONE.b)}</div>`);
    h.push(`<div class="t body" style="left:150px;width:780px;top:1060px;text-align:center;color:${TONE.b.soft};z-index:10">${s1.sub}</div>`);

    // 2 the problem: a good brand, three things it is missing
    h.push(card({ x: X2 + M, y: 160, w: 520, h: 640, img: 'food-content', pos: '62% 50%', z: 1 }));
    const rows = c.s2.hero.items.map((t, k) => `<div style="display:flex;align-items:center;gap:22px;height:96px;${k ? `border-top:1.5px solid ${TONE.c.line}` : ''}">
        <span style="width:38px;height:38px;border-radius:50%;border:2.5px solid ${BLUE};display:block;flex:none"></span>
        <span style="font-size:30px;font-weight:600;color:${INK};white-space:nowrap">${t}</span></div>`).join('');
    h.push(frost({ x: X2 + 520, y: 330, w: 488, h: 360, r: 28, z: 3, inner: `<div style="padding:30px 38px">${rows}</div>` }));
    h.push(textBlock(c, 1, c.s2));

    // 3 services: the full KO service list as pills
    h.push(deboss(2, 330, 560, 230));
    const wall = c.s3.hero.items.map((t, k) => {
      const solid = [0, 3, 6, 9].includes(k) ? false : k % 3 === 1;
      return `<span style="display:inline-flex;align-items:center;gap:10px;height:80px;padding:0 32px;border-radius:99px;font-size:29px;font-weight:600;white-space:nowrap;
        ${solid ? `background:#F7F3F1;color:${BURG}` : 'background:rgba(247,243,241,.06);color:#F7F3F1;border:1.5px solid rgba(247,243,241,.45)'}">${sparkle(solid ? BURG : '#AFC5D7', 16)}${t}</span>`;
    }).join('');
    h.push(`<div class="t" style="left:${X3 + M}px;top:180px;width:${W - 2 * M}px;display:flex;flex-wrap:wrap;gap:36px 16px;z-index:5">${wall}</div>`);
    h.push(textBlock(c, 2, c.s3));

    // 4 + 5 steps, silk on slide 5
    h.push(silk(4, 250));
    h.push(steps(c, { labelSize: 44 }));
    h.push(textBlock(c, 3, c.s4));
    h.push(textBlock(c, 4, c.s5));

    // 6 CTA
    h.push(fan(5, [{ k: 'studio-shoot', p: '72% 50%' }, { k: 'matcha-shoot', p: '50% 40%' }, { k: 'photo-edit', p: '50% 50%' }], { y: 150, dark: true }));
    h.push(cta(c, 5, { top: 730 }));
    return h.join('');
  },
};

function html(c) {
  const sys = Array.from({ length: N }, (_, i) => system(c, i)).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div id="c">${grounds(c)}${layouts[c.id](c)}${grain(c)}${sys}</div></body></html>`;
}

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
      if (r.left < i * W + 56 || r.right > (i + 1) * W - 56) out.push(`${el.textContent.trim().slice(0, 40)} [${Math.round(r.left)}-${Math.round(r.right)}]`);
    }
    return out;
  }, { W });
  if (bad.length) console.log(`  ${id}: text near a seam:\n   ` + bad.join('\n   '));
}

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: CW, height: H }, deviceScaleFactor: 1 });
const only = process.argv[2];
for (const c of carousels) {
  if (only && !c.id.startsWith(only)) continue;
  const dir = join(OUT, c.id);
  mkdirSync(dir, { recursive: true });
  const tmp = join('/tmp', `ko-${c.id}.html`);
  writeFileSync(tmp, html(c));
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await checkText(page, c.id);
  await page.screenshot({ path: join(dir, 'panorama.png'), clip: { x: 0, y: 0, width: CW, height: H } });
  for (let i = 0; i < N; i++) {
    await page.screenshot({ path: join(dir, `slide-0${i + 1}.png`), clip: { x: i * W, y: 0, width: W, height: H } });
  }
  writeFileSync(join(dir, 'caption.txt'), c.caption + '\n');
  console.log('rendered', c.id);
}
await browser.close();
