'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store/uiStore';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'My Links', href: '/my-links', icon: 'bookmark_border', activeClass: 'bg-primary/20 text-violet-300' },
    { name: 'History', href: '/history', icon: 'history' },
    { name: 'Tags', href: '/tags', icon: 'tag' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-[180px] bg-sidebar-dark text-white flex flex-col flex-shrink-0 h-full border-r border-white/5 z-40">
      
      {/* Logo Area */}
      <div className="p-4 flex items-center space-x-2">
        <span className="material-symbols-outlined text-3xl text-violet-400">language</span>
        <h1 className="text-xl font-bold tracking-tight">SearchWeb</h1>
      </div>

      {/* User Profile Outline */}
      <div className="px-3 mb-4">
        <div className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg border border-white/10">
          <div className="h-7 w-7 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
            <span className="material-symbols-outlined text-[16px]!">person</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-xs truncate">My Profile</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors',
                isActive 
                  ? (item.activeClass || 'bg-white/10 text-white font-medium') 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <span className={cn('material-symbols-outlined text-[16px]!', isActive && item.name === 'My Links' ? 'icon-outlined' : '')}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Pinned Folder list */}
        <div className="pt-4 pb-1 px-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Pinned</p>
          <button 
            onClick={() => useUIStore.getState().toggleCreateFolderDialog(true)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]!">add</span>
          </button>
        </div>
        
        <Link href="#" className="flex items-center space-x-2 px-3 py-1.5 text-[10px] text-gray-400 hover:text-white transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span className="truncate">UI Design</span>
        </Link>
        <Link href="#" className="flex items-center space-x-2 px-3 py-1.5 text-[10px] text-gray-400 hover:text-white transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          <span className="truncate">Research</span>
        </Link>
      </nav>
      
    </aside>
  );
}
