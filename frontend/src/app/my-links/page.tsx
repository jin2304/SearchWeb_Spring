'use client';

import { FolderCard } from '@/components/my-links/FolderCard';
import { RightPanel } from '@/components/my-links/RightPanel';
import { useUIStore } from '@/lib/store/uiStore';
import { useFolders } from '@/lib/api/folderApi';
import { useFolderStore } from '@/lib/store/folderStore';
import { useAuthStore } from '@/lib/store/authStore';
import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import { useState } from 'react';

const PINNED_COLORS = ['bg-blue-600/90', 'bg-indigo-500/90', 'bg-teal-500/90', 'bg-amber-500/90', 'bg-emerald-600/90'];

export default function MyLinksPage() {
  const { toggleRightPanel } = useUIStore();
  const setSelectedFolderId = useFolderStore((s) => s.setSelectedFolderId);
  const memberId = useAuthStore((s) => s.member?.memberId);
  const isAuthInitializing = useAuthStore((s) => s.isInitializing);
  const { data: folders, isLoading: isFoldersLoading, error } = useFolders(memberId);
  
  // 인증 정보를 복구 중이거나 아직 폴더 목록을 가져오는 중이면 로딩 상태로 간주
  const isLoading = isAuthInitializing || isFoldersLoading;
  const pinnedFolders = folders?.slice(0, 5) ?? [];

  const [folderSort, setFolderSort] = useState('recently');
  const folderSortOptions: SortOption[] = [
    { id: 'recently', label: 'Recently Added', icon: 'schedule' },
    { id: 'a-z', label: 'Name (A-Z)', icon: 'sort_by_alpha' },
    { id: 'count', label: 'Link Count', icon: 'list_alt' }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-2 xl:px-5 xl:py-3 transition-all duration-300 bg-[#fafafa] dark:bg-white/[0.04]">
        
        {/* Top Search & Filter Section */}
        <div className="mb-5 flex flex-col items-start bg-transparent">
          
          <div className="relative w-full max-w-lg mb-3">
            <div className="group bg-white dark:bg-gray-900 rounded-full flex items-center p-1 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
              <div className="pl-3 pr-2 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors flex items-center">
                {/* <span className="material-symbols-outlined text-[18px]">auto_awesome</span> */}
              </div>
              <input 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs py-1.5 px-1 text-gray-800 dark:text-gray-100 placeholder-gray-400 font-normal" 
                placeholder="Search folders or links" 
                type="text"
              />
              <button type="button" className="flex items-center justify-center h-7 w-7 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mr-0.5">
                <span className="material-symbols-outlined !text-[16px]">search</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-1 pb-1 pl-1">
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px]">tune</span> Filter
            </button>
            <div className="h-2.5 w-px bg-gray-300 dark:bg-gray-700 mx-0.5"></div>
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px] text-rose-400">inventory_2</span> Unorganized
            </button>
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px] text-blue-500">mark_email_unread</span> Unread
            </button>
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px] text-amber-500">priority_high</span> High Priority
            </button>
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px] text-green-500">today</span> Saved today
            </button>
          </div>
        </div>

        {/* Pinned Folders Top Section - Strictly 5 Columns Desktop */}
        {pinnedFolders.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-3 ml-1">Pinned</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {pinnedFolders.map((folder, idx) => (
                <div
                  key={folder.memberFolderId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedFolderId(folder.memberFolderId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedFolderId(folder.memberFolderId);
                    }
                  }}
                  className={`${PINNED_COLORS[idx % PINNED_COLORS.length]} text-white rounded-lg p-2.5 flex flex-col justify-between h-20 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 cursor-pointer focus:ring-1 focus:ring-offset-2 focus:ring-purple-300 outline-none hover:shadow-md`}
                >
                  <div className="flex justify-between items-start z-10 w-full gap-1">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-md shrink-0">
                      <span className="material-symbols-outlined text-[14px]">folder</span>
                    </div>
                    <button type="button" className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white shrink-0">
                      <span className="material-symbols-outlined text-[14px]">more_vert</span>
                    </button>
                  </div>
                  <div className="z-10 mt-1 min-w-0 w-full">
                    <h3 className="font-semibold text-[10px] xl:text-[11px] truncate w-full">{folder.folderName}</h3>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-10 h-10 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-3 ml-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100">My Folder</h2>
          </div>
          
          <div className="flex items-center gap-1.5 focus-within:z-20 relative">
            <SortDropdown 
              value={folderSort}
              onChange={setFolderSort}
              options={folderSortOptions}
              panelClassName="bg-white/78 border-white/70 ring-1 ring-slate-200/60 backdrop-blur-xl shadow-[0_20px_45px_-18px_rgba(15,23,42,0.22),0_12px_24px_-16px_rgba(148,163,184,0.45)] dark:ring-0 dark:backdrop-blur-md"
            />
            <button 
              type="button"
              onClick={() => useUIStore.getState().toggleCreateFolderDialog(true)}
              className="group flex items-center gap-1 px-2 py-1 border border-gray-200/80 dark:border-white/8 rounded-md text-[10px] font-medium transition-all duration-200 bg-white/50 dark:bg-slate-900/50 text-gray-600 dark:text-white hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-200/50 dark:hover:border-purple-500/30"
            >
              <span className="material-symbols-outlined !text-[12px] text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors leading-none">folder</span>
              <span>Create Folder</span>
            </button>
            <button 
              type="button"
              onClick={() => useUIStore.getState().toggleSaveLinkDialog(true)}
              className="flex items-center space-x-1 text-[10px] font-bold text-white bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] hover:opacity-90 border-none rounded-md px-2.5 py-1 transition-all shadow-md shadow-purple-500/20 hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined !text-[12px] !leading-none">add</span>
              <span>Save Link</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          
          {/* ── 로딩 상태 ── */}
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                <span>폴더를 불러오는 중...</span>
              </div>
            </div>
          )}

          {/* ── 에러 상태 ── */}
          {error && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>폴더 목록을 불러오지 못했습니다: {error.message}</span>
              </div>
            </div>
          )}

          {/* ── 빈 상태 (로딩이 끝난 후 데이터가 없는 경우) ── */}
          {!isLoading && folders && folders.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-1 text-gray-400 text-xs">
                <span className="material-symbols-outlined text-2xl">folder_off</span>
                <span>아직 생성된 폴더가 없습니다</span>
              </div>
            </div>
          )}

          {/* ── 폴더 카드 목록 (백엔드 데이터 반복 렌더링) ── */}
          {(folders ? [...folders] : []).sort((a, b) => {
            if (folderSort === 'recently') return b.memberFolderId - a.memberFolderId;
            if (folderSort === 'a-z') return a.folderName.localeCompare(b.folderName);
            return 0;
          }).map((folder) => (
            <FolderCard key={folder.memberFolderId} folder={folder} />
          ))}

        </div>

      </div>

      {/* Right Sidebar Panel */}
      <RightPanel />
    </div>
  );
}
