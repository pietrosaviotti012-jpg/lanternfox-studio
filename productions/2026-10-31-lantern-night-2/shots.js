// Lantern Night · Part 2 (Your Call) — shot list. One of you said GO: at 2:23 am you climb out of the window and follow the fox,
// with footsteps behind you that match yours. In the old forest hundreds of lanterns hang in the trees, and under each one a
// neighbor stands, eyes shut, smiling. One lantern is dark and has your name; the fox lights it; the footsteps stop at the tree
// line; a whisper: close your eyes, it can't see you. They're hiding. At 6:12 am the sun comes up (the theme turns from
// your-call/notte to your-call/alba) and everyone walks home, except the fox: its lantern still burns alone in the forest.
// The threat is never shown: only the open door, the footsteps, a long shadow that is not yours, the dark beyond the trees.
// Subjects sit between 15 % and 52 % of the frame height (the series tag is above, the pop captions below).
// Starts are anchored to narration lines (C), effects to the line timings (E.cue / E.cueEnd / E.word).
import { layered } from './engine/kit/shot.js';
import { fox, hangLantern, houses, neighbor, pines, person, doorFrame, foreground } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';
import { seg, ss } from './engine/lib.js';

const T = theme('your-call', 'notte'), D = theme('your-call', 'alba');
// the lifted night of Part 1 (houses and trees read against it), and a darker one for the forest
const NIGHT = [[0, '#0a1330'], [.5, '#172a58'], [.8, '#2e4478'], [1, '#43598a']];
const WOOD = [[0, '#070b1c'], [.5, '#14204a'], [.85, '#26345f'], [1, '#33447a']];
const ROOM = [[0, '#02030a'], [1, '#0a0f24']];
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

