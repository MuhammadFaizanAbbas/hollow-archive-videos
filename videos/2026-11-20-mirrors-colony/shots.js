// DON'T TOUCH THE MIRRORS (idea #705). Sets: day street, kitchen + toilet (mirrors on every wall), hills with grey aliens.
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as W2 from './core/world2.js';
import * as X from './core/fx2.js';
import * as FX from './core/fx.js';
import { Toon } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t) => 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3));
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const SK = ['#F6D9B5', '#EBC49A', '#D9A877', '#B98458'];
const LOOK = {
  zed: { body: '#F28C3C', head: SK[1], hat: 'beanie', hatCol: '#2E4E8A', neck: 'scarf', neckCol: '#F2C230', kid: true, extra: ['freckles'] },
  mayor: { body: '#4A4560', head: SK[0], hat: 'tophat', hatCol: '#2A2638', neck: 'bowtie', neckCol: '#D8343F', extra: ['mustache', 'monocle'] },
  lady: { body: '#C95F8E', head: SK[2], hat: 'bun', hatCol: '#5A3A24', extra: ['blush'] },
  man: { body: '#5E8F5A', pattern: 'stripes', patCol: '#F4F1EA', head: SK[3], hat: 'cap', hatCol: '#2A3048', extra: ['glasses'] },
};
const person = (k, o) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, o);
const INK = '#1F1C33';

// a framed mirror: bright glass with two shine streaks. faces +z.
function makeMirror(w = 1.6, h = 2.2) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.22, h + 0.22, 0.09), WD.mat({ color: '#C9953B', metalness: 0.3, roughness: 0.4 })); frame.castShadow = true; inner.add(frame);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ toneMapped: false, map: WD.canvasTex('mir', 256, 384, (c, cw, ch) => {
    const gr = c.createLinearGradient(0, 0, cw, ch); gr.addColorStop(0, '#E8F6FF'); gr.addColorStop(0.5, '#B6DCF2'); gr.addColorStop(1, '#8EC3E6'); c.fillStyle = gr; c.fillRect(0, 0, cw, ch);
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(cw * 0.1, ch); c.lineTo(cw * 0.35, ch); c.lineTo(cw * 0.9, 0); c.lineTo(cw * 0.65, 0); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.moveTo(cw * 0.45, ch); c.lineTo(cw * 0.55, ch); c.lineTo(cw, ch * 0.25); c.lineTo(cw, ch * 0.1); c.fill(); }) }));
  glass.position.z = 0.05; inner.add(glass);
  g.userData.inner = inner; return g;
}
// a tall grey alien (faces +z)
function makeAlien(sc = 1) {
  const g = new THREE.Group(), grey = () => WD.mat({ color: '#A9B3BC' });
  const add = (m, x, y, z, p = g) => { m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 2.2, 14), WD.mat({ color: '#6E7FA8' })), 0, 2.2, 0);
  const head = new THREE.Group(); head.position.set(0, 3.9, 0); g.add(head);
  const hm = add(new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 18), grey()), 0, 0.25, 0, head); hm.scale.set(1, 1.2, 0.95);
  [-0.4, 0.4].forEach((x) => { const e = add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), new THREE.MeshBasicMaterial({ color: '#16162B' })), x, 0.25, 0.78, head); e.scale.set(0.9, 1.4, 0.45); e.rotation.z = x * 0.7;
    add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })), x - 0.06, 0.4, 1.0, head); });
  const mo = add(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 14, Math.PI), new THREE.MeshBasicMaterial({ color: '#3A4150' })), 0, -0.3, 0.88, head); mo.rotation.z = Math.PI;
  const limb = (x, len, y, r) => { const pv = new THREE.Group(); pv.position.set(x, y, 0); g.add(pv); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.7, len, 8), grey()); m.position.y = -len / 2; m.castShadow = true; pv.add(m); return pv; };
  const armL = limb(-0.55, 1.9, 3.0, 0.1), armR = limb(0.55, 1.9, 3.0, 0.1), legL = limb(-0.25, 1.1, 1.15, 0.12), legR = limb(0.25, 1.1, 1.15, 0.12);
  g.scale.setScalar(sc); return { g, head, armL, armR, legL, legR };
}
function poseAlien(A, t, o = {}) { const { count = 0, scared = 0, walk = 0 } = o; const s = Math.sin(t * 6);
  A.head.rotation.z = Math.sin(t * 2.2) * 0.12 + scared * Math.sin(t * 30) * 0.05; A.head.rotation.x = 0.1 * Math.sin(t * 3);
  A.armR.rotation.z = lerp(-0.1, -2.3, count) + (count ? Math.sin(t * 7) * 0.15 : 0); A.armL.rotation.z = lerp(0.1, 1.3, scared) + scared * Math.sin(t * 22) * 0.2;
  A.legL.rotation.x = s * walk; A.legR.rotation.x = -s * walk; }
