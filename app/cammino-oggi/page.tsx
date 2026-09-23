'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageHeader, LoadingScreen, Card, Button, Eyebrow, Notice } from '@/components/ui';
import { Moon, Phone } from 'lucide-react';

const PRESENCE_LABELS = ['mai', 'appena', 'poco', 'a tratti', 'a metà', 'discreta', 'spesso', 'molto', 'quasi sempre', 'sempre'];

interface CheckinState {
  presence: number;
  connection: number;
  note: string;
}

export default function CamminoOggiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [safetyMessage, setSafetyMessage] = useState(false);
  const [error, setError] = useState('');

  const [state, setState] = useState<CheckinState>({
    presence: 5,
    connection: 5,
    note: '',
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/daily-checkin', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.checkin) {
            setState({
              presence: json.checkin.q_presence ?? 5,
              connection: json.checkin.q_connection ?? 5,
              note: json.checkin.note ?? '',
            });
            if (json.checkin.checkin_submitted_at) setAlreadySubmitted(true);
          }
        }
      } catch (err) {
        console.error('Errore caricamento checkin:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    setError('');
    setSafetyMessage(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/daily-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          q_presence: state.presence,
          q_connection: state.connection,
          note: state.note.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Errore nel salvataggio');
        setSaving(false);
        return;
      }

      if (json.showSafetyMessage) {
        setSafetyMessage(true);
        setSaving(false);
        return;
      }

      sessionStorage.setItem('checkin_just_saved', '1');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Errore nel salvataggio');
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen label="Apro la sera…" />;
  }

  return (
    <main className="min-h-screen bg-parchment">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2"><Moon className="w-3.5 h-3.5" strokeWidth={2} /> Check-in della sera</span>}
        title={<>Uno sguardo gentile <span className="italic font-normal">sulla giornata</span></>}
        subtitle="Non un voto. Solo un modo per accorgerti di come sei stato oggi."
        onBack={() => router.back()}
      />

      <div className="max-w-2xl mx-auto px-4 pb-10 space-y-4">

        <SliderBlock
          label="Presenza"
          question="Quanto sei stato presente durante la giornata?"
          value={state.presence}
          onChange={(v) => setState({ ...state, presence: v })}
          delay="delay-1"
        />

        <SliderBlock
          label="Connessione con te"
          question="Quanto ti sei sentito connesso con te stesso oggi?"
          value={state.connection}
          onChange={(v) => setState({ ...state, connection: v })}
          delay="delay-2"
        />

        <Card className="animate-rise delay-3">
          <Eyebrow tone="muted" className="mb-2">Una nota, se vuoi</Eyebrow>
          <p className="font-serif text-xl text-ink leading-snug mb-4">
            C&apos;è qualcosa che vuoi posare qui?
          </p>
          <textarea
            value={state.note}
            onChange={(e) => setState({ ...state, note: e.target.value.slice(0, 500) })}
            placeholder="Una frase, un'immagine, un sentire…"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-paper-warm border border-line text-[15px] text-ink leading-relaxed placeholder:text-faint outline-none resize-none transition-all focus:border-gold focus:ring-4 focus:ring-gold/10"
          />
          <p className="text-xs text-muted mt-1.5 text-right tabular-nums">
            {state.note.length} / 500
          </p>
        </Card>

        {safetyMessage && (
          <Card tone="gold" className="animate-rise">
            <p className="font-serif text-2xl text-ink mb-2">Quello che hai scritto è arrivato.</p>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Se in questo momento stai attraversando un dolore profondo, non sei solo.
              Puoi parlare con qualcuno che sa ascoltare:
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <Phone className="w-4 h-4 text-gold-deep" strokeWidth={2} />
              Telefono Amico: 02 2327 2327
            </p>
            <Button
              full
              className="mt-5"
              onClick={() => {
                setSafetyMessage(false);
                sessionStorage.setItem('checkin_just_saved', '1');
                router.push('/');
              }}
            >
              Ho letto, torno a casa
            </Button>
          </Card>
        )}

        {error && <Notice tone="error">{error}</Notice>}

        {!safetyMessage && (
          <Button full size="lg" onClick={submit} disabled={saving} className="animate-rise delay-4">
            {saving ? 'Custodisco…' : alreadySubmitted ? 'Aggiorna la giornata' : 'Custodisci la giornata'}
          </Button>
        )}
      </div>
    </main>
  );
}

interface SliderBlockProps {
  label: string;
  question: string;
  value: number;
  onChange: (v: number) => void;
  delay?: string;
}

function SliderBlock({ label, question, value, onChange, delay = '' }: SliderBlockProps) {
  const pct = ((value - 1) / 9) * 100;
  return (
    <Card className={`animate-rise ${delay}`}>
      <Eyebrow className="mb-2">{label}</Eyebrow>
      <p className="font-serif text-[22px] text-ink leading-[1.3] mb-6">
        {question}
      </p>

      <div className="flex items-center gap-5 mb-3">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="range-gold flex-1"
          style={{ ['--range-pct' as string]: `${pct}%` }}
          aria-label={label}
        />
        <span className="font-serif text-4xl text-ink tabular-nums w-12 text-right leading-none">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>mai</span>
        <span className="font-medium text-gold-deep italic font-serif text-sm">{PRESENCE_LABELS[value - 1]}</span>
        <span>sempre</span>
      </div>
    </Card>
  );
}
