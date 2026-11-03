// ---------- The Dark Day of 1780: shot list (seconds of the voiceover) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const walkArms = (t, sp = 9, amp = .6) => ({ L: [.3 - Math.sin(t * sp) * amp, -.3], R: [.3 + Math.sin(t * sp) * amp, -.3] });
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const panic = (t, i = 0) => ({ L: [2.5 + Math.sin(t * 18 + i) * .3, .3], R: [2.5 - Math.sin(t * 18 + i + 1) * .3, .3] });

// New England village; k = how dark the day has turned (0..1)
function villageBG(ctx, t, cam, k, o = {}) {
  applyCam(ctx, cam, .08); darkSky(ctx, k);
  applyCam(ctx, cam, .1); if (k < .95) drawSun(ctx, o.sunX || 820, o.sunY || 330, 75, t, 1 - k);
  applyCam(ctx, cam, .15);
  if (k < .5) { drawCloud(ctx, 160 + t * 6, 300, 100, 1, 1 - k * 2); drawCloud(ctx, 900 + t * 4, 520, 70, 2, 1 - k * 2); }
  smokeBank(ctx, -700 + k * 520 + t * 10, 280, 1.1, t, k, 4);
  smokeBank(ctx, -300 + k * 300 + t * 6, 520, .9, t, k * .9, 9);
  applyCam(ctx, cam, .35);
  ctx.beginPath(); ctx.moveTo(-1200, 1000); ctx.quadraticCurveTo(-200, 760, 400, 900); ctx.quadraticCurveTo(900, 800, 2300, 960); ctx.lineTo(2300, 1400); ctx.lineTo(-1200, 1400); ctx.closePath(); fillStroke(ctx, mix('#6fb85a', '#141a16', k * .8), 6);
  for (let i = 0; i < 10; i++) drawPine(ctx, -300 + i * 180 + (i % 2) * 50, 930 + (i % 3) * 12, .7 + (i % 3) * .12, .15 + k * .7, Math.sin(t * 1.3 + i) * .015);
  applyCam(ctx, cam, .6);
  drawChurch(ctx, o.churchX || 800, 1010, .85, k * .75);
  litCottage(ctx, o.cotX || 230, 1020, .8, k * .75, clamp(k * 2 - .8), t);
  applyCam(ctx, cam, 1);
  const g = ctx.createLinearGradient(0, 1000, 0, 2000); g.addColorStop(0, mix('#7cc65e', '#141a16', k * .8)); g.addColorStop(1, mix('#4f9e45', '#0e120e', k * .8));
  ctx.fillStyle = g; ctx.fillRect(-2000, 1000, 5080, 3000);
  ctx.strokeStyle = mix('#3f8a3a', '#0e120e', k * .8); ctx.lineWidth = 5; ctx.lineCap = 'round';
  const R = rng(17); for (let i = 0; i < 40; i++) { const x = R() * 1600 - 260, y = 1060 + R() * 900; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 22); ctx.moveTo(x + 10, y); ctx.lineTo(x + 14, y - 20); ctx.stroke(); }
}

