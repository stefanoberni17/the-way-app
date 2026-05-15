// Modulo "Vita Quotidiana" — selezione dell'invito del giorno.
//
// Sorgente primaria: campo Notion "Inviti del giorno" del passo guida
// (= ultimo passo completato, fallback passo 1 della week corrente).
// Fallback: catalogo hardcoded per settimana — usato quando il campo
// Notion non e' valorizzato (utenti pre-migrazione o passi non ancora popolati).
//
// La selezione e' DETERMINISTICA per giorno: stesso invito per tutto il
// giorno, cambia il giorno dopo. Niente random per stabilita' del messaggio.

// ─────────────────────────────────────────────────────────────────────
// Fallback hardcoded per settimana (5-7 frasi ciascuna).
// Tono The Way: imperativo gentile, max 12-15 parole.
// ─────────────────────────────────────────────────────────────────────
export const WEEK_INVITATION_FALLBACK: Record<number, string[]> = {
  1: [
    'Oggi nota dove ti rifugi nel rumore.',
    'Quando ti senti agitato, fermati un istante e respira.',
    'Cerca tre momenti di silenzio nella giornata, anche brevissimi.',
    'Oggi prova a non riempire ogni vuoto con uno schermo.',
    'Lascia che una pausa sia abitata, non riempita.',
    'Quando senti il bisogno di scappare, resta un respiro in piu\'.',
    'Oggi cerca la voce che parla quando le altre tacciono.',
  ],
  2: [
    'Oggi accogli un momento che non avresti scelto.',
    'Quando qualcosa ti irrita, chiediti cosa sta chiedendo di essere visto.',
    'Lascia che il deserto della giornata diventi spazio, non vuoto.',
    'Prova ad ascoltare un silenzio prima di riempirlo.',
    'Oggi nota dove hai paura di sentire la tua voce vera.',
    'Quando senti la tentazione di distrarti, resta dove sei.',
    'Cerca una solitudine buona, anche breve, oggi.',
  ],
  3: [
    'Oggi fai una cosa ordinaria con presenza piena.',
    'Cerca la grazia nascosta nei gesti ripetitivi.',
    'Quando lavi i piatti, lava i piatti — niente altro.',
    'Oggi nota cosa accade quando smetti di voler essere altrove.',
    'Lascia che una piccola cosa sia abbastanza, oggi.',
    'Prova a non giudicare la giornata: solo viverla.',
    'Oggi custodisci un momento, non riempirlo.',
  ],
  4: [
    'Oggi resta nel tuo Nazaret — il luogo che non hai scelto.',
    'Quando vuoi essere altrove, chiediti chi parla.',
    'Cerca la santita\' nelle ore feriali della tua giornata.',
    'Oggi nota cosa significa per te "essere a casa".',
    'Lascia che la routine ti insegni qualcosa, oggi.',
    'Prova a non aspettare un momento speciale per essere presente.',
    'Oggi onora il piccolo, il nascosto, il quotidiano.',
  ],
  5: [
    'Oggi ascolta cosa ti chiama, senza decidere ancora cosa fare.',
    'Cerca la voce sotto le voci — quella che non urla.',
    'Quando senti un richiamo interiore, fermati prima di rispondere.',
    'Oggi distingui tra rumore, opinione e chiamata.',
    'Lascia che una domanda riposi in te per un giorno intero.',
    'Prova ad ascoltare senza voler subito capire.',
    'Oggi cerca cosa ti commuove — li\' c\'e\' una traccia.',
  ],
  6: [
    'Oggi dai un primo piccolo passo nella direzione che senti.',
    'Quando la voce torna, non rinviare di un altro giorno.',
    'Cerca un gesto concreto che onori cio\' che hai ascoltato.',
    'Oggi nota dove dici no per paura e non per discernimento.',
    'Lascia che il tuo si\' sia preceduto da un silenzio.',
    'Prova a fidarti di un richiamo anche senza capirlo del tutto.',
    'Oggi rispondi a una sola voce — quella piu\' vera.',
  ],
};

// Hash semplice e stabile di una stringa (somma codepoints).
function hashUserId(userId: string): number {
  let h = 0;
  for (let i = 0; i < userId.length; i++) h += userId.charCodeAt(i);
  return h;
}

// Numero di giorni trascorsi dalla data di "epoca" (1 gen 2024) — usato
// come componente deterministica della rotazione. Indipendente dal lunedi'.
function daysSinceEpoch(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const ms = Date.UTC(y, m - 1, d) - Date.UTC(2024, 0, 1);
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export interface InvitationPick {
  text: string;
  source: 'notion' | 'fallback';
}

/**
 * Seleziona l'invito del giorno in modo deterministico.
 *
 * @param userId         user id (per variare la rotazione tra utenti)
 * @param weekNumber     settimana corrente (1-6 in Beta)
 * @param notionInvitations  array di inviti dal campo Notion (puo' essere vuoto)
 * @param dateStr        data del giorno in formato YYYY-MM-DD
 */
export function pickInvitation(
  userId: string,
  weekNumber: number,
  notionInvitations: string[],
  dateStr: string
): InvitationPick {
  const cleanNotion = notionInvitations
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const seed = hashUserId(userId) + daysSinceEpoch(dateStr);

  if (cleanNotion.length > 0) {
    const idx = seed % cleanNotion.length;
    return { text: cleanNotion[idx], source: 'notion' };
  }

  const fallback = WEEK_INVITATION_FALLBACK[weekNumber] || WEEK_INVITATION_FALLBACK[1];
  const idx = seed % fallback.length;
  return { text: fallback[idx], source: 'fallback' };
}

/**
 * Parsa il campo Notion "Inviti del giorno" (testo libero con separatori
 * comuni) in un array di frasi. Accetta \n, <br>, righe numerate (1. 2. 3.)
 * e righe puntate (- * •).
 */
export function parseNotionInvitations(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/\n+/)
    .map(line => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
    .filter(line => line.length > 0);
}
