// On My Way · Part 1 (Your Call) — shot list. At 11:52 pm your mom texts "on my way, 10 min", but she has been on your couch
// since ten, smiling at a TV that is off. The mom in the car can't find the house; the fox with the lantern stares at your front
// door; the couch creaks, she stands up, the dead TV turns on and she whispers who are you texting; headlights turn into your
// street. The end holds both moms in one picture (the car at the kerb, the silhouette in the window) for TEXT or COUCH.
// Redo 2: no zoom-ins at all (every camera keeps its distance and only pans or cranes; script.motion is off), the living room
// lit warm and clear so what happens inside the house reads at a glance, no stars in any sky.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, house, houses, streetlamp, neighbor, pines, phone, foreground, person, couch, tvSet, mug, car, wallClock } from './engine/kit/motifs.js';
import { text } from './engine/paper.js';
import { seg, ss } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const DARK = [[0, '#05081a'], [.6, '#0c1430'], [1, '#18244a']];
const ROOM = [[0, '#2a2440'], [1, '#3a3458']];
const WALL = '#4a3f66', WALL2 = '#3e3a62', FLOOR = '#2a2238';     // the living room: a warm dusk violet, readable, never black
const YOU = { coat: '#f2b632', hat: false };                       // you: the yellow puffer, the colour that reads at a glance
const MOM = { coat: '#b0506e', hair: '#3a2a22', pants: '#2a2533' };  // mom: a plum-rose cardigan and a bun

// the living-room wall with a window onto the night (the sky panel shows through the hole)
const wall = (col = WALL, win = [-.06, .1, .12, .12]) => x => {
  x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(...win); x.restore();
  const [wx, wy, ww, wh] = win; x.fillStyle = '#231d36';
  x.fillRect(wx, wy + wh / 2 - .002, ww, .004); x.fillRect(wx + ww / 2 - .002, wy, .004, wh); x.fillRect(wx - .008, wy - .008, ww + .016, .008);
};
const plain = (col = WALL) => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9); };
// a floor lamp: post and a shade that burns in g
const lamp = (cx, by, h) => ({
  draw: x => { x.fillStyle = '#1a1424'; x.fillRect(cx - .002, by, .004, h); x.fillRect(cx - .015, by, .03, .004);
    x.beginPath(); x.moveTo(cx - .02, by + h); x.lineTo(cx - .012, by + h + .03); x.lineTo(cx + .012, by + h + .03); x.lineTo(cx + .02, by + h); x.closePath(); x.fill(); },
  glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - .02, by + h); g.lineTo(cx - .012, by + h + .03); g.lineTo(cx + .012, by + h + .03); g.lineTo(cx + .02, by + h); g.closePath(); g.fill(); },
});
const floor = (top, col = FLOOR) => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, top + .45); x.fillStyle = '#5a4a6e'; x.fillRect(-.25, top - .002, .5, .003); };
// mom on the couch: the couch back, mom, then the seat front on its own sheet in front of her legs
const couchSet = (cx, by, w, z, face = 'smile', name = 'mom') => [
  { name: 'couchB', z, trans: .05, draw: x => couch(x, { cx, by, w, h: w * .45, col: '#7a3a48', dark: '#3a1c26' }) },
  { name, z: z + .002, trans: .02, w: .12, h: .14, x: cx, y: by + .06, draw: x => person(x, { ...MOM, cx: 0, by: -.06, s: w * .62, face }) },
  { name: 'couchF', z: z + .004, trans: .05, draw: x => couch(x, { cx, by, w, h: w * .45, col: '#7a3a48', dark: '#3a1c26', front: true }) },
];
// mom standing (a sheet of her own so she can rise or turn)
const momUp = (cx, by, s, z, face = 'smile', name = 'mom') =>
  ({ name, z, trans: .02, w: s * .7, h: s * 1.25, x: cx, y: by + s * .6, draw: x => person(x, { ...MOM, cx: 0, by: -s * .6, s, face }) });
