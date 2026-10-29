# Origin/CORS reproduction

Run from the repository root with dependencies installed, Google Chrome available, k6 on PATH, and port 7554 free:

```sh
pnpm test:e2e --config scripts/repro-origin/playwright.config.ts
```

The suite builds the current recorder and replay bundles in a temporary directory, starts a loopback HTTP server with two origins (`localhost` and `127.0.0.1`), and starts a mock recorder WebSocket server. Chrome uses a temporary profile. The tests close browsers and servers and remove temporary bundles.

## Root cause and controls

The original `--disable-web-security` flag removes Origin from form-encoded and JSON fetch POSTs. The mock token endpoint rejects these requests with 400. The flag also skips preflights and bypasses CORS enforcement.

Removing the flag restores Origin, successful login, preflights, and CORS enforcement. Without accompanying recorder changes, child events lose their frame paths because browser JavaScript cannot traverse cross-origin frame owners. Explicit isolated-world universal access does not restore this traversal in the tested Chrome.

Forcing Origin through `Network.setExtraHTTPHeaders` makes login succeed but leaves CORS bypassed. A fixed Origin is also wrong after navigation or for other frame origins. This is a diagnostic control, not the fix.

## Implemented recommendation

The application removes the flag from recorder and validator launches and resolves iframe owners through CDP. CDP describes frame owners using the existing locator generator in each parent recorder world.

Cross-origin events pass directly to the main process through a CDP binding. Owner paths are resolved fresh, with the latest resolved path retained for clicks that destroy their own document before resolution finishes. Sending a path reply back into the old document lost navigation clicks, so the event must leave that document first.

The existing WebSocket transport relays tool state. Cross-origin child interactions are suppressed while inspection or text selection is active. Inspection, text selection, and drawer highlighting inside cross-origin frames remain unsupported. Tooltips disclose the inspection and text selection limitation.

The validator injects rrweb recording into child frames with native cross-origin recording enabled. The top frame retains the existing buffered drain. Real k6 nested frameLocator actions and child DOM capture are covered by the suite.

## Coverage

The five browser modes compare original flags, web security enabled, injection after page load, explicit isolated-world grant, and forced Origin. The late-injection case replaces Map and Set in child page worlds before recorder injection, then verifies that cross-origin, nested, and sandboxed clicks still record. This catches a selector-bootstrap failure that early injection could hide in a deferred callback. The modes named `current` represent the original flags as a regression control. The current source bundle must produce full frame paths in all modes.

The BrowserSession lifecycle test covers document.open, frame navigation, dynamically inserted frames, noopener popups, clicks that navigate their own iframe, and tool suppression followed by restoration. It activates the child button with the keyboard while a tool is active, then polls a cancelable click until suppression ends. The recorder toolbar overlaps the original mock target with both the old and new browser flags. Moving the iframe clear of the toolbar allows physical clicks in both modes.

Separate local probes verified that rrweb Replayer renders child and nested text, and that headed Chrome through a local HTTPS CONNECT proxy preserves Origin and recorder WebSocket connectivity without a LocalNetworkAccess bypass. Those probes used a CONNECT tunnel, not Studio's mitmproxy binary.

## Scope

Tested on macOS with Chrome 156.0.8078.48 and installed k6 v2.3.0 using current source bundles. The harness exercises CDP injection and real k6 browser actions, not the packaged Electron UI or bundled k6. It uses no real identity provider, customer credentials, or customer application. It reproduces the Origin requirement, not the full Entra OAuth flow. It does not establish Windows/Linux behavior, older Chrome behavior, or every iframe lifecycle. rrweb cannot execute inside sandboxed frames without allow-scripts, although CDP recorder injection can capture their interactions.
