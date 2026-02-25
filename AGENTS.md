# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Grafana k6 Studio is an Electron desktop app (React + TypeScript) for generating k6 performance test scripts. It includes a Recorder (proxy-based HTTP capture), Generator (HAR-to-k6-script), and Validator (single-VU k6 runner). No databases or external services are required to run locally.

### Standard commands

See `package.json` scripts and the README "Development environment" section for standard commands:

- **Install**: `npm install` (preinstall script downloads the k6 binary automatically)
- **Dev**: `npm start` (runs `electron-forge start`)
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`
- **Test**: `npm test` (vitest)
- **Format**: `npm run format`

### Non-obvious caveats for Cloud Agent environments

1. **Node.js version**: Requires Node.js ^24.11.0 (see `.nvmrc`). Use `nvm use` before running commands.

2. **`.env` file required**: The Vite build defines `SENTRY_DSN` as a compile-time constant via `JSON.stringify(process.env.SENTRY_DSN)`. When `SENTRY_DSN` is unset, this resolves to `undefined` in Vite's `define` config, leaving the raw `SENTRY_DSN` reference in the built code and causing a `ReferenceError` at runtime. Create a `.env` file at the repo root with `SENTRY_DSN=` (empty value) to prevent this. The `.env` file is gitignored.

3. **Running the Electron app in headless/container environments**: The app needs a display server (X11). In Cloud Agent VMs, `DISPLAY=:1` is typically available via TigerVNC. Launch with:
   ```
   DISPLAY=:1 npx electron-forge start -- --no-sandbox --disable-dev-shm-usage
   ```
   The `--no-sandbox` and `--disable-dev-shm-usage` flags are needed because `/dev/shm` is limited to 64MB in container environments.

4. **Electron-forge stdin requirement**: `electron-forge start` sets up a readline listener on stdin (for the "rs" restart command). If stdin is closed (e.g., when running as a shell background process with `&`), the forge process exits immediately after launching Electron. To keep it alive in the background, either run in the foreground with a timeout, or use Cursor's `is_background: true` shell mode which keeps stdin open.

5. **dbus errors are harmless**: Electron logs many `dbus/bus.cc` errors in container environments. These are cosmetic and do not affect functionality.

6. **Husky pre-commit hook**: Runs `lint-staged` which applies ESLint, Prettier, and TypeScript type-checking on staged `.js/.jsx/.ts/.tsx` files.
