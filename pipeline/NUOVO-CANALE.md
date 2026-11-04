# Guida: da Lantern Fox al nuovo canale

Scritta il 2026-11-04, dopo che "Strange Days #1" (fatto con la skill stick-figure) ha fatto buone visualizzazioni anche con un tema debole. È il piano, non è ancora partito: si comincia **dopo** aver visto come vanno i sei video di prova (`research/prove-skill/serie/BRIEF.md`). Ogni fase si approva prima di passare alla successiva.

## 0. Prima di decidere: cosa ci dicono i sei video
Aspettiamo **7 giorni** dall'uscita dell'ultimo. Confrontiamo, nel Numeri:
- le visualizzazioni nelle prime 48 ore e dopo 7 giorni;
- quanti restano dopo 3 secondi e quanti arrivano alla fine (TikTok, da Zernio);
- i commenti per mille visualizzazioni, perché la domanda finale serve a questo;
- stick-figure contro zach-d-films, e tutti e due contro gli ultimi 5 video Lantern Fox.

Ci sono tre esiti possibili:
- **vince un formato:** il canale si fa su quello, e l'altro resta per qualche puntata speciale;
- **vanno bene tutti e due:** alterniamo i due formati con un calendario fisso, per esempio storia vera il lunedì, mercoledì e venerdì, e "what if" il martedì e il giovedì;
- **nessuno dei due batte Lantern Fox:** ci fermiamo e non cambiamo niente.

## 1. Identità: nome, foto, voce
**Il nome:** corto (massimo 2 parole), facile da dire, libero come @ su tutte e tre le piattaforme e come dominio .com. Deve dire il genere: storia strana, misteri, "e se". Non deve somigliare a un canale che esiste già.
- Lo sceglie l'utente. Io preparo una lista di 10 nomi già controllati (handle liberi su TikTok, Instagram e YouTube, dominio, nessun marchio uguale) da cui scegliere.

**Foto profilo e grafica:**
- un personaggio o un simbolo nello stile della skill vincente, disegnato in codice, così è nostro: niente immagini prese da altri;
- una palette di 2-3 colori;
- un font per titoli e copertine;
- copertine con lo stesso schema per ogni video: una parola grande e il personaggio.

**La voce:** una sola voce Kokoro fissa per tutto il canale, la stessa velocità e lo stesso tono. Va scelta ascoltandone 3 sullo stesso copione.

**La bio:** una riga che promette cosa troverai ("True strange days from history. And what if."), più il link.

## 2. Cambiare i profili (lo fa l'utente)
Gli account restano gli stessi, così follower e visualizzazioni non si perdono. Cambiano solo nome, @ e foto.
- **YouTube:** si cambiano nome e @ del canale. Gli iscritti restano. Il vecchio @ resta collegato per un po'.
- **Instagram:** si cambiano username, nome e foto. I follower restano.
- **TikTok:** l'username si cambia **una volta ogni 30 giorni**, quindi va scelto bene. Prima del cambio va ricontrollato il collegamento con Zernio.

I vecchi video di Lantern Fox si possono **archiviare**: su Instagram si nascondono senza cancellarli, su YouTube si mettono "non in elenco". Così il profilo parla di una cosa sola, e i numeri restano.

Io non tocco gli account: preparo testi, foto e la lista dei passaggi, e li faccio controllare.

