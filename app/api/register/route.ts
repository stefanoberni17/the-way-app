import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/register
 *
 * Registrazione "atomica":
 *  1. signUp via client anon (Supabase manda l'email di conferma)
 *  2. upsert riga in `profiles` via service_role (bypassa RLS)
 *
 * Perché lato server: subito dopo `signUp` l'utente NON ha ancora una sessione
 * attiva (la conferma email è richiesta), quindi `auth.uid()` è null e le policy
 * RLS su `profiles` rifiutano l'INSERT/UPSERT lato client. Il service_role
 * bypassa RLS ed è sicuro perché la chiave resta sul server.
 *
 * Body atteso:
 *  { email, password, name, age?, goals?, passions?, dream?, current_situation? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, age, goals, passions, dream, current_situation } = body || {};

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'email, password e name sono richiesti' },
        { status: 400 }
      );
    }

    // Client anon → fa il signUp (email conferma viene inviata da Supabase Auth)
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: userData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    const userId = userData.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'signUp non ha restituito un utente valido' },
        { status: 500 }
      );
    }

    // Service role → bypassa RLS per arricchire la riga `profiles`
    // (la riga base è già stata creata dal trigger `on_auth_user_created`).
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          name: name.trim(),
          age: age ? parseInt(String(age)) : null,
          goals: goals?.trim() || null,
          passions: passions?.trim() || null,
          dream: dream?.trim() || null,
          current_situation: current_situation?.trim() || null,
          onboarding_completed: false,
        },
        { onConflict: 'user_id' }
      );

    if (profileError) {
      console.error('Errore profilo:', profileError);
      // Non blocchiamo: l'utente è stato creato in auth.users, può comunque
      // confermare email e poi completare il profilo via /onboarding.
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error('Errore /api/register:', err);
    return NextResponse.json(
      { error: 'Errore registrazione', details: err.message },
      { status: 500 }
    );
  }
}
