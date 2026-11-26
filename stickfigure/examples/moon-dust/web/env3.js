// ---------- moon world: ground, dust letters, dome, bus, props ----------
function drawEarth(ctx, x, y, r, t) {
  ctx.save(); ctx.translate(x, y);
  const gl = ctx.createRadialGradient(0, 0, r * .9, 0, 0, r * 1.7); gl.addColorStop(0, 'rgba(140,200,255,.45)'); gl.addColorStop(1, 'rgba(140,200,255,0)');
  ctx.fillStyle = gl; ctx.fillRect(-r * 2, -r * 2, r * 4, r * 4);
  circle(ctx, 0, 0, r); const g = ctx.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#6fc3ff'); g.addColorStop(1, '#1f63c8'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); circle(ctx, 0, 0, r); ctx.clip();
  ctx.fillStyle = '#4fbf6a';
  ctx.beginPath(); ctx.moveTo(-r * .6, -r * .3); ctx.quadraticCurveTo(-r * .2, -r * .7, r * .1, -r * .35); ctx.quadraticCurveTo(r * .0, 0, -r * .3, r * .15); ctx.quadraticCurveTo(-r * .5, r * .1, -r * .6, -r * .3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(r * .25, r * .1); ctx.quadraticCurveTo(r * .7, -r * .05, r * .8, r * .35); ctx.quadraticCurveTo(r * .5, r * .75, r * .25, r * .45); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ellipse(ctx, -r * .3, -r * .55, r * .4, r * .09, .3); ctx.fill(); ellipse(ctx, r * .3, r * .1, r * .5, r * .08, -.2); ctx.fill(); ellipse(ctx, -r * .35, r * .4, r * .38, r * .08, .1); ctx.fill();
  ctx.fillStyle = 'rgba(8,10,40,.28)'; circle(ctx, r * .55, r * .5, r * 1.1); ctx.rect(-r * 2, -r * 2, r * 4, r * 4); ctx.fill('evenodd');
  ctx.restore();
  circle(ctx, 0, 0, r); ctx.lineWidth = Math.max(5, r * .05); ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
const MOON_R = rng(31);
const CRATERS = (() => { const R = rng(17); const a = []; for (let i = 0; i < 26; i++) a.push({ x: -700 + R() * 2500, y: R(), r: 60 + R() * 150 }); return a; })();
const ROCKS = (() => { const R = rng(23); const a = []; for (let i = 0; i < 30; i++) a.push({ x: -700 + R() * 2500, y: R(), r: 14 + R() * 36 }); return a; })();
function moonBG(ctx, t, cam, o = {}) {
  const hy = o.hy == null ? 950 : o.hy;
  applyCam(ctx, cam, .05);
  const g = ctx.createLinearGradient(0, -1400, 0, hy + 200); g.addColorStop(0, '#04061c'); g.addColorStop(.7, '#12185a'); g.addColorStop(1, '#2a2f8a');
  ctx.fillStyle = g; ctx.fillRect(-2500, -2500, 6100, 5200);
  applyCam(ctx, cam, .1); drawStars(ctx, t);
  if (o.earth !== false) { applyCam(ctx, cam, .2); drawEarth(ctx, o.ex == null ? 800 : o.ex, o.ey == null ? 400 : o.ey, o.er || 190, t); }
  // distant hills
  applyCam(ctx, cam, .55);
  ctx.beginPath(); ctx.moveTo(-1500, hy + 40); const R = rng(o.seed || 5);
  for (let x = -1500; x <= 2600; x += 140) ctx.lineTo(x, hy - 60 - R() * 130 + Math.sin(x * .004) * 40);
  ctx.lineTo(2600, hy + 200); ctx.lineTo(-1500, hy + 200); ctx.closePath(); fillStroke(ctx, '#8d89a3', 6);
  // ground
  applyCam(ctx, cam, 1);
  const gg = ctx.createLinearGradient(0, hy, 0, hy + 1300); gg.addColorStop(0, '#d9d6e2'); gg.addColorStop(1, '#8f8ba3');
  ctx.fillStyle = gg; ctx.fillRect(-1500, hy, 4080, 2800);
  line(ctx, -1500, hy, 2580, hy, 8);
  for (const c of CRATERS) { const y = hy + 40 + c.y * 900, k = .35 + (y - hy) / 900 * .9, rx = c.r * k * 1.6, ry = rx * .22; if (y > hy + 1300) continue; ellipse(ctx, c.x, y, rx, ry); ctx.fillStyle = '#a9a5ba'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(34,28,34,.65)'; ctx.stroke(); ellipse(ctx, c.x, y + ry * .25, rx * .8, ry * .6); ctx.fillStyle = '#847f98'; ctx.fill(); }
  for (const c of ROCKS) { const y = hy + 30 + c.y * 1000, k = .4 + (y - hy) / 1000 * .9, r = c.r * k; ellipse(ctx, c.x, y, r * 1.5, r); fillStroke(ctx, '#7c7890', 5); ellipse(ctx, c.x - r * .3, y - r * .3, r * .5, r * .3); ctx.fillStyle = '#a9a5ba'; ctx.fill(); }
}
// letters pressed into the dust: light lip + dark groove. reveal 0..1 writes them left to right
function dustLetters(ctx, lines, cx, cy, size, reveal = 1, o = {}) {
  ctx.save(); ctx.translate(cx, cy);
  const lh = size * 1.02;
  lines.forEach((str, i) => {
    const y = (i - (lines.length - 1) / 2) * lh;
    ctx.font = `700 ${size}px Poppins`; const w = ctx.measureText(str).width;
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 - 20, y - size, (w + 40) * clamp(reveal * lines.length - i), size * 2); ctx.clip();
    text(ctx, str, 6, y + 7, size, '#f7f5fc', '#f7f5fc', 6);
    text(ctx, str, 0, y, size, '#585470', '#585470', 4);
    text(ctx, str, -2, y - 3, size, '#4a4660', '#4a4660', 0);
    ctx.restore();
    if (o.eyes && str === 'COOL') {
      ctx.font = `700 ${size}px Poppins`; const wC = ctx.measureText('C').width, wO = ctx.measureText('O').width;
      const ey = y - size * .02;
      [wC + wO * .5, wC + wO * 1.5].forEach(dx => { const ex = -w / 2 + dx; circle(ctx, ex, ey, wO * .24); fillStroke(ctx, '#fff', 5); const lk = o.eyes.look || [0, 0]; circle(ctx, ex + lk[0] * wO * .1, ey + lk[1] * wO * .1, wO * .1); ctx.fillStyle = INK; ctx.fill(); });
    }
  });
  ctx.restore();
}
function dustGroove(ctx, pts, lw, col = '#3f3b57') {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] + 5, p[1] + 6) : ctx.moveTo(p[0] + 5, p[1] + 6)); ctx.lineWidth = lw + 3; ctx.strokeStyle = '#f7f5fc'; ctx.stroke();
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); ctx.restore();
}
function smileyDust(ctx, x, y, r, reveal = 1) {
  const n = 40, pts = []; for (let i = 0; i <= n * clamp(reveal * 1.5); i++) { const a = i / n * TAU - Math.PI / 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * .9]); }
  if (pts.length > 1) dustGroove(ctx, pts, 30);
  if (reveal > .5) { dustGroove(ctx, [[x - r * .35, y - r * .25], [x - r * .35, y - r * .05]], 34); dustGroove(ctx, [[x + r * .35, y - r * .25], [x + r * .35, y - r * .05]], 34); const m = []; for (let i = 0; i <= 12; i++) { const a = .25 * Math.PI + i / 12 * .5 * Math.PI; m.push([x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .5 - r * .05]); } dustGroove(ctx, m, 28); }
}
function noWrite(ctx, x, y, r, a = 1, pencil = true) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  circle(ctx, 0, 0, r); ctx.fillStyle = 'rgba(255,255,255,.96)'; ctx.fill();
  if (pencil) {
    ctx.save(); ctx.rotate(-.75); const L = r * 1.05, w = r * .2;
    rrect(ctx, -L / 2, -w / 2, L * .8, w, 6); fillStroke(ctx, '#ffd23a', r * .035);
    path(ctx, [[L * .3, -w / 2], [L * .5, 0], [L * .3, w / 2]]); fillStroke(ctx, '#f1d5a8', r * .03);
    path(ctx, [[L * .44, -w * .17], [L * .5, 0], [L * .44, w * .17]]); ctx.fillStyle = INK; ctx.fill();
    rrect(ctx, -L / 2 - w * .5, -w / 2, w * .55, w, 6); fillStroke(ctx, '#ff8fb0', r * .03);
    ctx.restore();
  }
  circle(ctx, 0, 0, r * .92); ctx.lineWidth = r * .16; ctx.strokeStyle = INK; ctx.stroke();
  circle(ctx, 0, 0, r * .92); ctx.lineWidth = r * .11; ctx.strokeStyle = '#e8262b'; ctx.stroke();
  const d = r * .92 * .7071; line(ctx, -d, -d, d, d, r * .2, INK); line(ctx, -d, -d, d, d, r * .13, '#e8262b');
  ctx.restore();
}
function moonDome(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -1.08, -.08, 2.16, .16, .05); fillStroke(ctx, '#bdb8cf', .02);
  ctx.beginPath(); ctx.arc(0, 0, 1, Math.PI, 0); ctx.closePath();
  const g = ctx.createLinearGradient(-1, -1, 1, 0); g.addColorStop(0, 'rgba(210,244,255,.95)'); g.addColorStop(1, 'rgba(120,196,240,.9)'); fillStroke(ctx, g, .025);
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 1, Math.PI, 0); ctx.clip();
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, Math.abs(i) / 3.2 + .001, 1, 0, Math.PI, 0); ctx.lineWidth = .014; ctx.strokeStyle = 'rgba(34,28,34,.55)'; ctx.stroke(); }
  for (let j = 1; j <= 2; j++) line(ctx, -1, -j * .3, 1, -j * .3, .012, 'rgba(34,28,34,.4)');
  ctx.beginPath(); ctx.arc(0, 0, .82, Math.PI * 1.1, Math.PI * 1.4); ctx.lineWidth = .05; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
  // little buildings inside
  rrect(ctx, -.5, -.36, .34, .36, .03); fillStroke(ctx, '#ffb27a', .018); rrect(ctx, .12, -.5, .3, .5, .03); fillStroke(ctx, '#7ad0c4', .018);
  ctx.restore();
  rrect(ctx, -.12, -.3, .24, .3, .05); fillStroke(ctx, '#f6f1e8', .02);
  line(ctx, 0, -1, 0, -1.3, .02); const w = Math.sin(t * 5) * .03; path(ctx, [[0, -1.3], [.28, -1.24 + w], [0, -1.16]]); fillStroke(ctx, '#e8262b', .016);
  ctx.restore();
}
function tourist(ctx, x, y, r, k, o = {}) {
  circle(ctx, x, y, r); fillStroke(ctx, '#f6f2ea', r * .1);
  const cols = ['#e0392f', '#2f63c9', '#3fa35b', '#f2b52a', '#7a4bc4'];
  ctx.save(); circle(ctx, x, y, r); ctx.clip(); ctx.fillStyle = cols[k % 5]; ctx.fillRect(x - r, y - r, r * 2, r * .62); ctx.restore();
  circle(ctx, x, y, r); ctx.lineWidth = r * .1; ctx.strokeStyle = INK; ctx.stroke();
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(x + sd * r * .38, y + r * .08, r * .14, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = r * .08; ctx.strokeStyle = INK; ctx.stroke(); }
  ctx.beginPath(); ctx.arc(x, y + r * .1, r * .36, .3, Math.PI - .3); ctx.lineWidth = r * .08; ctx.stroke();
}
function tourBus(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 600 * (o.flip || 1), s / 600);
  rrect(ctx, -300, -250, 600, 190, 40); fillStroke(ctx, '#ff9a2f', 9);
  rrect(ctx, -290, -400, 580, 160, 40); fillStroke(ctx, '#fff1cf', 9);
  for (let i = 0; i < 5; i++) {
    const wx = -250 + i * 110; rrect(ctx, wx, -382, 100, 122, 16); fillStroke(ctx, '#9fdcff', 6);
    ctx.save(); rrect(ctx, wx, -382, 100, 122, 16); ctx.clip();
    const bob = o.cheer ? Math.abs(Math.sin(t * 9 + i)) * 22 : 0; tourist(ctx, wx + 50, -296 - bob, 34, i);
    if (o.cheer) { circle(ctx, wx + 8, -250 - bob - 8, 14); ctx.fillStyle = '#f6f2ea'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); circle(ctx, wx + 92, -250 - bob - 8, 14); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    if (o.flash && (Math.floor(t * 8 + i) % 5 === 0)) { burst(ctx, wx + 50, -392, 40, 8, '#fff7a8', i + 2); }
  }
  text(ctx, 'MOON TOURS', 0, -150, 56, '#fff', INK, 10);
  for (const wx of [-190, 190]) { circle(ctx, wx, -50, 66); fillStroke(ctx, '#2b2b34', 9); circle(ctx, wx, -50, 26); fillStroke(ctx, '#c9c6cf', 6); }
  line(ctx, 200, -400, 200, -480, 8); ellipse(ctx, 200, -490, 36, 14, Math.sin(t * 3) * .4); fillStroke(ctx, '#e8262b', 5);
  ctx.restore();
}
function robovac(ctx, x, y, r, t, mood = 'strain', a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
  ellipse(ctx, 0, r * .75, r * 1.1, r * .22); ctx.fillStyle = 'rgba(40,20,30,.25)'; ctx.fill();
  ellipse(ctx, 0, 0, r, r * .55); fillStroke(ctx, '#9fb3c8', r * .05);
  ellipse(ctx, 0, -r * .12, r * .78, r * .38); fillStroke(ctx, '#c9d6e4', r * .04);
  line(ctx, r * .5, -r * .5, r * .65, -r * .95, r * .05); circle(ctx, r * .65, -r * .98, r * .08); ctx.fillStyle = mood === 'sad' ? '#5a8aa8' : '#ff5a5a'; ctx.fill();
  rrect(ctx, -r * .55, -r * .24, r * 1.1, r * .26, r * .1); fillStroke(ctx, '#1d2540', r * .03);
  const ey = -r * .11;
  for (const sx of [-1, 1]) {
    const ex = sx * r * .24;
    if (mood === 'strain') { ctx.beginPath(); ctx.moveTo(ex - sx * r * .1, ey - r * .07); ctx.lineTo(ex + sx * r * .08, ey); ctx.lineTo(ex - sx * r * .1, ey + r * .07); ctx.lineWidth = r * .035; ctx.strokeStyle = '#6ff0ff'; ctx.lineCap = 'round'; ctx.stroke(); }
    else if (mood === 'sad') { ctx.beginPath(); ctx.arc(ex, ey + r * .02, r * .09, Math.PI * 1.1, Math.PI * 1.9, true); ctx.lineWidth = r * .035; ctx.strokeStyle = '#6ff0ff'; ctx.lineCap = 'round'; ctx.stroke(); line(ctx, ex - sx * r * .06, ey - r * .1, ex + sx * r * .08, ey - r * .15, r * .03, '#6ff0ff'); }
    else { circle(ctx, ex, ey, r * .09); ctx.fillStyle = '#6ff0ff'; ctx.fill(); }
  }
  ctx.restore();
}
function broom(ctx, x1, y1, x2, y2, w = 120) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, px = -uy, py = ux;
  line(ctx, x1, y1, x2, y2, 15); line(ctx, x1, y1, x2, y2, 9, '#c58a3d');
  path(ctx, [[x2 + px * w * .15, y2 + py * w * .15], [x2 - px * w * .15, y2 - py * w * .15], [x2 + ux * w * .75 - px * w * .55, y2 + uy * w * .75 - py * w * .55], [x2 + ux * w * .75 + px * w * .55, y2 + uy * w * .75 + py * w * .55]]); fillStroke(ctx, '#e8b542', 6);
  for (let i = -2; i <= 2; i++) line(ctx, x2 + ux * w * .2 + px * i * w * .1, y2 + uy * w * .2 + py * i * w * .1, x2 + ux * w * .7 + px * i * w * .2, y2 + uy * w * .7 + py * i * w * .2, 3, 'rgba(34,28,34,.55)');
}
function tourMap(ctx, x, y, w, h, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rrect(ctx, -w / 2, -h / 2, w, h, 20); fillStroke(ctx, '#f6e7b8', 9);
  ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, 20); ctx.clip();
  line(ctx, 0, -h / 2, 0, h / 2, 5, 'rgba(120,90,40,.5)'); line(ctx, -w / 2, 0, w / 2, 0, 5, 'rgba(120,90,40,.5)');
  const R = rng(12); for (let i = 0; i < 9; i++) { ellipse(ctx, -w * .4 + R() * w * .8, -h * .4 + R() * h * .8, 26 + R() * 40, 14 + R() * 18); ctx.fillStyle = 'rgba(150,140,170,.5)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(34,28,34,.5)'; ctx.stroke(); }
  [[-.28, -.28], [.26, -.3], [-.3, .26]].forEach(([a, b]) => { ctx.save(); ctx.translate(w * a, h * b); ctx.beginPath(); ctx.arc(0, 0, 38, Math.PI, 0); ctx.closePath(); fillStroke(ctx, '#9fdcff', 5); ctx.restore(); });
  ctx.restore();
  text(ctx, 'moon colony map', 0, -h / 2 + 46, 40, INK, INK, 0);
  const pul = 1 + Math.sin(t * 6) * .06, sx = w * .02, sy = h * .08;
  ctx.save(); ctx.translate(sx, sy); ctx.scale(pul, pul);
  star5(ctx, 0, -10, 70, .1, '#ffd23a');
  rrect(ctx, -170, 50, 340, 86, 20); fillStroke(ctx, '#e8262b', 7); text(ctx, 'MAX IS COOL', 0, 94, 50, '#fff', INK, 0);
  ctx.restore();
  ctx.restore();
}
function elder(ctx, o) {
  const s = o.s, h = loc(o, 0, -.765), hr = s * .19, fl = o.flip || 1;
  for (const sd of [-1, 1]) { ellipse(ctx, h[0] + sd * hr * .95, h[1] - hr * .1, hr * .18, hr * .3); fillStroke(ctx, '#e6e6ee', s * .008); }
  for (const sd of [-1, 1]) { circle(ctx, h[0] + sd * s * .072 * fl + 0, h[1] - s * .005, s * .056); ctx.lineWidth = s * .012; ctx.strokeStyle = INK; ctx.stroke(); }
  line(ctx, h[0] - s * .016, h[1] - s * .005, h[0] + s * .016, h[1] - s * .005, s * .01);
  for (const sd of [-1, 1]) { ellipse(ctx, h[0] + sd * hr * .2, h[1] + hr * .42, hr * .26, hr * .1, sd * .35); fillStroke(ctx, '#f4f4fa', s * .008); }
}
function bootPrint(ctx, x, y, s, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a; ctx.rotate(-.08);
  const sole = () => { const L = [[0, -.52], [-.1, -.5], [-.17, -.42], [-.19, -.3], [-.16, -.16], [-.11, -.05], [-.1, .02]]; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); L.slice(1).forEach(p => ctx.lineTo(p[0], p[1])); L.slice().reverse().slice(0, 6).forEach(p => ctx.lineTo(-p[0], p[1])); ctx.closePath(); };
  const heel = () => { ctx.beginPath(); ctx.roundRect(-.115, .09, .23, .22, .06); };
  for (const [dx, dy, fill, st] of [[.018, .022, '#f7f5fc', null], [0, 0, '#5a566f', '#413d55']]) {
    ctx.save(); ctx.translate(dx, dy); ctx.lineJoin = 'round'; sole(); ctx.fillStyle = fill; ctx.fill(); if (st) { ctx.lineWidth = .016; ctx.strokeStyle = st; ctx.stroke(); } heel(); ctx.fill(); if (st) ctx.stroke(); ctx.restore();
  }
  ctx.lineWidth = .02; ctx.strokeStyle = '#8b87a3'; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const yy = -.42 + i * .075, w = i < 2 ? .1 - (1 - i) * .02 : .12; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(w, yy); ctx.stroke(); }
  for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-.07, .14 + i * .08); ctx.lineTo(.07, .14 + i * .08); ctx.stroke(); }
  ctx.restore();
}
function windIcon(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  for (const [yy, len, c] of [[-.18, .5, 1], [0, .62, -1], [.18, .45, 1]]) { ctx.beginPath(); ctx.moveTo(-len / 2, yy); ctx.lineTo(len / 2 - .12, yy); ctx.arc(len / 2 - .12, yy - .1 * c, .1, Math.PI / 2, -Math.PI * 1.1 * c, c > 0); ctx.lineWidth = .075; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = .045; ctx.strokeStyle = '#cfe9ff'; ctx.stroke(); }
  ctx.restore();
}
function rainIcon(ctx, x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(-.16, -.05, .16, Math.PI * .5, Math.PI * 1.5); ctx.arc(0, -.2, .22, Math.PI, 0); ctx.arc(.18, -.05, .16, Math.PI * 1.5, Math.PI * .5); ctx.closePath(); fillStroke(ctx, '#d6e4f5', .03);
  for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i / 4) % 1; drop(ctx, -.24 + i * .16, .16 + ph * .22, .045); ctx.fillStyle = '#6fb6ff'; ctx.fill(); }
  ctx.restore();
}
function dustPuffs(ctx, x, y, t, n = 5, r = 40, a = 1) {
  for (let i = 0; i < n; i++) { const ph = (t * 1.6 + i / n) % 1; puff(ctx, x + Math.sin(i * 2.3) * r * 1.3 * ph + (i - n / 2) * r * .6, y - ph * r * 1.5, r * (.5 + ph * .8), t, '#e6e3ee', i + 3, (1 - ph) * .8 * a); }
}
function drop(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y - r * 1.4); ctx.quadraticCurveTo(x + r, y, x, y + r * .8); ctx.quadraticCurveTo(x - r, y, x, y - r * 1.4); }
