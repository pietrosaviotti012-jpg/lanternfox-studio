// ---------- Flight 19 (1945): props ----------
// people
const PILOT = { cols: ['#8a5a34', '#8a5a34'], hat: 'pilot', belt: true };
const PILOTS = [PILOT, { cols: ['#6f4a2c', '#6f4a2c'], hat: 'pilot', belt: true }, { cols: ['#556b3a', '#556b3a'], hat: 'pilot', belt: true }];
const RADIOMAN = { cols: ['#3d5f8f', '#3d5f8f'], hat: 'none', belt: true };
const SAILOR = { cols: PAL.navy, hat: 'sailor', belt: true };
const ADMIRAL = { cols: ['#1f2a4a', '#1f2a4a'], vest: '#e8c04a', hat: 'navycap', belt: true };

// leather flying helmet with goggles (front view), used by drawStick via o.hat === 'pilot'
function drawPilotCap(ctx, hx, hy, hr, lw) {
  const shape = () => { ctx.beginPath(); ctx.arc(hx, hy, hr + .012, Math.PI + .25, -.25); ctx.quadraticCurveTo(hx + hr * .6, hy - hr * .35, hx, hy - hr * .4); ctx.quadraticCurveTo(hx - hr * .6, hy - hr * .35, hx - (hr + .012) * Math.cos(.25), hy - (hr + .012) * Math.sin(.25)); ctx.closePath(); };
  // ear flaps
  for (const side of [-1, 1]) { rrect(ctx, hx + side * hr * .93 - .03, hy - hr * .3, .06, hr * .75, .03); fillStroke(ctx, '#7a4a2a', lw); }
  shape(); fillStroke(ctx, '#7a4a2a', lw);
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.14)'; ellipse(ctx, hx - hr * .35, hy - hr * .8, hr * .3, hr * .12, -.3); ctx.fill(); ctx.restore();
  // goggles up on the forehead
  line(ctx, hx - hr * .95, hy - hr * .55, hx + hr * .95, hy - hr * .55, .02, '#3a2418');
  for (const side of [-1, 1]) { circle(ctx, hx + side * hr * .33, hy - hr * .6, hr * .22); fillStroke(ctx, '#9fd8f2', lw); circle(ctx, hx + side * hr * .33 - hr * .06, hy - hr * .66, hr * .07); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill(); }
}

// palm tree
function drawPalm(ctx, x, y, s, t, tint = 0, sway = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sw = Math.sin(t * 1.4 + x * .01) * .04 + sway;
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.quadraticCurveTo(-30 + sw * 200, -200, 20 + sw * 400, -400); ctx.lineTo(42 + sw * 400, -396); ctx.quadraticCurveTo(0 + sw * 200, -200, 16, 0); ctx.closePath(); fillStroke(ctx, mix('#b07a46', '#141018', tint), 5);
  const tx = 30 + sw * 400, ty = -400;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * .6 + Math.sin(t * 2 + i) * .04;
    const ex = tx + Math.cos(a) * 180, ey = ty + Math.sin(a) * 100 + 60;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * 110, ty + Math.sin(a) * 110 - 30, ex, ey);
    ctx.quadraticCurveTo(tx + Math.cos(a) * 90, ty + Math.sin(a) * 70, tx, ty + 6); ctx.closePath(); fillStroke(ctx, mix('#3fae55', '#121a14', tint), 5);
  }
  circle(ctx, tx - 8, ty + 12, 12); fillStroke(ctx, mix('#7a4a2a', '#100c0c', tint), 4); circle(ctx, tx + 12, ty + 14, 12); fillStroke(ctx, mix('#7a4a2a', '#100c0c', tint), 4);
  ctx.restore();
}