export function SHOTS(C, DUR) {
  const at = id => C[id].at, end = id => C[id].end;
  return [
    // 1 · The vote, and the window: you from behind at your bedroom window, the fox's lantern in the yard below, waiting.
    //     The vote card (GO 1 · STAY 0) drops on frame 0. A slow push to the glass.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'wind', d: end('L01') + .6, v: .5 }, { t: .1, type: 'crack', v: .45 }, { t: end('L01') - .2, type: 'whoosh', v: .5 }],
      build: E => layered(E, {
        light: [0, .07, -.12], lightR: .1, lightCol: T.light, key: .55, amb: .3, sky: { stops: NIGHT, stars: 90 }, on: false,
        layers: [
          { name: 'trees', z: -.125, trans: .35, draw: x => { x.fillStyle = '#2b3a68'; pines(x, { x0: -.25, x1: .25, base: .1, h: .08, n: 16, seed: 5 }); } },
          { name: 'yard', z: -.115, trans: .2, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .075, seed: 3, reedsAt: [-.15, .1], reedsN: 14, stones: 3, amp: .004 }); } },
          foxLayer(.03, .062, .04, -.11),
          { name: 'wall', z: -.07, trans: .05, draw: x => { x.fillStyle = '#1a1d33'; x.fillRect(-.25, -.45, .5, .9);
            x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.1, .04, .2, .17); x.restore();
            x.fillRect(-.1, .124, .2, .006); x.fillRect(-.003, .04, .006, .17); x.fillStyle = '#121528'; x.fillRect(-.115, .03, .23, .012); } },
          { name: 'you', z: -.045, trans: .02, w: .16, h: .22, x: -.05, y: .0, draw: x => neighbor(x, { cx: 0, by: -.1, s: .2, lantern: false, back: true, col: '#05060d' }) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        cam: [[0, [-.01, .085, .42, -.01, .085, -.07]], [E.dur, [.015, .09, .36, .015, .09, -.07]]],
        focus: [[0, -.08], [E.dur, -.1]], aper: 16,
      }) },

    // 2 · You don't turn around: behind you the bedroom door stands open, a warm line of light in the gap, wider every second.
    //     The camera backs away from it, the way you leave.
    { id: 'S2', start: at('L02') - .15, sfx: [{ t: .05, type: 'paper', v: 1 }, { t: .2, type: 'thunder', v: .4 }],
      build: E => layered(E, {
        light: [0, .08, -.135], lightR: .05, lightCol: '#8fa6e8', key: .45, amb: .22, ambCol: '#4a5888', sky: { stops: ROOM }, on: false,
        layers: [
          { name: 'hall', z: -.12, trans: .5, glow: 2.4, glowCol: '#ffb862', draw: x => { x.fillStyle = '#1a100a'; x.fillRect(-.06, -.05, .12, .26); },
            glowDraw: g => { const gr = g.createLinearGradient(.0, 0, .06, 0); gr.addColorStop(0, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, -.04, .06, .22); } },
          { name: 'wall', z: -.09, trans: .04, draw: x => { x.fillStyle = '#121731'; x.fillRect(-.25, -.45, .5, .9); x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(-.05, -.04, .1, .22); x.restore(); doorFrame(x, { cx: 0, by: -.04, w: .1, h: .22, col: '#0b0f22' }); } },
          { name: 'leaf', z: -.088, trans: .03, w: .1, h: .22, x: 0, y: .07, ax: -.05, draw: x => { x.fillStyle = '#1b1512'; x.fillRect(-.05, -.11, .1, .22); x.fillStyle = '#0f0b0a';
            for (const [px, py, ph] of [[-.04, .015, .08], [.004, .015, .08], [-.04, -.1, .1], [.004, -.1, .1]]) x.fillRect(px, py, .036, ph);
            x.fillStyle = '#c9a46a'; x.beginPath(); x.arc(.04, 0, .004, 0, Math.PI * 2); x.fill(); } },
          { name: 'fg', z: -.03, trans: .02, draw: x => { x.fillStyle = '#04050c'; x.fillRect(-.25, -.45, .5, .41); } },
        ],
        glows: { hall: [[0, .7], [E.dur, 1]] },
        update: (t, L) => { L.leaf.scale.x = .82 - .14 * ss(seg(t, 0, E.dur)); },
        cam: [[0, [0, .065, .42, 0, .07, -.07]], [E.dur, [-.02, .065, .52, -.01, .07, -.07]]],
        focus: -.09, aper: 16, grade: { sat: .7, contrast: .16 },
      }) },

    // 3 · Footsteps that match yours: you cross the yard towards the trees, the fox ahead; from the bottom of the frame a long
    //     shadow that is not yours stretches up the grass and keeps pace. Two sets of steps, a beat apart. Hit on "match".
    { id: 'S3', start: at('L03') - .2, in: { type: 'dissolve', dur: .35 },
      sfx: [{ t: 0, type: 'steps', n: 6, every: .55, v: .6, pan: .2 }, { t: .12, type: 'steps', n: 6, every: .55, v: .75, pan: -.3 }, { t: end('L03') - at('L03') + .3, type: 'thunder', v: .35 }],
      build: E => layered(E, {
        light: [.02, .1, -.12], lightR: .1, lightCol: T.light, key: .5, amb: .3, sky: { stops: NIGHT, stars: 80 }, on: false,
        layers: [
          { name: 'forest', z: -.12, trans: .35, draw: x => { x.fillStyle = '#2b3a68'; pines(x, { x0: -.25, x1: .25, base: .1, h: .1, n: 18, seed: 8 }); x.fillRect(-.25, -.45, .5, .55); } },
          { name: 'field', z: -.09, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .08, seed: 9, reedsAt: [-.2, .2], reedsN: 22, stones: 3, amp: .004 }); } },
          foxLayer(.035, .09, .035, -.085),
          { name: 'you', z: -.07, trans: .05, w: .1, h: .12, x: -.01, y: .085, draw: x => neighbor(x, { cx: 0, by: -.05, s: .1, lantern: false, back: true, col: '#0b0f22' }) },
          { name: 'shadow', z: -.06, trans: 0, shadow: false, draw: x => { x.fillStyle = 'rgba(2,3,8,.85)'; x.beginPath(); x.moveTo(-.07, -.3); x.lineTo(-.02, .06); x.lineTo(-.008, .062); x.lineTo(.03, -.3); x.closePath(); x.fill(); } },
          { name: 'fg', z: -.03, trans: .03, draw: ground('#070a16', .0, 12, [-.22, .15]) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        move: { you: [[0, [0, 0, 0]], [E.dur, [.005, .012, 0]]], fox: [[0, [0, 0, 0]], [E.dur, [.012, .01, 0]]], shadow: [[0, [0, -.05, 0]], [E.dur, [.003, .005, 0]]] },
        cam: [[0, [-.02, .095, .44, -.01, .1, -.07]], [E.dur, [.01, .1, .38, .005, .105, -.07]]],
        focus: -.07, aper: 16,
      }) },

    // 4 · Into the old forest: the fox slips between the first trunks, its light swinging; the camera follows in, past the trees.
    { id: 'S4', start: at('L04') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: end('L04') - at('L04') + 1, v: .4 }, { t: .3, type: 'whoosh', v: .4 }],
      build: E => layered(E, {
        light: [.0, .08, -.1], lightR: .07, lightCol: '#ffc878', key: .45, amb: .26, sky: { stops: WOOD, stars: 40 }, on: false,
        layers: [
          { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 12, w: .01, seed: 4 }) },
          { name: 'floor', z: -.1, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .05, seed: 5, reedsAt: [-.2, .2], reedsN: 14, stones: 4, amp: .003 }); } },
          foxLayer(-.02, .05, .045, -.09),
          { name: 'mid', z: -.07, trans: .08, draw: trunks('#101836', { n: 5, w: .022, seed: 11 }) },
          { name: 'near', z: -.035, trans: .04, draw: trunks('#05070f', { x0: -.26, x1: .26, n: 3, w: .04, seed: 2 }) },
        ],
        glows: { fox: [[0, 1]] }, flicker: ['fox'],
        move: { fox: [[0, [0, 0, 0]], [E.dur, [.04, .02, 0]]] },
        update: (t, L, S) => { const p = L.fox.position; S.U.uLight.value.set(p.x + .02, p.y + .02, -.1); L.fox.scale.setScalar(1 - .3 * seg(t, 0, E.dur)); },
        cam: [[0, [-.03, .07, .5, -.02, .075, -.07]], [E.dur, [.02, .08, .4, .02, .085, -.07]]],
        focus: [[0, -.07], [E.dur, -.09]], aper: 18,
      }) },

    // 5 · Hundreds of lanterns: a crane up the trunks; a few lanterns burn, then on "hundreds" the whole canopy lights at once.
    { id: 'S5', start: at('L05') - .25, sfx: [{ t: .05, type: 'whoosh', v: .55 }, { t: 0, type: 'wind', d: end('L05') - at('L05') + 1, v: .3 }],
      build: E => {
        const on = E.word('L05', 0) - .05, far = lanternSpots(7, 70, [-.22, .22], [.08, .27], .006), near = lanternSpots(13, 16, [-.15, .15], [.1, .25], .011);
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

    // 6 · Under each one a neighbor, eyes shut, smiling: a slow truck along the row, each smile catching its lantern.
    { id: 'S6', start: at('L06') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: end('L06') - at('L06') + 1, v: .3 }],
      build: E => {
        const P = [[-.13, .06], [-.065, .07], [0, .062], [.065, .072], [.13, .058]];
        return layered(E, {
          light: [0, .14, -.12], lightR: .18, lightCol: '#ffc878', key: .5, amb: .3, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 14, w: .008, seed: 21 }) },
            { name: 'glowfar', z: -.118, trans: .2, glow: 2.2, ...lanterns(lanternSpots(31, 40, [-.22, .22], [.17, .27], .005)) },
            { name: 'floor', z: -.1, trans: .1, draw: x => { x.fillStyle = '#18234a'; foreground(x, { base: .06, seed: 22, reedsAt: [-.2, .2], reedsN: 10, stones: 3, amp: .003 }); } },
            { name: 'lan', z: -.088, trans: .2, glow: 3, ...lanterns(P.map(([cx, by]) => [cx, by + .1, .008])) },
            ...P.map(([cx, by], i) => sleeper('n' + i, cx, by, .085, -.085 + i * .001, NB[i])),
            { name: 'fg', z: -.03, trans: .03, draw: ground('#060914', -.02, 23, [-.22, .2]) },
          ],
          glows: { lan: [[0, 1]], glowfar: [[0, 1]], ...Object.fromEntries(P.map((_, i) => ['n' + i, [[0, .8]]])) }, flicker: ['lan', 'glowfar'],
          cam: [[0, [-.06, .1, .42, -.06, .1, -.07]], [E.dur, [.05, .1, .4, .05, .1, -.07]]],
          focus: -.085, aper: 18,
        });
      } },

    // 7 · One lantern is dark: a close-up of an unlit paper lantern on its branch, a paper tag hanging from it: YOU.
    //     The burning lanterns blur behind it. A hard cut and a slow push.
    { id: 'S7', start: at('L07') - .15, sfx: [{ t: .05, type: 'crack', v: .5 }, { t: .1, type: 'paper', v: .8 }],
      build: E => {
        const tag = E.word('L07', 7);
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

    // 8 · The fox lights it: the fox stands up on its hind legs under the branch, lifts its lantern, and your lantern catches.
    { id: 'S8', start: at('L08') - .25, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'whoosh', v: .45 }, { t: .25 + C.L08.dur * .6, type: 'crack', v: .35 }],
      build: E => {
        const lit = E.cue('L08') + C.L08.dur * .6;
        return layered(E, {
          light: [.04, .12, -.1], lightR: .06, lightCol: '#ffc878', key: .5, amb: .28, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'bokeh', z: -.125, trans: .2, glow: 2.2, ...lanterns(lanternSpots(51, 24, [-.2, .2], [.0, .28], .01)) },
            { name: 'branch', z: -.085, trans: .05, draw: x => { x.strokeStyle = '#0b0f22'; x.lineWidth = .007; x.lineCap = 'round'; x.beginPath(); x.moveTo(.25, .2); x.quadraticCurveTo(.1, .18, -.02, .2); x.stroke(); } },
            { name: 'mine', z: -.08, trans: .2, glow: 3.2, w: .06, h: .1, x: .05, y: .145, draw: x => hangLantern(x, { cx: 0, cy: 0, r: .015, string: .03 }), glowDraw: g => hangLantern(null, { cx: 0, cy: 0, r: .015, string: .03 }, g) },
            { name: 'floor', z: -.075, trans: .08, draw: x => { x.fillStyle = '#131c3c'; foreground(x, { base: .05, seed: 52, reedsAt: [-.2, .2], reedsN: 10, stones: 3, amp: .003 }); } },
            foxLayer(-.03, .05, .065, -.07),
          ],
          glows: { bokeh: [[0, .9]], fox: [[0, 1]], mine: [[0, 0], [lit - .1, 0], [lit, .5], [lit + .08, .2], [lit + .3, 1]] }, flicker: ['fox', 'mine'],
          move: { fox: [[0, [0, 0, 0]], [lit - .4, [.008, .01, -.1]], [E.dur, [.008, .01, -.1]]] },
          update: (t, L, S) => { const k = ss(seg(t, lit, lit + .6)); S.U.uLightR.value = .06 + .08 * k; S.U.uLight.value.set(.04, .13, -.1); },
          cam: [[0, [-.02, .1, .44, -.01, .11, -.07]], [lit, [.0, .11, .4, .01, .12, -.07]], [E.dur, [.01, .115, .38, .02, .125, -.07]]],
          focus: -.075, aper: 18,
        });
      } },

    // 9 · The footsteps stop at the trees: looking back out of the forest, the lantern light ends at the edge; beyond it the
    //     dark field and your town, unlit. Steps, then nothing; in the long silence the grass at the edge bends towards us.
    { id: 'S9', start: at('L09') - .3, in: { type: 'dissolve', dur: .5 },
      sfx: [{ t: .1, type: 'steps', n: 4, every: .5, v: .7, pan: .1 }, { t: end('L09') - at('L09') + .4, type: 'wind', d: 1.6, v: .55 }],
      build: E => {
        const bend = E.cueEnd('L09') + .3;
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

    // 10 · The whisper: a close-up of the nearest neighbor under her lantern, eyes shut, a calm smile; her lips barely move.
    { id: 'S10', start: at('L10') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'wind', d: end('L10') - at('L10') + 1, v: .25 }],
      build: E => layered(E, {
        light: [.02, .16, -.06], lightR: .08, lightCol: '#ffc878', key: .7, amb: .45, ambCol: '#a89ac8', sky: { stops: WOOD }, on: false,
        layers: [
          { name: 'bokeh', z: -.125, trans: .2, glow: 2.2, ...lanterns(lanternSpots(71, 22, [-.2, .2], [.02, .28], .012)) },
          { name: 'her', z: -.075, trans: .02, draw: x => person(x, { cx: 0, by: -.08, s: .2, face: 'sleeping', coat: NB[1], hair: '#3a2a22', pants: '#2a2533' }) },
          { name: 'lan', z: -.07, trans: .2, glow: 3.2, ...lanterns([[.035, .2, .016]]) },
        ],
        glows: { bokeh: [[0, 1]], lan: [[0, 1]] }, flicker: ['lan', 'bokeh'],
        cam: [[0, [-.01, .1, .36, 0, .105, -.07]], [E.dur, [.01, .1, .32, .005, .105, -.07]]],
        focus: -.075, aper: 24,
      }) },

    // 11 · They're hiding: a pull back and up over the whole clearing, rows of neighbors under rows of lanterns. Hit on "hiding".
    { id: 'S11', start: at('L11') - .15, sfx: [{ t: .05, type: 'thunder', v: .45 }, { t: .1, type: 'whoosh', v: .5 }],
      build: E => {
        const back = [-.16, -.1, -.04, .02, .08, .14].map((cx, i) => [cx + .01 * (i % 2), .1 + .004 * (i % 3)]);
        const front = [-.13, -.065, 0, .065, .13].map((cx, i) => [cx, .055 + .004 * (i % 2)]);
        return layered(E, {
          light: [0, .16, -.12], lightR: .2, lightCol: '#ffc878', key: .5, amb: .3, sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'deep', z: -.125, trans: .3, draw: trunks('#26345f', { n: 16, w: .007, seed: 81 }) },
            { name: 'glowfar', z: -.12, trans: .2, glow: 2.2, ...lanterns(lanternSpots(83, 60, [-.24, .24], [.18, .28], .005)) },
            { name: 'floor', z: -.11, trans: .1, draw: x => { x.fillStyle = '#18234a'; x.fillRect(-.25, -.45, .5, .55); } },
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

    // 12 · You shut your eyes and wait: you, close, under your own lantern, now burning. Scared, then on "shut" the eyes close.
    { id: 'S12', start: at('L12') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'wind', d: end('L12') - at('L12') + 1.4, v: .3 }, { t: end('L12') - at('L12') + .5, type: 'steps', n: 1, every: .5, v: .3, pan: -.6 }],
      build: E => {
        const shut = E.word('L12', 2);
        return layered(E, {
          light: [.03, .17, -.06], lightR: .08, lightCol: '#ffc878', key: .7, amb: .45, ambCol: '#a89ac8', sky: { stops: WOOD }, on: false,
          layers: [
            { name: 'bokeh', z: -.125, trans: .2, glow: 2.2, ...lanterns(lanternSpots(91, 22, [-.2, .2], [.02, .28], .012)) },
            { name: 'open', z: -.075, trans: .02, draw: x => person(x, { ...YOU, cx: 0, by: -.08, s: .2, face: 'scared' }) },
            { name: 'shut', z: -.0749, trans: .02, draw: x => person(x, { ...YOU, cx: 0, by: -.08, s: .2, face: 'sleeping' }) },
            { name: 'lan', z: -.07, trans: .2, glow: 3.2, ...lanterns([[-.035, .2, .016]]) },
          ],
          glows: { bokeh: [[0, 1]], lan: [[0, 1]] }, flicker: ['lan', 'bokeh'],
          update: (t, L) => { L.open.visible = t < shut; L.shut.visible = t >= shut; },
          cam: [[0, [0, .1, .34, 0, .105, -.07]], [E.dur, [0, .1, .3, 0, .105, -.07]]],
          focus: -.075, aper: 24,
        });
      } },

    // 13 · 6:12 am: dawn through the trees (your-call/alba), the lanterns going out one by one, the neighbors walking home.
    { id: 'S13', start: at('L13') - .4, in: { type: 'dissolve', dur: .8 }, sfx: [{ t: .3, type: 'whoosh', v: .35 }, { t: .8, type: 'steps', n: 8, every: .45, v: .4, pan: -.3 }],
      build: E => {
        const W = [[-.08, .06], [-.02, .065], [.04, .058], [.1, .066]];
        return layered(E, {
          light: [0, .1, -.13], lightR: .3, lightCol: D.light, key: .9, amb: .6, ambCol: '#d8b8c0', sky: { stops: D.sky }, on: false,
          layers: [
            { name: 'far', z: -.125, trans: .4, draw: x => { x.fillStyle = D.far; houses(x, { x0: -.24, x1: .24, by: .08, h: .03, seed: 3, col: D.far, lit: false }); x.fillRect(-.25, -.45, .5, .53); } },
            { name: 'field', z: -.105, trans: .15, draw: x => { x.fillStyle = D.mid; foreground(x, { base: .06, seed: 73, reedsAt: [-.2, .2], reedsN: 14, stones: 2, amp: .003 }); } },
            ...W.map(([cx, by], i) => ({ name: 'w' + i, z: -.095 + i * .001, trans: .05, w: .05, h: .08, x: cx, y: by + .035,
              draw: x => neighbor(x, { cx: 0, by: -.035, s: .065, lantern: false, back: true, col: NB[i] }) })),
            { name: 'trees', z: -.06, trans: .05, draw: trunks(D.near, { x0: -.26, x1: .26, n: 4, w: .035, seed: 14 }) },
            { name: 'lan', z: -.055, trans: .2, glow: 2.6, ...lanterns([[-.14, .2, .01], [.12, .23, .009], [-.06, .26, .007], [.05, .2, .008]]) },
          ],
          glows: { lan: [[0, 1], [E.cue('L13') + C.L13.dur * .5, 1], [E.cueEnd('L13') + .6, 0]] },
          move: Object.fromEntries(W.map((_, i) => ['w' + i, [[0, [0, 0, 0]], [E.dur, [.02 + .005 * i, .02, 0]]]])),
          update: (t, L) => W.forEach((_, i) => L['w' + i].scale.setScalar(1 - .35 * seg(t, 0, E.dur))),
          cam: [[0, [0, .07, .44, 0, .08, -.07]], [E.dur, [0, .1, .46, 0, .11, -.07]]],
          focus: -.1, aper: 14, grade: { sat: 1.08, expo: 1.1 },
        });
      } },

    // 14 · Except the fox: morning in the empty forest, the fox sitting alone between the trunks, its lantern still burning.
    //     Push in on "alone"; the question holds; the channel title rises at the end.
    { id: 'S14', start: at('L14') - .3, in: { type: 'dissolve', dur: .7 }, sfx: [{ t: 0, type: 'wind', d: DUR - at('L14') + .5, v: .3 }, { t: end('L16') - at('L14') + .3, type: 'thunder', v: .3 }],
      build: E => {
        const titleAt = E.cueEnd('L16') + .8;
        return layered(E, {
          light: [.02, .1, -.08], lightR: .1, lightCol: '#ffc878', key: .8, amb: .55, ambCol: '#c8a8b8', sky: { stops: D.sky }, on: false,
          layers: [
            { name: 'deep', z: -.125, trans: .4, draw: trunks(D.far, { n: 12, w: .01, seed: 33 }) },
            { name: 'mid', z: -.1, trans: .15, draw: trunks(D.mid, { n: 5, w: .02, seed: 34 }) },
            { name: 'floor', z: -.09, trans: .1, draw: x => { x.fillStyle = D.near; foreground(x, { base: .05, seed: 35, reedsAt: [-.2, .2], reedsN: 14, stones: 3, amp: .003 }); } },
            foxLayer(.0, .05, .07, -.08, true),
            { name: 'title', z: -.06, trans: .3, w: .18, h: .04, x: 0, y: .22, shadow: false, recv: false, finish: { rim: .6 },
              draw: x => text(x, 'Lantern Fox Tales', 0, 0, .012, '"Cormorant"', { fill: '#f1dbac', weight: 600 }) },
          ],
          glows: { fox: [[0, 1]] }, flicker: ['fox'],
          update: (t, L) => reveal(L, 'title', t, titleAt),
          cam: [[0, [0, .1, .5, 0, .11, -.07]], [E.cue('L15'), [0, .1, .46, 0, .11, -.07]], [E.cue('L16'), [0, .1, .38, 0, .11, -.07]], [E.dur, [0, .105, .36, 0, .115, -.07]]],
          focus: -.08, aper: 18,
        });
      } },
  ];
}
