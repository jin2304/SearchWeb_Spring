'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { isPublicPath } from '@/lib/config/publicRoutes';

/**
 * 인증 초기화 및 라우트 가드를 담당하는 Provider
 * - 앱 최초 진입 시 initialize()를 호출해 로그인 상태를 복구
 * - 초기화 완료 후 미인증 상태이면 보호된 경로에서 /login으로 리디렉션
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authError = useAuthStore((s) => s.authError);
  const router = useRouter();
  const pathname = usePathname();

  // 1. 현재 경로가 공개 경로인지 판별 (렌더링 시점과 useEffect 양쪽에서 활용)
  const isCurrentPathPublic = isPublicPath(pathname);

  // 앱 마운트 시 단 한 번 실행 — 로그인 상태 복구
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 초기화 완료 후 미인증 + 보호 라우트 접근 시 로그인 페이지로 이동
  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated && !isCurrentPathPublic) {
      if (authError) {
        sessionStorage.setItem('authError', authError);
      }
      router.replace('/login');
    }
  }, [isInitializing, isAuthenticated, pathname, authError, router, isCurrentPathPublic]);

  // 2. 초기화 중이거나, 미인증 사용자가 보호된 경로에 있는 동안은 '로딩 중' 표시 (콘텐츠 노출 방지)
  if (isInitializing || (!isAuthenticated && !isCurrentPathPublic)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-sub">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증된 사용자만 실제 콘텐츠를 볼 수 있음
  return <>{children}</>;
}
