// The Wrong Transfer · Part 1 (I soldi che scottano, pipeline/formati/soldi.md) — shot list. 2:14 am: you sit up in bed,
// your face blue in the phone's light. The bank app says $4,800,000; yesterday it said $212. A text from an unknown number:
// "Don't call the bank. I'm coming for it." Real facts on cream pages (research/2026-11-05.md): a bank can take back a wrong
// transfer; in 2019 a couple in Pennsylvania spent $120,000 deposited by mistake, the bank took it back and they were
// charged with theft; in 2020 a big bank sent $900 million by accident and fought two years in court to get it back.
// Every tap leaves a trail: the SUSPICION counter climbs as you open the app nine times and search "can I keep it".
// 8:59 am, the bank opens in one minute; "I'm outside": a grey car with its engine running under your window, and on the
// garden wall in front, the fox with her lantern. BANK or WAIT?
// Themes: telefono/notte (the screen is the only light), a dawn palette from 8:59, telefono/allarme for "I'm outside".
// One accent beside the fox's orange: money green, on the counter, the bills and the transfer slip.
// Rules kept from pipeline/MIGLIORARE.md:
// - frame 0 already full: you large in bed (a third of the height), the lock screen with the transfer, and the big counter
//   top right running from $212 to $4,800,000 in the first 1.8 s (the premise is the number); a cut to the close-up at ~3 s;
// - the scene fills the vertical frame: blanket and floorboards, the street, the cream pages down to the bottom edge;
// - a big counter top right (digits ~4.5 % of the height, light and solid, never under the pop captions) that changes 7
//   times: BALANCE $212 → $4,800,000, then SUSPICION 0 → 15 → 35 → 50 → 70 → 85 %, swelling and flashing each time;
// - the first line says one thing only (the balance); hour and place sit in the clock of the series tag;
// - true face close-ups at S2, S4, S9, S13 (one every ~12 s); level camera at the floor in every shot with a figure (lv()).
import { layered } from './engine/kit/shot.js';
import { person, foxCameo, fox, house, houses, bed, nightstand, phone, car } from './engine/kit/motifs.js';
import { theme } from './engine/kit/themes.js';
import { text } from './engine/paper.js';
import { ss, seg, clamp } from './engine/lib.js';

const T = theme('telefono', 'notte'), A = theme('telefono', 'allarme');
const TAU = Math.PI * 2;
const YOU = { coat: '#e0b03a', pants: '#1c2240', hat: false };            // you: the mustard hoodie, the one strong colour
const NIGHT = [[0, '#0a0d1c'], [.45, '#1a2246'], [.8, '#32406e'], [1, '#4a5a8a']];
const DAWN = [[0, '#2a3052'], [.45, '#5a5f86'], [.78, '#b48c8a'], [1, '#efc49c']];
const RED = [[0, '#1c0a12'], [.4, '#3a1222'], [.7, '#5c1c30'], [1, '#7a2a40']];
const WALL = '#2e3866', FLOOR = '#1c2244';
const DWALL = '#4c4c74', DFLOOR = '#2c2e50';                              // the same room at 8:59, grey morning light
const SCREEN = '#cfe0ff', WARM = '#ffcf8a', MONEY = '#3fae6a', INK = '#1e1a14', STAMP = '#c8342b';
const MOON = { x: .05, y: .16, r: .014, gain: 1.3, halo: 3.4, haloGain: .24 };

// level camera: the line y = Y (the floor) sits at 50 % of the frame at every depth, so nothing standing on it floats
const lv = (pz, x = 0, Y = 0, tz = -.1) => [x, Y, pz, x, Y, tz];
const floorFront = (col, z, top = .0015) => ({ name: 'floor', z, trans: .02, shadow: false, draw: x => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45 + top); } });
const planks = (x, col) => { x.fillStyle = col; x.fillRect(-.25, -.45, .5, .45);
  x.fillStyle = 'rgba(0,0,0,.24)'; for (let i = 1; i < 16; i++) x.fillRect(-.25, -Math.pow(i / 16, 1.5) * .45, .5, .0012);
  x.fillStyle = 'rgba(220,230,255,.05)'; x.fillRect(-.25, -.004, .5, .004); };
// the bedroom: plaster wall with a skirting board, optional holes (the window onto the street), floorboards below
const room = (name, z, holes = [], o = {}) => ({ name, z, trans: .05,
  draw: x => {
    x.fillStyle = o.wall || WALL; x.fillRect(-.25, 0, .5, .45);
    x.fillStyle = 'rgba(0,0,0,.2)'; x.fillRect(-.25, 0, .5, .006);
    x.fillStyle = 'rgba(255,255,255,.035)'; for (let c = -12; c < 12; c++) x.fillRect(c * .02, 0, .0008, .45);
    for (const [hx, hy, hw, hh] of holes) {
      x.save(); x.globalCompositeOperation = 'destination-out'; x.fillRect(hx - hw / 2, hy - hh / 2, hw, hh); x.restore();
      x.fillStyle = '#141a34'; x.fillRect(hx - .0015, hy - hh / 2, .003, hh); x.fillRect(hx - hw / 2, hy - .0015, hw, .003);
      x.fillRect(hx - hw / 2 - .003, hy - hh / 2 - .004, hw + .006, .004);
    }
    planks(x, o.floor || FLOOR);
  } });
