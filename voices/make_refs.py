# The voice directory: reference clips (about 10 s) for every voice in RUBRICA.json, made with Kokoro (Apache-2.0)
# and Piper. Synthetic voices, nobody's real voice cloned on purpose. Run by .github/workflows/voices.yml.
#   python voices/make_refs.py <folder with the Kokoro model files> <folder with the Piper models>
# A clip already there is kept, so the voices approved earlier never change.
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
kdir, pdir = sys.argv[1], sys.argv[2]
k = Kokoro(kdir + "/kokoro-v1.0.onnx", kdir + "/voices-v1.0.bin")
made = 0
for v in json.load(open(os.path.join(HERE, "RUBRICA.json"), encoding="utf8")):
    out = os.path.join(HERE, v["id"] + ".wav")
    if os.path.exists(out):
        continue
    if v["engine"] == "kokoro":
        a, sr = k.create(v["text"], voice=v["voice"], speed=v["speed"], lang=v["lang"])
        sf.write(out, a, sr)
    else:
        model = os.path.join(pdir, os.path.basename(v["voice"]) + ".onnx")
        subprocess.run([sys.executable, "-m", "piper", "-m", model, "-f", out], input=v["text"].encode(), check=True)
    a, sr = sf.read(out)
    if len(a) / sr < 5 or np.abs(a).max() < .02:   # a reference that is too short or silent is worse than none
        os.remove(out); sys.exit(f"{v['id']}: bad clip")
    made += 1
    print(v["id"], round(len(a) / sr, 1), "s", flush=True)
print("clips made:", made)
