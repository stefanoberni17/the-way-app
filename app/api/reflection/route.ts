import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Recupera riflessione esistente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authUserId = await getAuthUser(request);
    const userId = authUserId || searchParams.get('userId');
    const episodeNumber = parseInt(searchParams.get('episodeNumber') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!episodeNumber) {
      return NextResponse.json(
        { error: 'episodeNumber richiesto' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('episode_reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('episode_number', episodeNumber)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return NextResponse.json({ reflection: data });
  } catch (error: any) {
    console.error('Errore GET reflection:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Salva o aggiorna riflessione
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authUserId = await getAuthUser(request);
    const userId = authUserId || body.userId;
    const { episodeNumber, reflectionText, reflectionQuestion } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!episodeNumber || !reflectionText) {
      return NextResponse.json(
        { error: 'episodeNumber e reflectionText richiesti' },
        { status: 400 }
      );
    }

    // Max 500 caratteri
    if (reflectionText.length > 500) {
      return NextResponse.json(
        { error: 'Riflessione troppo lunga (max 500 caratteri)' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
  .from('episode_reflections')
  .upsert(
    {
      user_id: userId,
      episode_number: episodeNumber,
      reflection_text: reflectionText,
      reflection_question: reflectionQuestion || null,
      updated_at: new Date().toISOString(),
    },
        { onConflict: 'user_id,episode_number' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      reflection: data,
    });
  } catch (error: any) {
    console.error('Errore POST reflection:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}
