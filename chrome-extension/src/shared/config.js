export const DEFAULT_API_BASE_URL = "__API_URL__";
export const IS_DEV = "__ENV__" === "dev";

export const DEFAULT_SETTINGS = Object.freeze({
  apiBaseUrl: DEFAULT_API_BASE_URL,
  defaultProvider: "google",
  saveMode: "silent",
  theme: "system"
});

export const PROVIDERS = Object.freeze(["google", "naver", "kakao"]);