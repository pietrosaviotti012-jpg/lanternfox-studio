
// ---------------------------------------------------------------- gli interni delle casette
// Ogni casetta, aperta, mostra il suo mestiere. Misure in unità della casetta normale
// (2,6 × 2,3, pavimento a y = 0); la scrivania grande viene solo ingrandita.
// Ogni interno ha tick(t, status): a pieno ritmo quando il reparto lavora, lento quando
// aspetta, fermo (e l'animale dorme) quando riposa.
const INSIDE = {
  ricerca: "Sulla bacheca ci sono le storie più viste della settimana, collegate con lo spago rosso. Orlo le passa una a una con la lente.",
  soggetto: "Nello schedario ci sono le idee per le storie. Tito ne pesca una dal cassetto e la posa sulla scrivania.",
  copione: "Lino batte a macchina: il foglio si riempie riga dopo riga, con l'aggancio in cima.",
  regia: "Sul pannello dello storyboard le scene si accendono una dopo l'altra, nell'ordine del film.",
  animazione: "Sul tavolo luminoso Pip fa scorrere gli strati di carta: è così che si muove la scena.",
  voce: "Davanti al microfono Cantù legge il copione; l'onda della voce si alza e si abbassa con le parole.",
  musica: "Il carillon gira e le note salgono nella stanza.",
  montaggio: "Le bobine girano e sullo schermo le tracce di immagini, voce e musica si mettono in fila.",
  qualita: "Miva guarda il video sullo schermo e spunta la lista dei controlli, voce per voce.",
  revisione: "Sul telefono c'è il video finito. Quando aspetta te, il bottone si accende.",
  pubblicazione: "Neve imbusta il video e lo spedisce alle tre cassette: Instagram, YouTube e TikTok.",
  community: "Arrivano i commenti: Ada risponde a ognuno, e a chi scrive STORY manda il messaggio.",
  statistiche: "Abaco conta sul pallottoliere e le barre del grafico crescono con le visualizzazioni.",
};

const I = {
  mat: (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }),
  glowMat: (c) => new THREE.MeshBasicMaterial({ color: c }),
  box(w, h, d, c, x, y, z, parent) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === "number" ? I.mat(c) : c); m.position.set(x, y, z); parent?.add(m); return m; },
  cyl(rt, rb, h, c, x, y, z, parent, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof c === "number" ? I.mat(c) : c); m.position.set(x, y, z); parent?.add(m); return m; },
  // un foglio disegnato in Canvas; redraw(fn) lo ridisegna
  sheet(w, h, px, draw, parent, basic = true) {
    const c = document.createElement("canvas"); c.width = px; c.height = Math.round(px * h / w);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex, transparent: true });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    const g = c.getContext("2d");
    m.userData.redraw = (fn = draw) => { g.clearRect(0, 0, c.width, c.height); fn(g, c.width, c.height); tex.needsUpdate = true; };
    m.userData.redraw();
    parent?.add(m);
    return m;
  },
  // una scritta che guarda sempre la telecamera (fumetti, note, z del sonno)
  bubble(text, { bg = "#f6e3c8", fg = "#0e1532", size = 0.42, round = true } = {}) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128;
    const g = c.getContext("2d");
    g.font = "700 54px 'Atkinson Hyperlegible', sans-serif";
    const tw = Math.min(236, g.measureText(text).width + 44);
    if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect((256 - tw) / 2, 18, tw, 78, round ? 39 : 10); g.fill();
      g.beginPath(); g.moveTo(112, 92); g.lineTo(128, 116); g.lineTo(140, 92); g.fill(); }
    g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 128, 58);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s.scale.set(size * 2, size, 1);
    return s;
  },
  desk(parent, x = -0.2, z = -0.62, w = 1.5, d = 0.62) {
    I.box(w, 0.06, d, 0x8a5a3a, x, 0.56, z, parent);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) I.box(0.06, 0.53, 0.06, 0x5a3a26, x + dx * (w / 2 - 0.06), 0.27, z + dz * (d / 2 - 0.06), parent);
  },
  lerp: (a, b, k) => a + (b - a) * k,
  cycle: (t, period) => ((t % period) + period) % period / period,
};

