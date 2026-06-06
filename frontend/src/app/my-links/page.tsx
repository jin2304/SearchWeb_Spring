'use client';

import { FolderCard } from '@/components/my-links/FolderCard';
import { RightPanel } from '@/components/my-links/RightPanel';
import { useUIStore } from '@/lib/store/uiStore';
import { useFolders } from '@/lib/api/folderApi';
import { useFolderStore, type SearchScope } from '@/lib/store/folderStore';
import { useAuthStore } from '@/lib/store/authStore';
import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import { useBookmarks } from '@/lib/api/bookmarkApi';
import { useLinkStore } from '@/lib/store/linkStore';
import { FOLDER_TYPE } from '@/lib/types/folder';
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { compareFolders } from '@/lib/utils/folderUtils';

export default function MyLinksPage() {
  const { toggleRightPanel, toggleSaveLinkDialog, saveLinkDialogOpen } = useUIStore();
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [shouldRenderTooltip, setShouldRenderTooltip] = useState(false);

  useEffect(() => {
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

    checkClipboard();

    window.addEventListener('focus', checkClipboard);
    return () => {
      window.removeEventListener('focus', checkClipboard);
    };
  }, [saveLinkDialogOpen]);

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
      }, 30000);

      clearTimer = setTimeout(() => {
        setShouldRenderTooltip(false);
        setClipboardUrl(null);
      }, 31000);
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
  const unorganizedFilter = useFolderStore((s) => s.unorganizedFilter); // 미분류 필터 상태
  const toggleUnorganizedFilter = useFolderStore((s) => s.toggleUnorganizedFilter); // 미분류 필터 토글 함수
  const memberId = useAuthStore((s) => s.member?.memberId);           // 로그인된 사용자 ID
  const isAuthInitializing = useAuthStore((s) => s.isInitializing);   // 인증 세션 복구 중 여부

  // 검색어 디바운스 처리를 위한 로컬 상태
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // 외부(스토어)에서 검색어가 직접 변경될 경우(예: 초기화 버튼) 로컬 상태와 동기화
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // 디바운스 로직: localSearchQuery가 변경되면 250ms 후에 스토어 업데이트
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  // CSS 변수에서 tablet-lg 브레이크포인트를 읽어 px 값으로 변환합니다.
  // globals.css의 --breakpoint-tablet-lg 값과 항상 동기화됩니다.
  useEffect(() => {
    const getTabletLgBreakpoint = (): number => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--breakpoint-tablet-lg')
        .trim(); // e.g. "87.5rem"
      const remValue = parseFloat(raw); // 87.5
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize); // 보통 16px
      return remValue * rootFontSize; // 1400px
    };

    const handleResize = () => {
      const breakpoint = getTabletLgBreakpoint();
      const isDesktop = window.innerWidth >= breakpoint;
      const currentPanelState = useUIStore.getState().rightPanelOpen;
      
      // 상태가 실제로 변경될 때만 업데이트를 호출하여 무한 렌더링/렉을 예방합니다.
      if (isDesktop && !currentPanelState) {
        toggleRightPanel(true);
      } else if (!isDesktop && currentPanelState) {
        toggleRightPanel(false);
      }
    };

    // 초기 실행
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [toggleRightPanel]);

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
      
      // 선택 시에만 수행: 현재 폴더 검색어를 링크 검색어로 동기화
      if (searchQuery) {
        useLinkStore.getState().setSearchQuery(searchQuery);
      }
      
      // 선택 시에만 수행: 우측 패널 열기
      toggleRightPanel(true);
    }
  };

  // 검색 범위가 '전체' 또는 '링크'로 변경될 때 폴더 선택 해제
  useEffect(() => {
    if (searchScope === 'all' || searchScope === 'links') {
      setSelectedFolderId(null);
    }
  }, [searchScope, setSelectedFolderId]);

  // 검색어 동기화: 검색 범위가 '전체' 또는 '링크'일 때만 링크 스토어와 검색어 연동
  useEffect(() => {
    if (searchScope === 'all' || searchScope === 'links') {
      const currentLinkQuery = useLinkStore.getState().filters.searchQuery;
      if (currentLinkQuery !== searchQuery) {
        useLinkStore.getState().setSearchQuery(searchQuery);
      }
    }
  }, [searchQuery, searchScope]);

  // 검색 필터링 로직
  const isSearching = searchQuery.trim().length > 0;

  // 미분류 폴더 ID 찾기
  const unorganizedFolder = folders?.find(f => f.folderType === FOLDER_TYPE.UNORGANIZED);
  const unorganizedFolderId = unorganizedFolder?.memberFolderId;

  // 북마크 데이터 조회 조건 결정:
  // 1. 전체 또는 링크 범위 검색 중이거나
  // 2. 오늘 저장 필터가 활성화된 경우
  // 3. Unread 필터가 활성화된 경우
  // 4. 미분류 필터가 활성화된 경우 서버에서 북마크 정보를 가져옴
  // 단, 미분류 필터가 활성화되었지만 아직 폴더 정보(unorganizedFolderId)를 불러오지 못한 경우 요청을 보류합니다.
  const shouldFetchBookmarks = 
    ((searchScope === 'all' || searchScope === 'links') && isSearching) || 
    savedTodayFilter || 
    unreadFilter || 
    (unorganizedFilter && unorganizedFolderId != null);
    
  const bookmarkParams: Parameters<typeof useBookmarks>[0] = {};
  if (isSearching && (searchScope === 'all' || searchScope === 'links')) bookmarkParams.query = searchQuery;
  if (unreadFilter) bookmarkParams.unreadOnly = true;
  if (savedTodayFilter) bookmarkParams.savedTodayOnly = true;
  if (unorganizedFilter && unorganizedFolderId) bookmarkParams.folderId = unorganizedFolderId;
  const { data: allBookmarks } = useBookmarks(
    bookmarkParams,
    { enabled: shouldFetchBookmarks }
  );

  // 북마크 데이터로부터 필터링에 필요한 ID 집합(Set) 추출 (O(N))
  // matchingFolderIdsSet은 백엔드에서 정확하게 필터링된 폴더들
  const matchingFolderIdsSet = new Set(allBookmarks?.matchingFolderIds ?? []);

  // --- Folder Logic (Filtering & Sorting) ---

  // 1. 검색/필터링 결과 폴더 목록 메모이제이션
  const processedSearchResultFolders = useMemo(() => {
    if (!folders) return [];
    
    // 필터링 로직 수행
    let filtered = isSearching
      ? folders.filter((folder) => {
          const queryLower = searchQuery.toLowerCase();
          
          // 검색 범위에 따른 매칭 확인
          const matchFolderName = (searchScope === 'all' || searchScope === 'folders') 
            && folder.folderName.toLowerCase().includes(queryLower);
            
          const matchBookmark = (searchScope === 'all' || searchScope === 'links') 
            && matchingFolderIdsSet.has(folder.memberFolderId);
            
          return matchFolderName || matchBookmark;
        })
      : [...folders];

    // 추가 필터링 (오늘 저장, 안 읽음, 미분류)
    if (savedTodayFilter) {
      filtered = filtered.filter((f) => matchingFolderIdsSet.has(f.memberFolderId));
    }
    if (unreadFilter) {
      filtered = filtered.filter((f) => matchingFolderIdsSet.has(f.memberFolderId));
    }
    if (unorganizedFilter) {
      filtered = filtered.filter((f) => f.folderType === FOLDER_TYPE.UNORGANIZED);
    }

    // 최종 정렬 적용
    return [...filtered].sort((a, b) => compareFolders(a, b, folderSort));
  }, [folders, isSearching, searchQuery, searchScope, matchingFolderIdsSet, savedTodayFilter, unreadFilter, unorganizedFilter, folderSort]);

  // 2. 대시보드용 전체 폴더 목록 메모이제이션 (정렬만 적용)
  const processedAllFolders = useMemo(() => {
    return (folders ?? []).slice().sort((a, b) => compareFolders(a, b, folderSort));
  }, [folders, folderSort]);

  const searchResultFolderCount = processedSearchResultFolders.length;
  const matchedLinksCount = allBookmarks?.bookmarks?.length ?? 0;

  // 헤더 메시지 생성
  let headerLabel = '';
  if (unorganizedFilter) {
    headerLabel = `Unorganized: ${searchResultFolderCount} folders found`;
  } else if (unreadFilter) {
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
  const isShowingFiltered = isSearching || savedTodayFilter || unreadFilter || unorganizedFilter;
  const emptyFilteredMessage = (() => {
    if (unreadFilter && savedTodayFilter) return 'No unread links saved today';
    if (unorganizedFilter && savedTodayFilter) return 'No unorganized links saved today';
    if (unreadFilter) return 'No unread links';
    if (savedTodayFilter) return 'No links saved today';
    if (unorganizedFilter) return 'No unorganized links';
    if (isSearching) return 'No results match your search';
    return 'No matching folders';
  })();

  const PINNED_COLORS = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-blue-500 to-cyan-500',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600'
  ];





  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-2 pb-28 tablet-lg:px-5 tablet-lg:py-3 tablet-lg:pb-4 transition-colors duration-300 bg-[#fafafa] dark:bg-white/[0.04]">
        
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
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              
              {/* Search Scope Toggle Dropdown using common component */}
              <SortDropdown 
                value={searchScope}
                onChange={(val) => setSearchScope(val as SearchScope)}
                options={scopeOptions}
                className="shrink-0 mr-1 ml-1"
                panelClassName="w-28 right-[-12px]"
                align="right"
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
              onClick={toggleUnorganizedFilter}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors shadow-sm border ${
                unorganizedFilter
                  ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-600 text-rose-700 dark:text-rose-300'
                  : 'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined !text-[12px] text-rose-400">inventory_2</span> Unorganized
            </button>
            <button
              type="button"
              onClick={toggleUnreadFilter}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors shadow-sm border ${
                unreadFilter
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined !text-[12px] text-blue-500">mark_email_unread</span> Unread
            </button>
            <button
              type="button"
              onClick={toggleSavedTodayFilter}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors shadow-sm border ${
                savedTodayFilter
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-card-dark border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`material-symbols-outlined !text-[12px] ${savedTodayFilter ? 'text-emerald-500' : 'text-green-500'}`}>today</span> Saved today
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
                  <span className="text-xs text-gray-400 font-medium">{emptyFilteredMessage}</span>
                </div>
              ) : (
                processedSearchResultFolders.map((folder) => (
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
              <div className="mb-10 sm:mb-5">
                <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-3 ml-1">Pinned</h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                  {pinnedFolders.map((folder, idx) => (
                    <div
                      key={folder.memberFolderId}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleFolderBadgeClick(folder.memberFolderId)}
                      className={cn(
                        PINNED_COLORS[idx % PINNED_COLORS.length],
                        "text-white rounded-lg p-2.5 flex flex-col justify-between h-20 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 cursor-pointer outline-none",
                        selectedFolderId === folder.memberFolderId 
                          ? 'ring-2 ring-inset ring-white/60 dark:ring-white/30 shadow-md scale-[1.02]' 
                          : 'shadow-sm hover:shadow-md',
                        folder.folderType === FOLDER_TYPE.UNORGANIZED && "max-sm:hidden"
                      )}
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
                        <h3 className="font-semibold text-[10px] tablet-lg:text-[11px] truncate w-full">{folder.folderName}</h3>
                      </div>
                      <div className="absolute -right-4 -bottom-4 w-10 h-10 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 mb-3 ml-1 relative z-30">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-gray-800 dark:text-gray-100">My Folder</h2>
              </div>
              
              <div className="flex items-center flex-wrap gap-1.5 focus-within:z-20 relative w-full sm:w-auto justify-start sm:justify-end">
                <SortDropdown 
                  value={folderSort}
                  onChange={setFolderSort}
                  options={folderSortOptions}
                  align="right"
                  panelClassName="right-[-8px] bg-white/78 border-white/70 ring-1 ring-slate-200/60 backdrop-blur-xl shadow-[0_20px_45px_-18px_rgba(15,23,42,0.22),0_12px_24px_-16px_rgba(148,163,184,0.45)] dark:ring-0 dark:backdrop-blur-md"
                />
                <button 
                  type="button"
                  onClick={() => useUIStore.getState().toggleCreateFolderDialog(true)}
                  className="hidden tablet-lg:flex group items-center gap-1 px-2 py-1 border border-gray-200/80 dark:border-white/8 rounded-md text-[10px] font-medium transition-all duration-200 bg-white/50 dark:bg-slate-900/50 text-gray-600 dark:text-white hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-200/50 dark:hover:border-purple-300/50"
                >
                  <span className="material-symbols-outlined !text-[12px] text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors leading-none">folder</span>
                  <span>Create Folder</span>
                </button>
                <div className="relative hidden tablet-lg:block z-50">
                  {shouldRenderTooltip && clipboardUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        toggleSaveLinkDialog(true, clipboardUrl);
                        setClipboardUrl(null);
                      }}
                      className={`absolute -top-14 right-[-8px] z-50 group outline-none transition-all duration-1000 ease-in-out ${
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
                            d="M 19 0 L 145 0 A 19 19 0 0 1 164 19 A 19 19 0 0 1 145 38 L 125 38 C 120.5 38 118 39.5 116 45 C 114 39.5 111.5 38 107 38 L 19 38 A 19 19 0 0 1 0 19 A 19 19 0 0 1 19 0 Z" 
                            className="fill-white dark:fill-[#0a0a0b] group-hover:fill-violet-50 dark:group-hover:fill-[#1c142c] transition-colors duration-300"
                          />
                          {/* Consistent Outer Border */}
                          <path 
                            d="M 19 0 L 145 0 A 19 19 0 0 1 164 19 A 19 19 0 0 1 145 38 L 125 38 C 120.5 38 118 39.5 116 45 C 114 39.5 111.5 38 107 38 L 19 38 A 19 19 0 0 1 0 19 A 19 19 0 0 1 19 0 Z" 
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
                    onClick={() => {
                      toggleSaveLinkDialog(true, clipboardUrl || undefined);
                      if (clipboardUrl) setClipboardUrl(null);
                    }}
                    className="flex items-center space-x-1 text-[10px] font-bold text-white bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] hover:opacity-90 border-none rounded-md px-2.5 py-1 transition-all shadow-md shadow-purple-500/20 hover:scale-[1.02]"
                  >
                    <span className="material-symbols-outlined !text-[12px] !leading-none">add</span>
                    <span>Save Link</span>
                  </button>
                </div>
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

              {/* ── 가상 'All Links' 폴더 카드 ── */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedFolderId(null);
                  toggleRightPanel(true);
                }}
                className={cn(
                  "bg-white dark:bg-card-dark rounded-lg p-2.5 border transition-all duration-300 group cursor-pointer h-[90px] flex flex-col justify-between outline-none relative overflow-visible",
                  selectedFolderId === null && useUIStore.getState().rightPanelOpen
                    ? "border-purple-500 bg-purple-50/40 dark:border-purple-400 dark:bg-purple-500/10 shadow-sm hover:bg-purple-50/40 dark:hover:bg-purple-500/10"
                    : "border-gray-200/70 dark:border-white/5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-white/10 hover:bg-purple-50/30 dark:hover:bg-white/[0.03]"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-purple-50 dark:bg-white/5 text-gray-400 dark:text-gray-400 group-hover:dark:text-white transition-colors rounded-md flex items-center justify-center w-8 h-8">
                    <span className="material-symbols-outlined text-[16px] font-bold">bookmarks</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-[10.5px] text-gray-800 dark:text-white truncate mt-1.5 flex items-center gap-1">
                    <span>All Links</span>
                  </h4>
                </div>
              </div>

              {/* ── 폴더 카드 목록 (백엔드 데이터 반복 렌더링) ── */}
              {processedAllFolders.map((folder) => (
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
