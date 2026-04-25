import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClient } from './fetchClient';
import type {
  BookmarkResponse,
  BookmarkSearchResponse,
  BookmarkSearchParams,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
} from '@/lib/types/bookmark';

/**
 * 북마크(링크) 목록 조회 (GET /api/bookmarks)
 * @param params 검색 필터 (폴더 ID, 정렬, 검색어 등)
 */
async function fetchBookmarks(params: BookmarkSearchParams): Promise<BookmarkSearchResponse> {
  const searchParams = new URLSearchParams();
  if (params.folderId != null) searchParams.set('folderId', String(params.folderId));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.query) searchParams.set('query', params.query);
  if (params.categoryId != null) searchParams.set('categoryId', String(params.categoryId));
  if (params.unreadOnly === true) searchParams.set('unreadOnly', 'true');

  const qs = searchParams.toString();
  return fetchClient<BookmarkSearchResponse>(`/api/bookmarks${qs ? `?${qs}` : ''}`);
}

/**
 * 북마크 생성 (POST /api/bookmarks)
 * @param data 북마크 생성 정보 (URL, 폴더 ID, 메모, 태그 등)
 */
async function createBookmark(data: CreateBookmarkRequest): Promise<number> {
  return fetchClient<number>('/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 북마크 정보 수정 (PUT /api/bookmarks/{bookmarkId})
 * @param bookmarkId 수정할 북마크 ID
 * @param data 수정할 내용
 */
async function updateBookmark({ bookmarkId, ...data }: UpdateBookmarkRequest & { bookmarkId: number }): Promise<number> {
  return fetchClient<number>(`/api/bookmarks/${bookmarkId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 북마크 삭제 (DELETE /api/bookmarks/{bookmarkId})
 * @param bookmarkId 삭제할 북마크 ID
 */
async function deleteBookmark(bookmarkId: number): Promise<number> {
  return fetchClient<number>(`/api/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
  });
}

/**
 * 북마크 조회 기록 (PATCH /api/bookmarks/{bookmarkId}/read)
 * - 서버에서 view_count += 1, last_viewed_at = now() 처리
 */
async function recordBookmarkView(bookmarkId: number): Promise<void> {
  await fetchClient<void>(`/api/bookmarks/${bookmarkId}/read`, {
    method: 'PATCH',
  });
}

/**
 * URL 분석 (GET /api/bookmarks/analyze)
 * @param url 분석할 URL
 */
async function analyzeUrl(url: string): Promise<string> {
  const searchParams = new URLSearchParams({ url });
  return fetchClient<string>(`/api/bookmarks/analyze?${searchParams.toString()}`);
}

// ──────────────────────────────────────────────
// React Query Hooks (UI 연동)
// ──────────────────────────────────────────────

/**
 * [조회 Hook] 북마크 목록을 가져오고 캐싱합니다.
 */
export function useBookmarks(params: BookmarkSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['bookmarks', params], // 검색 조건이 바뀌면 새로운 쿼리로 취급
    queryFn: () => fetchBookmarks(params),
    enabled: options?.enabled,
  });
}

/**
 * [생성 Hook] 새로운 북마크를 생성합니다.
 * 성공 시 'bookmarks' 키를 가진 모든 캐시를 무효화하여 목록을 갱신합니다.
 */
export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookmark,
    onSuccess: () => {
      // 캐시 무효화: 목록 화면이 자동으로 다시 그려짐
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

/**
 * [수정 Hook] 기존 북마크 정보를 업데이트합니다.
 */
export function useUpdateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

/**
 * [삭제 Hook] 북마크를 삭제합니다.
 */
export function useDeleteBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

/**
 * [조회 기록 Hook] 북마크 열람 시 view_count 증가 및 읽음 처리.
 * 성공 시 'bookmarks' 캐시를 무효화하여 Unread 필터 목록 등이 자동 갱신됩니다.
 */
export function useRecordBookmarkView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordBookmarkView,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

/**
 * [분석 Hook] URL에서 제목을 추출합니다.
 */
export function useAnalyzeUrl() {
  return useMutation({
    mutationFn: analyzeUrl,
  });
}
