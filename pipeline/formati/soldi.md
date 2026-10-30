# Formato: I soldi che scottano

**Modello:** *You just stole $10 million* (saveo.house): 940 mila like e 12 mila commenti, analisi in `research/analisi/DecvxHktyGJ`. Fratelli: *You just found $20 million* (`DeiLquUOdXr`) e *You just robbed a bank* (`DemlE72OuLB`).

## La storia
"Tu" hai appena avuto una fortuna enorme e sbagliata (trovata, vinta, ereditata, caduta dal cielo) e scopri che il difficile comincia adesso. La storia è un pretesto per **fatti veri e sorprendenti** su come funzionano i soldi e le tracce che lasciano: quanto pesa un milione, perché una banconota si riconosce, chi si accorge di un'abitudine strana. Ogni capitolo è un "Problema" o una "Regola", e ogni errore fa salire il contatore del sospetto. Chi guarda impara qualcosa e alla fine sceglie.

Da noi la fortuna non nasce da un reato commesso da te: trovata, lasciata da qualcuno, arrivata per errore sul conto. Niente istruzioni pratiche per nascondere soldi o ingannare banche e polizia: il messaggio è sempre "ogni scelta lascia una traccia", e i fatti spiegano perché chi ci prova viene scoperto.

## Come apre
Una cifra enorme e un luogo misero nella stessa frase: "You just found $3 million. It's in a gym bag, in your car, in a supermarket parking lot." Il contatore in alto corre da $0 alla cifra nei primi 2 secondi.

## Elementi di scena
- `bar` fisso in alto per tutto il video: CASH · IN BANCA · SUSPICION 0% (o HEAT a quadretti), che sale a ogni errore.
- **Schede color crema** (`#efe8d8`, vedi `pipeline/VISIVO.md`) per i fatti: un oggetto che si moltiplica in una griglia (una banconota → 100.000 banconote → "100 kg"), una linea tratteggiata con il limite, un timbro rosso ("AUTOMATICALLY", "FLAGGED").
- Titoli di capitolo su fondo nero: "PROBLEM 1 · THE WEIGHT", "RULE 1", "DAY 2".
- Il telefono con lo sconosciuto che sa già tutto (`phone`): "Did you get both bags?" … "Good."
- Una lista dei sogni che si scrive (`card` o scheda): "1. Quit your job. 2. Pay off debts. 3. Buy parents a house."
- Un solo colore acceso (magenta, o verde dei soldi) su scene buie; la volpe con la lanterna come testimone.

## Ritmo
150-170 parole al minuto, un fatto ogni 5-8 secondi, un'immagine nuova ogni 1,5 s. 70-90 secondi. Capitoli: Problema 1, Problema 2, Regola, Giorno 2, "dove sei adesso" (riepilogo con i tre numeri).

## Come finisce
Riepilogo su scheda crema ("Day 3 · where you stand": $9,964,000 · $36,000 · SUSPICION 35%), poi la scelta tra due verbi: `choice` `{"question": "Hide it or spend it?", "a": {"word": "HIDE"}, "b": {"word": "SPEND"}}` oppure RETURN / KEEP. Poi `next` `{"title": "PART 2 TOMORROW", "sub": "The majority writes Part 2"}`.
