
let state = null;     // l'ultimo stato letto dal Worker (o quello della prova)
let selected = null;  // il reparto aperto nella scheda
let demo = null;      // la giornata di prova, se è in corso

// ---------------------------------------------------------------- la scena: un villaggio di carta
const stage = $("stage");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.prepend(renderer.domElement);
renderer.domElement.setAttribute("aria-hidden", "true");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1330, 48, 90);
const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
camera.position.set(30, 32.5, 30);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;
controls.minZoom = 0.75; controls.maxZoom = 6;
controls.minPolarAngle = 0.62; controls.maxPolarAngle = 1.08;
controls.minAzimuthAngle = Math.PI / 4 - 0.7; controls.maxAzimuthAngle = Math.PI / 4 + 0.7;
const HOME = new THREE.Vector3(0, 2.5, 0);
controls.target.copy(HOME);

const hemi = new THREE.HemisphereLight(0x8fa6dc, 0x0e1532, 1.15);
scene.add(hemi);
const moonLight = new THREE.DirectionalLight(0xc8d6ff, 0.9);
moonLight.position.set(-18, 30, 8);
scene.add(moonLight);

const paper = (color, extra = {}) => new THREE.MeshLambertMaterial({ color, ...extra });

// un foglio di carta spesso, con angoli arrotondati
function slab(w, d, h, r, color) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 10 });
  geo.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geo, paper(color));
}

// l'isola: tre fogli sovrapposti, dal più scuro sotto al più chiaro sopra
const island = new THREE.Group();
const base = slab(31, 23, 1.6, 3, 0x0e1532); base.position.y = -2.2; island.add(base);
const mid = slab(29.5, 21.5, 0.6, 2.6, 0x23336a); mid.position.y = -0.6; island.add(mid);
const top = slab(28.5, 20.5, 0.35, 2.4, 0x3f5a92); top.position.y = 0; island.add(top);
scene.add(island);

// fondale: colline di carta dietro il villaggio, come gli strati della scatola luminosa
function hillSheet(color, y, z, amp, seed) {
  const s = new THREE.Shape();
  s.moveTo(-40, -60);
  for (let x = -40; x <= 40; x += 2) s.lineTo(x, y + Math.sin(x * 0.18 + seed) * amp + Math.sin(x * 0.07 + seed * 2) * amp * 0.8);
  s.lineTo(40, -60); s.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 4), new THREE.MeshBasicMaterial({ color, fog: false }));
  m.position.set(0, 0, z);
  return m;
}
const backdrop = new THREE.Group();
backdrop.add(hillSheet(0x6a86c2, 6, -6, 1.6, 1));
backdrop.add(hillSheet(0x4a659f, 4, -3, 1.4, 4));
backdrop.add(hillSheet(0x2a3f78, 2, 0, 1.2, 7));
const moonTex = glowTexture("rgba(255,236,200,1)", "rgba(255,215,154,0)");
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, fog: false, depthWrite: false }));
moon.scale.set(9, 9, 1); moon.position.set(4, 13, -7); backdrop.add(moon);
const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshBasicMaterial({ color: 0xffe9c4, fog: false }));
moonDisc.position.set(4, 13, -6.9); backdrop.add(moonDisc);
// il fondale è appeso alla telecamera: resta sempre di fronte, come il fondo della scatola
scene.add(camera);
camera.add(backdrop);
backdrop.position.set(0, 4, -150);

// stelle
{
  const pts = [];
  for (let i = 0; i < 140; i++) pts.push((Math.random() - .5) * 90, 6 + Math.random() * 26, -10);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe3b0, size: 2, sizeAttenuation: false, fog: false, transparent: true, opacity: .8 }));
  backdrop.add(stars);
}

function glowTexture(inner, outer) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner); grd.addColorStop(1, outer);
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const warmGlow = glowTexture("rgba(255,184,98,.95)", "rgba(255,184,98,0)");
const foxGlow = glowTexture("rgba(232,116,59,.95)", "rgba(232,116,59,0)");
const redGlow = glowTexture("rgba(255,120,100,.9)", "rgba(255,120,100,0)");

// marciapiede: una striscia di carta che passa davanti alle casette nell'ordine della catena,
// a serpentina sulle tre file (sinistra → destra, poi indietro, poi di nuovo avanti), con frecce che indicano il verso
const WALK_W = 1.3;
const walkPath = (() => {
  const rows = [...new Set(DEPTS.map((d) => d.at[1]))].sort((p, q) => p - q);   // le tre file, dalla più lontana
  const front = (z) => z + 2.5;                                                  // il marciapiede corre davanti alla fila
  const xs = DEPTS.map((d) => d.at[0]), x0 = Math.min(...xs) - 2.8, x1 = Math.max(...xs) + 2.8, r = 1.4;
  const path = new THREE.CurvePath();
  const P = (x, z) => new THREE.Vector3(x, 0.37, z);
  let side = 0;                                       // 0: la fila va verso destra, 1: verso sinistra
  rows.forEach((z, i) => {
    const zf = front(z), from = side ? x1 : x0, to = side ? x0 : x1, dir = side ? -1 : 1;
    const startX = i === 0 ? from : from + dir * r, endX = i === rows.length - 1 ? to : to - dir * r;
    path.add(new THREE.LineCurve3(P(startX, zf), P(endX, zf)));
    if (i < rows.length - 1) {                        // la curva che scende alla fila dopo
      const zn = front(rows[i + 1]);
      path.add(new THREE.QuadraticBezierCurve3(P(endX, zf), P(to, zf), P(to, zf + r)));
      path.add(new THREE.LineCurve3(P(to, zf + r), P(to, zn - r)));
      path.add(new THREE.QuadraticBezierCurve3(P(to, zn - r), P(to, zn), P(to - dir * r, zn)));
    }
    side = 1 - side;
  });
  return path;
})();
{
  const pts = walkPath.getSpacedPoints(420);
  const pos = [], idx = [];
  const up = new THREE.Vector3(0, 1, 0), t = new THREE.Vector3(), n = new THREE.Vector3();
  pts.forEach((p, i) => {
    t.subVectors(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]).normalize();
    n.crossVectors(up, t).multiplyScalar(WALK_W / 2);
    pos.push(p.x + n.x, p.y, p.z + n.z, p.x - n.x, p.y, p.z - n.z);
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const walk = new THREE.Mesh(geo, paper(0x8fa3cf, { side: THREE.DoubleSide }));
  walk.position.y = 0.01;
  scene.add(walk);
  // frecce di carta sul marciapiede: il verso in cui viaggia il video
  const arrow = new THREE.Shape();
  arrow.moveTo(-0.22, -0.18); arrow.lineTo(0.05, -0.18); arrow.lineTo(0.3, 0); arrow.lineTo(0.05, 0.18); arrow.lineTo(-0.22, 0.18); arrow.lineTo(0.02, 0); arrow.closePath();
  const arrowGeo = new THREE.ShapeGeometry(arrow); arrowGeo.rotateX(-Math.PI / 2);
  const len = walkPath.getLength(), step = 2.4, count = Math.floor(len / step);
  const arrows = new THREE.InstancedMesh(arrowGeo, new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: .55, side: THREE.DoubleSide }), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < count; i++) {
    const u = (i + 0.5) / count, p = walkPath.getPointAt(u), d = walkPath.getTangentAt(u);
    e.set(0, Math.atan2(-d.z, d.x), 0); q.setFromEuler(e);
    m.compose(new THREE.Vector3(p.x, 0.39, p.z), q, one); arrows.setMatrixAt(i, m);
  }
  scene.add(arrows);
}

// i due capi del marciapiede: una piazzetta tonda invece del taglio netto,
// all'inizio un arco di carta con la lanterna, alla fine un cartello, una panchina e un lampione
function board(text, w = 2, h = 0.62) {
  const c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * h / w);
  const g = c.getContext("2d");
  g.fillStyle = "#f3e6cf"; g.beginPath(); g.roundRect(6, 6, c.width - 12, c.height - 12, 22); g.fill();
  g.strokeStyle = "#8a6a4a"; g.lineWidth = 8; g.stroke();
  g.fillStyle = "#3a2618"; g.font = `600 ${Math.round(c.height * 0.5)}px Fraunces, Georgia, serif`;
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, c.width / 2, c.height / 2 + 4);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  m.rotation.y = Math.PI / 4;   // girato verso chi guarda il villaggio
  return m;
}
const ends = (() => {
  const wood = paper(0x5a4030), dark = paper(0x1a2550);
  const plaza = (p) => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.05, 40), paper(0x6a86c2)); rim.position.set(p.x, 0.37, p.z);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.06, 40), paper(0x8fa3cf)); top.position.set(p.x, 0.39, p.z);
    scene.add(rim, top);
  };
  const lanternGlow = (x, y, z, s = 1.8) => {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.24), new THREE.MeshBasicMaterial({ color: 0xffd08a })); head.position.set(x, y, z);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .65 }));
    glow.scale.set(s, s, 1); glow.position.set(x, y, z); scene.add(head, glow); return glow;
  };
  // inizio: piazzetta e arco a cavallo del marciapiede, con l'insegna e una lanterna appesa
  const a = walkPath.getPointAt(0), da = walkPath.getTangentAt(0);
  plaza(a);
  const side = new THREE.Vector3(-da.z, 0, da.x).multiplyScalar(WALK_W / 2 + 0.2);
  const gx = a.x + da.x * 1.1, gz = a.z + da.z * 1.1;
  for (const s of [1, -1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.3, 0.16), wood); post.position.set(gx + side.x * s, 0.37 + 1.15, gz + side.z * s); scene.add(post);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, side.length() * 2 + 0.5), wood);
  beam.position.set(gx, 0.37 + 2.3, gz); beam.rotation.y = Math.atan2(side.x, side.z); scene.add(beam);
  const sign = board("Inizio", 3.4, 1.05); sign.position.set(gx, 0.37 + 3.0, gz); scene.add(sign);
  const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 4), dark); hang.position.set(gx, 0.37 + 2.03, gz); scene.add(hang);
  const startGlow = lanternGlow(gx, 0.37 + 1.72, gz, 2.2);
  // fine: piazzetta con cartello, panchina e lampione
  const b = walkPath.getPointAt(1), db = walkPath.getTangentAt(1);
  plaza(b);
  // il cartello sta oltre la piazzetta, verso il bordo dell'isola: davanti non c'è niente (né alberi né case).
  // Due pali ai lati che finiscono sotto la tavola, e la tavola disegnata per ultima, sopra lucciole e bagliori.
  const sx = b.x + 0.8, sz = b.z - 0.9, signW = 1.9, signH = 0.78, signY = 0.37 + 1.75;   // a destra dell'orso, sullo schermo
  const along = new THREE.Vector3(Math.cos(Math.PI / 4), 0, -Math.sin(Math.PI / 4));   // la direzione della tavola, girata come board()
  for (const s of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, signY - signH / 2 - 0.37 + 0.05, 0.14), wood);
    post.position.set(sx + along.x * s * (signW / 2 - 0.25), 0.37 + (signY - signH / 2 - 0.37) / 2, sz + along.z * s * (signW / 2 - 0.25));
    scene.add(post);
  }
  const endSign = board("Fine", signW, signH); endSign.position.set(sx, signY, sz);
  // trasparente solo per finire nell'ultimo passaggio, dopo gli animali (che sono figure trasparenti); niente lo copre
  endSign.material.transparent = true; endSign.material.depthTest = false; endSign.renderOrder = 10;
  scene.add(endSign);
  const bench = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.36), wood); seat.position.y = 0.42; bench.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.34, 0.06), wood); back.position.set(0, 0.62, -0.16); bench.add(back);
  for (const x of [-0.45, 0.45]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.3), dark); leg.position.set(x, 0.2, 0); bench.add(leg); }
  bench.position.set(b.x - db.x * 0.55 + db.z * 1.05, 0.37, b.z - db.z * 0.55 + db.x * 1.05); bench.rotation.y = Math.atan2(db.x, db.z) + Math.PI / 2;
  scene.add(bench);
  // niente lampione qui: in quel punto sta di guardia il Generale
  return { glows: [startGlow] };
})();

