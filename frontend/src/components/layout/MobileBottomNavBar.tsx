'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useState } from 'react';

export function MobileBottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { toggleSaveLinkDialog, saveLinkDialogOpen, toggleCreateFolderDialog } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [shouldRenderTooltip, setShouldRenderTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkClipboard = async () => {
      if (saveLinkDialogOpen) {
        setClipboardUrl(null);
        return;
      }
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return;
      }
      try {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          setClipboardUrl(text);
        }
      } catch (err) {
        console.warn('Clipboard read error:', err);
      }
    };

    const handleFocus = () => {
      clearTimeout(timer);
      timer = setTimeout(checkClipboard, 250);
    };

    if (mounted) {
      checkClipboard();
      window.addEventListener('focus', handleFocus);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [saveLinkDialogOpen, mounted]);

  useEffect(() => {
    let fadeInTimer: NodeJS.Timeout;
    let fadeOutTimer: NodeJS.Timeout;
    let clearTimer: NodeJS.Timeout;

    if (clipboardUrl) {
      setShouldRenderTooltip(true);

      fadeInTimer = setTimeout(() => {
        setIsTooltipVisible(true);
      }, 50);

      fadeOutTimer = setTimeout(() => {
        setIsTooltipVisible(false);
      }, 15000);

      clearTimer = setTimeout(() => {
        setShouldRenderTooltip(false);
        setClipboardUrl(null);
      }, 16000);
    } else {
      setIsTooltipVisible(false);
      setShouldRenderTooltip(false);
    }

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(clearTimer);
    };
  }, [clipboardUrl]);

  if (!mounted) return null;

  const isMyLinks = pathname === '/my-links';

  const handleCreateFolder = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleCreateFolderDialog(true);
  };

  const handleSaveLink = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleSaveLinkDialog(true, clipboardUrl || undefined);
    if (clipboardUrl) setClipboardUrl(null);
  };

  return (
    <div className="tablet-lg:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-xs bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full p-1 flex items-center justify-between gap-1 animate-in slide-in-from-bottom duration-300">
      {/* Left: Navigation (Toggles dynamically between My Links and Home) */}
      {isMyLinks ? (
        <Link
          href="/"
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors select-none"
        >
          <span className="material-symbols-outlined !text-[19px] text-gray-500 dark:text-gray-400">home</span>
          <span className="text-[9px] font-normal tracking-tight text-gray-400 dark:text-gray-500 mt-[1px]">Overview</span>
        </Link>
      ) : (
        <Link
          href="/my-links"
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors select-none"
        >
          <span className="material-symbols-outlined !text-[19px] text-gray-500 dark:text-gray-400">bookmark</span>
          <span className="text-[9px] font-normal tracking-tight text-gray-400 dark:text-gray-500 mt-[1px]">My Links</span>
        </Link>
      )}

      {/* Center: Save Link primary action */}
      <div className="flex-1 relative flex flex-col items-center justify-center">
        {shouldRenderTooltip && clipboardUrl && (
          <button
            type="button"
            onClick={handleSaveLink}
            className={`absolute -top-14 left-1/2 -translate-x-1/2 z-50 group outline-none transition-all duration-1000 ease-in-out ${
              isTooltipVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
            }`}
          >
            <div className="relative w-[164px] h-[38px] flex items-center justify-center active:scale-95 transition-transform duration-150">
              {/* Background Unified SVG Speech Bubble */}
              <svg 
                className="absolute -top-[2px] -left-[2px] w-[168px] h-[49px] drop-shadow-[0_12px_36px_rgba(124,58,237,0.3)] dark:drop-shadow-[0_12px_36px_rgba(0,0,0,0.6)] pointer-events-none" 
                viewBox="-2 -2 168 49" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Solid Fill */}
                <path 
                  d="M 19 0 L 145 0 A 19 19 0 0 1 164 19 A 19 19 0 0 1 145 38 L 91 38 C 86.5 38 84 39.5 82 45 C 80 39.5 77.5 38 73 38 L 19 38 A 19 19 0 0 1 0 19 A 19 19 0 0 1 19 0 Z" 
                  className="fill-white dark:fill-[#0a0a0b] group-hover:fill-violet-50 dark:group-hover:fill-[#1c142c] transition-colors duration-300"
                />
                {/* Consistent Outer Border */}
                <path 
                  d="M 19 0 L 145 0 A 19 19 0 0 1 164 19 A 19 19 0 0 1 145 38 L 91 38 C 86.5 38 84 39.5 82 45 C 80 39.5 77.5 38 73 38 L 19 38 A 19 19 0 0 1 0 19 A 19 19 0 0 1 19 0 Z" 
                  className="stroke-violet-200 dark:stroke-[#252528] transition-colors duration-300" 
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Speech Bubble Content */}
              <div className="relative z-10 flex items-center gap-2 pl-3.5 pr-4.5">
                <div className="relative bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_100%)] w-5 h-5 rounded-full flex items-center justify-center flex-none overflow-hidden">
                  <span className="inline-flex h-full w-full items-center justify-center rotate-[-45deg]">
                    <span className="material-symbols-outlined !text-[12px] !leading-none block text-white font-bold">link</span>
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-gray-50 tracking-tight pr-0.5 animate-pulse">Paste copied link</span>
              </div>
            </div>
          </button>
        )}
        <button
          type="button"
          onClick={handleSaveLink}
          className="w-full flex flex-col items-center justify-center py-1 px-1 text-white bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] rounded-full hover:opacity-95 shadow-md shadow-purple-500/10 active:scale-[0.98] transition-all select-none"
        >
          <span className="material-symbols-outlined !text-[19px]">add</span>
          <span className="text-[9px] font-medium tracking-tight text-white/90 mt-[1px]">Save Link</span>
        </button>
      </div>

      {/* Right: Create Folder action */}
      <button
        type="button"
        onClick={handleCreateFolder}
        className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors select-none"
      >
        <span className="material-symbols-outlined !text-[19px] text-gray-500 dark:text-gray-400">create_new_folder</span>
        <span className="text-[9px] font-normal tracking-tight text-gray-400 dark:text-gray-500 mt-[1px]">New Folder</span>
      </button>
    </div>
  );
}
