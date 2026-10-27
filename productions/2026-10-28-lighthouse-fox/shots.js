// The Lighthouse Fox — shot list. Starts are anchored to narration lines (C), effects to spoken words (E.word).
import { layered } from './engine/kit/shot.js';
import { fox, hangLantern, lighthouse, cliff, dunes, rain, boat, keeper, stairs, window_ } from './engine/kit/motifs.js';
import { waves, waterTop, ridge, reeds } from './engine/art.js';
import { text } from './engine/paper.js';
import { aim } from './engine/stage.js';
import { seg, ss, lerp } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const STORM = [[0, '#06091a'], [.55, '#111a35'], [1, '#22304f']];
const MOON = [-.085, .2, -.135];

const seaFar = (col, base = -.03) => x => { x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .0008, len: .03 }); };
const seaNear = (col, line, base, r = .009) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .002, len: .045 });
  x.save(); x.beginPath(); x.rect(-.25, -.4, .5, base + .395); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .006, y1: -.4, r, fill: col, line, lw: .0007 }); x.restore();
};

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook: the lamp turns on, the one lit window
    { id: 'S1', start: 0, sfx: [{ t: .3, type: 'click' }, { t: .5, type: 'shimmer' }, { t: 0, type: 'waves', d: at('L03') }],
      build: E => layered(E, {
        light: MOON, lightR: .22, sky: { stops: NIGHT, stars: 160 }, moon: { x: MOON[0], y: MOON[1], r: .026 },
        on: { at: .2, stagger: .34 },
        layers: [
          { name: 'far', z: -.11, trans: .7, draw: seaFar('#6a86c2', -.02) },
          { name: 'sea', z: -.09, trans: .45, draw: seaNear('#3f5a92', '#4f6aa6', -.055) },
          { name: 'cliff', z: -.065, trans: .25, glow: 2.6, draw: x => { x.fillStyle = '#1b284f'; cliff(x, { x0: -.02, x1: .25, base: -.13, top: .02, side: 1 }); lighthouse(x, { cx: .1, by: .018, h: .2, col: '#1b284f' }); },
            glowDraw: g => lighthouse(null, { cx: .1, by: .018, h: .2 }, g) },
          { name: 'fg', z: -.02, trans: .05, draw: x => { x.fillStyle = '#0e1532'; x.strokeStyle = '#0e1532'; ridge(x, { x0: -.25, x1: .25, base: -.2, amp: .01, seed: 3, freq: 18 }); reeds(x, { x0: -.2, x1: -.05, by: -.205, h: .05, n: 30, seed: 8 }); } },
        ],
        glows: { cliff: [[0, 0], [E.word('L01', 9) - .3, 0], [E.word('L01', 9) + .5, 1]] },
        cam: [[0, [0, -.03, .8, 0, -.03, -.07]], [E.dur, [.025, .03, .64, .04, .045, -.07]]],
        focus: [[0, -.02], [3, -.065]], aper: 14,
      }) },

    // 2 · Not for the ships: a lone boat sails down behind the horizon
    { id: 'S2', start: at('L02') - .4, in: { type: 'dissolve', dur: .9 }, sfx: [{ t: .4, type: 'whoosh', v: .4 }],
      build: E => layered(E, {
        light: [-.08, .3, -.13], lightR: .3, sky: { stops: NIGHT, stars: 120 }, on: false,   // no moon: it would double up with S1's in the dissolve
        layers: [
          { name: 'far', z: -.115, trans: .7, draw: seaFar('#6a86c2', -.035) },
          { name: 'boat', z: -.105, trans: .5, draw: x => { x.fillStyle = '#4a64a0'; boat(x, { cx: -.02, by: -.036, s: .05 }); } },
          { name: 'sea', z: -.09, trans: .45, draw: seaNear('#3f5a92', '#4f6aa6', -.045) },
          { name: 'cliff', z: -.075, trans: .25, glow: 2.2, draw: x => { x.fillStyle = '#1b284f'; cliff(x, { x0: .08, x1: .26, base: -.09, top: .0, side: 1 }); lighthouse(x, { cx: .14, by: -.002, h: .11, col: '#1b284f' }); },
            glowDraw: g => lighthouse(null, { cx: .14, by: -.002, h: .11 }, g) },
          { name: 'fg', z: -.02, trans: .05, draw: seaNear('#0e1532', '#18224a', -.17, .012) },
        ],
        move: { boat: [[0, [0, 0, 0]], [E.cueEnd('L03'), [.05, -.05, .04]]] },
        cam: [[0, [-.03, 0, .76, -.03, 0, -.07]], [E.dur, [.03, .005, .76, .03, .005, -.07]]],
        focus: -.1, aper: 12,
      }) },

    // 3 · The fox in the dunes, looking up at the lit window
    { id: 'S3', start: at('L04') - .4, in: { type: 'dissolve', dur: 1.0 }, sfx: [{ t: 0, type: 'wind', d: 6, v: .4 }],
      build: E => layered(E, {
        light: [.08, .14, -.12], lightR: .2, sky: { stops: NIGHT, stars: 140 }, moon: { x: -.1, y: .22, r: .02 }, on: false,
        layers: [
          { name: 'far', z: -.115, trans: .7, draw: seaFar('#6a86c2', .04) },
          { name: 'lh', z: -.1, trans: .45, glow: 2.6, draw: x => { x.fillStyle = '#3f5a92'; cliff(x, { x0: .0, x1: .26, base: .0, top: .07, side: 1 }); lighthouse(x, { cx: .095, by: .068, h: .15, col: '#3f5a92' }); },
            glowDraw: g => lighthouse(null, { cx: .095, by: .068, h: .15 }, g) },
          { name: 'd1', z: -.075, trans: .3, draw: x => { x.fillStyle = '#2b3f78'; dunes(x, { x0: -.25, x1: .25, base: -.06, amp: .014, seed: 4, grass: 10 }); } },
          { name: 'd2', z: -.055, trans: .15, draw: x => { x.fillStyle = '#1b284f'; dunes(x, { x0: -.25, x1: .25, base: -.115, amp: .01, seed: 7, freq: 7, grass: 14 }); } },
          { name: 'fox', z: -.05, trans: .2, shadow: true, draw: x => fox(x, { cx: -.035, by: -.118, s: .062 }) },
          { name: 'fg', z: -.015, trans: .05, draw: x => { x.fillStyle = '#0e1532'; x.strokeStyle = '#0e1532'; ridge(x, { x0: -.25, x1: .25, base: -.21, amp: .008, seed: 2 }); reeds(x, { x0: .02, x1: .2, by: -.215, h: .06, n: 34, seed: 5, sway: .1 }); } },
        ],
        move: { fox: [[0, [0, 0, 0]], [E.cue('L05'), [0, 0, 0]], [E.cue('L05') + .6, [0, -.002, .05]]] },   // the head tilts up toward the light
        update: (t, L) => { L.fg.rotation.z = .004 * Math.sin(t * 1.3); },
        cam: [[0, [-.02, -.1, .6, -.025, -.095, -.07]], [E.cue('L05'), [-.01, -.07, .63, -.005, -.06, -.07]], [E.dur, [.03, .04, .68, .07, .09, -.07]]],
        focus: [[0, -.05], [E.cue('L05') + .5, -.05], [E.dur, -.1]], aper: 18,
      }) },

    // 4 · The storm: rain, lightning, the light goes out on "out"
    { id: 'S4', start: at('L06') - .5, in: { type: 'dissolve', dur: .6 },
      sfx: [{ t: 0, type: 'rain', d: end('L07') - at('L06') + 1.6 }, { t: .2, type: 'wind', d: 5, v: 1 }, { t: C.L06.dur + .5, type: 'thunder' }, { t: at('L07') - at('L06') + .5 + C.L07.dur * .45, type: 'crack' }],
      build: E => layered(E, {
        light: [.09, .08, -.13], lightR: .16, lightCol: '#cfe0ff', key: .7, amb: .22, ambCol: '#6f80b0',
        sky: { stops: STORM, stars: 0, gain: .9 }, on: false,
        layers: [
          { name: 'far', z: -.115, trans: .55, draw: seaNear('#2a3a66', '#34467a', -.0, .014) },
          { name: 'lh', z: -.09, trans: .3, glow: 2.8, draw: x => { x.fillStyle = '#0f1630'; cliff(x, { x0: -.02, x1: .26, base: -.12, top: .01, side: 1 }); lighthouse(x, { cx: .09, by: .008, h: .19, col: '#0f1630' }); },
            glowDraw: g => lighthouse(null, { cx: .09, by: .008, h: .19 }, g) },
          { name: 'waves', z: -.06, trans: .2, draw: seaNear('#16203f', '#22305a', -.1, .016) },
          { name: 'rain1', z: -.04, h: 1.16, trans: .5, shadow: false, recv: false, draw: x => { x.strokeStyle = '#8fa2d0'; rain(x, { w: .33, h: 1.16, n: 420, seed: 3 }); } },
          { name: 'rain2', z: -.01, h: 1.16, trans: .5, shadow: false, recv: false, draw: x => { x.strokeStyle = '#a9b8de'; rain(x, { w: .33, h: 1.16, n: 260, seed: 9, len: .03 }); } },
        ],
        scroll: { rain1: [-.03, -.55], rain2: [-.05, -.9] },
        glows: { lh: [[0, 1], [E.word('L07', 7) - .4, 1], [E.word('L07', 7) - .25, .3], [E.word('L07', 7) - .12, .9], [E.word('L07', 7) + .05, 0], [E.dur, 0]] },
        flicker: ['lh'],
        flash: [E.cue('L06') + C.L06.dur + .5, E.cue('L07') + C.L07.dur * .45, E.cue('L07') + C.L07.dur * .45 + .35],
        update: (t, L) => { L.waves.position.y = L.waves.userData.p0.y + .004 * Math.sin(t * 1.7); L.far.position.y = L.far.userData.p0.y + .003 * Math.sin(t * 1.3 + 1); },
        cam: [[0, [-.01, -.02, .72, 0, -.01, -.07]], [E.dur, [.02, .02, .64, .06, .04, -.07]]],
        focus: -.09, aper: 12, grade: { sat: .78, contrast: .16, lift: [0, .006, .03], gain: [.95, 1, 1.06] },
      }) },

    // 5 · The keeper in the dark, by the round window
    { id: 'S5', start: at('L08') - .5, in: { type: 'dissolve', dur: 1.2 }, sfx: [{ t: 0, type: 'rain', d: at('L09') - at('L08') + 1.5, v: .35 }],
      build: E => layered(E, {
        light: [.05, .09, -.12], lightR: .2, lightCol: '#b8c6ee', key: .6, amb: .28, ambCol: '#6a78a8', on: false,
        sky: { stops: STORM, gain: .7 },
        layers: [
          { name: 'out', z: -.12, trans: .5, draw: seaNear('#2a3a66', '#34467a', .05, .012) },
          { name: 'rain', z: -.11, h: 1.16, trans: .5, shadow: false, recv: false, draw: x => { x.strokeStyle = '#7f92c4'; rain(x, { w: .33, h: 1.16, n: 300, seed: 5 }); } },
          { name: 'wall', z: -.085, trans: .3, draw: x => { x.fillStyle = '#34406c'; x.fillRect(-.2, -.4, .4, .8); window_(x, { cx: .05, cy: .09, r: .055, col: '#34406c' }); } },
          { name: 'man', z: -.055, trans: .04, draw: x => { keeper(x, { cx: -.04, by: -.135, s: .15, col: '#0b0f1e' }); x.fillStyle = '#0b0f1e'; x.fillRect(.06, -.135, .006, .07); x.fillRect(.03, -.068, .07, .006); hangLantern(x, { cx: .065, cy: -.045, r: .012, string: 0 }); } },
          { name: 'fg', z: -.02, trans: .02, draw: x => { x.fillStyle = '#080b16'; x.fillRect(-.25, -.4, .5, .25); } },
        ],
        scroll: { rain: [-.01, -.4] },
        cam: [[0, [.01, -.02, .72, .01, -.02, -.07]], [E.dur, [-.01, -.05, .6, -.02, -.06, -.07]]],
        focus: -.055, aper: 16, grade: { sat: .8, expo: 1.1, lift: [0, .006, .03] },
      }) },

    // 6 · Something on the stairs: the light climbs with the fox, flight after flight
    { id: 'S6', start: at('L09') - .3, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: C.L09.dur + .3, type: 'steps', n: 9, every: .38 }],
      build: E => {
        const t0 = E.cue('L10') - .8, t1 = E.cueEnd('L10') + .6;
        const ST = { cx: 0, y0: -.22, flights: 4, fh: .085, w: .2, steps: 9 };
        const path = stairs(null, ST);
        return layered(E, {
          light: [0, -.2, -.12], lightR: .05, lightCol: '#ffc878', key: 1.1, amb: .75, ambCol: '#7586c0', keyCol: '#aab8e8', on: false,
          sky: { stops: [[0, '#05070f'], [1, '#0d1020']] },
          layers: [
            { name: 'wall', z: -.1, trans: .05, w: .4, h: .9, draw: x => { x.fillStyle = '#2b3156'; x.fillRect(-.2, -.45, .4, .9); x.fillStyle = '#262b4e'; for (let r = 0; r < 46; r++) for (let c = 0; c < 7; c++) x.fillRect(-.2 + c * .062 + (r % 2) * .031, -.45 + r * .02, .058, .017); } },
            { name: 'stairs', z: -.075, trans: .02, w: .4, h: .9, draw: x => stairs(x, { ...ST, col: '#0a0c1a' }) },
            { name: 'fox', z: -.062, trans: .2, glow: 3, glowCol: '#ffb862', shadow: true, w: .16, h: .16, ay: -.03, draw: x => fox(x, { cx: 0, by: -.03, s: .045, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.03, s: .045, lantern: true }, g) },
          ],
          glows: { fox: [[0, 0], [t0 - .4, 0], [t0, 1]] }, flicker: ['fox'],
          update: (t, L, S) => {
            const u = ss(seg(t, t0, t1)), [px, py, d] = path(u), hop = Math.abs(Math.sin(u * ST.flights * ST.steps * Math.PI)) * .004;
            L.fox.position.set(px, py + hop + .002, -.062); L.fox.scale.x = d;
            const lx = px + d * .03, ly = py + .03;
            S.U.uLight.value.set(lx, ly, -.12); S.U.uLightR.value = .045 + .03 * ss(seg(t, t0 - .4, t0 + .4));
            const cy = lerp(py, ly, .3) - .07;   // the fox sits in the upper half, clear of the subtitles
            const cx = px * .55; aim(S.cam, [cx, cy, .62, cx, cy + .01, -.07], t + E.T0, { hand: .0005 });
          },
          focus: -.062, aper: 20, grade: { sat: .95 },
        });
      } },

    // 7 · The room warms up: the fox and the keeper, one lantern between them
    { id: 'S7', start: at('L11') - .5, in: { type: 'dissolve', dur: 1.0 }, sfx: [{ t: .4, type: 'chime' }],
      build: E => layered(E, {
        light: [-.0, -.04, -.12], lightR: .16, lightCol: '#ffc878', key: .7, amb: .3, ambCol: '#a07a5a', keyCol: '#ffe0b8', on: false,
        sky: { stops: [[0, '#0d1226'], [1, '#1b2442']] },
        layers: [
          { name: 'out', z: -.12, trans: .6, draw: x => { x.fillStyle = '#3f5a92'; waterTop(x, { x0: -.25, x1: .25, base: .05, amp: .001, len: .03 }); } },
          { name: 'wall', z: -.085, trans: .35, draw: x => { x.fillStyle = '#7a5236'; x.fillRect(-.2, -.4, .4, .8); window_(x, { cx: .05, cy: .09, r: .055, col: '#7a5236' }); } },
          { name: 'man', z: -.06, trans: .1, draw: x => keeper(x, { cx: -.06, by: -.135, s: .15, col: '#2e170d' }) },
          { name: 'fox', z: -.05, trans: .15, glow: 3.2, w: .2, h: .2, x: .045, y: -.04, draw: x => fox(x, { cx: 0, by: -.095, s: .05, lantern: true, flip: true }), glowDraw: g => fox(null, { cx: 0, by: -.095, s: .05, lantern: true, flip: true }, g) },
          { name: 'fg', z: -.02, trans: .03, draw: x => { x.fillStyle = '#1e0e06'; x.fillRect(-.25, -.4, .5, .26); } },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [-.01, -.06, .58, -.01, -.07, -.07]], [E.dur, [0, -.03, .68, 0, -.03, -.07]]],
        focus: -.055, aper: 18, grade: { lift: [.025, .01, 0], gain: [1.08, 1, .88], sat: 1.08 },
      }) },

    // 8 · Two lights on the hill, every night; the title is cut paper in the sky
    { id: 'S8', start: at('L12') - .5, in: { type: 'dissolve', dur: 1.2 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L12') + .5, v: .6 }, { t: end('L13') - at('L12') + 1.0, type: 'paper' }],
      build: E => {
        const titleAt = E.cueEnd('L13') + .5;
        return layered(E, {
          light: [.06, .12, -.13], lightR: .24, sky: { stops: NIGHT, stars: 180 }, moon: { x: -.085, y: .14, r: .022 }, on: false,
          layers: [
            { name: 'far', z: -.115, trans: .7, draw: seaFar('#6a86c2', -.03) },
            { name: 'title', z: -.045, trans: .3, w: .24, h: .06, x: 0, y: .2, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => { text(x, 'Lantern Fox Tales', 0, .006, .02, '"Cormorant"', { fill: '#f1dbac', weight: 600 }); x.fillStyle = '#b3302a'; x.fillRect(-.006, -.022, .012, .012); } },
            { name: 'sea', z: -.09, trans: .45, draw: seaNear('#3f5a92', '#4f6aa6', -.06) },
            { name: 'hill', z: -.065, trans: .25, glow: 2.6, draw: x => { x.fillStyle = '#1b284f'; cliff(x, { x0: -.05, x1: .25, base: -.13, top: .0, side: 1 }); lighthouse(x, { cx: .08, by: -.002, h: .18, col: '#1b284f' }); },
              glowDraw: g => lighthouse(null, { cx: .08, by: -.002, h: .18, cottageLit: true }, g) },
            { name: 'fox', z: -.058, trans: .2, glow: 3, w: .1, h: .1, x: .02, y: -.029, draw: x => fox(x, { cx: 0, by: -.026, s: .028, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.026, s: .028, lantern: true }, g) },
            { name: 'fg', z: -.02, trans: .05, draw: x => { x.fillStyle = '#0e1532'; x.strokeStyle = '#0e1532'; ridge(x, { x0: -.25, x1: .25, base: -.21, amp: .01, seed: 6 }); reeds(x, { x0: -.2, x1: -.02, by: -.215, h: .055, n: 30, seed: 11 }); } },
          ],
          glows: { hill: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox'],
          update: (t, L) => { const k = ss(seg(t, titleAt, titleAt + 1.4)); L.title.visible = k > 0; L.title.material.color.setScalar(k); L.title.position.y = L.title.userData.p0.y - .006 * (1 - k); },
          cam: [[0, [.03, -.01, .6, .04, -.01, -.07]], [E.dur, [0, .02, .8, 0, .02, -.07]]],
          focus: [[0, -.06], [titleAt, -.06], [titleAt + 1.5, -.1]], aper: 14,
        });
      } },
  ];
}
