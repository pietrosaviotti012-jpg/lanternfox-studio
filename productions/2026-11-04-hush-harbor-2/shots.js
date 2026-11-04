// Hush Harbor · Part 2 (Non fare rumore) — shot list. Nobody voted, so the fox chose THROW. The film opens on the threat:
// the deck in cross-section, the girl and her glowing music box on the right, you on the left, and under the plate the red
// eye sliding toward the music, with "THE FOX CHOSE · THROW" huge over the scene. Close under the deck: the eye two steps
// from her feet. You take the box (she just smiles: a close-up of her face), run in your socks across the ribbed deck and
// grab the railing; its bars pulse red like something breathing: warm, like skin. The box arcs into the fog, still lit;
// from the water line it sinks and the dark mass rolls after it, its eye going out. Silence on your face. At 3:41 the lamps
// come back and the engines start; the loudspeaker thanks the passengers. The mother wakes; "I don't have a daughter" on
// her face; the seat beside her is empty and wet little footprints shine across the deck to the railing. The end: the fox
// on her buoy lifts her lantern in the fog, and beside her, faint on the water, a small figure stands. Who did you save?
// Themes: regole/allarme for the threat and the railing (S1, S2, S5, S7, S13), regole/notte for the rest.
// Rules kept from the last notes (pipeline/MIGLIORARE.md):
// - Part 2 starts from the threat, never from the votes card: the vote is one huge word (THROW, ~9 % of the height);
// - first frame full: figures ≥ a quarter of the height, the eye lights and moves within the first 2 seconds;
// - the lower frame is never an empty band: the ribbed deck, or the black water with the thing under the deck line;
// - a big danger counter: NOISE n/10 top right, digits ~5 % of the height, 10 ticks, it changes 4 times (9 → 10 → 6 → 2 → 0)
//   and flashes for half a second each time; the clock top left is larger (~3 %);
// - level camera at the floor in every shot with a figure (lv()), a floor strip in front of the feet;
// - a face close-up at least every 15 s (S3 the girl, S5 and S8 you, S12 the mother).
import { layered } from './engine/kit/shot.js';
import { neighbor, phone, person, foxCameo, couch, railing, hulk, ferry, speakerBox, musicBox, buoy, metalDeck } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { ss, clamp } from './engine/lib.js';

const T = theme('regole', 'notte'), A = theme('regole', 'allarme');
const TAU = Math.PI * 2;
const YOU = { coat: '#d9a43a', pants: '#1d2a26' };                       // you: the mustard puffer, the one strong colour
const SOCKS = { ...YOU, dark: '#4a4a44' };                               // no shoes since Part 1
const GIRL = { coat: '#7d8ca0', pants: '#3a4250', hair: '#2a1a12' };
const MOM = { coat: '#4a5a52', pants: '#2a3330', hair: '#3a2418' };
const FOG = [[0, '#1a2e28'], [.35, '#3a5a4e'], [.6, '#628a7a'], [1, '#8fb4a4']];
const RFOG = [[0, '#2a0e0c'], [.35, '#5a1c16'], [.6, '#8a3424'], [1, '#b0503a']];
const WALL = '#2a4c3e', DECK = '#1c3229', SEA = '#16302a', SEAR = '#3a100c', RWALL = '#5a1e18', RDECK = '#3a120e';
const BENCH = { col: '#3e5c4e', dark: '#1e3028' };
const LIT = { light: [0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false };
const RED = { light: [0, .06, -.135], lightR: .12, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RFOG }, on: false };

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
const floorFront = (col, z, top = .0015) => ({ name: 'floor', z, trans: .02, shadow: false, draw: x => { metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: top, col }); } });
const ramp = (t, a, b) => ss(clamp((t - a) / (b - a)));

const lounge = (name, z, holes = [], o = {}) => ({ name, z, trans: .05,
  draw: x => {
    x.fillStyle = o.wall || WALL; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-.25, .0, .5, .012);
    for (const [hx, hy, r] of holes) {
      x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(hx, hy, r, 0, TAU); x.fill(); x.restore();
      x.strokeStyle = '#2f4a3e'; x.lineWidth = r * .22; x.beginPath(); x.arc(hx, hy, r * 1.08, 0, TAU); x.stroke();
    }
    metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: o.deck || DECK });
  } });
const lamps = (name, z, y, xs) => ({ name, z, trans: .1, glow: 2.2, glowCol: '#d8ffe6',
  draw: x => { x.fillStyle = '#1d3a2e'; for (const cx of xs) x.fillRect(cx - .014, y, .028, .005); },
  glowDraw: g => { g.fillStyle = '#fff'; for (const cx of xs) g.fillRect(cx - .013, y + .001, .026, .003); } });
