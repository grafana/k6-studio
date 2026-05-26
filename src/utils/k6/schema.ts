import { z } from 'zod'

const CloudOptionsSchema = z.object({
  name: z.string().nullish(),
  projectID: z.number().nullish(),
})

const BrowserOptionsSchema = z.object({
  type: z.string(),
})

const ScenarioOptionsSchema = z.object({
  browser: BrowserOptionsSchema.nullish(),
})

const ScenarioBaseSchema = z.object({
  executor: z.string(),
  exec: z.string().nullish(),
  options: ScenarioOptionsSchema.nullish(),
})

export const TestOptionsSchema = z
  .object({
    cloud: CloudOptionsSchema.nullish(),
    scenarios: z.record(z.string(), ScenarioBaseSchema).nullish(),
  })
  .passthrough()

export type K6TestOptions = z.infer<typeof TestOptionsSchema>
