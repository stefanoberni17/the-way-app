// The Way — Episode Mapping
//
// A differenza di Naruto Inner Path, The Way usa una query dinamica su Notion
// per trovare i passi biblici tramite il campo "Numero".
// Non c'è quindi un mapping statico pageId → numero.
//
// EPISODE_TO_WEEK: mappa statica numero episodio → settimana corrente
// (aggiornare man mano che si aggiungono contenuti Notion)
//
// Struttura MVP:
//   Parte 1 — Le Fondamenta (Week 1-10) → 30 episodi (~3 per coppia di settimane)
//   MVP Beta: Week 1-4 → episodi 1-7

export const EPISODE_TO_WEEK: Record<number, number> = {
  // Week 1-2 — La voce nel deserto (4 passi) [BETA attivo]
  1: 1, 2: 1, 3: 1, 4: 1,
  // Week 3-4 — Il silenzio di Nazaret (3 passi) [BETA attivo]
  5: 3, 6: 3, 7: 3,
  // Week 5-6 — La voce che chiama (future)
  8: 5, 9: 5, 10: 5,
  // Week 7-8 — Le Beatitudini (future)
  11: 7, 12: 7, 13: 7,
  // Week 9-10 — I primi miracoli (future)
  14: 9, 15: 9, 16: 9,
  // Week 11-12 — Le parabole dello specchio (future)
  17: 11, 18: 11, 19: 11,
  // Week 13-14 — Il Buon Samaritano (future)
  20: 13, 21: 13, 22: 13,
  // Week 15-16 — Il Figliol Prodigo (future)
  23: 15, 24: 15, 25: 15,
  // Week 17-18 — La donna al pozzo (future)
  26: 17, 27: 17, 28: 17,
  // Week 19-20 — Camminare sulle acque (future)
  29: 19, 30: 19, 31: 19,
};

export function getWeekFromEpisode(episodeNumber: number): number {
  return EPISODE_TO_WEEK[episodeNumber] || 1;
}

export function isEpisodeInMVP(episodeNumber: number): boolean {
  // MVP: tutti gli episodi fino al massimo definito
  const maxEpisode = Math.max(...Object.keys(EPISODE_TO_WEEK).map(Number));
  return episodeNumber >= 1 && episodeNumber <= maxEpisode;
}
