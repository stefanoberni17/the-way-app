'use client';

/**
 * Primitive UI di The Way — "Pergamena e Oro".
 *
 * Tutte le schermate compongono questi pochi elementi così che
 * l'estetica resti coerente: card di carta con filo sottile, eyebrow
 * in maiuscoletto oro, titoli in Cormorant, bottoni a pillola.
 */

import { ArrowLeft } from 'lucide-react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────
type CardTone = 'paper' | 'warm' | 'gold' | 'night' | 'sage' | 'ghost';

const CARD_TONES: Record<CardTone, string> = {
  paper: 'bg-paper border border-line shadow-[var(--shadow-card)]',
  warm: 'bg-paper-warm border border-line',
  gold: 'bg-gold-wash border border-gold-soft',
  night: 'bg-night border border-night-line text-night-text shadow-[var(--shadow-float)]',
  sage: 'bg-sage-soft border border-sage/20',
  ghost: 'bg-transparent border border-dashed border-line-strong',
};

export function Card({
  children,
  tone = 'paper',
  className = '',
  padded = true,
  onClick,
}: {
  children: ReactNode;
  tone?: CardTone;
  className?: string;
  padded?: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`rounded-2xl ${CARD_TONES[tone]} ${padded ? 'p-5 sm:p-6' : ''} ${
        onClick ? 'w-full text-left transition-all hover:-translate-y-px active:translate-y-0' : ''
      } ${className}`}
    >
      {children}
    </Comp>
  );
}

// ─────────────────────────────────────────────────────────────
// Eyebrow — etichetta piccola in maiuscoletto
// ─────────────────────────────────────────────────────────────
type EyebrowTone = 'gold' | 'muted' | 'night' | 'sage' | 'rose';
const EYEBROW_TONES: Record<EyebrowTone, string> = {
  gold: 'text-gold-deep',
  muted: 'text-muted',
  night: 'text-gold-light',
  sage: 'text-sage',
  rose: 'text-rose',
};

