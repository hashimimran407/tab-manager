import React, { useState } from "react";
import type { Workspace } from "@/types/workspace";
import { ChevronDown, ChevronRight, Trash2, Plus, RotateCcw, Pencil, FolderPlus } from "lucide-react";
import { TabList } from "../tabs/TabList";

interface WorkspaceCardProps {
  workspace: Workspace;
  onToggleCollapse: (id: string, isCollapsed: boolean) => void;
  onSaveCurrentWindow: (id: string) => void;
  onRestoreAll: (id: string) => void;
  onRestoreTab: (url: string) => void;
  onDeleteTab: (workspaceId: string, tabId: string) => void;
  onOpenSettings?: (workspace: Workspace) => void;
  onRename?: (workspace: Workspace) => void;
  onDropTab?: (workspaceId: string, tabId: number) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  onToggleCollapse,
  onSaveCurrentWindow,
  onRestoreAll,
  onRestoreTab,
  onDeleteTab,
  onOpenSettings,
  onRename,
  onDropTab,
}) => {
  const isCollapsed = workspace.isCollapsed ?? false;
  const [isDropTarget, setIsDropTarget] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDropTarget(false);
    const tabId = Number(event.dataTransfer.getData("application/x-smart-tab-id") || event.dataTransfer.getData("text/plain"));
    if (Number.isInteger(tabId) && tabId > 0) onDropTab?.(workspace.id, tabId);
  };

  return (
    <div
      id={`workspace-${workspace.id}`}
      onDragOver={onDropTab ? (event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setIsDropTarget(true); } : undefined}
      onDragLeave={onDropTab ? (event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDropTarget(false); } : undefined}
      onDrop={onDropTab ? handleDrop : undefined}
      className={`stm-enter overflow-hidden rounded-2xl border bg-[var(--stm-surface)] text-[var(--stm-ink)] transition-all duration-200 ease-out ${isDropTarget ? "border-[var(--stm-accent)] ring-2 ring-[var(--stm-accent)]/20 shadow-[0_8px_24px_rgba(37,99,235,0.12)] scale-[1.01]" : "border-[var(--stm-border)]"}`}
    >
      {isDropTarget && (
        <div className="flex items-center justify-center gap-1.5 border-b border-[var(--stm-accent)]/15 bg-[var(--stm-accent)]/[0.06] px-3 py-2 text-[11px] font-semibold text-[var(--stm-accent)] animate-in fade-in duration-150">
          <FolderPlus className="h-3.5 w-3.5" /> Drop to save in {workspace.name}
        </div>
      )}
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          type="button"
          aria-expanded={!isCollapsed}
          onClick={() => onToggleCollapse(workspace.id, !isCollapsed)}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-1 text-left hover:text-[var(--stm-accent)] cursor-pointer"
        >
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: workspace.color || "var(--stm-accent)" }}
          />
          <span className="truncate text-[13px] font-semibold text-[var(--stm-ink)] flex items-center gap-1.5">
            {workspace.name}
            <span className="shrink-0 rounded-md bg-[var(--stm-surface-muted)] px-1.5 py-0.5 text-[10px] text-[var(--stm-text-muted)] font-medium">
              {workspace.tabs.length}
            </span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          {onRename && (
            <button
              onClick={() => onRename(workspace)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--stm-text-muted)] hover:text-[var(--stm-accent)] cursor-pointer hover:bg-[var(--stm-surface-muted)] transition-colors"
              title="Rename workspace"
              aria-label={`Rename ${workspace.name} workspace`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={() => onOpenSettings(workspace)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--stm-text-muted)] hover:text-rose-600 cursor-pointer hover:bg-[var(--stm-surface-muted)] transition-colors"
              title="Delete workspace"
              aria-label={`Delete ${workspace.name} workspace`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => onToggleCollapse(workspace.id, !isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--stm-text-muted)] hover:text-[var(--stm-ink)] cursor-pointer hover:bg-[var(--stm-surface-muted)] transition-colors"
            aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${workspace.name} workspace`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Tab List & Footer Actions */}
      {!isCollapsed && (
        <div className="px-2 pb-2.5 pt-0.5 bg-[var(--stm-surface)] border-t border-[var(--stm-border-subtle)]">
          <TabList
            tabs={workspace.tabs}
            onRestoreTab={onRestoreTab}
            onDeleteTab={(tabId) => onDeleteTab(workspace.id, tabId)}
          />

          <div className="flex items-center justify-between gap-2 pt-2.5 px-2 mt-1 border-t border-[var(--stm-border-subtle)] text-xs">
            <button
              onClick={() => onSaveCurrentWindow(workspace.id)}
              className="flex items-center gap-1.5 text-[var(--stm-accent)] hover:text-[var(--stm-accent-hover)] px-2 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Plus className="h-3 w-3" />
              Save open tabs
            </button>

            {workspace.tabs.length > 0 && (
              <button
                onClick={() => onRestoreAll(workspace.id)}
                className="flex items-center gap-1 text-[var(--stm-ink)] hover:text-[var(--stm-accent)] px-2 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Open all ({workspace.tabs.length})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
