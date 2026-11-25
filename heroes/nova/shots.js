// THE BANK ROBBER WHO WORE LEMON JUICE: Tall Tale 3D, the CLEAN LOOK (soft light, cosy sets, skin/hair, chalk overlays).
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as W2 from './core/world2.js';
import * as X from './core/fx2.js';
import { Toon, drawToon, INK } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z), mix = (a, b, k) => a.clone().lerp(b, k);
const SK = ['#F6D9B5', '#EBC49A', '#D9A877', '#B98457'];
const P = (look) => new Toon({ ...look, extra: [...(look.extra || [])] });
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, ...o });
const bx = (w, h, d, c, x, y, z, p) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'string' ? mat(c) : c); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (p) p.add(m); return m; };

// the robber: juice-shiny face, moustache, blue jacket

const NOVA = { body: '#7E57C2', head: SK[3], hair: 'long', hairCol: '#1B1230', hat: 'visor', hatCol: '#F2C230', neck: 'scarf', neckCol: '#F2C230' };
const BAND = { body: '#F4F1EA', pattern: 'hstripes', patCol: '#222222', head: SK[1], hat: 'beanie', hatCol: '#1A1A1A', extra: ['mustache'] };
const PHONE = (g, x, y) => { g.save(); g.translate(x, y - 20); g.fillStyle = '#2A2A33'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-24, -44, 48, 88, 10); g.fill(); g.stroke(); g.fillStyle = '#9FD8FF'; g.fillRect(-18, -36, 36, 62); g.restore(); };
const SACK = (g, x, y) => { g.save(); g.translate(x, y - 20); g.fillStyle = '#8A6A3A'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-56, -50, 112, 104, 26); g.fill(); g.stroke(); g.fillStyle = '#FFFDF4'; g.beginPath(); g.arc(0, 4, 34, 0, 7); g.fill(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(0, 4); g.lineTo(0, -16); g.moveTo(0, 4); g.lineTo(14, 10); g.stroke(); g.restore(); };
const hand = (g, cx, cy, s, wet, a) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.globalAlpha = a; g.lineWidth = 10; g.strokeStyle = INK; g.fillStyle = SK[3];
  g.beginPath(); g.roundRect(-110, -10, 220, 190, 60); g.fill(); g.stroke(); [[-90, -170], [-30, -200], [30, -190], [88, -150]].forEach(([x, y]) => { g.beginPath(); g.roundRect(x - 24, y, 48, 190, 24); g.fill(); g.stroke(); });
  g.beginPath(); g.roundRect(-170, 20, 80, 46, 23); g.fill(); g.stroke();
  if (wet) { g.fillStyle = '#7FD0FF'; [[-70, -120], [-10, -140], [50, -120], [90, -90], [-30, 30], [30, 50], [-80, 80]].forEach(([x, y], i) => { g.beginPath(); g.moveTo(x, y - 26); g.quadraticCurveTo(x + 20, y + 10, x, y + 22); g.quadraticCurveTo(x - 20, y + 10, x, y - 26); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }); }
  g.restore(); };

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.12, bloomThreshold: 0.92 };
  const shoot = (scene, ppl, from, to, at, k, fov = 36, at2 = null) => { if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at); ppl.forEach((p) => p.face(cam)); E.render(scene, cam, LK); };
  const SH = (i, o) => { const st = cut(i); add({ id: 'S' + i, at: st, note: o.note || '', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); o.setup && o.setup(t, lt, k); shoot(o.scene, o.ppl || [], o.from, o.to, o.at, k, o.fov || 38, o.at2 || null); blit(); o.over && o.over(t, lt, k); } }); cue(st, 'whoosh'); (o.cues || []).forEach((c) => cue(c[0], c[1], c[2] || {})); };
  const ch = (text, w, o = {}) => (t) => X.chalk(text, 540, o.y || 330, seg(t, w - 0.1, w + 0.3), { size: o.size || 110, col: o.col });

  const mkTown = (night) => { const T = W2.townStreet(E, { night, bank: 'CITY HALL' }); let bz = -9; T.scene.traverse((o) => { if (Math.abs(o.position.x - 5.5) < 0.01 && Math.abs(o.position.y - 3.0) < 0.01) bz = o.position.z; });
    bx(5.5, 30, 4.5, night ? '#6F5BA8' : '#B7A9D6', -5.2, 15, bz - 3.2, T.scene); for (let r = 0; r < 13; r++) for (let c = 0; c < 3; c++) bx(0.7, 0.8, 0.04, night ? '#FFE9A8' : '#7FB6E6', -6.9 + c * 1.7, 2.4 + r * 2.2, bz - 0.96, T.scene);
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.9, 14), mat('#2F8F5B')); tb.position.set(-1.0, 0.45, bz + 1.4); tb.castShadow = true; T.scene.add(tb); T.bz = bz; return T; };
  const SN = mkTown(true), SD = mkTown(false); const BZ = SN.bz;
  const MY = W2.room2(E, { wall: '#7A5A8E', wains: '#4A3560', floor: '#8E6B4A', posters: [], windows: [['left', -4.5]], clockAt: null });
  bx(2.6, 0.95, 1.1, '#6B4429', 0, 0.48, -5.5, MY.scene); bx(2.8, 0.1, 1.2, '#8A5A36', 0, 0.98, -5.5, MY.scene);
  const nova = P(NOVA), band = P(BAND), mayor = P({ body: '#6E7B8F', head: SK[2], hair: 'bald', extra: ['glasses', 'mustache'], neck: 'tie', neckCol: '#E63946' });
  const novaD = P(NOVA), bandD = P(BAND), nm = P(NOVA);
  const crowd = [0, 1, 2].map((i) => P({ body: ['#E8A24A', '#4FA0D8', '#D8607A'][i], head: SK[i], hair: ['curly', 'short', 'bob'][i], hairCol: '#3A2A22' }));
  SN.scene.add(nova.group, band.group, ...crowd.map((c) => c.group)); SD.scene.add(novaD.group, bandD.group); MY.scene.add(mayor.group, nm.group); mayor.at(0, 0, -6.5); nm.at(-1.6, 0, -3.8);
  const TX = -5.2, WZ = BZ - 0.55;                         // tower face
  const nv = (p, y, o = {}) => { p.at(TX + (o.dx || 0), y, WZ + 0.05); p.set({ mood: 'happy', blink: 0, talk: 0, ...o.set }); };
  const climb = (p, t, y, set = {}) => { p.at(TX, y, WZ + 0.05); p.set({ mood: 'happy', talk: 0, armR: [165 + Math.sin(t * 6) * 15, 20], armL: [165 - Math.sin(t * 6) * 15, 20], legs: 'walk', phase: t * 6, look: [0, 0], blink: blink(t), ...set }); };
  const FR = (a, b) => V3(a, b, 0);

  // 0 hook
  { const w = Wd('truth.', 0); SH(0, { note: 'Nova clings to the tower, camera looks up', scene: SN.scene, ppl: [nova], from: V3(0.0, 5.5, BZ + 5.0), to: V3(-2.0, 8.5, BZ + 3.6), at: V3(TX, 8.5, WZ), fov: 50, setup: (t) => { band.group.visible = false; crowd.forEach((c) => (c.group.visible = false)); climb(nova, t, 7 + 3 * Math.sin(t * 1.2)); }, over: ch('STICKS WHEN HONEST', w, { size: 96 }), cues: [[w, 'magic', { gain: 0.6 }]] }); }
  // 1 name
  SH(1, { note: 'Nova on the street, proud', scene: SN.scene, ppl: [nova], from: V3(-1.5, 1.55, BZ + 4.2), to: V3(-1.3, 1.6, BZ + 3.2), at: V3(-3.0, 1.6, BZ + 1.2), fov: 38, setup: (t) => { nova.group.visible = true; nova.at(-3.0, 0, BZ + 1.2); nova.set({ mood: 'proud', talk: talk(t), armR: [10, 10], armL: [10, 10], look: [0.3, 0], blink: blink(t), legs: 'stand' }); }, over: ch('NOVA WREN', Wd('Nova', 1), { size: 120, col: '#F2C230' }) });
  // 2 bandit
  SH(2, { note: 'bandit on the tower roof, laughing', scene: SN.scene, ppl: [band], from: V3(0.5, 2.0, BZ + 6.5), to: V3(-1.5, 12, BZ + 3), at: V3(TX, 27, WZ), fov: 40, setup: (t) => { band.group.visible = true; band.at(TX + 0.6, 30.1, WZ + 0.3); band.set({ mood: 'laugh', talk: talk(t), armR: [10, 10], armL: [10, 10], look: [0, 0], blink: blink(t) }); }, over: ch('GLITCH BANDIT', Wd('Glitch', 2), { size: 104, col: '#FFD43B' }) });
  // 3 clocks
  SH(3, { note: 'bandit holds a sack full of clocks', scene: SN.scene, ppl: [band], from: V3(TX + 1.0, 30.6, WZ + 4.3), to: V3(TX + 0.8, 30.5, WZ + 3.2), at: V3(TX + 0.6, 30.5, WZ + 0.3), fov: 36, setup: (t) => { band.at(TX + 0.6, 29.1, WZ + 0.3); band.set({ mood: 'sly', talk: talk(t), armR: [60, 60], holdR: SACK, armL: [10, 10], look: [0.3, 0], blink: blink(t) }); }, over: ch('EVERY CLOCK', Wd('clock', 3) , { size: 112 }) });
  // 4 bakery
  SH(4, { note: 'sleepy crowd at the bakery at midnight', scene: SN.scene, ppl: [crowd[0], crowd[1]], from: V3(0.8, 1.6, BZ + 5.5), to: V3(0.5, 1.6, BZ + 4.5), at: V3(0.4, 1.5, BZ + 1.2), fov: 40, setup: (t) => { band.group.visible = false; crowd.forEach((c) => (c.group.visible = true)); crowd[0].at(-0.3, 0, BZ + 1.8); crowd[1].at(1.1, 0, BZ + 1.5); crowd[2].group.visible = false; crowd[0].set({ mood: 'worried', talk: 0, look: [0.4, 0], blink: blink(t), armR: [10, 10], armL: [10, 10] }); crowd[1].set({ mood: 'shock', talk: 0, look: [-0.4, 0], blink: blink(t, 1), armR: [10, 10], armL: [10, 10] }); }, over: ch('BREAD AT MIDNIGHT', Wd('bakery', 4), { size: 78 }) });
  // 5 climb
  SH(5, { note: 'Nova climbs up the tower, easy', scene: SN.scene, ppl: [nova], from: V3(1.0, 2.4, BZ + 6.5), to: V3(-1.5, 11, BZ + 4.5), at: V3(TX, 7, WZ), fov: 46, at2: V3(TX, 17, WZ), setup: (t, lt, k) => { crowd.forEach((c) => (c.group.visible = false)); nova.group.visible = true; climb(nova, t, lerp(3, 16, k), { mood: 'happy' }); }, cues: [[Wd('easy', 5), 'swoosh', { gain: 0.5 }]] });
  // 6 scared?
  SH(6, { note: 'bandit leans over the edge: ARE YOU SCARED?', scene: SN.scene, ppl: [band, nova], from: V3(TX + 0.7, 20.2, WZ + 6.2), to: V3(TX + 0.6, 19.9, WZ + 5.0), at: V3(TX + 0.3, 19.7, WZ), fov: 40, setup: (t) => { band.group.visible = true; band.at(TX + 0.95, 19.4, WZ + 0.25); band.set({ mood: 'laugh', talk: talk(t), armR: [140, 40], armL: [10, 10], look: [-0.6, 0], blink: blink(t) }); climb(nova, t, 17.9, { set: {} }); nova.at(TX - 0.5, 17.4, WZ + 0.05); nova.set({ mood: 'smug', armR: [165, 20], armL: [165, 20], look: [0.4, 0.3] }); }, over: ch('ARE YOU SCARED?', Wd('scared', 6), { size: 80, col: '#FFD43B' }) });
  // 7 nope
  SH(7, { note: 'Nova smirks: NOPE', scene: SN.scene, ppl: [nova], from: V3(TX + 0.5, 18.2, WZ + 3.4), to: V3(TX + 0.3, 18.2, WZ + 2.6), at: V3(TX, 18.0, WZ), fov: 34, setup: (t) => { band.group.visible = false; nova.at(TX, 16.6, WZ + 0.05); nova.set({ mood: 'smug', talk: talk(t), armR: [165, 20], armL: [165, 20], look: [0, 0], blink: blink(t), sweat: 0 }); }, over: ch('NOPE!', Wd('nope,', 7), { size: 150 }) });
  // 8 slid
  SH(8, { note: 'Nova slides down three floors', scene: SN.scene, ppl: [nova], from: V3(1.5, 12, BZ + 7), to: V3(1.0, 8, BZ + 6), at: V3(TX, 14, WZ), at2: V3(TX, 6, WZ), fov: 44, setup: (t, lt, k) => { nova.at(TX, lerp(17, 6, eio(k)), WZ + 0.05); nova.set({ mood: 'shock', talk: talk(t), armR: [170, 20], armL: [170, 20], look: [0, 0], blink: 0, sweat: 1 }); }, over: (t, lt) => { ch('3 FLOORS!', Wd('three', 8), { size: 130 })(t); }, cues: [[Wd('slid', 8), 'swoosh', { gain: 0.8 }]] });
  // 9 again
  SH(9, { note: 'Nova tries again, grinning too hard', scene: SN.scene, ppl: [nova], from: V3(TX + 1.5, 7.5, WZ + 4.8), to: V3(TX + 0.8, 7.5, WZ + 3.8), at: V3(TX, 7.3, WZ), fov: 36, setup: (t) => { nova.at(TX, 6.0, WZ + 0.05); nova.set({ mood: 'happy', talk: talk(t), armR: [165, 20], armL: [165, 20], look: [0, 0.2], blink: blink(t), sweat: 0 }); }, over: ch("I'M TOTALLY FINE!", Wd('totally', 9), { size: 72 }) });
  // 10 trash can
  SH(10, { note: 'Nova slips and drops into the trash can', scene: SN.scene, ppl: [nova], from: V3(0.0, 1.8, BZ + 6.5), to: V3(-0.3, 1.7, BZ + 5.2), at: V3(-1.0, 2.6, BZ + 1.4), at2: V3(-1.0, 1.0, BZ + 1.4), fov: 44, setup: (t, lt, k) => { const y = lerp(6.0, 0.6, Math.pow(clamp(k * 1.3), 2)); nova.at(-1.0, y, BZ + 1.45); nova.set({ mood: 'shock', talk: 0, armR: [170, 20], armL: [170, 20], look: [0, 0], blink: 0, sweat: 1 }); }, cues: [[cut(10) + 0.9, 'impact', { gain: 0.8 }]] });
  // 11 pizza
  SH(11, { note: 'Nova in the trash can, pizza box on her head', scene: SN.scene, ppl: [nova], from: V3(0.4, 1.5, BZ + 4.0), to: V3(-0.2, 1.3, BZ + 3.2), at: V3(-1.0, 1.5, BZ + 1.4), fov: 38, setup: (t) => { nova.at(-1.0, 0.45, BZ + 1.45); nova.set({ mood: 'sad', talk: talk(t), armR: [60, 30], armL: [60, 30], look: [0, 0], blink: blink(t), sweat: 0 }); }, over: (t) => { ch('OLD PIZZA', Wd('pizza', 11), { size: 118 })(t); } });
  // 12 worse
  SH(12, { note: 'crowd gathers', scene: SN.scene, ppl: crowd, from: V3(0.8, 1.55, BZ + 6.5), to: V3(0.2, 1.55, BZ + 5.0), at: V3(0.4, 1.5, BZ + 1.4), fov: 42, setup: (t) => { crowd.forEach((c, i) => { c.group.visible = true; c.at(-1.2 + i * 1.5, 0, BZ + 1.8); c.set({ mood: 'worried', talk: 0, look: [0, 0], blink: blink(t, i), armR: [10, 10], armL: [10, 10] }); }); nova.group.visible = false; }, cues: [[cut(12) + 0.1, 'riser', { dur: 1.2, gain: 0.5 }]] });
  // 13 filming
  SH(13, { note: 'everyone films with phones', scene: SN.scene, ppl: crowd, from: V3(-2.0, 1.5, BZ + 4.6), to: V3(0.6, 1.5, BZ + 4.2), at: V3(0.3, 1.5, BZ + 1.8), fov: 42, setup: (t) => { crowd.forEach((c, i) => { c.at(-1.4 + i * 1.5, 0, BZ + 2.1); c.set({ mood: 'happy', talk: 0, look: [0, 0], blink: blink(t, i), armR: [100, 60], holdR: PHONE, armL: [10, 10] }); }); }, over: (t) => { const g = ctx; g.save(); g.fillStyle = '#E63946'; g.font = '900 64px Inter'; g.textAlign = 'center'; if (Math.floor(t * 2) % 2 === 0) g.fillText('● REC', 540, 330); g.restore(); } });
  // 14 mayor
  SH(14, { note: 'mayor points: fix this or lose the mask', scene: MY.scene, ppl: [mayor, nm], from: V3(-0.3, 1.6, -1.8), to: V3(-0.3, 1.65, -2.5), at: V3(-0.3, 1.5, -5.0), fov: 58, setup: (t) => { mayor.at(0.4, 0, -6.2); nm.at(-0.9, 0, -4.4); mayor.set({ mood: 'angry', talk: talk(t), armR: [130, 30], armL: [10, 10], look: [-0.5, 0], blink: blink(t) }); nm.set({ mood: 'sad', look: [0.6, -0.3], armR: [10, 10], armL: [10, 10], blink: blink(t, 1) }); }, over: ch('LOSE THE MASK', Wd('lose', 14), { size: 84, col: '#FFD43B' }), cues: [[Wd('fix', 14), 'impact', { gain: 0.6 }]] });
  // 15 sunrise, hanging
  SH(15, { note: 'dawn, Nova hangs off the top by one hand', scene: SD.scene, ppl: [novaD], from: V3(1.0, 20, BZ + 9), to: V3(0.2, 24, BZ + 7), at: V3(TX, 28, WZ), fov: 46, setup: (t) => { novaD.at(TX + 0.2, 27.0, WZ + 0.05); novaD.set({ mood: 'shock', talk: 0, armR: [175, 10], armL: [20, 30], look: [0, 0.3], blink: blink(t), sweat: 1 }); } , cues: [[Wd('hand', 15), 'riser', { dur: 1.0, gain: 0.5 }]] });
  // 16 bandit waved
  SH(16, { note: 'bandit waves from the roof', scene: SD.scene, ppl: [bandD], from: V3(TX + 2.4, 29.5, WZ + 5.5), to: V3(TX + 1.6, 29.5, WZ + 4.4), at: V3(TX + 0.6, 30.5, WZ + 0.3), fov: 36, setup: (t) => { bandD.group.visible = true; bandD.at(TX + 0.8, 29.1, WZ + 0.3); bandD.set({ mood: 'laugh', talk: 0, armR: [165 + Math.sin(t * 9) * 12, 25], armL: [10, 10], look: [-0.2, 0.2], blink: blink(t) }); } });
  // 17 honest thing
  SH(17, { note: 'Nova close-up, eyes closed, deep breath', scene: SD.scene, ppl: [novaD], from: V3(TX + 0.5, 28.2, WZ + 3.2), to: V3(TX + 0.2, 28.1, WZ + 2.4), at: V3(TX + 0.2, 28.1, WZ), fov: 32, setup: (t) => { bandD.group.visible = false; novaD.at(TX + 0.2, 26.6, WZ + 0.05); novaD.set({ mood: 'worried', talk: 0, armR: [175, 10], armL: [20, 30], look: [0, 0.2], blink: 1, sweat: 1 }); } });
  // 18 I'm scared
  SH(18, { note: 'Nova says it, tear', scene: SD.scene, ppl: [novaD], from: V3(TX + 0.4, 28.0, WZ + 3.0), to: V3(TX + 0.2, 27.9, WZ + 2.2), at: V3(TX + 0.2, 27.9, WZ), fov: 32, setup: (t) => { novaD.set({ mood: 'sad', talk: talk(t), blink: blink(t), sweat: 1 }); }, over: ch("I'M SCARED", Wd("scared.", 18), { size: 126, col: '#FFD43B' }) });
  // 19 stuck
  SH(19, { note: 'hand sticks, sparkle, Nova pulls herself up', scene: SD.scene, ppl: [novaD], from: V3(TX + 1.8, 28.4, WZ + 4.6), to: V3(TX + 1.0, 29.4, WZ + 3.6), at: V3(TX + 0.2, 28.6, WZ), fov: 38, setup: (t, lt, k) => { novaD.at(TX + 0.2, lerp(26.6, 28.4, eio(k)), WZ + 0.05); novaD.set({ mood: 'happy', talk: 0, armR: [175, 10], armL: [165, 20], look: [0, 0], blink: blink(t), sweat: 0 }); }, over: ch('STUCK!', Wd('stuck', 19), { size: 150, col: '#7CFFB2' }), cues: [[Wd('stuck', 19), 'magic', { gain: 0.8 }]] });
  // 20 reveal chalk: lie -> nervous -> sweat
  { const wr = Wd('nervous', 20); SH(20, { note: 'chalk board LIE -> NERVOUS -> SWEATY PALMS over a calm shot', scene: SD.scene, ppl: [novaD], from: V3(TX + 0.8, 29.9, WZ + 3.8), to: V3(TX + 0.4, 29.9, WZ + 3.0), at: V3(TX + 0.2, 29.8, WZ), fov: 36, setup: (t) => { novaD.at(TX + 0.2, 28.4, WZ + 0.05); novaD.set({ mood: 'smug', talk: talk(t), blink: blink(t), sweat: 0 }); }, over: (t) => { const g = ctx, a = seg(t, Wd('lies', 20) - 0.2, Wd('lies', 20) + 0.2); g.save(); g.globalAlpha = 0.93 * a; g.fillStyle = '#23483A'; g.strokeStyle = '#6B4429'; g.lineWidth = 20; g.beginPath(); g.roundRect(90, 300, 900, 700, 26); g.fill(); g.restore();
    X.chalk('LIE', 540, 420, seg(t, Wd('lies', 20), Wd('lies', 20) + 0.3), { size: 120, col: '#FFD43B' }); X.arrow(540, 500, 540, 590, seg(t, wr - 0.3, wr), {}); X.chalk('NERVOUS', 540, 690, seg(t, wr - 0.1, wr + 0.3), { size: 110 }); X.arrow(540, 770, 540, 850, seg(t, Wd('sweat', 20) - 0.3, Wd('sweat', 20)), {}); X.chalk('SWEATY PALMS', 540, 930, seg(t, Wd('sweat', 20) - 0.1, Wd('sweat', 20) + 0.3), { size: 92, col: '#7FD0FF' }); }, cues: [[wr, 'tick', { gain: 0.6 }]] }); }
  // 21 hands
  SH(21, { note: 'wet hand slips, dry hand grips', scene: SD.scene, ppl: [novaD], from: V3(TX + 0.8, 29.9, WZ + 3.8), to: V3(TX + 0.4, 29.9, WZ + 3.0), at: V3(TX + 0.2, 29.8, WZ), fov: 36, setup: (t) => { novaD.set({ mood: 'smug', talk: talk(t), blink: blink(t), sweat: 0 }); }, over: (t) => { const g = ctx, a = seg(t, cut(21) - cut(21), 0.35); g.save(); g.globalAlpha = 0.9; g.fillStyle = '#16203A'; g.fillRect(0, 250, W, 1050); g.restore(); const wf = Wd('Wet', 21), df = Wd('Honest,', 21);
    hand(ctx, 290, 760 + 40 * Math.max(0, (t - wf) * 1.5), 1.0, true, 1); hand(ctx, 790, 760, 1.0, false, 1); const g2 = ctx; g2.save(); g2.fillStyle = '#E63946'; g2.font = '900 74px Inter'; g2.textAlign = 'center'; g2.fillText('SLIP', 290, 1180); g2.fillStyle = '#7CFFB2'; g2.fillText('GRIP', 790, 1180); g2.restore(); }, cues: [[Wd('Wet', 21), 'splash', { gain: 0.5 }], [Wd('Honest,', 21), 'magic', { gain: 0.6 }]] });
  // 22 caught
  SH(22, { note: 'Nova holds the bandit by his collar on the roof', scene: SD.scene, ppl: [novaD, bandD], from: V3(TX + 2.2, 29.6, WZ + 5.2), to: V3(TX + 1.5, 29.4, WZ + 4.2), at: V3(TX + 0.5, 29.3, WZ + 0.2), fov: 38, setup: (t) => { bandD.group.visible = true; novaD.at(TX - 0.3, 28.9, WZ + 0.3); bandD.at(TX + 0.8, 28.9, WZ + 0.3); novaD.set({ mood: 'proud', talk: 0, armR: [90, 20], armL: [10, 10], look: [0.4, 0], blink: blink(t) }); bandD.set({ mood: 'shock', talk: 0, sweat: 1, armR: [60, 50], armL: [60, 50], look: [-0.4, 0], blink: blink(t, 1) }); }, cues: [[cut(22) + 0.2, 'impact', { gain: 0.6 }]] });
  // 23 loop
  SH(23, { note: 'Nova sticks proudly to the wall, back to the hook', scene: SD.scene, ppl: [novaD], from: V3(0.0, 5.5, BZ + 5.0), to: V3(-2.0, 8.5, BZ + 3.6), at: V3(TX, 8.5, WZ), fov: 50, setup: (t) => { bandD.group.visible = false; climb(novaD, t, 7 + 2 * Math.sin(t * 1.2)); }, over: ch('TELL THE TRUTH', Wd('truth.', 23), { size: 104, col: '#7CFFB2' }), cues: [[Wd('truth.', 23), 'magic', { gain: 0.7 }]] });

  S.sort((a, b) => a.at - b.at);
  return { shots: S, cues: CUES, ambience: [{ type: 'city', from: 0, to: 4 }] };
}
