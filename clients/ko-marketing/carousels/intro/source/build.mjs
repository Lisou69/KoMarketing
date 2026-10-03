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
const CREAM = '#F2EEDC';
const ACCENT = '#E4B1B7';
const BURGUNDY = '#4C050C';
const asset = (p) => 'file://' + join(SRC, p);
const X = (slide, x) => slide * W + x;

const css = `
@font-face{font-family:Poppins;font-weight:300;src:url(${asset('fonts/Poppins-Light.ttf')})}
@font-face{font-family:Poppins;font-weight:400;src:url(${asset('fonts/Poppins-Regular.ttf')})}
@font-face{font-family:Poppins;font-weight:500;src:url(${asset('fonts/Poppins-Medium.ttf')})}
@font-face{font-family:Poppins;font-weight:600;src:url(${asset('fonts/Poppins-SemiBold.ttf')})}
@font-face{font-family:Poppins;font-weight:700;src:url(${asset('fonts/Poppins-Bold.ttf')})}
@font-face{font-family:Playfair;font-style:italic;font-weight:400 900;src:url(${asset('fonts/PlayfairDisplay-Italic.ttf')})}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0b0607}
#c{position:relative;width:${CW}px;height:${H}px;overflow:hidden;background:#0b0607;font-family:Poppins;color:${CREAM}}
.a{position:absolute}
.glass{background:rgba(255,255,255,.10);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.28);box-shadow:inset 0 8px 24px rgba(255,255,255,.10),0 30px 70px rgba(0,0,0,.35);
  border-radius:28px;overflow:hidden}
em{font-family:Playfair;font-style:italic;font-weight:400;color:${ACCENT};letter-spacing:-.01em}
.title{font-weight:500;letter-spacing:-.035em;line-height:1.0;white-space:nowrap}
.title em{font-size:1.08em;line-height:.9}
.body{font-weight:300;font-size:26px;line-height:1.45;color:rgba(242,238,220,.74);text-wrap:balance}
.label{display:inline-flex;align-items:center;gap:12px;height:44px;padding:0 22px;border-radius:22px;
  font-size:17px;font-weight:600;letter-spacing:.24em;text-transform:uppercase}
.dot{width:10px;height:10px;border-radius:50%;background:${ACCENT};box-shadow:0 0 14px ${ACCENT};flex:none}
.chip{display:inline-flex;align-items:center;gap:18px;white-space:nowrap;font-weight:400}
.word{font-weight:700;font-size:470px;line-height:1;letter-spacing:-.02em;color:transparent;
  -webkit-text-stroke:2px rgba(242,238,220,.085);white-space:nowrap}
.micro{font-size:20px;font-weight:400;color:rgba(242,238,220,.7);letter-spacing:.02em}
.swipe{font-size:17px;font-weight:600;letter-spacing:.32em;color:rgba(242,238,220,.78);display:flex;align-items:center;gap:14px}
`;

