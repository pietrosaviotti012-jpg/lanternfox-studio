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

sfx = np.zeros(N)
whips = [3.2, 6.25, 9.45, 10.4, 13.3, 14.6, 16.65, 19.65, 21.4, 22.6, 26.95, 28.15, 30.45, 34.2]
for w in whips: place(sfx, whoosh(.36), w - .22, .35)
def rumble(dur, f=45):
    n = int(dur * SR); t = T(n); x = lp(rng.standard_normal(n), 160, 2) * 2 + np.sin(2 * np.pi * f * t) * .3
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.2
def crackle(dur, dens=14):
    out = np.zeros(int(dur * SR))
    for i in range(int(dur * dens)): place(out, tick() * (.3 + rng.random() * .5), rng.random() * dur)
    return out
def noise_hit(dur=.25, f=900):
    n = int(dur * SR); return hp(rng.standard_normal(n), f) * np.exp(-T(n) * 20) * .5
def engine(dur, f=38, rough=0.0, fade_in=.3, fade_out=.3):
    # piston-engine drone: buzzy low tone with prop beat
    n = int(dur * SR); t = T(n)
    ph = np.cumsum(f * (1 + .01 * np.sin(2 * np.pi * .7 * t)) * (1 + rough * .2 * np.sin(2 * np.pi * 3 * t))) / SR
    x = lp(np.sign(np.sin(2 * np.pi * ph)) * .5 + (2 * (ph * 2 % 1) - 1) * .3, 500) + lp(rng.standard_normal(n), 300) * .5
    x *= .7 + .3 * np.sin(2 * np.pi * f * .5 * t) ** 2
    e = np.minimum(1, t / fade_in) * np.minimum(1, (dur - t) / fade_out)
    return x * e * .6
def static(dur, k0=.3, k1=1.0):
    n = int(dur * SR); t = T(n); return bp(rng.standard_normal(n), 1200, 6000) * np.linspace(k0, k1, n) * (.6 + .4 * (rng.random(n) > .7)) * .35
def beeps(dur, f=900, k0=1, k1=.1):
    out = np.zeros(int(dur * SR)); i = 0
    while i * .11 < dur - .1:
        g = k0 + (k1 - k0) * (i * .11 / dur); n = int(.06 * SR); t = T(n)
        if (i % 4) != 3: place(out, np.sin(2 * np.pi * f * t) * np.minimum(1, t / .004) * np.minimum(1, (.06 - t) / .004) * .3 * g, i * .11)
        i += 1
    return out
# A: formation flies off
place(sfx, engine(2.9, 42), 0, .55); place(sfx, whoosh(1.2, False), 1.4, .3); place(sfx, pop(700), 2.75, .45); place(sfx, boing(260, .4), 2.78, .3)
# B1: calendar pops, engines start up
place(sfx, pop(800), 3.45, .5); place(sfx, sparkle_sfx(), 3.55, .25)
for i in range(3): place(sfx, engine(1.6 - i * .3, 34 + i * 3, .5, .15), 4.8 + i * .3, .3)
for i in range(12): place(sfx, thud(160 + (i % 2) * 25, .07, .2), 3.3 + i * .2)
# B2: take-off roll, signpost
place(sfx, engine(3.3, 40, 0, .2), 6.2, .6); place(sfx, riser(2.0) * .5, 7.0, .35); place(sfx, pop(600), 7.9, .45)
# C: fourteen men pop in
for i in range(14): place(sfx, pop(700 + i * 40), 9.47 + i * .025, .18)
place(sfx, chime(1046, .8), 9.5, .25)
# D: radio call, compass spins
place(sfx, engine(2.9, 46, .2), 10.4, .25); place(sfx, static(2.5, .4, .4), 10.9, .35)
place(sfx, boing(340, .5), 11.9, .35); for_ = [place(sfx, tick() * .6, 11.9 + i * .07) for i in range(14)]
# E: question marks
for i, d in enumerate([.1, .35, .6]): place(sfx, pop(600 + i * 150), 13.3 + d, .4)
# F: radio fades, static grows
place(sfx, beeps(2.0, 880, 1, .05), 14.65, .5); place(sfx, static(2.0, .1, .9), 14.65, .5)
# G: storm, sputter, engine dies
place(sfx, rumble(3.0, 40), 16.65, .5); place(sfx, waves(3.0), 16.65, .5)
place(sfx, engine(2.6, 40, 1.0, .1, .05), 16.7, .35)
for i in range(4): place(sfx, thud(90, .1, .5), 18.6 + i * .17)
place(sfx, boing(150, .6), 19.27, .35); place(sfx, noise_hit(.3, 500), 19.27, .4)
# H: empty sea, magnifier swipe
place(sfx, waves(1.8), 19.65, .4); place(sfx, whoosh(.9), 19.8, .25); place(sfx, pop(500), 20.9, .4)
# I: but it got stranger
place(sfx, heartbeat(), 21.5, .5); place(sfx, chime(660, 1.0) * .7, 21.7, .3)
# J: the Mariner starts and takes off
place(sfx, waves(4.3), 22.6, .3); place(sfx, engine(3.8, 36, 0, 1.2), 23.1, .5); place(sfx, pop(700), 23.3, .45)
place(sfx, pop(800), 24.85, .5); place(sfx, sparkle_sfx(), 24.9, .2); place(sfx, riser(1.8) * .5, 25.0, .3)
# K: vanished
place(sfx, engine(.6, 38, 0, .05, .2), 26.95, .3); place(sfx, whoosh(.5, False), 27.4, .35); place(sfx, pop(500), 27.6, .45)
# L: ship at sea, flames on the horizon
place(sfx, waves(2.3), 28.15, .45); place(sfx, crackle(1.1, 10), 29.3, .4); place(sfx, rumble(1.2, 50), 29.25, .35)
place(sfx, boing(300, .4), 29.4, .3)
# M: map, route, the triangle
for i in range(6): place(sfx, scribble(.12), 30.7 + i * .22, .35)
place(sfx, pop(700), 32.0, .45); place(sfx, riser(1.0) * .6, 32.6, .35)
for i in range(3): place(sfx, scribble(.25), 32.85 + i * .3, .45)
place(sfx, chime(440, 1.2) * .8, 33.75, .3)
# N: the stamp
place(sfx, whoosh(.3), 35.5, .3); place(sfx, thud(50, .6, 1.2), 35.76); place(sfx, noise_hit(.3, 400), 35.76, .6)
# O: payoff
place(sfx, engine(4.5, 40, 0, .5, 1.5), 36.95, .2); place(sfx, pop(700), 37.5, .45); place(sfx, boing(260, .4), 37.53, .3)
place(sfx, pop(900), 39.45, .5); place(sfx, sparkle_sfx(), 39.55, .35)

