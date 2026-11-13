// MARS BASE 7, PART 4: CHANNEL THREE (Hollow Archive SCIFI series). Tall Tale 3D + cinematic pack.
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
  ines: { body: '#2FA89A', hat: 'none', neck: 'scarf', neckCol: '#E0B23A' },
  tomas: { body: '#F28C28', hat: 'beanie', hatCol: '#1E2230', extra: ['freckles'] },
  mei: { body: '#4CAF50', hat: 'visor', hatCol: '#2E8B3E', extra: ['glasses'] },
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

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.45, bloomThreshold: 0.75 };
  const shoot = (scene, people, from, to, at, at2, k, look = {}, sh = [0, 0]) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.position.x += sh[0]; cam.position.y += sh[1]; cam.lookAt(at2 ? mix(at, at2, k) : at);
    people.forEach((p) => p.face(cam)); E.render(scene, cam, { ...LK, ...look });
  };
  // sets
  const R = room(E); const RC = radioConsole(R); const pip = pipRover(); R.add(pip);
  const OUT = outside(E);
  const ines = person('ines'), tomas = person('tomas'), mei = person('mei'); const crew = [ines, tomas, mei]; crew.forEach((p) => R.add(p.group));
  { const c = new THREE.PerspectiveCamera(50, 2, 0.1, 800); c.position.set(0, 3, 12); c.lookAt(40, 3, -60); const tx = WD.snapshot(E, OUT.scene, c);
    const win = mesh(new THREE.PlaneGeometry(3.4, 1.7), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false }), -3.2, 2.4, -7.98, R); win.castShadow = false; }
  const atlasTex = WD.canvasTex('atlasWall', 256, 256, (g, a, b) => { const gr = g.createRadialGradient(a / 2, b / 2, 10, a / 2, b / 2, 140); gr.addColorStop(0, '#1A5AA8'); gr.addColorStop(1, '#04102A'); g.fillStyle = gr; g.fillRect(0, 0, a, b);
    g.strokeStyle = '#4AA8FF'; g.lineWidth = 5; g.beginPath(); for (let t = 0; t <= 6.3; t += 0.05) { const r = 70 * (1 + 0.1 * Math.sin(5 * t)); g.lineTo(a / 2 + r * Math.cos(t), b / 2 - 10 + r * Math.sin(t)); } g.stroke(); g.fillStyle = '#4AA8FF'; g.font = '900 30px Inter'; g.textAlign = 'center'; g.fillText('ATLAS', a / 2, b - 30); });
  mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshBasicMaterial({ map: atlasTex, toneMapped: false }), 4.0, 2.4, -7.98, R).castShadow = false;
  const hideAll = () => crew.forEach((p) => (p.group.visible = false));
  const showAll = () => crew.forEach((p) => (p.group.visible = true));
  const radioLive = (t, on, amp = 1) => { RC.light.intensity = on ? 3 + 3 * amp * Math.abs(Math.sin(t * 9)) : 0; RC.lamp.material.color.set('#FF3B3B').multiplyScalar(on ? 1.2 + Math.abs(Math.sin(t * 8)) : 0.6); };
  const pipSet = (t, x, z, ry = 0, beep = 0) => { pip.position.set(x, 0, z); pip.rotation.y = ry; pip.userData.head.rotation.z = 0.08 * Math.sin(t * 3); pip.userData.eyeM.color.set('#7FD8FF').multiplyScalar(1.4 + beep * 1.6 * Math.abs(Math.sin(t * 18))); };
  const atRadio = (t, mood = 'neutral') => { showAll(); ines.at(0.2, 0, -5.4); tomas.at(1.6, 0, -5.5); mei.at(-1.3, 0, -4.8); crew.forEach((p, i) => p.set({ mood, blink: blink(t, i), holdR: null, armR: [10, 6], armL: [10, 6], sweat: 0, talk: 0, bob: 0 })); };

  // ── 0 · HOOK "A base that died twenty years ago just called us." (3 cuts in 3 s) ──
  { const a = 0, b = 1.2, c = 2.4, wc = Wd('called', 0);
    add({ id: 'S01', at: a, grade: 'night', gradeK: 0.6, note: 'dark radio console, the speaker pulses purple, red lamp blinking', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); pipSet(t, -3, -2); radioLive(t, true, 1);
      shoot(R, [], V3(0.2, 1.9, -4.6), V3(0.5, 1.75, -5.3), V3(0.6, 1.6, -6.6), null, k, { fov: 40 }); blit(); FX.glow(W * 0.42, H * 0.47, 320, '199,125,255', 0.6 + 0.4 * Math.sin(t * 9)); } });
    add({ id: 'S02', at: b, grade: 'danger', gradeK: 0.5, flash: [0.02], note: 'snap to Ines, eyes wide, lit purple from the radio', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); showAll(); tomas.group.visible = mei.group.visible = false; ines.at(0.4, 0, -5.2); ines.set({ mood: 'shock', look: [0.4, 0], blink: 0 }); radioLive(t, true);
      shoot(R, crew, V3(0.4, 1.72, -3.2), V3(0.4, 1.74, -3.6), V3(0.4, 1.68, -5.2), null, k, { fov: 34 }); blit(); } });
    add({ id: 'S03', at: c, flash: [wc - c], note: 'radio card: purple waveform, CH 3 · BASE THREE', draw(lt, d, t, blit) {
      radioCard(t, { label: 'CH 3 · BASE THREE', amp: 1 }); FX.ring(lt, wc - c, W / 2, 700, 520, '#C77DFF'); } });
    cue(0.02, 'riser', { dur: 2.2, gain: 0.6 }); cue(b, 'impact', { gain: 0.8 }); cue(c, 'swoosh'); cue(wc, 'boom', { gain: 0.8 }); }

  // ── 1-2 · PREVIOUSLY ──
  { const st = cut(1), s2 = cut(2), wl = Wd('late.', 2), wm = Wd('memory', 1);
    add({ id: 'S04', at: st, grade: 'flashback', gradeK: 0.5, note: 'PREVIOUSLY: Pip in the dark base, CORE MEMORY: PIPPIN card', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); pipSet(t, 0, -4, 0.3, 0.3); radioLive(t, false);
      shoot(R, [], V3(1.6, 1.3, -1.4), V3(1.0, 1.2, -2.0), V3(0, 0.9, -4), null, k, { fov: 40 }); blit();
      pillTxt('PREVIOUSLY', W / 2, 250, seg(lt, 0.05, 0.3), '#2E5FA8', 58); pillTxt('CORE MEMORY: PIPPIN', W / 2, 360, seg(t, wm, wm + 0.3), '#E63946', 46); } });
    add({ id: 'S05', at: s2, grade: 'flashback', gradeK: 0.5, note: 'Pip turns his lamp on Mei; YOU\'RE LATE', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); mei.group.visible = true; mei.at(-0.8, 0, -4.6); mei.set({ mood: 'shock', blink: blink(t) }); pipSet(t, 0.4, -3.6, -0.6, 0.6); pip.userData.lampM.color.set('#FFF2C8').multiplyScalar(2);
      shoot(R, [mei], V3(1.2, 1.5, -1.6), V3(0.9, 1.45, -2.0), V3(-0.5, 1.3, -4.4), null, k, { fov: 40 }); blit(); FX.glow(W * 0.38, H * 0.45, 260, '255,242,200', 0.7);
      pillTxt('"YOU\'RE LATE."', W / 2, 330, seg(t, wl - 0.2, wl + 0.1), '#F2C230', 58); pip.userData.lampM.color.set('#FFF2C8').multiplyScalar(0.4); } });
    cue(st, 'page'); cue(st + 0.05, 'swoosh'); cue(s2, 'swoosh'); cue(wl, 'impact', { gain: 0.6 }); }

  // ── 3 · ATLAS "Oxygen reserve: seven sols." ──
  { const st = cut(3);
    add({ id: 'S06', at: st, note: 'Atlas screen: AIR 7 SOLS', draw(lt, d, t, blit) { atlasCard(t, ['AIR 7 SOLS', 'OXYGEN RESERVE'], seg(lt, 0, 0.5)); } });
    cue(st, 'whoosh'); cue(st + 0.1, 'tick', { gain: 0.7 }); cue(Wd('seven', 3), 'impact', { gain: 0.7 }); }

  // ── 4 · "Base Seven log. Sol four." (exterior night) ──
  { const st = cut(4);
    add({ id: 'S07', at: st, weather: 'dust', weatherK: 0.3, note: 'night outside Base 7: white domes, lit windows, canyon to the east; BASE 7 · SOL 4', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); OUT.beacon.visible = false;
      shoot(OUT.scene, [], V3(-10, 3, 18), V3(-6, 2.5, 15), V3(0, 1.5, 0), V3(2, 1.6, 0), k, { fov: 44 }); blit();
      pillTxt('BASE 7 · SOL 4', W / 2, 300, seg(lt, 0.1, 0.4), '#2FA89A', 58); } });
    cue(st, 'swoosh'); cue(st + 0.1, 'wind_gust', { gain: 0.5 }); }

  // ── 5 · "All night, Pip kept rolling to the radio." ──
  { const st = cut(5);
    add({ id: 'S08', at: st, grade: 'night', gradeK: 0.7, note: 'dark base at night: Pip rolls across the floor to the radio console', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); radioLive(t, false); const p = eio(seg(lt, 0, d * 0.9)); pipSet(t, lerp(-2.5, 0.6, p), lerp(-2.6, -5.6, p), lerp(-0.6, 0, p), 0.2);
      shoot(R, [], V3(-3.2, 1.5, -0.6), V3(-2.6, 1.4, -1.4), V3(lerp(-2.5, 0.6, p), 0.7, lerp(-2.6, -5.6, p)), null, k, { fov: 44 }); blit(); } });
    cue(st, 'whoosh'); [0.3, 0.9, 1.5, 2.1].forEach((o) => cue(st + o, 'step', { gain: 0.3 })); }

  // ── 6 · PIP "Beep. Channel three. Three." ──
  { const st = cut(6);
    add({ id: 'S09', at: st, grade: 'night', gradeK: 0.4, note: 'close on Pip at the console, eyes flashing, CH 3 readout behind', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); radioLive(t, false); pipSet(t, 0.9, -5.6, 0.5, 1); pip.userData.head.rotation.z = 0.25 * Math.sin(t * 10);
      shoot(R, [], V3(0.0, 1.2, -3.9), V3(0.2, 1.15, -4.3), V3(1.0, 1.1, -5.8), null, k, { fov: 36 }); blit(); } });
    [0, 0.4, 0.8].forEach((o) => cue(st + o, 'tick', { gain: 0.6 })); cue(st, 'magic', { gain: 0.4 }); }

  // ── 7 · TOMAS "Channel three is dead..." ──
  { const st = cut(7);
    add({ id: 'S10', at: st, note: 'Tomas, sleepy, hand on hip at the console, Pip beside him', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); tomas.group.visible = true; tomas.at(0.2, 0, -5.2); tomas.set({ mood: 'tired', armL: [40, 60], blink: blink(t) }); pipSet(t, 1.2, -5.4, 0.4, 0.4); radioLive(t, false);
      shoot(R, [tomas], V3(-0.8, 1.5, -2.6), V3(-0.6, 1.5, -3.0), V3(0.4, 1.3, -5.4), null, k, { fov: 38 }); blit(); } });
    cue(st, 'swoosh'); }

  // ── 8 · "Tomas tuned it anyway. Just static." (dial insert) ──
  { const st = cut(8), ws = Wd('static.', 8);
    add({ id: 'S11', at: st, note: 'close on the tuning dial turning, CH 3 readout; then a flat static line', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); RC.dial.rotation.y = lerp(0, 4, eio(seg(lt, 0.2, 1.4))); radioLive(t, false);
      if (t < ws - 0.15) { shoot(R, [], V3(2.0, 1.75, -4.6), V3(2.0, 1.7, -5.0), V3(2.0, 1.55, -6.6), null, k, { fov: 34 }); blit(); }
      else radioCard(t, { label: 'CH 3', flat: true }); } });
    cue(st, 'tick', { gain: 0.6 }); cue(st + 0.5, 'tick', { gain: 0.6 }); cue(st + 1.0, 'tick', { gain: 0.6 }); cue(ws - 0.15, 'wind', { dur: 1.2, gain: 0.5 }); }

  // ── 9 · "Then, under the static, a woman." ──
  { const st = cut(9), ww = Wd('woman.', 9);
    add({ id: 'S12', at: st, grade: 'night', gradeK: 0.5, flash: [ww - st], note: 'slow push on the speaker grille; it starts to glow purple on WOMAN', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); const on = t > ww - 0.1; radioLive(t, on, 0.8);
      shoot(R, [], V3(0.6, 1.62, -5.0), V3(0.6, 1.62, -5.6), V3(0.6, 1.6, -6.6), null, k, { fov: 36 }); blit(); if (on) FX.glow(W / 2, H * 0.47, 360, '199,125,255', 0.8); } });
    cue(st, 'riser', { dur: 2.3, gain: 0.6 }); cue(ww, 'impact', { gain: 0.8 }); }

  // ── 10 · LENA "Base Three, to any crew. Do you copy?" ──
  { const st = cut(10);
    add({ id: 'S13', at: st, note: 'radio card: purple waveform speaking; SIGNAL: LIVE', draw(lt, d, t, blit) { radioCard(t, { label: 'CH 3 · BASE THREE', sub: 'SIGNAL: LIVE', amp: 1 }); } });
    cue(st, 'wind', { dur: 2.5, gain: 0.35 }); }

  // ── 11 · ATLAS "Base Three. Last contact, twenty years ago. Crew declared lost." ──
  { const st = cut(11), wl = Wd('lost.', 11);
    add({ id: 'S14', at: st, note: 'Atlas: BASE THREE / LAST CONTACT 20 YEARS / CREW: LOST', draw(lt, d, t, blit) {
      atlasCard(t, ['BASE THREE', 'LAST CONTACT: 20 YEARS', t > wl - 0.1 ? 'CREW: LOST' : ''], seg(lt, 0, 0.6), '#4AA8FF'); FX.ring(lt, wl - st, W / 2, H * 0.31, 500, '#E63946'); } });
    cue(st, 'whoosh'); cue(wl, 'impact', { gain: 0.7 }); }

  // ── 12 · TOMAS "Lost bases don't make calls, Commander." ──
  { const st = cut(12);
    add({ id: 'S15', at: st, grade: 'night', gradeK: 0.3, note: 'Tomas, sweating, forced grin, crew lit purple by the radio', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); tomas.set({ mood: 'smug', sweat: 1, blink: blink(t) }); radioLive(t, true, 0.4); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(1.8, 1.72, -3.4), V3(1.7, 1.72, -3.8), V3(1.6, 1.62, -5.5), null, k, { fov: 34 }); blit(); } });
    cue(st, 'swoosh'); }

  // ── 13 · "But that wasn't the strange part." ──
  { const st = cut(13), ws = Wd('strange', 13);
    add({ id: 'S16', at: st, grade: 'danger', gradeK: 0.6, flash: [ws - st], note: 'Ines close-up, serious, shake on STRANGE', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); ines.set({ mood: 'worried', look: [0.5, 0], blink: blink(t) }); radioLive(t, true, 0.3);
      shoot(R, crew, V3(0.25, 1.72, -3.5), V3(0.2, 1.74, -4.0), V3(0.2, 1.68, -5.4), null, k, { fov: 32 }, FX.shake(lt, [ws - st], 0.04)); blit(); } });
    cue(st, 'whoosh'); cue(ws, 'boom', { gain: 0.8 }); }

  // ── 14-15 · ATLAS signal from the canyon, 12 km east (map card) ──
  { const st = cut(14), wc = Wd('canyon.', 14), wk = Wd('kilometres', 15);
    add({ id: 'S17', at: st, note: 'map card: Base 7 dot, a dotted line east to the canyon, purple signal rings, 12 KM EAST', draw(lt, d, t, blit) {
      const g = ctx; g.save(); g.fillStyle = '#5A2418'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${120 + rnd(i) * 60},${50 + rnd(i + 1) * 30},40,0.5)`; g.beginPath(); g.ellipse(rnd(i * 3) * W, rnd(i * 5) * H, 40 + rnd(i) * 120, 20 + rnd(i) * 60, rnd(i) * 3, 0, 7); g.fill(); }
      g.strokeStyle = '#3A140E'; g.lineWidth = 26; g.beginPath(); g.moveTo(760, 300); g.bezierCurveTo(840, 600, 700, 900, 820, 1300); g.stroke();
      const bx = 260, by = 860, cx = 790, cy = 700; g.fillStyle = '#2FA89A'; g.beginPath(); g.arc(bx, by, 26, 0, 7); g.fill(); g.strokeStyle = '#0B0B10'; g.lineWidth = 6; g.stroke();
      g.fillStyle = '#FFFFFF'; g.font = '900 44px Inter'; g.textAlign = 'center'; g.fillText('BASE 7', bx, by + 80);
      const p = eio(seg(t, wc - 0.6, wc + 0.4)); g.setLineDash([24, 18]); g.strokeStyle = '#F2C230'; g.lineWidth = 10; g.beginPath(); g.moveTo(bx, by); g.lineTo(lerp(bx, cx, p), lerp(by, cy, p)); g.stroke(); g.setLineDash([]);
      if (lt > 0.2) for (let r = 0; r < 3; r++) { const q = ((t * 0.8 + r / 3) % 1); g.strokeStyle = `rgba(199,125,255,${1 - q})`; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, 40 + q * 220, 0, 7); g.stroke(); }
      g.fillStyle = '#C77DFF'; g.beginPath(); g.arc(cx, cy, 22, 0, 7); g.fill(); g.restore();
      pillTxt('NOT FROM ORBIT', W / 2, 260, seg(lt, 0.1, 0.4), '#E63946', 54); pillTxt('12 KM EAST', W / 2, 1060, seg(t, wk - 0.1, wk + 0.2), '#F2C230', 70);
      FX.ring(lt, wc - st, cx, cy, 300, '#C77DFF'); } });
    cue(st, 'swoosh'); cue(st + 0.05, 'page'); cue(wc, 'impact', { gain: 0.8 }); cue(wk, 'tick', { gain: 0.8 }); }

  // ── 16 · TOMAS "Twenty years in the dark? What's still powering it?" (exterior: the light in the canyon) ──
  { const st = cut(16);
    add({ id: 'S18', at: st, grade: 'night', gradeK: 0.4, weather: 'dust', weatherK: 0.3, note: 'outside looking east: far canyon walls and one tiny purple light blinking', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); OUT.beacon.visible = true; OUT.beacon.scale.setScalar(1 + 0.5 * Math.abs(Math.sin(t * 4)));
      shoot(OUT.scene, [], V3(9, 2.2, 3), V3(11, 2.4, 1), V3(44, 3, -43), null, k, { fov: lerp(40, 24, k), bloom: 0.9 }); blit(); } });
    cue(st, 'wind_gust', { gain: 0.6 }); }

  // ── 17-18 · ATLAS plutonium ──
  { const st = cut(17), wh = Wd('half', 18), wy = Wd('eighty-eight', 18);
    add({ id: 'S19', at: st, note: 'insert card: a glowing Pu-238 power core; its bar barely drops; HALF-LIFE: 88 YEARS', draw(lt, d, t, blit) {
      FX.insertCard(lt, seg(lt, 0, 0.3), (g, cx, cy, s) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.lineWidth = 12; g.strokeStyle = INK;
        g.fillStyle = '#8A97A8'; g.beginPath(); g.roundRect(-150, -260, 300, 440, 30); g.fill(); g.stroke();
        for (let i = 0; i < 6; i++) { g.fillStyle = '#5A647C'; g.fillRect(-190, -220 + i * 70, 40, 36); g.fillRect(150, -220 + i * 70, 40, 36); }
        const gl = g.createRadialGradient(0, -40, 10, 0, -40, 150); gl.addColorStop(0, '#FFE9A0'); gl.addColorStop(1, '#E8703A'); g.fillStyle = gl; g.beginPath(); g.roundRect(-90, -200, 180, 300, 20); g.fill(); g.stroke();
        g.fillStyle = INK; g.font = '900 64px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Pu-238', 0, -60);
        const lvl = 1 - 0.15 * eio(seg(t, wh, wh + 2.2)); g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(-150, 230, 300, 50, 14); g.fill(); g.stroke(); g.fillStyle = '#7CFFB2'; g.beginPath(); g.roundRect(-150, 230, 300 * lvl, 50, 14); g.fill(); g.stroke();
        g.restore(); }, { bg: '#2A1A3A', bg2: '#120A1E', cy: 0.42 });
      FX.glow(W / 2, H * 0.4, 420, '255,170,90', 0.5); pillTxt('HALF-LIFE: 88 YEARS', W / 2, H * 0.6, seg(t, wy - 0.1, wy + 0.2), '#E63946', 64); } });
    cue(st, 'swoosh'); cue(st + 0.1, 'magic', { gain: 0.5 }); cue(wy, 'impact', { gain: 0.9 }); }

  // ── 19-20 · "I keyed the mic." / "Base Three, this is Commander Okafor. Who is with you?" ──
  { const st = cut(19), s2 = cut(20);
    add({ id: 'S20', at: st, grade: 'night', gradeK: 0.4, note: 'Ines lifts the mic from the console', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); ines.set({ mood: 'neutral', armR: [lerp(10, 80, eo(seg(lt, 0, 0.6))), 40], holdR: MIC, blink: blink(t) }); radioLive(t, false); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(-0.7, 1.55, -2.9), V3(-0.5, 1.5, -3.2), V3(0.25, 1.25, -5.4), null, k, { fov: 38 }); blit(); } });
    add({ id: 'S21', at: s2, grade: 'night', gradeK: 0.4, note: 'over Tomas and Mei: Ines speaks into the mic, steady', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); ines.set({ mood: 'neutral', armR: [80, 40], holdR: MIC, talk: Math.abs(Math.sin(t * 12)), blink: blink(t) }); radioLive(t, false); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(-1.8, 1.8, -2.6), V3(-1.4, 1.7, -2.9), V3(0.2, 1.4, -5.4), null, k, { fov: 40 }); blit(); } });
    cue(st, 'swoosh'); cue(st + 0.3, 'tick', { gain: 0.5 }); cue(s2, 'swoosh', { gain: 0.6 }); }

  // ── 21 · "Static. Ten long seconds." ──
  { const st = cut(21);
    add({ id: 'S22', at: st, note: 'flat static line, a seconds counter ticks up 1 to 10 fast', draw(lt, d, t, blit) {
      radioCard(t, { label: 'CH 3', flat: true }); const n = Math.min(10, 1 + Math.floor(lt / (d / 10))); pillTxt(n + ' s', W / 2, 1050, 1, '#0C0718', 80); } });
    for (let i = 0; i < 6; i++) cue(st + 0.2 + i * 0.4, 'tick', { gain: 0.4 }); cue(st, 'wind', { dur: 2.5, gain: 0.4 }); }

  // ── 22 · LENA "Tell the girl. Hiro knew she would come." (70 % shock) ──
  { const st = cut(22), wh = Wd('Hiro', 22);
    add({ id: 'S23', at: st, flash: [0.02, wh - st], note: 'the waveform explodes back; HIRO badge slams in', draw(lt, d, t, blit) {
      radioCard(t, { label: 'CH 3 · BASE THREE', amp: 1.3 }); FX.badge('HIRO', W / 2, 1060, seg(t, wh, wh + 0.25), 130, '#E63946'); FX.ring(lt, wh - st, W / 2, 700, 600, '#E63946'); } });
    cue(st, 'boom', { gain: 1 }); cue(wh, 'impact', { gain: 1 }); }

  // ── 23 · TOMAS "The girl? How does she know about Mei?" ──
  { const st = cut(23);
    add({ id: 'S24', at: st, grade: 'night', gradeK: 0.3, note: 'whip to Tomas turning to look at Mei', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'shock'); tomas.set({ mood: 'shock', look: [-0.8, 0], blink: blink(t) }); radioLive(t, true, 0.3); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(1.9, 1.7, -3.0), V3(1.8, 1.7, -3.4), V3(1.6, 1.5, -5.5), null, k, { fov: 38 }); blit(); } });
    cue(st, 'whoosh'); }

  // ── 24 · "Mei didn't move. Her hands were shaking on the seed tin." ──
  { const st = cut(24), wt = Wd('tin.', 24);
    add({ id: 'S25', at: st, grade: 'danger', gradeK: 0.5, note: 'slow push on Mei, frozen, sweat; the seed tin shaking in her hands', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); mei.set({ mood: 'worried', sweat: 1, armR: [60, 50], holdR: TIN, look: [0, -0.4], blink: blink(t), bob: 2 * Math.sin(t * 40) }); radioLive(t, true, 0.2); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(-1.3, 1.6, -2.6), V3(-1.3, 1.55, -3.3), V3(-1.3, 1.35, -4.8), null, k, { fov: 34 }); blit(); } });
    cue(st, 'riser', { dur: 3.5, gain: 0.6 }); cue(wt, 'tick', { gain: 0.6 }); }

  // ── 25 · LENA "He said she would change the landing site. For him." ──
  { const st = cut(25), ws = Wd('site.', 25);
    add({ id: 'S26', at: st, flash: [ws - st], note: 'waveform; LANDING SITE? badge on SITE', draw(lt, d, t, blit) {
      radioCard(t, { label: 'CH 3 · BASE THREE', amp: 1 }); FX.badge('LANDING SITE?', W / 2, 1060, seg(t, ws, ws + 0.25), 96, '#F2C230'); } });
    cue(st, 'wind', { dur: 3, gain: 0.35 }); cue(ws, 'impact', { gain: 0.9 }); }

  // ── 26 · TOMAS "Mei. What does she mean, change the landing site?" ──
  { const st = cut(26);
    add({ id: 'S27', at: st, grade: 'danger', gradeK: 0.4, note: 'two-shot: Tomas faces Mei, Ines between them', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); atRadio(t, 'worried'); tomas.at(0.38, 0, -4.6); mei.at(-0.42, 0, -4.7); ines.at(0, 0, -5.6);
      tomas.set({ mood: 'angry', armL: [60, 40], blink: blink(t) }); mei.set({ mood: 'sad', holdR: TIN, armR: [60, 50], look: [0, -0.5], blink: blink(t, 1) }); radioLive(t, false); pipSet(t, 2.6, -5.0, 0.3);
      shoot(R, crew, V3(0, 1.6, -1.0), V3(0, 1.6, -1.4), V3(0, 1.3, -4.9), null, k, { fov: 44 }); blit(); } });
    cue(st, 'swoosh'); }

  // ── 27 · "Mei didn't answer. So I opened the flight log." ──
  { const st = cut(27), wl = Wd('log.', 27);
    add({ id: 'S28', at: st, note: 'Atlas screen: FLIGHT LOG · LANDING SITE: CHANGED · BY: redacted', draw(lt, d, t, blit) {
      atlasCard(t, ['FLIGHT LOG', t > wl - 0.1 ? 'LANDING SITE: CHANGED' : '', t > wl + 0.4 ? 'BY: ██████' : ''], seg(lt, 0, 0.5), '#F2C230'); } });
    cue(st, 'page'); cue(wl, 'impact', { gain: 0.8 }); }

  // ── 28 · ATLAS "Oxygen reserve: six sols." ──
  { const st = cut(28);
    add({ id: 'S29', at: st, grade: 'danger', gradeK: 0.4, note: 'Atlas: AIR 6 SOLS (HUD drops 7 to 6)', draw(lt, d, t, blit) { atlasCard(t, ['AIR 6 SOLS', 'OXYGEN RESERVE'], seg(lt, 0, 0.5)); } });
    cue(st, 'tick', { gain: 0.8 }); cue(Wd('six', 28), 'boom', { gain: 0.8 }); }

  // ── 29 · "Tomorrow, the log tells us what Mei did." + end card ──
  { const st = cut(29), ec = L(29) + 2.6;
    add({ id: 'S30', at: st, grade: 'night', gradeK: 0.6, note: 'Mei alone at the window, the canyon outside; then END CARD Part 5', draw(lt, d, t, blit) {
      const k = eio(clamp(lt / d)); hideAll(); mei.group.visible = true; mei.at(-3.2, 0, -6.6); mei.set({ mood: 'sad', holdR: TIN, armR: [60, 50], blink: blink(t) }); radioLive(t, false); pipSet(t, -1.8, -6.2, -0.4);
      shoot(R, [mei], V3(-1.0, 1.7, -2.6), V3(-1.4, 1.75, -3.2), V3(-3.2, 1.8, -7.6), null, k, { fov: 40 }); blit();
      if (t > ec) { const q = eio(seg(t, ec, ec + 0.4)); const g = ctx; g.save(); g.globalAlpha = q; g.fillStyle = 'rgba(10,12,22,0.9)'; g.fillRect(0, 0, W, H);
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#8A97A8'; g.font = '900 44px Inter'; g.fillText('MARS BASE 7', W / 2, 760);
        g.fillStyle = '#FFFFFF'; g.font = '900 150px Inter'; g.fillText('PART 5', W / 2, 900); g.fillStyle = '#E63946'; g.font = '900 52px Inter'; g.fillText('TOMORROW', W / 2, 1020);
        g.fillStyle = '#C9CCD6'; g.font = '700 40px Inter'; g.fillText('What did Mei change?', W / 2, 1100); g.restore(); } } });
    cue(st, 'swoosh'); cue(ec, 'impact', { gain: 0.8 }); }

  return { shots: S, cues: CUES };
}