// the street outside the window: a row of dark houses, a few windows lit; o.car: the grey car parked below, headlight on
const street = (name, z, by = .04, seed = 7, o = {}) => ({ name, z, trans: .2, glow: 1.6, glowCol: WARM,
  draw: x => { houses(x, { x0: -.2, x1: .2, by, h: .035, seed, col: o.col || '#121834', glass: '#232a48', lit: false });
    if (o.car) { x.fillStyle = '#1a1e30'; x.fillRect(-.25, by - .03, .5, .03); car(x, { cx: o.car, by: by + .002, w: .03, col: '#6a6e7a', glass: '#2a2e3e' }); } },
  glowDraw: g => { houses(null, { x0: -.2, x1: .2, by, h: .035, seed, lit: [1] }, g); if (o.car) car(null, { cx: o.car, by: by + .002, w: .03 }, g); } });
// the face's own light: the screen light on the head, eyes and mouth stay dark (same geometry as person())
const faceGlow = (g, { cx, by, s, face }) => {
  const hr = s * .16, hy = by + s * .78, ex = hr * .36, ey = hy + hr * .05, big = face === 'scared' || face === 'surprised';
  g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, hy, hr, 0, TAU); g.fill();
  g.fillStyle = '#000'; for (const d of [-1, 1]) { g.beginPath(); g.arc(cx + d * ex, ey, hr * (big ? .09 : .11), 0, TAU); g.fill(); }
  g.fillRect(cx - hr * .28, hy - hr * .52, hr * .56, hr * .2);
};
// you sitting up in bed: headboard behind, you, the blanket in front up to the waist, the phone glowing in your hands
const inBed = (cx, s, face, z = -.09, o = {}) => {
  const w = s * .85, h = s * .26, pw = s * .13, ph = s * .22, py = s * .5;
  return [
    { name: 'head', z: z - .006, trans: .04, draw: x => { bed(x, { cx, by: 0, w, h, part: 'back' }); if (o.stand) nightstand(x, { cx: cx + w * .78, by: 0, w: s * .3, h: s * .3 }); } },
    { name: 'you', z, trans: .02, glow: .7, glowCol: SCREEN, draw: x => person(x, { ...YOU, cx, by: 0, s, face }), glowDraw: g => faceGlow(g, { cx, by: 0, s, face }) },
    { name: 'cover', z: z + .002, trans: .03, draw: x => bed(x, { cx, by: 0, w, h, part: 'front', cover: s * .2 }) },
    { name: 'phone', z: z + .003, trans: .02, glow: 3, glowCol: SCREEN,
      draw: x => phone(x, { cx: cx + s * .04, cy: py, w: pw, h: ph }), glowDraw: g => phone(null, { cx: cx + s * .04, cy: py, w: pw, h: ph }, g) },
  ];
};
// the fox sitting with her lantern: paws on y = by
const foxAt = (cx, by, s, z, flip = false) => ({ name: 'fox', z, trans: .2, glow: 3.4, w: s * 2.8, h: s * 2.8, x: cx, y: by + s,
  draw: x => foxCameo(x, { cx: 0, by: -s, s, pose: 'watch', flip }), glowDraw: g => foxCameo(null, { cx: 0, by: -s, s, pose: 'watch', flip }, g) });
const bedroom = (o = {}) => ({ light: [-.04, .05, -.12], lightR: .1, lightCol: SCREEN, key: 1.05, amb: .85, ambCol: '#8a9ad0', sky: { stops: NIGHT, stars: 90 }, on: false, ...o });

// —— The cream pages of the facts: a flat sheet that fills the frame, a header, big numbers, stamps that drop ——
// Camera MC looks square at the page (z −0.1): the frame shows x ±0.055, y ±0.098. The top 0.07 is the series tag and the
// counter, y 0 … −0.03 the pop captions: the content of a page sits between y 0.065 and 0.003, the bottom is ruled paper.
const MC = [0, 0, .22, 0, 0, -.1];
const page = (head, sub) => ({ name: 'page', z: -.1, trans: .05, draw: x => {
  x.fillStyle = '#efe8d8'; x.fillRect(-.25, -.45, .5, .9);
  x.fillStyle = 'rgba(60,50,30,.10)'; for (let i = 0; i < 14; i++) x.fillRect(-.25, -.034 - i * .006, .5, .0004);   // ruled lines low on the page
  x.fillStyle = INK; x.fillRect(-.046, .056, .092, .0006);
  text(x, head, 0, .062, .0042, '"Anton"', { fill: STAMP });
  if (sub) text(x, sub, 0, .05, .003, '"Anton"', { fill: '#6a5e48' });
} });
const sign = (name, s, cx, cy, size, fill = INK, z = -.098) => ({ name, z, trans: .2, w: .11, h: size * 2, x: cx, y: cy, shadow: false, recv: false,
  draw: x => text(x, s, 0, 0, size, '"Anton"', { fill }) });