// la stanza: pavimento di legno, pareti di fondo color carta, una lampada calda
function room(g, { wall = 0xe6d2ad, floor = 0x6b4a32 } = {}) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.2), I.mat(floor));
  fl.rotation.x = -Math.PI / 2; fl.position.y = 0.005; g.add(fl);
  for (let i = -2; i <= 2; i++) { const p = I.box(0.02, 0.003, 2.2, 0x5a3c28, i * 0.5, 0.008, 0, g); void p; }
  const lamp = new THREE.PointLight(0xffc98a, 0, 5, 1.4); lamp.position.set(0.2, 1.6, 0.2); g.add(lamp);
  const zz = I.bubble("z z", { bg: null, fg: "#cfe0ff", size: 0.36 }); zz.position.set(0.7, 1.55, 0.45); g.add(zz);
  const warn = I.bubble("!", { bg: "#ff8f73", fg: "#0e1532", size: 0.4 }); warn.position.set(0.6, 1.7, 0.4); warn.visible = false; g.add(warn);
  return { lamp, zz, warn, wall };
}

const BUILD = {
  ricerca(g) {
    I.desk(g);
    const board = I.box(1.7, 0.95, 0.04, 0x8a6440, -0.15, 1.12, -1.1, g);
    const colors = [0xe8743b, 0x6a86c2, 0x9fd9a8, 0xffb862, 0xd9cbb4, 0xc06a8a];
    const cards = colors.map((c, i) => I.box(0.34, 0.24, 0.02, I.mat(c, { emissive: 0x000000 }), -0.7 + (i % 3) * 0.55, 1.3 - Math.floor(i / 3) * 0.38, -1.07, g));
    const pts = []; for (const i of [0, 4, 2, 3, 1, 5]) pts.push(cards[i].position.clone().add(new THREE.Vector3(0, 0.08, 0.02)));
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xd0302a })));
    const lens = new THREE.Group();
    lens.add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.022, 8, 24), I.mat(0x2a1d14)));
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.35 })); lens.add(glass);
    I.cyl(0.02, 0.02, 0.2, 0x2a1d14, 0.12, -0.12, 0, lens).rotation.z = Math.PI / 4;
    g.add(lens);
    I.box(0.4, 0.04, 0.28, 0xf6e3c8, -0.5, 0.6, -0.55, g);
    return (t, s, speed) => {
      const i = Math.floor(t * 1.2 * Math.max(speed, 0.0001)) % cards.length;
      cards.forEach((c, j) => c.material.emissive.setHex(speed && j === i ? 0x7a4a10 : 0));
      const target = cards[i].position;
      lens.position.lerp(new THREE.Vector3(target.x + 0.05, target.y - 0.02, -0.98), speed ? 0.12 : 0);
    };
  },
  soggetto(g) {
    I.desk(g, 0.15, -0.65, 1.2);
    const cab = I.box(0.7, 1.0, 0.5, 0x5a3a26, -0.85, 0.5, -0.8, g);
    void cab;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      I.box(0.28, 0.24, 0.03, 0x9a6a46, -1.0 + c * 0.31, 0.22 + r * 0.3, -0.54, g);
      I.box(0.06, 0.03, 0.03, 0xd9b36a, -1.0 + c * 0.31, 0.25 + r * 0.3, -0.52, g);
    }
    for (let i = 0; i < 4; i++) I.box(0.3, 0.01, 0.2, 0xf6e3c8, 0.3, 0.6 + i * 0.012, -0.6, g).rotation.y = i * 0.15;
    const card = I.sheet(0.3, 0.2, 128, (x, W, H) => { x.fillStyle = "#f6e3c8"; x.fillRect(0, 0, W, H); x.fillStyle = "#e8743b"; x.fillRect(10, 12, W - 20, 10);
      x.fillStyle = "#6a86c2"; for (let i = 0; i < 3; i++) x.fillRect(10, 34 + i * 14, W - 30 - i * 15, 6); }, g, false);
    return (t, s, speed) => {
      if (!speed) { card.position.set(0.3, 0.64, -0.6); card.rotation.set(-Math.PI / 2, 0, 0); return; }
      const p = I.cycle(t * speed, 3);
      const a = new THREE.Vector3(-0.85, 0.95, -0.54), b = new THREE.Vector3(-0.3, 1.35, -0.4), c = new THREE.Vector3(0.3, 0.64, -0.6);
      const k = Math.min(1, p * 1.6);
      const pos = k < 0.5 ? a.clone().lerp(b, k * 2) : b.clone().lerp(c, (k - 0.5) * 2);
      card.position.copy(pos);
      card.rotation.set(-Math.PI / 2 * Math.max(0, (k - 0.5) * 2), k * Math.PI * 2, 0);
    };
  },
  copione(g) {
    I.desk(g);
    const tw = new THREE.Group(); tw.position.set(-0.2, 0.6, -0.6); g.add(tw);
    I.box(0.56, 0.12, 0.38, 0x23262e, 0, 0.06, 0, tw);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) I.cyl(0.022, 0.022, 0.02, 0xd9cbb4, -0.2 + c * 0.066 + r * 0.02, 0.13, 0.1 - r * 0.07, tw, 8);
    const carriage = I.cyl(0.04, 0.04, 0.6, 0x111318, 0, 0.17, -0.14, tw); carriage.rotation.z = Math.PI / 2;
    const LINES = ["Every night, he left", "one window lit.", "Not for the ships.", "The ships had stopped", "coming years ago.", "He left it on for", "a little fox who was", "afraid of the dark.", "And one stormy night…"];
    let shown = -1;
    const paper = I.sheet(0.42, 0.56, 256, () => {}, tw);
    paper.position.set(0, 0.46, -0.16); paper.rotation.x = -0.12;
    const draw = (n) => paper.userData.redraw((x, W, H) => {
      x.fillStyle = "#fbf3e2"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#e8743b"; x.font = "700 20px Georgia, serif"; x.fillText("HOOK", 18, 34);
      x.fillStyle = "#1a1d2a"; x.font = "18px Georgia, serif";
      LINES.slice(0, n).forEach((l, i) => x.fillText(l, 18, 66 + i * 30));
      if (n < LINES.length) { x.fillStyle = "#1a1d2a"; x.fillRect(18 + (n ? 0 : 0), 52 + n * 30, 2, 18); }
    });
    return (t, s, speed) => {
      const n = speed ? Math.floor(I.cycle(t * speed, 9) * (LINES.length + 2)) : s === "done" || s === "waiting" ? LINES.length : 3;
      const m = Math.min(n, LINES.length);
      if (m !== shown) { shown = m; draw(m); }
      carriage.position.x = speed ? Math.sin(t * 9) * 0.03 + (I.cycle(t * speed, 1.6) - 0.5) * 0.12 : 0;
    };
  },
  regia(g) {
    I.desk(g, 0.3, -0.5, 1.0);
    const frame = I.box(1.9, 1.0, 0.04, 0x2a1d14, -0.1, 1.12, -1.1, g); void frame;
    const scenes = [
      (x, W, H) => { x.fillStyle = "#6a86c2"; x.fillRect(0, 0, W, H); x.fillStyle = "#0e1532"; x.beginPath(); x.moveTo(0, H); x.lineTo(W * .6, H * .5); x.lineTo(W, H); x.fill(); x.fillStyle = "#ffb862"; x.fillRect(W * .55, H * .3, 10, 20); },
      (x, W, H) => { x.fillStyle = "#3f5a92"; x.fillRect(0, 0, W, H); x.fillStyle = "#d9b36a"; x.beginPath(); x.ellipse(W * .5, H, W * .7, H * .4, 0, 0, 7); x.fill(); x.fillStyle = "#e8743b"; x.beginPath(); x.arc(W * .45, H * .65, 10, 0, 7); x.fill(); },
      (x, W, H) => { x.fillStyle = "#1b2a5c"; x.fillRect(0, 0, W, H); x.strokeStyle = "#cfe0ff"; x.lineWidth = 3; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * 22, 0); x.lineTo(i * 22 - 14, H); x.stroke(); } },
      (x, W, H) => { x.fillStyle = "#2a3f78"; x.fillRect(0, 0, W, H); x.fillStyle = "#0e1532"; for (let i = 0; i < 5; i++) x.fillRect(W * .3 + i * 10, H - i * 14 - 14, 30, 8); x.fillStyle = "#e8743b"; x.fillRect(W * .55, H * .2, 12, 12); },
      (x, W, H) => { x.fillStyle = "#0a1330"; x.fillRect(0, 0, W, H); x.fillStyle = "#3f5a92"; x.beginPath(); x.arc(W * .5, H * .45, 16, 0, 7); x.fill(); },
      (x, W, H) => { x.fillStyle = "#0a1330"; x.fillRect(0, 0, W, H); const r = x.createRadialGradient(W / 2, H / 2, 2, W / 2, H / 2, 40); r.addColorStop(0, "#fff2d8"); r.addColorStop(1, "rgba(255,184,98,0)"); x.fillStyle = r; x.fillRect(0, 0, W, H); },
    ];
    const frames = scenes.map((fn, i) => { const p = I.sheet(0.52, 0.34, 128, fn, g); p.position.set(-0.7 + (i % 3) * 0.6, 1.32 - Math.floor(i / 3) * 0.42, -1.075); return p; });
    const pointer = I.cyl(0.012, 0.012, 0.5, 0xffb862, 0, 0, 0, g); pointer.rotation.z = 0.9;
    return (t, s, speed) => {
      const lit = speed ? Math.floor(I.cycle(t * speed, 7.2) * 7) : s === "idle" ? -1 : 6;
      frames.forEach((f, i) => f.material.color.setScalar(i < lit || (!speed && lit === 6) ? 1 : i === lit ? 0.75 + Math.sin(t * 8) * 0.25 : 0.28));
      const tgt = frames[Math.min(Math.max(lit, 0), 5)].position;
      pointer.position.set(I.lerp(pointer.position.x, tgt.x + 0.2, 0.08), I.lerp(pointer.position.y, tgt.y - 0.25, 0.08), -0.95);
      pointer.visible = Boolean(speed);
    };
  },
  animazione(g) {
    const table = I.box(1.5, 0.5, 0.8, 0x5a3a26, -0.25, 0.25, -0.6, g); void table;
    const light = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), I.glowMat(0xffe2b0)); light.rotation.x = -Math.PI / 2; light.position.set(-0.25, 0.505, -0.6); g.add(light);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), I.glowMat(0xffc98a)); back.position.set(-0.25, 0.86, -0.98); g.add(back);
    const ladder = ["#6a86c2", "#3f5a92", "#1b2a5c", "#0e1532"];
    const layers = ladder.map((col, i) => {
      const p = I.sheet(1.6, 0.6, 256, (x, W, H) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, H);
        for (let X = 0; X <= W; X += 8) x.lineTo(X, H * (0.45 + i * 0.1) + Math.sin(X * 0.03 + i * 2) * 14 + Math.sin(X * 0.011 + i) * 10); x.lineTo(W, H); x.fill();
        if (i === 2) { x.fillStyle = "#ffb862"; x.fillRect(W * .62, H * .55, 8, 8); } }, g);
      p.position.set(-0.25, 0.82, -0.92 + i * 0.1); return p;
    });
    return (t, s, speed) => {
      layers.forEach((l, i) => { l.position.x = -0.25 + Math.sin(t * speed * (0.6 + i * 0.35) + i) * 0.08 * (i + 1) * (speed ? 1 : 0); });
      const f = speed ? 0.85 + Math.sin(t * 7.3) * Math.sin(t * 3.1) * 0.15 : 0.45;
      light.material.color.setRGB(f, f * 0.88, f * 0.69); back.material.color.setRGB(f, f * 0.79, f * 0.54);
    };
  },
  voce(g) {
    I.desk(g, -0.35, -0.65, 1.1);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) I.box(0.26, 0.26, 0.06, (r + c) % 2 ? 0x2b2f3d : 0x343a4c, -1.0 + c * 0.3, 0.85 + r * 0.3, -1.1, g);
    I.cyl(0.015, 0.015, 1.0, 0x23262e, 0.25, 0.5, -0.25, g);
    I.cyl(0.15, 0.15, 0.02, 0x23262e, 0.25, 0.01, -0.25, g);
    const mic = I.cyl(0.06, 0.06, 0.2, 0x3b3a48, 0.25, 1.08, -0.25, g); void mic;
    const grille = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8), I.mat(0x8a8fa0)); grille.position.set(0.25, 1.2, -0.25); g.add(grille);
    const pop = new THREE.Mesh(new THREE.CircleGeometry(0.13, 24), new THREE.MeshBasicMaterial({ color: 0x0e1532, transparent: true, opacity: 0.45, side: THREE.DoubleSide })); pop.position.set(0.32, 1.15, -0.05); pop.rotation.y = 0.6; g.add(pop);
    const screen = I.box(0.7, 0.32, 0.03, 0x0e1532, -0.35, 0.78, -0.88, g); void screen;
    const bars = Array.from({ length: 11 }, (_, i) => I.box(0.035, 0.2, 0.01, I.glowMat(0xffb862), -0.63 + i * 0.056, 0.78, -0.86, g));
    return (t, s, speed) => bars.forEach((b, i) => { b.scale.y = speed ? 0.15 + Math.abs(Math.sin(t * 9 * speed + i * 0.9) * Math.sin(t * 3.3 + i)) * 1.1 : 0.12; });
  },
  musica(g) {
    I.desk(g);
    const boxg = new THREE.Group(); boxg.position.set(-0.3, 0.6, -0.6); g.add(boxg);
    I.box(0.5, 0.22, 0.34, 0x9a6a46, 0, 0.11, 0, boxg);
    const lid = I.box(0.5, 0.02, 0.34, 0x8a5a3a, 0, 0.36, -0.2, boxg); lid.rotation.x = -1.2;
    const drum = I.cyl(0.07, 0.07, 0.36, 0xd9b36a, 0, 0.26, 0.02, boxg, 20); drum.rotation.z = Math.PI / 2;
    for (let i = 0; i < 14; i++) { const pin = I.box(0.012, 0.03, 0.012, 0x6a4a2a, -0.15 + (i % 7) * 0.05, 0.08, 0, drum); pin.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), (i * 1.3) % 6.28); }
    const notes = ["♪", "♫", "♪", "♩", "♫"].map((n) => { const s = I.bubble(n, { bg: null, fg: "#ffb862", size: 0.32 }); g.add(s); return s; });
    I.box(0.08, 1.1, 0.3, 0x5a3a26, -1.05, 0.55, -0.7, g);
    return (t, s, speed) => {
      drum.rotation.x = t * 2.2 * speed;
      notes.forEach((n, i) => {
        const p = I.cycle(t * speed + i * 0.6, 3);
        n.visible = Boolean(speed);
        n.position.set(-0.3 + Math.sin(p * 6 + i) * 0.25, 0.95 + p * 1.0, -0.55 + i * 0.05);
        n.material.opacity = 1 - p;
      });
    };
  },
  montaggio(g) {
    I.desk(g);
    I.box(0.06, 0.4, 0.06, 0x23262e, -0.2, 0.8, -0.75, g);
    I.box(0.95, 0.56, 0.05, 0x23262e, -0.2, 1.1, -0.78, g);
    const COLORS = ["#6a86c2", "#e8743b", "#ffb862"];
    const scr = I.sheet(0.88, 0.5, 256, () => {}, g); scr.position.set(-0.2, 1.1, -0.75);
    const draw = (k) => scr.userData.redraw((x, W, H) => {
      x.fillStyle = "#0e1532"; x.fillRect(0, 0, W, H);
      COLORS.forEach((c, r) => { for (let i = 0; i < 6; i++) { const target = 12 + i * 38 + r * 6; const from = W + i * 60;
        x.fillStyle = c; x.fillRect(I.lerp(from, target, Math.min(1, Math.max(0, k * 1.6 - i * 0.12))), 18 + r * 34, 34, 22); } });
      x.fillStyle = "#f3e6cf"; x.fillRect(12 + k * (W - 24), 10, 2, H - 20);
    });
    const reels = [-0.95, -0.55].map((xx) => { const r = new THREE.Group(); r.position.set(xx, 1.35, -1.05); g.add(r);
      const disc = I.cyl(0.18, 0.18, 0.03, 0x3b3a48, 0, 0, 0, r, 24); disc.rotation.x = Math.PI / 2;
      for (let i = 0; i < 3; i++) { const hole = I.cyl(0.04, 0.04, 0.035, 0x0e1532, Math.cos(i * 2.09) * 0.09, Math.sin(i * 2.09) * 0.09, 0, r, 10); hole.rotation.x = Math.PI / 2; }
      return r; });
    I.box(0.06, 0.8, 0.06, 0x23262e, -0.75, 0.95, -1.05, g);
    let last = -1;
    return (t, s, speed) => {
      reels.forEach((r, i) => { r.rotation.z = -t * 1.8 * speed * (i ? 1.2 : 1); });
      const k = speed ? I.cycle(t * speed, 6) : s === "idle" ? 0 : 1;
      const q = Math.round(k * 40) / 40;
      if (q !== last) { last = q; draw(q); }
    };
  },
  qualita(g) {
    I.desk(g);
    I.box(0.06, 0.4, 0.06, 0x23262e, -0.35, 0.8, -0.75, g);
    I.box(0.66, 0.42, 0.05, 0x23262e, -0.35, 1.08, -0.78, g);
    const scr = I.sheet(0.6, 0.36, 256, () => {}, g); scr.position.set(-0.35, 1.08, -0.75);
    const list = I.sheet(0.55, 0.7, 192, () => {}, g); list.position.set(0.55, 1.15, -1.1);
    const CHECKS = ["Aggancio in 2 s", "Voce chiara", "Sottotitoli a tempo", "Volume giusto"];
    let lastN = -1, frame = 0;
    const drawList = (n) => list.userData.redraw((x, W, H) => {
      x.fillStyle = "#fbf3e2"; x.fillRect(0, 0, W, H); x.fillStyle = "#1a1d2a"; x.font = "700 17px Georgia, serif"; x.fillText("Controlli", 14, 28);
      x.font = "15px Georgia, serif";
      CHECKS.forEach((c, i) => { const y = 62 + i * 52; x.strokeStyle = "#1a1d2a"; x.lineWidth = 2; x.strokeRect(14, y - 14, 18, 18);
        if (i < n) { x.strokeStyle = "#2f8a4a"; x.lineWidth = 4; x.beginPath(); x.moveTo(16, y - 5); x.lineTo(23, y + 2); x.lineTo(36, y - 18); x.stroke(); }
        x.fillStyle = "#1a1d2a"; x.fillText(c, 42, y); });
    });
    return (t, s, speed) => {
      const n = speed ? Math.floor(I.cycle(t * speed, 6) * 5) : s === "idle" ? 0 : 4;
      if (n !== lastN) { lastN = n; drawList(n); }
      if (speed && ++frame % 4) return;
      scr.userData.redraw((x, W, H) => {
        x.fillStyle = "#0a1330"; x.fillRect(0, 0, W, H);
        const mx = W * (0.2 + I.cycle(t * 0.1, 1) * 0.6);
        x.fillStyle = "#ffe9c4"; x.beginPath(); x.arc(mx, H * 0.3, 12, 0, 7); x.fill();
        ["#6a86c2", "#3f5a92", "#0e1532"].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.moveTo(0, H);
          for (let X = 0; X <= W; X += 8) x.lineTo(X, H * (0.55 + i * 0.12) + Math.sin(X * 0.04 + i * 2 + t * (i + 1) * 0.4) * 8); x.lineTo(W, H); x.fill(); });
        x.fillStyle = "rgba(0,0,0,.5)"; x.fillRect(W * .15, H - 26, W * .7, 18); x.fillStyle = "#f3e6cf"; x.font = "12px sans-serif"; x.textAlign = "center"; x.fillText("Not for the ships.", W / 2, H - 13);
      });
    };
  },
  revisione(g) {
    I.desk(g, -0.15, -0.55, 1.6, 0.7);
    const phone = new THREE.Group(); phone.position.set(-0.3, 0.84, -0.62); phone.rotation.x = -0.15; g.add(phone);
    I.box(0.26, 0.48, 0.03, 0x111318, 0, 0, 0, phone);
    const scr = I.sheet(0.23, 0.42, 128, (x, W, H) => {
      x.fillStyle = "#0a1330"; x.fillRect(0, 0, W, H);
      x.fillStyle = "#3f5a92"; x.beginPath(); x.moveTo(0, H); x.lineTo(0, H * .65); x.quadraticCurveTo(W * .5, H * .5, W, H * .62); x.lineTo(W, H); x.fill();
      x.fillStyle = "#e8743b"; x.beginPath(); x.ellipse(W * .45, H * .6, 10, 14, 0, 0, 7); x.fill();
      const r = x.createRadialGradient(W * .65, H * .5, 1, W * .65, H * .5, 22); r.addColorStop(0, "#fff2d8"); r.addColorStop(1, "rgba(255,184,98,0)"); x.fillStyle = r; x.fillRect(0, 0, W, H);
      x.fillStyle = "rgba(243,230,207,.85)"; x.beginPath(); x.moveTo(W * .42, H * .24); x.lineTo(W * .62, H * .3); x.lineTo(W * .42, H * .36); x.fill();
    }, phone); scr.position.z = 0.017;
    const button = I.cyl(0.09, 0.09, 0.04, I.mat(0xe8743b, { emissive: 0x000000 }), 0.25, 0.61, -0.45, g, 24);
    const lantern = new THREE.Group(); lantern.position.set(-0.85, 0.6, -0.7); g.add(lantern);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), I.glowMat(0xffb862)); body.scale.y = 1.3; body.position.y = 0.2; lantern.add(body);
    I.cyl(0.08, 0.08, 0.03, 0x2a1d14, 0, 0.39, 0, lantern); I.cyl(0.08, 0.08, 0.03, 0x2a1d14, 0, 0.01, 0, lantern);
    const chair = I.box(0.5, 0.08, 0.5, 0x8a3a2a, 0.55, 0.35, 0.2, g); void chair;
    I.box(0.5, 0.5, 0.08, 0x8a3a2a, 0.55, 0.62, -0.02, g);
    return (t, s) => {
      const wait = s === "waiting";
      button.material.emissive.setHex(wait ? (Math.sin(t * 5) > 0 ? 0x8a3a10 : 0x3a1606) : 0);
      button.position.y = 0.61 - (wait ? Math.max(0, Math.sin(t * 5)) * 0.015 : 0);
      phone.position.y = 0.84 + (wait ? Math.sin(t * 2) * 0.02 : 0);
      body.material.color.setScalar(0.85 + Math.sin(t * 7.3) * Math.sin(t * 3.1) * 0.15).multiply(new THREE.Color(0xffb862));
    };
  },
  pubblicazione(g) {
    I.desk(g, 0.25, -0.15, 1.0, 0.55);
    const boxes = [[0xd6457a, "IG"], [0xe0302a, "YT"], [0x20262e, "TT"]].map(([c, label], i) => {
      const b = new THREE.Group(); b.position.set(-0.95 + i * 0.6, 0, -0.85); g.add(b);
      I.box(0.05, 0.7, 0.05, 0x5a3a26, 0, 0.35, 0, b);
      I.box(0.34, 0.28, 0.42, c, 0, 0.84, 0, b);
      const tag = I.bubble(label, { bg: "#f3e6cf", fg: "#0e1532", size: 0.2, round: false }); tag.position.set(0, 1.12, 0.1); b.add(tag);
      return b;
    });
    const envs = boxes.map(() => {
      const e = I.sheet(0.24, 0.16, 96, (x, W, H) => { x.fillStyle = "#f3e6cf"; x.fillRect(0, 0, W, H); x.strokeStyle = "#b89a6a"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(W / 2, H * .6); x.lineTo(W, 0); x.stroke(); }, g, false);
      e.material.side = THREE.DoubleSide; return e;
    });
    return (t, s, speed) => envs.forEach((e, i) => {
      const p = I.cycle(t * speed + i * 0.8, 2.4);
      e.visible = Boolean(speed) && p < 0.85;
      const from = new THREE.Vector3(0.25, 0.65, -0.15), to = boxes[i].position.clone().add(new THREE.Vector3(0, 0.84, 0.22));
      const k = Math.min(1, p / 0.85);
      e.position.lerpVectors(from, to, k); e.position.y += Math.sin(k * Math.PI) * 0.6;
      e.rotation.set(0, 0, Math.sin(k * 6) * 0.3);
    });
  },
  community(g) {
    I.desk(g);
    const lap = new THREE.Group(); lap.position.set(-0.3, 0.6, -0.6); g.add(lap);
    I.box(0.5, 0.025, 0.34, 0x8a8fa0, 0, 0.012, 0, lap);
    const lid = I.box(0.5, 0.34, 0.02, 0x8a8fa0, 0, 0.18, -0.17, lap); lid.rotation.x = -0.25;
    const scr = I.sheet(0.44, 0.28, 128, (x, W, H) => { x.fillStyle = "#13204a"; x.fillRect(0, 0, W, H); x.fillStyle = "#9fb0d6";
      for (let i = 0; i < 4; i++) { x.fillRect(8, 10 + i * 18, 14, 12); x.fillRect(28, 12 + i * 18, W - 50 - (i % 2) * 20, 7); } }, lap);
    scr.position.set(0, 0.18, -0.155); scr.rotation.x = -0.25;
    const TEXTS = ["♥ 24", "STORY", "so cozy!", "?", "part 2?", "STORY"];
    const bubbles = TEXTS.map((tx) => { const b = I.bubble(tx, { bg: tx === "STORY" ? "#ffb862" : "#f6e3c8", size: 0.3 }); g.add(b); return b; });
    return (t, s, speed) => bubbles.forEach((b, i) => {
      const p = I.cycle(t * speed + i * 0.55, 3.3);
      b.visible = Boolean(speed);
      b.position.set(-0.9 + (i % 3) * 0.55, 1.0 + p * 0.7, -0.7 + (i % 2) * 0.2);
      b.material.opacity = p < 0.15 ? p / 0.15 : 1 - Math.max(0, p - 0.7) / 0.3;
      const sc = 0.3 * (0.8 + Math.min(1, p * 6) * 0.2); b.scale.set(sc * 2, sc, 1);
    });
  },
  statistiche(g) {
    I.desk(g);
    I.box(1.4, 0.9, 0.04, 0xfbf3e2, -0.25, 1.15, -1.1, g);
    const bars = [0.3, 0.45, 0.4, 0.62, 0.8].map((hh, i) => { const b = I.box(0.16, 1, 0.03, i === 4 ? 0xe8743b : 0x6a86c2, -0.75 + i * 0.25, 0.75, -1.07, g); b.userData.h = hh; return b; });
    const ab = new THREE.Group(); ab.position.set(-0.3, 0.6, -0.6); g.add(ab);
    I.box(0.6, 0.03, 0.06, 0x5a3a26, 0, 0, 0, ab); I.box(0.6, 0.03, 0.06, 0x5a3a26, 0, 0.32, 0, ab);
    I.box(0.03, 0.35, 0.06, 0x5a3a26, -0.3, 0.16, 0, ab); I.box(0.03, 0.35, 0.06, 0x5a3a26, 0.3, 0.16, 0, ab);
    const beads = [];
    for (let r = 0; r < 3; r++) { const rod = I.cyl(0.006, 0.006, 0.6, 0x2a1d14, 0, 0.08 + r * 0.09, 0, ab); rod.rotation.z = Math.PI / 2;
      for (let i = 0; i < 5; i++) { const bd = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), I.mat([0xe8743b, 0xffb862, 0x6a86c2][r])); bd.position.set(-0.22 + i * 0.06, 0.08 + r * 0.09, 0); ab.add(bd); beads.push([bd, r, i]); } }
    return (t, s, speed) => {
      bars.forEach((b, i) => { const grow = speed ? Math.min(1, I.cycle(t * speed, 5) * 2 - i * 0.12) : s === "idle" ? 0.15 : 1;
        const hh = b.userData.h * Math.max(0.05, grow); b.scale.y = hh; b.position.y = 0.75 + hh / 2; });
      beads.forEach(([bd, r, i]) => { const slide = speed && i >= 5 - ((Math.floor(t * speed * 2) + r) % 5) ? 0.24 : 0; bd.position.x = I.lerp(bd.position.x, -0.22 + i * 0.06 + slide, 0.15); });
    };
  },
};

// costruisce l'interno di un reparto: { group, seat, tick(t, status) }
function buildInterior(id) {
  const g = new THREE.Group();
  const base = room(g);
  const tick = BUILD[id](g);
  const sleep = { idle: true, done: false };
  return {
    group: g,
    seat: [0.62, 0.42],
    tick(t, status) {
      const speed = status === "working" ? 1 : status === "waiting" ? 0.35 : status === "error" ? 0.15 : 0;
      tick(t, status, reduceMotion ? 0 : speed);
      base.zz.visible = Boolean(sleep[status]);
      if (base.zz.visible) { base.zz.position.y = 1.5 + I.cycle(t, 2.4) * 0.3; base.zz.material.opacity = 1 - I.cycle(t, 2.4); }
      base.warn.visible = status === "error" && Math.sin(t * 6) > -0.3;
    },
    light: base.lamp,
  };
}
