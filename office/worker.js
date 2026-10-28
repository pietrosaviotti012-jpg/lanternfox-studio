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

// The publishing routine gets its own key: it can only read the approved videos and mark them published.
async function publishOk(request, env) {
  const auth = request.headers.get("Authorization") || "";
  return (Boolean(env.PUBLISH_KEY) && (await same(auth, `Bearer ${env.PUBLISH_KEY}`))) || bearerOk(request, env);
}
const PLATFORMS = ["instagram", "youtube"];   // sent by the routine; TikTok by hand until the TikTok app passes review (then add "tiktok")
const sent = (p) => p?.url || p?.draft;

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
    ideas: [],    // { id, text, at, status: sent|making|ready|error, video? }: the videos the user asked for from the Office
    // community: seen = comment ids already handled; log = { at, platform, author, text, action: replied|dm|flagged|hidden|skipped, reply };
    // pending = critiques the user decides on: { id, platform, author, text, proposal, at, status: waiting|approved|dismissed|sent }
    community: { seen: [], log: [], pending: [] },
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
  state.ideas = state.ideas.slice(-12);
  const c = state.community;
  const open = (p) => p.status === "waiting" || p.status === "approved";
  c.seen = c.seen.slice(-600); c.log = c.log.slice(-60);
  c.pending = c.pending.filter(open).concat(c.pending.filter((p) => !open(p)).slice(-10));
  await env.DATA.put("state", JSON.stringify(state));
}

function clip(text, n) {
  return String(text ?? "").slice(0, n);
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
    const idea = item.request && state.ideas.find((i) => i.id === item.request);
    if (idea) Object.assign(idea, { status: "ready", video: item.id, title: item.title });
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

// Claude routines started on demand through their /fire endpoint: PUBLISH ("Pubblica adesso") and REDO ("Rifai").
// ROUTINE_<which>_ID is a plain variable, ROUTINE_<which>_TOKEN a secret; without them the button only records the choice.
// ---------------------------------------------------------------- YouTube, with the user's own Google project
// Composio's shared Google project runs out of daily uploads, so the Office uploads itself:
// YT_CLIENT_ID / YT_CLIENT_SECRET are the OAuth client, the refresh token arrives in KV after "Collega YouTube".
const YT_SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl";
const ytRedirect = (env) => `${env.OFFICE_URL}/youtube/callback`;

async function youtubeToken(env) {
  const refresh = await env.DATA.get("yt_refresh");
  if (!refresh || !env.YT_CLIENT_ID || !env.YT_CLIENT_SECRET) return null;
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, refresh_token: refresh, grant_type: "refresh_token" }) });
  return (await r.json().catch(() => ({}))).access_token || null;
}

// resumable upload: the film is streamed from the GitHub release straight to YouTube, never held in memory
async function youtubeUpload(env, item) {
  const token = await youtubeToken(env);
  if (!token) throw new Error("YouTube non è collegato: nell'ufficio apri le impostazioni e premi Collega YouTube");
  const film = await fetch(item.preview_url, { redirect: "follow" });
  const size = Number(film.headers.get("Content-Length"));
  if (!film.ok || !size) throw new Error(`il film non si scarica (${film.status})`);
  const meta = {
    snippet: { title: clip(`${item.title} 🦊 #shorts`, 100), description: item.caption || "", categoryId: "1",
      tags: ["bedtime story", "paper cut animation", "animated story", "shorts"] },
    status: { privacyStatus: "public", selfDeclaredMadeForKids: false, containsSyntheticMedia: true },
  };
  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST", body: JSON.stringify(meta),
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": String(size) } });
  if (!init.ok) throw new Error(`YouTube ${init.status}: ${clip(await init.text(), 200)}`);
  const { readable, writable } = new FixedLengthStream(size);
  film.body.pipeTo(writable);
  const put = await fetch(init.headers.get("Location"), { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: readable });
  const done = await put.json().catch(() => ({}));
  if (!put.ok || !done.id) throw new Error(`YouTube ${put.status}: ${clip(JSON.stringify(done.error || done), 200)}`);
  return `https://youtube.com/shorts/${done.id}`;
}

