// Lantern Fox kit: motifs drawn on the metric canvas (metres, y up), in the paper-lantern grammar:
// one flat colour per sheet, holes for light, glow drawn on the second canvas (g) in white.
import { mulberry, TAU, lerp } from '../lib.js';

// The vertical lightbox: full-bleed sheets are never larger than this.
export const BOX = { w: .33, h: .58 };
export const FULL = { w: .328, h: .578 };

// —— The fox (the channel's mascot), sitting, side view facing right. Same silhouette as the profile picture. ——
// s = height in metres; cx, by = bottom centre. o.lantern: hold a lantern on a stick (its glow goes to g).
export function fox(x, o, g) {
  const { cx, by, s, flip = false, lantern = false, col = '#e8743b', cream = '#f6e3c8', eye = '#0e1532', detail = true } = o;
  const k = s / 450, f = flip ? -1 : 1;
  const P = (px, py) => [cx + (px - 520) * k * f, by + (875 - py) * k];
  const path = (cmds, fill) => {
    if (!x) return; x.fillStyle = fill; x.beginPath();
    for (const [c, ...v] of cmds) {
      const pts = []; for (let i = 0; i < v.length; i += 2) pts.push(...P(v[i], v[i + 1]));
      if (c === 'M') x.moveTo(...pts); else if (c === 'L') x.lineTo(...pts); else if (c === 'C') x.bezierCurveTo(...pts); else if (c === 'Z') x.closePath();
    }
    x.fill();
  };
  path([['M', 470, 868], ['C', 360, 880, 290, 820, 300, 740], ['C', 305, 700, 335, 678, 365, 690], ['C', 350, 740, 370, 800, 430, 820], ['C', 470, 832, 520, 834, 560, 830], ['Z']], col);
  path([['M', 440, 872], ['C', 405, 790, 425, 660, 510, 615], ['C', 575, 590, 625, 640, 628, 720], ['C', 632, 800, 616, 856, 596, 874], ['Z']], col);
  path([['M', 498, 610], ['C', 486, 568, 500, 528, 528, 508], ['L', 534, 432], ['L', 568, 496], ['C', 584, 492, 598, 494, 610, 500], ['L', 646, 440], ['L', 640, 516],
    ['C', 660, 530, 680, 546, 716, 560], ['C', 706, 578, 674, 594, 640, 604], ['C', 604, 620, 540, 632, 498, 610], ['Z']], col);
  if (detail) {
    path([['M', 300, 740], ['C', 305, 700, 335, 678, 365, 690], ['C', 352, 712, 348, 736, 352, 760], ['C', 330, 760, 312, 752, 300, 740], ['Z']], cream);
    path([['M', 552, 618], ['C', 600, 626, 622, 668, 606, 736], ['C', 594, 700, 572, 660, 538, 636], ['Z']], cream);
    path([['M', 640, 604], ['C', 674, 594, 706, 578, 716, 560], ['C', 690, 576, 660, 584, 628, 586], ['Z']], cream);
    if (x) { x.fillStyle = eye; x.beginPath(); x.arc(...P(714, 560), 8 * k, 0, TAU); x.fill();
      x.beginPath(); x.ellipse(...P(606, 548), 15 * k, 4 * k, 0, 0, TAU); x.fill(); }
  }
  const tip = P(842, 470);
  if (lantern) {
    if (x) { x.strokeStyle = '#1a1410'; x.lineWidth = 11 * k; x.lineCap = 'round'; x.beginPath(); x.moveTo(...P(636, 756)); x.lineTo(...tip); x.stroke();
      path([['M', 616, 750], ['C', 628, 732, 654, 726, 668, 738], ['C', 674, 752, 660, 768, 640, 770], ['C', 626, 770, 614, 762, 616, 750], ['Z']], col); }
    hangLantern(x, { cx: tip[0], cy: tip[1] - 95 * k, r: 52 * k, string: 40 * k }, g);
  }
  return { tip, head: P(600, 520) };
}

