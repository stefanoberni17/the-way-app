'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandCross from '@/components/BrandCross';
import { Mail } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Step: 1 = account + dati base | 2 = percorso personale
  const [step, setStep] = useState(1);

  // Step 1 — account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');

  // Step 2 — percorso (tutti opzionali)
  const [obiettivi, setObiettivi] = useState('');
  const [passioni, setPassioni] = useState('');
  const [sogno, setSogno] = useState('');
  const [situazioneAttuale, setSituazioneAttuale] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Validazione step 1 e avanzamento ──
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

  // ── Submit finale ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Registrazione atomica server-side (vedi /api/register):
      //  - signUp con client anon (Supabase invia email conferma)
      //  - upsert profilo con service_role (bypassa RLS)
      // Lo facciamo server-side perché subito dopo signUp NON c'è ancora una
      // sessione attiva (è richiesta la conferma email), quindi auth.uid() è
      // null e le policy RLS su profiles bloccherebbero l'upsert client-side.
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

      console.log('✅ Utente + profilo creati:', data.userId);
      setSuccess(true);

    } catch (error: any) {
      setError(error.message);
      console.error('❌ Errore registrazione:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Schermata successo ──
  if (success) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 py-10 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-md border border-stone-200/60 p-7 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-7 h-7 text-amber-700" strokeWidth={1.75} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Controlla la tua email
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-5">
            Abbiamo inviato un link di conferma a{' '}
            <strong className="text-slate-900">{email}</strong>.
            <br />
            Clicca il link per attivare il tuo account, poi torna qui ad accedere.
          </p>

          {/* Avviso spam */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 mb-6 text-left">
            <p className="text-slate-900 text-xs font-semibold mb-0.5">
              Non trovi l&apos;email?
            </p>
            <p className="text-stone-600 text-xs leading-relaxed">
              Controlla la cartella <strong>Spam</strong> o{' '}
              <strong>Posta indesiderata</strong> — a volte ci finisce per errore.
              Se non arriva entro qualche minuto, riprova con una email diversa.
            </p>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm"
          >
            Vai al Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 py-10 px-5 overflow-y-auto">
      <div className="w-full max-w-sm mx-auto">

        {/* ── Header brand ── */}
        <div className="text-center mb-6">
          <BrandCross className="mx-auto mb-2" size={48} />
          <h1 className="text-xl font-serif font-bold text-white">The Way</h1>
          <p className="text-amber-400 font-semibold text-[11px] mt-1 uppercase tracking-[0.2em]">
            La Via del Cuore
          </p>
        </div>

        {/* ── Step indicator: solo dots, niente label che troncavano su mobile ── */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 1 ? 'w-10 bg-amber-400' : 'w-2 bg-white/30'
            }`}
            aria-label="Passo 1"
          />
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === 2 ? 'w-10 bg-amber-400' : 'w-2 bg-white/30'
            }`}
            aria-label="Passo 2"
          />
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-xl shadow-md border border-stone-200/60 p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          {/* ════ STEP 1 ════ */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">Crea il tuo account</h2>
                <p className="text-stone-500 text-sm mt-0.5 italic">Ti vuole meno di un minuto.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="tua@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="Minimo 6 caratteri"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Conferma password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="Ripeti la password"
                  required
                />
              </div>

              <div className="border-t border-stone-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Come ti chiami? *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="Il tuo nome"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Età{' '}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <input
                  type="number"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="Es. 30"
                  min="13"
                  max="120"
                />
              </div>

              {/* Consenso privacy */}
              <div className="flex items-start gap-3 pt-1">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  required
                  className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0 cursor-pointer"
                />
                <label htmlFor="privacy-consent" className="text-xs text-stone-500 leading-relaxed cursor-pointer">
                  Ho letto e accetto la{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:text-amber-800 underline"
                  >
                    Privacy Policy
                  </a>
                  . Acconsento al salvataggio dei miei dati per personalizzare il percorso.
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
              >
                Continua →
              </button>
            </form>
          )}

          {/* ════ STEP 2 ════ */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h2 className="text-lg font-serif font-bold text-slate-900">Il tuo percorso</h2>
                <p className="text-stone-500 text-sm mt-0.5 leading-relaxed">
                  Queste info aiutano La Guida a personalizzare la tua esperienza.
                  Puoi saltarle e aggiungerle dopo dal profilo.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cosa stai cercando in questo percorso?{' '}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <textarea
                  value={obiettivi}
                  onChange={(e) => setObiettivi(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50 resize-none"
                  placeholder="Es. Ritrovare la fede, trovare pace interiore, capire il Vangelo…"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Passioni e interessi{' '}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <input
                  type="text"
                  value={passioni}
                  onChange={(e) => setPassioni(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="Es. Meditazione, famiglia, musica, natura…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Il tuo sogno più grande{' '}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <input
                  type="text"
                  value={sogno}
                  onChange={(e) => setSogno(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50"
                  placeholder="Es. Vivere con più pace, essere un punto di riferimento…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Dove ti trovi ora nella vita?{' '}
                  <span className="text-gray-400 font-normal">(opzionale)</span>
                </label>
                <textarea
                  value={situazioneAttuale}
                  onChange={(e) => setSituazioneAttuale(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none text-sm bg-stone-50 resize-none"
                  placeholder="Es. Momento di cambiamento, cerco senso e direzione…"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition-all"
                >
                  ← Indietro
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Creazione…' : 'Inizia il cammino'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Link login */}
        <p className="mt-5 text-center text-sm text-white/70">
          Hai già un account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            Accedi
          </button>
        </p>
      </div>
    </main>
  );
}
