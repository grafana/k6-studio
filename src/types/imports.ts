import { z } from 'zod'

import { ImportModuleSchema } from '@/schemas/imports'

export type ImportModule = z.infer<typeof ImportModuleSchema>
