// ---------- comet world: space, ground, props ----------
const STARS = (() => { const R = rng(9); const a = []; for (let i = 0; i < 170; i++) a.push({ x: -500 + R() * 2100, y: -1400 + R() * 3300, r: 1.6 + R() * 3.2, p: R() * 6, c: R() < .15 ? '#ffe9a8' : R() < .3 ? '#bfe3ff' : '#fff', k: R() < .12 }); return a; })();
function drawStars(ctx, t) {
  for (const s of STARS) {
    ctx.globalAlpha = .55 + .45 * Math.sin(t * 2 + s.p);
    if (s.k) { line(ctx, s.x - s.r * 3, s.y, s.x + s.r * 3, s.y, 2.5, s.c); line(ctx, s.x, s.y - s.r * 3, s.x, s.y + s.r * 3, 2.5, s.c); }
    else { circle(ctx, s.x, s.y, s.r); ctx.fillStyle = s.c; ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
function drawPlanet(ctx, x, y, r, o = {}) {
  const tilt = o.tilt == null ? -.32 : o.tilt, base = o.base || '#f2994a', band = o.band || '#d9722e', ring = o.ring || '#ffe3a1';
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * .5, 0, Math.PI, TAU); ctx.lineWidth = r * .19; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = r * .12; ctx.strokeStyle = ring; ctx.stroke();
  circle(ctx, 0, 0, r); const g = ctx.createLinearGradient(-r, -r, r, r); g.addColorStop(0, o.hi || '#ffc778'); g.addColorStop(1, base); ctx.fillStyle = g; ctx.fill();
  ctx.save(); circle(ctx, 0, 0, r); ctx.clip();
  ctx.fillStyle = band; ctx.fillRect(-r, -r * .45, r * 2, r * .2); ctx.fillRect(-r, r * .05, r * 2, r * .28); ctx.fillRect(-r, r * .6, r * 2, r * .14);
  ctx.fillStyle = 'rgba(40,0,60,.22)'; circle(ctx, r * .5, r * .4, r * 1.15); ctx.rect(-r * 2, -r * 2, r * 4, r * 4); ctx.fill('evenodd');
  ctx.restore();
  circle(ctx, 0, 0, r); ctx.lineWidth = r * .035; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * .5, 0, 0, Math.PI); ctx.lineWidth = r * .19; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = r * .12; ctx.strokeStyle = ring; ctx.stroke();
  ctx.restore();
}
function spaceBG(ctx, t, cam, o = {}) {
  applyCam(ctx, cam, .05);
  const g = ctx.createLinearGradient(0, -1400, 0, 1900); g.addColorStop(0, o.top || '#080c2a'); g.addColorStop(.62, o.mid || '#25287a'); g.addColorStop(1, o.bot || '#8a4fb0');
  ctx.fillStyle = g; ctx.fillRect(-2500, -2500, 6100, 5200);
  applyCam(ctx, cam, .1); drawStars(ctx, t);
  applyCam(ctx, cam, .12); ctx.save(); ctx.globalAlpha = .9; drawSun(ctx, o.sx == null ? 130 : o.sx, o.sy == null ? 330 : o.sy, 38, t, .8); ctx.restore();
  applyCam(ctx, cam, .2); drawPlanet(ctx, o.px == null ? 790 : o.px, o.py == null ? 560 : o.py, o.pr || 240, o.planet || {});
}
const GR = 2600;
function groundY(x, gy = 1500, R = GR) { const dx = clamp(x - 540, -R * .98, R * .98); return gy + R - Math.sqrt(R * R - dx * dx); }
function groundArc(ctx, t, o = {}) {
  const gy = o.gy == null ? 1500 : o.gy, R = o.R || GR, cx = 540, cy = gy + R;
  ctx.save(); circle(ctx, cx, cy, R);
  const g = ctx.createLinearGradient(0, gy, 0, gy + 700); g.addColorStop(0, '#b3aed6'); g.addColorStop(1, '#6f6a99'); ctx.fillStyle = g; ctx.fill(); ctx.clip();
  const r = rng(o.seed || 5);
  for (let i = 0; i < 16; i++) { const x = cx - 1300 + r() * 2600, y = gy + 40 + r() * 520; ellipse(ctx, x, y + (x - 540) * (x - 540) / (2 * R), 50 + r() * 100, 12 + r() * 20); ctx.fillStyle = 'rgba(224,246,255,.92)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(34,28,34,.5)'; ctx.stroke(); }
  for (let i = 0; i < 10; i++) {
    const x = cx - 1300 + r() * 2600, y = gy + 110 + r() * 420 + (x - 540) * (x - 540) / (2 * R), rx = 70 + r() * 130, ry = rx * .22;
    ellipse(ctx, x, y, rx, ry); ctx.fillStyle = '#5c5787'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ellipse(ctx, x, y + ry * .35, rx * .8, ry * .55); ctx.fillStyle = '#7a74a8'; ctx.fill();
  }
  ctx.restore();
  circle(ctx, cx, cy, R); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke();
  ctx.save(); circle(ctx, cx, cy, R - 6); ctx.clip(); ctx.beginPath(); ctx.arc(cx, cy, R - 7, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(214,208,255,.75)'; ctx.stroke(); ctx.restore();
}
function jet(ctx, x, y, t, s, a = 1) {
  for (let i = 0; i < 8; i++) {
    const ph = ((t * .45 + i / 8) % 1); const px = x + Math.sin(i * 2 + t) * 22 * ph, py = y - ph * s * 1.3;
    puff(ctx, px, py, s * .11 * (1 + ph * 2.2), t, '#f4f8ff', i + 1, (1 - ph) * .9 * a);
  }
}
function leash(ctx, x1, y1, x2, y2, sag = 0, col = '#ffd23a', w = 9) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.lineCap = 'round';
  ctx.lineWidth = w + 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
}
function helmet(ctx, x, y, r) {
  ctx.save(); const g = ctx.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,.30)'); g.addColorStop(1, 'rgba(150,215,255,.12)');
  circle(ctx, x, y, r); ctx.fillStyle = g; ctx.fill();
  circle(ctx, x, y, r + 2); ctx.lineWidth = Math.max(3, r * .05); ctx.strokeStyle = 'rgba(34,28,34,.55)'; ctx.stroke();
  circle(ctx, x, y, r); ctx.lineWidth = Math.max(3, r * .05); ctx.strokeStyle = 'rgba(205,238,255,.95)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * .8, Math.PI * 1.12, Math.PI * 1.46); ctx.lineWidth = r * .07; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.stroke();
  ctx.restore();
}
function loc(o, lx, ly) {
  const a = o.lean || 0, s = o.s, fl = o.flip || 1, sq = o.squash || 1;
  return [o.x + (lx * Math.cos(a) - ly * Math.sin(a)) * s * fl, o.y + (lx * Math.sin(a) + ly * Math.cos(a)) * s * sq];
}
// a stick kid with bubble helmet and an optional leash from the belt to [x, y, sag]
function kid(ctx, base, o) {
  drawStick(ctx, C(base, o));
  if (o.noHelmet !== true) { const h = loc(o, 0, -.765 + (o.bob || 0)); helmet(ctx, h[0], h[1], o.s * .235); }
  if (o.leash) { const b = loc(o, 0, -.31); leash(ctx, b[0], b[1], o.leash[0], o.leash[1], o.leash[2] || 0, o.leashCol); circle(ctx, b[0], b[1], o.s * .03); fillStroke(ctx, '#ffd23a', 3); }
}
function drawGoal(ctx, x, y, w, h, a = 1) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.globalAlpha = .45 * a; for (let i = 0; i <= 8; i++) line(ctx, x - w / 2 + i * w / 8, y - h, x - w / 2 + i * w / 8, y, 3, '#fff');
  for (let j = 0; j <= 6; j++) line(ctx, x - w / 2, y - h + j * h / 6, x + w / 2, y - h + j * h / 6, 3, '#fff');
  ctx.globalAlpha = a;
  rrect(ctx, x - w / 2 - 8, y - h, 16, h, 6); fillStroke(ctx, '#fff', 6); rrect(ctx, x + w / 2 - 8, y - h, 16, h, 6); fillStroke(ctx, '#fff', 6);
  rrect(ctx, x - w / 2 - 8, y - h - 8, w + 16, 16, 6); fillStroke(ctx, '#fff', 6);
  ctx.restore();
}
function drawBall(ctx, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); circle(ctx, 0, 0, r); fillStroke(ctx, '#fff', Math.max(3, r * .1));
  ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; ctx.lineTo(Math.cos(a) * r * .38, Math.sin(a) * r * .38); } ctx.closePath(); fillStroke(ctx, INK, 2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * r * .8, Math.sin(a) * r * .8, r * .17); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
}
function drawSchool(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -260, -420, 520, 420, 14); fillStroke(ctx, '#ff9157', 8);
  ctx.save(); rrect(ctx, -260, -420, 520, 420, 14); ctx.clip(); ctx.fillStyle = 'rgba(60,0,60,.18)'; ctx.fillRect(110, -430, 200, 460); ctx.restore();
  path(ctx, [[-300, -420], [0, -600], [300, -420]]); fillStroke(ctx, '#d6453a', 8);
  for (const wx of [-190, 120]) for (const wy of [-340, -200]) { rrect(ctx, wx, wy, 80, 90, 10); fillStroke(ctx, '#ffe58a', 6); line(ctx, wx + 40, wy, wx + 40, wy + 90, 4); }
  rrect(ctx, -50, -170, 100, 170, 14); fillStroke(ctx, '#7a4a2c', 6);
  rrect(ctx, -110, -470, 220, 56, 12); fillStroke(ctx, '#fff', 5); text(ctx, 'school', 0, -442, 38, INK, INK, 0);
  line(ctx, 0, -600, 0, -760, 8); const w = Math.sin(t * 6) * 12; path(ctx, [[0, -760], [110, -735 + w], [0, -690]]); fillStroke(ctx, '#3fa35b', 6);
  ctx.restore();
}
function pill(ctx, str, x, y, fill, size = 46, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(str).width + 50;
  rrect(ctx, x - w / 2, y - size * .8, w, size * 1.6, size * .8); fillStroke(ctx, fill, 7); text(ctx, str, x, y + 2, size, INK, INK, 0); ctx.restore();
}
function popAt(lt, t0, d = .22) { return lt < t0 ? 0 : backOut(clamp((lt - t0) / d)); }
function tinyComet(ctx, x, y, r, t) {
  // lumpy potato comet seen from space
  const R = rng(4); const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; const k = 1 + (R() - .5) * .28; pts.push([x + Math.cos(a) * r * 1.35 * k, y + Math.sin(a) * r * .95 * k]); }
  ctx.beginPath(); ctx.moveTo((pts[0][0] + pts[13][0]) / 2, (pts[0][1] + pts[13][1]) / 2);
  for (let i = 0; i < 14; i++) { const p = pts[i], q = pts[(i + 1) % 14]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath(); const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, '#c9c4ec'); g.addColorStop(1, '#6f6a99'); fillStroke(ctx, g, 9);
  const R2 = rng(8); for (let i = 0; i < 6; i++) { const cx = x + (R2() - .5) * r * 1.6, cy = y + (R2() - .5) * r * 1.0, rr = r * (.1 + R2() * .12); ellipse(ctx, cx, cy, rr, rr * .6); ctx.fillStyle = '#5c5787'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  // tail
  ctx.save(); ctx.globalAlpha = .55; for (let i = 0; i < 6; i++) { circle(ctx, x + r * 1.5 + i * r * .55, y - r * .1 - i * r * .12, r * (.34 - i * .04)); ctx.fillStyle = '#dff4ff'; ctx.fill(); } ctx.restore();
}

