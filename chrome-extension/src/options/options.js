import { logout } from "../shared/auth.js";
import { getRedirectURL } from "../shared/browserApi.js";
import { getSettings, setSettings } from "../shared/storage.js";
import { getMember } from "../shared/api.js";
import { IS_DEV } from "../shared/config.js";

const form = document.getElementById("settingsForm");
const status = document.getElementById("status");
const apiBaseUrl = document.getElementById("apiBaseUrl");
const saveMode = document.getElementById("saveMode");
const defaultProvider = document.getElementById("defaultProvider");
const themeSelect = document.getElementById("theme");
const redirectUrl = document.getElementById("redirectUrl");
const logoutButton = document.getElementById("logoutButton");
const accountLabel = document.getElementById("accountLabel");
const userEmail = document.getElementById("userEmail");

let mediaQueryListener = null;

function applyTheme(theme) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  if (mediaQueryListener) {
    mediaQuery.removeEventListener("change", mediaQueryListener);
    mediaQueryListener = null;
  }

  const isDark = theme === "dark" || (theme === "system" && mediaQuery.matches);
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  if (theme === "system") {
    mediaQueryListener = (e) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    mediaQuery.addEventListener("change", mediaQueryListener);
  }
}

function setStatus(message) {
  status.textContent = message;
}

async function init() {
  const settings = await getSettings();
  apiBaseUrl.value = settings.apiBaseUrl;
  saveMode.value = settings.saveMode;
  defaultProvider.value = settings.defaultProvider;
  themeSelect.value = settings.theme || "system";
  applyTheme(settings.theme || "system");

  const oauthUrl = getRedirectURL("callback");
  redirectUrl.value = oauthUrl;

  if (!IS_DEV) {
    document.getElementById("apiServerGroup").style.display = "none";
    document.getElementById("oauthRedirectGroup").style.display = "none";
    apiBaseUrl.removeAttribute("required");
  } else {
    console.log("[Relink Dev] OAuth Redirect URL:", oauthUrl);
  }

  setStatus("설정 가능");

  try {
    const member = await getMember();
    if (member?.email) {
      userEmail.value = member.email;
      accountLabel.classList.remove("hidden");
    } else {
      accountLabel.classList.add("hidden");
    }
  } catch {
    accountLabel.classList.add("hidden");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await setSettings({
    apiBaseUrl: apiBaseUrl.value.trim(),
    saveMode: saveMode.value,
    defaultProvider: defaultProvider.value,
    theme: themeSelect.value
  });
  setStatus("저장되었습니다.");
});

themeSelect.addEventListener("change", () => {
  applyTheme(themeSelect.value);
});

logoutButton.addEventListener("click", async () => {
  try {
    await logout();
    accountLabel.classList.add("hidden");
    userEmail.value = "";
    setStatus("로그아웃되었습니다.");
  } catch (error) {
    setStatus(error?.message || "로그아웃 처리 중 오류가 발생했습니다.");
  }
});

init().catch((error) => {
  setStatus(error?.message || "설정 로드 실패");
});