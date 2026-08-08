interface RawLocator {
  type?: 'element' | 'frame'
  current?: string
  values?: Record<string, unknown>
  parent?: RawLocator
  [key: string]: unknown
}

interface RawAction {
  locator?: RawLocator
  frames?: RawLocator[]
  [key: string]: unknown
}

interface RawBrowserTestFile {
  version: string
  actions: RawAction[]
  options: Record<string, unknown>
}

/**
 * Normalizes a legacy browser test file to the current schema format.
 *
 * Handles two backward-compat cases introduced when LocatorOptions became
 * recursive (type discriminator + parent chain instead of a separate frames
 * array):
 *
 * 1. Locator objects missing `type` — defaults to `'element'` (on the action
 *    locator) or `'frame'` (on entries in the old `frames` array / parent chain).
 * 2. Actions with a top-level `frames` array — converts the array into a
 *    recursive `parent` chain on the locator and removes the `frames` property.
 */
export function migrateBrowserTestFile(file: RawBrowserTestFile): unknown {
  return {
    ...file,
    actions: file.actions.map(migrateAction),
  }
}

function migrateAction(action: RawAction): unknown {
  if (!action.locator) {
    return action
  }

  let locator = migrateLocator(action.locator, 'element')

  if (action.frames && action.frames.length > 0) {
    const parentChain = buildParentChain(action.frames)
    locator = attachParent(locator, parentChain)
  }

  const { frames: _removed, ...rest } = action

  return { ...rest, locator }
}

function migrateLocator(raw: RawLocator, defaultType: 'element' | 'frame'): RawLocator {
  const locator: RawLocator = {
    ...raw,
    type: raw.type ?? defaultType,
  }

  if (locator.parent) {
    locator.parent = migrateLocator(locator.parent, 'frame')
  }

  return locator
}

/**
 * Converts a flat frames array (outermost-first) into a recursive parent chain
 * (innermost frame's parent points to the next outer frame).
 */
function buildParentChain(frames: RawLocator[]): RawLocator | undefined {
  return frames.reduce<RawLocator | undefined>((acc, frame) => {
    return {
      ...migrateLocator(frame, 'frame'),
      parent: acc,
    }
  }, undefined)
}

/**
 * Appends an existing parent chain to the outermost end of a locator's
 * current parent chain, preserving any parents already on the locator.
 */
function attachParent(
  locator: RawLocator,
  parent: RawLocator | undefined
): RawLocator {
  if (!parent) {
    return locator
  }

  if (!locator.parent) {
    return { ...locator, parent }
  }

  return {
    ...locator,
    parent: attachParent(locator.parent, parent),
  }
}
