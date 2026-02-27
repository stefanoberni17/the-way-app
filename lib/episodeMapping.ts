export const EPISODE_MAPPING: Record<number, string> = {
  1: '2b1655f726c780a89749c23c9dab1a3f',
  2: '2b1655f726c7806696e9c7032458099e',
  3: '2b1655f726c78070a7d0f14414e537e9',
  4: '2b1655f726c7809da5e1efc76b083063',
  5: '2b1655f726c78060a330fc1856659f37',
  6: '2b1655f726c7809bb3d8d6f4a077ec23',
  7: '2b1655f726c780ad8f8cde821a99ea88',
  8: '2b1655f726c78093abe0e398b8be7421',
  9: '2b1655f726c780099243edc9151fe53b',
  10: '2b1655f726c78030bf8bcafb5c64b4aa',
  11: '2b1655f726c7802bb43ff1b53846299b',
  12: '2b1655f726c780aab64dd6ccd7ce6396',
  13: '2b1655f726c780eebac5d5cb928a1d4a',
  14: '2b1655f726c780be82c6de51da91012e',
  15: '2b1655f726c780b8b8d1d8a384b9bf0f',
  16: '2b1655f726c780f3bc13fd827b842165',
  17: '2b1655f726c7809b8cdcd69122f89002',
  18: '2b1655f726c7802bb276d6ce3dd5f2ba',
  19: '2b1655f726c780228729fe22cac0fb35',
};

export const EPISODE_TO_WEEK: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 2, 5: 2,
  6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 6, 17: 6, 18: 6, 19: 6,
};

export function getEpisodePageId(episodeNumber: number): string | null {
  return EPISODE_MAPPING[episodeNumber] || null;
}

export function getWeekFromEpisode(episodeNumber: number): number {
  return EPISODE_TO_WEEK[episodeNumber] || 1;
}

export function isEpisodeInMVP(episodeNumber: number): boolean {
  return episodeNumber >= 1 && episodeNumber <= 19;
}