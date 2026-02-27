// Logica unlock settimane basata su completamento episodi

// Mapping settimane → range episodi
const WEEK_EPISODES: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 5 },
  2: { start: 1, end: 5 },   // Week 1-2 condividono episodi 1-5
  3: { start: 6, end: 12 },
  4: { start: 6, end: 12 },  // Week 3-4 condividono episodi 6-12
  5: { start: 13, end: 19 },
  6: { start: 13, end: 19 }, // Week 5-6 condividono episodi 13-19
};

interface EpisodeProgress {
  episode_number: number;
  completed: boolean;
}

/**
 * Determina quali settimane sono sbloccate per un utente
 * @param completedEpisodes - Array di episodi completati
 * @returns Array di numeri settimana sbloccate
 */
export function getUnlockedWeeks(completedEpisodes: EpisodeProgress[]): number[] {
  const completedNumbers = completedEpisodes
    .filter(ep => ep.completed)
    .map(ep => ep.episode_number);

  const unlockedWeeks: number[] = [];

  for (let week = 1; week <= 6; week++) {
    if (week === 1) {
      // Week 1 sempre sbloccata
      unlockedWeeks.push(1);
      continue;
    }

    const previousWeek = week - 1;
    const { start, end } = WEEK_EPISODES[previousWeek];

    // Week N sbloccata se TUTTI gli episodi della week N-1 sono completati
    const allPreviousCompleted = Array.from(
      { length: end - start + 1 }, 
      (_, i) => start + i
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
  const unlocked = getUnlockedWeeks(completedEpisodes);
  return unlocked.includes(weekNumber);
}

/**
 * Calcola prossima settimana da sbloccare
 */
export function getNextWeekToUnlock(completedEpisodes: EpisodeProgress[]): number | null {
  const unlocked = getUnlockedWeeks(completedEpisodes);
  const nextWeek = Math.max(...unlocked) + 1;
  return nextWeek <= 6 ? nextWeek : null;
}
