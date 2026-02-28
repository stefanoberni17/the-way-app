import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { createClient } from '@supabase/supabase-js';
import { getWeekFromEpisode, isEpisodeInMVP } from '@/lib/episodeMapping';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Ultimo episodio di ogni coppia di settimane (3 ep per coppia)
const WEEK_PAIR_LAST_EPISODES: Record<number, number> = {
  1: 3,   // Week 1-2 finisce con ep 3 → passa a Week 3
  3: 6,   // Week 3-4 finisce con ep 6 → passa a Week 5
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
  let cursor: string | undefined = undefined;

  do {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
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

    // Query Notion per Numero (invece di pageId statico)
    const queryResponse = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_EPISODI!,
      filter: {
        property: 'Numero',
        number: { equals: episodeNumber },
      },
    });

    if (!queryResponse.results || queryResponse.results.length === 0) {
      return NextResponse.json({ error: 'Passo non trovato in Notion', episodeNumber }, { status: 404 });
    }

    const page = queryResponse.results[0] as any;
    const pageId = page.id;
    const properties = page.properties;

    let blocks: any[] = [];
    if (extended) {
      blocks = await fetchAllBlocks(pageId);
    }

    return NextResponse.json({
      episode: {
        number: episodeNumber,
        title: properties['Passo biblico']?.title?.[0]?.plain_text || `Passo ${episodeNumber}`,
        riferimento: properties['Riferimento']?.rich_text?.[0]?.plain_text || '',
        invitoApertura: properties['Invito apertura']?.rich_text?.[0]?.plain_text || '',
        miniLesson: properties['Mini-lezione breve']?.rich_text?.[0]?.plain_text || '',
        guidaOsservazione: properties['Guida osservazione']?.rich_text?.[0]?.plain_text || '',
        reflectionQuestion: properties['Domanda riflessiva']?.rich_text?.[0]?.plain_text || '',
        versettoPortare: properties['Versetto da portare']?.rich_text?.[0]?.plain_text || '',
        mainTheme: properties['Tema principale']?.rich_text?.[0]?.plain_text || '',
        concepts: properties['Concetti collegati']?.rich_text?.[0]?.plain_text || '',
        salmoSupport: properties['Salmo/Proverbio di supporto']?.rich_text?.[0]?.plain_text || '',
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
    return NextResponse.json({ error: 'Errore nel caricamento', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { episodeNumber, userId } = await request.json();

    if (!userId || !episodeNumber) {
      return NextResponse.json({ error: 'userId e episodeNumber richiesti' }, { status: 400 });
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

    // Auto-update current_week se necessario
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
          console.log(`✅ Week auto-updated: ${currentWeek} → ${nextWeek}`);
        }
        break;
      }
    }

    const maxEpisode = Math.max(...Object.keys(WEEK_PAIR_LAST_EPISODES).map(Number)) + 1;

    return NextResponse.json({
      success: true,
      progress: data,
      nextEpisode: episodeNumber + 1,
      unlockedNext: episodeNumber < maxEpisode,
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Errore nel salvataggio', details: error.message }, { status: 500 });
  }
}
