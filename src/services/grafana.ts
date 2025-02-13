import { CloudProfile } from '@/schemas/profile'
import {
  Configuration,
  customFetch,
  initiateDeviceAuthorization,
  pollDeviceAuthorizationGrant,
  ServerMetadata,
  TokenEndpointResponse,
} from 'openid-client'
import { z } from 'zod'

const TokenResponseSchema = z.object({
  access_token: z.string(),
  info: z.object({
    email: z.string(),
  }),
  uid: z.number(),
})

// The device code flow is currently not documented in Grafana's openid-configuration,
// so we need to hard code the metadata here instead of using the discovery endpoint.
const metadata: ServerMetadata = {
  issuer: 'https://grafana-dev.com/api/openid',
  authorization_endpoint: 'https://grafana-dev.com/oauth2/authorize',
  token_endpoint: 'https://grafana-dev.com/api/oauth2/token',
  userinfo_endpoint: 'https://grafana-dev.com/api/openid/userinfo',
  device_authorization_endpoint:
    'https://grafana-dev.com/api/oauth2/device/codes',

  jwks_uri: 'https://grafana-dev.com/api/openid/keys',
  grant_types_supported: ['authorization_code'],
  response_types_supported: ['code'],
  subject_types_supported: ['public'],
  token_endpoint_auth_methods_supported: [
    'client_secret_basic',
    'client_secret_post',
  ],
  id_token_signing_alg_values_supported: ['RS256'],
  scopes_supported: ['openid', 'email', 'profile'],
  claims_supported: [
    'aud',
    'exp',
    'iat',
    'sub',
    'iss',
    'given_name',
    'family_name',
    'preferred_username',
    'email',
    'email_verified',
  ],
}

/**
 * The Grafana authorization flow has several issues. This function works
 * around these issues by modifying the response from the token endpoint.
 */
async function fetchAndPatch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  if (input === metadata.token_endpoint) {
    const response = await fetch(input, init)

    // In the case of a successful response, the endpoint returns
    // an empty refresh_token. This is not valid according to the
    // specification and it causes the openid-client library to
    // throw an error.
    if (response.status === 200) {
      const data = (await response.json()) as TokenEndpointResponse

      if (data.refresh_token === '') {
        // @ts-expect-error - The token is marked as readonly.
        delete data.refresh_token
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    }

    // The device code flow throws a 403 while polling for the token,
    // but it should return a 400 with `error` set to `authorization_pending`.
    // We parse the response and modify it to match the expected response.
    if (response.status === 403) {
      const data = (await response.json()) as { message: string }

      if (data.message !== 'Authorization pending') {
        return new Response(JSON.stringify(data), {
          status: 403,
          statusText: 'Forbidden',
          headers: response.headers,
        })
      }

      const body = {
        error: 'authorization_pending',
      }

      return new Response(JSON.stringify(body), {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          ...response.headers,
          'Content-Type': 'application/json',
        },
      })
    }

    return response
  }

  return fetch(input, init)
}

const __GRAFANA_CLIENT_ID__ = '79f2ccaf4550fb15f0f2'

export async function authenticate(
  signal: AbortSignal,
  onUserCode: (verificationUrl: string, code: string) => void
): Promise<[string, CloudProfile]> {
  const config = new Configuration(metadata, __GRAFANA_CLIENT_ID__)

  config[customFetch] = fetchAndPatch

  const initResponse = await initiateDeviceAuthorization(config, {
    scope: 'openid email profile',
  })

  onUserCode(
    initResponse.verification_uri_complete ?? initResponse.verification_uri,
    initResponse.user_code
  )

  const authResponse = await pollDeviceAuthorizationGrant(
    config,
    initResponse,
    {
      scope: 'openid email profile',
    },
    {
      signal,
    }
  )

  const parsedData = TokenResponseSchema.parse(authResponse)

  return [
    parsedData.access_token,
    {
      type: 'cloud',
      username: parsedData.info.email,
    },
  ]
}
