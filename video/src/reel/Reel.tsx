import { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  camera,
  carrello,
  CHIUSURA,
  DISSOLVENZA,
  montaScene,
  paroleInCaptions,
} from "./montaggio";
import type { ScenaMontata } from "./montaggio";
import { Sottotitoli } from "./Sottotitoli";
import { stile, velo } from "./stile";
import type { ReelProps } from "./tipi";

// Una scena: l'immagine dipinta con un lento movimento di camera.
// Entra in dissolvenza sopra la scena precedente.
const Scena: React.FC<{ scena: ScenaMontata; anticipo: number }> = ({ scena, anticipo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durata = scena.durataFrame + anticipo;
  const t = interpolate(frame, [0, durata], [0, 1], { extrapolateRight: "clamp" });
  const entrata = anticipo
    ? interpolate(frame, [0, anticipo], [0, 1], { extrapolateRight: "clamp" })
    : 1;
  const transform = scena.carrello
    ? carrello(scena.carrello, (scena.inizioFrame - anticipo + frame) / fps)
    : camera(scena.movimento ?? "avvicina", scena.zoom, t, scena.inquadratura);
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: entrata }}>
      <Img
        src={staticFile(scena.file)}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform }}
      />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({
  voce,
  durata,
  scene,
  parole,
  paroleChiave = [],
  sottofondo,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const montate = useMemo(() => montaScene(scene, durata), [scene, durata]);
  const captions = useMemo(() => paroleInCaptions(parole), [parole]);
  const luce = interpolate(
    frame,
    [0, DISSOLVENZA, durationInFrames - CHIUSURA, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: stile.notte }}>
      <AbsoluteFill style={{ opacity: luce }}>
        {montate.map((s, i) => {
          const anticipo = i === 0 ? 0 : DISSOLVENZA;
          return (
            <Sequence
              key={i}
              from={s.inizioFrame - anticipo}
              durationInFrames={s.durataFrame + anticipo}
            >
              <Scena scena={s} anticipo={anticipo} />
            </Sequence>
          );
        })}
        <AbsoluteFill style={{ background: velo(48, 82) }} />
        <Sottotitoli captions={captions} paroleChiave={paroleChiave} />
      </AbsoluteFill>
      <Audio src={staticFile(voce)} />
      {sottofondo ? (
        <Audio src={staticFile(sottofondo.file)} volume={sottofondo.volume} loop />
      ) : null}
    </AbsoluteFill>
  );
};