const faceGlow = (g, { cx, by, s, face }) => {
  const hr = s * .16, hy = by + s * .78, ex = hr * .36, ey = hy + hr * .05, big = face === 'scared' || face === 'surprised';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.fill();
  g.fillStyle = '#000'; for (const d of [-1, 1]) { g.beginPath(); g.arc(cx + d * ex, ey, hr * (big ? .09 : .11), 0, TAU); g.fill(); }
  g.fillRect(cx - hr * .28, hy - hr * .52, hr * .56, hr * .2);
};
const FACE = { glow: .6, glowCol: '#f6e8d6' };
// a figure as its own sheet, so it can be moved: its feet at the sheet's y = -h/2 + .01 → placed with y so feet sit on 0
const figure = (name, z, look, cx, s, face, extra = {}) => ({ name, z, trans: .02, ...FACE, ...extra,
  draw: x => person(x, { ...look, cx, by: 0, s, face }), glowDraw: g => faceGlow(g, { cx, by: 0, s, face }) });
const hand = (cx, s) => [cx + s * .092, s * .334];
const foxAt = (cx, by, s, z, pose = 'watch', flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose, flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose, flip }, g) });
const sea = (name, z, top, col = SEA) => ({ name, z, trans: .15, shadow: false,
  draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); x.fillStyle = 'rgba(170,210,190,.12)';
    for (let i = 0; i < 9; i++) x.fillRect(-.2 + ((i * 37) % 40) * .01, top - .003 - i * .004 * (1 + i * .3), .03 + (i % 3) * .012, .0008); } });
const fogBand = (name, z, y, h) => ({ name, z, trans: .5, shadow: false, recv: false,
  draw: x => { x.fillStyle = 'rgba(150,190,170,.09)'; for (let i = 0; i < 7; i++) { x.beginPath(); x.ellipse(-.2 + i * .07, y + (i % 2) * h * .3, .06, h * .5, 0, 0, TAU); x.fill(); } } });
const underDeck = (name, z, col = SEAR) => ({ name, z, trans: .1, shadow: false,
  draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45); x.fillStyle = '#3a5446'; x.fillRect(-.25, -.006, .5, .006);
    x.fillStyle = '#2c4a3c'; for (let i = -12; i <= 12; i++) x.fillRect(i * .02 - .001, -.006, .002, .006); } });
const plate = (z) => ({ name: 'plate', z, trans: .02, shadow: false, draw: x => { x.fillStyle = '#3a5446'; x.fillRect(-.25, -.006, .5, .0075); } });
const thing = (name, z, cx, by, s, flip = true) => ({ name, z, trans: .05, glow: 2.6, glowCol: '#ff5b4d', w: s * 1.6, h: s * 1.2, x: cx, y: by + s * .5,
  draw: x => { hulk(x, { cx: 0, by: -s * .5, s, col: '#030505', eye: '#ff5b4d', flip }); bigEye(x, s, flip, '#ff5b4d'); },
  glowDraw: g => { hulk(null, { cx: 0, by: -s * .5, s, flip }, g); bigEye(g, s, flip, '#fff'); } });
// the eye large enough to read on a phone (hulk()'s own eye is a pin-point): same place, a bright almond
function bigEye(x, s, flip, col) { const f = flip ? -1 : 1; x.fillStyle = col; x.beginPath(); x.ellipse(f * .46 * s, -s * .5 + .55 * s, s * .07, s * .045, 0, 0, TAU); x.fill(); }
const box = (name, z, cx, cy, s, extra = {}) => ({ name, z, trans: .05, glow: 2.4, glowCol: '#ffcf8a', w: s * 2.4, h: s * 2.4, x: cx, y: cy, ...extra,
  draw: x => musicBox(x, { cx: 0, by: -s * .4, s }), glowDraw: g => musicBox(null, { cx: 0, by: -s * .4, s }, g) });
const notes = (name, z, cx, by, s) => ({ name, z, trans: .2, glow: 2.2, glowCol: '#ffd9a0', w: s * 3, h: s * 3, x: cx, y: by + s * 1.4,
  draw: x => { x.fillStyle = '#f2e0b8'; for (const [u, v] of [[-.6, -.6], [.5, -.2], [-.3, .3], [.7, .6], [-.8, .9]]) noteMark(x, u * s, v * s, s * .16); },
  glowDraw: g => { g.fillStyle = '#fff'; for (const [u, v] of [[-.6, -.6], [.5, -.2], [-.3, .3], [.7, .6], [-.8, .9]]) noteMark(g, u * s, v * s, s * .16); } });
