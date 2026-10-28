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
renderer.shadowMap.enabled = Q.get('shadows') !== '0'; renderer.shadowMap.type = Q.get('shadows') === 'pcf' ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, W, H, SSAA);
pipe.fin.material.uniforms.aspect.value = W / H;
const pmrem = new THREE.PMREMGenerator(renderer); const ENV = pmrem.fromScene(new RoomEnvironment(), .04).texture;
await document.fonts.load('60px Cormorant', 'Lantern Fox Tales');
await document.fonts.load('60px Anton', 'LANTERN FOX');

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

// —— On-screen text. captions "pop" (default): 2-3 spoken words at a time from vo/words.json, the line's `em` words in colour;
// "line": the whole line as a subtitle. hud: { tag, part } shown from frame 0, plus each line's `clock` once it has been said.
// ?cover=1 shows meta.cover { kicker, text (with *stars* for the coloured words), t } instead: the Reel cover. ——
const sub = document.getElementById('sub'), pop = document.getElementById('pop'), hud = document.getElementById('hud');
const META = await load('meta.json', {});
const COVER = Q.get('cover') === '1';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CAPS = script.captions || 'pop';
const norm = w => w.toLowerCase().replace(/[^a-z0-9']/g, '');
// the words of each line, grouped into chunks of 2-3 that end at punctuation when they can; times are film times
const CHUNKS = {};
for (const L of script.lines) {
  const c = C[L.id], ws = WORDS[L.id]?.length ? WORDS[L.id] : L.text.split(/\s+/).map((w, k, a) => [w, c.dur * k / a.length, c.dur * (k + 1) / a.length]);
  const em = new Set((L.em || []).map(norm)), out = [];
  let cur = [];
  ws.forEach(([w, s, e], k) => {
    cur.push({ w, s: c.at + s, e: c.at + e, em: em.has(norm(w)) });
    const end = /[.,;:!?—]$/.test(w) || cur.length === 3 || (cur.length === 2 && ws[k + 1] && ws[k + 1][0].length > 7);
    if (end || k === ws.length - 1) { out.push(cur); cur = []; }
  });
  CHUNKS[L.id] = out;
}
function popAt(t) {
  for (const L of Object.values(C)) {
    if (!L.sub || t < L.at - .05 || t > L.end + .25) continue;
    const ch = CHUNKS[Object.keys(C).find(k => C[k] === L)];
    const i = ch.findIndex((g, j) => t >= g[0].s - .05 && (j === ch.length - 1 || t < ch[j + 1][0].s - .05));
    if (i >= 0) return ch[i];
  }
  return null;
}
if (script.hud && !COVER) hud.innerHTML = `<span class="tag">${esc(script.hud.tag || '')}</span>${script.hud.part ? `<span class="part">${esc(script.hud.part)}</span>` : ''}<div class="clock"></div>`;
if (COVER) {
  const cv = META.cover || { text: META.title || '' };
  const box = document.getElementById('cover'); box.style.display = 'flex';
  box.querySelector('.kicker').textContent = cv.kicker || '';
  box.querySelector('.big').innerHTML = esc(cv.text || '').replace(/\*([^*]+)\*/g, '<b>$1</b>');
}
window.COVER_T = (META.cover && META.cover.t) ?? null;
function lines(text) {
  const s = text.replace(/[.,;:]+$/, '');
  if (s.length <= 30) return s;
  const mid = s.length / 2, cuts = [...s.matchAll(/[,;:—]\s|\s/g)].map(m => ({ i: m.index, pref: /[,;:—]/.test(m[0]) ? 0 : 4 }));
  const best = cuts.sort((a, b) => Math.abs(a.i - mid) + a.pref - (Math.abs(b.i - mid) + b.pref))[0];
  return best ? s.slice(0, best.i + (s[best.i] === ' ' ? 0 : 1)).trim() + '\n' + s.slice(best.i + 1).trim() : s;
}
window.TEXTS = t => {
  if (COVER) return [];
  if (CAPS === 'pop') { const g = popAt(t); return g ? [{ id: 'pop', text: g.map(x => x.w).join(' '), x0: 70, y0: 1020, x1: 1010, y1: 1260 }] : []; }
  const L = Object.values(C).find(L => L.sub && t > L.at - .15 && t < L.end + .3); return L ? [{ id: 'sub', text: L.text, x0: 80, y0: 1260, x1: 1000, y1: 1400 }] : [];
};

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
  pipe.final({ ...g, mixB, mode: tr.type === 'iris' ? 1 : 0, center: tr.center, time: t, fade: (g.fade ?? 1) * ss(clamp((DUR - t) / 1.2))   /* no fade-in: frame 0 is the hook */ });
  if (COVER) { sub.style.opacity = 0; pop.innerHTML = ''; return; }
  if (CAPS === 'pop') {
    // each chunk pops in (a quick scale from 1.18) and keeps its words until the next chunk starts
    const g = popAt(t);
    pop.innerHTML = g ? '<div>' + g.map(x => `<span style="--k:${(1 + .18 * (1 - ss(seg(t, x.s - .05, x.s + .1)))).toFixed(3)};opacity:${t >= x.s - .06 ? 1 : 0}">${x.em ? `<b>${esc(x.w)}</b>` : esc(x.w)}</span>`).join(' ') + '</div>' : '';   // wrapped: a flex box would drop the spaces
    sub.style.opacity = 0;
  } else {
    let txt = '', a = 0;
    for (const L of Object.values(C)) if (L.sub && t > L.at - .15 && t < L.end + .3) { txt = L.text; a = Math.min(ss(seg(t, L.at - .15, L.at + .05)), 1 - ss(seg(t, L.end + .1, L.end + .3))); }
    sub.textContent = txt ? lines(txt) : ''; sub.style.opacity = a;
  }
  if (script.hud) {
    hud.style.opacity = 1;
    const said = script.lines.filter(L => L.clock && t >= C[L.id].at - .1);
    hud.querySelector('.clock').textContent = said.length ? said[said.length - 1].clock : (script.hud.clock || '');
  }
};
window.READY = true;
