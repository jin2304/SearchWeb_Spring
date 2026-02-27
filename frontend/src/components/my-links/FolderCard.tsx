'use client';

import { Folder } from 'lucide-react';

interface FolderCardProps {
  name: string;
  count: number;
  color?: string;
  icon?: React.ReactNode;
}

export function FolderCard({ name, count, color = 'bg-blue-500', icon }: FolderCardProps) {
  return (
    <div className="group relative flex flex-col justify-between p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden min-h-[120px]">
      
      {/* Background Decorative Element */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] ${color}`} />
      
      <div className="flex items-center justify-between z-10">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50 text-muted-foreground group-hover:${color} group-hover:text-white transition-colors`}>
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
