'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface InvitationData {
  date: string;
  invitation_text: string;
  week_number: number;
  episode_number: number;
  invitation_seen_at: string | null;
  invitation_done_at: string | null;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function DailyInvitationCard() {
  const [data, setData] = useState<InvitationData | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/daily-invitation', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setData(json);

        // Mark "seen" se non ancora visto
        if (!json.invitation_seen_at) {
          fetch('/api/daily-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ action: 'seen' }),
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Errore caricamento daily invitation:', err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const markDone = async () => {
    if (marking || !data) return;
    setMarking(true);
    try {
      const token = await getAccessToken();
      await fetch('/api/daily-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'done' }),
      });
      setData({ ...data, invitation_done_at: new Date().toISOString() });
    } catch (err) {
      console.error('Errore mark done invitation:', err);
    } finally {
      setMarking(false);
    }
  };

  if (!data || !data.invitation_text) return null;

  const done = !!data.invitation_done_at;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden mb-5 transition-colors ${
        done ? 'border-green-300' : 'border-stone-200'
      }`}
    >
      <div className={`h-1 ${done ? 'bg-green-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`} />
      <div className="p-6">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>🕯️</span> Invito di oggi
        </p>
        <p className="text-xs text-stone-500 mb-4 italic">
          Dal Passo {data.episode_number} · porta questo nella giornata
        </p>

        <p className="text-gray-800 text-base font-serif italic leading-relaxed mb-5">
          {data.invitation_text}
        </p>

        {done ? (
          <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm font-medium text-green-800 text-center flex items-center justify-center gap-2">
            <span>✓</span> Lo hai vissuto, grazie
          </div>
        ) : (
          <button
            onClick={markDone}
            disabled={marking}
            className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 active:bg-amber-100 font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            ✓ L&apos;ho vissuto
          </button>
        )}
      </div>
    </div>
  );
}
