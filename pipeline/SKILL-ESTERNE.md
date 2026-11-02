# Skill esterne per i video

Installate il 2026-11-02 dalla guida "Free sound tools for Claude videos" di vedd.ai e dal kit di Aleksei Media. Il codice è stato letto prima di installarlo: sotto, cosa fa, dove sta e come lo usiamo.

| Strumento | Cosa fa | Licenza | Dove sta | Controllo di sicurezza |
|---|---|---|---|---|
| **earshot** (Leonxlnx, 3.539 stelle) | "Orecchie" per Claude: dice che suono è un file, se somiglia a una descrizione, se è una registrazione vera; ascolta un film secondo per secondo e lo giudica | MIT | `~/tools/earshot` (ambiente Python suo), skill `earshot` e `real-sound` in `~/.claude/skills` | Gira tutto sul computer. I modelli sono scaricati una volta a una versione fissata, in formato sicuro (safetensors). L'unica parte che manda audio fuori (a Google) parte solo con una chiave Gemini, che non abbiamo |
| **Real SFX** (Clipwing, 50 stelle) | Mette suoni veri di una libreria sui momenti giusti di un video, sotto la voce, e dà un rapporto | nessuna dichiarata | `~/.claude/skills/real-sfx`, collegata alla libreria `sounds/` | Nessuna chiamata di rete nascosta. Scarica un modello da Hugging Face solo se lo chiedi (controlla la dimensione, non l'impronta). La pagina di ascolto resta sul computer, salvo l'opzione `--lan` |
| **Cinematic Motion** (Aleksei Media) | Video in codice con Remotion e three.js: camera 3D, testi animati, vetro, luce | nessuna dichiarata | `~/.claude/skills/cinematic-motion` | File identici a quelli pubblicati con impronta SHA-256 sul sito. Pacchetti fissati nel file di blocco, installati senza script; il browser per il render si scarica solo con controllo dell'impronta |

**Senza licenza = mai in pubblico.** Real SFX e Cinematic Motion non dichiarano una licenza: non si copiano in questo repository, che è pubblico. Stanno nel repository **privato** `pietrosaviotti012-jpg/lanternfox-skills`, che le routine Produzione, Regia e Analisi clonano accanto a questo: all'inizio del giro le copiano in `~/.claude/skills`. In cloud il lavoro è in `/home/user/lanternfox-studio`, le skill in `/home/user/lanternfox-skills`. Mai commit o push nel repository delle skill dalle routine: si aggiornano dal computer dell'utente, dopo aver riletto le differenze.

**Openverse** (5,2 milioni di audio liberi) non si usa in automatico: il suo `robots.txt` chiede ai programmi di non usare `/v1/audio/`. Si può cercare a mano su openverse.org e scaricare solo file CC0.

## Come li usiamo
- **Ascoltare la libreria:** `tools/sounds_listen.py` con earshot → `sounds/ASCOLTO.md`. I file che non somigliano alla loro famiglia si sostituiscono.
- **Le regole di Real SFX** sono entrate nel nostro mix e nel Controllo qualità (`pipeline/SUONI.md`, "Tempo e volume"): il punto più forte del suono sull'evento, un suono nei primi 2 secondi, effetti sotto la voce.
- **Giudicare ogni video finito:** su GitHub, dopo il montaggio, `tools/earshot_check.py` fa ascoltare il film a earshot (circa 2 minuti, modelli in cache) e il Controllo qualità mostra in Approva la voce "Suono (earshot)". È un consiglio, non ferma mai la catena. Il giudizio di gusto resta all'utente: earshot misura tempi e volumi, non le emozioni, e i suoi riferimenti sono film promozionali, non storie.
- **Cinematic Motion** non sostituisce il nostro stile di carta intagliata. Serve per contenuti diversi, quando arriveranno: un trailer di una serie, un promo del profilo, un video con testi e grafici in movimento, un formato nuovo. Le regole della volpe, dei colori (`engine/kit/themes.js`) e dei suoni (`sounds/`, tutti CC0) valgono anche lì.
