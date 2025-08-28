import { css, Global } from '@emotion/react'
import * as colors from '@radix-ui/colors'
import { useMemo } from 'react'

interface Colors {
  dark: {
    [key: string]: string
  }
  light: {
    [key: string]: string
  }
}

type Profiles = {
  default: Colors
  p3: Colors
}

// This loads all of the colors from @radix-ui/colors as CSS variables.
function getColors() {
  const profiles: Profiles = {
    default: {
      light: {},
      dark: {},
    },
    p3: {
      light: {},
      dark: {},
    },
  }

  for (const [key, value] of Object.entries(colors)) {
    const [_, dark, p3] = /[a-z]+(Dark)?(P3)?(A)?/.exec(key) ?? []

    const profile = p3 ? profiles.p3 : profiles.default
    const theme = dark ? profile.dark : profile.light

    for (const [colorKey, colorValue] of Object.entries(value)) {
      const [_, name, shade] = /([a-z]+)(A?\d+)/.exec(colorKey) ?? []

      if (!name || !shade) {
        console.log("Couldn't parse color key", colorKey)
        continue
      }

      theme[`--${name}-${shade.toLowerCase()}`] = colorValue
    }
  }

  return css`
    ${toStyles(profiles.default.light)}

    @media (prefers-color-scheme: dark) {
      ${toStyles(profiles.default.dark)}
    }

    @supports (color: color(display-p3 1 1 1)) {
      @media (color-gamut: p3) {
        ${toStyles(profiles.p3.light)}

        @media (prefers-color-scheme: dark) {
          ${toStyles(profiles.p3.dark)}
        }
      }
    }
  `
}

function toStyles(colors: { [key: string]: string }) {
  return Object.entries(colors)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n')
}