// TBM Avenger, side view facing right. o: {flip, ang, num, pilot, tint, prop}
function drawAvenger(ctx, x, y, s, t, o = {}) {
  const tint = o.tint || 0, lw = 6;
  const body = mix(o.col || '#3d63a6', '#0c0e18', tint), dark = mix('#24406f', '#07080e', tint), belly = mix('#d7dee8', '#1a1c26', tint);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s * (o.flip || 1), s);
  // far wing
  ellipse(ctx, 0, -18, 150, 22, -.04); fillStroke(ctx, dark, lw);
  // tail fin + stabiliser
  path(ctx, [[-190, -40], [-262, -150], [-222, -158], [-140, -46]]); fillStroke(ctx, body, lw);
  ellipse(ctx, -222, 0, 70, 14, .05); fillStroke(ctx, dark, lw);
  // fuselage
  const fus = () => { ctx.beginPath(); ctx.moveTo(200, -52); ctx.quadraticCurveTo(80, -84, -60, -74); ctx.lineTo(-258, -30); ctx.lineTo(-262, 6); ctx.quadraticCurveTo(-100, 52, 90, 56); ctx.quadraticCurveTo(195, 56, 210, 12); ctx.closePath(); };
  fus(); ctx.fillStyle = body; ctx.fill();
  ctx.save(); fus(); ctx.clip(); ctx.fillStyle = belly; ctx.fillRect(-300, 18, 560, 60); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-300, -70, 560, 22); ctx.restore();
  fus(); fillStroke(ctx, null, lw);
  // long greenhouse canopy
  const can = () => { ctx.beginPath(); ctx.moveTo(110, -66); ctx.quadraticCurveTo(70, -122, 0, -124); ctx.lineTo(-90, -116); ctx.quadraticCurveTo(-120, -100, -125, -72); ctx.closePath(); };
  can(); ctx.fillStyle = mix('#bfe6f8', '#2a3550', tint); ctx.fill();
  if (o.pilot !== false) {
    ctx.save(); can(); ctx.clip();
    circle(ctx, 48, -92, 26); ctx.fillStyle = HEAD; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(48, -92, 28, Math.PI + .3, -.3); ctx.lineTo(48, -96); ctx.closePath(); fillStroke(ctx, '#7a4a2a', 4);
    circle(ctx, 60, -90, 4.5); ctx.fillStyle = INK; ctx.fill();
    ctx.restore();
  }
  ctx.save(); can(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-130, -124, 260, 14); ctx.restore();
  can(); fillStroke(ctx, null, lw);
  for (const fx of [70, 20, -40, -90]) line(ctx, fx, -122, fx + 6, -70, 4, INK);
  // rear ball turret
  circle(ctx, -122, -82, 26); fillStroke(ctx, mix('#bfe6f8', '#2a3550', tint), lw);
  // star insignia
  circle(ctx, -150, 4, 26); fillStroke(ctx, mix('#1d2e66', '#05060c', tint), 4);
  star5(ctx, -150, 5, 21, 0, mix('#ffffff', '#3a3a44', tint));
  // near wing
  ellipse(ctx, 40, 22, 160, 26, .05); fillStroke(ctx, body, lw);
  ctx.save(); ellipse(ctx, 40, 22, 160, 26, .05); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-130, 30, 340, 30); ctx.restore();
  // tail number
  if (o.num) text(ctx, String(o.num), -205, -60, 34, mix('#ffffff', '#3a3a44', tint), INK, 0, 'Poppins', 700);
  // engine cowling + prop
  rrect(ctx, 180, -56, 50, 112, 22); fillStroke(ctx, dark, lw);
  ellipse(ctx, 240, 0, 16, 18); fillStroke(ctx, '#e8c04a', 4);
  const spin = o.prop == null ? 1 : o.prop;
  if (spin > .3) { ellipse(ctx, 246, 0, 12, 120); ctx.fillStyle = `rgba(230,240,255,${.35 * spin})`; ctx.fill(); }
  const pa = Math.cos(t * (spin > .3 ? 47 : 3 * spin));
  ctx.fillStyle = INK; rrect(ctx, 240, Math.min(-118 * pa, 118 * pa), 12, Math.abs(236 * pa) + 2, 6); ctx.fill();
  ctx.restore();
}

