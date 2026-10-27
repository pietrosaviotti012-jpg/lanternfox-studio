// Costruisce il Worker: inserisce pagina, script, accesso e icone nel modello worker.js.
// Usato da deploy.mjs (pubblicazione) e da dev.mjs (anteprima locale).
import { readFileSync, readdirSync } from "fs";
import { createHash } from "crypto";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

export const HERE = dirname(fileURLToPath(import.meta.url));
const TYPES = { ".png": "image/png", ".svg": "image/svg+xml" };
const read = (name) => readFileSync(join(HERE, name), "utf8");

// split/join invece di replace: nel codice ci sono "$" che replace interpreterebbe
const put = (text, key, value) => text.split(key).join(value);

export function assets() {
  return Object.fromEntries(readdirSync(join(HERE, "assets")).filter((f) => TYPES[extname(f)])
    .map((f) => [`/${f}`, [TYPES[extname(f)], readFileSync(join(HERE, "assets", f)).toString("base64")]]));
}

export function page() {
  return put(read("page.html"), "__SCRIPT__", read("app.js") + "\n" + read("interiors.js") + "\n" + read("scene.js"));
}

export function buildWorker() {
  const files = assets();
  let html = page(), login = read("login.html"), worker = read("worker.js");
  // indirizzi delle icone con la versione: l'iPhone non resta attaccato all'icona vecchia
  const version = createHash("sha256").update(Object.values(files).map((v) => v[1]).join("")).digest("hex").slice(0, 8);
  for (const name of Object.keys(files)) {
    html = put(html, `"${name}"`, `"${name}?v=${version}"`);
    login = put(login, `"${name}"`, `"${name}?v=${version}"`);
    worker = put(worker, `"${name}"`, `"${name}?v=${version}"`);
  }
  worker = put(worker, "__PAGE__", JSON.stringify(html));
  worker = put(worker, "__LOGIN__", JSON.stringify(login));
  return put(worker, "__ASSETS__", JSON.stringify(files));
}
