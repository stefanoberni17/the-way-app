import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/push/subscribe
 * Body: PushSubscription JSON (come ritornato da `pushManager.subscribe(...).toJSON()`)
 * Salva (o aggiorna) la subscription per l'utente autenticato.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const sub = await request.json();
    const endpoint = sub?.endpoint;
    const p256dh = sub?.keys?.p256dh;
    const auth = sub?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: 'Subscription non valida (endpoint/keys mancanti)' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        { user_id: userId, endpoint, p256dh, auth },
        { onConflict: 'endpoint' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Errore push/subscribe:', err);
    return NextResponse.json(
      { error: 'Errore salvataggio subscription', details: err.message },
      { status: 500 }
    );
  }
}
