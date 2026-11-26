const SHOTS = [];
// ---------- characters ----------
const MAX = { cols: PAL.blue, hat: 'bandana', hatCol: '#ff7a2f', dotCol: '#fff' };
const PRI = { cols: PAL.purple, hat: 'captain' };
const KIDS = [{ cols: PAL.yellow, hat: 'none' }, { cols: PAL.green, hat: 'none' }, { cols: PAL.red, hat: 'bandana', hatCol: '#2f63c9', dotCol: '#fff' }, { cols: PAL.navy, hat: 'none' }, { cols: PAL.purple, hat: 'bandana', hatCol: '#3fa35b', dotCol: '#fff' }, { cols: PAL.green, hat: 'sailor', belt: false }];
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const idleLegs = (t, ph = 0) => ({ L: [.12 + Math.sin(t * 1.2 + ph) * .05, -.05], R: [.14 + Math.sin(t * 1.4 + ph) * .05, -.05] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const camOf = (t, x, y, z, r = 0, a = 3) => { const hh = handheld(t, a); return { x: x + hh[0], y: y + hh[1], z, r }; };
const bob = (t, ph = 0, a = 10) => Math.sin(t * 2 + ph) * a;
const scene = (ctx, t, cam, o = {}) => { moonBG(ctx, t, cam, o); applyCam(ctx, cam, 1); };
const LET = ['MAX IS', 'COOL'];
const pillAt = (ctx, lt, t0, str, x, y, fill = '#ffd23a', size = 60) => { const a = popAt(lt, t0, .2); if (a > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(a, a); pill(ctx, str, 0, 0, fill, size); ctx.restore(); } };

// ---- the hook picture (first and last shot): giant letters + a NO-writing sign ----
function hookPic(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1 + lt * .03, Math.sin(t * 1.3) * .008, 4);
  scene(ctx, t, cam, { hy: 800, ex: 190, ey: 330, er: 130 });
  dustLetters(ctx, LET, 520, 1060, 175, 1);
  const k = 1 + Math.sin(t * 4) * .03; noWrite(ctx, 600, 520, 260 * k);
  kid(ctx, MAX, { x: 140, y: 1420 + bob(t, 1, 6), s: 430, face: { eyes: 'wide', mouth: 'grin', look: [.8, -.4] }, arms: { L: [.5, -.2], R: { ik: [.4, -.7] } }, legs: idleLegs(t) });
  kid(ctx, PRI, { x: 950, y: 1430 + bob(t, 3, 6), s: 450, flip: -1, face: { eyes: 'half', mouth: 'frown', browAng: .35, look: [-.8, -.3] }, arms: { L: { ik: [.25, -.5] }, R: { ik: [.25, -.5] } }, legs: idleLegs(t, 2) });
  sweat(ctx, 260, 1130, 40, 1);
}
SHOTS.push({ start: 0, end: 1.44, tr: 'whip', draw(ctx, lt, t) { hookPic(ctx, lt, t); } });

// 1: on this Moon colony (wide, dome, kids walking)
SHOTS.push({ start: 1.44, end: 3.2, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 400 + lt * 280, 960, 1.0 + lt * .04, 0, 3);
  scene(ctx, t, cam, { hy: 860, ex: 780, ey: 380, er: 210 });
  moonDome(ctx, 330, 960, 400, t); moonDome(ctx, 1000, 940, 280, t);
  [[100, 0], [430, 3], [760, 4], [1090, 5]].forEach(([x, i], k) => { const px = x + lt * 70; kid(ctx, KIDS[i], { x: px, y: 1340 + k % 2 * 80, s: 360, face: { eyes: 'normal', mouth: 'smile' }, arms: walkArms(t + k, 7, .35), legs: walkLegs(t + k, 7, .35) }); });
  pillAt(ctx, lt, .3, 'moon colony', 540, 330, '#fff', 66);
} });

