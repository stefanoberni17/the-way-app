import { AbsoluteFill, Img, staticFile } from "remotion";
import { pulisci } from "./montaggio";
import { parolaChiave, stile, testo } from "./stile";
import type { Slide as TipoSlide } from "./tipi";

// Formato verticale dei caroselli Instagram.
export const SLIDE_LARGHEZZA = 1080;
export const SLIDE_ALTEZZA = 1350;

// Una slide del carosello: immagine del video ritagliata in 4:5 e una frase,
// con la stessa tipografia dei sottotitoli. Si rende come immagine ferma.
export const Slide: React.FC<TipoSlide> = ({
  file,
  frase,
  inquadratura,
  nota,
  paroleChiave = [],
}) => {
  const chiave = new Set(paroleChiave);
  // x, y: il punto dell'immagine da tenere in vista (0-1); zoom attorno a quel punto.
  const x = (inquadratura?.x ?? 0.5) * 100;
  const y = (inquadratura?.y ?? 0.5) * 100;
  return (
    <AbsoluteFill style={{ backgroundColor: stile.notte, overflow: "hidden" }}>
      <Img
        src={staticFile(file)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${x}% ${y}%`,
          transform: `scale(${inquadratura?.zoom ?? 1})`,
          transformOrigin: `${x}% ${y}%`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(12,12,16,0) 42%, rgba(12,12,16,0.62) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "0 90px 120px",
        }}
      >
        {/* Righe bilanciate: niente parola sola sull'ultima riga. */}
        <div
          style={{
            ...testo,
            fontSize: 78,
            lineHeight: 1.12,
            maxWidth: 900,
            textAlign: "center",
            textWrap: "balance",
          }}
        >
          {frase.split(" ").map((p, i) => (
            <span key={i} style={chiave.has(pulisci(p)) ? parolaChiave : undefined}>
              {i ? " " : ""}
              {p}
            </span>
          ))}
        </div>
        {nota ? (
          <div
            style={{
              ...testo,
              ...parolaChiave,
              color: stile.crema,
              fontSize: 40,
              marginTop: 26,
              opacity: 0.85,
            }}
          >
            {nota}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
