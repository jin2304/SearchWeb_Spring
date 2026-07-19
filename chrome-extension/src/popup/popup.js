import { analyzeLink, ApiError, createBookmark, deleteBookmark, getFolders, getMember } from "../shared/api.js";
import { loginWithProvider, logout } from "../shared/auth.js";
import { browserApi, queryActiveTab, getRedirectURL } from "../shared/browserApi.js";
import { clearTokens, getSettings, setStoredMember, setSettings } from "../shared/storage.js";
import { IS_DEV } from "../shared/config.js";

const state = {
  tab: null,
  settings: null,
  member: null,
  folders: [],
  defaultFolderId: null,
  selectedFolderId: null,
  selectedFolderName: null,
  pendingFolderName: null,
  savedBookmarkId: null,
  aiSuggestedTags: new Set(),
  busy: false,
  autoSaveAttempted: false,
  tempDetailsOpenedByDropdown: false,
  activePanelBeforeSettings: null
};

const els = {};
let statusTimeout = null;

function collectElements() {
  for (const id of [
    "optionsButton",
    "backButton",
    "headerTitle",
    "closeButton",
    "status",
    "unsupportedPanel",
    "unsupportedReason",
    "loginPanel",
    "saveForm",
    "titleInput",
    "folderSelect",
    "favicon",
    "faviconFallback",
    "urlText",
    "detailsButton",
    "detailsPanel",
    "noteInput",
    "tagsInput",
    "analyzeButton",
    "deleteButton",
    "saveButton",
    "customFolderSelect",
    "folderSelectTrigger",
    "selectedFolderText",
    "folderOptionsList",
    "folderOptionsListContainer",
    "folderCountText",
    "settingsPanel",
    "settingsForm",
    "settingsApiServerGroup",
    "settingsApiBaseUrl",
    "settingsOauthRedirectGroup",
    "settingsRedirectUrl",
    "settingsSaveMode",
    "settingsDefaultProvider",
    "settingsTheme",
    "settingsAccountLabel",
    "settingsUserEmail",
    "settingsLogoutButton"
  ]) {
    els[id] = document.getElementById(id);
  }
}

function setStatus(message, type = "") {
  if (statusTimeout) {
    clearTimeout(statusTimeout);
    statusTimeout = null;
  }

  if (!message || message === "준비 중" || message === "저장 준비 완료") {
    els.status.classList.add("hidden");
    return;
  }

  let currentType = type;
  if (message.endsWith("...") || message.endsWith("중")) {
    currentType = "loading";
  }

  let iconHtml = "";
  if (currentType === "success") {
    iconHtml = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  } else if (currentType === "error") {
    iconHtml = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
  } else if (currentType === "loading") {
    iconHtml = `
      <svg class="spinner-icon-status" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.2"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
      </svg>
    `;
  } else {
    currentType = "info";
    iconHtml = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
  }

  const iconEl = els.status.querySelector(".status-icon");
  const textEl = els.status.querySelector(".status-text");

  if (iconEl && textEl) {
    iconEl.innerHTML = iconHtml;
    textEl.textContent = message;
  } else {
    els.status.innerHTML = `<span class="status-icon">${iconHtml}</span><span class="status-text">${message}</span>`;
  }

  els.status.className = `status ${currentType}`.trim();
  els.status.classList.remove("hidden");

  // 성공, 에러, 정보 등의 완료 상태는 5초 동안 보여준 후 자연스럽게 사라지도록 설정
  if (currentType === "success" || currentType === "error" || currentType === "info") {
    statusTimeout = setTimeout(() => {
      els.status.classList.add("hidden");
    }, 5000);
  }
}

