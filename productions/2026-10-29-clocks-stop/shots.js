// What If Every Clock Stopped at the Same Second? (What If…, episode 2) — shot list. At 3:00 every clock stops: the town clock
// freezes on "stopped", then the phone, the oven, the clocks in space. The snapback is the map: GPS is a ring of clocks, a millionth
// of a second moves the blue dot 300 m, so every dot freezes, ships and planes are lost, the masts go dark. The turn: time never
// stopped, only our counting (the moon keeps moving behind the frozen clock, the sun rises, the stars turn), and the fox with the
// lantern walks home by them. The clock hands are their own sheets (clockHand), turned in update().
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, houses, cottage, dunes, foreground, starField, phone, boat, clockHand, clockTower, satellite, cellTower, streetMap, mapDot, plane, oven } from './engine/kit/motifs.js';
import { waves, waterTop } from './engine/art.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp, clamp, TAU } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const SPACE = [[0, '#03050f'], [.6, '#080d22'], [1, '#101a3c']];
const ROOM = [[0, '#06080f'], [1, '#121730']];
const DAWN = [[0, '#141d3c'], [.45, '#3a4775'], [.75, '#a0766a'], [1, '#e7a56a']];
const NOGLOW = { trans: 0, shadow: false, recv: false };
const BLUE = '#5aa8ff';

// the clock tower and its three hands (each hand is a sheet that turns around the face centre)
const TOWER = { cx: 0, by: -.07, w: .075, h: .2 };
const FACE = { cx: 0, cy: TOWER.by + TOWER.h - TOWER.w * .52, r: TOWER.w * .36 };
const towerLayers = (z = -.085, col = '#16224a', face = FACE) => [
  { name: 'tower', z, trans: .2, glow: 2.2, glowCol: '#ffe2ae', draw: x => clockTower(x, { ...TOWER, col }), glowDraw: g => clockTower(null, TOWER, g) },
  { name: 'hourH', z: z + .002, ...NOGLOW, w: .06, h: .06, x: face.cx, y: face.cy, draw: x => clockHand(x, { l: face.r * .55, w: face.r * .15 }) },
  { name: 'minH', z: z + .003, ...NOGLOW, w: .06, h: .06, x: face.cx, y: face.cy, draw: x => clockHand(x, { l: face.r * .8, w: face.r * .11 }) },
  { name: 'secH', z: z + .004, ...NOGLOW, w: .07, h: .07, x: face.cx, y: face.cy, draw: x => clockHand(x, { l: face.r * .88, w: face.r * .05, tail: .25, col: '#9a2a22' }) },
];
// hands at h:m:s (s may be fractional); the second hand ticks, the frozen one may twitch
const setHands = (L, h, m, s) => {
  L.hourH.rotation.z = -((h % 12) + m / 60) * TAU / 12;
  L.minH.rotation.z = -(m + s / 60) * TAU / 60;
  L.secH.rotation.z = -s * TAU / 60;
};
// 2:59:5x ticking up to 3:00:00 exactly at tStop, then frozen
const clockAt = (t, tStop) => {
  if (t >= tStop) return [3, 0, .25 * Math.exp(-(t - tStop) * 9) * Math.sin((t - tStop) * 40)];
  return [2, 59, 60 - Math.ceil(tStop - t)];
};

// a town of houses along a ridge, windows lit
const town = (by, seed = 5, col = '#16224a', h = .04) => ({
  draw: x => { x.fillStyle = col; dunes(x, { x0: -.25, x1: .25, base: by, amp: .004, seed, freq: 5 }); houses(x, { x0: -.24, x1: .24, by, h, seed, col }); },
  glowDraw: g => houses(null, { x0: -.24, x1: .24, by, h, seed }, g), glow: 2.2,
});
const hill = (base, col = '#0e1532', seed = 3) => x => { x.fillStyle = col; dunes(x, { x0: -.25, x1: .25, base, amp: .01, seed, freq: 5, grass: 12 }); };
const bank = (base, seed) => x => { x.fillStyle = '#080c1e'; foreground(x, { base, seed, reedsAt: [-.22, -.08] }); };
const foxLayer = (o, z = -.055, name = 'fox') => ({ name, z, trans: .2, glow: 3, w: .2, h: .2, x: o.cx, y: o.by + .05,
  draw: x => fox(x, { ...o, cx: 0, by: -.05, lantern: true }), glowDraw: g => fox(null, { ...o, cx: 0, by: -.05, lantern: true }, g) });
