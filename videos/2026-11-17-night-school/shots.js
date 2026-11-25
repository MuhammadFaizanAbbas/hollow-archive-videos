// THE MOON WHERE KIDS ONLY STUDY AT NIGHT: Tall Tale 3D, CLEAN LOOK, SCIFI world-rule.
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio } from './core/lib.js';
import { L, Le, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as W2 from './core/world2.js';
import * as X from './core/fx2.js';
import { Toon, INK } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z), mix = (a, b, k) => a.clone().lerp(b, k);
const SK = ['#F6D9B5', '#EBC49A', '#D9A877', '#B98457'];
const P = (look) => new Toon({ ...look, extra: [...(look.extra || [])] });
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, ...o });
const bx = (w, h, d, c, x, y, z, p) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'string' ? mat(c) : c); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (p) p.add(m); return m; };

const NINA = { body: '#F28C3A', head: SK[2], hair: 'long', hairCol: '#2A1A14', kid: true, extra: ['blush'], neck: 'collar' };
const NINAG = { ...NINA, extra: ['blush', 'glasses'] };
const TEACH = { body: '#6C5BA8', head: SK[0], hair: 'bald', extra: ['mustache'], neck: 'bowtie', neckCol: '#F4F1EA' };
const TEACHG = { ...TEACH, extra: ['mustache', 'glasses'] };
const KID1 = { body: '#3FA7A0', head: SK[1], hair: 'curly', hairCol: '#4A2E22', kid: true };
const KID2 = { body: '#E8C547', head: SK[3], hair: 'bob', hairCol: '#1E1A1A', kid: true, extra: ['freckles'] };

