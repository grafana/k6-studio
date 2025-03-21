import { css, Global } from '@emotion/react'
import { useMemo } from 'react'

const styles = css`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto,
    'Helvetica Neue', 'Open Sans (Custom)', system-ui, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji';

  --studio-spacing-1: 4px;
  --studio-spacing-2: calc(var(--studio-spacing-1) * 2);
  --studio-spacing-3: calc(var(--studio-spacing-1) * 3);
  --studio-spacing-4: calc(var(--studio-spacing-1) * 4);

  --studio-foreground: rgb(36, 41, 46);
  --studio-background: rgb(255, 255, 255);

  --studio-shadow-1: rgba(24, 26, 27, 0.2) 0px 4px 8px;

  --studio-toggle-bg-on: rgba(0, 0, 0, 0.1);
  --studio-toggle-bg-off: transparent;

  --studio-layer-0: 0;
  --studio-layer-1: calc(var(--studio-layer-0) + 1);
  --studio-layer-2: calc(var(--studio-layer-0) + 2);
  --studio-layer-3: calc(var(--studio-layer-0) + 3);

  --studio-font-size-1: 12px;
  --studio-font-size-2: 14px;

  @media (prefers-color-scheme: dark) {
    --studio-foreground: rgb(255, 255, 255);
    --studio-background: rgb(36, 41, 46);
  }

  background-color: var(--studio-background);
  color: var(--studio-foreground);
`

const getStyles = (root: boolean) => {
  if (!root) {
    return css`
      :host {
        ${styles};

        --studio-layer-0: 999999990;
      }
    `
  }

  return css`
    :root {
      ${styles};
    }
  `
}

interface ThemeProps {
  root?: boolean
}

export function Theme({ root = true }: ThemeProps) {
  const styles = useMemo(() => getStyles(root), [root])

  return <Global styles={styles} />
}
