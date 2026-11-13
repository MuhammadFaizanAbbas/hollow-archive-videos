// Captions: ONE word at a time (short words ride along with the next: "a single", "the whole"), white heavy sans with
// a black outline and a soft drop shadow, centre of the screen. No colour highlight. Words keep their punctuation.
// A script line may set "caps": "He bet | his life | savings" to choose the chunks; otherwise they're made automatically.
import { ctx, clamp, lerp, seg, eob } from './lib.js';
import { T, lineWords } from './timing.js';

export const CAP = { y: 1340, size: 88, maxW: 960 };
let caps = []; let SCRIPT = null;
const SHORT = /^(a|an|the|to|of|in|on|at|by|and|but|or|so|is|it|he|she|we|i|his|her|my|no|up|for|was)$/i;

function autoChunks(ws) {
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i], n = ws[i + 1], bare = w.replace(/[^A-Za-z']/g, '');
    if (n && SHORT.test(bare) && !/[,.!?;:]$/.test(w) && (w + n).length <= 11) { out.push([i, i + 1]); i++; } else out.push([i, i]);
  }
  return out;
}

export function buildCaptions(script) {
  caps = []; SCRIPT = script;
  script.lines.forEach((ln, i) => {
    const ws = lineWords(i); if (!ws.length) return;
    const textWords = ln.text.split(/\s+/).filter(Boolean);
    const spoken = ws.length === textWords.length ? textWords : ws.map((w) => w.w);
    if (ln.caps) {
      const nm = (w) => String(w).toLowerCase().replace(/[^a-z0-9']+/g, '');
      let from = 0;
      ln.caps.split('|').map((c) => c.trim()).filter(Boolean).forEach((c, j) => {
        const first = nm(c.split(/\s+/)[0]);
        let idx = j === 0 ? 0 : ws.findIndex((w, k) => k > from && nm(w.w) === first);
        if (idx < 0) idx = Math.min(ws.length - 1, from + 1);
        from = idx; caps.push({ line: i, s: ws[idx].s - 0.03, text: c.replace(/\*/g, '') });
      });
    } else autoChunks(spoken).forEach(([a, b]) => caps.push({ line: i, s: ws[a].s - 0.03, text: spoken.slice(a, b + 1).join(' ') }));
  });
  caps.forEach((c, k) => { const next = caps[k + 1], lineEnd = T.lines[c.line].end; c.e = next ? (next.s - lineEnd > 0.6 && next.line !== c.line ? lineEnd + 0.25 : next.s) : T.dur; });
  return caps;
}
export const captionList = () => caps.map((c) => ({ ...c, words: [{ txt: c.text }] }));

/** draw one caption text at x, y (also used by the style sheet) */
export function captionText(text, x = 540, y = CAP.y, sc = 1) {
  const size = CAP.size;
  ctx.save(); ctx.font = `900 ${size}px Inter`; ctx.letterSpacing = '0px';
  const fit = Math.min(1, CAP.maxW / ctx.measureText(text).width);
  ctx.translate(x, y); ctx.scale(sc * fit, sc * fit); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillText(text, 3, 9);
  ctx.lineWidth = 15; ctx.strokeStyle = '#0B0B10'; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = '#FFFFFF'; ctx.fillText(text, 0, 0);
  ctx.restore();
}
function pill(x, y, h, padX, bg, stroke, draw) { ctx.save(); const w = draw(null) + padX * 2; ctx.fillStyle = bg; ctx.strokeStyle = stroke; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); if (stroke) ctx.stroke(); draw([x - w / 2 + padX, y]); ctx.restore(); return w; }
export function drawCaption(t) {
  const c = caps.find((c) => t >= c.s && t < c.e); if (!c) return;
  const lt = t - c.s; captionText(c.text, 540, CAP.y, lt < 0.1 ? lerp(0.86, 1, eob(seg(lt, 0, 0.1))) : 1);
  const ln = SCRIPT && SCRIPT.lines[c.line]; if (!ln || !ln.sp) return; const col = (SCRIPT.cast[ln.sp] || {}).color || '#FFFFFF';
  ctx.save(); ctx.font = '900 34px Inter';
  pill(540, CAP.y - 92, 52, 22, 'rgba(10,12,20,0.82)', null, (p) => { const tw = ctx.measureText(ln.sp).width + 30; if (!p) return tw;
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(p[0] + 8, p[1], 8, 0, 6.283); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(ln.sp, p[0] + 26, p[1] + 1); return tw; });
  ctx.restore();
}
// HUD: AIR / SOLS LEFT counter (top-left) and SOL tag (top-right), on every frame like Parts 1-3
export function drawHUD(t) {
  if (!SCRIPT) return; const air = SCRIPT.airAt ? (t >= SCRIPT.airAt[1] ? SCRIPT.airAt[2] : SCRIPT.airAt[0]) : 7;
  const flip = SCRIPT.airAt ? clamp((t - SCRIPT.airAt[1]) / 0.25) : 1; const pulse = SCRIPT.airAt && t > SCRIPT.airAt[1] && t < SCRIPT.airAt[1] + 1.2 ? 0.5 + 0.5 * Math.sin(t * 25) : 0;
  ctx.save(); ctx.fillStyle = 'rgba(10,12,20,0.78)'; ctx.strokeStyle = pulse ? `rgba(255,${80 + 100 * pulse},80,1)` : '#E63946'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(40, 46, 236, 84, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#E63946'; ctx.beginPath(); ctx.arc(72, 88, 10, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.font = '900 24px Inter'; ctx.textBaseline = 'middle'; ctx.fillText('AIR', 94, 74); ctx.font = '800 17px Inter'; ctx.fillText('SOLS LEFT', 94, 102);
  ctx.font = '900 62px Inter'; ctx.textAlign = 'right'; ctx.save(); ctx.translate(258, 90); ctx.scale(1, flip < 1 ? Math.abs(1 - 2 * flip) + 0.01 : 1); ctx.fillText(String(flip < 0.5 && SCRIPT.airAt ? SCRIPT.airAt[0] : air), 0, 0); ctx.restore();
  ctx.textAlign = 'center'; ctx.font = '900 30px Inter'; const sl = 'SOL ' + (SCRIPT.sol || 1); const w = ctx.measureText(sl).width + 40;
  ctx.fillStyle = 'rgba(10,12,20,0.78)'; ctx.beginPath(); ctx.roundRect(1040 - w, 58, w, 58, 12); ctx.fill(); ctx.fillStyle = '#F2C230'; ctx.fillText(sl, 1040 - w / 2, 88);
  ctx.restore();
}