// 2: can't write their name in the dust (kid writes MAX, red stamp)
SHOTS.push({ start: 3.2, end: 5.36, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 - lt * 30, 960, 1.05 + lt * .05, 0, 3);
  scene(ctx, t, cam, { hy: 700, ex: 860, ey: 250, er: 140 });
  const r = clamp(lt / 1.1);
  dustLetters(ctx, ['MAX'], 720, 1250, 230, easeOut(r));
  const hx = 460 + 460 * easeOut(r) - 80;
  kid(ctx, MAX, { x: 230, y: 1480, s: 520, lean: .26, squash: .95, face: { eyes: 'half', mouth: 'smirk', look: [.8, .8] }, arms: { L: [.3, -.2], R: [.9, -.2] }, legs: { L: [.25, -.1], R: [.1, -.3] } });
  dustPuffs(ctx, hx + 10, 1345, t, 4, 30, r < 1 ? 1 : 0);
  const a = popAt(lt, 1.55, .18); if (a > 0) { ctx.save(); ctx.translate(640, 640); ctx.scale(a, a); noWrite(ctx, 0, 0, 250); ctx.restore(); }
} });

// 3: not even a smiley face
SHOTS.push({ start: 5.36, end: 6.96, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 1100 - lt * 60, 1.05 + lt * .12, 0, 3);
  scene(ctx, t, cam, { hy: 520, earth: false });
  smileyDust(ctx, 540, 1000, 270, clamp(lt / .9));
  const a = popAt(lt, 1.0, .18); if (a > 0) { ctx.save(); ctx.translate(540, 1000); ctx.scale(a, a); circle(ctx, 0, 0, 400); ctx.lineWidth = 64; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 44; ctx.strokeStyle = '#e8262b'; ctx.stroke(); const d = 283; line(ctx, -d, -d, d, d, 64, INK); line(ctx, -d, -d, d, d, 44, '#e8262b'); ctx.restore(); }
} });

// 4: nobody tells the new kid why
SHOTS.push({ start: 6.96, end: 9.04, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .05, 0, 3);
  scene(ctx, t, cam, { hy: 850, ex: 800, ey: 330, er: 170 });
  moonDome(ctx, 540, 1000, 330, t);
  kid(ctx, PRI, { x: 140, y: 1330, s: 420, face: { eyes: 'normal', mouth: 'o', look: [-1, -.5] }, arms: walkArms(0, 1, 0), legs: idleLegs(t, 1), lean: -.05 });
  kid(ctx, KIDS[2], { x: 950, y: 1330, s: 400, flip: -1, face: { eyes: 'normal', mouth: 'o', look: [1, -.6] }, arms: { L: [.4, -.2], R: [.4, -.2] }, legs: idleLegs(t, 3) });
  const lk = Math.sin(t * 3) * .9;
  kid(ctx, MAX, { x: 540, y: 1520 + bob(t, 0, 8), s: 700, face: { eyes: 'wide', mouth: 'o', look: [lk, 0], browAng: -.3, browUp: 1 }, arms: { L: [.5, -.3], R: { ik: [.4, -.7] } }, legs: idleLegs(t) });
  const a = popAt(lt, .5, .2); if (a > 0) { ctx.save(); ctx.translate(840, 640); ctx.scale(a, a); text(ctx, '?', 0, 0, 210, '#ffd23a', INK, 20); ctx.restore(); }
  const b = popAt(lt, 1.2, .2); if (b > 0) { ctx.save(); ctx.translate(250, 600); ctx.scale(b, b); text(ctx, '?', 0, 0, 150, '#fff', INK, 16); ctx.restore(); }
} });

