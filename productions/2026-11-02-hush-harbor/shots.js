// Hush Harbor · Part 1 (Non fare rumore) — shot list. 3:12 am, the night ferry's engines cut out in the fog and the lounge
// lights die. The captain whispers into the radio; the wall loudspeaker says it: nobody makes a sound. The locals are already
// taking off their shoes, pair after pair set down on the metal deck. Three rules on the lounge screen (phone off, shoes off,
// never touch the railing): past the railing, in the fog, a fox sits on a channel buoy with her lantern. At 3:20 something big
// slides under the hull (seen from the water line, a dark mass with one red eye) and stops right under your feet (the deck in
// cross-section: you above, the eye below). A close-up of your face: it's listening. Two rows ahead a little girl opens a music
// box, it starts to play (close-up, notes rising, red), her mother asleep on the bench, the girl smiling. In cross-section the
// eye slides from under you toward the music. The dilemma framed in one picture: the girl and her box on the left across the
// deck, the railing on the right. The end holds the ferry in the fog and the fox on her buoy under the choice.
// Themes: regole/notte (S1-S11, S13), regole/allarme for the red moments (S9, S12, S14, S15).
// Rules kept from the last notes (pipeline/MIGLIORARE.md):
// - first frame already full: you large in the lounge (≥ a third of the height), no fade from black;
// - the lower frame is never an empty band: a ribbed metal deck, or the water with the thing in it under the deck line;
// - level camera at the floor in every shot with a figure (lv()), a floor strip in front of the feet;
// - a face close-up in the scary lines (S10), the key object large on its own (the loudspeaker S3, the music box S12);
// - the choice on screen at the end (script.choice) and "PART 2" (script.next).
// Redo 2026-11-02 (note): lighter walls, deck, sea and fog, more key and ambient light, brighter grade, less vignette and blur;
// effects at 60 % under a clearer voice; the rules card keeps a continuous white ticker strip with the rule repeating.
import { layered } from './engine/kit/shot.js';
import { neighbor, phone, person, foxCameo, couch, railing, hulk, ferry, speakerBox, musicBox, shoes, buoy, metalDeck } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { ss, clamp } from './engine/lib.js';

const T = theme('regole', 'notte'), A = theme('regole', 'allarme');
const TAU = Math.PI * 2;
const YOU = { coat: '#d9a43a', pants: '#1d2a26' };                       // you: the mustard puffer, the one strong colour
const CAPT = { coat: '#15233a', hat: '#0c1424', pants: '#0c1424' };
const GIRL = { coat: '#7d8ca0', pants: '#3a4250', hair: '#2a1a12' };
const MOM = { coat: '#4a5a52', pants: '#2a3330', hair: '#3a2418' };
const FOG = [[0, '#1a2e28'], [.35, '#3a5a4e'], [.6, '#628a7a'], [1, '#8fb4a4']];
const RFOG = [[0, '#2a0e0c'], [.35, '#5a1c16'], [.6, '#8a3424'], [1, '#b0503a']];
const WALL = '#2a4c3e', WALL2 = '#203e32', DECK = '#1c3229', SEA = '#16302a', SEAR = '#3a100c';
const BENCH = { col: '#3e5c4e', dark: '#1e3028' };

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
// the floor in front of a figure: a few mm in front of it, its top edge just over the soles
const floorFront = (col, z, top = .0015) => ({ name: 'floor', z, trans: .02, shadow: false, draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); } });
const ramp = (t, a, b) => ss(clamp((t - a) / (b - a)));

// the lounge: a wall with portholes (holes onto the fog), a ribbed metal deck below the floor line
const lounge = (name, z, holes = [], o = {}) => ({ name, z, trans: .05,
  draw: x => {
    x.fillStyle = o.wall || WALL; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(-.25, .0, .5, .012);                           // a dark wainscot
    for (const [hx, hy, r] of holes) {
      x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(hx, hy, r, 0, TAU); x.fill(); x.restore();
      x.strokeStyle = '#2f4a3e'; x.lineWidth = r * .22; x.beginPath(); x.arc(hx, hy, r * 1.08, 0, TAU); x.stroke();
    }
    metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: o.deck || DECK });
  } });
