import { z } from 'zod/v4'

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

export const LocatorOptionsSchema = z.object({
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

export type ElementLocator = z.infer<typeof ElementLocatorSchema>
export type CssLocator = z.infer<typeof CssLocatorSchema>
export type RoleLocator = z.infer<typeof GetByRoleLocatorSchema>
export type TestIdLocator = z.infer<typeof GetByTestIdLocatorSchema>
export type AltLocator = z.infer<typeof GetByAltTextLocatorSchema>
export type LabelLocator = z.infer<typeof GetByLabelLocatorSchema>
export type PlaceholderLocator = z.infer<typeof GetByPlaceholderLocatorSchema>
export type TitleLocator = z.infer<typeof GetByTitleLocatorSchema>
export type TextLocator = z.infer<typeof GetByTextLocatorSchema>
export type LocatorOptions = z.infer<typeof LocatorOptionsSchema>

/** Locator options for a plain CSS selector. */
export function cssLocatorOptions(selector: string): LocatorOptions {
  return { current: 'css', values: { css: { type: 'css', selector } } }
}
