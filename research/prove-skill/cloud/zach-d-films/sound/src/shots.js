import * as THREE from 'three';
import { makeHuman } from './human.js';
import { glowSprite, sparks, rippleOverlay } from './props.js';
import { kf, lerp, smooth, easeOut, easeIn, easeInOut, range, clamp, V, cam, place, shake } from './anim.js';

export const DURATION = 26.71;

// [start, text, end?]
export const CAPTIONS = [
  [0.00, 'What if you'], [0.48, 'could see sound'], [1.20, 'for one day?'],
  [2.16, 'Some people think'], [2.96, 'the world would'], [3.68, 'turn into'], [4.16, 'a light show'],
  [5.04, 'But sound'], [5.52, 'is really'], [5.92, 'a wave of pressure'], [7.20, 'squeezing'], [7.76, 'through the air'],
  [8.48, 'So when a dog'], [9.20, 'barks'], [9.92, 'a red wave'], [10.72, 'bursts out'], [11.36, 'and passes'], [12.00, 'right through the wall'],
  [13.04, 'Your fridge sits'], [13.84, 'inside a green glow'], [15.28, 'humming'], [15.68, 'all day long'],
  [16.56, 'And a thunderclap'], [17.44, 'splits the whole sky'], [18.64, 'into giant rings'],
  [19.92, 'But the strangest'], [20.72, 'part is silence'], [22.08, 'because silence'], [22.96, 'looks like'], [23.36, 'darkness'],
  [24.16, 'What sound'], [24.64, 'would you want'], [25.20, 'to see first?', 26.51],
];
// [fadeInStart, fullStart, fullEnd, fadeOutEnd] to black, on the "But" turn
export const FADES = [[4.86, 5.0, 5.06, 5.22]];

// ---------- helpers ----------
const shadow = o => { o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...o });
const glowMat = (color, opacity = 1) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
function mesh(geo, mat, p = [0, 0, 0], r = [0, 0, 0]) { const m = new THREE.Mesh(geo, mat); m.position.set(...p); m.rotation.set(...r); return m; }
function idle(t, k = 1) { return Math.sin(t * 1.6) * 0.012 * k; }
const STAND = {
  lSh: [0.05, 0, 0.16], rSh: [0.05, 0, -0.16], lEl: [-0.25, 0, 0], rEl: [-0.25, 0, 0],
  lHip: [0, 0, 0.07], rHip: [0, 0, -0.07], lAn: [0, 0, -0.07], rAn: [0, 0, 0.07],
};
function standPose(h, t, extra = {}) {
  const p = { ...STAND, ...extra };
  p.chest = [idle(t) + (extra.chest?.[0] || 0), extra.chest?.[1] || 0, extra.chest?.[2] || 0];
  h.setPose(p);
}
// a person in a blue t-shirt
function person() {
  const h = makeHuman('plain');
  const shirt = new THREE.MeshStandardMaterial({ color: 0x2f6fd6, roughness: 0.85 });
  for (const g of [h.j.spine, h.j.chest]) { const m = g.children.find(c => c.isMesh); if (m) m.material = shirt; }
  return h;
}
// a glowing sound ring: a thin torus that expands and fades. set(r, a)
function ring(color, tube = 0.012) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, tube, 10, 96), glowMat(color));
  m.set = (r, a) => { m.scale.set(r, r, r * 0.6 + 0.4); m.material.opacity = clamp(a); m.visible = a > 0.002 && r > 0.001; };
  m.set(0, 0); return m;
}
// a glowing spherical shell that expands (seen as a soft wave front)
function shell(color) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.BackSide }));
  m.set = (r, a) => { m.scale.setScalar(Math.max(r, 0.001)); m.material.opacity = clamp(a); m.visible = a > 0.002; };
  m.set(0, 0); return m;
}
// one wave train: n rings leaving `origin` every `gap` s, speed v, life L
function waveTrain(scene, color, n, origin, { gap = 0.25, v = 1.2, L = 1.6, tube = 0.012, face = null, peak = 1 } = {}) {
  const rs = [];
  for (let i = 0; i < n; i++) { const r = ring(color, tube); r.position.copy(origin); if (face) r.lookAt(origin.clone().add(face)); scene.add(r); rs.push(r); }
  return (t) => rs.forEach((r, i) => { const it = t - i * gap; r.set(it > 0 ? 0.05 + it * v : 0, it > 0 ? peak * (1 - it / L) * Math.min(1, it * 8) : 0); });
}

