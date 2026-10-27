"""Mix a production: python tools/mix.py <production folder>   (needs $LIB, the Lemo-Opuscar library, for sfx.py)

voice (vo/<id>.wav at each line's time) → compressed, high-passed, RMS about −18 dB, forward
music (out/music.wav) → about 10 dB under the voice, ducked 5.5 dB while someone speaks
foley from events.json (each shot's "sfx" list): paper and light sounds, rain, wind, waves, thunder, steps
→ out/mix.wav (48 kHz stereo, peak-limited). The final −14 LUFS is done by Lemo's mux.sh.
"""
import json, os, sys
import numpy as np
import soundfile as sf

LIB = os.environ.get("LIB", os.path.expanduser("~/lemo-opuscar"))
sys.path.insert(0, os.path.join(LIB, "core", "audio"))
import sfx
from sfx import SR, add, compress, limit, lp, hp, bp, noise, brown, norm, t_, env_exp

prod = sys.argv[1]
ev = json.load(open(os.path.join(prod, "events.json")))
DUR = ev["dur"]
N = int((DUR + 1) * SR)
voice = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(5)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-9)

# —— voice ——
for e in ev["ev"]:
    if e["type"] != "line": continue
    x, sr = sf.read(os.path.join(prod, "vo", e["id"] + ".wav"), dtype="float32")
    if x.ndim > 1: x = x.mean(1)
    x = hp(x, 70)
    add(voice, x, e["t"])
v = voice[:, 0] + voice[:, 1]
speech = np.abs(v) > 1e-4
voice[:, 0] = compress(voice[:, 0], thr=.18, ratio=3); voice[:, 1] = compress(voice[:, 1], thr=.18, ratio=3)
active = voice[speech] if speech.any() else voice
voice *= 10 ** (-18 / 20) / rms(active)

# —— foley: paper and light ——
def switch(v=1): d = .08; return norm(bp(noise(d), 1800, 6000) * env_exp(d, .012)) * v
def shimmer(v=1):
    d = 2.2; t = t_(d); x = sum(np.sin(2 * np.pi * f * (1 + .25 * t / d) * t) * np.exp(-((t - k * .25) ** 2) / .05) for k, f in enumerate([1760, 2217, 2637, 3322, 3520, 4434]))
    return norm(x) * np.minimum(1, t / .3) * np.exp(-t / 1.4) * v
def chime(v=1): return sfx.ding(v)
def thunder(v=1):
    d = 4.5; t = t_(d); x = lp(brown(d), 180) * np.minimum(1, t / .05) * np.exp(-t / 1.6)
    crack = hp(noise(d), 1500) * np.exp(-t / .12)
    return norm(x + .5 * crack) * v
def crack(v=1):
    d = 1.6; t = t_(d); x = hp(noise(d), 2500) * np.exp(-t / .08)
    for k in range(14):
        s = int(rng.uniform(.05, 1.1) * SR); f = rng.uniform(3000, 7000); L = int(.12 * SR)
        if s + L < len(x): x[s:s + L] += np.sin(2 * np.pi * f * t[:L]) * np.exp(-t[:L] / .03) * rng.uniform(.2, .5)
    return norm(x) * v
def bed(d, lo, hi, swell, v):
    t = t_(d); x = bp(noise(d), lo, hi) * (1 + .5 * np.sin(2 * np.pi * t / swell + rng.uniform(0, 6)))
    return norm(x) * np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5) * v
def rain(d, v=1):
    x = bed(d, 1500, 9000, 7, .7); t = t_(d)
    for s in rng.integers(0, len(x) - 2000, int(d * 40)): x[s:s + 600] += bp(noise(600 / SR), 2000, 6000) * np.exp(-t[:600] / .004) * rng.uniform(.1, .4)
    return norm(x) * v
def wind(d, v=1): return bed(d, 200, 900, 4.3, 1) * v
def waves(d, v=1):
    t = t_(d); x = lp(brown(d), 600) * (.55 + .45 * np.sin(2 * np.pi * t / 6.5) ** 2)
    return norm(x) * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2) * v
def steps(n, every, v=1):
    one = lambda: norm(lp(noise(.12), 900) * env_exp(.12, .025) + .4 * np.sin(2 * np.pi * 110 * t_(.12)) * env_exp(.12, .04))
    x = np.zeros(int((n * every + .3) * SR), np.float32)
    for k in range(n):
        s = int(k * every * SR); y = one() * (.6 + .4 * (k / n)); x[s:s + len(y)] += y
    return x * v
def paper(v=1): d = .6; t = t_(d); return norm(bp(noise(d), 900, 5000) * (np.abs(np.sin(2 * np.pi * 9 * t)) ** 3) * env_exp(d, .25)) * v

GAIN = {"click": -26, "shimmer": -30, "chime": -28, "whoosh": -30, "thunder": -20, "crack": -24, "rain": -30, "wind": -32, "waves": -31, "steps": -27, "paper": -30}
for e in ev["ev"]:
    k = e["type"]
    if k in ("line", "shot"): continue
    d = e.get("d", 4.0); v = e.get("v", 1.0)
    x = {"click": lambda: switch(), "shimmer": shimmer, "chime": chime, "whoosh": lambda: sfx.whoosh(.6), "thunder": thunder, "crack": crack,
         "rain": lambda: rain(d), "wind": lambda: wind(d), "waves": lambda: waves(d), "steps": lambda: steps(e.get("n", 8), e.get("every", .4)), "paper": paper}.get(k)
    if x is None: print("unknown sfx", k); continue
    y = x() if callable(x) else x
    add(fx, y.astype(np.float32), e["t"], 10 ** (GAIN.get(k, -30) / 20) * v * 2.4, pan=e.get("pan", 0))

# —— music, ducked under speech ——
music, _ = sf.read(os.path.join(prod, "out", "music.wav"), dtype="float32")
music = np.pad(music, ((0, max(0, N - len(music))), (0, 0)))[:N]
env = np.convolve(speech.astype(np.float32), np.ones(int(.25 * SR)) / (.25 * SR), mode="same")
duck = 10 ** (-5.5 * np.clip(env * 3, 0, 1) / 20)
music *= (10 ** (-27.5 / 20) / rms(music))
music *= duck[:, None]

mix = voice + music + fx
mix[:, 0] = limit(mix[:, 0], .89); mix[:, 1] = limit(mix[:, 1], .89)
sf.write(os.path.join(prod, "out", "mix.wav"), mix[:int(DUR * SR)], SR)
print(f"mix {DUR:.1f}s  voice {20*np.log10(rms(voice[speech]) if speech.any() else 1e-9):.1f} dB  music {20*np.log10(rms(music)):.1f} dB  fx events {sum(1 for e in ev['ev'] if e['type'] not in ('line','shot'))}")
