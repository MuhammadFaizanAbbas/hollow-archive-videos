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
