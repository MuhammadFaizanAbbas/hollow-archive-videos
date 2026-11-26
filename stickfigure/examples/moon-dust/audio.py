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

def swish(dur=.25):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 600, 3500) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.2 * .8
def dust_fwip(dur=.3):
    n = int(dur * SR); t = T(n); return lp(rng.standard_normal(n), 1500) * np.sin(np.pi * np.clip(t / dur, 0, 1)) * .6
def whine(dur=1.0, f0=500, f1=1400):
    n = int(dur * SR); t = T(n); f = f0 + (f1 - f0) * (t / dur) ** 1.5
    return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 + bp(rng.standard_normal(n), 800, 4000) * .2) * np.minimum(1, t / .05) * np.minimum(1, (dur - t) / .1)
def sad_wah(f=330, dur=1.0):
    n = int(dur * SR); t = T(n); fr = f * (1 - .35 * t / dur) * (1 + .03 * np.sin(2 * np.pi * 6 * t))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 2) * .5
def rumble(dur=1.8):
    n = int(dur * SR); t = T(n); return (lp(rng.standard_normal(n), 220) * 1.2 + np.sin(2 * np.pi * 55 * t) * .4) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** .6
def applause(dur=1.5):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for i in range(int(dur * 22)):
        k = int(rng.uniform(0, n - 900)); m = 800; x[k:k + m] += hp(rng.standard_normal(m), 1500) * np.exp(-np.arange(m) / 120) * rng.uniform(.3, 1)
    return x * .9
def click_sfx():
    n = int(.08 * SR); t = T(n); return hp(rng.standard_normal(n), 2000) * np.exp(-t * 80) * .8
def gasp(dur=.4):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 500, 2800) * (t / dur) ** 1.2 * np.exp(-np.maximum(0, t - dur * .7) * 25) * .7
def stamp_sfx(): return thud(90, .35, 1.0) + clang(1100, .35) * .3
def shimmer(dur=1.4):
    out = np.zeros(int(dur * SR))
    for i, f in enumerate([1568, 1976, 2349, 2637, 3136, 2349]): place(out, chime(f, .6) * .5, i * .13)
    return out
def wind_whoosh(): return whoosh(.8, True)
def scratch(dur=.25):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 800, 5000) * np.sin(np.pi * t / dur) * .6 * (.6 + .4 * np.sin(2 * np.pi * 40 * t))
sfx = np.zeros(N)
whips = [1.44, 3.2, 5.36, 6.96, 10.24, 12.4, 14.64, 16.96, 18.08, 19.44, 23.2, 24.96, 27.12, 28.72, 30.8, 32.16, 35.76, 37.6, 40.32, 41.36]
for w in whips: place(sfx, whoosh(.36), w - .22, .35)
# hook
place(sfx, thud(60, .5, .9), 0.02); place(sfx, stamp_sfx(), 0.05, .5)
# 1 moon colony
place(sfx, chime(1320, .8), 1.9, .3)
# 2 writing + red stamp
for i in range(6): place(sfx, dust_fwip(.2), 4.1 + i * .12, .35)
place(sfx, stamp_sfx(), 4.74, .8)
# 3 smiley + X
for i in range(5): place(sfx, dust_fwip(.18), 5.55 + i * .14, .3)
place(sfx, stamp_sfx(), 6.3, .7)
# 4 nobody tells
place(sfx, pop(520), 7.5, .5); place(sfx, pop(640), 8.2, .4); place(sfx, gasp(.3), 6.9, .3)
# 5 quiet
for i in range(3): place(sfx, tick(), 9.3 + i * .25, .35)
# 6 doodle
place(sfx, pop(560), 10.4, .4); place(sfx, dust_fwip(.4), 11.6, .4)
# 7 bored
place(sfx, sad_wah(300, .8), 13.2, .35); place(sfx, pop(300), 13.75, .5)
# 8 write anyway
for i in range(9): place(sfx, dust_fwip(.22), 15.55 + i * .15, .4)
place(sfx, chime(1500, .8), 16.6, .3)
# 9 reveal
place(sfx, shimmer(1.2), 16.95, .45); place(sfx, thud(70, .5, .9), 16.98)
# 10 amazing
place(sfx, sparkle_sfx(), 18.1, .4); place(sfx, cheer(1.0), 18.2, .25)
# 11 principal runs
place(sfx, gasp(.4), 19.5, .5)
for i, tt in enumerate(np.arange(19.6, 21.2, .2)): place(sfx, thud(110, .15, .35), tt)
place(sfx, boing(260, .4), 21.15, .5)
# 12 sweep
for i in range(10): place(sfx, swish(.2), 21.8 + i * .14, .55)
for i in range(4): place(sfx, dust_fwip(.2), 21.85 + i * .3, .3)
# 13 stared back
place(sfx, thud(55, .5, .9), 23.25); place(sfx, pop(700), 23.3, .5); place(sfx, boing(300, .5), 23.9, .5)
# 14 robot vacuum
place(sfx, whine(1.5, 500, 1500), 25.1, .5); place(sfx, clang(380, .5), 26.7, .5)
# 15 sulk
place(sfx, sad_wah(330, 1.2), 27.2, .6); place(sfx, sad_wah(250, 1.0), 27.8, .4)
# 16 bus
place(sfx, rumble(1.9), 28.75, .6)
for i in range(4): place(sfx, click_sfx(), 30.2 + i * .12, .3)
# 17 clap
place(sfx, applause(1.8), 30.85, .7); place(sfx, cheer(1.4), 30.9, .3); place(sfx, sparkle_sfx(), 31.0, .3)
# 18 why
place(sfx, pop(600), 32.3, .5); place(sfx, pop(520), 33.35, .5)
place(sfx, wind_whoosh(), 33.9, .3); place(sfx, stamp_sfx(), 34.0, .6)
place(sfx, stamp_sfx(), 34.7, .6)
# 19 nothing wipes
place(sfx, shimmer(1.2), 35.9, .35)
# 20 millions of years
place(sfx, riser(1.2), 37.6, .4); place(sfx, thud(55, .6, 1.0), 37.75); place(sfx, chime(1100, 1.0), 37.9, .3)
# 21 eighty
place(sfx, pop(500), 40.4, .5); place(sfx, sparkle_sfx(), 40.5, .3)
# 22 map
place(sfx, pop(680), 41.5, .5); place(sfx, cheer(1.2), 41.8, .3); place(sfx, shimmer(1.2), 42.1, .3)
# end
place(sfx, thud(60, .5, .9), 44.1); place(sfx, stamp_sfx(), 44.2, .5)
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