// PBM Mariner flying boat, side view facing right (gull wing, twin tail)
function drawMariner(ctx, x, y, s, t, o = {}) {
  const tint = o.tint || 0, lw = 6;
  const body = mix('#3d5f8c', '#0a0d16', tint), dark = mix('#25395a', '#06070c', tint), belly = mix('#dde3ea', '#1a1c26', tint);
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.ang || 0); ctx.scale(s, s);
  // twin tail fins (far one first)
  for (const dx of [-8, 0]) { path(ctx, [[-300 + dx, -130], [-330 + dx, -250], [-290 + dx, -255], [-250 + dx, -130]]); fillStroke(ctx, dx ? dark : body, lw); }
  ellipse(ctx, -280, -130, 80, 13); fillStroke(ctx, dark, lw);
  // boat hull
  const hull = () => { ctx.beginPath(); ctx.moveTo(250, -20); ctx.quadraticCurveTo(250, -95, 170, -110); ctx.lineTo(-280, -140); ctx.lineTo(-300, -110); ctx.quadraticCurveTo(-150, -50, -10, 30); ctx.lineTo(10, 50); ctx.quadraticCurveTo(160, 50, 250, -20); ctx.closePath(); };
  hull(); ctx.fillStyle = body; ctx.fill();
  ctx.save(); hull(); ctx.clip(); ctx.fillStyle = belly; ctx.beginPath(); ctx.moveTo(260, -10); ctx.quadraticCurveTo(100, 0, -300, -100); ctx.lineTo(-300, 80); ctx.lineTo(260, 80); ctx.fill(); ctx.restore();
  hull(); fillStroke(ctx, null, lw);
  // windows
  ctx.fillStyle = mix('#bfe6f8', '#ffcf6a', o.lit || 0);
  rrect(ctx, 150, -100, 60, 28, 8); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  for (let i = 0; i < 4; i++) { circle(ctx, 70 - i * 60, -75 - i * 3, 9); ctx.fill(); ctx.stroke(); }
  star5(ctx, -120, -70, 22, 0, mix('#ffffff', '#3a3a44', tint));
  // gull wing (thick bar above hull) with the inner bend
  ctx.beginPath(); ctx.moveTo(-60, -150); ctx.lineTo(160, -168); ctx.lineTo(170, -150); ctx.lineTo(-60, -132); ctx.closePath(); fillStroke(ctx, body, lw);
  path(ctx, [[30, -112], [60, -150], [80, -150], [60, -108]]); fillStroke(ctx, dark, 5);
  // engine nacelle + prop
  ellipse(ctx, 110, -160, 80, 26); fillStroke(ctx, dark, lw);
  const spin = o.prop == null ? 1 : o.prop;
  if (spin > .3) { ellipse(ctx, 196, -160, 10, 95); ctx.fillStyle = `rgba(230,240,255,${.35 * spin})`; ctx.fill(); }
  const pa = Math.cos(t * (spin > .3 ? 47 : 3));
  ctx.fillStyle = INK; rrect(ctx, 190, -160 + Math.min(-90 * pa, 90 * pa), 11, Math.abs(180 * pa) + 2, 5); ctx.fill();
  // wing-tip float
  line(ctx, -40, -140, -40, -40, 5, INK); ellipse(ctx, -40, -30, 40, 12); fillStroke(ctx, belly, 5);
  ctx.restore();
}

// 1940s freighter, side view facing right
function drawFreighter(ctx, x, y, s, t, o = {}) {
  const tint = o.tint || 0, lw = 6;
  ctx.save(); ctx.translate(x, y + Math.sin(t * 1.4) * 6 * s); ctx.rotate(Math.sin(t * 1.1) * .012); ctx.scale(s * (o.flip || 1), s);
  rrect(ctx, -60, -260, 50, 110, 8); fillStroke(ctx, mix('#e0392f', '#140c0c', tint), lw);
  ctx.fillStyle = mix('#221c22', '#000', tint); ctx.fillRect(-60, -260, 50, 22);
  rrect(ctx, -170, -180, 230, 90, 8); fillStroke(ctx, mix('#f2ede2', '#2a2a32', tint), lw);
  ctx.fillStyle = mix('#8fcbe8', '#ffcf6a', o.lit || 0); for (let i = 0; i < 5; i++) { rrect(ctx, -150 + i * 42, -160, 26, 22, 4); ctx.fill(); }
  line(ctx, 190, -260, 190, -90, 8, mix('#5a4a3a', '#000', tint)); line(ctx, -300, -230, -300, -90, 8, mix('#5a4a3a', '#000', tint));
  ctx.beginPath(); ctx.moveTo(-380, -100); ctx.lineTo(330, -100); ctx.lineTo(400, -150); ctx.lineTo(360, 20); ctx.quadraticCurveTo(0, 40, -340, 20); ctx.closePath(); fillStroke(ctx, mix('#4a5560', '#0c0e12', tint), lw);
  ctx.save(); ctx.clip(); ctx.fillStyle = mix('#a8352b', '#100808', tint); ctx.fillRect(-400, -10, 820, 60); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ellipse(ctx, 0, 24, 380, 12); ctx.fill();
  ctx.restore();
}

