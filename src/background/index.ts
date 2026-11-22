import { initAlarms } from "./alarms";
import { initTabListeners } from "./tab-listeners";
import { initMessageRouter } from "./message-router";
import { setupSessionBackupAlarm, setupSuspensionAlarm } from "@/services/chrome/alarms.service";
import { checkAndRunMigrations } from "@/utils/storage-migrations";

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[Smart Tab Manager] Extension installed:", details.reason);
  await checkAndRunMigrations();
  await setupSuspensionAlarm();
  await setupSessionBackupAlarm();

  // Configure side panel behavior if API is available
  if (chrome.sidePanel?.setPanelBehavior) {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await setupSuspensionAlarm();
  await setupSessionBackupAlarm();
});

initAlarms();
initTabListeners();
initMessageRouter();
