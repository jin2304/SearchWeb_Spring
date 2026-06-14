import type { Metadata } from "next";
import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/config/site";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "AI 링크 관리 서비스",
    description:
      "흩어진 링크를 AI로 분류하고, 폴더·태그 검색으로 원하는 링크를 빠르게 다시 찾으세요.",
    path: "/",
    keywords: [
      "링크 관리",
      "링크 관리 도구",
      "AI 링크 관리",
      "북마크 관리",
      "북마크 정리",
    ],
  }),
  title: {
    absolute: "AI 링크 관리 서비스 | ReLink",
  },
};

const jsonLd = [
  {
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    name: "ReLink",
    url: absoluteUrl("/"),
    inLanguage: "ko-KR",
    description:
      "폴더, 태그, 검색과 AI 분류를 제공하는 링크 관리 서비스",
  },
  {
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl("/")}#application`,
    name: "ReLink",
    url: absoluteUrl("/"),
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    inLanguage: "ko-KR",
    description:
      "흩어진 업무자료와 링크를 저장하고 폴더, 태그, 검색으로 관리하는 AI 링크 관리 웹 애플리케이션",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": jsonLd }} />
      <LandingPageClient />
    </>
  );
}
