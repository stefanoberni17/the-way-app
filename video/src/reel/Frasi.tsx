import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ALTEZZA, frame as aFrame, FRASI_TOP_Y, pulisci } from "./montaggio";
import { stile } from "./stile";
import type { Frase as TipoFrase } from "./tipi";

const ANTICIPO = 4; // frame: la parola inizia a comparire un attimo prima di essere detta
const USCITA = 10;

// Frase chiave grande in alto, in Cormorant corsivo: ogni parola compare
// quando la voce la dice, come se venisse scritta dalla voce stessa.
const UnaFrase: React.FC<{ frase: TipoFrase; inizio: number; durata: number }> = ({
  frase,
  inizio,
  durata,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oro = new Set((frase.oro ?? []).map(pulisci));
  const fuori = interpolate(f, [durata - USCITA, durata], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        paddingTop: FRASI_TOP_Y * ALTEZZA,
        alignItems: "center",
        paddingLeft: 80,
        paddingRight: 80,
        opacity: fuori,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 26,
          maxWidth: 920,
        }}
      >
        {frase.parole.map(([testo, quando], i) => {
          const da = aFrame(quando) - inizio - ANTICIPO;
          const s = spring({ frame: f - da, fps, config: { damping: 200 }, durationInFrames: 14 });
          const inOro = oro.has(pulisci(testo));
          return (
            <span
              key={i}
              style={{
                fontFamily: stile.fontAccento,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 132,
                lineHeight: 1.02,
                color: inOro ? stile.oro : stile.crema,
                opacity: s,
                filter: `blur(${(1 - s) * 10}px)`,
                transform: `translateY(${(1 - s) * 26}px)`,
                textShadow: "0 2px 6px rgba(0,0,0,0.7), 0 8px 34px rgba(0,0,0,0.75)",
              }}
            >
              {testo}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Frasi: React.FC<{ frasi: TipoFrase[] }> = ({ frasi }) => (
  <AbsoluteFill>
    {frasi.map((fr, i) => {
      const inizio = aFrame(fr.parole[0][1]) - ANTICIPO - 2;
      const durata = aFrame(fr.a) - inizio;
      if (durata <= 0) return null;
      return (
        <Sequence key={i} from={inizio} durationInFrames={durata} layout="none">
          <UnaFrase frase={fr} inizio={inizio} durata={durata} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