const arrow = (c = CREAM, s = 22) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg>`;
const bookmark = (s = 22) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${CREAM}" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>`;
const pin = (s = 26) =>
  `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${ACCENT}" stroke-width="1.8"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;

// Catmull-Rom spline through the points, as one smooth cubic bezier path.
function smoothPath(p) {
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const LINE = [
  [960, 690], [1120, 600], [1360, 420], [1720, 560], [2080, 520],
  [2400, 420], [2700, 470], [3020, 640], [3400, 800], [3900, 800],
  [4500, 792], [5100, 792], [5380, 700], [5530, 570],
];
const NODES = [0, 3, 6, 9, 13];

function storyLine() {
  const d = smoothPath(LINE);
  const nodes = NODES.map((i) => {
    const [x, y] = LINE[i];
    return `<circle cx="${x}" cy="${y}" r="17" fill="rgba(76,5,12,.55)" stroke="rgba(242,238,220,.32)" stroke-width="1.5"/>
      <circle cx="${x}" cy="${y}" r="6.5" fill="${CREAM}"/>`;
  }).join('');
  return `<svg class="a" style="left:0;top:0" width="${CW}" height="${H}" viewBox="0 0 ${CW} ${H}">
    <defs>
      <linearGradient id="lg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${CW}" y2="0">
        <stop offset="0" stop-color="${CREAM}" stop-opacity=".25"/>
        <stop offset=".2" stop-color="${ACCENT}" stop-opacity=".9"/>
        <stop offset=".5" stop-color="${CREAM}" stop-opacity=".75"/>
        <stop offset=".8" stop-color="${ACCENT}" stop-opacity=".9"/>
        <stop offset="1" stop-color="${CREAM}" stop-opacity=".55"/>
      </linearGradient>
      <filter id="b1" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
      <filter id="b2" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <path d="${d}" fill="none" stroke="#a3343f" stroke-opacity=".35" stroke-width="26" filter="url(#b1)"/>
    <path d="${d}" fill="none" stroke="${ACCENT}" stroke-opacity=".35" stroke-width="8" filter="url(#b2)"/>
    <path d="${d}" fill="none" stroke="url(#lg)" stroke-width="2.6" stroke-linecap="round"/>
    ${nodes}
  </svg>`;
}

const GLOWS = [[540, 470], [1560, 520], [2700, 450], [3800, 560], [4900, 520], [5940, 420]];
function background(c) {
  const glows = GLOWS.map(([x, y], i) => {
    const w = i === 0 || i === 5 ? 1500 : 1300, h = i === 0 || i === 5 ? 1300 : 1100;
    return `<div class="a" style="left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;
      background:radial-gradient(closest-side,rgba(76,5,12,.95),rgba(76,5,12,.6) 42%,rgba(76,5,12,.18) 75%,rgba(76,5,12,0))"></div>
      <div class="a" style="left:${x - 330}px;top:${y - 280}px;width:660px;height:560px;
      background:radial-gradient(closest-side,rgba(150,30,46,.32),rgba(150,30,46,0))"></div>`;
  }).join('');
  const layers = `<div class="a" style="inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 62%,rgba(30,2,6,.55) 100%)"></div>
    <div class="a" style="inset:0;background:linear-gradient(90deg,rgba(76,5,12,.10),rgba(76,5,12,0) 25%,rgba(76,5,12,.12) 50%,rgba(76,5,12,0) 75%,rgba(76,5,12,.10))"></div>`;
  const words = c.bgWords.map((w) => `<div class="a word" style="left:${w.x}px;top:${w.y}px">${w.t}</div>`).join('');
  const grain = `<svg class="a" style="left:0;top:0;opacity:.09;mix-blend-mode:screen" width="${CW}" height="${H}">
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0"/></filter>
    <rect width="100%" height="100%" filter="url(#g)"/></svg>`;
  return glows + layers + words + grain;
}

function system(i) {
  const segs = Array.from({ length: N }, (_, k) =>
    `<div style="width:34px;height:4px;border-radius:2px;background:${k === i ? CREAM : 'rgba(242,238,220,.22)'}"></div>`).join('');
  let html = `<img class="a" src="${asset('assets/ko-lockup-white.svg')}" style="left:${X(i, M)}px;top:${M}px;height:44px">
    <div class="a" style="left:${X(i, W - M - (34 * N + 6 * (N - 1)))}px;top:92px;display:flex;gap:6px">${segs}</div>
    <div class="a micro" style="left:${X(i, M)}px;top:1250px">komarketingagency.com</div>`;
  if (i > 0 && i < N - 1) html += `<div class="a swipe" style="right:${CW - X(i, W - M)}px;top:1250px">SWIPE ${arrow(CREAM, 20)}</div>`;
  if (i === N - 1) html += `<div class="a swipe" style="right:${CW - X(i, W - M)}px;top:1250px">SAVE ${bookmark(20)}</div>`;
  return html;
}

function textBlock(i, s) {
  return `<div class="a glass label" style="left:${X(i, M)}px;top:852px"><span class="dot"></span>${s.label}</div>
    <div class="a title" style="left:${X(i, M)}px;top:918px;font-size:84px">${s.title}</div>
    <div class="a body" style="left:${X(i, M)}px;top:1112px;width:900px">${s.body}</div>`;
}

