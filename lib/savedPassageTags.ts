// Tag tematici curati per i passi "custoditi".
// Pensati come "necessita' quotidiane": l'utente cerca un passo in base
// al momento della vita che sta vivendo, non al tema del percorso.
//
// I tag sono fissi (catalogo curato) per evitare frammentazione e
// mantenere il tono The Way. L'auto-suggerimento per passo si basa
// su SUGGESTED_TAGS_BY_EPISODE.

export interface PassageTag {
  id: string;          // chiave stabile, usata nel DB
  label: string;       // testo mostrato all'utente
  icon: string;        // emoji
}

export const PASSAGE_TAGS: PassageTag[] = [
  { id: 'paura',         label: 'Quando ho paura',              icon: '😨' },
  { id: 'fiducia',       label: 'Quando perdo fiducia',         icon: '🌱' },
  { id: 'decidere',      label: 'Quando devo decidere',         icon: '❓' },
  { id: 'fretta',        label: 'Quando ho fretta',             icon: '⏱️' },
  { id: 'solo',          label: 'Quando mi sento solo',         icon: '🌑' },
  { id: 'sera',          label: 'Per la sera',                  icon: '🌙' },
  { id: 'mattino',       label: 'Per iniziare la giornata',     icon: '☀️' },
  { id: 'stanco',        label: 'Quando sono stanco',           icon: '🛌' },
  { id: 'dubbi',         label: 'Quando ho dubbi su di me',     icon: '🪞' },
  { id: 'ringraziare',   label: 'Per ringraziare',              icon: '🙏' },
  { id: 'dolore',        label: 'Quando vivo un dolore',        icon: '💔' },
  { id: 'cambiamento',   label: 'Per affrontare un cambiamento', icon: '🌀' },
];

// Lookup veloce per id
export const TAG_MAP: Record<string, PassageTag> = Object.fromEntries(
  PASSAGE_TAGS.map(t => [t.id, t])
);

// Auto-suggerimento per i 28 passi MVP. Basato sui temi reali del passo:
// salmi di protezione → paura/solo, parole di Gesù sulla calma → fretta/stanco, etc.
// Non esaustivo — l'utente puo' sempre aggiungere o togliere.
export const SUGGESTED_TAGS_BY_EPISODE: Record<number, string[]> = {
  // Week 1 — Presenza iniziale (Eccomi, Nazaret, presenza)
  1:  ['decidere', 'mattino', 'cambiamento'],         // L'Annunciazione
  2:  ['decidere', 'cambiamento'],                    // Il sogno di Giuseppe
  3:  ['mattino', 'ringraziare'],                     // La Nascita
  4:  ['ringraziare', 'dolore'],                      // Maria custodisce
  5:  ['sera', 'ringraziare'],                        // Come un bimbo svezzato
  6:  ['fretta', 'sera'],                             // Fermatevi e sappiate
  7:  ['ringraziare'],                                // Integrazione W1

  // Week 2 — Identita', radici
  8:  ['solo', 'fiducia', 'dubbi'],                   // Conosciuto da sempre (Sal 139)
  9:  ['decidere', 'dubbi', 'fretta'],                // Confida, non appoggiarti
  10: ['fretta', 'stanco'],                           // Nella calma sara' la vostra forza
  11: ['ringraziare'],                                // Simeone
  12: ['fiducia', 'dubbi', 'mattino'],                // Il Battesimo
  13: ['paura', 'solo', 'dolore'],                    // Il Signore e' il mio pastore (Sal 23)
  14: ['ringraziare'],                                // Integrazione W2

  // Week 3 — Silenzio di Nazaret
  15: ['dubbi', 'ringraziare'],                       // Gesu' al Tempio a 12 anni
  16: ['fretta', 'sera'],                             // Elia e la voce sottile
  17: ['decidere', 'dubbi'],                          // Ascolta, figlio mio
  18: ['sera', 'stanco'],                             // Solo in Dio riposa l'anima mia
  19: ['dolore', 'cambiamento'],                      // C'e' un tempo per ogni cosa
  20: ['stanco', 'fiducia'],                          // Quelli che sperano
  21: ['fretta'],                                     // Integrazione W3 (Dove sto correndo)

  // Week 4 — Silenzio di Nazaret cont.
  22: ['dubbi', 'fretta'],                            // Non affannatevi
  23: ['sera', 'ringraziare'],                        // Insegnaci a contare i giorni
  24: ['decidere', 'cambiamento'],                    // Dio dirige i tuoi passi
  25: ['paura', 'sera'],                              // Il Signore e' mia luce (Sal 27)
  26: ['stanco', 'dolore'],                           // Venite a me voi affaticati
  27: ['sera', 'fretta'],                             // Sta' in silenzio davanti al Signore
  28: ['ringraziare'],                                // Integrazione W4
};

/**
 * Ritorna i tag suggeriti per un passo (max 3).
 * Se il passo non e' in mapping, ritorna [].
 */
export function suggestTagsForEpisode(episodeNumber: number): string[] {
  return SUGGESTED_TAGS_BY_EPISODE[episodeNumber] || [];
}

/**
 * Filtra una lista di tag tenendo solo quelli validi (presenti in PASSAGE_TAGS).
 * Usata per validare input dal client/DB.
 */
export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === 'string')
    .filter(t => t in TAG_MAP);
}
