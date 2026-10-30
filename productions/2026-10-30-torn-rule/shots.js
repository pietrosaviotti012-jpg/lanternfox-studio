// TEST · The Torn Rule · Part 1 (Rules) — shot list. At 3:07 am every phone in the city gets the same four rules; rule three
// arrives torn in half, and your neighbors already know the rest. Rule one on the TV (the radio voice), rule two and the city
// going dark, rule four on a cream rules sheet, the torn rule three close up; a whispered message from an unknown number;
// one tiny light on the roof across the road (the fox, in a corner); the windows aren't empty: from the revelation on the theme
// turns from regole/notte to regole/allarme (eyes in every window, three knocks, the tall shadow at the peephole, the monster's line).
// The end holds your dark house, the shadow at the door, the neighbors in the street and the fox's lantern under ANSWER or SILENT.
// Subjects sit between 15 % and 52 % of the frame height (the series tag and clock above, the pop captions below).
// Scene checks (pipeline/VISIVO.md): the rules card is flat, still and inside the margins (captions off on its lines);
// the night and alarm scenes use a lifted sky and lighter sheets so houses and people read; your face carries its own light.
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { houses, house, neighbor, phone, person, tvSet, couch, foreground, lurkers, tallShadow, foxCameo, doorFrame } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';
import { seg, ss } from './engine/lib.js';

const T = theme('regole', 'notte'), A = theme('regole', 'allarme');
const CREAM = '#efe8d8', INK = '#14110d';
const YOU = { coat: '#4f9a72', hat: false, pants: '#1d2a26' };   // you: a green puffer, the one colour of the video
const ROOM = [[0, '#020403'], [1, '#07100c']];
// lifted night and alarm palettes: a bright horizon behind the roofs, dark sheets that still read against it
const NSKY = [[0, '#05100a'], [.25, '#123323'], [.45, '#2f6e50'], [.6, '#4c9a74'], [1, '#5aa882']];
const ASKY = [[0, '#120404'], [.25, '#3a0b0b'], [.45, '#7a1a14'], [.6, '#a8301f'], [1, '#c04a2a']];
const N = { far: '#1f4a38', mid: '#163a2b', near: '#0e2219', glass: '#081610' };
const R = { far: '#3a0a08', mid: '#5a140e', ground: '#7a1a14', near: '#240705', glass: '#200605', lit: '#c43a28' };
const TAU = Math.PI * 2;
// the face's own light: the head glows softly, eyes and mouth stay dark (same geometry as person())
const faceGlow = (g, { cx, by, s, face }) => {
  const hr = s * .16, hy = by + s * .78, ex = hr * .36, ey = hy + hr * .05, big = face === 'scared' || face === 'surprised';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.fill();
  g.fillStyle = '#000'; for (const d of [-1, 1]) { g.beginPath(); g.arc(cx + d * ex, ey, hr * (big ? .09 : .11), 0, TAU); g.fill(); }
  g.fillRect(cx - hr * .28, hy - hr * .52, hr * .56, hr * .2);
};
const FACE = { glow: .6, glowCol: '#f6e8d6' };

