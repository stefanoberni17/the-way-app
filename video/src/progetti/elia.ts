import type { ReelProps, Slide } from "../reel/tipi";

// Video 1: Elia e la voce sottile, 1 Re 19:11-13 (settimana 3, passo 16).
// Voce "Stef" (eleven_v4, una versione): la lettura parola per parola dal testo
// del passo su Notion, poi il significato in cinque frasi. Tempi da ElevenLabs Scribe.
// Immagini dipinte, tutte dallo stesso riferimento di Elia: le 3 scene della prima
// prova, il riferimento stesso e una sola immagine nuova per vento, terremoto e fuoco.

const parole: ReelProps["parole"] = (
  [
  ["Dal", 0.08, 0.24], ["primo", 0.32, 0.56], ["libro", 0.64, 0.88], ["dei", 0.96, 1.08],
  ["Re.", 1.12, 1.68], ["Il", 2, 2.08], ["Signore", 2.16, 2.56], ["disse:", 2.68, 3.24],
  ["«Esci", 3.52, 4.08], ["e", 4.16, 4.24], ["fermati", 4.32, 4.72], ["sul", 4.76, 4.96],
  ["monte", 5.08, 5.28], ["alla", 5.4, 5.52], ["presenza", 5.64, 6], ["del", 6.08, 6.16],
  ["Signore.»", 6.32, 7.12], ["Ed", 7.2, 7.28], ["ecco", 7.36, 7.6], ["che", 7.64, 7.68],
  ["il", 7.76, 7.84], ["Signore", 7.96, 8.24], ["passò.", 8.4, 9.2], ["Ci", 9.28, 9.36],
  ["fu", 9.4, 9.44], ["un", 9.52, 9.6], ["vento", 9.68, 9.96], ["impetuoso", 10, 10.56],
  ["e", 10.64, 10.72], ["gagliardo", 10.827, 11.28], ["da", 11.36, 11.44],
  ["spaccare", 11.52, 11.92], ["i", 11.96, 12], ["monti", 12.08, 12.48], ["e", 12.56, 12.64],
  ["spezzare", 12.76, 13.12], ["le", 13.2, 13.28], ["rocce", 13.4, 13.6],
  ["davanti", 13.64, 13.92], ["al", 14, 14.08], ["Signore,", 14.16, 15.04], ["ma", 15.08, 15.12],
  ["il", 15.2, 15.28], ["Signore", 15.44, 15.92], ["non", 16, 16.16], ["era", 16.28, 16.4],
  ["nel", 16.48, 16.56], ["vento.", 16.64, 17.44], ["Dopo", 17.493, 17.6], ["il", 17.68, 17.72],
  ["vento,", 17.76, 18.32], ["un", 18.36, 18.4], ["terremoto,", 18.48, 19.44],
  ["ma", 19.48, 19.52], ["il", 19.6, 19.68], ["Signore", 19.76, 20.32], ["non", 20.4, 20.56],
  ["era", 20.68, 20.8], ["nel", 20.88, 20.96], ["terremoto.", 21.04, 21.92],
  ["Dopo", 21.973, 22.08], ["il", 22.16, 22.2], ["terremoto,", 22.24, 22.96], ["un", 23.04, 23.12],
  ["fuoco,", 23.2, 23.92], ["ma", 23.96, 24], ["il", 24.08, 24.16], ["Signore", 24.24, 24.72],
  ["non", 24.8, 24.96], ["era", 25.04, 25.2], ["nel", 25.32, 25.44], ["fuoco.", 25.48, 26.16],
  ["Dopo", 26.213, 26.32], ["il", 26.4, 26.48], ["fuoco,", 26.56, 27.2], ["il", 27.24, 27.28],
  ["sussurro", 27.44, 27.92], ["di", 28, 28.04], ["una", 28.08, 28.16], ["brezza", 28.24, 28.56],
  ["leggera.", 28.68, 29.32], ["Come", 29.52, 29.68], ["l'udì,", 29.72, 30.32],
  ["Elia", 30.4, 30.64], ["si", 30.72, 30.8], ["coprì", 30.88, 31.04], ["il", 31.08, 31.12],
  ["volto", 31.2, 31.44], ["con", 31.52, 31.6], ["il", 31.68, 31.72], ["mantello,", 31.76, 32.64],
  ["uscì", 32.8, 33.04], ["e", 33.36, 33.4], ["si", 33.44, 33.52], ["fermò", 33.6, 33.88],
  ["all'ingresso", 33.92, 34.44], ["della", 34.48, 34.56], ["caverna.", 34.64, 35.32],
  ["Elia", 35.52, 35.92], ["era", 36, 36.16], ["esausto", 36.32, 36.8], ["e", 36.96, 37.04],
  ["voleva", 37.093, 37.36], ["solo", 37.413, 37.52], ["sparire.", 37.6, 38.4],
  ["Si", 38.44, 38.48], ["aspettava", 38.56, 38.96], ["Dio", 39.04, 39.2], ["nella", 39.24, 39.44],
  ["forza,", 39.52, 40.16], ["nel", 40.24, 40.32], ["rumore,", 40.4, 41.04],
  ["nelle", 41.12, 41.2], ["cose", 41.28, 41.44], ["grandi.", 41.52, 42.2],
  ["Invece", 42.4, 42.88], ["Dio", 43.2, 43.36], ["arriva", 43.44, 43.68], ["in", 43.76, 43.84],
  ["un", 43.88, 43.92], ["sussurro.", 44, 44.84], ["Parla", 45.04, 45.28],
  ["piano.", 45.36, 45.84], ["E", 46.16, 46.24], ["per", 46.32, 46.4], ["sentirlo,", 46.48, 47.28],
  ["bisogna", 47.44, 47.76], ["fermarsi.", 47.84, 48.8],
  ] as [string, number, number][]
).map(([text, start, end]) => ({ text, start, end }));

