"""Narration for a production: python tools/voice.py <production folder>

Reads script.json; for every line runs Chatterbox (MIT) with that line's acting:
  act.intensity → exaggeration (0.3 calm … 0.8 intense), act.pace → cfg_weight (lower = slower, more deliberate),
  act.speed → tempo change after synthesis (ffmpeg atempo, pitch kept), act.gain_db → level (whisper / normal / climax).
Writes vo/<id>.wav (48 kHz mono, silence trimmed), vo/dur.json, then checks every line with faster-whisper and writes
vo/words.json ({id: [[word, start, end], …]}) for the picture to land actions on spoken words.
Lines whose text and acting did not change are not generated again (vo/hash.json).
Exit code 1 if a line still does not transcribe back after 3 tries.
"""
import hashlib, json, os, re, subprocess, sys, tempfile

import numpy as np
import soundfile as sf

SR = 48000
prod = sys.argv[1]
script = json.load(open(os.path.join(prod, "script.json"), encoding="utf-8"))
vo = os.path.join(prod, "vo"); os.makedirs(vo, exist_ok=True)
hash_file = os.path.join(vo, "hash.json")
hashes = json.load(open(hash_file)) if os.path.exists(hash_file) else {}
voice = script.get("voice", {})

def key(L):
    return hashlib.sha1(json.dumps([L["text"], L.get("say"), L.get("act", {}), voice], sort_keys=True).encode()).hexdigest()[:12]

def norm_words(s):
    return re.sub(r"[^a-z0-9' ]", " ", s.lower().replace("—", " ")).split()

todo = [L for L in script["lines"] if hashes.get(L["id"]) != key(L) or not os.path.exists(os.path.join(vo, L["id"] + ".wav"))]
model = None
if todo:
    import torch, torchaudio
    from chatterbox.tts import ChatterboxTTS
    print(f"voice: {len(todo)} line(s) to generate", flush=True)
    model = ChatterboxTTS.from_pretrained(device="cpu")

def synth(L, attempt):
    import torch
    act = L.get("act", {})
    torch.manual_seed(1000 * attempt + int(L["id"].strip("L") or 0))
    wav = model.generate(L.get("say", L["text"]), exaggeration=float(act.get("intensity", .5)), cfg_weight=float(act.get("pace", .45)),
                         **({"audio_prompt_path": voice["prompt"]} if voice.get("prompt") else {}))
    x = wav.squeeze().cpu().numpy().astype(np.float32)
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, "a.wav"), os.path.join(d, "b.wav")
        sf.write(a, x, model.sr)
        speed = float(act.get("speed", .9)); gain = float(act.get("gain_db", 0))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", f"atempo={speed},volume={gain}dB", "-ar", str(SR), "-ac", "1", b], check=True)
        y, _ = sf.read(b, dtype="float32")
    nz = np.where(np.abs(y) > np.abs(y).max() * .02)[0]
    return y[max(0, nz[0] - int(.03 * SR)): nz[-1] + int(.12 * SR)] if len(nz) else y

def check(path):
    segs, _ = asr.transcribe(path, language="en", word_timestamps=True, beam_size=5)
    words = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in (s.words or [])]
    return words, " ".join(w[0] for w in words)

from faster_whisper import WhisperModel
asr = WhisperModel("base.en", device="cpu", compute_type="int8")
dur = {}; words_all = {}; failed = []
for L in script["lines"]:
    path = os.path.join(vo, L["id"] + ".wav")
    want = norm_words(L.get("asr", L["text"]))
    for attempt in range(3):
        if L in todo:
            sf.write(path, synth(L, attempt), SR)
        words, heard = check(path)
        got = norm_words(heard)
        # a word also counts when Whisper splits or joins it ("Streetlamps" heard as "street lamps")
        joined = "".join(got).replace("'", "")
        missing = [w for w in want if w not in got and w.replace("'", "") not in joined]
        ok = len(missing) <= max(0, len(want) // 8)   # whisper may drop one short word in a long line
        if ok or L not in todo:
            break
        print(f"  {L['id']} retry ({attempt + 1}): heard “{heard}”", flush=True)
    if not ok:
        failed.append(L["id"])
    hashes[L["id"]] = key(L)
    dur[L["id"]] = round(sf.info(path).duration, 3)
    words_all[L["id"]] = words
    print(f"{L['id']} {dur[L['id']]:5.2f}s {'OK  ' if ok else 'DIFF'} {heard}", flush=True)

json.dump(dur, open(os.path.join(vo, "dur.json"), "w"), indent=1)
json.dump(words_all, open(os.path.join(vo, "words.json"), "w"), indent=0)
json.dump(hashes, open(hash_file, "w"), indent=1)
if failed:
    print("lines that do not transcribe back:", ", ".join(failed)); sys.exit(1)
