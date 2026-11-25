// MARS BASE 7, PART 5: THE LANDING SITE (Hollow Archive SCIFI series). Tall Tale 3D + cinematic pack.
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
  hiro: { body: '#6C7AE0', hat: 'none', hair: 'short', hairCol: '#3A3A44', extra: ['glasses'] },
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

function room(E) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0B0F1A'); scene.environment = E.envMap; scene.environmentIntensity = 0.35;
  const panel = WD.canvasTex('mb7panel', 256, 256, (g, a, b) => { g.fillStyle = '#596276'; g.fillRect(0, 0, a, b); g.fillStyle = '#6B7489'; g.fillRect(10, 10, a - 20, b / 2 - 15); g.fillRect(10, b / 2 + 5, a - 20, b / 2 - 15);
    g.strokeStyle = 'rgba(15,20,35,0.5)'; g.lineWidth = 6; g.strokeRect(10, 10, a - 20, b / 2 - 15); g.strokeRect(10, b / 2 + 5, a - 20, b / 2 - 15); }, [6, 2]);
  const tiles = WD.canvasTex('mb7floor', 256, 256, (g, a, b) => { g.fillStyle = '#2A3248'; g.fillRect(0, 0, a, b); g.strokeStyle = '#1B2133'; g.lineWidth = 8; g.strokeRect(0, 0, a, b); g.fillStyle = '#323B54'; g.fillRect(20, 20, 30, 30); }, [8, 8]);
  const fl = mesh(new THREE.PlaneGeometry(14, 14), M({ map: tiles, roughness: 0.5 }), 0, 0, -4, scene); fl.rotation.x = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(14, 4.4), M({ map: panel }), 0, 2.2, -8, scene);
  [-1, 1].forEach((s) => { const sw = mesh(new THREE.PlaneGeometry(14, 4.4), M({ map: panel }), s * 6, 2.2, -4, scene); sw.rotation.y = -s * Math.PI / 2; });
  const ce = mesh(new THREE.PlaneGeometry(14, 14), M({ color: '#1C2232' }), 0, 4.4, -4, scene); ce.rotation.x = Math.PI / 2;
  for (let z = -1; z > -8; z -= 2.4) mesh(new THREE.BoxGeometry(4, 0.05, 0.25), glowM('#BFD8FF', 0.7), 0, 4.37, z, scene).castShadow = false;
  WD.sunlight(scene, E, { col: '#C9DAFF', i: 1.2, pos: [3, 8, 6], target: [0, 0, -3], box: 8, sky: '#8FA6D9', ground: '#3A2A30', hemi: 0.9 });
  const warm = new THREE.PointLight('#FF8A5A', 6, 9, 1.6); warm.position.set(-3.5, 2.6, -6.5); scene.add(warm);
  return scene;
}
function radioConsole(scene) {
  const g = new THREE.Group(); scene.add(g); g.position.set(1.4, 0, -6.6);
  mesh(new THREE.BoxGeometry(3.0, 1.1, 1.0), M({ color: '#3A4258', metalness: 0.4 }), 0, 0.55, 0, g);
  mesh(new THREE.BoxGeometry(3.0, 1.0, 0.5), M({ color: '#454E68', metalness: 0.4 }), 0, 1.6, -0.25, g);
  const grille = WD.canvasTex('grille', 128, 128, (c, a, b) => { c.fillStyle = '#1A1E2A'; c.fillRect(0, 0, a, b); c.fillStyle = '#5A647C'; for (let y = 8; y < b; y += 14) for (let x = 8; x < a; x += 14) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); } });
  const spk = mesh(new THREE.CircleGeometry(0.36, 32), M({ map: grille }), -0.8, 1.6, 0.01, g);
  const dial = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 24), M({ color: '#C9CCD6', metalness: 0.5 }), 0.4, 1.6, 0.03, g); dial.rotation.x = Math.PI / 2;
  const tick = mesh(new THREE.BoxGeometry(0.03, 0.12, 0.02), glowM('#F2C230', 1.5), 0, 0, 0, dial); tick.position.set(0, 0.06, -0.05); tick.rotation.x = -Math.PI / 2;
  const readout = WD.canvasTex('chan', 256, 96, (c, a, b) => { c.fillStyle = '#081018'; c.fillRect(0, 0, a, b); c.fillStyle = '#7CFFB2'; c.font = '900 64px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CH 3', a / 2, b / 2 + 4); });
  mesh(new THREE.PlaneGeometry(0.7, 0.26), new THREE.MeshBasicMaterial({ map: readout, toneMapped: false }), 1.05, 1.62, 0.01, g).castShadow = false;
  const lamp = mesh(new THREE.SphereGeometry(0.07, 16, 12), glowM('#FF3B3B', 1), -0.2, 1.95, 0.0, g);
  const light = new THREE.PointLight('#C77DFF', 0, 4, 1.5); light.position.set(-0.8, 1.6, 0.6); g.add(light);
  return { g, spk, dial, lamp, light };
}
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
function outside(E) {
  const scene = new THREE.Scene(); WD.sky(scene, { top: '#120E28', horizon: '#8A3A2E', ground: '#5A2A22' });
  WD.sunlight(scene, E, { col: '#9FB4FF', i: 0.9, pos: [-10, 14, 10], target: [0, 0, -10], box: 30, sky: '#5A4A8A', ground: '#3A1A16', hemi: 0.7 });
  { const g = new THREE.BufferGeometry(), p = new Float32Array(1200 * 3); for (let i = 0; i < 1200; i++) { const u = rnd(i) * 0.9 + 0.1, a = rnd(i + 0.5) * 6.283, s = Math.sqrt(1 - u * u); p.set([Math.cos(a) * s * 280, u * 280, Math.sin(a) * s * 280], i * 3); }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#FFFFFF', size: 2.5, sizeAttenuation: false, toneMapped: false }))); }
  const gnd = mesh(new THREE.PlaneGeometry(500, 500), M({ color: '#8A3E2C', roughness: 1 }), 0, 0, 0, scene); gnd.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 40; i++) mesh(new THREE.DodecahedronGeometry(0.3 + rnd(i) * 0.9, 0), M({ color: '#6E2E22', roughness: 1 }), (rnd(i * 3) - 0.5) * 60, 0.1, -rnd(i * 7) * 50 + 8, scene);
  const white = M({ color: '#E8E6E0' }), base = new THREE.Group(); scene.add(base);
  [[0, 0, 3.2], [-6, 1.5, 2.2], [5.5, 1, 2.4]].forEach(([x, z, r]) => { mesh(new THREE.SphereGeometry(r, 32, 16, 0, 6.283, 0, 1.57), white, x, 0, z, base); mesh(new THREE.TorusGeometry(r, 0.12, 8, 40), M({ color: '#2FA89A' }), x, 0.15, z, base).rotation.x = Math.PI / 2; });
  [[-3, 0.8], [2.8, 0.6]].forEach(([x, z]) => { const tb = mesh(new THREE.CylinderGeometry(0.7, 0.7, 3, 16), white, x, 0.7, z, base); tb.rotation.z = Math.PI / 2; });
  for (let i = 0; i < 6; i++) { const w = mesh(new THREE.CircleGeometry(0.25, 16), glowM('#FFC88A', 1.4), -1.2 + i * 0.5, 1.6, 3.05, base); w.castShadow = false; }
  const canyon = new THREE.Group(); scene.add(canyon); canyon.position.set(40, 0, -60);
  for (let i = 0; i < 14; i++) { const h = 6 + rnd(i) * 10; mesh(new THREE.BoxGeometry(6 + rnd(i * 2) * 6, h, 6), M({ color: i % 2 ? '#6E2A20' : '#7E3426', roughness: 1 }), (i - 7) * 6, h / 2, (i % 2) * 8 + rnd(i) * 4, canyon); }
  const beacon = mesh(new THREE.SphereGeometry(0.6, 16, 12), glowM('#C77DFF', 2), 4, 3, 17, canyon); beacon.castShadow = false;
  return { scene, beacon };
}

