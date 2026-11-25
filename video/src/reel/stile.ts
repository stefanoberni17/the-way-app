import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";

// Brand The Way, palette "Pergamena e Oro" (app/globals.css): DM Sans per il testo,
// Cormorant Garamond corsivo per l'accento, oro come unico colore, notte per i fondi.
const dmSans = loadDMSans("normal", { weights: ["500", "700"], subsets: ["latin"] });
const cormorant = loadCormorant("italic", { weights: ["600", "700"], subsets: ["latin"] });

export const stile = {
  font: dmSans.fontFamily,
  fontAccento: cormorant.fontFamily,
  oro: "#d8b262", // gold-light: la parola che stai dicendo
  oroPieno: "#b8862b", // gold: barre e linee
  crema: "#f3e8cf", // gold-soft: le parole chiave in corsivo
  pergamena: "#f4efe6", // parchment: il gancio
  inchiostro: "#1f1b17", // ink: testo sull'oro e sulla pergamena
  notte: "#1d2028", // night: contorni e fondi degli inserti
  bianco: "#ffffff",
  // Contorno pieno color notte: si legge su qualsiasi immagine senza fondo dietro.
  contorno: {
    WebkitTextStroke: "12px #1d2028",
    paintOrder: "stroke fill",
  } as React.CSSProperties,
};
