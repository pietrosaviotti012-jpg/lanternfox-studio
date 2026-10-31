// The Mary Celeste (True Mysteries, case 2) — shot list. December 1872: a brigantine is found sailing itself between the
// Azores and Portugal; all ten people aboard are gone (the captain, his wife, their two-year-old daughter, seven crew).
// One fact per line, one new picture per fact: the ship alone under the moon, the ten on deck, the spyglass, the half-set
// sails and the wheel turning by itself, the boarding party, the open hatch, the cabin, the hold of barrels, the EMPTY DAVITS
// (the image of the video), the log slate, the legend of the warm tea set apart on a page, the fumes, the lifeboat on its rope,
// and the fox's lantern on a headland of the Azores as the only light at the end.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, neighbor, foreground, cliffRich, brigantine, rowboat, shipWheel, barrel, hangLantern } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { waves, waterTop } from './engine/art.js';
import { table } from './engine/props.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp } from './engine/lib.js';

const T = theme('misteri', 'notte'), A = theme('misteri', 'alba'), R = theme('misteri', 'allarme');
const NIGHT = [[0, '#0b1214'], [.5, '#1d2f35'], [.8, '#3a5258'], [1, '#56706f']];   // a lifted night: the sails read against it
const DAY = [[0, '#3a4a50'], [.5, '#7a8a8a'], [.85, '#b6b09a'], [1, '#d8cba8']];     // grey Atlantic afternoon, 4 December
const DUSK = [[0, '#1a2226'], [.5, '#55666a'], [.8, '#a79c88'], [1, '#dcc9a0']];     // New York harbour, 7 November
const HOLD = [[0, '#0a0806'], [1, '#1c140e']];
const PAGE = [[0, '#c9b083'], [1, '#e6d3a8']];
const SAIL = '#cfc5a8', SAILD = '#9c9682';

const seaNear = (col, line, base, r = .009) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .002, len: .045 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .006, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
// a ship on its own sheet: the sheet's origin is the waterline, so it can bob and roll around it
const ship = (name, s, cx, by, z, o = {}) => ({ name, z, trans: o.trans ?? .25, glow: o.lit ? 2.2 : 0, glowCol: T.glow, w: s * 1.5, h: s * 1.1, x: cx, y: by, ay: -s * .45,
  draw: x => brigantine(x, { cx: 0, by: 0, s, ...o }), glowDraw: o.lit ? g => brigantine(null, { cx: 0, by: 0, s, ...o }, g) : undefined });
const bob = (L, n, t, a = .003, r = .025, w = 1.3) => { const m = L[n]; m.position.y = m.userData.p0.y + a * Math.sin(t * w); m.rotation.z = r * Math.sin(t * w * .8 + .7); };
const fog = (col, y0, seed = 1) => x => { x.fillStyle = col; for (let i = 0; i < 9; i++) { const px = -.25 + ((i * .137 + seed * .21) % .5), py = y0 + ((i * .053 + seed * .07) % .08);
  x.beginPath(); x.ellipse(px, py, .08 + (i % 3) * .03, .012 + (i % 2) * .006, 0, 0, Math.PI * 2); x.fill(); } };
// fade a small text/sign sheet in at t0 (it rises a little as it appears)
const reveal = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); L[n].position.y = L[n].userData.p0.y - .008 * (1 - k); };
const moonL = (cx, cy, r) => ({ name: 'moon', z: -.13, trans: .5, glow: 2.4, glowCol: '#ffe6b0', w: r * 4, h: r * 4, x: cx, y: cy, shadow: false,
  draw: x => { x.fillStyle = '#e4d8b4'; x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.fill(); }, glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill(); } });
