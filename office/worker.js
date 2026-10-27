// Cloudflare Worker dell'Ufficio di Lantern Fox Tales. Pagina, accesso e icone vengono inseriti
// qui al momento della pubblicazione (vedi deploy.mjs). Login, notifiche Web Push e sveglia
// (Durable Object) vengono dalla dashboard Northstar del trading bot, già collaudata.
import { DurableObject } from "cloudflare:workers";

const PAGE = __PAGE__;
const LOGIN = __LOGIN__;
const ASSETS = __ASSETS__; // { "/percorso": ["tipo", "contenuto base64"] }
const MANIFEST = JSON.stringify({
  name: "Lantern Fox Office", short_name: "Ufficio", start_url: "/", display: "standalone",
  background_color: "#0a1330", theme_color: "#0a1330", lang: "it",
  icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
});
const COOKIE = "ufficio";
const DEPTS = ["ricerca", "soggetto", "copione", "regia", "animazione", "voce", "musica", "montaggio",
  "qualita", "revisione", "pubblicazione", "community", "statistiche"];
const STATUSES = ["idle", "working", "done", "waiting", "error"];

const SECURITY = {
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
};

async function sessionToken(password) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode("ufficio-sessione-v1"));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  return crypto.subtle.timingSafeEqual(x, y);
}

function cookieValue(request) {
  const header = request.headers.get("Cookie") || "";
  const match = header.split(/;\s*/).find((c) => c.startsWith(COOKIE + "="));
  return match ? match.slice(COOKIE.length + 1) : "";
}

function html(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...SECURITY, "Cache-Control": "no-store", "Content-Type": "text/html; charset=utf-8", ...extra } });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...SECURITY, "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" } });
}

function loginPage(error) {
  const message = error ? '<p class="error" role="alert">' + error + "</p>" : "";
  return html(LOGIN.replace("<!--ERRORE-->", message), error ? 401 : 200);
}

async function bearerOk(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return Boolean(env.STUDIO_SECRET) && (await same(auth, `Bearer ${env.STUDIO_SECRET}`));
}


// ---------------------------------------------------------------- notifiche push (Web Push)
// Standard Web Push: chiavi VAPID (RFC 8292) e cifratura aes128gcm (RFC 8291).
const SW = `self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: "Lantern Fox", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Lantern Fox", {
    body: d.body || "", icon: "/apple-touch-icon.png", badge: "/apple-touch-icon.png",
    tag: d.tag || undefined, data: { url: d.url || "/" } }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data.url, self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) if ("focus" in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});`;

const enc = (text) => new TextEncoder().encode(text);
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (text) => Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4)), (c) => c.charCodeAt(0));
function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
}

async function vapidKeys(env) {
  const saved = await env.DATA.get("vapid");
  if (saved) {
    const { publicKey, privateJwk } = JSON.parse(saved);
    const key = await crypto.subtle.importKey("jwk", privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    return { publicKey, key };
  }
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const publicKey = b64u(await crypto.subtle.exportKey("raw", pair.publicKey));
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  await env.DATA.put("vapid", JSON.stringify({ publicKey, privateJwk }));
  return { publicKey, key: pair.privateKey };
}

async function vapidHeader(env, endpoint) {
  const { publicKey, key } = await vapidKeys(env);
  const header = b64u(enc(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64u(enc(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.OFFICE_URL || "https://github.com" })));
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc(`${header}.${claims}`));
  return `vapid t=${header}.${claims}.${b64u(signature)}, k=${publicKey}`;
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8));
}

async function encryptPayload(subscription, payload) {
  const clientKey = unb64u(subscription.keys.p256dh);
  const auth = unb64u(subscription.keys.auth);
  const local = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const serverKey = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const peer = await crypto.subtle.importKey("raw", clientKey, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: peer }, local.privateKey, 256));
  const ikm = await hkdf(auth, shared, concat(enc("WebPush: info\0"), clientKey, serverKey), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc("Content-Encoding: nonce\0"), 12);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, concat(payload, new Uint8Array([2]))));
  const header = new Uint8Array(21 + serverKey.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = serverKey.length;
  header.set(serverKey, 21);
  return concat(header, cipher);
}