// alberi di carta sparsi (diventano trasparenti quando si entra in una casetta)
const treeMats = [];
{
  const treeGeo = new THREE.ConeGeometry(0.8, 2.2, 5); treeGeo.translate(0, 1.45, 0);
  const trunkGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2); trunkGeo.translate(0, 0.45, 0);
  const spots = [[-13, -8.8], [-7.5, -9.3], [2.6, -9.4], [12.9, -9], [-0.1, -3.2], [6.7, -3.1], [-6.7, -3], [-13.2, -1.3], [13.2, 2.8], [0, 3], [6.7, 3.2], [-6.7, 2.6], [-13.1, 9.2], [0, 9.4]];
  for (const [x, z] of spots) {
    const t = new THREE.Group();
    const trunkMat = paper(0x2a1d14, { transparent: true }), crownMat = paper(Math.random() > .5 ? 0x22356c : 0x2c4580, { transparent: true });
    treeMats.push(trunkMat, crownMat);
    t.add(new THREE.Mesh(trunkGeo, trunkMat));
    const crown = new THREE.Mesh(treeGeo, crownMat);
    crown.scale.setScalar(0.8 + Math.random() * 0.5); t.add(crown);
    t.position.set(x, 0.35, z); t.rotation.y = Math.random() * 3;
    scene.add(t);
  }
}

// le casette: quattro pareti e un tetto. Le due pareti verso la telecamera (+z e +x) svaniscono
// quando la casetta si apre, il tetto si alza, e dentro si vede il reparto al lavoro.
const houses = {};
const clickable = [];
const wallColors = [0xd9cbb4, 0xe6d8bd, 0xcfc0a6];
for (const [i, d] of DEPTS.entries()) {
  const g = new THREE.Group();
  const k = d.big ? 1.3 : 1;
  const w = 2.6 * k, h = 1.9 * k, dep = 2.3 * k;
  const fade = (c) => paper(c, { transparent: true, opacity: 1 });
  // pareti di fondo, viste dall'interno
  const inner = paper(0xe6d2ad);
  const backZ = new THREE.Mesh(new THREE.PlaneGeometry(w, h), inner); backZ.position.set(0, h / 2 + 0.35, -dep / 2);
  const backX = new THREE.Mesh(new THREE.PlaneGeometry(dep, h), inner); backX.position.set(-w / 2, h / 2 + 0.35, 0); backX.rotation.y = Math.PI / 2;
  const skirt = paper(0x8a6a4a);
  const skirtZ = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.3), skirt); skirtZ.position.set(0, 0.5, -dep / 2 + 0.005);
  const skirtX = new THREE.Mesh(new THREE.PlaneGeometry(dep, 0.3), skirt); skirtX.position.set(-w / 2 + 0.005, 0.5, 0); skirtX.rotation.y = Math.PI / 2;
  // pareti davanti, viste da fuori: si aprono
  const outer = fade(wallColors[i % 3]);
  const frontZ = new THREE.Mesh(new THREE.PlaneGeometry(w, h), outer); frontZ.position.set(0, h / 2 + 0.35, dep / 2);
  const frontX = new THREE.Mesh(new THREE.PlaneGeometry(dep, h), outer); frontX.position.set(w / 2, h / 2 + 0.35, 0); frontX.rotation.y = Math.PI / 2;
  const roofMat = fade(i % 2 ? 0x23325f : 0x2b3c70);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, dep) * 0.82, 1.3 * k, 4), roofMat);
  const roofY = h + 0.35 + 0.65 * k;
  roof.position.y = roofY; roof.rotation.y = Math.PI / 4;
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.8, 0.35), fade(0x23325f));
  chimney.position.set(-w * 0.25, h + 0.9 * k, -dep * 0.15);
  const winMat = new THREE.MeshBasicMaterial({ color: 0x1c2752, transparent: true });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9 * k, 0.7 * k), winMat);
  win.position.set(-w * 0.15, h * 0.62 + 0.35, dep / 2 + 0.01);
  const win2 = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * k, 0.7 * k), winMat);
  win2.position.set(w / 2 + 0.01, h * 0.62 + 0.35, -dep * 0.1); win2.rotation.y = Math.PI / 2;
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.62 * k, 1.05 * k), fade(0x2a1d14));
  door.position.set(w * 0.25, 0.35 + 0.53 * k, dep / 2 + 0.012);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.scale.set(5 * k, 5 * k, 1); glow.position.set(0.2, h * 0.6 + 0.35, dep / 2 + 0.6);
  const light = new THREE.PointLight(0xffb862, 0, 9, 1.6);
  light.position.set(0.3, h + 0.4, dep / 2 + 1.3);
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.3 * k, 2.55 * k, 48), new THREE.MeshBasicMaterial({ color: 0xffb862, transparent: true, opacity: 0 }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.37;
  const tex = new THREE.CanvasTexture(paperCut(d.animal, d.fur, 256)); tex.colorSpace = THREE.SRGBColorSpace;
  const critter = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  const cs = d.big ? 2.6 : 2.3;
  critter.scale.set(cs, cs, 1);
  const outside = new THREE.Vector3(w / 2 + 0.55, 0.35 + cs / 2, dep / 2 + 0.75);
  critter.position.copy(outside);
  // l'interno, alla stessa scala della casetta
  const room = buildInterior(d.id);
  room.group.scale.setScalar(k); room.group.position.y = 0.36; room.group.visible = false;
  const seatSize = 1.05 * k;
  const inside = new THREE.Vector3(room.seat[0] * k, 0.36 + seatSize / 2, room.seat[1] * k);
  g.add(backZ, backX, skirtZ, skirtX, frontZ, frontX, roof, chimney, win, win2, door, glow, light, ring, critter, room.group);
  g.position.set(d.at[0], 0, d.at[1]);
  // casette dritte, tutte con la porta sul marciapiede
  for (const m of [frontZ, frontX, roof, door, critter]) { m.userData.dept = d.id; clickable.push(m); }
  scene.add(g);
  houses[d.id] = { g, winMat, glow, light, ring, critter, room, roof, roofY, chimney, chimneyY: chimney.position.y,
    fronts: [frontZ, frontX, win, win2, door], fadeMats: [outer, roofMat, chimney.material, door.material, winMat],
    outside, inside, cs, seatSize, open: 0, baseY: outside.y, status: "idle", phase: i * 0.7,
    labelAt: new THREE.Vector3(d.at[0], h + 2.4 * k, d.at[1]) };
}

// apre (o chiude) una casetta: o va da 0 (chiusa) a 1 (aperta)
function applyOpen(hs, o, t) {
  hs.roof.position.y = hs.roofY + o * 2.6;
  hs.chimney.position.y = hs.chimneyY + o * 2.6;
  for (const m of hs.fadeMats) { m.opacity = 1 - o; m.depthWrite = o < 0.5; }
  for (const m of hs.fronts) m.visible = o < 0.98;
  hs.roof.visible = hs.chimney.visible = o < 0.98;
  hs.room.group.visible = o > 0.01;
  hs.room.light.intensity = o * 6;
  hs.glow.visible = o < 0.5;
  const size = I.lerp(hs.cs, hs.seatSize, o);
  hs.critter.scale.set(size, size, 1);
  hs.critter.position.lerpVectors(hs.outside, hs.inside, o);
  hs.baseY = hs.critter.position.y;
  if (o > 0.01) hs.room.tick(t, hs.status);
}

// lucciole
const flies = (() => {
  const n = reduceMotion ? 0 : 36;
  const pts = new Float32Array(n * 3), seeds = [];
  for (let i = 0; i < n; i++) { seeds.push([(Math.random() - .5) * 26, 0.8 + Math.random() * 3.5, (Math.random() - .5) * 18, Math.random() * 6]); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd08a, size: 4, sizeAttenuation: false, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(p);
  return { geo, seeds, pts };
})();

// ---------------------------------------------------------------- la vita del villaggio
// lampioni di carta lungo il marciapiede
const lamps = [];
{
  const rows = [...new Set(DEPTS.map((d) => d.at[1]))].sort((p, q) => p - q);
  const postGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.5, 6); postGeo.translate(0, 0.75, 0);
  const headGeo = new THREE.BoxGeometry(0.26, 0.3, 0.26);
  const postMat = paper(0x1a2550);
  for (const z of rows) {
    const xs = DEPTS.filter((d) => d.at[1] === z).map((d) => d.at[0]).sort((p, q) => p - q);
    for (let i = 0; i < xs.length - 1; i++) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(postGeo, postMat));
      const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color: 0xffd08a })); head.position.y = 1.62; g.add(head);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55 }));
      glow.scale.set(2.2, 2.2, 1); glow.position.y = 1.62; g.add(glow);
      // tra due casette, sul bordo del marciapiede dalla parte delle case (lontano dagli animali sulla porta)
      g.position.set((xs[i] + xs[i + 1]) / 2 + 0.45, 0.36, z + 2.5 - WALK_W / 2 - 0.2);
      scene.add(g); lamps.push({ glow, phase: Math.random() * 6 });
    }
  }
}

// fiori di carta sul prato, lontano da case e marciapiede
{
  const geo = new THREE.ConeGeometry(0.09, 0.22, 5); geo.translate(0, 0.47, 0);
  const colors = [0xe8743b, 0xffd08a, 0xf3e6cf, 0xc77dba];
  const free = (x, z) => DEPTS.every((d) => Math.abs(x - d.at[0]) > 2.2 || Math.abs(z - d.at[1]) > 1.9) &&
    walkPath.getSpacedPoints(120).every((p) => Math.hypot(p.x - x, p.z - z) > 1.05);
  for (const c of colors) {
    const spots = [];
    for (let tries = 0; spots.length < 14 && tries < 400; tries++) {
      const x = (Math.random() - .5) * 26, z = (Math.random() - .5) * 18.5;
      if (free(x, z)) spots.push([x, z]);
    }
    const mesh = new THREE.InstancedMesh(geo, paper(c), spots.length), m = new THREE.Matrix4();
    spots.forEach(([x, z], i) => { m.makeTranslation(x, 0, z); mesh.setMatrixAt(i, m); });
    scene.add(mesh);
  }
}

// fumo dai camini delle casette al lavoro: sbuffi che salgono e svaniscono
const smokeTex = glowTexture("rgba(225,232,255,.75)", "rgba(225,232,255,0)");
const smoke = DEPTS.map((d, i) => Array.from({ length: 4 }, (_, k) => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
  scene.add(s);
  return { s, id: d.id, offset: k / 4 + i * 0.13 };
}));
const chimneyTop = (id) => { const c = houses[id].chimney; return c.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.45, 0)); };

// il Generale: sta di guardia nella piazzetta della fine, davanti a tutti; quando lo chiami risale il marciapiede a controllare
const general = (() => {
  const tex = new THREE.CanvasTexture(paperCut("general", "#e8743b", 256)); tex.colorSpace = THREE.SRGBColorSpace;
  // drawn last and over everything, so no roof, tree or bench ever hides him
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  s.scale.set(2.2, 2.2, 1); s.renderOrder = 11;
  const b = walkPath.getPointAt(1), db = walkPath.getTangentAt(1);
  const home = new THREE.Vector3(b.x - 0.9, 1.2, b.z + 0.9);   // a sinistra dell'orso, sullo schermo (il cartello è a destra)
  s.position.copy(home); scene.add(s);
  return { s, home, patrol: 0 };
})();
function generalTick(dt) {
  const g = general;
  if (g.patrol > 0 && !reduceMotion) {
    g.patrol = Math.max(0, g.patrol - dt);
    const u = 1 - Math.abs(1 - 2 * ((8 - g.patrol) / 8));   // there and back along the sidewalk in 8 s
    const p = walkPath.getPointAt(1 - Math.min(1, Math.max(0, u)));
    g.s.position.set(p.x, 1.12 + Math.abs(Math.sin(g.patrol * 9)) * 0.18, p.z);
    if (g.patrol === 0) g.s.position.copy(g.home);
  }
}

