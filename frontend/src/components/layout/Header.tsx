'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'My Links' }: HeaderProps) {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-10 tablet-lg:h-8 flex bg-background-light dark:bg-background-dark flex-shrink-0 z-30 transition-all duration-300">
      {/* Left: Content Area Header */}
      <div className="flex-1 flex items-center px-3 tablet-lg:px-4 dark:bg-white/[0.04]">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => toggleMobileSidebar()}
          className="tablet-lg:hidden flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors mr-2"
          title="메뉴 토글"
        >
          <span className="material-symbols-outlined !text-[18px]">menu</span>
        </button>

        {/* Mobile Logo */}
        <div className="tablet-lg:hidden flex items-center space-x-1 mr-2 select-none">
          <img src="/relink_logo.png" alt="Logo" className="w-4.5 h-4.5 object-contain" />
          <span className="font-bold text-[11px] text-gray-800 dark:text-white tracking-tight">ReLink</span>
        </div>
        <span className="tablet-lg:hidden text-[9px] text-gray-400 opacity-40 mr-2">/</span>

        <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 tracking-tight select-none cursor-default">
          <span className="material-symbols-outlined !text-[14px] opacity-70">home</span>
          <span className="text-[9px] opacity-40">/</span>
          <span className="uppercase tracking-wider">{title}</span>
        </div>
      </div>

      {/* Right: Actions / Right Panel Header Sync */}
      <div className={`flex items-center px-3 tablet-lg:px-4 transition-all duration-300 dark:bg-white/[0.04] ${
        rightPanelOpen 
          ? 'tablet-lg:w-[700px] tablet-lg:bg-white tablet-lg:dark:bg-[#0a0a0b] tablet-lg:border-l tablet-lg:border-gray-200 tablet-lg:dark:border-white/[0.08]' 
          : ''
      }`}>
        <div className="ml-auto flex items-center space-x-1">
          {/* 향후 기능 개발 예정이라 주석
          <button type="button" className="p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors">
            <span className="material-symbols-outlined !text-[14px]">notifications</span>
          </button>
          */}
          <button
            type="button"
            className="p-1.5 tablet-lg:p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
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
