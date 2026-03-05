import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // [BACKEND_CONNECT] 백엔드 API 프록시 설정 (CORS 해결)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  // [/BACKEND_CONNECT]
};

export default nextConfig;
