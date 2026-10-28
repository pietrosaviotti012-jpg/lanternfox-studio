// Anteprima locale dell'ufficio, senza Cloudflare: serve la pagina e uno stato d'esempio.
// node office/dev.mjs  →  http://localhost:8787
import { createServer } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { page, assets, HERE } from "./build.mjs";

const PORT = Number(process.env.PORT || 8787);
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
    return res.end(JSON.stringify(sample));
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
  if (url.pathname === "/approve" || url.pathname.startsWith("/push/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, key: "", sent: 0 }));
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return res.end(page());
  }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`Ufficio in anteprima su http://localhost:${PORT}`));