// A paper lantern hanging from a point: dark ribs on the sheet, the body itself glows (g).
export function hangLantern(x, o, g) {
  const { cx, cy, r, string = r } = o;
  if (x) {
    x.fillStyle = '#1a1410'; x.fillRect(cx - r * .05, cy + r * 1.1, r * .1, string);
    x.fillRect(cx - r * .6, cy + r * .95, r * 1.2, r * .2); x.fillRect(cx - r * .6, cy - r * 1.15, r * 1.2, r * .2);
    x.fillStyle = '#e8a050'; x.beginPath(); x.ellipse(cx, cy, r * .95, r * 1.08, 0, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(150,70,30,.7)'; x.lineWidth = r * .07;
    for (const q of [-.55, 0, .55]) { x.beginPath(); x.ellipse(cx, cy, Math.max(.0001, r * .95 * Math.abs(q)), r * 1.06, 0, -Math.PI / 2, Math.PI / 2, q < 0); x.stroke(); }
  }
  if (g) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.05); gr.addColorStop(0, '#fff'); gr.addColorStop(.75, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,.25)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, r * .95, r * 1.08, 0, 0, TAU); g.fill(); }
}

// —— Lighthouse: tapered tower, gallery, lamp room (glows), dome; the keeper's cottage at its foot ——
// returns the lamp room centre (for beams and the backlight point)
export function lighthouse(x, o, g) {
  const { cx, by, h, col = '#0e1532', cottage = true, lamp = true } = o;
  const w0 = h * .26, w1 = h * .17, top = by + h * .78;
  if (x) {
    x.fillStyle = col;
    x.beginPath(); x.moveTo(cx - w0 / 2, by); x.lineTo(cx - w1 / 2, top); x.lineTo(cx + w1 / 2, top); x.lineTo(cx + w0 / 2, by); x.closePath(); x.fill();
    x.fillRect(cx - w1 * .72, top, w1 * 1.44, h * .025);                       // gallery
    for (let i = 0; i < 7; i++) x.fillRect(cx - w1 * .68 + i * w1 * .225, top + h * .025, h * .004, h * .03);   // railing
    x.fillRect(cx - w1 * .7, top + h * .055, w1 * 1.4, h * .006);
    x.fillRect(cx - w1 * .42, top + h * .025, w1 * .84, h * .012);              // lamp-room sill
    x.beginPath(); x.moveTo(cx - w1 * .5, top + h * .135); x.quadraticCurveTo(cx, top + h * .23, cx + w1 * .5, top + h * .135); x.closePath(); x.fill();   // dome
    x.fillRect(cx - h * .003, top + h * .2, h * .006, h * .035);               // finial
    // window slits up the tower (holes)
    x.fillStyle = '#2c2a44';   // window slits: dark glass (a hole would also cut away the glow)
    for (const u of [.25, .5]) x.fillRect(cx - h * .012, by + h * u * .78, h * .024, h * .05);
    x.fillStyle = col;
    if (cottage) {
      const cw = h * .34, ch = h * .14, hx = cx + w0 * .35;
      x.fillRect(hx, by, cw, ch);
      x.beginPath(); x.moveTo(hx - cw * .06, by + ch); x.lineTo(hx + cw * .5, by + ch + h * .09); x.lineTo(hx + cw * 1.06, by + ch); x.closePath(); x.fill();
      x.fillRect(hx + cw * .7, by + ch + h * .02, h * .02, h * .07);            // chimney
      x.fillStyle = '#2c2a44'; x.fillRect(hx + cw * .18, by + ch * .35, cw * .2, ch * .38); x.fillStyle = col;
    }
  }
  const lampC = [cx, top + h * .095];
  if (g && o.cottageLit) { g.fillStyle = '#fff'; g.fillRect(cx + w0 * .35 + h * .34 * .18, by + h * .14 * .35, h * .34 * .2, h * .14 * .38); }
  if (g && lamp) { const gr = g.createRadialGradient(lampC[0], lampC[1], 0, lampC[0], lampC[1], w1 * .55);
    gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,.55)'); g.fillStyle = gr; g.fillRect(cx - w1 * .4, top + h * .057, w1 * .8, h * .075); }
  if (x) {   // the lamp room glass is dark paper; the emissive map makes it burn when the lamp is on
    x.fillStyle = '#3a3040'; x.fillRect(cx - w1 * .4, top + h * .057, w1 * .8, h * .075);
    x.fillStyle = col; for (const u of [-.14, .14]) x.fillRect(cx + w1 * u - h * .002, top + h * .057, h * .004, h * .075);
  }
  return { lamp: lampC, cottageWin: [cx + w0 * .35 + h * .34 * .28, by + h * .14 * .54] };
}

