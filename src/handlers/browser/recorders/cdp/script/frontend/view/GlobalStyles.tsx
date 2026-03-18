import { css, Global } from '@emotion/react'
import { nanoid } from 'nanoid'
import { useEffect } from 'react'

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

export function GlobalStyles() {
  return (
    <Global
      styles={css`
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
