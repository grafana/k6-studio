import { z } from 'zod/v4'

export const CssNodeSelectorSchema = z.object({
  type: z.literal('css'),
  selector: z.string(),
})

const TextWithExact = z.object({
  value: z.string(),
  exact: z.boolean().optional(),
})

export const GetByRoleNodeSelectorSchema = z.object({
  type: z.literal('role'),
  role: z.string(),
  name: TextWithExact.optional(),
})

export const GetByAltTextNodeSelectorSchema = z.object({
  type: z.literal('alt'),
  text: TextWithExact,
})

export const GetByLabelNodeSelectorSchema = z.object({
  type: z.literal('label'),
  text: TextWithExact,
})

export const GetByPlaceholderNodeSelectorSchema = z.object({
  type: z.literal('placeholder'),
  text: TextWithExact,
})

export const GetByTextNodeSelectorSchema = z.object({
  type: z.literal('text'),
  text: TextWithExact,
})

export const GetByTitleNodeSelectorSchema = z.object({
  type: z.literal('title'),
  text: TextWithExact,
})

export const GetByTestIdNodeSelectorSchema = z.object({
  type: z.literal('test-id'),
  testId: z.string(),
})

export const NodeSelectorSchema = z.discriminatedUnion('type', [
  CssNodeSelectorSchema,
  GetByRoleNodeSelectorSchema,
  GetByAltTextNodeSelectorSchema,
  GetByLabelNodeSelectorSchema,
  GetByPlaceholderNodeSelectorSchema,
  GetByTextNodeSelectorSchema,
  GetByTitleNodeSelectorSchema,
  GetByTestIdNodeSelectorSchema,
])

export type CssNodeSelector = z.infer<typeof CssNodeSelectorSchema>
export type GetByRoleNodeSelector = z.infer<typeof GetByRoleNodeSelectorSchema>
export type GetByAltTextNodeSelector = z.infer<
  typeof GetByAltTextNodeSelectorSchema
>
export type GetByLabelNodeSelector = z.infer<
  typeof GetByLabelNodeSelectorSchema
>
export type GetByPlaceholderNodeSelector = z.infer<
  typeof GetByPlaceholderNodeSelectorSchema
>
export type GetByTextNodeSelector = z.infer<typeof GetByTextNodeSelectorSchema>
export type GetByTitleNodeSelector = z.infer<
  typeof GetByTitleNodeSelectorSchema
>
export type GetByTestIdNodeSelector = z.infer<
  typeof GetByTestIdNodeSelectorSchema
>
export type NodeSelector = z.infer<typeof NodeSelectorSchema>
