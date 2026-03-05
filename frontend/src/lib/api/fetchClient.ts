import type { ApiResponse } from '@/lib/types/apiResponse';

/**
 * API 통신용 제네릭 Fetch 클라이언트
 */
export async function fetchClient<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 기본 설정 (인증 포함, JSON 형식)
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  // 2xx 외 응답 처리 (에러)
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(text) as ApiResponse<unknown>;
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  // 204 No Content 및 빈 응답 처리 (text 변환)
  const text = await response.text();
  
  // 빈 본문 통과
  if (!text) {
    return undefined as unknown as T;
  }

  // JSON 파싱
  const json: ApiResponse<T> = JSON.parse(text);

  // API 비즈니스 에러 예외 처리
  if (!json.success) {
    throw new Error(json.error?.message ?? '알 수 없는 에러');
  }

  // 데이터 반환
  return json.data;
}
