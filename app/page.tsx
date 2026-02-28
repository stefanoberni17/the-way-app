'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useMeditation } from '@/components/MeditationContext';

const WEEK_NAMES: Record<number, string> = {
  1: 'Week 1-2 - La voce nel deserto',
  2: 'Week 1-2 - La voce nel deserto',
  3: 'Week 3-4 - Le tentazioni',
  4: 'Week 3-4 - Le tentazioni',
  5: 'Week 5-6 - La chiamata',
  6: 'Week 5-6 - La chiamata',
};

// The Way — Notion page IDs per ogni coppia di settimane
const WEEK_IDS: Record<number, string> = {
  1: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // Week 1-2 — La voce nel deserto
  2: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  3: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // placeholder — da aggiornare quando Week 3-4 è pronta
  4: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  5: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // placeholder
  6: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
};

const DAY_LABELS: Record<string, string> = {
  day1: '1', day2: '2', day3: '3', day4: '4', day5: '5', day6: '6', day7: '7',
  day8: '8', day9: '9', day10: '10', day11: '11', day12: '12', day13: '13', day14: '14',
};

const DAY_KEYS = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7', 'day8', 'day9', 'day10', 'day11', 'day12', 'day13', 'day14'] as const;
type DayKey = typeof DAY_KEYS[number];

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

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // Redirect onboarding se non completato
      if (!profileData?.onboarding_completed) {
        router.push('/onboarding');
        return;
      }

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
      <main className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-blue-100">Caricamento...</p>
        </div>
      </main>
    );
  }

  const currentWeek = profile?.current_week || 1;
  const BETA_MAX_EPISODE = 4;
  const progressPercentage = Math.round((completedEpisodes / BETA_MAX_EPISODE) * 100);

  const properties = weekData?.page?.properties || {};
  const pratiche = (properties.Pratiche?.rich_text?.[0]?.plain_text || '')
    .replace(/<br>/g, '\n');
  const mantra = (properties.Mantra?.rich_text?.[0]?.plain_text || '')
    .replace(/<br>/g, '\n');

  const practicheArray = pratiche.split('\n').filter((p: string) => p.trim().length > 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 px-4 pb-24">
      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">✝️</span>
          <h1 className="text-2xl font-bold text-gray-800">
            Ciao, {profile?.name || 'pellegrino'}!
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-10">
          Bentornato nel tuo percorso — The Way
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ── Banner prossimo passo ── */}
        {(() => {
          const nextEpisode = completedEpisodes + 1;
          const isAllDone = completedEpisodes >= BETA_MAX_EPISODE;
          return (
            <div className="bg-gradient-to-r from-blue-800 to-indigo-700 rounded-2xl shadow-lg p-6 mb-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wide">📍 Sei qui</p>
                  <h2 className="text-xl font-bold leading-snug">
                    {WEEK_NAMES[currentWeek] || `Week ${currentWeek}`}
                  </h2>
                </div>
                <div className="text-4xl opacity-90">✝️</div>
              </div>
              {isAllDone ? (
                <div className="bg-white/20 rounded-xl px-4 py-3 text-sm font-medium text-white text-center">
                  🏆 Hai completato tutti i passi della Beta! Stay tuned ✝️
                </div>
              ) : (
                <button
                  onClick={() => {
                    // Primo passo: mostra prima la settimana per introdurre il tema
                    if (nextEpisode === 1) {
                      router.push(`/settimana/${WEEK_IDS[currentWeek]}`);
                    } else {
                      router.push(`/episodio/${nextEpisode}`);
                    }
                  }}
                  className="w-full sm:w-auto bg-white text-blue-800 font-bold py-2.5 px-5 rounded-xl hover:bg-blue-50 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>▶</span>
                  <span>{completedEpisodes === 0 ? 'Inizia: Passo 1' : `Continua: Passo ${nextEpisode}`}</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* ── Versetto / Mantra della settimana ── */}
        {mantra && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-xl mb-3">
              <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                <span>📖</span>
                <span>Versetto della Settimana</span>
              </h3>
              <p className="text-blue-900 text-base italic font-medium whitespace-pre-line leading-relaxed">
                &ldquo;{mantra}&rdquo;
              </p>
            </div>
            <button
              onClick={openMeditation}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md"
            >
              <span>🙏</span>
              <span>Momento di preghiera e respiro</span>
            </button>
          </div>
        )}

        {/* ── Pratiche della settimana ── */}
        {practicheArray.length > 0 && (
          <div className="mb-6">
            <button
              className="flex items-center justify-between w-full mb-3"
              onClick={() => setPracticesVisible(v => !v)}
            >
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                🌿 Pratiche della settimana
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">tracker 14 giorni</span>
                <span className="text-gray-400 text-sm">{practicesVisible ? '▲' : '▼'}</span>
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
                        isComplete ? 'border-green-200' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4 pb-3">
                        <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isComplete ? 'bg-green-500' : 'bg-blue-600'
                        }`}>
                          {isComplete ? '✓' : index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 leading-snug">{praticaText}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold flex-shrink-0 ${
                              isComplete ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {completedCount}/14
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 space-y-1.5">
                        {[DAY_KEYS.slice(0, 7), DAY_KEYS.slice(7, 14)].map((week, wi) => (
                          <div key={wi} className="flex items-center gap-1">
                            <span className="text-xs text-gray-300 w-8 flex-shrink-0">
                              S{wi + 1}
                            </span>
                            <div className="flex gap-1 flex-1">
                              {week.map(day => (
                                <button
                                  key={day}
                                  onClick={() => togglePracticeDay(index + 1, day)}
                                  disabled={loadingPractices}
                                  className={`flex-1 h-7 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                                    completedDays[day]
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                  } disabled:opacity-50`}
                                >
                                  {completedDays[day] ? '✓' : DAY_LABELS[day]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <p className="text-xs text-gray-400 mt-2 text-center">
                  💡 Il tracker è solo per te — non influenza il percorso
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Progresso ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            🗺️ Il Tuo Cammino
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Traccia i tuoi progressi attraverso i Passi del percorso Beta
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-xl">
              <div className="text-2xl font-bold text-blue-700">{completedEpisodes}</div>
              <div className="text-xs text-gray-500">Completati</div>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600">{BETA_MAX_EPISODE}</div>
              <div className="text-xs text-gray-500">Passi Beta</div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{progressPercentage}%</div>
              <div className="text-xs text-gray-500">Progresso</div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Avanzamento Beta</span>
              <span>{completedEpisodes}/{BETA_MAX_EPISODE} passi</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => router.push('/settimane')}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all w-full sm:w-auto"
          >
            📖 Esplora le Settimane
          </button>
        </div>
      </div>
    </main>
  );
}
