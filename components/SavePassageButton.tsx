'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PASSAGE_TAGS, suggestTagsForEpisode } from '@/lib/savedPassageTags';

interface SavePassageButtonProps {
  episodeNumber: number;
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export default function SavePassageButton({ episodeNumber }: SavePassageButtonProps) {
  const [saved, setSaved] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Carica stato iniziale
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch('/api/saved-passages', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        const me = (data.saved || []).find(
          (s: { episode_number: number }) => s.episode_number === episodeNumber
        );
        if (cancelled) return;
        if (me) {
          setSaved(true);
          setCurrentTags(Array.isArray(me.tags) ? me.tags : []);
        }
      } catch (err) {
        console.error('Errore load saved status:', err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [episodeNumber]);

  const openModal = () => {
    // Apri con i tag attuali se gia' salvato, altrimenti con i suggeriti
    setDraftTags(saved ? currentTags : suggestTagsForEpisode(episodeNumber));
    setShowModal(true);
  };

  const toggleTag = (id: string) => {
    setDraftTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/saved-passages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ episodeNumber, tags: draftTags }),
      });
      if (res.ok) {
        setSaved(true);
        setCurrentTags(draftTags);
        setShowModal(false);
      }
    } catch (err) {
      console.error('Errore save passage:', err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/saved-passages?episodeNumber=${episodeNumber}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setSaved(false);
        setCurrentTags([]);
        setShowModal(false);
      }
    } catch (err) {
      console.error('Errore remove passage:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`w-full flex items-center justify-center gap-2 border-2 font-semibold py-2.5 rounded-xl text-sm transition-all mb-3 ${
          saved
            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
        }`}
      >
        <span className="text-base">{saved ? '🔖' : '🤍'}</span>
        <span>
          {saved ? 'Custodito' : 'Custodisci questo passo'}
        </span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-4 border-b border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  Custodisci il passo
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-stone-600 italic">
                Scegli i momenti in cui ti piacerebbe ritrovarlo. Te lo suggerisco io — modifica come vuoi.
              </p>
            </div>

            <div className="px-5 py-4 space-y-2">
              {PASSAGE_TAGS.map(tag => {
                const selected = draftTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      selected
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-xl">{tag.icon}</span>
                    <span className={`flex-1 text-sm font-medium ${
                      selected ? 'text-amber-900' : 'text-stone-700'
                    }`}>
                      {tag.label}
                    </span>
                    {selected && <span className="text-amber-600 text-lg">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t border-stone-100 sticky bottom-0 bg-white space-y-2">
              <button
                onClick={confirm}
                disabled={busy}
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {busy ? 'Custodisco…' : saved ? 'Aggiorna' : 'Custodisci'}
              </button>
              {saved && (
                <button
                  onClick={remove}
                  disabled={busy}
                  className="w-full text-xs text-stone-500 hover:text-red-600 py-2 transition-colors disabled:opacity-50"
                >
                  Rimuovi dai custoditi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