// il postino: una volpina con la lanterna che porta la storia lungo il marciapiede
// e si ferma davanti alla casetta che ci sta lavorando
const courier = (() => {
  const tex = new THREE.CanvasTexture(paperCut("fox", "#e8743b", 256)); tex.colorSpace = THREE.SRGBColorSpace;
  const fox = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  fox.scale.set(1.5, 1.5, 1);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmGlow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .7 }));
  glow.scale.set(2.4, 2.4, 1);
  scene.add(fox, glow);
  // dove si ferma per ogni reparto: il punto del marciapiede più vicino alla porta
  const pts = walkPath.getSpacedPoints(600);
  const stop = Object.fromEntries(DEPTS.map((d) => {
    const door = new THREE.Vector3(d.at[0] + 0.6, 0.37, d.at[1] + 2.5);
    let best = 0; pts.forEach((p, i) => { if (p.distanceTo(door) < pts[best].distanceTo(door)) best = i; });
    return [d.id, best / (pts.length - 1)];
  }));
  const start = walkPath.getPointAt(0);
  fox.position.set(start.x, 0.99, start.z); glow.position.set(start.x + 0.35, 1.27, start.z + 0.1);   // con i movimenti ridotti resta qui
  return { fox, glow, stop, u: 0, dir: 1 };
})();

// nuvole di carta e stelle cadenti nel fondale
const clouds = [];
{
  const shape = new THREE.Shape();
  shape.moveTo(-3, 0); shape.quadraticCurveTo(-3, 1.2, -1.6, 1.1); shape.quadraticCurveTo(-1.2, 2.2, 0.2, 1.8);
  shape.quadraticCurveTo(1.4, 2.4, 2, 1.2); shape.quadraticCurveTo(3.4, 1.2, 3, 0); shape.closePath();
  const geo = new THREE.ShapeGeometry(shape, 8);
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: i % 2 ? 0x8fa6dc : 0x6a86c2, transparent: true, opacity: .55, fog: false, depthWrite: false }));
    const k = 0.9 + Math.random() * 0.8;
    c.scale.set(k, k * 0.8, 1); c.position.set(-40 + i * 22, 7 + Math.random() * 4, -8);   // a metà dietro le colline, lontano dal titolo
    backdrop.add(c); clouds.push({ c, speed: 0.25 + Math.random() * 0.35 });
  }
}
const meteor = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.08), new THREE.MeshBasicMaterial({ color: 0xffe9c4, transparent: true, opacity: 0, fog: false, depthWrite: false }));
meteor.rotation.z = -0.45; backdrop.add(meteor);
let meteorAt = 6;

function liveTick(t, dt) {
  if (reduceMotion) return;
  for (const l of lamps) l.glow.material.opacity = 0.5 + Math.sin(t * 2.3 + l.phase) * 0.05 + Math.sin(t * 7.1 + l.phase) * 0.03;
  ends.glows.forEach((g, i) => { g.material.opacity = 0.62 + Math.sin(t * 2.9 + i * 2) * 0.06; });
  for (const puffs of smoke) for (const p of puffs) {
    const h = houses[p.id], on = h.status === "working" && h.open < 0.1;
    const k = (t * 0.22 + p.offset) % 1, base = chimneyTop(p.id);
    p.s.position.set(base.x + Math.sin(k * 5 + p.offset * 9) * 0.25 + k * 0.6, base.y + k * 2.6, base.z - k * 0.4);
    const size = 0.5 + k * 1.3; p.s.scale.set(size, size, 1);
    p.s.material.opacity = on ? (1 - k) * 0.5 : Math.max(0, p.s.material.opacity - dt);
  }
  // il postino va verso il reparto al lavoro (o che aspetta te); a riposo passeggia avanti e indietro
  const busy = DEPTS.find((d) => houses[d.id].status === "working") || DEPTS.find((d) => houses[d.id].status === "waiting");
  const len = walkPath.getLength(), speed = 2.2 / len;
  let moving = true;
  if (busy) {
    const goal = courier.stop[busy.id], gap = goal - courier.u;
    if (Math.abs(gap) < 0.002) moving = false;
    else { courier.dir = Math.sign(gap); courier.u += courier.dir * Math.min(Math.abs(gap), speed * 1.6 * dt); }
  } else {
    courier.u += courier.dir * speed * 0.45 * dt;
    if (courier.u > 1 || courier.u < 0) { courier.dir *= -1; courier.u = Math.min(1, Math.max(0, courier.u)); }
  }
  const p = walkPath.getPointAt(Math.min(1, Math.max(0, courier.u)));
  const hop = moving ? Math.abs(Math.sin(t * 9)) * 0.14 : Math.sin(t * 1.5) * 0.03;
  courier.fox.position.set(p.x, 0.37 + 0.75 + hop, p.z);
  // la volpina guarda dove va: sullo schermo, a destra o a sinistra
  const ahead = walkPath.getPointAt(Math.min(1, Math.max(0, courier.u + courier.dir * 0.01)));
  const sx = ahead.clone().project(camera).x - p.clone().project(camera).x;
  courier.fox.scale.x = (sx < 0 ? -1 : 1) * Math.abs(courier.fox.scale.x);
  courier.glow.position.set(p.x + 0.35, 0.37 + 0.9 + hop, p.z + 0.1);
  courier.glow.material.opacity = 0.6 + Math.sin(t * 6.3) * 0.08;
  courier.fox.material.opacity = 1 - 0.8 * Math.max(...DEPTS.map((d) => houses[d.id].open));   // si fa da parte quando entri in una casetta
  for (const c of clouds) { c.c.position.x += c.speed * dt; if (c.c.position.x > 45) c.c.position.x = -45; }
  if (t > meteorAt) {
    const k = (t - meteorAt) / 0.9;
    if (k === 0 || !meteor.userData.x) { meteor.userData.x = -20 + Math.random() * 40; meteor.userData.y = 18 + Math.random() * 8; }
    meteor.position.set(meteor.userData.x + k * 9, meteor.userData.y - k * 4.2, -9);
    meteor.material.opacity = Math.sin(Math.min(1, k) * Math.PI) * 0.9;
    if (k >= 1) { meteorAt = t + 9 + Math.random() * 14; meteor.userData.x = 0; meteor.material.opacity = 0; }
  }
}

function setHouse(id, status) {
  const h = houses[id];
  if (!h) return;
  h.status = status;
  const lit = status === "working" || status === "waiting" || status === "error";
  h.winMat.color.set(status === "working" ? 0xffc77a : status === "waiting" ? 0xf08a52 : status === "error" ? 0xff8f73 : status === "done" ? 0x8a6a4a : 0x1c2752);
  h.glow.material.map = status === "waiting" ? foxGlow : status === "error" ? redGlow : warmGlow;
  h.glow.material.opacity = lit ? 0.85 : status === "done" ? 0.18 : 0;
  h.light.intensity = lit ? 14 : status === "done" ? 2.5 : 0;
}

