// The Lighthouse Fox — shot list (v2, after the first review: lit first frame, bigger subjects, textured foregrounds,
// the lighthouse beam as the signature move, shorter dissolves). Starts are anchored to narration lines (C),
// effects to spoken words (E.word).
import { layered } from './engine/kit/shot.js';
import { fox, hangLantern, lighthouse, cliffRich, dunes, rain, boat, keeper, stairs, window_, moonTrail, foreground } from './engine/kit/motifs.js';
import { waves, waterTop } from './engine/art.js';
import { text } from './engine/paper.js';
import { aim } from './engine/stage.js';
import { seg, ss, lerp } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const STORM = [[0, '#06091a'], [.55, '#111a35'], [1, '#22304f']];
const MOON = { x: -.075, y: .2, r: .02, gain: 1.35, halo: 3.4, haloGain: .24 };

// far sea: a dark band with the moon's trail on it (the trail glows)
const seaFar = (base, trailX) => ({
  draw: x => { x.fillStyle = '#3b5590'; waterTop(x, { x0: -.25, x1: .25, base, amp: .0008, len: .03 }); if (trailX !== undefined) moonTrail(x, { cx: trailX, top: base - .002 }); },
  glowDraw: trailX === undefined ? undefined : g => moonTrail(g, { cx: trailX, top: base - .002, col: '#fff' }), glow: .9, glowCol: '#ffe0a6',
});
const seaNear = (col, line, base, r = .009) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .002, len: .045 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .006, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
const bank = (base, seed, reedsAt) => x => { x.fillStyle = '#0e1532'; foreground(x, { base, seed, reedsAt }); };
const sweep = (speed = .55, amp = .7, base = Math.PI * .92) => t => base + Math.sin(t * speed) * amp;   // the beam swings over the sea

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook: already lit — the lamp room burning, the beam sweeping the sky; then a slow pull back
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'waves', d: at('L03') + 1 }, { t: .1, type: 'shimmer', v: .6 }],
      build: E => layered(E, {
        light: [.1, .19, -.13], lightR: .22, sky: { stops: NIGHT, stars: 160 }, moon: MOON, on: false,
        layers: [
          { name: 'far', z: -.11, trans: .45, ...seaFar(-.02, MOON.x) },
          { name: 'sea', z: -.09, trans: .35, draw: seaNear('#2f4680', '#3d5590', -.06) },
          { name: 'cliff', z: -.065, trans: .2, glow: 2.8, draw: x => { x.fillStyle = '#1b284f'; cliffRich(x, { x0: -.02, x1: .25, base: -.14, top: .02, side: 1 }); lighthouse(x, { cx: .1, by: .018, h: .2, col: '#1b284f' }); },
            glowDraw: g => lighthouse(null, { cx: .1, by: .018, h: .2, cottageLit: true }, g) },
          { name: 'fg', z: -.02, trans: .04, draw: bank(-.19, 3, [-.2, -.06]) },
        ],
        beams: [{ x: .1, y: .175, z: -.064, len: .42, width: .07, rot: sweep(), k: t => .55 + .1 * Math.sin(t * 7.3) * Math.sin(t * 3.1) }],
        cam: [[0, [.06, .12, .5, .08, .14, -.07]], [E.cue('L01') + C.L01.dur, [.04, .06, .62, .05, .07, -.07]], [E.dur, [.02, .02, .7, .02, .03, -.07]]],
        focus: -.065, aper: 14,
      }) },

    // 2 · Not for the ships: the beam searches an empty sea; one last boat slips behind the horizon
    { id: 'S2', start: at('L02') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'whoosh', v: .4 }],
      build: E => layered(E, {
        light: [.14, .1, -.13], lightR: .3, sky: { stops: NIGHT, stars: 120 }, on: false,
        layers: [
          { name: 'far', z: -.115, trans: .45, ...seaFar(-.03) },
          { name: 'boat', z: -.105, trans: .5, draw: x => { x.fillStyle = '#4a64a0'; boat(x, { cx: -.03, by: -.031, s: .06 }); } },
          { name: 'sea', z: -.09, trans: .35, draw: seaNear('#2f4680', '#3d5590', -.045) },
          { name: 'cliff', z: -.075, trans: .2, glow: 2.4, draw: x => { x.fillStyle = '#1b284f'; cliffRich(x, { x0: .08, x1: .26, base: -.1, top: .0, side: 1 }); lighthouse(x, { cx: .145, by: -.002, h: .11, col: '#1b284f' }); },
            glowDraw: g => lighthouse(null, { cx: .145, by: -.002, h: .11, cottageLit: true }, g) },
          { name: 'fg', z: -.02, trans: .04, draw: seaNear('#0e1532', '#18224a', -.17, .012) },
        ],
        beams: [{ x: .145, y: .085, z: -.074, len: .5, width: .06, rot: t => Math.PI * (.97 + .03 * Math.sin(t * .8)) - .05, k: .7 }],
        move: { boat: [[0, [0, 0, 0]], [E.cueEnd('L03'), [.05, -.05, .04]]] },
        cam: [[0, [-.03, 0, .7, -.03, 0, -.07]], [E.dur, [.03, .005, .7, .03, .005, -.07]]],
        focus: -.1, aper: 12,
      }) },

    // 3 · The fox in the dunes, big in frame, looking up at the window; the camera follows its gaze up
    { id: 'S3', start: at('L04') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'wind', d: 6, v: .4 }],
      build: E => layered(E, {
        light: [.08, .16, -.12], lightR: .2, sky: { stops: NIGHT, stars: 140 }, moon: { ...MOON, x: -.1, y: .23 }, on: false,
        layers: [
          { name: 'far', z: -.115, trans: .45, ...seaFar(.05, -.1), glow: .45 },
          { name: 'lh', z: -.1, trans: .35, glow: 2.6, draw: x => { x.fillStyle = '#3f5a92'; cliffRich(x, { x0: .0, x1: .26, base: .0, top: .075, side: 1, strata: '#4a66a0' }); lighthouse(x, { cx: .095, by: .072, h: .15, col: '#3f5a92' }); },
            glowDraw: g => lighthouse(null, { cx: .095, by: .072, h: .15 }, g) },
          { name: 'd1', z: -.078, trans: .25, draw: x => { x.fillStyle = '#2b3f78'; dunes(x, { x0: -.25, x1: .25, base: -.04, amp: .014, seed: 4, grass: 10 }); } },
          { name: 'd2', z: -.058, trans: .12, draw: x => { x.fillStyle = '#1b284f'; dunes(x, { x0: -.25, x1: .25, base: -.12, amp: .01, seed: 7, freq: 7, grass: 14 }); } },
          { name: 'fox', z: -.052, trans: .2, draw: x => fox(x, { cx: -.04, by: -.125, s: .105 }) },
          { name: 'fg', z: -.015, trans: .04, draw: bank(-.215, 5, [.02, .2]) },
        ],
        beams: [{ x: .095, y: .155, z: -.099, len: .35, width: .05, rot: sweep(.5, .6), k: .45 }],
        move: { fox: [[0, [0, 0, 0]], [E.cue('L05'), [0, 0, 0]], [E.cue('L05') + .6, [0, -.002, .05]]] },
        cam: [[0, [-.04, -.1, .52, -.04, -.095, -.07]], [E.cue('L05'), [-.03, -.08, .55, -.025, -.07, -.07]], [E.dur, [.02, .05, .62, .05, .09, -.07]]],
        focus: [[0, -.052], [E.cue('L05') + .5, -.052], [E.dur, -.1]], aper: 18,
      }) },

    // 4 · The storm: rain, lightning, the beam stutters and the light goes out on "out"
    { id: 'S4', start: at('L06') - .4, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: 0, type: 'rain', d: end('L07') - at('L06') + 1.6 }, { t: .2, type: 'wind', d: 5, v: 1 }, { t: C.L06.dur + .4, type: 'thunder' }, { t: at('L07') - at('L06') + .4 + C.L07.dur * .45, type: 'crack' }],
      build: E => {
        const out = E.word('L07', 7);
        return layered(E, {
          light: [.09, .1, -.13], lightR: .16, lightCol: '#cfe0ff', key: .7, amb: .22, ambCol: '#6f80b0', sky: { stops: STORM, gain: .9 }, on: false,
          layers: [
            { name: 'far', z: -.115, trans: .45, draw: seaNear('#2a3a66', '#34467a', -.0, .014) },
            { name: 'lh', z: -.09, trans: .25, glow: 2.8, draw: x => { x.fillStyle = '#0f1630'; cliffRich(x, { x0: -.02, x1: .26, base: -.13, top: .01, side: 1, strata: '#18224a' }); lighthouse(x, { cx: .09, by: .008, h: .19, col: '#0f1630' }); },
              glowDraw: g => lighthouse(null, { cx: .09, by: .008, h: .19 }, g) },
            { name: 'waves', z: -.06, trans: .18, draw: seaNear('#16203f', '#22305a', -.1, .016) },
            { name: 'rain1', z: -.04, h: 1.16, trans: .5, shadow: false, recv: false, draw: x => { x.strokeStyle = '#8fa2d0'; rain(x, { w: .33, h: 1.16, n: 420, seed: 3 }); } },
            { name: 'rain2', z: -.01, h: 1.16, trans: .5, shadow: false, recv: false, draw: x => { x.strokeStyle = '#a9b8de'; rain(x, { w: .33, h: 1.16, n: 260, seed: 9, len: .03 }); } },
          ],
          scroll: { rain1: [-.03, -.55], rain2: [-.05, -.9] },
          glows: { lh: [[0, 1], [out - .4, 1], [out - .25, .3], [out - .12, .9], [out + .05, 0], [E.dur, 0]] }, flicker: ['lh'],
          beams: [{ x: .09, y: .174, z: -.089, len: .4, width: .06, rot: sweep(.9, .8), k: t => (t < out - .4 ? .6 : t < out - .25 ? .15 : t < out - .12 ? .5 : t < out + .05 ? .3 : 0) }],
          flash: [E.cue('L06') + C.L06.dur + .4, E.cue('L07') + C.L07.dur * .45, E.cue('L07') + C.L07.dur * .45 + .35],
          update: (t, L) => { L.waves.position.y = L.waves.userData.p0.y + .004 * Math.sin(t * 1.7); L.far.position.y = L.far.userData.p0.y + .003 * Math.sin(t * 1.3 + 1); },
          cam: [[0, [0, .0, .62, .02, .01, -.07]], [E.dur, [.03, .05, .56, .07, .07, -.07]]],
          focus: -.09, aper: 12, grade: { sat: .78, contrast: .16, lift: [0, .006, .03], gain: [.95, 1, 1.06] },
        });
      } },

    // 5 · The keeper in the dark, by the round window
    { id: 'S5', start: at('L08') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: 0, type: 'rain', d: at('L09') - at('L08') + 1.5, v: .35 }],
      build: E => layered(E, {
        light: [.05, .1, -.12], lightR: .2, lightCol: '#b8c6ee', key: .6, amb: .28, ambCol: '#6a78a8', on: false, sky: { stops: STORM, gain: .7 },
        layers: [
          { name: 'out', z: -.12, trans: .45, draw: seaNear('#2a3a66', '#34467a', .05, .012) },
          { name: 'rain', z: -.11, h: 1.16, trans: .5, shadow: false, recv: false, draw: x => { x.strokeStyle = '#7f92c4'; rain(x, { w: .33, h: 1.16, n: 300, seed: 5 }); } },
          { name: 'wall', z: -.085, trans: .3, draw: x => { x.fillStyle = '#34406c'; x.fillRect(-.2, -.4, .4, .8); window_(x, { cx: .05, cy: .1, r: .06, col: '#34406c' }); } },
          { name: 'man', z: -.055, trans: .04, draw: x => { keeper(x, { cx: -.04, by: -.15, s: .2, col: '#0b0f1e' }); x.fillStyle = '#0b0f1e'; x.fillRect(.08, -.15, .006, .085); x.fillRect(.045, -.067, .08, .006); hangLantern(x, { cx: .085, cy: -.042, r: .014, string: 0 }); } },
          { name: 'fg', z: -.02, trans: .02, draw: x => { x.fillStyle = '#080b16'; x.fillRect(-.25, -.45, .5, .29); x.fillStyle = '#0d1222'; for (let i = 0; i < 8; i++) x.fillRect(-.25 + i * .065, -.162, .06, .004); } },
        ],
        scroll: { rain: [-.01, -.4] },
        cam: [[0, [.01, -.02, .66, .01, -.02, -.07]], [E.dur, [-.01, -.04, .56, -.02, -.05, -.07]]],
        focus: -.055, aper: 16, grade: { sat: .8, expo: 1.1, lift: [0, .006, .03] },
      }) },

    // 6 · Something on the stairs: the light climbs with the fox, flight after flight
    { id: 'S6', start: at('L09') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: C.L09.dur + .3, type: 'steps', n: 9, every: .38 }],
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
            { name: 'fox', z: -.062, trans: .2, glow: 3, glowCol: '#ffb862', shadow: true, w: .2, h: .2, ay: -.04, draw: x => fox(x, { cx: 0, by: -.04, s: .06, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.04, s: .06, lantern: true }, g) },
          ],
          glows: { fox: [[0, 0], [t0 - .4, 0], [t0, 1]] }, flicker: ['fox'],
          update: (t, L, S) => {
            const u = ss(seg(t, t0, t1)), [px, py, d] = path(u), hop = Math.abs(Math.sin(u * ST.flights * ST.steps * Math.PI)) * .004;
            L.fox.position.set(px, py + hop + .002, -.062); L.fox.scale.x = d;
            const lx = px + d * .04, ly = py + .04;
            S.U.uLight.value.set(lx, ly, -.12); S.U.uLightR.value = .05 + .03 * ss(seg(t, t0 - .4, t0 + .4));
            const cy = lerp(py, ly, .3) - .06, cx = px * .55;
            aim(S.cam, [cx, cy, .56, cx, cy + .01, -.07], t + E.T0, { hand: .0005 });
          },
          focus: -.062, aper: 20, grade: { sat: .95 },
        });
      } },

    // 7 · The room warms up: the fox and the keeper, one lantern between them
    { id: 'S7', start: at('L11') - .4, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: .4, type: 'chime' }],
      build: E => layered(E, {
        light: [.03, -.03, -.12], lightR: .16, lightCol: '#ffc878', key: .7, amb: .3, ambCol: '#a07a5a', keyCol: '#ffe0b8', on: false,
        sky: { stops: [[0, '#0d1226'], [1, '#1b2442']] },
        layers: [
          { name: 'out', z: -.12, trans: .5, draw: x => { x.fillStyle = '#3f5a92'; waterTop(x, { x0: -.25, x1: .25, base: .06, amp: .001, len: .03 }); } },
          { name: 'wall', z: -.085, trans: .35, draw: x => { x.fillStyle = '#7a5236'; x.fillRect(-.2, -.4, .4, .8); window_(x, { cx: .05, cy: .1, r: .06, col: '#7a5236' }); } },
          { name: 'man', z: -.06, trans: .1, draw: x => keeper(x, { cx: -.06, by: -.15, s: .2, col: '#2e170d' }) },
          { name: 'fox', z: -.05, trans: .15, glow: 3.2, w: .2, h: .2, x: .055, y: -.045, draw: x => fox(x, { cx: 0, by: -.1, s: .065, lantern: true, flip: true }), glowDraw: g => fox(null, { cx: 0, by: -.1, s: .065, lantern: true, flip: true }, g) },
          { name: 'fg', z: -.02, trans: .03, draw: x => { x.fillStyle = '#1e0e06'; x.fillRect(-.25, -.45, .5, .29); x.fillStyle = '#2a160a'; for (let i = 0; i < 8; i++) x.fillRect(-.25 + i * .065, -.162, .06, .004); } },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [0, -.05, .54, 0, -.06, -.07]], [E.dur, [0, -.03, .64, 0, -.03, -.07]]],
        focus: -.055, aper: 18, grade: { lift: [.025, .01, 0], gain: [1.08, 1, .88], sat: 1.08 },
      }) },

    // 8 · Two lights on the hill, every night; the beam is back; the title is cut paper in the sky
    { id: 'S8', start: at('L12') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L12') + .5, v: .6 }, { t: end('L13') - at('L12') + 1.0, type: 'paper' }],
      build: E => {
        const titleAt = E.cueEnd('L13') + .5;
        return layered(E, {
          light: [.06, .12, -.13], lightR: .24, sky: { stops: NIGHT, stars: 180 }, moon: { ...MOON, x: -.085, y: .14 }, on: false,
          layers: [
            { name: 'far', z: -.115, trans: .45, ...seaFar(-.03, -.085) },
            { name: 'sea', z: -.09, trans: .35, draw: seaNear('#2f4680', '#3d5590', -.06) },
            { name: 'hill', z: -.065, trans: .2, glow: 2.6, draw: x => { x.fillStyle = '#1b284f'; cliffRich(x, { x0: -.05, x1: .25, base: -.13, top: .0, side: 1 }); lighthouse(x, { cx: .08, by: -.002, h: .18, col: '#1b284f' }); },
              glowDraw: g => lighthouse(null, { cx: .08, by: -.002, h: .18, cottageLit: true }, g) },
            { name: 'fox', z: -.058, trans: .2, glow: 3, w: .14, h: .14, x: .02, y: -.026, draw: x => fox(x, { cx: 0, by: -.03, s: .045, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.03, s: .045, lantern: true }, g) },
            { name: 'title', z: -.045, trans: .3, w: .24, h: .06, x: 0, y: .2, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => { text(x, 'Lantern Fox Tales', 0, .006, .02, '"Cormorant"', { fill: '#f1dbac', weight: 600 }); x.fillStyle = '#b3302a'; x.fillRect(-.006, -.022, .012, .012); } },
            { name: 'fg', z: -.02, trans: .04, draw: bank(-.205, 6, [-.2, -.03]) },
          ],
          glows: { hill: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox'],
          beams: [{ x: .08, y: .157, z: -.064, len: .42, width: .07, rot: sweep(.5, .7), k: t => .5 * (1 - .8 * ss(seg(t, titleAt - .5, titleAt + .8))) }],   // the beam steps back for the title
          update: (t, L) => { const k = ss(seg(t, titleAt, titleAt + 1.4)); L.title.visible = k > 0; L.title.material.color.setScalar(k); L.title.position.y = L.title.userData.p0.y - .006 * (1 - k); },
          cam: [[0, [.03, -.02, .5, .03, -.02, -.07]], [E.cueEnd('L13'), [.02, .0, .62, .02, .01, -.07]], [E.dur, [0, .03, .72, 0, .04, -.07]]],
          focus: [[0, -.058], [titleAt, -.058], [titleAt + 1.5, -.08]], aper: 14,
        });
      } },
  ];
}
