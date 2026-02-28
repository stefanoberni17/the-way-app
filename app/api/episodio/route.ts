import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWeekFromEpisode, isEpisodeInMVP } from '@/lib/episodeMapping';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

// Ultimo episodio di ogni coppia di settimane (3 ep per coppia)
const WEEK_PAIR_LAST_EPISODES: Record<number, number> = {
  1: 4,   // Week 1-2 → passa a Week 3 (4 passi disponibili)
  3: 7,   // Week 3-4 → passa a Week 5 (placeholder)
  5: 9,
  7: 12,
  9: 15,
  11: 18,
  13: 21,
  15: 24,
  17: 27,
  19: 30,
};

async function fetchAllBlocks(pageId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | null = null;

  do {
    const url: string = cursor
      ? `https://api.notion.com/v1/blocks/${pageId}/children?start_cursor=${cursor}`
      : `https://api.notion.com/v1/blocks/${pageId}/children`;

    const res = await fetch(url, { headers: NOTION_HEADERS });
    const data = await res.json();
    blocks.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return blocks;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const episodeNumber = parseInt(searchParams.get('number') || '1');
  const userId = searchParams.get('userId');
  const extended = searchParams.get('extended') === 'true';

  try {
    if (!isEpisodeInMVP(episodeNumber)) {
      return NextResponse.json({ error: 'Episodio fuori scope MVP', locked: true }, { status: 400 });
    }

    // Controlla se l'episodio precedente è completato
    if (userId && episodeNumber > 1) {
      const { data: prev } = await supabaseAdmin
        .from('user_episode_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('episode_number', episodeNumber - 1)
        .single();

      if (!prev?.completed) {
        return NextResponse.json({
          locked: true,
          message: `Completa il passo ${episodeNumber - 1} per sbloccare questo`,
          episodeNumber,
        });
      }
    }

    // Controlla se già completato
    let isCompleted = false;
    if (userId) {
      const { data: curr } = await supabaseAdmin
        .from('user_episode_progress')
        .select('completed')
        .eq('user_id', userId)
        .eq('episode_number', episodeNumber)
        .single();
      isCompleted = curr?.completed || false;
    }

    // Query Notion DB per Numero (fetch diretto)
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_EPISODI}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: {
            property: 'Numero',
            number: { equals: episodeNumber },
          },
        }),
      }
    );

    const queryData = await queryRes.json();

    if (!queryData.results || queryData.results.length === 0) {
      return NextResponse.json(
        { error: 'Passo non trovato in Notion', episodeNumber },
        { status: 404 }
      );
    }

    const page = queryData.results[0];
    const pageId = page.id;
    const properties = page.properties;

    const getText = (prop: any) =>
      prop?.rich_text?.[0]?.plain_text || prop?.text?.[0]?.plain_text || '';

    const getTitle = (prop: any) =>
      prop?.title?.[0]?.plain_text || '';

    let blocks: any[] = [];
    if (extended) {
      blocks = await fetchAllBlocks(pageId);
    }

    return NextResponse.json({
      episode: {
        number: episodeNumber,
        title: getTitle(properties['Passo biblico']),
        riferimento: getText(properties['Riferimento']),
        invitoApertura: getText(properties['Invito apertura']),
        miniLesson: getText(properties['Mini-lezione breve']),
        guidaOsservazione: getText(properties['Guida osservazione']),
        reflectionQuestion: getText(properties['Domanda riflessiva']),
        versettoPortare: getText(properties['Versetto da portare']),
        mainTheme: getText(properties['Tema principale']),
        concepts: getText(properties['Concetti collegati']),
        salmoSupport: getText(properties['Salmo/Proverbio di supporto']),
        durata: properties['Durata stimata']?.number || null,
        weekNumber: getWeekFromEpisode(episodeNumber),
        locked: false,
        completed: isCompleted,
      },
      blocks,
      locked: false,
    });

  } catch (error: any) {
    console.error('Errore API episodio:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { episodeNumber, userId } = await request.json();

    if (!userId || !episodeNumber) {
      return NextResponse.json(
        { error: 'userId e episodeNumber richiesti' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_episode_progress')
      .upsert({
        user_id: userId,
        episode_number: episodeNumber,
        week_number: getWeekFromEpisode(episodeNumber),
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,episode_number' })
      .select()
      .single();

    if (error) throw error;

    // Auto-update current_week se l'episodio è l'ultimo della coppia
    for (const [weekPair, lastEp] of Object.entries(WEEK_PAIR_LAST_EPISODES)) {
      if (episodeNumber === lastEp) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('current_week')
          .eq('user_id', userId)
          .single();

        const currentWeek = profile?.current_week || 1;
        const completedWeekPair = parseInt(weekPair);

        if (currentWeek <= completedWeekPair + 1) {
          const nextWeek = completedWeekPair + 2;
          await supabaseAdmin
            .from('profiles')
            .update({ current_week: nextWeek })
            .eq('user_id', userId);
        }
        break;
      }
    }

    return NextResponse.json({
      success: true,
      progress: data,
      nextEpisode: episodeNumber + 1,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}
