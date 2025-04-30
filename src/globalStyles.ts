import { css } from '@emotion/react'
import '@radix-ui/themes/styles.css'
import 'allotment/dist/style.css'

import InterVariable from '@/assets/fonts/Inter/InterVariable.woff2'

export const globalStyles = css`
  @font-face {
    font-family: 'InterVariable';
    src: url(${InterVariable}) format('woff2');
    font-weight: 400 500 600 700;
    font-display: swap;
    font-style: normal;
  }

  .radix-themes {
    --default-font-family: 'InterVariable', -apple-system, BlinkMacSystemFont,
      'Segoe UI (Custom)', Roboto, 'Helvetica Neue', 'Open Sans (Custom)',
      system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';

    --cursor-button: pointer;
  }

  body {
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

  /* Make Monaco scroll thumbs rounder */
  .monaco-scrollable-element > .scrollbar > .slider {
    border-radius: max(var(--radius-1), var(--radius-full));
    background-color: var(--gray-a8);

    &:hover {
      background-color: var(--gray-a9);
    }
  }
`
