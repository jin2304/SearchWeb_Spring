'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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
            onError: (error: any) => {
              // 1. 보안을 위해 오직 '개발 환경(development)'에서만 상세한 에러 정보 출력
              if (process.env.NODE_ENV === 'development') {
                console.error('[API Mutation Error]:', error);
              }

              // 2. 사용자에게는 어떤 상황에서도 기술 정보 없이 일반적인 안내 문구만 제공
              alert('요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
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