async function subscriptions(env) {
  return JSON.parse((await env.DATA.get("push_subs")) || "[]");
}

async function pushAll(env, message) {
  const subs = await subscriptions(env);
  if (!subs.length) return { sent: 0, devices: 0 };
  const payload = enc(JSON.stringify(message));
  const results = await Promise.all(subs.map(async (sub) => {
    try {
      const response = await fetch(sub.endpoint, { method: "POST", body: await encryptPayload(sub, payload), headers: {
        Authorization: await vapidHeader(env, sub.endpoint), "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream", TTL: "86400", Urgency: message.urgent ? "high" : "normal" } });
      return { sub, status: response.status };
    } catch (err) {
      return { sub, status: 0 };
    }
  }));
  const alive = results.filter((r) => r.status !== 404 && r.status !== 410).map((r) => r.sub);
  if (alive.length !== subs.length) await env.DATA.put("push_subs", JSON.stringify(alive));
  return { sent: results.filter((r) => r.status >= 200 && r.status < 300).length, devices: alive.length,
    statuses: results.map((r) => r.status) };
}


// ---------------------------------------------------------------- stato dell'ufficio
// Un solo documento in KV ("state"). Lo scrivono la routine di Claude e GitHub Actions con
// POST /events; la pagina lo rilegge ogni pochi secondi.
function emptyState() {
  return {
    updated_at: null,
    video: null, // { id, title, series, started_at }
    departments: Object.fromEntries(DEPTS.map((d) => [d, { status: "idle", task: "", output: "", updated_at: null }])),
    queue: [],    // { id, title, caption, preview_url, cover_url, platforms, status: pending|approved|redo, created_at }
    calendar: [], // { date, title, status: planned|made|published|skipped }
    stats: null,  // { followers: {instagram, youtube, tiktok}, views_7d, best: {title, views}, updated_at }
    log: [],      // { at, dept, text }
    clock: null,
  };
}

async function loadState(env) {
  const raw = await env.DATA.get("state");
  if (!raw) return emptyState();
  const state = { ...emptyState(), ...JSON.parse(raw) };
  for (const d of DEPTS) state.departments[d] = { ...emptyState().departments[d], ...(state.departments[d] || {}) };
  return state;
}

async function saveState(env, state) {
  state.updated_at = new Date().toISOString();
  state.log = state.log.slice(-80);
  state.queue = state.queue.slice(-20);
  state.calendar = state.calendar.slice(-60);
  await env.DATA.put("state", JSON.stringify(state));
}

function clip(text, n) {
  return String(text ?? "").slice(0, n);
}

// Un evento: { dept, status, task, output, video, queue, calendar, stats, reset }
async function applyEvent(env, event) {
  const state = await loadState(env);
  const now = new Date().toISOString();
  if (event.reset) {
    for (const d of DEPTS) state.departments[d] = { status: "idle", task: "", output: "", updated_at: now };
  }
  if (event.video) state.video = { ...event.video, started_at: event.video.started_at || now };
  if (event.dept) {
    if (!DEPTS.includes(event.dept)) throw new Error("reparto sconosciuto: " + event.dept);
    const status = STATUSES.includes(event.status) ? event.status : "working";
    const dept = state.departments[event.dept];
    dept.status = status;
    if (event.task !== undefined) dept.task = clip(event.task, 280);
    if (event.output !== undefined) dept.output = clip(event.output, 1200);
    dept.updated_at = now;
    if (event.task || event.output) state.log.push({ at: now, dept: event.dept, status, text: clip(event.task || event.output, 280) });
  }
  if (event.queue) {
    const item = { status: "pending", created_at: now, ...event.queue };
    state.queue = state.queue.filter((q) => q.id !== item.id).concat(item);
    if (item.status === "pending") {
      await pushAll(env, { title: "Un video aspetta il tuo ok", body: item.title || "Nuova storia pronta", url: "/#approva", urgent: true });
    }
  }
  if (event.calendar) {
    for (const day of [].concat(event.calendar)) {
      state.calendar = state.calendar.filter((c) => c.date !== day.date).concat(day);
    }
    state.calendar.sort((a, b) => a.date.localeCompare(b.date));
  }
  if (event.stats) state.stats = { ...(state.stats || {}), ...event.stats, updated_at: now };
  if (event.status === "error" && event.dept) {
    await pushAll(env, { title: "Un reparto si è fermato", body: `${event.dept}: ${clip(event.task || event.output, 120)}`, url: "/", urgent: true });
  }
  await saveState(env, state);
  return state;
}

