import sys, re, pathlib
P = pathlib.Path(sys.argv[1])
# 1. characters: hair styles + stubble + skin default
t = (P / 'src/core/toon.js').read_text()
if 'HA-CLEAN' not in t:
    hair = r'''
// HA-CLEAN hair: L.hair = 'short' | 'swoop' | 'bob' | 'buzz' | 'curly' | 'long' | 'bald', L.hairCol; extra 'stubble'
export const SKIN = ['#F6D9B5', '#EBC49A', '#D9A877', '#B98457', '#8E5D3B', '#6B4229'];
function drawHair(g, L, S, hx, hy, r, head) {
  const H = L.hair; const col = L.hairCol || '#2A2220';
  if ((L.extra || []).includes('stubble')) { g.save(); g.clip(head); g.fillStyle = 'rgba(40,30,25,0.55)';
    for (let i = 0; i < 70; i++) { const a = Math.PI * (0.12 + 0.76 * ((i * 0.618) % 1)), d = r * (0.62 + ((i * 0.37) % 1) * 0.3); g.beginPath(); g.arc(hx + Math.cos(a) * d, hy + Math.sin(a) * d * 0.95, 3.2, 0, 7); g.fill(); } g.restore(); }
  if (!H || H === 'bald' || ['cap', 'beanie', 'tophat', 'visor', 'bowler', 'cowboy', 'chef', 'police', 'mailcap', 'helmet', 'crown'].includes(L.hat)) {
    if (H === 'bob' || H === 'long') { g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 8; [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(hx + s * (r * 0.95), hy + r * (H === 'long' ? 0.35 : 0.1), r * 0.2, r * (H === 'long' ? 0.75 : 0.45), 0, 0, 7); g.fill(); g.stroke(); }); }
    return; }
  g.save(); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 9; g.lineJoin = 'round';
  const cap = new Path2D(); const top = hy - r * 0.98;
  if (H === 'buzz') { cap.ellipse(hx, hy - r * 0.08, r * 1.01, r * 0.93, 0, Math.PI * 1.08, Math.PI * 1.92); cap.closePath(); }
  else { const fr = H === 'swoop' ? 0.36 : H === 'curly' ? 0.42 : 0.46; const yb = hy - r * fr;
    cap.moveTo(hx - r * 1.02, hy - r * 0.02); cap.bezierCurveTo(hx - r * 1.12, top - r * 0.25, hx + r * 1.12, top - r * 0.25, hx + r * 1.02, hy - r * 0.02);
    if (H === 'swoop') { cap.bezierCurveTo(hx + r * 0.9, yb - r * 0.1, hx + r * 0.55, yb - r * 0.25, hx + r * 0.25, yb - r * 0.05); cap.bezierCurveTo(hx - r * 0.05, yb + r * 0.12, hx - r * 0.5, yb - r * 0.05, hx - r * 0.8, yb + r * 0.1); }
    else if (H === 'curly') { for (let i = 0; i <= 8; i++) { const x = hx + r * 1.0 - i * r * 0.25; cap.quadraticCurveTo(x + r * 0.12, yb + r * 0.2, x, yb); } }
    else { cap.bezierCurveTo(hx + r * 0.85, yb, hx + r * 0.3, yb + r * 0.1, hx, yb + r * 0.02); cap.bezierCurveTo(hx - r * 0.3, yb - r * 0.06, hx - r * 0.85, yb + r * 0.05, hx - r * 1.02, hy - r * 0.02); }
    cap.closePath(); }
  g.fill(cap); g.stroke(cap);
  if (H === 'swoop') { g.beginPath(); g.moveTo(hx + r * 0.2, top + r * 0.1); g.bezierCurveTo(hx + r * 0.75, top + r * 0.05, hx + r * 0.75, hy - r * 0.35, hx + r * 0.45, hy - r * 0.25); g.lineWidth = 8; g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.ellipse(hx - r * 0.35, top + r * 0.25, r * 0.28, r * 0.08, -0.3, 0, 7); g.fill();
  if (H === 'bob' || H === 'long') { g.fillStyle = col; [-1, 1].forEach((s) => { g.beginPath(); g.ellipse(hx + s * (r * 0.95), hy + r * (H === 'long' ? 0.35 : 0.1), r * 0.2, r * (H === 'long' ? 0.75 : 0.45), 0, 0, 7); g.fill(); g.stroke(); }); }
  g.restore();
}
'''
    t = t.replace("  g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);\n  drawFace(g, L, S, hx, hy);",
                  "  g.strokeStyle = INK; g.lineWidth = LW + 1; g.stroke(head);\n  drawHair(g, L, S, hx, hy, r, head); /* HA-CLEAN */\n  drawFace(g, L, S, hx, hy);", 1)
    assert 'HA-CLEAN */' in t, 'toon anchor not found'
    t += hair
    t = t.replace("  } else if (L.pattern === 'stripes') {", "  } else if (L.pattern === 'hstripes') {\n    g.fillStyle = pc; for (let y = top + 6; y < bot + 20; y += 44) g.fillRect(bx - 140, y, 280, 20);\n  } else if (L.pattern === 'stripes') {", 1)
    (P / 'src/core/toon.js').write_text(t)
