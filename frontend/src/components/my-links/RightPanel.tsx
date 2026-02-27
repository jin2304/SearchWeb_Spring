import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useFolders } from '@/lib/api/folderApi';

// Mock Data
const MOCK_LINKS = [
  {
    id: '1',
    title: 'Statista: Global User Growth',
    iconText: 'St',
    iconColor: 'bg-indigo-100 text-indigo-600',
    tags: ['#Data', '#Trends'],
    note: 'Q3 글로벌 유저 성장률 지표 정리. 특히 북미 시장 데이터 중점 확인 필요.',
    time: '2m ago'
  },
  {
    id: '2',
    title: 'Competitor Analysis Q3',
    icon: 'pie_chart',
    iconColor: 'bg-green-100 text-green-600',
    tags: ['#Competitor'],
    note: '경쟁사 A, B의 주요 기능 비교 및 SWOT 분석 문서. 다음 주 팀 미팅 때 참고.',
    time: '4h ago'
  },
  {
    id: '3',
    title: 'Hotjar Heatmaps Export',
    iconText: 'Hj',
    iconColor: 'bg-orange-100 text-orange-600',
    tags: ['#UserJourney', '#UX'],
    note: '장바구니 화면 이탈률 분석 자료. 결제 버튼 위치 수정안 반영 필요함.',
    time: 'Yesterday'
  },
  {
    id: '4',
    title: 'User Persona Drafts',
    icon: 'description',
    iconColor: 'bg-blue-100 text-blue-600',
    tags: ['#UserJourney'],
    note: '마케팅 타겟 유저 페르소나 정리안. 20대 여성 타겟층 분석 자료 위주.',
    time: '2d ago'
  }
];

