import type { Settings } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/types/settings";
import { STORAGE_KEYS } from "@/utils/constants";
import { getFromStorage, setToStorage } from "./chrome/storage.service";
import { getAllTabs, discardTab } from "./chrome/tabs.service";
import { isRestrictedUrl } from "@/utils/url";

export async function getSettings(): Promise<Settings> {
  const stored = await getFromStorage<Partial<Settings>>(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    await setToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    exclusions: { ...DEFAULT_SETTINGS.exclusions, ...stored.exclusions },
    suspensionSchedules: Array.isArray(stored.suspensionSchedules)
      ? stored.suspensionSchedules.filter((schedule) =>
        typeof schedule.id === "string" && Array.isArray(schedule.days) &&
        typeof schedule.startTime === "string" && typeof schedule.endTime === "string"
      )
      : [],
    domainRules: Array.isArray(stored.domainRules)
      ? stored.domainRules.filter((rule) =>
        typeof rule.id === "string" && typeof rule.domain === "string" &&
        (rule.action === "protect" || rule.action === "suspend") &&
        Number.isFinite(rule.suspendAfterMinutes)
      )
      : [],
    autoSessionBackupEnabled: stored.autoSessionBackupEnabled ?? false,
  };
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated: Settings = {
    ...current,
    ...patch,
    exclusions: {
      ...current.exclusions,
      ...(patch.exclusions || {}),
    },
  };
  await setToStorage(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

export function isTabEligibleForSuspension(
  tab: chrome.tabs.Tab,
  settings: Settings
): boolean {
  if (!tab.id || !tab.url) return false;
  if (isRestrictedUrl(tab.url)) return false;
  if (tab.discarded) return false;

  const { exclusions } = settings;

  if (exclusions.excludeActive && tab.active) return false;
  if (exclusions.excludePinned && tab.pinned) return false;
  if (exclusions.excludeAudible && tab.audible) return false;

  try {
    const urlObj = new URL(tab.url);
    const host = urlObj.hostname.toLowerCase();
    const isDomainExcluded = exclusions.domains.some((domain) => {
      const excludedDomain = domain.trim().toLowerCase().replace(/^\*\./, "");
      return excludedDomain && (host === excludedDomain || host.endsWith(`.${excludedDomain}`));
    });
    if (isDomainExcluded) return false;
  } catch {
    return false;
  }

  return true;
}

function isInsideSuspensionSchedule(settings: Settings, now: Date): boolean {
  const schedules = settings.suspensionSchedules ?? [];
  const enabledSchedules = schedules.filter((schedule) => schedule.enabled);
  if (!enabledSchedules.length) return true;

  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  return enabledSchedules.some((schedule) => {
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
    const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const today = now.getDay();
    const previousDay = (today + 6) % 7;

    if (start === end) return schedule.days.includes(today);
    if (start < end) {
      return schedule.days.includes(today) && minuteOfDay >= start && minuteOfDay < end;
    }
    return (schedule.days.includes(today) && minuteOfDay >= start) ||
      (schedule.days.includes(previousDay) && minuteOfDay < end);
  });
}

function matchingDomainRule(url: string | undefined, settings: Settings) {
  if (!url) return undefined;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (settings.domainRules ?? []).filter((rule) => {
      const domain = rule.domain.trim().toLowerCase().replace(/^\*\./, "");
      return domain && (host === domain || host.endsWith(`.${domain}`));
    }).at(-1);
  } catch {
    return undefined;
  }
}

export async function runSuspensionSweep(): Promise<number> {
  const settings = await getSettings();
  if (!settings.autoSuspendEnabled) return 0;

  const nowDate = new Date();
  if (!isInsideSuspensionSchedule(settings, nowDate)) return 0;

  const tabs = await getAllTabs();
  const lastActive = (await getFromStorage<Record<string, number>>(STORAGE_KEYS.TAB_LAST_ACTIVE)) || {};
  const now = nowDate.getTime();
  let suspendedCount = 0;

  for (const tab of tabs) {
    if (!tab.id) continue;

    const tabId = String(tab.id);
    // Seed tabs already open when the extension starts so they get a full
    // inactivity interval before their first automatic suspension.
    if (lastActive[tabId] === undefined) {
      lastActive[tabId] = now;
      continue;
    }

    const domainRule = matchingDomainRule(tab.url, settings);
    if (domainRule?.action === "protect") continue;
    const eligible = domainRule?.action === "suspend"
      ? isTabEligibleForCustomSuspension(tab)
      : isTabEligibleForSuspension(tab, settings);
    const inactivityThreshold = (domainRule?.action === "suspend"
      ? domainRule.suspendAfterMinutes
      : settings.suspendAfterMinutes) * 60 * 1000;

    if (eligible && now - lastActive[tabId] >= inactivityThreshold) {
      const discarded = await discardTab(tab.id);
      if (discarded?.discarded) {
        suspendedCount++;
      }
    }
  }

  const openTabIds = new Set(tabs.flatMap((tab) => tab.id === undefined ? [] : [String(tab.id)]));
  for (const tabId of Object.keys(lastActive)) {
    if (!openTabIds.has(tabId)) delete lastActive[tabId];
  }
  await setToStorage(STORAGE_KEYS.TAB_LAST_ACTIVE, lastActive);

  return suspendedCount;
}

function isTabEligibleForCustomSuspension(tab: chrome.tabs.Tab): boolean {
  return Boolean(tab.id && tab.url && !isRestrictedUrl(tab.url) && !tab.discarded &&
    !tab.active && !tab.pinned && !tab.audible);
}

export async function recordTabActivity(tabId: number): Promise<void> {
  const lastActive = (await getFromStorage<Record<string, number>>(STORAGE_KEYS.TAB_LAST_ACTIVE)) || {};
  lastActive[String(tabId)] = Date.now();
  await setToStorage(STORAGE_KEYS.TAB_LAST_ACTIVE, lastActive);
}

export async function forgetTabActivity(tabId: number): Promise<void> {
  const lastActive = (await getFromStorage<Record<string, number>>(STORAGE_KEYS.TAB_LAST_ACTIVE)) || {};
  delete lastActive[String(tabId)];
  await setToStorage(STORAGE_KEYS.TAB_LAST_ACTIVE, lastActive);
}
