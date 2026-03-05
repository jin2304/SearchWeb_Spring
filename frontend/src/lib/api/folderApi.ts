import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from './fetchClient';
import type { FolderResponse, CreateFolderRequest } from '@/lib/types/folder';


/**
 * 루트 폴더 목록을 백엔드에서 가져옵니다.
 * GET /api/folders/owners/{ownerMemberId}/root
 */
async function fetchRootFolders(ownerMemberId: number): Promise<FolderResponse[]> {
  return fetchClient<FolderResponse[]>(`/api/folders/owners/${ownerMemberId}/root`);
}

/**
 * 새로운 폴더를 생성합니다.
 * POST /api/folders
 */
async function createFolder(data: CreateFolderRequest): Promise<number> {
  return fetchClient<number>('/api/folders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 특정 폴더를 삭제합니다.
 * DELETE /api/folders/{folderId}
 */
async function deleteFolder(folderId: number): Promise<void> {
  return fetchClient<void>(`/api/folders/${folderId}`, {
    method: 'DELETE',
  });
}


// ──────────────────────────────────────────────
// React Query Hooks (UI 연동)
// ──────────────────────────────────────────────

/**
 * [조회 Hook] 특정 사용자의 루트 폴더 목록을 가져옵니다.
 * @param ownerMemberId 사용자 ID
 */
export function useFolders(ownerMemberId: number) {
  return useQuery({
    queryKey: ['folders', 'root', ownerMemberId],
    queryFn: () => fetchRootFolders(ownerMemberId),
  });
}

/**
 * [생성 Hook] 새로운 폴더를 생성합니다.
 * 성공 시 'folders' 캐시를 무효화하여 목록을 자동 갱신합니다.
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

/**
 * [삭제 Hook] 특정 폴더를 삭제합니다.
 * 성공 시 'folders' 캐시를 무효화하여 목록을 자동 갱신합니다.
 */
export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}


