import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let configured = false;
function configureVapid() {
  if (configured) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error('VAPID env vars mancanti: NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushSubscriptionRecord {
  id: number;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Invia una push a una subscription. Ritorna `true` se inviata, `false` se l'endpoint
 * risulta non più valido (404/410): in quel caso la subscription viene anche cancellata
 * dal database per evitare retry futuri.
 */
export async function sendPush(sub: PushSubscriptionRecord, payload: PushPayload): Promise<boolean> {
  configureVapid();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 12 } // 12 ore
    );
    return true;
  } catch (err: any) {
    const status = err?.statusCode;
    if (status === 404 || status === 410) {
      // Endpoint dismesso → rimuovi subscription
      await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      return false;
    }
    console.error('Errore push:', { status, body: err?.body, endpoint: sub.endpoint.slice(0, 60) });
    return false;
  }
}

/** Invia la stessa push a tutte le subscriptions. Ritorna conteggi. */
export async function broadcastPush(payload: PushPayload): Promise<{ sent: number; failed: number; total: number }> {
  configureVapid();
  const { data: subs, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth');

  if (error) throw error;
  if (!subs || subs.length === 0) return { sent: 0, failed: 0, total: 0 };

  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      const ok = await sendPush(s as PushSubscriptionRecord, payload);
      if (ok) sent++;
      else failed++;
    })
  );

  return { sent, failed, total: subs.length };
}
