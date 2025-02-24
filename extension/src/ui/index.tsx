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

  /**
   * The global cache contains any styles that should be applied to the
   * recorded page, e.g. showing a pointer when using the inspector tool.
   */
  const globalCache = createCache({
    key: 'ksix-studio',
  })

  /**
   * The shadow cache contains the styles for the in-browser controls.
   */
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
