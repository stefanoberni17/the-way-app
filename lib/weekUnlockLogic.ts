// The Way — Logica unlock settimane basata su completamento episodi
// 33 settimane totali, organizzate in coppie (1-2, 3-4, ..., 31-32) + week 33

// Mapping settimane → range episodi (3 episodi per coppia di settimane)
const WEEK_EPISODES: Record<number, { start: number; end: number }> = {
  1:  { start: 1,  end: 3  },   // Week 1-2 condividono ep 1-3
  2:  { start: 1,  end: 3  },
  3:  { start: 4,  end: 6  },   // Week 3-4 condividono ep 4-6
  4:  { start: 4,  end: 6  },
  5:  { start: 7,  end: 9  },
  6:  { start: 7,  end: 9  },
  7:  { start: 10, end: 12 },
  8:  { start: 10, end: 12 },
  9:  { start: 13, end: 15 },
  10: { start: 13, end: 15 },
  11: { start: 16, end: 18 },
  12: { start: 16, end: 18 },
  13: { start: 19, end: 21 },
  14: { start: 19, end: 21 },
  15: { start: 22, end: 24 },
  16: { start: 22, end: 24 },
  17: { start: 25, end: 27 },
  18: { start: 25, end: 27 },
  19: { start: 28, end: 30 },
  20: { start: 28, end: 30 },
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

    const previousWeek = week - 1;
    const range = WEEK_EPISODES[previousWeek];
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
 * MVP Beta: solo Week 1-4 accessibili (episodi 1-6)
 */
export const BETA_MAX_WEEK = 2;
export const BETA_MAX_EPISODE = 4;

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
