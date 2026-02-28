'use client';

import { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, Bot, User } from 'lucide-react';

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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log('✅ ChatBot - userId impostato:', user.id);
      } else {
        console.warn('⚠️ ChatBot - Nessun userId trovato');
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      console.log('📤 Invio messaggio con userId:', userId);

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
      console.log('📥 Risposta API:', data);

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

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white p-4 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">✝️</div>
          <div>
            <h3 className="font-semibold">La Guida</h3>
            <p className="text-xs text-blue-200">Il tuo compagno di cammino</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Suggestion pills — visible only before user sends first message */}
        {suggestions && suggestions.length > 0 && messages.length <= 1 && (
          <div className="pb-2">
            <p className="text-xs text-gray-400 mb-2 font-medium">💡 Suggerimenti per iniziare:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessageText(s)}
                  className="text-left text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-300 transition-colors active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-800 text-white'
              }`}
            >
              {message.role === 'user' ? (
                <User className="w-5 h-5" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-xl p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-800 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-gray-100 rounded-xl p-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-700" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Scrivi un messaggio..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