const silk = (left, top, width) =>
  `<img class="a" src="${asset('assets/silk-element.png')}" style="left:${left}px;top:${top}px;width:${width}px;height:auto">`;

function cover(c) {
  const s = c.cover;
  return `${silk(0, 128, W)}
    <div class="a" style="left:0;width:${W}px;top:592px;display:flex;justify-content:center">
      <div class="glass chip" style="height:64px;padding:0 30px;border-radius:32px;font-size:24px"><span class="dot"></span>${s.chip}</div></div>
    <div class="a title" style="left:0;width:${W}px;top:712px;text-align:center;font-size:170px;line-height:.94">${s.title}</div>
    <div class="a body" style="left:0;width:${W}px;top:1064px;text-align:center;font-size:28px">${s.sub}</div>
    <div class="a" style="left:0;width:${W}px;top:1150px;display:flex;justify-content:center">
      <div class="glass swipe" style="height:60px;padding:0 30px;border-radius:30px">SWIPE ${arrow(CREAM, 20)}</div></div>`;
}

const bigChip = (x, y, text, o = 1, size = 38, h = 100, icon = '<span class="dot"></span>') =>
  `<div class="a glass chip" style="left:${x}px;top:${y}px;height:${h}px;padding:0 44px;border-radius:${h / 2}px;font-size:${size}px;opacity:${o}">${icon}${text}</div>`;

function hero(i, h) {
  const x = (v) => X(i, v);
  switch (h.type) {
    case 'fade':
      return [[96, 236, 1], [300, 420, 0.62], [504, 604, 0.34]]
        .map(([cx, cy, o], k) => bigChip(x(cx), cy, h.items[k], o)).join('');
    case 'monogram':
      return `<div class="a glass" style="left:${x(320)}px;top:214px;width:440px;height:440px;border-radius:44px;display:flex;align-items:center;justify-content:center">
          <img src="${asset('assets/ko-monogram-white.svg')}" style="width:280px"></div>
        ${bigChip(x(96), 300, h.chips[0], 1, 30, 84)}
        ${bigChip(x(560), 600, h.chips[1], 1, 30, 84, pin())}`;
    case 'scatter':
      return bigChip(x(96), 236, h.items[0]) + bigChip(x(640), 420, h.items[1]) + bigChip(x(250), 610, h.items[2]);
    case 'converge': {
      const cols = [190, 540, 890];
      const lines = cols.map((cx) => `<div class="a" style="left:${x(cx) - 1}px;top:330px;width:2px;height:190px;
        background:linear-gradient(180deg,rgba(242,238,220,.7),${ACCENT})"></div>`).join('');
      const chips = cols.map((cx, k) => `<div class="a" style="left:${x(cx) - 200}px;width:400px;top:236px;display:flex;justify-content:center">
        <div class="glass chip" style="height:94px;padding:0 38px;border-radius:47px;font-size:34px"><span class="dot"></span>${h.items[k]}</div></div>`).join('');
      return lines + chips + `<div class="a glass" style="left:${x(96)}px;top:520px;width:888px;height:200px;border-radius:44px;
        display:flex;align-items:center;justify-content:center;gap:26px;font-size:76px;font-weight:500;letter-spacing:-.03em">
        <span class="dot" style="width:16px;height:16px"></span>${h.target}</div>`;
    }
    case 'checklist': {
      const rows = h.items.map((t, k) => `<div style="display:flex;align-items:center;gap:30px;height:168px;padding:0 54px;
        ${k ? 'border-top:1px solid rgba(255,255,255,.14);' : ''}font-size:44px;color:rgba(242,238,220,.62)">
        <div style="width:44px;height:44px;border-radius:50%;border:2px solid rgba(242,238,220,.45);flex:none"></div>${t}</div>`).join('');
      return `<div class="a glass" style="left:${x(130)}px;top:226px;width:820px;height:${168 * h.items.length + 2}px;border-radius:40px">${rows}</div>`;
    }
    case 'wall': {
      return `<div class="a" style="left:${x(40)}px;width:1000px;top:214px;display:flex;flex-direction:column;align-items:center;gap:15px">
        ${h.rows.map((r) => `<div style="display:flex;gap:15px">${r.map((t) =>
          `<div class="glass chip" style="height:66px;padding:0 30px;border-radius:33px;font-size:26px"><span class="dot" style="width:8px;height:8px"></span>${t}</div>`).join('')}</div>`).join('')}
      </div>`;
    }
  }
  return '';
}

