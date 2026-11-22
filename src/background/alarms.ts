import { SUSPENSION_ALARM_NAME } from "@/utils/constants";
import { runSuspensionSweep } from "@/services/suspension.service";
import { SESSION_BACKUP_ALARM_NAME } from "@/utils/constants";
import { runScheduledBackup } from "@/services/backup.service";

export function initAlarms(): void {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === SUSPENSION_ALARM_NAME) {
      const count = await runSuspensionSweep();
      if (count > 0) {
        console.log(`[Smart Tab Manager] Auto-suspended ${count} inactive tab(s).`);
      }
    }
    if (alarm.name === SESSION_BACKUP_ALARM_NAME) {
      await runScheduledBackup();
    }
  });
}
