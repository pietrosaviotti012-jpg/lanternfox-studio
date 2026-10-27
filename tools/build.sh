#!/bin/sh
# Build a production's film: sh tools/build.sh <production folder>
# Needs the narration already made (tools/voice.py), the Lemo-Opuscar library in $LIB (default ~/lemo-opuscar)
# and a Python with numpy, scipy and soundfile in $PY (default python3).
# Quality knobs: Q (page query, default "ssaa=2&dof=64"; in the cloud without a GPU "ssaa=1.5&dof=40"), WORKERS (default 3).
# Output in <production>/out: film.mp4 (1080×1920, 30 fps, −14 LUFS), poster.jpg, sheet.jpg (contact sheet), film.srt.
set -e
STUDIO=$(cd "$(dirname "$0")/.." && pwd)
P=$(cd "$1" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}; export LIB
PY=${PY:-python3}
Q=${Q:-ssaa=2&dof=64}; WORKERS=${WORKERS:-3}
office() { node "$STUDIO/tools/office.mjs" "$@" || true; }

[ -f "$P/vo/dur.json" ] || { echo "build: no narration yet, run tools/voice.py first"; exit 1; }
rm -rf "$P/engine"; cp -r "$STUDIO/engine" "$P/engine"; cp "$STUDIO/engine/index.html" "$P/index.html"
mkdir -p "$P/out"
cd "$LIB"

node core/render/events.mjs "$P" --size 1080x1920 --out "$P/events.json"
office '{"dept":"musica","status":"working","task":"Compongo il carillon sulle scene"}'
$PY "$STUDIO/tools/score.py" "$P"
office '{"dept":"musica","status":"done","task":"Carillon pronto"}' '{"dept":"animazione","status":"working","task":"Disegno i fotogrammi del film"}'
node core/render/video.mjs "$P" --fps 30 --workers "$WORKERS" --size 1080x1920 --q "$Q" --out "$P/out/video.mp4"
office '{"dept":"animazione","status":"done","task":"Fotogrammi pronti"}' '{"dept":"montaggio","status":"working","task":"Mixo voce, musica e suoni; sottotitoli"}'
$PY "$STUDIO/tools/mix.py" "$P"
$PY "$STUDIO/tools/subs.py" "$P"
sh core/render/mux.sh "$P/out/video.mp4" "$P/out/mix.wav" "$P/out/film.mp4" 30 1

# poster (the hook frame) and a contact sheet for the quality check
POSTER_T=$(node -e "const e=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); const l=e.ev.find(x=>x.type==='line'); console.log((l.t+l.dur*.8).toFixed(2))" "$P/events.json")
ffmpeg -v error -y -ss "$POSTER_T" -i "$P/out/film.mp4" -frames:v 1 -q:v 2 "$P/out/poster.jpg"
ffmpeg -v error -y -i "$P/out/film.mp4" -vf "fps=1/3,scale=270:-1,tile=6x3" -frames:v 1 "$P/out/sheet.jpg"
office '{"dept":"montaggio","status":"done","task":"Film montato"}'
echo "film: $P/out/film.mp4"