async function dispatch(env, workflow, inputs = {}) {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPOSITORY) return 0;
  const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "lanternfox-office", "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main", inputs }),
  });
  return response.status;
}


// ---------------------------------------------------------------- sveglia (Durable Object)
// I Cron Trigger nuovi di Cloudflare a volte non scattano: la sveglia vera è un allarme del
// Durable Object, che si riarma da solo. Ogni giorno all'ora DAILY_HOUR_UTC avvia la catena.
const HOUR = 3600000;

function nextDaily(ms, hour) {
  const d = new Date(ms);
  const at = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hour, 0, 0);
  return at > ms + 1000 ? at : at + 24 * HOUR;
}

export class Clock extends DurableObject {
  hour() {
    return Number(this.env.DAILY_HOUR_UTC || 6);
  }

  async arm() {
    const next = await this.ctx.storage.get("nextDaily");
    const tests = (await this.ctx.storage.get("tests")) || [];
    const at = Math.min(next, ...tests.map((t) => t.at));
    if ((await this.ctx.storage.getAlarm()) !== at) await this.ctx.storage.setAlarm(at);
    return { nextDaily: new Date(next).toISOString(), pendingTests: tests.length };
  }

  async ensure() {
    const next = await this.ctx.storage.get("nextDaily");
    if (!next || next < Date.now() - 2 * HOUR) await this.ctx.storage.put("nextDaily", nextDaily(Date.now(), this.hour()));
    return this.arm();
  }

  async addTest(at, message) {
    const tests = ((await this.ctx.storage.get("tests")) || []).slice(-4);
    tests.push({ at, message });
    await this.ctx.storage.put("tests", tests);
    await this.ensure();
    return at;
  }

  async alarm() {
    const now = Date.now();
    const tests = (await this.ctx.storage.get("tests")) || [];
    await this.ctx.storage.put("tests", tests.filter((t) => t.at > now + 1000));
    for (const t of tests.filter((t) => t.at <= now + 1000)) await pushAll(this.env, t.message);
    const next = await this.ctx.storage.get("nextDaily");
    if (!next || next <= now + 1000) {
      const status = await dispatch(this.env, "daily.yml");
      const state = await loadState(this.env);
      state.clock = { at: new Date(now).toISOString(), github: status };
      state.log.push({ at: new Date(now).toISOString(), dept: "ricerca", status: "idle",
        text: status ? `La sveglia ha avviato la catena (GitHub ${status})` : "La sveglia è suonata: la catena non è ancora collegata" });
      await saveState(this.env, state);
      await this.ctx.storage.put("nextDaily", nextDaily(now + 60000, this.hour()));
    }
    await this.arm();
  }
}

const clock = (env) => env.CLOCK.get(env.CLOCK.idFromName("lanternfox"));


