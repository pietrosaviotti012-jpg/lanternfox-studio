// ---------- Dark Day of 1780: props ----------
// tricorn hat (front view), drawn by drawStick via o.hat === 'tricorn'
function drawTricorn(ctx, hx, hy, hr, lw, col = '#2b2328', trim = '#e8c04a') {
  const top = hy - hr * .66;
  const shape = () => {
    ctx.beginPath(); ctx.moveTo(hx - hr * 1.5, top - hr * .42);
    ctx.quadraticCurveTo(hx - hr * .8, top + hr * .18, hx, top + hr * .26);
    ctx.quadraticCurveTo(hx + hr * .8, top + hr * .18, hx + hr * 1.5, top - hr * .42);
    ctx.quadraticCurveTo(hx + hr * .75, top - hr * .5, hx + hr * .45, top - hr * 1.05);
    ctx.quadraticCurveTo(hx, top - hr * 1.25, hx - hr * .45, top - hr * 1.05);
    ctx.quadraticCurveTo(hx - hr * .75, top - hr * .5, hx - hr * 1.5, top - hr * .42); ctx.closePath();
  };
  shape(); fillStroke(ctx, col, lw);
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ellipse(ctx, hx - hr * .3, top - hr * .7, hr * .35, hr * .18, -.3); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(hx - hr * 1.38, top - hr * .3); ctx.quadraticCurveTo(hx - hr * .8, top + hr * .12, hx, top + hr * .18); ctx.quadraticCurveTo(hx + hr * .8, top + hr * .12, hx + hr * 1.38, top - hr * .3);
  ctx.lineWidth = .012; ctx.strokeStyle = trim; ctx.stroke();
}
// 1780 people
const FARMER = { cols: ['#c8602b', '#c8602b'], hat: 'tricorn', belt: true };
const WIFE = { cols: ['#3d6f8f', '#3d6f8f'], hat: 'coif', belt: false };
const TOWN = [{ cols: ['#7a5a9a', '#7a5a9a'], hat: 'coif', belt: false }, { cols: ['#3f8a4a', '#3f8a4a'], hat: 'tricorn', belt: true }, { cols: ['#d9a12b', '#d9a12b'], hat: 'none', belt: false }, { cols: ['#8c2f2a', '#8c2f2a'], hat: 'tricorn', belt: true }];
const DAV = { cols: ['#2a3f8f', '#2a3f8f'], vest: '#f2ead8', hat: 'tricorn', belt: true };
const LAW = [{ cols: ['#7a2f3a', '#7a2f3a'], hat: 'tricorn', belt: true }, { cols: ['#3f7a4a', '#3f7a4a'], hat: 'tricorn', belt: true }, { cols: ['#6b4a2e', '#6b4a2e'], hat: 'tricorn', belt: true }, { cols: ['#5a4a8a', '#5a4a8a'], hat: 'tricorn', belt: true }];

