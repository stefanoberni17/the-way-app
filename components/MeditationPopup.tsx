'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const DURATION_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

interface MeditationPopupProps {
  mantra: string;
  weekName: string;
  userId: string;
  manualOpen?: boolean;
  onClose?: () => void;
}

export default function MeditationPopup({
  mantra,
  weekName,
  userId,
  manualOpen = false,
  onClose,
}: MeditationPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'meditating'>('setup');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerComplete, setIsTimerComplete] = useState(false);
  const [audioMode, setAudioMode] = useState<'nature' | 'gospel' | 'mute'>('nature');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Controllo giornaliero (solo se non aperto manualmente)
  useEffect(() => {
    if (!userId || manualOpen) return;

    const checkMeditation = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data: profileData } = await supabase
        .from('profiles')
        .select('last_meditation_completed')
        .eq('user_id', userId)
        .single();

      const lastMeditation = profileData?.last_meditation_completed;

      if (!lastMeditation || lastMeditation !== today) {
        setIsFirstTime(!lastMeditation); // null = prima volta in assoluto
        setPhase('setup');
        setSelectedDuration(60);
        setIsTimerComplete(false);
        setShowPopup(true);
      }
    };

    checkMeditation();
  }, [userId]);

  // Apertura manuale tramite pulsante home page
  useEffect(() => {
    if (manualOpen) {
      setPhase('setup');
      setSelectedDuration(60);
      setIsTimerComplete(false);
      setShowPopup(true);
    }
  }, [manualOpen]);

  // Timer countdown — solo durante la meditazione
  useEffect(() => {
    if (!showPopup || phase !== 'meditating' || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showPopup, phase, timeLeft]);

  // Animazione respiro — solo durante la meditazione
  useEffect(() => {
    if (!showPopup || phase !== 'meditating') return;

    const breathTimer = setInterval(() => {
      setBreathPhase(prev => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000);

    return () => clearInterval(breathTimer);
  }, [showPopup, phase]);

  // Audio — solo durante la meditazione
  useEffect(() => {
    if (!showPopup || phase !== 'meditating') return;

    if (audioMode === 'mute') {
      audioRef.current?.pause();
      return;
    }

    const audioSrc =
      audioMode === 'nature'
        ? '/audio/nature-meditation.mp3'
        : '/audio/naruto-meditation.mp3'; // riutilizzato come musica ambient gospel

    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log('Audio autoplay blocked:', e));
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [showPopup, phase, audioMode]);

  const startMeditation = () => {
    setTimeLeft(selectedDuration);
    setIsTimerComplete(false);
    setPhase('meditating');
  };

  const handleSkip = () => {
    audioRef.current?.pause();
    setShowPopup(false);
    setPhase('setup');
    onClose?.();
  };

  const completeMeditation = async () => {
    if (!isTimerComplete) return;

    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('profiles')
      .update({ last_meditation_completed: today })
      .eq('user_id', userId);

    audioRef.current?.pause();
    setShowPopup(false);
    setPhase('setup');
    onClose?.();
  };

  if (!showPopup || !mantra) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 pb-24 animate-fadeIn overflow-y-auto">
      <audio ref={audioRef} />

      <div className="bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-10 relative animate-scaleIn my-auto border border-white/10">

        {phase === 'setup' ? (
          /* ── FASE SETUP ── */
          <>
            <div className="text-center mb-6">
              <div className="text-5xl md:text-6xl mb-3">
                {isFirstTime ? '🌱' : '🙏'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {isFirstTime ? 'Il tuo primo respiro' : 'Momento di preghiera'}
              </h2>
              <p className="text-xs md:text-sm text-blue-300 mb-2">{weekName}</p>
              <p className="text-sm md:text-base text-blue-100 font-medium leading-relaxed">
                {isFirstTime
                  ? 'Ogni grande cammino inizia con un respiro.\nPrenditi questo momento — è solo tuo.'
                  : 'Prenditi un momento solo per te'}
              </p>
            </div>

            {/* Versetto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 border border-white/20">
              {isFirstTime && (
                <p className="text-xs text-amber-400 font-semibold text-center mb-2 uppercase tracking-wide">
                  Il versetto della tua settimana
                </p>
              )}
              <p className="text-base md:text-lg text-blue-100 italic font-medium text-center leading-relaxed">
                &ldquo;{mantra}&rdquo;
              </p>
            </div>

            {/* Selezione durata */}
            <div className="mb-6">
              <p className="text-sm text-blue-200 text-center mb-3 font-medium">
                {isFirstTime ? '⏱️ Quanto tempo hai adesso?' : '⏱️ Quanto vuoi meditare?'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map(({ label, seconds: s }) => (
                  <button
                    key={s}
                    onClick={() => setSelectedDuration(s)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      selectedDuration === s
                        ? 'bg-amber-400 text-blue-900 shadow-lg scale-105'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Azioni */}
            <button
              onClick={startMeditation}
              className="w-full bg-white text-blue-900 font-bold py-3 md:py-4 rounded-2xl transition-all mb-3 text-sm md:text-base hover:bg-blue-50"
            >
              🙏 Inizia il momento di preghiera
            </button>
            <button
              onClick={handleSkip}
              className="w-full text-white/40 hover:text-white/70 text-sm py-2 transition-colors"
            >
              {isFirstTime ? 'Lo farò più tardi →' : 'Salta per oggi →'}
            </button>
          </>
        ) : (
          /* ── FASE MEDITAZIONE ── */
          <>
            {/* Pulsante per tornare al setup */}
            <button
              onClick={() => { audioRef.current?.pause(); setPhase('setup'); }}
              className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Interrompi meditazione"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="text-5xl md:text-6xl mb-3">🙏</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Respiro Consapevole
              </h2>
              <p className="text-xs md:text-sm text-blue-300 mb-2">{weekName}</p>
              <p className="text-sm md:text-base text-blue-100 font-medium">
                Questo momento è solo tuo
              </p>
            </div>

            {/* Versetto */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 border border-white/20">
              <p className="text-base md:text-lg text-blue-100 italic font-medium text-center leading-relaxed">
                &ldquo;{mantra}&rdquo;
              </p>
            </div>

            {/* Timer e animazione respiro */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-36 h-36 md:w-48 md:h-48 mb-4 md:mb-6">
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 transition-transform duration-[4000ms] ease-in-out ${
                    breathPhase === 'inhale' ? 'scale-100' : 'scale-75'
                  }`}
                  style={{ opacity: 0.7 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-1 md:mb-2">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs md:text-sm text-white/90 font-medium">
                      {breathPhase === 'inhale' ? '🌬️ Inspira...' : '💨 Espira...'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Audio */}
              <div className="flex gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full p-1.5 md:p-2">
                <button
                  onClick={() => setAudioMode('nature')}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    audioMode === 'nature'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  🌊 Natura
                </button>
                <button
                  onClick={() => setAudioMode('gospel')}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    audioMode === 'gospel'
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  🎵 Musica
                </button>
                <button
                  onClick={() => setAudioMode('mute')}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    audioMode === 'mute'
                      ? 'bg-gray-500 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  🔇
                </button>
              </div>
            </div>

            {/* Bottone completamento */}
            <button
              onClick={completeMeditation}
              disabled={!isTimerComplete}
              className={`w-full font-bold py-3 md:py-4 rounded-2xl transition-all text-sm md:text-base ${
                isTimerComplete
                  ? 'bg-white text-blue-900 hover:bg-blue-50 cursor-pointer'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isTimerComplete ? 'Continua 🌅' : 'Respira consapevolmente...'}
            </button>

            {!isTimerComplete && (
              <p className="text-xs text-center text-white/40 mt-3">
                Questo momento è solo tuo 💙
              </p>
            )}
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