// ---------- props ----------
function dog() {
  const g = new THREE.Group();
  const fur = std(0xc98a4b, { roughness: 0.9 }), dark = std(0x5a3a22, { roughness: 0.9 }), nose = std(0x1a1414, { roughness: 0.3 });
  const body = mesh(new THREE.CapsuleGeometry(0.14, 0.34, 8, 24), fur, [0, 0.42, 0], [0, 0, Math.PI / 2]); g.add(body);
  for (const [x, z] of [[0.17, 0.08], [0.17, -0.08], [-0.17, 0.08], [-0.17, -0.08]]) g.add(mesh(new THREE.CapsuleGeometry(0.045, 0.24, 6, 12), fur, [x, 0.17, z]));
  const tail = mesh(new THREE.CapsuleGeometry(0.03, 0.18, 6, 12), fur, [-0.3, 0.55, 0], [0, 0, 0.9]); g.add(tail); g.userData.tail = tail;
  const head = new THREE.Group(); head.position.set(0.3, 0.62, 0); g.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.13, 32, 20), fur));
  const snout = mesh(new THREE.CapsuleGeometry(0.065, 0.08, 6, 16), fur, [0.13, -0.03, 0], [0, 0, Math.PI / 2]); head.add(snout);
  head.add(mesh(new THREE.SphereGeometry(0.03, 16, 10), nose, [0.24, -0.01, 0]));
  const jaw = new THREE.Group(); jaw.position.set(0.06, -0.07, 0); head.add(jaw);
  jaw.add(mesh(new THREE.BoxGeometry(0.15, 0.03, 0.09), dark, [0.08, -0.01, 0]));
  for (const s of [1, -1]) {
    head.add(mesh(new THREE.SphereGeometry(0.024, 16, 10), nose, [0.09, 0.05, s * 0.07]));
    head.add(mesh(new THREE.SphereGeometry(0.008, 8, 6), std(0xffffff), [0.11, 0.058, s * 0.075]));
    head.add(mesh(new THREE.CapsuleGeometry(0.04, 0.1, 6, 12), dark, [-0.03, 0.06, s * 0.12], [s * 0.5, 0, -0.3]));
  }
  g.userData.head = head; g.userData.jaw = jaw;
  return shadow(g);
}
function wall(w = 0.12, h = 2.2, d = 3) {
  const m = mesh(new THREE.BoxGeometry(w, h, d), std(0xe8dcc6, { roughness: 0.9 }), [0, h / 2, 0]);
  return shadow(m);
}
function fridge() {
  const g = new THREE.Group();
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf1f3f5, roughness: 0.25, clearcoat: 0.6 }), metal = std(0x9aa0a8, { metalness: 0.9, roughness: 0.3 });
  const geo = new THREE.BoxGeometry(0.7, 1.8, 0.66);
  g.add(mesh(geo, white, [0, 0.9, 0]));
  g.add(mesh(new THREE.BoxGeometry(0.705, 0.012, 0.67), std(0x8a9098), [0, 1.22, 0.001]));
  g.add(mesh(new THREE.BoxGeometry(0.03, 0.35, 0.04), metal, [0.28, 1.45, 0.35]));
  g.add(mesh(new THREE.BoxGeometry(0.03, 0.55, 0.04), metal, [0.28, 0.85, 0.35]));
  return shadow(g);
}
function boltMesh(seed = 3) {
  const pts = []; let x = 0, y = 0; let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 12; i++) { pts.push(V(x, y, 0)); x += (r() - 0.5) * 1.4; y -= 1.0 + r() * 0.6; }
  const g = new THREE.Group(); const mat = glowMat(0xfff6d0);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = a.distanceTo(b);
    const c = mesh(new THREE.CylinderGeometry(0.09, 0.09, L, 8), mat); c.position.copy(a).add(b).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); g.add(c);
  }
  return g;
}
function setSky(scene, top, mid, hor, flo) {
  const u = scene.userData.sky.material.uniforms;
  u.top.value.set(top); u.mid.value.set(mid); u.horizon.value.set(hor); u.floorC.value.set(flo);
}
const lerpColor = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);

