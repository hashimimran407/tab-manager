import React from "react";
import type { SearchResultItem, WorkspaceSearchResult } from "@/hooks/useSearch";
import { Globe, ExternalLink, FolderOpen } from "lucide-react";

interface SearchResultsViewProps {
  results: SearchResultItem[];
  query: string;
  onRestoreTab: (url: string) => void;
  workspaceResults: WorkspaceSearchResult[];
  onOpenWorkspace: (id: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  results,
  query,
  onRestoreTab,
  workspaceResults,
  onOpenWorkspace,
}) => {
  const totalResults = results.length + workspaceResults.length;
  return (
    <div className="space-y-2">
      <div className="text-[11px] text-[var(--stm-text-muted)] font-medium px-1">
        Found {totalResults} result{totalResults !== 1 ? "s" : ""} matching "{query}"
      </div>

      {totalResults === 0 ? (
        <div className="p-8 text-center bg-[var(--stm-surface)]/70 rounded-[20px] border border-[var(--stm-border)]">
          <p className="text-xs text-[var(--stm-text-muted)]">No matching tabs or workspaces found.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {workspaceResults.map((workspace) => (
            <button
              key={`workspace-${workspace.id}`}
              type="button"
              onClick={() => onOpenWorkspace(workspace.id)}
              className="flex w-full items-center justify-between rounded-2xl border border-[var(--stm-border)] bg-[var(--stm-surface)] p-3 text-left transition-colors hover:border-[var(--stm-ink)]/20"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--stm-surface-muted)]">
                  <FolderOpen className="h-3.5 w-3.5" style={{ color: workspace.color }} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[var(--stm-ink)]">{workspace.name}</span>
                  <span className="block text-[11px] text-[var(--stm-text-muted)]">Workspace · {workspace.tabCount} saved tabs</span>
                </span>
              </span>
              <ExternalLink className="ml-2 h-3.5 w-3.5 shrink-0 text-[var(--stm-text-muted)]" />
            </button>
          ))}
          {results.map(({ tab, workspaceName, workspaceColor }) => (
            <div
              key={tab.id}
              className="flex items-center justify-between p-3 bg-[var(--stm-surface)] rounded-2xl border border-[var(--stm-border)] hover:border-[var(--stm-ink)]/20 transition-all shadow-[0_2px_8px_rgba(8,9,11,0.02)] cursor-pointer group active:scale-[0.99]"
              onClick={() => onRestoreTab(tab.url)}
            >
              <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                <div className="h-5 w-5 rounded-[6px] bg-[var(--stm-surface-muted)] flex items-center justify-center shrink-0 overflow-hidden">
                  {tab.favicon ? (
                    <img src={tab.favicon} alt="" className="h-3.5 w-3.5 object-contain" />
                  ) : (
                    <Globe className="h-3 w-3 text-[var(--stm-text-muted)]" />
                  )}
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-[var(--stm-ink)] truncate group-hover:text-[var(--stm-accent)] transition-colors">
                    {tab.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: workspaceColor }}
                    />
                    <span className="text-[11px] text-[var(--stm-text-muted)] font-medium">{workspaceName}</span>
                  </div>
                </div>
              </div>

              <ExternalLink className="h-3.5 w-3.5 text-[var(--stm-text-muted)] group-hover:text-[var(--stm-ink)] shrink-0 ml-2 transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
