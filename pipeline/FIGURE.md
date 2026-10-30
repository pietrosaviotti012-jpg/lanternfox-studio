# Come si disegnano le figure (mostri, animali, persone)

La guida del reparto Regia. I motivi sono in `engine/kit/motifs.js`.

## Le quattro regole
1. **Prima la sagoma.** Una figura deve capirsi tutta nera. Se non si capisce senza dettagli, cambia posa, non aggiungere dettagli.
2. **Un solo dettaglio acceso.** Occhi, lanterna, finestra, schermo: uno per figura. È lì che guarda chi vede il video.
3. **Grande è vicino, scuro è davanti.** Le figure più vicine alla camera sono le più scure. Mai un mostro chiaro su fondo chiaro.
4. **Tagliala.** Una figura tagliata dal bordo o da un foglio sembra più grande e fa più paura.

## Il mostro: mostra meno
Il mostro cresce in tre tempi, e il terzo spesso non serve.
1. **Traccia:** un suono, una luce che si spegne, una porta socchiusa, impronte. Nessuna figura.
2. **Parte:** occhi nel buio (`lurkers`), una mano sul vetro, un'ombra sul muro.
3. **Sagoma:** `tallShadow` o `hulk`, di notte, controluce, per un secondo o due. Mai ben illuminato, mai con la bocca e i denti in primo piano.

| Motivo | Quando usarlo |
|---|---|
| `lurkers` | occhi nel buio, nel bosco, sotto il letto: il mostro meno costoso e spesso il migliore; `pairs` li moltiplica |
| `tallShadow` | la cosa in fondo al corridoio, l'uomo sul lampione, chi ti guarda da lontano |
| `hulk` | la cosa enorme dietro la collina, sott'acqua, oltre il bosco: tienila tagliata |

Movimento: pochissimo, poi uno scatto. Un mostro fermo che all'inquadratura dopo è più vicino fa più paura di uno che cammina. Il video resta adatto a tutti: niente sangue, ferite o violenza mostrata.

## Gli animali
| Motivo | Carattere |
|---|---|
| `wolf` | minaccia a distanza; con gli occhi accesi va bene anche solo la sagoma |
| `raven` | presagio: appollaiato, un solo occhio acceso |
| `owl` | saggio o custode; gli occhi sono il dettaglio acceso |
| `cat` | inquietudine domestica: bastano due orecchie, gli occhi solo se serve |
| `deer` | pace; ma immobile al centro della strada di notte diventa strano |

## Le persone
`person` ha volto (`face`), giacca, capelli e braccia. Protagonista = un colore caldo pieno (giacca gialla o rossa): chi guarda lo ritrova subito in ogni inquadratura. Le comparse sono sagome scure.

## La volpe è in ogni video
Non deve parlare né fare la protagonista: basta che ci sia. Usa `foxCameo`:
- `pose: 'watch'`: seduta con la lanterna accesa, piccola (s ≈ 0,05-0,08), in un angolo della scena, in almeno un'inquadratura;
- `pose: 'window'`: spuntano testa e orecchie da un bordo, un davanzale, un cespuglio.

Chi guarda spesso la cercherà: mettila in un punto diverso ogni volta, e chiudi l'ultima inquadratura con la lanterna.

## I colori
Le figure prendono i colori dal tema del video (`engine/kit/themes.js`, vedi `pipeline/VISIVO.md`): sagome = `T.near`, luci = `T.glow`, oggetto della storia = `T.accent`.
