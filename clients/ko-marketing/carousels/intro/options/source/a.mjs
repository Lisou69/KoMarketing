// Option A, editorial journal: warm paper pages, sharp full-bleed photo bands that meet at the seams,
// hairline rules running through the whole panorama, big italic folio numerals, two-column text.
import {
  W, H, M, BURG, INK, BLUE, BLUE_DEEP, BLUE_ON_BURG, CREAM_INK, LOGO,
  accent, oneLine, sparkle, arrow, bookmark, deboss, ground, img, SH, SH_DARK,
} from './lib.mjs';

const PAPER = '#F6F3EE';
const T = (tone) => tone === 'b'
  ? { ink: CREAM_INK, soft: 'rgba(247,243,241,.80)', acc: BLUE_ON_BURG, rule: 'rgba(247,243,241,.30)', logo: LOGO.white, num: BLUE_ON_BURG, sh: SH_DARK }
  : { ink: INK, soft: 'rgba(26,19,16,.72)', acc: BLUE_DEEP, rule: 'rgba(26,19,16,.22)', logo: LOGO.burg, num: BLUE, sh: SH };

const pad = (n) => String(n).padStart(2, '0');
const COL = 372, COLW = W - M - COL;

const kicker = (x, y, text, t, extra = '') =>
  `<div class="t nw" style="left:${x}px;top:${y}px;display:flex;align-items:center;gap:12px;font-size:16px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:${t.ink};z-index:10;${extra}">${sparkle(t.acc, 13)}${text}</div>`;
const title = (x, y, text, t, size, extra = '') =>
  `<div class="t serif nw" style="left:${x - 3}px;top:${y}px;font-size:${size}px;color:${t.ink};z-index:10;${extra}">${accent(text, t.acc)}</div>`;
const body = (x, y, w, text, t, size = 27) =>
  `<div class="t body" style="left:${x}px;top:${y}px;width:${w}px;font-size:${size}px;color:${t.soft};z-index:10">${text}</div>`;
const lines = (s) => (s.match(/<br>/g) || []).length + 1;
const hair = (x, y, w, t) => `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:1.5px;background:${t.rule};z-index:9"></div>`;
const band = (X, y, h, k, pos) => img({ x: X, y, w: W, h, k, pos, z: 2 });
const numeral = (x, y, n, t, size = 150) =>
  `<div class="t serif nw" style="left:${x - 4}px;top:${y}px;font-size:${size}px;font-weight:300;line-height:.9;color:${t.num};z-index:10">${n}</div>`;

function system(c, i, n, t) {
  const X = i * W, R = (n - i - 1) * W + M;
  const l = i === 0 ? X + M : X, r = i === n - 1 ? X + W - M : X + W;
  return `<img class="a" src="${t.logo}" style="left:${X + M}px;top:62px;height:34px;z-index:30">
    <div class="t nw" style="right:${R}px;top:72px;font-size:15px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:${t.ink};z-index:30">${c.topic}<span style="opacity:.45">&nbsp;&nbsp;·&nbsp;&nbsp;${pad(i + 1)} / ${pad(n)}</span></div>
    ${hair(l, 122, r - l, t)}${hair(l, 1222, r - l, t)}
    <div class="t nw" style="left:${X + M}px;top:1244px;font-size:18px;font-weight:500;color:${t.soft};z-index:30">komarketingagency.com</div>
    <div class="t nw" style="right:${R}px;top:1244px;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700;letter-spacing:.26em;color:${t.ink};z-index:30">${i < n - 1 ? `SWIPE ${arrow(t.ink, 30)}` : `${bookmark(t.ink, 18)} SAVE FOR LATER`}</div>`;
}

