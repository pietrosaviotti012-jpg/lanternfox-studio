# Reference clips (about 10 s) in four tones, made with Kokoro (Apache-2.0): synthetic voices, nobody's real voice.
import sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
d, out = sys.argv[1], sys.argv[2]
k = Kokoro(d + '/kokoro-v1.0.onnx', d + '/voices-v1.0.bin')
REFS = {
    # name: (voice, speed, lang, text in the tone we want the narrator to keep)
    "cupo":      ("am_onyx",   0.86, "en-us", "It was quiet. Too quiet. The kind of silence that waits for you to make a sound first. Somewhere below the floorboards, something was listening."),
    "professore": ("bm_george", 0.95, "en-gb", "Now, here is the remarkable part. The light you see tonight left that star thousands of years ago. In other words, you are looking at the past."),
    "fiaba":     ("bf_emma",   0.93, "en-gb", "Once upon a time, in a village of paper houses, a little fox carried a lantern through the snow, and every window she passed began to glow."),
    "pov":       ("am_michael", 0.98, "en-us", "It's two in the morning. Your phone buzzes once. Then again. You don't recognise the number, and the message just says: don't open the door."),
}
for name, (voice, speed, lang, text) in REFS.items():
    a, sr = k.create(text, voice=voice, speed=speed, lang=lang)
    sf.write(f"{out}/ref_{name}.wav", a, sr)
    print(name, round(len(a) / sr, 1), "s", flush=True)
