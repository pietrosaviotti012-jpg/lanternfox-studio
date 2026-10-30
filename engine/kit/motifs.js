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
  const w0 = h * .26, w1 = h * .17, top = by + h * .78, cw = h * .34, hx = cx + w0 * .35;
  if (x) {
    x.fillStyle = col;
    // footing: a rocky knoll under tower and cottage, reaching down into the ground below so the building never floats
    const fd = o.footing ?? h * .5;
    if (fd) {
      const R = mulberry(17), xl = cx - w0 * .85, xr = cottage ? hx + cw * 1.08 : cx + w0 * .85;
      x.beginPath(); x.moveTo(xl, by + h * .004);
      for (let i = 1; i <= 6; i++) x.lineTo(xl - fd * .38 * i / 6 + (R() - .5) * fd * .05, by + h * .004 - fd * i / 6);
      x.lineTo(xr + fd * .38, by - fd);
      for (let i = 5; i >= 0; i--) x.lineTo(xr + fd * .38 * i / 6 + (R() - .5) * fd * .05, by + h * .004 - fd * i / 6);
      x.closePath(); x.fill();
    }
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
      const ch = h * .14;
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

// Rain that tiles: the same drops repeat every tw × th, so a sheet of w = 3·tw, h = 3·th can be slid by up to one tile
// (down and along the slant) and wrapped, and the frame is always full of rain. Use with rainFall() in update.
export function rainTile(x, o) {
  const { tw = .165, th = .29, n = 50, seed = 4, slant = .18, len = .02 } = o, R = mulberry(seed);
  x.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const u = R() * tw, v = R() * th, l = len * (.5 + R()), lw = .0006 + R() * .0007;
    for (let X = -tw * 2.5; X < tw * 2.5; X += tw) for (let Y = -th * 2.5; Y < th * 2.5; Y += th) {
      x.lineWidth = lw; x.beginPath(); x.moveTo(X + u, Y + v); x.lineTo(X + u - slant * l, Y + v - l); x.stroke();
    }
  }
}
// Slides a rainTile sheet (placed at x: tw·.6, y: th/2) down and along the slant, wrapping every tile: call from update(t, L)
export function rainFall(m, t, { vy = .55, slant = .18, tw = .165, th = .29 } = {}) {
  m.position.x = m.userData.p0.x - ((vy * slant * t) % tw); m.position.y = m.userData.p0.y - ((vy * t) % th);
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
  const { cx = 0, y0, flights = 4, fh = .1, w = .2, steps = 9, thick = .012, col, roof = 0 } = o;
  if (x) {
    if (col) x.fillStyle = col;
    for (let i = 0; i < flights; i++) {
      const d = i % 2 ? -1 : 1, xs = cx - d * w / 2, yb = y0 + i * fh, sw = w / steps, sh = fh / steps;
      x.beginPath(); x.moveTo(xs, yb);
      for (let k = 0; k < steps; k++) { x.lineTo(xs + d * k * sw, yb + (k + 1) * sh); x.lineTo(xs + d * (k + 1) * sw, yb + (k + 1) * sh); }
      x.lineTo(xs + d * w, yb + fh - thick * 2.2); x.lineTo(xs, yb - thick); x.closePath(); x.fill();
      x.fillRect(xs + d * w - (d > 0 ? 0 : .02), yb + fh - thick * .4, .02, thick * .6);   // landing
    }
    // o.roof = headroom above the top landing: a ceiling slab with joists and a hatch (a ladder goes up through it) over the last step
    const top = y0 + flights * fh, wallTop = roof ? top + roof + .5 : top;
    x.fillRect(cx - w / 2 - .012, y0 - .5, .012, wallTop - y0 + .5); x.fillRect(cx + w / 2, y0 - .5, .012, wallTop - y0 + .5);   // side walls
    if (roof) {
      const ry = top + roof, d = (flights - 1) % 2 ? -1 : 1, ex = cx + d * w / 2, hw = .045, slab = .022;
      const hatch = d > 0 ? [ex - hw - .012, ex - .012] : [ex + .012, ex + hw + .012];
      x.fillRect(cx - w / 2 - .012, ry, hatch[0] - (cx - w / 2 - .012), slab); x.fillRect(hatch[1], ry, cx + w / 2 + .012 - hatch[1], slab);
      x.fillRect(cx - w / 2 - .012, ry + slab, w + .024, .006);                                               // floor boards of the room above
      for (let i = 0; i < 7; i++) { const jx = cx - w / 2 + (i + .5) * w / 7; if (jx < hatch[0] - .004 || jx > hatch[1] + .004) x.fillRect(jx - .004, ry - .008, .008, .008); }   // joists
      for (const s of [hatch[0] + .008, hatch[1] - .011]) x.fillRect(s, top - .002, .003, ry + slab + .02 - top);   // ladder rails
      for (let yy = top + .012; yy < ry + slab + .015; yy += .014) x.fillRect(hatch[0] + .008, yy, hatch[1] - hatch[0] - .016, .0025);   // rungs
    }
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

// —— Added after the first episode's review: richer cliffs, a moon trail, a foreground that is never a flat slab ——

// Cliff with carved strata and grass tufts on its rim (same shape as cliff()); strata in a slightly lighter tone
export function cliffRich(x, o) {
  const { x0, x1, base, top, side = -1, seed = 3, strata = '#26356a', grass = 18 } = o, R = mulberry(seed + 50);
  const col = x.fillStyle;
  cliff(x, o);
  x.save(); x.globalCompositeOperation = 'source-atop'; x.strokeStyle = strata; x.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const y = top - .012 - i * (top - base) * .1 - R() * .006;
    x.lineWidth = .0012 + R() * .0012; x.beginPath();
    for (let u = x0; u <= x1; u += .004) x.lineTo(u, y + Math.sin(u * 40 + i * 1.7) * .0018 + (side > 0 ? (u - x0) : (x1 - u)) * .04);
    x.stroke();
  }
  x.restore();
  // grass on the rim
  x.fillStyle = col; x.strokeStyle = col; x.lineCap = 'round';
  for (let i = 0; i < grass; i++) {
    const u = R(), px = lerp(x0, x1, u), k = side < 0 ? 1 - u : u, rise = Math.pow(Math.min(1, k * 1.6), .55), py = base + (top - base) * rise;
    if (rise < .35) continue;
    for (let j = 0; j < 5; j++) { const a = -.6 + j * .3 + (R() - .5) * .3, l = .006 + R() * .01; x.lineWidth = .0011;
      x.beginPath(); x.moveTo(px, py - .001); x.quadraticCurveTo(px + Math.sin(a) * l * .4, py + l * .6, px + Math.sin(a) * l, py + l); x.stroke(); }
  }
}

// Moon trail on the water: broken ellipses under the moon; draw it in the paper colour on x and in white on g (it glows)
export function moonTrail(x, o) {
  const { cx, top, n = 26, w = .018, col = '#c9b48a', seed = 21 } = o, R = mulberry(seed);
  x.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const y = top - i * .0024 - R() * .001, ww = (w - i * w / n * .6) * (.25 + R() * .9), c = cx + (R() - .5) * .012;
    x.beginPath(); x.ellipse(c, y, ww / 2, .00035 + R() * .00045, 0, 0, TAU); x.fill();
  }
}

