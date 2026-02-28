import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_SETTIMANE}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [{ property: 'Numero', direction: 'ascending' }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const settimane = (data.results || []).map((page: any) => ({
      id: page.id,
      numero: page.properties?.Numero?.number || 0,
      settimana: page.properties?.Settimana?.title?.[0]?.plain_text || '',
      titolo: page.properties?.Titolo?.rich_text?.[0]?.plain_text || '',
      tema: page.properties?.['Tema principale']?.rich_text?.[0]?.plain_text || '',
      mantra: page.properties?.Mantra?.rich_text?.[0]?.plain_text || '',
      versettosGuida: page.properties?.['Versetto guida']?.rich_text?.[0]?.plain_text || '',
      pratiche: page.properties?.Pratiche?.rich_text?.[0]?.plain_text || '',
      fase: page.properties?.Fase?.select?.name || '',
      stato: page.properties?.Stato?.select?.name || 'Da fare',
    }));

    return NextResponse.json({ settimane });

  } catch (error: any) {
    console.error('❌ Errore API settimane:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
