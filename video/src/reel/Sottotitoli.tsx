import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Caption, TikTokPage } from "@remotion/captions";
import { ALTEZZA, pulisci, SOTTOTITOLI_TOP_Y } from "./montaggio";
import { parolaChiave, stile, testo } from "./stile";

// Poche parole per volta, ma con il respiro di una lettura: si va a capo
// sulla punteggiatura, come nel testo, o quando la riga si allunga troppo.
const MAX_PAROLE = 4;
const MAX_CARATTERI = 24;
const FINE_FRASE = /[.,;:!?»]$/;

const impagina = (captions: Caption[]): TikTokPage[] => {
  const pagine: TikTokPage[] = [];
  let parole: Caption[] = [];
  const chiudi = () => {
    if (!parole.length) return;
    const startMs = parole[0].startMs;
    pagine.push({
      text: parole.map((p) => p.text).join(""),
      startMs,
      durationMs: parole[parole.length - 1].endMs - startMs,
      tokens: parole.map((p) => ({ text: p.text, fromMs: p.startMs, toMs: p.endMs })),
    });
    parole = [];
  };
  for (const c of captions) {
    const lunghezza = parole.map((p) => p.text).join("").length + c.text.length;
    // L'ultima parola di una frase resta con le altre, se non sfora troppo:
    // niente "Signore.»" da solo su una pagina.
    const fine = FINE_FRASE.test(c.text.trim());
    const maxParole = fine ? MAX_PAROLE + 1 : MAX_PAROLE;
    const maxCaratteri = fine ? MAX_CARATTERI + 8 : MAX_CARATTERI;
    if (parole.length >= maxParole || (parole.length && lunghezza > maxCaratteri)) chiudi();
    parole.push(c);
    if (FINE_FRASE.test(c.text.trim())) chiudi();
  }
  chiudi();
  return pagine;
};

// Le parole già dette sono piene, quelle in arrivo restano in trasparenza:
// si legge insieme alla voce, senza pillole né contorni.
// Nella lettura del passo le parole sono in corsivo, tra virgolette:
// “ apre la prima pagina della lettura, ” chiude l'ultima.
type Lettura = { corsivo: boolean; apre: boolean; chiude: boolean };

const Pagina: React.FC<{ page: TikTokPage; chiave: Set<string>; lettura: Lettura }> = ({
  page,
  chiave,
  lettura,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const oraMs = page.startMs + (frame / fps) * 1000;
  const entrata = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 8 });

  return (
    <AbsoluteFill
      style={{
        paddingTop: SOTTOTITOLI_TOP_Y * ALTEZZA,
        alignItems: "center",
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 20,
          maxWidth: 920,
          opacity: entrata,
          transform: `translateY(${(1 - entrata) * 10}px)`,
        }}
      >
        {page.tokens.map((t, i) => {
          const parola = t.text.trim();
          const primo = lettura.apre && i === 0;
          const ultimo = lettura.chiude && i === page.tokens.length - 1;
          const detta = interpolate(oraMs, [t.fromMs - 60, t.fromMs + 120], [0.45, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={`${t.fromMs}-${i}`}
              style={{
                ...testo,
                ...(lettura.corsivo ? { fontStyle: "italic" } : {}),
                ...(chiave.has(pulisci(t.text)) ? parolaChiave : {}),
                fontSize: 86,
                lineHeight: 1.12,
                opacity: detta,
              }}
            >
              {primo ? <span style={{ color: stile.oro }}>“</span> : null}
              {parola}
              {ultimo ? <span style={{ color: stile.oro }}>”</span> : null}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Sottotitoli: React.FC<{
  captions: Caption[];
  paroleChiave: string[];
  lettura?: { da: number; a: number };
}> = ({ captions, paroleChiave, lettura }) => {
  const { fps } = useVideoConfig();
  const chiave = useMemo(() => new Set(paroleChiave), [paroleChiave]);
  const pages = useMemo(() => impagina(captions), [captions]);
  const nellaLettura = (p: TikTokPage) =>
    !!lettura && p.startMs >= lettura.da * 1000 - 50 && p.startMs < lettura.a * 1000;
  const primaLettura = pages.findIndex(nellaLettura);
  const ultimaLettura = pages.reduce((u, p, i) => (nellaLettura(p) ? i : u), -1);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1] ?? null;
        const from = Math.round((page.startMs / 1000) * fps);
        const fine = next
          ? Math.round((next.startMs / 1000) * fps)
          : Math.round(((page.startMs + page.durationMs) / 1000) * fps) + 20;
        const durata = fine - from;
        if (durata <= 0) return null;
        return (
          <Sequence key={i} from={from} durationInFrames={durata} layout="none">
            <Pagina
              page={page}
              chiave={chiave}
              lettura={{
                corsivo: nellaLettura(page),
                apre: i === primaLettura,
                chiude: i === ultimaLettura,
              }}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
