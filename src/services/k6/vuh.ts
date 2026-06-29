import { z } from 'zod'

import { HttpError } from '@/utils/errors'
import { K6TestOptions } from '@/utils/k6/schema'

import { CloudCredentials, CloudRequest } from './types'
import { getHeaders, parse, url } from './utils'

const VuhBreakdownSchema = z.object({
  // VU-hours before the cloud volume reduction is applied.
  base_total_vuh: z.number().nullish(),
  protocol_vuh: z.number().nullish(),
  browser_vuh: z.number().nullish(),
})

export const ValidateOptionsResponseSchema = z.object({
  vuh_usage: z.number(),
  breakdown: VuhBreakdownSchema.nullish(),
})

export type ValidateOptionsResponse = z.infer<
  typeof ValidateOptionsResponseSchema
>

const ProjectLimitErrorSchema = z.object({
  error: z.object({ message: z.string(), code: z.string() }),
})

/**
 * Returns the human-readable message from a `validate_options` error body when
 * it is a project quota/limit rejection (e.g. too many VUs or too long a run),
 * or null for any other error shape.
 */
export function parseProjectLimitError(body: unknown): string | null {
  const parsed = ProjectLimitErrorSchema.safeParse(body)

  if (parsed.success && parsed.data.error.code === 'validation_error') {
    return parsed.data.error.message
  }

  return null
}

export type ValidateOptionsResult =
  | { type: 'ok'; data: ValidateOptionsResponse }
  | { type: 'limit-exceeded'; message: string }

/**
 * Asks Grafana Cloud to estimate the VU-hours a test will consume from its k6
 * options - the same `validate_options` endpoint the k6 Cloud app uses. The
 * returned `vuh_usage` already has the cloud volume reduction applied;
 * `breakdown.base_total_vuh` is the raw figure before reduction.
 */
export class VuhClient {
  #credentials: CloudCredentials

  constructor(credentials: CloudCredentials) {
    this.#credentials = credentials
  }

  async validateOptions(
    projectId: number,
    options: K6TestOptions,
    { signal }: CloudRequest = {}
  ): Promise<ValidateOptionsResult> {
    const response = await fetch(url(`/validate_options`), {
      method: 'POST',
      headers: {
        ...getHeaders(this.#credentials),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: projectId,
        options,
        k6_dependencies: {},
        k6_version: null,
      }),
      signal,
    })

    if (response.ok) {
      return {
        type: 'ok',
        data: await parse(response, ValidateOptionsResponseSchema),
      }
    }

    // A project quota/limit rejection is expected user input, not a failure:
    // surface its message so the step can tell the user what to lower.
    const limitMessage = parseProjectLimitError(
      await response.json().catch(() => null)
    )

    if (limitMessage !== null) {
      return { type: 'limit-exceeded', message: limitMessage }
    }

    throw new HttpError('Failed to estimate VU-hours.', response)
  }
}