// a rubber stamp: red frame and words, tilted; it drops onto the page (dropIn)
const stamp = (name, s, cx, cy, size, rot = -.12) => ({ name, z: -.096, trans: .25, w: .11, h: size * 3, x: cx, y: cy, shadow: false, recv: false,
  draw: x => { x.save(); x.rotate(rot); const w = s.length * size * .52 + size * 1.2;
    x.strokeStyle = STAMP; x.lineWidth = size * .14; x.strokeRect(-w / 2, -size * .85, w, size * 1.7);
    text(x, s, 0, 0, size, '"Anton"', { fill: STAMP }); x.restore(); } });
const dropIn = (L, n, t, t0, d = .16) => { const m = L[n]; m.visible = t >= t0; const k = ss(seg(t, t0, t0 + d)); m.scale.setScalar(1.7 - .7 * k); m.material.color.setScalar(.4 + .6 * k); };
const showAt = (L, n, t, t0) => { L[n].visible = t >= t0; };
// a banknote seen flat, money green
const bill = (name, cx, cy, w, z = -.098) => ({ name, z, trans: .1, w: w * 1.2, h: w * .7, x: cx, y: cy, shadow: false, recv: false,
  draw: x => { const h = w * .45; x.fillStyle = MONEY; x.fillRect(-w / 2, -h / 2, w, h); x.strokeStyle = '#e8f5e8'; x.lineWidth = w * .03; x.strokeRect(-w * .42, -h * .36, w * .84, h * .72);
    x.fillStyle = '#e8f5e8'; x.beginPath(); x.arc(0, 0, h * .24, 0, TAU); x.fill(); x.fillStyle = MONEY; text(x, '$', 0, 0, h * .36, '"Anton"', { fill: MONEY }); } });
const pageFox = (cx, by, s = .011) => ({ name: 'fox', z: -.097, trans: .2, glow: 2.4, shadow: false,
  draw: x => fox(x, { cx, by, s, lantern: true }), glowDraw: g => fox(null, { cx, by, s, lantern: true }, g) });

// —— The screen of this film: the big counter top right, the phone on the right half, the bank timer beside it ——
function screenUI() {
  if (typeof document === 'undefined' || document.getElementById('wt-ui')) return;
  const st = document.createElement('style'); st.id = 'wt-ui';
  st.textContent = `#hud .clock { font-size: 50px !important; }
#ui .phone { left: 545px !important; top: 370px !important; width: 440px !important; height: 640px !important; border-radius: 54px !important; }
#ui .phone .time { font-size: 110px !important; margin-top: 10px !important; }
#ui .phone .big { font-size: 150px !important; }
#ui .timer { left: 640px !important; top: 400px !important; width: 340px !important; height: 340px !important; }
#wt-count { position: absolute; right: 60px; top: 136px; width: 420px; padding: 10px 16px 12px; background: rgba(8,10,20,.86);
  border: 3px solid rgba(255,255,255,.14); font-family: Anton; text-align: center; pointer-events: none; transform-origin: 100% 0; }
#wt-count small { display: block; font-size: 26px; letter-spacing: .14em; color: #c8cbe0; }
#wt-count b { display: block; font-weight: 400; font-size: 86px; line-height: 1.02; }`;
  document.head.append(st);
}
const money = v => '$' + Math.round(v).toLocaleString('en-US');
function drawUI(g, sched, run) {
  const pop = document.getElementById('pop'); if (!pop) return;
  let n = document.getElementById('wt-count');
  if (!n) { n = document.createElement('div'); n.id = 'wt-count'; pop.parentElement.append(n); }
  let cur = sched[0], since = 99;
  for (const s of sched) if (g >= s[0]) { cur = s; since = g - s[0]; }
  let [, label, value, col] = cur, flash = since < .55 ? 1 - since / .55 : 0;
  if (value === 'RUN') { const k = ss(seg(g, run[0], run[1])); value = money(212 + (4800000 - 212) * k * k); flash = g > run[1] && g < run[1] + .55 ? 1 - (g - run[1]) / .55 : 0; }
  const html = `<small>${label}</small><b style="color:${col}">${value}</b>`;
  if (n.dataset.h !== html) { n.dataset.h = html; n.innerHTML = html; }
  n.style.transform = `scale(${(1 + .14 * flash).toFixed(3)})`;
  n.style.background = flash ? `rgba(${Math.round(8 + 150 * flash)},${Math.round(10 + 20 * flash)},20,.9)` : 'rgba(8,10,20,.86)';
  n.style.borderColor = flash ? '#fbf3e4' : 'rgba(255,255,255,.14)';
  const hud = document.getElementById('hud'); n.style.visibility = hud && hud.style.visibility === 'hidden' ? 'hidden' : 'visible';
}
const withUI = (shot, sched, run) => ({ ...shot, build: async E => {
  const s = await shot.build(E), up = s.update?.bind(s);
  return Object.assign(s, { update(t) { const r = up?.(t); if (typeof document !== 'undefined') drawUI(shot.start + t, sched, run); return r; } });
} });

