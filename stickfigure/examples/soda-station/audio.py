import numpy as np, soundfile as sf, json
from scipy import signal
SR = 44100
import json as _j, os as _os
WARP = _j.load(open('audio/warp.json')) if _os.path.exists('audio/warp.json') else None
def toNew(x):
    if not WARP: return x
    A = WARP['anchors']
    if x <= A[0][0]: return x - A[0][0] + A[0][1]
    for i in range(len(A) - 1):
        if x <= A[i + 1][0]: k = (x - A[i][0]) / (A[i + 1][0] - A[i][0]); return A[i][1] + k * (A[i + 1][1] - A[i][1])
    return x - A[-1][0] + A[-1][1]
DUR = (WARP['new_end'] + 0.6 if WARP else 37.4) + 0.6
N = int(DUR * SR)
rng = np.random.default_rng(3)
def T(n): return np.arange(n) / SR
def env(n, a=.005, d=.2, curve=4):
    t = T(n); e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4)); return e
def place(buf, x, at, g=1.0):
    i = int(toNew(at) * SR); j = min(len(buf), i + len(x))
    if i < 0 or i >= len(buf): return
    buf[i:j] += x[:j - i] * g
def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi / (SR / 2), .99)], 'band'); return signal.lfilter(b, a, x)
def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)

# ---------------- SFX ----------------
def whoosh(dur=.35, up=True):
    n = int(dur * SR); x = rng.standard_normal(n); t = T(n)
    lo, hi = bp(x, 250, 1200), bp(x, 1500, 6000); k = np.linspace(0, 1, n) if up else np.linspace(1, 0, n)
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return (lo * (1 - k) + hi * k) * e * 1.6
def thud(f0=70, dur=.35, g=1):
    n = int(dur * SR); t = T(n); f = f0 * (1 + 1.5 * np.exp(-t * 30))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
    x += lp(rng.standard_normal(n), 900) * np.exp(-t * 40) * .6
    return x * g
def clang(f0=520, dur=1.0):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for k, (r, a, d) in enumerate([(1, 1, 5), (2.76, .6, 7), (5.4, .4, 10), (8.9, .25, 14), (1.5, .5, 6)]):
        x += a * np.sin(2 * np.pi * f0 * r * t + k) * np.exp(-t * d)
    x += hp(rng.standard_normal(n), 2000) * np.exp(-t * 60) * .8
    return x * .5 + thud(90, dur, .7)[:n]
def pluck(f, dur=.5, bright=.5):
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = bright * buf[i % p] + (1 - bright) * .5 * (buf[i % p] + buf[(i + 1) % p]) * .996 if False else .5 * (buf[i % p] + buf[(i + 1) % p]) * .995
    return out
def chime(f=1760, dur=.8):
    n = int(dur * SR); t = T(n)
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.01 * t) + .3 * np.sin(2 * np.pi * f * 3 * t)) * np.exp(-t * 6) * np.minimum(1, t / .003) * .5
def sparkle_sfx():
    out = np.zeros(int(.7 * SR))
    for i, f in enumerate([2093, 2637, 3136, 4186]): place(out, chime(f, .5) * .5, i * .05)
    return out
def tick(): n = int(.04 * SR); t = T(n); return hp(rng.standard_normal(n), 3000) * np.exp(-t * 200) * .8 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 150) * .4
def pop(f=600):
    n = int(.12 * SR); t = T(n); fr = f * (1 + 2 * t * 10); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 40)
def boing(f=220, dur=.5):
    n = int(dur * SR); t = T(n); fr = f * (1 + .35 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3)) * (1 + t)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 5) * .6
def tweet():
    out = np.zeros(int(1.2 * SR))
    for i in range(4):
        n = int(.1 * SR); t = T(n); fr = 3200 + 900 * np.sin(2 * np.pi * 30 * t)
        place(out, np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / .1) * .25, i * .25)
    return out
def scribble(dur=.18):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 1500, 6000) * (0.5 + .5 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / dur) * .5
def riser(dur=2.8):
    n = int(dur * SR); t = T(n); f = 200 * (2 ** (t / dur * 2.5))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .3 + bp(rng.standard_normal(n), 800, 5000) * .3 * (t / dur)
    return x * (t / dur) ** 2
def waves(dur):
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 700, 2)
    return x * (0.5 + .5 * np.sin(2 * np.pi * t / 4.5) ** 2) * .5
def heartbeat():
    out = np.zeros(int(.8 * SR)); place(out, thud(55, .3, .8), 0); place(out, thud(50, .3, .6), .22); return out


def fizz(dur=.9):
    n = int(dur * SR); t = T(n); return hp(rng.standard_normal(n), 3500) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** .7 * .5
def burp(dur=.7, f0=120):
    n = int(dur * SR); t = T(n); f = f0 * (1 - .45 * t / dur)
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + np.sin(2 * np.pi * np.cumsum(f * 2.02) / SR) * .25
    x = lp(x, 700) * (0.6 + .4 * np.sin(2 * np.pi * 32 * t)) + lp(rng.standard_normal(n), 400) * .3
    return x * np.minimum(1, t / .03) * np.exp(-np.maximum(0, t - .35) * 6) * .9
