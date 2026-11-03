// Lamp Room · Night 1/7 (Le regole dell'emergenza) — shot list. You keep the last lighthouse on the coast; the boat home
// comes in seven days. At 1:52 am the coast guard radio on the desk crackles on by itself and reads three rules; under the
// desk its plug hangs loose: it has been unplugged since the day you arrived. Rule one, the lamp (the great lens, turning);
// rule two, the bottom door at the foot of the stairs; rule three, look up first. Good news: seven cans of oil. Bad news:
// the bolt is rusted through. At 2:40 three slow knocks shake the bottom door; the light under it shows two feet; a voice:
// "Keeper, your lamp's gone out!". You look up: the lamp is turning, the beam sweeps bright over the sea. Down below the
// bolt bends. On the rocks a small lantern blinks (the fox). The dilemma: you on the landing between the red door below
// and the warm lamp above. The end holds the lighthouse and the fox under the choice.
// Themes: regole/notte, the lamp is the only warm light; regole/allarme for the door moments (S11, S14, S16).
// Rules kept from pipeline/MIGLIORARE.md:
// - first frame already full: you large in the lamp room (about a third of the height), the lens lit, no fade from black;
// - the lower frame is never an empty band: plank floor, the sea, the rocks;
// - level camera at the floor in every shot with a figure (lv()), a floor strip in front of the feet;
// - a face close-up in the scary line (S12), the key objects large on their own (the radio S3, the plug S4, the bolt S9/S14);
// - the choice on screen at the end (script.choice) and "NIGHT 2" (script.next).
import { layered } from './engine/kit/shot.js';
import { person, foxCameo, lighthouse, cliffRich, boat, lensLamp, wallClock, barrel, doorLeaf, doorFrame, radioSet, socket, doorBolt } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { ss, seg, clamp } from './engine/lib.js';

const T = theme('regole', 'notte'), A = theme('regole', 'allarme');
const TAU = Math.PI * 2;
const YOU = { coat: '#d9a43a', pants: '#1d2a26', hat: '#1a2a24' };      // you: the mustard oilskin, the one strong colour
const NIGHT = [[0, '#0e1e1a'], [.45, '#1f3c34'], [.8, '#3a6456'], [1, '#55806c']];
const RED = [[0, '#2a0e0c'], [.35, '#5a1c16'], [.6, '#8a3424'], [1, '#b0503a']];
const WALL = '#2a4c3e', WALL2 = '#244236', FLOOR = '#203a30', SEA = '#1d3a32', ROCK = '#16302a';
const RWALL = '#5a1e18', RFLOOR = '#34100c';
const WARM = '#ffcf8a';
const MOON = { x: -.06, y: .14, r: .016, gain: 1.4, halo: 3.6, haloGain: .26 };

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
const floorFront = (col, z, top = .0015) => ({ name: 'floor', z, trans: .02, shadow: false, draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); } });
const ramp = (t, a, b) => ss(clamp((t - a) / (b - a)));
// plank floor below the floor line
const planks = (x, col) => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45);
  x.fillStyle = 'rgba(0,0,0,.24)'; for (let i = 1; i < 16; i++) x.fillRect(-.25, -Math.pow(i / 16, 1.5) * .45, .5, .0012);
  x.fillStyle = 'rgba(255,240,210,.05)'; x.fillRect(-.25, -.004, .5, .004); };
// a stone room: wall above the floor line with optional holes (windows onto the sky), planks below
const room = (name, z, holes = [], o = {}) => ({ name, z, trans: .05,
  draw: x => {
    x.fillStyle = o.wall || WALL; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.14)'; for (let r = 0; r < 14; r++) for (let c = -6; c < 6; c++) x.fillRect(c * .04 + (r % 2) * .02, r * .022, .038, .0012);   // stone courses
    for (const [hx, hy, hw, hh] of holes) {
      x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(hx - hw / 2, hy - hh / 2, hw, hh); x.restore();
      x.fillStyle = o.wall || WALL; x.fillRect(hx - .0015, hy - hh / 2, .003, hh); x.fillRect(hx - hw / 2, hy - .0015, hw, .003);   // glazing bars
    }
    planks(x, o.floor || FLOOR);
  } });
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
// the great lens on its pedestal, standing on the floor line
const lens = (name, z, cx, s) => ({ name, z, trans: .08, glow: 2.6, glowCol: WARM,
  draw: x => lensLamp(x, { cx, by: 0, s }), glowDraw: g => lensLamp(null, { cx, by: 0, s }, g) });
