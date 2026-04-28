'use client';

import { useEffect, useState } from 'react';

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

    // Già nascosto in passato? Rispetta la scelta per 30 giorni.
    const dismissedAt = localStorage.getItem('theway:installDismissedAt');
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 30) {
        setDismissed(true);
        return;
      }
    }

    // Già in standalone (PWA installata) → niente banner
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
    <div className="fixed bottom-20 left-3 right-3 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 max-w-md mx-auto border border-slate-700">
      <div className="text-2xl flex-shrink-0">✝️</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Aggiungi The Way alla home</p>
        {deferredPrompt ? (
          <p className="text-xs text-slate-300 mt-0.5">Apri l&apos;app come una vera app, e ricevi la frase del giorno.</p>
        ) : (
          <p className="text-xs text-slate-300 mt-0.5">
            Tocca <span className="font-semibold">Condividi</span> nella barra Safari, poi <span className="font-semibold">«Aggiungi alla schermata Home»</span>.
          </p>
        )}
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
          >
            Installa
          </button>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-white text-lg flex-shrink-0 leading-none"
        aria-label="Chiudi"
      >
        ×
      </button>
    </div>
  );
}
