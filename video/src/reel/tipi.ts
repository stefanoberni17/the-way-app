// Un Reel di The Way = una voce generata, le immagini dipinte e le parole dette.
// Tutti i tempi sono in secondi della voce.

export type Parola = {
  text: string;
  start: number;
  end: number;
};

// Punto dell'immagine da tenere al centro (0-1 da sinistra / dall'alto) e quanto stringere.
export type Inquadratura = { x: number; y: number; zoom: number };

// Movimento lento di camera dentro la scena: l'immagine non resta mai ferma.
export type Movimento = "avvicina" | "allontana" | "sinistra" | "destra" | "su" | "giu";

export type Scena = {
  da: number; // secondo della voce in cui parte; finisce dove parte la scena dopo
  file: string; // immagine in public/, es. "media/elia/scena-01.png"
  movimento?: Movimento; // se manca: lento avvicinamento
  inquadratura?: Inquadratura; // se manca: centro, zoom leggero
  // Carrello: la camera passa da un'inquadratura all'altra ai secondi indicati.
  // Serve a raccontare più momenti con una sola immagine. Se c'è, ignora movimento.
  carrello?: (Inquadratura & { a: number })[];
};

export type ReelProps = {
  voce: string; // percorso in public/, es. "media/elia/voce.mp3"
  // Se la voce è in più pezzi: ognuno parte al secondo `da`, tagliato a `taglio`.
  voci?: { file: string; da: number; taglio?: number }[];
  durata: number; // secondi totali del Reel
  scene: Scena[];
  parole: Parola[];
  paroleChiave?: string[]; // in corsivo oro (minuscole, senza punteggiatura)
  sottofondo?: { file: string; volume: number }; // basso, es. 0.08
  // Il tratto della voce che legge il passo: sottotitoli in corsivo, tra virgolette.
  lettura?: { da: number; a: number };
  // In apertura, sopra la prima scena: dove siamo nel percorso.
  apertura?: Apertura;
};

export type Apertura = {
  percorso: string; // es. "Settimana 3 · Passo 16"
  titolo: string; // es. "Elia e la voce sottile"
  riferimento: string; // es. "1 Re 19,11-13"
  fino: number; // secondo in cui è già sparita
};

// Una slide del carosello: un'immagine del video e una frase breve presa dal testo.
export type Slide = {
  file: string;
  frase: string;
  inquadratura?: Inquadratura;
  nota?: string; // riga piccola sotto la frase, es. il riferimento biblico
  paroleChiave?: string[]; // in corsivo oro, come nei sottotitoli
};
