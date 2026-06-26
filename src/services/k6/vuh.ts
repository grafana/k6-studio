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
  ): Promise<ValidateOptionsResponse> {
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

    if (!response.ok) {
      throw new HttpError('Failed to estimate VU-hours.', response)
    }

    return parse(response, ValidateOptionsResponseSchema)
  }
}
