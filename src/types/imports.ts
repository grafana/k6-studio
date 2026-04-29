import { z } from 'zod/v4'

import { ImportModuleSchema } from '@/schemas/imports'

export type ImportModule = z.infer<typeof ImportModuleSchema>