export function Eyebrow({
  children,
  tone = 'gold',
  icon,
  className = '',
}: {
  children: ReactNode;
  tone?: EyebrowTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.18em] flex items-center gap-2 ${EYEBROW_TONES[tone]} ${className}`}
    >
      {icon && <span className="inline-flex [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>}
      <span>{children}</span>
    </p>
  );
}

// ─────────────────────────────────────────────────────────────
// Ornament — piccolo segno tipografico separatore
// ─────────────────────────────────────────────────────────────
export function Ornament({ className = '', tone = 'gold' }: { className?: string; tone?: 'gold' | 'night' }) {
  const color = tone === 'night' ? 'bg-gold-light/60' : 'bg-gold/70';
  const dot = tone === 'night' ? 'text-gold-light' : 'text-gold';
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className={`h-px flex-1 ${color}`} />
      <span className={`text-[10px] ${dot}`}>✦</span>
      <span className={`h-px flex-1 ${color}`} />
    </div>
  );
}

export function Rule({ className = '' }: { className?: string }) {
  return <div className={`h-px w-10 bg-gold/70 ${className}`} aria-hidden />;
}

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'night' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-paper hover:bg-night active:bg-night-soft shadow-[0_2px_10px_-4px_rgba(30,25,15,0.5)]',
  secondary:
    'bg-paper text-ink border border-line-strong hover:border-gold hover:text-gold-deep active:bg-gold-wash',
  gold: 'bg-gold text-paper hover:bg-gold-deep active:bg-gold-deep shadow-[0_2px_10px_-4px_rgba(184,134,43,0.6)]',
  ghost: 'bg-transparent text-muted hover:text-ink hover:bg-parchment-deep/60',
  night: 'bg-gold-light text-night hover:bg-gold-soft active:bg-gold-soft',
  danger: 'bg-transparent text-rose border border-rose/30 hover:bg-rose-soft',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-5 py-3',
  lg: 'text-[15px] px-6 py-3.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed [&>svg]:w-4 [&>svg]:h-4 ${
        BUTTON_VARIANTS[variant]
      } ${BUTTON_SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// PageHeader — testata chiara con eyebrow, titolo serif e filo oro
// ─────────────────────────────────────────────────────────────
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  onBack,
  right,
  center = false,
  className = '',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <header className={`px-5 pt-8 pb-6 ${className}`}>
      <div className={`max-w-2xl mx-auto ${center ? 'text-center' : ''}`}>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors mb-5 -ml-1 px-1 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Indietro
          </button>
        )}
        <div className={`flex items-start gap-4 ${center ? 'justify-center' : 'justify-between'}`}>
          <div className="min-w-0">
            {eyebrow && <Eyebrow className={`mb-2 ${center ? 'justify-center' : ''}`}>{eyebrow}</Eyebrow>}
            <h1 className="font-serif text-[34px] sm:text-[40px] leading-[1.05] font-semibold text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="text-ink-soft text-sm mt-2 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {right && <div className="flex-shrink-0">{right}</div>}
        </div>
        <Rule className={`mt-5 ${center ? 'mx-auto' : ''}`} />
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// SectionTitle — titolo di sezione dentro la pagina
// ─────────────────────────────────────────────────────────────
export function SectionTitle({
  children,
  hint,
  right,
  className = '',
}: {
  children: ReactNode;
  hint?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-3 mb-3 px-1 ${className}`}>
      <div>
        <h2 className="font-serif text-2xl leading-none font-semibold text-ink">{children}</h2>
        {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Verse — citazione in Cormorant italic
// ─────────────────────────────────────────────────────────────
export function Verse({
  children,
  reference,
  tone = 'paper',
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  reference?: ReactNode;
  tone?: 'paper' | 'night';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const textColor = tone === 'night' ? 'text-night-text' : 'text-ink';
  const refColor = tone === 'night' ? 'text-gold-light' : 'text-gold-deep';
  const sizeCls = size === 'lg' ? 'text-[26px] sm:text-[30px]' : size === 'sm' ? 'text-lg' : 'text-[22px] sm:text-2xl';
  return (
    <figure className={className}>
      <blockquote
        className={`font-serif italic leading-[1.35] whitespace-pre-line ${sizeCls} ${textColor}`}
      >
        {children}
      </blockquote>
      {reference && (
        <figcaption className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${refColor}`}>
          {reference}
        </figcaption>
      )}
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────
// Pill / Chip
// ─────────────────────────────────────────────────────────────
export function Chip({
  children,
  active = false,
  onClick,
  tone = 'gold',
  className = '',
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tone?: 'gold' | 'ink';
  className?: string;
}) {
  const activeCls = tone === 'ink' ? 'bg-ink text-paper border-ink' : 'bg-gold text-paper border-gold';
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
        active ? activeCls : 'bg-paper border-line text-ink-soft hover:border-gold-light'
      } ${className}`}
    >
      {children}
    </Comp>
  );
}

export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-gold-soft text-gold-deep ${className}`}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Notice — messaggi di stato (errore, successo, info)
// ─────────────────────────────────────────────────────────────
export function Notice({
  children,
  tone = 'info',
  className = '',
}: {
  children: ReactNode;
  tone?: 'info' | 'error' | 'success' | 'gold';
  className?: string;
}) {
  const tones = {
    info: 'bg-paper-warm border-line text-ink-soft',
    error: 'bg-rose-soft border-rose/20 text-rose',
    success: 'bg-sage-soft border-sage/20 text-sage',
    gold: 'bg-gold-wash border-gold-soft text-gold-deep',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]} ${className}`}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Field — label + input
// ─────────────────────────────────────────────────────────────
export const inputClass =
  'w-full px-4 py-3 rounded-xl bg-paper border border-line text-sm text-ink placeholder:text-faint outline-none transition-all focus:border-gold focus:ring-4 focus:ring-gold/10';

export function Field({
  label,
  optional,
  hint,
  children,
}: {
  label: ReactNode;
  optional?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
        {label}
        {optional && <span className="text-faint font-normal ml-1">(facoltativo)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LoadingScreen
// ─────────────────────────────────────────────────────────────
export function LoadingScreen({ label = 'Un momento…' }: { label?: string }) {
  return (
    <main className="min-h-screen bg-parchment flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative w-14 h-14 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-breathe" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CrossMark className="w-5 h-5 text-gold" />
          </div>
        </div>
        <p className="font-serif italic text-xl text-ink-soft">{label}</p>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// CrossMark — croce sottile a linea, usata come segno inline
// ─────────────────────────────────────────────────────────────
export function CrossMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3v18M6 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// ProgressBar
// ─────────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  tone = 'gold',
  className = '',
  height = 'h-1.5',
}: {
  value: number;
  tone?: 'gold' | 'sage' | 'night';
  className?: string;
  height?: string;
}) {
  const fill = tone === 'sage' ? 'bg-sage' : tone === 'night' ? 'bg-gold-light' : 'bg-gold';
  const track = tone === 'night' ? 'bg-night-line' : 'bg-parchment-deep';
  return (
    <div className={`w-full ${height} rounded-full overflow-hidden ${track} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${fill}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// IconBadge — cerchio con icona
// ─────────────────────────────────────────────────────────────
export function IconBadge({
  children,
  tone = 'gold',
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  tone?: 'gold' | 'night' | 'sage' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const tones = {
    gold: 'bg-gold-soft text-gold-deep',
    night: 'bg-night-soft text-gold-light',
    sage: 'bg-sage-soft text-sage',
    muted: 'bg-parchment-deep text-muted',
  };
  const sizes = {
    sm: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
    md: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
    lg: 'w-14 h-14 [&>svg]:w-7 [&>svg]:h-7',
  };
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {children}
    </div>
  );
}
