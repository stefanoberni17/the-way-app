'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Carica profilo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    checkUser();
  }, [router]);

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
      {/* Saluto */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Ciao, {profile?.name || 'Guerriero'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Benvenuto nella tua dashboard personale
        </p>
      </div>

      {/* Dashboard content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 Il Tuo Percorso
          </h2>
          <p className="text-gray-600 mb-6">
            Traccia i tuoi progressi attraverso le 24 settimane
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Settimane completate</div>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="text-3xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">Settimane totali</div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="text-3xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600">Progressione</div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
          >
            🚀 Esplora le Settimane
          </button>
        </div>
      </div>
    </main>
  );
}