// What If the Moon Disappeared Tonight? (What If…, episode 3) — shot list. At midnight the Moon over the bay goes out on
// "disappeared"; the town sleeps and doesn't notice, but the ocean does (hit). Tides: the Earth with its water bulge pulled
// toward the Moon, which shrinks when the Moon goes; by morning the harbour water has dropped and the boat sits low. The night
// gets darker; on a beach the hatchling turtles crawl for the brightest light, which used to be the moonlit sea and is now the
// town; on the reef the corals wait. The turn (hit): the Moon is already leaving, 3.8 cm a year (a cream ruler card), so look up
// while it's close: the Moon rises back over the bay and the fox with the lantern sits on the cliff, looking up (no question).
// Motion is off (no zoom snaps): single smooth camera moves, soft dissolves, hard cuts only on the two hits.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, houses, dunes, cliff, foreground, starField, boat, moonTrail, turtle, coral, paperMoon } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { waves, waterTop } from './engine/art.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp, TAU } from './engine/lib.js';

const T = theme('what-if', 'notte'), DAWN = theme('what-if', 'alba');
const SPACE = [[0, '#02040c'], [.6, '#061020'], [1, '#0c1a30']];
const DARKER = [[0, '#010308'], [.6, '#030a14'], [1, '#08202c']];
const REEF = [[0, '#021018'], [.5, '#05303a'], [1, '#0a4a52']];
const NOGLOW = { trans: 0, shadow: false, recv: false };
const MOONCOL = '#fff0c8';

// the Moon as its own sheet (it can fade, rise or drift away)
const moonLayer = (name, cx, cy, r, z = -.13) => ({ name, z, ...NOGLOW, glow: 3.2, glowCol: MOONCOL, w: r * 2.4, h: r * 2.4, x: cx, y: cy,
  draw: x => paperMoon(x, { cx: 0, cy: 0, r }), glowDraw: g => paperMoon(null, { cx: 0, cy: 0, r }, g) });
// fade a sheet (and its glow) out between t0 and t0 + d
const fadeOut = (L, n, t, t0, d = .6) => { const k = 1 - ss(seg(t, t0, t0 + d)); L[n].visible = k > .01; L[n].material.color.setScalar(k); };
const fadeIn = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); };
// the bay: a sea sheet with a wavy top and paper waves below it
const sea = (base, col, line = '#2c6a7a', r = .008) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .0015, len: .05 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .005, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
// a town on the far shore, windows lit
const town = (by, seed = 5, col = T.far, h = .035) => ({
  draw: x => { x.fillStyle = col; dunes(x, { x0: -.25, x1: .25, base: by, amp: .003, seed, freq: 5 }); houses(x, { x0: -.24, x1: .24, by: by - .004, h, seed, col }); },
  glowDraw: g => houses(null, { x0: -.24, x1: .24, by: by - .004, h, seed }, g), glow: 2.4, glowCol: T.glow,
});
const rocks = (base, top, col = T.near, side = -1, x0 = -.25, x1 = -.02, seed = 3) => x => { x.fillStyle = col; cliff(x, { x0, x1, base, top, side, seed }); };
const foxLayer = (o, z = -.06, name = 'fox') => ({ name, z, trans: .2, glow: 3.2, w: .2, h: .2, x: o.cx, y: o.by + .05,
  draw: x => fox(x, { ...o, cx: 0, by: -.05, lantern: true }), glowDraw: g => fox(null, { ...o, cx: 0, by: -.05, lantern: true }, g) });
const stars = (n, seed, z = -.135) => ({ name: 'stars', z, ...NOGLOW, glow: 1.8, glowCol: '#e8f4ff',
  draw: x => starField(x, { n, seed, minY: .02, col: '#0a1a28' }), glowDraw: g => starField(null, { n, seed, minY: .02 }, g) });
// a hatchling on its own little sheet (so it can crawl and turn)
const hatchling = (name, cx, cy, s, z = -.07) => ({ name, z, trans: .05, glow: 2.2, glowCol: '#ffffff', w: s * 1.6, h: s * 1.6, x: cx, y: cy, shadow: false,
  draw: x => turtle(x, { cx: 0, cy: 0, s }), glowDraw: g => turtle(null, { cx: 0, cy: 0, s }, g) });
