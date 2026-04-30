import { z } from 'zod'

import { exhaustive } from '../../utils/typescript'

import * as v0 from './v0'
import * as v1 from './v1'
import * as v2 from './v2'

const AnyGeneratorSchema = z.discriminatedUnion('version', [
  v0.GeneratorFileDataSchema,
  v1.GeneratorFileDataSchema,
  v2.GeneratorFileDataSchema,
])

export function migrate(generator: z.infer<typeof AnyGeneratorSchema>) {
  switch (generator.version) {
    case '0':
      return migrate(v0.migrate(generator))
    case '1.0':
      return migrate(v1.migrate(generator))
    case '2.0':
      return generator
    default:
      return exhaustive(generator)
  }
}

export const GeneratorFileDataSchema = AnyGeneratorSchema.transform(migrate)

export * from './v2/rules'
export * from './v2/testData'
export * from './v2/testOptions'
export * from './v2/thresholds'
