import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Bell, BellOff, Mail, MessageCircle, Play, ShoppingBag, Smartphone } from "lucide-react";
import { ALTEZZA as H, LARGHEZZA as W } from "./montaggio";
import { stile } from "./stile";
import type { NomeGrafica } from "./tipi";

// Grafiche animate delle scene, nei colori di The Way: notte per i fondi,
// oro come unica luce, crema e pergamena per i dettagli. Zero crediti.
// Elia non si vede mai: al massimo una sagoma.

const C = {
  notte: stile.notte,
  notteProfonda: "#14161c",
  notteSoft: "#2a2e38",
  notteLinea: "#3a3f4b",
  oro: stile.oro,
  oroPieno: stile.oroPieno,
  oroScuro: "#8f671c",
  crema: stile.crema,
  testoNotte: "#e9e4d8",
};

type Props = { durata: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Forme comuni ────────────────────────────────────────────────────────────

// Sagoma di Elia seduto, curvo, il capo tra le mani (viewBox 0 0 100 100).
const SAGOMA_SEDUTA =
  "M10 100 C12 80 20 64 34 56 C40 52 46 50 50 46 C50 38 56 32 64 34 C72 36 74 46 70 52 C68 56 72 60 76 64 C84 72 88 86 90 100 Z";
// Sagoma in piedi col mantello sul capo (viewBox 0 0 100 200).
const SAGOMA_IN_PIEDI =
  "M52 6 C38 6 30 20 31 36 C30 44 33 50 30 56 C20 80 16 130 12 200 L88 200 C84 130 80 82 70 58 C74 44 72 22 64 12 C61 8 57 6 52 6 Z";
// Di profilo, il capo chino, il mantello tirato sul volto con il braccio (viewBox 0 0 100 200).
const SAGOMA_VELATA =
  "M40 10 C26 10 18 24 20 38 C21 46 24 52 22 60 C14 84 10 130 6 200 L88 200 C86 156 82 118 76 96 C84 90 90 78 86 66 C82 56 74 52 70 46 C72 40 70 32 64 24 C58 14 50 10 40 10 Z";

const MONTAGNA =
  "M-120 1560 L120 1200 L260 1280 L430 930 L560 1040 L700 760 L860 1080 L980 990 L1200 1320 L1200 2100 L-120 2100 Z";

// Grana da pellicola e vignettatura: tutto sembra "stampato", non piatto.
export const Grana: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H} style={{ position: "absolute", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="grana">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 6} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grana)" />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", ...style }}>
    {children}
  </svg>
);

// ── 1. Deserto: Elia esausto sotto il ginepro, il sole che scende ───────────

