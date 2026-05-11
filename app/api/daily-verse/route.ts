import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function todayISO(): string {
  // Data odierna in UTC (coerente col cron che gira a 06:30 UTC)
  return new Date().toISOString().split('T')[0];
}

/**
 * GET /api/daily-verse
 *
 * Ritorna il versetto del giorno se disponibile e non ancora letto dall'utente.
 * { verse: { text, reference, delivery_date } } oppure { verse: null }
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthUser(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const today = todayISO();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('last_daily_verse_seen')
      .eq('user_id', userId)
      .single();

    // Se l'utente ha già visto il versetto di oggi → niente da mostrare
    if (profile?.last_daily_verse_seen && profile.last_daily_verse_seen >= today) {
      return NextResponse.json({ verse: null });
    }

    const { data: verse } = await supabaseAdmin
      .from('daily_verses')
      .select('delivery_date, text, reference')
      .eq('delivery_date', today)
      .maybeSingle();

    if (!verse) {
      return NextResponse.json({ verse: null });
    }

    return NextResponse.json({ verse });
  } catch (err: any) {
    console.error('Errore GET /api/daily-verse:', err);
    return NextResponse.json({ error: 'Errore caricamento' }, { status: 500 });
  }
}

/**
 * POST /api/daily-verse
 *
 * Marca il versetto di oggi come "letto" per l'utente corrente.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthUser(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  try {
    const today = todayISO();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ last_daily_verse_seen: today })
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Errore POST /api/daily-verse:', err);
    return NextResponse.json({ error: 'Errore salvataggio' }, { status: 500 });
  }
}
