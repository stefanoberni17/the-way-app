'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Bookmark, MessageCircle, User } from 'lucide-react';

export default function BottomTabBar() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register' || pathname === '/onboarding' || pathname === '/privacy') {
    return null;
  }

  const tabs = [
    { href: '/',          label: 'Home',      icon: Home },
    { href: '/settimane', label: 'Percorso',  icon: BookOpen },
    { href: '/custoditi', label: 'Custoditi', icon: Bookmark },
    { href: '/chat',      label: 'La Guida',  icon: MessageCircle },
    { href: '/profilo',   label: 'Profilo',   icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-md border-t border-line safe-bottom">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-around items-stretch h-[68px]">
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
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center flex-1 gap-1.5 transition-colors duration-200 ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink-soft'
                }`}
              >
                <span
                  className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-gold-soft' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={`w-[22px] h-[22px] transition-all ${
                      isActive ? 'text-gold-deep stroke-[2.2]' : 'stroke-[1.7]'
                    }`}
                  />
                </span>
                <span className={`text-[10.5px] leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-medium'}`}>
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
