'use client';

import { Folder } from 'lucide-react';

interface FolderCardProps {
  name: string;
  count: number;
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'rose' | 'indigo';
  icon?: React.ReactNode;
}

const COLOR_MAPS = {
  blue: {
    bg: 'bg-blue-500',
    groupHover: 'group-hover:bg-blue-500'
  },
  purple: {
    bg: 'bg-purple-500',
    groupHover: 'group-hover:bg-purple-500'
  },
  green: {
    bg: 'bg-green-500',
    groupHover: 'group-hover:bg-green-500'
  },
  amber: {
    bg: 'bg-amber-500',
    groupHover: 'group-hover:bg-amber-500'
  },
  rose: {
    bg: 'bg-rose-500',
    groupHover: 'group-hover:bg-rose-500'
  },
  indigo: {
    bg: 'bg-indigo-500',
    groupHover: 'group-hover:bg-indigo-500'
  }
};

export function FolderCard({ name, count, color = 'blue', icon }: FolderCardProps) {
  const selectedColor = COLOR_MAPS[color];

  return (
    <div className="group relative flex flex-col justify-between p-4 bg-white dark:bg-card-dark rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden min-h-[120px]">
      
      {/* Background Decorative Element */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] ${selectedColor.bg}`} />
      
      <div className="flex items-center justify-between z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground ${selectedColor.groupHover} group-hover:text-white transition-colors`}>
          {icon || <Folder size={20} />}
        </div>
      </div>
      
      <div className="mt-4 z-10">
        <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{count} links</p>
      </div>

    </div>
  );
}
