# Controllo qualità (Miva): the finished film, watched by a machine, before it reaches the user's desk.
#   python tools/quality.py <production folder>   writes out/quality.json: { ok, problems: [...], checks: [{name, ok, detail}] }
# It never stops the chain: what it finds goes to Approva next to the video. Measures only what can really be measured:
# loudness, black or nearly black stretches, the start of the hook, the length, and the words in the final mix.
import json, os, re, subprocess, sys, tempfile

P = sys.argv[1]
film = os.path.join(P, "out", "film.mp4")
script = json.load(open(os.path.join(P, "script.json"), encoding="utf8"))
checks = []
def add(name, ok, detail):
    checks.append({"name": name, "ok": bool(ok), "detail": detail})

def ff(*args):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", film, *args, "-f", "null", "-"], capture_output=True, text=True).stderr

# length
m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", ff("-t", "0.1"))
dur = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
add("Durata", 30 <= dur <= 100, f"{dur:.0f} secondi (va bene tra 30 e 100)")

# loudness: −14 LUFS ± 1
m = re.findall(r"I:\s+(-?[\d.]+) LUFS", ff("-af", "ebur128", "-vn"))
if m:
    add("Volume", abs(float(m[-1]) + 14) <= 1, f"{float(m[-1]):.1f} LUFS (obiettivo −14 ± 1)")

# brightness twice a second: YAVG is 16 on pure black. The last seconds (end card) can be dark.
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", film, "-vf", "fps=2,scale=108:-1,signalstats,metadata=print:file=-", "-an", "-f", "null", "-"], capture_output=True, text=True).stdout
y = [float(v) for v in re.findall(r"YAVG=([\d.]+)", out)]
dark, run, start = [], 0, 0
for i, v in enumerate(y + [255]):
    if v < 22:
        start = start if run else i; run += 1
    else:
        if run >= 4 and start / 2 < dur - 5:   # two seconds or more
            dark.append((start / 2, run / 2))
        run = 0
add("Scene buie", not dark, "nessuna scena quasi nera" if not dark else "; ".join(f"quasi nero per {d:.1f} s da {s:.0f} s" for s, d in dark[:4]))

# the hook: something on screen and the voice under way within two seconds
lead = float(script.get("lead", 1.4))
first = y[:4]
add("Gancio", lead <= 2 and (not first or max(first) >= 22), f"la voce parte a {lead:.1f} s" + ("" if not first or max(first) >= 22 else ", ma i primi 2 secondi sono neri"))

# the words: Whisper on the final mix must find the lines over music and effects
try:
    from faster_whisper import WhisperModel
    wav = os.path.join(tempfile.gettempdir(), "q.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", film, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    segs, _ = WhisperModel("base.en", device="cpu", compute_type="int8").transcribe(wav, language="en")
    norm = lambda s: re.sub(r"[^a-z0-9 ]", " ", s.lower()).split()
    heard = set(norm(" ".join(s.text for s in segs)))
    want = [w for L in script["lines"] for w in norm(L.get("asr", L["text"])) if len(w) > 3 and not w.isdigit()]
    found = sum(w in heard for w in want)
    k = found / max(1, len(want))
    add("Parole capibili", k >= .85, f"{k * 100:.0f}% delle parole si sente sopra musica ed effetti")
except Exception as e:
    add("Parole capibili", True, f"non controllato ({type(e).__name__})")

problems = [f"{c['name']}: {c['detail']}" for c in checks if not c["ok"]]
json.dump({"ok": not problems, "problems": problems, "checks": checks}, open(os.path.join(P, "out", "quality.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(json.dumps(checks, indent=1))