// Cliff: a headland rising from the sea toward one side. side = -1 (rising to the left) or 1
export function cliff(x, o) {
  const { x0, x1, base, top, side = -1, seed = 3, bottom = base - 1 } = o, R = mulberry(seed);
  x.beginPath(); x.moveTo(x0, bottom);
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const u = i / n, px = lerp(x0, x1, u), k = side < 0 ? 1 - u : u;
    const rise = Math.pow(Math.min(1, k * 1.6), .55) * (k > .62 ? 1 : 1);
    x.lineTo(px, base + (top - base) * rise + (R() - .5) * .002 * (1 + 2 * (1 - rise)));
  }
  x.lineTo(x1, bottom); x.closePath(); x.fill();
}

// Rolling dunes: soft ridges with a few grass tufts
export function dunes(x, o) {
  const { x0, x1, base, amp = .012, seed = 2, freq = 9, grass = 0 } = o;
  x.beginPath(); x.moveTo(x0, base - 1);
  const R = mulberry(seed), ph = R() * 9;
  for (let u = x0; u <= x1 + .002; u += .002) x.lineTo(u, base + amp * (.7 * Math.sin(u * freq + ph) + .3 * Math.sin(u * freq * 2.7 + ph * 2)));
  x.lineTo(x1, base - 1); x.closePath(); x.fill();
  x.lineCap = 'round';
  for (let i = 0; i < grass; i++) {
    const px = lerp(x0, x1, R()), py = base + amp * (.7 * Math.sin(px * freq + ph) + .3 * Math.sin(px * freq * 2.7 + ph * 2)) - .001;
    for (let j = 0; j < 5; j++) { const a = -.5 + j * .25 + (R() - .5) * .2, l = .01 + R() * .012; x.lineWidth = .0012; x.strokeStyle = x.fillStyle;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.sin(a) * l * .3, py + l * .6, px + Math.sin(a) * l, py + l); x.stroke(); }
  }
}

// Rain: slanted paper slivers over the whole sheet (scroll the sheet down to animate)
export function rain(x, o) {
  const { w, h, n = 260, seed = 4, slant = .18, len = .02 } = o, R = mulberry(seed);
  x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const px = (R() - .5) * w, py = (R() - .5) * h, l = len * (.5 + R());
    x.lineWidth = .0006 + R() * .0007; x.beginPath(); x.moveTo(px, py); x.lineTo(px - slant * l, py - l); x.stroke();
  }
}

// A small sailing boat silhouette
export function boat(x, o) {
  const { cx, by, s } = o;
  x.beginPath(); x.moveTo(cx - s * .5, by + s * .12); x.lineTo(cx + s * .5, by + s * .12); x.lineTo(cx + s * .36, by); x.lineTo(cx - s * .36, by); x.closePath(); x.fill();
  x.fillRect(cx - s * .01, by + s * .12, s * .02, s * .7);
  x.beginPath(); x.moveTo(cx + s * .02, by + s * .8); x.lineTo(cx + s * .38, by + s * .2); x.lineTo(cx + s * .02, by + s * .2); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(cx - s * .02, by + s * .7); x.lineTo(cx - s * .3, by + s * .22); x.lineTo(cx - s * .02, by + s * .22); x.closePath(); x.fill();
}

