import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ---------------------------------------------------------------- i reparti
// L'ordine è il percorso del video: dalla ricerca del mattino alle statistiche della sera.
const DEPTS = [
  { id: "ricerca", name: "Ricerca", who: "Orlo, il gufo", animal: "owl", fur: "#b48a5a", at: [-10, -7.2],
    does: "Cerca le storie e i formati che stanno funzionando adesso, e capisce perché.",
    skills: ["trend-spotter", "content-research", "reel-analyzer", "agent-reach"] },
  { id: "soggetto", name: "Soggetto", who: "Tito, il riccio", animal: "hedgehog", fur: "#8a6a52", at: [-5, -7.2],
    does: "Sceglie la storia del giorno dall'archivio delle idee, dentro una serie riconoscibile.",
    skills: ["series-planner", "content-calendar", "content-pillar-builder"] },
  { id: "copione", name: "Copione", who: "Lino, il coniglio", animal: "rabbit", fur: "#d9cbb4", at: [0, -7.2],
    does: "Scrive l'aggancio dei primi tre secondi e la storia, riga per riga, con il tono di ogni frase.",
    skills: ["viral-hook-writer", "reel-scripter", "on-screen-text-writer", "cta-writer"] },
  { id: "regia", name: "Regia", who: "Lume, la volpe", animal: "fox", fur: "#e8743b", at: [5, -7.2],
    does: "Disegna lo storyboard nello stile della scatola di carta illuminata.",
    skills: ["lemo-opuscar", "launch-video"] },
  { id: "voce", name: "Voce", who: "Cantù, il merlo", animal: "bird", fur: "#2b2a33", at: [10, -7.2],
    does: "Legge la storia con la voce del narratore, cambiando tono e volume a ogni frase.",
    skills: ["Chatterbox"] },
  { id: "animazione", name: "Animazione", who: "Pip, lo scoiattolo", animal: "squirrel", fur: "#c0703a", at: [10, -1.4],
    does: "Scrive il codice che diventa video: strati di carta, luce, movimento.",
    skills: ["lemo-opuscar"] },
  { id: "musica", name: "Musica", who: "Fa, il topolino", animal: "mouse", fur: "#a9a2b8", at: [3.3, -1.4],
    does: "Compone carillon e arpa, e aggiunge i suoni della carta e della luce.",
    skills: ["lemo-opuscar"] },
  { id: "montaggio", name: "Montaggio", who: "Bruno, il tasso", animal: "badger", fur: "#55545e", at: [-3.3, -1.4],
    does: "Mette insieme immagini, voce, musica e sottotitoli a tempo con le parole.",
    skills: ["launch-video", "cover-thumbnail-brief"] },
  { id: "qualita", name: "Controllo qualità", who: "Miva, la gatta", animal: "cat", fur: "#e3dccd", at: [-10, -1.4],
    does: "Guarda il video come uno spettatore: se qualcosa non va, lo rimanda indietro.",
    skills: ["reel-analyzer"] },
  { id: "revisione", name: "La tua scrivania", who: "Tu", animal: "lantern", fur: "#ffb862", at: [-10, 4.4], big: true,
    does: "Qui arriva il video finito. Lo guardi, e scegli: pubblica o rifai.",
    skills: [] },
  { id: "pubblicazione", name: "Pubblicazione", who: "Neve, la cicogna", animal: "stork", fur: "#eef0f4", at: [-3.3, 4.4],
    does: "Scrive didascalie e hashtag e pubblica su Instagram, YouTube e TikTok all'ora giusta.",
    skills: ["caption-and-hashtags", "hashtag-keyword-research", "cross-platform-reformatter"] },
  { id: "community", name: "Community", who: "Ada, la lontra", animal: "otter", fur: "#7a5a44", at: [3.3, 4.4],
    does: "Risponde ai commenti e manda il messaggio a chi scrive la parola chiave.",
    skills: ["comment-responder", "dm-script-writer", "comment-mining"] },
  { id: "statistiche", name: "Statistiche", who: "Abaco, l'orso", animal: "bear", fur: "#6e4d36", at: [10, 4.4],
    does: "Legge i numeri della sera e dice alla Ricerca cosa rifare e cosa lasciar perdere.",
    skills: ["analytics-readout", "content-audit"] },
];
const BY_ID = Object.fromEntries(DEPTS.map((d) => [d.id, d]));
const STATUS_TEXT = { idle: "A riposo", working: "Al lavoro", done: "Fatto", waiting: "Aspetta te", error: "Si è fermato" };
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));


