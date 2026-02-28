'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EpisodeCard from '@/components/EpisodeCard';
import WeekCarousel from '@/components/WeekCarousel';
import { isWeekUnlockedInBeta } from '@/lib/weekUnlockLogic';

// The Way — Notion page IDs per ogni coppia di settimane
const WEEK_IDS_MAP: Record<number, string> = {
  1: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // Week 1-2 — La voce nel deserto
  2: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  3: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // placeholder — da aggiornare
  4: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  5: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  6: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
};

const WEEK_EPISODES: Record<string, number[]> = {
  '1': [1, 2, 3, 4],
  '2': [1, 2, 3, 4],
  '3': [5, 6, 7],    // placeholder — da aggiornare quando Week 3-4 è pronta
  '4': [5, 6, 7],
  '5': [8, 9, 10],
  '6': [8, 9, 10],
};

const EPISODE_TITLES: Record<number, string> = {
  1: 'L\'Annunciazione — Il sì che cambia tutto',
  2: 'La Nascita — Dio sceglie la fragilità',
  3: 'Il Battesimo — Tu sei il mio figlio amato',
  4: 'Conosciuto da sempre — Lo sguardo di Dio su di te',
};

function renderBlock(block: any) {
  const { type } = block;
  switch (type) {
    case 'paragraph': {
      const texts = block.paragraph?.rich_text || [];
      if (texts.length === 0) return <br />;
      return (
        <p className="text-gray-700 leading-relaxed text-sm mb-3">
          {texts.map((t: any, i: number) => {
            const ann = t.annotations || {};
            let el: React.ReactNode = t.plain_text;
            if (ann.bold) el = <strong key={i}>{el}</strong>;
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
        ? 'text-xl font-bold text-gray-800 mt-6 mb-2'
        : type === 'heading_2'
        ? 'text-lg font-bold text-gray-800 mt-5 mb-2'
        : 'text-base font-bold text-gray-700 mt-4 mb-1';
      const Tag = type === 'heading_1' ? 'h2' : type === 'heading_2' ? 'h3' : 'h4';
      return <Tag className={cls}>{content}</Tag>;
    }
    case 'bulleted_list_item': {
      const texts = block.bulleted_list_item?.rich_text || [];
      return (
        <div className="flex gap-2 mb-1">
          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
          <p className="text-gray-700 text-sm leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </div>
      );
    }
    case 'numbered_list_item': {
      const texts = block.numbered_list_item?.rich_text || [];
      return (
        <div className="flex gap-2 mb-1">
          <span className="text-blue-600 font-bold text-sm flex-shrink-0">›</span>
          <p className="text-gray-700 text-sm leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </div>
      );
    }
    case 'quote': {
      const texts = block.quote?.rich_text || [];
      return (
        <blockquote className="border-l-4 border-blue-400 bg-blue-50 px-4 py-3 my-3 rounded-r-lg">
          <p className="text-gray-700 italic text-sm leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </blockquote>
      );
    }
    case 'callout': {
      const texts = block.callout?.rich_text || [];
      const emoji = block.callout?.icon?.emoji || '💡';
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-3 rounded flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <p className="text-gray-700 text-sm leading-relaxed">{texts.map((t: any) => t.plain_text).join('')}</p>
        </div>
      );
    }
    case 'divider':
      return <hr className="border-blue-100 my-4" />;
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
  const [allSettimane, setAllSettimane] = useState<any[]>([]);
  const [isWeekComplete, setIsWeekComplete] = useState(false);
  const [showWeekCompletePopup, setShowWeekCompletePopup] = useState(false);
  const [nextWeekId, setNextWeekId] = useState<string | null>(null);
  const [nextWeekNumber, setNextWeekNumber] = useState<number | null>(null);

  // Versione estesa
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
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-gray-600">Caricamento settimana...</p>
        </div>
      </main>
    );
  }

  if (!data || data.error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Errore nel caricamento</p>
          <button onClick={() => router.push('/')} className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-full">
            Torna alla home
          </button>
        </div>
      </main>
    );
  }

  const properties = data.page?.properties || {};
  const settimana = properties.Settimana?.title?.[0]?.plain_text || '';
  const titolo = properties.Titolo?.rich_text?.[0]?.plain_text || '';
  const tema = properties['Tema principale']?.rich_text?.[0]?.plain_text || '';
  const episodi = properties.Episodi?.rich_text?.[0]?.plain_text || '';

  // Properties per il carousel
  const domandaGuida = (properties['Domanda guida']?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const essenza = (properties.Essenza?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const mantra = (properties.Mantra?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');
  const pratiche = (properties.Pratiche?.rich_text?.[0]?.plain_text || '')
    .split('\n')
    .map((p: string) => p.trim())
    .filter(Boolean);
  const scopertaChiave = (properties['Scoperta chiave']?.rich_text?.[0]?.plain_text || '').replace(/<br>/g, '\n');

  const weekEpisodes = WEEK_EPISODES[weekNumber.toString()] || [];
  const nextWeekInBeta = nextWeekNumber !== null && isWeekUnlockedInBeta(nextWeekNumber);

  const handleEpisodeComplete = async () => {
    const completed = await loadProgress(userId);
    checkCompletion(completed, weekEpisodes, weekNumber, true);
  };

  // — VISTA VERSIONE ESTESA —
  if (showExtended) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-6 px-4 pb-28">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowExtended(false)}
            className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-5 hover:text-blue-600 transition-colors"
          >
            ← Torna alla settimana
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              {settimana} · Approfondimento completo
            </span>
            <h1 className="text-xl font-extrabold text-gray-800 mt-3 mb-1">{titolo}</h1>
            <p className="text-blue-700 font-semibold text-sm">🎯 {tema}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            {extendedBlocks.length > 0
              ? extendedBlocks.map((block: any, i: number) => (
                  <div key={block.id || i}>{renderBlock(block)}</div>
                ))
              : <p className="text-sm text-gray-400 italic">Nessun contenuto aggiuntivo disponibile.</p>
            }
          </div>
        </div>
      </main>
    );
  }

  // — VISTA PRINCIPALE —
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 px-4 pb-24">

      {/* Popup settimana completata */}
      {showWeekCompletePopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scaleIn">
            <div className="text-7xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Settimana completata!</h2>
            <p className="text-blue-700 font-semibold text-sm mb-1">{settimana}</p>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Hai completato tutti i passi. Porta con te la Parola di questa settimana. 🙏
            </p>
            {nextWeekId && nextWeekInBeta ? (
              <>
                <button
                  onClick={() => { setShowWeekCompletePopup(false); router.push(`/settimana/${nextWeekId}?week=${nextWeekNumber}`); }}
                  className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-3 rounded-2xl mb-3 transition-all shadow-md"
                >
                  Passa alla settimana successiva →
                </button>
                <button
                  onClick={() => setShowWeekCompletePopup(false)}
                  className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition-colors"
                >
                  Rimani qui
                </button>
              </>
            ) : nextWeekNumber !== null && !nextWeekInBeta ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                  🔒 La prossima settimana sarà disponibile nella versione completa. Stay tuned!
                </div>
                <button
                  onClick={() => setShowWeekCompletePopup(false)}
                  className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold py-3 rounded-2xl transition-all"
                >
                  Continua 🌅
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowWeekCompletePopup(false)}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold py-3 rounded-2xl transition-all"
              >
                Continua il percorso 🌅
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              {settimana}
            </span>
            {isWeekComplete && (
              <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                ✅ Completata
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{titolo}</h1>
          <p className="text-gray-500 text-sm mb-4">{tema}</p>
          <button
            onClick={scrollToEpisodes}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-md"
          >
            📖 Vai ai passi ↓
          </button>
        </div>
      </div>

      {/* Carousel insegnamento */}
      <div className="max-w-4xl mx-auto mb-6">
        <WeekCarousel
          domandaGuida={domandaGuida}
          essenza={essenza}
          mantra={mantra}
          pratiche={pratiche}
          scopertaChiave={scopertaChiave}
          onLoadExtended={handleLoadExtended}
          loadingExtended={loadingExtended}
        />
      </div>

      {/* Episodi */}
      <div className="max-w-4xl mx-auto mb-6" ref={episodesRef}>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 Passi della settimana</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onComplete={handleEpisodeComplete}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottone prossima settimana */}
      {isWeekComplete && nextWeekId && nextWeekInBeta && (
        <div className="max-w-4xl mx-auto mb-6">
          <button
            onClick={() => router.push(`/settimana/${nextWeekId}?week=${nextWeekNumber}`)}
            className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
          >
            ✝️ Passa alla settimana successiva →
          </button>
        </div>
      )}
      {/* Messaggio beta: solo quando la prossima settimana supera il limite Beta */}
      {isWeekComplete && nextWeekNumber !== null && !nextWeekInBeta && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 font-semibold text-sm">
              🔒 Hai completato tutte le settimane disponibili in Beta! La versione completa arriva presto. 🙏
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
      `}</style>

    </main>
  );
}
