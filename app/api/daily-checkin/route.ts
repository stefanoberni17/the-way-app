import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';
import { getTodayRome } from '@/lib/weekStart';
import { checkSafetyKeywords } from '@/lib/maestro-ai';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET ?date=YYYY-MM-DD (default oggi) → check-in del giorno (o null)
export async function GET(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const userId = authUserId || searchParams.get('userId');
    const date = searchParams.get('date') || getTodayRome();

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('daily_checkins')
      .select('checkin_date, q_presence, q_connection, note, checkin_submitted_at, flagged')
      .eq('user_id', userId)
      .eq('checkin_date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ checkin: data || null });
  } catch (error: any) {
    console.error('Errore GET daily-checkin:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

// POST { q_presence, q_connection, note? } → upsert per oggi
export async function POST(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const body = await request.json();
    const userId = authUserId || body.userId;
    const { q_presence, q_connection, note } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const validRange = (v: any) =>
      typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 10;

    if (!validRange(q_presence) || !validRange(q_connection)) {
      return NextResponse.json(
        { error: 'q_presence e q_connection devono essere interi 1-10' },
        { status: 400 }
      );
    }

    const cleanNote = typeof note === 'string' ? note.trim() : '';
    if (cleanNote.length > 500) {
      return NextResponse.json(
        { error: 'Nota troppo lunga (max 500 caratteri)' },
        { status: 400 }
      );
    }

    const flagged = cleanNote ? checkSafetyKeywords(cleanNote) : false;
    const today = getTodayRome();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('daily_checkins')
      .upsert(
        {
          user_id: userId,
          checkin_date: today,
          q_presence,
          q_connection,
          note: cleanNote || null,
          flagged,
          checkin_submitted_at: now,
          updated_at: now,
        },
        { onConflict: 'user_id,checkin_date' }
      )
      .select('checkin_date, q_presence, q_connection, note, checkin_submitted_at, flagged')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      checkin: data,
      showSafetyMessage: flagged,
    });
  } catch (error: any) {
    console.error('Errore POST daily-checkin:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}
