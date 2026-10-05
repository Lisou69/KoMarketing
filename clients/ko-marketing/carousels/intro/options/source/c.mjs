// Option C, split spreads: slides work in pairs. One full-height photo straddles the seam of each pair,
// so every slide is half photo and half paper, and the carousel reads as a run of magazine spreads.
// The paper half is cream business-card stock (tone-on-tone deboss) or burgundy card, with a narrow
// editorial column set in burgundy Source Serif 4 Italic.
import {
  W, H, M, BURG, INK, BLUE_DEEP, BLUE_ON_BURG, CREAM_INK, LOGO,
  accent, oneLine, sparkle, pill, arrow, bookmark, deboss, ground, img,
} from './lib.mjs';

const CREAM = '#F3EEE6';
const T = (tone) => tone === 'b'
  ? { ink: CREAM_INK, head: CREAM_INK, soft: 'rgba(247,243,241,.82)', acc: BLUE_ON_BURG, logo: LOGO.white, pillBg: CREAM_INK, pillInk: BURG, rule: 'rgba(247,243,241,.28)', num: BLUE_ON_BURG }
  : { ink: INK, head: BURG, soft: 'rgba(26,19,16,.74)', acc: BLUE_DEEP, logo: LOGO.burg, pillBg: BURG, pillInk: '#fff', rule: 'rgba(76,5,12,.18)', num: BLUE_DEEP };
const WHITE_T = { ink: '#fff', soft: 'rgba(255,255,255,.88)', logo: LOGO.white };

const CW = 420;
const pad = (n) => String(n).padStart(2, '0');

const PAIRS = {
  '01-we-are-open': [['bangkok-skyline', '50% 35%'], ['bangkok-photographer', '50% 35%'], ['studio-shoot', '70% 50%']],
  '02-who-we-are': [['team-meeting', '45% 45%'], ['team-desk', '50% 40%'], ['street-shoot', '45% 40%']],
  '03-what-we-do': [['camera-tripod', '50% 50%'], ['creator-filming', '62% 50%'], ['laptop-coffee', '55% 50%'], ['team-moodboard', '50% 40%'], ['cinema-camera', '50% 50%']],
};

// A text column that sits in the paper half; children flow, the column is vertically centred.
const col = (x, inner, { top = 150, h = 1040, justify = 'center', gap = 28 } = {}) =>
  `<div class="t" style="left:${x}px;top:${top}px;width:${CW}px;height:${h}px;display:flex;flex-direction:column;justify-content:${justify};align-items:flex-start;gap:${gap}px;z-index:10">${inner}</div>`;
const pl = (text, t) => `<div>${pill(text, t.pillBg, t.pillInk)}</div>`;
const ttl = (text, t, size) => `<div class="serif" style="font-size:${size}px;line-height:1.03;color:${t.head};text-wrap:balance">${accent(oneLine(text), t.acc)}</div>`;
const bd = (text, t, size = 26) => `<div class="body" style="font-size:${size}px;color:${t.soft}">${text}</div>`;
const rows = (items, t, render) => `<div style="width:100%">${items.map((it, k) =>
  `<div style="border-top:1.5px solid ${t.rule};padding:12px 0">${render(it, k)}</div>`).join('')}<div style="border-top:1.5px solid ${t.rule}"></div></div>`;

