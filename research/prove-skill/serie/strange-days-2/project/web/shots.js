// ---------- The Dancing Plague of 1518: shot list (seconds of the voiceover) ----------
const C = (base, extra) => Object.assign({}, base, extra);
const handheld = (t, a = 4) => shake(t * .35, a, 1, 2);
const walkLegs = (t, sp = 9, amp = .55) => ({ L: [Math.sin(t * sp) * amp + .05, -Math.max(0, Math.sin(t * sp + 1)) * .7], R: [-Math.sin(t * sp) * amp + .05, -Math.max(0, -Math.sin(t * sp + 1)) * .7] });
// shot boundaries (start of each shot, last = end of the reel) and key word times, from audio/words_ref.json
const B = TIMES.B;
const K = TIMES.K;

const SHOTS = [];
// A: hook. A man in the square, his feet start dancing on their own
SHOTS.push({ start: B[0], end: B[1], tr: 'whip', draw(ctx, lt, t) {
  const go = K.stop - B[0];             // "couldn't stop": he panics
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.04 + lt * .05, r: Math.sin(t * .5) * .006 };
  townBG(ctx, t, cam);
  applyCam(ctx, cam, 1);
  const e = kf(lt, [[0, .7], [go, 1]]);
  const d = dance(t, 0, e);
  const scared = lt > go - .1;
  drawStick(ctx, C(TOWN18[0], { x: 540, y: 1700, s: 900, legs: d.legs, arms: scared ? { L: [2.4 + Math.sin(t * 17) * .2, .4], R: [2.4 - Math.sin(t * 17) * .2, .4] } : d.arms, lean: d.lean, bob: d.bob,
    face: { eyes: 'wide', look: scared ? [0, -.3] : [0, 1], mouth: scared ? 'teeth' : 'o', browUp: 1 } }));
  if (scared) sweat(ctx, 790, 880 + (lt - go) * 90, 42, clamp((lt - go) * 4));
  // music notes nobody is playing
  for (let i = 0; i < 3; i++) { const k = (lt * .9 + i / 3) % 1; note(ctx, 260 + i * 260 + Math.sin(t * 3 + i) * 30, 760 - k * 300, 1.4, Math.sin(k * Math.PI) * .9, Math.sin(t * 4 + i) * .2); }
} });
// B: Strasbourg, July 1518. Establishing the square
SHOTS.push({ start: B[1], end: B[2], tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0] - lt * 14, y: 960 + hh[1], z: kf(lt, [[0, 1.12], [B[2] - B[1], 1.0]]), r: 0 };
  townBG(ctx, t, cam);
  applyCam(ctx, cam, 1);
  // townsfolk walking by, normal day
  for (let i = 0; i < 3; i++) {
    const x = 150 + i * 330 + lt * 60 * (i % 2 ? -1 : 1), y = 1470 + (i % 2) * 20;
    drawStick(ctx, C(TOWN18[i + 1], { x, y, s: 380, flip: i % 2 ? -1 : 1, legs: walkLegs(t + i, 10), arms: { L: [.3 - Math.sin((t + i) * 10) * .4, -.3], R: [.3 + Math.sin((t + i) * 10) * .4, -.3] }, face: { eyes: 'normal', look: [i % 2 ? -.5 : .5, 0], mouth: 'smile' } }));
  }
  signpost(ctx, 270, 1200, 1.25 * backOut(clamp((lt - (K.stras - B[1]) - .05) / .3)), 'STRASBOURG');
  const cp = backOut(clamp((lt - (K.july - B[1])) / .3));
  if (cp > 0) calendar2(ctx, 760, 520, cp, 'JULY', '1518');
} });
// C: Frau Troffea steps out of her door and begins to dance
SHOTS.push({ start: B[2], end: B[3], tr: 'whip', draw(ctx, lt, t) {
  const hh = handheld(t, 3);
  const st = K.dance - B[2];          // "began to dance"
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [st, 1.06], [st + .3, 1.12, backOut]]), r: 0 };
  applyCam(ctx, cam, .08); drawSky(ctx, '#4aaeea', '#d8f1fb');
  applyCam(ctx, cam, .12); drawSun(ctx, 880, 260, 60, t, 1);
  applyCam(ctx, cam, 1);
  const open = kf(lt, [[.1, 0], [.5, 1, backOut]]);
  drawTimberHouse(ctx, 300, 1180, 1.25, '#f6d9a0', { roof: '#c9452f', open });
  drawTimberHouse(ctx, 860, 1180, 1.25, '#e8f0d8', { roof: '#8a3a2a', door: false });
  cobbles(ctx, 1180);
  const walk = clamp((lt - .5) / (st - .6));
  const x = lerp(300, 560, ease(walk)), y = lerp(1300, 1640, ease(walk)), s = lerp(560, 860, ease(walk));
  if (lt > st) { const bb = clamp((lt - st) / .25); if (bb < 1) burst(ctx, 560, 1000, 340 * backOut(bb), 12, '#ffd23a', 5); }
  if (lt < st) drawStick(ctx, C(TROF, { x, y, s, legs: walk > 0 && walk < 1 ? walkLegs(t, 9) : undefined, arms: POSE.idle.arms, face: { eyes: 'normal', look: [.4, .2], mouth: 'flat' } }));
  else dancer(ctx, TROF, x, y, s, t, 1, 1, { eyes: 'wide', look: [0, -.4], mouth: 'o' });
  const tg = backOut(clamp((lt - (K.trof - B[2])) / .3));
  if (tg > 0 && lt < st + .2) { ctx.save(); ctx.translate(560, 560); ctx.scale(tg, tg); ctx.rotate(-.03); rrect(ctx, -270, -60, 540, 120, 24); fillStroke(ctx, '#ffe14d', 8); text(ctx, 'FRAU TROFFEA', 0, 4, 64, INK, INK, 0, 'Lora', 700); ctx.restore(); }
} });
// D: she keeps going for days: sun and moon race over her, the day counter ticks
SHOTS.push({ start: B[3], end: B[4], tr: 'whip', draw(ctx, lt, t) {
  const D = B[4] - B[3];
  const cyc = lt / D * 3.2;                          // ~3 day/night cycles
  const night = clamp(Math.sin(cyc * TAU - Math.PI / 2) * .5 + .5);
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .04, r: 0 };
  applyCam(ctx, cam, .08); drawSky(ctx, mix('#4aaeea', '#141a3a', night), mix('#d8f1fb', '#3a3a6a', night));
  applyCam(ctx, cam, .12);
  const ang = cyc * TAU;
  drawSun(ctx, 540 + Math.sin(ang) * 420, 760 - Math.cos(ang) * 420, 60, t, clamp(1 - night * 1.4));
  drawMoon(ctx, 540 - Math.sin(ang) * 420, 760 + Math.cos(ang) * 420, 50, clamp(night * 1.4 - .2));
  applyCam(ctx, cam, .7);
  drawTimberHouse(ctx, 150, 1150, 1.0, '#f6d9a0', { roof: '#c9452f', tint: night * .7, lit: night > .5 ? 1 : 0 });
  drawTimberHouse(ctx, 930, 1150, 1.0, '#e8f0d8', { roof: '#8a3a2a', tint: night * .7, lit: night > .5 ? 1 : 0, door: false });
  applyCam(ctx, cam, 1);
  cobbles(ctx, 1150, night * .7);
  const e = kf(lt, [[0, 1], [D, .55]]);
  dancer(ctx, TROF, 540, 1700, 820, t, 1, e, { eyes: lt > D * .5 ? 'half' : 'wide', look: [0, .3], mouth: lt > D * .5 ? 'frown' : 'o', browUp: lt > D * .5 ? 0 : 1 });
  sweat(ctx, 760, 900 + ((lt * 1.6) % 1) * 120, 40, Math.sin(((lt * 1.6) % 1) * Math.PI));
  const n = Math.min(4, 1 + Math.floor(lt / D * 4));
  const pk = (lt / D * 4) % 1;
  dayBoard(ctx, 540, 470, 1 + .15 * Math.max(0, 1 - pk * 5), n);
} });
// E: within a week, dozens joined her. Dancers pop in around her
SHOTS.push({ start: B[4], end: B[5], tr: 'whip', draw(ctx, lt, t) {
  const D = B[5] - B[4];
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 980 + hh[1], z: kf(lt, [[0, 1.15], [D, .98]]), r: Math.sin(t * .7) * .005 };
  townBG(ctx, t, cam, { sunX: 300 });
  applyCam(ctx, cam, 1);
  const spots = [[200, 1300], [880, 1310], [380, 1240], [700, 1240], [130, 1490], [950, 1495], [330, 1500], [750, 1505]];
  const order = spots.map((p, i) => [p, i]).sort((a, b) => a[0][1] - b[0][1]);
  order.forEach(([[x, y], i]) => {
    const at = .1 + i * (D - .6) / spots.length;
    const k = backOut(clamp((lt - at) / .25)); if (k <= 0) return;
    dancer(ctx, TOWN18[i % 8], x, y, (y > 1450 ? 400 : 300) * k, t, i + 2, 1, { eyes: i % 3 ? 'wide' : 'spiral', look: [0, -.3], mouth: i % 2 ? 'o' : 'teeth' }, { t });
    if (k < 1) puff(ctx, x, y - 20, 90, t, '#f3efe6', 30 + i, 1 - clamp((lt - at) / .3));
  });
  dancer(ctx, TROF, 540, 1520, 520, t, 1, .7, { eyes: 'half', mouth: 'frown', browUp: 0 });
} });
// F: within a month, the chronicles speak of hundreds
SHOTS.push({ start: B[5], end: B[6], tr: 'whip', draw(ctx, lt, t) {
  const D = B[6] - B[5];
  const hh = handheld(t, 2.5);
  const z = kf(lt, [[0, 1.6], [D * .55, .82]]);
  const cam = { x: 540 + hh[0], y: 900 + hh[1], z, r: 0 };
  townBG(ctx, t, cam, { cathX: 540, houses: [[-300, '#f4e3c2', '#c9452f'], [20, '#f6d9a0', '#a8402a'], [1060, '#e8f0d8', '#c9452f'], [1380, '#f4d2c2', '#8a3a2a']] });
  applyCam(ctx, cam, 1);
  const R = rng(51); const crowd = [];
  for (let r = 0; r < 5; r++) for (let i = 0; i < 12; i++) crowd.push([-260 + i * 140 + (r % 2) * 70 + R() * 30, 1180 + r * 70 + R() * 20, i + r * 12]);
  crowd.forEach(([x, y, j]) => dancer(ctx, TOWN18[j % 8], x, y, 150 + (y - 1180) * .25, t, j, 1, { eyes: 'wide', mouth: j % 2 ? 'o' : 'teeth' }, { shadow: false }));
  const bk = backOut(clamp((lt - (K.chron - B[5])) / .35));
  if (bk > 0) { applyCam(ctx, { x: 540, y: 960, z: 1, r: 0 }, 1); drawBook(ctx, 540, 1180 + (1 - bk) * 600, 1.05, clamp((lt - (K.chron - B[5])) / 1.2), t);
    const hk = backOut(clamp((lt - (K.hund - B[5])) / .3)); if (hk > 0) { ctx.save(); ctx.translate(540, 470); ctx.scale(hk, hk); ctx.rotate(-.04); rrect(ctx, -250, -80, 500, 160, 26); fillStroke(ctx, '#e0392f', 9); text(ctx, '100s', 0, 6, 112, '#fff', INK, 0, 'Poppins', 700); ctx.restore(); } }
} });
// G: the city's doctors blamed hot blood
SHOTS.push({ start: B[6], end: B[7], tr: 'cut', draw(ctx, lt, t) {
  const hot = clamp((lt - (K.hot - B[6])) / .3);
  const hh = handheld(t, 3);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.02 + lt * .05, r: 0 };
  applyCam(ctx, cam, .5); drawHall(ctx, '#7fc4ee', 0);
  applyCam(ctx, cam, 1);
  dancer(ctx, TROF, 330, 1560, 700, t, 1, .8, { eyes: 'wide', mouth: 'o' }, { cols: hot > 0 ? [mix('#d8452f', '#ff2a1a', hot), mix('#d8452f', '#ff2a1a', hot)] : TROF.cols });
  heatLines(ctx, 330, 780, 1.3, t, hot);
  if (hot > 0) fireGlow(ctx, 330, 1150, 420, hot * .5);
  drawStick(ctx, C(DOC, { x: 790, y: 1560, s: 760, flip: -1, arms: { L: [.3, -.1], R: { ik: [.28, -.62], bend: -1 } }, headTilt: .05,
    face: { eyes: hot > .5 ? 'normal' : 'smug', look: [.6, .1], mouth: hot > .5 ? 'smirk' : 'flat', browAng: .1 } }));
  drawFlask(ctx, 790 - .28 * 760 + 8, 1560 - .62 * 760 - 80, 1.4, Math.sin(t * 3) * .12, t);
  darkness(ctx, .08, '#0a0610');
} });
// H: "But their cure was even stranger: more dancing."  the doctor prescribes the dance
SHOTS.push({ start: B[7], end: B[8], tr: 'whip', draw(ctx, lt, t) {
  const pres = K.more - B[7];
  const hh = handheld(t, 3);
  const sh = lt > pres && lt < pres + .4 ? shake(t, 16 * (pres + .4 - lt) / .4) : [0, 0];
  const cam = { x: 540 + hh[0] + sh[0], y: 960 + hh[1] + sh[1], z: 1.0 + lt * .04, r: 0 };
  applyCam(ctx, cam, .5); drawHall(ctx, '#7fc4ee', 0);
  applyCam(ctx, cam, 1);
  const point = kf(lt, [[.15, 0], [.45, 1, backOut]]);
  const go = lt > pres;
  if (!go) drawStick(ctx, C(DOC, { x: 540, y: 1960, s: 1450, shadow: false, arms: { L: [.3, -.1], R: [lerp(.3, 2.6, point), lerp(-.1, .1, point)] },
    face: { eyes: 'normal', look: [.3, -.8], mouth: 'flat', browUp: point, browAng: .1 } }));
  else dancer(ctx, DOC, 540, 1960, 1450, t, 3, 1, { eyes: 'happy', mouth: 'grin', browUp: .5 }, { shadow: false });
  if (go) {
    const b = clamp((lt - pres) / .25); if (b < 1) burst(ctx, 540, 520, 300 * backOut(b), 14, '#ffd23a', 7);
    flash(ctx, (1 - clamp((lt - pres) / .15)) * .3);
    for (let i = 0; i < 4; i++) { const k = ((lt - pres) * 1.1 + i / 4) % 1; note(ctx, 160 + i * 250, 700 - k * 360, 1.6, Math.sin(k * Math.PI), Math.sin(t * 4 + i) * .2); }
  } else { const qa = clamp((lt - .5) / .15); qmark(ctx, 820, 460, 200 * backOut(qa), qa, Math.sin(t * 3) * .1); }
} });
// I: explainer. The council builds a wooden stage and hires musicians
SHOTS.push({ start: B[8], end: B[9], tr: 'whip', draw(ctx, lt, t) {
  const D = B[9] - B[8];
  const bt = K.stage - B[8], mt = K.musi - B[8];
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.05], [D, .97]]), r: 0 };
  townBG(ctx, t, cam, { cathX: 560 });
  applyCam(ctx, cam, 1);
  const p = clamp((lt - (bt - .55)) / 1.1);
  // councillor gives the order
  drawStick(ctx, C(COUNCIL, { x: 150, y: 1180, s: 440, arms: { L: [.3, -.1], R: lt < mt ? [2.2, .1] : [.9, -2.2] }, face: { eyes: 'normal', look: [.8, -.3], mouth: lt < mt ? 'o' : 'smile', browAng: .1 } }));
  drawStage(ctx, 600, 1180, 760, p);
  // musicians climb on
  const mk = clamp((lt - mt + .1) / .4);
  if (mk > 0) {
    const y = 1180 + (1 - backOut(mk)) * 400;
    const hit = Math.max(0, Math.sin(t * 12));
    drawStick(ctx, C({ cols: ['#e0392f', '#f6f1e8'], hat: 'beret', belt: true, hatCol: '#2a3f8f' }, { x: 430, y, s: 420, arms: { L: { ik: [-.02, -.45 + hit * .08], bend: 1 }, R: { ik: [.08, -.45 + (1 - hit) * .08], bend: -1 } }, legs: { L: [.14, -.04], R: [.14, -.04] }, face: { eyes: 'happy', mouth: 'smile' }, bob: -hit * .01 }));
    drawDrum(ctx, 430, y - 170, .9, t, hit * mk);
    drawStick(ctx, C({ cols: ['#3fa35b', '#3fa35b'], hat: 'beret', belt: true, hatCol: '#e0392f' }, { x: 760, y, s: 420, flip: -1, arms: { L: { ik: [-.12, -.62], bend: 1 }, R: { ik: [.08, -.64], bend: -1 } }, face: { eyes: 'happy', mouth: 'flat' },
      prop: (c, k, hand, ang, side) => { if (k === 'R') drawFife(c, hand, -1.85, 1.2); } }));
    for (let i = 0; i < 3; i++) { const k = (lt * .9 + i / 3) % 1; note(ctx, 600 + (i - 1) * 220, 900 - k * 320, 1.4, Math.sin(k * Math.PI) * mk, Math.sin(t * 4 + i) * .2); }
  }
  // dancers in front, never stopping
  for (let i = 0; i < 4; i++) dancer(ctx, TOWN18[(i * 3 + 1) % 8], 300 + i * 200, 1440 + (i % 2) * 20, 340, t, i + 5, .9, { eyes: 'wide', mouth: i % 2 ? 'o' : 'teeth' });
  // hammer bangs while building
  if (p > 0 && p < 1) { const hx = 600 - 380 + p * 760; burst(ctx, hx, 1170, 50 + Math.abs(Math.sin(t * 18)) * 20, 9, '#fff', 3); }
} });
// J: in the end the dancers were taken to a shrine of Saint Vitus, to pray
SHOTS.push({ start: B[9], end: B[10], tr: 'whip', draw(ctx, lt, t) {
  const D = B[10] - B[9];
  const pray = K.pray - B[9];
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: kf(lt, [[0, 1.0], [pray, 1.1], [D, 1.16]]), r: 0 };
  applyCam(ctx, cam, .08); drawSky(ctx, '#f2a65a', '#fbe3b0');
  applyCam(ctx, cam, .12); drawSun(ctx, 260, 560, 70, t, .8);
  applyCam(ctx, cam, .3); ctx.beginPath(); ctx.moveTo(-600, 1000); ctx.quadraticCurveTo(300, 820, 1700, 960); ctx.lineTo(1700, 2000); ctx.lineTo(-600, 2000); ctx.closePath(); fillStroke(ctx, '#7aa85a', 6);
  applyCam(ctx, cam, 1);
  // hill with the chapel
  ctx.beginPath(); ctx.moveTo(-400, 1500); ctx.quadraticCurveTo(500, 1460, 760, 900); ctx.quadraticCurveTo(900, 760, 1600, 860); ctx.lineTo(1600, 2200); ctx.lineTo(-400, 2200); ctx.closePath(); fillStroke(ctx, '#5fa84a', 6);
  ctx.beginPath(); ctx.moveTo(60, 1700); ctx.quadraticCurveTo(420, 1480, 640, 1160); ctx.quadraticCurveTo(720, 980, 820, 880); ctx.lineWidth = 50; ctx.strokeStyle = '#d9c08a'; ctx.lineCap = 'round'; ctx.stroke();
  drawChapel(ctx, 860, 880, .95);
  const sa = clamp((lt - pray) / .3);
  if (sa > 0) { sparkle(ctx, 860, 520, 70 * sa, sa * (1 - clamp((lt - pray - .6) / .4))); }
  for (const tx of [1030, 1140]) drawPine(ctx, tx, 900, .7, .1, Math.sin(t + tx) * .02);
  // tired dancers walking up the path
  for (let i = 3; i >= 0; i--) {
    const k = clamp(lt / D * .7 + .1 - i * .12);
    const px = lerp(200, 700, k), py = lerp(1520, 1060, k);
    const s = lerp(400, 200, k);
    const praying = lt > pray && i === 0;
    drawStick(ctx, C(i === 0 ? TROF : TOWN18[i * 2], { x: px, y: py, s, legs: walkLegs(t * .7 + i, 7, .4), arms: praying ? { L: { ik: [-.02, -.6], bend: 1 }, R: { ik: [.02, -.6], bend: -1 } } : { L: [.2, -.1], R: [.2, -.1] }, lean: .06,
      face: { eyes: 'half', look: [.6, -.4], mouth: praying ? 'flat' : 'frown' } }));
  }
} });
// K: explainer. Many historians think it was mass hysteria, in a year of hunger and disease
SHOTS.push({ start: B[10], end: B[11], tr: 'whip', draw(ctx, lt, t) {
  const hy = K.hyst - B[10], hu = K.hung - B[10], di = K.dis - B[10];
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .02, r: 0 };
  townBG(ctx, t, cam, { night: .25, sun: false, tint: .35 });
  // icons: hunger and disease hang over the crowd
  const ia = backOut(clamp((lt - hu + .1) / .3)), ga = backOut(clamp((lt - di + .1) / .3));
  if (ia > 0) { ctx.save(); ctx.translate(300, 600); ctx.scale(ia * 1.1, ia * 1.1); circle(ctx, 0, 0, 170); fillStroke(ctx, '#fffaf0', 9); drawBowl(ctx, 0, 30, 1); drawLoaf(ctx, 0, -40, .7); crossOut(ctx, 0, 0, 105, clamp((lt - hu - .2) / .4)); ctx.restore(); }
  if (ga > 0) { ctx.save(); ctx.translate(780, 600); ctx.scale(ga * 1.1, ga * 1.1); circle(ctx, 0, 0, 170); fillStroke(ctx, '#fffaf0', 9); germ(ctx, -40, 10, 55, t, 1); germ(ctx, 60, -40, 36, t, 2, '#b06ad9'); germ(ctx, 50, 70, 30, t, 3); ctx.restore(); }
  // a row of worried people; a ripple passes from one to the next and each starts to dance
  const xs = [140, 340, 540, 740, 940];
  xs.forEach((x, i) => {
    const at = hy - .2 + i * .32;
    const on = lt > at;
    const y = 1480 + (i % 2) * 15;
    if (on) dancer(ctx, TOWN18[i + 1], x, y, 440, t, i + 4, .9, { eyes: 'spiral', mouth: 'o' }, { t });
    else drawStick(ctx, C(TOWN18[i + 1], { x, y, s: 440, arms: { L: { ik: [-.05, -.34], bend: 1 }, R: { ik: [.05, -.34], bend: -1 } }, face: { eyes: 'normal', look: [0, .4], mouth: 'frown', browAng: -.25 } }));
    const ra = clamp((lt - at) / .45); if (ra > 0 && ra < 1) ripple(ctx, x, y - .765 * 410, 60 + ra * 240, 1 - ra);
  });
} });
// L: payoff. What do you think really happened? Strange Days, part 2
SHOTS.push({ start: B[11], end: B[12], tr: 'cut', draw(ctx, lt, t) {
  const ta = backOut(clamp((K.sd - B[11]) > 0 ? (lt - (K.sd - B[11])) / .35 : 0));
  const hh = handheld(t, 2.5);
  const cam = { x: 540 + hh[0], y: 960 + hh[1], z: 1.0 + lt * .025, r: 0 };
  townBG(ctx, t, cam, { night: .35, sun: false });
  applyCam(ctx, cam, 1);
  const sm = lt > .9;
  dancer(ctx, TROF, 540, 1880, 1150, t * .8, 1, .75, { eyes: sm ? 'normal' : 'wide', look: [0, 0], mouth: sm ? 'smirk' : 'o', browOne: sm ? 1 : 0, browUp: sm ? 0 : 1 }, { shadow: false });
  const qa = clamp((lt - .1) / .1) * (1 - clamp((lt - (K.sd - B[11]) + .2) / .2));
  qmark(ctx, 540, 520, 220 * backOut(clamp((lt - .1) / .25)), qa, Math.sin(t * 3) * .12);
  if (ta > 0) {
    ctx.save(); ctx.translate(540, 470); ctx.scale(ta, ta); ctx.rotate(-.03);
    rrect(ctx, -400, -150, 800, 290, 30); fillStroke(ctx, '#ffe14d', 10);
    text(ctx, 'STRANGE DAYS', 0, -55, 104, INK, INK, 0, 'Lora', 700);
    text(ctx, 'part 2', 0, 70, 70, '#e0392f', INK, 0, 'Poppins', 700);
    ctx.restore();
  }
} });
