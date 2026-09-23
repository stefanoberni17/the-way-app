'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EpisodeAudioPlayer from '@/components/EpisodeAudioPlayer';
import SavePassageButton from '@/components/SavePassageButton';
import { BookOpen, Pencil, Heart, Eye, Check, ArrowLeft, ArrowRight, Loader2, ChevronDown, Type } from 'lucide-react';
import { Button, Eyebrow, LoadingScreen, Ornament, IconBadge, Notice, Verse, Tag, CrossMark } from '@/components/ui';

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
  approfondimento: string;
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
  S: { quote: 'text-lg', paragraph: 'text-[15px]' },
  M: { quote: 'text-[22px]', paragraph: 'text-[17px]' },
  L: { quote: 'text-[26px]', paragraph: 'text-[19px]' },
};

const FONT_SIZE_CYCLE: FontSize[] = ['S', 'M', 'L'];

const STEP_LABELS = ['Apertura', 'Lettura', 'Insegnamento', 'Riflessione', 'Da portare'];

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
    if (ann.bold) el = <strong key={i} className="font-semibold text-ink">{el}</strong>;
    if (ann.italic) el = <em key={i}>{el}</em>;
    if (ann.code) el = <code key={i} className="bg-parchment px-1 rounded text-sm">{el}</code>;
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
 * Vedi commento storico: quote + paragraph adiacenti vengono uniti in un'unica
 * banda laterale oro con font serif uniforme.
 */