# ---------------- music (procedural sea-shanty jig, D minor, 6/8) ----------------
BPM = 132  # dotted-quarter = beat; eighth = 60/BPM/... use eighth duration
E8 = 60 / BPM / 2 * 1.0  # eighth note seconds (6/8 feel)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def saw_pad(f, dur, g=.2):
    n = int(dur * SR); t = T(n); vib = 1 + .004 * np.sin(2 * np.pi * 5.5 * t)
    ph = np.cumsum(f * vib) / SR; x = 2 * (ph % 1) - 1 + .6 * (2 * ((ph * 1.005) % 1) - 1)
    x = lp(x, 1400); e = np.minimum(1, t / .06) * np.minimum(1, (dur - t) / .08)
    return x * e * g
mel = [62, 65, 69, 67, 65, 64, 62, 64, 65, 64, 62, 61, 62, 65, 69, 72, 70, 69, 67, 65, 64, 62, 61, 62]  # 24 eighths = 4 bars of 6/8
chords = [(50, 57, 62, 65), (48, 55, 60, 64), (46, 53, 58, 62), (45, 52, 57, 61)]
plk_cache = {}
def plk(m, dur):
    k = (m, round(dur, 2))
    if k not in plk_cache: plk_cache[k] = pluck(midi(m), dur)
    return plk_cache[k]
music = np.zeros(N)
def jig(t0, t1, g=1.0, mel_on=True, bass_on=True, pad_on=True, drum=True, mel_g=.55):
    t = t0; i = 0
    while t < t1:
        bar = (i // 6) % 4; ch = chords[bar]
        if bass_on and i % 6 == 0: place(music, plk(ch[0] - 12, E8 * 6) * .7, t, g)
        if pad_on and i % 6 == 0:
            for m in ch[1:]: place(music, saw_pad(midi(m), min(E8 * 6, t1 - t)), t, g * .25)
        if mel_on and i % 3 == 0: place(music, plk(mel[i % 24], E8 * 3) * .8, t, g * mel_g)
        # light percussion: frame drum on 1 and 4
        if drum and i % 6 == 0: place(music, thud(100, .12, .15), t, g)
        t += E8; i += 1
def drone(t0, t1, g=1.0):
    n = int((t1 - t0) * SR); t = T(n)
    x = (np.sin(2 * np.pi * 73.4 * t) + .5 * np.sin(2 * np.pi * 110 * t + 1) + .3 * np.sin(2 * np.pi * 146.8 * t * 1.003)) * (0.7 + .3 * np.sin(2 * np.pi * .3 * t))
    x *= np.minimum(1, t / .4) * np.minimum(1, (t1 - t0 - t) / .4)
    place(music, x * .25, t0, g)
# ---- whimsical comedic underscore (replaces jig) ----
music = np.zeros(N)
BEAT = 60 / 104
def pizz(m, dur=.45, g=1.0):
    k = ('pz', m, round(dur, 2))
    if k not in plk_cache:
        x = pluck(midi(m), dur); n = len(x); t = T(n)
        x = bp(x, 180, 3500) * np.exp(-t * 7) + bp(rng.standard_normal(n), 1500, 5000) * np.exp(-t * 300) * .15
        plk_cache[k] = x / (np.max(np.abs(x)) + 1e-9)
    return plk_cache[k] * g
def glock(m, dur=1.2, g=1.0):
    n = int(dur * SR); t = T(n); f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12))
    return x * np.exp(-t * 3.5) * np.minimum(1, t / .002) * .5 * g
