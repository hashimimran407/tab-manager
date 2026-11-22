# Smart Tab Manager 🗂️

A modern Chrome Extension (Manifest V3) for organizing browser tabs into project workspaces, controlling live open tabs, and reducing RAM consumption through inactive tab suspension.

## Features
- **Chrome Side Panel**: Permanent side panel showing all workspaces and live active tabs.
- **Tab Control**: Switch, suspend, close, or add any open browser tab to a workspace.
- **Workspaces**: Group tabs into color-coded project workspaces (Work, Research, etc.).
- **Auto-Suspension**: Automatically unload idle tabs from memory without closing them.
- **Exclusions**: Protect audio-playing, pinned, or specific domains (e.g., Google Meet, YouTube).
- **Data Safety**: Export and import full workspaces and preferences via JSON backups.

## Installation & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Chrome
```bash
npm run build
```

### 3. Load in Google Chrome
1. Navigate to `chrome://extensions/`
2. Turn on **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the `dist` directory inside `smart-tab-manager/`.
5. Open any webpage, click the extension icon or open Chrome's Side Panel to start managing your tabs!

## Commands
- `npm run dev`: Start Vite development server
- `npm run build`: Typecheck and produce the extension `dist` package
- `npm run test`: Run Vitest unit tests
- `npm run lint`: Run ESLint checks
