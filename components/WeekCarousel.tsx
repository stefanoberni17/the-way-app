'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Sparkles, Leaf, KeyRound } from 'lucide-react';
import { Eyebrow, Ornament, IconBadge } from '@/components/ui';
import type { ReactNode } from 'react';

interface WeekCarouselProps {
  domandaGuida: string;
  essenza: string;
  mantra: string;
  pratiche: string[];
  scopertaChiave: string;
}

const SLIDES = [
  { id: 'domanda',  label: 'Domanda guida' },
  { id: 'essenza',  label: 'Essenza' },
  { id: 'mantra',   label: 'Versetto' },
  { id: 'pratiche', label: 'Pratiche' },
  { id: 'scoperta', label: 'Scoperta chiave' },
];

function Empty({ children = 'Contenuto non ancora disponibile.' }: { children?: ReactNode }) {
  return <p className="text-muted italic font-serif text-lg">{children}</p>;
}

export default function WeekCarousel({
  domandaGuida,
  essenza,
  mantra,
  pratiche,
  scopertaChiave,
}: WeekCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const goTo = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    setCurrent(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy) isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) goTo(current + 1);
      else goTo(current - 1);
    }
  };

  const slideBase = 'w-full flex-shrink-0 min-h-64 p-6 sm:p-7 flex flex-col';

  return (
    <div className="bg-paper rounded-2xl border border-line shadow-[var(--shadow-card)] overflow-hidden">

      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >

          {/* 1 — Domanda guida */}
          <div className={slideBase}>
            <div className="flex items-center gap-3 mb-5">
              <IconBadge size="sm"><HelpCircle strokeWidth={1.8} /></IconBadge>
              <div>
                <Eyebrow>Domanda guida</Eyebrow>
                <p className="text-xs text-muted mt-0.5">Tienila con te questa settimana</p>
              </div>
            </div>
            <div className="flex-1 flex items-center">
              {domandaGuida ? (
                <p className="font-serif text-[26px] leading-[1.3] text-ink italic">
                  {domandaGuida}
                </p>
              ) : <Empty />}
            </div>
          </div>

          {/* 2 — Essenza */}
          <div className={slideBase}>
            <div className="flex items-center gap-3 mb-5">
              <IconBadge size="sm"><Sparkles strokeWidth={1.8} /></IconBadge>
              <div>
                <Eyebrow>Essenza</Eyebrow>
                <p className="text-xs text-muted mt-0.5">Il cuore di questa settimana</p>
              </div>
            </div>
            {essenza ? (
              <p className="text-[15px] text-ink-soft leading-relaxed whitespace-pre-line">{essenza}</p>
            ) : <Empty />}
          </div>

          {/* 3 — Versetto (notte) */}
          <div className={`${slideBase} bg-night text-night-text justify-center items-center text-center relative overflow-hidden`}>
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gold-light/10 blur-3xl pointer-events-none" aria-hidden />
            <Eyebrow tone="night" className="justify-center mb-5">Versetto della settimana</Eyebrow>
            {mantra ? (
              <p className="font-serif italic text-[26px] leading-[1.3] text-night-text whitespace-pre-line max-w-sm">
                {mantra}
              </p>
            ) : <p className="font-serif italic text-night-muted text-lg">Versetto non ancora disponibile.</p>}
            <Ornament tone="night" className="w-24 mt-6" />
          </div>

          {/* 4 — Pratiche */}
          <div className={slideBase}>
            <div className="flex items-center gap-3 mb-5">
              <IconBadge size="sm"><Leaf strokeWidth={1.8} /></IconBadge>
              <div>
                <Eyebrow>Le tue pratiche</Eyebrow>
                <p className="text-xs text-muted mt-0.5">Da portare con te questa settimana</p>
              </div>
            </div>
            {pratiche.length > 0 ? (
              <ol className="space-y-3.5">
                {pratiche.map((p, i) => (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className="font-serif text-2xl leading-none text-gold w-6 flex-shrink-0 mt-[-2px]">{i + 1}</span>
                    <p className="text-[15px] text-ink-soft leading-relaxed">{p}</p>
                  </li>
                ))}
              </ol>
            ) : <Empty>Pratiche non ancora disponibili.</Empty>}
          </div>

          {/* 5 — Scoperta chiave */}
          <div className={slideBase}>
            <div className="flex items-center gap-3 mb-5">
              <IconBadge size="sm"><KeyRound strokeWidth={1.8} /></IconBadge>
              <div>
                <Eyebrow>Scoperta chiave</Eyebrow>
                <p className="text-xs text-muted mt-0.5">Cosa porterai con te</p>
              </div>
            </div>
            {scopertaChiave ? (
              <p className="text-[15px] text-ink-soft leading-relaxed whitespace-pre-line">{scopertaChiave}</p>
            ) : <Empty />}
            <p className="text-xs text-faint mt-5">Continua sotto per la preghiera e l&apos;approfondimento.</p>
          </div>

        </div>
      </div>

      {/* Navigazione */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-line">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted hover:text-gold-deep hover:bg-gold-wash transition-all disabled:opacity-20"
          aria-label="Precedente"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={SLIDES[i].label}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-1.5 bg-gold' : 'w-1.5 h-1.5 bg-line-strong hover:bg-gold-light'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted tracking-wide">
            {SLIDES[current].label} · {current + 1} di {SLIDES.length}
          </span>
        </div>

        <button
          onClick={() => goTo(current + 1)}
          disabled={current === SLIDES.length - 1}
          className="w-9 h-9 flex items-center justify-center rounded-full text-muted hover:text-gold-deep hover:bg-gold-wash transition-all disabled:opacity-20"
          aria-label="Successivo"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
