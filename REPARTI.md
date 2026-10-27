# Reparti dello Studio e skill assegnate

Ogni reparto è una stanza dell'ufficio e un passo della catena giornaliera. Lo schema dell'ordine è quello di `content-factory`; il pezzo che pubblica è nostro (Composio + Worker), non Ootto.

| # | Reparto | Skill (impiegati) | Cosa consegna al reparto dopo |
|---|---|---|---|
| 1 | Ricerca | `trend-spotter`, `content-research`, `reel-analyzer`, `agent-reach`, `virality` | 3 formati/storie che stanno funzionando, con il perché |
| 2 | Soggetto | `series-planner`, `content-calendar`, `content-pillar-builder` | la storia del giorno, dentro una serie riconoscibile |
| 3 | Copione | `going-viral`, `viral-hook-writer`, `ab-hook-tester`, `reel-scripter`, `on-screen-text-writer`, `cta-writer` | hook dei primi 3 s + copione 30-60 s, una riga per scena |
| 4 | Regia e stile | `lemo-opuscar` (prompt di stile, `DIRECTOR.md`), tabellone scene di `launch-video` | storyboard: scena per scena, stile fisso del profilo |
| 5 | Animazione | motore = slot (candidati: `lemo-opuscar` con `--size 1080x1920`, motore HTML→Chrome di `launch-video`, Remotion) | video muto 1080×1920 |
| 6 | Voce | **Chatterbox** (MIT). Ogni riga del copione porta la sua "recitazione": `exaggeration` 0.3-0.8 (calma → intensa), `cfg_weight` 0.3-0.5 (ritmo), velocità (atempo) e volume in dB (sussurro, normale, climax). Così tono e volume seguono la storia | narrazione + tempi parola per parola (faster-whisper, `av<19`) |
| 7 | Musica e suono | `lemo-opuscar` (`core/audio`: campionatore, sfx) | colonna sonora e effetti |
| 8 | Montaggio | `launch-video` (parole a tempo con la voce, `audio.py` per il mix), `cover-thumbnail-brief`; riferimento: MoneyPrinterTurbo (sottotitoli, ducking musica) | mp4 finale + copertina |
| 9 | Controllo qualità | `reel-analyzer` sul nostro video (fotogrammi + trascrizione) | ok / da rifare, con motivi |
| 10 | Revisione | (tu, dalla dashboard) | approvato / rifai |
| 11 | Pubblicazione | `caption-and-hashtags`, `hashtag-keyword-research`, `cross-platform-reformatter`, `best-time-scheduler` | post su IG e YT (Composio), TikTok (Higgsfield o bozza) |
| 12 | Community | `comment-responder`, `dm-script-writer`, `comment-mining` | risposte ai commenti, DM su parola chiave |
| 13 | Statistiche | `analytics-readout`, `content-audit`, `social-analytics-report` | cosa rifare e cosa smettere → torna alla Ricerca |

Una volta sola, in Fase 1: `bio-profile-optimizer`, `profile-conversion-audit` (nome, bio, profilo).

Non servono: carousel, LinkedIn, X, campagne a pagamento, creator/UGC, UTM, `ai-brain` (la memoria sta nel repo, non in Obsidian).
