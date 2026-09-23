'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PASSAGE_TAGS, suggestTagsForEpisode } from '@/lib/savedPassageTags';
import { Button, Eyebrow } from '@/components/ui';
import { Bookmark, BookmarkCheck, Check, X } from 'lucide-react';

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
      <Button
        variant={saved ? 'gold' : 'secondary'}
        full
        className="mb-3"
        onClick={openModal}
      >
        {saved ? <BookmarkCheck strokeWidth={2} /> : <Bookmark strokeWidth={2} />}
        {saved ? 'Custodito' : 'Custodisci questo passo'}
      </Button>

      {showModal && (
        <div
          className="fixed inset-0 z-[70] bg-night/70 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-paper rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-float)] w-full sm:max-w-md flex flex-col max-h-[92vh] sm:max-h-[85vh] sm:m-4 animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-6 pt-5 pb-4 border-b border-line shrink-0">
              <div className="flex items-center justify-between mb-1">
                <Eyebrow>Custodisci il passo</Eyebrow>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-9 h-9 -mr-2 rounded-full text-muted hover:text-ink hover:bg-parchment flex items-center justify-center transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <p className="font-serif text-2xl font-semibold text-ink leading-tight">Quando vorrai ritrovarlo?</p>
              <p className="text-xs text-muted mt-1.5">Ti suggerisco alcuni momenti. Modifica come vuoi.</p>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto overscroll-contain scroll-quiet px-6 py-4 space-y-2">
              {PASSAGE_TAGS.map(tag => {
                const selected = draftTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-gold bg-gold-wash'
                        : 'border-line bg-paper hover:border-line-strong'
                    }`}
                  >
                    <span className="text-lg leading-none w-6 text-center">{tag.icon}</span>
                    <span className={`flex-1 text-sm ${selected ? 'text-ink font-medium' : 'text-ink-soft'}`}>
                      {tag.label}
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selected ? 'bg-gold border-gold text-paper' : 'border-line-strong'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-line bg-paper space-y-2 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button full size="lg" onClick={confirm} disabled={busy}>
                {busy ? 'Custodisco…' : saved ? 'Aggiorna' : 'Custodisci'}
              </Button>
              {saved && (
                <button
                  onClick={remove}
                  disabled={busy}
                  className="w-full text-xs text-muted hover:text-rose py-2 transition-colors disabled:opacity-50"
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
