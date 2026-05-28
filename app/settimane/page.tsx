'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUnlockedWeeks, isWeekUnlockedInBeta, getWeekLockMessage, BETA_MAX_WEEK } from '@/lib/weekUnlockLogic';

interface SingleWeek {
  id: string;         // Notion page ID (singolo per settimana)
  numero: number;     // 1, 2, 3, 4...
  settimana: string;  // "Settimana 1"
  titolo: string;
  tema: string;
  episodi: string;    // "1–7" etc.
  stato: string;
}

// Una pagina Notion = una settimana singola (7 passi).
function toSingleWeek(page: any): SingleWeek {
  const wn = page.numero;
  const start = (wn - 1) * 7 + 1;
  return {
    id: page.id,
    numero: wn,
    settimana: `Settimana ${wn}`,
    titolo: page.titolo,
    tema: page.tema,
    episodi: `${start}–${start + 6}`,
    stato: page.stato,
  };
}

export default function SettimanaPage() {
  const router = useRouter();
  const [settimane, setSettimane] = useState<SingleWeek[]>([]);
  const [unlockedWeeks, setUnlockedWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).single();

      if (!profileData?.onboarding_completed) { router.push('/onboarding'); return; }
      setProfile(profileData);

      const { data: completedEpisodes } = await supabase
        .from('user_episode_progress')
        .select('episode_number, completed')
        .eq('user_id', session.user.id)
        .eq('completed', true);

      setUnlockedWeeks(getUnlockedWeeks(completedEpisodes || []));
      setCheckingAuth(false);
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    fetch('/api/settimane')
      .then(res => res.json())
      .then(data => {
        // Una pagina Notion per settimana singola; le bundled archiviate hanno Numero >= 90.
        const weeks = (data.settimane || [])
          .filter((s: any) => s.numero >= 1 && s.numero <= 8)
          .sort((a: any, b: any) => a.numero - b.numero)
          .map(toSingleWeek);
        setSettimane(weeks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [checkingAuth]);

  if (checkingAuth || loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✝️</div>
          <p className="text-xl text-slate-300 font-serif">Caricamento settimane...</p>
        </div>
      </main>
    );
  }

  const currentWeek = profile?.current_week || 1;

  return (
    <main className="min-h-screen bg-stone-50 pb-24">

      {/* Header navy */}
      <div className="bg-slate-900 px-5 pt-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">✝ The Way</p>
          <h1 className="text-2xl font-serif font-bold text-white">
            Il Percorso
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {(() => {
              const count = unlockedWeeks.filter(w => w <= BETA_MAX_WEEK).length;
              return `${count} settiman${count === 1 ? 'a sbloccata' : 'e sbloccate'} · Beta: ${BETA_MAX_WEEK} disponibili`;
            })()}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settimane.map((settimana) => {
            const isUnlocked = unlockedWeeks.includes(settimana.numero);
            const isCurrentWeek = settimana.numero === currentWeek;
            const isBetaLocked = !isWeekUnlockedInBeta(settimana.numero);
            const lockMessage = getWeekLockMessage(settimana.numero);

            if (isBetaLocked) {
              return (
                <div key={settimana.numero} className="bg-white rounded-2xl shadow-sm p-6 border border-stone-200 border-l-4 border-l-stone-200 opacity-50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full text-stone-500 bg-stone-100">
                      {settimana.settimana}
                    </span>
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold mb-2 text-stone-400">{settimana.titolo}</h3>
                  <p className="text-sm mb-3 text-stone-400">{settimana.tema}</p>
                  <div className="text-xs border-t border-stone-100 pt-3 text-stone-400">
                    ✝️ Passi: {settimana.episodi}
                  </div>
                  <div className="mt-3 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-xl">
                    <p className="text-xs text-amber-800 font-medium">{lockMessage}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={settimana.numero}
                onClick={() => isUnlocked && router.push(`/settimana/${settimana.id}?week=${settimana.numero}`)}
                className={`bg-white rounded-2xl shadow-sm p-6 transition-all border border-stone-200 border-l-4 ${
                  isUnlocked ? 'cursor-pointer hover:shadow-md' : 'opacity-60 cursor-not-allowed'
                } ${
                  isCurrentWeek
                    ? 'border-l-amber-600 ring-2 ring-amber-100'
                    : isUnlocked
                    ? 'border-l-green-500'
                    : 'border-l-stone-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isCurrentWeek
                      ? 'text-amber-800 bg-amber-100'
                      : isUnlocked
                      ? 'text-green-700 bg-green-100'
                      : 'text-stone-500 bg-stone-100'
                  }`}>
                    {settimana.settimana}
                    {isCurrentWeek && ' 📍'}
                  </span>
                  <span className="text-2xl">
                    {isUnlocked ? (isCurrentWeek ? '📖' : '✅') : '🔒'}
                  </span>
                </div>

                <h3 className={`text-lg font-serif font-bold mb-2 ${isUnlocked ? 'text-gray-800' : 'text-stone-400'}`}>
                  {settimana.titolo}
                </h3>
                <p className={`text-sm mb-3 leading-relaxed ${isUnlocked ? 'text-stone-600' : 'text-stone-400'}`}>
                  {settimana.tema}
                </p>
                <div className={`text-xs border-t pt-3 ${isUnlocked ? 'text-stone-500 border-stone-100' : 'text-stone-400 border-stone-100'}`}>
                  ✝️ Passi: {settimana.episodi}
                </div>

                {!isUnlocked && (
                  <div className="mt-3 text-xs text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-100">
                    🔒 Completa la settimana precedente per sbloccare
                  </div>
                )}
              </div>
            );
          })}

          {/* Teaser */}
          <div className="md:col-span-2 mt-1">
            <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-dashed border-amber-200 rounded-2xl p-4 flex items-center gap-3 opacity-80">
              <span className="text-2xl">🔜</span>
              <div>
                <p className="text-sm font-semibold text-amber-900">Altre settimane in arrivo</p>
                <p className="text-xs text-amber-700 mt-0.5">Week {BETA_MAX_WEEK + 1} e oltre saranno disponibili nella versione completa. ✝️</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
