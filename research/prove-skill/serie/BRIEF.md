# Sei video con le skill di animazione (2026-11-04)

Dopo "Strange Days #1 · The Dark Day of 1780" (stick-figure), che è andato bene anche senza essere perfetto, proviamo sul serio i due formati: tre video **stick-figure** e tre **zach-d-films**. Temi presi dalle Idee (`stories/BANCA.md`), scelti tra quelli più forti. Ogni video lo fa una routine cloud a parte, poi dal PC va in Approva: si pubblica solo dopo l'ok dell'utente.

**Stile:** quello originale di ogni skill, senza adattarlo a Lantern Fox. In inglese, voce gratuita Kokoro (mai ElevenLabs), 30-45 s, copione 110-120 parole. Solo fatti documentati: se un dettaglio non è sicuro, si toglie; le leggende si dicono leggende.

| Id | Skill | Titolo | Idea |
|---|---|---|---|
| `strange-days-2` | stick-figure | Strange Days #2 · The Dancing Plague of 1518 | Luglio 1518, Strasburgo: una donna, Frau Troffea, comincia a ballare in strada e non si ferma per giorni. In un mese si uniscono decine di persone (le cronache parlano di centinaia). Le autorità pensano che serva ballare ancora: fanno costruire un palco e chiamano musicisti. Ipotesi: isteria collettiva in un anno di fame e malattie. Domanda finale ai commenti, "Strange Days, part 2". |
| `strange-days-3` | stick-figure | Strange Days #3 · Flight 19 | 5 dicembre 1945: cinque aerei Avenger della Marina partono dalla Florida per un volo di addestramento. Il capo squadriglia crede di essere fuori rotta, la radio si sente sempre peggio, il carburante finisce. Nessun relitto trovato. Uno degli idrovolanti mandati a cercarli (un PBM Mariner) sparisce anche lui: una nave vede fiamme in mare. Niente "Triangolo delle Bermuda" come spiegazione: dirlo come la leggenda che ne è nata. "Strange Days, part 3". |
| `strange-days-4` | stick-figure | Strange Days #4 · The Great Moon Hoax | Agosto 1835: il giornale The Sun di New York pubblica per sei giorni che un enorme telescopio in Sudafrica ha visto sulla Luna bisonti, unicorni blu e uomini-pipistrello con le ali. Le copie vanno a ruba e molti ci credono. Era tutto inventato; il giornale non ha mai chiesto scusa sul serio. "Strange Days, part 4". |
| `what-if-1` | zach-d-films | What if Earth stopped spinning for one second? | All'equatore ci muoviamo a circa 1.670 km/h con la Terra: se si ferma lei, noi, l'aria e il mare no. Venti fortissimi, l'oceano che corre verso est, tutto ciò che non è attaccato al suolo che vola. Solo fatti della fisica, niente numeri inventati. Domanda finale ai commenti. |
| `what-if-2` | zach-d-films | What if gravity switched off for five seconds? | Per cinque secondi niente gravità: le persone si sollevano piano, l'acqua del bicchiere fluttua in gocce, l'aria comincia ad allontanarsi. Poi la gravità torna e tutto ricade. Chiusa: "What hits the ground first when it comes back?" |
| `what-if-3` | zach-d-films | What if the oceans drained overnight? | Al mattino il mare non c'è più: si cammina sul fondo, si vedono le fosse più profonde, i relitti, le navi sdraiate sulla sabbia; resta acqua solo nei punti più bassi. Fatti veri. Chiusa: "Where would you walk first?" |

**Per zach-d-films:** l'espressione del personaggio deve seguire il copione (stupito, spaventato), non sempre le sopracciglia aggrottate come nella prova di ieri. In cloud non c'è GPU: `GL=swiftshader`, render diviso in 3 processi paralleli (vedi `research/prove-skill/cloud/RESOCONTO.md` sul ramo `prove-skill`).

**Cosa salvare** sul ramo `prove-skill`, in `research/prove-skill/serie/<id>/`:
- `<id>.mp4` (sotto 90 MB, altrimenti ricomprimere a CRF 24; `git add -f`, perché `.gitignore` esclude `*.mp4`);
- `cover.jpg`, un fotogramma forte e chiaro;
- `meta.json`: `{"id", "title", "caption", "hashtags": [...]}`. La didascalia è in inglese, 2-3 frasi più la domanda; gli hashtag sono 5-8;
- `copione.md` con il copione e le fonti dei fatti;
- il foglio dei provini e i file del progetto, senza node_modules, modelli e audio intermedi.
