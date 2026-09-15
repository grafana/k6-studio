import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createRoot } from 'react-dom/client'

import { ContainerProvider } from '@/components/primitives/ContainerProvider'
import { Theme } from '@/components/primitives/Theme'
import { BrowserExtensionClient } from '@/recorder/browser/messaging'

import { ErrorBoundary } from './ErrorBoundary'
import { GlobalStyles } from './GlobalStyles'
import { InBrowserControls } from './InBrowserControls'
import { monitorDocumentChange } from './monitor'
import { createMount, isDocumentMounted, removeStaleMounts } from './mount'
import { SettingsProvider, SettingsStorage } from './SettingsProvider'
import { StudioClientProvider } from './StudioClientProvider'
import { isUsingTool } from './utils'

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

  // Tears down what initialize() set up: the mount observers, the React root
  // (so its client/storage subscriptions are released), and the bypass
  // listeners. Replaced once initialize() has run.
  let disposeInitialized = () => {}

  // Dispose handle of the re-initialization monitorDocumentChange may start.
  let disposeReinitialized = () => {}

  let shadowRoot: ShadowRoot | null = null

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

    // Another initializer beat us to this document. See the mount marker in
    // mount.ts for why a second mount must never be created.
    if (isDocumentMounted()) {
      console.warn('[k6 Studio] In-browser UI is already initialized.')

      return
    }

    // A page that rewrote itself from its own serialized body can carry dead
    // copies of a previous mount's marker.
    removeStaleMounts()

    const { mount, dispose: disposeMount } = createMount()

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

    const reactRoot = createRoot(root, {
      // Our error boundaries already warn once for every crash they catch.
      // React would log the same crash again at error level, in a console that
      // belongs to the recorded page rather than to us.
      onCaughtError: () => {},
    })

    reactRoot.render(
      <CacheProvider value={globalCache}>
        <GlobalStyles />
        <StudioClientProvider client={client}>
          <SettingsProvider storage={storage}>
            <ContainerProvider container={root}>
              <CacheProvider value={shadowCache}>
                <Theme root={false} includeColors />
                {/*
                  InBrowserControls' own hooks run above its per-feature
                  boundaries. Without this outer boundary a crash there would
                  bypass them all and unmount the whole UI.
                */}
                <ErrorBoundary>
                  <InBrowserControls />
                </ErrorBoundary>
              </CacheProvider>
            </ContainerProvider>
          </SettingsProvider>
        </StudioClientProvider>
      </CacheProvider>
    )

    const removeBypassListeners = attachBypassListeners()

    disposeInitialized = () => {
      removeBypassListeners()
      reactRoot.unmount()
      disposeMount()
    }
  }

  const stopMonitoring = monitorDocumentChange(() => {
    console.log('Document instance changed, re-initializing UI.')

    disposeReinitialized = initializeView(client, storage)
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
      // The linter complains about the prototype being lost but we don't care
      // about it. We only care about copying the properties.
      // oxlint-disable-next-line typescript/no-misused-spread
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

  // Only useful once our UI exists: every listener starts with an
  // isInsideBrowserUI check, so on the path where the mount guard bails they
  // would just tax every interaction on the page.
  function attachBypassListeners() {
    window.addEventListener('click', bypassRecordedPage, true)
    window.addEventListener('pointerdown', bypassRecordedPage, true)
    window.addEventListener('pointerup', bypassRecordedPage, true)
    window.addEventListener('focusin', bypassFocusEvent, true)
    window.addEventListener('focusout', bypassFocusEvent, true)
    window.addEventListener('focus', bypassFocusEvent, true)
    window.addEventListener('blur', bypassFocusEvent, true)

    return () => {
      window.removeEventListener('click', bypassRecordedPage, true)
      window.removeEventListener('pointerdown', bypassRecordedPage, true)
      window.removeEventListener('pointerup', bypassRecordedPage, true)
      window.removeEventListener('focusin', bypassFocusEvent, true)
      window.removeEventListener('focusout', bypassFocusEvent, true)
      window.removeEventListener('focus', bypassFocusEvent, true)
      window.removeEventListener('blur', bypassFocusEvent, true)
    }
  }

  return function dispose() {
    // Cancels an initialization that hasn't happened yet (initialize() bails
    // once the controller is aborted) and tears down one that has.
    abortController.abort()

    // The monitor runs on its own controller, because the one above is aborted
    // by initialize() as its single-initialization latch, long before the
    // empty-document swap the monitor waits for. Stopping it here, before the
    // teardown below, keeps a late poll from re-initializing a view whose
    // dispose handle would land in this dead copy's disposeReinitialized.
    stopMonitoring()

    disposeInitialized()
    disposeReinitialized()
  }
}
