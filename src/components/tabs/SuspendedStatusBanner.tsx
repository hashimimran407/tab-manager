import React from "react";
import { Zap } from "lucide-react";

interface SuspendedStatusBannerProps {
  count: number;
}

export const SuspendedStatusBanner: React.FC<SuspendedStatusBannerProps> = ({ count }) => {
  if (count <= 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[var(--stm-accent)]/10 px-3.5 py-2 text-xs text-[var(--stm-accent)] border border-[var(--stm-accent)]/20 font-medium tracking-tight">
      <Zap className="h-3.5 w-3.5 shrink-0 text-[var(--stm-accent)]" />
      <span>
        <strong>{count}</strong> tab{count > 1 ? "s" : ""} suspended to free memory.
      </span>
    </div>
  );
};
