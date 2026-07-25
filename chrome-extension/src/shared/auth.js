import { apiRequest, getMember } from "./api.js";
import { getRedirectURL, launchWebAuthFlow } from "./browserApi.js";
import { clearTokens, getSettings, getTokens, setStoredMember, setTokens } from "./storage.js";

function buildOAuthUrl(apiBaseUrl, provider, redirectUri) {
  const base = apiBaseUrl.replace(/\/+$/, "");
  const url = new URL(`${base}/oauth2/authorization/${provider}`);
  url.searchParams.set("redirect_uri", redirectUri);
  return url.toString();
}

export async function loginWithProvider(provider) {
  const settings = await getSettings();
  const redirectUri = getRedirectURL("callback");
  const loginUrl = buildOAuthUrl(settings.apiBaseUrl, provider, redirectUri);
  const responseUrl = await launchWebAuthFlow(loginUrl, true);
  const callbackUrl = new URL(responseUrl);
  const error = callbackUrl.searchParams.get("error");

  if (error) {
    throw new Error(error);
  }

  const code = callbackUrl.searchParams.get("code");
  if (!code) {
    throw new Error("로그인 응답에 인증 코드가 없습니다.");
  }

  const tokenPair = await apiRequest("/api/auth/extension/exchange", {
    method: "POST",
    body: { code },
    auth: false
  });
  await setTokens(tokenPair);

  const member = await getMember();
  await setStoredMember(member);
  return member;
}

export async function logout() {
  const tokens = await getTokens();
  try {
    if (tokens?.refreshToken) {
      await apiRequest("/api/auth/extension/logout", {
        method: "POST",
        body: { refreshToken: tokens.refreshToken },
        auth: false
      });
    }
  } catch {
    // Local token cleanup should still succeed when the server is unreachable.
  } finally {
    await clearTokens();
  }
}