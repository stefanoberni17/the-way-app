import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';
import { getTodayRome } from '@/lib/weekStart';
import { getNotionEpisodeRef, getWeekFromEpisode } from '@/lib/episodeMapping';
import { pickInvitation, parseNotionInvitations } from '@/lib/dailyInvitation';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

// Determina il "passo guida del giorno" = ultimo passo completato dall'utente.
// Se nessuno è completato, ritorna il primo passo della week corrente.
async function getGuidingEpisode(userId: string): Promise<{ episodeNumber: number; weekNumber: number }> {
  const { data: completed } = await supabaseAdmin
    .from('user_episode_progress')
    .select('episode_number')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('episode_number', { ascending: false })
    .limit(1);

  if (completed && completed.length > 0) {
    const ep = completed[0].episode_number;
    return { episodeNumber: ep, weekNumber: getWeekFromEpisode(ep) };
  }

  // Fallback: passo 1 della week corrente dell'utente
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('current_week')
    .eq('user_id', userId)
    .single();

  const week = profile?.current_week || 1;
  const firstEp = (week - 1) * 7 + 1;
  return { episodeNumber: firstEp, weekNumber: week };
}

// Recupera il campo Notion "Inviti del giorno" del passo (best-effort).
// Se Notion non risponde o il campo non esiste, ritorna [].
async function fetchNotionInvitations(episodeNumber: number): Promise<string[]> {
  try {
    const { settimana, localNum } = getNotionEpisodeRef(episodeNumber);

    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_EPISODI}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Numero', number: { equals: localNum } },
              { property: 'Settimana', rich_text: { equals: settimana } },
            ],
          },
          page_size: 1,
        }),
      }
    );

    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    const props = data.results[0].properties;
    const raw =
      props['Inviti del giorno']?.rich_text?.[0]?.plain_text ||
      props['Inviti del giorno']?.text?.[0]?.plain_text ||
      '';

    return parseNotionInvitations(raw);
  } catch {
    return [];
  }
}

// GET → stato dell'invito di oggi. Lazy upsert se non esiste.
export async function GET(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const userId = authUserId || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const today = getTodayRome();

    // Riga esistente?
    const { data: existing } = await supabaseAdmin
      .from('daily_checkins')
      .select('checkin_date, invitation_text, invitation_seen_at, invitation_done_at, week_number, episode_number')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .single();

    if (existing && existing.invitation_text) {
      return NextResponse.json({
        date: existing.checkin_date,
        invitation_text: existing.invitation_text,
        week_number: existing.week_number,
        episode_number: existing.episode_number,
        invitation_seen_at: existing.invitation_seen_at,
        invitation_done_at: existing.invitation_done_at,
      });
    }

    // Determina passo guida + invito
    const { episodeNumber, weekNumber } = await getGuidingEpisode(userId);
    const notionInvitations = await fetchNotionInvitations(episodeNumber);
    const pick = pickInvitation(userId, weekNumber, notionInvitations, today);

    // Upsert riga del giorno con l'invito calcolato
    const { data: upserted } = await supabaseAdmin
      .from('daily_checkins')
      .upsert(
        {
          user_id: userId,
          checkin_date: today,
          week_number: weekNumber,
          episode_number: episodeNumber,
          invitation_text: pick.text,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,checkin_date' }
      )
      .select('checkin_date, invitation_text, invitation_seen_at, invitation_done_at, week_number, episode_number')
      .single();

    return NextResponse.json({
      date: upserted?.checkin_date || today,
      invitation_text: upserted?.invitation_text || pick.text,
      week_number: upserted?.week_number || weekNumber,
      episode_number: upserted?.episode_number || episodeNumber,
      invitation_seen_at: upserted?.invitation_seen_at || null,
      invitation_done_at: upserted?.invitation_done_at || null,
      source: pick.source,
    });
  } catch (error: any) {
    console.error('Errore GET daily-invitation:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

// POST { action: 'seen' | 'done' } → aggiorna timestamp
export async function POST(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const body = await request.json();
    const userId = authUserId || body.userId;
    const action = body.action;

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (action !== 'seen' && action !== 'done') {
      return NextResponse.json(
        { error: 'action deve essere "seen" o "done"' },
        { status: 400 }
      );
    }

    const today = getTodayRome();
    const now = new Date().toISOString();

    const patch: Record<string, string> =
      action === 'seen'
        ? { invitation_seen_at: now }
        : { invitation_done_at: now, invitation_seen_at: now };

    const { data, error } = await supabaseAdmin
      .from('daily_checkins')
      .update({ ...patch, updated_at: now })
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .select('checkin_date, invitation_seen_at, invitation_done_at')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Errore POST daily-invitation:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}
