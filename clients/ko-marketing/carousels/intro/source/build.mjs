// Renders each carousel as one 6480x1350 canvas, then cuts it into six 1080x1350 slides.
// Usage: node build.mjs   (needs playwright-core and a Chrome/Chromium binary, see README)
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carousels } from './content.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(SRC, '..');
const W = 1080, H = 1350, N = 6, M = 72, CW = W * N;
const BURGUNDY = '#4C050C';
const CREAM = '#F3EBDF';
const WHITE = '#FCFAF5';
const asset = (p) => 'file://' + join(SRC, p);
const photo = (k) => asset(`assets/photos/${k}.jpg`);
const cutout = (k) => asset(`assets/cutouts/${k}.png`);
const TONE = {
  c: { ink: BURGUNDY, soft: 'rgba(76,5,12,.76)', logo: 'assets/ko-lockup-burgundy.svg' },
  b: { ink: CREAM, soft: 'rgba(243,235,223,.80)', logo: 'assets/ko-lockup-white.svg' },
};
const GRADE = 'saturate(.86) contrast(1.04) sepia(.06)';

const css = `
@font-face{font-family:Poppins;font-weight:300;src:url(${asset('fonts/Poppins-Light.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${asset('fonts/Poppins-Regular.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${asset('fonts/Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:600;src:url(${asset('fonts/Poppins-SemiBold.ttf')})}
@font-face{font-family:Playfair;font-style:normal;font-weight:400 900;src:url(${asset('fonts/PlayfairDisplay.ttf')})}
@font-face{font-family:Playfair;font-style:italic;font-weight:400 900;src:url(${asset('fonts/PlayfairDisplay-Italic.ttf')})}
@font-face{font-family:Caveat;font-weight:400 700;src:url(${asset('fonts/Caveat.ttf')})}
*{box-sizing:border-box;margin:0;padding:0}
body{background:${BURGUNDY}}
#c{position:relative;width:${CW}px;height:${H}px;overflow:hidden;font-family:Poppins}
.a{position:absolute}
.t{position:absolute}
.serif{font-family:Playfair;font-weight:400;letter-spacing:-.012em;line-height:1.02;white-space:nowrap}
.serif em{font-style:italic}
.title{font-size:86px}
.kicker{font-size:15px;font-weight:600;letter-spacing:.32em;text-transform:uppercase;display:flex;align-items:center;gap:18px;white-space:nowrap}
.kicker:before{content:"";width:46px;height:1.5px;background:currentColor;display:block}
.body{font-weight:300;font-size:26px;line-height:1.45;text-wrap:balance}
.script{font-family:Caveat;font-weight:500;line-height:1;white-space:nowrap}
.paperbg{background-image:url(${asset('assets/tex-paper.png')});background-size:900px 900px;background-blend-mode:multiply}
`;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Polygon for a w x h box whose listed sides ('t','r','b','l') are torn. Torn sides sit `amp` inside the box.
function tornPoly(w, h, sides, seed, amp = 7, step = 9) {
  const r = rng(seed);
  const pts = [];
  const torn = (s) => sides.includes(s);
  const side = (x0, y0, x1, y1, nx, ny, isTorn) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (!isTorn) { pts.push([x0, y0]); return; }
    const n = Math.max(2, Math.round(len / step));
    let wob = 0;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      wob = wob * 0.75 + (r() - 0.5) * amp * 0.9;
      const j = amp + Math.max(-amp, Math.min(amp, wob + (r() - 0.5) * amp * 0.9));
      pts.push([x0 + (x1 - x0) * t + nx * j, y0 + (y1 - y0) * t + ny * j]);
    }
  };
  side(0, 0, w, 0, 0, 1, torn('t'));
  side(w, 0, w, h, -1, 0, torn('r'));
  side(w, h, 0, h, 0, -1, torn('b'));
  side(0, h, 0, 0, 1, 0, torn('l'));
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
}

const SHADOW = 'drop-shadow(0 14px 18px rgba(28,0,4,.28)) drop-shadow(0 2px 3px rgba(28,0,4,.22))';

