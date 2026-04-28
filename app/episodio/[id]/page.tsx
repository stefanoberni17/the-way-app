'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EpisodeAudioPlayer from '@/components/EpisodeAudioPlayer';
import { BookOpen, Pencil, Heart } from 'lucide-react';

interface EpisodeData {
  number: number;
  title: string;
  riferimento: string;
  invitoApertura: string;
  miniLesson: string;
  guidaOsservazione: string;
  reflectionQuestion: string;
  versettoPortare: string;
  mainTheme: string;
  concepts: string;
  salmoSupport: string;
  practices: string;
  audioUrl: string;
  /** "Lectio" | "Integrazione" | "Pratica" — default Lectio */
  tipo: string;
  durata: number | null;
  weekNumber: number;
  locked: boolean;
  completed: boolean;
}

type FontSize = 'S' | 'M' | 'L';

const FONT_SIZE_CLASSES: Record<FontSize, { quote: string; paragraph: string }> = {
  S: { quote: 'text-base', paragraph: 'text-sm' },
  M: { quote: 'text-lg', paragraph: 'text-base' },
  L: { quote: 'text-xl', paragraph: 'text-lg' },
};

const FONT_SIZE_CYCLE: FontSize[] = ['S', 'M', 'L'];

// Estrae testo plain da tutti i blocchi (per TTS)
function getBlocksPlainText(blocks: any[]): string {
  return blocks
    .map((block) => {
      const { type } = block;
      const richTextTypes = [
        'paragraph', 'heading_1', 'heading_2', 'heading_3',
        'bulleted_list_item', 'numbered_list_item', 'quote', 'callout',
      ];
      if (!richTextTypes.includes(type)) return '';
      const richText: any[] = block[type]?.rich_text || [];
      return richText.map((t: any) => t.plain_text).join('');
    })
    .filter(Boolean)
    .join('. ');
}

// Renderizza un singolo rich_text con le sue annotazioni (bold/italic/code)
function renderRichText(texts: any[]): React.ReactNode {
  return texts.map((t: any, i: number) => {
    const ann = t.annotations || {};
    let el: React.ReactNode = t.plain_text;
    if (ann.bold) el = <strong key={i} className="font-semibold">{el}</strong>;
    if (ann.italic) el = <em key={i}>{el}</em>;
    if (ann.code) el = <code key={i} className="bg-stone-100 px-1 rounded text-sm">{el}</code>;
    return el;
  });
}

/**
 * Determina se un paragrafo è "tutto italic" (chiusa autoriale del passo,
 * es. "*Prenditi un momento...*"). Va escluso dal run scritturale.
 */
function isAllItalicParagraph(block: any): boolean {
  if (block.type !== 'paragraph') return false;
  const texts = block.paragraph?.rich_text || [];
  if (texts.length === 0) return false;
  const hasContent = texts.some((t: any) => (t.plain_text || '').trim().length > 0);
  if (!hasContent) return false;
  return texts.every((t: any) => !t.plain_text?.trim() || t.annotations?.italic);
}

/**
 * Renderizza la lista di blocchi raggruppando il "run scritturale" in un solo blockquote.
 *
 * Problema risolto: su Notion alcuni passi hanno tutto il versetto preceduto da `>`
 * (ogni riga è un blocco `quote`); altri hanno `>` solo sulla prima riga e le righe
 * successive vengono salvate come `paragraph` separati. Senza intervento, in app
 * i due stili appaiono drammaticamente diversi (banda laterale solo su alcune righe,
 * font sans su altre).
 *
 * Soluzione: appena trovo un quote, apro un "run scritturale" e ci raccolgo TUTTI
 * i blocchi adiacenti che sembrano testo biblico:
 *   - quote (sempre)
 *   - paragraph NON in solo italic (le continuazioni del versetto)
 *   - divider tra due quote → mini-separatore di scena
 * Mi fermo a: heading, callout, list, paragraph all-italic (= closing autoriale),
 * divider terminale (cioè non seguito da un altro quote).
 *
 * Risultato: tutto il testo biblico ha **una sola banda laterale amber**, font-serif
 * uniforme, niente alternanza di stili.
 */
