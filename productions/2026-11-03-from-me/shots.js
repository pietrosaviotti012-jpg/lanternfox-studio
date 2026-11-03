// From: Me · Night 1 (Il telefono sa qualcosa) — shot list. 3:07 am: you sit up in bed, your face lit blue by the phone:
// a text from your own number, "Don't open the door for me." You live alone, and downstairs a key turns in the front door.
// More texts from Me (it sounds like us, it has our key, don't answer, it learns your voice). Your step counter climbs while
// you lie still: fourteen steps, the stairs. Three soft knocks on your bedroom door, and your own voice whispers: "It's me.
// Don't trust the phone. It took my phone." On the screen, Me is typing. Two of you: one on the screen, one at the door.
// The end: your house from the street, your window blue, and on the roof across the street the fox with her lantern.
// Themes: telefono/notte (ink blue, the screen is the only light); telefono/allarme for the door (S8, S9, S12 left half).
// Rules kept from pipeline/MIGLIORARE.md:
// - first frame already full: you large in bed (a third of the height), the phone burning, the series tag and the clock on
//   screen, the lock screen with the text arriving at 0.3 s; a new picture at 1.6 s (the lock note) and a punch-in on "own";
// - the lower frame is never an empty band: the blanket, the floorboards, the stairs, the roofs;
// - level camera at the floor in every shot with a figure (lv()), true face close-ups at S2, S7, S10 (one every ~15 s);
// - the phone screen (line.phone) sits on the right half, clear of the series tag and above the pop captions, so you stay
//   visible on the left while the texts come in;
// - the choice on screen at the end (script.choice) and "NIGHT 2" (script.next).
import { layered } from './engine/kit/shot.js';
import { person, foxCameo, phone, doorFrame, doorLeaf, stairs, house, houses, bed, nightstand, houseKey } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { ss, clamp } from './engine/lib.js';

const T = theme('telefono', 'notte'), A = theme('telefono', 'allarme');
const TAU = Math.PI * 2;
const YOU = { coat: '#e0b03a', pants: '#1c2240', hat: false };            // you: the mustard hoodie, the one strong colour
const NIGHT = [[0, '#0a0d1c'], [.45, '#1a2246'], [.8, '#32406e'], [1, '#4a5a8a']];
const RED = [[0, '#1c0a12'], [.4, '#3a1222'], [.7, '#5c1c30'], [1, '#7a2a40']];
const WALL = '#2e3866', WALL2 = '#28305a', FLOOR = '#1c2244', HALL = '#232a52';
const RWALL = '#4a1a2c', RFLOOR = '#2a0c18';
const SCREEN = '#cfe0ff', WARM = '#ffcf8a';
const MOON = { x: .05, y: .16, r: .014, gain: 1.3, halo: 3.4, haloGain: .24 };

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
const ramp = (t, a, b) => ss(clamp((t - a) / (b - a)));
const floorFront = (col, z, top = .0015) => ({ name: 'floor', z, trans: .02, shadow: false, draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); } });
const planks = (x, col) => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45);
  x.fillStyle = 'rgba(0,0,0,.24)'; for (let i = 1; i < 16; i++) x.fillRect(-.25, -Math.pow(i / 16, 1.5) * .45, .5, .0012);
  x.fillStyle = 'rgba(220,230,255,.05)'; x.fillRect(-.25, -.004, .5, .004); };
// the bedroom: plaster wall with a skirting board, optional holes (the window onto the street), floorboards below
const room = (name, z, holes = [], o = {}) => ({ name, z, trans: .05,
  draw: x => {
    x.fillStyle = o.wall || WALL; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(-.25, 0, .5, .006);
    x.fillStyle = 'rgba(255,255,255,.035)'; for (let c = -12; c < 12; c++) x.fillRect(c * .02, 0, .0008, .45);   // faint wallpaper stripes
    for (const [hx, hy, hw, hh] of holes) {
      x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(hx - hw / 2, hy - hh / 2, hw, hh); x.restore();
      x.fillStyle = '#141a34'; x.fillRect(hx - .0015, hy - hh / 2, .003, hh); x.fillRect(hx - hw / 2, hy - .0015, hw, .003);
      x.fillRect(hx - hw / 2 - .003, hy - hh / 2 - .004, hw + .006, .004);                                   // sill
    }
    planks(x, o.floor || FLOOR);
  } });
