'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PushPermission from '@/components/PushPermission';
import { WEEK_NAMES } from '@/lib/weekIds';
import { LoadingScreen, Card, Button, Eyebrow, Field, inputClass, Notice, Rule, SectionTitle } from '@/components/ui';
import { LogOut, Check, Send } from 'lucide-react';

export default function ProfiloPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');
  const [currentWeek, setCurrentWeek] = useState('1');
  const [obiettivi, setObiettivi] = useState('');
  const [passioni, setPassioni] = useState('');
  const [sogno, setSogno] = useState('');
  const [situazioneAttuale, setSituazioneAttuale] = useState('');
  const [telegramId, setTelegramId] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).single();

      if (profileData) {
        setNome(profileData.name || '');
        setEta(profileData.age?.toString() || '');
        setCurrentWeek(profileData.current_week?.toString() || '1');
        setObiettivi(profileData.goals || '');
        setPassioni(profileData.passions || '');
        setSogno(profileData.dream || '');
        setSituazioneAttuale(profileData.current_situation || '');
        setTelegramId(profileData.telegram_id || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: nome.trim(),
          age: eta ? parseInt(eta) : null,
          goals: obiettivi.trim() || null,
          passions: passioni.trim() || null,
          dream: sogno.trim() || null,
          current_situation: situazioneAttuale.trim() || null,
          telegram_id: telegramId.trim() || null,
        })
        .eq('user_id', userId);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/login');
    else setError('Errore durante il logout');
  };

  if (loading) {
    return <LoadingScreen label="Apro il profilo…" />;
  }

  const weekName = WEEK_NAMES[parseInt(currentWeek)] || `Settimana ${currentWeek}`;
  const initial = nome ? nome.charAt(0).toUpperCase() : '✦';

  return (
    <main className="min-h-screen bg-parchment">

      {/* Testata con avatar */}
      <header className="px-5 pt-8 pb-6">
        <div className="max-w-2xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-night text-gold-light flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-float)]">
            <span className="font-serif text-3xl font-semibold leading-none">{initial}</span>
          </div>
          <div className="min-w-0">
            <Eyebrow className="mb-1">Il tuo profilo</Eyebrow>
            <h1 className="font-serif text-[34px] leading-none font-semibold text-ink truncate">{nome || 'Pellegrino'}</h1>
            <p className="text-sm text-muted mt-1.5 truncate">{email}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto"><Rule className="mt-5" /></div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-10 space-y-4">

        {/* Settimana corrente */}
        <Card tone="gold" className="animate-rise">
          <Eyebrow className="mb-1">Settimana corrente</Eyebrow>
          <p className="font-serif text-2xl font-semibold text-ink leading-tight">
            {currentWeek}. {weekName}
          </p>
          <p className="text-xs text-muted mt-1.5">Si aggiorna da sola quando completi i passi.</p>
        </Card>

        <div className="animate-rise delay-1">
          <PushPermission />
        </div>

        <form onSubmit={handleSave} className="space-y-4 animate-rise delay-2">

          {error && <Notice tone="error">{error}</Notice>}
          {success && (
            <Notice tone="success" className="flex items-center gap-2">
              <Check className="w-4 h-4" strokeWidth={2.5} /> Profilo aggiornato.
            </Notice>
          )}

          {/* Info personali */}
          <Card>
            <SectionTitle className="mb-5">Chi sei</SectionTitle>
            <div className="space-y-4">
              <Field label="Nome">
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  className={inputClass} placeholder="Come ti chiami?" required />
              </Field>
              <Field label="Età" optional>
                <input type="number" value={eta} onChange={(e) => setEta(e.target.value)}
                  className={inputClass} placeholder="Es. 35" min="13" max="120" />
              </Field>
            </div>
          </Card>

          {/* Cammino */}
          <Card>
            <SectionTitle className="mb-1">Il tuo cammino</SectionTitle>
            <p className="text-xs text-muted mb-5 px-1">Queste parole aiutano La Guida a starti accanto.</p>
            <div className="space-y-4">
              <Field label="Cosa cerchi in questo percorso">
                <textarea value={obiettivi} onChange={(e) => setObiettivi(e.target.value)}
                  className={`${inputClass} resize-none`} placeholder="Ritrovare pace, capire il Vangelo, ascoltarmi…" rows={3} />
              </Field>
              <Field label="Passioni e interessi">
                <input type="text" value={passioni} onChange={(e) => setPassioni(e.target.value)}
                  className={inputClass} placeholder="Cosa ti appassiona?" />
              </Field>
              <Field label="Il tuo sogno">
                <input type="text" value={sogno} onChange={(e) => setSogno(e.target.value)}
                  className={inputClass} placeholder="Qual è il tuo sogno più grande?" />
              </Field>
              <Field label="Dove ti trovi ora nella vita">
                <textarea value={situazioneAttuale} onChange={(e) => setSituazioneAttuale(e.target.value)}
                  className={`${inputClass} resize-none`} placeholder="Un momento di cambiamento, di attesa, di ricerca…" rows={3} />
              </Field>
            </div>
          </Card>

          {/* Telegram */}
          <Card>
            <div className="flex items-center gap-3 mb-1">
              <SectionTitle className="mb-0">La Guida su Telegram</SectionTitle>
            </div>
            <p className="text-xs text-muted mb-4 px-1">Facoltativo. Per parlarle anche fuori dall&apos;app.</p>

            <div className="bg-paper-warm border border-line rounded-xl p-4 text-sm text-ink-soft mb-4">
              <p className="font-medium text-ink mb-2">Come trovare il tuo ID Telegram</p>
              <ol className="space-y-1.5">
                {[
                  <>Apri Telegram e cerca <strong className="text-ink">@getidsbot</strong></>,
                  <>Scrivigli qualsiasi messaggio</>,
                  <>Copia il numero che ti risponde e incollalo qui sotto</>,
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-serif text-gold text-lg leading-none mt-[-1px] w-3">{i + 1}</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Field label="Il tuo ID Telegram" hint="Una volta salvato, cerca il bot The Way su Telegram e inizia a scrivere.">
              <div className="relative">
                <Send className="w-4 h-4 text-faint absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2} />
                <input type="text" value={telegramId} onChange={(e) => setTelegramId(e.target.value)}
                  autoComplete="off" className={`${inputClass} pl-11`} placeholder="Es. 766672351" />
              </div>
            </Field>
          </Card>

          <Button type="submit" full size="lg" disabled={saving} variant={success ? 'gold' : 'primary'}>
            {success ? <Check strokeWidth={2.5} /> : null}
            {saving ? 'Salvo…' : success ? 'Salvato' : 'Salva le modifiche'}
          </Button>

          <div className="pt-2 space-y-3">
            <Button type="button" variant="danger" full onClick={handleLogout}>
              <LogOut strokeWidth={2} />
              Esci dall&apos;account
            </Button>
            <p className="text-center">
              <a href="/privacy" target="_blank" rel="noopener noreferrer"
                className="text-xs text-muted hover:text-ink underline underline-offset-4">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
