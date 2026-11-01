// On My Way · Part 2 (Your Call) — shot list. Two of you said TEXT: at 12:03 am you trust the mom in the car. But the mom from
// the couch is standing in front of your door, smiling. The car mom texts "I'm outside, honey. Open up"; the couch mom whispers
// "that isn't me out there". Same voice, same cardigan, same smile. The fox on the lawn lifts its lantern to the window: in its
// light you cast a shadow on the wall, she doesn't. You run out the back into the headlights, your real mom hugs you; through
// the window the living room is empty, only the couch cushion still pressed down. The fox walks away. Then a message from Mom,
// sent at 10:00 pm: "I'm home, sweetheart. Made you tea." Who was on your couch?
// Same world as Part 1: the warm violet living room, the yellow puffer (you), the plum-rose cardigan (mom), no zoom-ins
// (script.motion is off; every camera only trucks or cranes), no stars in any sky.
// The shadow that is missing is the picture of the video: the lantern light is a glow on the wall with YOUR silhouette cut out
// of it, and nothing cut out beside her, so the empty wall reads at once.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, house, houses, streetlamp, neighbor, foreground, person, couch, car, doorFrame, mug } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';
import { seg, ss } from './engine/lib.js';

const T = theme('your-call', 'notte');
const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const DARK = [[0, '#05081a'], [.6, '#0c1430'], [1, '#18244a']];
const ROOM = [[0, '#2a2440'], [1, '#3a3458']];
const WALL = '#4a3f66', WALL2 = '#3e3a62', FLOOR = '#2a2238';
const YOU = { coat: '#f2b632', hat: false };
const MOM = { coat: '#b0506e', hair: '#3a2a22', pants: '#2a2533' };
const COUCH = { col: '#7a3a48', dark: '#3a1c26' };

const plain = (col = WALL) => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9); };
const wallWin = (col, win) => x => {
  x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(...win); x.restore();
  const [wx, wy, ww, wh] = win; x.fillStyle = '#231d36';
  x.fillRect(wx, wy + wh / 2 - .002, ww, .004); x.fillRect(wx + ww / 2 - .002, wy, .004, wh); x.fillRect(wx - .008, wy - .008, ww + .016, .008);
};
const floor = (top, col = FLOOR) => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, top + .45); x.fillStyle = '#5a4a6e'; x.fillRect(-.25, top - .002, .5, .003); };
const lamp = (cx, by, h) => ({
  draw: x => { x.fillStyle = '#1a1424'; x.fillRect(cx - .002, by, .004, h); x.fillRect(cx - .015, by, .03, .004);
    x.beginPath(); x.moveTo(cx - .02, by + h); x.lineTo(cx - .012, by + h + .03); x.lineTo(cx + .012, by + h + .03); x.lineTo(cx + .02, by + h); x.closePath(); x.fill(); },
  glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - .02, by + h); g.lineTo(cx - .012, by + h + .03); g.lineTo(cx + .012, by + h + .03); g.lineTo(cx + .02, by + h); g.closePath(); g.fill(); },
});
const momUp = (cx, by, s, z, face = 'smile', name = 'mom', arms = 'down') =>
  ({ name, z, trans: .02, w: s * .7, h: s * 1.25, x: cx, y: by + s * .6, draw: x => person(x, { ...MOM, cx: 0, by: -s * .6, s, face, arms }) });
const youUp = (cx, by, s, z, face = 'scared', name = 'you') =>
  ({ name, z, trans: .02, w: s * .7, h: s * 1.25, x: cx, y: by + s * .6, draw: x => person(x, { ...YOU, cx: 0, by: -s * .6, s, face }) });
