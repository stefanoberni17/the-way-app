import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { stile } from "./stile";

const dmSans = loadDMSans("normal", { weights: ["500"], subsets: ["latin"] });

// Il logo della pagina, ridisegnato per stare sopra le immagini: croce, filo,
// "the way" e "LA VIA DEL CUORE", in crema con ombra morbida. Sempre presente,
// in alto al centro, così ogni video e ogni slide si riconoscono subito.
export const Marchio: React.FC<{ altezza: number }> = ({ altezza }) => {
  const ombra = "drop-shadow(0 2px 3px rgba(0,0,0,0.6)) drop-shadow(0 0 18px rgba(0,0,0,0.45))";
  const tratto = Math.max(2, altezza * 0.035);
  const largCroce = altezza * 0.58;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        filter: ombra,
        color: stile.crema,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: altezza * 0.3 }}>
        {/* Croce latina: braccio orizzontale a poco più di un quarto dall'alto. */}
        <svg width={largCroce} height={altezza} viewBox={`0 0 ${largCroce} ${altezza}`}>
          <line
            x1={largCroce / 2}
            y1={0}
            x2={largCroce / 2}
            y2={altezza}
            stroke={stile.crema}
            strokeWidth={tratto}
          />
          <line
            x1={0}
            y1={altezza * 0.28}
            x2={largCroce}
            y2={altezza * 0.28}
            stroke={stile.crema}
            strokeWidth={tratto}
          />
        </svg>
        <div
          style={{ width: Math.max(1, tratto * 0.5), height: altezza * 0.8, background: stile.crema }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: altezza * 0.1 }}>
          <div
            style={{
              fontFamily: stile.font,
              fontWeight: 700,
              fontSize: altezza * 0.5,
              lineHeight: 0.9,
            }}
          >
            the way
          </div>
          <div
            style={{
              fontFamily: dmSans.fontFamily,
              fontWeight: 500,
              fontSize: altezza * 0.13,
              letterSpacing: "0.38em",
              whiteSpace: "nowrap",
            }}
          >
            LA VIA DEL CUORE
          </div>
        </div>
      </div>
    </div>
  );
};