def reed(m, dur=.22, g=1.0):
    n = int(dur * SR); t = T(n); f = midi(m); ph = (f * t) % 1
    x = lp(np.sign(np.sin(2 * np.pi * ph)) * .6 + (2 * ph - 1) * .4, 900)
    return x * np.minimum(1, t / .015) * np.exp(-t * 6) * np.minimum(1, (dur - t) / .03) * .5 * g
def strings(ms, dur, g=1.0):
    n = int(dur * SR); t = T(n); x = np.zeros(n)
    for m in ms:
        for d in (-.004, 0, .005):
            ph = np.cumsum(midi(m) * (1 + d) * (1 + .003 * np.sin(2 * np.pi * 5 * t))) / SR; x += 2 * (ph % 1) - 1
    x = lp(x / (len(ms) * 3), 1100); e = np.minimum(1, t / .5) * np.minimum(1, (dur - t) / .5)
    return x * e * g
# progressions (root, chord tones) in midi
DM = [(38, (62, 65, 69)), (43, (62, 67, 71)), (38, (62, 65, 69)), (45, (61, 64, 67))]   # Dm G Dm A7
DMAJ = [(38, (62, 66, 69)), (43, (62, 67, 71)), (45, (61, 64, 69)), (38, (62, 66, 69))]  # D G A D
motif = [(0, 74), (.5, 77), (1, 81), (2, 79), (2.5, 77), (3, 76)]  # glock line over 1 bar
def playful(t0, t1, prog, g=1.0, glock_on=True, stabs=True):
    t = t0; bar = 0
    while t < t1 - .05:
        root, ch = prog[bar % 4]
        place(music, pizz(root, .5, .9), t, g); place(music, pizz(root + 7, .5, .7), t + 2 * BEAT, g)
        if stabs:
            for bt in (1, 3): 
                for m in ch: place(music, pizz(m - 12, .3, .28), t + bt * BEAT, g)
        if glock_on and bar % 2 == 0:
            for (bt, m) in motif:
                mm = m if prog is DM else m + (1 if m % 12 in (5,) else 0)
                if t + bt * BEAT < t1: place(music, glock(mm, 1.0, .35), t + bt * BEAT, g)
        t += 4 * BEAT; bar += 1
def sneak(t0, t1, g=1.0):
    steps = [38, 38, 41, 40, 39, 38, 36, 37]
    t = t0; i = 0
    while t < t1 - .05:
        place(music, reed(steps[i % 8] + 12, .2, .8), t, g); place(music, pizz(steps[i % 8], .35, .6), t, g)
        t += BEAT * (1 if i % 2 == 0 else 1); i += 1
# 0-10.4 the flight sets out: light minor pizz
playful(0, 10.4, DM, .6, glock_on=False)
for (bt, m) in motif: place(music, glock(m, 1.0, .25), 3.4 + bt * BEAT * .5)
# 10.4-16.65 trouble: sneaking low line
sneak(10.4, 16.65, .55)
place(music, strings((50, 56, 62), 6.3, .3), 10.4)
# 16.65-21.4 night and nothing: low strings only
place(music, strings((50, 57, 62, 65), 4.8, .4), 16.65)
# 21.4-30.45 stranger still
place(music, strings((50, 56, 62), 2.0, .35), 21.4)
sneak(22.6, 30.45, .5)
place(music, strings((48, 55, 60, 63), 7.9, .3), 22.6)
# 30.45-36.95 legend and verdict
place(music, strings((50, 57, 62, 65), 6.5, .4), 30.45)
for k in range(10): place(music, pizz([38, 45, 41][k % 3], .6, .5), 30.5 + k * BEAT * 1.4)
# 36.95-end payoff
playful(36.95, 42.0, DM, .75, glock_on=True)
for k, m in enumerate([62, 65, 69, 74]): place(music, glock(m + 12, 1.2, .3), 39.45 + k * .12)
music = lp(music, 6000)

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
mixL = VO * 1.0 + music * .22 * duck + sfx * .7
mixR = mixL.copy()
out = np.stack([mixL, mixR], 1)
fade = np.ones(N); fl = int(.5 * SR); fade[-fl:] = np.linspace(1, 0, fl); out *= fade[:, None]
pk = np.max(np.abs(out)); out = out / pk * .89
sf.write('audio/mix.wav', out, SR)
print('done', out.shape, 'rms dB', 20 * np.log10(np.sqrt(np.mean(out ** 2))))
