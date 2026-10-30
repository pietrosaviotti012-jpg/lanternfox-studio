// What If the Moon Disappeared Tonight? (What If…, episode 3) — shot list. At midnight the Moon over the bay goes out on
// "disappeared"; the town sleeps and doesn't notice, but the ocean does (hit). Tides: the Earth with its water bulge pulled
// toward the Moon, which shrinks when the Moon goes; by morning the harbour water has dropped and the boat sits low. The night
// gets darker. The turtles, told in three clear steps: they hatch from the nest; on a beach with the sea on the left and the
// town on the right they crawl left, toward the moonlit sea (that's how it used to be); then the Moon is gone, the town lights
// come up and on "town" every hatchling turns away from the water and crawls right (hit). On the reef the corals wait. The turn
// (hit): the Moon is already leaving, 3.8 cm a year (a cream ruler card), so look up while it's close: the Moon rises back over
// the bay and the fox with the lantern sits on the cliff, looking up.
// Redo (2026-10-30): lifted night palette (bright horizon, lighter sheets, warm windows) so every scene reads; every camera
// re-aimed so the Moon, the Earth, the ruler, the corals, the turtles and the fox sit whole inside the frame.
// Motion is off (no zoom snaps): single smooth camera moves, soft dissolves, hard cuts only on the hits.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, houses, dunes, cliff, foreground, starField, boat, moonTrail, turtle, coral, paperMoon } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { waves, waterTop } from './engine/art.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp, TAU } from './engine/lib.js';

const T = theme('what-if', 'notte'), DAWN = theme('what-if', 'alba');
// lifted night: a bright teal horizon behind dark-but-readable sheets
const SKY = [[0, '#0a2440'], [.45, '#174a6c'], [.75, '#2a7890'], [1, '#4c9cae']];
const N = { far: '#3a7a8c', mid: '#24607a', near: '#0e3040', sea: '#1d5a70', line: '#4a94a6' };
const SPACE = [[0, '#081a32'], [.6, '#10305a'], [1, '#1c4a70']];
const DARK = [[0, '#06142a'], [.6, '#0f2c44'], [1, '#1f4c62']];
const REEF = [[0, '#08384a'], [.5, '#13646e'], [1, '#2a9096']];
const WIN = '#ffd88a';                                   // warm window light
const NOGLOW = { trans: 0, shadow: false, recv: false };
const MOONCOL = '#fff0c8';

// the Moon as its own sheet (it can fade, rise or drift away)
const moonLayer = (name, cx, cy, r, z = -.13) => ({ name, z, ...NOGLOW, glow: 3.4, glowCol: MOONCOL, w: r * 2.4, h: r * 2.4, x: cx, y: cy,
  draw: x => paperMoon(x, { cx: 0, cy: 0, r }), glowDraw: g => paperMoon(null, { cx: 0, cy: 0, r }, g) });
// fade a sheet (and its glow) out between t0 and t0 + d
const fadeOut = (L, n, t, t0, d = .6) => { const k = 1 - ss(seg(t, t0, t0 + d)); L[n].visible = k > .01; L[n].material.color.setScalar(k); };
const fadeIn = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); };
// the bay: a sea sheet with a wavy top and paper waves below it
const sea = (base, col, line = N.line, r = .008) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .0015, len: .05 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .005, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
// a town on the far shore, windows lit
const town = (by, seed = 5, col = N.far, h = .035, x0 = -.24, x1 = .24) => ({
  draw: x => { x.fillStyle = col; dunes(x, { x0: -.25, x1: .25, base: by, amp: .003, seed, freq: 5 }); houses(x, { x0, x1, by: by - .004, h, seed, col }); },
  glowDraw: g => houses(null, { x0, x1, by: by - .004, h, seed }, g), glow: 2.6, glowCol: WIN,
});
const rocks = (base, top, col = N.near, side = -1, x0 = -.25, x1 = -.02, seed = 3) => x => { x.fillStyle = col; cliff(x, { x0, x1, base, top, side, seed }); };
const foxLayer = (o, z = -.06, name = 'fox') => ({ name, z, trans: .2, glow: 3.2, w: .2, h: .2, x: o.cx, y: o.by + .05,
  draw: x => fox(x, { ...o, cx: 0, by: -.05, lantern: true }), glowDraw: g => fox(null, { ...o, cx: 0, by: -.05, lantern: true }, g) });
