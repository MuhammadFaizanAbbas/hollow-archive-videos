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
const ROB = { body: '#4F7FB8', head: SK[1], hair: 'curly', hairCol: '#3A2A22', extra: ['juice', 'mustache'], neck: 'collar' };
const rob = () => P(ROB);
// props held in the hand (drawn on the card)
const BAG = (g, x, y) => { g.save(); g.translate(x, y - 20); g.fillStyle = '#8A6A3A'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-52, -50, 104, 100, 22); g.fill(); g.stroke(); g.fillStyle = '#F2E6A0'; g.font = '900 64px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 4); g.restore(); };
const CAM = (g, x, y) => { g.save(); g.translate(x, y - 20); g.fillStyle = '#F4F1EA'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-62, -44, 124, 88, 16); g.fill(); g.stroke();
  g.fillStyle = '#2A2A33'; g.beginPath(); g.arc(0, 4, 30, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#7FC8E8'; g.beginPath(); g.arc(-8, -4, 10, 0, 7); g.fill();
  g.fillStyle = '#E63946'; g.fillRect(-52, -36, 50, 12); g.fillStyle = '#FFD43B'; g.fillRect(-52, -24, 50, 6); g.restore(); };
const PHONE = (g, x, y) => { g.save(); g.translate(x, y - 20); g.fillStyle = '#2A2A33'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.roundRect(-24, -44, 48, 88, 10); g.fill(); g.stroke(); g.fillStyle = '#9FD8FF'; g.fillRect(-18, -36, 36, 62); g.restore(); };

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.12, bloomThreshold: 0.92 };
  const shoot = (scene, ppl, from, to, at, k, fov = 36, at2 = null) => { if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at); ppl.forEach((p) => p.face(cam)); E.render(scene, cam, LK); };
  const rec = (t, lt) => { const g = ctx; g.save(); g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.roundRect(56, 96, 250, 80, 40); g.fill(); if (Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#E63946'; g.beginPath(); g.arc(106, 136, 15, 0, 7); g.fill(); }
    g.fillStyle = '#FFFFFF'; g.font = '800 40px Inter'; g.textBaseline = 'middle'; g.fillText('CCTV', 142, 138); g.restore(); };

  // ── sets ──────────────────────────────────────────────────────────────
  // 1 · street by day with the bank
  const ST = W2.townStreet(E, { bank: 'CITY BANK' }); let BZ = -9; ST.scene.traverse((o) => { if (Math.abs(o.position.x - 5.5) < 0.01 && Math.abs(o.position.y - 3.0) < 0.01) BZ = o.position.z; });
  const stRob = rob(); ST.scene.add(stRob.group);
  // 2 · kitchen
  const KI = W2.room2(E, { wall: '#EFC85A', wains: '#F6EFE0', floor: '#B07A4A', posters: [], windows: [['back', -2.6], ['left', -4.5]], clockAt: ['right', -6] });
  const TBX = -2.6; bx(2.0, 0.12, 1.3, '#8A5A36', TBX, 1.0, -6.0, KI.scene); [[-0.85, -0.5], [0.85, -0.5], [-0.85, 0.5], [0.85, 0.5]].forEach(([x, z]) => bx(0.14, 1.0, 0.14, '#6B4429', TBX + x, 0.5, -6.0 + z, KI.scene));
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), mat('#F6D43B', { roughness: 0.45 })); l.scale.set(1.2, 0.9, 0.9); l.position.set(TBX - 0.5 + (i % 3) * 0.32 + (i > 5 ? 0.16 : 0), 1.12 + Math.floor(i / 3) * 0.17, -6.0 + ((i * 7) % 3 - 1) * 0.12); l.rotation.y = i; l.castShadow = true; KI.scene.add(l); }
  const kiRob = rob(); KI.scene.add(kiRob.group); kiRob.at(0.1, 0, -6.3);
  // 3 · bank inside
  const BK = W2.room2(E, { wall: '#3A6F63', wains: '#D8CBB0', floor: '#C9B592', posters: [], windows: [['left', -4.5]], clockAt: ['right', -6], depth: 9 });
  { const sb = WD.signBoard('CITY BANK', { w: 3.4, h: 0.6, bg: '#2A3048', fg: '#F2EEE4', font: 'Inter' }); sb.position.set(0, 3.5, -8.93); BK.scene.add(sb);
    bx(7.5, 1.15, 0.9, '#7A4E2E', 0, 0.58, -5.0, BK.scene); bx(7.7, 0.1, 1.05, '#C9A24A', 0, 1.17, -5.0, BK.scene); for (let i = -3; i <= 3; i++) bx(0.05, 1.1, 0.05, '#C9A24A', i * 1.0, 1.75, -5.0, BK.scene); bx(7.5, 0.06, 0.06, '#C9A24A', 0, 2.3, -5.0, BK.scene);
    bx(0.5, 0.28, 0.34, '#2A2A33', 3.6, 4.0, -8.6, BK.scene); const rl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: '#FF3B3B' })); rl.position.set(3.4, 4.0, -8.4); BK.scene.add(rl); }
  const bkRob = rob(), teller = P({ body: '#C97A8E', head: SK[0], hair: 'bob', hairCol: '#7A3E22', extra: ['glasses'] }); BK.scene.add(bkRob.group, teller.group); bkRob.at(-0.6, 0, -3.6); teller.at(1.9, 0, -5.9);
  // 4 · living room with the TV
  const LV = W2.room2(E, { wall: '#6B5B8E', wains: '#3F3560', floor: '#8E6B4A', posters: [], windows: [['left', -4.5]], clockAt: null });
  const tvTex = WD.canvasTex('tvnews', 512, 320, (g, w, h) => { g.fillStyle = '#7FA38A'; g.fillRect(0, 0, w, h); g.fillStyle = '#5C7F6A'; g.fillRect(0, h * 0.72, w, h * 0.28); g.fillStyle = '#C9A24A'; g.fillRect(40, 30, 130, 20);
    g.save(); g.translate(300, 120); g.scale(0.45, 0.45); drawToon(g, ROB, { mood: 'happy', talk: 0, armR: [150, 20], armL: [10, 10] }); g.restore();
    g.fillStyle = '#D62839'; g.fillRect(0, h - 70, w, 46); g.fillStyle = '#FFFFFF'; g.font = '900 34px Inter'; g.fillText('BREAKING NEWS  •  BANK ROBBER', 16, h - 37); g.fillStyle = '#12151F'; g.fillRect(0, h - 24, w, 24); g.fillStyle = '#FFD43B'; g.font = '800 18px Inter'; g.fillText('11 PM  •  LIVE', 16, h - 6); });
  { bx(2.9, 1.8, 0.2, '#1B1B22', 0, 1.9, -8.8, LV.scene); const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.55), new THREE.MeshBasicMaterial({ map: tvTex, toneMapped: false })); scr.position.set(0, 1.9, -8.68); LV.scene.add(scr);
    bx(3.2, 0.7, 0.6, '#4A3A2A', 0, 0.35, -8.5, LV.scene); bx(3.4, 0.6, 1.1, '#B0485A', -0.2, 0.3, -5.2, LV.scene);
    const gl = new THREE.PointLight('#B8D8FF', 6, 10, 1.4); gl.position.set(0, 1.9, -7.3); LV.scene.add(gl); }
  const lvTip = P({ body: '#E8A24A', head: SK[2], hair: 'long', hairCol: '#5A2E1E', extra: ['blush'] }); LV.scene.add(lvTip.group); lvTip.at(-2.3, 0, -4.2);
  // 5 · street by night with the police
  const SN = W2.townStreet(E, { night: true, bank: 'CITY BANK' });
  const snRob = rob(), cop = P({ body: '#2B3A67', head: SK[0], hat: 'cap', hatCol: '#1F2A4D', extra: ['mustache'], neck: 'tie', neckCol: '#F4F1EA' }); SN.scene.add(snRob.group, cop.group);
  const lr = new THREE.PointLight('#FF2A3A', 0, 14, 1.4), lb = new THREE.PointLight('#2A6BFF', 0, 14, 1.4); [lr, lb].forEach((l) => SN.scene.add(l)); lr.position.set(0.6, 2.2, BZ + 3); lb.position.set(3.6, 2.2, BZ + 3);
  // 6 · lecture room
  const LC = W2.room2(E, { wall: '#4F6F8E', wains: '#8A5A36', floor: '#A8693E', posters: [], windows: [['left', -4.5]], clockAt: ['right', -6] });
  { const bt = WD.canvasTex('board', 512, 256, (g, w, h) => { g.fillStyle = '#23483A'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(245,245,235,0.8)'; g.lineWidth = 4; g.font = '700 34px Inter'; g.fillStyle = 'rgba(245,245,235,0.85)'; g.fillText('UNSKILLED &', 40, 70); g.fillText('UNAWARE', 40, 118); g.beginPath(); g.moveTo(300, 200); g.lineTo(300, 70); g.moveTo(300, 200); g.lineTo(470, 200); g.stroke(); g.beginPath(); g.moveTo(300, 90); g.bezierCurveTo(330, 60, 350, 190, 470, 90); g.stroke(); });
    bx(4.3, 2.2, 0.12, '#6B4429', 0, 2.6, -8.9, LC.scene); const bd = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.95), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 })); bd.position.set(0, 2.6, -8.82); LC.scene.add(bd); bx(3.4, 1.0, 1.0, '#7A5236', 0, 0.5, -6.2, LC.scene); }
  const prof1 = P({ body: '#8A6A4A', head: SK[0], hair: 'bald', extra: ['glasses', 'mustache'], pattern: 'check', patCol: '#6A4E34' }), prof2 = P({ body: '#C06A8A', head: SK[2], hat: 'bun', hatCol: '#CFCFD8', extra: ['glasses'], neck: 'collar' });
  LC.scene.add(prof1.group, prof2.group); prof1.at(-0.55, 0, -4.4); prof2.at(0.65, 0, -4.6);

  const frame = (i, j) => [cut(i), j == null ? L(i + 1) - cut(i) : cut(j) - cut(i)];

  // ── 0 · "A man robbed a bank in broad daylight, with no mask," ──
  { const st = cut(0); add({ id: 'S0', at: st, note: 'robber strolls down the sunny street toward the bank, face shiny', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); ST.wave(t);
      stRob.at(3.7, 0.18, lerp(BZ + 3.6, BZ + 1.2, k)); stRob.set({ mood: 'smug', legs: 'walk', phase: t * 7, armL: [10, 10], armR: [10, 10], look: [0.3, 0], blink: blink(t) });
      shoot(ST.scene, [stRob], V3(0.2, 1.5, BZ + 6.4), V3(0.5, 1.55, BZ + 5.0), V3(3.7, 1.6, BZ + 3.6), k, 46, V3(3.7, 1.6, BZ + 1.2)); blit(); } }); cue(st, 'whoosh'); }
  // ── 1 · "and waved at the cameras." ──
  { const st = cut(1); add({ id: 'S1', at: st, dissolve: 0.0, note: 'in the bank, waving at the security camera', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      bkRob.at(-0.5, 0, -3.8); bkRob.set({ mood: 'happy', talk: 0, armR: [165 + Math.sin(t * 9) * 12, 25], armL: [10, 10], look: [0.8, -0.5], blink: blink(t) }); teller.set({ mood: 'shock', look: [-0.6, 0], armL: [40, 40], armR: [40, 40] }); bkRob.group.visible = true;
      shoot(BK.scene, [bkRob, teller], V3(0.2, 1.45, 0.4), V3(0.0, 1.5, -0.4), V3(-0.5, 1.5, -3.8), k, 40); blit(); rec(t, lt); } }); cue(st, 'whoosh'); cue(st + 0.25, 'cash', { gain: 0.5 }); }
  // ── 2 · "He was sure nobody could see his face," ──
  { const st = cut(2); add({ id: 'S2', at: st, note: 'big smug close-up, juice shining', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      stRob.at(0, 0, BZ + 2); stRob.group.visible = true; stRob.set({ mood: 'smug', talk: talk(t, t < Le(2) ? 1 : 0), blink: blink(t), look: [0, 0] });
      shoot(KI.scene, [kiRob], V3(0.1, 1.55, -3.9), V3(0.1, 1.55, -4.5), V3(0.1, 1.6, -6.3), k, 38); kiRob.set({ mood: 'smug', talk: talk(t), look: [0, 0], blink: blink(t) }); blit(); } }); cue(st, 'whoosh'); }
  // ── 3 · "because he'd covered it in lemon juice." ──
  { const st = cut(3), wj = Wd('lemon', 3); add({ id: 'S3', at: st, note: 'kitchen: rubbing lemon on face', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.at(0.1, 0, -6.3); kiRob.set({ mood: 'happy', talk: 0, armR: [150, 110 + Math.sin(t * 8) * 12], armL: [30, 30], look: [0, 0], blink: blink(t) });
      shoot(KI.scene, [kiRob], V3(0.5, 1.6, -3.0), V3(0.3, 1.55, -3.6), V3(0.1, 1.5, -6.0), k, 40); blit();
      X.chalk('LEMON JUICE', 540, 330, seg(t, wj - 0.1, wj + 0.3), { size: 118 }); } }); cue(st, 'whoosh'); cue(wj, 'splash', { gain: 0.5 }); }
  // ── 4 · "See, lemon juice works as invisible ink." ──
  { const st = cut(4), wi = Wd('invisible', 4); add({ id: 'S4', at: st, note: 'secret message paper fades away', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.set({ mood: 'sly', talk: talk(t), armR: [20, 20], armL: [20, 20], look: [-0.5, 0.3], blink: blink(t) });
      shoot(KI.scene, [kiRob], V3(-1.3, 2.0, -2.3), V3(-0.8, 1.9, -3.1), V3(0.0, 1.3, -5.3), k, 44); blit();
      const g = ctx, a = clamp((t - wi) / 1.2); g.save(); g.translate(540, 1000); g.rotate(-0.05); g.fillStyle = '#FBF6E8'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-340, -190, 680, 380, 18); g.fill(); g.stroke();
      g.globalAlpha = 1 - a; g.fillStyle = '#3A3A55'; g.font = '700 72px Inter'; g.textAlign = 'center'; g.fillText('SECRET MESSAGE', 0, -20); g.fillRect(-250, 40, 500, 12); g.fillRect(-250, 90, 380, 12); g.restore();
      X.chalk('INVISIBLE INK', 540, 330, seg(t, wi - 0.1, wi + 0.3), { size: 112 }); } }); cue(st, 'whoosh'); cue(wi, 'magic', { gain: 0.7 }); }
  // ── 5 · "So he figured it would hide his face, too." ──
  { const st = cut(5), wf = Wd('figured', 5); add({ id: 'S5', at: st, note: 'lightbulb moment', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.set({ mood: 'sly', talk: talk(t), armR: [110, 120], armL: [10, 10], look: [0.3, -0.5], blink: blink(t) });
      shoot(KI.scene, [kiRob], V3(0.9, 1.6, -3.4), V3(0.3, 1.6, -4.1), V3(0.1, 1.7, -6.3), k, 38); blit();
      const a = seg(t, wf, wf + 0.35), g = ctx; if (a > 0) { g.save(); g.translate(840, 470); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a); g.globalAlpha = a; g.fillStyle = '#FFD43B'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 80, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#C9CCD6'; g.fillRect(-34, 76, 68, 44); g.strokeRect(-34, 76, 68, 44);
        g.strokeStyle = '#FFD43B'; g.lineWidth = 10; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + 0.2; g.beginPath(); g.moveTo(Math.cos(an) * 112, Math.sin(an) * 112); g.lineTo(Math.cos(an) * 150, Math.sin(an) * 150); g.stroke(); } g.restore(); } } }); cue(st, 'whoosh'); cue(wf, 'sparkle', { gain: 0.6 }); }
  // ── 6 · "He even tested it, with a Polaroid selfie," ──
  { const st = cut(6); add({ id: 'S6', at: st, note: 'selfie with a Polaroid camera', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.set({ mood: 'happy', talk: 0, armR: [150, 30], holdR: CAM, armL: [10, 10], look: [0.2, 0], blink: blink(t) });
      shoot(KI.scene, [kiRob], V3(0.3, 1.6, -3.2), V3(0.1, 1.6, -3.7), V3(0.1, 1.65, -6.3), k, 38); blit(); const f = seg(t, Wd('polaroid', 6) + 0.25, Wd('polaroid', 6) + 0.4); if (f > 0 && f < 1) { ctx.save(); ctx.fillStyle = `rgba(255,255,255,${1 - f})`; ctx.fillRect(0, 0, W, H); ctx.restore(); } } }); cue(st, 'whoosh'); cue(Wd('polaroid', 6) + 0.25, 'glass', { gain: 0.5 }); }
  // ── 7 · "and his face wasn't in the photo!" ──
  { const st = cut(7); add({ id: 'S7', at: st, note: 'the photo: body, no head', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.set({ mood: 'shock', talk: talk(t), armR: [70, 60], holdR: null, look: [0, 0.4], blink: blink(t) });
      shoot(KI.scene, [kiRob], V3(0.5, 1.5, -3.3), V3(0.2, 1.5, -3.7), V3(0.0, 1.5, -6.3), k, 40); blit();
      const s = seg(lt, 0.05, 0.45), g = ctx; g.save(); g.fillStyle = 'rgba(20,20,30,0.38)'; g.fillRect(0, 0, W, H); g.translate(540, lerp(2100, 820, s)); g.rotate(-0.06);
      g.fillStyle = '#FBF8F0'; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-330, -380, 660, 780, 22); g.fill(); g.stroke(); g.fillStyle = '#D8E6D0'; g.fillRect(-290, -340, 580, 560); g.strokeRect(-290, -340, 580, 560);
      g.fillStyle = '#EFC85A'; g.fillRect(-290, 120, 580, 100); g.fillStyle = '#4F7FB8'; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-110, -10, 220, 300, 60); g.fill(); g.save(); g.beginPath(); g.rect(-290, -340, 580, 560); g.clip(); g.restore();
      g.setLineDash([16, 14]); g.strokeStyle = '#8A8A99'; g.beginPath(); g.arc(0, -110, 105, 0, 7); g.stroke(); g.setLineDash([]); g.fillStyle = '#8A8A99'; g.font = '900 110px Inter'; g.textAlign = 'center'; g.fillText('?', 0, -70); g.restore(); } }); cue(st, 'whoosh'); cue(st + 0.1, 'sparkle', { gain: 0.7 }); }
  // ── 8 · "Which was probably just a bad photo." ──
  { const st = cut(8), wb = Wd('bad', 8); add({ id: 'S8', at: st, note: 'robber shrugs it off', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.set({ mood: 'laugh', talk: talk(t), armR: [60, 80], armL: [60, 80], look: [0, 0], blink: blink(t), sweat: 0 });
      shoot(KI.scene, [kiRob], V3(-0.7, 1.6, -3.4), V3(-0.3, 1.6, -3.9), V3(0.1, 1.65, -6.3), k, 38); blit();
      X.chalk('BAD PHOTO', 540, 330, seg(t, wb - 0.1, wb + 0.3), { size: 122 }); } }); cue(st, 'whoosh'); }
  // ── 9 · "So he robbed two banks, smiling at every camera." ──
  { const st = cut(9), w2 = Wd('two', 9); add({ id: 'S9', at: st, note: 'bank counter, bag of money, big grin', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      bkRob.at(-0.2, 0, -3.8); bkRob.set({ mood: 'happy', talk: 0, armR: [20, 40], holdR: BAG, armL: [160 + Math.sin(t * 9) * 10, 20], look: [0.8, -0.6], blink: blink(t) }); teller.set({ mood: 'shock', look: [-0.6, 0], armL: [90, 30], armR: [90, 30], sweat: 1 });
      shoot(BK.scene, [bkRob, teller], V3(-1.8, 1.5, 0.2), V3(-0.4, 1.55, -0.3), V3(0.3, 1.5, -4.6), k, 42); blit(); rec(t, lt);
      const g = ctx; g.save(); [1, 2].forEach((n) => { const a = seg(t, w2 + (n - 1) * 0.5, w2 + (n - 1) * 0.5 + 0.25); if (a <= 0) return; g.save(); g.translate(300 + (n - 1) * 480, 350); g.scale(0.6 + 0.4 * a, 0.6 + 0.4 * a); g.rotate(n === 1 ? -0.06 : 0.05); g.globalAlpha = a;
        g.fillStyle = '#FFD43B'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-150, -64, 300, 128, 28); g.fill(); g.stroke(); g.fillStyle = INK; g.font = '900 68px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BANK #' + n, 0, 4); g.restore(); }); g.restore(); } }); cue(st, 'whoosh'); cue(w2, 'cash', { gain: 0.6 }); cue(w2 + 0.5, 'cash', { gain: 0.6 }); }
  // ── 10 · "That night, the news showed the tape," ──
  { const st = cut(10); add({ id: 'S10', at: st, note: 'push in on the TV news', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      lvTip.set({ mood: 'worried', look: [0.4, 0.2], blink: blink(t), armR: [10, 10], armL: [10, 10] });
      shoot(LV.scene, [lvTip], V3(0.0, 1.7, 0.6), V3(0.0, 1.85, -2.4), V3(0.0, 1.9, -8.6), k, 40); blit(); } }); cue(st, 'whoosh'); cue(st + 0.1, 'riser', { dur: 1.2, gain: 0.5 }); }
  // ── 11 · "and somebody knew him straight away." ──
  { const st = cut(11), wk = Wd('knew', 11); add({ id: 'S11', at: st, note: 'tipster on the sofa: THAT\'S HIM!', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      lvTip.at(-0.3, 0, -3.4); lvTip.set({ mood: t > wk ? 'shock' : 'worried', talk: talk(t, t > wk ? 1 : 0), armR: [110, 70], holdR: PHONE, armL: [10, 10], look: [0.2, 0.2], blink: blink(t) });
      shoot(LV.scene, [lvTip], V3(0.3, 1.55, -1.0), V3(0.1, 1.55, -1.7), V3(-0.3, 1.55, -3.4), k, 38); blit();
      X.chalk("THAT'S HIM!", 540, 330, seg(t, wk - 0.1, wk + 0.3), { size: 130, col: '#FFD43B' }); } }); cue(st, 'whoosh'); cue(wk, 'impact', { gain: 0.7 }); }
  // ── 12 · "When police arrived, he was shocked." ──
  { const st = cut(12); add({ id: 'S12', at: st, note: 'night street, police lights, robber shocked', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      lr.intensity = 14 * (Math.sin(t * 14) > 0 ? 1 : 0.1); lb.intensity = 14 * (Math.sin(t * 14) > 0 ? 0.1 : 1);
      snRob.at(4.9, 0.18, BZ + 0.6); cop.at(3.4, 0.0, BZ + 2.4); cop.group.visible = true; snRob.set({ mood: 'shock', talk: 0, sweat: 1, armL: [30, 40], armR: [30, 40], look: [-0.8, 0], blink: 0 }); cop.set({ mood: 'angry', look: [0.8, 0], armR: [20, 20], armL: [60, 70] });
      shoot(SN.scene, [snRob, cop], V3(2.0, 1.6, BZ + 6.5), V3(2.5, 1.6, BZ + 5.2), V3(4.2, 1.5, BZ + 1.2), k, 40); blit(); } }); cue(st, 'whoosh'); cue(st + 0.1, 'knock', { gain: 0.8 }); }
  // ── 13 · "He said, but I wore the juice!" ──
  { const st = cut(13), wj = Wd('wore', 13); add({ id: 'S13', at: st, note: 'big shocked face', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      lr.intensity = 10 * (Math.sin(t * 14) > 0 ? 1 : 0.1); lb.intensity = 10 * (Math.sin(t * 14) > 0 ? 0.1 : 1);
      cop.group.visible = false; snRob.at(4.6, 0.18, BZ + 0.6); snRob.set({ mood: 'shock', talk: talk(t), sweat: 1, armL: [70, 40], armR: [70, 40], look: [-0.5, 0], blink: 0 });
      shoot(SN.scene, [snRob], V3(3.0, 1.62, BZ + 3.3), V3(3.5, 1.62, BZ + 2.6), V3(4.6, 1.6, BZ + 0.6), k, 36); blit();
      X.chalk('I WORE THE JUICE!', 540, 330, seg(t, wj - 0.3, wj + 0.2), { size: 96, col: '#FFD43B' }); } }); cue(st, 'whoosh'); cue(wj - 0.2, 'riser', { dur: 0.8, gain: 0.6 }); cue(wj, 'boom', { gain: 0.6 }); }
  // ── 14 · "Two professors studied him, and found something wild:" ──
  { const st = cut(14); add({ id: 'S14', at: st, note: 'two professors in a classroom', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      prof1.set({ mood: 'happy', talk: talk(t), armL: [10, 10], armR: [100, 80], look: [0.4, 0], blink: blink(t) }); prof2.set({ mood: 'happy', talk: 0, armL: [10, 10], armR: [10, 10], look: [-0.4, 0], blink: blink(t, 1) });
      shoot(LC.scene, [prof1, prof2], V3(-0.3, 1.6, 0.2), V3(0.0, 1.65, -0.5), V3(0.05, 1.7, -4.5), k, 44); blit(); } }); cue(st, 'whoosh'); }
  // ── 15 · "the less people know, the surer they feel." ──
  { const st = cut(15), wl = Wd('less', 15); add({ id: 'S15', at: st, note: 'chalk graph: know vs sure', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      prof1.set({ mood: 'smug', talk: talk(t), armR: [110, 70], look: [0.2, 0], blink: blink(t) });
      shoot(LC.scene, [prof1, prof2], V3(0.0, 2.2, -1.4), V3(0.0, 2.3, -2.4), V3(0.0, 2.3, -6.8), k, 36); blit();
      const g = ctx, a = seg(t, wl - 0.1, wl + 0.3); g.save(); g.globalAlpha = 0.93 * a; g.fillStyle = '#23483A'; g.strokeStyle = '#6B4429'; g.lineWidth = 22; g.beginPath(); g.roundRect(80, 330, 920, 860, 26); g.fill(); g.stroke(); g.restore();
      if (a > 0) { const p = clamp((t - wl) / 2.0); g.save(); g.strokeStyle = '#F4F1EA'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(190, 1080); g.lineTo(190, 450); g.moveTo(190, 1080); g.lineTo(930, 1080); g.stroke();
        g.fillStyle = '#F4F1EA'; g.font = '800 56px Inter'; g.textAlign = 'center'; g.fillText('KNOW', 560, 1160); g.save(); g.translate(130, 760); g.rotate(-Math.PI / 2); g.fillText('SURE', 0, 0); g.restore();
        g.strokeStyle = '#FFD43B'; g.lineWidth = 12; g.beginPath(); const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; const y = 1080 - (u < 0.18 ? 520 * Math.sin(u / 0.18 * Math.PI / 2) : 520 - 380 * Math.sin((u - 0.18) / 0.5 * Math.PI / 2 > Math.PI / 2 ? Math.PI / 2 : (u - 0.18) / 0.5 * Math.PI / 2) + (u > 0.68 ? 380 * (u - 0.68) / 0.32 * 0.9 : 0)); pts.push([190 + u * 700, y]); }
        pts.forEach(([x, y], i) => { if (i / 60 <= p) i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
        if (p > 0.15) { g.fillStyle = '#FFD43B'; g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.ellipse(190 + 0.18 * 700, 560, 52, 40, 0.4, 0, 7); g.fill(); g.stroke(); } g.restore(); } } }); cue(st, 'whoosh'); }
  // ── 16 · "It's called the Dunning-Kruger effect." ──
  { const st = cut(16), wd = Wd('Dunning', 16); add({ id: 'S16', at: st, note: 'professors proud; chalk title', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      prof1.set({ mood: 'proud', talk: talk(t), armL: [10, 10], armR: [110, 70], look: [0.4, 0], blink: blink(t) }); prof2.set({ mood: 'proud', talk: 0, armL: [10, 10], armR: [10, 10], look: [-0.4, 0], blink: blink(t, 1) });
      shoot(LC.scene, [prof1, prof2], V3(0.3, 1.6, 0.2), V3(0.0, 1.65, -0.5), V3(0.05, 1.7, -4.5), k, 44); blit();
      X.chalk('DUNNING-KRUGER', 540, 330, seg(t, wd - 0.1, wd + 0.35), { size: 104 }); X.arrow(540, 460, 540, 560, seg(t, wd + 0.2, wd + 0.6)); } }); cue(st, 'whoosh'); cue(wd, 'magic', { gain: 0.6 }); }
  // ── 17 · "So next time you're totally sure," (same street as the start) ──
  { const st = cut(17); add({ id: 'S17', at: st, note: 'back on the sunny street, confident again', draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); ST.wave(t);
      stRob.at(3.7, 0.18, lerp(BZ + 1.2, BZ + 3.6, k)); stRob.set({ mood: 'smug', legs: 'walk', phase: t * 7, armL: [10, 10], armR: [10, 10], look: [0.3, 0], blink: blink(t) });
      shoot(ST.scene, [stRob], V3(0.5, 1.55, BZ + 5.0), V3(0.2, 1.5, BZ + 6.4), V3(3.7, 1.6, BZ + 1.2), k, 46, V3(3.7, 1.6, BZ + 3.6)); blit(); } }); cue(st, 'whoosh'); }
  // ── 18 · "check your Polaroid." ──
  { const st = cut(18), wc = Wd('check', 18); add({ id: 'S18', at: st, note: 'close-up with the Polaroid; chalk: CHECK YOUR POLAROID', draw(lt, d, t, blit) { const k = eio(clamp(lt / d));
      kiRob.at(0.1, 0, -6.3); kiRob.set({ mood: 'sly', talk: talk(t), armR: [120, 40], holdR: CAM, armL: [10, 10], look: [0, 0], blink: blink(t) });
      shoot(KI.scene, [kiRob], V3(0.1, 1.6, -3.9), V3(0.1, 1.6, -4.6), V3(0.1, 1.62, -6.3), k, 36); blit();
      X.chalk('CHECK YOUR', 540, 300, seg(t, wc - 0.1, wc + 0.3), { size: 112 }); X.chalk('POLAROID', 540, 440, seg(t, wc + 0.25, wc + 0.6), { size: 128, col: '#FFD43B' }); } }); cue(st, 'whoosh'); cue(wc + 0.3, 'magic', { gain: 0.7 }); }

  // sort & set dissolve on place changes
  S.sort((a, b) => a.at - b.at);
  const ambience = [{ type: 'city', from: 0, to: 3.2 }];
  return { shots: S, cues: CUES, ambience };
}
