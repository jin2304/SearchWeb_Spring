import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "로그인",
  description: "ReLink에 로그인하고 AI 링크 관리 서비스를 시작하세요.",
  path: "/login",
  noIndex: true,
  follow: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
