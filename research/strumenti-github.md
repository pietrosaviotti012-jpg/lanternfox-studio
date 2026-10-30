# Strumenti su GitHub per fare i video (2026-10-30)

Stelle lette dall'API di GitHub il 2026-10-30. Sono giudizi dalla descrizione e dalla licenza: **nessuno di questi è stato provato**. Nostro motore: Lemo-Opuscar, voce Chatterbox, controllo Faster-Whisper. Vincolo: niente GPU, tutto su GitHub Actions gratuito.

## Da provare, in quest'ordine
1. **WhisperX** (m-bain/whisperX, 24.947 stelle, BSD-2): tempi parola per parola più precisi di Faster-Whisper. Servono ai sottotitoli pop e a far cadere i suoni sulla parola giusta. Si cambia solo un pezzo di `tools/voice.py`.
2. **Kokoro** (hexgrad/kokoro, 9.793 stelle, Apache-2.0): voce leggera che gira bene senza GPU. Utile per le voci di contorno, se Chatterbox è lenta.
3. **VibeVoice** (microsoft/VibeVoice, 55.054 stelle, MIT): voci con più personaggi nello stesso dialogo. Da provare per i Your Call parlati; va verificato se regge su macchine senza GPU.
4. **ACE-Step** (ace-step/ACE-Step, 5.003 stelle, Apache-2.0): genera musica originale. Servirebbe una GPU: buono più avanti, se le tracce FreePD diventano ripetitive.

## Motori di video da codice: da conoscere, non da cambiare
Lemo-Opuscar fa già il nostro stile di carta e il cambio costerebbe tutte le scene. Conviene guardare come lavorano.
| Progetto | Stelle | Licenza | A cosa serve |
|---|---|---|---|
| 3b1b/manim | 95.905 | MIT | animazioni di spiegazione: idee per i What if con grafici |
| heygen-com/hyperframes | 75.914 | Apache-2.0 | video scritti in HTML, pensato per gli agenti |
| remotion-dev/remotion | 69.092 | propria, da controllare per uso commerciale | video in React |
| ManimCommunity/manim | 42.020 | MIT | versione della comunità di Manim |
| motion-canvas/motion-canvas | 19.598 | MIT | animazioni da codice in TypeScript |
| lemomo-ai/lemo-opuscar | 9.720 | MIT | il nostro motore |

## Skill per agenti
| Progetto | Stelle | Cosa contiene |
|---|---|---|
| anthropics/skills | 185.100 | la raccolta ufficiale di skill |
| remotion-dev/skills | 5.909 | skill di Remotion: utile solo se si usa Remotion |

Una ricerca specifica di skill Claude Code per i video ha trovato solo progetti con meno di 10 stelle: nessuno è abbastanza provato per fidarsi.

## Voce: altre alternative
| Progetto | Stelle | Licenza | Nota |
|---|---|---|---|
| coqui-ai/TTS | 46.175 | MPL-2.0 | fermo dal 2024 |
| 2noise/ChatTTS | 39.965 | AGPL-3.0 | licenza che obbliga a condividere il codice |
| fishaudio/fish-speech | 33.494 | da controllare | licenza da leggere prima dell'uso |
| resemble-ai/chatterbox | 27.435 | MIT | la nostra voce |
| SWivid/F5-TTS | 15.489 | MIT | codice libero, i modelli vanno controllati |
| rhasspy/piper | 11.314 | MIT | le nostre voci di rubrica |

## Immagini, musica, catene già pronte
| Progetto | Stelle | Licenza | Nota |
|---|---|---|---|
| Comfy-Org/ComfyUI | 144.163 | GPL-3.0 | generazione di immagini, serve una GPU |
| facebookresearch/audiocraft | 23.776 | MIT il codice | MusicGen: i pesi dei modelli sono per uso non commerciale, verificare |
| Stability-AI/stable-audio-tools | 3.895 | MIT il codice | i modelli hanno licenze a parte |
| harry0703/MoneyPrinterTurbo | 136.510 | MIT | video da argomento con spezzoni di stock: stile opposto al nostro |
| FujiwaraChoki/MoneyPrinterV2 | 32.253 | AGPL-3.0 | idem |
| elebumm/RedditVideoMakerBot | 12.562 | GPL-3.0 | video da post Reddit |
| RayVentura/ShortGPT | 8.091 | MIT | fermo dal 2025 |
| Zulko/moviepy | 15.058 | MIT | montaggio in Python: ffmpeg ci basta |
| mifi/editly | 5.574 | MIT | fermo dal 2025 |
