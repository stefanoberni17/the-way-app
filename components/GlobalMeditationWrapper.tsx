'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MeditationPopup from './MeditationPopup';
import { MeditationContext } from './MeditationContext';

const WEEK_NAMES: Record<number, string> = {
  1: 'Week 1-2 — La voce nel deserto',
  2: 'Week 1-2 — La voce nel deserto',
  3: 'Week 3-4 — Il silenzio di Nazaret',
  4: 'Week 3-4 — Il silenzio di Nazaret',
  5: 'Week 5-6 — La voce che chiama',
  6: 'Week 5-6 — La voce che chiama',
};

// The Way — Notion page IDs per ogni coppia di settimane
const WEEK_IDS: Record<number, string> = {
  1: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',  // Week 1-2 — La voce nel deserto
  2: '314655f7-26c7-8152-bc43-f9ccdbf8b0bf',
  3: '316655f7-26c7-8148-b5f4-f58ca267545a',  // Week 3-4 — Il silenzio di Nazaret
  4: '316655f7-26c7-8148-b5f4-f58ca267545a',
  5: '316655f7-26c7-8131-b21d-ff3daa9eee74',  // Week 5-6 — La voce che chiama (future)
  6: '316655f7-26c7-8131-b21d-ff3daa9eee74',
};

export default function GlobalMeditationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string>('');
  const [mantra, setMantra] = useState<string>('');
  const [weekName, setWeekName] = useState<string>('');
  const [manualOpen, setManualOpen] = useState(false);

  // Skip popup su login/register/onboarding
  const skipPages = ['/login', '/register', '/onboarding'];
  const shouldShowPopup = !skipPages.includes(pathname);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !shouldShowPopup) return;

      setUserId(session.user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('current_week')
        .eq('user_id', session.user.id)
        .single();

      const currentWeek = profileData?.current_week || 1;
      const weekId = WEEK_IDS[currentWeek];

      if (weekId) {
        const response = await fetch(`/api/settimana?id=${weekId}`);
        const data = await response.json();

        const properties = data?.page?.properties || {};
        const mantraText = (properties.Mantra?.rich_text?.[0]?.plain_text || '')
          .replace(/<br>/g, '\n');

        setMantra(mantraText);
        setWeekName(WEEK_NAMES[currentWeek] || `Week ${currentWeek}`);
      }
    };

    init();
  }, [pathname, shouldShowPopup]);

  const openMeditation = () => setManualOpen(true);
  const handleClose = () => setManualOpen(false);

  return (
    <MeditationContext.Provider value={{ openMeditation, mantra, weekName }}>
      {shouldShowPopup && userId && mantra && (
        <MeditationPopup
          mantra={mantra}
          weekName={weekName}
          userId={userId}
          manualOpen={manualOpen}
          onClose={handleClose}
        />
      )}
      {children}
    </MeditationContext.Provider>
  );
}
