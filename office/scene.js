
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

// sentiero: sassi di carta che uniscono i reparti nell'ordine del video
{
  const curve = new THREE.CatmullRomCurve3(DEPTS.map((d) => new THREE.Vector3(d.at[0] + 0.4, 0.36, d.at[1] + 1.9)));
  const n = 90;
  const stone = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12);
  const mat = paper(0x6a86c2);
  const stones = new THREE.InstancedMesh(stone, mat, n);
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) { const p = curve.getPoint(i / (n - 1)); m.makeTranslation(p.x, p.y, p.z); stones.setMatrixAt(i, m); }
  scene.add(stones);
}

// alberi di carta sparsi (diventano trasparenti quando si entra in una casetta)
const treeMats = [];
{
  const treeGeo = new THREE.ConeGeometry(0.8, 2.2, 5); treeGeo.translate(0, 1.45, 0);
  const trunkGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2); trunkGeo.translate(0, 0.45, 0);
  const spots = [[-13, -8.5], [-12.6, 3.8], [-12, 8.4], [-2, 2.6], [3.4, 2.4], [12.6, -7.8], [12.8, 0.6], [12.4, 8.2], [-1.6, -9.4], [8.6, -9.2], [2.4, 9], [-9.6, 8.6]];
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
  g.rotation.y = d.big ? 0 : (i % 2 ? -0.12 : 0.1);
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
for (const d of DEPTS) {
  const b = document.createElement("button");
  b.className = "tag"; b.type = "button"; b.dataset.status = "idle"; b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<span class="st"></span><span>${esc(d.name)}</span>`;
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
  const half = Math.max(12.5, 13.5 / aspect);
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
  renderer.render(scene, camera);
  placeLabels();
}
controls.addEventListener("start", () => { flight = null; $("hint").hidden = true; });
loop();


// ---------------------------------------------------------------- il pannello

const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : "";
const fmtDay = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });

function render() {
  if (!state) return;
  const deps = state.departments || {};
  for (const d of DEPTS) {
    const s = (deps[d.id] || {}).status || "idle";
    setHouse(d.id, s);
    tags[d.id].dataset.status = s;
  }
  const working = DEPTS.filter((d) => (deps[d.id] || {}).status === "working");
  const waiting = DEPTS.filter((d) => (deps[d.id] || {}).status === "waiting");
  const head = $("headline");
  if (waiting.length) head.textContent = `${waiting[0].name} aspetta te.`;
  else if (working.length) head.textContent = `${working.map((d) => d.who.split(",")[0]).join(" e ")} ${working.length > 1 ? "sono" : "è"} al lavoro.`;
  else if (state.video) head.textContent = "Tutte le lanterne di oggi sono accese.";
  else head.textContent = "Il villaggio dorme: nessuna storia in lavorazione.";

  $("videoTitle").textContent = state.video ? state.video.title : "Nessuna storia oggi, per ora";
  $("videoLead").textContent = state.video
    ? (state.video.series ? `Serie: ${state.video.series}. ` : "") + `Iniziata alle ${fmtTime(state.video.started_at)}.`
    : "Ogni mattina la sveglia accende la prima lanterna e la storia passa di reparto in reparto fino alla tua scrivania.";

  $("string").innerHTML = DEPTS.map((d) => {
    const s = (deps[d.id] || {}).status || "idle";
    return `<li data-status="${s}"><button type="button" data-dept="${d.id}" aria-label="${esc(d.name)}: ${STATUS_TEXT[s]}"><span class="lantern"><i></i></span>${esc(d.name)}</button></li>`;
  }).join("");

  const log = (state.log || []).slice(-25).reverse();
  $("diary").innerHTML = log.length ? log.map((l) => `<li><time>${fmtTime(l.at)}</time><img alt="" src="${ICONS[l.dept] || ICONS.regia}"><span>${esc(l.text)}</span></li>`).join("")
    : `<li class="empty" style="display:block"><strong>Il diario è vuoto</strong>Qui ogni reparto scrive cosa ha fatto, con l'ora.</li>`;

  const pending = (state.queue || []).filter((q) => q.status === "pending");
  const count = $("queueCount");
  count.hidden = !pending.length; count.textContent = pending.length;
  const queue = [...(state.queue || [])].reverse();
  $("queue").innerHTML = queue.length ? queue.map(reviewCard).join("")
    : `<div class="empty"><strong>Nessun video aspetta il tuo ok</strong>Quando una storia è pronta ti arriva una notifica sul telefono e la trovi qui.</div>`;

  renderDays();
  renderStats();
  $("bellDot").hidden = Boolean(state.devices);
  if (selected) fillSheet(selected);
}

