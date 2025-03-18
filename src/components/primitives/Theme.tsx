import { css, Global } from '@emotion/react'

const styles = css`
  /* html body,
  :root body {
    &[data-scroll-locked] {
      --removed-body-scroll-bar-size: 0 !important;
      margin-right: 0 !important;
    }
  } */

  :host {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto,
      'Helvetica Neue', 'Open Sans (Custom)', system-ui, sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji';

    --spacing-1: 4px;
    --spacing-2: calc(var(--spacing-1) * 2);
    --spacing-3: calc(var(--spacing-1) * 3);
    --spacing-4: calc(var(--spacing-1) * 4);

    --shadow-1: 0 0 10px rgba(0, 0, 0, 0.2);

    --toggle-bg-on: rgba(0, 0, 0, 0.1);
    --toggle-bg-off: transparent;

    --layer-top-1: 999999999;
    --layer-top-2: 999999998;
    --layer-top-3: 999999997;
  }
`

export function Theme() {
  return <Global styles={styles} />
}
