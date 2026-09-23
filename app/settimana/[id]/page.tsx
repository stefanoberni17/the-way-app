'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EpisodeCard from '@/components/EpisodeCard';
import WeekCarousel from '@/components/WeekCarousel';
import WeekDeepDive from '@/components/WeekDeepDive';
import { isWeekUnlockedInBeta } from '@/lib/weekUnlockLogic';
import { WEEK_IDS as WEEK_IDS_MAP } from '@/lib/weekIds';
import { PageHeader, LoadingScreen, Card, Button, Eyebrow, SectionTitle, Notice, Ornament, CrossMark } from '@/components/ui';
import { ArrowRight, ArrowDown, Check } from 'lucide-react';

// 7 passi per settimana singola (6 Lectio + 1 Integrazione)
const WEEK_EPISODES: Record<string, number[]> = {
  '1': [1,  2,  3,  4,  5,  6,  7 ],
  '2': [8,  9,  10, 11, 12, 13, 14],
  '3': [15, 16, 17, 18, 19, 20, 21],
  '4': [22, 23, 24, 25, 26, 27, 28],
  '5': [29, 30, 31, 32, 33, 34, 35],
  '6': [36, 37, 38, 39, 40, 41, 42],
  '7': [43, 44, 45, 46, 47, 48, 49],
  '8': [50, 51, 52, 53, 54, 55, 56],
};

const EPISODE_TITLES: Record<number, string> = {
  // Week 1 — La voce nel deserto (7 passi)
  1:  'L\'Annunciazione — Il sì che cambia tutto',
  2:  'Il sogno di Giuseppe — Fidarsi nel buio',
  3:  'La Nascita — Dio entra nella semplicità',
  4:  'Maria custodisce — Stare senza capire',
  5:  'Come un bimbo svezzato — La presenza semplice',
  6:  'Fermatevi e sappiate — Il comando più difficile',
  7:  'Integrazione W1 — Un momento, anche piccolo',
  // Week 2 — La voce nel deserto cont. (7 passi)
  8:  'Conosciuto da sempre — Lo sguardo di Dio su di te',
  9:  'Confida, non appoggiarti — Fiducia semplice',
  10: 'Nella calma sarà la vostra forza — Rallentare',
  11: 'Simeone — Riconoscere dopo l\'attesa',
  12: 'Il Battesimo — Tu sei il mio figlio amato',
  13: 'Il Signore è il mio pastore — Sicurezza',
  14: 'Integrazione W2 — La frase che è restata',
  // Week 3 — Il silenzio di Nazaret (7 passi)
  15: 'Gesù al Tempio a 12 anni — Autonomia e radici',
  16: 'Elia e la voce sottile — Dio nel sussurro',
  17: 'Ascolta, figlio mio — La saggezza come fondamento',
  18: 'Solo in Dio riposa l\'anima mia — Smettere di agitarsi',
  19: 'C\'è un tempo per ogni cosa — Il ritmo della vita',
  20: 'Quelli che sperano nel Signore — La forza che nasce dall\'attesa',
  21: 'Integrazione W3 — Dove sto correndo',
  // Week 4 — Il silenzio di Nazaret cont. (7 passi)
  22: 'Non affannatevi — La presenza nel presente',
  23: 'Insegnaci a contare i nostri giorni — La saggezza del tempo',
  24: 'Dio dirige i tuoi passi — Progettare con umiltà',
  25: 'Il Signore è mia luce — Di chi avrò timore?',
  26: 'Venite a me, voi affaticati — Il riposo che non devi meritare',
  27: 'Sta\' in silenzio davanti al Signore — L\'arte di aspettare',
  28: 'Integrazione W4 — La fine del primo silenzio',
  // Week 5 — Il deserto del primo silenzio (chiusura Presenza)
  29: 'La sete che torna',
  30: 'Anche i profeti vogliono mollare',
  31: 'Aspettare è già qualcosa',
  32: 'Cercare nella notte',
  33: 'Dal fondo, un sospiro',
  34: 'Anche Lui si è ritirato',
  35: 'Integrazione W5 — Quello che resta dopo il silenzio',
  // Week 6 — Comincia ad ascoltare (apertura Ascolto)
  36: 'La chiamata di Samuele — Parla, ascolto',
  37: 'Marta e Maria — La parte buona',
  38: 'Il buon pastore — La voce che già conosci',
  39: 'La Trasfigurazione — Ascoltatelo',
  40: 'Promessa di ascolto — Ascolterò',
  41: 'Gesù si ritirava — Il ritmo del ritirarsi',
  42: 'Integrazione W6 — La voce piccola che è cominciata',
  // Week 7 — Ascolto anche quando non sento (Ascolto cont.)
  43: 'La sentinella che resta',
  44: 'Bussare nella notte',
  45: 'Dirsi le cose vere',
  46: 'La sentinella',
  47: 'Sperare sperando',
  48: 'Credo, aiutami nella mia incredulità',
  49: 'Integrazione W7 — Il diario del silenzio',
  // Week 8 — La voce nel quotidiano (Ascolto cont.)
  50: 'Non ci ardeva forse il cuore?',
  51: 'La riva dove ti aspetta',
  52: 'Lo riconosci nei volti',
  53: 'Anche di notte il cuore istruisce',
  54: 'Alzati e mangia',
  55: 'Chiamato per nome',
  56: 'Integrazione W8 — Il quaderno del feriale',
};

