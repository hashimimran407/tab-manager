import type { Workspace, SavedTab } from "@/types/workspace";
import { STORAGE_KEYS, DEFAULT_WORKSPACE_COLORS } from "@/utils/constants";
import { getFromStorage, setToStorage } from "./chrome/storage.service";
import { getCurrentWindowTabs, isManageableTab, createTab } from "./chrome/tabs.service";

export async function getWorkspaces(): Promise<Workspace[]> {
  let workspaces = await getFromStorage<Workspace[]>(STORAGE_KEYS.WORKSPACES);
  if (!workspaces) {
    // Seed with realistic demo data matching user's design screenshot (Work workspace only)
    const initial: Workspace[] = [
      {
        id: "work-default",
        name: "Work",
        color: DEFAULT_WORKSPACE_COLORS[0],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isCollapsed: false,
        tabs: [
          {
            id: "tab_1",
            workspaceId: "work-default",
            url: "https://www.figma.com/design",
            title: "Figma | Design System UI Components",
            favicon: "https://www.google.com/s2/favicons?domain=figma.com",
            savedAt: Date.now() - 500000,
            position: 0,
            isSuspended: false,
          },
          {
            id: "tab_2",
            workspaceId: "work-default",
            url: "https://github.com/project/phoenix",
            title: "Dashboard - Project Phoenix",
            favicon: "https://www.google.com/s2/favicons?domain=github.com",
            savedAt: Date.now() - 400000,
            position: 1,
            isSuspended: false,
          },
          {
            id: "tab_3",
            workspaceId: "work-default",
            url: "https://docs.google.com/document/d/123",
            title: "Q4 Planning - Google Docs",
            favicon: "https://www.google.com/s2/favicons?domain=docs.google.com",
            savedAt: Date.now() - 300000,
            position: 2,
            isSuspended: false,
          },
          {
            id: "tab_4",
            workspaceId: "work-default",
            url: "https://notion.so/meeting-notes",
            title: "Meeting Notes - 11/01 Sync",
            favicon: "https://www.google.com/s2/favicons?domain=notion.so",
            savedAt: Date.now() - 250000,
            position: 3,
            isSuspended: false,
          },
          {
            id: "tab_5",
            workspaceId: "work-default",
            url: "https://staging.clientwebsite.com",
            title: "Client Website - Staging Preview",
            favicon: "",
            savedAt: Date.now() - 200000,
            position: 4,
            isSuspended: false,
          },
          {
            id: "tab_6",
            workspaceId: "work-default",
            url: "https://jira.company.com/browse/BUG-123",
            title: "BUG-123: Fix login issue on mobile safari",
            favicon: "https://www.google.com/s2/favicons?domain=atlassian.com",
            savedAt: Date.now() - 150000,
            position: 5,
            isSuspended: true, // Suspended tab representation as shown in screenshot
          },
          {
            id: "tab_7",
            workspaceId: "work-default",
            url: "https://app.slack.com/client/general",
            title: "#general - Team Channel Announcements",
            favicon: "https://www.google.com/s2/favicons?domain=slack.com",
            savedAt: Date.now() - 100000,
            position: 6,
            isSuspended: false,
          },
        ],
      },
    ];
    await setToStorage(STORAGE_KEYS.WORKSPACES, initial);
    return initial;
  }

  // Remove "research-default" workspace if it exists in user's storage from earlier
  if (workspaces.some((w) => w.id === "research-default" || w.name.toLowerCase() === "research")) {
    workspaces = workspaces.filter(
      (w) => w.id !== "research-default" && w.name.toLowerCase() !== "research"
    );
    await setToStorage(STORAGE_KEYS.WORKSPACES, workspaces);
  }

  return workspaces;
}

export async function saveWorkspaces(workspaces: Workspace[]): Promise<void> {
  await setToStorage(STORAGE_KEYS.WORKSPACES, workspaces);
}

export async function createWorkspace(name: string, color: string): Promise<Workspace> {
  const workspaces = await getWorkspaces();
  const newWorkspace: Workspace = {
    id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    color,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCollapsed: false,
    tabs: [],
  };
  workspaces.push(newWorkspace);
  await saveWorkspaces(workspaces);
  return newWorkspace;
}

