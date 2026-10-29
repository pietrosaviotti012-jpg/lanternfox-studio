# Formato: Il telefono sa qualcosa

**Modello:** *STEPS 👣 3:12 AM*, analisi in `research/analisi/DfC8DBQo8N7`.

## La storia
Il telefono registra qualcosa che "tu" non hai fatto: passi mentre dormivi, il battito che sale alle 3:12, un percorso fino a un appartamento vuoto, messaggi da un contatto mai salvato. La paura nasce da numeri e schermate normali che dicono una cosa impossibile.

## Come apre
Un fatto impossibile e preciso: "You never left your bed last night. But your phone says you walked 4,212 steps." Il numero sale sullo schermo mentre la voce lo dice.

## Elementi di scena (obbligatori)
- `phone` su quasi ogni riga, con la schermata giusta:
  - `{"app": "steps", "value": 4212, "from": 124}`: il contapassi che sale;
  - `{"app": "health", "title": "Asleep 11:40 PM", "value": "140 bpm"}`: il battito;
  - `{"app": "map", "title": "Route · 3:12 AM", "to": "4B"}`: il percorso;
  - `{"app": "messages", "from": "Maya", "text": "ur sleepwalking 😅"}`: i messaggi;
  - `{"app": "lock", "time": "3:12", "notes": [{"app": "4B", "text": "You missed our walk."}]}`: le notifiche.
- `clock` con la notte: "NIGHT 1 · 3:12 AM".
- `name` quando entra un personaggio: `{"name": "MR. HALE", "role": "the landlord"}`.
- Il personaggio "tu" a letto, con la testa tonda (motivo `person`, espressioni `sleeping` e `scared`); i corridoi con le porte numerate (4A, 4B, 4C).

## Ritmo
Più lento (100-120 parole al minuto), ma il telefono cambia schermata a ogni frase. I numeri contano davanti agli occhi ("One step. Two. Three.").

## Come finisce
Una domanda a due strade: `choice` `{"question": "So, do you open the door?", "a": {"word": "OPEN IT"}, "b": {"word": "TEXT BACK"}}`. Poi `next`: `{"title": "NIGHT 2", "sub": "Follow for night 2"}`.
