// Lantern Night · Part 2 (Your Call) — shot list. One of you said GO: at 2:23 am you follow the fox out of the window, with
// footsteps behind you that match yours. In the old forest hundreds of lanterns hang in the trees, and under each one a
// neighbor stands, eyes shut, smiling. One lantern is dark and has your name; the fox lights it; the footsteps stop at the tree
// line; a neighbor whispers (Nicole): close your eyes, it can't see you. They're hiding. At 6:12 am everyone walks home, except
// the fox, whose lantern is fading. The same neighbor, at her door: don't go back, it hunts after dark. At 5:41 pm, with the
// sun going down: go back for the fox, or stay home? Your call, GO or STAY: the majority writes Part 3.
// Redo (2026-10-31): every figure stands on its ground (no feet above a ground line, also while walking off), close-ups framed
// on the face with the floor under them; sounds of the story (window, steps, a breath at the tree line, lanterns catching,
// a morning bell, a door) instead of thunder and floor creaks in the forest.
// Redo 2 (2026-10-31): every sound effect at half its level (-6 dB), so the narrator sits clearly on top.
// The threat is never shown: only the footsteps, a long shadow that is not yours, the dark beyond the trees.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, hangLantern, house, houses, neighbor, pines, person, doorFrame, foreground } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';
import { seg, ss } from './engine/lib.js';

const T = theme('your-call', 'notte'), D = theme('your-call', 'alba');
// the lifted night of Part 1 (houses and trees read against it), and a darker one for the forest
const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const WOOD = [[0, '#070b1c'], [.5, '#14204a'], [.85, '#26345f'], [1, '#33447a']];
const DUSK = [[0, '#141a3c'], [.55, '#3e2f5e'], [.85, '#a0566a'], [1, '#e08a5a']];   // 5:41 pm, the sun going down
const YOU = { coat: '#f2b632', hat: false, pants: '#2d3550' };   // you: the yellow coat, the one colour that reads at a glance
const NB = ['#4a5a8a', '#6a4a6e', '#3e6a6a', '#7a5a42', '#55608a'];   // the neighbors' coats, muted

const rnd = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const ground = (col, base, seed, reedsAt = [-.2, -.1]) => x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt, reedsN: 16, stones: 4 }); };
const fill = col => x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .9); };
// tall trunks with a few bare branches: the inside of the old forest
const trunks = (col, { x0 = -.24, x1 = .24, n = 9, w = .014, seed = 3, top = .3 } = {}) => x => {
  const R = rnd(seed); x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const cx = x0 + (x1 - x0) * (i + .2 + R() * .6) / n, ww = w * (.7 + R() * .6);
    x.fillRect(cx - ww / 2, -.45, ww, top + .45);
    x.lineWidth = ww * .35;
    for (let k = 0; k < 3; k++) { const by = .02 + R() * .22, d = R() < .5 ? -1 : 1, l = .03 + R() * .04;
      x.beginPath(); x.moveTo(cx, by); x.quadraticCurveTo(cx + d * l * .5, by + .01, cx + d * l, by + .025); x.stroke(); }
  }
};
// lanterns hanging from the branches on strings: [cx, cy, r] for each, seeded
const lanternSpots = (seed, n, [x0, x1], [y0, y1], r) => { const R = rnd(seed); return Array.from({ length: n }, () => [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), r * (.75 + R() * .5)]); };
const lanterns = spots => ({
  draw: x => spots.forEach(([cx, cy, r]) => hangLantern(x, { cx, cy, r, string: .4 }, null)),
  glowDraw: g => spots.forEach(([cx, cy, r]) => hangLantern(null, { cx, cy, r, string: .4 }, g)),
});
const foxLayer = (cx, by, s, z = -.06, flip = false, name = 'fox') => ({ name, z, trans: .2, glow: 3.2, w: s * 2.6, h: s * 2.6, x: cx, y: by + s,
  draw: x => fox(x, { cx: 0, by: -s, s, lantern: true, flip }), glowDraw: g => fox(null, { cx: 0, by: -s, s, lantern: true, flip }, g) });
// a neighbor standing under a lantern, eyes shut and smiling (the smile catches the light in g)
const sleeper = (name, cx, by, s, z, col) => ({ name, z, trans: .08, glow: 2.4, glowCol: '#ffd9a0', w: s * .5, h: s * 1.1, x: cx, y: by + s * .5,
  draw: x => neighbor(x, { cx: 0, by: -s * .5, s, lantern: false, smile: true, col }), glowDraw: g => neighbor(null, { cx: 0, by: -s * .5, s, lantern: false, smile: true }, g) });