// A sheet of paper. kind: plain | lined | grid | card | cream
function paper({ x, y, w, h, torn = '', kind = 'plain', seed = 1, inner = '', shadow = SHADOW, style = '', amp = 7 }) {
  const bg = {
    plain: `background-color:${WHITE}`,
    cream: `background-color:${CREAM}`,
    card: 'background-color:#EFE4D2',
    lined: `background-color:${WHITE};background-image:linear-gradient(90deg,transparent 64px,rgba(160,40,52,.30) 64px 66px,transparent 66px),repeating-linear-gradient(180deg,transparent 0 45px,rgba(92,70,70,.17) 45px 47px),url(${asset('assets/tex-paper.png')});background-blend-mode:normal,normal,multiply`,
    grid: `background-color:${WHITE};background-image:repeating-linear-gradient(90deg,transparent 0 31px,rgba(92,70,70,.13) 31px 32px),repeating-linear-gradient(180deg,transparent 0 31px,rgba(92,70,70,.13) 31px 32px),url(${asset('assets/tex-paper.png')});background-blend-mode:normal,normal,multiply`,
  }[kind];
  const tex = kind === 'lined' || kind === 'grid' ? '' : 'paperbg';
  const fibre = torn
    ? `<div class="a" style="inset:0;clip-path:${tornPoly(w, h, torn, seed + 7, amp * 0.55, 7)};background:#FFFEFB"></div>`
    : '';
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;filter:${shadow};${style}">
    ${fibre}<div class="a ${tex}" style="inset:0;${bg};${torn ? `clip-path:${tornPoly(w, h, torn, seed, amp)}` : ''}">${inner}</div></div>`;
}

function polaroid({ x, y, w, ph, img, pos = 'center', pad = 22, bottom = 92, caption = '', capColor = BURGUNDY, tint = '' }) {
  const cap = caption
    ? `<div class="t script" style="left:0;width:${w}px;top:${pad + ph + 16}px;text-align:center;font-size:46px;color:${capColor}">${caption}</div>`
    : '';
  return `<div class="a paperbg" style="left:${x}px;top:${y}px;width:${w}px;height:${pad + ph + bottom}px;background-color:${WHITE};
      box-shadow:0 22px 34px rgba(28,0,4,.30),0 3px 5px rgba(28,0,4,.22)">
    <div class="a" style="left:${pad}px;top:${pad}px;width:${w - 2 * pad}px;height:${ph}px;background:url(${photo(img)}) ${pos}/cover;filter:${GRADE}"></div>
    ${tint ? `<div class="a" style="left:${pad}px;top:${pad}px;width:${w - 2 * pad}px;height:${ph}px;background:${tint};mix-blend-mode:multiply"></div>` : ''}
    <div class="a" style="left:${pad}px;top:${pad}px;width:${w - 2 * pad}px;height:${ph}px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08),inset 0 2px 8px rgba(0,0,0,.18)"></div>
    ${cap}</div>`;
}

// Postage stamp: perforated paper frame with the photo inset.
let stampId = 0;
function stamp({ x, y, w, h, img, pos = 'center', border = 26, r = 8, gap = 25, inner = '' }) {
  const id = `st${stampId++}`;
  const holes = [];
  const nx = Math.round(w / gap), ny = Math.round(h / gap);
  for (let i = 0; i <= nx; i++) { const cx = (i * w) / nx; holes.push([cx, 0], [cx, h]); }
  for (let j = 1; j < ny; j++) { const cy = (j * h) / ny; holes.push([0, cy], [w, cy]); }
  const content = img
    ? `<div class="a" style="left:${border}px;top:${border}px;width:${w - 2 * border}px;height:${h - 2 * border}px;background:url(${photo(img)}) ${pos}/cover;filter:${GRADE};box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)"></div>`
    : inner;
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;filter:drop-shadow(0 16px 20px rgba(28,0,4,.30)) drop-shadow(0 2px 3px rgba(28,0,4,.22))">
    <svg class="a" style="left:0;top:0" width="${w}" height="${h}"><defs><mask id="${id}"><rect width="${w}" height="${h}" fill="#fff"/>
      ${holes.map(([cx, cy]) => `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="#000"/>`).join('')}</mask></defs>
      <rect width="${w}" height="${h}" fill="${WHITE}" mask="url(#${id})"/></svg>
    <div class="a paperbg" style="inset:0;background-color:transparent;-webkit-mask:url(#${id})"></div>
    ${content}</div>`;
}

