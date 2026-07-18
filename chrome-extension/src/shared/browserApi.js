const api = globalThis.browser?.runtime ? globalThis.browser : globalThis.chrome;

if (!api) {
  throw new Error("Browser extension API is not available.");
}

export const browserApi = api;

export function callWithCallback(context, method, ...args) {
  return new Promise((resolve, reject) => {
    method.call(context, ...args, (result) => {
      const error = browserApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(result);
    });
  });
}

export async function queryActiveTab() {
  return callWithCallback(browserApi.tabs, browserApi.tabs.query, {
    active: true,
    currentWindow: true
  });
}

export function getRedirectURL(path = "callback") {
  return browserApi.identity.getRedirectURL(path);
}

export function launchWebAuthFlow(url, interactive = true) {
  return new Promise((resolve, reject) => {
    browserApi.identity.launchWebAuthFlow({ url, interactive }, (responseUrl) => {
      const error = browserApi.runtime?.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!responseUrl) {
        reject(new Error("OAuth login was cancelled."));
        return;
      }
      resolve(responseUrl);
    });
  });
}