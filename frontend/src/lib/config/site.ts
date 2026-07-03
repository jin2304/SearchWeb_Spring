export const SITE_NAME = "ReLink";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://relink.ai.kr")
).replace(/\/+$/, "");

export const SITE_TITLE = "ReLink | AI 링크 관리 서비스";
export const SITE_DESCRIPTION =
  "흩어진 링크를 AI로 분류하고, 폴더·태그 검색으로 원하는 링크를 빠르게 다시 찾으세요.";

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString();
}