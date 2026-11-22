import type { ExtensionMessage, ExtensionResponse } from "@/types/messages";
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  saveCurrentWindowTabs,
  restoreWorkspaceTabs,
  restoreSingleTab,
  deleteSavedTab,
} from "@/services/workspace.service";
import {
  getSettings,
  updateSettings,
} from "@/services/suspension.service";
import {
  getCurrentWindowTabs,
  activateTab,
  closeTab,
  discardTab,
} from "@/services/chrome/tabs.service";
import { openSidePanelForCurrentWindow } from "@/services/chrome/sidepanel.service";

export function initMessageRouter(): void {
  chrome.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (res: ExtensionResponse) => void) => {
      handleMessage(message)
        .then((data) => sendResponse({ success: true, data }))
        .catch((err: Error) => sendResponse({ success: false, error: err.message }));

      return true; // async response
    }
  );
}

async function handleMessage(message: ExtensionMessage): Promise<unknown> {
  switch (message.action) {
    case "GET_WORKSPACES":
      return getWorkspaces();

    case "CREATE_WORKSPACE": {
      const { name, color } = message.payload as { name: string; color: string };
      return createWorkspace(name, color);
    }

    case "UPDATE_WORKSPACE": {
      const { id, patch } = message.payload as { id: string; patch: Record<string, unknown> };
      return updateWorkspace(id, patch);
    }

    case "DELETE_WORKSPACE": {
      const { id } = message.payload as { id: string };
      return deleteWorkspace(id);
    }

    case "SAVE_CURRENT_WINDOW": {
      const { workspaceId } = message.payload as { workspaceId: string };
      return saveCurrentWindowTabs(workspaceId);
    }

    case "RESTORE_WORKSPACE": {
      const { workspaceId } = message.payload as { workspaceId: string };
      await restoreWorkspaceTabs(workspaceId);
      return true;
    }

    case "RESTORE_TAB": {
      const { url } = message.payload as { url: string };
      await restoreSingleTab(url);
      return true;
    }

    case "DELETE_TAB": {
      const { workspaceId, tabId } = message.payload as { workspaceId: string; tabId: string };
      return deleteSavedTab(workspaceId, tabId);
    }

    case "GET_OPEN_TABS":
      return getCurrentWindowTabs();

    case "ACTIVATE_TAB": {
      const { tabId } = message.payload as { tabId: number };
      await activateTab(tabId);
      return true;
    }

    case "CLOSE_TAB": {
      const { tabId } = message.payload as { tabId: number };
      await closeTab(tabId);
      return true;
    }

    case "DISCARD_TAB_NOW": {
      const { tabId } = message.payload as { tabId: number };
      const tab = await discardTab(tabId);
      if (!tab?.discarded) {
        throw new Error("Chrome could not unload this tab. The active tab cannot be suspended.");
      }
      return { discarded: true, tabId: tab.id };
    }

    case "GET_SETTINGS":
      return getSettings();

    case "UPDATE_SETTINGS": {
      const patch = message.payload as Record<string, unknown>;
      return updateSettings(patch);
    }

    case "OPEN_SIDE_PANEL":
      await openSidePanelForCurrentWindow();
      return true;

    default:
      throw new Error(`Unhandled message action: ${message.action}`);
  }
}
