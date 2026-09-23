'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandCross from '@/components/BrandCross';
import { Button, Field, inputClass, Notice, Ornament } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('*').eq('user_id', data.user.id).single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError('Account non trovato. Devi prima registrarti.');
        setLoading(false);
        setTimeout(() => router.push('/register'), 2000);
        return;
      }

      if (!profile.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-night relative overflow-hidden flex flex-col items-center justify-center px-5 py-10">
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-gold-light/10 blur-3xl pointer-events-none animate-breathe" aria-hidden />

      {/* ── Brand ── */}
      <div className="relative text-center mb-8 w-full max-w-sm animate-rise">
        <BrandCross tone="night" className="mx-auto mb-4" size={64} />
        <h1 className="font-serif text-[44px] leading-none font-semibold text-night-text tracking-tight">
          The Way
        </h1>
        <p className="text-gold-light font-semibold text-[11px] mt-2 uppercase tracking-[0.28em]">
          La Via del Cuore
        </p>

        <Ornament tone="night" className="my-6 max-w-[200px] mx-auto" />

        <p className="font-serif italic text-night-text text-xl leading-snug">
          «Io sono la via, la verità e la vita.»
        </p>
        <p className="text-[11px] text-night-muted mt-2 uppercase tracking-[0.18em]">Giovanni 14,6</p>
      </div>

      {/* ── Form ── */}
      <div className="relative bg-paper rounded-3xl shadow-[var(--shadow-float)] p-6 sm:p-7 w-full max-w-sm animate-rise delay-2">
        <h2 className="font-serif text-3xl font-semibold text-ink leading-none mb-1.5">Bentornato</h2>
        <p className="text-muted text-sm mb-6">Il tuo cammino ti aspetta.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <Notice tone="error">{error}</Notice>}

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="tua@email.com"
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>

          <Button type="submit" full size="lg" disabled={loading} className="mt-2">
            {loading ? 'Accesso in corso…' : 'Entra'}
            {!loading && <ArrowRight strokeWidth={2.2} />}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Non hai un account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-gold-deep hover:text-ink font-semibold underline underline-offset-4 decoration-gold/40"
          >
            Registrati
          </button>
        </p>
      </div>
    </main>
  );
}
