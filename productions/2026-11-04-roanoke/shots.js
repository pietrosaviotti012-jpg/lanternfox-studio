// Roanoke: One Word (True Mysteries, case 3) — shot list. August 1590: John White comes back to the colony he left on
// Roanoke Island three years earlier. All of them are gone (about 115 people, his granddaughter Virginia Dare too), and he
// lands on her third birthday. No bodies, no graves: the houses taken down, a tall palisade in their place, CRO on a tree,
// CROATOAN on the gate post, and no cross, the sign of danger they had agreed on. A storm takes his anchors; he never gets
// to Croatoan, the friendly island fifty miles south. Croatoan or inland?
// One fact per line, one new picture per fact: the gate post with the word lighting letter by letter (the image of the
// video), the colonists vanishing behind it, the cottage window with three little lights for a third birthday, the 1587
// departure in warm sepia, the ships kept in port while the years tick, the deal under the big tree, the night landing with
// a fire in the trees and a trumpet, White's face in the dark, the dawn clearing where the houses fade and the wall rises,
// CRO on the trunk, the whole word, the dashed cross that is not there, the cream map, the storm, the fox on Croatoan.
// Rules kept from pipeline/MIGLIORARE.md:
// - frame 0 already full: the carved post fills a third of the height and the premise sits over it, "115 PEOPLE · 1 WORD"
//   (~4.5 % of the height); the letters light up one by one within the first 2 seconds;
// - the scene fills the vertical frame: every shot has ground, sea or a page down to the bottom edge;
// - a big counter top right (digits ~5 % of the height) that changes 10 times: COLONISTS 115 → FOUND 0 → YEARS AWAY 1, 2, 3
//   → CLUES 1, 2 → CROSS NONE → FOUND 0, swelling and flashing each time;
// - a real close-up of a face (White in the boat, head ~40 % of the width) at ~25 s;
// - figures stand on the floor line with a level camera at its height (by: 0, cam y 0).
// Themes: misteri/notte for the night, misteri/alba for the 1587 flashback and the dawn, misteri/allarme for the missing cross.
import { layered } from './engine/kit/shot.js';
import { fox, person, brigantine, rowboat, barrel, hangLantern, cottage, pines, palisade, gatePost, carving, bigTree } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { waves, waterTop } from './engine/art.js';
import { text } from './engine/paper.js';
import { seg, ss, clamp, lerp } from './engine/lib.js';

const T = theme('misteri', 'notte'), A = theme('misteri', 'alba'), R = theme('misteri', 'allarme');
const TAU = Math.PI * 2;
const NIGHT = [[0, '#0d1517'], [.5, '#22363b'], [.8, '#3f585d'], [1, '#5a7472']];   // a lifted night: the posts read against it
const DAWN = [[0, '#2a3438'], [.45, '#66767a'], [.75, '#b0a48c'], [1, '#e2cfa4']];
const SEPIA = [[0, '#3a2e22'], [.5, '#7a6448'], [.8, '#b8996c'], [1, '#e6cc98']];  // 1587, the memory
const STORM = [[0, '#06090a'], [.5, '#152224'], [1, '#2c3c3c']];
const RED = [[0, '#140806'], [.5, '#3a1610'], [1, '#6a2a1a']];
const PAGE = [[0, '#d9cba8'], [1, '#efe6d0']];
const WOOD = '#6a543a', WOODD = '#43331f', WOODR = '#5a2a1c';
const GROUND = '#1a2420', GROUNDA = '#3a3a2c', GROUNDS = '#4a3a26';
const SAIL = '#cfc5a8';
const COLON = [{ coat: '#5a4a38', pants: '#2a2620', hat: '#2a2018' }, { coat: '#6a5a4a', pants: '#2a2620' }, { coat: '#4a5248', pants: '#22261f', hat: '#2a2018' },
  { coat: '#7a5a40', pants: '#2a2620', hair: '#2a1a12' }, { coat: '#585048', pants: '#262420' }];
const WHITE = { human: true, coat: '#3a3430', pants: '#22201c', hat: '#16120e', beard: '#8a8278', hair: '#8a8278', skin: '#d8a888' };

const LIT = { light: [0, .08, -.135], lightR: .12, lightCol: T.light, key: .95, amb: .7, ambCol: '#8aa0a0', on: false };
const ground = (name, z, col, top = 0, seed = 1) => ({ name, z, trans: .05, shadow: false,
  draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top);
    x.fillStyle = 'rgba(0,0,0,.22)'; for (let i = 0; i < 40; i++) { const px = -.24 + ((i * 37 + seed * 11) % 48) * .01, py = top - .002 - ((i * 13 + seed) % 9) * .012;
      x.fillRect(px, py, .0012, .006); x.fillRect(px + .002, py, .0012, .004); } } });
const forest = (name, z, col, base, h, seed = 9) => ({ name, z, trans: .2, draw: x => { x.fillStyle = col; pines(x, { x0: -.25, x1: .25, base, h, n: 26, seed }); } });
const seaNear = (col, line, base, r = .009) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .002, len: .045 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .006, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
// a ship on its own sheet: the origin is the waterline, so it can bob and roll around it
const ship = (name, s, cx, by, z, o = {}) => ({ name, z, trans: o.trans ?? .25, glow: o.lit ? 2.2 : 0, glowCol: T.glow, w: s * 1.5, h: s * 1.1, x: cx, y: by, ay: -s * .45,
  draw: x => brigantine(x, { cx: 0, by: 0, s, ...o }), glowDraw: o.lit ? g => brigantine(null, { cx: 0, by: 0, s, ...o }, g) : undefined });
const bob = (L, n, t, a = .0015, r = .02, w = 1.3) => { const m = L[n]; m.position.y = m.userData.p0.y + a * Math.sin(t * w); m.rotation.z = r * Math.sin(t * w * .8 + .7); };
const reveal = (L, n, t, t0, d = .4) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); L[n].position.y = L[n].userData.p0.y - .006 * (1 - k); };
const vanish = (L, n, t, t0, d = .35) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k < .99; L[n].material.color.setScalar(1 - k); };
// the colonists as small figures on their own sheets, feet on the floor line (y 0)
const colonist = (name, z, i, cx, s, face = 'calm') => ({ name, z, trans: .04, draw: x => person(x, { ...COLON[i % COLON.length], cx, by: 0, s, face }) });
// a carved word, one sheet per letter so each can light up on its own
const letters = (prefix, word, z, cx, cy, size, glowCol = '#ffd08a') => [...word].map((c, i) => ({ name: prefix + i, z, trans: .05, shadow: false, glow: 2.2, glowCol,
  draw: x => carving(x, { word, cx, cy, size, only: i }), glowDraw: g => carving(null, { word, cx, cy, size, only: i }, g) }));
