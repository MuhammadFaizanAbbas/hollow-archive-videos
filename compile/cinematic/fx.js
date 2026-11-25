// Hollow Archive "senior animator" effects pack for Tall Tale 3D (installed by compile/cinematic.sh as src/core/fx.js).
// Everything is a pure function of time (frames render out of order), drawn on the 2D canvas over the 3D frame.
//
// Per shot, declare the look and main.js applies it automatically after the shot's draw():
//   add({ id, at, weather: 'snow' | 'rain' | 'blizzard' | 'dust' | 'embers' | 'leaves' | 'confetti' | 'sparkle',
//         grade: 'night' | 'warm' | 'sunset' | 'cold' | 'danger' | 'flashback' | 'gold',
//         flash: [secondsIntoShot, ...], shake: [secondsIntoShot, ...], draw(lt, d, t, blit) {...} })
// Every frame also gets a soft vignette and a fine film grain (the "finish" pass).
// Helpers for inside draw(): FX.shake(lt, hits) → [dx, dy] camera offset, FX.insertCard, FX.badge, FX.spray,
// FX.speedLines, FX.glow, FX.ring, FX.iceMaterial(THREE).
import { ctx, W, H, clamp, lerp, eo, eob, seg, rnd, TAU } from './lib.js';

const PRESET = {
  snow:     { n: 220, vy: 190, vx: -50, size: [6, 18], col: '255,255,255', a: 0.95, sway: 34 },
  blizzard: { n: 340, vy: 620, vx: -420, size: [4, 11], col: '255,255,255', a: 0.9, sway: 10, streak: 2.2 },
  rain:     { n: 220, vy: 1900, vx: -260, size: [2, 3], col: '200,220,255', a: 0.55, streak: 9 },
  dust:     { n: 90,  vy: -18, vx: 26, size: [4, 10],  col: '255,236,190', a: 0.55, sway: 40, glow: 1 },
  embers:   { n: 90,  vy: -170, vx: 25, size: [4, 11],  col: '255,170,70', a: 0.9, sway: 50, glow: 1 },
  leaves:   { n: 34,  vy: 140, vx: 100, size: [22, 40], col: '214,120,40', a: 0.95, sway: 80, leaf: 1 },
  confetti: { n: 120, vy: 380, vx: 0, size: [8, 14],   col: 'multi', a: 1, sway: 60, leaf: 1 },
  sparkle:  { n: 40,  vy: -30, vx: 0, size: [3, 8],    col: '255,240,170', a: 1, sway: 20, twinkle: 1, glow: 1 },
};
const CONF = ['#FFD54A', '#E63946', '#4FD1E8', '#7BD389', '#B98ACF'];

