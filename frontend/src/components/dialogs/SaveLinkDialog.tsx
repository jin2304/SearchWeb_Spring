'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useFolders } from '@/lib/api/folderApi';
import { useTags, useCreateTag } from '@/lib/api/tagApi';
import { useCreateBookmark, useAnalyzeUrl } from '@/lib/api/bookmarkApi';
import { TEMP_MEMBER_ID } from '@/lib/auth/currentUser';

// 디자인 시안에서 추출한 커스텀 테마 매핑
const theme = {
  premiumGradient: "bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)]",
  elevatedShadow: "shadow-[0_10px_25px_-5px_rgba(124,58,237,0.4),0_8px_10px_-6px_rgba(124,58,237,0.2)]",
  softModalShadow: "shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01),0_0_1px_rgba(0,0,0,0.05)]",
  accentPurple: "text-[#7c3aed]",
  charcoal: "text-[#1e293b]",
};

// 재사용될 반복 스타일 클래스 모음
const styles = {
  minimalInput: "bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 w-full text-xs text-[#1e293b] transition-colors duration-200 placeholder-slate-400 font-normal focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none shadow-sm",
  tagChip: "text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer select-none border border-transparent font-medium flex items-center justify-center min-h-[26px] bg-white shadow-sm",
  tagChipSelected: "bg-violet-50 text-violet-700 border-violet-200 shadow-sm font-semibold",
  tagChipExisting: "text-[#1e293b] border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  tagAddTrigger: "text-[11px] px-2.5 py-1 rounded-full bg-white border border-dashed border-slate-300 text-slate-500 hover:border-violet-500 hover:text-violet-600 transition-all cursor-pointer flex items-center gap-1 min-h-[26px] w-fit relative z-30 shadow-sm",
  folderTile: "relative flex flex-col items-center justify-center p-3 rounded-lg border border-[#e2e8f0] bg-white cursor-pointer transition-all hover:border-violet-300 text-center gap-1.5 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.03)]",
  folderTileActive: "border-violet-500 ring-1 ring-violet-500 bg-white text-violet-900 shadow-[0_0_10px_rgba(124,58,237,0.25)]",
  matchBadge: `absolute -top-2 -right-1.5 ${theme.premiumGradient} text-white text-[9px] font-bold px-1.5 py-[1px] rounded-full shadow-md z-10`,
  btnGradient: "bg-[linear-gradient(135deg,#7c3aed_0%,#a855f7_100%)] hover:opacity-95 text-white shadow-md shadow-violet-500/20",
  sectionContainer: "bg-[#f8f9fc] rounded-xl p-3 border border-transparent"
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

  // --- 폼 기반 입력 상태 (실제 서버로 전송될 데이터) ---
  const [url, setUrl] = useState('');                                            // 저장할 링크 URL
  const [displayTitle, setDisplayTitle] = useState('');                          // 표시될 제목
  const [isTitleEdited, setIsTitleEdited] = useState(false);                     // 사용자가 제목을 직접 편집했는지 여부
  const [note, setNote] = useState('');                                          // 사용자의 메모
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null); // 선택된 폴더 ID
  const [selectedTags, setSelectedTags] = useState<string[]>([]);                // 선택된 태그 목록 (이름 리스트)

  // --- API 연동 (React Query Hooks) ---
  const { data: folders } = useFolders(TEMP_MEMBER_ID);    // 기존 폴더 목록 조회
  const { data: tagsData } = useTags(TEMP_MEMBER_ID);      // 기존 태그 목록 조회
  const createBookmarkMutation = useCreateBookmark();      // 북마크 생성 API 연동
  const createTagMutation = useCreateTag();                // 태그 생성 API 연동
  const analyzeUrlMutation = useAnalyzeUrl();              // URL 분석(제목 추출) API 연동

  // --- URL 입력 시 제목 자동 생성 및 실시간 분석 로직 ---
  useEffect(() => {
    if (!url || !url.startsWith('http')) {
      if (!isTitleEdited) setDisplayTitle('');
      return;
    }

    // 이미 수동으로 편집 중이면 자동 변경 안 함
    if (isTitleEdited) return;

    // 1단계: 즉시 도메인으로 임시 제목 설정
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    setDisplayTitle(domain);

    // 2단계: 실제 페이지 제목(Title) 요청 (복사-붙여넣기 위주이므로 즉시 요청)
    analyzeUrlMutation.mutate(url, {
      onSuccess: (realTitle: string) => {
        if (!isTitleEdited && realTitle) {
          setDisplayTitle(realTitle);
        }
      }
    });
  }, [url, isTitleEdited]);

  
  // --- 팝업이 열고 닫힐 때마다 모든 입력 상태 초기화 ---
  useEffect(() => {
    // 팝업이 닫힐 때 뿐만 아니라 열릴 때도 깨끗한 상태를 보장하기 위해
    // saveLinkDialogOpen의 상태가 변경될 때 필드들을 초기화합니다.
    if (!saveLinkDialogOpen) {
      setUrl('');
      setDisplayTitle('');
      setIsTitleEdited(false);
      setNote('');
      setSelectedFolderId(null);
      setSelectedTags([]);
      setTagInput('');
      setNewTagInputValue('');
      setIsCreatingNewTag(false);
    }
  }, [saveLinkDialogOpen]);

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
   * [핸들러] 최종 저장 버튼 클릭 시 실행
   */
  const handleSave = () => {
    if (!url.trim()) return;

    // 북마크 생성 API 호출
    createBookmarkMutation.mutate(
      {
        url: url.trim(),
        displayTitle: displayTitle.trim() || url.trim(), // 편집된 제목 사용, 없으면 URL 사용
        memberFolderId: selectedFolderId,
        note: note.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined, // 태그를 콤마로 구분된 문자열로 변환
      },
      {
        onSuccess: () => {
          // 저장 성공 시: 알림 닫고 입력 필드 초기화
          toggleSaveLinkDialog(false);
          setUrl('');
          setDisplayTitle('');
          setIsTitleEdited(false);
          setNote('');
          setSelectedFolderId(null);
          setSelectedTags([]);
        },
      }
    );
  };

  
  /**
   * [핸들러] 새로운 태그를 직접 생성할 때 호출
   */
  const handleCreateNewTag = (tagName: string) => {
    if (!tagName.trim()) return;

    createTagMutation.mutate(
      { ownerMemberId: TEMP_MEMBER_ID, tagName: tagName.trim() },
      {
        onSuccess: () => {
          // 태그가 서버에 생성되면, 현재 선택된 태그 목록에도 추가
          setSelectedTags((prev) => [...prev, tagName.trim()]);
        },
      }
    );
  };


  return (
    <Dialog open={saveLinkDialogOpen} onOpenChange={toggleSaveLinkDialog}>
      {/* 
        기존 shadcn 다이얼로그의 배경/패딩, 자체 닫기버튼(&>button:hidden) 무력화 
        투명 배경 위에서 우리의 커스텀 UI 박스(z-10 bg-white rounded-2xl...)가 완전히 덮도록 구성
      */}
      <DialogContent className="sm:max-w-[480px] p-0 bg-transparent border-0 shadow-none [&>button]:hidden overflow-visible">
        
        <div className={`relative z-10 w-full max-w-[480px] bg-white rounded-2xl ${theme.softModalShadow} border border-slate-100 overflow-visible mx-auto`}>
          
          {/* Header & Close */}
          <div className="relative flex items-center justify-between px-5 pt-5 pb-2 z-10">
            <DialogTitle className={`text-lg font-extrabold ${theme.charcoal} tracking-tight flex items-center gap-2.5`}>
              <div className={`${theme.premiumGradient} p-1.5 rounded-lg shadow-lg shadow-violet-200/50 flex items-center justify-center ring-1 ring-white/20`}>
                <span className="material-symbols-outlined text-white !text-[18px] fill-1 drop-shadow-sm">bookmark</span>
              </div>
              Save to Workspace
            </DialogTitle>
            <DialogDescription className="sr-only">Save a new link to your workspace with AI assistance</DialogDescription>
            <button 
              onClick={() => toggleSaveLinkDialog(false)} 
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined !text-[18px]">close</span>
            </button>
          </div>

          <div className="relative px-5 pb-5 space-y-3 mt-3 z-10">
            
            {/* URL Input */}
            <div className={`${styles.sectionContainer} space-y-1.5`}>
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined !text-[12px] ${theme.accentPurple}`}>link</span>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">URL</label>
              </div>
              <div className="relative group flex items-center gap-2">
                <div className="flex-none w-8 h-8 rounded-lg bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm overflow-hidden">
                  {url ? (
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${url.replace(/^https?:\/\//, '').split('/')[0]}&sz=64`} 
                      alt="" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        if ((e.target as HTMLImageElement).parentElement) {
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="material-symbols-outlined text-slate-400 !text-[18px]">link</span>';
                        }
                      }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 !text-[18px]">link</span>
                  )}
                </div>
                <input
                  className={`${styles.minimalInput} flex-1`}
                  type="text"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Title Input (새로 추가) */}
            <div className={`${styles.sectionContainer} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] ${theme.accentPurple}`}>title</span>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">TITLE</label>
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
                placeholder="Enter link title"
                value={displayTitle}
                onChange={(e) => {
                  setDisplayTitle(e.target.value);
                  setIsTitleEdited(true); // 직접 수정했음을 표시
                }}
              />
            </div>

            {/* AI Analysis Button */}
            <div className="flex justify-center w-full">
              <button className={`w-full py-2.5 px-5 rounded-lg ${theme.premiumGradient} text-white font-bold text-xs ${theme.elevatedShadow} hover:shadow-lg hover:brightness-105 transition-all duration-300 flex items-center justify-center gap-2 group border-t border-white/20`}>
                <span className="material-symbols-outlined !text-[16px] group-hover:scale-110 transition-transform fill-1">auto_awesome</span>
                Request AI Analysis
              </button>
            </div>

            {/* Folder Selection */}
            <div className={`${styles.sectionContainer} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] ${theme.accentPurple}`}>folder</span>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Folder</label>
                </div>
                {/* AI Recommended Badge */}
                <span className="text-[8px] text-violet-600 flex items-center gap-1 font-bold bg-white px-1.5 py-0.5 rounded-full border border-violet-100 shadow-sm">
                  <span className="material-symbols-outlined !text-[10px]">smart_toy</span>
                  AI Recommended
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {folders?.slice(0, 6).map((folder) => {
                  const isActive = selectedFolderId === folder.memberFolderId;
                  return (
                    <div
                      key={folder.memberFolderId}
                      onClick={() => setSelectedFolderId(isActive ? null : folder.memberFolderId)}
                      className={`${styles.folderTile} ${isActive ? styles.folderTileActive : ''} group`}
                    >
                      <span className={`material-symbols-outlined !text-[20px] mb-0.5 transition-colors ${isActive ? 'text-violet-600 drop-shadow-sm' : 'text-slate-400 group-hover:text-violet-500'}`}>folder</span>
                      <span className={`text-[10px] leading-tight truncate w-full ${isActive ? 'font-bold text-violet-900' : 'text-slate-500 group-hover:text-slate-800 font-medium'}`}>{folder.folderName}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                  <div className="w-full flex items-center justify-between bg-white border border-[#e2e8f0] rounded-lg px-2.5 py-2 text-xs text-[#1e293b] cursor-pointer hover:border-violet-300 hover:bg-slate-50 transition-all shadow-sm" tabIndex={0}>
                    <span className="text-slate-500">Browse all folders...</span>
                    <span className="material-symbols-outlined !text-[16px] text-slate-400">expand_more</span>
                  </div>
                </div>
                <button className="flex-none w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e8f0] bg-white hover:bg-slate-50 hover:border-violet-300 text-slate-400 hover:text-violet-600 transition-all shadow-sm">
                  <span className="material-symbols-outlined !text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Tags Selection */}
            <div className={`${styles.sectionContainer} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined !text-[12px] ${theme.accentPurple}`}>tag</span>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">TAGS</label>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {/* 
                  태그가 아주 많을 경우를 대비해:
                  1. 사용자가 '이미 선택한' 태그는 무조건 다 보여줍니다.
                  2. '선택하지 않은' 기존 태그들은 앞의 8개까지만 "추천"으로 보여줍니다.
                  3. 나머지는 'Add tag' 버튼을 통해 검색해서 찾도록 유도합니다.
                */}
                {existingTagsList
                  .filter(tag => 
                    selectedTags.includes(tag) ||     // 선택된 태그거나
                    existingTagsList.indexOf(tag) < 8 // 상위 8개인 경우만 노출
                  )
                  .map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  
                  return (
                    <div
                      key={tag}
                      onClick={() => toggleTagSelection(tag)}
                      className={`${styles.tagChip} ${isSelected ? styles.tagChipSelected : styles.tagChipExisting} cursor-pointer`}
                    >
                      {tag}
                    </div>
                  );
                })}

                {isCreatingNewTag ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-violet-400 bg-white ring-2 ring-violet-100 shadow-sm min-h-[26px]">
                    <input 
                      type="text"
                      value={newTagInputValue}
                      onChange={(e) => setNewTagInputValue(e.target.value)}
                      placeholder="Type tag..."
                      className="text-[11px] outline-none text-[#1e293b] w-16 sm:w-20 bg-transparent placeholder-slate-400 font-medium"
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
                    <div className="flex items-center gap-0.5 pl-1.5 border-l border-slate-200">
                      <button
                        onClick={() => {
                          if (newTagInputValue.trim()) {
                            handleCreateNewTag(newTagInputValue);
                            setIsCreatingNewTag(false);
                            setNewTagInputValue('');
                          }
                        }}
                        className="text-violet-600 hover:text-violet-800 transition-colors flex items-center justify-center p-0.5"
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
                      <button className={`${styles.tagAddTrigger} focus:ring-2 focus:ring-violet-200 focus:border-violet-400`}>
                        <span className="material-symbols-outlined !text-[14px]">add</span> Add tag...
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[200px] p-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-200 z-[100]" 
                      align="start" 
                      side="bottom" // [수정] 아래로 여는 것을 선호하지만
                      sideOffset={8}
                      avoidCollisions={true} // [수정] 공간이 정말 부족하다면 위로 띄워 깨짐을 방지
                      collisionPadding={10}  // 화면 끝에 너무 딱 붙지 않게 여유를 줌
                    >
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-200 transition-all bg-slate-50/50">
                      <span className="material-symbols-outlined !text-[14px] text-slate-400">search</span>
                      <input 
                        type="text" 
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Search or create..." 
                        className="w-full text-[11px] font-medium outline-none bg-transparent placeholder-slate-400 text-slate-700"
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
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors font-bold text-[11px]"
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
                        <div
                          key={tag}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-50 font-medium text-[11px] cursor-pointer transition-colors ${selectedTags.includes(tag) ? 'text-violet-700 bg-violet-50' : 'text-[#1e293b]'}`}
                          onClick={() => {
                            toggleTagSelection(tag);
                            setTagInput('');
                            setOpenTagPopover(false);
                          }}
                        >
                          <span className="text-slate-400 font-extrabold pb-0.5">#</span> {tag}
                        </div>
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
                  <span className={`material-symbols-outlined !text-[12px] ${theme.accentPurple}`}>edit</span>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">NOTE</label>
                </div>
                <button className="flex items-center gap-1 text-[8.5px] text-violet-600 hover:text-violet-500 transition-colors font-bold group">
                  <span className="material-symbols-outlined !text-[11px] text-violet-600">auto_awesome</span>
                  Generate AI Summary
                </button>
              </div>
              <textarea
                className="w-full bg-white border border-[#e2e8f0] hover:border-slate-300 focus:border-violet-400 rounded-lg p-2.5 text-xs text-[#1e293b] placeholder-slate-400 resize-none outline-none focus:ring-1 focus:ring-violet-100 transition-all font-normal shadow-sm"
                placeholder="Add a personal note or key takeaway..."
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-4 border-t border-slate-100 mt-2 px-1">
              <button 
                onClick={() => toggleSaveLinkDialog(false)} 
                className="text-xs text-slate-500 hover:text-[#1e293b] transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!url.trim() || createBookmarkMutation.isPending}
                className={`${styles.btnGradient} text-xs font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createBookmarkMutation.isPending ? 'Saving...' : 'Save to Workspace'}
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
