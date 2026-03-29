"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

/**
 * OAuth 로그인 완료 후 백엔드가 리디렉션하는 콜백 페이지
 * - initialize()는 AuthProvider가 단독 호출 — 여기서는 결과만 구독
 * - 초기화 완료 후 인증 성공 여부에 따라 분기
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useRef(false);

  // 컴포넌트 마운트 시 초기화 실행
  // - authStore.initialize() 내부에서 이미 진행 중인 Promise가 있다면 재사용하므로 안전함
  useEffect(() => {
    if (!initialized.current) {
      initialize();
      initialized.current = true;
    }
  }, [initialize]);

  useEffect(() => {
    // 초기화가 끝날 때까지 대기
    if (isInitializing) return;
    
    // 인증 성공 여부에 따라 페이지 이동
    router.replace(isAuthenticated ? '/my-links' : '/login');
  }, [isInitializing, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-text-sub">로그인 처리 중...</p>
      </div>
    </div>
  );
}
