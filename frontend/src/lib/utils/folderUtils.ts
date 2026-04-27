import { FOLDER_TYPE, type FolderResponse } from '@/lib/types/folder';

/**
 * 미분류(UNORGANIZED) 폴더를 항상 최상단에 배치하고, 
 * 그 외의 폴더들은 선택된 정렬 방식에 따라 정렬하는 비교 함수입니다.
 */
export const compareFolders = (a: FolderResponse, b: FolderResponse, sortType?: string) => {
  if (a.folderType === FOLDER_TYPE.UNORGANIZED && b.folderType !== FOLDER_TYPE.UNORGANIZED) return -1;
  if (b.folderType === FOLDER_TYPE.UNORGANIZED && a.folderType !== FOLDER_TYPE.UNORGANIZED) return 1;
  
  if (sortType === 'recently') return b.memberFolderId - a.memberFolderId;
  if (sortType === 'a-z') return a.folderName.localeCompare(b.folderName);
  
  return 0;
};
