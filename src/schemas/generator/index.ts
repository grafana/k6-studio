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
      migrateEmptyExtractionModeInCorrelation(generator)
      return generator
    default:
      return exhaustive(generator)
  }
}

// We added a new field `extractionMode` with a default value of `multiple` for the Correlation Rule
// This rule was working in a `single` extraction mode previously so this migration checks that the value
// is not defined and in that case we manually set the previous way of working
function migrateEmptyExtractionModeInCorrelation(
  generator: v1.GeneratorSchema
) {
  generator.rules.forEach((rule) => {
    if (
      rule.type === 'correlation' &&
      rule.extractor.extractionMode === undefined
    ) {
      rule.extractor.extractionMode = 'single'
    }
  })
}

export const GeneratorFileDataSchema = AnyGeneratorSchema.transform(migrate)

export * from './v1/rules'
export * from './v1/testData'
export * from './v1/testOptions'
export * from './v1/thresholds'
