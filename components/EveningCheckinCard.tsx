'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, Eyebrow, Button, ProgressBar } from '@/components/ui';
import { Moon, ArrowRight } from 'lucide-react';

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

  // STATO 1: già compilato
  if (submitted && checkin) {
    const presencePct = ((checkin.q_presence || 0) / 10) * 100;
    const connectionPct = ((checkin.q_connection || 0) / 10) * 100;
    return (
      <Card className="animate-rise delay-2">
        <div className="flex items-start justify-between gap-3 mb-4">
          <Eyebrow tone="sage" icon={<Moon strokeWidth={2} />}>Giornata custodita</Eyebrow>
          <button
            onClick={() => router.push('/cammino-oggi')}
            className="text-xs text-muted hover:text-gold-deep transition-colors"
          >
            Modifica
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-soft">Presenza</span>
              <span className="font-serif text-base text-ink leading-none">{checkin.q_presence}</span>
            </div>
            <ProgressBar value={presencePct} tone="sage" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-soft">Connessione con te</span>
              <span className="font-serif text-base text-ink leading-none">{checkin.q_connection}</span>
            </div>
            <ProgressBar value={connectionPct} tone="sage" />
          </div>
        </div>
      </Card>
    );
  }

  // STATO 2: prima delle 18
  if (!isEvening) {
    return (
      <Card tone="ghost" className="animate-rise delay-2">
        <Eyebrow tone="muted" icon={<Moon strokeWidth={2} />} className="mb-2">
          Check-in della sera
        </Eyebrow>
        <p className="font-serif italic text-lg text-muted leading-snug">
          Ti aspetto stasera per uno sguardo sulla giornata.
        </p>
      </Card>
    );
  }

  // STATO 3: sera, non ancora compilato
  return (
    <Card className="animate-rise delay-2">
      <Eyebrow icon={<Moon strokeWidth={2} />} className="mb-2">
        Check-in della sera
      </Eyebrow>
      <p className="font-serif text-[22px] leading-[1.3] text-ink mb-5">
        Uno sguardo gentile sulla giornata che hai appena vissuto.
      </p>
      <Button full onClick={() => router.push('/cammino-oggi')}>
        Fai il check-in
        <ArrowRight strokeWidth={2.2} />
      </Button>
    </Card>
  );
}
