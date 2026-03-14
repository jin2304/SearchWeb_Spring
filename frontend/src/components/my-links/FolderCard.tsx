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
    bg: 'bg-blue-400',
    groupHover: 'group-hover:bg-blue-400'
  },
  purple: {
    bg: 'bg-purple-400',
    groupHover: 'group-hover:bg-purple-400'
  },
  green: {
    bg: 'bg-green-400',
    groupHover: 'group-hover:bg-green-400'
  },
  amber: {
    bg: 'bg-amber-400',
    groupHover: 'group-hover:bg-amber-400'
  },
  rose: {
    bg: 'bg-rose-400',
    groupHover: 'group-hover:bg-rose-400'
  },
  indigo: {
    bg: 'bg-indigo-400',
    groupHover: 'group-hover:bg-indigo-400'
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