// instruments
function drawCompass(ctx, x, y, r, ang, tint = 0) {
  circle(ctx, x, y, r * 1.12); fillStroke(ctx, '#3a3a44', 8);
  circle(ctx, x, y, r); fillStroke(ctx, mix('#fffaf0', '#2a2a32', tint), 6);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; const k = i % 4 ? .88 : .8; line(ctx, x + Math.cos(a) * r * k, y + Math.sin(a) * r * k, x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95, i % 4 ? 3 : 6); }
  [['N', 0, -1], ['E', 1, 0], ['S', 0, 1], ['W', -1, 0]].forEach(([l, dx, dy]) => text(ctx, l, x + dx * r * .62, y + dy * r * .62, r * .26, l === 'N' ? '#e0392f' : INK, INK, 0, 'Poppins', 700));
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  path(ctx, [[0, -r * .75], [r * .12, 0], [-r * .12, 0]]); fillStroke(ctx, '#e0392f', 4);
  path(ctx, [[0, r * .75], [r * .12, 0], [-r * .12, 0]]); fillStroke(ctx, '#f2ede2', 4);
  ctx.restore();
  circle(ctx, x, y, r * .08); fillStroke(ctx, '#e8c04a', 4);
  ellipse(ctx, x - r * .35, y - r * .45, r * .35, r * .12, -.6); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
}
function drawFuel(ctx, x, y, r, level) {
  circle(ctx, x, y, r * 1.12); fillStroke(ctx, '#3a3a44', 8);
  circle(ctx, x, y, r); fillStroke(ctx, '#fffaf0', 6);
  ctx.beginPath(); ctx.arc(x, y, r * .78, Math.PI * 1.1, Math.PI * 1.3); ctx.lineWidth = r * .12; ctx.strokeStyle = '#e0392f'; ctx.stroke();
  for (let i = 0; i <= 4; i++) { const a = Math.PI * (1.1 + i * .2); line(ctx, x + Math.cos(a) * r * .65, y + Math.sin(a) * r * .65, x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9, 5); }
  text(ctx, 'E', x - r * .62, y + r * .05, r * .3, '#e0392f', INK, 0, 'Poppins', 700); text(ctx, 'F', x + r * .62, y + r * .05, r * .3, INK, INK, 0, 'Poppins', 700);
  text(ctx, 'FUEL', x, y + r * .45, r * .2, INK, INK, 0, 'Poppins', 700);
  const a = Math.PI * (1.1 + clamp(level) * .8);
  line(ctx, x, y, x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8, 9, '#e0392f');
  circle(ctx, x, y, r * .09); fillStroke(ctx, '#3a3a44', 4);
}
// field radio set with a speaker
function drawRadio(ctx, x, y, s, t, glow = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -230, -150, 460, 300, 26); fillStroke(ctx, '#5f6b52', 8);
  rrect(ctx, -200, -120, 200, 240, 16); fillStroke(ctx, '#3a3f34', 6);
  ctx.save(); rrect(ctx, -200, -120, 200, 240, 16); ctx.clip(); for (let i = 0; i < 9; i++) line(ctx, -200, -100 + i * 26, 0, -100 + i * 26, 6, '#262a22'); ctx.restore();
  rrect(ctx, 30, -115, 170, 70, 10); fillStroke(ctx, `rgba(255,${190 + 40 * glow},90,1)`, 5);
  line(ctx, 60 + (Math.sin(t * .7) * .5 + .5) * 110, -110, 60 + (Math.sin(t * .7) * .5 + .5) * 110, -50, 5, '#e0392f');
  for (const [kx, ky] of [[70, 40], [160, 40]]) { circle(ctx, kx, ky, 34); fillStroke(ctx, '#2b2328', 6); line(ctx, kx, ky, kx + Math.cos(t + kx) * 24, ky + Math.sin(t + kx) * 24, 6, '#e8c04a'); }
  circle(ctx, 115, 110, 12); ctx.fillStyle = glow > .2 ? '#ff5a3a' : '#5a2a22'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