// Foreground bank: a low ridge with stones and reeds, so the bottom of the frame always has texture
export function foreground(x, o) {
  const { x0 = -.25, x1 = .25, base, amp = .008, seed = 3, stones = 7, reedsN = 30, reedsAt = [-.2, -.05] } = o, R = mulberry(seed);
  const col = x.fillStyle;
  x.beginPath(); x.moveTo(x0, base - 1);
  for (let u = x0; u <= x1 + .002; u += .002) x.lineTo(u, base + amp * (Math.sin(u * 18 + seed) * .6 + Math.sin(u * 47 + seed * 2) * .25));
  x.lineTo(x1, base - 1); x.closePath(); x.fill();
  for (let i = 0; i < stones; i++) {
    const px = lerp(x0, x1, R()), r = .006 + R() * .012;
    x.beginPath(); x.ellipse(px, base + r * .35, r * 1.3, r * .8, (R() - .5) * .4, 0, TAU); x.fill();
  }
  x.strokeStyle = col; x.lineCap = 'round';
  for (let i = 0; i < reedsN; i++) {
    const px = lerp(reedsAt[0], reedsAt[1], R()), hh = .03 + R() * .045, lean = (R() - .5) * .25;
    x.lineWidth = .0011 + R() * .0006; x.beginPath(); x.moveTo(px, base - .002);
    x.quadraticCurveTo(px + lean * hh * .3, base + hh * .6, px + lean * hh, base + hh); x.stroke();
    if (R() < .4) { x.beginPath(); x.ellipse(px + lean * hh, base + hh + .004, .0016, .006, lean, 0, TAU); x.fill(); }
  }
}

// —— Added for "What If Every Star Went Out Tonight?": stars as pinholes of light, a village of cottages ——

// One star: a round pinhole with four thin points (cut paper on x in a dark tone, so it disappears when its glow is off; white on g)
export function star(x, o, g) {
  const { cx, cy, r, col = '#22305a', rays = 2.6 } = o;
  const shape = (c, fill) => {
    c.fillStyle = fill; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
    if (r < .0016) return;
    c.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, l = i % 2 ? r * .55 : r * rays; c.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); }
    c.closePath(); c.fill();
  };
  if (x) shape(x, col);
  if (g) shape(g, '#fff');
}

// A field of stars over a w × h sheet, between minY and maxY; n stars, sizes r0..r1 (few big, many small)
export function starField(x, o, g) {
  const { w = .33, h = .58, n = 90, seed = 7, minY = -1, maxY = 1, r0 = .0009, r1 = .0034, col } = o, R = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const cx = (R() - .5) * w, cy = (R() - .5) * h, r = r0 + R() * R() * R() * (r1 - r0);
    if (cy < minY || cy > maxY) continue;
    star(x, { cx, cy, r, col }, g);
  }
}

// A cottage: walls, pitched roof, chimney, one window (warm paper whose glow goes to g); bx, by = bottom centre, s = width
export function cottage(x, o, g) {
  const { cx, by, s, col = '#0e1532', lit = true, roof = .75 } = o, h = s * .62;
  if (x) {
    x.fillStyle = col; x.fillRect(cx - s / 2, by, s, h);
    x.beginPath(); x.moveTo(cx - s * .6, by + h); x.lineTo(cx, by + h + s * roof * .5); x.lineTo(cx + s * .6, by + h); x.closePath(); x.fill();
    x.fillRect(cx + s * .22, by + h + s * .05, s * .12, s * .3);
    if (lit) { x.fillStyle = '#f0b060'; x.fillRect(cx - s * .14, by + h * .4, s * .28, h * .34);
      x.fillStyle = col; x.fillRect(cx - s * .008, by + h * .4, s * .016, h * .34); }
  }
  if (g && lit) { g.fillStyle = '#fff'; g.fillRect(cx - s * .14, by + h * .4, s * .28, h * .34); }
}

// —— Added for Lantern Night (Your Call): a town that can go dark, neighbours with lanterns, a forest edge, a phone, a door ——

// A house: walls, gable roof, chimney, a door; windows are dark glass on the sheet and burn in g when lit.
// o.lit: true (all), false, or an array of window indices. Returns the window centres [[x, y], …].
export function house(x, o, g) {
  const { cx, by, w, h, roof = h * .55, cols = 2, rows = 2, col = '#0e1532', glass = '#2c2a44', chimney = .7, door = true, lit = true } = o;
  const ww = w * .16, wh = h * .22, wins = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (door && r === 0 && c === Math.floor(cols / 2) && cols % 2) continue;   // the door takes the middle of the ground floor
    wins.push([cx - w / 2 + w * (c + .5) / cols, by + h * (r + .55) / rows]);
  }
  if (x) {
    x.fillStyle = col; x.fillRect(cx - w / 2, by, w, h);
    x.beginPath(); x.moveTo(cx - w * .56, by + h); x.lineTo(cx, by + h + roof); x.lineTo(cx + w * .56, by + h); x.closePath(); x.fill();
    if (chimney) x.fillRect(cx + w * (chimney - .5) * .8, by + h + roof * .35, w * .09, roof * .55);
    x.fillStyle = glass; for (const [px, py] of wins) x.fillRect(px - ww / 2, py - wh / 2, ww, wh);
    x.fillStyle = col; for (const [px, py] of wins) { x.fillRect(px - ww / 2, py - h * .006, ww, h * .012); x.fillRect(px - w * .006, py - wh / 2, w * .012, wh); }
    if (door) { x.fillStyle = glass; x.fillRect(cx - w * .08, by, w * .16, h * .38); x.fillStyle = col; x.fillRect(cx - w * .1, by + h * .38, w * .2, h * .025); }
  }
  if (g) { g.fillStyle = '#fff'; wins.forEach(([px, py], i) => { if (lit === true || (Array.isArray(lit) && lit.includes(i))) g.fillRect(px - ww / 2, py - wh / 2, ww, wh); }); }
  return wins;
}

// A row of houses of varied size along a street (seeded). Same o as house() for colours; returns all window centres.
export function houses(x, o, g) {
  const { x0, x1, by, h = .05, seed = 5, gapK = .12 } = o, R = mulberry(seed), out = [];
  let px = x0;
  while (px < x1) {
    const w = h * (1.1 + R() * .8), hh = h * (.8 + R() * .5);
    out.push(...house(x, { ...o, cx: px + w / 2, by, w, h: hh, roof: hh * (.4 + R() * .3), cols: R() < .5 ? 2 : 3, rows: R() < .7 ? 2 : 1, chimney: R() < .7 ? .3 + R() * .5 : 0 }, g));
    px += w * (1 + gapK + R() * .1);
  }
  return out;
}

