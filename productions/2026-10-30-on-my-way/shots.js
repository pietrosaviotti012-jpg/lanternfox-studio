// On My Way · Part 1 (Your Call) — shot list. At 11:52 pm your mom texts "on my way, 10 min", but she has been on your couch
// since ten, smiling at a TV that is off. The mom in the car can't find the house; the fox with the lantern sits under the
// streetlamp, staring at your front door; the couch creaks behind you, the dead TV turns on and asks who you're texting, and headlights turn
// into your street. The end holds both moms in one picture (the car at the kerb, the silhouette in the window) for TEXT or COUCH.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, house, houses, streetlamp, neighbor, pines, phone, foreground, person, couch, tvSet, mug, car, wallClock, dunes } from './engine/kit/motifs.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp } from './engine/lib.js';

const NIGHT = [[0, '#060a1c'], [.5, '#0e1734'], [.8, '#18264a'], [1, '#243458']];   // darker, colder than the usual night
const DARK = [[0, '#030510'], [.6, '#070b1e'], [1, '#0e1530']];
const ROOM = [[0, '#030409'], [1, '#0a0d1e']];
// the whole film a step darker and colder: every shot's grade is pulled down, desaturated and vignetted harder
const dim = s => ({ ...s, build: async E => { const r = await s.build(E), g0 = r.grade;
  r.grade = t => { const g = g0(t); return { ...g, expo: g.expo * .74, sat: g.sat * .68, vig: Math.max(g.vig, .7), contrast: g.contrast + .1, gain: g.gain || [.9, .95, 1.08] }; };
  return r; } });
const NOGLOW = { trans: 0, shadow: false, recv: false };
const YOU = { coat: '#f2b632', hat: false };                       // you: the yellow puffer, the colour that reads at a glance
const MOM = { coat: '#7a3f55', hair: '#3a2a22', pants: '#2a2533' };  // mom: a plum cardigan and a bun