const lensMid = s => s * (.3 + 3.5 * .085);   // height of the bright middle ring above the floor
// the fox sitting on a rock with her lantern: paws on y = by
const foxAt = (cx, by, s, z, flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose: 'watch', flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose: 'watch', flip }, g) });
// the sea from the shore: flat water below y = top, a few pale ripples
const sea = (name, z, top, col = SEA) => ({ name, z, trans: .15, shadow: false,
  draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); x.fillStyle = 'rgba(190,230,210,.12)';
    for (let i = 0; i < 10; i++) x.fillRect(-.2 + ((i * 37) % 40) * .01, top - .003 - i * .004 * (1 + i * .3), .03 + (i % 3) * .012, .0008); } });
// a low shore rock with a flat top at y = top
const shoreRock = (x, cx, top, w, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx - w * .7, -.45);
  x.lineTo(cx - w * .62, top - w * .25); x.lineTo(cx - w * .45, top - .002); x.lineTo(cx + w * .4, top); x.lineTo(cx + w * .58, top - w * .2); x.lineTo(cx + w * .72, -.45); x.closePath(); x.fill(); };
// the bottom door: frame and leaf in the stone wall, light leaking under it; feet = two dark gaps in that light
const bottomDoor = (name, z, cx, w, h, o = {}) => ({ name, z, trans: .05, glow: 2, glowCol: o.under || '#cfe8ff',
  draw: x => { x.fillStyle = o.wall || WALL2; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.14)'; for (let r = 0; r < 14; r++) for (let c = -6; c < 6; c++) x.fillRect(c * .04 + (r % 2) * .02, r * .022, .038, .0012);
    doorFrame(x, { cx, by: 0, w, h, col: '#141a16' });
    doorLeaf(x, { cx, by: 0, w, h, col: o.leaf || '#3a2a1c', panel: '#2a1c12', win: false, underCol: '#9ab' });
    if (o.bolt !== undefined) doorBolt(x, { cx: cx - w * .12, cy: h * .52, s: w * .3, bend: o.bolt });
    planks(x, o.floor || FLOOR);
    if (o.feet) { x.fillStyle = '#050605'; for (const d of [-1, 1]) x.fillRect(cx + d * w * .16 - w * .07, 0, w * .14, h * .025); } },
  glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(cx - w / 2, 0, w, h * .025);
    if (o.feet) { g.fillStyle = '#000'; for (const d of [-1, 1]) g.fillRect(cx + d * w * .16 - w * .07, 0, w * .14, h * .025); } } });
const sweep = (speed = .55, amp = .7, base = Math.PI * .92) => t => base + Math.sin(t * speed) * amp;

// Screen fixes for this film (the Ufficio's "Rifai" notes): the notifications (line.card) sit lower, clear of the series
// tag, the clock and the resources bar at the top left; the TV stays up between one rule and the next. The white ticker
// strip with the three rules lives inside the TV box, along its bottom edge, and shows only while the radio reads the
// rules (it follows the TV: it fades in and out with it, and is gone for the rest of the film). While it is up it scrolls
// at one constant speed, looping seamlessly with the film time (it never stops or jumps back between one rule and the
// next). It is drawn over the TV's own ticker, which is hidden, so there is only one. Styles are injected once from here;
// every shot's update() drives the strip with the film time.
const CRAWL = 'COAST GUARD · CHANNEL 16 · RULE 1: THE LAMP NEVER GOES OUT · RULE 2: THE BOTTOM DOOR STAYS SHUT UNTIL SUNRISE · RULE 3: IF SOMEONE KNOCKS, LOOK UP FIRST · KEEP THE OIL CLOSE · WHATEVER YOU HEAR · ';
if (typeof document !== 'undefined' && !document.getElementById('lamp-room-ui')) {
  const st = document.createElement('style'); st.id = 'lamp-room-ui';
  st.textContent = '#card { top: 440px !important; }'
    + ' #ui .tv .ticker { display: none !important; }'
    + ' #ui.rules-on .tv { opacity: 1 !important; }'
    + ' #ui #lamp-crawl { position: absolute; left: 84px; width: 912px; bottom: 1006px; opacity: 0; overflow: hidden; padding: 10px 0;'
    + ' background: #fbf3e4; color: #12080a; font-family: Anton; font-size: 30px; letter-spacing: .02em; white-space: nowrap; }'
    + ' #ui #lamp-crawl .run { display: inline-block; will-change: transform; }'
    + ' #ui #lamp-crawl .run span { display: inline-block; }';
  document.head.append(st);
}
const crawlSpeed = 150;   // px per second, constant for the whole film
const crawl = g => {
  const ui = document.getElementById('ui'); if (!ui) return;
  let el = document.getElementById('lamp-crawl');
  if (!el) {
    el = document.createElement('div'); el.id = 'lamp-crawl';
    el.innerHTML = `<div class="run">${Array.from({ length: 6 }, () => `<span>${CRAWL.replace(/ /g, '&nbsp;')}</span>`).join('')}</div>`;
    ui.append(el);
  }
  // only while the TV with the rules is up: same opacity as the TV (forced to 1 between one rule and the next)
  const tv = ui.querySelector('.tv');
  el.style.opacity = ui.classList.contains('rules-on') ? 1 : (parseFloat(tv?.style.opacity) || 0);
  const run = el.firstChild, w = run.firstChild.offsetWidth || 3600;   // one copy: the loop length
  run.style.transform = `translateX(${(-((Math.max(0, g) * crawlSpeed) % w)).toFixed(1)}px)`;
};
const rulesUI = (C) => {
  const a = C.L04.at - .1, b = C.L07.at - .05;
  return start => t => {
    const ui = typeof document !== 'undefined' && document.getElementById('ui'); if (!ui) return;
    const g = start + t;
    ui.classList.toggle('rules-on', g > a + .25 && g < b - .3);
  };
};
// every shot also drives the strip, with the film time (shot start + shot time)
const withCrawl = shot => ({ ...shot, build: async E => {
  const s = await shot.build(E), up = s.update?.bind(s);
  return Object.assign(s, { update(t) { const r = up?.(t); if (typeof document !== 'undefined') crawl(shot.start + t); return r; } });
} });

