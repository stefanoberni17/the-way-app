'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Moon, X } from 'lucide-react';

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
      if (new Date().getHours() < REMINDER_HOUR) return;
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
    <div className="sticky top-0 z-40 bg-night text-night-text border-b border-night-line">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
        <Moon className="w-4 h-4 text-gold-light flex-shrink-0" strokeWidth={2} />
        <p className="flex-1 text-sm leading-snug">
          <span className="font-semibold">È l&apos;ora del check-in.</span>{' '}
          <span className="text-night-muted font-serif italic text-base">Uno sguardo sulla giornata?</span>
        </p>
        <button
          onClick={() => router.push('/cammino-oggi')}
          className="bg-gold-light text-night font-semibold text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap hover:bg-gold-soft transition-colors"
        >
          Andiamo
        </button>
        <button
          onClick={dismiss}
          aria-label="Chiudi"
          className="text-night-muted hover:text-night-text p-1"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
