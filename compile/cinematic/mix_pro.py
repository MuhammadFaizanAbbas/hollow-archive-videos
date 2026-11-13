"""Hollow Archive PRO soundtrack (installed by compile/cinematic.sh as tools/mix.py). Based on the Inside Out mixer: narration + soft procedural sound effects + a quiet music bed, all made here with numpy.
No samples, no AI audio, no downloads.

  python3 tools/mix.py [project=.]          → data/mix.wav (48 kHz stereo)

Reads data/cues.json (node tools/capture.mjs cues), data/narration.wav if it exists (voice.py or words.py --audio),
and script.json "music": "bed" (+ optional "music2"/"music2_at" switch at the reveal) (the procedural score, default) · "none" · "audio/your-track.mp3" (your own royalty-free
track, any format ffmpeg reads). The music ducks under the voice.

Sound rules (STYLE.md): every effect is soft and rounded, nothing above ~5 kHz, no ticks / hats / glitches / beeps.
Cue types: whoosh slide pop plop gulp boing bubbles sizzle sparkle thud slam tock zip alarm ding chirp chug stamp inhale heartbeat
  + PRO: swoosh (big cut transition) riser (tension build into a reveal, use dur) impact (deep cinematic hit) boom (sub drop)
         crack (ice / wood crack) splash spray (water hiss, dur) thunder wind_gust tick (clock) page (paper flip) magic
         cash (coins) knock door crowd (gasp/murmur, dur) step (footsteps, dur) glass (shatter) rope (stretch/creak)
script.json "ambience": [{ "type": "wind|rain|crowd|night|fire|city|sea|forest", "from": 0, "to": 12.5, "gain": 1 }, ...]
  continuous beds under a scene (fade in/out 0.4 s). Music adds "story" (curious pizzicato + soft kick, the default for
  tales) and "epic" (big pad + drum hits for war/disaster/heist stories).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile

P = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
SR = 48000
rng = np.random.default_rng(11)
cj = json.loads((P / 'data/cues.json').read_text())
script = json.loads((P / 'script.json').read_text())
DUR = float(cj['duration'])
N = int(DUR * SR) + SR // 10


def lp(x, f, o=2): b, a = signal.butter(o, min(f, SR / 2 - 100) / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f0, f1, o=2): b, a = signal.butter(o, [f0 / (SR / 2), f1 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def db(x): return 10 ** (x / 20)
def tt(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=None):
    """attack a seconds then exponential release over the rest"""
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    rest = n - na; e[na:] = np.exp(-np.linspace(0, r or 5, rest)) if rest > 0 else 1; return e
def sweep(f0, f1, d, shape='exp'):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d) if shape == 'exp' else f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def noise(d): return rng.standard_normal(int(d * SR))


# ---------- the effects ----------
def whoosh(d=0.38, **_):
    n = noise(d); lo, hi = lp(n, 500), lp(n, 2200)
    k = np.sin(np.pi * np.linspace(0, 1, len(n))); x = (lo * (1 - k) + hi * k) * k ** 1.5
    return x / (np.abs(x).max() + 1e-9) * 0.5
def slide(d=1.0, **_):
    n = lp(noise(d), 700); e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 2
    return n / (np.abs(n).max() + 1e-9) * e * 0.35 + sweep(260, 120, d) * e * 0.08
def pop(**_): x = sweep(560, 240, 0.11) * env(int(0.11 * SR), 0.002, 6); return lp(x, 3000) * 0.7
def plop(**_): x = sweep(700, 180, 0.14) * env(int(0.14 * SR), 0.002, 5); return lp(x, 2500) * 0.6
def gulp(**_):
    a = sweep(320, 140, 0.16) * env(int(0.16 * SR), 0.01, 4); b = sweep(240, 90, 0.2) * env(int(0.2 * SR), 0.01, 4)
    x = np.concatenate([a, np.zeros(int(0.04 * SR)), b]); return lp(x, 1800) * 0.8
def boing(**_):
    d = 0.42; t = tt(d); f = 200 * (1 + 0.6 * t / d) * (1 + 0.08 * np.sin(2 * np.pi * 18 * t))
    return lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.004, 4), 2000) * 0.55
def bubbles(d=2.0, **_):
    x = np.zeros(int(d * SR))
    for _ in range(int(d * 7)):
        st = rng.integers(0, max(1, len(x) - int(0.08 * SR))); f = rng.uniform(380, 900); b = sweep(f, f * 1.6, 0.06) * env(int(0.06 * SR), 0.003, 5)
        x[st:st + len(b)] += b * rng.uniform(0.2, 0.5)
    return lp(x, 2500) * 0.5
def sizzle(d=1.0, **_):
    n = bp(noise(d), 1800, 4500); crack = (rng.random(len(n)) < 0.002).astype(float); crack = lp(crack, 300) * 40
    e = np.minimum(1, np.linspace(0, 6, len(n))) * np.linspace(1, 0.2, len(n)); return n * (0.4 + crack) * e * 0.12
def sparkle(d=1.2, **_):
    notes = [784, 880, 1047, 1175, 1319, 1568]; x = np.zeros(int(d * SR) + SR // 2)
    for k, f in enumerate(notes):
        st = int(k * d / len(notes) * SR); n = int(0.4 * SR); t = tt(0.4)
        x[st:st + n] += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(n, 0.004, 6) * 0.22
    return lp(x, 4500)
def thud(**_):
    d = 0.35; t = tt(d); x = np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 30)) * t) * env(len(t), 0.002, 7)
    return x * 0.9 + lp(noise(d), 220) * env(len(t), 0.001, 12) * 0.3
def slam(**_):
    d = 0.5; t = tt(d); x = np.sin(2 * np.pi * (60 + 60 * np.exp(-t * 25)) * t) * env(len(t), 0.002, 6)
    return np.tanh(1.6 * (x + lp(noise(d), 1200) * env(len(t), 0.001, 10) * 0.6)) * 0.9
def tock(**_): d = 0.09; t = tt(d); return (np.sin(2 * np.pi * 420 * t) + 0.3 * np.sin(2 * np.pi * 840 * t)) * env(len(t), 0.001, 9) * 0.35
def zip_(**_):
    d = 0.32; n = bp(noise(d), 400, 3000); k = np.linspace(0, 1, len(n))
    return (n / (np.abs(n).max() + 1e-9) * 0.35 + sweep(300, 1100, d) * 0.12) * np.sin(np.pi * k) ** 1.2
def alarm(d=2.0, **_):
    x = np.zeros(int(d * SR)); one = np.sin(2 * np.pi * 150 * tt(0.22)) * env(int(0.22 * SR), 0.02, 5)
    for st in np.arange(0, d - 0.25, 0.5): i = int(st * SR); x[i:i + len(one)] += one
    return lp(x, 900) * 0.55

def inhale(d=1.0, **_):
    n = bp(noise(d), 300, 2600); k = np.linspace(0, 1, len(n)); e = np.sin(np.pi * np.minimum(1, k * 1.15)) ** 1.5 * (0.6 + 0.4 * k)
    return n / (np.abs(n).max() + 1e-9) * e * 0.5
def heartbeat(**_):
    one = lambda d, f: np.sin(2 * np.pi * f * tt(d)) * env(int(d * SR), 0.004, 7)
    x = np.concatenate([one(0.16, 58), np.zeros(int(0.09 * SR)), one(0.2, 52) * 0.75]); return lp(x, 300) * 1.0

def ding(**_):
    t = tt(1.4); x = sum(np.sin(2 * np.pi * f * t) * g for f, g in [(1318, 1), (2637, 0.35), (3951, 0.12)]) * env(len(t), 0.002, 4); return x * 0.5
def chirp(d=1.0, **_):
    x = np.zeros(int(d * SR))
    for k, st in enumerate(np.arange(0, d - 0.12, 0.17)):
        i = int(st * SR); c = sweep(3200 + (k % 3) * 300, 4400, 0.08) * env(int(0.08 * SR), 0.004, 6); x[i:i + len(c)] += c[:len(x) - i] * (0.6 + 0.4 * rng.random())
    return x * 0.4
def chug(d=2.0, **_):
    x = np.zeros(int(d * SR)); one = bp(noise(0.14), 200, 1600) * env(int(0.14 * SR), 0.005, 6)
    for k, st in enumerate(np.arange(0, d - 0.15, 0.22)): i = int(st * SR); x[i:i + len(one)] += one * (1 if k % 2 == 0 else 0.6)
    return x * 0.7
def stampit(**_):
    t = tt(0.18); x = np.sin(2 * np.pi * 95 * t) * env(len(t), 0.001, 10) + bp(noise(0.18), 1500, 5000) * env(len(t), 0.001, 14) * 0.6; return x * 0.9


# ---------- PRO effects ----------
def swoosh(d=0.55, **_):
    n = noise(d); k = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 2; f = np.linspace(0, 1, len(n))
    x = lp(n, 900) * (1 - f) + bp(n, 800, 6000) * f; x = x * k; return x / (np.abs(x).max() + 1e-9) * 0.8
def riser(d=1.4, **_):
    t = tt(d); n = bp(noise(d), 600, 7000) * (t / d) ** 2; tone = sweep(110, 880, d) * (t / d) ** 2 * 0.35
    x = n + tone; x[-int(0.02 * SR):] *= np.linspace(1, 0, int(0.02 * SR)); return x / (np.abs(x).max() + 1e-9)
def impact(**_):
    d = 1.6; t = tt(d); sub = np.sin(2 * np.pi * (55 * np.exp(-t * 2.5) + 30) * t) * np.exp(-t * 2.2)
    crack_ = bp(noise(d), 800, 6000) * np.exp(-t * 18) * 0.6; tail = lp(noise(d), 400) * np.exp(-t * 3) * 0.25
    return sub + crack_ + tail
def boom(**_): d = 2.0; t = tt(d); return np.sin(2 * np.pi * (70 * np.exp(-t * 1.5) + 28) * t) * np.exp(-t * 1.6)
def crack(**_):
    x = np.zeros(int(0.5 * SR))
    for k in range(7): i = int(rng.random() * 0.25 * SR); c = bp(noise(0.05), 1500, 8000) * env(int(0.05 * SR), 0.001, 14); x[i:i + len(c)] += c * (0.5 + 0.5 * rng.random())
    return x + lp(noise(0.5), 300) * env(int(0.5 * SR), 0.002, 8) * 0.3
def splash(**_): d = 0.8; return bp(noise(d), 300, 6000) * env(int(d * SR), 0.004, 5) + lp(noise(d), 250) * env(int(d * SR), 0.002, 9) * 0.5
def spray(d=1.5, **_): n = bp(noise(d), 2000, 9000); e = np.minimum(1, tt(d) / 0.08) * np.minimum(1, (d - tt(d)) / 0.2); return n * e * 0.6
def thunder(**_):
    d = 3.0; t = tt(d); x = lp(noise(d), 600) * (np.exp(-t * 1.2) + 0.6 * np.exp(-((t - 0.4) ** 2) * 20)); return x + bp(noise(d), 1000, 5000) * np.exp(-t * 12) * 0.5
def wind_gust(d=2.0, **_): n = bp(noise(d), 200, 1400); e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 1.5; return n * e
def tick(**_): t = tt(0.05); return bp(noise(0.05), 2500, 8000) * env(len(t), 0.0005, 18) + np.sin(2 * np.pi * 1800 * t) * env(len(t), 0.0005, 25) * 0.5
def page(**_): d = 0.35; n = bp(noise(d), 1500, 7000); return n * np.sin(np.pi * np.linspace(0, 1, len(n))) ** 3
def magic(d=1.2, **_):
    x = np.zeros(int(d * SR))
    for k in range(14): i = int(k / 14 * (d - 0.3) * SR); f = 1200 * 2 ** (k / 7); c = np.sin(2 * np.pi * f * tt(0.3)) * env(int(0.3 * SR), 0.002, 7); x[i:i + len(c)] += c * 0.4
    return x + bp(noise(d), 4000, 9000) * np.linspace(1, 0, int(d * SR)) * 0.2
def cash(**_):
    x = np.zeros(int(0.9 * SR))
    for k in range(9): i = int(k * 0.07 * SR); f = 2400 + rng.random() * 2600; c = (np.sin(2 * np.pi * f * tt(0.25)) + 0.5 * np.sin(2 * np.pi * f * 1.5 * tt(0.25))) * env(int(0.25 * SR), 0.001, 10); x[i:i + len(c)] += c * 0.4
    return x
def knock(**_):
    x = np.zeros(int(0.7 * SR)); one = lp(noise(0.06), 900) * env(int(0.06 * SR), 0.001, 12) + np.sin(2 * np.pi * 140 * tt(0.06)) * env(int(0.06 * SR), 0.001, 10)
    for st in (0, 0.18, 0.36): i = int(st * SR); x[i:i + len(one)] += one
    return x
def door(**_): d = 0.9; t = tt(d); creak = np.sin(2 * np.pi * np.cumsum(300 + 80 * np.sin(t * 9)) / SR) * np.sin(np.pi * t / d) * 0.3; return lp(creak, 3000) + np.concatenate([np.zeros(int(0.7 * SR)), thud()[:int(0.2 * SR)]])[:len(t)] * 0.6
def crowd(d=1.6, **_): n = sum(bp(noise(d), f, f * 1.6) * (0.5 + 0.5 * np.sin(tt(d) * (3 + k) + k)) for k, f in enumerate([300, 450, 700, 1100])); e = np.sin(np.pi * np.linspace(0, 1, len(n))); return n * e
def step(d=1.2, **_):
    x = np.zeros(int(d * SR)); one = lp(noise(0.08), 700) * env(int(0.08 * SR), 0.002, 9)
    for k, st in enumerate(np.arange(0, d - 0.1, 0.32)): i = int(st * SR); x[i:i + len(one)] += one * (1 if k % 2 else 0.8)
    return x
def glass(**_):
    x = np.zeros(int(1.0 * SR))
    for k in range(20): i = int(rng.random() * 0.5 * SR); f = 3000 + rng.random() * 5000; c = np.sin(2 * np.pi * f * tt(0.2)) * env(int(0.2 * SR), 0.001, 12); x[i:i + len(c)] += c * 0.3
    return x + bp(noise(1.0), 2000, 9000) * env(int(SR), 0.001, 10) * 0.6
def rope(d=1.0, **_): t = tt(d); return lp(np.sin(2 * np.pi * np.cumsum(180 + 120 * t / d + 15 * np.sin(t * 40)) / SR) * np.sin(np.pi * t / d), 2500) * 0.5

def amb(kind, d):
    n = int(d * SR); t = np.arange(n) / SR
    if kind == 'wind': x = bp(rng.standard_normal(n), 150, 1200) * (0.6 + 0.4 * np.sin(t * 0.7) * np.sin(t * 0.23 + 1))
    elif kind == 'rain': x = bp(rng.standard_normal(n), 1200, 9000) * 0.7 + lp(rng.standard_normal(n), 300) * 0.3
    elif kind == 'crowd': x = sum(bp(rng.standard_normal(n), f, f * 1.5) * (0.6 + 0.4 * np.sin(t * (1.1 + k * 0.3) + k)) for k, f in enumerate([250, 400, 650, 1000]))
    elif kind == 'night':
        x = lp(rng.standard_normal(n), 200) * 0.2
        for st in np.arange(0, d, 0.9): i = int(st * SR); c = np.sin(2 * np.pi * 4200 * tt(0.25)) * (np.sin(2 * np.pi * 30 * tt(0.25)) > 0) * env(int(0.25 * SR), 0.01, 3) * 0.25; x[i:i + len(c)] += c[:max(0, n - i)]
    elif kind == 'fire': x = lp(rng.standard_normal(n), 500) * 0.5 + (rng.random(n) > 0.9993) * bp(rng.standard_normal(n), 1500, 6000) * 6
    elif kind == 'sea': x = lp(rng.standard_normal(n), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * t / 6) ** 2)
    elif kind == 'forest': x = lp(rng.standard_normal(n), 900) * 0.25 + sum(np.sin(2 * np.pi * (3000 + 500 * k) * t) * (np.sin(t * (2 + k)) > 0.97) * 0.15 for k in range(3))
    elif kind == 'city': x = lp(rng.standard_normal(n), 400) * 0.6 + bp(rng.standard_normal(n), 500, 2000) * 0.2
    else: return None
    e = np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4); return x * e

def music_story():
    """curious, light storytelling bed: pizzicato arpeggio + soft kick + shaker, 104 BPM, minor-major lilt"""
    bpm = 104; beat = 60 / bpm; x = np.zeros(N)
    prog = [[220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7], [164.8, 207.7, 246.9]]
    piz = lambda f, g: (np.sin(2 * np.pi * f * tt(0.25)) + 0.3 * np.sin(4 * np.pi * f * tt(0.25))) * env(int(0.25 * SR), 0.002, 12) * g
    for k in range(int(DUR / (beat / 2)) + 2):
        ch = prog[(k // 16) % 4]; i = int(k * beat / 2 * SR)
        p = piz(ch[[0, 2, 1, 2, 0, 1, 2, 1][k % 8]] * (2 if k % 4 == 3 else 1), 0.16)
        if i + len(p) < N: x[i:i + len(p)] += p
        if k % 4 == 0:
            kd = 0.25; kk = np.sin(2 * np.pi * (60 * np.exp(-tt(kd) * 18) + 45) * tt(kd)) * env(int(kd * SR), 0.001, 9) * 0.5
            if i + len(kk) < N: x[i:i + len(kk)] += kk
            b = (np.sin(2 * np.pi * ch[0] / 2 * tt(beat * 2))) * env(int(beat * 2 * SR), 0.01, 3) * 0.18
            if i + len(b) < N: x[i:i + len(b)] += b
        if k % 2 == 1:
            sh = bp(noise(0.06), 5000, 10000) * env(int(0.06 * SR), 0.002, 10) * 0.08
            if i + len(sh) < N: x[i:i + len(sh)] += sh
    fade = np.ones(N); fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo)
    return x / (np.abs(x).max() + 1e-9) * fade

def music_epic():
    """cinematic: wide low pad + big drum hits every bar, 90 BPM, minor"""
    t = np.arange(N) / SR; x = np.zeros(N); beat = 60 / 90; bar = beat * 4
    chords = [[110.0, 130.8, 164.8], [87.3, 110.0, 130.8], [98.0, 123.5, 146.8], [82.4, 103.8, 123.5]]
    for b in range(int(DUR / bar) + 1):
        ch = chords[b % 4]; st = int(b * bar * SR); n = int(bar * SR); tb = tt(bar)
        pad = sum(np.sin(2 * np.pi * f * tb) + 0.4 * np.sin(2 * np.pi * f * 2.003 * tb) + 0.2 * np.sin(2 * np.pi * f * 3 * tb) for f in ch)
        pad *= np.minimum(1, tb / 0.6) * np.minimum(1, (bar - tb) / 0.6) * 0.12
        if st < N: x[st:st + n] += pad[:max(0, min(n, N - st))]
        for hb in (0, 2.5):
            i = st + int(hb * beat * SR); dr = np.sin(2 * np.pi * (80 * np.exp(-tt(0.6) * 6) + 40) * tt(0.6)) * env(int(0.6 * SR), 0.001, 5) * 0.6 + lp(noise(0.6), 900) * env(int(0.6 * SR), 0.001, 12) * 0.3
            if i + len(dr) < N: x[i:i + len(dr)] += dr
    x = lp(x, 5000); fade = np.ones(N); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo)
    return x / (np.abs(x).max() + 1e-9) * fade

def voice_chain(v):
    """broadcast voice: rumble cut, presence lift, smooth compression (like the big storytelling channels)"""
    m = v.mean(1); m = hp(m, 85); m = m + 0.35 * bp(m, 2000, 5000) + 0.15 * bp(m, 150, 300)
    a = np.abs(m); env_ = signal.lfilter([1 - 0.999], [1, -0.999], a); thr = np.percentile(env_[env_ > 1e-4], 60) if np.any(env_ > 1e-4) else 1
    gain = np.where(env_ > thr, (thr / (env_ + 1e-9)) ** 0.6, 1.0); m = m * gain
    return np.stack([m, m], 1)

FX = dict(swoosh=swoosh, riser=riser, impact=impact, boom=boom, crack=crack, splash=splash, spray=spray, thunder=thunder, wind_gust=wind_gust, tick=tick, page=page, magic=magic, cash=cash, knock=knock, door=door, crowd=crowd, step=step, glass=glass, rope=rope,
          ding=ding, chirp=chirp, chug=chug, stamp=stampit, inhale=inhale, heartbeat=heartbeat, whoosh=whoosh, slide=slide, pop=pop, plop=plop, gulp=gulp, boing=boing, bubbles=bubbles, sizzle=sizzle,
          sparkle=sparkle, thud=thud, slam=slam, tock=tock, zip=zip_, alarm=alarm)
LEVEL = dict(swoosh=-15, riser=-16, impact=-9, boom=-10, crack=-13, splash=-14, spray=-20, thunder=-11, wind_gust=-19, tick=-17, page=-17, magic=-16, cash=-15, knock=-13, door=-14, crowd=-19, step=-18, glass=-13, rope=-17,
             ding=-17, chirp=-19, chug=-20, stamp=-12, inhale=-15, heartbeat=-8, whoosh=-17, slide=-19, pop=-14, plop=-15, gulp=-11, boing=-15, bubbles=-21, sizzle=-18, sparkle=-17,
             thud=-11, slam=-9, tock=-18, zip=-14, alarm=-17)


# ---------- the music bed: soft pad + plucked arpeggio, 100 BPM, I–vi–IV–V ----------
def music_bed():
    bpm = 100; beat = 60 / bpm; bar = beat * 4
    chords = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]]
    x = np.zeros(N)
    nb = int(np.ceil(DUR / bar)) + 1
    for b in range(nb):
        ch = chords[b % 4]; st = int(b * bar * SR); n = int(bar * SR)
        if st >= N: break
        t = tt(bar); e = np.minimum(1, t / 0.4) * np.minimum(1, (bar - t) / 0.4)
        pad = sum(np.sin(2 * np.pi * f / 2 * t) + 0.25 * np.sin(2 * np.pi * f * t) for f in ch) * e * 0.10
        x[st:st + n] += pad[:max(0, min(n, N - st))]
        for k in range(8):                                                       # eighth-note pluck arpeggio
            f = ch[[0, 1, 2, 1, 2, 0, 1, 2][k]] * (2 if k % 4 == 2 else 1); ps = st + int(k * beat / 2 * SR); pn = int(0.5 * SR)
            if ps + pn >= N: continue
            pt = tt(0.5); pl = (np.sin(2 * np.pi * f * pt) + 0.35 * np.sin(4 * np.pi * f * pt)) * env(pn, 0.003, 7) * 0.12
            x[ps:ps + pn] += pl
    x = lp(x, 3200)
    fade = np.ones(N); fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo)
    return x / (np.abs(x).max() + 1e-9) * fade

def music_bounce():
    """light comedy: oom-pah bass + staccato plucked melody, 118 BPM, major (script.json "music": "bounce")"""
    bpm = 118; beat = 60 / bpm; x = np.zeros(N)
    prog = [(130.8, [261.6, 329.6, 392.0]), (174.6, [261.6, 349.2, 440.0]), (196.0, [246.9, 293.7, 392.0]), (130.8, [261.6, 329.6, 392.0])]
    mel = [0, 2, 1, 2, 0, 1, 2, 1]
    pl = lambda f, d, g: (np.sin(2 * np.pi * f * tt(d)) + 0.4 * np.sin(4 * np.pi * f * tt(d)) + 0.15 * np.sin(6 * np.pi * f * tt(d))) * env(int(d * SR), 0.003, 9) * g
    for k in range(int(DUR / beat) + 1):
        bass, ch = prog[(k // 8) % 4]; i = int(k * beat * SR)
        b = pl(bass if k % 2 == 0 else bass * 1.5, 0.3, 0.35) if k % 2 == 0 else pl(ch[0] / 2 * 1.5, 0.22, 0.18)
        if i + len(b) < N: x[i:i + len(b)] += b
        if k % 2 == 1:
            c = sum(pl(f, 0.16, 0.07) for f in ch)
            if i + len(c) < N: x[i:i + len(c)] += c
        f = ch[mel[k % 8]] * 2; m = pl(f, 0.18, 0.09); j = i + int(beat / 2 * SR) if k % 4 == 3 else i
        if j + len(m) < N and k % 8 not in (3, 7): x[j:j + len(m)] += m
    x = lp(x, 4200); fade = np.ones(N); fo = int(1.2 * SR); fade[-fo:] = np.linspace(1, 0, fo)
    return x / (np.abs(x).max() + 1e-9) * fade

def music_tension():
    """low drone + slow minor pulse, for mysterious / tense explainers (script.json "music": "tension")"""
    t = np.arange(N) / SR; x = np.zeros(N)
    for f, g in [(55, 0.5), (82.4, 0.3), (110, 0.2), (130.8, 0.12)]: x += np.sin(2 * np.pi * f * t + np.sin(t * 0.3) * 0.5) * g
    x *= 0.55 + 0.45 * np.sin(2 * np.pi * t / 8) ** 2
    beat = 60 / 84; ping = lambda f: (np.sin(2 * np.pi * f * tt(1.2)) + 0.3 * np.sin(4 * np.pi * f * tt(1.2))) * env(int(1.2 * SR), 0.01, 5)
    seq = [220.0, 261.6, 196.0, 174.6]
    for k in range(int(DUR / (beat * 2))):
        i = int(k * beat * 2 * SR); pg = ping(seq[(k // 2) % 4]) * 0.35
        if i + len(pg) < N: x[i:i + len(pg)] += pg
    x = lp(x, 2200); fade = np.ones(N); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo); fi = int(0.8 * SR); fade[:fi] *= np.linspace(0, 1, fi)
    return x / (np.abs(x).max() + 1e-9) * fade

def load_audio(f):
    out = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(f), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(out, dtype=np.float32).reshape(-1, 2).astype(np.float64); return a


mix = np.zeros((N, 2))
# voice
vf = P / 'data/narration.wav'
voice = None
if vf.exists():
    v = load_audio(vf)[:N]; voice = np.zeros((N, 2)); voice[:len(v)] = v; voice = voice_chain(voice)
    rms = np.sqrt(np.mean(voice ** 2) + 1e-12); voice *= db(-16) / rms
    mix += voice
# music
mus = script.get('music', 'bed')
if mus and mus != 'none':
    m = {'bed': music_bed, 'tension': music_tension, 'bounce': music_bounce, 'story': music_story, 'epic': music_epic}.get(mus, lambda: None)()
    if m is None:
        a = load_audio(P / mus)[:N]; m = np.zeros(N); m[:len(a)] = a.mean(1); m /= np.abs(m).max() + 1e-9
    # optional switch at the reveal: script.json "music2": "story", "music2_at": <seconds> (0.25 s crossfade)
    m2n, at = script.get('music2'), script.get('music2_at')
    if m2n and at is not None:
        m2 = {'bed': music_bed, 'tension': music_tension, 'bounce': music_bounce, 'story': music_story, 'epic': music_epic}.get(m2n, lambda: None)()
        if m2 is not None:
            m2 = m2[:N] if len(m2) >= N else np.pad(m2, (0, N - len(m2)))
            m = m[:N] if len(m) >= N else np.pad(m, (0, N - len(m)))
            i = int(float(at) * SR); f = int(0.25 * SR); w = np.zeros(N); w[i:] = 1
            w[max(0, i - f):i] = np.linspace(0, 1, i - max(0, i - f)); m = m * (1 - w) + m2 * w * 1.15
    m = np.stack([m, m], 1) * db(-21 if voice is not None else -18)
    if voice is not None:                                                        # duck under the voice
        lev = np.abs(voice.mean(1)); lev = signal.lfilter([1 - 0.9995], [1, -0.9995], lev); lev /= lev.max() + 1e-9
        m *= (1 - 0.45 * np.clip(lev * 3, 0, 1))[:, None]
    mix += m
# ambience beds
for a in script.get('ambience', []):
    i0, i1 = int(a.get('from', 0) * SR), int(min(a.get('to', DUR), DUR) * SR)
    x = amb(a['type'], (i1 - i0) / SR)
    if x is None or i1 <= i0: continue
    x = x / (np.abs(x).max() + 1e-9) * db(-27) * a.get('gain', 1.0); n = min(len(x), N - i0); mix[i0:i0 + n] += np.stack([x[:n], x[:n]], 1)
# effects
for c in cj['cues']:
    fn = FX.get(c['type'])
    if not fn: print('unknown cue type, skipped:', c['type']); continue
    x = fn(**({'d': c['dur']} if c.get('dur') else {}))
    x = lp(x, 9500) * db(LEVEL[c['type']]) * c.get('gain', 1.0) / (np.abs(x).max() + 1e-9) * 0.9
    i = int(c['t'] * SR); n = min(len(x), N - i)
    if n > 0 and i >= 0: pan = c.get('pan', 0.0); mix[i:i + n, 0] += x[:n] * (1 - max(0, pan)); mix[i:i + n, 1] += x[:n] * (1 + min(0, pan))
# master: gentle soft-clip, peak -1 dBFS
r = np.sqrt(np.mean(mix ** 2) + 1e-12); mix *= db(-15) / r
mix = np.tanh(mix * 1.1) / 1.1
mix *= min(1.0, db(-1) / (np.abs(mix).max() + 1e-9))
wavfile.write(P / 'data/mix.wav', SR, (mix * 32767).astype(np.int16))
print(f"data/mix.wav: {DUR:.2f} s · voice: {'yes' if voice is not None else 'NO (captions-only)'} · music: {mus} · {len(cj['cues'])} cues")
