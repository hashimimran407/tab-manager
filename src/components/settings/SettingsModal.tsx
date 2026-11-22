import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
import { Input } from "../ui/Input";
import { useSettings } from "@/hooks/useSettings";
import {
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, update } = useSettings();
  const [newDomain, setNewDomain] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomain.trim().toLowerCase();
    if (!clean) return;

    if (!settings.exclusions.domains.includes(clean)) {
      update({
        exclusions: {
          ...settings.exclusions,
          domains: [...settings.exclusions.domains, clean],
        },
      });
      showNotification(`Added ${clean} to exclusion list`);
    }
    setNewDomain("");
  };

  const handleRemoveDomain = (domain: string) => {
    update({
      exclusions: {
        ...settings.exclusions,
        domains: settings.exclusions.domains.filter((d) => d !== domain),
      },
    });
    showNotification(`Removed ${domain}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-0.5 text-[var(--stm-ink)]">
        {feedback && (
          <div className="flex items-center gap-1.5 p-2.5 bg-[var(--stm-accent)]/10 border border-[var(--stm-accent)]/20 text-[var(--stm-accent)] rounded-xl text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Auto-Suspend Rules Grouped Box */}
        <div className="space-y-3 bg-[var(--stm-surface)] p-3.5 rounded-2xl border border-[var(--stm-border)] shadow-[0_2px_8px_rgba(8,9,11,0.02)]">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--stm-text-muted)]">
            Auto-Suspension Engine
          </h4>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[var(--stm-ink)]">
                Enable Auto-Suspend
              </div>
              <div className="text-[11px] text-[var(--stm-text-muted)]">
                Asks Chrome to unload inactive pages from memory. They reload when reopened.
              </div>
            </div>
            <Switch
              checked={settings.autoSuspendEnabled}
              activeColor="var(--stm-accent-solid)"
              onChange={(checked) => update({ autoSuspendEnabled: checked })}
            />
          </div>

          <div className="pt-2 border-t border-[var(--stm-border)]/60">
            <div className="flex justify-between text-xs font-bold text-[var(--stm-ink)] mb-1.5">
              <span>Inactivity timer</span>
              <span className="text-[var(--stm-accent)] font-bold">
                {settings.suspendAfterMinutes} minutes
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={settings.suspendAfterMinutes}
              onChange={(e) => update({ suspendAfterMinutes: Number(e.target.value) })}
              className="w-full accent-[var(--stm-accent)] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[var(--stm-text-muted)] mt-1 font-medium">
              <span>5 min</span>
              <span>30 min</span>
              <span>1 hr</span>
              <span>2 hrs</span>
            </div>
          </div>
        </div>

        {/* Protection Exclusions */}
        <div className="space-y-3 bg-[var(--stm-surface)] p-3.5 rounded-2xl border border-[var(--stm-border)] shadow-[0_2px_8px_rgba(8,9,11,0.02)]">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--stm-text-muted)]">
            Rules &amp; Protection
          </h4>

          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--stm-ink)]">Never suspend pinned tabs</span>
            <Switch
              checked={settings.exclusions.excludePinned}
              activeColor="var(--stm-accent-solid)"
              onChange={(checked) =>
                update({ exclusions: { ...settings.exclusions, excludePinned: checked } })
              }
            />
          </div>

          <div className="flex items-center justify-between text-xs border-t border-[var(--stm-border)]/60 pt-2">
            <span className="font-medium text-[var(--stm-ink)]">Never suspend tabs playing audio</span>
            <Switch
              checked={settings.exclusions.excludeAudible}
              activeColor="var(--stm-accent-solid)"
              onChange={(checked) =>
                update({ exclusions: { ...settings.exclusions, excludeAudible: checked } })
              }
            />
          </div>

          <div className="pt-2 border-t border-[var(--stm-border)]/60">
            <label className="block text-[11px] font-bold text-[var(--stm-ink)] mb-1.5 uppercase tracking-wider">
              Excluded Domains
            </label>
            <form onSubmit={handleAddDomain} className="flex gap-1.5 mb-2">
              <Input
                placeholder="e.g. meet.google.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="text-xs py-1.5"
              />
              <Button type="submit" size="sm" variant="primary" disabled={!newDomain.trim()}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {settings.exclusions.domains.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--stm-surface-muted)] rounded-full text-[11px] font-medium text-[var(--stm-ink)]"
                >
                  {d}
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(d)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};
