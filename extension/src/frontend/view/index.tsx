import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'

import { ContainerProvider } from '@/components/primitives/ContainerProvider'
import { Theme } from '@/components/primitives/Theme'

import { GlobalStyles } from './GlobalStyles'
import { InBrowserControls } from './InBrowserControls'

let initialized = false

function createShadowRoot() {
  const mount = document.createElement('div')

  document.body.prepend(mount)

  const shadow = mount.attachShadow({
    mode: 'open',
  })

  const root = document.createElement('div')

  root.style.cursor = 'initial'
  root.dataset.ksixStudio = 'true'

  shadow.appendChild(root)

  return root
}

function initialize() {
  // We have multiple points in time when we try to inject the UI. This
  // makes sure we actually only do it once.
  if (initialized) {
    return
  }

  initialized = true

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
      <GlobalStyles />
      <ContainerProvider container={root}>
        <CacheProvider value={shadowCache}>
          <Theme root={false} includeColors />
          <InBrowserControls />
        </CacheProvider>
      </ContainerProvider>
    </CacheProvider>
  )
}

if (document.readyState === 'loading') {
  // We use a MutationObserver to try and load the UI as soon as the body
  // element has been added. Otherwise we have to wait for content to be
  // downloaded and scripts executed, making it quite noticeable that the
  // UI is being injected.
  const mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLBodyElement) {
          mutationObserver.disconnect()

          initialize()
          break
        }
      }
    }
  })

  mutationObserver.observe(document.documentElement, {
    childList: true,
  })

  // Worst case scenario, we initialize the UI when the DOM is ready.
  window.addEventListener('DOMContentLoaded', () => {
    mutationObserver.disconnect()

    initialize()
  })
} else {
  initialize()
}