// The old keeper, seated, side view facing right: cap, beard, stoop. s = seated height.
export function keeper(x, o) {
  const { cx, by, s, col = '#1a1020' } = o;
  x.fillStyle = col;
  // chair
  x.fillRect(cx - s * .32, by, s * .04, s * .62); x.fillRect(cx - s * .3, by + s * .3, s * .5, s * .05); x.fillRect(cx + s * .14, by, s * .04, s * .3);
  // body (stooped), legs
  x.beginPath(); x.moveTo(cx - s * .26, by + s * .34); x.quadraticCurveTo(cx - s * .3, by + s * .72, cx - s * .02, by + s * .8);
  x.quadraticCurveTo(cx + s * .12, by + s * .74, cx + s * .1, by + s * .5); x.lineTo(cx + s * .38, by + s * .42); x.lineTo(cx + s * .4, by + s * .3); x.lineTo(cx - s * .26, by + s * .3); x.closePath(); x.fill();
  x.fillRect(cx + s * .3, by, s * .08, s * .4); x.fillRect(cx + s * .3, by, s * .16, s * .04);
  // head, cap, beard
  x.beginPath(); x.arc(cx + s * .04, by + s * .88, s * .1, 0, TAU); x.fill();
  x.beginPath(); x.moveTo(cx - s * .07, by + s * .92); x.quadraticCurveTo(cx + s * .04, by + s * 1.04, cx + s * .15, by + s * .93); x.lineTo(cx + s * .22, by + s * .92); x.lineTo(cx - s * .07, by + s * .9); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(cx + s * .06, by + s * .84); x.quadraticCurveTo(cx + s * .16, by + s * .74, cx + s * .1, by + s * .66); x.quadraticCurveTo(cx + s * .04, by + s * .74, cx + s * .02, by + s * .82); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(cx + s * .13, by + s * .88); x.lineTo(cx + s * .17, by + s * .85); x.lineTo(cx + s * .13, by + s * .84); x.closePath(); x.fill();
  // arm resting on the knee
  x.beginPath(); x.moveTo(cx - s * .04, by + s * .66); x.quadraticCurveTo(cx + s * .12, by + s * .5, cx + s * .3, by + s * .46); x.lineTo(cx + s * .3, by + s * .41); x.quadraticCurveTo(cx + s * .1, by + s * .44, cx - s * .1, by + s * .6); x.closePath(); x.fill();
}

// Switchback stairs seen in section: flights going right, then left, then right… as one cut sheet.
// flights × fh = total height; returns at(u) → [x, y, dir] for something climbing them (u: 0 bottom → 1 top)
export function stairs(x, o) {
  const { cx = 0, y0, flights = 4, fh = .1, w = .2, steps = 9, thick = .012, col } = o;
  if (x) {
    if (col) x.fillStyle = col;
    for (let i = 0; i < flights; i++) {
      const d = i % 2 ? -1 : 1, xs = cx - d * w / 2, yb = y0 + i * fh, sw = w / steps, sh = fh / steps;
      x.beginPath(); x.moveTo(xs, yb);
      for (let k = 0; k < steps; k++) { x.lineTo(xs + d * k * sw, yb + (k + 1) * sh); x.lineTo(xs + d * (k + 1) * sw, yb + (k + 1) * sh); }
      x.lineTo(xs + d * w, yb + fh - thick * 2.2); x.lineTo(xs, yb - thick); x.closePath(); x.fill();
      x.fillRect(xs + d * w - (d > 0 ? 0 : .02), yb + fh - thick * .4, .02, thick * .6);   // landing
    }
    x.fillRect(cx - w / 2 - .012, y0 - .5, .012, flights * fh + .5); x.fillRect(cx + w / 2, y0 - .5, .012, flights * fh + .5);   // side walls
  }
  return u => { const t = Math.min(.9999, Math.max(0, u)) * flights, i = Math.floor(t), v = t - i, d = i % 2 ? -1 : 1;
    return [cx - d * w / 2 + d * w * v, y0 + i * fh + v * fh, d]; };
}

// Round window in a wall (a hole) with mullions; its glow drawn into g
export function window_(x, o, g) {
  const { cx, cy, r, bars = true, col } = o;
  if (x) { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.restore();
    if (bars) { x.fillStyle = col || '#1a1020'; x.fillRect(cx - r, cy - r * .03, r * 2, r * .06); x.fillRect(cx - r * .03, cy - r, r * .06, r * 2); } }
  if (g) { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
}