/** falling / floating particles over the whole frame, in 3 depth layers */
export function weather(t, kind = 'snow', k = 1) {
  const P = PRESET[kind]; if (!P || k <= 0) return;
  ctx.save();
  for (let i = 0; i < P.n; i++) {
    const depth = 0.35 + 0.65 * rnd(i * 3.1), s = lerp(P.size[0], P.size[1], rnd(i * 7.7)) * depth * (W / 1080);
    const span = H + 200, spanX = W + 200;
    let y = (rnd(i * 1.3) * span + P.vy * depth * t) % span; if (y < 0) y += span; y -= 100;
    let x = (rnd(i * 2.9) * spanX + P.vx * depth * t + (P.sway || 0) * Math.sin(t * 1.3 + i)) % spanX; if (x < 0) x += spanX; x -= 100;
    let a = P.a * k * (0.45 + 0.55 * depth); if (P.twinkle) a *= 0.5 + 0.5 * Math.sin(t * 6 + i * 2.3);
    const col = P.col === 'multi' ? CONF[i % CONF.length] : `rgba(${P.col},${a})`;
    if (P.glow) { ctx.shadowColor = `rgba(${P.col},0.9)`; ctx.shadowBlur = s * 3; }
    if (P.streak) { ctx.strokeStyle = `rgba(${P.col},${a})`; ctx.lineWidth = s * 0.7; ctx.lineCap = 'round'; const len = s * P.streak * 4; const ang = Math.atan2(P.vy, P.vx);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); ctx.stroke(); }
    else if (P.leaf) { ctx.save(); ctx.translate(x, y); ctx.rotate(t * 2 + i); ctx.scale(1, 0.45 + 0.4 * Math.sin(t * 4 + i)); ctx.globalAlpha = a; ctx.fillStyle = P.col === 'multi' ? col : `rgb(${P.col})`; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.restore(); }
    else { if (!P.glow) { ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = s; } ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, s / 2, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}

const GRADES = {
  night: [['multiply', 'rgba(40,60,140,0.85)'], ['multiply', 'rgba(120,140,210,0.6)'], ['screen', 'rgba(30,60,130,0.22)']],
  cold: [['multiply', 'rgba(150,190,255,0.60)'], ['screen', 'rgba(80,140,220,0.14)']],
  warm: [['multiply', 'rgba(255,205,150,0.40)'], ['screen', 'rgba(255,150,60,0.10)']],
  sunset: [['multiply', 'rgba(255,150,120,0.55)'], ['screen', 'rgba(255,120,70,0.18)']],
  danger: [['multiply', 'rgba(255,120,110,0.40)']],
  flashback: [['saturation', 'rgba(128,128,128,0.75)'], ['multiply', 'rgba(255,225,180,0.40)']],
  gold: [['screen', 'rgba(255,200,80,0.18)'], ['multiply', 'rgba(255,230,170,0.25)']],
};
/** colour grade the whole frame for the scene's mood */
export function grade(mood, k = 1) {
  const g = GRADES[mood]; if (!g || k <= 0) return;
  ctx.save(); for (const [op, col] of g) { ctx.globalCompositeOperation = op; ctx.globalAlpha = k; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); } ctx.restore();
}
export function vignette(k = 0.35) {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(10,8,20,${k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
let grainTiles = null;
/** fine moving film grain (pre-baked tiles, chosen by time, so it stays deterministic) */
export function grain(t, k = 0.05) {
  if (!grainTiles) { grainTiles = []; for (let j = 0; j < 4; j++) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const im = g.createImageData(256, 256);
    for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd(i * 0.37 + j * 999) - 0.5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); grainTiles.push(c); } }
  ctx.save(); ctx.globalAlpha = k; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(grainTiles[Math.floor(t * 24) % 4], 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
/** white flash that fades out (reveals, cuts on a beat) */
export function flash(lt, at, dur = 0.25, k = 0.85) { const p = seg(lt, at, at + dur); if (lt < at || p >= 1) return; ctx.save(); ctx.globalAlpha = (1 - eo(p)) * k; ctx.fillStyle = '#FFF8E8'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
/** camera shake offset for impacts: returns [dx, dy] in world units (add to the camera position) */
export function shake(lt, hits = [], amp = 0.08, dur = 0.35) {
  let dx = 0, dy = 0; for (const h of hits) { const p = (lt - h) / dur; if (p < 0 || p > 1) continue; const a = amp * (1 - p) * (1 - p); dx += Math.sin(lt * 61) * a; dy += Math.cos(lt * 47) * a; } return [dx, dy];
}
/** comic speed lines radiating from (cx, cy): for shocks, fast moves */
export function speedLines(lt, k = 1, cx = W / 2, cy = H * 0.45) {
  if (k <= 0) return; ctx.save(); ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = '#FFFFFF';
  for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU + rnd(i) * 0.1, r0 = Math.max(W, H) * (0.32 + 0.1 * rnd(i + Math.floor(lt * 18))), r1 = Math.max(W, H) * 0.9;
    ctx.lineWidth = 3 + 7 * rnd(i * 3); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
}
/** soft glow spot (light sources, magic, highlights) */
export function glow(x, y, r, col = '255,220,140', k = 1) { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${0.55 * k})`); g.addColorStop(1, `rgba(${col},0)`); ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
/** expanding shock ring (impacts, "ding" moments) */
export function ring(lt, at, x, y, r = 300, col = '#FFFFFF') { const p = seg(lt, at, at + 0.45); if (lt < at || p >= 1) return; ctx.save(); ctx.globalAlpha = 1 - p; ctx.strokeStyle = col; ctx.lineWidth = 14 * (1 - p) + 2; ctx.beginPath(); ctx.arc(x, y, r * eo(p), 0, TAU); ctx.stroke(); ctx.restore(); }
/** red pill label with a heavy outline (e.g. "32°F", "$1,000,000", "1923"); k = pop-in 0..1 */
export function badge(text, x, y, k = 1, size = 96, fill = '#E63946', rot = -0.04) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(eob(clamp(k)), eob(clamp(k))); ctx.font = `900 ${size}px Inter`; const w = ctx.measureText(text).width + size * 0.8, h = size * 1.35;
  ctx.fillStyle = '#1F1C33'; ctx.beginPath(); ctx.roundRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, h / 3); ctx.fill(); ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 3.4); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, size * 0.05); ctx.restore();
}
/** illustrated insert card: a hand-drawn style close-up of one object on a textured, sketchy background
 *  draw(g, cx, cy, s) paints the object with thick outlines (use INK #1F1C33 strokes, 2-3 flat shades + one highlight).
 *  k = 0..1 pop-in, lt drives a slow push-in. Covers the full frame (it is its own shot). */
export function insertCard(lt, k, drawObj, o = {}) {
  const bgA = o.bg || '#F2E6CF', bgB = o.bg2 || '#D9C7A6';
  const g = ctx.createRadialGradient(W / 2, H * 0.45, 50, W / 2, H / 2, Math.max(W, H) * 0.8); g.addColorStop(0, bgA); g.addColorStop(1, bgB); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = '#5A4630'; ctx.lineWidth = 3;               // sketchy hatching + doodle circles
  for (let i = 0; i < 60; i++) { const x = rnd(i) * W, y = rnd(i + 9) * H, l = 60 + rnd(i + 3) * 160; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y - l * 0.6); ctx.stroke(); }
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(rnd(i * 5) * W, rnd(i * 5 + 1) * H, 40 + rnd(i * 5 + 2) * 120, 0, TAU); ctx.stroke(); }
  ctx.restore();
  const s = (o.scale || 1) * eob(clamp(k)) * (1 + 0.05 * clamp(lt / 3));
  ctx.save(); ctx.shadowColor = 'rgba(30,20,10,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; drawObj(ctx, W / 2, H * (o.cy || 0.45), s); ctx.restore();
  vignette(0.3);
}
/** a stream of water / sand / sparks from (x0,y0) arcing to (x1,y1); k = flow 0..1 */
export function spray(t, x0, y0, x1, y1, k = 1, col = '210,240,255', arc = -260) {
  if (k <= 0) return; ctx.save();
  for (let i = 0; i < 160; i++) { const u = ((rnd(i) + t * 1.6) % 1), spread = (rnd(i * 3) - 0.5) * 60 * u;
    const x = lerp(x0, x1, u) + spread, y = lerp(y0, y1, u) + arc * 4 * u * (1 - u) + spread * 0.4; const r = (3 + 6 * rnd(i * 7)) * (0.5 + u);
    ctx.globalAlpha = k * (0.35 + 0.6 * (1 - u)); ctx.fillStyle = `rgb(${col})`; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** frosty translucent material for ice blocks, glazed branches, glass, crystal (three.js) */
export function iceMaterial(THREE, o = {}) { return new THREE.MeshStandardMaterial({ color: o.color || 0xCFF3FF, transparent: true, opacity: o.opacity ?? 0.55, roughness: 0.15, metalness: 0.0, emissive: 0x2A6A8A, emissiveIntensity: 0.12, depthWrite: false }); }

/** the automatic pass main.js runs after every shot (weather, grade, flashes, finish) */
export function post(sh, lt, d, t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  if (sh.grade) grade(sh.grade, sh.gradeK ?? 1);
  if (sh.weather) weather(t, sh.weather, sh.weatherK ?? 1);
  (sh.flash || []).forEach((a) => flash(lt, a));
  vignette(sh.vignette ?? 0.32); grain(t, sh.grain ?? 0.045);
  ctx.restore();
}
