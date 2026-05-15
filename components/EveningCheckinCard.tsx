'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface CheckinData {
  checkin_date: string;
  q_presence: number | null;
  q_connection: number | null;
  note: string | null;
  checkin_submitted_at: string | null;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// Restituisce l'ora locale corrente (0-23) usando il fuso del browser.
function currentHour(): number {
  return new Date().getHours();
}

const EVENING_THRESHOLD = 18;

export default function EveningCheckinCard() {
  const router = useRouter();
  const [checkin, setCheckin] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/daily-checkin', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setCheckin(json.checkin || null);
      } catch (err) {
        console.error('Errore caricamento daily checkin:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return null;

  const submitted = !!checkin?.checkin_submitted_at;
  const isEvening = currentHour() >= EVENING_THRESHOLD;

  // STATO 1: già compilato — riepilogo + link "Modifica"
  if (submitted && checkin) {
    const presencePct = ((checkin.q_presence || 0) / 10) * 100;
    const connectionPct = ((checkin.q_connection || 0) / 10) * 100;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-5">
        <div className="h-1 bg-green-400" />
        <div className="p-6">
          <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🌙</span> Giornata custodita
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">Presenza</p>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${presencePct}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Connessione con te</p>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all"
                  style={{ width: `${connectionPct}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/cammino-oggi')}
            className="text-xs text-stone-500 hover:text-amber-700 underline-offset-2 hover:underline"
          >
            Modifica
          </button>
        </div>
      </div>
    );
  }

  // STATO 2: prima delle 18:00 — disabilitato
  if (!isEvening) {
    return (
      <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden mb-5 opacity-75">
        <div className="h-1 bg-stone-300" />
        <div className="p-6">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <span>🌙</span> Check-in della sera
          </p>
          <p className="text-sm text-stone-500 italic">
            Ti aspetto stasera per uno sguardo sulla giornata.
          </p>
        </div>
      </div>
    );
  }

  // STATO 3: 18:00+, non ancora compilato — CTA
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-5">
      <div className="h-1 bg-gradient-to-r from-slate-700 to-slate-500" />
      <div className="p-6">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>🌙</span> Check-in della sera
        </p>
        <p className="text-sm text-stone-600 mb-4 italic">
          Uno sguardo gentile sulla giornata che hai appena vissuto.
        </p>
        <button
          onClick={() => router.push('/cammino-oggi')}
          className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          Fai il check-in della sera
        </button>
      </div>
    </div>
  );
}
