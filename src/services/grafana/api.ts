import { z } from 'zod'

import { Stack } from '@/types/auth'

const InstanceSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  url: z.string(),
  status: z
    .union([
      z.literal('active'),
      z.literal('paused'),
      z.literal('archived'),
      z.literal('restoring'),
      z.literal('unknown'),
    ])
    // Not 100% sure that these are all the statuses, so we'll map everything else to 'unknown'.
    .catch('unknown'),
})

const InstancesResponseSchema = z.object({
  items: z.array(InstanceSchema),
})

const ProfileResponseSchema = z.object({
  name: z.string(),
  email: z.string(),
  orgs: z.array(
    z.object({
      login: z.string(),
    })
  ),
})

export async function fetchStacks(
  token: string,
  signal?: AbortSignal
): Promise<Stack[]> {
  const profileResponse = await fetch(`${GRAFANA_API_URL}/oauth2/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  })

  if (!profileResponse.ok) {
    throw new Error("Couldn't fetch profile.")
  }

  const profile = ProfileResponseSchema.parse(await profileResponse.json())

  const orgIdIn = profile.orgs.map((org) => org.login).join(',')

  const instancesResponse = await fetch(
    `${GRAFANA_API_URL}/instances?orgSlugIn=${orgIdIn}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  )

  if (!instancesResponse.ok) {
    throw new Error("Couldn't fetch instances.")
  }

  const data: unknown = await instancesResponse.json()
  const parsed = InstancesResponseSchema.parse(data)

  return parsed.items.flatMap((instance) => {
    // Just ignore instances that we don't understand the state of.
    if (instance.status === 'unknown') {
      return []
    }

    return {
      id: instance.id,
      name: instance.name,
      url: instance.url,
      status: instance.status,
    }
  })
}