// a row of ceiling lamps high on the wall: they die when the engines cut out
const lamps = (name, z, y, xs) => ({ name, z, trans: .1, glow: 2.2, glowCol: '#d8ffe6',
  draw: x => { x.fillStyle = '#1d3a2e'; for (const cx of xs) x.fillRect(cx - .014, y, .028, .005); },
  glowDraw: g => { g.fillStyle = '#fff'; for (const cx of xs) g.fillRect(cx - .013, y + .001, .026, .003); } });
// the face's own light: the head glows softly, eyes and mouth stay dark (same geometry as person())
const faceGlow = (g, { cx, by, s, face }) => {
  const hr = s * .16, hy = by + s * .78, ex = hr * .36, ey = hy + hr * .05, big = face === 'scared' || face === 'surprised';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.fill();
  g.fillStyle = '#000'; for (const d of [-1, 1]) { g.beginPath(); g.arc(cx + d * ex, ey, hr * (big ? .09 : .11), 0, TAU); g.fill(); }
  g.fillRect(cx - hr * .28, hy - hr * .52, hr * .56, hr * .2);
};
const FACE = { glow: .6, glowCol: '#f6e8d6' };
const figure = (name, z, look, cx, s, face, extra = {}) => ({ name, z, trans: .02, ...FACE, ...extra,
  draw: x => person(x, { ...look, cx, by: 0, s, face }), glowDraw: g => faceGlow(g, { cx, by: 0, s, face }) });
// you, standing on the floor line, phone in hand
const youLayers = (face, z, cx, s, glowCol = T.glow) => [
  figure('you', z, YOU, cx, s, face),
  { name: 'ph', z: z + .004, trans: .05, glow: 1.6, glowCol, w: .05, h: .07, x: cx + s * .19, y: s * .5,
    draw: x => phone(x, { cx: 0, cy: 0, w: s * .14, h: s * .25, screen: '#13261c' }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: s * .14, h: s * .25 }, g) },
];
// where person()'s right hand hangs (arms down): for things held in the hand
const hand = (cx, s) => [cx + s * .092, s * .334];
// the fox on whatever she sits on: paws on y = by, same plane as it
const foxAt = (cx, by, s, z, pose = 'watch', flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose, flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose, flip }, g) });
// the sea seen from the deck or the water line: flat water below y = top, a few pale ripples
const sea = (name, z, top, col = SEA) => ({ name, z, trans: .15, shadow: false,
  draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); x.fillStyle = 'rgba(170,210,190,.12)';
    for (let i = 0; i < 9; i++) x.fillRect(-.2 + ((i * 37) % 40) * .01, top - .003 - i * .004 * (1 + i * .3), .03 + (i % 3) * .012, .0008); } });
// a band of fog drifting in front of things far away (transparent paper)
const fogBand = (name, z, y, h) => ({ name, z, trans: .5, shadow: false, recv: false,
  draw: x => { x.fillStyle = 'rgba(150,190,170,.09)'; for (let i = 0; i < 7; i++) { x.beginPath(); x.ellipse(-.2 + i * .07, y + (i % 2) * h * .3, .06, h * .5, 0, 0, TAU); x.fill(); } } });
// the deck in cross-section: the floor plate is the floor line, under it the black water and the thing, one eye lit
const underDeck = (name, z, col = SEAR) => ({ name, z, trans: .1, shadow: false,
  draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45); x.fillStyle = '#3a5446'; x.fillRect(-.25, -.006, .5, .006);
    x.fillStyle = '#2c4a3c'; for (let i = -12; i <= 12; i++) x.fillRect(i * .02 - .001, -.006, .002, .006); } });
const thing = (name, z, cx, by, s) => ({ name, z, trans: .05, glow: 2.6, glowCol: '#ff5b4d', w: s * 1.6, h: s * 1.2, x: cx, y: by + s * .5,
  draw: x => hulk(x, { cx: 0, by: -s * .5, s, col: '#030505', eye: '#ff5b4d', flip: true }), glowDraw: g => hulk(null, { cx: 0, by: -s * .5, s, flip: true }, g) });
// musical notes rising from the box (one sheet, scrolled up)
const notes = (name, z, cx, by, s) => ({ name, z, trans: .2, glow: 2.2, glowCol: '#ffd9a0', w: s * 3, h: s * 3, x: cx, y: by + s * 1.4,
  draw: x => { x.fillStyle = '#f2e0b8'; for (const [u, v] of [[-.6, -.6], [.5, -.2], [-.3, .3], [.7, .6], [-.8, .9]]) noteMark(x, u * s, v * s, s * .16); },
  glowDraw: g => { g.fillStyle = '#fff'; for (const [u, v] of [[-.6, -.6], [.5, -.2], [-.3, .3], [.7, .6], [-.8, .9]]) noteMark(g, u * s, v * s, s * .16); } });
