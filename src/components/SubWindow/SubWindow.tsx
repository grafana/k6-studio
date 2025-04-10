import createCache from '@emotion/cache'
import { CacheProvider, Global } from '@emotion/react'
import { BrowserWindowConstructorOptions } from 'electron'
import { PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { globalStyles } from '@/globalStyles'

interface SubWindowProps {
  options: BrowserWindowConstructorOptions
}

export function SubWindow({
  children,
  options,
}: PropsWithChildren<SubWindowProps>) {
  const [subWindow] = useState<Window | null>(() =>
    window.open('about:blank', '_blank', JSON.stringify({ options }))
  )

  useEffect(() => {
    return () => {
      if (subWindow) {
        subWindow.close()
      }
    }
  }, [subWindow])

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
