// The Way — Logica unlock settimane basata su completamento episodi
// 6 settimane Beta (singole), 7 passi ciascuna (6 Lectio + 1 Integrazione)

// Mapping settimane → range episodi (7 passi per singola settimana)
const WEEK_EPISODE_RANGES: Record<number, { start: number; end: number }> = {
  1: { start: 1,  end: 7  },
  2: { start: 8,  end: 14 },
  3: { start: 15, end: 21 },
  4: { start: 22, end: 28 },
  5: { start: 29, end: 35 },
  6: { start: 36, end: 42 },
  7: { start: 43, end: 49 },
  8: { start: 50, end: 56 },
};

const TOTAL_WEEKS = 33;

interface EpisodeProgress {
  episode_number: number;
  completed: boolean;
}

/**
 * Determina quali settimane sono sbloccate per un utente
 */
export function getUnlockedWeeks(completedEpisodes: EpisodeProgress[]): number[] {
  const completedNumbers = completedEpisodes
    .filter(ep => ep.completed)
    .map(ep => ep.episode_number);

  const unlockedWeeks: number[] = [];

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    if (week === 1) {
      unlockedWeeks.push(1);
      continue;
    }

    const range = WEEK_EPISODE_RANGES[week - 1];
    if (!range) break; // Episodi non ancora mappati

    const allPreviousCompleted = Array.from(
      { length: range.end - range.start + 1 },
      (_, i) => range.start + i
    ).every(epNum => completedNumbers.includes(epNum));

    if (allPreviousCompleted) {
      unlockedWeeks.push(week);
    }
  }

  return unlockedWeeks;
}

/**
 * Controlla se una settimana specifica è sbloccata
 */
export function isWeekUnlocked(weekNumber: number, completedEpisodes: EpisodeProgress[]): boolean {
  return getUnlockedWeeks(completedEpisodes).includes(weekNumber);
}

/**
 * Calcola prossima settimana da sbloccare
 */
export function getNextWeekToUnlock(completedEpisodes: EpisodeProgress[]): number | null {
  const unlocked = getUnlockedWeeks(completedEpisodes);
  const nextWeek = Math.max(...unlocked) + 1;
  return nextWeek <= TOTAL_WEEKS ? nextWeek : null;
}

// ========================================
// BETA RESTRICTIONS
// ========================================

/**
 * MVP Beta: Settimane 1-6 accessibili (passi 1-42, 7 per settimana)
 */
export const BETA_MAX_WEEK = 6;
export const BETA_MAX_EPISODE = 42;

export function isWeekUnlockedInBeta(weekNumber: number): boolean {
  return weekNumber <= BETA_MAX_WEEK;
}

export function getWeekLockMessage(weekNumber: number): string {
  if (weekNumber > BETA_MAX_WEEK) {
    return 'Questa settimana sarà disponibile nella versione completa del percorso. Stay tuned! ✝️';
  }
  return '';
}

export function isEpisodeUnlockedInBeta(episodeNumber: number): boolean {
  return episodeNumber <= BETA_MAX_EPISODE;
}