## 3. Migrare i dati
| Cosa | Dove sta oggi | Cosa ne facciamo |
|---|---|---|
| Numeri di tutti i video pubblicati | Ufficio → Numeri (`state.stats`) | restano, con un segno "vecchio formato" per non confonderli con i nuovi |
| Banca delle idee | `stories/BANCA.md` | teniamo le sezioni "Misteri e leggende vere" e "What if"; le storie con la volpe vanno in archivio |
| Ricerche e confronti | `research/` | restano, ma l'Analisi confronta i nuovi video con i video virali **dello stesso genere** |
| Calendario e Parte 2 | Ufficio → Calendario | la regola "Part 1 → Part 2" resta solo dove ha senso; la serie si numera (#1, #2…) |
| Suoni | `sounds/` (CC0) | si usano anche nei nuovi video: oggi la skill zach-d-films mette solo la voce |
| Video prova | ramo `prove-skill` | i progetti che funzionano diventano modelli in `formats/`; il ramo poi si cancella |

## 4. La nuova catena
Oggi la catena fa video di carta intagliata con il motore `engine/`. Nel nuovo canale:
1. **Ricerca** sceglie l'idea dalla banca e controlla i fatti (fonti scritte in `copione.md`).
2. **Copione:** 110-120 parole, gancio nei primi 2 secondi, domanda finale.
3. **Regia + animazione** con la skill (stick-figure o zach-d-films), seguendo il suo SKILL.md.
4. **Voce** con Kokoro e tempi delle parole con Parakeet (inclusi nelle skill).
5. **Suoni e musica** dalla nostra libreria, con le regole di `pipeline/SUONI.md`.
6. **Controllo qualità:** lo stesso di oggi (gancio, volume, parole che si capiscono, didascalie su una riga), più due voci nuove:
   - **"Fatti":** ogni frase ha una fonte;
   - **"Espressione":** il viso segue la frase. Nella prova di ieri il personaggio di zach-d-films sembrava sempre arrabbiato.
7. **Approva** nell'Ufficio, poi la **pubblicazione** come oggi (YouTube diretto, Instagram, TikTok con Zernio).

**Dove gira il render:**
- **stick-figure:** circa 4 minuti di render, va bene in cloud o su GitHub.
- **zach-d-films:** è 3D e senza scheda grafica impiega circa 25 minuti. Va diviso su più macchine GitHub, come facciamo già con i fotogrammi oggi (6 macchine insieme).

Le skill sono MIT: si possono usare e modificare, ma il loro file di licenza resta nel repository privato `lanternfox-skills`.

## 5. L'Ufficio
- Nuovo nome e nuovi colori, presi dall'identità della fase 1.
- Le case restano, ma cambiano i nomi dei reparti dove serve: per esempio la "Regia" diventa "Animazione 3D" quando lavora con zach-d-films.
- In Approva si vede quale formato è ogni video (stick-figure o 3D) e il numero della serie.
- Il Numeri confronta i formati tra loro.
- Il Worker, l'indirizzo e le chiavi restano gli stessi, così non c'è niente da ricollegare. Si può cambiare l'indirizzo più tardi.

## 6. Più pulito e professionale
- **Un solo stile per formato:** sempre lo stesso personaggio, la stessa palette, le stesse didascalie e la stessa chiusura ("Strange Days, part N").
- **Ritmo fisso:** 1-2 video al giorno alla stessa ora, ogni giorno.
- **Fatti veri sempre:** è ciò che dà credibilità a un canale di storia. Le leggende si dicono leggende.
- **Didascalie in inglese corretto** e hashtag pochi e precisi, 5-8.
- **Niente "AI slop":** ogni video si guarda nel foglio dei provini prima di Approva; se un'inquadratura è sbagliata, si rifà.

## 7. Monetizzazione
I video da 30-45 secondi vanno bene per crescere, ma **il TikTok Creator Rewards paga solo i video oltre 1 minuto** (e servono 10.000 follower). Quando il canale cresce, conviene fare anche versioni da 60-75 secondi delle storie migliori. YouTube Shorts paga dopo 1.000 iscritti e 10 milioni di visualizzazioni Shorts in 90 giorni. I dettagli sono nel Numeri, sezione "Quando si guadagna".

## Ordine dei lavori
1. Aspettiamo 7 giorni con i sei video, poi decidiamo.
2. Fase 1: preparo i nomi, l'utente sceglie, poi faccio foto, palette e voce.
3. Fase 2: l'utente cambia i profili con i testi che preparo.
4. Fase 3: migrazione dei dati, e i video vecchi in archivio.
5. Fase 4: nuova catena, provata con 3 video in Approva prima di renderla automatica.
6. Fase 5: nuovo aspetto dell'Ufficio.
7. Fase 6: il calendario fisso parte.
