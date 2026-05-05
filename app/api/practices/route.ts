import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';
import { getMondayRome } from '@/lib/weekStart';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type DayKey = 'day1' | 'day2' | 'day3' | 'day4' | 'day5' | 'day6' | 'day7';

const EMPTY_DAYS: Record<DayKey, boolean> = {
  day1: false, day2: false, day3: false, day4: false, day5: false, day6: false, day7: false,
};

// GET - Carica pratiche della settimana, azzerando completed_days
// se la settimana di calendario (lunedi' Europe/Rome) e' cambiata.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authUserId = await getAuthUser(request);
    const userId = authUserId || searchParams.get('userId');
    const weekNumber = parseInt(searchParams.get('weekNumber') || '1');

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const monday = getMondayRome();

    const { data, error } = await supabaseAdmin
      .from('weekly_practices')
      .select('*')
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .order('practice_number', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      const practices = await Promise.all([1, 2, 3].map(async (num) => {
        const { data: newPractice } = await supabaseAdmin
          .from('weekly_practices')
          .insert({
            user_id: userId,
            week_number: weekNumber,
            practice_number: num,
            week_start_date: monday,
            completed_days: EMPTY_DAYS,
          })
          .select()
          .single();
        return newPractice;
      }));

      return NextResponse.json({ practices });
    }

    // Reset al cambio di lunedi': se la riga ha un week_start_date diverso (o null),
    // azzera completed_days e aggiorna la data.
    const refreshed = await Promise.all(data.map(async (row) => {
      if (row.week_start_date === monday) return row;
      const { data: updated } = await supabaseAdmin
        .from('weekly_practices')
        .update({
          completed_days: EMPTY_DAYS,
          week_start_date: monday,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('week_number', weekNumber)
        .eq('practice_number', row.practice_number)
        .select()
        .single();
      return updated || row;
    }));

    return NextResponse.json({ practices: refreshed });
  } catch (error: any) {
    console.error('Errore GET practices:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Aggiorna completamento giorno pratica
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authUserId = await getAuthUser(request);
    const userId = authUserId || body.userId;
    const { weekNumber, practiceNumber, day, completed } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!weekNumber || !practiceNumber || !day) {
      return NextResponse.json(
        { error: 'weekNumber, practiceNumber e day richiesti' },
        { status: 400 }
      );
    }

    const monday = getMondayRome();

    const { data: existing } = await supabaseAdmin
      .from('weekly_practices')
      .select('completed_days, week_start_date')
      .eq('user_id', userId)
      .eq('week_number', weekNumber)
      .eq('practice_number', practiceNumber)
      .single();

    // Se la riga esiste ma e' di una settimana di calendario passata, riparti da vuoto.
    const isFreshWeek = !existing || existing.week_start_date !== monday;
    const baseDays: Record<DayKey, boolean> = isFreshWeek
      ? { ...EMPTY_DAYS }
      : { ...EMPTY_DAYS, ...(existing.completed_days || {}) };

    baseDays[day as DayKey] = completed;

    const { data, error } = await supabaseAdmin
      .from('weekly_practices')
      .upsert({
        user_id: userId,
        week_number: weekNumber,
        practice_number: practiceNumber,
        completed_days: baseDays,
        week_start_date: monday,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,week_number,practice_number' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, practice: data });
  } catch (error: any) {
    console.error('Errore POST practices:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}