// A street lamp: post, arm, hood; the lamp glows in g
export function streetlamp(x, o, g) {
  const { cx, by, h, col = '#0e1532', dir = 1 } = o, lw = h * .03, ax = cx + dir * h * .16, ay = by + h * .97;
  if (x) {
    x.fillStyle = col; x.fillRect(cx - lw / 2, by, lw, h); x.fillRect(cx - lw * 1.6, by, lw * 3.2, h * .05);
    x.fillRect(Math.min(cx, ax), by + h - lw, Math.abs(ax - cx), lw);
    x.beginPath(); x.moveTo(ax - h * .06, ay - h * .04); x.lineTo(ax - h * .035, ay + h * .01); x.lineTo(ax + h * .035, ay + h * .01); x.lineTo(ax + h * .06, ay - h * .04); x.closePath(); x.fill();
    x.fillStyle = '#3a3040'; x.fillRect(ax - h * .045, ay - h * .075, h * .09, h * .035);
  }
  if (g) { const gr = g.createRadialGradient(ax, ay - h * .06, 0, ax, ay - h * .06, h * .07); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,.4)'); g.fillStyle = gr; g.fillRect(ax - h * .045, ay - h * .075, h * .09, h * .035); }
  return [ax, ay - h * .06];
}

// A standing person, seen from the front (or from behind: back = true). o.lantern: 'left' | 'right' | false, a paper lantern
// hanging from the hand (glows in g); o.smile: a thin crescent cut in the face that catches the lantern light (glows in g).
export function neighbor(x, o, g) {
  const { cx, by, s, col = '#0b0f1e', lantern = 'right', smile = false, back = false, hat = false } = o;
  const hy = by + s * .87, hr = s * .075;
  if (x) {
    x.fillStyle = col;
    x.beginPath(); x.arc(cx, hy, hr, 0, TAU); x.fill();
    if (hat) { x.fillRect(cx - hr * 1.6, hy + hr * .55, hr * 3.2, s * .015); x.fillRect(cx - hr * .9, hy + hr * .55, hr * 1.8, hr * .9); }
    x.fillRect(cx - s * .025, hy - hr * 1.3, s * .05, hr * .5);                                                      // neck
    x.beginPath(); x.moveTo(cx - s * .11, by + s * .73); x.quadraticCurveTo(cx - s * .13, by + s * .5, cx - s * .14, by + s * .3);   // coat
    x.lineTo(cx + s * .14, by + s * .3); x.quadraticCurveTo(cx + s * .13, by + s * .5, cx + s * .11, by + s * .73);
    x.quadraticCurveTo(cx, by + s * .79, cx - s * .11, by + s * .73); x.closePath(); x.fill();
    x.fillRect(cx - s * .085, by, s * .06, s * .32); x.fillRect(cx + s * .025, by, s * .06, s * .32);              // legs
    x.fillRect(cx - s * .1, by, s * .08, s * .02); x.fillRect(cx + s * .02, by, s * .08, s * .02);
    for (const d of [-1, 1]) { x.beginPath(); x.moveTo(cx + d * s * .1, by + s * .72); x.quadraticCurveTo(cx + d * s * .16, by + s * .6, cx + d * s * .155, by + s * .43);   // arms
      x.lineTo(cx + d * s * .12, by + s * .43); x.quadraticCurveTo(cx + d * s * .12, by + s * .58, cx + d * s * .08, by + s * .68); x.closePath(); x.fill(); }
  }
  let lan = null;
  if (lantern) { const d = lantern === 'left' ? -1 : 1, r = s * .055; lan = [cx + d * s * .14, by + s * .43 - r * 1.1 - r * .6];
    hangLantern(x, { cx: lan[0], cy: lan[1], r, string: r * .6 }, g); }
  if (smile && !back) {
    const arc = (c, lw) => { c.strokeStyle = c === g ? '#fff' : '#c9a46a'; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.arc(cx, hy + hr * .25, hr * .55, Math.PI * 1.18, Math.PI * 1.82); c.stroke(); };
    if (x) arc(x, hr * .14); if (g) arc(g, hr * .16);
  }
  return { head: [cx, hy], lantern: lan };
}

// A forest edge: a row of pines (triangle tiers), seeded heights
export function pines(x, o) {
  const { x0, x1, base, h = .06, n = 14, seed = 9 } = o, R = mulberry(seed);
  x.beginPath(); x.rect(x0, base - 1, x1 - x0, 1 + h * .1); x.fill();
  for (let i = 0; i < n; i++) {
    const px = lerp(x0, x1, (i + R() * .8) / n), ph = h * (.6 + R() * .6), pw = ph * (.28 + R() * .1);
    x.fillRect(px - ph * .02, base, ph * .04, ph * .2);
    for (let k = 0; k < 3; k++) { const ty = base + ph * (.12 + k * .26), tw = pw * (1 - k * .25);
      x.beginPath(); x.moveTo(px - tw, ty); x.lineTo(px, ty + ph * (.5 - k * .08)); x.lineTo(px + tw, ty); x.closePath(); x.fill(); }
  }
}

// A phone lying on a nightstand, seen from the front, tilted up: body, screen (dark paper, burns in g when on)
export function phone(x, o, g) {
  const { cx, cy, w, h, col = '#0b0f1e', screen = '#3a3550' } = o, m = w * .06;
  const rr = (c, x0, y0, ww, hh, r) => { c.beginPath(); c.moveTo(x0 + r, y0); c.arcTo(x0 + ww, y0, x0 + ww, y0 + hh, r); c.arcTo(x0 + ww, y0 + hh, x0, y0 + hh, r); c.arcTo(x0, y0 + hh, x0, y0, r); c.arcTo(x0, y0, x0 + ww, y0, r); c.closePath(); c.fill(); };
  if (x) { x.fillStyle = col; rr(x, cx - w / 2, cy - h / 2, w, h, w * .14); x.fillStyle = screen; rr(x, cx - w / 2 + m, cy - h / 2 + m * 1.4, w - 2 * m, h - 2.8 * m, w * .08);
    x.fillStyle = col; x.fillRect(cx - w * .12, cy + h / 2 - m * .95, w * .24, m * .35); }
  if (g) { g.fillStyle = '#fff'; rr(g, cx - w / 2 + m, cy - h / 2 + m * 1.4, w - 2 * m, h - 2.8 * m, w * .08); }
}

// A door frame in a wall (the dark opening behind the leaf); the leaf is its own sheet so it can swing
export function doorFrame(x, o) {
  const { cx, by, w, h, col } = o;
  if (col) x.fillStyle = col;
  x.fillRect(cx - w / 2 - w * .08, by, w * .08, h + w * .08); x.fillRect(cx + w / 2, by, w * .08, h + w * .08); x.fillRect(cx - w / 2 - w * .08, by + h, w * 1.16, w * .08);
}

// —— Added for "The Flannan Isles Keepers" (True Mysteries): a wall clock, oilskins on a peg, a flagpole, a railing that bends, a lamp lens ——

