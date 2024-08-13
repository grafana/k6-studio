import { z } from 'zod'

const NamedImportsSchema = z.object({
  type: z.literal('named'),
  imports: z
    .object({
      name: z.string(),
      alias: z.string().optional(),
    })
    .array(),
})

const NamespaceImportsSchema = z.object({
  type: z.literal('namespace'),
  alias: z.string(),
})

export const ImportModuleSchema = z.object({
  path: z.string(),
  default: z
    .object({
      name: z.string(),
    })
    .optional(),
  imports: z
    .discriminatedUnion('type', [NamedImportsSchema, NamespaceImportsSchema])
    .optional(),
})
