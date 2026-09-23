'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useMeditation } from '@/components/MeditationContext';
import DailyVerseCard from '@/components/DailyVerseCard';
import DailyInvitationCard from '@/components/DailyInvitationCard';
import EveningCheckinCard from '@/components/EveningCheckinCard';
import EveningReminderBanner from '@/components/EveningReminderBanner';
import { WEEK_IDS, WEEK_NAMES } from '@/lib/weekIds';
import { BETA_MAX_EPISODE } from '@/lib/weekUnlockLogic';
import { Card, Eyebrow, Button, Verse, LoadingScreen, ProgressBar, SectionTitle, Ornament, CrossMark } from '@/components/ui';
import { ArrowRight, Check, ChevronDown, ChevronUp, Leaf, Wind } from 'lucide-react';

const DAY_KEYS = [
  'day1','day2','day3','day4','day5','day6','day7',
] as const;
type DayKey = typeof DAY_KEYS[number];

const DAY_LABELS: Record<string, string> = {
  day1:'L', day2:'M', day3:'M', day4:'G', day5:'V', day6:'S', day7:'D',
};
const DAY_FULL: Record<string, string> = {
  day1:'Lunedì', day2:'Martedì', day3:'Mercoledì', day4:'Giovedì', day5:'Venerdì', day6:'Sabato', day7:'Domenica',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buonanotte';
  if (h < 13) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

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
  const [showCheckinToast, setShowCheckinToast] = useState(false);

  // Toast "Custodito ✓" dopo submit check-in serale
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('checkin_just_saved') === '1') {
      sessionStorage.removeItem('checkin_just_saved');
      setShowCheckinToast(true);
      const t = setTimeout(() => setShowCheckinToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, []);

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
    return <LoadingScreen label="Preparo il tuo cammino…" />;
  }

  const currentWeek = profile?.current_week || 1;
  const progressPercentage = Math.round((completedEpisodes / BETA_MAX_EPISODE) * 100);

  const properties = weekData?.page?.properties || {};
  const pratiche = (properties.Pratiche?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const mantra = (properties.Mantra?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const practicheArray = pratiche.split('\n').filter((p: string) => p.trim().length > 0);

  const nextEpisode = completedEpisodes + 1;
  const isAllDone = completedEpisodes >= BETA_MAX_EPISODE;

  const goToNext = () => {
    // Primo passo di ogni settimana → prima la pagina panoramica della settimana
    const isWeekFirst = (nextEpisode - 1) % 7 === 0;
    if (isWeekFirst) {
      router.push(`/settimana/${WEEK_IDS[currentWeek]}?week=${currentWeek}`);
    } else {
      router.push(`/episodio/${nextEpisode}`);
    }
  };

  return (
    <main className="min-h-screen bg-parchment">

      <EveningReminderBanner />

      {showCheckinToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-ink text-paper text-sm font-medium px-5 py-2.5 rounded-full shadow-[var(--shadow-float)] flex items-center gap-2 animate-rise">
          <Check className="w-4 h-4 text-gold-light" strokeWidth={2.5} />
          Giornata custodita
        </div>
      )}

      {/* ── Testata ── */}
      <header className="px-5 pt-9 pb-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Eyebrow icon={<CrossMark />}>The Way</Eyebrow>
            <span className="text-[11px] font-medium text-muted tracking-wide">
              Settimana {currentWeek}
            </span>
          </div>
          <h1 className="font-serif text-[36px] sm:text-[42px] leading-[1.02] font-medium text-ink">
            {greeting()},{' '}
            <span className="italic font-normal">{profile?.name || 'pellegrino'}</span>
          </h1>
          <p className="text-ink-soft text-sm mt-2">
            {WEEK_NAMES[currentWeek] || `Settimana ${currentWeek}`}
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 space-y-5">

        <DailyVerseCard name={profile?.name} />

        {/* ── Versetto della settimana + prossimo passo (card notte) ── */}
        <Card tone="night" className="relative overflow-hidden animate-rise">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gold-light/10 blur-2xl pointer-events-none" aria-hidden />
          <Eyebrow tone="night" className="mb-4">Versetto della settimana</Eyebrow>

          {mantra ? (
            <Verse tone="night" size="md" className="mb-6">
              {mantra}
            </Verse>
          ) : (
            <p className="font-serif italic text-night-muted text-xl mb-6">Versetto in arrivo.</p>
          )}

          <Ornament tone="night" className="mb-5" />

          {isAllDone ? (
            <div className="rounded-xl border border-gold-light/30 bg-gold-light/10 px-4 py-3 text-sm text-night-text text-center">
              Hai completato tutti i passi della Beta. Il cammino continua presto.
            </div>
          ) : (
            <Button variant="night" size="lg" full onClick={goToNext}>
              {completedEpisodes === 0 ? 'Inizia il primo passo' : `Continua: passo ${nextEpisode}`}
              <ArrowRight strokeWidth={2.2} />
            </Button>
          )}

          <button
            onClick={openMeditation}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm text-night-muted hover:text-night-text py-2 transition-colors"
          >
            <Wind className="w-4 h-4" strokeWidth={1.8} />
            Momento di preghiera e respiro
          </button>
        </Card>

        <DailyInvitationCard />
        <EveningCheckinCard />

        {/* ── Pratiche della settimana ── */}
        {practicheArray.length > 0 && (
          <section className="pt-2">
            <button
              className="w-full flex items-end justify-between gap-3 mb-3 px-1"
              onClick={() => setPracticesVisible(v => !v)}
              aria-expanded={practicesVisible}
            >
              <div className="text-left">
                <h2 className="font-serif text-2xl leading-none font-semibold text-ink">Pratiche della settimana</h2>
                <p className="text-xs text-muted mt-1.5">Solo per te. Non influenzano il percorso.</p>
              </div>
              <span className="text-muted mb-0.5">
                {practicesVisible ? <ChevronUp className="w-5 h-5" strokeWidth={1.8} /> : <ChevronDown className="w-5 h-5" strokeWidth={1.8} />}
              </span>
            </button>

            {practicesVisible && (
              <div className="space-y-3">
                {practicheArray.slice(0, 3).map((praticaText: string, index: number) => {
                  const practice = practices.find(p => p.practice_number === index + 1);
                  const completedDays = practice?.completed_days || {};
                  const completedCount = DAY_KEYS.filter(day => completedDays[day]).length;
                  const isComplete = completedCount === 7;

                  return (
                    <Card key={index} tone={isComplete ? 'sage' : 'paper'} className={`animate-rise delay-${Math.min(index + 1, 4)}`}>
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-serif text-base font-semibold ${
                            isComplete ? 'bg-sage text-paper' : 'bg-gold-soft text-gold-deep'
                          }`}
                        >
                          {isComplete ? <Check className="w-4 h-4" strokeWidth={2.5} /> : index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] text-ink leading-snug">{praticaText}</p>
                          <p className={`text-xs mt-1.5 ${isComplete ? 'text-sage' : 'text-muted'}`}>
                            {completedCount} su 7 giorni
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-1.5 mt-4">
                        {DAY_KEYS.map(day => {
                          const done = !!completedDays[day];
                          return (
                            <button
                              key={day}
                              onClick={() => togglePracticeDay(index + 1, day)}
                              disabled={loadingPractices}
                              aria-label={`Pratica ${index + 1}, ${DAY_FULL[day]}: ${done ? 'fatta' : 'non ancora fatta'}`}
                              aria-pressed={done}
                              className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 ${
                                done
                                  ? 'bg-gold text-paper shadow-[0_2px_8px_-3px_rgba(184,134,43,0.7)]'
                                  : 'bg-parchment text-muted hover:bg-gold-soft hover:text-gold-deep'
                              }`}
                            >
                              {done ? <Check className="w-3.5 h-3.5 mx-auto" strokeWidth={3} /> : DAY_LABELS[day]}
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Il tuo cammino ── */}
        <section className="pt-2 pb-6">
          <SectionTitle hint="Il tuo avanzamento nella Beta">Il tuo cammino</SectionTitle>
          <Card>
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-serif text-4xl font-medium text-ink leading-none">
                {completedEpisodes}
                <span className="text-lg text-muted font-normal"> / {BETA_MAX_EPISODE}</span>
              </p>
              <p className="text-xs text-muted">passi vissuti</p>
            </div>
            <ProgressBar value={progressPercentage} height="h-2" className="mb-5" />

            <div className="grid grid-cols-3 divide-x divide-line text-center mb-5">
              <div className="px-2">
                <p className="font-serif text-2xl text-ink leading-none">{currentWeek}</p>
                <p className="text-[11px] text-muted mt-1.5 uppercase tracking-wider">Settimana</p>
              </div>
              <div className="px-2">
                <p className="font-serif text-2xl text-ink leading-none">{progressPercentage}%</p>
                <p className="text-[11px] text-muted mt-1.5 uppercase tracking-wider">Percorso</p>
              </div>
              <div className="px-2">
                <p className="font-serif text-2xl text-ink leading-none">{Math.max(0, BETA_MAX_EPISODE - completedEpisodes)}</p>
                <p className="text-[11px] text-muted mt-1.5 uppercase tracking-wider">Da vivere</p>
              </div>
            </div>

            <Button variant="secondary" full onClick={() => router.push('/settimane')}>
              <Leaf strokeWidth={1.8} />
              Esplora le settimane
            </Button>
          </Card>
        </section>

      </div>
    </main>
  );
}
