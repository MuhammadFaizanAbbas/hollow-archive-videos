const SHOTS = [];
// ---------- characters ----------
const GUS = { cols: ['#f4f4f0', '#f4f4f0'], hat: 'none', belt: false };
const CAP = { cols: PAL.navy, hat: 'captain' };
const ENG = { cols: PAL.yellow, hat: 'bandana', hatCol: '#ff7a2f', dotCol: '#fff' };
const DOC = { cols: ['#2fb5a8', '#2fb5a8'], hat: 'none' };
const CREW = [
  { cols: PAL.red, hat: 'bandana', hatCol: '#2f63c9', dotCol: '#fff' }, { cols: PAL.green, hat: 'sailor', belt: false },
  { cols: PAL.purple, hat: 'none' }, { cols: PAL.blue, hat: 'bandana', hatCol: '#f2b52a', dotCol: '#fff' },
  { cols: PAL.red, hat: 'none' }, { cols: PAL.yellow, hat: 'none' }];
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const camOf = (t, x, y, z, r = 0, a = 3) => { const hh = handheld(t, a); return { x: x + hh[0], y: y + hh[1], z, r }; };
const fl = (t, ph = 0) => ({ arms: { L: [1.0 + Math.sin(t * 1.3 + ph) * .35, -.3], R: [1.0 + Math.sin(t * 1.1 + ph + 2) * .35, -.3] }, legs: { L: [.25 + Math.sin(t * 1.2 + ph) * .2, -.35], R: [.3 + Math.sin(t * 1.4 + ph + 1) * .2, -.4] } });
const bob = (t, ph = 0, a = 16) => Math.sin(t * 1.5 + ph) * a;
function fig(ctx, base, o) {
  const f = C(base, o); drawStick(ctx, f);
  if (o.chef) chefHat(ctx, f); if (o.party) partyHat(ctx, f, o.party, o.partyUp || -1.0);
}
const SHY = (o) => loc(o, 0, -.765);
const hallC = (ctx, t, cam, o) => { hall(ctx, t, cam, o); applyCam(ctx, cam, 1); };

