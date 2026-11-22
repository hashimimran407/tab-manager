import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from "./constants";

export async function checkAndRunMigrations(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SCHEMA_VERSION);
    const storedVersion = result[STORAGE_KEYS.SCHEMA_VERSION] as number | undefined;

    if (!storedVersion) {
      await chrome.storage.local.set({
        [STORAGE_KEYS.SCHEMA_VERSION]: CURRENT_SCHEMA_VERSION,
      });
      return;
    }

    if (storedVersion < CURRENT_SCHEMA_VERSION) {
      // Future data transformation logic when schema updates
      await chrome.storage.local.set({
        [STORAGE_KEYS.SCHEMA_VERSION]: CURRENT_SCHEMA_VERSION,
      });
    }
  } catch (error) {
    console.error("Failed to run storage migrations:", error);
  }
}
