// Hollow Archive "clean look" sets: soft light, detailed cosy architecture, painted skies (like the reference shorts).
import * as THREE from 'three';
import { canvasTex, mat, T, signBoard, car, lamp } from './world.js';
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const sh = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
const box = (w, h, d, m, x, y, z, p) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };
const glow = (c, i = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), toneMapped: false });

// soft studio-like light: gentle warm key, strong sky fill, low-contrast soft shadows
export function softLight(scene, E, { key = '#FFE9C8', ki = 2.0, pos = [6, 9, 7], target = [0, 0, -2], sky = '#DCEBFF', ground = '#C9A27A', hemi = 1.9, box: bx = 14, env = 0.55 } = {}) {
  scene.environment = E.envMap; scene.environmentIntensity = env;
  const h = new THREE.HemisphereLight(sky, ground, hemi); scene.add(h);
  const d = new THREE.DirectionalLight(key, ki); d.position.set(...pos); d.target.position.set(...target); scene.add(d, d.target);
  d.castShadow = true; d.shadow.mapSize.set(2048, 2048); d.shadow.radius = 6; d.shadow.bias = -0.0004; d.shadow.normalBias = 0.02;
  Object.assign(d.shadow.camera, { left: -bx, right: bx, top: bx, bottom: -bx, near: 0.5, far: 80 }); d.shadow.camera.updateProjectionMatrix();
  return { hemi: h, key: d };
}
// painted sky dome with big soft cumulus clouds
export function paintedSky(scene, { top = '#2F6FC4', horizon = '#A9D2F2', night = false } = {}) {
  const tx = canvasTex('psky' + top + night, 2048, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, h * 0.05, 0, h * 0.5); gr.addColorStop(0, top); gr.addColorStop(1, horizon); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (night) { for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + rnd(i) * 0.7})`; g.fillRect(rnd(i * 3) * w, rnd(i * 7) * h * 0.55, 2, 2); } return; }
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(400, 48, 24), new THREE.MeshBasicMaterial({ map: tx, color: new THREE.Color(0.86, 0.86, 0.86), side: THREE.BackSide, toneMapped: false, fog: false })); scene.add(m);
  scene.background = new THREE.Color(horizon);
  if (!night) for (let c = 0; c < 12; c++) { // crisp cumulus billboards around the horizon
    const tx = canvasTex('cloud' + (c % 4), 1024, 512, (g, w, h) => { const n = 70, base = h * 0.8;
      g.fillStyle = '#FFFFFF'; for (let b = 0; b < n; b++) { const u = rnd(c % 4 * 31 + b) - 0.5, x = w / 2 + u * w * 0.86, hg = Math.max(0, 1 - Math.abs(u) * 1.9) * h * (0.35 + (c % 4) * 0.08), y = base - rnd(c % 4 * 17 + b) * Math.max(14, hg), r = 26 + rnd(c % 4 * 7 + b) * 46;
        g.beginPath(); g.arc(x, Math.min(y, base - r * 0.3), r, 0, 7); g.fill(); }
      g.fillRect(w * 0.1, base - 30, w * 0.8, 30); g.clearRect(0, base, w, h - base);
      g.globalCompositeOperation = 'source-atop'; const sh2 = g.createLinearGradient(0, base - h * 0.5, 0, base); sh2.addColorStop(0, 'rgba(255,255,255,0)'); sh2.addColorStop(0.55, 'rgba(225,232,244,0.6)'); sh2.addColorStop(1, 'rgba(178,192,216,1)'); g.fillStyle = sh2; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'destination-out'; const fe = g.createLinearGradient(0, 0, w, 0); fe.addColorStop(0, 'rgba(0,0,0,1)'); fe.addColorStop(0.08, 'rgba(0,0,0,0)'); fe.addColorStop(0.92, 'rgba(0,0,0,0)'); fe.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = fe; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, color: new THREE.Color(0.92, 0.92, 0.92), toneMapped: false, fog: false, depthWrite: false }));
    const a = (c < 7 ? -Math.PI / 2 + (c - 3) * 0.32 : c / 12 * Math.PI * 2) + rnd(c) * 0.15, d = 190 + rnd(c * 3) * 70; sp.position.set(Math.cos(a) * d, 30 + rnd(c * 5) * 60, Math.sin(a) * d); const sc = 90 + rnd(c * 7) * 70; sp.scale.set(sc, sc / 2, 1); scene.add(sp); }
  return m;
}
// painted wall with a soft darkening near floor and ceiling (fake ambient occlusion)
const wallTex = (col, rep) => canvasTex('w2' + col + rep, 512, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1800; i++) { g.fillStyle = sh(col, 0.94 + rnd(i) * 0.1); g.globalAlpha = 0.35; g.fillRect(rnd(i * 3) * w, rnd(i * 5) * h, 3, 3); } g.globalAlpha = 1;
  const a = g.createLinearGradient(0, 0, 0, h); a.addColorStop(0, 'rgba(0,0,0,0.22)'); a.addColorStop(0.18, 'rgba(0,0,0,0)'); a.addColorStop(0.85, 'rgba(0,0,0,0)'); a.addColorStop(1, 'rgba(0,0,0,0.25)'); g.fillStyle = a; g.fillRect(0, 0, w, h); }, [rep, 1]);
const panelTex = (col) => canvasTex('wains' + col, 512, 256, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 4; i++) { const x = i * 128 + 14; g.fillStyle = sh(col, 0.82); g.fillRect(x, 26, 100, h - 52); g.fillStyle = sh(col, 1.08); g.fillRect(x + 6, 32, 88, h - 64); g.fillStyle = sh(col, 0.92); g.fillRect(x + 6, h - 40, 88, 8); } }, [2, 1]);
function windowUnit(p, x, y, z, ry, { w = 1.6, h = 2.0, frame = '#F2E6CF', light = '#FFF6DC', blinds = true } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g); const fm = mat({ color: frame });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glow(light, 1.15)); glass.position.z = 0.01; g.add(glass);
  if (blinds) for (let i = 0; i < 10; i++) { const b = box(w, 0.05, 0.02, mat({ color: '#F4EFE4' }), 0, h / 2 - 0.1 - i * (h * 0.045), 0.03, g); b.castShadow = false; }
  box(w + 0.18, 0.12, 0.12, fm, 0, h / 2, 0.04, g); box(w + 0.3, 0.12, 0.22, fm, 0, -h / 2, 0.08, g); box(0.1, h, 0.1, fm, -w / 2, 0, 0.04, g); box(0.1, h, 0.1, fm, w / 2, 0, 0.04, g); box(0.06, h, 0.06, fm, 0, 0, 0.05, g); box(w, 0.06, 0.06, fm, 0, 0, 0.05, g);
  return g;
}
export function clock(p, x, y, z, ry = 0) { const tx = canvasTex('clock', 256, 256, (g, w, h) => { g.fillStyle = '#FFFDF4'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#2A2A33'; g.lineWidth = 12; g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.lineWidth = 6; g.beginPath(); g.moveTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.lineTo(128 + Math.cos(a) * 106, 128 + Math.sin(a) * 106); g.stroke(); }
    g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.stroke(); g.beginPath(); g.moveTo(128, 128); g.lineTo(176, 140); g.stroke(); });
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6 })); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; }
export function poster(p, text, x, y, z, ry = 0, { w = 1.1, h = 1.5, col = '#B5372E', sub = '' } = {}) {
  const tx = canvasTex('poster' + text + sub, 256, 352, (g, cw, chh) => { g.fillStyle = '#F6F1E4'; g.fillRect(0, 0, cw, chh); g.strokeStyle = '#2A2A33'; g.lineWidth = 6; g.strokeRect(10, 10, cw - 20, chh - 20);
    g.fillStyle = col; g.font = '900 52px Inter'; g.textAlign = 'center'; const ws = text.split(' '); ws.forEach((s, i) => g.fillText(s, cw / 2, 110 + i * 60));
    if (sub) { g.fillStyle = '#2A2A33'; g.font = '700 26px Inter'; g.fillText(sub, cw / 2, chh - 50); } g.fillStyle = '#9B958A'; for (let i = 0; i < 3; i++) g.fillRect(40, 220 + i * 22, cw - 80, 8); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 })); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; p.add(m); return m; }
export function pendant(p, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); box(0.02, 0.8, 0.02, mat({ color: '#2A2A33' }), 0, -0.4, 0, g);
  const sh2 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.3, 24, 1, true), mat({ color: '#2E5A44', side: THREE.DoubleSide })); sh2.position.y = -0.92; g.add(sh2);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), glow('#FFE9B0', 1.6)); b.position.y = -1.02; g.add(b); const l = new THREE.PointLight('#FFD9A0', 3, 6, 1.6); l.position.y = -1.1; g.add(l); return g; }

/** detailed room: painted walls over wood wainscot, cream ceiling with dark beams, windows with blinds and daylight,
 *  pendant lamps, a clock and posters. Floor x -w/2..w/2, back wall at z = -depth. Returns {scene, add(obj), props}. */
export function room2(E, { w = 10, depth = 9, h = 4.6, wall = '#3F7F6E', wains = '#8A5A36', floor = '#A8693E', ceiling = '#F2E6CF', beams = '#5A3A24',
  windows = [['back', -2.6], ['left', -4.5]], posters = [['EARLY RELEASE', 'back', 2.4]], clockAt = ['right', -6], lamps = true, light = '#FFF6DC' } = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#E8DCC8');
  const L = softLight(scene, E, { pos: [-7, 8, 4], target: [0, 0, -depth / 2], box: Math.max(w, depth), hemi: 2.0, ki: 1.8 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, depth + 6), mat({ map: T.planks(floor, [w / 2, (depth + 6) / 2]) })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, -depth / 2 + 3); fl.receiveShadow = true; scene.add(fl);
  const walls = [['back', 0, -depth, 0, w], ['left', -w / 2, -depth / 2, Math.PI / 2, depth], ['right', w / 2, -depth / 2, -Math.PI / 2, depth]];
  const WALL = {};
  walls.forEach(([n, x, z, ry, len]) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); WALL[n] = g;
    const up = new THREE.Mesh(new THREE.PlaneGeometry(len, h - 1.2), mat({ map: wallTex(wall, len / 3) })); up.position.set(0, 1.2 + (h - 1.2) / 2, 0); up.receiveShadow = true; g.add(up);
    const lo = new THREE.Mesh(new THREE.PlaneGeometry(len, 1.2), mat({ map: panelTex(wains), roughness: 0.6 })); lo.material.map.repeat.set(len / 2.5, 1); lo.position.set(0, 0.6, 0.01); lo.receiveShadow = true; g.add(lo);
    box(len, 0.1, 0.1, mat({ color: sh(wains, 0.8) }), 0, 1.22, 0.05, g); box(len, 0.14, 0.06, mat({ color: sh(wains, 0.6) }), 0, 0.07, 0.03, g); box(len, 0.16, 0.1, mat({ color: ceiling }), 0, h - 0.08, 0.05, g); });
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(w, depth + 6), mat({ color: ceiling })); ce.rotation.x = Math.PI / 2; ce.position.set(0, h, -depth / 2 + 3); scene.add(ce);
  for (let z = 1; z > -depth; z -= 2.2) box(w, 0.3, 0.26, mat({ map: T.planks(beams, [3, 1]) }), 0, h - 0.15, z, scene);
  box(0.3, 0.32, depth + 6, mat({ map: T.planks(beams, [1, 3]) }), -w / 4, h - 0.32, -depth / 2 + 3, scene); box(0.3, 0.32, depth + 6, mat({ map: T.planks(beams, [1, 3]) }), w / 4, h - 0.32, -depth / 2 + 3, scene);
  windows.forEach(([n, along], i) => windowUnit(WALL[n], along, 2.5, 0.02, 0, { light }));
  posters.forEach(([text, n, along, col]) => poster(WALL[n], text, along, 2.6, 0.03, 0, { col: col || '#B5372E' }));
  if (clockAt) clock(WALL[clockAt[0]], clockAt[1] + depth / 2 - 0.0, 3.4, 0.03);
  if (lamps) [[-w / 4, -2], [w / 4, -2], [0, -depth + 2.5]].forEach(([x, z]) => pendant(scene, x, h, z));
  // daylight shafts through the windows: a warm fill light near each window
  windows.forEach(([n]) => { const pl = new THREE.PointLight('#FFF0D0', 4, 10, 1.4); const wpos = new THREE.Vector3(); WALL[n].getWorldPosition(wpos); pl.position.set(wpos.x * 0.8, 2.6, wpos.z * 0.8 || -depth + 1); scene.add(pl); });
  return { scene, light: L, walls: WALL, add: (o) => (scene.add(o), o) };
}

// brick facade with stone quoins, cornice and a grid of sash windows
const brickFront = (col, wcols, wrows, seed, lit = false) => canvasTex('bf' + col + wcols + wrows + seed + lit, 512, 768, (g, w, h) => {
  g.fillStyle = sh(col, 0.62); g.fillRect(0, 0, w, h); const bh = 18, bw = 46;
  for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) { const x = c * bw + (r % 2) * bw / 2; g.fillStyle = sh(col, 0.88 + rnd(r * 31 + c + seed) * 0.24); g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4); }
  g.fillStyle = '#EDE6D6'; for (let y = 0; y < h; y += 56) { const k = (y / 56) % 2; g.fillRect(0, y, k ? 34 : 50, 50); g.fillRect(w - (k ? 34 : 50), y, k ? 34 : 50, 50); }
  g.fillStyle = '#E4DCCB'; g.fillRect(0, 0, w, 36); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 36, w, 8);
  const mx = 70, my = 80, cw = (w - mx * 2) / wcols, rh = (h - my - 40) / wrows;
  for (let r = 0; r < wrows; r++) for (let c = 0; c < wcols; c++) { const x = mx + c * cw + cw * 0.18, y = my + r * rh + rh * 0.12, ww = cw * 0.64, hh = rh * 0.7;
    g.fillStyle = '#EDE6D6'; g.fillRect(x - 8, y - 10, ww + 16, hh + 22); g.fillStyle = lit && rnd(r * 7 + c + seed) > 0.4 ? '#FFD98A' : '#2E4566'; g.fillRect(x, y, ww, hh);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x + 4, y + 4, ww * 0.35, hh - 8); g.fillStyle = '#EDE6D6'; g.fillRect(x, y + hh / 2 - 3, ww, 6); g.fillRect(x + ww / 2 - 3, y, 6, hh); }
});
/** a brick town street running along -z with stone-trimmed buildings, sidewalks, tram rails, lamps and a flag.
 *  Road x -3.5..3.5, sidewalks x ±3.5..6, fronts at x ±6. */
export function townStreet(E, { len = 60, night = false, bank = 'CITY BANK', flagAt = null } = {}) {
  const scene = new THREE.Scene(); paintedSky(scene, night ? { top: '#0F1838', horizon: '#3A3F7A', night: true } : {});
  const L = softLight(scene, E, night ? { key: '#8FA4E8', ki: 0.55, sky: '#2E3A70', ground: '#1A1424', hemi: 0.55, env: 0.12, pos: [-6, 12, 6] } : { pos: [8, 14, 6], box: 22, hemi: 1.8, ki: 2.2 });
  if (night) scene.fog = new THREE.Fog('#2A2E5A', 30, 120);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, len + 40), mat({ map: canvasTex('asph' + night, 256, 512, (g, w, h) => { g.fillStyle = '#8E8A86'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = sh('#8E8A86', 0.85 + rnd(i) * 0.3); g.fillRect(rnd(i * 2) * w, rnd(i * 3) * h, 2, 2); }
    [0.33, 0.4, 0.6, 0.67].forEach((x) => { g.fillStyle = '#5E5A56'; g.fillRect(x * w - 2, 0, 5, h); g.fillStyle = '#D8D4CE'; g.fillRect(x * w - 1, 0, 2, h); }); g.fillStyle = 'rgba(70,66,62,0.18)'; [0.36, 0.635].forEach((x) => g.fillRect(x * w - 14, 0, 28, h)); }, [1, (len + 40) / 6]) })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0, -len / 2 + 10); road.receiveShadow = true; scene.add(road);
  const slab = canvasTex('slab', 256, 256, (g, w, h) => { g.fillStyle = '#D6D0C4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#B8B1A4'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [1, (len + 40) / 2.5]);
  [-1, 1].forEach((s) => { const sw = box(2.5, 0.18, len + 40, mat({ map: slab }), s * 4.75, 0.09, -len / 2 + 10, scene); box(0.16, 0.2, len + 40, mat({ color: '#B8B1A4' }), s * 3.52, 0.1, -len / 2 + 10, scene);
    let z = 10, k = s > 0 ? 0 : 3; const pal = ['#B5553C', '#9E4A3A', '#C9704E', '#A85A48', '#8E4436'];
    while (z > -len) { const wd = 6 + rnd(k) * 3, ht = 8 + rnd(k * 3) * 7, cols = Math.round(wd / 2), rows = Math.round(ht / 3), col = pal[k % pal.length];
      const front = mat({ map: brickFront(col, cols, rows, k, night) }), side = mat({ color: sh(col, 0.8) });
      const b = new THREE.Mesh(new THREE.BoxGeometry(6, ht, wd), s < 0 ? [front, side, side, side, side, side] : [side, front, side, side, side, side]);
      b.position.set(s * 9, ht / 2, z - wd / 2); b.castShadow = b.receiveShadow = true; scene.add(b);
      box(0.4, 0.35, wd + 0.2, mat({ color: '#E4DCCB' }), s * 5.9, ht - 0.2, z - wd / 2, scene);
      if (k % 3 === 1) { // a columned portico door, with a sign
        const pz = z - wd / 2, px = s * 5.7; [-0.9, 0.9].forEach((dz) => box(0.3, 2.8, 0.3, mat({ color: '#F2EEE4' }), px, 1.4, pz + dz, scene));
        const ped = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.7, 3), mat({ color: '#F2EEE4' })); ped.rotation.set(0, s > 0 ? 0 : Math.PI, Math.PI / 2 * 0); ped.position.set(px, 3.15, pz); ped.scale.set(0.35, 1, 1.4); scene.add(ped);
        box(0.12, 2.4, 1.2, mat({ color: '#5A3A24' }), s * 5.97, 1.2, pz, scene); [0, 1, 2].forEach((i) => box(0.5 + i * 0.25, 0.12, 2.4, mat({ color: '#E4DCCB' }), s * (5.6 - i * 0.12), 0.06 + i * 0.12, pz, scene));
        if (bank && k === 1) { const sg = signBoard(bank, { w: 1.6, h: 0.32, bg: '#2A3048', fg: '#F2EEE4', font: 'Inter' }); sg.position.set(s * 5.5, 3.0, pz); sg.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(sg); } }
      z -= wd + 0.05; k++; }
    for (let zz = 4; zz > -len; zz -= 10) { const l = lamp(); l.position.set(s * 3.9, 0.18, zz); scene.add(l); if (night) { const pl = new THREE.PointLight('#FFC27A', 9, 9, 1.5); pl.position.set(s * 3.9, 3.6, zz); scene.add(pl); const b = l.children[l.children.length - 1]; if (b && b.material) { b.material = b.material.clone(); b.material.emissive = new THREE.Color('#FFC27A'); b.material.emissiveIntensity = 3; } } }
    for (let zz = -3; zz > -len; zz -= 14) { const pl = box(0.6, 0.45, 0.6, mat({ color: '#B8B1A4' }), s * 5.5, 0.4, zz, scene); [[-0.15, 0], [0.15, 0.1], [0, -0.15]].forEach(([dx, dz], i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), mat({ color: ['#E63946', '#F2C230', '#F28CB5'][i] })); f.position.set(s * 5.5 + dx, 0.72, zz + dz); scene.add(f); }); }
  });
  { const hyd = new THREE.Group(); box(0.25, 0.5, 0.25, mat({ color: '#C8352E' }), 0, 0.43, 0, hyd); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), mat({ color: '#C8352E' })); cap.position.y = 0.7; hyd.add(cap); hyd.position.set(-3.9, 0.18, -8); scene.add(hyd); }
  if (flagAt) { const [fx, fz] = flagAt; box(0.08, 9, 0.08, mat({ color: '#E8E6E0', metalness: 0.5 }), fx, 4.5, fz, scene);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1, 12, 4), new THREE.MeshStandardMaterial({ map: canvasTex('flag', 256, 160, (g, w, h) => { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#F4EFE4' : '#B5372E'; g.fillRect(0, i * h / 7, w, h / 7); } g.fillStyle = '#2E4E8A'; g.fillRect(0, 0, w * 0.42, h * 0.55); }), side: THREE.DoubleSide }));
    fl.position.set(fx + 0.92, 8.3, fz); scene.add(fl); scene.userData.flag = fl; }
  const cars = [[1.6, -14, '#2A3048'], [-1.6, -26, '#7A2E2E']].map(([x, z, c]) => { const v = car(c); v.position.set(x, 0, z); if (x < 0) v.rotation.y = Math.PI; scene.add(v); return v; });
  return { scene, light: L, cars, wave(t) { const f = scene.userData.flag; if (!f) return; const p = f.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(x * 3 + t * 6) * 0.08 * (x + 0.9)); } p.needsUpdate = true; } };
}
