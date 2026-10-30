# I formati di Lantern Fox Tales (le "skill" dei video)

Ogni formato è una ricetta ripetibile: che storia racconta, come apre, quali elementi di scena usa, come finisce. Il Soggetto sceglie il formato, Copione e Regia seguono la sua scheda.
Le schede nascono dai video studiati dalla Ricerca (`research/analisi/`). Quando la Ricerca trova un video forte con un modo nuovo, scrive una scheda nuova o migliora una di queste.

| Formato | Scheda | Nato da | Elementi chiave |
|---|---|---|---|
| Your Call | `your-call.md` | Your Call TV, *Eyes Down* | seconda persona, ora che avanza, scelta GO/STAY |
| Sopravvivenza a conto alla rovescia | `conto-alla-rovescia.md` | *You Have 72 Hours* (87 mila like) | barra delle risorse, timer, radio, monitor, scelta della maggioranza |
| Il telefono sa qualcosa | `telefono.md` | *STEPS* | app del telefono che raccontano: passi, battito, mappa, messaggi |
| Le regole dell'emergenza | `regole.md` | *DON'T OPEN IT* (50 mila like) | allerta in tv con regole numerate, spioncino, il piano che non esiste |
| What if | `what-if.md` | — | domanda impossibile, conseguenze passo per passo |
| Misteri e leggende vere | `misteri.md` | — | fatto preciso, la leggenda dichiarata |
| I soldi che scottano | `soldi.md` | *You just stole $10 million* (940 mila like) | cifra enorme nel gancio, contatore del sospetto, fatti veri su schede crema, HIDE/SPEND |

## Cosa hanno in comune i video che funzionano (tutti e quattro i modelli)
- **Un'immagine nuova ogni 1,5 secondi**, anche quando la scena non cambia: il telefono passa a un'altra schermata, un numero sale, un oggetto entra.
- **Numeri precisi** nel gancio e nella storia (4.212 passi, 23° piano, 31 minuti, 64 ore): rendono vero l'impossibile.
- **Personaggi semplici con la testa tonda e gli occhi grandi**: la paura si legge subito. Un colore forte sui vestiti (cappello arancio, piumino giallo).
- **Interfacce in scena**: telefono, tv, monitor di sicurezza, radio, timer, barra in alto. Sono immagini che il pubblico riconosce in mezzo secondo.
- **Voci diverse nei momenti giusti**: il sussurro dello sconosciuto, la radio, la voce del bambino dall'ascensore. La frase detta da un altro personaggio è scritta tra virgolette, in corsivo e in un altro colore.
- **Le serie**: Part 2 riparte dalla scelta della maggioranza ("Yesterday, most of you chose shut"), il finale chiede una parola sola ("Comment HIDE or CONFRONT") e dice che decide la maggioranza.
- **Il rosso** pieno o filtrato nei momenti di pericolo, senza mostrare niente di cruento.

## Gli elementi che il motore sa disegnare (`script.json`)
Vedi `pipeline/VISIVO.md` per il dettaglio. In breve:
- per tutto il video: `hud`, `bar` (la barra delle risorse), `fx`, `choice` (cartello finale a due scelte), `next` (cartello "Follow for Part 2");
- per riga: `em`, `hit`, `clock`, `card` (notifica), `phone` (schermata del telefono), `tv` (allerta con regole), `cctv` (monitor di sicurezza), `peephole` (spioncino), `timer`, `bar` (aggiorna i valori), `tint` (rosso), `quote` (frase di un altro personaggio), `name` (nome e ruolo), `vfx` (voce: `radio`, `phone`, `whisper`, `child`, `robot`).
- nelle scene (`engine/kit/motifs.js`): `person` (personaggio con testa tonda: espressioni `calm`, `scared`, `surprised`, `sleeping`).

Ogni formato ha il suo tema di colore in `engine/kit/themes.js`, un narratore in `pipeline/VOCE.md` e il suo pacchetto di suoni in `pipeline/SUONI.md`.
