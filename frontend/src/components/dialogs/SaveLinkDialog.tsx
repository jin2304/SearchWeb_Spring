'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

export function SaveLinkDialog() {
  const { saveLinkDialogOpen, toggleSaveLinkDialog } = useUIStore();
  const [tagInput, setTagInput] = useState('');
  const [openTagPopover, setOpenTagPopover] = useState(false);
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
  const [newTagInputValue, setNewTagInputValue] = useState('');

  // 임시 태그 목록
  const existingTagsList = ["Inspiration", "Development", "Productivity", "Marketing"];

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
              <div className="relative group">
                <input 
                  className={styles.minimalInput} 
                  readOnly 
                  type="text" 
                  value="https://example.com/modern-ui-design-trends-2024" 
                />
              </div>
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
                <div className={`${styles.folderTile} ${styles.folderTileActive} group`}>
                  <div className={styles.matchBadge}>Recommend</div>
                  <span className="material-symbols-outlined !text-[20px] mb-0.5 text-violet-600 drop-shadow-sm">design_services</span>
                  <span className="text-[10px] font-bold text-violet-900 leading-tight">Design Trends</span>
                </div>
                <div className={`${styles.folderTile} group`}>
                  <span className="material-symbols-outlined !text-[20px] text-slate-400 group-hover:text-violet-500 mb-0.5 transition-colors">library_books</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-800 font-medium leading-tight">Reading List</span>
                </div>
                <div className={`${styles.folderTile} group`}>
                  <span className="material-symbols-outlined !text-[20px] text-slate-400 group-hover:text-violet-500 mb-0.5 transition-colors">work_outline</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-800 font-medium leading-tight">Projects</span>
                </div>
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
                <div className={`${styles.tagChip} ${styles.tagChipSelected}`}>UI/UX</div>
                <div className={`${styles.tagChip} ${styles.tagChipSelected}`}>Modernism</div>
                <div className={`${styles.tagChip} ${styles.tagChipExisting}`}>Web Design</div>
                <div className={`${styles.tagChip} ${styles.tagChipExisting}`}>2024 Trends</div>
                <div className={`${styles.tagChip} ${styles.tagChipExisting}`}>Minimalism</div>
                
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
                  <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
                    <PopoverTrigger asChild>
                      <button className={`${styles.tagAddTrigger} focus:ring-2 focus:ring-violet-200 focus:border-violet-400`}>
                        <span className="material-symbols-outlined !text-[14px]">add</span> Add tag...
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[200px] p-2 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-slate-100 z-50" 
                      align="start" 
                      sideOffset={6}
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

                    <div className="mt-2 flex flex-col gap-0.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                      {existingTagsList.filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase())).map(tag => (
                        <div 
                          key={tag} 
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-50 text-[#1e293b] font-medium text-[11px] cursor-pointer transition-colors"
                          onClick={() => {
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
              <button className={`${styles.btnGradient} text-xs font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0`}>
                Save to Workspace
              </button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
