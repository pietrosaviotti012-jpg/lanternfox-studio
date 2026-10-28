// Lantern Night · Part 1 (Your Call) — shot list. You are the one at the window: a town that goes dark at 2:07 am,
// neighbours walking off with lanterns, a dead phone that lights up, and the fox waiting under your window. GO or STAY.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd).
import { layered } from './engine/kit/shot.js';
import { fox, house, houses, streetlamp, neighbor, pines, phone, doorFrame, foreground } from './engine/kit/motifs.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const DARK = [[0, '#05081a'], [.6, '#0c1430'], [1, '#18244a']];
const ROOM = [[0, '#06080f'], [1, '#10142a']];

// the moon as its own disc, so it can go out with the rest of the town
const moonDisc = (cx, cy, r) => ({
  draw: x => { x.fillStyle = '#d8c79c'; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); },
  glowDraw: g => { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,.7)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); },
});
// a power cut: on, a stutter, off (keyframes for glows)
const cut = (t, k = 1) => [[0, k], [t - .3, k], [t - .22, .25 * k], [t - .14, k], [t - .04, k], [t + .04, 0]];
const ground = (col, base, seed, reedsAt = [-.2, -.1]) => x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt, reedsN: 18, stones: 5 }); };
// the procession: small lantern carriers along a path that climbs to the forest (u: 0 → 1)
const PATH = u => [lerp(-.09, .1, u), .085 + .05 * u * u];

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook: a lit town at night, then every window, the lamps and the moon go out at once on "out"
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: end('L02') + .5, v: .4 }, { t: end('L01') - .32, type: 'click' }, { t: end('L01') - .2, type: 'click', v: .7 }],
      build: E => {
        const out = E.cueEnd('L01') - .3;
        return layered(E, {
          light: [0, .16, -.13], lightR: .24, sky: { stops: NIGHT, stars: 150 }, on: false,
          layers: [
            { name: 'moon', z: -.13, trans: .5, glow: 2.2, glowCol: '#ffe6b0', ...moonDisc(-.07, .24, .022) },
            { name: 'back', z: -.105, trans: .4, glow: 2.4, draw: x => houses(x, { x0: -.24, x1: .24, by: .1, h: .04, seed: 3, col: '#33497e' }), glowDraw: g => houses(null, { x0: -.24, x1: .24, by: .1, h: .04, seed: 3 }, g) },
            { name: 'hill', z: -.1, trans: .3, draw: x => { x.fillStyle = '#33497e'; x.fillRect(-.25, -.45, .5, .55); } },
            { name: 'mid', z: -.08, trans: .25, glow: 2.6, draw: x => { x.fillStyle = '#1b284f'; x.fillRect(-.25, -.45, .5, .513); houses(x, { x0: -.22, x1: .24, by: .063, h: .055, seed: 8, col: '#1b284f' }); },
              glowDraw: g => houses(null, { x0: -.22, x1: .24, by: .063, h: .055, seed: 8 }, g) },
            { name: 'lamps', z: -.06, trans: .15, glow: 3, draw: x => { streetlamp(x, { cx: -.085, by: .02, h: .13, col: '#0e1532' }); streetlamp(x, { cx: .1, by: .02, h: .13, col: '#0e1532', dir: -1 }); },
              glowDraw: g => { streetlamp(null, { cx: -.085, by: .02, h: .13 }, g); streetlamp(null, { cx: .1, by: .02, h: .13, dir: -1 }, g); } },
            { name: 'fg', z: -.025, trans: .04, draw: ground('#0e1532', .025, 4, [-.2, -.12]) },
          ],
          glows: { moon: cut(out + .3), back: cut(out), mid: cut(out + .1), lamps: cut(out + .2) },
          update: (t, L, S) => { const k = 1 - .7 * ss(seg(t, out, out + .5)); S.U.uLit.value = k; L.moon.material.color.setScalar(1 - .75 * ss(seg(t, out + .3, out + .6))); },
          cam: [[0, [0, .1, .6, 0, .11, -.07]], [out, [0, .085, .54, 0, .1, -.07]], [E.dur, [.01, .08, .5, .01, .095, -.07]]],
          focus: -.08, aper: 14,
          grade: t => ({ expo: 1.06 - .2 * ss(seg(t, out, out + .6)), sat: 1.04 - .2 * ss(seg(t, out, out + .6)) }),
        });
      } },

    // 2 · Streetlamps. Phones. Even the moon: a tilt up the dead lamp post to the dark moon
    { id: 'S2', start: at('L02') - .25, in: { type: 'dissolve', dur: .6 },
      build: E => layered(E, {
        light: [-.05, .2, -.13], lightR: .12, lightCol: '#9fb2e8', key: .6, amb: .25, sky: { stops: DARK, stars: 120 }, on: false,
        layers: [
          { name: 'moon', z: -.13, trans: .4, glow: 2.2, glowCol: '#ffe6b0', ...moonDisc(-.05, .2, .035) },
          { name: 'roofs', z: -.1, trans: .25, draw: x => { x.fillStyle = '#18244a'; x.fillRect(-.25, -.45, .5, .5); houses(x, { x0: -.24, x1: .24, by: .05, h: .06, seed: 12, col: '#18244a' }); } },
          { name: 'lamp', z: -.06, trans: .08, glow: 3, draw: x => streetlamp(x, { cx: .06, by: -.2, h: .4, col: '#0a0f24', dir: -1 }), glowDraw: g => streetlamp(null, { cx: .06, by: -.2, h: .4, dir: -1 }, g) },
        ],
        glows: { lamp: [[0, 0]], moon: [[0, .9], [E.cue('L02') + C.L02.dur * .6, .9], [E.cue('L02') + C.L02.dur * .85, 0]] },
        update: (t, L) => L.moon.material.color.setScalar(1 - .7 * ss(seg(t, E.cue('L02') + C.L02.dur * .6, E.cue('L02') + C.L02.dur * .95))),
        cam: [[0, [.02, -.02, .56, .03, .0, -.07]], [E.dur, [-.02, .12, .58, -.03, .15, -.07]]],
        focus: [[0, -.06], [E.dur, -.12]], aper: 14, grade: { sat: .8 },
      }) },

    // 3 · But your neighbours aren't scared: one by one their lanterns light up along the dark street, and they smile
    { id: 'S3', start: at('L03') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'shimmer', v: .5 }],
      build: E => {
        const t0 = E.cue('L03') + .2, P = [[-.1, .062, .07], [-.035, .056, .085], [.04, .06, .078], [.105, .065, .07]];
        return layered(E, {
          light: [0, .1, -.12], lightR: .1, lightCol: '#ffc878', key: .5, amb: .22, sky: { stops: DARK, stars: 90 }, on: false,
          layers: [
            { name: 'row', z: -.1, trans: .2, draw: x => { x.fillStyle = '#16213f'; x.fillRect(-.25, -.45, .5, .51); houses(x, { x0: -.24, x1: .24, by: .06, h: .07, seed: 21, col: '#16213f' }); } },
            ...P.map(([cx, by, s], i) => ({ name: 'n' + i, z: -.07 + i * .004, trans: .1, glow: 3.2, w: .1, h: .14, x: cx, y: by + s / 2,
              draw: x => neighbor(x, { cx: 0, by: -s / 2, s, lantern: i % 2 ? 'left' : 'right', smile: true, hat: i === 2, col: '#0a0e1c' }),
              glowDraw: g => neighbor(null, { cx: 0, by: -s / 2, s, lantern: i % 2 ? 'left' : 'right', smile: true }, g) })),
            { name: 'fg', z: -.03, trans: .03, draw: ground('#070a16', .045, 7, [.12, .22]) },
          ],
          glows: Object.fromEntries(P.map((_, i) => ['n' + i, [[0, 0], [t0 + i * .45, 0], [t0 + i * .45 + .25, 1]]])),
          flicker: P.map((_, i) => 'n' + i),
          update: (t, L, S) => { S.U.uLightR.value = .1 + .12 * ss(seg(t, t0, t0 + 2)); },
          cam: [[0, [-.06, .07, .5, -.06, .075, -.07]], [E.cue('L04'), [0, .07, .5, 0, .075, -.07]], [E.dur, [.02, .075, .42, .02, .078, -.07]]],
          focus: -.07, aper: 18,
        });
      } },

    // 4 · You at your window: the lanterns walk up the hill into the old forest; nobody looks back
    { id: 'S4', start: at('L05') - .35, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: 0, type: 'wind', d: end('L07') - at('L05') + 1, v: .5 }],
      build: E => {
        const N = 7, t0 = 0, t1 = E.cueEnd('L07') + .6;
        return layered(E, {
          light: [.0, .12, -.13], lightR: .16, lightCol: '#aabcf0', key: .5, amb: .3, sky: { stops: NIGHT, stars: 140 }, on: false,
          layers: [
            { name: 'forest', z: -.12, trans: .4, draw: x => { x.fillStyle = '#2a3d70'; pines(x, { x0: -.25, x1: .25, base: .13, h: .07, n: 22, seed: 4 }); } },
            { name: 'hill', z: -.11, trans: .35, draw: x => { x.fillStyle = '#22335f'; x.beginPath(); x.moveTo(-.25, -.45); x.lineTo(-.25, .07); x.quadraticCurveTo(0, .085, .25, .14); x.lineTo(.25, -.45); x.closePath(); x.fill(); } },
            ...Array.from({ length: N }, (_, i) => ({ name: 'p' + i, z: -.105, trans: .2, glow: 3, w: .03, h: .03, x: 0, y: 0, shadow: false,
              draw: x => neighbor(x, { cx: 0, by: -.01, s: .016, lantern: 'right', back: true, col: '#0a0e1c' }), glowDraw: g => neighbor(null, { cx: 0, by: -.01, s: .016, lantern: 'right' }, g) })),
            { name: 'wall', z: -.07, trans: .06, draw: x => { x.fillStyle = '#1a1d33'; x.fillRect(-.25, -.45, .5, .9);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.11, .03, .22, .17); x.restore();
              x.fillRect(-.11, .112, .22, .006); x.fillRect(-.003, .03, .006, .17); x.fillStyle = '#121528'; x.fillRect(-.125, .02, .25, .012); } },
            { name: 'you', z: -.04, trans: .02, w: .16, h: .2, x: -.035, y: .03, draw: x => neighbor(x, { cx: 0, by: -.1, s: .19, lantern: false, back: true, col: '#05060d' }) },
          ],
          glows: Object.fromEntries(Array.from({ length: N }, (_, i) => ['p' + i, [[0, 1]]])), flicker: Array.from({ length: N }, (_, i) => 'p' + i),
          update: (t, L) => {
            for (let i = 0; i < N; i++) {   // each walker sets off a little later and fades into the trees at the top of the path
              const u = seg(t, t0 + i * .9 - 2, t1 + i * .9 - 2), [px, py] = PATH(u), m = L['p' + i];
              m.position.set(px, py, -.105); m.scale.setScalar(1 - .45 * u); m.material.userData.u.uGlowLit.value *= 1 - ss(seg(u, .85, 1)); m.visible = u > 0 && u < 1;
            }
          },
          cam: [[0, [-.06, .07, .5, -.04, .085, -.07]], [E.cue('L06'), [-.02, .075, .44, 0, .085, -.07]], [E.dur, [.01, .08, .38, .02, .085, -.07]]],
          focus: [[0, -.04], [E.cue('L06'), -.1], [E.dur, -.105]], aper: 16,
        });
      } },

    // 5 · The dead phone lights up on the nightstand: "Don't follow the lanterns."
    { id: 'S5', start: at('L08') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'click' }, { t: at('L09') - at('L08') + .3, type: 'chime', v: .6 }],
      build: E => {
        const on = E.cue('L08') + .5, msg = E.cue('L09') - .15;
        return layered(E, {
          light: [0, .1, -.12], lightR: .05, lightCol: '#cfe0ff', key: .35, amb: .18, ambCol: '#5a6a9a', sky: { stops: ROOM }, on: false,
          layers: [
            { name: 'wall', z: -.11, trans: .05, draw: x => { x.fillStyle = '#141a33'; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#10152b'; for (let i = 0; i < 9; i++) x.fillRect(-.25 + i * .06, -.45, .004, .9); } },
            { name: 'stand', z: -.075, trans: .04, draw: x => { x.fillStyle = '#0a0d1c'; x.fillRect(-.2, -.45, .4, .5); x.fillRect(-.21, .045, .42, .012); } },
            { name: 'phone', z: -.065, trans: .05, glow: 3.4, glowCol: '#d6e4ff', w: .1, h: .17, x: 0, y: .125,
              draw: x => phone(x, { cx: 0, cy: 0, w: .075, h: .15 }), glowDraw: g => phone(null, { cx: 0, cy: 0, w: .075, h: .15 }, g) },
            { name: 'msg', z: -.062, trans: 0, w: .07, h: .07, x: 0, y: .135, shadow: false, recv: false,
              draw: x => { x.fillStyle = '#e9eefc'; x.fillRect(-.031, -.022, .062, .044);
                text(x, "DON'T FOLLOW", 0, .007, .0095, '"Anton"', { fill: '#b3302a' }); text(x, 'THE LANTERNS', 0, -.007, .0095, '"Anton"', { fill: '#b3302a' }); } },
            { name: 'time', z: -.062, trans: 0, w: .07, h: .03, x: 0, y: .178, shadow: false, recv: false, draw: x => text(x, '2:19', 0, 0, .014, '"Anton"', { fill: '#1b2440' }) },
          ],
          glows: { phone: [[0, 0], [on - .15, 0], [on - .08, .7], [on, .2], [on + .1, 1]] },
          update: (t, L, S) => {
            const k = ss(seg(t, on - .1, on + .3)), m = ss(seg(t, msg, msg + .35));
            S.U.uLightR.value = .05 + .12 * k; S.U.uLit.value = .3 + .7 * k;
            L.time.visible = k > .05; L.time.material.color.setScalar(k);
            L.msg.visible = m > 0; L.msg.material.color.setScalar(m); L.msg.scale.setScalar(.85 + .15 * m);
          },
          cam: [[0, [.03, .05, .55, .0, .08, -.07]], [E.cue('L09'), [0, .075, .44, 0, .088, -.07]], [E.dur, [0, .08, .4, 0, .09, -.07]]],
          focus: -.064, aper: 22, grade: { sat: .9, gain: [.95, 1, 1.08] },
        });
      } },

    // 6 · A small light under your window: the fox, looking right at you; then it turns its head toward the trees and waits
    { id: 'S6', start: at('L10') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: .3, type: 'shimmer', v: .7 }],
      build: E => {
        const lit = E.cue('L10') + C.L10.dur * .55, turn = E.cue('L12') + C.L12.dur * .35;
        return layered(E, {
          light: [.02, .07, -.12], lightR: .06, lightCol: '#ffc878', key: .5, amb: .24, sky: { stops: DARK, stars: 100 }, on: false,
          layers: [
            { name: 'trees', z: -.12, trans: .35, draw: x => { x.fillStyle = '#1f2f5c'; pines(x, { x0: -.25, x1: .05, base: .09, h: .09, n: 10, seed: 7 }); x.fillRect(-.25, -.45, .5, .54); } },
            { name: 'house', z: -.085, trans: .12, w: .2, h: .5, x: .12, y: .1, draw: x => house(x, { cx: 0, by: -.05, w: .17, h: .2, roof: .07, cols: 2, rows: 2, col: '#141a35', chimney: .3, door: false }) },
            { name: 'yard', z: -.07, trans: .08, draw: x => { x.fillStyle = '#0d1430'; foreground(x, { base: .05, seed: 11, reedsAt: [-.06, .02], reedsN: 22, stones: 6, amp: .004 }); } },
            { name: 'fox', z: -.062, trans: .2, glow: 3.2, w: .14, h: .14, x: -.02, y: .05, ay: -.05,
              draw: x => fox(x, { cx: 0, by: -.05, s: .075, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.05, s: .075, lantern: true }, g) },
            { name: 'fg', z: -.025, trans: .03, draw: ground('#060914', .0, 13, [-.2, -.05]) },
          ],
          glows: { fox: [[0, 0], [lit - .3, 0], [lit + .3, 1]] }, flicker: ['fox'],
          move: { fox: [[0, [0, 0, 0]], [turn, [0, 0, 0]], [turn + .5, [0, 0, .07]], [E.dur, [0, 0, .07]]] },
          update: (t, L, S) => { const k = ss(seg(t, lit - .3, lit + .5)); S.U.uLightR.value = .06 + .1 * k; S.U.uLight.value.set(.02, .05, -.11); L.fox.scale.x = t < turn + .25 ? 1 : -1; },
          cam: [[0, [.1, .15, .5, .12, .17, -.07]], [E.cue('L11'), [.0, .01, .44, -.01, .02, -.07]], [turn, [-.01, .005, .4, -.02, .015, -.07]], [E.dur, [-.05, .01, .44, -.07, .02, -.07]]],
          focus: [[0, -.085], [E.cue('L11'), -.062], [E.dur, -.07]], aper: 18,
        });
      } },

    // 7 · Behind you, your bedroom door creaks open: a quick push in on the dark gap
    { id: 'S7', start: at('L13') - .2, in: { type: 'dissolve', dur: .35 }, sfx: [{ t: .2 + C.L13.dur * .55, type: 'paper', v: 1.4 }, { t: .3, type: 'whoosh', v: .5 }],
      build: E => {
        const open = E.cue('L13') + C.L13.dur * .5;
        return layered(E, {
          light: [.0, .08, -.135], lightR: .05, lightCol: '#8fa6e8', key: .45, amb: .2, ambCol: '#4a5888', sky: { stops: [[0, '#02030a'], [1, '#0a0f24']] }, on: false,
          layers: [
            { name: 'hall', z: -.12, trans: .5, glow: 1.6, glowCol: '#9fb6ff', draw: x => { x.fillStyle = '#1c2446'; x.fillRect(-.06, -.05, .12, .26); },
              glowDraw: g => { const gr = g.createLinearGradient(0, -.05, 0, .21); gr.addColorStop(0, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(255,255,255,.5)'); g.fillStyle = gr; g.fillRect(-.06, -.05, .12, .26); } },
            { name: 'wall', z: -.09, trans: .04, draw: x => { x.fillStyle = '#121731'; x.fillRect(-.25, -.45, .5, .9); x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.05, -.04, .1, .22); x.restore(); doorFrame(x, { cx: 0, by: -.04, w: .1, h: .22, col: '#0b0f22' }); } },
            { name: 'leaf', z: -.088, trans: .03, w: .1, h: .22, x: 0, y: .07, ax: -.05, draw: x => { x.fillStyle = '#171d3a'; x.fillRect(-.05, -.11, .1, .22); x.fillStyle = '#10142b'; x.fillRect(-.04, .01, .08, .085); x.fillRect(-.04, -.1, .08, .095); x.fillStyle = '#c9a46a'; x.beginPath(); x.arc(.038, 0, .004, 0, Math.PI * 2); x.fill(); } },
            { name: 'fg', z: -.03, trans: .02, draw: x => { x.fillStyle = '#04050c'; x.fillRect(-.25, -.45, .5, .41); x.beginPath(); x.ellipse(-.16, -.04, .1, .02, 0, 0, Math.PI * 2); x.fill(); } },
          ],
          glows: { hall: [[0, 0], [open, 0], [open + .8, 1]] },
          update: (t, L) => { const k = ss(seg(t, open - .2, open + 1.4)); L.leaf.scale.x = Math.max(.05, 1 - .7 * k); },
          cam: [[0, [0, .06, .62, 0, .07, -.07]], [open - .2, [0, .06, .58, 0, .07, -.07]], [open + .6, [0, .065, .46, 0, .07, -.07]], [E.dur, [0, .065, .44, 0, .07, -.07]]],
          focus: -.09, aper: 16, grade: { sat: .7, contrast: .16, lift: [0, .004, .02] },
        });
      } },

    // 8 · Your call: the fox waits at the edge of the forest (GO), your window has one candle (STAY); the choice is cut paper
    { id: 'S8', start: at('L14') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L14') + .5, v: .35 }, { t: at('L15') - at('L14') + .5, type: 'paper' }, { t: end('L15') - at('L14') + .8, type: 'paper' }],
      build: E => {
        const go = E.cue('L15') + C.L15.dur * .55, stay = E.cue('L15') + C.L15.dur * .8, titleAt = E.cueEnd('L15') + .8;
        const sign = (s, cx) => ({ name: s, z: -.05, trans: .25, w: .1, h: .04, x: cx, y: .23, shadow: false, recv: false, finish: { rim: .6 },
          draw: x => { x.fillStyle = '#f1dbac'; x.fillRect(-.04, -.016, .08, .032); text(x, s, 0, -.0005, .022, '"Anton"', { fill: s === 'GO' ? '#e8743b' : '#2b3a6a' }); } });
        return layered(E, {
          light: [0, .12, -.13], lightR: .18, sky: { stops: DARK, stars: 170 }, on: false,
          layers: [
            { name: 'forest', z: -.115, trans: .4, glow: 2.2, draw: x => { x.fillStyle = '#22335f'; pines(x, { x0: -.25, x1: .02, base: .11, h: .1, n: 12, seed: 2 }); x.fillRect(-.25, -.45, .5, .56); },
              glowDraw: g => { g.fillStyle = '#fff'; for (const [px, py] of [[-.17, .13], [-.12, .145], [-.07, .125]]) { g.beginPath(); g.arc(px, py, .0025, 0, Math.PI * 2); g.fill(); } } },
            { name: 'home', z: -.09, trans: .15, glow: 3, draw: x => house(x, { cx: .1, by: .1, w: .11, h: .08, roof: .05, cols: 2, rows: 2, col: '#141a35', chimney: .3, lit: [2] }),
              glowDraw: g => house(null, { cx: .1, by: .1, w: .11, h: .08, roof: .05, cols: 2, rows: 2, lit: [2] }, g) },
            { name: 'field', z: -.07, trans: .08, draw: x => { x.fillStyle = '#0d1430'; foreground(x, { base: .098, seed: 15, reedsAt: [-.02, .04], reedsN: 16, stones: 4, amp: .003 }); } },
            { name: 'fox', z: -.064, trans: .2, glow: 3.2, w: .1, h: .1, x: -.08, y: .13, draw: x => fox(x, { cx: 0, by: -.032, s: .05, lantern: true, flip: true }), glowDraw: g => fox(null, { cx: 0, by: -.032, s: .05, lantern: true, flip: true }, g) },
            sign('GO', -.08), sign('STAY', .1),
            { name: 'title', z: -.045, trans: .3, w: .24, h: .05, x: 0, y: .27, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => text(x, 'Lantern Fox Tales', 0, 0, .016, '"Cormorant"', { fill: '#f1dbac', weight: 600 }) },
            { name: 'fg', z: -.025, trans: .03, draw: ground('#060914', .05, 17, [.1, .22]) },
          ],
          glows: { fox: [[0, 1]], home: [[0, 1]], forest: [[0, .8]] }, flicker: ['fox', 'home'],
          update: (t, L) => {
            for (const [n, t0] of [['GO', go], ['STAY', stay], ['title', titleAt]]) {
              const k = ss(seg(t, t0, t0 + .5)); L[n].visible = k > 0; L[n].material.color.setScalar(k); L[n].position.y = L[n].userData.p0.y - .008 * (1 - k);
            }
          },
          cam: [[0, [0, .11, .44, 0, .12, -.07]], [E.cue('L15'), [0, .11, .52, 0, .12, -.07]], [E.dur, [0, .115, .6, 0, .125, -.07]]],
          focus: [[0, -.064], [go, -.064], [go + .5, -.05]], aper: 14,
        });
      } },
  ];
}