// sky that goes from blue to a smoky brown-black (k 0..1)
function mix3(a, b, c, k1, k2) { const A = hex2rgb(a), B = hex2rgb(b), Cc = hex2rgb(c); return `rgb(${A.map((v, i) => Math.round(lerp(lerp(v, B[i], k1), Cc[i], k2))).join(',')})`; }
function darkSky(ctx, k) { drawSky(ctx, mix3('#4aaeea', '#c9902f', '#120d10', clamp(k * 1.6), clamp(k * 1.2 - .2)), mix3('#d8f1fb', '#f0c060', '#2a1c14', clamp(k * 1.6), clamp(k * 1.2 - .25))); }
// low smoke clouds drifting over the sky
function smokeBank(ctx, x, y, s, t, k = 1, seed = 1) {
  if (k <= 0) return;
  const col = mix('#8a7a6a', '#2a2026', clamp(k));
  for (let i = 0; i < 5; i++) puff(ctx, x + i * 210 * s + Math.sin(t * .7 + i) * 10, y + (i % 2) * 60 * s, 170 * s, t, col, seed + i, clamp(k * 1.4));
}
// white meeting house with a steeple
function drawChurch(ctx, x, y, s, tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wall = mix('#f6f1e6', '#1a1420', tint), roof = mix('#5a6470', '#101018', tint);
  rrect(ctx, -60, -470, 120, 220, 4); fillStroke(ctx, wall, 6);
  path(ctx, [[-75, -470], [75, -470], [0, -720]]); fillStroke(ctx, roof, 6);
  rrect(ctx, -25, -420, 50, 60, 20); fillStroke(ctx, mix('#2a2430', '#000', tint), 5);
  rrect(ctx, -170, -260, 340, 260, 6); fillStroke(ctx, wall, 6);
  path(ctx, [[-195, -255], [195, -255], [0, -380]]); fillStroke(ctx, roof, 6);
  rrect(ctx, -32, -130, 64, 130, 30); fillStroke(ctx, mix('#7a4a2a', '#100c10', tint), 5);
  for (const wx of [-120, 90]) { rrect(ctx, wx, -200, 34, 70, 14); fillStroke(ctx, o_lit(tint), 5); }
  ctx.fillStyle = 'rgba(40,20,40,.15)'; ctx.fillRect(80, -255, 88, 254);
  ctx.restore();
}
function o_lit(tint) { return tint > .5 ? '#ffcf6a' : mix('#9fd3ef', '#2a2430', tint); }
// cottage with glowing windows (uses env2 drawCottage, then lights the window)
function litCottage(ctx, x, y, s, tint, lit, t) {
  drawCottage(ctx, x, y, s, tint);
  if (lit > 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rrect(ctx, 70, -170, 50, 45, 4); ctx.globalAlpha = lit; fillStroke(ctx, '#ffd36a', 5);
    ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(95, -148, 5, 95, -148, 160);
    g.addColorStop(0, `rgba(255,190,90,${.5 * lit})`); g.addColorStop(1, 'rgba(255,160,60,0)'); ctx.fillStyle = g; ctx.fillRect(-80, -320, 340, 340);
    ctx.restore();
  }
}
// candle with brass holder; lit 0..1
function drawCandle(ctx, x, y, s, lit = 1, t = 0, glowR = 420) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const fl = .92 + Math.sin(t * 21 + x) * .05 + Math.sin(t * 8.3) * .04;
    const g = ctx.createRadialGradient(0, -150, 8, 0, -150, glowR);
    g.addColorStop(0, `rgba(255,200,110,${.6 * lit * fl})`); g.addColorStop(.35, `rgba(255,150,60,${.22 * lit * fl})`); g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g; ctx.fillRect(-glowR, -150 - glowR, glowR * 2, glowR * 2); ctx.restore();
  }
  ellipse(ctx, 0, 0, 52, 14); fillStroke(ctx, '#d9a84a', 5);
  rrect(ctx, -16, -120, 32, 120, 8); fillStroke(ctx, '#fbf3df', 5);
  ctx.save(); rrect(ctx, -16, -120, 32, 120, 8); ctx.clip(); ctx.fillStyle = 'rgba(120,80,40,.18)'; ctx.fillRect(4, -120, 14, 120); ctx.restore();
  line(ctx, 0, -120, 0, -136, 4);
  if (lit > 0) {
    const f = lit * (1 + Math.sin(t * 17 + x * .01) * .08);
    ctx.beginPath(); ctx.moveTo(0, -128); ctx.quadraticCurveTo(-18 * f, -150, 0, -128 - 58 * f); ctx.quadraticCurveTo(18 * f, -150, 0, -128); fillStroke(ctx, '#ffb43a', 4);
    ellipse(ctx, 0, -146, 6 * f, 12 * f); ctx.fillStyle = '#fff6c8'; ctx.fill();
  }
  ctx.restore();
}
// wall clock; h, m in hours/minutes
function drawClock(ctx, x, y, r, h = 12, m = 0, tint = 0) {
  circle(ctx, x, y, r + 14); fillStroke(ctx, mix('#8a5530', '#100c10', tint), 6);
  circle(ctx, x, y, r); fillStroke(ctx, mix('#fbf6ea', '#2a2430', tint), 5);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(ctx, x + Math.sin(a) * r * .8, y - Math.cos(a) * r * .8, x + Math.sin(a) * r * .92, y - Math.cos(a) * r * .92, i % 3 ? 4 : 8); }
  const ah = (h % 12 + m / 60) / 12 * TAU, am = m / 60 * TAU;
  line(ctx, x, y, x + Math.sin(ah) * r * .5, y - Math.cos(ah) * r * .5, 10); line(ctx, x, y, x + Math.sin(am) * r * .75, y - Math.cos(am) * r * .75, 7);
  circle(ctx, x, y, 9); ctx.fillStyle = INK; ctx.fill();
}
// chicken (s ~ 1 => about 160 px tall); o.sleep 0..1 closes the eye
function drawChicken(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip || 1), s); ctx.rotate(o.lean || 0);
  const sl = o.sleep || 0, tint = o.tint || 0;
  if (o.legs !== false) { line(ctx, -12, -30, -18, 0, 6, '#e8902a'); line(ctx, 14, -30, 18, 0, 6, '#e8902a'); line(ctx, -18, 0, -32, 2, 5, '#e8902a'); line(ctx, 18, 0, 32, 2, 5, '#e8902a'); }
  path(ctx, [[-60, -80], [-110, -150], [-100, -95], [-120, -110], [-70, -60]]); fillStroke(ctx, mix('#f3eee2', '#3a3440', tint), 5);
  ellipse(ctx, 0, -70, 72, 52 * (1 - sl * .12)); fillStroke(ctx, mix('#fbf7ef', '#3a3440', tint), 6);
  ctx.save(); ellipse(ctx, 0, -70, 72, 52); ctx.clip(); ctx.fillStyle = 'rgba(40,20,40,.15)'; ctx.fillRect(-80, -55, 160, 60); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-20, -75); ctx.quadraticCurveTo(10, -50, 40, -78); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(60,40,50,.4)'; ctx.stroke();
  const hx = 52, hy = -128 + sl * 22;
  // comb
  ctx.beginPath(); for (const [cx, cy, cr] of [[hx - 12, hy - 30, 12], [hx + 2, hy - 36, 13], [hx + 16, hy - 30, 11]]) { ctx.moveTo(cx + cr, cy); ctx.arc(cx, cy, cr, 0, TAU); } fillStroke(ctx, '#e0392f', 5);
  circle(ctx, hx, hy, 32); fillStroke(ctx, mix('#fbf7ef', '#3a3440', tint), 6);
  path(ctx, [[hx + 28, hy - 6], [hx + 54, hy + 2], [hx + 28, hy + 12]]); fillStroke(ctx, '#f2a52a', 4);
  ellipse(ctx, hx + 22, hy + 26, 8, 13); fillStroke(ctx, '#e0392f', 4);
  if (sl > .5) { ctx.beginPath(); ctx.arc(hx + 10, hy - 4, 9, .2, Math.PI - .2); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); }
  else { circle(ctx, hx + 10, hy - 5, 8); fillStroke(ctx, '#fff', 3); circle(ctx, hx + 12, hy - 5, 4.5); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
}
// small songbird on a branch; open 0..1 opens the beak
function drawBird(ctx, x, y, s, t, open = 0, look = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  line(ctx, -10, -6, -14, 8, 5, '#c07a2a'); line(ctx, 12, -6, 14, 8, 5, '#c07a2a');
  path(ctx, [[-50, -40], [-100, -30], [-90, -10], [-45, -25]]); fillStroke(ctx, '#2f63c9', 5);
  ellipse(ctx, 0, -42, 56, 44); fillStroke(ctx, '#3f7fe0', 6);
  ctx.save(); ellipse(ctx, 0, -42, 56, 44); ctx.clip(); ellipse(ctx, 14, -22, 40, 28); ctx.fillStyle = '#f2b54a'; ctx.fill(); ctx.restore();
  ellipse(ctx, 0, -42, 56, 44); fillStroke(ctx, null, 6);
  const bx = 48;
  path(ctx, [[bx, -62], [bx + 34, -58 - open * 10], [bx, -52]]); fillStroke(ctx, '#f2a52a', 4);
  path(ctx, [[bx, -50], [bx + 30, -46 + open * 14], [bx, -44]]); fillStroke(ctx, '#f2a52a', 4);
  circle(ctx, 22, -60, 10); fillStroke(ctx, '#fff', 3); circle(ctx, 24 + look * 4, -60, 5.5); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}
