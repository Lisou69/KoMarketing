// Renders the v7 silk ribbons: per carousel one white satin ribbon with a dovetail-cut end, drawn in 3D with
// three.js (physical satin material, soft studio light) and saved with transparency as
// ../assets/silk-ribbon-<carousel>.png. Coordinates are panorama pixels of slides 1 to 3, so v7.mjs places
// each PNG at left 0, top 0.
// Run: cd ribbon && npm ci && node render.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../node_modules/playwright-core/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const RIBBON = { w: 3240, h: 1350 };

// Centre lines in panorama pixels (y down). Each enters from the left edge of slide 1, runs below the
// headlines and paragraphs, slips behind the cards and photos, and ends where the paper is free: above the
// KO card on slide 3, between the pills on slide 3, and above the services panel on slide 2. None turns back
// on itself, so a ribbon never overlaps itself.
const PATHS = {
  '01': [[-320, 660], [180, 645], [560, 655], [880, 650], [1160, 700], [1480, 650], [1850, 615], [2200, 595], [2560, 582], [2820, 594], [3030, 606]],
  '02': [[-320, 700], [200, 690], [600, 640], [920, 620], [1150, 650], [1480, 610], [1850, 600], [2200, 590], [2560, 612], [2900, 620]],
  '03': [[-320, 650], [200, 640], [620, 650], [960, 670], [1160, 660], [1420, 578], [1760, 542], [2030, 527]],
};

const page = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"file://${HERE}/node_modules/three/build/three.module.js",
"three/addons/":"file://${HERE}/node_modules/three/examples/jsm/"}}</script></head><body>
<script type="module">
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const W = ${RIBBON.w}, H = ${RIBBON.h};

// Centre line in panorama pixels (y down). It enters from the left edge of slide 1, passes under the
// card rows and ends on slide 3. It never turns back on itself, so the ribbon cannot overlap itself.
const pts = __PTS__
  .map(([x, y]) => new THREE.Vector3(x, -y, 0));
const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');

const NU = 1000, NV = 64, HALF = 96;
const pos = [], uv = [], idx = [];
for (let j = 0; j <= NV; j++) {
  const v = j / NV * 2 - 1;
  // dovetail cut: the middle of the end is shorter than its two points
  const uMax = 1 - 0.035 * (1 - Math.abs(v));
  for (let i = 0; i <= NU; i++) {
    const u = (i / NU) * uMax;
    const c = curve.getPointAt(u), t = curve.getTangentAt(u);
    const n2 = new THREE.Vector3(-t.y, t.x, 0).normalize();
    const twist = 0.72 * Math.sin(u * Math.PI * 2 * 1.15 + 0.5);
    const across = n2.clone().multiplyScalar(Math.cos(twist)).add(new THREE.Vector3(0, 0, Math.sin(twist)));
    const hw = HALF * (1 - 0.4 * THREE.MathUtils.smoothstep(u, 0.55, 1)) * (0.92 + 0.08 * Math.sin(u * 17));
    const normal = new THREE.Vector3().crossVectors(t, across).normalize();
    // the cross-section cups and billows like loose satin, with two soft folds running along its length
    const pleat = 30 * (v * v - 0.35) * Math.sin(u * 6.5 + 1) + 8 * Math.sin(v * Math.PI * 1.6 + u * 13) * (1 - v * v);
    const p = c.clone().addScaledVector(across, v * hw).addScaledVector(normal, pleat);
    pos.push(p.x, p.y, p.z); uv.push(u, (v + 1) / 2);
  }
}
for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
  const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
  idx.push(a, c, b, b, c, d);
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
geo.setIndex(idx); geo.computeVertexNormals(); geo.computeTangents();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 0.97;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-0.35, 1, 0.55); scene.add(key);
const fill = new THREE.DirectionalLight(0xf3f1f4, 0.5); fill.position.set(0.6, -0.4, 0.8); scene.add(fill);
const mat = new THREE.MeshPhysicalMaterial({
  color: 0xe2e2e7, roughness: 0.36, metalness: 0, side: THREE.DoubleSide,
  sheen: 1, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.4,
  anisotropy: 0.7, anisotropyRotation: 0, clearcoat: 0.15, clearcoatRoughness: 0.5,
});
scene.add(new THREE.Mesh(geo, mat));
const cam = new THREE.OrthographicCamera(0, W, 0, -H, -2000, 2000); cam.position.z = 1000;
renderer.render(scene, cam);
window.done = renderer.domElement.toDataURL('image/png');
</script></body></html>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/usr/local/bin/google-chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'],
});
const p = await browser.newPage({ viewport: { width: RIBBON.w, height: RIBBON.h } });
p.on('pageerror', (e) => console.log('page error', e.message));
for (const [id, pts] of Object.entries(PATHS)) {
  const tmp = `/tmp/ko-v7-ribbon-${id}.html`;
  writeFileSync(tmp, page.replace('__PTS__', JSON.stringify(pts)));
  await p.goto('file://' + tmp);
  await p.waitForFunction(() => window.done, null, { timeout: 120000 });
  const data = await p.evaluate(() => window.done);
  writeFileSync(join(HERE, '..', 'assets', `silk-ribbon-${id}.png`), Buffer.from(data.split(',')[1], 'base64'));
  console.log(`wrote assets/silk-ribbon-${id}.png`);
}
await browser.close();