// radio waves, k = strength 0..1
function radioWaves(ctx, x, y, s, t, k, dir = -1) {
  if (k <= 0) return;
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.6 + i / 4) % 1; const r = (40 + ph * 220) * s;
    ctx.save(); ctx.globalAlpha = clamp(k * (1 - ph) * 1.4);
    ctx.beginPath(); ctx.arc(x, y, r, dir < 0 ? Math.PI - .6 : -.6, dir < 0 ? Math.PI + .6 : .6);
    ctx.lineWidth = 14 * s; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 7 * s; ctx.strokeStyle = '#ffe14d'; ctx.stroke(); ctx.restore();
  }
}
// headset over a stick head (side bars + cups), drawn after drawStick at head pos
function headset(ctx, hx, hy, hr) {
  ctx.beginPath(); ctx.arc(hx, hy, hr * 1.08, Math.PI + .2, -.2); ctx.lineWidth = hr * .12; ctx.strokeStyle = INK; ctx.stroke();
  for (const side of [-1, 1]) { ellipse(ctx, hx + side * hr * 1.02, hy, hr * .2, hr * .3); fillStroke(ctx, '#3a3f34', hr * .06); }
}
function stars(ctx, t, a = 1, seed = 8) {
  if (a <= 0) return; const R = rng(seed); ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 70; i++) { const x = R() * 1300 - 110, y = R() * 900 - 100, r = 2 + R() * 4; circle(ctx, x, y, r * (.7 + .3 * Math.sin(t * 3 + i))); ctx.fillStyle = '#fff8dc'; ctx.fill(); }
  ctx.restore();
}
function moon(ctx, x, y, r) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, r * .5, x, y, r * 3); g.addColorStop(0, 'rgba(200,220,255,.35)'); g.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); ctx.restore();
  circle(ctx, x, y, r); fillStroke(ctx, '#f4f0dc', 6);
  circle(ctx, x - r * .3, y - r * .2, r * .18); ctx.fillStyle = '#ddd6bc'; ctx.fill(); circle(ctx, x + r * .3, y + r * .3, r * .12); ctx.fill();
}
// stormy night sea with big rolling waves
function nightSea(ctx, horizon, t, rough = 1) {
  const g = ctx.createLinearGradient(0, horizon, 0, horizon + 900); g.addColorStop(0, '#1d3f63'); g.addColorStop(1, '#081626');
  ctx.fillStyle = g; ctx.fillRect(-2000, horizon, 5080, 3000);
  for (let k = 0; k < 4; k++) drawWave(ctx, 540 + k * 60, horizon + 120 + k * 230, 1400, (30 + k * 25) * rough, t * (1 + k * .2) + k * 2, mix('#24557e', '#0d2236', k / 4));
}
// manila folder with a rubber stamp mark
function folder(ctx, x, y, s, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  path(ctx, [[-340, -230], [-120, -230], [-90, -270], [60, -270], [90, -230], [340, -230], [340, 230], [-340, 230]]); fillStroke(ctx, '#e7c27a', 8);
  rrect(ctx, -300, -200, 600, 400, 10); fillStroke(ctx, '#fffaf0', 6);
  for (let i = 0; i < 6; i++) line(ctx, -250, -60 + i * 45, i === 5 ? 60 : 250, -60 + i * 45, 8, '#c9c2b2');
  text(ctx, label, 0, -135, 48, INK, INK, 0, 'Lora', 700);
  ctx.restore();
}
function stampMark(ctx, x, y, s, k, l1, l2) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.14); const sc = s * (1 + (1 - k) * .6); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 1.5);
  rrect(ctx, -300, -110, 600, 220, 20); ctx.lineWidth = 16; ctx.strokeStyle = '#d42a24'; ctx.stroke();
  text(ctx, l1, 0, -40, 82, '#d42a24', INK, 0, 'Poppins', 700); text(ctx, l2, 0, 50, 82, '#d42a24', INK, 0, 'Poppins', 700);
  ctx.restore();
}
function rubberStamp(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -90, -40, 180, 40, 8); fillStroke(ctx, '#7a4a2a', 6);
  rrect(ctx, -26, -170, 52, 135, 14); fillStroke(ctx, '#8a5a34', 6);
  circle(ctx, 0, -190, 45); fillStroke(ctx, '#2b2328', 6);
  rrect(ctx, -100, 0, 200, 22, 6); fillStroke(ctx, '#d42a24', 5);
  ctx.restore();
}

