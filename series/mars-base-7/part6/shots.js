// MARS BASE 7, PART 6: THE CANYON (Hollow Archive SCIFI series). Tall Tale 3D + cinematic pack.
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import { Toon, INK } from './core/toon.js';
import * as FX from './core/fx.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const M = (o) => new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.1, ...o });
const glowM = (c, i = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i), toneMapped: false });
const mesh = (geo, m, x = 0, y = 0, z = 0, p) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };

const LOOK = {
  ines: { body: '#2FA89A', hat: 'none', hair: 'bob', hairCol: '#2A2220', neck: 'scarf', neckCol: '#E0B23A' },
  tomas: { body: '#F28C28', hat: 'beanie', hatCol: '#1E2230', extra: ['freckles'] },
  mei: { body: '#4CAF50', hat: 'visor', hatCol: '#2E8B3E', hair: 'long', hairCol: '#1E1A1A', extra: ['glasses'] },
  hiro: { body: '#E8782B', hat: 'none', hair: 'short', hairCol: '#8A8A92', extra: ['glasses'] },
};
const person = (k) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] });
// Mei's seed tin and the radio mic, drawn on the character card
const TIN = (g, x, y) => { g.save(); g.translate(x, y - 40); g.fillStyle = '#C9CCD6'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-46, -40, 92, 80, 12); g.fill(); g.stroke();
  g.fillStyle = '#4CAF50'; g.fillRect(-46, -8, 92, 18); g.strokeRect(-46, -8, 92, 18); g.fillStyle = INK; g.font = '900 20px Inter'; g.textAlign = 'center'; g.fillText('SEEDS', 0, -18); g.restore(); };
const MIC = (g, x, y) => { g.save(); g.translate(x, y - 30); g.fillStyle = '#3A3F55'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-22, -60, 44, 90, 18); g.fill(); g.stroke();
  g.fillStyle = '#8A97A8'; for (let i = 0; i < 4; i++) g.fillRect(-14, -50 + i * 12, 28, 5); g.fillStyle = '#E63946'; g.beginPath(); g.arc(0, 18, 7, 0, 7); g.fill(); g.restore(); };

// ── 2D cards in the series look ──
function atlasCard(t, lines, k = 1, col = '#E63946') {
  const g = ctx; const bg = g.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.42, 1100); bg.addColorStop(0, '#0E3A6E'); bg.addColorStop(1, '#03091A');
  g.save(); g.fillStyle = bg; g.fillRect(0, 0, W, H); g.translate(W / 2, H * 0.31);
  for (let r = 0; r < 4; r++) { g.strokeStyle = `rgba(74,168,255,${0.85 - r * 0.18})`; g.lineWidth = 7 - r; g.shadowColor = '#4AA8FF'; g.shadowBlur = 24; g.beginPath();
    for (let a = 0; a <= 6.3; a += 0.03) { const R = (170 + r * 34) * (1 + 0.09 * Math.sin(5 * a + t * (1.6 + r * 0.4)) + 0.04 * Math.sin(3 * a - t * 2)); a === 0 ? g.moveTo(R * Math.cos(a), R * Math.sin(a)) : g.lineTo(R * Math.cos(a), R * Math.sin(a)); }
    g.closePath(); g.stroke(); }
  g.shadowBlur = 30; g.fillStyle = '#4AA8FF'; g.font = '900 76px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ATLAS', 0, 300); g.shadowBlur = 0;
  lines.forEach((s, i) => { if (!s) return; const kk = eob(clamp(k * 1.4 - i * 0.25)); g.save(); g.translate(0, 410 + i * 88); g.scale(kk, kk); g.fillStyle = i === 0 ? col : '#FFFFFF'; g.font = `900 ${i === 0 ? 96 : 60}px Inter`;
    g.lineWidth = 12; g.strokeStyle = '#03091A'; g.strokeText(s, 0, 0); g.fillText(s, 0, 0); g.restore(); });
  g.restore();
}
function radioCard(t, { label = 'CH 3', sub = '', amp = 1, col = '199,125,255', flat = false } = {}) {
  const g = ctx; g.save(); g.fillStyle = '#0C0718'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { const x = rnd(i + Math.floor(t * 24) * 0.37) * W, y = rnd(i * 1.7 + Math.floor(t * 24)) * H; g.fillStyle = `rgba(255,255,255,${0.05 + 0.1 * rnd(i + t)})`; g.fillRect(x, y, 3, 3); }
  g.strokeStyle = 'rgba(199,125,255,0.18)'; g.lineWidth = 2; for (let y = 300; y < 1100; y += 80) { g.beginPath(); g.moveTo(80, y); g.lineTo(W - 80, y); g.stroke(); }
  const cy = 700; g.strokeStyle = `rgb(${col})`; g.lineWidth = 8; g.shadowColor = `rgb(${col})`; g.shadowBlur = 30; g.beginPath();
  for (let x = 80; x <= W - 80; x += 6) { const u = x / W; const e = flat ? 0.04 : amp * (0.35 + 0.65 * Math.abs(Math.sin(t * 7 + u * 3))); const y = cy + Math.sin(u * 40 + t * 30) * 150 * e * Math.sin(u * 3.14) + (rnd(x + Math.floor(t * 30)) - 0.5) * 40 * (flat ? 0.6 : 1); x === 80 ? g.moveTo(x, y) : g.lineTo(x, y); }
  g.stroke(); g.shadowBlur = 0;
  g.fillStyle = 'rgba(199,125,255,0.95)'; g.font = '900 46px Inter'; const lw = g.measureText(label).width + 80; g.beginPath(); g.roundRect(W / 2 - lw / 2, 230, lw, 84, 42); g.fill(); g.fillStyle = '#0C0718'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, W / 2, 274);
  if (sub) { g.fillStyle = '#FFFFFF'; g.font = '900 40px Inter'; g.fillText(sub, W / 2, 1010); }
  g.restore();
}
const pillTxt = (text, x, y, k, bg = '#2E5FA8', size = 54) => { if (k <= 0) return; const g = ctx; g.save(); g.translate(x, y); g.scale(eob(k), eob(k)); g.rotate(-0.03); g.font = `900 ${size}px Inter`; const w = g.measureText(text).width + 60;
  g.fillStyle = bg; g.strokeStyle = '#0B0B10'; g.lineWidth = 8; g.beginPath(); g.roundRect(-w / 2, -size * 0.75, w, size * 1.5, 20); g.fill(); g.stroke(); g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 4); g.restore(); };