function tape({ x, y, w = 150, h = 46, seed = 3, color = 'rgba(232,222,200,.80)' }) {
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;filter:drop-shadow(0 2px 2px rgba(28,0,4,.16))">
    <div class="a paperbg" style="inset:0;background-color:${color};clip-path:${tornPoly(w, h, 'lr', seed, 4, 6)}"></div>
    <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%,rgba(0,0,0,.05));clip-path:${tornPoly(w, h, 'lr', seed, 4, 6)}"></div></div>`;
}

const METAL = `<linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d7a78"/><stop offset=".45" stop-color="#eeebe6"/><stop offset=".7" stop-color="#a9a5a1"/><stop offset="1" stop-color="#6d6a68"/></linearGradient>`;

function paperclip({ x, y, s = 1 }) {
  return `<svg class="a" style="left:${x}px;top:${y}px;filter:drop-shadow(1px 3px 2px rgba(28,0,4,.35))" width="${46 * s}" height="${150 * s}" viewBox="0 0 46 150">
    <defs>${METAL}</defs>
    <path d="M30 40 V118 a8 8 0 0 1 -16 0 V22 a13 13 0 0 1 26 0 V124 a17 17 0 0 1 -34 0 V48" fill="none" stroke="url(#metal)" stroke-width="4.2" stroke-linecap="round"/></svg>`;
}

function binder({ x, y, s = 1 }) {
  return `<svg class="a" style="left:${x}px;top:${y}px;filter:drop-shadow(1px 4px 3px rgba(28,0,4,.4))" width="${120 * s}" height="${110 * s}" viewBox="0 0 120 110">
    <defs>${METAL}</defs>
    <path d="M38 52 L30 6 a6 6 0 0 1 12 0 L48 52" fill="none" stroke="url(#metal)" stroke-width="5" stroke-linejoin="round"/>
    <path d="M82 52 L90 6 a6 6 0 0 0 -12 0 L72 52" fill="none" stroke="url(#metal)" stroke-width="5" stroke-linejoin="round"/>
    <path d="M14 50 H106 L98 104 H22 Z" fill="#151213"/>
    <path d="M14 50 H106 L104 60 H16 Z" fill="#3a3436"/></svg>`;
}

function pushpin({ x, y }) {
  return `<svg class="a" style="left:${x - 20}px;top:${y - 20}px;filter:drop-shadow(3px 6px 4px rgba(28,0,4,.4))" width="40" height="40" viewBox="0 0 40 40">
    <defs><radialGradient id="pin" cx=".38" cy=".34" r=".7"><stop offset="0" stop-color="#e2626d"/><stop offset=".5" stop-color="#a3121f"/><stop offset="1" stop-color="#5c0610"/></radialGradient></defs>
    <circle cx="20" cy="20" r="15" fill="url(#pin)"/><circle cx="15" cy="14" r="4" fill="rgba(255,255,255,.55)"/></svg>`;
}

// Spiral binding along the left edge of a page (ring tops sit over the page edge).
function spiral({ x, y, h, step = 46 }) {
  const n = Math.floor(h / step);
  let rings = '';
  for (let i = 0; i < n; i++) {
    const cy = 20 + i * step;
    rings += `<ellipse cx="44" cy="${cy + 3}" rx="7" ry="6.5" fill="rgba(30,10,12,.55)"/>
      <path d="M44 ${cy + 2} C 30 ${cy - 16}, 6 ${cy - 14}, 6 ${cy + 2} C 6 ${cy + 12}, 18 ${cy + 14}, 26 ${cy + 10}" fill="none" stroke="url(#metal)" stroke-width="5.5" stroke-linecap="round"/>`;
  }
  return `<svg class="a" style="left:${x - 30}px;top:${y}px;filter:drop-shadow(1px 2px 1.5px rgba(28,0,4,.45))" width="70" height="${h}"><defs>${METAL}</defs>${rings}</svg>`;
}

function arrow({ x, y, w, h, d, color, sw = 3.2, head }) {
  return `<svg class="a" style="left:${x}px;top:${y}px;overflow:visible" width="${w}" height="${h}">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
    ${head ? `<path d="${head}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</svg>`;
}

const img = (src, x, y, w, extra = '') =>
  `<img class="a" src="${src}" style="left:${x}px;top:${y}px;width:${w}px;height:auto;filter:drop-shadow(0 18px 18px rgba(28,0,4,.32)) drop-shadow(0 3px 4px rgba(28,0,4,.25)) ${GRADE};${extra}">`;

