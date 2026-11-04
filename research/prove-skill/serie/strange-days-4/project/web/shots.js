// ---------- The Great Moon Hoax of 1835: shot list (seconds of the voiceover) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
// world point -> ik target in a figure's body units
const tgt = (fig, wx, wy) => [(wx - fig.x) / (fig.s * (fig.flip || 1)), (wy - fig.y) / fig.s];
const pop = (lt, at, d = .3) => backOut(clamp((lt - at) / d));

// New York street, morning (k = night tint)
function nyStreet(ctx, t, cam, k = 0) {
  applyCam(ctx, cam, .1); drawSky(ctx, mix('#4aaeea', '#0d1440', k), mix('#d8f1fb', '#3a3f8f', k));
  if (k < .5) { applyCam(ctx, cam, .15); drawCloud(ctx, 200 + t * 8, 260, 90, 1); drawCloud(ctx, 860 + t * 5, 420, 70, 3); }
  applyCam(ctx, cam, .5);
  const cols = ['#b5523a', '#c9764a', '#9a4a3a', '#b86a4a', '#a8503a', '#c06a3a'];
  for (let i = 0; i < 6; i++) brickHouse(ctx, -420 + i * 330, 1120, 300, 640 + (i % 3) * 90, cols[i], k * .7, k > .5);
  applyCam(ctx, cam, 1);
  street(ctx, 1150, k * .7);
}
// telescope eyepiece: black frame, round view, brass ring
function scopeView(ctx, r, inner, cx = 540, cy = 800) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#07060c'; ctx.fillRect(0, 0, W, H);
  if (r <= 1) return;
  ctx.save(); circle(ctx, cx, cy, r); ctx.clip(); inner(); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(cx, cy, r * .7, cx, cy, r); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)');
  circle(ctx, cx, cy, r); ctx.fillStyle = g; ctx.fill();
  circle(ctx, cx, cy, r + 14); ctx.lineWidth = 30; ctx.strokeStyle = '#c9a14a'; ctx.stroke();
  circle(ctx, cx, cy, r + 30); ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); circle(ctx, cx, cy, r); ctx.lineWidth = 8; ctx.stroke();
}
function moonForest(ctx, t, pan, grow = 1) {
  const R = rng(44);
  for (let i = 0; i < 9; i++) { const x = -150 + i * 170 + R() * 60 - pan, y = 1010 + R() * 30, g = backOut(clamp(grow * 1.6 - i * .08)); if (g > 0) moonTree(ctx, x, y, (.55 + R() * .25) * g, Math.sin(t * 1.4 + i) * .03, i % 3 ? '#3aa58a' : '#2f8fa8'); }
}

