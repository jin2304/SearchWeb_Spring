'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFolders, useCreateFolder } from '@/lib/api/folderApi';
import { useTags, useCreateTag } from '@/lib/api/tagApi';
import { useCreateBookmark, useAnalyzeUrl } from '@/lib/api/bookmarkApi';
import { useAnalyzeLink } from '@/lib/api/linkAnalysisApi';
import { useAuthStore } from '@/lib/store/authStore';
import type { LinkAnalysisResponse } from '@/lib/types/linkAnalysis';
import { FOLDER_TYPE } from '@/lib/types/folder';
import { Spinner } from '@/components/ui/spinner';
import { buildGoogleFaviconUrl, buildDirectFaviconUrl } from '@/lib/utils/favicon';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

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
  folderTile: "relative flex flex-col items-center justify-center p-3 max-tablet-lg:p-2.5 rounded-xl border border-[#e2e8f0] dark:border-white/10 bg-white dark:bg-slate-800/60 backdrop-blur-sm cursor-pointer transition-all hover:border-violet-300 dark:hover:border-purple-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-700 text-center gap-1.5 max-tablet-lg:gap-1 shadow-sm",
  folderTileActive: "border-violet-500 dark:border-purple-500 ring-1 ring-violet-500 dark:ring-purple-500 bg-white dark:bg-slate-800 text-violet-900 dark:text-purple-300 shadow-[0_0_15px_rgba(124,58,237,0.15)]",
  matchBadge: `absolute -top-2 -right-1.5 ${theme.premiumGradient} text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full shadow-md z-10`,
  btnGradient: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50",
  sectionContainer: "bg-gray-50/80 dark:bg-slate-800/50 dark:backdrop-blur-md rounded-2xl p-3 max-tablet-lg:p-2.5 border border-gray-100/50 dark:border-white/[0.05]"
};

/**
 * URL에서 도메인만 추출하는 헬퍼 함수 (개인정보 보호용)
 */
function getUrlDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 소요 시간을 분석용 범주형 버킷(문자열)으로 변환하는 헬퍼 함수
 */
function getSaveDurationBucket(startedAt: number | null): string {
  if (!startedAt) return 'unknown';

  const seconds = (Date.now() - startedAt) / 1000;
  if (seconds <= 3) return '0_3s';
  if (seconds <= 5) return '3_5s';
  if (seconds <= 8) return '5_8s';
  if (seconds <= 15) return '8_15s';
  return '15s_plus';
}

/**
 * AI 분석을 요청하게 된 진입 경로(트리거)를 판별하는 헬퍼 함수
 */
function getLinkAnalysisTrigger(
  defaultUrl: string | undefined,
  currentUrl: string,
  hasPreviousAttempt: boolean,
): string {
  if (hasPreviousAttempt) return 'retry';
  if (defaultUrl && defaultUrl.trim() === currentUrl) return 'clipboard';
  return 'url_input';
}

/**
 * AI 분석 실패 시 에러 객체를 파싱하여 실패 유형을 분류하는 헬퍼 함수
 */
function getLinkAnalysisFailureType(error: unknown): string {
  if (!error || typeof error !== 'object') return 'unknown';

  const maybeApiError = error as { status?: unknown; code?: unknown; message?: unknown };
  const status = typeof maybeApiError.status === 'number' ? maybeApiError.status : undefined;
  const code = typeof maybeApiError.code === 'string' ? maybeApiError.code.toLowerCase() : '';
  const message = typeof maybeApiError.message === 'string' ? maybeApiError.message.toLowerCase() : '';

  if (status === 408 || status === 504 || code.includes('timeout') || message.includes('timeout')) {
    return 'timeout';
  }
  if (code.includes('parse') || message.includes('parse')) {
    return 'parse';
  }
  if (status && status >= 500) {
    return 'ai_unavailable';
  }
  if (error instanceof TypeError || message.includes('network') || message.includes('failed to fetch')) {
    return 'network';
  }

  return 'unknown';
}

/**
 * 링크(북마크) 저장 다이얼로그 컴포넌트
 */
