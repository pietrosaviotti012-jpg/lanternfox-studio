// What If the Sun Went Out for 8 Minutes? (What If…, episode 4) — shot list. Noon in a schoolyard: Mila, 10, under a bright
// Sun, the premise written in the sky. On "out" a hard cut to space: the Sun goes dark, but its last light keeps travelling to
// the Earth (a countdown 8:20 → 0:00 under it): nobody knows. Then (hit) the schoolyard blacks out, noon turns to night.
// Mila up close, eyes wide (her name). Back in space the last light passes the Earth and its day side goes dark. The birds
// land in a row on the wire to roost; the street lamps switch on one by one; full figure in the yard under a sky of stars at
// lunchtime, the fox on the school roof; the thermometer on the wall drops; the Earth keeps going round the dark Sun on its
// dotted orbit (gravity never switched off). At 12:16 the Sun bursts back and Mila throws her arms up. The riddle: a cream
// card; her grandpa in his boat off New Zealand at midnight, both the full Moon and the stars in his sky; close on his face,
// lit by the moonlight, which goes out on "saw" (hit) without showing what went dark. The end holds the sunny schoolyard
// with Mila and the fox under the choice MOON or STARS.
// Themes: what-if/alba for the daylight, what-if/notte for space and the dark noon.
// Rules kept from pipeline/MIGLIORARE.md:
// - first frame already full: Mila large (a third of the height), the Sun lit, the premise "SUN OFF · 8 MINUTES" written in
//   the scene from frame 0, and a new picture by 1.5 s (the hard cut to space on "out");
// - the lower frame is never an empty band: the painted schoolyard, the street, the sea and the boat reach the bottom edge;
// - level camera at the floor in every shot with a figure (lv()), face close-ups at S4, S9 and S14;
// - the choice on screen at the end (script.choice), a riddle with two answers (the "What if" variant of rule 4).
import { layered } from './engine/kit/shot.js';
import { person, humanHead, SKIN, foxCameo, streetlamp, houses, starField, paperMoon, hangLantern } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { waves, waterTop } from './engine/art.js';
import { text } from './engine/paper.js';
import { seg, ss, lerp, clamp, TAU } from './engine/lib.js';

const T = theme('what-if', 'notte'), DAWN = theme('what-if', 'alba');
const MILA = { human: true, age: 'child', skin: SKIN.tan, coat: '#f2b632', pants: '#2d3a50', hat: false, hair: '#3a2418', hairStyle: 'long' };   // the one strong colour: her yellow coat
const DAY = [[0, '#2a6a96'], [.45, '#4f97b8'], [.8, '#9ccfd0'], [1, '#f2e2b0']];
const NIGHT = [[0, '#06101e'], [.5, '#0e2440'], [.85, '#1c4060'], [1, '#2c5a70']];
const SPACE = [[0, '#050c1c'], [.6, '#0b2040'], [1, '#143858']];
const D = { wall: '#5a7f88', roof: '#3a5a66', ground: '#6b7a74', paint: '#e6e2cc', fence: '#2e4a52', far: '#86b4b8', tree: '#3e6a58' };
const N = { wall: '#24404c', roof: '#16303a', ground: '#1e2e34', paint: '#4a5c60', fence: '#0c1a22', far: '#1e3a4a', tree: '#12281f' };
const SUN = '#ffe08a', WIN = '#ffd88a', NOGLOW = { trans: 0, shadow: false, recv: false };

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
const ramp = (t, a, b) => ss(clamp((t - a) / (b - a)));
const fade = (L, n, k) => { L[n].visible = k > .01; L[n].material.color.setScalar(clamp(k)); };

// —— the Sun: a paper disc with cut rays; its glow is the daylight. The dark Sun: an ember disc with a faint red rim ——
const sunDraw = (c, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; c.beginPath(); c.moveTo(Math.cos(a - .1) * r * 1.15, Math.sin(a - .1) * r * 1.15);
    c.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6); c.lineTo(Math.cos(a + .1) * r * 1.15, Math.sin(a + .1) * r * 1.15); c.closePath(); c.fill(); } };
const sunLayer = (name, cx, cy, r, z = -.13) => ({ name, z, ...NOGLOW, glow: 3.6, glowCol: '#fff0b8', w: r * 3.6, h: r * 3.6, x: cx, y: cy,
  draw: x => sunDraw(x, r, '#f5c860'), glowDraw: g => sunDraw(g, r, '#fff') });
const deadSun = (name, cx, cy, r, z = -.131) => ({ name, z, ...NOGLOW, glow: 1.6, glowCol: '#ff5a3a', w: r * 2.6, h: r * 2.6, x: cx, y: cy,
  draw: x => { x.fillStyle = '#1a0c10'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill(); },
  glowDraw: g => { g.strokeStyle = '#fff'; g.lineWidth = r * .06; g.beginPath(); g.arc(0, 0, r * 1.01, 0, TAU); g.stroke(); } });
