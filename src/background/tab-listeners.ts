import { forgetTabActivity, recordTabActivity } from "@/services/suspension.service";

export function initTabListeners(): void {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    void recordTabActivity(tabId);
  });

  chrome.tabs.onCreated.addListener((tab) => {
    if (tab.id !== undefined) void recordTabActivity(tab.id);
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    void forgetTabActivity(tabId);
  });
}
