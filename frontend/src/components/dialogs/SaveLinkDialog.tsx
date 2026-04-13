'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '@/lib/store/uiStore';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFolders, useCreateFolder } from '@/lib/api/folderApi';
import { useTags, useCreateTag } from '@/lib/api/tagApi';
import { useCreateBookmark, useAnalyzeUrl } from '@/lib/api/bookmarkApi';
import { useAnalyzeLink } from '@/lib/api/linkAnalysisApi';
import { useAuthStore } from '@/lib/store/authStore';
import type { LinkAnalysisResponse } from '@/lib/types/linkAnalysis';

// 디자인 시안에서 추출한 커스텀 테마 매핑
const theme = {
  premiumGradient: "bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)]",
  elevatedShadow: "shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4),0_8px_10px_-6px_rgba(124,58,237,0.2)]",
  softModalShadow: "shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01),0_0_1px_rgba(0,0,0,0.05)]",
  accentPurple: "text-[#7c3aed] dark:text-purple-400",
  charcoal: "text-[#1e293b] dark:text-white",
};

// 재사용될 반복 스타일 클래스 모음
const styles = {
  minimalInput: "bg-white dark:bg-slate-900/60 border border-[#e2e8f0] dark:border-white/10 rounded-xl px-3 py-2 w-full text-xs text-[#1e293b] dark:text-gray-100 transition-all duration-200 placeholder-slate-400 font-normal focus:border-violet-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-violet-500 dark:focus:ring-purple-500 outline-none shadow-sm",
  tagChip: "text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer select-none border border-transparent font-medium flex items-center justify-center min-h-[26px] bg-white dark:bg-slate-800 shadow-sm",
  tagChipSelected: "bg-violet-50 dark:bg-purple-900/40 text-violet-700 dark:text-purple-300 border-violet-200 dark:border-purple-700 shadow-sm font-semibold",
  tagChipExisting: "text-[#1e293b] dark:text-gray-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-white/20",
  tagAddTrigger: "text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-white/15 text-slate-500 dark:text-gray-400 hover:border-violet-500 dark:hover:border-purple-400 hover:text-violet-600 dark:hover:text-purple-400 transition-all cursor-pointer flex items-center gap-1 min-h-[26px] w-fit relative z-30 shadow-sm",
  folderTile: "relative flex flex-col items-center justify-center p-3 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-slate-800/60 backdrop-blur-sm cursor-pointer transition-all hover:border-violet-300 dark:hover:border-purple-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-700 text-center gap-1.5 shadow-sm",
  folderTileActive: "border-violet-500 dark:border-purple-500 ring-1 ring-violet-500 dark:ring-purple-500 bg-white dark:bg-slate-800 text-violet-900 dark:text-purple-300 shadow-[0_0_15px_rgba(124,58,237,0.15)]",
  matchBadge: `absolute -top-2 -right-1.5 ${theme.premiumGradient} text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full shadow-md z-10`,
  btnGradient: "bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_100%)] hover:opacity-95 text-white shadow-md shadow-violet-500/20 dark:shadow-purple-900/30",
  sectionContainer: "bg-gray-50/80 dark:bg-slate-800/50 dark:backdrop-blur-md rounded-2xl p-3 border border-gray-100/50 dark:border-white/[0.05]"
};

/**
 * 링크(북마크) 저장 다이얼로그 컴포넌트
 */