// the Earth from space: ocean and land, and its sunlit half as a glow that can go out
const earthLayer = (name, cx, cy, r, z = -.1, side = -1) => ({ name, z, trans: .3, glow: 2.2, glowCol: '#bfeaff', w: r * 2.4, h: r * 2.4, x: cx, y: cy,
  draw: x => { x.fillStyle = '#2678a0'; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.fill();
    x.fillStyle = '#4a9a5a'; for (const [u, v, a, b] of [[-.35, .3, .3, .22], [.3, -.2, .25, .35], [-.1, -.5, .2, .12], [.4, .45, .15, .1]]) { x.beginPath(); x.ellipse(u * r, v * r, a * r, b * r, .4, 0, TAU); x.fill(); } },
  glowDraw: g => { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, r, Math.PI / 2, Math.PI * 1.5, side > 0); g.fill(); } });
const stars = (name, n, seed, z = -.14, minY = -.02) => ({ name, z, ...NOGLOW, glow: 1.8, glowCol: '#e8f4ff',
  draw: x => starField(x, { n, seed, minY, col: '#0a1a28' }), glowDraw: g => starField(null, { n, seed, minY }, g) });
// a written card in the scene (the premise, the countdown): big Anton letters on their own unlit sheet
const words = (name, s, cx, cy, size, fill, z = -.098) => ({ name, z, ...NOGLOW, w: .22, h: size * 2, x: cx, y: cy,
  draw: x => text(x, s, 0, 0, size, '"Anton"', { fill }) });

// —— the schoolyard: the school behind (windows lit at night), a fence, the painted yard reaching the bottom edge ——
const school = (P, night, z = -.12) => ({ name: 'school', z, trans: .25, glow: night ? 2.4 : 0, glowCol: WIN,
  draw: x => {
    x.fillStyle = P.far; x.fillRect(-.25, 0, .5, .03);                                   // the town far behind the fence
    x.fillStyle = P.wall; x.fillRect(-.16, 0, .32, .085);
    x.fillStyle = P.roof; x.beginPath(); x.moveTo(-.17, .085); x.lineTo(-.13, .105); x.lineTo(.13, .105); x.lineTo(.17, .085); x.closePath(); x.fill();
    x.fillRect(-.02, .105, .04, .02);                                                     // the bell gable
    x.fillStyle = night ? '#1a2a3a' : '#cfe6ea';
    for (let c = 0; c < 7; c++) for (let r = 0; r < 2; r++) x.fillRect(-.135 + c * .042, .018 + r * .035, .022, .022);
    x.fillStyle = P.roof; x.fillRect(-.012, 0, .024, .03);                               // the door
  },
  glowDraw: night ? g => { g.fillStyle = '#fff'; for (let c = 0; c < 7; c++) for (let r = 0; r < 2; r++) if ((c * 3 + r) % 4) g.fillRect(-.135 + c * .042, .018 + r * .035, .022, .022); } : null });
const yard = (P, z = -.07) => ({ name: 'yard', z, trans: .03, shadow: false,
  draw: x => {
    x.fillStyle = P.fence; for (let i = -14; i <= 14; i++) x.fillRect(i * .012 - .001, 0, .002, .022); x.fillRect(-.25, .016, .5, .002); x.fillRect(-.25, .006, .5, .002);
    x.fillStyle = P.ground; x.fillRect(-.25, -.45, .5, .4505);
    x.fillStyle = P.paint;                                                                 // hopscotch painted on the yard
    for (const [u, v, w, h] of [[.03, -.03, .03, .014], [.03, -.048, .03, .016], [.015, -.07, .03, .02], [.045, -.07, .03, .02], [.03, -.098, .03, .024]]) {
      x.fillRect(u - w / 2, v - h / 2, w, .0012); x.fillRect(u - w / 2, v + h / 2, w, .0012); x.fillRect(u - w / 2, v - h / 2, .0012, h); x.fillRect(u + w / 2, v - h / 2, .0012, h); }
    x.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 1; i < 12; i++) x.fillRect(-.25, -Math.pow(i / 12, 1.6) * .45, .5, .001);
  } });
const tree = (P, cx, z = -.095, s = .1) => ({ name: 'tree', z, trans: .15,
  draw: x => { x.fillStyle = P.tree; x.fillRect(cx - s * .04, 0, s * .08, s * .55);
    for (const [u, v, r] of [[0, .72, .3], [-.22, .58, .22], [.22, .6, .22], [0, .5, .24]]) { x.beginPath(); x.arc(cx + u * s, v * s, r * s, 0, TAU); x.fill(); } } });
// Mila standing, and her face touched by the sky: a soft light on one side of the face only, so the skin keeps its colour
// (same geometry as the human person(): humanHead)
const faceGlow = (g, o) => { const { cx, hy, hr } = humanHead({ age: 'adult', ...o }); g.fillStyle = 'rgba(255,255,255,.35)';
  g.beginPath(); g.ellipse(cx + hr * .25, hy, hr * .6, hr * .85, 0, 0, TAU); g.fill(); };
