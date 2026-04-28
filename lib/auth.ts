import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Estrae l'userId autenticato da una richiesta API.
 *
 * Strategia:
 * 1. Header `Authorization: Bearer <access_token>` (chiamate dal client autenticato)
 * 2. Fallback: cookie SSR di Supabase (`sb-*-auth-token`) — JSON o token raw
 *
 * Ritorna `null` se nessuna autenticazione valida è presente.
 * Ported da for-you-football.
 */
export async function getAuthUser(request: NextRequest): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) return user.id;
    }

    const allCookies = request.cookies.getAll();
    for (const cookie of allCookies) {
      if (!cookie.name.includes('auth-token') && !cookie.name.includes('access-token')) continue;

      try {
        const parsed = JSON.parse(cookie.value);
        const token = parsed?.access_token || parsed?.[0]?.access_token;
        if (token) {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) return user.id;
        }
      } catch {
        const { data: { user }, error } = await supabase.auth.getUser(cookie.value);
        if (!error && user) return user.id;
      }
    }

    return null;
  } catch {
    return null;
  }
}