export function SaveLinkDialog() {
  // 전역 UI 상태 (다이얼로그 열림/닫힘)
  const { saveLinkDialogOpen, toggleSaveLinkDialog } = useUIStore();

  // --- UI 전용 상태 (태그 팝오버, 입력값 등) ---
  const [tagInput, setTagInput] = useState('');                    // 태그 검색어
  const [openTagPopover, setOpenTagPopover] = useState(false);     // 태그 선택창 열림 여부
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false); // 새 태그 생성 모드 여부
  const [newTagInputValue, setNewTagInputValue] = useState('');    // 새 태그 입력값
  const [openFolderBrowser, setOpenFolderBrowser] = useState(false); // 폴더 브라우저 드롭다운 열림 여부

  // --- 폼 기반 입력 상태 (실제 서버로 전송될 데이터) ---
  const [url, setUrl] = useState('');                                            // 저장할 링크 URL
  const [displayTitle, setDisplayTitle] = useState('');                          // 표시될 제목
  const [note, setNote] = useState('');                                          // 사용자의 메모
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null); // 선택된 폴더 ID
  const [selectedTags, setSelectedTags] = useState<string[]>([]);                // 선택된 태그 목록 (이름 리스트)
  const [pinnedFolderId, setPinnedFolderId] = useState<number | null>(null);     // 외부에서 끌어온 폴더 (타일 1번 자리에 고정)
  const [pendingNewFolderName, setPendingNewFolderName] = useState<string | null>(null); // AI 추천 새 폴더 (저장 시 생성)

  // --- API 연동 (React Query Hooks) ---
  const memberId = useAuthStore((s) => s.member?.memberId);
  const { data: folders } = useFolders(memberId);          // 기존 폴더 목록 조회
  const { data: tagsData } = useTags(memberId);            // 기존 태그 목록 조회
  const createBookmarkMutation = useCreateBookmark();      // 북마크 생성 API 연동
  const createFolderMutation = useCreateFolder();          // 폴더 생성 API 연동
  const createTagMutation = useCreateTag();                // 태그 생성 API 연동
  const analyzeUrlMutation = useAnalyzeUrl();              // URL 분석(제목 추출) API 연동
  const analyzeLinkMutation = useAnalyzeLink();            // AI 링크 분석 API 연동
  const [aiSuggestedTags, setAiSuggestedTags] = useState<Set<string>>(new Set()); // AI가 새로 추천한 태그 추적

  // --- URL 입력 시 제목 자동 생성 및 실시간 분석 로직 ---
  useEffect(() => {
    if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
      setDisplayTitle('');
      return;
    }

    // 레이스 컨디션 방지를 위한 플래그
    let isIgnore = false;

    // 1단계: 즉시 도메인으로 임시 제목 설정
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    setDisplayTitle(domain);

    // 2단계: 500ms debounce 후 실제 페이지 제목 요청 (타이핑 시 불필요한 중복 요청 방지)
    const timerId = setTimeout(() => {
      analyzeUrlMutation.mutate(url, {
        onSuccess: (realTitle: string) => {
          if (!isIgnore && realTitle) {
            setDisplayTitle(realTitle);
          }
        }
      });
    }, 500);

    return () => {
      isIgnore = true;
      clearTimeout(timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    setFaviconLoadFailed(false);
  }, [url]);

  
  // --- UI 전용 상태 추가 (클립보드 추천) ---
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [faviconLoadFailed, setFaviconLoadFailed] = useState(false);

  // --- 팝업이 열고 닫힐 때마다 모든 입력 상태 초기화 및 클립보드 감지 ---
  useEffect(() => {
    if (saveLinkDialogOpen) {
      // 팝업이 열릴 때: 클립보드에 URL이 있는지 한 번만 확인
      const timerId = setTimeout(async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) return;
        try {
          // 브라우저 정책상 사용자 권한 프롬프트가 발생할 수 있습니다.
          const text = await navigator.clipboard.readText();
          if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
            setClipboardUrl(text);
          }
        } catch (err) {
          // 권한 거부 등의 에러는 무시
          console.warn('Clipboard read error (auto-paste):', err);
        }
      }, 150);
      return () => clearTimeout(timerId);
    } else {
      // 팝업이 닫힐 때: 모든 입력 상태 초기화
      setOpenFolderBrowser(false);
      setUrl('');
      setDisplayTitle('');
      setNote('');
      setSelectedFolderId(null);
      setSelectedTags([]);
      setTagInput('');
      setNewTagInputValue('');
      setIsCreatingNewTag(false);
      setAiSuggestedTags(new Set());
      setPendingNewFolderName(null);
      setClipboardUrl(null);
    }
  }, [saveLinkDialogOpen]); // 내부 상태(url 등) 의존성 제어

  // (커스텀 위치 계산 및 외부 클릭 로직 제거됨 - Popover로 대체)

  // 단순 표시용 태그 이름 리스트 추출
  const existingTagsList = tagsData?.map((t) => t.tagName) ?? [];

  /**
   * [핸들러] 태그 선택/해제 토글
   */
  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  /**
   * [핸들러] AI 분석 요청
   */
  const handleAiAnalysis = () => {
    if (!url.trim() || !(url.startsWith('http://') || url.startsWith('https://'))) return;

    analyzeLinkMutation.mutate(url.trim(), {
      onSuccess: (result: LinkAnalysisResponse) => {
        // 제목 → displayTitle 필드에 무조건 매핑 (AI 분석 시 최신 제목으로 덮어씀)
        if (result.title) {
          setDisplayTitle(result.title);
        }

        // 설명 → note 필드에 무조건 매핑 (AI 분석 시 최신 요약으로 덮어씀)
        if (result.description) {
          setNote(result.description);
        }

        // 태그: 이전 AI 추천 태그를 제거하고 새 추천 적용 (재분석 시 이전 상태 초기화)
        const prevAiTags = aiSuggestedTags;
        const baseTags = selectedTags.filter(tag => !prevAiTags.has(tag)); // 수동 선택 태그만 남김
        const newTagNames = new Set<string>();

        if (result.suggestedTags?.length) {
          const tagsToSelect = [...baseTags];
          for (const tag of result.suggestedTags) {
            if (!tagsToSelect.includes(tag.tagName)) {
              tagsToSelect.push(tag.tagName);
            }
            if (!tag.isExisting) {
              newTagNames.add(tag.tagName);
            }
          }
          setSelectedTags(tagsToSelect);
        } else {
          setSelectedTags(baseTags);
        }
        setAiSuggestedTags(newTagNames);

        // 폴더: 이전 AI 추천 상태 초기화 후 새 추천 적용
        setPinnedFolderId(null);
        setPendingNewFolderName(null);

        if (result.suggestedFolder) {
          if (result.suggestedFolder.isExisting && result.suggestedFolder.memberFolderId) {
            // 1. 기존 폴더 → 바로 선택
            const aiId = result.suggestedFolder.memberFolderId;
            setSelectedFolderId(aiId);
            const top3 = (folders ?? []).slice(0, 3).map(f => f.memberFolderId);
            if (!top3.includes(aiId)) setPinnedFolderId(aiId);
          } else if (!result.suggestedFolder.isExisting && result.suggestedFolder.folderName) {
            // 2. AI가 새 폴더라고 했지만, 기존 폴더에 같은 이름이 있는지 확인
            const existingMatch = (folders ?? []).find(
              f => f.folderName.trim().toLowerCase() === result.suggestedFolder!.folderName.trim().toLowerCase()
            );
            if (existingMatch) {
              // 3. 같은 이름의 기존 폴더가 있으면 그 폴더를 선택
              setSelectedFolderId(existingMatch.memberFolderId);
              const top3 = (folders ?? []).slice(0, 3).map(f => f.memberFolderId);
              if (!top3.includes(existingMatch.memberFolderId)) setPinnedFolderId(existingMatch.memberFolderId);
            } else {
              // 진짜 새 폴더 → 저장 시점까지 생성 보류, UI에만 표시
              setPendingNewFolderName(result.suggestedFolder.folderName);
              setSelectedFolderId(null);
            }
          }
        } else {
          // AI 폴더 추천 없음 → 선택 상태 초기화
          setSelectedFolderId(null);
        }
      },
    });
  };

  /**
   * [핸들러] 북마크 생성 공통 로직
   */
  const saveBookmark = (folderId: number | null) => {
    createBookmarkMutation.mutate(
      {
        url: url.trim(),
        displayTitle: displayTitle.trim() || url.trim(),
        memberFolderId: folderId,
        note: note.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
      },
      {
        onSuccess: () => {
          toggleSaveLinkDialog(false);
        },
      }
    );
  };

  /**
   * [핸들러] 최종 저장 버튼 클릭 시 실행
   * AI 추천 새 폴더가 있으면 폴더 생성 → 북마크 저장 순서로 처리
   */
  const handleSave = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !(trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) return;
    if (!memberId) return; // 방어 코드: 실제 memberId가 없는 경우 실행 방지

    if (pendingNewFolderName) {
      // 새 폴더 생성 후 해당 폴더에 북마크 저장
      createFolderMutation.mutate(
        {
          ownerMemberId: memberId!,
          folderName: pendingNewFolderName,
        },
        {
          onSuccess: (newFolderId: number) => {
            saveBookmark(newFolderId);
          },
        }
      );
    } else {
      saveBookmark(selectedFolderId);
    }
  };

  
  /**
   * [핸들러] 클립보드에서 링크 붙여넣기
   */
  /**
   * [핸들러] 새로운 태그를 직접 생성할 때 호출
   */
  const handleCreateNewTag = (tagName: string) => {
    if (!tagName.trim() || !memberId) return;

    createTagMutation.mutate(
      { ownerMemberId: memberId!, tagName: tagName.trim() },
      {
        onSuccess: () => {
          // 태그가 서버에 생성되면, 현재 선택된 태그 목록에도 추가
          setSelectedTags((prev) => [...prev, tagName.trim()]);
        },
      }
    );
  };

  // 상단에 표시할 폴더 목록 (최대 3개)
  // pinnedFolderId가 있으면 그 폴더를 1번 자리에 고정하고 나머지를 채움
  const PENDING_FOLDER_SENTINEL_ID = -1; // AI 추천 새 폴더의 가상 ID
  const displayFolders = (() => {
    const realFolders = folders ?? [];
    const naturalTop3 = realFolders.slice(0, 3);

    // AI 추천 새 폴더가 있으면 1번 자리에 가상 타일 표시
    if (pendingNewFolderName) {
      const pendingVirtual = {
        memberFolderId: PENDING_FOLDER_SENTINEL_ID,
        ownerMemberId: memberId || -1,
        parentFolderId: null,
        folderName: pendingNewFolderName,
        description: null,
      };
      return [pendingVirtual, ...naturalTop3.slice(0, 2)];
    }

    if (pinnedFolderId) {
      const pinned = realFolders.find(f => f.memberFolderId === pinnedFolderId);
      if (pinned) {
        const rest = naturalTop3.filter(f => f.memberFolderId !== pinnedFolderId).slice(0, 2);
        return [pinned, ...rest];
      }
    }

    return naturalTop3;
  })();


  return (
    <Dialog open={saveLinkDialogOpen} onOpenChange={toggleSaveLinkDialog}>
      {/* 
        기존 shadcn 다이얼로그의 배경/패딩, 자체 닫기버튼(&>button:hidden) 무력화 
        투명 배경 위에서 우리의 커스텀 UI 박스(z-10 bg-white rounded-2xl...)가 완전히 덮도록 구성
      */}
      <DialogContent className="sm:max-w-[540px] sm:left-[calc(50%+90px)] p-0 bg-transparent border-0 shadow-none [&>button]:hidden overflow-visible">
        
        <div className={`relative z-[60] w-full max-w-[540px] bg-white dark:bg-[#0a0a0b] rounded-2xl ${theme.softModalShadow} border border-slate-100 dark:border-white/[0.08] overflow-visible mx-auto`}>
          
          {/* Header & Close */}
          <div className="relative flex items-center justify-between px-5 pt-5 pb-2 z-10">
            <DialogTitle className={`text-lg font-extrabold ${theme.charcoal} tracking-tight flex items-center gap-2.5`}>
              <div className={`${theme.premiumGradient} p-1.5 rounded-lg flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white !text-[18px] fill-1">bookmark</span>
              </div>
              Save to Workspace
            </DialogTitle>
            <DialogDescription className="sr-only">Save a new link to your workspace with AI assistance</DialogDescription>
            <button 
              onClick={() => toggleSaveLinkDialog(false)} 
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined !text-[18px]">close</span>
            </button>
          </div>

          <div className="relative px-5 pb-5 space-y-3 mt-3 z-10">
            
            {/* URL Input */}
            <div className={`${styles.sectionContainer} space-y-1.5`}>
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>link</span>
                <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">URL</label>
              </div>
              <div className="relative group flex items-center gap-2">
                <div className="flex-none w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden">
                  {url && !faviconLoadFailed ? (
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${url.replace(/^https?:\/\//, '').split('/')[0]}&sz=64`}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      className="w-5 h-5 object-contain"
                      onError={() => setFaviconLoadFailed(true)}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 !text-[18px]">link</span>
                  )}
                </div>
                <div className="relative flex-1">
                  {/* 클립보드 자동 인식 - 초미니멀 액션 칩 UI */}
                  {clipboardUrl && !url && (
                    <button
                      type="button"
                      onClick={() => { setUrl(clipboardUrl); setClipboardUrl(null); }}
                      className="absolute -top-8 right-0 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 z-20 group outline-none"
                    >
                      <div className="bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-xl border border-violet-100 dark:border-white/[0.08] rounded-full shadow-[0_12px_24px_-8px_rgba(124,58,237,0.3)] flex items-center gap-2.5 px-3.5 py-2 whitespace-nowrap transition-all hover:bg-violet-50 dark:hover:bg-purple-900/20 active:scale-95">
                        <div className={`${styles.btnGradient} w-5 h-5 rounded-full flex items-center justify-center flex-none overflow-hidden shadow-sm shadow-violet-500/20`}>
                          <span className="inline-flex h-full w-full items-center justify-center rotate-[-45deg] translate-x-[0.25px]">
                            <span className="material-symbols-outlined !text-[13px] !leading-none block text-white font-bold">link</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-gray-100 tracking-tight pr-1">복사한 링크 붙여넣기</span>
                      </div>
                      {/* 부드럽고 존재감 있는 곡선형 SVG 꼬리표 - 크기 확대 및 실루엣 최적화 */}
                      <svg 
                        className="absolute -bottom-[6px] right-4 w-[18px] h-[7px]" 
                        viewBox="0 0 18 7" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M0 0C4.5 0 7 1.5 9 7C11 1.5 13.5 0 18 0Z" 
                          className="fill-white/95 dark:fill-[#0a0a0b]/95 group-hover:fill-violet-50 dark:group-hover:fill-purple-900/20 transition-colors"
                        />
                        <path 
                          d="M0 0C4.5 0 7 1.5 9 7C11 1.5 13.5 0 18 0" 
                          className="stroke-violet-100 dark:stroke-white/[0.08] transition-colors" 
                          strokeWidth="1"
                        />
                      </svg>
                    </button>
                  )}
                  <input
                    className={`${styles.minimalInput} w-full`}
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              {url.trim() && !(url.startsWith('http://') || url.startsWith('https://')) && (
                <p className="text-[10px] text-red-500 dark:text-red-400 font-medium flex items-center gap-1 mt-1 ml-10">
                  <span className="material-symbols-outlined !text-[12px]">error</span>
                  URL은 http:// 또는 https://로 시작해야 합니다.
                </p>
              )}
            </div>

            {/* Title Input (새로 추가) */}
            <div className={`${styles.sectionContainer} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>title</span>
                  <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">TITLE</label>
                </div>
                {analyzeUrlMutation.isPending && (
                  <span className="text-[9px] text-violet-500 animate-pulse flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined !text-[10px] animate-spin">progress_activity</span>
                    Fetching title...
                  </span>
                )}
              </div>
              <input
                className={styles.minimalInput}
                type="text"
                placeholder="Link Title"
                value={displayTitle}
                onChange={(e) => {
                  setDisplayTitle(e.target.value);
                }}
              />
            </div>

            {/* AI Analysis Button */}
            <div className="flex justify-center w-full">
              <button
                onClick={handleAiAnalysis}
                disabled={!url.trim() || !(url.startsWith('http://') || url.startsWith('https://')) || analyzeLinkMutation.isPending}
                className={`w-full py-2.5 px-5 rounded-lg ${theme.premiumGradient} text-white font-bold text-xs ${theme.elevatedShadow} hover:shadow-lg hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2 group border-t border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {analyzeLinkMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined !text-[16px] animate-spin">progress_activity</span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-[16px] group-hover:scale-110 transition-transform fill-1">auto_awesome</span>
                    Request AI Analysis
                  </>
                )}
              </button>
            </div>

            {/* Folder Selection */}
            <div className={`${styles.sectionContainer} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>folder</span>
                  <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">Folder</label>
                </div>
                {analyzeLinkMutation.isSuccess && analyzeLinkMutation.data?.suggestedFolder && (
                  <span className="text-[8px] text-violet-600 dark:text-purple-400 flex items-center gap-1 font-bold bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full border border-violet-100 dark:border-purple-900/50 shadow-sm animate-in fade-in zoom-in duration-300">
                    <span className="material-symbols-outlined !text-[10px]">smart_toy</span>
                    AI Recommended
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {displayFolders.map((folder) => {
                  const isPending = folder.memberFolderId === PENDING_FOLDER_SENTINEL_ID;
                  const isActive = isPending
                    ? !!pendingNewFolderName // pending 폴더는 존재 자체가 선택 상태
                    : selectedFolderId === folder.memberFolderId;
                  return (
                      <button
                        type="button"
                        key={folder.memberFolderId}
                        onClick={() => {
                          if (isPending) {
                            // pending 폴더 클릭 → 해제하면 AI 추천 취소
                            setPendingNewFolderName(null);
                          } else {
                            // 기존 폴더 클릭 → pending 해제, 기존 폴더 선택
                            setPendingNewFolderName(null);
                            setSelectedFolderId(isActive ? null : folder.memberFolderId);
                          }
                        }}
                        className={`${styles.folderTile} ${isActive ? styles.folderTileActive : ''} group`}
                      >
                      {/* AI 추천 새 폴더 뱃지 */}
                      {isPending && (
                        <span className={styles.matchBadge}>NEW</span>
                      )}
                      <span className={`material-symbols-outlined !text-[20px] mb-0.5 transition-colors ${isActive ? 'text-violet-500 dark:text-purple-400 drop-shadow-sm' : 'text-gray-400 dark:text-gray-500 group-hover:text-violet-400 dark:group-hover:text-purple-400'}`}>{isPending ? 'create_new_folder' : 'folder'}</span>
                      <span className={`text-[10px] leading-tight truncate w-full ${isActive ? 'font-bold text-violet-900 dark:text-purple-300' : 'text-slate-500 dark:text-gray-400 group-hover:text-slate-800 dark:group-hover:text-gray-200 font-medium'}`}>{folder.folderName}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Popover open={openFolderBrowser} onOpenChange={setOpenFolderBrowser} modal={true}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`w-full flex items-center justify-between bg-white dark:bg-gray-800 border rounded-lg px-2.5 py-2 text-xs text-[#1e293b] dark:text-gray-200 cursor-pointer transition-all shadow-sm ${
                          openFolderBrowser ? 'border-violet-400 ring-1 ring-violet-200 dark:ring-purple-900/30' : 'border-[#e2e8f0] dark:border-gray-700 hover:border-violet-300 dark:hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={(selectedFolderId || pendingNewFolderName) ? 'text-[#1e293b] dark:text-gray-200 font-medium' : 'text-slate-500 dark:text-gray-400'}>
                          {pendingNewFolderName
                            ? pendingNewFolderName
                            : selectedFolderId
                              ? folders?.find(f => f.memberFolderId === selectedFolderId)?.folderName ?? 'Browse all folders...'
                              : 'Browse all folders...'}
                        </span>
                        <span className={`material-symbols-outlined !text-[16px] text-slate-400 transition-transform duration-200 ${openFolderBrowser ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>
                    </PopoverTrigger>
                    
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] dark:shadow-2xl border border-slate-200 dark:border-gray-800 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
                      align="start"
                      sideOffset={6}
                    >
                      <div className="px-3 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-gray-800 bg-white dark:bg-[#1c1c1e] flex items-center gap-1.5">
                        <span className="material-symbols-outlined !text-[12px] text-violet-400">folder</span>
                        All Folders ({folders?.length ?? 0})
                      </div>

                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {folders?.map((folder) => {
                          const isActive = selectedFolderId === folder.memberFolderId;
                          return (
                            <button
                              key={folder.memberFolderId}
                              className={`w-full text-left px-3 py-2 text-[11px] font-medium transition-colors flex items-center gap-2 ${
                                isActive ? 'text-violet-700 dark:text-purple-300 bg-violet-50 dark:bg-purple-900/30' : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newId = isActive ? null : folder.memberFolderId;
                                setSelectedFolderId(newId);
                                setPendingNewFolderName(null); 
                                if (newId !== null) {
                                  const top3 = (folders ?? []).slice(0, 3).map(f => f.memberFolderId);
                                  if (!top3.includes(newId)) {
                                    setPinnedFolderId(newId);
                                  }
                                } else {
                                  setPinnedFolderId(null);
                                }
                                setOpenFolderBrowser(false);
                              }}
                            >
                              <span className={`material-symbols-outlined !text-[16px] ${isActive ? 'text-violet-400 dark:text-purple-400' : 'text-gray-300 dark:text-gray-500'}`}>folder</span>
                              <span className="truncate">{folder.folderName}</span>
                              {isActive && <span className="material-symbols-outlined !text-[12px] ml-auto text-violet-400 dark:text-purple-400">check</span>}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <button
                  className="flex-none w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e8f0] dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 hover:border-violet-300 dark:hover:border-purple-500 text-slate-400 hover:text-violet-600 dark:hover:text-purple-400 transition-all shadow-sm"
                  onClick={() => useUIStore.getState().toggleCreateFolderDialog(true)}
                >
                  <span className="material-symbols-outlined !text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Tags Selection */}
            <div className={`${styles.sectionContainer} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>tag</span>
                  <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">TAGS</label>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {/* 
                  태그가 아주 많을 경우를 대비해:
                  1. 사용자가 '이미 선택한' 태그는 무조건 다 보여줍니다.
                  2. '선택하지 않은' 기존 태그들은 앞의 8개까지만 "추천"으로 보여줍니다.
                  3. 나머지는 'Add tag' 버튼을 통해 검색해서 찾도록 유도합니다.
                */}
                {/* AI 추천 태그 (새 태그, isExisting: false) 먼저 표시 */}
                {selectedTags
                  .filter(tag => aiSuggestedTags.has(tag) && !existingTagsList.includes(tag))
                  .map((tag) => (
                    <button
                      type="button"
                      key={`ai-${tag}`}
                      onClick={() => toggleTagSelection(tag)}
                      className={`${styles.tagChip} bg-violet-50 dark:bg-purple-900/30 text-violet-700 dark:text-purple-300 border-violet-300 dark:border-purple-600 shadow-sm font-semibold cursor-pointer ring-1 ring-violet-200 dark:ring-purple-900/50`}
                    >
                      <span className="material-symbols-outlined !text-[12px] mr-1">auto_awesome</span>
                      {tag}
                    </button>
                  ))}
                {/* 기존 태그 목록 */}
                {existingTagsList
                  .filter(tag =>
                    selectedTags.includes(tag) ||     // 선택된 태그거나
                    existingTagsList.indexOf(tag) < 8 // 상위 8개인 경우만 노출
                  )
                  .map((tag) => {
                  const isSelected = selectedTags.includes(tag);

                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTagSelection(tag)}
                      className={`${styles.tagChip} ${isSelected ? styles.tagChipSelected : styles.tagChipExisting} cursor-pointer`}
                    >
                      {tag}
                    </button>
                  );
                })}

                {isCreatingNewTag ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-400 dark:border-purple-500 bg-white dark:bg-gray-800 ring-2 ring-violet-100 dark:ring-purple-900/30 shadow-sm min-h-[26px]">
                    <input 
                      type="text"
                      value={newTagInputValue}
                      onChange={(e) => setNewTagInputValue(e.target.value)}
                      placeholder="Type tag..."
                      className="text-[11px] outline-none text-[#1e293b] dark:text-gray-200 w-16 sm:w-20 bg-transparent placeholder-slate-400 font-medium"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTagInputValue.trim()) {
                           handleCreateNewTag(newTagInputValue);
                           setIsCreatingNewTag(false);
                           setNewTagInputValue('');
                        } else if (e.key === 'Escape') {
                           setIsCreatingNewTag(false);
                           setNewTagInputValue('');
                        }
                      }}
                    />
                    <div className="flex items-center gap-0.5 pl-1.5 border-l border-slate-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          if (newTagInputValue.trim()) {
                            handleCreateNewTag(newTagInputValue);
                            setIsCreatingNewTag(false);
                            setNewTagInputValue('');
                          }
                        }}
                        className="text-violet-600 dark:text-purple-400 hover:text-violet-800 dark:hover:text-purple-300 transition-colors flex items-center justify-center p-0.5"
                      >
                        <span className="material-symbols-outlined !text-[14px]">check</span>
                      </button>
                      <button 
                        onClick={() => {
                          setIsCreatingNewTag(false);
                          setNewTagInputValue('');
                        }}
                        className="text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center p-0.5"
                      >
                        <span className="material-symbols-outlined !text-[14px]">close</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Popover open={openTagPopover} onOpenChange={setOpenTagPopover} modal={true}>
                    <PopoverTrigger asChild>
                      <button className={`${styles.tagAddTrigger} focus:ring-2 focus:ring-violet-200 dark:focus:ring-purple-900/30 focus:border-violet-400 dark:focus:border-purple-500`}>
                        <span className="material-symbols-outlined !text-[14px]">add</span> Add tag...
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[200px] p-2 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-2xl border border-slate-200 dark:border-gray-800 z-[100]" 
                      align="start" 
                      side="bottom" // [수정] 아래로 여는 것을 선호하지만
                      sideOffset={8}
                      avoidCollisions={true} // [수정] 공간이 정말 부족하다면 위로 띄워 깨짐을 방지
                      collisionPadding={10}  // 화면 끝에 너무 딱 붙지 않게 여유를 줌
                    >
                    <div className="flex items-center gap-2 border border-slate-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 focus-within:border-violet-500 dark:focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-violet-200 dark:focus-within:ring-purple-900/30 transition-all bg-slate-50/50 dark:bg-gray-800/50">
                      <span className="material-symbols-outlined !text-[14px] text-slate-400">search</span>
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Search or create..." 
                        className="w-full text-[11px] font-medium outline-none bg-transparent placeholder-slate-400 text-slate-700 dark:text-gray-200"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            setTagInput('');
                            setOpenTagPopover(false);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="mt-2 w-full">
                      <button 
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-violet-50 dark:bg-purple-900/30 text-violet-700 dark:text-purple-300 hover:bg-violet-100 dark:hover:bg-purple-900/50 transition-colors font-bold text-[11px]"
                        onClick={() => {
                          setOpenTagPopover(false);
                          setTagInput('');
                          setIsCreatingNewTag(true);
                        }}
                      >
                         <span className="material-symbols-outlined !text-[14px]">add</span>
                         Create New tag
                      </button>
                    </div>

                    {/* [수정] 화면이 깨지지 않도록 최대 높이를 220px -> 160px로 적절히 조절 */}
                    <div 
                      className="mt-2 flex flex-col gap-0.5 max-h-[160px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin"
                      style={{ 
                        scrollbarWidth: 'thin', // 너무 굵지 않게 조절
                        msOverflowStyle: 'auto'
                      }}
                    >
                      {/* 
                        'Add tag' 버튼을 눌렀을 때는 필터링 없이 
                        (검색어가 있을 때만 제외하고) 모든 기존 태그 목록을 다 보여줍니다.
                      */}
                      {existingTagsList
                        .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
                        .map(tag => (
                        <button
                          type="button"
                          key={tag}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-gray-800 font-medium text-[11px] cursor-pointer transition-colors ${selectedTags.includes(tag) ? 'text-violet-700 dark:text-purple-300 bg-violet-50 dark:bg-purple-900/30' : 'text-[#1e293b] dark:text-gray-300'}`}
                          onClick={() => {
                            toggleTagSelection(tag);
                            setTagInput('');
                            setOpenTagPopover(false);
                          }}
                        >
                          <span className="text-slate-400 font-extrabold pb-0.5">#</span> {tag}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                )}
              </div>
            </div>

            {/* Note Area */}
            <div className={`${styles.sectionContainer} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>edit</span>
                  <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">NOTE</label>
                </div>
                {(analyzeLinkMutation.isPending || analyzeLinkMutation.isSuccess) && (
                  <button
                    onClick={handleAiAnalysis}
                    disabled={!url.trim() || !(url.startsWith('http://') || url.startsWith('https://')) || analyzeLinkMutation.isPending}
                    className="flex items-center gap-1 text-[8.5px] text-violet-600 hover:text-violet-500 transition-colors font-bold group disabled:opacity-50 disabled:cursor-not-allowed animate-in fade-in slide-in-from-right-2 duration-300"
                  >
                    <span className="material-symbols-outlined !text-[11px] text-violet-600">auto_awesome</span>
                    {analyzeLinkMutation.isPending ? 'Generating...' : 'Regenerate AI Summary'}
                  </button>
                )}
              </div>
              <textarea
                className="w-full bg-white dark:bg-slate-900/60 border border-[#e2e8f0] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-violet-400 dark:focus:border-purple-500 rounded-xl p-2.5 text-xs text-[#1e293b] dark:text-gray-100 placeholder-slate-400 resize-none outline-none focus:ring-1 focus:ring-violet-100 dark:focus:ring-purple-900/30 transition-all font-normal shadow-sm"
                placeholder="Add a personal note or key takeaway..."
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 mt-2">
              <button 
                onClick={() => toggleSaveLinkDialog(false)} 
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!url.trim() || !(url.startsWith('http://') || url.startsWith('https://')) || createBookmarkMutation.isPending || createFolderMutation.isPending}
                className={`${styles.btnGradient} text-xs font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
              >
                {(createBookmarkMutation.isPending || createFolderMutation.isPending) ? 'Saving...' : 'Save to Workspace'}
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