// A round wall clock: case, face (cream paper), hour marks, two hands at h:m. The face can glow in g (moonlight on it).
export function wallClock(x, o, g) {
  const { cx, cy, r, h = 3, m = 0, col = '#1a1410', face = '#e9d6ae', ink = '#2a2020', hands = true } = o;   // hands: false → draw them as clockHand sheets
  if (x) {
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r * 1.14, 0, TAU); x.fill();
    x.fillRect(cx - r * .08, cy + r * 1.1, r * .16, r * .25);                                   // hook
    x.fillStyle = face; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.fillStyle = ink;
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12, l = i % 3 ? r * .08 : r * .16, w = i % 3 ? r * .03 : r * .055;
      x.save(); x.translate(cx + Math.sin(a) * r * .84, cy + Math.cos(a) * r * .84); x.rotate(-a); x.fillRect(-w / 2, -l / 2, w, l); x.restore(); }
    const hand = (a, l, w) => { x.save(); x.translate(cx, cy); x.rotate(-a); x.beginPath(); x.moveTo(-w / 2, -l * .15); x.lineTo(-w * .3, l); x.lineTo(w * .3, l); x.lineTo(w / 2, -l * .15); x.closePath(); x.fill(); x.restore(); };
    if (hands) { hand((h % 12 + m / 60) * TAU / 12, r * .5, r * .075); hand(m * TAU / 60, r * .78, r * .05);
      x.beginPath(); x.arc(cx, cy, r * .06, 0, TAU); x.fill(); }
  }
  if (g) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); }
}

// Oilskins (a long fisherman's coat with a hood) hanging from a peg; cx, top = the peg. Two empty pegs with peg(x, …).
export function oilskin(x, o) {
  const { cx, top, s, col = '#e8743b', fold = '#b9552a' } = o;
  x.fillStyle = '#1a1410'; x.fillRect(cx - s * .03, top - s * .01, s * .06, s * .05);            // the peg
  x.fillStyle = col;
  x.beginPath(); x.moveTo(cx, top - s * .02);
  x.quadraticCurveTo(cx - s * .14, top - s * .02, cx - s * .2, top - s * .2);                     // hood and shoulder
  x.lineTo(cx - s * .26, top - s * .95); x.quadraticCurveTo(cx, top - s * 1.0, cx + s * .26, top - s * .95);
  x.lineTo(cx + s * .2, top - s * .2); x.quadraticCurveTo(cx + s * .14, top - s * .02, cx, top - s * .02); x.closePath(); x.fill();
  x.fillStyle = fold;                                                                               // folds and the front seam
  x.fillRect(cx - s * .008, top - s * .2, s * .016, s * .76);
  for (const u of [-.13, .12]) { x.beginPath(); x.moveTo(cx + u * s, top - s * .3); x.lineTo(cx + u * s * 1.5 - s * .01, top - s * .94); x.lineTo(cx + u * s * 1.5 + s * .01, top - s * .94); x.closePath(); x.fill(); }
  x.beginPath(); x.ellipse(cx, top - s * .12, s * .1, s * .07, 0, 0, TAU); x.fill();                // hood opening
}
export function peg(x, o) { const { cx, top, s, col = '#1a1410' } = o; x.fillStyle = col; x.fillRect(cx - s * .03, top - s * .01, s * .06, s * .05); x.fillRect(cx - s * .012, top + s * .02, s * .024, s * .03); }

// A flagpole with a yard arm and halyard; flag: false (empty, the point of the shot) or a colour
export function flagpole(x, o) {
  const { cx, by, h, col = '#0e1532', flag = false } = o;
  x.fillStyle = col; x.fillRect(cx - h * .008, by, h * .016, h); x.fillRect(cx - h * .1, by + h * .82, h * .2, h * .01);
  x.beginPath(); x.arc(cx, by + h, h * .016, 0, TAU); x.fill();
  x.strokeStyle = col; x.lineWidth = h * .003; x.beginPath(); x.moveTo(cx + h * .012, by + h * .99); x.lineTo(cx + h * .012, by + h * .1); x.stroke();
  if (flag) { x.fillStyle = flag; x.fillRect(cx + h * .012, by + h * .75, h * .22, h * .14); }
}

// An iron railing along a path; bend 0 → straight, 1 → the posts bent flat toward +x by the sea (seeded unevenness)
export function railing(x, o) {
  const { x0, x1, by, h, n = 8, bend = 0, seed = 5, col = '#0e1532' } = o, R = mulberry(seed);
  x.strokeStyle = col; x.lineCap = 'round'; x.lineWidth = h * .07;
  const tops = [];
  for (let i = 0; i < n; i++) {
    const px = lerp(x0, x1, i / (n - 1)), b = bend * (.55 + R() * .45), a = b * 1.35;
    const tx = px + Math.sin(a) * h, ty = by + Math.cos(a) * h;
    x.beginPath(); x.moveTo(px, by); x.quadraticCurveTo(px + Math.sin(a) * h * .25, by + h * .5 * Math.cos(a * .5), tx, ty); x.stroke();
    tops.push([tx, ty]);
  }
  x.lineWidth = h * .055; x.beginPath(); tops.forEach(([tx, ty], i) => i ? x.lineTo(tx, ty + (R() - .5) * h * .1 * bend) : x.moveTo(tx, ty)); x.stroke();
}

// The lighthouse lamp seen up close: a beehive lens of glass rings on a brass pedestal; the rings burn in g
export function lensLamp(x, o, g) {
  const { cx, by, s, col = '#1a1410', glass = '#3a3040' } = o, rings = 7, top = by + s * .3;
  if (x) {
    x.fillStyle = col; x.fillRect(cx - s * .16, by, s * .32, s * .05); x.fillRect(cx - s * .07, by + s * .05, s * .14, s * .25);
    x.fillRect(cx - s * .2, top - s * .02, s * .4, s * .03);
  }
  for (let i = 0; i < rings; i++) {
    const y = top + i * s * .085, w = s * (.36 - Math.abs(i - 3) * .03), hh = s * .07;
    if (x) { x.fillStyle = glass; x.fillRect(cx - w / 2, y + s * .008, w, hh); x.fillStyle = col; x.fillRect(cx - w / 2, y, w, s * .008); }
    if (g) { g.fillStyle = i === 3 ? '#fff' : 'rgba(255,255,255,.7)'; g.fillRect(cx - w / 2, y + s * .008, w, hh); }
  }
  if (x) { x.fillStyle = col; x.beginPath(); x.moveTo(cx - s * .16, top + rings * s * .085); x.quadraticCurveTo(cx, top + rings * s * .085 + s * .12, cx + s * .16, top + rings * s * .085); x.closePath(); x.fill(); }
}

// —— Added for "What If Every Clock Stopped at the Same Second?": clock hands as their own sheets, a clock tower, a satellite,
// a phone mast, a paper street map with the blue dot, a plane, a kitchen oven with its clock ——

// One clock hand on its own small sheet, pivot at the sheet centre (0, 0), pointing up (12 o'clock) at rotation 0.
// Turn it clockwise with sheet.rotation.z = −angle. l = length, w = width at the pivot, tail = the short end behind the pivot.
export function clockHand(x, o) {
  const { l, w, tail = .18, col = '#1a1410', hub = true } = o;
  x.fillStyle = col; x.beginPath(); x.moveTo(-w / 2, -l * tail); x.lineTo(-w * .22, l); x.lineTo(w * .22, l); x.lineTo(w / 2, -l * tail); x.closePath(); x.fill();
  if (hub) { x.beginPath(); x.arc(0, 0, w * .75, 0, TAU); x.fill(); }
}