// ============ SHOT 1: hook, a man sees sound for the first time ============
function shot1({ makeStage }) {
  const scene = makeStage({ shadowSize: 2.5 });
  const man = person(); man.root.rotation.y = 0.25; scene.add(man.root);
  const head = V(0.04, 1.62, 0.05);
  const trains = [
    waveTrain(scene, 0xff3b5c, 5, V(-0.9, 1.5, -1.2), { gap: 0.35, v: 0.9, L: 1.8 }),
    waveTrain(scene, 0x35d6ff, 5, V(1.0, 1.9, -1.5), { gap: 0.3, v: 1.0, L: 1.6 }),
    waveTrain(scene, 0x7dff6a, 4, V(0.7, 1.0, -0.8), { gap: 0.4, v: 0.7, L: 1.6 }),
  ];
  const c = cam(36);
  return {
    scene, camera: c,
    update(t) {
      const look = kf(t, [[0, -0.5], [0.9, 0.4], [1.6, -0.2]]);
      standPose(man, t, { neck: [-0.08, look * 0.5, 0], head: [-0.12, look * 0.4, 0], lSh: [-0.2, 0, 0.5], rSh: [-0.2, 0, -0.5], lEl: [-1.1, 0, 0], rEl: [-1.1, 0, 0] });
      man.setMouth(smooth(range(t, 0.4, 0.8)) * 0.7);
      trains.forEach(f => f(t + 0.6));
      const k = easeInOut(range(t, 0, 2.2)); const s = shake(t, 0.8);
      place(c, [lerp(0.25, 0.12, k) + s[0], lerp(1.55, 1.6, k) + s[1], lerp(2.2, 1.35, k)], [head.x, head.y - 0.12, head.z]);
      return { dof: { focus: c.position.distanceTo(head), aperture: 0.004, maxblur: 0.01 }, bloom: 0.9 };
    },
  };
}

// ============ SHOT 2: the "light show" people imagine ============
function shot2({ makeStage }) {
  const scene = makeStage({ shadowSize: 3 });
  const man = person(); scene.add(man.root);
  const cols = [0xff3b5c, 0x35d6ff, 0x7dff6a, 0xffd23a, 0xc06bff, 0xff8a3a];
  const orbs = [];
  let s = 11; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 40; i++) {
    const col = cols[i % cols.length];
    const o = mesh(new THREE.SphereGeometry(0.035 + r() * 0.03, 16, 10), glowMat(col, 0.9));
    const gl = glowSprite(col, 0.25); o.add(gl);
    o.userData = { a: r() * Math.PI * 2, rad: 0.6 + r() * 1.3, y: 0.3 + r() * 2.0, sp: 0.2 + r() * 0.5, ph: r() * 6 };
    scene.add(o); orbs.push(o);
  }
  const c = cam(40);
  return {
    scene, camera: c,
    update(t) {
      standPose(man, t, { neck: [-0.15, Math.sin(t * 1.2) * 0.3, 0], head: [-0.15, Math.sin(t * 1.2) * 0.2, 0], lSh: [0, 0, 0.9], rSh: [0, 0, -0.9], lEl: [-0.6, 0, 0], rEl: [-0.6, 0, 0] });
      man.setMouth(0.5);
      for (const o of orbs) { const d = o.userData; const a = d.a + t * d.sp; o.position.set(Math.cos(a) * d.rad, d.y + Math.sin(t * 2 + d.ph) * 0.08, Math.sin(a) * d.rad); }
      const a = -0.35 + t * 0.12;
      place(c, [Math.sin(a) * 3.6, 1.35, Math.cos(a) * 3.6], [0, 1.15, 0]);
      return { dof: { focus: 3.6, aperture: 0.003, maxblur: 0.01 }, bloom: 1.0 };
    },
  };
}