export async function updateWorkspace(
  workspaceId: string,
  patch: Partial<Omit<Workspace, "id" | "createdAt">>
): Promise<Workspace | null> {
  const workspaces = await getWorkspaces();
  const index = workspaces.findIndex((w) => w.id === workspaceId);
  if (index === -1) return null;

  workspaces[index] = {
    ...workspaces[index],
    ...patch,
    updatedAt: Date.now(),
  };
  await saveWorkspaces(workspaces);
  return workspaces[index];
}

export async function deleteWorkspace(workspaceId: string): Promise<boolean> {
  const workspaces = await getWorkspaces();
  if (!workspaces.some((workspace) => workspace.id === workspaceId)) return false;
  const filtered = workspaces.filter((w) => w.id !== workspaceId);
  await saveWorkspaces(filtered);
  return true;
}

export async function saveCurrentWindowTabs(workspaceId: string): Promise<Workspace | null> {
  const workspaces = await getWorkspaces();
  const index = workspaces.findIndex((w) => w.id === workspaceId);
  if (index === -1) return null;

  const currentTabs = await getCurrentWindowTabs();
  const manageable = currentTabs.filter(isManageableTab);

  const newSavedTabs: SavedTab[] = manageable.map((tab, i) => ({
    id: `tab_${Date.now()}_${i}`,
    workspaceId,
    url: tab.url || "",
    title: tab.title || "Untitled Tab",
    favicon: tab.favIconUrl || (tab.url ? `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}` : undefined),
    savedAt: Date.now(),
    position: i,
    isSuspended: tab.discarded ?? false,
  }));

  // Append new tabs avoiding duplicate URLs in same workspace
  const existingUrls = new Set(workspaces[index].tabs.map((t) => t.url));
  const uniqueNewTabs = newSavedTabs.filter((t) => !existingUrls.has(t.url));

  workspaces[index].tabs = [...workspaces[index].tabs, ...uniqueNewTabs];
  workspaces[index].updatedAt = Date.now();

  await saveWorkspaces(workspaces);
  return workspaces[index];
}

export async function saveTabToWorkspace(workspaceId: string, tabId: number): Promise<{ saved: boolean; reason?: string }> {
  const workspaces = await getWorkspaces();
  const workspaceIndex = workspaces.findIndex((workspace) => workspace.id === workspaceId);
  if (workspaceIndex === -1) return { saved: false, reason: "Workspace not found." };

  const tab = await chrome.tabs.get(tabId);
  if (!isManageableTab(tab) || !tab.url) {
    return { saved: false, reason: "This page cannot be saved." };
  }

  const workspace = workspaces[workspaceIndex];
  if (workspace.tabs.some((savedTab) => savedTab.url === tab.url)) {
    return { saved: false, reason: "This tab is already saved in this workspace." };
  }

  workspace.tabs.push({
    id: `tab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    workspaceId,
    url: tab.url,
    title: tab.title || "Untitled Tab",
    favicon: tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(tab.url).hostname}`,
    savedAt: Date.now(),
    position: workspace.tabs.length,
    isSuspended: tab.discarded ?? false,
  });
  workspace.updatedAt = Date.now();
  await saveWorkspaces(workspaces);
  return { saved: true };
}

export async function restoreWorkspaceTabs(workspaceId: string): Promise<void> {
  const workspaces = await getWorkspaces();
  const ws = workspaces.find((w) => w.id === workspaceId);
  if (!ws || ws.tabs.length === 0) return;

  for (let i = 0; i < ws.tabs.length; i++) {
    const tab = ws.tabs[i];
    await createTab(tab.url, i === 0);
  }
}

export async function restoreSingleTab(url: string): Promise<void> {
  await createTab(url, true);
}

export async function deleteSavedTab(workspaceId: string, tabId: string): Promise<Workspace | null> {
  const workspaces = await getWorkspaces();
  const index = workspaces.findIndex((w) => w.id === workspaceId);
  if (index === -1) return null;

  workspaces[index].tabs = workspaces[index].tabs.filter((t) => t.id !== tabId);
  workspaces[index].updatedAt = Date.now();
  await saveWorkspaces(workspaces);
  return workspaces[index];
}
