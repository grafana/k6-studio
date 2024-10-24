import { css } from '@emotion/react'
import '@radix-ui/themes/styles.css'
import 'allotment/dist/style.css'

export const globalStyles = css`
  body {
    font-family: 'Inter', 'Helvetica', 'Arial', sans-serif;
    margin: 0;
  }

  pre {
    white-space: pre-wrap;
  }

  /* Prevent overflow in scroll area with flex parent */
  .rt-ScrollAreaViewport > * {
    width: auto;
  }

  .rt-ScrollAreaScrollbar {
    z-index: 2;
  }

  /* Allow to truncate text in Select options */
  .rt-SelectItem > span:not(.rt-SelectItemIndicator) {
    width: 100%;
  }
`