const Deserto: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const t = f / durata;
  const soleY = interpolate(t, [0, 1], [1130, 1190]);
  const stelle = Array.from({ length: 46 }, (_, i) => ({
    x: random(`sx${i}`) * W,
    y: random(`sy${i}`) * 820 + 60,
    r: 1.2 + random(`sr${i}`) * 2.2,
    inizio: 8 + random(`si${i}`) * durata * 0.8,
  }));
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="cieloDeserto" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.notteProfonda} />
            <stop offset="0.42" stopColor="#272330" />
            <stop offset="0.56" stopColor="#4d3628" />
            <stop offset="0.64" stopColor={C.oroScuro} />
            <stop offset="0.7" stopColor="#c99a45" />
          </linearGradient>
          <radialGradient id="sole">
            <stop offset="0" stopColor="#fff4d6" />
            <stop offset="0.35" stopColor={C.oro} />
            <stop offset="1" stopColor={C.oroPieno} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#cieloDeserto)" />
        {stelle.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={C.crema}
            opacity={
              interpolate(f, [s.inizio, s.inizio + 25], [0, 0.75], clamp) *
              (0.75 + 0.25 * Math.sin(f / 9 + i))
            }
          />
        ))}
        <circle cx={540} cy={soleY} r={420} fill="url(#sole)" opacity={0.55} />
        <circle cx={540} cy={soleY} r={120} fill="#f6dfa4" opacity={0.9} />
        {/* Dune su tre piani, che scorrono piano a velocità diverse. */}
        <g transform={`translate(${-40 * t}, 0)`}>
          <path d="M-100 1250 C200 1180 420 1230 640 1200 C860 1170 1000 1210 1200 1190 L1200 2000 L-100 2000 Z" fill="#3a2a20" />
        </g>
        <g transform={`translate(${-80 * t}, 0)`}>
          <path d="M-100 1330 C180 1270 380 1320 620 1290 C860 1260 1040 1300 1240 1280 L1240 2000 L-100 2000 Z" fill="#2a1f19" />
        </g>
        <g transform={`translate(${-130 * t}, 0)`}>
          <path d="M-100 1420 C220 1350 520 1420 760 1380 C960 1350 1100 1390 1300 1370 L1300 2000 L-100 2000 Z" fill="#1a1412" />
          {/* Il ginepro: pochi rami sottili. */}
          <g stroke="#120d0b" strokeWidth={6} strokeLinecap="round" fill="none">
            <path d="M820 1385 C815 1330 800 1290 770 1250" />
            <path d="M822 1385 C830 1320 860 1280 900 1240" />
            <path d="M818 1360 C840 1330 880 1320 930 1300" />
            <path d="M812 1340 C790 1320 760 1310 720 1300" />
            <path d="M824 1380 C826 1300 828 1260 830 1210" />
          </g>
          <svg x={630} y={1205} width={200} height={200} viewBox="0 0 100 100">
            <path d={SAGOMA_SEDUTA} fill="#0e0a09" />
          </svg>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ── 2. Monte: la montagna si disegna, all'ingresso della caverna una luce ───

const Monte: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const t = f / durata;
  const traccia = interpolate(f, [0, 40], [1, 0], clamp);
  const riempimento = interpolate(f, [18, 50], [0, 1], clamp);
  const luce = 0.6 + 0.4 * Math.sin(f / 10);
  return (
    <AbsoluteFill>
      <Svg>
        <defs>
          <linearGradient id="alba" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.notteProfonda} />
            <stop offset="0.35" stopColor="#262632" />
            <stop offset="0.52" stopColor="#5a4632" />
            <stop offset="0.62" stopColor={C.oroPieno} />
          </linearGradient>
          <filter id="sfuma" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#alba)" />
        {/* Nebbia che scorre. */}
        <ellipse cx={300 + 200 * t} cy={1180} rx={520} ry={70} fill={C.crema} opacity={0.08} filter="url(#sfuma)" />
        <ellipse cx={820 - 160 * t} cy={1320} rx={600} ry={80} fill={C.crema} opacity={0.07} filter="url(#sfuma)" />
        <path d={MONTAGNA} fill={C.notteProfonda} opacity={riempimento} />
        <path
          d={MONTAGNA}
          fill="none"
          stroke={C.oro}
          strokeWidth={4}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={traccia}
          strokeLinejoin="round"
        />
        {/* La caverna e la piccola sagoma di Elia. */}
        <circle cx={622} cy={905} r={60 * luce + 30} fill={C.oro} opacity={0.25 * riempimento} filter="url(#sfuma)" />
        <path d="M600 930 C600 900 612 884 624 884 C636 884 646 900 646 930 Z" fill="#090a0d" opacity={riempimento} />
        <svg x={652} y={880} width={26} height={52} viewBox="0 0 100 200" opacity={riempimento}>
          <path d={SAGOMA_IN_PIEDI} fill="#090a0d" />
        </svg>
      </Svg>
    </AbsoluteFill>
  );
};

// ── 3. Vento: raffiche che spaccano le rocce ────────────────────────────────