// ---------------------------------------------------------------- animali di carta
// Ogni animale è una sagoma di carta disegnata in Canvas: colore pieno, filo di luce sul bordo alto,
// ombra portata sullo strato dietro. Lo stesso disegno serve per la scena 3D e per le icone del pannello.
function paperCut(kind, fur, size = 256) {
  const fig = document.createElement("canvas");
  fig.width = fig.height = 256;
  drawFigure(fig.getContext("2d"), kind, fur);
  const out = document.createElement("canvas");
  out.width = out.height = size;
  const g = out.getContext("2d");
  g.scale(size / 256, size / 256);
  // ombra: la figura tinta di scuro, sfocata e spostata in basso
  const shadow = document.createElement("canvas");
  shadow.width = shadow.height = 256;
  const s = shadow.getContext("2d");
  s.drawImage(fig, 0, 0);
  s.globalCompositeOperation = "source-in"; s.fillStyle = "#03060f"; s.fillRect(0, 0, 256, 256);
  g.save(); g.filter = "blur(5px)"; g.globalAlpha = .55; g.drawImage(shadow, 0, 9); g.restore();
  g.drawImage(fig, 0, 0);
  // bordo di luce in alto: la figura spostata di 3px verso l'alto, tagliata dalla figura stessa
  const rim = document.createElement("canvas");
  rim.width = rim.height = 256;
  const r = rim.getContext("2d");
  r.drawImage(fig, 0, 0);
  r.globalCompositeOperation = "destination-out"; r.drawImage(fig, 0, 3);
  r.globalCompositeOperation = "source-in"; r.fillStyle = "rgba(255,226,180,.75)"; r.fillRect(0, 0, 256, 256);
  g.drawImage(rim, 0, 0);
  return out;
}

function drawFigure(g, kind, fur) {
  const cream = "#f6e3c8", dark = "#0e1532";
  const shape = (fill, draw) => { g.fillStyle = fill; g.beginPath(); draw(); g.fill(); };
  const ell = (x, y, rx, ry, r = 0) => { g.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); g.ellipse(x, y, rx, ry, r, 0, Math.PI * 2); };
  const tri = (a, b, c2) => { g.moveTo(...a); g.lineTo(...b); g.lineTo(...c2); g.closePath(); };
  const eye = (x, y, r = 6) => shape(dark, () => ell(x, y, r, r));
  FIGURES[kind]?.({ g, fur, cream, shape, ell, tri, eye });
}

