// Renders options A, B and C. Each carousel is one N x 1080 wide canvas cut into 1080x1350 slides.
// Usage: node build.mjs [A|B|C ...] [--only 01]   (needs playwright-core and a Chrome/Chromium binary)
import { join, resolve } from 'node:path';
import { carousels } from './content.mjs';
import { render, SRC } from './lib.mjs';
import A from './a.mjs';
import B from './b.mjs';
import C from './c.mjs';

const args = process.argv.slice(2);
const oi = args.indexOf('--only');
const only = oi >= 0 ? args.splice(oi, 2)[1] : undefined;
const keys = args.length ? args.map((a) => a.toUpperCase()) : ['A', 'B', 'C'];
for (const d of [A, B, C].filter((d) => keys.includes(d.key))) {
  await render(d, carousels, join(resolve(SRC, '..'), `option-${d.key.toLowerCase()}`), only);
}