// ---------- map of Florida, the Bahamas and the Caribbean ----------
const MAPLAND = [
  [[-86.5, 34], [-77.5, 34], [-78.5, 33.8], [-79.2, 33.2], [-80.3, 32.4], [-81.1, 31.6], [-81.4, 30.7], [-81.3, 29.8], [-80.6, 28.5], [-80.1, 26.8], [-80.2, 25.4], [-80.9, 25.1], [-81.7, 25.9], [-82.6, 27.5], [-82.8, 28.8], [-83.7, 29.9], [-84.5, 30.0], [-86.5, 30.4]],
  [[-85, 21.8], [-84, 22.7], [-82, 23.1], [-80, 23.1], [-77.5, 21.8], [-75.5, 20.7], [-74.2, 20.2], [-74.5, 19.9], [-77.5, 19.9], [-78, 20.7], [-80, 21.8], [-82, 22.1], [-84.5, 21.5]],
  [[-74.4, 19.8], [-72.8, 19.9], [-71.5, 19.9], [-69.5, 19.4], [-68.4, 18.6], [-70, 18.2], [-71.5, 17.6], [-72.5, 18.2], [-74.4, 18.4]],
  [[-67.2, 18.5], [-65.6, 18.4], [-65.6, 18.0], [-67.2, 18.0]],
];
const BAHAMAS = [[-77.5, 26.6, .9, .25], [-77.8, 24.5, .5, .7], [-76.4, 24.9, .3, .6], [-75.8, 23.6, .4, .25], [-73.5, 22.4, .5, .2], [-78.2, 25.5, .2, .4], [-74.5, 24.0, .2, .3]];
function mapXY(lon, lat, cx, cy, k) { return [cx + (lon + 74) * k, cy - (lat - 25) * k]; }
function drawMap(ctx, cx, cy, k, t, o = {}) {
  const w = 24 * k, h = 18 * k;
  rrect(ctx, cx - w / 2 - 20, cy - h / 2 - 20, w + 40, h + 40, 26); fillStroke(ctx, '#e9dcbc', 10);
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, 12); fillStroke(ctx, o.sea || '#7cc4dc', 6);
  ctx.save(); rrect(ctx, cx - w / 2, cy - h / 2, w, h, 12); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 3;
  for (let lo = -84; lo <= -64; lo += 5) { const [x] = mapXY(lo, 0, cx, cy, k); ctx.beginPath(); ctx.moveTo(x, cy - h); ctx.lineTo(x, cy + h); ctx.stroke(); }
  for (let la = 20; la <= 30; la += 5) { const [, y] = mapXY(0, la, cx, cy, k); ctx.beginPath(); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); ctx.stroke(); }
  for (const poly of MAPLAND) { path(ctx, poly.map(([lo, la]) => mapXY(lo, la, cx, cy, k))); fillStroke(ctx, o.land || '#8fcf6a', 5); }
  for (const [lo, la, rx, ry] of BAHAMAS) { const [x, y] = mapXY(lo, la, cx, cy, k); ellipse(ctx, x, y, rx * k, ry * k, -.5); fillStroke(ctx, o.land || '#8fcf6a', 4); }
  const [bx, by] = mapXY(-64.8, 32.3, cx, cy, k); circle(ctx, bx, by, .3 * k); fillStroke(ctx, o.land || '#8fcf6a', 4);
  ctx.restore();
}

// navy officer's peaked cap (front view), o.hat === 'navycap'
function drawNavyCap(ctx, hx, hy, hr, lw) {
  const top = hy - hr * .62;
  ctx.beginPath(); ctx.moveTo(hx - hr * 1.0, top); ctx.quadraticCurveTo(hx - hr * 1.15, top - hr * .55, hx, top - hr * .62); ctx.quadraticCurveTo(hx + hr * 1.15, top - hr * .55, hx + hr * 1.0, top); ctx.closePath(); fillStroke(ctx, '#f8f8f6', lw);
  rrect(ctx, hx - hr * .95, top - hr * .05, hr * 1.9, hr * .3, .02); fillStroke(ctx, '#1f2a4a', lw);
  ctx.beginPath(); ctx.moveTo(hx - hr * .9, top + hr * .22); ctx.quadraticCurveTo(hx, top + hr * .55, hx + hr * .9, top + hr * .22); ctx.closePath(); fillStroke(ctx, '#151a2a', lw);
  circle(ctx, hx, top + hr * .08, hr * .12); fillStroke(ctx, '#e8c04a', lw * .7);
}
