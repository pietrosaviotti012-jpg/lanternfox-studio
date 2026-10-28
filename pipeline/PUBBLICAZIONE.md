# Routine "Pubblicazione" — il manuale

Gira ogni giorno alle 22:00 UTC (23:00 in Italia d'inverno, 18:00 a New York). Pubblica su Instagram e YouTube i video che
l'utente ha approvato nell'Ufficio con "Pubblica". TikTok per ora lo pubblica l'utente a mano dall'Ufficio.

Le variabili d'ambiente della routine sono `OFFICE_URL` e `PUBLISH_KEY`. La chiave può solo leggere la coda e segnare i video come pubblicati. Non scriverle mai in file, commit o messaggi.

## 1. Leggi la coda
```sh
curl -s -H "Authorization: Bearer $PUBLISH_KEY" -H "User-Agent: lanternfox-routine" "$OFFICE_URL/publish/queue"
```
Risposta: `{"items": [{id, title, caption, preview_url, cover_url, published: {instagram?, youtube?}}]}`. Se `items` è vuoto, hai finito: scrivi "Niente da pubblicare oggi" e chiudi.

Per ogni video, salta le piattaforme dove `published.<piattaforma>.url` c'è già (vuol dire che è uscito in un giro precedente).

## 2. Instagram (connettore Composio, account `instagram_folia-ferly`, ig_user_id `40769843119273114`)
1. `INSTAGRAM_POST_IG_USER_MEDIA` con `ig_user_id`, `media_type: "REELS"`, `video_url: preview_url`, `caption: caption`, `share_to_feed: true`, `cover_url: cover_url`. Restituisce l'`id` del contenitore.
2. Controlla `INSTAGRAM_GET_POST_STATUS` con `creation_id` ogni 5 secondi, finché `status_code` è `FINISHED` (di solito in circa 30 secondi). Se è `ERROR`, segnala l'errore.
3. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` con `ig_user_id`, `creation_id`, `max_wait_seconds: 120`: ottieni l'id del post.
4. `INSTAGRAM_GET_IG_MEDIA` con quell'id e `fields: "permalink"` ti dà il link.

## 3. YouTube (connettore Composio, account `youtube_obley-songo` = canale Lantern Fox Tales; MAI l'altro account)
Nel `COMPOSIO_REMOTE_WORKBENCH`:
```python
import requests
r = requests.get(PREVIEW_URL, timeout=120); open("/home/user/film.mp4", "wb").write(r.content)
up, err = upload_local_file("/home/user/film.mp4")   # → up["s3key"]
res, err = run_composio_tool("YOUTUBE_UPLOAD_VIDEO", {
  "title": TITLE + " 🦊 #shorts", "description": CAPTION, "tags": ["bedtime story", "paper cut animation", "animated story", "shorts"],
  "categoryId": "1", "privacyStatus": "public",
  "videoFilePath": {"name": "film.mp4", "mimetype": "video/mp4", "s3key": up["s3key"]}}, account="youtube_obley-songo")
```
Il link è `https://youtube.com/shorts/<id>`, dove `<id>` è `res["data"]["response_data"]["id"]`.

## 4. Segnala all'Ufficio, una piattaforma per volta
```sh
curl -s -X POST -H "Authorization: Bearer $PUBLISH_KEY" -H "Content-Type: application/json" -H "User-Agent: lanternfox-routine" \
  "$OFFICE_URL/publish/done" -d '{"id":"<id>","platform":"instagram","url":"<permalink>"}'
# se non è andata: -d '{"id":"<id>","platform":"youtube","error":"<cosa è successo, in breve>"}'
```
L'Ufficio aggiorna calendario e diario e manda la notifica all'utente.

## Regole
- Pubblica solo quello che arriva dalla coda: mai altri video, mai su altri account.
- Se una piattaforma fallisce, segnala l'errore e passa all'altra. Al giro successivo si riprova.
- Non modificare file del repository e non fare commit: questa routine pubblica e basta.
- Alla fine scrivi un riassunto in italiano di una riga per video (piattaforma, link oppure errore).
