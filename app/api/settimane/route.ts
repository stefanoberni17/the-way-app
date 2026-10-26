import { NextResponse } from 'next/server';
import { propText } from '@/lib/notionText';

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
      settimana: propText(page.properties?.Settimana),
      titolo: propText(page.properties?.Titolo),
      tema: propText(page.properties?.['Tema principale']),
      mantra: propText(page.properties?.Mantra),
      versettoGuida: propText(page.properties?.['Versetto guida']),
      pratiche: propText(page.properties?.Pratiche),
      fase: page.properties?.Fase?.select?.name || '',
      stato: page.properties?.Stato?.select?.name || 'Da fare',
    }));

    return NextResponse.json({ settimane });

  } catch (error: any) {
    console.error('❌ Errore API settimane:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
