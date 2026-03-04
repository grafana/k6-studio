import { z } from 'zod'

export const VariableSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Required' })
    .regex(/^[a-zA-Z0-9_]*$/, { message: 'Invalid name' })
    // Don't allow native object properties, like __proto__, valueOf, etc.
    .refine((val) => !(val in {}), { message: 'Invalid name' }),
  value: z.string(),
})

export const DataFileSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Required' })
    // Don't allow native object properties, like __proto__, valueOf, etc.
    .refine((val) => !(val in {}), { message: 'Invalid name' }),
})

export const TestDataSchema = z.object({
  variables: VariableSchema.array().superRefine((variables, ctx) => {
    const names = variables.map((variable) => variable.name)

    const duplicateIndex = variables.findIndex(
      (item, index) => names.indexOf(item.name) !== index
    )

    if (duplicateIndex !== -1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Variable names must be unique',
        path: [duplicateIndex, 'name'],
      })
    }
  }),
  files: DataFileSchema.array().default([]),
})
