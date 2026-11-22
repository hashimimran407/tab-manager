import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "secondary" | "subtle" | "warning" | "success";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-[var(--stm-ink)] text-[var(--stm-canvas)]",
    accent: "bg-[var(--stm-accent)]/12 text-[var(--stm-accent)] font-semibold",
    secondary: "bg-[var(--stm-surface-muted)] text-[var(--stm-ink)] border border-[var(--stm-border)]",
    subtle: "bg-[var(--stm-ink)]/[0.04] text-[var(--stm-text-muted)]",
    warning: "bg-amber-50 text-amber-900 border border-amber-200",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
