# La voce: rubrica e sbalzi

La guida di Copione e Voce. Nasce dalla misura di 10 reel virali (`research/analisi/`, 2026-10-30): 58 cambi di voce trovati, e quelli di 6 reel messi in fila con le parole dette in quel momento. Le regole sono una sintesi: da confermare con i numeri dei nostri video.

## La rubrica
`voices/RUBRICA.json` elenca 29 voci sintetiche, 14 maschili e 15 femminili, con tipo e uso. La licenza di ogni voce Piper è in `voices/LICENZE-PIPER.md`: niente voci con licenza non commerciale. `uomo-del-nord` è CC-BY-SA: se si usa, citarla nella descrizione del video. Ogni voce è una clip in `voices/<id>.wav`.
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

## Pause: quanto dura ogni silenzio
Il `gap` è il silenzio dopo la riga. Sono la parte della recitazione che ci costa meno e si sente di più.

| Dopo cosa | `gap` | Perché |
|---|---|---|
| Una riga del gancio (primi 5 secondi) | .15-.3 | Chi guarda deve restare: qui niente vuoti |
| Una frase normale del racconto | .3-.45 | Il respiro naturale |
| Le voci di un elenco o un conto alla rovescia | .15-.25 | Crea fretta |
| La riga prima della rivelazione | .7-1 | Chi guarda deve restare sospeso |
| La rivelazione | .5-.8 | Lascia il tempo di capire |
| La domanda finale, prima di "Your call" | .4-.6 | Il tempo di scegliere |
| "Your call. Comment GO or STAY." | .2 | Il film finisce sulla scelta, non sul vuoto |

- **Mai sopra 1,3 secondi,** e un silenzio oltre 1 secondo solo due volte per video: su un telefono un vuoto lungo sembra un video bloccato.
- **Nel silenzio lungo succede qualcosa:** un rumore, un'ombra, una luce. Solo voce ferma e immagine ferma insieme fanno scorrere via.
- **Nel totale** le pause fanno il 15-20% della durata della voce.

## Pause dentro la riga e parole forti
- **Una riga, un'idea, una parola forte:** quella in `em`. Se servono due parole forti, sono due righe.
- **La pausa dentro la frase** è la punteggiatura di `"say"`: la virgola è breve, i puntini sono lunghi. `"text": "It wasn't me."`, `"say": "It wasn't... me."` I sottotitoli restano quelli di `text`. Una pausa vera, più di mezzo secondo, sono due righe con il `gap` in mezzo.
- **La frase che si spezza:** chiudi la riga con il trattino, `gap` .05, e la riga dopo parte subito, più forte: è un'interruzione.
- **Numeri e ore** si dicono più lenti: `speed` .9 sulla riga, e scrivi in `say` il numero a parole se Chatterbox sbaglia ("two oh seven am").
- **Il nome che fa paura** si dice piano, non forte: `gain_db` −2, `speed` .88.

## La voce e i suoni
- **Prima il suono, poi la voce:** dopo un colpo forte (`thunder`, `boom`, `knock`) la riga parte .3-.5 secondi dopo. Mai una parola importante sopra un colpo.
- **La parola, poi il suono:** se la riga annuncia il suono ("Then it knocks."), il suono arriva nel `gap` dopo la riga, non prima.
- **Sussurro e voce bassa:** niente musica forte sotto. Quella scena ha umore `hush`.
- **Dopo un sussurro** torna il narratore normale, non più forte: lo sbalzo basta.

## Domande e finale
- **Una domanda vera sale, una domanda retorica scende.** "Who's at the door?" sale. Per farla salire: frase corta, punto interrogativo, nessuna parola dopo.
- **L'ultima riga non rallenta:** `speed` .97-1, `gain_db` +2. Il rallentamento finale suona come una fine, e noi vogliamo un commento.
- **La Parte 2** apre con il risultato detto piano e chiaro, `gap` .5, poi riparte il racconto.

## Regole
1. **I primi 5 secondi sono piatti e decisi:** il gancio non si recita, si dice. Il primo sbalzo arriva sulla svolta, di solito tra 5 e 8 secondi.
2. **Un cambio, poi si torna.** Dopo una riga "altra", il narratore riprende subito nel tono normale: è il ritorno che fa sentire lo sbalzo.
3. **Il silenzio è uno sbalzo.** Il `gap` di .7-1 secondi prima della riga forte vale quanto una voce diversa.
4. **Mai due effetti di fila** e mai effetti su frasi lunghe: una riga con effetto ha al massimo 8 parole.
5. **Ritmo:** 130-170 parole al minuto. Le righe veloci si compensano con le pause.