const paroleChiave = ["fermati", "vento", "terremoto", "fuoco", "sussurro", "piano", "fermarsi"];

export const eliaLettura: ReelProps = {
  voce: "media/elia/voce-lettura.mp3",
  durata: 50,
  parole,
  paroleChiave,
  scene: [
    // «Dal primo libro dei Re… Esci e fermati sul monte… il Signore passò»:
    // da Elia alla caverna la camera si allarga sul monte.
    {
      da: 0,
      file: "media/elia/scena-02.png",
      carrello: [
        { a: 0, x: 0.74, y: 0.44, zoom: 1.55 },
        { a: 2, x: 0.74, y: 0.44, zoom: 1.5 },
        { a: 9.3, x: 0.55, y: 0.5, zoom: 1.08 },
      ],
    },
    // Vento, terremoto, fuoco: una sola immagine, la camera scende dal cielo
    // (rocce spezzate) alla crepa e poi al fuoco, ognuno sulla sua frase.
    {
      da: 9.28,
      file: "media/elia/scena-tempesta.png",
      carrello: [
        { a: 9.28, x: 0.62, y: 0.25, zoom: 1.75 },
        { a: 16.9, x: 0.64, y: 0.27, zoom: 1.82 },
        { a: 18.4, x: 0.65, y: 0.52, zoom: 1.75 },
        { a: 21.4, x: 0.66, y: 0.54, zoom: 1.82 },
        { a: 22.9, x: 0.55, y: 0.82, zoom: 1.7 },
        { a: 26.2, x: 0.55, y: 0.84, zoom: 1.78 },
      ],
    },
    // «Dopo il fuoco, il sussurro… si coprì il volto con il mantello»
    // Inquadratura un po' bassa: il cappuccio resta sotto il logo.
    { da: 26.21, file: "media/elia/scena-07.png", inquadratura: { x: 0.45, y: 0.2, zoom: 1.35 } },
    // «Elia era esausto e voleva solo sparire…»
    { da: 35.52, file: "media/elia/scena-01.png", inquadratura: { x: 0.5, y: 0.55, zoom: 1.08 } },
    // «Invece Dio arriva in un sussurro… bisogna fermarsi»: Elia fermo, guarda lontano.
    // Inquadratura stretta e bassa: la testa scende sotto il logo.
    { da: 42.4, file: "media/elia/riferimento-elia.png", inquadratura: { x: 0.5, y: 0.15, zoom: 1.6 } },
  ],
};

// Carosello con le stesse immagini: una frase per slide, presa dal testo della voce.
export const eliaCarosello: Slide[] = [
  {
    file: "media/elia/scena-02.png",
    frase: "Esci e fermati sul monte alla presenza del Signore.",
    inquadratura: { x: 0.7, y: 0.4, zoom: 1.15 },
    nota: "1 Re 19,11-13",
  },
  {
    file: "media/elia/scena-tempesta.png",
    frase: "Ma il Signore non era nel vento.",
    inquadratura: { x: 0.6, y: 0.15, zoom: 1.25 },
  },
  {
    file: "media/elia/scena-tempesta.png",
    frase: "Ma il Signore non era nel terremoto.",
    inquadratura: { x: 0.62, y: 0.55, zoom: 1.3 },
  },
  {
    file: "media/elia/scena-tempesta.png",
    frase: "Ma il Signore non era nel fuoco.",
    inquadratura: { x: 0.5, y: 0.95, zoom: 1.15 },
  },
  {
    file: "media/elia/scena-07.png",
    frase: "Dopo il fuoco, il sussurro di una brezza leggera.",
    inquadratura: { x: 0.5, y: 0.25, zoom: 1 },
  },
  {
    file: "media/elia/scena-01.png",
    frase: "Si aspettava Dio nella forza, nel rumore, nelle cose grandi.",
    inquadratura: { x: 0.5, y: 0.6, zoom: 1 },
  },
  {
    file: "media/elia/riferimento-elia.png",
    frase: "Dio parla piano. E per sentirlo, bisogna fermarsi.",
    inquadratura: { x: 0.5, y: 0.3, zoom: 1 },
  },
].map((s) => ({ ...s, paroleChiave }));
