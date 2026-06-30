"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';
import { useAuthStore } from '@/lib/store/authStore';

type AuthAnalyticsEvent = 'login' | 'sign_up';

/**
 * URL 쿼리 파라미터로부터 GA4 전송용 인증 이벤트와 인증 수단(method)을 파싱하여 반환.
 */
function readAuthAnalyticsParams(): { event: AuthAnalyticsEvent | null; method: string } {
  // 서버 사이드 렌더링(SSR) 환경인 경우 window 객체가 없으므로 안전하게 기본값 반환
  if (typeof window === 'undefined') {
    return { event: null, method: 'google' };
  }

  // 주소창의 쿼리 스트링(?auth_event=...&method=...) 파싱 객체 생성
  const searchParams = new URLSearchParams(window.location.search);
  const event = searchParams.get('auth_event');
  const rawMethod = searchParams.get('method');
  
  // 허용된 로그인/가입 수단(method)만 필터링하고, 아닐 경우 기본값 'google' 지정
  const method = rawMethod === 'google' || rawMethod === 'local' || rawMethod === 'naver' || rawMethod === 'kakao'
    ? rawMethod
    : 'google';

  // 수집 대상 이벤트('sign_up', 'login')만 정상 반환하고, 그 외의 경우 null 처리
  return {
    event: event === 'sign_up' || event === 'login' ? event : null,
    method,
  };
}

/**
 * OAuth 콜백 페이지로, 인증 후 백엔드에서 리다이렉트.
 * 인증 상태를 복원하고, 추천되는 GA4 인증 이벤트를 1회 전송한 후, 인증된 영역으로 사용자를 리다이렉트.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useRef(false);      // 초기화 API 중복 호출을 막기 위한 플래그
  const analyticsTracked = useRef(false); // GA4 인증 이벤트(가입/로그인) 중복 전송을 방지하기 위한 플래그 

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

    // 인증 완료 상태이며 아직 GA4 이벤트를 전송하지 않은 경우 최초 1회만 전송
    if (isAuthenticated && !analyticsTracked.current) {
      const { event, method } = readAuthAnalyticsParams();

      if (event === 'sign_up') {
        trackEvent(ANALYTICS_EVENTS.SIGN_UP, {
          event_params: { method }
        });
      } else if (event === 'login') {
        trackEvent(ANALYTICS_EVENTS.LOGIN, {
          event_params: { method }
        });
      }

      // 이벤트 전송 완료 상태로 변경하여 다음 렌더링 시 중복 발송 차단
      analyticsTracked.current = true;
    }

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
