const NOTION_TOKEN = process.env.NOTION_TOKEN;
const databaseId = '2b1655f726c780899607f157d76a6edf';

async function fetchEpisodes() {
  try {
    console.log('📺 Fetching episodi da Notion...\n');
    
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ property: 'Numero', direction: 'ascending' }],
        filter: {
          and: [
            { property: 'Numero', number: { greater_than_or_equal_to: 1 } },
            { property: 'Numero', number: { less_than_or_equal_to: 19 } },
          ],
        },
      }),
    });

    const data = await response.json();
    
    console.log(`✅ Trovati ${data.results.length} episodi\n`);

    const mapping = {};
    const episodes = [];

    data.results.forEach((page) => {
      const numero = page.properties.Numero?.number || 0;
      const titolo = page.properties['Titolo episodio']?.rich_text?.[0]?.plain_text || 
                     page.properties.Episodio?.title?.[0]?.plain_text || '';
      const pageId = page.id;

      mapping[numero] = pageId;
      episodes.push({ numero, titolo, pageId });
    });

    console.log('📋 EPISODE_MAPPING:\n');
    console.log('export const EPISODE_MAPPING: Record<number, string> = {');
    for (let i = 1; i <= 19; i++) {
      if (mapping[i]) {
        const ep = episodes.find(e => e.numero === i);
        console.log(`  ${i}: '${mapping[i]}', // ${ep?.titolo || 'Episodio ' + i}`);
      } else {
        console.log(`  ${i}: '', // TODO: Episodio ${i} non trovato`);
      }
    }
    console.log('};');

  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

fetchEpisodes();
