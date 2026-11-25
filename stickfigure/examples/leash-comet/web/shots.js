const SHOTS = [];
// ---------- characters ----------
const PIP = { cols: ['#ff7a2f', '#ff7a2f'], hat: 'bandana', hatCol: '#1fb5e0', dotCol: '#fff' };
const MUM = { cols: PAL.navy, hat: 'bandana', hatCol: '#e0509a', dotCol: '#fff' };
const GRANDPA = { cols: PAL.green, hat: 'sailor', belt: false };
const PRINC = { cols: PAL.purple, hat: 'captain' };
const GIRL = { cols: PAL.red, hat: 'none', blush: true };
const GOALIE = { cols: ['#3a3a46', '#3a3a46'], hat: 'none' };
const KIDS = [{ cols: PAL.blue, hat: 'none' }, { cols: PAL.yellow, hat: 'none' }, { cols: PAL.green, hat: 'none' }, { cols: PAL.purple, hat: 'bandana', hatCol: '#3fa35b', dotCol: '#fff' }, { cols: PAL.red, hat: 'bandana', hatCol: '#2f63c9', dotCol: '#fff' }, { cols: PAL.navy, hat: 'none' }, { cols: PAL.yellow, hat: 'bandana', hatCol: '#e0392f', dotCol: '#fff' }];
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const FY = x => groundY(x) + 45;           // feet y on the comet surface
const flailA = (t, ph = 0) => ({ L: [2.4 + Math.sin(t * 9 + ph) * .5, .4], R: [2.4 + Math.sin(t * 9 + 2 + ph) * .5, .4] });
const dangle = (t, ph = 0) => ({ L: [.5 + Math.sin(t * 7 + ph) * .4, -.6], R: [.5 + Math.sin(t * 7 + 2 + ph) * .4, -.6] });
const camOf = (t, x, y, z, r = 0, a = 3) => { const hh = handheld(t, a); return { x: x + hh[0], y: y + hh[1], z, r }; };
const scene = (ctx, t, cam, o = {}) => { spaceBG(ctx, t, cam, o); applyCam(ctx, cam, 1); groundArc(ctx, t, o); };
const FACE_Q = { eyes: 'wide', mouth: 'o', browAng: -.3, browUp: 1 };

