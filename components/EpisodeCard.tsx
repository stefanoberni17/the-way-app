'use client';

import { useRouter } from 'next/navigation';

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
  onComplete
}: EpisodeCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isLocked) return;
    // Passiamo from e week per garantire un fresh mount della settimana
    // quando l'utente torna indietro dopo il completamento
    router.push(`/episodio/${episodeNumber}?userId=${userId}&from=${settimanaId}&week=${weekNumber}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl border transition-all p-4
        ${isLocked
          ? 'opacity-50 cursor-not-allowed border-stone-100'
          : isCompleted
            ? 'cursor-pointer hover:shadow-md border-green-200 border-l-4 border-l-green-400'
            : 'cursor-pointer hover:shadow-md border-stone-200 border-l-4 border-l-amber-400 hover:border-amber-300'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2 gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          isCompleted
            ? 'text-green-700 bg-green-100'
            : isLocked
            ? 'text-stone-400 bg-stone-100'
            : 'text-amber-700 bg-amber-100'
        }`}>
          Passo {episodeNumber}
        </span>
        <span className="text-xl flex-shrink-0">
          {isLocked ? '🔒' : isCompleted ? '✅' : '📖'}
        </span>
      </div>

      <h3 className={`font-serif font-semibold text-sm leading-snug mb-3 ${
        isLocked ? 'text-stone-400' : 'text-gray-800'
      }`}>
        {title}
      </h3>

      {isLocked && (
        <p className="text-xs text-stone-400 bg-stone-50 p-2 rounded-lg border border-stone-100">
          🔒 Completa il passo {episodeNumber - 1} per sbloccare
        </p>
      )}

      {isCompleted && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg text-center border border-green-100">
          ✅ Completato
        </div>
      )}

      {!isLocked && !isCompleted && (
        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg text-center border border-amber-100 font-medium">
          Tocca per iniziare →
        </div>
      )}
    </div>
  );
}
