// Anteprima locale dell'ufficio, senza Cloudflare: serve la pagina e uno stato d'esempio.
// node office/dev.mjs  →  http://localhost:8787
import { createServer } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { page, assets, HERE } from "./build.mjs";

const PORT = Number(process.env.PORT || 8787);
// the shifts, read from the Worker so the preview shows the same day
const SCHEDULE = eval(readFileSync(join(HERE, "worker.js"), "utf8").match(/const SCHEDULE = (\[[\s\S]*?\n\]);/)[1]);
const sample = JSON.parse(readFileSync(join(HERE, "sample-state.json"), "utf8"));

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const files = assets();
  if (url.pathname === "/favicon.ico") url.pathname = "/favicon.png";
  if (files[url.pathname]) {
    res.writeHead(200, { "Content-Type": files[url.pathname][0] });
    return res.end(Buffer.from(files[url.pathname][1], "base64"));
  }
  if (url.pathname === "/state.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    // working houses started a few minutes ago, so the progress bars and the "verso le…" show something real
    for (const d of Object.values(sample.departments || {})) if (d.status === "working") d.updated_at = new Date(Date.now() - 4 * 60000).toISOString();
    // as on the Worker today: Ricerca and Community have no restart key yet
    const can_restart = Object.fromEntries(["ricerca", "soggetto", "copione", "regia", "voce", "animazione", "musica", "montaggio", "qualita", "pubblicazione", "community", "statistiche"]
      .map((d) => [d, !["ricerca", "community", "statistiche"].includes(d)]));
    return res.end(JSON.stringify({ ...sample, publish_at_utc: [16, 22], schedule: SCHEDULE, can_restart,
      links: { repo: "pietrosaviotti012-jpg/lanternfox-studio", routines: { PRODUCE: "trig_01BjJQVd4USismSyDNg6QzjF", PUBLISH: "trig_0189NypF3VnHYLoPwvSyA3NX", RESEARCH: "trig_01CYHvbjAagyYwNktktKbJgV", COMMUNITY: "trig_01N2hEZUpEKAbPLJNZse79AM" } } }).split('"__TODAY__"').join(JSON.stringify(new Date(Date.now() - 3600e3).toISOString())));
  }
  if (url.pathname === "/guard") {   // the general's round, as the Worker would report it with the sample's broken houses
    const broken = Object.entries(sample.departments || {}).filter(([, d]) => d.status === "error").map(([id]) => id);
    sample.guard = { at: new Date().toISOString(), seen: broken, done: broken,
      text: broken.length ? `Ho trovato: ${broken.join(", ")} fermi. Ho fatto ripartire: ${broken.join(", ")}.` : "Ho controllato tutte le casette: la catena è in ordine." };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, guard: sample.guard }));
  }
  if (url.pathname === "/calendar/note" || url.pathname === "/approve" || url.pathname === "/approve/when") {   // as the Worker, in memory
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const b = JSON.parse(body || "{}");
      if (url.pathname === "/calendar/note") {
        sample.notes ||= [];
        if (b.remove) sample.notes = sample.notes.filter((n) => n.id !== b.id);
        else sample.notes.push({ id: "note-" + Date.now().toString(36), date: b.date, text: b.text, at: new Date().toISOString() });
      } else {
        const q = (sample.queue || []).find((x) => x.id === b.id);
        if (q) { if (b.decision) Object.assign(q, { status: b.decision, decided_at: new Date().toISOString() }); if (b.after) q.publish_after = b.after; else delete q.publish_after; q.publish_exact = Boolean(b.after && b.exact); }
      }
      res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true, notes: sample.notes }));
    });
    return;
  }
  if (url.pathname === "/idea") {   // the idea goes in the list, as if the Regia had started
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const text = JSON.parse(body || "{}").text || "";
      (sample.ideas ||= []).push({ id: "idea-dev", text, at: new Date().toISOString(), status: "making" });
      res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true }));
    });
    return;
  }
  const media = url.pathname.match(/^\/media\/([\w-]+)\/(film\.mp4|poster\.jpg)$/);
  if (media) {   // same as the Worker: fetch the release file and hand it out with the right type
    const item = (sample.queue || []).find((q) => q.id === media[1]);
    const src = item && (media[2] === "film.mp4" ? item.preview_url : item.cover_url);
    if (!src) { res.writeHead(404); return res.end(); }
    fetch(src, { headers: req.headers.range ? { Range: req.headers.range } : {} }).then(async (up) => {
      const h = { "Content-Type": media[2] === "film.mp4" ? "video/mp4" : "image/jpeg", "Accept-Ranges": "bytes" };
      for (const k of ["content-length", "content-range"]) if (up.headers.get(k)) h[k] = up.headers.get(k);
      res.writeHead(up.status, h); res.end(Buffer.from(await up.arrayBuffer()));
    }).catch(() => { res.writeHead(502); res.end(); });
    return;
  }
  if (url.pathname === "/approve" || url.pathname === "/community/decide" || url.pathname.startsWith("/push/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, key: "", sent: 0 }));
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return res.end(page());
  }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`Ufficio in anteprima su http://localhost:${PORT}`));
