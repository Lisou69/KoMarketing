// v23: v22 with the laptop screen on Who we are 01 showing a real screenshot of komarketingagency.com (home).
// v18: v17 with We are open slide 05 reworked: new third photo, equal gaps and steps between the three photos.
// v17: v16 with the flat Instagram frame on We are open slide 02 replaced by a realistic CSS phone.
// v16: v15 with the We are open slide 03 photo swapped (ko-terrace to ko-terrace-city).
// v15: v14 with cover photo 1 swapped for the golf lounge (caption VENUE kept).
// v14: v13 with three new site photos on the cover (Venue, Lifestyle, Product); layout unchanged.
// v13: v12 with a new We are open cover (slide 1): an ordered grid, three equal photos stepped on one baseline.
// v12: v11 with more text contrast on We are open slide 4 only (darker body, heavier names and numbers, readable
// label and footer, a feathered paper veil softening the background phrases under the text block).
// v11: v10 with a new We are open slide 4, a typographic index of the six services instead of the site cards.
// v10: v9 exactly, with the progress line (dots and star above the footer) removed from every slide.
// v9: v8 with a full layout rework. Every slide in a carousel has its own composition: text set off-centre on
// a clear grid (left-aligned headlines with an indented second line, narrow paragraph columns shifted left or
// right, pills away from the headline axis, some right-aligned blocks), and visuals that change position,
// scale and weight from slide to slide. Copy, photos, brand, tones and the two background phrases are as in v8.
import {
  W, H, M, BURG, INK, BLUE, BLUE_DEEP, BLUE_ON_BURG, CREAM_INK, SITE_WHITE, LOGO, MONO,
  accent, oneLine, photo, asset, sparkle, pill, tag, arrow, bookmark, ground, img, SH, SH_DARK,
} from './lib.mjs';

const GRADE = 'filter:saturate(.92) contrast(1.03)';
const T = (tone) => tone === 'b'
  ? { b: true, ink: CREAM_INK, soft: 'rgba(247,243,241,.80)', acc: BLUE_ON_BURG, logo: LOGO.white, pillBg: CREAM_INK, pillInk: BURG, sh: SH_DARK, line: 'rgba(175,197,215,.55)', mark: CREAM_INK }
  : { b: false, ink: INK, soft: 'rgba(26,19,16,.72)', acc: BLUE_DEEP, logo: LOGO.burg, pillBg: BURG, pillInk: '#fff', sh: SH, line: BLUE, mark: BURG };

// v12 contrast: warm near-black for body copy on this slide (about 14.3:1 on #F5F5F7).
const TEXT_DARK = '#2A2220';
// Feathered paper veil between the giant background phrases (z 0) and the text (z 6+): it calms the phrases
// under the intro and the service index while they stay fully visible around the edges and at the bottom.
const veil = (X) =>
  `<div class="a" style="left:${X}px;top:0;width:1080px;height:1350px;z-index:1;pointer-events:none;
    background:radial-gradient(62% 26% at 22% 30%,rgba(245,245,247,.80),rgba(245,245,247,.55) 55%,rgba(245,245,247,0) 100%),
      radial-gradient(70% 38% at 50% 64%,rgba(245,245,247,.82),rgba(245,245,247,.62) 60%,rgba(245,245,247,0) 100%)"></div>`;
const pad = (n) => String(n).padStart(2, '0');

// ---------- v3 building blocks ----------
const card = ({ x, y, w, h, k, pos = 'center', r = 26, rot = 0, t, z = 2, inner = '', border = '' }) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;transform:rotate(${rot}deg);z-index:${z};${t.sh};${border}">
    <div class="a" style="inset:0;background:url(${photo(k)}) ${pos}/cover;${GRADE}"></div>${inner}</div>`;

function phone({ x, y, w, k, pos = 'center', z = 4, t }) {
  const h = Math.round(w * 2.05), b = Math.round(w * 0.045), r = Math.round(w * 0.17);
  const sh = t.b ? '0 50px 80px -20px rgba(10,0,2,.7),0 14px 28px -8px rgba(10,0,2,.5)' : '0 50px 80px -24px rgba(26,19,16,.45),0 14px 28px -10px rgba(26,19,16,.28)';
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:#16100E;padding:${b}px;z-index:${z};box-shadow:0 0 0 2px #3a302c inset,${sh}">
    <div style="position:relative;width:100%;height:100%;border-radius:${r - b}px;overflow:hidden;background:url(${photo(k)}) ${pos}/cover">
      <div class="a" style="left:50%;top:${Math.round(w * 0.05)}px;width:${Math.round(w * 0.3)}px;height:${Math.round(w * 0.085)}px;transform:translateX(-50%);border-radius:99px;background:#0d0908"></div></div></div>`;
}

// v17: a realistic iPhone-style device drawn in HTML/CSS/SVG (no external asset). Brushed titanium band with
// specular highlights, side buttons, black bezel, dynamic island with a lens, a real status bar above the
// screenshot, home indicator, a glass sheen and a layered soft shadow on the burgundy.
// v22: a MacBook-style laptop drawn in HTML/CSS, seen straight on: aluminium lid rim, black glass bezel with
// a camera notch, a KO "Work" page on screen (browser bar, nav, headline, a 3 x 2 grid of KO site photos),
// a soft glass sheen, then the base slab with its thumb notch and a contact shadow. x/y = lid top-left.
function laptop({ x, y, w, h, z = 3 }) {
  const bz = 16, sw = w - 2 * bz, sh = h - bz - 14;
  const page = `
    <div class="a" style="inset:0;background:#F7F5F3"></div>
    <div class="a" style="left:0;top:0;width:${sw}px;height:26px;background:rgba(236,234,232,.96);border-bottom:1px solid #dcd9d6"></div>
    <div class="a nw" style="right:30px;top:0;height:26px;display:flex;align-items:center;gap:16px;font:600 11px Manrope;color:#2a2422"><span>Sat 3 Oct</span><span>18:40</span></div>
    <div class="a" style="left:0;top:26px;width:${sw}px;height:38px;background:linear-gradient(#F1EFED,#E6E4E2);border-bottom:1px solid #d3d0cd"></div>
    <div class="a" style="left:${sw / 2 - 170}px;top:33px;width:340px;height:24px;border-radius:7px;background:#fff;font:500 12px/24px Manrope;color:#6c6460;text-align:center">komarketingagency.com</div>
    <img class="a" src="${asset('assets/screens/komarketingagency-home-1520x830@2x.png')}" style="left:0;top:64px;width:${sw}px;height:${sh - 64}px;object-fit:cover;object-position:top center">`; // v23: real site screenshot
  return `<div class="a" style="left:${x - 70}px;top:${y + h - 10}px;width:${w + 140}px;height:70px;border-radius:50%;background:radial-gradient(closest-side,rgba(26,19,16,.34),rgba(26,19,16,.14) 60%,rgba(26,19,16,0));filter:blur(6px);z-index:${z - 1}"></div>
  <div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:26px 26px 6px 6px;z-index:${z};
    background:linear-gradient(180deg,#d9dce0,#b8bcc2 50%,#c9ccd1);padding:2.5px;box-sizing:border-box;box-shadow:0 30px 50px -24px rgba(26,19,16,.45)">
    <div class="a" style="inset:2.5px;border-radius:24px 24px 4px 4px;background:#0c0c0d"></div>
    <div class="a" style="left:${bz}px;top:${bz}px;width:${sw}px;height:${sh}px;border-radius:9px 9px 0 0;overflow:hidden">${page}
      <div class="a" style="inset:0;background:linear-gradient(118deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,.05) 34%,rgba(255,255,255,0) 35%,rgba(255,255,255,0) 100%);pointer-events:none"></div></div>
    <div class="a" style="left:${w / 2 - 80}px;top:${bz - 1}px;width:160px;height:26px;border-radius:0 0 12px 12px;background:#0c0c0d"><div class="a" style="left:74px;top:8px;width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#3a4250,#101216 70%)"></div></div>
  </div>
  <div class="a" style="left:${x - 50}px;top:${y + h}px;width:${w + 100}px;height:24px;z-index:${z};border-radius:2px 2px 18px 18px / 2px 2px 14px 14px;
    background:linear-gradient(180deg,#f2f3f5 0%,#d8dbdf 30%,#b4b8be 75%,#8f9399 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.9)">
    <div class="a" style="left:${(w + 100) / 2 - 110}px;top:0;width:220px;height:9px;border-radius:0 0 10px 10px;background:linear-gradient(180deg,#a9adb3,#cfd2d6)"></div></div>`;
}