// =================== SODA STATION ===================
const COLA = '#7a4526', COLA_HI = '#b2723e';
function splat(ctx, x, y, r, seed, col = COLA, a = 1) {
  const R = rng(seed + 3); ctx.save(); ctx.globalAlpha = a; const n = 14, pts = [];
  for (let i = 0; i < n; i++) { const ang = i / n * TAU, k = .7 + R() * .5; pts.push([x + Math.cos(ang) * r * k, y + Math.sin(ang) * r * k * .85]); }
  ctx.beginPath(); ctx.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  ctx.closePath(); fillStroke(ctx, col, Math.max(3, r * .07));
  for (let i = 0; i < 5; i++) { const ang = R() * TAU, d = r * (1.15 + R() * .5); circle(ctx, x + Math.cos(ang) * d, y + Math.sin(ang) * d * .85, r * (.08 + R() * .1)); fillStroke(ctx, col, Math.max(2, r * .045)); }
  ellipse(ctx, x - r * .25, y - r * .25, r * .28, r * .14, -.5); ctx.fillStyle = COLA_HI; ctx.fill();
  ctx.restore();
}
const STAINS = (() => { const R = rng(21); const a = []; for (let i = 0; i < 22; i++) a.push({ x: -250 + R() * 1580, y: 20 + R() * 250, r: 55 + R() * 95 }); return a; })();
function stains(ctx, t, k) {
  if (k <= 0) return;
  STAINS.forEach((s, i) => {
    const f = clamp(k * 24 - i); if (f <= 0) return;
    splat(ctx, s.x, s.y, s.r * backOut(f), i);
    if (i % 3 === 0 && f >= 1) { const dl = 40 + 30 * Math.sin(t * 1.2 + i); line(ctx, s.x + 10, s.y + s.r * .6, s.x + 10, s.y + s.r * .6 + dl, 10, COLA); circle(ctx, s.x + 10, s.y + s.r * .6 + dl + 6, 13); fillStroke(ctx, COLA, 4); }
  });
}
function porthole(ctx, x, y, r, t) {
  ctx.save(); circle(ctx, x, y, r); ctx.clip();
  ctx.fillStyle = '#0b1038'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  const R = rng(x | 0 || 5); for (let i = 0; i < 22; i++) { circle(ctx, x - r + R() * r * 2, y - r + R() * r * 2, 1.5 + R() * 2.5); ctx.fillStyle = '#fff'; ctx.fill(); }
  circle(ctx, x + r * .35, y + r * .3, r * .55); const g = ctx.createLinearGradient(x, y, x + r, y + r); g.addColorStop(0, '#ffb35c'); g.addColorStop(1, '#d9573a'); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.ellipse(x - r * .3, y - r * .4, r * .7, r * .25, -.5, 0, TAU); ctx.fill();
  ctx.restore();
  circle(ctx, x, y, r); ctx.lineWidth = r * .16; ctx.strokeStyle = INK; ctx.stroke(); circle(ctx, x, y, r); ctx.lineWidth = r * .1; ctx.strokeStyle = '#e9eef5'; ctx.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circle(ctx, x + Math.cos(a) * r * 1.08, y + Math.sin(a) * r * 1.08, r * .045); fillStroke(ctx, '#9aa7b8', 3); }
}
function hall(ctx, t, cam, o = {}) {
  applyCam(ctx, cam, .94);
  let g = ctx.createLinearGradient(0, 300, 0, 1500); g.addColorStop(0, '#d9eef6'); g.addColorStop(1, '#9fcbe0'); ctx.fillStyle = g; ctx.fillRect(-1500, 300, 4100, 1250);
  for (let x = -1400; x < 2500; x += 270) { rrect(ctx, x + 14, 360, 242, 1030, 18); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(34,28,34,.32)'; ctx.stroke(); }
  for (const px of (o.ports || [180, 900, -540, 1620])) porthole(ctx, px, 800, 165, t);
  rrect(ctx, -1500, 1380, 4100, 44, 10); fillStroke(ctx, '#ffd23a', 6);
  g = ctx.createLinearGradient(0, -1200, 0, 300); g.addColorStop(0, '#4f82a3'); g.addColorStop(1, '#79abc6'); ctx.fillStyle = g; ctx.fillRect(-1500, -1200, 4100, 1500);
  for (let x = -1400; x < 2500; x += 300) line(ctx, x, -1200, x, 300, 4, 'rgba(34,28,34,.28)');
  for (let y = -1000; y < 300; y += 260) line(ctx, -1500, y, 2600, y, 4, 'rgba(34,28,34,.28)');
  for (const lx of [40, 620, 1200, -540]) { rrect(ctx, lx, 150, 380, 36, 18); fillStroke(ctx, '#fffbe0', 5); }
  stains(ctx, t, o.stain || 0);
  line(ctx, -1500, 300, 2600, 300, 10);
  g = ctx.createLinearGradient(0, 1500, 0, 2400); g.addColorStop(0, '#8aa0b8'); g.addColorStop(1, '#5e7390'); ctx.fillStyle = g; ctx.fillRect(-1500, 1500, 4100, 1000);
  for (let x = -1500; x < 2600; x += 200) { ctx.beginPath(); ctx.moveTo(x, 1500); ctx.lineTo(x + 100, 1500); ctx.lineTo(x + 40, 1560); ctx.lineTo(x - 60, 1560); ctx.closePath(); ctx.fillStyle = '#ffd23a'; ctx.fill(); }
  line(ctx, -1500, 1500, 2600, 1500, 10);
}
function noSign(ctx, x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; circle(ctx, x, y, r); ctx.lineWidth = r * .24 + 10; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = r * .2; ctx.strokeStyle = '#e8262b'; ctx.stroke();
  const d = r * .72; line(ctx, x - d, y - d, x + d, y + d, r * .2 + 10, INK); line(ctx, x - d, y - d, x + d, y + d, r * .2, '#e8262b'); ctx.restore();
}
function can(ctx, x, y, s, rot = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const w = s * .5, h = s * .9, col = o.col || '#e8262b';
  rrect(ctx, -w / 2, -h / 2, w, h, s * .08); fillStroke(ctx, col, s * .035);
  ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, s * .08); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-w / 2, -h * .02); ctx.bezierCurveTo(-w * .2, -h * .28, w * .1, h * .2, w / 2, -h * .1); ctx.lineTo(w / 2, h * .1); ctx.bezierCurveTo(w * .1, h * .38, -w * .2, -h * .08, -w / 2, h * .2); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.fillStyle = 'rgba(30,0,20,.16)'; ctx.fillRect(w * .12, -h / 2, w, h); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-w * .38, -h * .46, w * .08, h * .92); ctx.restore();
  ellipse(ctx, 0, -h / 2, w / 2, s * .05); fillStroke(ctx, '#cfd6dc', s * .025); ellipse(ctx, 0, h / 2, w / 2, s * .05); fillStroke(ctx, '#aab3bb', s * .025);
  ctx.beginPath(); ctx.ellipse(s * .02, -h / 2, w * .14, s * .022, 0, 0, TAU); fillStroke(ctx, '#aab3bb', s * .012);
  rrect(ctx, -w / 2, -h / 2, w, h, s * .08); ctx.lineWidth = s * .035; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