const noteCard = (g, cx, cy, s, t, lines, coords) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.rotate(-0.04); g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = '#F1E6C8';
  g.beginPath(); g.roundRect(-300, -330, 600, 660, 18); g.fill(); g.stroke();
  g.fillStyle = 'rgba(120,90,50,0.25)'; for (let i = 0; i < 6; i++) g.fillRect(-260, -240 + i * 92, 520, 4);
  g.fillStyle = '#2A1F14'; g.font = '700 64px "Comic Sans MS", Inter'; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => { if (l) g.fillText(l, 0, -220 + i * 92); });
  if (coords) { g.fillStyle = '#E63946'; g.font = '900 56px Inter'; g.fillText(coords, 0, 250); }
  g.restore(); };
const seedsDraw = (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.lineWidth = 8; g.strokeStyle = INK;
  g.fillStyle = '#C9CCD6'; g.beginPath(); g.roundRect(-260, -60, 520, 300, 28); g.fill(); g.stroke(); g.fillStyle = '#4CAF50'; g.fillRect(-258, 20, 516, 60); g.strokeRect(-258, 20, 516, 60);
  g.fillStyle = INK; g.font = '900 60px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SEEDS', 0, 140);
  g.fillStyle = '#E8D9A8'; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(-210 + (i % 9) * 52, -100 - Math.floor(i / 9) * 34, 20, 11, (i % 5) * 0.4, 0, 7); g.fill(); g.stroke(); }
  g.restore(); };

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
  const R = room(E); const RC = radioConsole(R); const pip = pipRover(); R.add(pip);
  const OUT = outside(E);
  const ines = person('ines'), tomas = person('tomas'), mei = person('mei'), hiro = person('hiro'); const crew = [ines, tomas, mei]; crew.forEach((p) => R.add(p.group)); R.add(hiro.group); hiro.group.visible = false;
  { const c = new THREE.PerspectiveCamera(50, 2, 0.1, 800); c.position.set(0, 3, 12); c.lookAt(40, 3, -60); const tx = WD.snapshot(E, OUT.scene, c);
    const win = mesh(new THREE.PlaneGeometry(3.4, 1.7), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }), -3.2, 2.4, -7.98, R); win.castShadow = false; }
  const atlasTex = WD.canvasTex('atlasWall', 256, 256, (g, a, b) => { const gr = g.createRadialGradient(a / 2, b / 2, 10, a / 2, b / 2, 140); gr.addColorStop(0, '#1A5AA8'); gr.addColorStop(1, '#04102A'); g.fillStyle = gr; g.fillRect(0, 0, a, b);
    g.strokeStyle = '#4AA8FF'; g.lineWidth = 5; g.beginPath(); for (let t = 0; t <= 6.3; t += 0.05) { const r = 70 * (1 + 0.1 * Math.sin(5 * t)); g.lineTo(a / 2 + r * Math.cos(t), b / 2 - 10 + r * Math.sin(t)); } g.stroke(); g.fillStyle = '#4AA8FF'; g.font = '900 30px Inter'; g.textAlign = 'center'; g.fillText('ATLAS', a / 2, b - 30); });
  mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: atlasTex, toneMapped: false }), 4.0, 2.4, -7.98, R).castShadow = false;
  const hideAll = () => { crew.forEach((p) => (p.group.visible = false)); hiro.group.visible = false; };
  const showAll = () => { crew.forEach((p) => (p.group.visible = true)); hiro.group.visible = false; };
  const radioLive = (t, on, amp = 1) => { RC.light.intensity = on ? 3 + 3 * amp * Math.abs(Math.sin(t * 9)) : 0; RC.lamp.material.color.set('#FF3B3B').multiplyScalar(on ? 1.2 + Math.abs(Math.sin(t * 8)) : 0.6); };
  const pipSet = (t, x, z, ry = 0, beep = 0) => { pip.position.set(x, 0, z); pip.rotation.y = ry; pip.userData.head.rotation.z = 0.08 * Math.sin(t * 3); pip.userData.eyeM.color.set('#7FD8FF').multiplyScalar(1.4 + beep * 1.6 * Math.abs(Math.sin(t * 18))); };
  const atRadio = (t, mood = 'neutral') => { showAll(); ines.at(0.2, 0, -5.4); tomas.at(1.6, 0, -5.5); mei.at(-1.3, 0, -4.8); crew.forEach((p, i) => p.set({ mood, blink: blink(t, i), holdR: null, armR: [10, 6], armL: [10, 6], sweat: 0, talk: 0, bob: 0 })); };

  // 0 HOOK: flight log, BY: MEI slams in on "purpose."
  { const wp = Wd('purpose.', 0), wl = Wd('landing', 0);
    add({ id: 'S01', at: 0, flash: [wp], note: 'Atlas flight log: LANDING SITE CHANGED, then BY: MEI slams in', draw(lt, d, t, blit) {
      (t > wp - 0.05 ? atlasCard(t, ['BY: MEI', 'LANDING SITE CHANGED'], seg(lt, 0, 0.35), '#E63946') : atlasCard(t, ['LANDING SITE', 'CHANGED'], seg(lt, 0, 0.35), '#F2C230')); FX.ring(lt, wp, W / 2, H * 0.31, 520, '#E63946'); } });
    cue(0.02, 'riser', { dur: 2.2, gain: 0.6 }); cue(wl, 'tick', { gain: 0.7 }); cue(wp, 'boom', { gain: 0.9 }); }

  // 1 previously
  { const st = cut(1), wc = Wd('called', 1);
    add({ id: 'S02', at: st, grade: 'flashback', gradeK: 0.5, note: 'PREVIOUSLY: radio speaker pulsing purple in the dark', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); pipSet(t, -3, -2); radioLive(t, t > wc - 0.2, 1);
      shoot(R, [], V3(0.2, 1.9, -4.4), V3(0.5, 1.75, -5.2), V3(0.6, 1.6, -6.6), null, k, { fov: 40 }); blit();
      pillTxt('PREVIOUSLY', W / 2, 250, seg(lt, 0.05, 0.3), '#2E5FA8', 58); if (t > wc - 0.2) FX.glow(W * 0.42, H * 0.47, 320, '199,125,255', 0.7); } });
    cue(st, 'page'); cue(st + 0.05, 'swoosh'); cue(wc, 'impact', { gain: 0.6 }); }

  // 2 air
  { const st = cut(2);
    add({ id: 'S03', at: st, note: 'Atlas: AIR 6 SOLS', draw(lt, d, t, blit) { atlasCard(t, ['AIR 6 SOLS', 'OXYGEN RESERVE'], seg(lt, 0, 0.5)); } });
    cue(st, 'whoosh'); cue(st + 0.1, 'tick', { gain: 0.7 }); cue(Wd('six', 2), 'impact', { gain: 0.7 }); }

  // 3 exterior sol 5
  { const st = cut(3);
    add({ id: 'S04', at: st, weather: 'dust', weatherK: 0.3, note: 'night outside Base 7; BASE 7 · SOL 5', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); OUT.beacon.visible = false;
      shoot(OUT.scene, [], V3(-10, 3, 18), V3(-6, 2.5, 15), V3(0, 1.5, 0), V3(2, 1.6, 0), k, { fov: 44 }); blit();
      pillTxt('BASE 7 · SOL 5', W / 2, 300, seg(lt, 0.1, 0.4), '#2FA89A', 58); } });
    cue(st, 'swoosh'); cue(st + 0.1, 'wind_gust', { gain: 0.5 }); }

  // 4 Mei opens the seed tin
  { const st = cut(4), wt = Wd('tin.', 4);
    add({ id: 'S05', at: st, grade: 'night', gradeK: 0.4, note: 'Mei in the dim base opens the seed tin; Ines and Tomas wait', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); mei.set({ mood: 'sad', armR: [60, 50], holdR: TIN, look: [0, -0.4], blink: blink(t) }); radioLive(t, false); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(-0.6, 1.6, -2.5), V3(-1.0, 1.55, -3.1), V3(-1.3, 1.35, -4.8), null, k, { fov: 36 }); blit(); } });
    cue(st, 'swoosh'); cue(wt, 'tick', { gain: 0.7 }); }

  // 5 Hiro (flashback figure at the Base Three console)
  { const st = cut(5), wh = Wd('Hiro', 5);
    add({ id: 'S06', at: st, grade: 'flashback', gradeK: 0.6, note: 'flashback: Hiro at the old radio console, warm light', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); hiro.group.visible = true; hiro.at(-1.5, 0, -5.4); hiro.set({ mood: 'neutral', blink: blink(t), armR: [10, 6], armL: [10, 6], look: [0.3, 0] }); pipSet(t, -3, -2); radioLive(t, false);
      shoot(R, [hiro], V3(-1.9, 1.65, -2.9), V3(-1.55, 1.68, -3.5), V3(-1.5, 1.55, -5.4), null, k, { fov: 36 }); blit();
      pillTxt('HIRO', W / 2, 300, seg(t, wh, wh + 0.25), '#6C7AE0', 76); pillTxt('BASE THREE', W / 2, 410, seg(lt, 0.9, 1.2), '#2E5FA8', 46); } });
    cue(st, 'swoosh'); cue(wh, 'impact', { gain: 0.7 }); }

  // 6 "they said he was lost" (exterior, the far light)
  { const st = cut(6), wl = Wd('lost.', 6);
    add({ id: 'S07', at: st, grade: 'night', gradeK: 0.5, weather: 'dust', weatherK: 0.3, note: 'dark canyon, one small purple light; CREW LOST', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); OUT.beacon.visible = true; OUT.beacon.scale.setScalar(1 + 0.4 * Math.abs(Math.sin(t * 4)));
      shoot(OUT.scene, [], V3(9, 2.2, 3), V3(11, 2.4, 1), V3(44, 3, -43), null, k, { fov: lerp(36, 26, k), bloom: 0.9 }); blit();
      pillTxt('DECLARED LOST', W / 2, 300, seg(t, wl - 0.5, wl - 0.2), '#E63946', 58); } });
    cue(st, 'wind_gust', { gain: 0.6 }); cue(wl, 'impact', { gain: 0.6 }); }

  // 7 note under the seeds
  { const st = cut(7), wn = Wd('note.', 7);
    add({ id: 'S08', at: st, note: 'insert card: the seed tin, then a folded note slides out', draw(lt, d, t, blit) {
      FX.insertCard(lt, seg(lt, 0, 0.3), (g, cx, cy, s) => { seedsDraw(g, cx, cy + 120, s); const p = eo(seg(t, wn - 0.5, wn + 0.2)); if (p > 0) noteCard(g, cx, cy - 120 * p, s * (0.5 + 0.4 * p), t, ['', '', '', '', ''], ''); }, { bg: '#2A1A3A', bg2: '#120A1E', cy: 0.42 });
      pillTxt('ONE OLD NOTE', W / 2, 260, seg(t, wn - 0.2, wn + 0.1), '#F2C230', 58); } });
    cue(st, 'swoosh'); cue(st + 0.1, 'magic', { gain: 0.4 }); cue(wn, 'page', { gain: 0.8 }); }

  // 8 the note text + coordinates
  { const st = cut(8), wc = Wd('coordinates.', 8);
    add({ id: 'S09', at: st, note: 'close on the handwritten note; COORDINATES in red', draw(lt, d, t, blit) {
      FX.insertCard(lt, seg(lt, 0, 0.3), (g, cx, cy, s) => noteCard(g, cx, cy, s * 1.1, t, ['Mei,', 'come close.', "I'll be", 'listening.', ''], t > wc - 0.2 ? '36.4 S · 147.2 E' : ''), { bg: '#2A1A3A', bg2: '#120A1E', cy: 0.42 }); } });
    cue(st, 'page'); cue(wc, 'impact', { gain: 0.8 }); }

  // 9 map: the landing site was moved
  { const st = cut(9), wt = Wd('Twelve', 9), wm = Wd('moved', 9);
    add({ id: 'S10', at: st, note: 'map: the landing marker slides from the safe plain to 12 km from Base Three', draw(lt, d, t, blit) {
      const g = ctx; g.save(); g.fillStyle = '#5A2418'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${120 + rnd(i) * 60},${50 + rnd(i + 1) * 30},40,0.5)`; g.beginPath(); g.ellipse(rnd(i * 3) * W, rnd(i * 5) * H, 40 + rnd(i) * 120, 20 + rnd(i) * 60, rnd(i) * 3, 0, 7); g.fill(); }
      g.strokeStyle = '#3A140E'; g.lineWidth = 26; g.beginPath(); g.moveTo(860, 300); g.bezierCurveTo(940, 600, 800, 900, 920, 1300); g.stroke();
      const ox = 200, oy = 760, nx = 700, ny = 820, cx = 900, cy = 760; const p = eio(seg(t, wm - 0.3, wm + 0.7));
      g.fillStyle = '#C77DFF'; g.beginPath(); g.arc(cx, cy, 24, 0, 7); g.fill(); g.fillStyle = '#FFFFFF'; g.font = '900 38px Inter'; g.textAlign = 'center'; g.fillText('BASE 3', cx - 30, cy + 70);
      g.globalAlpha = 1 - 0.6 * p; g.fillStyle = '#8A97A8'; g.beginPath(); g.arc(ox, oy, 26, 0, 7); g.fill(); g.strokeStyle = '#0B0B10'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#FFFFFF'; g.font = '900 36px Inter'; g.fillText('SAFE PLAIN', ox, oy + 80); g.globalAlpha = 1;
      const mx = lerp(ox, nx, p), my = lerp(oy, ny, p); g.setLineDash([24, 18]); g.strokeStyle = '#F2C230'; g.lineWidth = 10; g.beginPath(); g.moveTo(ox, oy); g.lineTo(mx, my); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#2FA89A'; g.beginPath(); g.arc(mx, my, 34, 0, 7); g.fill(); g.strokeStyle = '#0B0B10'; g.lineWidth = 7; g.stroke(); g.fillStyle = '#FFFFFF'; g.font = '900 40px Inter'; g.fillText('BASE 7', mx, my - 62);
      if (t > wt - 0.1) { g.strokeStyle = '#FFFFFF'; g.lineWidth = 6; g.beginPath(); g.moveTo(nx + 40, ny - 70); g.lineTo(cx - 40, cy - 40); g.stroke(); }
      g.restore(); pillTxt('LANDING SITE MOVED', W / 2, 260, seg(lt, 0.1, 0.4), '#E63946', 54); pillTxt('12 KM', W / 2, 1100, seg(t, wt, wt + 0.25), '#F2C230', 80); FX.ring(lt, wt - st, 800, 790, 260, '#C77DFF'); } });
    cue(st, 'swoosh'); cue(wm, 'whoosh', { gain: 0.6 }); cue(wt, 'impact', { gain: 0.9 }); }

  // 10 Tomas
  { const st = cut(10);
    add({ id: 'S11', at: st, grade: 'danger', gradeK: 0.4, note: 'Tomas angry, facing Mei', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); tomas.at(0.38, 0, -4.6); mei.at(-0.42, 0, -4.7); ines.at(0, 0, -5.6);
      tomas.set({ mood: 'angry', armL: [60, 40], blink: blink(t) }); mei.set({ mood: 'sad', holdR: TIN, armR: [60, 50], look: [0, -0.5], blink: blink(t, 1) }); radioLive(t, false); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(1.0, 1.65, -1.6), V3(0.7, 1.65, -2.1), V3(0.2, 1.4, -4.9), null, k, { fov: 40 }); blit(); } });
    cue(st, 'swoosh'); }

  // 11 Mei: "I only needed to be close enough to hear him."
  { const st = cut(11);
    add({ id: 'S12', at: st, grade: 'night', gradeK: 0.5, note: 'Mei close-up, tears, holding the tin', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); mei.set({ mood: 'sad', sweat: 0, armR: [60, 50], holdR: TIN, look: [0, -0.3], blink: blink(t) }); radioLive(t, false); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(-1.2, 1.62, -2.9), V3(-1.3, 1.6, -3.5), V3(-1.3, 1.45, -4.8), null, k, { fov: 32 }); blit(); } });
    cue(st, 'riser', { dur: 3, gain: 0.5 }); }

  // 12 Pip
  { const st = cut(12);
    add({ id: 'S13', at: st, grade: 'night', gradeK: 0.4, note: 'Pip rolls up to the radio, eyes flashing, the speaker starts to glow', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); radioLive(t, true, 0.5); pipSet(t, 0.9, -5.6, 0.5, 1); pip.userData.head.rotation.z = 0.25 * Math.sin(t * 10);
      shoot(R, [], V3(0.0, 1.2, -3.9), V3(0.2, 1.15, -4.3), V3(1.0, 1.1, -5.8), null, k, { fov: 36 }); blit(); } });
    [0, 0.3, 0.6, 0.9].forEach((o) => cue(st + o, 'tick', { gain: 0.6 })); cue(st, 'magic', { gain: 0.4 }); }

  // 13 Lena: your father is alive
  { const st = cut(13), wa = Wd('alive.', 13);
    add({ id: 'S14', at: st, flash: [wa - st], note: 'waveform; ALIVE badge slams in', draw(lt, d, t, blit) {
      radioCard(t, { label: 'CH 3 · LENA VOSS', amp: 1.2 }); FX.badge('ALIVE', W / 2, 1060, seg(t, wa, wa + 0.25), 140, '#7CFFB2'); FX.ring(lt, wa - st, W / 2, 700, 600, '#7CFFB2'); } });
    cue(st, 'wind', { dur: 2.5, gain: 0.35 }); cue(wa, 'boom', { gain: 1 }); }

  // 14 air plant online
  { const st = cut(14), wp = Wd('plant.', 14);
    add({ id: 'S15', at: st, note: 'Atlas: BASE THREE AIR PLANT: ONLINE', draw(lt, d, t, blit) {
      atlasCard(t, ['AIR PLANT', 'BASE THREE', t > wp - 0.15 ? 'ONLINE' : ''], seg(lt, 0, 0.5), '#7CFFB2'); FX.ring(lt, wp - st, W / 2, H * 0.31, 520, '#7CFFB2'); } });
    cue(st, 'whoosh'); cue(wp, 'impact', { gain: 0.9 }); }

  // 15 air 5
  { const st = cut(15);
    add({ id: 'S16', at: st, grade: 'danger', gradeK: 0.4, note: 'Atlas: AIR 5 SOLS', draw(lt, d, t, blit) { atlasCard(t, ['AIR 5 SOLS', 'OXYGEN RESERVE'], seg(lt, 0, 0.5)); } });
    cue(st, 'tick', { gain: 0.8 }); cue(Wd('five', 15), 'boom', { gain: 0.8 }); }

  // 16 tomorrow: drive to the canyon + end card
  { const st = cut(16), ec = L(16) + 2.4;
    add({ id: 'S17', at: st, grade: 'night', gradeK: 0.5, weather: 'dust', weatherK: 0.3, note: 'the crew silhouette looks at the far purple light; END CARD Part 6', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); OUT.beacon.visible = true; OUT.beacon.scale.setScalar(1 + 0.5 * Math.abs(Math.sin(t * 4)));
      shoot(OUT.scene, [], V3(9, 2.2, 3), V3(11, 2.4, 1), V3(44, 3, -43), null, k, { fov: lerp(34, 22, k), bloom: 0.9 }); blit();
      if (t > ec) { const q = eio(seg(t, ec, ec + 0.4)); const g = ctx; g.save(); g.globalAlpha = q; g.fillStyle = 'rgba(10,12,22,0.9)'; g.fillRect(0, 0, W, H);
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#8A97A8'; g.font = '900 44px Inter'; g.fillText('MARS BASE 7', W / 2, 760);
        g.fillStyle = '#FFFFFF'; g.font = '900 150px Inter'; g.fillText('PART 6', W / 2, 900); g.fillStyle = '#E63946'; g.font = '900 52px Inter'; g.fillText('TOMORROW', W / 2, 1020);
        g.fillStyle = '#C9CCD6'; g.font = '700 40px Inter'; g.fillText('Who is waiting at Base Three?', W / 2, 1100); g.restore(); } } });
    cue(st, 'wind_gust', { gain: 0.6 }); cue(ec, 'impact', { gain: 0.8 }); }

  return { shots: S, cues: CUES };
}
