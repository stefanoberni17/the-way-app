// Fetch della "frase del giorno" dal DB Notion "Frasi del giorno - The Way".
// Schema atteso (vedi piano):
//   - "Frase" (title): la frase / versetto
//   - "Riferimento" (rich_text): es. "Matteo 5:3"
//   - "Attiva" (checkbox)

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

export interface DailyVerse {
  text: string;
  reference: string;
}

const getTitle = (prop: any): string => prop?.title?.[0]?.plain_text || '';
const getText = (prop: any): string => prop?.rich_text?.[0]?.plain_text || '';
const getCheckbox = (prop: any): boolean => Boolean(prop?.checkbox);

/**
 * Pesca una frase casuale tra quelle con "Attiva" = true.
 * Ritorna `null` se il DB non è configurato o non ha frasi attive.
 */
export async function getRandomDailyVerse(): Promise<DailyVerse | null> {
  const dbId = process.env.NOTION_DATABASE_FRASI;
  if (!dbId) {
    console.warn('NOTION_DATABASE_FRASI non configurato');
    return null;
  }

  try {
    // Notion API permette filtri lato server: prendiamo solo le attive
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: { property: 'Attiva', checkbox: { equals: true } },
        page_size: 100,
      }),
    });

    if (!res.ok) {
      console.error('Notion daily verse fetch failed:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const results = (data.results || []) as any[];
    if (results.length === 0) return null;

    const pick = results[Math.floor(Math.random() * results.length)];
    const props = pick.properties || {};

    const text = getTitle(props['Frase']);
    const reference = getText(props['Riferimento']);

    if (!text) return null;
    return { text, reference };
  } catch (err) {
    console.error('Errore fetch frase del giorno:', err);
    return null;
  }
}
