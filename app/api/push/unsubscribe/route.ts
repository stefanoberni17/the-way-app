import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/push/unsubscribe
 * Body: { endpoint: string }
 * Elimina la subscription specifica dell'utente autenticato.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { endpoint } = await request.json();
    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint richiesto' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('endpoint', endpoint);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Errore push/unsubscribe:', err);
    return NextResponse.json(
      { error: 'Errore cancellazione subscription', details: err.message },
      { status: 500 }
    );
  }
}
