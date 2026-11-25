// ---------- The Laziest Pirate ----------
// characters
const BARN = { cols: PAL.yellow, hat: 'bandana', hatCol: '#3fa35b', dotCol: '#fff' };
const SAILOR = { cols: PAL.blue, hat: 'sailor', belt: false };
const SAILOR2 = { cols: PAL.red, hat: 'sailor', belt: false };
const CAPTAIN = { cols: PAL.navy, hat: 'captain', vest: '#e8c04a' };
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const SLEEP = { eyes: 'closed', mouth: 'o', browAng: -.1 };
const TIRED = { eyes: 'half', mouth: 'teeth', browAng: -.3 };

// ---------- props & helpers ----------
function zzz(ctx, x, y, t, s = 1, a = 1) {
  for (let i = 0; i < 3; i++) {
    const p = (t * .55 + i / 3) % 1; const al = a * Math.sin(p * Math.PI);
    if (al <= 0.01) continue;
    ctx.save(); ctx.globalAlpha = al;
    text(ctx, 'z', x + p * 80 * s + Math.sin(p * 6 + i) * 10 * s, y - p * 200 * s, (40 + p * 46) * s, '#ffffff', INK, 9 * s, 'Poppins', 700);
    ctx.restore();
  }
}
// sitting figure: hips on the floor at floorY
function sitter(ctx, ch, x, floorY, s, extra = {}) {
  ctx.save(); ctx.translate(x, floorY); ctx.scale(s, s); ellipse(ctx, 0, .01, .3, .04); ctx.fillStyle = 'rgba(40,20,30,.22)'; ctx.fill(); ctx.restore();
  drawStick(ctx, C(ch, Object.assign({ x, y: floorY + .3 * s, s, shadow: false, legs: { L: [1.42, -.2], R: [1.42, -.2] }, arms: { L: [.2, .25], R: [.2, .25] } }, extra)));
}
// lying figure centred on cx, resting on floorY; mirror 1 = head left, -1 = head right
function lying(ctx, ch, cx, floorY, s, mirror = 1, extra = {}) {
  ctx.save(); ctx.translate(cx, floorY); ctx.scale(s, s); ellipse(ctx, 0, 0, .55, .05); ctx.fillStyle = 'rgba(40,20,30,.22)'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(cx, floorY - .13 * s); ctx.scale(mirror, 1); ctx.translate(.48 * s, 0); ctx.rotate(-Math.PI / 2);
  drawStick(ctx, C(ch, Object.assign({ x: 0, y: 0, s, shadow: false, arms: { L: [.25, -.1], R: [.5, .3] }, legs: { L: [.15, -.1], R: [.05, -.05] }, face: SLEEP }, extra)));
  ctx.restore();
}
// head position of a lying figure (for the z's)
const lyingHead = (cx, floorY, s, mirror = 1) => [cx - mirror * .3 * s, floorY - .2 * s];
// standing figure that tips over around its feet (ang 0 = standing, 1 = flat)
function tipping(ctx, ch, x, floorY, s, k, dir = 1, extra = {}) {
  ctx.save(); ctx.translate(x, floorY); ctx.rotate(-dir * k * Math.PI / 2 * .97);
  drawStick(ctx, C(ch, Object.assign({ x: 0, y: 0, s, shadow: k < .2 }, extra)));
  ctx.restore();
}
function mopProp(ang) {
  return (c, k, h) => {
    if (k !== 'R') return;
    c.save(); c.translate(h[0], h[1]); c.rotate(ang);
    rrect(c, -.012, -.08, .024, .46, .01); fillStroke(c, '#b07a45', .01);
    c.beginPath(); c.ellipse(0, .39, .075, .03, 0, 0, TAU); fillStroke(c, '#efe6cf', .01);
    for (let i = -3; i <= 3; i++) line(c, i * .02, .4, i * .026, .48, .014, '#e4dac0');
    c.restore();
  };
}
function bubbles(ctx, x, y, t, n = 5, a = 1) { // soap suds
  const R = rng(17); ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < n; i++) { const bx = x + (R() - .5) * 160, by = y + (R() - .5) * 30 - ((t * 60 + i * 20) % 50); circle(ctx, bx, by, 10 + R() * 14); fillStroke(ctx, 'rgba(255,255,255,.85)', 3, '#8fc9e6'); }
  ctx.restore();
}
function hammockBack(ctx, x0, x1, y, sag, t) {
  const sw = Math.sin(t * 1.4) * 10, mx = (x0 + x1) / 2 + sw;
  line(ctx, x0 - 40, y - 140, x0, y, 6, '#5d4630'); line(ctx, x1 + 40, y - 140, x1, y, 6, '#5d4630');
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(mx, y + sag * 2.2, x1, y); ctx.quadraticCurveTo(mx, y + sag * 1.2, x0, y); fillStroke(ctx, '#d9c79f', 5);
}
function hammockFront(ctx, x0, x1, y, sag, t) {
  const sw = Math.sin(t * 1.4) * 10, mx = (x0 + x1) / 2 + sw;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(mx, y + sag * 2.2, x1, y); ctx.quadraticCurveTo(mx, y + sag * .9, x0, y); ctx.closePath();
  fillStroke(ctx, '#efe0bb', 5);
  ctx.save(); ctx.clip(); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? 'rgba(200,70,50,.55)' : 'rgba(255,255,255,0)'; ctx.fillRect(x0 + i * (x1 - x0) / 6, y - 50, (x1 - x0) / 6, 400); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.quadraticCurveTo(mx, y + sag * 2.2, x1, y); ctx.quadraticCurveTo(mx, y + sag * .9, x0, y); fillStroke(ctx, null, 5);
}
function shipWheel(ctx, x, y, r, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; const cx = Math.cos(a), sy = Math.sin(a);
    line(ctx, cx * r * .2, sy * r * .2, cx * r * 1.28, sy * r * 1.28, 26, INK); line(ctx, cx * r * .2, sy * r * .2, cx * r * 1.28, sy * r * 1.28, 16, '#a8693a');
    circle(ctx, cx * r * 1.3, sy * r * 1.3, 18); fillStroke(ctx, '#c88b52', 6); }
  circle(ctx, 0, 0, r); ctx.lineWidth = 44; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 30; ctx.strokeStyle = '#b47a43'; ctx.stroke();
  circle(ctx, 0, 0, r * .25); fillStroke(ctx, '#e2b04a', 7);
  ctx.restore();
}
function rock(ctx, x, y, s, seed = 1, lit = 0) {
  const R = rng(seed); const pts = []; const n = 9;
  for (let i = 0; i <= n; i++) { const k = i / n; const h = Math.sin(k * Math.PI) * (300 + R() * 260) * (k > .3 && k < .7 ? 1.25 : 1); pts.push([x + (k - .5) * 420 * s, y - h * s]); }
  ctx.beginPath(); ctx.moveTo(x - 260 * s, y); pts.forEach(p => ctx.lineTo(...p)); ctx.lineTo(x + 260 * s, y); ctx.closePath();
  fillStroke(ctx, mix('#2a2f3c', '#8a93a8', lit), 6 * s);
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,10,.35)'; ctx.fillRect(x + 20 * s, y - 900 * s, 400 * s, 900 * s); ctx.restore();
  ctx.fillStyle = 'rgba(230,240,255,.8)'; ellipse(ctx, x, y, 300 * s, 22 * s); ctx.fill();
}
function rain(ctx, t, a = 1, slant = .28) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(190,210,255,.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const R = rng(9); ctx.beginPath();
  for (let i = 0; i < 170; i++) { const x0 = R() * 1500 - 300, sp = 1900 + R() * 900, len = 45 + R() * 45; const y = ((R() * 2300 + t * sp) % 2300) - 160; const x = x0 + y * slant; ctx.moveTo(x, y); ctx.lineTo(x + len * slant, y + len); }
  ctx.stroke(); ctx.restore();
}
function bolt(ctx, x, y0, y1, seed, a) {
  if (a <= 0) return; const R = rng(seed); const pts = [[x, y0]]; let cx = x;
  for (let y = y0; y < y1; y += 90) { cx += (R() - .5) * 130; pts.push([cx, y + 90]); }
  ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  for (const [w, c] of [[34, 'rgba(160,200,255,.35)'], [14, '#ffffff']]) { ctx.beginPath(); ctx.moveTo(...pts[0]); pts.forEach(p => ctx.lineTo(...p)); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
  ctx.restore();
}
function flash(ctx, a, col = '220,230,255') { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(${col},${clamp(a)})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function tintAll(ctx, col) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function darkClouds(ctx, t, y = 200) {
  const list = [[100, y, 220, 1], [520, y - 60, 260, 2], [930, y + 20, 230, 3], [300, y + 200, 180, 4], [800, y + 230, 200, 5]];
  for (const [x, yy, s, sd] of list) { const xx = x + Math.sin(t * .4 + sd) * 20; cloudShape(ctx, xx, yy + 14, s, sd); ctx.fillStyle = '#1c2238'; ctx.fill(); cloudShape(ctx, xx, yy, s, sd); ctx.fillStyle = '#343c58'; ctx.fill(); }
}
function stormWaves(ctx, y, t, amp = 60, col = '#1d3a58') {
  ctx.beginPath(); ctx.moveTo(-600, 2400); ctx.lineTo(-600, y);
  for (let x = -600; x <= 1700; x += 40) ctx.lineTo(x, y + Math.sin(x * .008 + t * 2.2) * amp + Math.sin(x * .021 - t * 3.1) * amp * .35);
  ctx.lineTo(1700, 2400); ctx.closePath(); fillStroke(ctx, col, 6);
  ctx.strokeStyle = 'rgba(220,235,255,.6)'; ctx.lineWidth = 5;
  for (let x = -600; x <= 1700; x += 230) { const yy = y + Math.sin(x * .008 + t * 2.2) * amp - 8; ctx.beginPath(); ctx.moveTo(x - 30, yy + 6); ctx.quadraticCurveTo(x, yy - 10, x + 35, yy + 4); ctx.stroke(); }
}
function splash(ctx, x, y, k, s = 1) {
  if (k <= 0 || k >= 1) return; const R = rng(31); ctx.save(); ctx.globalAlpha = 1 - Math.pow(k, 3);
  for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (R() - .5) * 2.2; const d = (120 + R() * 420) * easeOut(k) * s; const r = (40 + R() * 50) * (1 - k * .6) * s;
    circle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d + k * k * 300 * s, r); fillStroke(ctx, i % 3 ? '#9fd3f0' : '#e8f6ff', 5); }
  ctx.restore();
}
function pill(ctx, str, x, y, size, fill, col = INK, pop = 1, rot = 0) {
  if (pop <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(pop, pop);
  ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(str).width + size * 1.1;
  rrect(ctx, -w / 2, -size * .78, w, size * 1.56, size * .5); fillStroke(ctx, fill, size * .12);
  text(ctx, str, 0, size * .04, size, col, null, 0, 'Poppins', 700); ctx.restore();
}
function sunnyDeck(ctx, t, cam, o = {}) {
  applyCam(ctx, cam, .08); drawSky(ctx, o.skyTop || '#3ea6ee', o.skyBot || '#c9ecfb');
  applyCam(ctx, cam, .1); drawSun(ctx, o.sunX || 880, o.sunY || 200, 70, t, o.sunPow || .8);
  applyCam(ctx, cam, .14); drawCloud(ctx, 160 + t * 6, 300, 110, 1); drawCloud(ctx, 760 + t * 4, 170, 85, 2);
  applyCam(ctx, cam, .3); drawPillars(ctx, o.horizon || 800, o.set || 'A');
  applyCam(ctx, cam, .45); drawSea(ctx, o.horizon || 800, t);
  applyCam(ctx, cam, 1); drawBulwark(ctx, o.back || 1020, 140); drawDeckFloor(ctx, o.back || 1020);
}
function stormDeck(ctx, t, cam, o = {}) {
  applyCam(ctx, cam, .08); drawSky(ctx, '#0b1228', '#2a3656', -300, 1000);
  applyCam(ctx, cam, .15); darkClouds(ctx, t, 260);
  applyCam(ctx, cam, .45); stormWaves(ctx, o.horizon || 840, t, 45, '#1a3350');
  applyCam(ctx, cam, 1); drawBulwark(ctx, o.back || 1040, 150, -600, 1680, '#5a2a24'); drawDeckFloor(ctx, o.back || 1040, 540, -1100, -600, 1680, 2400, o.tint == null ? .5 : o.tint);
}

const SHOTS = [];
// 0 — the crew works hard (0 - 2.12)
SHOTS.push({ start: 0, end: 2.12, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + lt * 20, y: 960 + hh[1], z: 1.02 + lt * .05, r: 0 };
  sunnyDeck(ctx, t, cam);
  applyCam(ctx, cam, 1);
  drawMast(ctx, 930, -900, 1060, 66); drawRigging(ctx, 760, 1060, 900, 200, 10, 110);
  drawBarrel(ctx, 110, 1160, 1.1);
  // mopping sailor
  const sw = Math.sin(t * 9);
  drawStick(ctx, C(SAILOR, { x: 300, y: 1500, s: 450, lean: .1 + sw * .04, arms: { L: [1.0 + sw * .3, -.6], R: [1.1 + sw * .35, -.5] }, prop: mopProp(-.35 - sw * .25), face: { eyes: 'normal', mouth: 'flat', browAng: .35, look: [.3, .6] } }));
  bubbles(ctx, 300 + 150 + sw * 40, 1500, t, 6);
  sweat(ctx, 300 + 120, 1500 - 440, 26, 1);
  // sailor carrying a barrel
  const bx = kf(lt, [[0, 560], [2.12, 800]], x => x);
  drawStick(ctx, C(SAILOR2, { x: bx, y: 1450 - Math.abs(Math.sin(t * 9)) * 12, s: 420, legs: walkLegs(t, 9, .45), arms: { L: [2.75, .35], R: [2.75, .35] }, face: { eyes: 'normal', mouth: 'teeth', browAng: .3, look: [.8, 0] } }));
  drawBarrel(ctx, bx, 1450 - 420 * 1.07 - Math.abs(Math.sin(t * 9)) * 12, .9);
  sweat(ctx, bx - 110, 1450 - 420 * .8, 24, 1);
} });
// 1 — meet Barnaby, asleep against a barrel (2.12 - 6.55)
SHOTS.push({ start: 2.12, end: 6.55, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 990 + hh[1] + lt * 12, z: kf(lt, [[0, 1.0], [2.2, 1.06], [4.43, 1.16]]), r: 0 };
  sunnyDeck(ctx, t, cam, { set: 'B' });
  applyCam(ctx, cam, 1);
  drawCannon(ctx, 930, 1200, 1.0, -.05, -1); drawCrate(ctx, 130, 1220, 200, 170, 0, 'RUM');
  drawBarrel(ctx, 540, 1400, 2.0);
  const peek = lt > 2.35 && lt < 3.45;
  const snore = 1 + Math.sin(t * 2.2) * .02;
  sitter(ctx, BARN, 540, 1440, 600, { squash: snore, headTilt: .22 + Math.sin(t * 1.1) * .03, arms: { L: [.15, .3], R: [.25, .2] },
    face: peek ? { eyes: 'half', mouth: 'flat', browAng: -.1, look: [.7, 0] } : SLEEP });
  if (!peek) zzz(ctx, 640, 1010, t, 1.2);
  const p1 = kf(lt, [[1.05, 0], [1.3, 1, backOut]]);
  pill(ctx, 'BARNABY', 540, 380, 84, '#ffe14d', INK, p1, -.03);
  const p2 = kf(lt, [[2.2, 0], [2.45, 1, backOut]]);
  pill(ctx, 'laziest pirate alive', 540, 520, 50, '#e0392f', '#fff', p2, .02);
} });
// 2 — the crew scrubs the deck, he naps (6.55 - 8.72)
SHOTS.push({ start: 6.55, end: 8.72, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [1.6, 1.04], [2.17, 1.1]]), r: 0 };
  sunnyDeck(ctx, t, cam);
  applyCam(ctx, cam, 1);
  drawBarrel(ctx, 980, 1180, 1.05);
  for (const [x, ch, ph] of [[250, SAILOR, 0], [790, SAILOR2, 1.7]]) {
    const sw = Math.sin(t * 11 + ph);
    drawStick(ctx, C(ch, { x, y: 1380, s: 400, lean: .12 + sw * .05, arms: { L: [1.0 + sw * .3, -.6], R: [1.1 + sw * .35, -.5] }, prop: mopProp(-.35 - sw * .3), face: { eyes: 'normal', mouth: 'teeth', browAng: .35, look: [.2, .7] } }));
    bubbles(ctx, x + 140 + sw * 40, 1385, t + ph, 7); sweat(ctx, x + 110, 1380 - 400, 24, 1);
  }
  const [hx, hy] = lyingHead(560, 1740, 560, 1);
  lying(ctx, BARN, 560, 1740, 560, 1, { headTilt: Math.sin(t * 1.3) * .03 });
  zzz(ctx, hx - 40, hy - 120, t, 1.2);
} });
// 3 — they climb the ropes, he naps in a hammock (8.72 - 10.72)
SHOTS.push({ start: 8.72, end: 10.72, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: kf(lt, [[0, 880], [2, 960]]) + hh[1], z: 1.04, r: 0 };
  sunnyDeck(ctx, t, cam, { set: 'B' });
  applyCam(ctx, cam, 1);
  drawMast(ctx, 800, -900, 1100, 70);
  drawRigging(ctx, 470, 1500, 760, 150, 14, 150);
  // climbers
  [[.22, SAILOR, 0], [.48, SAILOR2, 1.3], [.72, SAILOR, 2.4]].forEach(([k0, ch, ph]) => {
    const k = k0 + lt * .05; const x = lerp(470, 760, k), y = lerp(1500, 150, k) + 130;
    const c = Math.sin(t * 8 + ph);
    drawStick(ctx, C(ch, { x, y, s: 300, shadow: false, arms: { L: [2.7 + c * .25, .2], R: [2.7 - c * .25, .2] }, legs: { L: [.3 + c * .3, -.8 - c * .3], R: [.3 - c * .3, -.8 + c * .3] }, face: { eyes: 'normal', mouth: 'teeth', browAng: .3, look: [0, -1] } }));
  });
  // hammock in the foreground
  const x0 = 40, x1 = 560, y = 1520, sag = 80;
  hammockBack(ctx, x0, x1, y, sag, t);
  const sw = Math.sin(t * 1.4) * 10;
  lying(ctx, BARN, 300 + sw, y + sag * 1.05, 470, 1, { arms: { L: [.2, -.1], R: [2.6, .6] } });
  hammockFront(ctx, x0, x1, y, sag, t);
  const [hx, hy] = lyingHead(300 + sw, y + sag * 1.05, 470, 1);
  zzz(ctx, hx - 20, hy - 110, t, 1.1);
} });
// 4 — even when the cannon fires, he rolls over (10.72 - 13.76)
SHOTS.push({ start: 10.72, end: 13.76, tr: 'whip', draw(ctx, lt, t) {
  const fire = 1.04, roll = 2.08;
  const k = lt - fire; const sh = k > 0 ? Math.max(0, 1 - k * 3) : 0; const hk = shake(t * 3, 34 * sh, 3);
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + hk[0], y: 960 + hh[1] + hk[1], z: kf(lt, [[0, 1.0], [3, 1.06]]), r: sh * .02 };
  sunnyDeck(ctx, t, cam);
  applyCam(ctx, cam, 1);
  const recoil = k > 0 ? Math.max(0, 1 - k * 2.5) * 40 : 0;
  drawCannon(ctx, 560 - recoil, 1260, 1.2, -.08, 1);
  // sailor with a torch, covering his ears after the shot
  drawStick(ctx, C(SAILOR2, { x: 250, y: 1300, s: 380, arms: k > 0 ? { L: [2.2, -2.3], R: [2.2, -2.3] } : { L: [.3, -.1], R: [1.5, -.3] },
    prop: k > 0 ? null : (c, kk, h) => { if (kk === 'R') { line(c, h[0], h[1], h[0] + .12, h[1] - .12, .02, '#7a4a2a'); circle(c, h[0] + .13, h[1] - .14, .03 + Math.sin(t * 30) * .005); c.fillStyle = '#ffb02e'; c.fill(); } },
    face: k > 0 ? { eyes: 'squint', mouth: 'teeth', browAng: .3 } : { eyes: 'normal', mouth: 'grin', look: [1, 0] } }));
  // the blast
  const mx = 560 - recoil + 250 * 1.2, my = 1260 - 150 * 1.2;
  if (k > 0 && k < .55) { const sc = backOut(clamp(k / .1)) * (1 - clamp((k - .35) / .2)); ctx.save(); ctx.translate(mx + 60, my); ctx.scale(sc * .8, sc * .8); burst(ctx, 0, 0, 230, 12, '#ffd23a', 4); burst(ctx, 0, 0, 120, 10, '#fff6c4', 6); text(ctx, 'BOOM!', 0, 0, 92, '#e0392f', INK, 16, 'Poppins', 700); ctx.restore(); }
  if (k > .1) puff(ctx, mx + 80 + k * 140, my - k * 90, 90 + k * 90, t, '#efe9df', 8, clamp(1.6 - k));
  // Barnaby in the foreground rolls over
  const m = kf(lt, [[roll, 1], [roll + .3, -1]]);
  const hop = Math.sin(clamp((lt - roll) / .3) * Math.PI) * 40;
  lying(ctx, BARN, 560, 1760 - hop, 600, m);
  const [hx, hy] = lyingHead(560, 1760, 600, m);
  if (lt < fire || lt > roll + .4) zzz(ctx, hx - 20, hy - 120, t, 1.2);
  flash(ctx, k > 0 ? Math.max(0, .5 - k * 2) : 0, '255,240,200');
} });
// 5 — the whole crew laughs at him, every single day (13.76 - 16.45)
SHOTS.push({ start: 13.76, end: 16.45, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.08], [2.7, 1.0]]), r: 0 };
  sunnyDeck(ctx, t, cam, { set: 'B' });
  applyCam(ctx, cam, 1);
  [[220, SAILOR, 0], [540, SAILOR2, .7], [860, SAILOR, 1.4]].forEach(([x, ch, ph], i) => {
    const b = Math.abs(Math.sin(t * 13 + ph));
    const arms = i === 1 ? { L: [.7, -1.9], R: [1.55, -.45] } : { L: [.7, -1.9], R: [.7, -1.9] };
    drawStick(ctx, C(ch, { x, y: 1330 - b * 14, s: 390, lean: Math.sin(t * 7 + ph) * .06, arms, face: { eyes: 'happy', mouth: 'grin', browUp: 1 } }));
  });
  const ha = (x, y, t0, rot) => { const p = kf(lt, [[t0, 0], [t0 + .15, 1, backOut]]); if (p > 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(p, p); text(ctx, 'HA!', 0, 0, 80, '#ffe14d', INK, 14, 'Poppins', 700); ctx.restore(); } };
  ha(130, 800, .25, -.2); ha(950, 760, .5, .18); ha(560, 700, .8, -.05);
  lying(ctx, BARN, 560, 1780, 560, -1);
  const [hx, hy] = lyingHead(560, 1780, 560, -1);
  zzz(ctx, hx, hy - 110, t, 1.1);
  // day counter
  const dp = kf(lt, [[1.45, 0], [1.65, 1, backOut]]);
  const n = Math.max(1, Math.round(easeIn(clamp((lt - 1.6) / 1.0)) * 364) + 1);
  pill(ctx, `DAY ${n}`, 540, 330, 70, '#fffaf0', INK, dp);
} });
// 6 — one night, a giant storm (16.45 - 18.8)
SHOTS.push({ start: 16.45, end: 18.8, tr: 'cut', draw(ctx, lt, t) {
  const strike = 1.47, hit = 1.87;
  const k = lt - hit; const sh = k > 0 ? Math.max(0, 1 - k * 2.5) : 0; const hk = shake(t * 3, 28 * sh, 3);
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0] + hk[0], y: 960 + hh[1] + hk[1], z: kf(lt, [[0, 1.12], [2.35, 1.0]]), r: Math.sin(t * 1.1) * .02 };
  applyCam(ctx, cam, .08); drawSky(ctx, '#070c1e', '#26314f', -300, 1050);
  applyCam(ctx, cam, .15); darkClouds(ctx, t, 230);
  const fl = lt > strike ? Math.max(0, 1 - (lt - strike) * 3) : 0;
  applyCam(ctx, cam, .2); bolt(ctx, 820, -100, 900, 5, fl);
  applyCam(ctx, cam, .45); stormWaves(ctx, 1030, t, 50, '#1a3350');
  applyCam(ctx, cam, 1);
  ctx.save(); ctx.translate(540, 1300); ctx.rotate(Math.sin(t * 1.5) * .09); ctx.translate(-540, -1300);
  drawShip(ctx, 540, 1300, 1.05, t, { skull: true, flag: '#1b1820', hull: '#5a3326', sail: '#cfc3a8', ph: 0 });
  ctx.restore();
  stormWaves(ctx, 1420, t * 1.3 + 2, 80, '#14304c');
  tintAll(ctx, '#6f7aa8');
  rain(ctx, t, .7);
  flash(ctx, fl * .28);
} });
// 7 — the crew fights the waves for hours (18.8 - 21.35)
SHOTS.push({ start: 18.8, end: 21.35, tr: 'cut', draw(ctx, lt, t) {
  const wave = 1.1;
  const hh = handheld(t, 5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.05, r: Math.sin(t * 1.3) * .05 };
  stormDeck(ctx, t, cam);
  applyCam(ctx, cam, 1);
  drawMast(ctx, 990, -900, 1080, 66);
  line(ctx, -200, 1290, 990, 1180, 9, '#7a5a3a');
  [[230, SAILOR, 0], [470, SAILOR2, .9], [710, SAILOR, 1.8]].forEach(([x, ch, ph]) => {
    const p = Math.sin(t * 6 + ph) * .04;
    drawStick(ctx, C(ch, { x, y: 1500, s: 420, lean: -.22 + p, legs: { L: [.45, -.15], R: [-.1, -.05] }, arms: { L: { ik: [.32, -.52] }, R: { ik: [.45, -.55] } }, face: { eyes: 'squint', mouth: 'teeth', browAng: .35 } }));
    sweat(ctx, x + 100, 1500 - 420, 24, 1);
  });
  splash(ctx, 820, 1000, clamp((lt - wave) / 1.2), 1.1);
  if (lt > wave && lt < wave + .6) text(ctx, 'SPLASH!', 820, 760, 80, '#bfe6ff', INK, 14, 'Poppins', 700);
  rain(ctx, t, 1);
  tintAll(ctx, '#9aa4cc');
} });
// 8 — until every last one falls asleep (21.35 - 23.9)
SHOTS.push({ start: 21.35, end: 23.9, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [2.55, 1.08]]), r: Math.sin(t * .9) * .02 };
  stormDeck(ctx, t, cam, { tint: .6 });
  applyCam(ctx, cam, 1);
  drawMast(ctx, 990, -900, 1080, 66);
  [[60, SAILOR, .55, -1, 1470], [400, SAILOR2, 1.12, -1, 1560], [740, SAILOR, 1.6, -1, 1490]].forEach(([x, ch, ft, dir, fy]) => {
    const k = easeIn(clamp((lt - ft) / .3));
    const down = lt > ft + .3;
    tipping(ctx, ch, x, fy, 330, k, dir, { arms: down ? { L: [.3, -.1], R: [.3, -.1] } : { L: [.25, -.05], R: [.25, -.05] }, lean: down ? 0 : Math.sin(t * 2 + x) * .05, face: down ? SLEEP : TIRED });
    if (down) { const hx = x - dir * .78 * 330, hy = fy - 60; zzz(ctx, hx, hy - 60, t + x, .9); }
    else sweat(ctx, x + 85, fy - 330, 22, 1);
  });
  rain(ctx, t, .45);
  tintAll(ctx, '#8d97c2');
} });
// 9 — everyone except Barnaby (23.9 - 27.2)
SHOTS.push({ start: 23.9, end: 27.2, tr: 'whip', draw(ctx, lt, t) {
  const wake = .82, stretch = 2.15;
  const hh = handheld(t, 2);
  const cam = { x: kf(lt, [[0, 330], [.75, 560]]) + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.3, 1.1]]), r: 0 };
  stormDeck(ctx, t, cam, { tint: .7 });
  applyCam(ctx, cam, 1);
  // sleeping crew in the background
  [[60, SAILOR, 1], [300, SAILOR2, -1]].forEach(([x, ch, m]) => { lying(ctx, ch, x, 1290, 300, m); const [hx, hy] = lyingHead(x, 1290, 300, m); zzz(ctx, hx, hy - 60, t + x, .7); });
  drawLantern(ctx, 880, 700, 1.3, 1, t);
  const woke = lt > wake;
  const sp = kf(lt, [[stretch, 0], [stretch + .35, 1]]);
  drawStick(ctx, C(BARN, { x: 600, y: 1590, s: 640,
    arms: sp > 0 ? { L: [lerp(.3, 2.8, sp), .2], R: [lerp(.3, 2.8, sp), .2] } : { L: [.3, -.1], R: [.3, -.1] },
    face: !woke ? SLEEP : sp > 0 ? { eyes: 'happy', mouth: 'grin', browUp: 1 } : { eyes: 'wide', mouth: 'o', browUp: 1, look: [-.6, 0] } }));
  if (woke && lt < wake + .4) sparkle(ctx, 600 + 80, 1590 - .78 * 640 - 60, 50 * (1 - (lt - wake) / .4), 1);
  // thought bubble: he slept all day
  const tb = kf(lt, [[2.3, 0], [2.5, 1, backOut]]);
  if (tb > 0) { ctx.save(); ctx.translate(860, 430); ctx.scale(tb, tb);
    circle(ctx, -150, 170, 14); fillStroke(ctx, '#fff', 5); circle(ctx, -110, 120, 22); fillStroke(ctx, '#fff', 5);
    ellipse(ctx, 0, 0, 150, 110); fillStroke(ctx, '#fff', 7); drawSun(ctx, -20, 0, 42, t, .6); text(ctx, 'z', 70, -30, 60, '#fff', INK, 10, 'Poppins', 700);
    ctx.restore(); }
  rain(ctx, t, .25);
  tintAll(ctx, '#a9b0d6');
} });
// 10 — the only one awake to see the rocks (27.2 - 29.92)
SHOTS.push({ start: 27.2, end: 29.92, tr: 'cut', draw(ctx, lt, t) {
  const strike = 2.1;
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [2.72, 1.12]]), r: Math.sin(t * 1.2) * .02 };
  applyCam(ctx, cam, .08); drawSky(ctx, '#070c1e', '#26314f', -300, 1100);
  applyCam(ctx, cam, .15); darkClouds(ctx, t, 220);
  const fl = lt > strike ? Math.max(0, 1 - (lt - strike) * 2.5) : 0;
  applyCam(ctx, cam, .2); bolt(ctx, 300, -100, 820, 12, fl);
  applyCam(ctx, cam, .4); stormWaves(ctx, 1080, t, 35, '#1a3350');
  const g = kf(lt, [[0, .7], [2.72, 1.05]]);
  rock(ctx, 420, 1110, g * .9, 3, fl); rock(ctx, 760, 1120, g * 1.1, 7, fl);
  applyCam(ctx, cam, 1);
  stormWaves(ctx, 1500, t * 1.2, 60, '#14304c');
  // Barnaby in the corner, staring
  drawStick(ctx, C(BARN, { x: 170, y: 2080, s: 900, shadow: false, arms: { L: [.3, -.1], R: [1.55, -.1] }, face: { eyes: 'wide', mouth: 'teeth', browUp: 1, look: [1, -.2] } }));
  if (lt > 1.2) sweat(ctx, 330, 1180 + (lt - 1.2) * 40, 40, clamp((lt - 1.2) * 3));
  tintAll(ctx, '#7f89b8');
  rain(ctx, t, .6);
  flash(ctx, fl * .25);
} });
// 11 — he grabs the wheel and turns the ship just in time (29.92 - 33.05)
SHOTS.push({ start: 29.92, end: 33.05, tr: 'whip', draw(ctx, lt, t) {
  const grab = .24, turn = 1.52, pass = 2.3;
  const ang = kf(lt, [[turn, 0], [turn + 1.1, -Math.PI * 2.5, easeOut]]);
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.1], [3.1, 1.0]]), r: kf(lt, [[turn, 0], [turn + 1.2, .09]]) + Math.sin(t * 1.3) * .015 };
  applyCam(ctx, cam, .08); drawSky(ctx, '#070c1e', '#26314f', -300, 1050);
  applyCam(ctx, cam, .15); darkClouds(ctx, t, 230);
  applyCam(ctx, cam, .4); stormWaves(ctx, 1000, t, 40, '#1a3350');
  applyCam(ctx, cam, 1);
  drawBulwark(ctx, 1150, 150, -600, 1680, '#5a2a24'); drawDeckFloor(ctx, 1150, 540, -1100, -600, 1680, 2400, .55);
  const held = lt > grab;
  drawStick(ctx, C(BARN, { x: 540, y: 1530, s: 600, lean: held ? Math.sin(ang * .6) * .05 : 0,
    arms: held ? { L: { ik: [-.14, -.42], bend: -1 }, R: { ik: [.14, -.42] } } : { L: [.4, -.2], R: [.4, -.2] },
    face: lt > turn ? { eyes: 'squint', mouth: 'teeth', browAng: .35 } : { eyes: 'wide', mouth: 'o', browUp: 1 } }));
  // wheel post + wheel in front of him
  rrect(ctx, 520, 1380, 40, 260, 8); fillStroke(ctx, '#7a4a2a', 6);
  shipWheel(ctx, 540, 1365, 105, ang);
  // the rock slides past on the right
  const pk = clamp((lt - pass) / .7);
  if (pk > 0 && pk < 1) { ctx.save(); ctx.translate(lerp(1250, 1450, pk), lerp(500, 1900, easeIn(pk))); rock(ctx, 0, 300, 1.4, 21, .2); ctx.restore(); }
  if (lt > pass + .2 && lt < pass + .8) text(ctx, 'WHOOSH', 760, 620, 70, '#e8f6ff', INK, 12, 'Poppins', 700);
  tintAll(ctx, '#9aa4cc');
  rain(ctx, t, .8);
} });
// 12 — next morning, the captain hands him the treasure (33.05 - 35.95)
SHOTS.push({ start: 33.05, end: 35.95, tr: 'cut', draw(ctx, lt, t) {
  const give = 1.72;
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [2.9, 1.07]]), r: 0 };
  sunnyDeck(ctx, t, cam, { skyTop: '#55b8f0', skyBot: '#ffe7c2', sunX: 220, sunY: 330, sunPow: 1.1 });
  applyCam(ctx, cam, 1);
  // cheering crew at the back
  [[140, SAILOR], [400, SAILOR2], [680, SAILOR]].forEach(([x, ch], i) => { const b = Math.abs(Math.sin(t * 10 + i)); drawStick(ctx, C(ch, { x, y: 1180 - b * 20, s: 280, arms: POSE.handsUp.arms, face: { eyes: 'happy', mouth: 'grin' } })); });
  drawStick(ctx, C(CAPTAIN, { x: 830, y: 1560, s: 560, flip: -1, arms: lt > give - .3 ? { L: [.3, -.1], R: [1.35, -.2] } : { L: [.3, -.1], R: [.9, -2.1] }, face: { eyes: 'normal', mouth: 'smile', look: [-.6, 0], browAng: .1 } }));
  drawStick(ctx, C(BARN, { x: 250, y: 1560, s: 540, arms: lt > give ? POSE.handsUp.arms : { L: [.3, -.1], R: [.3, -.1] }, face: lt > give ? { eyes: 'wide', mouth: 'grin', browUp: 1 } : { eyes: 'half', mouth: 'flat', look: [.6, 0] } }));
  const cx = kf(lt, [[give - .4, 640], [give, 470, easeOut]]);
  drawChest(ctx, cx, 1700, 1.05, 1);
  const sa = kf(lt, [[give, 0], [give + .15, 1], [give + .8, 0]]); sparkle(ctx, cx + 60, 1480, 70 * sa, sa); sparkle(ctx, cx - 80, 1520, 45 * sa, sa);
} });
// 13 — he falls asleep right on top of it (35.95 - 39.5)
SHOTS.push({ start: 35.95, end: 39.5, tr: 'cut', draw(ctx, lt, t) {
  const flop = 1.3;
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 1100 + hh[1], z: kf(lt, [[0, 1.15], [3.55, 1.0]]), r: 0 };
  sunnyDeck(ctx, t, cam, { skyTop: '#55b8f0', skyBot: '#ffe7c2', sunX: 220, sunY: 330, sunPow: 1.1, set: 'B' });
  applyCam(ctx, cam, 1);
  // crew shrugging in the back
  [[160, SAILOR], [920, SAILOR2]].forEach(([x, ch]) => drawStick(ctx, C(ch, { x, y: 1260, s: 330, arms: { L: [1.3, -.6], R: [1.3, -.6] }, face: { eyes: 'half', mouth: 'flat', browAng: -.2 } })));
  drawChest(ctx, 540, 1640, 1.7, 1);
  if (lt < flop) sitter(ctx, BARN, 540, 1330, 520, { face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [1.2, -.4], R: [1.2, -.4] } });
  else {
    lying(ctx, BARN, 540, 1335, 520, 1, { arms: { L: [.2, -.1], R: [2.7, .5] } });
    const [hx, hy] = lyingHead(540, 1335, 520, 1); zzz(ctx, hx - 20, hy - 100, t, 1.3);
    const pk = clamp((lt - flop) / .5); if (pk < 1) { for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .45; circle(ctx, 540 + Math.cos(a) * 260 * pk, 1300 + Math.sin(a) * 200 * pk + pk * pk * 160, 18); fillStroke(ctx, '#ffd84a', 4); } }
  }
  for (let i = 0; i < 4; i++) { const p = (t * .7 + i * .25) % 1; sparkle(ctx, 330 + i * 140, 1420 - (i % 2) * 40, 34 * Math.sin(p * Math.PI), Math.sin(p * Math.PI)); }
} });