const youLayers = (face, z = -.07, by = -.02, s = .2) => [
  { name: 'you', z, trans: .02, draw: x => person(x, { ...YOU, cx: 0, by, s, face }) },
  { name: 'ph', z: z + .006, trans: .05, glow: 1.4, glowCol: '#9fb8ff', w: .06, h: .08, x: s * .19, y: by + s * .5,
    draw: x => { x.fillStyle = '#10131f'; x.fillRect(-s * .07, -s * .125, s * .14, s * .25); x.fillStyle = '#2a3150'; x.fillRect(-s * .06, -s * .11, s * .12, s * .22); },
    glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(-s * .06, -s * .11, s * .12, s * .22); } },
];
const ground = (col, base, seed, reedsAt = [-.2, -.1]) => x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt, reedsN: 16, stones: 4 }); };
const foxLayer = (cx, by, s, z = -.06, flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.2, w: s * 2.6, h: s * 2.6, x: cx, y: by + s,
  draw: x => fox(x, { cx: 0, by: -s, s, lantern: true, flip }), glowDraw: g => fox(null, { cx: 0, by: -s, s, lantern: true, flip }, g) });
const HOUSE = { cx: .03, by: .07, w: .2, h: .1, roof: .055, cols: 3, rows: 1, col: '#1c2650' };
const silhouette = (g, px, py) => { g.fillStyle = '#000'; g.beginPath(); g.arc(px, py + .004, .0035, 0, Math.PI * 2); g.fill(); g.fillRect(px - .006, py - .011, .012, .012); };
const momInWindow = g => { const [px, py] = house(null, { ...HOUSE, lit: false }, null)[1]; silhouette(g, px, py); };
// the lantern light on the wall: a warm pool with the shadows of whoever stands in it cut out of it
const pool = (cx, cy, rx, ry, cuts = []) => g => {
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.globalCompositeOperation = 'destination-out';
  for (const c of cuts) neighbor(g, { ...c, lantern: false, back: true, col: '#000' });
  g.restore();
};
// the dent in a cushion: a darker hollow pressed into the seat, as if someone were still sitting there
const dent = (cx, by, w, h) => x => { x.fillStyle = 'rgba(30,10,18,.55)'; x.beginPath(); x.ellipse(cx, by + h * .4, w * .16, h * .07, 0, Math.PI, 0); x.fill();
  x.fillStyle = 'rgba(20,6,12,.35)'; x.beginPath(); x.ellipse(cx, by + h * .62, w * .13, h * .2, 0, 0, Math.PI * 2); x.fill(); };
const sign = (s, cx, cy, col = '#e8743b') => ({ name: s, z: -.06, trans: .25, w: .08, h: .03, x: cx, y: cy, shadow: false, recv: false, finish: { rim: .6 },
  draw: x => { x.fillStyle = '#f1dbac'; x.fillRect(-.036, -.012, .072, .024); text(x, s, 0, -.0005, .015, '"Anton"', { fill: col }); } });
