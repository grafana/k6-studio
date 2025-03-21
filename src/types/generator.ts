import { z } from 'zod'

import { GeneratorFileDataSchema } from '@/schemas/generator'

export type GeneratorFileData = z.infer<typeof GeneratorFileDataSchema>
