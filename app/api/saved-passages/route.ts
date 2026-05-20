import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/lib/auth';
import { sanitizeTags } from '@/lib/savedPassageTags';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET → lista di tutti i passi custoditi dall'utente (con tag)
export async function GET(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    const userId = authUserId || searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('saved_passages')
      .select('episode_number, tags, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ saved: data || [] });
  } catch (error: any) {
    console.error('Errore GET saved-passages:', error);
    return NextResponse.json(
      { error: 'Errore nel caricamento', details: error.message },
      { status: 500 }
    );
  }
}

// POST { episodeNumber, tags } → salva o aggiorna i tag
export async function POST(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const body = await request.json();
    const userId = authUserId || body.userId;
    const episodeNumber = parseInt(body.episodeNumber);
    const tags = sanitizeTags(body.tags);

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!episodeNumber || isNaN(episodeNumber)) {
      return NextResponse.json(
        { error: 'episodeNumber richiesto' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('saved_passages')
      .upsert(
        {
          user_id: userId,
          episode_number: episodeNumber,
          tags,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,episode_number' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, saved: data });
  } catch (error: any) {
    console.error('Errore POST saved-passages:', error);
    return NextResponse.json(
      { error: 'Errore nel salvataggio', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE ?episodeNumber=N → rimuovi dai custoditi
export async function DELETE(request: NextRequest) {
  try {
    const authUserId = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
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

    const { error } = await supabaseAdmin
      .from('saved_passages')
      .delete()
      .eq('user_id', userId)
      .eq('episode_number', episodeNumber);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore DELETE saved-passages:', error);
    return NextResponse.json(
      { error: 'Errore nella rimozione', details: error.message },
      { status: 500 }
    );
  }
}
