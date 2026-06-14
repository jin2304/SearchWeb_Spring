import type { Metadata } from "next";
import { SITE_NAME, absoluteUrl } from "@/lib/config/site";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  follow?: boolean;
  absoluteTitle?: boolean | string;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
  follow = true,
  absoluteTitle = false,
}: PageMetadataOptions): Metadata {
  const brandedTitle =
    typeof absoluteTitle === "string"
      ? absoluteTitle
      : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: brandedTitle } : title,
    description,
    keywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      title: brandedTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
