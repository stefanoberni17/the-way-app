import { Composition } from "remotion";
import { Reel } from "./reel/Reel";
import { FPS } from "./reel/montaggio";
import type { ReelProps } from "./reel/tipi";
import { elia } from "./progetti/elia";

// Ogni video da pubblicare = una Composition con i suoi dati in src/progetti/.
const progetti: Record<string, ReelProps> = { elia };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {Object.entries(progetti).map(([id, props]) => (
        <Composition
          key={id}
          id={id}
          component={Reel}
          defaultProps={props}
          fps={FPS}
          width={1080}
          height={1920}
          durationInFrames={Math.round(props.durata * FPS)}
        />
      ))}
    </>
  );
};
