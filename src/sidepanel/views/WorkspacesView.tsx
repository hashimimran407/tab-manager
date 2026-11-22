import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Workspace } from "@/types/workspace";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { WorkspaceModal } from "@/components/workspace/WorkspaceModal";
import { EmptyState } from "@/components/layout/EmptyState";
import { Globe, X, Zap, ChevronDown, ChevronUp } from "lucide-react";
import type { ExtensionMessage, ExtensionResponse } from "@/types/messages";

interface WorkspacesViewProps {
  workspaces: Workspace[];
  onCreateWorkspace: (name: string, color: string) => Promise<{ success: boolean; error?: string }>;
  onSaveCurrentWindow: (workspaceId: string) => void;
  onToggleCollapse: (id: string, isCollapsed: boolean) => void;
  onRestoreAll: (workspaceId: string) => void;
  onRestoreTab: (url: string) => void;
  onDeleteTab: (workspaceId: string, tabId: string) => void;
  onOpenSettings: (ws?: Workspace) => void;
  onRenameWorkspace: (workspace: Workspace, name: string, color: string) => Promise<{ success: boolean; error?: string }>;
  onSaveTabToWorkspace: (workspaceId: string, tabId: number) => Promise<{ saved: boolean; reason?: string }>;
}

export const WorkspacesView: React.FC<WorkspacesViewProps> = ({
  workspaces,
  onCreateWorkspace,
  onSaveCurrentWindow,
  onToggleCollapse,
  onRestoreAll,
  onRestoreTab,
  onDeleteTab,
  onOpenSettings,
  onRenameWorkspace,
  onSaveTabToWorkspace,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workspaceToRename, setWorkspaceToRename] = useState<Workspace | null>(null);
  const [openTabs, setOpenTabs] = useState<chrome.tabs.Tab[]>([]);
  const [showOpenTabs, setShowOpenTabs] = useState(true);
  const [suspensionFeedback, setSuspensionFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const tabsRequestId = useRef(0);
  const currentWindowId = useRef<number | null>(null);

  const fetchOpenTabs = useCallback(async () => {
    const requestId = ++tabsRequestId.current;
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      // Ignore an older query if a newer tab event already requested a refresh.
      if (requestId === tabsRequestId.current) {
        if (tabs[0]?.windowId !== undefined) currentWindowId.current = tabs[0].windowId;
        setOpenTabs(tabs);
      }
    } catch {
      // Ignored
    }
  }, []);

  useEffect(() => {
    void fetchOpenTabs();

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      // Invalidate any query started before this event so it cannot overwrite
      // the immediate event-driven state update with an older snapshot.
      tabsRequestId.current++;
      if (refreshTimer) clearTimeout(refreshTimer);
      // Coalesce related Chrome events; create/delete changes render immediately.
      refreshTimer = setTimeout(() => void fetchOpenTabs(), 5);
    };

    const handleCreated = (tab: chrome.tabs.Tab) => {
      if (tab.windowId === currentWindowId.current) {
        setOpenTabs((current) => current.some((item) => item.id === tab.id)
          ? current.map((item) => item.id === tab.id ? tab : item)
          : [...current, tab]);
      }
      scheduleRefresh();
    };

    const handleRemoved = (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
      if (removeInfo.windowId === currentWindowId.current) {
        setOpenTabs((current) => current.filter((tab) => tab.id !== tabId));
      }
      scheduleRefresh();
    };

    const handleUpdated = (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (tab.windowId === currentWindowId.current) {
        setOpenTabs((current) => current.map((item) => item.id === tab.id ? tab : item));
      }
      scheduleRefresh();
    };

    const handleActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      if (activeInfo.windowId === currentWindowId.current) {
        setOpenTabs((current) => current.map((tab) => ({
          ...tab,
          active: tab.id === activeInfo.tabId,
        })));
      }
      scheduleRefresh();
    };

    const handleAttached = (_tabId: number, attachInfo: chrome.tabs.TabAttachInfo) => {
      if (attachInfo.newWindowId === currentWindowId.current) scheduleRefresh();
    };

    const handleDetached = (tabId: number, detachInfo: chrome.tabs.TabDetachInfo) => {
      if (detachInfo.oldWindowId === currentWindowId.current) {
        setOpenTabs((current) => current.filter((tab) => tab.id !== tabId));
      }
      scheduleRefresh();
    };

    chrome.tabs.onCreated.addListener(handleCreated);
    chrome.tabs.onRemoved.addListener(handleRemoved);
    chrome.tabs.onUpdated.addListener(handleUpdated);
    chrome.tabs.onActivated.addListener(handleActivated);
    chrome.tabs.onAttached.addListener(handleAttached);
    chrome.tabs.onDetached.addListener(handleDetached);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      chrome.tabs.onCreated.removeListener(handleCreated);
      chrome.tabs.onRemoved.removeListener(handleRemoved);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      chrome.tabs.onActivated.removeListener(handleActivated);
      chrome.tabs.onAttached.removeListener(handleAttached);
      chrome.tabs.onDetached.removeListener(handleDetached);
    };
  }, [fetchOpenTabs]);

  const handleActivate = async (tabId: number) => {
    const msg: ExtensionMessage = { action: "ACTIVATE_TAB", payload: { tabId } };
    await chrome.runtime.sendMessage(msg);
    void fetchOpenTabs();
  };

  const handleClose = async (tabId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg: ExtensionMessage = { action: "CLOSE_TAB", payload: { tabId } };
    await chrome.runtime.sendMessage(msg);
    void fetchOpenTabs();
  };

  const handleDiscard = async (tabId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg: ExtensionMessage = { action: "DISCARD_TAB_NOW", payload: { tabId } };
    try {
      const response = await chrome.runtime.sendMessage(msg) as ExtensionResponse;
      if (!response.success) throw new Error(response.error || "Chrome could not suspend this tab.");
      setSuspensionFeedback({ ok: true, message: "Tab unloaded from memory. It reloads when you open it." });
    } catch (error) {
      setSuspensionFeedback({
        ok: false,
        message: error instanceof Error ? error.message : "Chrome could not suspend this tab.",
      });
    }
    await fetchOpenTabs();
    window.setTimeout(() => setSuspensionFeedback(null), 3500);
  };

  const handleCreateAttempt = async (name: string, color: string) => {
    await onCreateWorkspace(name, color);
  };

  const handleWorkspaceDrop = async (workspaceId: string, tabId: number) => {
    try {
      await onSaveTabToWorkspace(workspaceId, tabId);
    } catch (error) {
      console.warn("Could not save dropped tab:", error);
    }
  };

  return (
    <div className="space-y-4">
      {suspensionFeedback && (
        <div
          role="status"
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${suspensionFeedback.ok
            ? "border-[var(--stm-accent)]/25 bg-[var(--stm-accent)]/10 text-[var(--stm-ink)]"
            : "border-rose-300 bg-rose-50 text-rose-800"}`}
        >
          {suspensionFeedback.message}
        </div>
      )}
      {/* iOS-Style Active Window Tabs Grouped Container */}
      <div className="rounded-2xl border border-[var(--stm-border)] bg-[var(--stm-surface)] p-3">
        <button
          type="button"
          className="flex w-full items-center justify-between cursor-pointer text-left"
          onClick={() => setShowOpenTabs((visible) => !visible)}
          aria-expanded={showOpenTabs}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--stm-accent)]" />
            <span className="text-[13px] font-semibold text-[var(--stm-ink)]">
              Open tabs in this window ({openTabs.length})
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[var(--stm-text-muted)] hover:text-[var(--stm-ink)] font-medium transition-colors">
            <span>{showOpenTabs ? "Collapse" : "Expand"}</span>
            {showOpenTabs ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </div>
        </button>

        {showOpenTabs && (
          <div className="mt-2.5 max-h-56 overflow-y-auto space-y-1 pr-1">
            {openTabs.map((tab, index) => (
              <div
                key={tab.id}
                draggable={Boolean(tab.id)}
                onDragStart={(event) => {
                  if (!tab.id) return;
                  event.dataTransfer.effectAllowed = "copy";
                  event.dataTransfer.setData("application/x-smart-tab-id", String(tab.id));
                  event.dataTransfer.setData("text/plain", String(tab.id));
                }}
                className={`stm-tab-enter flex min-h-10 cursor-grab items-center justify-between rounded-lg px-1 py-1 text-xs transition-colors group active:cursor-grabbing ${
                  tab.active
                    ? "bg-[var(--stm-surface-muted)] text-[var(--stm-ink)] font-semibold"
                    : "text-[var(--stm-text-muted)] hover:bg-[var(--stm-surface-muted)] hover:text-[var(--stm-ink)]"
                }`}
                style={{ animationDelay: `${Math.min(index * 18, 90)}ms` }}
                title={tab.url}
              >
                <button
                  type="button"
                  disabled={!tab.id}
                  onClick={() => tab.id && handleActivate(tab.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-md px-1 py-1.5 text-left cursor-pointer disabled:cursor-default"
                  aria-label={`Switch to ${tab.title || "untitled tab"}`}
                  title={tab.url}
                >
                  <div className="h-5 w-5 rounded-[6px] bg-[var(--stm-surface-muted)] flex items-center justify-center shrink-0 overflow-hidden">
                    {tab.favIconUrl ? (
                      <img src={tab.favIconUrl} alt="" className="h-3.5 w-3.5 object-contain" />
                    ) : (
                      <Globe className="h-3 w-3 text-[var(--stm-text-muted)]" />
                    )}
                  </div>
                  <span className="truncate tracking-tight">{tab.title || "Untitled tab"}</span>
                  {tab.discarded && (
                    <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-[var(--stm-warning-bg)] text-[var(--stm-warning)] font-semibold uppercase shrink-0">
                      Suspended
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1 ml-2">
                  {!tab.active && !tab.discarded && tab.id && (
                    <button
                      onClick={(e) => handleDiscard(tab.id!, e)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--stm-text-muted)] hover:bg-[var(--stm-accent)]/10 hover:text-[var(--stm-accent)] cursor-pointer"
                      title="Suspend tab to save memory"
                      aria-label="Suspend tab to save memory"
                    >
                      <Zap className="h-3 w-3" />
                    </button>
                  )}
                  {tab.id && (
                    <button
                      onClick={(e) => handleClose(tab.id!, e)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--stm-text-muted)] hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      title="Close tab"
                      aria-label="Close tab"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspaces Section */}
      <div>
        <WorkspaceHeader onNewWorkspace={() => setIsModalOpen(true)} />

        {workspaces.length === 0 ? (
          <EmptyState
            title="No Workspaces Yet"
            description="Create your first workspace to organize and group project tabs."
            actionText="Create Workspace"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                onToggleCollapse={onToggleCollapse}
                onSaveCurrentWindow={onSaveCurrentWindow}
                onRestoreAll={onRestoreAll}
                onRestoreTab={onRestoreTab}
                onDeleteTab={onDeleteTab}
                onOpenSettings={onOpenSettings}
                onRename={setWorkspaceToRename}
                onDropTab={handleWorkspaceDrop}
              />
            ))}
          </div>
        )}
      </div>

      <WorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateAttempt}
      />
      <WorkspaceModal
        isOpen={workspaceToRename !== null}
        onClose={() => setWorkspaceToRename(null)}
        onSave={(name, color) => workspaceToRename ? onRenameWorkspace(workspaceToRename, name, color) : undefined}
        initialName={workspaceToRename?.name ?? ""}
        initialColor={workspaceToRename?.color}
        mode="edit"
      />
    </div>
  );
};
