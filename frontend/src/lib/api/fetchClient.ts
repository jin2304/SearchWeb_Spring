import type { ApiResponse } from '@/lib/types/apiResponse';

export async function fetchClient<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

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

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? '알 수 없는 에러');
  }

  return json.data;
}