function crateBox(ctx, x, y, w, h, tint = 0) {
  rrect(ctx, x - w / 2, y - h / 2, w, h, 12); fillStroke(ctx, '#c58a4e', 8);
  for (const k of [-.33, 0, .33]) line(ctx, x - w / 2 + 8, y + k * h, x + w / 2 - 8, y + k * h, 5, 'rgba(34,28,34,.4)');
  rrect(ctx, x - w * .3, y - h * .22, w * .6, h * .44, 8); fillStroke(ctx, '#fff', 5); text(ctx, 'COLA', x, y + 3, h * .3, '#e8262b', INK, 0);
}
function chefHat(ctx, o) {
  const p = loc(o, 0, -.93 + (o.bob || 0)), s = o.s; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate((o.lean || 0) + (o.headTilt || 0)); ctx.scale(o.flip || 1, 1);
  for (const [cx, cy, r] of [[-.1, -.12, .1], [.1, -.12, .1], [0, -.19, .125]]) { circle(ctx, cx * s, cy * s, r * s); fillStroke(ctx, '#fff', s * .014); }
  rrect(ctx, -.135 * s, -.07 * s, .27 * s, .09 * s, s * .02); fillStroke(ctx, '#fff', s * .014); ctx.restore();
}
function partyHat(ctx, o, col = '#ff5a9a', up = -1.0) {
  const p = loc(o, 0, up + (o.bob || 0)), s = o.s; ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate((o.lean || 0) + .2); ctx.scale(o.flip || 1, 1);
  path(ctx, [[-.1 * s, 0], [.1 * s, 0], [0, -.26 * s]]); fillStroke(ctx, col, s * .014); circle(ctx, 0, -.27 * s, .04 * s); fillStroke(ctx, '#ffd23a', s * .01);
  for (const dx of [-.04, .03]) circle(ctx, dx * s, -.08 * s, .015 * s), ctx.fill();
  ctx.restore();
}
function confetti(ctx, t, n = 40, seed = 3, a = 1) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const R = rng(seed); const cols = ['#ff5a5a', '#ffd23a', '#5acbff', '#6bdc6b', '#ff7ad9'];
  for (let i = 0; i < n; i++) { const x = R() * W, sp = 120 + R() * 220, y = ((R() * 2000 + t * sp) % 2100) - 100; ctx.save(); ctx.globalAlpha = a; ctx.translate(x + Math.sin(t * 3 + i) * 30, y); ctx.rotate(t * 4 + i); ctx.fillStyle = cols[i % 5]; ctx.fillRect(-9, -5, 18, 10); ctx.restore(); }
  ctx.restore();
}
function toothbrush(ctx, x, y, len, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  rrect(ctx, -len * .5, -len * .035, len * .85, len * .07, len * .035); fillStroke(ctx, '#5acbff', len * .018);
  rrect(ctx, len * .28, -len * .075, len * .22, len * .045, len * .012); fillStroke(ctx, '#fff', len * .014);
  for (let i = 0; i < 5; i++) line(ctx, len * .3 + i * len * .042, -len * .075, len * .3 + i * len * .042, -len * .13, len * .02, '#fff');
  ctx.restore();
}
function drop(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r * 1.4); ctx.quadraticCurveTo(x + r, y, x, y + r * .8); ctx.quadraticCurveTo(x - r, y, x, y - r * 1.4); fillStroke(ctx, COLA, Math.max(3, r * .22)); ellipse(ctx, x - r * .25, y - r * .1, r * .15, r * .3); ctx.fillStyle = COLA_HI; ctx.fill(); }
function spray(ctx, x, y, t0, lt, n = 14, spread = 1.0, up = true, len = 520) {
  if (lt < t0) return; const k = lt - t0; const R = rng(9);
  for (let i = 0; i < n; i++) { const a = (up ? -Math.PI / 2 : 0) + (R() - .5) * spread, sp = len * (.5 + R() * .7); const d = sp * easeOut(clamp(k / .7)); drop(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, 12 + R() * 14); }
}
function plate(ctx, x, y, w) { ellipse(ctx, x, y, w / 2, w * .1); fillStroke(ctx, '#f4f4f4', 7); ellipse(ctx, x, y - 4, w * .4, w * .07); ctx.fillStyle = '#dcdcdc'; ctx.fill(); }
function flatCake(ctx, x, y, w) {
  plate(ctx, x, y + 24, w * 1.15);
  rrect(ctx, x - w / 2, y - 44, w, 70, 26); fillStroke(ctx, '#e8b87a', 7);
  ctx.save(); rrect(ctx, x - w / 2, y - 44, w, 70, 26); ctx.clip(); ctx.fillStyle = 'rgba(80,30,0,.18)'; ctx.fillRect(x + w * .2, y - 50, w, 100); ctx.restore();
  ctx.beginPath(); ctx.moveTo(x - w / 2, y - 40); for (let i = 0; i <= 10; i++) { ctx.lineTo(x - w / 2 + i * w / 10, y - 40 + (i % 2 ? 26 : 8)); } ctx.lineTo(x + w / 2, y - 60); ctx.lineTo(x - w / 2, y - 60); ctx.closePath(); fillStroke(ctx, '#ff9ad0', 6);
  text(ctx, 'HAPPY BDAY', x, y - 28, 30, '#fff', INK, 5);
}
function stationExt(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * .5) * .02); const lw = .018;
  for (const sy of [-1, 1]) { line(ctx, 0, 0, 0, sy * .6, .035, INK); for (const sx of [-1, 1]) { rrect(ctx, sx * .06 + (sx < 0 ? -.52 : 0), sy * .62 - (sy < 0 ? .3 : 0), .52, .3, .02); fillStroke(ctx, '#2f63c9', lw); for (let i = 1; i < 4; i++) line(ctx, sx * .06 + (sx < 0 ? -.52 : 0) + i * .13, sy * .62 - (sy < 0 ? .3 : 0), sx * .06 + (sx < 0 ? -.52 : 0) + i * .13, sy * .62 + (sy < 0 ? 0 : .3), .008, 'rgba(255,255,255,.7)'); } }
  ellipse(ctx, 0, 0, 1.05, .22); ctx.lineWidth = .1; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = .07; ctx.strokeStyle = '#cdd6e3'; ctx.stroke();
  rrect(ctx, -.95, -.2, 1.9, .4, .2); fillStroke(ctx, '#f1f4f8', lw);
  ctx.save(); rrect(ctx, -.95, -.2, 1.9, .4, .2); ctx.clip(); ctx.fillStyle = 'rgba(40,30,80,.14)'; ctx.fillRect(.3, -.3, 1, .6); ctx.restore();
  for (let i = -3; i <= 3; i++) { circle(ctx, i * .24, -.02, .065); fillStroke(ctx, (i + 4 + Math.floor(t * 2)) % 3 ? '#ffe58a' : '#7ad7ff', .012); }
  circle(ctx, 1.02, 0, .12); fillStroke(ctx, '#e8262b', lw); line(ctx, -.95, -.05, -1.25, -.4, .02, INK); circle(ctx, -1.27, -.42, .04); fillStroke(ctx, '#ffd23a', .01);
  ctx.restore();
}
function stomach(ctx, x, y, s, mix, t, rise = -1) {
  // tube first
  rrect(ctx, x - .1 * s, y - .98 * s, .2 * s, .75 * s, .09 * s); fillStroke(ctx, '#ff8fa0', s * .018);
  ctx.beginPath(); ctx.ellipse(x, y, .52 * s, .44 * s, -.12, 0, TAU); const g = ctx.createRadialGradient(x - .15 * s, y - .15 * s, s * .05, x, y, s * .55); g.addColorStop(0, '#ffc0c8'); g.addColorStop(1, '#ff8fa0'); fillStroke(ctx, g, s * .022);
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, .52 * s, .44 * s, -.12, 0, TAU); ctx.clip();
  ctx.fillStyle = 'rgba(140,40,50,.12)'; ctx.fillRect(x - .6 * s, y - .5 * s, 1.2 * s, 1.0 * s);
  if (mix < .5) { ctx.fillStyle = 'rgba(190,225,255,.5)'; ctx.fillRect(x - .6 * s, y - .5 * s, 1.2 * s, .5 * s); ctx.fillStyle = '#c4894a'; ctx.fillRect(x - .6 * s, y + .02 * s, 1.2 * s, .5 * s); }
  ctx.restore();
  const R = rng(5);
  for (let i = 0; i < 9; i++) { // food chunks
    const lx = (R() - .5) * .7, ly = .12 + R() * .22, sx = (R() - .5) * .8, sy = (R() - .5) * .6; const k = easeOut(mix);
    const px = lerp(lx, sx, k) + Math.sin(t * 1.6 + i) * .015 * k, py = lerp(ly, sy, k) + Math.cos(t * 1.3 + i) * .015 * k; circle(ctx, x + px * s, y + py * s, .045 * s);
    fillStroke(ctx, ['#7bc67b', '#ff9a3c', '#a35a2a'][i % 3], s * .01);
  }
  for (let i = 0; i < 8; i++) { // gas bubbles
    const lx = (R() - .5) * .8, ly = -.1 - R() * .22, sx = (R() - .5) * .8, sy = (R() - .5) * .6; const k = easeOut(mix);
    const px = lerp(lx, sx, k) + Math.sin(t * 1.4 + i * 2) * .02, py = lerp(ly, sy, k) + Math.cos(t * 1.1 + i) * .02; circle(ctx, x + px * s, y + py * s, .05 * s);
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill(); ctx.lineWidth = s * .01; ctx.strokeStyle = 'rgba(34,28,34,.7)'; ctx.stroke();
  }
  if (rise >= 0) { // a burp bubble with dinner climbing the tube
    const k = clamp(rise), by = lerp(y + .05 * s, y - .98 * s, easeOut(k));
    circle(ctx, x, by, .11 * s); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fill(); ctx.lineWidth = s * .014; ctx.strokeStyle = INK; ctx.stroke();
    circle(ctx, x - .03 * s, by + .015 * s, .03 * s); fillStroke(ctx, '#7bc67b', s * .008); circle(ctx, x + .035 * s, by - .02 * s, .028 * s); fillStroke(ctx, '#ff9a3c', s * .008);
  }
}