function reviewCard(q) {
  const media = q.preview_url
    ? `<video src="${esc(q.preview_url)}" ${q.cover_url ? `poster="${esc(q.cover_url)}"` : ""} controls playsinline preload="metadata"></video>`
    : `<div class="ph">L'anteprima arriva con il primo video vero</div>`;
  const plats = (q.platforms || ["Instagram", "YouTube", "TikTok"]).map((p) => `<li>${esc(p)}</li>`).join("");
  const actions = q.status === "pending"
    ? `<label for="note-${esc(q.id)}" class="note">Se va rifatto, cosa cambiare</label>
       <textarea id="note-${esc(q.id)}" placeholder="Per esempio: la voce più lenta nel finale"></textarea>
       <div class="row"><button class="btn primary" data-approve="${esc(q.id)}">Pubblica</button><button class="btn" data-redo="${esc(q.id)}">Rifai</button></div>`
    : `<p class="decided">${q.status === "approved" ? "Approvato" : "Rimandato al Copione"} alle ${fmtTime(q.decided_at)}${q.note ? `: ${esc(q.note)}` : ""}</p>`;
  return `<article class="review"><div>${media}</div><div><h4>${esc(q.title)}</h4><ul class="chips">${plats}</ul>
    <p class="cap">${esc(q.caption || "")}</p>${actions}</div></article>`;
}

function renderDays() {
  const today = new Date().toISOString().slice(0, 10);
  const map = Object.fromEntries((state.calendar || []).map((c) => [c.date, c]));
  const out = [];
  for (let i = -3; i < 11; i++) {
    const date = new Date(Date.now() + i * 864e5).toISOString().slice(0, 10);
    const c = map[date];
    const st = c ? c.status : (i < 0 ? "skipped" : "planned");
    const label = { planned: "In programma", made: "Fatto", published: "Pubblicato", skipped: "Nessun video" }[st] || st;
    out.push(`<li class="${date === today ? "today" : ""}"><span class="d">${fmtDay(date)}<small>${date === today ? "oggi" : ""}</small></span>
      <span>${c ? esc(c.title) : `<span class="note">${i < 0 ? "—" : "Il Soggetto lo sceglie la mattina stessa"}</span>`}</span><span class="pill ${st}">${label}</span></li>`);
  }
  $("days").innerHTML = out.join("");
}

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
    <p class="note" style="margin-top:12px">Aggiornate alle ${fmtTime(s.updated_at)}.</p>`;
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
      ${info.output ? `<p class="out">${esc(info.output)}</p>` : ""}${info.updated_at ? `<p class="note" style="margin-top:6px">Aggiornato alle ${fmtTime(info.updated_at)}</p>` : ""}</div>
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
const tabNames = ["oggi", "approva", "calendario", "numeri"];
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
  const b = e.target.closest("[data-approve],[data-redo]");
  if (!b) return;
  const id = b.dataset.approve || b.dataset.redo;
  const decision = b.dataset.approve ? "approved" : "redo";
  const note = document.getElementById("note-" + id)?.value || "";
  if (decision === "redo" && !note.trim()) { toast("Scrivi cosa cambiare, così il Copione sa da dove ripartire"); document.getElementById("note-" + id)?.focus(); return; }
  if (demo) { const q = state.queue.find((x) => x.id === id); Object.assign(q, { status: decision, note, decided_at: new Date().toISOString() }); render(); toast(decision === "approved" ? "Pubblicato (per finta: è una prova)" : "Rimandato al Copione (per finta)"); return; }
  b.disabled = true;
  const r = await fetch("/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decision, note }) });
  b.disabled = false;
  if (!r.ok) { toast("Non sono riuscito a salvare la scelta: riprova"); return; }
  toast(decision === "approved" ? "Approvato: la Pubblicazione è avvisata" : "Rimandato al Copione con la tua nota");
  load();
});

function toast(text) {
  const t = $("toast"); t.textContent = text; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 2800);
}


// ---------------------------------------------------------------- dati veri: lettura periodica
async function load() {
  if (demo) return;
  try {
    const r = await fetch("/state.json", { cache: "no-store" });
    if (r.status === 401) { location.reload(); return; }
    state = await r.json();
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
  ["animazione", "Animo gli strati di carta", "Sei scene, 42 secondi, 30 fotogrammi al secondo."],
  ["voce", "Registro il narratore riga per riga", "Intensità crescente fino alla tempesta, sussurro sull'ultima frase."],
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
