'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'My Links' }: HeaderProps) {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-8 flex bg-background-light dark:bg-background-dark flex-shrink-0 z-30 transition-colors duration-300">
      {/* Left: Content Area Header */}
      <div className="flex-1 flex items-center px-4 dark:bg-white/[0.04]">
        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 tracking-tight">
          <span className="material-symbols-outlined !text-[14px] opacity-70">home</span>
          <span className="text-[9px] opacity-40">/</span>
          <span className="uppercase tracking-wider">{title}</span>
        </div>
      </div>

      {/* Right: Actions / Right Panel Header Sync */}
      <div className={`flex items-center px-4 transition-all duration-300 dark:bg-white/[0.04] ${
        rightPanelOpen 
          ? 'xl:w-[700px] xl:bg-white xl:dark:bg-[#0a0a0b] xl:border-l xl:border-gray-200 xl:dark:border-white/[0.08]' 
          : ''
      }`}>
        <div className="ml-auto flex items-center space-x-1">
          <button type="button" className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors">
            <span className="material-symbols-outlined !text-[14px]">notifications</span>
          </button>
          <button
            type="button"
            className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            <span className="material-symbols-outlined !text-[14px]">
              {mounted && resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
