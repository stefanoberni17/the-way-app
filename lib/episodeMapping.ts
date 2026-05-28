// The Way — Episode (Passo) Mapping
//
// Struttura: 7 passi per settimana singola (6 Lectio + 1 Integrazione).
// Beta: 6 settimane × 7 = 42 passi totali.
//
// Formula:
//   weekNumber = ceil(globalEp / 7)
//   localNum   = ((globalEp - 1) % 7) + 1   → 1-7 nella settimana
//   settimana  = `Week ${weekNumber}`        → matcha la property Notion

const PASSI_PER_WEEK = 7;
const TOTAL_BETA_WEEKS = 6;
const TOTAL_WEEKS = 6;

export function getWeekFromEpisode(episodeNumber: number): number {
  return Math.ceil(episodeNumber / PASSI_PER_WEEK);
}

export const EPISODE_TO_WEEK: Record<number, number> = (() => {
  const map: Record<number, number> = {};
  for (let ep = 1; ep <= TOTAL_WEEKS * PASSI_PER_WEEK; ep++) {
    map[ep] = getWeekFromEpisode(ep);
  }
  return map;
})();

/**
 * Restituisce il valore Settimana ("Week N") e il Numero locale (1-7)
 * corrispondenti a un episodio globale, allineati al DB Notion "Passi Biblici - The Way".
 */
export function getNotionEpisodeRef(globalEp: number): { settimana: string; localNum: number } {
  const week = getWeekFromEpisode(globalEp);
  const localNum = ((globalEp - 1) % PASSI_PER_WEEK) + 1;
  return { settimana: `Week ${week}`, localNum };
}

export function isEpisodeInMVP(episodeNumber: number): boolean {
  return episodeNumber >= 1 && episodeNumber <= TOTAL_WEEKS * PASSI_PER_WEEK;
}

export const PASSI_PER_WEEK_COUNT = PASSI_PER_WEEK;
export const TOTAL_BETA_EPISODES = TOTAL_BETA_WEEKS * PASSI_PER_WEEK;
