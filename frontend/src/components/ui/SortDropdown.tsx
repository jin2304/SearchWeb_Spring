import React from 'react';
import { cn } from '@/lib/utils';

export interface SortOption {
  id: string;
  label: string;
  icon: string;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
  panelClassName?: string;
}

/**
 * 프로젝트 전반에서 사용되는 통일된 스타일의 정렬 드롭다운 컴포넌트.
 * RightPanel과 MyLinksPage의 스타일을 계승하며, backdrop-blur와 애니메이션을 포함합니다.
 */
export function SortDropdown({
  value,
  onChange,
  options,
  className = "",
  panelClassName = "",
}: SortDropdownProps) {
  const selectedOption = options.find(opt => opt.id === value) || options[0];

  return (
    <div className={cn("relative group", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        className="group flex items-center gap-1 px-2 py-1 border border-gray-200/60 dark:border-white/8 rounded-md text-[10px] font-medium transition-all duration-200 bg-white/50 dark:bg-slate-900/50 text-gray-600 dark:text-white hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:border-purple-200/50 dark:hover:border-purple-500/30"
      >
        <span className="material-symbols-outlined !text-[12px] text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">filter_list</span>
        <span>{selectedOption.label}</span>
        <span className="material-symbols-outlined !text-[12px] text-gray-400 dark:text-gray-500 transition-all duration-200 group-hover:text-purple-500 dark:group-hover:text-purple-400 group-focus-within:rotate-180">expand_more</span>
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-36 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-gray-100/50 dark:border-white/8 py-1.5 z-30 hidden group-focus-within:flex flex-col origin-top-right animate-in fade-in slide-in-from-top-1 duration-200",
          panelClassName
        )}
      >
        {options.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className="group/item flex items-center gap-2.5 px-3.5 py-2 text-[10px] font-medium hover:bg-purple-50/50 dark:hover:bg-purple-600/20 transition-all text-left w-full relative"
            >
              <span className={`material-symbols-outlined !text-[14px] transition-colors duration-200 ${isSelected ? 'text-purple-500' : 'text-gray-400 group-hover/item:text-purple-400 dark:text-gray-500 dark:group-hover/item:text-purple-400'}`}>
                {option.icon}
              </span>
              <span className={`transition-colors duration-200 ${isSelected ? 'text-purple-600 dark:text-purple-400 font-semibold' : 'text-gray-600 dark:text-white group-hover/item:text-gray-900 dark:group-hover/item:text-white'}`}>
                {option.label}
              </span>
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-purple-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
