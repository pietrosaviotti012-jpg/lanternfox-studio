# La catena di Lantern Fox Tales

Questo è il manuale che la routine giornaliera di Claude segue, un reparto dopo l'altro. Ogni reparto è un passo, e dove serve giudizio è un subagente con le sue skill (vedi `REPARTI.md`). Prima di cominciare un reparto e quando ha finito, si avvisa l'ufficio:

```sh
node tools/office.mjs '{"dept":"copione","status":"working","task":"Scrivo l'aggancio"}'
node tools/office.mjs '{"dept":"copione","status":"done","task":"Copione di 13 righe","output":"Every night, he left one window lit…"}'
```

Stati: `working`, `done`, `waiting` (aspetta l'utente), `error` (si è fermato: scrivi perché nel `task`). Ogni mattina il primo evento è `{"reset": true, "video": {"id", "title", "series"}}`.

## Regole fisse (dal marchio, `brand/IDENTITA.md`)
- Stile unico: carta intagliata illuminata da dietro (Lemo-Opuscar `paper-lantern`), verticale 1080×1920, 30-60 s, inglese.
- La volpe con la lanterna è la mascotte e la firma: compare almeno per un momento in ogni video, anche piccola (alla finestra, su un tetto, nell'ultima inquadratura).
- Storie originali, fatti reali raccontati con le nostre parole, leggende e miti di pubblico dominio. Mai personaggi, marchi o musica di altri.
- Pubblico generale (adulti e ragazzi). La tensione va bene, il gore no: niente violenza mostrata.
- Video segnato come contenuto AI dove la piattaforma lo prevede.

## I formati (dal 2026-10-28: due video al giorno, a rotazione)
Non solo fiabe. Ogni giorno escono due video di due formati diversi. Le Statistiche dicono quale tenere.
1. **Your Call: storia in seconda persona con scelta finale** (modello: "Your Call TV", la serie *Eyes Down*).
   - "It's 1:14 am. You're lying in bed…": il protagonista sei **tu**.
   - Ha un'etichetta di serie fissa in alto (`hud.tag` e `hud.part`) e l'ora o il giorno che avanza (`clock` sulle righe).
   - Ogni riga è una frase brevissima. La tensione sale e finisce su un bivio: **"Comment GO or STAY"**, con due parole semplici. La parte dopo segue la scelta più commentata.
   - Temi: notti strane, allarmi, luoghi abbandonati, il mondo che cambia di colpo. Sempre senza violenza mostrata.
2. **Misteri e leggende vere**: "In 1930, an entire village vanished in one night.", oppure leggende popolari (la nave fantasma, la città sommersa). I fatti si verificano con una ricerca; dove la storia è leggenda, lo si dice.
3. **What if**: "What if the Moon disappeared for one night?": scenari impossibili, spiegati passo per passo, con un finale che sorprende.
4. **Fiabe con colpo di scena** (quelle di prima): di riserva, una volta ogni tanto.

## Il gancio a tre tempi (Kallaway, "Triple Hook"): vale per ogni video
1. **Contesto subito.** La prima frase dice di cosa parla il video: detto a voce, mostrato nell'immagine e scritto a schermo (`hud` e sottotitoli). Rimandarlo anche solo a metà della prima frase fa scappare chi guarda.
2. **Lean, la curiosità.** Subito dopo, un dettaglio che fa sporgere in avanti: un numero, un'ora precisa, qualcosa di strano o inatteso.
3. **Snapback contrario.** Una frase che tira dalla parte opposta a dove stavano andando ("…and your neighbors are already outside, smiling."). Qui si vince o si perde.
Rileggi da sole le prime due righe: si capisce di cosa parla? C'è un motivo per restare? C'è una svolta?
La chiusa è sempre una domanda o una scelta da commentare. La parola STORY resta per le fiabe; per Your Call la scelta (GO/STAY…).

## 1. Ricerca (`ricerca`)
Skill: `trend-spotter`, `content-research`, `reel-analyzer`, `virality`, `hook-mining`. Ogni giro guarda cosa funziona adesso nei video animati e AI brevi: ricerca web su YouTube Shorts, Instagram Reels e TikTok ("AI animated story", "what if", "mystery", "POV your choice"), Reddit e gli account modello (Your Call TV, Kallaway per i ganci).
Scrive `research/<data>.md` con 3 idee, ognuna con: il formato, il gancio in una riga, e perché funziona (numeri visti, commenti). Massimo 15 minuti. Le idee non usate restano per i giorni dopo.

## 2. Soggetto (`soggetto`)
Skill: `series-planner`, `content-calendar`. Sceglie il video del giro: il formato tocca a rotazione (guarda `productions/` per vedere gli ultimi formati usati), e un formato che funziona (Statistiche) può tornare più spesso. Le serie (Your Call) continuano con la parte dopo, seguendo la scelta più commentata (si legge dal diario della Community).
Crea `productions/<data>-<slug>/meta.json` (titolo, `format`, serie, episodio, idea in una riga, `cover`) e aggiorna il calendario dell'ufficio (`{"calendar": {"date", "title", "status": "planned"}}`).
`meta.cover`: `{ "kicker": "EYES DOWN · PART 1", "text": "Do *not* look at the sky", "t": 2.5 }` è la copertina del Reel: una promessa di 4-8 parole, le parole tra asterischi vengono colorate, `t` è il fotogramma di sfondo (facoltativo).

## 3. Copione (`copione`)
Skill: `going-viral`, `viral-hook-writer`, `reel-scripter`, `on-screen-text-writer`. Scrive `script.json`:
- le prime due-tre righe sono il gancio a tre tempi (sopra);
- sottotitoli: `"captions": "pop"` (predefinito: 2-3 parole alla volta, grandi, al centro); su ogni riga `em` elenca le 1-2 parole da colorare (`"em": ["screams"]`);
- etichetta di serie: `"hud": {"tag": "EYES DOWN", "part": "PART 1"}`, e `"clock": "DAY 1 · 01:14 AM"` sulle righe dove l'ora cambia (facoltativo per gli altri formati: per i misteri va bene l'anno, `"clock": "1930 · NOVA SCOTIA"`);
- 9-16 righe, 30-60 secondi di voce in tutto; frasi corte; un finale con la scelta o la domanda;
- ogni riga ha la sua recitazione `act`: `intensity` 0,3 (calmo) … 0,8 (intenso), `pace` 0,35-0,5 (più basso = più lento), `speed` 0,84-0,94, `gain_db` −4 (sussurro) … +1,5 (culmine);
- `gap` dopo ogni riga (0,2-1,3 s): i silenzi prima della svolta contano;
- `music`: l'umore di ogni scena (`calm`, `storm`, `hush`, `rise`, `warm`, `end`).

## 4. Regia (`regia`)
Skill: `lemo-opuscar` (leggi `STYLE.md` di paper-lantern e `DIRECTOR.md`), il tabellone di `launch-video`. Scrive `shots.js` con il kit (`engine/kit/shot.js` + `engine/kit/motifs.js`, esempio completo: `productions/2026-10-28-lighthouse-fox/shots.js`):
- 6-9 inquadrature, ognuna ancorata a una riga (`start: at('L04') - .4`), dissolvenze 0,6-1,2 s;
- almeno quattro movimenti di camera diversi; le azioni forti sulle parole (`E.word('L07', 7)`);
- soggetti tra il 15% e il 52% dell'altezza: in alto c'è l'etichetta di serie, tra il 53% e il 66% i sottotitoli pop, dal 66% in giù i pulsanti delle app;
- per Your Call: un personaggio semplice e leggibile (il "tu" della storia, di carta), primi piani su dettagli che contano (il telefono, la finestra, la porta), luce che cambia con l'ora;
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
Evento `queue` con `preview_url` (il film sulla release di GitHub), `cover_url` (la copertina `cover.jpg`), `caption`, `platforms`. L'ufficio manda la notifica e aspetta "Pubblica" o "Rifai".

## 11-13. Pubblicazione, community, statistiche
- Pubblicazione: due uscite al giorno, alle 16 e alle 22 UTC (17 e 23 in Italia d'inverno). Una sola storia per uscita, la più vecchia fra quelle approvate (manuale `PUBBLICAZIONE.md`).
- Community: `COMMUNITY.md`.
- Statistiche: la Fase 7.

## Chi fa partire la catena
La routine **"Lantern Fox · Produzione"** gira due volte al giorno, alle 5 e alle 11 UTC. Ogni giro produce un video. I passi sono:
- Ricerca, Soggetto, Copione e Regia li fa Claude in questo repository;
- poi scrive il file `READY` e fa il push su `main`;
- Voce, Animazione, Musica, Montaggio e la copertina li fa GitHub Actions (`render.yml`);
- il video arriva nell'ufficio da approvare.

Prima di ogni push, e di nuovo dopo un `git pull --rebase`: `sh tools/check.sh productions/<id>`. Controlla motore, kit, scene e JSON come moduli veri; un file rotto blocca il render di tutti. Se un altro giro ha toccato `engine/kit/motifs.js` nello stesso momento, l'unione automatica può rompere una funzione.

Da cloud l'ufficio non si raggiunge con `tools/office.mjs`: gli eventi dei reparti 1-4 vanno mandati dal banco di lavoro di Composio, come per la pubblicazione.
