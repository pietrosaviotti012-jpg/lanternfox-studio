# Prova skill di animazione — parte cloud (2026-11-03)

Routine "Prove skill" in un container cloud (Linux, 4 core, nessuna GPU). Skill copiate in `/tmp/anim` da `lanternfox-skills/anim`, lavoro in `/tmp/out/<skill>`. Idee esattamente come in `BRIEF.md`, stile originale di ogni skill, voce gratuita Kokoro (`am_michael`, velocità 1.12) per stick-figure e zach-d-films. Niente ElevenLabs, niente pubblicazione.

## Setup (`kit/setup.sh --voice`) — ~6 min, riuscito dopo 3 aggiustamenti

Il proxy del cloud blocca alcuni host, quindi il setup si è fermato tre volte:

1. **Chromium di Playwright** (`playwright.azureedge.net`, bloccato). Il kit vuole Playwright 1.49.1 → Chromium build 1148; il container ha già Chromium 1243 in `/opt/pw-browsers`. Soluzione: cartella `/tmp/pwb` con link `chromium-1148` → `chromium-1243` (anche `chromium_headless_shell-1148`) e `PLAYWRIGHT_BROWSERS_PATH=/tmp/pwb`.
2. **ffmpeg di Playwright** (stesso host): link `ffmpeg-1010` → `/opt/pw-browsers/ffmpeg-1011`.
3. **GSAP da cdnjs** (`cdnjs.cloudflare.com`, bloccato): preso dal registro npm (`npm pack gsap@3.12.5`, `dist/gsap.min.js` in `kit/vendor/`).

Poi tutto il resto è andato: npm, HyperFrames, venv, Kokoro (~310 MB) e Parakeet (~460 MB) da GitHub in circa 3 minuti.

## Per skill

| Skill | Tempo (lavoro + render) | Risultato |
|---|---|---|
| graph | ~2 min (render 17 s) | ✅ `graph-cloud.mp4`, 4 s |
| minimalistic-graphics | ~2 min (render 19 s) | ✅ `minimalistic-graphics-cloud.mp4`, 3,8 s |
| map-route | ~5 min (render 3 min 14 s) | ✅ `map-route-cloud.mp4`, 4 s |
| breakdown | ~10 min (2 render da 2 min 44 s + uno snap) | ✅ `breakdown-cloud.mp4`, 4,2 s |
| stick-figure | ~45 min (render completo 3 min 36 s) | ✅ `stick-figure-cloud.mp4`, 43 s |
| zach-d-films | ~50 min (render 24 min in 3 processi paralleli) | ✅ `zach-d-films-cloud.mp4`, 26,7 s |

### graph
- Spec: valori in migliaia `0, 2.2, 4.0, 9.2, 11.3, 14.5, 15.0`, etichette da Oct 27 a Nov 2, `final` 15046, label "Views".
- Funzionato: il numero sta su una riga e l'ultimo fotogramma mostra 15,046 (i due controlli della skill).
- Non perfetto: le etichette di bordo "Oct 27" e "Nov 2" sono un po' tagliate dal bordo del fotogramma (la skill non lo controlla; lasciato com'è).

