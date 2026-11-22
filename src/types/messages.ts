export type MessageAction =
  | "GET_WORKSPACES"
  | "CREATE_WORKSPACE"
  | "UPDATE_WORKSPACE"
  | "DELETE_WORKSPACE"
  | "SAVE_CURRENT_WINDOW"
  | "RESTORE_WORKSPACE"
  | "RESTORE_TAB"
  | "DELETE_TAB"
  | "SUSPEND_TAB"
  | "DISCARD_TAB_NOW"
  | "CLOSE_TAB"
  | "ACTIVATE_TAB"
  | "GET_OPEN_TABS"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "OPEN_SIDE_PANEL";

export interface ExtensionMessage<T = unknown> {
  action: MessageAction;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateWorkspacePayload {
  name: string;
  color: string;
}

export interface SaveCurrentWindowPayload {
  workspaceId: string;
}

export interface TabActionPayload {
  tabId: number;
}
