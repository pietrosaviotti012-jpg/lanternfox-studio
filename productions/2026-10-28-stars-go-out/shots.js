// What If Every Star Went Out Tonight? — shot list (v1). The stars are pinholes of light on their own sheets, so each
// group can go out on a word (glows → 0): the whole sky at "out" (the premise), the first star, Sirius, the North Star,
// then the last ones. The fox with the lantern sits on the hill in the first and last shots: the one light you carry.
// Starts are anchored to narration lines (C), effects to spoken words (E.word).
import { layered } from './engine/kit/shot.js';
import { fox, dunes, foreground, star, starField, cottage } from './engine/kit/motifs.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#14254f'], [.8, '#253a6c'], [1, '#33497c']];
const DEEP = [[0, '#060a1a'], [.6, '#0c1430'], [1, '#141f42']];
const NOGLOW = { trans: 0, shadow: false, recv: false };

// the sky: three fields of small stars plus three named ones, each on its own sheet so it can go out alone
const FIELDS = { starsA: { n: 80, seed: 7 }, starsB: { n: 60, seed: 13 }, starsC: { n: 36, seed: 29, r1: .0042 } };
const NAMED = { first: { x: -.055, y: .12, r: .0042, col: '#fff1d6' }, sirius: { x: .065, y: .065, r: .0058, col: '#dfe9ff' }, polaris: { x: -.005, y: .155, r: .005, col: '#fff4dc' } };
const sky = (z = -.13, minY = -.04) => [
  ...Object.entries(FIELDS).map(([name, f]) => ({ name, z, ...NOGLOW, glow: 2.4, glowCol: '#ffecc8',
    draw: x => starField(x, { ...f, minY }), glowDraw: g => starField(null, { ...f, minY }, g) })),
  ...Object.entries(NAMED).map(([name, s]) => ({ name, z: z + .003, ...NOGLOW, glow: 3.4, glowCol: s.col, w: .04, h: .04, x: s.x, y: s.y,
    draw: x => star(x, { cx: 0, cy: 0, r: s.r, rays: 3.2 }), glowDraw: g => star(null, { cx: 0, cy: 0, r: s.r, rays: 3.2 }, g) })),
];
const ALL = [...Object.keys(FIELDS), ...Object.keys(NAMED)];
const keys = (names, k) => Object.fromEntries(names.map(n => [n, k]));

