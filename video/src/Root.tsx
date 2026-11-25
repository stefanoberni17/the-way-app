import { Composition, Still } from "remotion";
import { Reel } from "./reel/Reel";
import { FPS, LARGHEZZA, ALTEZZA } from "./reel/montaggio";
import { Slide, SLIDE_ALTEZZA, SLIDE_LARGHEZZA } from "./reel/Slide";
import type { ReelProps, Slide as TipoSlide } from "./reel/tipi";
import { eliaCarosello, eliaLettura } from "./progetti/elia";

// Ogni video da pubblicare = una Composition con i suoi dati in src/progetti/.
const reel: Record<string, ReelProps> = {
  "elia-lettura": eliaLettura,
};

// Ogni carosello = una Still per slide: elia-carosello-1, elia-carosello-2, …
const caroselli: Record<string, TipoSlide[]> = {
  "elia-carosello": eliaCarosello,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Object.entries(reel).map(([id, props]) => (
        <Composition
          key={id}
          id={id}
          component={Reel}
          defaultProps={props}
          fps={FPS}
          width={LARGHEZZA}
          height={ALTEZZA}
          durationInFrames={Math.round(props.durata * FPS)}
        />
      ))}
      {Object.entries(caroselli).flatMap(([id, slide]) =>
        slide.map((props, i) => (
          <Still
            key={`${id}-${i + 1}`}
            id={`${id}-${i + 1}`}
            component={Slide}
            defaultProps={props}
            width={SLIDE_LARGHEZZA}
            height={SLIDE_ALTEZZA}
          />
        )),
      )}
    </>
  );
};
