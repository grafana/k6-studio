import createCache from '@emotion/cache'
import { CacheProvider, Global } from '@emotion/react'
import { BrowserWindowConstructorOptions } from 'electron'
import { PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { globalStyles } from '@/globalStyles'

interface SubWindowProps {
  options: BrowserWindowConstructorOptions
  onClose?: () => void
}

export function SubWindow({
  children,
  options,
  onClose,
}: PropsWithChildren<SubWindowProps>) {
  const [id] = useState(crypto.randomUUID())
  const [subWindow] = useState<Window | null>(() =>
    window.open('about:blank', '_blank', JSON.stringify({ id, options }))
  )

  useEffect(() => {
    return () => {
      if (subWindow) {
        subWindow.close()
      }
    }
  }, [subWindow])

  useEffect(() => {
    return window.studio.ui.onCloseWindow((windowId) => {
      if (id !== windowId) {
        return
      }

      onClose?.()
    })
  }, [onClose, id])

  if (subWindow === null) {
    return null
  }

  const subWindowCache = createCache({
    key: 'ksix-studio',
    container: subWindow.document.head,
  })

  return createPortal(
    <CacheProvider value={subWindowCache}>
      <Global styles={globalStyles} />
      {children}
    </CacheProvider>,
    subWindow.document.body
  )
}
