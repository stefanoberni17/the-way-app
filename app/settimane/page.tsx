'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUnlockedWeeks, isWeekUnlockedInBeta, getWeekLockMessage } from '@/lib/weekUnlockLogic';

interface Settimana {
  id: string;
  numero: number;
  settimana: string;
  titolo: string;
  tema: string;
  episodi: string;
  stato: string;
}

export default function SettimanaPage() {
  const router = useRouter();
  const [settimane, setSettimane] = useState<Settimana[]>([]);
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!profileData?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);

      const { data: completedEpisodes } = await supabase
        .from('user_episode_progress')
        .select('episode_number, completed')
        .eq('user_id', session.user.id)
        .eq('completed', true);

      const unlocked = getUnlockedWeeks(completedEpisodes || []);
      setUnlockedWeeks(unlocked);

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    fetch('/api/settimane')
      .then(res => res.json())
      .then(data => {
        const settimaneFiltered = (data.settimane || []).filter((s: Settimana) => s.numero <= 6).sort((a: Settimana, b: Settimana) => a.numero - b.numero);
        setSettimane(settimaneFiltered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Errore nel caricamento:', err);
        setLoading(false);
      });
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-blue-100">Verifica accesso...</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✝️</div>
          <p className="text-xl text-blue-100">Caricamento settimane...</p>
        </div>
      </main>
    );
  }

  const currentWeek = profile?.current_week || 1;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 px-4 pb-24">
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <span>📖</span>
          <span>Le Tue Settimane</span>
        </h1>
        <p className="text-gray-500 text-sm">
          {(() => {
            const count = unlockedWeeks.filter(w => w <= 2).length;
            return count === 1
              ? '1 settimana sbloccata · Beta: 2 disponibili'
              : `${count} settimane sbloccate · Beta: 2 disponibili`;
          })()}
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settimane.map((settimana) => {
          const isUnlocked = unlockedWeeks.includes(settimana.numero);
          const isCurrentWeek = settimana.numero === currentWeek;
          const isBetaLocked = !isWeekUnlockedInBeta(settimana.numero);
          const lockMessage = getWeekLockMessage(settimana.numero);

          if (isBetaLocked) {
            return (
              <div
                key={settimana.id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-gray-200 opacity-60"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full text-gray-500 bg-gray-100">
                    {settimana.settimana}
                  </span>
                  <span className="text-2xl">🔒</span>
                </div>

                <h3 className="text-lg font-bold mb-2 text-gray-400">
                  {settimana.titolo}
                </h3>

                <p className="text-sm mb-3 text-gray-400">
                  {settimana.tema}
                </p>

                <div className="text-xs border-t pt-3 text-gray-400">
                  ✝️ Passi: {settimana.episodi}
                </div>

                <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-xl">
                  <p className="text-xs text-amber-800 font-medium">
                    {lockMessage}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={settimana.id}
              onClick={() => isUnlocked && router.push(`/settimana/${settimana.id}?week=${settimana.numero}`)}
              className={`bg-white rounded-2xl shadow-sm p-6 transition-all border border-gray-100 border-l-4 ${
                isUnlocked
                  ? 'cursor-pointer hover:shadow-md'
                  : 'opacity-60 cursor-not-allowed'
              } ${
                isCurrentWeek
                  ? 'border-l-blue-600 ring-2 ring-blue-200'
                  : isUnlocked
                    ? 'border-l-green-500'
                    : 'border-l-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isCurrentWeek
                    ? 'text-blue-700 bg-blue-100'
                    : isUnlocked
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-500 bg-gray-100'
                }`}>
                  {settimana.settimana}
                  {isCurrentWeek && ' 📍'}
                </span>
                <span className="text-2xl">
                  {isUnlocked ? (isCurrentWeek ? '📖' : '✅') : '🔒'}
                </span>
              </div>

              <h3 className={`text-lg font-bold mb-2 ${
                isUnlocked ? 'text-gray-800' : 'text-gray-400'
              }`}>
                {settimana.titolo}
              </h3>

              <p className={`text-sm mb-3 leading-relaxed ${
                isUnlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {settimana.tema}
              </p>

              <div className={`text-xs border-t pt-3 ${
                isUnlocked ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ✝️ Passi: {settimana.episodi}
              </div>

              {!isUnlocked && (
                <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-xl">
                  🔒 Completa la settimana precedente per sbloccare
                </div>
              )}
            </div>
          );
        })}

        {/* Teaser versione completa */}
        <div className="md:col-span-2 lg:col-span-3 mt-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-dashed border-blue-200 rounded-2xl p-4 flex items-center gap-3 opacity-80">
            <span className="text-2xl">🔜</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Altre settimane in arrivo</p>
              <p className="text-xs text-blue-600 mt-0.5">Week 3 e oltre saranno disponibili nella versione completa del percorso. ✝️</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
