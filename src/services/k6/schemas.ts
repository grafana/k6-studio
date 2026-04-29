import { z } from 'zod/v4'

export function CloudList<Output = unknown, Input = Output>(
  item: z.ZodType<Output, Input>
) {
  return z.object({
    value: z.array(item),
  })
}

export const CloudTestSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const ListCloudTestsSchema = CloudList(CloudTestSchema)

export const CloudTestRunSchema = z.object({
  id: z.number(),
})

export const CloudProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  is_default: z.boolean(),
})

export const ListCloudProjectsSchema = CloudList(CloudProjectSchema)

export type CloudProject = z.infer<typeof CloudProjectSchema>
export type CloudTest = z.infer<typeof CloudTestSchema>
export type CloudTestRun = z.infer<typeof CloudTestRunSchema>
