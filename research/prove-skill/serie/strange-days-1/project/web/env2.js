// ---------- Roanoke props ----------
// tall 1580s hat (capotain) and a soft cap, drawn by drawStick via o.hat
function drawCapotain(ctx, hx, hy, hr, lw, col = '#2b2328', band = '#c9a14a') {
  const top = hy - hr * .72;
  // brim
  ctx.beginPath(); ctx.ellipse(hx, top + .01, hr * 1.35, hr * .2, 0, 0, TAU); fillStroke(ctx, col, lw);
  // crown (tapered)
  ctx.beginPath(); ctx.moveTo(hx - hr * .72, top); ctx.lineTo(hx - hr * .58, top - hr * 1.05); ctx.quadraticCurveTo(hx, top - hr * 1.18, hx + hr * .58, top - hr * 1.05); ctx.lineTo(hx + hr * .72, top); ctx.closePath(); fillStroke(ctx, col, lw);
  rrect(ctx, hx - hr * .7, top - hr * .3, hr * 1.4, hr * .22, .01); fillStroke(ctx, band, lw * .8);
  ctx.save(); ctx.beginPath(); ctx.moveTo(hx - hr * .72, top); ctx.lineTo(hx - hr * .58, top - hr * 1.05); ctx.lineTo(hx + hr * .58, top - hr * 1.05); ctx.lineTo(hx + hr * .72, top); ctx.closePath(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(hx - hr * .7, top - hr * 1.2, hr * .3, hr * 1.3); ctx.restore();
}
function drawCoif(ctx, hx, hy, hr, lw) {
  ctx.beginPath(); ctx.arc(hx, hy, hr * 1.04, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(hx, hy - hr * .45, hx - hr * 1.03, hy - hr * .3); ctx.closePath(); fillStroke(ctx, '#fbf7ef', lw);
}
// colonist palettes
const COL = {
  man: { cols: ['#6b4a2e', '#6b4a2e'], hat: 'capotain', belt: true },
  man2: { cols: ['#8c2f2a', '#8c2f2a'], hat: 'capotain', belt: true },
  woman: { cols: ['#3d6f8f', '#3d6f8f'], hat: 'coif', belt: false },
  woman2: { cols: ['#7a5a9a', '#7a5a9a'], hat: 'coif', belt: false },
  kid: { cols: ['#d9772b', '#d9772b'], hat: 'none', belt: false },
};
const WHITE = { cols: PAL.navy, hat: 'captain', belt: true };
const LOCAL = { cols: ['#c8602b', '#e7b04a'], hat: 'none', belt: false };
const LOCAL2 = { cols: ['#2f8f7a', '#2f8f7a'], hat: 'none', belt: false };
const CREW = [COL.man, COL.woman, COL.man2, COL.kid, COL.woman2];

// pine tree (coastal Carolina)
function drawPine(ctx, x, y, s, tint = 0, sway = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(sway);
  rrect(ctx, -14, -120, 28, 125, 8); fillStroke(ctx, mix('#7a4a2a', '#1a1420', tint), 6);
  const g = [mix('#2f8a4a', '#101820', tint), mix('#3aa257', '#101820', tint), mix('#4cbb66', '#101820', tint)];
  for (let i = 0; i < 3; i++) { const w = 130 - i * 30, yb = -90 - i * 85; path(ctx, [[-w, yb], [w, yb], [0, yb - 150]]); fillStroke(ctx, g[i], 6); }
  ctx.restore();
}
function drawBush(ctx, x, y, s, col = '#3aa257') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath();
  for (const [bx, by, br] of [[-40, -20, 40], [0, -40, 50], [45, -22, 38]]) { ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, TAU); }
  fillStroke(ctx, col, 6); ctx.restore();
}
// timber cottage with thatched roof
function drawCottage(ctx, x, y, s, tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -150, -200, 300, 200, 8); fillStroke(ctx, mix('#efe2c4', '#1a1420', tint), 6);
  ctx.save(); rrect(ctx, -150, -200, 300, 200, 8); ctx.clip();
  for (const bx of [-150, -40, 40, 150]) line(ctx, bx, -200, bx, 0, 16, mix('#6b4426', '#1a1420', tint));
  line(ctx, -150, -100, 150, -100, 14, mix('#6b4426', '#1a1420', tint));
  ctx.fillStyle = 'rgba(40,20,30,.15)'; ctx.fillRect(60, -200, 100, 200); ctx.restore();
  rrect(ctx, -40, -120, 80, 120, 8); fillStroke(ctx, mix('#7a4a2a', '#1a1420', tint), 6);
  rrect(ctx, 70, -170, 50, 45, 4); fillStroke(ctx, mix('#ffd77a', '#2a2430', tint), 5);
  path(ctx, [[-185, -195], [185, -195], [100, -330], [-100, -330]]); fillStroke(ctx, mix('#d9a94a', '#1a1420', tint), 6);
  ctx.save(); path(ctx, [[-185, -195], [185, -195], [100, -330], [-100, -330]]); ctx.clip();
  for (let i = 0; i < 9; i++) line(ctx, -170 + i * 42, -195, -120 + i * 30, -330, 3, 'rgba(120,70,20,.4)'); ctx.restore();
  ctx.restore();
}
// pile of planks (a cottage taken apart)
function drawPlanks(ctx, x, y, s, tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = rng(9);
  for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(-20 + (R() - .5) * 60, -14 - i * 22); ctx.rotate((R() - .5) * .35); rrect(ctx, -150, -10, 300, 24, 6); fillStroke(ctx, mix(i % 2 ? '#a26b3c' : '#8a5530', '#1a1420', tint), 5); ctx.restore(); }
  ctx.restore();
}
// palisade of sharpened logs
function drawPalisade(ctx, x0, x1, base, h, tint = 0) {
  for (let x = x0; x < x1; x += 46) {
    const hh = h + ((x * 13) % 30);
    path(ctx, [[x, base], [x, base - hh], [x + 20, base - hh - 30], [x + 40, base - hh], [x + 40, base]]);
    fillStroke(ctx, mix('#9a6436', '#1a1420', tint), 5);
  }
  line(ctx, x0, base - h * .7, x1, base - h * .7, 10, mix('#6b4426', '#1a1420', tint));
}
// the gatepost with letters carved in up to n characters (n can be fractional)
function drawPost(ctx, x, y, s, n = 0, word = 'CROATOAN', tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -90, -1300, 180, 1400, 30); fillStroke(ctx, mix('#b07842', '#1a1420', tint), 8);
  ctx.save(); rrect(ctx, -90, -1300, 180, 1400, 30); ctx.clip();
  ctx.fillStyle = 'rgba(60,30,20,.2)'; ctx.fillRect(30, -1300, 70, 1400);
  for (let i = 0; i < 9; i++) line(ctx, -60 + (i % 3) * 30, -1250 + i * 140, -55 + (i % 3) * 30, -1170 + i * 140, 4, 'rgba(90,50,25,.35)');
  ctx.restore();
  // carved letters, stacked top to bottom
  const k = Math.floor(n);
  for (let i = 0; i < Math.min(k, word.length); i++) text(ctx, word[i], 0, -1180 + i * 132, 118, '#3a2014', '#000', 0, 'Lora', 700);
  ctx.restore();
}
function drawIsland(ctx, x, y, rx, ry, tint = 0) {
  ellipse(ctx, x, y + ry * .25, rx * 1.08, ry * 1.1); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
  ellipse(ctx, x, y, rx, ry); fillStroke(ctx, mix('#f2d79a', '#1a1420', tint), 6);
  ellipse(ctx, x, y - ry * .15, rx * .82, ry * .7); ctx.fillStyle = mix('#5fb35a', '#101820', tint); ctx.fill();
}
function drawBoat(ctx, x, y, s, t, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  rrect(ctx, -6, -260, 12, 260, 4); fillStroke(ctx, '#8a5530', 5);
  path(ctx, [[10, -250], [10, -60], [150, -70]]); fillStroke(ctx, '#f4ead4', 5);
  ctx.beginPath(); ctx.moveTo(-200, -40); ctx.lineTo(200, -40); ctx.quadraticCurveTo(170, 40, 100, 40); ctx.lineTo(-110, 40); ctx.quadraticCurveTo(-180, 30, -200, -40); ctx.closePath(); fillStroke(ctx, '#8a4a26', 6);
  ctx.restore();
}
function drawWave(ctx, x, y, w, h, t, col = '#1d6f9a') {
  ctx.beginPath(); ctx.moveTo(x - w, y + 600);
  for (let i = 0; i <= 24; i++) { const xx = x - w + i * w / 12; ctx.lineTo(xx, y - Math.sin(i * .9 + t * 3) * h - Math.max(0, Math.sin(i * .45 + t * 1.5)) * h * .8); }
  ctx.lineTo(x + w, y + 600); ctx.closePath(); fillStroke(ctx, col, 6);
}
function rain(ctx, t, a = 1, seed = 4) {
  if (a <= 0) return; const R = rng(seed); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(210,230,255,.6)'; ctx.lineCap = 'round';
  for (let i = 0; i < 140; i++) { const x = (R() * 1400 + t * 300) % 1400 - 160; const y = (R() * 2100 + t * 2400 * (.8 + R() * .4)) % 2100 - 90; ctx.lineWidth = 3 + R() * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 30, y + 90); ctx.stroke(); }
  ctx.restore();
}
function bolt(ctx, x, y, s, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  path(ctx, [[x, y], [x - 60 * s, y + 220 * s], [x + 10 * s, y + 210 * s], [x - 50 * s, y + 460 * s], [x + 90 * s, y + 160 * s], [x + 20 * s, y + 170 * s], [x + 70 * s, y]]);
  fillStroke(ctx, '#fff3a0', 8); ctx.restore();
}
function flash(ctx, a) { if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function campfire(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const r of [-.4, .4]) { ctx.save(); ctx.rotate(r); rrect(ctx, -110, -14, 220, 28, 12); fillStroke(ctx, '#7a4a2a', 5); ctx.restore(); }
  const f = 1 + Math.sin(t * 14) * .08;
  ctx.beginPath(); ctx.moveTo(-70, -10); ctx.quadraticCurveTo(-80, -120 * f, 0, -220 * f); ctx.quadraticCurveTo(80, -120 * f, 70, -10); ctx.closePath(); fillStroke(ctx, '#ff8a2a', 6);
  ctx.beginPath(); ctx.moveTo(-35, -10); ctx.quadraticCurveTo(-40, -70 * f, 0, -130 * f); ctx.quadraticCurveTo(40, -70 * f, 35, -10); ctx.closePath(); ctx.fillStyle = '#ffe14d'; ctx.fill();
  ctx.restore();
}
function heart(ctx, x, y, r, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.moveTo(x, y + r * .9);
  ctx.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .6, y - r * 1.3, x, y - r * .4); ctx.bezierCurveTo(x + r * .6, y - r * 1.3, x + r * 1.6, y - r * .2, x, y + r * .9);
  fillStroke(ctx, '#ff5a6a', r * .14); ctx.restore();
}
function qmark(ctx, x, y, size, a = 1, rot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); text(ctx, '?', 0, 0, size, '#ffe14d', INK, size * .12, 'Poppins', 700); ctx.restore();
}
function calendar(ctx, x, y, s, year, flip = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -170, -150, 340, 300, 24); fillStroke(ctx, '#fffaf0', 8);
  ctx.save(); rrect(ctx, -170, -150, 340, 300, 24); ctx.clip(); ctx.fillStyle = '#e0392f'; ctx.fillRect(-170, -150, 340, 80); ctx.restore();
  rrect(ctx, -170, -150, 340, 300, 24); fillStroke(ctx, null, 8);
  for (const rx of [-90, 90]) { rrect(ctx, rx - 10, -175, 20, 50, 10); fillStroke(ctx, '#bbb', 5); }
  ctx.save(); ctx.scale(1, 1 - flip * .9); text(ctx, String(year), 0, 40, 120, INK, INK, 0, 'Poppins', 700); ctx.restore();
  ctx.restore();
}