// ---------------------------------------------------------------- etichette (HTML sopra la scena)
const labels = $("labels");
const tags = {};
for (const [i, d] of DEPTS.entries()) {
  const b = document.createElement("button");
  b.className = "tag"; b.type = "button"; b.dataset.status = "idle"; b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<span class="st"></span><span class="n">${i + 1}</span><span>${esc(d.name)}</span><i class="bar" hidden><b></b></i>`;
  b.addEventListener("click", () => openDept(d.id));
  labels.append(b); tags[d.id] = b;
}
const v = new THREE.Vector3();
function placeLabels() {
  const rect = renderer.domElement.getBoundingClientRect();
  const crowded = camera.zoom < 1.4 && rect.width < 560;
  for (const d of DEPTS) {
    v.copy(houses[d.id].labelAt).project(camera);
    const x = (v.x * .5 + .5) * rect.width, y = (-v.y * .5 + .5) * rect.height;
    const tag = tags[d.id];
    tag.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    const quiet = (selected && selected !== d.id) || (crowded && ["idle", "done"].includes(houses[d.id].status) && selected !== d.id);
    tag.classList.toggle("far", quiet || x < -40 || x > rect.width + 40 || y < 30 || y > rect.height + 10);
  }
}

// ---------------------------------------------------------------- dimensioni, click, animazione
function fit() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  const aspect = w / h;
  const half = Math.max(12.5, 16 / aspect);   // on a phone the three rows still fit from end to end
  camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
  camera.updateProjectionMatrix();
}
new ResizeObserver(fit).observe(stage);
fit();

const ray = new THREE.Raycaster();
let down = null;
renderer.domElement.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera);
  const hit = ray.intersectObjects(clickable, false)[0];
  if (hit) openDept(hit.object.userData.dept);
});

let flight = null; // volo della telecamera verso una casetta
function flyTo(x, z, zoom, y = 0) {
  const from = { t: controls.target.clone(), p: camera.position.clone(), z: camera.zoom };
  const off = camera.position.clone().sub(controls.target);
  const to = { t: new THREE.Vector3(x, y, z), z: zoom };
  to.p = to.t.clone().add(off);
  if (reduceMotion) { controls.target.copy(to.t); camera.position.copy(to.p); camera.zoom = to.z; camera.updateProjectionMatrix(); return; }
  flight = { from, to, t0: performance.now(), dur: 700 };
}

// porta la casetta al centro della parte di villaggio che la scheda lascia scoperta
function flyToHouse(id) {
  const d = BY_ID[id];
  const r = stage.getBoundingClientRect();
  const wide0 = innerWidth >= 980;
  // spazio libero accanto (desktop) o sopra (telefono) la scheda; la casetta aperta ne occupa circa metà
  const freeW = wide0 ? r.width - 424 : r.width;
  // quanto la scheda (già riempita) copre il villaggio dal basso
  const cover = wide0 || sheet.hidden ? 0 : Math.max(0, r.bottom - (innerHeight - sheet.offsetHeight));
  const freeH = r.height - cover;
  const houseSpan = 4.6 * (d.big ? 1.3 : 1);
  const zoom = Math.min(controls.maxZoom, Math.max(1.6, (0.9 * Math.min(freeW, freeH * 1.3)) / houseSpan * (camera.right - camera.left) / r.width));
  const perUnit = r.width / ((camera.right - camera.left) / zoom);
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const wide = innerWidth >= 980;
  const shiftX = wide ? (400 + 24) / 2 / perUnit : 0;
  const shiftY = wide ? 0 : cover / 2 / perUnit;
  const t = new THREE.Vector3(d.at[0], 0.9, d.at[1]).addScaledVector(right, shiftX).addScaledVector(up, -shiftY);
  flyTo(t.x, t.z, zoom, t.y);
}

const clock = new THREE.Clock();
let running = true;
document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(); });
function loop() {
  if (!running) return;
  requestAnimationFrame(loop);
  const t = clock.getElapsedTime();
  if (flight) {
    const k = Math.min(1, (performance.now() - flight.t0) / flight.dur), e = 1 - Math.pow(1 - k, 3);
    controls.target.lerpVectors(flight.from.t, flight.to.t, e);
    camera.position.lerpVectors(flight.from.p, flight.to.p, e);
    camera.zoom = flight.from.z + (flight.to.z - flight.from.z) * e; camera.updateProjectionMatrix();
    if (k === 1) flight = null;
  }
  controls.update();
  generalTick(1 / 60);
  // riflettore: quando una casetta è aperta, il resto del villaggio si abbassa
  const focus = Math.max(...DEPTS.map((d) => houses[d.id].open));
  hemi.intensity = 1.15 - 0.7 * focus; moonLight.intensity = 0.9 - 0.6 * focus;
  for (const m of treeMats) { m.opacity = 1 - 0.85 * focus; m.depthWrite = focus < 0.5; }
  for (const d of DEPTS) {
    const h = houses[d.id];
    h.open += ((selected === d.id ? 1 : 0) - h.open) * (reduceMotion ? 1 : 0.1);
    if (h.open < 0.002) h.open = 0;
    if (h.open > 0 || h.wasOpen) { applyOpen(h, h.open, t); h.wasOpen = h.open > 0; }
    h.critter.material.opacity = 1 - 0.8 * Math.max(0, focus - h.open);
    if (!reduceMotion) {
      if (h.status === "working") { h.critter.position.y = h.baseY + Math.abs(Math.sin(t * 5 + h.phase)) * 0.18; h.critter.material.rotation = Math.sin(t * 2.6 + h.phase) * 0.06; }
      else if (h.status === "waiting") { h.critter.position.y = h.baseY + Math.abs(Math.sin(t * 2.4)) * 0.45; h.critter.material.rotation = Math.sin(t * 4.8) * 0.12; }
      else { h.critter.position.y = h.baseY + Math.sin(t * 0.8 + h.phase) * 0.03; h.critter.material.rotation = h.status === "idle" ? h.open * 0.35 : 0; }
      if (h.status === "working") h.light.intensity = 12 + Math.sin(t * 7.3) * Math.sin(t * 3.1) * 3;
    }
    h.ring.material.opacity += ((selected === d.id ? 0.9 : 0) - h.ring.material.opacity) * 0.15;
  }
  if (flies.seeds.length) {
    flies.seeds.forEach(([x, y, z, s], i) => {
      flies.pts[i * 3] = x + Math.sin(t * 0.3 + s) * 1.6;
      flies.pts[i * 3 + 1] = y + Math.sin(t * 0.9 + s * 2) * 0.5;
      flies.pts[i * 3 + 2] = z + Math.cos(t * 0.25 + s) * 1.6;
    });
    flies.geo.attributes.position.needsUpdate = true;
  }
  liveTick(t, Math.min(0.1, t - (loop.last ?? t))); loop.last = t;
  renderer.render(scene, camera);
  placeLabels();
}
controls.addEventListener("start", () => { flight = null; $("hint").hidden = true; });
loop();


// ---------------------------------------------------------------- il pannello

const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDay = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
const fmtDayTime = (iso) => new Date(iso).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const IDEA_TEXT = { sent: "Inviata", making: "In lavorazione", ready: "Pronto in Approva", error: "Non partita" };

// le cinque fasi della catena, spiegate: ognuna raggruppa le casette del villaggio nell'ordine del marciapiede
const PHASES = [
  { title: "L'idea", depts: ["ricerca", "soggetto"],
    text: "Si sceglie la storia: da quello che sta funzionando adesso, oppure dall'idea che scrivi tu nella sezione Idea." },
  { title: "La scrittura", depts: ["copione", "regia"],
    text: "Claude scrive l'aggancio dei primi secondi e le righe con il tono di ogni frase, poi disegna le scene di carta." },
  { title: "La produzione in cloud", depts: ["voce", "animazione", "musica", "montaggio", "qualita"],
    text: "Il narratore registra riga per riga, sei macchine disegnano i fotogrammi, arrivano carillon e suoni, poi il montaggio e il controllo. Circa 25 minuti." },
  { title: "Decidi tu", depts: ["revisione"],
    text: "Guardi il video in Approva: Pubblica, oppure Rifai con una nota su cosa cambiare." },
  { title: "L'uscita", depts: ["pubblicazione", "community", "statistiche"],
    text: "Alle 23:00, o subito con Pubblica adesso, esce su Instagram e YouTube (TikTok a mano); poi risposte ai commenti e numeri della sera." },
];

// how long each house usually works on one video (minutes, from the real runs): the bar and the "verso le…" come from here
const TYPICAL = { ricerca: 5, soggetto: 3, copione: 4, regia: 8, voce: 8, animazione: 11, musica: 1, montaggio: 3, qualita: 1,
  revisione: 0, pubblicazione: 3, community: 1, statistiche: 2 };
const CHAIN_TO_DESK = ["ricerca", "soggetto", "copione", "regia", "voce", "animazione", "musica", "montaggio", "qualita"];
function progress(id, info) {
  if (!info || info.status !== "working" || !info.updated_at || !TYPICAL[id]) return null;
  const start = Date.parse(info.updated_at), dur = TYPICAL[id] * 60000, now = Date.now();
  return { k: Math.min(.96, Math.max(.03, (now - start) / dur)), end: new Date(start + dur), left: Math.max(0, Math.round((start + dur - now) / 60000)) };
}
const etaText = (p) => p.left > 0 ? `finisce verso le ${fmtTime(p.end.toISOString())} (circa ${p.left} min)` : "sta per finire";
// when the video in the chain should reach the desk: the current house's end plus the usual time of the houses after it
function readyAt(deps) {
  const i = CHAIN_TO_DESK.findIndex((id) => (deps[id] || {}).status === "working");
  if (i < 0) return null;
  const p = progress(CHAIN_TO_DESK[i], deps[CHAIN_TO_DESK[i]]);
  const rest = CHAIN_TO_DESK.slice(i + 1).filter((id) => (deps[id] || {}).status !== "done").reduce((m, id) => m + TYPICAL[id], 0);
  return new Date((p ? p.end.getTime() : Date.now()) + rest * 60000);
}
const videoBadge = (v) => v?.n ? `Video ${v.n} di oggi` : "";

function render() {
  if (!state) return;
  const deps = state.departments || {};
  for (const d of DEPTS) {
    const s = (deps[d.id] || {}).status || "idle";
    setHouse(d.id, s);
    tags[d.id].dataset.status = s;
    const p = progress(d.id, deps[d.id]);
    tags[d.id].querySelector(".bar").hidden = !p;
    if (p) tags[d.id].querySelector(".bar b").style.width = Math.round(p.k * 100) + "%";
  }
  const working = DEPTS.filter((d) => (deps[d.id] || {}).status === "working");
  const waiting = DEPTS.filter((d) => (deps[d.id] || {}).status === "waiting");
  const head = $("headline"), ready = readyAt(deps);
  const which = state.video?.n ? `${videoBadge(state.video)}: ` : "";
  if (waiting.length) head.textContent = `${waiting[0].name} aspetta te.`;
  else if (working.length) head.textContent = `${which}${working.map((d) => d.who.split(",")[0]).join(" e ")} ${working.length > 1 ? "sono" : "è"} al lavoro${ready ? `, pronto verso le ${fmtTime(ready.toISOString())}` : ""}.`;
  else if (state.video) head.textContent = "Tutte le lanterne di oggi sono accese.";
  else head.textContent = "Il villaggio dorme: nessuna storia in lavorazione.";

  $("videoNo").hidden = !state.video?.n; $("videoNo").textContent = videoBadge(state.video);
  $("videoTitle").textContent = state.video ? state.video.title : "Nessuna storia oggi, per ora";
  $("videoLead").textContent = state.video
    ? (state.video.series ? `Serie: ${state.video.series}. ` : "") + `Iniziato alle ${fmtTime(state.video.started_at)}.` + (ready ? ` Pronto da guardare verso le ${fmtTime(ready.toISOString())}.` : "")
    : "Ogni mattina la sveglia accende la prima lanterna e la storia passa di reparto in reparto fino alla tua scrivania.";

  $("string").innerHTML = DEPTS.map((d) => {
    const s = (deps[d.id] || {}).status || "idle";
    return `<li data-status="${s}"><button type="button" data-dept="${d.id}" aria-label="${esc(d.name)}: ${STATUS_TEXT[s]}"><span class="lantern"><i></i></span>${esc(d.name)}</button></li>`;
  }).join("");

  $("phases").innerHTML = PHASES.map((ph) => {
    const sts = ph.depts.map((id) => (deps[id] || {}).status || "idle");
    const st = sts.includes("waiting") ? "waiting" : sts.includes("error") ? "error" : sts.includes("working") ? "working"
      : sts.every((x) => x === "done") ? "done" : "idle";
    const pw = ph.depts.map((id) => progress(id, deps[id])).find(Boolean);
    const pill = { working: `<span class="pill made">In corso${pw ? `: ${etaText(pw)}` : ""}</span>`, waiting: `<span class="pill made">Tocca a te</span>`,
      done: `<span class="pill published">Fatto</span>`, error: `<span class="pill">Si è fermato</span>` }[st] || "";
    const btns = st === "error" ? ph.depts.filter((id) => (deps[id] || {}).status === "error").map((id) => restartBtn(id, true)).join("") : "";
    return `<li data-st="${st}"><div><b>${esc(ph.title)}</b><span class="who">${esc(ph.depts.map((id) => BY_ID[id].name).join(" · "))}</span>
      <p>${esc(ph.text)}</p>${pill}${btns ? `<div class="row" style="margin-top:8px">${btns}</div>` : ""}</div></li>`;
  }).join("");

  const ideas = [...(state.ideas || [])].reverse();
  $("ideas").innerHTML = ideas.length ? ideas.map((i) => `<li><span>${esc(i.text)}</span>
      <span class="note">${fmtDayTime(i.at)}${i.title ? ` · ${esc(i.title)}` : ""}</span>
      <span class="pill ${i.status === "ready" ? "published" : i.status === "making" ? "made" : ""}">${IDEA_TEXT[i.status] || i.status}</span></li>`).join("")
    : `<li class="empty" style="display:block"><strong>Nessuna idea, per ora</strong>Quelle che mandi da qui compaiono in questa lista, con il loro stato.</li>`;

  const log = (state.log || []).slice(-25).reverse();
  $("diary").innerHTML = log.length ? log.map((l) => `<li><time>${fmtTime(l.at)}</time><img alt="" src="${ICONS[l.dept] || ICONS.regia}"><span>${esc(l.text)}</span></li>`).join("")
    : `<li class="empty" style="display:block"><strong>Il diario è vuoto</strong>Qui ogni reparto scrive cosa ha fatto, con l'ora.</li>`;

  const pending = (state.queue || []).filter((q) => q.status === "pending");
  const waitingComments = (state.community?.pending || []).filter((p) => p.status === "waiting");
  const count = $("queueCount");
  count.hidden = !(pending.length + waitingComments.length); count.textContent = pending.length + waitingComments.length;
  // critiques and complaints: Ada proposes a reply, the user sends it (as is or edited) or leaves it
  const csig = JSON.stringify(waitingComments);
  if (csig !== render.commentSig) {
    render.commentSig = csig;
    $("comments").innerHTML = waitingComments.length ? `<h3>Commenti da guardare</h3>` + waitingComments.map((p) => `
      <article class="review" style="grid-template-columns:1fr"><div>
        <ul class="chips"><li>${p.platform === "youtube" ? "YouTube" : "Instagram"}</li><li>${esc(p.author)}</li><li>${fmtDayTime(p.at)}</li></ul>
        <p class="cap">“${esc(p.text)}”</p>
        <label class="note" for="cm-${esc(p.id)}">Risposta proposta da Ada (puoi cambiarla)</label>
        <textarea id="cm-${esc(p.id)}">${esc(p.proposal || "")}</textarea>
        <div class="row"><button class="btn primary" data-cm-ok="${esc(p.id)}">Rispondi così</button><button class="btn" data-cm-no="${esc(p.id)}">Lascia stare</button></div>
      </div></article>`).join("") : "";
  }
  // the queue is redrawn only when it really changes: redrawing it every few seconds stopped the video
  // halfway and wiped a half-written note
  // a video leaves Approva one day after it went out on every platform (or after a "Rifai" that never came back)
  const lastOut = (q) => Math.max(0, ...Object.values(q.published || {}).map((p) => Date.parse(p.at) || 0));
  const queue = [...(state.queue || [])].reverse().filter((q) =>
    !(q.status === "published" && Date.now() - (lastOut(q) || Date.parse(q.decided_at || q.created_at)) > 864e5) &&
    !(q.status === "redo" && Date.now() - Date.parse(q.decided_at || q.created_at) > 864e5));
  const sig = JSON.stringify([queue, Boolean(demo), new Date().getUTCHours()]);
  if (sig !== render.queueSig && !document.querySelector("#queue details.edit[open]")) {   // not while you are editing a caption
    render.queueSig = sig;
    const notes = Object.fromEntries([...document.querySelectorAll("#queue textarea")].map((t) => [t.id, t.value]));
    $("queue").innerHTML = queue.length ? queue.map(reviewCard).join("")
      : `<div class="empty"><strong>Nessun video aspetta il tuo ok</strong>Quando una storia è pronta ti arriva una notifica sul telefono e la trovi qui.</div>`;
    for (const [id, v] of Object.entries(notes)) if ($(id)) $(id).value = v;
    attachFilms(queue);
  }

  renderDays();
  renderStats();
  renderControl();
  $("bellDot").hidden = Boolean(state.devices);
  if (selected) fillSheet(selected);
}

