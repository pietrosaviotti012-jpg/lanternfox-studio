# Routine "Pubblicazione" — il manuale

Gira ogni giorno alle 16:00 e alle 22:00 UTC (17:00 e 23:00 in Italia d'inverno, 11:00 e 17:00 a New York). Pubblica su Instagram e YouTube i video che
l'utente ha approvato nell'Ufficio con "Pubblica".

**Una sola storia per giro**, così le due del giorno escono a ore diverse:
- se il prompt ha un blocco routine-fire-payload "Pubblica adesso: <id>", pubblica quella;
- altrimenti la prima della coda, cioè la più vecchia fra le approvate;
- fa eccezione una storia già uscita su una piattaforma e non sull'altra: finiscila prima di cominciarne una nuova. TikTok per ora lo pubblica l'utente a mano: l'app TikTok non è verificata
(errore `unaudited_client_can_only_post_to_private_accounts`, e le bozze restano ferme in `PROCESSING_UPLOAD`).
Il passo 3b vale solo quando la coda elenca `tiktok` in `platforms`.

I valori `OFFICE_URL` e `PUBLISH_KEY` sono nel prompt della routine. La chiave può solo leggere la coda e segnare i video come pubblicati. Non scriverle mai in file, commit o messaggi.

## 1. Leggi la coda (dal banco di lavoro di Composio)
L'ambiente della routine non può raggiungere l'Ufficio (il proxy rifiuta workers.dev); il `COMPOSIO_REMOTE_WORKBENCH` sì.
Quindi **tutte** le chiamate all'Ufficio si fanno da lì, in Python, con `OFFICE_URL` e `PUBLISH_KEY` scritti nella cella:
```python
import requests
OFFICE_URL, PUBLISH_KEY = "…", "…"   # i valori del prompt della routine
H = {"Authorization": "Bearer " + PUBLISH_KEY, "User-Agent": "lanternfox-routine"}
# "Pubblica adesso: <id>" nel prompt: chiedi solo quella storia; giro programmato: la coda normale
NOW_ID = None   # oppure l'id del blocco "Pubblica adesso"
queue = requests.get(OFFICE_URL + "/publish/queue", headers=H, params={"for": NOW_ID} if NOW_ID else {}, timeout=30).json()
print([(i["id"], i["title"], list(i["published"])) for i in queue["items"]])
```
Risposta: `{"items": [{id, title, caption, preview_url, cover_url, published: {instagram?, youtube?, tiktok?}}]}`. Se `items` è vuoto, hai finito: scrivi "Niente da pubblicare oggi" e chiudi.

Per la storia scelta, salta le piattaforme dove `published.<piattaforma>` ha già `url` oppure `draft`: vuol dire che è stata fatta in un giro precedente.

**Mai due volte lo stesso video.** Una storia con "Pubblica adesso" sparisce dalla coda del giro programmato per 2 ore. In più, **prima di Instagram (e di TikTok)** chiedi il permesso all'Ufficio:
```python
ok = requests.post(OFFICE_URL + "/publish/done", headers=H, params={"claim": 1}, json={"id": ID, "platform": "instagram"}, timeout=30)
# 200 {"ok": true}: pubblica.  409 {"ok": false, "error": "già pubblicato…" | "un altro giro lo sta già pubblicando"}: NON pubblicare, passa oltre.
```
YouTube chiede il permesso da solo: se `/publish/youtube` risponde 409, non riprovare e non segnalarlo come errore.

## 2. Instagram (connettore Composio, account `instagram_sain-curr`, ig_user_id `40769843119273114`)
1. `INSTAGRAM_POST_IG_USER_MEDIA` con `ig_user_id`, `media_type: "REELS"`, `video_url: preview_url`, `caption: caption`, `share_to_feed: true`, `cover_url: cover_url`. Restituisce l'`id` del contenitore.
2. Controlla `INSTAGRAM_GET_POST_STATUS` con `creation_id` ogni 5 secondi, finché `status_code` è `FINISHED` (di solito in circa 30 secondi). Se è `ERROR`, segnala l'errore.
3. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` con `ig_user_id`, `creation_id`, `max_wait_seconds: 120`: ottieni l'id del post.
4. `INSTAGRAM_GET_IG_MEDIA` con quell'id e `fields: "permalink"` ti dà il link.

## 3. YouTube (lo carica l'Ufficio, con il progetto Google dell'utente)
Composio per YouTube NON si usa più: il suo progetto Google condiviso esaurisce la quota giornaliera di caricamenti.
Il caricamento lo fa l'Ufficio; dal banco di lavoro basta chiederlo (può durare 1-2 minuti):
```python
y = requests.post(OFFICE_URL + "/publish/youtube", headers=H, json={"id": ID}, timeout=300).json()
# {"ok": true, "url": "https://youtube.com/shorts/…"}  oppure  {"ok": false, "error": "…"}
```
Poi segnala come sempre al passo 4 (con `y["url"]` oppure con `y["error"]`).

## 3b. TikTok, nelle bozze (connettore Composio, account `tiktok_upgive-apse` = Lantern Fox Tales)
Nel `COMPOSIO_REMOTE_WORKBENCH`, riusando il file già caricato per YouTube (`up["s3key"]`; se manca, scaricalo allo stesso modo):
```python
res, err = run_composio_tool("TIKTOK_UPLOAD_VIDEO", {
  "file_to_upload": {"name": "film.mp4", "mimetype": "video/mp4", "s3key": up["s3key"]},
  "publish": False, "is_aigc": True}, account="tiktok_upgive-apse")
```
Se `res["data"]["upload_completed"]` è vero, il video è nelle bozze: segnala `{"id": ID, "platform": "tiktok", "draft": true}`.
Lo stato su TikTok resta `PROCESSING_UPLOAD` finché l'utente non apre la bozza: è normale, non aspettare e non ricaricarlo.

## 4. Segnala all'Ufficio, una piattaforma per volta (sempre dal banco di lavoro)
```python
requests.post(OFFICE_URL + "/publish/done", headers=H, json={"id": ID, "platform": "instagram", "url": PERMALINK}, timeout=30)
# se non è andata:
requests.post(OFFICE_URL + "/publish/done", headers=H, json={"id": ID, "platform": "youtube", "error": "cosa è successo, in breve"}, timeout=30)
```
L'Ufficio aggiorna calendario e diario e manda la notifica all'utente.

## Regole
- Pubblica solo quello che arriva dalla coda: mai altri video, mai su altri account.
- Se una piattaforma fallisce, segnala l'errore e passa all'altra. Al giro successivo si riprova.
- Non modificare file del repository e non fare commit: questa routine pubblica e basta.
- Alla fine scrivi un riassunto in italiano di una riga per video (piattaforma, link oppure errore).