// A town clock tower: shaft, belfry ledge, clock face near the top (cream paper that burns in g), pointed roof with a finial.
// cx, by = bottom centre; w, h = shaft size. Draw the hands with clockHand sheets at the returned face { cx, cy, r }.
export function clockTower(x, o, g) {
  const { cx, by, w, h, col = '#0e1532', face = '#e9d6ae', ink = '#2a2020', windows = true } = o, r = w * .36, fy = by + h - w * .52;
  if (x) {
    x.fillStyle = col; x.fillRect(cx - w / 2, by, w, h);
    x.fillRect(cx - w * .62, by + h - w * .05, w * 1.24, w * .07); x.fillRect(cx - w * .58, by + h * .55, w * 1.16, w * .05);
    x.beginPath(); x.moveTo(cx - w * .6, by + h + w * .02); x.lineTo(cx, by + h + w * 1.3); x.lineTo(cx + w * .6, by + h + w * .02); x.closePath(); x.fill();
    x.fillRect(cx - w * .015, by + h + w * 1.25, w * .03, w * .22);
    if (windows) { x.fillStyle = '#2c2a44'; for (const k of [.18, .34]) x.fillRect(cx - w * .08, by + h * k, w * .16, h * .09); }
    wallClock(x, { cx, cy: fy, r, col, face, ink, hands: false });
  }
  if (g) { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, fy, r, 0, TAU); g.fill();
    if (windows) for (const k of [.18, .34]) g.fillRect(cx - w * .08, by + h * k, w * .16, h * .09); }
  return { cx, cy: fy, r };
}

// A satellite: a gold box body, two solar wings with cell lines, a dish; a small light (its atomic clock) burns in g
export function satellite(x, o, g) {
  const { cx, cy, s, col = '#1a1410', body = '#b68a3e', wing = '#2b3a6a', rot = 0 } = o;
  const P = c => { c.save(); c.translate(cx, cy); c.rotate(rot); };
  if (x) {
    P(x);
    x.fillStyle = col; x.fillRect(-s * .9, -s * .012, s * 1.8, s * .024);                               // the boom
    for (const d of [-1, 1]) { x.fillStyle = wing; x.fillRect(d > 0 ? s * .28 : -s * .88, -s * .17, s * .6, s * .34);
      x.fillStyle = col; for (let i = 1; i < 4; i++) x.fillRect((d > 0 ? s * .28 : -s * .88) + i * s * .15 - s * .006, -s * .17, s * .012, s * .34);
      x.fillRect(d > 0 ? s * .28 : -s * .88, -s * .006, s * .6, s * .012); }
    x.fillStyle = body; x.fillRect(-s * .2, -s * .22, s * .4, s * .44);
    x.fillStyle = col; x.fillRect(-s * .2, -s * .02, s * .4, s * .04);
    x.beginPath(); x.moveTo(-s * .12, s * .22); x.quadraticCurveTo(0, s * .42, s * .12, s * .22); x.closePath(); x.fill();   // the dish
    x.fillRect(-s * .01, s * .22, s * .02, s * .1);
    x.fillStyle = '#3a3040'; x.beginPath(); x.arc(0, -s * .11, s * .055, 0, TAU); x.fill();
    x.restore();
  }
  if (g) { P(g); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -s * .11, s * .055, 0, TAU); g.fill(); g.restore(); }
}

// A phone mast: a tapering lattice tower with cross braces, three antenna panels at the top; its red beacon burns in g
export function cellTower(x, o, g) {
  const { cx, by, h, col = '#0e1532' } = o, w0 = h * .16, w1 = h * .04, top = by + h;
  const at = u => [lerp(w0, w1, u) / 2, by + h * u];
  if (x) {
    x.strokeStyle = col; x.fillStyle = col; x.lineCap = 'round'; x.lineWidth = h * .014;
    x.beginPath(); x.moveTo(cx - w0 / 2, by); x.lineTo(cx - w1 / 2, top); x.moveTo(cx + w0 / 2, by); x.lineTo(cx + w1 / 2, top); x.stroke();
    x.lineWidth = h * .006; x.beginPath();
    for (let i = 0; i < 7; i++) { const [a, ya] = at(i / 7), [b, yb] = at((i + 1) / 7); x.moveTo(cx - a, ya); x.lineTo(cx + b, yb); x.moveTo(cx + a, ya); x.lineTo(cx - b, yb); x.moveTo(cx - b, yb); x.lineTo(cx + b, yb); }
    x.stroke();
    for (const d of [-1, 0, 1]) x.fillRect(cx + d * h * .045 - h * .012, top - h * .12, h * .024, h * .1);
    x.fillRect(cx - h * .07, top - h * .025, h * .14, h * .012);
    x.fillRect(cx - h * .004, top, h * .008, h * .06);
    x.fillStyle = '#4a1c1c'; x.beginPath(); x.arc(cx, top + h * .065, h * .012, 0, TAU); x.fill();
  }
  if (g) { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, top + h * .065, h * .012, 0, TAU); g.fill(); }
  return [cx, top + h * .065];
}

// A paper street map on a w × h sheet: blocks, streets, a river, a park (seeded). Ink lines on cream paper.
export function streetMap(x, o) {
  const { w, h, seed = 3, paper = '#d8c398', ink = '#8a6e45', water = '#7f97b8', park = '#9fae7c', bg = true } = o, R = mulberry(seed);
  if (bg) { x.fillStyle = paper; x.fillRect(-w / 2, -h / 2, w, h); }
  x.fillStyle = water; x.beginPath(); x.moveTo(-w / 2, -h * .08);
  for (let i = 0; i <= 12; i++) x.lineTo(-w / 2 + w * i / 12, -h * .08 + Math.sin(i * .9 + seed) * h * .04);
  for (let i = 12; i >= 0; i--) x.lineTo(-w / 2 + w * i / 12, -h * .14 + Math.sin(i * .9 + seed) * h * .04);
  x.closePath(); x.fill();
  x.fillStyle = park; x.fillRect(w * .12, h * .18, w * .2, h * .12);
  x.strokeStyle = ink; x.lineCap = 'round';
  for (let i = 0; i < 9; i++) { x.lineWidth = (i % 3 ? .0011 : .0022) * w / .3; const px = -w / 2 + w * (i + .5 + (R() - .5) * .3) / 9;
    x.beginPath(); x.moveTo(px, -h / 2); x.lineTo(px + (R() - .5) * w * .06, h / 2); x.stroke(); }
  for (let i = 0; i < 13; i++) { x.lineWidth = (i % 4 ? .0011 : .0022) * w / .3; const py = -h / 2 + h * (i + .5 + (R() - .5) * .3) / 13;
    x.beginPath(); x.moveTo(-w / 2, py); x.lineTo(w / 2, py + (R() - .5) * h * .04); x.stroke(); }
}

// The blue dot of a map app: a ring and a core (dark paper on x, white on g; give the sheet a blue glowCol)
export function mapDot(x, o, g) {
  const { cx = 0, cy = 0, r, col = '#1d3a6a', ring = true } = o;
  const shape = (c, fill) => { c.fillStyle = fill; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
    if (ring) { c.globalAlpha = .35; c.beginPath(); c.arc(cx, cy, r * 2.2, 0, TAU); c.fill(); c.globalAlpha = 1; } };
  if (x) shape(x, col);
  if (g) shape(g, '#fff');
}

