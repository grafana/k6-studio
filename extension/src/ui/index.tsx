import { createRoot } from 'react-dom/client'
import { InBrowserControls } from './InBrowserControls'
import createCache from '@emotion/cache'
import { CacheProvider, css, Global } from '@emotion/react'
import { ContainerProvider } from './ContainerProvider'

function createShadowRoot() {
  const mount = document.createElement('div')

  document.body.appendChild(mount)

  const shadow = mount.attachShadow({
    mode: 'open',
  })

  const root = document.createElement('div')

  root.dataset.ksixStudio = 'true'

  shadow.appendChild(root)

  return root
}

function initialize() {
  const root = createShadowRoot()

  const globalCache = createCache({
    key: 'ksix-studio',
  })

  const shadowCache = createCache({
    key: 'ksix-studio',
    container: root,
  })

  createRoot(root).render(
    <CacheProvider value={globalCache}>
      <Global
        styles={css`
          .ksix-studio-inspecting {
            cursor: pointer !important;
          }
        `}
      />
      <ContainerProvider container={root}>
        <CacheProvider value={shadowCache}>
          <InBrowserControls />
        </CacheProvider>
      </ContainerProvider>
    </CacheProvider>
  )
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}
