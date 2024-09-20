import { z } from 'zod'

export const ExportScriptDialogSchema = z.object({
  scriptName: z
    .string()
    .min(1, { message: 'Required' })
    .regex(/^[\w,.\s-]+$/, { message: 'Invalid name' }),
  overwriteFile: z.boolean().default(false),
})

export type ExportScriptDialogData = z.infer<typeof ExportScriptDialogSchema>