// the street outside the window: a row of dark houses, a few windows lit
const street = (name, z, by = .04, seed = 7) => ({ name, z, trans: .2, glow: 1.6, glowCol: WARM,
  draw: x => houses(x, { x0: -.2, x1: .2, by, h: .035, seed, col: '#121834', glass: '#232a48', lit: false }),
  glowDraw: g => houses(null, { x0: -.2, x1: .2, by, h: .035, seed, lit: [1] }, g) });
// the face's own light: the screen light on the head, eyes and mouth stay dark (same geometry as person())
const faceGlow = (g, { cx, by, s, face }) => {
  const hr = s * .16, hy = by + s * .78, ex = hr * .36, ey = hy + hr * .05, big = face === 'scared' || face === 'surprised';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.fill();
  g.fillStyle = '#000'; for (const d of [-1, 1]) { g.beginPath(); g.arc(cx + d * ex, ey, hr * (big ? .09 : .11), 0, TAU); g.fill(); }
  g.fillRect(cx - hr * .28, hy - hr * .52, hr * .56, hr * .2);
};
// you sitting up in bed: headboard behind, you, the blanket in front up to the waist, the phone glowing in your hands
const inBed = (cx, s, face, z = -.09, o = {}) => {
  const w = s * .85, h = s * .26, pw = s * .13, ph = s * .22, py = s * .5;
  return [
    { name: 'head', z: z - .006, trans: .04, draw: x => { bed(x, { cx, by: 0, w, h, part: 'back' }); if (o.stand) nightstand(x, { cx: cx + w * .78, by: 0, w: s * .3, h: s * .3 }); } },
    { name: 'you', z, trans: .02, glow: .7, glowCol: SCREEN, draw: x => person(x, { ...YOU, cx, by: 0, s, face }), glowDraw: g => faceGlow(g, { cx, by: 0, s, face }) },
    { name: 'cover', z: z + .002, trans: .03, draw: x => bed(x, { cx, by: 0, w, h, part: 'front', cover: s * .2 }) },
    { name: 'phone', z: z + .003, trans: .02, glow: 3, glowCol: SCREEN,
      draw: x => phone(x, { cx: cx + s * .04, cy: py, w: pw, h: ph }), glowDraw: g => phone(null, { cx: cx + s * .04, cy: py, w: pw, h: ph }, g) },
  ];
};
// a door in the hall, the light under it; o.feet: two dark gaps in that light (someone standing outside)
const hallDoor = (name, z, cx, w, h, o = {}) => ({ name, z, trans: .05, glow: 2, glowCol: o.under || '#cfe0ff',
  draw: x => { x.fillStyle = o.wall || WALL2; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(255,255,255,.035)'; for (let c = -12; c < 12; c++) x.fillRect(c * .02, 0, .0008, .45);
    doorFrame(x, { cx, by: 0, w, h, col: '#121630' });
    doorLeaf(x, { cx, by: 0, w, h, col: o.leaf || '#3a3050', panel: '#2a2240', win: !!o.win, glass: '#1a2040', underCol: '#9ab' });
    planks(x, o.floor || FLOOR);
    if (o.feet) { x.fillStyle = '#04050a'; for (const d of [-1, 1]) x.fillRect(cx + d * w * .16 - w * .07, 0, w * .14, h * .025); } },
  glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(cx - w / 2, 0, w, h * .025);
    if (o.win) { const m = w * .14; g.fillRect(cx - w / 2 + m, h * .7, w - 2 * m, h * .2); }
    if (o.feet) { g.fillStyle = '#000'; for (const d of [-1, 1]) g.fillRect(cx + d * w * .16 - w * .07, 0, w * .14, h * .025); } } });
