import { useState, useEffect, useCallback } from "react";
import type { Workspace } from "@/types/workspace";
import type { ExtensionMessage, ExtensionResponse } from "@/types/messages";
import { saveTabToWorkspace as saveTabToWorkspaceService } from "@/services/workspace.service";

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const msg: ExtensionMessage = { action: "GET_WORKSPACES" };
      const res: ExtensionResponse<Workspace[]> = await chrome.runtime.sendMessage(msg);
      if (res.success && res.data) {
        setWorkspaces(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const create = async (name: string, color: string): Promise<{ success: boolean; error?: string }> => {
    const msg: ExtensionMessage = {
      action: "CREATE_WORKSPACE",
      payload: { name, color },
    };
    const res: ExtensionResponse<Workspace> = await chrome.runtime.sendMessage(msg);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    await fetchWorkspaces();
    return { success: true };
  };

  const saveCurrentWindow = async (workspaceId: string) => {
    const msg: ExtensionMessage = {
      action: "SAVE_CURRENT_WINDOW",
      payload: { workspaceId },
    };
    await chrome.runtime.sendMessage(msg);
    await fetchWorkspaces();
  };

  const saveTabToWorkspace = async (workspaceId: string, tabId: number) => {
    const result = await saveTabToWorkspaceService(workspaceId, tabId);
    if (result.saved) await fetchWorkspaces();
    return result;
  };

  const toggleCollapse = async (id: string, isCollapsed: boolean) => {
    const msg: ExtensionMessage = {
      action: "UPDATE_WORKSPACE",
      payload: { id, patch: { isCollapsed } },
    };
    await chrome.runtime.sendMessage(msg);
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isCollapsed } : w))
    );
  };

  const rename = async (id: string, name: string, color: string) => {
    const msg: ExtensionMessage = {
      action: "UPDATE_WORKSPACE",
      payload: { id, patch: { name, color } },
    };
    const res: ExtensionResponse<Workspace> = await chrome.runtime.sendMessage(msg);
    if (!res.success) return { success: false, error: res.error };
    setWorkspaces((prev) => prev.map((workspace) =>
      workspace.id === id ? { ...workspace, name, color, updatedAt: Date.now() } : workspace
    ));
    return { success: true };
  };

  const deleteWs = async (id: string) => {
    const msg: ExtensionMessage = {
      action: "DELETE_WORKSPACE",
      payload: { id },
    };
    await chrome.runtime.sendMessage(msg);
    await fetchWorkspaces();
  };

  const restoreAll = async (workspaceId: string) => {
    const msg: ExtensionMessage = {
      action: "RESTORE_WORKSPACE",
      payload: { workspaceId },
    };
    await chrome.runtime.sendMessage(msg);
  };

  const restoreTab = async (url: string) => {
    const msg: ExtensionMessage = {
      action: "RESTORE_TAB",
      payload: { url },
    };
    await chrome.runtime.sendMessage(msg);
  };

  const deleteTab = async (workspaceId: string, tabId: string) => {
    const msg: ExtensionMessage = {
      action: "DELETE_TAB",
      payload: { workspaceId, tabId },
    };
    await chrome.runtime.sendMessage(msg);
    await fetchWorkspaces();
  };

  return {
    workspaces,
    isLoading,
    fetchWorkspaces,
    create,
    saveCurrentWindow,
    saveTabToWorkspace,
    toggleCollapse,
    rename,
    deleteWs,
    restoreAll,
    restoreTab,
    deleteTab,
  };
}
