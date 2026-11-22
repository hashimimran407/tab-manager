import { describe, it, expect } from "vitest";
import { isTabEligibleForSuspension } from "@/services/suspension.service";
import type { Settings } from "@/types/settings";

const mockSettings: Settings = {
  suspendAfterMinutes: 30,
  autoSuspendEnabled: true,
  suspensionSchedules: [],
  domainRules: [],
  autoSessionBackupEnabled: false,
  exclusions: {
    domains: ["meet.google.com", "zoom.us"],
    excludePinned: true,
    excludeAudible: true,
    excludeActive: true,
  },
};

describe("Suspension Service - Tab Eligibility", () => {
  it("should NOT suspend active tabs when excludeActive is true", () => {
    const tab = {
      id: 1,
      url: "https://example.com",
      active: true,
      pinned: false,
      audible: false,
      discarded: false,
    } as chrome.tabs.Tab;

    expect(isTabEligibleForSuspension(tab, mockSettings)).toBe(false);
  });

  it("should NOT suspend pinned tabs when excludePinned is true", () => {
    const tab = {
      id: 2,
      url: "https://example.com",
      active: false,
      pinned: true,
      audible: false,
      discarded: false,
    } as chrome.tabs.Tab;

    expect(isTabEligibleForSuspension(tab, mockSettings)).toBe(false);
  });

  it("should NOT suspend audible tabs playing audio", () => {
    const tab = {
      id: 3,
      url: "https://spotify.com",
      active: false,
      pinned: false,
      audible: true,
      discarded: false,
    } as chrome.tabs.Tab;

    expect(isTabEligibleForSuspension(tab, mockSettings)).toBe(false);
  });

  it("should NOT suspend restricted chrome:// pages", () => {
    const tab = {
      id: 4,
      url: "chrome://extensions",
      active: false,
      pinned: false,
      audible: false,
      discarded: false,
    } as chrome.tabs.Tab;

    expect(isTabEligibleForSuspension(tab, mockSettings)).toBe(false);
  });

  it("should NOT suspend domain in exclusion list", () => {
    const tab = {
      id: 5,
      url: "https://meet.google.com/abc-xyz",
      active: false,
      pinned: false,
      audible: false,
      discarded: false,
    } as chrome.tabs.Tab;

    expect(isTabEligibleForSuspension(tab, mockSettings)).toBe(false);
  });

  it("should suspend eligible normal inactive tabs", () => {
    const tab = {
      id: 6,
      url: "https://github.com/trending",
      active: false,
      pinned: false,
      audible: false,
      discarded: false,
    } as chrome.tabs.Tab;

    expect(isTabEligibleForSuspension(tab, mockSettings)).toBe(true);
  });
});
