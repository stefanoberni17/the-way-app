'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useMeditation } from '@/components/MeditationContext';

const WEEK_NAMES: Record<number, string> = {
  1: 'La voce nel deserto',
  2: 'La voce nel deserto',
  3: 'Il silenzio di Nazaret',
  4: 'Il silenzio di Nazaret',
  5: 'La voce che chiama',
  6: 'La voce che chiama',
};

const WEEK_IDS: Record<number, string> = {
  1: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // Week 1-2
  2: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  3: '316655f7-26c7-8148-b5f4-f58ca267545a',  // Week 3-4
  4: '316655f7-26c7-8148-b5f4-f58ca267545a',
  5: '316655f7-26c7-8131-b21d-ff3daa9eee74',  // Week 5-6
  6: '316655f7-26c7-8131-b21d-ff3daa9eee74',
};

const DAY_KEYS = [
  'day1','day2','day3','day4','day5','day6','day7',
] as const;
type DayKey = typeof DAY_KEYS[number];

const DAY_LABELS: Record<string, string> = {
  day1:'Lun', day2:'Mar', day3:'Mer', day4:'Gio', day5:'Ven', day6:'Sab', day7:'Dom',
};

export default function HomePage() {
  const router = useRouter();
  const { openMeditation } = useMeditation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedEpisodes, setCompletedEpisodes] = useState(0);
  const [weekData, setWeekData] = useState<any>(null);
  const [practices, setPractices] = useState<any[]>([]);
  const [loadingPractices, setLoadingPractices] = useState(false);
  const [practicesVisible, setPracticesVisible] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).single();

      if (!profileData?.onboarding_completed) { router.push('/onboarding'); return; }
      setProfile(profileData);

      const { count } = await supabase
        .from('user_episode_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('completed', true);
      setCompletedEpisodes(count || 0);

      const currentWeek = profileData?.current_week || 1;
      const weekId = WEEK_IDS[currentWeek];
      if (weekId) {
        const response = await fetch(`/api/settimana?id=${weekId}`);
        const data = await response.json();
        setWeekData(data);
      }
      loadPractices(session.user.id, currentWeek);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const loadPractices = async (userId: string, weekNumber: number) => {
    setLoadingPractices(true);
    try {
      const response = await fetch(`/api/practices?userId=${userId}&weekNumber=${weekNumber}`);
      const data = await response.json();
      setPractices(data.practices || []);
    } catch (error) {
      console.error('Errore caricamento pratiche:', error);
    } finally {
      setLoadingPractices(false);
    }
  };

  const togglePracticeDay = async (practiceNumber: number, day: DayKey) => {
    const practice = practices.find(p => p.practice_number === practiceNumber);
    if (!practice) return;
    const currentValue = practice.completed_days[day];
    const newValue = !currentValue;

    setPractices(prev => prev.map(p =>
      p.practice_number === practiceNumber
        ? { ...p, completed_days: { ...p.completed_days, [day]: newValue } }
        : p
    ));

    try {
      await fetch('/api/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          weekNumber: profile.current_week,
          practiceNumber,
          day,
          completed: newValue,
        }),
      });
    } catch (error) {
      console.error('Errore salvataggio pratica:', error);
      setPractices(prev => prev.map(p =>
        p.practice_number === practiceNumber
          ? { ...p, completed_days: { ...p.completed_days, [day]: currentValue } }
          : p
      ));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-slate-300 font-serif">Caricamento...</p>
        </div>
      </main>
    );
  }

  const currentWeek = profile?.current_week || 1;
  const BETA_MAX_EPISODE = 24;
  const progressPercentage = Math.round((completedEpisodes / BETA_MAX_EPISODE) * 100);

  const properties = weekData?.page?.properties || {};
  const pratiche = (properties.Pratiche?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const mantra = (properties.Mantra?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const practicheArray = pratiche.split('\n').filter((p: string) => p.trim().length > 0);

  const nextEpisode = completedEpisodes + 1;
  const isAllDone = completedEpisodes >= BETA_MAX_EPISODE;

  return (
    <main className="min-h-screen bg-stone-50 pb-24">

      {/* ── Top header ── */}
      <div className="bg-slate-900 px-5 pt-10 pb-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">✝ The Way</p>
          <h1 className="text-2xl font-bold text-white mb-0.5">
            Ciao, {profile?.name || 'pellegrino'} 🙏
          </h1>
          <p className="text-slate-400 text-sm">
            Week {currentWeek} · {WEEK_NAMES[currentWeek] || `Week ${currentWeek}`}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-3">

        {/* ── Versetto hero ── */}
        {mantra ? (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mb-5">
            {/* Decorazione top amber */}
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
            <div className="p-6">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>📖</span> Versetto della Settimana
              </p>
              <blockquote className="text-gray-800 text-lg font-serif leading-relaxed italic mb-4 whitespace-pre-line">
                &ldquo;{mantra}&rdquo;
              </blockquote>

              {/* CTA Passo */}
              {isAllDone ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium text-amber-800 text-center">
                  🏆 Hai completato tutti i passi della Beta — stay tuned ✝️
                </div>
              ) : (
                <button
                  onClick={() => {
                    // First episode of each week → show week overview page first
                    const WEEK_FIRST_EPISODES = new Set([1, 7, 13, 19]);
                    if (WEEK_FIRST_EPISODES.has(nextEpisode)) {
                      router.push(`/settimana/${WEEK_IDS[currentWeek]}?week=${currentWeek}`);
                    } else {
                      router.push(`/episodio/${nextEpisode}`);
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold py-3 px-5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm mb-3"
                >
                  <span>▶</span>
                  <span>{completedEpisodes === 0 ? 'Inizia: Passo 1' : `Continua: Passo ${nextEpisode}`}</span>
                </button>
              )}

              <button
                onClick={openMeditation}
                className="w-full flex items-center justify-center gap-2 border-2 border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold py-2.5 px-5 rounded-xl transition-all text-sm"
              >
                <span>🙏</span>
                <span>Momento di preghiera e respiro</span>
              </button>
            </div>
          </div>
        ) : (
          /* Fallback se non c'è versetto */
          !isAllDone && (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 mb-5">
              <button
                onClick={() => {
                  const WEEK_FIRST_EPISODES = new Set([1, 7, 13, 19]);
                  if (WEEK_FIRST_EPISODES.has(nextEpisode)) {
                    router.push(`/settimana/${WEEK_IDS[currentWeek]}?week=${currentWeek}`);
                  } else {
                    router.push(`/episodio/${nextEpisode}`);
                  }
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>▶</span>
                <span>{completedEpisodes === 0 ? 'Inizia: Passo 1' : `Continua: Passo ${nextEpisode}`}</span>
              </button>
            </div>
          )
        )}

        {/* ── Pratiche della settimana ── */}
        {practicheArray.length > 0 && (
          <div className="mb-5">
            <button
              className="flex items-center justify-between w-full mb-3 px-1"
              onClick={() => setPracticesVisible(v => !v)}
            >
              <h2 className="text-sm font-bold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                🌿 Pratiche della Settimana
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">7 giorni</span>
                <span className="text-stone-400 text-sm">{practicesVisible ? '▲' : '▼'}</span>
              </div>
            </button>

            {practicesVisible && (
              <div className="space-y-3">
                {practicheArray.slice(0, 3).map((praticaText: string, index: number) => {
                  const practice = practices.find(p => p.practice_number === index + 1);
                  const completedDays = practice?.completed_days || {};
                  const completedCount = DAY_KEYS.filter(day => completedDays[day]).length;
                  const percentage = Math.round((completedCount / 14) * 100);
                  const isComplete = completedCount === 14;

                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-2xl shadow-sm border transition-all ${
                        isComplete ? 'border-green-200' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4 pb-3">
                        <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isComplete ? 'bg-green-500' : 'bg-amber-600'
                        }`}>
                          {isComplete ? '✓' : index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 leading-snug">{praticaText}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold flex-shrink-0 ${
                              isComplete ? 'text-green-600' : 'text-stone-400'
                            }`}>
                              {completedCount}/7
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <div className="flex gap-1">
                          {DAY_KEYS.map(day => (
                            <button
                              key={day}
                              onClick={() => togglePracticeDay(index + 1, day)}
                              disabled={loadingPractices}
                              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                                completedDays[day]
                                  ? 'bg-amber-500 text-white shadow-sm'
                                  : 'bg-stone-50 text-stone-400 border border-stone-200 hover:border-amber-300 hover:bg-amber-50'
                              } disabled:opacity-50`}
                            >
                              <span className="text-[9px] font-medium opacity-70">{DAY_LABELS[day]}</span>
                              <span>{completedDays[day] ? '✓' : ''}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-stone-400 mt-2 text-center">
                  💡 Il tracker è solo per te — non influenza il percorso
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Progresso ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-6">
          <div className="h-0.5 w-8 bg-amber-400 rounded-full mb-3" />
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-1">
            Il Tuo Cammino
          </h2>
          <p className="text-stone-500 text-sm mb-5">
            Progresso nel percorso Beta
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-stone-50 border border-stone-200 border-l-4 border-l-amber-500 p-3 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{completedEpisodes}</div>
              <div className="text-xs text-stone-500">Completati</div>
            </div>
            <div className="bg-stone-50 border border-stone-200 border-l-4 border-l-slate-500 p-3 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{BETA_MAX_EPISODE}</div>
              <div className="text-xs text-stone-500">Passi Beta</div>
            </div>
            <div className="bg-stone-50 border border-stone-200 border-l-4 border-l-green-500 p-3 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{progressPercentage}%</div>
              <div className="text-xs text-stone-500">Progresso</div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-sm text-stone-500 mb-2">
              <span>Avanzamento Beta</span>
              <span>{completedEpisodes}/{BETA_MAX_EPISODE} passi</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => router.push('/settimane')}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm"
          >
            📖 Esplora le Settimane
          </button>
        </div>

      </div>
    </main>
  );
}