// ============ SHOT 3: the mechanism, a pressure wave squeezing the air ============
function shot3({ makeStage }) {
  const scene = makeStage({ shadowSize: 2 });
  // speaker on a stand at the left
  const spk = new THREE.Group(); spk.position.set(-1.25, 1.2, 0); scene.add(spk);
  spk.add(mesh(new THREE.BoxGeometry(0.4, 0.6, 0.5), std(0x24262b, { roughness: 0.4 }), [-0.12, 0, 0]));
  const cone = mesh(new THREE.CylinderGeometry(0.2, 0.08, 0.06, 40), std(0x3a3d44, { roughness: 0.6 }), [0.1, 0, 0], [0, 0, -Math.PI / 2]); spk.add(cone);
  spk.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 12), std(0x777b82, { metalness: 0.8, roughness: 0.3 }), [-0.12, -0.7, 0]));
  shadow(spk);
  // a lattice of air molecules
  const N = [28, 7, 5], dots = [];
  const geo = new THREE.SphereGeometry(0.022, 12, 8);
  const blue = new THREE.MeshStandardMaterial({ color: 0x9fd4ff, roughness: 0.3, emissive: 0x1a4a80, emissiveIntensity: 0.4 });
  const im = new THREE.InstancedMesh(geo, blue, N[0] * N[1] * N[2]); im.castShadow = true; scene.add(im);
  const red = new THREE.Color(0xff3040), cool = new THREE.Color(0x9fd4ff), tmpC = new THREE.Color();
  for (let i = 0; i < N[0]; i++) for (let j = 0; j < N[1]; j++) for (let k = 0; k < N[2]; k++) dots.push([-0.95 + i * 0.09, 0.93 + j * 0.09, -0.18 + k * 0.09]);
  const m4 = new THREE.Matrix4();
  const c = cam(34);
  return {
    scene, camera: c,
    update(t) {
      const lam = 0.75, w = 2 * Math.PI * 1.1;
      cone.position.x = 0.1 + Math.sin(w * t) * 0.025;
      dots.forEach((p, n) => {
        const ph = (2 * Math.PI / lam) * (p[0] + 0.95) - w * t;
        const front = clamp((t * 0.8 - (p[0] + 0.95)) * 6);     // the wave hasn't reached far dots yet
        const dx = -Math.sin(ph) * 0.04 * front;
        const dens = Math.cos(ph) * front;                     // >0 squeezed
        m4.makeTranslation(p[0] + dx, p[1], p[2]); im.setMatrixAt(n, m4);
        tmpC.copy(cool).lerp(red, clamp(dens)); im.setColorAt(n, tmpC);
      });
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
      const k = easeInOut(range(t, 0, 3.4));
      const s = shake(t, 0.4);
      place(c, [lerp(-0.6, 0.35, k) + s[0], lerp(1.55, 1.42, k) + s[1], lerp(2.0, 2.35, k)], [lerp(-0.6, 0.15, k), 1.2, 0]);
      return { dof: { focus: c.position.distanceTo(V(lerp(-0.6, 0.15, k), 1.2, 0)), aperture: 0.004, maxblur: 0.008 }, bloom: 0.5 };
    },
  };
}

