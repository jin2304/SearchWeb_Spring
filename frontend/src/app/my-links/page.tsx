'use client';

import { FolderCard } from '@/components/my-links/FolderCard';
import { RightPanel } from '@/components/my-links/RightPanel';
import { useUIStore } from '@/lib/store/uiStore';
import { useFolders } from '@/lib/api/folderApi';
import { useFolderStore } from '@/lib/store/folderStore';
import { useAuthStore } from '@/lib/store/authStore';
import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import { useBookmarks } from '@/lib/api/bookmarkApi';
import { useLinkStore } from '@/lib/store/linkStore';
import { useState, useEffect, useRef } from 'react';
import { isCreatedToday } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

const PINNED_COLORS = ['bg-blue-600/90', 'bg-indigo-500/90', 'bg-teal-500/90', 'bg-amber-500/90', 'bg-emerald-600/90'];

export default function MyLinksPage() {
  const { toggleRightPanel } = useUIStore();
  const setSelectedFolderId = useFolderStore((s) => s.setSelectedFolderId);
  const selectedFolderId = useFolderStore((s) => s.selectedFolderId);           // 현재 선택된 폴더 ID
  const searchQuery = useFolderStore((s) => s.searchQuery);           // 폴더 검색어 상태
  const setSearchQuery = useFolderStore((s) => s.setSearchQuery);     // 폴더 검색어 변경 함수
  const searchScope = useFolderStore((s) => s.searchScope);           // 검색 범위 ('folders' | 'all')
  const setSearchScope = useFolderStore((s) => s.setSearchScope);     // 검색 범위 변경 함수
  const savedTodayFilter = useFolderStore((s) => s.savedTodayFilter); // '오늘 저장' 필터 상태
  const toggleSavedTodayFilter = useFolderStore((s) => s.toggleSavedTodayFilter); // 필터 토글 함수
  const unreadFilter = useFolderStore((s) => s.unreadFilter);         // 'Unread' 필터 상태 (view_count = 0)
  const toggleUnreadFilter = useFolderStore((s) => s.toggleUnreadFilter); // Unread 필터 토글 함수
  const memberId = useAuthStore((s) => s.member?.memberId);           // 로그인된 사용자 ID
  const isAuthInitializing = useAuthStore((s) => s.isInitializing);   // 인증 세션 복구 중 여부
  const { data: folders, isLoading: isFoldersLoading, error } = useFolders(memberId); // 전체 폴더 목록 조회

  // 인증 또는 폴더 로딩 중
  const isLoading = isAuthInitializing || isFoldersLoading;
  const pinnedFolders = folders?.slice(0, 5) ?? [];

  const [folderSort, setFolderSort] = useState('recently');
  const folderSortOptions: SortOption[] = [
    { id: 'recently', label: 'Recently Added', icon: 'schedule' },
    { id: 'a-z', label: 'Name (A-Z)', icon: 'sort_by_alpha' },
    { id: 'count', label: 'Link Count', icon: 'list_alt' }
  ];

  const scopeOptions: SortOption[] = [
    { id: 'all', label: 'All', icon: 'filter_alt' },
    { id: 'folders', label: 'Folders', icon: 'folder' },
    { id: 'links', label: 'Links', icon: 'link' },
  ];

  // 상단 고정 폴더 배지 클릭 처리
  const handleFolderBadgeClick = (folderId: number) => {
    const currentSelectedId = useFolderStore.getState().selectedFolderId;
    if (currentSelectedId === folderId) {
      setSelectedFolderId(null);
    } else {
      setSelectedFolderId(folderId); // 선택된 폴더 변경
    }
    useLinkStore.getState().setSearchQuery(searchQuery); // 현재 폴더 검색어를 링크 검색어로 동기화
  };

  // all 또는 links 검색 스코프일 때 자동으로 전체 폴더 선택 해제 및 링크 검색어 동기화
  useEffect(() => {
    if (searchScope === 'all' || searchScope === 'links') {
      useLinkStore.getState().setSearchQuery(searchQuery);
      setSelectedFolderId(null);
    }
  }, [searchQuery, searchScope, setSelectedFolderId]);

  // 검색 필터링 로직
  const isSearching = searchQuery.trim().length > 0;

  // 북마크 데이터 조회 조건 결정:
  // 1. 전체 또는 링크 범위 검색 중이거나
  // 2. 오늘 저장 필터가 활성화된 경우
  // 3. Unread 필터가 활성화된 경우 서버에서 북마크 정보를 가져옴
  const shouldFetchBookmarks = ((searchScope === 'all' || searchScope === 'links') && isSearching) || savedTodayFilter || unreadFilter;
  const bookmarkParams: Parameters<typeof useBookmarks>[0] = {};
  if (isSearching && (searchScope === 'all' || searchScope === 'links')) bookmarkParams.query = searchQuery;
  if (unreadFilter) bookmarkParams.unreadOnly = true;
  const { data: allBookmarks } = useBookmarks(
    bookmarkParams,
    { enabled: shouldFetchBookmarks }
  );

  // 북마크 데이터로부터 필터링에 필요한 ID 집합(Set) 추출 (O(N))
  const matchingFolderIdsSet = new Set(allBookmarks?.matchingFolderIds ?? []);
  const todayFolderIdsSet = new Set(
    savedTodayFilter && allBookmarks?.bookmarks
      ? allBookmarks.bookmarks
          .filter((b) => isCreatedToday(b.createdAt))
          .map((b) => b.memberFolderId)
      : []
  );
  const unreadFolderIdsSet = new Set(
    unreadFilter && allBookmarks?.bookmarks
      ? allBookmarks.bookmarks.map((b) => b.memberFolderId)
      : []
  );

  // 폴더 필터링: 폴더명 매칭 또는 백엔드에서 판별된 매칭 폴더 확인 (O(M))
  let searchResultFolders = isSearching
    ? (folders ?? []).filter((folder) => {
        const queryLower = searchQuery.toLowerCase();
        
        // 검색 범위에 따른 매칭 확인
        const matchFolderName = (searchScope === 'all' || searchScope === 'folders') 
          && folder.folderName.toLowerCase().includes(queryLower);
          
        const matchBookmark = (searchScope === 'all' || searchScope === 'links') 
          && matchingFolderIdsSet.has(folder.memberFolderId);
          
        return matchFolderName || matchBookmark;
      })
    : (folders ?? []);

  // '오늘 저장한 링크' 필터링 최적화 (O(M))
  if (savedTodayFilter) {
    searchResultFolders = searchResultFolders.filter((folder) =>
      todayFolderIdsSet.has(folder.memberFolderId)
    );
  }

  // 'Unread' 필터링 (O(M)): 안 읽은 북마크가 포함된 폴더만 유지
  if (unreadFilter) {
    searchResultFolders = searchResultFolders.filter((folder) =>
      unreadFolderIdsSet.has(folder.memberFolderId)
    );
  }

  const searchResultFolderCount = searchResultFolders.length;
  const matchedLinksCount = allBookmarks?.bookmarks?.length ?? 0;

  // 헤더 메시지 생성
  let headerLabel = '';
  if (unreadFilter) {
    headerLabel = `Unread: ${searchResultFolderCount} folders found`;
  } else if (savedTodayFilter) {
    headerLabel = `Saved Today: ${searchResultFolderCount} folders found`;
  } else if (searchScope === 'all') {
    headerLabel = `${searchResultFolderCount} folders & ${matchedLinksCount} links found`;
  } else if (searchScope === 'links') {
    headerLabel = `${matchedLinksCount} links found in ${searchResultFolderCount} folders`;
  } else {
    headerLabel = `${searchResultFolderCount} folders found`;
  }

  // 필터 또는 검색 활성화 시 결과 표시
  // 대시보드 대신 검색 결과 화면을 보여줄지 여부 (검색 중이거나 필터 활성화 시)
  const isShowingFiltered = isSearching || savedTodayFilter || unreadFilter;

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-2 xl:px-5 xl:py-3 transition-all duration-300 bg-[#fafafa] dark:bg-white/[0.04]">
        
        {/* Top Search & Filter Section */}
        <div className="mb-5 flex flex-col items-start bg-transparent">
          
          <div className="relative w-full max-w-md mb-3">
            <div className="group bg-white dark:bg-gray-900 rounded-full flex items-center p-1 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
              <div className="pl-3 pr-2 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors flex items-center">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </div>
              <input 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs py-1.5 px-1 text-gray-800 dark:text-gray-100 placeholder-gray-400 font-normal" 
                placeholder="Search folders or links" 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Search Scope Toggle Dropdown using common component */}
              <SortDropdown 
                value={searchScope}
                onChange={(val) => setSearchScope(val as 'all' | 'folders' | 'links')}
                options={scopeOptions}
                className="shrink-0 mr-1 ml-1"
                panelClassName="w-28"
                renderTrigger={({ selectedOption, isOpen, toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className={cn(
                      "flex items-center justify-center h-7 w-7 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200",
                      isOpen && "bg-gray-100 dark:bg-gray-800 text-purple-500 dark:text-purple-400"
                    )}
                    title="Search Filter"
                  >
                    <span className="material-symbols-outlined !text-[16px]">
                      {selectedOption?.icon || 'filter_alt'}
                    </span>
                  </button>
                )}
              />

              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => {
                    setSearchQuery('');
                    // 검색어 삭제 시 필요하면 범위도 초기화하거나 유지 (여기선 유지)
                  }}
                  className="group/close flex items-center justify-center h-[18px] w-[18px] aspect-square bg-gray-200/70 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition-all duration-200 mr-1.5 shrink-0"
                >
                  <svg 
                    className="w-2.5 h-2.5 transition-transform duration-200 group-hover/close:rotate-90" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-1 pb-1 pl-1">
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px]">tune</span> Filter
            </button>
            <div className="h-2.5 w-px bg-gray-300 dark:bg-gray-700 mx-0.5"></div>
            <button 
              type="button" 
              className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined !text-[12px] text-rose-400">inventory_2</span> Unorganized
            </button>
            <button
              type="button"
              onClick={() => {
                const nextValue = !unreadFilter;
                toggleUnreadFilter();
                if (nextValue) {
                  setSelectedFolderId(null);
                }
              }}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors shadow-sm border ${
                unreadFilter
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined !text-[12px] text-blue-500">mark_email_unread</span> Unread
            </button>
            {/* 
            <button type="button" className="flex items-center justify-center gap-1 px-2 py-0.5 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-full text-[9px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined !text-[12px] text-amber-500">priority_high</span> High Priority
            </button> 
            */}
            <button
              type="button"
              onClick={() => {
                const nextValue = !savedTodayFilter;
                toggleSavedTodayFilter();
                if (nextValue) {
                  setSelectedFolderId(null);
                }
              }}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors shadow-sm border ${
                savedTodayFilter
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                  : 'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined !text-[12px] text-green-500">today</span> Saved today
            </button>
          </div>
        </div>

        {/* 검색어 있음 또는 필터 활성화: 폴더 카드 그리드로 검색 결과 표시 */}
        {isShowingFiltered && (
          <div>
            <div className="mb-4 ml-1">
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-purple-500">search</span>
                {headerLabel}
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {searchResultFolderCount === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white/40 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-700 mb-2">search_off</span>
                  <span className="text-xs text-gray-400 font-medium">No results match your search</span>
                </div>
              ) : (
                searchResultFolders.sort((a, b) => {
                  if (a.folderType === 'UNORGANIZED' && b.folderType !== 'UNORGANIZED') return -1;
                  if (b.folderType === 'UNORGANIZED' && a.folderType !== 'UNORGANIZED') return 1;
                  return 0;
                }).map((folder) => (
                  <FolderCard key={folder.memberFolderId} folder={folder} />
                ))
              )}
            </div>
          </div>
        )}

        {/* 검색어 없음 & 필터 미활성화: 기존 대시보드 */}
        {!isShowingFiltered && (
          <>
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
                      onClick={() => handleFolderBadgeClick(folder.memberFolderId)}
                      className={`${PINNED_COLORS[idx % PINNED_COLORS.length]} text-white rounded-lg p-2.5 flex flex-col justify-between h-20 shadow-sm relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 cursor-pointer outline-none hover:shadow-md ${
                        selectedFolderId === folder.memberFolderId 
                          ? 'ring-2 ring-purple-400 ring-offset-2' 
                          : ''
                      }`}
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
                    <span>Loading folders...</span>
                  </div>
                </div>
              )}

              {/* ── 에러 상태 ── */}
              {error && (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <span className="material-symbols-outlined text-sm">error</span>
                    <span>Failed to load folders: {error.message}</span>
                  </div>
                </div>
              )}

              {/* ── 빈 상태 (로딩이 끝난 후 데이터가 없는 경우) ── */}
              {!isLoading && folders && folders.length === 0 && (
                <div className="col-span-full flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-1 text-gray-400 text-xs">
                    <span className="material-symbols-outlined text-2xl">folder_off</span>
                    <span>No folders created yet</span>
                  </div>
                </div>
              )}

              {/* ── 폴더 카드 목록 (백엔드 데이터 반복 렌더링) ── */}
              {(folders ? [...folders] : []).sort((a, b) => {
                // 시스템(미분류) 폴더는 항상 최상단 고정
                if (a.folderType === 'UNORGANIZED' && b.folderType !== 'UNORGANIZED') return -1;
                if (b.folderType === 'UNORGANIZED' && a.folderType !== 'UNORGANIZED') return 1;
                if (folderSort === 'recently') return b.memberFolderId - a.memberFolderId;
                if (folderSort === 'a-z') return a.folderName.localeCompare(b.folderName);
                return 0;
              }).map((folder) => (
                <FolderCard key={folder.memberFolderId} folder={folder} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar Panel */}
      <RightPanel />
    </div>
  );
}
