import { z } from 'zod'

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

export async function fetchInstances(token: string, signal?: AbortSignal) {
  const profileResponse = await fetch(
    'https://grafana-dev.com/api/oauth2/user',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  )

  if (!profileResponse.ok) {
    throw new Error("Couldn't fetch profile.")
  }

  const profile = (await profileResponse.json()) as unknown

  const p = ProfileResponseSchema.parse(profile)

  const orgIdIn = p.orgs.map((org) => org.login).join(',')

  const stacksResponse = await fetch(
    `https://grafana-dev.com/api/instances?orgSlugIn=${orgIdIn}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  )

  if (!stacksResponse.ok) {
    throw new Error("Couldn't fetch instances.")
  }

  const data = (await stacksResponse.json()) as unknown

  return InstancesResponseSchema.parse(data)
}
