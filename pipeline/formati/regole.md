# Formato: Le regole dell'emergenza

**Modello:** *DON'T OPEN IT* (dontopenit.stories): 50 mila like, analisi in `research/analisi/DfDdT8sxlnq`.

## La storia
Arriva un'allerta con delle regole numerate ("RULE 1 STAY INSIDE · RULE 2 DO NOT USE THE STAIRS · RULE 3 TRUCKS LEAVE AT DAWN ON DAY 5"). Chi non le rispetta sparisce. Poi qualcosa ti chiede di infrangere una regola: l'ascensore che funziona senza corrente, una voce gentile, un piano che non esiste.

## Come apre
"Imagine you're ___ (un posto normale e preciso: watching TV on the 23rd floor), when ___ (le sirene, l'allerta)."

## Elementi di scena (obbligatori)
- `tv` per l'allerta: `{"title": "EMERGENCY ALERT", "rule": "RULE 1", "text": "STAY INSIDE", "ticker": "AFTER DAY 5 THE CITY WILL BE SEALED · STAY INSIDE"}`. Una regola per riga, così ogni regola ha la sua immagine.
- `peephole` (spioncino) quando guardi fuori: il corridoio, l'ascensore, chi bussa. Funziona benissimo con `tint: "red"`.
- `clock` con il giorno e quanto manca: "DAY 2/5 · 2:58 AM · TRUCKS IN 3 DAYS".
- La città che si spegne finestra per finestra (motivi case e palazzi del kit).
- La voce che parla da fuori (ascensore, citofono) con `vfx: "child"` o `vfx: "robot"`, in `quote`.
- Un dettaglio che non torna, mostrato grande: la pulsantiera senza il 13, il numero cerchiato in rosso.

## Ritmo
110-130 parole al minuto, parole chiave colorate (giallo-verde e azzurro funzionano), 75-85 secondi.

## Come finisce
`choice` `{"question": "Do you get in the elevator?", "a": {"word": "GET IN"}, "b": {"word": "STAY"}}`, poi `next` `{"title": "PART 2", "sub": "Follow for part 2"}`.
