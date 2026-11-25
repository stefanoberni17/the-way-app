import { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { camera, GANCIO_SECONDI, montaScene, paroleInCaptions } from "./montaggio";
import type { ScenaMontata } from "./montaggio";
import { Inserti } from "./Inserti";
import { Sottotitoli } from "./Sottotitoli";
import { stile } from "./stile";
import type { ReelProps } from "./tipi";

const SFUMATURA = 6; // frame di dissolvenza dal nero alla prima scena

const Scena: React.FC<{ scena: ScenaMontata }> = ({ scena }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, scena.durataFrame], [0, 1], {
    extrapolateRight: "clamp",
  });
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...camera(scena.movimento ?? "avvicina", scena.zoom, t),
  };
  const video = /\.(mp4|mov|webm)$/i.test(scena.file);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: stile.notte }}>
      {video ? (
        <OffthreadVideo src={staticFile(scena.file)} muted style={style} />
      ) : (
        <Img src={staticFile(scena.file)} style={style} />
      )}
    </AbsoluteFill>
  );
};

const Gancio: React.FC<{ testo: string }> = ({ testo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dentro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 10 });
  const fuori = interpolate(frame, [GANCIO_SECONDI * fps - 8, GANCIO_SECONDI * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
      <div
        style={{
          fontFamily: stile.fontAccento,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.05,
          color: stile.inchiostro,
          background: stile.pergamena,
          padding: "16px 38px 20px",
          borderRadius: 22,
          maxWidth: 900,
          textAlign: "center",
          boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
          opacity: dentro * fuori,
          transform: `translateY(${(1 - dentro) * -30}px)`,
        }}
      >
        {testo}
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({
  voce,
  durata,
  scene,
  parole,
  paroleChiave = [],
  gancio,
  inserti = [],
  sottofondo,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const montate = useMemo(() => montaScene(scene, durata), [scene, durata]);
  const captions = useMemo(() => paroleInCaptions(parole), [parole]);
  const apertura = interpolate(frame, [0, SFUMATURA], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: stile.notte }}>
      <AbsoluteFill style={{ opacity: apertura }}>
        {montate.map((s, i) => (
          <Sequence key={i} from={s.inizioFrame} durationInFrames={s.durataFrame}>
            <Scena scena={s} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <Audio src={staticFile(voce)} />
      {sottofondo ? (
        <Audio src={staticFile(sottofondo.file)} volume={sottofondo.volume} loop />
      ) : null}
      <Sottotitoli captions={captions} paroleChiave={paroleChiave} />
      <Inserti inserti={inserti} />
      {gancio ? (
        <Sequence durationInFrames={Math.round(GANCIO_SECONDI * fps)}>
          <Gancio testo={gancio} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
