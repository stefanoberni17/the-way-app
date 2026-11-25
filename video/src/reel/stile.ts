import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";

// Un solo linguaggio: immagini dipinte e testo da libro. Cormorant Garamond
// (il font dei titoli e dei versetti dell'app), crema con ombra morbida,
// parole chiave in corsivo oro. Colori dalla palette "Pergamena e Oro".
const cormorant = loadCormorant("normal", { weights: ["600"], subsets: ["latin"] });
loadCormorant("italic", { weights: ["600"], subsets: ["latin"] });

export const stile = {
  font: cormorant.fontFamily,
  oro: "#d8b262", // gold-light: le parole chiave
  crema: "#f3e8cf", // gold-soft: il testo
  notte: "#1d2028", // night: fondo dietro le immagini
};

// Testo dei sottotitoli e del carosello: stessa tipografia ovunque.
export const testo: React.CSSProperties = {
  fontFamily: stile.font,
  fontWeight: 600,
  color: stile.crema,
  // Niente contorno né pillola: ombra morbida, come luce su una pagina.
  textShadow: "0 2px 3px rgba(0,0,0,0.75), 0 0 26px rgba(0,0,0,0.6)",
};

export const parolaChiave: React.CSSProperties = {
  fontStyle: "italic",
  color: stile.oro,
};

// Velo scuro dietro il testo: tiene leggibili le parole sui punti chiari del dipinto.
export const velo = (da: number, a: number) =>
  `linear-gradient(to bottom, rgba(12,12,16,0) ${da}%, rgba(12,12,16,0.42) ${(da + a) / 2}%, rgba(12,12,16,0) ${a}%)`;
