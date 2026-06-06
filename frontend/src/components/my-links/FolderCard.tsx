'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FOLDER_TYPE, type FolderResponse } from '@/lib/types/folder';
import { useFolderStore } from '@/lib/store/folderStore';
import { useLinkStore } from '@/lib/store/linkStore';
import { useUIStore } from '@/lib/store/uiStore';
import { FolderEditModal, FolderDeleteModal, FolderMoveModal } from './FolderManagementModals';

interface FolderCardProps {
  folder: FolderResponse;
  color?: string;
}

const MENU_OFFSET_Y = 4; // 버튼과 메뉴 사이의 상하 간격

export function FolderCard({ folder, color }: FolderCardProps) {
  const setSelectedFolderId = useFolderStore((s) => s.setSelectedFolderId);
  const currentSelectedFolderId = useFolderStore((s) => s.selectedFolderId);
  const searchQuery = useFolderStore((s) => s.searchQuery);
  const setLinkSearchQuery = useLinkStore((s) => s.setSearchQuery);
  const [showMenu, setShowMenu] = useState(false); // 드롭다운 메뉴 표시 여부
  const [modalType, setModalType] = useState<'edit' | 'delete' | 'move' | null>(null); // 현재 열린 모달 타입
  // 시스템 폴더(미분류)는 Move/Delete 불가 (Rename 만 허용)
  const isSystemFolder = folder.folderType === FOLDER_TYPE.UNORGANIZED;
  
  // DOM 참조 (메뉴 외부 클릭 감지 및 위치 계산용)
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // 드롭다운 메뉴의 절대 좌표 상태
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // 메뉴 외부 클릭 시 메뉴를 닫는 로직
  useEffect(() => {
    if (!showMenu) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // 메뉴 버튼이나 메뉴 본체를 클릭한 게 아니라면 메뉴를 닫음
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return;
      }
      setShowMenu(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // 메뉴 표시 시 버튼의 현재 위치를 계산하여 좌표 설정
  useEffect(() => {
    if (!showMenu) return;

    const updateMenuPosition = () => {
      if (!menuButtonRef.current) return;

      // 버튼의 화면상 절대 위치를 가져옴
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + MENU_OFFSET_Y, // 버튼 바로 아래에 위치하도록 계산
        left: rect.left, // 버튼의 왼쪽 끝에 맞춤 (오른쪽으로 확장됨)
      });
    };

    updateMenuPosition();
    // 윈도우 크기 조절이나 스크롤 시 메뉴 위치를 재계산 (포탈 특성상 필요)
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [showMenu]);

  // 카드 클릭 시 폴더 선택 처리 (메뉴가 열려있지 않을 때만)
  const handleCardClick = () => {
    if (!showMenu) {
      // 1. 이미 선택된 폴더를 다시 클릭하면 선택 해제, 아니면 해당 폴더 선택
      if (currentSelectedFolderId === folder.memberFolderId) {
        setSelectedFolderId(null);
      } else {
        setSelectedFolderId(folder.memberFolderId);
        
        // 2. 선택 시에만 수행: 기존 폴더 검색어가 있다면 링크 검색어로 전이
        if (searchQuery) {
          setLinkSearchQuery(searchQuery);
        }
        
        // 3. 선택 시에만 수행: 우측 패널이 닫혀있다면 자동으로 열어줌
        useUIStore.getState().toggleRightPanel(true);
      }
    }
  };

  // 메뉴 버튼 토글 (이벤트 전파 방지 포함)
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  // 메뉴 항목 클릭 시 모달 열기 및 메뉴 닫기
  const handleMenuItemClick = (type: 'edit' | 'delete' | 'move', e: React.MouseEvent) => {
    e.stopPropagation();
    // 시스템 폴더는 Move/Delete 를 허용하지 않음
    if (isSystemFolder && (type === 'move' || type === 'delete')) {
      return;
    }
    setModalType(type);
    setShowMenu(false);
  };

  const isSelected = currentSelectedFolderId === folder.memberFolderId;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={`bg-white dark:bg-card-dark rounded-lg p-2.5 border transition-all duration-300 group cursor-pointer h-[90px] flex flex-col justify-between outline-none relative overflow-visible ${
          isSelected 
            ? 'border-purple-500 bg-purple-50/40 dark:border-purple-400 dark:bg-purple-500/10 shadow-sm hover:bg-purple-50/40 dark:hover:bg-purple-500/10' 
            : 'border-gray-200/70 dark:border-white/5 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-white/10 hover:bg-purple-50/30 dark:hover:bg-white/[0.03]'
        } ${color || ''}`}
      >
        <div className="flex justify-between items-start">
          <div className={`p-1.5 bg-purple-50 dark:bg-white/5 text-gray-400 dark:text-gray-400 group-hover:dark:text-white transition-colors rounded-md flex items-center justify-center w-8 h-8`}>
            <span className="material-symbols-outlined text-[16px]">folder_open</span>
          </div>

          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              type="button"
              className="text-gray-300 dark:text-gray-600 hover:text-purple-500 dark:hover:text-purple-400 transition-colors h-5 w-5 flex items-center justify-center"
            >
              <span
                className="material-symbols-outlined !text-[18px] !leading-none"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
              >
                more_horiz
              </span>
            </button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-[10px] xl:text-[11px] text-gray-800 dark:text-white truncate mt-1.5">
            {folder.folderName}
          </h4>
        </div>
      </div>

      {/* ── 드롭다운 메뉴 (Portal을 사용하여 최상단 layer에서 렌더링) ── */}
      {/* 팁: overflow-hidden 속성이 있는 카드 밖으로 메뉴가 잘리지 않도록 Portal을 사용합니다. */}
      {showMenu && menuPosition && createPortal(
        <div
          ref={menuRef}
          className="fixed w-28 bg-white dark:bg-slate-950 border border-gray-100 dark:border-white/8 shadow-xl rounded-lg py-1 z-popover animate-in fade-in slide-in-from-top-1 duration-150"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button
            onClick={(e) => handleMenuItemClick('edit', e)}
            className="w-full text-left px-3 py-2 text-[11px] text-gray-700 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-600/20 flex items-center gap-2.5 transition-colors"
          >
            <span className="material-symbols-outlined !text-[16px] !leading-none">edit</span>
            <span className="font-medium">Rename</span>
          </button>
          <button
            onClick={(e) => handleMenuItemClick('move', e)}
            disabled={isSystemFolder}
            className="w-full text-left px-3 py-2 text-[11px] text-gray-700 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-600/20 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined !text-[16px] !leading-none">drive_file_move</span>
            <span className="font-medium">Move</span>
          </button>
          <div className="h-px bg-gray-50 dark:bg-white/8 my-0.5" />
          <button
            onClick={(e) => handleMenuItemClick('delete', e)}
            disabled={isSystemFolder}
            className="w-full text-left px-3 py-2 text-[11px] text-rose-500 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-purple-600/20 flex items-center gap-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent"
          >
            <span className="material-symbols-outlined !text-[16px] !leading-none text-rose-500 dark:text-red-400">delete</span>
            <span className="font-medium">Delete</span>
          </button>
        </div>,
        document.body
      )}

      {modalType === 'edit' && (
        <FolderEditModal folder={folder} onClose={() => setModalType(null)} />
      )}
      {modalType === 'delete' && (
        <FolderDeleteModal folder={folder} onClose={() => setModalType(null)} />
      )}
      {modalType === 'move' && (
        <FolderMoveModal folder={folder} onClose={() => setModalType(null)} />
      )}
    </>
  );
}