# 2. gentle post-processing: no grain, light vignette, grades at 40 % unless gradeK given explicitly
f = (P / 'src/core/fx.js').read_text()
if 'HA-CLEAN' not in f:
    f = f.replace("if (sh.grade) grade(sh.grade, sh.gradeK ?? 1);", "if (sh.grade) grade(sh.grade, sh.gradeK ?? 0.4); /* HA-CLEAN */")
    f = f.replace("vignette(sh.vignette ?? 0.32); grain(t, sh.grain ?? 0.045);", "vignette(sh.vignette ?? 0.12); if (sh.grain) grain(t, sh.grain);")
    (P / 'src/core/fx.js').write_text(f)
# 3. captions: white, softer shadow, thinner outline (the reference look)
c = (P / 'src/core/captions.js').read_text()
if 'HA-CLEAN' not in c:
    c = c.replace("ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillText(text, 3, 9);\n  ctx.lineWidth = 15; ctx.strokeStyle = '#0B0B10'; ctx.strokeText(text, 0, 0);",
                  "ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; /* HA-CLEAN */\n  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(15,15,20,0.85)'; ctx.strokeText(text, 0, 0); ctx.shadowColor = 'transparent';")
    (P / 'src/core/captions.js').write_text(c)
# 4. shot cross-dissolve: a shot with dissolve: 0.35 fades in over the end of the previous shot
m = (P / 'src/main.js').read_text()
if 'HA-CLEAN' not in m:
    m = m.replace("  const blit = () => ctx.drawImage(GL, 0, 0, W, H);\n  ctx.save(); sh.draw(lt, d, t, blit); ctx.restore();\n  FX.post(sh, lt, d, t);",
"""  const blit = () => ctx.drawImage(GL, 0, 0, W, H);
  let prevImg = null; /* HA-CLEAN dissolve */
  if (sh.dissolve && lt < sh.dissolve && i > 0) { const p = S[i - 1], pd = sh.at - p.at; ctx.save(); p.draw(pd + lt, pd, t, blit); ctx.restore(); FX.post(p, pd, pd, t);
    prevImg = (window.__DIS ||= Object.assign(document.createElement('canvas'), { width: W, height: H })); prevImg.getContext('2d').drawImage(cv, 0, 0); }
  ctx.save(); sh.draw(lt, d, t, blit); ctx.restore();
  FX.post(sh, lt, d, t);
  if (prevImg) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - Math.min(1, lt / sh.dissolve); ctx.drawImage(prevImg, 0, 0); ctx.restore(); }""")
    assert 'HA-CLEAN' in m, 'main anchor not found'
    (P / 'src/main.js').write_text(m)
print('patched', P)