def splat_sfx():
    n = int(.35 * SR); t = T(n); return (lp(rng.standard_normal(n), 1800) * np.exp(-t * 18) + bp(rng.standard_normal(n), 300, 900) * np.exp(-t * 9) * .6) * .9
def inhale(dur=1.1):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 400, 2600) * (t / dur) ** 1.5 * .7
def cheer(dur=1.4):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for f in (320, 410, 520, 640): x += np.sin(2 * np.pi * f * t * (1 + .04 * np.sin(2 * np.pi * 6 * t + f))) * .12
    return (x + bp(rng.standard_normal(n), 800, 3000) * .25) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** .5
def glug(): n = int(.18 * SR); t = T(n); return np.sin(2 * np.pi * np.cumsum(180 + 250 * t / .18) / SR) * np.exp(-t * 18) * .6
sfx = np.zeros(N)
whips = [1.36, 2.72, 4.48, 6.56, 8.56, 9.6, 12.08, 13.2, 14.64, 16.16, 17.2, 20.56, 23.2, 24.8, 28.72, 34.8, 36.4, 38.0, 39.68]
for w in whips: place(sfx, whoosh(.36), w - .22, .35)
place(sfx, thud(60, .5, .9), 0.02); place(sfx, fizz(.7), 0.1, .4)
place(sfx, thud(70, .4, .8), 3.72); place(sfx, pop(500), 5.98, .5)
place(sfx, pop(620), 6.96, .4); place(sfx, pop(520), 7.66, .4)
place(sfx, sparkle_sfx(), 9.7, .35); place(sfx, chime(1320, .8), 10.1, .3)
place(sfx, pop(700), 12.2, .4)
for i in range(6): place(sfx, tick(), 12.3 + i * .17, .3)
place(sfx, pop(600), 13.25, .5)
for i, f in enumerate([700, 900, 640, 820]): place(sfx, clang(f, .5), 13.3 + i * .13, .22)
place(sfx, cheer(1.4), 14.7, .5); place(sfx, sparkle_sfx(), 14.8, .3)
place(sfx, fizz(.8), 16.2, .5)
for i in range(4): place(sfx, glug(), 16.45 + i * .17, .4)
place(sfx, inhale(1.2), 18.7, .6)
place(sfx, burp(.8), 19.95, 1.0); place(sfx, thud(55, .5, .9), 19.95); place(sfx, splat_sfx(), 20.15, .6)
for i, tt in enumerate([20.85, 21.5, 22.05, 22.65]): place(sfx, splat_sfx(), tt, .5)
place(sfx, pop(500), 24.2, .6); place(sfx, splat_sfx(), 24.25, .4)
place(sfx, burp(.6, 140), 25.45, 1.0); place(sfx, splat_sfx(), 25.6, .5)
place(sfx, burp(.55, 100), 26.55, 1.0); place(sfx, splat_sfx(), 26.7, .5)
for i, (tt, f) in enumerate([(27.1, 110), (27.25, 150), (27.4, 90), (27.55, 130), (27.7, 100), (27.95, 120)]): place(sfx, burp(.6, f), tt, .8)
place(sfx, splat_sfx(), 27.4, .6); place(sfx, thud(55, .5, .8), 27.9)
place(sfx, pop(500), 28.8, .4); place(sfx, pop(700), 29.72, .5)
for i in range(10): place(sfx, tick(), 30.6 + i * .08, .3)
place(sfx, chime(1100, .8), 30.65, .35)
place(sfx, riser(1.0), 33.14, .4); place(sfx, pop(600), 34.14, .6); place(sfx, chime(1500, .8), 34.15, .3)
for i in range(8): place(sfx, scribble(), 34.95 + i * .19, .5)
for i in range(8): place(sfx, scribble(), 36.45 + i * .19, .7)
place(sfx, pop(520), 36.9, .4)
place(sfx, pop(600), 38.7, .5)
place(sfx, thud(55, .6, 1.0), 41.25); place(sfx, sparkle_sfx(), 41.3, .3)
music = np.zeros(N)
# ---------------- VO + mix ----------------
vo, vsr = sf.read('audio/vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = signal.resample_poly(vo, SR, vsr)
vo = hp(vo, 90)
# gentle compression
envv = np.abs(signal.hilbert(vo)); envv = lp(envv, 20)
gain = np.where(envv > .15, (.15 / np.maximum(envv, 1e-6)) ** .4, 1.0); vo = vo * gain
vo = vo / np.max(np.abs(vo)) * .9
VO = np.zeros(N); VO[:min(N, len(vo))] = vo[:N]
# duck music under VO
venv = lp(np.abs(VO), 6); vtrack = np.clip(venv / .05, 0, 1)
duck = 1 - .55 * vtrack
mixL = VO * 1.0 + music * 0.0 * duck + sfx * .7
mixR = mixL.copy()
out = np.stack([mixL, mixR], 1)
fade = np.ones(N); fl = int(.5 * SR); fade[-fl:] = np.linspace(1, 0, fl); out *= fade[:, None]
pk = np.max(np.abs(out)); out = out / pk * .89
sf.write('audio/mix.wav', out, SR)
print('done', out.shape, 'rms dB', 20 * np.log10(np.sqrt(np.mean(out ** 2))))