const script = (x, y, text, size, color, extra = '') =>
  `<div class="t script" style="left:${x}px;top:${y}px;font-size:${size}px;color:${color};${extra}">${text}</div>`;

const bookmark = (c, s = 24) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>`;

// ---------- ground: burgundy table with cream paper sheets laid on it ----------

function ground(c) {
  const t = c.tones;
  const off = c.seams;
  let html = `<div class="a" style="inset:0;background:${BURGUNDY}"></div>
    <div class="a" style="inset:0;background-image:url(${asset('assets/tex-soft.png')});background-size:900px;mix-blend-mode:soft-light;opacity:.55"></div>`;
  for (let i = 0; i < N; i++) {
    if (t[i] !== 'b') continue;
    html += `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;
      background:radial-gradient(120% 90% at 50% 40%,rgba(120,22,34,.30),rgba(76,5,12,0) 55%,rgba(25,0,4,.45) 100%)"></div>`;
  }
  for (let i = 0; i < N; i++) {
    if (t[i] !== 'c') continue;
    const l = i === 0 ? -30 : i * W + off[i - 1];
    const r = i === N - 1 ? CW + 30 : (i + 1) * W + off[i];
    const sides = (i === 0 ? '' : 'l') + (i === N - 1 ? '' : 'r');
    html += paper({ x: l, y: -20, w: r - l, h: H + 40, torn: sides, kind: 'cream', seed: 100 + i * 13, amp: 9, step: 11,
      shadow: 'drop-shadow(0 0 14px rgba(20,0,3,.45)) drop-shadow(0 0 2px rgba(20,0,3,.35))' });
  }
  return html;
}

function grain() {
  return `<svg class="a" style="left:0;top:0;opacity:.07;mix-blend-mode:overlay;pointer-events:none" width="${CW}" height="${H}">
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -.2"/></filter>
    <rect width="100%" height="100%" filter="url(#g)"/></svg>`;
}

function system(c, i) {
  const tn = TONE[c.tones[i]];
  const X = i * W;
  let html = `<img class="a" src="${asset(tn.logo)}" style="left:${X + M}px;top:66px;height:40px">
    <div class="t" style="right:${CW - X - W + M}px;top:74px;font-size:16px;font-weight:500;letter-spacing:.24em;color:${tn.ink}">0${i + 1} / 06</div>
    <div class="t" style="left:${X + M}px;top:1258px;font-size:18px;letter-spacing:.04em;color:${tn.soft}">komarketingagency.com</div>`;
  if (i < N - 1) {
    html += `<div class="t" style="right:${CW - X - W + M}px;top:1238px;display:flex;align-items:center;gap:12px;color:${tn.ink}">
      <span class="script" style="font-size:40px">swipe</span>
      <svg width="64" height="24" viewBox="0 0 64 24" fill="none" stroke="${tn.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 13 C 18 9, 34 15, 58 11"/><path d="M48 3 L59 11 L49 20"/></svg></div>`;
  }
  return html;
}

function textBlock(c, i, s, { top = 852, width = 900, size = 86 } = {}) {
  const tn = TONE[c.tones[i]];
  const X = i * W;
  return `<div class="t kicker" style="left:${X + M}px;top:${top}px;color:${tn.ink}">${s.label}</div>
    <div class="t serif title" style="left:${X + M}px;top:${top + 42}px;font-size:${size}px;color:${tn.ink}">${s.title}</div>
    <div class="t body" style="left:${X + M}px;top:${top + 50 + size * 2.04 + 30}px;width:${width}px;color:${tn.soft}">${s.body}</div>`;
}

// Numbered torn notebook strips that run from slide 4 into slide 5, taped over the seam.
function bars(c, { labelSize = 50 } = {}) {
  const left = 3 * W + M, right = 4 * W + W - M, w = right - left;
  return c.bars.map((b, k) => {
    const top = 196 + k * 196, h = 158;
    const inner = `<div class="t" style="left:46px;top:0;height:${h}px;display:flex;align-items:center;gap:30px;color:${BURGUNDY}">
        <span class="serif" style="font-style:italic;font-size:96px;line-height:1;width:110px">${b.n}</span>
        <span class="serif" style="font-size:${labelSize}px">${b.label}</span></div>
      <div class="t body" style="left:${4 * W + 70 - left}px;top:0;height:${h}px;width:780px;display:flex;align-items:center;font-size:27px;color:rgba(76,5,12,.84);font-weight:400">${b.desc}</div>`;
    return paper({ x: left, y: top, w, h, torn: 'lr', kind: 'plain', seed: 40 + k * 3, inner, amp: 8 }) +
      tape({ x: 4 * W - 70, y: top - 22, w: 140, h: 48, seed: 70 + k });
  }).join('');
}