function bars(c) {
  const left = X(3, M), width = X(4, W - M) - left;
  return c.bars.map((b, k) => {
    const top = 236 + k * 176;
    return `<div class="a glass" style="left:${left}px;top:${top}px;width:${width}px;height:150px;border-radius:32px">
      <div class="a" style="left:44px;top:0;height:150px;display:flex;align-items:center;gap:34px">
        <span style="font-family:Playfair;font-style:italic;font-size:84px;color:${ACCENT};line-height:1;width:96px">${b.n}</span>
        <span style="font-size:42px;font-weight:500;letter-spacing:-.02em;white-space:nowrap">${b.label}</span></div>
      <div class="a body" style="left:${X(4, 72) - left}px;top:0;height:150px;width:800px;display:flex;align-items:center;font-size:27px;color:rgba(242,238,220,.84)">${b.desc}</div>
      <div class="a" style="right:34px;top:41px;width:68px;height:68px;border-radius:50%;border:1px solid rgba(242,238,220,.35);
        display:flex;align-items:center;justify-content:center">${arrow(CREAM, 26)}</div>
    </div>`;
  }).join('');
}

function cta(c) {
  const i = 5, s = c.s6;
  return `${silk(X(i, 0), 136, W)}
    <div class="a title" style="left:${X(i, 0)}px;width:${W}px;top:684px;text-align:center;font-size:80px;line-height:1.04">${s.title}</div>
    <div class="a body" style="left:${X(i, 0)}px;width:${W}px;top:878px;text-align:center;font-size:27px">${s.body}</div>
    <div class="a" style="left:${X(i, 0)}px;width:${W}px;top:960px;display:flex;justify-content:center">
      <div class="glass" style="height:108px;padding:0 16px 0 46px;border-radius:54px;display:flex;align-items:center;gap:34px;font-size:36px;font-weight:500;letter-spacing:-.01em">
        komarketingagency.com
        <div style="width:78px;height:78px;border-radius:50%;background:${CREAM};display:flex;align-items:center;justify-content:center">${arrow(BURGUNDY, 32)}</div>
      </div></div>
    <div class="a" style="left:${X(i, 0)}px;width:${W}px;top:1112px;display:flex;justify-content:center;align-items:center;gap:14px;font-size:24px;color:rgba(242,238,220,.82)">
      ${bookmark(26)} Save this post for later</div>`;
}

function html(c) {
  const content = [
    cover(c),
    hero(1, c.s2.hero) + textBlock(1, c.s2),
    hero(2, c.s3.hero) + textBlock(2, c.s3),
    textBlock(3, c.s4),
    textBlock(4, c.s5),
    cta(c),
  ].join('') + bars(c);
  const sys = Array.from({ length: N }, (_, i) => system(i)).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div id="c">${background(c)}${storyLine()}${content}${sys}</div></body></html>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/local/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: CW, height: H }, deviceScaleFactor: 1 });
for (const c of carousels) {
  const dir = join(OUT, c.id);
  mkdirSync(dir, { recursive: true });
  const tmp = join('/tmp', `ko-${c.id}.html`);
  writeFileSync(tmp, html(c));
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(dir, 'panorama.png'), clip: { x: 0, y: 0, width: CW, height: H } });
  for (let i = 0; i < N; i++) {
    await page.screenshot({ path: join(dir, `slide-0${i + 1}.png`), clip: { x: i * W, y: 0, width: W, height: H } });
  }
  writeFileSync(join(dir, 'caption.txt'), c.caption + '\n');
  console.log('rendered', c.id);
}
await browser.close();