async function fireRoutine(env, which, text) {
  const id = env[`ROUTINE_${which}_ID`], token = env[`ROUTINE_${which}_TOKEN`];
  if (!id || !token) return 0;
  const response = await fetch(`https://api.anthropic.com/v1/claude_code/routines/${id}/fire`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "anthropic-beta": "experimental-cc-routine-2026-04-01",
      "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify(text ? { text } : {}),
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
    // —— public pages the platforms ask for when registering a developer app (TikTok, Meta) ——
    if (url.pathname === "/privacy" || url.pathname === "/terms") {
      const privacy = url.pathname === "/privacy";
      const body = privacy
        ? `<h1>Privacy policy</h1><p>Lantern Fox Tales is a small studio that publishes its own short animated stories on TikTok, Instagram and YouTube.</p>
           <p>This app is used only by the studio owner to upload the studio's own videos to the studio's own accounts. It does not collect, store, sell or share data about other people.</p>
           <p>The access tokens granted by the platforms are kept by the connection provider (Composio) and used only to publish the studio's videos and read their basic statistics. They can be revoked at any time from the platform's settings.</p>
           <p>Contact: through the Lantern Fox Tales profiles.</p>`
        : `<h1>Terms of service</h1><p>This app is a private publishing tool used only by Lantern Fox Tales to upload its own original animated videos to its own social accounts.</p>
           <p>It is not offered to the public. Content is original or in the public domain, and AI-assisted videos are labelled as such where the platforms provide it.</p>`;
      return html(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lantern Fox Tales · ${privacy ? "Privacy" : "Terms"}</title>
        <style>body{max-width:640px;margin:40px auto;padding:0 16px;font:17px/1.6 Georgia,serif;color:#1a1d2a;background:#fbf3e2}h1{font-size:1.6rem}</style></head><body>${body}<p style="color:#666;font-size:.9rem">Last updated 28 October 2026.</p></body></html>`);
    }

    // —— community routine: YouTube comments through the user's Google project, the log, and the critiques the user decides on ——
    if (url.pathname.startsWith("/community/") && url.pathname !== "/community/decide") {
      if (!(await publishOk(request, env))) return json({ error: "non autorizzato" }, 401);
      const state = await loadState(env);
      const c = state.community;
      const yt = async (path, init = {}) => {
        const token = await youtubeToken(env);
        if (!token) throw new Error("YouTube non è collegato");
        const r = await fetch(`https://www.googleapis.com/youtube/v3/${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
        const j = r.status === 204 ? {} : await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(`YouTube ${r.status}: ${clip(JSON.stringify(j.error || j), 200)}`);
        return j;
      };
      try {
        // what the routine needs: comments already handled, replies the user approved, and tomorrow's story for STORY
        if (url.pathname === "/community/context") {
          const today = new Date().toISOString().slice(0, 10);
          const planned = state.calendar.find((d) => d.date > today && d.status === "planned");
          const next = [...state.queue].reverse().find((q) => q.status !== "published");
          return json({ seen: c.seen, approved: c.pending.filter((p) => p.status === "approved"),
            tomorrow: planned ? { title: planned.title } : next ? { title: next.title, caption: next.caption } : null });
        }
        if (url.pathname === "/community/youtube/comments") {
          const ch = JSON.parse((await env.DATA.get("yt_channel")) || "null");
          if (!ch?.id) throw new Error("YouTube non è collegato");
          const j = await yt(`commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=${ch.id}&order=time&maxResults=50&textFormat=plainText`);
          const items = (j.items || []).map((t) => {
            const s = t.snippet.topLevelComment.snippet;
            return { id: t.snippet.topLevelComment.id, video: t.snippet.videoId, author: s.authorDisplayName, author_channel: s.authorChannelId?.value,
              text: s.textOriginal, at: s.publishedAt, answered: (t.replies?.comments || []).some((r) => r.snippet.authorChannelId?.value === ch.id) };
          }).filter((i) => i.author_channel !== ch.id && !c.seen.includes("yt:" + i.id));
          return json({ channel: ch.title, items });
        }
        if (request.method !== "POST") return json({ error: "metodo non valido" }, 405);
        const body = await request.json().catch(() => ({}));
        if (url.pathname === "/community/youtube/reply") {
          const j = await yt("comments?part=snippet", { method: "POST", body: JSON.stringify({ snippet: { parentId: body.id, textOriginal: clip(body.text, 1000) } }) });
          return json({ ok: true, id: j.id });
        }
        if (url.pathname === "/community/youtube/hide") {
          await yt(`comments/setModerationStatus?id=${encodeURIComponent(body.id)}&moderationStatus=heldForReview`, { method: "POST" });
          return json({ ok: true });
        }
        // one entry per comment handled; "flagged" ones wait for the user in Approva
        if (url.pathname === "/community/log") {
          const now = new Date().toISOString();
          const items = [].concat(body.items || []);
          for (const e of items) {
            const key = `${e.platform === "youtube" ? "yt" : "ig"}:${e.id}`;
            if (!c.seen.includes(key)) c.seen.push(key);
            const entry = { at: now, platform: e.platform, author: clip(e.author, 60), text: clip(e.text, 300), action: e.action, reply: clip(e.reply, 300) };
            c.log.push(entry);
            if (e.action === "flagged" && !c.pending.some((p) => p.id === key)) c.pending.push({ id: key, platform: e.platform, author: entry.author, text: entry.text, proposal: entry.reply, at: now, status: "waiting" });
            const p = c.pending.find((x) => x.id === key && x.status === "approved");
            if (p && e.action === "replied") p.status = "sent";
          }
          const n = (a) => items.filter((e) => e.action === a).length;
          const text = [n("replied") && `${n("replied")} risposte`, n("dm") && `${n("dm")} messaggi STORY`, n("hidden") && `${n("hidden")} nascosti`,
            n("flagged") && `${n("flagged")} da guardare`].filter(Boolean).join(", ") || "nessun commento nuovo";
          const waiting = c.pending.some((p) => p.status === "waiting");
          state.departments.community = { status: waiting ? "waiting" : "done", task: `Giro dei commenti: ${text}`, output: "", updated_at: now };
          state.log.push({ at: now, dept: "community", status: "done", text: `Ada ha fatto il giro dei commenti: ${text}` });
          await saveState(env, state);
          if (n("flagged")) await pushAll(env, { title: "Un commento aspetta te", body: `${n("flagged")} da guardare in Approva`, url: "/#approva" });
          return json({ ok: true });
        }
        return json({ error: "percorso sconosciuto" }, 404);
      } catch (err) { return json({ ok: false, error: clip(err.message, 300) }, 502); }
    }

    // —— YouTube: the routine asks, the Office uploads with the user's own Google project and returns the link ——
    if (url.pathname === "/publish/youtube" && request.method === "POST") {
      if (!(await publishOk(request, env))) return json({ error: "non autorizzato" }, 401);
      const { id } = await request.json().catch(() => ({}));
      const item = (await loadState(env)).queue.find((q) => q.id === id && q.status === "approved");
      if (!item) return json({ error: "video non approvato o non trovato" }, 404);
      try { return json({ ok: true, url: await youtubeUpload(env, item) }); }
      catch (err) { return json({ ok: false, error: clip(err.message, 300) }, 502); }
    }

    // —— publishing routine: what is approved and waiting, and "done" reports per platform ——
    if (url.pathname === "/publish/queue" || url.pathname === "/publish/done") {
      if (!(await publishOk(request, env))) return json({ error: "non autorizzato" }, 401);
      const state = await loadState(env);
      if (url.pathname === "/publish/queue") {
        const items = state.queue.filter((q) => q.status === "approved" && PLATFORMS.some((p) => !sent(q.published?.[p])));
        return json({ platforms: PLATFORMS, items: items.map(({ id, title, caption, preview_url, cover_url, published }) => ({ id, title, caption, preview_url, cover_url, published: published || {} })) });
      }
      if (request.method !== "POST") return json({ error: "metodo non valido" }, 405);
      const { id, platform, url: link, error, draft } = await request.json();
      const item = state.queue.find((q) => q.id === id);
      if (!item || !PLATFORMS.concat("tiktok").includes(platform)) return json({ error: "video o piattaforma non validi" }, 400);
      const now = new Date().toISOString();
      item.published = { ...(item.published || {}), [platform]: error ? { error: clip(error, 300), at: now } : draft ? { draft: true, at: now } : { url: clip(link, 400), at: now } };
      const name = { instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok" }[platform];
      state.log.push({ at: now, dept: "pubblicazione", status: error ? "error" : "done", text: error ? `${name}: non pubblicato (${clip(error, 120)})` : draft ? `${name}: "${item.title}" è nelle bozze, da pubblicare dall'app` : `Uscito su ${name}: "${item.title}"` });
      const done = PLATFORMS.every((p) => sent(item.published[p]));
      if (done) {
        item.status = "published";
        const date = now.slice(0, 10);
        state.calendar = state.calendar.filter((c) => c.date !== date).concat({ date, title: item.title, status: "published" });
        state.calendar.sort((a, b) => a.date.localeCompare(b.date));
      }
      state.departments.pubblicazione = { status: error ? "error" : done ? "done" : "working", task: error ? `${name}: ${clip(error, 200)}` : done ? `Pubblicato: ${item.title}` : draft ? `${name}: nelle bozze` : `Pubblicato su ${name}`, output: "", updated_at: now };
      await saveState(env, state);
      await pushAll(env, error ? { title: `${name}: pubblicazione non riuscita`, body: clip(error, 120), url: "/", urgent: true }
        : draft ? { title: `${name}: video nelle bozze`, body: `Apri TikTok e pubblica "${item.title}"`, url: "/" } : { title: `Uscito su ${name}`, body: item.title, url: link || "/" });
      return json({ ok: true, published: done });
    }

    // the production routine (in the cloud, with the publishing key) lights departments 1-4 and the calendar;
    // nothing else of /events is open to that key
    if (url.pathname === "/chain/events" && request.method === "POST") {
      if (!(await publishOk(request, env))) return json({ error: "non autorizzato" }, 401);
      const allowed = ["ricerca", "soggetto", "copione", "regia"];
      const events = [].concat(await request.json().catch(() => [])).map((e) => e.calendar ? { calendar: e.calendar }
        : allowed.includes(e.dept) ? { dept: e.dept, status: e.status, task: e.task, output: e.output } : null).filter(Boolean);
      for (const e of events) await applyEvent(env, e);
      return json({ ok: true, applied: events.length });
    }

    if (request.method === "POST" && ["/events", "/push/send", "/timer/test", "/routine/test"].includes(url.pathname)) {
      if (!(await bearerOk(request, env))) return json({ error: "non autorizzato" }, 401);
      // checks that a routine starts: PUBLISH by default (with nothing approved it does nothing), or REDO with {which, text}
      if (url.pathname === "/routine/test") {
        const body = await request.json().catch(() => ({}));
        const which = body.which === "REDO" ? "REDO" : "PUBLISH";
        return json({ status: await fireRoutine(env, which, which === "REDO" ? clip(body.text, 500) : "Prova del tasto Pubblica adesso") });
      }
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

    // the film and its cover, served from here: GitHub hands release files out as downloads
    // (application/octet-stream, attachment, nosniff), which Safari refuses to play in a <video>
    const media = url.pathname.match(/^\/media\/([\w-]+)\/(film\.mp4|poster\.jpg)$/);
    if (media) {
      const item = (await loadState(env)).queue.find((q) => q.id === media[1]);
      const src = item && (media[2] === "film.mp4" ? item.preview_url : item.cover_url);
      if (!src || !src.startsWith("https://github.com/")) return json({ error: "file non trovato" }, 404);
      // the whole file is kept in Cloudflare's cache, keyed by its GitHub address and the render time (a "Rifai" reuses the address):
      // GitHub is asked once, then every piece the player wants comes straight from the edge
      const type = media[2] === "film.mp4" ? "video/mp4" : "image/jpeg";
      const key = new Request(`https://media.lanternfox/${encodeURIComponent(src)}?v=${encodeURIComponent(item.created_at || "")}`);
      const cache = caches.default;
      let whole = await cache.match(key);
      if (!whole) {
        const up = await fetch(src, { redirect: "follow" });
        if (!up.ok) return json({ error: "file non raggiungibile" }, 502);
        whole = new Response(await up.arrayBuffer(), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=604800" } });
        ctx.waitUntil(cache.put(key, whole.clone()));
      }
      const body = await whole.arrayBuffer(), size = body.byteLength;
      const headers = { ...SECURITY, "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=86400" };
      const r = (request.headers.get("Range") || "").match(/^bytes=(\d*)-(\d*)$/);
      if (r && (r[1] || r[2])) {
        let start = r[1] ? Number(r[1]) : Math.max(0, size - Number(r[2]));
        let end = r[1] && r[2] ? Math.min(Number(r[2]), size - 1) : size - 1;
        if (start >= size || start > end) return new Response(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
        return new Response(body.slice(start, end + 1), { status: 206,
          headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
      }
      return new Response(body, { headers: { ...headers, "Content-Length": String(size) } });
    }

    if (url.pathname === "/state.json") {
      ctx.waitUntil(clock(env).ensure());
      const state = await loadState(env);
      state.devices = (await subscriptions(env)).length;
      state.publish_at_utc = String(env.PUBLISH_AT_UTC || "22").split(",").map(Number);   // the publishing slots (UTC hours)
      state.youtube = JSON.parse((await env.DATA.get("yt_channel")) || "null");
      return json(state);
    }
    // "Collega YouTube": Google's consent page, then back here with a code that becomes the refresh token
    if (url.pathname === "/youtube/connect") {
      if (!env.YT_CLIENT_ID) return json({ error: "manca YT_CLIENT_ID" }, 500);
      const st = crypto.randomUUID();
      await env.DATA.put("yt_state", st, { expirationTtl: 900 });
      const q = new URLSearchParams({ client_id: env.YT_CLIENT_ID, redirect_uri: ytRedirect(env), response_type: "code",
        scope: YT_SCOPES, access_type: "offline", prompt: "consent", include_granted_scopes: "true", state: st });
      return new Response(null, { status: 302, headers: { ...SECURITY, Location: `https://accounts.google.com/o/oauth2/v2/auth?${q}` } });
    }
    if (url.pathname === "/youtube/callback") {
      const page = (msg) => new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>YouTube</title><body style="font:17px/1.5 system-ui;background:#0a1330;color:#f3e6cf;padding:40px 20px;text-align:center">
        <p>${msg}</p><p><a href="/" style="color:#ffb862">Torna all'ufficio</a></p></body>`, { headers: { ...SECURITY, "Content-Type": "text/html; charset=utf-8" } });
      const code = url.searchParams.get("code");
      if (!code || url.searchParams.get("state") !== (await env.DATA.get("yt_state"))) return page("Collegamento non riuscito: riprova da Collega YouTube.");
      const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code, client_id: env.YT_CLIENT_ID, client_secret: env.YT_CLIENT_SECRET, redirect_uri: ytRedirect(env), grant_type: "authorization_code" }) });
      const tok = await r.json().catch(() => ({}));
      if (!tok.refresh_token) return page(`Google non ha dato l'accesso (${esc(tok.error_description || tok.error || r.status)}). Riprova.`);
      await env.DATA.put("yt_refresh", tok.refresh_token);
      const ch = await (await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
        { headers: { Authorization: `Bearer ${tok.access_token}` } })).json().catch(() => ({}));
      const channel = { title: ch.items?.[0]?.snippet?.title || "?", id: ch.items?.[0]?.id || "", at: new Date().toISOString() };
      await env.DATA.put("yt_channel", JSON.stringify(channel));
      return page(`YouTube collegato al canale <b>${esc(channel.title)}</b>. Da ora i video li carica l'ufficio.`);
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
      // approved videos wait for the publishing routine's slot (PUBLISH_AT_UTC); "redo" starts the Regia routine with the note
      const started = decision === "redo" ? await fireRoutine(env, "REDO", `id: ${id}\nnote: ${item.note}`) : 0;
      const redoOk = started >= 200 && started < 300;
      state.departments.revisione = { status: "done", task: decision === "approved" ? `Approvato: ${item.title}` : `Da rifare: ${item.note || item.title}`,
        output: "", updated_at: item.decided_at };
      if (decision === "redo") state.departments.regia = { status: redoOk ? "working" : "error",
        task: redoOk ? `Rifaccio "${item.title}": ${clip(item.note, 160)}` : "Non riesco ad avviare il rifacimento: controlla la routine Regia", output: "", updated_at: item.decided_at };
      state.log.push({ at: item.decided_at, dept: "revisione", status: "done",
        text: decision === "approved" ? `Hai approvato "${item.title}": esce all'orario di pubblicazione` : `Hai chiesto di rifare "${item.title}"` });
      await saveState(env, state);
      return json({ ok: true, started: decision === "redo" ? redoOk : undefined });
    }
    // "Chiedi un video": an idea of the user's goes to the Regia routine, which writes the story, draws it and starts the render
    // the user's decision on a flagged comment: the proposed (or edited) reply goes out at the next round, or nothing
    if (url.pathname === "/community/decide" && request.method === "POST") {
      const { id, decision, reply } = await request.json();
      const state = await loadState(env);
      const p = state.community.pending.find((x) => x.id === id && x.status === "waiting");
      if (!p || !["approved", "dismissed"].includes(decision)) return json({ error: "commento non trovato" }, 404);
      p.status = decision;
      if (reply) p.proposal = clip(reply, 300);
      const now = new Date().toISOString();
      if (!state.community.pending.some((x) => x.status === "waiting")) state.departments.community = { ...state.departments.community, status: "done", updated_at: now };
      state.log.push({ at: now, dept: "community", status: "done",
        text: decision === "approved" ? `Risposta a ${p.author} approvata: parte al prossimo giro` : `Commento di ${p.author} lasciato senza risposta` });
      await saveState(env, state);
      return json({ ok: true });
    }
    if (url.pathname === "/idea" && request.method === "POST") {
      const text = clip(String((await request.json()).text || "").trim(), 600);
      if (text.length < 8) return json({ error: "scrivi un'idea un po' più lunga" }, 400);
      const state = await loadState(env);
      const now = new Date().toISOString();
      const idea = { id: "idea-" + now.replace(/\D/g, "").slice(0, 14), text, at: now, status: "sent" };
      const started = await fireRoutine(env, "REDO", `idea: ${text}\nrequest: ${idea.id}`);
      const ok = started >= 200 && started < 300;
      idea.status = ok ? "making" : "error";
      state.ideas.push(idea);
      state.departments.soggetto = { status: ok ? "working" : "error", task: ok ? `La tua idea: ${clip(text, 160)}` : "Non riesco ad avviare la Regia: controlla la routine", output: "", updated_at: now };
      state.log.push({ at: now, dept: "soggetto", status: ok ? "working" : "error", text: ok ? `Hai chiesto un video: "${clip(text, 120)}"` : "La tua idea non è partita" });
      await saveState(env, state);
      return json({ ok, idea }, ok ? 200 : 502);
    }
    // "Pubblica adesso": an approved video goes out now instead of waiting for the evening slot
    if (url.pathname === "/publish/now" && request.method === "POST") {
      const { id } = await request.json();
      const state = await loadState(env);
      const item = state.queue.find((q) => q.id === id && q.status === "approved");
      if (!item) return json({ error: "video non approvato o non trovato" }, 404);
      const started = await fireRoutine(env, "PUBLISH", `Pubblica adesso: ${id}`);
      const ok = started >= 200 && started < 300;
      const now = new Date().toISOString();
      state.departments.pubblicazione = { status: ok ? "working" : "error", task: ok ? `Pubblico adesso: ${item.title}` : "Non riesco ad avviare la pubblicazione: controlla la routine",
        output: "", updated_at: now };
      if (ok) state.log.push({ at: now, dept: "pubblicazione", status: "working", text: `Hai chiesto di pubblicare subito "${item.title}"` });
      await saveState(env, state);
      return json({ ok, status: started }, ok ? 200 : 502);
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