// a ridge of cottages with lit windows
const VILLAGE = [[-.13, .028], [-.095, .022], [-.06, .03], [.07, .026], [.105, .021], [.14, .028]];
const village = (base, col = '#1b284f') => ({
  draw: x => { x.fillStyle = col; dunes(x, { x0: -.25, x1: .25, base, amp: .006, seed: 9, freq: 6 }); VILLAGE.forEach(([cx, s]) => cottage(x, { cx, by: base - .003, s, col })); },
  glowDraw: g => VILLAGE.forEach(([cx, s]) => cottage(null, { cx, by: base - .003, s }, g)), glow: 2.2,
});
const hill = (base, col = '#0e1532', seed = 3) => x => { x.fillStyle = col; dunes(x, { x0: -.25, x1: .25, base, amp: .01, seed, freq: 5, grass: 12 }); };
const bank = (base, seed) => x => { x.fillStyle = '#080c1e'; foreground(x, { base, seed, reedsAt: [-.22, -.08] }); };
const foxLayer = (o, z = -.055) => ({ name: 'fox', z, trans: .2, glow: 3, w: .2, h: .2, x: o.cx, y: o.by + .05,
  draw: x => fox(x, { ...o, cx: 0, by: -.05, lantern: true }), glowDraw: g => fox(null, { ...o, cx: 0, by: -.05, lantern: true }, g) });

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook: a full sky over the village, the fox on the hill; on "out" every star goes dark at once
    { id: 'S1', start: 0, sfx: [{ t: .1, type: 'shimmer', v: .6 }, { t: C.L01.dur * .85, type: 'click' }, { t: C.L01.dur * .85 + .1, type: 'whoosh', v: .3 }],
      build: E => {
        const out = E.word('L01', 8);
        const off = (d) => [[0, 1], [out + d, 1], [out + d + .25, 0]];
        return layered(E, {
          light: [-.05, .02, -.13], lightR: .22, sky: { stops: NIGHT }, on: false,
          layers: [
            ...sky(),
            { name: 'town', z: -.09, trans: .25, ...village(0) },
            { name: 'hill', z: -.065, trans: .15, draw: hill(-.018) },
            foxLayer({ cx: -.05, by: -.02, s: .075 }),
            { name: 'fg', z: -.02, trans: .04, draw: bank(-.175, 4) },
          ],
          glows: { starsA: off(0), starsB: off(.08), starsC: off(.16), first: off(.04), sirius: off(.12), polaris: off(.2), fox: [[0, 1]] }, flicker: ['fox'],
          grade: t => ({ sat: lerp(1.04, .9, ss(seg(t, out, out + .6))) }),
          cam: [[0, [0, -.035, .74, 0, -.025, -.07]], [out, [0, -.025, .66, 0, -.015, -.07]], [E.dur, [0, -.02, .62, 0, -.01, -.07]]],
          focus: -.06, aper: 14,
        });
      } },

    // 2 · The snapback: the stars are all still there; the fox, big in frame, looks up; the camera tracks sideways
    { id: 'S2', start: at('L03') - .35, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'shimmer', v: .8 }, { t: 0, type: 'wind', d: 5, v: .3 }],
      build: E => layered(E, {
        light: [.04, .08, -.13], lightR: .24, sky: { stops: NIGHT }, on: false,
        layers: [
          ...sky(-.13, -.06),
          { name: 'hill2', z: -.09, trans: .25, draw: hill(-.055, '#22336a', 8) },
          { name: 'hill', z: -.065, trans: .12, draw: hill(-.075, '#0e1532', 5) },
          foxLayer({ cx: -.035, by: -.078, s: .12 }),
          { name: 'fg', z: -.02, trans: .04, draw: bank(-.2, 6) },
        ],
        glows: { ...keys(ALL, [[0, 1]]), fox: [[0, 1]] }, flicker: ['starsA', 'starsC', 'fox'],
        cam: [[0, [.045, -.065, .6, .03, -.055, -.07]], [E.dur, [-.04, -.055, .58, -.03, -.045, -.07]]],
        focus: -.055, aper: 18,
      }) },

    // 3 · Old light: one star high on the right; its light travels down a dotted path to the hill, the camera follows it
    { id: 'S3', start: at('L05') - .35, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: at('L06') - at('L05') + .35 + C.L06.dur * .35, type: 'whoosh', v: .5 }],
      build: E => {
        const t0 = E.word('L06', 4), t1 = E.cueEnd('L06') + .2;
        const A = [.07, .17], B = [-.05, .005];
        const P = u => [lerp(A[0], B[0], u), lerp(A[1], B[1], u) + Math.sin(u * Math.PI) * .02];
        const dots = (c, col) => { c.fillStyle = col; for (let i = 1; i < 34; i++) { const [px, py] = P(i / 34); c.beginPath(); c.arc(px, py, .0007, 0, 2 * Math.PI); c.fill(); } };
        return layered(E, {
          light: [.06, .14, -.13], lightR: .16, sky: { stops: DEEP }, on: false,
          layers: [
            { name: 'starsC', z: -.13, ...NOGLOW, glow: 1.6, draw: x => starField(x, { ...FIELDS.starsC, minY: -.04 }), glowDraw: g => starField(null, { ...FIELDS.starsC, minY: -.04 }, g) },
            { name: 'big', z: -.125, ...NOGLOW, glow: 4, glowCol: '#fff1d6', w: .06, h: .06, x: A[0], y: A[1], draw: x => star(x, { cx: 0, cy: 0, r: .008, rays: 3.4 }), glowDraw: g => star(null, { cx: 0, cy: 0, r: .008, rays: 3.4 }, g) },
            { name: 'path', z: -.12, ...NOGLOW, glow: .8, draw: x => dots(x, '#2a3866'), glowDraw: g => dots(g, '#fff') },
            { name: 'pulse', z: -.115, ...NOGLOW, glow: 5, glowCol: '#ffe2a8', w: .03, h: .03, x: A[0], y: A[1],
              draw: x => { x.fillStyle = '#3a3020'; x.beginPath(); x.arc(0, 0, .0035, 0, 2 * Math.PI); x.fill(); },
              glowDraw: g => { const r = g.createRadialGradient(0, 0, 0, 0, 0, .0035); r.addColorStop(0, '#fff'); r.addColorStop(1, 'rgba(255,255,255,.3)'); g.fillStyle = r; g.beginPath(); g.arc(0, 0, .0035, 0, 2 * Math.PI); g.fill(); } },
            { name: 'hill', z: -.065, trans: .12, draw: hill(-.005, '#0e1532', 11) },
            { name: 'fg', z: -.02, trans: .04, draw: bank(-.19, 8) },
          ],
          glows: { path: [[0, 0], [t0 - .2, 0], [t0 + .4, 1]], pulse: [[0, 0], [t0 - .3, 0], [t0, 1]] },
          update: (t, L) => { const [px, py] = P(ss(seg(t, t0, t1))); L.pulse.position.x = px; L.pulse.position.y = py; },
          cam: [[0, [.05, .14, .58, .06, .15, -.07]], [t0, [.05, .13, .6, .055, .14, -.07]], [t1, [-.02, .015, .66, -.03, .025, -.07]], [E.dur, [-.03, .01, .68, -.035, .02, -.07]]],
          focus: -.12, aper: 12,
        });
      } },

    // 4 · Years go by, the sky looks normal; the camera arcs over the roofs and settles on one star, which blinks out
    { id: 'S4', start: at('L07') - .4, in: { type: 'dissolve', dur: .8 },
      sfx: [{ t: at('L08') - at('L07') + .4 + C.L08.dur * .9, type: 'click' }],
      build: E => {
        const blink = E.word('L08', 6), out = E.word('L08', 7);
        return layered(E, {
          light: [0, .05, -.13], lightR: .25, sky: { stops: NIGHT }, on: false,
          layers: [
            ...sky(),
            { name: 'town', z: -.085, trans: .25, ...village(-.02, '#16224a') },
            { name: 'fg', z: -.03, trans: .05, draw: hill(-.1, '#0a1028', 2) },
          ],
          glows: { ...keys(ALL, [[0, 1]]), town: [[0, 1]], first: [[0, 1], [blink, 1], [blink + .12, .25], [blink + .25, 1], [out, 1], [out + .3, 0]] },
          flicker: ['starsA', 'starsB'],
          cam: [[0, [.06, .0, .66, .02, .03, -.07]], [E.cue('L08'), [-.02, .05, .6, -.03, .08, -.07]], [out, [-.045, .1, .48, -.052, .115, -.07]], [E.dur, [-.048, .105, .46, -.054, .118, -.07]]],
          focus: [[0, -.085], [E.cue('L08'), -.13]], aper: 14,
        });
      } },

    // 5 · Sirius goes dark; the North Star keeps shining: the camera tilts up from one to the other
    { id: 'S5', start: at('L09') - .4, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .4 + C.L09.dur * .5, type: 'click' }, { t: at('L10') - at('L09') + .4 + C.L10.dur * .6, type: 'chime' }],
      build: E => {
        const dark = E.word('L09', 2), keep = E.word('L10', 4);
        return layered(E, {
          light: [.03, .1, -.13], lightR: .22, sky: { stops: NIGHT }, on: false,
          layers: [
            ...sky(),
            { name: 'town', z: -.085, trans: .25, ...village(-.03, '#16224a') },
          ],
          glows: { ...keys(ALL, [[0, 1]]), starsA: [[0, 1], [E.dur, .55]], first: [[0, 0]], sirius: [[0, 1], [dark - .1, 1], [dark + .35, 0]],
            polaris: [[0, 1], [keep, 1], [keep + .6, 1]], town: [[0, 1]] },
          flicker: ['polaris'],
          cam: [[0, [.05, .05, .5, .055, .062, -.07]], [dark + .5, [.045, .06, .52, .05, .07, -.07]], [E.cue('L10') + .3, [.02, .1, .54, .02, .12, -.07]], [E.dur, [0, .13, .5, -.005, .148, -.07]]],
          focus: -.127, aper: 12,
        });
      } },

    // 6 · The last ones fade: a slow pull back as the fields go out one after another; the windows stay lit
    { id: 'S6', start: at('L11') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: 0, type: 'wind', d: 4, v: .25 }],
      build: E => {
        const a = E.cue('L11'), b = E.cueEnd('L11') + .4;
        const fade = (u0, u1, from = 1) => [[0, from], [lerp(a, b, u0), from], [lerp(a, b, u1), 0]];
        return layered(E, {
          light: [-.04, .0, -.13], lightR: .2, sky: { stops: NIGHT }, on: false,
          layers: [
            ...sky(),
            { name: 'town', z: -.09, trans: .25, ...village(0) },
            { name: 'hill', z: -.065, trans: .15, draw: hill(-.018) },
            foxLayer({ cx: -.05, by: -.02, s: .075 }),
            { name: 'fg', z: -.02, trans: .04, draw: bank(-.175, 4) },
          ],
          glows: { starsA: fade(0, .35, .55), starsB: fade(.2, .6), starsC: fade(.45, .85), first: [[0, 0]], sirius: [[0, 0]], polaris: fade(.8, 1.05), town: [[0, 1]], fox: [[0, 1]] },
          flicker: ['fox'],
          grade: t => ({ sat: lerp(1, .88, ss(seg(t, a, b))) }),
          cam: [[0, [0, .05, .52, 0, .07, -.07]], [E.dur, [0, -.015, .7, 0, -.005, -.07]]],
          focus: [[0, -.13], [E.dur, -.06]], aper: 12,
        });
      } },

    // 7 · Right now: the full sky again; a slow crane toward one star that quietly goes out on "gone"
    { id: 'S7', start: at('L12') - .4, in: { type: 'dissolve', dur: 1 }, sfx: [{ t: .3, type: 'shimmer', v: .7 }, { t: at('L13') - at('L12') + .4 + C.L13.dur * .95, type: 'click' }],
      build: E => {
        const gone = E.word('L13', 10);
        return layered(E, {
          light: [.04, .08, -.13], lightR: .24, sky: { stops: NIGHT }, on: false,
          layers: [
            ...sky(),
            { name: 'town', z: -.085, trans: .25, ...village(-.025, '#16224a') },
            { name: 'fg', z: -.03, trans: .05, draw: hill(-.11, '#0a1028', 2) },
          ],
          glows: { ...keys(ALL, [[0, 1]]), town: [[0, 1]], sirius: [[0, 1], [gone - .1, 1], [gone + .6, 0]] },
          flicker: ['starsA', 'starsB', 'starsC'],
          cam: [[0, [-.03, .0, .68, -.02, .02, -.07]], [E.cue('L13'), [.02, .03, .6, .03, .05, -.07]], [E.dur, [.055, .055, .5, .063, .066, -.07]]],
          focus: [[0, -.085], [E.cue('L13'), -.127]], aper: 12,
        });
      } },

    // 8 · The one you carry: the fox and its lantern, close; then the camera cranes up to the stars and the title
    { id: 'S8', start: at('L14') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: .4, type: 'chime' }, { t: end('L15') - at('L14') + 1, type: 'paper' }],
      build: E => {
        const titleAt = E.cueEnd('L15') + .5;
        return layered(E, {
          light: [-.02, -.01, -.12], lightR: .14, lightCol: '#ffc878', sky: { stops: NIGHT }, on: false,
          layers: [
            ...sky(-.13, -.02),
            { name: 'town', z: -.095, trans: .25, ...village(-.035, '#16224a') },
            { name: 'hill', z: -.07, trans: .15, draw: hill(-.07, '#0e1532', 6) },
            foxLayer({ cx: -.02, by: -.072, s: .11 }, -.062),
            { name: 'title', z: -.05, trans: .3, w: .24, h: .06, x: 0, y: .19, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => { text(x, 'Lantern Fox Tales', 0, .006, .02, '"Cormorant"', { fill: '#f1dbac', weight: 600 }); x.fillStyle = '#b3302a'; x.fillRect(-.006, -.022, .012, .012); } },
            { name: 'fg', z: -.02, trans: .04, draw: bank(-.2, 7) },
          ],
          glows: { ...keys(ALL, [[0, 1]]), sirius: [[0, 0]], town: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox', 'starsA'],
          update: (t, L) => { const k = ss(seg(t, titleAt, titleAt + 1.4)); L.title.visible = k > 0; L.title.material.color.setScalar(k); L.title.position.y = L.title.userData.p0.y - .006 * (1 - k); },
          cam: [[0, [.01, -.075, .46, .0, -.07, -.07]], [E.cue('L15'), [.0, -.065, .52, -.005, -.055, -.07]], [titleAt, [0, .07, .64, 0, .1, -.07]], [E.dur, [0, .08, .68, 0, .11, -.07]]],
          focus: [[0, -.062], [E.cue('L15'), -.062], [titleAt, -.05]], aper: 14,
        });
      } },
  ];
}
