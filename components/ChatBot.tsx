'use client';

import { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowUp, Loader2 } from 'lucide-react';
import { CrossMark, Eyebrow } from '@/components/ui';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatBotRef {
  sendSuggestion: (text: string) => void;
}

export default function ChatBot({ ref, suggestions }: { ref?: React.Ref<ChatBotRef>; suggestions?: string[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ciao! Sono qui per accompagnarti nel tuo cammino attraverso The Way. Come posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        console.warn('ChatBot - Nessun userId trovato');
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessageText = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || 'Errore nella risposta',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Mi dispiace, si è verificato un errore. Riprova tra poco.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageText(input);
  };

  useImperativeHandle(ref, () => ({
    sendSuggestion: (text: string) => sendMessageText(text),
  }));

  const showSuggestions = suggestions && suggestions.length > 0 && messages.length <= 1;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-paper rounded-3xl border border-line shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex items-center gap-3 flex-shrink-0 bg-paper">
        <div className="w-10 h-10 rounded-full bg-night text-gold-light flex items-center justify-center">
          <CrossMark className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-serif text-xl font-semibold text-ink leading-none">La Guida</p>
          <p className="text-xs text-muted mt-1">Uno specchio, non un maestro.</p>
        </div>
      </div>

      {/* Messaggi */}
      <div className="flex-1 overflow-y-auto scroll-quiet px-4 py-5 space-y-4 min-h-0 bg-paper-warm/60">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-rise`}>
              <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-ink text-paper rounded-2xl rounded-br-md'
                      : 'bg-paper text-ink border border-line rounded-2xl rounded-bl-md shadow-[var(--shadow-card)]'
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-[10px] text-faint px-1">
                  {message.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-paper border border-line rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="pt-2">
            <Eyebrow tone="muted" className="mb-2.5 px-1">Per iniziare</Eyebrow>
            <div className="flex flex-col gap-2">
              {suggestions!.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessageText(s)}
                  className="text-left text-sm text-ink-soft bg-paper border border-line rounded-2xl px-4 py-3 hover:border-gold hover:text-ink transition-colors active:scale-[0.99]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-line bg-paper flex-shrink-0">
        <div className="flex items-center gap-2 bg-paper-warm border border-line rounded-full pl-5 pr-1.5 py-1.5 focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/10 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi a La Guida…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-faint outline-none disabled:opacity-60 min-w-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Invia"
            className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center hover:bg-night disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" strokeWidth={2.4} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