function ctaBlock(c, i, { top, url = 'komarketingagency.com' }) {
  const tone = c.tones[i];
  const tn = TONE[tone];
  const X = i * W;
  const s = c.s6;
  const labelBg = tone === 'c' ? BURGUNDY : CREAM;
  const labelInk = tone === 'c' ? CREAM : BURGUNDY;
  return `<div class="t serif" style="left:${X}px;width:${W}px;top:${top}px;text-align:center;font-size:78px;line-height:1.05;color:${tn.ink}">${s.title}</div>
    <div class="t body" style="left:${X + 90}px;width:${W - 180}px;top:${top + 186}px;text-align:center;color:${tn.soft}">${s.body}</div>
    ${paper({ x: X + 250, y: top + 262, w: 580, h: 96, torn: 'lr', kind: tone === 'c' ? 'plain' : 'plain', seed: 90 + i, amp: 7,
      style: '', inner: `<div class="a" style="inset:0;background:${labelBg}"></div>
      <div class="t" style="left:0;width:580px;top:0;height:96px;display:flex;align-items:center;justify-content:center;gap:20px;font-size:31px;font-weight:500;letter-spacing:.01em;color:${labelInk}">${url}
      <svg width="40" height="22" viewBox="0 0 40 22" fill="none" stroke="${labelInk}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 11h34M27 3l9 8-9 8"/></svg></div>` })}
    <div class="t" style="left:${X}px;width:${W}px;top:${top + 382}px;display:flex;justify-content:center;align-items:center;gap:14px;color:${tn.ink}">
      ${bookmark(tn.ink, 28)}<span class="script" style="font-size:44px">Save this post for later</span></div>`;
}

// ---------- carousel layouts ----------