function pipRover() {
  const g = new THREE.Group(), white = M({ color: '#ECE8E0' }), dust = M({ color: '#C46A4A' }), dark = M({ color: '#2A2F3E' });
  mesh(new THREE.BoxGeometry(0.9, 0.42, 0.7), white, 0, 0.42, 0, g); mesh(new THREE.BoxGeometry(0.92, 0.1, 0.72), dust, 0, 0.25, 0, g);
  [[-0.38, 0.32], [0.38, 0.32], [-0.38, -0.32], [0.38, -0.32]].forEach(([x, z]) => { const w = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20), dark, x, 0.16, z, g); w.rotation.x = Math.PI / 2; });
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 10), dark, 0, 0.8, 0, g);
  const head = new THREE.Group(); head.position.set(0, 1.08, 0); g.add(head); mesh(new THREE.BoxGeometry(0.62, 0.38, 0.4), white, 0, 0, 0, head);
  const eyeM = glowM('#7FD8FF', 1.6); [-0.14, 0.14].forEach((x) => { const e = mesh(new THREE.CircleGeometry(0.075, 20), eyeM, x, 0.02, 0.205, head); e.castShadow = false; });
  const lampM = glowM('#FFF2C8', 0.4); mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 16), lampM, 0.24, 0.24, 0.1, head).rotation.x = Math.PI / 2;
  g.userData = { head, eyeM, lampM }; return g;
}

