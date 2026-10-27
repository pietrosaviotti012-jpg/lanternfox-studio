# La catena di Lantern Fox Tales

Questo è il manuale che la routine giornaliera di Claude segue, un reparto dopo l'altro. Ogni reparto è un passo, e dove serve giudizio è un subagente con le sue skill (vedi `REPARTI.md`). Prima di cominciare un reparto e quando ha finito, si avvisa l'ufficio:

```sh
node tools/office.mjs '{"dept":"copione","status":"working","task":"Scrivo l'aggancio"}'
node tools/office.mjs '{"dept":"copione","status":"done","task":"Copione di 13 righe","output":"Every night, he left one window lit…"}'
```

Stati: `working`, `done`, `waiting` (aspetta l'utente), `error` (si è fermato: scrivi perché nel `task`). Ogni mattina il primo evento è `{"reset": true, "video": {"id", "title", "series"}}`.

## Regole fisse (dal marchio, `brand/IDENTITA.md`)
- Stile unico: carta intagliata illuminata da dietro (Lemo-Opuscar `paper-lantern`), verticale 1080×1920, 30-60 s, inglese.
- La volpe con la lanterna è la mascotte: compare in ogni storia almeno per un momento, anche piccola.
- Storie originali o di pubblico dominio (Esopo, Grimm, Andersen, miti). Mai personaggi, marchi o musica di altri.
- Pubblico generale (adulti e ragazzi), non bambini piccoli. Niente paura vera, niente violenza.
- Video segnato come contenuto AI dove la piattaforma lo prevede.

## 1. Ricerca (`ricerca`)
Skill: `trend-spotter`, `content-research`, `reel-analyzer`, `virality`. Guarda cosa sta funzionando nelle storie animate brevi (agent-reach su YouTube Shorts e Reddit). Scrive `research/<data>.md`: 3 formati o temi forti, ognuno con il perché. Massimo 20 minuti.

## 2. Soggetto (`soggetto`)
Skill: `series-planner`, `content-calendar`. Sceglie la storia del giorno, preferibilmente dentro una serie (`series/`). Crea `productions/<data>-<slug>/meta.json` (titolo, serie, episodio, idea in una riga) e aggiorna il calendario dell'ufficio (`{"calendar": {"date", "title", "status": "planned"}}`).

## 3. Copione (`copione`)
Skill: `going-viral`, `viral-hook-writer`, `reel-scripter`, `on-screen-text-writer`. Scrive `script.json`:
- la prima riga è l'aggancio: si capisce nei primi 2-3 secondi e apre una domanda;
- 9-14 righe, 30-55 secondi di voce in tutto; una svolta; un finale che riprende l'inizio;
- ogni riga ha la sua recitazione `act`: `intensity` 0,3 (calmo) … 0,8 (intenso), `pace` 0,35-0,5 (più basso = più lento), `speed` 0,84-0,94, `gain_db` −4 (sussurro) … +1,5 (culmine);
- `gap` dopo ogni riga (0,2-1,3 s): i silenzi prima della svolta contano;
- `music`: l'umore di ogni scena (`calm`, `storm`, `hush`, `rise`, `warm`, `end`).

## 4. Regia (`regia`)
Skill: `lemo-opuscar` (leggi `STYLE.md` di paper-lantern e `DIRECTOR.md`), il tabellone di `launch-video`. Scrive `shots.js` con il kit (`engine/kit/shot.js` + `engine/kit/motifs.js`, esempio completo: `productions/2026-10-28-lighthouse-fox/shots.js`):
- 6-9 inquadrature, ognuna ancorata a una riga (`start: at('L04') - .4`), dissolvenze 0,6-1,2 s;
- almeno quattro movimenti di camera diversi; le azioni forti sulle parole (`E.word('L07', 7)`);
- soggetti nella metà alta dello schermo: dal 66% in giù ci sono sottotitoli e pulsanti delle app;
- se serve un motivo che non c'è (un albero nuovo, una casa), aggiungilo a `engine/kit/motifs.js`, così resta per i giorni dopo.
Controllo: `sh tools/stills.sh <produzione> <cartella> 2 8 15 …` e guarda i fotogrammi prima di andare avanti.

## 5. Voce (`voce`)
`python tools/voice.py <produzione>` (Chatterbox, poi Whisper controlla ogni riga e scrive i tempi delle parole). Se una riga non si capisce, riscrivila più semplice (o aggiungi `"say"` con la pronuncia) e rilancia: rifà solo quella.

## 6-8. Animazione, musica, montaggio (`animazione`, `musica`, `montaggio`)
Li fa GitHub Actions: un commit su `productions/<id>/` con il file `READY` avvia `render.yml`, che esegue `tools/build.sh` (eventi → carillon → fotogrammi → mix → −14 LUFS → poster e foglio dei provini) e manda gli eventi all'ufficio.

## 9. Controllo qualità (`qualita`)
Skill: `reel-analyzer`. Sul film finito: il foglio dei provini (`out/sheet.jpg`) e 6 fotogrammi chiave. Si controllano:
- l'aggancio entro 2 secondi;
- nessun fotogramma nero o vuoto;
- i sottotitoli leggibili e mai sopra il soggetto;
- la voce: Whisper sul mix finale ritrova tutte le righe;
- il volume a −14 LUFS ± 1.
Se qualcosa non va, si torna al reparto giusto con una nota, una volta sola; poi si consegna e si segnala il resto.

## 10. Revisione (`revisione`)
Evento `queue` con `preview_url` (il film sulla release di GitHub), `caption`, `platforms`. L'ufficio manda la notifica e aspetta "Pubblica" o "Rifai".

## 11-13. Pubblicazione, community, statistiche
Fasi 4-6 del piano: Composio per Instagram e YouTube, Higgsfield per TikTok; risposte ai commenti; numeri della sera.