function iphone({ cx, cy, rot, k, w = 420, h = 866, z = 2 }) {
  const band = 'linear-gradient(90deg,#4f4b47 0%,#a9a49e 2%,#e6e1dc 3.4%,#8a857f 5.6%,#6f6b66 50%,#8a857f 94.4%,#e6e1dc 96.6%,#a9a49e 98%,#4f4b47 100%)';
  const btn = (side, top, len) => `<div class="a" style="${side}:-4px;top:${top}px;width:7px;height:${len}px;border-radius:${side === 'left' ? '3px 0 0 3px' : '0 3px 3px 0'};background:linear-gradient(${side === 'left' ? 90 : 270}deg,#4f4b47,#c9c4be 45%,#8a857f 70%,#5a5651);box-shadow:0 1px 1px rgba(0,0,0,.35)"></div>`;
  const sb = `<div class="a" style="left:0;top:0;width:100%;height:50px;background:#fff;z-index:2">
      <div class="t nw" style="left:42px;top:15px;font-family:Manrope;font-size:16px;font-weight:700;letter-spacing:-.01em;color:#000">9:41</div>
      <svg class="a" style="right:26px;top:18px" width="74" height="13" viewBox="0 0 74 13">
        <rect x="0" y="8" width="3.2" height="4.5" rx=".8"/><rect x="4.8" y="6" width="3.2" height="6.5" rx=".8"/><rect x="9.6" y="3.5" width="3.2" height="9" rx=".8"/><rect x="14.4" y="1" width="3.2" height="11.5" rx=".8"/>
        <path d="M30.5 3.3a10.6 10.6 0 0 1 14.2 0l-1.4 1.5a8.6 8.6 0 0 0-11.4 0zM32.9 5.9a7 7 0 0 1 9.4 0l-1.5 1.5a4.9 4.9 0 0 0-6.4 0zM35.3 8.5a3.4 3.4 0 0 1 4.6 0l-2.3 2.4z"/>
        <rect x="50.5" y=".8" width="20" height="11" rx="3.4" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1"/><rect x="52.3" y="2.6" width="15.4" height="7.4" rx="2"/><path d="M72 4.5v3.6a1.9 1.9 0 0 0 0-3.6z" fill-opacity=".45"/>
      </svg></div>`;
  return `<div class="a" style="left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg);z-index:${z}">
    <div class="a" style="inset:18px 10px -6px 10px;border-radius:70px;box-shadow:0 70px 90px -24px rgba(12,0,3,.78),0 28px 40px -12px rgba(12,0,3,.6),0 6px 10px rgba(12,0,3,.45)"></div>
    ${btn('left', 150, 36)}${btn('left', 214, 64)}${btn('left', 292, 64)}${btn('right', 236, 102)}
    <div class="a" style="inset:0;border-radius:68px;background:${band};box-shadow:inset 0 2px 1px rgba(255,255,255,.55),inset 0 -2px 2px rgba(0,0,0,.45),inset 0 0 0 1px rgba(40,38,36,.6)"></div>
    <div class="a" style="inset:0;border-radius:68px;background:linear-gradient(180deg,rgba(255,255,255,.35),rgba(255,255,255,0) 6%,rgba(255,255,255,0) 94%,rgba(0,0,0,.25));pointer-events:none"></div>
    ${[[0, 96], [0, h - 96], [1, 96], [1, h - 96]].map(([r, y]) => `<div class="a" style="${r ? 'right' : 'left'}:0;top:${y}px;width:5px;height:3px;background:rgba(70,66,62,.85)"></div>`).join('')}
    <div class="a" style="left:96px;top:0;width:3px;height:5px;background:rgba(70,66,62,.85)"></div><div class="a" style="right:96px;bottom:0;width:3px;height:5px;background:rgba(70,66,62,.85)"></div>
    <div class="a" style="inset:5px;border-radius:63px;background:#050506;box-shadow:inset 0 0 0 1.5px #1d1d1f"></div>
    <div class="a" style="inset:15px;border-radius:54px;overflow:hidden;background:#fff">
      ${sb}
      <div class="a" style="left:0;top:50px;width:100%;bottom:0;background:url(${photo(k)}) center top/100% auto no-repeat"></div>
      <div class="a" style="left:50%;top:12px;width:122px;height:36px;transform:translateX(-50%);border-radius:20px;background:#000;z-index:3">
        <div class="a" style="right:14px;top:11px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle at 40% 38%,#3b4a6b 0,#141a2a 35%,#05060a 70%);box-shadow:0 0 0 1.5px #0d0d10"></div></div>
      <div class="a" style="left:50%;bottom:9px;width:140px;height:5px;transform:translateX(-50%);border-radius:3px;background:#111;z-index:3"></div>
      <div class="a" style="inset:0;z-index:4;pointer-events:none;background:linear-gradient(118deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.16) 38%,rgba(255,255,255,.05) 46%,rgba(255,255,255,0) 52%),linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,0) 30%)"></div>
      <div class="a" style="inset:0;z-index:5;border-radius:54px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.5),inset 0 0 6px rgba(0,0,0,.25);pointer-events:none"></div>
    </div></div>`;
}

