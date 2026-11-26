import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTEZZA } from "./montaggio";
import { stile, testo } from "./stile";
import type { Apertura as TipoApertura } from "./tipi";

// In apertura, sotto il logo: settimana e numero del passo, titolo e riferimento.
// Stessa tipografia dei sottotitoli; entra con la prima scena e sparisce
// prima che la lettura entri nel vivo.
export const Apertura: React.FC<TipoApertura> = ({ percorso, titolo, riferimento, fino }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fine = fino * fps;
  const luce = interpolate(frame, [6, 24, fine - 18, fine], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sale = interpolate(frame, [6, 30], [12, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        paddingTop: 0.21 * ALTEZZA,
        alignItems: "center",
        opacity: luce,
        transform: `translateY(${sale}px)`,
      }}
    >
      <div
        style={{
          ...testo,
          fontFamily: stile.fontSans,
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: stile.oro,
        }}
      >
        {percorso}
      </div>
      <div style={{ ...testo, fontSize: 96, lineHeight: 1.05, marginTop: 22, textAlign: "center" }}>
        {titolo}
      </div>
      <div
        style={{
          width: 120,
          height: 2,
          background: stile.oro,
          marginTop: 26,
          boxShadow: "0 1px 6px rgba(0,0,0,0.6)",
        }}
      />
      <div style={{ ...testo, fontStyle: "italic", fontSize: 50, marginTop: 18 }}>
        {riferimento}
      </div>
    </AbsoluteFill>
  );
};
