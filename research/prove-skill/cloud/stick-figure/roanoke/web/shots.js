// ---------- Roanoke: shot list (seconds of the voiceover) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const wave = (t, sp = 10) => ({ L: [.3, -.1], R: [2.6 + Math.sin(t * sp) * .35, .3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);

// island clearing: sky, sea strip, grass, pines
function islandBG(ctx, t, cam, o = {}) {
  const tint = o.tint || 0;
  applyCam(ctx, cam, .08); drawSky(ctx, o.skyTop || '#4aaeea', o.skyBot || '#d8f1fb');
  if (o.sun !== false) { applyCam(ctx, cam, .1); drawSun(ctx, o.sunX || 860, 260, 70, t, .8 * (1 - tint)); }
  applyCam(ctx, cam, .15);
  drawCloud(ctx, 180 + t * 6, 300, 110, 1, 1 - tint * .5); drawCloud(ctx, 820 + t * 4, 470, 80, 2, 1 - tint * .5);
  applyCam(ctx, cam, .4); drawSea(ctx, 760, t, 600, tint ? ['#5a8aa0', '#2a6a88', '#1a4a6a'] : undefined);
  applyCam(ctx, cam, .55);
  ctx.fillStyle = mix('#f2d79a', '#1a1420', tint); ctx.fillRect(-2000, 830, 5080, 60);
  for (let i = 0; i < 9; i++) drawPine(ctx, -260 + i * 210 + (i % 2) * 60, 900, .9 + (i % 3) * .15, tint * .6 + .1, Math.sin(t * 1.3 + i) * .02);
  applyCam(ctx, cam, 1);
  const g = ctx.createLinearGradient(0, 880, 0, 2000); g.addColorStop(0, mix('#7cc65e', '#101820', tint)); g.addColorStop(1, mix('#4f9e45', '#101820', tint));
  ctx.fillStyle = g; ctx.fillRect(-2000, 880, 5080, 3000);
  ctx.strokeStyle = mix('#3f8a3a', '#101820', tint); ctx.lineWidth = 5; ctx.lineCap = 'round';
  const R = rng(17); for (let i = 0; i < 40; i++) { const x = R() * 1600 - 260, y = 950 + R() * 900; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 22); ctx.moveTo(x + 10, y); ctx.lineTo(x + 14, y - 20); ctx.stroke(); }
}
function seaBG(ctx, t, cam, o = {}) {
  const dark = o.dark || 0;
  applyCam(ctx, cam, .08); drawSky(ctx, mix('#4aaeea', '#2a3346', dark), mix('#d8f1fb', '#5a6478', dark));
  if (!dark) { applyCam(ctx, cam, .1); drawSun(ctx, 860, 300, 80, t, 1); }
  applyCam(ctx, cam, .15);
  for (const [x, y, s, sd] of [[180, 330, 120, 1], [800, 520, 90, 2], [480, 200, 80, 3]]) {
    if (dark) { ctx.save(); cloudShape(ctx, x + t * 8, y, s * 1.4, sd); ctx.fillStyle = mix('#cfd8e6', '#3a4258', dark); ctx.fill(); ctx.restore(); }
    else drawCloud(ctx, x + t * 6, y, s, sd);
  }
  applyCam(ctx, cam, .45); drawSea(ctx, o.horizon || 900, t, 2600, dark ? ['#5a7c92', '#2c5a78', '#18384e'] : undefined);
}

