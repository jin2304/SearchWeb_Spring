import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from './fetchClient';
import type { TagResponse, CreateTagRequest } from '@/lib/types/tag';


/**
 * 특정 사용자의 태그 목록을 가져옵니다.
 * GET /api/tags/owners/{ownerMemberId}
 */
async function fetchTags(ownerMemberId: number): Promise<TagResponse[]> {
  return fetchClient<TagResponse[]>(`/api/tags/owners/${ownerMemberId}`);
}

/**
 * 새로운 태그를 생성합니다.
 * POST /api/tags
 */
async function createTag(data: CreateTagRequest): Promise<number> {
  return fetchClient<number>('/api/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────────
// React Query Hooks (UI 연동)
// ──────────────────────────────────────────────

/**
 * [조회 Hook] 특정 사용자의 태그 목록을 가져옵니다.
 */
export function useTags(ownerMemberId: number) {
  return useQuery({
    queryKey: ['tags', ownerMemberId],
    queryFn: () => fetchTags(ownerMemberId),
  });
}

/**
 * [생성 Hook] 새로운 태그를 생성합니다.
 * 성공 시 'tags' 캐시를 무효화하여 목록을 자동 갱신합니다.
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}


