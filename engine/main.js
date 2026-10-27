// Lantern Fox engine: the timeline comes from the narration (script.json + vo/dur.json), the shots from the
// production's shots.js; vertical 1080×1920. Adapted from the Lemo-Opuscar paper-lantern demo (MIT).
//
// A production folder holds: index.html (from engine/index.html), script.json, vo/dur.json, vo/words.json,
// shots.js (export function SHOTS(C, DUR) → [{ id, start, in?, build }]) and meta.json.
import * as THREE from 'three';
import { Pipe } from './post.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dispose } from './stage.js';
import { ss, seg, clamp } from './lib.js';

export const W = 1080, H = 1920;
const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2);
const base = new URL('../', import.meta.url);   // the production folder (engine/ is copied inside it)
const load = async (p, fallback) => { const r = await fetch(new URL(p, base)); if (!r.ok) { if (fallback !== undefined) return fallback; throw new Error(`missing ${p}`); } return r.json(); };
const script = await load('script.json');
const dur = await load('vo/dur.json', null);
const WORDS = await load('vo/words.json', {});

// —— Timeline: each line starts after the previous one plus its gap; no voice yet → a reading-speed estimate ——
const C = {}; let cur = script.lead ?? 1.4;
for (const L of script.lines) {
  const d = dur?.[L.id] ?? Math.max(1.2, L.text.split(/\s+/).length / 2.6);
  C[L.id] = { at: cur, dur: d, end: cur + d, text: L.text, sub: L.sub ?? true };
  cur += d + (L.gap ?? .45);
}
const DUR = cur + (script.tail ?? 3.2);
window.CUES = C; window.DUR = DUR;

const { SHOTS } = await import(new URL('shots.js', base).href);
const plan = SHOTS(C, DUR);
plan.forEach((s, i) => { s.end = i + 1 < plan.length ? plan[i + 1].start : DUR; s.dur = s.end - s.start; });
window.PLAN = plan.map(s => [s.id, +s.start.toFixed(2), +s.end.toFixed(2)]);
// sound events for the mixer: every line start, plus each shot's own foley (times inside a shot are shot-relative)
window.EV = [
  ...script.lines.map(L => ({ t: C[L.id].at, type: 'line', id: L.id, dur: C[L.id].dur })),
  ...plan.map(s => ({ t: s.start, type: 'shot', id: s.id, dur: s.dur })),
  ...plan.flatMap(s => (s.sfx || []).map(e => ({ ...e, t: s.start + e.t, shot: s.id }))),
];

// —— Renderer ——
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
pipe.fin.material.uniforms.aspect.value = W / H;
const pmrem = new THREE.PMREMGenerator(renderer); const ENV = pmrem.fromScene(new RoomEnvironment(), .04).texture;
await document.fonts.load('60px Cormorant', 'Lantern Fox Tales');

const word = (id, k, p) => C[id].at - p.start + (WORDS[id]?.[k] ? WORDS[id][k][1] : C[id].dur * k / C[id].text.split(/\s+/).length);
const live = new Map();
async function get(i) {
  const p = plan[i];
  if (!live.has(i)) live.set(i, await p.build({ dur: p.dur, T0: p.start, C, env: ENV, W: WORDS, aspect: W / H,
    cue: id => C[id].at - p.start, cueEnd: id => C[id].end - p.start, word: (id, k) => word(id, k, p) }));
  return live.get(i);
}
function gc(keep) { for (const [i, s] of live) if (!keep.includes(i)) { dispose(s.S.scene); live.delete(i); } }

async function drawShot(i, t, target) {
  const s = await get(i), tl = t - plan[i].start;
  s.update(tl);
  pipe.shot(s.S.scene, s.S.cam, s.post(tl), target);
  return s.grade(tl);
}

// —— Subtitles: English, split near the middle when long ——
const sub = document.getElementById('sub');
function lines(text) {
  const s = text.replace(/[.,;:]+$/, '');
  if (s.length <= 30) return s;
  const mid = s.length / 2, cuts = [...s.matchAll(/[,;:—]\s|\s/g)].map(m => ({ i: m.index, pref: /[,;:—]/.test(m[0]) ? 0 : 4 }));
  const best = cuts.sort((a, b) => Math.abs(a.i - mid) + a.pref - (Math.abs(b.i - mid) + b.pref))[0];
  return best ? s.slice(0, best.i + (s[best.i] === ' ' ? 0 : 1)).trim() + '\n' + s.slice(best.i + 1).trim() : s;
}
window.TEXTS = t => { const L = Object.values(C).find(L => L.sub && t > L.at - .15 && t < L.end + .3); return L ? [{ id: 'sub', text: L.text, x0: 80, y0: 1260, x1: 1000, y1: 1400 }] : []; };

window.render = async (t) => {
  let i = plan.findIndex(p => t >= p.start && t < p.end); if (i < 0) i = plan.length - 1;
  const p = plan[i], tl = t - p.start, tr = p.in || { type: 'cut', dur: 0 };
  let mixB = 0, g;
  if (i > 0 && tr.type !== 'cut' && tl < tr.dur) {
    await drawShot(i - 1, t, pipe.rtA);
    g = await drawShot(i, t, pipe.rtB);
    mixB = (tr.ease || ss)(tl / tr.dur);
    gc([i - 1, i]);
  } else {
    g = await drawShot(i, t, pipe.rtA); gc([i]);
  }
  pipe.final({ ...g, mixB, mode: tr.type === 'iris' ? 1 : 0, center: tr.center, time: t, fade: (g.fade ?? 1) * ss(clamp(t / .5)) * ss(clamp((DUR - t) / 1.2)) });
  let txt = '', a = 0;
  for (const L of Object.values(C)) if (L.sub && t > L.at - .15 && t < L.end + .3) { txt = L.text; a = Math.min(ss(seg(t, L.at - .15, L.at + .05)), 1 - ss(seg(t, L.end + .1, L.end + .3))); }
  sub.textContent = txt ? lines(txt) : ''; sub.style.opacity = a;
};
window.READY = true;