function renderBlocks(blocks: any[], fontSize: FontSize = 'M'): React.ReactNode[] {
  const sizes = FONT_SIZE_CLASSES[fontSize];
  const out: React.ReactNode[] = [];
  let i = 0;

  const renderQuoteLikeText = (texts: any[], key: string) => (
    <p key={key} className={`text-stone-800 font-serif leading-relaxed ${sizes.quote}`}>
      {renderRichText(texts)}
    </p>
  );

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === 'quote') {
      const startId = block.id;
      const runItems: Array<{ node: React.ReactNode; key: string }> = [];
      let j = i;

      while (j < blocks.length) {
        const b = blocks[j];

        // 1. Quote: sempre dentro il run
        if (b.type === 'quote') {
          const rt: any[] = b.quote?.rich_text || [];
          const text = rt.map((t: any) => t.plain_text || '').join('');
          if (text.trim().length > 0) {
            runItems.push({ key: b.id, node: renderQuoteLikeText(rt, b.id) });
          }
          j++;
          continue;
        }

        // 2. Paragraph (non all-italic): continuazione del versetto. Aggiunto al run
        //    e renderizzato con lo stesso stile dei quote (font-serif).
        if (b.type === 'paragraph' && !isAllItalicParagraph(b)) {
          const rt: any[] = b.paragraph?.rich_text || [];
          const text = rt.map((t: any) => t.plain_text || '').join('');
          if (text.trim().length === 0) {
            // Paragrafo vuoto: spaziatore interno (mantiene il run aperto)
            runItems.push({
              key: b.id,
              node: <span key={b.id} className="block h-1" aria-hidden />,
            });
          } else {
            runItems.push({ key: b.id, node: renderQuoteLikeText(rt, b.id) });
          }
          j++;
          continue;
        }

        // 3. Divider tra due "blocchi scritturali": mini-separatore di scena
        if (b.type === 'divider') {
          const next = blocks[j + 1];
          const nextIsScripture =
            next?.type === 'quote' ||
            (next?.type === 'paragraph' && !isAllItalicParagraph(next));
          if (nextIsScripture) {
            runItems.push({
              key: b.id,
              node: <span key={b.id} className="block w-8 h-px bg-amber-400/50 mx-auto my-3" aria-hidden />,
            });
            j++;
            continue;
          }
        }

        // Tutto il resto chiude il run (heading, callout, list, closing italic, divider terminale)
        break;
      }

      if (runItems.length > 0) {
        out.push(
          <blockquote
            key={`quote-run-${startId}`}
            className="border-l-4 border-amber-300 pl-5 pr-2 my-6 space-y-3"
          >
            {runItems.map((it) => (
              <div key={it.key}>{it.node}</div>
            ))}
          </blockquote>
        );
      }

      i = j;
      continue;
    }

    // Blocchi non-quote standalone: rendering classico
    const node = renderBlock(block, fontSize);
    if (node) out.push(node);
    i++;
  }

  return out;
}