// ── sets ──
function outside(E) {
  const scene = new THREE.Scene(); WD.sky(scene, { top: '#120E28', horizon: '#8A3A2E', ground: '#5A2A22' });
  WD.sunlight(scene, E, { col: '#9FB4FF', i: 0.9, pos: [-10, 14, 10], target: [20, 0, -20], box: 60, sky: '#5A4A8A', ground: '#3A1A16', hemi: 0.7 });
  { const g = new THREE.BufferGeometry(), p = new Float32Array(1200 * 3); for (let i = 0; i < 1200; i++) { const u = rnd(i) * 0.9 + 0.1, a = rnd(i + 0.5) * 6.283, s = Math.sqrt(1 - u * u); p.set([Math.cos(a) * s * 280, u * 280, Math.sin(a) * s * 280], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#FFFFFF', size: 2.5, sizeAttenuation: false, toneMapped: false }))); }
  const gnd = mesh(new THREE.PlaneGeometry(500, 500), M({ color: '#8A3E2C', roughness: 1 }), 0, 0, 0, scene); gnd.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 70; i++) { const x = (rnd(i * 3) - 0.3) * 70, z = -rnd(i * 7) * 60 + 14; if (x > 28 && x < 56 && z < -20 && z > -46) continue; mesh(new THREE.DodecahedronGeometry(0.3 + rnd(i) * 0.9, 0), M({ color: '#6E2E22', roughness: 1 }), x, 0.1, z, scene); }
  // red rocks to keep left of
  [[26, -4, 1.6], [30, -9, 1.9], [34, -14, 1.5]].forEach(([x, z, s]) => mesh(new THREE.DodecahedronGeometry(s, 0), M({ color: '#A0301E', roughness: 1 }), x, s * 0.5, z, scene));
  const white = M({ color: '#E8E6E0' }), base = new THREE.Group(); scene.add(base);
  [[0, 3, 3.2], [-6, 4.5, 2.2], [5.5, 4, 2.4]].forEach(([x, z, r]) => { mesh(new THREE.SphereGeometry(r, 32, 16, 0, 6.283, 0, 1.57), white, x, 0, z, base); mesh(new THREE.TorusGeometry(r, 0.12, 8, 40), M({ color: '#2FA89A' }), x, 0.15, z, base).rotation.x = Math.PI / 2; });
  for (let i = 0; i < 6; i++) { const w = mesh(new THREE.CircleGeometry(0.25, 16), glowM('#FFC88A', 1.4), -1.2 + i * 0.5, 1.6, 6.15, base); w.castShadow = false; }
  const canyon = new THREE.Group(); scene.add(canyon); canyon.position.set(40, 0, -60);
  for (let i = 0; i < 14; i++) { const h = 8 + rnd(i) * 10; mesh(new THREE.BoxGeometry(6 + rnd(i * 2) * 6, h, 6), M({ color: i % 2 ? '#6E2A20' : '#7E3426', roughness: 1 }), (i - 5) * 6, h / 2, (i % 2) * 8 + rnd(i) * 4, canyon); }
  // the blinking lights high on the canyon wall
  const LIGHTS = []; for (let i = 0; i < 10; i++) { const m = new THREE.MeshBasicMaterial({ color: '#2A1A3A', toneMapped: false }); const l = mesh(new THREE.SphereGeometry(0.34, 12, 10), m, 33 + i * 2.2, 5.2 + 0.3 * Math.sin(i), -44.6, scene); l.castShadow = false; LIGHTS.push(m); }
  // Base Three: dome with a door facing the rover
  const dome = new THREE.Group(); dome.position.set(44, 0, -38); scene.add(dome);
  mesh(new THREE.SphereGeometry(3.4, 32, 16, 0, 6.283, 0, 1.57), M({ color: '#B8B6B0' }), 0, 0, 0, dome); mesh(new THREE.TorusGeometry(3.4, 0.14, 8, 40), M({ color: '#6A5A8A' }), 0, 0.15, 0, dome).rotation.x = Math.PI / 2;
  const glowDoor = mesh(new THREE.BoxGeometry(1.5, 2.3, 0.1), glowM('#FFC878', 0.9), 0, 1.2, 3.28, dome); glowDoor.castShadow = false;
  const doorSlab = mesh(new THREE.BoxGeometry(1.5, 2.3, 0.22), M({ color: '#4A5068', metalness: 0.5 }), 0, 1.2, 3.42, dome);
  const frame = mesh(new THREE.BoxGeometry(1.78, 2.55, 0.1), glowM('#C77DFF', 1.2), 0, 1.2, 3.26, dome); frame.castShadow = false;
  const doorLamp = new THREE.PointLight('#FFB868', 0, 10, 1.6); doorLamp.position.set(0, 1.6, 5.2); dome.add(doorLamp);
  const sign = mesh(new THREE.BoxGeometry(1.2, 0.28, 0.06), glowM('#C77DFF', 1.3), 0, 2.85, 3.3, dome); sign.castShadow = false;
  // the crew rover
  const rv = new THREE.Group(), wht = M({ color: '#ECE8E0' }), dust = M({ color: '#C46A4A' }), drk = M({ color: '#2A2F3E' });
  mesh(new THREE.BoxGeometry(1.7, 0.7, 3.0), wht, 0, 0.85, 0, rv); mesh(new THREE.BoxGeometry(1.5, 0.7, 1.4), wht, 0, 1.5, -0.2, rv); mesh(new THREE.BoxGeometry(1.74, 0.14, 3.04), dust, 0, 0.55, 0, rv);
  const wheels = []; [[-0.95, 1], [0.95, 1], [-0.95, 0], [0.95, 0], [-0.95, -1], [0.95, -1]].forEach(([x, z]) => { const w = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20), drk, x, 0.42, z * 1.05, rv); w.rotation.z = Math.PI / 2; wheels.push(w); });
  const hl = glowM('#FFF2C8', 1.6); [-0.5, 0.5].forEach((x) => mesh(new THREE.CircleGeometry(0.16, 16), hl, x, 0.95, 1.52, rv).castShadow = false);
  const spot = new THREE.SpotLight('#FFF2C8', 40, 28, 0.5, 0.6, 1); spot.position.set(0, 1, 1.5); spot.target.position.set(0, 0.5, 8); rv.add(spot); rv.add(spot.target);
  scene.add(rv);
  return { scene, LIGHTS, dome, doorSlab, glowDoor, doorLamp, frame, sign, rv, wheels };
}
function cabin(E, windTex) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0B0F1A'); scene.environment = E.envMap; scene.environmentIntensity = 0.8;
  const wall = M({ color: '#4A5368' }), dark = M({ color: '#262C3C' });
  const fl = mesh(new THREE.PlaneGeometry(6, 10), M({ color: '#2A3248' }), 0, 0, -4, scene); fl.rotation.x = -Math.PI / 2;
  [-1, 1].forEach((s) => { const sw = mesh(new THREE.PlaneGeometry(10, 3.4), wall, s * 2.4, 1.7, -4, scene); sw.rotation.y = -s * Math.PI / 2; });
  const ce = mesh(new THREE.PlaneGeometry(6, 10), M({ color: '#1C2232' }), 0, 3.4, -4, scene); ce.rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(4.8, 1.0, 0.9), dark, 0, 0.5, -6.6, scene);
  mesh(new THREE.BoxGeometry(4.8, 0.5, 0.3), wall, 0, 3.1, -7.6, scene);
  const win = mesh(new THREE.PlaneGeometry(4.8, 2.0), new THREE.MeshBasicMaterial({ map: windTex, toneMapped: false }), 0, 2.0, -7.9, scene); win.castShadow = false;
  const gl = []; for (let i = 0; i < 5; i++) gl.push(mesh(new THREE.CircleGeometry(0.09, 12), glowM(i % 2 ? '#7CFFB2' : '#F2C230', 1.4), -1.6 + i * 0.5, 1.08, -6.14, scene));
  WD.sunlight(scene, E, { col: '#C9DAFF', i: 1.0, pos: [2, 6, 2], target: [0, 0, -5], box: 8, sky: '#8FA6D9', ground: '#3A2A30', hemi: 0.9 });
  const warm = new THREE.PointLight('#FFB890', 9, 12, 1.4); warm.position.set(-1.0, 2.8, -3.5); scene.add(warm);
  return scene;
}

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.2, bloomThreshold: 0.93 };
  const shoot = (scene, people, from, to, at, at2, k, look = {}, sh = [0, 0]) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.position.x += sh[0]; cam.position.y += sh[1]; cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam)); E.render(scene, cam, { ...LK, ...look });
  };
  const OUT = outside(E);
  OUT.LIGHTS.forEach((m) => (m.color.set('#000000')));
  const wtex = (() => { const c = new THREE.PerspectiveCamera(50, 2.4, 0.1, 800); c.position.set(30, 1.8, -12); c.lookAt(44, 4, -45); OUT.rv.visible = false; OUT.dome.visible = true; const tx = WD.snapshot(E, OUT.scene, c); OUT.rv.visible = true; return tx; })();
  const CAB = cabin(E, wtex);
  const pip = pipRover(); pip.scale.setScalar(0.55); CAB.add(pip); pip.position.set(0.9, 1.0, -6.5);
  const ci = person('ines'), ct = person('tomas'), cm = person('mei'); [ci, ct, cm].forEach((p) => CAB.add(p.group));
  const oi = person('ines'), ot = person('tomas'), om = person('mei'), hiro = person('hiro'); [oi, ot, om, hiro].forEach((p) => OUT.scene.add(p.group));
  const hideOut = () => [oi, ot, om, hiro].forEach((p) => (p.group.visible = false));
  const lightsOn = (t, on) => OUT.LIGHTS.forEach((m, i) => { const b = on ? (((t * 1.15 + i * 0.31) % 1) < 0.55 ? 1 : 0.12) : 0; m.color.set('#C77DFF').multiplyScalar(0.2 + 2.4 * b * (on ? 1 : 0)); if (!on) m.color.set('#000000'); });
  const P0 = V3(8, 0, 12), P1 = V3(40.5, 0, -24), HEAD = Math.atan2(P1.x - P0.x, P1.z - P0.z);
  const drive = (t, a, b) => { const k = eio(seg(t, a, b)); OUT.rv.position.copy(mix(P0, P1, k)); OUT.rv.rotation.y = HEAD; OUT.wheels.forEach((w) => (w.rotation.x = k * 90)); return k; };
  const door = (open) => { OUT.doorSlab.position.x = 1.55 * open; OUT.doorLamp.intensity = 7 * open; OUT.glowDoor.visible = open > 0.02; };
  const cabSet = (t, mood = 'neutral') => { ci.at(0.85, 0, -4.3); ct.at(-0.85, 0, -5.2); cm.at(0.0, 0, -3.3);
    [ci, ct, cm].forEach((p, i) => p.set({ mood, blink: blink(t, i), holdR: null, armR: [10, 6], armL: [10, 6], sweat: 0, talk: 0, bob: 0 })); [ci, ct, cm].forEach((p) => (p.group.visible = true)); };
  const pipSet = (t, beep = 0) => { pip.userData.head.rotation.z = 0.12 * Math.sin(t * 9 * (beep + 0.3)); pip.userData.eyeM.color.set('#7FD8FF').multiplyScalar(1.4 + beep * 1.6 * Math.abs(Math.sin(t * 18))); };
  drive(0, 0, 1); door(0);
  const endOf = (i) => L(i + 1) - 0.06;

  // 0: leaving Base 7
  { const wn = Wd('canyon.', 0);
    add({ id: 'S01', at: 0, weather: 'dust', weatherK: 0.3, note: 'Base 7 at night, the rover rolls away toward the canyon; SOL 6 · THE CANYON', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, false); door(0); drive(t, 0.3, endOf(5)); OUT.sign.visible = true;
      shoot(OUT.scene, [], V3(-9, 2.6, 20), V3(-5, 2.4, 18), V3(8, 1.2, 8), V3(13, 1.2, 4), k, { fov: 40 }); blit();
      pillTxt('SOL 6 · THE CANYON', W / 2, 300, seg(lt, 0.1, 0.4), '#E63946', 58); } });
    cue(0.02, 'riser', { dur: 2.2, gain: 0.6 }); cue(0.3, 'swoosh'); cue(wn, 'impact', { gain: 0.5 }); }

  // 1: Tomas drives, Mei holds the tin
  { const st = cut(1), wt = Wd('tin,', 1);
    add({ id: 'S02', at: st, grade: 'night', gradeK: 0.35, note: 'rover cabin: Tomas drives, Mei hugs the seed tin', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); cabSet(t); ct.set({ mood: 'neutral', armR: [60, 50], armL: [60, 50], bob: 0.02 * Math.sin(t * 7) }); cm.set({ mood: 'sad', armR: [60, 50], holdR: TIN, look: [0, -0.4], blink: blink(t) }); pipSet(t, 0);
      shoot(CAB, [ci, ct, cm], V3(0.1, 1.5, -0.4), V3(0.0, 1.5, -1.0), V3(0.0, 1.3, -4.8), null, k, { fov: 48 }); blit(); } });
    cue(st, 'swoosh'); cue(wt, 'tick', { gain: 0.6 }); }

  // 2: Pip on the dashboard
  { const st = cut(2), wh = Wd('Hiro,', 2);
    add({ id: 'S03', at: st, grade: 'night', gradeK: 0.35, note: 'Pip close on the dashboard, eyes flashing; HIRO HIRO HIRO', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); cabSet(t); pipSet(t, 1); pip.position.set(0.3, 1.0, -6.4); [ci, ct, cm].forEach((p) => (p.group.visible = false));
      shoot(CAB, [], V3(0.4, 1.3, -3.9), V3(0.3, 1.25, -4.4), V3(0.3, 1.2, -6.4), null, k, { fov: 44 }); blit();
      ['HIRO', 'HIRO', 'HIRO'].forEach((w, i) => pillTxt(w, W / 2, 300 + i * 120, seg(t, wh + i * 0.5, wh + i * 0.5 + 0.2), '#6C7AE0', 70)); } });
    [0, 0.5, 1.0].forEach((o) => cue(wh + o, 'tick', { gain: 0.6 })); cue(st, 'swoosh'); }

  // 3: oxygen five sols
  { const st = cut(3);
    add({ id: 'S04', at: st, note: 'Atlas: AIR 5 SOLS', draw(lt, d, t, blit) { atlasCard(t, ['AIR 5 SOLS', 'OXYGEN COUNTER'], seg(lt, 0, 0.5)); } });
    cue(st, 'whoosh'); cue(st + 0.1, 'tick', { gain: 0.7 }); cue(Wd('five', 3), 'impact', { gain: 0.7 }); }

  // 4: Lena on the radio
  { const st = cut(4), wk = Wd('Keep', 4), wf = Wd('follow', 4);
    add({ id: 'S05', at: st, flash: [wf], note: 'waveform CH 3 · LENA VOSS; KEEP LEFT / FOLLOW THE LIGHTS', draw(lt, d, t, blit) {
      radioCard(t, { label: 'CH 3 · LENA VOSS', amp: 1.1 }); pillTxt('KEEP LEFT OF THE RED ROCKS', W / 2, 1010, seg(t, wk, wk + 0.25), '#E63946', 50); pillTxt('FOLLOW THE LIGHTS', W / 2, 1120, seg(t, wf, wf + 0.25), '#C77DFF', 56); } });
    cue(st, 'wind', { dur: 2.5, gain: 0.35 }); cue(wk, 'tick', { gain: 0.6 }); cue(wf, 'impact', { gain: 0.6 }); }

  // 5: the lights appear on the canyon wall
  { const st = cut(5), ws = Wd('saw', 5), wp = Wd('pattern', 5);
    add({ id: 'S06', at: st, grade: 'night', gradeK: 0.35, weather: 'dust', weatherK: 0.25, note: 'the rover sees a row of purple lights blinking high on the canyon wall', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, t > ws); door(0); drive(t, 0.3, endOf(5));
      shoot(OUT.scene, [], V3(26, 2.8, -14), V3(30, 3.0, -18), V3(44, 5, -45), V3(44, 5.5, -45), k, { fov: lerp(40, 28, k), bloom: 0.9 }); blit();
      pillTxt('SAME PATTERN AS MEI\'S NOTE', W / 2, 300, seg(t, wp - 0.4, wp - 0.1), '#F2C230', 46); } });
    cue(st, 'wind_gust', { gain: 0.5 }); cue(ws, 'magic', { gain: 0.6 }); cue(ws + 0.1, 'impact', { gain: 0.6 }); }

  // 6: Base Three is awake
  { const st = cut(6), wr = Wd('real.', 6), wa = Wd('awake.', 6);
    add({ id: 'S07', at: st, grade: 'night', gradeK: 0.35, weather: 'dust', weatherK: 0.2, note: 'Base Three dome with a glowing frame and a sign; BASE THREE · AWAKE', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(0); OUT.rv.visible = true; drive(t, 0, 1);
      shoot(OUT.scene, [], V3(34, 2.4, -22), V3(40, 2.3, -28), V3(44, 1.8, -38), null, k, { fov: lerp(38, 28, k), bloom: 0.9 }); blit();
      pillTxt('BASE THREE', W / 2, 300, seg(t, wr - 0.5, wr - 0.2), '#C77DFF', 62); FX.badge('AWAKE', W / 2, 1060, seg(t, wa, wa + 0.25), 130, '#7CFFB2'); FX.ring(lt, wa - st, W / 2, 700, 560, '#7CFFB2'); } });
    cue(st, 'swoosh'); cue(wr, 'impact', { gain: 0.7 }); cue(wa, 'boom', { gain: 0.9 }); }

  // 7: Tomas whispers
  { const st = cut(7), wn = Wd('Nobody', 7);
    add({ id: 'S08', at: st, grade: 'danger', gradeK: 0.3, note: 'cabin: Tomas, finger to lips; NOBODY TOUCHES ANYTHING', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); cabSet(t, 'worried'); ct.set({ mood: 'worried', armL: [150, 20], blink: blink(t) }); cm.set({ mood: 'worried', holdR: TIN, armR: [60, 50], blink: blink(t, 1) }); pipSet(t, 0);
      shoot(CAB, [ci, ct, cm], V3(-0.6, 1.6, -1.6), V3(-0.7, 1.6, -2.2), V3(-0.85, 1.5, -5.2), null, k, { fov: 36 }); blit();
      pillTxt('NOBODY TOUCHES ANYTHING', W / 2, 300, seg(t, wn, wn + 0.25), '#E63946', 52); } });
    cue(st, 'swoosh'); cue(wn, 'tick', { gain: 0.7 }); }

  // 8: Mei runs
  { const st = cut(8);
    add({ id: 'S09', at: st, grade: 'night', gradeK: 0.35, note: 'Mei runs from the rover to the door of Base Three', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(0); drive(t, 0, 1); om.group.visible = true; const q = eo(clamp(lt / (d * 0.95)));
      om.at(lerp(42.0, 43.1, q), 0, lerp(-24.5, -33.6, q)); om.set({ mood: 'worried', legs: 'walk', phase: t * 14, armR: [60, 50], holdR: TIN, blink: blink(t) });
      shoot(OUT.scene, [om], V3(36, 1.6, -22), V3(38, 1.6, -26), V3(42.5, 1.2, -28), V3(43.8, 1.3, -33.5), k, { fov: 42, bloom: 0.7 }); blit(); } });
    cue(st, 'swoosh'); cue(st, 'step', { dur: Math.max(1, L(9) - st), gain: 0.6 }); }

  // 9: three knocks
  { const st = cut(9), w1 = Wd('knocked', 9), w2 = Wd('Three', 9);
    const kt = [w1 + 0.1, w2 + 0.35, w2 + 1.15];
    add({ id: 'S10', at: st, grade: 'night', gradeK: 0.35, note: 'close on the door; Mei knocks three slow times', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(0); drive(t, 0, 1); om.group.visible = true; om.at(43.0, 0, -33.6);
      const kk = kt.reduce((a, x) => Math.max(a, eo(seg(t, x, x + 0.18)) * (1 - seg(t, x + 0.18, x + 0.4))), 0); om.set({ mood: 'neutral', armR: [40 + 50 * kk, 20], holdR: null, armL: [10, 6], blink: blink(t) });
      shoot(OUT.scene, [om], V3(44.6, 1.5, -28.5), V3(44.3, 1.5, -29.7), V3(43.8, 1.3, -34.2), null, k, { fov: 34, bloom: 0.7 }); blit();
      kt.forEach((x, i) => pillTxt('KNOCK', W / 2 + (i - 1) * 40, 300 + i * 110, seg(t, x, x + 0.12) * (1 - seg(t, x + 0.5, x + 0.8)), '#F2C230', 60)); } });
    kt.forEach((x) => cue(x, 'knock', { gain: 0.9 })); cue(st, 'swoosh'); }

  // 10: someone knocks back
  { const st = cut(10), wk = Wd('knocked', 10);
    add({ id: 'S11', at: st, grade: 'danger', gradeK: 0.35, note: 'tight on the door; the frame flares as something knocks back', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(0); drive(t, 0, 1); om.group.visible = true; om.at(43.0, 0, -33.6); om.set({ mood: 'worried', armR: [10, 6], armL: [10, 6], holdR: null, blink: blink(t) });
      OUT.frame.material.color.set('#C77DFF').multiplyScalar(1.2 + 1.6 * seg(t, wk, wk + 0.3) * (0.5 + 0.5 * Math.abs(Math.sin(t * 20))));
      shoot(OUT.scene, [om], V3(44.3, 1.5, -29.5), V3(44.1, 1.5, -30.8), V3(44, 1.4, -34.4), null, k, { fov: lerp(32, 26, k), bloom: 0.8 }); blit();
      pillTxt('KNOCK BACK', W / 2, 300, seg(t, wk, wk + 0.25), '#E63946', 66); } });
    cue(st, 'swoosh'); cue(wk + 0.3, 'knock', { gain: 1.0 }); cue(wk + 0.3, 'boom', { gain: 0.5 }); }

  // 11: the door opens, Hiro
  { const st = cut(11), wd = Wd('door', 11), wm = Wd('man', 11);
    add({ id: 'S12', at: st, grade: 'night', gradeK: 0.3, note: 'door slides open, warm light, Hiro in an old orange suit in the doorway', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); const op = eio(seg(t, wd, wd + 0.9)); door(op); drive(t, 0, 1);
      om.group.visible = true; om.at(42.7, 0, -33.3); om.set({ mood: 'worried', armR: [10, 6], armL: [10, 6], holdR: null, blink: blink(t) });
      hiro.group.visible = op > 0.5; hiro.at(44, 0, -33.9); hiro.set({ mood: 'neutral', blink: blink(t, 1), armR: [10, 6], armL: [10, 6], look: [0, 0] });
      shoot(OUT.scene, [om, hiro], V3(43.6, 1.6, -29), V3(43.8, 1.6, -30.2), V3(44, 1.4, -34), null, k, { fov: lerp(36, 30, k), bloom: 0.6 }); blit();
      FX.glow(W / 2, H * 0.47, 380 * op, '255,200,120', 0.22 * op); pillTxt('HIRO', W / 2, 300, seg(t, wm, wm + 0.25), '#E8782B', 80); } });
    cue(st, 'swoosh'); cue(wd, 'whoosh', { gain: 0.7 }); cue(wd + 0.1, 'magic', { gain: 0.5 }); cue(wm, 'impact', { gain: 0.8 }); }

  // 12: "You came close. Good."
  { const st = cut(12);
    add({ id: 'S13', at: st, grade: 'night', gradeK: 0.25, note: 'Hiro close-up, tired smile, Mei beside him', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(1); drive(t, 0, 1);
      hiro.group.visible = true; hiro.at(44.15, 0, -33.9); hiro.set({ mood: 'happy', talk: 0.5 + 0.5 * Math.sin(t * 14), blink: blink(t), armR: [10, 6], armL: [10, 6], look: [-0.3, 0] });
      om.group.visible = true; om.at(43.0, 0, -33.4); om.set({ mood: 'happy', armR: [10, 6], armL: [10, 6], holdR: null, blink: blink(t, 2), look: [0.3, 0] });
      shoot(OUT.scene, [hiro, om], V3(43.7, 1.6, -30.6), V3(43.7, 1.6, -31.3), V3(43.6, 1.5, -33.9), null, k, { fov: 30, bloom: 0.6 }); blit(); } });
    cue(st, 'swoosh'); cue(st, 'magic', { gain: 0.4 }); }

  // 13: he goes pale
  { const st = cut(13), wp = Wd('pale.', 13);
    add({ id: 'S14', at: st, grade: 'danger', gradeK: 0.45, note: 'Hiro looks past the camera into the dark canyon, sweating', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(1); drive(t, 0, 1);
      hiro.group.visible = true; hiro.at(44.0, 0, -33.9); const sc = seg(t, wp - 0.6, wp); hiro.set({ mood: sc > 0.1 ? 'scared' : 'worried', sweat: sc, blink: blink(t), armR: [10, 6], armL: [10, 6], look: [0.7 * sc, 0.1] });
      shoot(OUT.scene, [hiro], V3(43.5, 1.6, -30.8), V3(43.7, 1.6, -31.6), V3(44.0, 1.5, -33.9), null, k, { fov: lerp(30, 25, k), bloom: 0.6 }); blit(); } });
    cue(st, 'riser', { dur: 2.4, gain: 0.6 }); cue(wp, 'impact', { gain: 0.9 }); }

  // 14: everyone inside, it heard you
  { const st = cut(14), wq = Wd('Quick,', 14), wd2 = Wd('word.', 14), wh = Wd('heard', 14);
    add({ id: 'S15', at: st, grade: 'danger', gradeK: 0.55, note: 'wide: the crew hurries into the lit doorway; DON\'T SAY A WORD', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideOut(); lightsOn(t, true); door(1); drive(t, 0, 1); const q = eio(seg(t, wq, wh + 0.6));
      [[oi, 41.2, 0], [ot, 42.0, 0.3], [om, 42.8, 0.6]].forEach(([p, x, o]) => { p.group.visible = true; const qq = eio(seg(t, wq + o, wh + 0.8)); p.at(lerp(x, 44, qq), 0, lerp(-29.5 - o, -34.2, qq)); p.set({ mood: 'worried', legs: 'walk', phase: t * 14, holdR: p === om ? TIN : null, armR: p === om ? [60, 50] : [10, 6], armL: [10, 6], blink: blink(t) }); });
      hiro.group.visible = true; hiro.at(45.3, 0, -33.8); hiro.set({ mood: 'scared', sweat: 1, blink: blink(t), armR: [150, 20], armL: [10, 6], look: [0.6, 0.1] });
      shoot(OUT.scene, [oi, ot, om, hiro], V3(38.0, 2.0, -25), V3(40.5, 1.9, -27.5), V3(43.5, 1.3, -33), null, k, { fov: 38, bloom: 0.7 }); blit();
      pillTxt('DON\'T SAY A WORD', W / 2, 300, seg(t, wd2 - 1.1, wd2 - 0.8) * (1 - seg(t, wh - 0.1, wh)), '#E63946', 58); pillTxt('IT HEARD YOU ARRIVE', W / 2, 300, seg(t, wh, wh + 0.25), '#C77DFF', 58); } });
    cue(st, 'swoosh'); cue(wq, 'thunder', { gain: 0.5 }); cue(wh, 'boom', { gain: 1 }); }

  // 15: four sols + end card
  { const st = cut(15), ec = L(15) + 2.2;
    add({ id: 'S16', at: st, grade: 'danger', gradeK: 0.4, note: 'Atlas: AIR 4 SOLS; END CARD Part 7', draw(lt, d, t, blit) {
      atlasCard(t, ['AIR 4 SOLS', 'OXYGEN COUNTER'], seg(lt, 0, 0.5));
      if (t > ec) { const q = eio(seg(t, ec, ec + 0.4)); const g = ctx; g.save(); g.globalAlpha = q; g.fillStyle = 'rgba(10,12,22,0.92)'; g.fillRect(0, 0, W, H);
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#8A97A8'; g.font = '900 44px Inter'; g.fillText('MARS BASE 7', W / 2, 760);
        g.fillStyle = '#FFFFFF'; g.font = '900 150px Inter'; g.fillText('PART 7', W / 2, 900); g.fillStyle = '#E63946'; g.font = '900 52px Inter'; g.fillText('TOMORROW', W / 2, 1020);
        g.fillStyle = '#C9CCD6'; g.font = '700 40px Inter'; g.fillText('What is listening in the canyon?', W / 2, 1100); g.restore(); } } });
    cue(st, 'tick', { gain: 0.8 }); cue(Wd('four', 15), 'boom', { gain: 0.8 }); cue(ec, 'impact', { gain: 0.8 }); }

  return { shots: S, cues: CUES };
}
