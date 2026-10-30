# La voce: rubrica e sbalzi

La guida di Copione e Voce. Nasce dalla misura di 8 reel virali (`research/analisi/`, 2026-10-30): 45 cambi di voce messi in fila con le parole dette in quel momento.

## La rubrica
`voices/RUBRICA.json` elenca 31 voci sintetiche, 15 maschili e 16 femminili, con tipo e uso. Ogni voce è una clip in `voices/<id>.wav`.
- **Il narratore** del video: `"voice": {"preset": "<id>"}` in `script.json`. Senza, decide il formato.
- **Un'altra voce per una riga** (dialoghi, personaggi): `"speaker": "<id>"` sulla riga. Esempio: `{"id": "L07", "text": "Don't open the door.", "speaker": "sussurro"}`.
- Massimo 3 voci nello stesso video, più gli effetti: oltre non si capisce chi parla.
- Scegli il personaggio prima della voce: un mostro `mostro`, una voce al telefono `donna-misteriosa`, un'allerta `uomo-radio` o `giornalista`, un sistema `donna-assistente`, un vecchio custode `anziano-inglese`.

## Quando cambia la voce
**Uno sbalzo ogni 8-15 secondi.** Sono 2-11 per video: più ce ne sono, più il video è parlato da "personaggi" (i reel *Your Call* arrivano a 11). Non stanno mai a caso: ogni sbalzo segue un cambio nella storia.

| Momento della storia | Cosa fa la voce | Come si scrive |
|---|---|---|
| **Qualcuno parla da uno schermo:** allerta, SMS letto, radio, chiamata | suono stretto, più acuto | `"vfx": "radio"` o `"phone"`, oppure `speaker` |
| **Prima di una rivelazione** ("Here's what you don't know") | più bassa e lenta | `gain_db` −4, `speed` .88; `gap` .7 prima |
| **Il pericolo è vicino** ("You don't breathe") | sussurro | `"vfx": "whisper"` o `speaker: "sussurro"` |
| **La rivelazione o la cosa brutta** ("That's not me") | più scura, frase corta | `intensity` +.15, `speed` .9, `hit` sulla parola |
| **Il tempo stringe,** elenchi di numeri o azioni | più veloce e forte | `speed` 1.05, `gain_db` +2, `gap` .2 |
| **Il finale con la scelta** ("Comment A or B") | forte e chiara, torna il narratore | `gain_db` +2, nessun effetto |

## Regole
1. **I primi 5 secondi sono piatti e decisi:** il gancio non si recita, si dice. Il primo sbalzo arriva sulla svolta, di solito tra 5 e 8 secondi.
2. **Un cambio, poi si torna.** Dopo una riga "altra", il narratore riprende subito nel tono normale: è il ritorno che fa sentire lo sbalzo.
3. **Il silenzio è uno sbalzo.** Il `gap` di .7-1 secondi prima della riga forte vale quanto una voce diversa.
4. **Mai due effetti di fila** e mai effetti su frasi lunghe: una riga con effetto ha al massimo 8 parole.
5. **Ritmo:** 130-170 parole al minuto. Le righe veloci si compensano con le pause.
