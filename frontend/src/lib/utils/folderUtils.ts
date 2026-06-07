import { FOLDER_TYPE, type FolderResponse } from '@/lib/types/folder';

/**
 * 미분류(UNORGANIZED) 폴더를 항상 최상단에 배치하고, 
 * 그 외의 폴더들은 선택된 정렬 방식에 따라 정렬하는 비교 함수입니다.
 */
export const compareFolders = (a: FolderResponse, b: FolderResponse, sortType?: string) => {
  if (sortType === 'recently') return b.memberFolderId - a.memberFolderId;
  if (sortType === 'a-z') return a.folderName.localeCompare(b.folderName);
  if (sortType === 'count') {
    const countDiff = (b.bookmarkCount || 0) - (a.bookmarkCount || 0);
    if (countDiff !== 0) return countDiff;
    return b.memberFolderId - a.memberFolderId; // 개수가 같으면 최근 생성 순
  }
  
  return 0;
};
