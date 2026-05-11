import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRandomDailyVerse } from '@/lib/dailyVerse';
import { broadcastPush } from '@/lib/pushNotification';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * GET /api/cron/daily-verse
 * Schedulato da Vercel Cron (vedi vercel.json) ogni mattina.
 *
 * 1. Pesca una frase casuale dal DB Notion "Frasi del giorno"
 * 2. La salva in `daily_verses` (upsert su delivery_date di oggi) per
 *    poterla mostrare in-app nella home
 * 3. La invia come push notification a tutte le subscription registrate
 *
 * Sicurezza: protetto da CRON_SECRET (Authorization: Bearer <secret>).
 * Vercel Cron invia automaticamente questo header se la variabile è settata.
 */
export async function GET(request: NextRequest) {
  // Verifica autorizzazione
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }

  try {
    const verse = await getRandomDailyVerse();
    if (!verse) {
      return NextResponse.json(
        { error: 'Nessuna frase disponibile (DB vuoto o non configurato)' },
        { status: 200 }
      );
    }

    // Salva in DB per il display in-app (idempotente: upsert per data di oggi)
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC
    const { error: upsertError } = await supabaseAdmin
      .from('daily_verses')
      .upsert(
        {
          delivery_date: today,
          text: verse.text,
          reference: verse.reference,
          notion_page_id: verse.notionPageId || null,
        },
        { onConflict: 'delivery_date' }
      );
    if (upsertError) {
      console.error('Errore upsert daily_verses:', upsertError);
    }

    const body = verse.reference
      ? `${verse.text}\n— ${verse.reference}`
      : verse.text;

    const stats = await broadcastPush({
      title: '🕊️ La Via del Cuore',
      body,
      url: '/',
    });

    return NextResponse.json({
      success: true,
      verse,
      stored: !upsertError,
      delivery: stats,
    });
  } catch (err: any) {
    console.error('Errore cron daily-verse:', err);
    return NextResponse.json(
      { error: 'Errore invio notifiche', details: err.message },
      { status: 500 }
    );
  }
}
