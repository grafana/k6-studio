import { z } from 'zod'

const InstanceSchema = z.object({})

const InstancesResponseSchema = z.object({
  items: z.array(InstanceSchema),
})

export async function fetchInstances(token: string) {
  const response = await fetch(new URL('instances', GRAFANA_API_URL), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error("Couldn't fetch instances.")
  }

  return InstancesResponseSchema.parse(await response.json())
}