// the living-room wall with a window onto the night (the sky panel shows through the hole)
const wall = (col = '#151a35', win = [-.06, .1, .12, .12]) => x => {
  x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(...win); x.restore();
  const [wx, wy, ww, wh] = win; x.fillStyle = '#0d1128';
  x.fillRect(wx, wy + wh / 2 - .002, ww, .004); x.fillRect(wx + ww / 2 - .002, wy, .004, wh); x.fillRect(wx - .008, wy - .008, ww + .016, .008);
};
// a floor lamp: post and a shade that burns in g
const lamp = (cx, by, h) => ({
  draw: x => { x.fillStyle = '#0b0e1e'; x.fillRect(cx - .002, by, .004, h); x.fillRect(cx - .015, by, .03, .004);
    x.beginPath(); x.moveTo(cx - .02, by + h); x.lineTo(cx - .012, by + h + .03); x.lineTo(cx + .012, by + h + .03); x.lineTo(cx + .02, by + h); x.closePath(); x.fill(); },
  glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - .02, by + h); g.lineTo(cx - .012, by + h + .03); g.lineTo(cx + .012, by + h + .03); g.lineTo(cx + .02, by + h); g.closePath(); g.fill(); },
});
const floor = (top, col = '#0a0d1d') => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, top + .45); x.fillStyle = '#121633'; x.fillRect(-.25, top - .002, .5, .003); };
// mom on the couch: the couch back, mom, then the seat front on its own sheet in front of her legs
const couchSet = (cx, by, w, z, face = 'smile', name = 'mom') => [
  { name: 'couchB', z, trans: .05, draw: x => couch(x, { cx, by, w, h: w * .45 }) },
  { name, z: z + .002, trans: .02, w: .12, h: .14, x: cx, y: by + .06, draw: x => person(x, { ...MOM, cx: 0, by: -.06, s: w * .62, face }) },
  { name: 'couchF', z: z + .004, trans: .05, draw: x => couch(x, { cx, by, w, h: w * .45, front: true }) },
];
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

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  const list = [
    // 1 · The hook: you in the dark living room, the phone lighting your face; the "Mom: on my way" card drops on frame 0
    { id: 'S1', start: 0, sfx: [{ t: .15, type: 'chime', v: .6 }, { t: .3, type: 'click', v: .4 }, { t: 0, type: 'wind', d: 7, v: .3 }],
      build: E => layered(E, {
        light: [.04, .1, -.1], lightR: .1, lightCol: '#a8c0ff', key: .9, amb: .6, sky: { stops: NIGHT, stars: 90 }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall('#151a35', [.03, .12, .1, .1]) },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.4, ...lamp(-.12, -.05, .2) },
          ...youLayers('calm'),
          { name: 'fg', z: -.04, trans: .02, draw: floor(-.03) },
        ],
        glows: { lamp: [[0, .55]], ph: [[0, 1]] },
        update: (t, L, S) => { S.U.uLight.value.set(.04, .1, -.06); },
        cam: [[0, [0, .085, .48, 0, .09, -.07]], [E.dur, [.008, .09, .42, .005, .095, -.07]]],
        focus: -.065, aper: 18, grade: { sat: .95, gain: [.96, 1, 1.06] },
      }) },

    // 2 · Except your mom is on your couch: a hard cut to her, warm lamp, a little smile; the camera punches in on "couch"
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'whoosh', v: .6 }, { t: .15, type: 'crack', v: .4 }],
      build: E => layered(E, {
        light: [-.08, .14, -.1], lightR: .14, lightCol: '#ffc878', key: 1, amb: .55, sky: { stops: NIGHT, stars: 60 }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall('#1a1d38', [.06, .13, .1, .1]) },
          { name: 'lamp', z: -.1, trans: .1, glow: 2.6, ...lamp(-.1, .0, .17) },
          ...couchSet(0, .03, .2, -.085),
          { name: 'fg', z: -.05, trans: .02, draw: floor(.03) },
        ],
        glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
        cam: [[0, [-.02, .09, .45, 0, .09, -.08]], [E.word('L02', 7) - .1, [0, .092, .41, 0, .092, -.08]], [E.word('L02', 7) + .1, [0, .1, .3, 0, .1, -.08]], [E.dur, [.01, .1, .28, .005, .1, -.08]]],
        focus: -.083, aper: 18,
      }) },

    // 3 · She got home at ten, she made you tea: the mug steaming on the table, the wall clock at 11:52 behind it
    { id: 'S3', start: at('L03') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'paper', v: .4 }],
      build: E => layered(E, {
        light: [-.06, .14, -.1], lightR: .12, lightCol: '#ffc878', key: .9, amb: .5, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#1a1d38'; x.fillRect(-.25, -.45, .5, .9); } },
          { name: 'clock', z: -.11, trans: .1, draw: x => wallClock(x, { cx: .035, cy: .18, r: .028, h: 11, m: 52 }) },
          { name: 'table', z: -.08, trans: .03, draw: x => { x.fillStyle = '#2a1a16'; x.fillRect(-.25, -.45, .5, .52); x.fillStyle = '#3a241c'; x.fillRect(-.25, .065, .5, .007); } },
          { name: 'mug', z: -.075, trans: .05, draw: x => mug(x, { cx: -.02, by: .072, s: .05, steam: false }) },
          { name: 'steam', z: -.074, trans: .3, w: .06, h: .08, x: -.02, y: .14, shadow: false, recv: false, draw: x => mug(x, { cx: 0, by: -.08, s: .05, col: 'rgba(0,0,0,0)', steam: true }) },
          { name: 'fg', z: -.04, trans: .02, draw: floor(-.05, '#120c0b') },
        ],
        update: (t, L) => { const u = (t * .35) % 1; L.steam.position.y = L.steam.userData.p0.y + .012 * u; L.steam.material.color.setScalar(1 - ss(seg(u, .6, 1))); },
        cam: [[0, [-.02, .14, .42, -.01, .13, -.08]], [E.dur, [.0, .12, .34, .0, .115, -.08]]],
        focus: [[0, -.075], [E.dur * .6, -.075], [E.dur, -.11]], aper: 22,
      }) },

    // 4 · You text back: a tighter shot of you, eyes wide over the phone (the chat itself is the phone overlay)
    { id: 'S4', start: at('L04') - .15, sfx: [{ t: .4, type: 'click', v: .45 }, { t: .7, type: 'click', v: .4 }, { t: 1, type: 'click', v: .4 }],
      build: E => layered(E, {
        light: [.04, .1, -.06], lightR: .08, lightCol: '#a8c0ff', key: .9, amb: .55, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#121630'; x.fillRect(-.25, -.45, .5, .9); } },
          ...youLayers('surprised'),
        ],
        glows: { ph: [[0, 1]] },
        cam: [[0, [-.03, .115, .32, 0, .115, -.07]], [E.dur, [.02, .115, .3, .0, .115, -.07]]],
        focus: -.07, aper: 20, grade: { sat: .85, gain: [.94, 1, 1.08] },
      }) },

    // 5 · "I'm still in the car": a car on a dark road between the pines, headlights cutting the night, driving right
    { id: 'S5', start: at('L05') - .2, sfx: [{ t: 0, type: 'wind', d: end('L05') - at('L05') + 1, v: .4 }, { t: .1, type: 'whoosh', v: .5 }],
      build: E => layered(E, {
        light: [.0, .14, -.13], lightR: .16, lightCol: '#aabcf0', key: .45, amb: .25, sky: { stops: NIGHT, stars: 150 }, on: false,
        layers: [
          { name: 'far', z: -.12, trans: .35, draw: x => { x.fillStyle = '#2a3d70'; pines(x, { x0: -.25, x1: .25, base: .11, h: .06, n: 20, seed: 6 }); x.fillRect(-.25, -.45, .5, .56); } },
          { name: 'road', z: -.09, trans: .1, draw: x => { x.fillStyle = '#16213f'; x.fillRect(-.25, -.45, .5, .52); x.fillStyle = '#c9a46a'; for (let i = 0; i < 9; i++) x.fillRect(-.25 + i * .06, .045, .025, .002); } },
          { name: 'car', z: -.08, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.08, y: .085, draw: x => car(x, { cx: 0, by: -.02, w: .11 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .11 }, g) },
          { name: 'fg', z: -.04, trans: .03, draw: x => { x.fillStyle = '#080c1e'; pines(x, { x0: -.25, x1: .25, base: -.02, h: .05, n: 8, seed: 3 }); x.fillRect(-.25, -.45, .5, .44); } },
        ],
        beams: [{ x: -.025, y: .0745, z: -.079, len: .3, width: .03, col: '#ffe6b0', rot: -.03, k: .9 }],
        move: { car: [[0, [0, 0, 0]], [E.dur, [.1, 0, 0]]] },
        update: (t, L, S) => { const b = S.scene.children.find(m => m.material?.uniforms?.spread); if (b) b.position.x = -.025 + L.car.position.x - L.car.userData.p0.x; },
        cam: [[0, [-.06, .1, .46, -.06, .1, -.08]], [E.dur, [.04, .1, .44, .04, .1, -.08]]],
        focus: -.08, aper: 16, grade: { sat: .9 },
      }) },

    // 6 · On the couch, mom watches TV, smiling, her face lit blue by the screen; the TV's back in the near corner
    { id: 'S6', start: at('L06') - .35, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'shimmer', v: .2 }, { t: 1.2, type: 'crack', v: .35 }, { t: 1.25, type: 'steps', n: 1, every: .3, v: .5 }],
      build: E => layered(E, {
        light: [.0, .1, -.06], lightR: .1, lightCol: '#8fb0ff', key: .85, amb: .45, ambCol: '#5a6a9a', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#141a33'; x.fillRect(-.25, -.45, .5, .9); } },
          ...couchSet(.02, .03, .2, -.09),
          { name: 'tvback', z: -.045, trans: .02, draw: x => { x.fillStyle = '#05070f'; x.fillRect(-.25, -.45, .2, .5); x.fillRect(-.25, .02, .17, .04); x.fillStyle = '#080a14'; x.fillRect(-.25, -.45, .5, .45); } },
        ],
        update: (t, L, S) => { S.U.uLightR.value = .1 + .01 * Math.sin(t * 9) * Math.sin(t * 2.3); },
        cam: [[0, [-.04, .095, .42, .0, .095, -.08]], [E.dur, [.0, .1, .3, .02, .105, -.085]]],
        focus: -.088, aper: 18, grade: { sat: .8, gain: [.92, 1, 1.1] },
      }) },

    // 7 · The TV is off: a hard cut to the dark screen; in the black glass, the faint reflection of a smile
    { id: 'S7', start: at('L07') - .1, sfx: [{ t: .05, type: 'thunder', v: .6 }, { t: .1, type: 'crack', v: .5 }],
      build: E => {
        const sm = E.cue('L07') + C.L07.dur * .7;
        return layered(E, {
          light: [0, .14, -.13], lightR: .12, lightCol: '#8fa6e8', key: .7, amb: .4, sky: { stops: [[0, '#02030a'], [1, '#0a0f24']] }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .08, draw: x => { x.fillStyle = '#26305a'; x.fillRect(-.25, -.45, .5, .9); } },
            { name: 'tv', z: -.09, trans: .02, draw: x => tvSet(x, { cx: 0, by: .02, w: .2, h: .2, col: '#020308', glass: '#2c3660' }) },
            { name: 'ghost', z: -.088, trans: .4, glow: 1.6, glowCol: '#c9d6ff', w: .08, h: .1, x: .02, y: .13, shadow: false, recv: false,
              draw: x => neighbor(x, { cx: 0, by: -.05, s: .12, lantern: false, smile: true, col: '#141a30' }), glowDraw: g => neighbor(null, { cx: 0, by: -.05, s: .12, lantern: false, smile: true }, g) },
            { name: 'fg', z: -.05, trans: .02, draw: floor(.0, '#05060d') },
          ],
          glows: { ghost: [[0, 0], [sm - .3, 0], [sm + .6, .7]] },
          update: (t, L) => { L.ghost.material.color.setScalar(.25 * ss(seg(t, sm - .3, sm + .6))); },
          cam: [[0, [0, .12, .5, 0, .12, -.09]], [E.dur, [0, .125, .38, .01, .125, -.09]]],
          focus: -.09, aper: 18, grade: { expo: 1.3, sat: .6, contrast: .18 },
        });
      } },

    // 8 · The phone buzzes again: you, scared, the screen lighting you from below (the "porch light?" card)
    { id: 'S8', start: at('L08') - .2, in: { type: 'dissolve', dur: .35 }, sfx: [{ t: .2, type: 'chime', v: .55 }, { t: .3, type: 'click', v: .4 }],
      build: E => layered(E, {
        light: [.04, .08, -.05], lightR: .08, lightCol: '#a8c0ff', key: .8, amb: .45, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: wall('#10142c', [-.13, .1, .09, .12]) },
          ...youLayers('scared'),
        ],
        glows: { ph: [[0, .4], [.25, 1]] },
        cam: [[0, [.03, .1, .38, .0, .1, -.07]], [E.dur, [-.01, .11, .3, .0, .112, -.07]]],
        focus: -.07, aper: 20, grade: { sat: .85, gain: [.94, 1, 1.08] },
      }) },

    // 9 · You look outside: through the window, the porch light is on, the street is empty, every house is dark
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: end('L09') - at('L09') + 1, v: .4 }],
      build: E => layered(E, {
        light: [-.05, .06, -.11], lightR: .1, lightCol: '#ffc878', key: .45, amb: .25, sky: { stops: NIGHT, stars: 120 }, on: false,
        layers: [
          { name: 'street', z: -.12, trans: .3, draw: x => { x.fillStyle = '#22335f'; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .045, seed: 14, col: '#22335f', lit: false }); } },
          { name: 'lamp', z: -.1, trans: .15, glow: 3, draw: x => streetlamp(x, { cx: .07, by: .03, h: .12, col: '#0e1532', dir: -1 }), glowDraw: g => streetlamp(null, { cx: .07, by: .03, h: .12, dir: -1 }, g) },
          { name: 'porch', z: -.095, trans: .1, glow: 3, draw: x => { x.fillStyle = '#0e1532'; x.fillRect(-.25, -.45, .2, .52); x.fillRect(-.07, .1, .012, .02); },
            glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(-.064, .095, .006, 0, Math.PI * 2); g.fill(); } },
          { name: 'wall', z: -.07, trans: .04, draw: wall('#151a33', [-.1, .02, .2, .19]) },
        ],
        glows: { lamp: [[0, 1]], porch: [[0, 1]] }, flicker: ['porch'],
        cam: [[0, [-.02, .11, .48, 0, .11, -.09]], [E.dur, [.02, .115, .38, .01, .115, -.1]]],
        focus: [[0, -.07], [E.dur * .4, -.1]], aper: 16,
      }) },

    // 10 · Almost empty: under the streetlamp, the fox with its lantern, looking up at your house; push in on the fox
    { id: 'S10', start: at('L10') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: .4, type: 'shimmer', v: .5 }, { t: 0, type: 'wind', d: end('L10') - at('L10') + 1, v: .35 }],
      build: E => {
        const lit = E.word('L10', 3);
        return layered(E, {
          light: [.04, .12, -.11], lightR: .12, lightCol: '#ffc878', key: .5, amb: .25, sky: { stops: DARK, stars: 110 }, on: false,
          layers: [
            { name: 'row', z: -.12, trans: .3, draw: x => { x.fillStyle = '#1b284f'; x.fillRect(-.25, -.45, .5, .53); houses(x, { x0: -.24, x1: .24, by: .08, h: .05, seed: 19, col: '#1b284f', lit: false }); } },
            { name: 'lamp', z: -.09, trans: .12, glow: 3, draw: x => streetlamp(x, { cx: .04, by: .03, h: .16, col: '#0e1532' }), glowDraw: g => streetlamp(null, { cx: .04, by: .03, h: .16 }, g) },
            { name: 'yard', z: -.075, trans: .06, draw: x => { x.fillStyle = '#0d1430'; foreground(x, { base: .045, seed: 9, reedsAt: [-.2, -.12], reedsN: 14, stones: 4, amp: .003 }); } },
            foxLayer(.0, .045, .07, -.07),
            { name: 'fg', z: -.03, trans: .03, draw: ground('#060914', .0, 13, [.1, .22]) },
          ],
          glows: { lamp: [[0, 1]], fox: [[0, .2], [lit - .2, .2], [lit + .4, 1]] }, flicker: ['fox'],
          cam: [[0, [.03, .14, .52, .03, .14, -.08]], [E.cue('L11') - .3, [.0, .1, .38, .0, .1, -.075]], [E.dur, [-.01, .095, .34, .0, .095, -.075]]],
          focus: [[0, -.09], [lit, -.07]], aper: 18,
        });
      } },

    // 11 · It's staring at your front door: over the fox's shoulder, your house, the porch light, the door; slow push to the door
    { id: 'S11', start: at('L11') - .15, sfx: [{ t: .1, type: 'whoosh', v: .4 }],
      build: E => layered(E, {
        light: [-.01, .07, -.1], lightR: .1, lightCol: '#ffc878', key: .45, amb: .22, sky: { stops: DARK, stars: 100 }, on: false,
        layers: [
          { name: 'house', z: -.11, trans: .15, glow: 2.6, draw: x => house(x, { cx: 0, by: .03, w: .18, h: .12, roof: .07, cols: 3, rows: 2, col: '#18224a', lit: [3] }),
            glowDraw: g => { house(null, { cx: 0, by: .03, w: .18, h: .12, roof: .07, cols: 3, rows: 2, lit: [3] }, g); g.beginPath(); g.arc(.024, .085, .005, 0, Math.PI * 2); g.fill(); } },
          { name: 'yard', z: -.08, trans: .06, draw: x => { x.fillStyle = '#0d1430'; foreground(x, { base: .03, seed: 21, reedsAt: [.12, .2], reedsN: 12, stones: 3, amp: .003 }); } },
          foxLayer(-.095, .0, .07, -.05, false),
        ],
        glows: { house: [[0, 1]], fox: [[0, .9]] }, flicker: ['fox'],
        cam: [[0, [-.04, .08, .5, -.02, .08, -.09]], [E.dur, [.0, .085, .36, .0, .075, -.11]]],
        focus: [[0, -.06], [E.dur * .5, -.11]], aper: 16,
      }) },

    // 12 · Behind you, the couch creaks: you at the window (from behind); in the dark room, mom rises from the couch
    { id: 'S12', start: at('L12') - .2, sfx: [{ t: .2 + C.L12.dur * .4, type: 'crack', v: .9 }, { t: .2 + C.L12.dur * .45, type: 'steps', n: 2, every: .55, v: 1.2 },
      { t: .2 + C.L12.dur * .75, type: 'crack', v: .6 }, { t: .2 + C.L12.dur * .6, type: 'paper', v: 1.1 }, { t: .2 + C.L12.dur * .55, type: 'thunder', v: .45 },
      { t: .2 + C.L12.dur + .3, type: 'steps', n: 4, every: .75, v: .9 }],
      build: E => {
        const up = E.cue('L12') + C.L12.dur * .55;
        return layered(E, {
          light: [.04, .14, -.12], lightR: .14, lightCol: '#8fa6e8', key: .75, amb: .45, ambCol: '#5a6a9a', sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'wall', z: -.13, trans: .12, draw: x => { x.fillStyle = '#232c55'; x.fillRect(-.25, -.45, .5, .9); } },
            { name: 'couchB', z: -.11, trans: .04, draw: x => couch(x, { cx: .04, by: .05, w: .17, h: .075, col: '#3a2030' }) },
            { name: 'mom', z: -.108, trans: .02, w: .1, h: .14, x: .04, y: .09, draw: x => neighbor(x, { cx: 0, by: -.06, s: .11, lantern: false, col: '#06070f' }) },
            { name: 'couchF', z: -.106, trans: .04, draw: x => couch(x, { cx: .04, by: .05, w: .17, h: .075, col: '#3a2030', front: true }) },
            { name: 'you', z: -.05, trans: .02, draw: x => neighbor(x, { cx: -.07, by: -.06, s: .2, lantern: false, back: true, col: '#05060d' }) },
            { name: 'fg', z: -.045, trans: .02, draw: floor(-.05, '#04050c') },
          ],
          move: { mom: [[0, [0, -.03, 0]], [up, [0, -.03, 0]], [up + 1.4, [0, 0, 0]]] },
          cam: [[0, [-.04, .1, .44, 0, .1, -.08]], [up, [-.02, .1, .4, .03, .1, -.1]], [E.dur, [.0, .105, .34, .04, .105, -.1]]],
          focus: [[0, -.06], [up, -.105]], aper: 16, grade: { sat: .7, contrast: .16 },
        });
      } },

    // 13 · The dead TV turns on by itself: a cold glow in the black room, her silhouette between you and the screen;
    //      her question is written on the screen (the `tv` overlay), never said by the narrator. Slow push in.
    { id: 'S13', start: at('L13') - .2, sfx: [{ t: .05, type: 'click', v: .6 }, { t: .1, type: 'crack', v: .5 }, { t: 0, type: 'wind', d: C.L13.dur + 1.2, v: .35 }],
      build: E => {
        const on = E.word('L13', 3);
        return layered(E, {
          light: [.0, .13, -.08], lightR: .09, lightCol: '#9fb4ff', key: .3, amb: .1, sky: { stops: [[0, '#010207'], [1, '#05070f']] }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .06, draw: x => { x.fillStyle = '#0c1024'; x.fillRect(-.25, -.45, .5, .9); } },
            { name: 'tv', z: -.1, trans: .03, glow: 2.6, glowCol: '#b8c8ff', draw: x => tvSet(x, { cx: 0, by: .04, w: .22, h: .2, col: '#020308', glass: '#1a2040' }),
              glowDraw: g => tvSet(null, { cx: 0, by: .04, w: .22, h: .2, on: true }, g) },
            { name: 'mom', z: -.07, trans: .02, w: .12, h: .16, x: -.06, y: .08, draw: x => neighbor(x, { cx: 0, by: -.07, s: .15, lantern: false, back: true, col: '#030409' }) },
            { name: 'fg', z: -.05, trans: .02, draw: floor(-.02, '#020308') },
          ],
          glows: { tv: [[0, 0], [on - .1, 0], [on + .05, .9], [on + .15, .3], [on + .3, 1]] }, flicker: ['tv'],
          cam: [[0, [0, .12, .46, 0, .12, -.09]], [E.dur, [-.01, .118, .36, 0, .12, -.09]]],
          focus: [[0, -.07], [on, -.1]], aper: 18, grade: { sat: .6, contrast: .2 },
        });
      } },

    // 14 · Headlights turn into your street: the car rounds the corner, beams sweeping over the dark houses
    { id: 'S14', start: at('L14') - .25, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .1, type: 'whoosh', v: .7 }, { t: 0, type: 'wind', d: end('L14') - at('L14') + 1.2, v: .4 }],
      build: E => layered(E, {
        light: [.0, .1, -.12], lightR: .12, lightCol: '#ffe6b0', key: .5, amb: .25, sky: { stops: NIGHT, stars: 120 }, on: false,
        layers: [
          { name: 'row', z: -.12, trans: .3, glow: 2.4, draw: x => { x.fillStyle = '#22335f'; x.fillRect(-.25, -.45, .5, .52); houses(x, { x0: -.24, x1: .24, by: .07, h: .05, seed: 31, col: '#22335f', lit: false }); } },
          { name: 'street', z: -.09, trans: .08, draw: x => { x.fillStyle = '#121a38'; x.fillRect(-.25, -.45, .5, .505); } },
          { name: 'car', z: -.085, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.16, y: .07, draw: x => car(x, { cx: 0, by: -.02, w: .1 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1 }, g) },
          { name: 'fg', z: -.04, trans: .03, draw: ground('#070a18', .0, 23, [-.2, -.1]) },
        ],
        beams: [{ x: -.11, y: .058, z: -.084, len: .32, width: .035, col: '#ffe6b0', rot: t => .25 - .28 * ss(seg(t, 0, 1.6)), k: t => ss(seg(t, 0, .4)) }],
        move: { car: [[0, [0, 0, 0]], [1.6, [.05, 0, 0]], [E.dur, [.08, 0, 0]]] },
        update: (t, L, S) => { const b = S.scene.children.find(m => m.material?.uniforms?.spread); if (b) b.position.x = -.11 + L.car.position.x - L.car.userData.p0.x; },
        cam: [[0, [-.03, .1, .5, -.03, .1, -.09]], [E.dur, [.01, .1, .44, .0, .1, -.09]]],
        focus: -.085, aper: 16,
      }) },

    // 15 · Your call: both moms in one picture, the car at the kerb with its lights on (TEXT) and the silhouette in the lit
    //      window (COUCH); the fox in front with its lantern; signs on the words, held under the choice card
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L15') + .5, v: .35 }, { t: end('L15') - at('L15') + .4, type: 'thunder', v: .45 }],
      build: E => {
        const tA = E.word('L15', 6), tB = E.word('L15', 12);
        const sign = (s, cx, cy) => ({ name: s, z: -.06, trans: .25, w: .08, h: .03, x: cx, y: cy, shadow: false, recv: false, finish: { rim: .6 },
          draw: x => { x.fillStyle = '#f1dbac'; x.fillRect(-.036, -.012, .072, .024); text(x, s, 0, -.0005, .015, '"Anton"', { fill: s === 'TEXT' ? '#e8743b' : '#2b3a6a' }); } });
        return layered(E, {
          light: [.0, .1, -.12], lightR: .16, sky: { stops: DARK, stars: 150 }, on: false,
          layers: [
            { name: 'house', z: -.11, trans: .15, glow: 2.8, draw: x => { house(x, { cx: .05, by: .06, w: .15, h: .09, roof: .055, cols: 3, rows: 2, col: '#18224a', lit: [3] }); x.fillStyle = '#18224a'; x.fillRect(-.25, -.45, .5, .51); },
              glowDraw: g => { house(null, { cx: .05, by: .06, w: .15, h: .09, roof: .055, cols: 3, rows: 2, lit: [3] }, g); g.fillStyle = '#000'; g.beginPath(); g.arc(.025, .133, .0045, 0, Math.PI * 2); g.fill(); g.fillRect(.0195, .118, .011, .012); } },
            { name: 'car', z: -.09, trans: .05, glow: 3.4, glowCol: '#ffe6b0', w: .14, h: .06, x: -.07, y: .08, draw: x => car(x, { cx: 0, by: -.02, w: .1 }), glowDraw: g => car(null, { cx: 0, by: -.02, w: .1 }, g) },
            { name: 'yard', z: -.075, trans: .06, draw: x => { x.fillStyle = '#0d1430'; foreground(x, { base: .05, seed: 27, reedsAt: [.14, .22], reedsN: 12, stones: 3, amp: .003 }); } },
            foxLayer(.065, .05, .045, -.068, true),
            sign('TEXT', -.065, .12), sign('COUCH', .05, .19),
            { name: 'fg', z: -.025, trans: .03, draw: ground('#060914', .02, 17, [.1, .22]) },
          ],
          beams: [{ x: -.022, y: .074, z: -.089, len: .22, width: .025, col: '#ffe6b0', rot: .0, k: .8 }],
          glows: { house: [[0, 1]], car: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox'],
          update: (t, L) => { reveal(L, 'TEXT', t, tA); reveal(L, 'COUCH', t, tB); },
          cam: [[0, [-.02, .11, .42, -.02, .12, -.08]], [E.cue('L16'), [0, .11, .5, 0, .12, -.08]], [E.dur, [0, .115, .56, 0, .125, -.08]]],
          focus: [[0, -.07], [tA, -.09], [tB, -.11]], aper: 14,
        });
      } },
  ];
  return list.map(dim);
}
