// Lantern Fox kit: a shot described as data. The Regia department writes specs, not engines.
//
// layered(E, spec) → { S, update(t), post(t), grade(t) }   (t is shot time, seconds)
// spec = {
//   light: [x, y, z], lightR, lightCol, key, amb, ambCol, keyCol,      backlight point and lamps (stage())
//   sky: { stops: [[0,'#0a1330'], …], stars, gain },                   unlit back panel
//   moon: { x, y, z, r, gain, halo, haloGain },
//   layers: [{ name, z, trans, draw(x,k), glowDraw(g), glow, glowCol, w, h, x, y, ax, ay, shadow, recv, finish }],
//   on: { at, stagger } | false,       the lamp turns on: sky, moon, then each layer's backlight, then the glows
//   glows: { name: [[t, v], …] },      keyframes for a layer's glow (0 = off, 1 = on), e.g. a window going dark
//   flicker: ['name', …],              candle flicker on those glows
//   move: { name: [[t, [dx, dy, rot]], …] }, scroll: { name: [vx, vy] },
//   cam: [[t, [px, py, pz, tx, ty, tz]], …], fov,  focus: z | [[t, z], …], aper, maxCoc, bloom,
//   grade: {…} | (t) => ({…}),  flash: [t, …] (lightning),  update(t, L, S) for anything else
// }
import * as THREE from 'three';
import { sheet, skyPanel, moon, setMoon } from '../paper.js';
import { stage, aim } from '../stage.js';
import { seg, ss, track, monotone, clamp } from '../lib.js';
import { FULL } from './motifs.js';

// Default camera: close enough that the 0.33 × 0.58 m sheets fill the 9:16 frame even at the back of the box (z −0.14).
// Keep pz ≤ 0.82 in camera moves, or the edges of the sheets come into view.
export const CAM0 = [0, 0, .8, 0, 0, -.07];

