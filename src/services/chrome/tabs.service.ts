import { isRestrictedUrl } from "@/utils/url";

export async function getCurrentWindowTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({ currentWindow: true });
}

export async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  return chrome.tabs.query({});
}

export async function createTab(url: string, active = true): Promise<chrome.tabs.Tab> {
  return chrome.tabs.create({ url, active });
}

export async function activateTab(tabId: number): Promise<void> {
  await chrome.tabs.update(tabId, { active: true });
  const tab = await chrome.tabs.get(tabId);
  if (tab.windowId) {
    await chrome.windows.update(tab.windowId, { focused: true });
  }
}

export async function closeTab(tabId: number): Promise<void> {
  await chrome.tabs.remove(tabId);
}

export async function discardTab(tabId: number): Promise<chrome.tabs.Tab | undefined> {
  try {
    return await chrome.tabs.discard(tabId);
  } catch (err) {
    console.warn(`Tab ${tabId} could not be discarded:`, err);
    return undefined;
  }
}

export function isManageableTab(tab: chrome.tabs.Tab): boolean {
  return Boolean(tab.url && !isRestrictedUrl(tab.url));
}
