// Metadata statici dei passi MVP (Week 1-4 = passi 1-28).
// Usati per render veloce (es. pagina /custoditi) senza chiamare Notion.
// Se serve aggiornare: i contenuti vivi (lezione, versetto) restano su Notion;
// qui solo titolo + riferimento + settimana per visualizzazione in lista.

export interface EpisodeMeta {
  number: number;
  title: string;
  reference: string;
  weekNumber: number;
  weekName: string;
}

const W: Record<number, string> = {
  1: 'La voce nel deserto',
  2: 'La voce nel deserto',
  3: 'Il silenzio di Nazaret',
  4: 'Il silenzio di Nazaret',
  5: 'La voce che chiama',
  6: 'La voce che chiama',
};

const meta = (n: number, title: string, reference: string, week: number): EpisodeMeta => ({
  number: n,
  title,
  reference,
  weekNumber: week,
  weekName: W[week] || `Week ${week}`,
});

export const EPISODE_METADATA: Record<number, EpisodeMeta> = {
  // Week 1
  1:  meta(1,  "L'Annunciazione",                       'Luca 1:26-38', 1),
  2:  meta(2,  'Il sogno di Giuseppe',                  'Matteo 1:18-25', 1),
  3:  meta(3,  'La Nascita',                            'Luca 2:1-14', 1),
  4:  meta(4,  'Maria custodisce',                      'Luca 2:15-20', 1),
  5:  meta(5,  'Come un bimbo svezzato',                'Salmo 131', 1),
  6:  meta(6,  'Fermatevi e sappiate',                  'Salmo 46', 1),
  7:  meta(7,  'Integrazione W1 — Un momento, anche piccolo', 'Integrazione', 1),

  // Week 2
  8:  meta(8,  'Conosciuto da sempre',                  'Salmo 139', 2),
  9:  meta(9,  'Confida, non appoggiarti',              'Proverbi 3:5-6', 2),
  10: meta(10, 'Nella calma sarà la vostra forza',      'Isaia 30:15', 2),
  11: meta(11, 'Simeone',                               'Luca 2:22-35', 2),
  12: meta(12, 'Il Battesimo',                          'Matteo 3:1-17', 2),
  13: meta(13, 'Il Signore è il mio pastore',           'Salmo 23', 2),
  14: meta(14, 'Integrazione W2 — La frase che è restata', 'Integrazione', 2),

  // Week 3
  15: meta(15, 'Gesù al Tempio a 12 anni',              'Luca 2:39-52', 3),
  16: meta(16, 'Elia e la voce sottile',                '1 Re 19:11-13', 3),
  17: meta(17, 'Ascolta, figlio mio',                   'Proverbi 4:1-9', 3),
  18: meta(18, "Solo in Dio riposa l'anima mia",         'Salmo 62', 3),
  19: meta(19, "C'è un tempo per ogni cosa",            'Ecclesiaste 3:1-8', 3),
  20: meta(20, 'Quelli che sperano nel Signore',        'Isaia 40:28-31', 3),
  21: meta(21, 'Integrazione W3 — Dove sto correndo',   'Integrazione', 3),

  // Week 4
  22: meta(22, 'Non affannatevi',                       'Matteo 6:25-34', 4),
  23: meta(23, 'Insegnaci a contare i nostri giorni',   'Salmo 90:1-12', 4),
  24: meta(24, 'Dio dirige i tuoi passi',               'Proverbi 16:9', 4),
  25: meta(25, 'Il Signore è mia luce',                 'Salmo 27', 4),
  26: meta(26, 'Venite a me, voi affaticati',           'Matteo 11:28-30', 4),
  27: meta(27, "Sta' in silenzio davanti al Signore",   'Salmo 37:7-9', 4),
  28: meta(28, 'Integrazione W4 — La fine del primo silenzio', 'Integrazione', 4),
};

export function getEpisodeMeta(n: number): EpisodeMeta | null {
  return EPISODE_METADATA[n] || null;
}