// ============ SHOT 4: a dog barks, a red wave passes through the wall ============
function shot4({ makeStage }) {
  const scene = makeStage({ shadowSize: 3, sunDir: [-2, 6, 5] });
  const d = dog(); d.position.set(-1.1, 0, 0.1); scene.add(d);
  const wl = wall(); wl.position.x = 0.15; scene.add(wl);
  const rip = rippleOverlay(wl);
  const man = person(); man.root.position.set(0.95, 0, 0.2); man.root.rotation.y = 0.5; scene.add(man.root);
  const mouth = V(-0.62, 0.6, 0.1);
  const rings = [], shells = [];
  for (let i = 0; i < 3; i++) { const r = ring(0xff2a3a, 0.03); r.position.copy(mouth); r.lookAt(V(-1.9, 1.2, 2.6)); scene.add(r); rings.push(r); const sh = shell(0xff2a3a); sh.position.copy(mouth); scene.add(sh); shells.push(sh); }
  const BARK = [0.72, 1.45, 2.2];
  const v = 0.75;
  const c = cam(38);
  return {
    scene, camera: c,
    update(t) {
      // barks
      let open = 0; for (const b of BARK) open = Math.max(open, Math.exp(-((t - b) ** 2) / 0.012));
      d.userData.jaw.rotation.z = -open * 0.6; d.userData.head.rotation.z = open * 0.18;
      d.userData.tail.rotation.z = 0.9 + Math.sin(t * 14) * 0.3;
      d.position.y = Math.max(0, open * 0.03);
      BARK.forEach((b, i) => { const it = t - b; const R = it > 0 ? 0.05 + it * v : 0; const a = it > 0 ? Math.min(1, it * 6) * (1 - it / 3.4) : 0; rings[i].set(R, a * 1.4); shells[i].set(R, a * 0.3); });
      // ripple where the first wave front meets the wall
      const it = t - BARK[0] - (0.77 / v); const u = rip.material.uniforms;
      u.uCenter.value.set(-0.06, mouth.y - 1.1, mouth.z); u.uAmp.value = it > 0 ? Math.min(1, it * 5) * (1 - 0.6 * smooth(range(it, 0.8, 2.5))) : 0;
      u.uRadius.value = it > 0 ? 0.1 + it * v * 0.9 : 0; u.uSpot.value = 0.12; u.uSpotAmp.value = 0.8; u.uRings.value = 40; u.uTime.value = t;
      // man on the other side turns his head when it reaches him
      const hear = smooth(range(t, 2.6, 3.1));
      standPose(man, t, { neck: [0, hear * 0.6, 0], head: [-0.05 * hear, hear * 0.3, 0], lSh: [-0.3 * hear, 0, 0.16 + 0.5 * hear], rSh: [-0.3 * hear, 0, -0.16 - 0.5 * hear] });
      man.setMouth(hear * 0.5);
      const k = easeInOut(range(t, 0, 4.4)); const s = shake(t, 0.5);
      if (t < 3.3) place(c, [lerp(-1.5, -2.1, k) + s[0], lerp(0.85, 1.35, k) + s[1], lerp(1.4, 2.9, k)], [lerp(-0.8, 0.25, k), lerp(0.6, 0.8, k), 0]);
      else { const k2 = easeOut(range(t, 3.3, 4.6)); place(c, [lerp(1.9, 1.7, k2) + s[0], lerp(1.4, 1.5, k2) + s[1], lerp(3.0, 3.4, k2)], [0.55, 1.05, 0]); }
      return { dof: { focus: c.position.distanceTo(V(-0.3, 0.7, 0)), aperture: 0.002, maxblur: 0.008 }, bloom: 0.9 };
    },
  };
}

// ============ SHOT 5: the fridge hums inside a green glow ============
function shot5({ makeStage }) {
  const scene = makeStage({ shadowSize: 2.5 });
  const f = fridge(); scene.add(f);
  const glowShells = [];
  for (let i = 0; i < 3; i++) {
    const m = mesh(new THREE.BoxGeometry(0.7, 1.8, 0.66), new THREE.MeshBasicMaterial({ color: 0x2cff3c, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }), [0, 0.9, 0]);
    scene.add(m); glowShells.push(m);
  }
  const halo = glowSprite(0x2cff3c, 2.4); halo.position.set(0, 0.95, -0.2); scene.add(halo);
  const lightG = new THREE.PointLight(0x2cff3c, 1.5, 3); lightG.position.set(0, 1.0, 0.6); scene.add(lightG);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t) {
      const hum = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 2.2);
      glowShells.forEach((m, i) => { const ph = ((t * 0.6 + i / 3) % 1); const s = 1.03 + ph * 0.35; m.scale.set(s, 1 + ph * 0.12, s); m.material.opacity = (1 - ph) * 0.2 * (0.7 + 0.3 * hum); });
      halo.material.opacity = 0.16 + 0.06 * hum; lightG.intensity = 0.6 + hum * 0.4;
      f.position.x = Math.sin(t * 90) * 0.0015;
      const k = easeInOut(range(t, 0, 3.5)); const s = shake(t, 0.5);
      place(c, [lerp(1.6, 1.0, k) + s[0], lerp(1.2, 1.4, k) + s[1], lerp(3.8, 3.1, k)], [0, 1.0, 0]);
      return { dof: { focus: c.position.distanceTo(V(0, 1, 0.3)), aperture: 0.003, maxblur: 0.008 }, bloom: 0.6 };
    },
  };
}