export function SHOTS(C, DUR) {
  const at = id => C[id].at;
  const rules = rulesUI(C);
  return [
    // 1 · The hook, already lit: you in the lamp room, the great lens burning behind you, the night sea and the moon in the
    //     panes. The beam swings across. Slow push in.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'waves', d: 6, v: 0.36 }, { t: 0, type: 'wind', d: 6, v: 0.24 }],
      build: E => layered(E, {
        light: [.04, .07, -.135], lightR: .12, lightCol: '#ffd9a0', key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT, stars: 120 }, moon: MOON, on: false,
        layers: [
          room('wall', -.115, [[-.06, .09, .07, .09], [.06, .09, .07, .09]]),
          lens('lens', -.1, .045, .12),
          figure('you', -.09, YOU, -.03, .092, 'calm'),
          floorFront(FLOOR, -.087),
        ],
        glows: { lens: [[0, 1]] }, flicker: ['lens'],
        beams: [{ x: .045, y: lensMid(.12), z: -.099, len: .4, width: .05, rot: sweep(.7, .8, Math.PI * .5), k: .45 }],
        cam: [[0, lv(.37, .006)], [E.dur, lv(.32, 0)]],
        focus: -.09, aper: 14, grade: { expo: 1.5 },
      }) },

    // 2 · "…and the boat home comes in seven days": the lighthouse on its rock from the sea, the beam sweeping, and far out
    //     the supply boat slipping away towards the horizon.
    { id: 'S2', start: at('L01') + C.L01.dur * .6, sfx: [{ t: 0, type: 'waves', d: 4, v: 0.42 }],
      build: E => layered(E, {
        light: [.08, .16, -.13], lightR: .24, lightCol: '#ffd9a0', key: 1.05, amb: .8, ambCol: '#9ab8aa', sky: { stops: NIGHT, stars: 160 }, moon: MOON, on: false,
        layers: [
          sea('far', -.12, -.02, '#2c5446'),
          { name: 'boat', z: -.115, trans: .4, w: .08, h: .06, x: -.05, y: -.01, draw: x => { x.fillStyle = '#163028'; boat(x, { cx: 0, by: -.01, s: .03 }); } },
          { name: 'cliff', z: -.075, trans: .2, glow: 2.8, glowCol: WARM, draw: x => { x.fillStyle = ROCK; cliffRich(x, { x0: -.02, x1: .25, base: -.14, top: .02, side: 1, strata: '#24443a' }); lighthouse(x, { cx: .1, by: .018, h: .2, col: ROCK }); },
            glowDraw: g => lighthouse(null, { cx: .1, by: .018, h: .2, cottageLit: true }, g) },
          sea('near', -.05, -.1, '#24463c'),
        ],
        glows: { cliff: [[0, 1]] }, flicker: ['cliff'],
        move: { boat: [[0, [0, 0, 0]], [E.dur, [-.035, 0, 0]]] },
        beams: [{ x: .1, y: .175, z: -.074, len: .42, width: .07, rot: sweep(.6, .7), k: .55 }],
        cam: [[0, [.03, .06, .5, .04, .07, -.07]], [E.dur, [.02, .05, .56, .03, .06, -.07]]],
        focus: -.075, aper: 14, grade: { expo: 1.5, vig: .2 },
      }) },

    // 3 · 1:52 am: the coast guard radio on the desk crackles on by itself, its dial lit green; the clock above says 1:52.
    { id: 'S3', start: at('L02') - .15, sfx: [{ t: .05, type: 'static', d: C.L02.dur + .4, v: 0.24 }, { t: .05, type: 'click', v: 0.3 }],
      build: E => layered(E, {
        light: [0, .07, -.13], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
        layers: [
          room('wall', -.115, [[-.06, .07, .04, .05]]),
          { name: 'clock', z: -.112, trans: .05, glow: 1, glowCol: '#e9d6ae', draw: x => wallClock(x, { cx: .03, cy: .072, r: .014, h: 1, m: 52 }), glowDraw: g => wallClock(null, { cx: .03, cy: .072, r: .014 }, g) },
          { name: 'desk', z: -.105, trans: .04, draw: x => { x.fillStyle = '#2a1e14'; x.fillRect(-.06, .03, .12, .006); x.fillRect(-.055, 0, .006, .03); x.fillRect(.049, 0, .006, .03); } },
          { name: 'radio', z: -.103, trans: .05, glow: 2.2, glowCol: T.glow, draw: x => radioSet(x, { cx: 0, by: .036, s: .05 }), glowDraw: g => radioSet(null, { cx: 0, by: .036, s: .05 }, g) },
        ],
        glows: { radio: [[0, 0], [.25, 0], [.35, 1], [.45, .3], [.6, 1]] }, flicker: ['radio'],
        cam: [[0, [0, .045, .3, 0, .045, -.105]], [E.dur, [0, .048, .24, 0, .048, -.105]]],
        focus: -.104, aper: 16, grade: { expo: 1.5, vig: .2 },
      }) },

    // 4 · Snapback, "unplugged": under the desk, large, the power cord hangs down and the plug swings loose over the floor,
    //     the wall socket empty beside it. The radio's light still glows at the top. Hard cut.
    { id: 'S4', start: at('L03') - .1, sfx: [{ t: 0, type: 'static', d: C.L03.dur + .6, v: 0.15 }, { t: .05, type: 'thunder', v: 0.21 }],
      build: E => {
        const un = E.word('L03', 4);
        return layered(E, {
        update: rules(at('L03') - .1),
          light: [0, .06, -.13], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
          layers: [
            room('wall', -.115),
            { name: 'sock', z: -.113, trans: .05, draw: x => socket(x, { cx: .028, cy: .016, s: .012 }) },
            { name: 'desk', z: -.105, trans: .04, draw: x => { x.fillStyle = '#2a1e14'; x.fillRect(-.06, .05, .12, .008); x.fillRect(-.055, 0, .008, .05); } },
            { name: 'radio', z: -.104, trans: .05, draw: x => radioSet(x, { cx: -.022, by: .058, s: .05 }) },
            { name: 'cord', z: -.103, trans: .05, w: .1, h: .1, x: .0, y: .05,
              draw: x => radioSet(x, { cx: -.022, by: 0, s: .05, cord: .042, swing: 0, box: false }) },
            { name: 'lamp', z: -.102, trans: .1, glow: 2.4, glowCol: T.glow, w: .03, h: .02, x: .0, y: .06, draw: x => { x.fillStyle = '#0a0c0c'; x.fillRect(-.006, -.003, .012, .006); },
              glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .0025, 0, TAU); g.fill(); } },
            floorFront(FLOOR, -.1, -.0005),
          ],
          glows: { lamp: [[0, 1]] }, flicker: ['lamp'],
          move: { cord: [[0, [0, 0, 0]], [un, [0, 0, 0]], [un + .3, [0, 0, .12]], [un + .8, [0, 0, -.08]], [un + 1.4, [0, 0, .04]], [E.dur, [0, 0, 0]]] },
          cam: [[0, [.005, .025, .2, .005, .025, -.105]], [un, [.005, .025, .17, .005, .025, -.105]], [E.dur, [.005, .025, .15, .005, .025, -.105]]],
          focus: -.103, aper: 16, grade: { expo: 1.55, vig: .2 },
        });
      } },

    // 5 · Rule one, the lamp never goes out (the screen is the overlay): the great lens alone, turning, its beam sweeping
    { id: 'S5', start: at('L04') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .1, type: 'chime', v: 0.21 }, { t: 0, type: 'static', d: C.L04.dur + .3, v: 0.12 }],
      build: E => layered(E, {
        update: rules(at('L04') - .3),
        light: [0, .07, -.135], lightR: .12, lightCol: '#ffd9a0', key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT, stars: 100 }, on: false,
        layers: [
          room('wall', -.115, [[-.06, .07, .06, .1], [.06, .07, .06, .1]]),
          lens('lens', -.1, 0, .15),
          floorFront(FLOOR, -.097),
        ],
        glows: { lens: [[0, 1]] }, flicker: ['lens'],
        beams: [{ x: 0, y: lensMid(.15), z: -.099, len: .42, width: .06, rot: t => Math.PI * .5 + Math.sin(t * .9) * 1.2, k: .5 }],
        cam: [[0, lv(.34, 0, .02)], [E.dur, lv(.3, 0, .025)]],
        focus: -.1, aper: 14, grade: { expo: 1.5 },
      }) },

    // 6 · Rule two, the bottom door stays shut: the foot of the tower, the heavy door, cold light under it
    { id: 'S6', start: at('L05') - .15, sfx: [{ t: .15, type: 'wind', d: C.L05.dur + .4, v: 0.3 }],
      build: E => layered(E, {
        update: rules(at('L05') - .15),
        light: [0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
        layers: [ bottomDoor('door', -.11, 0, .05, .085, { bolt: 0 }) ],
        glows: { door: [[0, .7]] },
        cam: [[0, lv(.34, -.01, .0)], [E.dur, lv(.3, .005, .0)]],
        focus: -.11, aper: 14, grade: { expo: 1.55 },
      }) },

    // 7 · Rule three, look up first: you at the desk by the radio, scared; on "look up" the camera pushes in on you
    { id: 'S7', start: at('L06') - .15, sfx: [{ t: 0, type: 'static', d: C.L06.dur + .3, v: 0.12 }],
      build: E => {
        const look = E.word('L06', 11);
        return layered(E, {
        update: rules(at('L06') - .15),
          light: [.0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
          layers: [
            room('wall', -.115, [[.05, .08, .04, .05]]),
            { name: 'desk', z: -.1, trans: .04, draw: x => { x.fillStyle = '#2a1e14'; x.fillRect(-.09, .03, .07, .005); x.fillRect(-.087, 0, .005, .03); x.fillRect(-.028, 0, .005, .03); } },
            { name: 'radio', z: -.098, trans: .05, glow: 2.2, glowCol: T.glow, draw: x => radioSet(x, { cx: -.055, by: .035, s: .04 }), glowDraw: g => radioSet(null, { cx: -.055, by: .035, s: .04 }, g) },
            figure('you', -.09, YOU, .02, .092, 'scared'),
            floorFront(FLOOR, -.087),
          ],
          glows: { radio: [[0, 1]] }, flicker: ['radio'],
          cam: [[0, lv(.38, -.01)], [look, lv(.36, 0)], [E.dur, lv(.27, .015)]],
          focus: -.09, aper: 14, grade: { expo: 1.5 },
        });
      } },

    // 8 · Good news: seven cans of oil lined up on the floor of the store room, you beside them. Dissolve, warm.
    { id: 'S8', start: at('L07') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'chime', v: 0.27 }],
      build: E => {
        const xs = [-.075, -.05, -.025, 0, .025, .05, .075];
        return layered(E, {
        update: rules(at('L07') - .2),
          light: [0, .07, -.135], lightR: .12, lightCol: '#ffd9a0', key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
          layers: [
            room('wall', -.115, [[0, .095, .04, .04]]),
            { name: 'cans', z: -.1, trans: .04, glow: .8, glowCol: WARM, draw: x => xs.forEach(cx => barrel(x, { cx, by: 0, w: .02, h: .03, col: '#6a4a24', band: '#2a1c10' })),
              glowDraw: g => { g.fillStyle = 'rgba(255,255,255,.5)'; xs.forEach(cx => g.fillRect(cx - .006, .01, .012, .012)); } },
            figure('you', -.092, YOU, .1, .08, 'calm'),
            floorFront(FLOOR, -.089),
          ],
          glows: { cans: [[0, .3], [.6, 1]] },
          cam: [[0, lv(.44, .01)], [E.dur, lv(.4, .02)]],
          focus: -.1, aper: 12, grade: { expo: 1.5 },
        });
      } },

    // 9 · Bad news: the bolt on the bottom door, large, rust eating the bar. Hard cut.
    { id: 'S9', start: at('L08') - .15, sfx: [{ t: .1, type: 'door-metal', v: 0.24 }],
      build: E => layered(E, {
        update: rules(at('L08') - .15),
        light: [0, .07, -.13], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
        layers: [ bottomDoor('door', -.11, 0, .05, .085, { bolt: 0 }) ],
        glows: { door: [[0, .7]] },
        cam: [[0, [-.006, .044, .17, -.006, .044, -.11]], [E.dur, [-.006, .044, .14, -.006, .044, -.11]]],
        focus: -.11, aper: 18, grade: { expo: 1.55, vig: .2 },
      }) },

    // 10 · 2:40 am, three slow knocks: the bottom door again, wider; after the line, in the silence, it shakes three times
    //      and a dust of light jumps under it. Dissolve.
    { id: 'S10', start: at('L09') - .3, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: .3 + C.L09.dur + .1, type: 'knock', v: 0.6 }, { t: .3 + C.L09.dur + .45, type: 'knock', v: 0.6 }, { t: .3 + C.L09.dur + .8, type: 'knock', v: 0.6 }],
      build: E => {
        const k0 = .3 + C.L09.dur + .1, kn = [k0, k0 + .35, k0 + .7];
        const shake = []; for (const k of kn) shake.push([k - .02, [0, 0, 0]], [k, [.0012, 0, 0]], [k + .08, [-.0006, 0, 0]], [k + .16, [0, 0, 0]]);
        return layered(E, {
          light: [0, .07, -.135], lightR: .1, lightCol: T.light, key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
          layers: [ bottomDoor('door', -.11, 0, .05, .085, { bolt: 0, feet: true }) ],
          glows: { door: [[0, .7], ...kn.flatMap(k => [[k, 1], [k + .15, .7]])] },
          move: { door: [[0, [0, 0, 0]], ...shake, [E.dur, [0, 0, 0]]] },
          cam: [[0, lv(.38, 0)], [E.dur, lv(.32, 0)]],
          focus: -.11, aper: 14, grade: { expo: 1.55 },
        });
      } },

    // 11 · "Keeper! Your lamp's gone out!": the door in red, close, the two feet in the light under it, the leaf rattling.
    { id: 'S11', start: at('L10') - .1, sfx: [{ t: 0, type: 'door-creak', v: 0.3 }, { t: .1, type: 'wind', d: C.L10.dur + .6, v: 0.3 }],
      build: E => {
        const rat = []; for (let t = 0; t < E.dur; t += .23) rat.push([t, [((t * 7) % 2 > 1 ? 1 : -1) * .0005, 0, 0]]);
        return layered(E, {
          light: [0, .06, -.135], lightR: .1, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RED }, on: false,
          layers: [ bottomDoor('door', -.11, 0, .05, .085, { bolt: 0, feet: true, wall: RWALL, floor: RFLOOR, leaf: '#4a1c14', under: '#ffb08a' }) ],
          glows: { door: [[0, 1]] },
          move: { door: rat.length ? rat : [[0, [0, 0, 0]]] },
          cam: [[0, lv(.26, 0, .0)], [E.dur, lv(.22, 0, .0)]],
          focus: -.11, aper: 14, grade: { expo: 1.5, vig: .2 },
        });
      } },

    // 12 · You look up: a true close-up of your face, eyes wide, the warm light of the lamp falling from above
    { id: 'S12', start: at('L11') - .3, sfx: [{ t: .1, type: 'breath', v: 0.3 }],
      build: E => layered(E, {
        light: [.0, .12, -.13], lightR: .08, lightCol: '#ffd9a0', key: 1.05, amb: .85, ambCol: '#9ab8aa', sky: { stops: NIGHT }, on: false,
        layers: [
          room('wall', -.12, [[-.03, .095, .03, .03]]),
          figure('you', -.09, YOU, 0, .09, 'surprised'),
        ],
        cam: [[0, lv(.14, 0, .066, -.09)], [E.dur, lv(.12, 0, .07, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.55, vig: .18 },
      }) },

    // 13 · "…the lamp is turning, bright as ever": from the foot of the tower, looking up, the lamp room burning and the beam
    //      sweeping over the sea; on "bright" the beam flares.
    { id: 'S13', start: at('L12') - .05, sfx: [{ t: 0, type: 'thunder', v: 0.24 }, { t: .1, type: 'wind', d: C.L12.dur + .8, v: 0.3 }],
      build: E => {
        const br = E.word('L12', 6);
        return layered(E, {
          light: [0, .16, -.13], lightR: .2, lightCol: '#ffd9a0', key: 1.05, amb: .8, ambCol: '#9ab8aa', sky: { stops: NIGHT, stars: 120 }, moon: { ...MOON, x: -.08, y: .2 }, on: false,
          layers: [
            { name: 'tower', z: -.08, trans: .15, glow: 3, glowCol: WARM, draw: x => lighthouse(x, { cx: 0, by: -.22, h: .44, col: ROCK, cottage: false, footing: 0 }),
              glowDraw: g => lighthouse(null, { cx: 0, by: -.22, h: .44, cottage: false }, g) },
            { name: 'rocks', z: -.06, trans: .1, draw: x => { shoreRock(x, -.06, -.12, .12, '#1a3830'); shoreRock(x, .08, -.14, .14, '#14302a'); } },
          ],
          glows: { tower: [[0, .85], [br - .05, .85], [br + .1, 1]] }, flicker: ['tower'],
          beams: [{ x: 0, y: .165, z: -.079, len: .45, width: .08, rot: sweep(.9, .9, Math.PI * .5), k: t => .6 + .5 * Math.exp(-Math.max(0, t - br) * 2) * (t > br ? 1 : 0) }],
          cam: [[0, [0, .0, .5, 0, .09, -.08]], [E.dur, [0, .01, .46, 0, .1, -.08]]],
          focus: -.08, aper: 12, grade: { expo: 1.5 },
        });
      } },

    // 14 · Down below, the rusted bolt starts to bend: the bolt close, red, bowing out of its staples on "bend"
    { id: 'S14', start: at('L13') - .15, sfx: [{ t: .1, type: 'door-metal', v: 0.3 }, { t: .3, type: 'creature', v: 0.18 }],
      build: E => {
        const bd = E.word('L13', 7);
        return layered(E, {
          light: [0, .06, -.13], lightR: .1, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RED }, on: false,
          layers: [
            bottomDoor('door', -.11, 0, .05, .085, { feet: true, wall: RWALL, floor: RFLOOR, leaf: '#4a1c14', under: '#ffb08a' }),
            { name: 'bolt', z: -.108, trans: .05, w: .04, h: .03, x: -.006, y: .0442, draw: x => doorBolt(x, { cx: 0, cy: 0, s: .015, bend: 0 }) },
            { name: 'bolt2', z: -.107, trans: .05, w: .04, h: .03, x: -.006, y: .0442, draw: x => doorBolt(x, { cx: 0, cy: 0, s: .015, bend: .8, col: '#5a4038' }) },
          ],
          glows: { door: [[0, 1]] },
          update: (t, L) => { const k = ramp(t, bd - .2, bd + .3); L.bolt.visible = k < .5; L.bolt2.visible = k >= .5;
            L.door.position.x = L.door.userData.p0.x + (t > bd - .2 && t < bd + .6 ? Math.sin(t * 60) * .0004 : 0); },
          cam: [[0, [-.006, .044, .17, -.006, .044, -.11]], [E.dur, [-.006, .044, .13, -.006, .044, -.11]]],
          focus: -.108, aper: 18, grade: { expo: 1.5, vig: .2 },
        });
      } },

    // 15 · On the rocks a small lantern blinks: the fox sitting on a shore rock with her lantern, the sea behind, the lighthouse
    //      far on the headland. Her lantern blinks like a signal. Dissolve in.
    { id: 'S15', start: at('L14') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'waves', d: C.L14.dur + .8, v: 0.42 }],
      build: E => {
        const top = -.012, lt = E.word('L14', 7);
        const blink = [[0, .5]]; for (let t = lt; t < E.dur; t += .9) blink.push([t, 1], [t + .35, 1], [t + .45, .25], [t + .8, .25]);
        return layered(E, {
          light: [.02, .06, -.14], lightR: .14, lightCol: '#ffc878', key: 1.05, amb: .85, ambCol: '#7aa894', sky: { stops: NIGHT, stars: 140 }, moon: MOON, on: false,
          layers: [
            sea('far', -.125, .0, '#2c5446'),
            { name: 'lh', z: -.12, trans: .3, glow: 2.4, glowCol: WARM, draw: x => { x.fillStyle = ROCK; cliffRich(x, { x0: .02, x1: .25, base: -.06, top: .002, side: 1, strata: '#24443a' }); lighthouse(x, { cx: .1, by: .0, h: .1, col: ROCK, footing: .01 }); },
              glowDraw: g => lighthouse(null, { cx: .1, by: .0, h: .1 }, g) },
            { name: 'rock', z: -.097, trans: .1, draw: x => { shoreRock(x, -.01, top, .07, '#1e3c33'); x.fillStyle = SEA; x.fillRect(-.25, -.45, .5, .45 - .045); } },
            foxAt(-.01, top, .028, -.096),
          ],
          glows: { fox: blink, lh: [[0, 1]] },
          beams: [{ x: .1, y: .087, z: -.119, len: .3, width: .04, rot: sweep(.6, .7), k: .4 }],
          cam: [[0, lv(.3, -.012, top, -.1)], [E.dur, lv(.24, -.01, top, -.1)]],
          focus: -.096, aper: 10, grade: { expo: 1.5, vig: .18 },
        });
      } },

    // 16 · The dilemma in one picture: you on the landing in the lamp room, red light rising through the floor hatch on the
    //      left (the door below), the warm lens on the right. Push in on you.
    { id: 'S16', start: at('L15') - .15, sfx: [{ t: 0, type: 'knock', v: 0.36 }, { t: .4, type: 'wind', d: C.L15.dur + .5, v: 0.3 }],
      build: E => layered(E, {
        light: [0, .06, -.135], lightR: .12, lightCol: A.light, key: 1.05, amb: .85, ambCol: '#d08a74', sky: { stops: RED }, on: false,
        layers: [
          room('wall', -.115, [[0, .1, .06, .04]], { wall: RWALL, floor: RFLOOR }),
          { name: 'hatch', z: -.085, trans: .05, glow: 2.2, glowCol: '#ff6a4d', draw: x => { x.fillStyle = '#1a0604'; x.fillRect(-.1, -.012, .045, .012); },
            glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(-.098, -.011, .041, .01); } },
          lens('lens', -.1, .065, .1),
          figure('you', -.09, YOU, -.005, .085, 'scared'),
          floorFront(RFLOOR, -.087),
        ],
        glows: { hatch: [[0, .6], [.3, 1]], lens: [[0, 1]] }, flicker: ['lens', 'hatch'],
        cam: [[0, lv(.4)], [E.dur, lv(.33)]],
        focus: [[0, -.1], [E.dur * .5, -.09]], aper: 12, grade: { expo: 1.5, vig: .18 },
      }) },

    // 17 · The end, held under the choice: the lighthouse on its rock, the beam sweeping, and close in front the fox on her
    //      shore rock, lantern lit, watching it. Camera at the rock top so her paws sit on it.
    { id: 'S17', start: at('L16') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L16') + .5, v: 0.36 }],
      build: E => {
        const top = -.03;
        return layered(E, {
          light: [.06, .1, -.14], lightR: .2, lightCol: '#ffd9a0', key: 1.05, amb: .85, ambCol: '#7aa894', sky: { stops: NIGHT, stars: 160 }, moon: MOON, on: false,
          layers: [
            sea('far', -.125, -.005, '#2c5446'),
            { name: 'lh', z: -.115, trans: .2, glow: 2.8, glowCol: WARM, draw: x => { x.fillStyle = ROCK; cliffRich(x, { x0: -.01, x1: .25, base: -.08, top: .005, side: 1, strata: '#24443a' }); lighthouse(x, { cx: .08, by: .004, h: .15, col: ROCK, footing: .01 }); },
              glowDraw: g => lighthouse(null, { cx: .08, by: .004, h: .15, cottageLit: true }, g) },
            { name: 'rock', z: -.097, trans: .1, draw: x => { shoreRock(x, -.035, top, .07, '#1e3c33'); x.fillStyle = SEA; x.fillRect(-.25, -.45, .5, .45 - .06); } },
            foxAt(-.035, top, .03, -.096, true),
          ],
          glows: { fox: [[0, 1]], lh: [[0, 1]] }, flicker: ['fox'],
          beams: [{ x: .08, y: .133, z: -.114, len: .38, width: .06, rot: sweep(.6, .8), k: .5 }],
          cam: [[0, lv(.32, -.01, top, -.1)], [E.dur, lv(.28, 0, top, -.1)]],
          focus: -.096, aper: 10, grade: { expo: 1.5, vig: .18 },
        });
      } },
  ].map(withCrawl);
}