export function SHOTS(C, DUR) {
  screenUI();
  const at = id => C[id].at;
  const fr = (id, f) => at(id) + C[id].dur * f;   // a moment inside a line, as a fraction of it (safe with respelled words)
  const GR = '#7dffb0', W1 = '#f6ead0', YL = '#ffd34d', RD = '#ff5b4d';
  const run = [.15, 1.9];
  const sched = [[0, 'BALANCE · CHECKING', 'RUN', GR],
    [at('L05') - .1, 'SUSPICION', '0%', W1], [fr('L08', .75), 'SUSPICION', '15%', YL], [fr('L09', .8), 'SUSPICION', '35%', YL],
    [fr('L12', .6), 'SUSPICION', '50%', RD], [fr('L13', .55), 'SUSPICION', '70%', RD], [fr('L14', .6), 'SUSPICION', '85%', RD]];
  const shots = [
    // 1 · The hook, already lit: you sitting up in bed on the left, a third of the frame, your face blue in the phone's light,
    //     the window onto the dark street behind you. The lock screen with the transfer on the right, the counter running.
    { id: 'S1', start: 0, sfx: [{ t: 0, type: 'room', d: 5, v: .3 }, { t: .15, type: 'chime', v: .3 }, { t: 1.9, type: 'boom', v: .2 }],
      build: E => layered(E, bedroom({ moon: MOON,
        layers: [
          street('street', -.13),
          room('wall', -.115, [[.035, .085, .05, .06]]),
          ...inBed(-.04, .092, 'surprised', -.09, { stand: true }),
          floorFront(FLOOR, -.084),
        ],
        glows: { phone: [[0, .8], [.15, 1]], street: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.37, 0)], [E.dur, lv(.33, -.004)]],
        focus: -.09, aper: 14, grade: { expo: 1.5 },
      })) },

    // 2 · "Yesterday, you had $212": a true close-up of your face, eyes wide; the app shows yesterday's balance. Hard cut.
    { id: 'S2', start: at('L02') - .1, sfx: [{ t: 0, type: 'breath', v: .22 }],
      build: E => layered(E, bedroom({ sky: { stops: NIGHT },
        layers: [room('wall', -.12), ...inBed(-.03, .09, 'surprised')],
        glows: { phone: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.15, -.002, .066, -.09)], [E.dur, lv(.13, -.004, .068, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.55, vig: .18 },
      })) },

    // 3 · A text arrives: the bedroom wider, from the other side; a light across the street goes out as the phone chimes.
    { id: 'S3', start: at('L03') - .15, sfx: [{ t: .1, type: 'chime', v: .28 }],
      build: E => layered(E, bedroom({ light: [-.05, .05, -.12], moon: { ...MOON, x: -.02 },
        layers: [
          street('street', -.13, .04, 11),
          room('wall', -.115, [[-.01, .085, .05, .06]]),
          ...inBed(-.05, .088, 'scared', -.09, { stand: true }),
          floorFront(FLOOR, -.084),
        ],
        glows: { phone: [[0, .7], [.1, 1]], street: [[0, 1], [E.dur * .55, 1], [E.dur * .55 + .15, 0]] }, flicker: ['phone'],
        cam: [[0, lv(.42, -.02)], [E.dur, lv(.39, .006)]],
        focus: -.09, aper: 13, grade: { expo: 1.5 },
      })) },

    // 4 · Snapback, "I'm coming for it": the closest face so far, scared, the wall going red behind you; push in on "coming".
    { id: 'S4', start: at('L04') - .1, sfx: [{ t: .05, type: 'boom', v: .26 }, { t: .4, type: 'breath', v: .22 }],
      build: E => {
        const cm = E.cue('L04') + C.L04.dur * .7;
        return layered(E, bedroom({ lightCol: A.light, ambCol: '#a08ab0', sky: { stops: RED },
          layers: [room('wall', -.12, [], { wall: '#4a2a4a', floor: '#2a1626' }), ...inBed(0, .09, 'scared')],
          glows: { phone: [[0, 1]] }, flicker: ['phone'],
          cam: [[0, lv(.16, -.006, .066, -.09)], [cm, lv(.14, -.006, .067, -.09)], [cm + .2, lv(.11, -.004, .07, -.09)], [E.dur, lv(.105, -.004, .071, -.09)]],
          focus: -.09, aper: 18, grade: { expo: 1.55, vig: .22 },
        }));
      } },

    // 5 · PROBLEM 1 · IT ISN'T YOURS, a cream page: the transfer slip with the green amount; on "back" the stamp REVERSED
    //     drops over it and an arrow points back to the sender. The page stays still and flat.
    { id: 'S5', start: at('L05') - .1, in: { type: 'cut' }, sfx: [{ t: 0, type: 'page', v: .28 }, { t: .1 + C.L05.dur * .82, type: 'boom', v: .24 }],
      build: E => {
        const bk = E.cue('L05') + C.L05.dur * .82, ys = E.cue('L05') + C.L05.dur * .3;
        return layered(E, { light: [0, .05, -.06], lightR: .2, lightCol: '#fff4e0', key: .9, amb: 1, ambCol: '#fff0dc', on: false,
          layers: [
            page('PROBLEM 1', 'A BANK CAN TAKE IT BACK'),
            { name: 'slip', z: -.099, trans: .05, shadow: false, draw: x => {
              x.fillStyle = '#fbf7ee'; x.fillRect(-.042, .008, .084, .034); x.strokeStyle = 'rgba(30,26,20,.35)'; x.lineWidth = .0004; x.strokeRect(-.042, .008, .084, .034);
              text(x, 'INCOMING TRANSFER', -.038, .036, .0026, '"Anton"', { fill: '#6a5e48', align: 'left' });
              text(x, '+$4,799,788.00', 0, .024, .0072, '"Anton"', { fill: MONEY });
              text(x, 'FROM: UNKNOWN · REF: —', -.038, .013, .0024, '"Anton"', { fill: '#6a5e48', align: 'left' }); } },
            sign('yours', "IT ISN'T YOURS", 0, -.0, .0052, INK),
            stamp('rev', 'REVERSED', .012, .026, .0062),
          ],
          update: (t, L) => { showAt(L, 'yours', t, ys); dropIn(L, 'rev', t, bk); },
          cam: [[0, MC], [E.dur, MC]], focus: -.1, aper: 20, grade: { expo: 1.0, vig: .12, sat: .95 },
        });
      } },

    // 6 · 2019 · PENNSYLVANIA: a car and a camper drawn on the page on "spent", then $120,000 in big green numbers.
    { id: 'S6', start: at('L06') - .15, in: { type: 'cut' }, sfx: [{ t: 0, type: 'page', v: .24 }, { t: .15 + C.L06.dur * .45, type: 'car', d: 1.4, v: .16 }],
      build: E => {
        const sp = E.cue('L06') + C.L06.dur * .45, nm = E.cue('L06') + C.L06.dur * .75;
        return layered(E, { light: [0, .05, -.06], lightR: .2, lightCol: '#fff4e0', key: .9, amb: 1, ambCol: '#fff0dc', on: false,
          layers: [
            page('2019 · PENNSYLVANIA', 'A BANK ERROR · A COUPLE · 3 WEEKS'),
            { name: 'car', z: -.099, trans: .1, shadow: false, w: .05, h: .03, x: -.022, y: .03,
              draw: x => car(x, { cx: 0, by: -.006, w: .032, col: '#3a4a6a', glass: '#9aa8c0' }) },
            { name: 'camper', z: -.099, trans: .1, shadow: false, w: .05, h: .03, x: .022, y: .03,
              draw: x => { x.fillStyle = '#d8cfb8'; x.fillRect(-.018, -.006, .036, .016); x.fillStyle = '#7a6a50'; x.fillRect(-.014, .001, .008, .005); x.fillRect(.002, .001, .012, .005);
                x.fillStyle = INK; for (const k of [-.01, .01]) { x.beginPath(); x.arc(k, -.006, .0032, 0, TAU); x.fill(); } } },
            sign('num', '$120,000', 0, .006, .011, MONEY),
            pageFox(.042, -.06),
          ],
          glows: { fox: [[0, 1]] },
          update: (t, L) => { dropIn(L, 'car', t, sp, .2); dropIn(L, 'camper', t, sp + .25, .2); dropIn(L, 'num', t, nm, .18); },
          cam: [[0, MC], [E.dur, MC]], focus: -.1, aper: 20, grade: { expo: 1.0, vig: .12, sat: .95 },
        });
      } },

    // 7 · "Took it all back": a red line strikes through $120,000; on "theft" the stamp CHARGED WITH THEFT drops.
    { id: 'S7', start: at('L07') - .1, in: { type: 'cut' }, sfx: [{ t: .1 + C.L07.dur * .3, type: 'page', v: .22 }, { t: .1 + C.L07.dur * .88, type: 'boom', v: .3 }],
      build: E => {
        const bk = E.cue('L07') + C.L07.dur * .3, th = E.cue('L07') + C.L07.dur * .88;
        return layered(E, { light: [0, .05, -.06], lightR: .2, lightCol: '#fff4e0', key: .9, amb: 1, ambCol: '#fff0dc', on: false,
          layers: [
            page('THE BANK TOOK IT BACK', 'WHAT THEY HAD SPENT, THEY STILL OWED'),
            sign('num', '$120,000', 0, .03, .011, MONEY, -.099),
            { name: 'strike', z: -.098, trans: .1, shadow: false, w: .1, h: .01, x: 0, y: .03, ax: -.04,
              draw: x => { x.fillStyle = STAMP; x.fillRect(-.04, -.0012, .08, .0024); } },
            sign('owed', 'OVERDRAWN: –$107,000', 0, .014, .0046, STAMP),
            stamp('theft', 'CHARGED WITH THEFT', 0, .02, .0054, .1),
          ],
          update: (t, L) => { const k = ss(seg(t, bk, bk + .3)); L.strike.visible = k > 0; L.strike.scale.x = Math.max(.001, k);
            showAt(L, 'owed', t, bk + .5); dropIn(L, 'theft', t, th); },
          cam: [[0, MC], [E.dur, MC]], focus: -.1, aper: 20, grade: { expo: 1.0, vig: .12, sat: .95 },
        });
      } },

    // 8 · PROBLEM 2 · every tap leaves a trail: back in the bedroom, wide, the sign-ins listed on the phone; the counter
    //     climbs to 15 %. Lateral drift from the left.
    { id: 'S8', start: at('L08') - .15, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: .2, type: 'room', d: C.L08.dur + .4, v: .24 }, { t: .3 + C.L08.dur * .5, type: 'chime', v: .18 }],
      build: E => layered(E, bedroom({ moon: MOON,
        layers: [
          street('street', -.13, .04, 5),
          room('wall', -.115, [[.035, .085, .05, .06]]),
          ...inBed(-.04, .09, 'calm', -.09, { stand: true }),
          floorFront(FLOOR, -.084),
        ],
        glows: { phone: [[0, 1]], street: [[0, 0]] }, flicker: ['phone'],
        cam: [[0, lv(.4, -.03)], [E.dur, lv(.36, -.01)]],
        focus: -.09, aper: 13, grade: { expo: 1.5 },
      })) },

    // 9 · "Can I keep it?": close on your face from the other side, the search on the screen; the counter jumps to 35 %.
    { id: 'S9', start: at('L09') - .1, sfx: [{ t: .1, type: 'typing', d: C.L09.dur * .7, v: .22 }],
      build: E => layered(E, bedroom({ light: [-.02, .05, -.12], sky: { stops: NIGHT },
        layers: [room('wall', -.12), ...inBed(-.02, .09, 'calm')],
        glows: { phone: [[0, 1]] }, flicker: ['phone'],
        cam: [[0, lv(.18, -.03, .06, -.09)], [E.dur, lv(.15, -.022, .064, -.09)]],
        focus: -.09, aper: 16, grade: { expo: 1.55, vig: .2 },
      })) },

    // 10 · 2020 · A BIG BANK: nine green bills appear one by one ($100 million each), then $900,000,000, then BY ACCIDENT.
    { id: 'S10', start: at('L10') - .15, in: { type: 'cut' }, sfx: [{ t: 0, type: 'page', v: .26 }, { t: .15 + C.L10.dur * .93, type: 'boom', v: .26 }],
      build: E => {
        const b0 = E.cue('L10') + C.L10.dur * .45, nm = E.cue('L10') + C.L10.dur * .72, ac = E.cue('L10') + C.L10.dur * .93;
        const bills = Array.from({ length: 9 }, (_, i) => bill('b' + i, -.03 + (i % 3) * .03, .04 - Math.floor(i / 3) * .0115, .024, -.099 + i * .0001));
        return layered(E, { light: [0, .05, -.06], lightR: .2, lightCol: '#fff4e0', key: .9, amb: 1, ambCol: '#fff0dc', on: false,
          layers: [
            page('2020 · ONE BIG BANK', 'EACH BILL = $100 MILLION'),
            ...bills,
            sign('num', '$900,000,000', 0, .009, .0085, MONEY, -.097),
            stamp('acc', 'BY ACCIDENT', .018, .026, .0058, -.14),
          ],
          update: (t, L) => { for (let i = 0; i < 9; i++) dropIn(L, 'b' + i, t, b0 + i * .09, .12); dropIn(L, 'num', t, nm, .18); dropIn(L, 'acc', t, ac); },
          cam: [[0, MC], [E.dur, MC]], focus: -.1, aper: 20, grade: { expo: 1.0, vig: .12, sat: .95 },
        });
      } },

    // 11 · "Two years in court": three calendar sheets, 2020 → 2021 → 2022, one after the other; the fox at the corner.
    { id: 'S11', start: at('L11') - .1, in: { type: 'dissolve', dur: .3 }, sfx: [0, 1, 2].map(i => ({ t: .2 + C.L11.dur * (.25 + i * .2), type: 'page', v: .22 })),
      build: E => {
        const yr = i => E.cue('L11') + C.L11.dur * (.25 + i * .2);
        const sheetY = (i, y) => ({ name: 'y' + i, z: -.099 + i * .0004, trans: .1, shadow: false, w: .04, h: .05, x: -.03 + i * .03, y: .03,
          draw: x => { x.fillStyle = '#fbf7ee'; x.fillRect(-.012, -.016, .024, .032); x.fillStyle = STAMP; x.fillRect(-.012, .008, .024, .008);
            x.strokeStyle = 'rgba(30,26,20,.35)'; x.lineWidth = .0004; x.strokeRect(-.012, -.016, .024, .032); text(x, y, 0, -.004, .0062, '"Anton"', { fill: INK }); } });
        return layered(E, { light: [0, .05, -.06], lightR: .2, lightCol: '#fff4e0', key: .9, amb: 1, ambCol: '#fff0dc', on: false,
          layers: [
            page('EVEN THE BANK', 'TO GET ITS OWN MONEY BACK'),
            sheetY(0, '2020'), sheetY(1, '2021'), sheetY(2, '2022'),
            sign('court', '2 YEARS IN COURT', 0, .004, .006, STAMP),
            pageFox(-.042, -.06),
          ],
          glows: { fox: [[0, 1]] },
          update: (t, L) => { for (let i = 0; i < 3; i++) dropIn(L, 'y' + i, t, yr(i), .15); showAt(L, 'court', t, yr(2) + .3); },
          cam: [[0, MC], [E.dur, MC]], focus: -.1, aper: 20, grade: { expo: 1.0, vig: .12, sat: .95 },
        });
      } },

    // 12 · 8:59 AM: the same bedroom in grey morning light, you still in bed, the phone in your hands, the bank's timer.
    { id: 'S12', start: at('L12') - .3, in: { type: 'dissolve', dur: .6 }, sfx: [{ t: 0, type: 'clock', d: C.L12.dur + .8, v: .26 }],
      build: E => layered(E, bedroom({ light: [.03, .08, -.13], lightR: .16, lightCol: '#ffe2c0', amb: 1, ambCol: '#b0a8c8', sky: { stops: DAWN },
        layers: [
          street('street', -.13, .04, 7, { col: '#3a3c5c' }),
          room('wall', -.115, [[.035, .085, .05, .06]], { wall: DWALL, floor: DFLOOR }),
          ...inBed(-.04, .092, 'scared', -.09, { stand: true }),
          floorFront(DFLOOR, -.084),
        ],
        glows: { phone: [[0, .8]], street: [[0, 0]] },
        cam: [[0, lv(.34, -.01)], [E.dur, lv(.3, -.016)]],
        focus: -.09, aper: 14, grade: { expo: 1.35, sat: .9 },
      })) },

    // 13 · "I'm outside": the closest face of the film, red, the phone buzzing in your hands (it shakes).
    { id: 'S13', start: at('L13') - .1, in: { type: 'cut' }, sfx: [{ t: .05, type: 'phone-ring', d: .9, v: .2 }, { t: .1 + C.L13.dur * .6, type: 'boom', v: .3 }],
      build: E => {
        const bz = []; for (let t = 0; t < 1.2; t += .06) bz.push([t, [((t * 50) % 2 > 1 ? 1 : -1) * .0004, 0, 0]]); bz.push([1.26, [0, 0, 0]]);
        return layered(E, bedroom({ lightCol: A.light, ambCol: '#c08aa0', sky: { stops: RED },
          layers: [room('wall', -.12, [], { wall: '#5a2238', floor: '#2a0c18' }), ...inBed(0, .09, 'surprised')],
          glows: { phone: [[0, 1]] }, flicker: ['phone'],
          move: { phone: bz },
          cam: [[0, lv(.12, 0, .07, -.09)], [E.dur, lv(.1, 0, .071, -.09)]],
          focus: -.09, aper: 18, grade: { expo: 1.55, vig: .24 },
        }));
      } },

    // 14 · The street at 9 am: your house, your window lit, a grey car at the curb with its headlight on and exhaust puffing;
    //      in front, on the garden wall, the fox with her lantern, looking at the car. Push in to the car.
    { id: 'S14', start: at('L14') - .2, in: { type: 'cut' }, sfx: [{ t: 0, type: 'car', d: C.L14.dur + 1, v: .3 }, { t: 0, type: 'wind', d: C.L14.dur + 1, v: .18 }],
      build: E => {
        const puff = i => ({ name: 'p' + i, z: -.104, trans: .4, shadow: false, w: .02, h: .02, x: -.032, y: .006,
          draw: x => { x.fillStyle = 'rgba(220,220,235,.55)'; x.beginPath(); x.arc(0, 0, .003, 0, TAU); x.fill(); } });
        return layered(E, { light: [.03, .08, -.14], lightR: .2, lightCol: '#ffe2c0', key: 1.05, amb: 1, ambCol: '#b0a8c8', sky: { stops: DAWN }, on: false,
          layers: [
            { name: 'town', z: -.13, trans: .2, draw: x => houses(x, { x0: -.22, x1: .22, by: .02, h: .04, seed: 3, col: '#3a3c5c', glass: '#4a4c6a', lit: false }) },
            { name: 'home', z: -.115, trans: .12, glow: 2.6, glowCol: SCREEN,
              draw: x => house(x, { cx: .02, by: 0, w: .08, h: .075, rows: 2, cols: 2, col: '#2c2e4c', glass: '#3c3e5a', lit: false }),
              glowDraw: g => house(null, { cx: .02, by: 0, w: .08, h: .075, rows: 2, cols: 2, lit: [3] }, g) },
            { name: 'road', z: -.108, trans: .03, shadow: false, draw: x => { x.fillStyle = '#26283e'; x.fillRect(-.25, -.45, .5, .45);
              x.fillStyle = '#3a3c54'; x.fillRect(-.25, -.004, .5, .004); x.fillStyle = 'rgba(240,230,200,.25)'; for (let i = -12; i < 12; i++) x.fillRect(i * .02, -.03, .01, .0015); } },
            { name: 'car', z: -.105, trans: .05, glow: 2.4, glowCol: '#fff0c8',
              draw: x => car(x, { cx: -.005, by: 0, w: .055, col: '#6a6e7a', glass: '#2a2e3e' }), glowDraw: g => car(null, { cx: -.005, by: 0, w: .055 }, g) },
            puff(0), puff(1), puff(2),
            { name: 'wall', z: -.094, trans: .04, shadow: false, draw: x => { x.fillStyle = '#1c1e32'; x.fillRect(-.25, -.45, .5, .45 - .012); x.fillStyle = '#2a2c44'; x.fillRect(-.25, -.016, .5, .004); } },
            foxAt(-.03, -.012, .012, -.093),
          ],
          glows: { home: [[0, 1]], car: [[0, 1]], fox: [[0, 1]] }, flicker: ['fox', 'car'],
          update: (t, L) => { for (let i = 0; i < 3; i++) { const k = ((t + i * .5) % 1.5) / 1.5, m = L['p' + i];
            m.position.x = m.userData.p0.x - .012 * k; m.position.y = m.userData.p0.y + .004 * k; m.scale.setScalar(.6 + 1.6 * k); m.material.color.setScalar(1 - k); } },
          cam: [[0, lv(.3, -.004, 0, -.1)], [E.dur, lv(.24, -.006, .004, -.1)]],
          focus: [[0, -.094], [E.dur * .5, -.105]], aper: 10, grade: { expo: 1.35, vig: .18, sat: .9 },
        });
      } },

    // 15 · The dilemma, held under the choice: the bedroom at 9, you in bed with the phone (BANK), and through the window
    //      the grey car below with its headlight on (WAIT). Slow push between them.
    { id: 'S15', start: at('L15') - .2, in: { type: 'dissolve', dur: .4 }, sfx: [{ t: 0, type: 'room', d: DUR - at('L15') + .5, v: .26 }, { t: .3, type: 'car', d: 2.5, v: .14 }],
      build: E => layered(E, bedroom({ light: [.03, .08, -.13], lightR: .16, lightCol: '#ffe2c0', amb: 1, ambCol: '#b0a8c8', sky: { stops: DAWN },
        layers: [
          street('street', -.13, .04, 7, { col: '#3a3c5c', car: .03 }),
          room('wall', -.115, [[.035, .085, .05, .06]], { wall: DWALL, floor: DFLOOR }),
          ...inBed(-.04, .09, 'scared', -.09, { stand: true }),
          floorFront(DFLOOR, -.084),
        ],
        glows: { phone: [[0, 1]], street: [[0, 1]] }, flicker: ['phone', 'street'],
        cam: [[0, lv(.38, 0)], [E.dur, lv(.32, .004)]],
        focus: [[0, -.09], [E.dur * .6, -.115]], aper: 12, grade: { expo: 1.35, sat: .9 },
      })) },
  ];
  return shots.map(s => withUI(s, sched, run));
}
