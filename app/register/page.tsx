'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandCross from '@/components/BrandCross';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Field, inputClass, Notice } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();

  // Step: 1 = account + dati base | 2 = percorso personale
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');

  const [obiettivi, setObiettivi] = useState('');
  const [passioni, setPassioni] = useState('');
  const [sogno, setSogno] = useState('');
  const [situazioneAttuale, setSituazioneAttuale] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }
    if (!nome.trim()) {
      setError('Il nome è obbligatorio');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Registrazione atomica server-side (vedi /api/register).
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: nome,
          age: eta || null,
          goals: obiettivi || null,
          passions: passioni || null,
          dream: sogno || null,
          current_situation: situazioneAttuale || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Errore registrazione');
      }

      setSuccess(true);

    } catch (error: any) {
      setError(error.message);
      console.error('Errore registrazione:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Successo ──
  if (success) {
    return (
      <main className="min-h-screen bg-night relative overflow-hidden flex flex-col items-center justify-center px-5 py-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-gold-light/10 blur-3xl pointer-events-none" aria-hidden />
        <div className="relative bg-paper rounded-3xl shadow-[var(--shadow-float)] p-7 w-full max-w-sm text-center animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-gold-soft text-gold-deep mx-auto mb-5 flex items-center justify-center">
            <Mail className="w-6 h-6" strokeWidth={1.8} />
          </div>
          <h2 className="font-serif text-3xl font-semibold text-ink mb-2 leading-tight">
            Controlla la tua email
          </h2>
          <p className="text-ink-soft text-sm leading-relaxed mb-5">
            Abbiamo inviato un link di conferma a{' '}
            <strong className="text-ink">{email}</strong>.
            Aprilo per attivare il tuo account, poi torna qui ad accedere.
          </p>

          <Notice className="text-left text-xs mb-6">
            <p className="text-ink font-medium mb-0.5">Non trovi l&apos;email?</p>
            Controlla la cartella Spam o Posta indesiderata. Se non arriva entro qualche minuto, riprova con una email diversa.
          </Notice>

          <Button full size="lg" onClick={() => router.push('/login')}>
            Vai all&apos;accesso
            <ArrowRight strokeWidth={2.2} />
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-night relative overflow-hidden py-10 px-5">
      <div className="absolute top-[-160px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-gold-light/10 blur-3xl pointer-events-none" aria-hidden />

      <div className="relative w-full max-w-sm mx-auto">

        {/* Brand */}
        <div className="text-center mb-6 animate-rise">
          <BrandCross tone="night" className="mx-auto mb-2" size={48} />
          <h1 className="font-serif text-3xl font-semibold text-night-text leading-none">The Way</h1>
          <p className="text-gold-light font-semibold text-[11px] mt-2 uppercase tracking-[0.28em]">
            La Via del Cuore
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6" aria-label={`Passo ${step} di 2`}>
          <div className={`h-1 rounded-full transition-all duration-300 ${step === 1 ? 'w-10 bg-gold-light' : 'w-2 bg-night-line'}`} />
          <div className={`h-1 rounded-full transition-all duration-300 ${step === 2 ? 'w-10 bg-gold-light' : 'w-2 bg-night-line'}`} />
        </div>

        {/* Card */}
        <div className="bg-paper rounded-3xl shadow-[var(--shadow-float)] p-6 sm:p-7 animate-rise delay-1">

          {error && <Notice tone="error" className="mb-5">{error}</Notice>}

          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="mb-2">
                <h2 className="font-serif text-3xl font-semibold text-ink leading-none mb-1.5">Crea il tuo account</h2>
                <p className="text-muted text-sm">Ci vuole meno di un minuto.</p>
              </div>

              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass} placeholder="tua@email.com" autoComplete="email" required />
              </Field>

              <Field label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className={inputClass} placeholder="Minimo 6 caratteri" autoComplete="new-password" required />
              </Field>

              <Field label="Conferma password">
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass} placeholder="Ripeti la password" autoComplete="new-password" required />
              </Field>

              <div className="border-t border-line pt-4 space-y-4">
                <Field label="Come ti chiami?">
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                    className={inputClass} placeholder="Il tuo nome" autoComplete="given-name" required />
                </Field>

                <Field label="Età" optional>
                  <input type="number" value={eta} onChange={(e) => setEta(e.target.value)}
                    className={inputClass} placeholder="Es. 35" min="13" max="120" />
                </Field>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  required
                  className="mt-0.5 w-4 h-4 accent-[#b8862b] shrink-0 cursor-pointer"
                />
                <label htmlFor="privacy-consent" className="text-xs text-muted leading-relaxed cursor-pointer">
                  Ho letto e accetto la{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-gold-deep hover:text-ink underline underline-offset-2">
                    Privacy Policy
                  </a>
                  . Acconsento al salvataggio dei miei dati per personalizzare il percorso.
                </label>
              </div>

              <Button type="submit" full size="lg" className="mt-2">
                Continua
                <ArrowRight strokeWidth={2.2} />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="mb-2">
                <h2 className="font-serif text-3xl font-semibold text-ink leading-none mb-1.5">Il tuo cammino</h2>
                <p className="text-muted text-sm leading-relaxed">
                  Queste parole aiutano La Guida a starti accanto. Puoi saltarle e aggiungerle dopo dal profilo.
                </p>
              </div>

              <Field label="Cosa stai cercando in questo percorso?" optional>
                <textarea value={obiettivi} onChange={(e) => setObiettivi(e.target.value)}
                  className={`${inputClass} resize-none`} placeholder="Ritrovare la fede, trovare pace, capire il Vangelo…" rows={3} />
              </Field>

              <Field label="Passioni e interessi" optional>
                <input type="text" value={passioni} onChange={(e) => setPassioni(e.target.value)}
                  className={inputClass} placeholder="Meditazione, famiglia, musica, natura…" />
              </Field>

              <Field label="Il tuo sogno più grande" optional>
                <input type="text" value={sogno} onChange={(e) => setSogno(e.target.value)}
                  className={inputClass} placeholder="Vivere con più pace, essere un punto fermo…" />
              </Field>

              <Field label="Dove ti trovi ora nella vita?" optional>
                <textarea value={situazioneAttuale} onChange={(e) => setSituazioneAttuale(e.target.value)}
                  className={`${inputClass} resize-none`} placeholder="Un momento di cambiamento, di ricerca…" rows={2} />
              </Field>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" size="lg" className="flex-1"
                  onClick={() => { setStep(1); setError(''); }}>
                  <ArrowLeft strokeWidth={2} />
                  Indietro
                </Button>
                <Button type="submit" variant="gold" size="lg" className="flex-1" disabled={loading}>
                  {loading ? 'Creazione…' : 'Inizia il cammino'}
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-night-muted">
          Hai già un account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-gold-light hover:text-night-text font-semibold underline underline-offset-4 decoration-gold-light/40"
          >
            Accedi
          </button>
        </p>
      </div>
    </main>
  );
}
