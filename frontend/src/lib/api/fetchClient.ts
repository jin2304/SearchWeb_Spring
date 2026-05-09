import type { ApiResponse } from '@/lib/types/apiResponse';
import { buildBackendUrl } from '@/lib/config/backend';
import { useAuthStore } from '@/lib/store/authStore';

const DEFAULT_API_ERROR_MESSAGE = '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

type ApiErrorParams = {
  message: string;
  status?: number;
  code?: string;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor({ message, status, code }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  return DEFAULT_API_ERROR_MESSAGE;
}

// 여러 API 가 동시에 401 을 받아도 refresh 는 1회만 보내도록 Promise 를 공유한다.
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh Token(쿠키)으로 새 Access Token을 발급받아 스토어에 저장한다.
 * 동시 호출 시 첫 번째 Promise를 재사용해 중복 요청을 방지한다.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise; // 이미 진행 중이면 같은 Promise 반환
  refreshPromise = (async () => {
    try {
      // refreshToken 쿠키는 백엔드가 직접 읽어야 하므로 refresh 만은 백엔드 직통으로 보낸다.
      const response = await fetch(buildBackendUrl('/api/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) return false;
      const json = await response.json();
      useAuthStore.getState().setAccessToken(json.data.accessToken);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Token Refresh Error]:', error);
      }
      return false;
    } finally {
      refreshPromise = null; // 완료 후 초기화해 다음 갱신 가능하게
    }
  })();
  return refreshPromise;
}

/**
 * API 통신용 제네릭 Fetch 클라이언트
 * - 모든 요청에 Access Token 자동 주입
 * - 401 응답 시 토큰 갱신 후 원래 요청을 1회 재시도
 * - 갱신 실패 시 로그아웃 후 로그인 페이지로 이동
 */
export async function fetchClient<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // 스토어에 저장된 Access Token을 Authorization 헤더에 주입
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // 일반 API 는 현재 구조를 유지해 상대경로로 호출한다.
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  // 401 수신 → 토큰 갱신 시도 → 성공하면 원래 요청 재시도 (1회)
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = useAuthStore.getState().accessToken;
      headers.set('Authorization', `Bearer ${newToken}`);
      const retryResponse = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
      });
      return parseResponse<T>(retryResponse);
    }
    // 갱신도 실패 → 상태 초기화 후 로그인 페이지로 강제 이동
    await useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError({
      status: 401,
      code: 'AUTH_EXPIRED',
      message: '인증이 만료되었습니다.',
    });
  }

  return parseResponse<T>(response);
}

/** HTTP 응답을 파싱해 데이터 또는 에러를 반환한다. */
async function parseResponse<T>(response: Response): Promise<T> {
  // 2xx 외 HTTP 오류 처리
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = DEFAULT_API_ERROR_MESSAGE;
    let code: string | undefined;
    try {
      const parsed = JSON.parse(text) as ApiResponse<unknown>;
      if (parsed.error?.message) {
        message = parsed.error.message;
        code = parsed.error.code;
      }
    } catch {
      // ApiResponse 형식이 아닌 응답 본문은 사용자에게 그대로 노출하지 않는다.
    }
    throw new ApiError({
      status: response.status,
      code,
      message,
    });
  }

  // 204 No Content 또는 빈 응답
  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  const json: ApiResponse<T> = JSON.parse(text);

  // HTTP는 200이지만 비즈니스 로직 에러인 경우 (success: false)
  if (!json.success) {
    throw new ApiError({
      status: response.status,
      code: json.error?.code,
      message: json.error?.message ?? DEFAULT_API_ERROR_MESSAGE,
    });
  }

  return json.data;
}
