# Formato: Your Call

**Modello:** Your Call TV, *Eyes Down* Part 1 (`research/README.md`). In produzione: *Lantern Night* (`productions/2026-10-28-lantern-night-1`).

## La storia
"Tu" sei il protagonista, in seconda persona. Una notte normale si rompe (le luci si spengono, il telefono urla) e alla fine scegli tu. È la scheda più generale: gli altri tre formati con la scelta (conto alla rovescia, telefono, regole) sono suoi fratelli più specifici, quindi usali quando la storia ci sta.

## Come apre
L'ora precisa e un fatto: "It's 2:07 am, and every light in your town just went out." Poi la svolta contraria: "But your neighbors aren't scared."

## Elementi di scena
- `hud` {tag, part} con il nome della serie, e `clock` con l'ora che avanza.
- `card` per gli allarmi del telefono, `quote` e `vfx` per le voci degli altri.
- `tint: "red"` nei momenti di paura.
- La volpe con la lanterna come guida misteriosa: è la nostra firma.
- L'inventario contato (3 bottiglie, telefono al 41%) con `bar` o oggetti grandi in scena: torna nel finale come prezzo della scelta (dal 2026-10-29, *Eyes Down*).
- La minaccia non si vede mai: solo luce sopra i tetti, un suono, un'ombra sulle tapparelle, i vicini che cambiano.

## Come finisce
Il dilemma migliore sono **due ordini che si contraddicono**: l'allerta ufficiale dice "stay inside", un messaggio senza mittente dice "leave". Ogni scelta ha un costo detto in una riga ("Stay, and three bottles won't last. Go, and you might end up smiling too").
`choice` con GO/STAY o due parole simili. Con `next` "PART 2".
