import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stm-accent)]/50 active:opacity-85 disabled:opacity-40 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary: "bg-[var(--stm-accent-solid)] text-white hover:bg-[var(--stm-accent-hover)]",
    accent: "bg-[var(--stm-accent-solid)] text-white hover:brightness-110 shadow-xs",
    secondary: "bg-[var(--stm-surface-muted)] text-[var(--stm-ink)] hover:bg-[var(--stm-surface-muted)] border border-[var(--stm-border)]",
    outline: "border border-[var(--stm-border)] bg-[var(--stm-surface)] text-[var(--stm-ink)] hover:bg-[var(--stm-surface-muted)]",
    ghost: "bg-transparent text-[var(--stm-text-muted)] hover:text-[var(--stm-ink)] hover:bg-[var(--stm-ink)]/[0.04]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-xs font-semibold px-4 py-2 gap-2",
    lg: "text-sm font-semibold px-5 py-2.5 gap-2.5",
    icon: "h-9 w-9 p-2 rounded-lg",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
