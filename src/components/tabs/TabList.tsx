import React from "react";
import type { SavedTab } from "@/types/workspace";
import { SavedTabRow } from "./SavedTabRow";

interface TabListProps {
  tabs: SavedTab[];
  onRestoreTab: (url: string) => void;
  onDeleteTab: (tabId: string) => void;
}

export const TabList: React.FC<TabListProps> = ({
  tabs,
  onRestoreTab,
  onDeleteTab,
}) => {
  if (tabs.length === 0) {
    return (
      <div
        className="py-4 text-center text-[11px] font-medium text-[var(--stm-text-muted)]"
      >
        No tabs saved in this workspace yet.
      </div>
    );
  }

  return (
    <div className="space-y-0.5 py-1">
      {tabs.map((tab) => (
        <SavedTabRow
          key={tab.id}
          tab={tab}
          onRestore={onRestoreTab}
          onDelete={onDeleteTab}
        />
      ))}
    </div>
  );
};
