const SHARED_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #111217;
    color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }
  .container {
    text-align: center;
    max-width: 400px;
    padding: 2rem;
  }
  .icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
  .icon svg { width: 36px; height: 36px; }
  .icon-success { background: rgba(34, 197, 94, 0.15); }
  .icon-error { background: rgba(239, 68, 68, 0.15); }
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 0.5rem;
  }
  .subtitle {
    font-size: 0.9rem;
    color: #9ca3af;
    line-height: 1.5;
  }
  .hint {
    font-size: 0.85rem;
    color: #555;
    margin-top: 1rem;
  }
`

const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

const X_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`

function page(
  icon: string,
  iconClass: string,
  title: string,
  subtitle: string,
  hint: string
) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — k6 Studio</title><style>${SHARED_STYLES}</style></head>
<body>
  <div class="container">
    <div class="icon ${iconClass}">${icon}</div>
    <h1>${title}</h1>
    <p class="subtitle">${subtitle}</p>
    <p class="hint">${hint}</p>
  </div>
</body>
</html>`
}

export function successPage(): string {
  return page(
    CHECK_SVG,
    'icon-success',
    'Authenticated!',
    'k6 Studio is now connected and ready to use.',
    'You can safely close this tab.'
  )
}

export function cancelledPage(): string {
  return page(
    X_SVG,
    'icon-error',
    'Authorization cancelled',
    'Return to k6 Studio to try again.',
    'You can safely close this tab.'
  )
}
