import { DEFAULT_API_BASE_URL } from "./config.js";
import { clearTokens, getSettings, getTokens, setTokens } from "./storage.js";

export class ApiError extends Error {
  constructor(status, message, code, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

function normalizeBaseUrl(apiBaseUrl) {
  return (apiBaseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function unwrap(payload) {
  if (payload && typeof payload === "object" && "success" in payload) {
    if (payload.success) {
      return payload.data;
    }
    throw new ApiError(400, payload.error?.message || "요청에 실패했습니다.", payload.error?.code, payload);
  }
  return payload;
}

async function refreshTokens(settings, tokens) {
  if (!tokens?.refreshToken) {
    throw new ApiError(401, "로그인이 필요합니다.");
  }

  const response = await fetch(`${normalizeBaseUrl(settings.apiBaseUrl)}/api/auth/extension/refresh`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ refreshToken: tokens.refreshToken })
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    await clearTokens();
    throw new ApiError(response.status, payload?.error?.message || "토큰 갱신에 실패했습니다.", payload?.error?.code, payload);
  }

  const tokenPair = unwrap(payload);
  await setTokens(tokenPair);
  return tokenPair;
}

export async function apiRequest(path, options = {}) {
  const settings = await getSettings();
  const tokens = await getTokens();
  const method = options.method ?? "GET";
  const hasBody = options.body !== undefined;
  const auth = options.auth !== false;
  const headers = {
    "Accept": "application/json",
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(options.headers ?? {})
  };

  if (auth && tokens?.accessToken) {
    headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${normalizeBaseUrl(settings.apiBaseUrl)}${path}`, {
    method,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 401 && auth && options.retry !== false && tokens?.refreshToken) {
    await refreshTokens(settings, tokens);
    return apiRequest(path, { ...options, retry: false });
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error?.message || "요청에 실패했습니다.", payload?.error?.code, payload);
  }

  return unwrap(payload);
}

export const getMember = () => apiRequest("/api/auth/extension/member");
export const getFolders = () => apiRequest("/api/folders/me/root");
export const checkBookmark = (url) => apiRequest(`/api/bookmarks/check?url=${encodeURIComponent(url)}`);
export const createBookmark = (payload) => apiRequest("/api/bookmarks", { method: "POST", body: payload });
export const deleteBookmark = (bookmarkId) => apiRequest(`/api/bookmarks/${bookmarkId}`, { method: "DELETE" });
export const analyzeLink = (url) => apiRequest("/api/link-analysis/analyze", { method: "POST", body: { url } });