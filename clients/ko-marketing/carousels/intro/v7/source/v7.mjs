// v7: v6 with the per-slide silk replaced by one silk ribbon per carousel that ends on free paper.
// v6: v5 plus one continuous line of giant debossed KO text behind every slide.
// v5: the v4 layout with KO's own images. v4 is option B's site-section structure with v3's layered visuals.
// From B: centred ✦ pill, serif headline with one dusty-blue word, short paragraph,
// the site's service cards, and a thin ✦ progress line through the carousel.
// From v3: rounded photo card rows, the phone frame, frosted cards, numbered circles, burgundy and light slides
// alternating, paper grain and the debossed "Knock Out" on burgundy, and cards running across the seams.
import {
  W, H, M, BURG, INK, BLUE, BLUE_DEEP, BLUE_ON_BURG, CREAM_INK, SITE_WHITE, LOGO, MONO,
  accent, oneLine, photo, sparkle, pill, tag, arrow, bookmark, asset, deboss, ground, SH, SH_DARK,
} from './lib.mjs';

const GRADE = 'filter:saturate(.92) contrast(1.03)';
const T = (tone) => tone === 'b'
  ? { b: true, ink: CREAM_INK, soft: 'rgba(247,243,241,.80)', acc: BLUE_ON_BURG, logo: LOGO.white, pillBg: CREAM_INK, pillInk: BURG, sh: SH_DARK, line: 'rgba(175,197,215,.55)', mark: CREAM_INK }
  : { b: false, ink: INK, soft: 'rgba(26,19,16,.72)', acc: BLUE_DEEP, logo: LOGO.burg, pillBg: BURG, pillInk: '#fff', sh: SH, line: BLUE, mark: BURG };

const pad = (n) => String(n).padStart(2, '0');
// Lines a centred serif title takes, counting both explicit breaks and natural wrapping at the inner width.
const titleLines = (s, size) => s.split('<br>').reduce((n, seg) =>
  n + Math.max(1, Math.ceil((seg.replace(/<[^>]+>/g, '').length * size * 0.43) / (W - 2 * M))), 0);
const accentLast = (s) => s.replace(/(\S+)$/, '<em>$1</em>');

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

// Frosted panel as on the site stat cards. On burgundy it turns into an almost opaque cream glass.
const frost = ({ x, y, w, h, r = 28, inner = '', t, z = 3, extra = '' }) =>
  `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;background:${t.b ? 'rgba(247,243,241,.94)' : 'rgba(255,255,255,.55)'};backdrop-filter:blur(16px) saturate(1.1);border:1.5px solid rgba(255,255,255,.85);z-index:${z};${t.sh};${extra}">${inner}</div>`;

const circle = (n, s, bg, ink) =>
  `<span style="flex:none;width:${s}px;height:${s}px;border-radius:50%;background:${bg};color:${ink};display:inline-flex;align-items:center;justify-content:center;font-family:Serif4;font-style:italic;font-weight:500;font-size:${Math.round(s * 0.46)}px">${n}</span>`;

const icon = (s = 40) =>
  `<span style="flex:none;width:${s}px;height:${s}px;border-radius:${Math.round(s * 0.23)}px;background:${BURG};display:inline-flex;align-items:center;justify-content:center">${sparkle('#fff', Math.round(s * 0.4))}</span>`;

// ---------- B structure ----------
const centerPill = (X, y, text, t) =>
  `<div class="t nw" style="left:${X + M}px;width:${W - 2 * M}px;top:${y}px;display:flex;justify-content:center;z-index:10"><div style="display:inline-flex">${pill(text, t.pillBg, t.pillInk)}</div></div>`;

