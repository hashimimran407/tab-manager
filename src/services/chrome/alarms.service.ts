import {
  SUSPENSION_ALARM_NAME,
  SUSPENSION_CHECK_INTERVAL_MIN,
  SESSION_BACKUP_ALARM_NAME,
  AUTOMATIC_BACKUP_INTERVAL_HOURS,
} from "@/utils/constants";

export async function setupSuspensionAlarm(): Promise<void> {
  await chrome.alarms.clear(SUSPENSION_ALARM_NAME);
  await chrome.alarms.create(SUSPENSION_ALARM_NAME, {
    periodInMinutes: SUSPENSION_CHECK_INTERVAL_MIN,
  });
}

export async function setupSessionBackupAlarm(): Promise<void> {
  const existing = await chrome.alarms.get(SESSION_BACKUP_ALARM_NAME);
  if (!existing) {
    await chrome.alarms.create(SESSION_BACKUP_ALARM_NAME, {
      periodInMinutes: AUTOMATIC_BACKUP_INTERVAL_HOURS * 60,
    });
  }
}

export async function clearSuspensionAlarm(): Promise<void> {
  await chrome.alarms.clear(SUSPENSION_ALARM_NAME);
}
