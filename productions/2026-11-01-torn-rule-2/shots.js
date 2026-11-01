// The Torn Rule · Part 2 (Rules) — shot list. Two of you said SILENT: at 3:34 am you don't make a sound, and behind you
// someone answers the door in your voice. The copy wears your green puffer. You live alone. An unknown number tells you
// to look at the roof: the fox climbs down with her lantern and slides the other half of rule three under your back door.
// The rules card from Part 1 comes back in the same fixed framing and is made whole: "say nothing. The one who answers
// is not you." Your footsteps walk down the hall, the front door opens, the neighbors step aside and the tall shadow
// walks it into the dark. At 6 am the city lights up again (regole/alba) and the last image holds your house with the
// front door left open and the fox's lantern on the roof, under the question: how long had it been living with you?
// Themes: allarme (S1-S4, picking up from the end of Part 1), notte (S5-S10), allarme (S11-S13), alba (S14-S16).
// Subjects sit between 15 % and 52 % of the frame height (the series tag and clock above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.word).
import { layered } from './engine/kit/shot.js';
import { houses, house, neighbor, phone, person, foreground, tallShadow, foxCameo, doorFrame } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';

const T = theme('regole', 'notte'), A = theme('regole', 'allarme'), D = theme('regole', 'alba');
const CREAM = '#efe8d8', INK = '#14110d';
const GREEN = '#4f9a72';
const YOU = { coat: GREEN, hat: false, pants: '#1d2a26' };   // you (and the copy): the green puffer, the one colour of the series
const ROOM = [[0, '#020403'], [1, '#07100c']];
const NSKY = [[0, '#05100a'], [.25, '#123323'], [.45, '#2f6e50'], [.6, '#4c9a74'], [1, '#5aa882']];
const ASKY = [[0, '#120404'], [.25, '#3a0b0b'], [.45, '#7a1a14'], [.6, '#a8301f'], [1, '#c04a2a']];
const DSKY = [[0, '#0e1714'], [.3, '#2c3f3f'], [.55, '#7c8f76'], [.8, '#c9c493'], [1, '#e8dfae']];
const N = { far: '#1f4a38', mid: '#163a2b', near: '#0e2219', glass: '#081610' };
const R = { far: '#3a0a08', mid: '#5a140e', ground: '#7a1a14', near: '#240705', glass: '#200605', lit: '#c43a28' };
const W = { far: '#5b7266', mid: '#3a4d44', near: '#1a2420', glass: '#26332d' };
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
const wall = (col, win) => x => {
  x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(...win); x.restore();
  const [wx, wy, ww, wh] = win; x.fillStyle = col;
  x.fillRect(wx, wy + wh / 2 - .002, ww, .004); x.fillRect(wx + ww / 2 - .002, wy, .004, wh);
};
const ground = (col, base, seed) => x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt: [-.2, .18], reedsN: 10, stones: 3, amp: .003 }); };
const youLayers = (face, z = -.07, by = -.02, s = .16, glowCol = T.glow) => [
  { name: 'you', z, trans: .02, ...FACE, draw: x => person(x, { ...YOU, cx: 0, by, s, face }), glowDraw: g => faceGlow(g, { cx: 0, by, s, face }) },
  { name: 'ph', z: z + .006, trans: .05, glow: 1.6, glowCol, w: .05, h: .07, x: s * .19, y: by + s * .5,
    draw: x => phone(x, { cx: 0, cy: 0, w: s * .14, h: s * .25, screen: '#13261c' }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: s * .14, h: s * .25 }, g) },
];
// the front door at the end of the hall: a dark leaf in a frame, and the red line of light under it (glows)
const frontDoor = (wallCol, frameCol, { cx = 0, by = -.02, w = .1, h = .2 } = {}) => ({
  name: 'door', z: -.12, trans: .05, glow: 2.2, glowCol: A.glow,
  draw: x => { x.fillStyle = wallCol; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#1a0504'; x.fillRect(cx - w / 2, by, w, h); doorFrame(x, { cx, by, w, h, col: frameCol }); },
  glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(cx - w / 2, by - .002, w, .004); },
});
// the copy, seen from behind: your coat, your height, your hair
const copyBack = (cx, by, s) => x => neighbor(x, { cx, by, s, lantern: false, back: true, col: GREEN });