// the ten aboard: [cx, size, col] — the captain, his wife Sarah, little Sophia (she holds the lantern), seven crew
const TEN = [[-.135, .05, '#141c1e'], [-.105, .052, '#141c1e'], [-.075, .049, '#141c1e'], [-.045, .053, '#141c1e'], [-.012, .056, '#2a1f18'],
  [.018, .05, '#4a2e2a'], [.04, .026, '#5a3a30'], [.07, .051, '#141c1e'], [.1, .049, '#141c1e'], [.13, .052, '#141c1e']];

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook, already lit: the brigantine sails alone under the moon, half her sails set, nobody at the wheel. The camera
    //     trucks alongside her; on "itself" a push towards the empty stern.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'waves', d: end('L01') + 1, v: .7 }, { t: 0, type: 'wind', d: end('L01') + 1, v: .45 }, { t: 1.2, type: 'door-creak', v: .35 }],
      build: E => {
        const it = E.word('L01', 8);
        return layered(E, {
          light: [.05, .17, -.13], lightR: .2, lightCol: T.light, key: .7, amb: .32, sky: { stops: NIGHT, stars: 120 }, on: false,
          layers: [
            moonL(.08, .19, .018),
            { name: 'far', z: -.115, trans: .45, draw: seaNear('#4a6264', '#587274', .03, .006) },
            ship('ship', .15, 0, .045, -.09, { sail: SAIL, sails: 'half' }),
            { name: 'mid', z: -.07, trans: .3, draw: seaNear('#2a3c3e', '#36494b', .02, .011) },
            { name: 'near', z: -.04, trans: .1, draw: seaNear('#121c1c', '#1d2a2a', -.06, .015) },
          ],
          glows: { moon: [[0, 1]] },
          move: { far: [[0, [0, 0, 0]], [E.dur, [-.01, 0, 0]]], mid: [[0, [0, 0, 0]], [E.dur, [-.03, 0, 0]]], near: [[0, [0, 0, 0]], [E.dur, [-.06, 0, 0]]] },
          update: (t, L) => bob(L, 'ship', t),
          cam: [[0, [-.02, .08, .46, -.01, .085, -.07]], [it, [-.01, .085, .42, -.01, .09, -.07]], [E.dur, [-.03, .09, .38, -.03, .095, -.07]]],
          focus: -.09, aper: 14,
        });
      } },

    // 2 · Ten people had been aboard: New York, a warm dusk. The ten stand along the rail; on "two-year-old" the camera finds
    //     Sophia, the smallest, holding a tiny lantern. Then on "gone" they stutter and vanish, one by one, and the deck is bare.
    { id: 'S2', start: at('L02') - .25, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: 0, type: 'bell', v: .35 }, { t: .2, type: 'waves', d: 5, v: .4 }, { t: at('L03') - at('L02') + .25 + C.L03.dur * .3, type: 'whoosh', v: .6 }],
      build: E => {
        const girl = E.word('L02', 7), gone = E.word('L03', 5);
        const person = ([cx, s, col], i) => ({ name: 'p' + i, z: -.075, trans: .05, w: s * .6, h: s * 1.1, x: cx, y: .062 + s * .5, shadow: false,
          draw: x => neighbor(x, { cx: 0, by: -s * .5, s, lantern: false, col }) });
        return layered(E, {
          light: [0, .16, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .45, ambCol: '#a0927a', sky: { stops: DUSK }, on: false,
          layers: [
            { name: 'town', z: -.12, trans: .3, draw: x => { x.fillStyle = A.far; for (let i = 0; i < 14; i++) { const px = -.25 + i * .037, h = .03 + ((i * 7) % 5) * .008; x.fillRect(px, .02, .03, h); } x.fillRect(-.25, -.45, .5, .47); } },
            { name: 'deck', z: -.085, trans: .15, draw: x => { x.fillStyle = A.mid; x.fillRect(-.25, -.45, .5, .51); x.fillRect(-.25, .055, .5, .007);
              x.lineWidth = .004; x.strokeStyle = A.mid; x.beginPath(); x.moveTo(-.2, .06); x.lineTo(-.2, .3); x.moveTo(.16, .06); x.lineTo(.16, .3); x.stroke(); } },
            ...TEN.map(person),
            { name: 'lamp', z: -.072, trans: .3, glow: 3, glowCol: '#ffc878', w: .02, h: .02, x: .051, y: .072, shadow: false,
              draw: x => hangLantern(x, { cx: 0, cy: 0, r: .0035, string: .002 }), glowDraw: g => hangLantern(null, { cx: 0, cy: 0, r: .0035 }, g) },
            { name: 'rail', z: -.06, trans: .04, draw: x => { x.fillStyle = A.near; x.fillRect(-.25, -.45, .5, .5); x.fillRect(-.25, .05, .5, .006);
              for (let i = 0; i < 18; i++) x.fillRect(-.245 + i * .029, .05, .003, .012); x.fillRect(-.25, .062, .5, .004); } },
          ],
          glows: { lamp: [[0, 1], [gone + .4, 1], [gone + .5, 0]] }, flicker: ['lamp'],
          update: (t, L) => TEN.forEach((_, i) => { const tg = gone + i * .07; L['p' + i].visible = t < tg - .1 || (t > tg - .06 && t < tg); if (i === 6) L.lamp.visible = L.p6.visible; }),
          cam: [[0, [0, .1, .5, 0, .1, -.07]], [girl - .3, [.02, .095, .42, .02, .095, -.07]], [girl + .6, [.045, .085, .3, .045, .085, -.07]],
            [gone - .2, [.03, .09, .36, .03, .09, -.07]], [E.dur, [0, .1, .5, 0, .1, -.07]]],
          focus: [[0, -.075], [E.dur, -.075]], aper: 16, grade: t => ({ sat: .85 - .3 * ss(seg(t, gone, gone + 1)) }),
        });
      } },

    // 3 · And nothing on the ship was broken: cut wide, grey day, the ship whole and sailing on, every line in place
    { id: 'S3', start: at('L03') + C.L03.dur * .45, in: { type: 'cut' }, sfx: [{ t: .05, type: 'boom', v: .5 }, { t: 0, type: 'wind', d: 3, v: .4 }],
      build: E => layered(E, {
        light: [.05, .15, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .45, ambCol: '#8a98a0', sky: { stops: DAY }, on: false,
        layers: [
          { name: 'far', z: -.115, trans: .45, draw: seaNear('#6f8284', '#7c8f90', .04, .006) },
          ship('ship', .12, .0, .05, -.095, { col: A.near, sail: SAIL, sails: 'half' }),
          { name: 'mid', z: -.07, trans: .3, draw: seaNear('#43585a', '#506567', .025, .011) },
          { name: 'near', z: -.04, trans: .1, draw: seaNear('#263334', '#314041', -.06, .015) },
        ],
        move: { ship: [[0, [-.01, 0, 0]], [E.dur, [.02, 0, 0]]] },
        update: (t, L) => bob(L, 'ship', t, .002, .02, 1.1),
        cam: [[0, [0, .07, .4, 0, .075, -.07]], [E.dur, [0, .08, .56, 0, .08, -.07]]],
        focus: -.095, aper: 12, grade: { sat: .7, lift: [.01, .012, .02] },
      }) },

    // 4 · December 4th: through the Dei Gratia's spyglass, a round window on the grey sea; the ship swims into the circle
    { id: 'S4', start: at('L04') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'waves', d: 4, v: .55 }, { t: .4, type: 'bell', v: .5 }, { t: C.L04.dur * .5, type: 'click', v: .6 }],
      build: E => {
        const az = E.word('L04', 8);
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .45, ambCol: '#8a98a0', sky: { stops: DAY }, on: false,
          layers: [
            { name: 'far', z: -.115, trans: .45, draw: seaNear('#6f8284', '#7c8f90', .06, .006) },
            ship('ship', .09, -.03, .066, -.105, { col: A.near, sail: SAIL, sails: 'half' }),
            { name: 'mid', z: -.09, trans: .3, draw: seaNear('#43585a', '#506567', .05, .01) },
            { name: 'glass', z: -.05, trans: .03, draw: x => { x.fillStyle = '#0d1212'; x.fillRect(-.25, -.45, .5, .9);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(0, .085, .085, 0, Math.PI * 2); x.fill(); x.restore();
              x.strokeStyle = '#3a3226'; x.lineWidth = .006; x.beginPath(); x.arc(0, .085, .087, 0, Math.PI * 2); x.stroke();
              x.lineWidth = .0012; x.strokeStyle = '#1a1612'; x.beginPath(); x.moveTo(-.085, .085); x.lineTo(.085, .085); x.moveTo(0, 0); x.lineTo(0, .17); x.stroke(); } },
          ],
          move: { ship: [[0, [-.06, 0, 0]], [az, [0, 0, 0]], [E.dur, [.01, 0, 0]]], glass: [[0, [.01, -.006, 0]], [E.dur, [-.006, .004, 0]]] },
          update: (t, L) => bob(L, 'ship', t, .002, .03, 1.2),
          cam: [[0, [0, .085, .4, 0, .085, -.07]], [E.dur, [0, .085, .34, 0, .085, -.07]]],
          focus: -.1, aper: 12, grade: { sat: .68, lift: [.01, .012, .02] },
        });
      } },

    // 5 · Her sails half set: low under the foremast, the set sails pull and slacken; on the quarterdeck the wheel turns by
    //     itself, a little left, a little right. Nobody answers.
    { id: 'S5', start: at('L05') - .3, in: { type: 'cut' }, sfx: [{ t: 0, type: 'wind', d: 4, v: .6 }, { t: .5, type: 'door-creak', v: .45 }, { t: C.L05.dur * .55 + .3, type: 'whoosh', v: .3 }],
      build: E => layered(E, {
        light: [-.04, .16, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .45, ambCol: '#8a98a0', sky: { stops: DAY }, on: false,
        layers: [
          { name: 'rig', z: -.11, trans: .3, draw: x => brigantine(x, { cx: .1, by: -.1, s: .42, col: '#2a3436', sail: SAILD, sails: 'half' }) },
          { name: 'sail', z: -.1, trans: .35, w: .2, h: .07, x: .17, y: .13, draw: x => { x.fillStyle = SAIL; x.beginPath(); x.moveTo(-.09, .03); x.lineTo(.09, .03); x.quadraticCurveTo(.1, 0, .085, -.03); x.lineTo(-.085, -.03); x.quadraticCurveTo(-.1, 0, -.09, .03); x.fill(); } },
          { name: 'deck', z: -.07, trans: .08, draw: x => { x.fillStyle = A.near; x.fillRect(-.25, -.45, .5, .47); x.fillRect(-.25, .02, .5, .006); x.fillRect(-.1, .02, .01, .03); } },
          { name: 'wheel', z: -.06, trans: .06, w: .08, h: .08, x: -.1, y: .065, draw: x => shipWheel(x, { cx: 0, cy: 0, r: .026, col: '#2a1c10' }) },
          { name: 'post', z: -.058, trans: .04, draw: x => { x.fillStyle = '#1a120a'; x.fillRect(-.106, .02, .012, .045); } },
        ],
        update: (t, L) => { L.wheel.rotation.z = .6 * Math.sin(t * .9) + .25 * Math.sin(t * 2.3); L.sail.scale.y = 1 + .12 * Math.sin(t * 2.1); L.sail.position.x = L.sail.userData.p0.x + .004 * Math.sin(t * 2.1); },
        cam: [[0, [.12, .14, .4, .14, .13, -.07]], [E.cue('L05') + C.L05.dur * .5, [.04, .1, .42, .03, .1, -.07]], [E.dur, [-.08, .075, .3, -.09, .07, -.07]]],
        focus: [[0, -.1], [E.cue('L05') + C.L05.dur * .5, -.08], [E.dur, -.06]], aper: 18, grade: { sat: .7, lift: [.01, .012, .02] },
      }) },

    // 6 · Captain Morehouse sends two men across: a small boat rows from the Dei Gratia (left) to the silent ship (right)
    { id: 'S6', start: at('L06') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'water', d: 3.2, v: .55 }, { t: 0, type: 'waves', d: 4, v: .45 }],
      build: E => layered(E, {
        light: [0, .15, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .45, ambCol: '#8a98a0', sky: { stops: DAY }, on: false,
        layers: [
          { name: 'far', z: -.115, trans: .45, draw: seaNear('#6f8284', '#7c8f90', .05, .006) },
          ship('dg', .1, -.14, .055, -.11, { col: '#3e4c4e', sail: '#aaa592', sails: 'full', boat: true }),
          ship('mc', .11, .12, .05, -.1, { col: A.near, sail: SAIL, sails: 'half' }),
          { name: 'mid', z: -.085, trans: .3, draw: seaNear('#43585a', '#506567', .035, .01) },
          { name: 'boat', z: -.08, trans: .05, w: .05, h: .04, x: -.08, y: .03, shadow: false, draw: x => { rowboat(x, { cx: 0, by: -.006, s: .03, col: '#141c1e' });
            neighbor(x, { cx: -.006, by: -.001, s: .014, lantern: false, col: '#141c1e' }); neighbor(x, { cx: .007, by: -.001, s: .014, lantern: false, col: '#141c1e' }); } },
          { name: 'near', z: -.05, trans: .1, draw: seaNear('#263334', '#314041', -.04, .015) },
        ],
        move: { boat: [[0, [0, 0, 0]], [E.dur, [.13, .005, 0]]] },
        update: (t, L) => { bob(L, 'dg', t, .002, .02, 1.0); bob(L, 'mc', t, .002, .025, 1.25); L.boat.rotation.z = .06 * Math.sin(t * 3.2); },
        cam: [[0, [-.06, .07, .46, -.05, .07, -.07]], [E.dur, [.06, .075, .42, .07, .075, -.07]]],
        focus: -.085, aper: 12, grade: { sat: .7, lift: [.01, .012, .02] },
      }) },

    // 7 · No one on deck. No one below: the empty deck, a coil of rope, the forehatch open; on "below" the camera drops into the
    //     square of dark under the hatch
    { id: 'S7', start: at('L07') - .3, in: { type: 'cut' }, sfx: [{ t: .2, type: 'steps', n: 5, every: .38, v: .6 }, { t: C.L07.dur * .55 + .3, type: 'door-creak', v: .6 }],
      build: E => {
        const below = E.word('L07', 6) - .3;
        return layered(E, {
          light: [0, .15, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .42, ambCol: '#8a98a0', sky: { stops: DAY }, on: false,
          layers: [
            { name: 'masts', z: -.12, trans: .3, draw: x => { x.fillStyle = '#4a5658'; x.fillRect(-.06, -.1, .012, .5); x.fillRect(.09, -.1, .01, .5); x.fillRect(-.16, .2, .2, .006); x.fillRect(.01, .24, .17, .005); } },
            { name: 'deck', z: -.085, trans: .1, draw: x => { x.fillStyle = A.mid; x.beginPath(); x.moveTo(-.25, -.45); x.lineTo(-.25, .04); x.lineTo(.25, .04); x.lineTo(.25, -.45); x.fill();
              x.fillStyle = '#34403f'; for (let i = 0; i < 12; i++) x.fillRect(-.25, .04 - i * .018, .5, .0015);
              x.fillStyle = '#26302f'; x.fillRect(-.25, .04, .5, .012);
              x.fillStyle = '#060807'; x.fillRect(-.04, -.03, .08, .045); x.fillStyle = '#1f2827'; x.fillRect(-.046, .015, .092, .006); x.fillRect(-.046, -.036, .092, .006);
              x.strokeStyle = '#1a2120'; x.lineWidth = .003; for (let r = .004; r < .02; r += .004) { x.beginPath(); x.ellipse(.12, -.01, r * 1.6, r * .5, 0, 0, Math.PI * 2); x.stroke(); } } },
            { name: 'lid', z: -.08, trans: .05, draw: x => { x.fillStyle = '#2a2018'; x.save(); x.translate(-.075, .0); x.rotate(.25); x.fillRect(-.03, -.022, .06, .04); x.restore(); } },
          ],
          update: (t, L, S) => { S.U.uLit.value = 1 - .45 * ss(seg(t, below, below + .8)); },
          cam: [[0, [-.08, .1, .44, -.06, .09, -.07]], [below, [0, .07, .4, 0, .03, -.07]], [E.dur, [0, .0, .24, 0, -.01, -.07]]],
          focus: [[0, -.085], [E.dur, -.085]], aper: 16, grade: { sat: .7, lift: [.01, .012, .02] },
        });
      } },

    // 8 · Six months of food and water, clothes still folded: the cabin by the light of a porthole — sacks and casks on the
    //     shelf, a water butt, a neat stack of shirts on the bunk. A slow pan from the stores to the bunk.
    { id: 'S8', start: at('L08') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'room', d: 4, v: .4 }, { t: .3, type: 'water', d: 3, v: .25 }],
      build: E => layered(E, {
        light: [.06, .14, -.12], lightR: .14, lightCol: A.light, key: .65, amb: .32, ambCol: '#7a6a58', sky: { stops: HOLD }, on: false,
        layers: [
          { name: 'wall', z: -.11, trans: .12, glow: 2, glowCol: '#f2e2c0', draw: x => { x.fillStyle = '#3a2a1c'; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#33251a'; for (let i = 0; i < 14; i++) x.fillRect(-.25, -.45 + i * .065, .5, .002);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(.07, .19, .016, 0, Math.PI * 2); x.fill(); x.restore();
              x.strokeStyle = '#6a5038'; x.lineWidth = .003; x.beginPath(); x.arc(.07, .19, .018, 0, Math.PI * 2); x.stroke(); },
            glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(.07, .19, .016, 0, Math.PI * 2); g.fill(); } },
          { name: 'stores', z: -.09, trans: .06, draw: x => { x.fillStyle = '#1a120c'; x.fillRect(-.22, .12, .2, .006); x.fillRect(-.22, .05, .2, .006);
              for (const [px, py, w, h] of [[-.2, .126, .03, .04], [-.165, .126, .028, .036], [-.13, .126, .03, .042], [-.095, .126, .026, .034], [-.06, .126, .03, .04]]) { x.fillStyle = '#6a5034'; x.beginPath(); x.ellipse(px + w / 2, py + h * .45, w / 2, h * .5, 0, 0, Math.PI * 2); x.fill(); }
              for (const px of [-.2, -.16, -.12, -.08]) barrel(x, { cx: px + .016, by: .056, w: .03, h: .045, col: '#4a3220' });
              barrel(x, { cx: -.1, by: -.07, w: .07, h: .1, col: '#4a3220' }); } },
          { name: 'bunk', z: -.075, trans: .05, draw: x => { x.fillStyle = '#20160e'; x.fillRect(.0, -.02, .25, .1); x.fillStyle = '#5a4a3a'; x.fillRect(.01, .065, .23, .015);
              const shirts = ['#d8cfb8', '#9aa6a8', '#c9b48e', '#b8c0c0']; shirts.forEach((c, i) => { x.fillStyle = c; x.fillRect(.08, .08 + i * .009, .07, .008); });
              x.fillStyle = '#6a3a30'; x.fillRect(.17, .08, .05, .012); } },
          { name: 'fg', z: -.04, trans: .03, draw: x => { x.fillStyle = '#0e0a07'; x.fillRect(-.25, -.45, .5, .43); } },
        ],
        glows: { wall: [[0, .9]] },
        beams: [{ x: .07, y: .19, z: -.105, len: .3, width: .03, rot: () => Math.PI * 1.22, k: () => .35 }],
        cam: [[0, [-.12, .12, .36, -.12, .11, -.07]], [E.dur, [.11, .1, .36, .12, .1, -.07]]],
        focus: [[0, -.09], [E.dur, -.075]], aper: 18, grade: { sat: .8 },
      }) },

    // 9 · 1,701 barrels of alcohol: the hold, rows of casks going back into the dark, "1701 BBLS" chalked on a beam; a low
    //     truck along the rows by a hanging lantern
    { id: 'S9', start: at('L09') - .3, in: { type: 'cut' }, sfx: [{ t: .2, type: 'door-creak', v: .4 }, { t: 0, type: 'room', d: 4, v: .35 }],
      build: E => {
        const n = E.word('L09', 2);
        const rows = (z, col, by, w, h, seed, name) => ({ name, z, trans: .06, draw: x => { for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) barrel(x, { cx: -.25 + (i + (r ? .5 : 0)) * w * 1.02 + (seed % 3) * .004, by: by + r * h * .92, w, h, col: r ? col : '#2a1c10', band: '#120c06' }); } });
        return layered(E, {
          light: [0, .16, -.11], lightR: .1, lightCol: '#ffc878', key: .55, amb: .26, ambCol: '#6a5038', sky: { stops: HOLD }, on: false,
          layers: [
            rows(-.12, '#3a2818', .02, .03, .045, 1, 'r3'),
            { name: 'beam', z: -.1, trans: .05, draw: x => { x.fillStyle = '#1a120a'; x.fillRect(-.25, .19, .5, .025); text(x, '1701 BBLS · GENOA', -.03, .2025, .011, '"Anton"', { fill: '#d8cfb8' }); } },
            rows(-.09, '#4a3220', -.02, .042, .06, 2, 'r2'),
            { name: 'lamp', z: -.08, trans: .3, glow: 3, glowCol: '#ffc878', w: .03, h: .06, x: .03, y: .155, ay: .025, shadow: false,
              draw: x => hangLantern(x, { cx: 0, cy: -.01, r: .008, string: .025 }), glowDraw: g => hangLantern(null, { cx: 0, cy: -.01, r: .008 }, g) },
            rows(-.06, '#5a3c24', -.09, .06, .085, 3, 'r1'),
          ],
          glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
          update: (t, L, S) => { L.lamp.rotation.z = .12 * Math.sin(t * 1.4); S.U.uLight.value.set(.03 + .02 * Math.sin(t * 1.4), .15, -.08); },
          cam: [[0, [-.08, .1, .4, -.06, .1, -.07]], [n, [-.02, .11, .38, 0, .12, -.07]], [E.dur, [.06, .1, .36, .07, .1, -.07]]],
          focus: -.09, aper: 18, grade: { sat: .85 },
        });
      } },

    // 10 · Only one thing is missing: the stern, grey sky, two empty davits with their ropes swinging. On "lifeboat" a pale
    //      outline of the boat flickers where it should hang, and is gone. (The image of the video.)
    { id: 'S10', start: at('L10') - .3, in: { type: 'cut' }, sfx: [{ t: 0, type: 'wind', d: 4, v: .7 }, { t: .3 + C.L10.dur * .6, type: 'boom', v: .7 }, { t: .3 + C.L10.dur * .62, type: 'whoosh', v: .5 }],
      build: E => {
        const lb = E.word('L10', 6) - .1;
        return layered(E, {
          light: [-.03, .18, -.13], lightR: .3, lightCol: A.light, key: .9, amb: .42, ambCol: '#8a98a0', sky: { stops: DAY }, on: false,
          layers: [
            { name: 'far', z: -.12, trans: .45, draw: seaNear('#6f8284', '#7c8f90', .0, .007) },
            { name: 'stern', z: -.08, trans: .1, draw: x => { x.fillStyle = A.near; x.fillRect(-.25, -.45, .5, .49); x.fillRect(-.25, .04, .5, .008);
              x.strokeStyle = A.near; x.lineCap = 'round'; x.lineWidth = .009; for (const d of [-.09, .07]) { x.beginPath(); x.moveTo(d, .04); x.quadraticCurveTo(d, .17, d + (d < 0 ? -.03 : .03), .17); x.stroke(); }
              x.fillStyle = '#2a3132'; x.fillRect(-.25, .015, .5, .003); } },
            { name: 'ropeL', z: -.078, trans: .05, w: .02, h: .1, x: -.12, y: .17, ay: .05, draw: x => { x.strokeStyle = '#2a2a22'; x.lineWidth = .0022; x.beginPath(); x.moveTo(0, .05); x.lineTo(0, -.03); x.stroke(); x.beginPath(); x.arc(0, -.035, .005, 0, Math.PI * 2); x.stroke(); } },
            { name: 'ropeR', z: -.078, trans: .05, w: .02, h: .1, x: .1, y: .17, ay: .05, draw: x => { x.strokeStyle = '#2a2a22'; x.lineWidth = .0022; x.beginPath(); x.moveTo(0, .05); x.lineTo(0, -.025); x.stroke(); x.beginPath(); x.arc(0, -.03, .005, 0, Math.PI * 2); x.stroke(); } },
            { name: 'ghost', z: -.079, trans: .5, glow: 1.6, glowCol: '#f2e2c0', w: .25, h: .08, x: -.01, y: .095, shadow: false,
              draw: x => { x.strokeStyle = '#efe6cf'; x.lineWidth = .002; x.setLineDash([.006, .004]); x.beginPath(); x.moveTo(-.11, .025); x.quadraticCurveTo(0, .015, .115, .03); x.quadraticCurveTo(.08, -.02, .02, -.02); x.lineTo(-.08, -.02); x.quadraticCurveTo(-.105, -.01, -.11, .025); x.stroke(); },
              glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = .0025; g.beginPath(); g.moveTo(-.11, .025); g.quadraticCurveTo(0, .015, .115, .03); g.quadraticCurveTo(.08, -.02, .02, -.02); g.lineTo(-.08, -.02); g.quadraticCurveTo(-.105, -.01, -.11, .025); g.stroke(); } },
          ],
          glows: { ghost: [[0, 0], [lb, 0], [lb + .1, 1], [lb + .9, .8], [lb + 1.4, 0]] },
          update: (t, L) => { L.ropeL.rotation.z = .18 * Math.sin(t * 1.7); L.ropeR.rotation.z = .16 * Math.sin(t * 1.5 + 1);
            const k = seg(t, lb, lb + 1.4); L.ghost.visible = k > 0 && k < 1 && (k > .5 || Math.sin(t * 60) > -.3); },
          cam: [[0, [0, .07, .46, 0, .09, -.07]], [lb, [0, .09, .36, 0, .1, -.07]], [E.dur, [0, .1, .34, 0, .105, -.07]]],
          focus: -.08, aper: 14, grade: { sat: .66, contrast: .14, lift: [.01, .012, .02] },
        });
      } },

    // 11 · The last note on the log slate: the slate in chalk by lantern light — 25 Nov, 8 a.m., Santa Maria six miles off.
    //      A slow push; the lantern swings; on "nine" the date is underlined.
    { id: 'S11', start: at('L11') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'clock', d: 3.5, v: .4 }, { t: .3 + C.L11.dur * .7, type: 'click', v: .5 }],
      build: E => {
        const nine = E.word('L11', 8);
        return layered(E, {
          light: [.08, .16, -.11], lightR: .11, lightCol: '#ffc878', key: .6, amb: .3, ambCol: '#6a5038', sky: { stops: HOLD }, on: false,
          layers: [
            { name: 'desk', z: -.1, trans: .05, draw: x => { x.fillStyle = '#3a2a1c'; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#2e2116'; for (let i = 0; i < 9; i++) x.fillRect(-.25 + i * .06, -.45, .002, .9); } },
            { name: 'slate', z: -.085, trans: .04, w: .2, h: .15, x: -.01, y: .12, draw: x => { x.fillStyle = '#6a5034'; x.fillRect(-.095, -.07, .19, .14); x.fillStyle = '#26302e'; x.fillRect(-.085, -.06, .17, .12);
              const ch = { fill: '#e6e2d4', weight: 500 };
              text(x, 'MARY CELESTE', 0, .042, .011, '"Anton"', ch); text(x, 'Nov 25 · 8 a.m.', 0, .015, .014, '"Cormorant"', ch);
              text(x, 'St. Mary\'s bore E.S.E.', 0, -.012, .011, '"Cormorant"', ch); text(x, '6 miles', 0, -.032, .011, '"Cormorant"', ch); } },
            { name: 'line', z: -.083, trans: .2, w: .1, h: .01, x: -.012, y: .124, shadow: false, recv: false, draw: x => { x.fillStyle = '#e8c787'; x.fillRect(-.045, -.0012, .09, .0024); } },
            { name: 'lamp', z: -.07, trans: .3, glow: 3, glowCol: '#ffc878', w: .04, h: .08, x: .09, y: .2, ay: .035, shadow: false,
              draw: x => hangLantern(x, { cx: 0, cy: -.015, r: .01, string: .03 }), glowDraw: g => hangLantern(null, { cx: 0, cy: -.015, r: .01 }, g) },
          ],
          glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
          update: (t, L, S) => { L.lamp.rotation.z = .1 * Math.sin(t * 1.2); S.U.uLight.value.set(.09 + .015 * Math.sin(t * 1.2), .17, -.07); const k = ss(seg(t, nine, nine + .4)); L.line.visible = k > 0; L.line.scale.x = Math.max(.001, k); },
          cam: [[0, [-.02, .12, .34, -.01, .12, -.07]], [E.dur, [-.01, .12, .27, -.01, .12, -.07]]],
          focus: -.085, aper: 20, grade: { sat: .85 },
        });
      } },

    // 12 · The legend, set apart: a cream page from the 1884 story, a table laid, a cup still steaming; a red LEGEND stamp
    //      lands on "Legend"
    { id: 'S12', start: at('L12') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'paper', v: .8 }, { t: .3 + C.L12.dur * .5, type: 'paper', v: 1.4 }],
      build: E => {
        const stamp = E.word('L12', 7) - .05;
        return layered(E, {
          light: [0, .08, -.13], lightR: .3, lightCol: '#ffe2ae', key: .9, amb: .45, ambCol: '#a08a6a', keyCol: '#ffe8c8', sky: { stops: PAGE }, on: false,
          layers: [
            { name: 'head', z: -.12, trans: .1, w: .26, h: .06, x: 0, y: .2, shadow: false, draw: x => { text(x, 'J. HABAKUK JEPHSON\'S STATEMENT', 0, .008, .012, '"Cormorant"', { fill: '#5a3e24', weight: 700 }); text(x, 'a story by A. Conan Doyle · 1884', 0, -.012, .01, '"Cormorant"', { fill: '#7a5a38', weight: 500 }); } },
            { name: 'room', z: -.1, trans: .1, draw: x => { x.fillStyle = '#6b4a2c'; x.fillRect(-.25, -.45, .5, .45); x.fillStyle = '#5a3d24'; for (let i = 0; i < 9; i++) x.fillRect(-.25 + i * .06, .0, .003, .16); } },
            { name: 'table', z: -.08, trans: .05, draw: x => { x.fillStyle = '#2b1a0e'; table(x, 0, .06, .17, .07);
              x.fillStyle = '#e6d3a8'; for (const px of [-.06, .05]) { x.beginPath(); x.ellipse(px, .066, .016, .004, 0, 0, Math.PI * 2); x.fill(); }
              x.fillStyle = '#efe4c8'; x.fillRect(-.01, .064, .016, .014); x.strokeStyle = '#efe4c8'; x.lineWidth = .002; x.beginPath(); x.arc(.009, .071, .004, -1.4, 1.4); x.stroke(); } },
            { name: 'steam', z: -.078, trans: .4, w: .04, h: .06, x: -.002, y: .1, shadow: false, recv: false, draw: x => { x.strokeStyle = 'rgba(255,248,230,.85)'; x.lineWidth = .0018; x.lineCap = 'round';
              for (const d of [-.004, .004]) { x.beginPath(); x.moveTo(d, -.02); x.bezierCurveTo(d + .006, -.008, d - .006, .004, d + .003, .02); x.stroke(); } } },
            { name: 'stamp', z: -.05, trans: .2, w: .16, h: .06, x: .03, y: .14, shadow: false, recv: false, finish: { rim: .5 },
              draw: x => { x.strokeStyle = '#b3302a'; x.lineWidth = .003; x.strokeRect(-.065, -.02, .13, .04); text(x, 'LEGEND', 0, -.001, .026, '"Anton"', { fill: '#b3302a' }); } },
            { name: 'fg', z: -.03, trans: .04, draw: x => { x.fillStyle = '#3a2614'; x.fillRect(-.25, -.45, .5, .38); x.fillStyle = '#2b1a0e'; x.fillRect(-.25, -.07, .5, .006); } },
          ],
          update: (t, L) => {
            const k = seg(t, stamp, stamp + .18), s = L.stamp;
            s.visible = k > 0; s.scale.setScalar(1 + 1.2 * (1 - ss(k))); s.rotation.z = -.12;
            L.steam.position.y = L.steam.userData.p0.y + .004 * Math.sin(t * 1.6); L.steam.material.color.setScalar(1 - .7 * ss(seg(t, stamp, stamp + .6)));
          },
          cam: [[0, [-.04, .08, .44, -.03, .08, -.07]], [stamp, [.02, .09, .46, .02, .09, -.07]], [E.dur, [.02, .1, .5, .02, .1, -.07]]],
          focus: -.08, aper: 18, grade: { sat: .9, gain: [1.06, 1, .9] },
        });
      } },

    // 13 · The best guess is a scare: back in the hold, the lantern swings, and pale fumes curl up from the casks; on "fumes"
    //      the light turns red (allarme) and the camera jolts closer
    { id: 'S13', start: at('L13') - .3, in: { type: 'cut' }, sfx: [{ t: .2, type: 'rumble', d: 3, v: .5 }, { t: .3 + C.L13.dur * .55, type: 'whoosh', v: .5 }, { t: .3 + C.L13.dur * .8, type: 'door-creak', v: .5 }],
      build: E => {
        const fm = E.word('L13', 6) - .1;
        const fumes = (name, z, x0, seed) => ({ name, z, trans: .5, w: .5, h: .3, x: x0, y: .06, shadow: false, recv: false,
          draw: x => { x.strokeStyle = 'rgba(220,214,190,.55)'; x.lineWidth = .004; x.lineCap = 'round'; for (let i = 0; i < 7; i++) { const px = -.2 + i * .065 + seed * .01;
            x.beginPath(); x.moveTo(px, -.1); x.bezierCurveTo(px + .02, -.05, px - .025, .0, px + .01, .06); x.bezierCurveTo(px + .03, .09, px - .01, .12, px + .005, .14); x.stroke(); } } });
        return layered(E, {
          light: [0, .14, -.11], lightR: .11, lightCol: '#ffc878', key: .55, amb: .26, ambCol: '#6a5038', sky: { stops: HOLD }, on: false,
          layers: [
            { name: 'back', z: -.12, trans: .06, draw: x => { for (let i = 0; i < 12; i++) barrel(x, { cx: -.24 + i * .043, by: .0, w: .042, h: .06, col: '#3a2818', band: '#120c06' }); } },
            fumes('f1', -.1, 0, 1),
            { name: 'front', z: -.08, trans: .06, draw: x => { for (let i = 0; i < 9; i++) barrel(x, { cx: -.24 + i * .06, by: -.08, w: .058, h: .085, col: '#5a3c24', band: '#120c06' }); } },
            fumes('f2', -.075, .02, 4),
            { name: 'lamp', z: -.07, trans: .3, glow: 3, glowCol: '#ffc878', w: .03, h: .06, x: -.03, y: .16, ay: .025, shadow: false,
              draw: x => hangLantern(x, { cx: 0, cy: -.01, r: .008, string: .025 }), glowDraw: g => hangLantern(null, { cx: 0, cy: -.01, r: .008 }, g) },
          ],
          glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
          update: (t, L, S) => { L.lamp.rotation.z = .2 * Math.sin(t * 2); L.f1.position.y = L.f1.userData.p0.y + .02 * (t % 3) / 3; L.f2.position.y = L.f2.userData.p0.y + .025 * ((t + 1.4) % 3) / 3;
            L.f1.position.x = L.f1.userData.p0.x + .006 * Math.sin(t); L.f2.position.x = L.f2.userData.p0.x + .006 * Math.sin(t * 1.3 + 2);
            const k = ss(seg(t, fm, fm + .4)); S.U.uLightCol?.value?.setRGB?.(1, lerp(.78, .45, k), lerp(.47, .3, k)); },
          cam: [[0, [.04, .08, .42, .03, .08, -.07]], [fm, [0, .08, .38, 0, .08, -.07]], [fm + .2, [0, .085, .3, 0, .085, -.07]], [E.dur, [-.02, .09, .28, -.02, .09, -.07]]],
          focus: -.085, aper: 18, grade: t => ({ sat: .85, gain: [1 + .12 * ss(seg(t, fm, fm + .4)), 1 - .06 * ss(seg(t, fm, fm + .4)), 1 - .1 * ss(seg(t, fm, fm + .4))] }),
        });
      } },

    // 14 · Maybe they waited in the lifeboat, on a rope behind the ship: night fog, the ship sails right, the little boat
    //      trails behind on a long line, ten tiny figures in it. "The ship sailed on": the line parts, the ship slides away
    //      into the fog, the boat drifts and fades. "Never seen again": only sea.
    { id: 'S14', start: at('L14') - .3, in: { type: 'dissolve', dur: .7 },
      sfx: [{ t: 0, type: 'waves', d: end('L15') - at('L14') + 1, v: .55 }, { t: 0, type: 'wind', d: end('L15') - at('L14') + 1, v: .4 }, { t: at('L15') - at('L14') + .1, type: 'crack', v: .55 }, { t: at('L15') - at('L14') + 1.2, type: 'foghorn', v: .35 }],
      build: E => {
        const snap = E.cue('L15') - .1, nev = E.word('L15', 6);
        return layered(E, {
          light: [.02, .17, -.13], lightR: .24, lightCol: T.light, key: .65, amb: .32, sky: { stops: NIGHT, stars: 40 }, on: false,
          layers: [
            moonL(-.07, .2, .016),
            { name: 'far', z: -.115, trans: .45, draw: seaNear('#4a6264', '#587274', .03, .006) },
            ship('ship', .1, .07, .045, -.1, { sail: SAIL, sails: 'half' }),
            { name: 'line', z: -.095, trans: .2, w: .16, h: .02, x: -.03, y: .049, shadow: false, recv: false, draw: x => { x.strokeStyle = '#141c1e'; x.lineWidth = .0012; x.beginPath(); x.moveTo(-.07, .0); x.quadraticCurveTo(0, -.004, .07, .002); x.stroke(); } },
            { name: 'boat', z: -.095, trans: .1, w: .05, h: .03, x: -.11, y: .048, shadow: false, draw: x => { rowboat(x, { cx: 0, by: -.006, s: .032, col: '#141c1e' });
              x.fillStyle = '#141c1e'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-.011 + i * .0045, .0005 + (i % 2) * .001, .0016, 0, Math.PI * 2); x.fill(); } } },
            { name: 'mid', z: -.075, trans: .3, draw: seaNear('#2a3c3e', '#36494b', .02, .011) },
            { name: 'fog', z: -.06, trans: .5, shadow: false, recv: false, draw: fog('rgba(170,186,184,.22)', .03, 2) },
            { name: 'near', z: -.04, trans: .1, draw: seaNear('#121c1c', '#1d2a2a', -.06, .015) },
          ],
          glows: { moon: [[0, 1]] },
          move: { ship: [[0, [0, 0, 0]], [snap, [.012, 0, 0]], [E.dur, [.13, 0, 0]]], line: [[0, [0, 0, 0]], [snap, [.012, 0, 0]]], boat: [[0, [0, 0, 0]], [snap, [.012, 0, 0]], [E.dur, [-.005, -.002, 0]]],
            fog: [[0, [0, 0, 0]], [E.dur, [-.04, 0, 0]]] },
          update: (t, L) => { bob(L, 'ship', t, .002, .02); bob(L, 'boat', t, .002, .08, 1.7); L.line.visible = t < snap;
            const k = ss(seg(t, nev - .3, nev + .9)); L.boat.material.color.setScalar(1 - k); L.boat.visible = k < .99; },
          cam: [[0, [-.03, .07, .4, -.03, .07, -.07]], [snap, [-.02, .07, .42, -.02, .07, -.07]], [E.dur, [-.06, .08, .52, -.06, .075, -.07]]],
          focus: -.095, aper: 14, grade: { sat: .75 },
        });
      } },

    // 15 · Your theory: night on a headland of Santa Maria, the fox with its lantern, the only light, watching the ship sail
    //      off half-rigged on the horizon. FUMES, FALSE ALARM and SOMETHING ELSE? are cut paper, then the title.
    { id: 'S15', start: at('L16') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L16') + .5, v: .5 }, { t: .3, type: 'chime', v: .5 }, { t: .5, type: 'paper' }, { t: 1.4, type: 'paper' }, { t: 2.3, type: 'paper' }],
      build: E => {
        const a = E.word('L16', 0), b = E.word('L16', 2), c = E.word('L16', 4) - .2, titleAt = E.cueEnd('L16') + .7;
        const sign = (name, s, cx, cy, w, fill) => ({ name, z: -.05, trans: .25, w: w + .01, h: .034, x: cx, y: cy, shadow: false, recv: false, finish: { rim: .6 },
          draw: x => { x.fillStyle = '#f1dbac'; x.fillRect(-w / 2, -.014, w, .028); text(x, s, 0, -.0005, .015, '"Anton"', { fill }); } });
        return layered(E, {
          light: [-.06, .07, -.12], lightR: .12, lightCol: '#ffc878', key: .5, amb: .26, sky: { stops: NIGHT, stars: 170 }, on: false,
          layers: [
            moonL(.1, .21, .014),
            ship('ship', .05, .1, .085, -.12, { sail: SAIL, sails: 'half', trans: .4 }),
            { name: 'far', z: -.11, trans: .4, draw: seaNear('#4a6264', '#587274', .08, .007) },
            { name: 'head', z: -.075, trans: .15, draw: x => { x.fillStyle = T.mid; cliffRich(x, { x0: -.26, x1: .04, base: -.06, top: .05, side: -1, strata: '#2a3c3e' }); } },
            { name: 'fox', z: -.068, trans: .2, glow: 3.2, w: .14, h: .14, x: -.07, y: .1, ay: -.05,
              draw: x => fox(x, { cx: 0, by: -.05, s: .07, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.05, s: .07, lantern: true }, g) },
            sign('A', 'FUMES', -.06, .2, .05, '#2a3c3e'), sign('B', 'FALSE ALARM', .05, .2, .08, '#2a3c3e'), sign('C', 'SOMETHING ELSE?', 0, .163, .1, '#e8743b'),
            { name: 'title', z: -.045, trans: .3, w: .18, h: .04, x: 0, y: .245, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => text(x, 'Lantern Fox Tales', 0, 0, .013, '"Cormorant"', { fill: '#f1dbac', weight: 600 }) },
            { name: 'fg', z: -.025, trans: .03, draw: x => { x.fillStyle = '#070b0b'; foreground(x, { base: -.12, seed: 13, reedsAt: [-.2, -.05], reedsN: 18, stones: 5 }); } },
          ],
          glows: { fox: [[0, 1]], moon: [[0, 1]] }, flicker: ['fox'],
          move: { ship: [[0, [0, 0, 0]], [E.dur, [.03, 0, 0]]] },
          update: (t, L) => { reveal(L, 'A', t, a); reveal(L, 'B', t, b); reveal(L, 'C', t, c); reveal(L, 'title', t, titleAt); L.far.position.y = L.far.userData.p0.y + .002 * Math.sin(t * 1.2); bob(L, 'ship', t, .001, .02); },
          cam: [[0, [-.08, .08, .4, -.07, .085, -.07]], [E.cue('L16'), [-.01, .1, .5, 0, .11, -.07]], [E.dur, [0, .12, .58, 0, .13, -.07]]],
          focus: [[0, -.068], [a, -.068], [a + .5, -.05]], aper: 14,
        });
      } },
  ];
}