// ============ SHOT 6: a thunderclap splits the sky into rings ============
function shot6({ makeStage }) {
  const scene = makeStage({ shadowSize: 3, sun: 1.2 });
  setSky(scene, 0x232a3e, 0x3c4660, 0x6a7590, 0x4a5268);
  const man = person(); man.root.position.set(0, 0, 0); man.root.rotation.y = Math.PI + 0.3; scene.add(man.root);
  const bolt = boltMesh(5); bolt.position.set(1.5, 14, -14); bolt.scale.setScalar(1.1); scene.add(bolt);
  const center = V(1.5, 8, -14);
  const rings = []; for (let i = 0; i < 6; i++) { const r = ring(i % 2 ? 0xfff0b0 : 0x9fd8ff, 0.03); r.position.copy(center); r.lookAt(V(0, 1.6, 2.5)); scene.add(r); rings.push(r); }
  const flashL = new THREE.PointLight(0xdfe8ff, 0, 60); flashL.position.set(1, 10, -6); scene.add(flashL);
  const T0 = 0.2;
  const c = cam(44);
  return {
    scene, camera: c,
    update(t) {
      const it = t - T0;
      const fl = it > 0 ? Math.exp(-it * 5) : 0;
      bolt.visible = it > 0 && it < 0.5 && (it < 0.12 || it > 0.2);
      rings.forEach((r, i) => { const rt = it - i * 0.32; r.set(rt > 0 ? 0.5 + rt * 7 : 0, rt > 0 ? Math.min(1, rt * 5) * (1 - rt / 3.2) : 0); });
      flashL.intensity = fl * 60;
      const u = scene.userData.sky.material.uniforms;
      u.top.value.copy(lerpColor(0x232a3e, 0x9aa8d0, fl)); u.mid.value.copy(lerpColor(0x3c4660, 0xc0cbe8, fl));
      standPose(man, t, { neck: [-0.35, 0, 0], head: [-0.3, 0, 0], lSh: [0, 0, 0.35 + 0.5 * smooth(range(it, 0, 0.3))], rSh: [0, 0, -0.35 - 0.5 * smooth(range(it, 0, 0.3))] });
      man.setMouth(smooth(range(it, 0.05, 0.3)) * 0.8);
      const s = shake(t * 3, 1 + 6 * fl);
      const k = easeOut(range(t, 0, 3.3));
      place(c, [0.3 + s[0], lerp(1.0, 0.8, k) + s[1], lerp(3.0, 3.5, k)], [0.7, lerp(3.2, 4.2, k), -8]);
      return { dof: { focus: 3, aperture: 0.0008, maxblur: 0.006 }, bloom: 1.2, exposure: 0.9 + fl * 0.8 };
    },
  };
}

