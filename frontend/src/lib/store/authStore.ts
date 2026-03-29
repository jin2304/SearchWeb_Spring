import { create } from 'zustand';
import { buildBackendUrl } from '@/lib/config/backend';

/**
 * 전역 인증 상태 관리 스토어 (Zustand)
 * - Access Token 및 사용자 정보 저장
 * - 앱 초기화 시 토큰 갱신 및 내 정보 조회 담당
 */

/** 사용자 정보 인터페이스 */
interface Member {
  memberId: number;
  name: string;
  email: string;
  role: string;
}

/** 인증 상태 및 액션 인터페이스 */
interface AuthState {
  accessToken: string | null;  // API 인증용 액세스 토큰
  isAuthenticated: boolean;    // 로그인 여부
  isInitializing: boolean;     // 초기화(로딩) 진행 여부
  member: Member | null;       // 사용자 프로필 정보
  authError: string | null;    // 인증 실패 사유 — 서버/네트워크 오류 시에만 저장, 단순 만료는 null

  setAccessToken: (token: string) => void;
  setMember: (member: Member) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Strict Mode / 중복 마운트에서도 refresh 요청이 한 번만 돌도록 잡아주는 싱글톤 Promise.
let initializePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  member: null,
  authError: null,

  setAccessToken: (token: string) => set({ accessToken: token }),

  setMember: (member: Member) => set({ member }),

  // 로그아웃: 인증 관련 상태를 모두 초기화 및 서버 세션 제거
  logout: async () => {
    try {
      // 서버에 로그아웃 요청 (HttpOnly 쿠키의 Refresh Token 삭제 목적)
      // 인증 쿠키는 백엔드가 발급/삭제하므로 로그아웃도 백엔드 직통으로 보낸다.
      await fetch(buildBackendUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 요청 성공 여부와 상관없이 클라이언트 상태는 초기화
      set({
        accessToken: null,
        isAuthenticated: false,
        member: null,
        authError: null,
      });
    }
  },

  /**
   * 앱 시작 시 호출 — 쿠키의 Refresh Token으로 로그인 상태를 복구한다.
   * 중복 호출 방지를 위해 싱글톤 Promise 패턴(initializePromise)을 사용한다.
   */
  initialize: async () => {
    // 이미 진행 중인 초기화가 있으면 같은 Promise 재사용 (동시 호출 방지)
    if (initializePromise) return initializePromise;
    // 이미 인증 완료 상태면 재초기화 불필요 (Strict Mode 이중 실행 방지)
    if (get().isAuthenticated) return;

    initializePromise = (async () => {
      set({ isInitializing: true });
      try {
        // 1단계: Refresh Token(HttpOnly 쿠키)으로 새 Access Token 발급
        // refreshToken 은 HttpOnly 쿠키라 JS 에서 읽지 못하므로,
        // 백엔드 /refresh 호출로만 새 access token 을 복구할 수 있다.
        const refreshResponse = await fetch(buildBackendUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include', // 쿠키를 요청에 포함
        });

        if (!refreshResponse.ok) {
          // 401/403 → 정상적인 만료 또는 미로그인 → 메시지 없이 조용히 로그인 페이지로
          // 5xx  → 서버 문제 → 사용자에게 안내 메시지 표시
          const authError =
            refreshResponse.status >= 500
              ? '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
              : null;
          set({ isAuthenticated: false, isInitializing: false, accessToken: null, authError });
          return;
        }

        const refreshData = await refreshResponse.json();
        const accessToken = refreshData.data.accessToken;
        set({ accessToken });

        // 2단계: 발급된 Access Token으로 내 정보 조회
        // access token 을 받은 직후 회원 정보까지 조회해야
        // "복구 완료된 로그인 상태"로 스토어를 채울 수 있다.
        const memberResponse = await fetch(buildBackendUrl('/api/auth/member'), {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        });

        if (memberResponse.ok) {
          const memberData = await memberResponse.json();
          set({
            member: memberData.data,
            isAuthenticated: true,
            authError: null,
          });
        } else {
          // 내 정보 조회 실패 → 인증 불완전으로 처리
          set({ isAuthenticated: false, accessToken: null });
        }
      } catch {
        // fetch 자체가 실패한 경우 → 네트워크 단절 등
        set({
          isAuthenticated: false,
          accessToken: null,
          authError: '인터넷 연결을 확인해주세요.',
        });
      } finally {
        set({ isInitializing: false });
        initializePromise = null;
      }
    })();

    return initializePromise;
  },
}));
