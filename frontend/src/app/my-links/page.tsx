'use client';

import { RightPanel } from '@/components/my-links/RightPanel';
import { useUIStore } from '@/lib/store/uiStore';
import { useFolders } from '@/lib/api/folderApi';
import { useFolderStore } from '@/lib/store/folderStore';
import { TEMP_MEMBER_ID } from '@/lib/auth/currentUser';

const PINNED_COLORS = ['bg-blue-600', 'bg-indigo-500', 'bg-teal-500', 'bg-amber-500', 'bg-emerald-600'];

export default function MyLinksPage() {
  const { toggleRightPanel } = useUIStore();
  const setSelectedFolderId = useFolderStore((s) => s.setSelectedFolderId);

  const { data: folders, isLoading, error } = useFolders(TEMP_MEMBER_ID);
  const pinnedFolders = folders?.slice(0, 5) ?? [];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4 xl:p-5 transition-all duration-300">
        
        {/* Top Search & Filter Section */}
        <div className="mb-5 flex flex-col items-start bg-transparent">
          
          <div className="relative w-full max-w-lg mb-3">
            <div className="group bg-white dark:bg-gray-900 rounded-full flex items-center p-1 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
              <div className="pl-3 pr-2 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 transition-colors flex items-center">
                {/* <span className="material-symbols-outlined text-[18px]">auto_awesome</span> */}
              </div>
              <input 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs py-1.5 px-1 text-gray-800 dark:text-gray-100 placeholder-gray-400 font-normal" 
                placeholder="Search folders or links" 
                type="text"
              />
              <button type="button" className="flex items-center justify-center h-7 w-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full transition-colors mr-0.5">
                <span className="material-symbols-outlined text-lg">search</span>
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
            <button 
              type="button"
              onClick={() => useUIStore.getState().toggleCreateFolderDialog(true)}
              className="flex items-center space-x-1 text-[10px] font-medium text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-100 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md px-2 py-1 transition-colors"
            >
              <span className="material-symbols-outlined !text-[12px] !leading-none">folder</span>
              <span>Create Folder</span>
            </button>
            <div className="relative group">
              <button type="button" className="flex items-center space-x-1 text-[10px] font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined !text-[12px] !leading-none">filter_list</span>
                <span>Sort by: Recently</span>
                <span className="material-symbols-outlined !text-[12px] !leading-none mt-0.5">expand_more</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-700 shadow-xl rounded-lg py-1 hidden group-focus-within:block z-30">
                <button type="button" className="w-full text-left px-3 py-1.5 text-[10px] text-primary font-medium bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between">
                  <span>Recently Added</span>
                  <span className="material-symbols-outlined text-[12px]">check</span>
                </button>
                <button type="button" className="w-full text-left px-3 py-1.5 text-[10px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Name (A-Z)
                </button>
                <button type="button" className="w-full text-left px-3 py-1.5 text-[10px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Link Count
                </button>
              </div>
            </div>
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

          {/* ── 빈 상태 ── */}
          {folders && folders.length === 0 && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-1 text-gray-400 text-xs">
                <span className="material-symbols-outlined text-2xl">folder_off</span>
                <span>아직 생성된 폴더가 없습니다</span>
              </div>
            </div>
          )}

          {/* ── 폴더 카드 목록 (백엔드 데이터 반복 렌더링) ── */}
          {folders?.map((folder) => (
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
              className="bg-white dark:bg-card-dark rounded-lg p-2.5 border border-gray-100 dark:border-gray-800 hover:shadow-sm hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 group cursor-pointer h-[90px] flex flex-col justify-between focus:ring-1 focus:ring-purple-300 outline-none hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
            >
              <div className="flex justify-between items-start">
                <div className="p-1.5 bg-purple-50/80 dark:bg-purple-900/15 text-gray-400 rounded-md flex items-center justify-center w-8 h-8">
                  <span className="material-symbols-outlined text-[16px]">folder_open</span>
                </div>
                <button type="button" className="text-gray-300 hover:text-purple-500">
                  <span className="material-symbols-outlined text-sm">more_horiz</span>
                </button>
              </div>
              <div>
                <h4 className="font-semibold text-[10px] xl:text-[11px] text-gray-800 dark:text-gray-200 truncate mt-1.5">
                  {folder.folderName}
                </h4>
              </div>
            </div>
          ))}

        </div>

      </div>

      {/* Right Sidebar Panel */}
      <RightPanel />
    </div>
  );
}
