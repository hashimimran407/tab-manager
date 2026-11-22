import { useState, useEffect, useCallback, useRef } from "react";
import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import type { ExtensionMessage, ExtensionResponse } from "@/types/messages";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const updateQueue = useRef<Promise<void>>(Promise.resolve());

  const fetchSettings = useCallback(async () => {
    try {
      const msg: ExtensionMessage = { action: "GET_SETTINGS" };
      const res: ExtensionResponse<Settings> = await chrome.runtime.sendMessage(msg);
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const update = (patch: Partial<Settings>) => {
    setSettings((current) => ({
      ...current,
      ...patch,
      exclusions: { ...current.exclusions, ...(patch.exclusions ?? {}) },
    }));

    const request = updateQueue.current.then(async () => {
      const msg: ExtensionMessage = { action: "UPDATE_SETTINGS", payload: patch };
      const res: ExtensionResponse<Settings> = await chrome.runtime.sendMessage(msg);
      if (!res.success) throw new Error(res.error ?? "Could not update settings");
    }).catch((err: unknown) => {
      console.error("Failed to update settings:", err);
      void fetchSettings();
    });
    updateQueue.current = request;
    return request;
  };

  return { settings, isLoading, update, refresh: fetchSettings };
}
