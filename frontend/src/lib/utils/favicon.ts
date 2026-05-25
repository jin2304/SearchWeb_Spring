// URL에서 안전하게 호스트네임(도메인 전체)만 추출합니다.
export function getUrlHostname(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  // 앞뒤 공백 및 따옴표 제거
  const clean = urlStr.trim().replace(/^[\s"'`]+|[\s"'`]+$/g, '');
  try {
    const formatted = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(clean) ? clean : `https://${clean}`;
    return new URL(formatted).hostname;
  } catch {
    return null;
  }
}


// 호스트네임에서 국가 코드 도메인을 고려하여 루트 도메인(Base Domain)을 반환합니다.
export function getUrlBaseDomain(urlStr?: string | null): string | null {
  const hostname = getUrlHostname(urlStr);
  if (!hostname) return null;
  
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;

  const secondLevelTlds = ['co', 'com', 'go', 'or', 'ac', 'ne', 'edu', 'gov', 'net', 'org'];
  const secondLevel = parts[parts.length - 2];
  
  // co.kr, com.ne와 같은 2차 도메인은 3마디 유지, 그 외 일반 도메인은 2마디 추출
  return secondLevelTlds.includes(secondLevel) ? parts.slice(-3).join('.') : parts.slice(-2).join('.');
}


// 구글 파비콘 API 주소를 구성하여 반환합니다.
export function buildGoogleFaviconUrl(urlStr?: string | null, size = 64): string | null {
  const hostname = getUrlHostname(urlStr);
  if (!hostname) return null;
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent('https://' + hostname)}`;
}

// 실제 호스트의 /favicon.ico 경로로 다이렉트 파비콘 요청 주소를 반환합니다.
export function buildDirectFaviconUrl(urlStr?: string | null): string | null {
  const hostname = getUrlHostname(urlStr);
  if (!hostname) return null;
  return `https://${hostname}/favicon.ico`;
}

