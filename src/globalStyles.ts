import { css } from '@emotion/react'
import '@radix-ui/themes/styles.css'
import 'allotment/dist/style.css'

export const globalStyles = css`
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    word-break: break-all;
    margin: 0;
  }

  pre {
    white-space: pre-wrap;
  }

  /* Prevent overflow in scroll area with flex parent */
  .rt-ScrollAreaViewport > * {
    width: auto;
  }

  :root {
    /* Allotment */
    --focus-border: var(--violet-9);
    --separator-border: var(--gray-4);
    --sash-hover-size: 2px;
  }
`