// Frosted panel as on the site stat cards. On burgundy it turns into an almost opaque cream glass.
const frost = ({ x, y, w, h, r = 28, inner = '', t, z = 3, extra = '' }) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:${t.b ? 'rgba(247,243,241,.94)' : 'rgba(255,255,255,.55)'};backdrop-filter:blur(16px) saturate(1.1);border:1.5px solid rgba(255,255,255,.85);z-index:${z};${t.sh};${extra}">${inner}</div>`;

const circle = (n, s, bg, ink) =>
  `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;background:${bg};color:${ink};display:inline-flex;align-items:center;justify-content:center;font-family:Serif4;font-style:italic;font-weight:500;font-size:${Math.round(s * 0.46)}px">${n}</span>`;

const icon = (s = 40) =>
  `<span style="flex:none;width:${s}px;height:${s}px;border-radius:${Math.round(s * 0.23)}px;background:${BURG};display:inline-flex;align-items:center;justify-content:center">${sparkle('#fff', Math.round(s * 0.4))}</span>`;

// ---------- editorial text ----------
// Grid: 72 px margins, a 536 px column split (the left column ends at 536, the right one starts at 560),
// and indents of 60 to 260 px for the second line of a headline.
const LH = 1.04;
// Headline set line by line. lines: [[html, indent]]. Left aligned from x, or right aligned to x when align is 'right'.
function hl({ x, y, size, lines, t, align = 'left', w = 1080 - 2 * M, z = 10 }) {
  const left = align === 'right' ? x - w : x;
  return lines.map(([txt, off], k) =>
    `<div class="t serif nw" style="left:${left}px;width:${w}px;top:${y + k * Math.round(size * LH)}px;font-size:${size}px;line-height:${LH};color:${t.ink};text-align:${align};${align === 'right' ? 'padding-right' : 'padding-left'}:${off}px;z-index:${z}">${accent(txt, t.acc)}</div>`).join('');
}
const para = ({ x, y, w, text, t, size = 24, align = 'left', color, z = 10 }) =>
  `<div class="t body" style="left:${align === 'right' ? x - w : x}px;top:${y}px;width:${w}px;font-size:${size}px;line-height:1.45;text-align:${align};color:${color || t.soft};z-index:${z}">${text}</div>`;
const label = ({ x, y, text, t, align = 'left' }) => align === 'right'
  ? `<div class="t nw" style="left:${x - 700}px;width:700px;top:${y}px;display:flex;justify-content:flex-end;z-index:10">${pill(text, t.pillBg, t.pillInk)}</div>`
  : `<div class="t nw" style="left:${x}px;top:${y}px;z-index:10">${pill(text, t.pillBg, t.pillInk)}</div>`;

