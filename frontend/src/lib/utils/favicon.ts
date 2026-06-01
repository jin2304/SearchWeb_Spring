const HTTP_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;
const WRAPPING_QUOTES_PATTERN = /^[\s"'`]+|[\s"'`]+$/g;

// 사용자 입력값을 파싱 가능한 http/https URL로 정규화합니다.
function parseHttpUrl(urlStr?: string | null): URL | null {
  if (!urlStr) return null;

  const clean = urlStr.trim().replace(WRAPPING_QUOTES_PATTERN, '');
  if (!clean) return null;

  try {
    const formatted = HTTP_URL_PATTERN.test(clean) ? clean : `https://${clean}`;
    const parsed = new URL(formatted);

    if (!parsed.hostname || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function getUrlHostname(urlStr?: string | null): string | null {
  return parseHttpUrl(urlStr)?.hostname ?? null;
}

// 앱별 파비콘 힌트가 유지되도록 Google S2에는 전체 URL을 전달하되, 개인정보 및 보안 토큰 유출 방지를 위해 쿼리 스트링과 해시를 제외하고 전달.
export function buildGoogleFaviconUrl(urlStr?: string | null, size = 64): string | null {
  const parsed = parseHttpUrl(urlStr);
  if (!parsed) return null;

  // ?token=... 또는 #hash 등 민감 정보가 포함된 쿼리와 해시를 제거하여 보안을 강화.
  const safeUrl = parsed.origin;

  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(safeUrl)}`;
}

// Google S2가 실패하거나 기본 아이콘을 반환하면 원 도메인의 /favicon.ico를 직접 시도합니다.
export function buildDirectFaviconUrl(urlStr?: string | null): string | null {
  const parsed = parseHttpUrl(urlStr);
  if (!parsed) return null;

  return `${parsed.origin}/favicon.ico`;
}
