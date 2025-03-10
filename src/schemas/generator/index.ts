import { z } from 'zod'
import * as v0 from './v0'
import * as v1 from './v1'
import { exhaustive } from '../../utils/typescript'

const AnyGeneratorSchema = z.discriminatedUnion('version', [
  v0.GeneratorFileDataSchema,
  v1.GeneratorFileDataSchema,
])

export function migrate(generator: z.infer<typeof AnyGeneratorSchema>) {
  switch (generator.version) {
    case '0':
      return migrate(v0.migrate(generator))
    case '1.0':
      return generator
    default:
      return exhaustive(generator)
  }
}

export const GeneratorFileDataSchema = AnyGeneratorSchema.transform(migrate)

export * from './v1/rules'
export * from './v1/testData'
export * from './v1/testOptions'
export * from './v1/thresholds'