const Vento: React.FC<Props> = () => {
  const f = useCurrentFrame();
  const raffiche = Array.from({ length: 70 }, (_, i) => ({
    y: random(`vy${i}`) * H,
    lung: 200 + random(`vl${i}`) * 600,
    vel: 28 + random(`vv${i}`) * 40,
    off: random(`vo${i}`) * 2400,
    spess: 1.5 + random(`vs${i}`) * 4,
    op: 0.12 + random(`vp${i}`) * 0.4,
  }));
  const sassi = Array.from({ length: 14 }, (_, i) => ({
    y: 700 + random(`ry${i}`) * 700,
    vel: 18 + random(`rv${i}`) * 22,
    off: random(`ro${i}`) * 1800,
    lato: 10 + random(`rl${i}`) * 26,
  }));
  const scossa = Math.sin(f * 1.7) * 3;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.notteProfonda}, ${C.notte} 60%, #2b241e)` }}>
      <Svg>
        <defs>
          <linearGradient id="raffica" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={C.crema} stopOpacity="0" />
            <stop offset="0.6" stopColor={C.crema} stopOpacity="1" />
            <stop offset="1" stopColor={C.crema} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(${scossa}, 0)`}>
          <path d={MONTAGNA} fill="#1f2128" stroke={C.notteLinea} strokeWidth={3} />
        </g>
        {raffiche.map((r, i) => {
          const x = ((f * r.vel + r.off) % (W + r.lung + 600)) - r.lung - 300;
          const y = r.y + Math.sin((f + i * 7) / 12) * 14;
          return (
            <rect key={i} x={x} y={y} width={r.lung} height={r.spess} rx={r.spess / 2} fill="url(#raffica)" opacity={r.op} />
          );
        })}
        {sassi.map((s, i) => {
          const x = ((f * s.vel + s.off) % (W + 400)) - 200;
          return (
            <rect
              key={i}
              x={x}
              y={s.y + Math.sin(f / 6 + i) * 20}
              width={s.lato}
              height={s.lato * 0.7}
              fill="#3b3127"
              transform={`rotate(${f * 9 + i * 40}, ${x + s.lato / 2}, ${s.y})`}
            />
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ── 4. Terremoto: la terra trema e si apre una crepa d'oro ──────────────────

const CREPA = "M560 820 L530 960 L590 1060 L520 1190 L575 1300 L500 1450 L560 1580 L470 1760 L520 1920";

const Terremoto: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const forza = interpolate(f, [0, durata], [1, 0.35], clamp);
  const dx = (Math.sin(f * 2.3) + Math.sin(f * 3.7) * 0.6) * 9 * forza;
  const dy = (Math.cos(f * 2.9) + Math.sin(f * 4.1) * 0.5) * 7 * forza;
  const crepa = interpolate(f, [4, durata * 0.7], [1, 0], clamp);
  const polveri = Array.from({ length: 36 }, (_, i) => ({
    x: 460 + random(`px${i}`) * 180,
    y0: 900 + random(`py${i}`) * 900,
    vel: 2 + random(`pv${i}`) * 4,
    r: 3 + random(`pr${i}`) * 7,
  }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.notteProfonda}, #2a2420)` }}>
      <Svg style={{ transform: `translate(${dx}px, ${dy}px) scale(1.03)` }}>
        <defs>
          <filter id="bagliore" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <path d={MONTAGNA} fill="#1b1a1d" stroke={C.notteLinea} strokeWidth={3} />
        <path d={CREPA} fill="none" stroke={C.oro} strokeWidth={22} pathLength={1} strokeDasharray={1} strokeDashoffset={crepa} filter="url(#bagliore)" opacity={0.7} />
        <path d={CREPA} fill="none" stroke="#fff1c9" strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={crepa} strokeLinejoin="round" />
        {polveri.map((p, i) => (
          <circle
            key={i}
            cx={p.x + Math.sin(f / 8 + i) * 20}
            cy={p.y0 - ((f * p.vel) % 400)}
            r={p.r}
            fill="#6b5a48"
            opacity={0.35 * (1 - ((f * p.vel) % 400) / 400)}
          />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};

// ── 5. Fuoco: fiamme sul fianco del monte, braci che salgono ────────────────

const FIAMMA =
  "M0 0 C-46 -10 -58 -70 -34 -120 C-28 -90 -14 -84 -10 -100 C-14 -150 4 -200 -6 -250 C30 -210 52 -160 44 -110 C56 -120 58 -140 56 -150 C76 -110 72 -40 0 0 Z";

const Fuoco: React.FC<Props> = () => {
  const f = useCurrentFrame();
  const fiamme = Array.from({ length: 13 }, (_, i) => {
    const x = 90 + i * 75 + (random(`fx${i}`) - 0.5) * 40;
    // Più alte verso la cima del monte (x = 600 circa).
    const vicino = 1 - Math.min(1, Math.abs(x - 610) / 560);
    return { x, y: 1330 - vicino * 220, s: 0.8 + vicino * 1.4 + random(`fs${i}`) * 0.3 };
  });
  const braci = Array.from({ length: 60 }, (_, i) => ({
    x: 120 + random(`bx${i}`) * 840,
    y0: 1150 + random(`by${i}`) * 250,
    vel: 4 + random(`bv${i}`) * 7,
    off: random(`bo${i}`) * 900,
    r: 2 + random(`br${i}`) * 4,
  }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #0f0f14, #1e1612 50%, #3a2414)` }}>
      <Svg>
        <defs>
          <radialGradient id="fiamma" cx="0.5" cy="0.9" r="0.9">
            <stop offset="0" stopColor="#fff2c4" />
            <stop offset="0.35" stopColor={C.oro} />
            <stop offset="0.7" stopColor="#b8582b" />
            <stop offset="1" stopColor="#7a2a12" stopOpacity="0" />
          </radialGradient>
          <filter id="caldo" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        <ellipse cx={600} cy={1150} rx={560} ry={260} fill="#c2702e" opacity={0.35 + 0.08 * Math.sin(f / 4)} filter="url(#caldo)" />
        {fiamme.map((fl, i) => {
          const sy = fl.s * (1 + 0.16 * Math.sin(f / 3 + i * 1.3) + 0.07 * Math.sin(f / 1.7 + i));
          const sx = fl.s * (1 + 0.08 * Math.sin(f / 2.3 + i));
          const ondeggia = Math.sin(f / 5 + i * 0.9) * 7;
          return (
            <g key={i} transform={`translate(${fl.x}, ${fl.y}) rotate(${ondeggia}) scale(${sx}, ${sy})`} style={{ mixBlendMode: "screen" }}>
              <path d={FIAMMA} fill="url(#fiamma)" opacity={0.8} />
              <path d={FIAMMA} fill="#fff2c4" opacity={0.55} transform="translate(0, -6) scale(0.45, 0.55)" />
            </g>
          );
        })}
        <path d={MONTAGNA} transform="translate(0, 260)" fill="#0d0b0b" />
        {braci.map((b, i) => {
          const sale = (f * b.vel + b.off) % 900;
          return (
            <circle
              key={i}
              cx={b.x + Math.sin((f + i * 13) / 14) * 30}
              cy={b.y0 - sale}
              r={b.r}
              fill={i % 3 === 0 ? "#fff1c9" : C.oro}
              opacity={interpolate(sale, [0, 100, 900], [0, 0.9, 0], clamp)}
            />
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ── 6. Brezza: tutto si calma, poche linee sottili come un respiro ──────────

const lineaOnda = (baseY: number, ampiezza: number, fase: number, f: number) => {
  const punti: string[] = [];
  for (let x = -60; x <= W + 60; x += 24) {
    const y = baseY + ampiezza * Math.sin(x / 170 + f / 28 + fase) + ampiezza * 0.4 * Math.sin(x / 90 - f / 40 + fase);
    punti.push(`${x === -60 ? "M" : "L"}${x} ${y.toFixed(1)}`);
  }
  return punti.join(" ");
};

const Brezza: React.FC<Props> = () => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 30], [0, 1], clamp);
  const puntini = Array.from({ length: 34 }, (_, i) => ({
    x: random(`mx${i}`) * W,
    y: random(`my${i}`) * H,
    r: 1.5 + random(`mr${i}`) * 3,
  }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #23252e, #3a3226 55%, #6b5434)` }}>
      <Svg>
        <defs>
          <radialGradient id="chiarore">
            <stop offset="0" stopColor={C.crema} stopOpacity="0.5" />
            <stop offset="1" stopColor={C.crema} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={540} cy={760} r={520 + 30 * Math.sin(f / 30)} fill="url(#chiarore)" opacity={0.5 * entra} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={lineaOnda(820 + i * 120, 26 - i * 6, i * 1.7, f)}
            fill="none"
            stroke={i === 1 ? C.oro : C.crema}
            strokeWidth={i === 1 ? 3.5 : 2}
            strokeLinecap="round"
            opacity={(0.6 - i * 0.12) * entra}
          />
        ))}
        {puntini.map((p, i) => (
          <circle
            key={i}
            cx={(p.x + f * (0.6 + (i % 4) * 0.3)) % W}
            cy={p.y - f * 0.4}
            r={p.r}
            fill={C.crema}
            opacity={0.35 * entra * (0.6 + 0.4 * Math.sin(f / 20 + i))}
          />
        ))}
      </Svg>
    </AbsoluteFill>
  );
};

// ── 7. Mantello: la sagoma si copre il volto all'ingresso della caverna ─────

const Mantello: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const luce = interpolate(f, [0, durata], [0.75, 1], clamp);
  const sagoma = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 30 });
  return (
    <AbsoluteFill style={{ background: C.notteProfonda }}>
      <Svg>
        <defs>
          <linearGradient id="fuori" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6dc" />
            <stop offset="0.5" stopColor={C.oro} />
            <stop offset="1" stopColor={C.oroPieno} />
          </linearGradient>
          <filter id="alone" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="50" />
          </filter>
        </defs>
        {/* Raggi lenti dalla bocca della caverna. */}
        <g transform={`rotate(${f * 0.08}, 540, 900)`} opacity={0.12 * luce}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d="M540 900 L500 -400 L580 -400 Z" fill={C.crema} transform={`rotate(${i * 40 - 160}, 540, 900)`} />
          ))}
        </g>
        <path d="M250 1560 L250 820 C250 560 400 420 540 420 C680 420 830 560 830 820 L830 1560 Z" fill={C.oro} opacity={0.45 * luce} filter="url(#alone)" />
        <path d="M290 1560 L290 830 C290 600 420 470 540 470 C660 470 790 600 790 830 L790 1560 Z" fill="url(#fuori)" opacity={luce} />
        <rect x={0} y={1500} width={W} height={420} fill={C.notteProfonda} />
        <svg x={360} y={780 + (1 - sagoma) * 40} width={360} height={760} viewBox="0 0 100 200">
          <path d={SAGOMA_VELATA} fill="#120f0d" stroke={C.oro} strokeWidth={1.2} strokeOpacity={0.9} />
        </svg>
      </Svg>
    </AbsoluteFill>
  );
};

