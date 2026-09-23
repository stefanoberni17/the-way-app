'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUnlockedWeeks, isWeekUnlockedInBeta, getWeekLockMessage, BETA_MAX_WEEK } from '@/lib/weekUnlockLogic';
import { PageHeader, LoadingScreen, Card } from '@/components/ui';
import { Lock, Check, ArrowRight } from 'lucide-react';

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
    return <LoadingScreen label="Apro il percorso…" />;
  }

  const currentWeek = profile?.current_week || 1;
  const unlockedCount = unlockedWeeks.filter(w => w <= BETA_MAX_WEEK).length;

  return (
    <main className="min-h-screen bg-parchment">
      <PageHeader
        eyebrow="Il percorso"
        title="Settimana dopo settimana"
        subtitle={`${unlockedCount} ${unlockedCount === 1 ? 'settimana aperta' : 'settimane aperte'} su ${BETA_MAX_WEEK} disponibili in Beta.`}
      />

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <ol className="relative space-y-3">
          {/* filo verticale del cammino */}
          <span className="absolute left-[23px] top-6 bottom-6 w-px bg-line-strong" aria-hidden />

          {settimane.map((settimana, idx) => {
            const isUnlocked = unlockedWeeks.includes(settimana.numero);
            const isCurrentWeek = settimana.numero === currentWeek;
            const isBetaLocked = !isWeekUnlockedInBeta(settimana.numero);
            const lockMessage = getWeekLockMessage(settimana.numero);
            const isDone = isUnlocked && !isCurrentWeek && settimana.numero < currentWeek;
            const clickable = isUnlocked && !isBetaLocked;

            const marker = isBetaLocked || !isUnlocked
              ? <Lock className="w-3.5 h-3.5" strokeWidth={2} />
              : isDone
              ? <Check className="w-4 h-4" strokeWidth={2.5} />
              : <span className="font-serif text-base font-semibold">{settimana.numero}</span>;

            const markerCls = isBetaLocked || !isUnlocked
              ? 'bg-parchment-deep text-faint border-line'
              : isDone
              ? 'bg-sage text-paper border-sage'
              : isCurrentWeek
              ? 'bg-gold text-paper border-gold shadow-[0_0_0_4px_rgba(184,134,43,0.18)]'
              : 'bg-paper text-gold-deep border-gold';

            return (
              <li key={settimana.numero} className={`relative pl-14 animate-rise delay-${Math.min(idx + 1, 4)}`}>
                <span
                  className={`absolute left-2.5 top-5 w-7 h-7 rounded-full border flex items-center justify-center ${markerCls}`}
                  aria-hidden
                >
                  {marker}
                </span>

                <Card
                  tone={isCurrentWeek ? 'paper' : isBetaLocked || !isUnlocked ? 'ghost' : 'warm'}
                  onClick={clickable ? () => router.push(`/settimana/${settimana.id}?week=${settimana.numero}`) : undefined}
                  className={`${!clickable ? 'opacity-70' : ''} ${isCurrentWeek ? 'ring-1 ring-gold/40' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] mb-1.5 ${
                        isCurrentWeek ? 'text-gold-deep' : 'text-muted'
                      }`}>
                        {settimana.settimana}
                        {isCurrentWeek && ' · In corso'}
                        {isDone && ' · Completata'}
                      </p>
                      <h3 className={`font-serif text-2xl leading-tight font-semibold ${
                        clickable ? 'text-ink' : 'text-muted'
                      }`}>
                        {settimana.titolo}
                      </h3>
                      <p className={`text-sm mt-1.5 leading-relaxed ${clickable ? 'text-ink-soft' : 'text-faint'}`}>
                        {settimana.tema}
                      </p>
                    </div>
                    {clickable && (
                      <ArrowRight className="w-5 h-5 text-faint flex-shrink-0 mt-1" strokeWidth={1.8} />
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                    <span className="text-xs text-muted">Passi {settimana.episodi}</span>
                    {isBetaLocked ? (
                      <span className="text-xs text-gold-deep">{lockMessage}</span>
                    ) : !isUnlocked ? (
                      <span className="text-xs text-muted">Completa la settimana precedente</span>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 text-center px-6">
          <p className="font-serif italic text-lg text-muted leading-snug">
            Le settimane dopo la {BETA_MAX_WEEK} arriveranno con la versione completa.
          </p>
          <p className="text-xs text-faint mt-2">Un passo alla volta.</p>
        </div>
      </div>
    </main>
  );
}
