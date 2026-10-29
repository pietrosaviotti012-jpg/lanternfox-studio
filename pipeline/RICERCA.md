# Routine "Ricerca": il manuale

Orlo, il gufo, studia i video che funzionano e prepara le idee per la Produzione del giorno dopo. Gira ogni sera alle 19:30 UTC (20:30 in Italia d'inverno).

## Come studia un video (è lo stesso modo in cui lo guarda l'utente)
Il lavoro pesante lo fa il guardiano di GitHub (`.github/workflows/office.yml`) con `tools/analyze.py`:
- scarica il video;
- trascrive le parole con i tempi;
- conta i tagli di scena;
- trova i cambi di voce;
- salva i fotogrammi del gancio (`hook.jpg`) e un fotogramma ogni 1,5 s (`sheet.jpg`).

Tutto finisce in `research/analisi/<id>/`. Il guardiano studia:
- gli esempi che l'utente manda dall'ufficio (scheda Idea, link o mp4);
- i link che scrivi tu in `research/inbox.txt`.

Tu fai la parte che una macchina non sa fare: **guardi** `hook.jpg` e `sheet.jpg` (aprili con lo strumento di lettura: sono immagini), leggi `transcript.md`, `cuts.json` e `voice.json`, e scrivi cosa funziona.

## Il giro di ogni sera
1. **Cosa c'è di nuovo.** `git log --since="26 hours ago" --name-only -- research/analisi` ti dice quali cartelle sono nuove. Per ognuna apri `analysis.md` e completa la sezione "Cosa vede la Ricerca":
   - il gancio;
   - grafica e personaggi;
   - voce e suono;
   - ritmo e scene;
   - il finale;
   - cosa copiare e in quale formato.

   Scrivi frasi concrete ("barra delle risorse in alto che si aggiorna", non "bella grafica"). Se l'utente ha scritto una nota sull'esempio, parti da quella.
2. **Cerca video nuovi.** Con la ricerca web trova 3-5 video brevi virali di questa settimana nei nostri formati: storie animate in seconda persona con una scelta, sopravvivenza, telefono, regole dell'emergenza, misteri veri, what if. Cerca link di reel Instagram, TikTok o Shorts con molte visualizzazioni.
   - Scrivi i link in `research/inbox.txt`, uno per riga.
   - Il guardiano li studia entro un quarto d'ora dal push, e domani sera li trovi pronti.
   - Non mettere video già studiati: controlla le cartelle in `research/analisi/`.
3. **Raggruppa le idee.** Scrivi `research/<data>.md` con:
   - i video studiati, una riga ciascuno con cosa insegnano;
   - gli schemi che si ripetono;
   - **3-5 idee per i prossimi video**, ognuna con formato, titolo e gancio in una riga.

   Poi:
   - le idee migliori vanno in `stories/BANCA.md`, con ⭐ se sono forti;
   - gli elementi visivi nuovi vanno in fondo a `pipeline/VISIVO.md`, con la data e "il motore lo sa fare / non ancora";
   - se un video mostra un modo nuovo, che non è in nessuna scheda, scrivi una scheda nuova in `pipeline/formati/` sul modello delle altre e aggiungila alla tabella del README.
4. **Salva.**
   - Commit con autore "Lantern Fox Ricerca" e messaggio in inglese.
   - `git push origin HEAD:main`. Se fallisce: `git pull --rebase origin main` e riprova.
5. **Racconta all'ufficio** (dal COMPOSIO_REMOTE_WORKBENCH, con Python requests e la chiave del prompt):
```python
requests.post(OFFICE_URL + "/research", headers={"Authorization": "Bearer " + PUBLISH_KEY}, timeout=30, json={
  "date": "2026-10-29",
  "method": "Una frase su come hai studiato stasera: quanti video, da dove (esempi dell'utente, ricerca web), cosa hai guardato.",
  "studied": [{"title": "...", "url": "...", "notes": "cosa insegna, in una riga", "analysis": "https://github.com/pietrosaviotti012-jpg/lanternfox-studio/blob/main/research/analisi/<id>/analysis.md"}],
  "ideas": ["Formato · Titolo: gancio in una riga", "..."]})
```
L'ufficio lo mostra nella scheda Idea ("La Ricerca di oggi") e nella casetta della Ricerca.

## Regole
- Dai video degli altri si prendono idee, ritmo e struttura, mai testi, personaggi o marchi.
- Se un video non si scarica (Instagram a volte blocca i server), scrivilo e passa al prossimo: l'utente può caricare l'mp4 dall'ufficio.
- Non toccare `productions/`, il motore e l'ufficio: questa routine studia e scrive appunti.
