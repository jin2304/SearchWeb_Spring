import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "내 링크",
  description: "저장한 링크를 폴더와 태그로 관리하는 개인 대시보드입니다.",
  path: "/my-links",
  noIndex: true,
  follow: false,
});

export default function MyLinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
