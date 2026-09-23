'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, Eyebrow, Button } from '@/components/ui';
import { Flame, Check } from 'lucide-react';

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
    <Card tone={done ? 'sage' : 'paper'} className="animate-rise delay-1">
      <div className="flex items-start justify-between gap-3 mb-1">
        <Eyebrow tone={done ? 'sage' : 'gold'} icon={<Flame strokeWidth={2} />}>
          Invito di oggi
        </Eyebrow>
        <span className="text-[11px] text-muted whitespace-nowrap">Dal passo {data.episode_number}</span>
      </div>
      <p className="text-xs text-muted mb-4">Porta questo nella giornata.</p>

      <p className="font-serif text-[22px] leading-[1.35] text-ink mb-5">
        {data.invitation_text}
      </p>

      {done ? (
        <p className="inline-flex items-center gap-2 text-sm font-medium text-sage">
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Lo hai vissuto. Grazie.
        </p>
      ) : (
        <Button variant="secondary" size="sm" onClick={markDone} disabled={marking}>
          <Check strokeWidth={2.5} />
          L&apos;ho vissuto
        </Button>
      )}
    </Card>
  );
}
