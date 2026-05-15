'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const REMINDER_HOUR = 21;
const DISMISS_KEY = 'evening_reminder_dismissed_session';

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function EveningReminderBanner() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Solo dopo le 21 locali
      if (new Date().getHours() < REMINDER_HOUR) return;

      // Dismissed per questa sessione?
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

      try {
        const token = await getAccessToken();
        const res = await fetch('/api/daily-checkin', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (!json.checkin?.checkin_submitted_at) setShow(true);
      } catch (err) {
        console.error('Errore evening reminder check:', err);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🌙</span>
        <p className="flex-1 text-sm leading-snug">
          <span className="font-bold">È l&apos;ora del check-in.</span>{' '}
          <span className="text-slate-300 italic">Uno sguardo sulla giornata?</span>
        </p>
        <button
          onClick={() => router.push('/cammino-oggi')}
          className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          Andiamo
        </button>
        <button
          onClick={dismiss}
          aria-label="Chiudi"
          className="text-slate-400 hover:text-white text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
