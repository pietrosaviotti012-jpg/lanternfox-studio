// ---------- Flight 19 (5 December 1945): shot list (seconds of the voiceover) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
const FORM = [[0, 0], [-260, -90], [-260, 90], [-520, -180], [-520, 180]]; // V formation offsets (leader first)

function daySea(ctx, cam, t, horizon = 1080) {
  applyCam(ctx, cam, .1); drawSky(ctx, '#3ea6ee', '#c9ecfb', -400, horizon);
  applyCam(ctx, cam, .15); drawSun(ctx, 860, 300, 70, t, .9);
  applyCam(ctx, cam, .25); drawCloud(ctx, 180 + t * 10, 330, 110, 1); drawCloud(ctx, 880 + t * 6, 560, 80, 2); drawCloud(ctx, -150 + t * 8, 760, 70, 3, .8);
  applyCam(ctx, cam, .5); drawSea(ctx, horizon, t);
}
function nightSky(ctx, cam, t, horizon = 1100, o = {}) {
  applyCam(ctx, cam, .08); drawSky(ctx, o.top || '#0a0f24', o.bot || '#24335a', -400, horizon);
  stars(ctx, t, o.stars == null ? 1 : o.stars);
  applyCam(ctx, cam, .12); if (o.moon !== false) moon(ctx, o.mx || 820, o.my || 330, 60);
}
function airfield(ctx, cam, t) {
  applyCam(ctx, cam, .1); drawSky(ctx, '#3ea6ee', '#d4f0fb', -400, 1100);
  applyCam(ctx, cam, .2); drawCloud(ctx, 200 + t * 8, 360, 100, 4); drawCloud(ctx, 900 + t * 5, 560, 70, 5);
  applyCam(ctx, cam, .4);
  ctx.beginPath(); ctx.moveTo(-1500, 1060); ctx.quadraticCurveTo(0, 1000, 2600, 1060); ctx.lineTo(2600, 1300); ctx.lineTo(-1500, 1300); ctx.closePath(); fillStroke(ctx, '#7cc65e', 6);
  for (let i = 0; i < 9; i++) drawPalm(ctx, -400 + i * 260 + (i % 2) * 70, 1070 + (i % 3) * 8, .55 + (i % 3) * .1, t, .1);
  applyCam(ctx, cam, 1);
  ctx.fillStyle = '#9aa3ab'; ctx.fillRect(-2000, 1080, 5080, 3000);
  ctx.fillStyle = '#7f8890'; ctx.fillRect(-2000, 1080, 5080, 26);
  for (let i = -8; i < 20; i++) { rrect(ctx, i * 260 + 40, 1480, 140, 22, 8); ctx.fillStyle = '#f4f0e0'; ctx.fill(); }
}

