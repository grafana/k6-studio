/**
 * Migration for browser test files created before the recursive LocatorOptions
 * refactor (PR #1332). Old files have locator options without a `type` field
 * and use a flat `frames` array on actions. New files use `type: 'element' | 'frame'`
 * with a recursive `parent` chain.
 */

interface RawLocatorOptions {
  type?: 'element' | 'frame'
  parent?: RawLocatorOptions
  [key: string]: unknown
}

interface RawAction {
  locator?: RawLocatorOptions
  frames?: RawLocatorOptions[]
  [key: string]: unknown
}

interface RawBrowserTestFile {
  version: string
  actions: RawAction[]
  options: unknown
}

function migrateLocator(locator: RawLocatorOptions, type: 'element' | 'frame'): RawLocatorOptions {
  const migrated: RawLocatorOptions = { ...locator }

  if (migrated.type === undefined) {
    migrated.type = type
  }

  if (migrated.parent !== undefined) {
    migrated.parent = migrateLocator(migrated.parent, 'frame')
  }

  return migrated
}

function migrateAction(action: RawAction): RawAction {
  if (action.locator === undefined) {
    return action
  }

  const { frames, ...rest } = action

  let locator = migrateLocator(action.locator, 'element')

  if (frames !== undefined && frames.length > 0 && locator.parent === undefined) {
    const parent = frames.reduceRight<RawLocatorOptions | undefined>(
      (acc, frame) => {
        const migrated = migrateLocator(frame, 'frame')
        return { ...migrated, parent: acc }
      },
      undefined
    )

    locator = { ...locator, parent }
  }

  return { ...rest, locator }
}

export function migrateBrowserTestFile(file: RawBrowserTestFile): RawBrowserTestFile {
  return {
    ...file,
    actions: file.actions.map(migrateAction),
  }
}
