import { z } from 'zod/v4'

import { GeneratorFileDataSchema } from '@/schemas/generator'

export type GeneratorFileData = z.infer<typeof GeneratorFileDataSchema>