const stars = (n, seed, z = -.135) => ({ name: 'stars', z, ...NOGLOW, glow: 1.8, glowCol: '#e8f4ff',
  draw: x => starField(x, { n, seed, minY: .02, col: '#0a1a28' }), glowDraw: g => starField(null, { n, seed, minY: .02 }, g) });
// a hatchling on its own little sheet (so it can crawl and turn): pale shell, glowing eyes
const hatchling = (name, cx, cy, s, z = -.07) => ({ name, z, trans: .05, glow: 2.2, glowCol: '#ffffff', w: s * 1.6, h: s * 1.6, x: cx, y: cy, shadow: false,
  draw: x => turtle(x, { cx: 0, cy: 0, s, col: '#3a3626', shell: '#7a7050' }), glowDraw: g => turtle(null, { cx: 0, cy: 0, s }, g) });
// the Earth seen from space, with its ocean as a separate sheet that can stretch toward the Moon
const earthLayers = (cx, cy, r) => [
  { name: 'ocean', z: -.1, ...NOGLOW, glow: 2.2, glowCol: '#8fe8f4', w: r * 3, h: r * 3, x: cx, y: cy,
    draw: x => { x.fillStyle = '#2a8aa8'; x.beginPath(); x.arc(0, 0, r * 1.08, 0, TAU); x.fill(); },
    glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = r * .05; g.beginPath(); g.arc(0, 0, r * 1.06, 0, TAU); g.stroke(); } },
  { name: 'earth', z: -.098, trans: .4, w: r * 2.2, h: r * 2.2, x: cx, y: cy,
    draw: x => { x.fillStyle = '#2678a0'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
      x.fillStyle = '#4a9a5a'; for (const [u, v, a, b] of [[-.35, .3, .3, .22], [.3, -.2, .25, .35], [-.1, -.5, .2, .12], [.4, .45, .15, .1]]) { x.beginPath(); x.ellipse(u * r, v * r, a * r, b * r, .4, 0, TAU); x.fill(); } } },
];
// the bay of the hook and of the end: Moon, town on the far shore, sea with the moon trail
const bay = (mx, my, mr) => [
  moonLayer('moon', mx, my, mr),
  { name: 'town', z: -.11, trans: .3, ...town(.088) },
  { name: 'sea', z: -.1, trans: .35, draw: sea(.086, N.sea) },
  { name: 'trail', z: -.098, ...NOGLOW, glow: 2.8, glowCol: MOONCOL, draw: x => moonTrail(x, { cx: mx, top: .082, n: 26, col: '#2a6a7a' }),
    glowDraw: g => moonTrail(g, { cx: mx, top: .082, n: 26, col: '#fff' }) },
];
// the hatchling beach: sea on the left, town on the right, a sand slope in front (low at the water, high at the town)
const BEACH_H = [[.0, .05], [.012, .044], [.024, .054], [.036, .046], [.048, .052]];
const beachLayers = moonOn => [
  ...(moonOn ? [moonLayer('moon', -.06, .14, .022)] : [stars(140, 23)]),
  { name: 'sea', z: -.12, trans: .3, draw: x => { x.save(); x.beginPath(); x.rect(-.25, -.45, .23, .9); x.clip(); sea(.092, moonOn ? N.sea : '#0f3446', moonOn ? N.line : '#245a6a')(x); x.restore(); } },
  ...(moonOn ? [{ name: 'trail', z: -.118, ...NOGLOW, glow: 2.8, glowCol: MOONCOL, draw: x => moonTrail(x, { cx: -.06, top: .089, n: 18, col: '#2a6a7a' }),
    glowDraw: g => moonTrail(g, { cx: -.06, top: .089, n: 18, col: '#fff' }) }] : []),
  { name: 'town', z: -.115, trans: .3, ...town(.088, 14, '#2a4a5a', .03, .0, .24) },
  { name: 'sand', z: -.1, trans: .15, draw: x => { x.fillStyle = '#5a5440'; x.beginPath(); x.moveTo(-.25, .05); x.lineTo(-.02, .062); x.lineTo(.25, .084); x.lineTo(.25, -.45); x.lineTo(-.25, -.45); x.closePath(); x.fill(); } },
  ...BEACH_H.map(([hx, hy], i) => hatchling('h' + i, hx, hy, .02, -.09 + i * .0005)),
  { name: 'fg', z: -.06, trans: .05, draw: x => { x.fillStyle = '#2a2820'; dunes(x, { x0: -.25, x1: .25, base: -.02, amp: .008, seed: 7, grass: 14 }); } },
];
const BEACH_CAM = E => [[0, [-.01, .03, .5, -.005, .03, -.1]], [E.dur, [.01, .032, .48, .005, .032, -.1]]];

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
          light: [0, .16, -.13], lightR: .26, lightCol: T.light, amb: .45, sky: { stops: SKY, stars: 60 }, on: false,
          layers: [
            ...bay(.035, .19, .03),
            { name: 'rocks', z: -.07, trans: .1, draw: rocks(-.02, .1, N.near, -1, -.2, .1) },
            foxLayer({ cx: -.06, by: .1, s: .045 }, -.068),
            { name: 'fg', z: -.04, trans: .04, draw: x => { x.fillStyle = '#06182a'; foreground(x, { base: -.08, seed: 5, reedsAt: [.12, .24] }); } },
          ],
          glows: { moon: [[0, 1], [gone, 1], [gone + .6, 0]], trail: [[0, 1], [gone + .1, 1], [gone + .7, 0]] },
          flicker: ['fox'],
          update: (t, L) => { fadeOut(L, 'moon', t, gone, .6); },
          cam: [[0, [-.005, .1, .56, -.005, .095, -.1]], [E.dur, [0, .095, .53, 0, .09, -.1]]],
          focus: -.1, aper: 14,
        });
      } },

    // 2 · Most people wouldn't notice: the town up close, rooftops and windows, one by one the lights go out (everyone asleep).
    //     A slow truck along the street.
    { id: 'S2', start: at('L02') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'click', v: .3 }, { t: 1.1, type: 'click', v: .25 }],
      build: E => layered(E, {
        light: [0, .14, -.12], lightR: .22, lightCol: T.light, amb: .45, sky: { stops: SKY, stars: 90 }, on: false,
        layers: [
          { name: 'far', z: -.12, trans: .3, ...town(.09, 8, N.far, .03) },
          { name: 'near', z: -.09, trans: .25, ...town(.06, 11, N.mid, .05) },
          { name: 'fg', z: -.05, trans: .05, draw: x => { x.fillStyle = N.near; dunes(x, { x0: -.25, x1: .25, base: .02, amp: .006, seed: 4, grass: 10 }); } },
        ],
        glows: { far: [[0, 1], [E.dur * .4, .45]], near: [[0, 1], [E.dur * .55, 1], [E.dur * .9, .4]] },
        cam: [[0, [-.02, .065, .5, -.015, .06, -.1]], [E.dur, [.02, .065, .5, .015, .06, -.1]]],
        focus: -.09, aper: 16,
      }) },

    // 3 · But the ocean would (hit): a hard cut to the open sea, three sheets of waves rolling against each other, a lone boat
    //     riding them, no moon in the sky. Low camera, slow pan.
    { id: 'S3', start: at('L03') - .1, sfx: [{ t: 0, type: 'whoosh', v: .6 }, { t: .1, type: 'wind', d: 3, v: .45 }],
      build: E => layered(E, {
        light: [0, .14, -.13], lightR: .28, lightCol: '#bfe8ff', key: .9, amb: .45, sky: { stops: DARK, stars: 120 }, on: false,
        layers: [
          { name: 'w1', z: -.12, trans: .35, draw: sea(.085, '#1f5a6c', '#5aa0b0') },
          { name: 'boat', z: -.105, trans: .05, w: .06, h: .06, x: .015, y: .1, draw: x => { x.fillStyle = '#06182a'; boat(x, { cx: 0, by: -.015, s: .04 }); } },
          { name: 'w2', z: -.1, trans: .3, draw: sea(.075, '#174a5c', '#4a90a0', .011) },
          { name: 'w3', z: -.08, trans: .25, draw: sea(.05, '#0e3444', '#3a7a8a', .014) },
        ],
        update: (t, L) => {
          L.w1.position.x = L.w1.userData.p0.x + .006 * Math.sin(t * 1.1);
          L.w2.position.x = L.w2.userData.p0.x - .008 * Math.sin(t * 1.3 + 1);
          L.w3.position.x = L.w3.userData.p0.x + .01 * Math.sin(t * .9 + 2); L.w3.position.y = L.w3.userData.p0.y + .003 * Math.sin(t * 1.7);
          L.boat.position.y = L.boat.userData.p0.y + .004 * Math.sin(t * 1.7 + .8); L.boat.rotation.z = .08 * Math.sin(t * 1.5);
        },
        cam: [[0, [-.015, .065, .47, -.01, .065, -.1]], [E.dur, [.015, .065, .47, .01, .065, -.1]]],
        focus: -.1, aper: 14,
      }) },

    // 4 · Two thirds of the pull: the Earth from space, its ocean stretched into a bulge toward the Moon (the card says ⅔ / ⅓).
    //     Slow orbit-like truck.
    { id: 'S4', start: at('L04') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'shimmer', v: .5 }],
      build: E => {
        const pull = E.word('L04', 4);
        return layered(E, {
          light: [0, .1, -.13], lightR: .32, lightCol: '#cfeaff', amb: .5, sky: { stops: SPACE, stars: 140 }, on: false,
          layers: [
            moonLayer('moon', .055, .15, .016, -.12),
            ...earthLayers(-.035, .085, .04),
          ],
          glows: { moon: [[0, 1]], ocean: [[0, .6], [pull, .6], [pull + .8, 1]] },
          update: (t, L) => { const k = 1 + .22 * ss(seg(t, pull - .2, pull + 1)); L.ocean.scale.set(k, 1 / Math.sqrt(k), 1);
            L.ocean.rotation.z = Math.atan2(.15 - .085, .055 + .035); },
          cam: [[0, [-.015, .04, .55, -.005, .04, -.1]], [E.dur, [.015, .04, .55, .005, .04, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 5 · Without it, every tide shrinks to a third: the same Earth, the Moon gone, the bulge slowly sinking back into a circle
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .3, type: 'whoosh', v: .4 }],
      build: E => {
        const go = E.word('L05', 0);
        return layered(E, {
          light: [0, .1, -.13], lightR: .32, lightCol: '#cfeaff', amb: .5, sky: { stops: SPACE, stars: 140 }, on: false,
          layers: [
            moonLayer('moon', .055, .15, .016, -.12),
            ...earthLayers(-.035, .085, .04),
          ],
          glows: { moon: [[0, 1], [go, 1], [go + .5, 0]], ocean: [[0, 1], [go + .5, 1], [E.dur, .5]] },
          update: (t, L) => { fadeOut(L, 'moon', t, go, .5); const k = 1.22 - .2 * ss(seg(t, go + .3, E.dur - .3)); L.ocean.scale.set(k, 1 / Math.sqrt(k), 1);
            L.ocean.rotation.z = Math.atan2(.15 - .085, .055 + .035); },
          cam: [[0, [.015, .04, .55, .005, .04, -.1]], [E.dur, [0, .04, .52, 0, .04, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 6 · By morning, the harbour: dawn light, a jetty, a boat whose water drains away until it sits low on the mud
    { id: 'S6', start: mid('L05', .55), in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'paper', v: .4 }],
      build: E => layered(E, {
        light: [0, .15, -.13], lightR: .3, lightCol: DAWN.light, key: 1, amb: .45, sky: { stops: DAWN.sky }, on: false,
        layers: [
          { name: 'far', z: -.12, trans: .3, ...town(.085, 3, DAWN.far, .03) },
          { name: 'mud', z: -.1, trans: .1, draw: x => { x.fillStyle = '#4a4636'; dunes(x, { x0: -.25, x1: .25, base: .035, amp: .004, seed: 6, freq: 6 }); } },
          { name: 'boat', z: -.095, trans: .05, w: .08, h: .08, x: .02, y: .075, draw: x => { x.fillStyle = DAWN.near; boat(x, { cx: 0, by: -.02, s: .055 }); } },
          { name: 'water', z: -.093, trans: .3, draw: sea(.06, DAWN.mid, '#7ab8bc', .009) },
          { name: 'jetty', z: -.08, trans: .05, draw: x => { x.fillStyle = DAWN.near; x.fillRect(-.25, .075, .19, .006);
            for (let i = 0; i < 4; i++) x.fillRect(-.22 + i * .045, -.2, .006, .28); } },
        ],
        move: { water: [[0, [0, 0, 0]], [E.dur, [0, -.035, 0]]], boat: [[0, [0, 0, 0]], [E.dur * .8, [0, -.03, -.06]], [E.dur, [0, -.03, -.06]]] },
        cam: [[0, [.015, .035, .5, .01, .035, -.1]], [E.dur, [-.01, .03, .5, -.005, .03, -.1]]],
        focus: -.095, aper: 16,
      }) },

    // 7 · A hundred times darker: back to night, the village under a sky with no moon; the hills dim down, the stars come up,
    //     the windows stay lit so the village still reads
    { id: 'S7', start: at('L06') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'wind', d: 4, v: .3 }],
      build: E => {
        const dk = E.word('L06', 7);
        return layered(E, {
          light: [0, .12, -.13], lightR: .22, lightCol: T.light, key: .8, amb: .45, sky: { stops: SKY }, on: false,
          layers: [
            stars(160, 17),
            { name: 'hills', z: -.11, trans: .25, draw: x => { x.fillStyle = N.far; dunes(x, { x0: -.25, x1: .25, base: .095, amp: .012, seed: 9, freq: 7 }); } },
            { name: 'town', z: -.095, trans: .25, ...town(.07, 21, N.mid, .03) },
            { name: 'fg', z: -.06, trans: .05, draw: x => { x.fillStyle = N.near; foreground(x, { base: .02, seed: 8, reedsAt: [-.22, -.1] }); } },
          ],
          glows: { stars: [[0, .3], [dk - .3, .3], [dk + 1, 1]], town: [[0, 1]] },
          grade: t => ({ expo: 1.1 - .18 * ss(seg(t, dk - .4, dk + .9)) }),
          cam: [[0, [0, .055, .5, 0, .055, -.1]], [E.dur, [0, .065, .48, 0, .065, -.1]]],
          focus: -.1, aper: 14,
        });
      } },

    // 8 · On a beach in Florida, the hatchlings: moonless sand seen from above, a nest in the middle, five baby turtles
    //     pushing out of it one by one, big enough to read
    { id: 'S8', start: at('L07') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'paper', v: .5 }, { t: 1.2, type: 'paper', v: .4 }],
      build: E => {
        const H = [[-.032, .11], [-.008, .135], [.022, .115], [.036, .145], [.004, .095]];
        return layered(E, {
          light: [0, .12, -.1], lightR: .26, lightCol: '#e2ecff', key: .9, amb: .55, sky: { stops: DARK }, on: false,
          layers: [
            { name: 'sand', z: -.1, trans: .15, draw: x => { x.fillStyle = '#6a624c'; x.fillRect(-.25, -.45, .5, .9);
              x.fillStyle = '#5a5340'; const R = (i => () => (i = (i * 9301 + 49297) % 233280) / 233280)(7); for (let i = 0; i < 260; i++) { x.beginPath(); x.arc((R() - .5) * .33, (R() - .5) * .58, .0015 + R() * .002, 0, TAU); x.fill(); } } },
            { name: 'nest', z: -.098, trans: .1, draw: x => { x.fillStyle = '#3e3a2c'; x.beginPath(); x.ellipse(0, .115, .055, .026, 0, 0, TAU); x.fill(); } },
            ...H.map(([hx, hy], i) => hatchling('h' + i, hx, hy, .03, -.095 + i * .0005)),
          ],
          update: (t, L) => H.forEach(([hx, hy], i) => { const m = L['h' + i], u = Math.max(0, t - .3 - i * .35);
            fadeIn(L, 'h' + i, t, .2 + i * .35, .5);
            m.position.y = hy + .005 * u; m.rotation.z = .25 * Math.sin(u * 3 + i); }),
          cam: [[0, [0, .08, .45, 0, .08, -.1]], [E.dur, [0, .085, .43, 0, .085, -.1]]],
          focus: -.097, aper: 18,
        });
      } },

    // 9 · They crawl toward the brightest light; that used to be the moonlit sea: a wide beach, the sea and the Moon on the
    //     left, the town dim on the right; every hatchling heads left, down to the moon trail on the water
    { id: 'S9', start: at('L08') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: 3, v: .3 }, { t: .5, type: 'paper', v: .4 }],
      build: E => layered(E, {
        light: [-.06, .12, -.13], lightR: .22, lightCol: '#e8f0ff', key: .85, amb: .5, sky: { stops: SKY, stars: 60 }, on: false,
        layers: beachLayers(true),
        glows: { town: [[0, .25]], moon: [[0, 1]], trail: [[0, 1]] },
        update: (t, L) => BEACH_H.forEach(([hx, hy], i) => { const m = L['h' + i];
          m.rotation.z = Math.PI / 2 + .12 * Math.sin(t * 3 + i); m.position.x = hx - .006 * t; }),
        cam: BEACH_CAM(E),
        focus: -.095, aper: 16,
      }) },

    // 10 · Tonight, it's the town (hit): the same beach, no Moon, the sea black; the town's windows blaze up and on "town" every
    //      hatchling turns its back on the water and crawls right, toward the lights
    { id: 'S10', start: at('L10') - .1, sfx: [{ t: 0, type: 'whoosh', v: .5 }, { t: .6, type: 'click', v: .4 }],
      build: E => {
        const turn = E.word('L10', 3);
        return layered(E, {
          light: [.08, .11, -.13], lightR: .22, lightCol: '#ffd9a0', key: .85, amb: .45, sky: { stops: DARK }, on: false,
          layers: beachLayers(false),
          glows: { town: [[0, .3], [turn - .5, 1]], stars: [[0, .6]] },
          update: (t, L) => BEACH_H.forEach(([hx, hy], i) => { const m = L['h' + i], k = ss(seg(t, turn - .2 + i * .08, turn + .5 + i * .08)), u = Math.max(0, t - turn - .4);
            m.rotation.z = lerp(Math.PI / 2, -Math.PI / 2, k) + .12 * Math.sin(t * 3 + i); m.position.x = hx - .02 + .01 * u; }),
          cam: [[0, [0, .03, .5, 0, .03, -.1]], [E.dur, [.012, .032, .49, .008, .032, -.1]]],
          focus: -.095, aper: 16,
        });
      } },

    // 11 · On the reef, the corals wait: underwater, teal, corals with their polyps glowing and pulsing, waiting. A slow drift down.
    { id: 'S11', start: at('L11') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'shimmer', v: .4 }],
      build: E => layered(E, {
        light: [0, .2, -.13], lightR: .32, lightCol: '#a8eef4', key: .9, amb: .55, ambCol: '#5ab4c4', sky: { stops: REEF }, on: false,
        layers: [
          { name: 'c1', z: -.12, trans: .25, glow: 2.4, glowCol: T.em, draw: x => { x.fillStyle = '#145060'; dunes(x, { x0: -.25, x1: .25, base: .05, amp: .01, seed: 4 }); coral(x, { cx: .035, by: .05, s: .075, col: '#1c5e6c', seed: 2 }); },
            glowDraw: g => coral(null, { cx: .035, by: .05, s: .075, seed: 2 }, g) },
          { name: 'c2', z: -.1, trans: .25, glow: 2.6, glowCol: T.em, draw: x => { coral(x, { cx: -.03, by: .035, s: .09, col: '#1a5664', seed: 5 }); },
            glowDraw: g => coral(null, { cx: -.03, by: .035, s: .09, seed: 5 }, g) },
          { name: 'floor', z: -.08, trans: .1, draw: x => { x.fillStyle = '#0a2c38'; dunes(x, { x0: -.25, x1: .25, base: .03, amp: .008, seed: 11, grass: 16 });
            coral(x, { cx: .02, by: .026, s: .045, col: '#0a2c38', seed: 9, n: 5 }); } },
        ],
        update: (t, L) => { L.c1.material.userData.u.uGlowLit.value = .55 + .25 * Math.sin(t * 2); L.c2.material.userData.u.uGlowLit.value = .55 + .25 * Math.sin(t * 2 + 1.4); },
        cam: [[0, [0, .045, .58, 0, .045, -.1]], [E.dur, [.004, .038, .56, .002, .038, -.1]]],
        focus: -.1, aper: 14,
      }) },

    // 12 · But here's the strange part: the fox alone on the cliff edge, her lantern the warmest light; she looks up
    { id: 'S12', start: at('L12') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'wind', d: 3, v: .3 }],
      build: E => layered(E, {
        light: [-.02, .1, -.1], lightR: .16, lightCol: '#ffc27a', key: .8, amb: .45, sky: { stops: SKY, stars: 160 }, on: false,
        layers: [
          { name: 'sea', z: -.12, trans: .3, draw: sea(.06, N.sea) },
          { name: 'rocks', z: -.08, trans: .1, draw: rocks(-.05, .06, N.near, -1, -.2, .23) },
          foxLayer({ cx: -.025, by: .058, s: .07 }, -.075),
        ],
        flicker: ['fox'],
        cam: [[0, [-.005, .05, .47, -.005, .055, -.08]], [E.dur, [0, .052, .45, 0, .057, -.08]]],
        focus: -.075, aper: 16,
      }) },

    // 13 · The Moon is already leaving (hit): a hard cut to space, the Earth and the Moon; the Moon slides slowly away along a
    //      dotted line
    { id: 'S13', start: at('L13') - .1, sfx: [{ t: 0, type: 'whoosh', v: .6 }, { t: .1, type: 'shimmer', v: .5 }],
      build: E => {
        const lv = E.word('L13', 4);
        const D = [[-.04, .085], [.06, .15]];
        return layered(E, {
          light: [0, .1, -.13], lightR: .32, lightCol: '#cfeaff', amb: .5, sky: { stops: SPACE, stars: 160 }, on: false,
          layers: [
            ...earthLayers(-.04, .085, .03),
            moonLayer('moon', .03, .13, .012, -.11),
            { name: 'dots', z: -.105, ...NOGLOW, glow: 1.6, glowCol: T.em, w: .3, h: .3, x: 0, y: 0,
              draw: x => { x.fillStyle = '#2a4a60'; for (let i = 0; i < 30; i++) { x.beginPath(); x.arc(lerp(D[0][0], D[1][0], i / 29), lerp(D[0][1], D[1][1], i / 29), .0011, 0, TAU); x.fill(); } },
              glowDraw: g => { g.fillStyle = '#fff'; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(lerp(D[0][0], D[1][0], i / 29), lerp(D[0][1], D[1][1], i / 29), .0011, 0, TAU); g.fill(); } } },
          ],
          glows: { moon: [[0, 1]], ocean: [[0, .8]], dots: [[0, 0], [lv - .2, 0], [lv + .4, .8]] },
          move: { moon: [[0, [0, 0, 0]], [lv, [0, 0, 0]], [E.dur, [.03, .017, 0]]] },
          cam: [[0, [-.005, .05, .5, -.005, .05, -.1]], [E.dur, [.005, .052, .52, .005, .052, -.1]]],
          focus: -.105, aper: 12,
        });
      } },

    // 14 · 3.8 cm a year, as fast as your fingernails grow: the cream card (a pause from the dark): the words on top, a paper
    //      ruler under them, a yellow marker sliding from 0 to 3.8. Flat, still, inside the margins (captions off on this line).
    { id: 'S14', start: at('L14') - .2, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .2, type: 'paper', v: .6 }, { t: 1.4, type: 'click', v: .4 }],
      build: E => {
        const go = E.cue('L14') + .2, nail = E.word('L14', 10);
        const X0 = -.06, CM = .03;
        return layered(E, {
          light: [0, .1, -.12], lightR: .3, lightCol: '#fff4e0', key: 1, amb: .8, ambCol: '#fff4e0', sky: { stops: [[0, '#efe8d8'], [1, '#efe8d8']] }, on: false,
          layers: [
            { name: 'card', z: -.12, trans: .05, draw: x => { x.fillStyle = '#efe8d8'; x.fillRect(-.25, -.45, .5, .9); } },
            { name: 'ruler', z: -.1, trans: .05, draw: x => { x.fillStyle = '#d8c89a'; x.fillRect(-.078, .085, .156, .035); x.fillStyle = '#2a2418';
              for (let i = 0; i <= 40; i++) { const h = i % 10 === 0 ? .014 : i % 5 === 0 ? .009 : .005; x.fillRect(X0 + i * CM / 10 - .0004, .12 - h, .0008, h); }
              for (let i = 0; i <= 4; i++) text(x, String(i), X0 + i * CM, .092, .007, '"Anton"', { fill: '#2a2418' }); } },
            { name: 'mark', z: -.098, trans: 0, shadow: false, w: .02, h: .06, x: X0, y: .105, draw: x => { x.fillStyle = T.tag; x.fillRect(-.0015, -.025, .003, .045);
              x.beginPath(); x.moveTo(-.006, .022); x.lineTo(.006, .022); x.lineTo(0, .014); x.closePath(); x.fill(); } },
            { name: 'w1', z: -.098, ...NOGLOW, w: .3, h: .04, x: 0, y: .175, draw: x => text(x, '3.8 CM A YEAR', 0, 0, .018, '"Anton"', { fill: '#1a1a1a' }) },
            { name: 'w2', z: -.098, ...NOGLOW, w: .3, h: .04, x: 0, y: .148, draw: x => text(x, '≈ YOUR FINGERNAILS', 0, 0, .011, '"Anton"', { fill: T.tag }) },
          ],
          update: (t, L) => { L.mark.position.x = X0 + 3.8 * CM * ss(seg(t, go, go + 2.2)); fadeIn(L, 'w1', t, go + 1.6, .5); fadeIn(L, 'w2', t, nail - .2, .5); },
          cam: [[0, [0, .08, .6, 0, .08, -.1]]],
          focus: -.1, aper: 20, grade: { vig: .15 },
        });
      } },

    // 15 · So tonight, look up while it's still this close: the bay again, and the Moon rising back over the sleeping town
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'shimmer', v: .6 }],
      build: E => layered(E, {
        light: [0, .16, -.13], lightR: .26, lightCol: T.light, amb: .45, sky: { stops: SKY, stars: 60 }, on: false,
        layers: [
          ...bay(.035, .19, .03),
          { name: 'fg', z: -.04, trans: .04, draw: x => { x.fillStyle = '#06182a'; foreground(x, { base: -.08, seed: 5, reedsAt: [.12, .24] }); } },
        ],
        move: { moon: [[0, [0, -.06, 0]], [E.dur * .8, [0, 0, 0]], [E.dur, [0, 0, 0]]] },
        glows: { moon: [[0, .4], [E.dur * .6, 1]], trail: [[0, 0], [E.dur * .4, 0], [E.dur * .9, 1]] },
        cam: [[0, [0, .085, .55, 0, .085, -.1]], [E.dur, [0, .095, .57, 0, .095, -.1]]],
        focus: -.1, aper: 14,
      }) },

    // 16 · A fox with a lantern already is: the fox close on the rocks, lantern lit, looking up at the full Moon. Held to the end.
    { id: 'S16', start: at('L16') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: .3, type: 'shimmer', v: .5 }, { t: .2, type: 'wind', d: 5, v: .25 }],
      build: E => layered(E, {
        light: [.02, .14, -.12], lightR: .24, lightCol: T.light, amb: .45, sky: { stops: SKY, stars: 70 }, on: false,
        layers: [
          moonLayer('moon', .05, .16, .022),
          { name: 'sea', z: -.11, trans: .35, draw: sea(.06, N.sea) },
          { name: 'trail', z: -.108, ...NOGLOW, glow: 2.6, glowCol: MOONCOL, draw: x => moonTrail(x, { cx: .05, top: .056, n: 22, col: '#2a6a7a' }),
            glowDraw: g => moonTrail(g, { cx: .05, top: .056, n: 22, col: '#fff' }) },
          { name: 'rocks', z: -.08, trans: .1, draw: rocks(-.05, .06, N.near, -1, -.2, .23) },
          foxLayer({ cx: -.025, by: .058, s: .075 }, -.075),
        ],
        flicker: ['fox'],
        cam: [[0, [0, .05, .5, 0, .055, -.09]], [E.dur, [0, .053, .48, 0, .056, -.09]]],
        focus: -.075, aper: 16,
      }) },
  ];
}
