import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'

import { ContainerProvider } from '@/components/primitives/ContainerProvider'
import { Theme } from '@/components/primitives/Theme'

import { BrowserExtensionClient } from '../../messaging'

import { GlobalStyles } from './GlobalStyles'
import { InBrowserControls } from './InBrowserControls'
import { BrowserExtensionClientProvider } from './hooks/useBrowserExtensionClient'
import { isUsingTool } from './utils'

let initialized = false

export function initializeView(client: BrowserExtensionClient) {
  let shadowRoot: ShadowRoot | null = null

  function createMount() {
    const mount = document.createElement('div')

    document.body.appendChild(mount)

    // Our mount needs to stay at the end of the body, otherwise it will interfere
    // with the selector algorithm. For example, take the following DOM:
    //
    // ```
    // <body>
    //   <div>User element</div>
    //   <div id="ksix-studio-mount"></div>
    //   <div>Dynamically added later</div>
    // </body>
    // ```
    //
    // If the user was highlighting the dynamically added element, the selector generator
    // could generate a selector like `body > div:nth-child(3)`. But running the generated
    // script would always result in an error because the mount is only present when recording
    // and the correct selector should have been `body > div:nth-child(2)`.
    //
    // So we use a MutationObserver to continuously check if the mount is still the last
    // element in the body. If it isn't, we move it to the end of the body.
    const positionObserver = new MutationObserver(() => {
      if (mount.nextSibling === null) {
        return
      }

      document.body.appendChild(mount)
    })

    positionObserver.observe(document.body, {
      childList: true,
    })

    // Some UI frameworks use the `inert` attribute to disable interaction with
    // elements outside of a modal. We remove this attribute so that the recording
    // controls are always accessible.
    const attributeObserver = new MutationObserver(() => {
      if (mount.hasAttribute('inert')) {
        mount.removeAttribute('inert')
      }
    })

    attributeObserver.observe(mount, {
      attributes: true,
      attributeFilter: ['inert'],
    })

    return mount
  }

  function createShadowRoot(mount: Element) {
    shadowRoot = mount.attachShadow({
      mode: 'open',
    })

    const root = document.createElement('div')

    root.style.cursor = 'initial'
    root.style.pointerEvents = 'auto'

    root.dataset.ksixStudio = 'true'

    shadowRoot.appendChild(root)

    return root
  }

  function initialize() {
    // We have multiple points in time when we try to inject the UI. This
    // makes sure we actually only do it once.
    if (initialized) {
      return
    }

    initialized = true

    const mount = createMount()
    const root = createShadowRoot(mount)

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
      // For performance reasons, Emotion uses `insertRule` to insert styles in
      // production builds. However, it seems that moving an element clears its
      // styles. Since we need to move our mount, we have to resort to using the
      // less performance option of inserting `<style />` elements.
      speedy: false,
    })

    createRoot(root).render(
      <BrowserExtensionClientProvider client={client}>
        <CacheProvider value={globalCache}>
          <GlobalStyles />
          <ContainerProvider container={root}>
            <CacheProvider value={shadowCache}>
              <Theme root={false} includeColors />
              <InBrowserControls />
            </CacheProvider>
          </ContainerProvider>
        </CacheProvider>
      </BrowserExtensionClientProvider>
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

  function isInsideBrowserUI(element: Element) {
    return element.getRootNode() === shadowRoot
  }

  // We want to make sure that the user can always interact with the toolbar.
  // This function checks if an event is being dispatched to an element inside
  // our UI and, if so, stops any event listeners outside the our shadow root
  // from being triggered.
  function bypassRecordedPage(event: Event) {
    const target = event.composedPath()[0]

    if (target instanceof Element === false) {
      return
    }

    if (!isInsideBrowserUI(target)) {
      return
    }

    // We create a copy of the event, stop the original and dispatch the new one
    // to the target with `composed` set to `false` so that it doesn't propagate outside.
    const EventConstructor = event.constructor as new (
      type: string,
      eventInitDict?: EventInit
    ) => Event

    const newEvent = new EventConstructor(event.type, {
      ...event,
      composed: false,
      cancelable: event.cancelable,
      bubbles: event.bubbles,
    })

    event.stopImmediatePropagation()

    target.dispatchEvent(newEvent)
  }

  // Handling focus events requires some extra logic because we want to
  // stop focus events whenever the user is using a tool, but we also
  // want to user events to propagate to the browser UI if the event was
  // triggered there.
  function bypassFocusEvent(event: FocusEvent) {
    if (event.target instanceof Element === false) {
      return
    }

    if (isInsideBrowserUI(event.target)) {
      bypassRecordedPage(event)

      return
    }

    if (!isUsingTool()) {
      return
    }

    event.stopImmediatePropagation()
  }

  window.addEventListener('click', bypassRecordedPage, true)
  window.addEventListener('pointerdown', bypassRecordedPage, true)
  window.addEventListener('pointerup', bypassRecordedPage, true)
  window.addEventListener('focusin', bypassFocusEvent, true)
  window.addEventListener('focusout', bypassFocusEvent, true)
  window.addEventListener('focus', bypassFocusEvent, true)
  window.addEventListener('blur', bypassFocusEvent, true)
}
