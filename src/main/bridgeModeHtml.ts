/**
 * Minimal HTML for bridge-only mode: no React bundle, just a status surface.
 */

export function getBridgeModePageHtml(options: {
  bridgePort: number
  theme: 'light' | 'dark'
}): string {
  const { bridgePort, theme } = options
  const bg = theme === 'light' ? '#ffffff' : '#111110'
  const fg = theme === 'light' ? '#111110' : '#f5f5f4'
  const muted = theme === 'light' ? '#525252' : '#a3a3a3'
  const border = theme === 'light' ? '#e5e5e5' : '#3f3f3e'
  const cardBg = theme === 'light' ? '#fafafa' : '#1a1a19'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Grafana k6 Studio — Bridge</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: ${bg};
      color: ${fg};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .panel {
      width: 100%;
      max-width: 400px;
      border: 1px solid ${border};
      border-radius: 12px;
      background: ${cardBg};
      padding: 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }
    h1 {
      font-size: 1.125rem;
      font-weight: 600;
      line-height: 1.35;
      margin-bottom: 12px;
    }
    p {
      font-size: 0.875rem;
      line-height: 1.5;
      color: ${muted};
      margin-bottom: 8px;
    }
    .port {
      font-variant-numeric: tabular-nums;
      user-select: all;
    }
    .hint {
      margin-top: 16px;
      font-size: 0.8125rem;
      color: ${muted};
    }
  </style>
</head>
<body>
  <div class="panel" role="dialog" aria-labelledby="bridge-title">
    <h1 id="bridge-title">Running the k6 bridge proxy</h1>
    <p>The desktop app UI is not loaded in this mode. Web clients can connect to the bridge on port <span class="port">${bridgePort}</span>.</p>
    <p class="hint">Close this window to stop the bridge and the k6 proxy.</p>
  </div>
</body>
</html>`
}
