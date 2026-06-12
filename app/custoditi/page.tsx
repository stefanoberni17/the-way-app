'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PASSAGE_TAGS, TAG_MAP } from '@/lib/savedPassageTags';
import { getEpisodeMetaSafe } from '@/lib/episodeMetadata';

interface SavedRow {
  episode_number: number;
  tags: string[];
  created_at: string;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function CustoditiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/saved-passages', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setSaved(data.saved || []);
        }
      } catch (err) {
        console.error('Errore caricamento custoditi:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  // Tag effettivamente presenti tra i passi custoditi (per non mostrare chip vuoti)
  const presentTags = useMemo(() => {
    const set = new Set<string>();
    saved.forEach(s => (Array.isArray(s.tags) ? s.tags : []).forEach(t => set.add(t)));
    return PASSAGE_TAGS.filter(t => set.has(t.id));
  }, [saved]);

  const filtered = useMemo(() => {
    if (!activeTag) return saved;
    return saved.filter(s => Array.isArray(s.tags) && s.tags.includes(activeTag));
  }, [saved, activeTag]);

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 italic">Apertura del taccuino…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <div className="bg-slate-900 px-5 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            🔖 Custoditi
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">
            I passi a cui torni
          </h1>
          <p className="text-slate-400 text-sm italic">
            {saved.length === 0
              ? 'Quando un passo ti parla, custodiscilo qui.'
              : `${saved.length} ${saved.length === 1 ? 'passo custodito' : 'passi custoditi'}`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-3">
        {/* Empty state */}
        {saved.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
            <div className="text-5xl mb-4">🤍</div>
            <p className="text-stone-700 font-serif text-lg mb-2">
              Non c&apos;è ancora nulla qui.
            </p>
            <p className="text-sm text-stone-500 italic mb-6">
              Mentre cammini, quando un passo ti tocca davvero, clicca &laquo;Custodisci&raquo; in fondo. Lo ritroverai qui, ordinato per le tue necessità.
            </p>
            <button
              onClick={() => router.push('/settimane')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm"
            >
              Vai al percorso
            </button>
          </div>
        )}

        {/* Filtri tag */}
        {presentTags.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">
              Filtra per momento
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                  activeTag === null
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Tutti
              </button>
              {presentTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                    activeTag === tag.id
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista passi */}
        <div className="space-y-3">
          {filtered.map(row => {
            const meta = getEpisodeMetaSafe(row.episode_number);
            return (
              <button
                key={row.episode_number}
                onClick={() => router.push(`/episodio/${row.episode_number}?step=1`)}
                className="w-full text-left bg-white rounded-2xl shadow-sm border border-stone-200 hover:border-amber-300 hover:shadow transition-all overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                        Passo {meta.number} · Week {meta.weekNumber}
                      </p>
                      <h2 className="text-base font-serif text-slate-900 leading-tight mb-1">
                        {meta.title}
                      </h2>
                      {meta.reference && (
                        <p className="text-xs text-stone-500 italic">
                          {meta.reference}
                        </p>
                      )}
                    </div>
                    <span className="text-stone-300 text-xl shrink-0">→</span>
                  </div>

                  {Array.isArray(row.tags) && row.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-100">
                      {row.tags
                        .filter(id => TAG_MAP[id])
                        .map(id => {
                          const t = TAG_MAP[id];
                          return (
                            <span
                              key={id}
                              className="text-[10px] bg-amber-50 text-amber-800 px-2 py-1 rounded-full font-medium flex items-center gap-1"
                            >
                              <span>{t.icon}</span>
                              <span>{t.label}</span>
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && saved.length > 0 && (
            <div className="text-center text-stone-500 italic text-sm py-8">
              Nessun passo custodito per questo momento.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
