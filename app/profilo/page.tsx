'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfiloPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [eta, setEta] = useState('');
  const [currentWeek, setCurrentWeek] = useState('1');
  const [obiettivi, setObiettivi] = useState('');
  const [passioni, setPassioni] = useState('');
  const [sogno, setSogno] = useState('');
  const [situazioneAttuale, setSituazioneAttuale] = useState('');
  const [telegramId, setTelegramId] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('user_id', session.user.id).single();

      if (profileData) {
        setNome(profileData.name || '');
        setEta(profileData.age?.toString() || '');
        setCurrentWeek(profileData.current_week?.toString() || '1');
        setObiettivi(profileData.goals || '');
        setPassioni(profileData.passions || '');
        setSogno(profileData.dream || '');
        setSituazioneAttuale(profileData.current_situation || '');
        setTelegramId(profileData.telegram_id || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: nome.trim(),
          age: eta ? parseInt(eta) : null,
          goals: obiettivi.trim() || null,
          passions: passioni.trim() || null,
          dream: sogno.trim() || null,
          current_situation: situazioneAttuale.trim() || null,
          telegram_id: telegramId.trim() || null,
        })
        .eq('user_id', userId);
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/login');
    else setError('Errore durante il logout');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-stone-500">Caricamento...</p>
        </div>
      </main>
    );
  }

  const getWeekName = (week: string) => {
    const weekNames: Record<string, string> = {
      '1': 'La voce nel deserto',
      '2': 'La voce nel deserto',
      '3': 'Le tentazioni',
      '4': 'Le tentazioni',
      '5': 'La chiamata',
      '6': 'La chiamata',
    };
    return weekNames[week] || `Week ${week}`;
  };

  const inputClass = "w-full px-4 py-2.5 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all text-sm bg-stone-50";

  return (
    <main className="min-h-screen bg-stone-50 pb-24">

      {/* Header navy */}
      <div className="bg-slate-900 px-5 pt-10 pb-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-bold text-xl font-serif">
              {nome ? nome.charAt(0).toUpperCase() : '✝'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Il tuo Profilo</h1>
            <p className="text-slate-400 text-sm">{email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-3">
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">
              ✅ Profilo aggiornato con successo!
            </div>
          )}

          {/* Info personali */}
          <div className="space-y-5 pb-6 border-b border-stone-100 mb-6">
            <h3 className="font-serif font-bold text-gray-800 text-lg">Informazioni personali</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                className={inputClass} placeholder="Come ti chiami?" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Età</label>
              <input type="number" value={eta} onChange={(e) => setEta(e.target.value)}
                className={inputClass} placeholder="Es. 25" min="13" max="120" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Settimana corrente</label>
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-bold text-gray-800 font-serif">Week {currentWeek} — {getWeekName(currentWeek)}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Si aggiorna automaticamente al completamento dei passi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Telegram */}
          <div className="space-y-4 pb-6 border-b border-stone-100 mb-6">
            <h3 className="font-serif font-bold text-gray-800 text-lg">Collega Telegram</h3>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-700">
              <p className="font-medium mb-2">Come trovare il tuo ID Telegram:</p>
              <ol className="list-decimal list-inside space-y-1 text-stone-600">
                <li>Apri Telegram e cerca <strong>@getidsbot</strong></li>
                <li>Scrivili qualsiasi messaggio</li>
                <li>Copia il numero che ti risponde e incollalo qui sotto</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Il tuo ID Telegram</label>
              <input type="text" value={telegramId} onChange={(e) => setTelegramId(e.target.value)}
                autoComplete="off" className={inputClass} placeholder="Es. 766672351" />
              <p className="text-xs text-stone-400 mt-1">
                Una volta salvato potrai parlare con La Guida direttamente su Telegram
              </p>
            </div>
          </div>

          {/* Cammino */}
          <div className="space-y-5 mb-6">
            <h3 className="font-serif font-bold text-gray-800 text-lg">Il tuo cammino</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intenzione di percorso</label>
              <textarea value={obiettivi} onChange={(e) => setObiettivi(e.target.value)}
                className={inputClass} placeholder="Cosa cerchi in questo cammino?" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Passioni e interessi</label>
              <input type="text" value={passioni} onChange={(e) => setPassioni(e.target.value)}
                className={inputClass} placeholder="Cosa ti appassiona?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Il tuo sogno</label>
              <input type="text" value={sogno} onChange={(e) => setSogno(e.target.value)}
                className={inputClass} placeholder="Qual è il tuo sogno più grande?" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Situazione attuale</label>
              <textarea value={situazioneAttuale} onChange={(e) => setSituazioneAttuale(e.target.value)}
                className={inputClass} placeholder="Dove ti trovi ora nella vita?" rows={3} />
            </div>
          </div>

          {/* Salva */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className={`w-full font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 text-white text-sm ${
                success ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {saving ? 'Salvataggio…' : success ? '✅ Salvato!' : '💾 Salva Modifiche'}
            </button>
          </div>

          {/* Logout */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-100 hover:border-red-200"
            >
              <span>🚪</span>
              <span>Esci dall&apos;account</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              className="text-xs text-stone-400 hover:text-stone-500 underline">
              🔒 Privacy Policy
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
