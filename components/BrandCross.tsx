/**
 * BrandCross — segno grafico minimal del brand The Way.
 *
 * Una croce stilizzata in stroke amber/oro, sobria, senza serif.
 * Usata in login/register/onboarding al posto dell'emoji ✝️ (cartoonesca)
 * per mantenere coerenza con `public/icon.svg` e con l'estetica
 * editoriale dell'app.
 *
 * Default: 56×56px, color amber-400. Personalizzabile via className.
 */
export default function BrandCross({
  className = '',
  size = 56,
}: {
  className?: string;
  size?: number;
}) {
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
      {/* Alone soffuso */}
      <circle cx="32" cy="28" r="20" fill="#1e293b" opacity="0.25" />

      {/* Croce — stroke arrotondato, peso medio */}
      <line
        x1="32"
        y1="14"
        x2="32"
        y2="50"
        stroke="#f59e0b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="24"
        x2="42"
        y2="24"
        stroke="#f59e0b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Punto luce in cima */}
      <circle cx="32" cy="14" r="1.6" fill="#fef3c7" />

      {/* Sentiero curvo sotto, evoca "la via" */}
      <path
        d="M 12 56 Q 32 50 52 56"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