function noteMark(x, cx, cy, r) { x.beginPath(); x.ellipse(cx, cy, r, r * .72, -.4, 0, TAU); x.fill(); x.fillRect(cx + r * .8, cy, r * .22, r * 3.2); x.fillRect(cx + r * .8, cy + r * 2.7, r * 1.3, r * .5); }
// the railing that breathes: the bars drawn dark, and a red glow along them that pulses like a slow heartbeat
const liveRail = (name, z, x0, x1, h, n) => ({ name, z, trans: .03, shadow: false, glow: 1.8, glowCol: '#ff6a55',
  draw: x => railing(x, { x0, x1, by: 0, h, n, col: '#0a0303' }),
  glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(x0, h * .96, x1 - x0, h * .05); for (let i = 0; i < n; i++) { const px = x0 + (x1 - x0) * i / (n - 1); g.fillRect(px - h * .02, 0, h * .04, h); } } });
const beat = (t, k = 1.15) => { const p = (t * k) % 1; return .25 + .75 * (Math.exp(-p * 9) + .6 * Math.exp(-Math.max(0, p - .18) * 9) * (p > .18 ? 1 : 0)); };
// wet little footprints across the deck, from near the bench (left, near) to the railing (right, far): small pale ovals
const STEPS = Array.from({ length: 9 }, (_, i) => { const k = i / 8; return [-.05 + k * .1 + (i % 2 ? .004 : -.004), -.03 + k * .026, .0066 - k * .0034]; });
const prints = (name, z) => ({ name, z, trans: .05, shadow: false, glow: 1.4, glowCol: '#bfe6ff',
  draw: x => { x.fillStyle = '#4a6a78'; for (const [px, py, r] of STEPS) { x.beginPath(); x.ellipse(px, py, r * .55, r, .3, 0, TAU); x.fill(); } },
  glowDraw: g => { g.fillStyle = '#fff'; for (const [px, py, r] of STEPS) { g.beginPath(); g.ellipse(px, py, r * .4, r * .8, .3, 0, TAU); g.fill(); } } });

// —— The screen of this film: the fox's vote as one huge word over the first shot, and a big NOISE meter top right ——
function screenUI() {
  if (typeof document === 'undefined' || document.getElementById('hh2-ui')) return;
  const st = document.createElement('style'); st.id = 'hh2-ui';
  st.textContent = `#hud .clock { font-size: 58px !important; }
#hh2-vote { position: absolute; left: 0; right: 0; top: 330px; text-align: center; font-family: Anton; pointer-events: none; opacity: 0; }
#hh2-vote small { display: block; font-size: 46px; letter-spacing: .12em; color: #fbf3e4; text-shadow: 0 4px 16px rgba(0,0,0,.9); }
#hh2-vote b { display: block; font-weight: 400; font-size: 150px; line-height: 1; color: #ff4d3d; text-shadow: 0 0 40px rgba(255,77,61,.55), 0 8px 24px rgba(0,0,0,.9); }
#hh2-noise { position: absolute; right: 70px; top: 140px; width: 260px; padding: 12px 16px 14px; background: rgba(10,12,12,.84);
  border: 3px solid rgba(255,255,255,.14); font-family: Anton; text-align: center; pointer-events: none; transform-origin: 100% 0; }
#hh2-noise small { display: block; font-size: 26px; letter-spacing: .14em; color: #9ab8aa; }
#hh2-noise b { display: block; font-weight: 400; font-size: 96px; line-height: 1.02; }
#hh2-noise .ticks { display: flex; gap: 4px; margin-top: 6px; }
#hh2-noise .ticks i { flex: 1; height: 18px; background: #26302c; }`;
  document.head.append(st);
}
const TICK = i => i < 4 ? '#5fd38a' : i < 7 ? '#ffcf4a' : '#ff4d3d';
function drawUI(g, sched, voteEnd) {
  const pop = document.getElementById('pop'); if (!pop) return;
  const root = pop.parentElement;
  let v = document.getElementById('hh2-vote'), n = document.getElementById('hh2-noise');
  if (!v) { v = document.createElement('div'); v.id = 'hh2-vote'; v.innerHTML = '<small>THE FOX CHOSE</small><b>THROW</b>'; root.append(v); }
  if (!n) { n = document.createElement('div'); n.id = 'hh2-noise'; root.append(n); }
  v.style.opacity = String(clamp(Math.min(g / .15 + 1, (voteEnd - g) / .3)));
  v.firstChild.nextSibling.style.transform = `scale(${(1.12 - .12 * ss(clamp(g / .35))).toFixed(3)})`;
  let cur = sched[0][1], since = 99;
  for (const [t0, val] of sched) if (g >= t0) { cur = val; since = g - t0; }
  const flash = since < .55 ? 1 - since / .55 : 0, col = cur >= 7 ? '#ff4d3d' : cur >= 4 ? '#ffcf4a' : '#5fd38a';
  const html = `<small>NOISE</small><b style="color:${col}">${cur}/10</b><div class="ticks">${Array.from({ length: 10 }, (_, i) => `<i style="background:${i < cur ? TICK(i) : '#26302c'}"></i>`).join('')}</div>`;
  if (n.dataset.h !== html) { n.dataset.h = html; n.innerHTML = html; }
  n.style.transform = `scale(${(1 + .14 * flash).toFixed(3)})`;
  n.style.background = flash ? `rgba(${Math.round(10 + 150 * flash)},${Math.round(12 + 10 * flash)},12,.88)` : 'rgba(10,12,12,.84)';
  n.style.borderColor = flash ? '#fbf3e4' : 'rgba(255,255,255,.14)';
  const hud = document.getElementById('hud'); n.style.visibility = hud && hud.style.visibility === 'hidden' ? 'hidden' : 'visible';
}
const withUI = (shot, sched, voteEnd) => ({ ...shot, build: async E => {
  const s = await shot.build(E), up = s.update?.bind(s);
  return Object.assign(s, { update(t) { const r = up?.(t); if (typeof document !== 'undefined') drawUI(shot.start + t, sched, voteEnd); return r; } });
} });