const reveal = (L, n, t, t0, d = .5) => { const k = ss(seg(t, t0, t0 + d)); L[n].visible = k > 0; L[n].material.color.setScalar(k); };

// a forest floor in front of a close-up figure: its top sits just above the feet, so the figure stands on it
const floorAt = (col, base, seed) => ({ name: 'floor', z: -.073, trans: .03, draw: x => { x.fillStyle = col; foreground(x, { base, seed, reedsAt: [-.2, .2], reedsN: 8, stones: 2, amp: .002 }); } });

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The vote, and the window: you from behind at your bedroom window, the fox's lantern in the yard below, sitting on
    //     the grass, waiting. The vote card (GO 1 · STAY 0) drops on frame 0. A slow push to the glass; the window creaks open.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: end('L01') + .6, v: .17 }, { t: end('L01') - .05, type: 'door-creak', v: .28 }, { t: end('L01') + .3, type: 'whoosh', v: .2 }],
      build: E => layered(E, {
        light: [0, .07, -.12], lightR: .1, lightCol: T.light, key: .55, amb: .3, sky: { stops: NIGHT, stars: 90 }, on: false,
        layers: [
          { name: 'trees', z: -.125, trans: .35, draw: x => { x.fillStyle = '#2b3a68'; pines(x, { x0: -.25, x1: .25, base: .1, h: .08, n: 16, seed: 5 }); } },
          { name: 'yard', z: -.115, trans: .2, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .075, seed: 3, reedsAt: [-.15, .1], reedsN: 14, stones: 3, amp: .004 }); } },
          foxLayer(.03, .062, .04, -.11),
          { name: 'wall', z: -.07, trans: .05, draw: x => { x.fillStyle = '#1a1d33'; x.fillRect(-.25, -.45, .5, .9);
            x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.1, .04, .2, .17); x.restore();
            x.fillRect(-.1, .124, .2, .006); x.fillRect(-.003, .04, .006, .17); x.fillStyle = '#121528'; x.fillRect(-.115, .03, .23, .012); } },
          { name: 'room', z: -.05, trans: .02, draw: x => { x.fillStyle = '#0b0d1a'; x.fillRect(-.25, -.45, .5, .345); } },   // the bedroom floor, under your feet
          { name: 'you', z: -.045, trans: .02, w: .16, h: .22, x: -.05, y: .0, draw: x => neighbor(x, { cx: 0, by: -.1, s: .2, lantern: false, back: true, col: '#05060d' }) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [-.01, .085, .42, -.01, .085, -.07]], [E.dur, [.015, .09, .36, .015, .09, -.07]]],
        focus: [[0, -.08], [E.dur, -.1]], aper: 16,
      }) },

    // 2 · Footsteps that match yours: you cross the yard towards the trees, the fox ahead; from the bottom of the frame a long
    //     shadow that is not yours stretches up the grass and keeps pace. Two sets of steps, a beat apart; a breath behind you.
    { id: 'S2', start: at('L02') - .2, in: { type: 'dissolve', dur: .35 },
      sfx: [{ t: 0, type: 'steps', d: 3, v: .3, pan: .2 }, { t: .14, type: 'steps', d: 3, v: .38, pan: -.3 }, { t: end('L02') - at('L02') + .25, type: 'breath', v: .23, pan: -.4 }],
      build: E => layered(E, {
        light: [.02, .1, -.12], lightR: .1, lightCol: T.light, key: .5, amb: .3, sky: { stops: NIGHT, stars: 80 }, on: false,
        layers: [
          { name: 'forest', z: -.12, trans: .35, draw: x => { x.fillStyle = '#2b3a68'; pines(x, { x0: -.25, x1: .25, base: .1, h: .1, n: 18, seed: 8 }); x.fillRect(-.25, -.45, .5, .55); } },
          { name: 'field', z: -.09, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .08, seed: 9, reedsAt: [-.2, .2], reedsN: 22, stones: 3, amp: .004 }); } },
          foxLayer(.035, .064, .035, -.085),
          { name: 'you', z: -.07, trans: .05, w: .1, h: .12, x: -.01, y: .085, draw: x => neighbor(x, { cx: 0, by: -.05, s: .1, lantern: false, back: true, col: '#0b0f22' }) },
          { name: 'shadow', z: -.06, trans: 0, shadow: false, draw: x => { x.fillStyle = 'rgba(2,3,8,.85)'; x.beginPath(); x.moveTo(-.07, -.3); x.lineTo(-.02, .03); x.lineTo(-.008, .032); x.lineTo(.03, -.3); x.closePath(); x.fill(); } },
          { name: 'fg', z: -.03, trans: .03, draw: ground('#070a16', .0, 12, [-.22, .15]) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        // walking away up the field: the feet climb with the ground and never pass its top line (.08)
        move: { you: [[0, [0, 0, 0]], [E.dur, [.005, .012, 0]]], fox: [[0, [0, 0, 0]], [E.dur, [.012, .01, 0]]], shadow: [[0, [0, -.05, 0]], [E.dur, [.003, .005, 0]]] },
        cam: [[0, [-.02, .095, .44, -.01, .1, -.07]], [E.dur, [.01, .1, .38, .005, .105, -.07]]],
        focus: -.07, aper: 16,
      }) },

    // 3 · Into the old forest: the fox slips between the first trunks, its light swinging, and gets smaller as it goes in; the
    //     forest floor rises to meet it, so its paws stay on the leaves. The camera follows in, past the trees.
    { id: 'S3', start: at('L03') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .3, type: 'whoosh', v: .17 }, { t: .2, type: 'steps', d: 2.4, v: .17, pan: .1 }],
      build: E => layered(E, {
        light: [.0, .08, -.1], lightR: .07, lightCol: '#ffc878', key: .45, amb: .26, sky: { stops: WOOD, stars: 40 }, on: false,
        layers: [
          { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 12, w: .01, seed: 4 }) },
          { name: 'floor', z: -.1, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .09, seed: 5, reedsAt: [-.2, .2], reedsN: 14, stones: 4, amp: .003 }); } },
          foxLayer(-.02, .045, .045, -.09),
          { name: 'mid', z: -.07, trans: .08, draw: trunks('#101836', { n: 5, w: .022, seed: 11 }) },
          { name: 'near', z: -.035, trans: .04, draw: trunks('#05070f', { x0: -.26, x1: .26, n: 3, w: .04, seed: 2 }) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        move: { fox: [[0, [0, 0, 0]], [E.dur, [.04, .02, 0]]] },
        update: (t, L, S) => { const p = L.fox.position; S.U.uLight.value.set(p.x + .02, p.y + .02, -.1); L.fox.scale.setScalar(1 - .3 * seg(t, 0, E.dur)); },
        cam: [[0, [-.03, .07, .5, -.02, .075, -.07]], [E.dur, [.02, .08, .4, .02, .085, -.07]]],
        focus: [[0, -.07], [E.dur, -.09]], aper: 18,
      }) },

    // 4 · Hundreds of lanterns: a crane up the trunks; a few lanterns burn, then on "hundreds" the whole canopy lights at once,
    //     with a soft rush of flames and a chime.
    { id: 'S4', start: at('L04') - .25, sfx: [{ t: .05, type: 'whoosh', v: .23 }, { t: .25, type: 'chimes', v: .2 }, { t: .3, type: 'fire', d: 1.8, v: .17 }],
      build: E => {
        const on = E.word('L04', 0) - .05, far = lanternSpots(7, 70, [-.22, .22], [.08, .27], .006), near = lanternSpots(13, 16, [-.15, .15], [.1, .25], .011);
        return layered(E, {
          light: [0, .18, -.12], lightR: .12, lightCol: '#ffc878', key: .4, amb: .24, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 14, w: .008, seed: 6 }) },
            { name: 'far', z: -.115, trans: .2, glow: 2.6, ...lanterns(far) },
            { name: 'mid', z: -.09, trans: .08, draw: trunks('#131c3c', { n: 6, w: .018, seed: 17 }) },
            { name: 'near', z: -.08, trans: .2, glow: 3, ...lanterns(near) },
          ],
          glows: { far: [[0, .35], [on, .35], [on + .25, 1]], near: [[0, 0], [on, 0], [on + .15, 1]] }, flicker: ['far', 'near'],
          update: (t, L, S) => { S.U.uLightR.value = .12 + .14 * ss(seg(t, on, on + .6)); },
          cam: [[0, [0, .06, .48, 0, .07, -.07]], [on, [0, .1, .46, 0, .12, -.07]], [E.dur, [0, .13, .44, 0, .16, -.07]]],
          focus: -.09, aper: 16,
        });
      } },

    // 5 · Under each one a neighbor, eyes shut, smiling: a slow truck along the row, each smile catching its lantern. The forest
    //     floor reaches above every pair of feet.
    { id: 'S5', start: at('L05') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: .3, type: 'breath', v: .12 }],
      build: E => {
        const P = [[-.13, .06], [-.065, .07], [0, .062], [.065, .072], [.13, .058]];
        return layered(E, {
          light: [0, .14, -.12], lightR: .18, lightCol: '#ffc878', key: .5, amb: .3, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 14, w: .008, seed: 21 }) },
            { name: 'glowfar', z: -.118, trans: .2, glow: 2.2, ...lanterns(lanternSpots(31, 40, [-.22, .22], [.17, .27], .005)) },
            { name: 'floor', z: -.1, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .078, seed: 22, reedsAt: [-.2, .2], reedsN: 10, stones: 3, amp: .003 }); } },
            { name: 'lan', z: -.088, trans: .2, glow: 3, ...lanterns(P.map(([cx, by]) => [cx, by + .1, .008])) },
            ...P.map(([cx, by], i) => sleeper('n' + i, cx, by, .085, -.085 + i * .001, NB[i])),
            { name: 'fg', z: -.03, trans: .03, draw: ground('#060914', -.02, 23, [-.22, .2]) },
          ],
          glows: { lan: [[0, 1]], glowfar: [[0, 1]], ...Object.fromEntries(P.map((_, i) => ['n' + i, [[0, .8]]])) }, flicker: ['lan', 'glowfar'],
          cam: [[0, [-.06, .1, .42, -.06, .1, -.07]], [E.dur, [.05, .1, .4, .05, .1, -.07]]],
          focus: -.085, aper: 18,
        });
      } },

    // 6 · One dark lantern has your name: a close-up of an unlit paper lantern on its branch, a paper tag hanging from it: YOU.
    //     The burning lanterns blur behind it. A hard cut and a slow push; the tag rustles as it turns.
    { id: 'S6', start: at('L06') - .15, sfx: [{ t: .15 + C.L06.dur * .8, type: 'page', v: .25 }],
      build: E => {
        const tag = E.word('L06', 5);   // 'name'
        return layered(E, {
          light: [.0, .12, -.12], lightR: .1, lightCol: '#ffc878', key: .55, amb: .32, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'bokeh', z: -.125, trans: .2, glow: 2.4, ...lanterns(lanternSpots(41, 26, [-.2, .2], [.0, .28], .012)) },
            { name: 'branch', z: -.08, trans: .05, draw: x => { x.strokeStyle = '#0b0f22'; x.lineWidth = .008; x.lineCap = 'round'; x.beginPath(); x.moveTo(-.25, .22); x.quadraticCurveTo(-.05, .2, .1, .24); x.stroke(); } },
            { name: 'dark', z: -.075, trans: .05, w: .08, h: .12, x: 0, y: .14, draw: x => hangLantern(x, { cx: 0, cy: 0, r: .022, string: .046 }) },
            { name: 'tag', z: -.072, trans: .05, w: .06, h: .05, x: .028, y: .105, finish: { rim: .5 }, draw: x => { x.strokeStyle = '#1a1410'; x.lineWidth = .0012; x.beginPath(); x.moveTo(-.02, .018); x.lineTo(0, .008); x.stroke();
              x.fillStyle = '#efe8d8'; x.fillRect(-.016, -.008, .032, .016); text(x, 'YOU', 0, -.0005, .009, '"Anton"', { fill: T.tag }); } },
          ],
          glows: { bokeh: [[0, 1]] }, flicker: ['bokeh'],
          update: (t, L) => { L.dark.material.color.setScalar(.55); L.tag.rotation.z = .08 * Math.sin(t * 1.3); reveal(L, 'tag', t, tag - .3, .35); },
          cam: [[0, [0, .12, .38, 0, .125, -.07]], [E.dur, [0, .12, .32, 0, .125, -.07]]],
          focus: -.075, aper: 26, grade: { sat: .85 },
        });
      } },

    // 7 · The fox lights it: the fox sits up under the branch, lifts its lantern, and your lantern catches with a small flame.
    //     The fox tilts but its paws stay on the floor.
    { id: 'S7', start: at('L07') - .25, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'whoosh', v: .17 }, { t: .25 + C.L07.dur * .6, type: 'fire', d: 2, v: .3 }],
      build: E => {
        const lit = E.cue('L07') + C.L07.dur * .6;
        return layered(E, {
          light: [.04, .12, -.1], lightR: .06, lightCol: '#ffc878', key: .5, amb: .28, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'bokeh', z: -.125, trans: .2, glow: 2.2, ...lanterns(lanternSpots(51, 24, [-.2, .2], [.0, .28], .01)) },
            { name: 'branch', z: -.085, trans: .05, draw: x => { x.strokeStyle = '#0b0f22'; x.lineWidth = .007; x.lineCap = 'round'; x.beginPath(); x.moveTo(.25, .2); x.quadraticCurveTo(.1, .18, -.02, .2); x.stroke(); } },
            { name: 'mine', z: -.08, trans: .2, glow: 3.2, w: .06, h: .1, x: .05, y: .145, draw: x => hangLantern(x, { cx: 0, cy: 0, r: .015, string: .03 }), glowDraw: g => hangLantern(null, { cx: 0, cy: 0, r: .015, string: .03 }, g) },
            { name: 'floor', z: -.075, trans: .08, draw: x => { x.fillStyle = '#131c3c'; foreground(x, { base: .06, seed: 52, reedsAt: [-.2, .2], reedsN: 10, stones: 3, amp: .003 }); } },
            foxLayer(-.03, .045, .065, -.07),
          ],
          glows: { bokeh: [[0, .9]], fox: [[0, 1]], mine: [[0, 0], [lit - .1, 0], [lit, .5], [lit + .08, .2], [lit + .3, 1]] }, flicker: ['fox', 'mine'],
          move: { fox: [[0, [0, 0, 0]], [lit - .4, [.008, 0, -.1]], [E.dur, [.008, 0, -.1]]] },
          update: (t, L, S) => { const k = ss(seg(t, lit, lit + .6)); S.U.uLightR.value = .06 + .08 * k; S.U.uLight.value.set(.04, .13, -.1); },
          cam: [[0, [-.02, .1, .44, -.01, .11, -.07]], [lit, [.0, .11, .4, .01, .12, -.07]], [E.dur, [.01, .115, .38, .02, .125, -.07]]],
          focus: -.075, aper: 18,
        });
      } },

    // 8 · The footsteps stop at the trees: looking back out of the forest, the lantern light ends at the edge; beyond it the
    //     dark field and your town, unlit. Steps, then nothing; in the long silence something breathes out there and the grass
    //     at the edge bends towards us.
    { id: 'S8', start: at('L08') - .3, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: .1, type: 'steps', d: 2, v: .35, pan: .1 }, { t: end('L08') - at('L08') + .35, type: 'creature', v: .15 }, { t: end('L08') - at('L08') + .5, type: 'wind', d: 1.6, v: .23 }],
      build: E => {
        const bend = E.cueEnd('L08') + .3;
        return layered(E, {
          light: [0, .02, -.08], lightR: .12, lightCol: '#ffc878', key: .45, amb: .26, sky: { stops: NIGHT, stars: 60 }, on: false,
          layers: [
            { name: 'town', z: -.125, trans: .3, draw: x => { x.fillStyle = '#26345f'; houses(x, { x0: -.24, x1: .24, by: .1, h: .03, seed: 3, col: '#26345f', lit: false }); x.fillRect(-.25, -.45, .5, .55); } },
            { name: 'field', z: -.11, trans: .15, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .085, seed: 61, reedsAt: [-.2, .2], reedsN: 18, stones: 2, amp: .003 }); } },
            { name: 'edge', z: -.095, trans: .1, draw: x => { x.fillStyle = '#0e1532'; foreground(x, { base: .06, seed: 62, reedsAt: [-.1, .1], reedsN: 30, stones: 0, amp: .003 }); } },
            { name: 'frame', z: -.06, trans: .04, draw: trunks('#05070f', { x0: -.26, x1: .26, n: 4, w: .05, seed: 8 }) },
            { name: 'lan', z: -.055, trans: .2, glow: 3, ...lanterns([[-.12, .2, .01], [.14, .22, .009], [-.04, .25, .007]]) },
          ],
          glows: { lan: [[0, 1]] }, flicker: ['lan'],
          move: { edge: [[0, [0, 0, 0]], [bend, [0, 0, 0]], [bend + .4, [.003, -.002, .01]], [bend + 1, [0, 0, 0]]] },
          cam: [[0, [0, .08, .48, 0, .085, -.07]], [E.dur, [0, .085, .38, 0, .09, -.07]]],
          focus: [[0, -.06], [E.dur, -.1]], aper: 16, grade: { sat: .85 },
        });
      } },

    // 9 · The whisper (Nicole): a close-up of the nearest neighbor under her lantern, eyes shut, a calm smile; her face high in
    //     the frame, the leaves of the forest floor round her feet. Only her lantern crackles.
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'fire', d: end('L09') - at('L09') + .9, v: .1 }],
      build: E => layered(E, {
        light: [.04, .19, -.06], lightR: .08, lightCol: '#ffc878', key: .7, amb: .45, ambCol: '#a89ac8', sky: { stops: WOOD }, on: false,
        layers: [
          { name: 'bokeh', z: -.125, trans: .2, glow: 2.2, ...lanterns(lanternSpots(71, 22, [-.2, .2], [.02, .28], .012)) },
          { name: 'her', z: -.075, trans: .02, draw: x => person(x, { cx: 0, by: 0, s: .2, face: 'sleeping', coat: NB[1], hair: '#3a2a22', pants: '#2a2533' }) },
          floorAt('#131c3c', .006, 72),
          { name: 'lan', z: -.07, trans: .2, glow: 3.2, ...lanterns([[.068, .215, .014]]) },
        ],
        glows: { bokeh: [[0, 1]], lan: [[0, 1]] }, flicker: ['lan', 'bokeh'],
        cam: [[0, [-.01, .1, .36, 0, .105, -.07]], [E.dur, [.01, .1, .32, .005, .105, -.07]]],
        focus: -.075, aper: 24,
      }) },

    // 10 · They're hiding: a pull back and up over the whole clearing, rows of neighbors under rows of lanterns, a low rumble
    //      from beyond the trees. Hit on "hiding". The floor rises above the back row's feet.
    { id: 'S10', start: at('L10') - .15, sfx: [{ t: .05, type: 'rumble', d: 2.6, v: .2 }, { t: .1, type: 'whoosh', v: .23 }],
      build: E => {
        const back = [-.16, -.1, -.04, .02, .08, .14].map((cx, i) => [cx + .01 * (i % 2), .1 + .004 * (i % 3)]);
        const front = [-.13, -.065, 0, .065, .13].map((cx, i) => [cx, .055 + .004 * (i % 2)]);
        return layered(E, {
          light: [0, .16, -.12], lightR: .2, lightCol: '#ffc878', key: .5, amb: .3, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 16, w: .007, seed: 81 }) },
            { name: 'glowfar', z: -.12, trans: .2, glow: 2.2, ...lanterns(lanternSpots(83, 60, [-.24, .24], [.18, .28], .005)) },
            { name: 'floor', z: -.11, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .116, seed: 84, reedsAt: [-.2, .2], reedsN: 8, stones: 0, amp: .002 }); } },
            { name: 'lanB', z: -.1, trans: .2, glow: 2.6, ...lanterns(back.map(([cx, by]) => [cx, by + .07, .005])) },
            ...back.map(([cx, by], i) => sleeper('b' + i, cx, by, .055, -.1 + i * .0005, NB[(i + 2) % 5])),
            { name: 'lanF', z: -.085, trans: .2, glow: 3, ...lanterns(front.map(([cx, by]) => [cx, by + .1, .007])) },
            ...front.map(([cx, by], i) => sleeper('f' + i, cx, by, .08, -.085 + i * .0005, NB[i])),
          ],
          glows: { glowfar: [[0, 1]], lanB: [[0, 1]], lanF: [[0, 1]] }, flicker: ['lanF', 'lanB'],
          cam: [[0, [0, .1, .36, 0, .1, -.07]], [E.dur, [0, .12, .5, 0, .11, -.07]]],
          focus: -.09, aper: 14,
        });
      } },

    // 11 · You shut your eyes and wait: you, close, under your own lantern, now burning. Scared, then on "shut" the eyes close.
    //      In the long silence, one slow step passes behind you, and you hold your breath.
    { id: 'S11', start: at('L11') - .3, in: { type: 'dissolve', dur: .6 },
      sfx: [{ t: .2, type: 'breath', v: .17 }, { t: end('L11') - at('L11') + .45, type: 'steps', d: 1.2, v: .15, pan: -.6 }],
      build: E => {
        const shut = E.word('L11', 2);
        return layered(E, {
          light: [-.04, .19, -.06], lightR: .08, lightCol: '#ffc878', key: .7, amb: .45, ambCol: '#a89ac8', sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'bokeh', z: -.125, trans: .2, glow: 2.2, ...lanterns(lanternSpots(91, 22, [-.2, .2], [.02, .28], .012)) },
            { name: 'open', z: -.075, trans: .02, draw: x => person(x, { ...YOU, cx: 0, by: 0, s: .2, face: 'scared' }) },
            { name: 'shut', z: -.0749, trans: .02, draw: x => person(x, { ...YOU, cx: 0, by: 0, s: .2, face: 'sleeping' }) },
            floorAt('#131c3c', .006, 92),
            { name: 'lan', z: -.07, trans: .2, glow: 3.2, ...lanterns([[-.068, .215, .014]]) },
          ],
          glows: { bokeh: [[0, 1]], lan: [[0, 1]] }, flicker: ['lan', 'bokeh'],
          update: (t, L) => { L.open.visible = t < shut; L.shut.visible = t >= shut; },
          cam: [[0, [0, .1, .34, 0, .105, -.07]], [E.dur, [0, .1, .3, 0, .105, -.07]]],
          focus: -.075, aper: 24,
        });
      } },

    // 12 · 6:12 am: dawn through the trees (your-call/alba), the lanterns going out one by one, the neighbors walking home up the
    //      field (their feet stay under its top line as they go). A far bell, a dog, steps on the path.
    { id: 'S12', start: at('L12') - .4, in: { type: 'dissolve', dur: .8 },
      sfx: [{ t: .5, type: 'bell', v: .17 }, { t: .8, type: 'steps', d: 3, v: .2, pan: -.3 }, { t: 2.2, type: 'dog', v: .1, pan: .5 }],
      build: E => {
        const W = [[-.08, .05], [-.02, .055], [.04, .048], [.1, .056]];
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, lightCol: D.light, key: .9, amb: .6, ambCol: '#d8b8c0', sky: { stops: D.sky }, on: false,
          layers: [
            { name: 'far', z: -.125, trans: .4, draw: x => { x.fillStyle = D.far; houses(x, { x0: -.24, x1: .24, by: .095, h: .03, seed: 3, col: D.far, lit: false }); x.fillRect(-.25, -.45, .5, .545); } },
            { name: 'field', z: -.105, trans: .15, draw: x => { x.fillStyle = D.mid; foreground(x, { base: .086, seed: 73, reedsAt: [-.2, .2], reedsN: 14, stones: 2, amp: .003 }); } },
            ...W.map(([cx, by], i) => ({ name: 'w' + i, z: -.095 + i * .001, trans: .05, w: .05, h: .08, x: cx, y: by + .035,
              draw: x => neighbor(x, { cx: 0, by: -.035, s: .065, lantern: false, back: true, col: NB[i] }) })),
            { name: 'trees', z: -.06, trans: .05, draw: trunks(D.near, { x0: -.26, x1: .26, n: 4, w: .035, seed: 14 }) },
            { name: 'lan', z: -.055, trans: .2, glow: 2.6, ...lanterns([[-.14, .2, .01], [.12, .23, .009], [-.06, .26, .007], [.05, .2, .008]]) },
          ],
          glows: { lan: [[0, 1], [E.cue('L12') + C.L12.dur * .5, 1], [E.cueEnd('L12') + .6, 0]] },
          move: Object.fromEntries(W.map((_, i) => ['w' + i, [[0, [0, 0, 0]], [E.dur, [.02 + .005 * i, .012, 0]]]])),
          update: (t, L) => W.forEach((_, i) => L['w' + i].scale.setScalar(1 - .35 * seg(t, 0, E.dur))),
          cam: [[0, [0, .07, .44, 0, .08, -.07]], [E.dur, [0, .1, .46, 0, .11, -.07]]],
          focus: -.1, aper: 14, grade: { sat: 1.08, expo: 1.1 },
        });
      } },

    // 13 · Except the fox: morning in the empty forest, the fox sitting alone between the trunks, its lantern still burning but
    //      weaker and weaker. A slow push in on "fading"; a raven far off.
    { id: 'S13', start: at('L13') - .3, in: { type: 'dissolve', dur: .7 },
      sfx: [{ t: .3, type: 'raven', v: .12, pan: .4 }, { t: 0, type: 'fire', d: end('L13') - at('L13') + 1, v: .1 }],
      build: E => layered(E, {
        light: [.02, .1, -.08], lightR: .1, lightCol: '#ffc878', key: .8, amb: .55, ambCol: '#c8a8b8', sky: { stops: D.sky }, on: false,
        layers: [
          { name: 'deep', z: -.125, trans: .4, draw: trunks(D.far, { n: 12, w: .01, seed: 33 }) },
          { name: 'mid', z: -.1, trans: .15, draw: trunks(D.mid, { n: 5, w: .02, seed: 34 }) },
          { name: 'floor', z: -.09, trans: .1, draw: x => { x.fillStyle = D.near; foreground(x, { base: .05, seed: 35, reedsAt: [-.2, .2], reedsN: 14, stones: 3, amp: .003 }); } },
          foxLayer(.0, .044, .07, -.08, true),
        ],
        glows: { fox: [[0, 1], [E.cue('L13') + C.L13.dur * .6, .8], [E.dur, .35]] }, flicker: ['fox'],
        cam: [[0, [0, .1, .5, 0, .11, -.07]], [E.dur, [0, .105, .4, 0, .115, -.07]]],
        focus: -.08, aper: 18,
      }) },

    // 14 · The same neighbor (Nicole), at her front door in the morning light, eyes open now, not smiling: "Don't go back."
    //      She stands on her doorstep; after the line she steps back and the door creaks shut.
    { id: 'S14', start: at('L14') - .3, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: end('L14') - at('L14') + .35, type: 'door-creak', v: .25 }],
      build: E => layered(E, {
        light: [.06, .2, -.05], lightR: .2, lightCol: D.light, key: .85, amb: .6, ambCol: '#d8b8c0', sky: { stops: D.sky }, on: false,
        layers: [
          { name: 'wall', z: -.1, trans: .05, draw: x => { x.fillStyle = D.mid; x.fillRect(-.25, -.45, .5, .9);
            x.fillStyle = '#1a1310'; x.fillRect(-.05, .006, .1, .24); doorFrame(x, { cx: 0, by: .006, w: .1, h: .24, col: D.near }); } },
          { name: 'her', z: -.075, trans: .02, draw: x => person(x, { cx: 0, by: 0, s: .2, face: 'calm', coat: NB[1], hair: '#3a2a22', pants: '#2a2533' }) },
          { name: 'step', z: -.073, trans: .03, draw: x => { x.fillStyle = D.near; x.fillRect(-.25, -.45, .5, .456); x.fillStyle = '#2a2230'; x.fillRect(-.09, .0, .18, .006); } },
        ],
        cam: [[0, [.02, .105, .34, .01, .11, -.07]], [E.dur, [-.01, .105, .31, 0, .11, -.07]]],
        focus: -.075, aper: 22, grade: { sat: .95 },
      }) },

    // 15 · Your call, at 5:41 pm: dusk from your yard. On the left the forest edge, and between the first trees the fox, sitting
    //      on the grass, its lantern a weak dot (GO); on the right your house, one window lit (STAY). A slow crane up; the
    //      choice card rises over it, then the PART 3 card. The wind picks up; far in the trees, something breathes.
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .6 },
      sfx: [{ t: 0, type: 'wind', d: DUR - at('L15') + .5, v: .17 }, { t: end('L16') - at('L15') + .5, type: 'creature', v: .15, pan: -.5 }],
      build: E => layered(E, {
        light: [-.08, .09, -.11], lightR: .06, lightCol: '#ffc878', key: .55, amb: .4, ambCol: '#b07a8a', sky: { stops: DUSK }, on: false,
        layers: [
          { name: 'forest', z: -.12, trans: .35, draw: x => { x.fillStyle = '#1f2648'; pines(x, { x0: -.25, x1: .02, base: .08, h: .11, n: 12, seed: 15 }); } },
          { name: 'field', z: -.11, trans: .15, draw: x => { x.fillStyle = '#151b3a'; foreground(x, { base: .07, seed: 16, reedsAt: [-.2, .2], reedsN: 18, stones: 3, amp: .003 }); } },
          foxLayer(-.09, .062, .028, -.1),
          { name: 'home', z: -.09, trans: .1, glow: 2.4, glowCol: '#ffcf7a', draw: x => house(x, { cx: .13, by: .055, w: .11, h: .075, cols: 2, rows: 2, col: '#0e1330', lit: [3] }),
            glowDraw: g => house(null, { cx: .13, by: .055, w: .11, h: .075, cols: 2, rows: 2, lit: [3] }, g) },
          { name: 'fg', z: -.04, trans: .03, draw: ground('#070a16', .0, 17, [-.22, .2]) },
        ],
        glows: { fox: [[0, .55], [E.dur, .3]], home: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [0, .07, .46, 0, .08, -.07]], [E.dur, [0, .09, .43, 0, .1, -.07]]],
        focus: -.1, aper: 14,
      }) },
  ];
}
