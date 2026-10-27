# Lantern Fox Studio

Lo studio che ogni giorno produce e pubblica una piccola storia animata in carta intagliata per
[@lanternfoxtales](https://www.youtube.com/@lanternfoxtales) su YouTube, Instagram e TikTok.

- `office/`: l'Ufficio, un villaggio di carta in 3D (three.js) su un Cloudflare Worker. Ogni casetta è un reparto;
  la finestra si accende quando lavora. Dentro: il video di oggi, la coda di approvazione, il calendario, i numeri.
- `REPARTI.md`: i 13 reparti della catena e gli strumenti di ciascuno.
- `brand/`: identità, foto profilo e regole del marchio.

## Ufficio

```bash
node office/dev.mjs        # anteprima locale con dati d'esempio, http://localhost:8787
node office/deploy.mjs     # pubblica su Cloudflare (servono le chiavi nel file .env, mai nel repository)
```

Chi lavora scrive lo stato con `POST /events` e il segreto dello studio:

```json
{ "dept": "copione", "status": "working", "task": "Scrivo l'aggancio" }
```

Stati: `idle`, `working`, `done`, `waiting`, `error`. Altri campi: `video`, `queue` (un video da approvare), `calendar`, `stats`, `reset`.