const filmUrl = (q, f) => `/media/${encodeURIComponent(q.id)}/${f}?v=${encodeURIComponent(q.created_at || "")}`;
const films = new Map();   // address → object URL of the film already in memory
const FILM_CACHE = "lanternfox-films";

async function filmBlob(url, progress) {
  const cache = "caches" in window ? await caches.open(FILM_CACHE).catch(() => null) : null;
  let res = cache && await cache.match(url);
  if (!res) {
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const total = Number(r.headers.get("Content-Length")) || 0, reader = r.body.getReader(), parts = [];
    let got = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; if (total) progress(got / total); }
    res = new Response(new Blob(parts, { type: "video/mp4" }), { headers: { "Content-Type": "video/mp4" } });
    if (cache) await cache.put(url, res.clone()).catch(() => {});
  }
  return res.blob();
}

// loads every film in the queue whole, then hands it to its <video>; old films leave the phone's cache
function attachFilms(queue) {
  for (const v of document.querySelectorAll("#queue video[data-film]")) {
    const url = v.dataset.film, bar = v.parentElement.querySelector(".film-load");
    if (demo) { v.src = url; continue; }
    if (films.has(url)) { v.src = films.get(url); continue; }
    bar.hidden = false;
    filmBlob(url, (k) => { bar.querySelector("i").style.width = Math.round(k * 100) + "%"; bar.querySelector("b").textContent = `Scarico il video… ${Math.round(k * 100)}%`; })
      .then((blob) => { const o = URL.createObjectURL(blob); films.set(url, o); bar.hidden = true;
        for (const w of document.querySelectorAll("#queue video[data-film]")) if (w.dataset.film === url) w.src = o; })
      .catch(() => { bar.hidden = true; v.preload = "metadata"; v.src = url; });   // no cache: plays streaming, as before
  }
  const keep = new Set(queue.map((q) => filmUrl(q, "film.mp4")));
  if ("caches" in window) caches.open(FILM_CACHE).then(async (c) => {
    for (const req of await c.keys()) if (!keep.has(new URL(req.url).pathname + new URL(req.url).search)) c.delete(req);
  }).catch(() => {});
}

// "Scarica": on a phone the share sheet with the file ("Salva video" puts it in the gallery); elsewhere a normal download
const dlButton = (q) => q.preview_url ? `<button class="btn" data-dl="${esc(q.id)}" aria-label="Scarica il video">Scarica</button>` : "";
async function saveFilm(q, b) {
  if (!q) return;
  const name = (q.title || q.id).replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") + ".mp4";
  if (demo) { toast("Nella prova non c'è un file da scaricare"); return; }
  try {
    // iPhone opens the share sheet only right after a tap: if the file is not ready yet, the first tap prepares it
    // and the second one saves it
    const file = saveFilm.ready?.[q.id];
    if (file && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: q.title }); b.textContent = "Scarica"; return; }
    b.disabled = true; b.textContent = "Preparo…";
    const url = filmUrl(q, "film.mp4");
    const blob = films.has(url) ? await (await fetch(films.get(url))).blob() : await filmBlob(url, (k) => { b.textContent = `Scarico ${Math.round(k * 100)}%`; });
    const f = new File([blob], name, { type: "video/mp4" });
    b.disabled = false;
    if (navigator.canShare?.({ files: [f] })) {
      (saveFilm.ready ||= {})[q.id] = f;
      b.textContent = "Salva sul telefono";
      try { await navigator.share({ files: [f], title: q.title }); b.textContent = "Scarica"; }
      catch (err) { if (err?.name !== "AbortError") toast("Pronto: tocca di nuovo per salvarlo"); }
      return;
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    b.textContent = "Scarica";
  } catch (err) { b.disabled = false; b.textContent = "Scarica"; if (err?.name !== "AbortError") toast("Non riesco a scaricarlo: riprova"); }
}

function reviewCard(q) {
  // the film comes through the Office (/media/…) so it plays on iPhone too, and is downloaded whole
  // into the phone's cache before it starts (attachFilms), so it never stops to load halfway
  const src = (f, url) => demo ? url : filmUrl(q, f);
  const media = q.preview_url
    ? `<div class="filmbox"><video data-film="${esc(src("film.mp4", q.preview_url))}" ${q.cover_url ? `poster="${esc(src("poster.jpg", q.cover_url))}"` : ""} controls playsinline preload="none"></video>
       <span class="film-load" hidden><i></i><b>Scarico il video…</b></span></div>`
    : `<div class="ph">L'anteprima arriva con il primo video vero</div>`;
  const plats = (q.platforms || ["Instagram", "YouTube", "TikTok"]).map((p) => `<li>${esc(p)}</li>`).join("");
  const actions = q.status === "pending"
    ? `<label for="note-${esc(q.id)}" class="note">Se va rifatto, cosa cambiare</label>
       <textarea id="note-${esc(q.id)}" placeholder="Per esempio: la voce più lenta nel finale"></textarea>
       <div class="row"><button class="btn primary" data-approve="${esc(q.id)}">Pubblica</button><button class="btn" data-redo="${esc(q.id)}">Rifai</button>${dlButton(q)}</div>`
    : q.status === "redo" ? `<p class="decided">Da rifare (chiesto alle ${fmtTime(q.decided_at)})${q.note ? `: ${esc(q.note)}` : ""}</p><p class="note" style="margin:0">La Regia sistema il copione e le scene, poi la nuova versione arriva qui in circa mezz'ora.</p>`
    : publishedBlock(q);
  const no = q.n ? `<span class="vno">Video ${q.n} del ${new Date(q.day + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</span>` : "";
  return `<article class="review"><div>${media}</div><div>${no}<h4>${esc(q.title)}</h4><ul class="chips">${plats}</ul>
    <p class="cap">${esc(q.caption || "")}</p>${qualityBlock(q)}${actions}</div></article>`;
}

// —— publishing times: the slots (UTC hours), the Italian day, and when each approved video goes out ——
const romeDay = (t) => new Date(t).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
function nextSlot(from) {   // the first publishing slot at or after "from" (ms)
  const hours = [].concat(state?.publish_at_utc ?? [22]).map(Number).sort((a, b) => a - b);
  for (let d = 0; d < 9; d++) for (const h of hours) {
    const at = new Date(from); at.setUTCDate(at.getUTCDate() + d); at.setUTCHours(h, 0, 0, 0);
    if (at.getTime() >= from - 5 * 60e3) return at;
  }
  return new Date(from);
}
const outAt = (q) => nextSlot(Math.max(Date.now(), Date.parse(q.publish_after || 0) || 0));
const whenText = (at) => `${romeDay(at) === romeDay(Date.now()) ? "oggi" : romeDay(at) === romeDay(Date.now() + 864e5) ? "domani" : fmtDay(romeDay(at))} alle ${fmtTime(at.toISOString())}`;
// how many videos go out today: already out (first platform) plus the approved ones waiting for a slot today
function todayCount(exceptId) {
  const today = romeDay(Date.now());
  const out = (state.queue || []).filter((q) => Object.values(q.published || {}).some((p) => p?.url && romeDay(Date.parse(p.at)) === today)).length;
  const waiting = (state.queue || []).filter((q) => q.status === "approved" && q.id !== exceptId && romeDay(outAt(q)) === today).length;
  return out + waiting;
}

// After "Pubblica": when it goes out and where it already is; TikTok arrives in the drafts and the user taps Publish
// what the Controllo qualità found on this film
function qualityBlock(q) {
  const k = q.quality;
  if (!k) return "";
  return k.ok ? `<p class="note" style="margin:0 0 10px;color:var(--ok)">Controllo qualità: tutto a posto (${k.checks.length} controlli)</p>`
    : `<div class="alert" style="margin:0 0 10px"><b>Controllo qualità: da guardare</b>${k.problems.map((p) => `<span class="note" style="display:block">${esc(p)}</span>`).join("")}</div>`;
}

function publishedBlock(q) {
  const pub = q.published || {};
  // the slot it waits for (one story per slot), or the time the user chose
  const at = outAt(q), local = whenText(at), later = Date.parse(q.publish_after || 0) > Date.now();
  const row = (key, name) => pub[key]?.url ? `<li><a href="${esc(pub[key].url)}" target="_blank" rel="noopener">${name}: uscito ↗</a></li>`
    : pub[key]?.draft ? `<li>${name}: nelle bozze</li>`
    : pub[key]?.error ? `<li>${name}: non riuscito, riprovo al prossimo giro</li>` : `<li>${name}: esce ${local}</li>`;
  const edit = q.status === "approved" ? `<details class="edit"><summary>Modifica titolo e didascalia</summary>
    <label class="note" for="t-${esc(q.id)}">Titolo</label><input id="t-${esc(q.id)}" class="field" style="min-height:0" maxlength="120" value="${esc(q.title)}">
    <label class="note" for="c-${esc(q.id)}">Didascalia (con gli hashtag)</label><textarea id="c-${esc(q.id)}" class="field" maxlength="2200">${esc(q.caption || "")}</textarea>
    <div class="row"><button class="btn primary" data-edit="${esc(q.id)}">Salva le modifiche</button></div></details>` : "";
  const now = edit + `<div class="row">${q.status === "approved" ? `<button class="btn primary" data-now="${esc(q.id)}">Pubblica adesso</button>
    ${later ? `<button class="btn" data-when="${esc(q.id)}" data-after="">Al prossimo orario</button>`
      : `<button class="btn" data-when="${esc(q.id)}" data-after="${nextSlot(at.getTime() + 60e3).toISOString()}">Sposta al giro dopo</button>`}` : ""}${dlButton(q)}</div>`;
  return `<p class="decided">${q.status === "published" ? "Pubblicato" : "Approvato"} alle ${fmtTime(q.decided_at)}</p>
    <ul class="chips">${row("instagram", "Instagram")}${row("youtube", "YouTube")}${pub.tiktok ? row("tiktok", "TikTok") : ""}</ul>${now}
    ${pub.tiktok?.url ? "" : pub.tiktok?.draft ? `<p class="note" style="margin:0 0 8px">Su TikTok il video è nelle bozze: apri l'app, tocca la notifica, incolla la didascalia e premi Pubblica.</p>
    <div class="row"><button class="btn" data-copy="${esc(q.id)}">Copia didascalia</button></div>`
    : `<p class="note" style="margin:0 0 8px">TikTok per ora si pubblica a mano: apri il video, salvalo e caricalo dall'app con la didascalia.</p>
    <div class="row"><a class="btn" href="${filmUrl(q, "film.mp4")}" target="_blank" rel="noopener" style="text-decoration:none">Apri il video</a>
    <button class="btn" data-copy="${esc(q.id)}">Copia didascalia</button></div>`}`;
}

