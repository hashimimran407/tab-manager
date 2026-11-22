import React from "react";
import { LogoMark } from "@/components/brand/LogoMark";

interface HeaderBarProps {
  title?: string;
  subtitle?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title = "Smart Tab Manager",
  subtitle,
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={26} className="shrink-0 rounded-lg" />
      <div>
        <h1 className="font-semibold text-sm text-[var(--stm-ink)]">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-[var(--stm-text-muted)] tracking-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
