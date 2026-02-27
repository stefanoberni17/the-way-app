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
  const [obiettivi, setObiettivi] = useState('');
  const [passioni, setPassioni] = useState('');
  const [sogno, setSogno] = useState('');
  const [situazioneAttuale, setSituazioneAttuale] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileData) {
        setNome(profileData.name || '');
        setEta(profileData.age?.toString() || '');
        setObiettivi(profileData.goals || '');
        setPassioni(profileData.passions || '');
        setSogno(profileData.dream || '');
        setSituazioneAttuale(profileData.current_situation || '');
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍥</div>
          <p className="text-xl text-gray-600">Caricamento...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 pb-24">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center gap-3">
          <div className="text-4xl">👤</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Il tuo Profilo
            </h1>
            <p className="text-sm text-gray-600">{email}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              ✅ Profilo aggiornato con successo!
            </div>
          )}

          {/* Info Personali */}
          <div className="space-y-6 pb-6 border-b mb-6">
            <h3 className="font-semibold text-gray-700 text-lg">Informazioni personali</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Come ti chiami?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Età
              </label>
              <input
                type="number"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Es. 25"
                min="13"
                max="120"
              />
            </div>
          </div>

          {/* Il tuo percorso */}
          <div className="space-y-6">
            <h3 className="font-semibold text-gray-700 text-lg">Il tuo percorso</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obiettivi
              </label>
              <textarea
                value={obiettivi}
                onChange={(e) => setObiettivi(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Cosa vuoi ottenere da questo percorso?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passioni e interessi
              </label>
              <input
                type="text"
                value={passioni}
                onChange={(e) => setPassioni(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Cosa ti appassiona?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Il tuo sogno
              </label>
              <input
                type="text"
                value={sogno}
                onChange={(e) => setSogno(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Qual è il tuo sogno più grande?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Situazione attuale
              </label>
              <textarea
                value={situazioneAttuale}
                onChange={(e) => setSituazioneAttuale(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Dove ti trovi ora nella vita?"
                rows={3}
              />
            </div>
          </div>

          {/* Bottone */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvataggio...' : '💾 Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}