function renderBlocks(blocks: any[], fontSize: FontSize = 'M'): React.ReactNode[] {
  const sizes = FONT_SIZE_CLASSES[fontSize];
  const out: React.ReactNode[] = [];
  let i = 0;

  const renderQuoteLikeText = (texts: any[], key: string) => (
    <p key={key} className={`text-ink font-serif leading-[1.5] ${sizes.quote}`}>
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

        if (b.type === 'quote') {
          const rt: any[] = b.quote?.rich_text || [];
          const text = rt.map((t: any) => t.plain_text || '').join('');
          if (text.trim().length > 0) {
            runItems.push({ key: b.id, node: renderQuoteLikeText(rt, b.id) });
          }
          j++;
          continue;
        }

        if (b.type === 'paragraph' && !isAllItalicParagraph(b)) {
          const rt: any[] = b.paragraph?.rich_text || [];
          const text = rt.map((t: any) => t.plain_text || '').join('');
          if (text.trim().length === 0) {
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

        if (b.type === 'divider') {
          const next = blocks[j + 1];
          const nextIsScripture =
            next?.type === 'quote' ||
            (next?.type === 'paragraph' && !isAllItalicParagraph(next));
          if (nextIsScripture) {
            runItems.push({
              key: b.id,
              node: <span key={b.id} className="block w-8 h-px bg-gold/50 my-3" aria-hidden />,
            });
            j++;
            continue;
          }
        }

        break;
      }

      if (runItems.length > 0) {
        out.push(
          <blockquote
            key={`quote-run-${startId}`}
            className="border-l-2 border-gold pl-5 pr-1 my-7 space-y-3"
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

      const isAllItalic = texts.every((t: any) => t.annotations?.italic);
      if (isAllItalic && texts.length > 0) {
        return (
          <p key={id} className="text-muted italic font-serif text-lg leading-relaxed mt-7 mb-4">
            {texts.map((t: any) => t.plain_text).join('')}
          </p>
        );
      }

      return (
        <p key={id} className={`text-ink-soft leading-[1.7] mb-4 ${sizes.paragraph}`}>
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
        type === 'heading_1' ? 'font-serif text-3xl font-semibold text-ink mt-9 mb-3' :
        type === 'heading_2' ? 'font-serif text-2xl font-semibold text-ink mt-7 mb-2' :
        'font-serif text-xl font-semibold text-ink mt-5 mb-2';
      return <Tag key={id} className={cls}>{renderRichText(texts)}</Tag>;
    }

    case 'bulleted_list_item': {
      const texts = block.bulleted_list_item?.rich_text || [];
      return (
        <div key={id} className="flex gap-3 mb-2">
          <span className="w-1 h-1 rounded-full bg-gold mt-3 flex-shrink-0" />
          <p className={`text-ink-soft leading-[1.7] ${sizes.paragraph}`}>{renderRichText(texts)}</p>
        </div>
      );
    }

    case 'numbered_list_item': {
      const texts = block.numbered_list_item?.rich_text || [];
      return (
        <div key={id} className="flex gap-3 mb-2">
          <span className="text-gold font-serif text-xl leading-none mt-0.5 flex-shrink-0">›</span>
          <p className={`text-ink-soft leading-[1.7] ${sizes.paragraph}`}>{renderRichText(texts)}</p>
        </div>
      );
    }

    case 'quote': {
      const texts = block.quote?.rich_text || [];
      return (
        <blockquote key={id} className="border-l-2 border-gold pl-5 pr-1 my-6">
          <p className={`text-ink font-serif leading-[1.5] ${sizes.quote}`}>
            {renderRichText(texts)}
          </p>
        </blockquote>
      );
    }

    case 'callout': {
      const texts = block.callout?.rich_text || [];
      return (
        <div key={id} className="bg-gold-wash border border-gold-soft rounded-xl p-4 my-5">
          <p className={`text-ink-soft leading-relaxed ${sizes.paragraph}`}>{renderRichText(texts)}</p>
        </div>
      );
    }

    case 'divider':
      return <Ornament key={id} className="my-7" />;

    case 'toggle': {
      const texts = block.toggle?.rich_text || [];
      const summary = texts.map((t: any) => t.plain_text).join('');
      return (
        <details key={id} className="my-2 bg-paper-warm rounded-xl border border-line">
          <summary className="px-4 py-3 cursor-pointer font-medium text-ink-soft text-sm list-none flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-gold" /> {summary}
          </summary>
          <div className="px-4 pb-3 pt-1 text-sm text-muted italic">
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
    <div className="mb-6">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const isDone = n < current;
          const isActive = n === current;
          return (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                isDone ? 'bg-gold' : isActive ? 'bg-gold/60' : 'bg-parchment-deep'
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
          {STEP_LABELS[current - 1]}
        </span>
        <span className="text-[11px] text-muted tracking-wide">
          {current} di {total}
        </span>
      </div>
    </div>
  );
}

function StepHeading({ icon, title, hint }: { icon: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <IconBadge size="sm">{icon}</IconBadge>
      <div className="min-w-0">
        <p className="font-serif text-xl font-semibold text-ink leading-none">{title}</p>
        {hint && <p className="text-xs text-muted mt-1 truncate">{hint}</p>}
      </div>
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

  const [readingBlocks, setReadingBlocks] = useState<any[]>([]);
  const [loadingReading, setLoadingReading] = useState(false);

  const [fontSize, setFontSize] = useState<FontSize>('M');

  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const fromSettimana = searchParams.get('from');
  const fromWeek = searchParams.get('week');
  const initialStepParam = searchParams.get('step');

  const episodeNumber = parseInt(params.id as string);
  const TOTAL_STEPS = 5;
  const MAX_CHARS = 500;

  const conceptTags = episodeData?.concepts
    ? episodeData.concepts.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        router.push('/login');
      }
    });
  }, [router]);

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

        if (initialStepParam) {
          const n = parseInt(initialStepParam);
          if (n >= 1 && n <= 5) setCurrentStep(n);
        } else if (data.episode.completed) {
          setCurrentStep(5);
        }

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

  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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
    return <LoadingScreen label="Apro il passo…" />;
  }

  // ── Celebrazione ──
  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-night flex items-center justify-center z-[60] p-6 animate-fade-in overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gold-light/10 blur-3xl animate-breathe pointer-events-none" aria-hidden />
        <div className="relative text-center text-night-text max-w-md animate-scale-in">
          <CrossMark className="w-8 h-8 text-gold-light mx-auto mb-6" />
          <Eyebrow tone="night" className="justify-center mb-3">Passo {episodeData?.number} vissuto</Eyebrow>
          <h2 className="font-serif text-4xl font-semibold mb-2 leading-tight">
            {episodeData?.title}
          </h2>
          {episodeData?.riferimento && (
            <p className="text-sm text-night-muted italic font-serif">{episodeData.riferimento}</p>
          )}

          {episodeData?.versettoPortare && (
            <>
              <Ornament tone="night" className="my-7 max-w-[160px] mx-auto" />
              <Verse tone="night" size="md" className="max-w-sm mx-auto">
                {episodeData.versettoPortare}
              </Verse>
              <p className="text-xs text-night-muted mt-5">Porta questo versetto con te oggi.</p>
            </>
          )}

          <Button
            variant="night"
            size="lg"
            className="mt-10"
            onClick={() => {
              if (fromSettimana && fromWeek) {
                router.push(`/settimana/${fromSettimana}?week=${fromWeek}`);
              } else {
                router.back();
              }
            }}
          >
            Continua il percorso
            <ArrowRight strokeWidth={2.2} />
          </Button>
        </div>
      </div>
    );
  }

  const containerMaxWidth = currentStep === 2 ? 'max-w-[42rem]' : 'max-w-lg';
  const tipo = episodeData?.tipo || 'Lectio';
  const isLectio = tipo === 'Lectio';

  return (
    <main className="min-h-screen bg-parchment px-4 pt-6 pb-10">
      <div className={`${containerMaxWidth} mx-auto transition-[max-width] duration-300`}>

        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors -ml-1 px-1 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Indietro
          </button>
          <span className="text-[11px] text-muted tracking-wide">
            Passo {episodeData?.number} · Settimana {episodeData?.weekNumber}
          </span>
        </div>

        <StepProgress current={currentStep} total={TOTAL_STEPS} />

        <div key={currentStep} className="bg-paper rounded-2xl border border-line shadow-[var(--shadow-card)] p-6 sm:p-8 min-h-72 animate-rise">

          {/* STEP 1 — Apertura */}
          {currentStep === 1 && (
            <div>
              {episodeData?.riferimento && isLectio && (
                <Eyebrow className="mb-3">{episodeData.riferimento}</Eyebrow>
              )}
              {!isLectio && (
                <Eyebrow className="mb-3">{tipo === 'Pratica' ? 'Pratica' : 'Integrazione'}</Eyebrow>
              )}
              <h1 className="font-serif text-[34px] sm:text-[38px] font-semibold text-ink leading-[1.08] mb-3">
                {episodeData?.title}
              </h1>
              {episodeData?.mainTheme && (
                <p className="font-serif italic text-xl text-ink-soft leading-snug mb-2">
                  {episodeData.mainTheme}
                </p>
              )}
              {episodeData?.durata && (
                <p className="text-xs text-muted mb-5">Circa {episodeData.durata} minuti</p>
              )}
              {episodeData?.invitoApertura && (
                <>
                  <Ornament className="my-6" />
                  <Eyebrow tone="muted" className="mb-2">Invito all&apos;apertura</Eyebrow>
                  <p className="text-[16px] text-ink-soft leading-[1.7]">
                    {episodeData.invitoApertura}
                  </p>
                </>
              )}
            </div>
          )}

          {/* STEP 2 — Lettura / Esercizio / Pratica */}
          {currentStep === 2 && (() => {
            const Icon = isLectio ? BookOpen : tipo === 'Pratica' ? Heart : Pencil;
            const headerLabel =
              isLectio ? 'Lettura del passo'
              : tipo === 'Pratica' ? 'Pratica'
              : 'Esercizio di integrazione';

            return (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <IconBadge size="sm"><Icon strokeWidth={1.8} /></IconBadge>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl font-semibold text-ink leading-none">{headerLabel}</p>
                  {episodeData?.riferimento && isLectio && (
                    <p className="text-xs text-gold-deep mt-1">{episodeData.riferimento}</p>
                  )}
                </div>
                <button
                  onClick={cycleFontSize}
                  className="h-10 px-3 rounded-full border border-line text-ink-soft hover:border-gold hover:text-gold-deep transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  aria-label={`Cambia dimensione testo (attuale: ${fontSize})`}
                  title="Dimensione testo"
                >
                  <Type className="w-4 h-4" strokeWidth={2} />
                  {fontSize}
                </button>
              </div>

              {isLectio && readingBlocks.length > 0 && (
                <div className="mb-6">
                  <EpisodeAudioPlayer
                    audioUrl={episodeData?.audioUrl}
                    fallbackText={getBlocksPlainText(readingBlocks)}
                    episodeNumber={episodeNumber}
                  />
                </div>
              )}

              {loadingReading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-6 h-6 text-gold animate-spin" />
                  <p className="text-sm text-muted">Apro il testo…</p>
                </div>
              ) : readingBlocks.length > 0 ? (
                <div>
                  {renderBlocks(readingBlocks, fontSize)}
                </div>
              ) : (
                <div className="text-center py-10">
                  <BookOpen className="w-8 h-8 text-faint mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-serif italic text-lg text-muted">
                    Il testo completo non è ancora disponibile per questo passo.
                  </p>
                  {episodeData?.riferimento && isLectio && (
                    <p className="text-xs text-gold-deep mt-2">{episodeData.riferimento}</p>
                  )}
                </div>
              )}
            </div>
            );
          })()}

          {/* STEP 3 — Insegnamento */}
          {currentStep === 3 && (
            <div>
              <StepHeading icon={<Heart strokeWidth={1.8} />} title="Insegnamento" hint="La lezione di questo passo" />
              <p className="text-[16px] text-ink-soft leading-[1.7] mb-6">
                {episodeData?.miniLesson || 'Contenuto non ancora disponibile.'}
              </p>
              {episodeData?.guidaOsservazione && (
                <div className="bg-gold-wash border border-gold-soft rounded-xl p-5">
                  <Eyebrow icon={<Eye strokeWidth={2} />} className="mb-2">Guida all&apos;osservazione</Eyebrow>
                  <p className="text-[15px] text-ink-soft leading-relaxed">
                    {episodeData.guidaOsservazione}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Riflessione */}
          {currentStep === 4 && (
            <div>
              <Eyebrow className="mb-3">Domanda riflessiva</Eyebrow>
              <p className="font-serif italic text-[24px] leading-[1.35] text-ink mb-6">
                {episodeData?.reflectionQuestion || 'Domanda non ancora disponibile.'}
              </p>

              <Ornament className="mb-6" />

              <label className="block text-[13px] font-medium text-ink-soft mb-2">
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
                placeholder="Scrivi qui, con le tue parole…"
                className="w-full h-36 px-4 py-3 rounded-xl bg-paper-warm border border-line text-[15px] text-ink leading-relaxed placeholder:text-faint outline-none resize-none transition-all focus:border-gold focus:ring-4 focus:ring-gold/10"
                maxLength={MAX_CHARS}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${reflectionText.length >= MAX_CHARS ? 'text-rose font-semibold' : 'text-muted'}`}>
                  {reflectionText.length}/{MAX_CHARS}
                </span>
                {savingReflection && (
                  <span className="text-xs text-muted flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> Salvo…
                  </span>
                )}
                {reflectionSaved && !savingReflection && reflectionText.trim() && (
                  <span className="text-xs text-sage flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Salvato
                  </span>
                )}
              </div>

              {!reflectionText.trim() && (
                <p className="text-xs text-muted mt-4">
                  Scrivi una riflessione per completare questo passo.
                </p>
              )}
            </div>
          )}

          {/* STEP 5 — Da portare */}
          {currentStep === 5 && (
            <div>
              {episodeData?.versettoPortare && (
                <div className="relative overflow-hidden bg-night rounded-2xl p-6 mb-5 border border-night-line">
                  <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-gold-light/10 blur-2xl pointer-events-none" aria-hidden />
                  <Eyebrow tone="night" className="mb-4">Versetto da portare con te</Eyebrow>
                  <Verse tone="night" size="md">
                    {episodeData.versettoPortare}
                  </Verse>
                  {episodeData.salmoSupport && (
                    <p className="text-xs text-night-muted mt-4">
                      Salmo di supporto: {episodeData.salmoSupport}
                    </p>
                  )}
                </div>
              )}

              {episodeData?.practices && (
                <div className="bg-gold-wash border border-gold-soft rounded-xl p-5 mb-5">
                  <Eyebrow className="mb-2">Pratica per oggi</Eyebrow>
                  <p className="text-[15px] text-ink-soft leading-relaxed">
                    {episodeData.practices}
                  </p>
                </div>
              )}

              {conceptTags.length > 0 && (
                <div className="mb-6">
                  <Eyebrow tone="muted" className="mb-3">Concetti chiave</Eyebrow>
                  <div className="flex flex-wrap gap-2">
                    {conceptTags.map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {episodeData?.approfondimento && (
                completed ? (
                  <div className="mb-6 bg-paper-warm border border-line rounded-2xl p-5 sm:p-6">
                    <Eyebrow className="mb-1">Ora che hai vissuto il passo</Eyebrow>
                    <p className="font-serif text-2xl font-semibold text-ink mb-4">Vai più a fondo</p>
                    <div className="text-[15px] text-ink-soft leading-[1.7] whitespace-pre-line">
                      {episodeData.approfondimento}
                    </div>
                  </div>
                ) : (
                  <details className="group mb-6 bg-paper-warm border border-line rounded-2xl overflow-hidden">
                    <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 hover:bg-parchment/60 transition-colors">
                      <div>
                        <p className="font-serif text-lg font-semibold text-ink leading-none">Vai più a fondo</p>
                        <p className="text-xs text-muted mt-1">Una lettura ampia, per dopo.</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted group-open:rotate-180 transition-transform flex-shrink-0" strokeWidth={2} />
                    </summary>
                    <div className="px-5 pb-5 pt-2 border-t border-line">
                      <div className="text-[15px] text-ink-soft leading-[1.7] whitespace-pre-line">
                        {episodeData.approfondimento}
                      </div>
                    </div>
                  </details>
                )
              )}

              <SavePassageButton episodeNumber={episodeNumber} />

              {completed ? (
                <div className="w-full bg-sage-soft border border-sage/20 text-sage text-sm font-medium py-3 px-4 rounded-full flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" strokeWidth={2.5} /> Passo vissuto
                </div>
              ) : reflectionSaved && reflectionText.trim() ? (
                <Button full size="lg" onClick={handleComplete} disabled={completing}>
                  {completing ? <Loader2 className="animate-spin" /> : <Check strokeWidth={2.5} />}
                  {completing ? 'Salvo…' : 'Completa il passo'}
                </Button>
              ) : (
                <Notice className="text-center">
                  Completa la riflessione per procedere.
                </Notice>
              )}
            </div>
          )}

        </div>

        {/* Nav */}
        <div className="flex gap-3 mt-4">
          {currentStep > 1 && (
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => goToStep(currentStep - 1)}>
              <ArrowLeft strokeWidth={2} />
              Indietro
            </Button>
          )}
          {currentStep < TOTAL_STEPS && (
            <Button size="lg" className="flex-1" onClick={() => goToStep(currentStep + 1)}>
              Continua
              <ArrowRight strokeWidth={2.2} />
            </Button>
          )}
        </div>

      </div>
    </main>
  );
}
