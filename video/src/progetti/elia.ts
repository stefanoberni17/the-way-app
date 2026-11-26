import type { ReelProps, Slide } from "../reel/tipi";

// Video 1: Elia e la voce sottile, 1 Re 19:11-13 (settimana 3, passo 16).
// Voce "Stef" (eleven_v4, una versione): la lettura parola per parola dal testo
// del passo su Notion, poi il significato: Dio non arriva sempre con gesti grandi,
// a volte nelle cose più semplici e sottili. Tempi da ElevenLabs Scribe.
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
  ] as [string, number, number][]
).map(([text, start, end]) => ({ text, start, end }));

// Il finale: la fine della lettura e il significato, generato a parte
// (voce-finale.mp3) e attaccato dopo «…della caverna» a FINALE secondi.
const FINALE = 35.8;
const paroleFinale = (
  [
  ["Ed", 0.137, 0.16], ["ecco,", 0.24, 0.8], ["sentì", 1.04, 1.36], ["una", 1.44, 1.52],
  ["voce", 1.6, 1.84], ["che", 1.88, 1.92], ["gli", 2, 2.08], ["diceva:", 2.16, 2.88],
  ["«Che", 3.12, 3.28], ["fai", 3.36, 3.6], ["qui,", 3.68, 3.88], ["Elia?»", 3.92, 4.8],
  ["Elia", 5.04, 5.44], ["aveva", 5.52, 5.84], ["appena", 5.96, 6.24], ["vinto", 6.28, 6.56],
  ["la", 6.6, 6.64], ["sua", 6.72, 6.88], ["battaglia", 6.96, 7.36], ["più", 7.4, 7.52],
  ["grande,", 7.6, 8.4], ["eppure", 8.52, 9.04], ["era", 9.16, 9.28], ["esausto", 9.44, 9.92],
  ["e", 10.16, 10.24], ["voleva", 10.28, 10.64], ["solo", 10.72, 10.88], ["sparire.", 10.96, 12.08],
  ["Si", 12.12, 12.16], ["aspettava", 12.24, 12.64], ["Dio", 12.72, 12.88], ["nella", 12.92, 13.2],
  ["forza,", 13.32, 13.92], ["nel", 14, 14.08], ["rumore.", 14.24, 15.2], ["Ma", 15.24, 15.28],
  ["il", 15.36, 15.44], ["Signore", 15.56, 16], ["non", 16.08, 16.16], ["arriva", 16.24, 16.64],
  ["sempre", 16.72, 16.96], ["con", 17.04, 17.12], ["gesti", 17.2, 17.52], ["grandi.", 17.68, 18.48],
  ["A", 18.52, 18.56], ["volte", 18.64, 18.96], ["passa", 19.08, 19.24], ["nelle", 19.28, 19.52],
  ["cose", 19.627, 19.84], ["più", 19.88, 20.08], ["semplici", 20.2, 20.6], ["e", 20.64, 20.72],
  ["sottili:", 20.8, 21.84], ["una", 21.92, 22], ["brezza", 22.08, 22.32], ["leggera,", 22.4, 23.28],
  ["un", 23.36, 23.44], ["silenzio,", 23.52, 24.56], ["una", 24.64, 24.72], ["domanda.", 24.8, 25.56],
  ["È", 25.84, 26], ["così", 26.08, 26.24], ["anche", 26.32, 26.56], ["nella", 26.6, 26.8],
  ["nostra", 26.84, 27.12], ["vita.", 27.2, 28], ["Dio", 28.04, 28.48], ["parla", 28.56, 28.8],
  ["piano.", 28.84, 29.68], ["E", 29.76, 29.84], ["per", 29.88, 29.92], ["sentirlo,", 30, 30.96],
  ["bisogna", 31.08, 31.36], ["fermarsi.", 31.44, 32.32],
  ] as [string, number, number][]
).map(([text, start, end]) => ({ text, start: start + FINALE, end: end + FINALE }));

const paroleChiave = [
  "fermati",
  "vento",
  "terremoto",
  "fuoco",
  "sussurro",
  "semplici",
  "sottili",
  "piano",
  "fermarsi",
];

export const eliaLettura: ReelProps = {
  voce: "media/elia/voce-lettura.mp3",
  // La lettura si ferma dopo «…della caverna»; poi entra la voce del finale.
  voci: [
    { file: "media/elia/voce-lettura.mp3", da: 0, taglio: 35.45 },
    { file: "media/elia/voce-finale.mp3", da: FINALE },
  ],
  durata: 70,
  parole: [...parole, ...paroleFinale],
  paroleChiave,
  // Da «Il Signore disse» a «Che fai qui, Elia?»: il testo del passo, tra virgolette.
  lettura: { da: 2, a: FINALE + 4.9 },
  apertura: {
    percorso: "Settimana 3 · Passo 16",
    titolo: "Elia e la voce sottile",
    riferimento: "1 Re 19,11-13",
    fino: 7,
  },
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
    // «Elia aveva appena vinto… esausto… si aspettava Dio nella forza, nel rumore»
    { da: FINALE + 5.04, file: "media/elia/scena-01.png", inquadratura: { x: 0.5, y: 0.55, zoom: 1.08 } },
    // «Ma il Signore non arriva sempre con gesti grandi… una brezza, un silenzio,
    // una domanda»: di nuovo il monte, largo e quieto, la camera si allontana piano.
    {
      da: FINALE + 15.24,
      file: "media/elia/scena-02.png",
      movimento: "allontana",
      inquadratura: { x: 0.55, y: 0.5, zoom: 1.1 },
    },
    // «È così anche nella nostra vita. Dio parla piano… bisogna fermarsi»:
    // Elia fermo, guarda lontano. Testa sotto il logo.
    {
      da: FINALE + 25.84,
      file: "media/elia/riferimento-elia.png",
      inquadratura: { x: 0.5, y: 0.15, zoom: 1.6 },
    },
  ],
};

// Carosello con le stesse immagini: una frase per slide, presa dal testo della voce.
export const eliaCarosello: Slide[] = [
  {
    file: "media/elia/scena-02.png",
    frase: "Esci e fermati sul monte alla presenza del Signore.",
    inquadratura: { x: 0.7, y: 0.4, zoom: 1.15 },
    nota: "Passo 16 · 1 Re 19,11-13",
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
    frase: "Il Signore non arriva sempre con gesti grandi.",
    inquadratura: { x: 0.5, y: 0.6, zoom: 1 },
  },
  {
    file: "media/elia/scena-02.png",
    frase: "A volte passa nelle cose più semplici e sottili.",
    inquadratura: { x: 0.55, y: 0.5, zoom: 1 },
  },
  {
    file: "media/elia/riferimento-elia.png",
    frase: "Dio parla piano. E per sentirlo, bisogna fermarsi.",
    inquadratura: { x: 0.5, y: 0.3, zoom: 1 },
  },
].map((s) => ({ ...s, paroleChiave }));