// A small plane seen from the side, flying right; its wing-tip light burns in g
export function plane(x, o, g) {
  const { cx, cy, s, col = '#0e1532' } = o;
  if (x) {
    x.fillStyle = col; x.beginPath(); x.moveTo(cx - s * .5, cy + s * .02); x.quadraticCurveTo(cx - s * .1, cy + s * .07, cx + s * .42, cy + s * .03);
    x.quadraticCurveTo(cx + s * .52, cy, cx + s * .42, cy - s * .03); x.lineTo(cx - s * .46, cy - s * .03); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(cx - s * .38, cy + s * .02); x.lineTo(cx - s * .48, cy + s * .2); x.lineTo(cx - s * .4, cy + s * .2); x.lineTo(cx - s * .26, cy + s * .03); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(cx - s * .02, cy); x.lineTo(cx - s * .2, cy - s * .2); x.lineTo(cx - s * .12, cy - s * .2); x.lineTo(cx + s * .12, cy); x.closePath(); x.fill();
  }
  if (g) { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - s * .18, cy - s * .19, s * .025, 0, TAU); g.fill(); }
}

// A kitchen oven: body, door with a window, knobs, a clock display (dark glass on x; burns in g)
export function oven(x, o, g) {
  // o.disp: display width as a share of w (default .34); o.handle: the door bar; o.hob: a stovetop with a pot on top,
  // so it reads as a kitchen oven at a glance; o.lit: the door window glows warm (oven light on) in g
  const { cx, by, w, h, col = '#141a33', glass = '#2c2a44', disp = .34, handle = false, hob = false, lit = false } = o;
  const dy = by + h * .86, dw = w * disp, dh = h * (disp > .34 ? .11 : .09);
  if (x) {
    x.fillStyle = col; x.fillRect(cx - w / 2, by, w, h);
    x.fillStyle = glass; x.fillRect(cx - w * .36, by + h * .16, w * .72, h * .42); x.fillRect(cx - dw / 2, dy - dh / 2, dw, dh);
    x.fillStyle = col; x.fillRect(cx - w * .38, by + h * .64, w * .76, h * .03);
    x.fillStyle = '#2a3156'; for (const k of [-.38, -.26, .26, .38]) { x.beginPath(); x.arc(cx + w * k, dy, h * .03, 0, TAU); x.fill(); }
    if (handle) { x.fillStyle = '#3a4270'; x.fillRect(cx - w * .3, by + h * .62, w * .6, h * .025); }
    if (hob) {
      x.fillStyle = col; x.fillRect(cx - w * .52, by + h, w * 1.04, h * .03);
      x.fillStyle = '#1f2547';   // a pot with two handles on the left burner
      x.fillRect(cx - w * .32, by + h * 1.03, w * .26, h * .16); x.fillRect(cx - w * .36, by + h * 1.15, w * .34, h * .025);
      x.fillRect(cx - w * .38, by + h * 1.11, w * .05, h * .02); x.fillRect(cx - w * .01, by + h * 1.11, w * .05, h * .02);
      x.fillRect(cx + w * .1, by + h * 1.03, w * .22, h * .012);   // the empty right burner
    }
  }
  if (g) { g.fillStyle = '#fff'; g.fillRect(cx - dw / 2, dy - dh / 2, dw, dh);
    if (lit) { g.globalAlpha = .45; g.fillRect(cx - w * .36, by + h * .16, w * .72, h * .42); g.globalAlpha = 1; } }
  return [cx, dy];
}

