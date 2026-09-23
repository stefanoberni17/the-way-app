'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ChatBot, { ChatBotRef } from '@/components/ChatBot';
import { LoadingScreen } from '@/components/ui';

const suggestions = [
  "Come posso entrare nella Parola di oggi?",
  "Aiutami a riflettere sul passo di questa settimana",
  "Quali pratiche mi consigli per oggi?",
  "Sento il peso di una difficoltà — puoi aiutarmi?",
];

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const chatBotRef = useRef<ChatBotRef>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <LoadingScreen label="Chiamo La Guida…" />;
  }

  return (
    <div
      className="flex flex-col bg-parchment"
      style={{ height: 'calc(100dvh - 4.25rem - env(safe-area-inset-bottom))' }}
    >
      <div className="flex-1 flex flex-col min-h-0 max-w-2xl w-full mx-auto px-3 sm:px-4 pt-3 pb-3">
        <ChatBot ref={chatBotRef} suggestions={suggestions} />
      </div>
    </div>
  );
}
