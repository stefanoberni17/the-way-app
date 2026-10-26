'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

interface Props {
  /** URL pubblico di un file audio (mp3/m4a). Se assente, fallback a TTS Web Speech API. */
  audioUrl?: string;
  /** Testo da leggere col TTS quando audioUrl è vuoto. */
  fallbackText: string;
  /** Numero del passo, usato per persistere la posizione di lettura del file. */
  episodeNumber: number;
}

const SPEEDS = [1, 1.25, 1.5] as const;
type Speed = typeof SPEEDS[number];

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const shellCls = 'bg-paper-warm rounded-2xl p-3 border border-line';
const playCls =
  'w-11 h-11 rounded-full bg-ink text-paper hover:bg-night flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40 [&>svg]:w-4 [&>svg]:h-4';
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
  const [speed, setSpeed] = useState<Speed>(1);

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
//
// Perché è fatto così:
//  - Chrome interrompe silenziosamente le utterance lunghe (~15 s) e può
//    "perdere" l'utterance se viene garbage-collected: leggiamo il testo a
//    pezzi brevi (una o due frasi) tenendo i riferimenti in un ref.
//  - iOS Safari accetta speak() solo dentro il gesto dell'utente e non
//    garantisce l'evento voiceschanged: non aspettiamo le voci, partiamo
//    subito con lang="it-IT" e scegliamo una voce italiana se già c'è.
//  - Safari ignora speak() chiamato subito dopo cancel(): facciamo cancel()
//    solo se qualcosa sta davvero parlando.
// ============================================

const MAX_CHUNK = 180;

function splitIntoChunks(text: string): string[] {
  const clean = text
    .replace(/[«»"“”]/g, '')
    .replace(/[✦•·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];

  // Prima per frasi, poi accorpiamo finché restiamo sotto MAX_CHUNK
  const sentences = clean.match(/[^.!?;:…]+[.!?;:…]+["»”]?|[^.!?;:…]+$/g) || [clean];
  const chunks: string[] = [];
  let buf = '';
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length > MAX_CHUNK) {
      // frase molto lunga: spezza sulle virgole
      if (buf) { chunks.push(buf); buf = ''; }
      let piece = '';
      for (const part of s.split(/(?<=,)\s+/)) {
        if ((piece + ' ' + part).trim().length > MAX_CHUNK && piece) {
          chunks.push(piece.trim());
          piece = part;
        } else {
          piece = (piece + ' ' + part).trim();
        }
      }
      if (piece) chunks.push(piece.trim());
      continue;
    }
    if ((buf + ' ' + s).trim().length > MAX_CHUNK && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = (buf + ' ' + s).trim();
    }
  }
  if (buf) chunks.push(buf.trim());
  return chunks;
}

function pickItalianVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis.getVoices();
    const italian = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('it'));
    if (italian.length === 0) return null;
    const preferred = ['Luca', 'Alice', 'Federica', 'Cosimo', 'Giorgio', 'Google italiano', 'Italia'];
    for (const name of preferred) {
      const hit = italian.find(v => v.name.includes(name));
      if (hit) return hit;
    }
    return italian.find(v => v.localService) || italian[0];
  } catch {
    return null;
  }
}

type TTSStatus = 'idle' | 'speaking' | 'paused' | 'done' | 'error' | 'unsupported';

