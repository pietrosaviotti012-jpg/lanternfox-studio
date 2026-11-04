// ---------- The Great Moon Hoax (1835): props ----------
// hats in head units (drawStick dispatches on o.hat)
function drawTopHat(ctx, hx, hy, hr, lw, col = '#2b2328', band = '#8a2f3a') {
  const top = hy - hr * .72;
  rrect(ctx, hx - hr * .62, top - hr * 1.15, hr * 1.24, hr * 1.2, hr * .08); fillStroke(ctx, col, lw);
  ctx.save(); rrect(ctx, hx - hr * .62, top - hr * 1.15, hr * 1.24, hr * 1.2, hr * .08); ctx.clip();
  ctx.fillStyle = band; ctx.fillRect(hx - hr, top - hr * .32, hr * 2, hr * .22);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(hx - hr * .45, top - hr * 1.15, hr * .18, hr * 1.2);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(hx + hr * .3, top - hr * 1.15, hr * .4, hr * 1.2);
  ctx.restore();
  rrect(ctx, hx - hr * .62, top - hr * 1.15, hr * 1.24, hr * 1.2, hr * .08); fillStroke(ctx, null, lw);
  ellipse(ctx, hx, top + hr * .03, hr * 1.02, hr * .16); fillStroke(ctx, col, lw);
}
function drawNewsCap(ctx, hx, hy, hr, lw, col = '#8a7a5a') {
  const top = hy - hr * .45;
  ctx.beginPath(); ctx.moveTo(hx - hr * 1.0, top + hr * .05); ctx.quadraticCurveTo(hx - hr * 1.0, top - hr * .85, hx + hr * .1, top - hr * .82);
  ctx.quadraticCurveTo(hx + hr * 1.05, top - hr * .7, hx + hr * 1.0, top + hr * .05); ctx.closePath(); fillStroke(ctx, col, lw);
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(hx + hr * .3, top - hr, hr, hr * 1.2); ctx.restore();
  ctx.beginPath(); ctx.moveTo(hx - hr * .2, top + hr * .02); ctx.quadraticCurveTo(hx + hr * .9, top - hr * .12, hx + hr * 1.45, top + hr * .12); ctx.quadraticCurveTo(hx + hr * .8, top + hr * .2, hx - hr * .2, top + hr * .1); ctx.closePath(); fillStroke(ctx, '#6a5a3a', lw);
  circle(ctx, hx + hr * .1, top - hr * .8, hr * .1); fillStroke(ctx, col, lw);
}
function drawBonnet(ctx, hx, hy, hr, lw, col = '#e9b7c4') {
  ctx.beginPath(); ctx.arc(hx, hy - hr * .05, hr * 1.18, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(hx + hr * .9, hy - hr * .55, hx, hy - hr * .6); ctx.quadraticCurveTo(hx - hr * .9, hy - hr * .55, hx - hr * 1.17, hy - hr * .1); ctx.closePath(); fillStroke(ctx, col, lw);
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(hx + hr * .4, hy - hr * 1.4, hr, hr * 1.4); ctx.restore();
  line(ctx, hx - hr * 1.0, hy + hr * .1, hx - hr * .55, hy + hr * .85, lw * .9, '#c0392b');
  line(ctx, hx + hr * 1.0, hy + hr * .1, hx + hr * .55, hy + hr * .85, lw * .9, '#c0392b');
}
// 1835 people
const READER = { cols: ['#2f63c9', '#2f63c9'], vest: '#f2ead8', hat: 'tophat', belt: false };
const NEWSBOY = { cols: ['#d9a12b', '#d9a12b'], hat: 'newscap', belt: true };
const LADY = { cols: ['#7a4bc4', '#7a4bc4'], hat: 'bonnet', belt: false, hatCol: '#f2c1cf' };
const CROWD = [{ cols: ['#3f8a4a', '#3f8a4a'], hat: 'tophat', belt: false }, { cols: ['#c8602b', '#c8602b'], hat: 'bonnet', belt: false, hatCol: '#f6e3a0' },
  { cols: ['#8c2f2a', '#8c2f2a'], hat: 'tophat', belt: false, hatCol: '#5a3a2a' }, { cols: ['#2f8f7a', '#2f8f7a'], hat: 'newscap', belt: true }, { cols: ['#5a4a8a', '#5a4a8a'], hat: 'bonnet', belt: false }];
const HERSCHEL = { cols: ['#2b2b3a', '#2b2b3a'], vest: '#f2ead8', hat: 'tophat', belt: false };
const LOCKE = { cols: ['#7a2f3a', '#7a2f3a'], vest: '#f2ead8', hat: 'none', belt: false };
const EDITOR = { cols: ['#3d6f8f', '#3d6f8f'], vest: '#f2ead8', hat: 'none', belt: false };
const BATFOLK = { cols: ['#b8743a', '#b8743a'], hat: 'none', belt: false };

// night sky with twinkling stars
function nightSky(ctx, t, top = '#0d1440', bot = '#3a3f8f', seed = 9) {
  drawSky(ctx, top, bot, -600, 1300);
  const R = rng(seed);
  for (let i = 0; i < 90; i++) { const x = R() * 2200 - 560, y = R() * 1500 - 500, r = 2 + R() * 4, tw = .5 + .5 * Math.sin(t * (2 + R() * 3) + i);
    circle(ctx, x, y, r * (.6 + .4 * tw)); ctx.fillStyle = `rgba(255,250,220,${.5 + .5 * tw})`; ctx.fill(); }
}
// cartoon moon: pale disc, craters, glow; face 0..1 shows the moon from far away
function drawMoon(ctx, x, y, r, t, glow = 1) {
  if (glow > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, r * .8, x, y, r * 2.6); g.addColorStop(0, `rgba(255,245,200,${.35 * glow})`); g.addColorStop(1, 'rgba(255,245,200,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); ctx.restore(); }
  circle(ctx, x, y, r); fillStroke(ctx, '#fff3c4', Math.max(4, r * .04));
  ctx.save(); circle(ctx, x, y, r); ctx.clip();
  ctx.fillStyle = 'rgba(200,170,110,.35)'; circle(ctx, x + r * .35, y + r * .3, r * 1.0); ctx.fill();
  const cr = [[-.35, -.3, .2], [.25, -.45, .12], [.4, .15, .18], [-.2, .35, .14], [-.55, .2, .08], [.05, .05, .07]];
  for (const [cx, cy, rr] of cr) { circle(ctx, x + cx * r, y + cy * r, rr * r); ctx.fillStyle = 'rgba(190,160,100,.55)'; ctx.fill(); ctx.lineWidth = Math.max(2, r * .02); ctx.strokeStyle = 'rgba(120,90,50,.5)'; ctx.stroke(); }
  ctx.restore();
}
// the broadsheet; s scale, headline text, sub picture fn
function newspaper(ctx, x, y, s, rot = 0, head = 'LIFE ON THE MOON', o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 520, h = 680;
  ctx.save(); ctx.translate(10, 12); rrect(ctx, -w / 2, -h / 2, w, h, 8); ctx.fillStyle = 'rgba(30,10,20,.25)'; ctx.fill(); ctx.restore();
  rrect(ctx, -w / 2, -h / 2, w, h, 8); fillStroke(ctx, '#f6efdc', 7);
  // masthead
  text(ctx, 'THE SUN', 0, -h / 2 + 70, 82, INK, INK, 0, 'Lora', 700);
  line(ctx, -w / 2 + 30, -h / 2 + 122, w / 2 - 30, -h / 2 + 122, 5); line(ctx, -w / 2 + 30, -h / 2 + 134, w / 2 - 30, -h / 2 + 134, 3);
  text(ctx, o.date || 'NEW YORK, 1835', 0, -h / 2 + 156, 22, '#5a4a3a', INK, 0, 'Poppins', 700);
  const lines = head.split('\n');
  lines.forEach((L, i) => text(ctx, L, 0, -h / 2 + 215 + i * 62, lines.length > 1 ? 54 : 58, o.headCol || '#c0392b', INK, 0, 'Poppins', 700));
  const py = -h / 2 + 215 + lines.length * 62 + 10;
  // picture box with the moon
  rrect(ctx, -w / 2 + 40, py, w - 80, 230, 6); fillStroke(ctx, '#1a2050', 5);
  ctx.save(); rrect(ctx, -w / 2 + 40, py, w - 80, 230, 6); ctx.clip();
  if (o.pic) o.pic(ctx, 0, py + 115); else drawMoon(ctx, 0, py + 115, 85, 0, .6);
  ctx.restore();
  for (let i = 0; i < 6; i++) { const yy = py + 262 + i * 24; if (yy > h / 2 - 20) break; line(ctx, -w / 2 + 40, yy, -10, yy, 6, '#9a8a7a'); line(ctx, 20, yy, w / 2 - 40 - (i % 3) * 30, yy, 6, '#9a8a7a'); }
  ctx.restore();
}
// red rubber stamp
function stamp(ctx, x, y, s, label, rot = -.2, a = 1) {
  if (s <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = '700 130px Poppins'; const w = ctx.measureText(label).width + 80;
  rrect(ctx, -w / 2, -100, w, 200, 24); ctx.lineWidth = 18; ctx.strokeStyle = '#d8231f'; ctx.stroke();
  rrect(ctx, -w / 2 + 18, -82, w - 36, 164, 14); ctx.lineWidth = 6; ctx.stroke();
  text(ctx, label, 0, 8, 130, '#d8231f', INK, 0, 'Poppins', 700);
  ctx.restore();
}
// brick row-house facade
function brickHouse(ctx, x, base, w, h, col = '#b5523a', tint = 0, lit = 0) {
  const c = mix(col, '#140c10', tint);
  rrect(ctx, x, base - h, w, h, 4); fillStroke(ctx, c, 6);
  ctx.save(); rrect(ctx, x, base - h, w, h, 4); ctx.clip();
  ctx.strokeStyle = mix('#8a3a28', '#0a0608', tint); ctx.lineWidth = 3;
  for (let yy = base - h + 30; yy < base; yy += 30) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  ctx.fillStyle = 'rgba(30,10,20,.18)'; ctx.fillRect(x + w * .75, base - h, w * .25, h);
  ctx.restore();
  rrect(ctx, x - 10, base - h - 26, w + 20, 30, 4); fillStroke(ctx, mix('#e8dcc4', '#201820', tint), 5);
  const cols = Math.max(1, Math.floor(w / 110));
  for (let r = 0; r < Math.floor((h - 180) / 170); r++) for (let k = 0; k < cols; k++) {
    const wx = x + (k + .5) * w / cols - 32, wy = base - h + 40 + r * 170;
    rrect(ctx, wx - 6, wy - 6, 76, 116, 4); fillStroke(ctx, mix('#f2ead8', '#2a2026', tint), 4);
    rrect(ctx, wx, wy, 64, 104, 3); fillStroke(ctx, lit ? '#ffcf6a' : mix('#8fc8e8', '#1a1f3a', tint), 4);
    line(ctx, wx + 32, wy, wx + 32, wy + 104, 4, mix('#f2ead8', '#2a2026', tint));
  }
  rrect(ctx, x + w / 2 - 40, base - 160, 80, 160, [40, 40, 0, 0]); fillStroke(ctx, mix('#2f5a3a', '#0a100c', tint), 5);
}
// cobbled street
function street(ctx, y, tint = 0) {
  ctx.fillStyle = mix('#b9aa94', '#151018', tint); ctx.fillRect(-1200, y, 3500, 2200); line(ctx, -1200, y, 2300, y, 6);
  ctx.fillStyle = mix('#9a8a74', '#100c12', tint); ctx.fillRect(-1200, y + 70, 3500, 2200); line(ctx, -1200, y + 70, 2300, y + 70, 5);
  const R = rng(31); ctx.strokeStyle = mix('#857560', '#0c080c', tint); ctx.lineWidth = 4;
  for (let i = 0; i < 70; i++) { const xx = R() * 2600 - 700, yy = y + 110 + R() * 900; ellipse(ctx, xx, yy, 26 + R() * 14, 12 + R() * 6); ctx.stroke(); }
}
// the giant (fictional) telescope: tube on a wooden A-frame; ang = tilt from horizontal (radians, up is negative)
function bigTelescope(ctx, x, y, s, ang = -.9, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // A-frame
  for (const dx of [-170, 170]) { ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx * .25, -560); ctx.lineWidth = 30; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 18; ctx.strokeStyle = '#a0683a'; ctx.stroke(); }
  for (let k = 1; k < 4; k++) { const yy = -k * 140, hw = 170 - k * 32; line(ctx, -hw, yy, hw, yy, 22, INK); line(ctx, -hw, yy, hw, yy, 12, '#a0683a'); }
  // tube
  ctx.save(); ctx.translate(0, -560); ctx.rotate(ang);
  rrect(ctx, -420, -60, 1100, 120, 30); fillStroke(ctx, '#c9a14a', 8);
  ctx.save(); rrect(ctx, -420, -60, 1100, 120, 30); ctx.clip(); ctx.fillStyle = 'rgba(80,40,10,.25)'; ctx.fillRect(-420, 10, 1100, 60); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-420, -45, 1100, 14); ctx.restore();
  for (const bx of [-300, 0, 300, 560]) { rrect(ctx, bx, -70, 34, 140, 8); fillStroke(ctx, '#8a5a2a', 6); }
  rrect(ctx, 660, -90, 70, 180, 16); fillStroke(ctx, '#8a5a2a', 7);
  ellipse(ctx, 720, 0, 22, 80); fillStroke(ctx, '#9fe0ff', 6);
  ellipse(ctx, 716, -24, 6, 24); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
  rrect(ctx, -470, -26, 60, 52, 10); fillStroke(ctx, '#6a4a2a', 6);
  ctx.restore();
  circle(ctx, 0, -560, 36); fillStroke(ctx, '#6a4a2a', 7);
  ctx.restore();
}
// small brass telescope on a tripod (Herschel's real kit)
function smallScope(ctx, x, y, s, ang = -.5) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (const dx of [-80, 0, 80]) line(ctx, 0, -260, dx, 0, 14, '#6a4a2a');
  ctx.translate(0, -270); ctx.rotate(ang);
  rrect(ctx, -140, -26, 330, 52, 18); fillStroke(ctx, '#d9b04a', 7);
  rrect(ctx, 170, -34, 40, 68, 10); fillStroke(ctx, '#a0782a', 6);
  ctx.restore();
}
// lunar landscape for the telescope view; pan 0.. shifts the land, k = what is revealed
function moonland(ctx, t, pan = 0, o = {}) {
  // sky above the moon: black with Earth
  drawSky(ctx, '#05061a', '#1a1d4a', -400, 900);
  const R = rng(5); for (let i = 0; i < 50; i++) { circle(ctx, R() * 1400 - 160, R() * 700 - 100, 2 + R() * 3); ctx.fillStyle = 'rgba(255,255,230,.8)'; ctx.fill(); }
  if (o.earth !== false) { circle(ctx, 820 - pan * .1, 300, 90); fillStroke(ctx, '#3a8fe0', 7); ctx.save(); circle(ctx, 820 - pan * .1, 300, 90); ctx.clip(); ctx.fillStyle = '#4fbf5a'; ellipse(ctx, 790 - pan * .1, 280, 50, 34, .4); ctx.fill(); ellipse(ctx, 860 - pan * .1, 340, 30, 22); ctx.fill(); ctx.fillStyle = 'rgba(0,0,30,.35)'; ctx.fillRect(840 - pan * .1, 200, 120, 220); ctx.restore(); }
  // far hills (pale purple)
  ctx.beginPath(); ctx.moveTo(-600, 900); for (let x = -600; x <= 2200; x += 160) ctx.lineTo(x - pan * .4, 760 - Math.abs(Math.sin(x * .013)) * 160); ctx.lineTo(2200, 1400); ctx.lineTo(-600, 1400); ctx.closePath(); fillStroke(ctx, '#b9a6d8', 6);
  // sea band
  if (o.sea !== false) { ctx.beginPath(); ctx.moveTo(-600, 900); ctx.quadraticCurveTo(500 - pan * .6, 860, 2200, 910); ctx.lineTo(2200, 1010); ctx.quadraticCurveTo(500 - pan * .6, 1040, -600, 1000); ctx.closePath(); fillStroke(ctx, '#3fb6d8', 6);
    for (let i = 0; i < 7; i++) { const wx = ((i * 260 - pan * .6 + t * 30) % 1800) - 300; ctx.beginPath(); ctx.arc(wx, 960, 22, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 5; ctx.strokeStyle = '#e8fbff'; ctx.stroke(); } }
  // ground
  const g = ctx.createLinearGradient(0, 980, 0, 2000); g.addColorStop(0, '#e8d9a8'); g.addColorStop(1, '#c9b07a');
  ctx.beginPath(); ctx.moveTo(-600, 1010); ctx.quadraticCurveTo(400 - pan, 970, 2200, 1020); ctx.lineTo(2200, 2600); ctx.lineTo(-600, 2600); ctx.closePath(); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  const R2 = rng(12); for (let i = 0; i < 9; i++) { const cx = R2() * 2000 - 400 - pan, cy = 1150 + R2() * 700; ellipse(ctx, cx, cy, 60 + R2() * 50, 18 + R2() * 12); ctx.fillStyle = 'rgba(150,120,70,.35)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(110,80,40,.5)'; ctx.stroke(); }
}
// round forest tree for the moon (purple-teal)
function moonTree(ctx, x, y, s, sway = 0, col = '#3aa58a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(sway);
  rrect(ctx, -12, -120, 24, 120, 6); fillStroke(ctx, '#7a4a2a', 5);
  circle(ctx, 0, -170, 80); fillStroke(ctx, col, 6); circle(ctx, -45, -135, 50); fillStroke(ctx, col, 6); circle(ctx, 45, -135, 50); fillStroke(ctx, col, 6);
  circle(ctx, -20, -195, 26); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill();
  ctx.restore();
}
// brown bison-like beast, walking (phase p)
function drawBison(ctx, x, y, s, t, flip = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * flip, s);
  ellipse(ctx, 0, 6, 120, 18); ctx.fillStyle = 'rgba(40,20,30,.22)'; ctx.fill();
  const leg = (lx, ph) => { const a = Math.sin(t * 8 + ph) * .35; ctx.save(); ctx.translate(lx, -70); ctx.rotate(a); rrect(ctx, -12, 0, 24, 72, 10); fillStroke(ctx, '#5a3420', 5); ctx.restore(); };
  leg(-60, 0); leg(50, Math.PI);
  ctx.beginPath(); ctx.ellipse(-10, -110, 105, 60, 0, 0, TAU); fillStroke(ctx, '#8a5530', 7);
  ctx.beginPath(); ctx.ellipse(45, -140, 70, 62, -.3, 0, TAU); fillStroke(ctx, '#6a3a20', 7); // hump
  ctx.beginPath(); ctx.ellipse(100, -100, 42, 40, 0, 0, TAU); fillStroke(ctx, '#5a2e18', 7); // head
  ctx.beginPath(); ctx.moveTo(110, -135); ctx.quadraticCurveTo(140, -165, 128, -175); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = '#f2ead8'; ctx.stroke();
  circle(ctx, 112, -108, 9); ctx.fillStyle = '#fff'; ctx.fill(); circle(ctx, 115, -108, 5); ctx.fillStyle = INK; ctx.fill();
  leg(-40, Math.PI); leg(70, 0);
  ctx.beginPath(); ctx.moveTo(-112, -120); ctx.quadraticCurveTo(-135, -100, -128, -70); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// blue goat with a single horn
function drawUnigoat(ctx, x, y, s, t, flip = 1, hop = 0) {
  ctx.save(); ctx.translate(x, y - hop); ctx.scale(s * flip, s);
  ctx.save(); ctx.translate(0, hop); ellipse(ctx, 0, 6, 80, 14); ctx.fillStyle = 'rgba(40,20,30,.22)'; ctx.fill(); ctx.restore();
  const leg = (lx, ph) => { const a = Math.sin(t * 9 + ph) * .3; ctx.save(); ctx.translate(lx, -70); ctx.rotate(a); line(ctx, 0, 0, 0, 68, 14, INK); line(ctx, 0, 0, 0, 64, 7, '#5a8fd8'); rrect(ctx, -9, 60, 18, 12, 4); ctx.fillStyle = INK; ctx.fill(); ctx.restore(); };
  leg(-45, 0); leg(40, Math.PI);
  ellipse(ctx, 0, -95, 75, 42); fillStroke(ctx, '#6aa6f0', 7);
  ctx.save(); ellipse(ctx, 0, -95, 75, 42); ctx.clip(); ctx.fillStyle = 'rgba(20,30,90,.2)'; ctx.fillRect(-80, -80, 160, 40); ctx.restore();
  ctx.beginPath(); ctx.moveTo(45, -110); ctx.lineTo(70, -170); ctx.lineTo(100, -160); ctx.lineTo(70, -100); ctx.closePath(); fillStroke(ctx, '#6aa6f0', 7); // neck
  ellipse(ctx, 95, -175, 36, 26, .3); fillStroke(ctx, '#6aa6f0', 7);
  // single horn
  ctx.beginPath(); ctx.moveTo(85, -195); ctx.lineTo(110, -275); ctx.lineTo(102, -192); ctx.closePath(); fillStroke(ctx, '#ffe14d', 6);
  for (let k = 0; k < 3; k++) line(ctx, 90 + k * 5, -215 - k * 18, 104 + k * 2, -218 - k * 18, 3);
  ctx.beginPath(); ctx.moveTo(78, -190); ctx.lineTo(60, -210); ctx.lineTo(72, -182); ctx.closePath(); fillStroke(ctx, '#5a8fd8', 5); // ear
  circle(ctx, 104, -180, 8); ctx.fillStyle = '#fff'; ctx.fill(); circle(ctx, 107, -180, 4.5); ctx.fillStyle = INK; ctx.fill();
  ctx.beginPath(); ctx.moveTo(112, -155); ctx.quadraticCurveTo(112, -132, 104, -126); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#f2ead8'; ctx.stroke(); // beard
  leg(-30, Math.PI); leg(55, 0);
  ctx.beginPath(); ctx.moveTo(-72, -105); ctx.quadraticCurveTo(-95, -125, -88, -140); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// bat wings behind a stick figure: shoulders at (x, y) world, span s, flap 0..1
function batWings(ctx, x, y, s, flap) {
  const up = Math.sin(flap * TAU) * .5;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(x, y); ctx.scale(side * s, s); ctx.rotate(-up);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(.55, -.35); ctx.lineTo(1.0, -.12);
    ctx.quadraticCurveTo(.9, .02, .95, .2); ctx.quadraticCurveTo(.78, .1, .7, .3); ctx.quadraticCurveTo(.55, .15, .45, .35); ctx.quadraticCurveTo(.3, .15, 0, .25); ctx.closePath();
    ctx.fillStyle = '#6a3a5a'; ctx.fill(); ctx.lineWidth = .025; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(.55, -.35); ctx.lineTo(.95, .2); ctx.moveTo(.55, -.35); ctx.lineTo(.7, .3); ctx.moveTo(.55, -.35); ctx.lineTo(.45, .35); ctx.lineWidth = .014; ctx.stroke();
    ctx.restore();
  }
}
// a flying man-bat: wings + stick body with dangling legs
function manBat(ctx, x, y, s, t, seed = 0, o = {}) {
  const flap = (t * 2.2 + seed * .37) % 1;
  const bob = Math.sin(flap * TAU) * s * .03;
  batWings(ctx, x, y - s * .53 + bob, s * .75, flap);
  drawStick(ctx, C(BATFOLK, { x, y: y + bob, s, shadow: false, flip: o.flip || 1, lean: o.lean || .15,
    arms: { L: [2.0 + Math.sin(flap * TAU) * .3, -.3], R: [2.0 - Math.sin(flap * TAU) * .3, -.3] },
    legs: { L: [.25, -.5], R: [-.1, -.6] }, face: o.face || { eyes: 'happy', mouth: 'grin' } }));
}
// a pile of newspapers
function paperStack(ctx, x, y, n, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < n; i++) { const yy = -i * 22, dx = Math.sin(i * 2.3) * 12; rrect(ctx, -170 + dx, yy - 22, 340, 26, 6); fillStroke(ctx, i % 2 ? '#f2ead8' : '#fbf6e6', 5); line(ctx, -130 + dx, yy - 9, 120 + dx, yy - 9, 3, '#b0a090'); }
  ctx.restore();
}
// speech bubble with a word
function bubble(ctx, x, y, s, word, a = 1, tail = [-1, 1]) {
  if (s <= 0 || a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = '700 70px Poppins'; const w = ctx.measureText(word).width + 90;
  ctx.beginPath(); ctx.roundRect(-w / 2, -70, w, 140, 60); ctx.moveTo(tail[0] * 40, 60); ctx.lineTo(tail[0] * 80, 130); ctx.lineTo(tail[0] * 0, 66);
  fillStroke(ctx, '#fff', 8);
  rrect(ctx, -w / 2 + 6, -64, w - 12, 128, 56); ctx.fillStyle = '#fff'; ctx.fill();
  text(ctx, word, 0, 4, 70, INK, INK, 0, 'Poppins', 700);
  ctx.restore();
}
function newsstand(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -260, -260, 520, 260, 10); fillStroke(ctx, '#2f7a4a', 7);
  ctx.save(); rrect(ctx, -260, -260, 520, 260, 10); ctx.clip(); ctx.fillStyle = 'rgba(0,30,10,.25)'; ctx.fillRect(100, -260, 200, 260); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-300, -260); ctx.lineTo(300, -260); ctx.lineTo(260, -330); ctx.lineTo(-260, -330); ctx.closePath(); fillStroke(ctx, '#e0392f', 7);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-300, -260); ctx.lineTo(300, -260); ctx.lineTo(260, -330); ctx.lineTo(-260, -330); ctx.closePath(); ctx.clip(); ctx.fillStyle = '#fff'; for (let i = -6; i < 6; i += 2) { ctx.beginPath(); ctx.moveTo(i * 50, -260); ctx.lineTo(i * 50 + 50, -260); ctx.lineTo(i * 46 + 46, -330); ctx.lineTo(i * 46, -330); ctx.closePath(); ctx.fill(); } ctx.restore();
  ctx.beginPath(); ctx.moveTo(-300, -260); ctx.lineTo(300, -260); ctx.lineTo(260, -330); ctx.lineTo(-260, -330); ctx.closePath(); fillStroke(ctx, null, 7);
  rrect(ctx, -170, -235, 340, 70, 10); fillStroke(ctx, '#f6efdc', 6); text(ctx, 'THE SUN', 0, -198, 50, INK, INK, 0, 'Lora', 700);
  ctx.restore();
}