// ── 8. Rumore: notifiche che arrivano da tutte le parti ─────────────────────

const ICONE = [Bell, MessageCircle, Mail, Play, ShoppingBag, Smartphone];

const Rumore: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const quante = 22;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.notteProfonda}, ${C.notte})` }}>
      {Array.from({ length: quante }, (_, i) => {
        const inizio = (i / quante) * durata * 0.85;
        const s = spring({ frame: f - inizio, fps, config: { damping: 12, stiffness: 170 } });
        if (f < inizio) return null;
        const x = 40 + random(`nx${i}`) * (W - 460);
        const y = 160 + random(`ny${i}`) * (H - 420);
        const Icona = ICONE[i % ICONE.length];
        const vibra = Math.sin((f - inizio) * 1.6) * 3 * Math.max(0, 1 - (f - inizio) / 20);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 400,
              height: 112,
              borderRadius: 26,
              background: "rgba(42,46,56,0.94)",
              border: `2px solid ${C.notteLinea}`,
              boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 26px",
              transform: `scale(${s}) rotate(${(random(`nr${i}`) - 0.5) * 6 + vibra}deg)`,
              opacity: 0.55 + 0.45 * s,
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                background: i % 4 === 0 ? C.oro : C.notteLinea,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icona size={32} color={i % 4 === 0 ? stile.inchiostro : C.crema} strokeWidth={1.8} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div style={{ height: 14, width: "70%", borderRadius: 7, background: C.crema, opacity: 0.75 }} />
              <div style={{ height: 12, width: `${50 + random(`nw${i}`) * 40}%`, borderRadius: 6, background: C.testoNotte, opacity: 0.3 }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── 9. Respiro: tutto sparisce, resta un punto d'oro che respira ────────────

const Respiro: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ciclo = 4 * fps; // un respiro ogni 4 secondi, come nella meditazione dell'app
  const entra = interpolate(f, [0, 20], [0, 1], clamp);
  // Verso la fine ("fermarti") il respiro si fa più ampio e lento.
  const calma = interpolate(f, [durata * 0.6, durata], [1, 0.4], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #262a34, ${C.notteProfonda} 70%)` }}>
      <Svg>
        <defs>
          <filter id="aloneRespiro" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>
        {[0, 1, 2].map((i) => {
          const p = ((f + (i * ciclo) / 3) % ciclo) / ciclo;
          return (
            <circle
              key={i}
              cx={540}
              cy={760}
              r={40 + p * 380}
              fill="none"
              stroke={C.oro}
              strokeWidth={3}
              opacity={(1 - p) * 0.55 * entra * calma}
            />
          );
        })}
        <circle cx={540} cy={760} r={70 + 12 * Math.sin((f / ciclo) * Math.PI * 2)} fill={C.oro} opacity={0.35 * entra} filter="url(#aloneRespiro)" />
        <circle cx={540} cy={760} r={22 + 4 * Math.sin((f / ciclo) * Math.PI * 2)} fill={C.oro} opacity={entra} />
      </Svg>
    </AbsoluteFill>
  );
};

