// Pubblica l'Ufficio su Cloudflare con le API ufficiali (senza wrangler).
// node office/deploy.mjs            pubblica pagina e codice, tiene i segreti già presenti
// node office/deploy.mjs --secrets  ricarica anche PASSWORD e STUDIO_SECRET dal file .env
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { buildWorker, HERE } from "./build.mjs";

const API = "https://api.cloudflare.com/client/v4";
const NAME = "lanternfox-office";
const KV_TITLE = "lanternfox-office";
const ENV_FILE = join(HERE, "..", ".env");
const DAILY_HOUR_UTC = "6"; // 7:00 in Italia d'inverno, 8:00 d'estate

const env = Object.fromEntries(readFileSync(ENV_FILE, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
  .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
for (const k of ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "OFFICE_PASSWORD", "STUDIO_SECRET"]) {
  if (!env[k]) { console.error(`Manca ${k} nel file .env`); process.exit(1); }
}
const acc = `/accounts/${env.CLOUDFLARE_ACCOUNT_ID}`;

async function cf(method, path, body, type = "application/json") {
  const init = { method, headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "User-Agent": "lanternfox-deploy" } };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) { init.body = typeof body === "string" ? body : JSON.stringify(body); init.headers["Content-Type"] = type; }
  const r = await fetch(API + path, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.success === false) {
    const msg = (j.errors || []).map((e) => e.message).join("; ") || r.statusText;
    throw new Error(`Cloudflare ${r.status} su ${method} ${path.replace(env.CLOUDFLARE_ACCOUNT_ID, "…")}: ${msg}`);
  }
  return j.result ?? j;
}

function saveEnv(key, value) {
  const lines = readFileSync(ENV_FILE, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith(key + "="));
  lines.push(`${key}=${value}`);
  writeFileSync(ENV_FILE, lines.join("\n") + "\n");
}

const namespaces = await cf("GET", `${acc}/storage/kv/namespaces?per_page=100`);
const kv = namespaces.find((n) => n.title === KV_TITLE)?.id || (await cf("POST", `${acc}/storage/kv/namespaces`, { title: KV_TITLE })).id;
const sub = (await cf("GET", `${acc}/workers/subdomain`)).subdomain;
const url = `https://${NAME}.${sub}.workers.dev`;

const withSecrets = process.argv.includes("--secrets") || !env.OFFICE_URL;
const bindings = [
  { type: "kv_namespace", name: "DATA", namespace_id: kv },
  { type: "durable_object_namespace", name: "CLOCK", class_name: "Clock" },
  { type: "plain_text", name: "DAILY_HOUR_UTC", text: DAILY_HOUR_UTC },
  { type: "plain_text", name: "OFFICE_URL", text: url },
  { type: "plain_text", name: "PUBLISH_AT_UTC", text: "22" },   // the publishing routine runs at this hour (UTC)
];
// Claude routines the buttons start ("Pubblica adesso", "Rifai"): ids are plain, tokens are secrets
if (env.YT_CLIENT_ID) bindings.push({ type: "plain_text", name: "YT_CLIENT_ID", text: env.YT_CLIENT_ID });
for (const w of ["PUBLISH", "REDO"]) if (env[`ROUTINE_${w}_ID`]) bindings.push({ type: "plain_text", name: `ROUTINE_${w}_ID`, text: env[`ROUTINE_${w}_ID`] });
if (withSecrets) {
  bindings.push({ type: "secret_text", name: "PASSWORD", text: env.OFFICE_PASSWORD });
  bindings.push({ type: "secret_text", name: "STUDIO_SECRET", text: env.STUDIO_SECRET });
  if (env.PUBLISH_KEY) bindings.push({ type: "secret_text", name: "PUBLISH_KEY", text: env.PUBLISH_KEY });
  for (const w of ["PUBLISH", "REDO"]) if (env[`ROUTINE_${w}_TOKEN`]) bindings.push({ type: "secret_text", name: `ROUTINE_${w}_TOKEN`, text: env[`ROUTINE_${w}_TOKEN`] });
  if (env.YT_CLIENT_SECRET) bindings.push({ type: "secret_text", name: "YT_CLIENT_SECRET", text: env.YT_CLIENT_SECRET });   // the user's Google project (YouTube)
}
const metadata = { main_module: "worker.js", compatibility_date: "2025-06-01", bindings,
  ...(withSecrets ? {} : { keep_bindings: ["secret_text"] }),
  migrations: { new_tag: "v1", new_sqlite_classes: ["Clock"] } };

async function upload(meta) {
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  form.append("worker.js", new Blob([buildWorker()], { type: "application/javascript+module" }), "worker.js");
  await cf("PUT", `${acc}/workers/scripts/${NAME}`, form);
}
try {
  await upload(metadata);
} catch (err) {
  if (!/migration/i.test(err.message)) throw err;
  delete metadata.migrations; // l'orologio è già stato dichiarato in passato
  await upload(metadata);
}
await cf("POST", `${acc}/workers/scripts/${NAME}/subdomain`, { enabled: true, previews_enabled: false });
await cf("PUT", `${acc}/workers/scripts/${NAME}/schedules`, [{ cron: "7 * * * *" }]); // riarma la sveglia ogni ora
saveEnv("OFFICE_URL", url);
saveEnv("CLOUDFLARE_KV_NAMESPACE_ID", kv);
console.log(`Ufficio pubblicato: ${url}${withSecrets ? " (password e segreto caricati)" : ""}`);
