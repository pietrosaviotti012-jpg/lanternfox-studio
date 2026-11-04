// ---------- Dancing Plague of 1518: props ----------
// soft flat cap (16th-century barett) and a physician's black bonnet, drawn by drawStick via o.hat
function drawBeret(ctx, hx, hy, hr, lw, col = '#3a2a40') {
  const top = hy - hr * .62;
  ctx.beginPath(); ctx.ellipse(hx + hr * .1, top - hr * .12, hr * 1.25, hr * .38, -.08, 0, TAU); fillStroke(ctx, col, lw);
  ctx.save(); ctx.beginPath(); ctx.ellipse(hx + hr * .1, top - hr * .12, hr * 1.25, hr * .38, -.08, 0, TAU); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ellipse(ctx, hx - hr * .3, top - hr * .3, hr * .5, hr * .12, -.1); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(hx - hr * .9, top + hr * .12); ctx.quadraticCurveTo(hx, top + hr * .26, hx + hr * .95, top + hr * .1); ctx.lineWidth = lw * 1.6; ctx.strokeStyle = INK; ctx.stroke();
}
function drawDoctorCap(ctx, hx, hy, hr, lw) {
  const top = hy - hr * .7;
  // soft square physician's bonnet: low crown with four rounded peaks
  ctx.beginPath(); ctx.moveTo(hx - hr * 1.0, top + hr * .16); ctx.quadraticCurveTo(hx - hr * 1.1, top - hr * .35, hx - hr * .55, top - hr * .42); ctx.quadraticCurveTo(hx, top - hr * .62, hx + hr * .55, top - hr * .42); ctx.quadraticCurveTo(hx + hr * 1.1, top - hr * .35, hx + hr * 1.0, top + hr * .16); ctx.quadraticCurveTo(hx, top + hr * .3, hx - hr * 1.0, top + hr * .16); fillStroke(ctx, '#1e1a22', lw);
  line(ctx, hx, top - hr * .5, hx, top + hr * .22, lw * .8, '#5a4a6a');
  rrect(ctx, hx - hr * 1.02, top + hr * .06, hr * 2.04, hr * .16, .01); fillStroke(ctx, '#7a2f3a', lw * .8);
}
// 1518 people
const TROF = { cols: ['#d8452f', '#d8452f'], hat: 'coif', belt: false };
const TOWN18 = [
  { cols: ['#2f63c9', '#2f63c9'], hat: 'beret', belt: true },
  { cols: ['#3fa35b', '#3fa35b'], hat: 'coif', belt: false },
  { cols: ['#f2b52a', '#f2b52a'], hat: 'beret', belt: true, hatCol: '#7a2f3a' },
  { cols: ['#7a4bc4', '#7a4bc4'], hat: 'coif', belt: false },
  { cols: ['#c8602b', '#c8602b'], hat: 'none', belt: true },
  { cols: ['#2f8f7a', '#2f8f7a'], hat: 'coif', belt: false },
  { cols: ['#8c2f2a', '#8c2f2a'], hat: 'beret', belt: true },
  { cols: ['#3d6f8f', '#3d6f8f'], hat: 'coif', belt: false },
];
const DOC = { cols: ['#1f1a26', '#1f1a26'], hat: 'doctor', belt: false, vest: '#7a2f3a' };
const COUNCIL = { cols: ['#2a3f8f', '#2a3f8f'], hat: 'beret', belt: true, vest: '#e8c04a', hatCol: '#1e1a22' };

// a dancing pose: legs kick, arms swing; i offsets each dancer, e = energy (1 fresh, ~.4 exhausted)
function dance(t, i = 0, e = 1) {
  const sp = 9 + (i % 3) * 1.3, ph = t * sp + i * 1.7;
  const kick = Math.max(0, Math.sin(ph));
  return {
    legs: { L: [Math.sin(ph) * .55 * e + .1, -kick * .9 * e], R: [-Math.sin(ph) * .4 * e + .1, -Math.max(0, -Math.sin(ph)) * .9 * e] },
    arms: { L: [2.1 + Math.sin(ph + 1) * .6 * e, .4 + Math.sin(ph) * .3], R: [2.3 - Math.sin(ph + .5) * .6 * e, .3 - Math.sin(ph) * .3] },
    lean: Math.sin(ph * .5) * .12 * e, bob: -Math.abs(Math.sin(ph)) * .03 * e,
  };
}
function dancer(ctx, base, x, y, s, t, i, e = 1, face = {}, extra = {}) {
  const d = dance(t, i, e);
  drawStick(ctx, C(base, Object.assign({ x, y, s, legs: d.legs, arms: d.arms, lean: d.lean, bob: d.bob, face: Object.assign({ eyes: 'wide', look: [0, 0], mouth: 'o', browUp: 1 }, face) }, extra)));
}

