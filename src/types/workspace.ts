export interface SavedTab {
  id: string;
  workspaceId: string;
  url: string;
  title: string;
  favicon?: string;
  savedAt: number;
  position: number;
  isSuspended?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  isCollapsed?: boolean;
  tabs: SavedTab[];
}