function renderDays() {
  if ($("days").querySelector(".noteform")) return;   // a note being written: the 6-second refresh waits
  const today = new Date().toISOString().slice(0, 10);
  const label = { planned: "In programma", made: "Fatto", approved: "Approvato", published: "Pubblicato", skipped: "Nessun video" };
  const out = [];
  for (let i = -3; i < 11; i++) {
    const date = new Date(Date.now() + i * 864e5).toISOString().slice(0, 10);
    const vids = (state.calendar || []).filter((c) => c.date === date);   // both videos of the day, each with how it went
    const st = i < 0 ? "skipped" : "planned";
    out.push(`<li class="${date === today ? "today" : ""}"><span class="d">${fmtDay(date)}<small>${date === today ? "oggi" : ""}</small></span>
      ${vids.length ? `<span class="vids">${vids.map((c) => `<span class="vid"><span>${esc(c.title)}</span><span class="pill ${c.status}">${label[c.status] || c.status}</span></span>`).join("")}</span>`
        : `<span><span class="note">${i < 0 ? "—" : "Il Soggetto li sceglie la mattina stessa"}</span></span><span class="pill ${st}">${label[st]}</span>`}
      <span class="mine">${(state.notes || []).filter((n) => n.date === date).map((n) => `<span class="mynote" title="${n.read_by?.length ? "Letta da: " + esc(n.read_by.map((d) => BY_ID[d]?.name || d).join(", ")) : "Ancora nessun reparto l'ha letta"}">✎ ${esc(n.text)}${n.read_by?.length ? ` <small class="read">👁 ${n.read_by.length}</small>` : ""}
        <button class="x" data-unnote="${esc(n.id)}" aria-label="Togli la nota">×</button></span>`).join("")}
        <button class="addnote" data-note="${date}">+ Aggiungi una nota</button></span></li>`);
  }
  $("days").innerHTML = out.join("");
}

// where each house's work can be seen in detail: the render's jobs and logs on GitHub, or the Claude routine's runs
const WORKS = { ricerca: "RESEARCH", soggetto: "PRODUCE", copione: "PRODUCE", regia: "PRODUCE", voce: "RENDER", animazione: "RENDER",
  musica: "RENDER", montaggio: "RENDER", qualita: "RENDER", pubblicazione: "PUBLISH", community: "COMMUNITY", statistiche: "COMMUNITY" };
function workLinks(id) {
  const L = state?.links, w = WORKS[id];
  if (!L || !w) return "";
  const gh = `https://github.com/${L.repo}`, a = (href, text) => `<a class="btn" href="${esc(href)}" target="_blank" rel="noopener" style="text-decoration:none">${text}</a>`;
  if (w === "RENDER") {
    const f = state.chain?.failed;
    return a(f?.url && f.id === (state.video?.id || f.id) ? f.url : `${gh}/actions/workflows/render.yml`, "Il render su GitHub")
      + a(`${gh}/actions/workflows/office.yml`, "Il guardiano");
  }
  const r = L.routines?.[w];
  return (r ? a(`https://claude.ai/code/routines/${r}`, "Il lavoro di Claude") : "")
    + a(`${gh}/commits/main`, "Cosa ha salvato su GitHub");
}

// "Fai ripartire" for one house that stopped: only that house (and what comes after it) runs again
// (Ricerca and Community without their key: they start again by themselves at their next round)
const restartBtn = (id, primary) => id === "revisione" ? "" : state?.can_restart?.[id] === false
  ? `<span class="note">${esc(BY_ID[id].name)} riparte da sola al prossimo giro</span>`
  : `<button class="btn${primary ? " primary" : ""}" data-op="dept" data-target="${id}">Fai ripartire ${esc(BY_ID[id].name)}</button>`;