// 5: they just go quiet
SHOTS.push({ start: 9.04, end: 10.24, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 40, 960, 1.04 + lt * .05, 0, 3);
  scene(ctx, t, cam, { hy: 880, earth: false });
  [[110, 0, 380], [370, 3, 420], [640, 4, 420], [920, 5, 380]].forEach(([x, i, s], k) => kid(ctx, KIDS[i], { x, y: 1380 + bob(t, k, 4), s, face: { eyes: 'half', mouth: 'flat', look: [0, 0] }, arms: { L: [.4, -.2], R: [.4, -.2] }, legs: idleLegs(t, k) }));
  kid(ctx, PRI, { x: 540, y: 1560, s: 500, face: { eyes: 'half', mouth: 'flat', look: [0, 0] }, arms: { L: [.4, -.2], R: [.4, -.2] }, legs: idleLegs(t, 5) });
  pillAt(ctx, lt, .15, '...', 540, 420, '#fff', 110);
} });

// 6: why ban a doodle? it's just dust
SHOTS.push({ start: 10.24, end: 12.4, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .06, Math.sin(t) * .01, 3);
  scene(ctx, t, cam, { hy: 820, ex: 220, ey: 330, er: 130 });
  const rise = lt > 1.1;
  kid(ctx, MAX, { x: 540, y: 1560 + bob(t, 0, 6), s: 760, face: { eyes: 'normal', mouth: rise ? 'smile' : 'flat', browAng: .3, browOne: 1, look: [0, .6] }, arms: { L: [.5, -.3], R: { ik: [.34, -.28] } }, legs: idleLegs(t) });
  if (lt > 1.1) { for (let i = 0; i < 12; i++) { const ph = clamp((lt - 1.1) * 1.3 + i * .02); circle(ctx, 760 + Math.sin(i * 3) * 30, 1100 + ph * 360 + i * 6, 6 + i % 3 * 3); ctx.fillStyle = '#e6e3ee'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); } }
  const a = popAt(lt, .2, .2); if (a > 0) { ctx.save(); ctx.translate(790, 520); ctx.scale(a, a); text(ctx, '?', 0, 0, 190, '#ffd23a', INK, 18); ctx.restore(); }
  pillAt(ctx, lt, 1.3, 'just dust', 540, 380, '#fff', 74);
} });

// 7: I'm Max, I'm ten, and I'm bored
SHOTS.push({ start: 12.4, end: 14.64, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + Math.sin(lt * 1.2) * 40, 960, 1.0 + lt * .04, 0, 3);
  scene(ctx, t, cam, { hy: 880, ex: 800, ey: 360, er: 160 });
  moonDome(ctx, 330, 980, 260, t);
  const kick = kf(lt, [[0, 0], [1.2, 0], [1.45, -1], [1.7, .2]]);
  kid(ctx, MAX, { x: 540, y: 1470 + bob(t, 0, 6), s: 640, lean: -.05, face: { eyes: 'half', mouth: 'flat', look: [.7, .6] }, arms: { L: [.2, -.1], R: [.25, -.1] }, legs: { L: [.1, -.05], R: [.2 + kick * .9, -.2 + kick * .3] } });
  if (lt > 1.35) { const p = clamp((lt - 1.35) / .8); const bx = 700 + p * 380, by = 1430 - Math.sin(p * Math.PI) * 220; circle(ctx, bx, by, 30); fillStroke(ctx, '#7c7890', 6); }
  pillAt(ctx, lt, .25, 'max', 540, 330, '#fff', 64); pillAt(ctx, lt, .75, '10', 800, 330, '#ffd23a', 64);
} });

// 8: so I wrote it anyway (looks both ways, then writes)
SHOTS.push({ start: 14.64, end: 16.96, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 - lt * 20, 960, 1.04 - lt * .03, 0, 3);
  scene(ctx, t, cam, { hy: 760, ex: 840, ey: 280, er: 130 });
  const w = clamp((lt - .9) / 1.2);
  dustLetters(ctx, LET, 700, 1010, 175, easeOut(w));
  const look = lt < .8 ? Math.sin(lt * 9) : .8;
  kid(ctx, MAX, { x: 190, y: 1430, s: 500, lean: lt > .8 ? .26 : .05, face: { eyes: 'normal', mouth: 'smirk', browAng: .35, look: [look, .1] }, arms: lt > .8 ? { L: [.3, -.2], R: [.5, -.2] } : { L: [.5, -.2], R: [.5, -.2] }, legs: lt > .8 ? { L: [.25, -.1], R: [.1, -.3] } : idleLegs(t) });
  if (w > 0 && w < 1) dustPuffs(ctx, 450 + w * 500, 1180, t, 4, 30);
  pillAt(ctx, lt, 1.3, 'giant letters', 540, 330, '#ffd23a', 62);
} });