const lightUp = (prefix, n, times, d = .22) => Object.fromEntries(Array.from({ length: n }, (_, i) => [prefix + i, [[0, 0], [times[i], 0], [times[i] + d, 1.15], [times[i] + d + .3, 1]]]));
const post = (name, z, cx, w, h, col = WOOD, dark = WOODD) => ({ name, z, trans: .05, draw: x => gatePost(x, { cx, by: 0, w, h, col, dark }) });
const wall = (name, z, col, h, gap, seed = 5, n = 22) => ({ name, z, trans: .06, draw: x => palisade(x, { x0: -.25, x1: .25, by: 0, h, n, col, seed, gap }) });
const lamp = (name, z, cx, cy, r) => ({ name, z, trans: .3, glow: 3, glowCol: '#ffc878', w: r * 6, h: r * 10, x: cx, y: cy, ay: r * 3, shadow: false,
  draw: x => hangLantern(x, { cx: 0, cy: -r, r, string: r * 3 }), glowDraw: g => hangLantern(null, { cx: 0, cy: -r, r }, g) });
const sign = (name, s, cx, cy, size, z = -.06, fill = '#2a2014', font = '"Anton"') => ({ name, z, trans: .2, w: .2, h: size * 2, x: cx, y: cy, shadow: false, recv: false,
  draw: x => text(x, s, 0, 0, size, font, { fill }) });

// —— The screen of this film: the premise over the first shots and the big counter top right ——
function screenUI() {
  if (typeof document === 'undefined' || document.getElementById('rk-ui')) return;
  const st = document.createElement('style'); st.id = 'rk-ui';
  st.textContent = `#hud .clock { font-size: 52px !important; }
#rk-hook { position: absolute; left: 0; right: 0; top: 250px; text-align: center; font-family: Anton; pointer-events: none; opacity: 0; }
#rk-hook b { display: inline-block; font-weight: 400; font-size: 88px; line-height: 1; padding: 10px 28px 14px; color: #f6ead0; background: rgba(8,12,12,.72);
  border-bottom: 6px solid #f0d28a; letter-spacing: .02em; text-shadow: 0 4px 14px rgba(0,0,0,.8); }
#rk-hook b i { font-style: normal; color: #f0d28a; }
#rk-count { position: absolute; right: 70px; top: 140px; width: 280px; padding: 12px 16px 14px; background: rgba(10,12,12,.84);
  border: 3px solid rgba(255,255,255,.14); font-family: Anton; text-align: center; pointer-events: none; transform-origin: 100% 0; }
#rk-count small { display: block; font-size: 26px; letter-spacing: .14em; color: #c8bfa4; }
#rk-count b { display: block; font-weight: 400; font-size: 96px; line-height: 1.02; }`;
  document.head.append(st);
}
function drawUI(g, sched, hookEnd) {
  const pop = document.getElementById('pop'); if (!pop) return;
  const root = pop.parentElement;
  let h = document.getElementById('rk-hook'), n = document.getElementById('rk-count');
  if (!h) { h = document.createElement('div'); h.id = 'rk-hook'; h.innerHTML = '<b><i>115</i> PEOPLE · <i>1</i> WORD</b>'; root.append(h); }
  if (!n) { n = document.createElement('div'); n.id = 'rk-count'; root.append(n); }
  h.style.opacity = String(clamp(Math.min(1, (hookEnd - g) / .3)));
  let cur = sched[0], since = 99;
  for (const s of sched) if (g >= s[0]) { cur = s; since = g - s[0]; }
  const [, label, value, col] = cur, flash = since < .55 ? 1 - since / .55 : 0;
  const html = `<small>${label}</small><b style="color:${col}">${value}</b>`;
  if (n.dataset.h !== html) { n.dataset.h = html; n.innerHTML = html; }
  n.style.transform = `scale(${(1 + .14 * flash).toFixed(3)})`;
  n.style.background = flash ? `rgba(${Math.round(10 + 140 * flash)},${Math.round(12 + 20 * flash)},12,.88)` : 'rgba(10,12,12,.84)';
  n.style.borderColor = flash ? '#fbf3e4' : 'rgba(255,255,255,.14)';
  const hud = document.getElementById('hud'); n.style.visibility = hud && hud.style.visibility === 'hidden' ? 'hidden' : 'visible';
}
const withUI = (shot, sched, hookEnd) => ({ ...shot, build: async E => {
  const s = await shot.build(E), up = s.update?.bind(s);
  return Object.assign(s, { update(t) { const r = up?.(t); if (typeof document !== 'undefined') drawUI(shot.start + t, sched, hookEnd); return r; } });
} });

