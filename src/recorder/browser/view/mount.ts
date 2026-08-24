const MOUNT_MARKER_ATTRIBUTE = 'data-ksix-studio-mount'

/**
 * Whether the document hosts a LIVE recorder UI. A mount is live if
 * it has the marker attribute and a shadow root.
 */
export function isDocumentMounted() {
  return findMounts().some((element) => element.shadowRoot !== null)
}

/**
 * Removes marker-bearing elements that have no UI behind them, so they can't
 * skew generated nth-child selectors.
 */
export function removeStaleMounts() {
  findMounts()
    .filter((element) => element.shadowRoot === null)
    .forEach((element) => element.remove())
}

function findMounts() {
  return [...document.querySelectorAll(`[${MOUNT_MARKER_ATTRIBUTE}]`)]
}

/**
 * Creates the element that hosts the recorder UI inside the recorded page and
 * defends it against the page's own DOM manipulation. Returns the mount and a
 * dispose function that stops the defending observers and takes the mount back
 * out of the document.
 */
export function createMount() {
  const mount = document.createElement('div')

  mount.setAttribute(MOUNT_MARKER_ATTRIBUTE, 'true')

  document.body.appendChild(mount)

  const stopKeepingAtEndOfBody = keepMountAtEndOfBody(mount)

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

  return {
    mount,
    dispose: () => {
      stopKeepingAtEndOfBody()
      attributeObserver.disconnect()
      mount.remove()
    },
  }
}

/**
 * Keeps the given mount element attached as the last element of
 * `document.body`.
 *
 * The mount needs to stay at the end of the body, otherwise it will interfere
 * with the selector algorithm. For example, take the following DOM:
 *
 * ```
 * <body>
 *   <div>User element</div>
 *   <div id="ksix-studio-mount"></div>
 *   <div>Dynamically added later</div>
 * </body>
 * ```
 *
 * If the user was highlighting the dynamically added element, the selector
 * generator could generate a selector like `body > div:nth-child(3)`. But
 * running the generated script would always result in an error because the
 * mount is only present when recording and the correct selector should have
 * been `body > div:nth-child(2)`.
 *
 * Pages can also remove the mount outright, e.g. React hydrating the whole
 * body treats it as a hydration mismatch and deletes it (grafana.com legal
 * pages do this). In both cases we move the mount back to the end of the body
 * so the recording controls stay available.
 */
export function keepMountAtEndOfBody(mount: Element) {
  const body = document.body

  function ensureAtEndOfBody() {
    // The body this observer was attached to is gone (e.g. document.open()
    // rewrote the document, which does not disconnect observers). The mount
    // died with it and must not be resurrected into the new document, where
    // its marker would block a fresh injection from mounting a working UI.
    if (document.body !== body) {
      positionObserver.disconnect()

      return
    }

    if (document.body.lastElementChild !== mount) {
      document.body.appendChild(mount)
    }
  }

  const positionObserver = new MutationObserver(ensureAtEndOfBody)

  positionObserver.observe(body, {
    childList: true,
  })

  return function dispose() {
    positionObserver.disconnect()
  }
}
