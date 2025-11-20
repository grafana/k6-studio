import { z } from 'zod'

const CloudOptionsSchema = z.object({
  name: z.string().optional(),
  projectID: z.number().optional(),
})

const BrowserOptionsSchema = z.object({
  type: z.string(),
})

const ScenarioOptionsSchema = z.object({
  browser: BrowserOptionsSchema.optional(),
})

const ScenarioBaseSchema = z.object({
  executor: z.string(),
  options: ScenarioOptionsSchema.optional(),
})

export const TestOptionsSchema = z
  .object({
    cloud: CloudOptionsSchema.optional(),
    scenarios: z.record(ScenarioBaseSchema).optional(),
  })
  .passthrough()

export type K6TestOptions = z.infer<typeof TestOptionsSchema>
