// The Torn Rule · Part 2 (Rules) — shot list. Two of you said SILENT: at 3:34 am you don't make a sound, and behind you
// someone answers the door in your voice. The copy wears your green puffer. You live alone. An unknown number tells you
// to look at the roof: the fox walks along the ridge with her lantern, comes down and slides the other half of rule three
// under your back door. The rules card from Part 1 comes back in the same fixed framing and is made whole: "say nothing.
// The one who answers is not you." Your footsteps walk down the hall, the front door opens, the copy walks out, the
// neighbors step aside and the tall shadow walks it into the dark. At 6 am the city lights up again (regole/alba) and the
// last image holds your house with the front door left open and the fox with her lantern on the roof.
// Themes: allarme (S1-S4, picking up from the end of Part 1), notte (S5-S10), allarme (S11-S13), alba (S14-S16).
//
// Remake (note from the Ufficio: pictures unclear, the fox floating in the air, the doors made no sense):
// - one rule for every set: the floor (or the roof the fox walks on) is at the camera's height, and the camera looks level
//   (lv()), so that line sits at 50 % of the frame at every depth. Feet and paws touch it and nothing floats. The front
//   floor sheet sits a few millimetres in front of the figure and just covers the soles.
// - the fox is always on the same plane as what she stands on (the roof ridge, your back step).
// - every door is a real door (doorLeaf: panels, knob, a small window, the line of light under it); the front door opens
//   on a hinge (the leaf folds towards its left edge) and the copy is seen through the doorway, outside, walking away.
// - subjects sit between 15 % and 52 % of the frame height: from the floor line up; the floor below is plain and dark
//   under the pop captions.
import { layered } from './engine/kit/shot.js';
import { houses, neighbor, phone, person, tallShadow, foxCameo, doorFrame, doorLeaf } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';
import { ss, clamp } from './engine/lib.js';

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

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
// the floor in front of a figure: a few mm in front of it, its top edge just over the soles
const floorFront = (col, z, top = .0015) => ({ name: 'floor', z, trans: .02, shadow: false, draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); } });
// a smooth 0..1 ramp between two times
const ramp = (t, a, b) => ss(clamp((t - a) / (b - a)));

// the front door of your house, red light from the street in its little window and under it
const FRONT = (cx, w, h) => ({ cx, by: 0, w, h, col: '#3c1a12', panel: '#26100a', glass: '#3a0c08', underCol: '#ff6a4a', frame: '#2a0806' });
// a room or a hall: wall above the floor line, floor below, a skirting line, and an optional door (which glows in g)
const room = (name, z, wallCol, floorCol, door, o = {}) => ({ name, z, trans: .05, glow: o.glow ?? 2.4, glowCol: o.glowCol ?? A.glow,
  draw: x => {
    x.fillStyle = wallCol; x.fillRect(-.25, 0, .5, .45);
    if (o.win) { const [wx, wy, ww, wh] = o.win; x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(wx, wy, ww, wh); x.restore();
      x.fillStyle = wallCol; x.fillRect(wx, wy + wh / 2 - .0015, ww, .003); x.fillRect(wx + ww / 2 - .0015, wy, .003, wh);
      x.fillStyle = floorCol; x.fillRect(wx - .004, wy - .004, ww + .008, .004); }
    x.fillStyle = floorCol; x.fillRect(-.25, -.45, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(-.25, 0, .5, .004);
    if (door) doorLeaf(x, door);
  },
  glowDraw: g => { if (door) doorLeaf(null, door, g); } });

// the face's own light: the head glows softly, eyes and mouth stay dark (same geometry as person())
const faceGlow = (g, { cx, by, s, face }) => {
  const hr = s * .16, hy = by + s * .78, ex = hr * .36, ey = hy + hr * .05, big = face === 'scared' || face === 'surprised';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.fill();
  g.fillStyle = '#000'; for (const d of [-1, 1]) { g.beginPath(); g.arc(cx + d * ex, ey, hr * (big ? .09 : .11), 0, TAU); g.fill(); }
  g.fillRect(cx - hr * .28, hy - hr * .52, hr * .56, hr * .2);
};
const FACE = { glow: .6, glowCol: '#f6e8d6' };
// you, standing on the floor line, phone in hand
const youLayers = (face, z, cx, s, glowCol = T.glow, coat = YOU) => [
  { name: 'you', z, trans: .02, ...FACE, draw: x => person(x, { ...coat, cx, by: 0, s, face }), glowDraw: g => faceGlow(g, { cx, by: 0, s, face }) },
  { name: 'ph', z: z + .004, trans: .05, glow: 1.6, glowCol, w: .05, h: .07, x: cx + s * .19, y: s * .5,
    draw: x => phone(x, { cx: 0, cy: 0, w: s * .14, h: s * .25, screen: '#13261c' }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: s * .14, h: s * .25 }, g) },
];
// the copy, seen from behind: your coat, your height. A sheet pinned at its feet (y = 0), so it can shrink as it walks away
const copySheet = (name, z, cx, s, extra) => ({ name, z, trans: .03, w: s * 1.2, h: s * 1.3, x: cx, y: s * .65, ay: -s * .65,
  draw: x => { if (extra) extra(x, s); neighbor(x, { cx: 0, by: -s * .65, s, lantern: false, back: true, col: GREEN }); } });
