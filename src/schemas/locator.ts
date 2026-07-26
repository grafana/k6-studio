import { z } from 'zod/v4'

import { exhaustive } from '@/utils/typescript'
import { newSyntheticKey, syntheticKey } from '@/utils/zod'

const CssLocatorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

const GetByRoleLocatorSchema = z.object({
  type: z.literal('role'),
  role: z.string(),
  options: z
    .object({
      name: z.string().optional(),
      exact: z.boolean().optional(),
    })
    .optional(),
})

const GetByTestIdLocatorSchema = z.object({
  type: z.literal('testid'),
  testId: z.string(),
})

const TextLocatorOptions = z
  .object({
    exact: z.boolean().optional(),
  })
  .optional()

const GetByAltTextLocatorSchema = z.object({
  type: z.literal('alt'),
  text: z.string(),
  options: TextLocatorOptions,
})

const GetByLabelLocatorSchema = z.object({
  type: z.literal('label'),
  label: z.string(),
  options: TextLocatorOptions,
})

const GetByPlaceholderLocatorSchema = z.object({
  type: z.literal('placeholder'),
  placeholder: z.string(),
  options: TextLocatorOptions,
})

const GetByTitleLocatorSchema = z.object({
  type: z.literal('title'),
  title: z.string(),
  options: TextLocatorOptions,
})

const GetByTextLocatorSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  options: TextLocatorOptions,
})

export const ElementLocatorSchema = z.discriminatedUnion('type', [
  CssLocatorSchema,
  GetByRoleLocatorSchema,
  GetByTestIdLocatorSchema,
  GetByAltTextLocatorSchema,
  GetByLabelLocatorSchema,
  GetByPlaceholderLocatorSchema,
  GetByTitleLocatorSchema,
  GetByTextLocatorSchema,
])

const LocatorTypeSchema = z.union([
  CssLocatorSchema.shape.type,
  GetByRoleLocatorSchema.shape.type,
  GetByTestIdLocatorSchema.shape.type,
  GetByAltTextLocatorSchema.shape.type,
  GetByLabelLocatorSchema.shape.type,
  GetByPlaceholderLocatorSchema.shape.type,
  GetByTitleLocatorSchema.shape.type,
  GetByTextLocatorSchema.shape.type,
])

const BaseLocatorOptionsSchema = z.object({
  key: syntheticKey(),
  current: LocatorTypeSchema,
  values: z.object({
    css: CssLocatorSchema.optional(),
    role: GetByRoleLocatorSchema.optional(),
    testid: GetByTestIdLocatorSchema.optional(),
    alt: GetByAltTextLocatorSchema.optional(),
    label: GetByLabelLocatorSchema.optional(),
    placeholder: GetByPlaceholderLocatorSchema.optional(),
    title: GetByTitleLocatorSchema.optional(),
    text: GetByTextLocatorSchema.optional(),
  }),
})

export type FrameLocatorOptions = z.infer<typeof BaseLocatorOptionsSchema> & {
  type: 'frame'
  parent?: LocatorOptions
}
export type ElementLocatorOptions = z.infer<typeof BaseLocatorOptionsSchema> & {
  type: 'element'
  parent?: LocatorOptions
}

export type LocatorOptions = FrameLocatorOptions | ElementLocatorOptions

export const FrameLocatorOptionsSchema = BaseLocatorOptionsSchema.extend({
  type: z.literal('frame'),
  parent: z.lazy(() => LocatorOptionsSchema).optional(),
}) satisfies z.ZodType<FrameLocatorOptions>

export const ElementLocatorOptionsSchema = BaseLocatorOptionsSchema.extend({
  type: z.literal('element'),
  parent: z.lazy(() => LocatorOptionsSchema).optional(),
}) satisfies z.ZodType<ElementLocatorOptions>

export const LocatorOptionsSchema: z.ZodType<LocatorOptions> =
  z.discriminatedUnion('type', [
    FrameLocatorOptionsSchema,
    ElementLocatorOptionsSchema,
  ])

export type ElementLocator = z.infer<typeof ElementLocatorSchema>
export type CssLocator = z.infer<typeof CssLocatorSchema>
export type RoleLocator = z.infer<typeof GetByRoleLocatorSchema>
export type TestIdLocator = z.infer<typeof GetByTestIdLocatorSchema>
export type AltLocator = z.infer<typeof GetByAltTextLocatorSchema>
export type LabelLocator = z.infer<typeof GetByLabelLocatorSchema>
export type PlaceholderLocator = z.infer<typeof GetByPlaceholderLocatorSchema>
export type TitleLocator = z.infer<typeof GetByTitleLocatorSchema>
export type TextLocator = z.infer<typeof GetByTextLocatorSchema>

// Appends `next` to the outermost end of `chain`, preserving whatever parent
// chain `chain` already has instead of overwriting it.
function appendParent(
  chain: LocatorOptions | undefined,
  next: LocatorOptions
): LocatorOptions {
  if (chain === undefined) {
    return next
  }

  return { ...chain, parent: appendParent(chain.parent, next) }
}

function chainParents(
  parents: Array<LocatorOptions | undefined>
): LocatorOptions | undefined {
  return parents
    .filter((parent) => parent !== undefined)
    .reduce<LocatorOptions | undefined>(
      (chain, next) => appendParent(chain, next),
      undefined
    )
}

export function elementLocatorOptions(
  selector: ElementLocator = { type: 'css', selector: '' },
  ...parents: Array<LocatorOptions | undefined>
): ElementLocatorOptions {
  return {
    type: 'element',
    key: newSyntheticKey(),
    current: selector.type,
    values: { [selector.type]: selector },
    parent: chainParents(parents),
  }
}

export function frameLocatorOptions(
  selector: ElementLocator = { type: 'css', selector: '' },
  ...parents: Array<LocatorOptions | undefined>
): FrameLocatorOptions {
  return {
    type: 'frame',
    key: newSyntheticKey(),
    current: selector.type,
    values: { [selector.type]: selector },
    parent: chainParents(parents),
  }
}

/** An empty locator value of the given type. */
export function initializeLocatorValues(
  type: ElementLocator['type']
): ElementLocator {
  switch (type) {
    case 'css':
      return { type, selector: '' }

    case 'testid':
      return { type, testId: '' }

    case 'label':
      return { type, label: '', options: { exact: false } }

    case 'placeholder':
      return { type, placeholder: '', options: { exact: false } }

    case 'title':
      return { type, title: '', options: { exact: false } }

    case 'alt':
    case 'text':
      return { type, text: '', options: { exact: false } }

    case 'role':
      return { type, role: '', options: { exact: false } }

    default:
      return exhaustive(type)
  }
}

/** The locator value selected by `current`, defaulting to an empty one. */
export function getCurrentLocator(options: LocatorOptions): ElementLocator {
  return (
    options.values[options.current] ?? initializeLocatorValues(options.current)
  )
}
