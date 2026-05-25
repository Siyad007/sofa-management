'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Wallet, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/design-system';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/daily-entry', icon: ClipboardList, label: 'Work' },
    { href: '/reports', icon: BarChart3, label: 'Report' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[1000] px-8">
      <nav className="glass-heavy rounded-[36px] p-2 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-t border-white/20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => haptic.light()}
              className="relative px-6 py-4 rounded-[28px] flex flex-col items-center gap-1 transition-all group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-[28px] border border-blue-500/20"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                />
              )}
              
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 transition-all duration-400 ${
                    isActive ? 'text-blue-400 scale-110' : 'text-white/30 group-hover:text-white/60'
                  }`} 
                  strokeWidth={isActive ? 3 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="active-glow"
                    className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.9)]"
                  />
                )}
              </div>
              
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                isActive ? 'text-blue-400 opacity-100 mt-1' : 'text-white/10 group-hover:text-white/30'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
