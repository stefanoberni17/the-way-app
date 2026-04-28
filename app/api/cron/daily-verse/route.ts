import { NextRequest, NextResponse } from 'next/server';
import { getRandomDailyVerse } from '@/lib/dailyVerse';
import { broadcastPush } from '@/lib/pushNotification';

/**
 * GET /api/cron/daily-verse
 * Schedulato da Vercel Cron (vedi vercel.json) ogni mattina.
 *
 * 1. Pesca una frase casuale dal DB Notion "Frasi del giorno"
 * 2. La invia come push notification a tutte le subscription registrate
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