const BOOK = (g, x, y) => { g.save(); g.translate(x, y - 20); g.fillStyle = '#F4F1EA'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-70, -44, 140, 88, 10); g.fill(); g.stroke(); g.beginPath(); g.moveTo(0, -44); g.lineTo(0, 44); g.stroke(); g.strokeStyle = '#8A8A99'; g.lineWidth = 4; [-18, 0, 18].forEach((o) => { g.beginPath(); g.moveTo(-58, o); g.lineTo(-12, o); g.moveTo(12, o); g.lineTo(58, o); g.stroke(); }); g.restore(); };
const PILLOW = (g, x, y) => { g.save(); g.translate(x, y - 10); g.fillStyle = '#F7B6D2'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-64, -46, 128, 92, 34); g.fill(); g.stroke(); g.restore(); };

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.12, bloomThreshold: 0.92 };
  const shoot = (scene, ppl, from, to, at, k, fov = 36, at2 = null) => { if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at); ppl.forEach((p) => p.face(cam)); E.render(scene, cam, LK); };

  // two flickering suns drawn over the sky
  const suns = (t, x = 760, y = 330, s = 1, flick = 1) => { const g = ctx; const f = flick ? (Math.sin(t * 40) > 0 ? 1 : 0.55) : 1; g.save();
    [[0, 0, '#FFD43B', 1], [-190 * s, 120 * s, '#FF9A3C', 0.75]].forEach(([dx, dy, col, sc]) => { const r = 78 * s * sc; const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r * 2.6); gr.addColorStop(0, 'rgba(255,230,140,' + 0.7 * f + ')'); gr.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gr; g.fillRect(x + dx - r * 3, y + dy - r * 3, r * 6, r * 6);
      g.globalAlpha = f; g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(x + dx, y + dy, r, 0, 7); g.fill(); g.stroke(); g.globalAlpha = 1; }); g.restore(); };
  const swirl = (t, x, y, k) => { const g = ctx; if (k <= 0) return; g.save(); g.globalAlpha = k; g.strokeStyle = '#F4F1EA'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < 90; i++) { const a = i * 0.28 + t * 4, r = 8 + i * 1.6; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.8; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore(); };

  // ── sets ──
  const NS = W2.townStreet(E, { night: true, flagAt: null });             // night street (shots 0 and 19)
  const nK = [P(KID1), P(KID2), P(NINA)]; nK.forEach((p) => NS.scene.add(p.group));
  const DS = W2.townStreet(E, {});                                          // day street
  { const tr = WD.tree(1.6, '#4E9A3C'); tr.position.set(-6.0, 0.18, -10.5); DS.scene.add(tr); }
  const dN = P(NINA), dNG = P(NINAG), dT = P(TEACH), dK = [P(KID1), P(KID2)]; [dN, dNG, dT, ...dK].forEach((p) => DS.scene.add(p.group));
  const CL = W2.room2(E, { wall: '#5E8FB8', wains: '#8A5A36', floor: '#B07A4A', posters: [['READ!', 'back', 3.4, '#E8C547']], windows: [['back', -2.6], ['left', -4.5]], clockAt: ['right', -6] });
  { const bd = WD.canvasTex('cbd', 512, 256, (g, w, h) => { g.fillStyle = '#23483A'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(245,245,235,0.85)'; g.font = '700 50px Inter';  });
    bx(4.4, 2.2, 0.12, '#6B4429', 0.4, 2.6, -8.9, CL.scene); const pl = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 1.95), new THREE.MeshStandardMaterial({ map: bd })); pl.position.set(0.4, 2.6, -8.82); CL.scene.add(pl); }
  const cN = P(NINA), cNG = P(NINAG), cT = P(TEACH), cTG = P(TEACHG), cK = [P(KID1), P(KID2)]; [cN, cNG, cT, cTG, ...cK].forEach((p) => CL.scene.add(p.group));

  const chalkAt = (txt, x, y, t, w, o = {}) => X.chalk(txt, x, y, seg(t, w - 0.1, w + 0.3), { size: 110, ...o });
  const all = (a) => a.forEach((p) => (p.group.visible = false));
  const show = (...a) => { [cN, cNG, cT, cTG, ...cK].forEach((p) => (p.group.visible = false)); a.forEach((p) => (p.group.visible = true)); };
  const showD = (...a) => { [dN, dNG, dT, ...dK].forEach((p) => (p.group.visible = false)); a.forEach((p) => (p.group.visible = true)); };
  void all;

  // 0 · hook: night street, kids heading to school with books
  { const st = cut(0), wn = Wd('night', 0); add({ id: 'S0', at: st, note: 'night street, kids stroll to school with books', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      nK.forEach((p, i) => { p.at(-1.2 + i * 1.5, 0, lerp(-6 + i * 1.4, -3 + i * 1.4, k)); p.set({ mood: 'happy', legs: 'walk', phase: t * 6 + i, holdR: BOOK, armR: [60, 90], armL: [10, 10], blink: blink(t, i), look: [0, 0] }); });
      shoot(NS.scene, nK, V3(0.4, 1.6, 3.5), V3(0.2, 1.6, 2.2), V3(0, 1.4, -6), k, 44); blit(); chalkAt('STUDY AT NIGHT', 540, 300, t, wn); } }); cue(st, 'whoosh'); cue(wn, 'sparkle', { gain: 0.5 }); }
  // 1 · day street, a kid forgets everything
  { const st = cut(1), wf = Wd('forget', 1); add({ id: 'S1', at: st, dissolve: 0.3, note: 'daytime: dizzy kid with swirl', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dK[0]); dK[0].at(-1.2, 0.18, -4.5);
      dK[0].set({ mood: 'dizzy', talk: 0, armL: [60, 70], armR: [60, 70], look: [0, 0] }); shoot(DS.scene, [dK[0]], V3(-0.9, 1.45, -1.0), V3(-1.0, 1.5, -1.8), V3(-1.2, 1.5, -4.5), k, 38); blit();
      suns(t, 830, 260, 0.8); swirl(t, 540, 560, seg(t, wf - 0.2, wf + 0.3)); chalkAt('FORGET EVERYTHING', 540, 1000, t, wf, { size: 78 }); } }); cue(st, 'whoosh'); cue(wf, 'boing', { gain: 0.6 }); }
  // 2 · Nina lands
  { const st = cut(2), wr = Wd('ridiculous', 2); add({ id: 'S2', at: st, dissolve: 0.3, note: 'Nina arrives with a suitcase, unimpressed', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-0.8, 0.18, lerp(-8, -5.2, k));
      dN.set({ mood: t > wr ? 'sly' : 'smug', legs: 'walk', phase: t * 7, armL: [10, 10], armR: [10, 10], look: [0.3, 0], blink: blink(t) }); shoot(DS.scene, [dN], V3(0.2, 1.5, -1.4), V3(-0.2, 1.5, -2.4), V3(-0.8, 1.2, -6), k, 42); blit();
      chalkAt('NINA', 540, 330, t, Wd('Nina', 2) + 0.1, { size: 130, col: '#FFFFFF' }); } }); cue(st, 'whoosh'); }
  // 3 · teacher begs
  { const st = cut(3), wb = Wd('begged', 3); add({ id: 'S3', at: st, dissolve: 0.3, note: 'classroom: teacher begs, Nina unimpressed', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); show(cT, cN); cT.at(-0.45, 0, -5.8); cN.at(0.4, 0, -5.2);
      cT.set({ mood: 'worried', talk: talk(t), sweat: 1, armL: [150, 30], armR: [150, 30], look: [0.4, 0], blink: blink(t) }); cN.set({ mood: 'sly', look: [-0.4, 0], armL: [10, 10], armR: [10, 10], blink: blink(t, 1) });
      shoot(CL.scene, [cT, cN], V3(0.2, 1.5, -1.8), V3(0.0, 1.55, -2.6), V3(-0.2, 1.5, -5.6), k, 40); blit(); chalkAt('NO BOOKS TILL SUNSET!', 540, 330, t, Wd('sunset', 3), { size: 74 }); } }); cue(st, 'whoosh'); cue(wb, 'knock', { gain: 0.5 }); }
  // 4 · loves mornings
  { const st = cut(4); add({ id: 'S4', at: st, dissolve: 0.3, note: 'Nina close-up, happy, morning sun', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(0.0, 0.18, -5.5);
      dN.set({ mood: 'happy', talk: talk(t), armL: [10, 10], armR: [10, 10], look: [0, 0.2], blink: blink(t) }); shoot(DS.scene, [dN], V3(0.1, 1.15, -3.4), V3(0.05, 1.2, -4.0), V3(0.0, 1.2, -5.5), k, 36); blit();
      suns(t, 800, 230, 0.7, 0); chalkAt('MORNINGS!', 540, 1000, t, Wd('mornings', 4), { size: 126, col: '#FFFFFF' }); } }); cue(st, 'whoosh'); cue(Wd('mornings', 4), 'chirp', { gain: 0.5 }); }
  // 5 · studies under the tree
  { const st = cut(5), wt = Wd('ten', 5); add({ id: 'S5', at: st, note: 'under the tree with a book, 10:00', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-3.4, 0.18, -10.0);
      dN.set({ mood: 'happy', talk: 0, holdR: BOOK, armR: [100, 90], armL: [10, 10], legs: 'sit', look: [0.1, 0.4], blink: blink(t) }); shoot(DS.scene, [dN], V3(-1.2, 1.5, -6.6), V3(-2.4, 1.4, -7.4), V3(-3.4, 1.2, -10.0), k, 42); blit();
      chalkAt('10:00 AM', 540, 330, t, wt, { size: 120, col: '#FFFFFF' }); } }); cue(st, 'whoosh'); cue(st + 0.8, 'page', { gain: 0.5 }); }
  // 6 · strange part: suns
  { const st = cut(6), ws = Wd('strange', 6); add({ id: 'S6', at: st, note: 'camera tilts up to two suns, flicker', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(); shoot(DS.scene, [], V3(-0.4, 1.0, -3.0), V3(-0.4, 1.1, -3.0), V3(-0.6, lerp(3.0, 7.0, k), -16), 1, 56); blit();
      suns(t, 660, 520, 1.1, 1); chalkAt('STRANGE...', 540, 1000, t, ws, { size: 120 }); } }); cue(st, 'whoosh'); cue(ws, 'riser', { dur: 1.0, gain: 0.5 }); }
  // 7 · forgot her name
  { const st = cut(7), wn = Wd('name', 7); add({ id: 'S7', at: st, note: 'Nina dizzy, forgets her name', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-3.4, 0.18, -10.0);
      dN.set({ mood: 'dizzy', talk: 0, holdR: null, armR: [50, 70], armL: [50, 70], legs: 'stand', look: [0, 0], sweat: 1 }); shoot(DS.scene, [dN], V3(-3.4, 1.45, -7.6), V3(-3.8, 1.45, -8.4), V3(-3.4, 1.45, -10.0), k, 36); blit();
      swirl(t, 540, 560, seg(t, wn - 0.4, wn)); chalkAt('NAME?', 540, 1000, t, wn, { size: 140, col: '#FFD43B' }); } }); cue(st, 'whoosh'); cue(wn, 'boing', { gain: 0.7 }); }
  // 8 · forgot the alphabet, twice
  { const st = cut(8), wa = Wd('alphabet', 8); add({ id: 'S8', at: st, note: 'chalk alphabet scribbles away', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-3.4, 0.18, -10.0);
      dN.set({ mood: 'shock', talk: talk(t), armR: [60, 60], armL: [60, 60], look: [0, 0], sweat: 1, blink: blink(t) }); shoot(DS.scene, [dN], V3(-3.8, 1.5, -8.0), V3(-3.6, 1.5, -8.9), V3(-3.4, 1.45, -10.0), k, 40); blit();
      chalkAt('A B C ... ?', 540, 330, t, wa - 0.2, { size: 120 }); chalkAt('TWICE!', 540, 480, t, Wd('Twice', 8), { size: 130, col: '#FFD43B' }); } }); cue(st, 'whoosh'); cue(Wd('Twice', 8), 'pop', { gain: 0.6 }); }
  // 9 · classmates with pillows at the window
  { const st = cut(9), wp = Wd('pillows', 9); add({ id: 'S9', at: st, note: 'classmates hug pillows, watching', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); show(cK[0], cK[1]); cK[0].at(-0.4, 0, -4.8); cK[1].at(0.45, 0, -4.6);
      cK.forEach((p, i) => p.set({ mood: i ? 'shock' : 'worried', armL: [60, 80], armR: [60, 80], holdR: PILLOW, look: [i ? -0.6 : 0.6, 0.1], blink: blink(t, i) })); shoot(CL.scene, cK, V3(0.3, 1.5, -1.2), V3(0.1, 1.5, -2.0), V3(0.1, 1.2, -4.7), k, 40); blit(); chalkAt('SO SLEEPY', 540, 330, t, wp, { size: 100 }); } }); cue(st, 'whoosh'); cue(wp, 'crowd', { gain: 0.4 }); }
  // 10 · false peak: blank notebook
  { const st = cut(10), wb = Wd('blank', 10); add({ id: 'S10', at: st, note: 'FALSE PEAK: blank notebook, blank face', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-3.4, 0.18, -10.0);
      dN.set({ mood: 'sad', talk: 0, armR: [20, 20], armL: [20, 20], look: [0, 0.6], blink: 0, tears: 0 }); shoot(DS.scene, [dN], V3(-3.6, 1.2, -7.6), V3(-4.0, 1.25, -8.6), V3(-3.4, 1.25, -10.0), k, 36); blit();
      const g = ctx, a = seg(t, wb - 0.2, wb + 0.4); if (a > 0) { g.save(); g.fillStyle = 'rgba(15,20,40,' + 0.35 * a + ')'; g.fillRect(0, 0, W, H); g.translate(540, lerp(1900, 640, eo(a))); g.rotate(-0.04); g.fillStyle = '#FBF6E8'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-300, -250, 600, 500, 18); g.fill(); g.stroke(); g.fillStyle = '#C9C5B8'; g.font = '900 120px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('...', 0, 0); g.restore(); } } }); cue(st, 'whoosh'); cue(wb, 'impact', { gain: 0.6 }); }
  // 11 · teacher sighs
  { const st = cut(11), wt = Wd('Told', 11); add({ id: 'S11', at: st, note: 'teacher sighs: told you', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); show(cT); cT.at(0.0, 0, -5.4); cT.set({ mood: 'tired', talk: talk(t, t < wt ? 1 : 0), armL: [10, 10], armR: [10, 10], look: [0, 0], blink: blink(t) });
      shoot(CL.scene, [cT], V3(0.0, 1.55, -2.6), V3(-0.1, 1.55, -3.3), V3(-0.2, 1.5, -5.4), k, 36); blit(); chalkAt('TOLD YOU.', 540, 330, t, wt, { size: 130, col: '#FFD43B' }); } }); cue(st, 'whoosh'); }
  // 12 · squints at the sky
  { const st = cut(12), wq = Wd('squinted', 12); add({ id: 'S12', at: st, note: 'Nina squints up at the suns', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-3.4, 0.18, -10.0);
      dN.set({ mood: 'sly', talk: 0, armR: [10, 10], armL: [10, 10], look: [0.5, -0.8], blink: 0 }); shoot(DS.scene, [dN], V3(-3.6, 0.9, -8.0), V3(-3.8, 0.9, -8.8), V3(-3.4, 1.6, -10.0), k, 40); blit(); suns(t, 760, 360, 0.9, 1); chalkAt('HMM...', 540, 1000, t, wq, { size: 120 }); } }); cue(st, 'whoosh'); cue(wq, 'sparkle', { gain: 0.5 }); }
  // 13 · REVEAL part 1: flicker
  { const st = cut(13), wf = Wd('flicker', 13); add({ id: 'S13', at: st, note: 'suns strobe, 40 per second', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(); shoot(DS.scene, [], V3(-0.4, 1.0, -3.0), V3(-0.4, 1.1, -3.0), V3(-0.6, 5.0 + k, -16), 1, 54); blit();
      suns(t, 600, 560, 1.4, 1); X.chalk('40 TIMES', 540, 1050, seg(t, wf - 0.1, wf + 0.3), { size: 150, col: '#FFFFFF' }); X.chalk('EVERY SECOND', 540, 1220, seg(t, wf + 0.3, wf + 0.7), { size: 110 }); const f = seg(t, wf - 0.05, wf + 0.2); if (f > 0 && f < 1) { ctx.save(); ctx.fillStyle = 'rgba(255,248,232,' + (1 - f) * 0.7 + ')'; ctx.fillRect(0, 0, W, H); ctx.restore(); } } }); cue(st, 'whoosh'); cue(st + 0.1, 'riser', { dur: 1.2, gain: 0.6 }); cue(wf - 0.1, 'impact', { gain: 0.7 }); }
  // 14 · memory scrambled
  { const st = cut(14), wm = Wd('memory', 14); add({ id: 'S14', at: st, note: 'memory scrambled: swirl over Nina head', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dN); dN.at(-3.4, 0.18, -10.0);
      dN.set({ mood: 'dizzy', talk: 0, armR: [50, 60], armL: [50, 60], look: [0, 0] }); shoot(DS.scene, [dN], V3(-3.4, 1.5, -7.6), V3(-3.9, 1.5, -8.6), V3(-3.4, 1.5, -10.0), k, 36); blit();
      swirl(t, 540, 520, seg(t, wm - 0.5, wm)); chalkAt('MEMORY SCRAMBLED', 540, 1000, t, wm - 0.3, { size: 80 }); } }); cue(st, 'whoosh'); cue(wm, 'magic', { gain: 0.5 }); }
  // 15 · dark crystal glasses
  { const st = cut(15), wg = Wd('glasses', 15); add({ id: 'S15', at: st, note: 'Nina puts on dark crystal glasses', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dNG); dNG.at(0.0, 0.18, -5.5);
      dNG.set({ mood: 'proud', talk: talk(t), armR: [20, 20], armL: [20, 20], look: [0, 0], blink: blink(t) }); shoot(DS.scene, [dNG], V3(0.1, 1.15, -3.4), V3(0.05, 1.2, -4.1), V3(0.0, 1.2, -5.5), k, 34); blit();
      chalkAt('DARK CRYSTAL GLASSES', 540, 330, t, wg - 0.5, { size: 68 }); const f = seg(t, wg, wg + 0.2); if (f > 0 && f < 1) { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,' + (1 - f) * 0.6 + ')'; ctx.fillRect(0, 0, W, H); ctx.restore(); } } }); cue(st, 'whoosh'); cue(wg, 'glass', { gain: 0.6 }); }
  // 16 · studies in full sunshine
  { const st = cut(16), wsn = Wd('sunshine', 16); add({ id: 'S16', at: st, note: 'under the tree again, glasses on, gold', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); showD(dNG); dNG.at(-3.4, 0.18, -10.0);
      dNG.set({ mood: 'happy', talk: 0, holdR: BOOK, armR: [100, 90], armL: [10, 10], legs: 'sit', look: [0.1, 0.4], blink: blink(t) }); shoot(DS.scene, [dNG], V3(-1.2, 1.5, -6.6), V3(-2.6, 1.4, -7.6), V3(-3.4, 1.2, -10.0), k, 42); blit();
      suns(t, 800, 250, 0.7, 1); X.chalk('ALL DAY!', 540, 1000, seg(t, wsn - 0.4, wsn), { size: 130, col: '#FFD43B' }); const g = ctx; g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,200,90,0.12)'; g.fillRect(0, 0, W, H); g.restore(); } }); cue(st, 'whoosh'); cue(st + 0.2, 'sparkle', { gain: 0.5 }); }
  // 17 · tops the school
  { const st = cut(17), wt = Wd('topped', 17); add({ id: 'S17', at: st, note: 'class applauds Nina, 100%', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); show(cNG, cK[0], cK[1]); cNG.at(0.0, 0, -4.8); cK[0].at(-0.85, 0, -4.4); cK[1].at(0.85, 0, -4.4);
      cNG.set({ mood: 'laugh', talk: talk(t), armL: [150, 20], armR: [150, 20], look: [0, 0], blink: blink(t) }); cK.forEach((p, i) => p.set({ mood: 'happy', armL: [150 + Math.sin(t * 9 + i) * 10, 20], armR: [150, 20], look: [0, 0], blink: blink(t, i) }));
      shoot(CL.scene, [cNG, ...cK], V3(0.0, 1.6, -1.2), V3(0.0, 1.6, -2.0), V3(0.0, 1.4, -4.7), k, 50); blit(); const a = seg(t, wt - 0.1, wt + 0.3), g = ctx; if (a > 0) { g.save(); g.translate(540, 360); g.scale(0.6 + 0.4 * a, 0.6 + 0.4 * a); g.rotate(-0.05); g.fillStyle = '#FFD43B'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-230, -90, 460, 180, 36); g.fill(); g.stroke(); g.fillStyle = INK; g.font = '900 110px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('100%', 0, 6); g.restore(); } } }); cue(st, 'whoosh'); cue(wt, 'ding', { gain: 0.7 }); cue(wt + 0.2, 'sparkle', { gain: 0.5 }); }
  // 18 · teacher borrows glasses
  { const st = cut(18), wb = Wd('borrowed', 18); add({ id: 'S18', at: st, note: 'teacher in glasses, smug; chalk punchline', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); show(cT, cTG, cNG); cT.group.visible = t < wb; cTG.group.visible = t >= wb; cT.at(-0.4, 0, -5.0); cTG.at(-0.4, 0, -5.0); cNG.at(0.4, 0, -4.8);
      const m = { mood: t >= wb ? 'smug' : 'happy', talk: talk(t), armL: [10, 10], armR: [10, 10], look: [0.3, 0], blink: blink(t) }; cT.set(m); cTG.set(m); cNG.set({ mood: 'laugh', look: [-0.4, 0], armL: [10, 10], armR: [10, 10], blink: blink(t, 1) });
      shoot(CL.scene, [cT, cTG, cNG], V3(0.3, 1.5, -1.6), V3(0.1, 1.55, -2.4), V3(0.1, 1.5, -5.0), k, 40); blit(); chalkAt('HIS NEW GLASSES', 540, 330, t, wb, { size: 80, col: '#FFD43B' }); } }); cue(st, 'whoosh'); cue(wb, 'sparkle', { gain: 0.5 }); }
  // 19 · loop: night street again
  { const st = cut(19); add({ id: 'S19', at: st, dissolve: 0.3, note: 'back to the night street (same as first shot)', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      nK.forEach((p, i) => { p.at(-1.2 + i * 1.5, 0, lerp(-3 + i * 1.4, -6 + i * 1.4, k)); p.set({ mood: 'happy', legs: 'walk', phase: t * 6 + i, holdR: BOOK, armR: [60, 90], armL: [10, 10], blink: blink(t, i), look: [0, 0] }); });
      shoot(NS.scene, nK, V3(0.2, 1.6, 2.2), V3(0.4, 1.6, 3.5), V3(0, 1.4, -6), k, 44); blit(); } }); cue(st, 'whoosh'); }

  S.sort((a, b) => a.at - b.at);
  return { shots: S, cues: CUES, ambience: [] };
}