const styles = css`
  --studio-color-scheme: light;

  --studio-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)',
    Roboto, 'Helvetica Neue', 'Open Sans (Custom)', system-ui, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji';

  --studio-foreground: var(--gray-12);
  --studio-background: white;

  --studio-accent-1: var(--orange-1);
  --studio-accent-2: var(--orange-2);
  --studio-accent-3: var(--orange-3);
  --studio-accent-4: var(--orange-4);
  --studio-accent-5: var(--orange-5);
  --studio-accent-6: var(--orange-6);
  --studio-accent-7: var(--orange-7);
  --studio-accent-8: var(--orange-8);
  --studio-accent-9: var(--orange-9);
  --studio-accent-10: var(--orange-10);
  --studio-accent-11: var(--orange-11);
  --studio-accent-12: var(--orange-12);

  --studio-accent-a1: var(--orange-a1);
  --studio-accent-a2: var(--orange-a2);
  --studio-accent-a3: var(--orange-a3);
  --studio-accent-a4: var(--orange-a4);
  --studio-accent-a5: var(--orange-a5);
  --studio-accent-a6: var(--orange-a6);
  --studio-accent-a7: var(--orange-a7);
  --studio-accent-a8: var(--orange-a8);
  --studio-accent-a9: var(--orange-a9);
  --studio-accent-a10: var(--orange-a10);
  --studio-accent-a11: var(--orange-a11);
  --studio-accent-a12: var(--orange-a12);

  --studio-accent-contrast: white;

  --studio-spacing-1: 4px;
  --studio-spacing-2: calc(var(--studio-spacing-1) * 2);
  --studio-spacing-3: calc(var(--studio-spacing-1) * 3);
  --studio-spacing-4: calc(var(--studio-spacing-1) * 4);
  --studio-spacing-5: calc(var(--studio-spacing-1) * 5);
  --studio-spacing-6: calc(var(--studio-spacing-1) * 6);
  --studio-spacing-7: calc(var(--studio-spacing-1) * 7);
  --studio-spacing-8: calc(var(--studio-spacing-1) * 8);

  --studio-shadow-1: rgba(24, 26, 27, 0.2) 0px 4px 8px;

  --studio-toggle-bg-on: rgba(0, 0, 0, 0.1);
  --studio-toggle-bg-off: transparent;

  --studio-layer-0: 0;
  --studio-layer-1: calc(var(--studio-layer-0) + 1);
  --studio-layer-2: calc(var(--studio-layer-0) + 2);
  --studio-layer-3: calc(var(--studio-layer-0) + 3);

  --studio-font-size-1: 12px;
  --studio-font-size-2: 14px;
  --studio-font-size-3: 16px;

  --studio-font-weight-light: 300;
  --studio-font-weight-normal: 400;
  --studio-font-weight-medium: 500;
  --studio-font-weight-bold: 700;

  --studio-border-color: rgb(229, 231, 235);

  --studio-hover-color: rgb(0, 0, 0, 0.1);

  // Popover variables
  --studio-popover-foreground: var(--studio-foreground);
  --studio-popover-background: var(--studio-background);
  --studio-popover-shadow: var(--studio-shadow-1);
  --studio-popover-layer: var(--studio-layer-2);
  --studio-popover-padding: var(--studio-spacing-2);

  @media (prefers-color-scheme: dark) {
    --studio-color-scheme: dark;

    --studio-foreground: var(--gray-12);
    --studio-background: var(--gray-1);

    --studio-border-color: rgb(255, 255, 255, 0.1);

    --studio-hover-color: rgb(255, 255, 255, 0.1);
    --studio-toggle-bg-on: rgba(255, 255, 255, 0.2);
  }

  font-family: var(--studio-font-family);
  background-color: var(--studio-background);
  color: var(--studio-foreground);

  & :focus-visible {
    outline: 2px solid var(--studio-accent-8);
  }

  // Gap
  [data-gap='1'] {
    gap: var(--studio-spacing-1);
  }

  [data-gap='2'] {
    gap: var(--studio-spacing-2);
  }

  [data-gap='3'] {
    gap: var(--studio-spacing-3);
  }

  [data-gap='4'] {
    gap: var(--studio-spacing-4);
  }

  // Padding
  [data-p='1'] {
    padding: var(--studio-spacing-1);
  }

  [data-p='2'] {
    padding: var(--studio-spacing-2);
  }

  [data-p='3'] {
    padding: var(--studio-spacing-3);
  }

  [data-p='4'] {
    padding: var(--studio-spacing-4);
  }

  [data-px='1'] {
    padding-left: var(--studio-spacing-1);
    padding-right: var(--studio-spacing-1);
  }

  [data-px='2'] {
    padding-left: var(--studio-spacing-1);
    padding-right: var(--studio-spacing-1);
  }

  [data-px='3'] {
    padding-left: var(--studio-spacing-1);
    padding-right: var(--studio-spacing-1);
  }

  [data-px='4'] {
    padding-left: var(--studio-spacing-1);
    padding-right: var(--studio-spacing-1);
  }

  [data-py='1'] {
    padding-top: var(--studio-spacing-1);
    padding-bottom: var(--studio-spacing-1);
  }

  [data-py='2'] {
    padding-top: var(--studio-spacing-1);
    padding-bottom: var(--studio-spacing-1);
  }

  [data-py='3'] {
    padding-top: var(--studio-spacing-1);
    padding-bottom: var(--studio-spacing-1);
  }

  [data-py='4'] {
    padding-top: var(--studio-spacing-1);
    padding-bottom: var(--studio-spacing-1);
  }

  & :where([data-size='1']) {
    font-size: var(--studio-font-size-1);
  }

  & :where([data-size='2']) {
    font-size: var(--studio-font-size-2);
  }

  & :where([data-weight='light']) {
    font-weight: var(--studio-font-weight-light);
  }

  & :where([data-weight='normal']) {
    font-weight: var(--studio-font-weight-normal);
  }

  & :where([data-weight='medium']) {
    font-weight: var(--studio-font-weight-medium);
  }

  & :where([data-weight='bold']) {
    font-weight: var(--studio-font-weight-bold);
  }

  // Input and textarea
  --studio-input-font-size: var(--studio-font-size-2);
  --studio-input-padding: var(--studio-spacing-2);
  --studio-input-height: var(--studio-spacing-8);
  --studio-input-border-radius: 4px;
  --studio-input-color: var(--studio-foreground);
  --studio-input-box-shadow: inset 0 0 0 1px var(--gray-a7);

  .studio-input {
    border: none;
    border-radius: var(--studio-input-border-radius);

    font-family: var(--studio-font-family);
    font-size: var(--studio-input-font-size);
    color-scheme: var(--studio-color-scheme);
    color: var(--studio-input-color);

    background-color: transparent;
    background-clip: content-box;
    box-shadow: var(--studio-input-box-shadow);
    box-sizing: border-box;
    border-radius: var(--studio-input-border-radius);
    min-height: var(--studio-input-height);
  }

  .studio-input[data-size='1'] {
    --studio-input-font-size: var(--studio-font-size-1);
    --studio-input-padding: calc(var(--studio-spacing-1) * 1.5);
    --studio-input-height: var(--studio-spacing-6);
  }

  .lucide {
    width: 1em;
    height: 1em;
    min-width: 16px;
    min-height: 16px;
    stroke-width: 1.5;
  }
`

const getStyles = (root: boolean, includeColors: boolean) => {
  if (!root) {
    return css`
      :host {
        ${includeColors ? getColors() : ''}

        ${styles};

        --studio-layer-0: 999999990;
      }
    `
  }

  return css`
    :root {
      ${includeColors ? getColors() : ''}

      ${styles};
    }
  `
}

interface ThemeProps {
  root?: boolean
  includeColors?: boolean
}

export function Theme({ root = true, includeColors = false }: ThemeProps) {
  const styles = useMemo(
    () => getStyles(root, includeColors),
    [root, includeColors]
  )

  return <Global styles={styles} />
}
