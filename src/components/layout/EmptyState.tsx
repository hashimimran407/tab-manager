import React from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center bg-[var(--stm-surface)]/70 rounded-2xl border border-[var(--stm-border)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="p-3 bg-[var(--stm-surface-muted)] rounded-2xl text-[var(--stm-ink)] mb-2.5">
        <FolderPlus className="h-5 w-5 text-[var(--stm-accent)]" />
      </div>
      <h4 className="text-xs font-bold text-[var(--stm-ink)] tracking-tight">{title}</h4>
      <p className="text-[11px] text-[var(--stm-text-muted)] mt-1 max-w-[210px] leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button size="sm" variant="primary" className="mt-3.5 text-xs" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
