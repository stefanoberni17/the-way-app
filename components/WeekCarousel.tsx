'use client';

import { useState, useRef } from 'react';

interface WeekCarouselProps {
  domandaGuida: string;
  essenza: string;
  mantra: string;
  pratiche: string[];
  scopertaChiave: string;
  onLoadExtended: () => void;
  loadingExtended: boolean;
}

const SLIDES = [
  { id: 'domanda',   label: 'Domanda Guida',  emoji: '💭' },
  { id: 'essenza',   label: 'Essenza',         emoji: '✨' },
  { id: 'mantra',    label: 'Mantra',           emoji: '🍥' },
  { id: 'pratiche',  label: 'Pratiche',         emoji: '🌿' },
  { id: 'scoperta',  label: 'Scoperta Chiave',  emoji: '🔑' },
];

export default function WeekCarousel({
  domandaGuida,
  essenza,
  mantra,
  pratiche,
  scopertaChiave,
  onLoadExtended,
  loadingExtended,
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

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

      {/* Track scorrevole */}
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

          {/* SLIDE 1 — Domanda Guida */}
          <div className="w-full flex-shrink-0 min-h-56 p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-lg flex-shrink-0">
                💭
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Domanda Guida</p>
                <p className="text-xs text-indigo-500">Tienila con te questa settimana</p>
              </div>
            </div>
            <div className="w-full h-px bg-indigo-100 mb-5" />
            <p className="text-gray-800 text-base font-medium leading-relaxed italic text-center px-2">
              {domandaGuida
                ? `"${domandaGuida}"`
                : <span className="text-gray-400 not-italic text-sm">Contenuto non ancora disponibile.</span>
              }
            </p>
          </div>

          {/* SLIDE 2 — Essenza */}
          <div className="w-full flex-shrink-0 min-h-56 p-6 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">
                ✨
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Essenza</p>
                <p className="text-xs text-amber-600">Il cuore di questa settimana</p>
              </div>
            </div>
            <div className="w-full h-px bg-amber-100 mb-4" />
            <p className="text-gray-700 text-sm leading-relaxed">
              {essenza || <span className="text-gray-400 italic">Contenuto non ancora disponibile.</span>}
            </p>
          </div>

          {/* SLIDE 3 — Mantra */}
          <div className="w-full flex-shrink-0 min-h-56 p-6 bg-gradient-to-br from-orange-500 to-amber-500 flex flex-col justify-center">
            <p className="text-orange-200 text-xs font-bold uppercase tracking-widest text-center mb-3">
              🍥 Mantra della settimana
            </p>
            <div className="text-white text-5xl leading-none text-center mb-2 opacity-30 font-serif select-none">❝</div>
            <p className="text-white text-base font-semibold leading-relaxed text-center px-2">
              {mantra
                ? mantra.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))
                : <span className="opacity-60 text-sm font-normal">Mantra non ancora disponibile.</span>
              }
            </p>
            <div className="text-white text-5xl leading-none text-center mt-2 opacity-30 font-serif select-none">❞</div>
          </div>

          {/* SLIDE 4 — Pratiche */}
          <div className="w-full flex-shrink-0 min-h-56 p-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-lg flex-shrink-0">
                🌿
              </div>
              <div>
                <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Le Tue Pratiche</p>
                <p className="text-xs text-green-600">Da portare con te questa settimana</p>
              </div>
            </div>
            <div className="w-full h-px bg-green-100 mb-4" />
            {pratiche.length > 0 ? (
              <ol className="space-y-3">
                {pratiche.map((p, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{p}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-400 text-sm italic">Pratiche non ancora disponibili.</p>
            )}
          </div>

          {/* SLIDE 5 — Scoperta Chiave */}
          <div className="w-full flex-shrink-0 min-h-56 p-6 bg-gradient-to-br from-violet-50 to-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-lg flex-shrink-0">
                🔑
              </div>
              <div>
                <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Scoperta Chiave</p>
                <p className="text-xs text-violet-500">Cosa porterai con te</p>
              </div>
            </div>
            <div className="w-full h-px bg-violet-100 mb-4" />
            <p className="text-gray-700 text-sm leading-relaxed mb-5">
              {scopertaChiave || <span className="text-gray-400 italic">Contenuto non ancora disponibile.</span>}
            </p>
            <button
              onClick={onLoadExtended}
              disabled={loadingExtended}
              className="w-full border-2 border-dashed border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingExtended
                ? <><span className="animate-spin inline-block">⏳</span> Caricamento...</>
                : <>📚 Vedi versione estesa della settimana</>
              }
            </button>
          </div>

        </div>
      </div>

      {/* Barra navigazione */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Precedente"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-2 bg-orange-500'
                  : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(current + 1)}
          disabled={current === SLIDES.length - 1}
          className="w-8 h-8 flex items-center justify-center rounded-full text-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Successivo"
        >
          ›
        </button>
      </div>

      <div className="text-center pb-3">
        <span className="text-xs text-gray-400">
          {SLIDES[current].emoji} {SLIDES[current].label} · {current + 1} di {SLIDES.length}
        </span>
      </div>

    </div>
  );
}
