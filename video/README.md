# Reel The Way (Remotion)

Video verticali per Instagram basati sul percorso di The Way, **interamente generati**: voce, immagini e clip con ElevenLabs, montaggio con Remotion. Progetto separato dall'app: ha il suo `package.json`, il suo `tsconfig` e il suo lint; l'app lo esclude da typecheck e lint. Deriva dal progetto Reel di For You Football (ramo `video-remotion`), adattato a immagini generate al posto del girato.

Remotion è gratuito per persone singole e aziende fino a 3 dipendenti (licenza nel pacchetto `remotion`).

## Stato dello stile

**Da approvare** con il primo video (Elia e la voce sottile). Proposta attuale, colori e font da `app/globals.css` dell'app (palette "Pergamena e Oro"), tutti in `src/reel/stile.ts`:

- Verticale 1080×1920, 30 fps, 20-40".
- Sottotitoli poco sotto la metà (`SOTTOTITOLI_TOP_Y = 0.6`), poche parole per volta: DM Sans 700 bianco con contorno pieno color notte `#1d2028`; la parola che sta dicendo in una pillola oro `#d8b262` con testo inchiostro; parole chiave in Cormorant Garamond corsivo crema `#f3e8cf`, oro quando le dice.
- Movimento: zoom alternato a ogni cambio di scena (1.08 / 1.20) più un lento movimento di camera dentro ogni scena (avvicina, allontana, panoramica): l'immagine non resta mai ferma.
- Gancio facoltativo nei primi 2,5": pillola pergamena, Cormorant corsivo.
- Inserti (`scheda`, `percorso`) solo quando aggiungono qualcosa: fondo notte, barra oro. Nel `percorso` le tappe `tenue` si accendono ma restano spente (es. "non qui").
- Immagini: stesso stile in tutte le scene, pittorico-cinematografico, luce calda e dorata, grana leggera, colori un po' spenti, niente volti per i personaggi biblici (di spalle o coperti).

## Come si fa un video

1. Proposta a Ste: tema dal percorso, testo della voce, scene, gancio, parole chiave. Si genera solo dopo il suo ok.
2. Tutto su un unico flow ElevenLabs ("The Way — Reel Instagram"). Ogni generazione costa crediti: mai rilanciarla per riprovare, prezzo (`estimate_only`) prima delle cose care. Le URL dei contenuti scadono dopo circa 2 ore: scaricare subito in `public/media/<nome>/` (fuori da Git).
3. Voce: `creative_generate_speech`, modello `eleven_v4`, testo che inizia con `[relaxed]`.
4. Trascrizione con i tempi parola per parola: `creative_add_flow_asset_node` sulla voce scelta, poi `creative_transcribe_audio` (Scribe, gratis sulle voci generate).
5. Immagini o clip per scena, 9:16. Le scene con lo stesso personaggio usano la prima immagine come riferimento.
6. `src/progetti/<nome>.ts` (voce, durata, scene con il secondo di inizio, parole, parole chiave, gancio, inserti) e aggiunta in `src/Root.tsx`.
7. Controllo su alcuni fotogrammi: `npx remotion still <nome> out/<nome>.png --frame=N`.
8. Render: `npx remotion render <nome> out/<nome>.mp4 --crf=18` (su Linux con `--browser-executable=/opt/pw-browsers/chromium`).

## Comandi

```bash
npm i
npm run dev        # Remotion Studio
npm run lint       # eslint + tsc
```