// 9: MAX IS COOL reveal (letters up close)
SHOTS.push({ start: 16.96, end: 18.08, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 + lt * 30, 1.12 + lt * .12, Math.sin(t * 2) * .01, 3);
  scene(ctx, t, cam, { hy: 400, earth: false });
  const k = popAt(lt, .05, .25);
  ctx.save(); ctx.translate(540, 1010); ctx.scale(.8 + .2 * k, .8 + .2 * k); dustLetters(ctx, LET, 0, 0, 270, 1); ctx.restore();
  for (let i = 0; i < 5; i++) { const a = popAt(lt, .1 + i * .12, .2); if (a > 0) sparkle(ctx, 140 + i * 200, 660 + (i % 2) * 700, 50 * a, 1); }
} });

// 10: it looked amazing
SHOTS.push({ start: 18.08, end: 19.44, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .08, 0, 3);
  scene(ctx, t, cam, { hy: 640, ex: 820, ey: 280, er: 150 });
  dustLetters(ctx, LET, 540, 820, 170, 1);
  kid(ctx, MAX, { x: 520, y: 1560 + bob(t, 0, 10), s: 600, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [2.5, .3], R: [2.5 + Math.sin(t * 6) * .25, .3] }, legs: idleLegs(t) });
  for (let i = 0; i < 6; i++) { const a = popAt(lt, .05 + i * .08, .2); if (a > 0) sparkle(ctx, 130 + i * 170, 520 + (i % 3) * 120, 46 * a, 1); }
  pillAt(ctx, lt, .4, 'amazing', 540, 330, '#fff', 70);
} });

// 11: the principal ran out with a broom
SHOTS.push({ start: 19.44, end: 21.76, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + (1 - lt) * 20, 960, 1.0, 0, 5);
  scene(ctx, t, cam, { hy: 820, ex: 220, ey: 330, er: 130 });
  moonDome(ctx, 1040, 960, 240, t);
  dustLetters(ctx, LET, 450, 950, 170, 1);
  const run = easeOut(clamp(lt / 1.6)); const px = lerp(1250, 780, run);
  const o = { x: px, y: 1470, s: 560, flip: -1, lean: -.1, face: { eyes: 'wide', mouth: 'teeth', browAng: .45 }, arms: { L: walkArms(t, 14, .6).L, R: { ik: [.3, -.7] } }, legs: lt < 1.6 ? walkLegs(t, 16, .8) : idleLegs(t) };
  const h = loc(o, .3, -.7); broom(ctx, h[0] + 60, h[1] - 280, h[0] - 40, h[1] + 20, 190);
  kid(ctx, PRI, o);
  kid(ctx, MAX, { x: 200, y: 1460, s: 520, face: { eyes: 'wide', mouth: 'o', look: [1, 0], browAng: -.3, browUp: 1 }, arms: { L: [.5, -.3], R: [.5, -.3] }, legs: idleLegs(t, 2) });
  sweat(ctx, 330, 1050, 44, 1);
  const a = popAt(lt, 1.5, .15); if (a > 0) { ctx.save(); ctx.translate(560, 560); ctx.scale(a, a); text(ctx, '!', 0, 0, 260, '#e8262b', INK, 22); ctx.restore(); }
} });

