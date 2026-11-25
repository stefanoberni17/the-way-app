import type { Caption } from "@remotion/captions";
import type { Movimento, Parola, Scena } from "./tipi";

// Le regole di inquadratura e taglio, in un posto solo.
export const FPS = 30;
export const LARGHEZZA = 1080;
export const ALTEZZA = 1920;

// I sottotitoli stanno poco sotto la metà dello schermo.
export const SOTTOTITOLI_TOP_Y = 0.6;
// Fascia degli inserti: sotto i sottotitoli, sopra i bottoni di Instagram.
export const INSERTI_TOP_Y = 0.705;

// Zoom alternato a ogni taglio, più un lento movimento dentro ogni scena.
export const ZOOM_LARGO = 1.08;
export const ZOOM_STRETTO = 1.2;
export const ZOOM_DERIVA = 0.06;
export const SPOSTAMENTO = 0.03; // per le panoramiche, in frazioni dello schermo
export const GANCIO_SECONDI = 2.5;

export const frame = (secondi: number) => Math.round(secondi * FPS);

export type ScenaMontata = Scena & {
  zoom: number;
  inizioFrame: number;
  durataFrame: number;
};

// Ogni scena dura fino all'inizio della successiva; l'ultima fino alla fine.
export const montaScene = (scene: Scena[], durata: number): ScenaMontata[] =>
  scene.map((s, i) => {
    const inizioFrame = frame(s.da);
    const fineFrame = i + 1 < scene.length ? frame(scene[i + 1].da) : frame(durata);
    const stretto = s.stretto ?? i % 2 === 1;
    return {
      ...s,
      zoom: stretto ? ZOOM_STRETTO : ZOOM_LARGO,
      inizioFrame,
      durataFrame: fineFrame - inizioFrame,
    };
  });

// Movimento di camera: t va da 0 a 1 dentro la scena.
// Lo zoom resta sempre > 1 + spostamento, così i bordi non si scoprono mai.
export const camera = (movimento: Movimento, zoom: number, t: number) => {
  let scala = zoom + ZOOM_DERIVA * t;
  let x = 0;
  let y = 0;
  const d = SPOSTAMENTO * (2 * t - 1); // da -S a +S
  switch (movimento) {
    case "allontana":
      scala = zoom + ZOOM_DERIVA * (1 - t);
      break;
    case "sinistra":
      x = -d * LARGHEZZA;
      break;
    case "destra":
      x = d * LARGHEZZA;
      break;
    case "su":
      y = -d * ALTEZZA;
      break;
    case "giu":
      y = d * ALTEZZA;
      break;
    default:
      break;
  }
  return { transform: `translate(${x}px, ${y}px) scale(${scala})` };
};

// Parole della trascrizione → captions di Remotion (tempi in ms).
export const paroleInCaptions = (parole: Parola[]): Caption[] =>
  parole.map((w) => ({
    text: ` ${w.text}`,
    startMs: Math.round(w.start * 1000),
    endMs: Math.round(w.end * 1000),
    timestampMs: null,
    confidence: null,
  }));

export const pulisci = (t: string) =>
  t.trim().toLowerCase().replace(/[.,:;!?«»"]/g, "");