export function SHOTS(C, DUR) {
  screenUI();
  const at = id => C[id].at;
  const wAt = (id, i) => C[id].words?.[i]?.start != null ? at(id) + C[id].words[i].start : at(id) + C[id].dur * i / (C[id].text || '').split(/\s+/).length;
  const sched = [[0, 9], [wAt('L04', 1), 10], [at('L06') + .5, 6], [at('L07') + C.L07.dur * .6, 2], [at('L08'), 0]];
  const voteEnd = at('L02') - .1;
  const shots = [
    // 1 · The threat, from frame 0: the deck in cross-section, you on the left, the girl and her glowing box on the right,
    //     under the plate the black water, and the eye lighting up and sliding toward the music. THROW huge on top.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'chimes', d: 4, v: 0.42 }, { t: 0, type: 'creature', v: 0.3 }, { t: .1, type: 'rumble', d: 4, v: 0.36 }, { t: .05, type: 'thunder', v: 0.24 }],
      build: E => {
        const [hx, hy] = hand(.046, .07);
        return layered(E, { ...RED,
          layers: [
            { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = RWALL; x.fillRect(-.25, 0, .5, .45);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(-.002, .085, .014, 0, TAU); x.fill(); x.restore(); } },
            underDeck('under', -.11),
            thing('thing', -.105, -.035, -.072, .048, false),
            figure('you', -.093, SOCKS, -.046, .078, 'scared'),
            figure('girl', -.093, GIRL, .046, .07, 'smile'),
            box('box', -.091, hx + .004, hy, .016),
            notes('notes', -.092, hx + .004, hy, .012),
            plate(-.09),
          ],
          glows: { thing: [[0, .2], [.5, 1]], box: [[0, 1]], notes: [[0, .8]] }, flicker: ['box'],
          scroll: { notes: [0, .006] },
          move: { thing: [[0, [0, 0, 0]], [.3, [0, 0, 0]], [E.dur, [.055, .004, 0]]] },
          cam: [[0, lv(.29, 0)], [E.dur, lv(.26, .004)]],
          focus: -.093, aper: 10, grade: { expo: 1.5, vig: .16 },
        });
      } },

    // 2 · Two steps from the music: low, just under the plate, the eye large; above the plate the girl's feet and the box.
    { id: 'S2', start: at('L02') - .1, sfx: [{ t: .1, type: 'creature', v: 0.36 }, { t: 0, type: 'chimes', d: C.L02.dur + .5, v: 0.3 }],
      build: E => {
        const two = E.word('L02', 7);
        return layered(E, { ...RED,
          layers: [
            { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = RWALL; x.fillRect(-.25, 0, .5, .45); } },
            underDeck('under', -.11),
            thing('thing', -.1, -.035, -.07, .05, false),
            figure('girl', -.093, GIRL, .0, .07, 'smile'),
            box('box', -.091, .07 * .092 + .004, .07 * .334, .016),
            plate(-.09),
          ],
          glows: { thing: [[0, 1], [two, 1], [two + .1, 1.4], [E.dur, 1]], box: [[0, 1]] }, flicker: ['box', 'thing'],
          move: { thing: [[0, [-.012, 0, 0]], [two, [0, 0, 0]], [E.dur, [.006, 0, 0]]] },
          cam: [[0, lv(.25, 0, -.004, -.1)], [E.dur, lv(.22, .004, -.004, -.1)]],
          focus: -.1, aper: 12, grade: { expo: 1.5, vig: .16 },
        });
      } },

    // 3 · You take the box from her: it passes from her hand to yours on "take"; on "smiles" the camera pushes in on her face.
    { id: 'S3', start: at('L03') - .15, sfx: [{ t: 0, type: 'chimes', d: C.L03.dur + .5, v: 0.3 }, { t: .3, type: 'floor-creak', v: 0.24 }],
      build: E => {
        const take = E.word('L03', 1), sm = E.word('L03', 13), [gx, gy] = hand(.03, .07), [yx, yy] = hand(-.03, .08);
        return layered(E, { ...LIT,
          layers: [
            lounge('wall', -.12, [[-.04, .07, .013], [.04, .07, .013]]),
            figure('you', -.095, SOCKS, -.03, .08, 'scared'),
            figure('girl', -.095, GIRL, .03, .07, 'smile'),
            box('box', -.092, gx + .004, gy, .015),
            floorFront(DECK, -.091),
          ],
          glows: { box: [[0, 1]] }, flicker: ['box'],
          move: { box: [[0, [0, 0, 0]], [take, [0, 0, 0]], [take + .5, [(yx - gx), yy - gy + .004, 0]], [E.dur, [(yx - gx), yy - gy + .004, 0]]] },
          cam: [[0, lv(.3, 0)], [sm - .3, lv(.28, .005)], [sm + .3, lv(.12, .03, .07 * .78, -.095)], [E.dur, lv(.11, .03, .07 * .78, -.095)]],
          focus: -.095, aper: 14, grade: { expo: 1.55 },
        });
      } },

    // 4 · You run across the metal deck in your socks, the box in your hand, toward the railing on the right. The camera tracks.
    { id: 'S4', start: at('L04') - .1, sfx: [{ t: .2, type: 'steps', d: C.L04.dur, v: 0.36 }, { t: 0, type: 'chimes', d: C.L04.dur, v: 0.3 }],
      build: E => {
        const grab = E.word('L04', 11), [yx, yy] = hand(-.06, .08);
        const run = [[0, [0, 0, 0]], [.2, [0, 0, 0]], [grab, [.1, 0, 0]], [E.dur, [.1, 0, 0]]];
        return layered(E, { ...LIT,
          layers: [
            lounge('wall', -.12, [[-.08, .07, .013], [0, .07, .013], [.08, .07, .013]]),
            { name: 'rail', z: -.1, trans: .03, shadow: false, draw: x => railing(x, { x0: .055, x1: .2, by: 0, h: .03, n: 8, col: '#0d1a14' }) },
            figure('you', -.095, SOCKS, -.06, .08, 'scared'),
            box('box', -.093, yx + .004, yy + .004, .015),
            floorFront(DECK, -.091),
          ],
          glows: { box: [[0, 1]] }, flicker: ['box'],
          move: { you: run, box: run },
          cam: [[0, lv(.3, -.05)], [grab, lv(.29, .04)], [E.dur, lv(.27, .045)]],
          focus: -.095, aper: 14, grade: { expo: 1.55 },
        });
      } },

    // 5 · It's warm. Like skin: close on your face over the railing; the bars in front pulse red, like a heartbeat.
    { id: 'S5', start: at('L05') - .3, sfx: [{ t: .2, type: 'breath', v: 0.3 }, { t: .4, type: 'thunder', v: 0.2 }],
      build: E => layered(E, { ...RED,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#4a1814'; x.fillRect(-.25, -.45, .5, .9); } },
          fogBand('fog', -.11, .06, .03),
          figure('you', -.095, SOCKS, 0, .09, 'scared'),
          liveRail('rail', -.085, -.1, .1, .062, 9),
          floorFront(RDECK, -.083),
        ],
        glows: { rail: [[0, .3]] },
        update: (t, L) => { L.rail.material.userData.u.uGlowLit.value = beat(t); },
        cam: [[0, lv(.16, 0, .058, -.09)], [E.dur, lv(.13, 0, .062, -.09)]],
        focus: -.095, aper: 14, grade: { expo: 1.5, vig: .2 },
      }) },

    // 6 · You throw: from behind the railing, the box arcs up and away into the fog, still lit; the buoy and the fox far right.
    { id: 'S6', start: at('L06') - .1, sfx: [{ t: .3, type: 'whoosh', v: 0.3 }, { t: 0, type: 'chimes', d: C.L06.dur + .6, v: 0.36 }, { t: 0, type: 'waves', d: C.L06.dur + 1, v: 0.36 }],
      build: E => {
        const th = E.word('L06', 1) + .05, top = -.004 + .03 * .78;
        return layered(E, { ...LIT, light: [.02, .05, -.135], lightR: .12, lightCol: '#ffc878', ambCol: '#7aa894',
          layers: [
            sea('sea', -.12, -.004),
            { name: 'buoy', z: -.118, trans: .1, glow: 1.5, draw: x => buoy(x, { cx: .05, by: -.004, s: .03 }), glowDraw: g => buoy(null, { cx: .05, by: -.004, s: .03, lamp: true }, g) },
            foxAt(.05, top, .03, -.117),
            box('box', -.11, -.02, .0, .012),
            fogBand('fog', -.105, .012, .022),
            { name: 'rail', z: -.08, trans: .03, shadow: false, draw: x => { railing(x, { x0: -.12, x1: .12, by: 0, h: .018, n: 11, col: '#0d1a14' });
              metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: DECK }); } },
          ],
          glows: { box: [[0, 1]], fox: [[0, .7]], buoy: [[0, 1]] }, flicker: ['box', 'fox'],
          move: { box: [[0, [-.03, -.03, 0]], [th, [-.03, -.03, 0]], [th + .5, [-.01, .03, 1.2]], [th + 1.3, [.01, .012, 2.6]], [E.dur, [.016, -.004, 3.2]]],
            fog: [[0, [-.02, 0, 0]], [E.dur, [.02, 0, 0]]] },
          cam: [[0, lv(.32, -.01)], [E.dur, lv(.29, .006)]],
          focus: [[0, -.08], [th + .4, -.11]], aper: 11, grade: { expo: 1.55, vig: .18 },
        });
      } },

    // 7 · From the water line: the box sinking, still glowing, and the dark mass rolling down after it; its eye goes out.
    { id: 'S7', start: at('L07') - .1, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .2, type: 'water', v: 0.42 }, { t: .5, type: 'creature', v: 0.3 }, { t: .3, type: 'rumble', d: 3, v: 0.42 }],
      build: E => {
        const sink = E.word('L07', 8);
        return layered(E, { ...RED, sky: { stops: FOG },
          layers: [
            { name: 'ferry', z: -.125, trans: .15, glow: .5, glowCol: '#cfe8d8', draw: x => ferry(x, { cx: -.05, by: .02, s: .16 }), glowDraw: g => ferry(null, { cx: -.05, by: .02, s: .16 }, g) },
            { name: 'water', z: -.118, trans: .12, shadow: false, draw: x => { x.fillStyle = SEAR; x.fillRect(-.25, -.45, .5, .45 + .02); x.fillStyle = 'rgba(255,170,140,.15)'; x.fillRect(-.25, .018, .5, .002); } },
            box('box', -.112, .015, .005, .014),
            thing('thing', -.11, -.04, -.04, .06, false),
          ],
          glows: { box: [[0, 1], [sink, .9], [E.dur, .25]], thing: [[0, 1], [sink, 1], [E.dur, 0]], ferry: [[0, .4]] }, flicker: ['box'],
          move: { box: [[0, [0, 0, 0]], [E.dur, [0, -.045, .8]]], thing: [[0, [0, 0, 0]], [E.dur, [.05, -.03, .4]]] },
          cam: [[0, [0, -.005, .36, 0, -.005, -.12]], [E.dur, [0, -.02, .33, 0, -.02, -.12]]],
          focus: -.112, aper: 10, grade: { expo: 1.6, vig: .2 },
        });
      } },

    // 8 · Then, silence: your face, close and still; the fog drifts behind the porthole. Hard cut.
    { id: 'S8', start: at('L08') - .3, sfx: [{ t: .2, type: 'breath', v: 0.24 }, { t: .1, type: 'waves', d: 3, v: 0.2 }],
      build: E => layered(E, { ...LIT, key: .9, amb: .75,
        layers: [
          lounge('wall', -.12, [[-.032, .086, .014]]),
          figure('you', -.09, SOCKS, 0, .09, 'surprised'),
        ],
        cam: [[0, lv(.14, 0, .057, -.09)], [E.dur, lv(.125, 0, .058, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.5, vig: .2 },
      }) },

    // 9 · 3:41 am: the lamps come back on (on "lights") and the engines rumble; the passengers stand up along the lounge.
    { id: 'S9', start: at('L09') - .2, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .6, type: 'rumble', d: C.L09.dur + 1, v: 0.48 }],
      build: E => {
        const li = E.word('L09', 9), xs = [-.06, -.02, .02, .06];
        return layered(E, { ...LIT,
          layers: [
            lounge('wall', -.115, [[-.044, .07, .012], [0, .07, .012], [.044, .07, .012]]),
            lamps('lamps', -.112, .105, [-.06, 0, .06]),
            { name: 'ppl', z: -.1, trans: .04, draw: x => xs.forEach(cx => neighbor(x, { cx, by: 0, s: .075, lantern: false, smile: true, col: '#16261f' })),
              glow: 1.2, glowCol: '#c9a46a', glowDraw: g => xs.forEach(cx => neighbor(null, { cx, by: 0, s: .075, lantern: false, smile: true }, g)) },
            floorFront(DECK, -.096),
          ],
          glows: { lamps: [[0, 0], [li - .1, 0], [li, .8], [li + .08, .2], [li + .2, 1]], ppl: [[0, .2], [li, .2], [li + .3, 1]] },
          grade: t => ({ expo: 1.25 + .35 * ramp(t, li - .1, li + .3) }),
          cam: [[0, lv(.42, -.012)], [E.dur, lv(.38, .012)]],
          focus: -.1, aper: 12,
        });
      } },

    // 10 · "Thank you, passengers. You may speak now.": the loudspeaker on the wall, its grille lit while it speaks.
    { id: 'S10', start: at('L10') - .15, sfx: [{ t: 0, type: 'static', d: C.L10.dur + .4, v: 0.18 }],
      build: E => layered(E, { ...LIT,
        layers: [
          lounge('wall', -.115, [[-.05, .03, .012]]),
          lamps('lamps', -.112, .1, [-.04, .05]),
          { name: 'spk', z: -.105, trans: .05, glow: 2, glowCol: T.glow, draw: x => speakerBox(x, { cx: .006, cy: .045, r: .017 }), glowDraw: g => speakerBox(null, { cx: .006, cy: .045, r: .017 }, g) },
        ],
        glows: { spk: [[0, .1], [.2, 1], [E.dur - .3, 1], [E.dur, .3]], lamps: [[0, 1]] }, flicker: ['spk'],
        cam: [[0, [-.01, .02, .26, -.01, .02, -.11]], [E.dur, [.004, .016, .22, .004, .016, -.11]]],
        focus: -.105, aper: 16, grade: { expo: 1.55, vig: .16 },
      }) },

    // 11 · The mother wakes up on the bench (her face opens on "wakes"); you stand in front of her, the empty seat beside her.
    { id: 'S11', start: at('L11') - .2, sfx: [{ t: .3, type: 'floor-creak', v: 0.21 }],
      build: E => {
        const wk = E.word('L11', 2);
        const mom = (name, face) => ({ name, z: -.11, trans: .02, ...FACE, w: .12, h: .14, x: .02, y: .06,
          draw: x => person(x, { ...MOM, cx: 0, by: -.06, s: .062, face }), glowDraw: g => faceGlow(g, { cx: 0, by: -.06, s: .062, face }) });
        return layered(E, { ...LIT,
          layers: [
            lounge('wall', -.12, [[-.04, .06, .014], [.04, .06, .014]]),
            { name: 'benchB', z: -.112, trans: .05, draw: x => couch(x, { cx: .035, by: 0, w: .1, h: .045, ...BENCH }) },
            mom('momS', 'sleeping'), mom('momA', 'calm'),
            { name: 'benchF', z: -.108, trans: .05, draw: x => couch(x, { cx: .035, by: 0, w: .1, h: .045, ...BENCH, front: true }) },
            figure('you', -.095, SOCKS, -.045, .085, 'calm'),
            floorFront(DECK, -.092),
          ],
          update: (t, L) => { L.momS.visible = t < wk; L.momA.visible = t >= wk; },
          cam: [[0, lv(.33, -.01)], [E.dur, lv(.29, .006)]],
          focus: -.105, aper: 13, grade: { expo: 1.55 },
        });
      } },

    // 12 · "I don't have a daughter.": a true close-up of the mother's face, puzzled; the empty seat starts to show at her side.
    { id: 'S12', start: at('L12') - .15, sfx: [{ t: .05, type: 'thunder', v: 0.18 }],
      build: E => layered(E, { ...LIT,
        layers: [
          lounge('wall', -.12, [[.03, .1, .013]]),
          { name: 'benchB', z: -.112, trans: .05, draw: x => couch(x, { cx: .015, by: 0, w: .1, h: .045, ...BENCH }) },
          { name: 'mom', z: -.11, trans: .02, ...FACE, w: .12, h: .14, x: 0, y: .06,
            draw: x => person(x, { ...MOM, cx: 0, by: -.06, s: .062, face: 'surprised' }), glowDraw: g => faceGlow(g, { cx: 0, by: -.06, s: .062, face: 'surprised' }) },
          { name: 'benchF', z: -.108, trans: .05, draw: x => couch(x, { cx: .015, by: 0, w: .1, h: .045, ...BENCH, front: true }) },
        ],
        cam: [[0, lv(.12, 0, .036, -.11)], [E.dur, lv(.11, .008, .037, -.11)]],
        focus: -.11, aper: 16, grade: { expo: 1.55, vig: .18 },
      }) },

    // 13 · The seat is empty; wet little footprints shine across the deck to the railing. The camera pans from seat to rail.
    { id: 'S13', start: at('L13') - .15, sfx: [{ t: .3, type: 'water', v: 0.24 }, { t: .8, type: 'creature', v: 0.18 }],
      build: E => {
        const fp = E.word('L13', 9);
        return layered(E, { ...RED,
          layers: [
            { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = RWALL; x.fillRect(-.25, 0, .5, .45);
              metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: RDECK }); } },
            { name: 'benchB', z: -.112, trans: .05, draw: x => couch(x, { cx: -.05, by: 0, w: .08, h: .04, ...BENCH }) },
            { name: 'benchF', z: -.108, trans: .05, draw: x => couch(x, { cx: -.05, by: 0, w: .08, h: .04, ...BENCH, front: true }) },
            { name: 'rail', z: -.1, trans: .03, shadow: false, draw: x => railing(x, { x0: .045, x1: .12, by: 0, h: .022, n: 6, col: '#0a0303' }) },
            prints('prints', -.098),
          ],
          glows: { prints: [[0, .2], [fp - .2, .4], [fp + .4, 1]] },
          cam: [[0, lv(.27, -.04)], [fp, lv(.27, -.005)], [E.dur, lv(.25, .04)]],
          focus: -.1, aper: 11, grade: { expo: 1.55, vig: .16 },
        });
      } },

    // 14 · The end: the fox on her buoy lifts her lantern in the fog (she rises, the glow swells), and beside her, faint on
    //      the water, a small figure stands where no one can stand. Held over the tail for the question.
    { id: 'S14', start: at('L14') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L14') + .5, v: 0.36 }, { t: .8, type: 'foghorn', v: 0.24 }, { t: 2.2, type: 'chimes', d: 2.5, v: 0.15 }],
      build: E => {
        const top = -.03 + .045 * .78, lift = E.word('L14', 6);
        return layered(E, { ...LIT, light: [.02, .06, -.14], lightR: .14, lightCol: '#ffc878', ambCol: '#7aa894',
          layers: [
            { name: 'ferry', z: -.125, trans: .15, glow: .5, glowCol: '#cfe8d8', draw: x => ferry(x, { cx: -.04, by: -.01, s: .14 }), glowDraw: g => ferry(null, { cx: -.04, by: -.01, s: .14 }, g) },
            sea('sea', -.12, -.01),
            { name: 'girl', z: -.105, trans: .3, shadow: false, w: .06, h: .08, x: -.03, y: -.03 + .03,
              draw: x => person(x, { ...GIRL, coat: '#5a7a70', pants: '#3a5a50', dark: '#3a5a50', skin: '#c8d8d0', cx: 0, by: -.03, s: .04, face: 'smile' }) },
            fogBand('fog', -.1, -.004, .02),
            { name: 'buoy', z: -.096, trans: .1, glow: 1.5, draw: x => buoy(x, { cx: .03, by: -.03, s: .045 }), glowDraw: g => buoy(null, { cx: .03, by: -.03, s: .045, lamp: true }, g) },
            foxAt(.03, top, .04, -.095, 'watch', true),
            { name: 'water', z: -.092, trans: .1, shadow: false, draw: x => { x.fillStyle = SEA; x.fillRect(-.25, -.45, .5, .45 - .03 + .002); } },
          ],
          glows: { fox: [[0, .7], [lift, .8], [lift + .6, 1.5]], buoy: [[0, 1]], ferry: [[0, .4]] }, flicker: ['fox'],
          move: { fog: [[0, [-.015, 0, 0]], [E.dur, [.015, 0, 0]]], girl: [[0, [0, -.06, 0]], [1.2, [0, -.06, 0]], [1.21, [0, 0, 0]], [E.dur, [0, 0, 0]]] },
          cam: [[0, lv(.3, .01, top, -.1)], [E.dur, lv(.25, -.004, top, -.1)]],
          focus: -.095, aper: 10, grade: { expo: 1.5, vig: .18 },
        });
      } },
  ];
  return shots.map(s => withUI(s, sched, voteEnd));
}
