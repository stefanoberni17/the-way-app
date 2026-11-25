import type { Caption } from "@remotion/captions";
import { Easing, interpolate } from "remotion";
import type { Inquadratura, Movimento, Parola, Scena } from "./tipi";

// Le regole di inquadratura e taglio, in un posto solo.
export const FPS = 30;
export const LARGHEZZA = 1080;
export const ALTEZZA = 1920;

// I sottotitoli stanno poco sotto la metà dello schermo.
export const SOTTOTITOLI_TOP_Y = 0.6;

// Il logo della pagina sta in alto al centro, sotto la barra di Instagram.
export const MARCHIO_TOP_Y = 0.11;
export const MARCHIO_ALTEZZA = 84;

// Dissolvenza incrociata tra una scena e l'altra, e chiusura al nero.
export const DISSOLVENZA = 15;
export const CHIUSURA = 24;

// Zoom alternato a ogni taglio, più un lento movimento dentro ogni scena.
export const ZOOM_LARGO = 1.06;
export const ZOOM_STRETTO = 1.14;
export const ZOOM_DERIVA = 0.05;
export const SPOSTAMENTO = 0.02; // per le panoramiche, in frazioni dello schermo

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
    return {
      ...s,
      zoom: s.inquadratura?.zoom ?? (i % 2 === 1 ? ZOOM_STRETTO : ZOOM_LARGO),
      inizioFrame,
      durataFrame: fineFrame - inizioFrame,
    };
  });

// Porta il punto (x, y) al centro con zoom `scala`, senza mai scoprire i bordi.
const centra = (x: number, y: number, scala: number) => {
  const margine = (scala - 1) / 2;
  const limita = (v: number) => Math.max(-margine, Math.min(margine, v));
  return {
    x: limita(-scala * (x - 0.5)) * LARGHEZZA,
    y: limita(-scala * (y - 0.5)) * ALTEZZA,
  };
};

const trasforma = (x: number, y: number, scala: number) =>
  `translate(${x}px, ${y}px) scale(${scala})`;

// Movimento di camera: t va da 0 a 1 dentro la scena.
export const camera = (
  movimento: Movimento,
  zoom: number,
  t: number,
  inquadratura?: Inquadratura,
) => {
  let scala = zoom + ZOOM_DERIVA * t;
  let dx = 0;
  let dy = 0;
  const d = SPOSTAMENTO * (2 * t - 1); // da -S a +S
  switch (movimento) {
    case "allontana":
      scala = zoom + ZOOM_DERIVA * (1 - t);
      break;
    case "sinistra":
      dx = -d;
      break;
    case "destra":
      dx = d;
      break;
    case "su":
      dy = -d;
      break;
    case "giu":
      dy = d;
      break;
    default:
      break;
  }
  const c = centra((inquadratura?.x ?? 0.5) - dx, (inquadratura?.y ?? 0.5) - dy, scala);
  return trasforma(c.x, c.y, scala);
};

// Carrello: interpola le inquadrature ai secondi indicati, con partenze e arrivi morbidi.
export const carrello = (tappe: (Inquadratura & { a: number })[], secondo: number) => {
  const tempi = tappe.map((p) => p.a);
  const opzioni = {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  } as const;
  const x = interpolate(secondo, tempi, tappe.map((p) => p.x), opzioni);
  const y = interpolate(secondo, tempi, tappe.map((p) => p.y), opzioni);
  const scala = interpolate(secondo, tempi, tappe.map((p) => p.zoom), opzioni);
  const c = centra(x, y, scala);
  return trasforma(c.x, c.y, scala);
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
