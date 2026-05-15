'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const PRESENCE_LABELS = ['mai', 'appena', 'poco', 'tratti', 'a metà', 'discreta', 'spesso', 'molto', 'quasi sempre', 'sempre'];

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

  // Auth + load esistente
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

      // Redirect home con flag toast
      sessionStorage.setItem('checkin_just_saved', '1');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Errore nel salvataggio');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 italic">Apertura…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="mb-8">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
            ✝ The Way · Check-in della sera
          </p>
          <h1 className="text-2xl md:text-3xl font-serif text-slate-900 mb-2">
            Uno sguardo gentile sulla giornata
          </h1>
          <p className="text-stone-600 italic text-sm">
            che hai appena vissuto.
          </p>
        </div>

        {/* Presenza */}
        <SliderBlock
          label="Presenza"
          question="Quanto sei stato presente durante la giornata?"
          value={state.presence}
          onChange={(v) => setState({ ...state, presence: v })}
        />

        {/* Connessione */}
        <SliderBlock
          label="Connessione con te"
          question="Quanto ti sei sentito connesso con te stesso oggi?"
          value={state.connection}
          onChange={(v) => setState({ ...state, connection: v })}
        />

        {/* Nota */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
          <label className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-2 block">
            Una nota, se vuoi
          </label>
          <p className="text-xs text-stone-500 italic mb-3">
            C&apos;è qualcosa che vuoi posare qui? (facoltativo)
          </p>
          <textarea
            value={state.note}
            onChange={(e) => setState({ ...state, note: e.target.value.slice(0, 500) })}
            placeholder="Una frase, un'immagine, un sentire…"
            rows={4}
            className="w-full border border-stone-200 rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 resize-none"
          />
          <p className="text-xs text-stone-400 mt-1 text-right">
            {state.note.length} / 500
          </p>
        </div>

        {/* Safety message */}
        {safetyMessage && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-6">
            <p className="text-sm font-bold text-amber-900 mb-2">
              Quello che hai scritto è arrivato.
            </p>
            <p className="text-sm text-amber-900 leading-relaxed mb-3">
              Se in questo momento stai attraversando un dolore profondo, non sei solo.
              Puoi parlare con qualcuno che sa ascoltare:
            </p>
            <p className="text-sm font-bold text-amber-900">
              📞 Telefono Amico: 02 2327 2327
            </p>
            <button
              onClick={() => {
                setSafetyMessage(false);
                sessionStorage.setItem('checkin_just_saved', '1');
                router.push('/');
              }}
              className="mt-4 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm"
            >
              Ho letto, torno a casa
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!safetyMessage && (
          <button
            onClick={submit}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm"
          >
            {saving ? 'Custodisco…' : alreadySubmitted ? 'Aggiorna la giornata' : 'Custodisci la giornata'}
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="w-full mt-3 text-xs text-stone-500 hover:text-stone-700 py-2"
        >
          ← Torna indietro
        </button>
      </div>
    </div>
  );
}

interface SliderBlockProps {
  label: string;
  question: string;
  value: number;
  onChange: (v: number) => void;
}

function SliderBlock({ label, question, value, onChange }: SliderBlockProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-4">
      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-base font-serif text-slate-800 leading-relaxed mb-5">
        {question}
      </p>

      <div className="flex items-center gap-4 mb-2">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="flex-1 accent-amber-500 h-2"
        />
        <span className="text-2xl font-bold text-amber-700 tabular-nums w-10 text-right">
          {value}
        </span>
      </div>

      <p className="text-xs text-stone-500 italic text-center">
        {PRESENCE_LABELS[value - 1]} · 1 mai · 10 sempre
      </p>
    </div>
  );
}
