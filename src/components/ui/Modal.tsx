import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-[var(--stm-ink)]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[24px] bg-[var(--stm-canvas)] border border-black/[0.08] p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--stm-ink)]/[0.06]">
          <h3 className="text-sm font-bold text-[var(--stm-ink)] tracking-tight">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-3.5 w-3.5 text-[var(--stm-text-muted)]" />
          </Button>
        </div>
        <div className="mt-3 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
