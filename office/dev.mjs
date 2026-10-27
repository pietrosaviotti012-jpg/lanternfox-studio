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