export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(clock(env).ensure()); // il Cron Trigger, se scatta, si limita a riarmare la sveglia
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // /favicon.ico: i browser lo chiedono da soli; rispondiamo con la lanterna in PNG
    const asset = ASSETS[url.pathname === "/favicon.ico" ? "/favicon" + ".png" : url.pathname];
    if (asset) {
      const bytes = Uint8Array.from(atob(asset[1]), (c) => c.charCodeAt(0));
      return new Response(bytes, { headers: { ...SECURITY, "Content-Type": asset[0], "Cache-Control": "public, max-age=604800, immutable" } });
    }
    if (url.pathname === "/manifest.webmanifest") {
      return new Response(MANIFEST, { headers: { ...SECURITY, "Content-Type": "application/manifest+json" } });
    }
    if (url.pathname === "/sw.js") {
      return new Response(SW, { headers: { ...SECURITY, "Content-Type": "text/javascript", "Cache-Control": "no-cache" } });
    }

    // Chi lavora (routine di Claude, GitHub Actions) scrive qui con il segreto dello studio.
    if (request.method === "POST" && ["/events", "/push/send", "/timer/test"].includes(url.pathname)) {
      if (!(await bearerOk(request, env))) return json({ error: "non autorizzato" }, 401);
      if (url.pathname === "/events") {
        try {
          const events = [].concat(await request.json());
          let state;
          for (const e of events) state = await applyEvent(env, e);
          return json({ ok: true, updated_at: state.updated_at });
        } catch (err) {
          return json({ error: String(err.message || err) }, 400);
        }
      }
      if (url.pathname === "/push/send") return json(await pushAll(env, await request.json()));
      return json({ clock: await clock(env).ensure() });
    }

    if (!env.PASSWORD) return html("Password non configurata", 500);
    const token = await sessionToken(env.PASSWORD);

    if (url.pathname === "/login" && request.method === "POST") {
      const form = await request.formData();
      if (await same(String(form.get("password") || ""), env.PASSWORD)) {
        return new Response(null, { status: 303, headers: { ...SECURITY, Location: "/",
          "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax` } });
      }
      return loginPage("Password sbagliata, riprova.");
    }
    if (url.pathname === "/esci") {
      return new Response(null, { status: 303, headers: { ...SECURITY, Location: "/",
        "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
    }

    const logged = await same(cookieValue(request), token);
    if (!logged) {
      if (url.pathname === "/" || url.pathname === "/index.html") return loginPage("");
      return json({ error: "accesso richiesto" }, 401);
    }

    if (url.pathname === "/state.json") {
      ctx.waitUntil(clock(env).ensure());
      const state = await loadState(env);
      state.devices = (await subscriptions(env)).length;
      return json(state);
    }
    if (url.pathname === "/approve" && request.method === "POST") {
      const { id, decision, note } = await request.json();
      if (!["approved", "redo"].includes(decision)) return json({ error: "decisione non valida" }, 400);
      const state = await loadState(env);
      const item = state.queue.find((q) => q.id === id);
      if (!item) return json({ error: "video non trovato" }, 404);
      item.status = decision;
      item.note = clip(note, 400);
      item.decided_at = new Date().toISOString();
      const github = decision === "approved" ? await dispatch(env, "publish.yml", { id }) : await dispatch(env, "redo.yml", { id, note: item.note });
      state.departments.revisione = { status: "done", task: decision === "approved" ? `Approvato: ${item.title}` : `Da rifare: ${item.note || item.title}`,
        output: "", updated_at: item.decided_at };
      state.log.push({ at: item.decided_at, dept: "revisione", status: "done",
        text: decision === "approved" ? `Hai approvato "${item.title}"` : `Hai chiesto di rifare "${item.title}"` });
      await saveState(env, state);
      return json({ ok: true, github });
    }
    if (url.pathname.startsWith("/push/")) {
      if (url.pathname === "/push/key") return json({ key: (await vapidKeys(env)).publicKey });
      if (request.method !== "POST") return json({ error: "metodo non valido" }, 405);
      if (url.pathname === "/push/subscribe") {
        const sub = await request.json();
        if (!sub || !sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return json({ error: "iscrizione non valida" }, 400);
        const subs = (await subscriptions(env)).filter((s) => s.endpoint !== sub.endpoint);
        subs.push({ endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
        await env.DATA.put("push_subs", JSON.stringify(subs.slice(-10)));
        return json({ ok: true, devices: Math.min(subs.length, 10) });
      }
      if (url.pathname === "/push/test") {
        const { minutes = 0 } = await request.json().catch(() => ({}));
        const wait = Math.max(0, Math.min(30, Number(minutes) || 0));
        const message = { title: "La lanterna è accesa",
          body: wait ? `Notifica di prova arrivata dopo ${wait} ${wait === 1 ? "minuto" : "minuti"}: la sveglia funziona.` : "Le notifiche funzionano: qui arriveranno i video da approvare.", url: "/" };
        if (!wait) return json(await pushAll(env, message));
        const at = await clock(env).addTest(Date.now() + wait * 60000, message);
        return json({ scheduled: new Date(at).toISOString(), devices: (await subscriptions(env)).length });
      }
      return json({ error: "sconosciuto" }, 404);
    }
    if (url.pathname === "/" || url.pathname === "/index.html") return html(PAGE);
    return json({ error: "pagina non trovata" }, 404);
  },
};