function renderBlock(block: any, fontSize: FontSize = 'M'): React.ReactNode {
  const { type, id } = block;
  const sizes = FONT_SIZE_CLASSES[fontSize];

  switch (type) {
    case 'paragraph': {
      const texts = block.paragraph?.rich_text || [];
      const content = texts.map((t: any) => t.plain_text).join('');
      if (!content.trim()) return <div key={id} className="h-3" />;

      // Closing italic puro (es. "*Prenditi un momento...*") → rendering più
      // sobrio e uniforme su tutti i passi: stone-500, serif italic, piccolo.
      const isAllItalic = texts.every((t: any) => t.annotations?.italic);
      if (isAllItalic && texts.length > 0) {
        return (
          <p key={id} className="text-stone-500 italic font-serif text-sm leading-relaxed mt-6 mb-4">
            {texts.map((t: any) => t.plain_text).join('')}
          </p>
        );
      }

      return (
        <p key={id} className={`text-stone-800 leading-relaxed mb-4 ${sizes.paragraph}`}>
          {renderRichText(texts)}
        </p>
      );
    }

    case 'heading_1':
    case 'heading_2':
    case 'heading_3': {
      const texts = block[type]?.rich_text || [];
      const Tag = type === 'heading_1' ? 'h2' : type === 'heading_2' ? 'h3' : 'h4';
      const cls =
        type === 'heading_1' ? 'text-xl font-serif font-bold text-slate-900 mt-8 mb-3' :
        type === 'heading_2' ? 'text-lg font-serif font-semibold text-slate-900 mt-6 mb-2' :
        'text-base font-semibold text-stone-700 mt-4 mb-2';
      return <Tag key={id} className={cls}>{renderRichText(texts)}</Tag>;
    }

    case 'bulleted_list_item': {
      const texts = block.bulleted_list_item?.rich_text || [];
      return (
        <div key={id} className="flex gap-3 mb-2">
          <span className="text-amber-600 mt-1.5 flex-shrink-0 text-lg leading-none">·</span>
          <p className={`text-stone-700 leading-relaxed ${sizes.paragraph}`}>{renderRichText(texts)}</p>
        </div>
      );
    }

    case 'numbered_list_item': {
      const texts = block.numbered_list_item?.rich_text || [];
      return (
        <div key={id} className="flex gap-3 mb-2">
          <span className="text-amber-700 font-bold flex-shrink-0 mt-0.5">›</span>
          <p className={`text-stone-700 leading-relaxed ${sizes.paragraph}`}>{renderRichText(texts)}</p>
        </div>
      );
    }

    case 'quote': {
      // Gestito da renderBlocks (raggruppamento di quote consecutivi).
      // Fallback per quando renderBlock viene chiamato in isolamento (non dovrebbe più capitare).
      const texts = block.quote?.rich_text || [];
      return (
        <blockquote key={id} className="border-l-4 border-amber-300 pl-5 pr-2 my-5">
          <p className={`text-stone-800 font-serif leading-relaxed ${sizes.quote}`}>
            {renderRichText(texts)}
          </p>
        </blockquote>
      );
    }

    case 'callout': {
      const texts = block.callout?.rich_text || [];
      const emoji = block.callout?.icon?.emoji || '✦';
      return (
        <div key={id} className="bg-stone-50 border-l-4 border-amber-400 p-4 my-4 rounded flex items-start gap-3">
          <span className="text-xl flex-shrink-0">{emoji}</span>
          <p className={`text-stone-700 leading-relaxed ${sizes.paragraph}`}>{renderRichText(texts)}</p>
        </div>
      );
    }

    case 'divider':
      return <hr key={id} className="border-stone-200 my-6" />;

    case 'toggle': {
      const texts = block.toggle?.rich_text || [];
      const summary = texts.map((t: any) => t.plain_text).join('');
      return (
        <details key={id} className="my-2 bg-gray-50 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer font-semibold text-gray-700 text-sm list-none flex items-center gap-2">
            <span className="text-amber-600">▸</span> {summary}
          </summary>
          <div className="px-4 pb-3 pt-1 text-sm text-gray-500 italic">
            Contenuto nel passo completo
          </div>
        </details>
      );
    }

    default:
      return null;
  }
}

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isDone = n < current;
        const isActive = n === current;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 flex-shrink-0 ${
              isDone
                ? 'bg-amber-500 border-amber-500 text-slate-900'
                : isActive
                ? 'bg-amber-50 border-amber-500 text-amber-700'
                : 'bg-white border-stone-200 text-stone-400'
            }`}>
              {isDone ? '✓' : n}
            </div>
            {n < total && (
              <div className="flex-1 h-0.5 mx-1.5 bg-stone-200 overflow-hidden rounded">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: isDone ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function EpisodioPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Blocchi per la lettura del passo (Step 2)
  const [readingBlocks, setReadingBlocks] = useState<any[]>([]);
  const [loadingReading, setLoadingReading] = useState(false);

  // Tipografia step 2 (persistita in localStorage)
  const [fontSize, setFontSize] = useState<FontSize>('M');

  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const fromSettimana = searchParams.get('from');   // Notion page ID della settimana
  const fromWeek = searchParams.get('week');         // numero settimana

  const episodeNumber = parseInt(params.id as string);
  const TOTAL_STEPS = 5;
  const MAX_CHARS = 500;

  const conceptTags = episodeData?.concepts
    ? episodeData.concepts.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        router.push('/login');
      }
    });
  }, [router]);

  // Carica dati episodio
  useEffect(() => {
    if (!userId) return;
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/episodio?number=${episodeNumber}&userId=${userId}`);
        const data = await response.json();
        if (data.locked) {
          alert(data.message);
          router.back();
          return;
        }
        setEpisodeData(data.episode);
        setCompleted(data.episode.completed);
        setLoading(false);

        const reflectionRes = await fetch(`/api/reflection?userId=${userId}&episodeNumber=${episodeNumber}`);
        const reflectionData = await reflectionRes.json();
        if (reflectionData.reflection) {
          setReflectionText(reflectionData.reflection.reflection_text);
          setReflectionSaved(true);
        }
      } catch (error) {
        console.error('Errore caricamento passo:', error);
        router.back();
      }
    };
    fetchEpisode();
  }, [episodeNumber, userId, router]);

  // Carica i blocchi di lettura in background (pronti per Step 2)
  useEffect(() => {
    if (!userId || !episodeNumber) return;
    setLoadingReading(true);
    fetch(`/api/episodio?number=${episodeNumber}&userId=${userId}&extended=true`)
      .then(r => r.json())
      .then(data => {
        setReadingBlocks(data.blocks || []);
      })
      .catch(e => console.error('Errore caricamento lettura:', e))
      .finally(() => setLoadingReading(false));
  }, [userId, episodeNumber]);

  // Carica e persiste la dimensione del font scelta dall'utente per la lettura
  useEffect(() => {
    const saved = localStorage.getItem('theway:fontSize') as FontSize | null;
    if (saved && FONT_SIZE_CYCLE.includes(saved)) setFontSize(saved);
  }, []);

  const cycleFontSize = () => {
    const i = FONT_SIZE_CYCLE.indexOf(fontSize);
    const next = FONT_SIZE_CYCLE[(i + 1) % FONT_SIZE_CYCLE.length];
    setFontSize(next);
    localStorage.setItem('theway:fontSize', next);
  };

  // Auto-save riflessione dopo 2 secondi di inattività
  useEffect(() => {
    if (!reflectionText.trim() || reflectionText.length > MAX_CHARS) return;

    const timer = setTimeout(async () => {
      setSavingReflection(true);
      try {
        await fetch('/api/reflection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            episodeNumber,
            reflectionText: reflectionText.trim(),
            reflectionQuestion: episodeData?.reflectionQuestion || '',
          }),
        });
        setReflectionSaved(true);
      } catch (error) {
        console.error('Errore salvataggio riflessione:', error);
      } finally {
        setSavingReflection(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [reflectionText, userId, episodeNumber]);

  // Cambia step. Il player audio si occupa autonomamente del cleanup all'unmount.
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleComplete = async () => {
    if (completed || completing) return;

    if (!reflectionSaved || !reflectionText.trim()) {
      alert('Devi completare la riflessione prima di procedere.');
      return;
    }

    setCompleting(true);
    try {
      const response = await fetch('/api/episodio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeNumber, userId }),
      });
      if (response.ok) {
        setCompleted(true);
        setCompleting(false);
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Errore completamento:', error);
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-slate-300 font-serif">Caricamento passo...</p>
        </div>
      </main>
    );
  }

  // Schermata di celebrazione completamento
  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-6">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl md:text-7xl mb-4 animate-pulse">✦</div>
          <h2 className="text-3xl font-serif font-bold mb-3">
            Passo completato
          </h2>
          <p className="text-lg text-stone-300 mb-2 font-medium">
            {episodeData?.riferimento && (
              <span className="block text-sm text-amber-400 italic mb-1">{episodeData.riferimento}</span>
            )}
            {episodeData?.title}
          </p>
          {episodeData?.versettoPortare && (
            <p className="text-sm text-stone-300 italic font-serif mt-5 max-w-xs mx-auto leading-relaxed border-l-2 border-amber-400 pl-4 text-left">
              &ldquo;{episodeData.versettoPortare}&rdquo;
            </p>
          )}
          <p className="text-xs text-stone-400 mt-6 italic">
            Porta questo versetto con te oggi.
          </p>
          <button
            onClick={() => {
              // router.push garantisce un fresh mount della settimana
              // così i progressi (lock/unlock) vengono ricaricati correttamente
              if (fromSettimana && fromWeek) {
                router.push(`/settimana/${fromSettimana}?week=${fromWeek}`);
              } else {
                router.back();
              }
            }}
            className="mt-10 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold px-8 py-3 rounded-full shadow-lg transition-all"
          >
            Continua il percorso →
          </button>
        </div>
      </div>
    );
  }

  // Step 2 (lettura) ha bisogno di più larghezza per una line-length confortevole.
  // Gli altri step (form, callout) restano stretti per leggibilità.
  const containerMaxWidth = currentStep === 2 ? 'max-w-prose' : 'max-w-lg';

  // Vista principale con step
  return (
    <main className="min-h-screen bg-stone-50 py-6 px-4 pb-28">
      <div className={`${containerMaxWidth} mx-auto transition-[max-width] duration-300`}>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-stone-500 font-medium mb-5 hover:text-amber-700 transition-colors"
        >
          ← Torna indietro
        </button>

        <StepProgress current={currentStep} total={TOTAL_STEPS} />

        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-72">

          {/* STEP 1 — Intro */}
          {currentStep === 1 && (
            <div>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                  Passo {episodeData?.number} · Week {episodeData?.weekNumber}
                </span>
                {episodeData?.durata && (
                  <span className="text-xs text-stone-400">~{episodeData.durata} min</span>
                )}
              </div>
              {episodeData?.riferimento && episodeData?.tipo === 'Lectio' && (
                <p className="text-xs text-amber-700 font-semibold italic mb-2">{episodeData.riferimento}</p>
              )}
              <h1 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-3">
                {episodeData?.title}
              </h1>
              {episodeData?.mainTheme && (
                <p className="text-stone-600 text-sm mb-4 italic font-serif">
                  {episodeData.mainTheme}
                </p>
              )}
              {episodeData?.invitoApertura && (
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1.5">Invito all&apos;apertura</p>
                  <p className="text-sm text-stone-700 leading-relaxed italic font-serif">
                    {episodeData.invitoApertura}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Lettura del Passo / Esercizio (Integrazione) / Pratica */}
          {currentStep === 2 && (() => {
            // I passi "Integrazione" e "Pratica" non sono lectio biblica:
            // adattiamo header, icona e label.
            const tipo = episodeData?.tipo || 'Lectio';
            const isLectio = tipo === 'Lectio';
            const Icon = isLectio ? BookOpen : tipo === 'Pratica' ? Heart : Pencil;
            const headerLabel =
              isLectio ? 'Lettura del Passo'
              : tipo === 'Pratica' ? 'Pratica'
              : 'Esercizio di integrazione';

            return (
            <div>
              {/* Header con toggle tipografia */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-slate-900 text-sm">{headerLabel}</p>
                  {episodeData?.riferimento && isLectio && (
                    <p className="text-xs text-amber-700 italic">{episodeData.riferimento}</p>
                  )}
                </div>
                <button
                  onClick={cycleFontSize}
                  className="text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-all flex items-center gap-1 min-h-[44px] min-w-[56px] justify-center"
                  aria-label={`Cambia dimensione testo (attuale: ${fontSize})`}
                  title="Dimensione testo"
                >
                  <span className="text-xs">A</span>
                  <span className="text-base">A</span>
                  <span className="text-[10px] text-gray-400 ml-0.5">{fontSize}</span>
                </button>
              </div>

              {/* Player audio: solo per Lectio (i passi di Integrazione/Pratica
                  sono testi da scrivere, non hanno senso letti dal TTS). */}
              {isLectio && readingBlocks.length > 0 && (
                <div className="mb-5">
                  <EpisodeAudioPlayer
                    audioUrl={episodeData?.audioUrl}
                    fallbackText={getBlocksPlainText(readingBlocks)}
                    episodeNumber={episodeNumber}
                  />
                </div>
              )}

              {/* Testo del passo (scroll naturale di pagina, niente container interno) */}
              {loadingReading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-300 border-t-amber-600 animate-spin" />
                  <p className="text-sm text-stone-500">Caricamento...</p>
                </div>
              ) : readingBlocks.length > 0 ? (
                <div>
                  {renderBlocks(readingBlocks, fontSize)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-stone-500 italic">
                    Il testo completo non è ancora disponibile per questo passo.
                  </p>
                  {episodeData?.riferimento && isLectio && (
                    <p className="text-xs text-amber-700 mt-2 font-medium">{episodeData.riferimento}</p>
                  )}
                </div>
              )}
            </div>
            );
          })()}

          {/* STEP 3 — Mini-lezione + Guida osservazione */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-amber-700" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-serif font-bold text-slate-900 text-sm">Insegnamento</p>
                  <p className="text-xs text-stone-500">La lezione di questo passo</p>
                </div>
              </div>
              <div className="w-full h-px bg-stone-200 mb-4" />
              <p className="text-sm text-stone-700 leading-relaxed border-l-4 border-amber-300 pl-4 mb-5">
                {episodeData?.miniLesson || 'Contenuto non ancora disponibile.'}
              </p>
              {episodeData?.guidaOsservazione && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-2">👁️ Guida all&apos;osservazione</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {episodeData.guidaOsservazione}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Domanda riflessiva + Journaling */}
          {currentStep === 4 && (
            <div>
              <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 mb-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
                  Domanda riflessiva
                </p>
                <p className="text-slate-800 text-sm leading-relaxed italic font-serif font-medium">
                  &ldquo;{episodeData?.reflectionQuestion || 'Domanda non ancora disponibile.'}&rdquo;
                </p>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  La tua riflessione
                </label>
                <textarea
                  value={reflectionText}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) {
                      setReflectionText(e.target.value);
                      setReflectionSaved(false);
                    }
                  }}
                  placeholder="Scrivi qui la tua riflessione..."
                  className="w-full h-32 px-4 py-3 border border-stone-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none resize-none text-sm text-stone-800 transition-all bg-stone-50"
                  maxLength={MAX_CHARS}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    reflectionText.length >= MAX_CHARS
                      ? 'text-red-500 font-bold'
                      : 'text-stone-500'
                  }`}>
                    {reflectionText.length}/{MAX_CHARS} caratteri
                  </span>
                  {savingReflection && (
                    <span className="text-xs text-amber-700 flex items-center gap-1">
                      <span className="animate-spin">⋯</span> Salvataggio...
                    </span>
                  )}
                  {reflectionSaved && !savingReflection && reflectionText.trim() && (
                    <span className="text-xs text-green-700 flex items-center gap-1">
                      ✓ Salvato
                    </span>
                  )}
                </div>
              </div>

              {!reflectionText.trim() && (
                <div className="bg-stone-50 border-l-4 border-amber-400 p-3 rounded">
                  <p className="text-xs text-stone-700">
                    Scrivi una riflessione per completare questo passo
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5 — Versetto da portare + Concetti + Completa */}
          {currentStep === 5 && (
            <div>
              {episodeData?.versettoPortare && (
                <div className="bg-slate-900 text-white rounded-xl p-5 mb-5 border border-slate-700 shadow-sm">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em] mb-3">
                    Versetto da portare con te
                  </p>
                  <p className="text-stone-100 text-base leading-relaxed italic font-serif border-l-2 border-amber-400 pl-4">
                    &ldquo;{episodeData.versettoPortare}&rdquo;
                  </p>
                  {episodeData.salmoSupport && (
                    <p className="text-xs text-stone-400 mt-3 italic">
                      Salmo di supporto: {episodeData.salmoSupport}
                    </p>
                  )}
                </div>
              )}

              {episodeData?.practices && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                    Pratica per oggi
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {episodeData.practices}
                  </p>
                </div>
              )}

              {conceptTags.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                    Concetti chiave
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {conceptTags.map((tag, i) => (
                      <span key={i} className="text-xs bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full font-medium border border-stone-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {completed ? (
                <div className="w-full bg-green-50 border border-green-200 text-green-700 text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                  ✓ Passo completato
                </div>
              ) : reflectionSaved && reflectionText.trim() ? (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white text-sm font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-sm"
                >
                  {completing
                    ? <><span className="animate-spin">⋯</span> Salvataggio...</>
                    : <>Completa passo</>
                  }
                </button>
              ) : (
                <div className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                  Completa la riflessione per procedere
                </div>
              )}
            </div>
          )}

        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 mt-4">
          {currentStep > 1 && (
            <button
              onClick={() => goToStep(currentStep - 1)}
              className="flex-1 bg-white border border-stone-200 text-stone-600 font-semibold text-sm py-3.5 rounded-xl hover:bg-stone-50 transition-all"
            >
              ← Indietro
            </button>
          )}
          {currentStep < TOTAL_STEPS && (
            <button
              onClick={() => goToStep(currentStep + 1)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-all shadow-sm"
            >
              Continua →
            </button>
          )}
        </div>

      </div>
    </main>
  );
}