function note(ctx, x, y, s, a = 1, rot = 0) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ellipse(ctx, 0, 0, 22, 16, -.4); fillStroke(ctx, '#fff', 5); line(ctx, 18, -6, 18, -80, 6, INK);
  ctx.beginPath(); ctx.moveTo(18, -80); ctx.quadraticCurveTo(40, -66, 44, -40); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
}
function zzz(ctx, x, y, s, lt, a = 1) {
  if (a <= 0) return;
  for (let i = 0; i < 3; i++) { const k = ((lt * .9 + i / 3) % 1); ctx.save(); ctx.globalAlpha = a * Math.sin(k * Math.PI); text(ctx, 'z', x + k * 50 * s + i * 6, y - k * 120 * s, (30 + i * 10) * s, '#fff', INK, 6 * s, 'Poppins', 700); ctx.restore(); }
}
// assembly hall: panelled wall, tall windows showing the sky colour, floor
function drawHall(ctx, sky = '#120d10', tint = 0) {
  ctx.fillStyle = mix('#c99a64', '#120c0e', tint); ctx.fillRect(-900, -900, 2900, 2400);
  for (let x = -900; x < 2000; x += 160) line(ctx, x, -900, x, 1500, 5, mix('#a87a48', '#0c0808', tint));
  for (const wx of [-120, 300, 720, 1140]) {
    rrect(ctx, wx - 22, 190, 224, 560, [110, 110, 8, 8]); fillStroke(ctx, mix('#f2ead8', '#2a2026', tint), 7);
    rrect(ctx, wx, 210, 180, 520, [92, 92, 4, 4]); fillStroke(ctx, sky, 6);
    line(ctx, wx + 90, 210, wx + 90, 730, 6, mix('#f2ead8', '#2a2026', tint)); line(ctx, wx, 470, wx + 180, 470, 6, mix('#f2ead8', '#2a2026', tint));
  }
  ctx.fillStyle = mix('#8a5a34', '#0c0808', tint); ctx.fillRect(-900, 900, 2900, 140);
  line(ctx, -900, 900, 2000, 900, 6);
  ctx.fillStyle = mix('#6e4428', '#0a0606', tint); ctx.fillRect(-900, 1040, 2900, 1600);
  for (let i = 0; i < 18; i++) line(ctx, -900, 1040 + i * i * 9, 2000, 1040 + i * i * 9, 4, mix('#5a3620', '#060404', tint));
}
// long assembly table with green cloth; x centre, y top, w width
function drawTable(ctx, x, y, w, tint = 0) {
  rrect(ctx, x - w / 2, y, w, 200, 10); fillStroke(ctx, mix('#2f7a4a', '#0a1410', tint), 7);
  ctx.save(); rrect(ctx, x - w / 2, y, w, 200, 10); ctx.clip(); ctx.fillStyle = 'rgba(0,30,10,.22)'; ctx.fillRect(x - w / 2, y + 40, w, 160); ctx.restore();
  rrect(ctx, x - w / 2 - 20, y - 22, w + 40, 30, 10); fillStroke(ctx, mix('#8a5530', '#100c0c', tint), 6);
  for (const lx of [x - w / 2 + 30, x + w / 2 - 60]) { rrect(ctx, lx, y + 200, 30, 120, 6); fillStroke(ctx, mix('#6e4428', '#100c0c', tint), 5); }
}
function paper(ctx, x, y, s, rot = 0, lines = 4) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rrect(ctx, -70, -50, 140, 100, 6); fillStroke(ctx, '#fbf6e6', 5);
  for (let i = 0; i < lines; i++) line(ctx, -50, -28 + i * 18, 40 - (i % 2) * 20, -28 + i * 18, 4, '#8a7a6a');
  ctx.restore();
}
function quill(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -90, 10, -190); ctx.quadraticCurveTo(30, -100, 0, 0); fillStroke(ctx, '#fbf7ef', 5);
  line(ctx, 0, 0, 8, -150, 3, '#8a7a6a');
  ctx.restore();
}
// flame tongue for wildfire
function flame(ctx, x, y, h, t, seed = 1, a = 1) {
  if (a <= 0 || h <= 1) return;
  const f = 1 + Math.sin(t * 13 + seed * 2.1) * .1 + Math.sin(t * 7.7 + seed) * .06, sw = Math.sin(t * 5 + seed) * h * .08;
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.moveTo(x - h * .35, y); ctx.quadraticCurveTo(x - h * .45, y - h * .55 * f, x + sw, y - h * f); ctx.quadraticCurveTo(x + h * .45, y - h * .55 * f, x + h * .35, y); ctx.closePath(); fillStroke(ctx, '#ff7a22', Math.max(3, h * .04));
  ctx.beginPath(); ctx.moveTo(x - h * .18, y); ctx.quadraticCurveTo(x - h * .22, y - h * .35 * f, x + sw * .6, y - h * .62 * f); ctx.quadraticCurveTo(x + h * .22, y - h * .35 * f, x + h * .18, y); ctx.closePath(); ctx.fillStyle = '#ffd84a'; ctx.fill();
  ctx.restore();
}
function fireGlow(ctx, x, y, r, a) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 10, x, y, r); g.addColorStop(0, `rgba(255,120,40,${.5 * a})`); g.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
// soft fog band (screen space at the camera's y)
function fogBand(ctx, x0, x1, y, h, t, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.filter = 'blur(14px)';
  for (let x = x0; x < x1; x += 140) { ellipse(ctx, x + Math.sin(t * .8 + x * .01) * 20, y + Math.sin(x * .03) * 12, 160, h); ctx.fillStyle = 'rgba(232,232,236,.55)'; ctx.fill(); }
  ctx.restore();
}
// tree stump cross section with growth rings; scar 0..1 highlights the 1780 fire scar
function drawRings(ctx, x, y, r, scar = 0, t = 0) {
  const N = 15, R = rng(21);
  const wob = [...Array(N + 1)].map(() => R() * .04);
  ellipse(ctx, x, y, r * 1.08, r * 1.04); fillStroke(ctx, '#7a4a2a', 8);
  ctx.save(); ellipse(ctx, x, y, r * 1.08, r * 1.04); ctx.clip(); for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; line(ctx, x + Math.cos(a) * r * .99, y + Math.sin(a) * r * .97, x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.08, 5, '#5a3420'); } ctx.restore();
  ellipse(ctx, x, y, r, r * .96); fillStroke(ctx, '#f0cf96', 6);
  for (let i = 1; i <= N; i++) { const rr = r * i / (N + 1) * (1 + wob[i]); ellipse(ctx, x + wob[i] * 20, y, rr, rr * .96); ctx.lineWidth = 4; ctx.strokeStyle = '#c0915a'; ctx.stroke(); }
  // fire scar: dark notch across rings 10..12 on the upper right
  const sr = r * 11 / (N + 1);
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, sr * 1.05, sr * .99, 0, -1.15, -.55); ctx.lineWidth = 22; ctx.strokeStyle = '#3a2418'; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
  const sx = x + Math.cos(-.85) * sr, sy = y + Math.sin(-.85) * sr * .96;
  if (scar > 0) {
    ctx.save(); ctx.globalAlpha = clamp(scar);
    const p = .9 + Math.sin(t * 8) * .06;
    circle(ctx, sx, sy, 95 * p * backOut(clamp(scar))); ctx.lineWidth = 12; ctx.strokeStyle = '#e0392f'; ctx.stroke();
    ctx.restore();
  }
  return [sx, sy];
}
function magnifier(ctx, x, y, r, rot = .7) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  rrect(ctx, -16, r, 32, r * 1.3, 14); fillStroke(ctx, '#7a4a2a', 6);
  circle(ctx, 0, 0, r); ctx.fillStyle = 'rgba(200,235,255,.25)'; ctx.fill(); ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke();
  circle(ctx, 0, 0, r); ctx.lineWidth = 12; ctx.strokeStyle = '#c9cdd6'; ctx.stroke();
  ellipse(ctx, -r * .35, -r * .4, r * .25, r * .1, -.7); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
  ctx.restore();
}
function calendar2(ctx, x, y, s, head, big) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -170, -150, 340, 300, 24); fillStroke(ctx, '#fffaf0', 8);
  ctx.save(); rrect(ctx, -170, -150, 340, 300, 24); ctx.clip(); ctx.fillStyle = '#e0392f'; ctx.fillRect(-170, -150, 340, 86); ctx.restore();
  rrect(ctx, -170, -150, 340, 300, 24); fillStroke(ctx, null, 8);
  for (const rx of [-90, 90]) { rrect(ctx, rx - 10, -175, 20, 50, 10); fillStroke(ctx, '#bbb', 5); }
  text(ctx, head, 0, -106, 52, '#fff', INK, 0, 'Poppins', 700);
  text(ctx, big, 0, 45, 120, INK, INK, 0, 'Poppins', 700);
  ctx.restore();
}
function signpost(ctx, x, y, s, label, tint = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rrect(ctx, -12, -220, 24, 220, 6); fillStroke(ctx, mix('#7a4a2a', '#100c0c', tint), 5);
  ctx.font = '700 46px Lora'; const w = ctx.measureText(label).width + 60;
  rrect(ctx, -w / 2, -300, w, 90, 12); fillStroke(ctx, mix('#d9a96a', '#2a2026', tint), 6);
  text(ctx, label, 0, -254, 46, mix('#3a2014', '#000', tint), INK, 0, 'Lora', 700);
  ctx.restore();
}
function arrowR(ctx, x0, y, x1, a = 1, col = '#fff') {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  line(ctx, x0, y, x1 - 20, y, 22, INK); line(ctx, x0, y, x1 - 20, y, 12, col);
  path(ctx, [[x1 - 40, y - 34], [x1 + 14, y], [x1 - 40, y + 34]]); fillStroke(ctx, col, 7);
  ctx.restore();
}
