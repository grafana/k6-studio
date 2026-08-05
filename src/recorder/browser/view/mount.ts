/**
 * Creates the element that hosts the recorder UI inside the recorded page and
 * defends it against the page's own DOM manipulation.
 */
export function createMount() {
  const mount = document.createElement('div')

  document.body.appendChild(mount)

  keepMountAtEndOfBody(mount)

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
  function ensureAtEndOfBody() {
    if (document.body.lastElementChild !== mount) {
      document.body.appendChild(mount)
    }
  }

  const positionObserver = new MutationObserver(ensureAtEndOfBody)

  positionObserver.observe(document.body, {
    childList: true,
  })

  return function dispose() {
    positionObserver.disconnect()
  }
}
