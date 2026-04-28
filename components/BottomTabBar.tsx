'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, User } from 'lucide-react';

export default function BottomTabBar() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/privacy') {
    return null;
  }

  const tabs = [
    { href: '/',          label: 'Home',      icon: Home },
    { href: '/settimane', label: 'Percorso',  icon: BookOpen },
    { href: '/chat',      label: 'La Guida',  icon: MessageCircle },
    { href: '/profilo',   label: 'Profilo',   icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 shadow-[0_-1px_12px_rgba(0,0,0,0.06)] safe-bottom">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around items-stretch h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === '/'
                ? pathname === '/'
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center flex-1 gap-1 pt-1.5 transition-colors duration-200 ${
                  isActive
                    ? 'text-amber-700'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {/* Indicatore attivo — linea oro in cima */}
                {isActive && (
                  <span className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full bg-amber-600" />
                )}
                <Icon
                  className={`w-6 h-6 transition-all ${
                    isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'
                  }`}
                />
                <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
