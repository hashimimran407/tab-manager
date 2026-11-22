import React from "react";
import { clsx } from "clsx";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  activeColor?: string; // Optional custom accent color
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, id, activeColor, "aria-label": ariaLabel }) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-[24px] w-[42px] shrink-0 cursor-pointer rounded-full transition-colors duration-250 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--stm-accent)]/40",
        checked ? (activeColor ? "" : "bg-[var(--stm-accent-solid)]") : "bg-[var(--stm-surface-muted)]",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      style={checked && activeColor ? { backgroundColor: activeColor } : undefined}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-[var(--stm-surface)] shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-transform duration-250 ease-in-out mt-[2px] ml-[2px]",
          checked ? "translate-x-[18px]" : "translate-x-0"
        )}
      />
    </button>
  );
};