// Pill, headline, paragraph, centred at the top of the slide. Returns the html and where the block ends.
function head(X, s, t, { y = 160, size = 74, bw = 840, label = s.label, title = s.title, body = s.body } = {}) {
  const ty = label ? y + 68 : y;
  const by = ty + size * 1.03 * titleLines(title, size) + 20;
  const bl = body ? Math.ceil((body.replace(/<[^>]+>/g, '').length * 13.4) / bw) : 0;
  return {
    html: (label ? centerPill(X, y, label, t) : '') +
      `<div class="t serif" style="left:${X + M}px;width:${W - 2 * M}px;top:${ty}px;text-align:center;font-size:${size}px;line-height:1.03;color:${t.ink};z-index:10;text-wrap:balance">${accent(title, t.acc)}</div>` +
      (body ? `<div class="t body" style="left:${X + (W - bw) / 2}px;width:${bw}px;top:${by}px;text-align:center;font-size:26px;color:${t.soft};z-index:10;text-wrap:balance">${body}</div>` : ''),
    end: by + bl * 38,
  };
}

function system(i, n, t) {
  const X = i * W, R = (n - i - 1) * W + M;
  return `<img class="a" src="${t.logo}" style="left:${X + M}px;top:66px;height:36px;z-index:30">
    <div class="t nw" style="right:${R}px;top:74px;font-size:17px;font-weight:600;letter-spacing:.18em;color:${t.ink};z-index:30">${pad(i + 1)}<span style="opacity:.45"> / ${pad(n)}</span></div>
    <div class="t nw" style="left:${X + M}px;top:1222px;font-size:18px;font-weight:500;color:${t.soft};z-index:30">komarketingagency.com</div>
    ${i < n - 1
    ? `<div class="t nw" style="right:${R}px;top:1222px;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700;letter-spacing:.26em;color:${t.ink};z-index:30">SWIPE ${arrow(t.ink, 30)}</div>`
    : `<div class="t nw" style="right:${R}px;top:1222px;display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700;letter-spacing:.2em;color:${t.ink};z-index:30">${bookmark(t.ink, 18)} SAVE</div>`}`;
}

function progress(n, tones) {
  let h = '';
  for (let i = 0; i < n; i++) {
    const t = T(tones[i]), X = i * W;
    const l = i === 0 ? X + M : X, r = i === n - 1 ? X + W - M : X + W;
    h += `<div class="a" style="left:${l}px;top:1277px;width:${r - l}px;height:2px;background:${t.line};z-index:30"></div>
      <div class="a" style="left:${X + W / 2 - 14}px;top:1264px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;z-index:31">${sparkle(t.mark, 26)}</div>`;
    for (const dx of [-90, 90]) h += `<div class="a" style="left:${X + W / 2 + dx - 5}px;top:1273px;width:10px;height:10px;border-radius:50%;background:${t.line};z-index:31"></div>`;
  }
  return h;
}

const ctaButton = (X, y, t) => {
  const bg = t.b ? CREAM_INK : `linear-gradient(180deg,#5a0a12,${BURG} 60%,#3a0309)`;
  const ink = t.b ? BURG : '#fff';
  return `<div class="t nw" style="left:${X + 270}px;width:540px;top:${y}px;height:80px;border-radius:99px;background:${bg};color:${ink};display:flex;align-items:center;justify-content:center;gap:16px;font-size:27px;font-weight:600;z-index:12;${t.sh}">komarketingagency.com${arrow(ink)}</div>`;
};

// The site's service card, with a tilted photo peeking out on the right.
function siteCard({ x, y, w, h, name, desc, k, pos, nameSize = 25, descW, z = 4 }) {
  const pic = k ? `<div class="a" style="right:-34px;top:${Math.round(h * 0.16)}px;width:${Math.round(h * 0.62)}px;height:${Math.round(h * 0.86)}px;border-radius:16px;overflow:hidden;transform:rotate(12deg);box-shadow:0 14px 26px -10px rgba(26,19,16,.4)"><div class="a" style="inset:0;background:url(${photo(k)}) ${pos || 'center'}/cover;${GRADE}"></div></div>` : '';
  return `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:22px;background:#fff;border:1.5px solid rgba(76,5,12,.10);overflow:hidden;z-index:${z};${SH}">${pic}
    <div class="t" style="left:26px;top:24px;display:flex;align-items:center;gap:14px;font-size:${nameSize}px;font-weight:500;color:#3a0a10;white-space:nowrap">${icon(40)}${name}</div>
    ${desc ? `<div class="t body" style="left:26px;top:80px;width:${descW || w * 0.6}px;font-size:21px;line-height:1.4;color:rgba(26,19,16,.74)">${desc}</div>` : ''}</div>`;
}