function showOnly(panel) {
  els.unsupportedPanel.classList.toggle("hidden", panel !== "unsupported");
  els.loginPanel.classList.toggle("hidden", panel !== "login");
  els.saveForm.classList.toggle("hidden", panel !== "save");
  if (els.settingsPanel) {
    els.settingsPanel.classList.toggle("hidden", panel !== "settings");
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;
  els.saveButton.disabled = isBusy;
  els.analyzeButton.disabled = isBusy;
  els.deleteButton.disabled = isBusy;
  document.querySelectorAll(".provider").forEach((button) => {
    button.disabled = isBusy;
  });
}

function isSavableUrl(url) {
  return /^https?:\/\//i.test(url ?? "");
}

function faviconUrl(url) {
  if (!url) return "";
  try {
    const pageUrl = new URL(url);
    return `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(pageUrl.origin)}`;
  } catch {
    return "";
  }
}

function chooseDefaultFolder(folders) {
  return folders.find((folder) => folder.folderType === "UNORGANIZED") ?? folders[0] ?? null;
}

function normalizeFolderName(folderName) {
  return String(folderName ?? "").trim().toLocaleLowerCase();
}

function findFolderById(folderId) {
  if (folderId === null || folderId === undefined) return null;
  return state.folders.find((folder) => String(folder.memberFolderId) === String(folderId)) ?? null;
}

function findFolderByName(folderName) {
  const normalizedName = normalizeFolderName(folderName);
  if (!normalizedName) return null;
  return state.folders.find((folder) => normalizeFolderName(folder.folderName) === normalizedName) ?? null;
}

function getFallbackInitial(url, title) {
  try {
    const pageUrl = new URL(url);
    const hostname = pageUrl.hostname.replace("www.", "");
    return hostname[0].toUpperCase();
  } catch {
    return (title || "L")[0].toUpperCase();
  }
}

function renderTab() {
  const title = state.tab?.title || state.tab?.url || "";
  els.titleInput.value = title;
  els.urlText.textContent = state.tab?.url ?? "";
  
  // 상태 초기화
  els.favicon.classList.remove("hidden");
  els.faviconFallback.classList.add("hidden");
  
  els.favicon.onerror = () => {
    els.favicon.classList.add("hidden");
    els.faviconFallback.textContent = getFallbackInitial(state.tab?.url, title);
    els.faviconFallback.classList.remove("hidden");
  };
  els.favicon.src = faviconUrl(state.tab?.url);
}

// Member rendering removed as per UI requirements

function renderSelectedFolderText(folderName, { pending = false } = {}) {
  if (!els.selectedFolderText) return;
  els.selectedFolderText.textContent = "";

  const name = document.createElement("span");
  name.className = "selected-folder-name";
  name.textContent = folderName;
  els.selectedFolderText.append(name);

  if (pending) {
    const badge = document.createElement("span");
    badge.className = "new-folder-badge";
    badge.textContent = "NEW";
    badge.setAttribute("aria-label", "새 폴더");
    els.selectedFolderText.append(badge);
  }
}

function syncFolderOptionSelection(kind, value = null) {
  els.folderOptionsList?.querySelectorAll(".select-option").forEach((li) => {
    const isActive = kind === "pending"
      ? li.dataset.kind === "pending"
      : li.dataset.kind === "existing" && li.dataset.value === String(value);
    li.classList.toggle("selected", isActive);
    li.setAttribute("aria-selected", String(isActive));
    li.querySelector(".check-icon")?.classList.toggle("hidden", !isActive);
  });
}

function applyExistingFolderSelection(folder) {
  if (folder.folderType === "UNORGANIZED") {
    applyUnorganizedSelection(folder);
    return;
  }

  state.selectedFolderId = Number(folder.memberFolderId);
  state.selectedFolderName = folder.folderName;
  state.pendingFolderName = null;
  els.folderSelect.value = String(folder.memberFolderId);
  renderSelectedFolderText(folder.folderName);
  syncFolderOptionSelection("existing", folder.memberFolderId);
}

function applyPendingFolderSelection(folderName) {
  state.selectedFolderId = null;
  state.selectedFolderName = null;
  state.pendingFolderName = folderName.trim();
  els.folderSelect.value = "";
  renderSelectedFolderText(state.pendingFolderName, { pending: true });
  syncFolderOptionSelection("pending");
}

function applyUnorganizedSelection(folder = null) {
  state.selectedFolderId = null;
  state.selectedFolderName = null;
  state.pendingFolderName = null;
  els.folderSelect.value = folder ? String(folder.memberFolderId) : "";
  renderSelectedFolderText(folder?.folderName || "미분류");
  if (folder) {
    syncFolderOptionSelection("existing", folder.memberFolderId);
  } else {
    syncFolderOptionSelection("none");
  }
}

function selectExistingFolder(folder) {
  const isUnorganized = folder.folderType === "UNORGANIZED";
  state.selectedFolderId = isUnorganized ? null : Number(folder.memberFolderId);
  state.selectedFolderName = isUnorganized ? null : folder.folderName;
  state.pendingFolderName = null;
  renderFolders();
}

function selectPendingFolder(folderName) {
  const name = folderName?.trim();
  if (!name) return;
  state.selectedFolderId = null;
  state.selectedFolderName = null;
  state.pendingFolderName = name;
  renderFolders();
}

function bindFolderOptionActivation(option, callback) {
  option.addEventListener("click", (event) => {
    event.stopPropagation();
    callback();
  });
  option.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    callback();
  });
}

