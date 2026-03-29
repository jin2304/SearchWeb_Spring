// 로컬 개발 환경: 인증 요청을 Spring 백엔드로 직접 전송
// Next.js rewrite 시 refreshToken 쿠키 누락 방지 목적

// 1. 백엔드 서버 기본 주소 결정 (환경 변수 우선, 로컬 개발 시 8080 기본값)
const rawBackendOrigin =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : '');

// 2. 주소 끝 슬래시(/) 제거: 경로 중복 방지
const normalizedBackendOrigin = rawBackendOrigin.replace(/\/+$/, '');

export function buildBackendUrl(path: string): string {
  // 이미 절대 경로(http://...)인 경우 그대로 반환
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  // 3. 경로 시작 부분 슬래시(/) 추가 (정규화)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // 4. 백엔드 주소 유무에 따라 절대 경로 또는 상대 경로 반환
  // 리버스 프록시 등을 이용한 단일 오리진 환경 대응용
  return normalizedBackendOrigin ? `${normalizedBackendOrigin}${normalizedPath}` : normalizedPath;
}
