/**
 * BrandCross — segno grafico del brand The Way.
 *
 * Croce sottile in oro dentro un alone di luce, con il sentiero
 * curvo sotto che evoca "la via". Funziona su carta (default)
 * e su notte (tone="night").
 */
export default function BrandCross({
  className = '',
  size = 56,
  tone = 'paper',
}: {
  className?: string;
  size?: number;
  tone?: 'paper' | 'night';
}) {
  const halo = tone === 'night' ? '#d8b262' : '#b8862b';
  const haloOpacity = tone === 'night' ? 0.14 : 0.12;
  const stroke = tone === 'night' ? '#d8b262' : '#b8862b';
  const spark = tone === 'night' ? '#fff6dd' : '#8f671c';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="The Way"
      className={className}
    >
      <circle cx="32" cy="28" r="22" fill={halo} opacity={haloOpacity} />
      <circle cx="32" cy="28" r="14" fill={halo} opacity={haloOpacity} />

      <line x1="32" y1="12" x2="32" y2="48" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="22" y1="23" x2="42" y2="23" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />

      <circle cx="32" cy="12" r="1.8" fill={spark} />

      <path
        d="M 10 57 Q 32 50 54 57"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