// 12: he swept, he scrubbed
SHOTS.push({ start: 21.76, end: 23.2, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.02 + lt * .05, 0, 4);
  scene(ctx, t, cam, { hy: 760, ex: 860, ey: 280, er: 120 });
  dustLetters(ctx, LET, 540, 880, 200, 1);
  const sw = Math.sin(t * 16) * 150;
  const o = { x: 800 + sw * .25, y: 1520, s: 580, lean: Math.sin(t * 16) * .06, face: { eyes: 'squint', mouth: 'teeth', browAng: .4 }, arms: { L: { ik: [.1, -.5] }, R: { ik: [.12, -.5] } }, legs: idleLegs(t) };
  const hh = loc(o, .12, -.5); broom(ctx, hh[0] + 40, hh[1] - 200, 540 + sw * .8, 1130, 220);
  dustPuffs(ctx, 540 + sw * .8, 1170, t, 5, 36);
  kid(ctx, PRI, o);
  const a = popAt(lt, .7, .15); if (a > 0) { ctx.save(); ctx.translate(840, 600); ctx.scale(a, a); text(ctx, 'scrub!', 0, 0, 100, '#fff', INK, 16); ctx.restore(); }
} });

// 13: but the letters just stared back (googly eyes)
SHOTS.push({ start: 23.2, end: 24.96, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 + lt * 20, 1.08 + lt * .1, 0, 3);
  scene(ctx, t, cam, { hy: 380, earth: false });
  const lk = [Math.sin(t * 2) * .8, -.7];
  dustLetters(ctx, LET, 540, 1000, 250, 1, { eyes: { look: lk } });
  kid(ctx, PRI, { x: 900, y: 1500, s: 400, flip: -1, lean: .12, face: { eyes: 'half', mouth: 'frown', browAng: .4, look: [-1, 0] }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: idleLegs(t) });
  sweat(ctx, 790, 1180, 40, 1);
  pillAt(ctx, lt, .7, 'still there', 540, 360, '#fff', 66);
} });

// 14: the robot vacuum tried too
SHOTS.push({ start: 24.96, end: 27.12, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 20, 960, 1.04 + lt * .05, 0, 3);
  scene(ctx, t, cam, { hy: 750, ex: 800, ey: 270, er: 130 });
  dustLetters(ctx, LET, 540, 880, 200, 1);
  const rx = lerp(120, 700, ease(clamp(lt / 1.7))) + Math.sin(t * 22) * 4;
  robovac(ctx, rx, 1150, 190, t, lt < 1.7 ? 'strain' : 'sad');
  for (let i = 0; i < 6; i++) { const ph = (t * 3 + i / 6) % 1; line(ctx, rx - 160 - ph * 90, 1175 + (i - 3) * 8, rx - 100 - ph * 90, 1175 + (i - 3) * 8, 5, 'rgba(255,255,255,.8)'); }
  sweat(ctx, rx + 120, 1040, 34, 1);
  pillAt(ctx, lt, .3, 'robot vacuum', 540, 330, '#9fdcff', 64);
} });

// 15: it gave up and went to sulk
SHOTS.push({ start: 27.12, end: 28.72, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 80, 960, 1.1 - lt * .05, 0, 3);
  scene(ctx, t, cam, { hy: 820, ex: 220, ey: 300, er: 120 });
  const rx = 420 + lt * 260;
  robovac(ctx, rx, 1160, 240, t, 'sad');
  ctx.save(); ctx.translate(rx, 800); for (const [dx, dy, r] of [[-60, 0, 70], [10, -30, 90], [80, 0, 66]]) { circle(ctx, dx, dy, r); ctx.fillStyle = '#9aa6c0'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
  for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i / 5) % 1; drop(ctx, -80 + i * 40, 80 + ph * 160, 9); ctx.fillStyle = '#6fb6ff'; ctx.fill(); } ctx.restore();
  pillAt(ctx, lt, .3, 'sulking', 540, 330, '#fff', 66);
} });

// 16: a tourist bus rolled by
SHOTS.push({ start: 28.72, end: 30.8, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .03, 0, 3);
  scene(ctx, t, cam, { hy: 820, ex: 240, ey: 330, er: 170 });
  moonDome(ctx, 900, 930, 260, t);
  dustLetters(ctx, LET, 540, 1010, 150, 1);
  const bx = lerp(-380, 640, easeOut(clamp(lt / 1.8)));
  dustPuffs(ctx, bx - 280, 1290, t, 5, 44);
  tourBus(ctx, bx, 1300, 740, t, { flash: lt > 1.4 });
} });

