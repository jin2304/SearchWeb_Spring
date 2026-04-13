'use client';

import React, { useState } from 'react';
import { useUpdateFolder, useDeleteFolder, useMoveFolder, useFolders } from '@/lib/api/folderApi';
import type { FolderResponse } from '@/lib/types/folder';
import { useAuthStore } from '@/lib/store/authStore';

interface EditModalProps {
  folder: FolderResponse;
  onClose: () => void;
}

export function FolderEditModal({ folder, onClose }: EditModalProps) {
  const [name, setName] = useState(folder.folderName);
  const updateFolder = useUpdateFolder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFolder.mutate({
      folderId: folder.memberFolderId,
      data: { folderName: name }
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Rename Folder</h3>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4 text-gray-900 dark:text-gray-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateFolder.isPending || !name.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50"
            >
              {updateFolder.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  folder: FolderResponse;
  onClose: () => void;
}

export function FolderDeleteModal({ folder, onClose }: DeleteModalProps) {
  const deleteFolder = useDeleteFolder();

  const handleDelete = () => {
    deleteFolder.mutate(folder.memberFolderId, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-rose-500 text-xl">delete_forever</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Delete Folder</h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to delete <span className="font-semibold text-rose-500">"{folder.folderName}"</span>?<br />
            All links inside this folder will be lost.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteFolder.isPending}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteFolder.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MoveModalProps {
  folder: FolderResponse;
  onClose: () => void;
}

export function FolderMoveModal({ folder, onClose }: MoveModalProps) {
  const memberId = useAuthStore((s) => s.member?.memberId);
  const { data: allFolders } = useFolders(memberId);
  const moveFolder = useMoveFolder();

  // 자기 자신이나 하위 폴더로는 이동할 수 없음 (현재는 1단계 구조라 단순 필터링 가능)
  // 부모 폴더가 현재와 같은 경우도 제외
  const targetFolders = allFolders?.filter(f => f.memberFolderId !== folder.memberFolderId && f.memberFolderId !== folder.parentFolderId) ?? [];

  const handleMove = (newParentId: number | null) => {
    if (moveFolder.isPending) return;
    moveFolder.mutate({
      folderId: folder.memberFolderId,
      data: { newParentFolderId: newParentId }
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Move Folder</h3>
        
        <div className={`max-h-60 overflow-y-auto mb-4 border border-gray-100 dark:border-gray-800 rounded-lg transition-opacity ${moveFolder.isPending ? 'pointer-events-none opacity-50' : ''}`}>
          {/* 최상위(Root)로 이동 옵션 */}
          {folder.parentFolderId !== null && (
            <button
              onClick={() => handleMove(null)}
              disabled={moveFolder.isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-left transition-colors border-b border-gray-50 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-gray-400 text-base">home</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Root Directory</p>
              </div>
            </button>
          )}

          {targetFolders.length === 0 && (
             <div className="p-8 text-center">
               <p className="text-[10px] text-gray-400">No other folders available to move.</p>
             </div>
          )}

          {targetFolders.map((target) => (
            <button
              key={target.memberFolderId}
              onClick={() => handleMove(target.memberFolderId)}
              disabled={moveFolder.isPending}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-left transition-colors border-b border-gray-50 last:border-0 dark:border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-purple-400 text-base">folder</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{target.folderName}</p>
              </div>
              <span className="material-symbols-outlined text-gray-300 text-[10px] text-right">chevron_right</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