// half-timbered Strasbourg house; base at y, w x h body plus a steep gable roof
function drawTimberHouse(ctx, x, y, s, wall = '#f4e3c2', o = {}) {
  const tint = o.tint || 0, lit = o.lit || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const w = o.w || 300, h = o.h || 420, roof = o.roof || '#c9452f';
  const beam = mix('#6b3a22', '#140c0c', tint), wl = mix(wall, '#18121a', tint);
  rrect(ctx, -w / 2, -h, w, h, 4); fillStroke(ctx, wl, 6);
  ctx.save(); rrect(ctx, -w / 2, -h, w, h, 4); ctx.clip();
  const fl = [-h, -h * .66, -h * .33, 0];
  for (const fy of fl) line(ctx, -w / 2, fy, w / 2, fy, 14, beam);
  for (let k = 0; k < 3; k++) {
    const y0 = fl[k], y1 = fl[k + 1];
    for (const bx of [-w / 2, -w / 6, w / 6, w / 2]) line(ctx, bx, y0, bx, y1, 12, beam);
    if (k < 2) { line(ctx, -w / 2, y1, -w / 6, y0, 9, beam); line(ctx, w / 2, y1, w / 6, y0, 9, beam); }
  }
  ctx.fillStyle = 'rgba(40,20,30,.14)'; ctx.fillRect(w * .2, -h, w * .3, h); ctx.restore();
  // windows on the upper floors, door below
  for (const [wx, wy] of [[-w / 3, -h * .5], [0, -h * .5], [w / 3, -h * .5], [-w / 3, -h * .83], [w / 3, -h * .83]]) {
    rrect(ctx, wx - 24, wy - 28, 48, 56, 4); fillStroke(ctx, lit > .5 ? '#ffcf6a' : mix('#9fd3ef', '#2a2430', tint), 5);
    line(ctx, wx, wy - 28, wx, wy + 28, 4); line(ctx, wx - 24, wy, wx + 24, wy, 4);
  }
  if (o.door !== false) {
    const dw = 74, open = o.open || 0;
    rrect(ctx, -dw / 2, -128, dw, 128, [36, 36, 0, 0]); fillStroke(ctx, '#140e10', 5);
    ctx.save(); ctx.translate(-dw / 2, 0); ctx.scale(1 - open * .85, 1);
    rrect(ctx, 0, -128, dw, 128, [36, 36, 0, 0]); fillStroke(ctx, mix('#8a4f24', '#100c10', tint), 5);
    line(ctx, dw * .5, -110, dw * .5, -8, 4, mix('#5a3018', '#000', tint)); ctx.restore();
  }
  // roof gable
  path(ctx, [[-w / 2 - 26, -h + 4], [w / 2 + 26, -h + 4], [0, -h - w * .95]]); fillStroke(ctx, mix(roof, '#120a0a', tint), 6);
  ctx.save(); path(ctx, [[-w / 2 - 26, -h + 4], [w / 2 + 26, -h + 4], [0, -h - w * .95]]); ctx.clip();
  for (let i = 1; i < 8; i++) line(ctx, -w, -h - i * 34, w, -h - i * 34, 3, 'rgba(60,10,10,.3)');
  ctx.fillStyle = 'rgba(40,0,0,.15)'; ctx.fillRect(0, -h - w, w, w); ctx.restore();
  rrect(ctx, -22, -h - w * .55, 44, 52, 22); fillStroke(ctx, mix('#9fd3ef', '#2a2430', tint), 5);
  ctx.restore();
}
// Strasbourg cathedral (pink sandstone facade, single north spire), base at y
function drawCathedral(ctx, x, y, s, tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const st = mix('#d98a78', '#1a1018', tint), sh = mix('#b86a5c', '#120a10', tint);
  rrect(ctx, -220, -620, 440, 620, 4); fillStroke(ctx, st, 6);
  // left tower + spire
  rrect(ctx, -220, -900, 170, 300, 4); fillStroke(ctx, st, 6);
  path(ctx, [[-235, -895], [-35, -895], [-135, -1330]]); fillStroke(ctx, sh, 6);
  for (let i = 1; i < 6; i++) line(ctx, -235 + i * 16, -895 - i * 70, -35 - i * 16, -895 - i * 70, 4, st);
  rrect(ctx, 50, -700, 170, 90, 4); fillStroke(ctx, st, 6);
  // rose window and portals
  circle(ctx, 0, -430, 95); fillStroke(ctx, mix('#4a7ad0', '#141024', tint), 6);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(ctx, 0, -430, Math.cos(a) * 95, -430 + Math.sin(a) * 95, 4, st); }
  circle(ctx, 0, -430, 30); fillStroke(ctx, mix('#e0392f', '#1a0c10', tint), 5);
  for (const px of [-140, 0, 140]) { rrect(ctx, px - 40, -210, 80, 210, [40, 40, 0, 0]); fillStroke(ctx, mix('#3a2228', '#060406', tint), 5); }
  for (const wx of [-170, -100]) { rrect(ctx, wx - 16, -840, 32, 90, 16); fillStroke(ctx, mix('#3a2228', '#060406', tint), 4); }
  ctx.fillStyle = 'rgba(40,10,20,.16)'; ctx.fillRect(110, -700, 110, 700);
  ctx.restore();
}
// cobbled street from y down
function cobbles(ctx, y, tint = 0, col = '#c9b48a') {
  ctx.fillStyle = mix(col, '#141014', tint); ctx.fillRect(-1600, y, 4300, 3000); line(ctx, -1600, y, 2700, y, 6);
  const R = rng(23); ctx.strokeStyle = mix('#a8936a', '#0c0a0c', tint); ctx.lineWidth = 4;
  for (let r = 0; r < 14; r++) { const yy = y + 30 + r * r * 7 + r * 30; const sz = 40 + r * 10; for (let i = 0; i < 40; i++) { const xx = -800 + i * sz * 1.4 + (r % 2) * sz * .7 + R() * 8; ctx.beginPath(); ctx.ellipse(xx, yy, sz * .5, sz * .16 + r * 1.2, 0, 0, TAU); ctx.stroke(); } }
}
// town square backdrop: sky, cathedral, a row of houses, cobbles
function townBG(ctx, t, cam, o = {}) {
  const night = o.night || 0, tint = o.tint || night * .7;
  applyCam(ctx, cam, .08); drawSky(ctx, mix('#4aaeea', '#141a3a', night), mix('#d8f1fb', '#3a3a6a', night));
  applyCam(ctx, cam, .12); if (night < .9 && o.sun !== false) drawSun(ctx, o.sunX || 840, o.sunY || 300, 70, t, 1 - night);
  applyCam(ctx, cam, .16); if (night < .6) { drawCloud(ctx, 200 + t * 8, 330, 90, 3, 1 - night); drawCloud(ctx, 880 + t * 5, 560, 60, 4, 1 - night); }
  applyCam(ctx, cam, .4); drawCathedral(ctx, o.cathX || 560, 1010, .8, tint * .9);
  applyCam(ctx, cam, .7);
  const houses = o.houses || [[-120, '#f4e3c2', '#c9452f'], [180, '#f6d9a0', '#a8402a'], [900, '#e8f0d8', '#c9452f'], [1200, '#f4d2c2', '#8a3a2a']];
  houses.forEach(([hx, wall, roof], i) => drawTimberHouse(ctx, hx, 1100, .95, wall, { roof, tint, lit: night > .5 ? 1 : 0, w: 290 + (i % 2) * 30, h: 400 + (i % 3) * 40 }));
  applyCam(ctx, cam, 1); cobbles(ctx, 1100, tint);
}
// a year counter / day board
function dayBoard(ctx, x, y, s, n) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -150, -95, 300, 190, 22); fillStroke(ctx, '#fffaf0', 8);
  ctx.save(); rrect(ctx, -150, -95, 300, 190, 22); ctx.clip(); ctx.fillStyle = '#e0392f'; ctx.fillRect(-150, -95, 300, 70); ctx.restore();
  rrect(ctx, -150, -95, 300, 190, 22); fillStroke(ctx, null, 8);
  text(ctx, 'DAY', 0, -60, 46, '#fff', INK, 0, 'Poppins', 700);
  text(ctx, String(n), 0, 32, 100, INK, INK, 0, 'Poppins', 700);
  ctx.restore();
}
function drawMoon(ctx, x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  // crescent: the moon disc minus an offset disc
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.moveTo(x + r * .45 + r * .85, y - r * .25); ctx.arc(x + r * .45, y - r * .25, r * .85, 0, TAU, true);
  ctx.fillStyle = '#fff6c8'; ctx.fill('evenodd'); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
// a heavy chronicle book, open; ink lines appear with p
function drawBook(ctx, x, y, s, p = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -330, -20, 660, 60, 16); fillStroke(ctx, '#6b3a22', 7);
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(side * 150, -40, side * 310, -20); ctx.lineTo(side * 310, -300); ctx.quadraticCurveTo(side * 150, -320, 0, -280); ctx.closePath(); fillStroke(ctx, '#fbf1d6', 7);
    ctx.save(); ctx.clip();
    for (let i = 0; i < 8; i++) { const k = clamp(p * 9 - i - (side > 0 ? 4 : 0) * 0); const yy = -250 + i * 28; if (k > 0) line(ctx, side * 40, yy, side * (40 + 230 * k * (i % 3 === 2 ? .6 : 1)), yy, 5, '#5a4a3a'); }
    ctx.restore();
  }
  line(ctx, 0, -280, 0, 0, 6);
  ctx.restore();
}
// apothecary flask with red liquid
function drawFlask(ctx, x, y, s, rot = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-14, -90); ctx.lineTo(-14, -40); ctx.quadraticCurveTo(-60, -20, -55, 20); ctx.quadraticCurveTo(-50, 60, 0, 62); ctx.quadraticCurveTo(50, 60, 55, 20); ctx.quadraticCurveTo(60, -20, 14, -40); ctx.lineTo(14, -90); ctx.closePath(); fillStroke(ctx, 'rgba(220,240,255,.85)', 6);
  ctx.save(); ctx.clip(); ctx.fillStyle = '#e0392f'; ctx.fillRect(-70, 5 + Math.sin(t * 6) * 4, 140, 70); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-14, -90); ctx.lineTo(-14, -40); ctx.quadraticCurveTo(-60, -20, -55, 20); ctx.quadraticCurveTo(-50, 60, 0, 62); ctx.quadraticCurveTo(50, 60, 55, 20); ctx.quadraticCurveTo(60, -20, 14, -40); ctx.lineTo(14, -90); ctx.closePath(); fillStroke(ctx, null, 6);
  rrect(ctx, -20, -104, 40, 20, 6); fillStroke(ctx, '#8a5530', 5);
  ellipse(ctx, -26, 0, 8, 18, .3); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill();
  ctx.restore();
}
// wavy heat lines rising
function heatLines(ctx, x, y, s, t, a = 1, col = '#ff5a2a') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  for (let i = -1; i <= 1; i++) {
    const k = (t * 1.4 + (i + 1) * .33) % 1; ctx.globalAlpha = a * Math.sin(k * Math.PI);
    ctx.beginPath(); for (let j = 0; j <= 12; j++) { const yy = y - k * 80 * s - j * 10 * s, xx = x + i * 60 * s + Math.sin(j * .9 + t * 8) * 12 * s; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.lineWidth = 12 * s; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 6 * s; ctx.strokeStyle = col; ctx.stroke();
  }
  ctx.restore();
}
// wooden stage, built up as p goes 0..1 (planks drop in)
function drawStage(ctx, x, y, w, p = 1, tint = 0) {
  const n = 9, pw = w / n;
  for (let i = 0; i < n; i++) {
    const k = backOut(clamp(p * (n + 2) - i)); if (k <= 0) continue;
    const yy = y - (1 - clamp(k)) * 300;
    rrect(ctx, x - w / 2 + i * pw + 2, yy, pw - 4, 34, 4); fillStroke(ctx, mix(i % 2 ? '#c98a4a' : '#b87a3a', '#140c0a', tint), 5);
  }
  const lk = clamp(p * 2);
  if (lk > 0) for (const lx of [x - w / 2 + 40, x - w / 6, x + w / 6, x + w / 2 - 40]) { rrect(ctx, lx - 16, y + 34, 32, 150 * lk, 4); fillStroke(ctx, mix('#8a5530', '#100c0c', tint), 5); }
  if (lk > 0) { line(ctx, x - w / 2 + 40, y + 60, x + w / 2 - 40, y + 60 + 0, 0); }
}
// drum (for a musician) and a fife
function drawDrum(ctx, x, y, s, t = 0, hit = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -70, -50, 140, 100, 10); fillStroke(ctx, '#e0392f', 6);
  ctx.save(); rrect(ctx, -70, -50, 140, 100, 10); ctx.clip();
  ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(-70 + i * 35, -50); ctx.lineTo(-52 + i * 35, 50); ctx.moveTo(-34 + i * 35, -50); ctx.lineTo(-52 + i * 35, 50); } ctx.lineWidth = 4; ctx.strokeStyle = '#f6f1e8'; ctx.stroke(); ctx.restore();
  ellipse(ctx, 0, -50, 70, 16); fillStroke(ctx, '#f6ecd6', 6);
  if (hit > 0) { ctx.globalAlpha = hit; for (let i = 0; i < 3; i++) line(ctx, -60 + i * 60, -90, -70 + i * 70, -120, 6); }
  ctx.restore();
}
function drawFife(ctx, hand, ang, s = 1) {
  ctx.save(); ctx.translate(hand[0], hand[1]); ctx.rotate(ang);
  rrect(ctx, -.01, -.02, .26 * s, .03, .012); ctx.fillStyle = '#d9a84a'; ctx.fill(); ctx.lineWidth = .01; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// hill shrine chapel (St Vitus, near Saverne), base at y
function drawChapel(ctx, x, y, s, tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wall = mix('#f6f1e6', '#1a1420', tint);
  rrect(ctx, -110, -200, 220, 200, 4); fillStroke(ctx, wall, 6);
  path(ctx, [[-130, -196], [130, -196], [0, -320]]); fillStroke(ctx, mix('#c9452f', '#140a0a', tint), 6);
  rrect(ctx, -20, -420, 40, 120, 4); fillStroke(ctx, wall, 5);
  line(ctx, 0, -470, 0, -410, 8); line(ctx, -22, -448, 22, -448, 8);
  rrect(ctx, -30, -110, 60, 110, [30, 30, 0, 0]); fillStroke(ctx, '#ffcf6a', 5);
  ctx.fillStyle = 'rgba(40,20,40,.15)'; ctx.fillRect(40, -200, 70, 200);
  ctx.restore();
}
// empty bowl and a crossed-out loaf (hunger), a sick bed (disease)
function drawBowl(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-110, -40); ctx.quadraticCurveTo(-100, 60, 0, 62); ctx.quadraticCurveTo(100, 60, 110, -40); ctx.closePath(); fillStroke(ctx, '#b87a3a', 7);
  ellipse(ctx, 0, -40, 110, 24); fillStroke(ctx, '#5a3a22', 7);
  ctx.restore();
}
function drawLoaf(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 120, 60, 0, Math.PI, 0); ctx.lineTo(120, 10); ctx.lineTo(-120, 10); ctx.closePath(); fillStroke(ctx, '#e0a24a', 7);
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 45 - 18, -40); ctx.lineTo(i * 45 + 14, -14); ctx.lineWidth = 7; ctx.strokeStyle = '#a86a2a'; ctx.stroke(); }
  ctx.restore();
}
function crossOut(ctx, x, y, r, p = 1) {
  if (p <= 0) return;
  const k1 = clamp(p * 2), k2 = clamp(p * 2 - 1);
  line(ctx, x - r, y - r, x - r + 2 * r * k1, y - r + 2 * r * k1, 34, INK); line(ctx, x - r, y - r, x - r + 2 * r * k1, y - r + 2 * r * k1, 20, '#e0392f');
  if (k2 > 0) { line(ctx, x + r, y - r, x + r - 2 * r * k2, y - r + 2 * r * k2, 34, INK); line(ctx, x + r, y - r, x + r - 2 * r * k2, y - r + 2 * r * k2, 20, '#e0392f'); }
}
function germ(ctx, x, y, r, t, seed = 1, col = '#7ac943') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * .8 + seed);
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line(ctx, 0, 0, Math.cos(a) * r * 1.35, Math.sin(a) * r * 1.35, r * .16); circle(ctx, Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4, r * .16); fillStroke(ctx, col, r * .08); }
  circle(ctx, 0, 0, r); fillStroke(ctx, col, r * .12);
  circle(ctx, -r * .3, -r * .2, r * .18); ctx.fillStyle = '#fff'; ctx.fill(); circle(ctx, r * .3, -r * .2, r * .18); ctx.fill();
  circle(ctx, -r * .28, -r * .2, r * .08); ctx.fillStyle = INK; ctx.fill(); circle(ctx, r * .32, -r * .2, r * .08); ctx.fill();
  ctx.beginPath(); ctx.arc(0, r * .3, r * .25, Math.PI + .4, -.4); ctx.lineWidth = r * .08; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// red contagion ring that passes from one dancer to the next
function ripple(ctx, x, y, r, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  circle(ctx, x, y, r); ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = '#ff5a6a'; ctx.stroke();
  ctx.restore();
}