// the fox sitting on a roof with her lantern: paws on y = by
const foxAt = (cx, by, s, z, flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose: 'watch', flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose: 'watch', flip }, g) });

// The phone screen of this film (line.phone): on the right half of the frame, below the series tag and clock and above the
// pop captions (top 300 → 1000 px of 1920), so you stay visible on the left while the texts come in.
if (typeof document !== 'undefined' && !document.getElementById('from-me-ui')) {
  const st = document.createElement('style'); st.id = 'from-me-ui';
  st.textContent = '#ui .phone { left: 545px !important; top: 300px !important; width: 440px !important; height: 700px !important; border-radius: 54px !important; }'
    + ' #ui .phone .time { font-size: 120px !important; margin-top: 20px !important; }'
    + ' #ui .phone .big { font-size: 170px !important; }';
  document.head.append(st);
}

export function SHOTS(C, DUR) {
  const at = id => C[id].at;
  return [
    // 1 · The hook, already lit: you sitting up in bed on the left, a third of the frame, your face blue in the phone's light;
    //     the window behind you onto the dark street, the moon. The lock screen comes up on the right. Slow push in.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'room', d: 6, v: 0.3 }, { t: .3, type: 'chime', v: 0.3 }],
      build: E => layered(E, {
        light: [-.04, .05, -.12], lightR: .1, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT, stars: 90 }, moon: MOON, on: false,
        layers: [
          street('street', -.13),
          room('wall', -.115, [[.035, .085, .05, .06]]),
          ...inBed(-.04, .092, 'surprised', -.09, { stand: true }),
          floorFront(FLOOR, -.084),
        ],
        glows: { phone: [[0, .8], [.3, 1]], street: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.37, 0)], [E.dur, lv(.33, -.004)]],
        focus: -.09, aper: 14, grade: { expo: 1.5 },
      }) },

    // 2 · "Don't open the door for me": a true close-up of your face, eyes wide, the screen light from below. Hard cut.
    { id: 'S2', start: at('L02') - .1, sfx: [{ t: 0, type: 'breath', v: 0.24 }],
      build: E => layered(E, {
        light: [-.03, .05, -.12], lightR: .08, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT }, on: false,
        layers: [ room('wall', -.12), ...inBed(-.03, .09, 'scared') ],
        glows: { phone: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.15, -.002, .066, -.09)], [E.dur, lv(.13, -.004, .068, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.55, vig: .18 },
      }) },

    // 3 · Snapback, "a key just turned": downstairs, the front door in the dark hall, its little window grey with the street
    //     light, the brass knob; on "turned" the key in the lock turns and the door gives a jolt.
    { id: 'S3', start: at('L03') - .1, sfx: [{ t: .2, type: 'floor-creak', v: 0.2 }, { t: .1 + C.L03.dur * 8 / 13, type: 'click', v: 0.36 }],
      build: E => {
        const tk = E.word('L03', 8);
        return layered(E, {
          light: [0, .07, -.13], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT }, on: false,
          layers: [
            hallDoor('door', -.11, 0, .05, .09, { win: true, leaf: '#3a2a3c' }),
            { name: 'key', z: -.108, trans: .03, w: .03, h: .03, x: .02, y: .039, draw: x => houseKey(x, { cx: 0, cy: 0, s: .014, rot: Math.PI, col: '#e6c27a' }) },
          ],
          glows: { door: [[0, .55], [tk, .55], [tk + .1, .9], [tk + .5, .6]] },
          move: { key: [[0, [0, 0, 0]], [tk - .05, [0, 0, 0]], [tk + .25, [0, 0, -Math.PI / 2]], [E.dur, [0, 0, -Math.PI / 2]]],
            door: [[0, [0, 0, 0]], [tk + .2, [0, 0, 0]], [tk + .26, [.0008, 0, 0]], [tk + .34, [-.0004, 0, 0]], [tk + .42, [0, 0, 0]]] },
          cam: [[0, [.004, .045, .26, .004, .045, -.11]], [tk, [.008, .045, .2, .008, .045, -.11]], [E.dur, [.012, .045, .16, .012, .045, -.11]]],
          focus: -.11, aper: 16, grade: { expo: 1.55, vig: .2 },
        });
      } },

    // 4 · Another text: back in the bedroom, wider, from the other side of the room; the texts on the right
    { id: 'S4', start: at('L04') - .15, sfx: [{ t: .05, type: 'chime', v: 0.27 }],
      build: E => layered(E, {
        light: [-.05, .05, -.12], lightR: .1, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT, stars: 90 }, moon: { ...MOON, x: -.02 }, on: false,
        layers: [
          street('street', -.13, .04, 11),
          room('wall', -.115, [[-.01, .085, .05, .06]]),
          ...inBed(-.05, .088, 'scared', -.09, { stand: true }),
          floorFront(FLOOR, -.084),
        ],
        glows: { phone: [[0, 1]], street: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.42, -.02)], [E.dur, lv(.4, .004)]],
        focus: -.09, aper: 13, grade: { expo: 1.5 },
      }) },

    // 5 · "Don't answer it": you pull the blanket up to your chin, the camera creeping in from the left.
    //     The window is darker now: the lit window across the street goes out. Dissolve.
    { id: 'S5', start: at('L05') - .25, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .2, type: 'breath', v: 0.21 }],
      build: E => layered(E, {
        light: [-.04, .05, -.12], lightR: .09, lightCol: SCREEN, key: 1.05, amb: .8, ambCol: '#7a8ac0', sky: { stops: NIGHT, stars: 60 }, moon: MOON, on: false,
        layers: [
          street('street', -.13),
          room('wall', -.115, [[.035, .085, .05, .06]]),
          ...inBed(-.04, .092, 'scared'),
          floorFront(FLOOR, -.084),
        ],
        glows: { phone: [[0, 1]], street: [[0, 1], [E.dur * .5, 1], [E.dur * .5 + .15, 0]] }, flicker: ['phone'],
        move: { cover: [[0, [0, 0, 0]], [E.dur * .4, [0, .004, 0]], [E.dur, [0, .006, 0]]] },
        cam: [[0, lv(.3, -.03)], [E.dur, lv(.27, -.018)]],
        focus: -.09, aper: 14, grade: { expo: 1.5 },
      }) },

    // 6 · The step counter climbs: the stairs of the house in section, empty, a cold light from the hall below. The camera
    //     rises one flight with the count ("One. Two. Three."). Nobody on them.
    { id: 'S6', start: at('L06') - .2, in: { type: 'dissolve', dur: .4 },
      sfx: [7, 8, 9].map(i => ({ t: .2 + C.L06.dur * i / 10, type: 'steps', v: 0.3 })),
      build: E => {
        const w1 = E.word('L06', 7), w3 = E.word('L06', 9);
        return layered(E, {
          light: [-.03, -.04, -.12], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT }, on: false,
          layers: [
            { name: 'hall', z: -.12, trans: .05, draw: x => { x.fillStyle = HALL; x.fillRect(-.25, -.45, .5, .9); } },
            { name: 'below', z: -.118, trans: .1, glow: 2.2, glowCol: T.glow, draw: x => { x.fillStyle = '#10142a'; x.fillRect(-.07, -.08, .04, .06); },
              glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(-.068, -.078, .036, .056); } },
            { name: 'stairs', z: -.1, trans: .05, draw: x => stairs(x, { cx: 0, y0: -.08, flights: 2, fh: .07, w: .1, steps: 7, col: '#141a36' }) },
          ],
          glows: { below: [[0, .8], [w1, 1], [w3 + .5, .7]] }, flicker: ['below'],
          cam: [[0, [0, -.04, .3, 0, -.04, -.1]], [w1, [0, -.035, .3, 0, -.035, -.1]], [w3 + .4, [0, .01, .28, 0, .01, -.1]], [E.dur, [0, .025, .27, 0, .025, -.1]]],
          focus: -.1, aper: 14, grade: { expo: 1.55, vig: .2 },
        });
      } },

    // 7 · "You haven't moved. Fourteen steps.": a true close-up of you, frozen, eyes on the door off frame. Push in.
    { id: 'S7', start: at('L07') - .1, sfx: [{ t: .1, type: 'floor-creak', v: 0.24 }],
      build: E => layered(E, {
        light: [-.02, .05, -.12], lightR: .08, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT }, on: false,
        layers: [ room('wall', -.12), ...inBed(0, .09, 'scared') ],
        glows: { phone: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.2, 0, .062, -.09)], [E.dur, lv(.14, 0, .068, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.55, vig: .2 },
      }) },

    // 8 · Three soft knocks: your bedroom door, the light under it with two feet in it, the door shaking at each knock.
    //     Red creeps in (line.tint).
    { id: 'S8', start: at('L08') - .2,
      sfx: [{ t: .25, type: 'knock', v: 0.45 }, { t: .6, type: 'knock', v: 0.45 }, { t: .95, type: 'knock', v: 0.45 }],
      build: E => {
        const kn = [.25, .6, .95];
        const shake = []; for (const k of kn) shake.push([k - .02, [0, 0, 0]], [k, [.0012, 0, 0]], [k + .08, [-.0006, 0, 0]], [k + .16, [0, 0, 0]]);
        return layered(E, {
          light: [0, .07, -.135], lightR: .1, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#c08aa0', sky: { stops: RED }, on: false,
          layers: [ hallDoor('door', -.11, 0, .05, .09, { feet: true, wall: RWALL, floor: RFLOOR, leaf: '#4a2032', under: '#ffb0c0' }) ],
          glows: { door: [[0, .7], ...kn.flatMap(k => [[k, 1], [k + .15, .7]])] },
          move: { door: [[0, [0, 0, 0]], ...shake, [E.dur, [0, 0, 0]]] },
          cam: [[0, lv(.36, 0)], [E.dur, lv(.3, 0)]],
          focus: -.11, aper: 14, grade: { expo: 1.5 },
        });
      } },

    // 9 · "It's me. Please let me in.": the door close, red, the two feet under it; the leaf trembling as the voice whispers
    { id: 'S9', start: at('L09') - .1, sfx: [{ t: 0, type: 'whisper', v: 0.15 }, { t: .2, type: 'door-creak', v: 0.24 }],
      build: E => {
        const rat = []; for (let t = 0; t < E.dur; t += .27) rat.push([t, [((t * 7) % 2 > 1 ? 1 : -1) * .0004, 0, 0]]);
        return layered(E, {
          light: [0, .03, -.135], lightR: .1, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#c08aa0', sky: { stops: RED }, on: false,
          layers: [ hallDoor('door', -.11, 0, .05, .09, { feet: true, wall: RWALL, floor: RFLOOR, leaf: '#4a2032', under: '#ffb0c0' }) ],
          glows: { door: [[0, 1]] },
          move: { door: rat.length ? rat : [[0, [0, 0, 0]]] },
          cam: [[0, lv(.2, 0)], [E.dur, lv(.16, 0)]],
          focus: -.11, aper: 14, grade: { expo: 1.5, vig: .2 },
        });
      } },

    // 10 · "It's your voice. Exactly your voice.": the closest face of the film, mouth open, the red of the door on one side
    { id: 'S10', start: at('L10') - .1, sfx: [{ t: .05, type: 'boom', v: 0.3 }],
      build: E => layered(E, {
        light: [.04, .06, -.12], lightR: .08, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#a08ab0', sky: { stops: NIGHT }, on: false,
        layers: [ room('wall', -.12, [], { wall: '#3a2a52' }), ...inBed(0, .09, 'surprised') ],
        glows: { phone: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.12, 0, .07, -.09)], [E.dur, lv(.105, 0, .071, -.09)]],
        focus: -.09, aper: 18, grade: { expo: 1.55, vig: .22 },
      }) },

    // 11 · "And on the screen, Me is typing.": the phone large in your hands, its light the only light; the typing dots on
    //      the overlay. Lateral drift.
    { id: 'S11', start: at('L11') - .15, in: { type: 'dissolve', dur: .3 }, sfx: [{ t: .2, type: 'typing', d: C.L11.dur + .4, v: 0.24 }],
      build: E => layered(E, {
        light: [-.03, .04, -.12], lightR: .08, lightCol: SCREEN, key: 1.05, amb: .8, ambCol: '#7a8ac0', sky: { stops: NIGHT }, on: false,
        layers: [ room('wall', -.12), ...inBed(-.03, .09, 'scared') ],
        glows: { phone: [[0, .7], [.4, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.2, -.04, .045, -.09)], [E.dur, lv(.18, -.024, .047, -.09)]],
        focus: -.087, aper: 16, grade: { expo: 1.55, vig: .2 },
      }) },

    // 12 · The dilemma in one picture: the whole bedroom from the window, you in bed on the right with the phone burning blue,
    //      the door on the left with the red light under it and the two feet. Push in between them.
    { id: 'S12', start: at('L12') - .15, sfx: [{ t: 0, type: 'knock', v: 0.3 }, { t: .4, type: 'room', d: C.L12.dur + .4, v: 0.24 }],
      build: E => layered(E, {
        light: [.04, .05, -.12], lightR: .12, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT }, on: false,
        layers: [
          hallDoor('door', -.115, -.05, .04, .075, { feet: true, wall: WALL, under: '#ff7a95' }),
          ...inBed(.045, .085, 'scared'),
          floorFront(FLOOR, -.084),
        ],
        glows: { door: [[0, 1]], phone: [[0, 1]] }, flicker: ['phone', 'door'],
        cam: [[0, lv(.42, 0)], [E.dur, lv(.36, 0)]],
        focus: [[0, -.11], [E.dur * .5, -.09]], aper: 12, grade: { expo: 1.5, vig: .18 },
      }) },

    // 13 · The end, held under the choice: your house from the street, one window burning blue (yours), and close in front,
    //      on the ridge of the roof across the street, the fox with her lantern, watching it. Camera at the ridge.
    { id: 'S13', start: at('L13') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L13') + .5, v: 0.3 }],
      build: E => {
        const top = -.03;
        return layered(E, {
          light: [.04, .08, -.14], lightR: .2, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#7a8ac0', sky: { stops: NIGHT, stars: 160 }, moon: { ...MOON, x: -.06, y: .15 }, on: false,
          layers: [
            { name: 'town', z: -.13, trans: .2, glow: 1.4, glowCol: WARM, draw: x => houses(x, { x0: -.22, x1: .22, by: -.03, h: .04, seed: 3, col: '#141a38', glass: '#232a48', lit: false }),
              glowDraw: g => houses(null, { x0: -.22, x1: .22, by: -.03, h: .04, seed: 3, lit: [2, 7] }, g) },
            { name: 'home', z: -.115, trans: .12, glow: 2.6, glowCol: SCREEN,
              draw: x => { x.fillStyle = '#10152e'; x.fillRect(-.25, -.45, .5, .45 - .03); house(x, { cx: .035, by: -.03, w: .085, h: .08, rows: 2, cols: 2, col: '#181e40', glass: '#262e50', lit: false }); },
              glowDraw: g => house(null, { cx: .035, by: -.03, w: .085, h: .08, rows: 2, cols: 2, lit: [3] }, g) },
            { name: 'roof', z: -.097, trans: .08, draw: x => { x.fillStyle = '#0c1026'; x.beginPath(); x.moveTo(-.25, -.45); x.lineTo(-.25, top - .01); x.lineTo(-.09, top);
              x.lineTo(.02, top - .004); x.lineTo(.06, -.45); x.closePath(); x.fill();
              x.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 1; i < 10; i++) x.fillRect(-.25, top - i * .012, .3, .001); } },
            foxAt(-.045, top, .03, -.096),
          ],
          glows: { fox: [[0, 1]], home: [[0, 1]], town: [[0, 1]] }, flicker: ['fox', 'home'],
          cam: [[0, lv(.34, -.01, top, -.1)], [E.dur, lv(.3, 0, top, -.1)]],
          focus: -.096, aper: 10, grade: { expo: 1.5, vig: .18 },
        });
      } },
  ];
}
