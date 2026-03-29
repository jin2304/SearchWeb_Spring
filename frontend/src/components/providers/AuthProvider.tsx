'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

// 로그인 없이 접근 가능한 공개 경로
const PUBLIC_PATHS = ['/', '/login', '/auth/callback'];

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

  // 앱 마운트 시 단 한 번 실행 — 로그인 상태 복구
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 초기화 완료 후 미인증 + 보호 라우트 접근 시 로그인 페이지로 이동
  useEffect(() => {
    if (isInitializing) return; // 아직 초기화 중이면 판단 보류
    const isPublicPath = PUBLIC_PATHS.some((path) =>
      path === '/' ? pathname === '/' : pathname.startsWith(path),
    );
    if (!isAuthenticated && !isPublicPath) {
      // 서버/네트워크 오류 메시지가 있으면 로그인 페이지에서 보여주기 위해 저장
      if (authError) {
        sessionStorage.setItem('authError', authError);
      }
      router.replace('/login');
    }
  }, [isInitializing, isAuthenticated, pathname, authError, router]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-sub">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
