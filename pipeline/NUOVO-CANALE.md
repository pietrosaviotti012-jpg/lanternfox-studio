# Guida al nuovo canale: tutto quello che abbiamo fatto e come rifarlo meglio

Scritta il 2026-11-06, ultimo giorno della prima sessione. La prossima sessione, in una chat nuova, riparte da qui: **leggi questo file per intero prima di fare qualsiasi cosa.** In questo file non ci sono chiavi né password: dove servono, è scritto dove stanno.

---

## 1. In breve

- Dal 27 ottobre al 5 novembre 2026 abbiamo costruito **Lantern Fox Tales**, uno studio automatico e a costo zero. Ha prodotto, controllato e pubblicato **17 video** (con i numeri nell'Ufficio, più alcuni ancora da approvare) verticali animati in inglese su YouTube, Instagram e TikTok, gestiti da un **Ufficio** web dal telefono.
- Il 3 novembre abbiamo provato le **skill di animazione** di artemnovitckii (MIT). Con **stick-figure** e **zach-d-films** i numeri su YouTube sono saliti subito: sopra le 1.000 visualizzazioni per ogni video di storia vera.
- **Decisione:** il canale cambia nome e faccia e si basa su queste due skill. Si parte da un **repository nuovo e pulito**. Gli account social restano gli stessi, rinominati, così follower e numeri non si perdono.
- La produzione di Lantern Fox è **in pausa fino al 7 novembre** (vedi §9).

## 2. Le decisioni dell'utente (6 novembre)

| Tema | Decisione |
|---|---|
| Formati | **Per argomento:** stick-figure per la storia vera e i misteri (la serie "Strange Days"), zach-d-films per i "what if" di scienza e fisica |
| Mascotte e foto profilo | Sfondo di un solo colore, **lo stickman da una parte e l'uomo di zach-d dall'altra**. La nuova sessione prepara **alcuni esempi** e l'utente sceglie |
| Nome | La nuova sessione propone **10 nomi già controllati** (@ liberi sulle 3 piattaforme, dominio libero, nessun canale simile) e l'utente sceglie |
| Ritmo | **2 video al giorno**, presto **3** |
| Durata | **30-45 s adesso**. Quando TikTok si avvicina ai 10.000 follower, le storie migliori anche in versione da 61-75 s (TikTok paga solo i video sopra il minuto) |
| Virality predictor | Una **nuova "casa" prima della scrivania dell'utente**, che dà un voto a ogni video. Prima va **verificato che funzioni** (meglio partire da una skill che lo fa già). Poi, sotto una soglia, il video torna indietro da solo; **l'ok finale resta sempre all'utente** |
| Ufficio | Va **ridisegnato**: colorato, divertente, con gli elementi principali del canale. La nuova sessione prepara **alcune bozze**, valutando strumenti di design (Claude Design). Non sono per forza "casette" |
| Ripartenza | **Repository nuovo pulito**. `lanternfox-studio` resta come archivio da cui copiare i pezzi che funzionano |
| Video vecchi | **Archiviati, non cancellati**: su Instagram archiviati, su YouTube non in elenco, su TikTok privati |
| Lingua | **Solo inglese** |
| Budget | **Piccolo budget se serve**: pochi euro al mese per uno strumento che migliora molto, chiedendo sempre prima |

## 3. I numeri (dall'Ufficio, 5 novembre alle 23:00)

Follower: **YouTube 32 · Instagram 5 · TikTok 13**. Visualizzazioni negli ultimi 7 giorni: **28.568**.

| Video | YouTube | Instagram | TikTok |
|---|---:|---:|---:|
| **Skill stick-figure** | | | |
| Strange Days #1 · The Dark Day of 1780 | **1.440** | **1.340** | 264 |
| Strange Days #2 · The Dancing Plague of 1518 | **1.161** | 150 | 757 |
| Strange Days #3 · Flight 19 | **1.329** | 129 | 742 |
| Strange Days #4 · The Great Moon Hoax | **1.056** | 187 | 499 |
| **Skill zach-d-films** | | | |
| What if Earth stopped spinning for one second? | 713 | – | – |
| **Lantern Fox (carta intagliata)** | | | |
| What If Every Star Went Out Tonight? | 89 | 526 | 33 |
| Lantern Night · Part 1 | 571 | 159 | 982 |
| What If Every Clock Stopped at the Same Second? | 931 | 1.388 | 961 |
| On My Way · Part 1 | 547 | 1.128 | 857 |
| The Torn Rule · Part 1 | 1.317 | 1.457 | 921 |
| What If the Moon Disappeared Tonight? | 769 | 1.376 | 816 |
| Lantern Night · Part 2 | 402 | 138 | 799 |
| The Mary Celeste | 64 | 122 | 799 |
| On My Way · Part 2 | 616 | 166 | 820 |
| The Torn Rule · Part 2 | 1.185 | 327 | 845 |
| Hush Harbor · Part 1 | 1.118 | 172 | 810 |
| Lamp Room · Night 1 | 293 | 144 | 793 |

**Medie:**

| Gruppo | YouTube | Instagram | TikTok |
|---|---:|---:|---:|
| Strange Days (stick-figure), 4 video | **1.247**, tutti sopra 1.000 | 452 | 566 |
| Lantern Fox, 12 video | **658**, solo 3 sopra 1.000 | 592 | 786 |

**Come leggerli, onestamente:**
- **Su YouTube il salto è chiaro:** quasi il doppio di visualizzazioni, e ogni video Strange Days supera 1.000.
- **Su Instagram e TikTok non si vede ancora.** Gli Strange Days hanno 1-3 giorni, i Lantern Fox fino a 9. Strange Days #1 su Instagram (1.340) è già tra i migliori in assoluto.
- **Su TikTok tanti video vecchi stanno tutti tra 790 e 980:** è la spinta iniziale che TikTok dà a quasi ogni video, non un segno di qualità.
- **Da rimisurare il 13 novembre**, con tutti i video vecchi di almeno 7 giorni.
- **What-if-1 (zach-d)** è uscito per ultimo: è presto per giudicarlo.
- I follower sono ancora pochissimi. Il segnale da guardare è la visualizzazione per video, non il totale.

Dove trovare i numeri: l'Ufficio li dà con `GET {OFFICE_URL}/stats` e l'header `Authorization: Bearer <PUBLISH_KEY>`, una copia per ogni video. YouTube arriva dalla nostra API, TikTok da Zernio (con le curve di chi resta dopo 1, 3, 5 e 10 secondi), Instagram dalla routine Analisi.

## 4. Cosa abbiamo costruito (la storia)

| Data | Cosa |
|---|---|
| 27-28 ott | **Il repository** `lanternfox-studio` (pubblico) e il motore di animazione a carta intagliata (`engine/`, licenza lemo-opuscar). **L'Ufficio** su Cloudflare, nato dalla dashboard del trading bot: login, notifiche, sveglia. **Le prime routine cloud**: Produzione, Pubblicazione, Community, Ricerca. Primi video "What if" e "Your Call" |
| 29-31 ott | **Il render su GitHub Actions** con 6 macchine in parallelo. **Voce** Chatterbox con "recitazione" riga per riga, controllata con faster-whisper. **Allineamento** delle parole con WhisperX. **Controllo qualità** automatico (`tools/quality.py`). **Suoni** CC0 da Wikimedia Commons, divisi in pacchetti per tipo di video. Formati a rotazione (`pipeline/formati/`). Serie a puntate con "Part 1/Part 2" e la Parte 2 dopo 2 giorni, scelta dai commenti |
| 1-2 nov | **YouTube** con il nostro progetto Google: il progetto condiviso di Composio finiva i caricamenti. **Il Generale**, che fa ripartire i reparti fermi. **Stato dell'Ufficio nel Durable Object**: KV dava copie vecchie e le case restavano "al lavoro". Skill esterne **earshot** (ascolta i film), **Real SFX**, **Cinematic Motion**, nel repository privato `lanternfox-skills` |
| 2-3 nov | **TikTok**: l'app developer non è stata approvata, quindi si pubblica con **Zernio** (funziona dal 3 novembre). **La casa Analisi** (Iris), che confronta i nostri video con quelli virali (`tools/look.py`). **Numeri** con YouTube, TikTok e Instagram, e la sezione "Quando si guadagna". Nel Controllo qualità: "figure a terra" e orari su una riga nelle didascalie |
| 3 nov | Installate le **6 skill di animazione** (graph, minimalistic-graphics, map-route, breakdown, stick-figure, zach-d-films). Prova in cloud di tutte e 6 (`research/prove-skill/cloud/RESOCONTO.md` sul ramo `prove-skill`). **Strange Days #1** in Approva e pubblicato |
| 4 nov | Lanciate 6 routine in parallelo: 3 stick-figure e 3 zach-d. Ne sono arrivati **4**: what-if-2 e what-if-3 si sono fermati sul limite di 5 ore dell'abbonamento (vedi §7). Il workflow `serie.yml` porta da solo in Approva i video salvati sul ramo `prove-skill`. Ogni casa dell'Ufficio mostra il suo video. Il Generale fa ripartire ogni reparto fermo, fino a 3 volte al giorno |
| 5 nov | **Produzione in pausa fino al 7 novembre**: routine e Ufficio la bloccano. L'ultimo video Lantern Fox, "The Wrong Transfer Part 1", è in Approva |

Documenti di dettaglio nel vecchio repository (da leggere quando servono):

| File | Cosa contiene |
|---|---|
| `pipeline/CATENA.md` | La catena dei reparti |
| `pipeline/VISIVO.md` | Un evento ogni 2 secondi |
| `pipeline/VOCE.md` | Pause e recitazione |
| `pipeline/SUONI.md` | Picchi sugli eventi, effetti sotto la voce |
| `pipeline/PUBBLICAZIONE.md` | Come escono i video |
| `pipeline/COMMUNITY.md` | Come si risponde ai commenti |
| `pipeline/ANALISI.md`, `pipeline/MIGLIORARE.md` | Il confronto con i video virali e cosa migliorare |
| `pipeline/SKILL-ESTERNE.md` | Le skill esterne e le loro licenze |
| `pipeline/formati/*.md` | I formati dei video |
| `stories/BANCA.md` | La banca delle idee |
| `research/` | Le ricerche di ogni giorno |

## 5. Gli strumenti usati

| Area | Strumento | A cosa serve | Costo |
|---|---|---|---|
| Cervello | **Claude Code** (app desktop), modello Claude Opus 5.5 | Costruisce tutto, dal PC dell'utente | abbonamento |
| | **Routine cloud di Claude** (claude.ai/code/routines) | Produzione, Regia, Pubblicazione, Community, Ricerca, Analisi, ognuna a orari fissi o su richiesta | abbonamento (limite di 5 ore!) |
| Codice e render | **GitHub**: repository pubblico `lanternfox-studio` e privato `lanternfox-skills` | Codice, storie, ricerche, skill senza licenza | gratis |
| | **GitHub Actions** | Render su 6 macchine, il guardiano dell'Ufficio (`office.yml`), il confronto serale (`look.yml`), il workflow skill → Approva (`serie.yml`), le voci | gratis (minuti inclusi) |
| | **GitHub Releases** | Il video finito ha un link pubblico, che le piattaforme scaricano | gratis |
| Ufficio | **Cloudflare Workers**, Durable Object, KV | Il sito dell'Ufficio, lo stato, la sveglia ogni 10 minuti | gratis |
| | **Web Push** | Le notifiche sul telefono | gratis |
| Animazione | **Skill di artemnovitckii** `claude-animation-skills` (MIT): **stick-figure**, **zach-d-films**, graph, minimalistic-graphics, map-route, breakdown | Il nuovo stile del canale | gratis |
| | Motore a carta intagliata `engine/` (licenza lemo-opuscar) | Lo stile Lantern Fox (si archivia) | gratis |
| | three.js, HyperFrames, GSAP, Playwright con Chromium, ffmpeg | Disegno 3D e 2D in codice, render dei fotogrammi, montaggio | gratis |
| | **Cinematic Motion** (Aleksei Media, Remotion) | Video con testi e grafici in movimento, promo | gratis, senza licenza: solo nel repository privato |
| Voce | **Kokoro** (kokoro-onnx), voce `am_michael` a velocità 1,12 | La voce delle skill | gratis |
| | **Parakeet** (sherpa-onnx) | I tempi di ogni parola, per didascalie e animazioni | gratis |
| | Chatterbox, faster-whisper, WhisperX | La voce e i controlli di Lantern Fox | gratis |
| Suono | Libreria `sounds/` (tutta CC0, da Wikimedia Commons) e pacchetti per tipo di video | Effetti e atmosfere | gratis |
| | **earshot** (MIT), **Real SFX** | Ascoltano il film e giudicano i suoni, mettono i suoni sugli eventi | gratis |
| Pubblicazione | **YouTube Data API** con il nostro progetto Google (OAuth) | Caricamento diretto su YouTube | gratis |
| | **Composio** | Instagram (dalla routine Pubblicazione) e la "postazione" da cui le routine parlano con l'Ufficio | gratis |
| | **Zernio** (account TikTok collegato) | Pubblicazione su TikTok e i numeri di TikTok | gratis |
| Controllo | `tools/quality.py`, `ground_check.mjs`, `earshot_check.py`, `look.py`, `check.sh` | Controllo qualità, figure a terra, ascolto, confronto con i virali | gratis |
| Altro | Insomnia (tiene acceso il PC), skill call-me (Bland.ai, telefonate) | Lavoro di notte, avvisi | gratis |

**Dove stanno le chiavi** (mai nel repository pubblico, mai nei messaggi):
- **Sul PC:** il file `Studio/.env` contiene `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `OFFICE_PASSWORD`, `STUDIO_SECRET`, `PUBLISH_KEY`, gli ID e i token di ogni routine, `YT_CLIENT_ID` e `YT_CLIENT_SECRET`, `GH_DISPATCH_TOKEN`, `ZERNIO_API_KEY`, `OFFICE_URL` e `CLOUDFLARE_KV_NAMESPACE_ID`.
- **Cloudflare:** gli stessi valori sono segreti del Worker, caricati con `node office/deploy.mjs --secrets`. Il collegamento YouTube (refresh token) sta nella KV, chiave `yt_refresh`.
- **GitHub:** i segreti del repository sono `OFFICE_URL` e `STUDIO_SECRET`.
- **Account TikTok su Zernio:** `6ae4e55fdfe8162fad8b43f0`.

## 6. Le routine cloud di oggi

Da spegnere quando parte il nuovo canale (lo si fa da claude.ai/code/routines o con RemoteTrigger):

| Routine | Quando (ora UTC) | Id |
|---|---|---|
| Produzione | 5:00 e 11:00 (in pausa fino al 7) | `trig_01BjJQVd4USismSyDNg6QzjF` |
| Regia (Rifai e Idee) | su richiesta dall'Ufficio | `trig_01GgtXmiJ9FoKTTYUQ9tqcMx` |
| Pubblicazione | 16:00 e 22:00 | `trig_0189NypF3VnHYLoPwvSyA3NX` |
| Community | 7:00, 13:00, 19:00 | `trig_01N2hEZUpEKAbPLJNZse79AM` |
| Ricerca | 19:30 | `trig_01CYHvbjAagyYwNktktKbJgV` |
| Analisi | 20:15 | `trig_014NiPmjFgqAUN37upTzginD` |

- Le routine di prova (what-if-1/2/3, strange-days-2/3/4, Prove skill, Stick figure, Unione WhisperX) sono tutte già spente.
- "Revisione settimanale trading bot" è un altro progetto: **non toccarla**.

## 7. Cosa abbiamo imparato (errori da non ripetere)

1. **Limite di 5 ore.** Le routine e la chat usano lo stesso abbonamento. Con 6 routine insieme il limite è finito e 2 video si sono persi all'ultimo passo, con il render già fatto ma non salvato. **Massimo 2 routine pesanti insieme.** Ogni routine deve **salvare a metà**: la voce e le parti di render vanno salvate (commit o artifact) appena sono pronte.
2. **Render pesanti su GitHub, non nella routine.** zach-d in cloud, senza scheda grafica, richiede `GL=swiftshader` e circa 25 minuti di render; stick-figure circa 4. La routine scrive copione e scene, poi un workflow GitHub fa il render su più macchine, come fa già il render di Lantern Fox. Così non consuma le 5 ore.
3. **In cloud alcuni download sono bloccati:**
   - Chromium e ffmpeg di Playwright: si usa il Chromium già presente in `/opt/pw-browsers` con `PLAYWRIGHT_BROWSERS_PATH` e dei link alla build 1148. Per la headless shell servono i link ai file uno per uno.
   - GSAP da cdnjs: si prende da npm (`npm pack gsap@3.12.5`).
4. **Sul PC Windows:** `npx` si chiama `npx.cmd` (corretto nel kit locale con `shutil.which`), e l'installazione di Chromium si è bloccata in silenzio per 2 ore. **Ogni comando lungo va lanciato con un tempo massimo e con l'output visibile.** Meglio non fare render sul PC.
5. **Le routine non raggiungono l'Ufficio direttamente.** Oggi passano dal workbench di Composio, e la chiave sta nel testo della routine. **Nel nuovo progetto, niente chiavi nei prompt:** gli eventi passano da un workflow GitHub (che ha i segreti) oppure da un segreto dell'ambiente della routine.
6. **Lo stato dell'Ufficio va nel Durable Object**: la KV è solo un backup, perché dà copie fino a 60 secondi vecchie.
7. **Ogni evento porta l'id del video.** Senza, le case restano "al lavoro" su un video finito.
8. **Git e video:** `.gitignore` esclude `*.mp4` (si usa `git add -f` o, meglio, le Releases). GitHub rifiuta i file sopra 100 MB: stick-figure esce a CRF 17, 114 MB per 43 s, e va ricompresso a CRF 24.
9. **Titoli:** un titolo che finisce con "Part 1" fa partire da solo la Parte 2 dopo 2 giorni. Per le serie si usa "#N".
10. **YouTube:** il progetto Google condiviso di Composio finisce i caricamenti del giorno. Serve un progetto Google nostro, e l'abbiamo.
11. **TikTok:** l'app developer non viene approvata per noi. **Zernio** funziona (videoMadeWithAi: true).
12. **Suoni:** Wikimedia Commons risponde 429 se si scarica in fretta: 10 secondi tra un file e l'altro, e mai l'email nello User-Agent. Openverse vieta i programmi nel suo `robots.txt`, quindi non si usa in automatico.
13. **Didascalie:** gli orari tipo "11:52 AM" vanno tenuti insieme con uno spazio unito.
14. **Foglio dei provini:** va guardato prima di Approva. Sistema le figure sospese in aria, i tagli in testa, le etichette fuori dai bordi e le facce sbagliate. Il personaggio di zach-d di base sembra arrabbiato: nella routine what-if-2 una funzione `setFace` (sopracciglia alzate, occhi spalancati) aveva risolto, ma il progetto non è stato salvato e va **rifatta** nel kit del nuovo canale.
15. **I fatti veri danno credibilità.** Ogni copione di storia ha le sue fonti in `copione.md`, e le leggende si dicono leggende.

## 8. Come fanno gli altri (ricerca del 6 novembre)

**YouTube**, cercando "automate faceless shorts claude code". I video più visti dell'ultima settimana:
- **"How To Make Faceless YouTube Shorts with Claude (Free Skill/Automation)"** (Nafay 3D, 348.000 visualizzazioni in 4 giorni): una skill Claude gratuita che scrive, fa la voce e monta. Insegna a creare il proprio stile partendo da un video qualsiasi e automatizza i caricamenti ogni giorno.
- **"Come creare un canale YouTube faceless con Claude"** (Zinho Automates, 74.000): il processo in passi. Trovare una nicchia che funziona, costruire l'identità del canale, fare il primo video, sistemare i punti deboli, poi **"Package & Virality Predictor"** e riscrivere il gancio, e infine crescere con video nuovi e Shorts. Usa Higgsfield con Claude.
- **"Ho creato video d'animazione VIRALI usando Claude Code (Plugin GRATUITO)"** (Grow With Kaz, 103.000 in 1 giorno): animazioni 3D virali con un plugin gratuito, lo stesso genere di zach-d.
- **"Claude Code + YouTube Faceless"** (Leo Ai): un corso intero sulle animazioni di **omini stilizzati**. Conferma che il formato stickman è una nicchia viva.
- **"Claude Code + Blotato = Automated Shorts"** (41.000): la programmazione delle uscite con Blotato. Noi lo facciamo già con l'Ufficio e Zernio.

**Virality predictor: cosa esiste**
- **youtube-agent-skill** (Jakeschincariol, MIT, circa 4.800 stelle): 11 skill per gestire un canale YouTube (`/yt-script`, `/yt-viral`, `/yt-retention`, `/yt-shorts`, `/yt-package` e altre). Non chiede chiavi e non pubblica nulla.
  - **`hookscore.py`** dà un voto al gancio su 5 proprietà, tarato su 74 ganci veri. L'autore stesso dice che **separa bene i ganci deboli da quelli forti, ma quasi per niente i successi di un creator dai suoi flop**.
  - `/yt-viral` misura quanto un video ha battuto la mediana del proprio canale.
  - È il punto di partenza più serio, ma **va verificato sui nostri video**.
- **Higgsfield Virality Predictor**: con Claude, dà voto al gancio e tenuta. Ne parlano solo articoli di terzi e si presenta come "filtro creativo, non oracolo". Avevamo già Higgsfield collegato con Composio nel progetto delle storie animate.
- **Virality Predictor** (sito web): clip fino a 15 secondi, voto al gancio dei primi 3 secondi e tenuta. Non è una skill.

**Mascotte e coerenza.** Le guide sui canali faceless dicono tutte la stessa cosa: un personaggio fisso, una "scheda del personaggio" scritta prima di tutto e usata in ogni video, e un ritmo costante. YouTube **non paga contenuti "inautentici"**, cioè prodotti in serie e tutti uguali. Ogni video deve avere una storia vera, curata e diversa, con il controllo umano in Approva.

**Instagram e TikTok:** da fare quando l'utente ha fatto l'accesso nel pannello browser. Si cercano profili di stickman e "what if" 3D con milioni di visualizzazioni, la loro mascotte, la frequenza, la lunghezza, i ganci e le copertine, e come dicono di automatizzare.

Fonti:
- [youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill)
- [Higgsfield + Claude Virality Predictor](https://www.producthunt.com/p/aifire/higgsfield-claude-virality-predictor)
- [Virality Predictor](https://coderlegion.com/18543/virality-predictor)
- [Faceless shorts automation guide 2026](https://fluxnote.io/guides/faceless-youtube-shorts-automation-guide-2026)
- [Faceless YouTube videos, Higgsfield](https://higgsfield.ai/blog/faceless-youtube-videos-faceless-studio)

## 9. La pausa di adesso

- **Fino al 7 novembre** (mezzanotte italiana) la routine Produzione si chiude da sola, e l'Ufficio non avvia video nuovi: niente Generale, "Rifai" o idee. I "Rifai" e le idee mandati nel frattempo partono da soli il 7.
- **Se il nuovo canale non è pronto per il 7**, la pausa va **allungata**:
  - nella routine Produzione cambia la data nel primo paragrafo;
  - nell'Ufficio cambia `PRODUCTION_PAUSED_UNTIL` in `office/worker.js`, poi `node office/deploy.mjs`.
  - Altrimenti Lantern Fox ricomincia a fare video.
- Pubblicazione, Community, Numeri, Analisi e Ricerca continuano.

## 10. Il piano per la nuova sessione

Ogni fase si chiude con l'approvazione dell'utente. Si procede **una fase alla volta**, come nei progetti precedenti.

### Fase 0: partire
- Leggere questa guida. Allungare la pausa di Lantern Fox se serve (§9).
- Confermare con l'utente l'ordine delle fasi.

### Fase 1: identità
1. **Nomi.** 10 proposte, ognuna controllata: @ libero su TikTok, Instagram e YouTube, dominio .com libero, nessun canale grande con un nome simile, nessun marchio uguale. Il nome deve coprire sia la storia vera sia i "what if".
2. **Foto profilo / mascotte.** Come chiesto dall'utente: sfondo di **un solo colore**, **lo stickman da una parte e l'uomo di zach-d dall'altra**. Si fanno 3-4 esempi, disegnati in codice con le due skill (render di fotogrammi fermi), con colori e pose diverse. L'utente sceglie.
3. **Scheda dei personaggi:** come sono fatti lo stickman e l'uomo 3D. Colori, vestiti, il segno che li fa riconoscere, espressioni (con la `setFace` da rifare), la voce. Vale per ogni video.
4. **Palette, font, copertine:** lo stesso schema per ogni video, una parola grande più il personaggio. I colori della serie: per esempio uno per Strange Days e uno per What If.
5. **La voce:** 3 voci Kokoro sullo stesso copione, l'utente sceglie.
6. **La bio:** una riga per piattaforma, più il link.

### Fase 2: il repository nuovo
- **Pubblico o privato:** da decidere con l'utente. Le skill senza licenza vanno comunque solo nel privato.
- Struttura proposta:
  - `skills/`: le due skill di animazione (MIT, con LICENSE) e il kit, già corretto per il cloud (Chromium, GSAP, `setFace`).
  - `formats/`: le regole di **stick-figure-storia** e **zach-d-whatif**, con i modelli dei progetti che hanno funzionato (strange-days-1…4 e what-if-1 sul ramo `prove-skill` del vecchio repository).
  - `stories/`: la banca delle idee, solo "Misteri e leggende vere" e "What if" dalla vecchia `BANCA.md`, con le fonti.
  - `sounds/`: si copia la libreria CC0 e si aggiungono suoni ai video delle skill (oggi zach-d ha solo la voce).
  - `tools/`: si portano `quality.py`, `mix.py`, `score.py`, `look.py`, `earshot_check.py`, `office.mjs`, adattati.
  - `office/`: il nuovo Ufficio (fase 5).
  - `.github/workflows/`: render, guardiano, confronto, pubblicazione.

### Fase 3: la nuova catena
1. **Ricerca:** idee, fatti e fonti, e cosa funziona adesso nel genere.
2. **Soggetto:** sceglie il formato in base all'argomento. Storia o mistero → stick-figure; scienza "what if" → zach-d.
3. **Copione:** 110-120 parole, gancio nei primi 2 secondi, domanda finale, fonti.
4. **Voce:** Kokoro più i tempi delle parole con Parakeet.
5. **Scene:** la routine scrive `shots.js` seguendo il SKILL.md della skill e controlla i fotogrammi fermi.
6. **Render:** su GitHub Actions, diviso su più macchine.
7. **Suono e mix:** con le regole di `SUONI.md`.
8. **Controllo qualità:** quello di oggi più "Fatti" (ogni frase ha una fonte) ed "Espressione" (la faccia segue la frase).
9. **Virality predictor** (fase 4).
10. **Approva:** l'utente.
11. **Pubblicazione:** YouTube diretto, Instagram con Composio, TikTok con Zernio.
12. **Community, Numeri, Analisi:** come oggi.

Ritmo: 2 video al giorno, poi 3. Al massimo 2 routine pesanti insieme (§7.1).

### Fase 4: il virality predictor
- Si installa `youtube-agent-skill` (MIT), dopo averne letto il codice.
- Si prova su **tutti i nostri 17+ video con numeri veri**: il voto del gancio deve mettere in ordine i video come le visualizzazioni vere. Se non ci riesce, si prova Higgsfield (budget piccolo, chiedendo prima) o si costruisce un nostro predittore dai nostri numeri: tenuta ai 3 secondi da Zernio, gancio, formato, durata.
- Solo dopo che funziona diventa la casa **prima di Approva**: dà il voto, spiega cosa migliorare e, sotto la soglia, rimanda il video al Copione o alle Scene. L'ok finale resta all'utente.

### Fase 5: il nuovo Ufficio
- Si fanno **2-3 bozze** colorate e divertenti, con le mascotte e gli elementi del canale, valutando Claude Design. Si sceglie prima di scrivere il codice.
- **Funzioni che devono restare**, perché sono già provate:
  - Approva con la scelta dell'orario, "Pubblica adesso" e "Riprova su TikTok";
  - il Calendario;
  - i Numeri per piattaforma e per video, con "Quando si guadagna";
  - l'Analisi, cioè cosa migliorare;
  - il Generale che fa ripartire ogni reparto fermo (fino a 3 volte al giorno, poi avvisa);
  - le notifiche sul telefono;
  - la scheda Idea, con i video da studiare;
  - ogni reparto che mostra il suo video e quanto ci mette;
  - la pausa della produzione.
- **Novità:** la casa del predictor, il formato di ogni video (stickman o 3D) e il numero della serie in Approva, il confronto tra formati nei Numeri.
- Dal vecchio Ufficio si riprendono login, Durable Object, Web Push, YouTube OAuth (con il refresh token nella KV), Zernio e statistiche. Si può fare un Worker nuovo o rinominare quello di oggi: le chiavi restano uguali.

### Fase 6: i profili (li cambia l'utente)
- Si preparano nome, foto e bio per ognuna delle 3 piattaforme, e i passi da seguire. **TikTok permette di cambiare l'@ solo una volta ogni 30 giorni.**
- Si archiviano i video di Lantern Fox: su Instagram archiviati, su YouTube non in elenco, su TikTok privati.
- Dopo il cambio si ricontrolla il collegamento di Zernio con TikTok, di Composio con Instagram e della nostra OAuth con YouTube.

### Fase 7: partenza e crescita
- Si spengono le routine di Lantern Fox (§6) e si accendono le nuove.
- Si parte con 3 video di prova in Approva, poi 2 al giorno. Ogni settimana l'Analisi confronta i formati e corregge la catena.
- Si passa a 3 video al giorno quando la catena gira per una settimana senza errori.
- Quando TikTok si avvicina ai 10.000 follower, si fanno versioni da 61-75 s delle storie migliori.

## 11. Cose aperte da chiedere all'utente nella nuova sessione
- Il repository nuovo è pubblico o privato?
- Quale delle mascotte d'esempio, quale nome, quale voce?
- Quale bozza dell'Ufficio?
- La soglia del predictor, quando funzionerà.
- Il budget concreto, se servisse Higgsfield o una voce migliore.