function TTSPlayer({ text }: { text: string }) {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [speed, setSpeed] = useState<Speed>(1);
  const [index, setIndex] = useState(0);

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const speedRef = useRef<Speed>(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stoppedRef = useRef(false);
  const sessionRef = useRef(0);

  useEffect(() => {
    chunksRef.current = splitIntoChunks(text);
  }, [text]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setStatus('unsupported');
      return;
    }
    // Pre-carica la lista voci (su Chrome arriva in modo asincrono)
    try { window.speechSynthesis.getVoices(); } catch { /* noop */ }
  }, []);

  // Cleanup all'unmount (cambio step o pagina)
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    };
  }, []);

  const speakFrom = useCallback((start: number) => {
    const chunks = chunksRef.current;
    const synth = window.speechSynthesis;
    const session = ++sessionRef.current;
    stoppedRef.current = false;

    const speakChunk = (i: number) => {
      if (stoppedRef.current || session !== sessionRef.current) return;
      if (i >= chunks.length) {
        setStatus('done');
        setIndex(chunks.length);
        return;
      }
      indexRef.current = i;
      setIndex(i);

      const u = new SpeechSynthesisUtterance(chunks[i]);
      u.lang = 'it-IT';
      u.rate = 0.9 * speedRef.current;
      u.pitch = 0.95;
      const voice = pickItalianVoice();
      if (voice) u.voice = voice;

      u.onend = () => {
        if (stoppedRef.current || session !== sessionRef.current) return;
        speakChunk(i + 1);
      };
      u.onerror = (e) => {
        // "interrupted"/"canceled" arrivano quando siamo noi a fermare: ignorali
        const code = (e as SpeechSynthesisErrorEvent).error;
        if (code === 'interrupted' || code === 'canceled') return;
        if (stoppedRef.current || session !== sessionRef.current) return;
        console.error('TTS error:', code);
        setStatus('error');
      };

      utterRef.current = u; // evita la GC dell'utterance (bug Chrome)
      synth.speak(u);
    };

    // Safari: cancel() seguito subito da speak() può perdere l'utterance.
    // Cancelliamo solo se c'è davvero qualcosa in coda.
    if (synth.speaking || synth.pending) synth.cancel();
    setStatus('speaking');
    speakChunk(start);
  }, []);

  const start = () => {
    if (chunksRef.current.length === 0) return;
    speakFrom(0);
  };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (status === 'idle' || status === 'done' || status === 'error') {
      start();
      return;
    }
    if (status === 'speaking') {
      try { synth.pause(); } catch { /* noop */ }
      setStatus('paused');
      return;
    }
    if (status === 'paused') {
      // Su iOS resume() a volte non riparte: se non sta più parlando, ripartiamo dal pezzo corrente
      try { synth.resume(); } catch { /* noop */ }
      setStatus('speaking');
      setTimeout(() => {
        if (!synth.speaking && !stoppedRef.current) speakFrom(indexRef.current);
      }, 350);
    }
  };

  const stop = () => {
    stoppedRef.current = true;
    sessionRef.current++;
    try { window.speechSynthesis.cancel(); } catch { /* noop */ }
    setStatus('idle');
    setIndex(0);
    indexRef.current = 0;
  };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(speed);
    const next = SPEEDS[(i + 1) % SPEEDS.length];
    setSpeed(next);
    speedRef.current = next;
    // Il rate non è modificabile a caldo: ripartiamo dal pezzo corrente
    if (status === 'speaking' || status === 'paused') {
      const from = indexRef.current;
      stoppedRef.current = true;
      sessionRef.current++;
      try { window.speechSynthesis.cancel(); } catch { /* noop */ }
      setTimeout(() => speakFrom(from), 120);
    }
  };

  if (status === 'unsupported') {
    return (
      <div className={shellCls}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-parchment text-muted flex items-center justify-center flex-shrink-0">
            <VolumeX className="w-4 h-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink leading-tight">Audiolettura non disponibile</p>
            <p className="text-[11px] text-muted mt-0.5">Questo browser non supporta la sintesi vocale.</p>
          </div>
        </div>
      </div>
    );
  }

  const total = chunksRef.current.length;
  const isActive = status === 'speaking';
  const pct = total > 0 ? Math.min(100, (index / total) * 100) : 0;
  const label =
    status === 'speaking' ? 'In lettura…'
    : status === 'paused' ? 'In pausa'
    : status === 'done' ? 'Lettura terminata'
    : status === 'error' ? 'Lettura interrotta. Riprova.'
    : 'Ascolta il passo';

  return (
    <div className={shellCls}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className={playCls}
          disabled={total === 0}
          aria-label={isActive ? 'Pausa' : 'Ascolta'}
        >
          {isActive ? <Pause strokeWidth={2.2} /> : <Play strokeWidth={2.2} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink leading-tight flex items-center gap-1.5">
            <Volume2 className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-muted'}`} strokeWidth={2} />
            {label}
          </p>
          {status === 'idle' ? (
            <p className="text-[11px] text-muted mt-0.5">Voce del dispositivo</p>
          ) : (
            <div className="mt-2 h-1 rounded-full bg-parchment-deep overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>

        {(status === 'speaking' || status === 'paused') && (
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
