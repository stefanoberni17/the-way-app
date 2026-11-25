import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ALTEZZA, frame as aFrame, INSERTI_TOP_Y } from "./montaggio";
import { stile } from "./stile";
import type { Inserto } from "./tipi";

const USCITA_FRAME = 8;

// Fondo delle schede: "notte" del brand, come i momenti sacri nell'app.
const FONDO = "rgba(29, 32, 40, 0.9)";
const GRIGIO = "rgba(233, 228, 216, 0.26)";

const Fascia: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ paddingTop: INSERTI_TOP_Y * ALTEZZA, alignItems: "center" }}>
    {children}
  </AbsoluteFill>
);

// Entrata con molla, uscita in dissolvenza negli ultimi frame.
const useEntrataUscita = (durata: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dentro = spring({ frame, fps, config: { damping: 18, stiffness: 140 } });
  const fuori = interpolate(frame, [durata - USCITA_FRAME, durata], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { frame, fps, dentro, fuori };
};

const Scheda: React.FC<{ titolo: string; sottotitolo?: string; durata: number }> = ({
  titolo,
  sottotitolo,
  durata,
}) => {
  const { frame, fps, dentro, fuori } = useEntrataUscita(durata);
  // La barra oro entra prima, il testo la segue.
  const barra = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });
  const testo = spring({ frame: frame - 5, fps, config: { damping: 200 }, durationInFrames: 10 });
  return (
    <Fascia>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          background: FONDO,
          borderRadius: 24,
          overflow: "hidden",
          opacity: fuori,
          transform: `translateX(${(1 - dentro) * -120}px)`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ width: 14, background: stile.oroPieno, transform: `scaleY(${barra})` }} />
        <div style={{ padding: "22px 40px 24px 30px", opacity: testo }}>
          <div
            style={{
              fontFamily: stile.font,
              fontWeight: 700,
              fontSize: 52,
              color: stile.bianco,
              letterSpacing: 2,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {titolo}
          </div>
          {sottotitolo ? (
            <div
              style={{
                fontFamily: stile.fontAccento,
                fontStyle: "italic",
                fontWeight: 600,
                fontSize: 52,
                color: stile.oro,
                marginTop: 8,
              }}
            >
              {sottotitolo}
            </div>
          ) : null}
        </div>
      </div>
    </Fascia>
  );
};

type TappaReel = { frame: number; etichetta: string; sotto?: string; tenue?: boolean };

const Percorso: React.FC<{ tappe: TappaReel[]; inizio: number; durata: number }> = ({
  tappe,
  inizio,
  durata,
}) => {
  const { frame, fps, dentro, fuori } = useEntrataUscita(durata);
  const ora = inizio + frame; // frame nel Reel
  const LARGHEZZA = 920;
  const MARGINE = 120;
  const passo = tappe.length > 1 ? (LARGHEZZA - 2 * MARGINE) / (tappe.length - 1) : 0;

  // La linea oro avanza fino all'ultima tappa raggiunta, con una molla.
  const raggiunte = tappe.filter((t) => ora >= t.frame).length;
  const ultima = tappe[Math.max(0, raggiunte - 1)];
  const avanzamento = spring({
    frame: ora - (ultima?.frame ?? inizio),
    fps,
    config: { damping: 200 },
    durationInFrames: 14,
  });
  const daX = Math.max(0, raggiunte - 2) * passo;
  const aX = Math.max(0, raggiunte - 1) * passo;
  const lineaX = raggiunte <= 1 ? 0 : daX + (aX - daX) * avanzamento;

  return (
    <Fascia>
      <div
        style={{
          width: LARGHEZZA,
          height: 230,
          position: "relative",
          background: FONDO,
          borderRadius: 28,
          opacity: fuori * dentro,
          transform: `translateY(${(1 - dentro) * 40}px)`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
        }}
      >
        {/* Linea tenue di fondo e linea oro del percorso fatto. */}
        <div
          style={{
            position: "absolute",
            left: MARGINE,
            right: MARGINE,
            top: 112,
            height: 6,
            borderRadius: 3,
            background: GRIGIO,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: MARGINE,
            top: 112,
            height: 6,
            width: lineaX,
            borderRadius: 3,
            background: stile.oroPieno,
          }}
        />
        {tappe.map((t, i) => {
          const accesa = spring({ frame: ora - t.frame, fps, config: { damping: 12, stiffness: 160 } });
          const attiva = ora >= t.frame;
          const piena = attiva && !t.tenue; // le tappe "tenui" si accendono ma restano spente
          const ultimaAttiva = piena && i === raggiunte - 1;
          const x = MARGINE + i * passo;
          return (
            <div key={i}>
              <div
                style={{
                  position: "absolute",
                  left: x - 18,
                  top: 97,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: piena ? stile.oro : FONDO,
                  border: `5px solid ${piena ? stile.oro : attiva ? stile.crema : GRIGIO}`,
                  transform: `scale(${attiva ? 0.6 + 0.4 * accesa : 0.8})`,
                  boxShadow: ultimaAttiva ? `0 0 ${18 + 14 * accesa}px ${stile.oro}` : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x - 135,
                  width: 270,
                  top: 26,
                  textAlign: "center",
                  fontFamily: stile.font,
                  fontWeight: 700,
                  fontSize: 40,
                  color: piena ? stile.oro : attiva ? stile.bianco : "rgba(233,228,216,0.35)",
                  transform: `translateY(${attiva ? (1 - accesa) * 12 : 0}px)`,
                }}
              >
                {t.etichetta}
              </div>
              {t.sotto ? (
                <div
                  style={{
                    position: "absolute",
                    left: x - 135,
                    width: 270,
                    top: 148,
                    textAlign: "center",
                    fontFamily: stile.fontAccento,
                    fontStyle: "italic",
                    fontWeight: 600,
                    fontSize: 40,
                    lineHeight: 1.05,
                    color: piena ? stile.oro : attiva ? stile.crema : "transparent",
                    opacity: attiva ? accesa : 0,
                  }}
                >
                  {t.sotto}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Fascia>
  );
};

export const Inserti: React.FC<{ inserti: Inserto[] }> = ({ inserti }) => {
  return (
    <AbsoluteFill>
      {inserti.map((ins, i) => {
        if (ins.tipo === "scheda") {
          const da = aFrame(ins.da);
          const durata = aFrame(ins.a) - da;
          if (durata <= 0) return null;
          return (
            <Sequence key={i} from={da} durationInFrames={durata} layout="none">
              <Scheda titolo={ins.titolo} sottotitolo={ins.sottotitolo} durata={durata} />
            </Sequence>
          );
        }
        const tappe = ins.tappe.map((t) => ({ ...t, frame: aFrame(t.quando) }));
        const da = tappe[0]?.frame ?? 0;
        const durata = aFrame(ins.a) - da;
        if (durata <= 0) return null;
        return (
          <Sequence key={i} from={da} durationInFrames={durata} layout="none">
            <Percorso tappe={tappe} inizio={da} durata={durata} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