// ---------- slide heroes ----------
const S = {
  '01-we-are-open': [
    // 1 cover: the KO site hero, a phone in front of a row of work; the last card runs into slide 2
    (s, X, t, i) => {
      const hd = head(X, { title: oneLine(s.title) }, t, { label: s.kicker, size: 140, body: s.body, bw: 800 });
      const row = [
        { x: 34, k: 'ko-padel-a', p: '45% 40%' }, { x: 300, k: 'ko-food', p: '50% 50%' },
        { x: 718, k: 'ko-golf-crowd', p: '50% 50%' }, { x: 984, k: 'ko-night', p: '50% 60%' },
      ];
      return hd.html +
        row.map((r) => card({ x: X + r.x, y: 720, w: 250, h: 360, k: r.k, pos: r.p, r: 24, t, z: 2 })).join('') +
        phone({ x: X + 400, y: 600, w: 280, k: 'ko-beauty-laugh', pos: '50% 30%', t });
    },
    // 2 the problem: a feed photo and what happens to a post nobody remembers
    (s, X, t, i) => {
      const hd = head(X, s, t);
      const chips = ['Seen', 'Scrolled past', 'Forgotten'].map((w, k) => {
        const o = [1, 0.6, 0.32][k], bl = [0, 1, 2.4][k];
        return `<div class="a" style="left:${X + 560 + k * 34}px;top:${650 + k * 166}px;opacity:${o};filter:blur(${bl}px);z-index:5">${frost({ x: 0, y: 0, w: 400, h: 116, r: 24, t,
          inner: `<div class="t nw" style="left:30px;top:0;height:116px;display:flex;align-items:center;gap:20px">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${BLUE}" stroke-width="1.8"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>
            <span class="serif" style="font-size:46px;color:${INK}">${w}</span></div>` })}</div>`;
      }).join('');
      return hd.html + deboss(i, -40, 1040, 230) +
        card({ x: X + 200, y: 600, w: 420, h: 580, k: s.photo, pos: s.pos, t, z: 2 }) + chips;
    },
    // 3 who we are: Bangkok, a frosted card with the KO monogram
    (s, X, t, i) => {
      const hd = head(X, { ...s, chips: null }, t);
      return hd.html +
        card({ x: X + M, y: 590, w: 500, h: 590, k: s.photo, pos: s.pos, t, z: 2 }) +
        frost({ x: X + 500, y: 690, w: 508, h: 400, t, z: 4, inner:
          `<img class="a" src="${MONO.burg}" style="left:54px;top:56px;width:210px">
           <div class="t" style="left:54px;top:230px;display:flex;flex-direction:column;align-items:flex-start;gap:14px">${s.chips.map((c) => tag(c, { size: 23, h: 52 })).join('')}</div>` });
    },
    // 4 what we do: the six categories as site service cards
    (s, X, t, i) => {
      const hd = head(X, s, t, { size: 70 });
      const cats = ['ko-ugc-beach', 'ko-beauty-product', 'ko-site-website', 'ko-golf-portfolio', 'ko-product-sky', 'ko-cans-design'];
      return hd.html + s.items.map((it, k) => siteCard({
        x: X + M + (k % 2) * 476, y: 575 + Math.floor(k / 2) * 202, w: 460, h: 184,
        name: it.name, desc: it.line, k: cats[k], nameSize: 24, descW: 290,
      })).join('');
    },
    // 5 what changes: three cards rising, the last one leaning into slide 6
    (s, X, t, i) => {
      const hd = head(X, s, t);
      const st = [
        { x: 70, y: 790, k: 'ko-venue-friends', p: '40% 50%', w: 'Seen' },
        { x: 390, y: 700, k: 'ko-beauty-blue', p: '50% 30%', w: 'Followed' },
        { x: 720, y: 610, k: 'ko-padel-red', p: '40% 40%', w: 'Remembered' },
      ];
      return hd.html + deboss(i, -40, 1060, 220) + st.map((c, k) => card({ x: X + c.x, y: c.y, w: k === 2 ? 420 : 290, h: 390, k: c.k, pos: c.p, t, z: 2 + k }) +
        `<div class="t nw" style="left:${X + c.x + 22}px;top:${c.y + 318}px;z-index:${6 + k}">${pill(c.w, CREAM_INK, BURG, { size: 21, h: 50 })}</div>`).join('');
    },
    // 6 CTA: a fan of work
    (s, X, t, i) => {
      const hd = head(X, s, t, { y: 172, size: 76, label: null });
      const y = hd.end + 30;
      return hd.html + ctaButton(X, y, t) +
        card({ x: X + 150, y: y + 190, w: 280, h: 370, k: 'ko-padel-b', pos: '50% 50%', rot: -8, t, z: 2 }) +
        card({ x: X + 650, y: y + 190, w: 280, h: 370, k: 'ko-cans', pos: '50% 50%', rot: 8, t, z: 2 }) +
        card({ x: X + 375, y: y + 140, w: 330, h: 450, k: s.photo, pos: s.pos, t, z: 3 });
    },
  ],

  '02-who-we-are': [
    // 1 cover: the team, a second card running into slide 2
    (s, X, t, i) => {
      const hd = head(X, { title: oneLine(s.title) }, t, { label: s.kicker, size: 140, body: s.body, bw: 800 });
      return hd.html +
        card({ x: X + 150, y: 600, w: 640, h: 580, k: s.photo, pos: s.pos, t, z: 2 }) +
        card({ x: X + 830, y: 760, w: 360, h: 420, k: s.photo2, pos: s.pos2, t, z: 3, border: 'border:6px solid #fff' }) +
        frost({ x: X + 110, y: 1060, w: 300, h: 76, r: 20, t, z: 4, inner:
          `<div class="t nw" style="left:24px;top:0;height:76px;display:flex;align-items:center;gap:12px;font-size:23px;font-weight:600;color:${INK}">${sparkle(BURG, 16)}In house team</div>` });
    },
    // 2 the problem: three teams, three directions
    (s, X, t, i) => {
      const hd = head(X, { ...s, chips: null }, t);
      const sc = [
        { x: 175, y: 640, rot: -10, k: 'ko-site-strategy', p: '22% 50%' },
        { x: 440, y: 590, rot: 5, k: s.photo, p: s.pos },
        { x: 720, y: 660, rot: -3, k: 'ko-golf-swing', p: '50% 50%' },
      ];
      return hd.html + deboss(i, -30, 1050, 220) + sc.map((c, k) =>
        card({ x: X + c.x, y: c.y, w: 270, h: 360, k: c.k, pos: c.p, rot: c.rot, t, z: k + 2 }) +
        `<div class="a" style="left:${X + c.x + 26}px;top:${c.y + 384}px;transform:rotate(${c.rot}deg);z-index:8"><div class="t nw" style="position:relative">${pill(s.chips[k], CREAM_INK, BURG, { size: 22, h: 52 })}</div></div>`).join('');
    },
    // 3 one roof: three disciplines converge into one photo of the team at work
    (s, X, t, i) => {
      const hd = head(X, s, t);
      const tx = [210, 540, 870];
      return hd.html +
        ['Strategy', 'Content', 'Ads'].map((w, k) => `<div class="t nw" style="left:${X + tx[k] - 115}px;width:230px;top:590px;display:flex;justify-content:center;z-index:6">${pill(w, BURG, '#fff', { size: 22, h: 54 })}</div>`).join('') +
        `<svg class="a" style="left:${X}px;top:644px;z-index:3" width="${W}" height="140" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-linecap="round">
          <path d="M210 4 C210 80, 540 60, 540 136"/><path d="M540 4 V136"/><path d="M870 4 C870 80, 540 60, 540 136"/></svg>` +
        card({ x: X + M, y: 780, w: W - 2 * M, h: 400, k: s.photo, pos: s.pos, t, z: 4, inner:
          `<div class="a" style="left:50%;bottom:26px;transform:translateX(-50%);padding:10px 42px;border-radius:22px;background:rgba(255,255,255,.74);backdrop-filter:blur(14px);border:1.5px solid rgba(255,255,255,.85)"><span class="serif" style="font-size:62px;color:${INK}">Growth</span></div>` });
    },
    // 4 + 5: five frosted step bars running from slide 4 into slide 5, numbers on 4, descriptions on 5
    (s, X, t, i) => {
      const hd = head(X, s, t);
      let h = hd.html + deboss(i, -40, 1060, 200);
      s.steps.forEach((st, k) => {
        const y = 586 + k * 122;
        h += frost({ x: X + M, y, w: 2 * W - 2 * M, h: 106, r: 26, t, z: 3 }) +
          `<div class="t nw" style="left:${X + M + 22}px;top:${y + 15}px;display:flex;align-items:center;gap:24px;z-index:5">${circle(st.n, 76, BURG, '#fff')}<span class="serif" style="font-size:42px;color:${INK}">${st.label}</span></div>` +
          `<div class="t body" style="left:${X + W + M}px;top:${y}px;height:106px;width:880px;display:flex;align-items:center;font-size:25px;line-height:1.35;color:rgba(26,19,16,.8);z-index:5">${st.desc}</div>`;
      });
      return h;
    },
    (s, X, t, i) => head(X, s, t).html + deboss(i, 380, 1070, 190),
    // 6 CTA: the KO phone, two cards behind it
    (s, X, t, i) => {
      const hd = head(X, s, t, { y: 160, size: 76, label: null, bw: 820 });
      const y = hd.end + 26;
      return hd.html + ctaButton(X, y, t) +
        card({ x: X + 150, y: y + 210, w: 290, h: 380, k: 'ko-golf-crowd', pos: '50% 50%', rot: -7, t, z: 2 }) +
        card({ x: X + 640, y: y + 210, w: 290, h: 380, k: s.photo, pos: s.pos, rot: 7, t, z: 2 }) +
        phone({ x: X + 410, y: y + 120, w: 260, k: 'ko-ugc-beach', pos: '50% 40%', t });
    },
  ],

  '03-what-we-do': [
    // 1 cover: three cards, a fourth running into slide 2
    (s, X, t, i) => {
      const hd = head(X, { title: oneLine(s.title) }, t, { label: s.kicker, size: 140, body: s.body, bw: 800 });
      return hd.html +
        card({ x: X + 110, y: 700, w: 280, h: 400, k: 'ko-food', pos: '50% 50%', rot: -6, t, z: 2 }) +
        card({ x: X + 690, y: 700, w: 280, h: 400, k: 'ko-padel-a', pos: '45% 40%', rot: 6, t, z: 2 }) +
        card({ x: X + 375, y: 610, w: 330, h: 520, k: s.photo, pos: s.pos, t, z: 3 }) +
        card({ x: X + 990, y: 780, w: 230, h: 330, k: s.photo2, pos: s.pos2, t, z: 1 });
    },
    // 2 the twelve home-page services in one frosted panel
    (s, X, t, i) => {
      const hd = head(X, s, t);
      const items = s.items.map((nm, k) => `<div class="nw" style="display:flex;align-items:center;gap:14px;height:76px;border-top:${k > 1 ? '1.5px solid rgba(76,5,12,.12)' : 'none'};font-size:24px;font-weight:600;color:${INK}">${circle(pad(k + 1), 42, BURG, '#fff')}${nm}</div>`).join('');
      return hd.html + deboss(i, 300, 1080, 170) +
        frost({ x: X + 170, y: 580, w: 838, h: 600, t, z: 4, inner:
          `<div class="t" style="left:34px;top:34px;width:770px;display:grid;grid-template-columns:1fr 1fr;column-gap:30px">${items}</div>` });
    },
    // 3 to 8: one category per slide. Site service card with the five items, a phone or a photo card beside it
    ...[0, 1, 2, 3, 4, 5].map((ci) => (s, X, t, i) => {
      const hd = head(X, { title: accentLast(s.tagline), body: s.body }, t, { label: `${s.n} / ${s.of}  ·  ${s.name}`, size: 68 });
      const usePhone = [0, 1, 3].includes(ci);
      const top = Math.max(hd.end + 56, 540);
      const rows = s.items.map((it, k) => `<div class="nw" style="display:flex;align-items:center;gap:16px;height:80px;border-top:1.5px solid rgba(76,5,12,.10);font-size:25px;font-weight:600;color:${INK}">${circle(pad(k + 1), 44, k % 2 ? BLUE : BURG, '#fff')}${it}</div>`).join('');
      const panel = `<div class="a" style="left:${X + M}px;top:${top}px;width:620px;height:580px;border-radius:28px;background:#fff;border:1.5px solid rgba(76,5,12,.10);z-index:4;${t.sh}">
          <div class="t nw" style="left:34px;top:32px;display:flex;align-items:center;gap:16px;font-size:34px;font-weight:500;color:#3a0a10">${icon(52)}${s.name}</div>
          <div class="t" style="left:34px;top:116px;width:552px">${rows}</div></div>`;
      const visual = usePhone
        ? phone({ x: X + 720, y: top + 20, w: 266, k: s.photo, pos: s.pos, t, z: 5 })
        : card({ x: X + 680, y: top + 40, w: 330, h: 500, k: s.photo, pos: s.pos, rot: 6, t, z: 5, border: 'border:6px solid #fff' });
      return hd.html + (t.b ? deboss(i, -40, 1080, 200) : '') + panel + visual;
    }),
    // 9 the four services without their own page, as frosted cards with a photo
    (s, X, t, i) => {
      const hd = head(X, s, t, { body: 'Everything else we do in house, on top of the six categories.' });
      const pics = [['ko-beauty-water', '50% 50%'], ['ko-site-social', '50% 50%'], ['ko-insights', '50% 30%'], ['ko-golf-coach', '45% 50%']];
      return hd.html + deboss(i, -40, 1090, 190) + s.items.map((it, k) => {
        const x = X + M + (k % 2) * 476, y = 586 + Math.floor(k / 2) * 302;
        return frost({ x, y, w: 460, h: 284, r: 26, t, z: 4, inner:
          `<div class="a" style="left:22px;top:22px;width:130px;height:240px;border-radius:18px;overflow:hidden"><div class="a" style="inset:0;background:url(${photo(pics[k][0])}) ${pics[k][1]}/cover;${GRADE}"></div></div>
           <div class="t serif" style="left:174px;top:26px;width:262px;font-size:32px;line-height:1.05;color:${INK};text-wrap:balance">${it.name}</div>
           <div class="t body" style="left:174px;top:${it.name.length > 16 ? 112 : 78}px;width:264px;font-size:20px;line-height:1.4;color:rgba(26,19,16,.78)">${it.desc}</div>` });
      }).join('');
    },
    // 10 CTA: the plans as frosted chips, the KO phone in front of a row of work
    (s, X, t, i) => {
      const hd = head(X, s, t, { y: 160, size: 76, label: null, bw: 860 });
      const y = hd.end + 26;
      const row = [{ x: 60, k: 'ko-padel-red', p: '40% 40%' }, { x: 300, k: 'ko-site-branding', p: '50% 50%' }, { x: 540, k: 'ko-terrace', p: '50% 50%' }, { x: 780, k: 'ko-beauty-laugh', p: '50% 30%' }];
      return hd.html + ctaButton(X, y, t) +
        row.map((r) => card({ x: X + r.x, y: y + 230, w: 230, h: 330, k: r.k, pos: r.p, r: 22, t, z: 2 })).join('') +
        phone({ x: X + 420, y: y + 116, w: 240, k: s.photo, pos: s.pos, t, z: 4 }) +
        ['Starter', 'Growth', 'Premium'].map((p, k) => frost({ x: X + [96, 700, 760][k], y: y + [150, 170, 520][k], w: 220, h: 64, r: 18, t, z: 5, inner:
          `<div class="t nw" style="left:0;width:220px;top:0;height:64px;display:flex;align-items:center;justify-content:center;gap:10px;font-size:22px;font-weight:700;color:${BURG}">${sparkle(BLUE, 14)}${p}</div>` })).join('');
    },
  ],
};

