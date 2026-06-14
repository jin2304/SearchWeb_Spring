import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/config/site";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  follow?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
  follow = true,
}: PageMetadataOptions): Metadata {
  const brandedTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      url: path,
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