// ── 10. Silenzio: cinque minuti, un cerchio che si riempie piano ────────────

const Silenzio: React.FC<Props> = ({ durata }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 24 });
  const pieno = interpolate(f, [10, durata - 10], [0, 1], clamp);
  const R = 300;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.notteSoft}, ${C.notteProfonda} 75%)` }}>
      <Svg style={{ opacity: entra, transform: `scale(${0.94 + 0.06 * entra})` }}>
        <circle cx={540} cy={760} r={R} fill="none" stroke={C.notteLinea} strokeWidth={12} />
        <circle
          cx={540}
          cy={760}
          r={R}
          fill="none"
          stroke={C.oro}
          strokeWidth={12}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - pieno}
          transform="rotate(-90, 540, 760)"
        />
      </Svg>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 760 - 150, opacity: entra }}>
        <div style={{ fontFamily: stile.font, fontWeight: 700, fontSize: 230, color: C.crema, lineHeight: 1 }}>5</div>
        <div style={{ fontFamily: stile.fontAccento, fontStyle: "italic", fontWeight: 700, fontSize: 76, color: C.oro, marginTop: 4 }}>
          minuti
        </div>
        <div style={{ marginTop: 26, opacity: 0.7 }}>
          <BellOff size={44} color={C.crema} strokeWidth={1.6} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GRAFICHE: Record<NomeGrafica, React.FC<Props>> = {
  deserto: Deserto,
  monte: Monte,
  vento: Vento,
  terremoto: Terremoto,
  fuoco: Fuoco,
  brezza: Brezza,
  mantello: Mantello,
  rumore: Rumore,
  respiro: Respiro,
  silenzio: Silenzio,
};

export const Grafica: React.FC<{ nome: NomeGrafica; durata: number }> = ({ nome, durata }) => {
  const Componente = GRAFICHE[nome];
  return <Componente durata={durata} />;
};