function renderBlock(block: any) {
  const { type } = block;
  switch (type) {
    case 'paragraph': {
      const texts = block.paragraph?.rich_text || [];
      if (texts.length === 0) return <div className="h-3" />;
      return (
        <p className="text-ink-soft leading-relaxed text-[15px] mb-4">
          {texts.map((t: any, i: number) => {
            const ann = t.annotations || {};
            let el: React.ReactNode = t.plain_text;
            if (ann.bold) el = <strong key={i} className="font-semibold text-ink">{el}</strong>;
            if (ann.italic) el = <em key={i}>{el}</em>;
            return <span key={i}>{el}</span>;
          })}
        </p>
      );
    }
    case 'heading_1':
    case 'heading_2':
    case 'heading_3': {
      const texts = block[type]?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      const cls = type === 'heading_1'
        ? 'font-serif text-3xl font-semibold text-ink mt-8 mb-3'
        : type === 'heading_2'
        ? 'font-serif text-2xl font-semibold text-ink mt-7 mb-2'
        : 'font-serif text-xl font-semibold text-ink mt-5 mb-2';
      const Tag = type === 'heading_1' ? 'h2' : type === 'heading_2' ? 'h3' : 'h4';
      return <Tag className={cls}>{content}</Tag>;
    }
    case 'bulleted_list_item': {
      const texts = block.bulleted_list_item?.rich_text || [];
      return (
        <div className="flex gap-3 mb-2">
          <span className="text-gold mt-2 w-1 h-1 rounded-full bg-gold flex-shrink-0" />
          <p className="text-ink-soft text-[15px] leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </div>
      );
    }
    case 'numbered_list_item': {
      const texts = block.numbered_list_item?.rich_text || [];
      return (
        <div className="flex gap-3 mb-2">
          <span className="text-gold font-serif text-lg leading-none mt-0.5 flex-shrink-0">›</span>
          <p className="text-ink-soft text-[15px] leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </div>
      );
    }
    case 'quote': {
      const texts = block.quote?.rich_text || [];
      return (
        <blockquote className="border-l-2 border-gold pl-5 my-5">
          <p className="font-serif italic text-xl leading-[1.4] text-ink">{texts.map((t: any) => t.plain_text).join('')}</p>
        </blockquote>
      );
    }
    case 'callout': {
      const texts = block.callout?.rich_text || [];
      return (
        <div className="bg-gold-wash border border-gold-soft rounded-xl p-4 my-4">
          <p className="text-ink-soft text-[15px] leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </div>
      );
    }
    case 'divider':
      return <Ornament className="my-6" />;
    default:
      return null;
  }
}