const FIGURES = {
  fox: ({ g, fur, cream, shape, ell, tri, eye }) => {
    shape(fur, () => { g.moveTo(70, 236); g.bezierCurveTo(10, 220, 20, 150, 60, 150); g.bezierCurveTo(70, 190, 100, 210, 130, 212); g.closePath(); });
    shape(cream, () => { g.moveTo(40, 160); g.bezierCurveTo(20, 175, 18, 200, 30, 214); g.bezierCurveTo(30, 190, 40, 172, 55, 162); g.closePath(); });
    shape(fur, () => ell(128, 186, 52, 56));
    shape(cream, () => ell(130, 196, 22, 34));
    shape(fur, () => { tri([88, 104], [96, 40], [124, 92]); tri([168, 104], [160, 40], [132, 92]); ell(128, 112, 46, 38); });
    shape("#a8461f", () => { tri([96, 92], [98, 56], [114, 88]); tri([160, 92], [158, 56], [142, 88]); });
    shape(cream, () => { g.moveTo(98, 120); g.quadraticCurveTo(128, 168, 158, 120); g.quadraticCurveTo(128, 134, 98, 120); });
    eye(110, 108); eye(146, 108); eye(128, 140, 7);
  },
  owl: ({ fur, cream, shape, ell, tri, eye }) => {
    shape(fur, () => ell(128, 160, 64, 78));
    shape(cream, () => ell(128, 186, 40, 46));
    shape(fur, () => { tri([72, 100], [80, 54], [106, 94]); tri([184, 100], [176, 54], [150, 94]); });
    shape(cream, () => { ell(104, 122, 24, 24); ell(152, 122, 24, 24); });
    eye(104, 122, 11); eye(152, 122, 11);
    shape("#e8a33b", () => tri([120, 142], [136, 142], [128, 158]));
  },
  hedgehog: ({ g, cream, shape, ell, tri, eye }) => {
    shape("#4a3a30", () => {
      for (let i = 0; i < 10; i++) { const a = Math.PI * (0.9 + i * 0.12);
        tri([118 + 56 * Math.cos(a - .18), 172 + 52 * Math.sin(a - .18)], [118 + 100 * Math.cos(a), 172 + 92 * Math.sin(a)], [118 + 56 * Math.cos(a + .18), 172 + 52 * Math.sin(a + .18)]); }
      ell(118, 176, 72, 56);
    });
    shape(cream, () => { g.moveTo(150, 146); g.quadraticCurveTo(232, 164, 216, 190); g.quadraticCurveTo(182, 218, 140, 206); g.closePath(); });
    eye(178, 170); eye(216, 188, 6);
  },
  rabbit: ({ fur, cream, shape, ell, eye }) => {
    shape(fur, () => { ell(104, 70, 16, 52, -.12); ell(152, 70, 16, 52, .12); });
    shape("#e9b8a8", () => { ell(104, 74, 7, 36, -.12); ell(152, 74, 7, 36, .12); });
    shape(fur, () => { ell(128, 194, 56, 52); ell(128, 128, 44, 40); });
    shape(cream, () => ell(128, 202, 28, 32));
    eye(112, 124); eye(144, 124); shape("#e9a8a0", () => ell(128, 144, 6, 4));
  },
  squirrel: ({ g, fur, cream, shape, ell, tri, eye }) => {
    shape(fur, () => { g.moveTo(150, 236); g.bezierCurveTo(250, 220, 250, 60, 170, 70); g.bezierCurveTo(210, 110, 200, 180, 150, 190); g.closePath(); });
    shape(fur, () => { ell(108, 188, 48, 52); ell(104, 124, 38, 34); tri([80, 104], [82, 66], [100, 96]); tri([128, 104], [126, 66], [110, 96]); });
    shape(cream, () => ell(110, 198, 22, 30));
    eye(92, 120); eye(120, 120);
    shape("#8a5a3a", () => ell(104, 166, 14, 12));
  },
  bird: ({ fur, shape, ell, tri, eye }) => {
    shape(fur, () => { ell(128, 160, 58, 54); ell(150, 108, 36, 34); tri([60, 170], [20, 200], [76, 196]); });
    shape("#3b3a48", () => ell(116, 166, 34, 26, -.3));
    shape("#f2b23a", () => tri([182, 104], [216, 112], [182, 120]));
    shape("#f2b23a", () => ell(160, 100, 9, 9)); eye(160, 100, 4);
  },
  mouse: ({ g, fur, shape, ell, eye }) => {
    g.strokeStyle = fur; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(170, 222); g.quadraticCurveTo(232, 232, 222, 180); g.stroke();
    shape(fur, () => { ell(92, 92, 30, 30); ell(164, 92, 30, 30); });
    shape("#e9b8c0", () => { ell(92, 92, 18, 18); ell(164, 92, 18, 18); });
    shape(fur, () => { ell(128, 188, 50, 50); ell(128, 130, 42, 36); });
    eye(114, 126); eye(142, 126); shape("#e9a8b0", () => ell(128, 148, 6, 5));
  },
  badger: ({ g, fur, cream, shape, ell, eye }) => {
    shape(fur, () => { ell(128, 186, 62, 54); ell(128, 124, 46, 40); ell(92, 96, 12, 12); ell(164, 96, 12, 12); });
    shape(cream, () => { g.moveTo(118, 86); g.lineTo(138, 86); g.lineTo(134, 160); g.lineTo(122, 160); g.closePath(); });
    shape(cream, () => { ell(100, 132, 14, 10); ell(156, 132, 14, 10); });
    eye(104, 120, 5); eye(152, 120, 5); eye(128, 156, 7);
  },
  cat: ({ g, fur, shape, ell, tri, eye }) => {
    shape(fur, () => { g.moveTo(170, 230); g.bezierCurveTo(230, 230, 230, 150, 196, 150); g.bezierCurveTo(210, 190, 196, 210, 160, 214); g.closePath(); });
    shape(fur, () => { ell(124, 190, 50, 50); tri([86, 110], [88, 62], [116, 96]); tri([162, 110], [160, 62], [132, 96]); ell(124, 120, 42, 36); });
    shape("#6a8a5a", () => { ell(108, 120, 7, 9); ell(140, 120, 7, 9); });
    eye(108, 121, 3); eye(140, 121, 3); shape("#e9a8a0", () => tri([118, 136], [130, 136], [124, 144]));
  },
  stork: ({ g, fur, shape, ell, tri, eye }) => {
    shape("#e0543a", () => { g.rect(108, 200, 6, 40); g.rect(130, 200, 6, 40); });
    shape(fur, () => { ell(120, 170, 54, 40, -.2); ell(150, 92, 22, 22); g.rect(140, 100, 14, 60); });
    shape("#20263a", () => ell(98, 176, 34, 18, -.2));
    shape("#e0543a", () => tri([168, 86], [226, 100], [168, 100]));
    eye(154, 88, 4);
    shape("#d9c39a", () => g.rect(176, 140, 44, 32));
    shape("#b89a6a", () => tri([176, 140], [220, 140], [198, 158]));
  },
  otter: ({ fur, cream, shape, ell, eye }) => {
    shape(fur, () => { ell(128, 180, 50, 60); ell(128, 112, 40, 34); ell(96, 92, 9, 9); ell(160, 92, 9, 9); });
    shape(cream, () => { ell(128, 124, 26, 18); ell(128, 194, 26, 34); });
    eye(112, 108); eye(144, 108); eye(128, 122, 6);
    shape("#9fd9d8", () => ell(128, 168, 16, 12));
  },
  bear: ({ g, fur, shape, ell, eye }) => {
    shape(fur, () => { ell(84, 86, 22, 22); ell(172, 86, 22, 22); ell(128, 190, 64, 56); ell(128, 122, 50, 44); });
    shape("#c9a27a", () => { ell(128, 136, 22, 16); ell(128, 200, 30, 32); });
    eye(108, 116); eye(148, 116); eye(128, 132, 7);
    shape("#d9c39a", () => g.rect(150, 168, 46, 32));
  },
  lantern: ({ g, shape }) => {
    shape("#2a1d14", () => { g.rect(118, 28, 20, 30); g.rect(84, 56, 88, 14); g.rect(84, 202, 88, 14); g.rect(124, 216, 8, 22); });
    const grd = g.createRadialGradient(128, 130, 10, 128, 130, 84);
    grd.addColorStop(0, "#fff2d8"); grd.addColorStop(.5, "#ffb862"); grd.addColorStop(1, "#c4602a");
    shape(grd, () => { g.moveTo(92, 70); g.bezierCurveTo(48, 110, 48, 168, 92, 202); g.lineTo(164, 202); g.bezierCurveTo(208, 168, 208, 110, 164, 70); g.closePath(); });
    g.strokeStyle = "rgba(196,96,42,.7)"; g.lineWidth = 4;
    for (const x of [100, 128, 156]) { g.beginPath(); g.moveTo(x, 72); g.quadraticCurveTo(x + (x - 128) * .45, 136, x, 200); g.stroke(); }
  },
};

const ICONS = Object.fromEntries(DEPTS.map((d) => [d.id, paperCut(d.animal, d.fur, 128).toDataURL()]));
