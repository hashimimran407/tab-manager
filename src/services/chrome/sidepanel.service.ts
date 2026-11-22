export async function openSidePanelForCurrentWindow(): Promise<void> {
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (currentTab?.windowId) {
    await chrome.sidePanel.open({ windowId: currentTab.windowId });
  }
}
