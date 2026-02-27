'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const COLORS = [
  { id: 'purple', base: 'bg-purple-500 hover:ring-purple-500', active: 'ring-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
  { id: 'blue', base: 'bg-blue-500 hover:ring-blue-500', active: 'ring-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  { id: 'teal', base: 'bg-teal-500 hover:ring-teal-500', active: 'ring-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' },
  { id: 'orange', base: 'bg-orange-500 hover:ring-orange-500', active: 'ring-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' },
  { id: 'pink', base: 'bg-pink-500 hover:ring-pink-500', active: 'ring-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]' },
];

const ICONS = ['folder', 'work', 'school', 'star', 'rocket_launch'];

export function CreateFolderDialog() {
  const { createFolderDialogOpen, toggleCreateFolderDialog } = useUIStore();
  const [folderName, setFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('work');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [isPinned, setIsPinned] = useState(true);

  return (
    <Dialog open={createFolderDialogOpen} onOpenChange={toggleCreateFolderDialog}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card-dark rounded-[16px] shadow-2xl p-0 overflow-hidden border border-gray-100 dark:border-gray-700 !gap-0 [&>button]:hidden">
        
        {/* SR Only Title for Accessibility */}
        <DialogTitle className="sr-only">Create New Folder</DialogTitle>

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[linear-gradient(135deg,#6d28d9_0%,#8b5cf6_50%,#a78bfa_100%)] p-1.5 rounded-lg shadow-lg shadow-violet-200/50 flex items-center justify-center ring-1 ring-white/20">
                <span className="material-symbols-outlined text-white !text-[18px] fill-1 drop-shadow-sm">folder</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Folder</h3>
            </div>
            <button 
              onClick={() => toggleCreateFolderDialog(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Folder Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Folder Name</label>
              </div>
              <input 
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-400" 
                placeholder="e.g., Design Resources"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>

            {/* Appearance */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Appearance</label>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 mb-3 font-medium">Select Icon</p>
                <div className="flex gap-2 mb-0 overflow-x-auto pt-1 pb-1">
                  {ICONS.map((iconStr) => {
                    const isActive = selectedIcon === iconStr;
                    return (
                      <button 
                        key={iconStr}
                        onClick={() => setSelectedIcon(iconStr)}
                        style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px' }}
                        className={`flex items-center justify-center rounded-lg transition-all shadow-sm flex-shrink-0 ${
                          isActive 
                            ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/20' 
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-400 hover:text-purple-500'
                        }`}
                      >
                        <span className="material-symbols-outlined !text-[18px] !leading-none">{iconStr}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Pin Settings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Pin Settings</label>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pin to Top</span>
                  <button 
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex-shrink-0 ${
                      isPinned ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`${isPinned ? 'translate-x-[18px]' : 'translate-x-[2px]'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}></span>
                  </button>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-3 font-medium">Select Color</p>
                  <div className="flex gap-3">
                    {COLORS.map((c) => {
                      const isActive = selectedColor === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedColor(c.id)}
                          className={`w-6 h-6 rounded-full flex-shrink-0 transition-all dark:ring-offset-gray-800 ring-offset-2 ${c.base} ${
                            isActive ? `ring-2 ${c.active}` : 'opacity-60 hover:opacity-100 hover:ring-2'
                          }`}
                        ></button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end items-center gap-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            type="button"
            onClick={() => toggleCreateFolderDialog(false)}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-200"
          >
            Create Folder
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
