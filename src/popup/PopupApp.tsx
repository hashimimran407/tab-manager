import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useSettings } from "@/hooks/useSettings";
import { LogoMark } from "@/components/brand/LogoMark";
import { PanelRightOpen, Check, ChevronRight, Folder, Globe, Zap } from "lucide-react";

export const PopupApp: React.FC = () => {
  const { workspaces, saveTabToWorkspace } = useWorkspaces();
  const { settings, update: updateSettings } = useSettings();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [suspendedTabs, setSuspendedTabs] = useState<chrome.tabs.Tab[]>([]);

  useEffect(() => {
    if (!workspaces.some((workspace) => workspace.id === selectedWorkspaceId)) {
      setSelectedWorkspaceId(workspaces[0]?.id ?? "");
    }
  }, [workspaces, selectedWorkspaceId]);

  const refreshSuspendedTabs = useCallback(async () => {
    try {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      setSuspendedTabs(tabs.filter((tab) => tab.discarded));
    } catch (error) {
      console.warn("Could not load suspended tabs:", error);
    }
  }, []);

  useEffect(() => {
    void refreshSuspendedTabs();
    const handleTabCreated = () => void refreshSuspendedTabs();
    const handleTabRemoved = () => void refreshSuspendedTabs();
    const handleTabUpdated = (_tabId: number, changes: chrome.tabs.TabChangeInfo) => {
      if (changes.discarded !== undefined) void refreshSuspendedTabs();
    };
    chrome.tabs.onCreated.addListener(handleTabCreated);
    chrome.tabs.onRemoved.addListener(handleTabRemoved);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    chrome.tabs.onAttached.addListener(handleTabCreated);
    chrome.tabs.onDetached.addListener(handleTabRemoved);
    return () => {
      chrome.tabs.onCreated.removeListener(handleTabCreated);
      chrome.tabs.onRemoved.removeListener(handleTabRemoved);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      chrome.tabs.onAttached.removeListener(handleTabCreated);
      chrome.tabs.onDetached.removeListener(handleTabRemoved);
    };
  }, [refreshSuspendedTabs]);

  const handleSaveToSelectedWorkspace = async () => {
    if (!selectedWorkspaceId) {
      await openSidePanel();
      return;
    }
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab?.id) return;
    const result = await saveTabToWorkspace(selectedWorkspaceId, currentTab.id);
    if (result.saved) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const openSuspendedTab = async (tab: chrome.tabs.Tab) => {
    if (!tab.id) return;
    try {
      await chrome.tabs.update(tab.id, { active: true });
      window.close();
    } catch (error) {
      console.warn("Could not reopen suspended tab:", error);
    }
  };

  const openSidePanel = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        window.close();
      }
    } catch (err) {
      console.warn("Direct side panel open fallback:", err);
      window.open(chrome.runtime.getURL("src/sidepanel/index.html"), "_blank");
    }
  };

  return (
    <div className="stm-enter w-[300px] p-4 space-y-4 font-sans bg-[var(--stm-canvas)] text-[var(--stm-ink)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark size={26} className="shrink-0 rounded-lg" />
          <div>
            <h2 className="text-sm font-semibold text-[var(--stm-ink)]">Smart Tab Manager</h2>
            <p className="text-[11px] text-[var(--stm-text-muted)]">Keep your tabs organized</p>
          </div>
        </div>

      </div>

      <Button
        className="w-full text-xs font-semibold py-2.5 justify-center rounded-lg"
        variant="accent"
        onClick={handleSaveToSelectedWorkspace}
      >
        {savedSuccess ? (
          <>
            <Check className="h-3.5 w-3.5 mr-1 text-[var(--stm-accent)]" /> Current Tab Saved!
          </>
        ) : workspaces.length === 0 ? (
          "Open manager to create a workspace"
        ) : (
          "Save current tab"
        )}
      </Button>

      <div className="rounded-xl border border-[var(--stm-border)] bg-[var(--stm-surface)] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--stm-ink)]">Your workspaces</span>
          <span className="rounded-md bg-[var(--stm-surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--stm-text-muted)]">{workspaces.length}</span>
        </div>
        <div className="max-h-28 space-y-1 overflow-y-auto">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              aria-pressed={selectedWorkspaceId === workspace.id}
              onClick={() => setSelectedWorkspaceId(workspace.id)}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors ${selectedWorkspaceId === workspace.id ? "bg-[var(--stm-accent)]/10" : "hover:bg-[var(--stm-surface-muted)]"}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Folder className="h-3.5 w-3.5 shrink-0" style={{ color: workspace.color }} />
                <span className="truncate text-xs text-[var(--stm-ink)]">{workspace.name}</span>
              </span>
              <span className="ml-2 shrink-0 text-[11px] text-[var(--stm-text-muted)]">{workspace.tabs.length} tabs</span>
            </button>
          ))}
          {workspaces.length === 0 && <p className="px-1 py-1 text-[11px] leading-relaxed text-[var(--stm-text-muted)]">Open the manager to create your first workspace.</p>}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--stm-border)] bg-[var(--stm-surface)] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--stm-ink)]">
            <Zap className="h-3.5 w-3.5 text-[var(--stm-accent)]" /> Suspended tabs
          </span>
          <span className="rounded-md bg-[var(--stm-surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--stm-text-muted)]">{suspendedTabs.length}</span>
        </div>
        {suspendedTabs.length ? (
          <div className="max-h-28 space-y-1 overflow-y-auto">
            {suspendedTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => void openSuspendedTab(tab)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-[var(--stm-surface-muted)]"
                title={`${tab.title || "Suspended tab"} · Click to reopen`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--stm-surface-muted)]">
                  {tab.favIconUrl ? <img src={tab.favIconUrl} alt="" className="h-3.5 w-3.5 object-contain" /> : <Globe className="h-3 w-3 text-[var(--stm-text-muted)]" />}
                </span>
                <span className="truncate text-xs text-[var(--stm-ink)]">{tab.title || tab.url || "Suspended tab"}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-1 text-[11px] text-[var(--stm-text-muted)]">No suspended tabs in this window.</p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-[var(--stm-surface-muted)] px-3 py-2.5">
        <div>
          <div className="text-xs font-semibold text-[var(--stm-ink)]">Save memory</div>
          <div className="text-[11px] text-[var(--stm-text-muted)]">Auto-suspend inactive tabs</div>
        </div>
        <Switch
          aria-label="Enable automatic tab suspension"
          checked={settings.autoSuspendEnabled}
          activeColor="var(--stm-accent-solid)"
          onChange={(checked) => updateSettings({ autoSuspendEnabled: checked })}
        />
      </div>

      <div className="pt-1 border-t border-[var(--stm-border)]">
        <button
          onClick={openSidePanel}
          className="w-full flex items-center justify-between text-xs text-[var(--stm-ink)] hover:text-[var(--stm-accent)] font-semibold py-2 cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-2">
            <PanelRightOpen className="h-4 w-4" />
            Open tab manager
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--stm-text-muted)]" />
        </button>
      </div>

    </div>
  );
};