export async function layered(E, spec) {
  const S = stage({ light: spec.light || [0, .1, -.13], lightR: spec.lightR ?? .2, lightCol: spec.lightCol || '#ffe2ae',
    key: spec.key ?? 1.0, amb: spec.amb ?? .3, ambCol: spec.ambCol || '#7d90c8', keyCol: spec.keyCol || '#d6dcff',
    keyPos: spec.keyPos || [0, .32, .06], keyTarget: spec.keyTarget || [0, -.08, -.1], keyAngle: spec.keyAngle ?? 1.1, fov: spec.fov ?? 34 });
  S.cam.aspect = E.aspect; S.cam.fov = spec.fov ?? 34; S.cam.near = .01; S.cam.updateProjectionMatrix();
  const { U } = S, L = {};
  const sky = spec.sky ? S.add(skyPanel({ w: .5, h: .8, z: -.145, stops: spec.sky.stops, stars: spec.sky.stars ?? 0, starMinY: spec.sky.starMinY ?? -.05, gain: spec.sky.gain ?? 1 })) : null;
  const mn = spec.moon ? S.add(moon({ x: spec.moon.x, y: spec.moon.y, z: spec.moon.z ?? -.135, r: spec.moon.r ?? .03, gain: spec.moon.gain ?? 1.7, halo: spec.moon.halo ?? 4.5, haloGain: spec.moon.haloGain ?? .32 })) : null;
  const order = [];
  for (const o of spec.layers) {
    const m = S.add(sheet({ U, w: o.w ?? FULL.w, h: o.h ?? FULL.h, x: o.x, y: o.y, z: o.z, ax: o.ax, ay: o.ay, trans: o.trans ?? .3,
      glow: o.glow ?? (o.glowDraw ? 1.8 : 0), glowCol: o.glowCol || '#ffb862', draw: o.draw, glowDraw: o.glowDraw,
      shadow: o.shadow, recv: o.recv, finish: o.finish }));
    m.userData.trans0 = o.trans ?? .3; m.userData.p0 = m.position.clone();
    L[o.name || `l${order.length}`] = m; order.push(m);
  }
  // Light beams (a lighthouse, a torch): additive cones, analytic falloff, no texture edges
  const beams = (spec.beams || []).map(b => {
    const len = b.len ?? .5, wid = b.width ?? .1;
    const geo = new THREE.PlaneGeometry(len, wid * 2.2); geo.translate(len / 2, 0, 0);
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: { col: { value: new THREE.Color(b.col || '#ffd9a0') }, k: { value: 0 }, spread: { value: wid / len } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `varying vec2 vUv; uniform vec3 col; uniform float k, spread;
        void main(){ float u = vUv.x; float v = (vUv.y - .5) * 2.2 / (u * 2. + .04);
          float a = pow(1. - u, 1.6) * exp(-v * v * 2.5) * smoothstep(0., .03, u);
          gl_FragColor = vec4(col * a * k, 1.); }`,
    }));
    m.position.set(b.x, b.y, b.z ?? -.06); m.renderOrder = 10; S.scene.add(m);
    return { m, b };
  });
  const glowK = Object.fromEntries(Object.entries(spec.glows || {}).map(([k, keys]) => [k, monotone(keys)]));
  const moveK = Object.fromEntries(Object.entries(spec.move || {}).map(([k, keys]) => [k, track(keys)]));
  const camK = spec.cam ? track(spec.cam) : () => CAM0;
  const focusK = Array.isArray(spec.focus) ? monotone(spec.focus) : () => spec.focus ?? -.06;
  const on = spec.on === false ? null : { at: 0, stagger: .32, ...(spec.on || {}) };
  let flash = 0;

  return {
    S, L,
    update(t) {
      const lit = on ? ss(seg(t, on.at + .2, on.at + 2.2)) : 1;
      if (sky) sky.material.color.setScalar(sky.userData.base * (on ? .04 + .96 * ss(seg(t, on.at, on.at + 2)) : 1));
      if (mn) setMoon(mn, lit);
      order.forEach((m, i) => {
        const u = m.material.userData.u;
        u.uTrans.value = m.userData.trans0 * (on ? ss(seg(t, on.at + .5 + i * on.stagger, on.at + 2.4 + i * on.stagger)) : 1);
      });
      for (const [name, m] of Object.entries(L)) {
        const u = m.material.userData.u;
        let gk = glowK[name] ? clamp(glowK[name](t)) : on ? ss(seg(t, on.at + 2.2 + order.length * on.stagger * .5, on.at + 3.6 + order.length * on.stagger * .5)) : 1;
        if (spec.flicker?.includes(name)) gk *= 1 + .07 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
        u.uGlowLit.value = gk;
        if (moveK[name]) { const [dx, dy, rot] = moveK[name](t); m.position.x = m.userData.p0.x + dx; m.position.y = m.userData.p0.y + dy; m.rotation.z = rot || 0; }
        if (spec.scroll?.[name]) { const [vx, vy] = spec.scroll[name], h = spec.layers.find(o => o.name === name).h ?? FULL.h;
          m.position.x = m.userData.p0.x + vx * t; m.position.y = m.userData.p0.y + ((vy * t) % (h / 2)); }
      }
      flash = 0;
      for (const tf of spec.flash || []) if (t >= tf) flash = Math.max(flash, Math.exp(-(t - tf) * 7) + .5 * Math.exp(-Math.max(0, t - tf - .12) * 9) * (t > tf + .12 ? 1 : 0));
      S.key.intensity = S.base.key * (on ? ss(seg(t, on.at + 1.2, on.at + 3)) : 1) * (1 + 3 * flash);
      S.amb.intensity = S.base.amb * (on ? ss(seg(t, on.at + .6, on.at + 2.6)) : 1) * (1 + 2 * flash);
      for (const { m, b } of beams) {
        m.rotation.z = typeof b.rot === 'function' ? b.rot(t) : (b.rot ?? 0);
        m.material.uniforms.k.value = (typeof b.k === 'function' ? b.k(t) : (b.k ?? 1)) * (on ? ss(seg(t, on.at + 2.4, on.at + 3.6)) : 1);
      }
      aim(S.cam, camK(t), t + E.T0, { hand: .0005 });
      spec.update?.(t, L, S);
    },
    post(t) { return { focus: S.cam.position.z - focusK(t), aper: spec.aper ?? 16, maxCoc: spec.maxCoc ?? 12, bloom: spec.bloom || { strength: .34, radius: .55, threshold: 1.2 } }; },
    grade(t) { const g = typeof spec.grade === 'function' ? spec.grade(t) : (spec.grade || {}); return { expo: 1.06, vig: .4, sat: 1.04, contrast: .1, ...g, expo: (g.expo ?? 1.06) * (1 + 1.6 * flash) }; },
  };
}