// ============ SHOT 7: silence looks like darkness ============
function shot7({ makeStage }) {
  const scene = makeStage({ shadowSize: 2.5 });
  const man = person(); man.root.rotation.y = -0.2; scene.add(man.root);
  const trains = [
    waveTrain(scene, 0xff3b5c, 6, V(-1.0, 1.4, -1.0), { gap: 0.4, v: 0.8, L: 1.8 }),
    waveTrain(scene, 0x35d6ff, 6, V(1.1, 1.8, -1.4), { gap: 0.45, v: 0.9, L: 1.7 }),
    waveTrain(scene, 0x7dff6a, 5, V(0.8, 0.8, -0.6), { gap: 0.5, v: 0.6, L: 1.6 }),
  ];
  const face = new THREE.PointLight(0xbfd0ff, 0, 2.5); face.position.set(0.3, 1.8, 1.2); scene.add(face);
  const head = V(-0.02, 1.62, 0.05);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t) {
      const dark = smooth(range(t, 1.0, 3.6));
      trains.forEach(f => f(t + 1));
      scene.traverse(o => { if (o.isMesh && o.material.blending === THREE.AdditiveBlending) o.material.opacity *= (1 - dark); });
      const u = scene.userData.sky.material.uniforms;
      u.top.value.copy(lerpColor(0x2b78d6, 0x000000, dark)); u.mid.value.copy(lerpColor(0x5b9fea, 0x000000, dark));
      u.horizon.value.copy(lerpColor(0x92c3f2, 0x020306, dark)); u.floorC.value.copy(lerpColor(0xa9cdf1, 0x020306, dark));
      scene.userData.key.intensity = 2.3 * (1 - dark * 0.97);
      scene.environmentIntensity = 1 - dark * 0.95;
      face.intensity = dark * 1.2;
      standPose(man, t, { neck: [0, kf(t, [[0, 0.3], [1.5, -0.3], [3, 0]]), 0], head: [0.05 * dark, 0, 0] });
      man.setMouth(0.15 + 0.3 * dark);
      const k = easeInOut(range(t, 0, 4.2)); const s = shake(t, 0.4);
      place(c, [lerp(0.6, 0.15, k) + s[0], lerp(1.5, 1.6, k) + s[1], lerp(2.4, 1.0, k)], [head.x, head.y - 0.1, head.z]);
      return { dof: { focus: c.position.distanceTo(head), aperture: 0.004, maxblur: 0.01 }, bloom: 0.8, exposure: 1 - dark * 0.45 };
    },
  };
}

// ============ SHOT 8: which sound would you see first? ============
function shot8({ makeStage }) {
  const scene = makeStage({ shadowSize: 2.5 });
  const man = person(); scene.add(man.root);
  const head = V(0, 1.62, 0.05);
  const cols = [0xff3b5c, 0x35d6ff, 0x7dff6a, 0xffd23a];
  const trains = cols.map((col, i) => waveTrain(scene, col, 3, V([-0.8, 0.8, -0.6, 0.7][i], [1.3, 1.9, 2.1, 1.0][i], -1.0), { gap: 0.5, v: 0.6, L: 1.8, peak: 0.8 }));
  const c = cam(34);
  return {
    scene, camera: c,
    update(t) {
      trains.forEach((f, i) => f(t - 0.3 - i * 0.25));
      standPose(man, t, { neck: [0, 0, 0.08], head: [-0.03, 0, 0.1], lSh: [-0.5, 0, 0.3], lEl: [-1.3, 0, 0] });
      man.setMouth(t > 0.1 && t < 1.6 ? 0.25 + 0.2 * Math.sin(t * 14) : 0.1);
      const k = easeOut(range(t, 0, 2.6)); const s = shake(t, 0.4);
      place(c, [s[0], 1.58 + s[1], lerp(1.7, 1.2, k)], [head.x, head.y - 0.12, head.z]);
      return { dof: { focus: c.position.distanceTo(head), aperture: 0.004, maxblur: 0.01 }, bloom: 0.9 };
    },
  };
}

export const SHOTS = [
  { start: 0.0, end: 2.16, build: shot1 },
  { start: 2.16, end: 5.04, build: shot2 },
  { start: 5.04, end: 8.48, build: shot3 },
  { start: 8.48, end: 13.04, build: shot4 },
  { start: 13.04, end: 16.56, build: shot5 },
  { start: 16.56, end: 19.92, build: shot6 },
  { start: 19.92, end: 24.16, build: shot7 },
  { start: 24.16, end: DURATION + 1, build: shot8 },
];