// 17: and everybody clapped
SHOTS.push({ start: 30.8, end: 32.16, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 30, 940, 1.1 + lt * .08, 0, 4);
  scene(ctx, t, cam, { hy: 820, earth: false });
  tourBus(ctx, 520, 1330, 940, t, { cheer: true, flash: true });
  const sh = shake(t * 6, 8);
  for (let i = 0; i < 5; i++) { const a = popAt(lt, .1 + i * .08, .15); if (a > 0) { ctx.save(); ctx.translate(120 + i * 210 + sh[0], 560 + (i % 2) * 90); ctx.scale(a, a); star5(ctx, 0, 0, 44, t, '#ffe14d'); ctx.restore(); } }
  pillAt(ctx, lt, .2, 'clap clap', 540, 360, '#ffd23a', 72);
} });

// 18: here's why. no wind and no rain
SHOTS.push({ start: 32.16, end: 35.76, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .03, 0, 2);
  applyCam(ctx, cam, 1); const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0c1040'); g.addColorStop(1, '#3a3f9a'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 1700, 2600);
  applyCam(ctx, cam, .3); drawStars(ctx, t); applyCam(ctx, cam, 1);
  drawEarth(ctx, 540, 450, 130, t);
  pillAt(ctx, lt, .1, "here's why", 540, 230, '#ffd23a', 78);
  const a = popAt(lt, 1.2, .2); if (a > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(a, a); pill(ctx, 'on the moon', 0, 0, '#fff', 64); ctx.restore(); }
  const b = popAt(lt, 1.8, .22); if (b > 0) { ctx.save(); ctx.translate(290, 960); ctx.scale(b, b); circle(ctx, 0, 0, 190); fillStroke(ctx, '#e9f5ff', 10); windIcon(ctx, 0, 0, 260); const d = 140; line(ctx, -d, -d, d, d, 36, INK); line(ctx, -d, -d, d, d, 24, '#e8262b'); ctx.restore(); text(ctx, 'no wind', 290, 1190, 66, '#fff', INK, 12); }
  const c = popAt(lt, 2.5, .22); if (c > 0) { ctx.save(); ctx.translate(790, 960); ctx.scale(c, c); circle(ctx, 0, 0, 190); fillStroke(ctx, '#e9f5ff', 10); rainIcon(ctx, 0, 0, 280, t); const d = 140; line(ctx, -d, -d, d, d, 36, INK); line(ctx, -d, -d, d, d, 24, '#e8262b'); ctx.restore(); text(ctx, 'no rain', 790, 1190, 66, '#fff', INK, 12); }
} });

// 19: nothing ever wipes the dust
SHOTS.push({ start: 35.76, end: 37.6, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 - lt * 40, 1.0 + lt * .12, 0, 3);
  scene(ctx, t, cam, { hy: 600, ex: 800, ey: 250, er: 140 });
  dustLetters(ctx, LET, 540, 1050, 210, 1);
  for (let i = 0; i < 18; i++) { const ph = (t * .5 + i / 18) % 1; ctx.save(); ctx.globalAlpha = .6 * Math.sin(ph * Math.PI); circle(ctx, 80 + i * 56, 700 + ((i * 97) % 600), 4 + (i % 3) * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore(); }
  pillAt(ctx, lt, .3, 'nothing wipes it', 540, 360, '#fff', 64);
  sparkle(ctx, 200, 780, 44 * popAt(lt, .5, .2), 1); sparkle(ctx, 890, 1330, 52 * popAt(lt, .7, .2), 1);
} });

