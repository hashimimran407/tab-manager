import { useState, useMemo } from "react";
import type { Workspace, SavedTab } from "@/types/workspace";

export interface SearchResultItem {
  tab: SavedTab;
  workspaceName: string;
  workspaceColor: string;
}

export interface WorkspaceSearchResult {
  id: string;
  name: string;
  color: string;
  tabCount: number;
}

export function useSearch(workspaces: Workspace[]) {
  const [query, setQuery] = useState("");

  const { results, workspaceResults } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { results: [], workspaceResults: [] };

    const results: SearchResultItem[] = [];
    const workspaceResults: WorkspaceSearchResult[] = [];
    for (const ws of workspaces) {
      if (ws.name.toLowerCase().includes(q)) {
        workspaceResults.push({ id: ws.id, name: ws.name, color: ws.color, tabCount: ws.tabs.length });
      }
      for (const tab of ws.tabs) {
        if (tab.title.toLowerCase().includes(q) || tab.url.toLowerCase().includes(q)) {
          results.push({
            tab,
            workspaceName: ws.name,
            workspaceColor: ws.color,
          });
        }
      }
    }
    return { results, workspaceResults };
  }, [workspaces, query]);

  return { query, setQuery, results, workspaceResults, isSearching: query.trim().length > 0 };
}
