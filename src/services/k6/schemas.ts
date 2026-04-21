import { z } from 'zod'

export function CloudList<
  Output = unknown,
  Def extends z.ZodTypeDef = z.ZodTypeDef,
  Input = Output,
>(item: z.ZodSchema<Output, Def, Input>) {
  return z.object({
    value: z.array(item),
  })
}

export const CloudTestSchema = z.object({
  id: z.number(),
  name: z.string(),
  project_id: z.number().optional(),
})

export const ListCloudTestsSchema = CloudList(CloudTestSchema)

/** Single page of load tests (optional `@nextLink` for pagination). */
export const ListCloudTestsPageSchema = z.object({
  value: z.array(CloudTestSchema),
  '@nextLink': z.string().optional(),
})

export const CloudTestRunSchema = z.object({
  id: z.number(),
})

/** Response from POST /load_tests/{id}/start (OpenAPI StartLoadTestResponse). */
export const StartCloudTestRunSchema = z.object({
  id: z.number(),
  test_run_details_page_url: z.string(),
})

export const CloudProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_default: z.boolean(),
})

export const ListCloudProjectsSchema = CloudList(CloudProjectSchema)

export type CloudProject = z.infer<typeof CloudProjectSchema>
export type CloudTest = z.infer<typeof CloudTestSchema>
export type ListCloudTestsPage = z.infer<typeof ListCloudTestsPageSchema>
export type CloudTestRun = z.infer<typeof CloudTestRunSchema>
export type StartCloudTestRun = z.infer<typeof StartCloudTestRunSchema>