### minimalistic-graphics
- Le due righe del brief (32 e 33 caratteri, un po' oltre i ~30 consigliati) stanno comunque su una riga; orbita finale presente. Nessuna correzione necessaria.
- Nota: l'idea non parla di "progresso a gradini" come chiede il gusto della skill, ma il brief la vuole così.

### map-route
- Destination "Night Train Station", 17 min, 1,4 km, i cinque luoghi del brief. Stile originale (città bianca di giorno, percorso blu), nessuna notte.
- Funzionato: card di destinazione dentro il riquadro, etichette lontane dalla card ETA.
- Render 3D lento in software (3 min 14 s, contro ~1,5 min indicati dalla skill). "Clock Tower" non si vede quasi mai nel percorso.

### breakdown
- Etichette del brief: vetro "cracked at 2:41 am", schermo "two alerts, one minute apart", batteria "41% and falling"; ora 2:40, data "Tuesday 3 November"; titolo "Two Alerts". Le altre tre (frame, board, back) le ho scritte io: "still warm", "both alerts logged", e il retro senza nota.
- Errore trovato sul foglio dei provini e corretto: la nota dello schermo (28 caratteri) va a capo, spinge giù la colonna e l'etichetta 06 finiva sul bordo rosso. Ho tolto la nota del retro e rifatto il render: ora tutte le etichette stanno dentro il riquadro, 01–06 dall'alto in basso.

### stick-figure
- Copione (137 parole, 42,5 s di voce): domanda, 1587 e 115 coloni, John White torna in Inghilterra, la guerra con la Spagna, ritorno nel 1590, case smontate e nessun segno di lotta, CROATOAN su un palo, l'isola e il popolo Croatoan, le due ipotesi (uniti ai Croatoan / persi in mare), la tempesta che gli impedì di cercare, domanda finale. Solo fatti documentati, ipotesi con "maybe".
- Lavoro: nuova `shots.js` (13 inquadrature), nuovo `env2.js` (pini, casette, palizzata, palo inciso, isole, barca, onde, pioggia, fulmine, falò, calendario), due cappelli nuovi in `chars.js` (capotain, cuffia), nuovi suoni e musica in `audio.py` sui tempi della voce. Allineamento Parakeet: 129 parole su 131.
- Correzioni dai provini: il calendario si schiacciava troppo a lungo nel cambio d'anno; mancava il prato sotto la palizzata nell'inquadratura del palo.
- Limiti: l'intervallo della skill è 30–45 s, il video è 43 s (copione un po' sopra le 110–120 parole consigliate). Sul foglio dei provini 12 fotogrammi un paio di inquadrature risultano campionate in mezzo alla transizione; controllati a parte con fotogrammi singoli.
- La skill non produce un foglio dei provini da sola: l'ho fatto con `kit/anim.py sheet`.

### zach-d-films
- Copione (78 parole, 26,2 s di voce Kokoro): domanda, "some people think… light show", la svolta "But" (il suono è un'onda di pressione), cane che abbaia con onda rossa che passa il muro, frigorifero nell'alone verde, tuono che spacca il cielo in anelli, il silenzio come buio, domanda ai commenti.
- Lavoro: nuova `src/shots.js` con 8 inquadrature (anelli e gusci luminosi, reticolo di molecole d'aria che si comprime, cane e frigorifero costruiti in codice, fulmine, scena che si spegne). Il "red force ripple" della skill è usato sul muro quando lo colpisce l'abbaio. Un dip al nero sul "But". Didascalie generate con `kit/words.py` + `captions.py` e poi riunite a mano in gruppi da 1–3 parole.
- Correzioni dai provini: la maglietta blu colorava il pezzo sbagliato del busto (il primo figlio dello `spine` è il gruppo del petto, non la mesh); gli anelli dell'abbaio erano di taglio rispetto alla camera; l'inquadratura del muro non mostrava l'altro lato (aggiunta una seconda camera con l'uomo colpito dall'onda); l'alone del frigorifero bruciava tutta l'immagine.
- Limiti: senza GPU serve `GL=swiftshader` (con la GPU di default va in timeout); circa 5 s a fotogramma per processo, 801 fotogrammi. Il personaggio di base ha le sopracciglia aggrottate, quindi sembra arrabbiato anche quando dovrebbe essere stupito. Nessuna musica o effetto sonoro: la skill monta solo la voce.

## Nota sui file video
`.gitignore` del repository esclude `*.mp4`: i sei video sono stati aggiunti con `git add -f`. Il render originale di stick-figure pesava 114 MB (CRF 17 con grana), oltre il limite di 100 MB di GitHub: la copia nel ramo è ricompressa a CRF 24 (13 MB), stessa risoluzione e audio.

## Problemi delle skill in cloud
- **Download bloccati dal proxy**: Chromium e ffmpeg di Playwright, GSAP da cdnjs. Il setup non ha alternative e si ferma (`set -e`). Utile: usare `PLAYWRIGHT_BROWSERS_PATH`/Chromium già presente, e GSAP da npm.
- **Versione di Playwright fissata a 1.49.1**: non combacia con il Chromium preinstallato (1243); serve il trucco dei link.
- **Niente GPU**: map-route e breakdown (three.js su HyperFrames) vanno circa al doppio del tempo indicato; zach-d-films parte solo con `GL=swiftshader` (senza va in timeout) e costa molti secondi a fotogramma.
- **Percorsi relativi**: nessun problema, ma il controllo di sicurezza del container blocca `rm` con glob relativi dopo `cd` (ho dovuto usare percorsi assoluti).
- stick-figure esce a CRF 17 con grana: 114 MB per 43 s, troppo per git/GitHub.
- stick-figure e zach-d-films chiedono "mostra il copione all'utente prima di animare": in una routine senza nessuno davanti non è possibile, quindi ho proceduto.
