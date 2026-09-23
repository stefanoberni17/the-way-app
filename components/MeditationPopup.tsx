'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Waves, Music, VolumeX } from 'lucide-react';
import { Button, Eyebrow, Ornament, CrossMark } from '@/components/ui';

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
        setIsFirstTime(!lastMeditation);
        setPhase('setup');
        setSelectedDuration(60);
        setIsTimerComplete(false);
        setShowPopup(true);
      }
    };

    checkMeditation();
  }, [userId]);

  useEffect(() => {
    if (manualOpen) {
      setPhase('setup');
      setSelectedDuration(60);
      setIsTimerComplete(false);
      setShowPopup(true);
    }
  }, [manualOpen]);

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

  useEffect(() => {
    if (!showPopup || phase !== 'meditating') return;

    const breathTimer = setInterval(() => {
      setBreathPhase(prev => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 4000);

    return () => clearInterval(breathTimer);
  }, [showPopup, phase]);

  useEffect(() => {
    if (!showPopup || phase !== 'meditating') return;

    if (audioMode === 'mute') {
      audioRef.current?.pause();
      return;
    }

    const audioSrc =
      audioMode === 'nature'
        ? '/audio/nature-meditation.mp3'
        : '/audio/Canti-gregoriani.mp3';

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

  const audioOptions: Array<{ id: 'nature' | 'gospel' | 'mute'; label: string; Icon: typeof Waves }> = [
    { id: 'nature', label: 'Natura', Icon: Waves },
    { id: 'gospel', label: 'Canto', Icon: Music },
    { id: 'mute', label: 'Silenzio', Icon: VolumeX },
  ];

  return (
    <div
      className="fixed inset-0 bg-night/85 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in overflow-y-auto"
      style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
    >
      <audio ref={audioRef} />

      <div className="relative bg-night text-night-text rounded-3xl shadow-[var(--shadow-float)] w-full max-w-md p-7 sm:p-9 my-auto border border-night-line overflow-hidden animate-scale-in">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gold-light/10 blur-3xl pointer-events-none" aria-hidden />

        {phase === 'setup' ? (
          /* ── SETUP ── */
          <div className="relative">
            <div className="text-center mb-6">
              <CrossMark className="w-6 h-6 text-gold-light mx-auto mb-4" />
              <Eyebrow tone="night" className="justify-center mb-2">{weekName}</Eyebrow>
              <h2 className="font-serif text-[32px] font-semibold leading-tight mb-2">
                {isFirstTime ? 'Il tuo primo respiro' : 'Momento di preghiera'}
              </h2>
              <p className="text-sm text-night-muted leading-relaxed whitespace-pre-line">
                {isFirstTime
                  ? 'Ogni grande cammino inizia con un respiro.\nPrenditi questo momento: è solo tuo.'
                  : 'Prenditi un momento solo per te.'}
              </p>
            </div>

            <Ornament tone="night" className="mb-5" />

            <p className="font-serif italic text-[22px] leading-[1.35] text-center text-night-text mb-7 whitespace-pre-line">
              {mantra}
            </p>

            <p className="text-[11px] text-night-muted text-center uppercase tracking-[0.18em] mb-3">
              {isFirstTime ? 'Quanto tempo hai adesso?' : 'Quanto vuoi fermarti?'}
            </p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {DURATION_OPTIONS.map(({ label, seconds: s }) => (
                <button
                  key={s}
                  onClick={() => setSelectedDuration(s)}
                  className={`py-2.5 rounded-full text-sm font-semibold transition-all ${
                    selectedDuration === s
                      ? 'bg-gold-light text-night'
                      : 'bg-night-soft text-night-text border border-night-line hover:border-gold-light/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <Button variant="night" full size="lg" onClick={startMeditation}>
              Inizia
            </Button>
            <button
              onClick={handleSkip}
              className="w-full text-night-muted hover:text-night-text text-sm py-3 mt-1 transition-colors"
            >
              {isFirstTime ? 'Lo farò più tardi' : 'Salta per oggi'}
            </button>
          </div>
        ) : (
          /* ── MEDITAZIONE ── */
          <div className="relative">
            <button
              onClick={() => { audioRef.current?.pause(); setPhase('setup'); }}
              className="absolute -top-2 -right-2 w-9 h-9 rounded-full text-night-muted hover:text-night-text hover:bg-night-soft flex items-center justify-center transition-colors"
              aria-label="Interrompi meditazione"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>

            <div className="text-center mb-6 pt-2">
              <Eyebrow tone="night" className="justify-center mb-2">{weekName}</Eyebrow>
              <h2 className="font-serif text-[30px] font-semibold leading-tight">Respira</h2>
            </div>

            <p className="font-serif italic text-lg leading-snug text-center text-night-muted mb-8 whitespace-pre-line px-2">
              {mantra}
            </p>

            {/* Respiro */}
            <div className="flex flex-col items-center mb-7">
              <div className="relative w-44 h-44 mb-6">
                <div
                  className={`absolute inset-0 rounded-full bg-gold-light/15 transition-transform duration-[4000ms] ease-in-out ${
                    breathPhase === 'inhale' ? 'scale-100' : 'scale-[0.62]'
                  }`}
                />
                <div
                  className={`absolute inset-6 rounded-full border border-gold-light/40 transition-transform duration-[4000ms] ease-in-out ${
                    breathPhase === 'inhale' ? 'scale-100' : 'scale-75'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-serif text-5xl text-night-text tabular-nums leading-none mb-2">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[11px] text-gold-light uppercase tracking-[0.22em]">
                      {breathPhase === 'inhale' ? 'Inspira' : 'Espira'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio */}
              <div className="flex gap-1 bg-night-soft rounded-full p-1 border border-night-line">
                {audioOptions.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setAudioMode(id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      audioMode === id
                        ? 'bg-gold-light text-night'
                        : 'text-night-muted hover:text-night-text'
                    }`}
                    aria-pressed={audioMode === id}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="night" full size="lg" onClick={completeMeditation} disabled={!isTimerComplete}>
              {isTimerComplete ? 'Continua' : 'Resta qui ancora un poco…'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