function closeFolderDropdown() {
  els.folderOptionsListContainer?.classList.add("hidden");
  els.customFolderSelect?.classList.remove("active");
  els.folderSelectTrigger?.setAttribute("aria-expanded", "false");

  if (state.tempDetailsOpenedByDropdown && els.detailsPanel) {
    els.detailsPanel.classList.add("hidden");
    state.tempDetailsOpenedByDropdown = false;
  }
}

function renderFolders() {
  els.folderSelect.textContent = "";
  if (els.folderOptionsList) {
    els.folderOptionsList.textContent = "";
  }

  // 폴더 개수 텍스트 갱신
  if (els.folderCountText) {
    els.folderCountText.textContent = `ALL FOLDERS (${state.folders.length})`;
  }

  for (const folder of state.folders) {
    const option = document.createElement("option");
    option.value = String(folder.memberFolderId);
    option.textContent = folder.folderName;
    els.folderSelect.append(option);

    if (els.folderOptionsList) {
      const li = document.createElement("li");
      li.className = "select-option";
      li.dataset.kind = "existing";
      li.dataset.value = String(folder.memberFolderId);
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.tabIndex = 0;

      // 폴더 아이콘과 이름 추가
      const folderIconContainer = document.createElement("div");
      folderIconContainer.style.display = "flex";
      folderIconContainer.style.alignItems = "center";
      folderIconContainer.innerHTML = `
        <svg class="dropdown-folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      li.append(folderIconContainer.firstElementChild);

      const nameSpan = document.createElement("span");
      nameSpan.className = "option-name";
      nameSpan.textContent = folder.folderName;
      li.append(nameSpan);

      // 우측 체크 아이콘 추가 (기본 hidden)
      const checkIconContainer = document.createElement("div");
      checkIconContainer.style.display = "flex";
      checkIconContainer.style.alignItems = "center";
      checkIconContainer.innerHTML = `
        <svg class="check-icon hidden" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      li.append(checkIconContainer.firstElementChild);

      li.addEventListener("click", (e) => {
        e.stopPropagation();
        selectExistingFolder(folder);
        if (els.folderOptionsListContainer) {
          els.folderOptionsListContainer.classList.add("hidden");
        }
        els.customFolderSelect.classList.remove("active");
        els.folderSelectTrigger?.setAttribute("aria-expanded", "false");

        // 드롭다운 선택으로 닫힐 때 임시 오픈했던 상세창 복구
        if (state.tempDetailsOpenedByDropdown && els.detailsPanel) {
          els.detailsPanel.classList.add("hidden");
          state.tempDetailsOpenedByDropdown = false;
        }
      });
      li.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        event.stopPropagation();
        selectExistingFolder(folder);
        closeFolderDropdown();
      });
      els.folderOptionsList.append(li);
    }
  }

  if (state.pendingFolderName && els.folderOptionsList) {
    const li = document.createElement("li");
    li.className = "select-option pending-folder-option";
    li.dataset.kind = "pending";
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "true");
    li.setAttribute("aria-label", `${state.pendingFolderName}, 새 폴더`);
    li.tabIndex = 0;
    li.innerHTML = `
      <svg class="dropdown-folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
      </svg>
    `;

    const nameSpan = document.createElement("span");
    nameSpan.className = "option-name";
    nameSpan.textContent = state.pendingFolderName;
    li.append(nameSpan);

    const badge = document.createElement("span");
    badge.className = "new-folder-badge";
    badge.textContent = "NEW";
    badge.setAttribute("aria-hidden", "true");
    li.append(badge);

    const checkIconContainer = document.createElement("span");
    checkIconContainer.innerHTML = `
      <svg class="check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
    li.append(checkIconContainer.firstElementChild);
    bindFolderOptionActivation(li, () => {
      selectPendingFolder(state.pendingFolderName);
      closeFolderDropdown();
    });
    els.folderOptionsList.prepend(li);
  }

  const defaultFolder = chooseDefaultFolder(state.folders);
  state.defaultFolderId = defaultFolder?.memberFolderId ?? null;
  if (state.pendingFolderName) {
    applyPendingFolderSelection(state.pendingFolderName);
    return;
  }

  const selectedFolder = findFolderById(state.selectedFolderId);
  if (selectedFolder) {
    applyExistingFolderSelection(selectedFolder);
  } else if (state.selectedFolderId && state.selectedFolderName) {
    // AI가 추천한 기존 폴더가 로컬 캐시에 아직 없어도 저장 대상 ID는 유지합니다.
    els.folderSelect.value = "";
    renderSelectedFolderText(state.selectedFolderName);
    syncFolderOptionSelection("none");
  } else if (defaultFolder) {
    applyExistingFolderSelection(defaultFolder);
  } else {
    applyUnorganizedSelection();
  }
}

/**
 * UI 상태(선택된 폴더, 임시 폴더명 등)를 분석하여
 * 서버에 전달할 folderTarget 페이로드 객체를 생성합니다.
 */
function buildFolderTarget() {
  // 1. 임시 생성 폴더명이 존재하는 경우: 신규 폴더 생성(CREATE_IF_ABSENT) 대상
  if (state.pendingFolderName) {
    return { type: "CREATE_IF_ABSENT", folderName: state.pendingFolderName };
  }

  const memberFolderId = Number(state.selectedFolderId);
  // 2. AI 추천 또는 사용자 선택으로 확정된 기존 폴더 ID는 로컬 캐시와 무관하게 그대로 사용
  if (Number.isFinite(memberFolderId) && memberFolderId > 0) {
    return { type: "EXISTING", memberFolderId };
  }

  // 3. 폴더가 지정되지 않은 경우: 시스템 미분류 폴더 대상
  return { type: "UNORGANIZED" };
}

function buildBookmarkPayload() {
  return {
    url: state.tab.url,
    displayTitle: els.titleInput.value.trim() || state.tab.title || state.tab.url,
    folderTarget: buildFolderTarget(),
    note: els.noteInput.value.trim() || null,
    tags: els.tagsInput.value.trim() || null
  };
}

function parseTagNames(value) {
  return String(value ?? "")
    .split(",")
    .map((tagName) => tagName.trim())
    .filter(Boolean);
}

function applySuggestedTags(suggestedTags) {
  const manualTags = [];
  const manualTagNames = new Set();

  for (const tagName of parseTagNames(els.tagsInput.value)) {
    if (!state.aiSuggestedTags.has(tagName) && !manualTagNames.has(tagName)) {
      manualTags.push(tagName);
      manualTagNames.add(tagName);
    }
  }

  const mergedTags = [...manualTags];
  const mergedTagNames = new Set(manualTagNames);
  const nextAiSuggestedTags = new Set();

  for (const suggestedTag of suggestedTags) {
    const tagName = String(suggestedTag?.tagName ?? "").trim();
    if (!tagName) continue;

    if (!mergedTagNames.has(tagName)) {
      mergedTags.push(tagName);
      mergedTagNames.add(tagName);
    }
    if (!manualTagNames.has(tagName)) {
      nextAiSuggestedTags.add(tagName);
    }
  }

  els.tagsInput.value = mergedTags.join(", ");
  state.aiSuggestedTags = nextAiSuggestedTags;
}

function describeError(error) {
  if (error instanceof ApiError && error.status === 409 && error.code === "B001") {
    return "이미 저장된 링크입니다.";
  }
  return error?.message || "처리 중 오류가 발생했습니다.";
}

async function loadFolders() {
  state.folders = await getFolders();
  renderFolders();
}

async function saveBookmark({ silent = false } = {}) {
  if (state.busy || !state.tab?.url) {
    return false;
  }

  setBusy(true);
  setStatus(silent ? "저장 중" : "저장 중...");
  const pendingFolderName = state.pendingFolderName;
  try {
    const result = await createBookmark(buildBookmarkPayload());
    state.savedBookmarkId = result.bookmarkId;
    let folderRefreshFailed = false;

    if (pendingFolderName) {
      const resolvedFolderId = Number(result.resolvedFolderId);
      state.pendingFolderName = null;
      state.selectedFolderId = Number.isFinite(resolvedFolderId) && resolvedFolderId > 0
        ? resolvedFolderId
        : null;
      state.selectedFolderName = pendingFolderName;
      renderFolders();

      try {
        state.folders = await getFolders();
        const resolvedFolder = findFolderById(resolvedFolderId)
          ?? findFolderByName(pendingFolderName);
        if (resolvedFolder) {
          state.selectedFolderId = Number(resolvedFolder.memberFolderId);
          state.selectedFolderName = resolvedFolder.folderName;
        }
        renderFolders();
      } catch {
        folderRefreshFailed = true;
      }
    }
    const successMessage = result.created ? "저장되었습니다." : "이미 저장된 링크입니다.";
    setStatus(
      folderRefreshFailed ? `${successMessage} 폴더 목록은 다음에 새로고침됩니다.` : successMessage,
      "success"
    );
    return true;
  } catch (error) {
    const message = describeError(error);
    setStatus(message, "error");
    return false;
  } finally {
    setBusy(false);
  }
}

async function maybeAutoSave() {
  if (
    state.settings?.saveMode !== "silent"
    || state.autoSaveAttempted
    || state.busy
    || !state.member
    || !state.tab?.url
  ) {
    return false;
  }

  state.autoSaveAttempted = true;
  const saved = await saveBookmark({ silent: true });
  return saved;
}

async function analyzeCurrentLink() {
  if (state.busy) {
    return;
  }

  setBusy(true);
  setStatus("분석 중...");
  
  // 버튼 상태를 분석 중으로 시각화하기 위한 클래스 및 텍스트 추가
  els.analyzeButton.classList.add("analyzing");
  const aiText = els.analyzeButton.querySelector(".ai-text");
  if (aiText) aiText.textContent = "분석 중...";
  
  try {
    const result = await analyzeLink(state.tab.url);
    if (result?.title) {
      els.titleInput.value = result.title;
    }
    if (result?.description && !els.noteInput.value.trim()) {
      els.noteInput.value = result.description;
    }
    if (Array.isArray(result?.suggestedTags)) {
      applySuggestedTags(result.suggestedTags);
    }
    const suggestedFolder = result?.suggestedFolder;
    state.pendingFolderName = null;
    state.selectedFolderId = null;
    state.selectedFolderName = null;

    if (suggestedFolder?.isExisting) {
      const memberFolderId = Number(suggestedFolder.memberFolderId);
      if (Number.isFinite(memberFolderId) && memberFolderId > 0) {
        const cachedFolder = findFolderById(memberFolderId);
        state.selectedFolderId = memberFolderId;
        state.selectedFolderName = suggestedFolder.folderName?.trim()
          || cachedFolder?.folderName
          || "추천 폴더";
      }
    } else if (suggestedFolder?.folderName?.trim()) {
      const existingFolder = findFolderByName(suggestedFolder.folderName);
      if (existingFolder) {
        state.selectedFolderId = Number(existingFolder.memberFolderId);
        state.selectedFolderName = existingFolder.folderName;
      } else {
        state.pendingFolderName = suggestedFolder.folderName.trim();
      }
    }
    renderFolders();
    setStatus("분석 결과를 반영했습니다.", "success");
  } catch (error) {
    const message = describeError(error);
    setStatus(
      state.pendingFolderName ? `${message} 이전 추천 폴더를 유지합니다.` : message,
      "error"
    );
  } finally {
    // 버튼 상태 원래대로 복구
    els.analyzeButton.classList.remove("analyzing");
    if (aiText) aiText.textContent = "AI 분석";
    setBusy(false);
  }
}

async function deleteCurrentBookmark() {
  if (!state.savedBookmarkId) {
    window.close();
    return;
  }

  if (state.busy) {
    return;
  }

  setBusy(true);
  setStatus("삭제 중...");
  try {
    await deleteBookmark(state.savedBookmarkId);
    state.savedBookmarkId = null;
    setStatus("삭제되었습니다.", "success");
    setTimeout(() => window.close(), 800);
  } catch (error) {
    setStatus(describeError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function handleProviderClick(event) {
  const provider = event.target.closest("[data-provider]")?.dataset.provider;
  if (!provider) {
    return;
  }

  setBusy(true);
  setStatus("로그인 중...");
  try {
    state.member = await loginWithProvider(provider);
    await setStoredMember(state.member);
    await loadFolders();
    showOnly("save");
    setStatus("로그인되었습니다.", "success");
    setBusy(false);
    await maybeAutoSave();
  } catch (error) {
    await clearTokens();
    setStatus(error?.message || "로그인에 실패했습니다.", "error");
  } finally {
    setBusy(false);
  }
}

async function ensureSession() {
  try {
    state.member = await getMember();
    await setStoredMember(state.member);
    await loadFolders();
    showOnly("save");
    setStatus("");
    return true;
  } catch {
    await clearTokens();
    showOnly("login");
    setStatus("로그인이 필요합니다.");
    return false;
  }
}

function fillSettingsFields() {
  if (els.settingsApiBaseUrl) els.settingsApiBaseUrl.value = state.settings?.apiBaseUrl || "";
  if (els.settingsSaveMode) els.settingsSaveMode.value = state.settings?.saveMode || "silent";
  if (els.settingsDefaultProvider) els.settingsDefaultProvider.value = state.settings?.defaultProvider || "google";
  if (els.settingsTheme) els.settingsTheme.value = state.settings?.theme || "system";
  
  const oauthUrl = getRedirectURL("callback");
  if (els.settingsRedirectUrl) els.settingsRedirectUrl.value = oauthUrl;

  if (els.settingsApiServerGroup) {
    if (!IS_DEV) {
      els.settingsApiServerGroup.style.display = "none";
      if (els.settingsApiBaseUrl) els.settingsApiBaseUrl.removeAttribute("required");
    } else {
      els.settingsApiServerGroup.style.display = "flex";
      if (els.settingsApiBaseUrl) els.settingsApiBaseUrl.setAttribute("required", "");
    }
  }
  if (els.settingsOauthRedirectGroup) {
    if (!IS_DEV) {
      els.settingsOauthRedirectGroup.style.display = "none";
    } else {
      els.settingsOauthRedirectGroup.style.display = "flex";
    }
  }

  // Update account info
  if (state.member?.email) {
    if (els.settingsUserEmail) els.settingsUserEmail.value = state.member.email;
    els.settingsAccountLabel?.classList.remove("hidden");
  } else {
    els.settingsAccountLabel?.classList.add("hidden");
  }
}

function bindEvents() {
  els.optionsButton.addEventListener("click", () => {
    // Find active panel
    if (!els.unsupportedPanel.classList.contains("hidden")) {
      state.activePanelBeforeSettings = "unsupported";
    } else if (!els.loginPanel.classList.contains("hidden")) {
      state.activePanelBeforeSettings = "login";
    } else {
      state.activePanelBeforeSettings = "save";
    }

    showOnly("settings");
    fillSettingsFields();
    
    els.headerTitle.textContent = "설정";
    els.optionsButton.classList.add("hidden");
    els.backButton.classList.remove("hidden");
    document.body.style.width = "450px";
  });

  els.backButton.addEventListener("click", () => {
    showOnly(state.activePanelBeforeSettings || "save");

    els.headerTitle.textContent = "Relink";
    els.optionsButton.classList.remove("hidden");
    els.backButton.classList.add("hidden");
    document.body.style.width = "360px";
  });

  els.settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus("설정 저장 중...");
    try {
      const newSettings = {
        apiBaseUrl: els.settingsApiBaseUrl.value.trim(),
        saveMode: els.settingsSaveMode.value,
        defaultProvider: els.settingsDefaultProvider.value,
        theme: els.settingsTheme.value
      };
      await setSettings(newSettings);
      state.settings = newSettings;
      
      applyTheme(newSettings.theme);
      setStatus("설정이 저장되었습니다.", "success");
      
      setTimeout(() => {
        els.backButton.click();
      }, 800);
    } catch (error) {
      setStatus(error?.message || "설정 저장에 실패했습니다.", "error");
    } finally {
      setBusy(false);
    }
  });

  els.settingsTheme.addEventListener("change", () => {
    applyTheme(els.settingsTheme.value);
  });

  els.settingsLogoutButton.addEventListener("click", async () => {
    setBusy(true);
    setStatus("로그아웃 중...");
    try {
      await logout();
      await clearTokens();
      state.member = null;
      state.folders = [];
      
      await ensureSession();
      state.activePanelBeforeSettings = "login";
      
      els.settingsAccountLabel?.classList.add("hidden");
      if (els.settingsUserEmail) els.settingsUserEmail.value = "";
      
      setStatus("로그아웃되었습니다.", "success");
      
      setTimeout(() => {
        els.backButton.click();
      }, 800);
    } catch (error) {
      setStatus(error?.message || "로그아웃에 실패했습니다.", "error");
    } finally {
      setBusy(false);
    }
  });

  els.closeButton.addEventListener("click", () => {
    window.close();
  });
  els.loginPanel.addEventListener("click", handleProviderClick);
  els.saveForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveBookmark();
  });
  els.detailsButton.addEventListener("click", () => {
    els.detailsPanel.classList.toggle("hidden");
    // 사용자가 직접 상세를 누르면 자동 닫힘 방지를 위해 임시 오픈 상태 해제
    state.tempDetailsOpenedByDropdown = false;
  });
  els.analyzeButton.addEventListener("click", analyzeCurrentLink);
  els.deleteButton.addEventListener("click", deleteCurrentBookmark);

  // 커스텀 폴더 선택 드롭다운 토글 및 닫기 바인딩
  if (els.folderSelectTrigger && els.folderOptionsListContainer && els.customFolderSelect) {
    els.folderSelectTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isHidden = els.folderOptionsListContainer.classList.contains("hidden");
      els.folderOptionsListContainer.classList.toggle("hidden", !isHidden);
      els.customFolderSelect.classList.toggle("active", isHidden);
      els.folderSelectTrigger.setAttribute("aria-expanded", String(isHidden));

      // 드롭다운이 열릴 때 상세가 닫혀있다면 강제로 열어 팝업창 크기 늘림
      if (isHidden) {
        if (els.detailsPanel && els.detailsPanel.classList.contains("hidden")) {
          els.detailsPanel.classList.remove("hidden");
          state.tempDetailsOpenedByDropdown = true;
        }
      } else {
        // 드롭다운이 수동으로 다시 닫힐 때 임시 열기 상태였으면 상세 닫기
        if (state.tempDetailsOpenedByDropdown && els.detailsPanel) {
          els.detailsPanel.classList.add("hidden");
          state.tempDetailsOpenedByDropdown = false;
        }
      }
    });

    document.addEventListener("click", () => {
      closeFolderDropdown();

      // 바깥을 눌러서 드롭다운이 닫힐 때 임시 열기 상태였으면 상세 닫기
      if (state.tempDetailsOpenedByDropdown && els.detailsPanel) {
        els.detailsPanel.classList.add("hidden");
        state.tempDetailsOpenedByDropdown = false;
      }
    });
  }
}

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

async function init() {
  collectElements();
  bindEvents();
  setStatus("");
  state.settings = await getSettings();
  applyTheme(state.settings?.theme || "system");

  const tabs = await queryActiveTab();
  state.tab = tabs?.[0] ?? null;
  if (!state.tab || !isSavableUrl(state.tab.url)) {
    showOnly("unsupported");
    els.unsupportedReason.textContent = "http 또는 https 페이지에서만 저장할 수 있습니다.";
    setStatus("저장 불가", "error");
    return;
  }

  renderTab();
  const sessionReady = await ensureSession();
  if (sessionReady) {
    await maybeAutoSave();
  }
}

init().catch((error) => {
  collectElements();
  showOnly("login");
  setStatus(error?.message || "초기화에 실패했습니다.", "error");
});
