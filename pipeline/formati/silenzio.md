# Formato: Non fare rumore

**Modello:** *Dead Quiet · Day 1* (148 mila like, 2.166 commenti), analisi in `research/analisi/De19u8NRUys`. Fratello: *14 Floors Up · Day 3* (741 mila like, 21 mila commenti, `research/analisi/DekW1PjyfuH`) per le regole che si accumulano di puntata in puntata.

## La storia
Qualcosa che non vede ma sente. Ti trovi in un posto normale e pieno di piccoli rumori (supermercato, lavanderia, traghetto, biblioteca) e un'allerta ti dice di restare in silenzio. Ogni regola nasce da un oggetto quotidiano che fa rumore: il telefono, la ruota di un carrello, una lattina sullo scaffale. La paura sta tutta nel suono: un allarme che si interrompe a metà, il frigo che si spegne. La creatura si vede al massimo una volta, piccola e lontana. Alla fine qualcuno che non può stare zitto (un neonato, un cane, un carillon) mette davanti a una scelta morale.

## Come apre
Un posto banale, un'ora strana e un suono collettivo: "You're doing laundry at 1:30 am when every dryer in the room stops at once." Nel primo fotogramma ci sono già l'ora, il nome del posto e il misuratore NOISE.

## Elementi di scena
- **Misuratore NOISE** fisso in alto a destra (`bar` con una sola voce a 10 tacche, verde → giallo → rosso): si alza a ogni suono e scende quando si rispetta una regola. È l'HUD del pericolo, al posto delle risorse.
- `hud` in alto a sinistra: ora grande + nome del posto ("2:47 AM · SAVEMORE 24/7"), poi "NO POWER" quando va via la luce.
- Cartello di serie sul fotogramma 2: "DEAD QUIET · DAY 1" (il nostro titolo, mai il loro).
- Il telefono in mano (`phone`/`card`) con l'allerta che si scrive riga per riga.
- Le regole come cartello: bollino rosso "RULE #1" + titolo bianco + sottotitolo rosso che spiega ("NOT SILENT. OFF."), ognuna sopra l'oggetto in primo piano (il dito sul tasto di spegnimento, la mano che lascia il carrello, la lattina presa al volo).
- Il buio che arriva per pezzi: prima il corridoio, poi i lampioni fuori, poi quasi nero (con una luce `T.glow` sul soggetto: mai una scena tutta nera).
- Voce `whisper` da metà video in poi.

## Ritmo
120-140 parole al minuto, 70-80 secondi. Tre regole, tre suoni, tre oggetti. Un'immagine nuova ogni 1,5 s anche dentro un piano lungo.

## Come finisce
Primo piano di chi sta per fare rumore (il neonato col labbro che trema, il cane che annusa la porta), poi `choice` con un dilemma morale: `{"question": "The baby is about to cry", "a": {"word": "HELP"}, "b": {"word": "WALK AWAY"}}`. Poi `next` con il cartello di serie che passa da DAY 1 a DAY 2. Nelle puntate dopo le regole continuano la numerazione (RULE #4, #5…): chi arriva tardi va a cercare le prime.