// A person in the style of the viral survival stories (research/analisi/): a big round head with big eyes, so fear reads
// at a glance, and one strong colour on the clothes. Front view. y goes up: by = feet, s = height.
// o.face: 'calm' | 'scared' | 'surprised' | 'sleeping' | 'smile'; o.hair (colour, with a bun); o.coat, o.hat (beanie colour or false), o.skin; o.arms: 'down' | 'up'
export function person(x, o) {
  const { cx, by, s, face = 'calm', coat = '#f2b632', hat = false, skin = '#efe6d8', pants = '#2d3550', arms = 'down', dark = '#16181f' } = o;
  if (!x) return {};
  const hr = s * .16, hy = by + s * .78;
  // legs and shoes
  x.fillStyle = pants; x.fillRect(cx - s * .085, by + s * .02, s * .07, s * .3); x.fillRect(cx + s * .015, by + s * .02, s * .07, s * .3);
  x.fillStyle = dark; x.fillRect(cx - s * .1, by, s * .09, s * .035); x.fillRect(cx + s * .01, by, s * .09, s * .035);
  // coat: a rounded puffer with two seams
  x.fillStyle = coat;
  x.beginPath(); x.moveTo(cx - s * .15, by + s * .3); x.lineTo(cx + s * .15, by + s * .3); x.quadraticCurveTo(cx + s * .17, by + s * .52, cx + s * .12, by + s * .63);
  x.lineTo(cx - s * .12, by + s * .63); x.quadraticCurveTo(cx - s * .17, by + s * .52, cx - s * .15, by + s * .3); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = s * .006;
  for (const yy of [.4, .5]) { x.beginPath(); x.moveTo(cx - s * .15, by + s * yy); x.lineTo(cx + s * .15, by + s * yy); x.stroke(); }
  // arms
  x.fillStyle = coat;
  for (const d of [-1, 1]) {
    x.save(); x.translate(cx + d * s * .14, by + s * .6); x.rotate(d * (arms === 'up' ? -2.5 : -.18));
    x.fillRect(-s * .035, -s * .26, s * .07, s * .26); x.fillStyle = skin; x.beginPath(); x.arc(0, -s * .27, s * .035, 0, TAU); x.fill(); x.restore();
  }
  // head
  x.fillStyle = skin; x.beginPath(); x.arc(cx, hy, hr, 0, TAU); x.fill();
  if (o.hair) {   // (On My Way) hair: a cap over the top of the head and a bun
    x.fillStyle = o.hair; x.beginPath(); x.arc(cx, hy + hr * .38, hr * .93, -.12, Math.PI + .12); x.fill();
    x.beginPath(); x.arc(cx, hy + hr * 1.25, hr * .36, 0, TAU); x.fill();
  }
  if (hat) {
    x.fillStyle = hat; x.beginPath(); x.arc(cx, hy + hr * .15, hr * 1.02, 0, Math.PI); x.fill();
    x.fillRect(cx - hr * 1.05, hy + hr * .05, hr * 2.1, hr * .28);
  }
  // face (y up: positive offsets go towards the top of the head)
  const ex = hr * .36, ey = hy + hr * .05;
  x.fillStyle = dark; x.strokeStyle = dark; x.lineCap = 'round'; x.lineWidth = hr * .08;
  if (face === 'sleeping') {
    for (const d of [-1, 1]) { x.beginPath(); x.arc(cx + d * ex, ey, hr * .13, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
  } else {
    const big = face === 'scared' || face === 'surprised';
    for (const d of [-1, 1]) {
      if (big) { x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + d * ex, ey, hr * .2, 0, TAU); x.fill(); x.fillStyle = dark; }
      x.beginPath(); x.arc(cx + d * ex + (face === 'scared' ? d * -hr * .04 : 0), ey, hr * (big ? .07 : .09), 0, TAU); x.fill();
      if (face === 'scared') {   // brows up and inward: worry
        x.beginPath(); x.moveTo(cx + d * ex * .5, ey + hr * .32); x.lineTo(cx + d * ex * 1.4, ey + hr * .22); x.stroke();
      }
    }
  }
  const my = hy - hr * .42;
  if (face === 'surprised') { x.beginPath(); x.arc(cx, my, hr * .12, 0, TAU); x.fill(); }
  else if (face === 'scared') { x.beginPath(); x.moveTo(cx - hr * .22, my); for (let i = 1; i <= 4; i++) x.lineTo(cx - hr * .22 + i * hr * .11, my + (i % 2 ? hr * .06 : 0)); x.stroke(); }
  else if (face === 'smile') { x.beginPath(); x.arc(cx, my + hr * .16, hr * .26, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
  else if (face === 'calm') { x.beginPath(); x.moveTo(cx - hr * .14, my); x.lineTo(cx + hr * .14, my); x.stroke(); }
  return { head: [cx, hy], r: hr };
}

// —— Added for "On My Way" (Your Call): a living room with a couch, a TV, a mug of tea, a car with headlights ——

// A couch seen from the front: back cushions, two arms, seat; o.front: only the seat front and arms (a sheet in front of a sitter)
export function couch(x, o) {
  const { cx, by, w, h, col = '#5a2f3a', dark = '#2a1620', front = false } = o;
  const arm = w * .12, seatY = by + h * .42;
  x.fillStyle = dark; x.fillRect(cx - w / 2 + arm * .3, by - h * .06, w * .04, h * .08); x.fillRect(cx + w / 2 - arm * .3 - w * .04, by - h * .06, w * .04, h * .08);   // feet
  x.fillStyle = col;
  if (!front) {
    x.beginPath(); x.moveTo(cx - w / 2 + arm * .6, seatY); x.lineTo(cx - w / 2 + arm * .6, by + h * .9);
    x.quadraticCurveTo(cx, by + h * 1.02, cx + w / 2 - arm * .6, by + h * .9); x.lineTo(cx + w / 2 - arm * .6, seatY); x.closePath(); x.fill();
    x.fillStyle = dark; x.fillRect(cx - w * .006, seatY, w * .012, h * .5); x.fillStyle = col;
  }
  x.fillRect(cx - w / 2 + arm * .5, by, w - arm, h * .42);                                   // seat front
  x.fillStyle = dark; x.fillRect(cx - w / 2 + arm * .5, by + h * .4, w - arm, h * .02); x.fillStyle = col;
  for (const d of [-1, 1]) { const ax = cx + d * (w / 2 - arm / 2);                           // arms, rounded on top
    x.fillRect(ax - arm / 2, by, arm, h * .55); x.beginPath(); x.arc(ax, by + h * .55, arm / 2, 0, Math.PI); x.fill(); }
}

// A TV on a low stand, seen from the front; the screen is dark glass, it burns in g when on (o.on)
export function tvSet(x, o, g) {
  const { cx, by, w, h, col = '#0c0f1c', glass = '#1b2036', on = false } = o, sy = by + h * .35, sh = h * .65;
  if (x) {
    x.fillStyle = col; x.fillRect(cx - w * .45, by, w * .9, h * .2); x.fillRect(cx - w * .04, by + h * .2, w * .08, h * .15);
    x.fillRect(cx - w / 2, sy, w, sh); x.fillStyle = glass; x.fillRect(cx - w / 2 + w * .03, sy + w * .03, w * .94, sh - w * .06);
  }
  if (g && on) { g.fillStyle = '#fff'; g.fillRect(cx - w / 2 + w * .03, sy + w * .03, w * .94, sh - w * .06); }
  return [cx, sy + sh / 2];
}

// A mug on a saucer with three wisps of steam (the steam is its own sheet in the shot if it has to rise)
export function mug(x, o) {
  const { cx, by, s, col = '#e9d6ae', steam = true } = o;
  x.fillStyle = col; x.fillRect(cx - s * .6, by, s * 1.2, s * .08);
  x.beginPath(); x.moveTo(cx - s * .38, by + s * .08); x.lineTo(cx - s * .42, by + s * .8); x.lineTo(cx + s * .42, by + s * .8); x.lineTo(cx + s * .38, by + s * .08); x.closePath(); x.fill();
  x.strokeStyle = col; x.lineWidth = s * .09; x.beginPath(); x.arc(cx + s * .46, by + s * .45, s * .18, -Math.PI / 2, Math.PI / 2); x.stroke();
  if (steam) { x.strokeStyle = 'rgba(233,214,174,.55)'; x.lineWidth = s * .05; x.lineCap = 'round';
    for (const d of [-.2, 0, .2]) { x.beginPath(); x.moveTo(cx + d * s, by + s * .95); x.bezierCurveTo(cx + d * s + s * .15, by + s * 1.2, cx + d * s - s * .15, by + s * 1.4, cx + d * s, by + s * 1.65); x.stroke(); } }
}

// A small car seen from the side (facing right): body, cabin, two wheels; the headlight and the windows glow in g
export function car(x, o, g) {
  const { cx, by, w, col = '#141a33', glass = '#2c2a44', flip = false } = o, f = flip ? -1 : 1, h = w * .32;
  const X = v => cx + v * w * f;
  if (x) {
    x.fillStyle = col;
    x.beginPath(); x.moveTo(X(-.5), by + h * .25); x.lineTo(X(-.48), by + h * .62); x.lineTo(X(-.28), by + h * .66); x.lineTo(X(-.16), by + h);
    x.lineTo(X(.18), by + h); x.lineTo(X(.3), by + h * .66); x.lineTo(X(.48), by + h * .58); x.lineTo(X(.5), by + h * .25); x.closePath(); x.fill();
    x.fillStyle = glass; x.beginPath(); x.moveTo(X(-.24), by + h * .66); x.lineTo(X(-.14), by + h * .92); x.lineTo(X(.15), by + h * .92); x.lineTo(X(.25), by + h * .66); x.closePath(); x.fill();
    x.fillStyle = col; x.fillRect(X(0) - w * .01, by + h * .66, w * .02, h * .28);
    x.fillStyle = '#07080f'; for (const k of [-.3, .3]) { x.beginPath(); x.arc(X(k), by + h * .22, h * .22, 0, TAU); x.fill(); }
  }
  if (g) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(X(.48), by + h * .45, w * .02, h * .08, 0, 0, TAU); g.fill(); }
  return [X(.5), by + h * .45];
}

// —— Figures: monsters and animals (rules in pipeline/FIGURE.md). Each is a single readable silhouette with at most one lit detail. ——
// All take cx, by (bottom centre), s (height in metres), col; glow details go to g; flip mirrors the ones with a direction.

// A polygon from unit points (x across, y up, both × s) around cx, by
function shape(x, cx, by, s, pts, col, flip = 1) {
  if (!x) return;
  x.fillStyle = col; x.beginPath();
  pts.forEach(([u, v], i) => (i ? x.lineTo(cx + u * s * flip, by + v * s) : x.moveTo(cx + u * s * flip, by + v * s)));
  x.closePath(); x.fill();
}
const dots = (t, cx, by, s, list, r, col, flip = 1) => {
  if (!t) return; t.fillStyle = col;
  for (const [u, v] of list) { t.beginPath(); t.arc(cx + u * s * flip, by + v * s, r * s, 0, TAU); t.fill(); }
};

// Fear lives in what you don't see: a tall thin shadow, too long arms, no face but two points of light. o.eyes: colour of the eyes
export function tallShadow(x, o, g) {
  const { cx, by, s, col = '#05060a', eyes = '#ffffff', flip = false } = o, f = flip ? -1 : 1;
  shape(x, cx, by, s, [[-.05, 0], [-.07, .3], [-.11, .62], [-.3, .05], [-.33, .07], [-.15, .74], [-.09, .84], [-.075, .96], [0, 1], [.075, .96], [.09, .84],
    [.15, .74], [.33, .07], [.3, .05], [.11, .62], [.07, .3], [.05, 0]], col, f);
  const e = [[-.03, .93], [.03, .93]];
  dots(x, cx, by, s, e, .009, eyes, f); dots(g, cx, by, s, e, .012, '#fff', f);
}
// Eyes in the dark: pairs of eyes only. The cheapest monster and often the best. o.pairs: [[u, v], …] in s units
export function lurkers(x, o, g) {
  const { cx, by, s, col = '#ffe08a', pairs = [[0, .5]], gap = .05 } = o;
  for (const [u, v] of pairs) {
    const e = [[u - gap / 2, v], [u + gap / 2, v]];
    dots(x, cx, by, s, e, .012, col); dots(g, cx, by, s, e, .016, '#fff');
  }
}
// Something big behind the hill: a hunched mass with a row of spines. Show part of it, cut by the frame or a sheet.
export function hulk(x, o, g) {
  const { cx, by, s, col = '#07080d', eye = '#ff5b4d', flip = false } = o, f = flip ? -1 : 1;
  const pts = [[-.7, 0], [-.66, .3], [-.54, .56], [-.5, .66], [-.44, .6], [-.38, .8], [-.31, .7], [-.22, .92], [-.14, .78], [-.04, 1], [.05, .82], [.2, .9], [.34, .72],
    [.5, .68], [.62, .54], [.66, .42], [.56, .36], [.6, .24], [.46, .26], [.5, 0]];
  shape(x, cx, by, s, pts, col, f);
  dots(x, cx, by, s, [[.46, .55]], .018, eye, f); dots(g, cx, by, s, [[.46, .55]], .024, '#fff', f);
}
// Wolf, standing in profile, facing right
export function wolf(x, o, g) {
  const { cx, by, s, col = '#1a1f2c', eye = '#ffe08a', flip = false } = o, f = flip ? -1 : 1;
  shape(x, cx, by, s, [[-.9, .62], [-1.2, .36], [-1.12, .32], [-.84, .5], [-.8, 0], [-.7, 0], [-.64, .34], [.2, .36], [.26, 0], [.36, 0], [.42, .42], [.56, .68], [.6, .94],
    [.68, .8], [.74, .94], [.8, .76], [1.08, .64], [1.08, .58], [.8, .54], [.64, .44], [.5, .78], [-.5, .82]], col, f);
  dots(x, cx, by, s, [[.78, .7]], .022, eye, f); dots(g, cx, by, s, [[.78, .7]], .03, '#fff', f);
}
// Raven perched, facing right
export function raven(x, o) {
  const { cx, by, s, col = '#0b0c12', eye = '#ffd34d', flip = false } = o, f = flip ? -1 : 1;
  shape(x, cx, by, s, [[-.05, 0], [-.02, .2], [-.72, .06], [-.3, .44], [-.12, .72], [.14, .92], [.28, .96], [.4, .9], [.64, .82], [.4, .76], [.34, .56], [.22, .28], [.08, .2], [.08, 0]], col, f);
  dots(x, cx, by, s, [[.3, .86]], .025, eye, f);
}
// Deer standing, antlers up: quiet, gentle or uncanny depending on the light
export function deer(x, o) {
  const { cx, by, s, col = '#3a2a22', flip = false } = o, f = flip ? -1 : 1;
  shape(x, cx, by, s, [[-.5, .5], [-.46, 0], [-.4, 0], [-.34, .3], [.14, .3], [.18, 0], [.24, 0], [.28, .36], [.36, .72], [.4, .78], [.56, .7], [.6, .74], [.46, .86], [.42, .92],
    [.34, .9], [.24, .62], [-.3, .56]], col, f);
  if (!x) return;
  x.strokeStyle = col; x.lineWidth = s * .018; x.lineCap = 'round';
  const line = (pts) => { x.beginPath(); pts.forEach(([u, v], i) => (i ? x.lineTo(cx + u * s * f, by + v * s) : x.moveTo(cx + u * s * f, by + v * s))); x.stroke(); };
  line([[.38, .9], [.3, 1.1], [.2, 1.22]]); line([[.33, 1.04], [.42, 1.16]]); line([[.28, 1.1], [.16, 1.1]]);
}
// Cat sitting, seen from behind or in shadow: two ears are enough
export function cat(x, o, g) {
  const { cx, by, s, col = '#0d0e14', eyes = false } = o;
  shape(x, cx, by, s, [[-.3, 0], [-.34, .3], [-.22, .56], [-.2, .72], [-.24, .98], [-.1, .84], [.1, .84], [.24, .98], [.2, .72], [.22, .56], [.34, .3], [.3, 0]], col);
  if (eyes) { dots(x, cx, by, s, [[-.09, .72], [.09, .72]], .03, eyes); dots(g, cx, by, s, [[-.09, .72], [.09, .72]], .04, '#fff'); }
}
// Owl on a branch, front view
export function owl(x, o, g) {
  const { cx, by, s, col = '#4a3a2c', chest = '#b89a70', eyes = '#ffd34d' } = o;
  shape(x, cx, by, s, [[-.3, 0], [-.38, .4], [-.34, .78], [-.32, 1], [-.12, .9], [.12, .9], [.32, 1], [.34, .78], [.38, .4], [.3, 0]], col);
  shape(x, cx, by, s, [[-.18, .05], [-.2, .4], [0, .55], [.2, .4], [.18, .05]], chest);
  dots(x, cx, by, s, [[-.14, .72], [.14, .72]], .1, chest); dots(x, cx, by, s, [[-.14, .72], [.14, .72]], .055, eyes); dots(g, cx, by, s, [[-.14, .72], [.14, .72]], .05, '#fff');
}
// The fox's cameo: she is in every video even when she says nothing. Small, in a corner of the set, lantern lit, looking in.
// o.pose: 'watch' (sitting, the default), 'window' (only head and ears over an edge, by = the edge)
export function foxCameo(x, o, g) {
  const { cx, by, s, pose = 'watch', flip = false, col = '#e8743b', cream = '#f6e3c8' } = o, f = flip ? -1 : 1;
  if (pose === 'watch') return fox(x, { cx, by, s, flip, lantern: true }, g);
  const ear = [[-.5, .3], [-.42, 1], [-.1, .62], [.1, .62], [.42, 1], [.5, .3], [.2, 0], [-.2, 0]];
  shape(x, cx, by, s * .5, ear, col, f);
  shape(x, cx, by, s * .5, [[-.34, .18], [0, 0], [.34, .18], [0, .1]], cream, f);
  dots(x, cx, by, s * .5, [[-.2, .32], [.2, .32]], .045, '#0e1532', f);
}
