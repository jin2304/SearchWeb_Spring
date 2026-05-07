'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError, getApiErrorMessage } from '@/lib/api/fetchClient';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분 동안 캐시된 데이터를 "최신"으로 취급
            retry: 1,             // 요청 실패 시 1회 재시도
          },
          mutations: {
            onError: (error: unknown) => {
              // 1. 보안을 위해 오직 '개발 환경(development)'에서만 상세한 에러 정보 출력
              if (process.env.NODE_ENV === 'development') {
                if (error instanceof ApiError) {
                  console.warn('[API Mutation Warning]:', {
                    status: error.status,
                    code: error.code,
                    message: error.message,
                  });
                } else {
                  console.error('[API Mutation Error]:', error);
                }
              }

              // 2. 로그인 만료 에러(AUTH_EXPIRED)는 자동 리다이렉트되므로 alert를 띄우지 않음
              if (error instanceof ApiError && error.code === 'AUTH_EXPIRED') {
                return;
              }

              // 3. 그 외 백엔드가 내려준 사용자용 메시지가 있으면 안내한다.
              alert(getApiErrorMessage(error));
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