export function SaveLinkDialog() {
  // 전역 UI 상태 (다이얼로그 열림/닫힘)
  const { saveLinkDialogOpen, saveLinkDefaultUrl, toggleSaveLinkDialog } = useUIStore();
  const saveOpenedAtRef = useRef<number | null>(null);
  const hasTrackedOpenRef = useRef(false);

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
  const [hasAiSuggestedFolder, setHasAiSuggestedFolder] = useState(false);

  // --- API 연동 (React Query Hooks) ---
  const memberId = useAuthStore((s) => s.member?.memberId);
  const { data: folders, isLoading: isFoldersLoading } = useFolders(memberId); // 기존 폴더 목록 조회
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
    setFaviconFallbackStep('google');
    setFaviconVisible(false);
  }, [url]);

  
  // --- UI 전용 상태 추가 (파비콘 폴백) ---
  const [faviconFallbackStep, setFaviconFallbackStep] = useState<'google' | 'direct' | 'failed'>('google');
  const [faviconVisible, setFaviconVisible] = useState(false);
  
  const previewFaviconUrl = (() => {
    if (!url) return null;
    if (faviconFallbackStep === 'google') {
      return buildGoogleFaviconUrl(url);
    }
    if (faviconFallbackStep === 'direct') {
      return buildDirectFaviconUrl(url);
    }
    return null;
  })();

  // --- 팝업이 열고 닫힐 때마다 모든 입력 상태 초기화 ---
  useEffect(() => {
    if (saveLinkDialogOpen) {
      if (!hasTrackedOpenRef.current) {
        // KPI: 다이얼로그가 열린 시각을 기록 (저장 소요 시간 측정용)
        saveOpenedAtRef.current = Date.now();
        hasTrackedOpenRef.current = true;     // 중복 호출 방지 플래그 설정
        // KPI: 다이얼로그 오픈 이벤트 전송 (클립보드 진입 또는 버튼 진입 구분)
        trackEvent(ANALYTICS_EVENTS.BOOKMARK_SAVE_OPENED, {
          event_params: {
            trigger: saveLinkDefaultUrl ? 'clipboard' : 'button',
          },
        });
      }
      if (saveLinkDefaultUrl) {
        setUrl(saveLinkDefaultUrl);
      }
    } else {
      // 팝업이 닫힐 때: 소요 시간 측정을 위한 변수 및 AI 추천 상태 초기화
      saveOpenedAtRef.current = null;
      hasTrackedOpenRef.current = false;
      
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
      setHasAiSuggestedFolder(false);
    }
  }, [saveLinkDialogOpen, saveLinkDefaultUrl]); // 내부 상태(url 등) 의존성 제어

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
    const trimmedUrl = url.trim();
    if (!trimmedUrl || !(trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) return;

    // KPI: AI 분석을 요청한 시작 시각 기록 (분석 소요 시간 측정용)
    const startedAt = Date.now();
    const trigger = getLinkAnalysisTrigger(
      saveLinkDefaultUrl,
      trimmedUrl,
      analyzeLinkMutation.isSuccess || analyzeLinkMutation.isError,
    );

    // KPI: AI 분석 시작 이벤트 전송
    trackEvent(ANALYTICS_EVENTS.LINK_ANALYSIS_STARTED, {
      event_params: { trigger }
    });

    analyzeLinkMutation.mutate(trimmedUrl, {
      onSuccess: (result: LinkAnalysisResponse) => {
        // KPI: AI 분석 성공 및 추천 정보 유무, 소요 시간 전송
        trackEvent(ANALYTICS_EVENTS.LINK_ANALYSIS_COMPLETED, {
          event_params: {
            duration_bucket: getSaveDurationBucket(startedAt), // 분석 소요 시간 범위 변환 (예: '3_5s')
            has_ai_tag: Boolean(result.suggestedTags?.length),
            has_ai_folder: Boolean(result.suggestedFolder),
          }
        });

        // AI 추천 폴더 존재 여부 상태 업데이트 (최종 저장 시 채택률 분석용)
        setHasAiSuggestedFolder(Boolean(result.suggestedFolder));

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
        const aiTagNames = new Set<string>();

        if (result.suggestedTags?.length) {
          const tagsToSelect = [...baseTags];
          for (const tag of result.suggestedTags) {
            if (!tagsToSelect.includes(tag.tagName)) {
              tagsToSelect.push(tag.tagName);
            }
            // 이미 수동으로 선택된 태그가 아닌 경우에만 AI 추천 태그로 기록
            if (!baseTags.includes(tag.tagName)) {
              aiTagNames.add(tag.tagName);
            }
          }
          setSelectedTags(tagsToSelect);
        } else {
          setSelectedTags(baseTags);
        }
        setAiSuggestedTags(aiTagNames);

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
      onError: (error) => {
        // KPI: AI 분석 실패 정보 및 에러 원인, 소요 시간 전송
        trackEvent(ANALYTICS_EVENTS.LINK_ANALYSIS_FAILED, {
          event_params: {
            duration_bucket: getSaveDurationBucket(startedAt),
            failure_type: getLinkAnalysisFailureType(error), // 에러 유형 분류 (timeout, network 등)
          }
        });
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
          // KPI: 최종 북마크 저장 완료 이벤트 전송
          trackEvent(ANALYTICS_EVENTS.BOOKMARK_SAVED, {
            event_params: {
              url_domain: getUrlDomain(url.trim()), // 도메인만 추출 (개인정보 보호)
              // 최종 저장 시 AI 추천 태그가 포함되었는지 확인
              has_ai_tag: selectedTags.some((tag) => aiSuggestedTags.has(tag)),
              // AI 추천 폴더를 사용하여 저장했는지 확인
              has_ai_folder: hasAiSuggestedFolder,
              // 다이얼로그가 열린 시점(saveOpenedAtRef.current)부터 저장 완료까지 걸린 총 소요시간 측정
              duration_bucket: getSaveDurationBucket(saveOpenedAtRef.current),
            }
          });
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
      // Quick Save 경로: 폴더 미지정 시 미분류(UNORGANIZED) 폴더로 저장
      const fallbackFolderId =
        selectedFolderId
        ?? folders?.find((f) => f.folderType === FOLDER_TYPE.UNORGANIZED)?.memberFolderId
        ?? null;

      // [추가] 폴더 목록 로딩이 끝났음에도 불구하고 대상 폴더를 결정할 수 없는 경우 예외 처리
      if (fallbackFolderId === null) {
        alert('폴더 정보를 불러오는 중이거나 폴더가 존재하지 않습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      saveBookmark(fallbackFolderId);
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
      <DialogContent className="max-tablet-lg:!top-auto max-tablet-lg:!bottom-0 max-tablet-lg:!translate-y-0 max-sm:!max-w-full sm:max-w-[540px] max-tablet-lg:max-w-[540px] max-sm:px-0 sm:px-4 max-tablet-lg:px-4 max-sm:!rounded-none sm:!rounded-t-[32px] max-tablet-lg:!rounded-t-[32px] tablet-lg:max-w-[540px] tablet-lg:left-[calc(50%+90px)] p-0 bg-transparent border-0 shadow-none [&>button]:hidden overflow-visible max-tablet-lg:data-[state=open]:!slide-in-from-bottom-full max-tablet-lg:data-[state=closed]:!slide-out-to-bottom-full max-tablet-lg:data-[state=open]:!zoom-in-100 max-tablet-lg:data-[state=closed]:!zoom-out-100 duration-300">
        
        <div className={`relative z-dialog w-full max-tablet-lg:flex max-tablet-lg:flex-col max-tablet-lg:h-[72vh] max-tablet-lg:max-h-[72vh] max-sm:max-w-full sm:max-w-[540px] max-tablet-lg:max-w-[540px] max-sm:rounded-t-[32px] sm:rounded-2xl max-tablet-lg:rounded-2xl max-sm:rounded-b-none max-tablet-lg:border-x-0 max-tablet-lg:border-b-0 max-tablet-lg:overflow-hidden tablet-lg:max-w-[540px] bg-white dark:bg-[#0a0a0b] tablet-lg:rounded-2xl ${theme.softModalShadow} border border-slate-100 dark:border-white/[0.08] overflow-visible mx-auto`}>
          
          {/* Mobile Drag Handle Indicator */}
          <div className="w-full flex-none flex justify-center pt-3 pb-2 tablet-lg:hidden bg-white dark:bg-[#0a0a0b] z-20">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
          </div>

          {/* Header & Close */}
          <div className="relative flex items-center justify-between px-5 max-tablet-lg:px-6 pt-5 max-tablet-lg:pt-2 pb-2 max-tablet-lg:pb-4 z-10 max-tablet-lg:z-20 max-tablet-lg:flex-none max-tablet-lg:bg-white max-tablet-lg:dark:bg-[#0a0a0b] max-tablet-lg:border-b max-tablet-lg:border-slate-100 max-tablet-lg:dark:border-white/[0.05]">
            <DialogTitle className={`text-lg font-extrabold ${theme.charcoal} tracking-tight flex items-center gap-2.5`}>
              <div className={`${theme.premiumGradient} p-1.5 rounded-lg flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white !text-[18px] fill-1">bookmark</span>
              </div>
              Save Link
            </DialogTitle>
            <DialogDescription className="sr-only">Save a new link to your workspace with AI assistance</DialogDescription>
            <button 
              onClick={() => toggleSaveLinkDialog(false)} 
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined !text-[18px]">close</span>
            </button>
          </div>

          {/* Main Scrollable Area */}
          <div className="relative px-5 max-tablet-lg:px-5 pb-5 max-tablet-lg:pb-0 space-y-3 max-tablet-lg:space-y-4 mt-3 max-tablet-lg:mt-0 z-10 max-tablet-lg:flex-1 max-tablet-lg:overflow-y-auto max-tablet-lg:custom-scrollbar">
            
            {/* URL Input */}
            <div className={`${styles.sectionContainer} space-y-1.5`}>
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>link</span>
                <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">URL</label>
              </div>
              <div className="relative group flex items-center gap-2">
                <div className="flex-none w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden relative">
                  {/* 기본 체인 링크 아이콘 (파비콘 로딩 전/실패 시의 디폴트 플레이스홀더. 파비콘 로드 성공 시 크로스페이드 아웃) */}
                  <span className={`material-symbols-outlined text-slate-400 !text-[18px] absolute transition-opacity duration-200 ${faviconVisible ? 'opacity-0' : 'opacity-100'}`}>link</span>
                  
                  {previewFaviconUrl && faviconFallbackStep !== 'failed' && (
                    <Image
                      src={previewFaviconUrl}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      className={`w-5 h-5 object-contain transition-opacity duration-200 relative z-10 ${faviconVisible ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        // 구글 파비콘 API는 파비콘이 없을 경우 16x16 크기의 기본 지구본 이미지를 200 OK로 반환.
                        // 이를 감지하여 실패로 간주하고 폴백(직접 호출)을 실행.
                        if (faviconFallbackStep === 'google' && img.naturalWidth === 16 && img.naturalHeight === 16) {
                          setFaviconVisible(false);
                          setFaviconFallbackStep('direct');
                        } else {
                          setFaviconVisible(true); // 정상 파비콘일 때만 서서히 표시
                        }
                      }}
                      onError={() => {
                        setFaviconVisible(false);
                        if (faviconFallbackStep === 'google') {
                          setFaviconFallbackStep('direct');
                        } else {
                          setFaviconFallbackStep('failed');
                        }
                      }}
                    />
                  )}
                </div>
                <div className="relative flex-1">
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
                  URL must start with http:// or https://
                </p>
              )}
            </div>

            {/* Title Input */}
            <div className={`${styles.sectionContainer} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] opacity-100 ${theme.accentPurple}`}>title</span>
                  <label className="block text-[10px] font-bold text-gray-900 dark:text-white/90 uppercase tracking-[0.15em]">TITLE</label>
                </div>
                {analyzeUrlMutation.isPending && (
                  <span className="text-[9px] text-violet-500 animate-pulse flex items-center gap-1 font-medium">
                    <Spinner className="h-2.5 w-2.5 border-[1.5px]" />
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
            <div className="flex justify-center w-full max-tablet-lg:py-1">
              <button
                onClick={handleAiAnalysis}
                disabled={!url.trim() || !(url.startsWith('http://') || url.startsWith('https://')) || analyzeLinkMutation.isPending}
                className={`w-full py-2.5 px-5 rounded-lg ${theme.premiumGradient} text-white font-bold text-xs ${theme.elevatedShadow} hover:shadow-lg hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2 group border-t border-white/20 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {analyzeLinkMutation.isPending ? (
                  <>
                    <Spinner />
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
            <div className={`${styles.sectionContainer} space-y-3 max-tablet-lg:space-y-2`}>
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
                      className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] dark:shadow-2xl border border-slate-200 dark:border-gray-800 z-popover overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
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
                      className="text-[11px] outline-none text-[#1e293b] dark:text-gray-200 w-16 tablet-lg:w-20 bg-transparent placeholder-slate-400 font-medium"
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
                      className="w-[200px] p-2 bg-white dark:bg-[#1c1c1e] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-2xl border border-slate-200 dark:border-gray-800 z-popover" 
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
            <div className="flex items-center justify-end gap-3 px-6 max-tablet-lg:px-6 py-5 max-tablet-lg:py-4 mt-2 max-tablet-lg:mt-0 max-tablet-lg:-mx-5 max-tablet-lg:sticky max-tablet-lg:bottom-0 max-tablet-lg:bg-white max-tablet-lg:dark:bg-[#0a0a0b] max-tablet-lg:border-t max-tablet-lg:border-slate-100 max-tablet-lg:dark:border-white/[0.05] max-tablet-lg:z-20 max-tablet-lg:pb-safe">
              <button 
                onClick={() => toggleSaveLinkDialog(false)} 
                className="text-xs max-tablet-lg:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!url.trim() || !(url.startsWith('http://') || url.startsWith('https://')) || createBookmarkMutation.isPending || createFolderMutation.isPending || isFoldersLoading}
                className={`${styles.btnGradient} text-xs max-tablet-lg:text-[15px] font-bold px-6 max-tablet-lg:w-full py-2.5 max-tablet-lg:py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg max-tablet-lg:shadow-[0_4px_12px_rgba(124,58,237,0.2)]`}
              >
                {(createBookmarkMutation.isPending || createFolderMutation.isPending) ? 'Saving...' : 'Save Link'}
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
