'use client';

import { useEffect, useState } from 'react';
import { X, Share } from 'lucide-react';
import { CrossMark } from '@/components/ui';

/**
 * Banner discreto in fondo alla home che invita a installare la PWA.
 *  - Android/desktop: usa l'evento `beforeinstallprompt` (one-tap install)
 *  - iOS Safari: mostra istruzioni manuali (Condividi → Aggiungi alla schermata Home)
 *  - Si nasconde se già installata, se l'utente l'ha chiusa, o se non supportata.
 */
export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissedAt = localStorage.getItem('theway:installDismissedAt');
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 30) {
        setDismissed(true);
        return;
      }
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari custom prop
      window.navigator.standalone === true;
    if (isStandalone) {
      setDismissed(true);
      return;
    }

    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);

    if (isIos) {
      setShowIosHint(true);
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('theway:installDismissedAt', Date.now().toString());
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') handleDismiss();
    setDeferredPrompt(null);
  };

  if (dismissed) return null;
  if (!deferredPrompt && !showIosHint) return null;

  return (
    <div
      className="fixed left-3 right-3 z-40 bg-night text-night-text rounded-2xl shadow-[var(--shadow-float)] p-4 flex items-start gap-3 max-w-md mx-auto border border-night-line animate-rise"
      style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom) + 0.75rem)' }}
    >
      <div className="w-9 h-9 rounded-full bg-night-soft text-gold-light flex items-center justify-center flex-shrink-0">
        <CrossMark className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-lg font-semibold leading-tight">Aggiungi The Way alla home</p>
        {deferredPrompt ? (
          <p className="text-xs text-night-muted mt-1 leading-relaxed">Aprila come una vera app e ricevi la frase del giorno.</p>
        ) : (
          <p className="text-xs text-night-muted mt-1 leading-relaxed">
            Tocca <Share className="inline w-3 h-3 -mt-0.5" strokeWidth={2} /> <span className="font-medium text-night-text">Condividi</span> in Safari, poi <span className="font-medium text-night-text">«Aggiungi alla schermata Home»</span>.
          </p>
        )}
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-2.5 bg-gold-light text-night font-semibold text-xs px-3.5 py-1.5 rounded-full hover:bg-gold-soft transition-colors"
          >
            Installa
          </button>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-night-muted hover:text-night-text p-1 -mr-1 -mt-1 flex-shrink-0"
        aria-label="Chiudi"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