const L = {
  cover(s, i, x, t) {
    const tt = s.title.replace(/ (<em>)/, '<br>$1');
    return col(x, pl(s.kicker, t) +
      `<div class="serif" style="font-size:126px;line-height:.98;color:${t.head}">${accent(tt, t.acc)}</div>` +
      bd(s.body, t, 27), { top: 160, h: 640, justify: 'flex-start' }) +
      img({ x, y: 850, w: CW, h: 300, k: s.photo2, pos: s.pos2, z: 5 });
  },
  text(s, i, x, t) {
    const chips = s.chips
      ? `<div style="display:flex;flex-wrap:wrap;gap:10px">${s.chips.map((c) => `<span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border:1.5px solid ${t.rule.replace(/[\d.]+\)$/, '.6)')};border-radius:99px;font-size:19px;font-weight:600;color:${t.ink}">${sparkle(t.acc, 12)}${c}</span>`).join('')}</div>`
      : '';
    return col(x, pl(s.label, t) + ttl(s.title, t, 70) + bd(s.body, t, 27) + chips);
  },
  list6(s, i, x, t) {
    return col(x, pl(s.label, t) + ttl(s.title, t, 54) + bd(s.body, t, 24) +
      rows(s.items, t, (it, k) => `<div class="serif nw" style="font-size:31px;color:${t.ink}"><span style="color:${t.num};font-weight:300">${pad(k + 1)}&nbsp;&nbsp;</span>${it.name}</div>
        <div style="font-size:19px;color:${t.soft};margin-top:4px">${it.line}</div>`), { gap: 22 });
  },
  grid12(s, i, x, t) {
    return col(x, pl(s.label, t) + ttl(s.title, t, 56) + bd(s.body, t, 24) +
      rows(s.items, t, (name, k) => `<div class="nw" style="display:flex;align-items:baseline;gap:14px;font-size:23px;font-weight:600;color:${t.ink}"><span style="font-size:15px;font-weight:700;letter-spacing:.1em;color:${t.num}">${pad(k + 1)}</span>${name}</div>`), { gap: 22 });
  },
  steps(s, i, x, t, tone) {
    return col(x, pl(s.label, t) + ttl(s.title, t, 62) + bd(s.body, t, 24) +
      rows(s.steps, t, (st) => `<div style="display:flex;gap:18px;align-items:flex-start;padding:6px 0">
        <span style="flex:none;width:58px;height:58px;border-radius:50%;background:${tone === 'b' ? CREAM_INK : INK};color:${tone === 'b' ? BURG : '#fff'};display:flex;align-items:center;justify-content:center;font-family:Serif4;font-style:italic;font-size:28px">${st.n}</span>
        <div><div class="serif nw" style="font-size:34px;color:${t.ink}">${st.label}</div><div style="font-size:21px;line-height:1.4;color:${t.soft};margin-top:4px">${st.desc}</div></div></div>`), { gap: 24 });
  },
  service(s, i, x, t) {
    return col(x, pl(`Service ${s.n} / ${s.of}`, t) + ttl(s.short, t, 60) +
      `<div class="serif" style="font-size:30px;font-weight:400;line-height:1.15;color:${t.acc}">${s.tagline}</div>` +
      bd(s.body, t, 24) +
      rows(s.items, t, (it) => `<div class="nw" style="display:flex;align-items:center;gap:12px;font-size:23px;font-weight:600;color:${t.ink}">${sparkle(t.acc, 13)}${it}</div>`), { gap: 22 });
  },
  four(s, i, x, t) {
    return col(x, pl(s.label, t) + ttl(s.title, t, 58) +
      rows(s.items, t, (it) => `<div class="serif nw" style="font-size:32px;color:${t.ink}">${it.name}</div><div style="font-size:21px;line-height:1.4;color:${t.soft};margin-top:6px">${it.desc}</div>`), { gap: 24 });
  },
  cta(s, i, x, t) {
    return col(x, ttl(s.title, t, 70) + bd(s.body, t, 26) +
      `<div class="nw" style="height:76px;padding:0 30px;border-radius:99px;background:${t.pillBg};color:${t.pillInk};display:flex;align-items:center;gap:14px;font-size:24px;font-weight:600">komarketingagency.com${arrow(t.pillInk, 30)}</div>
      <div class="nw" style="display:flex;align-items:center;gap:10px;font-size:20px;font-weight:600;color:${t.soft}">${bookmark(t.soft, 20)}Save this post for later</div>`);
  },
};

function system(c, i, n, paperT) {
  const X = i * W, R = (n - i - 1) * W + M;
  const left = i % 2 === 0 ? paperT : WHITE_T;
  const right = i % 2 === 0 ? WHITE_T : paperT;
  return `<img class="a" src="${left.logo}" style="left:${X + M}px;top:64px;height:36px;z-index:30">
    <div class="t nw" style="right:${R}px;top:74px;font-size:16px;font-weight:700;letter-spacing:.2em;color:${right.ink};z-index:30">${pad(i + 1)}<span style="opacity:.55"> / ${pad(n)}</span></div>
    <div class="t nw" style="left:${X + M}px;top:1248px;font-size:18px;font-weight:500;color:${left.soft};z-index:30">komarketingagency.com</div>
    ${i < n - 1 ? `<div class="t nw" style="right:${R}px;top:1248px;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700;letter-spacing:.26em;color:${right.ink};z-index:30">SWIPE ${arrow(right.ink, 30)}</div>` : ''}`;
}

export default {
  key: 'C',
  name: 'Split spreads',
  tones: {
    '01-we-are-open': ['p', 'p', 'b', 'p', 'b', 'p'],
    '02-who-we-are': ['p', 'b', 'p', 'b', 'p', 'p'],
    '03-what-we-do': ['p', 'b', 'p', 'b', 'p', 'b', 'p', 'b', 'p', 'p'],
  },
  html(c, tones) {
    const n = c.slides.length;
    let h = '';
    c.slides.forEach((s, i) => {
      const t = T(tones[i]), X = i * W;
      const x = i % 2 === 0 ? X + M : X + 588;
      h += ground(i, tones[i], CREAM);
      if (['text', 'cta'].includes(s.type)) h += deboss(i, i % 2 === 0 ? 60 : 580, 1090, 108, { on: tones[i] });
      h += L[s.type](s, i, x, t, tones[i]) + system(c, i, n, t);
    });
    PAIRS[c.id].forEach(([k, pos], p) => {
      const x = (2 * p) * W + 540;
      h += img({ x, y: 0, w: W, h: H, k, pos, z: 3 }) +
        `<div class="a" style="left:${x}px;top:0;width:${W}px;height:${H}px;z-index:4;background:linear-gradient(180deg,rgba(15,8,6,.38),rgba(15,8,6,0) 18%,rgba(15,8,6,0) 82%,rgba(15,8,6,.38))"></div>`;
    });
    return h;
  },
};
