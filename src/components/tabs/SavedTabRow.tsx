import React from "react";
import type { SavedTab } from "@/types/workspace";
import { X, ExternalLink, Globe } from "lucide-react";

interface SavedTabRowProps {
  tab: SavedTab;
  onRestore: (url: string) => void;
  onDelete: (tabId: string) => void;
}

export const SavedTabRow: React.FC<SavedTabRowProps> = ({
  tab,
  onRestore,
  onDelete,
}) => {
  return (
    <div
      className={`group flex items-center justify-between gap-1 py-1 px-1 rounded-lg transition-colors duration-150 ${
        "hover:bg-[var(--stm-ink)]/[0.04] text-[var(--stm-ink)]"
      }`}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden rounded-md px-2 py-2 text-left cursor-pointer"
        onClick={() => onRestore(tab.url)}
        title={tab.url}
      >
        <div
            className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 overflow-hidden ${
            "bg-[var(--stm-surface-muted)]"
          }`}
        >
          {tab.favicon ? (
            <img
              src={tab.favicon}
              alt=""
              className="h-3.5 w-3.5 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Globe
              className="h-3 w-3 text-[var(--stm-text-muted)]"
            />
          )}
        </div>

        <span
          className={`text-[13px] truncate tracking-tight ${tab.isSuspended ? "text-[var(--stm-text-muted)] font-normal" : "text-[var(--stm-ink)] font-medium"}`}
        >
          {tab.title || "Untitled Tab"}
        </span>

        {tab.isSuspended && (
          <span
            className="text-[11px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider shrink-0 bg-[var(--stm-warning-bg)] text-[var(--stm-warning)] border border-[var(--stm-warning)]/20"
          >
            Suspended
          </span>
        )}
      </button>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestore(tab.url);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-[var(--stm-ink)]/10 text-[var(--stm-text-muted)]"
          title="Open in new tab"
          aria-label={`Open ${tab.title || "saved tab"} in a new tab`}
        >
          <ExternalLink className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(tab.id);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer transition-colors hover:bg-rose-50 text-[var(--stm-text-muted)] hover:text-rose-600"
          title="Remove from workspace"
          aria-label={`Remove ${tab.title || "saved tab"} from workspace`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
