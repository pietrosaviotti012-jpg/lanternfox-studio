# I suoni: i pacchetti per formato

La guida di Regia e Copione. Fino al 2026-10-30 ogni video usava gli stessi effetti sintetici e lo stesso carillon. Ora in `sounds/` ci sono registrazioni vere, tutte CC0 o pubblico dominio (`sounds/LICENZE.md`, una riga per file). Niente attribuzione obbligatoria, niente suoni di film o di librerie commerciali.

## Come funziona, senza fare niente
`sounds/PACCHETTI.json` assegna a ogni formato tre cose:
- **la musica:** una traccia vera, scelta dal nome della produzione. Gli umori di `music` decidono solo quanto è forte. Il carillon resta solo per le fiabe;
- **l'ambiente:** un fondo sotto tutto il film, sempre diverso da un video all'altro;
- **lo scambio:** i nomi generici di `sfx` nel `shots.js` diventano suoni del formato. In un What if `wind` è il vento di Marte registrato dalla NASA, in un Telefono `chime` è una tastiera che compone.

Ogni famiglia ha più file: la scelta dipende dalla produzione, e se un suono torna nello stesso video cambia file. Non scegliere mai un file a mano: scrivi la famiglia.

## Cosa deve fare la Regia
In `sfx` usa **i suoni che raccontano la storia**, non solo `wind` e `whoosh`. Almeno 3 suoni specifici per video, sincronizzati con ciò che si vede o si dice:
```js
sfx: [{ t: .4, type: 'knock', v: .9 }, { t: 1.6, type: 'door-creak', v: .8 }, { t: 0, type: 'siren', d: 5, v: .5 }]
```
`t` è il momento dentro l'inquadratura, `v` il volume (.3-1). `d` è la durata, per i suoni lunghi. Il silenzio conta: prima di un suono forte togli gli altri.

| Formato (`meta.format`) | Musica | Ambiente | Suoni tipici |
|---|---|---|---|
| `your-call` | `m-suspense`, `m-dread` | `room`, `wind`, `forest` | `door-creak` `knock` `breath` `whisper` `steps` `dog` `creature` `siren` `phone-ring` |
| `what-if` | `m-cosmic` | `space`, `mars-wind` | `rumble` `whale` `radio` `morse` `crowd` `clock` `boom` `alarm` `cosmic-hit` |
| `mystery` | `m-mystery` | `waves`, `cave`, `wind` | `foghorn` `raven` `wolf` `door-metal` `horses` `fire` `water` `bell` `clock` |
| `rules` | `m-dread`, `m-tense` | `radio`, `room` | `knock` `door-creak` `elevator` `breath` `whisper` `siren` `clock` `phone-dead` |
| `phone` | `m-tense`, `m-suspense` | `static`, `room` | `phone-ring` `typing` `monitor` `car` `steps` `knock` `breath` `modem` |
| `countdown` | `m-urgent` | `static`, `cave` | `alarm` `alarm-home` `siren` `radio` `morse` `clock` `train` `crowd` `rumble` |
| `fable` | carillon | `forest`, `water` | `raven` `cat` `horses` `bell` `foghorn` `chimes` |

Tutte le famiglie sono in `sounds/CATALOGO.json`: anche quelle di un altro formato si possono usare se la storia lo chiede. Restano i vecchi nomi sintetici: `click`, `whoosh`.

## Tempo e volume (dalle misure di Real SFX su 13 film professionali)
- **Il colpo cade sull'evento.** Il mix mette il punto più forte di un suono breve sul momento scritto in `t`, non il suo inizio: scrivi in `t` l'istante in cui la porta sbatte, non quando comincia il gesto. `"anchor": "start"` fa partire il suono da `t`.
- **Sempre un suono nei primi 2 secondi**, oltre alla musica: il Controllo qualità lo segnala in Approva.
- **La voce comanda.** Gli effetti stanno 6-10 dB sotto la voce, e mai una parola importante sopra un colpo (`pipeline/VOCE.md`).
- **Poco e giusto.** Nei film di riferimento solo una parte degli eventi ha un suono preciso: meglio pochi suoni nel punto giusto che uno su ogni taglio.

## Ascoltare la libreria
Noi non sentiamo, earshot sì. `tools/sounds_listen.py` confronta ogni file con quello che la sua famiglia dovrebbe essere e dice se è una registrazione vera: il risultato è in `sounds/ASCOLTO.md`, con in cima i file da sostituire. Va rifatto quando si aggiungono suoni. Gira sul computer dell'utente, dove earshot è installato (`~/tools/earshot`).

## Per cambiare
Nel `script.json`: `"track": "m-dread"` cambia la musica, `"track": "carillon"` rimette il carillon, `"bed": "cave"` cambia l'ambiente, `"bed": false` lo toglie.

## Per aggiungere suoni
Nuova voce in `tools/sounds_list.json`, poi `python tools/sounds_fetch.py`: controlla la licenza file per file. Solo fonti che permettono il download automatico. BigSoundBank, OpenGameArt e Kenney hanno suoni CC0, ma chiedono ai robot di non scaricarli: da lì può prenderli solo una persona. Mai musica di tendenza o suoni presi da altri video.