// ---- the hook picture (first and last shot) ----
function hookPic(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1 + lt * .03, Math.sin(t * 1.3) * .008, 4);
  scene(ctx, t, cam, { px: 720, py: 520, pr: 230 });
  applyCam(ctx, cam, 1);
  jet(ctx, 120, groundY(120), t, 300);
  const mum = { x: 300, y: FY(300), s: 430, lean: -.22, armLen: 1.3, shadow: true, arms: { L: { ik: [.22, -.6] }, R: { ik: [.22, -.6] } }, legs: { L: [.35, -.2], R: [-.1, -.1] }, face: { eyes: 'wide', mouth: 'teeth', browAng: .35 } };
  const hand = loc(mum, .22, -.6);
  const pip = { x: 590 + Math.sin(t * 2.2) * 14, y: 1070 + Math.sin(t * 3) * 14, s: 520, lean: .08, shadow: false, arms: flailA(t), legs: dangle(t), face: Object.assign({ look: [-1, .6] }, FACE_Q) };
  const b = loc(pip, 0, -.31);
  kid(ctx, MUM, mum);
  kid(ctx, PIP, C(pip, { leash: [hand[0], hand[1], 8] }));
  circle(ctx, hand[0], hand[1], 22); fillStroke(ctx, INK, 0); ctx.fillStyle = INK; ctx.fill();
  const sw = loc(pip, .2, -.9); sweat(ctx, sw[0] + 40, sw[1], 38, 1);
}
SHOTS.push({ start: 0, end: 0.88, tr: 'whip', draw(ctx, lt, t) { hookPic(ctx, lt, t); } });
// 1a: every kid wears one (parents walking kids)
SHOTS.push({ start: 0.88, end: 2.88, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 460 + lt * 90, 960, 1.0, 0, 3);
  scene(ctx, t, cam, { px: 900, py: 470, pr: 210 });
  applyCam(ctx, cam, 1);
  jet(ctx, 1300, groundY(1300), t, 260);
  const pairs = [[-100, 0], [260, 1], [620, 2], [980, 3], [1340, 4]];
  pairs.forEach(([x0, i], k) => {
    const px = x0 + lt * 40, hop = Math.abs(Math.sin(t * 3 + k)) * 26;
    const par = { x: px, y: FY(px), s: 480, shadow: true, legs: walkLegs(t * .8 + k, 7, .35), arms: { L: [.3, -.1], R: { ik: [.3, -.52] } }, face: { mouth: 'smile', eyes: k % 2 ? 'happy' : 'normal' } };
    const h = loc(par, .3, -.52);
    const kx = px + 270, ko = { x: kx, y: FY(kx) - hop, s: 330, shadow: true, legs: walkLegs(t * .8 + k * 2, 8, .4), arms: walkArms(t * .8 + k, 8, .4), face: { mouth: 'grin', eyes: 'happy' } };
    kid(ctx, PRINC, C(par, { hat: ['none', 'sailor', 'none', 'bandana', 'none'][k], cols: KIDS[k].cols, leash: null }));
    kid(ctx, KIDS[(k + 2) % KIDS.length], C(ko, { leash: [h[0], h[1], 40] }));
  });
} });
// 1b: even at recess: maypole
SHOTS.push({ start: 2.88, end: 3.92, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.04 + lt * .06, 0, 3);
  scene(ctx, t, cam, { px: 250, py: 420, pr: 200, planet: { base: '#6fc3e8', hi: '#b9ecff', band: '#3f9cc8', ring: '#fff2c4' } });
  applyCam(ctx, cam, 1);
  const cx = 540, top = 760;
  rrect(ctx, cx - 14, top, 28, FY(cx) - top, 8); fillStroke(ctx, '#fff', 7);
  circle(ctx, cx, top, 26); fillStroke(ctx, '#ff5a5a', 6);
  const n = 5, items = [];
  for (let i = 0; i < n; i++) { const a = t * 1.7 + i / n * TAU; items.push({ i, a, d: Math.sin(a) }); }
  items.sort((p, q) => p.d - q.d);
  for (const it of items) {
    const x = cx + Math.cos(it.a) * 330, s = 330 + it.d * 60, hop = Math.abs(Math.sin(t * 4 + it.i)) * 40;
    const o = { x, y: FY(x) - hop + it.d * 30, s, shadow: true, flip: Math.cos(it.a) > 0 ? -1 : 1, legs: walkLegs(t, 11, .5), arms: { L: [2.4, .4], R: [2.6 + Math.sin(t * 8) * .3, .3] }, face: { eyes: 'happy', mouth: 'grin' } };
    if (it.d < 0) kid(ctx, KIDS[it.i], C(o, { leash: [cx, top, 70] })); 
    else kid(ctx, KIDS[it.i], C(o, { leash: [cx, top, 70] }));
  }
} });
// 2a: grandpa walks his grandkids
SHOTS.push({ start: 3.92, end: 5.44, tr: 'whip', draw(ctx, lt, t) {
  const gx = 330 + lt * 60, cam = camOf(t, gx + 220, 960, 1.05, 0, 3);
  scene(ctx, t, cam, { px: 840, py: 480, pr: 220 });
  applyCam(ctx, cam, 1);
  const g = { x: gx, y: FY(gx), s: 560, shadow: true, legs: walkLegs(t, 6, .3), arms: { L: [.3, -.1], R: { ik: [.32, -.5] } }, face: { eyes: 'happy', mouth: 'smile' } };
  const h = loc(g, .32, -.5);
  [0, 1, 2].forEach(k => { const kx = gx + 380 + k * 200, ko = { x: kx, y: FY(kx) - Math.abs(Math.sin(t * 3 + k * 1.7)) * 40, s: 330, shadow: true, legs: walkLegs(t * 1.2 + k, 9, .5), arms: walkArms(t + k, 8, .5), lean: .12, face: { eyes: k == 1 ? 'wide' : 'happy', mouth: 'grin' } }; kid(ctx, KIDS[k + 1], C(ko, { leash: [h[0], h[1], 50] })); });
  kid(ctx, GRANDPA, g);
} });
// 2b: the principal walks the whole class
SHOTS.push({ start: 5.44, end: 7.04, tr: 'whip', draw(ctx, lt, t) {
  const px = 190 + lt * 70, cam = camOf(t, px + 360, 960, 1.0 + lt * .03, 0, 3);
  scene(ctx, t, cam, { px: 950, py: 430, pr: 190, planet: { base: '#8fd37a', hi: '#d1f5a5', band: '#5fae52', ring: '#fff' } });
  applyCam(ctx, cam, 1);
  const p = { x: px, y: FY(px), s: 560, shadow: true, legs: walkLegs(t, 6, .3), arms: { L: [.3, -.1], R: { ik: [.34, -.55] } }, face: { eyes: 'normal', mouth: 'flat', browAng: .25 } };
  const h = loc(p, .34, -.55);
  for (let k = 0; k < 7; k++) { const kx = px + 330 + k * 150, ko = { x: kx, y: FY(kx) - Math.abs(Math.sin(t * 3 + k)) * 24 + (k % 2) * 14, s: 250, shadow: true, legs: walkLegs(t * 1.2 + k, 9, .5), arms: walkArms(t + k, 8, .4), face: { eyes: 'normal', mouth: k % 3 ? 'smile' : 'grin' } }; kid(ctx, KIDS[k % 7], C(ko, { leash: [h[0], h[1], 25 + k * 4] })); }
  kid(ctx, PRINC, p);
} });
// 3: I'm Pip, I asked why
SHOTS.push({ start: 7.04, end: 8.8, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + 40 - lt * 30, 960, 1.02 + lt * .08, 0, 3);
  scene(ctx, t, cam, { px: 820, py: 450, pr: 210 });
  applyCam(ctx, cam, 1);
  jet(ctx, 900, groundY(900), t, 240);
  const girl = { x: 890, y: FY(890) + 20, s: 440, shadow: true, flip: -1, face: { eyes: 'normal', mouth: 'flat', look: [-1, 0] }, arms: { L: [.3, -.1], R: [.3, -.1] } };
  kid(ctx, GIRL, girl);
  const tug = kf(lt, [[.9, 0], [1.2, 1]]);
  const pip = { x: 440, y: FY(440) + 30, s: 640, shadow: true, headTilt: Math.sin(t * 2) * .03 + (lt > 1.1 ? .1 : 0), face: { eyes: 'normal', look: [1, 0], mouth: lt > 1.1 ? 'o' : 'smile', browUp: lt > 1.1 ? 1 : 0 }, arms: { L: { ik: [-.3 + tug * .0, -.31], bend: -1 }, R: lt > .3 && lt < .9 ? [2.6 + Math.sin(t * 12) * .35, .3] : [.3, -.1] }, legs: { L: [.12, -.04], R: [.12, -.04] } };
  const b = loc(pip, 0, -.31);
  kid(ctx, PIP, C(pip, { leash: [1300, FY(900) - 160, 90] }));
  const a = popAt(lt, .25); if (a > 0) { ctx.save(); ctx.translate(440, 560); ctx.scale(a, a); pill(ctx, 'pip', 0, 0, '#ffd23a', 60); ctx.restore(); }
  const q = popAt(lt, 1.15, .3); if (q > 0) { ctx.save(); ctx.translate(690, 560); ctx.scale(q, q); ctx.rotate(.15); text(ctx, '?', 0, 0, 220, '#ffd23a', INK, 18); ctx.restore(); }
} });
// 4: a girl whispered
SHOTS.push({ start: 8.8, end: 10.72, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 20, 960, 1.05 + lt * .12, 0, 3);
  scene(ctx, t, cam, { px: 300, py: 480, pr: 190, planet: { base: '#c58be8', hi: '#efd0ff', band: '#9558c0', ring: '#ffe3a1' } });
  applyCam(ctx, cam, 1);
  const pip = { x: 160, y: FY(160) + 30, s: 520, shadow: true, lean: .12, face: { eyes: 'wide', look: [1, 0], mouth: lt > .5 ? 'o' : 'flat', browUp: 1 }, arms: { L: [.3, -.1], R: [.3, -.1] } };
  kid(ctx, PIP, C(pip, { leash: [-200, 1500, 60] }));
  sweat(ctx, 300 + Math.sin(t * 3) * 3, 760 + clamp(lt - .4) * 60, 40, clamp((lt - .4) * 3));
  const girl = { x: 650, y: FY(650) + 90, s: 720, shadow: true, flip: -1, face: { eyes: lt > 1.3 ? 'half' : 'normal', look: [-1, 0], mouth: lt > 1.3 ? 'flat' : 'o', browAng: lt > 1.3 ? .3 : 0 }, arms: { L: [.3, -.1], R: { ik: [-.18, -.74] } } };
  kid(ctx, GIRL, girl);
  const no = popAt(lt, 1.4, .25); if (no > 0) {
    ctx.save(); ctx.translate(780, 520); ctx.scale(no, no); circle(ctx, 0, 0, 120); fillStroke(ctx, '#ffe14d', 8);
    line(ctx, -40, -30, -40, -10, 12); line(ctx, 40, -30, 40, -10, 12); ctx.beginPath(); ctx.arc(0, 8, 56, .25, Math.PI - .25); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke();
    circle(ctx, 0, 0, 150); ctx.lineWidth = 22; ctx.strokeStyle = '#e8262b'; ctx.stroke(); line(ctx, -106, -106, 106, 106, 22, '#e8262b'); ctx.restore();
  }
} });
// 5: bored, kicks a ball
SHOTS.push({ start: 10.72, end: 12.4, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 500 + lt * 60, 960, 1.0, 0, 3);
  scene(ctx, t, cam, { px: 860, py: 470, pr: 210 });
  applyCam(ctx, cam, 1);
  drawGoal(ctx, 900, FY(900) - 10, 360, 330);
  const gl = { x: 900, y: FY(900) - 5, s: 380, shadow: true, face: { eyes: 'normal', look: [-1, 0], mouth: 'flat' }, arms: { L: [1.0, -.4], R: [1.0, -.4] } };
  kid(ctx, GOALIE, C(gl, { leash: [740, FY(900) - 330, 30] }));
  const kick = kf(lt, [[0, 0], [.55, 0], [.8, 1], [1.0, 0]], x => x);
  const bx = lt < .85 ? 520 : 520 + (lt - .85) * 700, by = FY(bx) - 20 - (lt < .85 ? 0 : Math.sin(clamp((lt - .85) / .8) * Math.PI) * 280);
  const pip = { x: 360, y: FY(360) + 30, s: 480, shadow: true, face: { eyes: lt < .6 ? 'half' : 'wide', mouth: lt < .6 ? 'flat' : 'o', look: [1, .3] }, arms: { L: [.3, -.1], R: [.3, -.1] }, legs: { L: [.1 + kick * 1.2, -.04], R: [.1, -.04] }, lean: -kick * .05 };
  kid(ctx, PIP, C(pip, { leash: [200, 1700, 90] }));
  drawBall(ctx, bx, by, 34, bx * .05);
  if (lt > .85 && lt < 1.2) puff(ctx, 520, FY(520) - 10, 60, t, '#efe9ff', 3, 1 - (lt - .85) * 3);
} });
// 6a: terrible at soccer
SHOTS.push({ start: 12.4, end: 13.6, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 - lt * 40, 1.0 + lt * .04, 0, 3);
  scene(ctx, t, cam, { px: 840, py: 470, pr: 210 });
  applyCam(ctx, cam, 1);
  const spin = kf(lt, [[0, 0], [.7, -2.9]]), air = Math.sin(clamp(lt / .75) * Math.PI);
  const pip = { x: 480, y: FY(480) - air * 330 + 30, s: 500, shadow: false, lean: spin, face: { eyes: lt < .65 ? 'wide' : 'spiral', mouth: lt < .65 ? 'o' : 'frown' }, arms: flailA(t), legs: { L: [1.2, -.6], R: [.6, -.5] }, t };
  kid(ctx, PIP, C(pip, { leash: [160, FY(160), 120] }));
  if (lt > .72) { const a = clamp((lt - .72) * 4); puff(ctx, 480, FY(480) - 30, 120, t, '#efe9ff', 3, a * (1 - (lt - .72) * 1.4)); burst(ctx, 640, 1100, 90 * a, 9, '#ffd23a', 5); text(ctx, 'oof', 640, 1100, 52 * a, INK, INK, 0); }
  const bx = 420 + lt * 330, by = 700 - lt * 130 + lt * lt * 90; drawBall(ctx, bx, by, 30, t * 2);
  if (lt < .5) text(ctx, 'whiff', 760, 700, 62, '#fff', INK, 10);
} });
// 6b: but it went in
SHOTS.push({ start: 13.6, end: 14.48, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 700, 960, 1.18 - lt * .05, 0, 4);
  scene(ctx, t, cam, { px: 220, py: 470, pr: 200 });
  applyCam(ctx, cam, 1);
  drawGoal(ctx, 700, FY(700) - 10, 440, 380);
  const gl = { x: 700 + Math.min(lt * 140, 60), y: FY(700) - 5, s: 400, shadow: true, face: { eyes: 'wide', mouth: 'o', browUp: 1 }, arms: { L: [2.5, .3], R: [2.5, .3] }, legs: { L: [.5, -.2], R: [.1, -.1] } };
  kid(ctx, GOALIE, C(gl, { leash: [840, FY(700) - 330, 30] }));
  const bx = 330 + lt * 520, by = 760 + lt * 300; drawBall(ctx, Math.min(bx, 700), by - Math.max(0, lt - .35) * 30, 36, t * 6);
  const a = popAt(lt, .3, .2); if (a > 0) { ctx.save(); ctx.translate(540, 520); ctx.rotate(-.1); ctx.scale(a, a); burst(ctx, 0, 0, 230, 12, '#ffd23a', 6); text(ctx, 'goal', 0, 0, 100, '#fff', INK, 16); ctx.restore(); }
} });
// 7: jumped for joy
SHOTS.push({ start: 14.48, end: 15.68, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 1020 - lt * 60, 1.05 + lt * .1, 0, 4);
  scene(ctx, t, cam, { px: 780, py: 600, pr: 260 });
  applyCam(ctx, cam, 1);
  const up = Math.max(0, Math.sin(clamp((lt - .12) / .95) * Math.PI)) * 160, sq = lt < .12 ? .86 : 1;
  const pip = { x: 540, y: FY(540) + 80 - up, s: 650, shadow: true, shadowScale: 1 - up / 400, squash: sq, face: { eyes: 'happy', mouth: 'grin', browUp: 1 }, arms: lt > .12 ? { L: [2.7, .2], R: [2.7, .2] } : { L: [.5, -.4], R: [.5, -.4] }, legs: lt > .12 ? { L: [.3, -.5], R: [.3, -.5] } : { L: [.3, -.8], R: [.3, -.8] } };
  kid(ctx, PIP, C(pip, { leash: [300, FY(300) + 10, 30] }));
  for (let i = 0; i < 6; i++) { const a = clamp((lt - .15) * 2.2); star5(ctx, 540 + Math.cos(i * 1.05) * 360 * a, 450 + Math.sin(i * 1.05) * 200 * a, 24 * (1 - a * .4), t * 2 + i); }
} });
// 8: the ground said goodbye
SHOTS.push({ start: 15.68, end: 17.04, tr: 'whip', draw(ctx, lt, t) {
  const rise = kf(lt, [[0, 0], [1.36, 330]], ease);
  const cam = camOf(t, 540, 960 - rise * .5, 1.05, 0, 4);
  scene(ctx, t, cam, { px: 780, py: 600, pr: 260 });
  applyCam(ctx, cam, 1);
  drawGoal(ctx, 160, FY(160) - 10, 360, 330);
  const pip = { x: 560, y: FY(560) + 40 - rise, s: 560, shadow: false, face: { eyes: 'wide', mouth: 'o', look: [0, -.8], browUp: 1 }, arms: { L: [1.6 + lt * .8, .3], R: [1.6 + lt * .8, .3] }, legs: dangle(t, 0) };
  const endX = 560 - rise * .15 - 120, endY = FY(endX) + 10;
  const b = loc(pip, 0, -.31); const tight = clamp(rise / 330);
  const gx = 560, gyy = FY(560) + 40;
  ctx.save(); ellipse(ctx, gx, gyy, 150 * (1 - tight * .5), 24 * (1 - tight * .5)); ctx.fillStyle = 'rgba(40,20,60,.28)'; ctx.fill(); ctx.restore();
  kid(ctx, PIP, C(pip, { leash: [endX, endY, 110 * (1 - tight)] }));
  puff(ctx, 470, FY(470) - 20, 100, t, '#efe9ff', 3, clamp(1 - lt * .9)); puff(ctx, 660, FY(660) - 20, 90, t, '#efe9ff', 4, clamp(1 - lt * .9));
  const bye = clamp((lt - .5) * 3); if (bye > 0) { ctx.save(); ctx.globalAlpha = bye; text(ctx, 'bye!', 820, FY(820) - 120, 70, '#fff', INK, 12); ctx.restore(); }
} });
// 9a: up past the goalposts
const ascend = (lt, a, b, dur) => kf(lt, [[0, a], [dur, b]], x => x);
SHOTS.push({ start: 17.04, end: 18.24, tr: 'cut', draw(ctx, lt, t) {
  const py = ascend(lt, 1330, 900, 1.2), cam = { x: 540, y: py - 161, z: 1, r: 0 };
  scene(ctx, t, cam, { px: 780, py: 600, pr: 260 });
  applyCam(ctx, cam, 1);
  drawGoal(ctx, 540, FY(540) - 10, 520, 430);
  const pip = { x: 540 + Math.sin(t * 2) * 30, y: py, s: 420, shadow: false, face: { eyes: 'wide', mouth: 'o', look: [0, -.5] }, arms: flailA(t), legs: dangle(t) };
  kid(ctx, PIP, C(pip, { leash: [500 + Math.sin(t * 3) * 40, py + 330, 70] }));
  text(ctx, 'whoa', 800, py - 150, 70, '#fff', INK, 12);
} });
// 9b: up past the school
SHOTS.push({ start: 18.24, end: 19.2, tr: 'cut', draw(ctx, lt, t) {
  const py = ascend(lt, 900, 330, .96), cam = { x: 540, y: py - 161, z: 1, r: 0 };
  scene(ctx, t, cam, { px: 780, py: 300, pr: 260 });
  applyCam(ctx, cam, 1);
  drawSchool(ctx, 300, FY(300) - 10, 1.05, t);
  const pip = { x: 700 + Math.sin(t * 2) * 30, y: py, s: 420, shadow: false, face: { eyes: 'wide', mouth: 'o', look: [-1, .3] }, arms: flailA(t, 1), legs: dangle(t, 1) };
  kid(ctx, PIP, C(pip, { leash: [650 + Math.sin(t * 3) * 40, py + 330, 70] }));
} });
// 9c: up past grandpa, who waved
SHOTS.push({ start: 19.2, end: 20.96, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0, 0, 3);
  scene(ctx, t, cam, { px: 820, py: 360, pr: 220 });
  applyCam(ctx, cam, 1);
  const gp = { x: 380, y: FY(380) + 50, s: 560, shadow: true, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [.3, -.1], R: [2.7 + Math.sin(t * 10) * .35, .3] } };
  [0, 1, 2].forEach(k => { const kx = 640 + k * 150; kid(ctx, KIDS[k + 2], { x: kx, y: FY(kx) + 20, s: 300, shadow: true, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [.3, -.1], R: [2.7 + Math.sin(t * 10 + k) * .4, .3] } }); });
  kid(ctx, GRANDPA, gp);
  const py = ascend(lt, 780, -260, 1.7), px = 800 + Math.sin(lt * 3) * 25;
  kid(ctx, PIP, { x: px, y: py, s: 190, shadow: false, face: { eyes: 'wide', mouth: 'o' }, arms: flailA(t, 2), legs: dangle(t, 2), leash: [px - 40 + Math.sin(t * 3) * 25, py + 200, 40] });
} });
// 10: even the goalie looked up, and up
SHOTS.push({ start: 20.96, end: 22.64, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 - lt * 70, 1.05 + lt * .06, 0, 3);
  scene(ctx, t, cam, { px: 300, py: 380, pr: 210 });
  applyCam(ctx, cam, 1);
  drawGoal(ctx, 540, FY(540) - 10, 520, 430);
  const second = lt > .75; const tilt = second ? -.35 : -.18;
  const gl = { x: 440, y: FY(440) + 30, s: 470, shadow: true, headTilt: tilt, face: { eyes: 'wide', look: [0, -1], mouth: second ? 'o' : 'flat', browUp: 1 }, arms: { L: [.5, -.3], R: [.5, -.3] }, lean: second ? .05 : 0 };
  kid(ctx, GOALIE, C(gl, { leash: [640, FY(540) - 360, 30] }));
  const py = 140 - lt * 60; kid(ctx, PIP, { x: 740 + lt * 40, y: py, s: 110, shadow: false, arms: flailA(t), legs: dangle(t), leash: [700, py + 120, 20] });
} });
// 11a: the whole class pointed
SHOTS.push({ start: 22.64, end: 24.24, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 - lt * 40, 1.0 + lt * .05, 0, 3);
  scene(ctx, t, cam, { px: 840, py: 360, pr: 210 });
  applyCam(ctx, cam, 1);
  for (let k = 0; k < 6; k++) { const x = 120 + k * 170, back = k % 2; kid(ctx, KIDS[k], { x, y: FY(x) - back * 30 + 20, s: 350 - back * 40, shadow: true, face: { eyes: 'wide', mouth: 'o', look: [0, -1] }, arms: { L: [.3, -.1], R: [2.95 + Math.sin(t * 8 + k) * .05, 0] }, leash: [x + 150, FY(x) + 5, 40] }); }
  kid(ctx, PRINC, { x: 880, y: FY(880) + 60, s: 500, shadow: true, face: { eyes: 'wide', mouth: 'o', browAng: -.3 }, arms: { L: [.3, -.1], R: [2.95, 0] } });
} });
// 11b: somebody took a photo
SHOTS.push({ start: 24.24, end: 25.12, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.1 + lt * .06, 0, 4);
  scene(ctx, t, cam, { px: 300, py: 380, pr: 220 });
  applyCam(ctx, cam, 1);
  const o = { x: 520, y: FY(520) + 80, s: 640, shadow: true, face: { eyes: 'squint', mouth: 'grin' }, arms: { L: { ik: [-.12, -.74], bend: -1 }, R: { ik: [.12, -.74], bend: 1 } },
    prop: (c, k, h, a, side) => { if (k === 'L') { c.save(); c.translate(h[0], h[1]); rrect(c, -.09, -.1, .18, .12, .02); fillStroke(c, '#1e1a20', .012); circle(c, 0, -.04, .035); fillStroke(c, '#8fd8ff', .01); c.restore(); } } };
  kid(ctx, KIDS[2], o);
  const f = clamp(1 - Math.abs(lt - .38) * 7); if (f > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = f * .85; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  text(ctx, 'click', 800, 520, 70, '#fff', INK, 12);
} });
// 12a: mum grabbed the leash
SHOTS.push({ start: 25.12, end: 26.6, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0, 0, 4);
  scene(ctx, t, cam, { px: 820, py: 330, pr: 220 });
  applyCam(ctx, cam, 1);
  const lx = 700, ly = FY(700) + 30;
  const run = clamp(lt / .9), mx = lerp(-150, 640, easeOut(run));
  const grabbed = lt > .9;
  const mum = { x: mx, y: FY(mx) + 40, s: 520, shadow: true, lean: grabbed ? -.28 : .2, legs: grabbed ? { L: [.5, -.2], R: [-.2, -.1] } : walkLegs(t, 20, .8), arms: grabbed ? { L: { ik: [.2, -.5] }, R: { ik: [.2, -.5] } } : { L: [2.8, .2], R: { ik: [.4, -.45] } }, armLen: 1.2, face: { eyes: 'wide', mouth: 'teeth', browAng: .4 } };
  const hand = loc(mum, .2, -.5);
  const endX = grabbed ? hand[0] : lx, endY = grabbed ? hand[1] : ly;
  const tight = grabbed ? clamp((lt - .9) / .4) : 0;
  leash(ctx, endX, endY, 900, -300, 60 * (1 - tight), '#ffd23a', 9);
  kid(ctx, MUM, mum);
  if (!grabbed) { circle(ctx, lx, ly, 20); fillStroke(ctx, '#ffd23a', 5); }
  const pa = clamp((lt - .9) * 4); if (pa > 0) burst(ctx, endX + 60, endY - 100, 70 * pa, 9, '#ffd23a', 7);
  kid(ctx, PIP, { x: 900, y: 40 - lt * 15 + 120, s: 150, shadow: false, arms: flailA(t), legs: dangle(t) });
} });
// 12b: reeled in like a kite
SHOTS.push({ start: 26.6, end: 28.0, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0, 0, 4);
  scene(ctx, t, cam, { px: 820, py: 330, pr: 220 });
  applyCam(ctx, cam, 1);
  const mum = { x: 300, y: FY(300) + 40, s: 520, shadow: true, lean: -.25, legs: { L: [.5, -.2], R: [-.2, -.1] }, arms: { L: { ik: [.22, -.5] }, R: { ik: [.22, -.5] } }, armLen: 1.2, face: { eyes: 'normal', mouth: 'grin', browAng: .3 } };
  const hand = loc(mum, .22, -.5);
  const k = ease(clamp(lt / 1.4)), px = lerp(820, 620, k), py = lerp(180, 900, k), ps = lerp(160, 480, k);
  leash(ctx, hand[0], hand[1], px, py - ps * .31 - 0, 50 * (1 - k), '#ffd23a', 9);
  kid(ctx, MUM, mum);
  circle(ctx, hand[0] + 24, hand[1] + 30, 40); fillStroke(ctx, '#e0392f', 6); line(ctx, hand[0] + 24, hand[1] + 30, hand[0] + 24 + Math.cos(t * 14) * 38, hand[1] + 30 + Math.sin(t * 14) * 38, 8);
  // ribbons like a kite tail
  for (let i = 0; i < 3; i++) leash(ctx, px, py, px + 80 + i * 60 + Math.sin(t * 5 + i) * 20, py - 40 - i * 60, -30, ['#ff5a5a', '#ffd23a', '#5acbff'][i], 7);
  kid(ctx, PIP, { x: px, y: py, s: ps, shadow: false, face: { eyes: 'wide', mouth: 'o' }, arms: flailA(t, 3), legs: dangle(t, 3) });
  text(ctx, 'wheee', 800, 560, 70, '#fff', INK, 12);
} });
// 13a: this comet is tiny
SHOTS.push({ start: 28.0, end: 30.64, tr: 'whip', draw(ctx, lt, t) {
  const z = kf(lt, [[0, 3.2], [2.3, .8]], ease);
  const cam = { x: 540, y: 960 - (z - 1) * 90 + shake(t, 3)[1], z, r: 0 };
  spaceBG(ctx, t, cam, { px: 830, py: 330, pr: 200, sx: 150, sy: 260 });
  applyCam(ctx, cam, 1);
  tinyComet(ctx, 540, 1000, 215, t);
  jet(ctx, 330, 800, t, 200, .8);
  const top = [540, 1000 - 215 * .95 + 15];
  kid(ctx, PIP, { x: 520, y: top[1] + 8, s: 120, shadow: false, face: { eyes: 'wide', mouth: 'o' }, arms: { L: [.5, -.3], R: [2.8, .2] } });
  const pb = lt * 70; drawBall(ctx, 640, top[1] - 6 - pb, 16, t);
  const tag = popAt(lt, .4); if (tag > 0) { ctx.save(); ctx.translate(540, 1440); ctx.scale(tag, tag); pill(ctx, 'tiny comet', 0, 0, '#ffd23a', 56); ctx.restore(); }
} });
// 13b: escape speed is slower than a stroll
SHOTS.push({ start: 30.64, end: 33.68, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0, 0, 3);
  scene(ctx, t, cam, { px: 790, py: 400, pr: 230 });
  applyCam(ctx, cam, 1);
  const walk = lt * 120, lift = Math.max(0, lt - 1.5) * 140;
  const x = 220 + walk, y = FY(x) + 40 - lift;
  const o = { x, y, s: 500, shadow: lift < 1, shadowScale: 1 - clamp(lift / 400) * .5, legs: lift > 0 ? { L: [.3, -.5], R: [.3, -.5] } : walkLegs(t, 3.2, .35), arms: lift > 0 ? { L: [1.2, .3], R: [1.2, .3] } : walkArms(t, 3.2, .25), face: { eyes: lift > 0 ? 'wide' : 'half', mouth: lift > 0 ? 'o' : 'smile', look: [0, lift > 0 ? -.7 : 0] } };
  kid(ctx, GRANDPA, o);
  if (lt > .4) { const a = popAt(lt, .4); ctx.save(); ctx.translate(540, 560); ctx.scale(a, a); pill(ctx, 'a slow stroll', 0, 0, '#ffffff', 58); ctx.restore(); }
  if (lt > 1.9) { const a = popAt(lt, 1.9); ctx.save(); ctx.translate(540, 720); ctx.scale(a, a); pill(ctx, 'and up he goes', 0, 0, '#ffd23a', 50); ctx.restore(); }
} });
// 13c: one happy jump and you're gone
SHOTS.push({ start: 33.68, end: 35.52, tr: 'whip', draw(ctx, lt, t) {
  const up = lt < .3 ? 0 : (lt - .3) * (lt - .3) * 620 + (lt - .3) * 150;
  const cam = { x: 540, y: 960 - up * .35 + shake(t, 3)[1], z: 1.05, r: 0 };
  scene(ctx, t, cam, { px: 790, py: 400, pr: 230 });
  applyCam(ctx, cam, 1);
  const s = lerp(500, 140, clamp((lt - .3) / 1.4)); const y = FY(540) + 40 - up * .75;
  kid(ctx, PIP, { x: 540, y, s, squash: lt < .3 ? .86 : 1, shadow: lt < .5, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [2.7, .2], R: [2.7, .2] }, legs: { L: [.3, -.5], R: [.3, -.5] }, leash: [500 - up * .02 - 40, y + s * .9, 40] });
  if (lt > 1.5) { const a = clamp((lt - 1.5) * 4); sparkle(ctx, 540, y - s * .4, 70 * a, a); text(ctx, 'gone', 540, 560, 90 * a, '#fff', INK, 14); }
} });
// 14a: a leash
SHOTS.push({ start: 35.52, end: 36.64, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.05 + lt * .08, 0, 3);
  scene(ctx, t, cam, { px: 300, py: 420, pr: 200 });
  applyCam(ctx, cam, 1);
  const pip = { x: 540, y: FY(540) + 100, s: 680, shadow: true, face: { eyes: 'half', mouth: 'flat', browAng: .25 }, arms: { L: { ik: [-.12, -.32], bend: -1 }, R: [.3, -.1] } };
  kid(ctx, PIP, C(pip, { leash: [1300, 1700, 120] }));
  const a = popAt(lt, .15); if (a > 0) { ctx.save(); ctx.translate(540, 420); ctx.scale(a, a); pill(ctx, 'leash', 0, 0, '#ffd23a', 56); ctx.restore(); }
} });
// 14b: a helmet and a very serious face
SHOTS.push({ start: 36.64, end: 38.56, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.05 + lt * .12, 0, 3);
  scene(ctx, t, cam, { px: 820, py: 420, pr: 200 });
  applyCam(ctx, cam, 1);
  const serious = lt > 1.35;
  const pip = { x: 540, y: FY(540) + 120, s: 700, shadow: true, squash: lt > .1 && lt < .3 ? .92 : 1, face: serious ? { eyes: 'half', mouth: 'flat', browAng: .5 } : { eyes: 'wide', mouth: 'o', browUp: 1 }, arms: { L: [.3, -.1], R: [.3, -.1] } };
  kid(ctx, PIP, C(pip, { leash: [1300, 1700, 120] }));
  const h = loc(pip, 0, -.80);
  const drop = kf(lt, [[0, -300], [.12, 0, easeIn]], x => x); const a = popAt(lt, .0, .12);
  ctx.save(); ctx.translate(h[0], h[1] + drop); rrect(ctx, -130, -150, 260, 130, 60); fillStroke(ctx, '#ff5a5a', 10); rrect(ctx, -140, -40, 280, 38, 14); fillStroke(ctx, '#ffd23a', 8); circle(ctx, 0, -170, 24); fillStroke(ctx, '#ffd23a', 8); ctx.restore();
  if (lt > .1 && lt < .45) burst(ctx, h[0] + 150, h[1] - 120, 70 * (1 - (lt - .1) * 2), 9, '#ffd23a', 7);
  if (lt > .1) { const b = popAt(lt, .1, .1); ctx.save(); ctx.translate(h[0] - 230, h[1] - 150); ctx.scale(b, b); pill(ctx, 'bonk', 0, 0, '#fff', 44); ctx.restore(); }
} });
// 15a: last week a kid sneezed
SHOTS.push({ start: 38.56, end: 39.84, tr: 'cut', draw(ctx, lt, t) {
  const sn = lt > .72, fly = Math.max(0, lt - .78);
  const cam = { x: 540 + shake(t, sn ? 14 : 3)[0], y: 960 - fly * 300 + shake(t, sn ? 14 : 3)[1], z: 1.05 + lt * .05, r: 0 };
  scene(ctx, t, cam, { px: 300, py: 420, pr: 200 });
  applyCam(ctx, cam, 1);
  const wind = clamp(lt / .7);
  const o = { x: 540, y: FY(540) + 60 - fly * fly * 1400 - fly * 200, s: 620, shadow: !sn, squash: sn ? 1 : 1 - wind * .08, lean: sn ? -.12 : wind * .12, face: sn ? { eyes: 'squint', mouth: 'o' } : { eyes: wind > .4 ? 'squint' : 'half', mouth: wind > .4 ? 'smile' : 'flat', look: [0, -.5] }, arms: sn ? { L: [2.5, .3], R: [2.5, .3] } : { L: { ik: [-.1, -.76], bend: -1 }, R: [.3, -.1] }, legs: sn ? { L: [.5, -.6], R: [.5, -.6] } : { L: [.12, -.04], R: [.12, -.04] } };
  kid(ctx, KIDS[4], o);
  if (sn) { const a = popAt(lt, .72, .15); ctx.save(); ctx.translate(790, 760); ctx.scale(a, a); burst(ctx, 0, 0, 170, 11, '#ffd23a', 4); text(ctx, 'achoo', 0, 0, 62, INK, INK, 0); ctx.restore(); puff(ctx, 540, FY(540) - 10, 120, t, '#efe9ff', 3, clamp(1 - fly * 1.5)); }
} });
// 15b: we're still waiting
SHOTS.push({ start: 39.84, end: 40.72, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .06, 0, 3);
  scene(ctx, t, cam, { px: 780, py: 330, pr: 210 });
  applyCam(ctx, cam, 1);
  for (let k = 0; k < 4; k++) { const x = 120 + k * 190; kid(ctx, KIDS[k], { x, y: FY(x) + 10 + (k % 2) * 25, s: 370, shadow: true, face: { eyes: 'half', mouth: 'flat', look: [0, -1] }, arms: { L: [.3, -.1], R: { ik: [.1, -.74], bend: 1 } }, leash: [x + 110, FY(x) + 10, 30] }); }
  const tap = Math.abs(Math.sin(t * 8)) * .35;
  kid(ctx, PRINC, { x: 860, y: FY(860) + 70, s: 520, shadow: true, face: { eyes: 'half', mouth: 'flat', browAng: .3, look: [0, -1] }, arms: { L: { ik: [-.12, -.45], bend: -1 }, R: [.3, -.1] }, legs: { L: [.12 + tap, -.04], R: [.12, -.04] } });
  line(ctx, 560, 700, 640, 560, 9); leash(ctx, 640, 560, 700, 480, 0, '#ffd23a', 8);
  puff(ctx, 600, FY(600) - 10, 60, t, '#efe9ff', 3, .7);
} });
// 16a: goals are banned
SHOTS.push({ start: 40.72, end: 41.7, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .05, 0, 3);
  scene(ctx, t, cam, { px: 300, py: 380, pr: 210 });
  applyCam(ctx, cam, 1);
  for (let k = 0; k < 4; k++) { const x = 130 + k * 260; kid(ctx, KIDS[k], { x, y: FY(x) + 20, s: 360, shadow: true, face: { eyes: 'normal', mouth: 'frown', look: [0, -.4] }, arms: { L: [.3, -.1], R: [.3, -.1] }, leash: [x + 110, FY(x) + 10, 30] }); }
  const a = popAt(lt, .05, .25);
  ctx.save(); ctx.translate(540, 560); ctx.scale(a, a); circle(ctx, 0, 0, 230); fillStroke(ctx, '#fff', 12);
  ctx.save(); ctx.scale(.55, .55); drawGoal(ctx, 0, 140, 300, 280); ctx.restore();
  circle(ctx, 0, 0, 200); ctx.lineWidth = 34; ctx.strokeStyle = '#e8262b'; ctx.stroke(); line(ctx, -140, -140, 140, 140, 34, '#e8262b'); ctx.restore();
} });
// 16b: please, hold the leash (matches the first shot)
SHOTS.push({ start: 41.7, end: 44.5, tr: 'cut', draw(ctx, lt, t) { hookPic(ctx, lt, t); } });