const SHOTS = [];
// A — hook: the morning paper says there is life on the Moon
SHOTS.push({ start: 0, end: 2.9, tr: 'whip', draw(ctx, lt, t) {
  const sh = lt > 2.45 && lt < 2.85 ? shake(t, 12 * (2.85 - lt) / .4) : [0, 0];
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.0 + lt * .04, r: Math.sin(t * .6) * .004 };
  nyStreet(ctx, t, cam);
  applyCam(ctx, cam, 1);
  const shock = lt > 2.45;
  const px = kf(lt, [[0, 1300], [.35, 770]], easeOut), pr = kf(lt, [[0, .5], [.35, .06]], easeOut);
  const fig = C(READER, { x: 330, y: 1650, s: 900, bob: shock ? -Math.abs(Math.sin((lt - 2.45) * 9)) * .03 * (1 - clamp((lt - 2.45) / .4)) : 0 });
  const hs = pop(lt, 1.8, .3);
  newspaper(ctx, px, 900, .95, pr + (shock ? Math.sin(t * 30) * .02 : 0), 'LIFE ON\nTHE MOON', { headCol: hs > .01 ? '#c0392b' : '#f6efdc' });
  drawStick(ctx, C(fig, { arms: { L: [.35, -.2], R: { ik: tgt(fig, px - 230, 980), bend: -1 } },
    face: { eyes: shock ? 'wide' : 'normal', look: shock ? [.2, -.2] : [1, .3], mouth: shock ? 'o' : 'smile', browUp: shock ? 1 : 0 }, headTilt: shock ? -.06 : .04 }));
  if (hs > 0 && lt < 2.2) sparkle(ctx, px + 210, 760, 50 * hs, 1 - clamp((lt - 2.0) / .2));
  if (shock) { const k = clamp((lt - 2.45) / .2); for (let i = 0; i < 6; i++) { const a = -2.6 + i * .32; line(ctx, 330 + Math.cos(a) * 230, 950 + Math.sin(a) * 230, 330 + Math.cos(a) * (230 + 70 * k), 950 + Math.sin(a) * (230 + 70 * k), 10); } sweat(ctx, 520, 830, 40, k); }
} });
// B — August 1835, New York: the Sun is on the street
SHOTS.push({ start: 2.9, end: 6.75, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + lt * 14, y: 960 + hh[1], z: kf(lt, [[0, 1.08], [3.8, 1.0]]), r: 0 };
  nyStreet(ctx, t, cam);
  applyCam(ctx, cam, 1);
  newsstand(ctx, 860, 1180, .75);
  paperStack(ctx, 860, 1180 - 90, 4, .55);
  const wave = Math.sin(t * 9);
  const boy = C(NEWSBOY, { x: 470, y: 1600, s: 700, bob: Math.abs(Math.sin(t * 6)) * -.02 });
  const hp = [470 + 150 + wave * 25, 640];
  drawStick(ctx, C(boy, { arms: { L: [.4, -.3], R: { ik: tgt(boy, hp[0], hp[1] + 40), bend: 1 } }, legs: { L: [.15, -.05], R: [.15, -.05] },
    face: { eyes: 'happy', mouth: 'grin', look: [0, 0] } }));
  newspaper(ctx, hp[0] + 20, hp[1] - 60, .32, .25 + wave * .1, 'MOON\nNEWS');
  // shouting lines
  const sl = (Math.sin(t * 12) + 1) / 2; for (let i = 0; i < 3; i++) { const a = -.5 + i * .35; line(ctx, 470 + 170 * Math.cos(a) + 40, 1060 + 120 * Math.sin(a), 470 + (210 + sl * 30) * Math.cos(a) + 40, 1060 + (160 + sl * 30) * Math.sin(a), 9); }
  const cp = pop(lt, .3, .3);
  if (cp > 0) calendar2(ctx, 300, 470, cp * .95, 'AUGUST', '1835');
  const sp = pop(lt, 1.95, .3);
  if (sp > 0) signpost(ctx, 250, 1250, sp * .8, 'NEW YORK');
  const tp = pop(lt, 2.7, .3);
  if (tp > 0) { ctx.save(); ctx.translate(800, 380); ctx.scale(tp, tp); ctx.rotate(.04); rrect(ctx, -210, -80, 420, 160, 20); fillStroke(ctx, '#ffe14d', 9); text(ctx, 'THE SUN', 0, 6, 82, INK, INK, 0, 'Lora', 700); ctx.restore(); }
} });
// C — six days in a row
SHOTS.push({ start: 6.75, end: 8.3, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .05, r: 0 };
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#c99a64'; ctx.fillRect(-600, -600, 2300, 3200); for (let x = -600; x < 1700; x += 150) line(ctx, x, -600, x, 2600, 5, '#a87a48');
  const n = clamp(Math.floor((lt - .05) / .2) + 1, 0, 6);
  for (let i = 0; i < n; i++) {
    const k = clamp((lt - .05 - i * .2) / .12);
    const R = rng(i + 3); const yy = lerp(-500, 820 - i * 14, easeIn(k));
    newspaper(ctx, 540 + (R() - .5) * 80, yy, .95, (R() - .5) * .25, 'LIFE ON\nTHE MOON', { date: 'DAY ' + (i + 1) });
  }
  if (n > 0) { const k = pop(lt, .05 + (n - 1) * .2, .15); ctx.save(); ctx.translate(540, 300); ctx.scale(k, k); rrect(ctx, -200, -90, 400, 180, 26); fillStroke(ctx, '#e0392f', 9); text(ctx, 'DAY ' + n, 0, 6, 100, '#fff', INK, 0, 'Poppins', 700); ctx.restore(); }
} });
// D — a huge telescope in South Africa
SHOTS.push({ start: 8.3, end: 11.85, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const tilt = ease(clamp((lt - 2.0) / 1.2));
  const cam = { x: 540 + hh[0], y: lerp(1080, 760, tilt) + hh[1], z: kf(lt, [[0, 1.25], [1.6, 1.0], [3.5, 1.1]]), r: 0 };
  applyCam(ctx, cam, .1); nightSky(ctx, t);
  applyCam(ctx, cam, .25); drawMoon(ctx, 760, lerp(420, 300, tilt), 120 + tilt * 40, t, 1);
  applyCam(ctx, cam, .5);
  ctx.beginPath(); ctx.moveTo(-600, 1200); ctx.lineTo(-200, 1040); ctx.lineTo(500, 1040); ctx.lineTo(720, 1120); ctx.lineTo(1800, 1160); ctx.lineTo(1800, 2000); ctx.lineTo(-600, 2000); ctx.closePath(); fillStroke(ctx, '#3a3a6a', 6); // flat-topped mountain
  applyCam(ctx, cam, 1);
  ctx.beginPath(); ctx.moveTo(-600, 1420); ctx.quadraticCurveTo(540, 1240, 1700, 1420); ctx.lineTo(1700, 2600); ctx.lineTo(-600, 2600); ctx.closePath(); fillStroke(ctx, '#3f6a4a', 6);
  bigTelescope(ctx, 470, 1380, .62, lerp(-.55, -.62, tilt), t);
  const fig = C(HERSCHEL, { x: 820, y: 1400, s: 360 });
  drawStick(ctx, C(fig, { arms: { L: [.35, -.2], R: [2.3, .4] }, face: { eyes: 'wide', look: [-.5, -1], mouth: 'smile', browUp: 1 }, headTilt: -.12 }));
  const sp = pop(lt, 1.25, .3);
  if (sp > 0) signpost(ctx, 300, 1420, sp * .85, 'SOUTH AFRICA');
} });
// E — through the eyepiece: forests and seas
SHOTS.push({ start: 11.85, end: 13.3, tr: 'cut', draw(ctx, lt, t) {
  const r = kf(lt, [[0, 0], [.35, 520]], backOut);
  const pan = lt * 60;
  scopeView(ctx, r, () => {
    const hh = handheld(t, 2); applyCam(ctx, { x: 540 + hh[0], y: 900 + hh[1], z: 1.05 - lt * .03, r: 0 }, 1);
    moonland(ctx, t, pan);
    moonForest(ctx, t, pan, clamp((lt - .25) / .5));
    const s = clamp((lt - .95) / .3); if (s > 0) { sparkle(ctx, 380, 950, 40 * backOut(s), 1); sparkle(ctx, 760, 965, 30 * backOut(s), 1); }
  });
} });
// F — bison-like beasts
SHOTS.push({ start: 13.3, end: 14.9, tr: 'whip', draw(ctx, lt, t) {
  scopeView(ctx, 520, () => {
    const hh = handheld(t, 2); applyCam(ctx, { x: 540 + hh[0] + lt * 30, y: 900 + hh[1], z: 1.12, r: 0 }, 1);
    moonland(ctx, t, 300 + lt * 40);
    moonForest(ctx, t, 300 + lt * 40, 1);
    for (let i = 0; i < 3; i++) { const x = kf(lt, [[0, -250 - i * 260], [1.6, 400 - i * 260 + 320]], v => v) + i * 40; drawBison(ctx, x + 300, 1150 + i * 40 - (i === 1 ? 60 : 0), .95 + i * .1, t + i * .7, 1); }
  });
} });
// G — blue goats with a single horn
SHOTS.push({ start: 14.9, end: 16.9, tr: 'whip', draw(ctx, lt, t) {
  const zk = ease(clamp((lt - 1.3) / .4));
  scopeView(ctx, 520, () => {
    const hh = handheld(t, 2); applyCam(ctx, { x: lerp(540, 640, zk) + hh[0], y: lerp(900, 860, zk) + hh[1], z: lerp(1.08, 1.45, zk), r: 0 }, 1);
    moonland(ctx, t, 700);
    moonForest(ctx, t, 700, 1);
    for (let i = 0; i < 3; i++) {
      const at = .1 + i * .18, k = clamp((lt - at) / .45);
      const x = lerp(1300 + i * 80, 260 + i * 260, easeOut(k)), hop = Math.abs(Math.sin((lt - at) * 9)) * 60 * (k < 1 ? 1 : .3);
      drawUnigoat(ctx, x, 1150 + (i % 2) * 40, 1.0 + (i === 2 ? .15 : 0), t + i, -1, hop);
    }
    if (lt > 1.45) { const s = clamp((lt - 1.45) / .25); sparkle(ctx, 838 - 126, 1150 - 316 - 20, 55 * backOut(s), 1 - clamp((lt - 1.9) / .2)); }
  });
} });
// H — people with bat wings, flying over the lakes
SHOTS.push({ start: 16.9, end: 19.9, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + lt * 40, y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3, 1.08]]), r: Math.sin(t * .7) * .006 };
  applyCam(ctx, cam, .2);
  ctx.save(); ctx.translate(0, 220); moonland(ctx, t, 0, { sea: false }); ctx.restore();
  applyCam(ctx, cam, .6);
  // the lake
  ellipse(ctx, 560, 1330, 900, 170); fillStroke(ctx, '#3fb6d8', 7);
  ctx.save(); ellipse(ctx, 560, 1330, 900, 170); ctx.clip(); for (let i = 0; i < 12; i++) { const wx = ((i * 190 + t * 40) % 1900) - 400; ctx.beginPath(); ctx.arc(wx, 1290 + (i % 3) * 45, 26, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 6; ctx.strokeStyle = '#e8fbff'; ctx.stroke(); } ctx.restore();
  moonForest(ctx, t, -200, 1);
  applyCam(ctx, cam, 1);
  const fl = [[-80, 1000, 470, 0], [180, 640, 300, 1], [-420, 800, 250, 2]];
  fl.forEach(([x0, y0, s, i]) => {
    const x = x0 + lt * 380, y = y0 + Math.sin(t * 1.5 + i) * 30;
    manBat(ctx, x, y, s, t, i, { lean: .25, face: { eyes: 'happy', mouth: i === 1 ? 'o' : 'grin' } });
  });
} });
// I — copies fly off the stands
SHOTS.push({ start: 19.9, end: 21.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.02 + lt * .05, r: 0 };
  nyStreet(ctx, t, cam);
  applyCam(ctx, cam, 1);
  newsstand(ctx, 540, 1180, 1.05);
  // papers fly up off the stand
  for (let i = 0; i < 9; i++) {
    const at = i * .14, k = clamp((lt - at) / .9); if (k <= 0) continue;
    const R = rng(i + 20); const dir = R() > .5 ? 1 : -1;
    const x = 540 + dir * (80 + R() * 380) * easeOut(k), y = 1000 - Math.sin(k * Math.PI) * (420 + R() * 220) + k * 250;
    newspaper(ctx, x, y, .2, k * 6 * dir, 'MOON');
  }
  for (let i = 0; i < 5; i++) {
    const side = i % 2 ? 1 : -1, xx = 540 + side * (210 + Math.floor(i / 2) * 170);
    const fig = C(CROWD[i], { x: i === 4 ? 540 : xx, y: 1500 + (i === 4 ? 50 : Math.floor(i / 2) * 25), s: 520, flip: side, bob: -Math.abs(Math.sin(t * 10 + i)) * .03 });
    drawStick(ctx, C(fig, { arms: { L: [.4 + Math.sin(t * 9 + i) * .2, -.2], R: [2.5 + Math.sin(t * 12 + i) * .25, .3] }, face: { eyes: 'wide', mouth: 'grin', look: [-.4, -.8] } }));
  }
} });
// J — many believed it
SHOTS.push({ start: 21.6, end: 22.58, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .08, r: 0 };
  nyStreet(ctx, t, cam, 1);
  applyCam(ctx, cam, .2); drawMoon(ctx, 820, 330, 130, t, 1);
  applyCam(ctx, cam, 1);
  const a = C(READER, { x: 330, y: 1560, s: 700 }), b = C(LADY, { x: 720, y: 1580, s: 650 });
  drawStick(ctx, C(a, { arms: { L: [.3, -.1], R: [2.4, .3] }, face: { eyes: 'wide', look: [.6, -1], mouth: 'grin', browUp: 1 }, headTilt: -.1 }));
  newspaper(ctx, 200, 1150, .3, -.3, 'MOON');
  drawStick(ctx, C(b, { arms: { L: { ik: [-.02, -.62], bend: -1 }, R: { ik: [.02, -.62], bend: 1 } }, face: { eyes: 'happy', mouth: 'smile', look: [.4, -1] }, headTilt: -.08, blush: true }));
  for (let i = 0; i < 3; i++) sparkle(ctx, 620 + i * 150, 560 + (i % 2) * 70, 30 * (.7 + .3 * Math.sin(t * 8 + i)), 1);
  heart(ctx, 860, 860 - lt * 60, 34, clamp(lt * 4));
} });
// K — but none of it was real
SHOTS.push({ start: 22.58, end: 24.0, tr: 'whip', draw(ctx, lt, t) {
  const hit = .82;
  const sh = lt > hit && lt < hit + .4 ? shake(t, 18 * (hit + .4 - lt) / .4) : [0, 0];
  const cam = { x: 540 + sh[0], y: 960 + sh[1], z: kf(lt, [[0, 1.15], [.3, 1.0]], easeOut), r: 0 };
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#3d6f8f'; ctx.fillRect(-600, -600, 2300, 3200);
  const R = rng(9); for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,255,255,.06)'; circle(ctx, R() * 1300 - 100, R() * 2000, 60 + R() * 120); ctx.fill(); }
  newspaper(ctx, 540, 760, 1.1, -.04, 'LIFE ON\nTHE MOON');
  const s = lt < hit ? 0 : kf(lt, [[hit, 2.2], [hit + .12, 1.0]], easeIn);
  stamp(ctx, 540, 820, s, 'HOAX', -.22, 1);
  if (lt > hit) { flash(ctx, (1 - clamp((lt - hit) / .2)) * .5); }
} });
// L — the astronomer it named never saw any of it
SHOTS.push({ start: 24.0, end: 27.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.6, 1.1]]), r: 0 };
  applyCam(ctx, cam, .1); drawSky(ctx, '#4aaeea', '#d8f1fb'); drawSun(ctx, 860, 280, 70, t, .9);
  applyCam(ctx, cam, .3);
  ctx.beginPath(); ctx.moveTo(-600, 1100); ctx.lineTo(-100, 800); ctx.lineTo(700, 790); ctx.lineTo(900, 900); ctx.lineTo(1700, 1000); ctx.lineTo(1700, 1500); ctx.lineTo(-600, 1500); ctx.closePath(); fillStroke(ctx, '#7a8fb0', 6);
  ctx.save(); ctx.beginPath(); ctx.moveTo(-100, 800); ctx.lineTo(700, 790); ctx.lineTo(720, 820); ctx.lineTo(-110, 830); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.globalAlpha = .7; ctx.fill(); ctx.restore();
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#d9b26a'; ctx.fillRect(-600, 1080, 2400, 1600); line(ctx, -600, 1080, 1800, 1080, 6);
  drawBush(ctx, 120, 1100, 1.0, '#3a8a4a');
  smallScope(ctx, 830, 1560, 1.25, -.45);
  const no = lt > 2.45;
  const fig = C(HERSCHEL, { x: 400, y: 1680, s: 880 });
  const pp = [600, 1260];
  drawStick(ctx, C(fig, { arms: { L: { ik: tgt(fig, pp[0] - 130, pp[1] + 20), bend: -1 }, R: { ik: tgt(fig, pp[0] + 110, pp[1] + 20), bend: 1 } },
    face: { eyes: no ? 'normal' : 'wide', look: no ? [.9, 0] : [.6, .6], mouth: no ? 'frown' : 'flat', browAng: no ? -.25 : 0, browUp: no ? .4 : .2 },
    headTilt: no ? Math.sin((lt - 2.45) * 16) * .12 * (1 - clamp((lt - 2.45) / .8)) : .06 }));
  newspaper(ctx, pp[0], pp[1] - 30, .42, .08, 'LIFE ON\nTHE MOON');
  const tp = pop(lt, 1.5, .3);
  if (tp > 0) { ctx.save(); ctx.translate(400, 560); ctx.scale(tp, tp); rrect(ctx, -270, -60, 540, 120, 22); fillStroke(ctx, '#fffaf0', 8); text(ctx, 'JOHN HERSCHEL', 0, 4, 64, INK, INK, 0, 'Poppins', 700); ctx.restore(); }
  if (no) for (let i = 0; i < 3; i++) qmark(ctx, 700 + i * 120, 720 - (i % 2) * 80, 120 * pop(lt, 2.5 + i * .12, .25), 1, Math.sin(t * 3 + i) * .2);
} });
// M — made up, most likely by Richard Adams Locke
SHOTS.push({ start: 27.6, end: 31.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.12], [4, 1.0]]), r: 0 };
  applyCam(ctx, cam, .5);
  ctx.fillStyle = '#5a3a4a'; ctx.fillRect(-900, -900, 2900, 3200);
  for (let x = -900; x < 2000; x += 150) line(ctx, x, -900, x, 2600, 5, '#4a2e3c');
  rrect(ctx, 640, 260, 300, 400, 10); fillStroke(ctx, '#f2ead8', 8); rrect(ctx, 660, 280, 260, 360, 6); fillStroke(ctx, '#0d1440', 6);
  ctx.save(); rrect(ctx, 660, 280, 260, 360, 6); ctx.clip(); drawMoon(ctx, 800, 400, 60, t, .8); ctx.restore();
  line(ctx, 790, 280, 790, 640, 7, '#f2ead8'); line(ctx, 660, 460, 920, 460, 7, '#f2ead8');
  applyCam(ctx, cam, 1);
  const smirk = lt > 2.0;
  const fig = C(LOCKE, { x: 380, y: 1620, s: 820 });
  const wr = Math.sin(t * 22) * 10;
  drawStick(ctx, C(fig, { arms: { L: { ik: tgt(fig, 250, 1180), bend: -1 }, R: { ik: tgt(fig, 600 + wr, 1150 + Math.cos(t * 17) * 6), bend: 1 } },
    face: { eyes: smirk ? 'smug' : 'normal', look: smirk ? [-.8, 0] : [.8, .7], mouth: smirk ? 'smirk' : 'flat', browOne: smirk ? 1 : 0 }, headTilt: smirk ? -.08 : .1 }));
  rrect(ctx, -100, 1170, 1300, 40, 10); fillStroke(ctx, '#8a5530', 7);
  ctx.fillStyle = '#6e4428'; ctx.fillRect(-100, 1210, 1300, 900); line(ctx, -100, 1210, 1200, 1210, 6);
  // the page he is writing, with a man-bat sketch
  ctx.save(); ctx.translate(560, 1120); ctx.rotate(-.06); rrect(ctx, -150, -90, 300, 140, 6); fillStroke(ctx, '#fbf6e6', 5);
  const dk = clamp((lt - .3) / 1.5);
  ctx.save(); ctx.beginPath(); ctx.rect(-150, -90, 300 * dk, 140); ctx.clip(); manBat(ctx, -60, 30, 90, 0, 0); for (let i = 0; i < 4; i++) line(ctx, 10, -60 + i * 26, 120 - (i % 2) * 30, -60 + i * 26, 5, '#8a7a6a'); ctx.restore();
  ctx.restore();
  quill(ctx, 600 + wr, 1150, 1.0, .35);
  drawCandle(ctx, 150, 1175, 1.0, 1, t, 380);
  const np = pop(lt, 2.7, .3);
  if (np > 0) { ctx.save(); ctx.translate(560, 470); ctx.scale(np, np); ctx.rotate(-.03); rrect(ctx, -320, -110, 640, 220, 26); fillStroke(ctx, '#ffe14d', 9); text(ctx, 'RICHARD', 0, -45, 62, INK, INK, 0, 'Poppins', 700); text(ctx, 'ADAMS LOCKE', 0, 40, 62, INK, INK, 0, 'Poppins', 700); ctx.restore(); }
  const wa = clamp((lt - 1.0) / .2) * (1 - clamp((lt - 2.6) / .2));
  if (wa > 0) { ctx.save(); ctx.translate(560, 520); ctx.scale(wa, wa); rrect(ctx, -230, -60, 460, 120, 22); fillStroke(ctx, '#fffaf0', 8); text(ctx, 'THE SUN', 0, 4, 62, INK, INK, 0, 'Lora', 700); ctx.restore(); }
} });
// N — the paper never truly apologized
SHOTS.push({ start: 31.6, end: 34.1, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .04, r: 0 };
  applyCam(ctx, cam, .1); drawSky(ctx, '#4aaeea', '#d8f1fb');
  applyCam(ctx, cam, .6);
  brickHouse(ctx, 40, 1150, 1000, 900, '#a8503a');
  rrect(ctx, 190, 300, 700, 150, 16); fillStroke(ctx, '#f6efdc', 8); text(ctx, 'THE SUN', 540, 380, 110, INK, INK, 0, 'Lora', 700);
  applyCam(ctx, cam, 1);
  street(ctx, 1150);
  const shrug = lt > 1.45;
  const fig = C(EDITOR, { x: 560, y: 1660, s: 820 });
  drawStick(ctx, C(fig, { arms: shrug ? { L: [1.3, -1.6], R: [1.3, -1.6] } : { L: [.9, -2.2], R: [.9, -2.2] },
    face: { eyes: shrug ? 'half' : 'normal', look: [.5, -.3], mouth: shrug ? 'smirk' : 'flat', browUp: shrug ? 1 : 0, browOne: shrug ? -1 : 0 }, headTilt: shrug ? .1 : 0 }));
  const bs = pop(lt, .55, .3);
  bubble(ctx, 760, 700, bs * 1.25, 'sorry', 1 - clamp((lt - 2.2) / .2));
  const xk = clamp((lt - 1.3) / .25);
  if (xk > 0 && lt < 2.4) { ctx.save(); ctx.globalAlpha = 1 - clamp((lt - 2.2) / .2); line(ctx, 620, 620, lerp(620, 900, xk), lerp(620, 780, xk), 26, '#e0392f'); if (xk > .5) { const k2 = clamp((xk - .5) * 2); line(ctx, 900, 620, lerp(900, 620, k2), lerp(620, 780, k2), 26, '#e0392f'); } ctx.restore(); }
} });
// O — would you have believed it?
SHOTS.push({ start: 34.1, end: 36.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03, r: 0 };
  applyCam(ctx, cam, .4);
  ctx.fillStyle = '#c99a64'; ctx.fillRect(-900, -900, 2900, 3200); for (let x = -900; x < 2000; x += 150) line(ctx, x, -900, x, 2600, 5, '#a87a48');
  rrect(ctx, 560, 220, 420, 520, 10); fillStroke(ctx, '#f2ead8', 8); rrect(ctx, 580, 240, 380, 480, 6); fillStroke(ctx, '#0d1440', 6);
  ctx.save(); rrect(ctx, 580, 240, 380, 480, 6); ctx.clip(); nightSky(ctx, t); drawMoon(ctx, 770, 440, 110, t, 1); manBat(ctx, 640 + ((lt * 120) % 400), 600, 90, t, 1, { face: { eyes: 'happy', mouth: 'grin' } }); ctx.restore();
  line(ctx, 770, 240, 770, 720, 7, '#f2ead8'); line(ctx, 580, 480, 960, 480, 7, '#f2ead8');
  applyCam(ctx, cam, 1);
  const fig = C(READER, { x: 400, y: 1820, s: 1050, shadow: false });
  drawStick(ctx, C(fig, { arms: { L: [.3, -.1], R: { ik: [.3, -.35], bend: -1 } }, face: { eyes: 'normal', look: [0, 0], mouth: lt > .6 ? 'smirk' : 'flat', browOne: lt > .6 ? 1 : 0 }, headTilt: Math.sin(t * 1.2) * .03 }));
  newspaper(ctx, 400 + .33 * 1050, 1820 - .38 * 1050, .38, .2, 'LIFE ON\nTHE MOON');
  qmark(ctx, 300, 520, 200 * pop(lt, .55, .25), 1, Math.sin(t * 3) * .12);
} });
// P — Strange Days, part 4
SHOTS.push({ start: 36.6, end: 38.9, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03, r: 0 };
  applyCam(ctx, cam, .2); nightSky(ctx, t);
  applyCam(ctx, cam, .5); drawMoon(ctx, 540, 1000, 330, t, 1);
  applyCam(ctx, cam, 1);
  const bx = kf(lt, [[0, -200], [2.3, 1300]], v => v), by = 940 + Math.sin(t * 3) * 20;
  batWings(ctx, bx, by - 160, 225, (t * 2.2) % 1);
  drawStick(ctx, { x: bx, y: by, s: 300, sil: '#140c20', lean: .3, arms: { L: [2.0, -.3], R: [2.0, -.3] }, legs: { L: [.25, -.5], R: [-.1, -.6] } });
  const ta = pop(lt, .15, .35);
  if (ta > 0) {
    ctx.save(); ctx.translate(540, 440); ctx.scale(ta, ta); ctx.rotate(-.03);
    rrect(ctx, -400, -150, 800, 290, 30); fillStroke(ctx, '#ffe14d', 10);
    text(ctx, 'STRANGE DAYS', 0, -55, 104, INK, INK, 0, 'Lora', 700);
    text(ctx, 'part 4', 0, 70, 70, '#e0392f', INK, 0, 'Poppins', 700);
    ctx.restore();
  }
} });
