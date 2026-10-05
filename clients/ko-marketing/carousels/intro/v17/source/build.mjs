// Renders v11. Each carousel is one N x 1080 wide canvas cut into 1080x1350 slides.
// Usage: node build.mjs [--only 01]   (needs playwright-core and a Chrome/Chromium binary)
import { resolve } from 'node:path';
import { carousels } from './content.mjs';
import { render, SRC } from './lib.mjs';
import V5 from './v17.mjs';

const oi = process.argv.indexOf('--only');
await render(V5, carousels, resolve(SRC, '..'), oi >= 0 ? process.argv[oi + 1] : undefined);
