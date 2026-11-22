import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { DEFAULT_WORKSPACE_COLORS } from "@/utils/constants";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  initialName?: string;
  initialColor?: string;
  mode?: "create" | "edit";
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  initialColor = DEFAULT_WORKSPACE_COLORS[0],
  mode = "create",
}) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setColor(initialColor);
    }
  }, [isOpen, initialName, initialColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color);
    if (mode === "create") setName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "edit" ? "Rename Workspace" : "New Workspace"}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-[var(--stm-ink)] mb-1.5 uppercase tracking-wider">
            Workspace Name
          </label>
          <Input
            placeholder="e.g. Work, Research, Client"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--stm-ink)] mb-1.5 uppercase tracking-wider">
            Accent Color
          </label>
          <div className="flex items-center gap-2.5 pt-1">
            {DEFAULT_WORKSPACE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Select accent color ${c}`}
                aria-pressed={color === c}
                title={c}
                className={`h-7 w-7 rounded-full transition-transform cursor-pointer shadow-xs ${
                  color === c ? "ring-2 ring-offset-2 ring-[var(--stm-ink)] scale-110" : "opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.06]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!name.trim()}>
            {mode === "edit" ? "Save Changes" : "Create Workspace"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
