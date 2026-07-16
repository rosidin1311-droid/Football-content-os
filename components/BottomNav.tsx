'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Sparkles, CalendarDays } from 'lucide-react';

const tabs = [
  { href: '/planner', label: 'Planner', icon: LayoutGrid },
  { href: '/generator', label: 'Generator', icon: Sparkles },
  { href: '/kalender', label: 'Kalender', icon: CalendarDays },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-panel border-t border-lime/20 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3"
            >
              <Icon
                size={20}
                strokeWidth={2}
                className={active ? 'text-lime' : 'text-gray-500'}
              />
              <span
                className={`text-[10px] uppercase tracking-wide font-medium ${
                  active ? 'text-lime' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
