# Ricerca e sviluppo visivo

Questa è la guida viva di quello che piace a chi guarda. La **Regia** la legge prima di scrivere `shots.js`. La **Ricerca**, una volta alla settimana e ogni volta che trova qualcosa di forte, aggiunge in fondo una voce datata: cosa ha visto, in quale video, e se il motore lo sa già fare oppure no. Quando il motore non lo sa fare, si aggiunge al kit (`engine/kit/`) o si propone all'utente.

## Le regole che valgono adesso
1. **Qualcosa cambia ogni 1,5-2,5 secondi**: un'inquadratura nuova, un oggetto che entra, una luce che si accende, un primo piano. Un video di 45 secondi ha 15-20 "eventi" visivi, non 6 scene ferme.
2. **Ogni inquadratura si muove**: camera, parallasse, personaggi o luce. Il motore aggiunge già un lento avvicinamento a ogni inquadratura (drift).
3. **Le parole chiave colpiscono**: le parole in `em` danno uno zoom a scatto (punch-in) automatico. Scegline 1-2 per riga, quelle che portano la storia.
4. **Lo snapback si sente**: sulla riga della svolta metti `"hit": true` (piccola scossa della scena). Usalo 1-2 volte per video, non di più.
5. **Le facce e gli occhi** trattengono chi guarda: primi piani del personaggio quando prova qualcosa (paura, sorpresa). Gli occhi che brillano al buio funzionano.
6. **Gli oggetti del telefono** sono il gancio più moderno: `line.card` mostra una notifica, per esempio `{"app": "Emergency alert", "title": "Do not look at the sky.", "body": "Stay indoors."}`; con `kind: "info"` è una notifica normale. Ottimi nei Your Call.
7. **L'atmosfera è sempre viva**: `script.fx` sceglie le particelle sopra la scena: `embers` (braci, lanterne), `snow`, `dust` (interni, misteri antichi), `rain`, `fireflies` (notti calme).
8. **La luce racconta**: la lanterna della volpe è la firma. Le finestre si accendono e si spengono con la storia, i fasci di luce tagliano il buio.
9. **Il primo fotogramma è già pieno**: soggetto grande, luce accesa, testo a schermo. Niente dissolvenza dal nero.
10. **Il finale invita a commentare**: l'ultima immagine tiene ferma la scelta (GO o STAY) oppure la domanda per 2-3 secondi.

## Gli elementi di scena dei modelli virali (dal 2026-10-29, `engine/ui.js`)
Le ricette dei formati sono in `pipeline/formati/`. Gli elementi:
- **per tutto il video**:
  - `bar`: la barra delle risorse in alto, `[{label, value, alert}]`, che si aggiorna con `bar` sulle righe;
  - `choice`: la scelta finale, `{question, a: {word, sub}, b: {word, sub}, note, at}`;
  - `next`: il cartello finale, `{title: "PART 2", sub}`;
- **per riga** (ognuno resta fino alla riga dopo, o per `hold` secondi):
  - `phone`, con `app` uguale a uno di questi:
    - `steps` {from, value, sub};
    - `health` {title, value};
    - `map` {title, to};
    - `messages` {from, text | thread: [{me, text}]};
    - `lock` {date, time, notes: [{app, text}]};
  - `tv` {title, rule, text, ticker}: l'allerta in tv;
  - `cctv` {cam, time}: il monitor di sicurezza;
  - `peephole: true`: lo spioncino;
  - `timer` {from: "63:59:22"} oppure {wait: "10:00", label};
  - `tint: true`: il rosso della paura;
  - `name` {name, role}: il nome di chi entra in scena;
  - `quote: true`: la frase detta da un altro personaggio, in corsivo rosso;
  - `vfx`: un'altra voce, cioè `radio`, `phone`, `whisper`, `child` o `robot`.
- **nelle scene**: `person(x, {cx, by, s, face: 'calm'|'scared'|'surprised'|'sleeping', coat, hat, arms: 'down'|'up'})`, il personaggio con la testa tonda e gli occhi grandi.

## Cosa sa fare il motore (riassunto per la Regia)
- In `script.json`:
  - `captions` (`pop` / `line`), `hud` {tag, part}, `fx`, `motion: false` (spegne drift, punch e scossa);
  - per riga: `em`, `clock`, `hit`, `card` {app, title, body, kind, hold}.
- In `meta.json`: `cover` {kicker, text con *parole colorate*, t}.
- Nel kit (`engine/kit/shot.js`, `engine/kit/motifs.js`): strati di carta, cielo, luna, fasci di luce (`beams`), sfarfallio (`flicker`), movimenti e scorrimenti, camera e fuoco. Motivi già pronti:
  - volpe, lanterna, faro, scogliera, dune, pioggia, barca, guardiano, scale, finestra, luna;
  - campo di stelle, casette, case, lampioni, vicini, pini, telefono, porta.

