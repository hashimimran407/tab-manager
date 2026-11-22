import {
  AUTOMATIC_BACKUPS_LIMIT,
  STORAGE_KEYS,
} from "@/utils/constants";
import { getFromStorage, setToStorage } from "./chrome/storage.service";
import type { Workspace } from "@/types/workspace";
import type { Settings } from "@/types/settings";
import { getSettings } from "./suspension.service";

export interface BackupData {
  version: number;
  exportedAt: number;
  workspaces: Workspace[];
  settings: Settings | null;
}

export interface AutomaticBackup {
  id: string;
  createdAt: number;
  data: BackupData;
}

export async function exportUserData(): Promise<string> {
  const workspaces = await getFromStorage<Workspace[]>(STORAGE_KEYS.WORKSPACES);
  const settings = await getFromStorage<Settings>(STORAGE_KEYS.SETTINGS);

  const backup: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    workspaces: workspaces || [],
    settings: settings || null,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importUserData(jsonString: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonString) as BackupData;
    if (!data.workspaces || !Array.isArray(data.workspaces)) {
      throw new Error("Invalid backup format: workspaces missing or invalid.");
    }

    await setToStorage(STORAGE_KEYS.WORKSPACES, data.workspaces);
    if (data.settings) {
      await setToStorage(STORAGE_KEYS.SETTINGS, data.settings);
    }
    return true;
  } catch (error) {
    console.error("Backup import failed:", error);
    return false;
  }
}

export async function getAutomaticBackups(): Promise<AutomaticBackup[]> {
  return (await getFromStorage<AutomaticBackup[]>(STORAGE_KEYS.AUTOMATIC_BACKUPS)) ?? [];
}

export async function createAutomaticBackup(): Promise<AutomaticBackup> {
  const data = JSON.parse(await exportUserData()) as BackupData;
  const backup: AutomaticBackup = {
    id: `backup_${Date.now()}`,
    createdAt: Date.now(),
    data,
  };
  const backups = [backup, ...(await getAutomaticBackups())].slice(0, AUTOMATIC_BACKUPS_LIMIT);
  await setToStorage(STORAGE_KEYS.AUTOMATIC_BACKUPS, backups);
  return backup;
}

export async function runScheduledBackup(): Promise<boolean> {
  const [settings, backups] = await Promise.all([
    getSettings(),
    getAutomaticBackups(),
  ]);
  if (!settings.autoSessionBackupEnabled) {
    return false;
  }
  const lastBackup = backups[0];
  if (lastBackup && Date.now() - lastBackup.createdAt < 24 * 60 * 60 * 1000) {
    return false;
  }
  await createAutomaticBackup();
  return true;
}

export async function restoreAutomaticBackup(backupId: string): Promise<boolean> {
  const backup = (await getAutomaticBackups()).find((item) => item.id === backupId);
  if (!backup) return false;
  return importUserData(JSON.stringify(backup.data));
}