function noteMark(x, cx, cy, r) { x.beginPath(); x.ellipse(cx, cy, r, r * .72, -.4, 0, TAU); x.fill(); x.fillRect(cx + r * .8, cy, r * .22, r * 3.2); x.fillRect(cx + r * .8, cy + r * 2.7, r * 1.3, r * .5); }

// The rules card's white ticker strip: the screen overlay slides the whole strip (background included), so after a second
// its right end goes black. Here the white band is fixed along the bottom of the card, full width, and only the text
// (the rule repeated, one after another) runs across it.
function tickerStrip() {
  if (typeof document === 'undefined' || document.getElementById('hh-ticker')) return;
  const st = document.createElement('style'); st.id = 'hh-ticker';
  st.textContent = `#ui .tv::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 58px; background: #fbf3e4; z-index: 0; }
#ui .tv .ticker { background: transparent !important; padding: 0 !important; height: 58px; line-height: 58px; z-index: 1; }`;
  document.head.append(st);
}

export function SHOTS(C, DUR) {
  tickerStrip();
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · 3:12 am in the ferry lounge: you large by a porthole, fog outside; on "cut out" the ceiling lamps die and the
    //     engine rumble stops. Slow push in.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'rumble', d: at('L01') + C.L01.dur * .85, v: 0.54 }, { t: 0, type: 'waves', d: 6, v: 0.36 }, { t: at('L01') + C.L01.dur * .85, type: 'click', v: 0.42 }],
      build: E => {
        const cut = E.word('L01', 11);
        return layered(E, {
          light: [.0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
          layers: [
            lounge('wall', -.115, [[-.035, .05, .016], [.045, .05, .016]]),
            lamps('lamps', -.112, .108, [-.04, .04]),
            ...youLayers('surprised', -.09, .008, .092),
            floorFront(DECK, -.087),
          ],
          glows: { lamps: [[0, 1], [cut, 1], [cut + .08, .25], [cut + .16, .7], [cut + .26, .05]], ph: [[0, .3]] },
          cam: [[0, lv(.36, .004)], [E.dur, lv(.32, -.002)]],
          focus: -.09, aper: 14, grade: { expo: 1.55 },
        });
      } },

    // 2 · The captain in the wheelhouse, radio handset at his mouth, the wheel at his side, fog in the windows. Lateral drift.
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'click', v: 0.36 }, { t: .1, type: 'static', d: C.L02.dur + .6, v: 0.21 }],
      build: E => layered(E, {
        light: [.01, .07, -.135], lightR: .09, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
        layers: [
          { name: 'house', z: -.12, trans: .05, draw: x => {
            x.fillStyle = WALL2; x.fillRect(-.25, 0, .5, .45);
            x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.07, .055, .14, .045); x.restore();
            x.fillStyle = WALL2; for (const u of [-.035, 0, .035]) x.fillRect(u - .002, .055, .004, .045);
            metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: DECK }); } },
          { name: 'wheel', z: -.1, trans: .04, draw: x => { x.fillStyle = '#1a140e'; x.fillRect(.034, 0, .008, .045);
            x.strokeStyle = '#2a1c10'; x.lineWidth = .003; x.beginPath(); x.arc(.038, .05, .016, 0, TAU); x.stroke();
            for (let i = 0; i < 8; i++) { const a = i * TAU / 8; x.beginPath(); x.moveTo(.038, .05); x.lineTo(.038 + Math.cos(a) * .021, .05 + Math.sin(a) * .021); x.stroke(); } } },
          figure('capt', -.095, CAPT, -.006, .09, 'calm'),
          { name: 'radio', z: -.093, trans: .05, glow: 1.4, glowCol: '#ff6a55', draw: x => { const s = .09, hx = -.006 + s * .1, hy = s * .7;
            x.fillStyle = '#0a0c0c'; x.fillRect(hx - .003, hy - .006, .006, .014); x.strokeStyle = '#0a0c0c'; x.lineWidth = .0012;
            x.beginPath(); x.moveTo(hx, hy - .006); x.quadraticCurveTo(hx + .01, hy - .03, hx + .02, hy - .02); x.stroke(); },
            glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(-.006 + .009, .09 * .7 + .006, .0012, 0, TAU); g.fill(); } },
          floorFront(DECK, -.091),
        ],
        flicker: ['radio'],
        cam: [[0, lv(.31, -.012)], [E.dur, lv(.29, .01)]],
        focus: -.095, aper: 14, grade: { expo: 1.55 },
      }) },

    // 3 · "From now on, nobody makes a sound.": the loudspeaker on the lounge wall, large, its grille lit while it speaks
    { id: 'S3', start: at('L03') - .15, sfx: [{ t: 0, type: 'static', d: C.L03.dur + .5, v: 0.18 }],
      build: E => layered(E, {
        light: [0, .07, -.13], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
        layers: [
          lounge('wall', -.115, [[-.05, .03, .012]]),
          { name: 'spk', z: -.105, trans: .05, glow: 2, glowCol: T.glow, draw: x => speakerBox(x, { cx: .006, cy: .045, r: .017 }), glowDraw: g => speakerBox(null, { cx: .006, cy: .045, r: .017 }, g) },
        ],
        glows: { spk: [[0, .1], [.2, 1], [E.dur - .3, 1], [E.dur, .3]] }, flicker: ['spk'],
        cam: [[0, [0, .016, .26, 0, .016, -.11]], [E.dur, [0, .016, .22, 0, .016, -.11]]],   // push in on the grille
        focus: -.105, aper: 16, grade: { expo: 1.5, vig: .18 },
      }) },

    // 4 · Snapback: across the lounge the passengers stand smiling, and one pair of shoes after another is set down on the deck
    //     at their feet, the last on "shoes". Slow lateral move.
    { id: 'S4', start: at('L04') - .05, sfx: [{ t: .05, type: 'thunder', v: 0.21 }],
      build: E => {
        const xs = [-.066, -.022, .022, .066], tt = xs.map((_, i) => E.word('L04', 5 + Math.round(i * 5 / 3)));
        return layered(E, {
          light: [0, .07, -.135], lightR: .12, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
          layers: [
            lounge('wall', -.115, [[-.044, .07, .012], [0, .07, .012], [.044, .07, .012]]),
            { name: 'ppl', z: -.1, trans: .04, draw: x => xs.forEach(cx => neighbor(x, { cx, by: 0, s: .075, lantern: false, smile: true, col: '#16261f' })),
              glow: 1.2, glowCol: '#c9a46a', glowDraw: g => xs.forEach(cx => neighbor(null, { cx, by: 0, s: .075, lantern: false, smile: true }, g)) },
            ...xs.map((cx, i) => ({ name: 'sh' + i, z: -.097, trans: .05, w: .03, h: .02, x: cx + .019, y: .004, draw: x => shoes(x, { cx: 0, by: -.004, s: .011, col: '#2a2016' }) })),
            floorFront(DECK, -.094),
          ],
          move: Object.fromEntries(xs.map((_, i) => ['sh' + i, [[0, [0, .03, 0]], [tt[i] - .25, [0, .03, 0]], [tt[i], [0, 0, 0]], [E.dur, [0, 0, 0]]]])),
          cam: [[0, lv(.42, -.01)], [E.dur, lv(.39, .01)]],
          focus: -.1, aper: 12, grade: { expo: 1.55 },
        });
      } },

    // 5 · Rule one, phones off (the screen is the overlay): you close, the phone lit; on the last "Off" it goes dark
    { id: 'S5', start: at('L05') - .2, sfx: [{ t: .1, type: 'chime', v: 0.24 }],
      build: E => {
        const off = E.word('L05', 6);
        return layered(E, {
          light: [.01, .06, -.135], lightR: .09, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
          layers: [
            lounge('wall', -.115, [[-.04, .055, .015]]),
            ...youLayers('scared', -.09, 0, .092),
            floorFront(DECK, -.087),
          ],
          glows: { ph: [[0, 1], [off, 1], [off + .08, 0]] },
          cam: [[0, lv(.31, .008)], [E.dur, lv(.28, .002)]],
          focus: -.09, aper: 15, grade: { expo: 1.55 },
        });
      } },

    // 6 · Rule two, shoes off: you on the ribbed deck in your socks, your shoes hanging from your hand
    { id: 'S6', start: at('L06') - .15, sfx: [{ t: .15, type: 'click', v: 0.18 }],
      build: E => {
        const [hx, hy] = hand(-.004, .09);
        return layered(E, {
          light: [.0, .06, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
          layers: [
            lounge('wall', -.115, [[.04, .05, .015]]),
            figure('you', -.09, { ...YOU, dark: '#4a4a44' }, -.004, .09, 'scared'),
            { name: 'hs', z: -.087, trans: .05, w: .03, h: .03, x: hx + .004, y: hy - .008, draw: x => shoes(x, { cx: 0, by: -.006, s: .012, col: '#2a2016' }) },
            floorFront(DECK, -.086),
          ],
          move: { hs: [[0, [0, 0, 0]], [E.dur * .5, [0, 0, .08]], [E.dur, [0, 0, -.05]]] },
          cam: [[0, lv(.34, -.01)], [E.dur, lv(.33, .012)]],
          focus: -.09, aper: 14, grade: { expo: 1.55 },
        });
      } },

    // 7 · Rule three, the railing (the screen goes away after 2.4 s): past the railing, in the fog, a fox sits on a channel
    //     buoy with her lantern. Push in on her on "out there".
    { id: 'S7', start: at('L07') - .2, sfx: [{ t: 0, type: 'waves', d: C.L07.dur + 1, v: 0.42 }, { t: 2.6, type: 'foghorn', v: 0.21 }],
      build: E => {
        const top = .0194;
        return layered(E, {
          light: [.02, .05, -.135], lightR: .12, lightCol: '#ffc878', key: 1.05, amb: .85, ambCol: '#7aa894', sky: { stops: FOG }, on: false,
          layers: [
            sea('sea', -.12, -.004),
            { name: 'buoy', z: -.118, trans: .1, glow: 1.5, draw: x => buoy(x, { cx: .022, by: -.004, s: .03 }), glowDraw: g => buoy(null, { cx: .022, by: -.004, s: .03, lamp: true }, g) },
            foxAt(.022, top, .03, -.117),
            fogBand('fog', -.105, .01, .02),
            { name: 'rail', z: -.08, trans: .03, shadow: false, draw: x => { railing(x, { x0: -.12, x1: .12, by: 0, h: .018, n: 11, col: '#0d1a14' });
              metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: DECK }); } },
          ],
          glows: { fox: [[0, .6], [2.4, 1]], buoy: [[0, 1]] }, flicker: ['fox'],
          move: { fog: [[0, [-.02, 0, 0]], [E.dur, [.02, 0, 0]]] },
          cam: [[0, lv(.34, 0)], [2.4, lv(.33, .006)], [E.dur, lv(.2, .02, 0, -.115)]],
          focus: [[0, -.08], [2.4, -.08], [3, -.117]], aper: 12, grade: { expo: 1.55, vig: .18 },
        });
      } },

    // 8 · 3:20 am, something big slides along the hull: the ferry from the water line, and below the surface a dark mass with
    //     one red eye glides along under it. No figure: the camera sits low so the water fills the lower half.
    { id: 'S8', start: at('L08') - .35, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'waves', d: C.L08.dur + 1, v: 0.36 }, { t: .4, type: 'creature', v: 0.3 }, { t: .3, type: 'rumble', d: 3, v: 0.36 }],
      build: E => layered(E, {
        light: [0, .09, -.14], lightR: .16, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
        layers: [
          { name: 'ferry', z: -.12, trans: .15, glow: .5, glowCol: '#cfe8d8', draw: x => ferry(x, { cx: 0, by: 0, s: .2 }), glowDraw: g => ferry(null, { cx: 0, by: 0, s: .2 }, g) },
          sea('sea', -.115, 0),
          thing('thing', -.112, 0, -.06, .06),
          fogBand('fog', -.1, .03, .025),
        ],
        glows: { thing: [[0, 0], [.6, 0], [1, 1]], ferry: [[0, .5]] },
        move: { thing: [[0, [-.1, 0, 0]], [E.dur, [.01, 0, 0]]], fog: [[0, [.02, 0, 0]], [E.dur, [-.02, 0, 0]]] },
        cam: [[0, [-.01, -.035, .42, -.01, -.035, -.12]], [E.dur, [.01, -.035, .38, .01, -.035, -.12]]],
        focus: -.115, aper: 9, grade: { expo: 1.6, vig: .18 },
      }) },

    // 9 · It stops right under your feet: the deck in cross-section, you standing on it, and under the plate the black water
    //     with the mass; its eye lights up right under you on "your". Red (allarme).
    { id: 'S9', start: at('L09') - .15, sfx: [{ t: .1, type: 'thunder', v: 0.27 }, { t: .3, type: 'creature', v: 0.24 }],
      build: E => {
        const eye = E.word('L09', 4);
        return layered(E, {
          light: [0, .06, -.135], lightR: .1, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RFOG }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#5a1e18'; x.fillRect(-.25, 0, .5, .45);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(-.045, .06, .014, 0, TAU); x.fill(); x.restore(); } },
            underDeck('under', -.11),
            thing('thing', -.105, .023, -.045, .045),
            figure('you', -.092, YOU, .002, .09, 'scared'),
            { name: 'plate', z: -.09, trans: .02, shadow: false, draw: x => { x.fillStyle = '#3a5446'; x.fillRect(-.25, -.006, .5, .0075); } },
          ],
          glows: { thing: [[0, 0], [eye - .1, 0], [eye + .1, 1]] },
          move: { thing: [[0, [-.02, 0, 0]], [eye, [0, 0, 0]], [E.dur, [0, .004, 0]]] },
          cam: [[0, lv(.36)], [E.dur, lv(.33)]],
          focus: -.092, aper: 12, grade: { expo: 1.5, vig: .18 },
        });
      } },

    // 10 · It's listening: a true close-up of your face, eyes wide, breath held. A slow creep in.
    { id: 'S10', start: at('L10') - .25, sfx: [{ t: .1, type: 'breath', v: 0.3 }],
      build: E => layered(E, {
        light: [.01, .08, -.13], lightR: .08, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
        layers: [
          lounge('wall', -.12, [[-.03, .085, .013]]),
          figure('you', -.09, YOU, 0, .09, 'scared'),
        ],
        cam: [[0, lv(.14, 0, .066, -.09)], [E.dur, lv(.12, 0, .068, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.55, vig: .18 },
      }) },

    // 11 · Two rows ahead: the mother asleep on the bench, the girl standing beside her opens a music box; its lid lights up
    //      warm on "opens". Dissolve in.
    { id: 'S11', start: at('L11') - .4, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .4 + C.L11.dur * .7, type: 'click', v: 0.3 }],
      build: E => {
        const open = E.word('L11', 7), [hx, hy] = hand(-.04, .066);
        return layered(E, {
          light: [0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
          layers: [
            lounge('wall', -.12, [[-.04, .06, .014], [.035, .06, .014]]),
            { name: 'benchB', z: -.112, trans: .05, draw: x => couch(x, { cx: .03, by: 0, w: .1, h: .045, ...BENCH }) },
            { name: 'mom', z: -.11, trans: .02, w: .12, h: .14, x: .03, y: .06, draw: x => person(x, { ...MOM, cx: 0, by: -.06, s: .062, face: 'sleeping' }) },
            { name: 'benchF', z: -.108, trans: .05, draw: x => couch(x, { cx: .03, by: 0, w: .1, h: .045, ...BENCH, front: true }) },
            figure('girl', -.1, GIRL, -.04, .066, 'smile'),
            { name: 'box', z: -.098, trans: .05, glow: 2.4, glowCol: '#ffcf8a', w: .03, h: .03, x: hx + .004, y: hy,
              draw: x => musicBox(x, { cx: 0, by: -.004, s: .014 }), glowDraw: g => musicBox(null, { cx: 0, by: -.004, s: .014 }, g) },
            floorFront(DECK, -.097),
          ],
          glows: { box: [[0, 0], [open, 0], [open + .25, 1]] }, flicker: ['box'],
          cam: [[0, lv(.38, -.006)], [E.dur, lv(.33, -.012)]],
          focus: -.1, aper: 12, grade: { expo: 1.55 },
        });
      } },

    // 12 · It starts to play: the music box large and alone, the little dancer turning, notes rising, the room red. Hard cut.
    { id: 'S12', start: at('L12') - .05, sfx: [{ t: 0, type: 'chimes', d: 7, v: 0.6 }, { t: .05, type: 'thunder', v: 0.3 }],
      build: E => layered(E, {
        light: [0, .05, -.13], lightR: .09, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RFOG }, on: false,
        layers: [
          { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#5a1e18'; x.fillRect(-.25, 0, .5, .45); x.fillStyle = '#34100c'; x.fillRect(-.25, -.45, .5, .45); x.fillStyle = '#7a2e22'; x.fillRect(-.25, -.002, .5, .002); } },
          { name: 'box', z: -.1, trans: .05, glow: 2.6, glowCol: '#ffcf8a', draw: x => musicBox(x, { cx: 0, by: 0, s: .042 }), glowDraw: g => musicBox(null, { cx: 0, by: 0, s: .042 }, g) },
          notes('notes', -.095, 0, .03, .02),
        ],
        glows: { box: [[0, 1]] }, flicker: ['box'],
        scroll: { notes: [0, .012] },
        cam: [[0, [0, .002, .12, 0, .002, -.1]], [E.dur, [0, .002, .1, 0, .002, -.1]]],
        focus: -.1, aper: 18, grade: { expo: 1.5, vig: .18 },
      }) },

    // 13 · Her mother asleep, the girl smiling at the water: closer on the two of them, a drift from the sleeping face to the
    //      girl's smile, the box glowing in her hand
    { id: 'S13', start: at('L13') - .2, sfx: [{ t: 0, type: 'chimes', d: C.L13.dur + .6, v: 0.42 }],
      build: E => {
        const [hx, hy] = hand(-.04, .066);
        return layered(E, {
          light: [0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: FOG }, on: false,
          layers: [
            lounge('wall', -.12, [[-.04, .06, .014], [.035, .06, .014]]),
            { name: 'benchB', z: -.112, trans: .05, draw: x => couch(x, { cx: .03, by: 0, w: .1, h: .045, ...BENCH }) },
            { name: 'mom', z: -.11, trans: .02, ...FACE, w: .12, h: .14, x: .03, y: .06, draw: x => person(x, { ...MOM, cx: 0, by: -.06, s: .062, face: 'sleeping' }),
              glowDraw: g => faceGlow(g, { cx: 0, by: -.06, s: .062, face: 'sleeping' }) },
            { name: 'benchF', z: -.108, trans: .05, draw: x => couch(x, { cx: .03, by: 0, w: .1, h: .045, ...BENCH, front: true }) },
            figure('girl', -.1, GIRL, -.04, .066, 'smile'),
            { name: 'box', z: -.098, trans: .05, glow: 2.4, glowCol: '#ffcf8a', w: .03, h: .03, x: hx + .004, y: hy,
              draw: x => musicBox(x, { cx: 0, by: -.004, s: .014 }), glowDraw: g => musicBox(null, { cx: 0, by: -.004, s: .014 }, g) },
            floorFront(DECK, -.097),
          ],
          glows: { box: [[0, 1]] }, flicker: ['box'],
          cam: [[0, lv(.25, .03)], [E.dur, lv(.24, -.035)]],
          focus: -.105, aper: 14, grade: { expo: 1.55 },
        });
      } },

    // 14 · Under the floor, it turns toward the music: the cross-section again, wide: you small on the left, the girl and the
    //      glowing box on the right, and under the plate the eye slides from under you toward her. Red.
    { id: 'S14', start: at('L14') - .1, sfx: [{ t: .1, type: 'creature', v: 0.3 }, { t: .2, type: 'rumble', d: 3, v: 0.42 }, { t: 0, type: 'chimes', d: C.L14.dur + .6, v: 0.3 }],
      build: E => {
        const [hx, hy] = hand(.05, .06);
        return layered(E, {
          light: [0, .06, -.135], lightR: .12, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RFOG }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#5a1e18'; x.fillRect(-.25, 0, .5, .45); } },
            underDeck('under', -.11),
            thing('thing', -.105, -.027, -.045, .045),
            figure('you', -.093, YOU, -.05, .07, 'scared'),
            figure('girl', -.093, GIRL, .05, .06, 'smile'),
            { name: 'box', z: -.091, trans: .05, glow: 2.4, glowCol: '#ffcf8a', w: .03, h: .03, x: hx + .004, y: hy,
              draw: x => musicBox(x, { cx: 0, by: -.004, s: .013 }), glowDraw: g => musicBox(null, { cx: 0, by: -.004, s: .013 }, g) },
            { name: 'plate', z: -.09, trans: .02, shadow: false, draw: x => { x.fillStyle = '#3a5446'; x.fillRect(-.25, -.006, .5, .0075); } },
          ],
          glows: { thing: [[0, 1]], box: [[0, 1]] }, flicker: ['box'],
          move: { thing: [[0, [0, 0, 0]], [.4, [0, 0, 0]], [E.dur, [.09, 0, 0]]] },
          cam: [[0, lv(.42)], [E.dur, lv(.4)]],
          focus: -.093, aper: 10, grade: { expo: 1.5, vig: .18 },
        });
      } },

    // 15 · The dilemma in one picture: you in the middle, the girl with the box across the deck on the left, the railing and
    //      the fog on the right. Push in on you.
    { id: 'S15', start: at('L15') - .2, sfx: [{ t: 0, type: 'chimes', d: C.L15.dur + .5, v: 0.27 }, { t: 0, type: 'waves', d: C.L15.dur + .5, v: 0.3 }],
      build: E => {
        const [hx, hy] = hand(-.06, .05);
        return layered(E, {
          light: [0, .06, -.135], lightR: .12, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RFOG }, on: false,
          layers: [
            { name: 'wall', z: -.12, trans: .05, draw: x => { x.fillStyle = '#5a1e18'; x.fillRect(-.25, 0, .25 + .03, .45);
              metalDeck(x, { x0: -.25, x1: .25, y0: -.45, y1: 0, col: '#3a120e' }); } },
            figure('girl', -.115, GIRL, -.06, .05, 'smile'),
            { name: 'box', z: -.113, trans: .05, glow: 2.4, glowCol: '#ffcf8a', w: .03, h: .03, x: hx + .004, y: hy,
              draw: x => musicBox(x, { cx: 0, by: -.004, s: .011 }), glowDraw: g => musicBox(null, { cx: 0, by: -.004, s: .011 }, g) },
            { name: 'rail', z: -.1, trans: .03, shadow: false, draw: x => railing(x, { x0: .04, x1: .12, by: 0, h: .02, n: 6, col: '#0a0303' }) },
            figure('you', -.09, YOU, 0, .085, 'scared'),
            floorFront('#3a120e', -.087),
          ],
          glows: { box: [[0, 1]] }, flicker: ['box'],
          cam: [[0, lv(.4)], [E.dur, lv(.34)]],
          focus: [[0, -.1], [E.dur * .5, -.09]], aper: 12, grade: { expo: 1.5, vig: .18 },
        });
      } },

    // 16 · The end, held under the choice: the ferry still in the fog, and close in front the fox on her buoy, lantern lit,
    //      watching it. The camera at the buoy top so her paws sit on it.
    { id: 'S16', start: at('L16') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L16') + .5, v: 0.36 }, { t: .8, type: 'foghorn', v: 0.24 }],
      build: E => {
        const top = -.03 + .045 * .78;
        return layered(E, {
          light: [.02, .06, -.14], lightR: .14, lightCol: '#ffc878', key: 1.05, amb: .85, ambCol: '#7aa894', sky: { stops: FOG }, on: false,
          layers: [
            { name: 'ferry', z: -.125, trans: .15, glow: .5, glowCol: '#cfe8d8', draw: x => ferry(x, { cx: -.03, by: -.01, s: .16 }), glowDraw: g => ferry(null, { cx: -.03, by: -.01, s: .16 }, g) },
            sea('sea', -.12, -.01),
            fogBand('fog', -.11, .0, .02),
            { name: 'buoy', z: -.096, trans: .1, glow: 1.5, draw: x => buoy(x, { cx: .03, by: -.03, s: .045 }), glowDraw: g => buoy(null, { cx: .03, by: -.03, s: .045, lamp: true }, g) },
            foxAt(.03, top, .04, -.095, 'watch', true),
            { name: 'water', z: -.092, trans: .1, shadow: false, draw: x => { x.fillStyle = SEA; x.fillRect(-.25, -.45, .5, .45 - .03 + .002); } },
          ],
          glows: { fox: [[0, 1]], buoy: [[0, 1]], ferry: [[0, .4]] }, flicker: ['fox'],
          move: { fog: [[0, [-.015, 0, 0]], [E.dur, [.015, 0, 0]]] },
          cam: [[0, lv(.3, .0, top, -.1)], [E.dur, lv(.26, .012, top, -.1)]],
          focus: -.095, aper: 10, grade: { expo: 1.5, vig: .18 },
        });
      } },
  ];
}
