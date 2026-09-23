'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PASSAGE_TAGS, TAG_MAP } from '@/lib/savedPassageTags';
import { getEpisodeMetaSafe } from '@/lib/episodeMetadata';
import { PageHeader, LoadingScreen, Card, Button, Chip, Tag, Eyebrow } from '@/components/ui';
import { Bookmark, ArrowRight } from 'lucide-react';

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
    return <LoadingScreen label="Apro il taccuino…" />;
  }

  return (
    <main className="min-h-screen bg-parchment">
      <PageHeader
        eyebrow="Custoditi"
        title="I passi a cui torni"
        subtitle={
          saved.length === 0
            ? 'Quando un passo ti parla, custodiscilo qui.'
            : `${saved.length} ${saved.length === 1 ? 'passo custodito' : 'passi custoditi'}`
        }
      />

      <div className="max-w-2xl mx-auto px-4 pb-10">
        {saved.length === 0 && (
          <Card tone="ghost" className="text-center py-10 animate-rise">
            <div className="w-12 h-12 rounded-full bg-gold-soft text-gold-deep flex items-center justify-center mx-auto mb-5">
              <Bookmark className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <p className="font-serif text-2xl text-ink mb-2">Non c&apos;è ancora nulla qui.</p>
            <p className="text-sm text-ink-soft leading-relaxed max-w-xs mx-auto mb-6">
              Mentre cammini, quando un passo ti tocca davvero, tocca «Custodisci» in fondo. Lo ritroverai qui, ordinato per i momenti della tua vita.
            </p>
            <Button onClick={() => router.push('/settimane')}>
              Vai al percorso
              <ArrowRight strokeWidth={2.2} />
            </Button>
          </Card>
        )}

        {presentTags.length > 0 && (
          <div className="mb-6">
            <Eyebrow tone="muted" className="mb-3 px-1">Filtra per momento</Eyebrow>
            <div className="flex flex-wrap gap-2">
              <Chip active={activeTag === null} tone="ink" onClick={() => setActiveTag(null)}>
                Tutti
              </Chip>
              {presentTags.map(tag => (
                <Chip
                  key={tag.id}
                  active={activeTag === tag.id}
                  onClick={() => setActiveTag(activeTag === tag.id ? null : tag.id)}
                >
                  <span className="text-sm leading-none">{tag.icon}</span>
                  {tag.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((row, idx) => {
            const meta = getEpisodeMetaSafe(row.episode_number);
            return (
              <Card
                key={row.episode_number}
                onClick={() => router.push(`/episodio/${row.episode_number}?step=1`)}
                className={`animate-rise delay-${Math.min(idx + 1, 4)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Eyebrow className="mb-1.5">
                      Passo {meta.number} · Settimana {meta.weekNumber}
                    </Eyebrow>
                    <h2 className="font-serif text-2xl font-semibold text-ink leading-tight">
                      {meta.title}
                    </h2>
                    {meta.reference && (
                      <p className="text-sm text-muted italic font-serif mt-1">
                        {meta.reference}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-faint shrink-0 mt-2" strokeWidth={1.8} />
                </div>

                {Array.isArray(row.tags) && row.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-line">
                    {row.tags
                      .filter(id => TAG_MAP[id])
                      .map(id => {
                        const t = TAG_MAP[id];
                        return (
                          <Tag key={id}>
                            <span className="leading-none">{t.icon}</span>
                            {t.label}
                          </Tag>
                        );
                      })}
                  </div>
                )}
              </Card>
            );
          })}

          {filtered.length === 0 && saved.length > 0 && (
            <p className="text-center font-serif italic text-lg text-muted py-10">
              Nessun passo custodito per questo momento.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