function LinkItem({ 
  data, 
  isBulkEditMode,
  isSelected,
  onToggleSelect 
}: { 
  data: typeof MOCK_LINKS[0];
  isBulkEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(data.note);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditComplete = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleEditComplete();
    }
  };

  return (
    <div 
      className={`group relative flex items-center p-3 rounded-xl transition-all cursor-pointer border ${isBulkEditMode && isSelected ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : 'border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
      onClick={() => {
        if (isBulkEditMode && onToggleSelect) {
          onToggleSelect(data.id);
        }
      }}
    >
      
      {/* Bulk Edit Checkbox */}
      {isBulkEditMode && (
        <div className="mr-3 shrink-0 flex items-center">
          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-500 border-purple-500 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
            {isSelected && <span className="material-symbols-outlined !text-[12px] font-bold">check</span>}
          </div>
        </div>
      )}

      <div className={`h-8 w-8 rounded-lg ${data.iconColor} flex items-center justify-center flex-shrink-0 text-xs font-bold shrink-0`}>
        {data.icon ? <span className="material-symbols-outlined text-base">{data.icon}</span> : data.iconText}
      </div>
      <div className="ml-3 w-[200px] shrink-0 flex flex-col justify-center h-full">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="text-[11px] font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">{data.title}</h4>
        </div>
        <div className="flex flex-wrap gap-1">
          {data.tags.map((tag, idx) => (
            <span key={idx} className="text-[8.5px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="flex-1" />

      <div className="absolute left-[240px] right-16 flex items-center justify-end pointer-events-none">
        <div className={`transition-all duration-300 ease-out flex items-center gap-1.5 text-gray-400 dark:text-gray-500 max-w-[240px] pointer-events-auto
          ${isEditing ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isEditing) setIsEditing(true);
          }}
        >
          {isEditing ? (
            <span
              className="material-symbols-outlined !text-[14px] shrink-0 text-gray-400 hover:text-indigo-500 transition-all mt-[3px] ml-0.5 cursor-pointer opacity-70 hover:opacity-100 hover:scale-110 active:scale-95"
              style={{ fontVariationSettings: "'wght' 300" }} // Thinner icon
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                setNoteContent(data.note);
                setIsEditing(false);
              }}
              title="Cancel editing"
            >close</span>
          ) : (
            <span 
              className="material-symbols-outlined !text-[14px] shrink-0 hover:text-indigo-500 transition-colors mt-0.5"
              style={{ fontVariationSettings: "'wght' 300" }}
            >edit_note</span>
          )}
          {isEditing ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="w-[220px] text-[10px] font-medium leading-snug bg-transparent border-b border-indigo-300 dark:border-indigo-500/50 outline-none text-gray-900 dark:text-gray-100 py-0.5 resize-none overflow-hidden focus:border-indigo-500 transition-colors"
              rows={2}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <p className="w-[220px] text-[10px] font-medium line-clamp-2 leading-snug hover:text-gray-600 dark:hover:text-gray-300 py-0.5">{noteContent}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 ml-4 flex items-center justify-end w-8 relative" ref={dropdownRef}>
        {!isBulkEditMode && (
          <span className={`text-[8px] text-gray-400 whitespace-nowrap transition-opacity duration-200 absolute right-0 pointer-events-none ${isDropdownOpen ? 'opacity-0' : 'group-hover:opacity-0'}`}>
            {data.time}
          </span>
        )}
        <button 
          className={`p-0.5 mt-0.5 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all absolute right-[-2px] ${isDropdownOpen ? 'opacity-100 bg-gray-100 dark:bg-gray-800' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          title="More actions"
        >
          <span 
            className="material-symbols-outlined !text-[14px] block"
            style={{ fontVariationSettings: "'wght' 300" }}
          >more_horiz</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && !isBulkEditMode && (
          <div className="absolute right-0 top-full mt-1 w-24 bg-white dark:bg-gray-800 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 py-1 z-20 flex flex-col">
            <button 
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-blue-500 transition-colors text-left"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                setIsEditing(true);
              }}
            >
              <span className="material-symbols-outlined !text-[13px]" style={{ fontVariationSettings: "'wght' 300" }}>edit</span>
              Edit 
            </button>
            <button 
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                // TODO: Delete logic
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

export function RightPanel() {
  const { rightPanelOpen } = useUIStore();
  const { data: myFolders, isLoading: isFoldersLoading } = useFolders(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'a-z'>('newest');

  // Bulk Edit States
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Mock Folders for Move Modal
  const MOCK_FOLDERS = [
    { id: 'f1', name: 'Design Assets', icon: 'palette', color: 'bg-blue-500' },
    { id: 'f2', name: 'Reading List', icon: 'menu_book', color: 'bg-indigo-500' },
    { id: 'f3', name: 'Projects', icon: 'work', color: 'bg-teal-500' },
    { id: 'f4', name: 'Inspiration', icon: 'star', color: 'bg-amber-500' },
    { id: 'f5', name: 'Resources', icon: 'article', color: 'bg-emerald-500' },
  ];

  // Mock available tags
  const AVAILABLE_TAGS = [
    '#UserJourney', '#Competitor', '#Data', '#Trends', '#UX', '#Development', '#Design'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    if (isTagDropdownOpen || isSortDropdownOpen || isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen, isSortDropdownOpen, isMoreMenuOpen]);

  // Filter links based on selected tags
  let filteredLinks = selectedTags.length > 0 
    ? MOCK_LINKS.filter(link => link.tags.some(tag => selectedTags.includes(tag)))
    : [...MOCK_LINKS];

  // Sort links
  filteredLinks.sort((a, b) => {
    if (sortOption === 'oldest') {
      return Number(a.id) - Number(b.id);
    } else if (sortOption === 'a-z') {
      return a.title.localeCompare(b.title);
    }
    // newest (default)
    return Number(b.id) - Number(a.id);
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleLinkSelection = (id: string) => {
    setSelectedLinkIds(prev => 
      prev.includes(id) ? prev.filter(linkId => linkId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinkIds.length === filteredLinks.length) {
      setSelectedLinkIds([]);
    } else {
      setSelectedLinkIds(filteredLinks.map(link => link.id));
    }
  };

  const exitBulkMode = () => {
    setIsBulkEditMode(false);
    setSelectedLinkIds([]);
  };

  if (!rightPanelOpen) return null;

  return (
    <aside className="w-[700px] shrink-0 bg-white dark:bg-card-dark border-l border-gray-200 dark:border-gray-800 hidden xl:flex flex-col h-full shadow-lg z-10 transition-all duration-300 relative">
      
      {/* Top Header & Tags */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 bg-white dark:bg-card-dark sticky top-0 z-[15]">
        
        {/* Row 1: Title & Actions */}
        <div className="flex justify-between items-start">
          {/* Left: Title and Count */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-md flex items-center justify-center w-8 h-8">
                <span className="material-symbols-outlined text-[16px] block">folder_open</span>
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Market Research</h2>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{filteredLinks.length} Links</p>
          </div>

          {/* Right: Action Buttons & Search */}
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Tags Dropdown */}
            <div className="relative" ref={tagDropdownRef}>
              <button 
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className={`group flex items-center gap-1 px-2 py-1 border rounded-md text-[10px] font-medium transition-all duration-200 ${selectedTags.length > 0 ? 'bg-purple-50/50 border-purple-200/50 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800/50 dark:text-purple-300 shadow-sm' : 'bg-white/50 dark:bg-card-dark border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-purple-50/30 hover:border-purple-200/50 dark:hover:bg-gray-800/80 hover:shadow-sm'}`}
              >
                <span className={`material-symbols-outlined !text-[12px] transition-colors ${selectedTags.length > 0 ? 'text-purple-500' : 'text-gray-400 group-hover:text-purple-400'}`}>sell</span>
                <span>Tags {selectedTags.length > 0 && <span className="ml-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 px-1 py-0.5 rounded-sm text-[8px] font-bold">{selectedTags.length}</span>}</span>
                <span className={`material-symbols-outlined !text-[12px] text-gray-400 transition-transform duration-200 ${isTagDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {isTagDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100/50 dark:border-gray-700/50 py-1.5 z-30 flex flex-col max-h-[300px] overflow-y-auto origin-top-left animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-3.5 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100/50 dark:border-gray-700/50 mb-1.5 flex items-center gap-1.5">
                    <span className="font-extrabold text-[12px] text-purple-400 leading-none mb-0.5">#</span>
                    Select Tags
                  </div>
                  {AVAILABLE_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left w-full"
                        onClick={() => toggleTag(tag)}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {isSelected && <span className="material-symbols-outlined !text-[10px] font-bold">check</span>}
                        </div>
                        <span className={isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}>{tag}</span>
                      </button>
                    );
                  })}
                  {selectedTags.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-gray-100/50 dark:border-gray-700/50">
                      <button 
                        className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 py-2 font-medium transition-all"
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
            
            {/* Sort by Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button 
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className={`group flex items-center gap-1 px-2 py-1 border rounded-md text-[10px] font-medium transition-all duration-200 ${isSortDropdownOpen ? 'bg-purple-50/50 border-purple-200/50 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800/50 dark:text-purple-300 shadow-sm' : 'bg-white/50 dark:bg-card-dark border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-purple-50/30 hover:border-purple-200/50 dark:hover:bg-gray-800/80 hover:shadow-sm'}`}
              >
                <span className={`material-symbols-outlined !text-[12px] transition-colors ${isSortDropdownOpen ? 'text-purple-500' : 'text-gray-400 group-hover:text-purple-400'}`}>sort</span>
                <span>Sort by: {sortOption === 'newest' ? 'Newest' : sortOption === 'oldest' ? 'Oldest' : 'A-Z'}</span>
                <span className={`material-symbols-outlined !text-[12px] text-gray-400 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {isSortDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-36 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100/50 dark:border-gray-700/50 py-1.5 z-30 flex flex-col origin-top-left animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-3.5 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100/50 dark:border-gray-700/50 mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined !text-[12px] text-purple-400">sort</span>
                    Sort Options
                  </div>
                  {[
                    { id: 'newest', label: 'Newest First', icon: 'schedule' },
                    { id: 'oldest', label: 'Oldest First', icon: 'history' },
                    { id: 'a-z', label: 'A to Z', icon: 'sort_by_alpha' }
                  ].map(option => {
                    const isSelected = sortOption === option.id;
                    return (
                      <button
                        key={option.id}
                        className="group flex items-center gap-2.5 px-3.5 py-2 text-[10px] font-medium hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-left w-full relative"
                        onClick={() => {
                          setSortOption(option.id as any);
                          setIsSortDropdownOpen(false);
                        }}
                      >
                        <span className={`material-symbols-outlined !text-[14px] transition-colors duration-200 ${isSelected ? 'text-purple-500' : 'text-gray-400 group-hover:text-purple-400'}`}>{option.icon}</span>
                        <span className={`transition-colors duration-200 ${isSelected ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'}`}>{option.label}</span>
                        {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-purple-500 rounded-r-full" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-md w-[110px]">
              <span className="material-symbols-outlined !text-[12px] text-gray-400">search</span>
              <input 
                type="text" 
                placeholder="Search link" 
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-[9px] text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full p-0 h-4"
              />
            </div>

            {/* More button dropdown */}
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

        {/* Row 2: Selected Tags & Sort Icon (Always keeps space) */}
        <div className="flex justify-between items-center mt-1 min-h-[28px]">
          <div className="w-full flex flex-wrap gap-1.5 items-center">
            {selectedTags.length > 0 ? (
              <>
                {selectedTags.map((tag, idx) => (
                  <span key={idx} className="group inline-flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-md text-[9px] font-medium bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50 whitespace-nowrap transition-colors animate-in fade-in zoom-in duration-500">
                    {tag}
                    <button 
                      onClick={() => toggleTag(tag)}
                      className="flex items-center justify-center rounded-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors opacity-70 hover:opacity-100"
                    >
                      <span className="material-symbols-outlined !text-[11px]">close</span>
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
            <span className="material-symbols-outlined !text-[14px]">swap_vert</span>
          </button>
        </div>
      </div>

      {/* Recent Links / Activity List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredLinks.length > 0 ? (
          filteredLinks.map(link => (
            <LinkItem 
              key={link.id} 
              data={link} 
              isBulkEditMode={isBulkEditMode}
              isSelected={selectedLinkIds.includes(link.id)}
              onToggleSelect={toggleLinkSelection}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
            <span className="material-symbols-outlined text-3xl opacity-50">search_off</span>
            <p className="text-xs font-medium">No links match selected tags</p>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {isBulkEditMode && (
        <div className="absolute bottom-6 left-1/2 w-max -translate-x-1/2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(168,85,247,0.3)] dark:shadow-[0_8px_30px_rgba(168,85,247,0.4)] ring-2 ring-purple-200/80 dark:ring-purple-700/60 px-3.5 py-2 flex items-center gap-3 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSelectAll}
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${selectedLinkIds.length === filteredLinks.length && filteredLinks.length > 0 ? 'bg-purple-500 border-purple-500 text-white shadow-sm' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}
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
              className="px-2.5 py-1.5 flex items-center gap-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-[10px] font-medium"
            >
              <span className="material-symbols-outlined !text-[14px]">delete</span>
              Delete
            </button>
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button 
              onClick={exitBulkMode}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined !text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-[420px] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.01),0_0_1px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Header styled like SaveLinkDialog */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-3 z-10 border-b border-gray-100 dark:border-gray-800/50">
              <div className="text-lg font-extrabold text-[#1e293b] dark:text-gray-100 tracking-tight flex items-center gap-2.5">
                <div className="bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] p-1.5 rounded-lg shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30 flex items-center justify-center ring-1 ring-white/20">
                  <span className="material-symbols-outlined text-white !text-[18px] fill-1 drop-shadow-sm">drive_file_move</span>
                </div>
                <span>Move Links</span>
                <span className="text-[11px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0.5 rounded-md ml-1">{selectedLinkIds.length} items</span>
              </div>
              <button 
                onClick={() => setIsMoveModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined !text-[18px]">close</span>
              </button>
            </div>
            
            <div className="p-2 overflow-y-auto flex-1 space-y-4 min-h-[200px] max-h-[400px] custom-scrollbar bg-[#fafafa] dark:bg-gray-800/50">
              
              {/* Pinned Section */}
              <div>
                <div className="px-3 py-2 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[14px] text-[#7c3aed]">push_pin</span>
                  Pinned Folders
                </div>
                <div className="space-y-0.5 px-1.5">
                  {MOCK_FOLDERS.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setIsMoveModalOpen(false);
                        exitBulkMode();
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all text-left group bg-white/50"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${folder.color} shrink-0`}>
                        <span className="material-symbols-outlined !text-[18px]">{folder.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-slate-700 dark:text-gray-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                          {folder.name}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-transparent group-hover:text-violet-500 transition-colors !text-[18px] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 duration-200 mr-1">check_circle</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* All Folders Section */}
              <div className="pt-1 pb-2">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-[14px] text-[#7c3aed]">folder</span>
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
                        onClick={() => {
                          setIsMoveModalOpen(false);
                          exitBulkMode();
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all text-left group bg-white/50"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 shrink-0 bg-slate-100 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                          <span className="material-symbols-outlined !text-[18px]">folder_open</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-slate-600 dark:text-gray-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                            {folder.folderName}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-transparent group-hover:text-violet-500 transition-colors !text-[18px] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 duration-200 mr-1">check_circle</span>
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
