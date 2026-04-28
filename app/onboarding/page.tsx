'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
          <div className="text-5xl md:text-6xl mb-6">✝️</div>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6 font-medium">
            Il Vangelo non è solo un testo antico da studiare.<br/>
            È una Parola viva che parla a ogni cuore, oggi.
          </p>
          <div className="bg-blue-50 rounded-xl p-6 text-left space-y-3 text-gray-700">
            <p className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">•</span>
              <span>Incontrare Gesù attraverso i racconti evangelici</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">•</span>
              <span>Riconoscere la tua storia nella storia dei personaggi biblici</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">•</span>
              <span>Crescere interiormente attraverso la contemplazione e la pratica</span>
            </p>
          </div>
          <p className="text-gray-600 mt-6 italic">
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
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <span className="text-3xl">📖</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Passi progressivi</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  I passi si sbloccano uno alla volta. Completa uno per passare al successivo.
                  Non è una corsa. È un invito a darti tempo con la Parola.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-5 border-l-4 border-indigo-500">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🪞</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Lectio + Riflessione personale</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ogni passo ha una mini-lezione, una guida all'osservazione e una domanda riflessiva.
                  Leggi, osserva, lasciati interrogare.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-5 border-l-4 border-amber-400">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🗓️</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Settimane tematiche</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ogni coppia di settimane esplori un tema evangelico: l'Annunciazione, il Battesimo, il deserto, la chiamata dei discepoli...
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-5 border-l-4 border-green-400">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🌿</span>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Pratiche concrete</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ogni settimana ha pratiche semplici e un versetto da portare con sé — semi da piantare nella vita quotidiana.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // SLIDE 3
    {
      title: "Questo cammino ha un ritmo lento",
      subtitle: "E lo fa di proposito",
      content: (
        <div className="max-w-xl mx-auto text-center">
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Capire qualcosa è veloce.<br/>
            <strong>Lasciarsi trasformare, no.</strong>
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 text-left">
            <p className="text-gray-700 mb-3 leading-relaxed">
              È come il seme nel Vangelo: caduto nella terra, cresce <strong>nel silenzio e nel tempo</strong>.
              Non puoi affrettare la sua crescita.
            </p>
            <p className="text-gray-600 text-sm italic">
              "La terra produce spontaneamente prima l'erba, poi la spiga, poi il grano pieno nella spiga." (Mc 4,28)
            </p>
          </div>

          <p className="text-gray-700 mb-8 font-medium">
            Qui non stiamo correndo verso un risultato.<br/>
            Stiamo imparando ad ascoltare.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💬</span>
              <h3 className="font-bold text-gray-800">Il tuo alleato: La Guida</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
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
          <div className="text-5xl md:text-6xl mb-5">📱</div>
          <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
            Puoi parlare con La Guida direttamente su Telegram,
            in qualsiasi momento della giornata — anche senza aprire l'app.
          </p>

          <div className="bg-blue-50 rounded-xl p-6 text-left mb-4">
            <p className="font-semibold text-gray-800 mb-4">Come collegarlo in 4 passi:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                <p className="text-gray-700 text-sm">Apri Telegram e cerca <strong>@getidsbot</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                <p className="text-gray-700 text-sm">Scrivili qualsiasi messaggio — ti risponde con il tuo ID numerico</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                <p className="text-gray-700 text-sm">Vai su <strong>Profilo</strong> nell'app e incolla il numero nel campo "Collega Telegram"</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                <p className="text-gray-700 text-sm">Cerca il bot The Way su Telegram e inizia a parlare con La Guida</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-sm text-gray-500 italic">
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
          <div className="bg-gradient-to-br from-blue-800 to-indigo-700 text-white rounded-2xl p-8 mb-6 shadow-xl">
            <p className="text-sm text-blue-200 mb-2 uppercase tracking-wide font-semibold">Week 1-2</p>
            <h3 className="text-3xl font-bold mb-4">La voce nel deserto</h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Il cammino inizia dall'origine: Giovanni che prepara la Via, Gesù che entra nella storia.
              Chi siamo noi in questo incontro?
            </p>
            <div className="space-y-2 text-sm bg-white/10 rounded-xl p-4">
              <p className="flex items-center gap-2">
                <span>✝️</span> Passi: 1–4
              </p>
              <p className="flex items-center gap-2">
                <span>🎯</span> Tema: Essere chiamati per nome — l'amore che precede
              </p>
              <p className="flex items-center gap-2">
                <span>📖</span> Versetto: "Tu sei il mio figlio amato, in te ho posto il mio compiacimento." (Mc 1,11)
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-6 border-l-4 border-amber-400">
            <p className="text-gray-700 leading-relaxed text-sm">
              Questo percorso non ti chiede di diventare perfetto.
              Ti chiede di <strong>lasciarti guardare</strong>.
            </p>
            <p className="text-gray-600 mt-3 text-sm italic">
              Il primo passo è sempre l'ascolto: fermarsi, respirare, aprire il cuore.
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
      className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-blue-900 overflow-y-auto"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="max-w-4xl w-full mx-auto px-4">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6 sticky top-0 py-3 bg-gradient-to-b from-blue-950 via-blue-950/95 to-blue-950/0 z-10">
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
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 mb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2 font-serif leading-tight">
            {currentContent.title}
          </h1>
          {currentContent.subtitle && (
            <p className="text-center text-gray-500 mb-6 italic text-sm md:text-base">{currentContent.subtitle}</p>
          )}
          <div className="mt-6">
            {currentContent.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
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
              className="flex-1 bg-white text-blue-800 font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-xl"
            >
              Continua →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {completing ? (
                <>
                  <span className="animate-spin">⏳</span> Preparazione...
                </>
              ) : (
                <>✝️ Inizia il cammino</>
              )}
            </button>
          )}
        </div>

        {/* Skip link */}
        {!isLastSlide && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-white/40 hover:text-white/70 mt-4 transition-colors"
          >
            Salta introduzione →
          </button>
        )}

      </div>
    </main>
  );
}
