// Un Reel di The Way = una voce generata, le scene (immagini o clip generate)
// e le parole dette. Tutti i tempi sono in secondi della voce.

export type Parola = {
  text: string;
  start: number;
  end: number;
};

// Movimento di camera dentro la scena: l'immagine non resta mai ferma.
export type Movimento = "avvicina" | "allontana" | "sinistra" | "destra" | "su" | "giu";

// Grafiche animate disegnate in Remotion (src/reel/Grafica.tsx), zero crediti.
export type NomeGrafica =
  | "deserto"
  | "monte"
  | "vento"
  | "terremoto"
  | "fuoco"
  | "brezza"
  | "mantello"
  | "rumore"
  | "respiro"
  | "silenzio";

export type Scena = {
  da: number; // secondo della voce in cui parte; finisce dove parte la scena dopo
  movimento?: Movimento; // se manca: lento avvicinamento
  stretto?: boolean; // inquadratura stretta; se manca, si alterna larga / stretta
} & (
  | { file: string } // immagine o clip in public/, es. "media/elia/scena-01.png"
  | { grafica: NomeGrafica }
);

// Frase chiave grande in alto: ogni parola compare quando la voce la dice.
export type Frase = {
  parole: [testo: string, quando: number][];
  a: number; // secondo in cui sparisce
  oro?: string[]; // parole da colorare in oro
};

// Inserti grafici legati a quello che si dice.
// Solo quando servono: un'informazione che le immagini da sole non danno.
export type Inserto =
  | {
      tipo: "scheda"; // un concetto o un riferimento, entra da sinistra
      da: number;
      a: number;
      titolo: string;
      sottotitolo?: string;
    }
  | {
      tipo: "percorso"; // linea del tempo che si accende tappa per tappa
      a: number;
      tappe: {
        quando: number;
        etichetta: string;
        sotto?: string;
        tenue?: boolean; // si accende ma resta spenta (es. "non qui")
      }[];
    };

export type ReelProps = {
  voce: string; // percorso in public/, es. "media/elia/voce.mp3"
  durata: number; // secondi totali del Reel
  scene: Scena[];
  parole: Parola[];
  // Parole in Cormorant corsivo (minuscole, senza punteggiatura).
  paroleChiave?: string[];
  gancio?: string; // frase in alto nei primi secondi
  frasi?: Frase[];
  inserti?: Inserto[];
  sottofondo?: { file: string; volume: number }; // basso, es. 0.08
};
