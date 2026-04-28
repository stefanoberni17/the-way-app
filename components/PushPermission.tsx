'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Status = 'loading' | 'unsupported' | 'denied' | 'inactive' | 'active';

// Converte la chiave VAPID base64-url nel formato richiesto da pushManager.subscribe.
// Costruisce esplicitamente un ArrayBuffer (non SharedArrayBuffer) per soddisfare
// il tipo BufferSource richiesto dalle DOM lib di TS 5+.
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
 * Mostra stati distinti: non supportato, permesso negato, attivo, inattivo.
 */
export default function PushPermission() {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);

  // Determina lo stato corrente al mount
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

  // ---- Render ----

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse">
        <p className="text-sm text-gray-400">Carico stato notifiche...</p>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-stone-200">
        <p className="text-sm font-bold text-gray-700 mb-1">🔕 Notifiche non supportate</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Il tuo browser non supporta le notifiche push. Su iPhone, aggiungi prima The Way alla schermata Home, poi torna qui.
        </p>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Notifiche bloccate</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Hai negato il permesso. Per ricevere la frase del giorno, riattiva le notifiche dalle impostazioni del browser.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200 flex items-center gap-3">
      <div className="text-2xl flex-shrink-0">🕊️</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800">Frase del giorno</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          {status === 'active'
            ? 'Ricevi una frase ogni mattina per accompagnare il tuo cammino.'
            : 'Attiva le notifiche per ricevere una frase ogni mattina.'}
        </p>
      </div>
      <button
        onClick={status === 'active' ? disable : enable}
        disabled={busy}
        className={`text-xs font-bold px-3 py-2 rounded-lg transition-all flex-shrink-0 disabled:opacity-50 ${
          status === 'active'
            ? 'bg-stone-100 text-gray-700 hover:bg-stone-200'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        {busy ? '...' : status === 'active' ? 'Disattiva' : 'Attiva'}
      </button>
    </div>
  );
}
