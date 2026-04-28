'use client';

import { useEffect, useRef, useState } from 'react';

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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm shadow-sm transition-all flex-shrink-0"
          aria-label={playing ? 'Pausa' : 'Ascolta'}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            onChange={seek}
            className="w-full h-1 accent-blue-600 cursor-pointer"
          />
          <div className="flex items-center justify-between mt-1 text-[10px] text-blue-700/70 font-medium">
            <span>{formatTime(current)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={cycleSpeed}
          className="text-[11px] font-bold text-blue-700 bg-white px-2 py-1 rounded-md border border-blue-200 hover:bg-blue-50 transition-all flex-shrink-0"
          aria-label="Velocità riproduzione"
        >
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
    // Se sta già parlando, riavvia con la nuova velocità (Web Speech non supporta rate dinamico)
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm shadow-sm transition-all flex-shrink-0"
          aria-label={isActive ? 'Pausa' : 'Ascolta'}
        >
          {isActive ? '⏸' : '▶'}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-blue-700 leading-tight">
            {speaking ? (paused ? 'In pausa' : 'In lettura...') : '🔊 Audiolettura'}
          </p>
          <p className="text-[10px] text-blue-600/60 italic">Voce sintetica del browser</p>
        </div>

        {showStop && (
          <button
            onClick={stop}
            className="text-[11px] font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 transition-all flex-shrink-0"
            aria-label="Ferma"
          >
            ⬛
          </button>
        )}
        <button
          onClick={cycleSpeed}
          className="text-[11px] font-bold text-blue-700 bg-white px-2 py-1 rounded-md border border-blue-200 hover:bg-blue-50 transition-all flex-shrink-0"
          aria-label="Velocità riproduzione"
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}
