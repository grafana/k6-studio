import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'

import { ContainerProvider } from '@/components/primitives/ContainerProvider'
import { Theme } from '@/components/primitives/Theme'
import { BrowserExtensionClient } from 'extension/src/messaging'

import { GlobalStyles } from './GlobalStyles'
import { InBrowserControls } from './InBrowserControls'
import { SettingsProvider, SettingsStorage } from './SettingsProvider'
import { StudioClientProvider } from './StudioClientProvider'
import { isUsingTool } from './utils'

// When using CDP, some pages will open with an empty document with readyState "completed"
// the first time that a page is loaded. This means our UI is injected into the empty document,
// then the document is replaced with the actual content, making our UI disappear.
//
// It's not entirely clear why this happens and there doesn't seem to be any events firing that
// we can rely on. So instead, we use use a brute-force polling mechanism to monitor if the document
// reference changes during the opening stages of the page. It's not pretty but it works.
function monitorDocumentChange(onChange: () => void) {
  // During this short period of time the document will have the URL "about:blank", so if it's
  // different then we can skip this check entirely.
  if (document.location.href !== 'about:blank') {
    return
  }

  const abortController = new AbortController()
  const currentDocument = document

  setTimeout(function checkDocumentInstance() {
    if (abortController.signal.aborted) {
      return
    }

    if (document === currentDocument) {
      setTimeout(checkDocumentInstance, 1)

      return
    }

    onChange()
  }, 1)

  // We only need to monitor the first few seconds or so. If nothing has changed
  // by then, there's no point in wasting CPU cycles.
  setTimeout(() => {
    abortController.abort()
  }, 5000)
}

// We use a MutationObservers to try and load the UI as soon as the body
// element has been added. Otherwise we have to wait for content to be
// downloaded and scripts executed, making it quite noticeable that the
// UI is being injected.
//
// In the case of CDP, the script is injected so early that not even the
// documentElement is present, so we have to wait for that as well.
function waitForDocumentElement(signal: AbortSignal): Promise<void> {
  if (document.documentElement) {
    return Promise.resolve()
  }

  const { promise, resolve } = Promise.withResolvers<void>()

  const observer = new MutationObserver(() => {
    if (document.documentElement) {
      observer.disconnect()
      resolve()
    }
  })

  signal.addEventListener('abort', () => {
    observer.disconnect()
  })

  observer.observe(document, {
    childList: true,
  })

  return promise
}

function waitForBodyElement(signal: AbortSignal): Promise<void> {
  if (document.body) {
    return Promise.resolve()
  }

  const { promise, resolve } = Promise.withResolvers<void>()

  const observer = new MutationObserver(() => {
    if (document.body) {
      observer.disconnect()

      resolve()
    }
  })

  signal.addEventListener('abort', () => {
    observer.disconnect()
  })

  observer.observe(document.documentElement, {
    childList: true,
  })

  return promise
}

export function initializeView(
  client: BrowserExtensionClient,
  storage: SettingsStorage
) {
  const abortController = new AbortController()

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
    if (abortController.signal.aborted) {
      return
    }

    abortController.abort()

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
      <CacheProvider value={globalCache}>
        <GlobalStyles />
        <StudioClientProvider client={client}>
          <SettingsProvider storage={storage}>
            <ContainerProvider container={root}>
              <CacheProvider value={shadowCache}>
                <Theme root={false} includeColors />
                <InBrowserControls />
              </CacheProvider>
            </ContainerProvider>
          </SettingsProvider>
        </StudioClientProvider>
      </CacheProvider>
    )
  }

  monitorDocumentChange(() => {
    console.log('Document instance changed, re-initializing UI.')

    initializeView(client, storage)
  })

  if (document.readyState === 'loading') {
    waitForDocumentElement(abortController.signal)
      .then(() => waitForBodyElement(abortController.signal))
      .then(() => {
        initialize()
      })
      .catch((err) => {
        console.error('An error occurred when initializing in-browser UI', err)
      })

    // Worst case scenario, we initialize the UI when the DOM is ready.
    window.addEventListener('DOMContentLoaded', () => {
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