// the rules card from Part 1: cream paper, black type, rule three torn across. Now the missing half comes back:
// it carries the end of rule three (red) and rule four. Flat and still, inside the margins, captions off on its lines.
const RULES = ['1. STAY INSIDE UNTIL 6:00 AM.', '2. KEEP EVERY LIGHT OFF.', '3. IF SOMEONE KNOCKS THREE TIMES,'];
const CX0 = -.05, CX1 = .05, CTOP = .138, CBOT = .053, TL = -.042;
const jag = (x, y, seed, back) => { for (let i = 0; i <= 20; i++) { const j = back ? 20 - i : i; x.lineTo(CX0 + j * .005, y + ((j * 7919 + seed * 31) % 9 - 4) * .0006); } };
const sheetTop = x => {
  x.fillStyle = CREAM; x.beginPath(); x.moveTo(CX0, CTOP); x.lineTo(CX1, CTOP); jag(x, .0815, 3, true); x.closePath(); x.fill();
  text(x, 'THE FOUR RULES', TL, .129, .008, '"Anton"', { fill: T.tag, align: 'left' });
  x.fillStyle = INK; x.fillRect(TL, .1225, .084, .0009);
  RULES.forEach((r, i) => text(x, r, TL, .1115 - i * .011, .0055, '"Anton"', { fill: i === 2 ? T.tag : INK, align: 'left' }));
};
// the other half: its torn top edge matches the first sheet's (same seed), so the two pieces fit
const sheetHalf = x => {
  x.fillStyle = CREAM; x.beginPath(); x.moveTo(CX0, .0815); jag(x, .0815, 3); x.lineTo(CX1, CBOT); x.lineTo(CX0, CBOT); x.closePath(); x.fill();
  text(x, 'SAY NOTHING. THE ONE WHO', TL, .0735, .0055, '"Anton"', { fill: T.tag, align: 'left' });
  text(x, 'ANSWERS IS NOT YOU.', TL, .066, .0055, '"Anton"', { fill: T.tag, align: 'left' });
  text(x, '4. NEVER ANSWER IN YOUR OWN VOICE.', TL, .0575, .0055, '"Anton"', { fill: INK, align: 'left' });
};
const CARD_CAM = [[0, [0, .058, .3, 0, .058, -.09]]];
const foxAt = (cx, by, s, z, pose = 'watch', flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose, flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose, flip }, g) });

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · Where Part 1 ended: you with your back to the front door, scared, the red line of light under it; you hold your breath
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: 5, v: .45 }, { t: .05, type: 'crack', v: .4 }, { t: .1, type: 'thunder', v: .45 }],
      build: E => layered(E, {
        light: [0, .02, -.12], lightR: .12, lightCol: A.glow, key: .8, amb: .5, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          frontDoor(R.mid, R.ground),
          { name: 'you', z: -.08, trans: .02, ...FACE, draw: x => person(x, { ...YOU, cx: 0, by: -.01, s: .14, face: 'scared' }), glowDraw: g => faceGlow(g, { cx: 0, by: -.01, s: .14, face: 'scared' }) },
          { name: 'fg', z: -.05, trans: .02, draw: x => { x.fillStyle = '#1a0504'; x.fillRect(-.25, -.45, .5, .43); } },
        ],
        glows: { door: [[0, 1]] }, flicker: ['door'],
        cam: [[0, [.01, .075, .4, 0, .078, -.08]], [E.dur, [-.01, .08, .33, 0, .08, -.08]]],
        focus: -.08, aper: 18, grade: { expo: 1.15 },
      }) },

    // 2 · Behind you, someone answers the door: down the hall a figure in your green coat walks up to the front door
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'whoosh', v: .5 }, { t: .2, type: 'steps', n: 3, every: .45, v: .8, pan: .2 }],
      build: E => layered(E, {
        light: [0, .05, -.12], lightR: .12, lightCol: A.glow, key: .8, amb: .45, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          frontDoor(R.mid, R.ground, { by: .02, w: .08, h: .16 }),
          { name: 'copy', z: -.1, trans: .03, draw: copyBack(0, .02, .12) },
          { name: 'hall', z: -.06, trans: .02, draw: x => { x.fillStyle = R.near; x.fillRect(-.25, -.45, .07, .9); x.fillRect(.18, -.45, .07, .9); x.fillRect(-.25, -.45, .5, .44); } },
        ],
        glows: { door: [[0, 1]] }, flicker: ['door'],
        move: { copy: [[0, [.07, -.01, 0]], [E.dur * .8, [0, 0, 0]], [E.dur, [0, 0, 0]]] },
        cam: [[0, [0, .085, .42, 0, .09, -.11]], [E.dur, [0, .09, .36, 0, .09, -.11]]],
        focus: -.1, aper: 18, grade: { expo: 1.15 },
      }) },

    // 3 · Snapback, hard cut: the copy turns its head to you. Your face, your coat, smiling
    { id: 'S3', start: at('L03') - .05, sfx: [{ t: .02, type: 'thunder', v: .8 }, { t: .05, type: 'crack', v: .6 }, { t: .05, type: 'whoosh', v: .6 }],
      build: E => layered(E, {
        light: [0, .1, -.1], lightR: .12, lightCol: A.light, key: .85, amb: .5, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: fill(R.mid) },
          { name: 'copy', z: -.08, trans: .02, ...FACE, draw: x => person(x, { ...YOU, cx: 0, by: -.04, s: .18, face: 'smile' }), glowDraw: g => faceGlow(g, { cx: 0, by: -.04, s: .18, face: 'smile' }) },
        ],
        cam: [[0, [0, .095, .3, 0, .095, -.08]], [E.dur, [0, .1, .27, 0, .1, -.08]]],
        focus: -.08, aper: 20, grade: { expo: 1.15, vig: .3 },
      }) },

    // 4 · "Coming! Just a second!": the copy at the door from behind, close; the red light under the door pulses
    { id: 'S4', start: at('L04') - .15, sfx: [{ t: .1, type: 'click', v: .5 }, { t: 0, type: 'wind', d: C.L04.dur + 1, v: .35 }],
      build: E => layered(E, {
        light: [0, .02, -.12], lightR: .12, lightCol: A.glow, key: .8, amb: .45, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          frontDoor(R.mid, R.ground, { by: -.03, w: .13, h: .26 }),
          { name: 'copy', z: -.085, trans: .03, draw: copyBack(0, -.03, .2) },
        ],
        glows: { door: [[0, .6], [.3, 1]] }, flicker: ['door'],
        cam: [[0, [-.02, .08, .38, 0, .08, -.1]], [E.dur, [.02, .085, .34, 0, .085, -.1]]],
        focus: -.085, aper: 18, grade: { expo: 1.15 },
      }) },

    // 5 · You live alone: the real you, frozen at the window, the night city green behind the glass (notte)
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'wind', d: C.L05.dur + 1, v: .45 }],
      build: E => layered(E, {
        light: [.03, .09, -.08], lightR: .09, lightCol: T.light, key: .8, amb: .45, ambCol: '#4a6a5a', sky: { stops: NSKY, stars: 70 }, on: false,
        layers: [
          { name: 'city', z: -.13, trans: .3, draw: x => { x.fillStyle = N.far; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .05, seed: 21, col: N.far, glass: N.glass, lit: false }); } },
          { name: 'wall', z: -.11, trans: .05, draw: wall(N.near, [-.11, .06, .1, .13]) },
          ...youLayers('scared'),
          { name: 'fg', z: -.045, trans: .02, draw: x => { x.fillStyle = '#030605'; x.fillRect(-.25, -.45, .5, .43); } },
        ],
        glows: { ph: [[0, .3]] },
        cam: [[0, [-.01, .065, .42, 0, .07, -.07]], [E.dur, [.01, .06, .36, 0, .065, -.07]]],
        focus: -.065, aper: 18, grade: { expo: 1.2 },
      }) },

    // 6 · Your phone lights up, unknown number (the chat is the overlay): your face lit green from below
    { id: 'S6', start: at('L06') - .15, sfx: [{ t: .1, type: 'click', v: .5 }, { t: .15, type: 'chime', v: .35 }],
      build: E => layered(E, {
        light: [.03, .07, -.05], lightR: .07, lightCol: T.glow, key: .8, amb: .45, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: fill('#10261c') },
          ...youLayers('surprised'),
        ],
        glows: { ph: [[0, .3], [.15, 1]] }, flicker: ['ph'],
        cam: [[0, [.02, .08, .34, 0, .085, -.07]], [E.dur, [-.01, .09, .3, 0, .09, -.07]]],
        focus: -.07, aper: 22, grade: { sat: .85, expo: 1.2 },
      }) },

    // 7 · On the roof across the road the tiny light is moving: the fox walks along the ridge with her lantern
    { id: 'S7', start: at('L07') - .2, sfx: [{ t: 0, type: 'wind', d: C.L07.dur + 1, v: .45 }, { t: .4, type: 'shimmer', v: .3 }],
      build: E => layered(E, {
        light: [.03, .14, -.12], lightR: .12, lightCol: '#ffc878', key: .65, amb: .45, ambCol: '#7aa894', sky: { stops: NSKY, stars: 140 }, on: false,
        layers: [
          { name: 'roofs', z: -.11, trans: .2, draw: x => { x.fillStyle = N.far; x.fillRect(-.25, -.45, .5, .5); house(x, { cx: .0, by: .05, w: .16, h: .05, roof: .05, cols: 3, rows: 1, col: N.far, glass: N.glass, lit: false, door: false }); } },
          foxAt(.06, .099, .04, -.105),
          { name: 'fg', z: -.06, trans: .02, draw: x => { x.fillStyle = N.near; x.fillRect(-.25, -.45, .5, .47); } },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        move: { fox: [[0, [0, 0, 0]], [E.dur, [-.05, -.012, 0]]] },
        cam: [[0, [.02, .095, .4, .02, .095, -.11]], [E.dur, [-.01, .09, .36, -.01, .09, -.11]]],
        focus: -.105, aper: 16, grade: { expo: 1.2, vig: .3 },
      }) },

    // 8 · The fox at your back door: the lantern lights the step, and a scrap of cream paper slides under the door on "paper"
    { id: 'S8', start: at('L08') - .2, sfx: [{ t: 0, type: 'wind', d: C.L08.dur + 1, v: .4 }, { t: .2 + C.L08.dur * .75, type: 'paper', v: 1.2 }],
      build: E => {
        const slide = E.word('L08', 10);
        return layered(E, {
          light: [-.04, .03, -.09], lightR: .09, lightCol: '#ffc878', key: .75, amb: .5, ambCol: '#7aa894', sky: { stops: NSKY }, on: false,
          layers: [
            { name: 'house', z: -.12, trans: .05, draw: x => { x.fillStyle = N.mid; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#06100b'; x.fillRect(.0, .02, .08, .15); doorFrame(x, { cx: .04, by: .02, w: .08, h: .15, col: N.near }); } },
            { name: 'paper', z: -.1, trans: .1, shadow: false, w: .04, h: .02, x: -.01, y: .022, draw: x => { x.fillStyle = CREAM; x.fillRect(-.012, -.004, .024, .008); } },
            foxAt(-.04, .02, .04, -.098),
            { name: 'fg', z: -.06, trans: .02, draw: ground(N.near, .015, 13) },
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          move: { paper: [[0, [0, 0, 0]], [slide, [0, 0, 0]], [slide + .6, [.05, 0, 0]], [E.dur, [.05, 0, 0]]] },
          cam: [[0, [-.01, .085, .38, 0, .085, -.1]], [E.dur, [.01, .08, .32, .01, .08, -.1]]],
          focus: -.1, aper: 18, grade: { expo: 1.2, vig: .25 },
        });
      } },

    // 9 · The other half of rule three: the Part 1 card, same framing; the missing piece slides up and fits the tear on "half"
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .3 + C.L09.dur * .8, type: 'paper', v: 1.1 }, { t: 0, type: 'wind', d: C.L09.dur + 1, v: .3 }],
      build: E => {
        const fit = E.word('L09', 2);
        return layered(E, {
          light: [0, .08, -.13], lightR: .2, lightCol: '#fff4e0', key: .9, amb: .7, ambCol: '#d8d0c0', sky: { stops: [[0, '#1a1712'], [1, '#2a251c']] }, on: false,
          layers: [
            { name: 'top', z: -.09, trans: .25, draw: sheetTop },
            { name: 'half', z: -.089, trans: .25, draw: sheetHalf },
          ],
          move: { half: [[0, [0, -.012, .03]], [fit - .2, [0, -.012, .03]], [fit + .15, [0, 0, 0]], [E.dur, [0, 0, 0]]] },
          cam: CARD_CAM,
          focus: -.09, aper: 30, grade: { sat: .9 },
        });
      } },

    // 10 · The whole rule, read out: same card, still; a red line marks "IS NOT YOU" on "not"
    { id: 'S10', start: at('L10') - .2, sfx: [{ t: .2 + C.L10.dur * .8, type: 'thunder', v: .45 }, { t: 0, type: 'wind', d: C.L10.dur + 1, v: .3 }],
      build: E => {
        const not = E.word('L10', 12);
        return layered(E, {
          light: [0, .06, -.13], lightR: .2, lightCol: '#fff4e0', key: .9, amb: .6, ambCol: '#d8d0c0', sky: { stops: [[0, '#050403'], [1, '#0d0b08']] }, on: false,
          layers: [
            { name: 'top', z: -.09, trans: .25, draw: sheetTop },
            { name: 'half', z: -.089, trans: .25, draw: sheetHalf },
            { name: 'mark', z: -.0885, trans: .3, shadow: false, recv: false, glow: 2, glowCol: T.tag,
              draw: x => { x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(TL, .0625, .064, .0012); }, glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(TL, .0625, .064, .0012); } },
          ],
          glows: { mark: [[0, 0], [not, 0], [not + .15, 1]] },
          cam: CARD_CAM,
          focus: -.09, aper: 30,
        });
      } },

    // 11 · Footsteps, your footsteps, down the hall (allarme): the copy walks away from you toward the red-lit front door
    { id: 'S11', start: at('L11') - .4, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .4, type: 'steps', n: 6, every: .5, v: 1, pan: .1 }, { t: 0, type: 'wind', d: C.L11.dur + 1, v: .35 }],
      build: E => layered(E, {
        light: [0, .05, -.12], lightR: .12, lightCol: A.glow, key: .8, amb: .45, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          frontDoor(R.mid, R.ground, { by: .03, w: .07, h: .14 }),
          { name: 'copy', z: -.1, trans: .03, draw: copyBack(0, .03, .11) },
          { name: 'hall', z: -.06, trans: .02, draw: x => { x.fillStyle = R.near; x.fillRect(-.25, -.45, .08, .9); x.fillRect(.17, -.45, .08, .9); x.fillRect(-.25, -.45, .5, .45); } },
        ],
        glows: { door: [[0, 1]] }, flicker: ['door'],
        move: { copy: [[0, [0, -.03, 0]], [E.dur, [0, 0, 0]]] },
        cam: [[0, [0, .08, .44, 0, .09, -.11]], [E.dur, [0, .09, .38, 0, .095, -.11]]],
        focus: -.1, aper: 18, grade: { expo: 1.15 },
      }) },

    // 12 · The front door opens: the dark leaf swings aside on "opens", red night floods in, the copy stands in the doorway
    { id: 'S12', start: at('L12') - .1, sfx: [{ t: .1 + C.L12.dur * .3, type: 'crack', v: .6 }, { t: .1 + C.L12.dur * .3, type: 'whoosh', v: .7 }, { t: .1 + C.L12.dur * .35, type: 'thunder', v: .7 }],
      build: E => {
        const open = E.word('L12', 3);
        return layered(E, {
          light: [0, .08, -.13], lightR: .14, lightCol: A.light, key: .8, amb: .45, ambCol: '#b05040', sky: { stops: ASKY }, on: false,
          layers: [
            { name: 'out', z: -.13, trans: .2, draw: x => { x.fillStyle = R.ground; x.fillRect(-.25, -.45, .5, .5); houses(x, { x0: -.24, x1: .24, by: .05, h: .04, seed: 5, col: R.far, glass: R.glass, lit: false }); } },
            { name: 'copy', z: -.105, trans: .03, draw: copyBack(0, -.02, .13) },
            { name: 'leaf', z: -.1, trans: .03, draw: x => { x.fillStyle = '#1a0504'; x.fillRect(-.05, -.02, .1, .2); x.fillStyle = R.ground; x.beginPath(); x.arc(.035, .07, .005, 0, TAU); x.fill(); } },
            { name: 'wall', z: -.095, trans: .03, draw: x => { x.fillStyle = R.mid; x.fillRect(-.25, -.45, .5, .9); x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.05, -.02, .1, .2); x.restore(); doorFrame(x, { cx: 0, by: -.02, w: .1, h: .2, col: R.near }); } },
          ],
          move: { leaf: [[0, [0, 0, 0]], [open, [0, 0, 0]], [open + .5, [-.095, 0, 0]], [E.dur, [-.095, 0, 0]]] },
          cam: [[0, [0, .08, .4, 0, .08, -.1]], [open, [0, .08, .38, 0, .08, -.1]], [E.dur, [0, .085, .32, 0, .085, -.1]]],
          focus: -.1, aper: 18, grade: { expo: 1.2, vig: .3 },
        });
      } },

    // 13 · The neighbors step aside: two rows of them, backs to us; between them the tall shadow walks the copy into the dark
    { id: 'S13', start: at('L13') - .1, sfx: [{ t: 0, type: 'wind', d: C.L13.dur + 1, v: .5 }, { t: .3, type: 'steps', n: 5, every: .6, v: .6, pan: 0 }, { t: .1 + C.L13.dur * .6, type: 'thunder', v: .4 }],
      build: E => layered(E, {
        light: [0, .12, -.13], lightR: .15, lightCol: A.light, key: .7, amb: .45, ambCol: '#b05040', sky: { stops: ASKY, stars: 40 }, on: false,
        layers: [
          { name: 'street', z: -.12, trans: .2, draw: x => { x.fillStyle = R.ground; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .045, seed: 9, col: R.far, glass: R.glass, lit: false }); } },
          { name: 'pair', z: -.11, trans: .04, glow: 2.4, glowCol: '#ffffff',
            draw: x => { tallShadow(x, { cx: .012, by: .04, s: .09, col: '#050101' }); neighbor(x, { cx: -.012, by: .04, s: .055, lantern: false, back: true, col: GREEN }); },
            glowDraw: g => tallShadow(null, { cx: .012, by: .04, s: .09 }, g) },
          { name: 'ppl', z: -.08, trans: .04, draw: x => [-.1, -.065, .065, .1].forEach((cx, i) => neighbor(x, { cx, by: .015 - (i % 2) * .005, s: .075, lantern: false, back: true, col: '#0a0202' })) },
          { name: 'fg', z: -.05, trans: .02, draw: ground(R.near, -.005, 23) },
        ],
        move: { pair: [[0, [0, -.02, 0]], [E.dur, [0, .012, 0]]], ppl: [[0, [0, 0, 0]], [.8, [0, 0, 0]], [1.6, [0, -.004, 0]], [E.dur, [0, -.004, 0]]] },
        cam: [[0, [0, .085, .48, 0, .09, -.11]], [E.dur, [0, .095, .4, 0, .095, -.11]]],
        focus: -.11, aper: 14, grade: { expo: 1.2, vig: .3 },
      }) },

    // 14 · 6 am, the lights come back (alba): the skyline at dawn, windows lighting up row by row on "lights"
    { id: 'S14', start: at('L14') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: .3, type: 'shimmer', v: .4 }, { t: .4 + C.L14.dur * .4, type: 'chime', v: .4 }],
      build: E => {
        const on = E.word('L14', 4);
        const row = (n, z, col, by, h, seed) => ({ name: n, z, trans: .2, glow: 2.4, glowCol: D.light,
          draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, by + .45); houses(x, { x0: -.24, x1: .24, by, h, seed, col, glass: W.glass, lit: true }); },
          glowDraw: g => houses(null, { x0: -.24, x1: .24, by, h, seed, lit: true }, g) });
        return layered(E, {
          light: [0, .14, -.13], lightR: .18, lightCol: D.light, key: .6, amb: .45, ambCol: '#c9c493', sky: { stops: DSKY, stars: 20 }, on: false,
          layers: [row('far', -.12, W.far, .08, .05, 3), row('mid', -.1, W.mid, .05, .055, 8), row('near', -.08, W.near, .02, .06, 13)],
          glows: { near: [[0, 0], [on, 0], [on + .1, 1]], mid: [[0, 0], [on + .15, 0], [on + .25, 1]], far: [[0, 0], [on + .3, 0], [on + .4, 1]] },
          cam: [[0, [0, .085, .56, 0, .085, -.1]], [E.dur, [0, .08, .5, 0, .08, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 15 · "All clear" (the alert card is the overlay): you at the window at dawn, calm at last, phone in hand
    { id: 'S15', start: at('L15') - .2, sfx: [{ t: .1, type: 'click', v: .4 }, { t: .2, type: 'chime', v: .3 }],
      build: E => layered(E, {
        light: [.03, .1, -.08], lightR: .1, lightCol: D.light, key: .8, amb: .55, ambCol: '#c9c493', sky: { stops: DSKY }, on: false,
        layers: [
          { name: 'city', z: -.13, trans: .3, draw: x => { x.fillStyle = W.far; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .05, seed: 21, col: W.far, glass: W.glass, lit: false }); } },
          { name: 'wall', z: -.11, trans: .05, draw: wall(W.near, [-.11, .06, .1, .13]) },
          ...youLayers('calm', -.07, -.02, .16, D.glow),
          { name: 'fg', z: -.045, trans: .02, draw: x => { x.fillStyle = '#0d1512'; x.fillRect(-.25, -.45, .5, .43); } },
        ],
        glows: { ph: [[0, 1]] },
        cam: [[0, [.01, .065, .4, 0, .07, -.07]], [E.dur, [-.01, .07, .35, 0, .07, -.07]]],
        focus: -.065, aper: 18, grade: { expo: 1.1 },
      }) },

    // 16 · The end, held under the question: your house at dawn from across the road, the front door left wide open,
    //      no one in the street, and the fox's lantern on the corner of the roof
    { id: 'S16', start: at('L16') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L16') + .5, v: .4 }, { t: .5, type: 'shimmer', v: .25 }, { t: end('L16') - at('L16') + .3, type: 'crack', v: .3 }],
      build: E => layered(E, {
        light: [0, .12, -.13], lightR: .16, lightCol: D.light, key: .7, amb: .5, ambCol: '#c9c493', sky: { stops: DSKY, stars: 10 }, on: false,
        layers: [
          { name: 'house', z: -.11, trans: .15, draw: x => { x.fillStyle = W.mid; x.fillRect(-.25, -.45, .5, .51); house(x, { cx: 0, by: .06, w: .14, h: .08, roof: .05, cols: 3, rows: 2, col: W.mid, glass: W.glass, lit: false, door: false });
            x.fillStyle = '#050706'; x.fillRect(-.011, .06, .022, .036); } },
          foxAt(.072, .14, .03, -.108, 'watch', true),
          { name: 'fg', z: -.05, trans: .02, draw: ground(W.near, .0, 29) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [-.02, .095, .5, 0, .095, -.1]], [E.dur, [.01, .1, .42, 0, .1, -.1]]],
        focus: -.1, aper: 14, grade: { expo: 1.15, vig: .3 },
      }) },
  ];
}
