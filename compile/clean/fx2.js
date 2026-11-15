// in-world overlay graphics, drawn over the 3D like hand-made explainer marks (chalk text, arrows, a tape measure,
// a calendar), plus a soft caption shadow. Pure functions of time; k = 0..1 reveal.
import { ctx, clamp } from './lib.js';
const eo = (x) => 1 - Math.pow(1 - clamp(x), 3);
export function chalk(text, x, y, k = 1, { size = 90, col = '#F4F1EA', rot = -0.03 } = {}) { if (k <= 0) return; const g = ctx; g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = clamp(k * 1.5);
  g.font = `700 ${size}px "Caveat", "Comic Sans MS", Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6;
  const w = g.measureText(text).width; g.save(); g.beginPath(); g.rect(-w / 2 - 10, -size, (w + 20) * eo(k), size * 2); g.clip(); g.fillText(text, 0, 0); g.restore(); g.restore(); }
export function arrow(x0, y0, x1, y1, k = 1, { col = '#F4F1EA', w = 12, head = 34 } = {}) { if (k <= 0) return; const g = ctx, e = eo(k), x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e, a = Math.atan2(y - y0, x - x0);
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke();
  g.beginPath(); g.moveTo(x, y); g.lineTo(x - head * Math.cos(a - 0.5), y - head * Math.sin(a - 0.5)); g.lineTo(x - head * Math.cos(a + 0.5), y - head * Math.sin(a + 0.5)); g.closePath(); g.fill(); g.restore(); }
export function tape(x, y, len, label, k = 1, { h = 60 } = {}) { if (k <= 0) return; const g = ctx, L = len * eo(k); g.save(); g.translate(x, y);
  g.fillStyle = '#F2C230'; g.strokeStyle = '#5A4410'; g.lineWidth = 4; g.fillRect(0, -h / 2, L, h); g.strokeRect(0, -h / 2, L, h); g.fillStyle = '#3A2A08';
  for (let i = 0; i * 20 < L; i++) g.fillRect(i * 20, -h / 2, 3, i % 5 ? h * 0.3 : h * 0.55); g.fillStyle = '#E63946'; g.beginPath(); g.roundRect(-120, -h / 2 - 6, 120, h + 12, 10); g.fill();
  g.fillStyle = '#FFF'; g.font = '900 40px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, -60, 2); g.restore(); }
export function calendar(x, y, month, crossed = 0, k = 1, { w = 520 } = {}) { if (k <= 0) return; const g = ctx, s = eo(k); g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = 0.9;
  g.fillStyle = '#F6F1E4'; g.strokeStyle = '#2A2A33'; g.lineWidth = 6; g.beginPath(); g.roundRect(-w / 2, -w * 0.55, w, w * 1.05, 18); g.fill(); g.stroke(); g.fillStyle = '#B5372E'; g.fillRect(-w / 2, -w * 0.55, w, w * 0.22);
  g.fillStyle = '#FFF'; g.font = `900 ${w * 0.13}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(month, 0, -w * 0.44); g.fillStyle = '#2A2A33'; g.font = `700 ${w * 0.065}px Inter`;
  for (let d = 0; d < 30; d++) { const cx = -w / 2 + w * 0.09 + (d % 7) * w * 0.135, cy = -w * 0.22 + Math.floor(d / 7) * w * 0.15; g.fillText(String(d + 1), cx, cy); if (d < crossed) { g.strokeStyle = '#B5372E'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx - 20, cy - 20); g.lineTo(cx + 20, cy + 20); g.moveTo(cx + 20, cy - 20); g.lineTo(cx - 20, cy + 20); g.stroke(); } }
  g.restore(); }
