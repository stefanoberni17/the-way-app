// The Way — Logica unlock settimane basata su completamento episodi
// 4 settimane Beta (singole), 6 episodi ciascuna

// Mapping settimane → range episodi (6 episodi per singola settimana)
const WEEK_EPISODE_RANGES: Record<number, { start: number; end: number }> = {
  1:  { start: 1,  end: 6  },
  2:  { start: 7,  end: 12 },
  3:  { start: 13, end: 18 },
  4:  { start: 19, end: 24 },
  5:  { start: 25, end: 30 },
  6:  { start: 31, end: 36 },
  7:  { start: 37, end: 42 },
  8:  { start: 43, end: 48 },
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
 * MVP Beta: Settimane 1-4 accessibili (episodi 1-24)
 */
export const BETA_MAX_WEEK = 4;
export const BETA_MAX_EPISODE = 24;

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
