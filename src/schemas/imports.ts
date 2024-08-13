import { z } from 'zod'

const ImportSchema = z.object({
  name: z.string(),
  alias: z.string().optional(),
})

const NamedImportsSchema = z.object({
  type: z.literal('named'),
  imports: ImportSchema.array(),
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