## Diario della ricerca (le voci più nuove in fondo)
- 2026-10-28, dal modello Your Call TV ("Eyes Down"): personaggio semplice e tondo, primi piani sugli occhi, notifica d'allerta a schermo, l'ora che avanza, folla di vicini con gli occhi luminosi, case con le finestre accese. Il motore ora sa fare la notifica (`card`) e le particelle (`fx`). Non sa ancora fare personaggi che camminano con le gambe animate: da aggiungere al kit.
- 2026-10-28, da Kallaway: il contesto scritto a schermo dal primo fotogramma (fatto con `hud` e sottotitoli pop).
- 2026-10-29, dai mystery Shorts "rapid-fire facts": un fatto per riga e un'immagine nuova per ogni fatto (il cancello, l'orologio, le lampade, la cerata), con primi piani sugli oggetti come prove. Il motore lo sa fare (inquadrature brevi con tagli netti). Ancora da aggiungere al kit: un "timbro" LEGEND / FACT a schermo per separare i fatti dalla leggenda (oggi si fa con un foglio di testo nella scena).
- 2026-10-29, dai "what if" faceless: voce, testo e immagine dal primo istante, e un oggetto-simbolo che cambia sotto gli occhi (l'orologio che si ferma sulla parola "stopped"). Il motore lo sa fare: le lancette sono fogli a parte, ruotati da `update`. Ancora nuovi nel kit: le lancette (`clockHand`), la torre con l'orologio (`clockTower`), il satellite (`satellite`), il traliccio dei cellulari (`cellTower`), il puntino blu della mappa (`mapDot`). Ancora da fare: segnali che viaggiano come onde concentriche (oggi si fanno con puntini).
- 2026-10-29, dal modello Your Call TV ("Eyes Down", studio completo di `research/analisi/DexaQbfJY4E`): tutta animazione continua (il rilevatore trova un solo taglio) ma un'immagine nuova ogni 1,5 s. Elementi: l'inventario come oggetti grandi in scena (3 bottiglie, scatola di cereali, telefono al 41%, "? DAYS" in grigio) che nel finale si svuotano; chat con "not delivered" in rosso e messaggio da "Unknown · No sender" che si scrive coi tre puntini; cartello grande dell'ora ("5:40 AM · the sun should be up"); due allerte a confronto (STAY INSIDE contro LEAVE in un box rosso); mappina a griglia con distanza (400 M) e percorso tratteggiato; alone di luce sopra i tetti e cerchi concentrici per un suono dal cielo; ombra che scorre sulle tapparelle. Il motore lo sa fare in parte: chat (`phone` messages), `bar`, `clock`, `card`, `tint`. Non ancora: lo stato "not delivered" e i tre puntini nella chat, la mappina con il percorso, il cartello "VS" tra due allerte, l'ombra che passa sulle tapparelle, le bottiglie che si svuotano.
- 2026-10-29 (sera), dalle descrizioni dei video TikTok trovati (non ancora visti: li studia il guardiano): il titolo di serie "PART 1 · THE GYM" / "Night 1" dal primo fotogramma (il motore lo sa fare con `hud`); due personaggi identici in due stanze per la scelta "quale è vera" (il motore lo sa fare con due `person` uguali; ancora da fare: una piccola differenza da scoprire, come un'ombra che manca); l'inventario di una fattoria o di un faro nella `bar` (lo sa fare). Non ancora: le simulazioni 3D in POV dei what if (restiamo sulla carta).
- 2026-10-30, dal dilemma "quale delle due è vera" (*The Copy*, *On My Way*): le due versioni della stessa persona nella stessa immagine finale (l'auto col faro acceso al marciapiede e la sagoma nella finestra accesa), con i cartelli delle due parole sopra ciascuna. Il motore lo sa fare. Nuovi nel kit: il divano (`couch`, con `front: true` per coprire le gambe di chi è seduto), la tv (`tvSet`, schermo che si accende in g), la tazza fumante (`mug`), l'auto col faro (`car`), e per `person` l'espressione `smile` e i capelli con lo chignon (`hair`). Ancora da fare: i fasci (`beams`) non seguono da soli un foglio che si muove (oggi si spostano in `update`).
- 2026-10-30 (sera), dai "what if" faceless (ricerca web: gancio sotto i 3 secondi, immagine nuova ogni 2-4 s, mai un fotogramma fermo oltre 5): l'oggetto-simbolo che sparisce sulla parola (la Luna che si spegne su "disappeared") e una scheda crema con un righello per il numero che si condivide (3,8 cm l'anno). Il motore lo sa fare. Nuovi nel kit: la tartarughina vista dall'alto (`turtle`, con `rot` e pinne `k`), il corallo con i polipi che brillano (`coral`), la Luna come disco di carta che si può spegnere, alzare o allontanare (`paperMoon`). Ancora da fare: l'acqua che si ritira mostrando la sabbia bagnata (oggi si abbassa un foglio di mare).

## Temi di colore (dal 2026-10-30)
Ogni video ha un tema: `"theme": "<formato>/<umore>"` in `script.json`, e nelle scene `const T = theme('misteri', 'notte')` da `engine/kit/themes.js`.
- **Formati:** `your-call`, `what-if`, `misteri`, `regole`, `telefono`, `conto-alla-rovescia`, `fiaba`.
- **Umori:** `notte` (di base), `alba` (speranza, finale gentile), `allarme` (pericolo, svolta). Cambiare umore a metà video è uno sbalzo visivo: si può passare da `notte` ad `allarme` nell'inquadratura della rivelazione.
- **Uso:** fondo `T.sky`, fogli `T.far` → `T.mid` → `T.near`, luci `T.glow`, oggetto della storia `T.accent`. Sottotitoli e etichetta seguono il tema da soli.
- **Un solo colore acceso** per video oltre all'arancio della volpe.
- **Temi leggibili:** `tools/check.sh` misura il contrasto di tutti.
- **Scheda chiara:** per dati e regole, un'inquadratura color crema (`#efe8d8`) con testo nero e parola in `T.tag`: stacca dal buio.
- **Sistema a schermo:** ora, contatore o lista in alto restano fissi per tutto il video (`hud`, `bar`).

Figure, mostri, animali e la volpe in ogni video: `pipeline/FIGURE.md`.
