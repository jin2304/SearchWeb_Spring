import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useFolders } from '@/lib/api/folderApi';
import { useInfiniteBookmarks, useDeleteBookmark, useUpdateBookmark, useRecordBookmarkView } from '@/lib/api/bookmarkApi';
import { useTags } from '@/lib/api/tagApi';
import { useFolderStore } from '@/lib/store/folderStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useLinkStore } from '@/lib/store/linkStore';
import { SortDropdown, SortOption } from '@/components/ui/SortDropdown';
import type { BookmarkResponse } from '@/lib/types/bookmark';
import { FOLDER_TYPE } from '@/lib/types/folder';
import { compareFolders } from '@/lib/utils/folderUtils';
import { buildGoogleFaviconUrl, getUrlHostname, getUrlBaseDomain, buildDirectFaviconUrl } from '@/lib/utils/favicon';

/**
 * 날짜 문자열을 받아 현재 시간 기준 상대적인 시간(예: Just now, 5m ago)으로 변환합니다.
 */
function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

/**
 * 각각의 북마크(링크) 항목을 렌더링하는 컴포넌트입니다.
 * 제목/메모 수정, 삭제, 상세 메뉴 기능을 포함합니다.
 */
function LinkItem({
  data,
  isBulkEditMode,
  isSelected,
  folders,
  onToggleSelect,
  onDelete,
  onUpdateNote,
  onUpdateTitle,
  onUpdateFolder,
  onUpdateTags,
  onOpenLink,
}: {
  data: BookmarkResponse;
  isBulkEditMode?: boolean;
  isSelected?: boolean;
  folders?: any[]; // FolderResponse[]
  onToggleSelect?: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdateNote?: (id: number, note: string) => void;
  onUpdateTitle?: (id: number, title: string) => void;
  onUpdateFolder?: (id: number, folderId: number) => void;
  onUpdateTags?: (id: number, tags: string) => void;
  onOpenLink?: (bookmark: BookmarkResponse) => void;
}) {
  // --- State Management | 상태 관리 ---
  const [isNoteEditing, setIsNoteEditing] = useState(false);                 // 메모 편집 모드 여부
  const [noteContent, setNoteContent] = useState(data.note ?? '');           // 메모 입력값
  const [isTitleEditing, setIsTitleEditing] = useState(false);               // 제목 편집 모드 여부
  const [titleContent, setTitleContent] = useState(data.displayTitle ?? ''); // 제목 입력값
  const [isTagEditing, setIsTagEditing] = useState(false);                   // 태그 편집 모드 여부
  const [tagInput, setTagInput] = useState(data.tags?.join(', ') ?? '');     // 태그 입력값
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);               // 더보기 메뉴 오픈 여부 
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);   // 폴더 이동 드롭다운 여부
  const [faviconFallbackStep, setFaviconFallbackStep] = useState<'basedomain' | 'direct' | 'failed'>('basedomain');

  // 북마크 데이터가 바뀌면 파비콘 재시도 플래그를 리셋합니다.
  useEffect(() => {
    setFaviconFallbackStep('basedomain');
  }, [data.bookmarkId]);
  
  const noteInputRef = useRef<HTMLInputElement>(null);     // 메모 입력창 참조
  const titleInputRef = useRef<HTMLInputElement>(null);    // 제목 입력창 참조
  const tagInputRef = useRef<HTMLInputElement>(null);      // 태그 입력창 참조
  const dropdownRef = useRef<HTMLDivElement>(null);        // 드롭다운 메뉴 참조
  const folderDropdownRef = useRef<HTMLDivElement>(null);  // 폴더 드롭다운 참조
  const itemRef = useRef<HTMLDivElement>(null);            // LinkItem 전체 컨테이너 참조
  const isEditing = isTitleEditing || isNoteEditing || isTagEditing;
  const isActive = (isBulkEditMode && isSelected) || isEditing;
  const itemDarkClass = isActive
    ? 'dark:border-violet-400/55 dark:[background:linear-gradient(135deg,rgba(109,40,217,0.24)_0%,rgba(139,92,246,0.16)_52%,rgba(30,41,59,0.2)_100%)] dark:shadow-[0_22px_46px_-24px_rgba(124,58,237,0.58),0_0_0_1px_rgba(167,139,250,0.14)]'
    : 'dark:border-gray-800/60 dark:[background-color:rgba(15,23,42,0.35)] dark:[background-image:none] dark:hover:border-violet-400/35 dark:hover:shadow-[0_16px_36px_-20px_rgba(124,58,237,0.3),inset_0_0_0_1px_rgba(139,92,246,0.18)]';
  const glowDarkClass = isActive
    ? 'dark:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.24)_0%,rgba(124,58,237,0.14)_40%,rgba(124,58,237,0)_74%)]'
    : 'dark:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.2)_0%,rgba(124,58,237,0.1)_40%,rgba(124,58,237,0)_74%)]';
  const surfaceDarkClass = isActive
    ? 'dark:bg-[linear-gradient(135deg,rgba(109,40,217,0.22)_0%,rgba(139,92,246,0.14)_48%,rgba(30,41,59,0.16)_100%)]'
    : 'dark:bg-[linear-gradient(135deg,rgba(109,40,217,0.2)_0%,rgba(139,92,246,0.14)_48%,rgba(30,41,59,0.1)_100%)]';
  const ringDarkClass = isActive ? 'dark:ring-violet-400/35 dark:ring-2' : 'dark:ring-violet-400/25 dark:group-hover:ring-transparent';
  const iconDarkClass = 'dark:bg-gray-800 dark:border-gray-700 dark:group-hover:border-violet-400/30 dark:group-hover:bg-[linear-gradient(135deg,rgba(109,40,217,0.3)_0%,rgba(139,92,246,0.18)_100%)] dark:group-hover:text-violet-200 dark:group-hover:shadow-[0_12px_24px_-16px_rgba(124,58,237,0.8)]';
  const tagDarkClass = 'dark:border-white/8 dark:bg-slate-800/85 dark:text-slate-300 dark:group-hover:border-violet-400/30 dark:group-hover:bg-[linear-gradient(135deg,rgba(76,29,149,0.32)_0%,rgba(109,40,217,0.22)_100%)] dark:group-hover:text-violet-100';

  // 대안 A 파비콘 폴백 주소 계산
  const fallbackFaviconUrl = (() => {
    const originalUrl = data.link?.originalUrl ?? data.link?.canonicalUrl ?? data.link?.domain;
    if (!originalUrl) return null;
    if (faviconFallbackStep === 'basedomain') {
      return buildGoogleFaviconUrl(getUrlBaseDomain(originalUrl));
    }
    if (faviconFallbackStep === 'direct') {
      return buildDirectFaviconUrl(originalUrl);
    }
    return null;
  })();

  const fallbackDomain =
    getUrlHostname(data.link?.originalUrl) ??
    getUrlHostname(data.link?.canonicalUrl) ??
    getUrlHostname(data.link?.domain) ??
    data.link?.domain ??
    data.displayTitle;
  const fallbackInitial = fallbackDomain?.[0]?.toUpperCase() ?? 'L';


  // Handle outside clicks for dropdowns and editing modes | 드롭다운 및 편집 모드 외부 클릭 시 닫기/저장 처리
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 드롭다운 외부 클릭 처리
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }

      // 폴더 드롭다운 외부 클릭 처리
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(event.target as Node)) {
        setIsFolderDropdownOpen(false);
      }
      
      // 제목/메모 편집 중 외부 클릭 처리 (항목 외부 클릭 시 저장 및 해제)
      // 단, 드롭다운 메뉴나 폴더 선택기가 열려있는 동안 그 내부를 클릭하는 경우 제외
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        if (isNoteEditing) handleNoteEditComplete();
        if (isTitleEditing) handleTitleEditComplete();
        if (isTagEditing) handleTagEditComplete();
      }
    }

    if (isDropdownOpen || isNoteEditing || isTitleEditing || isFolderDropdownOpen || isTagEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isNoteEditing, isTitleEditing, isFolderDropdownOpen, isTagEditing, noteContent, titleContent, tagInput]);

  // Sync tag input with data tags when data changes | 데이터 변경 시 태그 입력값 동기화
  useEffect(() => {
    setTagInput(data.tags?.join(', ') ?? '');
  }, [data.tags]);


  /** 메모 편집 완료 (Blur 또는 Enter) */
  const handleNoteEditComplete = (e?: React.FocusEvent) => {
    // 제목 입력창, 폴더 드롭다운, 태그 입력창으로 포커스가 이동한 경우 편집모드를 유지함
    const target = e?.relatedTarget as HTMLElement;
    if (target === titleInputRef.current || 
        target === tagInputRef.current || 
        folderDropdownRef.current?.contains(target)) return;
    
    // 드롭다운이 열려있는 동안은 편집모드를 유지함
    if (isFolderDropdownOpen) return;

    setIsNoteEditing(false);
    if (noteContent !== (data.note ?? '') && onUpdateNote) {
      onUpdateNote(data.bookmarkId, noteContent);
    }
  };


  /** 제목 편집 완료 (Blur 또는 Enter) */
  const handleTitleEditComplete = (e?: React.FocusEvent) => {
    // 메모 입력창, 폴더 드롭다운, 태그 입력창으로 포커스가 이동한 경우 편집모드를 유지함
    const target = e?.relatedTarget as HTMLElement;
    if (target === noteInputRef.current || 
        target === tagInputRef.current || 
        folderDropdownRef.current?.contains(target)) return;

    // 드롭다운이 열려있는 동안은 편집모드를 유지함
    if (isFolderDropdownOpen) return;

    setIsTitleEditing(false);
    const trimmed = titleContent.trim();
    if (trimmed && trimmed !== data.displayTitle && onUpdateTitle) {
      onUpdateTitle(data.bookmarkId, trimmed);
    } else if (!trimmed) {
      // 빈 값일 경우 기존 제목으로 복구
      setTitleContent(data.displayTitle ?? '');
    }
  };


  /** 메모 입력창 키 이벤트 핸들러 */
  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleNoteEditComplete();
    }
  };


  /** 제목 입력창 키 이벤트 핸들러 */
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      setTitleContent(data.displayTitle ?? '');
      setIsTitleEditing(false);
    }
  };


  /** 태그 편집 완료 (Blur 또는 Enter) */
  const handleTagEditComplete = () => {
    setIsTagEditing(false);
    
    // 쉼표로 분리 후 각 태그의 공백 제거, 빈 값 제외, 다시 쉼표로 결합
    const cleanedInput = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '')
      .join(', ');

    const currentTags = data.tags?.join(', ') ?? '';
    
    if (cleanedInput !== currentTags && onUpdateTags) {
      onUpdateTags(data.bookmarkId, cleanedInput);
    } else if (!cleanedInput && currentTags) {
      onUpdateTags?.(data.bookmarkId, '');
    } else {
      // 변경사항이 없으면 원래대로 복구
      setTagInput(currentTags);
    }
  };


  /** 태그 입력창 키 서비스 */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTagEditComplete();
    } else if (e.key === 'Escape') {
      setTagInput(data.tags?.join(', ') ?? '');
      setIsTagEditing(false);
    }
  };

  return (
    <div
      ref={itemRef}
      className={`group relative isolate z-0 hover:z-20 flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer border shadow-sm backdrop-blur-[6px] dark:backdrop-blur-none select-none ${
        isActive
          ? 'border-violet-400/25 bg-white/94 shadow-[0_22px_45px_-20px_rgba(124,58,237,0.22),0_15px_25px_-10px_rgba(124,58,237,0.14),0_0_0_1px_rgba(167,139,250,0.18)]'
          : 'border-gray-200/75 bg-white/88 hover:border-violet-500/50 hover:bg-white/90 hover:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.08),inset_0_0_0_1px_rgba(124,58,237,0.4)] hover:backdrop-blur-md'
      } ${itemDarkClass}`}
      onClick={() => {
        if (isBulkEditMode && onToggleSelect) {
          onToggleSelect(data.bookmarkId);
        } else if (!isNoteEditing && !isTitleEditing && data.link?.originalUrl) {
          onOpenLink?.(data);
          window.open(data.link.originalUrl, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-[-8px] -z-10 rounded-[20px] blur-xl transition-all duration-300 ${
          isActive
            ? 'opacity-100 bg-[radial-gradient(circle_at_50%_36%,rgba(167,139,250,0.24)_0%,rgba(139,92,246,0.08)_34%,rgba(139,92,246,0)_65%)]'
            : 'opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_36%,rgba(167,139,250,0.12)_0%,rgba(139,92,246,0.04)_34%,rgba(139,92,246,0)_65%)]'
        } ${glowDarkClass}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-300 ${
          isActive
            ? 'opacity-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(216,180,254,0.42)_48%,rgba(255,255,255,0.08)_100%)]'
            : 'opacity-0 group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(243,232,255,0.5)_48%,rgba(255,255,255,0.1)_100%)]'
        } ${surfaceDarkClass}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset transition-all duration-300 ${
          isActive
            ? 'opacity-100 ring-2 ring-violet-400/50'
            : 'opacity-0 group-hover:opacity-100 ring-transparent group-hover:ring-transparent'
        } ${ringDarkClass}`}
      />
      
      {/* Bulk Edit Checkbox | 대량 편집 체크박스 */}
      {isBulkEditMode && (
        <div className="relative z-10 mr-3 shrink-0 flex items-center">
          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
            isSelected
              ? 'border-transparent bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_55%,#a78bfa_100%)] text-white shadow-[0_8px_18px_-10px_rgba(124,58,237,0.8)]'
              : 'border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 group-hover:border-violet-300 dark:group-hover:border-violet-500/50'
          }`}>
            {isSelected && <span className="material-symbols-outlined !text-[12px] font-bold">check</span>}
          </div>
        </div>
      )}

      {/* Favicon & Domain Icon | 파비콘 및 도메인 아이콘 */}
      <div className={`relative z-10 h-8 w-8 rounded-lg bg-gray-100 text-gray-400 dark:text-gray-500 flex items-center justify-center flex-shrink-0 text-xs font-bold shrink-0 overflow-hidden border border-gray-100 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-violet-200/90 group-hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(243,232,255,0.96)_100%)] group-hover:text-violet-600 group-hover:shadow-[0_12px_20px_-12px_rgba(124,58,237,0.28)] ${iconDarkClass}`}>
        {data.link?.faviconUrl ? (
          <img 
            src={data.link.faviconUrl} 
            alt="" 
            className="w-5 h-5 object-contain" 
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth === 16 && img.naturalHeight === 16) {
                if (!img.dataset.fallbackStep) {
                  img.dataset.fallbackStep = 'basedomain';
                  img.src = buildGoogleFaviconUrl(getUrlBaseDomain(data.link?.originalUrl)) || '';
                } else if (img.dataset.fallbackStep === 'basedomain') {
                  img.dataset.fallbackStep = 'direct';
                  img.src = buildDirectFaviconUrl(data.link?.originalUrl) || '';
                } else {
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.textContent = fallbackInitial;
                  }
                }
              }
            }}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallbackStep) {
                img.dataset.fallbackStep = 'basedomain';
                img.src = buildGoogleFaviconUrl(getUrlBaseDomain(data.link?.originalUrl)) || '';
              } else if (img.dataset.fallbackStep === 'basedomain') {
                img.dataset.fallbackStep = 'direct';
                img.src = buildDirectFaviconUrl(data.link?.originalUrl) || '';
              } else {
                img.style.display = 'none';
                if (img.parentElement) {
                  img.parentElement.textContent = fallbackInitial;
                }
              }
            }}
          />
        ) : fallbackFaviconUrl ? (
          <img 
            src={fallbackFaviconUrl} 
            alt="" 
            className="w-5 h-5 object-contain"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth === 16 && img.naturalHeight === 16) {
                if (faviconFallbackStep === 'basedomain') {
                  setFaviconFallbackStep('direct');
                } else {
                  img.style.display = 'none';
                  if (img.parentElement) {
                    img.parentElement.textContent = fallbackInitial;
                  }
                }
              }
            }}
            onError={(e) => {
              const img = e.currentTarget;
              if (faviconFallbackStep === 'basedomain') {
                setFaviconFallbackStep('direct');
              } else {
                img.style.display = 'none';
                if (img.parentElement) {
                  img.parentElement.textContent = fallbackInitial;
                }
              }
            }}
          />
        ) : (
          <span className="uppercase">{fallbackInitial}</span>
        )}
      </div>
      <div className="relative z-10 ml-3 flex-1 flex flex-col min-w-0">
        <div className="flex items-center w-full">
          {/* Title Area | 제목 영역 (호버 시 전체 제목 및 URL 표시) */}
          <div className="flex-1 flex items-center min-w-0 h-[28px]">
            {isTitleEditing ? (
                <input
                ref={titleInputRef}
                type="text"
                className="flex-1 text-[10.5px] font-medium bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 rounded-md outline-none text-gray-900 dark:text-gray-100 px-2 h-full py-0 leading-none focus:border-gray-300 dark:focus:border-gray-600"
                value={titleContent}
                onChange={(e) => setTitleContent(e.target.value)}
                onBlur={(e) => handleTitleEditComplete(e)}
                onKeyDown={handleTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h4
                className="text-[10.5px] font-semibold text-gray-900 dark:text-gray-100 truncate pr-2 group-hover:whitespace-normal group-hover:line-clamp-2 transition-all duration-300 group-hover:text-violet-700 dark:group-hover:text-violet-100 cursor-pointer w-full border border-transparent flex items-center px-0 leading-tight"
              >{titleContent}</h4>
            )}
          </div>
        </div>
        
        {/* Folder Info & Quick Move | 폴더 정보 및 빠른 이동 */}
        <div className="flex flex-wrap gap-2 mt-[2px] items-center">
          {/* Current Folder Display/Selector - Only visible in edit mode */}
          {(isTitleEditing || isNoteEditing) && (
            <>
              <div className="relative" ref={folderDropdownRef}>
                <button 
                  className={`inline-flex items-center gap-1 text-[8.5px] font-semibold px-2 py-0.5 rounded transition-all ${isFolderDropdownOpen ? 'bg-gray-100 text-gray-700' : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/20'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFolderDropdownOpen(!isFolderDropdownOpen);
                  }}
                  title="폴더 이동"
                >
                  <span className="material-symbols-outlined !text-[11px] scale-90 text-slate-400">folder</span>
                  <span>{folders?.find(f => f.memberFolderId === data.memberFolderId)?.folderName ?? 'Unordered'}</span>
                  <span className={`material-symbols-outlined !text-[10px] text-slate-400 transition-transform ${isFolderDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {isFolderDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-30 max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                    <div className="px-2 py-1 text-[8px] font-bold text-gray-400 uppercase tracking-tight border-b border-gray-50 dark:border-gray-700 mb-1">Move to</div>
                    {(folders ? [...folders] : []).sort((a, b) => compareFolders(a, b, 'a-z')).map(folder => (
                      <button
                        key={folder.memberFolderId}
                        className={`w-full text-left px-2 py-1.5 text-[9px] font-medium transition-colors flex items-center justify-between ${folder.memberFolderId === data.memberFolderId ? 'text-gray-900 bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (folder.memberFolderId !== data.memberFolderId && onUpdateFolder) {
                            onUpdateFolder(data.bookmarkId, folder.memberFolderId);
                          }
                          setIsFolderDropdownOpen(false);
                        }}
                      >
                        <span className="truncate">{folder.folderName}</span>
                        {folder.memberFolderId === data.memberFolderId && <span className="material-symbols-outlined !text-[10px]">check</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-[1px] h-2 bg-gray-200 dark:bg-gray-700 mx-0.5" />
            </>
          )}

          {/* Tags Display/Editor */}
          <div 
            className={`flex flex-wrap gap-1 items-center px-0 ${(isTitleEditing || isNoteEditing) ? 'cursor-pointer' : 'pointer-events-none'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isTitleEditing || isNoteEditing) {
                setIsTagEditing(true);
              }
            }}
          >
            {isTagEditing ? (
              <input
                ref={tagInputRef}
                type="text"
                className="text-[8.5px] font-medium bg-gray-50/50 dark:bg-gray-800/10 border border-gray-200 dark:border-gray-700 rounded-md outline-none text-gray-700 dark:text-gray-300 px-1.5 py-0 min-w-[60px] h-[18px]"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={handleTagEditComplete}
                onKeyDown={handleTagKeyDown}
                placeholder="tags (comma separated)..."
                autoFocus
              />
            ) : (
              <>
                {data.tags && data.tags.length > 0 ? (
                  data.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[8.5px] px-2 py-0.5 rounded border border-transparent bg-gray-100/90 text-gray-500 font-medium whitespace-nowrap transition-all duration-300 hover:bg-gray-200 hover:text-gray-800 group-hover:border-violet-200/80 group-hover:bg-[linear-gradient(135deg,rgba(250,245,255,0.95)_0%,rgba(243,232,255,0.78)_100%)] group-hover:text-violet-600 ${tagDarkClass}`}
                    >#{tag}</span>
                  ))
                ) : (isTitleEditing || isNoteEditing) ? (
                  <span className="text-[8.5px] text-gray-300 dark:text-gray-600 font-medium italic hover:text-gray-400 transition-colors px-2 py-0.5">Add tags...</span>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Note Edit Input | 메모 편집창 (편집 모드 시에만 나타남) */}
      {isNoteEditing && (
        <div className="relative z-10 flex-1 min-w-0 ml-4 h-[28px]">
          <input
            ref={noteInputRef}
            type="text"
            className="w-full text-[10.5px] font-medium bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 rounded-md outline-none text-gray-900 dark:text-gray-100 px-2 h-full py-0 leading-none focus:border-gray-300 dark:focus:border-gray-600"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onBlur={(e) => handleNoteEditComplete(e)}
            onKeyDown={handleNoteKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
      )}

      {/* Tooltip for full note content (위치 우측 복구 & 꼬리만 왼쪽 유지) */}
      {!isNoteEditing && noteContent && !isDropdownOpen && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 mr-2 w-max max-w-[280px] z-[60] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 bg-white/95 dark:bg-gray-800/90 backdrop-blur-md text-gray-700 dark:text-gray-200 text-[11px] font-medium p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700/50 whitespace-normal break-words leading-relaxed pointer-events-none translate-x-1 group-hover:translate-x-0 text-left">
          <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-white/95 dark:bg-gray-800/90 transform rotate-45 border-b border-l border-gray-100 dark:border-gray-700/50"></div>
          <div className="relative z-10 break-all xl:break-words">{noteContent}</div>
        </div>
      )}

      <div className="relative z-10 shrink-0 ml-4 flex items-center justify-end w-8" ref={dropdownRef}>
        {!isBulkEditMode && !(isNoteEditing || isTitleEditing) && (
          <span className={`text-[8px] text-gray-400 dark:text-gray-500 whitespace-nowrap transition-all duration-200 absolute right-0 pointer-events-none ${isDropdownOpen ? 'opacity-0' : 'group-hover:opacity-0 group-hover:-translate-x-1 group-hover:text-violet-500/80 dark:group-hover:text-violet-300/80'}`}>
            {formatRelativeTime(data.createdAt)}
          </span>
        )}
        {/* More Actions Button | 더보기/편집취소 버튼 */}
        <button 
          className={`p-1 mt-0.5 rounded-md text-gray-400 hover:text-violet-600 dark:text-gray-500 dark:hover:text-violet-200 hover:bg-violet-50/80 dark:hover:bg-violet-500/15 transition-all absolute right-[-4px] ${(isNoteEditing || isTitleEditing) ? 'opacity-100 text-violet-600 dark:text-violet-200' : (isDropdownOpen ? 'opacity-100 bg-violet-50/80 dark:bg-violet-500/15 text-violet-600 dark:text-violet-200' : 'opacity-0 group-hover:opacity-100')}`}
          onClick={(e) => {
            e.stopPropagation();
            if (isNoteEditing || isTitleEditing) {
              // Cancel editing
              setNoteContent(data.note ?? '');
              setTitleContent(data.displayTitle ?? '');
              setIsNoteEditing(false);
              setIsTitleEditing(false);
            } else {
              setIsDropdownOpen(!isDropdownOpen);
            }
          }}
          title={(isNoteEditing || isTitleEditing) ? "Cancel editing" : "More actions"}
        >
          <svg 
            className="w-3.5 h-3.5 transition-transform duration-200" 
            style={{ transform: (isNoteEditing || isTitleEditing) ? 'rotate(90deg)' : 'none' }}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {(isNoteEditing || isTitleEditing) ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </>
            )}
          </svg>
        </button>

        {/* Dropdown Menu | 드롭다운 메뉴 (수정/삭제) */}
        {isDropdownOpen && !isBulkEditMode && (
          <div className="absolute right-0 top-full mt-1 w-24 bg-white dark:bg-gray-800 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 py-1 z-20 flex flex-col">
            {/* Edit Button | 수정 버튼 */}
            <button 
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 transition-colors text-left"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                setIsTitleEditing(true);
                setIsNoteEditing(true);
              }}
            >
              <span className="material-symbols-outlined !text-[13px]" style={{ fontVariationSettings: "'wght' 300" }}>edit</span>
              Edit 
            </button>
            {/* Delete Button | 삭제 버튼 */}
            <button 
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                onDelete?.(data.bookmarkId);
              }}
            >
              <span className="material-symbols-outlined !text-[13px]" style={{ fontVariationSettings: "'wght' 300" }}>delete</span>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 메인 대시보드의 우측 패널 컴포넌트입니다.
 * 특정 폴더의 북마크 목록을 표시하고, 필터링, 정렬, 대량 편집 기능을 제공합니다.
 */
export function RightPanel() {
  // --- Central State (Zustand) | 중앙 상태 관리 ---
  const { rightPanelOpen } = useUIStore(); // 패널 오픈 여부
  const selectedFolderId = useFolderStore((s) => s.selectedFolderId); // 현재 선택된 폴더 ID
  const memberId = useAuthStore((s) => s.member?.memberId);
  const linkSearchQuery = useLinkStore((s) => s.filters.searchQuery); // 현재 검색어 상태 구독
  const setLinkSearchQuery = useLinkStore((s) => s.setSearchQuery);   // 검색어 변경 함수
  const savedTodayFilter = useFolderStore((s) => s.savedTodayFilter); // 오늘 저장 필터 상태
  const unreadFilter = useFolderStore((s) => s.unreadFilter);         // Unread 필터 상태 (view_count = 0)
  const unorganizedFilter = useFolderStore((s) => s.unorganizedFilter); // 미분류 필터 상태

  // 검색어 디바운스 처리를 위한 로컬 상태
  const [pendingSearch, setPendingSearch] = useState(linkSearchQuery);

  // 외부(스토어)에서 검색어가 변경될 경우 로컬 상태와 동기화
  useEffect(() => {
    setPendingSearch(linkSearchQuery);
  }, [linkSearchQuery]);

  // 디바운스 로직: pendingSearch가 변경되면 250ms 후에 스토어 업데이트
  useEffect(() => {
    const handler = setTimeout(() => {
      if (pendingSearch !== linkSearchQuery) {
        setLinkSearchQuery(pendingSearch);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [pendingSearch, setLinkSearchQuery, linkSearchQuery]);

  // --- API Data Fetching (React Query) | 서버 데이터 조회 ---
  const { data: myFolders, isLoading: isFoldersLoading } = useFolders(memberId); // 폴더 목록
  const { data: tagsData } = useTags(memberId); // 전체 태그 목록

  // 미분류 폴더 ID 찾기
  const unorganizedFolder = myFolders?.find(f => f.folderType === FOLDER_TYPE.UNORGANIZED);
  const unorganizedFolderId = unorganizedFolder?.memberFolderId;

  // --- Local UI State | UI 전용 로컬 상태 ---
  const [selectedTags, setSelectedTags] = useState<string[]>([]);    // 선택된 필터 태그
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false); // 태그 필터 드롭다운 오픈 여부
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'a-z'>('newest'); // 현재 정렬 옵션

  const sortOptions: SortOption[] = [
    { id: 'newest', label: 'Newest First', icon: 'schedule' },
    { id: 'oldest', label: 'Oldest First', icon: 'history' },
    { id: 'a-z', label: 'A to Z', icon: 'sort_by_alpha' }
  ];

  // UI 정렬 옵션을 백엔드 파라미터로 매핑
  const backendSort = sortOption === 'newest' ? 'Newest' as const : sortOption === 'oldest' ? 'Oldest' as const : 'Alphabetical' as const;

  // 북마크 데이터 조회 (무한 스크롤 페이징 지원)
  // 미분류 필터가 켜져 있지만 아직 미분류 폴더 ID를 모를 경우 요청 지연 방어 로직 추가
  const isReadyToFetchBookmarks = !unorganizedFilter || unorganizedFolderId != null;
  const { 
    data: infiniteData, 
    isLoading: isBookmarksLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteBookmarks({
    folderId: unorganizedFilter && unorganizedFolderId ? unorganizedFolderId : selectedFolderId,
    sort: backendSort,
    query: linkSearchQuery,
    unreadOnly: unreadFilter || undefined,
    savedTodayOnly: savedTodayFilter || undefined,
    limit: 100, // 한 페이지당 100개씩 로드
  }, {
    enabled: isReadyToFetchBookmarks
  });

  // 모든 페이지의 북마크를 하나의 배열로 펼침
  const bookmarks = infiniteData?.pages.flatMap(page => page.bookmarks) ?? [];
  const totalCount = infiniteData?.pages[0]?.totalCount ?? 0;

  // 스크롤 하단 감지를 위한 Ref 및 Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 } // 10% 정도 보일 때 미리 로드
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // API 뮤테이션 (수정/삭제/조회기록)
  const deleteBookmarkMutation = useDeleteBookmark();
  const updateBookmarkMutation = useUpdateBookmark();
  const recordViewMutation = useRecordBookmarkView();

  /** 링크 카드 클릭 시 조회 기록 (view_count += 1, last_viewed_at = now()) */
  const handleOpenLink = (bookmark: BookmarkResponse) => {
    recordViewMutation.mutate(bookmark.bookmarkId);
  };

  // 대량 편집 관련 상태
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // 헤더 더보기 메뉴
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false); // 대량 편집 모드 활성화 여부
  const [selectedLinkIds, setSelectedLinkIds] = useState<number[]>([]); // 선택된 북마크 ID 목록
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false); // 이동 모달 오픈 여부

  const AVAILABLE_TAGS = tagsData?.map((t) => t.tagName) ?? [];

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
          setIsTagDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
          setIsMoreMenuOpen(false);
      }
    }
    if (isTagDropdownOpen || isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen, isMoreMenuOpen]);

  // Client-side filtering logic (Tags only; date/unread/folder filters are handled by the API)
  const allLinks = bookmarks ?? [];
  let filteredLinks = selectedTags.length > 0
    ? allLinks.filter(link => link.tags?.some(tag => selectedTags.includes(tag)))
    : allLinks;
  const emptyLinksMessage = (() => {
    if (selectedTags.length > 0) return 'No links match selected tags';
    
    const activeFilters: string[] = [];
    if (unreadFilter) activeFilters.push('unread');
    if (unorganizedFilter) activeFilters.push('unorganized');
    if (savedTodayFilter) activeFilters.push('saved today');

    const hasQuery = linkSearchQuery.trim().length > 0;
    
    if (activeFilters.length === 0) {
      if (hasQuery) return 'No links match your search';
      return 'No links saved yet';
    }

    const filterText = activeFilters.join(' and ');
    
    if (hasQuery) {
      return `No ${filterText} links match your search`;
    }
    
    // 기본 필터 메시지 (복합 필터의 경우 기존 가독성 유지)
    if (unreadFilter && savedTodayFilter && activeFilters.length === 2) return 'No unread links saved today';
    if (unorganizedFilter && savedTodayFilter && activeFilters.length === 2) return 'No unorganized links saved today';
    
    return `No ${filterText} links found`;
  })();

  /** 태그 선택/해제 */
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  /** 대량 편집 시 링크 선택/해제 */
  const toggleLinkSelection = (id: number) => {
    setSelectedLinkIds(prev =>
      prev.includes(id) ? prev.filter(linkId => linkId !== id) : [...prev, id]
    );
  };

  /** 전체 선택/해제 */
  const handleSelectAll = () => {
    if (selectedLinkIds.length === filteredLinks.length) {
      setSelectedLinkIds([]);
    } else {
      setSelectedLinkIds(filteredLinks.map(link => link.bookmarkId));
    }
  };

  /** 대량 편집 모드 종료 */
  const exitBulkMode = () => {
    setIsBulkEditMode(false);
    setSelectedLinkIds([]);
  };

  /** 개별 북마크 삭제 핸들러 */
  const handleDeleteBookmark = (bookmarkId: number) => {
    deleteBookmarkMutation.mutate(bookmarkId);
  };

  /** 북마크 메모 수정 핸들러 */
  const handleUpdateNote = (bookmarkId: number, note: string) => {
    const bookmark = bookmarks?.find(b => b.bookmarkId === bookmarkId);
    if (!bookmark) return;

    updateBookmarkMutation.mutate({ 
      bookmarkId, 
      note,
      memberFolderId: bookmark.memberFolderId,
      displayTitle: bookmark.displayTitle,
      tags: bookmark.tags?.join(', ')
    });
  };

  /** 북마크 제목 수정 핸들러 */
  const handleUpdateTitle = (bookmarkId: number, displayTitle: string) => {
    const bookmark = bookmarks?.find(b => b.bookmarkId === bookmarkId);
    if (!bookmark) return;

    updateBookmarkMutation.mutate({ 
      bookmarkId, 
      displayTitle,
      memberFolderId: bookmark.memberFolderId,
      note: bookmark.note ?? undefined,
      tags: bookmark.tags?.join(', ')
    });
  };

  /** 북마크 폴더 이동 핸들러 */
  const handleUpdateFolder = (bookmarkId: number, memberFolderId: number) => {
    const bookmark = bookmarks?.find(b => b.bookmarkId === bookmarkId);
    if (!bookmark) return;

    updateBookmarkMutation.mutate({ 
      bookmarkId, 
      memberFolderId,
      displayTitle: bookmark.displayTitle,
      note: bookmark.note ?? undefined,
      tags: bookmark.tags?.join(', ')
    });
  };

  /** 북마크 태그 수정 핸들러 */
  const handleUpdateTags = (bookmarkId: number, tags: string) => {
    const bookmark = bookmarks?.find(b => b.bookmarkId === bookmarkId);
    if (!bookmark) return;

    updateBookmarkMutation.mutate({ 
      bookmarkId, 
      tags,
      memberFolderId: bookmark.memberFolderId,
      displayTitle: bookmark.displayTitle,
      note: bookmark.note ?? undefined
    });
  };

  /** 대량 링크 폴더 일괄 이동 핸들러 */
  const handleBulkMove = async (targetFolderId: number) => {
    // 선택된 링크가 없으면 중단
    if (selectedLinkIds.length === 0) return;
    
    try {
      // Promise.allSettled를 사용하여 각 요청의 성공/실패 여부를 개별적으로 확인
      const results = await Promise.allSettled(
        selectedLinkIds.map(async (bookmarkId) => {
          const bookmark = bookmarks?.find(b => b.bookmarkId === bookmarkId);
          if (!bookmark) return bookmarkId;
          
          await updateBookmarkMutation.mutateAsync({
            bookmarkId,
            memberFolderId: targetFolderId,
            displayTitle: bookmark.displayTitle,
            note: bookmark.note ?? undefined,
            tags: bookmark.tags?.join(', ')
          });
          return bookmarkId;
        })
      );

      // 성공한 ID 목록 추출
      const succeededIds = results
        .filter((res): res is PromiseFulfilledResult<number> => res.status === 'fulfilled')
        .map(res => res.value);

      // 성공한 항목은 선택 목록에서 제거 (즉시 반영)
      if (succeededIds.length > 0) {
        setSelectedLinkIds(prev => prev.filter(id => !succeededIds.includes(id)));
      }

      // 모든 요청이 성공했는지 확인
      const allSucceeded = results.every(res => res.status === 'fulfilled');
      
      if (allSucceeded) {
        // 전원 성공 시 모달 닫고 모드 종료
        setIsMoveModalOpen(false);
        exitBulkMode();
      } else {
        // 일부 실패 시 콘솔에 알림 (모달은 열려 있고 실패 항목만 선택된 상태로 남음)
        const failedCount = selectedLinkIds.length - succeededIds.length;
        console.error(`Bulk move partially failed: ${failedCount} items failed.`);
      }
    } catch (error) {
      // Promise.allSettled 자체에서 에러가 발생하는 경우(드문 상황)에 대한 대비
      console.error('Unexpected error during bulk move:', error);
    }
  };

  // Determine the display title based on selected folder and active filters | 선택된 폴더 및 활성 필터에 따른 제목 결정
  const folderName = myFolders?.find(f => f.memberFolderId === selectedFolderId)?.folderName;
  
  const activeFilters: string[] = [];
  if (unreadFilter) activeFilters.push('Unread');
  if (savedTodayFilter) activeFilters.push('Saved today');
  if (unorganizedFilter) activeFilters.push('Unorganized');

  let displayTitle = folderName || 'All Links';
  
  if (activeFilters.length > 0) {
    const filtersLabel = activeFilters.join(' + ');
    if (folderName) {
      displayTitle = `${folderName} + ${filtersLabel}`;
    } else {
      displayTitle = filtersLabel;
    }
  }

  if (!rightPanelOpen) return null;

  return (
    <aside className="w-[700px] shrink-0 bg-white dark:bg-[#0a0a0b] border-l border-gray-200 dark:border-white/[0.08] hidden xl:flex flex-col h-full shadow-2xl z-10 transition-all duration-300 relative">
      
      {/* Top Header & Tags | 상단 헤더 및 태그 필터 영역 */}
      <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.05] flex flex-col gap-2 bg-white dark:bg-[#0a0a0b] sticky top-0 z-[15]">
        
        {/* Row 1: Title & Actions */}
        <div className="flex justify-between items-start">
          {/* Left: Title and Count | 좌측: 폴더명 및 링크 개수 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900/20 text-slate-400 rounded-md flex items-center justify-center w-8 h-8">
                <span className="material-symbols-outlined text-[16px] block">folder_open</span>
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{displayTitle}</h2>
            </div>
            <p className="text-[10px] text-gray-500">{totalCount} Links</p>
          </div>

          {/* Right: Action Buttons & Search | 우측 액션 버튼 및 검색창 */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Tags Dropdown Filter | 태그 필터 드롭다운 */}
            <div className="relative" ref={tagDropdownRef}>
              <button 
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className={`group flex items-center gap-1 px-2 py-1 border rounded-md text-[10px] font-medium transition-all duration-200 ${selectedTags.length > 0 ? 'bg-[linear-gradient(135deg,rgba(139,92,246,0.18)_0%,rgba(167,139,250,0.12)_100%)] border-violet-400/60 text-violet-700 dark:bg-[linear-gradient(135deg,rgba(109,40,217,0.4)_0%,rgba(139,92,246,0.28)_100%)] dark:border-violet-500/70 dark:text-violet-200 shadow-[0_2px_8px_-2px_rgba(124,58,237,0.35)] dark:shadow-[0_2px_10px_-2px_rgba(139,92,246,0.5)] ring-1 ring-violet-300/50 dark:ring-violet-500/40' : 'bg-white/50 dark:bg-slate-900/50 border-gray-200/60 dark:border-white/8 text-gray-600 dark:text-white hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-200/50 dark:hover:border-purple-500/30'}`}
              >
                <span className={`material-symbols-outlined !text-[12px] leading-none transition-colors ${selectedTags.length > 0 ? 'text-violet-600 dark:text-violet-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400'}`}>sell</span>
                <span>Tags {selectedTags.length > 0 && <span className="ml-0.5 bg-violet-500/20 dark:bg-violet-400/25 text-violet-700 dark:text-violet-200 px-1 py-0.5 rounded-sm text-[8px] font-bold">{selectedTags.length}</span>}</span>
                <span className={`material-symbols-outlined !text-[12px] transition-transform duration-200 ${selectedTags.length > 0 ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'} ${isTagDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {isTagDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-36 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100/50 dark:border-white/8 py-1.5 z-30 flex flex-col max-h-[300px] overflow-y-auto origin-top-left animate-in fade-in slide-in-from-top-1 duration-200">
                  {AVAILABLE_TAGS.length > 0 ? (
                    AVAILABLE_TAGS.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          className="group/item flex items-center gap-2.5 px-3 py-1.5 mx-1 rounded-lg text-[10px] font-medium hover:bg-purple-100/60 dark:hover:bg-purple-900/30 transition-all text-left relative"
                          onClick={() => toggleTag(tag)}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                            {isSelected && <span className="material-symbols-outlined !text-[10px] font-bold">check</span>}
                          </div>
                          <span className={`transition-colors duration-200 truncate ${isSelected ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-white group-hover/item:text-gray-900 dark:group-hover/item:text-white'}`}>
                            {tag}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 py-1.5 mx-1 cursor-default">
                      <span className="material-symbols-outlined !text-[14px] text-purple-500 dark:text-purple-400">sell</span>
                      <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">No tags found</span>
                    </div>
                  )}
                  {selectedTags.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-gray-100/50 dark:border-gray-700/50">
                      <button 
                        className="w-[calc(100%-8px)] flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-900/30 py-1.5 mx-1 rounded-lg font-medium transition-all"
                        onClick={() => setSelectedTags([])}
                      >
                        <span className="material-symbols-outlined !text-[12px]">playlist_remove</span>
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <SortDropdown 
              value={sortOption}
              onChange={(val) => setSortOption(val as 'newest' | 'oldest' | 'a-z')}
              options={sortOptions}
            />

            {/* Search Bar | 검색창 */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md w-[110px]">
              <span className="material-symbols-outlined !text-[12px] text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search link"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-[9px] text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full p-0 h-4"
              />
            </div>

            {/* More Actions Dropdown | 추가 작업 드롭다운 (대량 편집 등) */}
            <div className="relative" ref={moreMenuRef}>
              <button 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`flex items-center justify-center p-0.5 rounded-md transition-colors ml-0.5 ${isMoreMenuOpen ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <span className="material-symbols-outlined !text-[14px]">more_horiz</span>
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100/50 dark:border-gray-700/50 py-1.5 z-30 flex flex-col origin-top-right animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    className="flex items-center gap-2 px-3.5 py-2 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left w-full"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      setIsBulkEditMode(true);
                      setSelectedLinkIds([]);
                    }}
                  >
                    <span className="material-symbols-outlined !text-[12px]">checklist</span>
                    Bulk Edit
                  </button>
                  <button
                    className="flex items-center gap-2 px-3.5 py-2 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left w-full"
                    onClick={() => setIsMoreMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined !text-[12px]">grid_view</span>
                    Change View
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Selected Tags & Sort Icon (Always keeps space) | 2행: 선택된 태그 목록 및 정렬 아이콘 */}
        <div className="flex justify-between items-center min-h-[28px]">
          <div className="w-full flex flex-wrap gap-1.5 items-center">
            {selectedTags.length > 0 ? (
              <>
                {selectedTags.map((tag, idx) => (
                  <span key={idx} className="group inline-flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-md text-[9px] font-medium bg-[linear-gradient(135deg,rgba(109,40,217,0.85)_0%,rgba(139,92,246,0.75)_50%,rgba(167,139,250,0.68)_100%)] text-white shadow-sm shadow-purple-500/25 dark:bg-[linear-gradient(135deg,rgba(109,40,217,0.55)_0%,rgba(139,92,246,0.45)_50%,rgba(167,139,250,0.35)_100%)] dark:text-white dark:shadow-sm dark:shadow-purple-600/15 whitespace-nowrap transition-colors animate-in fade-in zoom-in duration-500">
                    {tag}
                    <button 
                      onClick={() => toggleTag(tag)}
                      className="group/tag-close flex items-center justify-center rounded-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors opacity-70 hover:opacity-100"
                    >
                      <svg 
                        className="w-2.5 h-2.5 transition-transform duration-200 group-hover/tag-close:scale-110" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button 
                  onClick={() => setSelectedTags([])}
                  className="text-[9px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 ml-1"
                >
                  Clear all
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1 px-1.5 text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined !text-[12px] opacity-70 mt-0.5">sell</span>
                <span className="text-[10px] whitespace-nowrap leading-none font-medium">Showing all links</span>
              </div>
            )}
          </div>
          <button className="flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors ml-2 shrink-0">
            <span className="material-symbols-outlined !text-[12px] !leading-none">swap_vert</span>
          </button>
        </div>
      </div>


      {/* Link List Section | 링크 목록 섹션 */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {isBookmarksLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
            <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            <p className="text-xs font-medium">Loading links...</p>
          </div>
        ) : filteredLinks.length > 0 ? (
          filteredLinks.map(link => (
            <LinkItem
              key={link.bookmarkId}
              data={link}
              isBulkEditMode={isBulkEditMode}
              isSelected={selectedLinkIds.includes(link.bookmarkId)}
              folders={myFolders}
              onToggleSelect={toggleLinkSelection}
              onDelete={handleDeleteBookmark}
              onUpdateNote={handleUpdateNote}
              onUpdateTitle={handleUpdateTitle}
              onUpdateFolder={handleUpdateFolder}
              onUpdateTags={handleUpdateTags}
              onOpenLink={handleOpenLink}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span className="material-symbols-outlined text-3xl opacity-50">search_off</span>
            <p className="text-xs font-medium">{emptyLinksMessage}</p>
          </div>
        )}

        {/* Infinite Scroll Trigger & Loader | 무한 스크롤 트리거 및 로딩 표시 */}
        <div ref={observerTarget} className="h-10 flex items-center justify-center w-full">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              <span className="text-[10px] font-medium">Loading more...</span>
            </div>
          )}
        </div>
      </div>


      {/* Floating Bulk Action Bar | 하단 대량 편집 액션바 */}
      {isBulkEditMode && (
        <div className="absolute bottom-6 left-1/2 w-max -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40 ring-1 ring-gray-200 dark:ring-gray-700 px-3.5 py-2 flex items-center gap-3 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSelectAll}
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${selectedLinkIds.length === filteredLinks.length && filteredLinks.length > 0 ? 'bg-slate-600 border-slate-600 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
            >
              {selectedLinkIds.length === filteredLinks.length && filteredLinks.length > 0 && <span className="material-symbols-outlined !text-[12px] font-bold">check</span>}
            </button>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {selectedLinkIds.length} <span className="opacity-70 font-medium">selected</span>
            </span>
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 max-sm:hidden" />

          <div className="flex items-center gap-1">
            <button 
              disabled={selectedLinkIds.length === 0}
              onClick={() => setIsMoveModalOpen(true)}
              className="px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-[10px] font-medium"
            >
              <span className="material-symbols-outlined !text-[14px]">drive_file_move</span>
              Move
            </button>
            <button
              disabled={selectedLinkIds.length === 0}
              onClick={() => {
                selectedLinkIds.forEach((id) => deleteBookmarkMutation.mutate(id));
                exitBulkMode();
              }}
              className="px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-[10px] font-medium"
            >
              <span className="material-symbols-outlined !text-[14px]">delete</span>
              Delete
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button 
              onClick={exitBulkMode}
              className="group/bulk-close flex items-center justify-center h-[20px] w-[20px] aspect-square bg-gray-200/70 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:hover:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shrink-0"
            >
              <svg 
                className="w-2.5 h-2.5 transition-transform duration-200 group-hover/bulk-close:rotate-90" 
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
          </div>
        </div>
      )}

      {/* Move Modal | 폴더 이동 모달 */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-[420px] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01),0_0_1px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Header styled like SaveLinkDialog */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-3 z-10 border-b border-gray-100 dark:border-gray-800/50">
              <div className="text-lg font-extrabold text-[#1e293b] dark:text-gray-100 tracking-tight flex items-center gap-2.5">
                <div className="bg-[linear-gradient(135deg,#475569_0%,#64748b_100%)] p-1.5 rounded-lg shadow-lg shadow-slate-200/50 dark:shadow-slate-900/30 flex items-center justify-center ring-1 ring-white/20">
                  <span className="material-symbols-outlined text-white !text-[18px] fill-1 drop-shadow-sm">drive_file_move</span>
                </div>
                <span>Move Links</span>
                <span className="text-[11px] font-medium text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-1.5 py-0.5 rounded-md ml-1">{selectedLinkIds.length} items</span>
              </div>
              <button 
                onClick={() => setIsMoveModalOpen(false)}
                className="group/modal-close w-[22px] h-[22px] aspect-square flex items-center justify-center rounded-full bg-slate-200/70 dark:bg-gray-700/50 text-slate-500 hover:text-slate-800 hover:bg-slate-300 dark:hover:bg-gray-600 transition-all duration-200 shrink-0"
              >
                <svg 
                  className="w-3 h-3 transition-transform duration-200 group-hover/modal-close:rotate-90" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-2 overflow-y-auto flex-1 space-y-4 min-h-[200px] max-h-[400px] custom-scrollbar bg-[#fafafa] dark:bg-gray-800/50">
              
              {/* All Folders Section | 모든 폴더 목록 섹션 */}
              <div className="pt-1 pb-2">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[14px] text-slate-400">folder</span>
                  All Folders
                </div>
                
                {isFoldersLoading ? (
                  <div className="px-3 py-6 flex items-center justify-center gap-2 text-slate-400 text-xs">
                    <span className="material-symbols-outlined animate-spin !text-[18px]">progress_activity</span>
                    Loading folders...
                  </div>
                ) : myFolders && myFolders.length > 0 ? (
                  <div className="space-y-0.5 px-1.5">
                    {myFolders.map(folder => (
                      <button
                        key={folder.memberFolderId}
                        onClick={() => handleBulkMove(folder.memberFolderId)} // 폴더 클릭 시 일괄 이동 실행
                        disabled={updateBookmarkMutation.isPending} // API 호출 중 중복 클릭 방지
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all text-left group bg-white/50 disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 shrink-0 bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-500 transition-colors">
                          <span className="material-symbols-outlined !text-[18px]">folder_open</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-slate-600 dark:text-gray-200 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors truncate">
                            {folder.folderName}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-transparent group-hover:text-slate-500 transition-colors !text-[18px] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 duration-200 mr-1">check_circle</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 flex flex-col items-center justify-center gap-1 text-slate-400 text-xs">
                    <span className="material-symbols-outlined !text-[24px] opacity-50">folder_off</span>
                    <span>No folders found</span>
                  </div>
                )}
              </div>

            </div>
            
            {/* Modal Footer | 모달 하단 영역 */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
