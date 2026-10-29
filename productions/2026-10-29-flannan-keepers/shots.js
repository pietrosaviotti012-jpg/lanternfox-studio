// The Flannan Isles Keepers (True Mysteries, case 1) — shot list. December 1900: three keepers vanish from Eilean Mòr.
// One fact per line, one new picture per fact (the dark light, the ship, the empty flagpole, the gate, the clock, the lamps,
// the oilskins, the bent railings), then the legend set apart as a page from a poem, and the fox's lantern as the only light left.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, lighthouse, cliffRich, rainTile, rainFall, boat, neighbor, doorFrame, foreground, wallClock, oilskin, peg, flagpole, railing, lensLamp } from './engine/kit/motifs.js';
import { waves, waterTop } from './engine/art.js';
import { table, chair } from './engine/props.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp } from './engine/lib.js';

const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const STORM = [[0, '#06091a'], [.55, '#111a35'], [1, '#22304f']];
const DAWN = [[0, '#2a3552'], [.55, '#55668a'], [1, '#8d97ad']];
const ROOM = [[0, '#06080f'], [1, '#10142a']];
const PAGE = [[0, '#c9b083'], [1, '#e6d3a8']];

const seaNear = (col, line, base, r = .009) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .002, len: .045 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .006, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
// Eilean Mòr: a steep rock with a flat top; cx, top, w = width of the top
const rock = (x, cx, top, w, seed = 4) => {
  x.beginPath(); x.moveTo(cx - w * .9, top - .3);
  const n = 24;
  for (let i = 0; i <= n; i++) { const u = i / n, px = cx + lerp(-w * .62, w * .62, u), edge = Math.min(u, 1 - u);
    x.lineTo(px, top - (edge < .12 ? (.12 - edge) * w * 1.6 : 0) + Math.sin(i * 2.7 + seed) * .0016); }
  x.lineTo(cx + w * .9, top - .3); x.closePath(); x.fill();
};
const RAIN = { w: .495, h: .87, x: .1, y: .145, trans: .5, shadow: false, recv: false };
const sweep = (speed = .55, amp = .7, base = Math.PI * .92) => t => base + Math.sin(t * speed) * amp;
// fade a small text/sign sheet in at t0 (it rises a little as it appears)
const reveal = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); L[n].position.y = L[n].userData.p0.y - .008 * (1 - k); };

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The hook, already lit: the lighthouse on its rock, the beam sweeping, three keepers at its foot. On "vanished"
    //     the three stutter and are gone; the camera pulls back to the whole lonely rock
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'waves', d: at('L02') + 1, v: .7 }, { t: 0, type: 'wind', d: at('L02') + 1, v: .4 }],
      build: E => {
        const gone = E.word('L01', 6);
        return layered(E, {
          light: [.03, .16, -.13], lightR: .22, sky: { stops: NIGHT, stars: 150 }, on: false,
          layers: [
            { name: 'far', z: -.115, trans: .45, draw: x => { x.fillStyle = '#3b5590'; waterTop(x, { x0: -.25, x1: .25, base: -.02, amp: .0008, len: .03 }); } },
            { name: 'isle', z: -.085, trans: .2, glow: 2.8, draw: x => { x.fillStyle = '#1b284f'; rock(x, .0, .0, .3); lighthouse(x, { cx: .035, by: .0, h: .19, col: '#1b284f', footing: .02 }); },
              glowDraw: g => lighthouse(null, { cx: .035, by: .0, h: .19, cottageLit: true }, g) },
            { name: 'keepers', z: -.08, trans: .05, w: .12, h: .06, x: -.07, y: .02, draw: x => { for (const [px, s] of [[-.03, .034], [-.005, .031], [.02, .033]]) neighbor(x, { cx: px, by: -.02, s, lantern: false, col: '#0a0f24' }); } },
            { name: 'sea', z: -.06, trans: .3, draw: seaNear('#2f4680', '#3d5590', -.03) },
            { name: 'fg', z: -.02, trans: .04, draw: seaNear('#0e1532', '#18224a', -.17, .012) },
          ],
          beams: [{ x: .035, y: .166, z: -.084, len: .42, width: .07, rot: sweep(), k: t => .55 + .1 * Math.sin(t * 7.3) * Math.sin(t * 3.1) }],
          update: (t, L) => {
            L.keepers.visible = t < gone - .25 || (t > gone - .17 && t < gone - .09) || (t > gone - .04 && t < gone);   // a stutter, then nothing
            L.sea.position.y = L.sea.userData.p0.y + .003 * Math.sin(t * 1.5);
          },
          cam: [[0, [-.03, .05, .46, -.02, .055, -.07]], [gone + .2, [-.01, .05, .5, 0, .055, -.07]], [E.dur, [.01, .04, .64, .01, .05, -.07]]],
          focus: -.082, aper: 14,
        });
      } },

    // 2 · A bare rock in the Atlantic: the island small on the horizon, the camera rises and pulls back over a huge sea
    { id: 'S2', start: at('L02') - .25, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'whoosh', v: .4 }],
      build: E => layered(E, {
        light: [0, .12, -.13], lightR: .3, sky: { stops: NIGHT, stars: 110 }, on: false,
        layers: [
          { name: 'isle', z: -.12, trans: .4, glow: 2.4, draw: x => { x.fillStyle = '#3f5a92'; rock(x, .0, .045, .07, 2); lighthouse(x, { cx: .006, by: .045, h: .05, col: '#3f5a92', footing: .005 }); },
            glowDraw: g => lighthouse(null, { cx: .006, by: .045, h: .05 }, g) },
          { name: 'far', z: -.11, trans: .4, draw: seaNear('#34508a', '#41609a', .038, .006) },
          { name: 'mid', z: -.085, trans: .3, draw: seaNear('#22355f', '#2e4475', .0, .01) },
          { name: 'near', z: -.05, trans: .1, draw: seaNear('#101a3a', '#1a2650', -.08, .016) },
        ],
        move: { mid: [[0, [0, 0, 0]], [E.dur * .5, [.01, .004, 0]], [E.dur, [0, 0, 0]]], near: [[0, [0, 0, 0]], [E.dur * .5, [-.012, .006, 0]], [E.dur, [0, -.002, 0]]] },
        cam: [[0, [0, .05, .42, 0, .055, -.07]], [E.dur, [0, .07, .68, 0, .06, -.07]]],
        focus: -.12, aper: 12,
      }) },

    // 3 · Then their light went dark: the lamp room big in frame; the beam stutters out on "dark". Then the moon races over
    //     the sky again and again (eleven days) above the black tower
    { id: 'S3', start: at('L03') - .3, in: { type: 'cut' }, sfx: [{ t: .3 + C.L03.dur * .35, type: 'click' }, { t: .3 + C.L03.dur * .4, type: 'click', v: .7 }, { t: .3 + C.L03.dur * .6, type: 'wind', d: 4, v: .6 }],
      build: E => {
        const out = E.word('L03', 4), days = E.word('L03', 7);
        return layered(E, {
          light: [0, .16, -.13], lightR: .2, lightCol: '#cfe0ff', key: .6, amb: .25, sky: { stops: STORM, stars: 90 }, on: false,
          layers: [
            { name: 'moon', z: -.13, trans: .5, glow: 2.4, glowCol: '#ffe6b0', w: .06, h: .06, x: 0, y: .2, shadow: false,
              draw: x => { x.fillStyle = '#d8c79c'; x.beginPath(); x.arc(0, 0, .014, 0, Math.PI * 2); x.fill(); }, glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .014, 0, Math.PI * 2); g.fill(); } },
            { name: 'tower', z: -.08, trans: .15, glow: 3, draw: x => lighthouse(x, { cx: 0, by: -.22, h: .44, col: '#0f1630', cottage: false, footing: 0 }), glowDraw: g => lighthouse(null, { cx: 0, by: -.22, h: .44, cottage: false }, g) },
          ],
          glows: { tower: [[0, 1], [out - .35, 1], [out - .25, .25], [out - .15, .9], [out - .05, .4], [out + .05, 0]], moon: [[0, 0], [days - .2, 0], [days, 1]] },
          flicker: ['tower'],
          beams: [{ x: 0, y: .165, z: -.079, len: .45, width: .08, rot: sweep(.8, .8, Math.PI * .5), k: t => t < out - .35 ? .7 : t < out - .25 ? .1 : t < out - .15 ? .55 : t < out + .05 ? .2 : 0 }],
          update: (t, L, S) => {
            const u = Math.max(0, t - days) * 1.4, ph = u % 1;   // the moon arcs over the tower, once per "day"
            L.moon.visible = t > days - .2; L.moon.position.set(lerp(-.2, .2, ph), .12 + .1 * Math.sin(ph * Math.PI), -.13);
            S.U.uLit.value = 1 - .6 * ss(seg(t, out, out + .5));
          },
          cam: [[0, [0, .13, .36, 0, .13, -.07]], [out + .2, [0, .12, .4, 0, .12, -.07]], [E.dur, [0, .07, .62, 0, .08, -.07]]],
          focus: -.08, aper: 14, grade: t => ({ expo: 1.06 - .22 * ss(seg(t, out, out + .6)), sat: 1 - .2 * ss(seg(t, out, out + .6)) }),
        });
      } },

    // 4 · December 15th: a steamer in the rain passes a dark rock; lightning shows the black lighthouse. (The ship's log is the L04 card.)
    { id: 'S4', start: at('L04') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'rain', d: end('L04') - at('L04') + 1.2, v: .8 }, { t: C.L04.dur * .6 + .3, type: 'thunder', v: .6 }],
      build: E => layered(E, {
        light: [-.05, .12, -.13], lightR: .2, lightCol: '#cfe0ff', key: .6, amb: .22, ambCol: '#6f80b0', sky: { stops: STORM, gain: .9 }, on: false,
        layers: [
          { name: 'isle', z: -.115, trans: .35, draw: x => { x.fillStyle = '#1a2648'; rock(x, .1, .06, .08, 6); lighthouse(x, { cx: .1, by: .06, h: .07, col: '#1a2648', footing: .005, lamp: false }); } },
          { name: 'far', z: -.11, trans: .4, draw: seaNear('#2a3a66', '#34467a', .045, .008) },
          { name: 'ship', z: -.09, trans: .3, w: .12, h: .1, x: -.12, y: .045, ay: -.04, draw: x => { x.fillStyle = '#0b1024'; boat(x, { cx: 0, by: -.04, s: .07 }); x.fillRect(-.012, -.03, .006, .05); } },
          { name: 'mid', z: -.07, trans: .2, draw: seaNear('#16203f', '#22305a', .0, .014) },
          { name: 'rain1', ...RAIN, z: -.04, draw: x => { x.strokeStyle = '#8fa2d0'; rainTile(x, { n: 55, seed: 3 }); } },
          { name: 'rain2', ...RAIN, z: -.015, draw: x => { x.strokeStyle = '#a9b8de'; rainTile(x, { n: 34, seed: 9, len: .03 }); } },
        ],
        move: { ship: [[0, [0, 0, 0]], [E.dur, [.12, 0, 0]]] },
        flash: [E.cue('L04') + C.L04.dur * .6],
        update: (t, L) => { rainFall(L.rain1, t); rainFall(L.rain2, t, { vy: .9 }); L.ship.rotation.z = .04 * Math.sin(t * 1.6); L.mid.position.y = L.mid.userData.p0.y + .003 * Math.sin(t * 1.3); },
        cam: [[0, [-.08, .05, .5, -.07, .055, -.07]], [E.dur, [.02, .06, .54, .03, .06, -.07]]],
        focus: -.09, aper: 12, grade: { sat: .78, contrast: .16, lift: [0, .006, .03], gain: [.95, 1, 1.06] },
      }) },

    // 5 · December 26th, grey noon: the relief boat at the landing, an empty flagpole on the cliff. A flare climbs, bursts red,
    //     and falls; the camera tilts up to the dark lighthouse in the silence
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .6 },
      sfx: [{ t: 0, type: 'waves', d: end('L06') - at('L05') + 1, v: .6 }, { t: at('L06') - at('L05') + .3, type: 'chime', v: .5 }, { t: at('L06') - at('L05') + .3 + C.L06.dur * .35, type: 'whoosh', v: .7 }, { t: at('L06') - at('L05') + .3 + C.L06.dur * .55, type: 'crack', v: .5 }],
      build: E => {
        const fl = E.word('L06', 2) - .1;
        return layered(E, {
          light: [.05, .15, -.13], lightR: .3, lightCol: '#e8ecf5', key: .9, amb: .45, ambCol: '#8a98b8', sky: { stops: DAWN }, on: false,
          layers: [
            { name: 'cliff', z: -.1, trans: .2, draw: x => { x.fillStyle = '#2c3a5c'; cliffRich(x, { x0: -.02, x1: .26, base: -.08, top: .07, side: 1, strata: '#36476d' });
              lighthouse(x, { cx: .15, by: .07, h: .13, col: '#2c3a5c', footing: .01, lamp: false }); flagpole(x, { cx: .06, by: .062, h: .07, col: '#2c3a5c' }); } },
            { name: 'flare', z: -.095, trans: .3, glow: 3.2, glowCol: '#ff5a3a', w: .02, h: .02, x: -.08, y: .0, shadow: false,
              draw: x => { x.fillStyle = '#c0392b'; x.beginPath(); x.arc(0, 0, .0035, 0, Math.PI * 2); x.fill(); }, glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, .005, 0, Math.PI * 2); g.fill(); } },
            { name: 'sea', z: -.08, trans: .3, draw: seaNear('#4a5a80', '#56688f', -.04, .01) },
            { name: 'boat', z: -.07, trans: .1, w: .12, h: .1, x: -.09, y: -.035, ay: -.04, draw: x => { x.fillStyle = '#141a2e'; boat(x, { cx: 0, by: -.04, s: .075 }); x.fillRect(-.022, -.028, .008, .045); } },
            { name: 'fg', z: -.03, trans: .04, draw: seaNear('#232c48', '#2e3858', -.15, .014) },
          ],
          glows: { flare: [[0, 0], [fl, 0], [fl + .1, 1], [fl + 1.6, 1], [fl + 2.4, 0]] },
          update: (t, L) => {
            const u = seg(t, fl, fl + 2.4), f = L.flare;
            f.visible = u > 0 && u < 1; f.position.set(-.08 + .07 * u, .0 + .2 * Math.sin(Math.min(1, u * 1.25) * Math.PI * .5) - .06 * Math.max(0, u - .7), -.095);
            L.boat.rotation.z = .035 * Math.sin(t * 1.3); L.boat.position.y = L.boat.userData.p0.y + .003 * Math.sin(t * 1.3 + 1);
          },
          cam: [[0, [-.05, .02, .52, -.04, .03, -.07]], [E.cue('L05') + C.L05.dur * .6, [.03, .05, .5, .04, .06, -.07]], [fl, [0, .06, .56, 0, .07, -.07]], [E.dur, [.08, .11, .48, .1, .12, -.07]]],
          focus: [[0, -.07], [E.cue('L05') + C.L05.dur * .5, -.1], [E.dur, -.1]], aper: 14, grade: { sat: .7, expo: 1.0, lift: [.01, .012, .02] },
        });
      } },

    // 6 · Joseph Moore climbs alone: a small figure on the zig-zag path up the cliff, the camera climbing with him
    { id: 'S6', start: at('L07') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'steps', n: 8, every: .42, v: .6 }, { t: 0, type: 'wind', d: 4, v: .4 }],
      build: E => {
        const P = [[-.12, -.12], [.05, -.07], [-.06, -.02], [.08, .03], [.02, .07]];
        const path = u => { const s = Math.min(.9999, Math.max(0, u)) * (P.length - 1), i = Math.floor(s), v = s - i; return [lerp(P[i][0], P[i + 1][0], v), lerp(P[i][1], P[i + 1][1], v), P[i + 1][0] > P[i][0] ? 1 : -1]; };
        return layered(E, {
          light: [.05, .2, -.13], lightR: .3, lightCol: '#e8ecf5', key: .9, amb: .45, ambCol: '#8a98b8', sky: { stops: DAWN }, on: false,
          layers: [
            { name: 'top', z: -.11, trans: .25, draw: x => { x.fillStyle = '#3a4868'; lighthouse(x, { cx: .06, by: .1, h: .14, col: '#3a4868', footing: .03, lamp: false }); } },
            { name: 'face', z: -.08, trans: .15, draw: x => { x.fillStyle = '#26324f'; x.beginPath(); x.moveTo(-.25, -.45); x.lineTo(-.25, .1); x.lineTo(.25, .105); x.lineTo(.25, -.45); x.closePath(); x.fill();
              x.strokeStyle = '#3a4868'; x.lineWidth = .006; x.lineCap = 'round'; x.beginPath(); P.forEach(([px, py], i) => i ? x.lineTo(px, py - .004) : x.moveTo(px, py - .004)); x.stroke();
              x.fillStyle = '#1e2843'; for (let i = 0; i < 26; i++) { const sx = -.24 + (i * .37) % .48, sy = -.2 + ((i * .173) % .3); x.beginPath(); x.ellipse(sx, sy, .012, .004, .3, 0, Math.PI * 2); x.fill(); } } },
            { name: 'man', z: -.075, trans: .05, w: .04, h: .05, x: 0, y: 0, shadow: false, draw: x => neighbor(x, { cx: 0, by: -.02, s: .036, lantern: false, back: true, col: '#0a0f1e' }) },
            { name: 'fg', z: -.03, trans: .04, draw: x => { x.fillStyle = '#141b30'; foreground(x, { base: -.17, seed: 9, reedsAt: [.1, .22], reedsN: 14, stones: 5 }); } },
          ],
          update: (t, L) => { const u = ss(seg(t, .2, E.dur + .3)), [px, py, d] = path(u); L.man.position.set(px, py + .018 + .0015 * Math.abs(Math.sin(t * 7.5)), -.075); L.man.scale.x = d; },
          cam: [[0, [-.08, -.08, .42, -.07, -.07, -.07]], [E.dur * .5, [-.02, -.03, .46, -.01, -.02, -.07]], [E.dur, [.04, .04, .5, .04, .05, -.07]]],
          focus: -.076, aper: 16, grade: { sat: .7, lift: [.01, .012, .02] },
        });
      } },

    // 7 · The gate is shut. The door is shut: the low wall, the closed gate, the cottage door behind it; a slow push in
    { id: 'S7', start: at('L08') - .3, in: { type: 'cut' }, sfx: [{ t: .2, type: 'wind', d: 3, v: .35 }],
      build: E => layered(E, {
        light: [0, .15, -.13], lightR: .3, lightCol: '#e8ecf5', key: .8, amb: .4, ambCol: '#8a98b8', sky: { stops: DAWN }, on: false,
        layers: [
          { name: 'house', z: -.11, trans: .15, draw: x => { x.fillStyle = '#2c3a5c'; x.fillRect(-.25, -.45, .5, .55); x.beginPath(); x.moveTo(-.25, .1); x.lineTo(.0, .17); x.lineTo(.25, .1); x.closePath(); x.fill();
            x.fillStyle = '#1b1512'; x.fillRect(-.025, -.04, .05, .1); doorFrame(x, { cx: 0, by: -.04, w: .05, h: .1, col: '#202a46' });
            x.fillStyle = '#c9a46a'; x.beginPath(); x.arc(.016, .01, .002, 0, Math.PI * 2); x.fill();
            x.fillStyle = '#3a3040'; for (const wx of [-.12, .09]) x.fillRect(wx, .02, .035, .04); } },
          { name: 'wall', z: -.07, trans: .06, draw: x => { x.fillStyle = '#171e36'; x.fillRect(-.25, -.45, .5, .4); x.fillRect(-.25, -.05, .19, .045); x.fillRect(.06, -.05, .19, .045);
            x.fillStyle = '#0d1226'; for (let i = 0; i < 9; i++) x.fillRect(-.042 + i * .0105, -.1, .004, .09); x.fillRect(-.045, -.012, .09, .006); x.fillRect(-.045, -.07, .09, .006);
            x.fillRect(-.06, -.1, .012, .1); x.fillRect(.048, -.1, .012, .1); } },
          { name: 'fg', z: -.03, trans: .04, draw: x => { x.fillStyle = '#0e1326'; foreground(x, { base: -.13, seed: 5, reedsAt: [-.22, -.1], reedsN: 16, stones: 4 }); } },
        ],
        cam: [[0, [0, -.02, .5, 0, -.01, -.07]], [E.dur, [0, .0, .36, 0, .0, -.07]]],
        focus: [[0, -.07], [E.dur * .5, -.07], [E.dur, -.11]], aper: 16, grade: { sat: .7, lift: [.01, .012, .02] },
      }) },

    // 8 · The clock has stopped: the clock face fills the frame, the hands frozen; a small push on "stopped"
    { id: 'S8', start: at('L08') + C.L08.dur * .5, in: { type: 'cut' }, sfx: [{ t: .1, type: 'click', v: .8 }],
      build: E => layered(E, {
        light: [-.06, .12, -.12], lightR: .14, lightCol: '#c8d4f0', key: .5, amb: .25, sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'wall', z: -.1, trans: .05, draw: x => { x.fillStyle = '#1a2038'; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#151a30'; for (let i = 0; i < 10; i++) x.fillRect(-.25 + i * .05, -.45, .003, .9); } },
          { name: 'clock', z: -.08, trans: .05, glow: .6, glowCol: '#c8d4f0', w: .14, h: .16, x: 0, y: .07, draw: x => wallClock(x, { cx: 0, cy: 0, r: .05, h: 1, m: 45 }), glowDraw: g => wallClock(null, { cx: 0, cy: 0, r: .05 }, g) },
        ],
        glows: { clock: [[0, .8]] },
        cam: [[0, [.02, .065, .34, .01, .07, -.07]], [E.dur, [0, .07, .27, 0, .07, -.07]]],
        focus: -.08, aper: 20, grade: { sat: .75 },
      }) },

    // 9 · The lamps are filled, ready for the night: the beehive lens, cold glass catching the grey day; a slow arc around it
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .4, type: 'shimmer', v: .5 }],
      build: E => layered(E, {
        light: [0, .08, -.13], lightR: .2, lightCol: '#e8ecf5', key: .7, amb: .35, ambCol: '#8a98b8', sky: { stops: DAWN }, on: false,
        layers: [
          { name: 'panes', z: -.11, trans: .2, draw: x => { x.fillStyle = '#1b2440'; x.fillRect(-.25, -.45, .5, .9); x.save(); x.globalCompositeOperation = 'destination-out'; for (const px of [-.17, -.06, .05, .16]) x.fillRect(px - .045, -.08, .09, .3); x.restore(); } },
          { name: 'lens', z: -.08, trans: .25, glow: 1.4, glowCol: '#e9eef8', draw: x => lensLamp(x, { cx: 0, by: -.08, s: .3 }), glowDraw: g => lensLamp(null, { cx: 0, by: -.08, s: .3 }, g) },
          { name: 'rail', z: -.05, trans: .04, draw: x => { x.fillStyle = '#0d1226'; x.fillRect(-.25, -.45, .5, .32); x.fillRect(-.25, -.11, .5, .008); for (let i = 0; i < 10; i++) x.fillRect(-.24 + i * .053, -.13, .004, .02); } },
        ],
        glows: { lens: [[0, .35], [E.word('L09', 5), .35], [E.word('L09', 5) + .4, .7]] },
        cam: [[0, [-.08, .06, .44, 0, .07, -.07]], [E.dur, [.07, .08, .42, 0, .08, -.07]]],
        focus: -.08, aper: 16, grade: { sat: .8 },
      }) },

    // 10 · One set of oilskins still hangs by the door: three pegs, two empty, one orange coat. Then the storm: the door
    //      bangs open on the "hit", rain and lightning pour in, the camera rushes to the empty doorway
    { id: 'S10', start: at('L10') - .3, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: at('L11') - at('L10') + .3, type: 'crack', v: .9 }, { t: at('L11') - at('L10') + .3, type: 'rain', d: end('L11') - at('L11') + 1.2, v: .9 }, { t: at('L11') - at('L10') + .5, type: 'wind', d: 3, v: 1 }, { t: at('L11') - at('L10') + .3 + C.L11.dur * .5, type: 'thunder', v: .7 }],
      build: E => {
        const bang = E.cue('L11') - .05, one = E.word('L10', 0);
        return layered(E, {
          light: [.0, .1, -.12], lightR: .14, lightCol: '#c8d4f0', key: .55, amb: .3, ambCol: '#6a78a8', sky: { stops: STORM }, on: false,
          layers: [
            { name: 'out', z: -.12, trans: .4, draw: seaNear('#2a3a66', '#34467a', .02, .012) },
            { name: 'rain', ...RAIN, z: -.115, draw: x => { x.strokeStyle = '#8fa2d0'; rainTile(x, { n: 50, seed: 5 }); } },
            { name: 'wall', z: -.09, trans: .05, draw: x => { x.fillStyle = '#2a2420'; x.fillRect(-.25, -.45, .5, .9); x.fillStyle = '#231e1b'; for (let i = 0; i < 12; i++) x.fillRect(-.25 + i * .045, -.45, .003, .9);
              x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(.07, -.08, .1, .22); x.restore(); doorFrame(x, { cx: .12, by: -.08, w: .1, h: .22, col: '#161210' });
              x.fillStyle = '#1a1410'; x.fillRect(-.21, .118, .24, .008); peg(x, { cx: -.17, top: .11, s: .1 }); peg(x, { cx: -.1, top: .11, s: .1 }); oilskin(x, { cx: -.03, top: .11, s: .12 }); } },
            { name: 'leaf', z: -.085, trans: .03, w: .1, h: .22, x: .12, y: .03, ax: .05, draw: x => { x.fillStyle = '#3a2c22'; x.fillRect(-.05, -.11, .1, .22); x.fillStyle = '#2a2018'; for (const py of [-.09, -.01, .07]) x.fillRect(-.045, py, .09, .006); } },
            { name: 'fg', z: -.03, trans: .02, draw: x => { x.fillStyle = '#120e0c'; x.fillRect(-.25, -.45, .5, .35); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#17120f' : '#120e0c'; x.fillRect(-.25 + i * .065, -.105, .06, .004); } } },
          ],
          flash: [bang + .05, E.cue('L11') + C.L11.dur * .5],
          update: (t, L) => { rainFall(L.rain, t, { vy: .7 }); const k = ss(seg(t, bang, bang + .25)); L.leaf.scale.x = 1 - .82 * k; L.leaf.rotation.z = .02 * Math.sin(t * 9) * k; },
          cam: [[0, [-.16, .06, .4, -.16, .065, -.07]], [one, [-.1, .06, .38, -.08, .06, -.07]], [one + .8, [-.04, .055, .36, -.03, .055, -.07]], [bang, [-.03, .05, .4, -.02, .05, -.07]], [bang + .5, [.1, .04, .4, .11, .04, -.07]], [E.dur, [.12, .04, .34, .12, .04, -.07]]],
          focus: [[0, -.09], [bang, -.09], [bang + .5, -.12]], aper: 18, grade: t => ({ sat: .85, lift: [0, .004, .02], expo: 1.06 - .08 * ss(seg(t, bang, bang + .4)) }),
        });
      } },

    // 11 · The west landing, a storm: iron railings bent flat high on the rock; on "wave" a huge sea rises over the whole cliff
    { id: 'S11', start: at('L12') - .3, in: { type: 'cut' },
      sfx: [{ t: 0, type: 'waves', d: end('L13') - at('L12') + 1, v: 1 }, { t: 0, type: 'rain', d: end('L13') - at('L12') + 1, v: .7 }, { t: at('L13') - at('L12') + .3 + C.L13.dur * .65, type: 'thunder', v: .9 }, { t: at('L13') - at('L12') + .3 + C.L13.dur * .6, type: 'whoosh', v: 1 }],
      build: E => {
        const surge = E.word('L13', 5) - .2;
        return layered(E, {
          light: [.05, .12, -.13], lightR: .2, lightCol: '#cfe0ff', key: .7, amb: .25, ambCol: '#6f80b0', sky: { stops: STORM, gain: .9 }, on: false,
          layers: [
            { name: 'cliff', z: -.1, trans: .2, draw: x => { x.fillStyle = '#121a36'; cliffRich(x, { x0: -.26, x1: .1, base: -.1, top: .08, side: -1, strata: '#1a2448' });
              railing(x, { x0: -.16, x1: -.04, by: .062, h: .03, n: 7, bend: 1, col: '#0a0f22' }); x.fillRect(-.2, .058, .18, .005); } },
            { name: 'sea', z: -.08, trans: .25, draw: seaNear('#1c2a52', '#283a68', -.05, .014) },
            { name: 'surge', z: -.06, trans: .35, w: .4, h: .5, x: .02, y: -.4, draw: x => { x.fillStyle = '#d5deef'; x.beginPath(); x.moveTo(-.2, -.25);
              for (let i = 0; i <= 40; i++) { const u = i / 40, px = lerp(-.2, .2, u); x.lineTo(px, .2 + .03 * Math.sin(u * 19) + .02 * Math.sin(u * 47) - .05 * u * u); } x.lineTo(.2, -.25); x.closePath(); x.fill();
              x.fillStyle = '#9fb0d4'; waves(x, { x0: -.2, x1: .2, y0: .17, y1: -.25, r: .016, fill: '#9fb0d4', line: '#d5deef', lw: .001 }); } },
            { name: 'rain1', ...RAIN, z: -.04, draw: x => { x.strokeStyle = '#8fa2d0'; rainTile(x, { n: 55, seed: 7 }); } },
            { name: 'rain2', ...RAIN, z: -.015, draw: x => { x.strokeStyle = '#a9b8de'; rainTile(x, { n: 30, seed: 2, len: .03 }); } },
          ],
          flash: [E.cue('L12') + C.L12.dur * .55, surge + .25],
          update: (t, L) => {
            rainFall(L.rain1, t); rainFall(L.rain2, t, { vy: .9 });
            L.sea.position.y = L.sea.userData.p0.y + .005 * Math.sin(t * 1.8);
            const k = seg(t, surge, surge + 1.1), rise = Math.sin(Math.min(1, k) * Math.PI * .5) * (1 - .35 * ss(seg(t, surge + 1.4, E.dur)));
            L.surge.position.y = L.surge.userData.p0.y + .42 * rise; L.surge.visible = k > 0;
          },
          cam: [[0, [-.12, .08, .36, -.11, .075, -.07]], [E.cue('L13'), [-.07, .06, .44, -.06, .06, -.07]], [surge, [-.04, .05, .52, -.03, .05, -.07]], [E.dur, [-.03, .07, .58, -.02, .06, -.07]]],
          focus: [[0, -.1], [E.cue('L13'), -.1], [surge + .3, -.06]], aper: 14, grade: { sat: .72, contrast: .18, lift: [0, .006, .03], gain: [.95, 1, 1.06] },
        });
      } },

    // 12 · The legend, set apart: a page from the 1912 poem, a table laid for dinner and a chair on its side (the poem's details, not the record), cut in cream paper;
    //      a red LEGEND stamp lands on "Legend"
    { id: 'S12', start: at('L14') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .2, type: 'paper', v: .8 }, { t: .3 + C.L14.dur * .66, type: 'paper', v: 1.4 }],
      build: E => {
        const stamp = E.word('L14', 7) - .05;
        return layered(E, {
          light: [0, .08, -.13], lightR: .3, lightCol: '#ffe2ae', key: .9, amb: .45, ambCol: '#a08a6a', keyCol: '#ffe8c8', sky: { stops: PAGE }, on: false,
          layers: [
            { name: 'head', z: -.12, trans: .1, w: .26, h: .06, x: 0, y: .19, shadow: false, draw: x => { text(x, 'FLANNAN ISLE', 0, .008, .018, '"Cormorant"', { fill: '#5a3e24', weight: 700 }); text(x, 'a ballad · 1912', 0, -.014, .011, '"Cormorant"', { fill: '#7a5a38', weight: 500 }); } },
            { name: 'room', z: -.1, trans: .1, draw: x => { x.fillStyle = '#6b4a2c'; x.fillRect(-.25, -.45, .5, .43); x.fillStyle = '#5a3d24'; for (let i = 0; i < 9; i++) x.fillRect(-.25 + i * .06, -.02, .003, .2); } },
            { name: 'table', z: -.08, trans: .05, draw: x => { x.fillStyle = '#2b1a0e'; table(x, -.02, .05, .17, .07);
              x.fillStyle = '#e6d3a8'; for (const px of [-.08, -.02, .04]) { x.beginPath(); x.ellipse(px, .056, .016, .004, 0, 0, Math.PI * 2); x.fill(); }
              x.fillStyle = '#2b1a0e'; x.fillRect(-.03, .056, .02, .01); x.beginPath(); x.ellipse(.04, .062, .008, .006, 0, 0, Math.PI * 2); x.fill(); } },
            { name: 'chair', z: -.075, trans: .05, w: .1, h: .1, x: .11, y: -.01, draw: x => { x.fillStyle = '#2b1a0e'; x.save(); x.rotate(-Math.PI / 2); chair(x, 0, -.03, .06, 1); x.restore(); } },
            { name: 'stamp', z: -.05, trans: .2, w: .16, h: .06, x: .03, y: .12, shadow: false, recv: false, finish: { rim: .5 },
              draw: x => { x.strokeStyle = '#b3302a'; x.lineWidth = .003; x.strokeRect(-.065, -.02, .13, .04); text(x, 'LEGEND', 0, -.001, .026, '"Anton"', { fill: '#b3302a' }); } },
            { name: 'fg', z: -.03, trans: .04, draw: x => { x.fillStyle = '#3a2614'; x.fillRect(-.25, -.45, .5, .36); x.fillStyle = '#2b1a0e'; x.fillRect(-.25, -.09, .5, .006); } },
          ],
          update: (t, L) => {
            const k = seg(t, stamp, stamp + .18), s = L.stamp;
            s.visible = k > 0; s.scale.setScalar(1 + 1.2 * (1 - ss(k))); s.rotation.z = -.12;
          },
          cam: [[0, [-.04, .07, .44, -.03, .07, -.07]], [stamp, [.02, .08, .46, .02, .08, -.07]], [E.dur, [.02, .09, .5, .02, .09, -.07]]],
          focus: -.08, aper: 18, grade: { sat: .9, gain: [1.06, 1, .9] },
        });
      } },

    // 13 · Your theory: night again, the fox on the near headland with its lantern, the only light, looking across the sea at
    //      the dark lighthouse; WAVE and SOMETHING ELSE? are cut paper, then the title
    { id: 'S13', start: at('L15') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'waves', d: DUR - at('L15') + .5, v: .5 }, { t: .3, type: 'shimmer', v: .6 }, { t: at('L16') - at('L15') + .5, type: 'paper' }, { t: end('L16') - at('L15') + .8, type: 'paper' }],
      build: E => {
        const a = E.word('L16', 1), b = E.word('L16', 4) - .3, titleAt = E.cueEnd('L16') + .7;
        const sign = (name, s, cx, w, fill) => ({ name, z: -.05, trans: .25, w: w + .01, h: .036, x: cx, y: .2, shadow: false, recv: false, finish: { rim: .6 },
          draw: x => { x.fillStyle = '#f1dbac'; x.fillRect(-w / 2, -.015, w, .03); text(x, s, 0, -.0005, .016, '"Anton"', { fill }); } });
        return layered(E, {
          light: [-.06, .06, -.12], lightR: .12, lightCol: '#ffc878', key: .5, amb: .24, sky: { stops: NIGHT, stars: 170 }, on: false,
          layers: [
            { name: 'isle', z: -.12, trans: .4, draw: x => { x.fillStyle = '#2a3d70'; rock(x, .09, .09, .09, 3); lighthouse(x, { cx: .095, by: .09, h: .075, col: '#2a3d70', footing: .006, lamp: false }); } },
            { name: 'far', z: -.11, trans: .4, draw: seaNear('#34508a', '#41609a', .075, .007) },
            { name: 'head', z: -.075, trans: .15, draw: x => { x.fillStyle = '#121a38'; cliffRich(x, { x0: -.26, x1: .04, base: -.06, top: .05, side: -1, strata: '#1a2448' }); } },
            { name: 'fox', z: -.068, trans: .2, glow: 3.2, w: .14, h: .14, x: -.07, y: .1, ay: -.05,
              draw: x => fox(x, { cx: 0, by: -.05, s: .07, lantern: true }), glowDraw: g => fox(null, { cx: 0, by: -.05, s: .07, lantern: true }, g) },
            sign('WAVE', 'WAVE', -.055, .05, '#2b3a6a'), sign('ELSE', 'SOMETHING ELSE?', .045, .1, '#e8743b'),
            { name: 'title', z: -.045, trans: .3, w: .18, h: .04, x: 0, y: .245, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => text(x, 'Lantern Fox Tales', 0, 0, .013, '"Cormorant"', { fill: '#f1dbac', weight: 600 }) },
            { name: 'fg', z: -.025, trans: .03, draw: x => { x.fillStyle = '#060914'; foreground(x, { base: -.12, seed: 13, reedsAt: [-.2, -.05], reedsN: 18, stones: 5 }); } },
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          update: (t, L) => { reveal(L, 'WAVE', t, a); reveal(L, 'ELSE', t, b); reveal(L, 'title', t, titleAt); L.far.position.y = L.far.userData.p0.y + .002 * Math.sin(t * 1.2); },
          cam: [[0, [-.08, .08, .4, -.07, .085, -.07]], [E.cue('L16'), [-.01, .1, .5, 0, .11, -.07]], [E.dur, [0, .12, .58, 0, .13, -.07]]],
          focus: [[0, -.068], [a, -.068], [a + .5, -.05]], aper: 14,
        });
      } },
  ];
}
