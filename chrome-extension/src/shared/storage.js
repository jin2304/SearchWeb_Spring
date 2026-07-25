import { browserApi, callWithCallback } from "./browserApi.js";
import { DEFAULT_SETTINGS } from "./config.js";

const KEYS = Object.freeze({
  settings: "settings",
  tokens: "tokens",
  member: "member"
});

async function getStore(defaults) {
  return callWithCallback(browserApi.storage.local, browserApi.storage.local.get, defaults);
}

async function setStore(values) {
  await callWithCallback(browserApi.storage.local, browserApi.storage.local.set, values);
}

async function removeStore(keys) {
  await callWithCallback(browserApi.storage.local, browserApi.storage.local.remove, keys);
}

export async function getSettings() {
  const result = await getStore({ [KEYS.settings]: DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS, ...(result[KEYS.settings] ?? {}) };
}

export async function setSettings(settings) {
  await setStore({ [KEYS.settings]: { ...DEFAULT_SETTINGS, ...settings } });
}

export async function getTokens() {
  const result = await getStore({ [KEYS.tokens]: null });
  return result[KEYS.tokens];
}

export async function setTokens(tokens) {
  await setStore({ [KEYS.tokens]: tokens });
}

export async function clearTokens() {
  await removeStore([KEYS.tokens, KEYS.member]);
}

export async function getStoredMember() {
  const result = await getStore({ [KEYS.member]: null });
  return result[KEYS.member];
}

export async function setStoredMember(member) {
  await setStore({ [KEYS.member]: member });
}