export default function SettimanaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekParam = searchParams.get('week');
  const episodesRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>([]);
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [, setAllSettimane] = useState<any[]>([]);
  const [isWeekComplete, setIsWeekComplete] = useState(false);
  const [showWeekCompletePopup, setShowWeekCompletePopup] = useState(false);
  const [nextWeekId, setNextWeekId] = useState<string | null>(null);
  const [nextWeekNumber, setNextWeekNumber] = useState<number | null>(null);

  const [showExtended, setShowExtended] = useState(false);
  const [extendedBlocks, setExtendedBlocks] = useState<any[]>([]);
  const [loadingExtended, setLoadingExtended] = useState(false);

  const loadProgress = async (uid: string): Promise<number[]> => {
    const { data: progress } = await supabase
      .from('user_episode_progress')
      .select('episode_number, completed')
      .eq('user_id', uid)
      .eq('completed', true);
    const nums = (progress || []).map((p: any) => p.episode_number);
    setCompletedEpisodes(nums);
    return nums;
  };

  const checkCompletion = (
    completed: number[],
    weekEps: number[],
    wn: number,
    triggerPopup: boolean
  ) => {
    if (weekEps.length === 0) return;
    const allDone = weekEps.every(ep => completed.includes(ep));
    if (allDone) {
      setIsWeekComplete(true);
      const nextWn = wn + 1;
      const nextId = WEEK_IDS_MAP[nextWn] || null;
      setNextWeekNumber(nextWn);
      setNextWeekId(nextId);
      if (triggerPopup) setShowWeekCompletePopup(true);
    } else {
      setIsWeekComplete(false);
    }
  };

  const handleLoadExtended = async () => {
    if (extendedBlocks.length > 0) {
      setShowExtended(true);
      return;
    }
    setLoadingExtended(true);
    try {
      setExtendedBlocks(data?.blocks || []);
      setShowExtended(true);
    } finally {
      setLoadingExtended(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUserId(session.user.id);

      const id = params.id as string;
      const [settimanaRes, settimaneRes] = await Promise.all([
        fetch(`/api/settimana?id=${id}`),
        fetch('/api/settimane'),
      ]);
      const settimanaData = await settimanaRes.json();
      const settimaneData = await settimaneRes.json();
      setData(settimanaData);

      const settimaneList = (settimaneData.settimane || []).filter((s: any) => s.numero <= 8);
      setAllSettimane(settimaneList);

      const settimanaText = settimanaData.page?.properties?.Settimana?.title?.[0]?.plain_text || '';
      const match = settimanaText.match(/Week (\d+)/);
      const parsedWn = match ? parseInt(match[1]) : 1;
      const wn = weekParam ? parseInt(weekParam) : parsedWn;
      setWeekNumber(wn);

      const weekEpsList = WEEK_EPISODES[wn.toString()] || [];
      const completed = await loadProgress(session.user.id);
      checkCompletion(completed, weekEpsList, wn, false);
      setLoading(false);
    };
    init();
  }, [params.id, router, weekParam]);

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingScreen label="Apro la settimana…" />;
  }

  if (!data || data.error) {
    return (
      <main className="min-h-screen bg-parchment flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-serif text-2xl text-ink mb-4">Qualcosa non ha risposto.</p>
          <Button onClick={() => router.push('/')}>Torna alla home</Button>
        </div>
      </main>
    );
  }

  const properties = data.page?.properties || {};
  const settimana = properties.Settimana?.title?.[0]?.plain_text || '';
  const titolo = properties.Titolo?.rich_text?.[0]?.plain_text || '';
  const tema = properties['Tema principale']?.rich_text?.[0]?.plain_text || '';

  const domandaGuida = (properties['Domanda guida']?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const essenza = (properties.Essenza?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const mantra = (properties.Mantra?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const pratiche = (properties.Pratiche?.rich_text?.[0]?.plain_text || '')
    .split('\n')
    .map((p: string) => p.trim())
    .filter(Boolean);
  const scopertaChiave = (properties['Scoperta chiave']?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const preghiera = (properties.Preghiera?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const integrazione = (properties.Integrazione?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');

  const weekEpisodes = WEEK_EPISODES[weekNumber.toString()] || [];
  const nextWeekInBeta = nextWeekNumber !== null && isWeekUnlockedInBeta(nextWeekNumber);
  const weekLabel = settimana.replace(/^Week\s+/i, 'Settimana ');
  const completedInWeek = weekEpisodes.filter(ep => completedEpisodes.includes(ep)).length;

  const handleEpisodeComplete = async () => {
    const completed = await loadProgress(userId);
    checkCompletion(completed, weekEpisodes, weekNumber, true);
  };

  // — VISTA VERSIONE ESTESA —
  if (showExtended) {
    return (
      <main className="min-h-screen bg-parchment">
        <PageHeader
          eyebrow={`${weekLabel} · Approfondimento`}
          title={titolo}
          subtitle={tema}
          onBack={() => setShowExtended(false)}
        />
        <div className="max-w-2xl mx-auto px-4 pb-10">
          <Card className="animate-rise">
            {extendedBlocks.length > 0
              ? extendedBlocks.map((block: any, i: number) => (
                  <div key={block.id || i}>{renderBlock(block)}</div>
                ))
              : <p className="font-serif italic text-lg text-muted">Nessun contenuto aggiuntivo disponibile.</p>
            }
          </Card>
        </div>
      </main>
    );
  }

  // — VISTA PRINCIPALE —
  return (
    <main className="min-h-screen bg-parchment">

      {/* Popup settimana completata */}
      {showWeekCompletePopup && (
        <div className="fixed inset-0 bg-night/80 backdrop-blur-sm flex items-center justify-center z-[60] p-5 animate-fade-in">
          <div className="bg-paper rounded-3xl p-8 max-w-sm w-full text-center shadow-[var(--shadow-float)] animate-scale-in">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full bg-gold/20 animate-breathe" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CrossMark className="w-6 h-6 text-gold" />
              </div>
            </div>
            <Eyebrow className="justify-center mb-2">{weekLabel}</Eyebrow>
            <h2 className="font-serif text-3xl font-semibold text-ink mb-3">Settimana completata</h2>
            <p className="text-ink-soft text-sm leading-relaxed mb-7">
              Hai vissuto tutti i passi. Porta con te la Parola di questa settimana.
            </p>
            {nextWeekId && nextWeekInBeta ? (
              <>
                <Button full size="lg" onClick={() => { setShowWeekCompletePopup(false); router.push(`/settimana/${nextWeekId}?week=${nextWeekNumber}`); }}>
                  Passa alla settimana successiva
                  <ArrowRight strokeWidth={2.2} />
                </Button>
                <Button variant="ghost" full className="mt-2" onClick={() => setShowWeekCompletePopup(false)}>
                  Rimani qui
                </Button>
              </>
            ) : nextWeekNumber !== null && !nextWeekInBeta ? (
              <>
                <Notice tone="gold" className="mb-4 text-xs">
                  La prossima settimana arriverà con la versione completa.
                </Notice>
                <Button full size="lg" onClick={() => setShowWeekCompletePopup(false)}>Continua</Button>
              </>
            ) : (
              <Button full size="lg" onClick={() => setShowWeekCompletePopup(false)}>Continua il percorso</Button>
            )}
          </div>
        </div>
      )}

      <PageHeader
        eyebrow={
          <>
            {weekLabel}
            {isWeekComplete && <span className="text-sage"> · Completata</span>}
          </>
        }
        title={titolo}
        subtitle={tema}
        onBack={() => router.back()}
        right={
          <button
            onClick={scrollToEpisodes}
            className="w-11 h-11 rounded-full border border-line-strong text-ink-soft hover:border-gold hover:text-gold-deep flex items-center justify-center transition-colors"
            aria-label="Vai ai passi"
          >
            <ArrowDown className="w-4 h-4" strokeWidth={2} />
          </button>
        }
      />

      <div className="max-w-2xl mx-auto px-4 pb-10">

        <div className="mb-6 animate-rise">
          <WeekCarousel
            domandaGuida={domandaGuida}
            essenza={essenza}
            mantra={mantra}
            pratiche={pratiche}
            scopertaChiave={scopertaChiave}
          />
        </div>

        <WeekDeepDive
          preghiera={preghiera}
          integrazione={integrazione}
          onOpenExtended={handleLoadExtended}
          loadingExtended={loadingExtended}
        />

        {/* Passi */}
        <section ref={episodesRef} className="pt-2 scroll-mt-4">
          <SectionTitle
            hint={`${completedInWeek} di ${weekEpisodes.length} vissuti`}
            right={
              isWeekComplete ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sage mb-1">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Completa
                </span>
              ) : null
            }
          >
            Passi della settimana
          </SectionTitle>
          <div className="space-y-2.5">
            {weekEpisodes.map((epNum) => {
              const isCompleted = completedEpisodes.includes(epNum);
              const isLocked = epNum > 1 && !completedEpisodes.includes(epNum - 1);
              return (
                <EpisodeCard
                  key={epNum}
                  episodeNumber={epNum}
                  title={EPISODE_TITLES[epNum] || `Passo ${epNum}`}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  weekNumber={weekNumber}
                  userId={userId}
                  settimanaId={params.id as string}
                  onComplete={handleEpisodeComplete}
                />
              );
            })}
          </div>
        </section>

        {isWeekComplete && nextWeekId && nextWeekInBeta && (
          <div className="mt-6">
            <Button full size="lg" onClick={() => router.push(`/settimana/${nextWeekId}?week=${nextWeekNumber}`)}>
              Passa alla settimana successiva
              <ArrowRight strokeWidth={2.2} />
            </Button>
          </div>
        )}
        {isWeekComplete && nextWeekNumber !== null && !nextWeekInBeta && (
          <div className="mt-6">
            <Notice tone="gold" className="text-center">
              Hai completato tutte le settimane disponibili in Beta. La versione completa arriva presto.
            </Notice>
          </div>
        )}

      </div>
    </main>
  );
}