// —— control of the chain: what stopped, the day's shifts, the next video out, the Research's day, GitHub ——
const utcToday = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); const d = new Date(); d.setUTCHours(h, m, 0, 0); return d; };
const inMin = (d) => { const m = Math.round((d - Date.now()) / 60000); return m < 60 ? `tra ${m} min` : `tra ${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
function renderControl() {
  renderGeneral();
  const deps = state.departments || {}, now = Date.now();
  // 1. a stopped chain, in red, with the button that starts it again
  const fail = state.chain?.failed;
  const broken = DEPTS.filter((d) => (deps[d.id] || {}).status === "error");
  let alert = "";
  if (fail) alert += `<div class="alert"><b>⚠ Il render di "${esc(fail.id)}" si è fermato (${esc(fail.step)})</b>
    <span class="note">Alle ${fmtTime(fail.at)}. <a href="${esc(fail.url)}" target="_blank" rel="noopener" style="color:var(--lamp)">Vedi su GitHub</a></span>
    <div class="row">${["voce", "animazione", "musica", "montaggio", "qualita"].map((id) => (deps[id] || {}).status === "error" ? restartBtn(id, true) : "").join("")
      || `<button class="btn primary" data-op="rerender" data-target="${esc(fail.id)}">Fai ripartire il render</button>`}</div></div>`;
  for (const d of broken) {
    if (fail && ["voce", "animazione", "musica", "montaggio"].includes(d.id)) continue;
    const btn = restartBtn(d.id, true);
    alert += `<div class="alert"><b>⚠ ${esc(d.name)} si è fermato</b><span class="note">${esc(deps[d.id].task || "")}</span>
      ${btn ? `<div class="row">${btn}</div>` : ""}</div>`;
  }
  const opsRunning = (state.ops || []).filter((o) => o.status === "waiting" || o.status === "running");
  if (opsRunning.length) alert += `<div class="alert ok"><b>Ripartenza in corso</b><span class="note">${opsRunning.map((o) => `render di ${esc(o.target)}`).join(", ")}: il guardiano di GitHub passa ogni 15 minuti.</span></div>`;
  $("alert").innerHTML = alert;
  // 2. the next video out
  const ready = (state.queue || []).filter((q) => q.status === "approved").sort((a, b) => outAt(a) - outAt(b));
  $("nextOut").hidden = !ready.length;
  if (ready.length) { const at = outAt(ready[0]);
    $("nextOut").textContent = `Prossima uscita: "${ready[0].title}" ${whenText(at)} (${inMin(at)})` + (ready.length > 1 ? `, poi altri ${ready.length - 1}` : ""); }
  // 3. the day's shifts, in Italian time, with how each one went
  const today = (state.today?.day === new Date(now + 3600e3).toISOString().slice(0, 10)) ? state.today.ids.length : 0;
  const sched = state.schedule || [];
  const upcoming = sched.map((s) => utcToday(s.utc)).filter((d) => d > now).sort((a, b) => a - b)[0];
  $("dayplan").innerHTML = sched.map((s) => {
    const at = utcToday(s.utc), past = at < now, isNext = upcoming && at.getTime() === upcoming.getTime();
    let status = past ? "fatto" : isNext ? inMin(at) : "", cls = past ? "past" : isNext ? "next" : "", btn = "";
    if (s.slot) {
      if (today >= s.slot) status = "partito ✓";
      else if (now > at.getTime() + 40 * 60000) { status = "non è partito"; cls = "miss";
        btn = `<button class="btn" data-op="produce">Fallo partire</button>`; }
    }
    return `<li class="${cls}"><time>${fmtTime(at.toISOString())}</time><span><span class="who">${esc(s.who)}</span><span class="what">${esc(s.what)}</span></span>
      <span>${btn || (status ? `<span class="pill ${status.includes("✓") || status === "fatto" ? "published" : ""}">${esc(status)}</span>` : "")}</span></li>`;
  }).join("");
  // 4. examples to study and what the Research did today
  const ex = [...(state.examples || [])].reverse();
  $("examples").innerHTML = ex.map((e) => `<li><span>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener" style="color:var(--paper)">${esc(e.url.replace(/^https:\/\/(www\.)?/, "").slice(0, 46))}…</a>` : `Video caricato${e.name ? `: ${esc(e.name)}` : ""}`}</span>
      ${e.note ? `<span class="note">${esc(e.note)}</span>` : ""}<span class="note">${fmtDayTime(e.at)}${e.result ? ` · ${linkify(e.result)}` : ""}</span>
      <span class="pill ${e.status === "studied" ? "published" : e.status === "failed" ? "" : "made"}">${{ waiting: "In coda (entro 15 min)", running: "La Ricerca lo sta studiando", studied: "Studiato", failed: "Non riuscito" }[e.status] || e.status}</span></li>`).join("");
  const r = state.research;
  $("research").innerHTML = r ? `<div class="research"><p class="note">${esc(r.date)} · aggiornata alle ${fmtTime(r.at)}</p>
      <p><b>Come studia:</b> ${esc(r.method || "")}</p>
      <p><b>Video studiati (${r.studied.length})</b></p><ul>${r.studied.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener" style="color:var(--lamp)">${esc(s.title || s.url)}</a>` : esc(s.title)}: ${esc(s.notes)}${s.analysis ? ` (${linkify(s.analysis)})` : ""}</li>`).join("")}</ul>
      <p><b>Idee raccolte per domani</b></p><ul>${r.ideas.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`
    : `<div class="empty"><strong>La Ricerca non ha ancora fatto il giro di stasera</strong>Ogni sera alle ${fmtTime(utcToday("19:30").toISOString())} studia i video della giornata (i tuoi esempi e quelli che trova lei) e raccoglie le idee per il giorno dopo.</div>`;
  // 5. GitHub: the minutes of the assembly line, and the last renders
  const g = state.github;
  $("gh").innerHTML = g ? `<div class="nums"><div class="num"><b>${g.minutes_month}</b><span>minuti usati questo mese</span></div>
      <div class="num"><b>${g.runs_month}</b><span>lavori questo mese</span></div><div class="num"><b>${g.failed_24h}</b><span>fermi nelle ultime 24 ore</span></div></div>
      <p class="note" style="margin-top:10px">Il repository è pubblico: per GitHub i minuti sono gratis e senza limite. Controllato alle ${fmtTime(g.checked_at)}.</p>
      ${(g.last || []).length ? `<ul class="diary" style="margin-top:10px">${g.last.map((x) => `<li style="grid-template-columns:52px 1fr auto"><time>${fmtTime(x.at)}</time><span>${esc(x.title)}</span><a href="${esc(x.url)}" target="_blank" rel="noopener" class="pill ${x.conclusion === "success" ? "published" : ""}" style="text-decoration:none">${{ success: "ok", failure: "fermo", cancelled: "annullato", in_progress: "in corso", queued: "in coda" }[x.conclusion] || esc(x.conclusion)}</a></li>`).join("")}</ul>` : ""}`
    : `<div class="empty"><strong>Il guardiano non è ancora passato</strong>Ogni 15 minuti controlla GitHub e aggiorna questi numeri.</div>`;
}
const linkify = (s) => esc(s).replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--lamp)">apri</a>');

function renderStats() {
  const s = state.stats;
  if (!s) { $("stats").innerHTML = `<div class="empty"><strong>Ancora niente da contare</strong>Le statistiche arrivano la sera dopo il primo video pubblicato.</div>`; return; }
  const f = s.followers || {};
  const n = (x) => (x ?? "–").toLocaleString?.("it-IT") ?? x;
  $("stats").innerHTML = `<h3 style="margin-top:0">Follower</h3><div class="nums">
    <div class="num"><b>${n(f.instagram)}</b><span>Instagram</span></div>
    <div class="num"><b>${n(f.youtube)}</b><span>YouTube</span></div>
    <div class="num"><b>${n(f.tiktok)}</b><span>TikTok</span></div></div>
    <h3>Ultimi 7 giorni</h3><div class="nums"><div class="num"><b>${n(s.views_7d)}</b><span>visualizzazioni</span></div>
    <div class="num" style="grid-column: span 2"><b style="font-size:1.1rem">${esc(s.best ? s.best.title : "–")}</b><span>la storia più vista${s.best ? ` (${n(s.best.views)})` : ""}</span></div></div>
    ${(s.videos || []).length ? `<h3>Video per video</h3><ul class="ideas">${[...s.videos].reverse().map((v) => `<li><span>${esc(v.title)}</span>
      <span class="note">YouTube: ${v.youtube ? `${n(v.youtube.views)} viste, ${n(v.youtube.likes)} like, ${n(v.youtube.comments)} commenti` : "–"}</span>
      <span class="note">Instagram: ${v.instagram ? `${v.instagram.views != null ? n(v.instagram.views) + " viste, " : ""}${n(v.instagram.likes)} like, ${n(v.instagram.comments)} commenti${v.instagram.shares != null ? `, ${n(v.instagram.shares)} condivisioni` : ""}${v.instagram.avg_watch_s != null ? `, guardato in media ${v.instagram.avg_watch_s.toFixed(0)} s` : ""}` : "–"}</span></li>`).join("")}</ul>` : ""}
    <p class="note" style="margin-top:12px">Aggiornate alle ${fmtTime(s.updated_at)}. Le visualizzazioni contano solo YouTube${(s.videos || []).some((v) => v.instagram?.views != null) ? " e Instagram" : ": Instagram non le fornisce ancora"}.</p>`;
}

// scheda del reparto
const sheet = $("sheet"), scrim = $("scrim");
let lastFocus = null;
function openDept(id) {
  selected = id;
  for (const d of DEPTS) tags[d.id].setAttribute("aria-pressed", String(d.id === id));
  fillSheet(id);
  lastFocus = document.activeElement;
  sheet.hidden = false;
  flyToHouse(id);
  requestAnimationFrame(() => { sheet.classList.add("open"); scrim.classList.add("open"); sheet.querySelector("[data-close]")?.focus(); });
}
function closeSheet() {
  selected = null;
  for (const d of DEPTS) tags[d.id].setAttribute("aria-pressed", "false");
  sheet.classList.remove("open"); scrim.classList.remove("open");
  setTimeout(() => { if (!sheet.classList.contains("open")) sheet.hidden = true; }, 340);
  flyTo(HOME.x, HOME.z, 1, HOME.y);
  lastFocus?.focus?.();
}
function fillSheet(id) {
  const d = BY_ID[id];
  const info = (state?.departments || {})[id] || { status: "idle" };
  const isDesk = id === "revisione";
  const pending = (state?.queue || []).filter((q) => q.status === "pending").length;
  $("sheetBody").innerHTML = `<header><img alt="" src="${ICONS[id]}"><div><h2 id="sheetTitle">${esc(d.name)}</h2><p>${esc(d.who)} · ${STATUS_TEXT[info.status] || info.status}</p></div>
      <button class="round" data-close aria-label="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
    <p style="margin:16px 0 0">${esc(d.does)}</p>
    <p class="note" style="margin:8px 0 0">Dentro: ${esc(INSIDE[id])}${info.status === "idle" ? " Adesso però dorme." : ""}</p>
    <div class="now"><b>${info.status === "idle" ? "Ultimo lavoro" : "Adesso"}</b>${info.task ? esc(info.task) : `<span class="note">Niente da fare, per ora.</span>`}
      ${(() => { const p = progress(id, info); return p ? `<div class="meter"><i style="width:${Math.round(p.k * 100)}%"></i></div><p class="note" style="margin-top:6px">Di solito ci mette ${TYPICAL[id]} min: ${etaText(p)}.</p>` : ""; })()}
      ${info.output ? `<p class="out">${esc(info.output)}</p>` : ""}${info.updated_at ? `<p class="note" style="margin-top:6px">Aggiornato alle ${fmtTime(info.updated_at)}</p>` : ""}</div>
    ${info.status === "error" && id !== "revisione" ? `<div class="row" style="margin-top:14px">${restartBtn(id, true)}</div>` : ""}
    ${workLinks(id) ? `<div class="row" style="margin-top:14px">${workLinks(id)}</div>` : ""}
    ${id === "ricerca" ? `<div class="row" style="margin-top:14px"><button class="btn" data-goto="idea">${state?.research ? `Cosa ha studiato oggi (${state.research.studied.length} video)` : "Dagli un video da studiare"}</button></div>` : ""}
    ${isDesk ? `<div class="row" style="margin-top:14px"><button class="btn primary" data-goto="approva">${pending ? `Guarda ${pending === 1 ? "il video" : `i ${pending} video`} da approvare` : "Apri la coda di approvazione"}</button></div>` : ""}
    ${d.skills.length ? `<h3>Con quali strumenti lavora</h3><ul class="chips">${d.skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}`;
}
sheet.addEventListener("click", (e) => {
  if (e.target.closest("[data-close]")) closeSheet();
  const go = e.target.closest("[data-goto]");
  if (go) { closeSheet(); selectTab(go.dataset.goto); document.querySelector(".panel").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
});
scrim.addEventListener("click", closeSheet);
addEventListener("keydown", (e) => { if (e.key === "Escape" && selected) closeSheet(); });
$("string").addEventListener("click", (e) => { const b = e.target.closest("[data-dept]"); if (b) openDept(b.dataset.dept); });

// schede del pannello
const tabNames = ["oggi", "idea", "approva", "calendario", "numeri"];
function selectTab(name) {
  for (const t of tabNames) {
    $("t-" + t).setAttribute("aria-selected", String(t === name));
    $("t-" + t).tabIndex = t === name ? 0 : -1;
    $("p-" + t).hidden = t !== name;
  }
  history.replaceState(null, "", name === "oggi" ? location.pathname : "#" + name);
}
document.querySelector(".tabs").addEventListener("click", (e) => { const b = e.target.closest("[role=tab]"); if (b) selectTab(b.id.slice(2)); });
document.querySelector(".tabs").addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  const i = tabNames.findIndex((t) => $("t-" + t).getAttribute("aria-selected") === "true");
  const next = tabNames[(i + (e.key === "ArrowRight" ? 1 : tabNames.length - 1)) % tabNames.length];
  selectTab(next); $("t-" + next).focus();
});
if (tabNames.includes(location.hash.slice(1))) selectTab(location.hash.slice(1));

// approvazioni
$("queue").addEventListener("click", async (e) => {
  const c = e.target.closest("[data-copy]");
  if (c) {
    const q = (state?.queue || []).find((x) => x.id === c.dataset.copy);
    try { await navigator.clipboard.writeText(q?.caption || ""); toast("Didascalia copiata"); } catch { toast("Non riesco a copiare: tieni premuto sul testo"); }
    return;
  }
  const dl = e.target.closest("[data-dl]");
  if (dl) { saveFilm(state.queue.find((x) => x.id === dl.dataset.dl), dl); return; }
  const n = e.target.closest("[data-now]");
  if (n) {
    if (demo) { toast("Pubblicazione avviata (per finta: è una prova)"); return; }
    n.disabled = true;
    const r = await fetch("/publish/now", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.dataset.now }) });
    n.disabled = false;
    toast(r.ok ? "Pubblicazione avviata: tra qualche minuto è online" : "Non riesco ad avviare la pubblicazione: esce comunque all'orario");
    load();
    return;
  }
  const ed = e.target.closest("[data-edit]");   // title and caption of a video that has not gone out yet
  if (ed) {
    const id = ed.dataset.edit, title = document.getElementById("t-" + id).value, caption = document.getElementById("c-" + id).value;
    if (demo) { toast("Nella prova non si salva niente"); return; }
    ed.disabled = true;
    const r = await fetch("/queue/edit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title, caption }) });
    ed.disabled = false;
    toast(r.ok ? "Salvato: esce con il nuovo titolo e la nuova didascalia" : "Non sono riuscito a salvare: riprova");
    render.queueSig = null; load();
    return;
  }
  const w = e.target.closest("[data-when]");   // "Sposta al giro dopo" / "Al prossimo orario"
  if (w) {
    if (demo) { toast("Nella prova non si sposta niente"); return; }
    w.disabled = true;
    const r = await fetch("/approve/when", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: w.dataset.when, after: w.dataset.after || null }) });
    toast(r.ok ? `Esce ${whenText(outAt({ publish_after: w.dataset.after }))}` : "Non sono riuscito a spostarlo: riprova");
    render.queueSig = null; load();
    return;
  }
  const b = e.target.closest("[data-approve],[data-redo]");
  if (!b) return;
  const id = b.dataset.approve || b.dataset.redo;
  const decision = b.dataset.approve ? "approved" : "redo";
  const note = document.getElementById("note-" + id)?.value || "";
  const after = b.dataset.after ?? null;
  if (decision === "approved" && after === null && todayCount(id) >= 2) {
    const today = nextSlot(Date.now()), tomorrow = nextSlot(Date.parse(romeDay(Date.now() + 864e5) + "T00:00:00+01:00"));
    if (romeDay(today) === romeDay(Date.now())) {   // there is still a slot today: the user chooses
      b.closest(".row").outerHTML = `<div class="ask"><p>Oggi escono già ${todayCount(id)} video. Quando pubblico questo?</p><div class="row">
        <button class="btn primary" data-approve="${esc(id)}" data-after="${tomorrow.toISOString()}">${esc(whenText(tomorrow).replace(/^./, (c) => c.toUpperCase()))}</button>
        <button class="btn" data-approve="${esc(id)}" data-after="">${esc(whenText(today).replace(/^./, (c) => c.toUpperCase()))}</button></div></div>`;
      return;
    }
  }
  if (decision === "redo" && !note.trim()) { toast("Scrivi cosa cambiare, così il Copione sa da dove ripartire"); document.getElementById("note-" + id)?.focus(); return; }
  if (demo) { const q = state.queue.find((x) => x.id === id); Object.assign(q, { status: decision, note, decided_at: new Date().toISOString() }); render(); toast(decision === "approved" ? "Approvato (per finta: è una prova)" : "Mandato alla Regia (per finta)"); return; }
  b.disabled = true;
  const r = await fetch("/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision, note, after: after || null }) });
  b.disabled = false;
  if (!r.ok) { toast("Non sono riuscito a salvare la scelta: riprova"); return; }
  const res = await r.json().catch(() => ({}));
  toast(decision === "approved" ? `Approvato: esce ${whenText(outAt({ publish_after: after }))}, oppure premi Pubblica adesso`
    : res.started ? "La Regia sta rifacendo il video con la tua nota" : "Nota salvata, ma la Regia non è partita: controlla la routine");
  load();
});

// la rubrica delle voci (scheda Numeri): si carica una volta sola, i campioni solo quando premi play
let voiceList = null;
function renderVoices(g = "") {
  $("voices").innerHTML = voiceList.filter((v) => !g || v.genere === g).map((v) => `<li><b>${esc(v.nome)}</b> <span class="note">· ${v.genere === "M" ? "maschile" : "femminile"}, ${esc(v.tipo)}</span>
    <div class="note">Per: ${esc(v.usa_per)}</div><audio controls preload="none" src="/voices/${esc(v.id)}.wav"></audio></li>`).join("");
}
fetch("/voices.json").then((r) => (r.ok ? r.json() : null)).then((list) => { if (list) { voiceList = list; renderVoices(); } }).catch(() => {});
$("voiceFilter").addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (b && voiceList) renderVoices(b.dataset.g); });

// le tue note nel calendario: un campo che si apre sotto il giorno, e la × per toglierle
$("days").addEventListener("click", async (e) => {
  const add = e.target.closest("[data-note]"), del = e.target.closest("[data-unnote]"), save = e.target.closest("[data-savenote]");
  if (add) {
    add.outerHTML = `<span class="noteform"><input type="text" maxlength="300" placeholder="Es. domani video su Halloween" aria-label="La tua nota">
      <button class="btn primary" data-savenote="${add.dataset.note}">Salva</button></span>`;
    $("days").querySelector(".noteform input").focus();
    return;
  }
  if (!del && !save) return;
  const body = del ? { id: del.dataset.unnote, remove: true } : { date: save.dataset.savenote, text: save.previousElementSibling.value };
  if (save && !body.text.trim()) return;
  if (demo) { toast("Nella prova le note non si salvano"); return; }
  const r = await fetch("/calendar/note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { toast("Non sono riuscito a salvare la nota: riprova"); return; }
  state.notes = j.notes; $("days").querySelector(".noteform")?.remove(); renderDays();
  toast(del ? "Nota tolta" : "Nota salvata nel calendario");
});
$("days").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches(".noteform input")) e.target.nextElementSibling.click(); });

// commenti da guardare: la decisione va all'ufficio, la risposta parte al prossimo giro di Ada
$("comments").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-cm-ok],[data-cm-no]");
  if (!b) return;
  const id = b.dataset.cmOk || b.dataset.cmNo, ok = Boolean(b.dataset.cmOk);
  const reply = ($("cm-" + id)?.value || "").trim();
  if (ok && !reply) { toast("Scrivi la risposta, o premi Lascia stare"); return; }
  b.disabled = true;
  const r = await fetch("/community/decide", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, decision: ok ? "approved" : "dismissed", reply }) });
  b.disabled = false;
  toast(!r.ok ? "Non sono riuscito a salvare: riprova" : ok ? "Risposta approvata: parte al prossimo giro dei commenti" : "Lasciato senza risposta");
  load();
});

