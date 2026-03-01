'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-5">

      {/* ── Hero brand ── */}
      <div className="text-center mb-8 w-full max-w-sm">
        <div className="text-5xl mb-4">✝️</div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          The Way
        </h1>
        <p className="text-amber-400 font-semibold text-xs mt-1 uppercase tracking-widest">
          La Via del Cuore
        </p>

        <div className="mt-5 bg-white/8 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/12">
          <p className="text-slate-300 text-sm leading-relaxed italic font-serif">
            &ldquo;Io sono la Via, la Verità e la Vita.&rdquo;
            <br />
            <span className="text-amber-400 text-xs not-italic font-sans">— Giovanni 14,6</span>
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-0.5">Bentornato!</h2>
        <p className="text-stone-500 text-sm mb-6">Il tuo percorso ti aspetta.</p>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-sm bg-stone-50"
              placeholder="tua@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-sm bg-stone-50"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          Non hai un account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-amber-700 hover:text-amber-800 font-semibold"
          >
            Registrati
          </button>
        </p>
      </div>
    </main>
  );
}