const beamFollow = (L, S, name, x0) => { const b = S.scene.children.find(m => m.material?.uniforms?.spread); if (b) b.position.x = x0 + L[name].position.x - L[name].userData.p0.x; };

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The last picture of Part 1, with the vote: the car at the kerb, headlights on, the TEXT sign lit over it; mom's
    //     silhouette in the lit window; the fox in front. Full from frame 0. A slow crane down to the car.
    { id: 'S1', start: 0, sfx: [{ t: .1, type: 'chime', v: .55 }, { t: 0, type: 'wind', d: end('L01') + .5, v: .3 }],
      build: E => layered(E, {
        light: [.0, .1, -.12], lightR: .18, sky: { stops: DARK }, on: false, key: .85, amb: .5,
        layers: [
          { name: 'house', z: -.11, trans: .15, glow: 2.8, draw: x => { house(x, HOUSE); x.fillStyle = '#1c2650'; x.fillRect(-.25, -.45, .5, .52); },
            glowDraw: g => { house(null, { ...HOUSE, lit: true }, g); momInWindow(g); } },
          { name: 'car', z: -.09, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.08, y: .07, draw: x => car(x, { cx: 0, by: -.02, w: .1 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1 }, g) },
          { name: 'yard', z: -.075, trans: .06, draw: x => { x.fillStyle = '#18204a'; foreground(x, { base: .045, seed: 27, reedsAt: [.14, .22], reedsN: 12, stones: 3, amp: .003 }); } },
          foxLayer(.09, .04, .045, -.068, true),
          sign('TEXT', -.08, .115),
          { name: 'fg', z: -.025, trans: .03, draw: ground('#0c1128', .015, 17, [.1, .22]) },
        ],
        beams: [{ x: -.032, y: .064, z: -.089, len: .22, width: .025, col: '#ffe6b0', rot: 0, k: .85 }],
        glows: { house: [[0, 1]], car: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [-.01, .125, .5, -.01, .13, -.08]], [E.dur, [-.02, .11, .5, -.02, .115, -.08]]],
        focus: -.085, aper: 14,
      }) },

    // 2 · But she's standing in front of your door, still smiling: hard cut to the hallway, mom between you and the front door. Truck left.
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'whoosh', v: .6 }, { t: .15, type: 'crack', v: .45 }],
      build: E => layered(E, {
        light: [-.06, .14, -.1], lightR: .18, lightCol: '#ffc878', key: 1.1, amb: .75, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: plain(WALL) },
          { name: 'door', z: -.11, trans: .04, draw: x => { x.fillStyle = '#3a2430'; x.fillRect(-.005, .03, .07, .15); x.fillStyle = '#1a1424'; doorFrame(x, { cx: .03, by: .03, w: .07, h: .15 });
            x.fillStyle = '#c9a46a'; x.beginPath(); x.arc(.055, .1, .003, 0, Math.PI * 2); x.fill(); } },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.8, ...lamp(-.1, .03, .14) },
          momUp(.03, .03, .13, -.085, 'smile'),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.03) },
        ],
        glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
        cam: [[0, [.04, .1, .44, .015, .1, -.085]], [E.dur, [-.01, .1, .44, .0, .1, -.085]]],
        focus: -.085, aper: 18,
      }) },

    // 3 · Your phone buzzes, "I'm outside, honey. Open up": you, scared, the screen lighting your face. Truck right.
    { id: 'S3', start: at('L03') - .2, sfx: [{ t: .15, type: 'chime', v: .6 }, { t: .3, type: 'click', v: .4 }],
      build: E => layered(E, {
        light: [.04, .1, -.06], lightR: .12, lightCol: '#ffd29a', key: 1, amb: .7, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wallWin(WALL2, [-.15, .1, .09, .12]) },
          ...youLayers('scared'),
        ],
        glows: { ph: [[0, .4], [.2, 1]] },
        cam: [[0, [-.02, .11, .38, -.005, .11, -.07]], [E.dur, [.03, .11, .38, .01, .11, -.07]]],
        focus: -.07, aper: 20,
      }) },

    // 4 · "Don't, sweetheart. That isn't me out there." (whispered): mom up close in the lamp light, smiling at you. Crane down.
    { id: 'S4', start: at('L04') - .25, in: { type: 'dissolve', dur: .3 }, sfx: [{ t: 0, type: 'wind', d: C.L04.dur + 1, v: .3 }, { t: .2, type: 'shimmer', v: .25 }],
      build: E => layered(E, {
        light: [-.06, .15, -.07], lightR: .14, lightCol: '#ffc878', key: 1, amb: .65, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .06, draw: plain(WALL) },
          { name: 'lamp', z: -.11, trans: .1, glow: 2.4, ...lamp(-.1, .02, .14) },
          momUp(.015, .03, .16, -.085, 'smile'),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.03) },
        ],
        glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
        cam: [[0, [.0, .135, .4, .0, .135, -.085]], [E.dur, [.0, .12, .4, .0, .12, -.085]]],
        focus: -.085, aper: 20,
      }) },

    // 5 · Same voice, same cardigan, same smile: through your living-room window, mom in the headlights by the car outside;
    //     inside, at the right, the other mom, the same plum cardigan. Both in one picture. Truck right.
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: C.L05.dur + 1, v: .3 }, { t: .4, type: 'paper', v: .35 }],
      build: E => layered(E, {
        light: [.05, .14, -.08], lightR: .16, lightCol: '#ffc878', key: 1.05, amb: .7, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'street', z: -.13, trans: .3, glow: 3, glowCol: '#ffe6b0', draw: x => { x.fillStyle = '#2e4072'; x.fillRect(-.25, -.45, .5, .52);
            houses(x, { x0: -.24, x1: .24, by: .07, h: .04, seed: 14, col: '#2e4072', lit: false }); car(x, { cx: -.1, by: .06, w: .08 }); person(x, { ...MOM, cx: -.035, by: .06, s: .07, face: 'smile' }); },
            glowDraw: g => car(null, { cx: -.1, by: .06, w: .08 }, g) },
          { name: 'wall', z: -.1, trans: .04, draw: wallWin(WALL, [-.17, .05, .17, .15]) },
          { name: 'lamp', z: -.095, trans: .1, glow: 2.4, ...lamp(.03, .02, .13) },
          momUp(.1, .02, .13, -.08, 'smile', 'mom2'),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.02) },
        ],
        glows: { street: [[0, 1]], lamp: [[0, 1]] },
        cam: [[0, [-.04, .11, .46, -.03, .11, -.09]], [E.dur, [.01, .11, .46, .0, .11, -.09]]],
        focus: [[0, -.08], [E.dur * .5, -.12]], aper: 16,
      }) },

    // 6 · The fox on the lawn lifts its lantern to the window: the fox in front, your lit window behind; on "lantern" it rises
    //     and burns brighter. Truck left.
    { id: 'S6', start: at('L06') - .25, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'wind', d: C.L06.dur + .8, v: .3 }],
      build: E => {
        const lift = E.word('L06', 7);
        return layered(E, {
          light: [.0, .12, -.11], lightR: .16, lightCol: '#ffc878', key: .8, amb: .5, sky: { stops: DARK }, on: false,
          layers: [
            { name: 'house', z: -.11, trans: .15, glow: 2.6, draw: x => { house(x, { ...HOUSE, cx: .07, w: .22 }); x.fillStyle = '#1c2650'; x.fillRect(-.25, -.45, .5, .52); },
              glowDraw: g => house(null, { ...HOUSE, cx: .07, w: .22, lit: true }, g) },
            { name: 'yard', z: -.08, trans: .06, draw: x => { x.fillStyle = '#18204a'; foreground(x, { base: .06, seed: 9, reedsAt: [.14, .2], reedsN: 12, stones: 3, amp: .003 }); } },
            foxLayer(-.04, .06, .06, -.07),
            { name: 'fg', z: -.03, trans: .03, draw: ground('#0c1128', .0, 13, [.12, .22]) },
          ],
          glows: { house: [[0, 1]], fox: [[0, .5], [lift - .1, .5], [lift + .5, 1.3]] }, flicker: ['fox'],
          move: { fox: [[0, [0, 0, 0]], [lift - .1, [0, 0, 0]], [lift + .6, [0, .014, 0]]] },
          cam: [[0, [.03, .11, .46, .02, .11, -.09]], [E.dur, [-.02, .11, .46, -.02, .11, -.09]]],
          focus: -.07, aper: 18,
        });
      } },

    // 7 · The light hits the wall, you cast a shadow: you and mom side by side; behind you a warm pool of lantern light grows
    //     on the wall, with your silhouette cut out of it. Slow crane up.
    { id: 'S7', start: at('L07') - .2, sfx: [{ t: .1, type: 'shimmer', v: .45 }, { t: 0, type: 'wind', d: C.L07.dur + 1, v: .25 }],
      build: E => {
        const sh = E.word('L07', 7);
        return layered(E, {
          light: [.0, .12, -.08], lightR: .16, lightCol: '#ffc27a', key: 1, amb: .65, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .06, draw: plain(WALL2) },
            { name: 'pool', z: -.118, trans: .3, glow: 2.2, glowCol: '#ffc27a', shadow: false, recv: false, draw: () => {},
              glowDraw: pool(.0, .12, .17, .09, [{ cx: -.035, by: .045, s: .15 }]) },
            youUp(-.06, .03, .12, -.08, 'scared'),
            momUp(.07, .03, .12, -.08, 'smile'),
            { name: 'fg', z: -.05, trans: .02, draw: floor(.03) },
          ],
          glows: { pool: [[0, .1], [sh - .8, .5], [sh, 1]] }, flicker: ['pool'],
          cam: [[0, [.0, .1, .44, .0, .1, -.09]], [E.dur, [.0, .115, .44, .0, .115, -.09]]],
          focus: -.1, aper: 18,
        });
      } },

    // 8 · She doesn't: hard cut, closer on her side of the wall. Your shadow at the left edge; beside her, the wall is lit and empty. Hold.
    { id: 'S8', start: at('L08') - .1, sfx: [{ t: .05, type: 'thunder', v: .55 }, { t: .1, type: 'crack', v: .5 }],
      build: E => layered(E, {
        light: [.03, .13, -.08], lightR: .16, lightCol: '#ffc27a', key: 1, amb: .6, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .06, draw: plain(WALL2) },
          { name: 'pool', z: -.118, trans: .3, glow: 2.4, glowCol: '#ffc27a', shadow: false, recv: false, draw: () => {},
            glowDraw: pool(.02, .125, .17, .1, [{ cx: -.105, by: .04, s: .17 }]) },
          momUp(.04, .02, .15, -.08, 'smile'),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.02) },
        ],
        glows: { pool: [[0, 1]] }, flicker: ['pool'],
        cam: [[0, [.01, .115, .4, .01, .115, -.09]], [E.dur, [.03, .115, .4, .03, .115, -.09]]],
        focus: -.1, aper: 18,
      }) },

    // 9 · You run out the back door, around the house, into the headlights: you cross the side yard towards the car's beams.
    { id: 'S9', start: at('L09') - .2, sfx: [{ t: .1, type: 'whoosh', v: .7 }, { t: .3, type: 'steps', n: 6, every: .32, v: 1 }, { t: 0, type: 'wind', d: C.L09.dur + .8, v: .4 }],
      build: E => layered(E, {
        light: [.08, .1, -.1], lightR: .16, lightCol: '#ffe6b0', key: .85, amb: .5, sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'house', z: -.12, trans: .2, glow: 2.4, draw: x => { house(x, { cx: -.12, by: .06, w: .16, h: .09, roof: .05, cols: 2, rows: 1, col: '#1c2650' }); x.fillStyle = '#1c2650'; x.fillRect(-.25, -.45, .5, .51); },
            glowDraw: g => house(null, { cx: -.12, by: .06, w: .16, h: .09, roof: .05, cols: 2, rows: 1, lit: true }, g) },
          { name: 'car', z: -.095, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: .14, y: .065, draw: x => car(x, { cx: 0, by: -.02, w: .1, flip: true }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1, flip: true }, g) },
          youUp(-.1, .035, .1, -.085, 'scared'),
          { name: 'fg', z: -.04, trans: .03, draw: ground('#0e1430', .015, 23, [-.2, .2]) },
        ],
        beams: [{ x: .092, y: .059, z: -.094, len: .26, width: .03, col: '#ffe6b0', rot: Math.PI, k: .9 }],
        glows: { house: [[0, 1]], car: [[0, 1]] },
        move: { you: [[0, [0, 0, 0]], [E.dur, [.15, 0, 0]]] },
        update: (t, L) => { L.you.position.y = L.you.userData.p0.y + .003 * Math.abs(Math.sin(t * 9)); },
        cam: [[0, [-.06, .1, .46, -.06, .1, -.09]], [E.dur, [.03, .1, .46, .03, .1, -.09]]],
        focus: -.085, aper: 16,
      }) },

    // 10 · Your real mom hugs you, her coat smells like rain: the two of you in the headlights by the car, warm light. Crane up.
    { id: 'S10', start: at('L10') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'paper', v: .5 }, { t: .4, type: 'shimmer', v: .3 }],
      build: E => layered(E, {
        light: [.06, .12, -.08], lightR: .18, lightCol: '#ffe2b8', key: 1.05, amb: .6, ambCol: '#b8a0c0', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'street', z: -.12, trans: .3, draw: x => { x.fillStyle = '#2e4072'; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .045, seed: 31, col: '#2e4072', lit: false }); } },
          { name: 'car', z: -.1, trans: .05, glow: 3.2, glowCol: '#ffe6b0', w: .18, h: .07, x: .1, y: .07, draw: x => car(x, { cx: 0, by: -.025, w: .14 }), glowDraw: g => car(null, { cx: 0, by: -.025, w: .14 }, g) },
          momUp(.02, .03, .14, -.08, 'calm', 'mom', 'up'),
          youUp(-.025, .03, .12, -.076, 'calm'),
          { name: 'fg', z: -.04, trans: .03, draw: ground('#0e1430', .02, 41, [-.2, .2]) },
        ],
        glows: { car: [[0, 1]] },
        cam: [[0, [.0, .1, .42, .0, .1, -.08]], [E.dur, [.0, .115, .42, .0, .115, -.08]]],
        focus: -.08, aper: 20,
      }) },

    // 11 · Through the window, the living room is empty: the front of the house up close, the big window lit, the couch alone inside. Truck left.
    { id: 'S11', start: at('L11') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: C.L11.dur + 1, v: .35 }],
      build: E => layered(E, {
        light: [.0, .12, -.13], lightR: .16, lightCol: '#ffc878', key: .9, amb: .5, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'room', z: -.13, trans: .3, glow: 1.4, glowCol: '#ffc878', draw: x => { x.fillStyle = WALL; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = FLOOR; x.fillRect(-.25, -.45, .5, .52);
            couch(x, { cx: .0, by: .075, w: .16, h: .07, ...COUCH }); couch(x, { cx: .0, by: .075, w: .16, h: .07, ...COUCH, front: true }); },
            glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-.08, .15, .018, .012, 0, 0, Math.PI * 2); g.fill(); } },
          { name: 'facade', z: -.1, trans: .04, draw: wallWin('#1c2650', [-.12, .06, .24, .14]) },
          { name: 'fg', z: -.05, trans: .03, draw: ground('#0c1128', .03, 52, [-.22, .2]) },
        ],
        glows: { room: [[0, 1]] }, flicker: ['room'],
        cam: [[0, [.03, .12, .46, .02, .12, -.1]], [E.dur, [-.02, .12, .46, -.01, .12, -.1]]],
        focus: -.11, aper: 18,
      }) },

    // 12 · Only the couch cushion stays pressed down, as if someone is still sitting there: crane down to the dent in the seat.
    { id: 'S12', start: at('L12') - .2, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .2 + C.L12.dur * .55, type: 'crack', v: .55 }, { t: 0, type: 'wind', d: C.L12.dur + 1, v: .3 }],
      build: E => layered(E, {
        light: [-.06, .14, -.1], lightR: .17, lightCol: '#ffc878', key: 1.05, amb: .7, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: plain(WALL) },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.6, ...lamp(-.11, .02, .16) },
          { name: 'couchB', z: -.09, trans: .05, draw: x => couch(x, { cx: .01, by: .03, w: .22, h: .1, ...COUCH }) },
          { name: 'couchF', z: -.088, trans: .05, draw: x => { couch(x, { cx: .01, by: .03, w: .22, h: .1, ...COUCH, front: true }); dent(.03, .03, .22, .1)(x); } },
          { name: 'mug', z: -.075, trans: .05, draw: x => { x.fillStyle = '#3a2a24'; x.fillRect(-.2, -.45, .1, .51); mug(x, { cx: -.15, by: .06, s: .03, steam: true }); } },
          { name: 'fg', z: -.05, trans: .02, draw: floor(.03) },
        ],
        glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
        cam: [[0, [.01, .13, .42, .01, .13, -.09]], [E.dur, [.01, .1, .42, .01, .1, -.09]]],
        focus: -.088, aper: 20,
      }) },

    // 13 · The fox lowers its lantern and walks away into the dark: it crosses the street to the right, its glow fading.
    { id: 'S13', start: at('L13') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: C.L13.dur + 1, v: .35 }, { t: .3, type: 'shimmer', v: .3 }],
      build: E => layered(E, {
        light: [.0, .12, -.12], lightR: .16, lightCol: '#ffc878', key: .75, amb: .5, sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'row', z: -.12, trans: .3, draw: x => { x.fillStyle = '#2e4072'; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .05, seed: 8, col: '#2e4072', lit: false }); } },
          { name: 'lamp', z: -.1, trans: .12, glow: 3, draw: x => streetlamp(x, { cx: -.12, by: .03, h: .13, col: '#141c3c' }), glowDraw: g => streetlamp(null, { cx: -.12, by: .03, h: .13 }, g) },
          { name: 'street', z: -.085, trans: .08, draw: x => { x.fillStyle = '#1e2850'; x.fillRect(-.25, -.45, .5, .495); } },
          foxLayer(-.05, .05, .05, -.075),
          { name: 'fg', z: -.04, trans: .03, draw: ground('#0e1430', .0, 61, [-.2, -.1]) },
        ],
        glows: { lamp: [[0, 1]], fox: [[0, 1], [E.dur * .4, .9], [E.dur, .25]] }, flicker: ['fox'],
        move: { fox: [[0, [0, 0, 0]], [E.dur, [.16, 0, 0]]] },
        update: (t, L) => { L.fox.position.y = L.fox.userData.p0.y + .002 * Math.abs(Math.sin(t * 6)); },
        cam: [[0, [-.03, .1, .46, -.03, .1, -.08]], [E.dur, [.04, .1, .46, .04, .1, -.08]]],
        focus: -.075, aper: 16,
      }) },

    // 14 · Then your phone buzzes, a message sent at 10:00 pm: you by the car, the screen lighting your face. Truck right.
    { id: 'S14', start: at('L14') - .2, sfx: [{ t: .15, type: 'chime', v: .6 }, { t: .3, type: 'click', v: .4 }, { t: 0, type: 'wind', d: C.L14.dur + 1, v: .3 }],
      build: E => layered(E, {
        light: [.06, .1, -.06], lightR: .12, lightCol: '#ffd29a', key: 1, amb: .6, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'street', z: -.12, trans: .3, glow: 2.4, glowCol: '#ffe6b0', draw: x => { x.fillStyle = '#26315a'; x.fillRect(-.25, -.45, .5, .55); car(x, { cx: .12, by: .1, w: .12 }); },
            glowDraw: g => car(null, { cx: .12, by: .1, w: .12 }, g) },
          ...youLayers('surprised'),
        ],
        glows: { street: [[0, 1]], ph: [[0, .4], [.25, 1]] },
        cam: [[0, [-.02, .11, .38, -.005, .11, -.07]], [E.dur, [.03, .11, .38, .01, .11, -.07]]],
        focus: -.07, aper: 20,
      }) },

    // 15 · Who was on your couch? The house from the street, the living-room window lit; you and mom small by the car; then the
    //     window light flickers once, as if someone just sat down. A slow crane up, held for the question.
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L15') + .5, v: .3 }, { t: end('L15') - at('L15') + .5, type: 'crack', v: .4 }],
      build: E => {
        const blink = end('L15') - at('L15') + .5;
        return layered(E, {
          light: [.0, .1, -.12], lightR: .18, sky: { stops: DARK }, on: false, key: .8, amb: .45,
          layers: [
            { name: 'house', z: -.11, trans: .15, glow: 2.8, draw: x => { house(x, { ...HOUSE, cx: .05 }); x.fillStyle = '#1c2650'; x.fillRect(-.25, -.45, .5, .52); },
              glowDraw: g => house(null, { ...HOUSE, cx: .05, lit: true }, g) },
            { name: 'car', z: -.09, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.1, y: .07, draw: x => car(x, { cx: 0, by: -.02, w: .1 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1 }, g) },
            { name: 'two', z: -.085, trans: .03, draw: x => { person(x, { ...MOM, cx: -.035, by: .05, s: .065, face: 'calm' }); person(x, { ...YOU, cx: -.015, by: .05, s: .055, face: 'scared' }); } },
            { name: 'yard', z: -.075, trans: .06, draw: x => { x.fillStyle = '#18204a'; foreground(x, { base: .045, seed: 33, reedsAt: [.14, .22], reedsN: 12, stones: 3, amp: .003 }); } },
            { name: 'fg', z: -.025, trans: .03, draw: ground('#0c1128', .015, 19, [.1, .22]) },
          ],
          beams: [{ x: -.052, y: .064, z: -.089, len: .2, width: .025, col: '#ffe6b0', rot: 0, k: .8 }],
          glows: { house: [[0, 1], [blink, 1], [blink + .08, .15], [blink + .25, 1]], car: [[0, 1]] },
          cam: [[0, [-.01, .11, .5, -.01, .115, -.08]], [E.dur, [-.01, .125, .5, -.01, .13, -.08]]],
          focus: -.09, aper: 14,
        });
      } },
  ];
}
