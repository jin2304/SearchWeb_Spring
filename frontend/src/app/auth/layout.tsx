import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "로그인 처리",
  description: "ReLink 로그인 인증을 처리하는 페이지입니다.",
  path: "/auth/callback",
  noIndex: true,
  follow: false,
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
