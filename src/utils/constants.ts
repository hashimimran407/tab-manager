export const SUSPENSION_ALARM_NAME = "smart_tab_manager_suspension_check";
export const SESSION_BACKUP_ALARM_NAME = "smart_tab_manager_session_backup";
export const AUTOMATIC_BACKUPS_LIMIT = 7;
export const AUTOMATIC_BACKUP_INTERVAL_HOURS = 24;
export const SUSPENSION_CHECK_INTERVAL_MIN = 1;

export const DEFAULT_WORKSPACE_COLORS = [
  "#1D4ED8", // Blue
  "#6D28D9", // Violet
  "#BE123C", // Rose
  "#C2410C", // Orange
  "#A16207", // Amber
  "#15803D", // Green
  "#0F766E", // Teal
  "#334155", // Slate
];

export const STORAGE_KEYS = {
  WORKSPACES: "stm_workspaces",
  SETTINGS: "stm_settings",
  SCHEMA_VERSION: "stm_schema_version",
  TAB_LAST_ACTIVE: "stm_tab_last_active",
  AUTOMATIC_BACKUPS: "stm_automatic_backups",
} as const;

export const CURRENT_SCHEMA_VERSION = 1;