function tag() { const g = ctx; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.9; g.fillStyle = 'rgba(20,18,40,0.55)'; g.beginPath(); g.roundRect(48, 210, 190, 54, 14); g.fill();
  g.fillStyle = '#FFFFFF'; g.font = '800 30px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '3px'; g.fillText('FICTION', 143, 238); g.restore(); }

export function buildShots(E) {
  const S = [];
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.12, bloomThreshold: 0.92 };
  const shoot = (scene, people, from, to, at, at2, k, fov = 36) => {
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at); people.forEach((p) => p.face(cam)); E.render(scene, cam, { ...LK });
  };

  // ── STREET (day) with mirrors on every facade ───────────────────────
  const ST = W2.townStreet(E, { bank: null });
  [-1, 1].forEach((s) => [-3, -10, -17, -24, -31].forEach((z, i) => { const m = makeMirror(1.5, 2.1); m.position.set(s * 5.9, 2.0 + (i % 2) * 0.4, z); m.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; ST.scene.add(m); }));
  const zedS = person('zed', { height: 1.4 }), mayS = person('mayor'), ladyS = person('lady'), manS = person('man');
  [zedS, mayS, ladyS, manS].forEach((p) => ST.scene.add(p.group));

  // ── KITCHEN (mirrors on all three walls) ────────────────────────────
  const KI = W2.room2(E, { w: 8, depth: 7, wall: '#EBD2A0', wains: '#B8864F', floor: '#C58A52', windows: [['right', -3.5]], posters: [], clockAt: null });
  [['back', 2.4], ['back', 0], ['left', -3.2], ['left', 0.8], ['right', -1.4]].forEach(([n, along]) => { const m = makeMirror(1.5, 2.2); m.position.set(along, 2.4, 0.07); KI.walls[n].add(m); });
  const hang = makeMirror(1.5, 2.2); hang.position.set(-2.4, 2.4, 0.07); KI.walls.back.add(hang);
  { const tbl = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.2), WD.mat({ color: '#8A5A36' })); tbl.position.set(2.2, 0.45, -4.2); tbl.castShadow = tbl.receiveShadow = true; KI.add(tbl);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.4, 14), WD.mat({ color: '#B5372E' })); pot.position.set(2.2, 1.1, -4.2); KI.add(pot); }
  const zedK = person('zed', { height: 1.4 }), mayK = person('mayor'), ladyK = person('lady'), manK = person('man'); [zedK, mayK, ladyK, manK].forEach((p) => KI.add(p.group));
  const kmir = makeMirror(1.5, 2.2); kmir.visible = false; KI.add(kmir);
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.3), new THREE.MeshBasicMaterial({ color: '#F7EACB', toneMapped: false })); hole.position.set(-2.4, 2.4, -6.97); hole.visible = false; KI.add(hole);

  // ── TOILET (tiny room, mirrors everywhere) ──────────────────────────
  const TO = W2.room2(E, { w: 3.6, depth: 3.6, wall: '#E7D6F2', wains: '#8FB5C9', floor: '#9ABBD0', windows: [], posters: [], clockAt: null, lamps: false });
  [['back', 0], ['left', -0.4], ['right', 0.4]].forEach(([n, a]) => { const m = makeMirror(1.5, 2.4); m.position.set(a, 2.1, 0.06); TO.walls[n].add(m); });
  { const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.45, 18), WD.mat({ color: '#FFFFFF' })); bowl.position.set(0, 0.25, -2.7); bowl.castShadow = true; TO.add(bowl);
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.28), WD.mat({ color: '#FFFFFF' })); tank.position.set(0, 0.8, -3.2); TO.add(tank); }
  const manT = person('man'); TO.add(manT.group);

  // ── HILLS with the aliens, and the colony below ─────────────────────
  const HL = new THREE.Scene(); W2.paintedSky(HL, { top: '#2F6FC4', horizon: '#CFE6F7' });
  W2.softLight(HL, E, { pos: [6, 14, 4], target: [0, 0, -10], box: 24, hemi: 1.9, ki: 2.2 });
  const grd = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), WD.mat({ color: '#6DB04C' })); grd.rotation.x = -Math.PI / 2; grd.receiveShadow = true; HL.add(grd);
  const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), WD.mat({ color: '#5FAE4A' })); hill.scale.set(22, 5, 7); hill.position.set(0, 0, -20); hill.castShadow = hill.receiveShadow = true; HL.add(hill);
  const hill2 = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), WD.mat({ color: '#6CBA55' })); hill2.scale.set(14, 3.4, 6); hill2.position.set(-16, 0, -14); HL.add(hill2);
  for (let i = 0; i < 7; i++) { const g = new THREE.Group(), cols = ['#F2C27A', '#E58F7A', '#9ED3F2', '#F4EFE4'];
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.2), WD.mat({ color: cols[i % 4] })); b.position.y = 0.9; b.castShadow = true; g.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.1, 4), WD.mat({ color: '#B5372E' })); r.rotation.y = Math.PI / 4; r.position.y = 2.35; r.castShadow = true; g.add(r);
    const m = makeMirror(1.1, 1.3); m.position.set(0, 1.0, -1.15); m.rotation.y = Math.PI; g.add(m);
    g.position.set(-7.5 + i * 2.5, 0, -6 + (i % 2) * 1.2); HL.add(g); }
  const AL = [[-4.5, -20], [-1.5, -19.5], [1.5, -20], [4.5, -19.5], [-3, -18], [3, -18]].map(([x, z], i) => { const A = makeAlien(1.0 + 0.1 * (i % 3)); A.g.position.set(x, 4.2, z); A.g.rotation.y = 0; A.g.visible = false; HL.add(A.g); return A; });
  const showAliens = (n, t, o = {}) => AL.forEach((A, i) => { A.g.visible = i < n; poseAlien(A, t + i * 0.7, { ...o, count: o.count ? 1 : 0 }); });
  const hideAliens = () => AL.forEach((A) => { A.g.visible = false; });

  // ── shot builder ────────────────────────────────────────────────────

  const v = (a, b, c) => V3(a, b, c);
  const CAM = {
    S01: [v(-2.4, 2.0, 3.0), v(-1.6, 2.2, -1.0), v(5.9, 2.6, -12), null, 46],
    S12: [v(-2, 2.8, 3), v(0.5, 3.3, 0), v(0, 4.9, -19.5), null, 42],
    S00: [v(-0.2, 1.45, -2.0), v(-0.9, 1.45, -2.9), v(-1.4, 1.4, -5.0), null, 36],
    S00b: [v(-0.6, 1.4, -3.0), v(-1.0, 1.45, -3.6), v(-1.4, 1.45, -5.0), null, 30],
    S01b: [v(0, 1.9, 2.5), v(0, 2.0, 1.5), v(0, 2.2, -7), null, 62],
    S04b: [v(0, 4.5, 0), v(0, 5.0, -3), v(0, 4.0, -20), null, 36],
    S05: [v(-0.8, 1.4, -2.2), v(-1.4, 1.4, -3.2), v(-1.8, 1.4, -5.0), null, 34],
    S05b: [v(-0.4, 1.4, -1.6), v(-1.0, 1.5, -2.4), v(-2.0, 1.25, -5.4), null, 40],
    S07: [v(-1.5, 1.4, -0.8), v(0.5, 1.4, -1.2), v(0, 1.2, -4.8), v(1.0, 1.3, -4.8), 55],
    S07b: [v(0.6, 0.6, -2.0), v(0.9, 0.7, -2.6), v(1.0, 0.5, -4.6), null, 44],
    S08: [v(0, 1.5, -0.8), v(0, 1.55, -1.6), v(-0.2, 1.4, -4.6), null, 46],
    S09: [v(-0.6, 1.4, -1.6), v(-1.2, 1.5, -2.4), v(-2.0, 1.3, -5.6), null, 40],
    S09b: [v(-1.0, 2.0, -3.0), v(-1.8, 2.3, -4.0), v(-2.4, 2.4, -6.9), null, 36],
    S10: [v(-1.1, 1.4, -2.8), v(-1.5, 1.45, -3.4), v(-1.8, 1.45, -5.0), null, 30],
    S11: [v(1.2, 1.4, -2.4), v(2.2, 1.45, -3.2), v(3.2, 1.35, -4.6), null, 36],
    S13: [v(0, 1.5, -0.2), v(0, 1.55, -1.0), v(0, 1.4, -4.6), null, 50],
    S16: [v(-0.4, 1.6, -1.6), v(-1.2, 1.8, -2.6), v(-2.0, 1.55, -5.8), null, 42],
    S17: [v(0.8, 1.2, -0.6), v(0.2, 1.0, -1.4), v(-0.6, 0.8, -3.5), null, 36],
    S18: [v(-0.2, 1.45, -2.0), v(-0.9, 1.45, -2.9), v(-1.4, 1.4, -5.0), null, 36],
  };
  const add = (o) => S.push({ ...o, draw(lt, d, t, blit) { o.draw(lt, d, t, blit); tag(); } });
  const mk = (id, at, scene, ppl, from, to, a1, a2, pose, o = {}) => add({ id, at, grade: o.grade, weather: o.weather, weatherK: o.weatherK, flash: o.flash, dissolve: o.dissolve,
    draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); pose && pose(lt, d, t, k); const cc = CAM[id]; if (cc) { from = cc[0]; to = cc[1]; a1 = cc[2]; a2 = cc[3]; o = { ...o, fov: cc[4] }; } const sk = o.shake ? FX.shake(lt, o.shake, 0.12, 0.45) : [0, 0];
      shoot(scene, ppl, from.clone().add(V3(sk[0], sk[1], 0)), to.clone().add(V3(sk[0], sk[1], 0)), a1, a2, k, o.fov || 36); blit(); o.over && o.over(lt, d, t, k); } });
  const all = [zedS, mayS, ladyS, manS, zedK, mayK, ladyK, manK, manT];
  const hideAll = () => { all.forEach((p) => { p.group.visible = false; }); kmir.visible = false; hole.visible = false; hang.visible = true; hang.position.set(-2.4, 2.4, 0.07); hang.rotation.set(0, 0, 0); hang.userData.inner.rotation.z = 0; hideAliens(); };
  const put = (p, x, y, z) => { p.group.visible = true; p.at(x, y, z); };
  const sp = [zedS, mayS, ladyS, manS], kp = [zedK, mayK, ladyK, manK], tp = [manT];

  // 0: HOOK "Don't. Touch. The mirrors."  (loop frame = kitchen, Zed reaching for a mirror, camera pushing in)
  const hook = (lt, d, t) => { hideAll(); put(zedK, -1.4, 0, -5.0); zedK.set({ mood: 'worried', sweat: 1, armR: [150, 20], look: [-0.5, 0.2], blink: blink(t) }); };
  const hookBadge = (lt) => FX.badge("DON'T TOUCH!", 540, 560, seg(lt, 0.15, 0.5), 110, '#E63946');
  mk('S00', 0, KI.scene, kp, V3(0.4, 1.6, 0.0), V3(-0.4, 1.7, -1.4), V3(-0.8, 1.7, -4.2), V3(-1.8, 2.0, -6.8), hook, { fov: 40, over: hookBadge });
  mk('S00b', 1.0, KI.scene, kp, V3(-1.0, 1.2, -1.0), V3(-1.2, 1.5, -2.2), V3(-1.3, 1.5, -3.2), null, hook, { fov: 32, flash: [0.02], over: (lt) => FX.speedLines(lt, 0.5, 540, 700) });
  // 1: "On this colony, every house has mirrors on every wall."
  mk('S01', cut(1), ST.scene, sp, V3(-2.0, 2.0, 5.0), V3(-0.8, 2.6, 0.4), V3(0.0, 3.0, -16), V3(0.0, 3.2, -22), (lt, d, t) => { hideAll(); ST.wave(t); }, { weather: 'sparkle', weatherK: 0.5 });
  mk('S01b', L(1) + 1.45, KI.scene, kp, V3(-3.0, 1.8, -0.5), V3(-1.2, 2.2, -1.4), V3(0, 2.2, -7.0), V3(-0.5, 2.3, -7.0), () => { hideAll(); }, { fov: 52, over: (lt) => X.chalk('EVERY WALL', 540, 520, seg(lt, 0.3, 0.8), { size: 120, col: '#FFE066' }) });
  // 2: "Even the toilet."
  mk('S02', cut(2), TO.scene, tp, V3(0.0, 1.5, 0.1), V3(0.0, 1.5, -0.5), V3(0.0, 1.35, -2.7), null, (lt, d, t) => { hideAll(); put(manT, 0, 0.4, -2.55); manT.set({ mood: 'shock', legs: 'sit', armL: [60, 90], armR: [60, 90], talk: talk(t), blink: blink(t) }); },
    { fov: 46, flash: [0.02], over: (lt) => FX.badge('EVEN HERE!', 540, 520, seg(lt, 0.2, 0.5), 100, '#8E44AD') });
  // 3: "I'm Zed. I just landed, and I asked why."
  mk('S03', cut(3), ST.scene, sp, V3(-0.8, 1.2, 2.4), V3(-0.7, 1.45, 0.4), V3(-1.2, 1.5, -3.0), null, (lt, d, t) => { hideAll(); ST.wave(t); put(zedS, -1.2, 0.18, -3.0); zedS.set({ mood: 'happy', armR: [130 + 20 * Math.sin(t * 8), 30], talk: talk(t), blink: blink(t) }); }, { fov: 36 });
  mk('S03b', L(3) + 1.5, ST.scene, sp, V3(-0.3, 1.5, 0.2), V3(-0.8, 1.55, -0.6), V3(-1.2, 1.5, -3.0), null, (lt, d, t) => { hideAll(); put(zedS, -1.2, 0.18, -3.0); put(mayS, 0.8, 0.18, -3.4); zedS.set({ mood: 'worried', armL: [40, 40], talk: talk(t), look: [0.6, 0], blink: blink(t) }); mayS.set({ mood: 'neutral', look: [-0.4, 0.5], blink: blink(t, 1) }); },
    { fov: 34, over: (lt) => X.chalk('why??', 760, 560, seg(lt, 0.3, 0.7), { size: 140, col: '#FFE066' }) });
  // 4: "Everyone just stared at the hills."
  mk('S04', cut(4), ST.scene, sp, V3(-0.4, 1.3, 0.8), V3(0.0, 1.4, -0.4), V3(0.2, 1.8, -3.4), null, (lt, d, t) => { hideAll(); ST.wave(t); put(ladyS, -1.4, 0.18, -3.4); put(manS, 0.3, 0.18, -3.2); put(mayS, 1.7, 0.18, -3.5); [ladyS, manS, mayS].forEach((p, i) => p.set({ mood: 'worried', look: [0.2, 0.9], blink: blink(t, i) })); }, { fov: 38 });
  mk('S04b', L(4) + 1.1, HL, [], V3(0, 1.8, 4.0), V3(0, 2.0, 2.0), V3(0, 3.8, -20), V3(0.5, 4.0, -20), () => { hideAll(); }, { fov: 34, over: (lt) => X.chalk('...', 540, 640, seg(lt, 0.3, 0.7), { size: 150 }) });
  // 5: "But I hate mirrors, so I took one down."
  mk('S05', cut(5), KI.scene, kp, V3(-0.4, 1.4, 0.6), V3(-1.2, 1.5, -0.4), V3(-1.6, 1.6, -4.0), null, (lt, d, t) => { hideAll(); put(zedK, -1.8, 0, -5.0); zedK.set({ mood: 'angry', look: [0.4, 0.4], armR: [150, 20], talk: talk(t), blink: blink(t) }); }, { fov: 34 });
  mk('S05b', L(5) + 1.25, KI.scene, kp, V3(-0.5, 1.5, 0.0), V3(-1.0, 1.8, -1.2), V3(-1.8, 1.9, -5.0), null, (lt, d, t) => { hideAll(); put(zedK, -1.8, 0, -5.0); const u = eo(seg(lt, 0.1, 0.8)); hang.position.set(lerp(-2.4, -1.6, u), lerp(2.4, 1.5, u), lerp(0.07, 1.6, u)); hang.rotation.x = -0.25 * u;
    zedK.set({ mood: 'smug', armL: [120, 20], armR: [120, 20], blink: blink(t), talk: talk(t) }); }, { fov: 38, flash: [0.8] });
  // 6: "The whole street went silent."
  mk('S06', cut(6), ST.scene, sp, V3(0.0, 1.6, 3.4), V3(0.0, 1.8, 1.6), V3(-0.2, 1.7, -3.2), null, (lt, d, t) => { hideAll(); ST.wave(t); put(ladyS, -1.7, 0.18, -3.0); put(manS, -0.3, 0.18, -3.3); put(mayS, 1.2, 0.18, -3.0); put(zedS, 2.5, 0.18, -3.4);
    [ladyS, manS, mayS, zedS].forEach((p, i) => p.set({ mood: 'shock', blink: blink(t, i), sweat: 1 })); }, { fov: 38, grade: 'cold', over: (lt) => X.chalk('...', 540, 560, seg(lt, 0.2, 0.6), { size: 160 }) });
  // 7: "The mayor sprinted in, wearing one slipper."
  mk('S07', cut(7), KI.scene, kp, V3(-3.0, 1.2, -1.0), V3(1.8, 1.3, -1.6), V3(0.0, 1.2, -4.5), null, (lt, d, t) => { hideAll(); const u = eio(seg(lt, 0, 1.0)); put(mayK, lerp(-3.6, 1.0, u), 0, -4.8); mayK.set({ mood: 'shock', sweat: 1, legs: 'run', phase: t * 11, armL: [60 + 40 * Math.sin(t * 11), 30], armR: [60 - 40 * Math.sin(t * 11), 30], talk: talk(t) }); }, { fov: 36 });
  mk('S07b', L(7) + 1.45, KI.scene, kp, V3(0.4, 0.5, -1.4), V3(0.9, 0.7, -2.4), V3(1.0, 0.5, -3.8), null, (lt, d, t) => { hideAll(); put(mayK, 1.0, 0, -4.6); mayK.set({ mood: 'worried', sweat: 1, legs: 'stand', blink: blink(t) }); }, { fov: 44, over: (lt) => X.chalk('ONE SLIPPER', 540, 360, seg(lt, 0.2, 0.7), { size: 130, col: '#FFE066' }) });
  // 8: "Put it back! Put it back!"
  mk('S08', cut(8), KI.scene, kp, V3(0.4, 1.5, -0.8), V3(0.3, 1.6, -1.8), V3(0.2, 1.6, -3.8), null, (lt, d, t) => { hideAll(); put(mayK, 0.45, 0, -4.6); put(ladyK, -0.65, 0, -4.6); mayK.set({ mood: 'angry', armL: [150, 20], armR: [150, 20], talk: talk(t), sweat: 1, bob: Math.sin(t * 14) * 0.15 }); ladyK.set({ mood: 'shock', armL: [140, 30], armR: [140, 30], talk: talk(t), blink: blink(t) }); },
    { fov: 36, shake: [0.1, 0.8], over: (lt) => FX.speedLines(lt, 0.8, 540, 760) });
  // 9: "So I hung it up again. Upside down."
  mk('S09', cut(9), KI.scene, kp, V3(-0.6, 1.3, -0.2), V3(-1.2, 1.6, -1.2), V3(-1.8, 1.8, -3.8), V3(-2.2, 2.2, -4.5), (lt, d, t) => { hideAll(); put(zedK, -1.8, 0, -5.0); hang.userData.inner.rotation.z = Math.PI * eo(seg(lt, 0.1, 0.7)); zedK.set({ mood: 'sly', armR: [150, 30], blink: blink(t), talk: talk(t) }); }, { fov: 36 });
  mk('S09b', L(9) + 1.2, KI.scene, kp, V3(-0.4, 2.2, -1.0), V3(-1.2, 2.4, -2.4), V3(-2.4, 2.4, -6.9), null, (lt, d, t) => { hideAll(); hang.userData.inner.rotation.z = Math.PI; put(mayK, -0.6, 0, -4.4); mayK.set({ mood: 'shock', armL: [90, 90], blink: blink(t) }); }, { fov: 36, over: (lt) => X.chalk('UPSIDE DOWN', 540, 470, seg(lt, 0.2, 0.7), { size: 120, col: '#FFE066', rot: 0.03 }) });
  // 10: "Ha ha ha!"
  mk('S10', cut(10), KI.scene, kp, V3(-1.1, 1.4, -0.9), V3(-1.1, 1.45, -1.7), V3(-1.8, 1.45, -3.4), null, (lt, d, t) => { hideAll(); put(zedK, -1.8, 0, -5.0); zedK.set({ mood: 'laugh', talk: 0.5 + 0.4 * Math.sin(t * 16), bob: Math.sin(t * 14) * 0.2, blink: 0 }); }, { fov: 30, flash: [0.05], weather: 'confetti', weatherK: 0.5 });
  // 11: "But then I peeked out of the window."
  mk('S11', cut(11), KI.scene, kp, V3(1.0, 1.5, -1.0), V3(2.6, 1.6, -2.4), V3(3.6, 1.7, -3.6), null, (lt, d, t) => { hideAll(); put(zedK, 3.2, 0, -4.6); zedK.set({ mood: 'worried', sweat: 1, look: [0.9, 0.2], armR: [110, 60], blink: blink(t), lean: 12 }); }, { fov: 34, grade: 'cold' });
  // 12: "Tall grey aliens, counting our houses."
  mk('S12', cut(12), HL, [], V3(-2.0, 1.2, 4.0), V3(0.5, 1.8, 1.2), V3(0.0, 4.6, -19.5), V3(0.0, 5.0, -19.5), (lt, d, t) => { hideAll(); showAliens(6, t, { count: true }); }, { fov: 40, flash: [0.02], over: (lt) => FX.badge('?!', 540, 500, seg(lt, 0.15, 0.45), 130, '#E63946') });
  mk('S12b', L(12) + 1.5, HL, [], V3(-3.0, 8.0, -14.0), V3(-1.0, 8.2, -15.5), V3(0.0, 1.0, -4.0), null, (lt, d, t) => { hideAll(); showAliens(6, t, { count: true }); },
    { fov: 44, over: (lt) => { const n = Math.min(9, 1 + Math.floor(seg(lt, 0, 1.2) * 9)); X.chalk(String(n), 800, 520, 1, { size: 220, col: '#FFE066' }); } });
  // 13: "Then the mayor explained."
  mk('S13', cut(13), KI.scene, kp, V3(-0.4, 1.5, -0.2), V3(-0.2, 1.6, -1.2), V3(0.3, 1.6, -3.8), null, (lt, d, t) => { hideAll(); put(mayK, 0.55, 0, -4.6); put(zedK, -0.6, 0, -4.6); mayK.set({ mood: 'happy', armR: [100 + 15 * Math.sin(t * 5), 60], talk: talk(t), blink: blink(t) }); zedK.set({ mood: 'worried', look: [0.8, 0], blink: blink(t, 1) }); }, { fov: 34 });
  // 14: "Every mirror doubles our numbers,"  INSERT CARD: one house, and its reflection makes two
  add({ id: 'S14', at: cut(14), flash: [0.02], draw(lt, d, t) { const k = seg(lt, 0, 0.3); FX.insertCard(lt, k, (g, cx, cy) => { g.lineJoin = 'round'; g.lineWidth = 9; g.strokeStyle = INK;
      const house = (x, y, a, col) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(x - 130, y - 100, 260, 200); g.strokeRect(x - 130, y - 100, 260, 200); g.fillStyle = '#B5372E'; g.beginPath(); g.moveTo(x - 170, y - 100); g.lineTo(x, y - 230); g.lineTo(x + 170, y - 100); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#9ED3F2'; g.fillRect(x - 40, y - 40, 80, 120); g.strokeRect(x - 40, y - 40, 80, 120); g.restore(); };
      house(cx - 250, cy - 120, 1, '#F2C27A');
      g.fillStyle = '#C9953B'; g.fillRect(cx - 60, cy - 330, 120, 440); g.strokeRect(cx - 60, cy - 330, 120, 440); g.fillStyle = '#B6DCF2'; g.fillRect(cx - 44, cy - 314, 88, 408);
      house(cx + 250, cy - 120, 0.85 * seg(lt, 0.3, 0.7), '#F2C27A');
      FX.badge('x2', cx, cy + 250, seg(lt, 0.7, 1.0), 200, '#2FA84F'); }, { cy: 0.45 }); } });
  // 15: "so the aliens think we're too big to attack."
  mk('S15', cut(15), HL, [], V3(-1.5, 3.5, -10.0), V3(0.5, 3.9, -13.5), V3(0.0, 4.8, -19.5), V3(0.0, 5.0, -19.5), (lt, d, t) => { hideAll(); showAliens(6, t, { scared: seg(lt, 0.3, 0.8) }); }, { fov: 40, shake: [0.4], over: (lt) => { X.chalk('TOO BIG!', 540, 420, seg(lt, 0.3, 0.8), { size: 150, col: '#FFE066' }); } });
  mk('S15b', L(15) + 1.45, HL, [], V3(0.0, 6.0, -6.0), V3(0.0, 6.5, -9.0), V3(0.0, 4.4, -22.0), V3(0.0, 4.4, -26.0), (lt, d, t) => { hideAll(); const u = eio(seg(lt, 0, 1.0)); AL.forEach((A, i) => { A.g.visible = true; A.g.position.z = -19.5 - u * 9 - (i % 3) * 0.3; A.g.rotation.y = Math.PI; poseAlien(A, t + i, { walk: 0.9 }); }); },
    { fov: 40, weather: 'confetti', weatherK: 0.4 });
  // 16: "My missing mirror left a hole in the count."
  mk('S16', cut(16), KI.scene, kp, V3(-0.8, 1.8, 0.0), V3(-1.4, 2.2, -1.6), V3(-2.4, 2.3, -6.9), null, (lt, d, t) => { hideAll(); hang.visible = false; hole.visible = true; put(zedK, -1.0, 0, -4.8); zedK.set({ mood: 'sad', look: [-0.3, 0.5], blink: blink(t) }); },
    { fov: 40, over: (lt) => { X.arrow(780, 470, 580, 640, seg(lt, 0.3, 0.8), { col: '#FFE066' }); X.chalk('HOLE', 840, 410, seg(lt, 0.4, 0.8), { size: 130, col: '#FFE066' }); } });
  // 17: "Now I sleep in the kitchen, hugging that mirror."
  mk('S17', cut(17), KI.scene, kp, V3(0.6, 1.4, -0.6), V3(0.0, 1.0, -1.6), V3(-0.6, 0.55, -3.6), null, (lt, d, t) => { hideAll(); hang.visible = false; hole.visible = true; put(zedK, -0.9, 0.12, -3.6); zedK.set({ mood: 'tired', legs: 'sit', armL: [70, 100], armR: [70, 100], blink: lt > 0.5 ? 1 : 0 }); kmir.visible = true; kmir.position.set(-0.2, 0.85, -3.5); kmir.scale.setScalar(0.6); kmir.rotation.x = -0.15; },
    { fov: 36, grade: 'warm', over: (lt, d, t) => { X.chalk('z z z', 800, 600 - 40 * Math.sin(t * 2), seg(lt, 0.2, 0.7), { size: 120, col: '#FFFFFF' }); } });
  // 18: loop, same set and framing as the hook
  mk('S18', cut(18), KI.scene, kp, V3(0.4, 1.6, 0.0), V3(-0.4, 1.7, -1.4), V3(-0.8, 1.7, -4.2), V3(-1.8, 2.0, -6.8), hook, { fov: 40, over: hookBadge });
  return { shots: S, cues: [] };
}
