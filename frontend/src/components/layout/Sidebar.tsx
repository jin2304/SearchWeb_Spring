'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
// import { useUIStore } from '@/lib/store/uiStore';
// import { useFolders } from '@/lib/api/folderApi';
// import { useFolderStore } from '@/lib/store/folderStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';

// const PINNED_DOT_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-amber-500', 'bg-emerald-500'];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const member = useAuthStore((s) => s.member);
  // const { data: folders } = useFolders(member?.memberId);
  // const setSelectedFolderId = useFolderStore((s) => s.setSelectedFolderId);
  // const pinnedFolders = folders?.slice(0, 5) ?? [];

  const navItems = [
    { name: 'Overview', href: '/', icon: 'visibility', activeClass: 'bg-primary/20 text-violet-300' },
    { name: 'My Links', href: '/my-links', icon: 'bookmark_border', activeClass: 'bg-primary/20 text-violet-300' },
    { name: 'Feedback', href: 'https://relink.featurebase.app/en', icon: 'edit_document', isExternal: true },
    // { name: 'History', href: '/history', icon: 'history' },
    // { name: 'Tags', href: '/tags', icon: 'tag' },
    // { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-[180px] bg-slate-950 text-white flex flex-col flex-shrink-0 h-full border-r border-white/5 z-40">
      
      {/* Logo Area */}
      <div className="p-4 flex items-center space-x-2 select-none cursor-default">
        <img src="/relink_logo.png" alt="ReLink Logo" className="w-7 h-7 object-contain" />
        <h1 className="text-xl font-bold tracking-tight">ReLink</h1>
      </div>

      {/* User Profile Outline */}
      <div className="px-3 mb-4 select-none">
        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="h-7 w-7 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <span className="material-symbols-outlined !text-[16px]">person</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-xs truncate">{member?.name || 'My Profile'}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={async () => {
              try {
                await logout();
              } finally {
                router.push('/login');
              }
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="로그아웃"
          >
            <span className="material-symbols-outlined !text-[16px]">logout</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 hide-scrollbar">
        {navItems.map((item) => {
          if (item.isExternal) {
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors select-none text-gray-400 hover:text-white hover:bg-white/5"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined !text-[16px]">
                    {item.icon}
                  </span>
                </div>
                <span>{item.name}</span>
              </a>
            );
          }

          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors select-none',
                isActive 
                  ? (item.activeClass || 'bg-white/10 text-white font-medium') 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className={cn(
                  'material-symbols-outlined',
                  item.name === 'My Links' ? '!text-[18px]' : '!text-[16px]',
                  isActive && item.name === 'My Links' ? 'icon-outlined' : ''
                )}>
                  {item.icon}
                </span>
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Pinned Folder list
        <div className="pt-4 pb-1 px-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Pinned</p>
          <button 
            onClick={() => useUIStore.getState().toggleCreateFolderDialog(true)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined !text-[14px]">add</span>
          </button>
        </div>
        
        {pinnedFolders.map((folder, idx) => (
          <button
            key={folder.memberFolderId}
            onClick={() => setSelectedFolderId(folder.memberFolderId)}
            className="flex items-center space-x-2 px-3 py-1.5 text-[10px] text-gray-400 hover:text-white transition-colors w-full text-left"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${PINNED_DOT_COLORS[idx % PINNED_DOT_COLORS.length]} shrink-0`}></span>
            <span className="truncate">{folder.folderName}</span>
          </button>
        ))}
        */}
      </nav>
      
    </aside>
  );
}
