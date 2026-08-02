'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'My Links' }: HeaderProps) {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const panelMode = useUIStore((s) => s.panelMode);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isPopupMode = panelMode === 'drawer';
  // '고정 모드(fixed)'이면서 '우측 패널이 열려 있을 때'만 헤더 우측 분할 배경/경계선 스타일 적용
  const isFixedModePanelOpen = rightPanelOpen && panelMode === 'fixed';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={cn(
      "h-10 tablet-lg:h-8 flex flex-shrink-0 z-30 transition-all duration-300",
      isPopupMode 
        ? "bg-gray-900 dark:bg-black text-gray-200" 
        : "bg-[#fafafa] dark:bg-white/[0.04] text-gray-700 dark:text-gray-200"
    )}>
      {/* Left: Content Area Header */}
      <div className="flex-1 flex items-center px-3 tablet-lg:px-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => toggleMobileSidebar()}
          className={cn(
            "tablet-lg:hidden flex items-center justify-center p-1.5 rounded-md transition-colors mr-2",
            isPopupMode
              ? "text-gray-400 hover:text-white hover:bg-white/10"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
          )}
          title="메뉴 토글"
        >
          <span className="material-symbols-outlined !text-[18px]">menu</span>
        </button>

        {/* Mobile Logo */}
        <div className="tablet-lg:hidden flex items-center space-x-1 mr-2 select-none">
          <img src="/relink_logo.png" alt="Logo" className="w-4.5 h-4.5 object-contain" />
          <span className={cn(
            "font-bold text-[11px] tracking-tight",
            isPopupMode ? "text-white" : "text-gray-900 dark:text-white"
          )}>ReLink</span>
        </div>
        <span className="tablet-lg:hidden text-[9px] text-gray-400 opacity-60 mr-2">/</span>

        <div className={cn(
          "text-[10px] font-bold flex items-center gap-1.5 tracking-tight select-none cursor-default",
          isPopupMode ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
        )}>
          <span className="material-symbols-outlined !text-[14px] opacity-70">home</span>
          <span className="text-[9px] opacity-40">/</span>
          <span className={cn(
            "uppercase tracking-wider",
            isPopupMode ? "text-gray-200" : "text-gray-700 dark:text-gray-300"
          )}>{title}</span>
        </div>
      </div>

      {/* Right: Actions / Right Panel Header Sync */}
      {/* 고정 모드일 때만 헤더 우측이 패널 너비(780px) 및 흰색 배경/경계선으로 분할되고, 팝업 모드일 때는 분할 없이 하나로 일통화됨 */}
      <div className={`flex items-center px-3 tablet-lg:px-4 transition-all duration-300 ${
        isFixedModePanelOpen 
          ? 'tablet-lg:w-[780px] tablet-lg:bg-white tablet-lg:dark:bg-[#0a0a0b] tablet-lg:text-gray-800 tablet-lg:dark:text-gray-200 tablet-lg:border-l tablet-lg:border-gray-200 tablet-lg:dark:border-white/[0.08]' 
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
            className={cn(
              "p-1.5 tablet-lg:p-1 rounded-md transition-colors",
              isPopupMode
                ? "text-gray-400 hover:text-white hover:bg-white/10"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10"
            )}
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