// A photo running to the slide edges, with soft fades where the logo, page number or footer sit on it.
const bleed = ({ x, y, w, h, k, pos = 'center', z = 2, fade = 'none' }) => {
  const f = {
    none: '',
    light: 'linear-gradient(180deg,rgba(245,245,247,.75) 0px,rgba(245,245,247,0) 170px,rgba(245,245,247,0) calc(100% - 200px),rgba(245,245,247,.85) 100%)',
    dark: 'linear-gradient(180deg,rgba(20,0,4,.55) 0px,rgba(20,0,4,0) 180px,rgba(20,0,4,0) calc(100% - 240px),rgba(20,0,4,.7) 100%)',
    burgBottom: 'linear-gradient(180deg,rgba(20,0,4,.55) 0px,rgba(20,0,4,0) 170px,rgba(76,5,12,0) 55%,rgba(76,5,12,1) 100%)',
  }[fade];
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;overflow:hidden;z-index:${z}">
    <div class="a" style="inset:0;background:url(${photo(k)}) ${pos}/cover;${GRADE}"></div>${f ? `<div class="a" style="inset:0;background:${f}"></div>` : ''}</div>`;
};

// Numbered rows: a circle, the item, a hairline between rows.
const rows = ({ x, y, w, items, t, h = 80, size = 25, cs = 44, ink, rule, alt = true }) =>
  `<div class="t" style="left:${x}px;top:${y}px;width:${w}px;z-index:6">${items.map((it, k) =>
    `<div class="nw" style="display:flex;align-items:center;gap:16px;height:${h}px;border-top:${k ? `1.5px solid ${rule || (t.b ? 'rgba(247,243,241,.16)' : 'rgba(76,5,12,.10)')}` : 'none'};font-size:${size}px;font-weight:600;color:${ink || t.ink}">${circle(pad(k + 1), cs, alt && k % 2 ? BLUE : (t.b && !ink ? CREAM_INK : BURG), alt && k % 2 ? '#fff' : (t.b && !ink ? BURG : '#fff'))}${it}</div>`).join('')}</div>`;

const button = ({ x, y, w, t }) => {
  const bg = t.b ? CREAM_INK : `linear-gradient(180deg,#5a0a12,${BURG} 60%,#3a0309)`;
  const ink = t.b ? BURG : '#fff';
  return `<div class="t nw" style="left:${x}px;width:${w}px;top:${y}px;height:80px;border-radius:99px;background:${bg};color:${ink};display:flex;align-items:center;justify-content:center;gap:16px;font-size:27px;font-weight:600;z-index:12;${t.sh}">komarketingagency.com${arrow(ink)}</div>`;
};
const chip = (x, y, text, { bg = CREAM_INK, ink = BURG, size = 22, h = 54, z = 8, rot = 0 } = {}) =>
  `<div class="a" style="left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:${z}"><div class="t nw" style="position:relative">${pill(text, bg, ink, { size, h })}</div></div>`;
const frostChip = (x, y, text, t, { w = 300, z = 6 } = {}) => frost({ x, y, w, h: 76, r: 20, t: { ...t, b: false, sh: SH }, z, inner:
  `<div class="t nw" style="left:24px;top:0;height:76px;display:flex;align-items:center;gap:12px;font-size:23px;font-weight:600;color:${INK}">${sparkle(BURG, 16)}${text}</div>` });

const R = W - M; // right text edge inside a slide

// The site's service card, with a tilted photo peeking out on the right.
function siteCard({ x, y, w, h, name, desc, k, pos, nameSize = 25, descW, z = 4 }) {
  const pic = k ? `<div class="a" style="right:-34px;top:${Math.round(h * 0.16)}px;width:${Math.round(h * 0.62)}px;height:${Math.round(h * 0.86)}px;border-radius:16px;overflow:hidden;transform:rotate(12deg);box-shadow:0 14px 26px -10px rgba(26,19,16,.4)"><div class="a" style="inset:0;background:url(${photo(k)}) ${pos || 'center'}/cover;${GRADE}"></div></div>` : '';
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:22px;background:#fff;border:1.5px solid rgba(76,5,12,.10);overflow:hidden;z-index:${z};${SH}">${pic}
    <div class="t" style="left:26px;top:24px;display:flex;align-items:center;gap:14px;font-size:${nameSize}px;font-weight:500;color:#3a0a10;white-space:nowrap">${icon(40)}${name}</div>
    ${desc ? `<div class="t body" style="left:26px;top:80px;width:${descW || w * 0.6}px;font-size:21px;line-height:1.4;color:rgba(26,19,16,.74)">${desc}</div>` : ''}</div>`;
}


// ---------- slides ----------
const S = {
  '01-we-are-open': [
    // 1 cover (v13). Built on the 72 px grid. Pill, then the headline top-left with the second line indented
    // 180 px; the paragraph in the right column (x 640) on the line of "open.". Below, a stepped row of three
    // equal-width photos (296 px, 24 px gutters) on one shared baseline (y 1160), stepping up 50 px each toward
    // the swipe, each with a small numbered caption. No tilts, no overlaps, nothing crosses into slide 2.
    (s, X, t) => {
      const BASE = 1160, PW = 296, G = 24;
      const pics = [
        { k: 'ko-golf-lounge', pos: '50% 50%', cap: 'Venue', top: 770 },
        { k: 'ko-lifestyle-table', pos: '50% 50%', cap: 'Lifestyle', top: 720 },
        { k: 'ko-product-hand', pos: '50% 50%', cap: 'Product', top: 670 },
      ];
      return label({ x: X + M, y: 150, text: s.kicker, t }) +
        hl({ x: X + M, y: 222, size: 160, t, lines: [['We are', 0], ['<em>open.</em>', 180]] }) +
        para({ x: X + 640, y: 400, w: 368, text: s.body, t, color: TEXT_DARK }) +
        pics.map((p, k) => {
          const x = X + M + k * (PW + G);
          return `<div class="t nw" style="left:${x}px;top:${p.top - 34}px;width:${PW}px;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700;letter-spacing:.22em;color:${TEXT_DARK};z-index:6"><span style="color:${BURG}">${pad(k + 1)}</span><span style="flex:1;height:1.5px;background:rgba(76,5,12,.35)"></span>${p.cap.toUpperCase()}</div>` +
            img({ x, y: p.top, w: PW, h: BASE - p.top, k: p.k, pos: p.pos, r: 18, z: 4, shadow: SH });
        }).join('');
    },

    // 2 the problem. The whole feed post as a tall tilted card down the left side; text in the right column;
    // three chips fading out in a descending stair.
    (s, X, t) => {
      const chips = ['Seen', 'Scrolled past', 'Forgotten'].map((w, k) => {
        const o = [1, 0.62, 0.34][k], bl = [0, 1, 2.4][k];
        return `<div class="a" style="left:${X + 560 + k * 50}px;top:${730 + k * 130}px;opacity:${o};filter:blur(${bl}px);z-index:5">${frost({ x: 0, y: 0, w: 340, h: 104, r: 24, t,
          inner: `<div class="t nw" style="left:28px;top:0;height:104px;display:flex;align-items:center;gap:18px">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="1.8"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>
            <span class="serif" style="font-size:42px;color:${INK}">${w}</span></div>` })}</div>`;
      }).join('');
      return iphone({ cx: X + 310, cy: 607, rot: -4, k: s.photo }) + // v17: realistic phone instead of the flat frame
        label({ x: X + 560, y: 170, text: s.label, t }) +
        hl({ x: X + 548, y: 248, size: 62, w: 470, t, lines: [['Seen once.', 0], ['Then <em>forgotten.</em>', 36]] }) +
        para({ x: X + 596, y: 430, w: 412, text: s.body, t }) + chips;
    },

    // 3 Bangkok. Text over the photo: the terrace runs full height over the right two thirds, a frosted panel
    // with the text overlaps it from the left; the tags sit on the photo under the panel, the monogram card at
    // the bottom right.
    (s, X, t) =>
      bleed({ x: X + 360, y: 0, w: 720, h: H, k: 'ko-terrace-city', pos: '40% 50%', fade: 'light' }) + // v16 photo swap
      frost({ x: X + M, y: 330, w: 640, h: 560, r: 30, t: { ...t, sh: SH }, z: 4, extra: 'background:rgba(255,255,255,.80)' }) +
      label({ x: X + 116, y: 380, text: s.label, t }) +
      hl({ x: X + 116, y: 456, size: 64, w: 580, t, lines: [['Rooted in Bangkok,', 0], ['working <em>worldwide.</em>', 50]] }) +
      para({ x: X + 166, y: 640, w: 500, text: s.body, t, color: 'rgba(26,19,16,.80)' }) +
      `<div class="t" style="left:${X + 116}px;top:940px;display:flex;gap:12px;z-index:6">${s.chips.map((c) => tag(c, { size: 22, h: 50 })).join('')}</div>` +
      frost({ x: X + 770, y: 930, w: 238, h: 210, t, z: 4, inner: `<img class="a" src="${MONO.burg}" style="left:34px;top:64px;width:170px">` }),

    // 4 what we do. A typographic index, set like a magazine contents page: a three-line headline stepping
    // right, a short intro tucked under its first line, and the six services in two staggered columns of
    // hairline-ruled entries, the right column dropped by 70 px. No cards, no icons, no photos.
    (s, X, t) => {
      const list = [
        ['Influencer Marketing', 'The right creators for your brand, briefed, booked and tracked.'],
        ['UGC & Creator', 'Real people filming your product, cut and ready to run as ads.'],
        ['Social Media Manager', 'Your feed planned, posted and answered, week after week.'],
        ['Full Production', 'Concept, shoot and edit, all handled by one crew.'],
        ['Website & SEO', 'A fast site that turns searches into bookings.'],
        ['Strategy & Advertising', 'Ads on Meta, Google and TikTok, tuned until they pay back.'],
        ['Email Marketing', 'Automated emails that bring customers back for more.'],
        ['Branding & Audits', 'A sharp look and voice, and an honest read on what works.'],
      ];
      const entry = ([name, line], k) => {
        const c = k % 2, x = X + M + c * 496, y = 565 + Math.floor(k / 2) * 145 + c * 55; // v22: 8 entries, tighter rhythm
        return `<div class="a" style="left:${x}px;top:${y}px;width:440px;height:1.5px;background:rgba(76,5,12,.42);z-index:6"></div>
          <div class="t nw serif" style="left:${x}px;top:${y + 20}px;font-size:26px;font-weight:700;color:${BURG};z-index:6">${pad(k + 1)}</div>
          <div class="t nw serif" style="left:${x + 54}px;top:${y + 12}px;font-size:38px;font-weight:600;line-height:1.05;color:${INK};z-index:6">${name}</div>
          <div class="t body" style="left:${x + 54}px;top:${y + 60}px;width:380px;font-size:20px;font-weight:400;line-height:1.42;color:${TEXT_DARK};z-index:6">${line}</div>`;
      };
      return `<div class="t nw" style="left:${X + M}px;top:156px;display:flex;align-items:center;gap:16px;font-size:16px;font-weight:800;letter-spacing:.24em;color:${BURG};z-index:10"><span style="width:44px;height:2.5px;background:${BURG}"></span>WHAT WE DO \u00b7 EIGHT SERVICES</div>` +
        hl({ x: X + M, y: 196, size: 92, t, lines: [['Everything your brand', 0], ['needs, under', 180], ['<em>one</em> roof.', 420]] }) +
        para({ x: X + M, y: 410, w: 360, size: 22, text: 'Take one, or take the lot. Our own team runs it all.', t, color: TEXT_DARK }).replace('font-size:22px', 'font-size:22px;font-weight:500') +
        veil(X) + list.map(entry).join('');
    },

    // 5 what changes. Three photos climbing to the top right, the last one leaning into slide 6; the text
    // drops to the bottom: pill and paragraph on the left, headline right-aligned.
    (s, X, t) => {
      const st = [
        // v18: equal 24 px gaps (x 72 to 332, 356 to 636, 660 to 1008) and an equal 150 px step (tops 470, 320, 170);
        // the third photo now ends on the right margin instead of crossing into slide 6.
        { x: 72, y: 470, w: 260, h: 330, k: 'ko-venue-friends', p: '40% 50%', l: 'Seen' },
        { x: 356, y: 320, w: 280, h: 380, k: 'ko-beauty-blue', p: '50% 30%', l: 'Followed' },
        { x: 660, y: 170, w: 348, h: 450, k: 'ko-beauty-friends', p: '50% 40%', l: 'Remembered' },
      ];
      return st.map((c, k) => card({ x: X + c.x, y: c.y, w: c.w, h: c.h, k: c.k, pos: c.p, t, z: 2 + k }) +
        `<div class="t nw" style="left:${X + c.x + 22}px;top:${c.y + c.h - 72}px;z-index:${6 + k}">${pill(c.l, CREAM_INK, BURG, { size: 21, h: 50 })}</div>`).join('') +
        label({ x: X + M, y: 880, text: s.label, t }) +
        hl({ x: X + R, y: 850, size: 78, t, align: 'right', lines: [['Seen. Followed.', 90], ['<em>Remembered.</em>', 0]] }) +
        para({ x: X + M, y: 960, w: 420, text: s.body, t });
    },

    // 6 CTA. A diagonal: a small tilted photo top right, the text in the middle of the left column, the big
    // photo bottom right; the button under the paragraph.
    (s, X, t) =>
      card({ x: X + 730, y: 140, w: 270, h: 300, k: 'ko-bottle-leaves', pos: '50% 45%', rot: 7, t, z: 2 }) + // v19 photo swap
      hl({ x: X + M, y: 470, size: 70, t, lines: [['Let\u2019s make your brand', 0], ['the one people <em>remember.</em>', 70]] }) +
      para({ x: X + M + 70, y: 670, w: 420, text: s.body, t }) +
      button({ x: X + M, y: 840, w: 470, t }) +
      card({ x: X + 590, y: 660, w: 420, h: 520, k: 'ko-beauty-oil', pos: '50% 35%', rot: -3, t, z: 3 }), // v20 photo swap
  ],

  '02-who-we-are': [
    // 1 cover (v22). One device, no team photos: a MacBook-style laptop showing KO's Work page fills the top,
    // its lid bleeding off the left edge (the carousel's start) and ending 68 px inside the right margin. Below,
    // on the 72 px grid: the headline left with "are." indented 200 px; the right column at x 640 holds the
    // pill and the paragraph. Nothing crosses into slide 2.
    (s, X, t) =>
      laptop({ x: X - 110, y: 132, w: 1050, h: 650 }) +
      hl({ x: X + M, y: 868, size: 134, t, lines: [['Who we', 0], ['<em>are.</em>', 200]] }) +
      label({ x: X + 640, y: 884, text: s.kicker, t }) +
      para({ x: X + 640, y: 960, w: R - 640, text: s.body, t, color: TEXT_DARK }),

    // 2 the problem. Text first: pill on the left, the headline right-aligned with its second line stepped
    // in, the paragraph in the left column; the three cards pull apart across the bottom, each with its discipline.
    (s, X, t) => {
      const sc = [
        { x: 130, y: 690, rot: -11, k: 'ko-site-strategy', p: '22% 50%' },
        { x: 420, y: 640, rot: 3, k: s.photo, p: s.pos },
        { x: 720, y: 700, rot: 13, k: 'ko-golf-swing', p: '50% 50%' },
      ];
      return label({ x: X + M, y: 160, text: s.label, t }) +
        hl({ x: X + R, y: 210, size: 80, t, align: 'right', lines: [['Too many teams.', 0], ['No <em>direction.</em>', 160]] }) +
        para({ x: X + 160, y: 420, w: 470, text: s.body, t }) +
        sc.map((c, k) =>
          card({ x: X + c.x, y: c.y, w: 240, h: 310, k: c.k, pos: c.p, rot: c.rot, t, z: k + 2 }) +
          chip(X + c.x + 30, c.y + 330, s.chips[k], { rot: c.rot })).join('');
    },

    // 3 one roof. A full-bleed team photo on the right half; on the left, the text and the three disciplines
    // stepping in, their lines converging on the photo.
    (s, X, t) => {
      const ps = [['Strategy', 72, 690], ['Content', 132, 790], ['Ads', 192, 890]];
      const ends = [72 + 172, 132 + 168, 192 + 102];
      return bleed({ x: X + 560, y: 0, w: 520, h: H, k: s.photo, pos: s.pos, fade: 'light' }) +
        label({ x: X + M, y: 160, text: s.label, t }) +
        hl({ x: X + M, y: 230, size: 64, w: 480, t, lines: [['Everything under', 0], ['<em>one</em> roof.', 90]] }) +
        para({ x: X + M, y: 410, w: 430, text: s.body, t }) +
        ps.map(([w, x, y]) => `<div class="t nw" style="left:${X + x}px;top:${y}px;z-index:6">${pill(w, BURG, '#fff', { size: 22, h: 54 })}</div>`).join('') +
        `<svg class="a" style="left:${X}px;top:0;z-index:3" width="${W}" height="${H}" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round">
          ${ps.map(([, , y], k) => `<path d="M${ends[k] + 14} ${y + 27} C${ends[k] + 160} ${y + 27}, 470 1030, 600 1030"/>`).join('')}</svg>` +
        frost({ x: X + 600, y: 980, w: 270, h: 100, r: 22, t, z: 4, inner: `<div class="t nw serif" style="left:0;width:270px;top:0;height:100px;display:flex;align-items:center;justify-content:center;font-size:60px;color:${INK}">Growth</div>` });
    },

    // 4 how we work. Headline large in the middle of the left column; the five steps as a vertical timeline
    // in the right column; the line runs on past the last step into slide 5.
    (s, X, t) => {
      const lx = 640;
      let h = label({ x: X + M, y: 330, text: s.label, t }) +
        hl({ x: X + M, y: 400, size: 100, w: 560, t, lines: [['From hello', 0], ['to <em>growth.</em>', 70]] }) +
        para({ x: X + M + 70, y: 650, w: 400, text: s.body, t }) +
        `<div class="a" style="left:${X + lx - 1}px;top:200px;width:2px;height:960px;background:${t.line};z-index:3"></div>` +
        `<div class="a" style="left:${X + lx}px;top:1158px;width:${W - lx + 220}px;height:2px;background:${t.line};z-index:3"></div>`;
      s.steps.forEach((st, k) => {
        const y = 196 + k * 216;
        h += `<div class="t nw" style="left:${X + lx - 38}px;top:${y}px;display:flex;align-items:center;gap:22px;z-index:5">${circle(st.n, 76, CREAM_INK, BURG)}<span class="serif" style="font-size:40px;color:${CREAM_INK}">${st.label}</span></div>`;
      });
      return h;
    },

    // 5 every step. The five step descriptions as a stair of frosted strips across the top with one tall
    // photo beside them; the headline at the bottom-left, the pill and the paragraph right-aligned.
    (s, X, t) =>
      s.steps.map((st, k) => frost({ x: X + M + k * 22, y: 150 + k * 126, w: 600, h: 112, r: 24, t, z: 4, inner:
        `<div class="t" style="left:22px;top:0;height:112px;width:556px;display:flex;align-items:center;gap:18px">${circle(st.n, 52, BURG, '#fff')}<span class="body" style="font-size:21px;line-height:1.35;color:rgba(26,19,16,.82)">${st.desc}</span></div>` })).join('') +
      card({ x: X + 790, y: 150, w: 218, h: 600, k: 'ko-insights', pos: '50% 30%', r: 24, t, z: 3 }) +
      label({ x: X + R, y: 850, text: s.label, t, align: 'right' }) +
      hl({ x: X + M, y: 860, size: 80, t, lines: [['Every step,', 0], ['in plain <em>sight.</em>', 110]] }) +
      para({ x: X + R, y: 1060, w: 440, text: s.body, t, align: 'right' }),

    // 6 CTA. The phone tilted over the left edge with a photo behind it; the text right-aligned in the right
    // half, the button under it.
    (s, X, t) =>
      card({ x: X + 250, y: 600, w: 280, h: 360, k: 'ko-golf-crowd', pos: '50% 50%', rot: 7, t, z: 2 }) +
      `<div class="a" style="left:${X - 30}px;top:330px;transform:rotate(-9deg);z-index:4">${phone({ x: 0, y: 0, w: 300, k: 'ko-ugc-beach', pos: '50% 40%', t })}</div>` +
      hl({ x: X + R, y: 230, size: 88, t, align: 'right', lines: [['Tell us about', 120], ['your <em>brand.</em>', 0]] }) +
      para({ x: X + R, y: 470, w: 440, text: s.body, t, align: 'right' }) +
      button({ x: X + R - 480, y: 730, w: 480, t }) +
      card({ x: X + 640, y: 880, w: 368, h: 290, k: s.photo, pos: s.pos, rot: -3, t, z: 2 }),
  ],

  '03-what-we-do': [
    // 1 cover. Headline right-aligned with "do." stepped out; pill and paragraph in the left column; a large
    // photo on the right with a tilted card over its edge and a third card running into slide 2.
    (s, X, t) =>
      label({ x: X + M, y: 170, text: s.kicker, t }) +
      hl({ x: X + R, y: 200, size: 156, t, align: 'right', lines: [['What we', 200], ['<em>do.</em>', 0]] }) +
      para({ x: X + M, y: 560, w: 400, text: s.body, t }) +
      card({ x: X + 520, y: 560, w: 488, h: 620, k: s.photo, pos: s.pos, r: 28, t, z: 2 }) +
      card({ x: X + 300, y: 800, w: 280, h: 360, k: 'ko-food', pos: '50% 50%', rot: -7, t, z: 3, border: 'border:6px solid #fff' }) +
      card({ x: X + 960, y: 830, w: 240, h: 320, k: s.photo2, pos: s.pos2, rot: 6, t, z: 4 }),

    // 2 twelve services. A tall frosted list down the right column; the headline, paragraph and one tilted
    // photo in the left column.
    (s, X, t) => {
      const items = s.items.map((nm, k) => `<div class="nw" style="display:flex;align-items:center;gap:14px;height:82px;border-top:${k ? '1.5px solid rgba(76,5,12,.12)' : 'none'};font-size:22px;font-weight:600;color:${INK}">${circle(pad(k + 1), 42, k % 2 ? BLUE : BURG, '#fff')}${nm}</div>`).join('');
      return label({ x: X + M, y: 170, text: s.label, t }) +
        hl({ x: X + M, y: 240, size: 70, w: 520, t, lines: [['One team for', 0], ['every <em>channel.</em>', 50]] }) +
        para({ x: X + M + 50, y: 420, w: 380, text: s.body, t }) +
        card({ x: X + 150, y: 560, w: 340, h: 240, k: 'ko-site-social', pos: '50% 50%', rot: -4, t, z: 2 }) +
        frost({ x: X + 590, y: 150, w: 418, h: 1040, t, z: 4, inner: `<div class="t" style="left:28px;top:20px;width:362px">${items}</div>` });
    },

    // 3 to 8: the six categories, each on its own composition.
    // 3 UGC & Creator: text top-left, the five items as a plain numbered list below, a large phone at the right.
    (s, X, t) =>
      label({ x: X + M, y: 160, text: `${s.n} / ${s.of}  \u00b7  ${s.name}`, t }) +
      hl({ x: X + M, y: 235, size: 70, w: 640, t, lines: [['The content people', 0], ['actually <em>trust.</em>', 90]] }) +
      para({ x: X + M + 90, y: 410, w: 440, text: s.body, t }) +
      rows({ x: X + M, y: 610, w: 540, items: s.items, t, h: 88, size: 26 }) +
      `<div class="a" style="left:${X + 690}px;top:420px;transform:rotate(7deg);z-index:5">${phone({ x: 0, y: 0, w: 300, k: s.photo, pos: s.pos, t })}</div>`,

    // 4 Social Media Manager: a full-bleed photo across the top fading into the burgundy; headline under it,
    // the paragraph on the left and the items in the right column.
    (s, X, t) =>
      bleed({ x: X, y: 0, w: W, h: 640, k: s.photo, pos: s.pos, fade: 'burgBottom' }) +
      label({ x: X + R, y: 520, text: `${s.n} / ${s.of}  \u00b7  ${s.name}`, t, align: 'right' }) +
      hl({ x: X + M, y: 640, size: 70, t, lines: [['Build an audience', 0], ['that actually <em>shows up.</em>', 80]] }) +
      para({ x: X + M, y: 850, w: 420, text: s.body, t }) +
      rows({ x: X + 560, y: 840, w: 448, items: s.items, t, h: 66, size: 23, cs: 38 }),

    // 5 Website & SEO: a tall white site card down the left column with the items; the headline as a
    // three-step stair in the right column; the site screenshot leaning across the seam into slide 6.
    (s, X, t) =>
      `<div class="a" style="left:${X + M}px;top:150px;width:480px;height:760px;border-radius:28px;background:#fff;border:1.5px solid rgba(76,5,12,.10);z-index:4;${t.sh}">
        <div class="t nw" style="left:34px;top:34px;display:flex;align-items:center;gap:16px;font-size:32px;font-weight:500;color:#3a0a10">${icon(52)}${s.name}</div></div>` +
      rows({ x: X + M + 34, y: 150 + 130, w: 412, items: s.items, t, h: 100, size: 25 }) +
      label({ x: X + 600, y: 170, text: `${s.n} / ${s.of}  \u00b7  ${s.name}`, t }) +
      hl({ x: X + 600, y: 250, size: 66, w: 420, t, lines: [['A site that', 0], ['works while', 50], ['you <em>sleep.</em>', 100]] }) +
      para({ x: X + 650, y: 490, w: 358, text: s.body, t }) +
      card({ x: X + 560, y: 760, w: 580, h: 400, k: s.photo, pos: s.pos, rot: -4, t, z: 5, border: 'border:6px solid #fff' }),

    // 6 Strategy & Advertising: a small photo top-right; a big headline across the middle with a deep indent;
    // the items as a staggered cloud of chips at the bottom.
    (s, X, t) => {
      const pos = [[130, 870], [500, 870], [240, 965], [610, 965], [350, 1060]];
      return label({ x: X + M, y: 170, text: `${s.n} / ${s.of}  \u00b7  ${s.name}`, t }) +
        card({ x: X + 620, y: 150, w: 388, h: 300, k: s.photo, pos: s.pos, rot: 3, t, z: 2 }) +
        hl({ x: X + M, y: 480, size: 92, t, lines: [['Put your budget', 0], ['where it <em>wins.</em>', 160]] }) +
        para({ x: X + M + 160, y: 700, w: 560, text: s.body, t }) +
        s.items.map((it, k) => chip(X + pos[k][0], pos[k][1], `${pad(k + 1)}  ${it}`, { size: 23, h: 62 })).join('');
    },

    // 7 Email Marketing: a full-bleed photo down the left side; everything else in the right column.
    (s, X, t) =>
      bleed({ x: X, y: 0, w: 470, h: H, k: s.photo, pos: s.pos, fade: 'light' }) +
      label({ x: X + 530, y: 170, text: `${s.n} / ${s.of}  \u00b7  ${s.name}`, t }) +
      hl({ x: X + 530, y: 240, size: 62, w: 480, t, lines: [['The channel you', 0], ['actually <em>own.</em>', 50]] }) +
      para({ x: X + 580, y: 410, w: 428, text: s.body, t }) +
      rows({ x: X + 530, y: 640, w: 478, items: s.items, t, h: 96, size: 25 }),

    // 8 Branding & Audits: a large tilted photo top-right with the item card overlapping it from the left;
    // the headline at the bottom-left, the paragraph right-aligned under the pill.
    (s, X, t) =>
      card({ x: X + 500, y: 140, w: 508, h: 560, k: s.photo, pos: s.pos, rot: 4, t, z: 2 }) +
      `<div class="a" style="left:${X + M}px;top:290px;width:520px;height:490px;border-radius:28px;background:rgba(247,243,241,.96);z-index:4;${t.sh}">
        <div class="t nw" style="left:30px;top:28px;display:flex;align-items:center;gap:16px;font-size:30px;font-weight:500;color:#3a0a10">${icon(48)}${s.name}</div></div>` +
      rows({ x: X + M + 30, y: 290 + 106, w: 460, items: s.items, t: { ...t, b: false }, ink: INK, rule: 'rgba(76,5,12,.10)', h: 74, size: 23, cs: 40 }) +
      label({ x: X + R, y: 830, text: `${s.n} / ${s.of}  \u00b7  ${s.name}`, t, align: 'right' }) +
      hl({ x: X + M, y: 900, size: 66, t, lines: [['Know exactly where', 0], ['the wins are <em>hiding.</em>', 100]] }) +
      para({ x: X + R, y: 1060, w: 400, text: s.body, t, align: 'right' }),

    // 9 also in house. An editorial grid of six cells, the right column dropped by 70 px: the headline takes
    // the first cell, the four services the next four, the paragraph the last one, right-aligned.
    (s, X, t) => {
      const pics = [['ko-beauty-water', '50% 50%'], ['ko-site-social', '50% 50%'], ['ko-insights', '50% 30%'], ['ko-golf-coach', '45% 50%']];
      const cells = [[1, 0], [0, 1], [1, 1], [0, 2]];
      return label({ x: X + M, y: 170, text: s.label, t }) +
        hl({ x: X + M, y: 240, size: 64, w: 460, t, lines: [['Shoots, content', 0], ['and <em>coaching.</em>', 60]] }) +
        s.items.map((it, k) => {
          const [c, r] = cells[k], x = X + M + c * 476, y = 150 + r * 320 + c * 70;
          return frost({ x, y, w: 460, h: 300, r: 26, t, z: 4, inner:
            `<div class="a" style="left:22px;top:22px;width:130px;height:256px;border-radius:18px;overflow:hidden"><div class="a" style="inset:0;background:url(${photo(pics[k][0])}) ${pics[k][1]}/cover;${GRADE}"></div></div>
             <div class="t serif" style="left:174px;top:26px;width:262px;font-size:32px;line-height:1.05;color:${INK};text-wrap:balance">${it.name}</div>
             <div class="t body" style="left:174px;top:${it.name.length > 16 ? 112 : 78}px;width:264px;font-size:20px;line-height:1.4;color:rgba(26,19,16,.78)">${it.desc}</div>` });
        }).join('') +
        para({ x: X + R, y: 900, w: 400, size: 26, text: 'Everything else we do in house, on top of the six categories.', t, align: 'right' });
    },

    // 10 CTA. Text over the photo: a full-bleed portrait, and a frosted panel low on the right with the
    // headline, the paragraph, the plans and the button.
    (s, X, t) => {
      const px = X + 400, py = 600;
      return bleed({ x: X, y: 0, w: W, h: H, k: s.photo, pos: '50% 18%', fade: 'light' }) +
        frost({ x: px, y: py, w: 608, h: 580, r: 30, t: { ...t, sh: SH }, z: 4, extra: 'background:rgba(255,255,255,.82)' }) +
        hl({ x: px + 36, y: py + 40, size: 64, w: 560, t, lines: [['Pick a service.', 0], ['Or take them <em>all.</em>', 60]] }) +
        para({ x: px + 96, y: py + 196, w: 476, size: 22, text: s.body, t, color: 'rgba(26,19,16,.80)' }) +
        ['Starter', 'Growth', 'Premium'].map((p, k) => `<div class="t nw" style="left:${px + 36 + k * 180}px;top:${py + 360}px;height:56px;width:164px;border-radius:16px;background:#fff;border:1.5px solid rgba(76,5,12,.12);display:flex;align-items:center;justify-content:center;gap:10px;font-size:21px;font-weight:700;color:${BURG};z-index:6">${sparkle(BLUE, 13)}${p}</div>`).join('') +
        button({ x: px + 36, y: py + 452, w: 536, t });
    },
  ],
};

function system(i, n, t) {
  const X = i * W, R = (n - i - 1) * W + M;
  const strong = t.strong; // v12: the contrast pass on We are open 04
  return `<img class="a" src="${t.logo}" style="left:${X + M}px;top:66px;height:36px;z-index:30">
    <div class="t nw" style="right:${R}px;top:74px;font-size:17px;font-weight:600;letter-spacing:.18em;color:${t.ink};z-index:30">${pad(i + 1)}<span style="opacity:${strong ? .7 : .45}"> / ${pad(n)}</span></div>
    <div class="t nw" style="left:${X + M}px;top:1222px;font-size:18px;font-weight:${strong ? 600 : 500};color:${strong ? TEXT_DARK : t.soft};z-index:30">komarketingagency.com</div>
    ${i < n - 1
    ? `<div class="t nw" style="right:${R}px;top:1222px;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700;letter-spacing:.26em;color:${t.ink};z-index:30">SWIPE ${arrow(t.ink, 30)}</div>`
    : `<div class="t nw" style="right:${R}px;top:1222px;display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;letter-spacing:.2em;color:${t.ink};z-index:30">${bookmark(t.ink, 18)} SAVE</div>`}`;
}

// Two lines of giant Source Serif 4 Italic run through the whole panorama, so their letters are cut by the slide
// edges and carry on into the next slide. Each slide draws both lines clipped to itself, in its own paper's tone.
// The upper line is debossed: pressed into the paper (shadow on the top edge, highlight on the bottom edge).
// The lower line is glossy: raised and lacquered (highlight on the top edge, cast shadow below, a sheen
// gradient across the letters, champagne on burgundy). Both sit under every card and photo, and the paper
// grain overlay above them still shows through.
const BG = {
  '01-we-are-open': { deboss: 'We are open \u00b7 Knock Out', gloss: 'Seen. Followed. Remembered.' },
  '02-who-we-are': { deboss: 'Who we are \u00b7 Knock Out', gloss: 'Small team. All in.' },
  '03-what-we-do': { deboss: 'What we do \u00b7 Knock Out', gloss: 'One team for every channel.' },
};
const DEBOSS = { size: 470, top: 40 }, GLOSS = { size: 480, top: 790 }, BG_START = 40;
const line = (text, n) => Array(n).fill(text).join(' \u00b7 ');
const bgFont = (size) => `font-family:Serif4;font-style:italic;font-weight:600;font-size:${size}px;line-height:1.1;letter-spacing:-.035em;white-space:nowrap`;
function bgLines(c, i, tone, n) {
  const b = tone === 'b', X = BG_START - i * W, reps = Math.ceil(n / 2) + 1;
  const deb = b
    ? 'color:#420309;text-shadow:0 -3px 4px rgba(14,0,2,.85),0 3px 2px rgba(255,214,214,.2)'
    : 'color:#EDEDF0;text-shadow:0 -3px 4px rgba(60,40,30,.19),0 3px 3px rgba(255,255,255,1)';
  // lacquer: bright top, a darker reflection line through the middle of the letters, a lighter bounce below,
  // and narrow diagonal specular streaks (champagne on burgundy)
  const sheen = b
    ? 'repeating-linear-gradient(112deg,rgba(240,205,175,0) 0px,rgba(240,205,175,0) 520px,rgba(240,205,175,.30) 580px,rgba(240,205,175,0) 640px,rgba(240,205,175,0) 900px),linear-gradient(180deg,#8B3A3C 120px,#6A1620 230px,#4E060D 275px,#5A0A13 380px,#7A2629 450px)'
    : 'repeating-linear-gradient(112deg,rgba(255,255,255,0) 0px,rgba(255,255,255,0) 520px,rgba(255,255,255,.9) 580px,rgba(255,255,255,0) 640px,rgba(255,255,255,0) 900px),linear-gradient(180deg,#FFFFFF 120px,#F6F6F8 230px,#E1E1E6 275px,#EEEEF1 380px,#FBFBFC 450px)';
  const lift = b
    ? 'text-shadow:0 -1px 0 rgba(255,215,200,.28),0 5px 7px rgba(10,0,2,.6),0 1px 1px rgba(10,0,2,.5)'
    : 'text-shadow:0 -1px 0 rgba(255,255,255,1),0 6px 9px rgba(60,40,30,.15),0 1px 1px rgba(60,40,30,.16)';
  const glossText = line(BG[c.id].gloss, reps);
  return `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;overflow:hidden;z-index:0">
    <div class="a" style="left:${X}px;top:${DEBOSS.top}px;${bgFont(DEBOSS.size)};${deb}">${line(BG[c.id].deboss, reps)}</div>
    <div class="a" style="left:${X}px;top:${GLOSS.top}px;${bgFont(GLOSS.size)};color:transparent;${lift}">${glossText}</div>
    <div class="a" style="left:${X}px;top:${GLOSS.top}px;${bgFont(GLOSS.size)};color:transparent;background:${sheen};-webkit-background-clip:text;background-clip:text">${glossText}</div></div>`;
}

export default {
  key: 'v23',
  tones: {
    '01-we-are-open': ['p', 'b', 'p', 'p', 'b', 'p'],
    '02-who-we-are': ['p', 'b', 'p', 'b', 'b', 'p'],
    '03-what-we-do': ['p', 'b', 'p', 'b', 'p', 'b', 'p', 'b', 'b', 'p'],
  },
  html(c, tones) {
    const n = c.slides.length;
    let h = '';
    c.slides.forEach((s, i) => {
      const t = { ...T(tones[i]), strong: c.id === '01-we-are-open' && i === 3 };
      h += ground(i, tones[i], SITE_WHITE) + bgLines(c, i, tones[i], n) + S[c.id][i](s, i * W, t, i) + system(i, n, t);
    });
    return h;
  },
};
