'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';

interface Props {
  /** URL pubblico di un file audio (mp3/m4a). Se assente, fallback a TTS Web Speech API. */
  audioUrl?: string;
  /** Testo da leggere col TTS quando audioUrl è vuoto. */
  fallbackText: string;
  /** Numero del passo, usato per persistere la posizione di lettura del file. */
  episodeNumber: number;
}

const SPEEDS = [1, 1.25, 1.5] as const;

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const shellCls = 'bg-paper-warm rounded-2xl p-3 border border-line';
const playCls =
  'w-11 h-11 rounded-full bg-ink text-paper hover:bg-night flex items-center justify-center transition-all flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4';
const speedCls =
  'text-xs font-semibold text-ink-soft bg-paper px-2.5 h-9 min-w-[46px] rounded-full border border-line hover:border-gold hover:text-gold-deep transition-all flex-shrink-0';

export default function EpisodeAudioPlayer({ audioUrl, fallbackText, episodeNumber }: Props) {
  const hasFile = Boolean(audioUrl?.trim());
  return hasFile ? (
    <FilePlayer audioUrl={audioUrl!} episodeNumber={episodeNumber} />
  ) : (
    <TTSPlayer text={fallbackText} />
  );
}

// ============================================
// Player file mp3/m4a
// ============================================
function FilePlayer({ audioUrl, episodeNumber }: { audioUrl: string; episodeNumber: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<typeof SPEEDS[number]>(1);

  const storageKey = `theway:audio:ep${episodeNumber}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const saved = parseFloat(localStorage.getItem(storageKey) || '0');
    if (saved > 0 && isFinite(saved)) {
      audio.currentTime = saved;
      setCurrent(saved);
    }

    const onTime = () => {
      setCurrent(audio.currentTime);
      localStorage.setItem(storageKey, audio.currentTime.toString());
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      setPlaying(false);
      localStorage.removeItem(storageKey);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [storageKey]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch (e) {
        console.error('Audio play error:', e);
      }
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = v;
    setCurrent(v);
  };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(i + 1) % SPEEDS.length]);
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className={shellCls}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <button onClick={toggle} className={playCls} aria-label={playing ? 'Pausa' : 'Ascolta'}>
          {playing ? <Pause strokeWidth={2.2} /> : <Play strokeWidth={2.2} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="py-2 -my-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={seek}
              className="range-gold cursor-pointer"
              style={{ ['--range-pct' as string]: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted tabular-nums">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button onClick={cycleSpeed} className={speedCls} aria-label="Velocità riproduzione">
          {speed}×
        </button>
      </div>
    </div>
  );
}

// ============================================
// Player TTS (fallback, Web Speech API)
// ============================================
function TTSPlayer({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<typeof SPEEDS[number]>(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getMaleItalianVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const italian = voices.filter((v) => v.lang.startsWith('it'));
    const maleNames = ['Luca', 'Cosimo', 'Giorgio'];
    return italian.find((v) => maleNames.some((n) => v.name.includes(n))) || italian[0] || null;
  };

  const launch = (voice: SpeechSynthesisVoice | null) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = 0.82 * speed;
    u.pitch = voice ? 0.9 : 0.8;
    if (voice) u.voice = voice;
    u.onend = () => { setSpeaking(false); setPaused(false); };
    u.onerror = () => { setSpeaking(false); setPaused(false); };
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setSpeaking(true);
    setPaused(false);
  };

  const start = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const tryStart = () => launch(getMaleItalianVoice());
    if (window.speechSynthesis.getVoices().length > 0) {
      tryStart();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', tryStart, { once: true });
    }
  };

  const toggle = () => {
    if (!speaking) {
      start();
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    const next = SPEEDS[(i + 1) % SPEEDS.length];
    setSpeed(next);
    if (speaking) {
      const wasPaused = paused;
      window.speechSynthesis.cancel();
      setTimeout(() => {
        if (!wasPaused) {
          const u = utteranceRef.current;
          if (u) {
            u.rate = 0.82 * next;
            window.speechSynthesis.speak(u);
          }
        }
      }, 50);
    }
  };

  const showStop = speaking;
  const isActive = speaking && !paused;

  return (
    <div className={shellCls}>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className={playCls} aria-label={isActive ? 'Pausa' : 'Ascolta'}>
          {isActive ? <Pause strokeWidth={2.2} /> : <Play strokeWidth={2.2} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink leading-tight flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-gold" strokeWidth={2} />
            {speaking ? (paused ? 'In pausa' : 'In lettura…') : 'Audiolettura'}
          </p>
          <p className="text-[11px] text-muted mt-0.5">Voce sintetica del browser</p>
        </div>

        {showStop && (
          <button
            onClick={stop}
            className="w-9 h-9 rounded-full bg-paper border border-line text-muted hover:text-ink flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Ferma"
          >
            <Square className="w-3.5 h-3.5" strokeWidth={2.2} />
          </button>
        )}
        <button onClick={cycleSpeed} className={speedCls} aria-label="Velocità riproduzione">
          {speed}×
        </button>
      </div>
    </div>
  );
}
