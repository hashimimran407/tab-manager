import React, { useState } from "react";
import { HeaderBar } from "@/components/layout/HeaderBar";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { WorkspacesView } from "./views/WorkspacesView";
import { SearchResultsView } from "./views/SearchResultsView";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useSettings } from "@/hooks/useSettings";
import { useSearch } from "@/hooks/useSearch";
import { Search, Settings as SettingsIcon } from "lucide-react";

export const SidePanelApp: React.FC = () => {
  const {
    workspaces,
    create,
    saveCurrentWindow,
    toggleCollapse,
    restoreAll,
    restoreTab,
    deleteTab,
    deleteWs,
    rename,
    saveTabToWorkspace,
  } = useWorkspaces();

  const { settings, update: updateSettings } = useSettings();
  const { query, setQuery, results, workspaceResults, isSearching } = useSearch(workspaces);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const handleOpenWorkspaceSettings = (ws?: import("@/types/workspace").Workspace) => {
    if (ws) {
      if (confirm(`Do you want to delete workspace "${ws.name}"?`)) {
        deleteWs(ws.id);
      }
    } else {
      setIsSettingsOpen(true);
    }
  };

  const handleSearchWorkspaceOpen = (workspaceId: string) => {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (workspace?.isCollapsed) void toggleCollapse(workspaceId, false);
    setQuery("");
    window.setTimeout(() => {
      document.getElementById(`workspace-${workspaceId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <div className="flex h-screen flex-col bg-[var(--stm-canvas)] text-[var(--stm-ink)] font-sans">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--stm-border)] bg-[var(--stm-surface)] px-4 py-3">
        <HeaderBar title="Smart Tab Manager" />

        <div className="flex items-center gap-2">

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-[var(--stm-text-muted)] hover:text-[var(--stm-ink)] cursor-pointer rounded-full hover:bg-[var(--stm-ink)]/[0.05] transition-colors"
            title="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        <Input
          placeholder="Search tabs and workspaces"
          icon={<Search className="h-3.5 w-3.5" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {isSearching ? (
          <SearchResultsView
            results={results}
            workspaceResults={workspaceResults}
            query={query}
            onRestoreTab={restoreTab}
            onOpenWorkspace={handleSearchWorkspaceOpen}
          />
        ) : (
          <WorkspacesView
            workspaces={workspaces}
            onCreateWorkspace={create}
            onSaveCurrentWindow={saveCurrentWindow}
            onToggleCollapse={toggleCollapse}
            onRestoreAll={restoreAll}
            onRestoreTab={restoreTab}
            onDeleteTab={deleteTab}
            onOpenSettings={handleOpenWorkspaceSettings}
            onRenameWorkspace={(workspace, name, color) => rename(workspace.id, name, color)}
            onSaveTabToWorkspace={saveTabToWorkspace}
          />
        )}
      </div>

      <div className="sticky bottom-0 border-t border-[var(--stm-border)] bg-[var(--stm-surface)] px-4 py-3 flex items-center justify-between z-20">
        <div className="relative">
          <div className="text-xs font-bold text-[var(--stm-ink)] tracking-tight">
            Auto-suspend tabs
          </div>
          <button
            type="button"
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="mt-0.5 text-xs text-[var(--stm-accent)] hover:text-[var(--stm-accent-hover)] font-semibold cursor-pointer transition-colors"
            aria-label={`Choose auto-suspend delay. Current delay: ${settings.suspendAfterMinutes} minutes`}
          >
            After {settings.suspendAfterMinutes} {settings.suspendAfterMinutes === 1 ? "minute" : "minutes"} ▾
          </button>

          {/* Quick preset dropdown */}
          {showTimeDropdown && (
            <div className="absolute bottom-10 left-0 bg-[var(--stm-surface)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-[var(--stm-border)] py-1.5 z-50 text-xs w-32 animate-in fade-in zoom-in-95 duration-150">
              {[15, 30, 45, 60, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    updateSettings({ suspendAfterMinutes: mins });
                    setShowTimeDropdown(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 hover:bg-[var(--stm-canvas)] cursor-pointer text-[11px] transition-colors ${
                    settings.suspendAfterMinutes === mins ? "font-bold text-[var(--stm-accent)]" : "text-[var(--stm-ink)]"
                  }`}
                >
                  {mins} minutes
                </button>
              ))}
            </div>
          )}
        </div>

        <Switch
          aria-label="Enable automatic tab suspension"
          checked={settings.autoSuspendEnabled}
          activeColor="var(--stm-accent-solid)"
          onChange={(checked) => updateSettings({ autoSuspendEnabled: checked })}
        />
      </div>

      {/* In-Panel Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