// the two side walls of the hall, close to the camera, and the floor in front
const hallSides = (z, edge) => ({ name: 'sides', z, trans: .02, shadow: false,
  draw: x => { x.fillStyle = R.near; x.fillRect(-.25, -.45, .25 - edge, .9); x.fillRect(edge, -.45, .25 - edge, .9); x.fillRect(-.25, -.45, .5, .4515); } });
// the fox: always on the same plane as what she stands on (z just in front of it), paws on y = by
const foxAt = (cx, by, s, z, pose = 'watch', flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose, flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose, flip }, g) });
// a house seen from the front with a hip roof: a flat ridge on top, wide enough to walk on. Returns the ridge height.
const hipHouse = (x, { cx, by, w, h, roof, col, glass, door = null, rows = 2 }) => {
  x.fillStyle = col; x.fillRect(cx - w / 2, by, w, h);
  x.beginPath(); x.moveTo(cx - w * .56, by + h); x.lineTo(cx - w * .3, by + h + roof); x.lineTo(cx + w * .3, by + h + roof); x.lineTo(cx + w * .56, by + h); x.closePath(); x.fill();
  x.fillRect(cx - w * .42, by + h + roof * .3, w * .07, roof * .9);   // chimney, at the far left, out of the fox's way
  x.fillStyle = glass;
  for (let r = 0; r < rows; r++) for (const u of [-.36, -.16, .16, .36]) {
    if (door && r === 0 && Math.abs(u) < .2) continue;
    x.fillRect(cx + u * w - w * .06, by + h * (r + .4) / rows, w * .12, h * .28 / rows * 1.4);
  }
  if (door) door(x);
  return by + h + roof;
};

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

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · Where Part 1 ended: you in the hall, scared, your back to the front door; red light in its window and under it
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: 5, v: .45 }, { t: .05, type: 'crack', v: .4 }, { t: .1, type: 'thunder', v: .45 }],
      build: E => layered(E, {
        light: [.03, .05, -.135], lightR: .1, lightCol: A.glow, key: .85, amb: .6, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          room('hall', -.12, R.mid, R.near, FRONT(.032, .04, .082)),
          ...youLayers('scared', -.09, -.024, .078, A.glow),
          floorFront(R.near, -.087),
        ],
        glows: { hall: [[0, 1]], ph: [[0, .2]] }, flicker: ['hall'],
        cam: [[0, lv(.38, .006)], [E.dur, lv(.33, -.004)]],   // slow push in
        focus: -.09, aper: 18, grade: { expo: 1.25 },
      }) },

    // 2 · Behind you, someone answers the door: down the hall, a figure in your green coat walks up to the front door
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'whoosh', v: .5 }, { t: .2, type: 'steps', n: 3, every: .45, v: .8, pan: .2 }],
      build: E => layered(E, {
        light: [0, .05, -.135], lightR: .1, lightCol: A.glow, key: .85, amb: .55, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          room('hall', -.125, R.mid, R.near, FRONT(0, .036, .074)),
          copySheet('copy', -.105, 0, .066),
          hallSides(-.07, .066),
        ],
        glows: { hall: [[0, 1]] }, flicker: ['hall'],
        move: { copy: [[0, [.045, 0, 0]], [E.dur * .8, [.006, 0, 0]], [E.dur, [.006, 0, 0]]] },
        cam: [[0, lv(.42)], [E.dur, lv(.36)]],   // down the hall
        focus: -.105, aper: 18, grade: { expo: 1.2 },
      }) },

    // 3 · Snapback, hard cut: the copy at the door turns round. Your face, your coat, smiling
    { id: 'S3', start: at('L03') - .05, sfx: [{ t: .02, type: 'thunder', v: .8 }, { t: .05, type: 'crack', v: .6 }, { t: .05, type: 'whoosh', v: .6 }],
      build: E => layered(E, {
        light: [0, .08, -.135], lightR: .1, lightCol: A.light, key: .9, amb: .6, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          room('hall', -.12, R.mid, R.near, FRONT(0, .046, .09)),
          { name: 'copy', z: -.09, trans: .02, ...FACE, draw: x => person(x, { ...YOU, cx: 0, by: 0, s: .07, face: 'smile' }), glowDraw: g => faceGlow(g, { cx: 0, by: 0, s: .07, face: 'smile' }) },
          floorFront(R.near, -.087),
        ],
        glows: { hall: [[0, 1]] },
        cam: [[0, lv(.27, 0, 0, -.09)], [E.dur, lv(.245, 0, 0, -.09)]],   // close, creeping in
        focus: -.09, aper: 20, grade: { expo: 1.25, vig: .3 },
      }) },

    // 4 · "Coming! Just a second!": the copy from behind, at the front door, about to take the knob; the window pulses red
    { id: 'S4', start: at('L04') - .15, sfx: [{ t: .1, type: 'click', v: .5 }, { t: 0, type: 'wind', d: C.L04.dur + 1, v: .35 }],
      build: E => layered(E, {
        light: [0, .05, -.135], lightR: .1, lightCol: A.glow, key: .85, amb: .55, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          room('hall', -.12, R.mid, R.near, FRONT(0, .045, .088)),
          copySheet('copy', -.1, -.01, .074),
          floorFront(R.near, -.097),
        ],
        glows: { hall: [[0, .55], [.3, 1]] }, flicker: ['hall'],
        cam: [[0, lv(.31, .012)], [E.dur, lv(.28, -.008)]],   // slow lateral drift
        focus: -.1, aper: 18, grade: { expo: 1.2 },
      }) },

    // 5 · You live alone: the real you, frozen by the window, the night city green behind the glass (notte)
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'wind', d: C.L05.dur + 1, v: .45 }],
      build: E => layered(E, {
        light: [-.01, .06, -.135], lightR: .09, lightCol: T.light, key: .85, amb: .55, ambCol: '#4a6a5a', sky: { stops: NSKY, stars: 70 }, on: false,
        layers: [
          { name: 'city', z: -.135, trans: .3, draw: x => { x.fillStyle = N.far; x.fillRect(-.25, -.45, .5, .465); houses(x, { x0: -.24, x1: .24, by: .015, h: .026, seed: 21, col: N.far, glass: N.glass, lit: false }); } },
          room('wall', -.11, N.near, '#06110c', null, { win: [-.05, .028, .07, .058] }),
          ...youLayers('scared', -.085, .02, .078),
          floorFront('#06110c', -.082),
        ],
        glows: { ph: [[0, .3]] },
        cam: [[0, lv(.36, -.006)], [E.dur, lv(.31, .006)]],
        focus: -.085, aper: 18, grade: { expo: 1.3 },
      }) },

    // 6 · Your phone lights up, unknown number (the chat is the overlay): your face lit green from below
    { id: 'S6', start: at('L06') - .15, sfx: [{ t: .1, type: 'click', v: .5 }, { t: .15, type: 'chime', v: .35 }],
      build: E => layered(E, {
        light: [.02, .05, -.13], lightR: .07, lightCol: T.glow, key: .85, amb: .55, sky: { stops: ROOM }, on: false,
        layers: [
          room('wall', -.12, '#10261c', '#06110c', null),
          ...youLayers('surprised', -.085, 0, .068),
          floorFront('#06110c', -.082),
        ],
        glows: { ph: [[0, .3], [.15, 1]] }, flicker: ['ph'],
        cam: [[0, lv(.25, .012, 0, -.085)], [E.dur, lv(.22, -.004, 0, -.085)]],   // close-up, push in
        focus: -.085, aper: 22, grade: { sat: .85, expo: 1.25 },
      }) },

    // 7 · On the roof across the road the tiny light is moving: the fox walks along the flat ridge with her lantern.
    //     The ridge is at the camera's height and the fox is on the roof's own plane: her paws stay on it.
    { id: 'S7', start: at('L07') - .2, sfx: [{ t: 0, type: 'wind', d: C.L07.dur + 1, v: .45 }, { t: .4, type: 'shimmer', v: .3 }],
      build: E => layered(E, {
        light: [0, .04, -.135], lightR: .12, lightCol: '#ffc878', key: .7, amb: .5, ambCol: '#7aa894', sky: { stops: NSKY, stars: 140 }, on: false,
        layers: [
          { name: 'roof', z: -.11, trans: .2, draw: x => hipHouse(x, { cx: .01, by: -.2, w: .26, h: .17, roof: .03, col: N.far, glass: N.glass, rows: 3 }) },
          foxAt(.055, 0, .03, -.109),
          { name: 'fg', z: -.07, trans: .02, shadow: false, draw: x => { x.fillStyle = N.near; x.fillRect(-.25, -.45, .5, .37); } },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        move: { fox: [[0, [0, 0, 0]], [E.dur, [-.075, 0, 0]]] },
        cam: [[0, lv(.36, .045, 0, -.11)], [E.dur, lv(.33, -.02, 0, -.11)]],   // tracks the fox along the ridge
        focus: -.109, aper: 16, grade: { expo: 1.25, vig: .3 },
      }) },

    // 8 · The fox at your back door, on the step: the lantern lights the door, and a scrap of cream paper slides along
    //     the step and under the door on "paper"
    { id: 'S8', start: at('L08') - .2, sfx: [{ t: 0, type: 'wind', d: C.L08.dur + 1, v: .4 }, { t: .2 + C.L08.dur * .75, type: 'paper', v: 1.2 }],
      build: E => {
        const slide = E.word('L08', 10);
        const back = { cx: .03, by: 0, w: .042, h: .084, col: '#2a1c12', panel: '#1a1009', glass: '#0a120e', frame: N.near, under: false, lit: false };
        return layered(E, {
          light: [-.01, .04, -.135], lightR: .09, lightCol: '#ffc878', key: .8, amb: .55, ambCol: '#7aa894', sky: { stops: NSKY }, on: false,
          layers: [
            room('house', -.12, N.mid, N.near, back, { glow: 0 }),
            { name: 'paper', z: -.107, trans: .1, shadow: false, w: .03, h: .02, x: -.004, y: .0022, draw: x => { x.fillStyle = CREAM; x.fillRect(-.007, -.0022, .014, .0044); } },
            foxAt(-.026, 0, .034, -.108),
            floorFront(N.near, -.104),
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          move: { paper: [[0, [0, 0, 0]], [slide, [0, 0, 0]], [slide + .55, [.032, 0, 0]], [slide + .85, [.034, -.006, 0]], [E.dur, [.034, -.006, 0]]] },
          cam: [[0, lv(.34, -.008, 0, -.11)], [E.dur, lv(.29, .006, 0, -.11)]],
          focus: -.11, aper: 18, grade: { expo: 1.25, vig: .25 },
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

    // 11 · Footsteps, your footsteps, down the hall (allarme): the copy walks away from you toward the red-lit front door,
    //      getting smaller with each step, its feet on the floor line
    { id: 'S11', start: at('L11') - .4, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .4, type: 'steps', n: 6, every: .5, v: 1, pan: .1 }, { t: 0, type: 'wind', d: C.L11.dur + 1, v: .35 }],
      build: E => layered(E, {
        light: [0, .05, -.135], lightR: .1, lightCol: A.glow, key: .85, amb: .55, ambCol: '#c08070', sky: { stops: ASKY }, on: false,
        layers: [
          room('hall', -.125, R.mid, R.near, FRONT(0, .036, .074)),
          copySheet('copy', -.1, 0, .07),
          hallSides(-.07, .066),
        ],
        glows: { hall: [[0, 1]] }, flicker: ['hall'],
        cam: [[0, lv(.44)], [E.dur, lv(.4)]],
        update: (t, L) => { const k = 1 - .3 * ramp(t, .4, E.dur); L.copy.scale.set(k, k, 1); },
        focus: -.1, aper: 18, grade: { expo: 1.2 },
      }) },

    // 12 · The front door opens: the leaf swings on its hinge on "opens", and through the doorway the copy, outside on the
    //      red-lit path, walks away into the street
    { id: 'S12', start: at('L12') - .1, sfx: [{ t: .1 + C.L12.dur * .3, type: 'crack', v: .6 }, { t: .1 + C.L12.dur * .3, type: 'whoosh', v: .7 }, { t: .1 + C.L12.dur * .35, type: 'thunder', v: .7 }],
      build: E => {
        const open = E.word('L12', 3), DW = .045, DH = .085;
        const leaf = { ...FRONT(0, DW, DH), by: -DH / 2, frame: null };
        return layered(E, {
          light: [0, .06, -.14], lightR: .14, lightCol: A.light, key: .85, amb: .55, ambCol: '#b05040', sky: { stops: ASKY }, on: false,
          layers: [
            { name: 'out', z: -.135, trans: .2, draw: x => { x.fillStyle = R.ground; x.fillRect(-.25, -.45, .5, .45); houses(x, { x0: -.24, x1: .24, by: .0, h: .022, seed: 5, col: R.far, glass: R.glass, lit: false }); } },
            copySheet('copy', -.12, 0, .056),
            { name: 'wall', z: -.1, trans: .03, draw: x => {
              x.fillStyle = R.mid; x.fillRect(-.25, 0, .5, .45); x.fillStyle = R.near; x.fillRect(-.25, -.45, .5, .45);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-DW / 2, 0, DW, DH); x.restore();
              doorFrame(x, { cx: 0, by: 0, w: DW, h: DH, col: '#2a0806' }); } },
            // the leaf: pinned on its hinge (left edge), it folds towards it as it swings into the hall
            { name: 'leaf', z: -.099, trans: .03, glow: 2.4, glowCol: A.glow, w: DW, h: DH, x: 0, y: DH / 2, ax: -DW / 2,
              draw: x => doorLeaf(x, leaf), glowDraw: g => doorLeaf(null, leaf, g) },
            floorFront(R.near, -.095, -.0005),
          ],
          update: (t, L) => {
            L.leaf.scale.x = 1 - .86 * ramp(t, open, open + .5);
            const k = 1 - .45 * ramp(t, open + .6, E.dur); L.copy.scale.set(k, k, 1);
          },
          cam: [[0, lv(.34)], [open, lv(.33)], [E.dur, lv(.31)]],
          focus: -.1, aper: 18, grade: { expo: 1.25, vig: .3 },
        });
      } },

    // 13 · The neighbors step aside: four of them, backs to us, part in the middle; between them the tall shadow walks
    //      the copy away down the street, both getting smaller, feet on the road
    { id: 'S13', start: at('L13') - .1, sfx: [{ t: 0, type: 'wind', d: C.L13.dur + 1, v: .5 }, { t: .3, type: 'steps', n: 5, every: .6, v: .6, pan: 0 }, { t: .1 + C.L13.dur * .6, type: 'thunder', v: .4 }],
      build: E => {
        const ppl = (name, xs) => ({ name, z: -.092, trans: .04, draw: x => xs.forEach(cx => neighbor(x, { cx, by: 0, s: .06, lantern: false, back: true, col: '#0a0202' })) });
        return layered(E, {
          light: [0, .07, -.14], lightR: .15, lightCol: A.light, key: .75, amb: .5, ambCol: '#b05040', sky: { stops: ASKY, stars: 40 }, on: false,
          layers: [
            { name: 'street', z: -.135, trans: .2, draw: x => { x.fillStyle = R.ground; x.fillRect(-.25, -.45, .5, .45); houses(x, { x0: -.24, x1: .24, by: 0, h: .026, seed: 9, col: R.far, glass: R.glass, lit: false }); } },
            { name: 'pair', z: -.12, trans: .04, glow: 2.4, glowCol: '#ffffff', w: .08, h: .1, x: 0, y: .05, ay: -.05,
              draw: x => { tallShadow(x, { cx: .01, by: -.05, s: .085, col: '#050101' }); neighbor(x, { cx: -.012, by: -.05, s: .05, lantern: false, back: true, col: GREEN }); },
              glowDraw: g => tallShadow(null, { cx: .01, by: -.05, s: .085 }, g) },
            ppl('left', [-.068, -.03]), ppl('right', [.03, .068]),
            floorFront(R.near, -.089),
          ],
          move: { left: [[0, [0, 0, 0]], [.6, [0, 0, 0]], [1.4, [-.014, 0, 0]], [E.dur, [-.014, 0, 0]]],
            right: [[0, [0, 0, 0]], [.6, [0, 0, 0]], [1.4, [.014, 0, 0]], [E.dur, [.014, 0, 0]]] },
          update: (t, L) => { const k = 1 - .35 * ramp(t, .8, E.dur); L.pair.scale.set(k, k, 1); },
          cam: [[0, lv(.44)], [E.dur, lv(.38)]],
          focus: -.11, aper: 14, grade: { expo: 1.25, vig: .3 },
        });
      } },

    // 14 · 6 am, the lights come back (alba): the skyline at dawn, windows lighting up row by row on "lights"
    { id: 'S14', start: at('L14') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: .3, type: 'shimmer', v: .4 }, { t: .4 + C.L14.dur * .4, type: 'chime', v: .4 }],
      build: E => {
        const on = E.word('L14', 4);
        const row = (n, z, col, by, h, seed) => ({ name: n, z, trans: .2, glow: 2.4, glowCol: D.light,
          draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, by + .45); houses(x, { x0: -.24, x1: .24, by, h, seed, col, glass: W.glass, lit: true }); },
          glowDraw: g => houses(null, { x0: -.24, x1: .24, by, h, seed, lit: true }, g) });
        return layered(E, {
          light: [0, .1, -.14], lightR: .18, lightCol: D.light, key: .65, amb: .5, ambCol: '#c9c493', sky: { stops: DSKY, stars: 20 }, on: false,
          layers: [row('far', -.12, W.far, .035, .04, 3), row('mid', -.1, W.mid, .012, .045, 8), row('near', -.08, W.near, -.012, .05, 13)],
          glows: { near: [[0, 0], [on, 0], [on + .1, 1]], mid: [[0, 0], [on + .15, 0], [on + .25, 1]], far: [[0, 0], [on + .3, 0], [on + .4, 1]] },
          cam: [[0, lv(.52, 0, .02)], [E.dur, lv(.46, 0, .02)]],
          focus: -.1, aper: 12,
        });
      } },

    // 15 · "All clear" (the alert card is the overlay): you by the window at dawn, calm at last, phone in hand
    { id: 'S15', start: at('L15') - .2, sfx: [{ t: .1, type: 'click', v: .4 }, { t: .2, type: 'chime', v: .3 }],
      build: E => layered(E, {
        light: [-.01, .06, -.135], lightR: .1, lightCol: D.light, key: .85, amb: .6, ambCol: '#c9c493', sky: { stops: DSKY }, on: false,
        layers: [
          { name: 'city', z: -.135, trans: .3, draw: x => { x.fillStyle = W.far; x.fillRect(-.25, -.45, .5, .465); houses(x, { x0: -.24, x1: .24, by: .015, h: .026, seed: 21, col: W.far, glass: W.glass, lit: false }); } },
          room('wall', -.11, W.near, '#0d1512', null, { win: [-.05, .028, .07, .058] }),
          ...youLayers('calm', -.085, .02, .078, D.glow),
          floorFront('#0d1512', -.082),
        ],
        glows: { ph: [[0, 1]] },
        cam: [[0, lv(.34, .006)], [E.dur, lv(.37, -.004)]],   // a slow pull back: it's over
        focus: -.085, aper: 18, grade: { expo: 1.15 },
      }) },

    // 16 · The end, held under the question: your house at dawn from across the road, the front door left wide open,
    //      no one in the street, and the fox sitting on the ridge of your roof with her lantern
    { id: 'S16', start: at('L16') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L16') + .5, v: .4 }, { t: .5, type: 'shimmer', v: .25 }, { t: end('L16') - at('L16') + .3, type: 'crack', v: .3 }],
      build: E => {
        const openDoor = x => {
          x.fillStyle = '#050706'; x.fillRect(-.011, .035, .022, .034);                 // the dark doorway
          x.fillStyle = '#2c3a33'; x.fillRect(-.011, .035, .005, .034);                 // the leaf, swung in against the hinge
          doorFrame(x, { cx: 0, by: .035, w: .022, h: .034, col: W.near });
          x.fillStyle = W.near; x.fillRect(-.016, .031, .032, .004);                    // the step
        };
        return layered(E, {
          light: [.02, .1, -.14], lightR: .16, lightCol: D.light, key: .75, amb: .55, ambCol: '#c9c493', sky: { stops: DSKY, stars: 10 }, on: false,
          layers: [
            { name: 'house', z: -.11, trans: .15, draw: x => {
              x.fillStyle = W.near; x.fillRect(-.25, -.45, .5, .481);                     // the front garden and the road
              x.fillStyle = W.far; x.fillRect(-.006, .0, .012, .031);                      // the path to the door
              hipHouse(x, { cx: 0, by: .035, w: .14, h: .045, roof: .02, col: W.mid, glass: W.glass, door: openDoor, rows: 2 }); } },
            foxAt(.024, .1, .024, -.109, 'watch', true),
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          cam: [[0, lv(.42, -.01, .045)], [E.dur, lv(.36, .008, .045)]],
          focus: -.11, aper: 14, grade: { expo: 1.15, vig: .3 },
        });
      } },
  ];
}
