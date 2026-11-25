import type { ReelProps, Scena } from "../reel/tipi";

// Video 1 (prova di stile): Elia e la voce sottile, 1 Re 19:11-13 (settimana 3, passo 16).
// Voce "Stef" (eleven_v4, versione 1), tempi parola per parola da ElevenLabs Scribe.
// Due prove con la stessa voce e la stessa grafica:
//   A "elia-grafica": solo grafica animata in Remotion, zero crediti oltre alla voce;
//   B "elia-mista": come A, ma le scene 1, 2 e 7 sono immagini Nano Banana 2.

const parole: ReelProps["parole"] = (
  [
    ["Elia", 0.08, 0.64], ["era", 0.72, 0.96], ["esausto.", 1.12, 2.16], ["Aveva", 2.24, 2.48],
    ["appena", 2.6, 2.8], ["vinto,", 2.88, 3.6], ["eppure", 3.72, 4.24], ["voleva", 4.32, 4.72],
    ["solo", 4.76, 4.96], ["sparire.", 5.04, 6.16], ["Dio", 6.2, 6.48], ["gli", 6.56, 6.64],
    ["dà", 6.72, 6.8], ["appuntamento", 6.88, 7.52], ["su", 7.6, 7.68], ["un", 7.72, 7.76],
    ["monte.", 7.84, 8.72], ["Passa", 8.84, 9.04], ["un", 9.12, 9.2], ["vento", 9.32, 9.52],
    ["che", 9.56, 9.6], ["spacca", 9.76, 10.16], ["le", 10.2, 10.24], ["rocce.", 10.32, 11.2],
    ["Ma", 11.28, 11.36], ["Dio", 11.44, 11.84], ["non", 11.92, 12.0], ["è", 12.04, 12.08],
    ["nel", 12.16, 12.32], ["vento.", 12.52, 13.28], ["Poi", 13.387, 13.6], ["un", 13.68, 13.76],
    ["terremoto.", 13.84, 14.8], ["Non", 14.88, 14.96], ["è", 15.04, 15.08], ["nel", 15.12, 15.28],
    ["terremoto.", 15.36, 16.24], ["Poi", 16.293, 16.4], ["un", 16.48, 16.64], ["fuoco.", 16.68, 17.36],
    ["Non", 17.44, 17.52], ["è", 17.56, 17.6], ["nemmeno", 17.68, 18.0], ["lì.", 18.08, 18.64],
    ["Poi", 18.773, 19.04], ["arriva", 19.12, 19.44], ["un", 19.48, 19.52], ["sussurro.", 19.6, 20.56],
    ["Una", 20.64, 20.72], ["brezza", 20.8, 21.12], ["leggera.", 21.24, 22.08], ["E", 22.16, 22.24],
    ["lì,", 22.32, 22.8], ["Elia", 22.92, 23.12], ["si", 23.2, 23.28], ["copre", 23.36, 23.6],
    ["il", 23.64, 23.68], ["volto.", 23.76, 24.64], ["Spesso", 24.72, 25.04], ["cerchiamo", 25.12, 25.52],
    ["le", 25.56, 25.6], ["risposte", 25.72, 26.16], ["nel", 26.24, 26.32], ["rumore,", 26.44, 27.04],
    ["nelle", 27.12, 27.2], ["cose", 27.28, 27.52], ["grandi.", 27.72, 28.4], ["Ma", 28.44, 28.48],
    ["la", 28.52, 28.56], ["voce", 28.64, 28.88], ["che", 28.96, 29.04], ["conta", 29.12, 29.52],
    ["parla", 29.76, 30.08], ["piano.", 30.213, 30.88], ["Per", 30.96, 31.04], ["sentirla,", 31.2, 31.92],
    ["devi", 32.0, 32.16], ["prima", 32.24, 32.48], ["fermarti.", 32.6, 33.6], ["Oggi,", 33.64, 34.24],
    ["cinque", 34.32, 34.56], ["minuti", 34.72, 34.96], ["di", 35.04, 35.08], ["silenzio.", 35.12, 36.08],
    ["Niente", 36.187, 36.4], ["schermi.", 36.48, 37.28], ["Solo", 37.4, 37.52], ["ascolto.", 37.64, 38.4],
  ] as [string, number, number][]
).map(([text, start, end]) => ({ text, start, end }));

// Le dieci scene, agganciate alla prima parola di ogni frase.
const sceneGrafica: Scena[] = [
  { da: 0, grafica: "deserto" }, // Elia era esausto…
  { da: 6.2, grafica: "monte" }, // Dio gli dà appuntamento su un monte
  { da: 8.84, grafica: "vento" }, // Passa un vento…
  { da: 13.387, grafica: "terremoto" }, // Poi un terremoto…
  { da: 16.293, grafica: "fuoco" }, // Poi un fuoco…
  { da: 18.773, grafica: "brezza" }, // Poi arriva un sussurro…
  { da: 22.16, grafica: "mantello" }, // E lì, Elia si copre il volto
  { da: 24.72, grafica: "rumore" }, // Spesso cerchiamo le risposte nel rumore…
  { da: 28.44, grafica: "respiro" }, // Ma la voce che conta parla piano… fermarti
  { da: 33.64, grafica: "silenzio" }, // Oggi, cinque minuti di silenzio…
];

const base: ReelProps = {
  voce: "media/elia/voce.mp3",
  durata: 39.6,
  scene: sceneGrafica,
  parole,
  paroleChiave: ["vento", "terremoto", "fuoco", "sussurro", "piano", "fermarti", "silenzio"],
  gancio: "Dio non era nel terremoto",
  frasi: [
    { parole: [["esausto.", 1.12]], a: 6.0 },
    { parole: [["non", 11.92], ["nel", 12.16], ["vento.", 12.52]], a: 13.3 },
    { parole: [["non", 14.88], ["nel", 15.12], ["terremoto.", 15.36]], a: 16.25 },
    { parole: [["nemmeno", 17.68], ["lì.", 18.08]], a: 18.75 },
    { parole: [["un", 19.48], ["sussurro.", 19.6]], a: 22.1, oro: ["sussurro"] },
    { parole: [["nel", 26.24], ["rumore.", 26.44]], a: 28.4 },
    { parole: [["parla", 29.76], ["piano.", 30.213]], a: 32.5 },
    { parole: [["fermarti.", 32.6]], a: 33.6, oro: ["fermarti"] },
  ],
  inserti: [
    { tipo: "scheda", da: 6.3, a: 8.75, titolo: "1 Re 19:11-13", sottotitolo: "Elia sul monte Oreb" },
    {
      tipo: "percorso",
      a: 22.1,
      tappe: [
        { quando: 9.32, etichetta: "Vento", sotto: "non qui", tenue: true },
        { quando: 13.84, etichetta: "Terremoto", sotto: "non qui", tenue: true },
        { quando: 16.68, etichetta: "Fuoco", sotto: "non qui", tenue: true },
        { quando: 19.6, etichetta: "Sussurro", sotto: "qui" },
      ],
    },
  ],
};

// Prova A: solo grafica animata.
export const eliaGrafica: ReelProps = base;

// Prova B: le scene dove Elia conta di più (1, 2, 7) diventano immagini generate.
const IMMAGINI: Record<number, string> = {
  0: "media/elia/scena-01.png",
  1: "media/elia/scena-02.png",
  6: "media/elia/scena-07.png",
};
export const eliaMista: ReelProps = {
  ...base,
  scene: sceneGrafica.map((s, i) => (IMMAGINI[i] ? { da: s.da, file: IMMAGINI[i] } : s)),
};
