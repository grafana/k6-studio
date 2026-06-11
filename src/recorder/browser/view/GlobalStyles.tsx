import { css, Global } from '@emotion/react'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'

import InterVariable from '@/assets/fonts/Inter/InterVariable.woff2'

const uuid = nanoid()

type GlobalClass = 'inspecting' | 'asserting-text'

export function useGlobalClass(name: GlobalClass) {
  useEffect(() => {
    const className = `ksix-studio-${name}-${uuid}`

    document.body.classList.add(className)

    return () => {
      document.body.classList.remove(className)
    }
  }, [name])
}

export const INTER_VARIABLE_FONT_FAMILY =
  "'InterVariable', -apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto, 'Helvetica Neue', 'Open Sans (Custom)', system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        @font-face {
          font-family: 'InterVariable';
          src: url(${InterVariable}) format('woff2');
          font-weight: 400 500 600 700;
          font-display: swap;
          font-style: normal;
        }

        html body[data-scroll-locked] {
          width: inherit !important;
          min-width: calc(
            100% - var(--removed-body-scroll-bar-size)
          ) !important;
        }

        .ksix-studio-inspecting-${uuid} {
          cursor: pointer !important;
        }

        .ksix-studio-asserting-text-${uuid} * {
          cursor: text !important;
          user-select: text !important;
        }
      `}
    />
  )
}