const SHOTS = [];
// A — hook: mid-morning, the sky goes black over a farmer
SHOTS.push({ start: 0, end: 2.55, tr: 'whip', draw(ctx, lt, t) {
  const k = kf(lt, [[0, .12], [.9, .4], [1.5, 1]]);
  const sh = lt > 1.05 && lt < 1.6 ? shake(t, 10 * (1.6 - lt) / .55) : [0, 0];
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.02 + lt * .05, r: Math.sin(t * .5) * .005 };
  villageBG(ctx, t, cam, k);
  applyCam(ctx, cam, 1);
  const scared = lt > 1.05;
  drawStick(ctx, C(FARMER, { x: 540, y: 1720, s: 900, bob: Math.sin(t * 3) * .004,
    arms: scared ? { L: [2.2 + Math.sin(t * 16) * .08, .5], R: [2.2 - Math.sin(t * 16) * .08, .5] } : { L: [.3, -.1], R: [.95, -2.1] },
    face: { eyes: scared ? 'wide' : 'normal', look: [.2, -1], mouth: scared ? 'o' : 'smile', browUp: scared ? 1 : 0 }, headTilt: -.05 }));
  if (scared) { sweat(ctx, 780, 880 + (lt - 1.05) * 80, 40, clamp((lt - 1.2) * 4)); }
} });
// B — New England, 19 May 1780: the whole village in the dark
SHOTS.push({ start: 2.55, end: 6.05, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + lt * 18, y: 980 + hh[1], z: kf(lt, [[0, 1.1], [3.5, 1.0]]), r: 0 };
  villageBG(ctx, t, cam, .92, { churchX: 760, cotX: 260 });
  applyCam(ctx, cam, 1);
  litCottage(ctx, 900, 1180, 1.0, .7, 1, t);
  // two townsfolk hurrying with lanterns
  for (let i = 0; i < 2; i++) {
    const x = kf(lt, [[0, 150 + i * 160], [3.5, 420 + i * 160]], v => v), y = 1420 + i * 30;
    drawStick(ctx, C(TOWN[i], { x, y, s: 300, legs: walkLegs(t + i, 11), arms: { L: [.3 - Math.sin((t + i) * 11) * .5, -.3], R: [1.3, -.4] }, face: { eyes: 'wide', look: [-.6, -.3], mouth: 'frown' } }));
    drawLantern(ctx, x + 70, y - 190, .7, 1, t);
  }
  signpost(ctx, 250, 1180, 1.15 * backOut(clamp((lt - .55) / .3)), 'NEW ENGLAND', .3);
  const cp = backOut(clamp((lt - 1.65) / .3));
  if (cp > 0) calendar2(ctx, 560, 520, cp, 'MAY 19', '1780');
} });
// C — by noon: candles indoors
SHOTS.push({ start: 6.05, end: 7.8, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.04 + lt * .05, r: 0 };
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#c99a64'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let x = -600; x < 1700; x += 150) line(ctx, x, -600, x, 2600, 5, '#a87a48');
  rrect(ctx, 600, 260, 300, 420, 10); fillStroke(ctx, '#f2ead8', 8); rrect(ctx, 620, 280, 260, 380, 6); fillStroke(ctx, '#140e10', 6);
  line(ctx, 750, 280, 750, 660, 7, '#f2ead8'); line(ctx, 620, 470, 880, 470, 7, '#f2ead8');
  drawClock(ctx, 290, 450, 120, 12, kf(lt, [[0, 57], [1.0, 60]], v => v));
  const lit = backOut(clamp((lt - .88) / .25));
  drawStick(ctx, C(WIFE, { x: 600, y: 1440, s: 800, arms: { L: { ik: [-.2, kf(lt, [[0, -.45], [.8, -.6]])], bend: -1 }, R: [.35, -.15] },
    face: { eyes: 'normal', look: [-.6, .5], mouth: lit > .5 ? 'smile' : 'flat', browUp: lit > .5 ? .6 : 0 } }));
  drawTable(ctx, 540, 1170, 1100);
  darkness(ctx, .5 - lit * .15, '#0a0610');
  applyCam(ctx, cam, 1);
  drawCandle(ctx, 430, 1160, 1.3, lit, t, 520);
  if (lit > 0) sparkle(ctx, 470, 880, 60 * (1 - clamp((lt - .95) / .4)), 1 - clamp((lt - .95) / .4));
} });
// D1 — chickens go to roost
SHOTS.push({ start: 7.8, end: 9.25, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .06, r: 0 };
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#b5442f'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let x = -600; x < 1700; x += 120) line(ctx, x, -600, x, 2600, 5, '#8a3020');
  rrect(ctx, 380, 280, 320, 260, 8); fillStroke(ctx, '#f2ead8', 8); rrect(ctx, 400, 300, 280, 220, 4); fillStroke(ctx, '#140e10', 6);
  ctx.fillStyle = '#d9b26a'; ctx.fillRect(-600, 1300, 2300, 1400); line(ctx, -600, 1300, 1700, 1300, 6);
  rrect(ctx, -100, 960, 1300, 36, 12); fillStroke(ctx, '#8a5530', 6);
  for (const px of [120, 960]) { rrect(ctx, px, 990, 34, 320, 6); fillStroke(ctx, '#6e4428', 5); }
  for (let i = 0; i < 3; i++) {
    const at = .15 + i * .22, k = clamp((lt - at) / .35);
    const x = 270 + i * 270, y = lerp(1330, 965, easeOut(k)) - Math.sin(k * Math.PI) * 120;
    const sl = clamp((lt - .95 - i * .08) / .2);
    drawChicken(ctx, x, y, 1.5, t, { sleep: sl, flip: i === 1 ? -1 : 1, lean: k < 1 ? -.2 * Math.sin(k * Math.PI) : 0 });
    zzz(ctx, x + 40, y - 260, 1.2, lt + i * .3, sl);
  }
  darkness(ctx, .32, '#0a0610');
} });
// D2 — and the birds go silent
SHOTS.push({ start: 9.25, end: 10.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .08, r: 0 };
  applyCam(ctx, cam, .1); darkSky(ctx, .85);
  applyCam(ctx, cam, .2); smokeBank(ctx, -200 + t * 10, 420, 1, t, .9, 3);
  applyCam(ctx, cam, 1);
  ctx.beginPath(); ctx.moveTo(-200, 1090); ctx.quadraticCurveTo(500, 1010, 1300, 1060); ctx.lineTo(1300, 1100); ctx.quadraticCurveTo(500, 1060, -200, 1140); ctx.closePath(); fillStroke(ctx, '#7a4a2a', 7);
  drawBush(ctx, 180, 1060, 1.3, '#2f6a3a'); drawBush(ctx, 930, 1040, 1.1, '#2f6a3a');
  const quiet = lt > .82;
  const op = quiet ? 0 : (Math.sin(t * 22) > 0 ? 1 : .2);
  drawBird(ctx, 540, 1052, 3.0, t, op, quiet ? Math.sin(t * 6) : 0);
  if (!quiet) for (let i = 0; i < 3; i++) { const k = (lt * 1.4 + i / 3) % 1; note(ctx, 700 + k * 200, 780 - k * 260 - i * 20, 1.4, Math.sin(k * Math.PI), Math.sin(t * 4 + i) * .2); }
  else { const fa = 1 - clamp((lt - .82) / .3); for (let i = 0; i < 3; i++) note(ctx, 760 + i * 60, 650 - i * 60 + (lt - .82) * 300, 1.4, fa); }
} });
// E — the end of the world? people panic in the street
SHOTS.push({ start: 10.6, end: 12.85, tr: 'whip', draw(ctx, lt, t) {
  const sh = lt > 1.2 && lt < 1.7 ? shake(t, 14 * (1.7 - lt) / .5) : [0, 0];
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0] + sh[0], y: 980 + hh[1] + sh[1], z: 1.0 + lt * .05, r: Math.sin(t * .8) * .006 };
  villageBG(ctx, t, cam, 1, { churchX: 560, cotX: 120 });
  applyCam(ctx, cam, 1);
  const xs = [170, 400, 660, 900];
  xs.forEach((x, i) => {
    const y = 1480 + (i % 2) * 40 - Math.abs(Math.sin(t * 9 + i)) * 25;
    drawStick(ctx, C(TOWN[i], { x, y, s: 540, arms: panic(t, i), legs: { L: [.25, -.1], R: [.25, -.1] }, lean: Math.sin(t * 7 + i) * .05,
      face: { eyes: 'wide', look: [i < 2 ? .5 : -.5, -.8], mouth: i % 2 ? 'teeth' : 'o', browUp: 1 } }));
  });
  if (lt > 1.2) { const b = clamp((lt - 1.2) / .1) * (1 - clamp((lt - 1.35) / .3)); flash(ctx, b * .25); }
  for (const [x, y, d] of [[260, 880, 1.25], [740, 860, 1.4]]) sweat(ctx, x, y + (lt - d) * 90, 36, clamp((lt - d) * 4));
} });
// F — Connecticut's lawmakers want to adjourn and run for the door
function hallScene(ctx, tint) { drawHall(ctx, '#120d10', tint); }
SHOTS.push({ start: 12.85, end: 15.45, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.08], [2.6, 1.0]]), r: 0 };
  applyCam(ctx, cam, 1); hallScene(ctx, .35);
  const up = clamp((lt - .9) / .2);
  [[180, 0], [400, 1], [640, 2]].forEach(([x0, i]) => {
    const run = clamp((lt - 1.35 - i * .1) / 1.2);
    const x = x0 - easeIn(run) * 900, y = 1170 - up * 50 - (run > 0 ? Math.abs(Math.sin(t * 14 + i)) * 30 : 0);
    drawStick(ctx, C(LAW[i], { x, y, s: 560, arms: up > .5 ? panic(t, i) : { L: [.3, -.1], R: [.3, -.1] }, legs: run > 0 ? walkLegs(t + i, 18, .7) : undefined, lean: run > 0 ? -.15 : 0, flip: run > 0 ? -1 : 1,
      face: { eyes: up > .5 ? 'wide' : 'normal', look: up > .5 ? [-.8, -.2] : [.6, -.6], mouth: up > .5 ? 'teeth' : 'flat', browUp: up } }));
  });
  drawStick(ctx, C(DAV, { x: 880, y: 1170, s: 560, arms: POSE.hips.arms, face: { eyes: 'normal', look: [-.7, 0], mouth: 'flat', browAng: .15 } }));
  drawTable(ctx, 540, 1000, 1500, .1);
  text(ctx, 'CONNECTICUT', 540, 1100, 72, '#f2ead8', INK, 10, 'Lora', 700);
  for (let i = 0; i < 5; i++) drawCandle(ctx, 150 + i * 190, 985, .8, 0, t);
  darkness(ctx, .3, '#0a0610');
} });
// G — "But Abraham Davenport refused": he slams the table
SHOTS.push({ start: 15.45, end: 17.85, tr: 'cut', draw(ctx, lt, t) {
  const slam = 1.62;
  const sh = lt > slam && lt < slam + .45 ? shake(t, 22 * (slam + .45 - lt) / .45) : [0, 0];
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.0 + lt * .04, r: 0 };
  applyCam(ctx, cam, 1); hallScene(ctx, .4);
  const frozen = lt > slam;
  drawStick(ctx, C(LAW[0], { x: 140, y: 1150, s: 420, flip: -1, arms: panic(frozen ? 0 : t, 0), legs: walkLegs(frozen ? .3 : t, 18, .7), lean: -.15, face: { eyes: 'wide', look: [1, 0], mouth: frozen ? 'o' : 'teeth', browUp: 1 } }));
  drawStick(ctx, C(LAW[1], { x: 950, y: 1150, s: 420, arms: panic(frozen ? 1 : t, 1), face: { eyes: 'wide', look: [-1, 0], mouth: frozen ? 'o' : 'teeth', browUp: 1 } }));
  const raise = kf(lt, [[.9, 0], [1.4, 1], [slam, 0, easeIn]]);
  const hand = frozen ? [.36, -.33] : [lerp(.3, .32, raise), lerp(-.32, -.9, raise)];
  drawStick(ctx, C(DAV, { x: 540, y: 1520, s: 1000, armLen: 1.2, arms: { L: [.3, -.1], R: { ik: hand, bend: -1 } }, headTilt: frozen ? .04 : 0,
    face: { eyes: frozen ? 'normal' : 'normal', look: [0, 0], mouth: frozen ? 'flat' : 'flat', browAng: frozen ? .35 : .1 } }));
  drawTable(ctx, 540, 1190, 1500, .1);
  paper(ctx, 330, 1170, 1.2, -.1); paper(ctx, 760, 1172, 1.1, .12, 3);
  darkness(ctx, .22, '#0a0610');
  applyCam(ctx, cam, 1);
  if (frozen) { const b = clamp((lt - slam) / .25); if (b < 1) burst(ctx, 860, 1170, 120 * backOut(b) * (1.2 - b * .3), 12, '#ffd23a', 5); flash(ctx, (1 - clamp((lt - slam) / .15)) * .35); }
} });
// H — "if it was Judgment Day, he'd rather be found doing his duty"
SHOTS.push({ start: 17.85, end: 21.8, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03, r: Math.sin(t * .4) * .004 };
  applyCam(ctx, cam, .5); hallScene(ctx, .45);
  applyCam(ctx, cam, 1);
  const point = kf(lt, [[.4, 0], [.7, 1, backOut], [1.7, 1], [2.0, 0]]);
  const chest = kf(lt, [[2.1, 0], [2.45, 1, backOut]]);
  drawStick(ctx, C(DAV, { x: 540, y: 2120, s: 1500, shadow: false, headTilt: point > .5 ? -.08 : (chest > .5 ? .03 : 0),
    arms: { L: point > 0 ? [lerp(.3, 2.2, point), lerp(-.1, .15, point)] : [.3, -.1], R: chest > 0 ? { ik: [lerp(.3, -.02, chest), lerp(-.35, -.5, chest)], bend: -1 } : [.3, -.1] },
    face: { eyes: chest > .5 ? 'happy' : 'normal', look: point > .5 ? [-.5, -.9] : [0, 0], mouth: chest > .5 ? 'smile' : 'flat', browAng: chest > .5 ? 0 : .25, browUp: point > .5 ? .5 : 0 } }));
  darkness(ctx, .18, '#0a0610');
  applyCam(ctx, cam, 1);
  const sa = kf(lt, [[3.45, 0], [3.6, 1], [3.95, 0]]);
  sparkle(ctx, 300, 760, 80 * sa, sa); sparkle(ctx, 820, 640, 60 * sa, sa);
} });
// I — candles are brought in and the work goes on
SHOTS.push({ start: 21.8, end: 24.3, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [2.5, 1.07]]), r: 0 };
  applyCam(ctx, cam, 1); hallScene(ctx, .35);
  const writing = lt > 1.35;
  const xs = [150, 360, 720, 930];
  xs.forEach((x, i) => drawStick(ctx, C(LAW[i], { x, y: 1110, s: 520, arms: writing ? { L: [.3, -.1], R: { ik: [.25 + Math.sin(t * 14 + i) * .04, -.3], bend: -1 } } : POSE.idle.arms,
    face: { eyes: writing ? 'normal' : 'normal', look: writing ? [.4, .8] : [.3, 0], mouth: writing ? 'smile' : 'flat' } })));
  drawStick(ctx, C(DAV, { x: 540, y: 1110, s: 560, arms: writing ? { L: [.3, -.1], R: { ik: [.25 + Math.sin(t * 12) * .04, -.3], bend: -1 } } : POSE.hips.arms, face: { eyes: 'normal', look: [.3, .6], mouth: 'smile' } }));
  drawTable(ctx, 540, 1000, 1500, .1);
  text(ctx, 'CONNECTICUT', 540, 1100, 72, '#f2ead8', INK, 10, 'Lora', 700);
  if (writing) for (let i = 0; i < 4; i++) paper(ctx, xs[i] + 60, 985, .8, (i % 2 ? .1 : -.1));
  const lits = [0, 1, 2, 3, 4].map(i => backOut(clamp((lt - .55 - i * .12) / .2)));
  darkness(ctx, .5 - lits.reduce((a, b) => a + b, 0) / 5 * .35, '#0a0610');
  applyCam(ctx, cam, 1);
  for (let i = 0; i < 5; i++) drawCandle(ctx, 150 + i * 195, 985, .8, lits[i], t, 380);
} });
// J — the real cause? huge wildfires in Canada's forests
SHOTS.push({ start: 24.3, end: 27.95, tr: 'whip', draw(ctx, lt, t) {
  const fire = clamp((lt - 1.55) / .6);
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.65, 1.1]]), r: 0 };
  applyCam(ctx, cam, .08); drawSky(ctx, mix('#2a3346', '#3a1a14', fire), mix('#5a6478', '#ff8a3a', fire));
  applyCam(ctx, cam, .2);
  for (let i = 0; i < 4; i++) puff(ctx, 100 + i * 290, 520 - lt * 30 - i * 20, 150 + fire * 40, t, '#4a3a36', 11 + i, fire * .9);
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#3f7a3a'; ctx.fillRect(-1000, 1150, 3000, 1500); line(ctx, -1000, 1150, 2000, 1150, 6);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
    const x = -100 + i * 160 + row * 80, y = 1050 + row * 110, s = .9 + row * .2;
    drawPine(ctx, x, y, s, .2 + row * .05, Math.sin(t * 1.3 + i) * .015);
    const ig = clamp((fire - ((i * 37 + row * 11) % 9) / 18) * 3);
    flame(ctx, x + 10, y - 120 * s, 260 * s * ig, t, i + row * 9, ig);
  }
  fireGlow(ctx, 540, 900, 900, fire * .8);
  const qa = clamp((lt - .12) / .1) * (1 - clamp((lt - 1.4) / .2));
  qmark(ctx, 540, 600, 300 * backOut(clamp((lt - .12) / .25)), qa, Math.sin(t * 3) * .1);
  signpost(ctx, 540, 1540, 1.2 * backOut(clamp((lt - 3.15) / .3)), 'CANADA');
} });
// K — explainer: smoke drifts south, meets fog, blots out the sun
SHOTS.push({ start: 27.95, end: 31.85, tr: 'whip', draw(ctx, lt, t) {
  const blot = clamp((lt - 2.75) / .9);
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 900 + hh[1], z: 1.0 + lt * .02, r: 0 };
  applyCam(ctx, cam, 1);
  darkSky(ctx, .15 + blot * .85);
  drawSun(ctx, 860, 480, 80, t, 1 - blot);
  // ground strip, forest on the left (north), village on the right (south)
  ctx.fillStyle = mix('#6fb85a', '#1a2016', blot * .6); ctx.fillRect(-400, 1120, 1900, 900); line(ctx, -400, 1120, 1500, 1120, 6);
  for (let i = 0; i < 5; i++) { const x = 30 + i * 85; drawPine(ctx, x, 1125, .55, .1); flame(ctx, x + 5, 1125 - 70, 150, t, i, 1); }
  fireGlow(ctx, 200, 1000, 400, .7);
  drawChurch(ctx, 940, 1125, .45, blot * .7); litCottage(ctx, 720, 1125, .42, blot * .7, blot, t);
  text(ctx, 'CANADA', 200, 1185, 50, '#fff', INK, 10, 'Poppins', 700);
  text(ctx, 'NEW ENGLAND', 830, 1185, 50, '#fff', INK, 10, 'Poppins', 700);
  // smoke column, then the drifting bank
  for (let i = 0; i < 4; i++) puff(ctx, 180 + i * 20, 960 - i * 110 - Math.sin(t + i) * 10, 70 + i * 25, t, '#5a4a46', 21 + i, 1);
  const front = kf(lt, [[.2, 220], [1.6, 1050]]);
  for (let x = 220, j = 0; x < front; x += 120, j++) puff(ctx, x, 540 + Math.sin(j * 1.7) * 40 + Math.sin(t + j) * 8, 120 + blot * 50, t, mix('#6a5a54', '#2a2026', blot), 30 + j, 1);
  arrowR(ctx, 260, 300, 260 + (760 - 260) * easeOut(clamp((lt - .4) / 1.0)), clamp((lt - .4) * 5) * (1 - blot), '#ffe14d');
  // fog rises around the village
  const fog = clamp((lt - 2.2) / .5);
  fogBand(ctx, 480, 1200, 1080 - fog * 60, 50 + fog * 90, t, fog);
  // the merged layer covers the sun
  if (blot > 0) for (let i = 0; i < 4; i++) puff(ctx, 640 + i * 130, 470 + (i % 2) * 40, 150 * blot + 40, t, '#2e242a', 50 + i, clamp(blot * 1.5));
  darkness(ctx, blot * .35, '#0a0610');
} });
// L — old tree rings still carry the fire scars
SHOTS.push({ start: 31.85, end: 34.85, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, .98], [1.5, 1.0], [3.0, 1.12]]), r: 0 };
  applyCam(ctx, cam, .08); drawSky(ctx, '#4aaeea', '#d8f1fb');
  applyCam(ctx, cam, .1); drawSun(ctx, 880, 240, 60, t, .8);
  applyCam(ctx, cam, .3);
  for (let i = 0; i < 8; i++) drawPine(ctx, -200 + i * 200 + (i % 2) * 60, 560, .8 + (i % 3) * .1, .05, Math.sin(t * 1.3 + i) * .02);
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#6fb85a'; ctx.fillRect(-1000, 540, 3000, 2000);
  const [sx, sy] = drawRings(ctx, 540, 860, 330, clamp((lt - 1.6) / .25), t);
  const mk = clamp((lt - .55) / .8);
  magnifier(ctx, lerp(1100, sx + 10, ease(mk)), lerp(1300, sy + 10, ease(mk)), 120, .7);
  const la = backOut(clamp((lt - 1.75) / .3));
  if (la > 0) { ctx.save(); ctx.translate(sx + 170, sy - 160); ctx.scale(la, la); rrect(ctx, -110, -50, 220, 100, 20); fillStroke(ctx, '#e0392f', 7); text(ctx, '1780', 0, 2, 64, '#fff', INK, 0, 'Poppins', 700); ctx.restore(); }
} });
// M — payoff: what would you have done? Strange Days, part 1
SHOTS.push({ start: 34.85, end: 39.4, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .025, r: 0 };
  applyCam(ctx, cam, .4); hallScene(ctx, .55);
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(FARMER, { x: 540, y: 1860, s: 1100, shadow: false, arms: { L: [.3, -.1], R: { ik: [.24, -.5], bend: -1 } }, headTilt: Math.sin(t * 1.2) * .03,
    face: { eyes: 'normal', look: [0, 0], mouth: lt > .7 ? 'smirk' : 'flat', browOne: lt > .7 ? 1 : 0 } }));
  darkness(ctx, .5, '#0a0610');
  applyCam(ctx, cam, 1);
  drawCandle(ctx, 540 + .245 * 1100, 1860 - .5 * 1100 + 25, 1.2, 1, t, 650);
  const qa = clamp((lt - .7) / .1) * (1 - clamp((lt - 2.2) / .2));
  qmark(ctx, 540, 560, 220 * backOut(clamp((lt - .7) / .25)), qa, Math.sin(t * 3) * .12);
  const ta = backOut(clamp((lt - 2.3) / .35));
  if (ta > 0) {
    ctx.save(); ctx.translate(540, 470); ctx.scale(ta, ta); ctx.rotate(-.03);
    rrect(ctx, -400, -150, 800, 290, 30); fillStroke(ctx, '#ffe14d', 10);
    text(ctx, 'STRANGE DAYS', 0, -55, 104, INK, INK, 0, 'Lora', 700);
    text(ctx, 'part 1', 0, 70, 70, '#e0392f', INK, 0, 'Poppins', 700);
    ctx.restore();
  }
} });