const mila = (name, cx, by, s, face, z = -.09, o = {}) => ({ name, z, trans: .02, glow: (o.glow ?? .5) * .6, glowCol: o.col || '#ffe2c4',
  draw: x => person(x, { ...MILA, cx, by, s, face, arms: o.arms || 'down' }), glowDraw: g => faceGlow(g, { age: 'child', cx, by, s }) });
const foxAt = (cx, by, s, z, flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose: 'watch', flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose: 'watch', flip }, g) });
// a small bird in silhouette, sitting (wing tucked) on y = by
const bird = (x, cx, by, s, col) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, by + s * .4, s * .5, s * .32, -.15, 0, TAU); x.fill();
  x.beginPath(); x.arc(cx + s * .42, by + s * .72, s * .2, 0, TAU); x.fill();
  x.beginPath(); x.moveTo(cx + s * .6, by + s * .76); x.lineTo(cx + s * .78, by + s * .7); x.lineTo(cx + s * .6, by + s * .66); x.fill();
  x.beginPath(); x.moveTo(cx - s * .4, by + s * .45); x.lineTo(cx - s * .85, by + s * .3); x.lineTo(cx - s * .4, by + s * .25); x.fill(); };
// the sea at night (art.js waves under a wavy top)
const sea = (base, col, line, r = .008) => x => {
  x.fillStyle = col; waterTop(x, { x0: -.25, x1: .25, base, amp: .0015, len: .05 });
  x.save(); x.beginPath(); x.rect(-.25, -.45, .5, base + .445); x.clip();
  waves(x, { x0: -.25, x1: .25, y0: base - .005, y1: -.45, r, fill: col, line, lw: .0007 }); x.restore();
};
const moonLayer = (name, cx, cy, r, z = -.13) => ({ name, z, ...NOGLOW, glow: 3.2, glowCol: '#fff0c8', w: r * 2.4, h: r * 2.4, x: cx, y: cy,
  draw: x => paperMoon(x, { cx: 0, cy: 0, r }), glowDraw: g => paperMoon(null, { cx: 0, cy: 0, r }, g) });
const GRANDPA = { human: true, skin: '#d9a07a', coat: '#3a5a6a', pants: '#1c2a34', hat: '#c8342b', beard: '#cfc9c0' };   // the red beanie, a grey beard

// the daylight schoolyard (S1, S3, S11, S15)
const dayYard = (o = {}) => [
  ...(o.sun === false ? [] : [sunLayer('sun', o.sx ?? .062, o.sy ?? .125, o.sr ?? .016)]),
  school(D, false),
  foxAt(.085, .105, .014, -.118),
  tree(D, -.11),
  yard(D),
];

