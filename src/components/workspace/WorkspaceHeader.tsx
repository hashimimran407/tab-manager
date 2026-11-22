import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface WorkspaceHeaderProps {
  onNewWorkspace: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ onNewWorkspace }) => {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <h2 className="text-[14px] font-semibold text-[var(--stm-ink)]">
        Workspaces
      </h2>
      <Button
        variant="secondary"
        size="sm"
        className="text-xs h-8 px-3 rounded-lg"
        onClick={onNewWorkspace}
        aria-label="Create workspace"
      >
        <Plus className="h-3.5 w-3.5 mr-0.5 text-[var(--stm-accent)]" />
        New
      </Button>
    </div>
  );
};
