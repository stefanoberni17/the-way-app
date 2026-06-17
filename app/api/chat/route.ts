import { NextRequest, NextResponse } from 'next/server';
import {
  buildUserContext,
  callClaude,
  checkSafetyKeywords,
  SYSTEM_PROMPT,
  WEB_FORMAT
} from '@/lib/maestro-ai';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authUserId = await getAuthUser(request);
    const userId = authUserId || body.userId;
    const { messages } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // L'API Anthropic richiede che il primo messaggio sia di ruolo 'user'.
    // La chat web include un saluto iniziale dell'assistente ("Ciao! Sono qui...")
    // che, se passato come primo elemento, fa fallire la chiamata con un 400.
    // Scartiamo quindi qualsiasi messaggio non-user in testa all'array.
    const firstUserIdx = messages.findIndex((m: { role: string }) => m.role === 'user');
    const apiMessages = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : [];

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'Nessun messaggio utente valido' }, { status: 400 });
    }

    /* disabilitato per ora
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === 'user' && checkSafetyKeywords(lastUserMessage.content)) {
      await sendSafetyAlert(userId, profile?.name || 'Unknown', lastUserMessage.content);
    }
    */

    const userContext = await buildUserContext(userId);
    const systemPrompt = SYSTEM_PROMPT + WEB_FORMAT + '\n\n' + userContext;

    const { text, usage } = await callClaude(systemPrompt, apiMessages, 1500);

    return NextResponse.json({
      response: text,
      usage
    });

  } catch (error: any) {
    console.error('Errore chat API:', error);
    return NextResponse.json(
      { error: 'Errore nel processing', details: error.message },
      { status: 500 }
    );
  }
}