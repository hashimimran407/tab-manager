export interface SuspensionExclusions {
  domains: string[];
  excludePinned: boolean;
  excludeAudible: boolean;
  excludeActive: boolean;
}

export interface SuspensionSchedule {
  id: string;
  days: number[];
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export interface DomainSuspensionRule {
  id: string;
  domain: string;
  action: "protect" | "suspend";
  suspendAfterMinutes: number;
}

export interface Settings {
  suspendAfterMinutes: number;
  autoSuspendEnabled: boolean;
  exclusions: SuspensionExclusions;
  suspensionSchedules: SuspensionSchedule[];
  domainRules: DomainSuspensionRule[];
  autoSessionBackupEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  suspendAfterMinutes: 15,
  autoSuspendEnabled: true,
  suspensionSchedules: [],
  domainRules: [],
  autoSessionBackupEnabled: false,
  exclusions: {
    domains: ["meet.google.com", "zoom.us", "youtube.com"],
    excludePinned: true,
    excludeAudible: true,
    excludeActive: true,
  },
};
