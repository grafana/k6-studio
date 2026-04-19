# AGENTS.md

## Commands

```bash
npm start              # start dev server (electron-forge)
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm test               # vitest run
npm run test:watch     # vitest watch
npm run format         # prettier
```

## Inspecting the Running App

`npm start` enables CDP remote debugging on port 9223 (port 9222 is reserved for the recorder's CDP browser).

The project has a `chrome-devtools` MCP server configured in `.mcp.json` that connects to port 9223. When the app is running, use the MCP tools (`take_snapshot`, `click`, `fill`, `navigate_page`, `take_screenshot`, `evaluate_script`, etc.) to interact with the app. Prefer `take_snapshot` over `take_screenshot` for reading UI state.

### Navigation

The app uses hash routing:

```
#/                                           # Home
#/recorder                                   # Recorder
#/generator/<name>.k6g                       # Generator (URL-encoded name)
#/recording-previewer/<name>.har             # Recording previewer
#/validator/<name>.js                        # Validator
#/editor/<name>.k6b                          # Browser test editor
#/data-file/<name>                           # Data file viewer
```

### IPC APIs

The renderer exposes `window.studio` with IPC APIs (accessible via `evaluate_script`): `auth`, `proxy`, `browser`, `script`, `data`, `har`, `ui`, `generator`, `browserTest`, `app`, `log`, `settings`, `browserRemote`, `cloud`, `ai`.

To run k6 through Validator (instrumented script, Studio proxy, logs and checks): `await window.studio.script.runValidatorSession({ mode: 'inline', script })` or `{ mode: 'path', scriptPath }` (path is workspace-relative or absolute, same as the Validator route). Returns `{ proxyData, logs, checks }`.

## Architecture

Electron desktop app for generating k6 test scripts. Three main components:

1. **Recorder** - captures browser traffic via mitmproxy → HAR files
2. **Generator** - transforms HAR + rules → k6 scripts
3. **Validator** - runs single VU test to debug scripts

### Process Model

- **Main process**: `src/main.ts` - IPC handlers, proxy/browser management
- **Preload**: `src/preload.ts` - exposes `window.studio` API via contextBridge
- **Renderer**: `src/App.tsx` - React frontend

### Key Directories

- `src/handlers/` - IPC handlers by domain (ai/, proxy/, browser/, generator/)
- `src/store/` - Zustand stores with Immer middleware
- `src/codegen/` - k6 script generation from HAR + rules
- `src/views/` - main pages (Home, Recorder, Generator, Validator, RecordingPreviewer, BrowserTestEditor, DataFile)
- `src/schemas/` - Zod schemas for validation

### IPC Pattern

Handlers follow `domain:action` naming. Each handler has:
- `index.ts` - ipcMain.handle/on registration
- `preload.ts` - contextBridge exposure
- `types.ts` - TypeScript interfaces

## Code Style

- Use `@/` path alias for src imports
- Zustand stores: always use Immer, select specific slices to avoid re-renders
- React Hook Form + Zod for form validation
- Radix UI + Emotion for styling
- Event handlers: `handleX` prefix
- Early returns to reduce nesting
- Avoid `any` - use `unknown` with type guards

## Commit Messages

Conventional Commits format. Sentence case, imperative verb.
```
feat: Add type column to WebLogView
fix: Application crashes when opening HAR file
```

