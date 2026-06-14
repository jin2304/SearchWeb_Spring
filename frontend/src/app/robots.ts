import { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/my-links",
          "/auth/",
          "/api/",
          "/oauth2/",
          "/login/oauth2/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
