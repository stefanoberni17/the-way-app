// The Way — Episode Mapping
//
// Struttura: 4 settimane singole × 6 episodi = 24 ep totali in Beta
//   Week 1 (ep 1-6):  Notion "Week 1-2" Num 1-6
//   Week 2 (ep 7-12): Notion "Week 1-2" Num 7-12
//   Week 3 (ep 13-18): Notion "Week 3-4" Num 1-6
//   Week 4 (ep 19-24): Notion "Week 3-4" Num 7-12
//
// Formula:
//   pairIndex  = floor((globalEp - 1) / 12)  → 0="Week 1-2", 1="Week 3-4", ...
//   localNum   = ((globalEp - 1) % 12) + 1   → 1-12 nel track Notion
//   weekNumber = floor((globalEp - 1) / 6) + 1

export const EPISODE_TO_WEEK: Record<number, number> = {
  // Week 1 — La voce nel deserto (ep 1-6, Notion "Week 1-2" Num 1-6)
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,
  // Week 2 — La voce nel deserto cont. (ep 7-12, Notion "Week 1-2" Num 7-12)
  7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2,
  // Week 3 — Il silenzio di Nazaret (ep 13-18, Notion "Week 3-4" Num 1-6)
  13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3,
  // Week 4 — Il silenzio di Nazaret cont. (ep 19-24, Notion "Week 3-4" Num 7-12)
  19: 4, 20: 4, 21: 4, 22: 4, 23: 4, 24: 4,
  // Future (Week 5-6 = Notion "Week 5-6" Num 1-12)
  25: 5, 26: 5, 27: 5, 28: 5, 29: 5, 30: 5,
  31: 6, 32: 6, 33: 6, 34: 6, 35: 6, 36: 6,
};

export function getWeekFromEpisode(episodeNumber: number): number {
  return EPISODE_TO_WEEK[episodeNumber] || Math.floor((episodeNumber - 1) / 6) + 1;
}

/**
 * Restituisce il track Notion ("Week 1-2", "Week 3-4", ...) e il Numero locale (1-12)
 * corrispondenti a un episodio globale.
 */
export function getNotionEpisodeRef(globalEp: number): { settimana: string; localNum: number } {
  const pairIndex = Math.floor((globalEp - 1) / 12); // 0-based
  const startWeek = pairIndex * 2 + 1;
  const settimana = `Week ${startWeek}-${startWeek + 1}`;
  const localNum = ((globalEp - 1) % 12) + 1;
  return { settimana, localNum };
}

export function isEpisodeInMVP(episodeNumber: number): boolean {
  const maxEpisode = Math.max(...Object.keys(EPISODE_TO_WEEK).map(Number));
  return episodeNumber >= 1 && episodeNumber <= maxEpisode;
}
