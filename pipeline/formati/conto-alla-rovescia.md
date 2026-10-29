# Formato: Sopravvivenza a conto alla rovescia

**Modello:** *You Have 72 Hours* (you.have.72hours), Part 2 "The Knock": 87 mila like e 5.100 commenti. Analisi in `research/analisi/De5QPFnvk-i`.

## La storia
Un personaggio, o "tu", deve resistere per un tempo preciso (72 ore, 5 giorni) in un posto chiuso: rifugio, supermercato, appartamento. Ogni parte è un'ora o un giorno con un pericolo nuovo e una scelta. Fuori c'è qualcosa (radiazioni, nebbia, buio) e dentro bussa qualcuno che forse non è umano.

## Come apre
- **Dalla Part 2 in poi:** "Yesterday, most of you chose ___." Poi subito cosa è successo per colpa di quella scelta.
- **Part 1:** il primo minuto del pericolo, con il tempo che resta ("You have 72 hours. The shelter door locks in 10 seconds.").

## Elementi di scena (obbligatori)
- `bar` per tutto il video: `[{"label": "HOUR", "value": "04/72"}, {"label": "WATER", "value": "4 L/DAY"}, {"label": "FOOD", "value": "6/DAY"}, {"label": "OUTSIDE", "value": "FALLOUT", "alert": true}]`. Si aggiorna con `bar` sulle righe dove cambia (08/72, DANGER).
- `timer` quando si aspetta o il tempo stringe (`{"from": "63:59:22"}` oppure `{"wait": "10:00", "label": "WAITING"}`).
- `cctv` per il monitor di sicurezza (`{"cam": "CAM 01 · STAIRWELL B1"}`).
- La radio per le voci da fuori: riga con `vfx: "radio"` e scena con la radio (motivo da aggiungere al kit se manca: un apparecchio arancio con le onde).
- `quote` per quello che dice lo sconosciuto (corsivo rosso), con `vfx: "whisper"` se lo sussurra.
- `tint: "red"` nei 2-3 momenti di paura.
- Personaggio protagonista con un colore fisso (giallo o arancio) e un nome breve (Noah).

## Ritmo
150-175 parole al minuto, frasi da 4-8 parole, un'immagine nuova ogni 1,5 s, 70-85 secondi.

## Come finisce
`choice` con due parole e un sottotitolo: `{"question": "What should he do?", "a": {"word": "HIDE", "sub": "stay out of sight"}, "b": {"word": "CONFRONT", "sub": "face them"}, "note": "The majority writes Part 3."}`. La Community conta le parole nei commenti; la parte dopo segue la maggioranza.
