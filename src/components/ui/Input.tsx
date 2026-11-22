import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className, ...props }) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--stm-text-muted)]">
          {icon}
        </div>
      )}
      <input
        className={twMerge(
          clsx(
            "w-full rounded-lg border border-[var(--stm-border)] bg-[var(--stm-surface)] py-2.5 text-xs text-[var(--stm-ink)] placeholder-[var(--stm-soft-text)] transition-colors duration-150 focus:border-[var(--stm-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--stm-accent)]/15 disabled:opacity-50",
            icon ? "pl-9 pr-3" : "px-3",
            className
          )
        )}
        {...props}
      />
    </div>
  );
};
