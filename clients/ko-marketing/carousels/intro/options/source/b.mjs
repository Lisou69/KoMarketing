// Option B, site sections and silk: every slide is built like a section of komarketingagency.com.
// Centered pill and headline on top, the site's own components below (service cards with blue tags and a
// tilted photo, numbered circles, rounded photo cards), the silk ribbon whole, and one journey line with a
// sparkle per slide running through the whole panorama.
import {
  W, H, M, BURG, INK, BLUE, BLUE_DEEP, BLUE_ON_BURG, CREAM_INK, SITE_WHITE, LOGO,
  accent, oneLine, photo, sparkle, pill, tag, arrow, bookmark, silk, deboss, ground, img, SH, SH_DARK,
} from './lib.mjs';

const T = (tone) => tone === 'b'
  ? { ink: CREAM_INK, soft: 'rgba(247,243,241,.80)', acc: BLUE_ON_BURG, logo: LOGO.white, pillBg: CREAM_INK, pillInk: BURG, sh: SH_DARK, line: 'rgba(175,197,215,.55)' }
  : { ink: INK, soft: 'rgba(26,19,16,.72)', acc: BLUE_DEEP, logo: LOGO.burg, pillBg: BURG, pillInk: '#fff', sh: SH, line: BLUE };

const pad = (n) => String(n).padStart(2, '0');
const lines = (s) => (s.match(/<br>/g) || []).length + 1;
const accentLast = (s) => s.replace(/(\S+)$/, '<em>$1</em>');

const centerPill = (X, y, text, t) =>
  `<div class="t nw" style="left:${X}px;width:${W}px;top:${y}px;display:flex;justify-content:center;z-index:10"><div style="display:inline-flex">${pill(text, t.pillBg, t.pillInk)}</div></div>`;
// Centered blocks are measured on their text, so they are given the inner slide width.
const ctitle = (X, y, text, t, size) =>
  `<div class="t serif" style="left:${X + M}px;width:${W - 2 * M}px;top:${y}px;text-align:center;font-size:${size}px;color:${t.ink};z-index:10;text-wrap:balance">${accent(text, t.acc)}</div>`;
const cbody = (X, y, w, text, t, size = 27) =>
  `<div class="t body" style="left:${X + (W - w) / 2}px;width:${w}px;top:${y}px;text-align:center;font-size:${size}px;color:${t.soft};z-index:10;text-wrap:balance">${text}</div>`;

// Header block shared by most slides: pill, title, paragraph. Returns html and the y where it ends.
function head(X, s, t, { y = 168, size = 76, bw = 860, label = s.label } = {}) {
  const ty = y + 70;
  const by = ty + size * 1.02 * lines(s.title) + 22;
  const bl = s.body ? Math.ceil((s.body.length * 13.2) / bw) : 0;
  return {
    html: (label ? centerPill(X, y, label, t) : '') + ctitle(X, ty, s.title, t, size) + (s.body ? cbody(X, by, bw, s.body, t) : ''),
    end: by + bl * 39,
  };
}