export function SHOTS(C, DUR) {
  const at = id => C[id].at;
  const mid = (id, u) => C[id].at + C[id].dur * u;
  return [
    // 1 · The hook, already lit: noon, Mila large in the schoolyard under a bright Sun, the premise written beside her,
    //     the fox small on the school roof. A slow push-in.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'forest', d: 2, v: .35 }, { t: .2, type: 'crowd', d: 1.6, v: .2 }],
      build: E => layered(E, {
        light: [.06, .12, -.13], lightR: .3, lightCol: DAWN.light, key: 1.1, amb: .6, ambCol: '#cfe6ff', sky: { stops: DAY }, on: false,
        layers: [
          ...dayYard(),
          words('w1', 'SUN OFF', .052, .086, .017, '#ffffff'),
          words('w2', '8 MINUTES', .052, .064, .017, T.em),
          mila('mila', -.04, 0, .125, 'calm', -.085, { glow: 0 }),
        ],
        cam: [[0, lv(.52, -.005)], [E.dur, lv(.49, -.005)]],
        focus: -.085, aper: 16,
      }) },

    // 2 · Nobody would know: a hard cut to space. The Sun goes dark at once; its last light, a pale band, keeps travelling to
    //     the small Earth, and the countdown under it runs 8:20 → 0:00 (one sheet per figure). Slow truck.
    { id: 'S2', start: mid('L01', .42), sfx: [{ t: 0, type: 'boom', v: .7 }, { t: .3, type: 'space', d: 5, v: .4 }],
      build: E => {
        const off = .25, END = Math.max(1.5, E.dur - .2);
        const S0 = [-.06, .115], E0 = [.07, .03], CNT = ['8:20', '6:40', '5:00', '3:20', '1:40', '0:00'];
        return layered(E, {
          light: [0, .1, -.13], lightR: .32, lightCol: '#cfeaff', amb: .5, sky: { stops: SPACE, stars: 160 }, on: false,
          layers: [
            sunLayer('sun', S0[0], S0[1], .03, -.12),
            deadSun('dead', S0[0], S0[1], .03, -.121),
            earthLayer('earth', E0[0], E0[1], .012, -.1),
            { name: 'band', z: -.105, ...NOGLOW, glow: 2.6, glowCol: SUN, w: .03, h: .07, x: S0[0], y: S0[1],
              draw: () => {}, glowDraw: g => { const gr = g.createLinearGradient(-.015, 0, .015, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.7, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)');
                g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, .015, .034, 0, 0, TAU); g.fill(); } },
            ...CNT.map((s, i) => words('c' + i, s, -.035, .012, .03, i === CNT.length - 1 ? T.tag : '#ffffff', -.099)),
            words('lab', 'LIGHT STILL ON ITS WAY', -.035, -.008, .008, T.em, -.099),
          ],
          glows: { sun: [[0, 1], [off, 1], [off + .15, 0]], dead: [[0, 0], [off, 0], [off + .4, 1]], earth: [[0, 1]] },
          update: (t, L) => {
            fade(L, 'sun', 1 - ramp(t, off, off + .15)); fade(L, 'dead', ramp(t, off, off + .1));
            const u = ramp(t, off, END), a = Math.atan2(E0[1] - S0[1], E0[0] - S0[0]);
            L.band.position.x = lerp(S0[0] + .03, E0[0] - .014, u); L.band.position.y = lerp(S0[1] - .02, E0[1] + .01, u); L.band.rotation.z = a;
            L.band.visible = t > off;
            const k = Math.min(CNT.length - 1, Math.floor(u * (CNT.length - 1) + .001));
            CNT.forEach((_, i) => { L['c' + i].visible = i === k; });
          },
          cam: [[0, [-.01, .06, .55, -.005, .06, -.1]], [E.dur, [.01, .06, .54, .005, .06, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 3 · Then, at 12:08, noon turns to night (hit): the schoolyard again, Mila in the sunlight; on "night" a blackout, then the
    //     night comes up: stars, the school windows lit, Mila's eyes wide. Hard cut, camera still.
    { id: 'S3', start: at('L03') - .1, sfx: [{ t: 0, type: 'whoosh', v: .4 }],
      build: E => {
        const tn = E.cue('L03') + C.L03.dur * .78;
        return layered(E, {
          light: [.06, .12, -.13], lightR: .3, lightCol: DAWN.light, key: 1.1, amb: .6, ambCol: '#cfe6ff', sky: { stops: DAY }, on: false,
          layers: [
            ...dayYard(),
            { name: 'night', z: -.138, ...NOGLOW, draw: x => { const gr = x.createLinearGradient(0, .29, 0, 0); NIGHT.forEach(([s, c]) => gr.addColorStop(s, c)); x.fillStyle = gr; x.fillRect(-.25, -.05, .5, .4); } },
            stars('stars', 120, 31, -.136, .04),
            { ...school(N, true, -.119), name: 'nschool' },
            { ...yard(N, -.069), name: 'nyard' },
            mila('mila', -.04, 0, .125, 'calm', -.085, { glow: 0 }),
            mila('mila2', -.04, 0, .125, 'surprised', -.084, { glow: .6 }),
          ],
          glows: { stars: [[0, 0], [tn + .5, 0], [tn + 1.4, 1]], nschool: [[0, 0], [tn + .7, 0], [tn + 1.3, 1]], mila2: [[0, .6]] },
          update: (t, L) => {
            const k = ramp(t, tn + .25, tn + 1.1), on = t >= tn;
            for (const n of ['night', 'stars', 'nschool', 'nyard', 'mila2']) fade(L, n, on ? k : 0);
            L.mila.visible = !on; for (const n of ['sun', 'school', 'tree', 'yard']) L[n].visible = !on;
            L.fox.visible = true;
          },
          grade: t => ({ expo: t < tn ? 1.06 : .95 }),
          cam: [[0, lv(.49, -.005)], [E.dur, lv(.48, -.005)]],
          focus: -.085, aper: 16,
        });
      } },

    // 4 · This is Mila: a close-up from the waist up, her face lit by the dark sky, eyes wide, stars behind her (name tag)
    { id: 'S4', start: at('L04') - .2, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .3, type: 'wind', d: 3, v: .25 }],
      build: E => layered(E, {
        light: [0, .1, -.12], lightR: .24, lightCol: '#cfeaff', key: .9, amb: .55, sky: { stops: NIGHT }, on: false,
        layers: [
          stars('stars', 150, 12, -.14, -.05),
          { ...school(N, true, -.125), name: 'nschool' },
          mila('mila', .012, -.215, .32, 'surprised', -.09, { glow: .7 }),
        ],
        flicker: ['nschool'],
        cam: [[0, lv(.36, 0)], [E.dur, lv(.34, .005)]],
        focus: -.09, aper: 18,
      }) },

    // 5 · The light takes eight minutes; so does the dark: space, the last band of light slips past the Earth and on "dark"
    //     the Earth's day side goes out (the card: Sun → Earth 8 min 20 s). Slow push-in on the Earth.
    { id: 'S5', start: at('L05') - .2, sfx: [{ t: 0, type: 'whoosh', v: .5 }, { t: .2, type: 'space', d: 4, v: .35 }],
      build: E => {
        const dk = E.word('L05', 11);
        return layered(E, {
          light: [0, .1, -.13], lightR: .32, lightCol: '#cfeaff', amb: .5, sky: { stops: SPACE, stars: 180 }, on: false,
          layers: [
            deadSun('dead', -.075, .1, .022, -.125),
            earthLayer('earth', .02, .055, .03, -.1),
          ],
          glows: { dead: [[0, 1]], earth: [[0, 1], [dk - .1, 1], [dk + .6, 0]] },
          cam: [[0, [0, .06, .56, 0, .06, -.1]], [E.dur, [.008, .058, .5, .012, .056, -.1]]],
          focus: -.1, aper: 12,
        });
      } },

    // 6 · The birds go quiet: dusk-dark sky over the yard, one by one the birds fly down and settle in a row on the wire
    { id: 'S6', start: at('L06') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: 0, type: 'forest', d: 1.4, v: .4 }],
      build: E => {
        const B = [-.07, -.045, -.02, .008, .034, .06];
        return layered(E, {
          light: [0, .12, -.12], lightR: .26, lightCol: '#cfeaff', key: .85, amb: .55, sky: { stops: NIGHT, stars: 60 }, on: false,
          layers: [
            { ...school(N, true, -.13), name: 'nschool' },
            { name: 'wire', z: -.1, trans: .05, draw: x => { x.fillStyle = '#0a141c'; x.fillRect(-.25, .066, .5, .0014); x.fillRect(-.092, -.2, .006, .3); x.fillRect(.088, -.2, .006, .3);
              x.fillRect(-.1, .064, .022, .004); x.fillRect(.08, .064, .022, .004); } },
            ...B.map((bx, i) => ({ name: 'b' + i, z: -.098 + i * .0003, trans: .02, w: .03, h: .03, x: bx, y: .0675,
              draw: x => bird(x, 0, 0, .014, '#0a141c') })),
            { ...yard(N, -.07), name: 'nyard' },
          ],
          update: (t, L) => B.forEach((bx, i) => { const k = ramp(t, .1 + i * .32, .7 + i * .32), m = L['b' + i];
            m.position.x = bx + (1 - k) * .06; m.position.y = .0675 + (1 - k) * .09; m.rotation.z = (1 - k) * .5; }),
          cam: [[0, [0, .055, .44, 0, .055, -.1]], [E.dur, [-.006, .055, .43, -.006, .055, -.1]]],
          focus: -.1, aper: 16,
        });
      } },

    // 7 · The street lamps switch on, all by themselves: the street by the school, three lamps lighting one after another on "lamps"
    { id: 'S7', start: at('L07') - .2, sfx: [{ t: .5, type: 'click', v: .5 }, { t: .8, type: 'click', v: .4 }, { t: 1.1, type: 'click', v: .4 }],
      build: E => {
        const lp = E.word('L07', 2) - .1;
        return layered(E, {
          light: [0, .12, -.12], lightR: .24, lightCol: '#ffd9a0', key: .8, amb: .5, sky: { stops: NIGHT, stars: 80 }, on: false,
          layers: [
            { name: 'town', z: -.12, trans: .25, glow: 2, glowCol: WIN, draw: x => houses(x, { x0: -.2, x1: .2, by: 0, h: .04, seed: 9, col: N.wall, glass: '#1a2a3a' }),
              glowDraw: g => houses(null, { x0: -.2, x1: .2, by: 0, h: .04, seed: 9, lit: [0, 3, 5] }, g) },
            ...[-.07, 0, .07].map((lx, i) => ({ name: 'lamp' + i, z: -.095, trans: .02, glow: 3.2, glowCol: '#ffd27a',
              draw: x => streetlamp(x, { cx: lx, by: 0, h: .1, col: '#0a141c', dir: i === 2 ? -1 : 1 }),
              glowDraw: g => streetlamp(null, { cx: lx, by: 0, h: .1, dir: i === 2 ? -1 : 1 }, g) })),
            { name: 'street', z: -.08, trans: .02, shadow: false, draw: x => { x.fillStyle = '#1a262c'; x.fillRect(-.25, -.45, .5, .4505);
              x.fillStyle = '#4a5a60'; for (let i = -6; i <= 6; i++) x.fillRect(i * .045 - .012, -.03, .024, .002); } },
          ],
          glows: Object.fromEntries([0, 1, 2].map(i => ['lamp' + i, [[0, 0], [lp + i * .3, 0], [lp + i * .3 + .15, 1]]])),
          cam: [[0, lv(.5, -.02)], [E.dur, lv(.5, .02)]],
          focus: -.095, aper: 16,
        });
      } },

    // 8 · At lunchtime, Mila can see the stars: full figure in the yard, the sky filling with stars, the school lit, the fox on
    //     the roof with her lantern. A slow pull-back.
    { id: 'S8', start: at('L08') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .4, type: 'space', d: 4, v: .4 }],
      build: E => {
        const st = E.word('L08', 7);
        return layered(E, {
          light: [0, .12, -.13], lightR: .24, lightCol: '#cfeaff', key: .8, amb: .55, sky: { stops: NIGHT }, on: false,
          layers: [
            stars('stars', 220, 44, -.14, .0),
            { ...school(N, true, -.12), name: 'nschool' },
            foxAt(.085, .105, .014, -.118),
            { ...tree(N, -.11), name: 'tree' },
            { ...yard(N), name: 'nyard' },
            mila('mila', -.01, 0, .085, 'surprised', -.085, { glow: .6, arms: 'up' }),
          ],
          glows: { stars: [[0, .35], [st - .4, .5], [st + .6, 1]] },
          flicker: ['fox'],
          cam: [[0, lv(.46)], [E.dur, lv(.5)]],
          focus: -.09, aper: 16,
        });
      } },

    // 9 · The air cools a few degrees: close on the thermometer by the school door, its red line sinking; Mila's shoulder and
    //     face at the edge, breath showing
    { id: 'S9', start: at('L09') - .2, sfx: [{ t: .2, type: 'wind', d: 3, v: .35 }, { t: 1.2, type: 'clock', v: .3 }],
      build: E => {
        const go = E.word('L09', 2);
        return layered(E, {
          light: [0, .1, -.12], lightR: .22, lightCol: '#cfeaff', key: .85, amb: .6, sky: { stops: NIGHT }, on: false,
          layers: [
            { name: 'wall', z: -.11, trans: .05, draw: x => { x.fillStyle = N.wall; x.fillRect(-.25, -.45, .5, .9);
              x.fillStyle = 'rgba(0,0,0,.18)'; for (let r = -20; r < 30; r++) x.fillRect(-.25, r * .012, .5, .0008);
              x.fillStyle = '#e8e2cc'; x.fillRect(.008, .0, .032, .12);                                    // the thermometer board
              x.fillStyle = '#2a3236'; for (let i = 0; i <= 8; i++) x.fillRect(.03, .015 + i * .011, .006, .0008);
              x.fillStyle = '#c9c2ac'; x.fillRect(.019, .014, .006, .094); x.beginPath(); x.arc(.022, .012, .006, 0, TAU); x.fill(); } },
            { name: 'merc', z: -.108, ...NOGLOW, w: .006, h: .09, x: .022, y: .059, ay: -.045, draw: x => { x.fillStyle = '#d7263d'; x.fillRect(-.002, -.045, .004, .09); } },
            { name: 'bulb', z: -.108, ...NOGLOW, w: .02, h: .02, x: .022, y: .012, draw: x => { x.fillStyle = '#d7263d'; x.beginPath(); x.arc(0, 0, .0045, 0, TAU); x.fill(); } },
            { name: 'breath', z: -.092, ...NOGLOW, glow: 1.2, glowCol: '#dff2ff', w: .05, h: .03, x: -.005, y: .058, draw: () => {},
              glowDraw: g => { g.fillStyle = 'rgba(255,255,255,.5)'; for (const [u, v, r] of [[-.008, 0, .006], [.002, .003, .008], [.012, .001, .006]]) { g.beginPath(); g.arc(u, v, r, 0, TAU); g.fill(); } } },
            mila('mila', -.035, -.175, .29, 'scared', -.09, { glow: .6 }),
          ],
          update: (t, L) => { L.merc.scale.y = 1 - .45 * ramp(t, go, go + 2.2);
            const b = (t % 1.8) / 1.8; L.breath.position.x = -.005 + .016 * b; L.breath.material.userData.u.uGlowLit.value = Math.sin(b * Math.PI); },
          cam: [[0, lv(.32, -.01, .03)], [E.dur, lv(.31, -.008, .03)]],
          focus: -.105, aper: 18,
        });
      } },

    // 10 · But Earth stays on course; gravity never switched off: space, the dark Sun at the centre, the Earth sliding along
    //      its dotted orbit. Slow orbit-like truck.
    { id: 'S10', start: at('L10') - .2, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'rumble', d: 3, v: .35 }],
      build: E => {
        const ORB = [0, .06, .075, .03];   // centre x, y, radius x, radius y
        const P = a => [ORB[0] + ORB[2] * Math.cos(a), ORB[1] + ORB[3] * Math.sin(a)];
        return layered(E, {
          light: [0, .1, -.13], lightR: .32, lightCol: '#cfeaff', amb: .5, sky: { stops: SPACE, stars: 160 }, on: false,
          layers: [
            deadSun('dead', ORB[0], ORB[1], .022, -.12),
            { name: 'orbit', z: -.115, ...NOGLOW, glow: 1.5, glowCol: T.em,
              draw: x => { x.fillStyle = '#1e3a58'; for (let i = 0; i < 60; i++) { const [px, py] = P(i / 60 * TAU); x.beginPath(); x.arc(px, py, .0009, 0, TAU); x.fill(); } },
              glowDraw: g => { g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { const [px, py] = P(i / 60 * TAU); g.beginPath(); g.arc(px, py, .0009, 0, TAU); g.fill(); } } },
            { ...earthLayer('earth', 0, 0, .011, -.11), x: 0, y: 0 },
            words('grav', 'GRAVITY: STILL ON', 0, .118, .011, T.em, -.112),
          ],
          glows: { dead: [[0, 1]], earth: [[0, 0]], orbit: [[0, .7]], grav: [[0, 0]] },
          update: (t, L) => { const [px, py] = P(-1.2 + t * .35); L.earth.position.x = px; L.earth.position.y = py;
            fade(L, 'grav', ramp(t, E.word('L10', 5) - .2, E.word('L10', 5) + .3)); },
          cam: [[0, [-.012, .055, .55, -.004, .058, -.1]], [E.dur, [.012, .055, .55, .004, .058, -.1]]],
          focus: -.11, aper: 12,
        });
      } },

    // 11 · At 12:16 the light comes back: the dark yard, then the Sun bursts back, the day returns, Mila throws her arms up
    { id: 'S11', start: at('L11') - .1, sfx: [{ t: 0, type: 'whoosh', v: .4 }],
      build: E => {
        const tb = E.cue('L11') + C.L11.dur * .55;
        return layered(E, {
          light: [.06, .12, -.13], lightR: .3, lightCol: DAWN.light, key: 1.1, amb: .6, ambCol: '#cfe6ff', sky: { stops: DAY }, on: false,
          layers: [
            ...dayYard(),
            { name: 'night', z: -.138, ...NOGLOW, draw: x => { const gr = x.createLinearGradient(0, .29, 0, 0); NIGHT.forEach(([s, c]) => gr.addColorStop(s, c)); x.fillStyle = gr; x.fillRect(-.25, -.05, .5, .4); } },
            stars('stars', 120, 31, -.136, .04),
            { ...school(N, true, -.119), name: 'nschool' },
            { ...yard(N, -.069), name: 'nyard' },
            mila('mila', -.04, 0, .125, 'smile', -.085, { glow: 0, arms: 'up' }),
            mila('mila2', -.04, 0, .125, 'surprised', -.084, { glow: .6 }),
          ],
          glows: { sun: [[0, 0], [tb, 0], [tb + .25, 1]], stars: [[0, 1]] },
          update: (t, L) => { const day = t >= tb;
            for (const n of ['night', 'stars', 'nschool', 'nyard', 'mila2']) L[n].visible = !day;
            for (const n of ['sun', 'school', 'tree', 'yard', 'mila']) L[n].visible = day;
            const k = 1 + .5 * Math.exp(-Math.max(0, t - tb) * 3) * (day ? 1 : 0); L.sun.scale.set(k, k, 1); },
          grade: t => ({ expo: t < tb ? .95 : 1.06 + .5 * Math.exp(-(t - tb) * 4) }),
          cam: [[0, lv(.5, -.005)], [E.dur, lv(.47, -.005)]],
          focus: -.085, aper: 16,
        });
      } },

    // 12 · Now, the riddle: the cream card, a pause from the sky: "THE RIDDLE" and a big question mark (captions off)
    { id: 'S12', start: at('L12') - .2, sfx: [{ t: .1, type: 'click', v: .5 }, { t: .5, type: 'clock', v: .3 }],
      build: E => layered(E, {
        light: [0, .1, -.12], lightR: .3, lightCol: '#fff4e0', key: 1, amb: .8, ambCol: '#fff4e0', sky: { stops: [[0, '#efe8d8'], [1, '#efe8d8']] }, on: false,
        layers: [
          { name: 'card', z: -.12, trans: .05, draw: x => { x.fillStyle = '#efe8d8'; x.fillRect(-.25, -.45, .5, .9); } },
          words('q', '?', 0, .085, .07, T.tag, -.1),
          words('t1', 'NOW, THE RIDDLE', 0, .03, .016, '#1a1a1a', -.1),
        ],
        update: (t, L) => { const k = 1 + .15 * Math.exp(-t * 5); L.q.scale.set(k, k, 1); },
        cam: [[0, [0, .06, .55, 0, .06, -.1]]],
        focus: -.1, aper: 20, grade: { vig: .15 },
      }) },

    // 13 · Her grandpa, fishing in New Zealand at midnight: a small boat on the black sea, his lantern on the bow, the full
    //      Moon and the stars both in his sky (name tag). Slow truck along the swell.
    { id: 'S13', start: at('L13') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'waves', d: 5, v: .35 }, { t: .8, type: 'whale', v: .2 }],
      build: E => layered(E, {
        light: [.04, .12, -.13], lightR: .26, lightCol: '#e8f0ff', key: .85, amb: .5, sky: { stops: [[0, '#081a32'], [.6, '#123a5a'], [1, '#2a6a80']] }, on: false,
        layers: [
          stars('stars', 160, 52, -.14, .04),
          moonLayer('moon', .055, .13, .016),
          { name: 'w1', z: -.12, trans: .3, draw: sea(.0, '#1d4a5e', '#4a8a9c') },
          { name: 'boat', z: -.1, trans: .05, w: .14, h: .14, x: -.01, y: .01, glow: 3, glowCol: '#ffcf8a',
            draw: x => { person(x, { ...GRANDPA, cx: -.006, by: -.014, s: .07, face: 'calm' }); x.fillStyle = '#3a2a22';
              x.beginPath(); x.moveTo(-.05, -.004); x.lineTo(.05, -.004); x.lineTo(.036, -.02); x.lineTo(-.04, -.02); x.closePath(); x.fill();
              x.fillStyle = '#2a1e18'; x.fillRect(.04, -.006, .002, .03); hangLantern(x, { cx: .041, cy: .012, r: .004, string: .003 }); },
            glowDraw: g => hangLantern(null, { cx: .041, cy: .012, r: .004, string: .003 }, g) },
          { name: 'w2', z: -.09, trans: .3, draw: sea(-.012, '#123848', '#3a7a8a', .011) },
        ],
        glows: { stars: [[0, .3], [E.word('L13', 13) - .3, .3], [E.word('L13', 13) + .5, 1]], moon: [[0, 1]] },
        flicker: ['boat'],
        update: (t, L) => { L.boat.position.y = .01 + .002 * Math.sin(t * 1.6); L.boat.rotation.z = .04 * Math.sin(t * 1.3);
          L.w2.position.x = L.w2.userData.p0.x + .006 * Math.sin(t * 1.1); },
        cam: [[0, lv(.48, -.012)], [E.dur, lv(.48, .012)]],
        focus: -.1, aper: 14,
      }) },

    // 14 · He saw it go out too (hit): close on grandpa's face, silver in the moonlight; on "saw" the light on his face goes
    //      out (we never see what went dark) and his eyes go wide, only his lantern still burning
    { id: 'S14', start: at('L14') - .1, sfx: [{ t: 0, type: 'whoosh', v: .4 }, { t: .2, type: 'waves', d: 4, v: .3 }],
      build: E => {
        const sw = E.word('L14', 10);
        const face = f => ({ draw: x => person(x, { ...GRANDPA, cx: 0, by: -.34, s: .44, face: f }), glowDraw: g => faceGlow(g, { cx: 0, by: -.34, s: .44 }) });
        return layered(E, {
          light: [.04, .12, -.12], lightR: .22, lightCol: '#e8f0ff', key: .85, amb: .5, sky: { stops: [[0, '#081a32'], [.6, '#123a5a'], [1, '#2a6a80']] }, on: false,
          layers: [
            stars('stars', 140, 61, -.14, -.05),
            { name: 'g1', z: -.09, trans: .02, glow: .55, glowCol: '#dfe8ff', ...face('calm') },
            { name: 'g2', z: -.089, trans: .02, glow: .25, glowCol: '#ffcf8a', ...face('scared') },
            { name: 'lan', z: -.085, ...NOGLOW, glow: 3, glowCol: '#ffcf8a', w: .04, h: .05, x: .06, y: -.03,
              draw: x => hangLantern(x, { cx: 0, cy: 0, r: .009, string: .006 }), glowDraw: g => hangLantern(null, { cx: 0, cy: 0, r: .009, string: .006 }, g) },
          ],
          glows: { g1: [[0, 1]], g2: [[0, 1]], lan: [[0, 1]] },
          flicker: ['lan'],
          update: (t, L) => { L.g1.visible = t < sw; L.g2.visible = t >= sw; },
          grade: t => ({ expo: t < sw ? 1.04 : .9 }),
          cam: [[0, lv(.34, 0)], [E.dur, lv(.31, 0)]],
          focus: -.09, aper: 18,
        });
      } },

    // 15 · How? Comment MOON or STARS: back to the sunny schoolyard, Mila and the fox on the roof, held under the choice
    { id: 'S15', start: at('L15') - .3, in: { type: 'dissolve', dur: .5 }, sfx: [{ t: .2, type: 'forest', d: 3, v: .3 }],
      build: E => layered(E, {
        light: [.06, .12, -.13], lightR: .3, lightCol: DAWN.light, key: 1.1, amb: .6, ambCol: '#cfe6ff', sky: { stops: DAY }, on: false,
        layers: [
          ...dayYard(),
          mila('mila', -.04, 0, .11, 'smile', -.085, { glow: 0 }),
        ],
        flicker: ['fox'],
        cam: [[0, lv(.5, .01)], [E.dur, lv(.52, .01)]],
        focus: -.1, aper: 16,
      }) },
  ];
}
