# Reel The Way (Remotion)

Video verticali per Instagram basati sul percorso di The Way, **interamente generati**: voce e immagini con ElevenLabs, montaggio con Remotion. Progetto separato dall'app: ha il suo `package.json`, il suo `tsconfig` e il suo lint; l'app lo esclude da typecheck e lint. Deriva dal progetto Reel di For You Football (ramo `video-remotion`), adattato a immagini generate al posto del girato.

Remotion è gratuito per persone singole e aziende fino a 3 dipendenti (licenza nel pacchetto `remotion`).

## Stato dello stile

**Da approvare** con il primo video (Elia e la voce sottile, `elia-lettura`). Un solo linguaggio: immagini dipinte, niente grafica.

- Verticale 1080×1920, 30 fps. Il video di Elia dura 50": la lettura intera ha bisogno di respiro.
- Testo della voce: la lettura parola per parola dal passo su Notion, poi il significato in poche frasi. Niente esercizio finale.
- Immagini: pittura a olio cinematografica, luce calda e dorata, grana leggera, colori un po' spenti, niente volti per i personaggi biblici (di spalle o coperti). Tutte dallo stesso riferimento del personaggio, collegato a ogni scena sul flow. Il meno possibile: un'immagine può raccontare più momenti con il `carrello` (la camera passa da un punto all'altro ai secondi indicati).
- Remotion fa solo tre cose: movimento lento di camera (`montaggio.ts`), dissolvenze tra le scene e al nero in chiusura, sottotitoli.
- Sottotitoli poco sotto la metà (`SOTTOTITOLI_TOP_Y = 0.6`): Cormorant Garamond 600 crema `#f3e8cf` con ombra morbida, niente pillola né contorno. A capo sulla punteggiatura, massimo 4-5 parole. Le parole in arrivo restano in trasparenza e si accendono quando la voce le dice. Parole chiave in corsivo oro `#d8b262`. Un velo scuro leggero dietro tiene il testo leggibile sui punti chiari.
- Logo della pagina sempre presente, in alto al centro (`MARCHIO_TOP_Y = 0.11`), sotto la barra di Instagram: croce, filo, "the way" e "LA VIA DEL CUORE", ridisegnati in `Marchio.tsx` in crema con ombra morbida (il logo originale è scuro su chiaro e sparirebbe sui dipinti). Resta anche sulle dissolvenze al nero. Le inquadrature si scelgono in modo che teste e volti stiano sotto il logo.
- Niente gancio, schede, icone o linee del tempo.
- Carosello con le stesse immagini: 1080×1350, una frase breve per slide presa dal testo, stessa tipografia dei sottotitoli su un velo scuro in basso, righe bilanciate. Riferimento biblico piccolo sulla prima slide. Logo in alto al centro su ogni slide.

## Come si fa un video

1. Proposta a Ste: passo del percorso, testo della voce (lettura + significato), scene, parole chiave. Si genera solo dopo il suo ok.
2. Tutto su un unico flow ElevenLabs ("The Way — Reel Instagram"). Ogni generazione costa crediti: mai rilanciarla per riprovare, una sola versione (`generations_count: 1`), prezzo (`estimate_only`) prima di generare. Le URL dei contenuti scadono dopo circa 2 ore: scaricare subito in `public/media/<nome>/` (fuori da Git).
3. Voce: nodo `tts` con la voce "Stef", modello `eleven_v4`, testo che inizia con `[relaxed]`.
4. Trascrizione con i tempi parola per parola: `creative_transcribe_audio` collegato al nodo della voce (Scribe, gratis sulle voci generate).
5. Immagini 9:16 2K con Nano Banana 2 (`gemini-3.1-flash-image`), il riferimento del personaggio collegato a ogni scena. Costi indicativi: 612 crediti senza riferimento, 918 con.
6. `src/progetti/<nome>.ts` (voce, durata, scene con il secondo di inizio, parole, parole chiave, slide del carosello) e aggiunta in `src/Root.tsx`.
7. Controllo su alcuni fotogrammi: `npx remotion still <nome> out/<nome>.png --frame=N`.
8. Render: `npx remotion render <nome> out/<nome>.mp4 --crf=18`. Carosello: `npx remotion still <nome>-carosello-N out/carosello/<nome>-N.png` per ogni slide.

## Comandi

```bash
npm i
npm run dev        # Remotion Studio
npm run lint       # eslint + tsc
```