// il Generale in Home: cosa ha visto e fatto all'ultimo giro; il tasto lo manda a controllare tutta la catena
$("generalImg").src = ICONS.general;
function renderGeneral() {
  const g = state?.guard;
  if (g) $("generalText").textContent = `Ultimo giro alle ${fmtTime(g.at)}. ${g.text}`;
}
$("callGeneral").addEventListener("click", async () => {
  const card = $("general"), b = $("callGeneral");
  card.classList.add("patrol"); general.patrol = 8; b.disabled = true;
  $("generalText").textContent = "Il Generale passa casetta per casetta e controlla la catena…";
  let guard;
  if (demo) {
    await new Promise((r) => setTimeout(r, 1500));
    guard = { at: new Date().toISOString(), text: "Nella prova non riparte niente: qui avrei controllato ogni casetta e fatto ripartire quelle ferme." };
  } else {
    const r = await fetch("/guard", { method: "POST" }).catch(() => null);
    guard = (await r?.json().catch(() => null))?.guard;
  }
  card.classList.remove("patrol"); b.disabled = false;
  if (!guard) { $("generalText").textContent = "Non sono riuscito a chiamare il Generale: riprova."; return; }
  state.guard = guard; renderGeneral();
  toast(guard.done?.length ? `Il Generale ha fatto ripartire ${guard.done.length === 1 ? "un reparto" : `${guard.done.length} reparti`}` : "Il Generale: tutto in ordine");
  if (!demo) load();
});

// fai ripartire: i tasti nel riquadro rosso e nella giornata
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-op]");
  if (!b) return;
  if (demo) { toast("Nella prova non riparte niente"); return; }
  const kind = b.dataset.op, target = b.dataset.target || "";
  const what = { rerender: `il render di "${target}"`, produce: "la produzione di un video nuovo", publish: "la pubblicazione", dept: `solo ${BY_ID[target]?.name || target}` }[kind];
  if (!confirm(`Faccio ripartire ${what}?`)) return;
  b.disabled = true;
  const r = await fetch("/ops/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, target }) });
  const j = await r.json().catch(() => ({}));
  b.disabled = false;
  toast(j.how || (r.ok ? "Ripartito" : "Non sono riuscito a farlo ripartire"));
  load();
});

// un esempio da studiare: un link o un mp4 dal telefono
$("exSend").addEventListener("click", async () => {
  const link = $("exUrl").value.trim(), file = $("exFile").files[0], note = $("exNote").value.trim();
  if (!link && !file) { toast("Incolla un link o scegli un video"); return; }
  if (demo) { toast("Nella prova non si studia niente"); return; }
  const b = $("exSend"); b.disabled = true; b.textContent = file ? "Carico il video…" : "Invio…";
  let r;
  if (file) {
    if (file.size > 24e6) { toast("Il video è più grande di 24 MB: manda il link"); b.disabled = false; b.textContent = "Fallo studiare"; return; }
    r = await fetch(`/examples?note=${encodeURIComponent(note)}&name=${encodeURIComponent(file.name)}`, { method: "POST", headers: { "Content-Type": file.type || "video/mp4" }, body: file });
  } else r = await fetch("/examples", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: link, note }) });
  const j = await r.json().catch(() => ({}));
  b.disabled = false; b.textContent = "Fallo studiare";
  if (r.ok) { $("exUrl").value = ""; $("exFile").value = ""; $("exNote").value = ""; toast("In coda: la Ricerca lo studia entro un quarto d'ora"); }
  else toast(j.error || "Non sono riuscito a mandarlo");
  load();
});

// chiedi un video
$("ideaSend").addEventListener("click", async () => {
  const box = $("ideaText"), text = box.value.trim();
  if (text.length < 8) { toast("Scrivi l'idea in una frase o due"); box.focus(); return; }
  if (demo) { toast("Idea mandata (per finta: è una prova)"); return; }
  const b = $("ideaSend"); b.disabled = true;
  const r = await fetch("/idea", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  b.disabled = false;
  if (r.ok) { box.value = ""; toast("Idea mandata: la Regia comincia adesso"); }
  else toast(r.status === 400 ? "Scrivi l'idea in una frase o due" : "La Regia non è partita: riprova tra poco");
  load();
});

function toast(text) {
  const t = $("toast"); t.textContent = text; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2800);
}


// ---------------------------------------------------------------- dati veri: lettura periodica
const PAGE_VERSION = "__BUILD__";   // filled in by build.mjs: the version of this page
async function load() {
  if (demo) return;
  try {
    const r = await fetch("/state.json", { cache: "no-store" });
    if (r.status === 401) { location.reload(); return; }
    state = await r.json();
    // the Office was updated while the app stayed open (an iPhone keeps it in memory for days): load the new page once
    if (state.build && state.build !== PAGE_VERSION && !sessionStorage.getItem("reloaded-" + state.build)) {
      sessionStorage.setItem("reloaded-" + state.build, "1"); location.reload(); return;
    }
    render();
  } catch { /* rete assente: riprova al prossimo giro */ }
}
load();
setInterval(load, 6000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });


// ---------------------------------------------------------------- una giornata di prova
const DEMO_STEPS = [
  ["ricerca", "Sto guardando le 40 storie animate più viste della settimana", "Funzionano: volpi e lanterne, finali con un piccolo colpo di scena, 35-45 secondi."],
  ["soggetto", "Scelgo la storia di oggi", "\"Il guardiano del faro e la volpe\", serie Storie del faro, episodio 1."],
  ["copione", "Scrivo l'aggancio e il copione", "Aggancio: \"Every night, he left one window lit. Not for the ships.\" Otto righe, il finale sussurrato."],
  ["regia", "Disegno le sei scene nella scatola di carta", "Faro sulla scogliera, la volpe tra le dune, la tempesta, la scala, la luce che si spegne, la lanterna."],
  ["voce", "Registro il narratore riga per riga", "Intensità crescente fino alla tempesta, sussurro sull'ultima frase."],
  ["animazione", "Animo gli strati di carta su sei macchine", "Sei scene, 42 secondi, 30 fotogrammi al secondo."],
  ["musica", "Compongo il carillon e i suoni della carta", "Carillon in re minore, vento, fruscii di carta, il click della lanterna."],
  ["montaggio", "Metto insieme video, voce, musica e sottotitoli", "1080×1920, sottotitoli a tempo con le parole, −14 LUFS."],
  ["qualita", "Guardo il video come uno spettatore", "Tutto a posto: aggancio chiaro nei primi 2 secondi, nessuna parola tagliata."],
];
$("demoBtn").addEventListener("click", () => (demo ? stopDemo() : startDemo()));
function startDemo() {
  demo = { step: 0, timer: null };
  document.body.classList.add("demo");
  $("demoBtn").textContent = "Torna all'ufficio vero";
  const now = () => new Date().toISOString();
  state = { video: { title: "Il guardiano del faro e la volpe", series: "Storie del faro", started_at: now() },
    departments: Object.fromEntries(DEPTS.map((d) => [d.id, { status: "idle" }])), queue: [], calendar: [], log: [], stats: state?.stats || null, devices: state?.devices };
  state.log.push({ at: now(), dept: "ricerca", text: "La sveglia ha acceso la prima lanterna" });
  const tick = () => {
    if (!demo) return;
    const prev = DEMO_STEPS[demo.step - 1];
    if (prev) { const p = state.departments[prev[0]]; p.status = "done"; p.output = prev[2]; state.log.push({ at: now(), dept: prev[0], text: prev[2] }); }
    const cur = DEMO_STEPS[demo.step];
    if (cur) {
      state.departments[cur[0]] = { status: "working", task: cur[1], updated_at: now() };
      state.log.push({ at: now(), dept: cur[0], text: cur[1] });
      demo.step++; render(); demo.timer = setTimeout(tick, reduceMotion ? 900 : 2200);
    } else {
      state.departments.revisione = { status: "waiting", task: "Il video è pronto: guardalo e scegli", updated_at: now() };
      state.queue.push({ id: "prova", title: "Il guardiano del faro e la volpe", status: "pending", created_at: now(),
        caption: "Every night, the old lighthouse keeper left one window lit. Not for the ships. 🦊🏮\n\n#bedtimestory #papercut #animatedstory #foxtales",
        platforms: ["Instagram", "YouTube", "TikTok"] });
      state.log.push({ at: now(), dept: "revisione", text: "Il video aspetta il tuo ok" });
      render(); toast("Il video di prova aspetta il tuo ok in Da approvare");
    }
  };
  render(); tick();
}
function stopDemo() {
  clearTimeout(demo?.timer); demo = null;
  document.body.classList.remove("demo");
  $("demoBtn").textContent = "Guarda una giornata di prova";
  load();
}


// ---------------------------------------------------------------- notifiche e impostazioni
$("openSettings").addEventListener("click", () => {
  selected = null;
  const can = "serviceWorker" in navigator && "PushManager" in window;
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) && !navigator.standalone;
  lastFocus = document.activeElement;
  $("sheetBody").innerHTML = `<header><img alt="" src="${ICONS.revisione}"><div><h2 id="sheetTitle">Notifiche</h2>
      <p>${state?.devices ? `Attive su ${state.devices} ${state.devices === 1 ? "dispositivo" : "dispositivi"}` : "Non ancora attive"}</p></div>
      <button class="round" data-close aria-label="Chiudi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
    <div class="settings" style="margin-top:16px">
      <p class="note">Ti avviso quando un video aspetta il tuo ok e quando un reparto si ferma. Niente altro.</p>
      ${ios ? `<p class="note">Su iPhone le notifiche funzionano solo dall'icona sulla schermata Home: in Safari tocca Condividi, poi "Aggiungi alla schermata Home", e apri l'ufficio da lì.</p>` : ""}
      ${can ? `<button class="btn primary" id="pushOn">Attiva le notifiche su questo dispositivo</button>
        <div class="row"><button class="btn" id="pushNow">Mandami una prova adesso</button><button class="btn" id="pushLater">Prova tra 1 minuto</button></div>`
        : `<p class="note">Questo browser non supporta le notifiche.</p>`}
      <h3 style="margin-bottom:0">YouTube</h3>
      <p class="note">${state?.youtube ? `Collegato al canale ${esc(state.youtube.title)}: i video li carica l'ufficio con il tuo progetto Google.`
        : "Non collegato: accedi con l'account Google del canale Lantern Fox Tales."}</p>
      <a class="btn${state?.youtube ? "" : " primary"}" href="/youtube/connect" style="text-align:center;text-decoration:none">${state?.youtube ? "Ricollega YouTube" : "Collega YouTube"}</a>
      <a class="btn quiet" href="/esci" style="text-align:center;text-decoration:none">Esci dall'ufficio</a>
    </div>`;
  sheet.hidden = false;
  requestAnimationFrame(() => { sheet.classList.add("open"); scrim.classList.add("open"); sheet.querySelector("[data-close]")?.focus(); });
});
sheet.addEventListener("click", async (e) => {
  const id = e.target.id;
  if (id === "pushOn") {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      if ((await Notification.requestPermission()) !== "granted") { toast("Notifiche non permesse: si cambiano dalle impostazioni del browser"); return; }
      const { key } = await (await fetch("/push/key")).json();
      const raw = Uint8Array.from(atob(key.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - key.length % 4) % 4)), (c) => c.charCodeAt(0));
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: raw });
      const r = await fetch("/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      toast(r.ok ? "Notifiche attive su questo dispositivo" : "Non sono riuscito a salvare l'iscrizione");
      load();
    } catch (err) { toast("Errore: " + (err.message || err)); }
  }
  if (id === "pushNow" || id === "pushLater") {
    const r = await fetch("/push/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ minutes: id === "pushLater" ? 1 : 0 }) });
    const j = await r.json();
    toast(id === "pushLater" ? "Fra un minuto arriva: puoi spegnere lo schermo" : j.sent ? "Inviata" : "Nessun dispositivo iscritto: attiva prima le notifiche");
  }
});