// The site's service card: icon square, name, description, blue tags and a tilted photo peeking on the right.
function serviceCard({ x, y, w, h, name, desc, tags = [], k, pos, z = 3, nameSize = 30, descW }) {
  const icon = `<span style="width:40px;height:40px;border-radius:9px;background:${BURG};display:inline-flex;align-items:center;justify-content:center;flex:none">${sparkle('#fff', 16)}</span>`;
  const pic = k
    ? `<div class="a" style="right:-40px;top:${h * 0.2}px;width:${h * 0.62}px;height:${h * 0.8}px;border-radius:18px;overflow:hidden;transform:rotate(12deg);box-shadow:0 18px 30px -10px rgba(26,19,16,.35)"><div class="a" style="inset:0;background:url(${pk(k)}) ${pos || 'center'}/cover"></div></div>`
    : '';
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:22px;background:#fff;border:1.5px solid rgba(76,5,12,.10);overflow:hidden;z-index:${z};${SH}">
    ${pic}
    <div class="t" style="left:28px;top:26px;display:flex;align-items:center;gap:16px;font-size:${nameSize}px;font-weight:500;color:#3a0a10;white-space:nowrap">${icon}${name}</div>
    ${desc ? `<div class="t body" style="left:28px;top:84px;width:${descW || w * 0.58}px;font-size:22px;line-height:1.42;color:rgba(26,19,16,.74)">${desc}</div>` : ''}
    ${tags.length ? `<div class="t" style="left:28px;top:${h - 26 - (tags.length > 3 ? 96 : 40)}px;width:${w * 0.66}px;display:flex;flex-wrap:wrap;gap:12px 10px">${tags.map((tx) => tag(tx, { size: 19, h: 42 })).join('')}</div>` : ''}
  </div>`;
}
const pk = photo;

function system(i, n, t) {
  const X = i * W, R = (n - i - 1) * W + M;
  return `<img class="a" src="${t.logo}" style="left:${X + W / 2 - 75}px;top:64px;height:36px;z-index:30">
    <div class="t nw" style="left:${X + M}px;top:1220px;font-size:18px;font-weight:500;color:${t.soft};z-index:30">komarketingagency.com</div>
    <div class="t nw" style="right:${R}px;top:1220px;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700;letter-spacing:.26em;color:${t.ink};z-index:30">${i < n - 1 ? `SWIPE ${arrow(t.ink, 30)}` : `${bookmark(t.ink, 18)} SAVE FOR LATER`}</div>`;
}

// One line through the whole carousel, a sparkle marker at the centre of each slide, the current one filled.
function journey(n, tones) {
  let h = '';
  for (let i = 0; i < n; i++) {
    const t = T(tones[i]), X = i * W;
    const l = i === 0 ? X + M : X, r = i === n - 1 ? X + W - M : X + W;
    h += `<div class="a" style="left:${l}px;top:1275px;width:${r - l}px;height:2px;background:${t.line};z-index:30"></div>
      <div class="a" style="left:${X + W / 2 - 15}px;top:1261px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;z-index:31">${sparkle(tones[i] === 'b' ? CREAM_INK : BURG, 28)}</div>`;
    for (const dx of [-90, 90]) h += `<div class="a" style="left:${X + W / 2 + dx - 5}px;top:1271px;width:10px;height:10px;border-radius:50%;background:${t.line};z-index:31"></div>`;
  }
  return h;
}

const L = {
  cover(s, i, X, t) {
    return centerPill(X, 176, s.kicker, t) +
      ctitle(X, 246, oneLine(s.title), t, 150) +
      cbody(X, 432, 820, s.body, t, 29) +
      silk(i, 640) +
      img({ x: X + 150, y: 650, w: 620, h: 500, k: s.photo, pos: s.pos, r: 28, z: 3, shadow: SH }) +
      img({ x: X + 660, y: 820, w: 270, h: 340, k: s.photo2, pos: s.pos2, r: 22, z: 4, shadow: SH + ';border:6px solid #fff' });
  },

  text(s, i, X, t, tone) {
    const hd = head(X, s, t);
    let h = hd.html;
    if (tone === 'b') h += deboss(i, -40, 1000, 230);
    else h += silk(i, 700);
    const top = Math.max(hd.end + 40, 600);
    const ch = s.chips ? 76 : 0;
    h += img({ x: X + 150, y: top + ch, w: W - 300, h: 1160 - top - ch, k: s.photo, pos: s.pos, r: 28, z: 3, shadow: t.sh });
    if (s.chips) h += `<div class="t nw" style="left:${X + M}px;width:${W - 2 * M}px;top:${top}px;display:flex;justify-content:center;gap:12px;z-index:10">${s.chips.map((c) => tag(c, { size: 21, h: 46 })).join('')}</div>`;
    return h;
  },

  list6(s, i, X, t) {
    const hd = head(X, s, t, { size: 70 });
    let h = hd.html + silk(i, 760);
    s.items.forEach((it, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const x = X + M + col * 476, y = 580 + row * 196;
      h += serviceCard({ x, y, w: 460, h: 176, name: it.name, desc: it.line, nameSize: 25, descW: 400 });
    });
    return h;
  },

  grid12(s, i, X, t) {
    const hd = head(X, s, t, { size: 76 });
    let h = hd.html + silk(i, 720);
    s.items.forEach((name, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const x = X + M + col * 476, y = 560 + row * 106;
      h += `<div class="a" style="left:${x}px;top:${y}px;width:460px;height:90px;border-radius:18px;background:rgba(255,255,255,.82);border:1.5px solid rgba(76,5,12,.10);backdrop-filter:blur(10px);z-index:3;${SH}"></div>
        <div class="t nw" style="left:${x + 22}px;top:${y + 25}px;display:flex;align-items:center;gap:14px;font-size:24px;font-weight:500;color:#3a0a10;z-index:4">
        <span style="width:38px;height:38px;border-radius:9px;background:${BURG};display:inline-flex;align-items:center;justify-content:center">${sparkle('#fff', 14)}</span>${name}</div>`;
    });
    return h;
  },

  steps(s, i, X, t, tone) {
    const hd = head(X, s, t, { size: 76 });
    let h = hd.html;
    if (tone === 'b') h += deboss(i, 380, 1010, 200);
    const n = s.steps.length;
    const rowH = n === 3 ? 170 : 150, top = n === 3 ? 600 : 580;
    s.steps.forEach((st, k) => {
      const y = top + k * rowH;
      h += `<div class="a" style="left:${X + 130}px;top:${y}px;width:96px;height:96px;border-radius:50%;background:${tone === 'b' ? CREAM_INK : '#1A1310'};display:flex;align-items:center;justify-content:center;z-index:5">
          <span style="font-family:Serif4;font-style:italic;font-weight:500;font-size:44px;color:${tone === 'b' ? BURG : '#fff'}">${st.n}</span></div>
        <div class="t serif nw" style="left:${X + 262}px;top:${y + 2}px;font-size:46px;color:${t.ink};z-index:10">${st.label}</div>
        <div class="t body" style="left:${X + 264}px;top:${y + 62}px;width:690px;font-size:25px;color:${t.soft};z-index:10">${st.desc}</div>`;
    });
    if (n < 3) h += img({ x: X + 130, y: top + n * rowH + 20, w: W - 260, h: 1170 - (top + n * rowH + 20), k: s.photo, pos: s.pos, r: 26, z: 3, shadow: t.sh });
    return h;
  },

  service(s, i, X, t, tone) {
    const hd = head(X, { title: accentLast(s.tagline), body: '' }, t, { size: 66, label: `${s.n} / ${s.of}  ·  ${s.name}` });
    let h = hd.html;
    if (tone !== 'b') h += silk(i, 340);
    else h += deboss(i, -30, 300, 220);
    const y = 440, ch = 720;
    h += `<div class="a" style="left:${X + M}px;top:${y}px;width:${W - 2 * M}px;height:${ch}px;border-radius:28px;background:#fff;border:1.5px solid rgba(76,5,12,.10);overflow:hidden;z-index:3;${t.sh}">
        <div class="a" style="right:-60px;top:140px;width:360px;height:470px;border-radius:24px;overflow:hidden;transform:rotate(10deg);box-shadow:0 24px 40px -12px rgba(26,19,16,.4)"><div class="a" style="inset:0;background:url(${pk(s.photo)}) ${s.pos}/cover"></div></div></div>
      <div class="t nw" style="left:${X + M + 44}px;top:${y + 44}px;display:flex;align-items:center;gap:18px;font-size:44px;font-weight:500;color:#3a0a10;z-index:5">
        <span style="width:58px;height:58px;border-radius:12px;background:${BURG};display:inline-flex;align-items:center;justify-content:center">${sparkle('#fff', 22)}</span>${s.name}</div>
      <div class="t body" style="left:${X + M + 44}px;top:${y + 132}px;width:560px;font-size:27px;color:rgba(26,19,16,.76);z-index:5">${s.body}</div>
      <div class="t" style="left:${X + M + 44}px;top:${y + 300}px;width:520px;display:flex;flex-direction:column;align-items:flex-start;gap:16px;z-index:5">${s.items.map((it) => tag(it, { size: 25, h: 56 })).join('')}</div>`;
    return h;
  },

  four(s, i, X, t, tone) {
    const hd = head(X, s, t, { size: 76 });
    let h = hd.html + (tone === 'b' ? deboss(i, -40, 1010, 220) : '');
    s.items.forEach((it, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const x = X + M + col * 476, y = 470 + row * 360;
      h += serviceCard({ x, y, w: 460, h: 336, name: it.name, desc: it.desc, nameSize: 26, descW: 400 });
    });
    return h;
  },

  cta(s, i, X, t) {
    const hd = head(X, s, t, { y: 150, size: 80, label: null, bw: 820 });
    return hd.html + silk(i, 700) +
      `<div class="t nw" style="left:${X + 260}px;width:560px;top:${hd.end + 30}px;height:84px;border-radius:99px;background:linear-gradient(180deg,#5a0a12,${BURG} 60%,#3a0309);color:#fff;display:flex;align-items:center;justify-content:center;gap:16px;font-size:28px;font-weight:600;z-index:10;${SH}">komarketingagency.com${arrow('#fff')}</div>` +
      img({ x: X + 300, y: hd.end + 160, w: 480, h: 1170 - (hd.end + 160), k: s.photo, pos: s.pos, r: 26, z: 3, shadow: SH });
  },
};

export default {
  key: 'B',
  name: 'Site sections and silk',
  tones: {
    '01-we-are-open': ['p', 'p', 'b', 'p', 'b', 'p'],
    '02-who-we-are': ['p', 'b', 'p', 'b', 'b', 'p'],
    '03-what-we-do': ['p', 'p', 'b', 'p', 'b', 'p', 'b', 'p', 'b', 'p'],
  },
  html(c, tones) {
    const n = c.slides.length;
    let h = '';
    c.slides.forEach((s, i) => {
      const t = T(tones[i]);
      h += ground(i, tones[i], SITE_WHITE) + L[s.type](s, i, i * W, t, tones[i]) + system(i, n, t);
    });
    return h + journey(n, tones);
  },
};