const dotLayer = (name, z, x0, y0, r = .0045) => ({ name, z, ...NOGLOW, glow: 3.6, glowCol: BLUE, w: .04, h: .04, x: x0, y: y0,
  draw: x => mapDot(x, { r }), glowDraw: g => mapDot(null, { r }, g) });
// fade a small text/sign sheet in at t0 (it rises a little as it appears)
const reveal = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); L[n].position.y = L[n].userData.p0.y - .006 * (1 - k); };
const sign = (name, z, s, y, size = .022, col = '#f1dbac', o = {}) => ({ name, z, trans: .3, w: .26, h: .05, x: 0, y, shadow: false, recv: false, finish: { rim: .6 },
  draw: x => text(x, s, 0, 0, size, '"Cormorant"', { fill: col, weight: 700, ...o }) });
const seaNear = (col, line, base, r = .009) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .002, len: .045 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .006, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  const mid = (id, u) => C[id].at + C[id].dur * u;   // an approximate point inside a line, for cuts on a word
  return [
    // 1 · The hook, already lit: the town clock at night, the red second hand ticking toward 3:00. On "stopped" it freezes
    //     with a twitch; the fox watches from a roof; the camera pushes in on the face
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: 4, v: .3 }],
      build: E => {
        const stop = E.word('L01', 7);
        return layered(E, {
          light: [0, .1, -.13], lightR: .24, sky: { stops: NIGHT, stars: 140 }, on: false,
          layers: [
            ...towerLayers(),
            { name: 'town', z: -.075, trans: .25, ...town(-.065, 5, '#101a3e', .045) },
            foxLayer({ cx: .09, by: -.008, s: .05 }, -.07),
            { name: 'fg', z: -.03, trans: .04, draw: hill(-.14, '#080c1e', 2) },
          ],
          flicker: ['fox'],
          update: (t, L) => setHands(L, ...clockAt(t, stop)),
          cam: [[0, [0, .03, .62, 0, .04, -.07]], [stop, [0, .05, .5, 0, .06, -.07]], [E.dur, [0, .065, .4, 0, .068, -.07]]],
          focus: -.085, aper: 14,
        });
      } },

    // 2 · Your phone, your oven: a dark kitchen; the phone on the table reads 3:00, the camera whips right to the oven clock
    { id: 'S2', start: at('L02') - .2, sfx: [{ t: .15, type: 'click' }, { t: C.L02.dur * .3, type: 'whoosh', v: .4 }],
      build: E => {
        const ov = E.word('L02', 2);
        const digits = (name, cx, cy, size, col) => ({ name, z: -.088, ...NOGLOW, w: .09, h: .04, x: cx, y: cy, draw: x => text(x, '3:00', 0, 0, size, '"Anton"', { fill: col }) });
        return layered(E, {
          light: [0, .05, -.13], lightR: .2, sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'phone', z: -.09, trans: .1, glow: 2.6, glowCol: '#bcd6ff', draw: x => phone(x, { cx: -.07, cy: .07, w: .075, h: .14 }), glowDraw: g => phone(null, { cx: -.07, cy: .07, w: .075, h: .14 }, g) },
            digits('pdig', -.07, .09, .024, '#1b2140'),
            { name: 'oven', z: -.09, trans: .1, glow: 2.8, glowCol: '#7dffb0', draw: x => oven(x, { cx: .1, by: -.02, w: .12, h: .16 }), glowDraw: g => oven(null, { cx: .1, by: -.02, w: .12, h: .16 }, g) },
            digits('odig', .1, .1176, .011, '#0f2a1c'),
            { name: 'table', z: -.07, trans: .05, draw: x => { x.fillStyle = '#0b0f1e'; x.fillRect(-.25, -.3, .5, .3); x.fillRect(-.25, -.005, .5, .006); } },
          ],
          glows: { phone: [[0, 1]], oven: [[0, 0], [ov - .1, 0], [ov + .1, 1]] },
          cam: [[0, [-.07, .07, .5, -.07, .075, -.07]], [ov - .15, [-.06, .07, .5, -.06, .075, -.07]], [ov + .25, [.09, .07, .48, .1, .08, -.07]], [E.dur, [.1, .075, .44, .1, .085, -.07]]],
          focus: -.09, aper: 14,
        });
      } },

    // 3 · …the atomic clocks in space: a satellite over the curve of the Earth, its clock light burning, drifting through the frame
    { id: 'S3', start: mid('L02', .5), sfx: [{ t: 0, type: 'shimmer', v: .7 }],
      build: E => layered(E, {
        light: [0, .05, -.13], lightR: .3, sky: { stops: SPACE }, on: false,
        layers: [
          { name: 'stars', z: -.13, ...NOGLOW, glow: 2, glowCol: '#ffecc8', draw: x => starField(x, { n: 120, seed: 21 }), glowDraw: g => starField(null, { n: 120, seed: 21 }, g) },
          { name: 'earth', z: -.11, trans: .35, glow: 1.6, glowCol: '#8fc0ff',
            draw: x => { x.fillStyle = '#16305e'; x.beginPath(); x.arc(0, -.5, .48, 0, TAU); x.fill(); },
            glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = .004; g.beginPath(); g.arc(0, -.5, .479, 0, TAU); g.stroke(); } },
          { name: 'sat', z: -.08, trans: .1, glow: 4, glowCol: '#ffe2a8', w: .14, h: .1, x: 0, y: .09,
            draw: x => satellite(x, { cx: 0, cy: 0, s: .06, rot: -.25 }), glowDraw: g => satellite(null, { cx: 0, cy: 0, s: .06, rot: -.25 }, g) },
        ],
        move: { sat: [[0, [-.04, -.01, .06]], [E.dur, [.03, .012, -.04]]] },
        flicker: ['sat'],
        cam: [[0, [-.02, .06, .52, -.01, .07, -.07]], [E.dur, [.02, .07, .42, .02, .08, -.07]]],
        focus: -.08, aper: 12,
      }) },

    // 4 · "The first thing to break isn't time": the frozen clock face, very close, the red hand trembling
    { id: 'S4', start: at('L03') - .3, sfx: [{ t: .3, type: 'click' }],
      build: E => layered(E, {
        light: [0, .1, -.13], lightR: .2, sky: { stops: NIGHT, stars: 80 }, on: false,
        layers: [...towerLayers()],
        update: (t, L) => setHands(L, 3, 0, .2 * Math.sin(t * 31) * Math.exp(-((t % 1.4)) * 4)),
        cam: [[0, [-.01, FACE.cy - .01, .3, 0, FACE.cy, -.07]], [E.dur, [.01, FACE.cy, .26, 0, FACE.cy, -.07]]],
        focus: -.085, aper: 16,
      }) },

    // 5 · "It's your map": a paper street map lit from behind, the blue dot pulsing on it; the camera drops onto the dot
    { id: 'S5', start: mid('L03', .78), sfx: [{ t: 0, type: 'paper', v: .8 }],
      build: E => layered(E, {
        light: [0, .08, -.13], lightR: .3, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'map', z: -.1, trans: .55, draw: x => streetMap(x, { w: .33, h: .58, seed: 3 }) },
          dotLayer('dot', -.09, .01, .07, .005),
        ],
        update: (t, L) => { const k = 1 + .25 * Math.sin(t * 5); L.dot.scale.set(k, k, 1); },
        cam: [[0, [0, .03, .62, 0, .04, -.07]], [E.dur, [.008, .065, .38, .01, .07, -.07]]],
        focus: -.1, aper: 16,
      }) },

    // 6 · A ring of clocks in the sky: satellites circling the Earth on a dotted orbit; on "timing" their signals run down to one dot
    { id: 'S6', start: mid('L04', .5), in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'shimmer', v: .6 }],
      build: E => {
        const t0 = E.word('L05', 5), t1 = E.cueEnd('L05') + .3;
        const ORB = (a) => [Math.cos(a) * .135, .03 + Math.sin(a) * .05];   // the orbit, seen at a slant
        const N = 6, home = [0, .005];
        const sats = Array.from({ length: N }, (_, i) => ({ name: 's' + i, z: -.08, trans: .1, glow: 4, glowCol: '#ffe2a8', w: .06, h: .05, x: 0, y: 0,
          draw: x => satellite(x, { cx: 0, cy: 0, s: .024 }), glowDraw: g => satellite(null, { cx: 0, cy: 0, s: .024 }, g) }));
        return layered(E, {
          light: [0, .04, -.13], lightR: .3, sky: { stops: SPACE }, on: false,
          layers: [
            { name: 'stars', z: -.13, ...NOGLOW, glow: 2, glowCol: '#ffecc8', draw: x => starField(x, { n: 110, seed: 9 }), glowDraw: g => starField(null, { n: 110, seed: 9 }, g) },
            { name: 'orbit', z: -.1, ...NOGLOW, glow: .9, glowCol: '#9fb8ff',
              draw: x => { x.fillStyle = '#25305a'; for (let i = 0; i < 90; i++) { const [px, py] = ORB(i / 90 * TAU); x.beginPath(); x.arc(px, py, .0007, 0, TAU); x.fill(); } },
              glowDraw: g => { g.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { const [px, py] = ORB(i / 90 * TAU); g.beginPath(); g.arc(px, py, .0007, 0, TAU); g.fill(); } } },
            { name: 'earth', z: -.095, trans: .35, glow: 1.8, glowCol: '#8fc0ff',
              draw: x => { x.fillStyle = '#16305e'; x.beginPath(); x.arc(0, -.11, .115, 0, TAU); x.fill(); },
              glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = .0025; g.beginPath(); g.arc(0, -.11, .1145, 0, TAU); g.stroke(); } },
            dotLayer('dot', -.09, home[0], home[1], .0035),
            ...sats,
            ...[0, 1, 2].map(i => ({ name: 'pulse' + i, z: -.078, ...NOGLOW, glow: 5, glowCol: BLUE, w: .02, h: .02, x: 0, y: 0,
              draw: x => { x.fillStyle = '#1d3a6a'; x.beginPath(); x.arc(0, 0, .002, 0, TAU); x.fill(); },
              glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .002, 0, TAU); g.fill(); } })),
          ],
          glows: { dot: [[0, .3], [t0, .3], [t1, 1]], pulse0: [[0, 0], [t0 - .05, 0], [t0, 1]], pulse1: [[0, 0], [t0 + .1, 0], [t0 + .15, 1]], pulse2: [[0, 0], [t0 + .2, 0], [t0 + .25, 1]] },
          update: (t, L) => {
            const pos = [];
            for (let i = 0; i < N; i++) { const a = i / N * TAU + t * .22, [px, py] = ORB(a), s = L['s' + i];
              s.position.x = px; s.position.y = py; s.position.z = -.08 - Math.sin(a) * .012; pos.push([px, py]); }
            [0, 1, 2].forEach(i => {   // three signals, from the three highest satellites, repeating down to the dot
              const src = [...pos].sort((a, b) => b[1] - a[1])[i], u = ((t - t0 - i * .15) / .9) % 1, p = L['pulse' + i];
              p.visible = t > t0 + i * .15 - .05;
              p.position.x = lerp(src[0], home[0], Math.max(0, u)); p.position.y = lerp(src[1], home[1], Math.max(0, u));
            });
          },
          cam: [[0, [0, .02, .66, 0, .03, -.07]], [t0, [0, .015, .6, 0, .025, -.07]], [E.dur, [0, .01, .5, 0, .015, -.07]]],
          focus: -.09, aper: 12,
        });
      } },

    // 7 · A millionth of a second: the map close; "0.000001 s" appears, then the dot slides 300 m across the river to the wrong street
    { id: 'S7', start: at('L06') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .3 + C.L06.dur * .55, type: 'whoosh', v: .5 }],
      build: E => {
        const off = E.word('L06', 5), away = E.word('L06', 11) + .2, mil = E.word('L06', 1);
        const A = [-.035, .1], B = [.045, .015];
        return layered(E, {
          light: [0, .07, -.13], lightR: .3, sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'map', z: -.1, trans: .55, draw: x => streetMap(x, { w: .33, h: .58, seed: 3 }) },
            { name: 'path', z: -.095, trans: 0, shadow: false, recv: false,
              draw: x => { x.fillStyle = '#9a2a22'; for (let i = 1; i < 26; i++) { const u = i / 26; x.beginPath(); x.arc(lerp(A[0], B[0], u), lerp(A[1], B[1], u), .0011, 0, TAU); x.fill(); } } },
            { name: 'meters', z: -.092, trans: .2, w: .12, h: .03, x: .035, y: .065, shadow: false, recv: false, draw: x => text(x, '300 m', 0, 0, .016, '"Anton"', { fill: '#9a2a22' }) },
            { name: 'micro', z: -.09, trans: .2, w: .2, h: .04, x: 0, y: .17, shadow: false, recv: false, draw: x => text(x, '0.000001 s', 0, 0, .022, '"Anton"', { fill: '#1b2140' }) },
            dotLayer('dot', -.088, A[0], A[1], .005),
          ],
          update: (t, L) => {
            const u = ss(seg(t, off, away)); L.dot.position.x = lerp(A[0], B[0], u); L.dot.position.y = lerp(A[1], B[1], u);
            reveal(L, 'micro', t, mil - .1, .3); reveal(L, 'path', t, off, .3); reveal(L, 'meters', t, away - .3, .4);
          },
          cam: [[0, [-.03, .1, .4, -.03, .105, -.07]], [off, [-.02, .09, .42, -.02, .095, -.07]], [away, [.01, .07, .5, .01, .075, -.07]], [E.dur, [.01, .07, .52, .01, .075, -.07]]],
          focus: -.1, aper: 16,
        });
      } },

    // 8 · Every blue dot freezes: the phone in a hand-held close-up, the map on its screen; the dot stops pulsing and goes grey
    { id: 'S8', start: at('L07') - .3, sfx: [{ t: .3 + C.L07.dur * .92, type: 'click' }],
      build: E => {
        const frz = E.word('L07', 8);
        const P = { cx: 0, cy: .075, w: .1, h: .19 };
        return layered(E, {
          light: [0, .06, -.13], lightR: .2, sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'phone', z: -.09, trans: .1, glow: 2.2, glowCol: '#cfe0ff', draw: x => phone(x, P), glowDraw: g => phone(null, P, g) },
            { name: 'screenMap', z: -.088, ...NOGLOW, w: .084, h: .16, x: 0, y: .075, draw: x => streetMap(x, { w: .084, h: .16, seed: 8, bg: false, ink: '#7d8fb8', water: '#9db7e0', park: '#b3d0a4' }) },
            dotLayer('dot', -.086, 0, .07, .0045),
            { name: 'room', z: -.06, trans: .05, draw: x => { x.fillStyle = '#0b0f1e'; x.fillRect(-.25, -.3, .5, .28); } },
          ],
          glows: { dot: [[0, 1], [frz, 1], [frz + .4, .12]], phone: [[0, 1]] },
          update: (t, L) => { const k = t < frz ? 1 + .3 * Math.sin(t * 6) : 1; L.dot.scale.set(k, k, 1); },
          cam: [[0, [-.015, .07, .42, 0, .075, -.07]], [frz, [0, .075, .36, 0, .075, -.07]], [E.dur, [.005, .075, .34, 0, .075, -.07]]],
          focus: -.088, aper: 16,
        });
      } },

    // 9 · Ships, planes, trucks: a night coast; the camera snaps from the boat to the plane to the truck on the road, then pulls
    //     back as all three wander, lost
    { id: 'S9', start: at('L08') - .25, sfx: [{ t: 0, type: 'waves', d: 4, v: .5 }, { t: C.L08.dur * .25, type: 'whoosh', v: .3 }],
      build: E => {
        const w1 = E.word('L08', 1), w2 = E.word('L08', 2), lost = E.word('L08', 5);
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, sky: { stops: NIGHT, stars: 120 }, on: false,
          layers: [
            { name: 'plane', z: -.12, trans: .1, glow: 4, glowCol: '#ff6b5a', w: .1, h: .06, x: .05, y: .15, draw: x => plane(x, { cx: 0, cy: 0, s: .07 }), glowDraw: g => plane(null, { cx: 0, cy: 0, s: .07 }, g) },
            { name: 'far', z: -.11, trans: .4, draw: seaNear('#2f4680', '#3d5590', .03, .006) },
            { name: 'boat', z: -.1, trans: .2, w: .12, h: .08, x: -.06, y: .045, draw: x => boat(x, { cx: 0, by: -.01, s: .06 }) },
            { name: 'sea', z: -.085, trans: .3, draw: seaNear('#22355f', '#2e4475', .0, .01) },
            { name: 'road', z: -.07, trans: .12, glow: 3, glowCol: '#ffe2a8', w: .3, h: .12, x: 0, y: -.03,
              draw: x => { x.fillStyle = '#0e1532'; x.fillRect(-.15, -.06, .3, .045); x.fillRect(.02, -.015, .055, .03); x.fillRect(.075, -.015, .022, .022);
                x.fillStyle = '#2c2a44'; x.fillRect(.093, -.008, .006, .006); },
              glowDraw: g => { g.fillStyle = '#fff'; g.fillRect(.093, -.008, .006, .006); } },
            { name: 'fg', z: -.03, trans: .04, draw: bank(-.2, 5) },
          ],
          glows: { plane: [[0, 1]], road: [[0, 1]] },
          update: (t, L) => {
            L.plane.position.x = .05 + .01 * Math.sin(t * .9); L.plane.rotation.z = .12 * Math.sin(t * 1.3);
            L.plane.material.userData.u.uGlowLit.value = (t * 1.6) % 1 < .25 ? 1 : 0;
            L.boat.rotation.z = (t > lost ? .25 : .08) * Math.sin(t * 1.7); L.boat.position.x = -.06 + (t > lost ? .01 * Math.sin(t * .8) : 0);
            L.road.position.x = t > lost ? -.015 * ss(seg(t, lost, lost + 1.5)) : 0;
          },
          cam: [[0, [-.06, .05, .4, -.06, .055, -.07]], [w1 - .05, [-.06, .05, .4, -.06, .055, -.07]], [w1 + .15, [.05, .14, .4, .05, .145, -.07]], [w2 - .05, [.05, .14, .4, .05, .145, -.07]],
            [w2 + .15, [.05, -.02, .4, .05, -.015, -.07]], [lost - .1, [.05, -.015, .42, .05, -.01, -.07]], [lost + .6, [0, .05, .66, 0, .055, -.07]], [E.dur, [0, .05, .7, 0, .055, -.07]]],
          focus: -.09, aper: 12,
        });
      } },

    // 10 · The phone masts: three masts on the hills over a town, red beacons blinking; on "dropping" they go out one by one,
    //      and the town's windows (its screens) go dark with them
    { id: 'S10', start: at('L09') - .3, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'wind', d: 5, v: .35 }, { t: .3 + C.L09.dur * .85, type: 'click' }],
      build: E => {
        const drop = E.word('L09', 5);
        const MASTS = [{ name: 'm0', cx: -.06, by: .0, h: .15, z: -.1 }, { name: 'm1', cx: .04, by: .02, h: .12, z: -.11 }, { name: 'm2', cx: .1, by: .015, h: .09, z: -.115 }];
        return layered(E, {
          light: [0, .1, -.13], lightR: .28, sky: { stops: NIGHT, stars: 120 }, on: false,
          layers: [
            ...MASTS.map(m => ({ name: m.name, z: m.z, trans: .15, glow: 4, glowCol: '#ff4a3a', draw: x => cellTower(x, { ...m, col: '#0b1230' }), glowDraw: g => cellTower(null, m, g) })),
            { name: 'ridge', z: -.095, trans: .25, draw: hill(.03, '#16224a', 4) },
            { name: 'town', z: -.08, trans: .2, ...town(-.03, 11, '#101a3e', .04) },
            { name: 'fg', z: -.03, trans: .04, draw: hill(-.13, '#080c1e', 7) },
          ],
          glows: { town: [[0, 1], [drop + .5, 1], [drop + 1.6, .25]] },
          update: (t, L) => MASTS.forEach((m, i) => { const blink = (t * .9 + i * .33) % 1 < .45 ? 1 : .15, out = t > drop + i * .35 ? 0 : 1;
            L[m.name].material.userData.u.uGlowLit.value = blink * out; }),
          cam: [[0, [0, -.02, .62, 0, .04, -.07]], [drop, [0, .0, .56, 0, .06, -.07]], [E.dur, [0, .02, .62, 0, .055, -.07]]],
          focus: -.1, aper: 12,
        });
      } },

    // 11 · The strange part: the frozen clock tower again, the town dark. On "at all" the moon starts to cross the sky behind
    //      it: time is still moving, only the clock is not
    { id: 'S11', start: at('L10') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: at('L11') - at('L10') + .4 + C.L11.dur * .3, type: 'shimmer', v: .8 }],
      build: E => {
        const go = E.word('L11', 4);
        return layered(E, {
          light: [0, .1, -.13], lightR: .22, sky: { stops: NIGHT, stars: 160 }, on: false,
          layers: [
            { name: 'moonS', z: -.13, ...NOGLOW, glow: 3, glowCol: '#fff1d6', w: .06, h: .06, x: -.07, y: .1,
              draw: x => { x.fillStyle = '#3a4268'; x.beginPath(); x.arc(0, 0, .018, 0, TAU); x.fill(); },
              glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .018, 0, TAU); g.fill(); } },
            ...towerLayers(),
            { name: 'town', z: -.075, trans: .25, ...town(-.065, 5, '#101a3e', .045) },
            { name: 'fg', z: -.03, trans: .04, draw: hill(-.14, '#080c1e', 2) },
          ],
          glows: { town: [[0, .25]] },
          update: (t, L) => { setHands(L, 3, 0, 0);
            const u = ss(seg(t, go, E.dur)) * .9; L.moonS.position.x = lerp(-.07, .07, u); L.moonS.position.y = .1 + Math.sin(u * Math.PI) * .07; },
          cam: [[0, [0, .065, .42, 0, .068, -.07]], [go, [0, .06, .5, 0, .07, -.07]], [E.dur, [0, .05, .66, 0, .07, -.07]]],
          focus: -.085, aper: 14,
        });
      } },

    // 12 · The Sun still rises, the stars still turn: dawn over the hills; the star field turns and fades as the sun comes up on "rises"
    { id: 'S12', start: at('L12') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: .4 + C.L12.dur * .4, type: 'chime' }],
      build: E => {
        const rise = E.word('L12', 3), turn = E.word('L12', 7);
        return layered(E, {
          light: [0, -.02, -.13], lightR: .3, lightCol: '#ffd29a', sky: { stops: DAWN }, on: false,
          layers: [
            { name: 'stars', z: -.135, ...NOGLOW, glow: 2.2, glowCol: '#ffecc8', w: .5, h: .5, x: 0, y: .25, draw: x => starField(x, { w: .5, h: .5, n: 140, seed: 17 }), glowDraw: g => starField(null, { w: .5, h: .5, n: 140, seed: 17 }, g) },
            { name: 'sun', z: -.125, ...NOGLOW, glow: 3.2, glowCol: '#ffc878', w: .08, h: .08, x: .03, y: -.04,
              draw: x => { x.fillStyle = '#7a4a2a'; x.beginPath(); x.arc(0, 0, .028, 0, TAU); x.fill(); },
              glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .028, 0, TAU); g.fill(); } },
            { name: 'hill2', z: -.1, trans: .25, draw: hill(.0, '#3a3a5e', 8) },
            { name: 'town', z: -.08, trans: .2, ...town(-.03, 5, '#1d2347', .04) },
            { name: 'fg', z: -.03, trans: .04, draw: hill(-.13, '#0e1028', 7) },
          ],
          glows: { stars: [[0, 1], [turn, .7], [E.dur, .15]], town: [[0, 1], [E.dur, .2]], sun: [[0, 1]] },
          update: (t, L) => { L.stars.rotation.z = .25 * ss(seg(t, 0, E.dur)); L.sun.position.y = -.04 + .085 * ss(seg(t, rise - .5, E.dur)); },
          grade: t => ({ expo: lerp(.95, 1.12, ss(seg(t, rise, E.dur))), sat: 1.06 }),
          cam: [[0, [0, .02, .62, 0, .04, -.07]], [E.dur, [0, .05, .56, 0, .07, -.07]]],
          focus: -.1, aper: 12,
        });
      } },

    // 13 · The fox walks home by them: twilight path over the hill, the fox with its lantern crossing toward a cottage; on "home"
    //      the cottage window warms up
    { id: 'S13', start: at('L13') - .4, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: .4, type: 'steps', n: 8, every: .45 }],
      build: E => {
        const hm = E.word('L13', 10);
        return layered(E, {
          light: [.05, .05, -.13], lightR: .26, sky: { stops: DAWN.map(([u, c], i) => [u, i < 2 ? c : '#5a5878']), stars: 140 }, on: false,
          layers: [
            { name: 'home', z: -.1, trans: .2, glow: 2.6, draw: x => { x.fillStyle = '#1d2347'; dunes(x, { x0: -.25, x1: .25, base: .02, amp: .006, seed: 4, freq: 4 }); cottage(x, { cx: .08, by: .018, s: .04, col: '#1d2347' }); },
              glowDraw: g => cottage(null, { cx: .08, by: .018, s: .04 }, g) },
            { name: 'hill', z: -.075, trans: .15, draw: hill(-.03, '#0e1532', 5) },
            foxLayer({ cx: -.05, by: -.032, s: .07 }, -.07),
            { name: 'fg', z: -.025, trans: .04, draw: bank(-.2, 3) },
          ],
          glows: { home: [[0, .35], [hm - .2, .35], [hm + .5, 1.2]], fox: [[0, 1]] }, flicker: ['fox'],
          move: { fox: [[0, [-.03, 0, 0]], [E.dur, [.07, .006, 0]]] },
          update: (t, L) => { L.fox.position.y += .0015 * Math.abs(Math.sin(t * 7)); },
          cam: [[0, [-.06, .03, .5, -.06, .035, -.07]], [E.dur, [.04, .04, .56, .04, .045, -.07]]],
          focus: -.07, aper: 14,
        });
      } },

    // 14 · Your call: the fox close by its lantern, the stopped clock tower far behind; "MINUTE or HOUR?" lights up above and holds
    { id: 'S14', start: at('L14') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'chime' }, { t: end('L14') - at('L14') + 1, type: 'paper' }],
      build: E => {
        const q = E.word('L14', 5);
        return layered(E, {
          light: [0, .06, -.13], lightR: .2, lightCol: '#ffc878', sky: { stops: NIGHT, stars: 150 }, on: false,
          layers: [
            ...towerLayers(-.115, '#22336a'),
            { name: 'hill2', z: -.1, trans: .25, draw: hill(-.055, '#22336a', 8) },
            { name: 'hill', z: -.075, trans: .15, draw: hill(-.075, '#0e1532', 5) },
            foxLayer({ cx: -.03, by: -.076, s: .11 }, -.062),
            sign('ask', -.05, 'MINUTE  or  HOUR?', .185, .021),
            { name: 'fg', z: -.02, trans: .04, draw: bank(-.2, 6) },
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          update: (t, L) => { setHands(L, 3, 0, 0); reveal(L, 'ask', t, q, .6); },
          cam: [[0, [.01, -.035, .48, 0, -.02, -.07]], [q, [0, -.0, .55, 0, .03, -.07]], [E.dur, [0, .03, .64, 0, .07, -.07]]],
          focus: [[0, -.062], [q, -.062], [q + 1, -.05]], aper: 14,
        });
      } },
  ];
}
