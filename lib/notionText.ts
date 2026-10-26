// Pulizia e normalizzazione dei testi che arrivano da Notion.
//
// Unico punto di verità per:
//  - decodifica degli escape unicode letterali ("pu00f2" → "può") prodotti da
//    copia-incolla errati, SENZA toccare parole italiane vere
//  - rimozione di tag HTML escapati ("\<i\>") e backslash di escape markdown ("1\.")
//  - normalizzazione degli a capo scritti come <br>, <br/>, <br />
//  - parsing di liste (pratiche, inviti) con marker numerici o emoji keycap
//
// Usato sia lato server (API routes) sia lato client (pagine).

/**
 * Decodifica sequenze unicode letterali senza backslash (es. "u00e0" → "à").
 *
 * ATTENZIONE: la vecchia regex `/u([0-9a-f]{4})/` corrompeva parole vere come
 * "succederà" ("ucced" è esadecimale!) o "audace". Qui accettiamo solo i blocchi
 * che un copia-incolla può realmente produrre in un testo italiano:
 *   - U+00A0..U+00FF  (lettere accentate, «, », ecc.)
 *   - U+2000..U+20FF  (virgolette tipografiche, trattini, puntini)
 * Entrambi iniziano con una cifra, che non compare mai dentro una parola.
 */
export function decodeUnicodeEscapes(text: string): string {
  return text.replace(
    /\\?u(00[a-fA-F][0-9a-fA-F]|20[0-9a-fA-F]{2})/g,
    (_, hex) => String.fromCharCode(parseInt(hex, 16))
  );
}

/** Rimuove tag HTML escapati letterali: "\<i\>", "\</em\>". */
export function stripEscapedHtmlTags(text: string): string {
  return text.replace(/\\<\/?([a-zA-Z]{1,8})\\>/g, '');
}

/** Rimuove i backslash di escape markdown davanti a punteggiatura: "1\." → "1." */
export function stripMarkdownEscapes(text: string): string {
  return text.replace(/\\([.\-*_#>()[\]!])/g, '$1');
}

/** Rimuove caratteri invisibili che rompono l'impaginazione (zero-width, BOM). */
export function stripInvisible(text: string): string {
  return text.replace(/[​-‍﻿]/g, '');
}

/** Pulizia completa di una stringa Notion prima di mostrarla. */
export function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return stripInvisible(stripMarkdownEscapes(stripEscapedHtmlTags(decodeUnicodeEscapes(text))));
}

/** Converte ogni variante di <br> in "\n" e normalizza i ritorni a capo. */
export function normalizeBreaks(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n');
}

/** Pulizia + normalizzazione a capo: il default per i campi rich_text. */
export function tidy(text: string | null | undefined): string {
  return normalizeBreaks(cleanText(text)).trim();
}

/**
 * Rimuove il marker iniziale di una voce di lista:
 * "1. ", "1) ", "1️⃣ ", "- ", "• ", "* ", "› ".
 */
export function stripListMarker(line: string): string {
  return line
    .replace(/^\s*(?:[0-9]️?⃣|\d{1,2}[.)]|[-*•›·])\s*/u, '')
    .trim();
}

/** Splitta un campo multi-riga (pratiche, inviti) in voci pulite. */
export function splitList(text: string | null | undefined): string[] {
  return tidy(text)
    .split(/\n+/)
    .map(stripListMarker)
    .filter(l => l.length > 0);
}

/** True se la riga è solo un separatore ("---", "—", "***"). */
export function isSeparatorLine(text: string): boolean {
  const t = text.trim();
  return t.length > 0 && /^[-—–*_·.\s]+$/.test(t) && t.length <= 12;
}

/** Legge il primo plain_text di una property Notion rich_text/title e lo pulisce. */
export function propText(prop: any): string {
  const arr = prop?.rich_text || prop?.title || prop?.text || [];
  const raw = Array.isArray(arr) ? arr.map((t: any) => t?.plain_text || '').join('') : '';
  return tidy(raw);
}
