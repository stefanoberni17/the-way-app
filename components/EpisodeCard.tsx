'use client';

import { useRouter } from 'next/navigation';
import { Lock, Check, ArrowRight } from 'lucide-react';

interface EpisodeCardProps {
  episodeNumber: number;
  title: string;
  isCompleted: boolean;
  isLocked: boolean;
  weekNumber: number;
  userId: string;
  settimanaId: string;
  onComplete: () => void;
}

export default function EpisodeCard({
  episodeNumber,
  title,
  isCompleted,
  isLocked,
  weekNumber,
  userId,
  settimanaId,
}: EpisodeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isLocked) return;
    router.push(`/episodio/${episodeNumber}?userId=${userId}&from=${settimanaId}&week=${weekNumber}`);
  };

  // Il titolo "Titolo — sottotitolo" viene diviso in due righe tipografiche
  const [mainTitle, subTitle] = title.split(' — ');
  const localNumber = ((episodeNumber - 1) % 7) + 1;
  const isNext = !isLocked && !isCompleted;

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      className={`w-full text-left flex items-start gap-4 px-4 py-4 rounded-2xl border transition-all ${
        isLocked
          ? 'bg-transparent border-dashed border-line-strong opacity-60 cursor-not-allowed'
          : isCompleted
          ? 'bg-paper-warm border-line hover:border-sage/40'
          : 'bg-paper border-gold/40 shadow-[var(--shadow-card)] hover:-translate-y-px'
      }`}
    >
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isLocked
            ? 'bg-parchment-deep text-faint'
            : isCompleted
            ? 'bg-sage text-paper'
            : 'bg-gold text-paper'
        }`}
      >
        {isLocked ? (
          <Lock className="w-3.5 h-3.5" strokeWidth={2} />
        ) : isCompleted ? (
          <Check className="w-4 h-4" strokeWidth={2.5} />
        ) : (
          <span className="font-serif text-lg font-semibold leading-none">{localNumber}</span>
        )}
      </span>

      <span className="flex-1 min-w-0">
        <span className={`block text-[11px] font-semibold uppercase tracking-[0.16em] mb-1 ${
          isNext ? 'text-gold-deep' : 'text-muted'
        }`}>
          Passo {episodeNumber}{isNext && ' · Prossimo'}
        </span>
        <span className={`block font-serif text-xl leading-tight font-semibold ${isLocked ? 'text-muted' : 'text-ink'}`}>
          {mainTitle}
        </span>
        {subTitle && (
          <span className={`block text-sm mt-0.5 leading-snug ${isLocked ? 'text-faint' : 'text-ink-soft'}`}>
            {subTitle}
          </span>
        )}
      </span>

      {!isLocked && (
        <ArrowRight className="w-4 h-4 text-faint flex-shrink-0 mt-2" strokeWidth={1.8} />
      )}
    </button>
  );
}
