// DON'T WHISTLE TONIGHT (idea #704): the shot list. Sets: dusk farm field, night town street. Sand giants sleep under the hills.
import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eo, eio, eob } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as W2 from './core/world2.js';
import * as X from './core/fx2.js';
import * as FX from './core/fx.js';
import { Toon, PROPS } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t) => 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3));
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const SK = ['#F6D9B5', '#EBC49A', '#D9A877', '#B98458'];
const LOOK = {
  zed: { body: '#F28C3C', head: SK[1], hat: 'beanie', hatCol: '#2E4E8A', neck: 'scarf', neckCol: '#F2C230', kid: true, extra: ['freckles'] },
  farmer: { body: '#9ED3F2', pattern: 'stripes', patCol: '#FFFFFF', head: SK[2], hat: 'beanie', hatCol: '#9ED3F2', extra: ['mustache'] },
  mayor: { body: '#4A4560', head: SK[0], hat: 'tophat', hatCol: '#2A2638', neck: 'bowtie', neckCol: '#D8343F', extra: ['mustache', 'monocle'] },
  baker: { body: '#F4F1EA', pattern: 'apron', patCol: '#E8C77A', head: SK[3], hat: 'beanie', hatCol: '#FFFFFF', extra: ['mustache'] },
};
const person = (k, o) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, o);
const sandMat = () => WD.mat({ color: '#E3AB66' }), darkMat = () => WD.mat({ color: '#C48A4C' });

