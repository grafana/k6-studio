import { z } from 'zod'

import { exhaustive } from '../../utils/typescript'

import * as v0 from './v0'
import * as v1 from './v1'
import * as v2 from './v2'
import * as v3 from './v3'

const AnyGeneratorSchema = z.discriminatedUnion('version', [
  v0.GeneratorFileDataSchema,
  v1.GeneratorFileDataSchema,
  v2.GeneratorFileDataSchema,
  v3.GeneratorFileDataSchema,
])

export function migrate(generator: z.infer<typeof AnyGeneratorSchema>) {
  switch (generator.version) {
    case '0':
      return migrate(v0.migrate(generator))
    case '1.0':
      return migrate(v1.migrate(generator))
    case '2.0':
      return migrate(v2.migrate(generator))
    case '3.0':
      return generator
    default:
      return exhaustive(generator)
  }
}

export const GeneratorFileDataSchema = AnyGeneratorSchema.transform(migrate)

export * from './v3/rules'
export * from './v3/testData'
export * from './v3/testOptions'
export * from './v3/thresholds'
