import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';
const isStaticExport = process.env.NEXT_OUTPUT_EXPORT === 'true';
const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN || (isDev ? 'http://localhost:8080' : '')).replace(/\/+$/, '');

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' as const } : {}),
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons',
      },
    ],
  },
};

// [BACKEND_CONNECT] 백엔드 API 프록시 설정
// 인증 관련 엔드포인트(/api/auth/*)는 프론트엔드에서 백엔드로 직접 호출한다.
// 정적 배포 빌드에서는 Next.js rewrites가 지원되지 않으므로 Nginx가 이 역할을 수행한다.
if (!isStaticExport) {
  nextConfig.rewrites = async () => {
    if (!backendOrigin) return [];

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: '/oauth2/:path*',
        destination: `${backendOrigin}/oauth2/:path*`,
      },
      {
        source: '/login/oauth2/:path*',
        destination: `${backendOrigin}/login/oauth2/:path*`,
      },
    ];
  };
}

export default nextConfig;