// a friendly sand giant: big sandy blob, round eyes, little smile, stubby arms and legs; faces +z
function makeGiant(sc = 1) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  const add = (m, x, y, z, p = inner) => { m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const body = add(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), sandMat()), 0, 2.2, 0); body.scale.set(1.5, 1.7, 1.3);
  [[-0.9, 2.9, 0.4, 0.55], [0.8, 1.4, 0.7, 0.45], [-0.3, 1.2, 1.05, 0.4]].forEach(([x, y, z, r]) => { const p = add(new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), darkMat()), x, y, z); p.scale.z = 0.25; p.castShadow = false; });
  [-0.5, 0.5].forEach((x) => { add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), WD.mat({ color: '#FFFFFF' })), x, 2.8, 1.08);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), WD.mat({ color: '#1F1C33' })), x, 2.8, 1.35); });
  const mouth = add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 8, 20, Math.PI), WD.mat({ color: '#5A3A24' })), 0, 2.4, 1.26); mouth.rotation.z = Math.PI; mouth.castShadow = false;
  const limb = (r, h, x, y, rx) => { const pv = new THREE.Group(); pv.position.set(x, y, 0); inner.add(pv); const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, h, 12), sandMat()); m.position.y = -h / 2; m.castShadow = true; pv.add(m);
    const e = new THREE.Mesh(new THREE.SphereGeometry(r * 1.15, 12, 10), sandMat()); e.position.y = -h; pv.add(e); return pv; };
  const armL = limb(0.28, 1.4, -1.5, 2.6), armR = limb(0.28, 1.4, 1.5, 2.6), legL = limb(0.4, 1.0, -0.65, 1.1), legR = limb(0.4, 1.0, 0.65, 1.1);
  g.scale.setScalar(sc); return { g, inner, armL, armR, legL, legR, sc };
}
function poseGiant(G, t, amp, spin = 0, bow = 0) {
  const s = Math.sin(t * 5.2);
  G.inner.position.y = Math.abs(s) * 0.35 * amp; G.inner.rotation.x = bow * 0.9; G.inner.rotation.y = Math.sin(t * 2.6) * 0.35 * amp + spin;
  G.armL.rotation.z = lerp(0.15, 1.5 + 0.6 * s, amp); G.armR.rotation.z = -lerp(0.15, 1.5 - 0.6 * s, amp);
  G.legL.rotation.x = s * 0.55 * amp; G.legR.rotation.x = -s * 0.55 * amp;
}
function note(x, y, s, col, a) { const g = ctx; g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = a; g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 0, 26, 19, -0.45, 0, 7); g.fill(); g.beginPath(); g.moveTo(21, -8); g.lineTo(21, -92); g.quadraticCurveTo(52, -78, 58, -48); g.stroke(); g.restore(); }
function notes(t, x, y, n = 4, size = 1, col = '#FFE066', speed = 1) { for (let i = 0; i < n; i++) { const u = (t * 0.9 * speed + i / n) % 1; note(x + Math.sin(u * 6 + i * 2) * 60 + i * 40 - n * 20, y - u * 520, size * (0.7 + 0.5 * u), col, Math.min(1, u * 5) * (1 - u * u)); } }
function tag() { const g = ctx; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.9; g.fillStyle = 'rgba(20,18,40,0.55)'; g.beginPath(); g.roundRect(48, 210, 190, 54, 14); g.fill();
  g.fillStyle = '#FFFFFF'; g.font = '800 30px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.letterSpacing = '3px'; g.fillText('FICTION', 143, 238); g.restore(); }

export function buildShots(E) {
  const S = [], CUES = [];
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { bloom: 0.15, bloomThreshold: 0.9 };
  const shoot = (scene, people, from, to, at, at2, k, fov = 36) => {
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); cam.lookAt(at2 ? mix(at, at2, k) : at); people.forEach((p) => p.face(cam)); E.render(scene, cam, { ...LK });
  };

  // ── FIELD (dusk, twin moons) ─────────────────────────────────────────
  const F = new THREE.Scene(); W2.paintedSky(F, { top: '#2B1F5E', horizon: '#F29AA8', night: true });
  W2.softLight(F, E, { key: '#FFC9A0', ki: 1.5, sky: '#9A90D0', ground: '#8A6A6A', hemi: 1.5, env: 0.35, pos: [-6, 11, 6], target: [0, 0, -8], box: 24 });
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), WD.mat({ map: WD.canvasTex('sandp', 512, 512, (g, w, h) => { g.fillStyle = '#D29A64'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${150 + (i * 7) % 60},${100 + (i * 13) % 40},${60 + (i * 5) % 30},0.35)`; g.fillRect((i * 97) % w, (i * 57) % h, 3, 3); } }, [40, 40]) }));
  gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; F.add(gnd);
  [[-40, 45, -150, 12, '#F6E9CC'], [34, 30, -130, 5.5, '#B9C6F5']].forEach(([x, y, z, r, c]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); m.position.set(x, y, z); F.add(m); });
  [[-70, -90, 40], [20, -100, 55], [90, -85, 38]].forEach(([x, z, r]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), WD.mat({ color: '#7A5A8A' })); m.scale.set(r, r * 0.35, r * 0.6); m.position.set(x, 0, z); F.add(m); });
  const barn = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.4, 4.2), WD.mat({ color: '#B5372E' })); b.position.y = 1.7; b.castShadow = b.receiveShadow = true; barn.add(b);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 3.7, 1.6, 4), WD.mat({ color: '#5A3A2A' })); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.78); roof.position.y = 4.2; roof.castShadow = true; barn.add(roof);
    const dr = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.4), WD.mat({ color: '#F4EFE4' })); dr.position.set(0, 1.25, 2.12); barn.add(dr);
    [1, -1].forEach((s) => { const bar = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.12, 0.05), WD.mat({ color: '#B5372E' })); bar.position.set(0, 1.25, 2.15); bar.rotation.z = s * 0.82; barn.add(bar); }); }
  barn.position.set(5.2, 0, -8); barn.rotation.y = -0.35; F.add(barn);
  [[3.0, 0, -5], [2.4, 0, -5.6]].forEach(([x, , z]) => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.8, 16), WD.mat({ color: '#E0C060' })); h.rotation.z = Math.PI / 2; h.position.set(x, 0.55, z); h.castShadow = true; F.add(h); });
  const ship = new THREE.Group(); { const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 3.2, 18), WD.mat({ color: '#D9DDE8', metalness: 0.2 })); bd.position.y = 1.9; ship.add(bd);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 18), WD.mat({ color: '#D8343F' })); nose.position.y = 4.2; ship.add(nose);
    [0, 2.1, 4.2].forEach((a) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.1), WD.mat({ color: '#D8343F' })); f.position.set(Math.cos(a) * 1.0, 0.7, Math.sin(a) * 1.0); f.rotation.y = -a; ship.add(f); });
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: '#9FE6FF', toneMapped: false })); win.position.set(0, 2.6, 0.9); ship.add(win); }
  ship.position.set(-6.2, 0, -9); ship.traverse((o) => { o.castShadow = true; }); F.add(ship);
  const sign = new THREE.Group(); { const bd = WD.signBoard('NO WHISTLING', { w: 3.0, h: 0.9, bg: '#B5372E', fg: '#FFFFFF', font: 'Inter' }); bd.position.set(0, 2.4, 0.05); sign.add(bd);
    const b2 = WD.signBoard('AFTER DARK', { w: 3.0, h: 0.6, bg: '#2A2638', fg: '#FFE066', font: 'Inter' }); b2.position.set(0, 1.62, 0.05); sign.add(b2);
    [-1.3, 1.3].forEach((x) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.8, 0.14), WD.mat({ color: '#5A3A24' })); p.position.set(x, 1.4, 0); p.castShadow = true; sign.add(p); }); }
  sign.position.set(-2.3, 0, -5.2); F.add(sign);
  const fence = WD.fence(11, '#F4EFE4'); fence.position.set(-1.5, 0, -2.9); F.add(fence);
  const birds = [-3.2, 0.6, 2.9].map((x) => { const b = new THREE.Group(); const bd = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), WD.mat({ color: '#6EC6F2' })); bd.scale.set(1, 0.9, 1.1); b.add(bd);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 8), WD.mat({ color: '#F2C230' })); bk.rotation.x = Math.PI / 2; bk.position.z = 0.24; b.add(bk);
    [-0.09, 0.09].forEach((ex) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), WD.mat({ color: '#1F1C33' })); e.position.set(ex, 0.07, 0.17); b.add(e); });
    b.position.set(x, 1.12, -2.9); F.add(b); return b; });
  const mounds = [], fG = [];
  [[-5, -11], [0.5, -13], [8.5, -14], [-10, -16], [12, -18]].forEach(([x, z], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), WD.mat({ color: '#D9A06A' })); m.scale.set(3.4, 1.9, 3.0); m.position.set(x, 0, z); m.castShadow = true; F.add(m); mounds.push(m);
    const G = makeGiant(1.15); G.g.position.set(x, -5, z); F.add(G.g); fG.push(G); });
  const furrows = []; for (let i = 0; i < 9; i++) { const geo = new THREE.BoxGeometry(0.55, 0.05, 12); geo.translate(0, 0, -6); const m = new THREE.Mesh(geo, WD.mat({ color: '#8E5E3A' })); m.position.set(-9 + i * 2.3, 0.03, -8); m.scale.z = 0.001; F.add(m); furrows.push(m); }
  const zedF = person('zed', { height: 1.4 }), farmF = person('farmer'); [zedF, farmF].forEach((p) => F.add(p.group));
  const animField = (t, o = {}) => { const { rise = 0, amp = 0, wob = 0, furrow = 0 } = o;
    fG.forEach((G, i) => { const r = clamp(rise * 1.4 - i * 0.07); G.g.position.y = lerp(-5, 0, eob(r)); mounds[i].scale.set(3.4 * (1 - 0.7 * eo(r)), 1.9 * (1 - 0.9 * eo(r)) * (1 + wob * 0.07 * Math.sin(t * 34 + i)), 3.0 * (1 - 0.7 * eo(r))); mounds[i].position.x = fG[i].g.position.x + wob * 0.05 * Math.sin(t * 40 + i);
      poseGiant(G, t + i * 0.41, r >= 1 ? amp : 0); G.g.visible = r > 0.01; });
    furrows.forEach((f, i) => { f.scale.z = Math.max(0.001, clamp(furrow * 1.3 - i * 0.07)); }); birds.forEach((b, i) => { b.position.y = 1.12 + wob * 0.03 * Math.sin(t * 30 + i); }); };

  // ── TOWN (night street, giants, a bakery) ────────────────────────────
  const TW = W2.townStreet(E, { night: true, bank: null });
  TW.scene.add(new THREE.HemisphereLight('#B8B0E8', '#6A5A7A', 0.9));
  [[-1, -6], [1.5, -14], [-1, -24]].forEach(([x, z]) => { const pl = new THREE.PointLight('#FFD9A0', 14, 20, 1.4); pl.position.set(x, 5.5, z); TW.scene.add(pl); });
  const bakery = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 4.4), WD.mat({ color: '#E8B26A' })); b.position.y = 1.6; b.castShadow = b.receiveShadow = true; bakery.add(b);
    const aw = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 4.6), WD.mat({ map: WD.canvasTex('awn', 128, 128, (g, w, h) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#FFFFFF' : '#D8343F'; g.fillRect(0, i * h / 6, w, h / 6); } }) })); aw.position.set(0.9, 2.5, 0); aw.rotation.z = -0.25; bakery.add(aw);
    const wn = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.3), new THREE.MeshBasicMaterial({ color: '#FFE2A0', toneMapped: false })); wn.position.set(0.81, 1.2, 0); wn.rotation.y = Math.PI / 2; bakery.add(wn);
    const sg = WD.signBoard('BAKERY', { w: 2.6, h: 0.6, bg: '#5A3A24', fg: '#FFE066', font: 'Inter' }); sg.position.set(0.84, 2.95, 0); sg.rotation.y = Math.PI / 2; bakery.add(sg); }
  bakery.position.set(-5.2, 0.18, -8.5); TW.scene.add(bakery);
  const tG = []; for (let i = 0; i < 10; i++) { const G = makeGiant(i === 0 ? 1.2 : 1.0); G.g.position.set(i === 0 ? 1.9 : (i % 2 ? -1.6 : 2.3), 0, -8.5 - i * 3.4 + (i === 0 ? 0.5 : 0)); TW.scene.add(G.g); tG.push(G); }
  const zedT = person('zed', { height: 1.4 }), mayT = person('mayor'), bakT = person('baker'); [zedT, mayT, bakT].forEach((p) => TW.scene.add(p.group));
  const animTown = (t, o = {}) => { const { amp = 1, spin = 0, bow = 0, squash = 0 } = o;
    tG.forEach((G, i) => poseGiant(G, t + i * 0.37, amp, i === 0 ? 0 : spin * (1 + i * 0.1), i === 0 ? bow : 0));
    bakery.scale.y = 1 - 0.88 * eo(squash); bakery.scale.z = 1 + 0.12 * eo(squash); };

  // ── shot builder ─────────────────────────────────────────────────────
  const add = (o) => S.push({ ...o, draw(lt, d, t, blit) { o.draw(lt, d, t, blit); tag(); } });
  const mk = (id, line, scene, ppl, from, to, at, at2, pose, o = {}) => add({ id, at: o.at ?? cut(line), grade: o.grade, weather: o.weather, weatherK: o.weatherK, flash: o.flash, dissolve: o.dissolve,
    draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); pose && pose(lt, d, t, k); const sk = o.shake ? FX.shake(lt, o.shake, 0.12, 0.45) : [0, 0];
      shoot(scene, ppl, from.clone().add(V3(sk[0], sk[1], 0)), to.clone().add(V3(sk[0], sk[1], 0)), at, at2, k, o.fov || 36); blit(); o.over && o.over(lt, d, t, k); } });
  const fpeople = [zedF, farmF], tpeople = [zedT, mayT, bakT];
  const hideAll = () => { zedF.group.visible = farmF.group.visible = false; zedT.group.visible = mayT.group.visible = bakT.group.visible = false; };
  const zedPlace = (p, x, z) => { p.group.visible = true; p.at(x, 0, z); };

  // 0 · "Don't. Whistle. Tonight."  (loop frame: giant dancing in the night street)
  mk('S00', 0, TW.scene, tpeople, V3(0.8, 1.6, 3.5), V3(1.0, 1.9, 0.8), V3(1.4, 2.6, -8.5), V3(1.4, 2.8, -8.5), (lt, d, t) => { hideAll(); animTown(t, { amp: 1 }); }, { weather: 'sparkle', weatherK: 0.6, over: (lt, d, t) => notes(t, 380, 1050, 3, 1.3) });
  mk('S00b', 0, TW.scene, tpeople, V3(-1.0, 1.4, -1.0), V3(-1.0, 1.45, -1.7), V3(-1.2, 1.35, -4.2), null, (lt, d, t) => { hideAll(); zedPlace(zedT, -1.2, -4.2); animTown(t, { amp: 1 }); zedT.set({ mood: 'worried', sweat: 1, armR: [150, 90], blink: blink(t) }); },
    { at: Wd('whistle', 0) - 0.2, fov: 40 });
  // 1 · "On this planet, whistling after dark is illegal."
  mk('S01', 1, F, fpeople, V3(0.8, 1.8, 4.2), V3(-1.0, 1.9, 1.4), V3(-2.3, 2.0, -5.2), null, (lt, d, t) => { hideAll(); animField(t, {}); }, { weather: 'sparkle', weatherK: 0.4 });
  // 2 · "Even the birds just hum."
  mk('S02', 2, F, fpeople, V3(0.0, 1.35, 0.4), V3(0.7, 1.3, -0.4), V3(0.6, 1.12, -2.9), null, (lt, d, t) => { hideAll(); animField(t, {}); }, { fov: 34, over: (lt, d, t) => { X.chalk('mmm~', 560, 640, seg(lt, 0.2, 0.6), { size: 150 }); notes(t, 700, 900, 2, 0.8, '#FFFFFF', 0.5); } });
  // 3 · "I'm Zed. I just landed,"
  mk('S03', 3, F, fpeople, V3(-1.0, 1.0, 3.2), V3(-1.3, 1.5, 2.0), V3(-1.4, 1.5, -1.0), V3(-2.4, 2.2, -4), (lt, d, t) => { hideAll(); zedPlace(zedF, -1.4, -1.0); animField(t, {}); zedF.set({ mood: 'happy', armR: [120 + 25 * Math.sin(t * 8), 30], blink: blink(t), talk: talk(t) }); });
  // 4 · "and nobody would tell me why."
  mk('S04', 4, F, fpeople, V3(0.6, 1.3, 2.4), V3(0.5, 1.4, 1.5), V3(0.4, 1.35, -1.0), null, (lt, d, t) => { hideAll(); zedPlace(zedF, -0.4, -1.0); zedPlace(farmF, 1.3, -1.2); animField(t, {});
    zedF.set({ mood: 'worried', look: [0.7, 0], armL: [30, 20], blink: blink(t) }); farmF.set({ mood: 'sly', armR: [140, 130], look: [-0.5, 0], blink: blink(t, 1) }); },
    { over: (lt, d, t) => X.chalk('???', 330, 560, seg(lt, 0.3, 0.7), { size: 170, col: '#FFE066' }) });
  // 5 · "So I whistled."
  mk('S05', 5, F, fpeople, V3(0.0, 1.45, -0.2), V3(0.0, 1.45, -0.7), V3(0, 1.45, -2.5), null, (lt, d, t) => { hideAll(); zedPlace(zedF, 0, -2.5); animField(t, {}); zedF.set({ mood: 'sly', talk: 0.35 + 0.1 * Math.sin(t * 20), blink: blink(t) }); },
    { fov: 32, over: (lt, d, t) => notes(t, 540, 900, 4, 1.6) });
  // 6 · "One tiny tune, behind the barn."
  mk('S06', 6, F, fpeople, V3(1.5, 3.6, 4.0), V3(4.5, 1.4, 1.5), V3(4.9, 1.4, -8), null, (lt, d, t) => { hideAll(); zedPlace(zedF, 3.7, -7.2); animField(t, {}); zedF.set({ mood: 'sly', talk: 0.3 + 0.1 * Math.sin(t * 20), look: [0, 0] }); },
    { over: (lt, d, t) => notes(t, 640, 800, 3, 1.1) });
  // 7 · "But the ground started to wobble."
  mk('S07', 7, F, fpeople, V3(0.0, 0.7, 2.4), V3(0.0, 0.9, 1.4), V3(0.3, 1.3, -8.0), V3(0.3, 1.8, -12), (lt, d, t) => { hideAll(); animField(t, { wob: 1 }); }, { shake: [0, 0.4, 0.8, 1.2], weather: 'dust', weatherK: 0.7 });
  // 8 · "A farmer ran out in his pajamas."
  mk('S08', 8, F, fpeople, V3(-0.8, 1.2, 2.6), V3(-0.4, 1.3, 1.6), V3(0.6, 1.2, -4), V3(0.2, 1.3, -1.0), (lt, d, t, k) => { hideAll(); zedPlace(farmF, lerp(2.8, 0.3, eo(clamp(lt / d))), lerp(-6.0, -0.6, eo(clamp(lt / d)))); animField(t, { wob: 0.6 }); farmF.set({ mood: 'worried', sweat: 1, legs: 'run', phase: t * 11, armL: [60 + 40 * Math.sin(t * 11), 30], armR: [60 - 40 * Math.sin(t * 11), 30], talk: talk(t) }); });
  // 9 · "Stop! Put your lips away!"
  mk('S09', 9, F, fpeople, V3(0.2, 1.5, -0.2), V3(0.2, 1.55, -0.8), V3(0.2, 1.5, -2.5), null, (lt, d, t) => { hideAll(); zedPlace(farmF, 0.2, -2.5); animField(t, { wob: 0.8 }); farmF.set({ mood: 'shock', sweat: 1, armL: [150, 20], armR: [150, 20], talk: talk(t), blink: blink(t) }); },
    { fov: 32, shake: [0.1], over: (lt) => FX.speedLines(lt, 0.8, 540, 760) });
  // 10 · "Too late."
  mk('S10', 10, F, fpeople, V3(-0.5, 1.35, 0.2), V3(-0.3, 1.35, -0.4), V3(0.0, 1.4, -2.5), null, (lt, d, t) => { hideAll(); zedPlace(zedF, 0, -2.5); animField(t, { wob: 1 }); zedF.set({ mood: 'worried', sweat: 1, armR: [160, 100], look: [0, 0.3], blink: blink(t) }); }, { fov: 32 });
  // 11 · "The hills stood up."
  mk('S11', 11, F, fpeople, V3(0.0, 0.8, 4.0), V3(0.0, 0.5, 2.6), V3(0.5, 1.8, -12), V3(0.5, 3.6, -12), (lt, d, t) => { hideAll(); animField(t, { rise: seg(lt, 0.05, d * 0.92), amp: 0, wob: 1 }); }, { shake: [0.1, 0.3], weather: 'dust', weatherK: 1, flash: [0.05] });
  // 12 · "Hills with legs!"
  mk('S12', 12, F, fpeople, V3(-2.0, 0.5, -3.5), V3(-1.4, 0.6, -5.0), V3(-5, 1.6, -11), V3(-5, 3.2, -11), (lt, d, t) => { hideAll(); animField(t, { rise: 1, amp: 0.8 }); }, { fov: 40, weather: 'dust', weatherK: 0.6, shake: [0.2, 0.5] });
  // 13 · "Ten sand giants, dancing down Main Street."
  mk('S13', 13, TW.scene, tpeople, V3(0.0, 2.2, 4.0), V3(0.0, 3.0, 0.5), V3(0.4, 2.6, -22), V3(0.4, 2.8, -26), (lt, d, t) => { hideAll(); animTown(t, { amp: 1 }); }, { dissolve: 0.3, weather: 'sparkle', weatherK: 0.5, over: (lt) => FX.badge('x10', 800, 520, seg(lt, 0.8, 1.2), 150, '#E63946') });
  // 14 · "One bowed to the mayor."
  mk('S14', 14, TW.scene, tpeople, V3(-1.8, 1.7, 2.0), V3(-1.4, 1.8, 0.8), V3(0.8, 2.2, -7.0), V3(0.8, 1.9, -7.0), (lt, d, t) => { hideAll(); zedPlace(mayT, 0.2, -5.4); animTown(t, { amp: 0.2, bow: seg(lt, 0.2, 0.8) * (1 - seg(lt, d - 0.2, d)) }); mayT.set({ mood: 'happy', look: [0.3, 0.3], blink: blink(t) }); });
  // 15 · "The mayor bowed back."
  mk('S15', 15, TW.scene, tpeople, V3(0.4, 1.5, -1.8), V3(0.4, 1.6, -2.6), V3(0.2, 1.5, -5.4), null, (lt, d, t) => { hideAll(); zedPlace(mayT, 0.2, -5.4); animTown(t, { amp: 0.2, bow: 1 }); mayT.set({ mood: 'proud', lean: 28 * seg(lt, 0.1, 0.5) * (1 - seg(lt, 0.6, 0.9)), armR: [30, 30], blink: blink(t) }); }, { fov: 34 });
  // 16 · "Very polite. Very huge."
  mk('S16', 16, TW.scene, tpeople, V3(0.0, 0.5, -1.0), V3(-0.2, 0.7, -1.8), V3(0.9, 1.0, -5.5), V3(1.4, 4.2, -8.5), (lt, d, t) => { hideAll(); zedPlace(mayT, 0.0, -5.4); animTown(t, { amp: 0.6 }); mayT.set({ mood: 'shock', look: [0.5, 0.8], blink: blink(t) }); }, { fov: 44, over: (lt, d, t) => { X.chalk('VERY HUGE', 540, 330, seg(lt, 0.9, 1.3), { size: 130, col: '#FFE066' }); } });
  // 17 · "Ha ha ha!"
  mk('S17', 17, TW.scene, tpeople, V3(-1.2, 1.4, -0.2), V3(-1.2, 1.45, -0.9), V3(-1.4, 1.4, -3.2), null, (lt, d, t) => { hideAll(); zedPlace(zedT, -1.4, -3.2); animTown(t, { amp: 1 }); zedT.set({ mood: 'laugh', talk: 0.5 + 0.4 * Math.sin(t * 16), bob: Math.sin(t * 14) * 0.2, blink: 0 }); }, { fov: 32, flash: [0.05] });
  // 18 · "So I panicked, and whistled louder."
  mk('S18', 18, TW.scene, tpeople, V3(-0.4, 1.3, -0.3), V3(-0.8, 1.4, -1.5), V3(-1.4, 1.45, -3.4), V3(-1.4, 1.6, -3.4), (lt, d, t) => { hideAll(); zedPlace(zedT, -1.4, -3.4); animTown(t, { amp: 1.2 }); zedT.set({ mood: 'shock', sweat: 1, talk: 0.3 + 0.1 * Math.sin(t * 20), armL: [40, 40], armR: [40, 40] }); },
    { fov: 34, shake: [0.2, 0.6, 1.0], over: (lt, d, t) => { notes(t, 540, 900, 6, 1.8, '#FFE066', 1.6); FX.speedLines(lt, 0.5, 540, 800); } });
  // 19 · "Now they spin!"
  mk('S19', 19, TW.scene, tpeople, V3(-2.5, 3.5, 2.5), V3(2.5, 3.8, 0.5), V3(0.4, 3.0, -12), V3(0.4, 3.0, -14), (lt, d, t) => { hideAll(); animTown(t, { amp: 1.2, spin: t * 6 }); }, { weather: 'confetti', weatherK: 0.8, flash: [0.05] });
  // 20 · "Then a farmer explained."
  mk('S20', 20, F, fpeople, V3(-0.6, 1.5, 1.4), V3(-0.3, 1.6, 0.5), V3(0.3, 1.45, -1.8), null, (lt, d, t) => { hideAll(); zedPlace(farmF, 0.4, -1.8); zedPlace(zedF, -1.4, -1.5); animField(t, { rise: 0 }); farmF.set({ mood: 'happy', talk: talk(t), armR: [80, 70], blink: blink(t) }); zedF.set({ mood: 'happy', look: [0.8, 0], blink: blink(t, 1) }); }, { fov: 34 });
  // 21 · "Giants sleep under the sand."  INSERT CARD: cross-section
  add({ id: 'S21', at: cut(21), draw(lt, d, t) { const k = seg(lt, 0, 0.3); FX.insertCard(lt, k, (g, cx, cy, s) => { const INK = '#1F1C33'; g.lineJoin = 'round'; g.lineWidth = 9; g.strokeStyle = INK;
      g.fillStyle = '#9ED6F2'; g.fillRect(cx - 440, cy - 560, 880, 420); g.strokeRect(cx - 440, cy - 560, 880, 420); g.fillStyle = '#F6E9CC'; g.beginPath(); g.arc(cx + 280, cy - 440, 56, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#E3AB66'; g.fillRect(cx - 440, cy - 150, 880, 280); g.fillStyle = '#C48A4C'; g.fillRect(cx - 440, cy + 130, 880, 330); g.strokeRect(cx - 440, cy - 150, 880, 610);
      g.fillStyle = '#E3AB66'; g.beginPath(); g.ellipse(cx, cy + 200, 330, 190, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#C48A4C'; [[-120, 150], [150, 260]].forEach(([x, y]) => { g.beginPath(); g.arc(cx + x, cy + y, 34, 0, 7); g.fill(); });
      g.beginPath(); g.arc(cx - 110, cy + 160, 20, 0.1, Math.PI - 0.1); g.stroke(); g.beginPath(); g.arc(cx + 110, cy + 160, 20, 0.1, Math.PI - 0.1); g.stroke(); g.beginPath(); g.arc(cx, cy + 225, 36, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = INK; g.font = '900 120px Inter'; g.textAlign = 'center'; const zb = Math.sin(t * 3) * 10; g.fillText('Z', cx + 300, cy + 90 + zb); g.font = '900 90px Inter'; g.fillText('z', cx + 400, cy + 20 + zb); g.font = '900 64px Inter'; g.fillText('z', cx + 470, cy - 40 + zb);
      g.fillStyle = '#4FA33C'; g.fillRect(cx - 440, cy - 170, 880, 28); g.strokeRect(cx - 440, cy - 170, 880, 28); }, { cy: 0.5 }); }, flash: [0.02] });
  // 22 · "Whistle in the fields,"
  mk('S22', 22, F, fpeople, V3(-2.0, 1.8, 3.0), V3(1.0, 2.2, 1.0), V3(0.0, 1.8, -14), V3(1.0, 2.0, -16), (lt, d, t) => { hideAll(); zedPlace(farmF, 2.0, -3.2); animField(t, { rise: 1, amp: 1, furrow: seg(lt, 0, d) * 0.5 }); farmF.set({ mood: 'happy', armL: [150, 20], armR: [150, 20], blink: blink(t) }); }, { weather: 'dust', weatherK: 0.4 });
  // 23 · "and they plough them for free."
  mk('S23', 23, F, fpeople, V3(0.0, 6.5, 6.0), V3(0.0, 4.2, 1.0), V3(0.0, 0.5, -16), V3(0.0, 0.2, -18), (lt, d, t) => { hideAll(); animField(t, { rise: 1, amp: 1, furrow: 0.5 + 0.5 * seg(lt, 0, d * 0.9) }); }, { weather: 'confetti', weatherK: 0.6, over: (lt) => FX.badge('FREE!', 540, 480, seg(lt, 0.4, 0.7), 170, '#2FA84F') });
  // 24 · "But whistle in town,"
  mk('S24', 24, TW.scene, tpeople, V3(0.0, 1.2, 3.2), V3(0.5, 1.8, 0.2), V3(0.4, 2.8, -10), V3(0.4, 3.2, -12), (lt, d, t) => { hideAll(); animTown(t, { amp: 1.2 }); }, { dissolve: 0.3, over: (lt, d, t) => notes(t, 540, 1000, 3, 1.2) });
  // 25 · "and they flatten the bakery."
  mk('S25', 25, TW.scene, tpeople, V3(0.6, 1.8, 1.2), V3(0.8, 2.6, -0.6), V3(-4.0, 1.6, -8.5), V3(-4.0, 1.2, -8.5), (lt, d, t) => { hideAll(); animTown(t, { amp: 1, squash: seg(lt, 0.4, 0.55) }); }, { shake: [0.45], weather: 'dust', weatherK: 0.9, flash: [0.45], over: (lt) => FX.ring(lt, 0.45, 540, 900, 420) });
  // 26 · "Now I'm banned from the bakery."
  mk('S26', 26, TW.scene, tpeople, V3(-1.8, 1.3, 1.0), V3(-2.6, 1.4, 0.2), V3(-3.2, 1.2, -6.8), V3(-3.0, 1.2, -7.0), (lt, d, t) => { hideAll(); zedPlace(zedT, -3.3, -5.4); zedPlace(bakT, -4.0, -6.2); animTown(t, { amp: 0.8, squash: 1 });
    zedT.set({ mood: 'sad', tears: 1, look: [-0.4, 0], blink: blink(t), talk: talk(t) }); bakT.set({ mood: 'angry', armL: [90, 60], armR: [90, 60], look: [0.8, 0], blink: blink(t, 1) }); });
  // 27 · "Don't. Whistle. Tonight."  loop: same set + angle as the first shot
  mk('S27', 27, TW.scene, tpeople, V3(0.8, 1.6, 3.5), V3(1.0, 1.9, 0.8), V3(1.4, 2.6, -8.5), V3(1.4, 2.8, -8.5), (lt, d, t) => { hideAll(); animTown(t, { amp: 1 }); }, { weather: 'sparkle', weatherK: 0.6, over: (lt, d, t) => notes(t, 380, 1050, 3, 1.3) });
  return { shots: S, cues: [] };
}