// 20: a footprint lasts millions of years (star trails spin)
SHOTS.push({ start: 37.6, end: 40.32, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .06, 0, 2);
  applyCam(ctx, cam, 1); ctx.fillStyle = '#080c2c'; ctx.fillRect(-300, -300, 1700, 2600);
  ctx.save(); ctx.translate(540, 700); ctx.rotate(lt * .6);
  const R = rng(5); for (let i = 0; i < 40; i++) { const r = 100 + R() * 800, a0 = R() * TAU, len = .5 + R() * .6; ctx.beginPath(); ctx.arc(0, 0, r, a0, a0 + len); ctx.lineWidth = 3 + R() * 3; ctx.strokeStyle = `rgba(255,255,255,${.4 + R() * .5})`; ctx.stroke(); }
  ctx.restore();
  const gg = ctx.createLinearGradient(0, 1100, 0, 1920); gg.addColorStop(0, '#d9d6e2'); gg.addColorStop(1, '#8f8ba3'); ctx.fillStyle = gg; ctx.fillRect(-300, 1100, 1700, 900); line(ctx, -300, 1100, 1400, 1100, 8);
  const a = popAt(lt, .1, .3); bootPrint(ctx, 540, 1260 + (1 - a) * 80, 800 * (.6 + .4 * a));
  pillAt(ctx, lt, .6, 'millions of years', 540, 380, '#ffd23a', 78);
  sparkle(ctx, 250, 1120, 50 * popAt(lt, .8, .2), 1); sparkle(ctx, 850, 1150, 46 * popAt(lt, 1.0, .2), 1);
} });

// 21: I'm eighty now
SHOTS.push({ start: 40.32, end: 41.36, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .06, 0, 3);
  scene(ctx, t, cam, { hy: 850, ex: 800, ey: 330, er: 170 });
  const o = { x: 520, y: 1560 + bob(t, 0, 6), s: 760, lean: .05, face: { eyes: 'happy', mouth: 'smile' }, arms: { L: { ik: [-.26, -.2] }, R: [2.5 + Math.sin(t * 5) * .2, .3] }, legs: idleLegs(t) };
  kid(ctx, MAX, o); elder(ctx, o);
  const c = loc(o, -.26, -.2); line(ctx, c[0], c[1] - 40, c[0] + 8, c[1] + 270, 14); line(ctx, c[0], c[1] - 40, c[0] + 8, c[1] + 270, 8, '#c58a3d');
  pillAt(ctx, lt, .15, 'max, 80', 540, 330, '#fff', 66);
} });

// 22: Max is cool is on every tourist map
SHOTS.push({ start: 41.36, end: 44.08, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.18 - lt * .12, Math.sin(lt * 1.5) * .02, 3);
  scene(ctx, t, cam, { hy: 700, ex: 840, ey: 250, er: 110 });
  const z = kf(lt, [[0, .8], [.35, 1.04, easeOut], [.6, 1]]);
  ctx.save(); ctx.translate(540, 890); ctx.scale(z, z); tourMap(ctx, 0, 0, 800, 640, -.05 + Math.sin(t * 2) * .02, t); ctx.restore();
  const o = { x: 240, y: 1530, s: 480, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [.4, -.2], R: [2.5 + Math.sin(t * 5) * .2, .3] }, legs: idleLegs(t) };
  kid(ctx, MAX, o); elder(ctx, o);
  [[860, 2], [720, 4]].forEach(([x, i], k) => kid(ctx, KIDS[i], { x, y: 1530 - k * 20, s: 400, flip: -1, face: { eyes: 'happy', mouth: 'smile' }, arms: { L: [.3, -.2], R: { ik: [.1, -.85] } }, legs: idleLegs(t, k) }));
  for (let i = 0; i < 4; i++) { const a = popAt(lt, .5 + i * .12, .2); if (a > 0) sparkle(ctx, 180 + i * 240, 480 + (i % 2) * 80, 48 * a, 1); }
} });

// 23: rule one (matches the first shot)
SHOTS.push({ start: 44.08, end: 46.0, tr: 'cut', draw(ctx, lt, t) { hookPic(ctx, lt, t); } });
