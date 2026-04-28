'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandCross from '@/components/BrandCross';
import { BookOpen, Eye, Calendar, Leaf, MessageCircle, Smartphone, Target } from 'lucide-react';

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
        console.error('❌ Errore update onboarding:', error);
        alert('Errore nel salvataggio. Riprova.');
        setCompleting(false);
        return;
      }

      console.log('✅ Onboarding completato!');
      router.push('/');

    } catch (error) {
      console.error('❌ Errore imprevisto:', error);
      alert('Errore imprevisto. Riprova.');
      setCompleting(false);
    }
  };

  const slides = [
    // SLIDE 1
    {
      title: "Benvenuto in The Way",
      subtitle: "La Via del Cuore",
      content: (
        <div className="text-center max-w-2xl mx-auto">
          <BrandCross className="mx-auto mb-5" size={64} />
          <p className="text-base md:text-lg text-stone-700 leading-relaxed mb-6 font-medium">
            Il Vangelo non è solo un testo antico da studiare.<br/>
            È una Parola viva che parla a ogni cuore, oggi.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-left space-y-3 text-stone-700">
            <p className="flex items-start gap-3">
              <span className="text-amber-600 mt-1 font-bold">·</span>
              <span>Incontrare Gesù attraverso i racconti evangelici</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-amber-600 mt-1 font-bold">·</span>
              <span>Riconoscere la tua storia nella storia dei personaggi biblici</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-amber-600 mt-1 font-bold">·</span>
              <span>Crescere interiormente attraverso la contemplazione e la pratica</span>
            </p>
          </div>
          <p className="text-stone-600 mt-6 italic font-serif">
            Questo percorso nasce per aiutarti a lasciarti toccare<br/>
            dalla Parola in modo più profondo, più vero.
          </p>
        </div>
      )
    },

    // SLIDE 2
    {
      title: "Un cammino fatto di piccoli passi",
      subtitle: "",
      content: (
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            {
              Icon: BookOpen,
              title: 'Passi progressivi',
              body: 'I passi si sbloccano uno alla volta. Completa uno per passare al successivo. Non è una corsa. È un invito a darti tempo con la Parola.',
            },
            {
              Icon: Eye,
              title: 'Lectio + Riflessione personale',
              body: "Ogni passo ha una mini-lezione, una guida all'osservazione e una domanda riflessiva. Leggi, osserva, lasciati interrogare.",
            },
            {
              Icon: Calendar,
              title: 'Settimane tematiche',
              body: "Ogni coppia di settimane esplori un tema evangelico: l'Annunciazione, il Battesimo, il deserto, la chiamata dei discepoli...",
            },
            {
              Icon: Leaf,
              title: 'Pratiche concrete',
              body: 'Ogni settimana ha pratiche semplici e un versetto da portare con sé — semi da piantare nella vita quotidiana.',
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="bg-stone-50 border border-stone-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-amber-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-stone-700 leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },

    // SLIDE 3
    {
      title: "Questo cammino ha un ritmo lento",
      subtitle: "E lo fa di proposito",
      content: (
        <div className="max-w-xl mx-auto text-center">
          <p className="text-base md:text-lg text-stone-700 mb-6 leading-relaxed font-serif italic">
            Capire qualcosa è veloce.<br/>
            <strong className="not-italic font-bold text-slate-900">Lasciarsi trasformare, no.</strong>
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-6 text-left">
            <p className="text-stone-700 mb-3 leading-relaxed text-sm">
              È come il seme nel Vangelo: caduto nella terra, cresce <strong className="text-slate-900">nel silenzio e nel tempo</strong>.
              Non puoi affrettare la sua crescita.
            </p>
            <p className="text-stone-500 text-sm italic font-serif border-l-2 border-amber-400 pl-3">
              &ldquo;La terra produce spontaneamente prima l&apos;erba, poi la spiga, poi il grano pieno nella spiga.&rdquo;
              <span className="not-italic text-xs ml-1 text-amber-700">— Mc 4,28</span>
            </p>
          </div>

          <p className="text-stone-700 mb-7 font-medium">
            Qui non stiamo correndo verso un risultato.<br/>
            Stiamo imparando ad ascoltare.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-amber-700" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif font-bold text-slate-900">Il tuo alleato: La Guida</h3>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              Il chatbot conosce dove sei nel cammino. Ti accompagna senza anticipare,
              ti aiuta a riflettere e a portare la Parola nella vita.
            </p>
          </div>
        </div>
      )
    },

    // SLIDE 4 - Telegram (facoltativo)
    {
      title: "La Guida anche su Telegram",
      subtitle: "Facoltativo, ma comodo",
      content: (
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto mb-5 flex items-center justify-center">
            <Smartphone className="w-7 h-7 text-amber-700" strokeWidth={1.75} />
          </div>
          <p className="text-base md:text-lg text-stone-700 mb-6 leading-relaxed">
            Puoi parlare con La Guida direttamente su Telegram,
            in qualsiasi momento della giornata — anche senza aprire l&apos;app.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-left mb-4">
            <p className="font-serif font-bold text-slate-900 mb-4">Come collegarlo in 4 passi:</p>
            <div className="space-y-3">
              {[
                <>Apri Telegram e cerca <strong>@getidsbot</strong></>,
                <>Scrivili qualsiasi messaggio — ti risponde con il tuo ID numerico</>,
                <>Vai su <strong>Profilo</strong> nell&apos;app e incolla il numero nel campo &laquo;Collega Telegram&raquo;</>,
                <>Cerca il bot The Way su Telegram e inizia a parlare con La Guida</>,
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="bg-amber-500 text-slate-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-stone-700 text-sm leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <p className="text-sm text-stone-500 italic">
              Puoi farlo ora o in qualsiasi momento dal tuo profilo.
              Non è necessario per iniziare il percorso.
            </p>
          </div>
        </div>
      )
    },

    // SLIDE 5 - Ultimo slide: prima settimana
    {
      title: "Sei pronto per iniziare?",
      subtitle: "",
      content: (
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-900 text-white rounded-xl p-7 mb-5 border border-slate-700 shadow-md">
            <p className="text-xs text-amber-400 mb-2 uppercase tracking-[0.2em] font-semibold">Week 1-2</p>
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">La voce nel deserto</h3>
            <p className="text-slate-300 mb-5 leading-relaxed text-sm">
              Il cammino inizia dall&apos;origine: Giovanni che prepara la Via, Gesù che entra nella storia.
              Chi siamo noi in questo incontro?
            </p>
            <div className="space-y-2.5 text-sm bg-white/[0.05] rounded-lg p-4 border border-white/10">
              <p className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <span className="text-slate-200">Passi: 1–4</span>
              </p>
              <p className="flex items-start gap-2.5">
                <Target className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <span className="text-slate-200">Tema: Essere chiamati per nome — l&apos;amore che precede</span>
              </p>
              <p className="flex items-start gap-2.5 font-serif italic">
                <span className="text-amber-400 flex-shrink-0 mt-0.5">&ldquo;</span>
                <span className="text-slate-200">Tu sei il mio figlio amato, in te ho posto il mio compiacimento.<span className="not-italic font-sans text-xs text-amber-400/80 ml-1">— Mc 1,11</span></span>
              </p>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <p className="text-stone-700 leading-relaxed text-sm">
              Questo percorso non ti chiede di diventare perfetto.
              Ti chiede di <strong className="text-slate-900">lasciarti guardare</strong>.
            </p>
            <p className="text-stone-500 mt-3 text-sm italic font-serif">
              Il primo passo è sempre l&apos;ascolto: fermarsi, respirare, aprire il cuore.
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
      className="min-h-screen bg-slate-900 overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-3xl w-full mx-auto px-4">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6 sticky top-0 py-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-transparent z-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === currentSlide
                  ? 'w-8 bg-amber-400'
                  : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Card — niente min-height, scroll naturale */}
        <div className="bg-white rounded-xl shadow-md border border-stone-200/60 p-6 md:p-10 mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-2 font-serif leading-tight">
            {currentContent.title}
          </h1>
          {currentContent.subtitle && (
            <p className="text-center text-stone-500 mb-6 italic text-sm md:text-base">{currentContent.subtitle}</p>
          )}
          <div className="mt-6">
            {currentContent.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentSlide > 1 && (
            <button
              onClick={() => setCurrentSlide(s => s - 1)}
              className="flex-1 bg-white/10 border border-white/20 text-white font-semibold py-4 rounded-xl hover:bg-white/20 transition-all"
            >
              ← Indietro
            </button>
          )}

          {!isLastSlide ? (
            <button
              onClick={() => setCurrentSlide(s => s + 1)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-sm"
            >
              Continua →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {completing ? (
                <>
                  <span className="animate-spin">⏳</span> Preparazione...
                </>
              ) : (
                <>Inizia il cammino</>
              )}
            </button>
          )}
        </div>

        {/* Skip link */}
        {!isLastSlide && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-white/50 hover:text-white/80 mt-4 transition-colors"
          >
            Salta introduzione →
          </button>
        )}

      </div>
    </main>
  );
}