const L = {
  cover(s, i, X, t) {
    return kicker(X + M, 168, s.kicker, t) +
      title(X + M, 200, oneLine(s.title), t, 166) +
      band(X, 410, 560, s.photo, s.pos) +
      img({ x: X + W - M - 250, y: 860, w: 250, h: 310, k: s.photo2, pos: s.pos2, z: 4, shadow: t.sh }) +
      body(X + M, 1006, 600, s.body, t, 28);
  },

  text(s, i, X, t, tone) {
    if (tone === 'b') {
      const ty = 744;
      return deboss(i, -40, 470, 250) +
        numeral(X + M, 172, pad(i + 1), t) + kicker(X + M, 330, s.label, t) +
        img({ x: X + W - M - 420, y: 168, w: 420, h: 520, k: s.photo, pos: s.pos, z: 3, shadow: t.sh }) +
        title(X + M, ty, s.title, t, 84) +
        body(X + M, ty + 84 * 1.02 * lines(s.title) + 24, 880, s.body, t) +
        chips(s, X + M, 1130, t);
    }
    const ty = 656;
    return band(X, 148, 470, s.photo, s.pos) +
      numeral(X + M, 660, pad(i + 1), t) + kicker(X + M, 812, s.label, t) +
      title(X + COL, ty, s.title, t, 68) +
      body(X + COL, ty + 68 * 1.02 * lines(s.title) + 24, COLW, s.body, t) +
      chips(s, X + COL, 1130, t);
  },

  list6(s, i, X, t) {
    let h = kicker(X + M, 168, s.label, t) + title(X + M, 206, s.title, t, 70) + body(X + M, 368, 900, s.body, t);
    s.items.forEach((it, k) => {
      const y = 448 + k * 124;
      h += hair(X + M, y, W - 2 * M, t) +
        `<div class="t serif nw" style="left:${X + M}px;top:${y + 20}px;font-size:40px;font-weight:300;color:${t.num};z-index:10">${pad(k + 1)}</div>
        <div class="t serif nw" style="left:${X + M + 96}px;top:${y + 16}px;font-size:44px;color:${t.ink};z-index:10">${it.name}</div>
        <div class="t nw" style="left:${X + M + 96}px;top:${y + 74}px;font-size:23px;color:${t.soft};z-index:10">${it.line}</div>`;
    });
    return h;
  },

  grid12(s, i, X, t) {
    let h = kicker(X + M, 168, s.label, t) + title(X + M, 206, s.title, t, 70) + body(X + M, 368, 900, s.body, t);
    s.items.forEach((name, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const x = X + M + col * 478, y = 440 + row * 86;
      h += hair(x, y, 458, t) + `<div class="t nw" style="left:${x}px;top:${y + 18}px;display:flex;align-items:baseline;gap:16px;z-index:10">
        <span style="font-size:17px;font-weight:700;letter-spacing:.12em;color:${t.num}">${pad(k + 1)}</span>
        <span class="serif" style="font-size:34px;color:${t.ink}">${name}</span></div>`;
    });
    return h + band(X, 980, 220, s.photo, s.pos);
  },

  steps(s, i, X, t) {
    let h = kicker(X + M, 168, s.label, t) + title(X + M, 206, s.title, t, 70) + body(X + M, 368, 900, s.body, t);
    s.steps.forEach((st, k) => {
      const y = 484 + k * 196;
      h += hair(X + M, y, W - 2 * M, t) +
        numeral(X + M, y + 30, st.n, t, 110) +
        `<div class="t serif nw" style="left:${X + M + 200}px;top:${y + 28}px;font-size:48px;color:${t.ink};z-index:10">${st.label}</div>` +
        body(X + M + 200, y + 94, 720, st.desc, t, 26);
    });
    if (s.steps.length < 3) h += band(X, 880, 320, s.photo, s.pos);
    return h;
  },

  service(s, i, X, t) {
    const items = s.items.map((it, k) => hair(X + COL, 846 + k * 64, COLW, t) +
      `<div class="t nw" style="left:${X + COL}px;top:${846 + k * 64 + 16}px;display:flex;align-items:center;gap:14px;font-size:25px;font-weight:600;color:${t.ink};z-index:10">${sparkle(t.acc, 14)}${it}</div>`).join('');
    return band(X, 148, 420, s.photo, s.pos) +
      numeral(X + M, 604, s.n, t, 170) +
      `<div class="t nw" style="left:${X + M + 6}px;top:772px;font-size:17px;font-weight:700;letter-spacing:.24em;color:${t.soft};z-index:10">SERVICE ${s.n} / ${s.of}</div>` +
      title(X + COL, 600, s.name, t, 58) +
      `<div class="t serif nw" style="left:${X + COL - 2}px;top:672px;font-size:32px;font-weight:400;color:${t.acc};z-index:10">${s.tagline}</div>` +
      body(X + COL, 726, COLW, s.body, t, 24) + items;
  },

  four(s, i, X, t) {
    let h = kicker(X + M, 168, s.label, t) + title(X + M, 206, s.title, t, 70);
    s.items.forEach((it, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const x = X + M + col * 478, y = 424 + row * 390;
      h += hair(x, y, 458, t) +
        `<div class="t serif nw" style="left:${x}px;top:${y + 34}px;font-size:24px;font-weight:300;color:${t.num};z-index:10">${pad(k + 1)}</div>
        <div class="t serif nw" style="left:${x - 2}px;top:${y + 76}px;font-size:42px;color:${t.ink};z-index:10">${it.name}</div>` +
        body(x, y + 146, 430, it.desc, t, 25);
    });
    return h;
  },

  cta(s, i, X, t) {
    return band(X, 148, 430, s.photo, s.pos) +
      title(X + M, 622, s.title, t, 78) +
      body(X + M, 622 + 78 * 1.02 * lines(s.title) + 24, 880, s.body, t) +
      `<div class="t nw" style="left:${X + M}px;top:960px;display:flex;align-items:center;gap:18px;z-index:10">
        <span class="serif" style="font-size:54px;color:${BURG};border-bottom:2px solid ${BURG};line-height:1.15">komarketingagency.com</span>${arrow(BURG, 44)}</div>
      <div class="t nw" style="left:${X + M}px;top:1056px;font-size:24px;font-weight:600;color:${t.soft};z-index:10">hello@komarketingagency.com</div>`;
  },
};

function chips(s, x, y, t) {
  if (!s.chips) return '';
  return `<div class="t nw" style="left:${x}px;top:${y}px;display:flex;gap:12px;z-index:10">${s.chips.map((c) =>
    `<span style="display:inline-flex;align-items:center;gap:10px;height:46px;padding:0 20px;border:1.5px solid ${t.rule.replace(/[\d.]+\)$/, '.7)')};border-radius:99px;font-size:19px;font-weight:600;color:${t.ink}">${sparkle(t.acc, 12)}${c}</span>`).join('')}</div>`;
}

export default {
  key: 'A',
  name: 'Editorial journal',
  tones: {
    '01-we-are-open': ['p', 'p', 'b', 'p', 'b', 'p'],
    '02-who-we-are': ['p', 'b', 'p', 'b', 'p', 'p'],
    '03-what-we-do': ['p', 'b', 'p', 'b', 'p', 'b', 'p', 'b', 'p', 'p'],
  },
  html(c, tones) {
    const n = c.slides.length;
    let h = '';
    c.slides.forEach((s, i) => {
      const t = T(tones[i]);
      h += ground(i, tones[i], PAPER) + L[s.type](s, i, i * W, t, tones[i]) + system(c, i, n, t);
    });
    return h;
  },
};