// the Earth seen from space, with its ocean as a separate sheet that can stretch toward the Moon
const earthLayers = (cx, cy, r) => [
  { name: 'ocean', z: -.1, ...NOGLOW, glow: 2, glowCol: '#6fd8e8', w: r * 3, h: r * 3, x: cx, y: cy,
    draw: x => { x.fillStyle = '#1b6a80'; x.beginPath(); x.arc(0, 0, r * 1.08, 0, TAU); x.fill(); },
    glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = r * .04; g.beginPath(); g.arc(0, 0, r * 1.06, 0, TAU); g.stroke(); } },
  { name: 'earth', z: -.098, trans: .3, w: r * 2.2, h: r * 2.2, x: cx, y: cy,
    draw: x => { x.fillStyle = '#163c4a'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
      x.fillStyle = '#2a5a3a'; for (const [u, v, a, b] of [[-.35, .3, .3, .22], [.3, -.2, .25, .35], [-.1, -.5, .2, .12], [.4, .45, .15, .1]]) { x.beginPath(); x.ellipse(u * r, v * r, a * r, b * r, .4, 0, TAU); x.fill(); } } },
];

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  const mid = (id, u) => C[id].at + C[id].dur * u;
  return [
    // 1 · The hook, already lit: the full Moon over the bay, its trail on the water, the town asleep on the far shore, the fox
    //     small on the near rocks. On "disappeared" the Moon and its trail go out. One slow crane down.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: 4, v: .3 }],
      build: E => {
        const gone = E.word('L01', 4);
        return layered(E, {
          light: [0, .16, -.13], lightR: .24, lightCol: T.light, sky: { stops: T.sky, stars: 60 }, on: false,
          layers: [
            moonLayer('moon', .03, .175, .03),
            { name: 'town', z: -.11, trans: .25, ...town(.072) },
            { name: 'sea', z: -.1, trans: .35, draw: sea(.07, T.mid) },
            { name: 'trail', z: -.098, ...NOGLOW, glow: 2.8, glowCol: MOONCOL, draw: x => moonTrail(x, { cx: .03, top: .066, n: 26, col: '#0f3a4a' }),
              glowDraw: g => moonTrail(g, { cx: .03, top: .066, n: 26, col: '#fff' }) },
            { name: 'rocks', z: -.07, trans: .1, draw: rocks(-.02, .1, T.near, -1, -.2, .1) },
            foxLayer({ cx: -.065, by: .092, s: .045 }, -.068),
            { name: 'fg', z: -.04, trans: .04, draw: x => { x.fillStyle = '#04101a'; foreground(x, { base: -.06, seed: 5, reedsAt: [.12, .24] }); } },
          ],
          glows: { moon: [[0, 1], [gone, 1], [gone + .6, 0]], trail: [[0, 1], [gone + .1, 1], [gone + .7, 0]] },
          flicker: ['fox'],
          update: (t, L) => { fadeOut(L, 'moon', t, gone, .6); },
          cam: [[0, [-.01, .12, .5, -.01, .125, -.1]], [E.dur, [0, .1, .48, -.005, .105, -.1]]],
          focus: -.1, aper: 14,
        });
      } },

    // 2 · Most people wouldn't notice: the town up close, rooftops and windows, one by one the lights go out (everyone asleep).
    //     A slow truck along the street.
    { id: 'S2', start: at('L02') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'click', v: .3 }, { t: 1.1, type: 'click', v: .25 }],
      build: E => layered(E, {
        light: [0, .14, -.12], lightR: .2, lightCol: T.light, sky: { stops: T.sky, stars: 90 }, on: false,
        layers: [
          { name: 'far', z: -.12, trans: .25, ...town(.06, 8, T.far, .03) },
          { name: 'near', z: -.09, trans: .2, ...town(.03, 11, T.mid, .05) },
          { name: 'fg', z: -.05, trans: .05, draw: x => { x.fillStyle = T.near; dunes(x, { x0: -.25, x1: .25, base: -.01, amp: .006, seed: 4, grass: 10 }); } },
        ],
        glows: { far: [[0, 1], [E.dur * .4, .4]], near: [[0, 1], [E.dur * .55, 1], [E.dur * .9, .35]] },
        cam: [[0, [-.03, .05, .44, -.02, .05, -.1]], [E.dur, [.03, .05, .44, .02, .05, -.1]]],
        focus: -.09, aper: 16,
      }) },

    // 3 · But the ocean would (hit): a hard cut to the open sea, three sheets of waves rolling against each other, a lone boat
    //     riding them, no moon in the sky. Low camera, slow pan.
    { id: 'S3', start: at('L03') - .1, sfx: [{ t: 0, type: 'whoosh', v: .6 }, { t: .1, type: 'wind', d: 3, v: .45 }],
      build: E => layered(E, {
        light: [0, .14, -.13], lightR: .26, lightCol: '#bfe8ff', key: .8, sky: { stops: DARKER, stars: 120 }, on: false,
        layers: [
          { name: 'w1', z: -.12, trans: .35, draw: sea(.085, '#0f3a4a') },
          { name: 'boat', z: -.105, trans: .05, w: .06, h: .06, x: .05, y: .1, draw: x => { x.fillStyle = '#04101a'; boat(x, { cx: 0, by: -.015, s: .04 }); } },
          { name: 'w2', z: -.1, trans: .3, draw: sea(.075, '#0c3040', '#24606e', .011) },
          { name: 'w3', z: -.08, trans: .25, draw: sea(.05, '#071c28', '#1e5260', .014) },
        ],
        update: (t, L) => {
          L.w1.position.x = L.w1.userData.p0.x + .006 * Math.sin(t * 1.1);
          L.w2.position.x = L.w2.userData.p0.x - .008 * Math.sin(t * 1.3 + 1);
          L.w3.position.x = L.w3.userData.p0.x + .01 * Math.sin(t * .9 + 2); L.w3.position.y = L.w3.userData.p0.y + .003 * Math.sin(t * 1.7);
          L.boat.position.y = L.boat.userData.p0.y + .004 * Math.sin(t * 1.7 + .8); L.boat.rotation.z = .08 * Math.sin(t * 1.5);
        },
        cam: [[0, [-.02, .07, .45, -.01, .07, -.1]], [E.dur, [.02, .07, .45, .015, .07, -.1]]],
        focus: -.1, aper: 14,
      }) },

    // 4 · Two thirds of the pull: the Earth from space, its ocean stretched into a bulge toward the Moon (the card says ⅔ / ⅓).
    //     Slow orbit-like truck.
    { id: 'S4', start: at('L04') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'shimmer', v: .5 }],
      build: E => {
        const pull = E.word('L04', 4);
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, lightCol: '#cfeaff', sky: { stops: SPACE, stars: 140 }, on: false,
          layers: [
            moonLayer('moon', .1, .15, .016, -.12),
            ...earthLayers(-.035, .09, .045),
          ],
          glows: { moon: [[0, 1]], ocean: [[0, .5], [pull, .5], [pull + .8, 1]] },
          update: (t, L) => { const k = 1 + .22 * ss(seg(t, pull - .2, pull + 1)); L.ocean.scale.set(k, 1 / Math.sqrt(k), 1);
            L.ocean.rotation.z = Math.atan2(.15 - .09, .1 + .035); },
          cam: [[0, [-.03, .065, .45, -.01, .065, -.1]], [E.dur, [.02, .065, .45, .01, .065, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 5 · Without it, every tide shrinks to a third: the same Earth, the Moon gone, the bulge slowly sinking back into a circle
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .3, type: 'whoosh', v: .4 }],
      build: E => {
        const go = E.word('L05', 0);
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, lightCol: '#cfeaff', sky: { stops: SPACE, stars: 140 }, on: false,
          layers: [
            moonLayer('moon', .1, .15, .016, -.12),
            ...earthLayers(-.035, .09, .045),
          ],
          glows: { moon: [[0, 1], [go, 1], [go + .5, 0]], ocean: [[0, 1], [go + .5, 1], [E.dur, .4]] },
          update: (t, L) => { fadeOut(L, 'moon', t, go, .5); const k = 1.22 - .2 * ss(seg(t, go + .3, E.dur - .3)); L.ocean.scale.set(k, 1 / Math.sqrt(k), 1);
            L.ocean.rotation.z = Math.atan2(.15 - .09, .1 + .035); },
          cam: [[0, [.02, .065, .45, .01, .065, -.1]], [E.dur, [.0, .06, .43, .0, .06, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 6 · By morning, the harbour: dawn light, a jetty, a boat whose water drains away until it sits low on the mud
    { id: 'S6', start: mid('L05', .55), in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'paper', v: .4 }],
      build: E => layered(E, {
        light: [0, .15, -.13], lightR: .3, lightCol: DAWN.light, key: 1, sky: { stops: DAWN.sky }, on: false,
        layers: [
          { name: 'far', z: -.12, trans: .3, ...town(.085, 3, DAWN.far, .03) },
          { name: 'mud', z: -.1, trans: .1, draw: x => { x.fillStyle = '#2a2a24'; dunes(x, { x0: -.25, x1: .25, base: .035, amp: .004, seed: 6, freq: 6 }); } },
          { name: 'boat', z: -.095, trans: .05, w: .08, h: .08, x: .04, y: .075, draw: x => { x.fillStyle = DAWN.near; boat(x, { cx: 0, by: -.02, s: .055 }); } },
          { name: 'water', z: -.093, trans: .3, draw: sea(.06, DAWN.mid, '#5a9aa0', .009) },
          { name: 'jetty', z: -.08, trans: .05, draw: x => { x.fillStyle = DAWN.near; x.fillRect(-.25, .075, .2, .006);
            for (let i = 0; i < 5; i++) x.fillRect(-.24 + i * .045, -.2, .006, .28); } },
        ],
        move: { water: [[0, [0, 0, 0]], [E.dur, [0, -.035, 0]]], boat: [[0, [0, 0, 0]], [E.dur * .8, [0, -.03, -.06]], [E.dur, [0, -.03, -.06]]] },
        cam: [[0, [.03, .055, .44, .02, .055, -.1]], [E.dur, [-.01, .05, .44, -.005, .05, -.1]]],
        focus: -.095, aper: 16,
      }) },

    // 7 · A hundred times darker: back to night, the village under a sky with no moon; the landscape fades down, the stars come up
    { id: 'S7', start: at('L06') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'wind', d: 4, v: .3 }],
      build: E => {
        const dk = E.word('L06', 7);
        return layered(E, {
          light: [0, .12, -.13], lightR: .2, lightCol: T.light, key: .7, sky: { stops: T.sky }, on: false,
          layers: [
            stars(160, 17),
            { name: 'hills', z: -.11, trans: .2, draw: x => { x.fillStyle = T.far; dunes(x, { x0: -.25, x1: .25, base: .06, amp: .012, seed: 9, freq: 7 }); } },
            { name: 'town', z: -.095, trans: .2, ...town(.04, 21, T.mid, .03) },
            { name: 'fg', z: -.06, trans: .05, draw: x => { x.fillStyle = T.near; foreground(x, { base: -.005, seed: 8, reedsAt: [-.22, -.1] }); } },
          ],
          glows: { stars: [[0, .3], [dk - .3, .3], [dk + 1, 1]], town: [[0, .8]] },
          grade: t => ({ expo: 1.06 - .3 * ss(seg(t, dk - .4, dk + .9)) }),
          cam: [[0, [0, .085, .46, 0, .09, -.1]], [E.dur, [0, .1, .44, 0, .11, -.1]]],
          focus: -.1, aper: 14,
        });
      } },

    // 8 · On a beach in Florida, the hatchlings: sand seen from above at a slant, five baby turtles digging out and starting to crawl
    { id: 'S8', start: at('L07') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'paper', v: .5 }, { t: 1.2, type: 'paper', v: .4 }],
      build: E => {
        const H = [[-.06, .05], [-.02, .075], [.03, .055], [.065, .085], [.0, .03]];
        return layered(E, {
          light: [0, .12, -.1], lightR: .24, lightCol: '#cfe2ff', key: .8, amb: .4, sky: { stops: DARKER }, on: false,
          layers: [
            { name: 'sand', z: -.1, trans: .15, draw: x => { x.fillStyle = '#3a3a34'; x.fillRect(-.25, -.45, .5, .9);
              x.fillStyle = '#2e2e2a'; const R = (i => () => (i = (i * 9301 + 49297) % 233280) / 233280)(7); for (let i = 0; i < 260; i++) { x.beginPath(); x.arc((R() - .5) * .33, (R() - .5) * .58, .0015 + R() * .002, 0, TAU); x.fill(); } } },
            { name: 'nest', z: -.098, trans: .1, draw: x => { x.fillStyle = '#26261f'; x.beginPath(); x.ellipse(0, .05, .05, .022, 0, 0, TAU); x.fill(); } },
            ...H.map(([hx, hy], i) => hatchling('h' + i, hx, hy, .022, -.095 + i * .0005)),
          ],
          update: (t, L) => H.forEach(([hx, hy], i) => { const m = L['h' + i], u = Math.max(0, t - .3 - i * .35);
            fadeIn(L, 'h' + i, t, .2 + i * .35, .5);
            m.position.y = hy + .006 * u; m.rotation.z = .25 * Math.sin(u * 3 + i); }),
          cam: [[0, [0, .03, .38, 0, .03, -.1]], [E.dur, [0, .04, .4, 0, .045, -.1]]],
          focus: -.097, aper: 18,
        });
      } },

    // 9 · It used to be the moonlit sea; tonight it's the town: the beach from behind the hatchlings, the black sea on the
    //     left, the bright town on the right; on "town" every turtle turns away from the sea and crawls toward the lights
    { id: 'S9', start: at('L08') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: 3, v: .3 }],
      build: E => {
        const turn = E.word('L08', 10);
        const H = [[-.07, .06], [-.03, .05], [.0, .065], [.035, .047], [-.05, .035]];
        return layered(E, {
          light: [.08, .1, -.13], lightR: .2, lightCol: '#ffd9a0', key: .8, sky: { stops: T.sky }, on: false,
          layers: [
            { name: 'sea', z: -.12, trans: .3, draw: x => { x.save(); x.beginPath(); x.rect(-.25, -.45, .25, .9); x.clip(); sea(.075, '#061822', '#123a48')(x); x.restore(); } },
            { name: 'town', z: -.115, trans: .25, w: .17, x: .085, ...town(.07, 14, '#1a1a24', .035), glow: 3.2 },
            { name: 'sand', z: -.1, trans: .15, draw: x => { x.fillStyle = '#2e2e2a'; dunes(x, { x0: -.25, x1: .25, base: .06, amp: .004, seed: 2 }); } },
            ...H.map(([hx, hy], i) => hatchling('h' + i, hx, hy, .018, -.09 + i * .0005)),
            { name: 'fg', z: -.06, trans: .05, draw: x => { x.fillStyle = '#1a1a16'; dunes(x, { x0: -.25, x1: .25, base: -.03, amp: .008, seed: 7, grass: 14 }); } },
          ],
          glows: { town: [[0, .5], [turn - .2, .5], [turn + .5, 1]] },
          update: (t, L) => H.forEach(([hx, hy], i) => { const m = L['h' + i], k = ss(seg(t, turn - .1 + i * .1, turn + .6 + i * .1)), u = Math.max(0, t - turn - .4);
            m.rotation.z = lerp(.5, -1.2, k); m.position.x = hx + .012 * u; m.position.y = hy + .004 * Math.min(u, 1); }),
          cam: [[0, [-.04, .045, .44, -.03, .045, -.1]], [E.dur, [.04, .05, .44, .03, .05, -.1]]],
          focus: -.095, aper: 16,
        });
      } },

    // 10 · On the reef, the corals wait: underwater, teal, three corals with their polyps glowing faintly and pulsing, waiting.
    //      A slow drift down.
    { id: 'S10', start: at('L09') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'shimmer', v: .4 }],
      build: E => layered(E, {
        light: [0, .2, -.13], lightR: .3, lightCol: '#8fe0e8', key: .8, amb: .45, ambCol: '#4aa0b0', sky: { stops: REEF }, on: false,
        layers: [
          { name: 'c1', z: -.12, trans: .2, glow: 2.2, glowCol: T.em, draw: x => { x.fillStyle = '#0a2a34'; dunes(x, { x0: -.25, x1: .25, base: .02, amp: .01, seed: 4 }); coral(x, { cx: .08, by: .02, s: .09, col: '#0e3a46', seed: 2 }); },
            glowDraw: g => coral(null, { cx: .08, by: .02, s: .09, seed: 2 }, g) },
          { name: 'c2', z: -.1, trans: .2, glow: 2.4, glowCol: T.em, draw: x => { coral(x, { cx: -.07, by: .005, s: .11, col: '#123f4c', seed: 5 }); },
            glowDraw: g => coral(null, { cx: -.07, by: .005, s: .11, seed: 5 }, g) },
          { name: 'floor', z: -.08, trans: .1, draw: x => { x.fillStyle = '#061a22'; dunes(x, { x0: -.25, x1: .25, base: .0, amp: .008, seed: 11, grass: 16 });
            coral(x, { cx: .04, by: -.004, s: .05, col: '#061a22', seed: 9, n: 5 }); } },
        ],
        update: (t, L) => { L.c1.material.userData.u.uGlowLit.value = .45 + .25 * Math.sin(t * 2); L.c2.material.userData.u.uGlowLit.value = .45 + .25 * Math.sin(t * 2 + 1.4); },
        cam: [[0, [0, .06, .46, 0, .06, -.1]], [E.dur, [.01, .04, .44, .005, .04, -.1]]],
        focus: -.1, aper: 14,
      }) },

    // 11 · But here's the strange part: black sky, the fox alone on the cliff edge, her lantern the only light; she looks up
    { id: 'S11', start: at('L10') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'wind', d: 3, v: .3 }],
      build: E => layered(E, {
        light: [-.02, .1, -.1], lightR: .14, lightCol: '#ffc27a', key: .6, sky: { stops: DARKER, stars: 160 }, on: false,
        layers: [
          { name: 'sea', z: -.12, trans: .3, draw: sea(.04, '#061822', '#123a48') },
          { name: 'rocks', z: -.08, trans: .1, draw: rocks(-.05, .06, T.near, -1, -.2, .23) },
          foxLayer({ cx: -.06, by: .058, s: .07 }, -.075),
        ],
        flicker: ['fox'],
        cam: [[0, [-.06, .06, .42, -.05, .065, -.08]], [E.dur, [-.05, .07, .4, -.05, .075, -.08]]],
        focus: -.075, aper: 16,
      }) },

    // 12 · The Moon is already leaving (hit): a hard cut to space, the Earth and the Moon; the Moon slides slowly away, a dotted
    //      line stretching between them
    { id: 'S12', start: at('L11') - .1, sfx: [{ t: 0, type: 'whoosh', v: .6 }, { t: .1, type: 'shimmer', v: .5 }],
      build: E => {
        const lv = E.word('L11', 4);
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, lightCol: '#cfeaff', sky: { stops: SPACE, stars: 160 }, on: false,
          layers: [
            ...earthLayers(-.05, .07, .035),
            moonLayer('moon', .02, .12, .014, -.11),
            { name: 'dots', z: -.105, ...NOGLOW, glow: 1.6, glowCol: T.em, w: .3, h: .2, x: 0, y: 0,
              draw: x => { x.fillStyle = '#1a3040'; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(lerp(-.05, .07, i / 29), lerp(.07, .142, i / 29), .0011, 0, TAU); x.fill(); } },
              glowDraw: g => { g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(lerp(-.05, .07, i / 29), lerp(.07, .142, i / 29), .0011, 0, TAU); g.fill(); } } },
          ],
          glows: { moon: [[0, 1]], ocean: [[0, .7]], dots: [[0, 0], [lv - .2, 0], [lv + .4, .8]] },
          move: { moon: [[0, [0, 0, 0]], [lv, [0, 0, 0]], [E.dur, [.05, .022, 0]]] },
          cam: [[0, [-.01, .06, .44, -.01, .06, -.1]], [E.dur, [.01, .065, .46, .01, .065, -.1]]],
          focus: -.105, aper: 12,
        });
      } },

    // 13 · 3.8 cm a year, as fast as your fingernails grow: the cream card (a pause from the dark): a paper ruler, a yellow marker
    //      sliding from 0 to 3.8, the words written under it
    { id: 'S13', start: at('L12') - .2, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .2, type: 'paper', v: .6 }, { t: 1.4, type: 'click', v: .4 }],
      build: E => {
        const go = E.cue('L12') + .2, nail = E.word('L12', 10);
        const X0 = -.09, CM = .04;
        return layered(E, {
          light: [0, .1, -.12], lightR: .3, lightCol: '#fff4e0', key: 1, amb: .8, ambCol: '#fff4e0', sky: { stops: [[0, '#efe8d8'], [1, '#efe8d8']] }, on: false,
          layers: [
            { name: 'card', z: -.12, trans: .05, draw: x => { x.fillStyle = '#efe8d8'; x.fillRect(-.25, -.45, .5, .9); } },
            { name: 'ruler', z: -.1, trans: .05, draw: x => { x.fillStyle = '#d8c89a'; x.fillRect(-.11, .08, .22, .035); x.fillStyle = '#2a2418';
              for (let i = 0; i <= 50; i++) { const h = i % 10 === 0 ? .014 : i % 5 === 0 ? .009 : .005; x.fillRect(X0 + i * CM / 10 - .0004, .115 - h, .0008, h); }
              for (let i = 0; i <= 4; i++) text(x, String(i), X0 + i * CM, .088, .007, '"Anton"', { fill: '#2a2418' }); } },
            { name: 'mark', z: -.098, trans: 0, shadow: false, w: .02, h: .06, x: X0, y: .1, draw: x => { x.fillStyle = T.tag; x.fillRect(-.0015, -.025, .003, .045);
              x.beginPath(); x.moveTo(-.006, .022); x.lineTo(.006, .022); x.lineTo(0, .014); x.closePath(); x.fill(); } },
            { name: 'w1', z: -.098, ...NOGLOW, w: .3, h: .04, x: 0, y: .155, draw: x => text(x, '3.8 CM A YEAR', 0, 0, .019, '"Anton"', { fill: '#1a1a1a' }) },
            { name: 'w2', z: -.098, ...NOGLOW, w: .3, h: .04, x: 0, y: .064, draw: x => text(x, '≈ YOUR FINGERNAILS', 0, 0, .012, '"Anton"', { fill: T.tag }) },
          ],
          update: (t, L) => { L.mark.position.x = X0 + 3.8 * CM * ss(seg(t, go, go + 2.2)); fadeIn(L, 'w1', t, go + 1.6, .5); fadeIn(L, 'w2', t, nail - .2, .5); },
          cam: [[0, [0, .065, .42, 0, .065, -.1]], [E.dur, [0, .065, .4, 0, .065, -.1]]],
          focus: -.1, aper: 20, grade: { vig: .15 },
        });
      } },

    // 14 · So tonight, look up while it's still this close: the bay again, and the Moon rising back over the sleeping town
    { id: 'S14', start: at('L13') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'shimmer', v: .6 }],
      build: E => layered(E, {
        light: [0, .16, -.13], lightR: .24, lightCol: T.light, sky: { stops: T.sky, stars: 60 }, on: false,
        layers: [
          moonLayer('moon', .03, .175, .03),
          { name: 'town', z: -.11, trans: .25, ...town(.072) },
          { name: 'sea', z: -.1, trans: .35, draw: sea(.07, T.mid) },
          { name: 'trail', z: -.098, ...NOGLOW, glow: 2.8, glowCol: MOONCOL, draw: x => moonTrail(x, { cx: .03, top: .066, n: 26, col: '#0f3a4a' }),
            glowDraw: g => moonTrail(g, { cx: .03, top: .066, n: 26, col: '#fff' }) },
          { name: 'fg', z: -.04, trans: .04, draw: x => { x.fillStyle = '#04101a'; foreground(x, { base: -.06, seed: 5, reedsAt: [.12, .24] }); } },
        ],
        move: { moon: [[0, [0, -.05, 0]], [E.dur * .8, [0, 0, 0]], [E.dur, [0, 0, 0]]] },
        glows: { moon: [[0, .3], [E.dur * .6, 1]], trail: [[0, 0], [E.dur * .4, 0], [E.dur * .9, 1]] },
        cam: [[0, [0, .11, .47, 0, .12, -.1]], [E.dur, [0, .13, .49, 0, .14, -.1]]],
        focus: -.1, aper: 14,
      }) },

    // 15 · A fox with a lantern already is: the fox close on the rocks, lantern lit, looking up at the full Moon. Held to the end.
    { id: 'S15', start: at('L14') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: .3, type: 'shimmer', v: .5 }, { t: .2, type: 'wind', d: 5, v: .25 }],
      build: E => layered(E, {
        light: [.02, .14, -.12], lightR: .22, lightCol: T.light, sky: { stops: T.sky, stars: 70 }, on: false,
        layers: [
          moonLayer('moon', .035, .15, .024),
          { name: 'sea', z: -.11, trans: .35, draw: sea(.05, T.mid) },
          { name: 'trail', z: -.108, ...NOGLOW, glow: 2.6, glowCol: MOONCOL, draw: x => moonTrail(x, { cx: .035, top: .046, n: 22, col: '#0f3a4a' }),
            glowDraw: g => moonTrail(g, { cx: .035, top: .046, n: 22, col: '#fff' }) },
          { name: 'rocks', z: -.08, trans: .1, draw: rocks(-.05, .06, T.near, -1, -.2, .23) },
          foxLayer({ cx: -.06, by: .058, s: .075 }, -.075),
        ],
        flicker: ['fox'],
        cam: [[0, [-.03, .07, .5, -.025, .07, -.09]], [E.dur, [-.02, .075, .48, -.02, .075, -.09]]],
        focus: -.075, aper: 16,
      }) },
  ];
}
