"""Multi-voice Kokoro narration: each line spoken by its speaker's voice (script.json "cast"), radio filter for fx=radio.
Writes data/narration.wav + data/lines.json in the same format as faceless-shorts voice.py."""
import json, sys
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
from kokoro_onnx import Kokoro
SR = 24000
KD = Path.home() / '.faceless-shorts/kokoro'
P = Path(sys.argv[1]); S = json.loads((P / 'script.json').read_text())
k = Kokoro(str(KD / 'kokoro-v1.0.onnx'), str(KD / 'voices-v1.0.bin'))
def trim(x, thr=0.008):
    i = np.where(np.abs(x) > thr)[0]
    return x[max(0, i[0] - 240): i[-1] + 480] if len(i) else x
def radio(x, seed):
    sos = butter(4, [320, 3200], btype='band', fs=SR, output='sos'); y = sosfilt(sos, x)
    y = np.tanh(y * 3.0) / np.tanh(3.0)
    rng = np.random.default_rng(seed); n = rng.normal(0, 1, len(y)); n = sosfilt(butter(2, [1500, 7000], btype='band', fs=SR, output='sos'), n)
    flutter = 0.75 + 0.25 * np.sin(np.arange(len(y)) / SR * 2 * np.pi * 5.5)
    pad = int(0.18 * SR); y = np.concatenate([np.zeros(pad), y * flutter, np.zeros(pad)]); n = np.resize(n, len(y))
    return y * 0.85 + n * 0.045 * np.max(np.abs(y))
out = [np.zeros(int(S.get('lead', 0.1) * SR))]; t = len(out[0]) / SR; lines = []
for i, ln in enumerate(S['lines']):
    c = S['cast'][ln['sp']]; v = c['voice']
    x = trim(np.asarray(k.create(ln['text'], voice=v, speed=c.get('speed', 1.0), lang='en-gb' if v.startswith('b') else 'en-us')[0], dtype=np.float64))
    if c.get('fx') == 'radio': x = radio(x, i)
    x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.09
    lines.append({'i': i, 'text': ln['text'], 'sp': ln['sp'], 'start': round(t, 3), 'end': round(t + len(x) / SR, 3)})
    print(f"{i:2d} {lines[-1]['start']:6.2f}-{lines[-1]['end']:6.2f} {ln['sp']:5s} {ln['text']}", flush=True)
    nxt = S['lines'][i + 1]['sp'] if i + 1 < len(S['lines']) else None
    g = float(ln.get('gap', S.get('gap', 0.1) + (0.12 if nxt and nxt != ln['sp'] else 0)))
    out += [x, np.zeros(int(g * SR))]; t += (len(x)) / SR + g
out.append(np.zeros(int(S.get('outro', 0.8) * SR)))
y = np.concatenate(out); y = y / (np.abs(y).max() + 1e-9) * 0.9
(P / 'data').mkdir(exist_ok=True); wavfile.write(P / 'data/narration.wav', SR, (y * 32767).astype(np.int16))
(P / 'data/lines.json').write_text(json.dumps({'duration': round(len(y) / SR, 3), 'voice': 'multi', 'speed': 1, 'lines': lines}, indent=1))
print('duration', round(len(y) / SR, 2))