const SHOTS = [];
// A — hook: a colonist waves, then vanishes; his hat drops
SHOTS.push({ start: 0, end: 2.4, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.05 + lt * .06, r: Math.sin(t * .5) * .005 };
  islandBG(ctx, t, cam);
  applyCam(ctx, cam, 1);
  drawCottage(ctx, 860, 1040, 1.1); drawCottage(ctx, 150, 1010, .9);
  const gone = lt > 1.45;
  if (!gone) drawStick(ctx, C(COL.man, { x: 540, y: 1200, s: 620, arms: wave(t), face: { eyes: lt > 1.15 ? 'wide' : 'normal', mouth: lt > 1.15 ? 'o' : 'smile', look: [.2, 0], browUp: lt > 1.15 ? 1 : 0 } }));
  const pa = kf(lt, [[1.45, 1], [2.1, 0]]);
  if (lt > 1.45) { puff(ctx, 540, 900, 150 * (1 + (lt - 1.45) * .8), t, '#f3efe6', 3, pa); puff(ctx, 470, 1100, 90 * (1 + (lt - 1.45)), t, '#f3efe6', 5, pa); }
  // the hat falls to the grass
  if (gone) {
    const k = clamp((lt - 1.45) / .5); const hy = lerp(1200 - .765 * 620 - 60, 1180, easeIn(k)); const rot = k * 1.2;
    ctx.save(); ctx.translate(540 + k * 60, hy); ctx.rotate(rot); ctx.scale(620, 620); drawCapotain(ctx, 0, 0, .19, .017); ctx.restore();
  }
  qmark(ctx, 540, 640, 220 * backOut(clamp((lt - 1.85) / .25)), clamp((lt - 1.85) / .1), Math.sin(t * 3) * .1);
} });
// B1 — 1587: the ship reaches Roanoke Island
SHOTS.push({ start: 2.4, end: 5.1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + lt * 20, y: 960 + hh[1], z: 1 + lt * .04, r: 0 };
  seaBG(ctx, t, cam, { horizon: 900 });
  applyCam(ctx, cam, .6);
  drawIsland(ctx, 930, 1010, 360, 90);
  for (let i = 0; i < 5; i++) drawPine(ctx, 720 + i * 95, 1000 - (i % 2) * 15, .55, .05);
  applyCam(ctx, cam, 1);
  const sx = kf(lt, [[0, 80], [2.7, 470]], x => x);
  drawShip(ctx, sx, 1150, .85, t, { flag: '#f4f4f4', hull: '#8a4a26', ph: 1 });
  // red cross on the flag (England)
  ctx.save(); ctx.translate(sx, 1150 + Math.sin(t * 1.6 + 1) * 3.4); ctx.rotate(Math.sin(t * 1.2 + 1) * .015); ctx.scale(.85, .85);
  rrect(ctx, 50, -610, 12, 60, 2); ctx.fillStyle = '#d62a2a'; ctx.fill(); rrect(ctx, 20, -587, 84, 12, 2); ctx.fill(); ctx.restore();
  // tiny heads on deck
  for (let i = 0; i < 6; i++) { const hx = sx - 150 + i * 50, hy = 1150 - 95 * .85 - 20 + Math.sin(t * 6 + i) * 4; circle(ctx, hx, hy, 17); fillStroke(ctx, HEAD, 4); }
} });
// B2 — 115 colonists settle in; cottages pop up
SHOTS.push({ start: 5.1, end: 8.25, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 980 + hh[1], z: kf(lt, [[0, 1.12], [3.1, 1.0]]), r: 0 };
  islandBG(ctx, t, cam);
  applyCam(ctx, cam, 1);
  const pops = [[180, 1010, .85, 1.25], [540, 990, .95, 1.5], [900, 1010, .85, 1.75]];
  for (const [x, y, s, at] of pops) { const k = backOut(clamp((lt - at) / .3)); if (k > 0) { ctx.save(); ctx.translate(x, y); ctx.scale(1, k); drawCottage(ctx, 0, 0, s); ctx.restore(); } }
  for (let i = 0; i < 5; i++) {
    const x0 = -200 - i * 170, x1 = 140 + i * 200; const x = kf(lt, [[0, x0], [1.4 + i * .1, x1, easeOut]], x => x);
    const walking = lt < 1.4 + i * .1;
    drawStick(ctx, C(CREW[i], { x, y: 1210 + (i % 2) * 30, s: 340, legs: walking ? walkLegs(t + i, 12) : POSE.idle.legs, arms: walking ? walkArms(t + i, 12) : (lt > 2.2 && i % 2 ? wave(t + i) : POSE.idle.arms), face: { eyes: 'normal', mouth: walking ? 'grin' : 'smile', look: [.5, 0] }, bob: walking ? Math.abs(Math.sin((t + i) * 12)) * -.02 : 0 }));
  }
} });
// C — John White sails back to England
SHOTS.push({ start: 8.25, end: 12.1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1 + lt * .03, r: Math.sin(t * 1.2) * .008 };
  seaBG(ctx, t, cam, { horizon: 860 });
  // island drifting away to the left
  applyCam(ctx, cam, .5);
  const ix = kf(lt, [[1.7, 380], [3.85, 40]], x => x), isc = kf(lt, [[1.7, 1], [3.85, .7]]);
  ctx.save(); ctx.translate(ix, 930); ctx.scale(isc, isc);
  drawIsland(ctx, 0, 0, 260, 60); for (let i = 0; i < 3; i++) drawPine(ctx, -140 + i * 120, -10, .4, .05);
  for (let i = 0; i < 4; i++) drawStick(ctx, C(CREW[i], { x: -90 + i * 60, y: 20, s: 90, shadow: false, arms: wave(t + i * .7, 12), face: { eyes: 'normal', mouth: 'smile' } }));
  ctx.restore();
  applyCam(ctx, cam, 1);
  // deck rail in the foreground
  rrect(ctx, -200, 1180, 1500, 900, 0); fillStroke(ctx, '#b8763f', 6);
  for (let i = 0; i < 12; i++) line(ctx, -100 + i * 110, 1180, -100 + i * 110, 2000, 4, 'rgba(90,50,25,.35)');
  drawStick(ctx, C(WHITE, { x: 700, y: 1210, s: 640, flip: -1, arms: lt < 1.6 ? POSE.idle.arms : { L: [.3, -.1], R: [2.5 + Math.sin(t * 9) * .3, .3] }, face: { eyes: 'normal', mouth: lt < 1.6 ? 'smile' : 'flat', look: [.6, 0], browAng: lt > 1.6 ? -.25 : 0 } }));
  rrect(ctx, -200, 1150, 1500, 40, 12); fillStroke(ctx, '#c88b52', 6);
  // little label: England this way
  const la = clamp((lt - 2.5) * 4);
  if (la > 0) { ctx.save(); ctx.globalAlpha = la; rrect(ctx, 640, 420, 300, 100, 20); fillStroke(ctx, '#fffaf0', 6); text(ctx, 'England →', 790, 470, 52, INK, INK, 0, 'Poppins', 700); ctx.restore(); }
} });
// D — war with Spain: three long years
SHOTS.push({ start: 12.1, end: 15.2, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 5);
  const boom = (at) => clamp(1 - (lt - at) / .35) * (lt > at ? 1 : 0);
  const b1 = boom(.35), b2 = boom(.8), b3 = boom(1.25);
  const sk = shake(t, 14 * Math.max(b1, b2, b3), 3);
  const cam = { x: 540 + hh[0] + sk[0], y: 960 + hh[1] + sk[1], z: 1.02 + lt * .03, r: 0 };
  seaBG(ctx, t, cam, { horizon: 900, dark: .35 });
  applyCam(ctx, cam, 1);
  drawShip(ctx, 260, 1180, .62, t, { flag: '#f4f4f4', hull: '#8a4a26', ph: 1 });
  drawShip(ctx, 840, 1160, .62, t, { flag: '#f2c230', hull: '#5a2a3a', stripe: '#d62a2a', ph: 2, flip: -1 });
  for (const [b, x, y, sd] of [[b1, 470, 1080, 1], [b2, 640, 1040, 2], [b3, 540, 1120, 3]]) if (b > 0) { burst(ctx, x, y, 120 * (1.2 - b * .4), 11, '#ffd23a', sd); puff(ctx, x, y - 40, 90 * (1.6 - b), t, '#f3efe6', sd + 4, b); }
  flash(ctx, Math.max(b1, b2, b3) * .25);
  // calendar flips 1587 -> 1590
  const ys = [1587, 1588, 1589, 1590]; const p = clamp((lt - 1.55) / 1.3) * 3; const yi = Math.min(3, Math.floor(p)); const fl = yi < 3 ? Math.max(0, (p - yi) - .85) / .15 : 0;
  const ca = clamp((lt - 1.4) * 5);
  if (ca > 0) { ctx.save(); ctx.globalAlpha = ca; calendar(ctx, 540, 520, .95 * backOut(ca), ys[yi], fl); ctx.restore(); }
} });
// E — 1590: White comes back, the island is empty
SHOTS.push({ start: 15.2, end: 18.95, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + kf(lt, [[0, -60], [3.7, 60]]), y: 980 + hh[1], z: kf(lt, [[0, 1.0], [3.7, 1.12]]), r: 0 };
  islandBG(ctx, t, cam, { skyTop: '#7fa9c9', skyBot: '#e6e2d4', tint: .12 });
  applyCam(ctx, cam, 1);
  // wind blowing a leaf across the empty clearing
  const lx = ((lt * 380) % 1600) - 300; ctx.save(); ctx.translate(lx, 1000 + Math.sin(lt * 5) * 60); ctx.rotate(lt * 6); ellipse(ctx, 0, 0, 26, 12); fillStroke(ctx, '#d9a94a', 4); ctx.restore();
  const shock = lt > 2.6;
  const x = kf(lt, [[0, -150], [1.3, 260, easeOut]], x => x); const walking = lt < 1.3;
  const look = lt < 1.8 ? [.6, 0] : lt < 2.3 ? [-.8, 0] : [.9, 0];
  drawStick(ctx, C(WHITE, { x, y: 1220, s: 620, legs: walking ? walkLegs(t, 11) : POSE.idle.legs, arms: walking ? walkArms(t, 11) : (shock ? POSE.handsUp.arms : POSE.idle.arms), face: shock ? { eyes: 'wide', mouth: 'o', browUp: 1 } : { eyes: 'normal', mouth: 'smile', look }, bob: walking ? Math.abs(Math.sin(t * 11)) * -.02 : 0 }));
  if (shock) { sweat(ctx, x + 150, 1220 - .9 * 620 + (lt - 2.6) * 40, 36, clamp((lt - 2.7) * 3)); text(ctx, '!', x + 210, 640, 140, '#ffe14d', INK, 16, 'Poppins', 700); }
  // dotted outlines where the cottages stood
  ctx.save(); ctx.setLineDash([18, 16]); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.7)';
  for (const [cx, cy] of [[700, 1060], [960, 1020]]) { ctx.beginPath(); ctx.roundRect(cx - 120, cy - 260, 240, 260, 10); ctx.stroke(); }
  ctx.restore();
} });
// F — houses taken down, no sign of a fight
SHOTS.push({ start: 18.95, end: 22.75, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 980 + hh[1], z: kf(lt, [[0, 1.08], [3.8, 1.0]]), r: 0 };
  islandBG(ctx, t, cam, { skyTop: '#7fa9c9', skyBot: '#e6e2d4', tint: .12 });
  applyCam(ctx, cam, 1);
  drawPalisade(ctx, -100, 1200, 960, 170, .1);
  for (const [x, y, s, at] of [[230, 1060, .9, .3], [760, 1080, 1.0, .55]]) { const k = backOut(clamp((lt - at) / .3)); if (k > 0) drawPlanks(ctx, x, y, s * k); }
  drawStick(ctx, C(WHITE, { x: 520, y: 1230, s: 560, headTilt: lt < 2 ? -.08 : .06, arms: lt < 2 ? { L: [.3, -.1], R: { ik: [.05, -.78], bend: -1 } } : POSE.hips.arms, face: { eyes: 'normal', mouth: 'flat', look: lt < 1.2 ? [-.8, .3] : lt < 2 ? [.8, .3] : [0, 0], browAng: -.2 } }));
  // no fight: a sword, crossed out
  const fa = clamp((lt - 2.1) * 4);
  if (fa > 0) {
    ctx.save(); ctx.translate(820, 560); ctx.scale(fa, fa); circle(ctx, 0, 0, 150); fillStroke(ctx, '#fffaf0', 8);
    ctx.save(); ctx.rotate(-.7); rrect(ctx, -14, -110, 28, 170, 8); fillStroke(ctx, '#d8dde6', 6); rrect(ctx, -55, 55, 110, 20, 8); fillStroke(ctx, '#e2b84a', 6); rrect(ctx, -10, 75, 20, 40, 6); fillStroke(ctx, '#7a4a2a', 6); ctx.restore();
    const xa = clamp((lt - 2.4) * 4); line(ctx, -100, -100, -100 + 200 * xa, -100 + 200 * xa, 22, '#e0392f'); if (xa >= 1) line(ctx, 100, -100, 100 - 200 * clamp((lt - 2.65) * 4), -100 + 200 * clamp((lt - 2.65) * 4), 22, '#e0392f');
    ctx.restore();
  }
} });
// G — the carved word
SHOTS.push({ start: 22.75, end: 26.2, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.4, 1.06]]), r: 0 };
  applyCam(ctx, cam, .2); drawSky(ctx, '#7fa9c9', '#e6e2d4');
  applyCam(ctx, cam, .4); for (let i = 0; i < 8; i++) drawPine(ctx, -200 + i * 220, 1300, 1.6, .35);
  applyCam(ctx, cam, .7); ctx.fillStyle = mix('#6fb556', '#101820', .2); ctx.fillRect(-2000, 1480, 5080, 3000); drawPalisade(ctx, -300, 1400, 1500, 600, .25);
  applyCam(ctx, cam, 1);
  const n = kf(lt, [[2.2, 0], [3.15, 8]], x => x);
  drawPost(ctx, 540, 1420, .8, n);
  // wood chips flying off the current letter
  if (n > 0 && n < 8) { const R = rng(Math.floor(n) + 3); for (let i = 0; i < 6; i++) { const f = (n % 1); const a = R() * TAU; ctx.save(); ctx.translate(540 + Math.cos(a) * 120 * f + 40, 1420 + .8 * (-1180 + 132 * Math.floor(n)) - Math.sin(a) * 80 * f + f * f * 90); ctx.rotate(a); rrect(ctx, -10, -5, 20, 10, 3); fillStroke(ctx, '#d9a066', 3); ctx.restore(); } }
  const sa = kf(lt, [[3.15, 0], [3.25, 1], [3.45, 0]]); sparkle(ctx, 640, 470, 60 * sa, sa);
} });
// H — explainer map: Croatoan island and its people
SHOTS.push({ start: 26.2, end: 30.55, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 900 + hh[1] + kf(lt, [[.5, 0], [2.4, 120]]), z: kf(lt, [[0, .95], [4.3, 1.05]]), r: 0 };
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#8fd0e6'; ctx.fillRect(-600, -600, 2400, 3200);
  const R = rng(42); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 40; i++) { const x = R() * 1400 - 160, y = R() * 2000; ctx.beginPath(); ctx.moveTo(x + Math.sin(t + i) * 8, y); ctx.quadraticCurveTo(x + 20, y - 8, x + 40, y); ctx.stroke(); }
  // mainland edge on the left
  ctx.beginPath(); ctx.moveTo(-600, -600); ctx.lineTo(120, -600); ctx.quadraticCurveTo(60, 300, 140, 600); ctx.quadraticCurveTo(40, 1100, 100, 2600); ctx.lineTo(-600, 2600); ctx.closePath(); fillStroke(ctx, '#7cc65e', 7);
  // Roanoke (north) and Croatoan (south)
  drawIsland(ctx, 400, 520, 150, 70); text(ctx, 'ROANOKE', 400, 400, 54, INK, '#fff', 10, 'Poppins', 700);
  ctx.save(); ctx.translate(700, 1030); ctx.rotate(-.35); drawIsland(ctx, 0, 0, 280, 75); ctx.restore();
  for (let i = 0; i < 3; i++) drawPine(ctx, 600 + i * 110, 1040 - i * 38, .35, 0);
  text(ctx, 'CROATOAN', 700, 1190, 54, INK, '#fff', 10, 'Poppins', 700);
  // dotted path
  const dp = clamp((lt - 1.0) / .9);
  ctx.save(); ctx.setLineDash([22, 20]); ctx.lineWidth = 10; ctx.strokeStyle = '#e0392f'; ctx.lineCap = 'round';
  const P = (u) => [lerp(440, 660, u) + Math.sin(u * Math.PI) * 120, lerp(590, 960, u)];
  ctx.beginPath(); for (let u = 0; u <= dp; u += .02) { const [x, y] = P(u); u ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
  // the Croatoan people pop up and wave
  for (let i = 0; i < 3; i++) { const k = backOut(clamp((lt - 2.7 - i * .15) / .3)); if (k > 0) drawStick(ctx, C(i % 2 ? LOCAL2 : LOCAL, { x: 620 + i * 90, y: 1000 - i * 30, s: 190 * k, shadow: false, arms: wave(t + i, 11), face: { eyes: 'happy', mouth: 'grin' } })); }
  const sa = kf(lt, [[2.75, 0], [2.9, 1], [3.3, 0]]); sparkle(ctx, 880, 820, 50 * sa, sa);
} });
// I — theory 1: they went to live with the Croatoan
SHOTS.push({ start: 30.55, end: 33.7, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 980 + hh[1], z: kf(lt, [[0, 1.0], [3.1, 1.1]]), r: 0 };
  islandBG(ctx, t, cam, { skyTop: '#f39a5a', skyBot: '#ffe2b0', sunX: 540 });
  applyCam(ctx, cam, 1);
  campfire(ctx, 540, 1190, 1.1, t);
  const people = [[150, COL.man, 1], [330, LOCAL, 1], [750, LOCAL2, -1], [930, COL.woman, -1]];
  people.forEach(([x, ch, fl], i) => drawStick(ctx, C(ch, { x, y: 1220 + (i % 2) * 20, s: 400, flip: fl, bob: Math.abs(Math.sin(t * 8 + i)) * -.015, arms: lt > 1.4 && i % 2 === 0 ? wave(t + i, 9) : { L: [.5, -.4], R: [.5, -.4] }, face: { eyes: lt > 1.7 ? 'happy' : 'normal', mouth: 'grin', look: [.6, 0] } })));
  for (let i = 0; i < 4; i++) { const k = clamp((lt - 1.7 - i * .2) / 1.2); heart(ctx, 300 + i * 160, 820 - k * 260, 40, k > 0 ? Math.sin(k * Math.PI) : 0); }
} });
// J — theory 2: they tried to sail home and were lost at sea
SHOTS.push({ start: 33.7, end: 36.75, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 5);
  const rough = kf(lt, [[0, .4], [2.2, 1]]);
  const cam = { x: 540 + hh[0], y: 960 + hh[1] + Math.sin(t * 2.2) * 20 * rough, z: 1.02 + lt * .03, r: Math.sin(t * 1.5) * .02 * rough };
  seaBG(ctx, t, cam, { horizon: 860, dark: .7 });
  applyCam(ctx, cam, 1);
  drawWave(ctx, 540, 1170, 900, 50 * rough, t, '#2c5a78');
  const sink = clamp((lt - 2.1) / .8);
  const by = 1130 + Math.sin(t * 3) * 30 * rough + sink * 340, ang = Math.sin(t * 2.5) * .12 * rough + sink * .4;
  ctx.save(); ctx.translate(540, by); ctx.rotate(ang);
  for (let i = 0; i < 3; i++) drawStick(ctx, C(CREW[i], { x: -90 + i * 90, y: -20, s: 200, shadow: false, arms: rough > .8 ? POSE.handsUp.arms : POSE.idle.arms, face: { eyes: 'wide', mouth: rough > .8 ? 'teeth' : 'flat', browUp: 1 } }));
  drawBoat(ctx, 0, 0, 1, t); ctx.restore();
  drawWave(ctx, 540, 1260 - sink * 140, 900, 70 * rough, t + 1, '#1d4f6e');
  rain(ctx, t, rough * .8);
} });
// K — a storm drives White's ships away
SHOTS.push({ start: 36.75, end: 40.8, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 4);
  const fl = kf(lt, [[2.1, 0], [2.15, 1], [2.45, 0]]);
  const sk = shake(t, 16 * fl, 3);
  const cam = { x: 540 + hh[0] + sk[0], y: 960 + hh[1] + sk[1], z: 1 + lt * .03, r: Math.sin(t * 1.4) * .012 };
  seaBG(ctx, t, cam, { horizon: 860, dark: .85 });
  applyCam(ctx, cam, .5);
  const ix = kf(lt, [[2.2, 300], [4.0, 80]]);
  drawIsland(ctx, ix, 930, 200, 50, .4); for (let i = 0; i < 3; i++) drawPine(ctx, ix - 100 + i * 100, 920, .35, .5);
  applyCam(ctx, cam, 1);
  bolt(ctx, 760, 220, 1.2, fl);
  rrect(ctx, -200, 1180, 1500, 900, 0); fillStroke(ctx, mix('#b8763f', '#1a1420', .45), 6);
  const push = kf(lt, [[2.2, 0], [3.2, 1]]);
  drawStick(ctx, C(WHITE, { x: 650 + push * 60, y: 1210, s: 600, flip: -1, lean: -push * .08, arms: lt > 2.3 ? { L: [.3, -.1], R: [1.6, .1] } : POSE.idle.arms, face: { eyes: lt > 2.2 ? 'wide' : 'normal', mouth: lt > 2.3 ? 'frown' : 'flat', look: [.8, 0], browAng: -.35 } }));
  rrect(ctx, -200, 1150, 1500, 40, 12); fillStroke(ctx, mix('#c88b52', '#1a1420', .45), 6);
  rain(ctx, t, 1, 8);
  flash(ctx, fl * .55);
} });
// L — finale: what do you think happened?
SHOTS.push({ start: 40.8, end: 43.05, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [2.2, 1.08]]), r: 0 };
  islandBG(ctx, t, cam, { skyTop: '#7fa9c9', skyBot: '#e6e2d4', tint: .12 });
  applyCam(ctx, cam, 1);
  drawPost(ctx, 250, 1230, .62, 8);
  drawStick(ctx, C(WHITE, { x: 700, y: 1230, s: 600, flip: -1, headTilt: .1, arms: { L: [.3, -.1], R: { ik: [.12, -.88], bend: -1 } }, face: { eyes: 'normal', mouth: 'smirk', look: [.9, -.2], browOne: 1, browAng: .1 } }));
  qmark(ctx, 820, 470, 200 * backOut(clamp((lt - .5) / .3)), clamp((lt - .5) / .1), Math.sin(t * 3) * .12);
  qmark(ctx, 620, 560, 120 * backOut(clamp((lt - .8) / .3)), clamp((lt - .8) / .1), -.2 + Math.sin(t * 2.6) * .1);
} });
