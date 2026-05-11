'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Verse {
  delivery_date: string;
  text: string;
  reference: string | null;
}

interface DailyVerseCardProps {
  name?: string;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function DailyVerseCard({ name }: DailyVerseCardProps) {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [dismissing, setDismissing] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/daily-verse', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setVerse(data.verse || null);
      } catch (err) {
        console.error('Errore caricamento daily verse:', err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const markAsRead = async () => {
    setDismissing(true);
    try {
      const token = await getAccessToken();
      await fetch('/api/daily-verse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.error('Errore mark as read daily verse:', err);
    }
    // fade-out poi nasconde
    setTimeout(() => setHidden(true), 250);
  };

  if (!verse || hidden) return null;

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 rounded-2xl shadow-sm border border-amber-200 overflow-hidden mb-5 transition-opacity duration-200 ${
        dismissing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
      <div className="p-6">
        <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>☀️</span> Buongiorno{name ? `, ${name}` : ''}
        </p>
        <p className="text-xs text-amber-700 mb-4 italic">
          La frase del giorno è qui per te
        </p>

        <blockquote className="text-gray-800 text-base font-serif italic leading-relaxed mb-3 whitespace-pre-line">
          &ldquo;{verse.text}&rdquo;
        </blockquote>
        {verse.reference && (
          <p className="text-amber-700 text-sm font-semibold text-right mb-5">
            — {verse.reference}
          </p>
        )}

        <button
          onClick={markAsRead}
          disabled={dismissing}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm disabled:opacity-50"
        >
          Grazie 🙏
        </button>
      </div>
    </div>
  );
}