const SHOTS = [];
// A — hook: five planes fly out over the sea and shrink away to nothing
SHOTS.push({ start: 0, end: 3.2, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03, r: Math.sin(t * .6) * .006 };
  daySea(ctx, cam, t);
  applyCam(ctx, cam, 1);
  const p = clamp(lt / 2.6), e = easeIn(p) * .6 + p * .4;
  const s = lerp(.8, .06, Math.pow(p, .75)), lx = lerp(700, 640, e), ly = lerp(700, 1020, e);
  const fade = 1 - clamp((lt - 2.2) / .45);
  if (fade > 0) {
    ctx.save(); ctx.globalAlpha = fade;
    for (let i = FORM.length - 1; i >= 0; i--) { const [ox, oy] = FORM[i]; drawAvenger(ctx, lx + ox * s * 1.25, ly + oy * s * 1.5 + Math.sin(t * 2 + i) * 8 * s, s * (1 - Math.abs(oy) / 900), t + i, { ang: -.04, num: i + 1 }); }
    ctx.restore();
  }
  const qa = backOut(clamp((lt - 2.7) / .3));
  if (qa > 0) qmark(ctx, 640, 860, 220 * qa, 1, Math.sin(t * 3) * .12);
} });
// B1 — December 5, 1945: the flight line in Florida
SHOTS.push({ start: 3.2, end: 6.25, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] + lt * 14, y: 960 + hh[1], z: kf(lt, [[0, 1.1], [3, 1.0]]), r: 0 };
  airfield(ctx, cam, t);
  applyCam(ctx, cam, 1);
  for (let i = 0; i < 3; i++) drawAvenger(ctx, -60 + i * 470, 1080 + i * 6, .62, t + i, { prop: lt > 1.6 + i * .3 ? 1 : .1, num: 22 + i, pilot: false });
  // a pilot jogs to his plane
  const px = kf(lt, [[0, 1000], [3, 700]], v => v);
  drawStick(ctx, C(PILOT, { x: px, y: 1220, s: 330, flip: -1, legs: walkLegs(t, 12), arms: { L: [.3 + Math.sin(t * 12) * .5, -.3], R: [.3 - Math.sin(t * 12) * .5, -.3] }, face: { eyes: 'normal', look: [-.5, 0], mouth: 'smile' } }));
  const cp = backOut(clamp((lt - .2) / .3));
  if (cp > 0) calendar2(ctx, 540, 520, 1.15 * cp, 'DEC 5', '1945');
} });
// B2 — five Navy Avengers take off from Florida
SHOTS.push({ start: 6.25, end: 9.45, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const roll = clamp(lt / 3.2), px = lerp(330, 1050, easeIn(roll) * .7 + roll * .3);
  const lift = clamp((lt - 1.2) / 2);
  const py = 1050 - easeIn(lift) * 520;
  const cam = { x: 540 + hh[0] + lt * 30, y: 960 + hh[1] - lift * 90, z: 1.02 + lt * .03, r: -lift * .02 };
  airfield(ctx, cam, t);
  applyCam(ctx, cam, .3);
  for (let i = 1; i < 5; i++) { const k = clamp((lt - .3 * i) / 3); if (k > 0) drawAvenger(ctx, 200 + i * 180 + k * 400, 420 - i * 30 - k * 60, .2, t + i, { ang: -.12, pilot: false }); }
  applyCam(ctx, cam, 1);
  if (lift < .05) { puff(ctx, px - 220, 1140, 40 + (t * 60) % 30, t, '#e8e4dc', 7, .7); }
  drawAvenger(ctx, px, py, .78, t, { ang: -lift * .22, num: 28 });
  const sp = backOut(clamp((lt - 1.6) / .3));
  if (sp > 0) signpost(ctx, 820, 1230, 1.1 * sp, 'FLORIDA');
} });
// C — fourteen men
SHOTS.push({ start: 9.45, end: 10.4, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.06 - lt * .04, r: 0 };
  airfield(ctx, cam, t);
  applyCam(ctx, cam, 1);
  for (let i = 0; i < 14; i++) {
    const row = i < 7 ? 0 : 1, j = row ? i - 7 : i;
    const k = backOut(clamp((lt - i * .025) / .2));
    if (k <= 0) continue;
    const x = 150 + j * 130 + row * 65, y = row ? 1210 : 1060;
    drawStick(ctx, C(PILOTS[i % 3], { x, y, s: 210 * k, bob: Math.sin(t * 6 + i) * .006, arms: i % 4 === 0 ? { L: [.3, -.1], R: [2.6, .2] } : POSE.idle.arms, face: { eyes: i % 5 === 2 ? 'happy' : 'normal', look: [0, .1], mouth: 'smile' } }));
  }
  const bk = backOut(clamp((lt - .05) / .25));
  if (bk > 0) { ctx.save(); ctx.translate(540, 540); ctx.scale(bk, bk); circle(ctx, 0, 0, 150); fillStroke(ctx, '#ffe14d', 10); text(ctx, '14', 0, 6, 150, INK, INK, 0, 'Poppins', 700); ctx.restore(); }
} });
// D — the leader radios: his compasses aren't working
SHOTS.push({ start: 10.4, end: 13.3, tr: 'whip', draw(ctx, lt, t) {
  const sh = lt > 1.5 && lt < 2.2 ? shake(t, 8 * (2.2 - lt) / .7) : [0, 0];
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.03 + lt * .04, r: Math.sin(t * 1.3) * .012 };
  applyCam(ctx, cam, .2); drawSky(ctx, '#5fb2e8', '#d4f0fb', -400, 1150);
  applyCam(ctx, cam, .3); drawCloud(ctx, 700 - lt * 120, 500, 120, 6); drawCloud(ctx, 1200 - lt * 120, 800, 90, 7);
  applyCam(ctx, cam, .4); drawSea(ctx, 1150, t * 4);
  applyCam(ctx, cam, 1);
  // canopy frame
  ctx.lineWidth = 46; ctx.strokeStyle = '#3d63a6'; ctx.beginPath(); ctx.moveTo(-100, 180); ctx.quadraticCurveTo(540, 60, 1180, 180); ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  line(ctx, 120, 140, 40, 1300, 40, INK); line(ctx, 120, 140, 40, 1300, 28, '#3d63a6');
  const talking = lt > .5;
  drawStick(ctx, C(PILOT, { x: 700, y: 1760, s: 900, shadow: false, lean: Math.sin(t * 1.3) * .02,
    arms: { L: [.4, -.2], R: { ik: [-.13, -.68], bend: -1 } },
    face: { eyes: 'wide', look: [-.8, -.2], mouth: talking && Math.sin(t * 18) > 0 ? 'o' : 'frown', browUp: 1, browAng: -.25 }, headTilt: -.05 }));
  // microphone in his hand
  circle(ctx, 700 - .13 * 900, 1760 - .68 * 900, 26); fillStroke(ctx, '#2b2328', 6);
  radioWaves(ctx, 560, 1140, 1, t, talking ? 1 : 0, -1);
  // the compass, needle spinning
  const ca = backOut(clamp((lt - .15) / .3));
  if (ca > 0) {
    const ang = lt < 1.5 ? Math.sin(t * 3) * .3 : (lt - 1.5) * 14 + Math.sin(t * 9) * .8;
    ctx.save(); ctx.translate(300, 560); ctx.scale(ca, ca); drawCompass(ctx, 0, 0, 175, ang); ctx.restore();
    if (lt > 1.5) { burst(ctx, 470, 400, 50 * clamp((lt - 1.5) / .15) * (1 - clamp((lt - 1.9) / .2)), 9, '#ff5a3a', 3); }
  }
  if (lt > 1.6) sweat(ctx, 860, 950 + (lt - 1.6) * 60, 40, clamp((lt - 1.6) * 4));
} });
// E — he was sure they were lost
SHOTS.push({ start: 13.3, end: 14.6, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.15 - lt * .12, r: Math.sin(t * .8) * .01 };
  applyCam(ctx, cam, .1); drawSky(ctx, '#5a9ad0', '#c4dcea', -400, 1150);
  applyCam(ctx, cam, .25); drawCloud(ctx, 200 - lt * 30, 380, 120, 8, .9); drawCloud(ctx, 900 - lt * 30, 300, 90, 9, .9);
  applyCam(ctx, cam, .5); drawSea(ctx, 1150, t, 2600, ['#6bb6cc', '#16809e', '#0b5f80']);
  applyCam(ctx, cam, 1);
  const px = 540 + Math.sin(lt * 2) * 40;
  drawAvenger(ctx, px, 820, .7, t, { ang: Math.sin(lt * 3) * .12, num: 28 });
  const ms = [[260, 560, .1], [820, 600, .35], [560, 470, .6]];
  ms.forEach(([x, y, d], i) => { const k = backOut(clamp((lt - d) / .25)); if (k > 0) qmark(ctx, x, y, 150 * k, 1, Math.sin(t * 3 + i) * .2); });
} });
// F — the radio grows fainter and fainter
SHOTS.push({ start: 14.6, end: 16.65, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0] - lt * 20, y: 960 + hh[1], z: 1.02 + lt * .06, r: 0 };
  applyCam(ctx, cam, .5);
  ctx.fillStyle = '#d9c9a2'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let y = -600; y < 2600; y += 120) line(ctx, -600, y, 1700, y, 4, '#c6b48a');
  rrect(ctx, 660, 260, 300, 380, 10); fillStroke(ctx, '#f2ead8', 8); rrect(ctx, 680, 280, 260, 340, 6); fillStroke(ctx, '#5fb2e8', 6);
  line(ctx, 810, 280, 810, 620, 7, '#f2ead8'); line(ctx, 680, 450, 940, 450, 7, '#f2ead8');
  applyCam(ctx, cam, 1);
  const lean = kf(lt, [[0, 0], [1.8, .14]]);
  drawStick(ctx, C(RADIOMAN, { x: 760, y: 1590, s: 850, shadow: false, lean: -lean,
    arms: { L: { ik: [.2, -.82], bend: 1 }, R: [.5, -.4] },
    face: { eyes: 'normal', look: [-1, .2], mouth: 'frown', browUp: .6, browAng: -.15 }, headTilt: -.1 - lean }));
  const hr = .19 * 850; const hx = 760 - Math.sin(lean) * .765 * 850, hy = 1590 - Math.cos(lean) * .765 * 850;
  headset(ctx, hx, hy, hr);
  rrect(ctx, -200, 1180, 1500, 80, 10); fillStroke(ctx, '#8a5a34', 7);
  ctx.fillStyle = '#6b4226'; ctx.fillRect(-200, 1260, 1500, 900);
  const k = kf(lt, [[0, 1], [1.9, .08]]);
  drawRadio(ctx, 330, 1000, .95, t, k);
  radioWaves(ctx, 330 - 100 * .95, 1000, 1.1, t, k, -1);
  // static crackle in the speaker
  const R = rng(Math.floor(t * 20)); ctx.save(); ctx.globalAlpha = .6 * (1 - k);
  for (let i = 0; i < 12; i++) { const x = 140 + R() * 190, y = 890 + R() * 220; line(ctx, x, y, x + 16 + R() * 20, y, 5, '#ffe14d'); }
  ctx.restore();
} });
// G — night, a rough sea, the fuel runs out
SHOTS.push({ start: 16.65, end: 19.65, tr: 'whip', draw(ctx, lt, t) {
  const sh = lt > 2.6 ? shake(t, 6) : [0, 0];
  const hh = handheld(t, 4);
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.0 + lt * .04, r: Math.sin(t * 1.1) * .015 };
  const dusk = clamp(lt / .6);
  nightSky(ctx, cam, t, 1100, { top: mix('#3d6fb0', '#0a0f24', dusk), bot: mix('#f0a060', '#24335a', dusk), stars: dusk, moon: dusk > .5 });
  applyCam(ctx, cam, .2); drawCloud(ctx, 300 - lt * 40, 560, 140, 10, .25); drawCloud(ctx, 950 - lt * 40, 420, 100, 11, .2);
  applyCam(ctx, cam, .6); nightSea(ctx, 1100, t, kf(lt, [[0, .5], [1.4, 1.4]]));
  applyCam(ctx, cam, 1);
  const out = lt > 2.63;
  const px = lerp(220, 860, lt / 3), py = 880 + (out ? (lt - 2.63) * 120 : 0) + Math.sin(t * 2.5) * 14;
  drawAvenger(ctx, px, py, .55, t, { ang: out ? .1 : Math.sin(t * 2) * .05, tint: .45, prop: out ? 0 : 1, num: 28 });
  if (out) for (let i = 0; i < 3; i++) puff(ctx, px + 160 - i * 30, py - 20 - (lt - 2.63) * 80 * (i + 1), 22 + i * 8, t, '#6a6a72', 20 + i, 1 - clamp((lt - 2.63 - i * .1) / .5));
  rain(ctx, t, .5);
  const fa = backOut(clamp((lt - .9) / .3));
  if (fa > 0) { ctx.save(); ctx.translate(540, 480); ctx.scale(fa, fa); drawFuel(ctx, 0, 0, 165, kf(lt, [[1, .32], [2.6, .0]])); ctx.restore(); }
  if (lt > 2.6) burst(ctx, 680, 360, 60 * clamp((lt - 2.6) / .12) * (1 - clamp((lt - 2.95) / .1)), 9, '#ff5a3a', 4);
} });
// H — no wreckage was ever found
SHOTS.push({ start: 19.65, end: 21.4, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .03, r: 0 };
  applyCam(ctx, cam, .1); drawSky(ctx, '#7fb4dc', '#dceaf2', -400, 700);
  applyCam(ctx, cam, .5); drawSea(ctx, 700, t, 3000, ['#86c6d6', '#2a8fb0', '#126c90']);
  applyCam(ctx, cam, 1);
  const k = ease(clamp(lt / 1.5));
  const mx = lerp(250, 830, k), my = 900 + Math.sin(k * Math.PI) * -120;
  // a small search boat far out
  drawFreighter(ctx, 840, 712, .2, t);
  magnifier(ctx, mx, my, 150, .7);
  const qa = backOut(clamp((lt - 1.25) / .25));
  if (qa > 0) qmark(ctx, mx, my - 5, 150 * qa, 1, Math.sin(t * 3) * .12);
} });
// I — but it got stranger
SHOTS.push({ start: 21.4, end: 22.6, tr: 'whip', draw(ctx, lt, t) {
  const cam = { x: 540, y: 960, z: 1.0 + easeOut(clamp(lt / 1.1)) * .14, r: 0 };
  applyCam(ctx, cam, .5);
  ctx.fillStyle = '#2a2140'; ctx.fillRect(-600, -600, 2300, 3200);
  const g = ctx.createRadialGradient(540, 900, 50, 540, 900, 900); g.addColorStop(0, 'rgba(160,110,255,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-600, -600, 2300, 3200);
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(RADIOMAN, { x: 540, y: 1990, s: 1250, shadow: false, arms: { L: [.3, -.1], R: [.3, -.1] },
    face: { eyes: lt > .25 ? 'wide' : 'normal', look: [.3, -.2], mouth: lt > .25 ? 'o' : 'flat', browUp: lt > .25 ? 1 : 0, browOne: lt > .25 ? 1 : 0 } }));
  headset(ctx, 540, 1990 - .765 * 1250, .19 * 1250);
  darkness(ctx, .15, '#140a24');
} });
// J — a PBM Mariner flying boat with 13 men goes out to search
SHOTS.push({ start: 22.6, end: 26.95, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const up = clamp((lt - 2.2) / 2.1);
  const cam = { x: 540 + hh[0] + up * 120, y: 960 + hh[1] - up * 140, z: kf(lt, [[0, 1.08], [4.3, 1.0]]), r: -up * .02 };
  nightSky(ctx, cam, t, 1100, { top: '#141a3a', bot: '#5a4a7a', mx: 260, my: 380 });
  applyCam(ctx, cam, .6); nightSea(ctx, 1100, t, .5);
  applyCam(ctx, cam, 1);
  const px = lerp(420, 900, easeIn(clamp((lt - 1.4) / 2.9))), py = 1080 - easeIn(up) * 420;
  if (up < .1) for (let i = 0; i < 3; i++) puff(ctx, px - 200 - i * 70, 1110, 30 + ((t * 80 + i * 20) % 30), t, '#cfd8e8', 30 + i, .7 * (lt > 1.4 ? 1 : 0));
  drawMariner(ctx, px, py, .78, t, { ang: -up * .18, tint: .3, lit: 1, prop: lt > .6 ? 1 : .2 });
  const la = backOut(clamp((lt - .65) / .3));
  if (la > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(la, la); rrect(ctx, -330, -70, 660, 140, 24); fillStroke(ctx, '#fffaf0', 8); text(ctx, 'PBM MARINER', 0, 4, 76, INK, INK, 0, 'Poppins', 700); ctx.restore(); }
  const bk = backOut(clamp((lt - 2.2) / .3));
  if (bk > 0) { ctx.save(); ctx.translate(820, 690); ctx.scale(bk, bk); circle(ctx, 0, 0, 110); fillStroke(ctx, '#ffe14d', 9); text(ctx, '13', 0, 5, 110, INK, INK, 0, 'Poppins', 700); ctx.restore(); }
} });
// K — it vanished too
SHOTS.push({ start: 26.95, end: 28.15, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .05, r: 0 };
  nightSky(ctx, cam, t, 1300, { top: '#0a0f24', bot: '#2a2a4a', moon: false });
  applyCam(ctx, cam, 1);
  const px = lerp(260, 600, lt / 1.2), py = 900 - lt * 60;
  const gone = clamp((lt - .45) / .2);
  if (gone < 1) { ctx.save(); ctx.globalAlpha = 1 - gone; drawMariner(ctx, px, py, .45, t, { ang: -.08, tint: .45, lit: 1 }); ctx.restore(); }
  for (const [x, y, s, sd] of [[720, 760, 190, 31], [460, 1000, 160, 32], [880, 1040, 130, 33]]) drawCloud(ctx, x + Math.sin(t * .5 + sd) * 10, y, s, sd, .9);
  if (lt > .5) puff(ctx, 620, 860, 80 * easeOut(clamp((lt - .5) / .4)), t, '#8a8aa8', 9, 1 - clamp((lt - .7) / .4));
  const qa = backOut(clamp((lt - .65) / .25));
  if (qa > 0) qmark(ctx, 600, 560, 190 * qa, 1, Math.sin(t * 3) * .15);
} });
// L — a passing ship sees flames on the water
SHOTS.push({ start: 28.15, end: 30.45, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.02 + lt * .04, r: Math.sin(t * 1.1) * .008 };
  nightSky(ctx, cam, t, 1050, { top: '#0a0f24', bot: '#2a335a', mx: 860, my: 300 });
  applyCam(ctx, cam, .6); nightSea(ctx, 1050, t, .4);
  const fk = clamp((lt - 1.1) / .25);
  fireGlow(ctx, 250, 1040, 380, fk);
  for (let i = 0; i < 4; i++) flame(ctx, 205 + i * 30, 1048, (80 + (i % 2) * 40) * backOut(clamp((lt - 1.1 - i * .05) / .3)), t, i + 1, fk);
  if (fk > 0) { ctx.save(); ctx.globalAlpha = .4 * fk; ellipse(ctx, 250, 1075, 110, 14); ctx.fillStyle = '#ff9a3a'; ctx.fill(); ctx.restore(); }
  applyCam(ctx, cam, 1);
  // ship rail in the foreground
  line(ctx, -200, 1470, 1300, 1470, 22, INK); line(ctx, -200, 1470, 1300, 1470, 12, '#e8e4dc');
  for (let x = -100; x < 1300; x += 160) line(ctx, x, 1470, x, 1920, 14, '#e8e4dc');
  const s = 950, x = 760, y = 1800;
  const spot = lt > 1.25;
  drawStick(ctx, C(SAILOR, { x, y, s, flip: -1, shadow: false, lean: spot ? -.04 : 0,
    arms: { L: { ik: [-.02, -.72], bend: -1 }, R: { ik: [-.14, -.72], bend: 1 } },
    face: { eyes: 'normal', look: [1, 0], mouth: spot ? 'o' : 'flat', browUp: spot ? 1 : 0 } }));
  // binoculars over the eyes
  const by = y - .77 * s, bx = x - .02 * s;
  for (const dx of [-.075, .075]) { rrect(ctx, bx + dx * s - .055 * s, by - .05 * s, .11 * s, .12 * s, 16); fillStroke(ctx, '#2b2328', 7); }
  rrect(ctx, bx - .02 * s, by - .03 * s, .04 * s, .05 * s, 6); fillStroke(ctx, '#3a3a44', 5);
  if (spot) burst(ctx, 330, 900, 50 * clamp((lt - 1.25) / .12) * (1 - clamp((lt - 1.6) / .15)), 9, '#ffe14d', 6);
} });
// M — the legend: the Bermuda Triangle
SHOTS.push({ start: 30.45, end: 34.2, tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 2);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [3.7, 1.07]]), r: 0 };
  applyCam(ctx, cam, .3); ctx.fillStyle = '#3a2a3a'; ctx.fillRect(-600, -600, 2300, 3200);
  const R = rng(9); for (let i = 0; i < 30; i++) { ctx.fillStyle = 'rgba(255,255,255,.04)'; circle(ctx, R() * 1080, R() * 1920, 40 + R() * 90); ctx.fill(); }
  applyCam(ctx, cam, 1);
  const K = 36, cx = 540, cy = 800;
  const spook = clamp((lt - 2.3) / .8);
  drawMap(ctx, cx, cy, K, t, { sea: mix('#7cc4dc', '#4a5a9a', spook), land: mix('#8fcf6a', '#6a8a5a', spook) });
  ctx.save(); rrect(ctx, cx - 12 * K, cy - 9 * K, 24 * K, 18 * K, 12); ctx.clip();
  // Flight 19's route out of Fort Lauderdale, east over the Bahamas
  const route = [[-80.1, 26.1], [-78.9, 25.9], [-78.4, 26.8], [-79.3, 27.3]].map(([lo, la]) => mapXY(lo, la, cx, cy, K));
  const rk = clamp((lt - .2) / 1.3) * (route.length - 1);
  ctx.setLineDash([16, 14]); ctx.lineWidth = 9; ctx.strokeStyle = '#fffaf0'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(...route[0]);
  for (let i = 1; i <= Math.ceil(rk) && i < route.length; i++) { const f = clamp(rk - (i - 1)); ctx.lineTo(lerp(route[i - 1][0], route[i][0], f), lerp(route[i - 1][1], route[i][1], f)); }
  ctx.stroke(); ctx.setLineDash([]);
  circle(ctx, ...route[0], 14); fillStroke(ctx, '#e0392f', 5);
  // the triangle: Miami, Bermuda, Puerto Rico
  const tri = [[-80.2, 25.8], [-64.8, 32.3], [-66.1, 18.4]].map(([lo, la]) => mapXY(lo, la, cx, cy, K));
  const tk = clamp((lt - 2.4) / .9) * 3;
  if (tk > 0) {
    if (tk >= 3) { path(ctx, tri); ctx.fillStyle = `rgba(224,57,47,${.22 + Math.sin(t * 4) * .06})`; ctx.fill(); }
    ctx.lineWidth = 12; ctx.strokeStyle = '#e0392f'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...tri[0]);
    for (let i = 1; i <= Math.ceil(tk); i++) { const a = tri[(i - 1) % 3], b = tri[i % 3], f = clamp(tk - (i - 1)); ctx.lineTo(lerp(a[0], b[0], f), lerp(a[1], b[1], f)); }
    ctx.stroke();
  }
  ctx.restore();
  const qa = backOut(clamp((lt - 1.5) / .25)) * (1 - clamp((lt - 2.3) / .2));
  if (qa > 0) qmark(ctx, route[3][0] + 40, route[3][1] - 70, 110 * qa, 1, Math.sin(t * 3) * .15);
  const ta = backOut(clamp((lt - 1.55) / .3));
  if (ta > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(ta, ta); ctx.rotate(-.02); rrect(ctx, -250, -62, 500, 124, 22); fillStroke(ctx, '#7a4bc4', 8); text(ctx, 'LEGEND', 0, 4, 80, '#fff', INK, 0, 'Lora', 700); ctx.restore(); }
} });
// N — the Navy's final verdict: causes unknown
SHOTS.push({ start: 34.2, end: 36.95, tr: 'whip', draw(ctx, lt, t) {
  const sh = lt > 1.56 && lt < 1.9 ? shake(t, 10 * (1.9 - lt) / .34) : [0, 0];
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.02 + lt * .03, r: 0 };
  applyCam(ctx, cam, .5);
  ctx.fillStyle = '#5a6f8a'; ctx.fillRect(-600, -600, 2300, 3200);
  for (let x = -600; x < 1700; x += 180) line(ctx, x, -600, x, 2600, 6, '#50637c');
  // flag on the wall
  rrect(ctx, 120, 230, 240, 160, 6); fillStroke(ctx, '#f6f1e8', 6); ctx.save(); rrect(ctx, 120, 230, 240, 160, 6); ctx.clip(); ctx.fillStyle = '#e0392f'; for (let i = 0; i < 7; i += 2) ctx.fillRect(120, 230 + i * 23, 240, 23); ctx.fillStyle = '#2a3f8f'; ctx.fillRect(120, 230, 100, 92); ctx.restore();
  applyCam(ctx, cam, 1);
  drawStick(ctx, C(ADMIRAL, { x: 790, y: 1560, s: 880, shadow: false,
    arms: { L: { ik: [-.3, kf(lt, [[0, -.55], [1.3, -.85], [1.56, -.42, easeIn]])], bend: -1 }, R: [.3, -.1] },
    face: { eyes: lt > 1.6 ? 'half' : 'normal', look: [-.7, .4], mouth: 'flat', browAng: .2 } }));
  rrect(ctx, -200, 1150, 1500, 70, 10); fillStroke(ctx, '#7a4a2a', 8); ctx.fillStyle = '#5e3820'; ctx.fillRect(-200, 1220, 1500, 900);
  folder(ctx, 400, 960, .78, 'FLIGHT 19');
  const sy = kf(lt, [[0, 640], [1.3, 600], [1.56, 935, easeIn], [1.9, 935], [2.4, 640]]);
  stampMark(ctx, 400, 1010, .62, clamp((lt - 1.56) / .12), 'CAUSES', 'UNKNOWN');
  rubberStamp(ctx, 400, sy, .9);
} });
// O — payoff: what do you think happened? Strange Days, part 3
SHOTS.push({ start: 36.95, end: 41.6, tr: 'cut', draw(ctx, lt, t) {
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .025, r: 0 };
  applyCam(ctx, cam, .1); drawSky(ctx, '#3a3a7a', '#ff9a5a', -200, 1100);
  applyCam(ctx, cam, .15); drawSun(ctx, 540, 1080, 120, t, .8);
  applyCam(ctx, cam, .5); drawSea(ctx, 1100, t, 2600, ['#f0a070', '#7a5a8a', '#2a2a5a']);
  applyCam(ctx, cam, 1);
  const p = clamp(lt / 4.6), s = lerp(.26, .1, p);
  for (let i = FORM.length - 1; i >= 0; i--) { const [ox, oy] = FORM[i]; drawAvenger(ctx, lerp(380, 640, p) + ox * s, lerp(820, 950, p) + oy * s * .5, s, t + i, { ang: -.03, tint: .9, pilot: false }); }
  const qa = clamp((lt - .55) / .1) * (1 - clamp((lt - 2.3) / .2));
  qmark(ctx, 540, 560, 220 * backOut(clamp((lt - .55) / .25)), qa, Math.sin(t * 3) * .12);
  const ta = backOut(clamp((lt - 2.5) / .35));
  if (ta > 0) {
    ctx.save(); ctx.translate(540, 470); ctx.scale(ta, ta); ctx.rotate(-.03);
    rrect(ctx, -400, -150, 800, 290, 30); fillStroke(ctx, '#ffe14d', 10);
    text(ctx, 'STRANGE DAYS', 0, -55, 104, INK, INK, 0, 'Lora', 700);
    text(ctx, 'part 3', 0, 70, 70, '#e0392f', INK, 0, 'Poppins', 700);
    ctx.restore();
  }
} });