// One line of giant Source Serif 4 Italic runs through the whole panorama, so its letters are cut by the slide
// edges and carry on into the next slide. Each slide draws the same line clipped to itself, pressed tone on tone
// into its own paper: light card on light slides, burgundy card on burgundy slides. It sits under the silk ribbon and
// every card, and the paper grain overlay above it still shows through.
const BG_LINE = {
  '01-we-are-open': 'We are open \u00b7 Knock Out \u00b7 KO Marketing \u00b7 We are open \u00b7 Knock Out',
  '02-who-we-are': 'Who we are \u00b7 KO Marketing \u00b7 Knock Out \u00b7 Who we are \u00b7 KO Marketing',
  '03-what-we-do': 'What we do \u00b7 Knock Out \u00b7 KO Marketing \u00b7 What we do \u00b7 Knock Out \u00b7 KO Marketing \u00b7 What we do \u00b7 Knock Out',
};
const BG_SIZE = 600, BG_TOP = 330, BG_START = 40;
function bgLine(c, i, tone) {
  const st = tone === 'b'
    ? 'color:#430309;text-shadow:0 -3px 4px rgba(14,0,2,.75),0 3px 2px rgba(255,214,214,.17)'
    : 'color:#EEEEF1;text-shadow:0 -3px 4px rgba(60,40,30,.17),0 3px 3px rgba(255,255,255,.95)';
  return `<div class="a" style="left:${i * W}px;top:0;width:${W}px;height:${H}px;overflow:hidden;z-index:0">
    <div class="a" style="left:${BG_START - i * W}px;top:${BG_TOP}px;font-family:Serif4;font-style:italic;font-weight:600;font-size:${BG_SIZE}px;line-height:1;letter-spacing:-.035em;white-space:nowrap;${st}">${BG_LINE[c.id]}</div></div>`;
}

