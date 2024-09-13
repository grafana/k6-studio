import { z } from 'zod'

export const VariableSchema = z.object({
  name: z.string().nonempty({ message: 'Required' }),
  value: z.string(),
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
})