// ---- the hook picture (first and last shot) ----
function hookPic(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1 + lt * .03, Math.sin(t * 1.3) * .008, 4);
  hallC(ctx, t, cam, { stain: 1, ports: [-560, 1640] });
  const cx = 540, cy = 860 + Math.sin(t * 2) * 8;
  can(ctx, cx, cy, 540, Math.sin(t * 1.5) * .07);
  noSign(ctx, cx, cy, 335);
  const gus = { x: 190, y: 1390 + bob(t, 1), s: 450, chef: true, face: { eyes: 'normal', mouth: 'grin', look: [.8, -.3] }, arms: { L: [1.0, -.3], R: { ik: [.45, -.72] } }, legs: fl(t).legs };
  fig(ctx, GUS, gus);
  const cap = { x: 890, y: 1390 + bob(t, 3), s: 430, flip: -1, face: { eyes: 'half', mouth: 'flat', browAng: .35, look: [-.8, -.2] }, arms: { L: [.9, -.3], R: { ik: [.4, -.75] } }, legs: fl(t, 2).legs };
  fig(ctx, CAP, cap);
}
SHOTS.push({ start: 0, end: 1.36, tr: 'whip', draw(ctx, lt, t) { hookPic(ctx, lt, t); } });
// 1: the station from outside
SHOTS.push({ start: 1.36, end: 2.72, tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 540 + shake(t, 3)[0], y: 960, z: 1 + lt * .08, r: 0 };
  spaceBG(ctx, t, cam, { px: 800, py: 470, pr: 260, sx: 130, sy: 300 });
  applyCam(ctx, cam, 1); stationExt(ctx, 480 + lt * 30, 980, 520, t);
} });
// 2: fizzy drinks are illegal (poster)
SHOTS.push({ start: 2.72, end: 4.48, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 40, 960, 1.02 + lt * .04, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [-300, 1480] });
  rrect(ctx, 250, 520, 580, 700, 30); fillStroke(ctx, '#fff', 10);
  const a = popAt(lt, .0, .2); ctx.save(); ctx.translate(540, 800); ctx.scale(.7 + .3 * a, .7 + .3 * a); can(ctx, 0, 0, 440, -.08); noSign(ctx, 0, 0, 250, 1); ctx.restore();
  const b = popAt(lt, 1.0, .2); if (b > 0) { ctx.save(); ctx.translate(540, 1120); ctx.scale(b, b); pill(ctx, 'banned', 0, 0, '#ffd23a', 62); ctx.restore(); }
  const px = lerp(-250, 1330, clamp(lt / 1.7));
  fig(ctx, CREW[1], { x: px, y: 1420 + bob(t, 0), s: 420, face: { eyes: 'half', mouth: 'flat' }, arms: { L: [.3, -.1], R: { ik: [.3, -.5] } }, legs: fl(t).legs });
  circle(ctx, px + 126, 1420 - 210 + bob(t, 0), 36); fillStroke(ctx, 'rgba(160,220,255,.9)', 6);
} });
// 3: even the cake is flat
SHOTS.push({ start: 4.48, end: 6.56, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .06, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  flatCake(ctx, 540 + Math.sin(t) * 10, 760 + Math.sin(t * 1.7) * 14, 640);
  const cap = { x: 190, y: 1520 + bob(t, 1), s: 560, face: { eyes: 'half', mouth: 'frown', browAng: .3, look: [.8, .3] }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t).legs };
  fig(ctx, CAP, cap);
  const k = CREW[3]; fig(ctx, k, { x: 890, y: 1520 + bob(t, 2), s: 520, flip: -1, party: '#ff5a9a', face: { eyes: 'wide', mouth: 'frown', look: [-.8, .3] }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t, 1).legs });
  const a = popAt(lt, 1.5, .2); if (a > 0) { ctx.save(); ctx.translate(540, 480); ctx.scale(a, a); pill(ctx, 'flat', 0, 0, '#ffd23a', 70); ctx.restore(); }
} });
// 4: the new cook asks why, nobody tells
SHOTS.push({ start: 6.56, end: 8.56, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .05, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  [[140, 0], [940, 3]].forEach(([x, i]) => fig(ctx, CREW[i], { x, y: 1180 + bob(t, i), s: 400, flip: x > 500 ? -1 : 1, face: { eyes: 'half', mouth: 'flat', look: [0, 0] }, arms: { L: [.4, -.2], R: { ik: [.1, -.7] } }, legs: fl(t, i).legs }));
  const lk = Math.sin(t * 3.2) * .9;
  fig(ctx, GUS, { x: 540, y: 1560 + bob(t, 2), s: 790, chef: true, face: { eyes: 'wide', mouth: 'o', look: [lk, 0], browAng: -.3, browUp: 1 }, arms: { L: [.5, -.3], R: [.5, -.3] }, legs: fl(t).legs });
  const a = popAt(lt, .4, .2); if (a > 0) { ctx.save(); ctx.translate(840, 560); ctx.scale(a, a); text(ctx, '?', 0, 0, 220, '#ffd23a', INK, 20); ctx.restore(); }
  const b = popAt(lt, 1.1, .2); if (b > 0) { ctx.save(); ctx.translate(250, 520); ctx.scale(b, b); text(ctx, '?', 0, 0, 160, '#fff', INK, 16); ctx.restore(); }
} });
// 5: they point up
SHOTS.push({ start: 8.56, end: 9.6, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960 - lt * 200, 1.03 + lt * .05, 0, 3);
  hallC(ctx, t, cam, { stain: .42, ports: [180, 900] });
  [[150, 0], [430, 5], [710, 2], [980, 3]].forEach(([x, i], k) => fig(ctx, CREW[i], { x, y: 1180 + bob(t, k), s: 360, face: { eyes: 'normal', mouth: 'flat', look: [0, -1] }, arms: { L: [.3, -.1], R: { ik: [.05, -1.2] } }, legs: fl(t, k).legs }));
  fig(ctx, GUS, { x: 540, y: 1330, s: 440, chef: true, face: { eyes: 'wide', mouth: 'o', look: [0, -1] }, arms: { L: [.3, -.1], R: [.3, -.1] }, legs: fl(t).legs });
} });
// 6: I love a party
SHOTS.push({ start: 9.6, end: 12.08, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .05, Math.sin(t * 2) * .01, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  fig(ctx, GUS, { x: 540, y: 1560 + bob(t, 0, 20), s: 780, chef: true, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [2.5, .3], R: [2.5 + Math.sin(t * 6) * .2, .3] }, legs: fl(t).legs });
  confetti(ctx, t, 45, 3, clamp(lt * 3));
  const a = popAt(lt, .5, .2); if (a > 0) { ctx.save(); ctx.translate(540, 420); ctx.scale(a, a); pill(ctx, 'gus the cook', 0, 0, '#fff', 56); ctx.restore(); }
} });
// 7: smuggling a crate
SHOTS.push({ start: 12.08, end: 13.2, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 60, 960, 1.04, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [220, 960] });
  const x = 240 + lt * 450;
  fig(ctx, GUS, { x, y: 1480 + bob(t, 0, 10), s: 640, chef: true, lean: .06, face: { eyes: 'normal', mouth: 'smirk', look: [-1, 0], browAng: .3 }, arms: { L: { ik: [.28, -.45] }, R: { ik: [.28, -.45] } }, legs: fl(t).legs });
  crateBox(ctx, x + 190, 1330, 330, 250);
  const a = popAt(lt, .1, .2); if (a > 0) { ctx.save(); ctx.translate(540, 560); ctx.scale(a, a); pill(ctx, 'shhh', 0, 0, '#fff', 60); ctx.restore(); }
} });
// 8: forty cans
SHOTS.push({ start: 13.2, end: 14.64, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 940, 1.0 + lt * .08, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [220, 960] });
  const R = rng(4);
  for (let i = 0; i < 20; i++) { const cx = 90 + (i % 5) * 225 + Math.sin(t * 1.5 + i) * 14, cy = 560 + Math.floor(i / 5) * 190 + Math.cos(t * 1.3 + i) * 12; can(ctx, cx, cy, 190, Math.sin(t * 1.2 + i * 2) * .25); }
  const a = popAt(lt, .05, .2); if (a > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(a, a); pill(ctx, '40 cans', 0, 0, '#ffd23a', 84); ctx.restore(); }
  fig(ctx, GUS, { x: 540, y: 1680, s: 640, chef: true, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [2.6, .3], R: [2.6, .3] }, legs: fl(t).legs });
} });
// 9: cheering crowd
SHOTS.push({ start: 14.64, end: 16.16, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .05, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  [[120, 0, 380], [370, 4, 430], [670, 2, 430], [940, 3, 380], [540, 5, 330]].forEach(([x, i, s], k) => {
    const o = { x, y: (k === 4 ? 1000 : 1400) + bob(t, k, 24), s, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [2.6 + Math.sin(t * 7 + k) * .25, .3], R: { ik: [.2, -1.0] } }, legs: fl(t, k).legs };
    fig(ctx, CREW[i], o); const h = loc(C(CREW[i], o), .2, -1.0); can(ctx, h[0], h[1] - s * .07, s * .3, .2);
  });
  confetti(ctx, t, 40, 8, 1);
} });
// 10: everybody drank
SHOTS.push({ start: 16.16, end: 17.2, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.06 + lt * .06, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  const o = { x: 540, y: 1560, s: 800, face: { eyes: 'happy', mouth: 'grin' }, arms: { L: [.5, -.2], R: { ik: [.2, -.82] } }, legs: fl(t).legs };
  fig(ctx, CREW[0], o); const h = loc(C(CREW[0], o), .2, -.86); can(ctx, h[0] + 6, h[1] - 120, 250, -.5 + Math.sin(t * 6) * .04);
  for (let i = 0; i < 9; i++) { const ph = (lt * 1.6 + i / 9) % 1; circle(ctx, 540 + Math.sin(i * 3) * 190, 1000 - ph * 600, 9 + (i % 3) * 5); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
} });
// 11: the captain leans back and breathes in
SHOTS.push({ start: 17.2, end: 19.92, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .05, 0, 3);
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  const lean = kf(lt, [[0, 0], [1.5, -.32]]), br = kf(lt, [[1.7, 0], [2.65, 1]]);
  fig(ctx, CAP, { x: 540, y: 1600 + bob(t, 0, 10), s: 800 + br * 90, lean, face: { eyes: br > 0 ? 'closed' : 'half', mouth: br > 0 ? 'o' : 'smile', browAng: .1 }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t).legs });
  if (br > 0) for (let i = 0; i < 4; i++) { const ph = (lt * 1.5 + i / 4) % 1; ctx.save(); ctx.globalAlpha = .6 * (1 - ph); line(ctx, 330 + i * 40, 520 + ph * 130, 400 + i * 40, 600 + ph * 130, 10, '#fff'); ctx.restore(); }
} });
// 12: BURP
SHOTS.push({ start: 19.92, end: 20.56, tr: 'whip', draw(ctx, lt, t) {
  const sh = shake(t * 6, 22 * (1 - lt));
  const cam = { x: 540 + sh[0], y: 930 + sh[1], z: 1.1 + lt * .1, r: 0 };
  hallC(ctx, t, cam, { stain: 0, ports: [180, 900] });
  const o = { x: 540, y: 1560, s: 880, lean: -.06, face: { eyes: 'squint', mouth: 'gape' }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t).legs };
  fig(ctx, CAP, o);
  const m = loc(o, 0, -.68); spray(ctx, m[0], m[1], 0, lt, 16, 1.5, true, 800);
  const a = popAt(lt, .02, .12); ctx.save(); ctx.translate(790, 580); ctx.scale(a, a); burst(ctx, 0, 0, 200, 11, '#ffd23a', 4); text(ctx, 'BURP', 0, 0, 82, INK, INK, 0); ctx.restore();
} });
// 13: the ceiling gets a new colour
SHOTS.push({ start: 20.56, end: 23.2, tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 540 + lt * 25, y: 230 - lt * 20, z: 1.12, r: 0 };
  hallC(ctx, t, cam, { stain: clamp(lt / 1.9), ports: [] });
  for (let i = 0; i < 6; i++) { const ph = (lt * .5 + i / 6) % 1; drop(ctx, 200 + i * 160 + Math.sin(t + i) * 30, 330 + ph * 600, 20); }
  const a = popAt(lt, 1.4, .2); if (a > 0) { ctx.save(); ctx.translate(540, 700); ctx.scale(a, a); pill(ctx, 'a new colour', 0, 0, '#ffd23a', 56); ctx.restore(); }
} });
// 14: the captain stares up
SHOTS.push({ start: 23.2, end: 24.8, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .08, 0, 3);
  hallC(ctx, t, cam, { stain: 1, ports: [180, 900] });
  const o = { x: 540, y: 1600 + bob(t, 0, 8), s: 820, face: { eyes: 'wide', mouth: 'flat', look: [0, -1], browAng: -.3, browUp: 1 }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t).legs };
  fig(ctx, CAP, o);
  const dy = kf(lt, [[.2, 100], [1.0, SHY(o)[1] - 130, easeIn]]); if (lt > .2 && lt < 1.05) drop(ctx, 540, dy, 24);
  if (lt > 1.0) { const a = clamp((lt - 1.0) * 5); sweat(ctx, SHY(o)[0] + 170, SHY(o)[1] - 60, 50, 1); text(ctx, 'plop', 800, 640, 70 * a, '#fff', INK, 12); splat(ctx, SHY(o)[0] + 10, SHY(o)[1] - 150, 50 * a, 4); }
} });
// 15: the engineer
SHOTS.push({ start: 24.8, end: 26.0, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .04, 0, 3);
  hallC(ctx, t, cam, { stain: 1, ports: [180, 900] });
  const b = lt > .65; const o = { x: 540, y: 1600, s: 820, face: b ? { eyes: 'squint', mouth: 'gape' } : { eyes: 'closed', mouth: 'o' }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t).legs };
  fig(ctx, ENG, o); if (b) { const m = loc(o, 0, -.68); spray(ctx, m[0], m[1], .65, lt, 12, 1.3, true, 700); const a = popAt(lt, .67, .1); ctx.save(); ctx.translate(250, 560); ctx.scale(a, a); burst(ctx, 0, 0, 160, 11, '#ffd23a', 6); text(ctx, 'BURP', 0, 0, 66, INK, INK, 0); ctx.restore(); }
} });
// 16: the doctor
SHOTS.push({ start: 26.0, end: 26.96, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.03, 0, 3);
  hallC(ctx, t, cam, { stain: 1, ports: [180, 900] });
  const b = lt > .55; const o = { x: 540, y: 1600, s: 820, flip: -1, face: b ? { eyes: 'squint', mouth: 'gape' } : { eyes: 'closed', mouth: 'o' }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t).legs };
  fig(ctx, DOC, o); if (b) { const m = loc(o, 0, -.68); spray(ctx, m[0], m[1], .55, lt, 12, 1.3, true, 700); const a = popAt(lt, .57, .1); ctx.save(); ctx.translate(820, 560); ctx.scale(a, a); burst(ctx, 0, 0, 160, 11, '#ff9ad0', 7); text(ctx, 'BURP', 0, 0, 66, INK, INK, 0); ctx.restore(); }
} });
// 17: the whole crew, like a choir
SHOTS.push({ start: 26.96, end: 28.72, tr: 'whip', draw(ctx, lt, t) {
  const sh = shake(t * 5, 10 * clamp(lt));
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: 1.0 + lt * .05, r: 0 };
  hallC(ctx, t, cam, { stain: 1, ports: [180, 900] });
  const row = [[110, ENG], [330, CREW[0]], [545, CAP], [760, DOC], [970, CREW[3]]];
  row.forEach(([x, b], k) => { const o = { x, y: 1480 + (k % 2) * 40, s: 420, face: { eyes: 'squint', mouth: 'gape' }, arms: { L: [.5, -.2], R: [.5, -.2] }, legs: fl(t, k).legs }; fig(ctx, b, o); const m = loc(o, 0, -.68); spray(ctx, m[0], m[1], .1 + k * .06, lt, 6, 1.2, true, 560); });
  const a = popAt(lt, .3, .15); ctx.save(); ctx.translate(540, 520); ctx.scale(a, a); text(ctx, 'BUUURP', 0, 0, 120, '#ffd23a', INK, 20); ctx.restore();
} });
// 18: why (diagram, earth vs space)
SHOTS.push({ start: 28.72, end: 31.84, tr: 'cut', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .03, 0, 2);
  applyCam(ctx, cam, 1); const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#fff4d6'); g.addColorStop(1, '#ffe2a8'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 1700, 2600);
  const mix = clamp((lt - 1.9) / .9);
  stomach(ctx, 540, 800, 760, mix, t);
  const sp = lt > 1.0;
  ctx.save(); ctx.translate(540, 330); const a = popAt(lt, sp ? 1.0 : 0, .2); ctx.scale(a, a); pill(ctx, sp ? 'in space' : 'on earth', 0, 0, sp ? '#9ad4ff' : '#fff', 70); ctx.restore();
  if (!sp) { const b = popAt(lt, .35, .2); ctx.save(); ctx.translate(850, 700); ctx.scale(b, b); text(ctx, 'gas', 0, 0, 60, '#fff', INK, 10); ctx.restore(); const c = popAt(lt, .6, .2); ctx.save(); ctx.translate(850, 1000); ctx.scale(c, c); text(ctx, 'food', 0, 0, 60, '#ffd23a', INK, 10); ctx.restore(); }
  if (lt > 1.9) { const b = popAt(lt, 1.9, .2); ctx.save(); ctx.translate(540, 1150); ctx.scale(b, b); text(ctx, 'all mixed!', 0, 0, 80, '#e8262b', INK, 12); ctx.restore(); }
} });
// 19: a burp brings dinner with it
SHOTS.push({ start: 31.84, end: 34.8, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 960, 1.0 + lt * .03, 0, 2);
  applyCam(ctx, cam, 1); const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#fff4d6'); g.addColorStop(1, '#ffe2a8'); ctx.fillStyle = g; ctx.fillRect(-300, -300, 1700, 2600);
  const rise = lt < 1.3 ? -1 : (lt - 1.3) / 1.0;
  stomach(ctx, 540, 1000, 560, 1, t, rise);
  if (rise > 1) { const k = lt - 2.3; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .35, d = 360 * easeOut(clamp(k / .6)); circle(ctx, 540 + Math.cos(a) * d, 440 + Math.sin(a) * d, 22); fillStroke(ctx, ['#7bc67b', '#ff9a3c', '#a35a2a'][i % 3], 6); } const a = popAt(lt, 2.3, .15); ctx.save(); ctx.translate(540, 300); ctx.scale(a, a); pill(ctx, 'dinner!', 0, 0, '#ffd23a', 76); ctx.restore(); }
  const b = popAt(lt, 1.2, .2); if (b > 0) { ctx.save(); ctx.translate(850, 1000); ctx.scale(b, b); text(ctx, 'burp', 0, 0, 70, '#fff', INK, 12); ctx.restore(); }
} });
// 20: wiping the ceiling, all night
SHOTS.push({ start: 34.8, end: 36.4, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 + lt * 30, 760, 1.0 + lt * .04, 0, 3);
  hallC(ctx, t, cam, { stain: 1, ports: [180, 900] });
  [[150, 0], [420, 5], [680, 2], [930, 3], [290, 4]].forEach(([x, i], k) => {
    const y = 620 + (k === 4 ? 360 : 0) + bob(t, k, 10) + (k % 2) * 40, sc = Math.sin(t * 14 + k) * 40;
    const o = { x, y, s: 400, flip: x > 500 ? -1 : 1, face: { eyes: 'half', mouth: 'flat', look: [0, -1] }, arms: { L: [.5, -.2], R: { ik: [.22 + sc * .0006, -1.0 + sc * .0002] } }, legs: fl(t, k).legs };
    fig(ctx, CREW[i], o); const h = loc(C(CREW[i], o), .22, -1.0); toothbrush(ctx, h[0], h[1] - 30, 160, -1.2);
  });
} });
// 21: with toothbrushes
SHOTS.push({ start: 36.4, end: 38.0, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540, 760, 1.12, 0, 3);
  hallC(ctx, t, cam, { stain: 1, ports: [] });
  const sx = 540 + Math.sin(t * 13) * 70;
  const o = { x: 540, y: 1500, s: 860, face: { eyes: 'half', mouth: 'flat', look: [0, -1], browAng: .2 }, arms: { L: [.5, -.2], R: { ik: [.02, -1.0] } }, legs: fl(t).legs };
  fig(ctx, CREW[0], o);
  const h = loc(C(CREW[0], o), .02, -1.0); toothbrush(ctx, h[0] + 150 + (sx - 540) * .5, 520, 330, -1.35);
  for (let i = 0; i < 4; i++) { const ph = (lt * 2 + i / 4) % 1; ctx.save(); ctx.globalAlpha = 1 - ph; circle(ctx, 640 + i * 38, 360 + ph * 70, 12); fillStroke(ctx, '#fff', 3); ctx.restore(); }
  const a = popAt(lt, .5, .2); if (a > 0) { ctx.save(); ctx.translate(540, 1100); ctx.scale(a, a); pill(ctx, 'toothbrushes', 0, 0, '#fff', 60); ctx.restore(); }
} });
// 22: flat water for everyone
SHOTS.push({ start: 38.0, end: 39.68, tr: 'whip', draw(ctx, lt, t) {
  const cam = camOf(t, 540 - lt * 40, 960, 1.0 + lt * .05, 0, 3);
  hallC(ctx, t, cam, { stain: 1, ports: [180, 900] });
  [[380, 0], [620, 3], [860, 5]].forEach(([x, i], k) => { const o = { x, y: 1400 + bob(t, k), s: 380, flip: -1, face: { eyes: 'half', mouth: 'frown', look: [-.8, 0] }, arms: { L: [.5, -.2], R: { ik: [.2, -.7] } }, legs: fl(t, k).legs }; fig(ctx, CREW[i], o); const h = loc(C(CREW[i], o), -.2, -.7); circle(ctx, h[0], h[1] - 20, 34); fillStroke(ctx, 'rgba(160,220,255,.9)', 6); });
  fig(ctx, GUS, { x: 150, y: 1500, s: 620, chef: true, face: { eyes: 'happy', mouth: 'smile' }, arms: { L: [.5, -.2], R: { ik: [.45, -.5] } }, legs: fl(t).legs });
  const a = popAt(lt, .7, .2); if (a > 0) { ctx.save(); ctx.translate(540, 520); ctx.scale(a, a); pill(ctx, 'flat water', 0, 0, '#9ad4ff', 70); ctx.restore(); }
} });
// 23: rule one (matches the first shot)
SHOTS.push({ start: 39.68, end: 42.3, tr: 'cut', draw(ctx, lt, t) { hookPic(ctx, lt, t); } });
