import React from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size = 28, className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
  >
    <path d="M65 15h31l16 16v62a9 9 0 0 1-9 9H65a9 9 0 0 1-9-9V24a9 9 0 0 1 9-9Z" fill="#60A5FA" />
    <path d="M48 25h31l16 16v62a9 9 0 0 1-9 9H48a9 9 0 0 1-9-9V34a9 9 0 0 1 9-9Z" fill="#BFDBFE" />
    <path d="M31 35h31l16 16v52a9 9 0 0 1-9 9H31a9 9 0 0 1-9-9V44a9 9 0 0 1 9-9Z" fill="#EFF6FF" />
    <path d="M62 36v15h15" fill="#DBEAFE" />
    <path d="M36 68h27M36 81h31M36 94h22" stroke="#1D4ED8" strokeLinecap="round" strokeWidth="5" />
  </svg>
);