// One silk ribbon per carousel instead of a silk on every slide: a white satin ribbon rendered in 3D
// (ribbon/render.mjs), entering from the left edge of slide 1 and ending in a dovetail cut on free paper
// (slide 3 for 01 and 02, slide 2 for 03, whose slide 3 has no free paper).
// At z-index 1 and first in the page it sits above the grounds and the debossed line, and under every card,
// photo and phone, which all come later at z-index 1 or higher. Its path stays below the headlines and
// paragraphs and above the footer.
const ribbon = (c) =>
  `<img class="a" src="${asset(`assets/silk-ribbon-${c.id.slice(0, 2)}.png`)}" style="left:0;top:0;width:${3 * W}px;height:${H}px;z-index:1;filter:drop-shadow(0 24px 22px rgba(26,19,16,.2)) drop-shadow(0 5px 6px rgba(26,19,16,.12))">`;

export default {
  key: 'v7',
  tones: {
    '01-we-are-open': ['p', 'b', 'p', 'p', 'b', 'p'],
    '02-who-we-are': ['p', 'b', 'p', 'b', 'b', 'p'],
    '03-what-we-do': ['p', 'b', 'p', 'b', 'p', 'b', 'p', 'b', 'b', 'p'],
  },
  html(c, tones) {
    const n = c.slides.length;
    let h = ribbon(c);
    c.slides.forEach((s, i) => {
      const t = T(tones[i]);
      h += ground(i, tones[i], SITE_WHITE) + bgLine(c, i, tones[i]) + S[c.id][i](s, i * W, t, i) + system(i, n, t);
    });
    return h + progress(n, tones);
  },
};