const fill = col => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9); };
// a wall with a window cut in it (the sky panel shows through the hole)
const wall = (col, win) => x => {
  x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(...win); x.restore();
  const [wx, wy, ww, wh] = win; x.fillStyle = col;
  x.fillRect(wx, wy + wh / 2 - .002, ww, .004); x.fillRect(wx + ww / 2 - .002, wy, .004, wh);
};
const ground = (col, base, seed) => x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt: [-.2, .18], reedsN: 10, stones: 3, amp: .003 }); };
// you, holding the phone up to your face; the screen glows green on its own sheet
const youLayers = (face, z = -.07, by = -.02, s = .16) => [
  { name: 'you', z, trans: .02, ...FACE, draw: x => person(x, { ...YOU, cx: 0, by, s, face }), glowDraw: g => faceGlow(g, { cx: 0, by, s, face }) },
  { name: 'ph', z: z + .006, trans: .05, glow: 1.6, glowCol: T.glow, w: .05, h: .07, x: s * .19, y: by + s * .5,
    draw: x => phone(x, { cx: 0, cy: 0, w: s * .14, h: s * .25, screen: '#13261c' }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: s * .14, h: s * .25 }, g) },
];
// the rules card: cream paper, black type, rule three torn across; a flat card well inside the frame (x ±0.05, y 0.057-0.138,
// 15-52 % of the height under CARD_CAM). The piece with rule four is its own sheet; in S7 it sits a little lower, still.
const RULES = ['1. STAY INSIDE UNTIL 6:00 AM.', '2. KEEP EVERY LIGHT OFF.', '3. IF SOMEONE KNOCKS THREE TIMES,'];
const CX0 = -.05, CX1 = .05, CTOP = .138, CBOT = .057, TL = -.042;
const jag = (x, y, seed, back) => { for (let i = 0; i <= 20; i++) { const j = back ? 20 - i : i; x.lineTo(CX0 + j * .005, y + ((j * 7919 + seed * 31) % 9 - 4) * .0006); } };
const sheetTop = (red = false) => x => {
  x.fillStyle = CREAM; x.beginPath(); x.moveTo(CX0, CTOP); x.lineTo(CX1, CTOP); jag(x, .0815, 3, true); x.closePath(); x.fill();
  text(x, 'THE FOUR RULES', TL, .129, .008, '"Anton"', { fill: T.tag, align: 'left' });
  x.fillStyle = INK; x.fillRect(TL, .1225, .084, .0009);
  RULES.forEach((r, i) => text(x, r, TL, .1115 - i * .011, .0055, '"Anton"', { fill: red && i === 2 ? T.tag : INK, align: 'left' }));
};
const sheetLow = x => {
  x.fillStyle = CREAM; x.beginPath(); x.moveTo(CX0, .076); jag(x, .076, 5); x.lineTo(CX1, CBOT); x.lineTo(CX0, CBOT); x.closePath(); x.fill();
  text(x, '4. NEVER ANSWER IN YOUR', TL, .070, .0055, '"Anton"', { fill: INK, align: 'left' });
  text(x, 'OWN VOICE.', TL, .0625, .0055, '"Anton"', { fill: T.tag, align: 'left' });
};
// one fixed, square-on camera for the card (no move, no tilt): the frame is ±0.067 wide and 0.24 tall at the card
const CARD_CAM = [[0, [0, .058, .3, 0, .058, -.09]]];
// a facade across the road: a wall of six windows (two rows), dark glass; returns the window centres
const WINS = [[-.05, .06], [0, .06], [.05, .06], [-.05, .11], [0, .11], [.05, .11]];
const facade = (col, glass) => x => {
  x.fillStyle = col; x.fillRect(-.25, -.45, .5, .6); x.fillRect(-.12, .15, .24, .01);
  x.fillStyle = glass; for (const [wx, wy] of WINS) x.fillRect(wx - .014, wy - .018, .028, .036);
  x.fillStyle = col; for (const [wx, wy] of WINS) { x.fillRect(wx - .014, wy - .001, .028, .002); x.fillRect(wx - .001, wy - .018, .002, .036); }
};
const foxAt = (cx, by, s, z, pose = 'watch', flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose, flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose, flip }, g) });

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook: you by the dark window, the phone lighting your face green; the "4 RULES" alert drops on frame 0
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: 6, v: .5 }, { t: .1, type: 'crack', v: .5 }, { t: .2, type: 'thunder', v: .5 }, { t: .3, type: 'click', v: .3 }],
      build: E => layered(E, {
        light: [.03, .09, -.08], lightR: .09, lightCol: T.light, key: .8, amb: .4, ambCol: '#4a6a5a', sky: { stops: T.sky, stars: 70 }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall(T.near, [-.11, .07, .1, .12]) },
          ...youLayers('surprised'),
          { name: 'fg', z: -.045, trans: .02, draw: x => { x.fillStyle = '#030605'; x.fillRect(-.25, -.45, .5, .43); } },
        ],
        glows: { ph: [[0, 1]] },
        cam: [[0, [.01, .05, .5, 0, .06, -.07]], [E.dur, [-.01, .065, .4, 0, .07, -.07]]],
        focus: -.065, aper: 18, grade: { sat: .9 },
      }) },

    // 2 · Rule three arrived torn in half: the phone close up, four rule lines on the screen, the third ripped with a jagged tear
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'whoosh', v: .5 }, { t: .15 + C.L02.dur * .5, type: 'paper', v: 1.2 }, { t: .15 + C.L02.dur * .5, type: 'thunder', v: .4 }],
      build: E => {
        const rip = E.word('L02', 3);
        return layered(E, {
          light: [0, .08, -.12], lightR: .1, lightCol: T.light, key: .5, amb: .25, sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'hand', z: -.1, trans: .04, draw: fill('#050a07') },
            { name: 'ph', z: -.085, trans: .04, glow: 1.4, glowCol: T.glow, w: .1, h: .15, x: 0, y: .06,
              draw: x => phone(x, { cx: 0, cy: 0, w: .07, h: .125, screen: '#0f1f17' }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: .07, h: .125 }, g) },
            { name: 'rules', z: -.083, trans: .2, shadow: false, recv: false, w: .07, h: .11, x: 0, y: .06,
              draw: x => { x.fillStyle = '#d8ffe4'; for (const [i, w] of [[0, .042], [1, .034], [3, .046]]) x.fillRect(-.024, .03 - i * .018, w, .004);
                x.fillStyle = '#ff5b4d'; x.beginPath(); x.moveTo(-.024, -.006); for (let i = 0; i <= 8; i++) x.lineTo(-.024 + i * .006, -.006 + (i % 2 ? .004 : -.003)); x.lineTo(.024, -.01); x.lineTo(-.024, -.01); x.closePath(); x.fill(); } },
          ],
          glows: { ph: [[0, 1]] },
          move: { rules: [[0, [0, 0, 0]], [rip, [0, 0, 0]], [rip + .15, [.001, -.002, .02]], [E.dur, [.001, -.002, .02]]] },
          cam: [[0, [0, .07, .36, 0, .07, -.085]], [rip - .05, [0, .07, .33, 0, .07, -.085]], [rip + .1, [0, .066, .27, 0, .066, -.085]], [E.dur, [.004, .066, .26, 0, .066, -.085]]],
          focus: -.083, aper: 22,
        });
      } },

    // 3 · Snapback: across the road your neighbors already stand in their yards, all facing your house, thin smiles catching the light
    { id: 'S3', start: at('L03') - .1, sfx: [{ t: .05, type: 'thunder', v: .6 }, { t: .1, type: 'crack', v: .5 }, { t: 0, type: 'wind', d: 5, v: .5 }],
      build: E => layered(E, {
        light: [0, .1, -.13], lightR: .14, lightCol: T.light, key: .45, amb: .25, sky: { stops: T.sky, stars: 120 }, on: false,
        layers: [
          { name: 'row', z: -.12, trans: .3, draw: x => { x.fillStyle = T.far; x.fillRect(-.25, -.45, .5, .5); houses(x, { x0: -.24, x1: .24, by: .05, h: .05, seed: 7, col: T.far, glass: '#0d1f17', lit: false }); } },
          { name: 'street', z: -.095, trans: .08, draw: x => { x.fillStyle = T.mid; x.fillRect(-.25, -.45, .5, .49); } },
          { name: 'ppl', z: -.09, trans: .04, glow: 2, glowCol: T.glow,
            draw: x => [-.07, -.025, .02, .065].forEach((cx, i) => neighbor(x, { cx, by: .035 - i % 2 * .006, s: .075, lantern: false, smile: true, col: T.near })),
            glowDraw: g => [-.07, -.025, .02, .065].forEach((cx, i) => neighbor(null, { cx, by: .035 - i % 2 * .006, s: .075, lantern: false, smile: true }, g)) },
          { name: 'fg', z: -.05, trans: .02, draw: ground(T.near, .0, 11) },
        ],
        glows: { ppl: [[0, .4], [E.word('L03', 5), 1]] },
        cam: [[0, [-.03, .07, .5, -.01, .07, -.09]], [E.dur, [.02, .07, .4, 0, .07, -.09]]],
        focus: -.09, aper: 16,
      }) },

    // 4 · Rule one, on every TV: your living room lit green by the screen, you on the couch from behind (the alert is the tv overlay)
    { id: 'S4', start: at('L04') - .2, sfx: [{ t: .1, type: 'click', v: .6 }, { t: .15, type: 'crack', v: .35 }, { t: .3, type: 'thunder', v: .3 }],
      build: E => layered(E, {
        light: [0, .1, -.1], lightR: .1, lightCol: T.glow, key: .6, amb: .25, ambCol: '#3a6a50', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: fill('#0a1410') },
          { name: 'tv', z: -.1, trans: .03, glow: 2.4, glowCol: T.glow, draw: x => tvSet(x, { cx: 0, by: .04, w: .16, h: .14, col: '#020403', glass: '#0d1f17' }),
            glowDraw: g => tvSet(null, { cx: 0, by: .04, w: .16, h: .14, on: true }, g) },
          { name: 'couch', z: -.06, trans: .03, draw: x => couch(x, { cx: 0, by: -.02, w: .2, h: .08, col: '#0a120e', dark: '#040705' }) },
          { name: 'you', z: -.058, trans: .02, draw: x => neighbor(x, { cx: .02, by: -.01, s: .1, lantern: false, back: true, col: '#020403' }) },
        ],
        glows: { tv: [[0, .2], [.15, 1]] }, flicker: ['tv'],
        cam: [[0, [.03, .07, .46, 0, .075, -.1]], [E.dur, [-.01, .075, .4, 0, .08, -.1]]],
        focus: -.1, aper: 18,
      }) },

    // 5 · Rule two, every light stays off: the city skyline, windows going dark row by row on "off"
    { id: 'S5', start: at('L05') - .15, sfx: [{ t: 0, type: 'wind', d: 4, v: .5 }, { t: .15 + C.L05.dur * .8, type: 'whoosh', v: .5 }, { t: .15 + C.L05.dur * .85, type: 'thunder', v: .4 }],
      build: E => {
        const off = E.word('L05', 5);
        const row = (n, z, col, by, h, seed) => ({ name: n, z, trans: .2, glow: 2.6, glowCol: T.light,
          draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, by + .45); houses(x, { x0: -.24, x1: .24, by, h, seed, col, glass: '#0b1712', lit: true }); },
          glowDraw: g => houses(null, { x0: -.24, x1: .24, by, h, seed, lit: true }, g) });
        return layered(E, {
          light: [0, .12, -.13], lightR: .16, lightCol: T.light, key: .4, amb: .2, sky: { stops: T.sky, stars: 150 }, on: false,
          layers: [row('far', -.12, T.far, .08, .05, 3), row('mid', -.1, T.mid, .05, .055, 8), row('near', -.08, T.near, .02, .06, 13)],
          glows: { far: [[0, 1], [off + .3, 1], [off + .4, 0]], mid: [[0, 1], [off + .15, 1], [off + .25, 0]], near: [[0, 1], [off, 1], [off + .1, 0]] },
          cam: [[0, [0, .08, .5, 0, .08, -.1]], [E.dur, [0, .085, .56, 0, .085, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 6 · Rule four: the rules card in cream, black type, "OWN VOICE" in red; flat and still, inside the margins
    { id: 'S6', start: at('L06') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .1, type: 'paper', v: .8 }, { t: 0, type: 'wind', d: end('L06') - at('L06') + 1, v: .35 }],
      build: E => layered(E, {
        light: [0, .08, -.13], lightR: .2, lightCol: '#fff4e0', key: .9, amb: .7, ambCol: '#d8d0c0', sky: { stops: [[0, '#1a1712'], [1, '#2a251c']] }, on: false,
        layers: [
          { name: 'top', z: -.09, trans: .25, draw: sheetTop() },
          { name: 'low', z: -.089, trans: .25, draw: sheetLow },
        ],
        cam: CARD_CAM,
        focus: -.09, aper: 30, grade: { sat: .9 },
      }) },

    // 7 · Rule three just stops: the same card, same framing; rule three now in red and the torn piece fallen a little lower
    { id: 'S7', start: at('L07') - .2, sfx: [{ t: .2 + C.L07.dur * 6 / 9, type: 'paper', v: 1.2 }, { t: .2 + C.L07.dur * 6 / 9, type: 'thunder', v: .45 }, { t: 0, type: 'wind', d: C.L07.dur + 1, v: .35 }],
      build: E => {
        return layered(E, {
          light: [0, .05, -.13], lightR: .2, lightCol: '#fff4e0', key: .9, amb: .6, ambCol: '#d8d0c0', sky: { stops: [[0, '#050403'], [1, '#0d0b08']] }, on: false,
          layers: [
            { name: 'top', z: -.09, trans: .25, draw: sheetTop(true) },
            { name: 'low', z: -.089, y: -.004, trans: .25, draw: sheetLow },
          ],
          cam: CARD_CAM,
          focus: -.09, aper: 30,
        });
      } },

    // 8 · The whisper: you in the dark room, scared, the phone lighting you from below (the unknown-number chat is the overlay)
    { id: 'S8', start: at('L08') - .2, sfx: [{ t: .1, type: 'click', v: .35 }, { t: .2, type: 'whoosh', v: .4 }, { t: 0, type: 'wind', d: C.L08.dur + 1, v: .4 }],
      build: E => layered(E, {
        light: [.03, .07, -.05], lightR: .07, lightCol: T.glow, key: .8, amb: .45, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: fill('#10261c') },
          ...youLayers('scared'),
        ],
        glows: { ph: [[0, .5], [.2, 1]] }, flicker: ['ph'],
        cam: [[0, [-.02, .08, .34, 0, .085, -.07]], [E.dur, [.01, .09, .3, 0, .09, -.07]]],
        focus: -.07, aper: 22, grade: { sat: .85, expo: 1.2 },
      }) },

    // 9 · You look outside: through your window the whole city is dark, not one lamp
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: end('L09') - at('L09') + 1, v: .5 }, { t: .3 + C.L09.dur * .7, type: 'thunder', v: .3 }],
      build: E => layered(E, {
        light: [0, .1, -.13], lightR: .14, lightCol: T.light, key: .7, amb: .5, ambCol: '#7aa894', sky: { stops: NSKY, stars: 160 }, on: false,
        moon: { x: .045, y: .175, r: .016, gain: 1.6 },
        layers: [
          { name: 'city', z: -.12, trans: .3, draw: x => { x.fillStyle = N.far; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .05, seed: 21, col: N.far, glass: N.glass, lit: false }); } },
          { name: 'road', z: -.1, trans: .1, draw: x => { x.fillStyle = N.mid; x.fillRect(-.25, -.45, .5, .5); houses(x, { x0: -.24, x1: .24, by: .03, h: .045, seed: 4, col: N.mid, glass: N.glass, lit: false }); } },
          { name: 'wall', z: -.065, trans: .04, draw: wall(N.near, [-.09, .02, .18, .18]) },
        ],
        cam: [[0, [-.02, .1, .44, 0, .1, -.1]], [E.dur, [.02, .105, .36, .01, .105, -.1]]],
        focus: [[0, -.065], [E.dur * .4, -.11]], aper: 16, grade: { expo: 1.25, vig: .3 },
      }) },

    // 10 · Except one tiny light: on the roof across the road, in the top corner, the fox sits with her lantern lit
    { id: 'S10', start: at('L10') - .2, sfx: [{ t: 0, type: 'wind', d: C.L10.dur + 1, v: .45 }, { t: .5, type: 'shimmer', v: .25 }],
      build: E => {
        const lit = E.word('L10', 3);
        return layered(E, {
          light: [.05, .14, -.12], lightR: .12, lightCol: '#ffc878', key: .65, amb: .45, ambCol: '#7aa894', sky: { stops: NSKY, stars: 140 }, on: false,
          layers: [
            { name: 'roofs', z: -.11, trans: .2, draw: x => { x.fillStyle = N.far; x.fillRect(-.25, -.45, .5, .5); house(x, { cx: .03, by: .05, w: .14, h: .05, roof: .05, cols: 3, rows: 1, col: N.far, glass: N.glass, lit: false, door: false }); } },
            foxAt(.068, .099, .045, -.105),
            { name: 'fg', z: -.06, trans: .02, draw: x => { x.fillStyle = N.near; x.fillRect(-.25, -.45, .5, .47); } },
          ],
          glows: { fox: [[0, 0], [lit - .2, 0], [lit + .4, 1]] }, flicker: ['fox'],
          cam: [[0, [-.01, .09, .5, 0, .09, -.11]], [lit, [.01, .095, .44, .02, .095, -.11]], [E.dur, [.03, .1, .36, .04, .1, -.11]]],
          focus: -.105, aper: 16, grade: { expo: 1.2, vig: .3 },
        });
      } },

    // 11 · The windows aren't empty: a slow, quiet push on the dark facade across the road (still the night theme)
    { id: 'S11', start: at('L11') - .4, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'wind', d: end('L11') - at('L11') + 1.2, v: .45 }, { t: .4 + C.L11.dur * .6, type: 'steps', n: 2, every: .6, v: .6, pan: .3 }],
      build: E => layered(E, {
        light: [0, .09, -.13], lightR: .14, lightCol: T.light, key: .7, amb: .5, ambCol: '#7aa894', sky: { stops: NSKY, stars: 60 }, on: false,
        layers: [
          { name: 'facade', z: -.1, trans: .1, draw: facade('#2c6a50', N.glass) },
          { name: 'fg', z: -.06, trans: .02, draw: ground(N.near, .0, 17) },
        ],
        cam: [[0, [0, .07, .46, 0, .075, -.1]], [E.dur, [0, .075, .34, 0, .08, -.1]]],
        focus: -.1, aper: 18, grade: { expo: 1.2, vig: .3 },
      }) },

    // 12 · The revelation (allarme): the same facade gone red; a neighbor's dark head in every window and two eyes lit in each
    { id: 'S12', start: at('L12') - .1, sfx: [{ t: .05, type: 'thunder', v: .8 }, { t: .1, type: 'crack', v: .6 }, { t: .05, type: 'whoosh', v: .6 }, { t: 0, type: 'wind', d: C.L12.dur + 1, v: .45 }],
      build: E => {
        const pairs = WINS.map(([wx, wy]) => [wx / .1, (wy + .004) / .1]);
        return layered(E, {
          light: [0, .09, -.13], lightR: .14, lightCol: A.light, key: .75, amb: .45, ambCol: '#b05040', sky: { stops: ASKY, stars: 0 }, on: false,
          layers: [
            { name: 'facade', z: -.1, trans: .15, glow: .9, glowCol: R.lit, draw: facade(R.mid, R.lit), glowDraw: g => { g.fillStyle = '#fff'; for (const [wx, wy] of WINS) g.fillRect(wx - .014, wy - .018, .028, .036); } },
            { name: 'heads', z: -.099, trans: .02, draw: x => { x.fillStyle = '#0a0202'; for (const [wx, wy] of WINS) { x.beginPath(); x.arc(wx, wy, .009, 0, Math.PI * 2); x.fill(); x.fillRect(wx - .012, wy - .018, .024, .01); } } },
            { name: 'eyes', z: -.098, trans: .3, glow: 3, glowCol: A.glow, shadow: false, recv: false,
              draw: x => lurkers(x, { cx: 0, by: 0, s: .1, col: A.accent, pairs, gap: .06 }), glowDraw: g => lurkers(null, { cx: 0, by: 0, s: .1, pairs, gap: .06 }, g) },
            { name: 'fg', z: -.06, trans: .02, draw: ground(R.near, .0, 17) },
          ],
          glows: { eyes: [[0, 0], [E.word('L12', 1), 0], [E.word('L12', 1) + .1, 1]] },
          cam: [[0, [0, .078, .3, 0, .08, -.1]], [E.word('L12', 9) - .05, [0, .078, .28, 0, .08, -.1]], [E.word('L12', 9) + .1, [0, .08, .24, 0, .08, -.1]], [E.dur, [.004, .08, .23, 0, .08, -.1]]],
          focus: -.099, aper: 22, grade: { expo: 1.2, vig: .3 },
        });
      } },

    // 13 · One knock. Two. Three: through the peephole (overlay), your porch, and far down the path the tall shadow, eyes lit
    { id: 'S13', start: at('L13') - .15, sfx: [...[1, 2, 3].map(k => ({ t: .15 + C.L13.dur * (k - 1) / 3, type: 'steps', n: 1, every: .4, v: 1.3 })), { t: .15 + C.L13.dur * 2 / 3, type: 'thunder', v: .5 }],
      build: E => layered(E, {
        light: [0, .1, -.13], lightR: .14, lightCol: A.light, key: .7, amb: .45, ambCol: '#b05040', sky: { stops: ASKY }, on: false,
        layers: [
          { name: 'yard', z: -.12, trans: .2, draw: x => { x.fillStyle = R.ground; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .04, seed: 5, col: R.far, glass: R.glass, lit: false }); } },
          { name: 'shadow', z: -.1, trans: .04, glow: 2.6, glowCol: '#ffffff', w: .08, h: .12, x: 0, y: .085,
            draw: x => tallShadow(x, { cx: 0, by: -.045, s: .09, col: '#050101' }), glowDraw: g => tallShadow(null, { cx: 0, by: -.045, s: .09 }, g) },
          { name: 'porch', z: -.07, trans: .04, draw: x => { x.fillStyle = R.near; x.fillRect(-.25, -.45, .5, .47); x.fillRect(-.25, -.45, .07, .9); x.fillRect(.18, -.45, .07, .9); } },
        ],
        cam: [[0, [0, .08, .4, 0, .085, -.1]], [E.dur, [0, .085, .34, 0, .088, -.1]]],
        focus: -.1, aper: 18, grade: { expo: 1.2, vig: .3 },
      }) },

    // 14 · "Rule three says you let us in": hard cut, the shadow is suddenly right at the door, cut by the frame, eyes at the top
    { id: 'S14', start: at('L14') - .1, sfx: [{ t: .02, type: 'whoosh', v: .7 }, { t: .05, type: 'thunder', v: .75 }, { t: .1, type: 'crack', v: .5 }],
      build: E => layered(E, {
        light: [0, .14, -.13], lightR: .14, lightCol: A.light, key: .7, amb: .45, ambCol: '#b05040', sky: { stops: ASKY }, on: false,
        layers: [
          { name: 'yard', z: -.12, trans: .2, draw: x => { const gr = x.createLinearGradient(0, .05, 0, -.2); gr.addColorStop(0, '#a8301f'); gr.addColorStop(1, R.ground); x.fillStyle = gr; x.fillRect(-.25, -.45, .5, .5); } },
          { name: 'shadow', z: -.09, trans: .03, glow: 3, glowCol: '#ffffff', w: .2, h: .32, x: 0, y: -.02,
            draw: x => tallShadow(x, { cx: 0, by: -.16, s: .3, col: '#050101' }), glowDraw: g => tallShadow(null, { cx: 0, by: -.16, s: .3 }, g) },
          { name: 'porch', z: -.07, trans: .04, draw: x => { x.fillStyle = R.near; x.fillRect(-.25, -.45, .5, .42); x.fillRect(-.25, -.45, .07, .9); x.fillRect(.18, -.45, .07, .9); } },
        ],
        move: { shadow: [[0, [0, 0, 0]], [E.dur, [0, -.004, 0]]] },
        cam: [[0, [0, .1, .36, 0, .1, -.09]], [E.dur, [0, .102, .33, 0, .102, -.09]]],
        focus: -.09, aper: 18, grade: { expo: 1.2, vig: .3 },
      }) },

    // 15 · The choice: inside, you with your back to the door, scared; the door frame around you, a red line of light under it
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'wind', d: end('L15') - at('L15') + 1, v: .5 }, { t: end('L15') - at('L15') + .2, type: 'steps', n: 3, every: .55, v: .7, pan: -.3 }],
      build: E => layered(E, {
        light: [0, .02, -.12], lightR: .12, lightCol: A.glow, key: .8, amb: .5, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, glow: 2.2, glowCol: A.glow,
            draw: x => { x.fillStyle = R.mid; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#1a0504'; x.fillRect(-.05, -.02, .1, .2); doorFrame(x, { cx: 0, by: -.02, w: .1, h: .2, col: R.ground }); },
            glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(-.05, -.022, .1, .004); } },
          { name: 'you', z: -.08, trans: .02, ...FACE, draw: x => person(x, { ...YOU, cx: 0, by: -.01, s: .14, face: 'scared' }), glowDraw: g => faceGlow(g, { cx: 0, by: -.01, s: .14, face: 'scared' }) },
          { name: 'fg', z: -.05, trans: .02, draw: x => { x.fillStyle = '#1a0504'; x.fillRect(-.25, -.45, .5, .43); } },
        ],
        glows: { wall: [[0, 1]] }, flicker: ['wall'],
        cam: [[0, [-.02, .07, .44, 0, .07, -.08]], [E.dur, [.01, .075, .36, 0, .078, -.08]]],
        focus: -.08, aper: 18, grade: { expo: 1.15 },
      }) },

    // 16 · The end, held under ANSWER or SILENT: your house from across the road, all dark; the tall shadow at your door,
    //      the neighbors in the street facing it, and the fox's lantern, the only light, on the corner of the roof
    { id: 'S16', start: at('L16') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L16') + .5, v: .45 }, { t: end('L16') - at('L16') + .4, type: 'thunder', v: .5 }, { t: .6, type: 'shimmer', v: .2 }],
      build: E => layered(E, {
        light: [0, .1, -.13], lightR: .16, lightCol: A.light, key: .7, amb: .45, ambCol: '#b05040', sky: { stops: ASKY, stars: 80 }, on: false,
        layers: [
          { name: 'house', z: -.11, trans: .15, draw: x => { x.fillStyle = R.mid; x.fillRect(-.25, -.45, .5, .51); house(x, { cx: 0, by: .06, w: .14, h: .08, roof: .05, cols: 3, rows: 2, col: R.mid, glass: R.glass, lit: false }); } },
          foxAt(.072, .14, .03, -.108, 'watch', true),
          { name: 'shadow', z: -.105, trans: .04, glow: 2.4, glowCol: '#ffffff', w: .05, h: .07, x: 0, y: .09,
            draw: x => tallShadow(x, { cx: 0, by: -.03, s: .06, col: '#050101' }), glowDraw: g => tallShadow(null, { cx: 0, by: -.03, s: .06 }, g) },
          { name: 'ppl', z: -.08, trans: .04, draw: x => [-.09, -.05, .05, .09].forEach(cx => neighbor(x, { cx, by: .03, s: .06, lantern: false, back: true, col: '#0a0202' })) },
          { name: 'fg', z: -.05, trans: .02, draw: ground(R.near, .0, 29) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [-.02, .085, .5, 0, .085, -.1]], [E.dur, [.01, .09, .44, 0, .09, -.1]]],
        focus: -.1, aper: 14, grade: { expo: 1.2, vig: .3 },
      }) },
  ];
}
