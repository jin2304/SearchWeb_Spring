import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // [BACKEND_CONNECT] 백엔드 API 프록시 설정
  // 인증 관련 엔드포인트(/api/auth/*)는 프론트엔드에서 백엔드로 직접 호출한다.
  // (buildBackendUrl 참고) Set-Cookie 가 프록시를 거치며 누락되는 문제를 방지하기 위함.
  // 아래 rewrite 는 인증 외 일반 API 용이며, Phase 3(Nginx 단일 origin) 도입 시 제거된다.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/oauth2/:path*',
        destination: 'http://localhost:8080/oauth2/:path*',
      },
      {
        source: '/login/oauth2/:path*',
        destination: 'http://localhost:8080/login/oauth2/:path*',
      },
    ];
  },
  // [/BACKEND_CONNECT]
};

export default nextConfig;
