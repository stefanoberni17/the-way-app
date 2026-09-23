'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, IconBadge, Button } from '@/components/ui';
import { Bell, BellOff, BellRing } from 'lucide-react';

type Status = 'loading' | 'unsupported' | 'denied' | 'inactive' | 'active';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Toggle in /profilo per attivare/disattivare le notifiche push.
 */
export default function PushPermission() {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setStatus('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setStatus('denied');
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub ? 'active' : 'inactive');
      } catch {
        setStatus('inactive');
      }
    };
    init();
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        alert('Le notifiche non sono ancora configurate sul server.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'inactive');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const token = await getAccessToken();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) throw new Error('Errore registrazione subscription');
      setStatus('active');
    } catch (err) {
      console.error('Errore attivazione push:', err);
      alert('Non è stato possibile attivare le notifiche. Riprova.');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();

        const token = await getAccessToken();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ endpoint }),
        });
      }
      setStatus('inactive');
    } catch (err) {
      console.error('Errore disattivazione push:', err);
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return (
      <Card tone="warm" className="animate-pulse">
        <p className="text-sm text-muted">Controllo le notifiche…</p>
      </Card>
    );
  }

  if (status === 'unsupported') {
    return (
      <Card tone="warm">
        <div className="flex items-start gap-3.5">
          <IconBadge tone="muted" size="sm"><BellOff strokeWidth={1.8} /></IconBadge>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Notifiche non disponibili</p>
            <p className="text-xs text-muted leading-relaxed">
              Il tuo browser non supporta le notifiche push. Su iPhone, aggiungi prima The Way alla schermata Home, poi torna qui.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'denied') {
    return (
      <Card tone="gold">
        <div className="flex items-start gap-3.5">
          <IconBadge size="sm"><BellOff strokeWidth={1.8} /></IconBadge>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Notifiche bloccate</p>
            <p className="text-xs text-ink-soft leading-relaxed">
              Hai negato il permesso. Per ricevere la frase del giorno, riattiva le notifiche dalle impostazioni del browser.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const active = status === 'active';

  return (
    <Card>
      <div className="flex items-center gap-3.5">
        <IconBadge size="sm" tone={active ? 'gold' : 'muted'}>
          {active ? <BellRing strokeWidth={1.8} /> : <Bell strokeWidth={1.8} />}
        </IconBadge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">Frase del giorno</p>
          <p className="text-xs text-muted leading-relaxed">
            {active
              ? 'Ogni mattina, una frase per accompagnare il cammino.'
              : 'Ricevi una frase ogni mattina.'}
          </p>
        </div>
        <Button
          size="sm"
          variant={active ? 'secondary' : 'gold'}
          onClick={active ? disable : enable}
          disabled={busy}
        >
          {busy ? '…' : active ? 'Disattiva' : 'Attiva'}
        </Button>
      </div>
    </Card>
  );
}