// you, holding the phone up to your face; the phone screen glows on its own sheet
const youLayers = (face, z = -.07, by = -.02, s = .2) => [
  { name: 'you', z, trans: .02, draw: x => person(x, { ...YOU, cx: 0, by, s, face }) },
  { name: 'ph', z: z + .006, trans: .05, glow: 1.4, glowCol: '#9fb8ff', w: .06, h: .08, x: s * .19, y: by + s * .5,
    draw: x => phone(x, { cx: 0, cy: 0, w: s * .14, h: s * .25, screen: '#2a3150' }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: s * .14, h: s * .25 }, g) },
];
const ground = (col, base, seed, reedsAt = [-.2, -.1]) => x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt, reedsN: 16, stones: 4 }); };
const foxLayer = (cx, by, s, z = -.06, flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.2, w: s * 2.6, h: s * 2.6, x: cx, y: by + s,
  draw: x => fox(x, { cx: 0, by: -s, s, lantern: true, flip }), glowDraw: g => fox(null, { cx: 0, by: -s, s, lantern: true, flip }, g) });
const reveal = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); L[n].position.y = L[n].userData.p0.y - .006 * (1 - k); };
// your house from the street, one storey, both ground-floor windows lit; in the right one, mom's silhouette stands and watches
const HOUSE = { cx: .03, by: .07, w: .2, h: .1, roof: .055, cols: 3, rows: 1, col: '#1c2650' };
const momInWindow = g => { const [px, py] = house(null, { ...HOUSE, lit: false }, null)[1]; g.fillStyle = '#000';
  g.beginPath(); g.arc(px, py + .004, .0035, 0, Math.PI * 2); g.fill(); g.fillRect(px - .006, py - .011, .012, .012); };

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook: you in the warm living room, the phone lighting your face; the "Mom: on my way" card drops on frame 0. Truck right.
    { id: 'S1', start: 0, sfx: [{ t: .15, type: 'chime', v: .6 }, { t: .3, type: 'click', v: .4 }],
      build: E => layered(E, {
        light: [.04, .12, -.1], lightR: .16, lightCol: '#ffc878', key: 1.1, amb: .75, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall(WALL, [.03, .12, .1, .1]) },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.6, ...lamp(-.12, -.05, .2) },
          ...youLayers('calm'),
          { name: 'fg', z: -.04, trans: .02, draw: floor(-.03) },
        ],
        glows: { lamp: [[0, 1]], ph: [[0, 1]] },
        cam: [[0, [-.02, .09, .46, -.01, .09, -.07]], [E.dur, [.02, .09, .46, .01, .09, -.07]]],
        focus: -.065, aper: 18,
      }) },

    // 2 · But your mom is already home: a hard cut to her on the couch under the lamp, a little smile. Truck left.
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'whoosh', v: .6 }, { t: .15, type: 'crack', v: .4 }],
      build: E => layered(E, {
        light: [-.08, .14, -.1], lightR: .18, lightCol: '#ffc878', key: 1.15, amb: .75, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall(WALL, [.06, .13, .1, .1]) },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.8, ...lamp(-.1, .0, .17) },
          ...couchSet(0, .03, .2, -.085),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.03) },
        ],
        glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
        cam: [[0, [.03, .095, .45, .01, .095, -.08]], [E.dur, [-.02, .095, .45, -.005, .095, -.08]]],
        focus: -.083, aper: 18,
      }) },

    // 3 · She got home at ten, she made you tea: crane down from the wall clock at 11:52 to the steaming mug
    { id: 'S3', start: at('L03') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'paper', v: .4 }],
      build: E => layered(E, {
        light: [-.06, .14, -.1], lightR: .16, lightCol: '#ffc878', key: 1.1, amb: .7, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: plain(WALL) },
          { name: 'clock', z: -.11, trans: .1, draw: x => wallClock(x, { cx: .035, cy: .18, r: .028, h: 11, m: 52 }) },
          { name: 'table', z: -.08, trans: .03, draw: x => { x.fillStyle = '#5a3a2c'; x.fillRect(-.25, -.45, .5, .52); x.fillStyle = '#7a5038'; x.fillRect(-.25, .065, .5, .007); } },
          { name: 'mug', z: -.075, trans: .05, draw: x => mug(x, { cx: -.02, by: .072, s: .05, steam: false }) },
          { name: 'steam', z: -.074, trans: .3, w: .06, h: .08, x: -.02, y: .14, shadow: false, recv: false, draw: x => mug(x, { cx: 0, by: -.08, s: .05, col: 'rgba(0,0,0,0)', steam: true }) },
          { name: 'fg', z: -.04, trans: .02, draw: floor(-.05, '#2a1a16') },
        ],
        update: (t, L) => { const u = (t * .35) % 1; L.steam.position.y = L.steam.userData.p0.y + .012 * u; L.steam.material.color.setScalar(1 - ss(seg(u, .6, 1))); },
        cam: [[0, [-.01, .15, .42, .0, .145, -.08]], [E.dur, [-.01, .12, .42, -.01, .115, -.08]]],
        focus: [[0, -.11], [E.dur * .5, -.075]], aper: 22,
      }) },

    // 4 · You text her: you over the phone, eyes wide (the chat itself is the phone overlay). Slow truck.
    { id: 'S4', start: at('L04') - .15, sfx: [{ t: .4, type: 'click', v: .45 }, { t: .7, type: 'click', v: .4 }, { t: 1, type: 'click', v: .4 }],
      build: E => layered(E, {
        light: [.04, .1, -.06], lightR: .12, lightCol: '#ffd29a', key: 1, amb: .7, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: plain(WALL2) },
          ...youLayers('surprised'),
        ],
        glows: { ph: [[0, 1]] },
        cam: [[0, [-.02, .115, .36, 0, .115, -.07]], [E.dur, [.02, .115, .36, .005, .115, -.07]]],
        focus: -.07, aper: 20,
      }) },

    // 5 · "No, sweetheart. I'm still in the car." (her voice, through the phone): the car on a night road, headlights on; the camera tracks it
    { id: 'S5', start: at('L05') - .2, sfx: [{ t: 0, type: 'wind', d: end('L05') - at('L05') + 1, v: .35 }, { t: .1, type: 'whoosh', v: .5 }],
      build: E => layered(E, {
        light: [.0, .14, -.13], lightR: .18, lightCol: '#aabcf0', key: .7, amb: .45, sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'far', z: -.12, trans: .35, draw: x => { x.fillStyle = '#3a5088'; pines(x, { x0: -.25, x1: .25, base: .11, h: .06, n: 20, seed: 6 }); x.fillRect(-.25, -.45, .5, .56); } },
          { name: 'road', z: -.09, trans: .1, draw: x => { x.fillStyle = '#26315a'; x.fillRect(-.25, -.45, .5, .52); x.fillStyle = '#c9a46a'; for (let i = 0; i < 9; i++) x.fillRect(-.25 + i * .06, .045, .025, .002); } },
          { name: 'car', z: -.08, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.08, y: .085, draw: x => car(x, { cx: 0, by: -.02, w: .11 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .11 }, g) },
          { name: 'fg', z: -.04, trans: .03, draw: x => { x.fillStyle = '#121a36'; pines(x, { x0: -.25, x1: .25, base: -.02, h: .05, n: 8, seed: 3 }); x.fillRect(-.25, -.45, .5, .44); } },
        ],
        beams: [{ x: -.025, y: .0745, z: -.079, len: .3, width: .03, col: '#ffe6b0', rot: -.03, k: .9 }],
        move: { car: [[0, [0, 0, 0]], [E.dur, [.1, 0, 0]]] },
        update: (t, L, S) => { const b = S.scene.children.find(m => m.material?.uniforms?.spread); if (b) b.position.x = -.025 + L.car.position.x - L.car.userData.p0.x; },
        cam: [[0, [-.06, .1, .46, -.06, .1, -.08]], [E.dur, [.04, .1, .46, .04, .1, -.08]]],
        focus: -.08, aper: 16,
      }) },

    // 6 · On the couch, mom is watching TV, smiling: the whole living room, wide and lit — the lamp, mom on the couch,
    //     the back of the TV in the near corner, you at the right edge with your phone. A slow arc around the couch.
    { id: 'S6', start: at('L06') - .35, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'shimmer', v: .2 }, { t: 1.2, type: 'crack', v: .35 }],
      build: E => layered(E, {
        light: [-.06, .13, -.1], lightR: .18, lightCol: '#ffc878', key: 1.15, amb: .75, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall(WALL, [.05, .15, .08, .08]) },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.8, ...lamp(-.085, .02, .15) },
          ...couchSet(.01, .04, .18, -.09),
          { name: 'tvback', z: -.05, trans: .02, draw: x => { x.fillStyle = '#1a1424'; x.fillRect(-.25, -.45, .17, .5); x.fillRect(-.25, .02, .14, .045); x.fillStyle = FLOOR; x.fillRect(-.08, -.45, .33, .46); } },
          { name: 'you', z: -.055, trans: .02, w: .08, h: .18, x: .085, y: .075, draw: x => person(x, { ...YOU, cx: 0, by: -.085, s: .15, face: 'surprised' }) },
        ],
        glows: { lamp: [[0, 1]] },
        cam: [[0, [-.04, .1, .44, .0, .1, -.085]], [E.dur, [.03, .1, .44, .01, .1, -.085]]],
        focus: -.088, aper: 20,
      }) },

    // 7 · The TV is off: a hard cut to the TV in the lit room, its screen plainly black; in the glass, the faint reflection of her smile
    { id: 'S7', start: at('L07') - .1, sfx: [{ t: .05, type: 'thunder', v: .6 }, { t: .1, type: 'crack', v: .5 }],
      build: E => {
        const sm = E.cue('L07') + C.L07.dur * .6;
        return layered(E, {
          light: [0, .16, -.1], lightR: .16, lightCol: '#ffc878', key: 1.05, amb: .7, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .08, draw: plain(WALL) },
            { name: 'tv', z: -.09, trans: .02, draw: x => tvSet(x, { cx: 0, by: .03, w: .18, h: .18, col: '#141020', glass: '#05060c' }) },
            { name: 'ghost', z: -.088, trans: .4, glow: 1.6, glowCol: '#c9d6ff', w: .08, h: .1, x: .02, y: .125, shadow: false, recv: false,
              draw: x => neighbor(x, { cx: 0, by: -.05, s: .11, lantern: false, smile: true, col: '#0a0c16' }), glowDraw: g => neighbor(null, { cx: 0, by: -.05, s: .11, lantern: false, smile: true }, g) },
            { name: 'fg', z: -.05, trans: .02, draw: floor(.02) },
          ],
          glows: { ghost: [[0, 0], [sm - .3, 0], [sm + .6, .8]] },
          update: (t, L) => { L.ghost.material.color.setScalar(.35 * ss(seg(t, sm - .3, sm + .6))); },
          cam: [[0, [0, .11, .46, 0, .11, -.09]], [E.dur, [0, .125, .46, 0, .125, -.09]]],
          focus: -.09, aper: 18,
        });
      } },

    // 8 · "Honey, I can't find the house." (her voice again): you, scared, the screen lighting you from below (the "porch light?" card)
    { id: 'S8', start: at('L08') - .2, in: { type: 'dissolve', dur: .35 }, sfx: [{ t: .2, type: 'chime', v: .55 }, { t: .3, type: 'click', v: .4 }],
      build: E => layered(E, {
        light: [.04, .1, -.06], lightR: .12, lightCol: '#ffd29a', key: 1, amb: .65, ambCol: '#a89ac8', sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall(WALL2, [-.13, .1, .09, .12]) },
          ...youLayers('scared'),
        ],
        glows: { ph: [[0, .4], [.25, 1]] },
        cam: [[0, [.03, .105, .38, .01, .105, -.07]], [E.dur, [-.02, .105, .38, -.005, .105, -.07]]],
        focus: -.07, aper: 20,
      }) },

    // 9 · You check the window: the porch light is on, the street is empty, every other house is dark. Truck right along the glass.
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: end('L09') - at('L09') + 1, v: .35 }],
      build: E => layered(E, {
        light: [-.05, .08, -.11], lightR: .14, lightCol: '#ffc878', key: .75, amb: .5, sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'street', z: -.12, trans: .3, draw: x => { x.fillStyle = '#2e4072'; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .045, seed: 14, col: '#2e4072', lit: false }); } },
          { name: 'lamp', z: -.1, trans: .15, glow: 3, draw: x => streetlamp(x, { cx: .07, by: .03, h: .12, col: '#141c3c', dir: -1 }), glowDraw: g => streetlamp(null, { cx: .07, by: .03, h: .12, dir: -1 }, g) },
          { name: 'porch', z: -.095, trans: .1, glow: 3, draw: x => { x.fillStyle = '#141c3c'; x.fillRect(-.25, -.45, .2, .52); x.fillRect(-.07, .1, .012, .02); },
            glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(-.064, .095, .006, 0, Math.PI * 2); g.fill(); } },
          { name: 'wall', z: -.07, trans: .04, draw: wall(WALL, [-.1, .02, .2, .19]) },
        ],
        glows: { lamp: [[0, 1]], porch: [[0, 1]] }, flicker: ['porch'],
        cam: [[0, [-.03, .11, .44, -.01, .11, -.09]], [E.dur, [.02, .11, .44, .01, .11, -.09]]],
        focus: [[0, -.07], [E.dur * .4, -.1]], aper: 16,
      }) },

    // 10 · Except for a fox with a lantern, staring at your door: the fox under the streetlamp in front, your house behind it
    //      with both living-room windows lit and mom's silhouette standing in one of them. Pan from the fox to the house.
    { id: 'S10', start: at('L10') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .4, type: 'shimmer', v: .5 }, { t: 0, type: 'wind', d: end('L10') - at('L10') + 1, v: .3 }],
      build: E => {
        const lit = E.word('L10', 6);
        return layered(E, {
          light: [.0, .12, -.11], lightR: .16, lightCol: '#ffc878', key: .8, amb: .5, sky: { stops: DARK }, on: false,
          layers: [
            { name: 'house', z: -.11, trans: .15, glow: 2.8, draw: x => { house(x, HOUSE); x.fillStyle = '#1c2650'; x.fillRect(-.25, -.45, .5, .52); },
              glowDraw: g => { house(null, { ...HOUSE, lit: true }, g); momInWindow(g); g.fillStyle = '#fff'; g.beginPath(); g.arc(.03 + .022, .07 + .045, .004, 0, Math.PI * 2); g.fill(); } },
            { name: 'lamp', z: -.09, trans: .12, glow: 3, draw: x => streetlamp(x, { cx: -.1, by: .02, h: .15, col: '#141c3c' }), glowDraw: g => streetlamp(null, { cx: -.1, by: .02, h: .15 }, g) },
            { name: 'yard', z: -.075, trans: .06, draw: x => { x.fillStyle = '#18204a'; foreground(x, { base: .05, seed: 9, reedsAt: [.14, .2], reedsN: 12, stones: 3, amp: .003 }); } },
            foxLayer(-.07, .045, .06, -.07),
            { name: 'fg', z: -.03, trans: .03, draw: ground('#0c1128', .0, 13, [.12, .22]) },
          ],
          glows: { house: [[0, 1]], lamp: [[0, 1]], fox: [[0, .3], [lit - .2, .3], [lit + .4, 1]] }, flicker: ['fox'],
          cam: [[0, [-.05, .11, .46, -.05, .11, -.09]], [E.dur, [.0, .11, .46, -.005, .11, -.09]]],
          focus: [[0, -.07], [E.dur * .6, -.11]], aper: 18,
        });
      } },

    // 11 · Behind you, the couch creaks, she's standing up: the lit living room seen past your back at the window;
    //      mom rises from the couch, smiling. Crane up with her.
    { id: 'S11', start: at('L11') - .2, sfx: [{ t: .2 + C.L11.dur * .3, type: 'crack', v: .9 }, { t: .2 + C.L11.dur * .55, type: 'steps', n: 2, every: .55, v: 1.1 },
      { t: .2 + C.L11.dur * .75, type: 'crack', v: .6 }, { t: .2 + C.L11.dur * .5, type: 'paper', v: 1 }, { t: .2 + C.L11.dur * .45, type: 'thunder', v: .4 }],
      build: E => {
        const up = E.cue('L11') + C.L11.dur * .5;
        return layered(E, {
          light: [.0, .14, -.11], lightR: .18, lightCol: '#ffc878', key: 1.05, amb: .7, ambCol: '#a89ac8', sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'wall', z: -.13, trans: .12, draw: plain(WALL) },
            { name: 'lamp', z: -.12, trans: .1, glow: 2.6, ...lamp(-.03, .05, .13) },
            { name: 'couchB', z: -.11, trans: .04, draw: x => couch(x, { cx: .04, by: .05, w: .17, h: .075, col: '#7a3a48', dark: '#3a1c26' }) },
            momUp(.04, .06, .11, -.108, 'smile'),
            { name: 'couchF', z: -.106, trans: .04, draw: x => couch(x, { cx: .04, by: .05, w: .17, h: .075, col: '#7a3a48', dark: '#3a1c26', front: true }) },
            { name: 'fl', z: -.1, trans: .02, draw: floor(.05) },
            { name: 'you', z: -.05, trans: .02, draw: x => neighbor(x, { cx: -.08, by: -.06, s: .18, lantern: false, back: true, col: '#b88a1e' }) },
          ],
          glows: { lamp: [[0, 1]] },
          move: { mom: [[0, [0, -.035, 0]], [up, [0, -.035, 0]], [up + 1.2, [0, 0, 0]]] },
          cam: [[0, [-.02, .1, .44, .02, .1, -.1]], [E.dur, [-.02, .115, .44, .02, .115, -.1]]],
          focus: [[0, -.06], [up - .3, -.105]], aper: 18,
        });
      } },

    // 12 · The dead TV turns on by itself: the room goes cold blue, mom stands beside the screen, turned towards you. Truck left.
    { id: 'S12', start: at('L12') - .2, sfx: [{ t: .05, type: 'click', v: .6 }, { t: .1, type: 'crack', v: .5 }, { t: 0, type: 'wind', d: C.L12.dur + 1, v: .3 }],
      build: E => {
        const on = E.word('L12', 4);
        return layered(E, {
          light: [-.03, .12, -.08], lightR: .16, lightCol: '#9fb4ff', key: .9, amb: .55, ambCol: '#8a9ad0', sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .06, draw: plain(WALL2) },
            { name: 'tv', z: -.1, trans: .03, glow: 2.6, glowCol: '#b8c8ff', draw: x => tvSet(x, { cx: -.035, by: .05, w: .14, h: .13, col: '#141020', glass: '#05060c' }),
              glowDraw: g => tvSet(null, { cx: -.035, by: .05, w: .14, h: .13, on: true }, g) },
            momUp(.06, .05, .12, -.085, 'smile'),
            { name: 'fg', z: -.05, trans: .02, draw: floor(.05) },
          ],
          glows: { tv: [[0, 0], [on - .1, 0], [on + .05, .9], [on + .15, .3], [on + .3, 1]] }, flicker: ['tv'],
          cam: [[0, [.03, .1, .44, .01, .1, -.09]], [E.dur, [-.02, .1, .44, -.005, .1, -.09]]],
          focus: -.09, aper: 18,
        });
      } },

    // 13 · "Who are you texting, sweetheart?" (whispered, her own voice): mom in the TV light, smiling straight at you. Crane down to her face.
    { id: 'S13', start: at('L13') - .25, in: { type: 'dissolve', dur: .3 }, sfx: [{ t: 0, type: 'wind', d: C.L13.dur + 1.2, v: .3 }, { t: .2, type: 'shimmer', v: .25 }],
      build: E => layered(E, {
        light: [-.05, .15, -.06], lightR: .14, lightCol: '#a8bcff', key: .95, amb: .55, ambCol: '#8a9ad0', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .06, draw: plain(WALL2) },
          { name: 'tvglow', z: -.115, trans: .3, glow: 1.6, glowCol: '#b8c8ff', w: .1, h: .1, x: -.09, y: .12, shadow: false, recv: false,
            draw: x => { x.fillStyle = '#2a2e50'; x.fillRect(-.04, -.03, .08, .06); }, glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(-.04, -.03, .08, .06); } },
          momUp(.01, .04, .15, -.085, 'smile'),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.04) },
        ],
        glows: { tvglow: [[0, 1]] }, flicker: ['tvglow'],
        cam: [[0, [.0, .11, .4, .0, .11, -.085]], [E.dur, [.0, .1, .4, .0, .1, -.085]]],
        focus: -.085, aper: 20,
      }) },

    // 14 · Headlights turn into your street: the car rounds the corner, beams sweeping over the dark houses. Truck with the car.
    { id: 'S14', start: at('L14') - .25, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .1, type: 'whoosh', v: .7 }, { t: 0, type: 'wind', d: end('L14') - at('L14') + 1.2, v: .4 }],
      build: E => layered(E, {
        light: [.0, .1, -.12], lightR: .16, lightCol: '#ffe6b0', key: .75, amb: .45, sky: { stops: NIGHT }, on: false,
        layers: [
          { name: 'row', z: -.12, trans: .3, glow: 2.4, draw: x => { x.fillStyle = '#2e4072'; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .05, seed: 31, col: '#2e4072', lit: false }); } },
          { name: 'street', z: -.09, trans: .08, draw: x => { x.fillStyle = '#1e2850'; x.fillRect(-.25, -.45, .5, .505); } },
          { name: 'car', z: -.085, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.16, y: .07, draw: x => car(x, { cx: 0, by: -.02, w: .1 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1 }, g) },
          { name: 'fg', z: -.04, trans: .03, draw: ground('#0e1430', .0, 23, [-.2, -.1]) },
        ],
        beams: [{ x: -.11, y: .058, z: -.084, len: .32, width: .035, col: '#ffe6b0', rot: t => .25 - .28 * ss(seg(t, 0, 1.6)), k: t => ss(seg(t, 0, .4)) }],
        move: { car: [[0, [0, 0, 0]], [1.6, [.05, 0, 0]], [E.dur, [.08, 0, 0]]] },
        update: (t, L, S) => { const b = S.scene.children.find(m => m.material?.uniforms?.spread); if (b) b.position.x = -.11 + L.car.position.x - L.car.userData.p0.x; },
        cam: [[0, [-.04, .1, .48, -.04, .1, -.09]], [E.dur, [.0, .1, .48, -.01, .1, -.09]]],
        focus: -.085, aper: 16,
      }) },

    // 15 · Your call: both moms in one picture, the car at the kerb with its lights on (TEXT) and mom's silhouette in the lit
    //      window (COUCH); the fox in front with its lantern; signs on the words, held under the choice card. A slow crane up.
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L15') + .5, v: .3 }, { t: end('L15') - at('L15') + .4, type: 'thunder', v: .4 }],
      build: E => {
        const tA = E.word('L15', 7), tB = E.word('L15', 10);
        const sign = (s, cx, cy) => ({ name: s, z: -.06, trans: .25, w: .08, h: .03, x: cx, y: cy, shadow: false, recv: false, finish: { rim: .6 },
          draw: x => { x.fillStyle = '#f1dbac'; x.fillRect(-.036, -.012, .072, .024); text(x, s, 0, -.0005, .015, '"Anton"', { fill: s === 'TEXT' ? '#e8743b' : '#2b3a6a' }); } });
        return layered(E, {
          light: [.0, .1, -.12], lightR: .18, sky: { stops: DARK }, on: false, key: .8, amb: .45,
          layers: [
            { name: 'house', z: -.11, trans: .15, glow: 2.8, draw: x => { house(x, { cx: .05, by: .06, w: .15, h: .09, roof: .055, cols: 3, rows: 2, col: '#1c2650', lit: [3] }); x.fillStyle = '#1c2650'; x.fillRect(-.25, -.45, .5, .51); },
              glowDraw: g => { house(null, { cx: .05, by: .06, w: .15, h: .09, roof: .055, cols: 3, rows: 2, lit: true }, g); g.fillStyle = '#000'; g.beginPath(); g.arc(.05, .133, .0045, 0, Math.PI * 2); g.fill(); g.fillRect(.0445, .118, .011, .012); } },
            { name: 'car', z: -.09, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.07, y: .08, draw: x => car(x, { cx: 0, by: -.02, w: .1 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1 }, g) },
            { name: 'yard', z: -.075, trans: .06, draw: x => { x.fillStyle = '#18204a'; foreground(x, { base: .05, seed: 27, reedsAt: [.14, .22], reedsN: 12, stones: 3, amp: .003 }); } },
            foxLayer(.075, .05, .045, -.068, true),
            sign('TEXT', -.065, .12), sign('COUCH', .05, .19),
            { name: 'fg', z: -.025, trans: .03, draw: ground('#0c1128', .02, 17, [.1, .22]) },
          ],
          beams: [{ x: -.022, y: .074, z: -.089, len: .22, width: .025, col: '#ffe6b0', rot: .0, k: .8 }],
          glows: { house: [[0, 1]], car: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox'],
          update: (t, L) => { reveal(L, 'TEXT', t, tA); reveal(L, 'COUCH', t, tB); },
          cam: [[0, [-.01, .11, .5, -.01, .115, -.08]], [E.dur, [-.01, .125, .5, -.01, .13, -.08]]],
          focus: [[0, -.07], [tA, -.09], [tB, -.11]], aper: 14,
        });
      } },
  ];
}
