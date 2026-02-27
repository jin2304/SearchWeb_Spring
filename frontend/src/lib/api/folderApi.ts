import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, FolderResponse } from '@/lib/types/folder';

// ──────────────────────────────────────
// API 호출 함수 (fetch 래퍼)
// ──────────────────────────────────────

/**
 * 루트 폴더 목록을 백엔드에서 가져옵니다.
 * 
 * [백엔드 매핑]
 *   Controller : MemberFolderController.listRoot()
 *   URL        : GET /api/folders/owners/{ownerMemberId}/root
 *   응답       : ApiResponse<List<MemberFolderResponses>>
 */
async function fetchRootFolders(ownerMemberId: number): Promise<FolderResponse[]> {
  const response = await fetch(`/api/folders/owners/${ownerMemberId}/root`);

  if (!response.ok) {
    throw new Error(`폴더 목록 조회 실패 (HTTP ${response.status})`);
  }

  const json: ApiResponse<FolderResponse[]> = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? '알 수 없는 에러');
  }

  return json.data;
}

// ──────────────────────────────────────
// React Query 커스텀 Hook
// ──────────────────────────────────────

/**
 * 루트 폴더 목록을 가져오는 Hook.
 * 
 * 사용법:
 *   const { data: folders, isLoading, error } = useFolders(1);
 * 
 * @param ownerMemberId 폴더 소유자의 memberId (추후 로그인 사용자 ID로 대체)
 */
export function useFolders(ownerMemberId: number) {
  return useQuery({
    queryKey: ['folders', 'root', ownerMemberId],
    queryFn: () => fetchRootFolders(ownerMemberId),
  });
}