export function SHOTS(C, DUR) {
  screenUI();
  const at = id => C[id].at, end = id => C[id].end;
  const fr = (id, f) => at(id) + C[id].dur * f;   // a moment inside a line, as a fraction of it (safe with respelled words)
  const W1 = '#f6ead0', RD = '#ff6a4d', GO = '#f0d28a';
  const sched = [[0, 'COLONISTS', '115', W1], [fr('L01', .5), 'COLONISTS', '115', W1], [fr('L01', .9), 'FOUND', '0', RD],
    [at('L04'), 'YEARS AWAY', '0', W1], [fr('L05', .25), 'YEARS AWAY', '1', W1], [fr('L05', .55), 'YEARS AWAY', '2', W1], [fr('L05', .8), 'YEARS AWAY', '3', RD],
    [at('L10'), 'CLUES', '0', W1], [fr('L11', .6), 'CLUES', '1', GO], [fr('L12', .8), 'CLUES', '2', GO], [at('L13') + .3, 'CROSS', 'NONE', RD],
    [fr('L15', .7), 'FOUND', '0', RD]];
  const hookEnd = at('L04') - .3;
  const shots = [
    // 1 · The hook, already lit: the gate post close, CROATOAN lighting letter by letter under the premise; behind it, between
    //     the logs of the palisade, five colonists stand in the night. On "gone" they flicker and vanish; only the word stays.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: end('L01') + 1, v: .3 }, { t: .2, type: 'forest', d: end('L01') + 1, v: .18 }, { t: .3, type: 'chimes', d: 2, v: .16 }],
      build: E => {
        const gone = E.cue('L01') + C.L01.dur * .9, lt = Array.from({ length: 8 }, (_, i) => .15 + i * .2);
        return layered(E, { ...LIT, sky: { stops: NIGHT, stars: 90 },
          layers: [
            forest('trees', -.13, '#1e2c2c', .0, .07, 3),
            wall('wall', -.12, '#2a2a22', .075, [-.012, .012], 4, 26),
            colonist('p0', -.112, 0, -.064, .05), colonist('p1', -.112, 1, -.051, .046), colonist('p2', -.112, 2, .051, .05), colonist('p3', -.112, 3, .064, .044),
            ground('ground', -.1, GROUND, .0, 2),
            post('post', -.09, 0, .092, .1),
            ...letters('c', 'CROATOAN', -.089, 0, .05, .0125),
            lamp('lamp', -.08, -.056, .06, .006),
          ],
          glows: { ...lightUp('c', 8, lt), lamp: [[0, 1]] }, flicker: ['lamp'],
          update: (t, L) => { for (let i = 0; i < 4; i++) vanish(L, 'p' + i, t, gone + i * .08, .25); L.lamp.rotation.z = .12 * Math.sin(t * 1.6); },
          cam: [[0, [0, 0, .3, 0, 0, -.1]], [gone, [0, 0, .27, 0, 0, -.1]], [E.dur, [0, 0, .25, 0, 0, -.1]]],
          focus: -.09, aper: 12, grade: { expo: 1.3, vig: .2 },
        });
      } },

    // 2 · Even his granddaughter: a warm memory, a cottage door, the mother and the little girl hand in hand. On "Virginia" the
    //     camera finds the child; on "birthday" three small lights come on in the window, one by one.
    { id: 'S2', start: at('L02') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .1, type: 'chimes', d: 3, v: .2 }, { t: C.L02.dur * .8, type: 'bell', v: .14 }],
      build: E => {
        const vg = E.cue('L02') + C.L02.dur * .35, bd = E.cue('L02') + C.L02.dur * .8;
        const cand = i => ({ name: 'k' + i, z: -.104, trans: .2, glow: 3, glowCol: '#ffd08a', w: .01, h: .012, x: .021 + i * .007, y: .024, shadow: false,
          draw: x => { x.fillStyle = '#f2e0b0'; x.fillRect(-.0008, -.004, .0016, .004); x.beginPath(); x.ellipse(0, .0012, .0012, .002, 0, 0, TAU); x.fill(); },
          glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, .0012, .0015, .0025, 0, 0, TAU); g.fill(); } });
        return layered(E, { ...LIT, light: [.03, .07, -.135], lightCol: A.light, ambCol: '#b09a7a', sky: { stops: SEPIA, stars: 0 },
          layers: [
            forest('trees', -.13, '#5a4a36', .0, .06, 7),
            { name: 'home', z: -.11, trans: .08, glow: 1.6, glowCol: '#ffcf8a', draw: x => cottage(x, { cx: .028, by: 0, s: .07, col: '#3a2e22', lit: true }), glowDraw: g => cottage(null, { cx: .028, by: 0, s: .07, lit: true }, g) },
            cand(0), cand(1), cand(2),
            ground('ground', -.1, GROUNDS, .0, 3),
            { name: 'mom', z: -.096, trans: .04, draw: x => person(x, { coat: '#7a5a48', pants: '#3a2a20', hair: '#3a2418', cx: -.03, by: 0, s: .078, face: 'smile' }) },
            { name: 'girl', z: -.095, trans: .04, draw: x => person(x, { coat: '#c8a070', pants: '#5a4030', hair: '#5a3a20', cx: -.008, by: 0, s: .042, face: 'smile' }) },
          ],
          glows: { home: [[0, 1]], k0: [[0, 0], [bd, 0], [bd + .15, 1]], k1: [[0, 0], [bd + .3, 0], [bd + .45, 1]], k2: [[0, 0], [bd + .6, 0], [bd + .75, 1]] },
          flicker: ['k0', 'k1', 'k2'],
          cam: [[0, [-.01, 0, .3, -.01, 0, -.1]], [vg, [-.012, 0, .28, -.012, 0, -.1]], [E.dur, [.005, 0, .27, .005, 0, -.1]]],
          focus: -.096, aper: 12, grade: { expo: 1.15, sat: .8 },
        });
      } },

    // 3 · No bodies, no graves: the clearing in the cold night, wide and empty, only the palisade. On "word" the camera rushes
    //     in to the gate post, and the carving burns.
    { id: 'S3', start: at('L03') - .15, in: { type: 'cut' }, sfx: [{ t: 0, type: 'wind', d: C.L03.dur + 1, v: .3 }, { t: C.L03.dur * .55, type: 'boom', v: .26 }],
      build: E => {
        const wd = E.cue('L03') + C.L03.dur * .55;
        return layered(E, { ...LIT, sky: { stops: NIGHT, stars: 120 },
          layers: [
            forest('trees', -.13, '#1e2c2c', .0, .08, 5),
            wall('wall', -.115, '#2a2a22', .06, [-.02, .02], 6, 20),
            ground('ground', -.1, GROUND, .0, 4),
            post('post', -.098, 0, .03, .065),
            ...letters('c', 'CROATOAN', -.097, 0, .042, .004),
            { name: 'fg', z: -.05, trans: .03, shadow: false, draw: x => { x.fillStyle = '#0a100e'; x.fillRect(-.25, -.45, .5, .45 - .045); for (let i = 0; i < 30; i++) x.fillRect(-.24 + i * .016, -.045, .0015, .006 + (i % 4) * .003); } },
          ],
          glows: lightUp('c', 8, Array(8).fill(wd), .3),
          cam: [[0, [0, .01, .5, 0, .01, -.1]], [wd - .15, [0, .02, .46, 0, .02, -.1]], [wd + .25, [0, .04, .2, 0, .04, -.1]], [E.dur, [0, .042, .18, 0, .042, -.1]]],
          focus: [[0, -.1], [wd + .2, -.098]], aper: 12, grade: { expo: 1.3, vig: .22 },
        });
      } },

    // 4 · 1587, in warm sepia: the shore of Roanoke, the ship at anchor, the colonists on the sand; John White in front, his
    //     name on screen. On "supplies" the rowboat with the barrels slides in to take him.
    { id: 'S4', start: at('L04') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: C.L04.dur + 1, v: .3 }, { t: .4, type: 'bell', v: .14 }],
      build: E => {
        const sp = E.cue('L04') + C.L04.dur * .8;
        return layered(E, { ...LIT, light: [.04, .1, -.135], lightCol: A.light, ambCol: '#b09a7a', sky: { stops: SEPIA },
          layers: [
            { name: 'sea', z: -.13, trans: .3, draw: seaNear('#6a6250', '#7a7260', .02, .006) },
            ship('ship', .1, .05, .022, -.125, { sail: SAIL, sails: 'full', col: '#2a2218' }),
            ground('sand', -.11, '#8a7452', .0, 5),
            colonist('p0', -.105, 0, -.06, .05), colonist('p1', -.105, 1, -.045, .046), colonist('p2', -.105, 3, -.028, .044), colonist('p3', -.105, 4, -.012, .05),
            { name: 'boat', z: -.102, trans: .05, w: .06, h: .04, x: .09, y: .006, shadow: false,
              draw: x => { rowboat(x, { cx: 0, by: -.008, s: .04, col: '#3a2c1c' }); barrel(x, { cx: -.006, by: -.002, w: .008, h: .01, col: '#5a3c24', band: '#1a1208' }); barrel(x, { cx: .005, by: -.002, w: .008, h: .01, col: '#5a3c24', band: '#1a1208' }); } },
            { name: 'white', z: -.095, trans: .04, draw: x => person(x, { ...WHITE, cx: .03, by: 0, s: .082, face: 'calm' }) },
          ],
          move: { boat: [[0, [0, 0, 0]], [sp - .5, [0, 0, 0]], [sp + .6, [-.028, 0, 0]], [E.dur, [-.03, 0, 0]]] },
          update: (t, L) => bob(L, 'ship', t, .001, .015),
          cam: [[0, [0, 0, .32, 0, 0, -.1]], [E.dur, [.012, 0, .28, .012, 0, -.1]]],
          focus: -.095, aper: 12, grade: { expo: 1.1, sat: .75 },
        });
      } },

    // 5 · A war with Spain: an English harbour, three ships tied up with bare masts, flags snapping; above them the years
    //     change on paper, 1588 → 1589 → 1590, with the counter.
    { id: 'S5', start: at('L05') - .2, in: { type: 'cut' }, sfx: [{ t: 0, type: 'waves', d: C.L05.dur + 1, v: .24 }, { t: .2, type: 'wind', d: C.L05.dur + 1, v: .2 },
      { t: C.L05.dur * .25, type: 'page', v: .24 }, { t: C.L05.dur * .55, type: 'page', v: .24 }, { t: C.L05.dur * .8, type: 'boom', v: .22 }],
      build: E => {
        const y1 = E.cue('L05') + C.L05.dur * .25, y2 = E.cue('L05') + C.L05.dur * .55, y3 = E.cue('L05') + C.L05.dur * .8;
        return layered(E, { ...LIT, sky: { stops: STORM, stars: 0 }, amb: .8,
          layers: [
            { name: 'far', z: -.13, trans: .3, draw: x => { x.fillStyle = '#2a3634'; x.fillRect(-.25, -.45, .5, .45 + .012); for (let i = 0; i < 9; i++) x.fillRect(-.2 + i * .05, .012, .02, .01 + (i % 3) * .006); } },
            ship('s0', .08, -.045, .0, -.118, { sail: SAIL, sails: 'none' }), ship('s1', .09, .04, -.004, -.112, { sail: SAIL, sails: 'none', flip: true }),
            { name: 'sea', z: -.108, trans: .25, draw: seaNear('#1a2626', '#26363a', -.004, .008) },
            ship('s2', .1, -.005, -.012, -.104, { sail: SAIL, sails: 'none' }),
            { name: 'dock', z: -.095, trans: .05, draw: x => { x.fillStyle = '#16120e'; x.fillRect(-.25, -.45, .5, .45 - .02); for (let i = 0; i < 12; i++) x.fillRect(-.24 + i * .045, -.02, .006, .012); } },
            sign('y0', '1588', 0, .085, .03, -.09, '#e6d6b0'), sign('y1', '1589', 0, .085, .03, -.09, '#e6d6b0'), sign('y2', '1590', 0, .085, .03, -.09, '#ff8a5c'),
          ],
          update: (t, L) => { bob(L, 's0', t, .001, .02, 1.1); bob(L, 's1', t + 1, .001, .02, 1.2); bob(L, 's2', t + 2, .0012, .025, 1.3);
            reveal(L, 'y0', t, y1); L.y0.visible = L.y0.visible && t < y2; reveal(L, 'y1', t, y2); L.y1.visible = L.y1.visible && t < y3; reveal(L, 'y2', t, y3, .25); },
          cam: [[0, [-.02, .02, .36, -.02, .02, -.1]], [E.dur, [.02, .03, .32, .02, .03, -.1]]],
          focus: -.1, aper: 14, grade: { expo: 1.25, sat: .8 },
        });
      } },

    // 6 · The deal, under the big tree: White and a colonist face to face, the camera closing in as they agree.
    { id: 'S6', start: at('L06') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'forest', d: C.L06.dur + 1, v: .2 }],
      build: E => {
        const cr = E.cue('L07') - .4;
        return layered(E, { ...LIT, light: [0, .08, -.135], lightCol: A.light, ambCol: '#b09a7a', sky: { stops: SEPIA },
          layers: [
            forest('trees', -.13, '#5a4a36', .0, .06, 11),
            { name: 'tree', z: -.115, trans: .05, draw: x => bigTree(x, { cx: 0, by: 0, s: .12, col: '#3a2c1e', leaf: '#4a4a30' }) },
            ground('ground', -.1, GROUNDS, .0, 6),
            { name: 'white', z: -.096, trans: .04, draw: x => person(x, { ...WHITE, cx: -.04, by: 0, s: .082, face: 'calm' }) },
            { name: 'man', z: -.096, trans: .04, draw: x => person(x, { ...COLON[2], cx: .042, by: 0, s: .078, face: 'calm' }) },
          ],
          cam: [[0, [0, 0, .33, 0, 0, -.1]], [cr, [0, 0, .3, 0, 0, -.1]], [E.dur, [0, 0, .28, 0, 0, -.1]]],
          focus: -.1, aper: 12, grade: { expo: 1.1, sat: .75 },
        });
      } },

    // 7 · The deal itself, close on the trunk in sepia (the card spells it out): on "place" a dashed frame for a name appears
    //     in the bark, on "cross" a dashed cross above it, like a promise. The same trunk will carry CRO in 1590.
    { id: 'S7', start: at('L07') - .1, in: { type: 'cut' }, sfx: [{ t: 0, type: 'forest', d: C.L07.dur + 1, v: .2 }, { t: .1 + C.L07.dur * .42, type: 'page', v: .22 }, { t: .1 + C.L07.dur * .9, type: 'page', v: .24 }],
      build: E => {
        const pl = E.cue('L07') + C.L07.dur * .42, cr = E.cue('L07') + C.L07.dur * .9;
        const dash = (name, paint) => ({ name, z: -.098, trans: .1, glow: 2.2, glowCol: '#ffd08a', shadow: false,
          draw: x => { x.strokeStyle = '#f2dcb0'; x.lineWidth = .0016; x.setLineDash([.004, .003]); paint(x); },
          glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = .0016; g.setLineDash([.004, .003]); paint(g); } });
        return layered(E, { ...LIT, lightCol: A.light, ambCol: '#b09a7a', amb: .8, sky: { stops: SEPIA },
          layers: [
            forest('trees', -.13, '#5a4a36', -.02, .1, 27),
            { name: 'trunk', z: -.1, trans: .04, draw: x => { x.fillStyle = '#5a4630'; x.beginPath(); x.moveTo(-.07, -.3); x.quadraticCurveTo(-.05, -.1, -.048, .3); x.lineTo(.048, .3);
              x.quadraticCurveTo(.05, -.1, .07, -.3); x.closePath(); x.fill(); x.fillStyle = '#3a2c1c'; for (let i = 0; i < 9; i++) x.fillRect(-.04 + i * .01, -.3, .0018, .6); } },
            dash('name', x => { x.strokeRect(-.03, .012, .06, .022); }),
            dash('cross', x => { x.beginPath(); x.moveTo(0, .042); x.lineTo(0, .07); x.moveTo(-.011, .058); x.lineTo(.011, .058); x.stroke(); }),
            ground('ground', -.09, GROUNDS, -.07, 10),
          ],
          glows: { name: [[0, 0], [pl, 0], [pl + .2, 1.2], [pl + .5, 1]], cross: [[0, 0], [cr, 0], [cr + .2, 1.3], [cr + .5, 1]] },
          update: (t, L) => { L.name.visible = t > pl - .05; L.cross.visible = t > cr - .05; },
          cam: [[0, [0, .035, .3, 0, .035, -.1]], [E.dur, [0, .04, .26, 0, .04, -.1]]],
          focus: -.098, aper: 12, grade: { expo: 1.1, sat: .75 },
        });
      } },

    // 8 · August 1590, night: the ship at anchor off the island, a fire glowing in the trees; in the rowboat in front the men
    //     lift a trumpet and golden notes rise over the water toward the fire.
    { id: 'S8', start: at('L08') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: C.L08.dur + 1, v: .3 }, { t: C.L08.dur * .35, type: 'fire', d: 3, v: .2 },
      { t: C.L08.dur * .85, type: 'chimes', d: 2, v: .22 }],
      build: E => {
        const fi = E.cue('L08') + C.L08.dur * .3, tr = E.cue('L08') + C.L08.dur * .85;
        const note = (i, u, v) => ({ name: 'n' + i, z: -.085, trans: .2, glow: 2.4, glowCol: '#ffd08a', w: .02, h: .02, x: u, y: v, shadow: false,
          draw: x => { x.fillStyle = '#f2e0b8'; x.beginPath(); x.ellipse(0, 0, .0025, .0018, -.4, 0, TAU); x.fill(); x.fillRect(.002, 0, .0006, .008); },
          glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, .0025, .0018, -.4, 0, TAU); g.fill(); } });
        return layered(E, { ...LIT, light: [-.04, .05, -.135], lightCol: '#ffb070', sky: { stops: NIGHT, stars: 160 },
          layers: [
            forest('island', -.125, '#141e1e', .012, .05, 13),
            { name: 'fire', z: -.122, trans: .3, glow: 3.2, glowCol: '#ff9a4a', w: .04, h: .04, x: -.03, y: .022, shadow: false,
              draw: x => { x.fillStyle = '#e07a3a'; x.beginPath(); x.moveTo(-.006, 0); x.quadraticCurveTo(0, .016, .006, 0); x.fill(); },
              glowDraw: g => { const gr = g.createRadialGradient(0, .004, 0, 0, .004, .016); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-.02, -.012, .04, .032); } },
            { name: 'far', z: -.115, trans: .4, draw: seaNear('#2a3c3e', '#36494b', .012, .006) },
            ship('ship', .09, .07, .008, -.11, { sail: SAIL, sails: 'none', lit: true }),
            { name: 'mid', z: -.1, trans: .3, draw: seaNear('#16222a', '#22323a', -.02, .01) },
            { name: 'boat', z: -.09, trans: .05, w: .1, h: .06, x: .005, y: -.03, shadow: false,
              draw: x => { rowboat(x, { cx: 0, by: -.01, s: .07, col: '#0a1010' }); x.fillStyle = '#0a1010';
                for (const [u, r] of [[-.02, .006], [-.004, .0065], [.014, .006]]) { x.beginPath(); x.arc(u, .008 + r, r, 0, TAU); x.fill(); x.fillRect(u - r * .9, -.002, r * 1.8, .01); }
                x.fillRect(.018, .014, .016, .002); x.beginPath(); x.moveTo(.034, .015); x.lineTo(.04, .02); x.lineTo(.04, .01); x.fill(); } },
            note(0, .03, .0), note(1, .02, .03), note(2, .0, .055), note(3, -.02, .075),
            { name: 'near', z: -.07, trans: .1, draw: seaNear('#0a1212', '#141e1e', -.05, .014) },
          ],
          glows: { fire: [[0, .2], [fi, .3], [fi + .5, 1.2]], ship: [[0, .7]], n0: [[0, 0], [tr, 0], [tr + .2, 1]], n1: [[0, 0], [tr + .25, 0], [tr + .45, 1]], n2: [[0, 0], [tr + .5, 0], [tr + .7, 1]], n3: [[0, 0], [tr + .75, 0], [tr + .95, 1]] },
          flicker: ['fire'],
          update: (t, L) => { bob(L, 'ship', t, .001, .015); bob(L, 'boat', t, .0015, .03, 1.6); L.fire.material.color.setScalar(.8 + .2 * Math.sin(t * 9));
            for (let i = 0; i < 4; i++) { const m = L['n' + i]; m.visible = t > tr + i * .25 - .05; m.position.y = m.userData.p0.y + .008 * Math.max(0, t - tr - i * .25); } },
          cam: [[0, [.02, .02, .36, .02, .02, -.1]], [fi, [0, .02, .34, -.01, .02, -.1]], [E.dur, [-.01, .025, .3, -.015, .025, -.1]]],
          focus: -.09, aper: 14, grade: { expo: 1.3, vig: .2 },
        });
      } },

    // 9 · Nobody answers: White's face, close, lit by the lantern in the boat; behind him the far fire on the shore goes on
    //     glowing, and nothing moves. The silence holds.
    { id: 'S9', start: at('L09') - .25, in: { type: 'cut' }, sfx: [{ t: 0, type: 'waves', d: C.L09.dur + 1.2, v: .2 }, { t: .3, type: 'wind', d: C.L09.dur + 1, v: .16 }],
      build: E => {
        const s = .3, base = -.24, cy = -.012, k0 = [0, cy, .26, 0, cy, -.1], k1 = [.004, cy + .002, .23, .004, cy + .002, -.1];
        return layered(E, { ...LIT, light: [.05, .02, -.135], lightCol: '#ffc878', key: .9, amb: .5, sky: { stops: NIGHT, stars: 140 },
          layers: [
            { name: 'shore', z: -.13, trans: .3, draw: x => { x.fillStyle = '#141e1e'; pines(x, { x0: -.25, x1: .25, base: -.005, h: .03, n: 30, seed: 17 }); } },
            { name: 'fire', z: -.128, trans: .3, glow: 3, glowCol: '#ff9a4a', w: .02, h: .02, x: -.04, y: .0, shadow: false,
              draw: x => { x.fillStyle = '#e07a3a'; x.beginPath(); x.arc(0, 0, .002, 0, TAU); x.fill(); },
              glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .004, 0, TAU); g.fill(); } },
            { name: 'sea', z: -.12, trans: .3, draw: seaNear('#1a2a2c', '#26363a', -.01, .008) },
            { name: 'white', z: -.1, trans: .04, glow: .7, glowCol: '#ffd8a8', draw: x => person(x, { ...WHITE, cx: 0, by: base, s, face: 'calm' }),
              glowDraw: g => { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(.012, base + s * .94 - s * .088, s * .07, 0, TAU); g.fill(); } },
            lamp('lamp', -.09, .05, -.03, .007),
            { name: 'rail', z: -.08, trans: .03, shadow: false, draw: x => { x.fillStyle = '#0c0a08'; x.fillRect(-.25, -.45, .5, .45 - .075); x.fillStyle = '#2a2016'; x.fillRect(-.25, -.08, .5, .006); } },
          ],
          glows: { fire: [[0, 1]], lamp: [[0, 1]], white: [[0, 1]] }, flicker: ['fire', 'lamp', 'white'],
          update: (t, L) => { L.lamp.rotation.z = .08 * Math.sin(t * 1.3); },
          cam: [[0, k0], [E.dur, k1]],
          focus: -.1, aper: 9, grade: { expo: 1.25, vig: .26 },
        });
      } },

    // 10 · At dawn: the empty clearing. Pale dashed outlines of the houses stand where they were, and fade on "gone"; on "wall"
    //     the palisade rises from the earth around them. At the forest's edge, small, the fox watches with her lantern.
    { id: 'S10', start: at('L10') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'forest', d: C.L10.dur + 1, v: .24 }, { t: C.L10.dur * .45, type: 'whoosh', v: .2 },
      { t: C.L10.dur * .75, type: 'rumble', d: 1.5, v: .24 }],
      build: E => {
        const gn = E.cue('L10') + C.L10.dur * .42, wl = E.cue('L10') + C.L10.dur * .72;
        const ghost = (name, cx, s) => ({ name, z: -.11, trans: .2, shadow: false,
          draw: x => { x.strokeStyle = 'rgba(240,226,190,.75)'; x.lineWidth = .0012; x.setLineDash([.004, .003]); const h = s * .62;
            x.beginPath(); x.moveTo(cx - s / 2, 0); x.lineTo(cx - s / 2, h); x.lineTo(cx, h + s * .38); x.lineTo(cx + s / 2, h); x.lineTo(cx + s / 2, 0); x.stroke(); } });
        return layered(E, { ...LIT, lightCol: A.light, ambCol: '#a8a090', amb: .85, sky: { stops: DAWN },
          layers: [
            forest('trees', -.13, '#3a4440', .0, .08, 21),
            { name: 'fox', z: -.125, trans: .2, glow: 3, shadow: false,
              draw: x => fox(x, { cx: .058, by: 0, s: .018, lantern: true, flip: true }), glowDraw: g => fox(null, { cx: .058, by: 0, s: .018, lantern: true, flip: true }, g) },
            ghost('h0', -.045, .035), ghost('h1', .0, .04), ghost('h2', .045, .034),
            wall('wall', -.105, '#2e2a22', .05, [-.012, .012], 8, 24),
            ground('ground', -.1, GROUNDA, .0, 7),
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          move: { wall: [[0, [0, -.06, 0]], [wl - .1, [0, -.06, 0]], [wl + .5, [0, 0, 0]], [E.dur, [0, 0, 0]]] },
          update: (t, L) => { for (let i = 0; i < 3; i++) vanish(L, 'h' + i, t, gn + i * .12, .4); },
          cam: [[0, [-.01, 0, .36, -.01, 0, -.1]], [E.dur, [.01, 0, .32, .01, 0, -.1]]],
          focus: -.105, aper: 14, grade: { expo: 1.15, sat: .8 },
        });
      } },

    // 11 · On a tree, three letters: the trunk of the big tree, close; C, R, O light up one at a time as they are said.
    { id: 'S11', start: at('L11') - .2, in: { type: 'cut' }, sfx: [{ t: 0, type: 'forest', d: C.L11.dur + 1, v: .2 },
      { t: .2 + C.L11.dur * .58, type: 'page', v: .22 }, { t: .2 + C.L11.dur * .74, type: 'page', v: .22 }, { t: .2 + C.L11.dur * .9, type: 'page', v: .22 }],
      build: E => {
        const t0 = E.cue('L11'), d = C.L11.dur;
        return layered(E, { ...LIT, lightCol: A.light, ambCol: '#a8a090', amb: .8, sky: { stops: DAWN },
          layers: [
            forest('trees', -.13, '#3a4440', -.02, .1, 23),
            { name: 'trunk', z: -.1, trans: .04, draw: x => { x.fillStyle = '#4a3a28'; x.beginPath(); x.moveTo(-.07, -.3); x.quadraticCurveTo(-.05, -.1, -.048, .3); x.lineTo(.048, .3);
              x.quadraticCurveTo(.05, -.1, .07, -.3); x.closePath(); x.fill(); x.fillStyle = '#2e2418'; for (let i = 0; i < 9; i++) x.fillRect(-.04 + i * .01, -.3, .0018, .6); } },
            ...letters('c', 'CRO', -.099, 0, .03, .022),
            ground('ground', -.09, GROUNDA, -.07, 8),
          ],
          glows: lightUp('c', 3, [t0 + d * .58, t0 + d * .74, t0 + d * .9], .18),
          cam: [[0, [0, .03, .28, 0, .03, -.1]], [E.dur, [0, .03, .24, 0, .03, -.1]]],
          focus: -.099, aper: 12, grade: { expo: 1.15, sat: .8 },
        });
      } },

    // 12 · On the gate post, the whole word: the camera tilts up the post from the earth to the carving, and CROATOAN burns.
    { id: 'S12', start: at('L12') - .2, in: { type: 'cut' }, sfx: [{ t: 0, type: 'wind', d: C.L12.dur + 1, v: .24 }, { t: .2 + C.L12.dur * .78, type: 'boom', v: .26 }],
      build: E => {
        const wd = E.cue('L12') + C.L12.dur * .78;
        return layered(E, { ...LIT, lightCol: A.light, ambCol: '#a8a090', amb: .8, sky: { stops: DAWN },
          layers: [
            forest('trees', -.13, '#3a4440', .0, .08, 25),
            wall('wall', -.115, '#2e2a22', .075, [-.012, .012], 9, 26),
            ground('ground', -.1, GROUNDA, .0, 9),
            post('post', -.09, 0, .092, .1),
            ...letters('c', 'CROATOAN', -.089, 0, .05, .0125),
          ],
          glows: lightUp('c', 8, Array.from({ length: 8 }, (_, i) => wd + i * .05), .2),
          cam: [[0, [0, .005, .27, 0, -.005, -.1]], [wd - .3, [0, .036, .26, 0, .036, -.1]], [E.dur, [0, .04, .23, 0, .04, -.1]]],
          focus: -.09, aper: 12, grade: { expo: 1.15, sat: .8 },
        });
      } },

    // 13 · And no cross: the same post in red (allarme). Above the word a dashed cross blinks three times, the way it should
    //      have been carved, and on "cross" it is gone. A small jolt.
    { id: 'S13', start: at('L13') - .15, in: { type: 'cut' }, sfx: [{ t: 0, type: 'rumble', d: C.L13.dur + 1.2, v: .3 }, { t: C.L13.dur * .7, type: 'boom', v: .26 }],
      build: E => {
        const cr = E.cue('L13') + C.L13.dur * .7;
        return layered(E, { ...LIT, lightCol: R.light, ambCol: '#b06a50', amb: .8, sky: { stops: RED },
          layers: [
            wall('wall', -.115, '#2a1410', .075, [-.012, .012], 9, 26),
            ground('ground', -.1, '#2a1410', .0, 9),
            post('post', -.09, 0, .092, .1, WOODR, '#3a1a10'),
            ...letters('c', 'CROATOAN', -.089, 0, .05, .0125, '#ff9a6a'),
            { name: 'cross', z: -.088, trans: .1, glow: 2.6, glowCol: '#ff6a4d', shadow: false,
              draw: x => { x.strokeStyle = '#ffd0b0'; x.lineWidth = .0022; x.setLineDash([.004, .003]); x.beginPath(); x.moveTo(0, .064); x.lineTo(0, .092); x.moveTo(-.012, .08); x.lineTo(.012, .08); x.stroke(); },
              glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = .0022; g.setLineDash([.004, .003]); g.beginPath(); g.moveTo(0, .064); g.lineTo(0, .092); g.moveTo(-.012, .08); g.lineTo(.012, .08); g.stroke(); } },
          ],
          update: (t, L) => { const on = t < cr && Math.floor(t / .28) % 2 === 0; L.cross.visible = on; },
          cam: [[0, [0, .045, .25, 0, .045, -.1]], [cr, [0, .045, .23, 0, .045, -.1]], [cr + .12, [0, .047, .2, 0, .047, -.1]], [E.dur, [0, .047, .19, 0, .047, -.1]]],
          focus: -.09, aper: 12, grade: { expo: 1.25, vig: .24 },
        });
      } },

    // 14 · The map, a cream page: the coast, Roanoke Island at the top, Croatoan fifty miles south; a dotted line draws itself
    //      from one to the other and "50 MILES" appears. The page stays still and flat.
    { id: 'S14', start: at('L14') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'page', v: .26 }, { t: C.L14.dur * .45, type: 'chimes', d: 2, v: .16 }],
      build: E => {
        const fi = E.cue('L14') + C.L14.dur * .4, dots = Array.from({ length: 9 }, (_, i) => [.004 + Math.sin(i / 8 * 2.6) * .016, .05 - i * .0052]);
        const dot = (i, [u, v]) => ({ name: 'd' + i, z: -.094, trans: .1, shadow: false, w: .01, h: .01, x: u, y: v, draw: x => { x.fillStyle = '#a3301e'; x.beginPath(); x.arc(0, 0, .0014, 0, TAU); x.fill(); } });
        const fb = .04;   // the fox stands on the mainland shore of the map
        const MC = [0, 0, .22, 0, 0, -.1];
        return layered(E, { ...LIT, light: [0, .03, -.135], lightR: .2, lightCol: '#fff0d8', key: .9, amb: 1.1, ambCol: '#e8dcc4', sky: { stops: PAGE },
          layers: [
            { name: 'map', z: -.1, trans: .05, draw: x => {
              x.fillStyle = '#efe6d0'; x.fillRect(-.25, -.45, .5, .9);
              x.fillStyle = '#c9b48a'; x.beginPath(); x.moveTo(-.25, .2); x.lineTo(-.024, .2); x.quadraticCurveTo(-.014, .08, -.026, .03); x.quadraticCurveTo(-.03, -.04, -.012, -.2); x.lineTo(-.25, -.2); x.closePath(); x.fill();
              x.fillStyle = '#9a865e'; x.beginPath(); x.ellipse(.0, .055, .005, .011, .1, 0, TAU); x.fill();
              x.beginPath(); x.moveTo(.03, .075); x.quadraticCurveTo(.042, .04, .034, .012); x.lineTo(.037, .012); x.quadraticCurveTo(.046, .04, .033, .075); x.fill();
              x.fillStyle = '#a3301e'; x.beginPath(); x.ellipse(.026, .0, .009, .0045, -.5, 0, TAU); x.fill();
              x.strokeStyle = 'rgba(80,90,90,.3)'; x.lineWidth = .0005; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(.044 + i * .003, .08); x.quadraticCurveTo(.05 + i * .003, .03, .044 + i * .003, -.03); x.stroke(); }
              text(x, 'ROANOKE', -.03, .056, .0055, '"Anton"', { fill: '#2a2014' }); } },
            ...dots.map((p, i) => dot(i, p)),
            sign('cro', 'CROATOAN', -.008, .0, .0065, -.093, '#a3301e'),
            sign('mi', '50 MILES', .028, .03, .0052, -.093, '#2a2014'),
            { name: 'fox', z: -.093, trans: .2, glow: 2.4, shadow: false,
              draw: x => fox(x, { cx: -.04, by: fb, s: .012, lantern: true }), glowDraw: g => fox(null, { cx: -.04, by: fb, s: .012, lantern: true }, g) },
          ],
          glows: { fox: [[0, 1]] },
          update: (t, L) => { dots.forEach((_, i) => { L['d' + i].visible = t > fi + i * .12; }); reveal(L, 'cro', t, fi + 9 * .12); reveal(L, 'mi', t, fi + 9 * .12 + .3); },
          cam: [[0, MC], [E.dur, MC]],   // a flat page, not a floor: the camera stays still and square
          focus: -.1, aper: 20, grade: { expo: 1.0, vig: .12, sat: .9 },
        });
      } },

    // 15 · The storm: night sea, the ship rolling hard, lightning on "storm"; the anchor rope snaps on "anchors" and the ship is
    //      shoved away to the right, out of the frame.
    { id: 'S15', start: at('L15') - .25, in: { type: 'cut' }, sfx: [{ t: 0, type: 'rain', d: C.L15.dur + 1, v: .3 }, { t: 0, type: 'waves', d: C.L15.dur + 1, v: .3 },
      { t: .25 + C.L15.dur * .2, type: 'thunder', v: .3 }, { t: .25 + C.L15.dur * .5, type: 'crack', v: .26 }],
      build: E => {
        const st = E.cue('L15') + C.L15.dur * .2, an = E.cue('L15') + C.L15.dur * .5;
        return layered(E, { ...LIT, light: [0, .12, -.135], lightCol: '#cfe0e0', key: .8, amb: .55, ambCol: '#6a8080', sky: { stops: STORM, stars: 0 },
          layers: [
            { name: 'far', z: -.125, trans: .4, draw: seaNear('#2a3c3e', '#3a5052', .015, .008) },
            ship('ship', .11, 0, .0, -.11, { sail: SAIL, sails: 'half' }),
            { name: 'rope', z: -.108, trans: .1, w: .06, h: .06, x: -.03, y: -.01, shadow: false, recv: false,
              draw: x => { x.strokeStyle = '#0a0e0e'; x.lineWidth = .0012; x.beginPath(); x.moveTo(.02, .01); x.quadraticCurveTo(0, -.005, -.025, -.025); x.stroke(); } },
            { name: 'mid', z: -.1, trans: .3, draw: seaNear('#16222a', '#22323a', -.008, .012) },
            { name: 'near', z: -.08, trans: .1, draw: seaNear('#0a1212', '#141e1e', -.045, .016) },
          ],
          flash: [st, st + .35],
          move: { ship: [[0, [0, 0, 0]], [an, [0, 0, 0]], [E.dur, [.12, .0, 0]]], near: [[0, [0, 0, 0]], [E.dur, [-.04, 0, 0]]] },
          update: (t, L) => { bob(L, 'ship', t, .004, .09, 2.2); L.rope.visible = t < an; L.mid.position.y = L.mid.userData.p0.y + .003 * Math.sin(t * 2.4); },
          cam: [[0, [-.01, .02, .34, -.01, .02, -.1]], [an, [0, .02, .32, 0, .02, -.1]], [E.dur, [.03, .02, .34, .03, .02, -.1]]],
          focus: -.11, aper: 14, grade: { expo: 1.3, vig: .26, sat: .7 },
        });
      } },

    // 16 · The end, on Croatoan: night on the dunes, the fox with her lantern on the right, the sea and far off a ring of tiny
    //      warm lights among the trees. Is that them? The choice comes over it, CROATOAN or INLAND.
    { id: 'S16', start: fr('L15', .62), in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: DUR - fr('L15', .62) + .5, v: .26 }, { t: .4, type: 'chimes', d: 3, v: .18 }],
      build: E => {
        return layered(E, { ...LIT, light: [.04, .05, -.135], lightCol: '#ffc878', key: .85, amb: .6, sky: { stops: NIGHT, stars: 200 },
          layers: [
            forest('isle', -.13, '#141e1e', .02, .04, 31),
            { name: 'lights', z: -.128, trans: .3, glow: 2.6, glowCol: '#ffb862', shadow: false,
              draw: x => { x.fillStyle = '#e0a060'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-.05 + i * .012, .024 + (i % 2) * .003, .0012, 0, TAU); x.fill(); } },
              glowDraw: g => { g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(-.05 + i * .012, .024 + (i % 2) * .003, .0018, 0, TAU); g.fill(); } } },
            { name: 'sea', z: -.12, trans: .35, draw: seaNear('#22363a', '#2e4448', .015, .007) },
            { name: 'dune', z: -.1, trans: .05, draw: x => { x.fillStyle = '#3a3628'; x.beginPath(); x.moveTo(-.25, -.45); x.lineTo(-.25, -.01); x.quadraticCurveTo(-.05, .006, .02, -.004);
              x.quadraticCurveTo(.06, .006, .25, .0); x.lineTo(.25, -.45); x.closePath(); x.fill();
              x.fillStyle = '#26241a'; for (let i = 0; i < 22; i++) x.fillRect(-.24 + i * .022, -.006 + (i % 3) * .002, .0012, .008 + (i % 4) * .003); } },
            { name: 'fox', z: -.095, trans: .2, glow: 3.2,
              draw: x => fox(x, { cx: .03, by: 0, s: .042, lantern: true }), glowDraw: g => fox(null, { cx: .03, by: 0, s: .042, lantern: true }, g) },
          ],
          glows: { fox: [[0, .8], [.6, 1.3]], lights: [[0, 0], [.8, 0], [1.6, 1]] }, flicker: ['fox', 'lights'],
          cam: [[0, [.01, 0, .3, .01, 0, -.1]], [E.dur, [0, 0, .34, 0, 0, -.1]]],
          focus: -.095, aper: 12, grade: { expo: 1.3, vig: .2 },
        });
      } },
  ];
  return shots.map(s => withUI(s, sched, hookEnd));
}
