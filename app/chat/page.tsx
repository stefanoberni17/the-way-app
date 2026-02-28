'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ChatBot, { ChatBotRef } from '@/components/ChatBot';

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

  const handleSuggestionClick = (text: string) => {
    chatBotRef.current?.sendSuggestion(text);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-950 via-indigo-900 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✝️</div>
          <p className="text-xl text-blue-100">Caricamento...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto px-3 sm:px-4 pt-3 pb-2">
        <ChatBot ref={chatBotRef} suggestions={suggestions} />
      </div>
    </div>
  );
}
