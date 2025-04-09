import { css, Global } from '@emotion/react'
import { useEffect } from 'react'

const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 8)

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

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        html body[data-scroll-locked] {
          --removed-body-scroll-bar-size: 0 !important;
          margin-right: 0 !important;
        }

        .kxis-studio-inspecting-${uuid} {
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
