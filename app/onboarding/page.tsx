'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandCross from '@/components/BrandCross';
import { BookOpen, Eye, Calendar, Leaf, MessageCircle, Smartphone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Eyebrow, IconBadge, Ornament, Verse } from '@/components/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [completing, setCompleting] = useState(false);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Errore update onboarding:', error);
        alert('Errore nel salvataggio. Riprova.');
        setCompleting(false);
        return;
      }

      router.push('/');

    } catch (error) {
      console.error('Errore imprevisto:', error);
      alert('Errore imprevisto. Riprova.');
      setCompleting(false);
    }
  };

  const listCard = 'bg-paper-warm border border-line rounded-2xl p-5';

  const slides = [
    // SLIDE 1
    {
      eyebrow: 'Benvenuto',
      title: 'Più di un libro sacro. Un viaggio per tornare a casa.',
      content: (
        <div className="text-center">
          <BrandCross className="mx-auto mb-6" size={64} />
          <p className="font-serif text-[22px] text-ink leading-[1.35] mb-6">
            Il Vangelo non è solo un testo antico da studiare.<br/>
            È una Parola viva che parla a ogni cuore, oggi.
          </p>
          <div className={`${listCard} text-left space-y-3`}>
            {[
              'Incontrare Gesù attraverso i racconti evangelici',
              'Riconoscere la tua storia nella storia dei personaggi biblici',
              'Crescere interiormente attraverso la contemplazione e la pratica',
            ].map((t) => (
              <p key={t} className="flex items-start gap-3 text-[15px] text-ink-soft leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                <span>{t}</span>
              </p>
            ))}
          </div>
          <p className="text-muted mt-6 italic font-serif text-lg leading-snug">
            Non per diventare perfetti.<br/>Per diventare più veri.
          </p>
        </div>
      )
    },

    // SLIDE 2
    {
      eyebrow: 'Come funziona',
      title: 'Un cammino fatto di piccoli passi',
      content: (
        <div className="space-y-3">
          {[
            {
              Icon: BookOpen,
              title: 'Passi progressivi',
              body: 'I passi si aprono uno alla volta. Non è una corsa. È un invito a darti tempo con la Parola.',
            },
            {
              Icon: Eye,
              title: 'Lectio e riflessione personale',
              body: "Ogni passo ha una mini-lezione, una guida all'osservazione e una domanda. Leggi, osserva, lasciati interrogare.",
            },
            {
              Icon: Calendar,
              title: 'Settimane tematiche',
              body: "Ogni settimana esplora un tema evangelico: la voce nel deserto, il silenzio di Nazaret, la chiamata…",
            },
            {
              Icon: Leaf,
              title: 'Pratiche concrete',
              body: 'Ogni settimana ha pratiche semplici e un versetto da portare con sé: semi da piantare nella vita quotidiana.',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className={`${listCard} flex items-start gap-4`}>
              <IconBadge size="md"><Icon strokeWidth={1.8} /></IconBadge>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl font-semibold text-ink leading-tight mb-1">{title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },

    // SLIDE 3
    {
      eyebrow: 'Il ritmo',
      title: 'Questo cammino è lento. Di proposito.',
      content: (
        <div className="text-center">
          <p className="font-serif text-[24px] text-ink leading-[1.3] mb-6">
            Capire qualcosa è veloce.<br/>
            <span className="italic">Lasciarsi trasformare, no.</span>
          </p>

          <div className={`${listCard} text-left mb-6`}>
            <p className="text-ink-soft mb-4 leading-relaxed text-[15px]">
              È come il seme nel Vangelo: caduto nella terra, cresce <strong className="text-ink font-semibold">nel silenzio e nel tempo</strong>.
              Non puoi affrettare la sua crescita.
            </p>
            <Verse size="sm" reference="Marco 4,28">
              La terra produce spontaneamente prima l&apos;erba, poi la spiga, poi il grano pieno nella spiga.
            </Verse>
          </div>

          <p className="text-ink-soft mb-6 text-[15px] leading-relaxed">
            Qui non stiamo correndo verso un risultato.<br/>
            Stiamo imparando ad ascoltare.
          </p>

          <div className={`${listCard} text-left flex items-start gap-4`}>
            <IconBadge tone="night"><MessageCircle strokeWidth={1.8} /></IconBadge>
            <div>
              <h3 className="font-serif text-xl font-semibold text-ink leading-tight mb-1">Il tuo alleato: La Guida</h3>
              <p className="text-sm text-ink-soft leading-relaxed">
                Conosce dove sei nel cammino. Ti accompagna senza anticipare, ti aiuta a riflettere e a portare la Parola nella vita.
              </p>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 4 - Telegram
    {
      eyebrow: 'Facoltativo',
      title: 'La Guida anche su Telegram',
      content: (
        <div className="text-center">
          <IconBadge size="lg" className="mx-auto mb-5"><Smartphone strokeWidth={1.6} /></IconBadge>
          <p className="text-[16px] text-ink-soft mb-6 leading-relaxed">
            Puoi parlare con La Guida direttamente su Telegram, in qualsiasi momento della giornata, anche senza aprire l&apos;app.
          </p>

          <div className={`${listCard} text-left mb-4`}>
            <p className="font-serif text-lg font-semibold text-ink mb-4">Come collegarla, in quattro passi</p>
            <div className="space-y-3">
              {[
                <>Apri Telegram e cerca <strong className="text-ink">@getidsbot</strong></>,
                <>Scrivigli qualsiasi messaggio: ti risponde con il tuo ID numerico</>,
                <>Vai su <strong className="text-ink">Profilo</strong> nell&apos;app e incolla il numero nel campo «La Guida su Telegram»</>,
                <>Cerca il bot The Way su Telegram e inizia a parlare con La Guida</>,
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-serif text-gold text-xl leading-none w-4 flex-shrink-0 mt-[-1px]">{i + 1}</span>
                  <p className="text-ink-soft text-sm leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted italic font-serif text-base">
            Puoi farlo ora o in qualsiasi momento dal tuo profilo. Non serve per iniziare.
          </p>
        </div>
      )
    },

    // SLIDE 5
    {
      eyebrow: 'Sei pronto?',
      title: 'Il primo passo è sempre l’ascolto.',
      content: (
        <div>
          <div className="relative overflow-hidden bg-night text-night-text rounded-2xl p-6 sm:p-7 mb-4 border border-night-line">
            <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-gold-light/10 blur-2xl pointer-events-none" aria-hidden />
            <Eyebrow tone="night" className="mb-2">Settimana 1</Eyebrow>
            <h3 className="font-serif text-[30px] font-semibold leading-tight mb-3">La voce nel deserto</h3>
            <p className="text-night-muted mb-5 leading-relaxed text-sm">
              Il cammino inizia dall&apos;origine: un sì detto nel buio, una nascita nella semplicità, un Dio che entra piano nella storia.
            </p>
            <Ornament tone="night" className="mb-5" />
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-gold-light flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                <span className="text-night-text">7 passi: 6 letture e 1 integrazione</span>
              </p>
              <p className="flex items-start gap-3">
                <Leaf className="w-4 h-4 text-gold-light flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                <span className="text-night-text">Tema: essere chiamati per nome, l&apos;amore che precede</span>
              </p>
            </div>
          </div>

          <div className={`${listCard}`}>
            <p className="text-ink-soft leading-relaxed text-[15px]">
              Questo percorso non ti chiede di diventare perfetto.
              Ti chiede di <strong className="text-ink font-semibold">lasciarti guardare</strong>.
            </p>
            <p className="text-muted mt-3 italic font-serif text-lg leading-snug">
              Fermarsi, respirare, aprire il cuore.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentContent = slides[currentSlide - 1];
  const isLastSlide = currentSlide === slides.length;

  return (
    <main
      className="min-h-screen bg-parchment"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-xl w-full mx-auto px-4">

        {/* Progress */}
        <div className="flex justify-center gap-1.5 py-4 sticky top-0 z-10 bg-gradient-to-b from-parchment via-parchment/95 to-transparent">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i + 1 === currentSlide ? 'w-8 bg-gold' : i + 1 < currentSlide ? 'w-2 bg-gold/50' : 'w-2 bg-line-strong'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div key={currentSlide} className="bg-paper rounded-3xl border border-line shadow-[var(--shadow-card)] p-6 sm:p-9 mb-5 animate-rise">
          <Eyebrow className="justify-center mb-3">{currentContent.eyebrow}</Eyebrow>
          <h1 className="font-serif text-[32px] sm:text-[36px] font-semibold text-ink text-center leading-[1.1] mb-7">
            {currentContent.title}
          </h1>
          {currentContent.content}
        </div>

        {/* Navigazione */}
        <div className="flex gap-3">
          {currentSlide > 1 && (
            <Button variant="secondary" size="lg" className="flex-1" onClick={() => setCurrentSlide(s => s - 1)}>
              <ArrowLeft strokeWidth={2} />
              Indietro
            </Button>
          )}

          {!isLastSlide ? (
            <Button size="lg" className="flex-1" onClick={() => setCurrentSlide(s => s + 1)}>
              Continua
              <ArrowRight strokeWidth={2.2} />
            </Button>
          ) : (
            <Button variant="gold" size="lg" className="flex-1" onClick={handleComplete} disabled={completing}>
              {completing ? <Loader2 className="animate-spin" /> : null}
              {completing ? 'Preparo…' : 'Inizia il cammino'}
            </Button>
          )}
        </div>

        {!isLastSlide && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-muted hover:text-ink mt-4 py-2 transition-colors"
          >
            Salta l&apos;introduzione
          </button>
        )}

      </div>
    </main>
  );
}