const layouts = {
  '01-we-are-open'(c) {
    const s1 = c.cover, X2 = W, X3 = 2 * W, X4 = 3 * W, X5 = 4 * W, X6 = 5 * W;
    const h = [];
    // 1 cover: photo print with the title set on the photo
    h.push(`<div class="a" style="left:72px;top:150px;width:936px;height:900px;background:${WHITE};padding:16px;box-shadow:0 26px 40px rgba(20,0,3,.45),0 3px 6px rgba(20,0,3,.3)">
      <div style="width:100%;height:100%;background:url(${photo('skyline')}) 50% 46%/cover;filter:${GRADE} sepia(.12)"></div>
      <div class="a" style="left:16px;right:16px;top:16px;bottom:16px;background:linear-gradient(180deg,rgba(76,5,12,0) 38%,rgba(50,2,8,.78) 100%)"></div></div>`);
    h.push(`<div class="t serif" style="left:128px;top:610px;font-size:200px;line-height:.96;color:${CREAM}">${s1.title}</div>`);
    h.push(paper({ x: 600, y: 112, w: 360, h: 92, torn: 'lr', kind: 'plain', seed: 5,
      inner: script(0, 22, s1.chip, 46, BURGUNDY, 'width:360px;text-align:center') }));
    h.push(tape({ x: 560, y: 100, w: 110, h: 42, seed: 6 }));
    h.push(`<div class="t body" style="left:72px;top:1090px;width:936px;color:${TONE.b.soft}">${s1.sub}</div>`);

    // seam 1|2: aces straddling the torn edge
    h.push(img(cutout('aces'), W - 170, 596, 280));

    // 2 the problem: notes fade away, the phone stays off the hook
    const notes = [[X2 + 560, 236, 1, 'Seen'], [X2 + 600, 400, 0.62, 'Scrolled past'], [X2 + 640, 564, 0.32, 'Forgotten']];
    notes.forEach(([x, y, o, t], k) => {
      h.push(`<div class="a" style="left:0;top:0;opacity:${o}">${paper({ x, y, w: 380, h: 118, torn: 'b', kind: 'lined', seed: 11 + k,
        inner: script(36, 26, t, 62, BURGUNDY) })}${tape({ x: x + 135, y: y - 18, w: 110, h: 40, seed: 20 + k })}</div>`);
    });
    h.push(img(cutout('phone'), X2 + 110, 340, 500));
    h.push(textBlock(c, 1, c.s2));

    // seam 2|3: tape holding the sheet edge
    h.push(tape({ x: X3 - 80, y: 150, w: 130, h: 44, seed: 31 }));

    // 3 who we are: Bangkok polaroid + KO stamp + note
    h.push(polaroid({ x: X3 + 96, y: 150, w: 470, ph: 520, img: 'lohaprasat', pos: '50% 60%', caption: s3chip(c, 1) }));
    h.push(stamp({ x: X3 + 610, y: 196, w: 380, h: 380, border: 0,
      inner: `<div class="a" style="inset:0;display:flex;align-items:center;justify-content:center"><img src="${asset('assets/ko-monogram-burgundy.svg')}" style="width:220px"></div>` }));
    h.push(tape({ x: X3 + 740, y: 176, w: 120, h: 42, seed: 33 }));
    h.push(paper({ x: X3 + 630, y: 626, w: 340, h: 96, torn: 'tb', kind: 'plain', seed: 35,
      inner: script(0, 24, c.s3.hero.chips[0], 48, BURGUNDY, 'width:340px;text-align:center') }));
    h.push(pushpin({ x: X3 + 800, y: 640 }));
    h.push(textBlock(c, 2, c.s3));

    // 4 + 5: numbered strips across the seam
    h.push(bars(c));
    h.push(textBlock(c, 3, c.s4));
    h.push(textBlock(c, 4, c.s5));

    // seam 5|6
    h.push(tape({ x: X6 - 60, y: 1010, w: 130, h: 44, seed: 51 }));

    // 6 CTA
    h.push(polaroid({ x: X6 + 300, y: 140, w: 480, ph: 430, img: 'blazer', pos: '50% 30%' }));
    h.push(tape({ x: X6 + 470, y: 120, w: 140, h: 46, seed: 52 }));
    h.push(img(cutout('kiss'), X6 + 760, 560, 170, 'mix-blend-mode:multiply;filter:none;opacity:.9'));
    h.push(ctaBlock(c, 5, { top: 690 }));
    return h.join('');
  },

  '02-who-we-are'(c) {
    const s1 = c.cover, X2 = W, X3 = 2 * W, X4 = 3 * W, X5 = 4 * W, X6 = 5 * W;
    const h = [];
    // 1 cover: giant serif W, polaroid with handwritten caption
    h.push(`<div class="a serif" style="left:30px;top:20px;font-size:820px;line-height:1;font-style:italic;color:${BURGUNDY}">W</div>`);
    h.push(polaroid({ x: 560, y: 150, w: 420, ph: 470, img: 'writing', pos: '50% 35%', caption: s1.chip }));
    h.push(tape({ x: 710, y: 130, w: 130, h: 44, seed: 4 }));
    h.push(`<div class="t serif" style="left:72px;top:790px;font-size:160px;line-height:.98;color:${BURGUNDY}">${s1.title}</div>`);
    h.push(`<div class="t body" style="left:72px;top:1136px;width:900px;color:${TONE.c.soft}">${s1.sub}</div>`);

    // seam 1|2
    h.push(tape({ x: W - 70, y: 640, w: 130, h: 44, seed: 8 }));

    // 2 the problem: three notes, three different papers, pointing nowhere together
    h.push(paper({ x: X2 + 96, y: 210, w: 360, h: 190, kind: 'grid', torn: 'b', seed: 12,
      inner: script(40, 56, s2i(c, 0), 72, BURGUNDY) }));
    h.push(binder({ x: X2 + 216, y: 168, s: 1 }));
    h.push(paper({ x: X2 + 620, y: 300, w: 360, h: 170, kind: 'lined', torn: 't', seed: 14,
      inner: script(80, 52, s2i(c, 1), 72, BURGUNDY) }));
    h.push(tape({ x: X2 + 740, y: 282, w: 120, h: 42, seed: 15 }));
    h.push(paper({ x: X2 + 300, y: 560, w: 300, h: 170, kind: 'card', seed: 16,
      inner: script(100, 50, s2i(c, 2), 72, BURGUNDY) }));
    h.push(paperclip({ x: X2 + 540, y: 530, s: 0.9 }));
    // each note points somewhere else
    h.push(arrow({ x: X2 + 120, y: 420, w: 120, h: 110, color: CREAM, d: 'M100 6 C 80 40, 50 60, 12 96', head: 'M8 76 L11 98 L33 95' }));
    h.push(arrow({ x: X2 + 850, y: 490, w: 120, h: 110, color: CREAM, d: 'M10 6 C 40 30, 70 60, 100 100', head: 'M78 98 L101 101 L99 78' }));
    h.push(arrow({ x: X2 + 630, y: 640, w: 150, h: 80, color: CREAM, d: 'M6 40 C 50 20, 100 60, 140 30', head: 'M120 21 L141 29 L128 47' }));
    h.push(textBlock(c, 1, c.s2));

    // seam 2|3: the portrait polaroid crosses into slide 3
    // 3 converge into Growth
    const tags = c.s3.hero.items;
    [[X3 + 96, 196], [X3 + 390, 160], [X3 + 684, 196]].forEach(([x, y], k) => {
      h.push(paper({ x, y, w: 300, h: 110, kind: 'plain', torn: 'tb', seed: 61 + k, inner: script(0, 30, tags[k], 58, BURGUNDY, 'width:300px;text-align:center') }));
    });
    h.push(arrow({ x: X3 + 200, y: 330, w: 680, h: 160, color: BURGUNDY, d: 'M40 6 C 60 80, 200 110, 300 140', head: 'M282 124 L301 140 L280 150' }));
    h.push(arrow({ x: X3 + 200, y: 300, w: 680, h: 190, color: BURGUNDY, d: 'M340 6 C 345 60, 338 120, 340 168', head: 'M328 150 L340 170 L352 150' }));
    h.push(arrow({ x: X3 + 200, y: 330, w: 680, h: 160, color: BURGUNDY, d: 'M640 6 C 620 80, 480 110, 380 140', head: 'M398 124 L379 140 L400 150' }));
    h.push(paper({ x: X3 + 96, y: 500, w: 888, h: 250, kind: 'plain', seed: 66,
      inner: `<div class="t serif" style="left:0;width:888px;top:58px;text-align:center;font-size:120px;font-style:italic;color:${BURGUNDY}">${c.s3.hero.target}</div>` }));
    h.push(paperclip({ x: X3 + 880, y: 460 }));
    h.push(textBlock(c, 2, c.s3));

    // 4 + 5 strips
    h.push(bars(c));
    h.push(polaroid({ x: X6 - 125, y: 880, w: 250, ph: 210, img: 'portraitred', pos: '40% 40%', pad: 14, bottom: 52 }));
    h.push(tape({ x: X6 - 50, y: 864, w: 100, h: 38, seed: 77 }));
    h.push(textBlock(c, 3, c.s4));
    h.push(textBlock(c, 4, c.s5, { width: 760 }));

    // 6 CTA
    h.push(polaroid({ x: X6 + 300, y: 140, w: 480, ph: 430, img: 'redcoat', pos: '50% 30%' }));
    h.push(tape({ x: X6 + 470, y: 120, w: 140, h: 46, seed: 81 }));
    h.push(ctaBlock(c, 5, { top: 690 }));
    return h.join('');
  },

  '03-what-we-do'(c) {
    const s1 = c.cover, X2 = W, X3 = 2 * W, X4 = 3 * W, X5 = 4 * W, X6 = 5 * W;
    const h = [];
    // 1 cover: three stamps of still life
    h.push(stamp({ x: 84, y: 170, w: 290, h: 380, img: 'lipstick', pos: '50% 40%' }));
    h.push(stamp({ x: 396, y: 236, w: 290, h: 380, img: 'roses', pos: '50% 50%' }));
    h.push(stamp({ x: 708, y: 170, w: 290, h: 380, img: 'heels', pos: '45% 50%' }));
    h.push(tape({ x: 170, y: 150, w: 120, h: 42, seed: 3 }));
    h.push(paperclip({ x: 640, y: 196, s: 0.95 }));
    h.push(`<div class="t serif" style="left:72px;top:700px;font-size:200px;line-height:.96;color:${CREAM}">${s1.title}</div>`);
    h.push(script(520, 960, s1.chip, 54, CREAM));
    h.push(arrow({ x: 430, y: 960, w: 90, h: 60, color: CREAM, d: 'M84 30 C 60 20, 30 26, 8 40', head: 'M20 26 L7 40 L24 48' }));
    h.push(`<div class="t body" style="left:72px;top:1110px;width:936px;color:${TONE.b.soft}">${s1.sub}</div>`);

    // seam 1|2
    h.push(tape({ x: W - 70, y: 660, w: 130, h: 44, seed: 9 }));

    // 2 the problem: checklist on grid paper + portrait polaroid
    h.push(polaroid({ x: X2 + 96, y: 170, w: 400, ph: 470, img: 'freckles', pos: '50% 30%' }));
    const rows = c.s2.hero.items.map((t, k) => `<div class="t" style="left:50px;top:${70 + k * 120}px;display:flex;align-items:center;gap:26px">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="${BURGUNDY}" stroke-width="2.6" stroke-linecap="round"><path d="M5 6 C 16 4, 30 5, 39 5 C 40 16, 39 28, 40 39 C 28 40, 16 39, 5 40 C 4 28, 6 16, 5 6"/></svg>
      <span class="script" style="font-size:52px;color:${BURGUNDY}">${t}</span></div>`).join('');
    h.push(paper({ x: X2 + 530, y: 230, w: 474, h: 470, kind: 'grid', torn: 't', seed: 22, inner: rows }));
    h.push(binder({ x: X2 + 710, y: 186 }));
    h.push(textBlock(c, 1, c.s2));

    // seam 2|3
    h.push(tape({ x: X3 - 66, y: 420, w: 130, h: 44, seed: 29 }));

    // 3 services: spiral notebook page
    const it = c.s3.hero.items;
    const list = it.map((t, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      return `<div class="t" style="left:${86 + col * 378}px;top:${66 + row * 92}px;display:flex;align-items:center;gap:16px;font-size:26px;font-weight:400;color:${BURGUNDY};white-space:nowrap">
        <span style="width:9px;height:9px;transform:rotate(45deg);background:${BURGUNDY};display:block"></span>${t}</div>`;
    }).join('');
    h.push(paper({ x: X3 + 120, y: 150, w: 870, h: 640, kind: 'lined', seed: 32, inner: list }));
    h.push(spiral({ x: X3 + 120, y: 156, h: 630 }));
    h.push(img(cutout('lipstick'), X3 + 916, 600, 104));
    h.push(textBlock(c, 2, c.s3));

    // 4 + 5 strips
    h.push(bars(c, { labelSize: 44 }));
    h.push(textBlock(c, 3, c.s4));
    h.push(textBlock(c, 4, c.s5));
    h.push(img(cutout('heels'), X5 + 760, 860, 260));

    // 6 CTA
    h.push(polaroid({ x: X6 + 300, y: 140, w: 480, ph: 430, img: 'bkknight', pos: '50% 60%' }));
    h.push(tape({ x: X6 + 470, y: 120, w: 140, h: 46, seed: 91 }));
    h.push(ctaBlock(c, 5, { top: 690 }));
    return h.join('');
  },
};

function s3chip(c, k) { return c.s3.hero.chips[k]; }
function s2i(c, k) { return c.s2.hero.items[k]; }

const SEAMS = {
  '01-we-are-open': [-44, 30, -40, 26, -36],
  '02-who-we-are': [36, -42, 28, -38, 40],
  '03-what-we-do': [-40, 34, -30, 40, -44],
};

function html(c) {
  c.seams = SEAMS[c.id];
  const sys = Array.from({ length: N }, (_, i) => system(c, i)).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div id="c">${ground(c)}${layouts[c.id](c)}${sys}${grain()}</div></body></html>`;
}

// Every text element must sit inside one slide, clear of the 60px edge band.
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
  await page.waitForTimeout(500);
  await checkText(page, c.id);
  await page.screenshot({ path: join(dir, 'panorama.png'), clip: { x: 0, y: 0, width: CW, height: H } });
  for (let i = 0; i < N; i++) {
    await page.screenshot({ path: join(dir, `slide-0${i + 1}.png`), clip: { x: i * W, y: 0, width: W, height: H } });
  }
  writeFileSync(join(dir, 'caption.txt'), c.caption + '\n');
  console.log('rendered', c.id);
}
await browser.close();
