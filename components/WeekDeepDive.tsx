'use client';

interface WeekDeepDiveProps {
  preghiera: string;
  integrazione: string;
  onOpenExtended: () => void;
  loadingExtended: boolean;
}

export default function WeekDeepDive({
  preghiera,
  integrazione,
  onOpenExtended,
  loadingExtended,
}: WeekDeepDiveProps) {
  const hasPreghiera = preghiera.trim().length > 0;
  const hasIntegrazione = integrazione.trim().length > 0;

  return (
    <div className="space-y-4 mb-6">

      {/* Card Preghiera (visibile solo se popolata su Notion) */}
      {hasPreghiera && (
        <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">🙏</div>
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Preghiera della Settimana</p>
                <p className="text-xs text-amber-600">Da tenere accanto al cuore</p>
              </div>
            </div>
            <div className="w-full h-px bg-amber-100 mb-4" />
            <p className="text-gray-800 text-base font-serif italic leading-relaxed whitespace-pre-line">
              {preghiera}
            </p>
          </div>
        </div>
      )}

      {/* Card Integrazione (visibile solo se popolata su Notion) */}
      {hasIntegrazione && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">✨</div>
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Passi di Integrazione</p>
                <p className="text-xs text-blue-500">Portare il tema nella vita quotidiana</p>
              </div>
            </div>
            <div className="w-full h-px bg-stone-100 mb-4" />
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {integrazione}
            </p>
          </div>
        </div>
      )}

      {/* Bottone approfondimento esteso (sempre visibile: la pagina Notion ha sempre blocchi) */}
      <button
        onClick={onOpenExtended}
        disabled={loadingExtended}
        className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 text-sm"
      >
        {loadingExtended
          ? <><span className="animate-spin inline-block">⏳</span> Caricamento...</>
          : <>📚 Apri approfondimento completo →</>
        }
      </button>

    </div>
  );
}
